import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 60 },
    body: { type: String, required: true, trim: true, maxlength: 200 },
  audience: { type: String, enum: ["all", "player", "member", "sponsor", "visitor", "user"], default: "all" },
    type: { type: String, enum: ["announcement", "offer", "prize"], default: "announcement" },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    excludeUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    link: { type: String, default: "/" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
// Old notifications are deleted after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model("Notification", notificationSchema);