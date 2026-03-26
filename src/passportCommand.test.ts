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
});
