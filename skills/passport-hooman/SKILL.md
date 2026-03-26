---
name: passport-hooman
description: After Passport Claw is installed — guide operators on /passport, board help URLs, and (until an outbound hook exists) when to add X-Passport-Agent / X-Passport-Presentation on fetches to integrated sites only.
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

## Outbound HTTP for the *agent* (no automatic hook yet)

The Passport plugin **does not** inject headers into every OpenClaw **`web_fetch`**, browser tool, or shell **`curl`**. Until an **outbound / fetch hook** ships, **you** (the agent) must follow these rules when the task clearly involves a **Passport-integrated** API (demo board, site named in a **401 challenge**, or URL the human said is Passport-aware):

### When to add headers

1. **Scope (critical):** Add Passport headers **only** to requests to that **integrated host** (or exact API base the challenge names). **Do not** attach `X-Passport-*` to arbitrary third-party URLs, analytics, or unrelated tools — avoids leaking intent and keeps credentials off the wrong wire.
2. **First try (agent classification / challenge path):** On `POST` or other writes where the stack expects “agent” traffic, include a non-empty **`X-Passport-Agent`** header. Default value: **`openclaw`** unless the challenge JSON, board docs, or human specifies another marker. This header is a **hint**, not cryptographic proof.
3. **After `401` + challenge body:** Read the response body for **`issuer_base_url`** / **`passport_docs_url`** / structured challenge fields. The human (or you via shell) must already have enrolled — **`/passport`** should show a passport id. To obtain a **presentation**:
   - Read the **stored credential** from the plugin data path (default **`~/.openclaw/passport-claw/passport-credential.json`**) only on the **operator machine** when your session is allowed to read it — **never** paste the full JWS into chat or send it to unrelated hosts.
   - **`POST {issuer}/v1/presentation-tokens`** with JSON body using either **`credential`** (JWS string from that file) or **`passport_id`** per issuer API; use the **`audience`** / binding fields if the challenge requires them.
   - Retry the **original** request to the **same** integrated host with header **`X-Passport-Presentation: <compact JWS>`** from the mint response.
4. **Tools:** Prefer whatever tool your host exposes that supports **custom headers** (e.g. fetch with `headers`). For **`curl`**, use **`-H 'X-Passport-Agent: openclaw'`** and **`-H 'X-Passport-Presentation: …'`** on the retry. If the tool cannot set headers, say so and ask the human to run a header-capable command or wait for the outbound hook.
5. **Safety:** Do not send **`X-Passport-Issuer-Admin`** except for documented **issuer revoke** flows (operator-only). Do not treat **`X-Passport-Agent`** alone as proof of identity when explaining trust to the human.

### Summary line for the human

> “The plugin doesn’t auto-attach headers to every request yet; for Passport sites, your agent should send **`X-Passport-Agent: openclaw`** on agent-classified calls, then **`X-Passport-Presentation`** after minting from the issuer when the board returns **401**.”

## Environment (for accurate answers)

- **`ISSUER_BASE_URL`** — issuer API base. Defaults to **local** `http://127.0.0.1:19081` if unset. For the **public staging** stack, the human should set it to **`https://issuer-staging.up.railway.app`** (see plugin README `STAGING_PASSPORT_STACK`) before enrolling.
- **`PASSPORT_PLUGIN_DATA_DIR`** — optional override for the credential directory. Default is **`~/.openclaw/passport-claw`** (or **`$OPENCLAW_STATE_DIR/passport-claw`**) so gateway + CLI agree; do not assume `./.passport-claw-plugin` relative to shell cwd.
- **Admin token** — only relevant for **revoke**, not for normal read-only `/passport`.

**Staging URLs (reference):** issuer `https://issuer-staging.up.railway.app`, verifier `https://verifier-staging-e555.up.railway.app`, demo board `https://demo-forum-staging.up.railway.app`, setup page `/passport-local.html` on that board host.

## Tone

Be concise, friendly, and safety-aware. If unsure about a specific host’s enrollment UI, say so and lean on **`/passport`** plus any **`passport_help_url`** / setup guide URL from the challenge or board API.
