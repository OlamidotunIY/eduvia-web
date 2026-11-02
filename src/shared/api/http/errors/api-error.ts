import type { ErrorCode } from './error-codes'

export class ApiError extends Error {
  readonly status: number
  readonly errorCode: ErrorCode
  readonly details?: Record<string, unknown>

  constructor(
    message: string,
    status: number,
    errorCode: ErrorCode,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errorCode = errorCode
    this.details = details
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  get isUnauthorized(): boolean { return this.status === 401 }
  get isForbidden(): boolean { return this.status === 403 }
  get isNotFound(): boolean { return this.status === 404 }
  get isValidationError(): boolean { return this.status === 400 || this.status === 422 }
}
