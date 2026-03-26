/**
 * Hardcoded local stack URLs (passport-claw-dev / default Crux ports).
 * `getIssuerBaseUrl()` still honors ISSUER_BASE_URL / DEFAULT_ISSUER_BASE_URL.
 */
export const LOCAL_PASSPORT_STACK = {
  issuerBaseUrl: "http://127.0.0.1:19081",
  boardApiBaseUrl: "http://127.0.0.1:19080",
  verifierBaseUrl: "http://127.0.0.1:19082",
  frontendOrigin: "http://127.0.0.1:19173",
  setupGuidePath: "/passport-local.html",
} as const;

/**
 * Public **staging** stack on Railway (HTTPS). Use for docs, demos, and OpenClaw when you set
 * `ISSUER_BASE_URL` / gateway env to the staging issuer. Replace when you have production URLs.
 */
export const STAGING_PASSPORT_STACK = {
  issuerBaseUrl: "https://issuer-staging.up.railway.app",
  verifierBaseUrl: "https://verifier-staging-e555.up.railway.app",
  boardApiBaseUrl: "https://demo-forum-staging.up.railway.app",
  /** Same host as board (API + built Vite UI on one service). */
  frontendOrigin: "https://demo-forum-staging.up.railway.app",
  setupGuidePath: "/passport-local.html",
} as const;

export function localSetupGuideUrl(): string {
  return `${LOCAL_PASSPORT_STACK.frontendOrigin}${LOCAL_PASSPORT_STACK.setupGuidePath}`;
}

export function localPassportHelpUrl(): string {
  return `${LOCAL_PASSPORT_STACK.boardApiBaseUrl}/api/passport-help`;
}

export function stagingSetupGuideUrl(): string {
  return `${STAGING_PASSPORT_STACK.frontendOrigin}${STAGING_PASSPORT_STACK.setupGuidePath}`;
}

export function stagingPassportHelpUrl(): string {
  return `${STAGING_PASSPORT_STACK.boardApiBaseUrl}/api/passport-help`;
}
