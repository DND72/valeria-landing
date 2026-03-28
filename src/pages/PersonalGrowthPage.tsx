import { useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CONSULT_CHOICES } from '../constants/consultations'

const COACHING_PACKAGES = CONSULT_CHOICES.filter((c) => c.kind.startsWith('coaching_'))

const PACKAGE_BLURBS: Record<string, string> = {
  coaching_intro:
    'Per conoscervi, capire cosa vi serve e iniziare a definire obiettivi. Dieci minuti senza impegno: capite con chi avete a che fare e Valeria capisce voi.',
  coaching_60:
    'Una sessione da un’ora (70€ su Calendly, come da evento): lavoro su priorità, abitudini e direzione — video o telefono.',
  coaching_pack5:
    'Percorso da cinque incontri da un’ora: ogni seduta è un appuntamento Calendly a sé — al momento della prenotazione si paga quella seduta (70€). Cinque prenotazioni = cinque pagamenti; totale indicativo 350€. Non esiste un unico addebito che sblocca tutte le date: prenoti (e paghi) una seduta alla volta.',
}

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

      <div className="relative z-10 max-w-5xl mx-auto">
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
            cura: ascolto, strumenti, un passo alla volta.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mystical-card border border-emerald-600/20 mb-10"
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
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mb-6"
        >
          <h2
            id="pacchetti"
            className="font-serif text-2xl md:text-3xl font-bold text-white text-center mb-2 scroll-mt-28"
          >
            Pacchetti
          </h2>
          <p className="text-white/40 text-sm text-center max-w-2xl mx-auto mb-8">
            Conoscenza gratuita (10 min), sedute singole a <strong className="text-white/55">70€</strong>, oppure un
            percorso di <strong className="text-white/55">cinque sedute</strong>: cinque appuntamenti distinti,{' '}
            <strong className="text-white/55">70€ a ogni prenotazione</strong> (totale indicativo 350€).
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {COACHING_PACKAGES.map((pkg, i) => {
              const isFree = pkg.kind === 'coaching_intro'
              return (
                <motion.div
                  key={pkg.kind}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 + i * 0.06 }}
                  className={`mystical-card flex flex-col text-center border ${
                    isFree ? 'border-emerald-600/35 bg-emerald-950/10' : 'border-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{pkg.icon}</div>
                  <h3 className="font-serif text-lg font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-gold-500/90 text-xs mb-2">{pkg.duration}</p>
                  <p
                    className="font-serif text-2xl font-bold mb-4"
                    style={{
                      background: isFree
                        ? 'linear-gradient(135deg, #86efac, #22c55e)'
                        : 'linear-gradient(135deg, #ffe066, #ffd700)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {pkg.priceLabel}
                  </p>
                  <p className="text-white/50 text-sm leading-relaxed flex-1 mb-5 text-left">
                    {PACKAGE_BLURBS[pkg.kind]}
                  </p>
                  {isLoaded && user && (
                    <Link
                      to={`/dashboard?consult=${pkg.kind}`}
                      className="btn-gold text-sm px-4 py-2.5 w-full mt-auto"
                    >
                      Prenota questo pacchetto
                    </Link>
                  )}
                  {isLoaded && !user && (
                    <p className="text-white/35 text-xs mt-auto">
                      <Link to="/registrati" className="text-gold-500/90 underline underline-offset-2">
                        Registrati
                      </Link>{' '}
                      o{' '}
                      <Link to="/accedi" className="text-gold-500/90 underline underline-offset-2">
                        accedi
                      </Link>{' '}
                      per prenotare.
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mystical-card border border-white/10 mb-8"
        >
          <h2 className="font-serif text-xl font-bold text-white mb-3">Come funziona</h2>
          <ul className="space-y-3 text-white/55 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="text-emerald-500/90 shrink-0">1.</span>
              <span>
                <strong className="text-white/75">Account</strong> — come per le letture, la prenotazione passa dal tuo
                spazio personale.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500/90 shrink-0">2.</span>
              <span>
                <strong className="text-white/75">Scegli il pacchetto</strong> — sopra o tra le card nel profilo: poi si
                apre il Calendly corretto (durata, prezzo e pagamento come da evento configurato).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500/90 shrink-0">3.</span>
              <span>
                <strong className="text-white/75">Pacchetto 5 sedute</strong> — il cliente prenota (e paga){' '}
                <strong className="text-white/80">una seduta alla volta</strong> sullo stesso tipo di evento Calendly
                (70€ per appuntamento, di solito con PayPal in checkout). Ripete per le cinque date. Il sito non
                &quot;blocca&quot; in automatico le cinque prenotazioni: il percorso è chiaro dalle regole e dal
                dialogo con Valeria.
              </span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
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
          transition={{ duration: 0.55, delay: 0.28 }}
          className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center"
        >
          {isLoaded && user && (
            <Link
              to="/dashboard?consult=coaching_intro"
              className="btn-gold text-center px-8 py-3 text-sm"
            >
              Vai al tuo spazio (10 min conoscenza)
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
          {!isLoaded && <span className="text-white/35 text-sm px-4 py-2">Caricamento…</span>}
          <Link to="/" className="btn-outline text-center px-8 py-3 text-sm border-white/15 text-white/50">
            Torna alla home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
