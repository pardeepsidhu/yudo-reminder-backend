import { Router } from "express";
import Email from "../models/emial.model.js"
import { deleteSchedule, getAll, getOne, scheduleEmail } from "../contollers/email.contoller.js";
import autherntication from "../middleware/authentication.js"
import { generete } from "../contollers/Ai.controller.js";
// import auth from "../middleware/authentication.js";
const router = Router();


router.get("/",autherntication,(req,res)=>{
    res.send("hello wrold from email route")
})

router.post("/schedule",autherntication,scheduleEmail);
router.delete("/delete/:jobId",deleteSchedule);
router.get("/getall/:limit",autherntication,getAll);
router.get("/getone/:id",autherntication,getOne)
router.post("/generate",generete)

export default router;