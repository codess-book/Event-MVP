import { Router } from "express";
import { listMembers } from "../controllers/members.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", listMembers);
export default router;