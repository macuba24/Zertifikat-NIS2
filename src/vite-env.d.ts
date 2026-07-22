/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BOOKING_WEBHOOK_URL?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_FORCE_MAILTO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
