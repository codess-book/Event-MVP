import crypto from "node:crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import ResetRequest from "../../models/ResetRequest.js";

const TYPES = ["player", "member", "sponsor", "foodPartner", "visitor"];
const notAdmin = { role: { $ne: "admin" } }; // admin accounts is panel se touch nahi hote
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const bad = (res) => res.status(400).json({ message: "Invalid user id" });

// GET /admin/users?type=&status=&q=&page=
export const listUsers = async (req, res, next) => {
  try {
    const { type, status, q } = req.query;
    const filter = { ...notAdmin };
    if (TYPES.includes(type)) filter.userType = type;
    if (status === "approved") filter.isApproved = true;
    if (status === "pending") filter.isApproved = { $ne: true };
    if (q) {
      const rx = new RegExp(esc(String(q).slice(0, 50)), "i");
      filter.$or = [{ name: rx }, { phone: rx }, { businessName: rx }];
    }
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-passwordHash")
        .lean(),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /admin/users/stats
export const userStats = async (req, res, next) => {
  try {
    const rows = await User.aggregate([
      { $match: notAdmin },
      { $group: { _id: { t: "$userType", a: "$isApproved" }, n: { $sum: 1 } } },
    ]);
    // const byType = Object.fromEntries(
    //   TYPES.map((t) => [t, { total: 0, pending: 0 }]),
    // );
    const byType = Object.fromEntries(
      TYPES.map((t) => [t, { total: 0, pending: 0 }]),
    );

    let total = 0;
    for (const { _id, n } of rows) {
      total += n;
      if (!byType[_id.t]) continue;
      byType[_id.t].total += n;
      if (_id.a !== true) byType[_id.t].pending += n;
    }
    res.json({ total, byType });
  } catch (err) {
    next(err);
  }
};

// GET /admin/users/:id
export const getUser = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res);
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/users/:id  { isApproved: boolean }
export const setApproval = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res);
    if (typeof req.body.isApproved !== "boolean")
      return res.status(400).json({ message: "isApproved must be true/false" });

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, ...notAdmin },
      { isApproved: req.body.isApproved },
      { new: true },
    ).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.isApproved) {
      await Notification.create({
        title: "Account approved",
        body: "Your account has been approved. Welcome aboard!",
        audience: "user",
        type: "account",
        toUser: user._id,
        link: "/profile",
        createdBy: req.user.id,
      });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /admin/users/:id/reset-password -> temp password (sirf ek baar dikhega)
export const resetUserPassword = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res);
    // "Aa1!" isliye ki passwordSchema ke rules pass ho jayein; zarurat ho to badlo
    const tempPassword = crypto.randomBytes(5).toString("hex") + "Aa1!";
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const r = await User.updateOne(
      { _id: req.params.id, ...notAdmin },
      { passwordHash, failedAttempts: 0, $unset: { lockUntil: 1 } },
    );
    if (!r.matchedCount)
      return res.status(404).json({ message: "User not found" });
    await ResetRequest.updateMany(
      { user: req.params.id, status: { $in: ["pending", "approved"] } },
      { status: "used", $unset: { codeHash: 1 } },
    );
    res.json({ tempPassword });
  } catch (err) {
    next(err);
  }
};
