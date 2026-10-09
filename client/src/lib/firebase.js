import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,

  onMessage,
  isSupported,
} from "firebase/messaging";
const k = import.meta.env.VITE_FIREBASE_API_KEY;

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});
// Uses the PWA service worker (sw.js), so there is only one worker on the site
export async function getFcmToken() {
  if (!(await isSupported())) {
    throw new Error("This browser does not support push notifications");
  }
  const registration = await navigator.serviceWorker.ready;
  const token = await getToken(getMessaging(app), {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error("Could not get a push token");
  return token;
}

// Returns an unsubscribe function (or a no-op when push is unsupported)
export async function onForegroundMessage(callback) {
  if (!(await isSupported())) return () => {};
  return onMessage(getMessaging(app), callback);
}
