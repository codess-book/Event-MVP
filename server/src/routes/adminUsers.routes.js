import { Router } from "express";

import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { listUsers,userStats ,getUser,setApproval,resetUserPassword } from "../controllers/Admin/Adminuser.controller.js";
const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/stats", userStats); 
router.get("/", listUsers);
router.get("/:id", getUser);
router.patch("/:id", setApproval);
router.post("/:id/reset-password", resetUserPassword);
export default router;