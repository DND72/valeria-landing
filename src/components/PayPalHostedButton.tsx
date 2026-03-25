import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    paypal?: {
      HostedButtons: (config: { hostedButtonId: string }) => { render: (selector: string) => void }
    }
  }
}

interface Props {
  hostedButtonId: string
}

export default function PayPalHostedButton({ hostedButtonId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendered = useRef(false)

  useEffect(() => {
    if (rendered.current) return
    const tryRender = () => {
      if (window.paypal && containerRef.current) {
        rendered.current = true
        window.paypal.HostedButtons({ hostedButtonId }).render(`#paypal-container-${hostedButtonId}`)
      } else {
        setTimeout(tryRender, 300)
      }
    }
    tryRender()
  }, [hostedButtonId])

  return (
    <div
      id={`paypal-container-${hostedButtonId}`}
      ref={containerRef}
      className="w-full mt-4"
    />
  )
}
