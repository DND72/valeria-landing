/** Base URL del backend (es. https://api-xxx.up.railway.app), senza slash finale */
export function getApiBaseUrl(): string | null {
  const v = import.meta.env.VITE_API_URL?.trim()
  return v ? v.replace(/\/$/, '') : null
}
