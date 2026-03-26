import type { Command } from "commander";
import { handlePassportCommand } from "./passportCommand.js";

/** Strip markdown for terminal output (bold + code fences around ASCII art). */
function formatCliMessage(text: string): string {
  return text.replace(/\*\*/g, "").replace(/```/g, "");
}

/**
 * Registers `openclaw passport [subcommand]` (status | enroll | revoke | help).
 * Wired from plugin `registerCli` — not the same as chat `/passport`, but same behavior.
 * `hostConfig` is the OpenClaw config snapshot from `register(api)` (agent name / workspace).
 */
export function registerPassportCli(program: Command, hostConfig?: unknown): void {
  program
    .command("passport")
    .description("Passport Claw — show status, revoke local passport, or help")
    .argument("[subcommand]", "status | enroll | revoke | help (default: status)")
    .action(async (subcommand: string) => {
      const out = await handlePassportCommand({
        args: (subcommand ?? "").trim(),
        config: hostConfig,
      });
      const line = formatCliMessage(out.text ?? "");
      if (line) {
        process.stdout.write(`${line}\n`);
      }
      process.exit(out.isError ? 1 : 0);
    });
}
