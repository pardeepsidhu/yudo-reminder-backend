import express from "express";
import auth from "../middleware/authentication";
import {
  createRoutine,
  getRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
  addRoutineTask,
  getRoutineTasks,
  removeRoutineTask,
  addRoutineReminder,
  getRoutineReminders,
  removeRoutineReminder,
} from "../controllers/routine.controller";

const router = express.Router();

// Routine CRUD
router.post("/", auth, createRoutine);
router.get("/", auth, getRoutines);
router.get("/:id", auth, getRoutineById);
router.put("/:id", auth, updateRoutine);
router.delete("/:id", auth, deleteRoutine);

// Routine <-> Task links (attach/list/remove by routine id)
router.post("/tasks", auth, addRoutineTask);
router.get("/:routineId/tasks", auth, getRoutineTasks);
router.delete("/tasks/:id", auth, removeRoutineTask);

// Routine <-> Reminder (Email) links (attach/list/remove by routine id)
router.post("/reminders", auth, addRoutineReminder);
router.get("/:routineId/reminders", auth, getRoutineReminders);
router.delete("/reminders/:id", auth, removeRoutineReminder);

export default router;