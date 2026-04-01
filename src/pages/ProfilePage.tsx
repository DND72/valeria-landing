import { useUser, useClerk } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/40 text-xs mb-0.5">{label}</dt>
      <dd className="text-white/85 text-sm">{value}</dd>
    </div>
  )
}

export default function ProfilePage() {
  const { isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  // Password change
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  const privileged = isPrivilegedClerkUser(user)
  const email = user.primaryEmailAddress?.emailAddress ?? '—'
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—'
  const createdAt = user.createdAt
    ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(new Date(user.createdAt))
    : '—'

  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwMsg(null)
    if (pwNew !== pwConfirm) {
      setPwMsg({ type: 'err', text: 'Le nuove password non coincidono.' })
      return
    }
    if (pwNew.length < 8) {
      setPwMsg({ type: 'err', text: 'La nuova password deve avere almeno 8 caratteri.' })
      return
    }
    setPwSaving(true)
    try {
      await user.updatePassword({ currentPassword: pwCurrent, newPassword: pwNew })
      setPwMsg({ type: 'ok', text: 'Password aggiornata con successo.' })
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'errors' in err
          ? (err as { errors: { message: string }[] }).errors?.[0]?.message ?? 'Errore aggiornamento password.'
          : 'Errore aggiornamento password.'
      setPwMsg({ type: 'err', text: msg })
    } finally {
      setPwSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await user.delete()
      await signOut(() => navigate('/'))
    } catch {
      setDeleting(false)
      setDeleteConfirm(false)
      alert('Impossibile cancellare l\'account. Riprova o contatta Valeria.')
    }
  }

  return (
    <div className="min-h-screen px-6 py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 35% at 50% 15%, rgba(212,160,23,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <Link to="/dashboard" className="text-gold-500/80 text-sm hover:text-gold-400 transition-colors mb-3 inline-block">
              ← Il tuo Diario
            </Link>
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-1">Account</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">Il mio profilo</h1>
          </div>
          {privileged && (
            <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-gold-600/40 text-gold-400/90 h-fit">
              Staff
            </span>
          )}
        </motion.div>

        <div className="space-y-6">
          {/* Dati account */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mystical-card"
          >
            <div className="flex items-center gap-4 mb-6">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={fullName}
                  className="w-14 h-14 rounded-full border border-white/15 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/50 text-xl font-serif">
                  {(user.firstName?.[0] ?? email[0] ?? '?').toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-semibold">{fullName}</p>
                <p className="text-white/40 text-xs">{email}</p>
              </div>
            </div>

            <h2 className="font-serif text-lg text-white mb-4">Informazioni account</h2>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-5">
              <FieldRow label="Nome completo" value={fullName} />
              <FieldRow label="Email" value={email} />
              <FieldRow label="Membro dal" value={createdAt} />
              <FieldRow label="Tipo account" value={privileged ? 'Staff' : 'Cliente'} />
            </dl>

            <a
              href="https://accounts.clerk.com/user"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm px-4 py-2 inline-block"
            >
              Modifica nome e foto (portale Clerk) ↗
            </a>
          </motion.section>

          {/* Cambio password */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mystical-card"
          >
            <h2 className="font-serif text-lg text-white mb-1">Sicurezza</h2>
            <p className="text-white/40 text-sm mb-5">Modifica la tua password di accesso.</p>

            <form onSubmit={(e) => void handlePasswordChange(e)} className="space-y-4 max-w-sm">
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Password attuale</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  required
                  className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Nuova password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                />
              </label>
              <label className="block">
                <span className="text-white/45 text-xs block mb-1">Conferma nuova password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-dark-400 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                />
              </label>

              {pwMsg && (
                <p
                  className={`text-sm ${pwMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400/90'}`}
                  role="alert"
                >
                  {pwMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
                className="btn-gold text-sm px-5 py-2"
              >
                {pwSaving ? 'Aggiornamento…' : 'Aggiorna password'}
              </button>
            </form>
          </motion.section>

          {/* Link utili */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mystical-card"
          >
            <h2 className="font-serif text-lg text-white mb-4">Link utili</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/faq" className="btn-outline text-sm px-4 py-2">
                FAQ
              </Link>
              <Link to="/termini" className="btn-outline text-sm px-4 py-2">
                Termini di servizio
              </Link>
              <Link to="/dashboard" className="btn-outline text-sm px-4 py-2">
                Il tuo Diario
              </Link>
            </div>
          </motion.section>

          {/* Zona pericolo — cancella account */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mystical-card border border-red-900/30"
          >
            <h2 className="font-serif text-lg text-white mb-1">Cancella account</h2>
            <p className="text-white/40 text-sm mb-4">
              La cancellazione dell'account è <strong className="text-white/60">irreversibile</strong>. Tutti i
              tuoi dati e il tuo storico consulti verranno eliminati.
            </p>

            {!deleteConfirm ? (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="text-red-400/80 text-sm border border-red-800/30 px-4 py-2 rounded-lg hover:bg-red-900/20 hover:text-red-300 transition-colors"
              >
                Richiedi cancellazione account
              </button>
            ) : (
              <div className="border border-red-700/40 rounded-lg p-4 bg-red-950/20">
                <p className="text-red-300/90 text-sm mb-4 font-medium">
                  Sei sicura di voler cancellare definitivamente il tuo account? Questa azione non può essere
                  annullata.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleDeleteAccount()}
                    disabled={deleting}
                    className="text-sm bg-red-700/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {deleting ? 'Cancellazione…' : 'Sì, cancella il mio account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="btn-outline text-sm px-4 py-2"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  )
}
