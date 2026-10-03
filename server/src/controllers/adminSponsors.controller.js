import mongoose from "mongoose";
import { z } from "zod";
import User from "../models/User.js";
import { notify } from "../utils/notify.js";

// Fixed list, so the filter chips never get duplicates like "studio" and "Studio"
export const CATEGORIES = [
  "Clothing", "Food", "Jewellery", "Photography",
  "Makeup & Beauty", "Decor", "Other",
];

const updateSchema = z.object({
  isApproved: z.boolean().optional(),
  sponsorCategory: z.enum(CATEGORIES).optional(),
});

// All sponsors, pending ones first
export const listAdminSponsors = async (req, res, next) => {
  try {
    const docs = await User.find({ userType: "sponsor" })
      .select("name phone businessName photoUrl sponsorCategory isApproved offers createdAt")
      .sort({ isApproved: 1, createdAt: -1 })
      .limit(200)
      .lean();

    res.json({
      categories: CATEGORIES,
      sponsors: docs.map((d) => ({
        id: d._id,
        name: d.name,
        phone: d.phone,
        businessName: d.businessName,
        photoUrl: d.photoUrl || "",
        category: d.sponsorCategory || "",
        isApproved: d.isApproved,
        offerCount: d.offers?.length || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// Approve / hide a sponsor and/or set the category
export const updateSponsor = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid sponsor id" });
    }
    const data = updateSchema.parse(req.body);

    const sponsor = await User.findOne({ _id: req.params.id, userType: "sponsor" });
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });

    const wasApproved = sponsor.isApproved;
    if (data.sponsorCategory) sponsor.sponsorCategory = data.sponsorCategory;
    if (data.isApproved !== undefined) sponsor.isApproved = data.isApproved;

    // A live sponsor must have a category
    if (sponsor.isApproved && !sponsor.sponsorCategory) {
      return res.status(400).json({ message: "Choose a category before approving" });
    }
    await sponsor.save();
    res.json({ ok: true });

    // Welcome message only the first time a sponsor goes live
    if (!wasApproved && sponsor.isApproved) {
      notify({
        toUser: sponsor._id,
        type: "account",
        title: "Welcome to Aaradhna 🙏",
        body: `${sponsor.businessName} is now live in the app. Thank you for your support!`,
        link: "/profile",
        createdBy: req.user.id,
      }).catch((e) => console.error("Welcome push failed:", e.message));
    }
  } catch (err) {
    next(err);
  }
};