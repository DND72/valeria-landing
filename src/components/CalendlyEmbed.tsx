import { useMemo } from 'react'

interface Props {
  url: string
  className?: string
  minHeight?: number
}

function isValidCalendlyUrl(u: string): boolean {
  const t = u?.trim()
  if (!t) return false
  try {
    const parsed = new URL(t)
    return parsed.protocol === 'https:' && parsed.hostname.includes('calendly.com')
  } catch {
    return false
  }
}

/** Embed ufficiale via iframe — non carica widget.js (evita errori interni tipo .split su null). */
function calendlyIframeSrc(pageUrl: string): string {
  const u = new URL(pageUrl.trim())
  u.searchParams.set('embed_domain', typeof window !== 'undefined' ? window.location.hostname : 'localhost')
  u.searchParams.set('embed_type', 'Inline')
  // Allinea al tema del sito (stesso body / cosmic) per ridurre il “blocco nero” che stona col riquadro
  u.searchParams.set('background_color', '0a0e1a')
  u.searchParams.set('text_color', 'f5f0e8')
  u.searchParams.set('primary_color', 'd4a017')
  u.searchParams.set('hide_gdpr_banner', '1')
  return u.toString()
}

export default function CalendlyEmbed({ url, className = '', minHeight = 700 }: Props) {
  const src = useMemo(() => {
    if (!isValidCalendlyUrl(url)) return null
    return calendlyIframeSrc(url)
  }, [url])

  if (!src) {
    return (
      <div
        className={`calendly-inline-widget w-full rounded-lg border border-white/10 bg-dark-400/50 px-4 py-6 text-center text-sm text-white/50 ${className}`}
        style={{ minHeight }}
      >
        Calendly: URL non valido (controlla{' '}
        <code className="text-gold-500/90">src/constants/calendly.ts</code> o{' '}
        <code className="text-gold-500/90">VITE_CALENDLY_BOOKING_URL</code>).
      </div>
    )
  }

  const h = `clamp(420px, 75vh, ${minHeight}px)`

  return (
    <div
      className={`calendly-embed-shell calendly-inline-widget w-full ${className}`}
      style={{
        minWidth: '320px',
        minHeight: 'min(400px, 85vh)',
        height: h,
      }}
    >
      {/* Bordo morbido + clip: l’iframe non “esce” visivamente dal riquadro arrotondato */}
      <div className="h-full rounded-2xl bg-[#0a0e1a]/90 p-px shadow-[inset_0_0_0_1px_rgba(212,160,23,0.12)] ring-1 ring-gold-600/15">
        <div className="h-full overflow-hidden rounded-[15px] bg-[#0a0e1a]">
          <iframe
            title="Prenota su Calendly"
            src={src}
            width="100%"
            height="100%"
            className="calendly-embed-iframe block h-full w-full border-0 bg-[#0a0e1a]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allow="camera; microphone; fullscreen; payment"
          />
        </div>
      </div>
    </div>
  )
}
