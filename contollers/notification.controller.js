import { Notification } from "../models/notification.model.js";

export const createNotification = async (notificationData) => {
    try {
      // Validate required fields
      if (!notificationData.title || !notificationData.type || !notificationData.description || !notificationData.user) {
        return;
      }
  
      const notification = new Notification({
        title: notificationData.title,
        type: notificationData.type,
        description: notificationData.description,
        user: notificationData.user

      });
  
      // Save to database
      const savedNotification = await notification.save();
      return savedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };



 export const getNotification = async (req, res) => {
    try {
      // Get user ID from auth middleware
      const userId = req.user._id;
      
      // Optional query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Create base filter with user ID
      const filter = { user: userId };
      
      // Add optional type filter if provided in query
      if (req.query.type) {
        filter.type = req.query.type;
      }
      
      // Find notifications for this user with pagination
      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit);
      
      // Count total notifications for pagination info
      const total = await Notification.countDocuments(filter);
      
      res.json({
        success: true,
        count: notifications.length,
        total: total,
        page: page,
        pages: Math.ceil(total / limit),
        data: notifications
      });
      
    } catch (error) {
      
      res.status(500).json({ 
        error:"some error accured while fetching notifcations"
      });
    }
  }