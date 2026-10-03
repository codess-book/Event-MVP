import rateLimit from "express-rate-limit";

// General API limit. Limits are generous because many people at the venue
// share the same network IP, and strict limits would block real users.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down" },
});

// Flood protection for login/register. Real password protection comes from
// the per-account lockout, so this limit can be high.
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  skip: (req) => req.path === "/me", // the "who am I" call is not limited
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in a few minutes" },
});

// Kept for the voting feature we will reconnect later
export const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please wait a minute" },
});

// Limits photo upload signatures per user (not per IP, because many people share the venue network)
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => req.user.id,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many uploads, please try again in a few minutes" },
});