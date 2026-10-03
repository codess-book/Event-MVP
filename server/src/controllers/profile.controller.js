import { z } from "zod";
import User from "../models/User.js";
import { publicUser } from "../utils/publicUser.js";
import {
  isCloudinaryConfigured,
  cloudinaryUrlPrefix,
  signUploadParams,
} from "../utils/cloudinary.js";

const dateSchema = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  if (typeof v === "string") {
    return /^\d{4}-\d{2}-\d{2}$/.test(v)
      ? new Date(`${v}T23:59:59.999+05:30`)
      : new Date(v);
  }
  return v;
}, z.date({ message: "Enter a valid date" }).optional());
// Only Google Maps links are accepted, so nobody can store a random or unsafe link
const mapLinkSchema = z
  .string()
  .trim()
  .max(300)
  .refine(
    (v) =>
      v === "" ||
      /^https:\/\/(www\.google\.com\/maps|maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps)/.test(
        v,
      ),
    { message: "Paste a Google Maps link" },
  );
export const offerSchema = z.object({
  title: z.string().trim().min(3, "Offer title is too short").max(80),
  description: z.string().trim().max(300).optional(),
  code: z.string().trim().toUpperCase().max(20).optional(),
  validTill: dateSchema,
});

// The allowed fields depend on who is updating (sponsors get extra fields).
// The schema is built per request so the photo URL can be tied to this exact user.
const profileSchemaFor = (user) => {
  const photoUrl = z
    .string()
    .url()
    .refine(
      (url) =>
        url.startsWith(cloudinaryUrlPrefix()) &&
        url.includes(`/aaradh/profiles/u_${user._id}.`),
      { message: "Invalid photo URL" },
    );

  const base = {
    name: z.string().trim().min(2, "Name is too short").max(60).optional(),
    photoUrl: photoUrl.nullable().optional(), // null removes the photo
  };

  if (user.userType === "sponsor") {
    return z.object({
      ...base,
      businessName: z
        .string()
        .trim()
        .min(2, "Shop / business name is required")
        .max(80)
        .optional(),
    //   offer: offerSchema.nullable().optional(), // null removes the offer
      address: z.string().trim().max(200).optional(),
      mapLink: mapLinkSchema.optional(),
    });
  }

  // Unknown fields (phone, passNumber, role, offer for non-sponsors...) are stripped by zod
  return z.object(base);
};

// PATCH /profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("userType");
    if (!user)
      return res.status(401).json({ message: "User no longer exists" });

    const data = profileSchemaFor(user).parse(req.body);

    const $set = {};
    const $unset = {};

    if (data.name !== undefined) $set.name = data.name;
    if (data.photoUrl !== undefined) $set.photoUrl = data.photoUrl ?? "";

    if (user.userType === "sponsor") {
      if (data.businessName !== undefined)
        $set.businessName = data.businessName;
    //   if (data.offer === null) $unset.offer = 1;
      if (data.address !== undefined) $set.address = data.address;
      if (data.mapLink !== undefined) $set.mapLink = data.mapLink;
    //   else if (data.offer !== undefined) $set.offer = data.offer; // replaces the whole offer
    }

    if (!Object.keys($set).length && !Object.keys($unset).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const update = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    const updated = await User.findByIdAndUpdate(user._id, update, {
      new: true,
      runValidators: true,
    });

    res.json({ user: publicUser(updated) });
  } catch (err) {
    next(err);
  }
};

// POST /profile/photo-signature
// Gives the browser everything it needs to upload one photo directly to Cloudinary.
export const getPhotoSignature = (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res
      .status(503)
      .json({ message: "Photo upload is not available right now" });
  }

  const params = {
    allowed_formats: "jpg,jpeg,png,webp,heic",
    // One fixed id per user, so a new upload replaces the old photo
    public_id: `aaradh/profiles/u_${req.user.id}`,
    timestamp: Math.round(Date.now() / 1000),
    // Shrinks huge phone photos before they are stored
    transformation: "c_limit,w_1200,h_1200",
  };

  res.json({
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    // The client must send all of these as form fields, along with the file
    fields: {
      ...params,
      api_key: process.env.CLOUDINARY_API_KEY,
      signature: signUploadParams(params),
    },
  });
};
