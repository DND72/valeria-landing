
import { useAuth, useUser } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import {
  type ServiceKind,
} from '../lib/consultServiceLabel'

import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'
import StaffLayout from '../components/dashboard/StaffLayout'
import { useAstrologyApi } from '../api/astrology'
import ReactMarkdown from 'react-markdown'

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
  const [pendingHoroscopes, setPendingHoroscopes] = useState<any[]>([])
  const [pendingSynastries, setPendingSynastries] = useState<any[]>([])
  const [editingHoro, setEditingHoro] = useState<any | null>(null)
  const [editingHoroText, setEditingHoroText] = useState('')
  const [editingHoroEnergy, setEditingHoroEnergy] = useState(60)
  const [editingHoroLucky, setEditingHoroLucky] = useState<string[]>([])

  const [editingChart, setEditingChart] = useState<any | null>(null)
  const [editingChartText, setEditingChartText] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showChartPreview, setShowChartPreview] = useState(false)
  const [waitingConsult, setWaitingConsult] = useState<any | null>(null)
  
  const alertAudio = useRef<HTMLAudioElement | null>(null)

  const { approveHoroscope, approveChart, generateSummary } = useAstrologyApi()

  useEffect(() => {
     const checkWaiting = async () => {
        try {
           const res = await apiJson<{ meetings: any[] }>(getToken, '/api/staff/calendly-today')
           const waiting = (res.meetings || []).find((m: any) => m.status === 'client_waiting')
           if (waiting) {
              if (!waitingConsult) {
                 alertAudio.current?.play().catch(() => {})
              }
              setWaitingConsult(waiting)
           } else {
              setWaitingConsult(null)
           }
        } catch {}
     }
     const itv = setInterval(checkWaiting, 10000)
     checkWaiting()
     return () => clearInterval(itv)
  }, [waitingConsult, getToken])

  const weekInfo = useMemo(() => {
    const now = new Date()
    const getWeekNum = (d: Date) => {
      const ref = new Date('2024-01-01T00:00:00Z')
      const msPerW = 7 * 24 * 60 * 60 * 1000
      const weeks = Math.floor((d.getTime() - ref.getTime()) / msPerW)
      return (Math.abs(weeks) % 2) + 1
    }
    const currentWeekNum = getWeekNum(now) as 1 | 2
    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - now.getDay())
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
      const res = await apiJson<{ pendingCharts: any[], pendingHoroscopes: any[], pendingSynastries: any[] }>(getToken, '/api/astrology/staff/pending')
      setPendingCharts(res.pendingCharts ?? [])
      setPendingHoroscopes(res.pendingHoroscopes ?? [])
      setPendingSynastries(res.pendingSynastries ?? [])
    } catch (e) {
      console.error('[loadPendingAnalyses]', e)
    }
  }, [getToken, apiConfigured])

  const openEditorHoro = (h: any) => {
    setEditingHoro(h)
    setEditingHoroText(h.forecast_text || '')
    setEditingHoroEnergy(h.energy_level || 60)
    setEditingHoroLucky(h.lucky_days || [])
  }

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
    void loadList()
  }, [isLoaded, user, navigate, loadList, loadInternalAvailability, loadPendingAnalyses])

  useEffect(() => {
    if (!selectedId) {
      setDetailConsult(null)
      setNotes([])
      return
    }
    void loadDetail(selectedId)
  }, [selectedId, loadDetail])

  if (!isLoaded || !user) return null

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
    } catch (e) {
      setDetailError(e instanceof ApiError ? String(e.message) : 'Salvataggio nota fallito')
    } finally {
      setNoteSaving(false)
    }
  }

  const handleApproveHoro = async () => {
    if (!editingHoro) return
    try {
      await approveHoroscope({
        id: editingHoro.id,
        forecast_text: editingHoroText,
        energy_level: editingHoroEnergy,
        lucky_days: editingHoroLucky
      })
      setEditingHoro(null)
      void loadPendingAnalyses()
      alert("Oroscopo inviato con successo!")
    } catch (err: any) {
      alert(err.message || "Errore durante l'invio")
    }
  }

  const handleApproveChart = async () => {
    if (!editingChart) return
    try {
      await approveChart(editingChart.id, 'chart', editingChartText)
      setEditingChart(null)
      void loadPendingAnalyses()
      alert("Analisi pubblicata con successo!")
    } catch (err: any) {
      alert(err.message || "Errore pubblicazione")
    }
  }

  const handleRegenerateAdvancedSummary = async () => {
    if (!editingChart) return
    setIsRegenerating(true)
    try {
      const res = await generateSummary(editingChart.id)
      setEditingChartText(res.interpretation)
    } catch (err: any) {
      alert("Errore rigenerazione: " + err.message)
    } finally {
      setIsRegenerating(false)
    }
  }

  const saveStatus = async () => {
    if (!selectedId || !detailConsult || statusDraft === detailConsult.status) return
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
    <StaffLayout title="Control Room" subtitle="Centro di Comando Valeria">
        <audio ref={alertAudio} src="https://assets.mixkit.co/active_storage/sfx/1792/1792-preview.mp3" preload="auto" />

        <AnimatePresence>
          {waitingConsult && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 16 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
            >
              <div className="bg-gold-500 text-black p-4 rounded-2xl shadow-lg flex items-center justify-between border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center animate-bounce"><span>🔔</span></div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Cliente in Attesa Live!</p>
                    <p className="font-serif text-sm font-bold">{waitingConsult.inviteeSummary || 'Sessione Aperta'}</p>
                  </div>
                </div>
                <Link to={`/sessione/${waitingConsult.id}`} className="bg-black text-gold-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-all font-bold">Entra Ora</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* LABORATORIO ASTRALE */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card mb-12 border-indigo-500/20 bg-indigo-500/5"
        >
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="font-serif text-2xl text-white">Laboratorio Astrale</h2>
                <p className="text-white/40 text-sm mt-1 uppercase tracking-widest">Analisi da elaborare e pubblicare</p>
             </div>
             <div className="flex gap-2">
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
                   {pendingCharts.length + pendingHoroscopes.length + pendingSynastries.length} Da Gestire
                </span>
                <button onClick={loadPendingAnalyses} className="bg-white/5 hover:bg-white/10 text-white/40 hover:text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold transition-all">Aggiorna</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {pendingCharts.map(item => (
                <div key={item.id} className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-gold-500/40 transition-all flex flex-col justify-between">
                   <div>
                      <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] uppercase font-bold text-gold-500 tracking-widest bg-gold-500/10 px-2 py-0.5 rounded">Tema Natale</span>
                         <span className="text-[10px] text-white/30">{new Date(item.created_at).toLocaleDateString('it-IT')}</span>
                      </div>
                      <h4 className="text-white font-serif text-lg mb-1">{item.display_name}</h4>
                      <p className="text-white/40 text-[11px] truncate">{item.birth_city} ✦ {item.declared_birthday}</p>
                   </div>
                   <button onClick={() => { setEditingChart(item); setEditingChartText(item.interpretation || ""); }} className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-white/80">Revisiona Analisi</button>
                </div>
             ))}

             {pendingHoroscopes.map(item => (
                <div key={item.id} className="bg-black/40 border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                   <div>
                      <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">Mentore Silente</span>
                         <span className="text-[10px] text-white/30">{new Date(item.created_at).toLocaleDateString('it-IT')}</span>
                      </div>
                      <h4 className="text-white font-serif text-lg mb-1">{item.display_name}</h4>
                      <p className="text-indigo-300/40 text-[10px] uppercase tracking-wider italic">Richiesta di Risveglio</p>
                   </div>
                   <button onClick={() => openEditorHoro(item)} className="mt-6 w-full py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-indigo-200">Scrivi Responso</button>
                </div>
             ))}

             {pendingSynastries.map(item => (
                <div key={item.id} className="bg-black/40 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all flex flex-col justify-between">
                   <div>
                      <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] uppercase font-bold text-red-400 tracking-widest bg-red-500/10 px-2 py-0.5 rounded">Sinastria</span>
                         <span className="text-[10px] text-white/30">{new Date(item.created_at).toLocaleDateString('it-IT')}</span>
                      </div>
                      <h4 className="text-white font-serif text-lg mb-1">{item.display_name}</h4>
                      <p className="text-red-300/40 text-[10px] uppercase tracking-wider">Libro dell'Amore</p>
                   </div>
                   <button onClick={() => { setEditingChart(item); setEditingChartText(item.interpretation || ""); }} className="mt-6 w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-200">Revisiona Libro</button>
                </div>
             ))}

             {pendingCharts.length === 0 && pendingHoroscopes.length === 0 && pendingSynastries.length === 0 && (
                <div className="lg:col-span-3 py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
                   <span className="text-4xl block mb-4 opacity-20">✨</span>
                   <p className="text-white/20 text-sm uppercase tracking-widest">Tutte le stelle sono state ascoltate.</p>
                </div>
             )}
          </div>
        </motion.section>

        {/* AGENDA */}
        <div className="grid lg:grid-cols-5 gap-8">
           <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 mystical-card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                 <h2 className="font-semibold text-white text-sm">Consulti recenti</h2>
                 {loading && <span className="text-white/35 text-xs">Caricamento…</span>}
              </div>
              <ul className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
                 {list.map((c) => (
                    <li key={c.id}>
                       <button onClick={() => setSelectedId(c.id)} className={`w-full text-left px-4 py-3 transition-colors ${selectedId === c.id ? 'bg-gold-600/15 border-l-2 border-gold-500' : 'hover:bg-white/5 border-l-2 border-transparent'}`}>
                          <p className="text-white text-sm font-medium truncate">{c.invitee_name || c.invitee_email || 'Senza nome'}</p>
                          <p className="text-[10px] text-white/40">{formatWhen(c.start_at)} — {c.status}</p>
                       </button>
                    </li>
                 ))}
              </ul>
           </motion.section>

           <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 mystical-card">
              {detailConsult ? (
                 <div className="space-y-6">
                    <h3 className="font-serif text-xl text-white">Dettaglio Consulto</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                       <div><p className="text-white/40">Cliente</p><p className="text-white">{detailConsult.invitee_name}</p></div>
                       <div><p className="text-white/40">Email</p><p className="text-white">{detailConsult.invitee_email}</p></div>
                       <div><p className="text-white/40">Inizio</p><p className="text-white">{formatWhen(detailConsult.start_at)}</p></div>
                       <div><p className="text-white/40">Tipo</p><p className="text-white">{detailConsult.calendly_event_name || 'Interno'}</p></div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                       <Link to={`/sessione/${detailConsult.id}`} className="bg-gold-500 text-black px-6 py-2 rounded-lg text-xs font-bold uppercase">Entra nella Live</Link>
                    </div>
                    {/* Note */}
                    <div className="pt-6 border-t border-white/10">
                       <h4 className="text-white text-sm mb-4">Note</h4>
                       <div className="space-y-2 mb-4">
                          {notes.map(n => <div key={n.id} className="bg-white/5 p-2 rounded text-[11px] text-white/80">{n.body}</div>)}
                       </div>
                       <textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs text-white" rows={2} />
                       <button onClick={submitNote} disabled={noteSaving || !noteDraft} className="btn-outline text-[10px] px-3 py-1 mt-2">Salva Nota</button>
                    </div>
                 </div>
              ) : <p className="text-white/30 text-sm">Seleziona un consulto.</p>}
           </motion.section>
        </div>
      </div>

      {/* MODALI EDITOR */}
      {editingHoro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90">
           <div className="w-full max-w-2xl bg-[#0a0a10] border border-indigo-500/40 rounded-3xl p-8">
              <h3 className="font-serif text-2xl text-white mb-6">Editor Mentore Silente</h3>
              <textarea value={editingHoroText} onChange={e => setEditingHoroText(e.target.value)} className="w-full h-64 bg-black/40 border border-indigo-500/20 rounded-2xl p-4 text-sm text-white outline-none" placeholder="Scrivi il responso..." />
              <div className="flex justify-end gap-3 mt-6">
                 <button onClick={() => setEditingHoro(null)} className="text-white/40 px-4">Annulla</button>
                 <button onClick={handleApproveHoro} className="btn-gold px-6 py-2">Pubblica</button>
              </div>
           </div>
        </div>
      )}

      {editingChart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90">
           <div className="w-full max-w-4xl bg-[#0a0a10] border border-gold-500/40 rounded-3xl p-8 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-serif text-2xl text-white">Laboratorio Analisi</h3>
                 <button onClick={handleRegenerateAdvancedSummary} disabled={isRegenerating} className="text-[10px] bg-indigo-500/20 px-3 py-1 rounded text-indigo-200">✦ Rigenera</button>
              </div>
              <textarea value={editingChartText} onChange={e => setEditingChartText(e.target.value)} className="flex-1 bg-black/40 border border-gold-500/20 rounded-2xl p-6 text-sm text-white outline-none resize-none mb-6" />
              <div className="flex justify-end gap-3">
                 <button onClick={() => setEditingChart(null)} className="text-white/40 px-4">Annulla</button>
                 <button onClick={handleApproveChart} className="btn-gold px-8 py-3">✨ Pubblica</button>
              </div>
           </div>
        </div>
      )}
    </StaffLayout>
  )
}
