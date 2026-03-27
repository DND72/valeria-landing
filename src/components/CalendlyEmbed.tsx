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
      className={`calendly-inline-widget w-full overflow-hidden rounded-lg ${className}`}
      style={{
        minWidth: '320px',
        minHeight: 'min(400px, 85vh)',
        height: h,
      }}
    >
      <iframe
        title="Prenota su Calendly"
        src={src}
        width="100%"
        height="100%"
        style={{ border: 'none', display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="camera; microphone; fullscreen; payment"
      />
    </div>
  )
}
