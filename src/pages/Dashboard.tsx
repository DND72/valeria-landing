import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import CalendlyEmbed from '../components/CalendlyEmbed'
import PrivacySealNote from '../components/PrivacySealNote'
import SiteReviewComposer from '../components/SiteReviewComposer'
import StaffPersonalSpace from '../components/StaffPersonalSpace'
import ComboLightBox from '../components/ComboLightBox'
import ComboFullBox from '../components/ComboFullBox'
import { calendlyUrlForConsult } from '../constants/calendly'
import {
  CONSULT_CHOICES,
  consultOfferCategory,
  type ConsultKind,
  type OfferCategory,
} from '../constants/consultations'
import { useValeriaPresence } from '../hooks/useValeriaPresence'
import { labelForPresence } from '../lib/valeriaPresence'
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
  const [searchParams] = useSearchParams()
  const calendarSectionRef = useRef<HTMLElement | null>(null)

  const [freeHidden, setFreeHidden] = useState(false)
  /** Flusso cliente: settore  // Stato per settore e consulto scelti */
  const [offerCategory, setOfferCategory] = useState<OfferCategory | null>(null)
  const [lastConsultTheme, setLastConsultTheme] = useState<'generico' | 'amore' | 'lavoro' | 'crescita'>('generico')
  /** Flusso cliente: prima card dorata, poi Calendly con URL per quel tipo di consulto. */
  const [selectedConsult, setSelectedConsult] = useState<ConsultKind | null>(null)

  const [taxInfo, setTaxInfo] = useState<{
    showReminder: boolean
    donePaidConsults: number
    hasCodiceFiscale: boolean
  } | null>(null)
  const [taxFirst, setTaxFirst] = useState('')
  const [taxLast, setTaxLast] = useState('')
  const [taxCf, setTaxCf] = useState('')
  const [taxSubmitting, setTaxSubmitting] = useState(false)
  const [taxLegalChecked, setTaxLegalChecked] = useState(false)
  const [taxMessage, setTaxMessage] = useState<string | null>(null)

  type MyConsultRow = {
    id: string
    status: string
    is_free_consult: boolean
    meeting_join_url: string | null
    meeting_provider: string | null
    start_at: string | null
    end_at: string | null
    created_at: string
  }
  const [myConsults, setMyConsults] = useState<MyConsultRow[] | null>(null)
  const [myConsultsLoading, setMyConsultsLoading] = useState(false)

  const { data: valeriaPresence } = useValeriaPresence(60_000)
  const presenceLabel = labelForPresence(valeriaPresence?.status)

  useEffect(() => {
    try {
      setFreeHidden(window.localStorage.getItem('freeConsultHidden') === '1')
    } catch {
      // ignore
    }
  }, [])

  /** Es. /dashboard?consult=coaching_60 dalla pagina Crescita personale */
  useEffect(() => {
    const raw = searchParams.get('consult')
    if (!raw) return
    const match = CONSULT_CHOICES.find((c) => c.kind === raw)
    if (match) {
      setOfferCategory(consultOfferCategory(match.kind))
      setSelectedConsult(match.kind)
      window.setTimeout(() => {
        calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 350)
    }
  }, [searchParams])

  function selectOfferCategory(cat: OfferCategory) {
    setOfferCategory(cat)
    setSelectedConsult((prev) => {
      if (!prev) return null
      return consultOfferCategory(prev) === cat ? prev : null
    })
  }

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

  useEffect(() => {
    if (!isLoaded || !user || isPrivilegedClerkUser(user)) return
    if (!getApiBaseUrl()) return
    let cancelled = false
    setMyConsultsLoading(true)
    ;(async () => {
      try {
        const r = await apiJson<{ consults: MyConsultRow[] }>(getToken, '/api/me/consults')
        if (!cancelled) setMyConsults(r.consults ?? [])
      } catch {
        if (!cancelled) setMyConsults([])
      } finally {
        if (!cancelled) setMyConsultsLoading(false)
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
        <p className="text-white/60 text-sm">Caricamento del tuo diario…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  const privileged = isPrivilegedClerkUser(user)
  /** Accento soft per il settore coaching: stesso Diario scuro, alone salvia in basso (tarocchi resta dominante). */
  const coachingAccent = !privileged && offerCategory === 'crescita'
  const firstName = displayFirstName(user)
  const consultChoicesForClient = CONSULT_CHOICES.filter((c) => c.kind !== 'free' || !freeHidden)
  const consultChoicesInSector =
    offerCategory === null
      ? []
      : consultChoicesForClient.filter((c) => consultOfferCategory(c.kind) === offerCategory)

  function formatConsultWhen(iso: string | null): string {
    if (!iso) return '—'
    try {
      return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
    } catch {
      return iso
    }
  }

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
    <div className="relative min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none transition-[background] duration-500"
        style={{
          background: coachingAccent
            ? [
                'radial-gradient(ellipse 72% 38% at 50% 18%, rgba(212,160,23,0.045) 0%, transparent 68%)',
                'radial-gradient(ellipse 95% 58% at 50% 100%, rgba(45, 212, 191, 0.09) 0%, rgba(6, 78, 59, 0.14) 42%, transparent 72%)',
                'linear-gradient(to bottom, transparent 0%, rgba(4, 30, 24, 0.2) 100%)',
              ].join(', ')
            : 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
        aria-hidden
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
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-1">
              Il tuo Diario d&apos;Evoluzione
            </p>
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
            {!privileged && (
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="#scegli-consulto" className="btn-gold text-sm px-5 py-2 text-center">
                  Prenota un consulto
                </a>
                <Link to="/profilo" className="btn-outline text-sm px-5 py-2">
                  Il mio profilo
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            {privileged && (
              <>
                <Link to="/gestione-clienti" className="btn-outline text-sm px-4 py-2 whitespace-nowrap">
                  Gestione clienti
                </Link>
                <Link to="/gestione-recensioni" className="btn-outline text-sm px-4 py-2 whitespace-nowrap">
                  Recensioni
                </Link>
                <Link to="/gestione-commenti-blog" className="btn-outline text-sm px-4 py-2 whitespace-nowrap">
                  Commenti blog
                </Link>
                <Link to="/control-room" className="btn-outline text-sm px-4 py-2 whitespace-nowrap">
                  Control Room
                </Link>
              </>
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

        {!privileged && getApiBaseUrl() && (
          <p className="text-sm text-white/55 mb-6 flex flex-wrap items-center gap-2">
            <span
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                valeriaPresence?.status === 'online'
                  ? 'bg-emerald-500/90'
                  : valeriaPresence?.status === 'busy'
                    ? 'bg-amber-500/90'
                    : 'bg-white/30'
              }`}
              aria-hidden
            />
            <span>
              Valeria in questo momento: <strong className="text-gold-400/95">{presenceLabel}</strong>
              <span className="text-white/35 text-xs ml-2">(utile per capire se può rispondere subito)</span>
            </span>
          </p>
        )}

        {!privileged && showFreeCard && (
          <p className="text-white/35 text-xs mb-4 border-l border-gold-600/25 pl-3">
            🎁 Consulto omaggio 7 min: è l’ultima card nella griglia. Puoi{' '}
            <button
              type="button"
              className="text-gold-500/90 underline underline-offset-2 hover:text-gold-400"
              onClick={() => {
                setFreeHidden(true)
                try {
                  window.localStorage.setItem('freeConsultHidden', '1')
                } catch {
                  // ignore
                }
              }}
            >
              nascondere questa riga
            </button>
            .
          </p>
        )}

        {/* Quick actions — solo clienti (non ha senso per staff) */}
        {!privileged && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: '🔮',
                title: 'Scegli il consulto',
                desc: 'Settore (Tarocchi o Crescita), poi tipo e data',
                href: '#scegli-consulto',
                cta: 'Scorri alle card',
              },
              {
                icon: '⭐',
                title: 'Lascia una recensione',
                desc: 'Racconta come ti sei trovata',
                href: '#recensioni',
                cta: 'Scrivi la recensione',
              },
            ].map((action, i) => (
              <motion.a
                key={action.title}
                href={action.href}
                target="_self"
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
        )}

        {privileged ? (
          <StaffPersonalSpace />
        ) : (
          <>
            <motion.section
              id="scegli-consulto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-10 scroll-mt-28"
            >
              <h2 className="font-serif text-xl font-bold text-white mb-1">1) Scegli il tuo percorso</h2>
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Tre ambiti distinti: <strong className="text-white/55">letture con i Tarocchi</strong> (focus sulla consapevolezza), <strong className="text-white/55">crescita personale · coaching</strong>{' '}
                (focus sull'azione), e <strong className="text-white/55">percorsi evolutivi (Combo)</strong> (l'unione dei due). Scegli sotto il percorso che ti interessa: compariranno le
                opzioni pertinenti.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => selectOfferCategory('tarocchi')}
                  className={`mystical-card text-left p-5 transition-all border ${
                    offerCategory === 'tarocchi'
                      ? 'ring-2 ring-gold-500/45 border-gold-600/35 shadow-[0_0_20px_rgba(212,160,23,0.1)]'
                      : 'border-white/10 hover:border-gold-600/25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0" aria-hidden>
                      🃏
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">Tarocchi &amp; letture</h3>
                      <p className="text-white/50 text-xs xl:text-sm leading-relaxed mb-3">
                        Consulti tramite Carte: breve (30m), online (30m video), completo (60m). Fare chiarezza sulle domande e capire come orientarsi.
                      </p>
                      <span className="text-gold-500 text-sm font-medium hover:underline">Vedi i consulti →</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => selectOfferCategory('crescita')}
                  className={`mystical-card text-left p-5 transition-all border ${
                    offerCategory === 'crescita'
                      ? 'ring-2 ring-emerald-500/35 border-emerald-600/35 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                      : 'border-white/10 hover:border-emerald-600/25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0" aria-hidden>
                      🌱
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">Coaching &amp; Crescita</h3>
                      <p className="text-white/50 text-xs xl:text-sm leading-relaxed mb-3">
                        Percorsi focalizzati sull'azione: definire obiettivi, superare le paure o cambiare abitudini per agire davvero.
                      </p>
                      <span className="text-emerald-400/90 text-sm font-medium hover:underline">Vedi il coaching →</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => selectOfferCategory('combo')}
                  className={`mystical-card text-left p-5 transition-all border ${
                    offerCategory === 'combo'
                      ? 'ring-2 ring-blue-500/35 border-blue-600/35 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      : 'border-white/10 hover:border-blue-600/25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0" aria-hidden>
                      🦋
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">Percorsi (Combo)</h3>
                      <p className="text-white/50 text-xs xl:text-sm leading-relaxed mb-3">
                        L'unione dei due strumenti. Sii consapevole (Tarocchi) e poi struttura un vero piano pratico a lungo termine (Coaching).
                      </p>
                      <span className="text-blue-400/90 text-sm font-medium hover:underline">Scopri le combo →</span>
                    </div>
                  </div>
                </button>
              </div>

              {offerCategory === 'tarocchi' && (
                <p className="text-white/38 text-xs leading-relaxed mb-6 border-l border-gold-600/25 pl-3 max-w-3xl">
                  Le letture hanno natura simbolica e di orientamento:{' '}
                  <strong className="text-white/55">non sostituiscono</strong> pareri medici, psicologici specialistici,
                  legali né trattamenti sanitari.
                </p>
              )}

              {offerCategory === 'crescita' && (
                <div className="mystical-card border border-emerald-600/25 mb-6">
                  <h3 className="font-serif text-base font-bold text-white mb-2">Informativa sul servizio di coaching</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    Valeria ha una formazione in psicologia; in questo ambito offre{' '}
                    <strong className="text-white/80">accompagnamento di crescita personale e coaching</strong>. Il
                    servizio <strong className="text-white/80">non costituisce psicoterapia</strong>, né consulenza
                    psicologica riservata agli iscritti all&apos;Ordine degli Psicologi, né consulenza medica o legale.
                  </p>
                  <p className="text-white/45 text-xs leading-relaxed mb-3">
                    Se stai attraversando una difficoltà che richiede supporto clinico o psicoterapeutico, rivolgiti a un
                    professionista abilitato nella tua zona. Questo percorso non sostituisce il parere medico né
                    trattamenti sanitari. In caso di emergenza, contatta i servizi competenti (es. 112, 118).
                  </p>
                  <p className="text-white/35 text-xs">
                    Proseguendo con la prenotazione dichiari di aver preso visione di quanto sopra. Per approfondimenti:{' '}
                    <Link to="/crescita-personale" className="text-emerald-400/90 underline underline-offset-2">
                      pagina Crescita personale
                    </Link>
                    .
                  </p>
                </div>
              )}

              <h2 className="font-serif text-xl font-bold text-white mb-1 mt-2">2) Scegli il consulto: breve, online, completo…</h2>
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Tocca <strong className="text-gold-500/90">Continua</strong>: sotto si apre il calendario giusto per quel
                tipo (anche omaggio, se incluso nel settore). Il pagamento avviene in Calendly quando scegli data e ora
                tramite <strong className="text-white/55">Stripe</strong> (carta di credito).
              </p>
              {/* Disclaimer legale statico — nessuna azione richiesta */}
              <p className="text-white/28 text-[11px] mb-5 max-w-2xl leading-relaxed">
                Prenotando un consulto dichiari di avere almeno 18 anni e di accettare i{' '}
                <Link to="/termini" className="text-gold-500/50 hover:text-gold-400 underline underline-offset-2">
                  Termini di servizio
                </Link>
                .
              </p>
              {!offerCategory && (
                <div
                  className="mystical-card border border-dashed border-white/15 text-center py-12 px-4"
                  aria-live="polite"
                >
                  <p className="text-white/45 text-sm max-w-md mx-auto">
                    Seleziona prima <strong className="text-white/65">Tarocchi &amp; letture</strong> o{' '}
                    <strong className="text-white/65">Crescita personale · coaching</strong> nel punto 1: qui compariranno
                    le card prenotabili per quel settore.
                  </p>
                </div>
              )}
              {offerCategory && offerCategory !== 'combo' && consultChoicesInSector.length === 0 && (
                <p className="text-amber-200/80 text-sm">Nessuna opzione disponibile in questo settore con le impostazioni attuali.</p>
              )}
              
              {offerCategory === 'combo' ? (
                <div className="flex flex-col gap-6">
                  <ComboLightBox onSelect={() => {
                    setSelectedConsult('combo_light')
                    window.setTimeout(() => {
                      calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }, 80)
                  }} />
                  <ComboFullBox onSelect={() => {
                    setSelectedConsult('combo_full')
                    window.setTimeout(() => {
                      calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }, 80)
                  }} />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {consultChoicesInSector.map((c) => {
                  const selected = selectedConsult === c.kind
                  return (
                    <div
                      key={c.kind}
                      className={`mystical-card text-center flex flex-col transition-shadow ${
                        selected ? 'ring-2 ring-gold-500/50 shadow-[0_0_24px_rgba(212,160,23,0.15)]' : ''
                      }`}
                    >
                      <div className="text-3xl mb-2">{c.icon}</div>
                      <h3 className="font-serif text-lg font-bold text-white mb-0.5">{c.name}</h3>
                      <p className="text-gold-500 text-xs mb-1">{c.duration}</p>
                      <p
                        className="font-serif text-2xl font-bold mb-4"
                        style={{
                          background:
                            c.kind === 'free'
                              ? 'linear-gradient(135deg, #86efac, #22c55e)'
                              : 'linear-gradient(135deg, #ffe066, #ffd700)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {c.priceLabel}
                      </p>
                      <button
                        type="button"
                        className="btn-gold text-sm px-4 py-2.5 inline-flex items-center justify-center gap-2 w-full mt-auto"
                        onClick={() => {
                          setSelectedConsult(c.kind)
                          window.setTimeout(() => {
                            calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }, 80)
                        }}
                      >
                        Continua
                      </button>
                      {getApiBaseUrl() && (
                        <p className="text-[10px] text-white/35 mt-3 pt-2 border-t border-white/10 text-center leading-snug">
                          Valeria ora: <span className="text-gold-500/85">{presenceLabel}</span>
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              )}
            </motion.section>

            <motion.section
              id="prenota-calendly"
              ref={calendarSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mb-8 scroll-mt-28 relative z-30 isolate"
            >
              <h2 className="font-serif text-xl font-bold text-white mb-1">3) Scegli data e ora su Calendly</h2>
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Calendly mostra le disponibilità per il tipo di consulto scelto al punto 2. Al termine partirà il
                pagamento sicuro tramite <strong className="text-white/55">Stripe</strong>.
              </p>
              <PrivacySealNote className="mb-4 max-w-2xl" />
              <div className="mystical-card p-0 overflow-hidden rounded-lg relative z-0 isolate max-h-[min(700px,85vh)]">
                {selectedConsult ? (
                  <CalendlyEmbed
                    key={selectedConsult}
                    url={calendlyUrlForConsult(selectedConsult)}
                    minHeight={700}
                  />
                ) : (
                  <div
                    className="flex min-h-[min(420px,70vh)] flex-col items-center justify-center gap-3 px-6 py-16 text-center text-white/45"
                    style={{ background: 'linear-gradient(180deg, rgba(13,27,42,0.5) 0%, rgba(6,6,8,0.9) 100%)' }}
                  >
                    <span className="text-3xl" aria-hidden>
                      👆
                    </span>
                    <p className="max-w-sm text-sm leading-relaxed">
                      Seleziona settore e tipo di consulto nelle sezioni <strong className="text-white/70">1</strong> e{' '}
                      <strong className="text-white/70">2</strong>, poi il calendario apparirà qui.
                    </p>
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="mb-10 scroll-mt-28"
            >
              <h2 className="font-serif text-xl font-bold text-white mb-1">I tuoi consulti</h2>
              <div className="flex flex-wrap items-center gap-3 text-white/60 text-xs mt-2 mb-4 px-4 py-2.5 border border-white/10 rounded-lg bg-white/[0.02] w-fit">
                <span className="flex items-center gap-1.5">
                  <span className="text-gold-500 text-sm">⭐</span>
                  <span>Valutazione media <strong className="text-gold-400/90 font-medium">4,97/5</strong> su 261 recensioni · <strong className="text-white font-medium">776</strong> commenti positivi</span>
                </span>
                <span className="text-white/20 hidden sm:inline">|</span>
                <Link to="/#recensioni" className="text-gold-500/80 hover:text-gold-400 hover:underline transition-colors">
                  Leggi alcune recensioni
                </Link>
              </div>
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Storico degli appuntamenti collegati al tuo account (stessa email con cui prenoti su Calendly). Le note
                interne di Valeria non sono visibili qui.
              </p>

              {/* Contatori aggregati */}
              {getApiBaseUrl() && !myConsultsLoading && myConsults && myConsults.length > 0 && (() => {
                const total = myConsults.length
                const paid = myConsults.filter((c) => !c.is_free_consult).length
                const free = myConsults.filter((c) => c.is_free_consult).length
                const done = myConsults.filter((c) => c.status === 'done').length
                const upcoming = myConsults.filter((c) => c.status === 'scheduled' && c.start_at && new Date(c.start_at) > new Date()).length
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Totale', value: total, color: 'text-white' },
                      { label: 'A pagamento', value: paid, color: 'text-gold-400' },
                      { label: 'Omaggio', value: free, color: 'text-emerald-400' },
                      { label: 'Completati', value: done, color: 'text-white/60' },
                    ].map((s) => (
                      <div key={s.label} className="mystical-card text-center py-3 px-2 border border-white/8">
                        <p className={`font-serif text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                    {upcoming > 0 && (
                      <div className="sm:col-span-4 text-xs text-gold-400/80 flex items-center gap-2 pl-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                        {upcoming} appuntament{upcoming === 1 ? 'o' : 'i'} in programma
                      </div>
                    )}
                  </div>
                )
              })()}

              {!getApiBaseUrl() && (
                <p className="text-amber-200/80 text-sm">Servizio storico non disponibile senza connessione al server.</p>
              )}
              {getApiBaseUrl() && myConsultsLoading && (
                <p className="text-white/45 text-sm">Caricamento elenco…</p>
              )}
              {getApiBaseUrl() && !myConsultsLoading && myConsults && myConsults.length === 0 && (
                <div className="mystical-card border border-white/10">
                  <p className="text-white/50 text-sm">
                    Non risultano ancora consulti collegati. Quando prenoterai tramite Calendly con la stessa email del tuo account, il tuo percorso comparirà proprio qui.
                  </p>
                  <div className="relative mt-8 mb-2 mx-2 pl-5 border-l-2 border-white/10 space-y-6 opacity-30 select-none pointer-events-none">
                    <div className="relative">
                      <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/20 ring-4 ring-dark-500" />
                      <div className="border border-white/5 bg-white/[0.01] rounded-lg p-3">
                        <span className="text-white/30 text-xs font-mono">Data futura</span>
                        <h4 className="text-white/50 font-medium text-sm">Il tuo primo consulto</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {getApiBaseUrl() && !myConsultsLoading && myConsults && myConsults.length > 0 && (
                <div className="relative pl-5 border-l-2 border-gold-600/30 space-y-8 my-10 ml-2">
                  {myConsults.map((c) => {
                    const startDate = c.start_at ? new Date(c.start_at) : null
                    const isPast = !startDate || startDate < new Date()
                    const isSoon = !isPast && startDate && (startDate.getTime() - new Date().getTime() < 15 * 60 * 1000)
                    
                    const statusBadge = c.status === 'done'
                      ? { label: 'Completato', cls: 'border-emerald-600/30 text-emerald-400/80', dot: 'bg-emerald-400' }
                      : c.status === 'cancelled'
                      ? { label: 'Cancellato', cls: 'border-red-800/30 text-red-400/60', dot: 'bg-red-400' }
                      : c.status === 'scheduled'
                      ? { label: isPast ? 'Passato' : 'In programma', cls: isPast ? 'border-white/15 text-white/35' : 'border-gold-600/35 text-gold-400/80', dot: isPast ? 'bg-white/30' : 'bg-gold-400 animate-pulse' }
                      : { label: c.status, cls: 'border-white/15 text-white/35', dot: 'bg-white/20' }

                    // Logica icone e testi in base al provider
                    let callIcon = '🔮'
                    let callDetail = ''
                    let callActionLabel = 'Partecipa'
                    
                    if (c.meeting_provider === 'phone' || (!c.meeting_join_url && c.status === 'scheduled')) {
                      callIcon = '📞'
                      callDetail = 'Valeria ti chiamerà al numero fornito durante la prenotazione.'
                    } else if (c.meeting_provider === 'google_conference' || c.meeting_join_url?.includes('meet.google.com')) {
                      callIcon = '📽️'
                      callDetail = 'Si svolge su Google Meet (anche da browser senza app).'
                      callActionLabel = isSoon ? 'Entra ora' : 'Vai alla stanza'
                    } else if (c.meeting_provider === 'zoom_conference' || c.meeting_join_url?.includes('zoom.us')) {
                      callIcon = '📱'
                      callDetail = 'Si svolge su Zoom. Si consiglia di avere l\'app installata.'
                      callActionLabel = isSoon ? 'Entra ora' : 'Apri Zoom'
                    } else if (c.meeting_join_url) {
                      callIcon = '🌐'
                      callDetail = 'Sessione online tramite link fornito.'
                    }

                    return (
                      <div key={c.id} className="relative">
                        <div className={`absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-dark-500 ${statusBadge.dot}`} />
                        <div className={`mystical-card p-0 overflow-hidden border transition-all duration-300 ${
                          isSoon ? 'border-gold-500/50 shadow-[0_0_20px_rgba(212,160,23,0.1)] bg-gold-500/[0.03]' : 'border-white/10 bg-white/[0.02]'
                        }`}>
                          <div className="p-4">
                            <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                              <div>
                                <span className="text-gold-500/80 text-xs font-mono font-medium">{formatConsultWhen(c.start_at)}</span>
                                <h4 className="text-white font-medium text-sm mt-0.5 flex items-center gap-2">
                                  <span className="text-lg">{callIcon}</span>
                                  {c.is_free_consult ? 'Consulto Omaggio (7 min)' : 'Consulto con Valeria'}
                                </h4>
                              </div>
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1.5 ${statusBadge.cls}`}>
                                <span className={`w-1 h-1 rounded-full inline-block ${statusBadge.dot}`} />
                                {statusBadge.label}
                              </span>
                            </div>
                            
                            {callDetail && c.status === 'scheduled' && (
                              <p className="text-white/50 text-[11px] mt-1 italic">{callDetail}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 p-3 bg-white/[0.03] border-t border-white/5 items-center justify-between">
                            {c.meeting_join_url && !isPast && c.status === 'scheduled' ? (
                              <a 
                                href={c.meeting_join_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                                  isSoon 
                                    ? 'bg-gold-500 text-dark-500 hover:bg-gold-400 shadow-[0_0_12px_rgba(212,160,23,0.3)]' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                              >
                                {callActionLabel}
                                <span aria-hidden>→</span>
                              </a>
                            ) : c.status === 'scheduled' && !isPast ? (
                              <span className="text-white/30 text-xs">In attesa della chiamata</span>
                            ) : null}

                            {isPast && c.status !== 'cancelled' && (
                              <a href="#scegli-consulto" className="text-gold-500/70 hover:text-gold-400 text-xs hover:underline transition-colors">
                                Prenota di nuovo →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.section>

            {/* Cross-Selling: Il Tuo Prossimo Passo (Ora Dinamico in base al Consulto) */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-10"
            >
              <div className="flex flex-wrap justify-between items-end mb-3">
                <h2 className="font-serif text-xl font-bold text-white">Il tuo prossimo passo</h2>
                
                {/* Dev toggle block: Simulatore dinamico del tema per l'anteprima */}
                {myConsults && myConsults.length > 0 && (
                  <div className="flex gap-2">
                    {(['generico', 'amore', 'lavoro', 'crescita'] as const).map(theme => (
                      <button 
                        key={theme} 
                        onClick={() => setLastConsultTheme(theme)}
                        className={`text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded border ${
                          lastConsultTheme === theme 
                            ? 'bg-gold-500/20 border-gold-500/50 text-gold-300' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                        }`}
                      >
                        Tema: {theme}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mystical-card border border-emerald-600/30 bg-emerald-900/10">
                <div className="flex items-start gap-4">
                  <span className="text-4xl shrink-0" aria-hidden>
                    {lastConsultTheme === 'amore' ? '❤️' : lastConsultTheme === 'lavoro' ? '🎯' : lastConsultTheme === 'crescita' ? '🦋' : '🌱'}
                  </span>
                  <div>
                    <h3 className="text-white font-medium text-lg mb-1">
                      {myConsults && myConsults.length > 0 ? "Dalla lettura alla scelta concreta" : "Inizia con un Consulto Completo"}
                    </h3>
                    
                    <p className="text-white/70 text-sm mb-5 leading-relaxed">
                      {myConsults && myConsults.length > 0 
                        ? (lastConsultTheme === 'amore' && "Le Carte hanno messo a fuoco dinamiche, paure e desideri nelle tue relazioni. Se senti che è il momento di smettere di ripetere gli stessi schemi, possiamo trasformare questa lettura in un percorso accompagnato: cosa lasciare andare e come aprirti a legami più sani.")
                        : myConsults && myConsults.length > 0 && lastConsultTheme === 'lavoro' ? "Dal consulto sono emerse strade possibili, blocchi e talenti che forse non stavi vedendo. Il passo successivo è passare dalla visione alla decisione: preparare azioni concrete invece di restare ferma nel dubbio."
                        : myConsults && myConsults.length > 0 && lastConsultTheme === 'crescita' ? "La lettura ha illuminato parti di te che chiedono ascolto e cura. Possiamo usare questa consapevolezza per costruire un percorso di evoluzione: piccoli impegni, nuove abitudini, modi diversi di stare nelle situazioni."
                        : myConsults && myConsults.length > 0 ? "Le Carte ti hanno mostrato un pezzo importante della tua storia. Ora il vero cambiamento nasce da ciò che decidi di fare con questa consapevolezza: possiamo usare ciò che è emerso per costruire il tuo prossimo passo nella realtà di tutti i giorni."
                        : "Un consulto completo ti permette di analizzare a fondo la tua situazione. Oppure inizia subito un percorso esplorativo su di te."
                      }
                    </p>

                    {myConsults && myConsults.length > 0 ? (
                      <div className="mt-6 border-t border-emerald-500/20 pt-5">
                        <h4 className="text-white/90 text-sm font-semibold mb-3 uppercase tracking-wider">Cosa puoi fare adesso</h4>
                        <div className="grid md:grid-cols-2 gap-4 mb-5">
                          {/* Opzione 1 */}
                          <div className="bg-dark-400/50 border border-white/10 rounded-lg p-4 hover:border-gold-500/30 transition-colors">
                            <h5 className="text-gold-400 font-medium text-sm mb-1.5 flex items-center gap-2">
                              <span aria-hidden>🔮</span> Approfondimento mirato
                            </h5>
                            <p className="text-white/50 text-xs leading-relaxed">
                              Consulto breve focalizzato esclusivamente sulla domanda di oggi per sciogliere gli ultimi dubbi.
                            </p>
                          </div>
                          {/* Opzione 2 */}
                          <div className="bg-dark-400/50 border border-emerald-500/20 rounded-lg p-4 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
                            <h5 className="text-emerald-400 font-medium text-sm mb-1.5 flex items-center gap-2">
                              <span aria-hidden>🌱</span> Percorso di trasformazione
                            </h5>
                            <p className="text-white/50 text-xs leading-relaxed">
                              Inizia un percorso (2-3 incontri) in cui usiamo i Tarocchi come bussola e il dialogo come strumento per trasformare ciò che è emerso in azioni concrete.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 items-center">
                          <button 
                            onClick={() => {
                              setOfferCategory('crescita');
                              document.getElementById('scegli-consulto')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="btn-gold text-sm px-6 py-2.5 inline-block font-medium hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-shadow"
                          >
                            Inizia il tuo percorso da questa lettura
                          </button>
                          <a href="#storico" onClick={(e)=>e.preventDefault()} className="text-white/40 hover:text-white/70 text-xs underline transition-colors">
                            Rivedi le letture passate
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a href="#scegli-consulto" className="btn-gold text-sm px-6 py-2.5 inline-block font-medium hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-shadow">
                          Prenota il tuo primo consulto
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Contenuti Consigliati */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="mb-10"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="#blog-preparazione" onClick={(e)=>e.preventDefault()} className="mystical-card p-4 border border-white/5 hover:border-gold-500/40 transition-colors group">
                  <span className="text-gold-500/80 text-[10px] uppercase font-mono tracking-wider mb-1.5 block">Guida pratica</span>
                  <h4 className="text-white font-medium text-sm group-hover:text-gold-400 transition-colors">Come prepararsi al consulto</h4>
                  <p className="text-white/40 text-xs mt-2 line-clamp-2">Centrarsi prima di una divinazione aiuta a formulare bene la domanda d'intenzione.</p>
                </a>
                <a href="#blog-matto" onClick={(e)=>e.preventDefault()} className="mystical-card p-4 border border-white/5 hover:border-gold-500/40 transition-colors group">
                  <span className="text-gold-500/80 text-[10px] uppercase font-mono tracking-wider mb-1.5 block">Arcani Maggiori</span>
                  <h4 className="text-white font-medium text-sm group-hover:text-gold-400 transition-colors">Il significato del Matto</h4>
                  <p className="text-white/40 text-xs mt-2 line-clamp-2">L'energia del salto nel vuoto: quando è davvero il momento di rischiare e ripartire.</p>
                </a>
              </div>
            </motion.section>
            {/* Recensioni in-app integrate */}
            <motion.section
              id="recensioni"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-10 scroll-mt-28"
            >
              <h2 className="font-serif text-xl font-bold text-white mb-4">La tua opinione è preziosa</h2>
              <SiteReviewComposer />
            </motion.section>
          </>
        )}

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
              <label className="flex items-start gap-2 mb-2 sm:col-span-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={taxLegalChecked}
                  onChange={(e) => setTaxLegalChecked(e.target.checked)}
                  className="mt-1 accent-gold-500"
                />
                <span className="text-white/40 text-[11px] leading-snug group-hover:text-white/60 transition-colors">
                  Accetto i <Link to="/termini" className="text-gold-500/70 hover:underline">Termini di Servizio</Link> e confermo di aver letto la <Link to="/privacy" className="text-gold-500/70 hover:underline">Privacy Policy</Link>. Dichiaro che i dati forniti sono corretti.
                </span>
              </label>
              <button 
                type="submit" 
                className="btn-gold text-sm px-5 py-2.5 sm:col-span-2 w-fit" 
                disabled={taxSubmitting || !taxLegalChecked}
              >
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

          <div className="mt-6 pt-6 border-t border-white/10 grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Preferenza di contatto</span>
                <select className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white appearance-none">
                  <option>Telefono</option>
                  <option>Videochiamata online</option>
                </select>
              </label>
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Fuso orario (per i consulti)</span>
                <select className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white appearance-none">
                  <option>Europa/Roma (CET)</option>
                  <option>Europa/Londra (GMT)</option>
                  <option>America/New York (EST)</option>
                </select>
              </label>
            </div>
            <div>
              <label className="block h-full flex flex-col">
                <span className="text-white/45 text-xs block mb-1">La mia intenzione principale</span>
                <textarea 
                  className="w-full flex-1 min-h-[105px] bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white resize-none"
                  placeholder="Es. Voglio fare chiarezza sulla mia situazione lavorativa o capire le dinamiche di una relazione..."
                />
              </label>
            </div>
            <div className="md:col-span-2 text-right">
              <button type="button" className="btn-gold text-xs px-5 py-2 opacity-50 cursor-not-allowed" title="In fase di sviluppo">Salva preferenze</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
