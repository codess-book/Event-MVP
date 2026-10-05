import { useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";
import { playNotifySound } from "../../lib/notifySound";

// Plays the sound when a new item shows up in the bell list (no sound on the first load)
export function useNewNotificationSound() {
  const { notifications, isLoading } = useNotifications();
  const latest = useRef(null);

  useEffect(() => {
    if (isLoading) return;
    const newest = notifications.reduce(
      (max, n) => Math.max(max, new Date(n.createdAt).getTime()),
      0,
    );
    if (latest.current === null) {
      latest.current = newest; // first load: remember, do not play
      return;
    }
    if (newest > latest.current) {
      latest.current = newest;
      playNotifySound();
    }
  }, [notifications, isLoading]);
}
