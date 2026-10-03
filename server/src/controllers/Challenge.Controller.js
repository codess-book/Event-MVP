// controllers/challenge.controller.js
import mongoose from "mongoose";
import { z } from "zod";
import eventItems from "../models/eventItems.js";
import ChallengeEntry from "./ChallengeEntry.js";
import User from "../models/User.js";
import { notify as sendNotify } from "../utils/notify.js";
import {
  isCloudinaryConfigured,
  cloudinaryUrlPrefix,
  signUploadParams,
} from "../utils/cloudinary.js";

const todayIST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const validId = (id) => mongoose.isValidObjectId(id);
const publicIdFor = (cid, uid) => `aaradh/challenges/c_${cid}_u_${uid}`;

// Photo sirf aaj ke challenge ke liye bheji ja sakti hai
const findOpenChallenge = (id) =>
  validId(id)
    ? eventItems.findOne({
        _id: id,
        kind: "update",
        category: "challenge",
        day: todayIST(),
      }).lean()
    : null;

// POST /challenges/:id/signature
export const getSignature = async (req, res, next) => {
  try {
    if (!isCloudinaryConfigured())
      return res
        .status(503)
        .json({ message: "Photo upload is not available right now" });
    const ch = await findOpenChallenge(req.params.id);
    if (!ch)
      return res
        .status(404)
        .json({ message: "This challenge is not open today" });

    const params = {
      allowed_formats: "jpg,jpeg,png,webp,heic",
      public_id: publicIdFor(ch._id, req.user.id), // fixed id: nayi photo purani ko replace karti hai
      timestamp: Math.round(Date.now() / 1000),
      transformation: "c_limit,w_1200,h_1200",
    };
    res.json({
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      fields: {
        ...params,
        api_key: process.env.CLOUDINARY_API_KEY,
        signature: signUploadParams(params),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /challenges/:id/entry  { photoUrl }
export const submitEntry = async (req, res, next) => {
  try {
    const { photoUrl } = z
      .object({ photoUrl: z.string().url() })
      .parse(req.body);
    const ch = await findOpenChallenge(req.params.id);
    if (!ch)
      return res
        .status(404)
        .json({ message: "This challenge is not open today" });

    // URL isi user aur isi challenge ki upload ki honi chahiye
    if (
      !photoUrl.startsWith(cloudinaryUrlPrefix()) ||
      !photoUrl.includes(`/${publicIdFor(ch._id, req.user.id)}.`)
    )
      return res.status(400).json({ message: "Invalid photo URL" });

    const entry = await ChallengeEntry.findOneAndUpdate(
      { challenge: ch._id, user: req.user.id },
      { $set: { photoUrl, isWinner: false } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
};

// GET /challenges/mine
export const myEntries = async (req, res, next) => {
  try {
    const entries = await ChallengeEntry.find({ user: req.user.id })
      .select("challenge photoUrl isWinner")
      .lean();
    res.json({ entries });
  } catch (err) {
    next(err);
  }
};

// GET /challenges/winners  (sabko dikhta hai)
export const listWinners = async (req, res, next) => {
  try {
    const docs = await ChallengeEntry.find({ isWinner: true })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("user", "name")
      .populate("challenge", "title day")
      .lean();
    res.json({
      winners: docs
        .filter((d) => d.challenge && d.user)
        .map((d) => ({
          id: d._id,
          photoUrl: d.photoUrl,
          name: d.user.name,
          title: d.challenge.title,
          day: d.challenge.day,
        })),
    });
  } catch (err) {
    next(err);
  }
};

// ---------- admin ----------
// GET /challenges/:id/entries
export const adminEntries = async (req, res, next) => {
  try {
    if (!validId(req.params.id))
      return res.status(400).json({ message: "Invalid id" });
    const entries = await ChallengeEntry.find({ challenge: req.params.id })
      .sort({ updatedAt: -1 })
      .limit(300)
      .populate("user", "name phone userType passNumber")
      .lean();
    res.json({ entries });
  } catch (err) {
    next(err);
  }
};

// DELETE /challenges/entries/:entryId
export const deleteEntry = async (req, res, next) => {
  try {
    if (!validId(req.params.entryId))
      return res.status(400).json({ message: "Invalid id" });
    const r = await ChallengeEntry.deleteOne({ _id: req.params.entryId });
    if (!r.deletedCount) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// POST /challenges/entries/:entryId/winner  (ek challenge ka ek hi winner)
export const setWinner = async (req, res, next) => {
  try {
    if (!validId(req.params.entryId))
      return res.status(400).json({ message: "Invalid id" });
    const entry = await ChallengeEntry.findById(req.params.entryId);
    if (!entry) return res.status(404).json({ message: "Not found" });

    await ChallengeEntry.updateMany(
      { challenge: entry.challenge, _id: { $ne: entry._id } },
      { isWinner: false },
    );
    entry.isWinner = true;
    await entry.save();

    const [ch, winner] = await Promise.all([
      eventItems.findById(entry.challenge).select("title").lean(),
      User.findById(entry.user).select("name").lean(),
    ]);

    // Sabko: bell list + push (winner ko bhi, congratulations ke saath)
    let push = null;
    try {
      push = await sendNotify({
        title: `🏆 Winner: ${winner?.name || "Player"}`.slice(0, 60),
        body: `Congratulations! Won "${ch?.title || "today's challenge"}". Tap to see the photo.`.slice(
          0,
          200,
        ),
        audience: "all",
        link: "/challenges",
        createdBy: req.user.id,
      });
    } catch {
      push = { failed: true }; // winner save ho chuka hai
    }
    res.json({ ok: true, push });
  } catch (err) {
    next(err);
  }
};
