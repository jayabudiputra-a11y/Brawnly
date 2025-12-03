// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
  readonly VITE_CONTACT_EMAIL: string
  readonly VITE_LINKTREE_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_PWA: string
  readonly VITE_ENABLE_SAVE_DATA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}