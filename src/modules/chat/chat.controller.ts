import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from './chat.model.js';
import { Message } from './message.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { getIO } from '../../config/socket.js';

export class ChatController {
  
  /**
   * Get or create a conversation with a specific user
   */
  static getOrCreateConversation = asyncHandler(async (req: Request, res: Response) => {
    const { id: currentUserId } = req.user as any;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      throw new ApiError({ status: 400, message: 'Target user ID is required' });
    }

    if (currentUserId === targetUserId) {
      throw new ApiError({ status: 400, message: 'Cannot chat with yourself' });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] }
    }).populate('participants', 'name email isBreak status');

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, targetUserId]
      });
      await conversation.save();
      await conversation.populate('participants', 'name email isBreak status');
    }

    return new ApiResponse({
      res,
      status: 200,
      data: conversation,
      message: 'Conversation fetched successfully'
    });
  });

  /**
   * List all conversations for the logged in user
   */
  static getConversations = asyncHandler(async (req: Request, res: Response) => {
    const { id: currentUserId } = req.user as any;

    const conversations = await Conversation.find({
      participants: currentUserId
    })
    .populate('participants', 'name email isBreak status')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    return new ApiResponse({
      res,
      status: 200,
      data: conversations,
      message: 'Conversations fetched successfully'
    });
  });

  /**
   * Send a message to a conversation
   */
  static sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id: currentUserId } = req.user as any;
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      throw new ApiError({ status: 400, message: 'Conversation ID and content are required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(currentUserId)) {
      throw new ApiError({ status: 403, message: 'Invalid conversation or access denied' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: currentUserId,
      content,
      readBy: [currentUserId]
    });

    await message.save();

    // Update last message in conversation and increment unread counts
    conversation.lastMessage = message._id as mongoose.Types.ObjectId;
    
    conversation.participants.forEach(participantId => {
      const pidStr = participantId.toString();
      if (pidStr !== currentUserId.toString()) {
        const currentCount = conversation.unreadCounts.get(pidStr) || 0;
        conversation.unreadCounts.set(pidStr, currentCount + 1);
        
        // Emit socket event to the participant's room
        try {
          getIO().to(pidStr).emit('newMessage', {
            conversationId,
            message
          });
        } catch (error) {
          console.error('Socket emission failed', error);
        }
      }
    });

    await conversation.save();

    return new ApiResponse({
      res,
      status: 201,
      data: message,
      message: 'Message sent successfully'
    });
  });

  /**
   * Get messages (timeline) for a conversation with pagination
   */
  static getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { id: currentUserId } = req.user as any;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(currentUserId)) {
      throw new ApiError({ status: 403, message: 'Invalid conversation or access denied' });
    }

    // Efficiently fetch messages sorted by newest first
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name email');

    return new ApiResponse({
      res,
      status: 200,
      data: messages.reverse(), // Send in chronological order
      message: 'Messages fetched successfully'
    });
  });

  /**
   * Mark all messages in a conversation as read for the user
   */
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id: currentUserId } = req.user as any;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(currentUserId)) {
      throw new ApiError({ status: 403, message: 'Invalid conversation or access denied' });
    }

    // Reset unread count for the user
    conversation.unreadCounts.set(currentUserId.toString(), 0);
    await conversation.save();

    // Mark all unread messages in this conversation as read
    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: currentUserId } },
      { $push: { readBy: currentUserId } }
    );

    return new ApiResponse({
      res,
      status: 200,
      message: 'Messages marked as read'
    });
  });
}
