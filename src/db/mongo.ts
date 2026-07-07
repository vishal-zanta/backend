import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;
    const connectionInstance = await mongoose.connect(MONGODB_URI!);
    console.log(
      `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;
