import { useUser, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { apiJson } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import ClientLayout from '../components/dashboard/ClientLayout'
import TransactionHistory from '../components/dashboard/TransactionHistory'
import { useMeApi } from '../api/me'

type ConsultRow = {
  id: string
  status: string
  status_billing: string
  is_free_consult: boolean
  meeting_join_url: string | null
  start_at: string | null
  end_at: string | null
  created_at: string
  cost_credits?: number
  consult_kind?: string
}

type Eligibility = {
  canSubmitNew: boolean
  reasonHint: string | null
  specificReview: any | null
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Prenotato',
  completed: 'Completato',
  cancelled: 'Annullato',
  no_show: 'Non presentato',
  pending: 'In attesa',
}

const STATUS_COLOR: Record<string, string> = {
  scheduled: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  completed: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  cancelled: 'text-red-400 border-red-500/20 bg-red-500/10',
  no_show: 'text-orange-400 border-orange-500/20 bg-orange-500/10',
  pending: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
  } catch { return iso }
}

export default function MyConsultsPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const apiOk = Boolean(getApiBaseUrl())

  const [consults, setConsults] = useState<ConsultRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [wallet, setWallet] = useState<{ balanceAvailable: number; balanceLocked: number } | null>(null)
  const [transactions, setTransactions] = useState<any[] | null>(null)
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  const meApi = useMeApi()

  const [selectedConsult, setSelectedConsult] = useState<ConsultRow | null>(null)
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())

  // Form stato recensione
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!isLoaded || !user) return
    if (!apiOk) { setLoading(false); return }
    setLoading(true)
    try {
      const r = await apiJson<{ consults: ConsultRow[] }>(getToken, '/api/me/consults')
      setConsults(r.consults ?? [])
    } catch {
      setError('Impossibile caricare lo storico. Riprova tra qualche istante.')
    } finally {
      setLoading(false)
    }
  }, [isLoaded, user, getToken, apiOk])

  const loadWallet = useCallback(async () => {
    if (!user) return
    try {
      const data = await apiJson<{ balanceAvailable: number; balanceLocked: number }>(getToken, '/api/wallet/me')
      setWallet(data)
    } catch { /* ignore */ }
  }, [user, getToken])

  const loadTransactions = useCallback(async () => {
    if (!user) return
    setTransactionsLoading(true)
    try {
      const res = await meApi.getWalletTransactions()
      setTransactions(res.transactions)
    } catch { setTransactions([]) } finally { setTransactionsLoading(false) }
  }, [user, meApi])

  useEffect(() => { 
    void load()
    void loadWallet()
    void loadTransactions()
  }, [load, loadWallet, loadTransactions])

  const loadEligibility = useCallback(async (cid: string) => {
    setReviewLoading(true)
    try {
      const res = await apiJson<Eligibility>(getToken, `/api/me/reviews/eligibility?consultId=${cid}`)
      setEligibility(res)
      if (res.specificReview) {
        setRating(res.specificReview.rating)
        setTitle(res.specificReview.title || '')
        setBody(res.specificReview.body || '')
      } else {
        setRating(5)
        setTitle('')
        setBody('')
      }
    } catch (e) {
      console.error('[eligibility load]', e)
    } finally {
      setReviewLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (selectedConsult) {
      loadEligibility(selectedConsult.id)
    }
  }, [selectedConsult, loadEligibility])

  const handleSubmitReview = async () => {
    if (!selectedConsult) return
    if (body.length < 20) {
      alert("La motivazione deve essere di almeno 20 caratteri.")
      return
    }
    setSubmitting(true)
    try {
      await apiJson(getToken, '/api/me/reviews', {
        method: 'POST',
        body: JSON.stringify({
          rating,
          title,
          body,
          authorDisplayName: user?.firstName || 'Cliente Valeria',
          consultId: selectedConsult.id
        })
      })
      alert("Recensione inviata con successo! Sarà visibile dopo la moderazione.")
      loadEligibility(selectedConsult.id)
    } catch (e: any) {
      alert(e.message || "Errore durante l'invio della recensione.")
    } finally {
      setSubmitting(false)
    }
  }

  // CALENDAR HELPERS
  const startMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const endMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const daysInMonth: Date[] = []
  for (let i = 1; i <= endMonth.getDate(); i++) {
    daysInMonth.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i))
  }
  const prevMonthPadding = startMonth.getDay() // 0 = Sun
  const paddingDays = []
  for (let i = 0; i < prevMonthPadding; i++) {
    paddingDays.push(null)
  }

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate()

  const hasConsultOn = (d: Date) => 
    consults?.some(c => c.start_at && isSameDay(new Date(c.start_at), d))

  const consultsOnSelected = consults?.filter(c => 
    selectedDay && c.start_at && isSameDay(new Date(c.start_at), selectedDay)
  ).sort((a,b) => new Date(a.start_at!).getTime() - new Date(b.start_at!).getTime())

  if (isLoaded && !user) return <Navigate to="/accedi" replace />

  return (
    <ClientLayout title="I miei Consulti" subtitle="Cronologia Astrale">
      <div className="space-y-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
               <p className="text-white/40 text-sm">Esplora il tuo percorso evolutivo giorno per giorno.</p>
            </div>
            {wallet && (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-medium mb-0.5">Disponibile</p>
                  <p className="text-sm font-bold text-emerald-400 leading-none">{wallet.balanceAvailable} <span className="text-[10px] font-normal uppercase opacity-70">CR</span></p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-medium mb-0.5">Impegnato</p>
                  <p className="text-sm font-bold text-amber-400 leading-none">{wallet.balanceLocked} <span className="text-[10px] font-normal uppercase opacity-70">CR</span></p>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
             {/* ── Calendario Astrale ── */}
             <div className="lg:col-span-2">
                <div className="mystical-card p-6 border border-white/10 bg-white/[0.02]">
                   <div className="flex items-center justify-between mb-8">
                      <button 
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                        className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                      >
                         ←
                      </button>
                      <h3 className="font-serif text-lg text-gold-400 capitalize">
                         {viewDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button 
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                        className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
                      >
                         →
                      </button>
                   </div>

                   <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(d => (
                         <div key={d} className="text-center text-[10px] uppercase font-black tracking-widest text-white/20 py-2">
                            {d}
                         </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-7 gap-2">
                       {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}
                       {daysInMonth.map(d => {
                          const active = hasConsultOn(d)
                          const isSelected = selectedDay && isSameDay(d, selectedDay)
                          const isToday = isSameDay(d, new Date())
                          return (
                             <button
                                key={d.toISOString()}
                                onClick={() => setSelectedDay(d)}
                                className={`
                                  aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all group
                                  ${isSelected ? 'bg-gold-500 text-black shadow-[0_0_20px_rgba(212,160,23,0.3)] scale-105 z-10' : 'hover:bg-white/5 text-white/60'}
                                  ${active && !isSelected ? 'border border-gold-500/30' : ''}
                                `}
                             >
                                <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-gold-400 underline underline-offset-4' : ''}`}>
                                   {d.getDate()}
                                </span>
                                {active && !isSelected && (
                                   <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-gold-500 shadow-[0_0_5px_rgba(212,160,23,1)]" />
                                )}
                             </button>
                          )
                       })}
                   </div>
                </div>
             </div>

             {/* ── Elenco Giorno Selezionato ── */}
             <div>
                <div className="sticky top-28 space-y-6">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h4 className="text-xs uppercase font-black tracking-[0.2em] text-white/40">
                         {selectedDay?.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }) || 'Seleziona un giorno'}
                      </h4>
                      {consultsOnSelected && consultsOnSelected.length > 0 && (
                         <span className="text-[10px] bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full border border-gold-500/20 font-bold">
                            {consultsOnSelected.length} Eventi
                         </span>
                      )}
                   </div>

                   {loading ? (
                      <div className="py-12 text-center animate-pulse text-white/20 text-xs uppercase tracking-widest">Sincronizzazione...</div>
                   ) : consultsOnSelected && consultsOnSelected.length > 0 ? (
                      <div className="space-y-4">
                         {consultsOnSelected.map(c => (
                            <motion.div 
                               key={c.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                               onClick={() => setSelectedConsult(c)}
                               className="mystical-card p-4 border border-white/5 bg-white/[0.01] hover:border-gold-500/30 cursor-pointer transition-all hover:bg-white/[0.03] group"
                            >
                               <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-mono text-gold-500/60 leading-none">
                                     {new Date(c.start_at!).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded border ${STATUS_COLOR[c.status] || ''}`}>
                                     {STATUS_LABEL[c.status] || c.status}
                                  </span>
                               </div>
                               <p className="text-xs text-white group-hover:text-gold-400 transition-colors font-bold mb-1">
                                  {c.is_free_consult ? 'Consulto Omaggio' : (c.consult_kind || 'Consulto')}
                               </p>
                               {c.cost_credits && !c.is_free_consult && (
                                  <p className="text-[9px] text-white/30">{c.cost_credits} Crediti Consumati</p>
                               )}
                            </motion.div>
                         ))}
                      </div>
                   ) : (
                      <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                         <span className="text-3xl mb-4 block opacity-20">🕯️</span>
                         <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest leading-loose">
                            Nessun consulto<br/>per questa data
                         </p>
                      </div>
                   )}

                   {/* CTA Prenota */}
                   <div className="pt-6">
                      <Link to="/area-personale" className="w-full btn-gold text-[10px] py-4 rounded-2xl block text-center">
                         + PRENOTA CONSULTO
                      </Link>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-20">
             <TransactionHistory transactions={transactions} loading={transactionsLoading} />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 text-red-400 text-sm text-center my-6">
              {error}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Dettagli (Rimane invariato ma più elegante) */}
      {selectedConsult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl shadow-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mystical-card w-full max-w-2xl p-0 overflow-hidden border border-white/10"
          >
            {/* Header Modal */}
            <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
               <div>
                  <h3 className="font-serif text-xl text-gold-400">Archivio Astrale</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Session ID: {selectedConsult.id.slice(-8).toUpperCase()}</p>
               </div>
               <button 
                 onClick={() => setSelectedConsult(null)}
                 className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
               >
                 ✕
               </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Dati Evento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">📅</div>
                      <div>
                         <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-0.5">Data e Orario</p>
                         <p className="text-sm font-bold text-white/90">{formatWhen(selectedConsult.start_at)}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">⏳</div>
                      <div>
                         <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-0.5">Fine Sessione</p>
                         <p className="text-sm font-bold text-white/90">{selectedConsult.end_at ? formatWhen(selectedConsult.end_at) : 'In corso'}</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">💰</div>
                      <div>
                         <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-0.5">Investimento</p>
                         <p className="text-sm font-bold text-white/90">{selectedConsult.cost_credits || 0} Crediti</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">✨</div>
                      <div>
                         <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-0.5">Stato</p>
                         <p className={`text-sm font-black uppercase ${STATUS_COLOR[selectedConsult.status] || ''}`}>
                            {STATUS_LABEL[selectedConsult.status] ?? selectedConsult.status}
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="border-t border-white/5 pt-10">
                 <h4 className="font-serif text-lg text-white mb-6 flex items-center gap-4">
                    <span>Recensione della Sessione</span>
                    <div className="h-px flex-1 bg-white/5" />
                 </h4>

                 {reviewLoading ? (
                    <div className="py-10 text-center animate-pulse text-white/20 text-[10px] uppercase font-black tracking-widest">Consultazione Oracoli...</div>
                 ) : eligibility?.specificReview ? (
                    <div className="bg-gold-500/[0.03] border border-gold-500/20 rounded-3xl p-6 relative overflow-hidden group">
                       <div className="absolute -top-10 -right-10 text-9xl opacity-5 select-none transition-transform group-hover:scale-110">★</div>
                       <div className="flex items-center gap-1.5 mb-4">
                          {[1,2,3,4,5].map(s => (
                             <span key={s} className={`text-xs ${s <= eligibility.specificReview.rating ? "text-gold-500" : "text-white/10"}`}>★</span>
                          ))}
                          <span className="text-[9px] uppercase font-black text-emerald-500 ml-auto tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Pubblicata</span>
                       </div>
                       <p className="text-white font-serif text-lg mb-2">{eligibility.specificReview.title || 'Impressioni Astrali'}</p>
                       <p className="text-white/60 text-sm leading-relaxed italic">"{eligibility.specificReview.body}"</p>
                    </div>
                 ) : eligibility?.canSubmitNew && (selectedConsult.status === 'done' || selectedConsult.status === 'completed') ? (
                    <div className="space-y-6">
                       <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-4 text-center">La tua vibrazione</p>
                          <div className="flex justify-center gap-3">
                             {[1,2,3,4,5].map(s => (
                                <button 
                                  key={s} onClick={() => setRating(s)}
                                  className={`text-4xl transition-all duration-300 ${s <= rating ? 'text-gold-500 drop-shadow-[0_0_10px_rgba(212,160,23,0.5)] scale-110' : 'text-white/5 hover:text-white/20'}`}
                                >
                                   ★
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <input 
                            type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Sintesi dell'esperienza (es. Una luce nel buio)"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:border-gold-500/50 outline-none transition-all"
                          />
                          <textarea 
                            value={body} onChange={e => setBody(e.target.value)}
                            placeholder="Racconta la tua trasformazione (min. 20 caratteri)..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-5 text-sm text-white placeholder:text-white/20 focus:border-gold-500/50 outline-none transition-all h-40 resize-none"
                          />
                          <button 
                            onClick={handleSubmitReview}
                            disabled={submitting || body.length < 20}
                            className="w-full btn-gold py-5 rounded-2xl text-[11px] uppercase font-black tracking-[0.3em] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-gold-500/20 border-none"
                          >
                             {submitting ? 'INVIO IN CORSO...' : 'SUBBLIMA FEEDBACK'}
                          </button>
                       </div>
                    </div>
                 ) : (
                    <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-3xl p-10 text-center">
                       <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest italic mx-auto max-w-xs leading-relaxed">
                          {eligibility?.reasonHint || "Il feedback può essere lasciato solo per i consulti completati regolarmente."}
                       </p>
                    </div>
                 )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-white/5 p-4 border-t border-white/10 text-center">
               <p className="text-[8px] text-white/20 uppercase tracking-[0.5em] font-black">Valeria Synergy Hub • Akashic Records</p>
            </div>
          </motion.div>
        </div>
      )}
    </ClientLayout>
  )
}
