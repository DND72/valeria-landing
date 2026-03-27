import { getApiBaseUrl } from '../constants/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(typeof (body as { error?: string })?.error === 'string' ? (body as { error: string }).error : `Errore API (${status})`)
    this.name = 'ApiError'
  }
}

type GetToken = () => Promise<string | null>

export async function apiJson<T>(getToken: GetToken, path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl()
  if (!base) throw new Error('API non configurata (VITE_API_URL)')

  const token = await getToken()
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const body = init?.body
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, { ...init, headers })
  const text = await res.text()
  let data: unknown = {}
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = { raw: text }
    }
  }
  if (!res.ok) {
    throw new ApiError(res.status, data)
  }
  return data as T
}
