import jwt from "jsonwebtoken";

// Creates a 30 day token. The token carries only the user id and role.
export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });