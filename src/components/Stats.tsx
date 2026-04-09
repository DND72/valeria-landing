import { motion } from 'framer-motion'

interface StatItem {
  value: string
  label: string
  sublabel: string
  icon: string
}

const stats: StatItem[] = [
  {
    value: '3.359',
    label: 'Consulti effettuati',
    sublabel: 'su piattaforma certificata',
    icon: '📞',
  },
  {
    value: '4,97/5',
    label: 'Media recensioni',
    sublabel: 'su 261 valutazioni',
    icon: '⭐',
  },
  {
    value: '776',
    label: 'Commenti positivi',
    sublabel: 'su piattaforma certificata',
    icon: '💬',
  },
  {
    value: '10+',
    label: 'Anni di pratica',
    sublabel: 'con trasmissione alchemica',
    icon: '🌙',
  },
]


export default function Stats() {
  return (
    <section id="numeri" className="py-24 px-6 relative">
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
                {stat.value}
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
            Piattaforma certificata · 4,97/5 · 261 recensioni
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 inline-block" />
            Piattaforma certificata · 776 commenti positivi
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-500 inline-block" />
            Laureata in Psicologia e Giurisprudenza · Consulente Olistica
          </span>
        </motion.div>
      </div>
    </section>
  )
}
