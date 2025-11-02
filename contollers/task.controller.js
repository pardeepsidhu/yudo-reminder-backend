import Task from "../models/task.model.js"; // Assuming you created task.model.js
import mongoose from 'mongoose'


const createTask = async (req, res) => {
  try {
    const { title, description, status, estimatedTime, time, priority } = req.body;
    const user = req.user._id;

    if (!title || !description ) {
      return res.status(400).send({ error: "Please provide all required fields!" });
    }

    const task = new Task({
      user,
      title,
      description,
      status: status || 'pending',
      estimatedTime,
      time,
      priority: priority || 'normal',
    });

    await task.save();
    res.status(201).send({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send({ error: "Failed to create task" });
  }
};

const getTasks = async (req, res) => {
  try {
    const user = req.user._id;
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip) || 0;
    const priority = req.query.priority;
    const startDate = req.query.startDate; // Expected format: ISO string or Date
    const endDate = req.query.endDate;     // Expected format: ISO string or Date
    
    // Build the base query
    const query = { user };
    
    // If a valid priority is provided, add it to the query
    if (priority && ['high', 'normal', 'low'].includes(priority)) {
      query.priority = priority;
    }
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        // Filter tasks created on or after startDate
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        // Filter tasks created on or before endDate (end of day)
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999); // Set to end of day
        query.createdAt.$lte = endOfDay;
      }
    }
    
    let tasks;
    // Execute the query with pagination
    if (limit) {
      tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip);
    }
    
    // Get total count for pagination
    const total = await Task.countDocuments(query);
    
    // Return the response in the format expected by the frontend
    res.json({ 
      tasks, 
      total,
      hasMore: total > (skip + tasks.length)
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ 
      error: "Failed to fetch tasks",
      message: error.message 
    });
  }
};


  
// Get Task By ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).send({ error: "Task not found!" });
    }

    res.send(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).send({ error: "Failed to fetch task" });
  }
};

// Get Tasks By Priority


// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true }
    );

    if (!task) {
      return res.status(404).send({ error: "Task not found or not authorized" });
    }

    res.send({ message: "Task updated", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send({ error: "Failed to update task" });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).send({ error: "Task not found or not authorized" });
    }

    res.send({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send({ error: "Failed to delete task" });
  }
};

const getTasksByTimeframe = async (req, res) => {
  try {
    const user = req.user._id;
    const timeframe = req.params.timeframe; 
    
    // Pagination parameters
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Get explicitly specified start and end dates from query parameters
    let startDate, endDate;
    let query = { user };
    
    // Check if both startDate and endDate are provided
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      // Set time to beginning of startDate and end of endDate
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Ensure endDate is not before startDate
      if (endDate < startDate) {
        return res.status(400).json({ error: "End date cannot be before start date" });
      }
      
      // Add date filter to query
      query.$or = [
        // Tasks created within this timeframe
        { createdAt: { $gte: startDate, $lte: endDate } },
        // Tasks with time entries that overlap with this timeframe
        { 
          'time.stated': { $lte: endDate },
          'time.ended': { $gte: startDate }
        }
      ];
    } else if (timeframe === 'week' || timeframe === 'month') {
      // If dates are not explicitly provided, fallback to current period
      const today = new Date();
      
      if (timeframe === 'week') {
        // Calculate start of current week (Monday)
        const day = today.getDay();
        startDate = new Date(today);
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        
        // End date is Sunday
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (timeframe === 'month') {
        // Start of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        
        // End of current month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }
      
      // Add date filter to query
      query.$or = [
        // Tasks created within this timeframe
        { createdAt: { $gte: startDate, $lte: endDate } },
        // Tasks with time entries that overlap with this timeframe
        { 
          'time.stated': { $lte: endDate },
          'time.ended': { $gte: startDate }
        }
      ];
    } else if (timeframe === 'all' || !timeframe) {
      // If timeframe is 'all' or not provided, get all tasks (no date filter)
      // query remains as { user } only
      startDate = null;
      endDate = null;
    } else {
      return res.status(400).json({ 
        error: "Invalid timeframe. Use 'week', 'month', or 'all'" 
      });
    }
    
    // Get total count for the query (before pagination)
    const total = await Task.countDocuments(query);
    
    // Query for tasks with pagination
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate task statistics (for the filtered results, not paginated)
    const allFilteredTasks = await Task.find(query).select('status priority');
    
    const taskStats = {
      total: total,
      pending: allFilteredTasks.filter(task => task.status === 'pending').length,
      todo: allFilteredTasks.filter(task => task.status === 'to do').length,
      inProgress: allFilteredTasks.filter(task => task.status === 'in progress').length,
      done: allFilteredTasks.filter(task => task.status === 'done').length,
      byPriority: {
        high: allFilteredTasks.filter(task => task.priority === 'high').length,
        normal: allFilteredTasks.filter(task => task.priority === 'normal').length,
        low: allFilteredTasks.filter(task => task.priority === 'low').length
      }
    };
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    
    res.json({
      timeframe: timeframe || 'all',
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
        count: tasks.length
      }
    });
  } catch (error) {
    console.error(`Error fetching tasks for time period:`, error);
    res.status(500).json({
      error: `Failed to fetch tasks for the specified time period`,
      message: error.message
    });
  }
};

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByTimeframe
};
