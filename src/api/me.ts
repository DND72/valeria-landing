import { useAuth } from '@clerk/clerk-react'

export interface ClientProfile {
  firstName: string
  lastName: string
  birthDate: string | null
  birthTime: string | null
  birthCity: string | null
  taxId: string | null
}

export function useMeApi() {
  const { getToken } = useAuth()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

  const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken()
    if (!token) throw new Error('Non autenticato')

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
    
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Errore di comunicazione col server')
    }
    
    return res.json()
  }

  const getProfile = async (): Promise<ClientProfile> => {
    return authFetch('/api/me/profile')
  }

  return { getProfile }
}
