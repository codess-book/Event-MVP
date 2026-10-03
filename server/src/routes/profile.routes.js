import { Router } from "express";
import {
  updateProfile,
  getPhotoSignature,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";
import { addOffer, deleteOffer ,updateOffer} from "../controllers/offers.controller.js";
const router = Router();

// Every profile route needs a logged-in user
router.use(requireAuth);

router.patch("/", updateProfile);
router.post("/photo-signature", uploadLimiter, getPhotoSignature);


router.post("/offers", addOffer);
router.put("/offers/:offerId", updateOffer);
router.delete("/offers/:offerId", deleteOffer);
export default router;
