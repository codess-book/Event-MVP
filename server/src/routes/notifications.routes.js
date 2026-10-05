import { Router } from "express";
import {
  saveToken, removeToken, listNotifications, sendNotification,
} from "../controllers/notifications.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { sendTest } from "../controllers/notifications.controller.js";
const router = Router();
router.use(requireAuth);

router.get("/", listNotifications);
router.post("/token", saveToken);
router.delete("/token", removeToken);
router.post("/admin/send", requireAdmin, sendNotification);
router.post("/test", sendTest);
export default router;