import mongoose from "mongoose";

const resetRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "used"], default: "pending" },
    // Only the hash of the reset code is stored, never the code itself
    codeHash: { type: String, select: false },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resetRequestSchema.index({ phone: 1, status: 1 });

// Automatically delete requests 24 hours after creation
resetRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export default mongoose.model("ResetRequest", resetRequestSchema);