import { enrollNewPassport } from "./enrollRun.js";
import { buildPassportAsciiCard } from "./passportAsciiCard.js";
import { IssuerClient, getIssuerAdminToken, getIssuerBaseUrl } from "./issuerClient.js";
import { petNameFromPassportId, shortPassportTail } from "./petName.js";
import { resolveOpenClawAgentDisplayName } from "./resolveOpenClawAgentDisplayName.js";
import { clearCredential, defaultDataDir, loadCredential } from "./storage.js";

/** Minimal shape OpenClaw passes to plugin command handlers. */
export type PassportCommandContext = {
  args?: string;
  /** Full OpenClaw config from slash handler; CLI passes snapshot from `register()`. */
  config?: unknown;
};

export function helpText(): string {
  return (
    "Passport Claw: `/passport` or `/passport info` — show your buddy + passport id. " +
    "`/passport enroll` — generate a key, register with the issuer, save credential (needs issuer reachable). " +
    "`/passport revoke` — burn this install's passport on the issuer (needs ISSUER_ADMIN_TOKEN) and delete the local credential file."
  );
}

export async function handlePassportCommand(
  ctx: PassportCommandContext
): Promise<{ text?: string; isError?: boolean }> {
  const raw = (ctx.args ?? "").trim().toLowerCase();
  const dataDir = defaultDataDir();

  if (raw === "revoke" || raw === "burn") {
    return runRevoke(dataDir, ctx.config);
  }
  if (raw === "enroll" || raw === "register") {
    return runEnroll(dataDir, ctx.config);
  }
  if (raw === "help" || raw === "?") {
    return { text: helpText() };
  }
  if (raw && raw !== "info" && raw !== "status") {
    return { text: `Unknown subcommand. ${helpText()}`, isError: true };
  }
  return runInfo(dataDir, ctx.config);
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

function runInfo(dataDir: string, config?: unknown): { text: string } {
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
  return {
    text:
      "```\n" +
      card +
      "\n```\n\n" +
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
