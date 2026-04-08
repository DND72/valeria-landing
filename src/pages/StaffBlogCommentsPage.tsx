import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'
import StaffLayout from '../components/dashboard/StaffLayout'

type CommentRow = {
  id: string
  articleSlug: string
  clerkUserId: string
  authorDisplayName: string
  body: string
  status: string
  publishedAt: string | null
  createdAt: string
}

export default function StaffBlogCommentsPage() {
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const apiConfigured = Boolean(getApiBaseUrl())

  const [list, setList] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!apiConfigured) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await apiJson<{ comments: CommentRow[] }>(getToken, '/api/staff/blog-comments')
      setList(data.comments ?? [])
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

  const patch = async (id: string, status: 'pending' | 'published' | 'hidden') => {
    setSavingId(id)
    try {
      await apiJson(getToken, `/api/staff/blog-comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await load()
    } catch { /* ignore */ } finally {
      setSavingId(null)
    }
  }

  if (!isLoaded || !user) return null
  if (!isPrivilegedClerkUser(user)) return null

  return (
    <StaffLayout title="Commenti Blog" subtitle="Dialogo con la community e moderazione">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
           <p className="text-white/45 text-sm max-w-2xl font-serif italic">
            "Le riflessioni delle lettrici sono semi per nuove scoperte."
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

        {loading && <p className="text-white/45 text-sm italic">Ascoltando le voci nel blog...</p>}

        {!loading && (
          <ul className="space-y-4">
            {list.map((c) => (
              <li key={c.id} className="mystical-card border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-white font-bold text-sm">{c.authorDisplayName}</p>
                    <p className="text-white/30 text-[10px] mt-1 uppercase tracking-widest font-bold">
                      Articolo:{' '}
                      <Link
                        to={`/blog/${c.articleSlug}`}
                        className="text-gold-500/80 hover:text-gold-400 transition-colors underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.articleSlug}
                      </Link>
                    </p>
                    <span
                      className={`inline-block mt-3 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded ${
                        c.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : c.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                            : 'bg-white/5 text-white/30 border border-white/10'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {c.status !== 'published' && (
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        className="btn-gold text-[10px] uppercase font-bold tracking-widest px-3 py-1.5"
                        onClick={() => void patch(c.id, 'published')}
                      >
                        Pubblica
                      </button>
                    )}
                    {c.status !== 'pending' && (
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        className="btn-outline text-[10px] uppercase font-bold tracking-widest px-3 py-1.5"
                        onClick={() => void patch(c.id, 'pending')}
                      >
                        Modera
                      </button>
                    )}
                    {c.status !== 'hidden' && (
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        className="text-[10px] uppercase font-bold text-white/30 hover:text-white/60 px-2"
                        onClick={() => void patch(c.id, 'hidden')}
                      >
                        Nascondi
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-white/70 text-sm mt-3 whitespace-pre-wrap border-t border-white/5 pt-4 italic leading-relaxed">
                  &ldquo;{c.body}&rdquo;
                </p>
                <p className="text-white/20 text-[10px] mt-3 font-mono">
                  {new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(
                    new Date(c.createdAt)
                  )}
                </p>
              </li>
            ))}
            {list.length === 0 && (
              <li className="text-white/20 text-sm text-center py-20 italic">Nessun commento all'orizzonte.</li>
            )}
          </ul>
        )}
      </div>
    </StaffLayout>
  )
}
