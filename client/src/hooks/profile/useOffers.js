import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { api } from "../../lib/api";

// Update my own profile instantly, and refresh any sponsor list/detail players may have cached
const sync = (data) => {
  mutate("/auth/me", { user: data.user }, { revalidate: false });
  mutate((key) => typeof key === "string" && key.startsWith("/sponsors"));
};

export const useAddOffer = () =>
  useSWRMutation("/profile/offers", (url, { arg }) => api(url, { method: "POST", body: arg }), {
    onSuccess: sync,
  });

// arg: { id, offer }
export const useEditOffer = () =>
  useSWRMutation(
    "/profile/offers/edit",
    (_k, { arg }) => api(`/profile/offers/${arg.id}`, { method: "PUT", body: arg.offer }),
    { onSuccess: sync }
  );

// arg: offer id
export const useDeleteOffer = () =>
  useSWRMutation(
    "/profile/offers/delete",
    (_k, { arg: id }) => api(`/profile/offers/${id}`, { method: "DELETE" }),
    { onSuccess: sync }
  );