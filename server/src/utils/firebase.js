import admin from "firebase-admin";

let app;

export const isFcmConfigured = () => !!process.env.FIREBASE_SERVICE_ACCOUNT_B64;

// Initialised lazily, so the server still boots without Firebase keys in development
export function messaging() {
  if (!app) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
    app = admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json)) });
  }
  return admin.messaging(app);
}