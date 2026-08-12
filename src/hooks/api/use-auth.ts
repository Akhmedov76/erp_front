import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient, apiGet, apiPost } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { ChangePasswordRequest, LoginRequest, LoginResponseData, MeResponse } from "@/types/auth";
import type { ApiSuccess } from "@/types/api";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const response = await apiClient.post<ApiSuccess<LoginResponseData>>("/auth/login", body);
      return response.data.data;
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });
}

export function useLogout() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await apiPost("/auth/logout", { refreshToken }).catch(() => undefined);
      }
    },
    onSettled: () => clearSession(),
  });
}

export function useMe() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiGet<MeResponse>("/auth/me"),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => apiPost<void, ChangePasswordRequest>("/auth/change-password", body),
  });
}
