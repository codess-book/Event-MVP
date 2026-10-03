import User from "../models/User.js";

// Only safe fields: no phone, no pass number
export const listMembers = async (req, res, next) => {
  try {
    const docs = await User.find({ userType: "member", isApproved: true })
      .select("name photoUrl phone")
      .sort({ name: 1 })
      .limit(200)
      .lean();

    res.json({
      members: docs.map((m) => ({ id: m._id, name: m.name, photoUrl: m.photoUrl || "", phone: m.phone }))
    });
  } catch (err) {
    next(err);
  }
};