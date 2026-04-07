import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { apiJson } from '../lib/api'
import { useAuth } from '@clerk/clerk-react'

interface BookingCalendarProps {
  consultKind: string
  onConfirmed?: () => void
  onCancel?: () => void
}

type SlotsData = Record<string, string[]>

export function InternalBookingCalendar({ consultKind, onConfirmed, onCancel }: BookingCalendarProps) {
  const { getToken } = useAuth()
  
  const [slots, setSlots] = useState<SlotsData>({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSlots() {
      try {
        const res = await apiJson<SlotsData>(getToken, '/api/booking/available-slots')
        setSlots(res || {})
        // Seleziona la prima data disponibile di default
        if (res) {
          const dates = Object.keys(res).sort()
          if (dates.length > 0) setSelectedDate(dates[0])
        }
      } catch (e) {
        console.error('[BookingCalendar] Error fetching slots:', e)
        setError('Impossibile caricare le disponibilità. Riprova più tardi.')
      } finally {
        setLoading(false)
      }
    }
    void loadSlots()
  }, [getToken])

  const dates = useMemo(() => Object.keys(slots).sort(), [slots])
  const currentDaySlots = useMemo(() => (selectedDate ? slots[selectedDate] || [] : []), [slots, selectedDate])

  async function handleConfirm() {
    if (!selectedSlot || confirming) return
    setConfirming(true)
    setError(null)
    try {
      const res = await apiJson<{ ok: boolean; internal: boolean; error?: string }>(getToken, '/api/booking/start', {
        method: 'POST',
        body: JSON.stringify({
          consultKind,
          slotIso: selectedSlot
        })
      })
      if (res.ok) {
        onConfirmed?.()
      } else {
        setError(res.error || 'Errore durante la prenotazione.')
      }
    } catch (e: any) {
      setError(e.message || 'Errore di connessione.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
        <p className="text-white/40 text-xs tracking-widest uppercase mb-0.5">Interrogando le stelle per la tua disponibilità...</p>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mystical-card p-6 border border-white/10 shadow-2xl bg-dark-900/60 backdrop-blur-xl max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-serif text-2xl text-white">Scegli il tuo momento</h3>
          <p className="text-white/40 text-sm italic">Valeria è pronta ad accoglierti in queste date</p>
        </div>
        <button onClick={onCancel} className="text-white/20 hover:text-white/60 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Date Selector (Horizontal Scroll) */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Seleziona una data</p>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {dates.map(date => {
            const d = new Date(date)
            const isSelected = selectedDate === date
            return (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
                className={`shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-2xl border transition-all ${
                  isSelected ? 'bg-gold-500 border-gold-400 shadow-lg shadow-gold-500/20 scale-105' : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-tighter ${isSelected ? 'text-black/60 font-bold' : 'text-white/30'}`}>
                  {d.toLocaleDateString('it-IT', { weekday: 'short' })}
                </span>
                <span className={`text-xl font-serif mt-1 ${isSelected ? 'text-black' : 'text-white/80'}`}>
                  {d.getDate()}
                </span>
                <span className={`text-[9px] ${isSelected ? 'text-black/60' : 'text-white/30'}`}>
                  {d.toLocaleDateString('it-IT', { month: 'short' })}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Slots Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8 h-48 overflow-y-auto pr-2 custom-scrollbar"
        >
          {currentDaySlots.length === 0 ? (
            <div className="col-span-full py-12 text-center text-white/20 text-sm italic">
              Nessun orario libero trovato per questa data.
            </div>
          ) : (
            currentDaySlots.map(slot => {
              const date = new Date(slot)
              const timeStr = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
              const isSelected = selectedSlot === slot
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                    isSelected ? 'bg-gold-500 border-gold-400 text-black shadow-lg shadow-gold-500/10' : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {timeStr}
                </button>
              )
            })
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleConfirm}
          disabled={!selectedSlot || confirming}
          className={`btn-gold w-full py-4 text-sm font-bold uppercase tracking-widest transition-all ${
            (!selectedSlot || confirming) ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:scale-[1.02] active:scale-95'
          }`}
        >
          {confirming ? 'Conferma in corso...' : selectedSlot ? 'Conferma Prenotazione' : 'Seleziona un orario'}
        </button>
        <p className="text-[10px] text-center text-white/30 uppercase tracking-tight">
          L&apos;importo sarà contabilizzato definitivamente a fine consulto. I crediti passeranno dal tuo saldo &apos;Disponibile&apos; a quello &apos;Impegnato&apos; fino alla chiusura della sessione.
        </p>
      </div>
    </motion.div>
  )
}
