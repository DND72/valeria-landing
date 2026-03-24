import { motion } from 'framer-motion'

const credentials = [
  {
    icon: '🎭',
    title: 'Attrice Televisiva',
    desc: 'Centovetrine, Distretto di Polizia, Squadra Mobile — Canale 5. Formata con Pupi Avati, Michele Placido, Giuliana De Sio.',
  },
  {
    icon: '⚖️',
    title: 'Laurea in Giurisprudenza',
    desc: 'Percorso accademico completo. Il rigore del pensiero giuridico applicato all\'interpretazione dei simboli.',
  },
  {
    icon: '🧠',
    title: 'Laurea in Psicologia',
    desc: 'La comprensione profonda della mente umana è il cuore del suo metodo di lettura.',
  },
  {
    icon: '♟️',
    title: 'Arena International Master (FIDE)',
    desc: 'Titolo ufficiale FIDE · ID 373110313. La stessa capacità di anticipare le mosse sul tavolo e nella vita.',
  },
  {
    icon: '🌟',
    title: 'Allieva del Maestro Villanova',
    desc: 'Formazione nella tradizione iniziatica dei Tarocchi di Marsiglia. Un metodo trasmesso, non improvvisato.',
  },
]

export default function About() {
  return (
    <section id="chi-sono" className="py-24 px-6 relative">
      <div className="section-divider" />
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-4">Chi è Valeria</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Tre percorsi universitari.
              <br />
              Una carriera in TV.
              <br />
              <span className="gold-text italic">Un dono antico.</span>
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                Valeria Di Pace non è la solita tarologa. Prima di sedersi davanti alle carte,
                ha attraversato tre università, calcato i set televisivi di Canale 5 e intrapreso
                un percorso esoterico tra i più rigorosi che esistano.
              </p>
              <p>
                La sua lettura dei Tarocchi di Marsiglia unisce la psicologia junghiana,
                il pensiero strutturato del giurista e l'intuito affinato in anni di pratiche iniziatiche.
                Non interpreta simboli a caso — legge pattern, come fa con gli scacchi.
              </p>
              <p>
                Calore umano, empatia vera e una rara capacità di vedere oltre le parole.
                I suoi clienti tornano perché sentono la differenza.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <a href="#prenota" className="btn-gold">
                Prenota ora
              </a>
              <a
                href="https://stese.nonsolotarocchi.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 text-sm hover:text-gold-300 transition-colors flex items-center gap-1"
              >
                Prova le carte gratis
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Credentials grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {credentials.map((cred, i) => (
              <motion.div
                key={cred.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                className="mystical-card group cursor-default"
              >
                <div className="text-2xl mb-2">{cred.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-gold-400 transition-colors">
                  {cred.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">{cred.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
