import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { enrollFromCLI, statusCLI } from "./index.js";

describe("enrollFromCLI (mock fetch)", () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "pc-plugin-"));
    process.env.ISSUER_BASE_URL = "http://mock-issuer";
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    delete process.env.ISSUER_BASE_URL;
  });

  it("persists credential after mock register", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ passport_id: "pid-1", credential: "cred.jws" }), { status: 201 })
    );
    const out = await enrollFromCLI(
      { kty: "OKP", crv: "Ed25519", x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo" },
      { fetch: fetchMock as unknown as typeof fetch, dataDir: dir }
    );
    expect(out.passport_id).toBe("pid-1");
    const st = statusCLI({ dataDir: dir });
    expect(st.enrolled).toBe(true);
  });
});
