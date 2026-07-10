import { Op } from "sequelize";
import Routine, { RoutineTask, RoutineReminder } from "../models/routine.model";
import Task from "../models/task.model";
import { Email } from "../models/email.model";

const allowedPriority = ["critical", "high", "medium", "low", "optional"];
const allowedRepeatType = ["once", "daily", "weekly", "monthly", "yearly", "custom"];
const allowedDateMode = ["single", "range", "until", "forever"];
const allowedRoutineStatus = ["active", "paused", "archived"];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

const parsePagination = (query: any) => {
  const limit = query.limit ? Math.max(1, parseInt(query.limit)) : 20;
  let skip = query.skip ? Math.max(0, parseInt(query.skip)) : 0;

  // Support page-based paging too — if `page` is given it takes priority
  // over a raw `skip` value (page is 1-indexed).
  if (query.page) {
    const page = Math.max(1, parseInt(query.page));
    skip = (page - 1) * limit;
  }

  return { limit, skip };
};

const validateRepeatConfig = (repeatType: string, repeatConfig: any) => {
  if (!repeatConfig) return null;

  if (repeatType === "weekly") {
    if (!Array.isArray(repeatConfig.days)) {
      return "repeatConfig.days must be an array of numbers (0-6) for weekly routines";
    }
  }

  if (repeatType === "monthly") {
    if (typeof repeatConfig.day !== "number") {
      return "repeatConfig.day must be a number for monthly routines";
    }
  }

  if (repeatType === "custom") {
    if (typeof repeatConfig.interval !== "number") {
      return "repeatConfig.interval must be a number for custom routines";
    }
    if (!["days", "weeks", "months"].includes(repeatConfig.unit)) {
      return "repeatConfig.unit must be one of days, weeks, months for custom routines";
    }
  }

  return null;
};

// ─────────────────────────────────────────────────────────
// Routine CRUD
// ─────────────────────────────────────────────────────────

const createRoutine = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      category,
      priority,
      color,
      icon,
      repeatType,
      repeatConfig,
      dateMode,
      startDate,
      endDate,
      skipDates,
      allDay,
      startTime,
      endTime,
      estimatedMinutes,
      location,
      notes,
      tags,
      status,
    } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ error: "title and startDate are required" });
    }

    if (priority && !allowedPriority.includes(priority)) {
      return res.status(400).json({ error: "Invalid priority value" });
    }

    if (repeatType && !allowedRepeatType.includes(repeatType)) {
      return res.status(400).json({ error: "Invalid repeatType value" });
    }

    if (dateMode && !allowedDateMode.includes(dateMode)) {
      return res.status(400).json({ error: "Invalid dateMode value" });
    }

    if (status && !allowedRoutineStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (skipDates !== undefined && !Array.isArray(skipDates)) {
      return res.status(400).json({ error: "skipDates must be an array" });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({ error: "tags must be an array" });
    }

    const repeatConfigError = validateRepeatConfig(repeatType || "once", repeatConfig);
    if (repeatConfigError) {
      return res.status(400).json({ error: repeatConfigError });
    }

    if ((allDay ?? false) === false && startTime && endTime && startTime > endTime) {
      return res.status(400).json({ error: "startTime cannot be greater than endTime" });
    }

    const routine = await Routine.create({
      userId,
      title,
      description,
      category,
      priority: priority || "medium",
      color,
      icon,
      repeatType: repeatType || "once",
      repeatConfig: repeatConfig || {},
      dateMode: dateMode || "single",
      startDate,
      endDate,
      skipDates: skipDates || [],
      allDay: allDay ?? false,
      startTime: allDay ? null : startTime,
      endTime: allDay ? null : endTime,
      estimatedMinutes,
      location,
      notes,
      tags: tags || [],
      status: status || "active",
    });

    return res.status(201).json({
      message: "Routine created successfully",
      routine,
    });
  } catch (error: any) {
    console.error("Error creating routine:", error);
    return res.status(500).json({ error: "Failed to create routine", message: error.message });
  }
};

// Infinite-scroll friendly list — pass `limit` + either `skip` or `page`.
const getRoutines = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { priority, status, repeatType, category, search, startDate, endDate } = req.query;
    const { limit, skip } = parsePagination(req.query);

    const where: any = { userId };

    if (priority && allowedPriority.includes(priority)) where.priority = priority;
    if (status && allowedRoutineStatus.includes(status)) where.status = status;
    if (repeatType && allowedRepeatType.includes(repeatType)) where.repeatType = repeatType;
    if (category) where.category = category;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate[Op.gte] = startDate;
      if (endDate) where.startDate[Op.lte] = endDate;
    }

   const routines = await Routine.findAll({
  where,
  include: [
    {
      model: Email,
      attributes: ["id", "to", "subject", "body", "scheduleTime", "jobId", "status", "createdAt"],
      through: {
        attributes: ["routineId", "emailId", "createdAt", "updatedAt"],
      },
    },
    {
          model: Task,
          attributes: ["id", "title", "description", "status", "estimatedTime", "time", "priority"],
          through: {
            attributes: ["routineId", "taskId"],
          },
        }
   
  ],
  order: [["createdAt", "DESC"]],
  offset: skip,
  limit,
  // distinct: true,
});

    const total = await Routine.count({ where });

    return res.status(200).json({
      routines,
      total,
      limit,
      skip,
      hasMore: skip + routines.length < total,
    });
  } catch (error: any) {
    console.error("Error fetching routines:", error);
    return res.status(500).json({ error: "Failed to fetch routines", message: error.message });
  }
};

const getRoutineById = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const routine = await Routine.findOne({
      where: { id, userId },
      include: [
        { model: RoutineTask, include: [Task] },
        { model: RoutineReminder, include: [Email] },
      ],
    });

    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }

    return res.status(200).json(routine);
  } catch (error: any) {
    console.error("Error fetching routine:", error);
    return res.status(500).json({ error: "Failed to fetch routine", message: error.message });
  }
};

const updateRoutine = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const routine = await Routine.findOne({ where: { id, userId } });
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }

    const {
      title,
      description,
      category,
      priority,
      color,
      icon,
      repeatType,
      repeatConfig,
      dateMode,
      startDate,
      endDate,
      skipDates,
      allDay,
      startTime,
      endTime,
      estimatedMinutes,
      location,
      notes,
      tags,
      status,
    } = req.body;

    if (priority && !allowedPriority.includes(priority)) {
      return res.status(400).json({ error: "Invalid priority value" });
    }

    if (repeatType && !allowedRepeatType.includes(repeatType)) {
      return res.status(400).json({ error: "Invalid repeatType value" });
    }

    if (dateMode && !allowedDateMode.includes(dateMode)) {
      return res.status(400).json({ error: "Invalid dateMode value" });
    }

    if (status && !allowedRoutineStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (skipDates !== undefined && !Array.isArray(skipDates)) {
      return res.status(400).json({ error: "skipDates must be an array" });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({ error: "tags must be an array" });
    }

    const nextRepeatType = repeatType ?? routine.get("repeatType");
    const nextRepeatConfig = repeatConfig ?? routine.get("repeatConfig");
    const repeatConfigError = validateRepeatConfig(nextRepeatType, nextRepeatConfig);
    if (repeatConfigError) {
      return res.status(400).json({ error: repeatConfigError });
    }

    const nextAllDay = allDay ?? routine.get("allDay");
    const nextStartTime = startTime ?? routine.get("startTime");
    const nextEndTime = endTime ?? routine.get("endTime");

    if (nextAllDay === false && nextStartTime && nextEndTime && nextStartTime > nextEndTime) {
      return res.status(400).json({ error: "startTime cannot be greater than endTime" });
    }

    await routine.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(priority !== undefined && { priority }),
      ...(color !== undefined && { color }),
      ...(icon !== undefined && { icon }),
      ...(repeatType !== undefined && { repeatType }),
      ...(repeatConfig !== undefined && { repeatConfig }),
      ...(dateMode !== undefined && { dateMode }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(skipDates !== undefined && { skipDates }),
      ...(allDay !== undefined && { allDay }),
      ...(startTime !== undefined && { startTime: nextAllDay ? null : startTime }),
      ...(endTime !== undefined && { endTime: nextAllDay ? null : endTime }),
      ...(estimatedMinutes !== undefined && { estimatedMinutes }),
      ...(location !== undefined && { location }),
      ...(notes !== undefined && { notes }),
      ...(tags !== undefined && { tags }),
      ...(status !== undefined && { status }),
    });

    if (allDay === true) {
      await routine.update({ startTime: null, endTime: null });
    }

    return res.status(200).json({
      message: "Routine updated successfully",
      routine,
    });
  } catch (error: any) {
    console.error("Error updating routine:", error);
    return res.status(500).json({ error: "Failed to update routine", message: error.message });
  }
};

const deleteRoutine = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const routine = await Routine.findOne({ where: { id, userId } });
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }

    // Clean up links before removing the routine itself.
    await RoutineTask.destroy({ where: { routineId: id } });
    await RoutineReminder.destroy({ where: { routineId: id } });
    await routine.destroy();

    return res.status(200).json({ message: "Routine deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting routine:", error);
    return res.status(500).json({ error: "Failed to delete routine", message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// RoutineTask — attach an existing Task to an existing Routine
// ─────────────────────────────────────────────────────────

const addRoutineTask = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { routineId, taskId } = req.body;

    if (!routineId || !taskId) {
      return res.status(400).json({ error: "routineId and taskId are required" });
    }

    const routine = await Routine.findOne({ where: { id: routineId, userId } });
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }

    const task = await Task.findOne({ where: { id: taskId, to: req.user.email } });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const existing = await RoutineTask.findOne({ where: { routineId, taskId } });
    if (existing) {
      return res.status(409).json({ error: "This task is already linked to this routine" });
    }

    const routineTask = await RoutineTask.create({ routineId, taskId });

    return res.status(201).json({
      message: "Task attached to routine successfully",
      routineTask,
    });
  } catch (error: any) {
    console.error("Error attaching task to routine:", error);
    return res.status(500).json({ error: "Failed to attach task to routine", message: error.message });
  }
};

// Infinite-scroll friendly list of tasks attached to a routine.
const getRoutineTasks = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { routineId } = req.params;
    const { limit, skip } = parsePagination(req.query);

    const routine = await Routine.findOne({ where: { id: routineId, userId } });
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }

    const routineTasks = await RoutineTask.findAll({
      where: { routineId },
      include: [Task],
      order: [["createdAt", "ASC"]],
      offset: skip,
      limit,
    });

    const total = await RoutineTask.count({ where: { routineId } });

    return res.status(200).json({
      tasks: routineTasks,
      total,
      limit,
      skip,
      hasMore: skip + routineTasks.length < total,
    });
  } catch (error: any) {
    console.error("Error fetching routine tasks:", error);
    return res.status(500).json({ error: "Failed to fetch routine tasks", message: error.message });
  }
};

const removeRoutineTask = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // RoutineTask row id

    const routineTask = await RoutineTask.findOne({
      where: { id },
      include: [{ model: Routine, where: { userId } }],
    });

    if (!routineTask) {
      return res.status(404).json({ error: "Routine task link not found" });
    }

    await routineTask.destroy();

    return res.status(200).json({ message: "Task removed from routine successfully" });
  } catch (error: any) {
    console.error("Error removing routine task:", error);
    return res.status(500).json({ error: "Failed to remove routine task", message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// RoutineReminder — attach an existing Email (reminder) to an existing Routine
// ─────────────────────────────────────────────────────────

const addRoutineReminder = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { routineId, emailId } = req.body;

    if (!routineId || !emailId) {
      return res.status(400).json({ error: "routineId and emailId are required" });
    }

    const routine = await Routine.findOne({ where: { id: routineId, userId } });
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }

    // Note: the Email model currently has no owner field, so we can only
    // confirm the email exists — not that it belongs to this user.
    const email = await Email.findOne({ where: { id: emailId } });
    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    const existing = await RoutineReminder.findOne({ where: { routineId, emailId } });
    if (existing) {
      return res.status(409).json({ error: "This email is already linked to this routine" });
    }

    const routineReminder = await RoutineReminder.create({ routineId, emailId });

    return res.status(201).json({
      message: "Reminder attached to routine successfully",
      routineReminder,
    });
  } catch (error: any) {
    console.error("Error attaching reminder to routine:", error);
    return res.status(500).json({ error: "Failed to attach reminder to routine", message: error.message });
  }
};

// Infinite-scroll friendly list of reminders attached to a routine.
const getRoutineReminders = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { routineId } = req.params;
    const { limit, skip } = parsePagination(req.query);

    const routine = await Routine.findOne({ where: { id: routineId, userId } });
    if (!routine) {
      return res.status(404).json({ error: "Routine not found" });
    }

    const routineReminders = await RoutineReminder.findAll({
      where: { routineId },
      include: [Email],
      order: [["createdAt", "ASC"]],
      offset: skip,
      limit,
    });

    const total = await RoutineReminder.count({ where: { routineId } });

    return res.status(200).json({
      reminders: routineReminders,
      total,
      limit,
      skip,
      hasMore: skip + routineReminders.length < total,
    });
  } catch (error: any) {
    console.error("Error fetching routine reminders:", error);
    return res.status(500).json({ error: "Failed to fetch routine reminders", message: error.message });
  }
};

const removeRoutineReminder = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // RoutineReminder row id

    const routineReminder = await RoutineReminder.findOne({
      where: { id },
      include: [{ model: Routine, where: { userId } }],
    });

    if (!routineReminder) {
      return res.status(404).json({ error: "Routine reminder link not found" });
    }

    await routineReminder.destroy();

    return res.status(200).json({ message: "Reminder removed from routine successfully" });
  } catch (error: any) {
    console.error("Error removing routine reminder:", error);
    return res.status(500).json({ error: "Failed to remove routine reminder", message: error.message });
  }
};

export {
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
};