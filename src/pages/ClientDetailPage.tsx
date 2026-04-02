import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import { getApiBaseUrl } from '../constants/api'

type Note = {
  id: string
  consult_id: string
  staff_clerk_user_id: string
  body: string
  created_at: string
  updated_at: string
}

type ConsultDetail = {
  id: string
  status: string
  is_free_consult: boolean
  start_at: string | null
  end_at: string | null
  invitee_name: string | null
  meeting_join_url: string | null
  notes: Note[]
}

type DetailPayload = {
  email: string
  displayName: string | null
  ageVerified: boolean
  ageVerifiedAt: string | null
  declaredBirthday: string | null
  profile: {
    generalNotes: string | null
    lastInvoicedAt: string | null
    manualBonusCredits: number
    unlockReviewOverride: boolean
    updatedAt: string | null
  } | null
  consults: ConsultDetail[]
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function ClientDetailPage() {
  const { email: emailParam } = useParams()
  const email = emailParam ? decodeURIComponent(emailParam) : ''
  const { isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const apiConfigured = Boolean(getApiBaseUrl())

  const [data, setData] = useState<DetailPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [generalNotes, setGeneralNotes] = useState('')
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingInvoiced, setSavingInvoiced] = useState(false)
  const [postingNoteFor, setPostingNoteFor] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!apiConfigured || !email) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const q = new URLSearchParams({ email })
      const d = await apiJson<DetailPayload>(getToken, `/api/staff/clients/detail?${q.toString()}`)
      setData(d)
      setGeneralNotes(d.profile?.generalNotes ?? '')
    } catch (e) {
      setError(e instanceof ApiError ? String(e.message) : 'Errore caricamento')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [getToken, apiConfigured, email])

  useEffect(() => {
    if (!isLoaded) return
    if (!user || !isPrivilegedClerkUser(user)) {
      navigate('/dashboard', { replace: true })
      return
    }
    void load()
  }, [isLoaded, user, navigate, load])

  const saveGeneralNotes = async () => {
    if (!apiConfigured || !email) return
    setSavingProfile(true)
    try {
      await apiJson(getToken, '/api/staff/clients/profile', {
        method: 'PATCH',
        body: JSON.stringify({ email, generalNotes }),
      })
      await load()
    } catch {
      // ignore
    } finally {
      setSavingProfile(false)
    }
  }

  const markInvoicedNow = async () => {
    if (!apiConfigured || !email) return
    setSavingInvoiced(true)
    try {
      await apiJson(getToken, '/api/staff/clients/profile', {
        method: 'PATCH',
        body: JSON.stringify({ email, markInvoicedNow: true }),
      })
      await load()
    } catch {
      // ignore
    } finally {
      setSavingInvoiced(false)
    }
  }

  const addConsultNote = async (consultId: string) => {
    const body = (notesDraft[consultId] ?? '').trim()
    if (!body || !apiConfigured) return
    setPostingNoteFor(consultId)
    try {
      await apiJson(getToken, `/api/staff/consults/${consultId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      })
      setNotesDraft((prev) => ({ ...prev, [consultId]: '' }))
      await load()
    } catch {
      // ignore
    } finally {
      setPostingNoteFor(null)
    }
  }

  if (!isLoaded || !user) return null
  if (!isPrivilegedClerkUser(user)) return null

  const prof = data?.profile
  const invoicedMonth =
    prof?.lastInvoicedAt &&
    new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date(prof.lastInvoicedAt)).slice(0, 7) ===
      new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date()).slice(0, 7)

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,160,23,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/gestione-clienti" className="text-sm text-gold-500/90 hover:underline">
            ← Elenco clienti
          </Link>
          <Link to="/dashboard" className="text-sm text-white/40 hover:text-white/60">
            Il tuo Diario
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1">
            {data?.displayName || 'Cliente'}
          </h1>
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <p className="text-white/45 text-sm break-all">{email}</p>
            {data?.ageVerified ? (
              <span className="text-[10px] bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-600/30">
                VM18 Verificato
              </span>
            ) : data?.declaredBirthday ? (
              <span className="text-[10px] bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded border border-amber-600/30">
                VM18 Dichiarato ({data.declaredBirthday})
              </span>
            ) : (
              <span className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded border border-white/10">
                Età non dichiarata
              </span>
            )}
          </div>
        </motion.div>

        {!apiConfigured && (
          <div className="mystical-card border border-amber-600/30 text-amber-200/90 text-sm mb-6">
            Backend non collegato.
          </div>
        )}

        {error && (
          <p className="text-red-400/90 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        {loading && <p className="text-white/45 text-sm">Caricamento…</p>}

        {!loading && data && (
          <div className="space-y-8">
            <section className="mystical-card">
              <h2 className="font-serif text-lg text-white mb-3">Situazione &amp; fatturazione</h2>
              <p className="text-white/40 text-xs mb-3">
                Fatturazione: segnala manualmente quando hai emesso fattura per il periodo corrente. Il promemoria
                &quot;mese&quot; usa il calendario Italia (Europe/Rome).
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                <span className="text-white/50">Stato mese corrente:</span>
                {invoicedMonth ? (
                  <span className="text-emerald-400/90">Fatturato (data registrata)</span>
                ) : prof?.lastInvoicedAt ? (
                  <span className="text-white/55">Ultima registrazione: {formatWhen(prof.lastInvoicedAt)}</span>
                ) : (
                  <span className="text-amber-400/85">Mai indicato</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => void markInvoicedNow()}
                disabled={savingInvoiced || !apiConfigured}
                className="btn-outline text-sm px-4 py-2 mb-4"
              >
                {savingInvoiced ? 'Salvataggio…' : 'Segna fatturato oggi'}
              </button>
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Note su questa cliente (CRM)</span>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  rows={6}
                  className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25"
                  placeholder="Preferenze, pagamenti, cosa ha chiesto, follow-up…"
                />
              </label>
              <button
                type="button"
                onClick={() => void saveGeneralNotes()}
                disabled={savingProfile || !apiConfigured}
                className="btn-gold text-sm px-4 py-2 mt-2"
              >
                {savingProfile ? 'Salvataggio…' : 'Salva note'}
              </button>
            </section>

            <section>
              <h2 className="font-serif text-lg text-white mb-4">Storico consulti</h2>
              {data.consults.length > 0 ? (
                <ul className="space-y-6">
                  {data.consults.map((c) => (
                    <li key={c.id} className="mystical-card border border-white/10">
                      <div className="flex flex-wrap gap-2 justify-between items-start mb-2">
                        <div>
                          <p className="text-white/90 text-sm font-medium">{formatWhen(c.start_at)}</p>
                          <p className="text-white/35 text-xs uppercase">
                            {c.status} · {c.is_free_consult ? 'omaggio' : 'pagamento'}
                          </p>
                        </div>
                        {c.meeting_join_url && (
                          <a
                            href={c.meeting_join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-500/90 text-xs hover:underline"
                          >
                            Link riunione
                          </a>
                        )}
                      </div>
                      {c.notes.length > 0 && (
                        <ul className="space-y-2 mb-3 border-l-2 border-gold-600/30 pl-3">
                          {c.notes.map((n) => (
                            <li key={n.id} className="text-sm text-white/70">
                              <p className="whitespace-pre-wrap">{n.body}</p>
                              <p className="text-white/30 text-[10px] mt-1">{formatWhen(n.created_at)}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                      <textarea
                        value={notesDraft[c.id] ?? ''}
                        onChange={(e) => setNotesDraft((p) => ({ ...p, [c.id]: e.target.value }))}
                        placeholder="Aggiungi nota su questo consulto…"
                        rows={2}
                        className="w-full bg-dark-400/80 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => void addConsultNote(c.id)}
                        disabled={postingNoteFor === c.id || !(notesDraft[c.id] ?? '').trim()}
                        className="btn-outline text-xs px-3 py-1"
                      >
                        {postingNoteFor === c.id ? 'Invio…' : 'Aggiungi nota'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mystical-card border border-white/5 py-10 text-center">
                  <p className="text-white/30 text-sm">Nessun consulto registrato per questo indirizzo email.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
