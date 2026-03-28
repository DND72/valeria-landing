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
    desc: 'Titolo FIDE · ID 373110313. Specialista dei finali, analisi post-partita rigorosa, riconoscimento di pattern complessi. Le stesse qualità che porta in ogni lettura dei tarocchi.',
  },
  {
    icon: '🌿',
    title: 'Parafarmacia Energia & Benessere',
    desc: 'Titolare per 15 anni della Parafarmacia Energia & Benessere in Liguria. La cura della persona — mente, corpo e spirito — è da sempre la sua missione.',
  },
  {
    icon: '⚔️',
    title: 'Dama Templare · Commander Regionale',
    desc: 'Grado di Commander nell\'Ordine Templare. Un percorso cavalleresco ed esoterico tra i più antichi e rigorosi.',
  },
  {
    icon: '🕊️',
    title: 'Ambasciatrice di Pace',
    desc: 'Onorificenza conferita per impegno nel dialogo, nella cultura e nella crescita spirituale dell\'individuo.',
  },
  {
    icon: '🌟',
    title: 'Percorso Alchemico',
    desc: 'Formazione trasmessa attraverso percorsi alchemici e tradizioni ermetiche. Una conoscenza che non si studia sui libri — si riceve e si vive.',
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
                Valeria Di Pace non è la solita tarologa. Il suo metodo nasce dall&apos;unione tra tre diversi percorsi
                accademici e una ricerca interiore profonda durata oltre un ventennio.
              </p>
              <p>
                La sua analisi dei Tarocchi di Marsiglia integra la psicologia del profondo con una straordinaria capacità
                di visione d&apos;insieme. Valeria non legge simboli isolati: individua i fili invisibili che collegano gli
                eventi, decodificando la realtà con la precisione di chi sa guardare oltre l&apos;apparenza.
              </p>
              <p>
                Mente, corpo, spirito. Valeria conosce l&apos;interazione tra questi livelli e nelle carte li vede agire
                simultaneamente. Chi si rivolge a lei avverte subito la differenza: non riceve solo una lettura, ma una
                mappa chiara della propria situazione e una direzione precisa per l&apos;azione.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-lg border border-gold-600/20 bg-gold-600/5">
              <p className="font-serif text-lg font-bold text-gold-400 mb-1">L&apos;Arte della Visione e del Rigore</p>
              <p className="text-gold-500/85 text-xs font-medium tracking-wide mb-3">
                Dalla complessità alla chiarezza: lo stesso metodo
              </p>
              <p className="text-white/50 text-sm leading-relaxed italic">
                &ldquo;Saper guardare l&apos;insieme senza perdere il dettaglio, riconoscere i momenti di svolta e mantenere
                una lucidità assoluta. Valeria porta nella lettura delle carte lo stesso rigore analitico che applica ad ogni
                sistema complesso: una capacità rara di vedere dove si incrociano le forze del destino e dove, invece, è
                possibile agire per cambiare rotta.&rdquo;
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
