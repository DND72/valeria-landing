import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'

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
      navigate('/dashboard', { replace: true })
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
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">Commenti al blog</h1>
          <p className="text-white/45 text-sm max-w-2xl">
            Approva i commenti degli articoli o nascondili. Solo i commenti pubblicati sono visibili in pagina.
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

        {!apiConfigured && <p className="text-amber-200/85 text-sm mb-6">Backend non collegato.</p>}
        {error && (
          <p className="text-red-400/90 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        {loading && <p className="text-white/45 text-sm">Caricamento…</p>}

        {!loading && (
          <ul className="space-y-4">
            {list.map((c) => (
              <li key={c.id} className="mystical-card border border-white/10">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">{c.authorDisplayName}</p>
                    <p className="text-white/35 text-xs mt-0.5">
                      Articolo:{' '}
                      <Link
                        to={`/blog/${c.articleSlug}`}
                        className="text-gold-500/85 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.articleSlug}
                      </Link>
                    </p>
                    <span
                      className={`inline-block mt-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${
                        c.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : c.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-200'
                            : 'bg-white/10 text-white/50'
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
                        className="btn-gold text-xs px-3 py-1.5"
                        onClick={() => void patch(c.id, 'published')}
                      >
                        Pubblica
                      </button>
                    )}
                    {c.status !== 'pending' && (
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        className="btn-outline text-xs px-3 py-1.5"
                        onClick={() => void patch(c.id, 'pending')}
                      >
                        Moderazione
                      </button>
                    )}
                    {c.status !== 'hidden' && (
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        className="text-xs text-white/45 hover:text-white/70 px-2"
                        onClick={() => void patch(c.id, 'hidden')}
                      >
                        Nascondi
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-white/65 text-sm mt-3 whitespace-pre-wrap border-t border-white/5 pt-3">{c.body}</p>
                <p className="text-white/25 text-xs mt-2">
                  {new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(
                    new Date(c.createdAt)
                  )}
                </p>
              </li>
            ))}
            {list.length === 0 && (
              <li className="text-white/40 text-sm text-center py-12">Nessun commento ancora.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
