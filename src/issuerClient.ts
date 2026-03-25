/**
 * HTTP client for passport-claw issuer. Pass custom fetch for tests (MSW/nock).
 */
export type SubjectJwk = { kty: "OKP"; crv: "Ed25519"; x: string };

export class IssuerClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis)
  ) {}

  resolveBaseUrl(envIssuer?: string, defaultUrl?: string): string {
    const u = (envIssuer || defaultUrl || "").replace(/\/$/, "");
    if (!u) throw new Error("ISSUER_BASE_URL or DEFAULT_ISSUER_BASE_URL required");
    return u;
  }

  async registerPassport(subjectJwk: SubjectJwk): Promise<{ passport_id: string; credential: string }> {
    const url = `${this.baseUrl}/v1/passports`;
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ subject_jwk: subjectJwk }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`register ${res.status}: ${t}`);
    }
    return res.json() as Promise<{ passport_id: string; credential: string }>;
  }

  async mintPresentation(
    body: { credential: string } | { passport_id: string; audience?: string }
  ): Promise<{ presentation: string }> {
    const url = `${this.baseUrl}/v1/presentation-tokens`;
    const res = await this.fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`mint ${res.status}: ${t}`);
    }
    return res.json() as Promise<{ presentation: string }>;
  }
}

export function getIssuerBaseUrl(): string {
  const env = process.env.ISSUER_BASE_URL?.trim();
  const def = process.env.DEFAULT_ISSUER_BASE_URL?.trim() || "http://127.0.0.1:8081";
  return (env || def).replace(/\/$/, "");
}
