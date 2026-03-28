import { useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function PersonalGrowthPage() {
  const { user, isLoaded } = useUser()

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 18%, rgba(34,197,94,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-emerald-400/90 text-sm font-medium tracking-widest uppercase mb-4">Percorsi</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Crescita personale <span className="gold-text">(coaching)</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Oltre alle letture con i tarocchi, Valeria accompagna percorsi di chiarezza e obiettivi — con la stessa
            cura e lo stesso schema: ascolto, strumenti, un passo alla volta.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mystical-card border border-emerald-600/20 mb-8"
        >
          <h2 className="font-serif text-xl font-bold text-white mb-3">Di cosa si tratta</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Sessioni dedicate a <strong className="text-white/80">obiettivi personali</strong>, scelte, abitudini e
            direzione — in dialogo con i temi simbolici che già conosci dal lavoro con le carte, ma senza che la seduta
            sia necessariamente centrata su una stesa.
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            Valeria ha una <strong className="text-white/80">formazione in psicologia</strong>: qui offre un
            accompagnamento di <strong className="text-white/80">crescita personale e coaching</strong>, non una
            terapia clinica e non un servizio riservato agli iscritti all&apos;ordine professionale dei psicologi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="mystical-card border border-white/10 mb-8"
        >
          <h2 className="font-serif text-xl font-bold text-white mb-3">Come funziona</h2>
          <ul className="space-y-3 text-white/55 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="text-emerald-500/90 shrink-0">1.</span>
              <span>
                <strong className="text-white/75">Account</strong> — come per le letture, la prenotazione passa dal tuo
                spazio personale sul sito.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500/90 shrink-0">2.</span>
              <span>
                <strong className="text-white/75">Tipo di sessione</strong> — scegli la card &quot;Crescita
                personale&quot; nel tuo profilo e poi data e ora su Calendly.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500/90 shrink-0">3.</span>
              <span>
                <strong className="text-white/75">Incontro</strong> — video o telefono, secondo disponibilità e
                impostazioni concordate.
              </span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4 mb-10"
        >
          <p className="text-white/40 text-xs leading-relaxed">
            Se stai attraversando una difficoltà che richiede supporto clinico o psicoterapeutico, rivolgiti a un
            professionista abilitato nella tua zona. Questo percorso non sostituisce il parere medico né trattamenti
            sanitari.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.26 }}
          className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center"
        >
          {isLoaded && user && (
            <Link
              to="/dashboard?consult=coaching"
              className="btn-gold text-center px-8 py-3 text-sm"
            >
              Prenota dal tuo spazio
            </Link>
          )}
          {isLoaded && !user && (
            <>
              <Link to="/registrati" className="btn-gold text-center px-8 py-3 text-sm">
                Crea un account
              </Link>
              <Link to="/accedi" className="btn-outline text-center px-8 py-3 text-sm">
                Accedi
              </Link>
            </>
          )}
          {!isLoaded && (
            <span className="text-white/35 text-sm px-4 py-2">Caricamento…</span>
          )}
          <Link to="/" className="btn-outline text-center px-8 py-3 text-sm border-white/15 text-white/50">
            Torna alla home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
