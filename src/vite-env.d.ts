/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GA4 measurement ID (e.g. `G-XXXXXXXXXX`). Unset disables Google Analytics entirely. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
