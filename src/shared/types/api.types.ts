export interface ApiErrorPayload {
  statusCode?: number
  errorCode?: string
  error?: string
  message?: string | string[]
  details?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
