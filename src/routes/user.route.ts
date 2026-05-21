import express from "express";
import { Router } from "express";
import { sendOtp, verifyOtp ,login, getProfile, updateProfile,  resetPasswordLink, resetPassword, quickLoginLink, quickLogin} from "../controllers/user.controller";
import auth from "../middleware/authentication";
import { telegramUpadate } from "../controllers/telegram.controller";
const router=Router();



router.get("/",(req,res)=>{
    res.send({response :"hello world from user route"});
    
})
router.get('/get',auth,getProfile)
router.post("/sendotp",sendOtp);
router.post("/verifyotp",verifyOtp)
router.post("/login",login)
router.put("/update",auth,updateProfile)
router.get("/resetPass",auth,resetPasswordLink)
router.post("/reset",resetPassword)
router.post("/sendquickLogin",quickLoginLink)
router.get("/quickLogin",quickLogin)
router.put('/telegram',auth,telegramUpadate)




export default router;