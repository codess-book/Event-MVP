import mongoose from "mongoose";
import User from "../models/User.js";
import { offerSchema } from "./profile.controller.js";
import { publicUser } from "../utils/publicUser.js";
import { notify } from "../utils/notify.js";
const MAX_OFFERS = 5;

const PUSH_COOLDOWN_MS = 10 * 60 * 1000; //10 min
// const PUSH_COOLDOWN_MS = 10 * 1000  //10sec  for testing

// Loads the logged-in sponsor, or sends the error response and returns null
async function loadSponsor(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401).json({ message: "User no longer exists" });
    return null;
  }
  if (user.userType !== "sponsor") {
    res.status(403).json({ message: "Only sponsors can manage offers" });
    return null;
  }
  return user;
}
export const addOffer = async (req, res, next) => {
  try {
    const data = offerSchema.parse(req.body);
    const user = await loadSponsor(req, res);
    if (!user) return; // loadSponsor already sent the error response

    if (user.offers.length >= MAX_OFFERS) {
      return res
        .status(400)
        .json({ message: `You can add up to ${MAX_OFFERS} offers` });
    }

    user.offers.push(data);
    await user.save();

    // Send the response exactly once
    res.status(201).json({ user: publicUser(user) });

    // Runs after the response, so a push problem never breaks "Add offer"
    if (user.isApproved) {
      announceOffer(user, data.title).catch((e) =>
        console.error("Offer push failed:", e.message),
      );
    }
  } catch (err) {
    next(err);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.offerId)) {
      return res.status(400).json({ message: "Invalid offer id" });
    }
    const data = offerSchema.parse(req.body);
    const user = await loadSponsor(req, res);
    if (!user) return;
    const offer = user.offers.id(req.params.offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    offer.title = data.title;
    offer.description = data.description ?? "";
    offer.code = data.code ?? "";
    offer.validTill = data.validTill ?? undefined; // undefined clears the date
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.offerId)) {
      return res.status(400).json({ message: "Invalid offer id" });
    }
    const user = await loadSponsor(req, res);
    if (!user) return;
    if (!user.offers.id(req.params.offerId)) {
      return res.status(404).json({ message: "Offer not found" });
    }
    user.offers.pull(req.params.offerId);
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// Pushes a new offer to everyone, at most once per sponsor per cooldown window.
// The update is atomic, so two quick requests cannot both pass the cooldown.
async function announceOffer(user, offerTitle) {
  const cutoff = new Date(Date.now() - PUSH_COOLDOWN_MS);
  const claimed = await User.updateOne(
    {
      _id: user._id,
      $or: [
        { lastOfferNotifyAt: { $exists: false } },
        { lastOfferNotifyAt: { $lt: cutoff } },
      ],
    },
    { lastOfferNotifyAt: new Date() },
  );
  if (!claimed.modifiedCount) return;

  await notify({
    type: "offer",
    title: "New offer 🎁",
    body: `${user.businessName}: ${offerTitle}`.slice(0, 200),
    link: `/sponsors/${user._id}`,
    excludeUser: user._id,
    createdBy: user._id,
  });
}

const VISIBLE = { userType: "sponsor", isApproved: true };

// Start of today in IST, so an offer valid "till today" is still shown all day
const startOfTodayIST = () => {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000);
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() - 5.5 * 3600 * 1000);
};

export const listOffers = async (req, res, next) => {
  try {
    const sponsors = await User.find(VISIBLE)
      .select("businessName name photoUrl sponsorCategory offers")
      .limit(200)
      .lean();

    const cutoff = startOfTodayIST();
    const offers = [];

    for (const s of sponsors) {
      for (const o of s.offers || []) {
        // Skip expired offers
        if (o.validTill && new Date(o.validTill) < cutoff) continue;
        offers.push({
          id: String(o._id),
          title: o.title,
          description: o.description || "",
          tag: o.tag || o.discount || "",
          validTill: o.validTill || null,
          imageUrl: o.imageUrl || o.photoUrl || "",
          createdAt: o.createdAt || o._id.getTimestamp(), // ObjectId fallback
          sponsor: {
            id: String(s._id),
            name: s.businessName || s.name,
            photoUrl: s.photoUrl || "",
            category: s.sponsorCategory || "",
          },
        });
      }
    }

    offers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.set("Cache-Control", "private, max-age=30");
    res.json({ offers });
  } catch (err) {
    next(err);
  }
};
