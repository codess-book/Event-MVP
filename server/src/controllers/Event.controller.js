// controllers/event.controller.js
import mongoose from "mongoose";
import { z } from "zod";
import eventItems from "../models/eventItems.js";
import { notify as sendNotify } from "../utils/notify.js";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time");
// Sirf Google Maps links (profile wale rule jaisa)
const mapLink = z.string().trim().max(300).refine(
  (v) => v === "" || /^https:\/\/(www\.google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/.test(v),
  { message: "Paste a Google Maps link" }
);

const base = {
  title: z.string().trim().min(2, "Title is too short").max(60),
  body: z.string().trim().max(300).default(""),
  notify: z.boolean().optional(),
};
const itemSchema = z.discriminatedUnion("kind", [
  z.object({ ...base, kind: z.literal("update"), category: z.enum(["dresscode", "challenge", "other"]), day }),
  z.object({ ...base, kind: z.literal("schedule"), day, time }),
  z.object({
    ...base,
    kind: z.literal("place"),
    category: z.enum(["washroom", "food", "water", "parking", "entry", "other"]),
    mapLink: mapLink.default(""),
  }),
]);


// Event type ke hisaab se notification ka text (title max 60, body max 200)
const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const buildMessage = (d) => {
  let icon, title = d.title, fallback;
  if (d.kind === "update") {
    icon = d.category === "dresscode" ? "👗" : d.category === "challenge" ? "🏆" : "📢";
    fallback = d.category === "dresscode" ? "Tap to see today's look"
      : d.category === "challenge" ? "Tap to join today's challenge"
      : "Tap to see details";
  } else if (d.kind === "schedule") {
    icon = "⏰";
    title = `${d.title} · ${fmtTime(d.time)}`;
    fallback = "Don't miss it";
  } else {
    icon = "📍";
    fallback = "Find it on the venue map";
  }
  return {
    title: `${icon} ${title}`.slice(0, 60),
    body: (d.body || fallback).slice(0, 200),
  };
};

// GET /event  (logged-in users) - data chhota hai, client filter karta hai
export const listEvent = async (req, res, next) => {
  try {
    const items = await eventItems.find().sort({ day: 1, time: 1, createdAt: 1 }).limit(300).lean();
    res.json({ items });
  } catch (err) { next(err); }
};

// POST /event  (admin)
export const createEvent = async (req, res, next) => {
  try {
    const { notify, ...data } = itemSchema.parse(req.body);
    const item = await eventItems.create(data);

    // Bell list + push dono, tumhare AdminNotify wale notify() se
    let push = null;
    if (notify) {
      try {
        push = await sendNotify({
          ...buildMessage(data),
          audience: "all",
          link: "/event",
          createdBy: req.user.id,
        });
      } catch (e) {
        // Event save ho chuka hai, bas notification fail hua
        push = { failed: true };
      }
    }
    res.status(201).json({ item, push });
  } catch (err) { next(err); }
};

// DELETE /event/:id  (admin)
export const deleteEvent = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid id" });
    const r = await eventItems.deleteOne({ _id: req.params.id });
    if (!r.deletedCount) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) { next(err); }
};