import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../lib/api";

export const useAdminStats = (enabled = true) => {
  const { data, isLoading } = useSWR(enabled ? "/admin/users/stats" : null);
  return { stats: data, isLoading };
};

// params: { type, status, q, page }
export function useAdminUsers(params) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v != null),
  ).toString();
  const { data, error, isLoading } = useSWR(`/admin/users?${qs}`);
  return {
    users: data?.users ?? [],
    pages: data?.pages ?? 1,
    total: data?.total ?? 0,
    error,
    isLoading,
  };
}

const refresh = () => {
  mutate((k) => typeof k === "string" && k.startsWith("/admin/users"));
  mutate("/admin/sponsors");
  mutate((k) => typeof k === "string" && k.startsWith("/sponsors"));
};

// arg: { id, isApproved }
export const useSetApproval = () =>
  useSWRMutation(
    "/admin/users/approve",
    (_k, { arg }) =>
      api(`/admin/users/${arg.id}`, {
        method: "PATCH",
        body: { isApproved: arg.isApproved },
      }),
    { onSuccess: refresh },
  );

// arg: { id } -> { tempPassword }
export const useResetPassword = () =>
  useSWRMutation("/admin/users/reset", (_k, { arg }) =>
    api(`/admin/users/${arg.id}/reset-password`, { method: "POST" }),
  );
