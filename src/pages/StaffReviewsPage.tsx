import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StarsRating from '../components/StarsRating'
import { apiJson, ApiError } from '../lib/api'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'
import StaffLayout from '../components/dashboard/StaffLayout'

type ReviewRow = {
  id: string
  clerkUserId: string | null
  source: string
  authorDisplayName: string
  rating: number
  body: string
  status: string
  staffResponse: string | null
  staffRespondedAt: string | null
  publishedAt: string | null
  createdAt: string
  externalPlatform: string | null
}

export default function StaffReviewsPage() {
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const apiConfigured = Boolean(getApiBaseUrl())

  const [list, setList] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [responseDraft, setResponseDraft] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!apiConfigured) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await apiJson<{ reviews: ReviewRow[] }>(getToken, '/api/staff/reviews')
      setList(data.reviews ?? [])
      const drafts: Record<string, string> = {}
      for (const r of data.reviews ?? []) {
        drafts[r.id] = r.staffResponse ?? ''
      }
      setResponseDraft((prev) => ({ ...drafts, ...prev }))
    } catch (e) {
      setError(e instanceof ApiError ? String(e.message) : 'Errore')
      setList([])
    } finally {
      setLoading(false)
    }
  }, [getToken, apiConfigured])

  useEffect(() => {
    if (!isLoaded) return
    if (!user || !isPrivilegedClerkUser(user)) {
      navigate('/area-personale', { replace: true })
      return
    }
    void load()
  }, [isLoaded, user, navigate, load])

  const patch = async (id: string, body: { status?: string; staffResponse?: string | null }) => {
    setSavingId(id)
    try {
      await apiJson(getToken, `/api/staff/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      await load()
      setExpanded(null)
    } catch { /* ignore */ } finally {
      setSavingId(null)
    }
  }

  if (!isLoaded || !user) return null
  if (!isPrivilegedClerkUser(user)) return null

  return (
    <StaffLayout title="Recensioni" subtitle="Voce delle clienti e reputazione del portale">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <p className="text-white/45 text-sm max-w-2xl italic font-serif">
            "Ogni parola è un riflesso dell'esperienza che abbiamo donato."
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="btn-outline text-xs px-4 py-2"
            disabled={loading || !apiConfigured}
          >
            Sincronizza
          </button>
        </motion.div>

        {!apiConfigured && <p className="text-amber-200/85 text-xs mb-6">Backend non collegato.</p>}
        {error && <p className="text-red-400 text-xs mb-4" role="alert">{error}</p>}

        {loading && <p className="text-white/45 text-sm italic">Caricamento pensieri del mondo...</p>}

        {!loading && (
          <ul className="space-y-4">
            {list.map((r) => (
              <li key={r.id} className="mystical-card border border-white/5 hover:border-white/15 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StarsRating value={r.rating} size="sm" />
                      <span className="text-white font-bold text-sm">{r.authorDisplayName}</span>
                      {r.source === 'external' && (
                        <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded border border-gold-500/35 text-gold-500 bg-gold-950/20">
                          {r.externalPlatform || 'Esterna'}
                        </span>
                      )}
                      {r.source === 'client' && (
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-white/10 text-white/30">
                          Sito
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${
                        r.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : r.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                            : 'bg-white/5 text-white/30 border border-white/10'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-gold-500/90 hover:text-gold-400 font-bold"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    {expanded === r.id ? 'Chiudi' : 'Gestisci →'}
                  </button>
                </div>
                <p className="text-white/70 text-sm mt-4 whitespace-pre-wrap italic font-serif border-l border-gold-500/20 pl-4">
                  &ldquo;{r.body}&rdquo;
                </p>

                {expanded === r.id && (
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                    <textarea
                      value={responseDraft[r.id] ?? ''}
                      onChange={(e) => setResponseDraft((p) => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="La tua risposta sapiente (sarà pubblica)"
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500/40 outline-none transition-all resize-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingId === r.id}
                        className="btn-gold text-[10px] uppercase font-bold tracking-widest px-4 py-2"
                        onClick={() =>
                          void patch(r.id, {
                            status: 'published',
                            staffResponse: (responseDraft[r.id] ?? '').trim() || null,
                          })
                        }
                      >
                        Pubblica
                      </button>
                      <button
                        type="button"
                        disabled={savingId === r.id}
                        className="btn-outline text-[10px] uppercase font-bold tracking-widest px-4 py-2"
                        onClick={() =>
                          void patch(r.id, {
                            staffResponse: (responseDraft[r.id] ?? '').trim() || null,
                          })
                        }
                      >
                        Salva Solo Risposta
                      </button>
                      <button
                        type="button"
                        disabled={savingId === r.id}
                        className="text-[10px] uppercase font-bold tracking-widest text-white/30 hover:text-red-400 px-4 py-2 border border-transparent hover:border-red-500/20 transition-all ml-auto"
                        onClick={() => void patch(r.id, { status: 'hidden' })}
                      >
                        Nascondi
                      </button>
                    </div>
                  </div>
                )}

                {r.staffResponse && expanded !== r.id && (
                  <div className="mt-4 pt-4 text-sm border-t border-white/[0.03]">
                    <p className="text-gold-500/50 text-[10px] uppercase font-black tracking-[0.2em] mb-2">Tua Saggio Riscontro</p>
                    <p className="text-white/50 whitespace-pre-wrap italic text-xs leading-relaxed">{r.staffResponse}</p>
                  </div>
                )}
              </li>
            ))}
            {list.length === 0 && (
              <li className="text-white/20 text-sm text-center py-20 italic">Il silenzio è ancora d'oro.</li>
            )}
          </ul>
        )}
      </div>
    </StaffLayout>
  )
}
