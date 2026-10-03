import User from "../models/User.js";
import DeviceToken from "../models/DeviceToken.js";
import Notification from "../models/Notification.js";
import { isFcmConfigured, messaging } from "./firebase.js";

const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

// Saves the notification (bell list) and pushes it to matching devices.
// toUser = one person, audience = a group, excludeUser = skip the sender.
export async function notify({
  title, body, audience = "all", toUser, excludeUser, link = "/", type = "announcement", createdBy,
}) {
  await Notification.create({
    title, body, type, link, createdBy, excludeUser, toUser,
    audience: toUser ? "user" : audience,
  });

  if (!isFcmConfigured()) {
    return { pushed: false, sent: 0, devices: 0, message: "Saved in app. Push is not configured on the server." };
  }

  const conds = [];
  if (toUser) {
    conds.push({ user: toUser });
  } else {
    if (audience !== "all") {
      conds.push({ user: { $in: await User.find({ userType: audience }).distinct("_id") } });
    }
    if (excludeUser) conds.push({ user: { $ne: excludeUser } });
  }
  const filter = conds.length ? { $and: conds } : {};

  const tokens = (await DeviceToken.find(filter).select("token -_id").lean()).map((d) => d.token);

  let sent = 0;
  const dead = [];
  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500);
    const result = await messaging().sendEachForMulticast({
      tokens: chunk,
      notification: { title, body },
      data: { link },
      webpush: { fcmOptions: { link: `${process.env.CLIENT_URL}${link}` } },
    });
    sent += result.successCount;
    result.responses.forEach((r, idx) => {
      if (!r.success && DEAD_TOKEN_CODES.has(r.error?.code)) dead.push(chunk[idx]);
    });
  }
  if (dead.length) await DeviceToken.deleteMany({ token: { $in: dead } });

  return { pushed: true, sent, devices: tokens.length };
}