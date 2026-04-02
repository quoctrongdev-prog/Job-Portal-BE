import axios from "axios";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { forgotPasswordTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../index.js";
dotenv.config();
export const registerUser = TryCatch(async (req, res, next) => {
    // console.log("REGISTER HIT");
    const { name, email, password, phoneNumber, role, bio } = req.body;
    if (!name || !email || !password || !phoneNumber || !role) {
        // return res.status(400).json({
        //     message:"Please give all details"
        // })
        //Cách nhanh hơn vì có errorHandler đã custom sẵn
        throw new ErrorHandler(400, "Please give all details");
    }
    const existingUsers = await sql `SELECT user_id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
        throw new ErrorHandler(409, "User with this email already exists");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    let registeredUser;
    if (role === "recruiter") {
        const [user] = await sql `INSERT INTO users (name, email, password, phone_number, role) VALUES
                  (${name},${email},${hashPassword},${phoneNumber},${role}) RETURNING
                  user_id, name, email, phone_number, role, created_at`;
        registeredUser = user;
    }
    else if (role === "jobseeker") {
        //route se co upload file cua multer
        //nen req.file se chua thong tin file duoc upload len
        const file = req.file;
        if (!file) {
            throw new ErrorHandler(400, "Resume file is required for jobseekers");
        }
        //Bộ đệm tệp tin
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || !fileBuffer.content) {
            throw new ErrorHandler(500, "Failed to generate buffer");
        }
        console.log("UPLOAD:", process.env.UPLOAD_SERVICE);
        const { data } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, { buffer: fileBuffer.content });
        const [user] = await sql `INSERT INTO users (name, email, password, phone_number, role, bio,
        resume, resume_public_id) VALUES
                  (${name},${email},${hashPassword},${phoneNumber},${role}, ${bio},
                  ${data.url}, ${data.public_id}) RETURNING
                  user_id, name, email, phone_number, role, bio, resume, created_at`;
        registeredUser = user;
    }
    const token = jwt.sign({ id: registeredUser?.user_id }, process.env.JWT_SEC, { expiresIn: "15d" });
    res.json({
        message: "User Registered",
        registeredUser,
        token,
    });
});
export const loginUser = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ErrorHandler(400, "Please provide email and password");
    }
    const user = await sql `
    SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.
    resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT
    NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    WHERE u.email = ${email} GROUP BY u.user_id;
    `;
    if (user.length === 0) {
        throw new ErrorHandler(400, "Invalid credentials");
    }
    const userObject = user[0];
    const matchPassword = await bcrypt.compare(password, userObject.password);
    if (!matchPassword) {
        throw new ErrorHandler(400, "Incorrect password");
    }
    userObject.skills = userObject.skills || [];
    delete userObject.password;
    const token = jwt.sign({ id: userObject?.user_id }, process.env.JWT_SEC, { expiresIn: "15d" });
    res.json({
        message: "User Logged In",
        userObject,
        token,
    });
});
//Gui link quen mat khau
export const forgotPassword = TryCatch(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw new ErrorHandler(400, "Email is required");
    }
    const users = await sql `SELECT user_id, email FROM users WHERE email = ${email}`;
    if (users.length === 0) {
        return res.json({
            message: "If that email exists, we have sent a reset link",
        });
    }
    const user = users[0];
    const resetToken = jwt.sign({
        email: user.email,
        type: "reset"
    }, process.env.JWT_SEC, { expiresIn: "15m" });
    const resetLink = `${process.env.Frontend_Url}/reset/${resetToken}`;
    await redisClient.set(`forgot:${email}`, resetToken, {
        EX: 900, //15 phút
    });
    const message = {
        to: email,
        subject: "Reset Your Password - HireHeaven",
        html: forgotPasswordTemplate(resetLink),
    };
    publishToTopic("send-mail", message).catch((err) => {
        console.error("failed to send message", err);
    });
    res.json({
        message: "If that email exists, we have sent a reset link",
    });
});
//Ham tao lai mat khau
export const resetPassword = TryCatch(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SEC);
    }
    catch (error) {
        throw new ErrorHandler(400, "Expired token");
    }
    if (decoded.type !== "reset") {
        throw new ErrorHandler(400, "Invalid token type");
    }
    const email = decoded.email;
    const storedToken = await redisClient.get(`forgot:${email}`);
    if (!storedToken || storedToken !== token) {
        throw new ErrorHandler(400, "Token has been expired");
    }
    const users = await sql `SELECT user_id FROM users WHERE email = ${email}`;
    if (users.length === 0) {
        throw new ErrorHandler(404, "User not found");
    }
    const user = users[0];
    const hashPassword = await bcrypt.hash(password, 10);
    await sql `UPDATE users SET password = ${hashPassword} WHERE user_id = ${user.user_id}`;
    await redisClient.del(`forgot:${email}`);
    res.json({ message: "Password changed successfully" });
});
