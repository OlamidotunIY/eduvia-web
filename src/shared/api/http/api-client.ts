import { API_BASE_URL, API_TIMEOUT_MS } from "@/shared/constant/api-constant";
import axios from "axios";
import { applyAuthInterceptor } from "./interceptor/auth.interceptor";

export function apiClient() {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  applyAuthInterceptor(instance);

  return instance;
}

export type ApiClient = ReturnType<typeof apiClient>;