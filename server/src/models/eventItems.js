import mongoose from "mongoose";
 
const eventItemSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["update", "schedule", "place"], required: true },
    // update: dresscode | challenge | other   place: washroom | food | water | parking | entry | other
    category: { type: String, default: "" },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    body: { type: String, trim: true, maxlength: 300, default: "" },
    day: { type: String, default: "" },   // "YYYY-MM-DD" (update + schedule)
    time: { type: String, default: "" },  // "HH:mm" (schedule)
    mapLink: { type: String, default: "" }, // place
  },
  { timestamps: true }
);
eventItemSchema.index({ kind: 1, day: 1, time: 1 });
 
export default mongoose.model("EventItem", eventItemSchema);
 