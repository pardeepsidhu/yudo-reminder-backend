import { Router } from "express";
import { sendOtp, verifyOtp ,login, getProfile, updateProfile} from "../contollers/user.controler.js";
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


export default router;