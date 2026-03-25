import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface StatItem {
  value: number
  suffix: string
  label: string
  sublabel: string
  icon: string
}

const stats: StatItem[] = [
  {
    value: 3359,
    suffix: '',
    label: 'Consulti effettuati',
    sublabel: 'su piattaforme certificate',
    icon: '📞',
  },
  {
    value: 497,
    suffix: '',
    label: 'Media recensioni',
    sublabel: '4,97 / 5 · su 261 valutazioni',
    icon: '⭐',
  },
  {
    value: 1037,
    suffix: '+',
    label: 'Feedback positivi',
    sublabel: 'tra Kang e Wengo',
    icon: '💬',
  },
  {
    value: 10,
    suffix: '+',
    label: 'Anni di pratica',
    sublabel: 'con trasmissione alchemica',
    icon: '🌙',
  },
]

function AnimatedNumber({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [active, target])

  if (target === 497) {
    return (
      <span>
        {active ? '4,97' : '0,00'}
      </span>
    )
  }

  return (
    <span>
      {count.toLocaleString('it-IT')}
      {suffix}
    </span>
  )
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="numeri" className="py-24 px-6 relative" ref={ref}>
      <div className="section-divider" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            I <span className="gold-text">numeri</span> parlano chiaro
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Non parole — risultati verificabili su piattaforme professionali certificate.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="mystical-card text-center group"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="font-serif text-3xl md:text-4xl gold-number mb-1">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} active={inView} />
              </div>
              <div className="text-white font-medium text-sm mb-1">{stat.label}</div>
              <div className="text-white/40 text-xs">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/30 text-sm"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 inline-block" />
            Kang · "Stella" · 4,97/5
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 inline-block" />
            Wengo · "Valeria" · 776 commenti
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 inline-block" />
            FIDE Arena International Master · ID 373110313
          </span>
        </motion.div>
      </div>
    </section>
  )
}
