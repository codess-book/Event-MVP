import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../lib/api";

export function useAdminSponsors() {
  const { data, error, isLoading } = useSWR("/admin/sponsors");
  return {
    sponsors: data?.sponsors ?? [],
    categories: data?.categories ?? [],
    error,
    isLoading,
  };
}

// arg: { id, changes: { isApproved?, sponsorCategory? } }
export const useUpdateSponsor = () =>
  useSWRMutation(
    "/admin/sponsors/update",
    (_k, { arg }) => api(`/admin/sponsors/${arg.id}`, { method: "PATCH", body: arg.changes }),
    {
      onSuccess: () => {
        mutate("/admin/sponsors");
        // Players' sponsor list/detail should refresh too
        mutate((key) => typeof key === "string" && key.startsWith("/sponsors"));
      },
    }
  );