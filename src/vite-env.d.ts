/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POLICY_SEARCH_ENDPOINT?: string;
  readonly VITE_LOCATION_SEARCH_ENDPOINT?: string;
  readonly VITE_VISION_ANALYSIS_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
