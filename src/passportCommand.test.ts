import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { handlePassportCommand } from "./passportCommand.js";

describe("handlePassportCommand", () => {
  let tmp: string;
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pc-plugin-"));
    vi.stubEnv("PASSPORT_PLUGIN_DATA_DIR", tmp);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("info when no credential", async () => {
    const out = await handlePassportCommand({});
    expect(out.text).toMatch(/No passport saved/);
  });

  it("help", async () => {
    const out = await handlePassportCommand({ args: "help" });
    expect(out.text).toMatch(/\/passport revoke/);
  });

  it("unknown subcommand", async () => {
    const out = await handlePassportCommand({ args: "nope" });
    expect(out.isError).toBe(true);
  });

  it("enroll saves credential when issuer ok", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({ passport_id: "11111111-1111-4111-8111-111111111111", credential: "jws.here" }),
        { status: 201 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ISSUER_BASE_URL", "http://mock-issuer");
    try {
      const out = await handlePassportCommand({ args: "enroll" });
      expect(out.isError).not.toBe(true);
      expect(out.text).toMatch(/Enrolled/);
      expect(out.text).toMatch(/11111111-1111-4111-8111-111111111111/);
      const raw = fs.readFileSync(path.join(tmp, "passport-credential.json"), "utf8");
      const cred = JSON.parse(raw) as { passport_id: string; credential: string };
      expect(cred.credential).toBe("jws.here");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("enroll rejects when already enrolled", async () => {
    fs.writeFileSync(
      path.join(tmp, "passport-credential.json"),
      JSON.stringify({
        passport_id: "22222222-2222-4222-8222-222222222222",
        credential: "x",
        subject_jwk: {},
      }),
      "utf8"
    );
    const out = await handlePassportCommand({ args: "enroll" });
    expect(out.isError).toBe(true);
    expect(out.text).toMatch(/Already enrolled/);
  });
});
