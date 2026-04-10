import { useUser, useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { apiJson } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import ClientLayout from '../components/dashboard/ClientLayout'

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

  const [selectedConsult, setSelectedConsult] = useState<ConsultRow | null>(null)
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

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

  useEffect(() => { void load() }, [load])

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

  if (isLoaded && !user) return <Navigate to="/accedi" replace />

  return (
    <ClientLayout title="I miei Consulti" subtitle="Cronologia Astrale">
      <div className="space-y-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-white/40 text-sm mb-10">
            Storico completo delle tue sessioni con Valeria.
          </p>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="h-6 w-6 rounded-full border-2 border-gold-500/20 border-t-gold-500 animate-spin" />
              <p className="text-white/30 text-xs uppercase tracking-widest">Caricamento sessioni...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* No backend */}
          {!loading && !error && !apiOk && (
            <div className="mystical-card text-center py-10">
              <p className="text-white/40 text-sm">Connetti il backend per visualizzare i tuoi consulti.</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && apiOk && consults?.length === 0 && (
            <div className="mystical-card text-center py-20">
              <p className="text-5xl mb-4">🔮</p>
              <p className="text-white/60 font-serif text-xl mb-2">Nessun consulto ancora</p>
              <p className="text-white/30 text-sm mb-8">Il tuo percorso inizia con il primo passo.</p>
              <Link to="/area-personale" className="btn-gold text-sm px-6 py-2.5">
                Prenota il primo consulto →
              </Link>
            </div>
          )}

          {/* List */}
          {!loading && !error && consults && consults.length > 0 && (
            <div className="space-y-3">
              {consults.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedConsult(c)}
                  className="mystical-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/8 cursor-pointer group hover:border-gold-500/30 transition-all hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl group-hover:scale-110 transition-transform">
                      {c.is_free_consult ? '🎁' : '🃏'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm group-hover:text-gold-400 transition-colors">
                        {c.is_free_consult ? 'Consulto Omaggio' : (c.consult_kind || 'Consulto')}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">{formatWhen(c.start_at)}</p>
                      {c.cost_credits != null && !c.is_free_consult && (
                        <p className="text-amber-400/70 text-[10px] mt-0.5 font-mono">
                          {c.cost_credits} CR
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest border px-2.5 py-1 rounded-full ${STATUS_COLOR[c.status] ?? 'text-white/40 border-white/10 bg-white/5'}`}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                    {c.meeting_join_url && (c.status === 'scheduled' || c.status === 'client_waiting' || c.status === 'in_progress') && (
                      <a
                        href={c.meeting_join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase font-bold tracking-widest bg-gold-500/10 border border-gold-500/30 text-gold-400 px-3 py-1.5 rounded-lg hover:bg-gold-500/20 transition-colors whitespace-nowrap"
                      >
                        Entra →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Modal Dettagli */}
          {selectedConsult && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm shadow-2xl overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mystical-card w-full max-w-2xl p-0 overflow-hidden border border-white/10"
              >
                {/* Header Modal */}
                <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
                   <div>
                      <h3 className="font-serif text-xl text-gold-400">Dettaglio Consulto</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{selectedConsult.id}</p>
                   </div>
                   <button 
                     onClick={() => setSelectedConsult(null)}
                     className="text-white/40 hover:text-white transition-colors"
                   >
                     <span className="text-2xl">✕</span>
                   </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Dati Evento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">📅</div>
                          <div>
                             <p className="text-[10px] text-white/30 uppercase font-black">Data e Orario</p>
                             <p className="text-sm text-white/90">{formatWhen(selectedConsult.start_at)}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">⏳</div>
                          <div>
                             <p className="text-[10px] text-white/30 uppercase font-black">Fine Sessione</p>
                             <p className="text-sm text-white/90">{formatWhen(selectedConsult.end_at)}</p>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">💰</div>
                          <div>
                             <p className="text-[10px] text-white/30 uppercase font-black">Investimento</p>
                             <p className="text-sm text-white/90">{selectedConsult.cost_credits || 0} Crediti</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">✨</div>
                          <div>
                             <p className="text-[10px] text-white/30 uppercase font-black">Stato</p>
                             <p className={`text-sm font-bold uppercase ${STATUS_COLOR[selectedConsult.status] || ''}`}>
                                {STATUS_LABEL[selectedConsult.status] ?? selectedConsult.status}
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="border-t border-white/5 pt-8">
                     <h4 className="font-serif text-lg text-white mb-6 flex items-center gap-2">
                        <span>Il tuo Feedback</span>
                        <span className="text-xs font-sans text-white/20 uppercase tracking-tighter">(Facoltativo)</span>
                     </h4>

                     {reviewLoading ? (
                        <div className="py-10 text-center animate-pulse text-white/20 text-xs">Caricamento stato recensione...</div>
                     ) : eligibility?.specificReview ? (
                        <div className="bg-gold-500/5 border border-gold-500/20 rounded-2xl p-6">
                           <div className="flex items-center gap-2 mb-3">
                              {[1,2,3,4,5].map(s => (
                                 <span key={s} className={s <= eligibility.specificReview.rating ? "text-gold-500" : "text-white/10"}>★</span>
                              ))}
                              <span className="text-[10px] uppercase font-bold text-emerald-500 ml-auto">Inviata</span>
                           </div>
                           <p className="text-white font-bold text-sm mb-1">{eligibility.specificReview.title || 'Recensione'}</p>
                           <p className="text-white/60 text-xs italic font-serif">"{eligibility.specificReview.body}"</p>
                        </div>
                     ) : eligibility?.canSubmitNew && (selectedConsult.status === 'done' || selectedConsult.status === 'completed') ? (
                        <div className="space-y-4">
                           <div>
                              <p className="text-[10px] text-white/40 uppercase font-bold mb-3">Valutazione</p>
                              <div className="flex gap-2">
                                 {[1,2,3,4,5].map(s => (
                                    <button 
                                      key={s} onClick={() => setRating(s)}
                                      className={`text-3xl transition-all ${s <= rating ? 'text-gold-500 scale-110' : 'text-white/10 hover:text-gold-600'}`}
                                    >
                                       ★
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <input 
                                type="text" value={title} onChange={e => setTitle(e.target.value)}
                                placeholder="Titolo (es. Incredibile precisione)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-gold-500/50 outline-none transition-all"
                              />
                              <textarea 
                                value={body} onChange={e => setBody(e.target.value)}
                                placeholder="Racconta la tua esperienza (min. 20 caratteri)..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white placeholder:text-white/20 focus:border-gold-500/50 outline-none transition-all h-32 resize-none"
                              />
                              <button 
                                onClick={handleSubmitReview}
                                disabled={submitting || body.length < 20}
                                className="w-full btn-gold py-4 rounded-xl text-xs uppercase font-black tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                 {submitting ? 'Invio in corso...' : 'Invia Feedback Brillante'}
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                           <p className="text-white/30 text-xs italic">
                              {eligibility?.reasonHint || "Il feedback può essere lasciato solo per i consulti completati dopo un percorso di almeno 3 sessioni."}
                           </p>
                        </div>
                     )}
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="bg-white/5 p-4 border-t border-white/10 text-center">
                   <p className="text-[9px] text-white/20 uppercase tracking-widest">Valeria Astrology Hub • Session Log</p>
                </div>
              </motion.div>
            </div>
          )}

          {/* CTA Prenota */}
          {!loading && consults && consults.length > 0 && (
            <div className="mt-8 text-center">
              <Link to="/area-personale" className="btn-gold text-sm px-6 py-2.5">
                + Prenota un nuovo consulto
              </Link>
            </div>
          )}

        </motion.div>
      </div>
    </ClientLayout>
  )
}
