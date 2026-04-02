import axios from "axios";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/tryCatch.js";
// interface UpdateUser {
//     user_id: number;
//     name: string;
//     profile_pic: string;
// }
// interface UploadResult {
//     url: string;
//     public_id: UpdateUser;
// }
//Lấy thông tin profile của chính người dùng đang đăng nhập
//Du lieu la User 
export const myProfile = TryCatch(async (req, res, next) => {
    //req.user la du lieu user da authenticated 
    //va da dang nhap vao
    const user = req.user;
    res.json(user);
});
//Lấy thông tin profile của người dùng khác
export const getUserProfile = TryCatch(async (req, res, next) => {
    console.log(req.params);
    //lay tu url nen phai destructuring tu url params
    const { userId } = req.params;
    const users = await sql `
            SELECT u.user_id, u.name, u.email, u.phone_number, u.role, u.bio, u.resume, 
            u.resume_public_id, u.profile_pic, u.profile_pic_public_id, u.subscription, 
            ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills
            FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
            LEFT JOIN skills s ON us.skill_id = s.skill_id
            WHERE u.user_id = ${userId}
            GROUP BY u.user_id;
            `;
    if (users.length === 0) {
        throw new ErrorHandler(404, "User not found");
    }
    const user = users[0];
    user.skills = user.skills || []; // Đảm bảo skills luôn là một mảng, ngay cả khi không có kỹ năng nào
    res.json(user);
});
//update thong tin user
export const updateUserProfile = TryCatch(async (req, res, next) => {
    //thong tin tu user da dang nhap va authenciated
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    const { name, phoneNumber, bio } = req.body;
    const newName = name || user.name;
    const newPhoneNumber = phoneNumber || user.phone_number;
    const newBio = bio || user.bio;
    //Vi SQL tra ve mang nen phai destructuring de lay phan tu dau tien,
    //va tra ve thong tin user da duoc cap nhat
    //const [updatedUser] = await sql tuong duong
    //const updatedUser = (await sql`...`)[0]; lay phan tu dau tien 
    //cua mang ket qua tra ve
    //Returning se tra ve thong tin user sau khi da duoc cap nhat, 
    //khong can phai truy van lai de lay thong tin moi
    //nen bien nay la update luon thong tin user moi sau khi da duoc cap nhat
    const [updatedUser] = await sql `
    UPDATE users SET name = ${newName}, phone_number = ${newPhoneNumber}, bio = ${newBio}
    WHERE user_id = ${user.user_id}
    RETURNING user_id, name, email, phone_number, bio
    `;
    res.json({
        message: "Profile Updated successfully",
        updatedUser,
    });
});
//update profile pic cua user
export const updateProfilePic = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    //req.file cua multer se chua thong tin file duoc upload len, 
    //nen co the truy cap de xu ly tiep
    const file = req.file;
    if (!file) {
        throw new ErrorHandler(400, "No image uploaded");
    }
    const oldPublicId = user.profile_pic_public_id;
    //Chuyen file anh thanh buffer de su dung trong viec upload len cloudinary
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        throw new ErrorHandler(500, "Failed to generate buffer");
    }
    const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, {
        buffer: fileBuffer.content,
        public_id: oldPublicId, //Truyen public_id cu neu co de xoa anh cu sau khi upload anh moi
    });
    const [updatedUser] = await sql `
        UPDATE users SET profile_pic = ${uploadResult.url}, profile_pic_public_id = ${uploadResult.
        public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, profile_pic;
        `;
    res.json({
        message: "Profile pic updated successfully",
        updatedUser,
    });
});
export const updateResume = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    //req.file cua multer se chua thong tin file duoc upload len, 
    //nen co the truy cap de xu ly tiep
    const file = req.file;
    if (!file) {
        throw new ErrorHandler(400, "No pdf uploaded");
    }
    const oldPublicId = user.resume_public_id;
    //Chuyen file anh thanh buffer de su dung trong viec upload len cloudinary
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        throw new ErrorHandler(500, "Failed to generate buffer");
    }
    const { data: uploadResult } = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, {
        buffer: fileBuffer.content,
        public_id: oldPublicId, //Truyen public_id cu neu co de xoa anh cu sau khi upload anh moi
    });
    const [updatedUser] = await sql `
        UPDATE users SET resume = ${uploadResult.url}, resume_public_id = ${uploadResult.
        public_id} WHERE user_id = ${user.user_id} RETURNING user_id, name, resume;
        `;
    res.json({
        message: "Resume updated successfully",
        updatedUser,
    });
});
export const addSkillToUser = TryCatch(async (req, res) => {
    const userId = req.user?.user_id;
    const { skillName } = req.body;
    //trim bo khoang trong o dau va cuoi chuoi, 
    //de tranh truong hop nguoi dung nhap chi la khoang trong
    if (!skillName || skillName.trim() === "") {
        throw new ErrorHandler(400, "Please provide a skill name");
    }
    let wasSkillAdded = false;
    try {
        await sql `BEGIN`;
        const users = await sql `SELECT user_id FROM users WHERE user_id = ${userId}`;
        if (users.length === 0) {
            throw new ErrorHandler(404, "User not found");
        }
        //destructuring lay phan tu dau
        const [skill] = //bo khoang trong o dau va cuoi chuoi, de tranh truong hop nguoi dung nhap chi la khoang trong
         await sql `INSERT INTO skills (name) VALUES (${skillName.trim()})
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING skill_id`;
        //khi nhap cung skill thi se khong tao moi ma se tra ve skill da ton tai
        //va bo qua viec chen moi tranh hai skill giong nhau cung xuat hien
        //ON CONFLICT -> dung name cu exp: React, JS, Java,...
        const skillId = skill.skill_id;
        const insertionResult = await sql `INSERT INTO user_skills (user_id, skill_id) VALUES (${userId}, ${skillId}) 
        ON CONFLICT (user_id, skill_id) DO NOTHING RETURNING user_id`;
        //ON CONFLICT DO NOTHING -> khong lam gi ca neu da co skill do trong user_skills, 
        //tranh viec chen trung lap cung mot skill cho mot user
        //Neu insertionResult co phan tu tra ve, tuc la da them skill moi cho user
        if (insertionResult.length > 0) {
            wasSkillAdded = true;
        }
        await sql `COMMIT`;
    }
    catch (error) {
        await sql `ROLLBACK`;
        throw error;
    }
    //Neu user da them skill do roi thi insertionResult se khong tra ve phan tu 
    //nao ca va wasSkillAdded se van la false
    //! se la true nen cho biet rang user nay da co skill do roi 
    //nen thong bao rang user da co skill nay roi.
    if (!wasSkillAdded) {
        return res.status(200).json({
            message: "User already has this skill",
        });
    }
    res.json({
        message: `Skill ${skillName.trim()} is added successfully!`,
    });
});
export const deleteSkillFromUser = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    const { skillName } = req.body;
    if (!skillName || skillName.trim() === "") {
        throw new ErrorHandler(400, "Please provide a skill name");
    }
    const result = await sql `DELETE FROM user_skills WHERE user_id = ${user.user_id} 
    AND skill_id = (SELECT skill_id FROM skills WHERE name = ${skillName.trim()})
    RETURNING user_id`;
    if (result.length === 0) {
        throw new ErrorHandler(404, `Skill ${skillName.trim()} was not found`);
    }
    res.json({
        message: `Skill ${skillName.trim()} was deleted successfully`,
    });
});
export const applyForJob = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ErrorHandler(401, "Authentication required");
    }
    if (user.role !== "jobseeker") {
        throw new ErrorHandler(403, "Forbidden you are not allowed for this api");
    }
    const applicant_id = user.user_id;
    const resume = user.resume;
    if (!resume) {
        throw new ErrorHandler(400, "You need to add resume in your profile to apply for this job");
    }
    const { job_id } = req.body;
    if (!job_id) {
        throw new ErrorHandler(400, "Job Id is required");
    }
    const [job] = await sql `SELECT is_active FROM jobs WHERE job_id = ${job_id}`;
    if (!job) {
        throw new ErrorHandler(404, "No jobs with this id");
    }
    if (!job.is_active) {
        throw new ErrorHandler(400, "Job is not active");
    }
    const now = Date.now();
    const subTime = req.user?.subscription ? new Date(req.user.subscription).getTime() : 0;
    const isSubscribed = subTime > now;
    let newApplication;
    try {
        [newApplication] = await sql `INSERT INTO applications (job_id, applicant_id,
        applicant_email, resume, subscribed) VALUES (${job_id}, ${applicant_id},
        ${user?.email}, ${resume}, ${isSubscribed})`;
    }
    catch (error) {
        //"23505" = unique_violation (vi phạm unique constraint)
        //UNIQUE (job_id, applicant_id)
        if (error.code === "23505") {
            throw new ErrorHandler(409, "you have already applied to this job.");
        }
        throw error;
    }
    res.json({
        message: "Applied for jod successfully!",
        application: newApplication,
    });
});
export const getAllaplications = TryCatch(async (req, res) => {
    const applications = await sql `
    SELECT a.*, j.title AS job_title, j.salary AS job_salary, j.location AS job_location
    FROM applications a JOIN jobs j ON a.job_id = j.job_id WHERE a.applicant_id = ${req.user?.user_id}
    `;
    res.json(applications);
});
