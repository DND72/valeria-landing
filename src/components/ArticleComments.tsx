import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'

type PublicComment = {
  id: string
  authorDisplayName: string
  body: string
  publishedAt: string | null
  createdAt: string
}

type MineComment = {
  id: string
  articleSlug: string
  status: string
  authorDisplayName: string
  body: string
  publishedAt: string | null
  createdAt: string
}

export default function ArticleComments({ articleSlug }: { articleSlug: string }) {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const api = Boolean(getApiBaseUrl())

  const [publicComments, setPublicComments] = useState<PublicComment[]>([])
  const [publicLoading, setPublicLoading] = useState(true)
  const [mine, setMine] = useState<MineComment[]>([])
  const [body, setBody] = useState('')
  const [authorDisplayName, setAuthorDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [legalChecked, setLegalChecked] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadPublic = useCallback(async () => {
    if (!api) {
      setPublicLoading(false)
      return
    }
    setPublicLoading(true)
    try {
      const base = getApiBaseUrl()!.replace(/\/$/, '')
      const res = await fetch(`${base}/api/public/blog/${encodeURIComponent(articleSlug)}/comments`)
      if (!res.ok) throw new Error('fail')
      const data = (await res.json()) as { comments: PublicComment[] }
      setPublicComments(data.comments ?? [])
    } catch {
      setPublicComments([])
    } finally {
      setPublicLoading(false)
    }
  }, [api, articleSlug])

  const loadMine = useCallback(async () => {
    if (!api || !user) {
      setMine([])
      return
    }
    try {
      const data = await apiJson<{ comments: MineComment[] }>(
        getToken,
        `/api/me/blog/comments/mine?articleSlug=${encodeURIComponent(articleSlug)}`
      )
      setMine(data.comments ?? [])
      const pendingRow = (data.comments ?? []).find((c) => c.status === 'pending')
      if (pendingRow) {
        setEditingId(pendingRow.id)
        setBody(pendingRow.body)
        setAuthorDisplayName(pendingRow.authorDisplayName)
      } else {
        setEditingId(null)
        setBody('')
        const fn = user.firstName?.trim()
        setAuthorDisplayName(fn ?? '')
      }
    } catch {
      setMine([])
    }
  }, [api, user, getToken, articleSlug])

  useEffect(() => {
    void loadPublic()
  }, [loadPublic])

  useEffect(() => {
    if (!isLoaded || !user) return
    void loadMine()
  }, [isLoaded, user, loadMine])

  const submit = async () => {
    if (!api || !user) return
    setMessage(null)
    setSubmitting(true)
    try {
      if (editingId) {
        await apiJson(getToken, `/api/me/blog/comments/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            body: body.trim(),
            authorDisplayName: authorDisplayName.trim() || 'Lettore',
          }),
        })
        setMessage('Commento aggiornato. Resta in moderazione fino all’approvazione.')
      } else {
        await apiJson(getToken, '/api/me/blog/comments', {
          method: 'POST',
          body: JSON.stringify({
            articleSlug,
            body: body.trim(),
            authorDisplayName: authorDisplayName.trim() || 'Lettore',
          }),
        })
        setMessage('Grazie! Il commento è in moderazione e comparirà qui dopo l’approvazione.')
        setBody('')
      }
      await loadPublic()
      await loadMine()
    } catch (e) {
      setMessage(e instanceof ApiError ? String(e.message) : 'Errore invio')
    } finally {
      setSubmitting(false)
    }
  }

  const pending = mine.find((c) => c.status === 'pending')

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="mt-16 pt-12 border-t border-white/10"
    >
      <h2 className="font-serif text-2xl font-bold text-white mb-2">Commenti</h2>
      <p className="text-white/40 text-sm mb-6 max-w-xl">
        I commenti sono riservati agli utenti registrati. Restano in moderazione: niente critiche ai consulti o
        contenuti fuori tema rispetto all&apos;articolo.
      </p>

      {!api && (
        <p className="text-white/35 text-sm mb-6">Collega il backend per attivare i commenti.</p>
      )}

      {api && publicLoading && <p className="text-white/35 text-sm mb-4">Caricamento commenti…</p>}

      {api && !publicLoading && publicComments.length > 0 && (
        <ul className="space-y-4 mb-10">
          {publicComments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <span className="font-medium text-gold-400/95">{c.authorDisplayName}</span>
                <span className="text-white/25 text-xs">
                  {c.publishedAt
                    ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(new Date(c.publishedAt))
                    : ''}
                </span>
              </div>
              <p className="text-white/65 leading-relaxed whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {api && !publicLoading && publicComments.length === 0 && !pending && (
        <p className="text-white/30 text-sm mb-8">Ancora nessun commento pubblicato sotto questo articolo.</p>
      )}

      {!isLoaded && <p className="text-white/35 text-sm">Caricamento…</p>}

      {isLoaded && !user && api && (
        <div className="rounded-lg border border-gold-600/20 bg-gold-600/5 px-5 py-4">
          <p className="text-white/55 text-sm mb-3">
            Per commentare devi avere un account (anche solo per partecipare al blog).
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/accedi" className="btn-gold text-sm px-4 py-2">
              Accedi
            </Link>
            <Link to="/registrati" className="btn-outline text-sm px-4 py-2">
              Registrati
            </Link>
          </div>
        </div>
      )}

      {isLoaded && user && api && (
        <div className="mystical-card border border-white/10">
          {pending && (
            <p className="text-amber-200/80 text-sm mb-4 border-l border-amber-500/40 pl-3">
              Hai un commento in moderazione. Puoi modificarlo qui finché non viene approvato.
            </p>
          )}
          <label className="block mb-3">
            <span className="text-white/45 text-xs block mb-1">Nome mostrato</span>
            <input
              value={authorDisplayName}
              onChange={(e) => setAuthorDisplayName(e.target.value)}
              className="w-full max-w-sm bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
              maxLength={80}
              placeholder="es. Maria"
            />
          </label>
          <label className="block mb-3">
            <span className="text-white/45 text-xs block mb-1">Il tuo commento (min. 10 caratteri)</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Riflessioni sul tema dell’articolo…"
            />
          </label>
          <label className="flex items-start gap-2 mb-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={legalChecked}
              onChange={(e) => setLegalChecked(e.target.checked)}
              className="mt-1 accent-gold-500"
            />
            <span className="text-white/40 text-[11px] leading-snug group-hover:text-white/60 transition-colors">
              Accetto i <Link to="/termini" className="text-gold-500/70 hover:underline">Termini di Servizio</Link> e confermo di aver letto la <Link to="/privacy" className="text-gold-500/70 hover:underline">Privacy Policy</Link>. Dichiaro di essere maggiorenne.
            </span>
          </label>
          <button
            type="button"
            disabled={submitting || body.trim().length < 10 || !legalChecked}
            onClick={() => void submit()}
            className="btn-gold text-sm px-5 py-2"
          >
            {submitting ? 'Invio…' : pending ? 'Aggiorna commento' : 'Invia in moderazione'}
          </button>
          {message && (
            <p
              className={`text-sm mt-3 ${
                message.includes('Errore') || message.includes('già') ? 'text-red-400/90' : 'text-emerald-400/90'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </motion.section>
  )
}
