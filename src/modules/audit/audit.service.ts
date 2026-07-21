import { Request } from 'express';
import { AuditLog } from './audit.model.js';

import mongoose from 'mongoose';

export class AuditService {
  static async logGrievanceCreation(req: Request, grievanceId: string | mongoose.Types.ObjectId) {
    try {
      const rawIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const ipAddress = Array.isArray(rawIp) ? rawIp[0] : rawIp;
      const devicePlatform = req.headers['user-agent'] || 'unknown';
      
      const citizenId = (req as any).citizen?._id;
      const userId = (req as any).user?._id;
      
      // Save to database asynchronously
      AuditLog.create({
        citizenId,
        userId,
        grievanceId,
        ipAddress,
        devicePlatform,
        endpoint: req.originalUrl,
        method: req.method
      }).catch(err => {
        console.error('Failed to create AuditLog:', err);
      });
    } catch (err) {
      console.error('Error in AuditService.logGrievanceCreation:', err);
    }
  }
}
