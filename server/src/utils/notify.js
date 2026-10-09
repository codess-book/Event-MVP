import User from "../models/User.js";
import DeviceToken from "../models/DeviceToken.js";
import Notification from "../models/Notification.js";
import { isFcmConfigured, messaging } from "./firebase.js";

const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

const siteUrl = () =>
  (process.env.CLIENT_URL || "https://www.aaradhna.site").replace(/\/+$/, "");

// One place that builds the push, so admin sends and the test button look the same
export const buildPush = ({ title, body, link = "/" }) => ({
  data: {
    title: `🙏 जय माता दी | ${title}`,
    body,
    link,
    icon: `${siteUrl()}/pwa-192x192.png`,
  },
  webpush: { headers: { Urgency: "high", TTL: "3600" } },
});

// Saves the notification (bell list) and pushes it to matching devices.
// toUser = one person, audience = a group, excludeUser = skip the sender.
export async function notify({
  title,
  body,
  audience = "all",
  toUser,
  excludeUser,
  link = "/",
  type = "announcement",
  createdBy,
}) {
  await Notification.create({
    title,
    body,
    type,
    link,
    createdBy,
    excludeUser,
    toUser,
    audience: toUser ? "user" : audience,
  });

  if (!isFcmConfigured()) {
    return {
      pushed: false,
      sent: 0,
      devices: 0,
      message: "Saved in app. Push is not configured on the server.",
    };
  }

  const conds = [];
  if (toUser) {
    conds.push({ user: toUser });
  } else {
    if (audience !== "all") {
      conds.push({
        user: { $in: await User.find({ userType: audience }).distinct("_id") },
      });
    }
    if (excludeUser) conds.push({ user: { $ne: excludeUser } });
  }
  const filter = conds.length ? { $and: conds } : {};

  // Same token twice = same device twice = duplicate notification, so dedupe
  const tokens = [
    ...new Set(
      (await DeviceToken.find(filter).select("token -_id").lean()).map(
        (d) => d.token,
      ),
    ),
  ];

  let sent = 0;
  const dead = [];
  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500);
    try {
      const result = await messaging().sendEachForMulticast({
        tokens: chunk,
        ...buildPush({ title, body, link }),
      });
      sent += result.successCount;
      result.responses.forEach((r, idx) => {
        if (!r.success && DEAD_TOKEN_CODES.has(r.error?.code))
          dead.push(chunk[idx]);
      });
    } catch (e) {
      // One failed chunk must not stop the rest
      console.error("[notify] chunk failed:", e.message);
    }
  }
  if (dead.length) await DeviceToken.deleteMany({ token: { $in: dead } });

  return { pushed: true, sent, devices: tokens.length };
}

// Never throws, so it can never break the request that called it
export const notifySafe = (opts) =>
  notify(opts).catch((e) => console.error("[notify] failed:", e?.message || e));

// Has this user already sent this type of notification in the last few minutes?
// Used so a sponsor cannot spam everyone.
export const recentlySent = async ({ createdBy, type, minutes = 10 }) =>
  !!(await Notification.exists({
    createdBy,
    type,
    createdAt: { $gte: new Date(Date.now() - minutes * 60 * 1000) },
  }));