import useSWR from "swr";

const KEY = "offersSeenAt";
const readSeen = () => {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
};
export const markOffersSeen = () => {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
};

export function useOffers() {
  const { data, error, isLoading } = useSWR("/offers", {
    dedupingInterval: 30000,
    revalidateOnFocus: true,
  });
  const offers = data?.offers || [];
  const seenAt = readSeen();
  const newCount = offers.filter(
    (o) => new Date(o.createdAt).getTime() > seenAt,
  ).length;
  return { offers, newCount, isLoading, error };
}
