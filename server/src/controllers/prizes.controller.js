import mongoose from "mongoose";
import { z } from "zod";
import Prize from "../models/Prize.js";
import User from "../models/User.js";
import { notify, recentlySent } from "../utils/notify.js";

const MAX_PER_SPONSOR = 10;

const prizeSchema = z.object({
  title: z.string().trim().min(3, "Prize title is too short").max(80),
  description: z.string().trim().max(300).optional(),
  forWhat: z.string().trim().max(60).optional(),
  // Admin only: who is giving this prize
  sponsorId: z.string().optional(),
  donorName: z.string().trim().max(60).optional(),
});

const loadMe = (req) =>
  User.findById(req.user.id).select("role userType isApproved");

const toPublic = (p, me) => {
  const s = p.sponsor;
  const isOwner = !!s && String(s._id) === String(me._id);
  return {
    id: p._id,
    title: p.title,
    description: p.description || "",
    forWhat: p.forWhat || "",
    donor: s
      ? {
          type: "sponsor",
          id: s._id,
          name: s.businessName,
          photoUrl: s.photoUrl || "",
        }
      : { type: "person", name: p.donorName },
    canEdit: me.role === "admin" || isOwner,
    createdAt: p.createdAt,
  };
};

export const listPrizes = async (req, res, next) => {
  try {
    const me = await loadMe(req);
    if (!me) return res.status(401).json({ message: "User no longer exists" });

    const docs = await Prize.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sponsor", "businessName photoUrl isApproved")
      .lean();

    // Hide prizes of sponsors who are not approved (admin still sees everything)
    const visible = docs.filter(
      (p) => !p.sponsor || p.sponsor.isApproved || me.role === "admin",
    );
    res.json({ prizes: visible.map((p) => toPublic(p, me)) });
  } catch (err) {
    next(err);
  }
};

export const addPrize = async (req, res, next) => {
  try {
    const data = prizeSchema.parse(req.body);
    const me = await loadMe(req);
    if (!me) return res.status(401).json({ message: "User no longer exists" });

    const doc = {
      title: data.title,
      description: data.description ?? "",
      forWhat: data.forWhat ?? "",
      createdBy: me._id,
    };

    if (me.role === "admin") {
      if (data.sponsorId) {
        if (!mongoose.isValidObjectId(data.sponsorId)) {
          return res.status(400).json({ message: "Invalid sponsor" });
        }
        const sp = await User.findOne({
          _id: data.sponsorId,
          userType: "sponsor",
        }).select("_id");
        if (!sp) return res.status(404).json({ message: "Sponsor not found" });
        doc.sponsor = sp._id;
      } else if (data.donorName) {
        doc.donorName = data.donorName;
      } else {
        return res
          .status(400)
          .json({ message: "Choose a sponsor or enter the donor's name" });
      }
    } else if (me.userType === "sponsor" && me.isApproved) {
      const count = await Prize.countDocuments({ sponsor: me._id });
      if (count >= MAX_PER_SPONSOR) {
        return res
          .status(400)
          .json({ message: `You can add up to ${MAX_PER_SPONSOR} prizes` });
      }
      doc.sponsor = me._id;
    } else {
      return res
        .status(403)
        .json({ message: "Only approved sponsors can add prizes" });
    }

    const prize = await Prize.create(doc);
    res.status(201).json({ id: prize._id });

   
    // Response jaane ke baad notification (admin + sponsor dono ke liye)
    try {
      const isAdmin = me.role === "admin";

      // Sponsor 10 min mein sirf ek baar sabko broadcast kar sakta hai
      if (
        !isAdmin &&
        (await recentlySent({ createdBy: me._id, type: "prize" }))
      )
        return;

      const donor = doc.sponsor
        ? (await User.findById(doc.sponsor).select("businessName").lean())
            ?.businessName
        : doc.donorName;

      await notify({
        type: "prize",
        title: "New prize 🎁",
        body: `${data.title}${donor ? ` · by ${donor}` : ""}`.slice(0, 200),
        link: "/prizes",
        createdBy: me._id,
        // Sponsor ko apna hi notification na jaye. Admin ke case mein sab ko jaye.
        excludeUser: isAdmin ? undefined : me._id,
      });
    } catch (e) {
      console.error("Prize push failed:", e.message);
    }
  } catch (err) {
    next(err);
  }
};

// Loads a prize the caller is allowed to change, or sends the error and returns null
async function loadEditable(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Invalid prize id" });
    return null;
  }
  const [me, prize] = await Promise.all([
    loadMe(req),
    Prize.findById(req.params.id),
  ]);
  if (!me) {
    res.status(401).json({ message: "User no longer exists" });
    return null;
  }
  if (!prize) {
    res.status(404).json({ message: "Prize not found" });
    return null;
  }
  const isOwner = prize.sponsor && String(prize.sponsor) === String(me._id);
  if (me.role !== "admin" && !isOwner) {
    res.status(403).json({ message: "You cannot change this prize" });
    return null;
  }
  return prize;
}

export const updatePrize = async (req, res, next) => {
  try {
    const data = prizeSchema.parse(req.body);
    const prize = await loadEditable(req, res);
    if (!prize) return;
    prize.title = data.title;
    prize.description = data.description ?? "";
    prize.forWhat = data.forWhat ?? "";
    await prize.save(); // the donor stays the same
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const deletePrize = async (req, res, next) => {
  try {
    const prize = await loadEditable(req, res);
    if (!prize) return;
    await prize.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
