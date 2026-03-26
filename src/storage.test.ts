import { describe, it, expect, afterEach } from "vitest";
import * as path from "node:path";
import { defaultDataDir, expandUserPath, openClawStateDir } from "./storage.js";

describe("storage paths", () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env.PASSPORT_PLUGIN_DATA_DIR = saved.PASSPORT_PLUGIN_DATA_DIR;
    process.env.OPENCLAW_STATE_DIR = saved.OPENCLAW_STATE_DIR;
    process.env.HOME = saved.HOME;
  });

  it("defaultDataDir uses ~/.openclaw/passport-claw", () => {
    delete process.env.PASSPORT_PLUGIN_DATA_DIR;
    delete process.env.OPENCLAW_STATE_DIR;
    process.env.HOME = "/Users/Tester";
    expect(defaultDataDir()).toBe(path.join("/Users/Tester", ".openclaw", "passport-claw"));
  });

  it("OPENCLAW_STATE_DIR overrides state root", () => {
    delete process.env.PASSPORT_PLUGIN_DATA_DIR;
    process.env.OPENCLAW_STATE_DIR = "/var/oc";
    expect(openClawStateDir()).toBe(path.resolve("/var/oc"));
    expect(defaultDataDir()).toBe(path.join(path.resolve("/var/oc"), "passport-claw"));
  });

  it("PASSPORT_PLUGIN_DATA_DIR wins", () => {
    process.env.PASSPORT_PLUGIN_DATA_DIR = "/tmp/pc-data";
    process.env.OPENCLAW_STATE_DIR = "/ignored";
    expect(defaultDataDir()).toBe(path.resolve("/tmp/pc-data"));
  });

  it("expandUserPath expands tilde", () => {
    process.env.HOME = "/home/x";
    expect(expandUserPath("~/foo")).toBe(path.join("/home/x", "foo"));
  });
});
