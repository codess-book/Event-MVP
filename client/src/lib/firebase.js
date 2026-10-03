import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export async function getFcmToken() {
  if (!(await isSupported())) return null;
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  return getToken(getMessaging(app), {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

// Returns an unsubscribe function (or a no-op when push is unsupported)
export async function onForegroundMessage(callback) {
  if (!(await isSupported())) return () => {};
  return onMessage(getMessaging(app), callback);
}