import { useState } from 'react'
import { SignUp } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { computeAgeFromBirthday, isAdult, isValidPastDate, MINIMUM_AGE } from '../lib/ageUtils'

// Data massima selezionabile (oggi) e minima (120 anni fa)
const TODAY = new Date().toISOString().slice(0, 10)
const MIN_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 120))
  .toISOString()
  .slice(0, 10)

export default function SignUpPage() {
  // Strato 1: verifica eta' prima di mostrare il widget Clerk
  const [birthday, setBirthday] = useState('')
  const [ageCheckPassed, setAgeCheckPassed] = useState(false)

  const age = birthday ? computeAgeFromBirthday(birthday) : null
  const birthdayValid = isValidPastDate(birthday) && birthday !== ''
  const adult = birthdayValid ? isAdult(birthday) : null // null = non ancora compilato

  function handleContinue() {
    if (adult) {
      // Salva la data in sessionStorage per il recupero post-signup
      sessionStorage.setItem('valeria_signup_birthday', birthday)
      setAgeCheckPassed(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full flex flex-col items-center gap-8"
      >
        {/* ------------------------------------------------------------------ */}
        {/* STRATO 1: Age Gate                                                 */}
        {/* ------------------------------------------------------------------ */}
        <AnimatePresence mode="wait">
          {!ageCheckPassed ? (
            <motion.div
              key="age-gate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mystical-card max-w-md w-full p-8 border border-gold-600/20 shadow-2xl"
            >
              {/* Intestazione */}
              <div className="text-center mb-6">
                <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-2">
                  Benvenuta
                </p>
                <h1 className="font-serif text-3xl font-bold text-white mb-2">
                  Crea il tuo <span className="gold-text">Diario</span>
                </h1>
                <p className="text-white/50 text-sm max-w-xs mx-auto">
                  Registrati e ricevi subito un{' '}
                  <strong className="text-gold-400">consulto gratuito di 7 minuti</strong> con Valeria
                </p>
              </div>

              {/* Avviso VM18 */}
              <div className="mb-5 flex items-start gap-3 bg-amber-900/10 border border-amber-700/20 rounded-lg px-4 py-3">
                <span className="text-lg mt-0.5" aria-hidden>🔞</span>
                <p className="text-amber-200/80 text-xs leading-relaxed">
                  I servizi di Valeria sono riservati ai{' '}
                  <strong>maggiori di 18 anni</strong>. Prima di procedere,
                  inserisci la tua data di nascita.
                </p>
              </div>

              {/* Input data di nascita */}
              <label
                htmlFor="signup-birthday"
                className="block text-white/60 text-xs uppercase tracking-wider mb-2"
              >
                Data di nascita <span className="text-gold-500">*</span>
              </label>
              <input
                id="signup-birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                min={MIN_DATE}
                max={TODAY}
                className="w-full bg-dark-600/60 border border-white/15 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-600/60 transition-colors mb-3"
                aria-required="true"
                aria-describedby="birthday-feedback"
              />

              {/* Feedback real-time */}
              <div id="birthday-feedback" aria-live="polite" className="min-h-[20px] mb-4">
                {birthdayValid && adult === false && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400/90 text-sm flex items-start gap-2"
                    role="alert"
                  >
                    <span aria-hidden className="mt-0.5">✕</span>
                    <span>
                      Ci spiace, i servizi di Valeria sono riservati esclusivamente ai maggiori
                      di {MINIMUM_AGE} anni.
                      {age !== null && ` Dai nostri calcoli hai ${age} anni.`}
                    </span>
                  </motion.p>
                )}
                {birthdayValid && adult === true && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-400/80 text-sm flex items-center gap-2"
                  >
                    <span aria-hidden>✓</span>
                    Hai {age} anni — puoi procedere con la registrazione
                  </motion.p>
                )}
              </div>

              {/* CTA */}
              <button
                type="button"
                id="age-gate-continue-btn"
                onClick={handleContinue}
                disabled={adult !== true}
                aria-disabled={adult !== true}
                className={`w-full py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  adult === true
                    ? 'btn-gold'
                    : 'bg-white/8 text-white/30 cursor-not-allowed'
                }`}
              >
                Continua con la registrazione
              </button>

              {/* Link login */}
              <p className="text-center text-white/30 text-xs mt-4">
                Hai gia&apos; un account?{' '}
                <Link to="/accedi" className="text-gold-500/70 hover:text-gold-400 underline underline-offset-2">
                  Accedi
                </Link>
              </p>
            </motion.div>
          ) : (
            // ----------------------------------------------------------------
            // STRATO 1 superato: mostra widget Clerk
            // ----------------------------------------------------------------
            <motion.div
              key="clerk-widget"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <div className="text-center">
                <p className="text-emerald-400/80 text-sm flex items-center justify-center gap-2 mb-2">
                  <span aria-hidden>✓</span> Eta&apos; verificata — puoi continuare
                </p>
                <p className="text-white/30 text-xs max-w-xs mx-auto">
                  🔒 Scegli una password di almeno 8 caratteri. Riceverai un codice via email per confermare il tuo account.
                </p>
                <p className="text-white/20 text-xs max-w-sm mx-auto mt-2 leading-relaxed">
                  Registrandoti accetti i nostri{' '}
                  <Link to="/termini" className="text-gold-500/60 hover:text-gold-400 underline underline-offset-2">
                    Termini di servizio
                  </Link>
                  {' '}e la nostra{' '}
                  <a
                    href="https://www.iubenda.com/privacy-policy/XXXXXXXX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-500/60 hover:text-gold-400 underline underline-offset-2"
                  >
                    Privacy Policy
                  </a>.
                </p>
              </div>

              <SignUp
                routing="path"
                path="/registrati"
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  variables: {
                    colorPrimary: '#d4a017',
                    colorBackground: '#0d1b2a',
                    colorText: '#f5f0e8',
                    colorTextSecondary: '#a0a0a0',
                    colorInputBackground: '#0a1628',
                    colorInputText: '#f5f0e8',
                    borderRadius: '8px',
                  },
                  elements: {
                    card: 'shadow-2xl border border-gold-600/20',
                    headerTitle: 'font-serif text-white',
                    socialButtonsBlockButton: 'border-gold-600/30 text-white hover:bg-gold-600/10',
                    formButtonPrimary: 'bg-gradient-to-r from-gold-600 to-gold-300 text-dark-500 font-semibold',
                    footerActionLink: 'text-gold-400 hover:text-gold-300',
                    formFieldErrorText: 'text-red-400 text-sm',
                    alertText: 'text-red-300 text-sm',
                  },
                }}
                signInUrl="/accedi"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
