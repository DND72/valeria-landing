import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { apiJson, ApiError } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import StarsRating from './StarsRating'

type ReviewItem = {
  id: string
  status: string
  rating: number
  body: string
  authorDisplayName: string
  createdAt: string
  staffResponse: string | null
  staffRespondedAt: string | null
}

type Eligibility = {
  paidConsultsCompleted: number
  maxReviewsAllowed: number
  clientReviewsPublished: number
  hasPendingReview: boolean
  canSubmitNew: boolean
  canEditPending: boolean
  reasonHint: string | null
  pendingReview: ReviewItem | null
  publishedReviews: ReviewItem[]
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
      if (r.pendingReview) {
        setRating(r.pendingReview.rating)
        setBody(r.pendingReview.body)
        setAuthorDisplayName(r.pendingReview.authorDisplayName)
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

  const submit = async (method: 'POST' | 'PATCH', reviewId?: string) => {
    if (!api) return
    setMessage(null)
    setSubmitting(true)
    try {
      const payload = {
        rating,
        body: body.trim(),
        authorDisplayName: authorDisplayName.trim() || 'Cliente',
      }
      if (method === 'PATCH' && reviewId) {
        await apiJson(getToken, `/api/me/reviews/${reviewId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        setMessage('Bozza aggiornata. Valeria la pubblicherà dopo la moderazione.')
      } else {
        await apiJson(getToken, '/api/me/reviews', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setMessage('Recensione inviata. Valeria la pubblicherà dopo averla letta. Grazie!')
      }
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
  if (!data) {
    return (
      <div className="mystical-card border border-white/10">
        <p className="text-white/40 text-sm">Impossibile caricare le regole recensioni.</p>
      </div>
    )
  }

  const { paidConsultsCompleted, maxReviewsAllowed, canSubmitNew, canEditPending, pendingReview, publishedReviews, reasonHint } =
    data

  if (paidConsultsCompleted < 3) {
    return (
      <div id="recensione-sito" className="mystical-card border border-white/10">
        <h3 className="font-serif text-lg text-white mb-2">Recensione sul sito</h3>
        <p className="text-white/45 text-sm mb-2">
          La prima recensione si sblocca dopo il <strong className="text-white/70">terzo consulto a pagamento</strong>{' '}
          completato nel sistema. Ci teniamo molto: questo ci permette di avere un'opinione basata su un percorso vero e condiviso, e non solo su una singola chiamata a caldo.
        </p>
        <p className="text-white/35 text-xs">
          Consulti a pagamento completati finora: <strong>{paidConsultsCompleted}</strong> / 3
        </p>
      </div>
    )
  }

  return (
    <div id="recensione-sito" className="space-y-6">
      {reasonHint && (
        <p className="text-white/40 text-sm border-l border-gold-600/30 pl-3">{reasonHint}</p>
      )}

      {publishedReviews.length > 0 && (
        <div className="mystical-card border border-white/10">
          <h4 className="text-white/80 text-sm font-medium mb-3">Le tue recensioni pubblicate sul sito</h4>
          <ul className="space-y-4">
            {publishedReviews.map((rev) => (
              <li key={rev.id} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <StarsRating value={rev.rating} size="sm" />
                  <span className="text-white/50 text-xs">{rev.authorDisplayName}</span>
                </div>
                <p className="text-white/65 text-sm italic whitespace-pre-wrap">&ldquo;{rev.body}&rdquo;</p>
                {rev.staffResponse && (
                  <p className="text-white/45 text-xs mt-2 pl-2 border-l border-gold-600/30">
                    <span className="text-gold-500/80">Valeria: </span>
                    {rev.staffResponse}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pendingReview && (
        <div className="mystical-card border border-amber-600/30">
          <h3 className="font-serif text-lg text-white mb-2">Recensione in moderazione</h3>
          <p className="text-white/45 text-sm mb-3">
            Puoi modificare il testo finché non è pubblicata. Regola: al massimo una nuova recensione ogni due consulti
            completati dopo il terzo.
          </p>
          <label className="block mb-3">
            <span className="text-white/45 text-xs block mb-1">Firma</span>
            <input
              value={authorDisplayName}
              onChange={(e) => setAuthorDisplayName(e.target.value)}
              className="w-full max-w-sm bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
              maxLength={80}
            />
          </label>
          <div className="mb-3 flex flex-wrap gap-2">
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
          <StarsRating value={rating} className="mb-3" size="md" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white mb-3"
            minLength={20}
          />
          <button
            type="button"
            onClick={() => void submit('PATCH', pendingReview.id)}
            disabled={submitting || body.trim().length < 20}
            className="btn-gold text-sm px-5 py-2"
          >
            {submitting ? 'Salvataggio…' : 'Aggiorna bozza'}
          </button>
        </div>
      )}

      {canSubmitNew && !pendingReview && (
        <div className="mystical-card border border-gold-600/20">
          <h3 className="font-serif text-lg text-white mb-1">Nuova recensione sul sito</h3>
          <p className="text-white/40 text-sm mb-2">
            Consulti a pagamento completati: <strong className="text-white/60">{paidConsultsCompleted}</strong>. Puoi
            avere al massimo <strong className="text-white/60">{maxReviewsAllowed}</strong> recensione/i con questo
            percorso (prima dopo il 3°, poi una ogni 2 consulti).
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
          <div className="mb-3 flex flex-wrap gap-2">
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
          <StarsRating value={rating} className="mb-3" size="md" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Minimo 20 caratteri."
            rows={5}
            className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white mb-3"
            minLength={20}
          />
          <button
            type="button"
            onClick={() => void submit('POST')}
            disabled={submitting || body.trim().length < 20}
            className="btn-gold text-sm px-5 py-2"
          >
            {submitting ? 'Invio…' : 'Invia recensione'}
          </button>
        </div>
      )}

      {!canSubmitNew && !canEditPending && !pendingReview && publishedReviews.length > 0 && (
        <p className="text-white/35 text-sm">
          Hai già pubblicato tutte le recensioni consentite dal tuo percorso attuale. Potrai aggiungerne altre dopo
          nuovi consulti completati.
        </p>
      )}

      {message && (
        <p
          className={`text-sm ${message.includes('Errore') || message.includes('403') || message.includes('409') ? 'text-red-400/90' : 'text-emerald-400/90'}`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
