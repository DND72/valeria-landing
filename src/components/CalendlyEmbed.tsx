import { useEffect, useRef } from 'react'

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

  useEffect(() => {
    let cancelled = false

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
        Calendly: URL non valido.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`calendly-inline-widget w-full overflow-hidden ${className}`}
      style={{
        minWidth: '320px',
        height: `${minHeight}px`,
        maxHeight: `min(${minHeight}px, 85vh)`,
      }}
    />
  )
}
