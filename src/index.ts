/**
 * passport-claw OpenClaw plugin entry.
 * Exports helpers + CLI-style handlers OpenClaw can wire to `cli:commands` in future SDK versions.
 */
export { IssuerClient, getIssuerBaseUrl, type SubjectJwk } from "./issuerClient.js";
export { parseChallengeJson, type PassportChallenge } from "./challenge.js";
export {
  loadCredential,
  saveCredential,
  defaultDataDir,
  credentialPath,
  type StoredCredential,
} from "./storage.js";

import { IssuerClient, getIssuerBaseUrl, type SubjectJwk } from "./issuerClient.js";
import { saveCredential, loadCredential, defaultDataDir } from "./storage.js";

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
