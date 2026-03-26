import * as fs from "node:fs";
import * as os from "node:os";
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

/** Remove stored credential file (e.g. after revoke). Ignores missing file. */
export function clearCredential(dataDir: string): void {
  const p = credentialPath(dataDir);
  try {
    fs.unlinkSync(p);
  } catch {
    // ignore
  }
}

/** Expand leading `~` the same way shells do (OpenClaw env paths often use this). */
export function expandUserPath(input: string): string {
  const t = input.trim();
  if (!t) return t;
  if (t === "~") return os.homedir();
  if (t.startsWith("~/")) return path.join(os.homedir(), t.slice(2));
  return path.resolve(t);
}

/** OpenClaw config/state root: `OPENCLAW_STATE_DIR` or `~/.openclaw`. */
export function openClawStateDir(): string {
  const raw = process.env.OPENCLAW_STATE_DIR?.trim();
  if (raw) return expandUserPath(raw);
  return path.join(os.homedir(), ".openclaw");
}

/**
 * Credential directory: `PASSPORT_PLUGIN_DATA_DIR` if set, else
 * `<openClawStateDir>/passport-claw` (not `process.cwd()` — the gateway often has cwd `/`).
 */
export function defaultDataDir(): string {
  const raw = process.env.PASSPORT_PLUGIN_DATA_DIR?.trim();
  if (raw) return expandUserPath(raw);
  return path.join(openClawStateDir(), "passport-claw");
}
