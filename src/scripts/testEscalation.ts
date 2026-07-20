import connectDB from "../db/mongo.js";
import { checkAndEscalateGrievances } from "../cronjobs/escalation.cron.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables if needed
dotenv.config();

const runTest = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    
    console.log("Running checkAndEscalateGrievances...");
    await checkAndEscalateGrievances();
    
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Disconnect so the script exits cleanly
    await mongoose.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  }
};

runTest();
