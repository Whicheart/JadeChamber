import axios from 'axios'

const REQUEST_TIMEOUT_MS = 15_000

/**
 * 统一的请求错误，保留 HTTP 状态、请求方法、URL 与原始错误，便于排查。
 */
export class ApiError extends Error {
  readonly status: number | undefined
  readonly method: string | undefined
  readonly url: string | undefined
  readonly originalError: unknown

  constructor(
    message: string,
    options: {
      status?: number
      method?: string
      url?: string
      originalError?: unknown
    } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.method = options.method
    this.url = options.url
    this.originalError = options.originalError
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const method = error.config?.method?.toUpperCase()
    const url = error.config?.url
    const target = [status, method, url].filter((part) => part !== undefined).join(' ')
    const message = target
      ? `请求失败（${target}）：${error.message}`
      : `请求失败：${error.message}`

    return Promise.reject(new ApiError(message, { status, method, url, originalError: error }))
  },
)
