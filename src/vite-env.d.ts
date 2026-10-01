/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_TECH_TASK_BUSINESS_TIMEZONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
