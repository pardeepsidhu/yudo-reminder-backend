import { Router } from "express";
import Email from "../models/emial.model.js";
import { 
  deleteSchedule, 
  getAll, 
  getOne, 
  scheduleEmail, 
  updateSchedule 
} from "../contollers/email.contoller.js";
import autherntication from "../middleware/authentication.js";
import { generete } from "../contollers/Ai.controller.js";

const router = Router();

router.get("/", autherntication, (req, res) => {
  res.send("hello world from email route");
});

// Schedule routes
router.post("/schedule", autherntication, scheduleEmail);
router.put("/update/:id", autherntication, updateSchedule);
router.delete("/delete/:jobId", autherntication, deleteSchedule);

// Get routes
router.get("/getall", autherntication, getAll);
router.get("/getone/:id", autherntication, getOne);

// AI generation route
router.post("/generate", generete);

export default router;