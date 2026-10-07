import { Router } from "express";
import authRoutes from "./auth.routes.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import profileRoutes from "./profile.routes.js";
import sponsorRoutes from "./sponsors.routes.js";
import Notification from "./notifications.routes.js";
import adminSponsorsRoutes from "./adminSponsors.routes.js";
import adminUsersRoutes from "./adminUsers.routes.js";
import eventRoutes from "./eventRoutes.js";
import challengeRoutes from "./Challenge.routes.js";
import prizeRoutes from "./prizes.routes.js";
import membersRoutes from "./members.routes.js";
import foodRoutes from "./food.routes.js";
import adminFoodRoutes from "./adminFood.routes.js";
import offerroutes from "./offers.routes.js";
const router = Router();

router.use("/auth", authLimiter, authRoutes);
router.use("/profile", profileRoutes);
// Voting and candidate routes will be added back here later,
// after they are updated to use requireAuth.
router.use("/sponsors", sponsorRoutes);
router.use("/notifications", Notification);
router.use("/admin/sponsors", adminSponsorsRoutes);
router.use("/admin/users", adminUsersRoutes);
router.use("/event", eventRoutes);

router.use("/challenges", challengeRoutes);
router.use("/prizes", prizeRoutes);
router.use("/members", membersRoutes);

router.use("/food-stalls", foodRoutes);
router.use("/admin/food-partners", adminFoodRoutes);
router.use("/offers",offerroutes);
export default router;
