import { api } from "./api";
import { getFcmToken } from "./firebase";

const TOKEN_KEY = "aaradhna_fcm";

// Gets this device's token and registers it with the server (safe to call many times)
export async function syncDeviceToken() {
  const token = await getFcmToken();
  if (!token) return;
  await api("/notifications/token", { method: "POST", body: { token } });
  localStorage.setItem(TOKEN_KEY, token);
}

// Best effort: call this BEFORE logout() because it still needs the auth token
export async function removeDeviceToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  try {
    await api("/notifications/token", { method: "DELETE", body: { token } });
  } catch {
    // Not critical: a stale token is cleaned up the next time a push fails
  }
  localStorage.removeItem(TOKEN_KEY);
}