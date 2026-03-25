import { ClerkProvider } from '@clerk/clerk-react'
import { itIT } from '@clerk/localizations'
import { useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

function ClerkConfigMissing() {
  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="font-serif text-2xl text-amber-400">Clerk non configurato nel build online</h1>
        <p className="text-white/70 text-sm leading-relaxed">
          La variabile <code className="text-amber-200/90">VITE_CLERK_PUBLISHABLE_KEY</code> non è
          stata inclusa quando è stato eseguito <code className="text-amber-200/90">npm run build</code>.
          Su <strong>Railway</strong> va aggiunta nelle <strong>Variables</strong> del servizio e serve un
          <strong> nuovo deploy</strong> (il valore viene “cucito” nel sito al momento del build, non a runtime).
        </p>
        <p className="text-white/50 text-xs">
          In Clerk (istanza <strong>Production</strong>) usa <code>pk_live_…</code> e aggiungi l’URL pubblico del
          sito tra i domini / URL consentiti.
        </p>
      </div>
    </div>
  )
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

  if (!PUBLISHABLE_KEY?.trim()) {
    return <ClerkConfigMissing />
  }

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
