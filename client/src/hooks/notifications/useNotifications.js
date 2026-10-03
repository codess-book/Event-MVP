import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { post } from "../../lib/api";

const SEEN_KEY = "aaradhna_notif_seen";

// No polling: the list refreshes on focus and whenever a push arrives
export function useNotifications() {
  const { data, error, isLoading } = useSWR("/notifications");
  const notifications = data?.notifications ?? [];
  const seen = Number(localStorage.getItem(SEEN_KEY) || 0);
  const unread = notifications.some((n) => new Date(n.createdAt).getTime() > seen);
  const markSeen = () => localStorage.setItem(SEEN_KEY, String(Date.now()));
  return { notifications, unread, markSeen, error, isLoading };
}

// Admin only. Body: { title, body, audience, link? }
export const useSendNotification = () =>
  useSWRMutation("/notifications/admin/send", post, {
    onSuccess: () => mutate("/notifications"),
  });