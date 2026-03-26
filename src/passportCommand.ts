import { enrollNewPassport } from "./enrollRun.js";
import { buildPassportAsciiCard } from "./passportAsciiCard.js";
import { IssuerClient, getIssuerAdminToken, getIssuerBaseUrl } from "./issuerClient.js";
import { petNameFromPassportId, shortPassportTail } from "./petName.js";
import { resolveOpenClawAgentDisplayName } from "./resolveOpenClawAgentDisplayName.js";
import { clearCredential, defaultDataDir, loadCredential } from "./storage.js";

/** Minimal shape OpenClaw passes to plugin command handlers. */
export type PassportCommandContext = {
  args?: string;
  /** Chat surface (e.g. `tui`, `telegram`). Omitted in tests / CLI wrappers. */
  channel?: string;
  /** Full OpenClaw config from slash handler; CLI passes snapshot from `register()`. */
  config?: unknown;
};

export function helpText(): string {
  return (
    "Passport Claw: `/passport` or `/passport info` — show your buddy + passport id (plain ASCII in TUI; use `/passport plain` elsewhere for the same). " +
    "`/passport enroll` — generate a key, register with the issuer, save credential (needs issuer reachable). " +
    "`/passport revoke` — burn this install's passport on the issuer (needs ISSUER_ADMIN_TOKEN) and delete the local credential file. " +
    "`/passport reissue` — how to get a new passport (revoke, then enroll)."
  );
}

/** TUI renders fenced markdown poorly; plain monospace matches `openclaw passport` output. */
function usePlainAsciiCard(channel: string | undefined, firstToken: string): boolean {
  if (firstToken === "plain" || firstToken === "text" || firstToken === "ascii") return true;
  const c = channel?.trim().toLowerCase() ?? "";
  return c === "tui" || c === "openclaw-tui";
}

function reissueHelpText(): string {
  return (
    "New passport (re-issue): burn the old one, then enroll again.\n" +
    "1. `/passport revoke` — revoke on issuer + delete local credential (needs ISSUER_ADMIN_TOKEN).\n" +
    "2. `/passport enroll` — new key + new passport id.\n" +
    "CLI: `openclaw passport revoke` then `openclaw passport enroll`."
  );
}

export async function handlePassportCommand(
  ctx: PassportCommandContext
): Promise<{ text?: string; isError?: boolean }> {
  const raw = (ctx.args ?? "").trim().toLowerCase();
  const dataDir = defaultDataDir();
  const firstToken = raw.split(/\s+/).filter(Boolean)[0] ?? "";

  if (raw === "revoke" || raw === "burn") {
    return runRevoke(dataDir, ctx.config);
  }
  if (raw === "enroll" || raw === "register") {
    return runEnroll(dataDir, ctx.config);
  }
  if (firstToken === "reissue" || firstToken === "renew") {
    return { text: reissueHelpText() };
  }
  if (raw === "help" || raw === "?") {
    return { text: helpText() };
  }
  if (raw && raw !== "info" && raw !== "status") {
    const plainOnly =
      firstToken === "plain" || firstToken === "text" || firstToken === "ascii";
    if (!plainOnly) {
      return { text: `Unknown subcommand. ${helpText()}`, isError: true };
    }
  }
  return runInfo(dataDir, ctx.config, {
    plain: usePlainAsciiCard(ctx.channel, firstToken),
  });
}

async function runEnroll(
  dataDir: string,
  config?: unknown
): Promise<{ text: string; isError?: boolean }> {
  if (loadCredential(dataDir)) {
    return {
      text:
        "Already enrolled — credential on disk. Use `/passport` for status or `/passport revoke` to reset (issuer + local file).",
      isError: true,
    };
  }
  try {
    const { passport_id } = await enrollNewPassport({ dataDir });
    const tail = shortPassportTail(passport_id);
    const buddy = buddyDisplayLabel(config, passport_id);
    const who = `**${buddy}** · tag \`#${tail}\``;
    return {
      text:
        `✅ Enrolled — ${who}\n` +
        `Passport ID: \`${passport_id}\`\n` +
        `Issuer: ${getIssuerBaseUrl()} · data: ${dataDir}`,
    };
  } catch (e) {
    return {
      text: `Enroll failed: ${e instanceof Error ? e.message : String(e)}`,
      isError: true,
    };
  }
}

/** Buddy label: OpenClaw agent name from config / IDENTITY.md when set, else deterministic pet name from passport id. */
function buddyDisplayLabel(config: unknown | undefined, passportId: string): string {
  return resolveOpenClawAgentDisplayName(config) ?? petNameFromPassportId(passportId);
}

function formatWhoLine(config: unknown | undefined, passportId: string, tail: string): string {
  const buddy = buddyDisplayLabel(config, passportId);
  return `🦞 Your passport buddy: **${buddy}** · tag \`#${tail}\``;
}

function runInfo(
  dataDir: string,
  config?: unknown,
  opts?: { plain?: boolean }
): { text: string } {
  const c = loadCredential(dataDir);
  if (!c) {
    return {
      text:
        "No passport saved yet — run `/passport enroll` (or `openclaw passport enroll`) with the issuer up. " +
        `Issuer: ${getIssuerBaseUrl()} · data: ${dataDir}`,
    };
  }
  const tail = shortPassportTail(c.passport_id);
  const card = buildPassportAsciiCard({
    holderName: buddyDisplayLabel(config, c.passport_id),
    passportId: c.passport_id,
    issuerUrl: getIssuerBaseUrl(),
    tailTag: tail,
  });
  const plain = opts?.plain === true;
  const cardBlock = plain ? `${card}\n\n` : "```\n" + card + "\n```\n\n";
  return {
    text:
      cardBlock +
      `${formatWhoLine(config, c.passport_id, tail)}\n` +
      `Passport ID: \`${c.passport_id}\`\n` +
      `Issuer: ${getIssuerBaseUrl()}\n` +
      `Local credential: stored (demo file)`,
  };
}

async function runRevoke(dataDir: string, config?: unknown): Promise<{ text: string; isError?: boolean }> {
  const c = loadCredential(dataDir);
  if (!c) {
    return { text: "Nothing to revoke — no passport credential stored.", isError: true };
  }
  const client = new IssuerClient(getIssuerBaseUrl());
  try {
    await client.revokePassport(c.passport_id, getIssuerAdminToken());
  } catch (e) {
    return { text: `Revoke failed: ${e instanceof Error ? e.message : String(e)}`, isError: true };
  }
  clearCredential(dataDir);
  const buddy = buddyDisplayLabel(config, c.passport_id);
  return {
    text:
      `🔥 Revoked **${buddy}** (\`${c.passport_id}\`) and cleared local credential.\n` +
      `Enroll again for a fresh buddy.`,
  };
}
