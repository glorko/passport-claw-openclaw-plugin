/**
 * passport-claw OpenClaw plugin entry.
 * Implements `register()` so OpenClaw exposes `/passport` and exports helpers for CLI/tests.
 */

import { handlePassportCommand } from "./passportCommand.js";

export { IssuerClient, getIssuerAdminToken, getIssuerBaseUrl, type SubjectJwk } from "./issuerClient.js";
export { parseChallengeJson, type PassportChallenge } from "./challenge.js";
export {
  LOCAL_PASSPORT_STACK,
  localPassportHelpUrl,
  localSetupGuideUrl,
} from "./localDefaults.js";
export {
  loadCredential,
  saveCredential,
  clearCredential,
  defaultDataDir,
  credentialPath,
  type StoredCredential,
} from "./storage.js";
export { petNameFromPassportId, shortPassportTail } from "./petName.js";
export { handlePassportCommand, helpText, type PassportCommandContext } from "./passportCommand.js";

import { IssuerClient, getIssuerBaseUrl, type SubjectJwk } from "./issuerClient.js";
import { loadCredential, saveCredential, defaultDataDir } from "./storage.js";

/** Enroll: POST /v1/passports and persist credential (demo file store). */
export async function enrollFromCLI(
  subjectJwk: SubjectJwk,
  opts?: { fetch?: typeof fetch; dataDir?: string }
): Promise<{ passport_id: string }> {
  const base = getIssuerBaseUrl();
  const client = new IssuerClient(base, opts?.fetch);
  const out = await client.registerPassport(subjectJwk);
  const dir = opts?.dataDir || defaultDataDir();
  saveCredential(dir, {
    passport_id: out.passport_id,
    credential: out.credential,
    subject_jwk: subjectJwk as unknown as Record<string, unknown>,
  });
  return { passport_id: out.passport_id };
}

export function statusCLI(opts?: { dataDir?: string }): { enrolled: boolean; passport_id?: string } {
  const c = loadCredential(opts?.dataDir || defaultDataDir());
  if (!c) return { enrolled: false };
  return { enrolled: true, passport_id: c.passport_id };
}

/**
 * OpenClaw plugin registration — registers `/passport` (info, revoke, help).
 * See `openclaw.plugin.json` → `cli:commands`.
 */
export function register(api: {
  registerCommand: (def: {
    name: string;
    description: string;
    acceptsArgs?: boolean;
    handler: (ctx: {
      args?: string;
      channel: string;
      isAuthorizedSender: boolean;
      config: unknown;
    }) => Promise<{ text?: string; isError?: boolean }> | { text?: string; isError?: boolean };
  }) => void;
}): void {
  api.registerCommand({
    name: "passport",
    description: "Passport Claw — `/passport` (info) · `/passport revoke` (burn passport for testing)",
    acceptsArgs: true,
    handler: async (ctx) => handlePassportCommand(ctx),
  });
}
