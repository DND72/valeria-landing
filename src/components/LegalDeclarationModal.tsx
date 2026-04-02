/**
 * LegalDeclarationModal
 *
 * Modale di autocertificazione legale sull'eta' maggiore.
 * Mostrato una sola volta per account: dopo il primo login / prima del checkout.
 * L'utente deve:
 *   1. Inserire la propria data di nascita
 *   2. Spuntare la checkbox di autocertificazione
 *   3. Cliccare "Confermo"
 *
 * I dati vengono inviati a POST /api/me/legal-declaration.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/clerk-react'
import { getApiBaseUrl } from '../constants/api'
import { computeAgeFromBirthday, isAdult, isValidPastDate, MINIMUM_AGE } from '../lib/ageUtils'

interface Props {
  onAccepted: () => void
}

export default function LegalDeclarationModal({ onAccepted }: Props) {
  const { getToken } = useAuth()
  const [birthday, setBirthday] = useState('')
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const age = birthday ? computeAgeFromBirthday(birthday) : null
  const birthdayValid = isValidPastDate(birthday) && isAdult(birthday)
  const canSubmit = birthdayValid && checked && !loading

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      const apiBase = getApiBaseUrl()
      if (apiBase) {
        const token = await getToken()
        if (token) {
          const res = await fetch(`${apiBase}/api/me/legal-declaration`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ declaredBirthday: birthday }),
          })
          if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as { error?: string }
            throw new Error(body.error ?? `Errore server (${res.status})`)
          }

          // Salva anche il consenso legale esplicito
          await fetch(`${apiBase}/api/me/legal-consent`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: 'v1.0-2024-04' }),
          })
        }
      }
      // Salva anche in sessionStorage per evitare la modale nel resto della sessione
      sessionStorage.setItem('valeria_legal_ok', '1')
      onAccepted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }, [canSubmit, birthday, getToken, onAccepted])

  // Calcola la data massima (oggi) e minima (120 anni fa) ammissibile
  const today = new Date().toISOString().slice(0, 10)
  const minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 120))
    .toISOString()
    .slice(0, 10)

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(5, 11, 25, 0.88)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.3 }}
          className="mystical-card max-w-lg w-full p-8 border border-gold-600/25 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
        >
          {/* Intestazione */}
          <div className="text-center mb-6">
            <span className="text-4xl mb-3 block" aria-hidden>🔞</span>
            <h2
              id="legal-modal-title"
              className="font-serif text-2xl font-bold text-white mb-2"
            >
              Verifica dell&apos;eta&apos;
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              I servizi di Valeria sono riservati esclusivamente ai{' '}
              <strong className="text-white/70">maggiori di 18 anni</strong>.
              Prima di accedere, ti chiediamo di compilare questa dichiarazione.
            </p>
          </div>

          {/* Data di nascita */}
          <div className="mb-5">
            <label
              htmlFor="legal-birthday"
              className="block text-white/60 text-xs uppercase tracking-wider mb-2"
            >
              La tua data di nascita *
            </label>
            <input
              id="legal-birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              min={minDate}
              max={today}
              className="w-full bg-dark-600/60 border border-white/15 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-600/60 transition-colors"
            />
            {/* Feedback real-time */}
            {birthday && isValidPastDate(birthday) && (
              <p
                className={`mt-2 text-xs flex items-center gap-1.5 ${
                  isAdult(birthday) ? 'text-emerald-400/80' : 'text-red-400/90'
                }`}
              >
                {isAdult(birthday) ? (
                  <>
                    <span aria-hidden>✓</span>
                    Hai {age} anni — accesso consentito
                  </>
                ) : (
                  <>
                    <span aria-hidden>✕</span>
                    Hai {age} anni — devi avere almeno {MINIMUM_AGE} anni per accedere
                  </>
                )}
              </p>
            )}
          </div>

          {/* Checkbox autocertificazione */}
          <label
            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all select-none ${
              checked
                ? 'border-gold-600/40 bg-gold-600/5'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <input
              type="checkbox"
              id="legal-checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 shrink-0 accent-yellow-500 w-4 h-4"
            />
            <span className="text-white/65 text-xs leading-relaxed">
              Dichiaro sotto la mia responsabilita&apos;, ai sensi dell&apos;art. 76 del DPR 445/2000,
              di essere <strong className="text-white/80">maggiorenne</strong> e che i dati forniti
              corrispondono al vero. <strong>Accetto i Termini di Servizio e confermo di aver letto la Privacy Policy.</strong>
              Sono consapevole che l&apos;erogazione del servizio{' '}
              <strong className="text-white/80">e&apos; vietata ai minori</strong> e che
              dichiarazioni false comportano responsabilita&apos; penale.
            </span>
          </label>

          {/* Errore */}
          {error && (
            <p className="mt-4 text-red-400/80 text-xs text-center bg-red-900/10 border border-red-800/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            id="legal-confirm-btn"
            className={`mt-6 w-full py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              canSubmit
                ? 'btn-gold'
                : 'bg-white/8 text-white/30 cursor-not-allowed'
            }`}
          >
            {loading ? 'Salvataggio…' : 'Confermo — ho almeno 18 anni'}
          </button>

          <p className="mt-4 text-white/25 text-[10px] text-center leading-relaxed">
            Questa dichiarazione viene registrata con timestamp e IP address
            ai fini della tutela legale ai sensi del GDPR e del DPR 445/2000.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
