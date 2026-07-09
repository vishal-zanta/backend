import multer from "multer";
import { ApiError } from "./errorHandler.js";

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

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit per file
  },
  fileFilter,
});
