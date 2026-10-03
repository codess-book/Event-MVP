import useSWR from "swr";
import { api, getToken } from "../../lib/api";

export function useMe() {
  // A null key means no request is made when there is no token
  const { data, error, isLoading } = useSWR(getToken() ? "/auth/me" : null, api, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });
  return { user: data?.user ?? null, isLoading, isAuthed: !!data?.user, error };
}