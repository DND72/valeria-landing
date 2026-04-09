
import { useAuth, useUser } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../lib/api'
import {
  type ServiceKind,
} from '../lib/consultServiceLabel'

import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'
import StaffLayout from '../components/dashboard/StaffLayout'
import { useAstrologyApi } from '../api/astrology'
import ReactMarkdown from 'react-markdown'

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

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailConsult, setDetailConsult] = useState<ConsultRow | null>(null)
  const [notes, setNotes] = useState<NoteRow[]>([])

  const [noteDraft, setNoteDraft] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

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
  const [waitingConsult, setWaitingConsult] = useState<any | null>(null)
  
  const alertAudio = useRef<HTMLAudioElement | null>(null)

  const { approveHoroscope, approveChart, generateSummary, rejectAndRefund } = useAstrologyApi()

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

  const handleReject = async (id: string, type: 'chart' | 'synastry', amount: number) => {
    if (!confirm(`Vuoi davvero rifiutare questa richiesta e rimborsare ${amount} CR all'utente?`)) return
    try {
      await rejectAndRefund(id, type, amount)
      void loadPendingAnalyses()
      alert("Richiesta rifiutata e rimborsata.")
    } catch (err: any) {
      alert("Errore durante il rifiuto: " + err.message)
    }
  }

  const loadList = useCallback(async () => {
    if (!apiConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiJson<{ consults: ConsultRow[] }>(getToken, '/api/staff/consults')
      setList(data.consults ?? [])
    } catch (e) {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [getToken, apiConfigured])

  const loadDetail = useCallback(
    async (id: string) => {
      if (!apiConfigured) return
      try {
        const data = await apiJson<{ consult: ConsultRow; notes: NoteRow[] }>(getToken, `/api/staff/consults/${id}`)
        setDetailConsult(data.consult)
        setNotes(data.notes ?? [])
      } catch (e) {
        setDetailConsult(null)
        setNotes([])
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
    void loadPendingAnalyses()
    void loadList()
  }, [isLoaded, user, navigate, loadList, loadPendingAnalyses])

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
      console.error('Save note error', e)
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

  const handleApproveChart = async (type: 'chart' | 'synastry' = 'chart') => {
    if (!editingChart) return
    try {
      await approveChart(editingChart.id, type, editingChartText)
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
                   <div className="flex gap-2 mt-6">
                      <button onClick={() => { setEditingChart(item); setEditingChartText(item.interpretation || ""); }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-white/80">Revisiona</button>
                      <button onClick={() => handleReject(item.id, 'chart', 30)} className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs transition-all text-red-400">🗑️</button>
                   </div>
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
                   <div className="flex gap-2 mt-6">
                      <button onClick={() => { setEditingChart(item); setEditingChartText(item.interpretation || ""); }} className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-200">Revisiona</button>
                      <button onClick={() => handleReject(item.id, 'synastry', 50)} className="px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs transition-all text-red-400">🗑️</button>
                   </div>
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

        <div className="grid lg:grid-cols-5 gap-8">
           <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 mystical-card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                 <h2 className="font-semibold text-white text-sm">Consulti recenti</h2>
                 {loading && <span className="text-white/35 text-xs animate-pulse">Caricamento…</span>}
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
                    <div className="pt-6 border-t border-white/10">
                       <h4 className="text-white text-sm mb-4">Note</h4>
                       <div className="space-y-2 mb-4">
                          {notes.map(n => <div key={n.id} className="bg-white/5 p-2 rounded text-[11px] text-white/80">{n.body}</div>)}
                       </div>
                       <textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-4 text-sm text-white outline-none" rows={2} />
                       <button onClick={submitNote} disabled={noteSaving || !noteDraft} className="bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase mt-2">Salva Nota</button>
                    </div>
                 </div>
              ) : <p className="text-white/30 text-sm uppercase tracking-widest">Seleziona un consulto per i dettagli</p>}
           </motion.section>
        </div>
      </div>

      {editingHoro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90">
           <div className="w-full max-w-2xl bg-[#0a0a10] border border-indigo-500/40 rounded-3xl p-8">
              <h3 className="font-serif text-2xl text-white mb-6">Editor Mentore Silente</h3>
              <div className="prose prose-sm prose-invert max-h-64 overflow-y-auto mb-6 bg-white/5 p-4 rounded-xl">
                 <ReactMarkdown>{editingHoroText}</ReactMarkdown>
              </div>
              <textarea value={editingHoroText} onChange={e => setEditingHoroText(e.target.value)} className="w-full h-48 bg-black/40 border border-indigo-500/20 rounded-2xl p-4 text-sm text-white outline-none" placeholder="Scrivi il responso..." />
              <div className="flex justify-end gap-3 mt-6">
                 <button onClick={() => setEditingHoro(null)} className="text-white/40 px-4">Annulla</button>
                 <button onClick={handleApproveHoro} className="btn-gold px-6 py-2">Pubblica Responso</button>
              </div>
           </div>
        </div>
      )}

      {editingChart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90">
           <div className="w-full max-w-4xl bg-[#0a0a10] border border-gold-500/40 rounded-3xl p-8 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-serif text-2xl text-white">Laboratorio Analisi</h3>
                 <button onClick={handleRegenerateAdvancedSummary} disabled={isRegenerating} className="text-[10px] bg-indigo-500/20 px-3 py-1 rounded text-indigo-200 uppercase font-black tracking-widest">✦ Rigenera AI</button>
              </div>
              <div className="prose prose-sm prose-invert flex-1 overflow-y-auto mb-6 bg-white/5 p-6 rounded-2xl">
                 <ReactMarkdown>{editingChartText}</ReactMarkdown>
              </div>
              <textarea value={editingChartText} onChange={e => setEditingChartText(e.target.value)} className="h-48 bg-black/40 border border-gold-500/20 rounded-2xl p-6 text-sm text-white outline-none resize-none mb-6" />
              <div className="flex justify-end gap-3">
                 <button onClick={() => setEditingChart(null)} className="text-white/40 px-4">Annulla</button>
                 <button onClick={() => handleApproveChart(editingChart.person_b_data ? 'synastry' : 'chart')} className="bg-gold-500 text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs">✨ Pubblica Ora</button>
              </div>
           </div>
        </div>
      )}
    </StaffLayout>
  )
}
