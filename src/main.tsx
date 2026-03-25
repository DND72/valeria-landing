import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { itIT } from '@clerk/localizations'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY mancante nel file .env')
}

/** Evita redirect “unsafe” verso /dashboard dopo login/registrazione (stesso sito sempre consentito). */
const redirectOrigin =
  typeof window !== 'undefined' ? [window.location.origin] : undefined

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      localization={itIT}
      signInUrl="/accedi"
      signUpUrl="/registrati"
      allowedRedirectOrigins={redirectOrigin}
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>,
)
