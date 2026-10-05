import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { createFoodPartner } from "../controllers/adminFood.controller.js";

const router = Router();
router.use(requireAuth, requireAdmin);
router.post("/", createFoodPartner);

export default router;