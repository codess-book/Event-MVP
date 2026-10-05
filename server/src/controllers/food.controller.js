import mongoose from "mongoose";
import { z } from "zod";
import User from "../models/User.js";
import FoodRating from "../models/FoodRating.js";
import { publicUser, publicStall } from "../utils/publicUser.js";

const MAX_MENU_ITEMS = 40;

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Item name is too short").max(60),
  price: z
    .number({ message: "Enter a valid price" })
    .int("Price must be a whole number")
    .min(0)
    .max(100000),
  category: z.string().trim().max(30).optional(),
  available: z.boolean().optional(),
});

// For edits / sold-out toggle: any subset of fields, but not empty
const menuPatchSchema = menuItemSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, { message: "Nothing to update" });

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
});

// Loads the logged-in food partner, or sends the error and returns null
async function loadStall(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401).json({ message: "User no longer exists" });
    return null;
  }
  if (user.userType !== "foodPartner") {
    res.status(403).json({ message: "Only food partners can manage a menu" });
    return null;
  }
  return user;
}

const validItemId = (req, res) => {
  if (!mongoose.isValidObjectId(req.params.itemId)) {
    res.status(400).json({ message: "Invalid item id" });
    return false;
  }
  return true;
};

// POST /profile/menu
export const addMenuItem = async (req, res, next) => {
  try {
    const data = menuItemSchema.parse(req.body);
    const user = await loadStall(req, res);
    if (!user) return;
    if (user.menu.length >= MAX_MENU_ITEMS) {
      return res
        .status(400)
        .json({ message: `You can add up to ${MAX_MENU_ITEMS} items` });
    }
    user.menu.push({
      name: data.name,
      price: data.price,
      category: data.category ?? "",
      available: data.available ?? true,
    });
    await user.save();
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// PATCH /profile/menu/:itemId  (edit item or toggle sold out)
export const updateMenuItem = async (req, res, next) => {
  try {
    if (!validItemId(req, res)) return;
    const data = menuPatchSchema.parse(req.body);
    const user = await loadStall(req, res);
    if (!user) return;
    const item = user.menu.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (data.name !== undefined) item.name = data.name;
    if (data.price !== undefined) item.price = data.price;
    if (data.category !== undefined) item.category = data.category;
    if (data.available !== undefined) item.available = data.available;
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// DELETE /profile/menu/:itemId
export const deleteMenuItem = async (req, res, next) => {
  try {
    if (!validItemId(req, res)) return;
    const user = await loadStall(req, res);
    if (!user) return;
    if (!user.menu.id(req.params.itemId)) {
      return res.status(404).json({ message: "Item not found" });
    }
    user.menu.pull(req.params.itemId);
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /food-stalls  (logged-in users)
export const listStalls = async (req, res, next) => {
  try {
    const stalls = await User.find({ userType: "foodPartner", isApproved: true })
      .select(
        "businessName name stallNumber isOpen photoUrl menu ratingAvg ratingCount",
      )
      .collation({ locale: "en", numericOrdering: true })
      .sort({ stallNumber: 1 })
      .lean();

    const mine = await FoodRating.find({
      user: req.user.id,
      stall: { $in: stalls.map((s) => s._id) },
    })
      .select("stall stars")
      .lean();
    const myMap = new Map(mine.map((r) => [String(r.stall), r.stars]));

    res.json({
      stalls: stalls.map((s) => publicStall(s, myMap.get(String(s._id)) || 0)),
    });
  } catch (err) {
    next(err);
  }
};

// PUT /food-stalls/:id/rating   body: { stars: 1..5 }
export const rateStall = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid stall id" });
    }
    const { stars } = ratingSchema.parse(req.body);

    const [rater, stall] = await Promise.all([
      User.findById(req.user.id).select("userType"),
      User.findOne({ _id: id, userType: "foodPartner", isApproved: true }).select(
        "_id",
      ),
    ]);
    if (!rater) return res.status(401).json({ message: "User no longer exists" });
    if (!stall) return res.status(404).json({ message: "Stall not found" });
    // Stalls cannot rate themselves or each other
    if (rater.userType === "foodPartner") {
      return res.status(403).json({ message: "Food partners cannot rate stalls" });
    }

    // One rating per user per stall: rating again just updates it
    await FoodRating.findOneAndUpdate(
      { stall: stall._id, user: rater._id },
      { stars },
      { upsert: true, setDefaultsOnInsert: true },
    );

    const [agg] = await FoodRating.aggregate([
      { $match: { stall: stall._id } },
      { $group: { _id: null, avg: { $avg: "$stars" }, count: { $sum: 1 } } },
    ]);
    const ratingAvg = agg ? Math.round(agg.avg * 10) / 10 : 0;
    const ratingCount = agg ? agg.count : 0;
    await User.updateOne({ _id: stall._id }, { ratingAvg, ratingCount });

    res.json({ ratingAvg, ratingCount, myRating: stars });
  } catch (err) {
    next(err);
  }
};