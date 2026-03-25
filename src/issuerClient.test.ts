import { describe, it, expect, vi } from "vitest";
import { IssuerClient } from "./issuerClient.js";

describe("IssuerClient", () => {
  it("registerPassport calls OpenAPI shape", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      expect(String(url)).toContain("/v1/passports");
      expect(init?.method).toBe("POST");
      return new Response(JSON.stringify({ passport_id: "p1", credential: "c1" }), { status: 201 });
    });
    const c = new IssuerClient("http://iss", fetchMock as unknown as typeof fetch);
    const out = await c.registerPassport({
      kty: "OKP",
      crv: "Ed25519",
      x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo",
    });
    expect(out.passport_id).toBe("p1");
    expect(out.credential).toBe("c1");
  });

  it("mintPresentation by passport_id", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ presentation: "pres.jws" }), { status: 201 });
    });
    const c = new IssuerClient("http://iss", fetchMock as unknown as typeof fetch);
    const out = await c.mintPresentation({ passport_id: "abc" });
    expect(out.presentation).toBe("pres.jws");
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    const init = call[1] ?? {};
    const body = JSON.parse(String(init.body));
    expect(body.passport_id).toBe("abc");
  });
});
