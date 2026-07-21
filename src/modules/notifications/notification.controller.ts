import { Request, Response } from 'express';
import { Notification } from './notification.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export class NotificationController {
  
  // Get all notifications for the logged-in user
  static getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const isReadParam = req.query.isRead;

    const query: any = { recipient: userId };
    
    // Optional filter by read status
    if (isReadParam === 'true') query.isRead = true;
    if (isReadParam === 'false') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { 
        docs: notifications, 
        unreadCount,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } 
      }, 
      message: 'Notifications fetched successfully' 
    });
  });

  // Mark a specific notification as read
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { id: userId } = req.user as any;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError({ status: 404, message: 'Notification not found' });
    }

    return new ApiResponse({ res, status: 200, data: notification, message: 'Notification marked as read' });
  });

  // Mark all notifications as read for the logged-in user
  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = req.user as any;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    return new ApiResponse({ res, status: 200, message: 'All notifications marked as read' });
  });

  // Utility method to create a notification (to be called internally by other services)
  static async createNotification(payload: {
    recipient: string;
    title: string;
    message: string;
    type?: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
    referenceId?: string;
    referenceModel?: string;
  }) {
    try {
      const notification = await Notification.create(payload);
      // NOTE: Here you could also emit a Socket.io event if you want real-time notifications
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }
}
