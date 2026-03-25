import { useEffect, useState } from 'react'

const galaxies = [
  '/galassia-1.png',
  '/galassia-2.png',
  '/galassia-3.png',
  '/galassia-4.png',
  '/galassia-5.png',
]

const TRANSITION_DURATION = 3000   // ms crossfade
const DISPLAY_DURATION    = 22000  // ms per galassia

export default function CosmicBackground() {
  const [current, setCurrent] = useState(0)
  const [next, setNext]       = useState(1)
  const [fading, setFading]   = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % galaxies.length)
        setNext((n) => (n + 1) % galaxies.length)
        setFading(false)
      }, TRANSITION_DURATION)
    }, DISPLAY_DURATION)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0e1a]">

        {/* Layer galassia corrente */}
        <div
          className="absolute inset-0 cosmic-zoom"
          style={{
            backgroundImage: `url(${galaxies[current]})`,
            backgroundSize: '110% 110%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: fading ? 0 : 1,
            transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
          }}
        />

        {/* Layer galassia successiva (pre-caricata sotto) */}
        <div
          className="absolute inset-0 cosmic-zoom"
          style={{
            backgroundImage: `url(${galaxies[next]})`,
            backgroundSize: '110% 110%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: fading ? 1 : 0,
            transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
            animationDelay: '5s',
          }}
        />

        {/* Overlay scuro per leggibilità testo */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        />

        {/* Vignette bordi */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(0,0,10,0.75) 100%)',
          }}
        />
      </div>

      <style>{`
        @keyframes cosmicZoom {
          0%   { background-size: 110% 110%; background-position: center center; }
          15%  { background-size: 130% 130%; background-position: 30% 20%; }
          35%  { background-size: 160% 160%; background-position: 70% 35%; }
          50%  { background-size: 200% 200%; background-position: 20% 60%; }
          65%  { background-size: 170% 170%; background-position: 60% 75%; }
          85%  { background-size: 130% 130%; background-position: 40% 30%; }
          100% { background-size: 110% 110%; background-position: center center; }
        }
        .cosmic-zoom {
          animation: cosmicZoom 100s ease-in-out infinite alternate;
        }
      `}</style>
    </>
  )
}
