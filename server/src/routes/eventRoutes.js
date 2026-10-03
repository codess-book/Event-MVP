import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { listEvent, createEvent, deleteEvent } from "../controllers/Event.controller.js";

const router = Router();
router.get("/", requireAuth, listEvent);
router.post("/", requireAuth, requireAdmin, createEvent);
router.delete("/:id", requireAuth, requireAdmin, deleteEvent);
export default router;