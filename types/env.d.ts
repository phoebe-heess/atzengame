interface ImportMetaEnv {
  VITE_GOOGLE_CLIENT_ID: string;
  // add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 