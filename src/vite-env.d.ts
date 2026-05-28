/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COVERLENS_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
