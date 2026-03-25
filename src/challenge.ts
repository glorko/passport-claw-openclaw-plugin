/** Parse board 401 challenge (RFC7807-like). */
export type PassportChallenge = {
  type?: string;
  status?: number;
  passport_docs_url?: string;
  verifier_url?: string;
  title?: string;
};

export function parseChallengeJson(text: string): PassportChallenge | null {
  try {
    const o = JSON.parse(text) as PassportChallenge;
    if (o?.status === 401 && typeof o.verifier_url === "string") return o;
    return null;
  } catch {
    return null;
  }
}
