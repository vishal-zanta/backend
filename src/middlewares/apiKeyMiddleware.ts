import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../modules/apiKey/apiKey.model.js';
import { ApiError } from './errorHandler.js';
import { asyncHandler } from './asyncHandler.js';

export const apiKeyAuthMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const apiKeyHeader = req.headers['x-api-key'] as string;

  if (!apiKeyHeader) {
    throw new ApiError({ status: 401, message: 'API Key is missing' });
  }

  const apiKeyDoc = await ApiKey.findOne({ key: apiKeyHeader });

  if (!apiKeyDoc) {
    throw new ApiError({ status: 401, message: 'Invalid API Key' });
  }

  if (!apiKeyDoc.active) {
    throw new ApiError({ status: 403, message: 'API Key has been disabled' });
  }

  // Update lastUsed timestamp (non-blocking)
  apiKeyDoc.lastUsed = new Date();
  apiKeyDoc.save().catch(err => console.error('Failed to update API key lastUsed:', err));

  // Attach API Key details to the request
  (req as any).apiKey = apiKeyDoc;
  
  next();
});
