import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoose from "mongoose";
import router from "./routes/index.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Render/Vercel proxy ke peeche asli user IP milne ke liye (rate limit sahi chale)
app.set("trust proxy", 1);

// Security headers (XSS, clickjacking waghera se bachaav)
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",

  "https://event-mvp-three.vercel.app",

  "https://event-mvp-git-main-luv47863-6344.vercel.app",
  "https://event-oxpnzr3jq-luv47863-6344.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
// Response gzip: slow network pe chhota data
app.use(compression());

// Body 10KB se bada nahi, koi bada payload bhej ke server slow na kar sake
app.use(express.json({ limit: "10kb" }));

// Request logs
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Health check: rate limiter se pehle, taaki UptimeRobot/Render pings block na hon
app.get("/api/v1/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    message: dbUp ? "Aaradh API is running" : "Database not connected",
  });
});

// Saari API /api/v1 ke neeche, rate limit ke saath
app.use("/api/v1", apiLimiter, router);

// Ye dono hamesha sabse neeche (Express upar se neeche chalta hai)
app.use(notFound);
app.use(errorHandler);

export default app;
