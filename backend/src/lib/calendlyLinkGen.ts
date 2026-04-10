import { calendlyFetch, calendlyPost } from './calendlyClient.js'
import { type ConsultKind } from './consultPrices.js'

let myUserUri: string | null = null
const eventTypeCache: Record<string, string> = {}

/** 
 * Cerca l'evento nell'account Calendly in base a una keyword (slug)
 * e genera un Single-Use Link (valido solo per 1 prenotazione).
 */
export async function getSingleUseCalendlyLink(token: string, kind: ConsultKind): Promise<string> {
  const targetSlug = mapKindToCalendlySlug(kind)

  if (!myUserUri) {
    const me = (await calendlyFetch('/users/me', token)) as { resource: { uri: string } }
    myUserUri = me.resource.uri
  }

  // Fetch / update cache se non c'è match
  if (!eventTypeCache[targetSlug]) {
    const typesRes = (await calendlyFetch(`/event_types?user=${myUserUri}`, token)) as {
      collection: { uri: string; slug: string }[]
    }
    
    for (const et of typesRes.collection) {
      if (et.slug) {
        eventTypeCache[et.slug] = et.uri
      }
    }
  }

  const ownerUri = eventTypeCache[targetSlug]
  if (!ownerUri) {
    throw new Error(`Calendly: Evento con slug '${targetSlug}' non trovato. L'hai creato su Calendly?`)
  }

  // Genera link monouso
  const result = (await calendlyPost('/scheduling_links', token, {
    max_event_count: 1,
    owner: ownerUri,
    owner_type: 'EventType',
  })) as { resource: { booking_url: string } }

  return result.resource.booking_url
}

/** 
 * Mappa logica tra i consulti di Valeria e gli slug finali dei suoi URL Calendly.
 * (es. https://calendly.com/valeriadipace/breve -> slug "breve")
 */
function mapKindToCalendlySlug(kind: ConsultKind): string {
  // Valeria dovrà assicurarsi che i permalinks su Calendly abbiano esattamente queste estensioni
  const map: Record<ConsultKind, string> = {
    tarocchi_flash: 'tarocchi-flash',
    tarocchi_prenotabile: 'tarocchi-prenotabile',
    coaching_flash: 'coaching-flash',
    coaching_prenotabile: 'coaching-prenotabile',
    combo_flash: 'combo-flash',
    combo_prenotabile: 'combo-prenotabile',
    free: 'free',
    chat_prenotabile: 'chat-prenotabile',
    chat_flash: 'chat-flash',
  }
  return map[kind]
}
