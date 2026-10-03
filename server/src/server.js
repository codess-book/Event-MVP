import "dotenv/config";
import "./config/db.js"
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import cors from "cors";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Aaradh server running on port ${PORT}`);
  });

  // Render redeploy pe chalti requests poori hone do, phir band karo
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref(); // 10 sec mein na band ho toh force
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

// Koi promise error chhoot jaye toh server gire nahi, bas log ho
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

startServer();