import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from './chat.model.js';
import { Message } from './message.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { getIO } from '../../config/socket.js';
import { StorageService } from '../../libs/storage.lib.js';
import { User } from '../users/user.model.js';
import { buildPagination } from '../../utils/helpers.js';

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

    const populateConfig = {
      path: 'participants',
      select: 'name email isBreak status role',
      populate: { path: 'role' }
    };

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] }
    }).populate(populateConfig);

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, targetUserId]
      });
      await conversation.save();
      await conversation.populate(populateConfig);
    }

    return new ApiResponse({
      res,
      status: 200,
      data: conversation,
      message: 'Conversation fetched successfully'
    });
  });

  /**
   * List all conversations for the logged in user with pagination
   */
  static getConversations = asyncHandler(async (req: Request, res: Response) => {
    const { id: currentUserId } = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const totalConversations = await Conversation.countDocuments({ participants: currentUserId });

    // We need existingParticipantIds to know how many "other users" exist
    const allConversations = await Conversation.find({ participants: currentUserId }).select('participants');
    const existingParticipantIds = new Set<string>();
    allConversations.forEach((conv: any) => {
      conv.participants.forEach((p: any) => {
        if (p && p.toString() !== currentUserId.toString()) {
          existingParticipantIds.add(p.toString());
        }
      });
    });

    const totalOtherUsers = await User.countDocuments({
      _id: { $ne: currentUserId, $nin: Array.from(existingParticipantIds) },
      status: 'ACTIVE'
    });

    const totalCount = totalConversations + totalOtherUsers;
    const pagination = buildPagination({ page, limit, totalCount });

    let paginatedConversations: any[] = [];
    let dummyConversations: any[] = [];

    if (offset < totalConversations) {
      // Fetch actual conversations
      paginatedConversations = await Conversation.find({
        participants: currentUserId
      })
      .populate({
        path: 'participants',
        select: 'name email isBreak status role',
        populate: { path: 'role' }
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit);

      const remainingLimit = limit - paginatedConversations.length;
      if (remainingLimit > 0) {
        // Fetch some users to fill the rest of the page
        const otherUsers = await User.find({
          _id: { $ne: currentUserId, $nin: Array.from(existingParticipantIds) },
          status: 'ACTIVE'
        })
        .populate('role').select('name email isBreak status role')
        .skip(0)
        .limit(remainingLimit);

        dummyConversations = otherUsers.map(user => ({
          _id: `new_${user._id}`,
          isNewConversation: true,
          participants: [{ _id: currentUserId }, user],
          unreadCounts: new Map(),
          updatedAt: new Date(0)
        }));
      }
    } else {
      // Only fetch users
      const userOffset = offset - totalConversations;
      const otherUsers = await User.find({
        _id: { $ne: currentUserId, $nin: Array.from(existingParticipantIds) },
        status: 'ACTIVE'
      })
      .populate('role').select('name email isBreak status role')
      .skip(userOffset)
      .limit(limit);

      dummyConversations = otherUsers.map(user => ({
        _id: `new_${user._id}`,
        isNewConversation: true,
        participants: [{ _id: currentUserId }, user],
        unreadCounts: new Map(),
        updatedAt: new Date(0)
      }));
    }

    const formattedConversations = paginatedConversations.map(c => c.toJSON ? c.toJSON() : c);
    const finalConversations = [...formattedConversations, ...dummyConversations];

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: finalConversations,
        pagination
      },
      message: 'Conversations fetched successfully'
    });
  });

  /**
   * Send a message to a conversation
   */
  static sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id: currentUserId } = req.user as any;
    const { conversationId, content, type = 'TEXT' } = req.body;

    if (!conversationId) {
      throw new ApiError({ status: 400, message: 'Conversation ID is required' });
    }

    if (!content && !req.file) {
      throw new ApiError({ status: 400, message: 'Content or file is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(currentUserId)) {
      throw new ApiError({ status: 403, message: 'Invalid conversation or access denied' });
    }

    let fileUrl;
    let fileName;
    let finalType = type;

    if (req.file) {
      const ext = req.file.originalname.split('.').pop() || "bin";
      const key = `chats/${conversationId}/file-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
      fileUrl = await StorageService.uploadFile(key, req.file.buffer, req.file.mimetype);
      fileName = req.file.originalname;

      if (req.file.mimetype.startsWith('image/')) {
        finalType = 'IMAGE';
      } else if (req.file.mimetype.startsWith('video/')) {
        finalType = 'VIDEO';
      } else if (req.file.mimetype.startsWith('audio/')) {
        finalType = 'AUDIO';
      } else {
        finalType = 'FILE';
      }
    }

    const message = new Message({
      conversation: conversationId,
      sender: currentUserId,
      content: content || "",
      type: finalType,
      fileUrl,
      fileName,
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

  /**
   * Get online status of a user
   */
  static getUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };

    if (!userId) {
      throw new ApiError({ status: 400, message: 'User ID is required' });
    }

    const io = getIO();
    // In Socket.io, users join a room with their userId when they connect
    const room = io.sockets.adapter.rooms.get(userId);
    const isOnline = room ? room.size > 0 : false;

    return new ApiResponse({
      res,
      status: 200,
      data: { isOnline },
      message: 'User status fetched successfully'
    });
  });
}
