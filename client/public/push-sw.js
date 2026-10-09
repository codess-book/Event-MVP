// FCM data-only push ko handle karta hai (app background ya closed ho tab bhi)
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }
  const d = payload.data || payload.notification || payload;

  event.waitUntil(
    (async () => {
      const wins = await clients.matchAll({ type: "window", includeUncontrolled: true });

      // App khula aur visible hai: foreground handler (onMessage) ko bhejo, popup mat dikhao
      const visible = wins.filter((w) => w.visibilityState === "visible");
      if (visible.length) {
        visible.forEach((w) =>
          w.postMessage({
            "firebase-messaging-msg-type": "push-msg-received",
            "firebase-messaging-msg-data": payload,
          }),
        );
        return;
      }

      await self.registration.showNotification(d.title || "Aaradhna", {
        body: d.body || "",
        icon: d.icon || "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        data: { link: d.link || "/" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/", self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});