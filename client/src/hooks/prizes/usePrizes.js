import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../lib/api";

const refresh = () => mutate("/prizes");

export function usePrizes() {
  const { data, error, isLoading } = useSWR("/prizes");
  return { prizes: data?.prizes ?? [], error, isLoading };
}

export const useAddPrize = () =>
  useSWRMutation("/prizes/add", (_k, { arg }) => api("/prizes", { method: "POST", body: arg }), {
    onSuccess: refresh,
  });

// arg: { id, prize }
export const useEditPrize = () =>
  useSWRMutation(
    "/prizes/edit",
    (_k, { arg }) => api(`/prizes/${arg.id}`, { method: "PUT", body: arg.prize }),
    { onSuccess: refresh }
  );

// arg: prize id
export const useDeletePrize = () =>
  useSWRMutation(
    "/prizes/delete",
    (_k, { arg: id }) => api(`/prizes/${id}`, { method: "DELETE" }),
    { onSuccess: refresh }
  );