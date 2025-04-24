import { Router } from "express";
import { sendOtp, verifyOtp ,login, getProfile, updateProfile,  resetPasswordLink, resetPassword, quickLoginLink, quickLogin} from "../contollers/user.controler.js";
import auth from "../middleware/authentication.js";
import { telegramUpadate } from "../contollers/telegram.controller.js";
const router=Router();



router.get("/",(req,res)=>{
    console.log({response :"hello world from user route"});
    
})
router.get('/get',auth,getProfile)
router.post("/sendotp",sendOtp);
router.post("/verifyotp",verifyOtp)
router.post("/login",login)
router.put('/telegram',auth,telegramUpadate)
router.put("/update",auth,updateProfile)
router.get("/resetPass",auth,resetPasswordLink)
router.post("/reset",resetPassword)
router.post("/sendquickLogin",quickLoginLink)
router.get("/quickLogin",quickLogin)


export default router;