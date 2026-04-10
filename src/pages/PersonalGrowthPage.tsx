import { useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CONSULT_CHOICES } from '../constants/consultations'

const COACHING_PACKAGES = CONSULT_CHOICES.filter((c) => c.kind.startsWith('coaching_'))

const PACKAGE_BLURBS: Record<string, string> = {
  coaching_flash:
    'Supporto immediato: superare l\'urgenza, ritrovare la lucidità sul momento e inquadrare l\'obiettivo sul posto.',
  coaching_prenotabile:
    'Percorso profondo: programmazione, continuità e scavo senza fretta con Valeria a cadenza concordata.',
}

/** Alba fotografica (public/crescita-alba.png) + overlay per leggibilità testi */
function CoachingSeminarBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 bg-no-repeat opacity-20"
        style={{
          backgroundColor: '#dfe5df',
          backgroundImage: 'url(/valeria-seminario.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
        }}
      />
    </div>
  )
}

const cardBase =
  'rounded-xl border backdrop-blur-sm shadow-[0_4px_28px_rgba(15,23,42,0.06)] border-slate-200/90 bg-white/80'

export default function PersonalGrowthPage() {
  const { user, isLoaded } = useUser()

  return (
    <div className="coaching-light-page relative left-1/2 w-screen -translate-x-1/2 min-h-screen overflow-hidden text-slate-800">
      <CoachingSeminarBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-emerald-900/75 text-sm font-medium tracking-widest uppercase mb-4">Percorsi</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Crescita personale{' '}
            <span className="italic text-emerald-900/90 font-semibold">(coaching)</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
            Oltre alle letture con i tarocchi, Valeria accompagna percorsi di chiarezza e obiettivi — con la stessa
            cura: ascolto, strumenti, un passo alla volta.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className={`${cardBase} border-emerald-200/80 mb-10 p-6 md:p-8`}
        >
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">Di cosa si tratta</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Sessioni dedicate a <strong className="text-slate-800">obiettivi personali</strong>, scelte, abitudini e
            direzione — in dialogo con i temi simbolici che già conosci dal lavoro con le carte, ma senza che la seduta
            sia necessariamente centrata su una stesa.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Valeria ha una <strong className="text-slate-800">formazione in psicologia</strong>: qui offre un
            accompagnamento di <strong className="text-slate-800">crescita personale e coaching</strong>, non una
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
            className="font-serif text-2xl md:text-3xl font-bold text-slate-900 text-center mb-2 scroll-mt-28"
          >
            Pacchetti
          </h2>
          Conoscenza gratuita (7 min), oppure le opzioni standard: <strong className="text-slate-700">Immediato (Flash)</strong> o <strong className="text-slate-700">Programmato (Prenotabile)</strong>, con tariffazione semplice valutata per i soli minuti effettivi del consulto.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {COACHING_PACKAGES.map((pkg, i) => {
              const isFree = false
              return (
                <motion.div
                  key={pkg.kind}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 + i * 0.06 }}
                  className={`${cardBase} flex flex-col text-center p-6 ${
                    isFree ? 'border-emerald-300/90 bg-emerald-50/70' : ''
                  }`}
                >
                  <div className="text-3xl mb-2">{pkg.icon}</div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>
                  <p className="text-emerald-800/85 text-xs mb-2">{pkg.duration}</p>
                  <p
                    className="font-serif text-2xl font-bold mb-4"
                    style={{
                      background: isFree
                        ? 'linear-gradient(135deg, #15803d, #059669)'
                        : 'linear-gradient(135deg, #b45309, #d97706)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {pkg.priceLabel}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5 text-left">
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
                    <p className="text-slate-500 text-xs mt-auto">
                      <Link to="/registrati" className="text-emerald-800 font-medium underline underline-offset-2">
                        Registrati
                      </Link>{' '}
                      o{' '}
                      <Link to="/accedi" className="text-emerald-800 font-medium underline underline-offset-2">
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
          className={`${cardBase} mb-8 p-6 md:p-8`}
        >
          <h2 className="font-serif text-xl font-bold text-slate-900 mb-3">Come funziona</h2>
          <ul className="space-y-3 text-slate-600 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="text-emerald-700 shrink-0 font-semibold">1.</span>
              <span>
                <strong className="text-slate-800">Account</strong> — come per le letture, la prenotazione passa dal tuo
                Diario.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-700 shrink-0 font-semibold">2.</span>
              <span>
                <strong className="text-slate-800">Scegli il pacchetto</strong> — sopra o tra le card nel profilo: poi si
                apre il calendario corretto caricando le tue disponibilità in tempo reale.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-700 shrink-0 font-semibold">3.</span>
              <span>
                <strong className="text-slate-800">Pacchetto 5 sedute</strong> — il cliente prenota <strong className="text-slate-800">una seduta alla volta</strong> sul calendario interno. 
                Il costo in Crediti verrà scalato automaticamente dal tuo Wallet ad ogni prenotazione confermata. Ripeti l'operazione per le cinque date a seconda dei tuoi ritmi concordati con Valeria.
              </span>
            </li>
          </ul>
          {/* Disclaimer legale statico */}
          <p className="text-slate-500 text-[11px] mt-6 leading-relaxed border-t border-slate-200/60 pt-4">
            Prenotando un consulto dichiari di avere almeno 18 anni e di accettare i{' '}
            <Link to="/termini" className="text-emerald-800 font-medium underline underline-offset-2">
              Termini di servizio
            </Link>
            .
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="rounded-lg border border-slate-200/90 bg-slate-100/60 px-5 py-4 mb-10 backdrop-blur-sm"
        >
          <p className="text-slate-500 text-xs leading-relaxed">
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
              to="/dashboard?consult=coaching_prenotabile"
              className="btn-gold text-center px-8 py-3 text-sm"
            >
              Vai al tuo Diario (Coaching)
            </Link>
          )}
          {isLoaded && !user && (
            <>
              <Link to="/registrati" className="btn-gold text-center px-8 py-3 text-sm">
                Crea un account
              </Link>
              <Link
                to="/accedi"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium border border-slate-300 text-slate-700 bg-white/80 hover:bg-white hover:border-slate-400 transition-colors"
              >
                Accedi
              </Link>
            </>
          )}
          {!isLoaded && <span className="text-slate-500 text-sm px-4 py-2">Caricamento…</span>}
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm border border-slate-300/90 text-slate-600 bg-white/50 hover:bg-white/90 transition-colors"
          >
            Torna alla home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
