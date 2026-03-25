import { useEffect } from 'react'

interface Props {
  url: string
  className?: string
  minHeight?: number
}

export default function CalendlyEmbed({ url, className = '', minHeight = 700 }: Props) {
  useEffect(() => {
    if (document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) return
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <div
      className={`calendly-inline-widget w-full ${className}`}
      data-url={url}
      style={{ minWidth: '320px', height: `${minHeight}px` }}
    />
  )
}
