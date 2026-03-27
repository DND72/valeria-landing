import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { PAYPAL_CONSULTI, paypalHostedCheckoutUrl } from '../constants/paypal'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import CalendlyEmbed from '../components/CalendlyEmbed'
import { CALENDLY_BOOKING_URL } from '../constants/calendly'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'
import { apiJson, ApiError } from '../lib/api'

/** Evita .split su null / tipi non stringa (Clerk a volte restituisce valori limite). */
function displayFirstName(user: {
  firstName: string | null | undefined
  emailAddresses?: { emailAddress: string | null | undefined }[] | null | undefined
}): string {
  const fn = user.firstName?.trim()
  if (fn) return fn
  const raw = user.emailAddresses?.[0]?.emailAddress
  if (typeof raw !== 'string' || raw.length === 0) return 'cara'
  const at = raw.indexOf('@')
  if (at <= 0) return 'cara'
  const local = raw.slice(0, at).trim()
  return local || 'cara'
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const calendarSectionRef = useRef<HTMLElement | null>(null)

  const [freeHidden, setFreeHidden] = useState(false)

  const [taxInfo, setTaxInfo] = useState<{
    showReminder: boolean
    donePaidConsults: number
    hasCodiceFiscale: boolean
  } | null>(null)
  const [taxFirst, setTaxFirst] = useState('')
  const [taxLast, setTaxLast] = useState('')
  const [taxCf, setTaxCf] = useState('')
  const [taxSubmitting, setTaxSubmitting] = useState(false)
  const [taxMessage, setTaxMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      setFreeHidden(window.localStorage.getItem('freeConsultHidden') === '1')
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !user || isPrivilegedClerkUser(user)) return
    if (!getApiBaseUrl()) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await apiJson<{
          showReminder: boolean
          donePaidConsults: number
          hasCodiceFiscale: boolean
        }>(getToken, '/api/me/tax-reminder')
        if (!cancelled) setTaxInfo(r)
      } catch {
        if (!cancelled) setTaxInfo(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isLoaded, user, getToken])

  // Deve stare prima del return: gli hook non possono essere dopo if (!user) return null
  const showFreeCard = !freeHidden

  if (!isLoaded) {
    return (
      <div className="min-h-screen px-6 py-24 flex flex-col items-center justify-center gap-4">
        <div
          className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin"
          aria-hidden
        />
        <p className="text-white/60 text-sm">Caricamento del tuo spazio…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  const privileged = isPrivilegedClerkUser(user)
  const firstName = displayFirstName(user)

  async function handleTaxSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTaxMessage(null)
    if (!getApiBaseUrl()) {
      setTaxMessage('Servizio dati non disponibile.')
      return
    }
    setTaxSubmitting(true)
    try {
      await apiJson(getToken, '/api/me/tax-code', {
        method: 'POST',
        body: JSON.stringify({
          firstName: taxFirst.trim(),
          lastName: taxLast.trim(),
          codiceFiscale: taxCf.trim(),
        }),
      })
      setTaxMessage('Grazie, i dati sono stati registrati.')
      setTaxInfo((prev) => (prev ? { ...prev, showReminder: false, hasCodiceFiscale: true } : prev))
    } catch (err) {
      const msg = err instanceof ApiError ? String(err.message) : 'Impossibile salvare. Riprova più tardi.'
      setTaxMessage(msg)
    } finally {
      setTaxSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12"
        >
          <div>
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-1">Il tuo spazio</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
                Ciao, <span className="gold-text">{firstName}</span> ✨
              </h1>
              {privileged && (
                <span
                  className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-gold-600/40 text-gold-400/90"
                  title="Prenotazione senza pagamento sul sito"
                >
                  Staff
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            {privileged && (
              <Link to="/control-room" className="btn-outline text-sm px-4 py-2 whitespace-nowrap">
                Control Room
              </Link>
            )}
          <button
            onClick={() => signOut(() => navigate('/'))}
            className="text-white/30 text-sm hover:text-white/60 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Esci
          </button>
          </div>
        </motion.div>

        {/* Free consultation card */}
        {showFreeCard && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden mb-8 p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(212,160,23,0.15) 0%, rgba(13,27,42,0.9) 100%)',
              border: '1px solid rgba(212,160,23,0.35)',
            }}
          >
            {/* Glow */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #fcd34d, #d4a017)' }}
            />

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-medium mb-4">
                    🎁 Regalo di benvenuto
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
                    Il tuo consulto gratuito<br />
                    <span className="gold-text">7 minuti con Valeria</span>
                  </h2>
                  <p className="text-white/50 text-sm max-w-md">
                    Benvenuta nella famiglia. Valeria ti aspetta per una lettura gratuita di 7 minuti —
                    il tuo primo passo nel mondo delle carte.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    className="btn-gold whitespace-nowrap"
                    onClick={() => {
                      setTimeout(() => calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Prenota ora — Gratis
                  </button>

                  <button
                    type="button"
                    className="btn-outline whitespace-nowrap"
                    onClick={() => {
                      setFreeHidden(true)
                      try {
                        window.localStorage.setItem('freeConsultHidden', '1')
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Non mostrarlo più
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: '🔮',
              title: 'Scegli prima la data',
              desc: 'Controlla subito disponibilita',
              href: '#prenota-calendly',
              cta: 'Scorri al calendario',
            },
            {
              icon: '🃏',
              title: 'App tarocchi gratuita',
              desc: 'Estrai le tue carte ogni giorno',
              href: 'https://stese.nonsolotarocchi.it',
              cta: 'Apri l\'app',
              external: true,
            },
            {
              icon: '⭐',
              title: 'Lascia una recensione',
              desc: 'Il tuo feedback aiuta altre persone',
              href: 'mailto:valeria@nonsolotarocchi.it?subject=Recensione consulto',
              cta: 'Scrivi a Valeria',
            },
          ].map((action, i) => (
            <motion.a
              key={action.title}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="mystical-card group block"
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-gold-400 transition-colors">
                {action.title}
              </h3>
              <p className="text-white/40 text-xs mb-3">{action.desc}</p>
              <span className="text-gold-500 text-xs flex items-center gap-1">
                {action.cta}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </motion.a>
          ))}
        </div>

        {/* Calendario completo — primo step */}
        <motion.section
          id="prenota-calendly"
          ref={calendarSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-8 scroll-mt-28"
        >
          <h2 className="font-serif text-xl font-bold text-white mb-1">1) Scegli data e ora</h2>
          <p className="text-white/40 text-sm mb-4">
            {privileged
              ? 'Scegli data e ora dal calendario. Per il tuo account non è richiesto il pagamento tramite questa pagina.'
              : 'Controlla disponibilita e scegli il tuo slot. Subito dopo puoi completare il pagamento del consulto scelto.'}
          </p>
          <div className="mystical-card p-0 overflow-hidden rounded-lg relative z-0 isolate max-h-[min(700px,85vh)]">
            <CalendlyEmbed url={CALENDLY_BOOKING_URL} minHeight={700} />
          </div>
        </motion.section>

        {/* Acquista consulti — nascosto per account staff (pagamento fuori dal sito). z-index sopra eventuali layer Calendly. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-8 relative z-30 isolate"
        >
          {privileged ? (
            <>
              <h2 className="font-serif text-xl font-bold text-white mb-1">2) Prenotazione staff</h2>
              <p className="text-white/40 text-sm mb-2">
                Questo account non richiede il pagamento tramite PayPal sul sito. Dopo aver scelto data e ora, la gestione economica resta diretta con Valeria.
              </p>
              <p className="text-white/30 text-xs mb-5 border-l border-gold-600/30 pl-3">
                I tre pulsanti PayPal compaiono solo ai clienti (account senza privilegio staff in Clerk). Se qui non li vedi, è normale: non sono “spariti” da PayPal.
              </p>
              <div
                className="mystical-card border border-gold-600/25"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,160,23,0.08) 0%, rgba(13,27,42,0.6) 100%)',
                }}
              >
                <p className="text-white/80 text-sm leading-relaxed">
                  Se serve modificare lo slot scelto, puoi tornare al calendario sopra e selezionare una disponibilita diversa.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-serif text-xl font-bold text-white mb-1">2) Scegli il consulto e completa il pagamento</h2>
              <p className="text-white/40 text-sm mb-2">
                Pagamento sicuro su PayPal (si apre in una nuova scheda) · anche con carta, senza caricare script PayPal in questa pagina.
              </p>
              <p className="text-white/30 text-xs mb-5 max-w-2xl">
                Quantità e prezzo dei pulsanti: account PayPal → Pulsanti PayPal → modifica il pulsante. Slot e calendario: Calendly → Tipi di evento → il tuo evento.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {PAYPAL_CONSULTI.map((c) => (
                  <div key={c.id} className="mystical-card text-center flex flex-col">
                    <div className="text-3xl mb-2">{c.icon}</div>
                    <h3 className="font-serif text-lg font-bold text-white mb-0.5">{c.name}</h3>
                    <p className="text-gold-500 text-xs mb-1">{c.duration}</p>
                    <p className="font-serif text-2xl font-bold mb-4" style={{
                      background: 'linear-gradient(135deg, #ffe066, #ffd700)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>{c.price}</p>
                    <a
                      href={paypalHostedCheckoutUrl(c.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-sm px-4 py-2.5 inline-flex items-center justify-center gap-2 w-full mt-auto"
                    >
                      Paga con PayPal
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {!privileged && taxInfo?.showReminder && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8 mystical-card border border-amber-600/30"
          >
            <h3 className="font-serif text-lg font-bold text-white mb-1">Dati per fatturazione</h3>
            <p className="text-white/50 text-sm mb-4">
              Dopo diversi consulti completati, per la contabilità servono nome, cognome e codice fiscale. Non blocca la
              prenotazione: puoi compilare quando preferisci.
            </p>
            {taxInfo.donePaidConsults >= 3 && (
              <p className="text-amber-200/80 text-xs mb-4">
                Consulti pagati registrati come completati: <strong>{taxInfo.donePaidConsults}</strong>
              </p>
            )}
            <form onSubmit={(e) => void handleTaxSubmit(e)} className="grid gap-3 sm:grid-cols-2 max-w-lg">
              <label className="block sm:col-span-1">
                <span className="text-white/45 text-xs block mb-1">Nome</span>
                <input
                  required
                  value={taxFirst}
                  onChange={(e) => setTaxFirst(e.target.value)}
                  className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                  autoComplete="given-name"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="text-white/45 text-xs block mb-1">Cognome</span>
                <input
                  required
                  value={taxLast}
                  onChange={(e) => setTaxLast(e.target.value)}
                  className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                  autoComplete="family-name"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-white/45 text-xs block mb-1">Codice fiscale</span>
                <input
                  required
                  minLength={11}
                  maxLength={16}
                  value={taxCf}
                  onChange={(e) => setTaxCf(e.target.value.toUpperCase())}
                  className="w-full max-w-sm bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white font-mono tracking-wide"
                  autoComplete="off"
                />
              </label>
              <button type="submit" className="btn-gold text-sm px-5 py-2.5 sm:col-span-2 w-fit" disabled={taxSubmitting}>
                {taxSubmitting ? 'Salvataggio…' : 'Salva dati'}
              </button>
            </form>
            {taxMessage && (
              <p className={`text-sm mt-3 ${taxMessage.startsWith('Grazie') ? 'text-emerald-400/90' : 'text-red-400/90'}`}>
                {taxMessage}
              </p>
            )}
          </motion.div>
        )}

        {/* Profile info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mystical-card"
        >
          <h3 className="font-semibold text-white/70 text-sm mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Il tuo profilo
          </h3>
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img src={user.imageUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-gold-600/30" />
            )}
            <div>
              <p className="text-white font-medium">{user.fullName || firstName}</p>
              <p className="text-white/40 text-sm">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
