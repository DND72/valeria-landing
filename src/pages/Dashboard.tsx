import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import CalendlyEmbed from '../components/CalendlyEmbed'
import PrivacySealNote from '../components/PrivacySealNote'
import SiteReviewComposer from '../components/SiteReviewComposer'
import StaffPersonalSpace from '../components/StaffPersonalSpace'
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
  /** Flusso cliente: settore → tipo consulto → Calendly. */
  const [offerCategory, setOfferCategory] = useState<OfferCategory | null>(null)
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
  const [taxMessage, setTaxMessage] = useState<string | null>(null)

  type MyConsultRow = {
    id: string
    status: string
    is_free_consult: boolean
    meeting_join_url: string | null
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
                icon: '🃏',
                title: 'App tarocchi gratuita',
                desc: 'Estrai le tue carte ogni giorno',
                href: 'https://stese.nonsolotarocchi.it',
                cta: "Apri l'app",
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
              <h2 className="font-serif text-xl font-bold text-white mb-1">1) Scegli il settore</h2>
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Due ambiti distinti: <strong className="text-white/55">letture con i Tarocchi</strong> (consulti brevi,
                online, completi, omaggio) e <strong className="text-white/55">crescita personale · coaching</strong>{' '}
                (conoscenza gratuita, sedute, pacchetto). Scegli sotto il settore che ti interessa: compariranno solo le
                opzioni coerenti e, per il coaching, gli avvisi professionali obbligatori.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => selectOfferCategory('tarocchi')}
                  className={`mystical-card text-left p-5 transition-all border ${
                    offerCategory === 'tarocchi'
                      ? 'ring-2 ring-gold-500/45 border-gold-600/35'
                      : 'border-white/10 hover:border-gold-600/25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0" aria-hidden>
                      🃏
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">Tarocchi &amp; letture</h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-3">
                        Consulti con i Tarocchi di Marsiglia: breve (30 min telefono), online (video 30 min), completo (60
                        min telefono), più eventuale consulto omaggio (7 min). Focus su simboli, situazioni e orientamento
                        rispetto alle domande che porti.
                      </p>
                      <span className="text-gold-500 text-xs font-medium">Apri le opzioni Tarocchi →</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => selectOfferCategory('crescita')}
                  className={`mystical-card text-left p-5 transition-all border ${
                    offerCategory === 'crescita'
                      ? 'ring-2 ring-emerald-500/35 border-emerald-600/35'
                      : 'border-white/10 hover:border-emerald-600/25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0" aria-hidden>
                      🌱
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white mb-1">Crescita personale · coaching</h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-3">
                        Percorsi su obiettivi, abitudini, scelte e direzione: conoscenza gratuita (10 min), seduta singola
                        (60 min) o pacchetto da cinque sedute (prenotazione e pagamento una seduta alla volta). Sessioni in
                        video o telefono — non centrate necessariamente su una stesa di carte.
                      </p>
                      <span className="text-emerald-400/90 text-xs font-medium">Apri le opzioni Coaching →</span>
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

              <h2 className="font-serif text-xl font-bold text-white mb-1 mt-2">2) Scegli il tipo di consulto</h2>
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Tocca <strong className="text-gold-500/90">Continua</strong>: sotto si apre il calendario giusto per quel
                tipo (anche omaggio, se incluso nel settore). Il pagamento avviene in Calendly quando scegli data e ora,
                come da configurazione (es. PayPal).
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
              {offerCategory && consultChoicesInSector.length === 0 && (
                <p className="text-amber-200/80 text-sm">Nessuna opzione disponibile in questo settore con le impostazioni attuali.</p>
              )}
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
            </motion.section>

            <motion.section
              id="prenota-calendly"
              ref={calendarSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mb-8 scroll-mt-28 relative z-30 isolate"
            >
              <h2 className="font-serif text-xl font-bold text-white mb-1">3) Scegli data e ora</h2>
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Calendly mostra le disponibilità per il tipo di consulto scelto al punto 2. Al termine, se hai collegato PayPal in Calendly, partirà il pagamento lì.
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
              <p className="text-white/40 text-sm mb-4 max-w-2xl">
                Storico degli appuntamenti collegati al tuo account (stessa email con cui prenoti su Calendly). Le note
                interne di Valeria non sono visibili qui.
              </p>
              {!getApiBaseUrl() && (
                <p className="text-amber-200/80 text-sm">Servizio storico non disponibile senza connessione al server.</p>
              )}
              {getApiBaseUrl() && myConsultsLoading && (
                <p className="text-white/45 text-sm">Caricamento elenco…</p>
              )}
              {getApiBaseUrl() && !myConsultsLoading && myConsults && myConsults.length === 0 && (
                <div className="mystical-card border border-white/10">
                  <p className="text-white/50 text-sm">
                    Non risultano ancora consulti collegati. Dopo una prenotazione tramite Calendly con la stessa email
                    del tuo accesso, l&apos;appuntamento comparirà qui.
                  </p>
                </div>
              )}
              {getApiBaseUrl() && !myConsultsLoading && myConsults && myConsults.length > 0 && (
                <div className="mystical-card p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[320px]">
                    <thead>
                      <tr className="border-b border-white/10 text-white/45 text-xs uppercase tracking-wide">
                        <th className="py-3 px-4 font-medium">Data / ora</th>
                        <th className="py-3 px-4 font-medium">Tipo</th>
                        <th className="py-3 px-4 font-medium">Stato</th>
                        <th className="py-3 px-4 font-medium">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myConsults.map((c) => (
                        <tr key={c.id} className="border-t border-white/[0.06]">
                          <td className="py-2.5 px-4 text-white/85 whitespace-nowrap">
                            {formatConsultWhen(c.start_at)}
                          </td>
                          <td className="py-2.5 px-4 text-white/60">
                            {c.is_free_consult ? 'Omaggio' : 'A pagamento'}
                          </td>
                          <td className="py-2.5 px-4 text-white/50 text-xs uppercase">{c.status}</td>
                          <td className="py-2.5 px-4">
                            {c.meeting_join_url ? (
                              <a
                                href={c.meeting_join_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold-500/90 hover:underline text-xs"
                              >
                                Entra
                              </a>
                            ) : (
                              <span className="text-white/25">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-10 scroll-mt-28"
            >
              <h2 className="font-serif text-xl font-bold text-white mb-3">Recensione sul sito</h2>
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
