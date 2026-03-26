import * as fs from "node:fs";
import * as path from "node:path";

type AgentListEntry = {
  id?: string;
  default?: boolean;
  name?: string;
  workspace?: string;
  identity?: { name?: string };
};

type AgentsSlice = {
  defaults?: { workspace?: string };
  list?: AgentListEntry[];
};

function trimmed(s: unknown): string | undefined {
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t.length ? t : undefined;
}

/** Workspace dir from agents.defaults.workspace or default/main/first list entry. */
export function resolveAgentWorkspaceDirFromConfig(config: unknown): string | undefined {
  if (!config || typeof config !== "object") return undefined;
  const agents = (config as { agents?: AgentsSlice }).agents;
  const fromDefaults = trimmed(agents?.defaults?.workspace);
  if (fromDefaults) return path.resolve(fromDefaults);
  const list = agents?.list;
  if (!list?.length) return undefined;
  const preferred =
    list.find((a) => a.default === true) ?? list.find((a) => trimmed(a.id)?.toLowerCase() === "main") ?? list[0];
  const fromAgent = trimmed(preferred?.workspace);
  return fromAgent ? path.resolve(fromAgent) : undefined;
}

/** Parse OpenClaw workspace IDENTITY.md `**Name:**` line (when set). */
export function displayNameFromIdentityMd(workspaceDir: string): string | undefined {
  try {
    const p = path.join(workspaceDir, "IDENTITY.md");
    if (!fs.existsSync(p)) return undefined;
    const raw = fs.readFileSync(p, "utf8");
    const m = raw.match(/^\s*-\s*\*\*Name:\*\*\s*(.+)$/im);
    const name = m?.[1]?.trim();
    return name?.length ? name : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Human-facing agent name OpenClaw already knows: config agent entry or IDENTITY.md in workspace.
 */
export function resolveOpenClawAgentDisplayName(config: unknown): string | undefined {
  if (!config || typeof config !== "object") return undefined;
  const agents = (config as { agents?: AgentsSlice }).agents;
  const list = agents?.list;
  if (list?.length) {
    const preferred =
      list.find((a) => a.default === true) ?? list.find((a) => trimmed(a.id)?.toLowerCase() === "main") ?? list[0];
    const fromAgent = trimmed(preferred?.name) ?? trimmed(preferred?.identity?.name);
    if (fromAgent) return fromAgent;
  }
  const ws = resolveAgentWorkspaceDirFromConfig(config);
  if (ws) {
    const fromFile = displayNameFromIdentityMd(ws);
    if (fromFile) return fromFile;
  }
  return undefined;
}
