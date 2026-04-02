import { useUser } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import { isPrivilegedClerkUser } from '../lib/privilegedUser'

interface Props {
  children: React.ReactNode
}

/**
 * StaffGuard
 * Protegge i componenti figli reindirizzando alla Home chiunque non sia loggato
 * o non abbia i metadati "staff" / "privileged" configurati su Clerk.
 */
export default function StaffGuard({ children }: Props) {
  const { isLoaded, isSignedIn, user } = useUser()
  const location = useLocation()

  // Se Clerk sta ancora caricando, mostriamo un caricamento neutro
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-500">
        <div className="text-white/40 text-sm animate-pulse font-serif">Valeria: Controllo identità…</div>
      </div>
    )
  }

  // Se non è loggato o non è staff, lo spediamo alla Home (o alla pagina di accesso)
  if (!isSignedIn || !isPrivilegedClerkUser(user)) {
    console.warn(`[StaffGuard] Accesso negato a ${location.pathname}. Utente non autorizzato.`)
    return <Navigate to="/" replace />
  }

  // Se è autorizzato, mostriamo il contenuto protetto
  return <>{children}</>
}
