import { IssuerClient, getIssuerBaseUrl } from "./issuerClient.js";
import { generateEd25519SubjectKeyPair } from "./subjectKey.js";
import { defaultDataDir, saveCredential } from "./storage.js";

/** Register a new passport with a freshly generated Ed25519 key and persist credential locally. */
export async function enrollNewPassport(opts?: {
  fetch?: typeof fetch;
  dataDir?: string;
}): Promise<{ passport_id: string }> {
  const { subjectJwkForIssuer, subjectJwkToStore } = generateEd25519SubjectKeyPair();
  const client = new IssuerClient(getIssuerBaseUrl(), opts?.fetch);
  const out = await client.registerPassport(subjectJwkForIssuer);
  const dir = opts?.dataDir ?? defaultDataDir();
  saveCredential(dir, {
    passport_id: out.passport_id,
    credential: out.credential,
    subject_jwk: subjectJwkToStore,
  });
  return { passport_id: out.passport_id };
}
