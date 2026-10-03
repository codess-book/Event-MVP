import mongoose from "mongoose";

const prizeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    // What the prize is for, e.g. "Best Dressed Couple"
    forWhat: { type: String, trim: true, maxlength: 60, default: "" },
    // Either a sponsor, or a plain name for a person who is not in the app
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    donorName: { type: String, trim: true, maxlength: 60, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
prizeSchema.index({ createdAt: -1 });
prizeSchema.index({ sponsor: 1 });

export default mongoose.model("Prize", prizeSchema);