import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

type PillarIcon = 'structure' | 'vision' | 'care' | 'tradition'

const credentials: { icon: PillarIcon; title: string; desc: string }[] = [
  {
    icon: 'structure',
    title: 'Analisi e Struttura Strategica',
    desc:
      'Il rigore del ragionamento strategico unito al titolo di Arena International Master (FIDE). Questa eccellenza negli scacchi permette una lettura dei simboli che non è mai casuale, ma basata su una struttura logica, tattica e psicologica di altissimo livello.',
  },
  {
    icon: 'vision',
    title: "Visione d'Insieme e Dinamica",
    desc:
      'La capacità di analizzare scenari complessi e riconoscere i momenti di svolta prima che si manifestino. Valeria applica alle carte la stessa lucidità necessaria per gestire i flussi e le forze in campo.',
  },
  {
    icon: 'care',
    title: "Naturopatia ed Equilibrio Olistico",
    desc:
      'Diplomata in Naturopatia con Master specialistici e formata all\'uso dei Fiori di Bach. Fortemente radicata nello storico studio in Liguria, Valeria accompagna le persone verso un benessere profondo, lavorando sul riequilibrio energetico piuttosto che su facili promesse di "guarigione".',
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
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-8">
              Cultura, Metodo.
              <br />
              <span className="gold-text italic">Un Antico Dono.</span>
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed text-sm md:text-base">
              <p>
                Valeria Di Pace è una figura poliedrica in cui la <strong>profondità esoterica</strong> si fonde con una 
                formazione culturale di eccezionale rigore. Laureata in <strong>Psicologia</strong> e <strong>Giurisprudenza</strong>,
                porta nell'analisi dell'anima la precisione del diritto e l'empatia clinica necessaria per decodificare il vissuto umano.
              </p>
              <p>
                Il suo percorso accademico non si ferma qui: gli studi in <strong>Farmacia</strong> hanno forgiato una mente capace 
                di comprendere le interazioni molecolari e biochimiche più complesse. Questa disciplina, tra le più ardue del panorama
                scientifico, le ha conferito una capacità di analisi chirurgica e un rispetto profondo per l'equilibrio della vita, 
                dalle cellule allo spirito.
              </p>
              <p>
                Attrice e esperta di simbolismo, Valeria applica ai Tarocchi di Marsiglia un protocollo strutturato 
                che non lascia spazio alla casualità. Diplomata in <strong>Naturopatia</strong> e formata all'uso dei Fiori di Bach, 
                vede nelle carte non semplici disegni, ma una mappa dinamica della psiche e dell'energia.
              </p>
              <p>
                Non troverai in lei facili promesse o misticismi vaghi. Riceverai invece il frutto di una vita dedicata allo 
                studio dell'uomo in ogni sua declinazione: legale, biologica, psicologica e spirituale. Un approccio unico per chi
                cerca risposte autentiche e una guida che possiede gli strumenti per svelare l'invisibile.
              </p>
            </div>

            <div className="mt-8 p-6 rounded-2xl border border-gold-600/20 bg-gold-600/5 backdrop-blur-sm">
              <p className="font-serif text-xl font-bold text-gold-400 mb-2">Scienza e Simbolo</p>
              <p className="text-gold-500/85 text-xs font-medium tracking-wide mb-4">
                La fusione tra studio accademico e sapienza esoterica
              </p>
              <p className="text-white/50 text-sm leading-relaxed italic">
                &ldquo;Dalla chimica farmaceutica alla psicologia del profondo, ogni tappa del mio percorso è stata un gradino verso 
                una comprensione integrale dell'individuo. Nei Tarocchi porto lo stesso rigore che si applica in un laboratorio o in 
                un'aula di tribunale: le stelle sono precise come molecole, basta saperle leggere.&rdquo;
              </p>
            </div>

            <div className="mt-12">
               <p className="text-gold-500 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                 <span className="h-[1px] w-8 bg-gold-500/30" />
                 Carriera e Riconoscimenti
               </p>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <motion.div 
                   whileHover={{ scale: 1.02 }}
                   className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[4/5]"
                 >
                   <img src="/valeria-award-1.jpg" alt="Premio Rete 4" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                   <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[10px] text-gold-400 font-bold uppercase">Premio alla Carriera</p>
                     <p className="text-[9px] text-white/70">Programma Modamania, Rete Quattro</p>
                   </div>
                 </motion.div>
                 
                 <motion.div 
                   whileHover={{ scale: 1.02 }}
                   className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[4/5]"
                 >
                   <img src="/valeria-award-2.jpg" alt="Anzio Film Festival" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                   <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[10px] text-gold-400 font-bold uppercase">Premio Speciale 2024</p>
                     <p className="text-[9px] text-white/70">Anzio Film Festival, Attrice</p>
                   </div>
                 </motion.div>

                 <motion.div 
                   whileHover={{ scale: 1.02 }}
                   className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[4/5] col-span-2 md:col-span-1"
                 >
                   <img src="/valeria-carriera.jpg" alt="Valeria sul palco" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                   <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[10px] text-gold-400 font-bold uppercase">Madrina d'Eccezione</p>
                     <p className="text-[9px] text-white/70">Eventi Cinema e Moda</p>
                   </div>
                 </motion.div>
               </div>
            </div>
 
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/tarocchi" className="btn-gold">
                Scopri il mondo dei Tarocchi
              </Link>
              <a href="#prenota" className="text-white/60 hover:text-gold-400 text-sm font-bold uppercase tracking-widest transition-colors">
                Prenota ora
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
                  <div className="mb-3 flex items-center justify-between gap-2.5">
                    <PillarIconSvg name={cred.icon} />
                    {cred.icon === 'structure' && (
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-gold-500/30">
                        <img src="/valeria-chess.jpg" alt="Valeria Scacchi" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {cred.icon === 'tradition' && (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gold-500/30">
                        <img src="/valeria-templare-mini.jpg" alt="Valeria Templare" className="w-full h-full object-cover" />
                      </div>
                    )}
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
