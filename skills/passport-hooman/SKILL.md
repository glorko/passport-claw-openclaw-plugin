---
name: passport-hooman
description: After Passport Claw is installed — guide the human operator in chat, prefer /passport over raw issuer HTTP, and use board help URLs when the stack exposes them.
---

## When this applies

Use this skill once the **Passport Claw** OpenClaw plugin is installed and enabled. The human is the **operator** who should see passport status and (in local dev) revoke for testing. Your job is to **explain clearly** and **avoid** walking them through low-level issuer REST unless they are debugging contracts.

## Setup (so `/passport` and `openclaw passport` exist)

Slash commands and the **`openclaw passport`** CLI are **not** available until the **gateway** loads this plugin. You cannot “enable” the plugin from chat alone.

If the human asks you to install it and your session **can run shell** in the cloned repo: run **`npm run install:openclaw`** (or `bash scripts/install-openclaw-plugin.sh`) from the plugin root, then tell them to **restart the OpenClaw gateway** (or the process that runs it). Without a terminal tool, give them that one command and the restart note. **Do not** rely on `npm link` alone if they need **`openclaw plugins uninstall`** to work — they need **`openclaw plugins install`** (the script uses `install -l`). The OpenClaw plugin **id** for enable/uninstall is **`passport-claw`** (see `openclaw.plugin.json`). The npm package name is **`passport-claw-plugin`**; CLI commands still use the **id** **`passport-claw`**.

## What to tell the human

1. **In-chat visibility:** They should use **`/passport`** (or `/passport info`) to see a short buddy label, full passport id, issuer base URL, and whether a local credential file exists. This is the primary way for a human to **read status** without curl.
2. **Enroll in-channel:** **`/passport enroll`** (or `register`) generates a key, calls the issuer, and saves the credential — same as **`openclaw passport enroll`** in a terminal. Issuer must be reachable; if a credential already exists, they must **`/passport revoke`** first.
3. **Help in-channel:** **`/passport help`** lists slash usage.
4. **Revoke only when appropriate:** **`/passport revoke`** (alias **`burn`**) calls the issuer revoke API and deletes the local credential. It is for **testing / intentional reset**, requires the issuer admin token in the environment (`ISSUER_ADMIN_TOKEN` or `PASSPORT_ISSUER_ADMIN_TOKEN` as documented). **Confirm** they understand before suggesting it.
5. **Do not** default to raw issuer HTTP for routine “what is my passport?” questions — use **`/passport`** first.

## Integrated sites (e.g. demo board)

If the human is using a **Passport-aware site** that returns a challenge or links to docs:

- Prefer pointing them to **`local_setup_guide_url`**, **`passport_help_url`**, or **`GET /api/passport-help`** when those appear in API responses — they contain **copy-paste plugin install** and operator-focused notes.
- Explain at a high level: the site may require a **presentation**; enrollment and proof flows are **separate** from “read my passport in chat” — the plugin gives **operator visibility**; agent-driven HTTP may still need presentation headers depending on the stack (see product docs).

## Environment (for accurate answers)

- **`ISSUER_BASE_URL`** — issuer API base (defaults are dev-oriented if unset).
- **`PASSPORT_PLUGIN_DATA_DIR`** — optional override for the credential directory. Default is **`~/.openclaw/passport-claw`** (or **`$OPENCLAW_STATE_DIR/passport-claw`**) so gateway + CLI agree; do not assume `./.passport-claw-plugin` relative to shell cwd.
- **Admin token** — only relevant for **revoke**, not for normal read-only `/passport`.

## Tone

Be concise, friendly, and safety-aware. If unsure about a specific host’s enrollment UI, say so and lean on **`/passport`** plus any **`passport_help_url`** / setup guide URL from the challenge or board API.
