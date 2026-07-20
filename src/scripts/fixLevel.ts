import connectDB from "../db/mongo.js";
import { Grievance } from "../modules/grievance/grievance.model.js";
import mongoose from "mongoose";
import "dotenv/config";

const run = async () => {
  await connectDB();
  const res = await Grievance.updateMany({}, { escalationLevel: 0 });
  console.log("Updated grievances:", res);
  await mongoose.disconnect();
};
run();
