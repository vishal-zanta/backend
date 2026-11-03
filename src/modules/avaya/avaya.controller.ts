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

export class AvayaController {

  /**
   * Webhook Receiver — handles RINGING, ANSWERED, DROPPED from PBX
   */
  static handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    clog.info("avaya webhook",req.body)
    const { event, extension, callerId, calledId, durationSeconds, timestamp } = req.body;
    const eventTime = timestamp || new Date().toISOString();

    if (!event || !extension) {
      return res.status(400).json({ success: false, message: 'event and extension are required' });
    }

    const agent = await User.findOne({ 'cceConfig.extension': extension }).lean();

    const emitEvent = (eventName: string, data: any) => {
      try {
        const io = getIO();
        if (agent?._id) io.to(agent._id.toString()).emit(eventName, data);
        io.to(`extension:${extension}`).emit(eventName, data);
      } catch (e) {
        console.warn('Socket emission failed:', e);
      }
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

    try {
      const io = getIO();
      const payload = { event: 'ANSWERED', callId: callDoc?.callId, extension, timestamp: new Date().toISOString(), agentStatus: 'In Call' };
      io.to((user.id || user._id).toString()).emit('call:answered', payload);
      io.to(`extension:${extension}`).emit('call:answered', payload);
    } catch (e) { /* socket not ready */ }

    return new ApiResponse({ res, status: 200, data: { call: callDoc, avaya: avayaData }, message: 'Call picked up successfully' });
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

    // Check current status on Avaya
    let avayaStatus: any = null;
    try {
      avayaStatus = await AvayaService.getAgentStatus(agentId);
    } catch (e: any) {
      avayaStatus = { isLoggedIn: false, state: 'UNKNOWN', error: e?.message };
    }

    // If agent is not logged in on Avaya, auto-login + monitor (same as auth login flow)
    let reconnected = false;
    if (!avayaStatus?.isLoggedIn || avayaStatus?.state === 'LOGGED_OUT') {
      try {
        await AvayaService.agentLogin(agentId, extension, password || '123456');
        const webhookUrl = process.env.AVAYA_WEBHOOK_URL || 'https://backend.bugslayer.in/api/v1/telephony/webhook';
        await AvayaService.monitorExtensions([extension], webhookUrl);
        reconnected = true;
        // Re-fetch status after login
        try {
          avayaStatus = await AvayaService.getAgentStatus(agentId);
        } catch (e) { /* keep previous */ }
      } catch (e) {
        console.error('Avaya auto-reconnect failed:', e);
      }
    }

    // Check DB for active call
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
