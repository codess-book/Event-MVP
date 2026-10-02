import dns from "node:dns";
import mongoose from "mongoose";

// SRV lookup fail ho raha tha, isliye Google/Cloudflare DNS force kar rahe hain
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};