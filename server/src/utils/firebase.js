import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

export const isFcmConfigured = () => !!process.env.FIREBASE_SERVICE_ACCOUNT_B64;

// Initialised lazily, so the server still boots without Firebase keys in development
export function messaging() {
  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert(
          JSON.parse(
            Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8"),
          ),
        ),
      });
  return getMessaging(app);
}