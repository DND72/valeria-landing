import { motion } from 'framer-motion'

type PillarIcon = 'structure' | 'vision' | 'care' | 'tradition'

const credentials: { icon: PillarIcon; title: string; desc: string }[] = [
  {
    icon: 'structure',
    title: 'Analisi e Struttura del Pensiero',
    desc:
      'Il rigore del ragionamento giuridico unito alla comprensione profonda delle dinamiche mentali. Questa base accademica permette una lettura dei simboli che non è mai casuale, ma basata su una struttura logica e psicologica ferma.',
  },
  {
    icon: 'vision',
    title: "Visione d'Insieme e Dinamica",
    desc:
      'La capacità di analizzare scenari complessi e riconoscere i momenti di svolta prima che si manifestino. Valeria applica alle carte la stessa lucidità necessaria per gestire i flussi e le forze in campo.',
  },
  {
    icon: 'care',
    title: "Cura e Ascolto dell'Individuo",
    desc:
      'Quindici anni di accoglienza e gestione del benessere quotidiano in Liguria. Una solida esperienza nel comprendere le necessità reali delle persone, ponendo al centro l&apos;equilibrio tra mente, corpo e spirito.',
  },
  {
    icon: 'tradition',
    title: 'Tradizione e Conoscenza Antica',
    desc:
      'Un percorso esoterico decennale tra i più antichi e rigorosi. Una sapienza che non si studia solo sui libri, ma si riceve e si vive, permettendo di interpretare i Tarocchi di Marsiglia nella loro veste più autentica e operativa.',
  },
]

function PillarIconSvg({ name }: { name: PillarIcon }) {
  const cls = 'w-6 h-6 shrink-0 text-gold-400/70'
  switch (name) {
    case 'structure':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 10.5l9.75-3m-9.75 3L12 14.25m0 0l9.75-3m-9.75 3L2.25 12"
          />
        </svg>
      )
    case 'vision':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )
    case 'care':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )
    case 'tradition':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )
    default:
      return null
  }
}

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

          {/* Pilastri del metodo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#141418] via-[#0e0e12] to-[#09090b] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_75%_45%_at_50%_15%,rgba(212,160,23,0.07),transparent_60%)]"
              aria-hidden
            />
            <p className="relative text-[10px] uppercase tracking-[0.2em] text-white/35 mb-4">Pilastri del metodo</p>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
              {credentials.map((cred, i) => (
                <motion.div
                  key={cred.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.08 + i * 0.06 }}
                  className="group rounded-xl border border-white/[0.08] bg-black/35 backdrop-blur-sm p-4 transition-colors hover:border-gold-600/25"
                >
                  <div className="mb-3 flex items-center gap-2.5">
                    <PillarIconSvg name={cred.icon} />
                  </div>
                  <h3 className="font-serif text-[15px] font-semibold leading-snug text-white/95 mb-2 group-hover:text-gold-400/95 transition-colors">
                    {cred.title}
                  </h3>
                  <p className="text-white/45 text-[13px] leading-relaxed">{cred.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
