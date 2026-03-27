import { useEffect, useRef, useState } from 'react'

interface Props {
  url: string
  className?: string
  minHeight?: number
}

const WIDGET_SCRIPT = 'https://assets.calendly.com/assets/external/widget.js'

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

export default function CalendlyEmbed({ url, className = '', minHeight = 700 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scriptError, setScriptError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setScriptError(null)

    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT}"]`)
        if (existing) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = WIDGET_SCRIPT
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Calendly widget.js'))
        document.body.appendChild(script)
      })

    const initWhenReady = (attempt: number) => {
      if (cancelled) return
      const el = containerRef.current
      if (!el || !isValidCalendlyUrl(url)) return

      const Calendly = (window as unknown as { Calendly?: { initInlineWidget: (o: unknown) => void } })
        .Calendly
      if (!Calendly?.initInlineWidget) {
        if (attempt < 40) {
          window.setTimeout(() => initWhenReady(attempt + 1), 100)
        }
        return
      }

      el.innerHTML = ''
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled || !containerRef.current) return
          try {
            Calendly.initInlineWidget({
              url: url.trim(),
              parentElement: containerRef.current,
            })
          } catch {
            if (attempt < 15) {
              window.setTimeout(() => initWhenReady(attempt + 1), 300)
            }
          }
        })
      })
    }

    const run = async () => {
      if (!isValidCalendlyUrl(url)) return
      try {
        await ensureScript()
      } catch {
        if (!cancelled) {
          setScriptError(
            'Impossibile caricare Calendly (script bloccato o rete). Controlla ad-blocker, prova un’altra rete o apri il link Calendly in nuova scheda dal sito calendly.com.'
          )
        }
        return
      }
      if (cancelled) return
      initWhenReady(0)
    }

    void run()

    return () => {
      cancelled = true
      const el = containerRef.current
      if (el) el.innerHTML = ''
    }
  }, [url])

  if (!isValidCalendlyUrl(url)) {
    return (
      <div
        className={`calendly-inline-widget w-full rounded-lg border border-white/10 bg-dark-400/50 px-4 py-6 text-center text-sm text-white/50 ${className}`}
        style={{ minHeight }}
      >
        Calendly: URL non valido (controlla slug e utente in <code className="text-gold-500/90">src/constants/calendly.ts</code> o le variabili{' '}
        <code className="text-gold-500/90">VITE_CALENDLY_*</code>).
      </div>
    )
  }

  if (scriptError) {
    return (
      <div
        className={`calendly-inline-widget w-full rounded-lg border border-amber-600/30 bg-dark-400/50 px-4 py-6 text-sm text-white/70 ${className}`}
        style={{ minHeight }}
      >
        <p className="mb-3">{scriptError}</p>
        <a
          href={url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-400 underline underline-offset-2 hover:text-gold-300"
        >
          Apri questo calendario su Calendly
        </a>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`calendly-inline-widget w-full overflow-hidden ${className}`}
      style={{
        minWidth: '320px',
        minHeight: 'min(400px, 85vh)',
        height: `clamp(420px, 75vh, ${minHeight}px)`,
      }}
    />
  )
}
