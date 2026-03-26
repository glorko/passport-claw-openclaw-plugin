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

export function localSetupGuideUrl(): string {
  return `${LOCAL_PASSPORT_STACK.frontendOrigin}${LOCAL_PASSPORT_STACK.setupGuidePath}`;
}

export function localPassportHelpUrl(): string {
  return `${LOCAL_PASSPORT_STACK.boardApiBaseUrl}/api/passport-help`;
}
