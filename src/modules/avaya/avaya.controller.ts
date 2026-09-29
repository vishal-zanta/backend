import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { AvayaService } from './avaya.service.js';

export class AvayaController {
  
  static connectSystem = asyncHandler(async (req: Request, res: Response) => {
    const { adminProviderString } = req.body;
    const data = await AvayaService.connectSystem(adminProviderString);
    return new ApiResponse({ res, status: 200, data, message: 'Connected to Avaya PBX successfully' });
  });

  static makeCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const sourceExtension =  user?.cceConfig?.extension;
    const { clientNumber } = req.body;
    
    if (!sourceExtension) return new ApiResponse({ res, status: 400, message: 'cce config is required' });
    
    const data = await AvayaService.makeCall(sourceExtension, clientNumber);
    return new ApiResponse({ res, status: 200, data, message: 'Call initiated successfully' });
  });

  static answerCall = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const extension =user?.cceConfig?.extension;
    
    if (!extension) return new ApiResponse({ res, status: 400, message: 'extension is required' });

    const data = await AvayaService.answerCall(extension as string);
    return new ApiResponse({ res, status: 200, data, message: 'Call answered successfully' });
  });

  static getQueueAgents = asyncHandler(async (req: Request, res: Response) => {
    const { queue } = req.params;
    const data = await AvayaService.getQueueAgents(queue as string);
    return new ApiResponse({ res, status: 200, data, message: 'Queue agents fetched successfully' });
  });

  static getAgentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { agentId } = req.params;
    const data = await AvayaService.getAgentStatus(agentId as string);
    return new ApiResponse({ res, status: 200, data, message: 'Agent status fetched successfully' });
  });

  static getActiveCallDetails = asyncHandler(async (req: Request, res: Response) => {
    const { extension } = req.params;
    const data = await AvayaService.getActiveCallDetails(extension as string);
    return new ApiResponse({ res, status: 200, data, message: 'Active call details fetched successfully' });
  });

  static getCallHistory = asyncHandler(async (req: Request, res: Response) => {
    const data = await AvayaService.getCallHistory();
    return new ApiResponse({ res, status: 200, data, message: 'Call history fetched successfully' });
  });

  static handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const eventData = req.body;
    console.log("[Avaya Webhook Received]:", JSON.stringify(eventData, null, 2));
    
    // Here we can later add logic to emit socket events to the frontend
    // or process the call states in our DB.

    // Respond quickly to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook received' });
  });
}
