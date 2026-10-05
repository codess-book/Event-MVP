import { z } from "zod";
import bcrypt from "bcryptjs"; // change to "bcrypt" if that is what your auth controller uses
import User from "../models/User.js";
import { publicUser } from "../utils/publicUser.js";

const createSchema = z.object({
  name: z.string().trim().min(2).max(60),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a 10 digit phone number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  businessName: z.string().trim().min(2).max(80),
  stallNumber: z.string().trim().max(10).optional(),
});

// POST /admin/food-partners
export const createFoodPartner = async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);

    if (await User.exists({ phone: data.phone })) {
      return res.status(409).json({ message: "This phone number is already registered" });
    }

    const user = await User.create({
      name: data.name,
      phone: data.phone,
      passwordHash: await bcrypt.hash(data.password, 12),
      userType: "foodPartner",
      businessName: data.businessName,
      stallNumber: data.stallNumber ?? "",
      isApproved: true,
    });

    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};