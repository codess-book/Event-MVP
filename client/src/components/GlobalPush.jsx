import { useEffect } from "react";
import { useMe } from "../hooks/auth/useMe";
import { useForegroundPush } from "../hooks/notifications/useForegroundPush";
import { useNewNotificationSound } from "../hooks/notifications/useNewNotificationSound";
import { syncDeviceToken } from "../lib/push";

// Runs only while a user is logged in
function Listener({ userId }) {
  // Push arrives while the app is open: play the sound and refresh the bell list
  useForegroundPush();

  // A new item appears in the bell list (for example the user has push turned off): play the sound
  useNewNotificationSound();

  // If notifications are already allowed, register this device for the current account.
  // Runs again when a different user logs in on the same phone.
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      syncDeviceToken().catch(() => {});
    }
  }, [userId]);

  return null;
}

// Mount once in App.jsx, above <Routes>
export default function GlobalPush() {
  const { user } = useMe();
  if (!user) return null;
  return <Listener userId={user.id || user._id} />;
}