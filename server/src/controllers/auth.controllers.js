import bcrypt from "bcrypt";
import { z } from "zod";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { publicUser } from "../utils/publicUser.js";
// Accepts "+91 98765 43210", "09876543210" etc. and normalizes to 10 digits
export const phoneSchema = z.preprocess(
  (v) =>
    typeof v === "string"
      ? v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "")
      : v,
  z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
);

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password is too long"); // bcrypt only uses the first 72 bytes

// Fields shared by every user type
const base = {
  name: z.string().trim().min(2, "Name is too short").max(60),
  phone: phoneSchema,
  password: passwordSchema,
};

// The extra required fields depend on the selected userType
const registerSchema = z.discriminatedUnion("userType", [
  z.object({
    ...base,
    userType: z.literal("player"),
    passNumber: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "Pass number is required")
      .max(10),
    gender: z.enum(["male", "female"]),
  }),
  z.object({ ...base, userType: z.literal("member") }),
  z.object({ ...base, userType: z.literal("visitor") }),
  z.object({
    ...base,
    userType: z.literal("sponsor"),
    businessName: z
      .string()
      .trim()
      .min(2, "Shop / business name is required")
      .max(80),
  }),
]);

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Password is required").max(72),
});

// A real hash used to keep response time equal when the phone number is unknown
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10);

export const register = async (req, res, next) => {
  try {
    // zod strips unknown fields, so a client cannot set "role" itself
    const data = registerSchema.parse(req.body);
    const { password, ...rest } = data;
    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await User.create({
        ...rest,
        passwordHash,
        // Sponsors must be approved by an admin before they appear in the app
        isApproved: data.userType !== "sponsor",
      });
    } catch (err) {
      // Duplicate key: phone number or pass number already used
      //   if (err.code === 11000) {
      //     const msg = err.keyPattern?.passNumber
      //       ? "This pass number is already registered"
      //       : "This mobile number is already registered";
      //     return res.status(409).json({ message: msg });
      //   }
      //   throw err;
      // }
      if (err.code === 11000) {
        if (err.keyPattern?.phone) {
          return res.status(409).json({
            message: "This mobile number is already registered",
          });
        }
      }
      throw err;
    }

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ phone }).select("+passwordHash");

    // Same message for unknown phone and wrong password
    const invalid = () =>
      res.status(401).json({ message: "Invalid mobile number or password" });

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH); // keeps timing similar
      return invalid();
    }

    // Account is temporarily locked after too many wrong attempts
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res
        .status(429)
        .json({ message: "Too many wrong attempts. Try again in 15 minutes." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      // Atomic increment avoids a race between parallel login attempts
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { failedAttempts: 1 } },
        { new: true },
      );
      if (updated.failedAttempts >= 5) {
        await User.updateOne(
          { _id: user._id },
          {
            failedAttempts: 0,
            lockUntil: new Date(Date.now() + 15 * 60 * 1000),
          },
        );
      }
      return invalid();
    }

    // Successful login clears the failed attempt counter and any lock
    if (user.failedAttempts || user.lockUntil) {
      await User.updateOne(
        { _id: user._id },
        { failedAttempts: 0, $unset: { lockUntil: 1 } },
      );
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// Returns the currently logged-in user
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(401).json({ message: "User no longer exists" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
