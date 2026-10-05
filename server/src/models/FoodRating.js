import mongoose from "mongoose";

// One rating per user per stall (stars only, no free text, so nothing to moderate)
const foodRatingSchema = new mongoose.Schema(
  {
    stall: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

foodRatingSchema.index({ stall: 1, user: 1 }, { unique: true });

export default mongoose.model("FoodRating", foodRatingSchema);