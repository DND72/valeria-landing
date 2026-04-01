import { useAuth } from '@clerk/clerk-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { apiJson, ApiError } from '../lib/api'
import { getApiBaseUrl } from '../constants/api'

type ConsultRow = {
  id: string
  status: string
  is_free_consult: boolean
  start_at: string | null
  end_at: string | null
  created_at: string
  notes: { id: string; body: string; created_at: string }[]
}

type ClientProfile = {
  generalNotes: string | null
  lastInvoicedAt: string | null
  manualBonusCredits: number
  unlockReviewOverride: boolean
  updatedAt: string | null
}

type ClientDetail = {
  email: string
  displayName: string | null
  profile: ClientProfile | null
  consults: ConsultRow[]
}

export type { ClientDetail }

type Props = {
  email: string | null
  onClose: () => void
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function StaffCrmDrawer({ email, onClose }: Props) {
  const { getToken } = useAuth()
  const api = Boolean(getApiBaseUrl())
  const drawerRef = useRef<HTMLDivElement>(null)

  const [detail, setDetail] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Campi modificabili
  const [notes, setNotes] = useState('')
  const [unlockReview, setUnlockReview] = useState(false)
  const [bonusCredits, setBonusCredits] = useState(0)

  // Nota per singolo consulto
  const [noteConsultId, setNoteConsultId] = useState<string | null>(null)
  const [noteBody, setNoteBody] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteMsg, setNoteMsg] = useState<string | null>(null)

  const loadDetail = useCallback(async () => {
    if (!api || !email) return
    setLoading(true)
    setSaveMsg(null)
    try {
      const r = await apiJson<ClientDetail>(getToken, `/api/staff/clients/detail?email=${encodeURIComponent(email)}`)
      setDetail(r)
      setNotes(r.profile?.generalNotes ?? '')
      setUnlockReview(r.profile?.unlockReviewOverride ?? false)
      setBonusCredits(r.profile?.manualBonusCredits ?? 0)
    } catch {
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [getToken, api, email])

  useEffect(() => {
    if (email) void loadDetail()
    else setDetail(null)
  }, [email, loadDetail])

  // Chiudi con ESC
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  async function handleSaveProfile() {
    if (!email || !api) return
    setSaving(true)
    setSaveMsg(null)
    try {
      await apiJson(getToken, '/api/staff/clients/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          email,
          generalNotes: notes,
          unlockReviewOverride: unlockReview,
          manualBonusCredits: bonusCredits,
        }),
      })
      setSaveMsg('Profilo aggiornato.')
      await loadDetail()
    } catch (e) {
      setSaveMsg(e instanceof ApiError ? String(e.message) : 'Errore salvataggio')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddNote(consultId: string) {
    if (!api || !noteBody.trim()) return
    setNoteSaving(true)
    setNoteMsg(null)
    try {
      await apiJson(getToken, `/api/staff/consults/${consultId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body: noteBody.trim() }),
      })
      setNoteBody('')
      setNoteConsultId(null)
      setNoteMsg('Nota aggiunta.')
      await loadDetail()
    } catch (e) {
      setNoteMsg(e instanceof ApiError ? String(e.message) : 'Errore nota')
    } finally {
      setNoteSaving(false)
    }
  }

  if (!email) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl flex flex-col bg-[#0d1b2a] border-l border-white/10 shadow-2xl overflow-y-auto"
        role="dialog"
        aria-label={`Scheda cliente ${email}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0d1b2a] z-10">
          <div>
            <p className="text-gold-500 text-xs uppercase tracking-widest">Scheda cliente</p>
            <h2 className="font-serif text-lg font-bold text-white">
              {detail?.displayName ?? email}
            </h2>
            {detail?.displayName && (
              <p className="text-white/40 text-xs">{email}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors p-2 rounded-lg"
            aria-label="Chiudi"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
          </div>
        )}

        {!loading && !detail && (
          <div className="p-6">
            <p className="text-white/50 text-sm">Nessun dato disponibile per questo cliente.</p>
          </div>
        )}

        {!loading && detail && (
          <div className="flex-1 p-6 space-y-8">
            {/* === CRM Switches === */}
            <section>
              <h3 className="font-serif text-base font-semibold text-white mb-4">Azioni rapide</h3>
              <div className="space-y-3">
                {/* Toggle recensione sbloccata */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Sblocca recensione anticipata</p>
                    <p className="text-white/35 text-xs">Il cliente potrà scrivere la recensione anche con meno di 3 consulti.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={unlockReview}
                    onClick={() => setUnlockReview(!unlockReview)}
                    className={`relative shrink-0 h-6 w-11 rounded-full transition-colors ${unlockReview ? 'bg-emerald-500' : 'bg-white/15'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${unlockReview ? 'translate-x-5' : ''}`}
                    />
                  </button>
                </div>

                {/* Crediti bonus */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Crediti consulto bonus</p>
                    <p className="text-white/35 text-xs">N° di consulti regalo da attribuire manualmente.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBonusCredits(Math.max(0, bonusCredits - 1))}
                      className="h-7 w-7 rounded border border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center text-sm"
                    >−</button>
                    <span className="text-white font-mono text-sm w-6 text-center">{bonusCredits}</span>
                    <button
                      type="button"
                      onClick={() => setBonusCredits(bonusCredits + 1)}
                      className="h-7 w-7 rounded border border-white/20 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center text-sm"
                    >+</button>
                  </div>
                </div>
              </div>
            </section>

            {/* === Note generali cliente === */}
            <section>
              <h3 className="font-serif text-base font-semibold text-white mb-3">Note private (solo tu le vedi)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Es. Preferisce consulti online. Teme i cambiamenti di lavoro. Carta ricorrente: La Torre."
                className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-gold-500/50"
              />
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveProfile}
                  className="btn-gold text-sm px-5 py-2"
                >
                  {saving ? 'Salvataggio…' : 'Salva tutto'}
                </button>
                {saveMsg && (
                  <p className={`text-xs ${saveMsg.includes('Errore') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            </section>

            {/* === Storico Consulti === */}
            <section>
              <h3 className="font-serif text-base font-semibold text-white mb-3">
                Storico consulti
                <span className="ml-2 text-xs text-white/30 font-sans font-normal">({detail.consults.length})</span>
              </h3>
              {detail.consults.length === 0 && (
                <p className="text-white/40 text-sm">Nessun consulto registrato.</p>
              )}
              <div className="space-y-4">
                {detail.consults.map((c) => (
                  <div key={c.id} className="border border-white/8 rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-gold-500/80 text-xs font-mono">{formatWhen(c.start_at)}</p>
                        <p className="text-white/80 text-sm font-medium">
                          {c.is_free_consult ? '🎁 Omaggio' : '✅ Pagato'}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/10 text-white/40 shrink-0">
                        {c.status}
                      </span>
                    </div>

                    {/* Note su questo consulto */}
                    {c.notes.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        {c.notes.map((n) => (
                          <p key={n.id} className="text-white/55 text-xs italic border-l border-gold-600/20 pl-2">
                            {n.body}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Aggiungi nota */}
                    {noteConsultId === c.id ? (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <textarea
                          value={noteBody}
                          onChange={(e) => setNoteBody(e.target.value)}
                          rows={3}
                          placeholder="La nota è privata e non sarà visibile alla cliente…"
                          className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-xs text-white resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            disabled={noteSaving || !noteBody.trim()}
                            onClick={() => void handleAddNote(c.id)}
                            className="btn-gold text-xs px-3 py-1.5"
                          >
                            {noteSaving ? 'Salvo…' : 'Aggiungi nota'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setNoteConsultId(null); setNoteBody('') }}
                            className="text-white/40 text-xs hover:text-white/70"
                          >
                            Annulla
                          </button>
                        </div>
                        {noteMsg && <p className="text-xs text-emerald-400 mt-1">{noteMsg}</p>}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setNoteConsultId(c.id); setNoteMsg(null) }}
                        className="mt-3 text-xs text-white/30 hover:text-gold-400 transition-colors"
                      >
                        + Aggiungi nota privata
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  )
}
