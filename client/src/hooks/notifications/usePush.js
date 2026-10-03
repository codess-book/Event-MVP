import { useState } from "react";
import { syncDeviceToken } from "../../lib/push";

export function usePush() {
  const supported = typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
  const [permission, setPermission] = useState(supported ? Notification.permission : "unsupported");

  // Must be called from a button tap, browsers block permission prompts otherwise
  const enable = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") await syncDeviceToken();
    return result;
  };

  return { supported, permission, enable };
}