// routes/challenge.routes.js
import { Router } from "express";
import * as c from "../controllers/Challenge.Controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/mine", c.myEntries);
router.get("/winners", c.listWinners);
router.post("/:id/signature", c.getSignature);
router.post("/:id/entry", c.submitEntry);

// admin
router.get("/:id/entries", requireAdmin, c.adminEntries);
router.delete("/entries/:entryId", requireAdmin, c.deleteEntry);
router.post("/entries/:entryId/winner", requireAdmin, c.setWinner);
export default router;

// routes/index.js mein:
// import challengeRoutes from "./challenge.routes.js";
// router.use("/challenges", challengeRoutes);