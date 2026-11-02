import { isAxiosError } from 'axios'
import { ApiError } from './api-error'
import { ErrorCode, type ErrorCode as ErrorCodeValue } from './error-codes'

export function normalizeApiError(error: unknown): Error {
  if (!isAxiosError(error)) return error instanceof Error ? error : new Error('An unknown API error occurred.')

  const payload = asRecord(error.response?.data)
  const status = error.response?.status ?? 500
  const details = asRecord(payload?.details)
  const message = readMessage(payload, details) ?? error.message ?? 'An unknown API error occurred.'
  const errorCode = resolveErrorCode(payload?.errorCode, status)
  return new ApiError(message, status, errorCode, details)
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

function readMessage(payload?: Record<string, unknown>, details?: Record<string, unknown>): string | undefined {
  if (typeof payload?.message === 'string') return payload.message
  if (Array.isArray(payload?.message)) return payload.message.filter((entry): entry is string => typeof entry === 'string').join(', ')
  if (typeof details?.error === 'string') return details.error
  return undefined
}

function resolveErrorCode(value: unknown, status: number): ErrorCodeValue {
  if (typeof value === 'string' && Object.values(ErrorCode).includes(value as ErrorCodeValue)) {
    return value as ErrorCodeValue
  }
  if (status === 400 || status === 422) return ErrorCode.VALIDATION_ERROR
  if (status === 401) return ErrorCode.UNAUTHORIZED
  if (status === 403) return ErrorCode.FORBIDDEN
  if (status === 404) return ErrorCode.NOT_FOUND
  if (status === 409) return ErrorCode.CONFLICT
  if (status === 429) return ErrorCode.RATE_LIMITED
  return ErrorCode.UNKNOWN
}
