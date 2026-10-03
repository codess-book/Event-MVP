import mongoose from "mongoose";
import User from "../models/User.js";
import { publicSponsor } from "../utils/publicSponser.js";
// Only approved sponsors are ever visible
const VISIBLE = { userType: "sponsor", isApproved: true };
const FIELDS = "businessName photoUrl sponsorCategory address mapLink offers";

export const listSponsors = async (req, res, next) => {
  try {
    const docs = await User.find(VISIBLE).select(FIELDS).sort({ businessName: 1 }).limit(200).lean();
    res.json({ sponsors: docs.map(publicSponsor) });
  } catch (err) {
    next(err);
  }
};

export const getSponsor = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid sponsor id" });
    }
    const doc = await User.findOne({ _id: req.params.id, ...VISIBLE }).select(FIELDS).lean();
    if (!doc) return res.status(404).json({ message: "Sponsor not found" });
    res.json({ sponsor: publicSponsor(doc) });
  } catch (err) {
    next(err);
  }
};