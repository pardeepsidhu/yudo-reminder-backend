import { Router } from "express";
import { sendOtp, verifyOtp ,login} from "../contollers/user.controler.js";
const router=Router();



router.get("/",(req,res)=>{
    console.log({response :"hello world from user route"});
    
})
router.post("/sendotp",sendOtp);
router.post("/verifyotp",verifyOtp)
router.post("/login",login)


export default router;