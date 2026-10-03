// models/ChallengeEntry.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "EventItem", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    photoUrl: { type: String, required: true },
    isWinner: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// Ek user, ek challenge, ek photo (dobara bhejne par replace)
schema.index({ challenge: 1, user: 1 }, { unique: true });

export default mongoose.model("ChallengeEntry", schema);