import moment from "moment";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../../utils/apiResponse.js";
import { Router, type Request, type Response } from "express";

const router = Router();


/**
 * Health check endpoint
 * @route GET /health
 * @returns JSON with server status and current time
 */
router.get("/health", (req: Request, res: Response) => {
 

  const currentTime = moment().format("hh:mm A Do MMMM YYYY");

  new ApiResponse({
    res,
    status: StatusCodes.OK,
    message: "Server is healthy",
    data: { time: currentTime },
  });
});



export default router;
