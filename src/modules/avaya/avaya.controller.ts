import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { AvayaService } from './avaya.service.js';
import { Call } from '../call/call.model.js';
import { Grievance } from '../grievance/grievance.model.js';
import { Citizen } from '../citizen/citizen.model.js';
import { User } from '../users/user.model.js';
import { TimelineService } from '../timeline/timeline.service.js';
import { timelineTemplates } from '../timeline/timeline.template.js';
import { getIO } from '../../config/socket.js';
import mongoose from 'mongoose';
import clog from '../../utils/customLog.js';
import { ActivityService } from '../activity/activity.service.js';

export class AvayaController {

  /**
   * Helper to emit socket events once.
   * Passing an array of rooms to io.to([...]) ensures Socket.io automatically deduplicates
   * sockets across rooms, so a client connected to both user room and extension room receives the event only ONCE.
   */
  private static emitSocketEvent(eventName: string, data: any, userId?: string, extension?: string) {
    try {
      const io = getIO();
      const rooms: string[] = [];
      if (userId) rooms.push(userId.toString());
      if (extension) {
        rooms.push(`extension:${extension}`);
        rooms.push(extension.toString());
      }
      if (rooms.length > 0) {
        io.to(rooms).emit(eventName, data);
      }
    } catch (e) {
      console.warn('Socket emission failed:', e);
    }
  }

  /**
   * Webhook Receiver — handles RINGING, ANSWERED, DROPPED from PBX
   */
  static handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    clog.info("avaya webhook", req.body);
    const { event, extension, callerId, calledId, durationSeconds, timestamp } = req.body;
    const eventTime = timestamp || new Date().toISOString();

    if (!event || !extension) {
      return res.status(400).json({ success: false, message: 'event and extension are required' });
    }

    const agent = await User.findOne({ 'cceConfig.extension': extension }).lean();

    const emitEvent = (eventName: string, data: any) => {
      AvayaController.emitSocketEvent(eventName, data, agent?._id?.toString(), extension);
    };

    if (event === 'RINGING') {
      const citizen = callerId ? await Citizen.findOne({ mobile: callerId }).lean() : null;
      const recentGrievances = callerId
        ? await Grievance.find({ 'citizenInfo.mobile': callerId })
            .select('grievanceId status priority classification createdAt')
            .sort({ createdAt: -1 }).limit(5).lean()
        : [];

      const callId = `CALL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const callDoc = await Call.create({
        callId,
        agent: agent?._id,
        callType: callerId === extension ? 'Outbound' : 'Inbound',
        citizenMobile: callerId,
        complaintId: recentGrievances[0]?._id,
        complaintIdString: recentGrievances[0]?.grievanceId,
        status: 'Ringing',
        disposition: 'Call Ringing',
        duration: '0s',
        recordingDuration: '0s'
      });

      const payload = {
        event: 'RINGING', callId: callDoc.callId, extension, callerId, calledId, timestamp: eventTime,
        screenPop: { callerMobile: callerId, isRegisteredCitizen: !!citizen, citizen, recentGrievances }
      };
      emitEvent('call:ringing', payload);
      return res.status(200).json({ success: true, message: 'RINGING event processed', data: payload });
    }

    if (event === 'ANSWERED') {
      const callDoc = await Call.findOne({
        citizenMobile: callerId, status: { $in: ['Ringing', 'Initiated', 'Pending'] }
      }).sort({ createdAt: -1 });

      if (callDoc) {
        callDoc.status = 'In Call';
        callDoc.disposition = 'Call answered';
        await callDoc.save();
      }

      const payload = { event: 'ANSWERED', callId: callDoc?.callId, extension, callerId, calledId, timestamp: eventTime, agentStatus: 'In Call' };
      emitEvent('call:answered', payload);
      return res.status(200).json({ success: true, message: 'ANSWERED event processed', data: payload });
    }

    if (event === 'DROPPED') {
      const duration = `${durationSeconds || 0}s`;
      const callDoc = await Call.findOne({
        citizenMobile: callerId, status: { $in: ['In Call', 'Ringing', 'Initiated', 'Pending'] }
      }).sort({ createdAt: -1 });

      if (callDoc) {
        callDoc.status = 'Completed';
        callDoc.disposition = 'Call ended';
        callDoc.duration = duration;
        callDoc.recordingDuration = duration;
        await callDoc.save();
      }

      const payload = { event: 'DROPPED', callId: callDoc?.callId, extension, callerId, calledId, durationSeconds: durationSeconds || 0, timestamp: eventTime, agentStatus: 'Available' };
      emitEvent('call:dropped', payload);
      return res.status(200).json({ success: true, message: 'DROPPED event processed', data: payload });
    }

    return res.status(200).json({ success: true, message: `Event ${event} acknowledged` });
  });

  /**
   * Make Outbound Call (Click-to-Call)
   * Body: { clientNumber, grievanceId? }
   */
  static makeCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    const { clientNumber, grievanceId } = req.body;

    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });
    if (!clientNumber) throw new ApiError({ status: 400, message: 'clientNumber is required' });

    const data = await AvayaService.makeCall(extension, clientNumber);

    const complaintObjectId = (grievanceId && mongoose.isValidObjectId(grievanceId)) ? grievanceId : undefined;

    const callId = `CALL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const callDoc = await Call.create({
      callId, agent: user.id || user._id, callType: 'Outbound',
      citizenMobile: clientNumber, complaintIdString: grievanceId, complaintId: complaintObjectId,
      status: 'Initiated', disposition: 'Call placed', duration: '0s', recordingDuration: '0s'
    });

    if (complaintObjectId) {
      await TimelineService.logEvent({
        grievanceId: complaintObjectId, type: 'CALL_OUTBOUND',
        actor: { id: user.id || user._id, name: user.name, role: user.roles?.[0]?.level || 'Agent' },
        metadata: timelineTemplates.CALL_OUTBOUND(clientNumber),
      });
    }

    return new ApiResponse({ res, status: 200, data: { avaya: data, call: callDoc }, message: 'Call initiated successfully' });
  });

  /**
   * Pickup / Answer Incoming Call
   * Body: {} (no body needed, uses agent's configured extension)
   */
  static pickupCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;

    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const avayaData = await AvayaService.answerCall(extension);

    const callDoc = await Call.findOne({
      agent: user.id || user._id, status: { $in: ['Ringing', 'Initiated', 'Pending'] }
    }).sort({ createdAt: -1 });

    if (callDoc) {
      callDoc.status = 'In Call';
      callDoc.disposition = 'Call answered';
      await callDoc.save();
    }

    const payload = { event: 'ANSWERED', callId: callDoc?.callId, extension, timestamp: new Date().toISOString(), agentStatus: 'In Call' };
    AvayaController.emitSocketEvent('call:answered', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data: { call: callDoc, avaya: avayaData }, message: 'Call picked up successfully' });
  });

  /**
   * Hold Call
   * Body: {}
   */
  static holdCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const data = await AvayaService.holdCall(extension);

    const callDoc = await Call.findOne({
      agent: user.id || user._id,
      status: { $in: ['In Call', 'Ringing', 'Initiated', 'Pending'] }
    }).sort({ createdAt: -1 });

    if (callDoc) {
      callDoc.disposition = 'On Hold';
      await callDoc.save();
    }

    const payload = { event: 'HELD', callId: callDoc?.callId, extension, timestamp: new Date().toISOString() };
    AvayaController.emitSocketEvent('call:hold', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data, message: 'Call placed on hold successfully' });
  });

  /**
   * Unhold / Retrieve Call
   * Body: {}
   */
  static unholdCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const data = await AvayaService.unholdCall(extension);

    const callDoc = await Call.findOne({
      agent: user.id || user._id,
      status: { $in: ['In Call', 'Ringing', 'Initiated', 'Pending'] }
    }).sort({ createdAt: -1 });

    if (callDoc) {
      callDoc.disposition = 'Call answered';
      await callDoc.save();
    }

    const payload = { event: 'UNHELD', callId: callDoc?.callId, extension, timestamp: new Date().toISOString() };
    AvayaController.emitSocketEvent('call:unhold', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data, message: 'Call retrieved from hold successfully' });
  });

  /**
   * Mute Call
   * Body: {}
   */
  static muteCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const data = await AvayaService.muteCall(extension);

    const payload = { event: 'MUTED', extension, timestamp: new Date().toISOString() };
    AvayaController.emitSocketEvent('call:mute', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data, message: 'Call muted successfully' });
  });

  /**
   * Unmute Call
   * Body: {}
   */
  static unmuteCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const data = await AvayaService.unmuteCall(extension);

    const payload = { event: 'UNMUTED', extension, timestamp: new Date().toISOString() };
    AvayaController.emitSocketEvent('call:unmute', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data, message: 'Call unmuted successfully' });
  });

  /**
   * Drop / Hangup Call
   * Body: {}
   */
  static dropCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const data = await AvayaService.dropCall(extension);

    const callDoc = await Call.findOne({
      agent: user.id || user._id,
      status: { $in: ['In Call', 'Ringing', 'Initiated', 'Pending'] }
    }).sort({ createdAt: -1 });

    let durationSeconds = 0;
    if (callDoc) {
      durationSeconds = Math.max(0, Math.floor((Date.now() - new Date(callDoc.createdAt).getTime()) / 1000));
      callDoc.status = 'Completed';
      callDoc.disposition = 'Call dropped';
      callDoc.duration = `${durationSeconds}s`;
      callDoc.recordingDuration = `${durationSeconds}s`;
      await callDoc.save();
    }

    const payload = {
      event: 'DROPPED',
      callId: callDoc?.callId,
      extension,
      durationSeconds,
      timestamp: new Date().toISOString(),
      agentStatus: 'Available'
    };
    AvayaController.emitSocketEvent('call:dropped', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data: { call: callDoc, avaya: data }, message: 'Call dropped successfully' });
  });

  /**
   * Transfer Call
   * Blind transfer: Body { targetUserId } -> translates targetUserId to target extension and transfers
   * Complete attended transfer: Body {} (no targetUserId) -> completes transfer after consultation
   */
  static transferCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const targetUserId = req.body.targetUserId || req.body.userId;
    let destination: string | undefined = undefined;

    if (targetUserId) {
      if (!mongoose.isValidObjectId(targetUserId)) {
        throw new ApiError({ status: 400, message: 'Invalid targetUserId' });
      }
      const targetUser = await User.findById(targetUserId).select('name userCode cceConfig');
      if (!targetUser || !targetUser.cceConfig?.extension) {
        throw new ApiError({ status: 400, message: 'Selected target user does not have a telephony extension configured' });
      }
      destination = targetUser.cceConfig.extension;
    }

    const data = await AvayaService.transferCall(extension, destination);

    const callDoc = await Call.findOne({
      agent: user.id || user._id,
      status: { $in: ['In Call', 'Ringing', 'Initiated', 'Pending'] }
    }).sort({ createdAt: -1 });

    if (callDoc) {
      callDoc.disposition = destination ? `Transferred to ${destination}` : 'Attended transfer completed';
      await callDoc.save();
    }

    const payload = {
      event: 'TRANSFERRED',
      callId: callDoc?.callId,
      extension,
      destination,
      timestamp: new Date().toISOString()
    };
    AvayaController.emitSocketEvent('call:transferred', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({
      res,
      status: 200,
      data,
      message: destination ? `Call transferred to extension ${destination} successfully` : 'Attended transfer completed successfully'
    });
  });

  /**
   * Consultation Call (Put customer on hold & consult supervisor/cce)
   * Body: { targetUserId }
   */
  static consultCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const targetUserId = req.body.targetUserId || req.body.userId;
    if (!targetUserId) {
      throw new ApiError({ status: 400, message: 'targetUserId is required for consultation call' });
    }
    if (!mongoose.isValidObjectId(targetUserId)) {
      throw new ApiError({ status: 400, message: 'Invalid targetUserId' });
    }

    const targetUser = await User.findById(targetUserId).select('name userCode cceConfig');
    if (!targetUser || !targetUser.cceConfig?.extension) {
      throw new ApiError({ status: 400, message: 'Selected target user does not have a telephony extension configured' });
    }

    const destination = targetUser.cceConfig.extension;
    const data = await AvayaService.consultCall(extension, destination);

    const payload = {
      event: 'CONSULTING',
      extension,
      destination,
      targetUser: { id: targetUser._id, name: targetUser.name, userCode: targetUser.userCode, extension: destination },
      timestamp: new Date().toISOString()
    };
    AvayaController.emitSocketEvent('call:consulting', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({
      res,
      status: 200,
      data,
      message: `Consultation call initiated to ${targetUser.name} (${destination})`
    });
  });

  /**
   * Cancel Consultation Call (Drop consult & return to customer)
   * Body: {}
   */
  static cancelConsultCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const data = await AvayaService.cancelConsultCall(extension);

    const payload = { event: 'CONSULT_CANCELLED', extension, timestamp: new Date().toISOString() };
    AvayaController.emitSocketEvent('call:consult_cancelled', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data, message: 'Consultation call cancelled successfully' });
  });

  /**
   * Conference Call (Merge ongoing consult into 3-way conference OR add party)
   * Body: { targetUserId? }
   */
  static conferenceCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;
    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const targetUserId = req.body.targetUserId || req.body.userId;
    let destination: string | undefined = undefined;

    if (targetUserId) {
      if (!mongoose.isValidObjectId(targetUserId)) {
        throw new ApiError({ status: 400, message: 'Invalid targetUserId' });
      }
      const targetUser = await User.findById(targetUserId).select('name userCode cceConfig');
      if (!targetUser || !targetUser.cceConfig?.extension) {
        throw new ApiError({ status: 400, message: 'Selected target user does not have a telephony extension configured' });
      }
      destination = targetUser.cceConfig.extension;
    }

    const data = await AvayaService.conferenceCall(extension, destination);

    const payload = { event: 'CONFERENCE_STARTED', extension, destination, timestamp: new Date().toISOString() };
    AvayaController.emitSocketEvent('call:conference', payload, (user.id || user._id)?.toString(), extension);

    return new ApiResponse({ res, status: 200, data, message: 'Conference call initiated successfully' });
  });

  /**
   * Get Available Transfer & Consult Targets
   * Lists parent supervisor, other supervisors, and fellow CCE agents who:
   * 1. Have a valid telephony extension
   * 2. Are actively logged in (lastLogin within 24h and not logged out)
   * 3. Are NOT on break (isBreak is false)
   * 4. Are NOT currently busy on another active call
   */
  static getTransferTargets = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const currentUserId = (user.id || user._id).toString();

    // 1. Fetch current user to identify their parent supervisor
    const currentUser = await User.findById(currentUserId)
      .select('supervisor roles')
      .lean();

    const parentSupervisorId = currentUser?.supervisor?.toString();

    // 2. Find all agents currently busy in an ongoing call
    const activeCalls = await Call.find({
      status: { $in: ['In Call', 'Ringing', 'Initiated'] }
    }).select('agent').lean();

    const busyAgentIds = new Set(
      activeCalls.map((c: any) => c.agent?.toString()).filter(Boolean)
    );

    // 3. Query active users who:
    // - Have an extension configured
    // - Are not on break (isBreak: false)
    // - Logged in within the last 24 hours
    // - Have NOT logged out since last login (adminLogout < lastLogin)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const candidateUsers = await User.find({
      _id: { $ne: currentUserId },
      status: 'ACTIVE',
      'cceConfig.extension': { $exists: true, $nin: ['', null] },
      isBreak: { $ne: true },
      lastLogin: { $exists: true, $ne: null, $gte: twentyFourHoursAgo },
      $or: [
        { adminLogout: { $exists: false } },
        { adminLogout: null },
        { $expr: { $gt: ['$lastLogin', '$adminLogout'] } }
      ]
    })
      .select('name userCode email phone roles supervisor cceConfig isBreak lastLogin adminLogout')
      .populate('roles', 'designationEnglish level')
      .populate('supervisor', 'name userCode')
      .lean();

    let io: any = null;
    try {
      io = getIO();
    } catch (e) {}

    let parentSupervisor: any = null;
    const supervisors: any[] = [];
    const cces: any[] = [];
    const all: any[] = [];

    for (const u of candidateUsers) {
      const uId = u._id.toString();

      // Strict safety check: Skip if on break
      if (u.isBreak) continue;

      // Strict safety check: Skip if logged out
      if (u.adminLogout && u.lastLogin && new Date(u.adminLogout).getTime() >= new Date(u.lastLogin).getTime()) {
        continue;
      }

      // Skip if agent is currently busy on another active call
      if (busyAgentIds.has(uId)) {
        continue;
      }

      // Live presence check (socket connection or Redis heartbeat)
      const isSocketConnected = io ? (io.sockets?.adapter?.rooms?.get(uId)?.size ?? 0) > 0 : false;
      let isRedisOnline = false;
      try {
        const activity = await ActivityService.getUserActivity(uId);
        isRedisOnline = !!activity?.isOnline;
      } catch (e) {}

      const isLiveOnline = isSocketConnected || isRedisOnline;

      // If client requests onlineOnly=true, filter out users without active socket/redis heartbeat
      if (req.query.onlineOnly === 'true' && !isLiveOnline) {
        continue;
      }

      const isSuper = (u.roles as any[])?.some(
        (r: any) => r.level?.toLowerCase() === 'supervisor' || r.designationEnglish?.toLowerCase().includes('supervisor')
      );
      const isCCE = (u.roles as any[])?.some(
        (r: any) => r.level?.toLowerCase() === 'cce' || r.designationEnglish?.toLowerCase().includes('cce')
      );
      const isParent = parentSupervisorId ? uId === parentSupervisorId : false;

      const userSummary = {
        _id: u._id,
        name: u.name,
        userCode: u.userCode,
        email: u.email,
        phone: u.phone,
        extension: u.cceConfig?.extension,
        agentId: u.cceConfig?.agentId,
        status: 'AVAILABLE',
        isBreak: false,
        isOnline: isLiveOnline,
        isSupervisor: isSuper,
        isCCE: isCCE,
        isParentSupervisor: isParent,
        roleName: (u.roles as any[])?.[0]?.designationEnglish || (u.roles as any[])?.[0]?.level || 'Agent',
        lastLogin: u.lastLogin
      };

      all.push(userSummary);

      if (isParent) {
        parentSupervisor = userSummary;
      } else if (isSuper) {
        supervisors.push(userSummary);
      } else {
        cces.push(userSummary);
      }
    }

    return new ApiResponse({
      res,
      status: 200,
      data: {
        parentSupervisor,
        supervisors,
        cces,
        all
      },
      message: 'Available logged-in transfer targets fetched successfully'
    });
  });

  /**
   * Get Agent Status — checks Avaya, if not logged in auto-connects (like login flow)
   */
  static getAgentStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const { agentId, extension, password } = user?.cceConfig || {};

    if (!agentId || !extension) {
      throw new ApiError({ status: 400, message: 'CCE config (agentId, extension) is not configured for this user' });
    }

    let avayaStatus: any = null;
    try {
      avayaStatus = await AvayaService.getAgentStatus(agentId);
    } catch (e: any) {
      avayaStatus = { isLoggedIn: false, state: 'UNKNOWN', error: e?.message };
    }

    let reconnected = false;
    if (!avayaStatus?.isLoggedIn || avayaStatus?.state === 'LOGGED_OUT') {
      try {
        await AvayaService.agentLogin(agentId, extension, password || '123456');
        const webhookUrl = process.env.AVAYA_WEBHOOK_URL || 'https://backend.bugslayer.in/api/v1/telephony/webhook';
        await AvayaService.monitorExtensions([extension], webhookUrl);
        reconnected = true;
        try {
          avayaStatus = await AvayaService.getAgentStatus(agentId);
        } catch (e) { /* keep previous */ }
      } catch (e) {
        console.error('Avaya auto-reconnect failed:', e);
      }
    }

    const activeCall = await Call.findOne({
      agent: user.id || user._id,
      status: { $in: ['Ringing', 'In Call', 'Initiated', 'Pending'] }
    }).sort({ createdAt: -1 }).lean();

    let unifiedStatus = 'AVAILABLE';
    if (user.isBreak) unifiedStatus = 'ON_BREAK';
    else if (activeCall?.status === 'Ringing') unifiedStatus = 'RINGING';
    else if (activeCall?.status === 'In Call') unifiedStatus = 'IN_CALL';

    return new ApiResponse({
      res, status: 200,
      data: { agentId, extension, isBreak: !!user.isBreak, unifiedStatus, avayaStatus, activeCall, reconnected },
      message: reconnected ? 'Agent was disconnected, auto-reconnected to Avaya' : 'Agent status fetched successfully'
    });
  });

  /**
   * Get Active Call Details for current agent's extension
   */
  static getActiveCallDetails = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension = user?.cceConfig?.extension;

    if (!extension) throw new ApiError({ status: 400, message: 'CCE extension is not configured for this user' });

    const data = await AvayaService.getActiveCallDetails(extension);
    return new ApiResponse({ res, status: 200, data, message: 'Active call details fetched successfully' });
  });

  /**
   * Get Call History from Avaya
   */
  static getCallHistory = asyncHandler(async (req: Request, res: Response) => {
    const data = await AvayaService.getCallHistory();
    return new ApiResponse({ res, status: 200, data, message: 'Call history fetched successfully' });
  });
}
