// hooks/event/useEvent.js
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../lib/api";

export const useEvent = () => {
  const { data, error, isLoading } = useSWR("/event");
  return { items: data?.items ?? [], error, isLoading };
};

const refresh = () => mutate("/event");

// arg: form object
export const useCreateEvent = () =>
  useSWRMutation("/event/create", (_k, { arg }) => api("/event", { method: "POST", body: arg }), { onSuccess: refresh });

// arg: { id }
export const useDeleteEvent = () =>
  useSWRMutation("/event/delete", (_k, { arg }) => api(`/event/${arg.id}`, { method: "DELETE" }), { onSuccess: refresh });