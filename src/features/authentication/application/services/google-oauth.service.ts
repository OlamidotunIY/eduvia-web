import { API_BASE_URL } from '@/shared/constant/api-constant'

export function beginGoogleOAuth(intent: 'login' | 'signup') {
  const url = new URL('/auth/google', API_BASE_URL)
  url.searchParams.set('intent', intent)
  url.searchParams.set(
    'returnPath',
    new URL('/auth/callback', window.location.origin).toString(),
  )
  window.location.assign(url)
}
