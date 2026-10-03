import { useEffect } from "react";
import { mutate } from "swr";
import { syncDeviceToken } from "../lib/push";
import { onForegroundMessage } from "../lib/firebase";

export default function PushSync() {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    syncDeviceToken().catch((e) => console.error("[push] token failed:", e)) // refreshes the token on every app open

    let off = () => {};
    let alive = true;
    // When the app is open the browser shows nothing, so just refresh the bell list
    onForegroundMessage(() => mutate("/notifications")).then((unsub) => {
      if (alive) off = unsub;
      else unsub();
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  return null;
}