import useSWRMutation from "swr/mutation";
import { mutate } from "swr";
import { post, setToken, clearToken } from "../../lib/api";

// Saves the token and puts the user straight into the /me cache
const onAuthSuccess = (data) => {
  setToken(data.token);
  mutate("/auth/me", { user: data.user }, { revalidate: false });
};

export const useLogin = () =>
  useSWRMutation("/auth/login", post, { onSuccess: onAuthSuccess });

export const useRegister = () =>
  useSWRMutation("/auth/register", post, { onSuccess: onAuthSuccess });

export const useForgotPassword = () =>
  useSWRMutation("/auth/forgot-password", post);
export const useResetPassword = () =>
  useSWRMutation("/auth/reset-password", post);
export const useChangePassword = () =>
  useSWRMutation("/auth/change-password", post);

export function logout() {
  clearToken();
  mutate(() => true, undefined, { revalidate: false }); // clear the whole cache
}