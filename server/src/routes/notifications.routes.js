import { Router } from "express";
import {
  saveToken, removeToken, listNotifications, sendNotification,
} from "../controllers/notifications.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", listNotifications);
router.post("/token", saveToken);
router.delete("/token", removeToken);
router.post("/admin/send", requireAdmin, sendNotification);

export default router;