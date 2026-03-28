import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'
import StarsRating from './StarsRating'

export default function StaffExternalReviewImport() {
  const { getToken } = useAuth()
  const api = Boolean(getApiBaseUrl())
  const [authorDisplayName, setAuthorDisplayName] = useState('')
  const [platform, setPlatform] = useState('Kang')
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async () => {
    if (!api) return
    setMsg(null)
    setSubmitting(true)
    try {
      await apiJson(getToken, '/api/staff/reviews/external', {
        method: 'POST',
        body: JSON.stringify({
          authorDisplayName: authorDisplayName.trim() || 'Cliente',
          platform: platform.trim() || 'Altra piattaforma',
          rating,
          body: body.trim(),
        }),
      })
      setMsg(
        'Recensione salvata in moderazione. Quando sei pronta, aprila in Gestione recensioni e pubblicala: così compare in «Dicono di me».'
      )
      setBody('')
      setAuthorDisplayName('')
    } catch (e) {
      setMsg(e instanceof ApiError ? String(e.message) : 'Errore')
    } finally {
      setSubmitting(false)
    }
  }

  if (!api) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="mystical-card border border-gold-600/20"
    >
      <h2 className="font-serif text-xl font-bold text-white mb-1">Importa recensione da altra piattaforma</h2>
      <p className="text-white/40 text-sm mb-4">
        Kang, Profetum, Wengo, ecc. Resta in coda finché non la pubblichi da{' '}
        <Link to="/gestione-recensioni" className="text-gold-500/90 hover:underline">
          Gestione recensioni
        </Link>
        . Poi comparirà in «Dicono di me» con il badge &quot;Altra piattaforma&quot; e conterà nella media pubblica.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-white/45 text-xs block mb-1">Piattaforma</span>
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
            placeholder="es. Kang, Profetum"
            maxLength={80}
          />
        </label>
        <label className="block">
          <span className="text-white/45 text-xs block mb-1">Nome mostrato (es. Laura M.)</span>
          <input
            value={authorDisplayName}
            onChange={(e) => setAuthorDisplayName(e.target.value)}
            className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
            maxLength={80}
          />
        </label>
      </div>
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
              {n}
            </button>
          ))}
        </div>
        <StarsRating value={rating} className="mt-2" size="sm" />
      </div>
      <label className="block mb-3">
        <span className="text-white/45 text-xs block mb-1">Testo della recensione (min. 20 caratteri)</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
        />
      </label>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={submitting || body.trim().length < 20}
        className="btn-gold text-sm px-5 py-2"
      >
        {submitting ? 'Salvataggio…' : 'Invia in moderazione'}
      </button>
      {msg && (
        <p
          className={`text-sm mt-3 ${msg.startsWith('Recensione') ? 'text-emerald-400/90' : 'text-red-400/90'}`}
        >
          {msg}
        </p>
      )}
    </motion.section>
  )
}
