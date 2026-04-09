import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import {
  type ServiceKind,
} from '../lib/consultServiceLabel'

import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'
import StaffLayout from '../components/dashboard/StaffLayout'
import { useAstrologyApi } from '../api/astrology'

/** Portale azioni rapide: Meeting / appuntamenti programmati . */
const AGEND_TITLE = 'Agenda Valeria'
type InternalAvailability = {
  day_of_week: number
  week_number: number
  slot_label: string
  is_active: boolean
  start_time: string
  end_time: string
}

type InternalOverride = {
  id: string
  override_date: string
  is_available: boolean
  start_time: string | null
  end_time: string | null
  reason: string | null
}

const DAYS_LABELS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

type ConsultRow = {
  id: string
  clerk_user_id: string | null
  calendly_event_uri: string | null
  calendly_event_name?: string | null
  status: string
  is_free_consult: boolean
  meeting_join_url: string | null
  meeting_provider: string | null
  invitee_email: string | null
  invitee_name: string | null
  start_at: string | null
  end_at: string | null
  paypal_order_id: string | null
  created_at: string
  updated_at: string
  service_kind?: ServiceKind
  cost_credits?: number
  status_billing?: string
}

function badgeClassService(kind: ServiceKind): string {
  if (kind === 'tarocchi') return 'bg-violet-500/20 text-violet-200 border-violet-500/35'
  if (kind === 'coaching') return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/35'
  return 'bg-white/10 text-white/45 border-white/15'
}

function labelService(kind: ServiceKind): string {
  if (kind === 'tarocchi') return 'Tarocchi'
  if (kind === 'coaching') return 'Coaching'
  return 'Non class.'
}


type NoteRow = {
  id: string
  staff_clerk_user_id: string
  body: string
  created_at: string
  updated_at: string
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function ControlRoom() {
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const apiConfigured = Boolean(getApiBaseUrl())

  const [list, setList] = useState<ConsultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailConsult, setDetailConsult] = useState<ConsultRow | null>(null)
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [noteDraft, setNoteDraft] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  const [statusDraft, setStatusDraft] = useState<string>('scheduled')
  const [actualDurationDraft, setActualDurationDraft] = useState<string>('')



  const [internalAvailability, setInternalAvailability] = useState<InternalAvailability[]>([])
  const [internalOverrides, setInternalOverrides] = useState<InternalOverride[]>([])
  const [internalLoading, setInternalLoading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<1 | 2>(1)
  
  const [pendingCharts, setPendingCharts] = useState<any[]>([])
  const [pendingHoros, setPendingHoros] = useState<any[]>([])
  const [editingHoro, setEditingHoro] = useState<any | null>(null)
  const [editingHoroText, setEditingHoroText] = useState('')
  const [editingHoroEnergy, setEditingHoroEnergy] = useState(60)

  const { getLatestHoroscope, approveHoroscope } = useAstrologyApi()

  // Helper date
  const weekInfo = useMemo(() => {
    const now = new Date()
    const getWeekNum = (d: Date) => {
      const ref = new Date('2024-01-01T00:00:00Z')
      const msPerW = 7 * 24 * 60 * 60 * 1000
      const weeks = Math.floor((d.getTime() - ref.getTime()) / msPerW)
      return (Math.abs(weeks) % 2) + 1
    }

    const currentWeekNum = getWeekNum(now) as 1 | 2
    
    // Calcolo date per week 1 e week 2
    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - now.getDay()) // Inizio Domenica
    startOfThisWeek.setHours(0,0,0,0)

    const startOfNextWeek = new Date(startOfThisWeek)
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7)

    return {
      currentWeekNum,
      w1Start: currentWeekNum === 1 ? startOfThisWeek : startOfNextWeek,
      w2Start: currentWeekNum === 2 ? startOfThisWeek : startOfNextWeek
    }
  }, [])

  const loadPendingAnalyses = useCallback(async () => {
    if (!apiConfigured) return
    try {
      const res = await apiJson<{ pendingCharts: any[], pendingHoroscopes: any[] }>(getToken, '/api/astrology/staff/pending')
      setPendingCharts(res.pendingCharts ?? [])
      setPendingHoros(res.pendingHoroscopes ?? [])
    } catch (e) {
      console.error('[loadPendingAnalyses]', e)
    }
  }, [getToken, apiConfigured])

  const loadInternalAvailability = useCallback(async () => {
    if (!apiConfigured) return
    setInternalLoading(true)
    try {
      const res = await apiJson<{ availability: InternalAvailability[] }>(getToken, '/api/staff/booking/availability')
      setInternalAvailability(res.availability)
      const res2 = await apiJson<{ overrides: InternalOverride[] }>(getToken, '/api/staff/booking/overrides')
      setInternalOverrides(res2.overrides)
    } catch (e) {
      console.error('[loadInternalAvailability]', e)
    } finally {
      setInternalLoading(false)
    }
  }, [getToken, apiConfigured])

  const loadList = useCallback(async () => {
    if (!apiConfigured) {
      setLoading(false)
      return
    }
    setListError(null)
    setLoading(true)
    try {
      const data = await apiJson<{ consults: ConsultRow[] }>(getToken, '/api/staff/consults')
      setList(data.consults ?? [])
    } catch (e) {
      setListError(e instanceof ApiError ? String(e.message) : 'Impossibile caricare i consulti')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [getToken, apiConfigured])

  const loadDetail = useCallback(
    async (id: string) => {
      if (!apiConfigured) return
      setDetailError(null)
      setDetailLoading(true)
      try {
        const data = await apiJson<{ consult: ConsultRow; notes: NoteRow[] }>(getToken, `/api/staff/consults/${id}`)
        setDetailConsult(data.consult)
        setNotes(data.notes ?? [])
        setStatusDraft(data.consult.status)
      } catch (e) {
        setDetailError(e instanceof ApiError ? String(e.message) : 'Errore caricamento dettaglio')
        setDetailConsult(null)
        setNotes([])
      } finally {
        setDetailLoading(false)
      }
    },
    [getToken, apiConfigured]
  )

  useEffect(() => {
    if (!isLoaded) return
    if (!user || !isPrivilegedClerkUser(user)) {
      navigate('/area-personale', { replace: true })
      return
    }
    void loadInternalAvailability()
    void loadPendingAnalyses()
  }, [isLoaded, user, navigate, loadList, loadInternalAvailability, loadPendingAnalyses])

  useEffect(() => {
    if (!selectedId) {
      setDetailConsult(null)
      setNotes([])
      return
    }
    setDetailConsult(null)
    setNotes([])
    setDetailError(null)
    void loadDetail(selectedId)
  }, [selectedId, loadDetail])

  useEffect(() => {
    if (!user || !isLoaded) return
    if (!isPrivilegedClerkUser(user)) return
    const t = window.setInterval(() => {
      void loadList()
    }, 60_000)
    return () => clearInterval(t)
  }, [user, isLoaded, loadList])

  if (!isLoaded || !user) return null

  if (!isPrivilegedClerkUser(user)) return null

  const submitNote = async () => {
    const body = noteDraft.trim()
    if (!selectedId || !body || !apiConfigured) return
    setNoteSaving(true)
    try {
      await apiJson<{ note: NoteRow }>(getToken, `/api/staff/consults/${selectedId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setNoteDraft('')
      await loadDetail(selectedId)
      await loadList()
    } catch (e) {
      setDetailError(e instanceof ApiError ? String(e.message) : 'Salvataggio nota fallito')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleApproveHoro = async () => {
    if (!editingHoro) return
    try {
      await approveHoroscope({
        id: editingHoro.id,
        forecast_text: editingHoroText,
        energy_level: editingHoroEnergy,
        lucky_days: []
      })
      setEditingHoro(null)
      void loadPendingAnalyses()
      alert("Oroscopo inviato con successo!")
    } catch (err: any) {
      alert(err.message || "Errore durante l'invio")
    }
  }

  const saveStatus = async () => {
    if (!selectedId || !detailConsult || statusDraft === detailConsult.status) return
    if (!apiConfigured) return
    setDetailLoading(true)
    try {
      const data = await apiJson<{ consult: ConsultRow }>(getToken, `/api/staff/consults/${selectedId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusDraft }),
      })
      setDetailConsult(data.consult)
      await loadList()
    } catch (e) {
      setDetailError(e instanceof ApiError ? String(e.message) : 'Aggiornamento stato fallito')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleClaimCredits = async () => {
    if (!selectedId || !apiConfigured) return
    if (!window.confirm("Confermi l'incasso dei crediti?")) return
    setDetailLoading(true)
    try {
      await apiJson(getToken, `/api/staff/consults/${selectedId}/claim`, {
        method: 'POST',
        body: JSON.stringify({ actual_duration_minutes: actualDurationDraft ? parseInt(actualDurationDraft) : null })
      })
      await loadDetail(selectedId)
      await loadList()
    } catch (e) {
      setDetailError(e instanceof ApiError ? String(e.message) : 'Errore durante l\'incasso')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <StaffLayout title="Control Room" subtitle="Gestione appuntamenti interni e disponibilità">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Gestione Disponibilità Interna (Sostituisce Calendly) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="mystical-card mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-lg text-white">Disponibilità Professionale (Booking Interno)</h2>
              <p className="text-white/45 text-sm mt-1 max-w-2xl">
                Imposta i tuoi orari bisettimanali. Scegli la settimana e definisci le fasce per mattina, pomeriggio e sera.
              </p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setSelectedWeek(1)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedWeek === 1 ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-white/40 hover:text-white/70'}`}
              >
                Settimana 1
              </button>
              <button 
                onClick={() => setSelectedWeek(2)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedWeek === 2 ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-white/40 hover:text-white/70'}`}
              >
                Settimana 2
              </button>
            </div>
            {internalLoading && <span className="text-white/30 text-xs">Aggiornamento...</span>}
          </div>

          <div className="space-y-4">
            {DAYS_LABELS.map((label, idx) => {
              const daySlots = internalAvailability.filter(a => a.day_of_week === idx && a.week_number === selectedWeek)
              
              const weekStart = selectedWeek === 1 ? weekInfo.w1Start : weekInfo.w2Start
              const actualDate = new Date(weekStart)
              actualDate.setDate(weekStart.getDate() + idx)
              const dateLabel = actualDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })

              const getSlot = (slotLabel: string) => daySlots.find(s => s.slot_label === slotLabel) || {
                day_of_week: idx,
                week_number: selectedWeek,
                slot_label: slotLabel,
                is_active: false,
                start_time: slotLabel === 'morning' ? '09:00' : slotLabel === 'afternoon' ? '14:00' : '19:00',
                end_time: slotLabel === 'morning' ? '13:00' : slotLabel === 'afternoon' ? '18:00' : '22:00'
              }

              return (
                <div key={label} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-widest text-gold-500 font-bold">{label}</p>
                    <p className="text-sm text-white font-serif">{dateLabel}</p>
                    <p className="text-[10px] text-white/30 italic">Settimana {selectedWeek}</p>
                  </div>
                  
                  {['morning', 'afternoon', 'evening'].map(type => {
                    const slot = getSlot(type)
                    const labelIT = type === 'morning' ? 'Mattina' : type === 'afternoon' ? 'Pomeriggio' : 'Sera';
                    const icon = type === 'morning' ? '☀️' : type === 'afternoon' ? '🌗' : '🌙';

                    return (
                      <div key={type} className={`p-3 rounded-xl border transition-all ${slot.is_active ? 'bg-gold-500/5 border-gold-500/20' : 'bg-black/20 border-white/5 opacity-50'}`}>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-bold text-white/80 uppercase tracking-wider">{icon} {labelIT}</span>
                          <input 
                            type="checkbox" 
                            checked={slot.is_active}
                            onChange={async (e) => {
                              await apiJson(getToken, '/api/staff/booking/availability', {
                                method: 'POST',
                                body: JSON.stringify({ ...slot, is_active: e.target.checked })
                              })
                              void loadInternalAvailability()
                            }}
                            className="accent-gold-500 w-4 h-4 cursor-pointer"
                          />
                        </div>
                        {slot.is_active && (
                          <div className="flex gap-2.5">
                            <input 
                              type="text" 
                              defaultValue={slot.start_time}
                              onBlur={async (e) => {
                                if (e.target.value === slot.start_time) return
                                await apiJson(getToken, '/api/staff/booking/availability', {
                                  method: 'POST',
                                  body: JSON.stringify({ ...slot, start_time: (e.target as HTMLInputElement).value })
                                })
                                void loadInternalAvailability()
                              }}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white font-mono text-center focus:border-gold-500/50 outline-none transition-colors"
                            />
                            <input 
                              type="text" 
                              defaultValue={slot.end_time}
                              onBlur={async (e) => {
                                if (e.target.value === slot.end_time) return
                                await apiJson(getToken, '/api/staff/booking/availability', {
                                  method: 'POST',
                                  body: JSON.stringify({ ...slot, end_time: (e.target as HTMLInputElement).value })
                                })
                                void loadInternalAvailability()
                              }}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white font-mono text-center focus:border-gold-500/50 outline-none transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <div className="border-t border-white/5 pt-6 mt-6">
            <h3 className="text-white font-medium text-sm mb-4">Giorni Speciali & Chiusure Eccezionali</h3>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-white/30 text-[11px] uppercase tracking-widest mb-3 font-bold text-center sm:text-left">Date con orari speciali registrate</p>
                {internalOverrides.length === 0 ? (
                  <p className="text-white/20 text-xs italic text-center sm:text-left">Nessuna eccezione impostata.</p>
                ) : (
                  <div className="space-y-2">
                    {internalOverrides.map(ov => (
                      <div key={ov.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-2.5 group">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${ov.is_available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                          <div>
                            <p className="text-white/80 text-xs font-medium">
                              {new Date(ov.override_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] text-white/40 italic">{ov.reason || (ov.is_available ? 'Orario speciale' : 'Chiuso')}</p>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            if (!window.confirm("Rimuovere questa regola?")) return
                            await apiJson(getToken, `/api/staff/booking/overrides/${ov.id}`, { method: 'DELETE' })
                            void loadInternalAvailability()
                          }}
                          className="text-white/10 hover:text-red-400 p-1.5 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
 
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                <p className="text-white/45 text-[10px] uppercase tracking-widest mb-4 font-bold">Aggiungi Giorno Speciale</p>
                <form 
                  className="grid grid-cols-2 gap-3"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const form = e.target as HTMLFormElement
                    const data = {
                      override_date: (form.elements.namedItem('date') as HTMLInputElement).value,
                      is_available: (form.elements.namedItem('available') as HTMLSelectElement).value === 'true',
                      reason: (form.elements.namedItem('reason') as HTMLInputElement).value
                    }
                    await apiJson(getToken, '/api/staff/booking/overrides', {
                      method: 'POST',
                      body: JSON.stringify(data)
                    })
                    form.reset()
                    void loadInternalAvailability()
                  }}
                >
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] text-white/40 mb-1">Data</label>
                    <input name="date" type="date" required className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] text-white/40 mb-1">Stato</label>
                    <select name="available" className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white">
                      <option value="false">Chiuso / Ferie</option>
                      <option value="true">Orario Speciale (Apre)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-white/40 mb-1">Motivazione (Opzionale)</label>
                    <input name="reason" type="text" placeholder="Es: Giorno di riposo" className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-white" />
                  </div>
                  <button type="submit" className="col-span-2 btn-gold text-[10px] py-2 mt-2">Aggiungi Regola</button>
                </form>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── NUOVO: Laboratorio Astrale (Pianeti e Mentore) ── */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mystical-card border-indigo-500/20 bg-indigo-500/5 mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl text-white flex items-center gap-3">
                <span className="text-3xl">🔭</span> Laboratorio Astrale
              </h2>
              <p className="text-white/45 text-sm mt-1">Gestione Temi Natali e Mentore Silente in attesa di responso</p>
            </div>
            <button 
              onClick={loadPendingAnalyses}
              className="text-[10px] uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
            >
              Aggiorna Richieste
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sezione Oroscopi (Mentore Silente) */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-indigo-300/60 mb-2">Mentore Silente (Oroscopi)</h3>
              {pendingHoros.length === 0 ? (
                <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl italic text-white/20 text-xs">
                  Tutti i Mentori sono svegli e al lavoro.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingHoros.map(h => (
                    <div key={h.id} className="p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 flex items-center justify-between group">
                       <div>
                          <p className="text-white font-serif text-lg leading-none mb-1">{h.clerk_user_id.substring(0, 12)}...</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            Richiesto il {new Date(h.created_at).toLocaleDateString()}
                          </p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold uppercase tracking-widest">In attesa</span>
                          <button 
                            onClick={() => {
                               setEditingHoro(h)
                               setEditingHoroText('')
                               setEditingHoroEnergy(60)
                            }}
                            className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-all"
                          >
                             ✍️
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sezione Temi Natali */}
            <div className="space-y-4">
               <h3 className="text-xs uppercase tracking-[0.2em] font-black text-gold-300/60 mb-2">Temi Natali Completi</h3>
               {pendingCharts.length === 0 ? (
                <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl italic text-white/20 text-xs">
                  Nessuna mappa astrale da disegnare.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingCharts.map(c => (
                    <div key={c.id} className="p-4 rounded-xl bg-gold-900/20 border border-gold-500/30 flex items-center justify-between">
                       <div>
                          <p className="text-white font-serif text-lg leading-none mb-1">{c.birth_city}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            {c.birth_date} • {c.birth_time}
                          </p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full border border-gold-500/30 font-bold uppercase tracking-widest">{c.status}</span>
                          <button 
                             onClick={() => {/* TODO: Aprire editor tema natale */}}
                             className="p-2 bg-gold-500 hover:bg-gold-400 text-black rounded-lg transition-all"
                          >
                             🔭
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mystical-card mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="font-serif text-lg text-white">{AGEND_TITLE} (Prossimi Appuntamenti)</h2>
              <p className="text-white/45 text-sm mt-1 max-w-2xl">
                Visualizzazione bisettimanale degi appuntamenti prenotati sul sito.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
               <button
                  type="button"
                  onClick={() => void loadList()}
                  className="btn-gold text-sm px-4 py-2"
                >
                  Aggiorna Agenda
                </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             {[1, 2].map(wNum => {
                const weekStart = wNum === 1 ? weekInfo.w1Start : weekInfo.w2Start
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 6)
                
                const appointments = list.filter(c => {
                  if (!c.start_at || c.status === 'cancelled') return false
                  const d = new Date(c.start_at)
                  return d >= weekStart && d <= new Date(weekEnd.getTime() + 24*3600*1000)
                }).sort((a,b) => new Date(a.start_at!).getTime() - new Date(b.start_at!).getTime())

                return (
                  <div key={wNum} className={`rounded-3xl border p-5 ${wNum === weekInfo.currentWeekNum ? 'bg-gold-500/5 border-gold-500/20 shadow-[0_0_40px_rgba(212,160,23,0.05)]' : 'bg-white/[0.02] border-white/10'}`}>
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-serif text-white font-bold">Settimana {wNum}</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">
                          {weekStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} — {weekEnd.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {wNum === weekInfo.currentWeekNum && (
                        <span className="text-[9px] bg-gold-500 text-black px-2 py-0.5 rounded-full font-bold uppercase">Corrente</span>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {appointments.length === 0 ? (
                        <p className="text-white/20 text-xs italic py-4 text-center">Nessun appuntamento in questa settimana.</p>
                      ) : (
                        appointments.map(app => {
                           const sd = new Date(app.start_at!)
                           const sk = app.service_kind ?? 'unknown'
                           return (
                             <button
                                key={app.id}
                                onClick={() => setSelectedId(app.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === app.id ? 'bg-gold-500/30 border-gold-500/60 ring-1 ring-gold-500/20' : 'bg-white/[0.05] border-white/10 hover:border-gold-500/30'}`}
                             >
                                <div className="flex items-center justify-between mb-2">
                                   <span className="text-gold-400 font-serif text-sm font-bold tracking-tight">
                                     {sd.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} — {sd.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                   <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${badgeClassService(sk)}`}>
                                      {labelService(sk)}
                                   </span>
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-white font-bold text-sm">{app.invitee_name || 'Cliente senza nome'}</p>
                                  <p className="text-white/60 text-xs truncate">{app.invitee_email || 'No email'}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                                  <span className="text-[9px] text-gold-500/80 uppercase font-black tracking-widest">{app.status}</span>
                                </div>
                             </button>
                           )
                        })
                      )}
                    </div>
                  </div>
                )
             })}
          </div>
        </motion.section>

        {!apiConfigured && (
          <div className="mystical-card border border-amber-600/30 text-amber-200/90 text-sm mb-8">
            <strong className="text-white">Backend non collegato.</strong> Aggiungi{' '}
            <code className="text-amber-300/90">VITE_API_URL</code> nel build del sito (stesso valore dell’URL pubblico
            del servizio API su Railway) e ridistribuisci.
          </div>
        )}

        {listError && (
          <p className="text-red-400/90 text-sm mb-6" role="alert">
            {listError}
          </p>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2 mystical-card p-0 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white text-sm">Consulti recenti</h2>
              {loading && <span className="text-white/35 text-xs">Caricamento…</span>}
            </div>
            <ul className="max-h-[min(70vh,560px)] overflow-y-auto divide-y divide-white/5">
              {list.length === 0 && !loading && (
                <li className="px-4 py-8 text-white/40 text-sm text-center">Nessun consulto in elenco.</li>
              )}
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedId === c.id ? 'bg-gold-600/15 border-l-2 border-gold-500' : 'hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    <p className="text-white text-sm font-medium truncate">{c.invitee_name || c.invitee_email || 'Senza nome'}</p>
                    <p className="text-white/40 text-xs truncate">{c.invitee_email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                        {c.status}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${badgeClassService(c.service_kind ?? 'unknown')}`}
                      >
                        {labelService(c.service_kind ?? 'unknown')}
                      </span>
                      <span className="text-[10px] text-white/35">{formatWhen(c.start_at)}</span>
                      {c.status_billing === 'billed' && (
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">
                          Incassato
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 mystical-card"
          >
            {!selectedId && (
              <p className="text-white/45 text-sm">Seleziona un consulto dall’elenco per vedere dettagli e note.</p>
            )}
            {selectedId && detailLoading && !detailConsult && (
              <p className="text-white/45 text-sm">Caricamento dettaglio…</p>
            )}
            {detailError && (
              <p className="text-red-400/90 text-sm mb-4" role="alert">
                {detailError}
              </p>
            )}
            {detailConsult && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl text-white mb-2">Dettaglio</h3>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <dt className="text-white/40">Invitato</dt>
                      <dd className="text-white/90">{detailConsult.invitee_name || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Email</dt>
                      <dd className="text-white/90 break-all">{detailConsult.invitee_email || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Inizio</dt>
                      <dd className="text-white/90">{formatWhen(detailConsult.start_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Clerk cliente</dt>
                      <dd className="text-white/90 font-mono text-xs break-all">{detailConsult.clerk_user_id || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Tipo consulto (Interno)</dt>
                      <dd className="text-white/90">{detailConsult.calendly_event_name?.trim() || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Indicativo</dt>
                      <dd>
                        <span
                          className={`inline-block text-xs uppercase tracking-wide px-2 py-0.5 rounded border ${badgeClassService(detailConsult.service_kind ?? 'unknown')}`}
                        >
                          {labelService(detailConsult.service_kind ?? 'unknown')}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                       <dt className="text-white/40">Accesso alla Stanza in Diretta</dt>
                       <dd className="text-white/90 mt-2">
                         <Link
                           to={`/sessione/${detailConsult.id}`}
                           className="inline-flex items-center gap-2 bg-gold-500 text-dark-500 hover:bg-gold-400 px-8 py-3 rounded-xl text-sm font-bold transition-all border border-gold-400/20"
                         >
                           Entra nella Live Chat
                           <span className="text-lg leading-none">→</span>
                         </Link>
                       </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label htmlFor="cr-status" className="block text-white/45 text-xs mb-1">
                      Stato
                    </label>
                    <select
                      id="cr-status"
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="scheduled">scheduled</option>
                      <option value="pending_payment">pending_payment</option>
                      <option value="done">done</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn-outline text-sm px-4 py-2"
                    onClick={() => void saveStatus()}
                    disabled={detailLoading || statusDraft === detailConsult.status}
                  >
                    Salva stato
                  </button>

                  {(detailConsult.status_billing !== 'billed' && detailConsult.cost_credits && detailConsult.cost_credits > 0) && (
                    <div className="flex flex-col gap-2 ml-auto items-end">
                       <div className="flex items-center gap-2">
                         <label htmlFor="duration-draft" className="text-white/40 text-[10px] uppercase">Minuti Effettivi</label>
                         <input
                           id="duration-draft"
                           type="number"
                           min="0"
                           value={actualDurationDraft}
                           onChange={(e) => setActualDurationDraft(e.target.value)}
                           className="w-16 bg-dark-400 border border-gold-500/30 rounded px-2 py-1 text-xs text-white text-center"
                           placeholder="Tutti"
                         />
                       </div>
                       <button
                         type="button"
                         onClick={handleClaimCredits}
                         disabled={detailLoading}
                         className="btn-gold text-[10px] px-4 py-2 uppercase tracking-widest"
                       >
                         Incassa Crediti
                       </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-white font-medium text-sm mb-4">Note Evolutive</h4>
                  <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {notes.length === 0 && <p className="text-white/25 text-xs italic">Nessuna nota presente.</p>}
                    {notes.map((n) => (
                      <div key={n.id} className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                        <p className="text-white/80 text-sm">{n.body}</p>
                        <p className="text-white/20 text-[10px] mt-1">{formatWhen(n.created_at)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Aggiungi una nota privata su questa cliente…"
                      className="flex-1 bg-dark-400 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-gold-500/50 outline-none resize-none"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => void submitNote()}
                      disabled={noteSaving || !noteDraft}
                      className="btn-outline text-xs px-4"
                    >
                      {noteSaving ? '…' : 'Invia'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        </div>
      </div>

      {/* ── MODALE EDITOR OROSCOPO (Valeria Scrive) ── */}
      {editingHoro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="w-full max-w-2xl bg-[#0a0a10] border border-indigo-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col"
           >
              <div className="p-6 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between">
                 <div>
                    <h3 className="font-serif text-xl text-white">Laboratorio Oroscopo</h3>
                    <p className="text-[10px] text-indigo-300/60 uppercase tracking-widest mt-1">Risveglio della Mentore Silente</p>
                 </div>
                 <button onClick={() => setEditingHoro(null)} className="text-white/40 hover:text-white">✕</button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
                 <div>
                    <label className="block text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-3">Messaggio per l'Utente</label>
                    <textarea 
                       value={editingHoroText}
                       onChange={(e) => setEditingHoroText(e.target.value)}
                       placeholder="Scrivi qui la guida settimanale di Valeria..."
                       rows={10}
                       className="w-full bg-black/40 border border-indigo-500/20 rounded-2xl p-4 text-sm text-indigo-100 placeholder:text-indigo-900/40 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] text-indigo-300 font-black uppercase tracking-widest mb-3 text-center">Livello Energia (0-100)</label>
                       <input 
                          type="range" min="0" max="100" 
                          value={editingHoroEnergy}
                          onChange={(e) => setEditingHoroEnergy(parseInt(e.target.value))}
                          className="w-full accent-indigo-500 appearance-none bg-indigo-900/20 h-1.5 rounded-full"
                       />
                       <p className="text-center mt-2 text-xl font-serif text-indigo-200">{editingHoroEnergy}%</p>
                    </div>
                    <div className="flex items-center justify-center">
                       <button 
                         onClick={handleApproveHoro}
                         className="mystical-button w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-105 transition-transform"
                       >
                          ✨ Pubblica Responso
                       </button>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      )}
    </StaffLayout>
  )
}
