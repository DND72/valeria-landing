import { useEffect, useState } from 'react'

const galaxies = [
  '/galassia-1.png',
  '/galassia-2.png',
  '/galassia-3.png',
  '/galassia-4.png',
  '/galassia-5.png',
]

/** Quanto resta visibile ogni immagine a opacità piena prima del crossfade */
const DISPLAY_MS = 120_000 // 2 minuti
/** Dissolvenza incrociata tra un’immagine e la successiva */
const FADE_MS = 10_000 // 10 secondi

export default function CosmicBackground() {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState(1)
  const [fading, setFading] = useState(false)
  /** incrementato su resize/orientamento → il layout si riallinea al viewport */
  const [viewportKey, setViewportKey] = useState(0)

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
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % galaxies.length)
        setNext((n) => (n + 1) % galaxies.length)
        setFading(false)
      }, FADE_MS)
    }, DISPLAY_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <div
        key={viewportKey}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0e1a]"
        style={{ minHeight: '100dvh', minWidth: '100%' }}
      >
        {/* Layer galassia corrente — cover + area extra per zoom lento (si adatta a portrait/landscape) */}
        <div
          className="absolute inset-0 cosmic-drift-layer"
          style={{
            backgroundImage: `url(${galaxies[current]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: fading ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        />

        {/* Layer galassia successiva (crossfade) */}
        <div
          className="absolute inset-0 cosmic-drift-layer"
          style={{
            backgroundImage: `url(${galaxies[next]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: fading ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(0,0,10,0.75) 100%)',
          }}
        />
      </div>

      <style>{`
        /* Movimento lento: usa scale su layer già in cover → ok in verticale e orizzontale */
        @keyframes cosmicDrift {
          0%   { transform: scale(1) translate3d(0, 0, 0); }
          25%  { transform: scale(1.06) translate3d(0.5%, -0.3%, 0); }
          50%  { transform: scale(1.1) translate3d(-0.4%, 0.4%, 0); }
          75%  { transform: scale(1.06) translate3d(0.3%, 0.5%, 0); }
          100% { transform: scale(1) translate3d(0, 0, 0); }
        }
        .cosmic-drift-layer {
          transform-origin: center center;
          will-change: transform, opacity;
          animation: cosmicDrift 140s ease-in-out infinite alternate;
        }
      `}</style>
    </>
  )
}
