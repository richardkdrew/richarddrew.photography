/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GALLERY_SOURCE?: string
  readonly VITE_R2_MANIFEST_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
