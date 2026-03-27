import { useEffect, useRef, useState } from 'react'

const galaxies = [
  '/galassia-1.png',
  '/galassia-2.png',
  '/galassia-3.png',
  '/galassia-4.png',
  '/galassia-5.png',
]

const DISPLAY_MS = 120_000
const FADE_MS = 10_000

function DriftBg({
  src,
  opacity,
  transitionMs,
  noTransition,
}: {
  src: string
  opacity: number
  transitionMs: number
  noTransition: boolean
}) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        transition: noTransition ? 'none' : `opacity ${transitionMs}ms ease-in-out`,
      }}
    >
      <div
        className="absolute inset-0 cosmic-bg-drift"
        style={{
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </div>
  )
}

export default function CosmicBackground() {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState(1 % galaxies.length)
  const [fading, setFading] = useState(false)
  const [noTransition, setNoTransition] = useState(false)
  const [viewportKey, setViewportKey] = useState(0)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const bump = () => setViewportKey((k) => k + 1)
    window.addEventListener('orientationchange', bump)
    const mq = window.matchMedia('(orientation: portrait)')
    mq.addEventListener('change', bump)
    return () => {
      window.removeEventListener('orientationchange', bump)
      mq.removeEventListener('change', bump)
    }
  }, [])

  useEffect(() => {
    const tick = () => {
      setFading(true)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
      fadeTimeoutRef.current = setTimeout(() => {
        setNoTransition(true)
        setCurrent((c) => (c + 1) % galaxies.length)
        setNext((n) => (n + 1) % galaxies.length)
        setFading(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setNoTransition(false))
        })
        fadeTimeoutRef.current = null
      }, FADE_MS)
    }

    const id = window.setInterval(tick, DISPLAY_MS)
    return () => {
      clearInterval(id)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [])

  return (
    <div
      key={viewportKey}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0e1a]"
      style={{ minHeight: '100dvh', minWidth: '100%' }}
    >
      <DriftBg
        src={galaxies[current]}
        opacity={fading ? 0 : 1}
        transitionMs={FADE_MS}
        noTransition={noTransition}
      />
      <DriftBg
        src={galaxies[next]}
        opacity={fading ? 1 : 0}
        transitionMs={FADE_MS}
        noTransition={noTransition}
      />

      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(0,0,10,0.75) 100%)',
        }}
      />
    </div>
  )
}
