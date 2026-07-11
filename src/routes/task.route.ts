import { Router } from "express";
import authentication from "../middleware/authentication";
import {
  createTask,
  getTaskById,
  getTasks,        
  updateTask,
  deleteTask,
  getTasksByTimeframe,
  getTasksByDateRange
} from "../controllers/task.controller";


const router = Router();


router.post("/", authentication, createTask);
router.get("/", authentication, getTasks); 
router.get("/date-range", authentication, getTasksByDateRange); 
router.get("/:id", authentication, getTaskById);
router.put("/:id", authentication, updateTask);
router.delete("/:id", authentication, deleteTask);
router.get("/timeframe/:timeframe",authentication,getTasksByTimeframe)


export default router;
