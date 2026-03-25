import { ClerkProvider } from '@clerk/clerk-react'
import { itIT } from '@clerk/localizations'
import { useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY mancante nel file .env')
}

/**
 * Clerk richiede routerPush/routerReplace insieme al React Router, altrimenti
 * SignUp/SignIn in routing "path" non aggiornano l'URL e il form può non comparire (SPA).
 * @see https://clerk.com/docs/react-router/components/clerk-provider
 */
export function ClerkProviderWithRouter({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  const routerPush = useCallback(
    (to: string) => {
      navigate(to)
      return Promise.resolve()
    },
    [navigate]
  )

  const routerReplace = useCallback(
    (to: string) => {
      navigate(to, { replace: true })
      return Promise.resolve()
    },
    [navigate]
  )

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      localization={itIT}
      signInUrl="/accedi"
      signUpUrl="/registrati"
      routerPush={routerPush}
      routerReplace={routerReplace}
    >
      {children}
    </ClerkProvider>
  )
}
