import mongoose from "mongoose";

// Sponsor offer shown to visitors in the app
const offerSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 300 },
  code: { type: String, trim: true, uppercase: true, maxlength: 20 },
  validTill: { type: Date },
});

// Food stall menu item
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  price: { type: Number, required: true, min: 0, max: 100000 },
  category: { type: String, trim: true, maxlength: 30, default: "" },
  available: { type: Boolean, default: true }, // false = sold out
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    phone: { type: String, required: true, unique: true },
    // select: false keeps the hash out of normal queries
    passwordHash: { type: String, required: true, select: false },

    userType: {
      type: String,
      enum: ["player", "member", "sponsor", "visitor", "foodPartner"],
      required: true,
    },

    // Profile photo (Cloudinary URL). For sponsors this is the shop logo/photo.
    photoUrl: { type: String, default: "" },

    // Player-only fields
    passNumber: { type: String },
    gender: { type: String, enum: ["male", "female"] },

    // Sponsor-only fields
    businessName: { type: String, trim: true },
    sponsorCategory: { type: String, default: "" }, // assigned later by an admin
    address: { type: String, trim: true, maxlength: 200, default: "" },
    mapLink: { type: String, trim: true, maxlength: 300, default: "" },
    links: {
      website: { type: String, trim: true, maxlength: 200, default: "" },
      instagram: { type: String, trim: true, maxlength: 200, default: "" },
      facebook: { type: String, trim: true, maxlength: 200, default: "" },
      youtube: { type: String, trim: true, maxlength: 200, default: "" },
      whatsapp: { type: String, trim: true, maxlength: 15, default: "" },
    },
    offers: { type: [offerSchema], default: [] },
    // Food-partner-only fields
    stallNumber: { type: String, trim: true, maxlength: 10, default: "" },
    isOpen: { type: Boolean, default: true },
    menu: { type: [menuItemSchema], default: [] },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
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

// // One pass number can belong to only one player
// userSchema.index(
//   { passNumber: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       userType: "player",
//       passNumber: { $type: "string" },
//     },
//   },
// );

export default mongoose.model("User", userSchema);
