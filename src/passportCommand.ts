import { IssuerClient, getIssuerAdminToken, getIssuerBaseUrl } from "./issuerClient.js";
import { petNameFromPassportId, shortPassportTail } from "./petName.js";
import { clearCredential, defaultDataDir, loadCredential } from "./storage.js";

/** Minimal shape OpenClaw passes to plugin command handlers. */
export type PassportCommandContext = {
  args?: string;
};

export function helpText(): string {
  return (
    "Passport Claw: `/passport` or `/passport info` — show your buddy + passport id. " +
    "`/passport revoke` — burn this install's passport on the issuer (needs ISSUER_ADMIN_TOKEN) and delete the local credential file."
  );
}

export async function handlePassportCommand(
  ctx: PassportCommandContext
): Promise<{ text?: string; isError?: boolean }> {
  const raw = (ctx.args ?? "").trim().toLowerCase();
  const dataDir = defaultDataDir();

  if (raw === "revoke" || raw === "burn") {
    return runRevoke(dataDir);
  }
  if (raw === "help" || raw === "?") {
    return { text: helpText() };
  }
  if (raw && raw !== "info" && raw !== "status") {
    return { text: `Unknown subcommand. ${helpText()}`, isError: true };
  }
  return runInfo(dataDir);
}

function runInfo(dataDir: string): { text: string } {
  const c = loadCredential(dataDir);
  if (!c) {
    return {
      text:
        "No passport saved yet — enroll first (CLI / onboarding flow). " +
        `Issuer: ${getIssuerBaseUrl()} · data: ${dataDir}`,
    };
  }
  const buddy = petNameFromPassportId(c.passport_id);
  const tail = shortPassportTail(c.passport_id);
  return {
    text:
      `🦞 Your passport buddy: **${buddy}** · tag \`#${tail}\`\n` +
      `Passport ID: \`${c.passport_id}\`\n` +
      `Issuer: ${getIssuerBaseUrl()}\n` +
      `Local credential: stored (demo file)`,
  };
}

async function runRevoke(dataDir: string): Promise<{ text: string; isError?: boolean }> {
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
  const buddy = petNameFromPassportId(c.passport_id);
  return {
    text:
      `🔥 Revoked **${buddy}** (\`${c.passport_id}\`) and cleared local credential.\n` +
      `Enroll again for a fresh buddy.`,
  };
}
