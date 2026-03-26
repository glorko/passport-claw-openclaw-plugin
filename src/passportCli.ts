import type { Command } from "commander";
import { handlePassportCommand } from "./passportCommand.js";

/** Strip markdown bold for terminal output. */
function formatCliMessage(text: string): string {
  return text.replace(/\*\*/g, "");
}

/**
 * Registers `openclaw passport [subcommand]` (status | revoke | help).
 * Wired from plugin `registerCli` — not the same as chat `/passport`, but same behavior.
 */
export function registerPassportCli(program: Command): void {
  program
    .command("passport")
    .description("Passport Claw — show status, revoke local passport, or help")
    .argument("[subcommand]", "status | revoke | help (default: status)")
    .action(async (subcommand: string) => {
      const out = await handlePassportCommand({ args: (subcommand ?? "").trim() });
      const line = formatCliMessage(out.text ?? "");
      if (line) {
        process.stdout.write(`${line}\n`);
      }
      process.exit(out.isError ? 1 : 0);
    });
}
