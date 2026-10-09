import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { initializeApp } from "firebase/app";
import { getMessaging ,onBackgroundMessage} from "firebase/messaging/sw";

// A new version takes over as soon as it is installed
self.skipWaiting();
clientsClaim();

// App shell (JS, CSS, HTML, icons) is cached at build time
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Page refreshes on /profile, /sponsors etc. open the app shell
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));

// Cloudinary photos: show the cached copy, refresh it in the background
registerRoute(
  ({ url }) => url.hostname === "res.cloudinary.com",
  new StaleWhileRevalidate({
    cacheName: "photos",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
);

// API calls are never cached on purpose, so users always see live data

// Background push: messages with a `notification` payload are shown by the browser
// and a tap opens the link the server set
initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});
const messaging = getMessaging();

// Server data-only push bhejta hai, isliye notification yahan manually dikhana padta hai.
// Firebase yeh tab hi call karta hai jab app ka koi window visible nahi hota.
onBackgroundMessage(messaging, (payload) => {
  const d = payload.data || {};
  return self.registration.showNotification(d.title || "Aaradhna", {
    body: d.body || "",
    icon: d.icon || "/pwa-192x192.png",
    badge: "/pwa-64x64.png",
    data: { link: d.link || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});