import { useEffect } from "react";
import { mutate } from "swr";
import { onForegroundMessage } from "../../lib/firebase";
import { playNotifySound, unlockAudio } from "../../lib/notifySound";

export function useForegroundPush() {
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio, { once: true });

    let active = true;
    let unsubscribe = () => {};

    onForegroundMessage(() => {
      playNotifySound();
      mutate("/notifications");
    })
      .then((u) => {
        if (active) unsubscribe = u;
        else u();
      })
      .catch(() => {});

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener("pointerdown", unlockAudio);
    };
  }, []);
}