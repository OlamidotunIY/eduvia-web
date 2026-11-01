import { authStore } from "@/shared/store/auth-state";
import type { AxiosInstance } from "axios";

export function applyAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    const token = authStore.getState().accessToken;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  });
}
