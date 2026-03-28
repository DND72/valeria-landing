import { useCallback, useEffect, useState } from 'react'
import { getApiBaseUrl } from '../constants/api'

type PublicPresence = {
  status: string
  updatedAt: string | null
}

export function useValeriaPresence(pollMs = 60_000) {
  const [data, setData] = useState<PublicPresence | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const base = getApiBaseUrl()
    if (!base) {
      setData(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/public/valeria-presence`)
      if (!res.ok) {
        setData(null)
        return
      }
      const j = (await res.json()) as PublicPresence
      setData(j)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    if (pollMs <= 0) return
    const t = window.setInterval(() => void refresh(), pollMs)
    return () => clearInterval(t)
  }, [refresh, pollMs])

  return { data, loading, refresh }
}
