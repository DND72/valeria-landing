export const CALENDLY_API = 'https://api.calendly.com'

/** GET Calendly API (path relativo a api.calendly.com o URL assoluto). */
export async function calendlyFetch(path: string, token: string): Promise<unknown> {
  const url = path.startsWith('http') ? path : `${CALENDLY_API}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
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
    const err = new Error(`Calendly API ${res.status}`)
    ;(err as Error & { status: number; body: unknown }).status = res.status
    ;(err as Error & { body: unknown }).body = data
    throw err
  }
  return data
}
