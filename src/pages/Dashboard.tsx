import { useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'
import ClientDashboard from './dashboard/ClientDashboard'
import StaffDashboard from './dashboard/StaffDashboard'

/**
 * Router-only. Determina se l'utente è Staff o Cliente e delega
 * al componente dedicato. Zero logica di business qui.
 */
export default function Dashboard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-gold-500/30 border-t-gold-400 animate-spin" aria-hidden />
        <p className="text-white/60 text-sm">Caricamento del tuo diario…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  return isPrivilegedClerkUser(user) ? <StaffDashboard /> : <ClientDashboard />
}
