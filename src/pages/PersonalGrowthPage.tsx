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

/** Sfondo “alba astratta”: gradienti soffusi + texture SVG leggerissima + overlay luminoso */
function CoachingDawnBackground() {
  const softTexture =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")"

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Base: grigio seta → salvia molto chiaro */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(165deg, #dce3de 0%, #d4dcd4 28%, #c8d0c8 52%, #c5c9c0 100%)',
        }}
      />
      {/* Alba in basso: bianco sporco e pesca gelido */}
      <div
        className="absolute inset-0 opacity-[0.92]"
        style={{
          background:
            'radial-gradient(ellipse 95% 65% at 50% 108%, rgba(255, 252, 248, 0.98) 0%, rgba(245, 240, 232, 0.55) 42%, transparent 72%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 50% 92%, rgba(255, 245, 230, 0.45) 0%, rgba(255, 250, 240, 0.12) 50%, transparent 68%)',
        }}
      />
      {/* Orizzonte: striscia luminosa (inizio giornata) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.18) 18%, transparent 42%)',
        }}
      />
      {/* Cielo superiore: ancora un velo di notte → chiarezza */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(148, 163, 158, 0.22) 0%, transparent 38%)',
        }}
      />
      {/* Texture quasi astratta */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-[0.35]"
        style={{ backgroundImage: softTexture }}
      />
      {/* Overlay chiaro: leggibilità e tono “studio / professionale” */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/25 to-white/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_30%,rgba(255,255,255,0.35)_0%,transparent_55%)]" />
    </div>
  )
}

const cardBase =
  'rounded-xl border backdrop-blur-sm shadow-[0_4px_28px_rgba(15,23,42,0.06)] border-slate-200/90 bg-white/80'

export default function PersonalGrowthPage() {
  const { user, isLoaded } = useUser()

  return (
    <div className="coaching-light-page relative left-1/2 w-screen -translate-x-1/2 min-h-screen overflow-hidden text-slate-800">
      <CoachingDawnBackground />

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
          <p className="text-slate-500 text-sm text-center max-w-2xl mx-auto mb-8">
            Conoscenza gratuita (10 min), sedute singole a <strong className="text-slate-700">70€</strong>, oppure un
            percorso di <strong className="text-slate-700">cinque sedute</strong>: cinque appuntamenti distinti,{' '}
            <strong className="text-slate-700">70€ a ogni prenotazione</strong> (totale indicativo 350€).
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
                apre il Calendly corretto (durata, prezzo e pagamento come da evento configurato).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-700 shrink-0 font-semibold">3.</span>
              <span>
                <strong className="text-slate-800">Pacchetto 5 sedute</strong> — il cliente prenota (e paga){' '}
                <strong className="text-slate-800">una seduta alla volta</strong> sullo stesso tipo di evento Calendly
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
              to="/dashboard?consult=coaching_intro"
              className="btn-gold text-center px-8 py-3 text-sm"
            >
              Vai al tuo Diario (10 min conoscenza)
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
