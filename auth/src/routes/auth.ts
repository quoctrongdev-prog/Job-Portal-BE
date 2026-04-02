import express from 'express';
import { forgotPassword, loginUser, registerUser, resetPassword } from '../controllers/auth.js';
import uploadFile from '../middleware/multer.js';


const router = express.Router();

router.post("/register", uploadFile, registerUser);
router.post("/login", loginUser);
//route cho quên mật khẩu, người dùng sẽ nhập email và 
//hệ thống sẽ gửi link reset về email đó
router.post("/forgot", forgotPassword);
//route reset mat khau moi 
//co token nen su dung redis giup nhanh hon
//va do rac db hon (redis tot cho viec luu tru tam thoi va co expire)
router.post("/reset/:token", resetPassword)


// router.post("/register", (req,res)=>{
//   console.log("POST REGISTER HIT");
//   res.json({message:"ok"});
// });


export default router;