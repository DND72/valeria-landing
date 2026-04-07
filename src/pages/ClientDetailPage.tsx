import { useAuth, useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { useAstrologyApi } from '../api/astrology'
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
  username: string | null
  displayName: string | null
  ageVerified: boolean
  ageVerifiedAt: string | null
  declaredBirthday: string | null
  birthTime: string | null
  birthCity: string | null
  firstName: string | null
  lastName: string | null
  taxId: string | null
  profile: {
    generalNotes: string | null
    lastInvoicedAt: string | null
    manualBonusCredits: number
    unlockReviewOverride: boolean
    updatedAt: string | null
  } | null
  consults: ConsultDetail[]
  wallet: {
    balance: number
    lockedBalance: number
  } | null
  latestChart: {
    id: string
    interpretation: string | null
  } | null
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
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const searchParams = new URLSearchParams(search)
  const clerkIdParam = searchParams.get('clerkId')

  const email = emailParam && emailParam !== 'detail' ? decodeURIComponent(emailParam) : ''
  const clerkId = clerkIdParam || ''

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
  const [savingAnagrafica, setSavingAnagrafica] = useState(false)
  const [savingInvoiced, setSavingInvoiced] = useState(false)
  const [postingNoteFor, setPostingNoteFor] = useState<string | null>(null)

  const { generateSummary } = useAstrologyApi()
  const [genLoading, setGenLoading] = useState(false)
  const [genSintesi, setGenSintesi] = useState<string | null>(null)

  // Campi anagrafici editabili
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthCity, setBirthCity] = useState('')
  const [taxId, setTaxId] = useState('')

  const load = useCallback(async () => {
    if (!apiConfigured || (!email && !clerkId)) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (email) q.set('email', email)
      if (clerkId) q.set('clerkId', clerkId)
      
      const d = await apiJson<DetailPayload>(getToken, `/api/staff/clients/detail?${q.toString()}`)
      setData(d)
      setGeneralNotes(d.profile?.generalNotes ?? '')
      setFirstName(d.firstName ?? '')
      setLastName(d.lastName ?? '')
      setBirthday(d.declaredBirthday ?? '')
      setBirthTime(d.birthTime ?? '')
      setBirthCity(d.birthCity ?? '')
      setTaxId(d.taxId ?? '')
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

  const saveAnagrafica = async () => {
    if (!apiConfigured || !email) return
    setSavingAnagrafica(true)
    try {
      await apiJson(getToken, '/api/staff/clients/profile', {
        method: 'PATCH',
        body: JSON.stringify({ 
          email, 
          firstName: firstName.trim() || null, 
          lastName: lastName.trim() || null, 
          declaredBirthday: birthday || null,
          birthTime: birthTime || null,
          birthCity: birthCity || null,
          taxId: taxId.trim() || null 
        }),
      })
      await load()
    } catch {
      // ignore
    } finally {
      setSavingAnagrafica(false)
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

  const grantBonus = async () => {
    if (!apiConfigured || !email) return
    const amountStr = window.prompt("Quanti crediti vuoi regalare a questo cliente senza farli pagare? (Esibizione promozionale)")
    if (!amountStr) return
    const amount = parseInt(amountStr, 10)
    if (isNaN(amount) || amount <= 0) {
      alert("Importo non valido. Inserire un numero intero maggiore di zero.")
      return
    }
    if (!window.confirm(`Stai per regalare ${amount} CR a ${data?.displayName || email}. Confermi?`)) return
    try {
      await apiJson(getToken, '/api/staff/clients/bonus', {
        method: 'POST',
        body: JSON.stringify({ email, amount }),
      })
      alert(`Bonus di ${amount} CR erogato con successo nel portafoglio di ${data?.displayName || email}!`)
      await load()
    } catch (e: any) {
      alert("Errore nell'erogazione del bonus: " + (e.message || "Riprovare."))
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
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
            {data?.displayName || 'Cliente'}
            {data?.username && (
              <span className="text-gold-500/50 text-lg font-sans font-normal">@{data.username}</span>
            )}
          </h1>
          <div className="flex flex-wrap gap-2 items-center mb-6">
            <p className="text-white/45 text-sm break-all">{email || data?.email || 'Login via Username'}</p>
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
            <section className="mystical-card border-gold-600/10">
              <h2 className="font-serif text-lg text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span> Anagrafica &amp; Dati Legali
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <label className="block">
                  <span className="text-white/45 text-[10px] uppercase tracking-wider block mb-1">Nome</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nome dichiarato..."
                    className="w-full bg-dark-600/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-600/40 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-white/45 text-[10px] uppercase tracking-wider block mb-1">Cognome</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Cognome dichiarato..."
                    className="w-full bg-dark-600/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-600/40 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-white/45 text-[10px] uppercase tracking-wider block mb-1">Data di Nascita</span>
                  <input
                    type="date"
                    value={birthday}
                    readOnly
                    className="w-full bg-dark-600/30 border border-white/5 rounded-lg px-3 py-2 text-sm text-white/50 cursor-not-allowed outline-none [color-scheme:dark]"
                  />
                  <p className="text-[9px] text-white/20 mt-1 italic">Dato prelevato da Clerk/Registrazione (Immutabile)</p>
                </label>
                <label className="block">
                  <span className="text-white/45 text-[10px] uppercase tracking-wider block mb-1">Ora di Nascita</span>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-dark-600/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-600/40 outline-none [color-scheme:dark]"
                  />
                </label>
                <label className="block">
                  <span className="text-white/45 text-[10px] uppercase tracking-wider block mb-1">Città di Nascita</span>
                  <input
                    type="text"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    placeholder="Luogo di nascita..."
                    className="w-full bg-dark-600/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-600/40 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-white/45 text-[10px] uppercase tracking-wider block mb-1">Codice Fiscale</span>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="Inserisci CF..."
                    className="w-full bg-dark-600/50 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-gold-200/80 focus:border-gold-600/40 outline-none uppercase"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => void saveAnagrafica()}
                disabled={savingAnagrafica || !apiConfigured}
                className="btn-gold text-xs px-5 py-2.5"
              >
                {savingAnagrafica ? 'Salvataggio…' : 'Aggiorna Anagrafica'}
              </button>
            </section>

            <section className="mystical-card bg-gold-600/5 border-gold-600/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="font-serif text-lg text-gold-400 flex items-center gap-2">
                  <span className="text-xl">💳</span> Portafoglio Virtuale (Wallet)
                </h2>
                {data.wallet ? (
                  <button onClick={grantBonus} className="btn-gold text-xs px-3 py-1.5 whitespace-nowrap">
                    🎁 Regala Bonus
                  </button>
                ) : null}
              </div>

              {data.wallet ? (
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-white/45 text-xs uppercase tracking-wider mb-1">Crediti Disponibili</p>
                    <p className="text-2xl font-bold text-gold-400">{data.wallet.balance} <span className="text-sm font-normal text-gold-500/70">CR</span></p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <p className="text-white/45 text-xs uppercase tracking-wider mb-1">Crediti Impegnati</p>
                    <p className="text-xl font-medium text-amber-500/80">{data.wallet.lockedBalance} <span className="text-sm font-normal text-amber-600/50">CR</span></p>
                  </div>
                </div>
              ) : (
                <p className="text-white/40 text-sm">Questo cliente non ha ancora attivato un Wallet o non è registrato sulla piattaforma.</p>
              )}
            </section>

            {data.latestChart && (
              <section className="mystical-card border-indigo-500/20 bg-indigo-500/5">
                <h2 className="font-serif text-lg text-indigo-300 mb-4 flex items-center gap-2">
                  <span className="text-xl">✨</span> Identità Astrale & Sintesi di Valeria
                </h2>
                
                <div className="mb-6 p-4 bg-black/40 border border-white/5 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">ID Tema Natale</p>
                  <p className="text-sm font-mono text-indigo-200">{data.latestChart.id}</p>
                </div>

                <div className="space-y-4">
                  {(genSintesi || data.latestChart.interpretation) ? (
                    <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-sm bg-black/30 p-6 rounded-2xl border border-white/5">
                      <ReactMarkdown>{genSintesi || data.latestChart.interpretation || ""}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs italic mb-4">Nessuna sintesi generata per questo tema.</p>
                  )}

                  <button
                    onClick={async () => {
                      if (!data.latestChart) return
                      setGenLoading(true)
                      try {
                        const res = await generateSummary(data.latestChart.id)
                        setGenSintesi(res.interpretation)
                      } catch (e: any) {
                        alert("Errore generazione: " + e.message)
                      } finally {
                        setGenLoading(false)
                      }
                    }}
                    disabled={genLoading}
                    className="btn-gold text-xs px-6 py-2.5 flex items-center gap-2"
                  >
                    {genLoading ? "Generazione..." : (data.latestChart.interpretation ? "✦ Rigenera Sintesi di Valeria" : "✦ Genera Sintesi di Valeria")}
                  </button>
                  <p className="text-[10px] text-white/30 italic">L'IA analizzerà la configurazione astrale completa di questo cliente.</p>
                </div>
              </section>
            )}

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
