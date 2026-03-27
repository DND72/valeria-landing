/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  /** URL base del backend API (es. https://xxx.up.railway.app), senza slash finale */
  readonly VITE_API_URL?: string
  /** Override URL embed Calendly (scheduling principale) */
  readonly VITE_CALENDLY_BOOKING_URL?: string
  /** Override URL embed consulto gratuito */
  readonly VITE_CALENDLY_FREE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
