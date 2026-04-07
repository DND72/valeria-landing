import { useAuth } from '@clerk/clerk-react'
import { useMemo } from 'react'

export interface ClientProfile {
  firstName: string
  lastName: string
  birthDate: string | null
  birthTime: string | null
  birthCity: string | null
  taxId: string | null
  gender: 'M' | 'F' | null
  contactPreference: 'none' | 'phone' | 'meet' | 'zoom' | null
  phoneNumber: string | null
}

export function useMeApi() {
  const { getToken } = useAuth()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

  return useMemo(() => {
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

    return {
      getProfile: async (): Promise<ClientProfile> => {
        return authFetch('/api/me/profile')
      },
      updateProfile: async (data: Partial<ClientProfile>): Promise<{ ok: boolean }> => {
        return authFetch('/api/me/profile', {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
      getWalletTransactions: async (): Promise<{ transactions: any[] }> => {
        return authFetch('/api/me/wallet-transactions')
      }
    }
  }, [getToken, API_URL])
}
