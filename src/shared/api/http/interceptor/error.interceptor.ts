import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

interface RetryConfig extends InternalAxiosRequestConfig {
  _eduviaRetried?: boolean
}

export function applyErrorInterceptor(
  instance: AxiosInstance,
  options: {
    onTokenRefresh: () => Promise<string | null>
    onSessionExpired: () => void
  },
) {
  let refreshPromise: Promise<string | null> | null = null

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const request = error.config as RetryConfig | undefined
      const isRefreshRequest = request?.url?.includes('/auth/refresh')

      if (error.response?.status !== 401 || !request || request._eduviaRetried || isRefreshRequest) {
        return Promise.reject(error)
      }

      request._eduviaRetried = true
      try {
        refreshPromise ??= options.onTokenRefresh().finally(() => {
          refreshPromise = null
        })
        const accessToken = await refreshPromise
        if (!accessToken) throw new Error('Session refresh did not return an access token.')

        request.headers.Authorization = `Bearer ${accessToken}`
        return instance(request)
      } catch (refreshError) {
        options.onSessionExpired()
        return Promise.reject(refreshError)
      }
    },
  )
}
