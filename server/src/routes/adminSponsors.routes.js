import { Router } from "express";
import { listAdminSponsors, updateSponsor } from "../controllers/adminSponsors.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/", listAdminSponsors);
router.patch("/:id", updateSponsor);
export default router;