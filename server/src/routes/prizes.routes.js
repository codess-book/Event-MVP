import { Router } from "express";
import { listPrizes, addPrize, updatePrize, deletePrize } from "../controllers/prizes.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", listPrizes);
router.post("/", addPrize);
router.put("/:id", updatePrize);
router.delete("/:id", deletePrize);
export default router;