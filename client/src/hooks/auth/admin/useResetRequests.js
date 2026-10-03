import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../../lib/api";
const KEY = "/auth/admin/reset-requests";

// Polls every 15 seconds so new requests show up without a manual refresh
export function useResetRequests() {
  const { data, error, isLoading } = useSWR(KEY, api, { refreshInterval: 15000 });
  return { requests: data?.requests ?? [], error, isLoading };
}

// Approve one request; the response is { code, expiresInMinutes }
export function useApproveReset() {
  return useSWRMutation(
    `${KEY}/approve`,
    (_key, { arg: id }) => api(`${KEY}/${id}/approve`, { method: "POST" }),
    { onSuccess: () => mutate(KEY) }
  );
}