import multer from "multer";
import { ApiError } from "./errorHandler.js";

import { SystemConfig } from "../modules/systemConfig/systemConfig.model.js";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "image/jpeg", "image/png", "image/webp","video/mp4", "audio/mpeg"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError({ status: 400, message: "Invalid file type. Only standard images, documents, audio and video are allowed." }));
  }
};

let cachedLimits = {
  default: 10 * 1024 * 1024,
  grievance: 10 * 1024 * 1024,
  fieldVisit: 10 * 1024 * 1024,
  chat: 5 * 1024 * 1024
};
let lastFetch = 0;

export type UploadModule = 'grievance' | 'fieldVisit' | 'chat' | 'default';

const getDynamicUpload = async (moduleName: UploadModule) => {
  try {
    const now = Date.now();
    // Refresh cache every 1 minute
    if (now - lastFetch > 60000) {
      const config = await SystemConfig.findOne();
      if (config) {
        if (config.defaultMaxUploadSizeMB) cachedLimits.default = config.defaultMaxUploadSizeMB * 1024 * 1024;
        if (config.grievanceMaxUploadSizeMB) cachedLimits.grievance = config.grievanceMaxUploadSizeMB * 1024 * 1024;
        if (config.fieldVisitMaxUploadSizeMB) cachedLimits.fieldVisit = config.fieldVisitMaxUploadSizeMB * 1024 * 1024;
        if (config.chatMaxUploadSizeMB) cachedLimits.chat = config.chatMaxUploadSizeMB * 1024 * 1024;
      }
      lastFetch = now;
    }
  } catch (error) {
    console.error("Failed to fetch dynamic upload limit", error);
  }

  const fileSize = cachedLimits[moduleName] || cachedLimits.default;

  return multer({
    storage,
    limits: {
      fileSize,
    },
    fileFilter,
  });
};

export const upload = {
  array: (fieldname: string, maxCount?: number, moduleName: UploadModule = 'default') => {
    return async (req: any, res: any, next: any) => {
      const uploader = await getDynamicUpload(moduleName);
      const multerMiddleware = uploader.array(fieldname, maxCount);
      multerMiddleware(req, res, (err) => {
        if (err) return next(err);
        next();
      });
    };
  },
  single: (fieldname: string, moduleName: UploadModule = 'default') => {
    return async (req: any, res: any, next: any) => {
      const uploader = await getDynamicUpload(moduleName);
      const multerMiddleware = uploader.single(fieldname);
      multerMiddleware(req, res, (err) => {
        if (err) return next(err);
        next();
      });
    };
  },
  any: (moduleName: UploadModule = 'default') => {
    return async (req: any, res: any, next: any) => {
      const uploader = await getDynamicUpload(moduleName);
      const multerMiddleware = uploader.any();
      multerMiddleware(req, res, (err) => {
        if (err) return next(err);
        next();
      });
    };
  }
};
