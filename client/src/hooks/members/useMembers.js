import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

export function useMembers() {
  const { data, error, isLoading } = useSWR("/members");
  return { members: data?.members ?? [], error, isLoading };
}