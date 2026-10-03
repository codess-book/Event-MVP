import { z } from "zod";
import User from "../models/User.js";
import DeviceToken from "../models/DeviceToken.js";
import Notification from "../models/Notification.js";
import { isFcmConfigured, messaging } from "../utils/firebase.js";
import { notify } from "../utils/notify.js";
const tokenSchema = z.object({ token: z.string().trim().min(20).max(4096) });

const sendSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(60),
  body: z.string().trim().min(2, "Message is too short").max(200),
  audience: z.enum(["all", "player", "member", "sponsor"]),
  // Only in-app paths are allowed, never external links
  link: z
    .string()
    .trim()
    .max(100)
    .regex(/^\/[\w\-/]*$/, "Link must be an app path like /sponsors")
    .optional(),
});

const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

// Save (or move) a device token to the logged-in user
export const saveToken = async (req, res, next) => {
  try {
    const { token } = tokenSchema.parse(req.body);
    await DeviceToken.findOneAndUpdate(
      { token },
      { user: req.user.id, lastSeen: new Date() },
      { upsert: true },
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// Called on logout so this device stops receiving the old user's notifications
export const removeToken = async (req, res, next) => {
  try {
    const { token } = tokenSchema.parse(req.body);
    await DeviceToken.deleteOne({ token, user: req.user.id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
export const sendNotification = async (req, res, next) => {
  try {
    const { title, body, audience, link } = sendSchema.parse(req.body);
    const result = await notify({
      title,
      body,
      audience,
      link: link || "/",
      createdBy: req.user.id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const listNotifications = async (req, res, next) => {
  try {
    const me = await User.findById(req.user.id).select("userType");
    if (!me) return res.status(401).json({ message: "User no longer exists" });

    const docs = await Notification.find({
      excludeUser: { $ne: me._id },
      $or: [{ audience: { $in: ["all", me.userType] } }, { toUser: me._id }],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({
      notifications: docs.map((n) => ({
        id: n._id,
        title: n.title,
        body: n.body,
        type: n.type,
        link: n.link,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};
