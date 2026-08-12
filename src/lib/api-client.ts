import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/stores/auth-store";
import type { ApiError, ApiSuccess } from "@/types/api";
import type { LoginResponseData } from "@/types/auth";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
// No default Content-Type header here on purpose: axios sets
// "application/json" automatically for plain object bodies, and — more
// importantly — lets the browser set "multipart/form-data; boundary=..."
// automatically when the body is a FormData instance (file uploads).
// Pinning a default header would override that and send a boundary-less
// multipart header, which the backend's MultiPartParser can't parse.

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function resolveWaiters(token: string | null) {
  refreshWaiters.forEach((resolve) => resolve(token));
  refreshWaiters = [];
}

function goToLogin() {
  useAuthStore.getState().clearSession();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/refresh");

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      goToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => refreshWaiters.push(resolve));
      if (!token) return Promise.reject(error);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    }

    isRefreshing = true;
    try {
      const response = await axios.post<ApiSuccess<Pick<LoginResponseData, "accessToken" | "refreshToken">>>(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        { refreshToken },
      );
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      useAuthStore.getState().setAccessToken(accessToken);
      if (newRefreshToken) useAuthStore.getState().setRefreshToken(newRefreshToken);

      resolveWaiters(accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolveWaiters(null);
      goToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<ApiSuccess<T>>(url, config);
  return response.data.data;
}

export async function apiPost<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<ApiSuccess<T>>(url, body, config);
  return response.data.data;
}

export async function apiPatch<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<ApiSuccess<T>>(url, body, config);
  return response.data.data;
}

export async function apiPut<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<ApiSuccess<T>>(url, body, config);
  return response.data.data;
}

export async function apiDelete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<ApiSuccess<T>>(url, config);
  return response.data.data;
}

export async function apiGetPaginated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<{ items: T[]; meta: ApiSuccess<T[]>["meta"] }> {
  const response = await apiClient.get<ApiSuccess<T[]>>(url, config);
  return { items: response.data.data, meta: response.data.meta };
}
