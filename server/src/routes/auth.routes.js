import { Router } from "express";
import { register, login , me,  } from "../controllers/auth.controllers.js";
// import {
//   requestReset,
//   listResetRequests,
//   approveResetRequest,
//   resetPasswordWithCode,
//   changePassword,
// } from "../controllers/password.controller.js";

import { requestReset,listResetRequests,approveResetRequest,resetPasswordWithCode,changePassword } from "../controllers/password.controller.js";
import { requireAdmin,requireAuth } from "../middleware/auth.js";
const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", requestReset);
router.post("/reset-password", resetPasswordWithCode);

// Logged-in user routes
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, changePassword);

// Admin routes show list of user who all requested forgot passwors
router.get("/admin/reset-requests", requireAuth, requireAdmin, listResetRequests);
// only admin he will approve request and will make 6 digit code
router.post(
  "/admin/reset-requests/:id/approve",
  requireAuth,
  requireAdmin,
  approveResetRequest
);


export default router;