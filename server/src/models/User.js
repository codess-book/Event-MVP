import mongoose from "mongoose";

// Sponsor offer shown to visitors in the app
const offerSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 300 },
  code: { type: String, trim: true, uppercase: true, maxlength: 20 },
  validTill: { type: Date },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    phone: { type: String, required: true, unique: true },
    // select: false keeps the hash out of normal queries
    passwordHash: { type: String, required: true, select: false },

    userType: {
      type: String,
     enum: ["player", "member", "sponsor", "visitor"],
      required: true,
    },

    // Profile photo (Cloudinary URL). For sponsors this is the shop logo/photo.
    photoUrl: { type: String, default: "" },

    // Player-only fields
    passNumber: { type: String},
    gender: { type: String, enum: ["male", "female"] },

    // Sponsor-only fields
    businessName: { type: String, trim: true },
    sponsorCategory: { type: String, default: "" }, // assigned later by an admin
    address: { type: String, trim: true, maxlength: 200, default: "" },
    mapLink: { type: String, trim: true, maxlength: 300, default: "" },
    offers: { type: [offerSchema], default: [] },

    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Sponsors start unapproved and are approved by an admin
    isApproved: { type: Boolean, default: true },

    // Brute-force protection
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastOfferNotifyAt: { type: Date },
  },
  { timestamps: true },
);

// One pass number can belong to only one player
userSchema.index(
  { passNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userType: "player",
      passNumber: { $type: "string" },
    },
  },
);

export default mongoose.model("User", userSchema);
