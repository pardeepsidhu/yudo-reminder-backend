import { Router } from "express";
import { 
  deleteSchedule, 
  getAll, 
  getEmailsByDateRange, 
  getOne, 
  scheduleEmail, 
  updateSchedule 
} from "../controllers/email.controller";
import autherntication from "../middleware/authentication";
import { generete } from "../controllers/Ai.controller";

const router = Router();

router.get("/", autherntication, (req, res) => {
  res.send("hello world from email route");
});
router.get("/date-range", autherntication, getEmailsByDateRange);
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