import { useAuth } from '@clerk/clerk-react'

export interface NatalChartRequest {
  birthDate: string // YYYY-MM-DD
  birthTime: string // HH:MM
  city: string
}

export interface Planet {
  nome: string
  segno: string
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
  error?: string
}

export interface SavedNatalChart {
  id: string
  type: 'basic' | 'advanced'
  birthDate: string
  birthTime: string
  city: string
  chartData: NatalChartResponse
  interpretation: string
  createdAt: string
}

export function useAstrologyApi() {
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

  const calculateFreeChart = async (data: NatalChartRequest): Promise<NatalChartResponse> => {
    return authFetch('/api/astrology/calculate-free', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const generatePaidChart = async (data: NatalChartRequest & { type: 'basic' | 'advanced' }): Promise<NatalChartResponse & { interpretation: string }> => {
    return authFetch('/api/astrology/generate-paid', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const getMyCharts = async (): Promise<SavedNatalChart[]> => {
    const res = await authFetch('/api/astrology/my-charts')
    return res.charts || []
  }

  return { calculateFreeChart, generatePaidChart, getMyCharts }
}
