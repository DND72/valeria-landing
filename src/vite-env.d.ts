/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  /** URL base del backend API (es. https://xxx.up.railway.app), senza slash finale */
  readonly VITE_API_URL?: string
  /** Override URL embed Calendly (scheduling) */
  readonly VITE_CALENDLY_BOOKING_URL?: string
  readonly VITE_CALENDLY_CONSULTO_BREVE?: string
  readonly VITE_CALENDLY_CONSULTO_ONLINE?: string
  readonly VITE_CALENDLY_CONSULTO_COMPLETO?: string
  readonly VITE_CALENDLY_FREE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
