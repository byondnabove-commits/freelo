declare module '*.css'
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}