import { useEffect, useRef } from 'react'

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // Stars with varying sizes and colors
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.3,
      opacity: Math.random() * 0.7 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      // Some stars have golden tint
      gold: Math.random() > 0.82,
    }))

    // Shooting stars
    const shootingStars: {
      x: number; y: number; vx: number; vy: number;
      length: number; opacity: number; active: boolean; timer: number
    }[] = Array.from({ length: 3 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0,
      length: 0, opacity: 0, active: false, timer: Math.random() * 300
    }))

    const resetShootingStar = (s: typeof shootingStars[0]) => {
      s.x = Math.random() * width * 0.7
      s.y = Math.random() * height * 0.4
      s.vx = (Math.random() * 6 + 4)
      s.vy = (Math.random() * 3 + 1.5)
      s.length = Math.random() * 120 + 60
      s.opacity = 1
      s.active = true
      s.timer = Math.random() * 400 + 200
    }

    let frame = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      frame++

      // Stars
      stars.forEach((star) => {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset)
        const opacity = star.opacity * (0.5 + 0.5 * twinkle)

        if (star.gold) {
          ctx.fillStyle = `rgba(252, 211, 77, ${opacity * 0.8})`
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Glow for larger stars
        if (star.size > 1.8) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4)
          const color = star.gold ? '252, 211, 77' : '200, 180, 255'
          glow.addColorStop(0, `rgba(${color}, ${opacity * 0.4})`)
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Shooting stars
      shootingStars.forEach((s) => {
        if (!s.active) {
          s.timer--
          if (s.timer <= 0) resetShootingStar(s)
          return
        }

        s.x += s.vx
        s.y += s.vy
        s.opacity -= 0.018

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          s.active = false
          s.timer = Math.random() * 400 + 200
          return
        }

        const grad = ctx.createLinearGradient(
          s.x - s.vx * (s.length / 6), s.y - s.vy * (s.length / 6),
          s.x, s.y
        )
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(0.7, `rgba(212,160,23,${s.opacity * 0.3})`)
        grad.addColorStop(1, `rgba(255,255,255,${s.opacity})`)

        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(s.x - s.vx * (s.length / 6), s.y - s.vy * (s.length / 6))
        ctx.lineTo(s.x, s.y)
        ctx.stroke()
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      stars.forEach((star) => {
        star.x = Math.random() * width
        star.y = Math.random() * height
      })
    }

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      {/* Nebula clouds — pure CSS animated gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

        {/* Deep base gradient */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 120% 80% at 50% 100%, #0a0014 0%, #06000f 60%, #000008 100%)',
          }}
        />

        {/* Nebula 1 — purple/violet, top left, slow drift */}
        <div className="absolute"
          style={{
            width: '70vw', height: '60vh',
            top: '-10vh', left: '-15vw',
            background: 'radial-gradient(ellipse at center, rgba(120,40,180,0.18) 0%, rgba(60,0,120,0.08) 50%, transparent 75%)',
            filter: 'blur(40px)',
            animation: 'nebulaDrift1 25s ease-in-out infinite alternate',
          }}
        />

        {/* Nebula 2 — deep blue, top right */}
        <div className="absolute"
          style={{
            width: '60vw', height: '55vh',
            top: '-5vh', right: '-10vw',
            background: 'radial-gradient(ellipse at center, rgba(20,60,160,0.15) 0%, rgba(0,20,80,0.07) 55%, transparent 75%)',
            filter: 'blur(50px)',
            animation: 'nebulaDrift2 30s ease-in-out infinite alternate',
          }}
        />

        {/* Nebula 3 — gold/amber, center, subtle pulse */}
        <div className="absolute"
          style={{
            width: '50vw', height: '40vh',
            top: '25vh', left: '25vw',
            background: 'radial-gradient(ellipse at center, rgba(180,100,0,0.08) 0%, rgba(120,60,0,0.04) 50%, transparent 75%)',
            filter: 'blur(60px)',
            animation: 'nebulaPulse 8s ease-in-out infinite alternate',
          }}
        />

        {/* Nebula 4 — teal/cyan, bottom left */}
        <div className="absolute"
          style={{
            width: '55vw', height: '50vh',
            bottom: '0', left: '-10vw',
            background: 'radial-gradient(ellipse at center, rgba(0,80,100,0.1) 0%, rgba(0,40,60,0.05) 55%, transparent 75%)',
            filter: 'blur(45px)',
            animation: 'nebulaDrift1 35s ease-in-out infinite alternate-reverse',
          }}
        />

        {/* Nebula 5 — magenta accent, bottom right */}
        <div className="absolute"
          style={{
            width: '45vw', height: '45vh',
            bottom: '-5vh', right: '-5vw',
            background: 'radial-gradient(ellipse at center, rgba(140,0,100,0.1) 0%, rgba(80,0,60,0.05) 55%, transparent 75%)',
            filter: 'blur(55px)',
            animation: 'nebulaDrift2 28s ease-in-out infinite alternate-reverse',
          }}
        />

        {/* Vignette overlay */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,8,0.7) 100%)',
          }}
        />
      </div>

      {/* Canvas for stars and shooting stars */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      />

      <style>{`
        @keyframes nebulaDrift1 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(3vw, 2vh) scale(1.05); }
          66%  { transform: translate(-2vw, 4vh) scale(0.97); }
          100% { transform: translate(4vw, -2vh) scale(1.08); }
        }
        @keyframes nebulaDrift2 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-4vw, 3vh) scale(1.06); }
          66%  { transform: translate(3vw, -2vh) scale(0.95); }
          100% { transform: translate(-2vw, 5vh) scale(1.04); }
        }
        @keyframes nebulaPulse {
          0%   { opacity: 0.6; transform: scale(1); }
          50%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </>
  )
}
