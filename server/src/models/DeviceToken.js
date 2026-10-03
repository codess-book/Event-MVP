import mongoose from "mongoose";

// One row per browser/device. A token that is not refreshed for 60 days is removed automatically.
const deviceTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  token: { type: String, required: true, unique: true },
  lastSeen: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 60 },
});

export default mongoose.model("DeviceToken", deviceTokenSchema);