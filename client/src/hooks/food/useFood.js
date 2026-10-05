// hooks/food/useFood.js
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "../../lib/api";

// Puts the fresh user straight into the /me cache so every screen updates at once
const syncUser = (data) =>
  mutate("/auth/me", { user: data.user }, { revalidate: false });

/* ----------------------------- public side ----------------------------- */
export function useFoodStalls() {
  const { data, error, isLoading } = useSWR("/food-stalls", (k) => api(k));
  return { stalls: data?.stalls ?? [], error, isLoading };
}

// arg: { id, stars }
export const useRateStall = () =>
  useSWRMutation(
    "/food-stalls/rate",
    (_k, { arg }) =>
      api(`/food-stalls/${arg.id}/rating`, {
        method: "PUT",
        body: { stars: arg.stars },
      }),
    { onSuccess: () => mutate("/food-stalls") },
  );

/* ----------------------------- stall owner ----------------------------- */
// arg: { name, price, category }
export const useAddMenuItem = () =>
  useSWRMutation(
    "/profile/menu/add",
    (_k, { arg }) => api("/profile/menu", { method: "POST", body: arg }),
    { onSuccess: syncUser },
  );

// arg: { id, patch }   e.g. { id, patch: { available: false } }
export const useUpdateMenuItem = () =>
  useSWRMutation(
    "/profile/menu/update",
    (_k, { arg }) =>
      api(`/profile/menu/${arg.id}`, { method: "PATCH", body: arg.patch }),
    { onSuccess: syncUser },
  );

// arg: itemId
export const useDeleteMenuItem = () =>
  useSWRMutation(
    "/profile/menu/delete",
    (_k, { arg }) => api(`/profile/menu/${arg}`, { method: "DELETE" }),
    { onSuccess: syncUser },
  );

/* -------------------------------- admin -------------------------------- */
// arg: { name, phone, password, businessName, stallNumber }
export const useCreateFoodPartner = () =>
  useSWRMutation("/admin/food-partners", (url, { arg }) =>
    api(url, { method: "POST", body: arg }),
  );
