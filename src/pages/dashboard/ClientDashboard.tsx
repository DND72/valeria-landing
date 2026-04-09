import { motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import LegalDeclarationModal from '../../components/LegalDeclarationModal'
import SiteReviewComposer from '../../components/SiteReviewComposer'
import BigFiveWidget from '../../components/BigFiveWidget'
import AstralRankCard from '../../components/dashboard/AstralRankCard'
import AstralBadge from '../../components/dashboard/AstralBadge'
import TransactionHistory from '../../components/dashboard/TransactionHistory'
import TaxInfoForm from '../../components/dashboard/TaxInfoForm'
import BookingFlow from '../../components/dashboard/BookingFlow'
import ClientLayout from '../../components/dashboard/ClientLayout'
import { useValeriaPresence } from '../../hooks/useValeriaPresence'
import { labelForPresence } from '../../lib/valeriaPresence'
import { getApiBaseUrl } from '../../constants/api'
import { apiJson } from '../../lib/api'
import { useAstrologyApi, type SavedNatalChart } from '../../api/astrology'
import { useMeApi } from '../../api/me'

function displayFirstName(user: {
  firstName: string | null | undefined
  emailAddresses?: { emailAddress: string | null | undefined }[] | null | undefined
}): string {
  const fn = user.firstName?.trim()
  if (fn) return fn
  const raw = user.emailAddresses?.[0]?.emailAddress
  if (typeof raw !== 'string' || raw.length === 0) return 'cara'
  const at = raw.indexOf('@')
  if (at <= 0) return 'cara'
  const local = raw.slice(0, at).trim()
  return local || 'cara'
}

export default function ClientDashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { syncNatalData, getMyCharts } = useAstrologyApi()
  const meApi = useMeApi()

  const [freeHidden, setFreeHidden] = useState(false)

  const [taxInfo, setTaxInfo] = useState<{
    showReminder: boolean
    donePaidConsults: number
    hasCodiceFiscale: boolean
  } | null>(null)

  const [ageStatus, setAgeStatus] = useState<{
    ageVerified: boolean
    hasLegalDeclaration: boolean
    hasUsedFree7: boolean
    hasUsedIntro10: boolean
  } | null>(null)
  const [ageStatusLoading, setAgeStatusLoading] = useState(true)

  type MyConsultRow = {
    id: string
    status: string
    is_free_consult: boolean
    meeting_join_url: string | null
    meeting_provider: string | null
    start_at: string | null
    end_at: string | null
    created_at: string
    cost_credits?: number
    reschedule_count?: number
  }
  const [myConsults, setMyConsults] = useState<MyConsultRow[] | null>(null)
  const [myConsultsLoading, setMyConsultsLoading] = useState(false)
  const [myCharts, setMyCharts] = useState<SavedNatalChart[] | null>(null)
  const [myChartsLoading, setMyChartsLoading] = useState(false)
  const [wallet, setWallet] = useState<{ balanceAvailable: number; balanceLocked: number } | null>(null)
  const [transactions, setTransactions] = useState<any[] | null>(null)
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  const [profileLoading, setProfileLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [userContactPref, setUserContactPref] = useState<'none' | 'phone' | 'meet' | 'zoom'>('none')
  const [userPhone, setUserPhone] = useState('')
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false)

  const { data: valeriaPresence } = useValeriaPresence(60_000)
  const presenceLabel = labelForPresence(valeriaPresence?.status)

  const [liveWindows, setLiveWindows] = useState<Array<{ start: string; end: string; label: string }> | null>(null)

  useEffect(() => {
    try { setFreeHidden(window.localStorage.getItem('freeConsultHidden') === '1') } catch { /* ignore */ }
  }, [])

  const loadMyConsults = useCallback(async () => {
    if (!user || !getApiBaseUrl()) return
    setMyConsultsLoading(true)
    try {
      const r = await apiJson<{ consults: MyConsultRow[] }>(getToken, '/api/me/consults')
      setMyConsults(r.consults ?? [])
    } catch { setMyConsults([]) } finally { setMyConsultsLoading(false) }
  }, [user, getToken])

  const loadWallet = useCallback(async () => {
    if (!user) return
    try {
      const data = await apiJson<{ balanceAvailable: number; balanceLocked: number }>(getToken, '/api/wallet/me')
      setWallet(data)
    } catch { /* ignore */ }
  }, [user, getToken])

  const loadMyCharts = useCallback(async () => {
    if (!user) return
    setMyChartsLoading(true)
    try { 
      const charts = await getMyCharts()
      setMyCharts(charts)
    } catch (err) { 
      console.error("[Dashboard Load]", err)
      setMyCharts([]) 
    } finally { 
      setMyChartsLoading(false) 
    }
  }, [user, getMyCharts])

  const loadTransactions = useCallback(async () => {
    if (!user) return
    setTransactionsLoading(true)
    try {
      const res = await meApi.getWalletTransactions()
      setTransactions(res.transactions)
    } catch { setTransactions([]) } finally { setTransactionsLoading(false) }
  }, [user, meApi])

  const loadProfile = useCallback(async () => {
    if (!user) return
    setProfileLoading(true)
    try {
      const p = await meApi.getProfile()
      setUserContactPref((p as any).contactPreference || 'none')
      setUserPhone(p.phoneNumber || '')
      if ((p as any).taxInfo) setTaxInfo((p as any).taxInfo)
    } catch { /* ignore */ } finally { setProfileLoading(false) }
  }, [user, meApi])

  const saveProfileSettings = async () => {
    setSavingProfile(true)
    setProfileSuccessMsg(false)
    try {
      await meApi.updateProfile({ contactPreference: userContactPref, phoneNumber: userPhone.trim() || null } as any)
      setProfileSuccessMsg(true)
      setTimeout(() => setProfileSuccessMsg(false), 3000)
    } catch (err) {
      alert('Errore durante il salvataggio: ' + (err instanceof Error ? err.message : String(err)))
    } finally { setSavingProfile(false) }
  }

  useEffect(() => {
    void loadMyConsults()
    void loadWallet()
    void loadMyCharts()
    void loadTransactions()
    void loadProfile()
  }, [loadMyConsults, loadWallet, loadMyCharts, loadTransactions, loadProfile])

  useEffect(() => {
    if (!user) return
    const pendingData = localStorage.getItem('valeria_pending_natal')
    if (pendingData) {
      try {
        syncNatalData(JSON.parse(pendingData))
          .then((res: any) => {
            localStorage.removeItem('valeria_pending_natal')
            if (res.autoCreated) void loadMyCharts()
          })
          .catch(() => localStorage.removeItem('valeria_pending_natal'))
      } catch { localStorage.removeItem('valeria_pending_natal') }
    }
  }, [user, syncNatalData])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await apiJson<{ ageVerified: boolean; hasLegalDeclaration: boolean; hasUsedFree7: boolean; hasUsedIntro10: boolean }>(getToken, '/api/me/age-status')
        if (!cancelled) setAgeStatus(r)
      } catch { /* ignore */ } finally { if (!cancelled) setAgeStatusLoading(false) }
    })()
    return () => { cancelled = true }
  }, [user, getToken])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const url = getApiBaseUrl() + '/api/booking/live-windows'
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.windows) setLiveWindows(data.windows)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [user])

  const handleConsultAction = async (id: string, action: 'cancel' | 'reschedule') => {
    try {
      await apiJson(getToken, `/api/me/consults/${id}/action`, { method: 'POST', body: JSON.stringify({ action }) })
      alert(action === 'cancel'
        ? 'Consulto disdetto con successo. I tuoi crediti sono stati rimborsati nel Wallet.'
        : 'Consulto disdetto. I tuoi crediti ti sono stati rimborsati nel Wallet. Ora seleziona la tua nuova data.')
      void loadMyConsults()
    } catch (e: any) { alert('Impossibile modificare il consulto: ' + (e.message || 'Errore sconosciuto')) }
  }

  if (!user) return null

  const firstName = displayFirstName(user)

  function formatConsultWhen(iso: string | null): string {
    if (!iso) return '—'
    try { return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) }
    catch { return iso }
  }

  return (
    <ClientLayout title="Il tuo Diario" subtitle="Evoluzione Astrale">
      <div className="space-y-12">
        {/* ── Annuncio Dono del Cosmo ── */}
        {transactions && transactions.length > 0 && (() => {
          const lastBonus = transactions.find(t => t.tx_type === 'bonus');
          if (!lastBonus) return null;
          
          const bonusId = lastBonus.id;
          const isDismissed = typeof window !== 'undefined' && localStorage.getItem(`bonus_seen_${bonusId}`);
          if (isDismissed) return null;

          const label = lastBonus.reference_id || '';
          let icon = "✨";
          let message = "Il Cosmo ti ha inviato un dono speciale nel tuo Diario.";
          let colorClass = "from-gold-500/20 to-amber-500/5 border-gold-500/30 text-gold-200";

          if (label.includes("Cometa")) {
            icon = "☄️";
            message = "La cometa è appena apparsa sul tuo cielo, ti porta un bonus di 30 crediti per il prossimo consulto.";
            colorClass = "from-indigo-500/20 to-blue-500/5 border-indigo-500/30 text-indigo-200";
          } else if (label.includes("Stella")) {
            icon = "⭐";
            message = "Una Stella brilla nel tuo Diario: il cosmo ti omaggia con 50 crediti per illuminare il tuo cammino.";
            colorClass = "from-gold-500/30 to-amber-600/10 border-gold-400/50 text-gold-100";
          } else if (label.includes("Costellazione")) {
            icon = "🌌";
            message = "Una Costellazione di opportunità: 100 crediti bonus accreditati per le tue mappe astrali.";
            colorClass = "from-purple-600/20 to-fuchsia-500/5 border-purple-500/40 text-purple-100";
          }

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative p-6 rounded-2xl border bg-gradient-to-br ${colorClass} shadow-xl overflow-hidden mb-8`}
            >
              <div className="absolute top-0 right-0 p-2">
                <button 
                  onClick={() => {
                    localStorage.setItem(`bonus_seen_${bonusId}`, '1');
                    setTransactions([...transactions]); // Trigger re-render
                  }}
                  className="text-white/30 hover:text-white/60 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-4xl animate-pulse">{icon}</div>
                <div>
                  <h3 className="font-serif text-lg font-bold mb-1">Dono del Cosmo Ricevuto</h3>
                  <p className="text-sm opacity-90 leading-relaxed font-light italic">"{message}"</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 text-6xl opacity-10 pointer-events-none">{icon}</div>
            </motion.div>
          );
        })()}

        {/* ── Status Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="font-serif text-2xl font-bold text-white">
              Ciao, <span className="gold-text">{firstName}</span> ✨
            </h2>
            {wallet && (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-medium mb-0.5">Disponibile</p>
                  <p className="text-sm font-bold text-emerald-400 leading-none">{wallet.balanceAvailable} <span className="text-[10px] font-normal uppercase opacity-70">CR</span></p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-medium mb-0.5">Impegnato</p>
                  <p className="text-sm font-bold text-amber-400 leading-none">{wallet.balanceLocked} <span className="text-[10px] font-normal uppercase opacity-70">CR</span></p>
                </div>
              </div>
            )}
            <AstralBadge user={user} donePaidConsults={taxInfo?.donePaidConsults || 0} />
          </div>
        </motion.div>

        <AstralRankCard user={user} donePaidConsults={taxInfo?.donePaidConsults || 0} />

        <TransactionHistory transactions={transactions} loading={transactionsLoading} />

        {/* ── Presenza Valeria ── */}
        {getApiBaseUrl() && (
          <p className="text-sm text-white/55 mb-6 flex flex-wrap items-center gap-2">
            <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${valeriaPresence?.status === 'online' ? 'bg-emerald-500/90' : valeriaPresence?.status === 'busy' ? 'bg-amber-500/90' : 'bg-white/30'}`} aria-hidden />
            <span>Valeria in questo momento: <strong className="text-gold-400/95">{presenceLabel}</strong> <span className="text-white/35 text-xs ml-2">(utile per capire se può rispondere subito)</span></span>
          </p>
        )}

        {/* ── Finestre Live ── */}
        {liveWindows && (
          <div className="mb-6 mystical-card border-gold-500/30 bg-gold-900/10 shadow-[0_0_20px_rgba(212,160,23,0.05)]">
            <h3 className="text-gold-500 font-bold mb-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500" /></span>
              Onda Sincronica (Live ChatRoom)
            </h3>
            <p className="text-white/70 text-sm mb-4">I momenti di maggiore connessione in cui puoi trovare Valeria disponibile.</p>
            {liveWindows.length === 0 ? (
              <p className="text-white/40 text-xs italic bg-black/40 p-3 rounded border border-white/5">Nessuna finestra Live attualmente in programma.</p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {liveWindows.map((w, idx) => {
                  const now = new Date(), wStart = new Date(w.start), wEnd = new Date(w.end)
                  const isNow = now >= wStart && now <= wEnd
                  const dayStr = wStart.toLocaleDateString('it-IT', { weekday: 'long' })
                  const isToday = dayStr === now.toLocaleDateString('it-IT', { weekday: 'long' })
                  return (
                    <div key={idx} className={`p-3 rounded-lg border ${isNow ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-black/40'}`}>
                      <p className={`text-sm font-bold capitalize ${isNow ? 'text-emerald-400' : 'text-gold-400'}`}>
                        {isToday ? 'Oggi' : dayStr}
                        {isNow && <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">In Corso</span>}
                      </p>
                      <p className="text-white/80 text-xs mt-1">{w.label}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Big Five Widget ── */}
        {!myChartsLoading && myCharts && myCharts.length > 0 && (
          <div className="mb-12">
            <BigFiveWidget
              planets={myCharts[0].chartData.pianeti || []}
              ascendant={{ segno: myCharts[0].chartData.segno, gradi: myCharts[0].chartData.grado_nel_segno }}
            />
          </div>
        )}

        <BookingFlow
          user={user}
          donePaidConsults={taxInfo?.donePaidConsults || 0}
          presenceLabel={presenceLabel}
          freeHidden={freeHidden}
          ageStatus={ageStatus}
          onBookingConfirmed={() => {
            void loadMyConsults()
            void loadWallet()
          }}
        />

        {/* ── Storico consulti ── */}
        <motion.section id="storico" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.38 }} className="mb-10 scroll-mt-28">
          <h2 className="font-serif text-xl font-bold text-white mb-1">I tuoi consulti</h2>
          <p className="text-white/40 text-sm mb-4 max-w-2xl">Storico degli appuntamenti prenotati tramite app.</p>
          {!getApiBaseUrl() && <p className="text-amber-200/80 text-sm">Servizio storico non disponibile senza connessione al server.</p>}
          {getApiBaseUrl() && myConsultsLoading && <p className="text-white/45 text-sm">Caricamento elenco…</p>}
          {getApiBaseUrl() && !myConsultsLoading && myConsults?.length === 0 && (
            <div className="mystical-card border border-white/10">
              <p className="text-white/50 text-sm">Non risultano ancora consulti collegati.</p>
            </div>
          )}
          {getApiBaseUrl() && !myConsultsLoading && myConsults && myConsults.length > 0 && (
            <div className="relative pl-5 border-l-2 border-gold-600/30 space-y-8 my-10 ml-2">
              {myConsults.map((c) => {
                const startDate = c.start_at ? new Date(c.start_at) : null
                const isPast = !startDate || startDate < new Date()
                const isSoon = !isPast && startDate && (startDate.getTime() - new Date().getTime() < 15 * 60 * 1000)
                const statusBadge = c.status === 'done'
                  ? { label: 'Completato', cls: 'border-emerald-600/30 text-emerald-400/80', dot: 'bg-emerald-400' }
                  : c.status === 'cancelled'
                  ? { label: 'Cancellato', cls: 'border-red-800/30 text-red-400/60', dot: 'bg-red-400' }
                  : { label: isPast ? 'Passato' : 'In programma', cls: isPast ? 'border-white/15 text-white/35' : 'border-gold-600/35 text-gold-400/80', dot: isPast ? 'bg-white/30' : 'bg-gold-400 animate-pulse' }
                return (
                  <div key={c.id} className="relative">
                    <div className={`absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-dark-500 ${statusBadge.dot}`} />
                    <div className={`mystical-card p-0 overflow-hidden border ${isSoon ? 'border-gold-500/50 bg-gold-500/[0.03]' : 'border-white/10 bg-white/[0.02]'}`}>
                      <div className="p-4">
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                          <div>
                            <span className="text-gold-500/80 text-xs font-mono">{formatConsultWhen(c.start_at)}</span>
                            <h4 className="text-white font-medium text-sm mt-0.5">{c.is_free_consult ? 'Consulto Omaggio (7 min)' : 'Consulto con Valeria'}</h4>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${statusBadge.cls}`}>{statusBadge.label}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 p-3 bg-white/[0.03] border-t border-white/5 items-center justify-between">
                        {c.status === 'scheduled' && !isPast && (
                          <Link to={`/sessione/${c.id}`} className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 ${isSoon ? 'bg-gold-500 text-dark-500 hover:bg-gold-400' : 'bg-white/10 text-gold-400 hover:bg-white/20 border border-gold-500/30'}`}>
                            {isSoon ? 'Entra nel Consulto Live' : 'Apri la ChatRoom'} <span>→</span>
                          </Link>
                        )}
                        {!isPast && c.status === 'scheduled' && (
                          <div className="flex gap-2 ml-auto">
                            {c.reschedule_count === 0 && (
                              <button onClick={() => { if (window.confirm("Vuoi spostare la data? I crediti verranno rimborsati.")) handleConsultAction(c.id, 'reschedule') }} className="px-3 py-1.5 rounded-full border border-gold-500/30 text-gold-400 text-xs hover:bg-gold-500/10">Sposta Data</button>
                            )}
                            <button onClick={() => { if (window.confirm("Sei sicuro di voler disdire?")) handleConsultAction(c.id, 'cancel') }} className="px-3 py-1.5 rounded-full border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10">Disdici</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.section>

        {/* ── Sezione recensioni ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-10">
          <h2 className="font-serif text-xl font-bold text-white mb-4">La tua opinione è preziosa</h2>
          <SiteReviewComposer />
        </motion.section>

        {/* ── Profilo ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} className="mystical-card mb-10">
          <h3 className="font-semibold text-white/70 text-sm mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Il tuo profilo
          </h3>
          <div className="flex items-center gap-4">
            {user.imageUrl && <img src={user.imageUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-gold-600/30" />}
            <div>
              <p className="text-white font-medium">{user.fullName || firstName}</p>
              <p className="text-white/40 text-sm">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Preferenza di contatto</span>
                <select value={userContactPref} onChange={(e) => setUserContactPref(e.target.value as any)} className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="none">Nessuna selezionata</option>
                  <option value="phone">🎧 Solo Audio (Meet/Zoom)</option>
                  <option value="meet">📽️ Google Meet (Video)</option>
                  <option value="zoom">📹 Zoom (Video)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Cellulare (solo per emergenze/backup)</span>
                <input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} placeholder="+39..." className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white" />
              </label>
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-4">
              {profileSuccessMsg && <span className="text-emerald-400 text-xs">✨ Preferenze salvate!</span>}
              <button type="button" onClick={saveProfileSettings} disabled={savingProfile || profileLoading} className="btn-gold text-xs px-8 py-2.5 disabled:opacity-50 min-w-[140px]">
                {savingProfile ? 'Salvataggio…' : 'Salva preferenze'}
              </button>
            </div>
          </div>
        </motion.div>

        {taxInfo?.showReminder && (
          <TaxInfoForm
            getToken={getToken}
            donePaidConsults={taxInfo?.donePaidConsults || 0}
            onSuccess={() => setTaxInfo(prev => prev ? { ...prev, showReminder: false, hasCodiceFiscale: true } : prev)}
          />
        )}

        {/* ── Modale Legale ── */}
        {!ageStatusLoading && ageStatus && !ageStatus.hasLegalDeclaration && (
          <LegalDeclarationModal onAccepted={() => setAgeStatus((prev) => prev ? { ...prev, hasLegalDeclaration: true } : prev)} />
        )}
      </div>
    </ClientLayout>
  )
}
