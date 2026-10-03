import crypto from "node:crypto";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { z } from "zod";
import User from "../models/User.js";
import ResetRequest from "../models/ResetRequest.js";
import { phoneSchema ,passwordSchema } from "./auth.controllers.js";
const forgotSchema = z.object({ phone: phoneSchema });

const resetSchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
  password: passwordSchema,
});

const changeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(72),
  newPassword: passwordSchema,
});

// Step 1 (user): request a password reset
export const requestReset = async (req, res, next) => {
  try {
    const { phone } = forgotSchema.parse(req.body);
    const user = await User.findOne({ phone }).select("_id");

    if (user) {
      // Do not create duplicate requests while one is still open
      const open = await ResetRequest.findOne({
        user: user._id,
        status: { $in: ["pending", "approved"] },
      });
      if (!open) await ResetRequest.create({ user: user._id, phone });
    }

    // Same response whether or not the number is registered,
    // so nobody can use this endpoint to check who has an account
    res.json({
      message: "Request sent. Please contact the core team to get your reset code.",
    });
  } catch (err) {
    next(err);
  }
};

// Step 2 (admin): list open reset requests
export const listResetRequests = async (req, res, next) => {
  try {
    const requests = await ResetRequest.find({ status: { $in: ["pending", "approved"] } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "name phone userType passNumber businessName")
      .lean();
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

// Step 3 (admin): approve a request and generate a one-time 6 digit code.
// The code is returned only once, here; only its hash is stored.
export const approveResetRequest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }
    const request = await ResetRequest.findById(req.params.id);
    if (!request || request.status === "used") {
      return res.status(404).json({ message: "Request not found" });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    request.codeHash = await bcrypt.hash(code, 10);
    request.status = "approved";
    request.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // valid for 30 minutes
    request.attempts = 0;
    await request.save();

    res.json({ code, expiresInMinutes: 30 });
  } catch (err) {
    next(err);
  }
};

// Step 4 (user): set a new password using the code given by the admin
export const resetPasswordWithCode = async (req, res, next) => {
  try {
    const { phone, code, password } = resetSchema.parse(req.body);
    const invalid = () => res.status(400).json({ message: "Invalid or expired code" });

    const request = await ResetRequest.findOne({
      phone,
      status: "approved",
      expiresAt: { $gt: new Date() },
    }).select("+codeHash");

    // After 5 wrong guesses the code is dead
    if (!request || request.attempts >= 5) return invalid();

    const ok = await bcrypt.compare(code, request.codeHash);
    if (!ok) {
      await ResetRequest.updateOne({ _id: request._id }, { $inc: { attempts: 1 } });
      return invalid();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: request.user },
      { passwordHash, failedAttempts: 0, $unset: { lockUntil: 1 } }
    );

    // The code can be used only once
    request.status = "used";
    request.codeHash = undefined;
    await request.save();

    res.json({ message: "Password updated. Please login with your new password." });
  } catch (err) {
    next(err);
  }
};

// Logged-in user changes their own password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changeSchema.parse(req.body);
    const user = await User.findById(req.user.id).select("+passwordHash");

    // Return 400 (not 401) so the frontend does not treat this as an expired session
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed" });
  } catch (err) {
    next(err);
  }
};