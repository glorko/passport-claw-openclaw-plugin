# passport-claw-openclaw-plugin

TypeScript helpers for Passport Claw: issuer HTTP client, challenge JSON parse, demo file storage, `enrollFromCLI` / `statusCLI`.

## Install (dev)

```bash
npm ci
npm run build
npm test
```

Link into OpenClaw per host docs (`openclaw plugins` / path install). Manifest: `openclaw.plugin.json` → `./dist/index.js`.

## Env

- `ISSUER_BASE_URL` — overrides default `http://127.0.0.1:8081`
- `DEFAULT_ISSUER_BASE_URL` — fallback if unset
- `PASSPORT_PLUGIN_DATA_DIR` — credential file directory (default `./.passport-claw-plugin`)

## Security

No verifier API key in plugin. Credential is demo-grade local file (see architecture doc).

## Contracts

`../passport-claw-contracts/openapi/issuer.yaml`
