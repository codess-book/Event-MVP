import { Router } from "express";
import { listOffers } from "../controllers/offers.controller.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
router.get("/", listOffers);
export default router;