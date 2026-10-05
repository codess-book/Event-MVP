import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import { listStalls, rateStall } from "../controllers/food.controller.js";

const router = Router();

const ratingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many ratings, try again in a few minutes" },
});

router.use(requireAuth);
router.get("/", listStalls);
router.put("/:id/rating", ratingLimiter, rateStall);

export default router;