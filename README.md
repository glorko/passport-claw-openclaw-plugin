# passport-claw-openclaw-plugin

TypeScript helpers for Passport Claw: issuer HTTP client, challenge JSON parse, demo file storage, `enrollFromCLI` / `statusCLI`.

## Install from this repo (not Crux)

Crux does **not** load the plugin. **`/passport` is registered by the OpenClaw gateway** when it loads this plugin — the LLM cannot inject a Node plugin into the host by chatting alone. After install, **restart the gateway** so commands appear.

### Plugin id (enable / uninstall / list)

OpenClaw uses the **`id`** from `openclaw.plugin.json` — **`passport-claw`**. That is **not** the same as the npm package name (`passport-claw-openclaw-plugin`). Use **`passport-claw`** for:

- `openclaw plugins enable passport-claw`
- `openclaw plugins disable passport-claw`
- `openclaw plugins uninstall passport-claw`

`openclaw plugins list` shows this under the **ID** column.

### Why uninstall said “Plugin not found”

OpenClaw only tracks plugins that were installed with **`openclaw plugins install`** (or equivalent). If you only **`npm link`**’d the package, hand-edited config, or never ran install on this machine, there is **no install record**, so **`uninstall <id>`** cannot find it. Fix: run **`npm run install:openclaw`** (or `openclaw plugins install -l "$(pwd)"` after build) once, then uninstall works.

**One command** (from this repo root, `openclaw` on `PATH`):

```bash
npm run install:openclaw
```

Equivalent manual steps: `npm ci` → `npm run build` → `openclaw plugins install -l "$(pwd)"` → `openclaw plugins enable passport-claw`.

If your OpenClaw agent session **can run shell** (`exec` / terminal tool), you can ask it to run `npm run install:openclaw` here after `git clone`. It still cannot skip **restarting the gateway** — that’s the process that loads plugins.

For development: `npm test`, and `npm link` only if you prefer linking over `install -l` — but for a **removable** install, prefer **`openclaw plugins install -l "$(pwd)"`** so OpenClaw records the plugin.

### Remove

```bash
openclaw plugins uninstall passport-claw
```

Use `--force` to skip the confirmation prompt. If you used **`--link`** (`-l`), OpenClaw keeps a link to your tree; uninstall clears the OpenClaw install entry (your repo files stay on disk).

## Agent skill (operator guidance)

With the plugin **enabled**, OpenClaw loads the **`passport-hooman`** skill from `skills/passport-hooman/SKILL.md`. It teaches the model to guide **humans** after install: prefer **`/passport`** over raw issuer HTTP, explain revoke cautions, and use board **`passport_help_url` / `GET /api/passport-help`** when integrating with the demo stack.

## Terminal CLI (`openclaw passport`)

With the plugin **enabled**, OpenClaw registers a top-level CLI command (via `registerCli`):

```bash
openclaw passport           # same as status — show buddy id, issuer, credential presence
openclaw passport status
openclaw passport revoke    # burn on issuer + delete local credential (testing)
openclaw passport help
```

This mirrors chat **`/passport`**; use whichever surface your session runs.

## OpenClaw slash commands

After the plugin is loaded, the gateway registers **`/passport`**:

| Input | Behavior |
|--------|----------|
| `/passport` or `/passport info` | Prints a cute **buddy name** (pet id) derived from your passport UUID, full passport id, issuer URL, and whether a local credential file exists. |
| `/passport revoke` (alias `burn`) | Calls issuer **`POST /v1/passports/{id}/revoke`** with the admin header, then **deletes** the local credential file. For **local testing**; anyone with the admin token can revoke. |
| `/passport help` | Short usage text. |

Requires a **`register()`** export (implemented in `src/index.ts`). Rebuild (`npm run build`) after changes; restart the gateway so commands reload.

## Env

- `ISSUER_BASE_URL` — overrides default `http://127.0.0.1:19081`
- `DEFAULT_ISSUER_BASE_URL` — fallback if unset
- `PASSPORT_PLUGIN_DATA_DIR` — credential file directory (default `./.passport-claw-plugin`)
- `ISSUER_ADMIN_TOKEN` or `PASSPORT_ISSUER_ADMIN_TOKEN` — value for `X-Passport-Issuer-Admin` on **revoke** (default `dev_admin_token_local` to match local issuer)

## Local stack (hardcoded for dev)

The package exports `LOCAL_PASSPORT_STACK`, `localSetupGuideUrl()`, and `localPassportHelpUrl()` (`src/localDefaults.ts`) matching default Crux ports. Use them in tooling; `getIssuerBaseUrl()` still reads env first.

## Security

No verifier API key in plugin. Credential is demo-grade local file (see architecture doc).

## Contracts

`../passport-claw-contracts/openapi/issuer.yaml`
