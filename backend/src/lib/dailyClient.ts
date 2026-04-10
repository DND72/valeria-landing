
const DAILY_API_KEY = process.env.DAILY_API_KEY
const DAILY_API_URL = 'https://api.daily.co/v1'

export type DailyRoom = {
  id: string
  name: string
  api_created: boolean
  privacy: string
  url: string
  created_at: string
  config: {
    exp: number
    max_participants: number
    start_audio_off: boolean
    start_video_off: boolean
  }
}

/**
 * Crea una stanza Daily di tipo 'private'
 * @param roomName Opzionale: nome personalizzato (slug) della stanza. Se scartato, generato automaticamente da Daily
 * @param exp Opzionale: scadenza della stanza in formato Unix Timestamp (es. Math.floor(Date.now() / 1000) + 3600)
 */
export async function createDailyRoom(roomName?: string, exp?: number): Promise<DailyRoom> {
  if (!DAILY_API_KEY) {
    throw new Error('Chiave DAILY_API_KEY mancante nel server')
  }

  const payload: any = {
    properties: {
      privacy: 'private', 
      max_participants: 2, 
      start_audio_off: false,
      start_video_off: false,
      enable_low_brightness_compensation: true,
      user_background_effects_allowed: true,
    }
  }

  if (roomName) payload.name = roomName
  if (exp) payload.properties.exp = exp

  const res = await fetch(`${DAILY_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Errore creazione stanza Daily: ${res.status} ${txt}`)
  }

  const data = await res.json() as DailyRoom
  return data
}

/**
 * Genera un token (Meeting Token) per permettere all'utente di accedere alla stanza privata
 * @param roomName Il nome esatto della stanza
 * @param isOwner true se questo token è per Valeria (admin), false per il cliente
 */
export async function createDailyToken(roomName: string, isOwner: boolean = false): Promise<string> {
  if (!DAILY_API_KEY) {
    throw new Error('Chiave DAILY_API_KEY mancante nel server')
  }

  const payload = {
    properties: {
      room_name: roomName,
      is_owner: isOwner,
      enable_screenshare: true,
      enable_recording: 'cloud' // se Valeria ha il pro, sennò rimuoviamo
    }
  }

  const res = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Errore creazione Token Daily: ${res.status} ${txt}`)
  }

  const data = await res.json()
  return data.token
}
