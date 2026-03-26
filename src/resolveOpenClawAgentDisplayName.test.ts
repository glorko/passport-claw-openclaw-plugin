import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  displayNameFromIdentityMd,
  resolveOpenClawAgentDisplayName,
} from "./resolveOpenClawAgentDisplayName.js";

describe("resolveOpenClawAgentDisplayName",  () => {
  it("uses agents.list default agent name", () => {
    const name = resolveOpenClawAgentDisplayName({
      agents: {
        list: [{ id: "side", name: "Other" }, { id: "main", default: true, name: "DemoClaw" }],
      },
    });
    expect(name).toBe("DemoClaw");
  });

  it("uses identity.name when name absent", () => {
    const name = resolveOpenClawAgentDisplayName({
      agents: {
        list: [{ id: "main", default: true, identity: { name: "FromIdentity" } }],
      },
    });
    expect(name).toBe("FromIdentity");
  });

  it("falls back to IDENTITY.md in workspace from defaults", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pc-id-"));
    try {
      fs.writeFileSync(
        path.join(tmp, "IDENTITY.md"),
        "# IDENTITY\n\n- **Name:** LobsterBot\n- **Emoji:** 🦞\n",
        "utf8"
      );
      const name = resolveOpenClawAgentDisplayName({
        agents: {
          defaults: { workspace: tmp },
          list: [{ id: "main" }],
        },
      });
      expect(name).toBe("LobsterBot");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("displayNameFromIdentityMd", () => {
  it("returns undefined when file missing", () => {
    expect(displayNameFromIdentityMd("/nonexistent/workspace/path/xyz")).toBeUndefined();
  });
});
