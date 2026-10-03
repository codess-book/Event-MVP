// hooks/challenges/useChallenges.js
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../lib/api";

export const useMyEntries = () => {
  const { data } = useSWR("/challenges/mine");
  return { entries: data?.entries ?? [] };
};
export const useWinners = () => {
  const { data } = useSWR("/challenges/winners");
  return { winners: data?.winners ?? [] };
};
export const useAdminEntries = (id) => {
  const { data, error, isLoading } = useSWR(id ? `/challenges/${id}/entries` : null);
  return { entries: data?.entries ?? [], error, isLoading };
};

const refresh = () => mutate((k) => typeof k === "string" && k.startsWith("/challenges"));

// arg: { challengeId, file }  -> Cloudinary pe seedha upload, phir server ko URL
export const useSubmitPhoto = () =>
  useSWRMutation(
    "/challenges/submit",
    async (_k, { arg }) => {
      const sig = await api(`/challenges/${arg.challengeId}/signature`, { method: "POST" });
      const fd = new FormData();
      Object.entries(sig.fields).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", arg.file);
      const res = await fetch(sig.uploadUrl, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
      return api(`/challenges/${arg.challengeId}/entry`, { method: "POST", body: { photoUrl: json.secure_url } });
    },
    { onSuccess: refresh }
  );

// arg: { id }
export const useSetWinner = () =>
  useSWRMutation("/challenges/winner", (_k, { arg }) => api(`/challenges/entries/${arg.id}/winner`, { method: "POST" }), { onSuccess: refresh });
export const useDeleteEntry = () =>
  useSWRMutation("/challenges/delete", (_k, { arg }) => api(`/challenges/entries/${arg.id}`, { method: "DELETE" }), { onSuccess: refresh });