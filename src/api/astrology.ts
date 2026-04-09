import { useAuth } from '@clerk/clerk-react'
import { useCallback, useMemo } from 'react'

export interface NatalChartRequest {
  birthDate: string // YYYY-MM-DD
  birthTime: string // HH:MM
  city: string
  gender?: 'M' | 'F'
}

export interface Planet {
  nome: string
  segno: string
  casa?: number
  gradi: number
  lon_assoluta: number
  categoria: 'veloce' | 'lento' | 'asteroide' | 'punto'
}

export interface House {
  numero: number
  segno: string
  gradi: number
  lon_assoluta: number
}

export interface NatalChartResponse {
  citta: string
  coordinate: [number, number]
  fuso_orario: string
  ora_utc: string
  ascendente_totale: number
  segno: string
  grado_nel_segno: number
  pianeti?: Planet[]
  case?: House[]
  interpretation?: string
  chart_type?: 'basic' | 'advanced'
  error?: string
  id?: string | number
  birthDate?: string
  birthTime?: string
  city?: string
  status?: string
  created_at?: string
}

export interface SavedNatalChart {
  id: string
  type: 'basic' | 'advanced'
  birthDate: string
  birthTime: string
  city: string
  chartData: NatalChartResponse
  interpretation: string
  status?: string
  createdAt: string
}

export function useAstrologyApi() {
  const { getToken } = useAuth()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
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
  }, [getToken, API_URL])

  return useMemo(() => ({
    calculateFreeChart: async (data: NatalChartRequest): Promise<NatalChartResponse> => {
      const token = await getToken().catch(() => null)
      
      const res = await fetch(`${API_URL}/api/astrology/calculate-free`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Errore col server')
      }

      return res.json()
    },
    generatePaidChart: async (data: NatalChartRequest & { type: 'basic' | 'advanced' }): Promise<NatalChartResponse & { interpretation: string }> => {
      return authFetch('/api/astrology/generate-paid', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    getMyCharts: async (): Promise<SavedNatalChart[]> => {
      const res = await authFetch('/api/astrology/my-charts')
      return res.charts || []
    },
    syncNatalData: async (data: NatalChartRequest) => {
      return authFetch('/api/astrology/sync-natal', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    generateSummary: async (chartId: string): Promise<{ interpretation: string }> => {
      return authFetch('/api/astrology/generate-summary', {
        method: 'POST',
        body: JSON.stringify({ chartId }),
      })
    },
    getLatestChart: async (): Promise<{ chart: (NatalChartResponse & { chartId: string }) | null }> => {
      return authFetch('/api/astrology/latest')
    },
    generateStaffChart: async (data: NatalChartRequest): Promise<NatalChartResponse & { interpretation: string }> => {
      return authFetch('/api/astrology/generate-staff', {
        method: 'POST',
        body: JSON.stringify({ ...data, type: 'advanced' }),
      })
    }
  }), [getToken, API_URL, authFetch])
}
