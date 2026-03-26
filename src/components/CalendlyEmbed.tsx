import { useEffect, useRef } from 'react'

interface Props {
  url: string
  className?: string
  minHeight?: number
}

export default function CalendlyEmbed({ url, className = '', minHeight = 700 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        const src = 'https://assets.calendly.com/assets/external/widget.js'
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
        if (existing) {
          // If it's already loaded, Calendly should be on window soon/now.
          // We still resolve immediately to allow init attempts.
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Calendly widget.js'))
        document.body.appendChild(script)
      })

    const init = async () => {
      await ensureScript()
      if (cancelled) return

      const el = containerRef.current
      if (!el) return

      // SPA fix: clear previous iframe and re-init on mount/url change.
      el.innerHTML = ''

      const Calendly = (window as any).Calendly as
        | undefined
        | { initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void }

      Calendly?.initInlineWidget?.({ url, parentElement: el })
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [url])

  return (
    <div
      ref={containerRef}
      className={`calendly-inline-widget w-full ${className}`}
      style={{ minWidth: '320px', height: `${minHeight}px` }}
    />
  )
}
