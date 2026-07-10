import cors from "cors";

import moment from "moment";
import express from "express";
import connectDB from "./db/mongo.js";
import config from "./config/index.js";
import apiLogger from "./middlewares/logger.js";
import type { Request, Response, NextFunction } from "express";
import { handleErrorResponse } from "./middlewares/errorHandler.js";


// Routes
import indexRoutes from "./modules/main/index.routes.js";

// Cronjobs
import { initCronJobs } from "./cronjobs/escalation.cron.js";

const app = express();
const port = config.port;

app.use(cors({
    origin: "*",
  }));
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  },
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(apiLogger);

// Connect to MongoDB
connectDB();

// Initialize Cron Jobs
initCronJobs();

// Routes
app.use("/api/v1", indexRoutes);

/**
 * Root endpoint to verify server is running
 * @route GET /
 * @returns JSON with server status
 */
app.get("/", (req: Request, res: Response) => {
  const currentTime = moment().format("hh:mm A Do MMMM YYYY");
  res.status(200).json({
    status: 200,
    success: true,
    message: "Server is working!",
    data: {
      time: currentTime,
    },
  });
});


/**
 * Handle 404 Not Found
 */

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/**
 * Handle 500 Internal Server Error
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleErrorResponse(res, err, req);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
