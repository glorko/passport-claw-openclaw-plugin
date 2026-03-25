import * as fs from "node:fs";
import * as path from "node:path";

export type StoredCredential = {
  passport_id: string;
  credential: string;
  subject_jwk: Record<string, unknown>;
};

/** Demo-grade file store under dataDir (e.g. OpenClaw plugin data path). */
export function credentialPath(dataDir: string): string {
  return path.join(dataDir, "passport-credential.json");
}

export function loadCredential(dataDir: string): StoredCredential | null {
  const p = credentialPath(dataDir);
  try {
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw) as StoredCredential;
  } catch {
    return null;
  }
}

export function saveCredential(dataDir: string, cred: StoredCredential): void {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(credentialPath(dataDir), JSON.stringify(cred, null, 2), { mode: 0o600 });
}

export function defaultDataDir(): string {
  return process.env.PASSPORT_PLUGIN_DATA_DIR?.trim() || path.join(process.cwd(), ".passport-claw-plugin");
}
