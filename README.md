# passport-claw-openclaw-plugin

TypeScript helpers for Passport Claw: issuer HTTP client, challenge JSON parse, demo file storage, `enrollFromCLI` / `statusCLI`.

## Install from this repo (not Crux)

Crux does **not** load the plugin. From this directory:

```bash
npm ci
npm run build
npm test
npm link
```

Then register the linked package in OpenClaw per **your** host version (`openclaw plugins`, path, or workspace). Manifest: `openclaw.plugin.json` → `./dist/index.js`.

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
