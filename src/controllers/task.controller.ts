import Task from "../models/task.model";
import { Op } from "sequelize";

const createTask = async (req: any, res: any) => {
  try {
    const { title, description, status, estimatedTime, time, priority } = req.body;
    console.log("reqee",req.user)
    const user = req.user.id;

    if (!title || !description) {
      return res.status(400).send({ error: "Please provide all required fields!" });
    }

    const task = await Task.create({
      user,
      title,
      description,
      status: status || "pending",
      estimatedTime,
      time,
      priority: priority || "normal",
    });

    res.status(201).send({ message: "Task created successfully", task });
  } catch (error: any) {
    console.error("Error creating task:", error);
    res.status(500).send({ error: "Failed to create task" });
  }
};

const getTasks = async (req: any, res: any) => {
  try {
    const user = req.user.id;
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip) || 0;
    const priority = req.query.priority;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query: any = { user };

    if (priority && ["high", "normal", "low"].includes(priority)) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt[Op.gte] = new Date(startDate);
      }

      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt[Op.lte] = endOfDay;
      }
    }

    let tasks;

    if (limit) {
      tasks = await Task.findAll({
        where: query,
        order: [["createdAt", "DESC"]],
        offset: skip,
        limit: limit,
      });
    } else {
      tasks = await Task.findAll({
        where: query,
        order: [["createdAt", "DESC"]],
        offset: skip,
      });
    }

    const total = await Task.count({ where: query });

    res.json({
      tasks,
      total,
      hasMore: total > (skip + tasks.length),
    });
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      error: "Failed to fetch tasks",
      message: error.message,
    });
  }
};

const getTaskById = async (req: any, res: any) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        user: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).send({ error: "Task not found!" });
    }

    res.send(task);
  } catch (error: any) {
    console.error("Error fetching task:", error);
    res.status(500).send({ error: "Failed to fetch task" });
  }
};

const updateTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOne({
      where: {
        id,
        user: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).send({ error: "Task not found or not authorized" });
    }

    await task.update(updates);

    res.send({ message: "Task updated", task });
  } catch (error: any) {
    console.error("Error updating task:", error);
    res.status(500).send({ error: "Failed to update task" });
  }
};

const deleteTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: {
        id,
        user: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).send({ error: "Task not found or not authorized" });
    }

    await task.destroy();

    res.send({ message: "Task deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting task:", error);
    res.status(500).send({ error: "Failed to delete task" });
  }
};

const getTasksByTimeframe = async (req: any, res: any) => {
  try {
    const user = req.user.id;
    const timeframe = req.params.timeframe;

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let startDate: Date | null, endDate: Date | null;
    const query: any = { user };

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (endDate < startDate) {
        return res.status(400).json({ error: "End date cannot be before start date" });
      }

      query[Op.or] = [
        {
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        {
          "time.stated": {
            [Op.lte]: endDate,
          },
          "time.ended": {
            [Op.gte]: startDate,
          },
        },
      ];
    } else if (timeframe === "week" || timeframe === "month") {
      const today = new Date();

      if (timeframe === "week") {
        const day = today.getDay();
        startDate = new Date(today);
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      query[Op.or] = [
        {
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        {
          "time.stated": {
            [Op.lte]: endDate,
          },
          "time.ended": {
            [Op.gte]: startDate,
          },
        },
      ];
    } else if (timeframe === "all" || !timeframe) {
      startDate = null;
      endDate = null;
    } else {
      return res.status(400).json({
        error: "Invalid timeframe. Use 'week', 'month', or 'all'",
      });
    }

    const total = await Task.count({ where: query });

    const tasks = await Task.findAll({
      where: query,
      order: [["createdAt", "DESC"]],
      offset: skip,
      limit: limit,
    });

    const allFilteredTasks = await Task.findAll({
      where: query,
      attributes: ["status", "priority"],
    });

    const taskStats = {
      total: total,
      pending: allFilteredTasks.filter((task: any) => task.status === "pending").length,
      todo: allFilteredTasks.filter((task: any) => task.status === "to do").length,
      inProgress: allFilteredTasks.filter((task: any) => task.status === "in progress").length,
      done: allFilteredTasks.filter((task: any) => task.status === "done").length,
      byPriority: {
        high: allFilteredTasks.filter((task: any) => task.priority === "high").length,
        normal: allFilteredTasks.filter((task: any) => task.priority === "normal").length,
        low: allFilteredTasks.filter((task: any) => task.priority === "low").length,
      },
    };

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.json({
      timeframe: timeframe || "all",
      startDate,
      endDate,
      tasks,
      stats: taskStats,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        total,
        hasMore,
        count: tasks.length,
      },
    });
  } catch (error: any) {
    console.error(`Error fetching tasks for time period:`, error);
    res.status(500).json({
      error: `Failed to fetch tasks for the specified time period`,
      message: error.message,
    });
  }
};

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByTimeframe,
};