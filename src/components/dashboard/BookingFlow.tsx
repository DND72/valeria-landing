import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { apiJson } from '../../lib/api'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { InternalBookingCalendar } from '../InternalBookingCalendar'
import PrivacySealNote from '../PrivacySealNote'
import {
  CONSULT_CHOICES,
  consultOfferCategory,
  type ConsultKind,
  type OfferCategory,
} from '../../constants/consultations'
import { ASTRAL_STATUSES, getAstralStatus } from '../../constants/status'
import { getApiBaseUrl } from '../../constants/api'
import { ValeriaPresenceStatus } from '../../lib/valeriaPresence'

interface BookingFlowProps {
  user: any
  donePaidConsults: number
  presenceLabel: string
  freeHidden: boolean
  ageStatus: {
    hasUsedFree7: boolean
    hasUsedIntro10: boolean
  } | null
  valeriaStatus?: ValeriaPresenceStatus
  onBookingConfirmed: () => void
  onCategoryChange?: (cat: OfferCategory | null) => void
}

export default function BookingFlow({
  user,
  donePaidConsults,
  presenceLabel,
  freeHidden,
  ageStatus,
  valeriaStatus,
  onBookingConfirmed,
  onCategoryChange
}: BookingFlowProps) {
  const { getToken } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const calendarSectionRef = useRef<HTMLElement | null>(null)
  const [offerCategory, setOfferCategory] = useState<OfferCategory | null>(null)
  const [selectedConsult, setSelectedConsult] = useState<ConsultKind | null>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [instantLoading, setInstantLoading] = useState(false)
  const [instantError, setInstantError] = useState<string | null>(null)

  useEffect(() => {
    const raw = searchParams.get('consult')
    if (!raw) return
    const match = CONSULT_CHOICES.find((c) => c.kind === raw)
    if (match) {
      const cat = consultOfferCategory(match.kind)
      setOfferCategory(cat)
      onCategoryChange?.(cat)
      setSelectedConsult(match.kind)
      window.setTimeout(() => { calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 350)
    }
  }, [searchParams, onCategoryChange])

  function selectOfferCategory(cat: OfferCategory) {
    setOfferCategory(cat)
    onCategoryChange?.(cat)
    setSelectedConsult((prev) => (prev && consultOfferCategory(prev) === cat ? prev : null))
  }

  const handleInstantBooking = async () => {
    if (!selectedConsult || instantLoading) return
    setInstantLoading(true)
    setInstantError(null)
    try {
      const res = await apiJson<{ ok: boolean; error?: string }>(getToken, '/api/booking/start', {
        method: 'POST',
        body: JSON.stringify({
          consultKind: selectedConsult,
          slotIso: new Date().toISOString()
        })
      })
      if (res.ok) {
        setBookingConfirmed(true)
        onBookingConfirmed()
        navigate('/area-personale/live')
      } else {
        setInstantError(res.error || 'Errore nella prenotazione istantanea.')
      }
    } catch (err: any) {
      setInstantError(err.message || 'Errore di connessione.')
    } finally {
      setInstantLoading(false)
    }
  }

  const isChat = selectedConsult?.startsWith('chat_')
  const isTarot = selectedConsult && !selectedConsult.startsWith('chat_')
  const isInstantKind = isChat || isTarot
  const showInstantCta = isInstantKind && valeriaStatus === 'online'

  const consultChoicesForClient = CONSULT_CHOICES.filter((c) => {
    if (c.kind === 'free' && (freeHidden || ageStatus?.hasUsedFree7)) return false
    return true
  })

  const consultChoicesInSector = offerCategory === null
    ? []
    : consultChoicesForClient.filter((c) => consultOfferCategory(c.kind) === offerCategory)

  return (
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
          Tre ambiti distinti: <strong className="text-white/55">letture con i Tarocchi</strong>,{' '}
          <strong className="text-white/55">crescita personale · coaching</strong>, e{' '}
          <strong className="text-white/55">percorsi evolutivi (Combo)</strong>.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { cat: 'tarocchi' as OfferCategory, icon: '🃏', title: 'Tarocchi & Letture', desc: 'Consulti tramite Carte: Breve, Completo o Live Chat.', cta: 'Vedi i consulti →' },
            { cat: 'crescita' as OfferCategory, icon: '🌱', title: 'Coaching & Crescita', desc: 'Definire obiettivi, superare le paure o cambiare abitudini.', cta: 'Vedi il coaching →' },
            { cat: 'combo' as OfferCategory, icon: '🦋', title: 'Percorsi (Combo)', desc: "L'unione di Tarocchi e Coaching in percorsi guidati.", cta: 'Scopri le combo →' },
            { cat: 'chat' as OfferCategory, icon: '💬', title: 'Live Chat', desc: 'Sessione testuale in tempo reale. Privacy totale.', cta: 'Vedi opzioni chat →' },
          ].map(({ cat, icon, title, desc, cta }) => (
            <button
              key={cat}
              type="button"
              onClick={() => selectOfferCategory(cat)}
              className={`mystical-card text-left p-5 transition-all border ${
                offerCategory === cat ? 'ring-2 ring-gold-500/45 border-gold-600/35' : 'border-white/10 hover:border-gold-600/25'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0">{icon}</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white mb-1">{title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed mb-3">{desc}</p>
                  <span className="text-gold-500 text-sm font-medium">{cta}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <h2 className="font-serif text-xl font-bold text-white mb-1 mt-2">2) Scegli il consulto</h2>
        <p className="text-white/40 text-sm mb-4 max-w-2xl">
          Tocca <strong className="text-gold-500/90">Continua</strong>: sotto si apre il calendario. La prenotazione utilizzerà i tuoi{' '}
          <strong className="text-white/55">Crediti disponibili nel Wallet</strong>.
        </p>

        {!offerCategory && (
          <div className="mystical-card border border-dashed border-white/15 text-center py-12 px-4">
            <p className="text-white/45 text-sm max-w-md mx-auto">Seleziona prima il percorso nel punto 1.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {consultChoicesInSector.map((c) => {
              const selected = selectedConsult === c.kind
              const status = getAstralStatus(user, donePaidConsults)
              const discountFactor = ASTRAL_STATUSES[status].discountFactor
              const ratePerMin = c.costCredits * discountFactor
              const formattedRate = ratePerMin.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
              const isDiscounted = discountFactor < 1 && c.costCredits > 0
              return (
                <div key={c.kind} className={`mystical-card text-center flex flex-col transition-shadow relative ${selected ? 'ring-2 ring-gold-500/50 shadow-[0_0_24px_rgba(212,160,23,0.15)]' : ''}`}>
                  {isDiscounted && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-dark-500 text-[9px] font-bold px-3 py-1 rounded-full z-10 whitespace-nowrap">
                      {ASTRAL_STATUSES[status].label} -{Math.round((1 - discountFactor) * 100)}%
                    </div>
                  )}
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <h3 className="font-serif text-lg font-bold text-white mb-0.5">{c.name}</h3>
                  <p className="text-gold-500 text-xs mb-1 lowercase">{c.duration}</p>
                  <div className="mb-4">
                    <p className="font-serif text-2xl font-bold leading-tight" style={{ background: c.kind === 'free' ? 'linear-gradient(135deg, #86efac, #22c55e)' : 'linear-gradient(180deg, #fffde0 0%, #ffdd00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {c.kind === 'free' ? c.priceLabel : `${formattedRate} CR / min`}
                    </p>
                  </div>
                  <button type="button" className="btn-gold text-sm px-4 py-2.5 w-full mt-auto" onClick={() => { setSelectedConsult(c.kind); setTimeout(() => calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80) }}>
                    Continua
                  </button>
                  {getApiBaseUrl() && (
                    <p className="text-[10px] text-white/35 mt-3 pt-2 border-t border-white/10">
                      Valeria ora: <span className="text-gold-500/85">{presenceLabel}</span>
                    </p>
                  )}
                </div>
              )
            })}
          </div>
      </motion.section>

      <motion.section
        id="prenota"
        ref={calendarSectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mb-8 scroll-mt-28 relative z-30 isolate"
      >
        <h2 className="font-serif text-xl font-bold text-white mb-1">3) Scegli data e ora</h2>
        <p className="text-white/40 text-sm mb-4 max-w-2xl">I crediti vengono momentaneamente bloccati dal Wallet e si trasformano nel tuo appuntamento fisso.</p>
        
        {showInstantCta && !bookingConfirmed && (
          <div className="mb-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-500/10">
               <span className="text-2xl animate-pulse">⚡</span>
            </div>
            <h3 className="text-emerald-400 font-bold text-lg mb-1">Valeria è Ora Online!</h3>
            <p className="text-white/60 text-sm mb-5 max-w-sm">
               {isChat 
                 ? "Puoi evitare il calendario e avviare la Chat Flash immediatamente." 
                 : "Puoi richiedere il consulto immediato. Valeria caricherà il link alla chiamata tra pochi istanti."}
            </p>
            {instantError && <p className="text-red-400 text-xs mb-4">{instantError}</p>}
            <button
               onClick={handleInstantBooking}
               disabled={instantLoading}
               className="btn-gold px-12 py-3 text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
               {instantLoading ? 'Sincronizzazione...' : isChat ? 'AVVIA CHATTA ORA' : 'VEDIAMOCI ORA'}
            </button>
            <div className="mt-4 flex items-center gap-2">
               <span className="h-px w-8 bg-white/10" />
               <span className="text-[10px] text-white/30 uppercase tracking-widest">Oppure prenota per dopo</span>
               <span className="h-px w-8 bg-white/10" />
            </div>
          </div>
        )}

        <PrivacySealNote className="mb-4 max-w-2xl" />
        <div className="mystical-card p-0 overflow-hidden rounded-lg relative z-0 isolate min-h-[400px]">
          {bookingConfirmed ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-20 text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-emerald-500/10">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl text-white font-serif mb-3">Prenotazione Confermata!</h3>
              <p className="text-white/50 text-sm mb-8 max-w-sm">Le stelle si sono allineate. Valeria ti aspetta per il tuo consulto.</p>
              <button
                onClick={() => {
                  setBookingConfirmed(false)
                  setSelectedConsult(null)
                  setTimeout(() => document.getElementById('storico')?.scrollIntoView({ behavior: 'smooth' }), 50)
                }}
                className="btn-gold px-10 py-3 text-sm font-bold uppercase tracking-widest"
              >
                Ottimo, torna ai miei consulti
              </button>
            </div>
          ) : (
            <InternalBookingCalendar
              consultKind={selectedConsult || 'rapido'}
              previewMode={!selectedConsult}
              onConfirmed={() => {
                setBookingConfirmed(true)
                onBookingConfirmed()
                setTimeout(() => document.getElementById('storico')?.scrollIntoView({ behavior: 'smooth' }), 600)
              }}
              onCancel={() => setSelectedConsult(null)}
            />
          )}
        </div>
      </motion.section>
    </>
  )
}
