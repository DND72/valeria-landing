import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StarsRating from '../components/StarsRating'
import { apiJson, ApiError } from '../lib/api'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'

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
      navigate('/dashboard', { replace: true })
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
    } catch {
      // ignore
    } finally {
      setSavingId(null)
    }
  }

  if (!isLoaded || !user) return null
  if (!isPrivilegedClerkUser(user)) return null

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-1">Staff</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">Moderazione recensioni</h1>
          <p className="text-white/45 text-sm max-w-2xl">
            Pubblica sul sito, nascondi o rispondi. Le recensioni pubbliche compaiono nella home.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={() => void load()}
              className="btn-outline text-sm px-4 py-2"
              disabled={loading || !apiConfigured}
            >
              Aggiorna
            </button>
            <Link to="/dashboard" className="btn-gold text-sm px-4 py-2 text-center">
              Il mio spazio
            </Link>
          </div>
        </motion.div>

        {!apiConfigured && (
          <p className="text-amber-200/85 text-sm mb-6">Backend non collegato.</p>
        )}
        {error && (
          <p className="text-red-400/90 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        {loading && <p className="text-white/45 text-sm">Caricamento…</p>}

        {!loading && (
          <ul className="space-y-4">
            {list.map((r) => (
              <li key={r.id} className="mystical-card border border-white/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StarsRating value={r.rating} size="sm" />
                      <span className="text-white font-medium text-sm">{r.authorDisplayName}</span>
                      {r.source === 'external' && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-amber-500/35 text-amber-200/90 bg-amber-950/20">
                          {r.externalPlatform || 'Esterna'}
                        </span>
                      )}
                      {r.source === 'client' && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-white/15 text-white/45">
                          Cliente sito
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${
                        r.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : r.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-200'
                            : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-gold-500/90 hover:underline"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    {expanded === r.id ? 'Chiudi' : 'Apri / rispondi'}
                  </button>
                </div>
                <p className="text-white/65 text-sm mt-3 whitespace-pre-wrap italic">&ldquo;{r.body}&rdquo;</p>

                {expanded === r.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <textarea
                      value={responseDraft[r.id] ?? ''}
                      onChange={(e) => setResponseDraft((p) => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="Risposta pubblica di Valeria (opzionale)…"
                      rows={3}
                      className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingId === r.id}
                        className="btn-gold text-xs px-3 py-1.5"
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
                        className="btn-outline text-xs px-3 py-1.5"
                        onClick={() =>
                          void patch(r.id, {
                            staffResponse: (responseDraft[r.id] ?? '').trim() || null,
                          })
                        }
                      >
                        Salva solo risposta
                      </button>
                      <button
                        type="button"
                        disabled={savingId === r.id}
                        className="text-xs text-white/45 hover:text-white/70 px-2"
                        onClick={() => void patch(r.id, { status: 'hidden' })}
                      >
                        Nascondi
                      </button>
                    </div>
                  </div>
                )}

                {r.staffResponse && expanded !== r.id && (
                  <div className="mt-3 text-sm border-l-2 border-gold-600/40 pl-3">
                    <p className="text-gold-500/90 text-xs mb-1">Tua risposta</p>
                    <p className="text-white/70 whitespace-pre-wrap">{r.staffResponse}</p>
                  </div>
                )}
              </li>
            ))}
            {list.length === 0 && (
              <li className="text-white/40 text-sm text-center py-12">Nessuna recensione ancora.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
