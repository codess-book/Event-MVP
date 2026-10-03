import { Router } from "express";
import { listSponsors, getSponsor } from "../controllers/sponsors.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", listSponsors);
router.get("/:id", getSponsor);
export default router;