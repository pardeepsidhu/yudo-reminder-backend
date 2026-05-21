import Notification from "../models/notification.model";

export const createNotification = async (notificationData: any) => {
  try {
    // Validate required fields
    if (
      !notificationData.title ||
      !notificationData.type ||
      !notificationData.description ||
      !notificationData.user
    ) {
      return;
    }

    const notification = await Notification.create({
      title: notificationData.title,
      type: notificationData.type,
      description: notificationData.description,
      user: notificationData.user,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getNotification = async (req: any, res: any) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user._id;

    // Optional query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Create base filter with user ID
    const filter: any = { user: userId };

    // Add optional type filter if provided in query
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Find notifications for this user with pagination
    const { count, rows } = await Notification.findAndCountAll({
      where: filter,
      order: [["createdAt", "DESC"]],
      offset: skip,
      limit: limit,
    });

    res.json({
      success: true,
      count: rows.length,
      total: count,
      page: page,
      pages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      error: "some error accured while fetching notifcations",
    });
  }
};