import { useEffect } from "react";
import { mutate } from "swr";
import { onForegroundMessage } from "../../lib/firebase";

const playSound = () => {
  try {
    new Audio("/jai-mata-di.mp3").play().catch(() => {}); // browser can block it before the first tap
  } catch {
    /* ignore */
  }
};

// App open: play the sound and refresh the bell list when a push arrives
export function useForegroundPush() {
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    onForegroundMessage(() => {
      playSound();
      navigator.vibrate?.(200);
      mutate("/notifications");
    }).then((u) => {
      if (active) unsubscribe = u;
      else u();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
}