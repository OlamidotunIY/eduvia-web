import type { AxiosInstance } from 'axios'

export function applyAuthInterceptor(
  instance: AxiosInstance,
  getToken: () => string | null,
) {
  instance.interceptors.request.use((config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}
