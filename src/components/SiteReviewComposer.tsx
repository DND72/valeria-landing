import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { apiJson, ApiError } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import StarsRating from './StarsRating'

type Eligibility = {
  eligible: boolean
  canEdit: boolean
  review: {
    id: string
    status: string
    rating: number
    body: string
    authorDisplayName: string
    createdAt: string
    staffResponse: string | null
    staffRespondedAt: string | null
  } | null
}

export default function SiteReviewComposer() {
  const { getToken } = useAuth()
  const api = Boolean(getApiBaseUrl())
  const [data, setData] = useState<Eligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [authorDisplayName, setAuthorDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!api) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const r = await apiJson<Eligibility>(getToken, '/api/me/reviews/eligibility')
      setData(r)
      if (r.review && (r.review.status === 'pending' || r.review.status === 'hidden')) {
        setRating(r.review.rating)
        setBody(r.review.body)
        setAuthorDisplayName(r.review.authorDisplayName)
      }
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [getToken, api])

  useEffect(() => {
    void load()
  }, [load])

  const submit = async () => {
    if (!api || !data?.canEdit) return
    setMessage(null)
    setSubmitting(true)
    try {
      await apiJson(getToken, '/api/me/reviews', {
        method: 'POST',
        body: JSON.stringify({
          rating,
          body: body.trim(),
          authorDisplayName: authorDisplayName.trim() || 'Cliente',
        }),
      })
      setMessage('Recensione inviata. Valeria la pubblicherà dopo averla letta. Grazie!')
      await load()
    } catch (e) {
      setMessage(e instanceof ApiError ? String(e.message) : 'Errore invio')
    } finally {
      setSubmitting(false)
    }
  }

  if (!api) return null
  if (loading) {
    return (
      <div className="mystical-card border border-white/10">
        <p className="text-white/40 text-sm">Caricamento…</p>
      </div>
    )
  }
  if (!data?.eligible) {
    return (
      <div id="recensione-sito" className="mystical-card border border-white/10">
        <h3 className="font-serif text-lg text-white mb-2">Recensione sul sito</h3>
        <p className="text-white/45 text-sm">
          Potrai lasciare una recensione qui quando avrai almeno un consulto a pagamento segnato come completato nel
          sistema.
        </p>
      </div>
    )
  }

  if (data.review?.status === 'published') {
    return (
      <div id="recensione-sito" className="mystical-card border border-emerald-600/25">
        <h3 className="font-serif text-lg text-white mb-2">La tua recensione sul sito</h3>
        <p className="text-emerald-400/90 text-sm mb-3">È stata pubblicata. Grazie per aver condiviso la tua esperienza.</p>
        <div className="flex items-center gap-2 mb-2">
          <StarsRating value={data.review.rating} size="sm" />
          <span className="text-white/50 text-xs">{data.review.authorDisplayName}</span>
        </div>
        <p className="text-white/70 text-sm italic whitespace-pre-wrap">&ldquo;{data.review.body}&rdquo;</p>
        {data.review.staffResponse && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-gold-500/90 text-xs font-medium mb-1">Valeria</p>
            <p className="text-white/65 text-sm whitespace-pre-wrap">{data.review.staffResponse}</p>
          </div>
        )}
      </div>
    )
  }

  if (data.review?.status === 'pending') {
    return (
      <div id="recensione-sito" className="mystical-card border border-amber-600/30">
        <h3 className="font-serif text-lg text-white mb-2">Recensione in moderazione</h3>
        <p className="text-white/45 text-sm mb-3">
          Abbiamo ricevuto il tuo testo. Sarà visibile sul sito dopo l&apos;approvazione.
        </p>
        <StarsRating value={data.review.rating} size="sm" />
        <p className="text-white/55 text-sm mt-2 italic line-clamp-4">&ldquo;{data.review.body}&rdquo;</p>
      </div>
    )
  }

  if (!data.canEdit) return null

  return (
    <div id="recensione-sito" className="mystical-card border border-gold-600/20">
      <h3 className="font-serif text-lg text-white mb-1">Lascia una recensione sul sito</h3>
      <p className="text-white/40 text-sm mb-4">
        Solo chi ha completato almeno un consulto a pagamento può recensire. La pubblicazione è moderata.
      </p>
      <label className="block mb-3">
        <span className="text-white/45 text-xs block mb-1">Come vuoi firmare (es. Laura M.)</span>
        <input
          value={authorDisplayName}
          onChange={(e) => setAuthorDisplayName(e.target.value)}
          className="w-full max-w-sm bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
          maxLength={80}
        />
      </label>
      <div className="mb-3">
        <span className="text-white/45 text-xs block mb-2">Voto</span>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-xs px-3 py-1.5 rounded-lg border ${
                rating === n ? 'border-gold-500/70 bg-gold-600/15 text-gold-200' : 'border-white/15 text-white/50'
              }`}
            >
              {n} stelle
            </button>
          ))}
        </div>
        <StarsRating value={rating} className="mt-2" size="md" />
      </div>
      <label className="block mb-3">
        <span className="text-white/45 text-xs block mb-1">Testo (min. 20 caratteri)</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
          minLength={20}
          maxLength={8000}
        />
      </label>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={submitting || body.trim().length < 20}
        className="btn-gold text-sm px-5 py-2"
      >
        {submitting ? 'Invio…' : data.review ? 'Aggiorna bozza' : 'Invia recensione'}
      </button>
      {message && (
        <p
          className={`text-sm mt-3 ${message.startsWith('Recensione') ? 'text-emerald-400/90' : 'text-red-400/90'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
