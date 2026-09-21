import { Request, Response } from 'express';
import { v2 } from '@google-cloud/translate';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config();

const translateClient = new v2.Translate({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'hozo-translation-prod-247bbeac1b85.json')
});

export class TranslateController {
  static translateText = asyncHandler(async (req: Request, res: Response) => {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      throw new ApiError({
        status: 400,
        message: 'Please provide both "text" and "targetLanguage" in the request body.',
      });
    }

    try {
      // Google Translate API auto-detects the source language by default
      const [translation] = await translateClient.translate(text, targetLanguage);

      return new ApiResponse({
        res,
        status: 200,
        data: {
          originalText: text,
          targetLanguage,
          translatedText: translation,
        },
        message: 'Text translated successfully',
      });
    } catch (error: any) {
      console.error('Translation error:', error);
      throw new ApiError({
        status: 500,
        message: 'Failed to translate text: ' + error.message,
      });
    }
  });
}
