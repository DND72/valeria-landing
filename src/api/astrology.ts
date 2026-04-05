import { useAuth } from '@clerk/clerk-react'

export interface NatalChartRequest {
  birthDate: string // YYYY-MM-DD
  birthTime: string // HH:MM
  city: string
}

export interface NatalChartResponse {
  citta: string
  coordinate: [number, number]
  fuso_orario: string
  ora_utc: string
  ascendente_totale: number
  segno: string
  grado_nel_segno: number
  pianeti?: {
    nome: string
    segno: string
    gradi: number
  }[]
  case?: {
    numero: number
    segno: string
    gradi: number
  }[]
  error?: string
}

export function useAstrologyApi() {
  const { getToken } = useAuth()

  const calculateChart = async (data: NatalChartRequest): Promise<NatalChartResponse> => {
    const token = await getToken()
    if (!token) throw new Error('Non autenticato')

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

    const res = await fetch(`${API_URL}/api/astrology/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    const body = await res.json()
    if (!res.ok) {
      throw new Error(body.error || 'Errore nel calcolo del tema natale')
    }

    return body as NatalChartResponse
  }

  return { calculateChart }
}
