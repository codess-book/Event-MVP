import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
export function useSponsors() {
  const { data, error, isLoading } = useSWR("/sponsors");
  return { sponsors: data?.sponsors ?? [], error, isLoading };
}

export function useSponsor(id) {
  const { data, error, isLoading } = useSWR(id ? `/sponsors/${id}` : null);
  return { sponsor: data?.sponsor ?? null, error, isLoading };
}
