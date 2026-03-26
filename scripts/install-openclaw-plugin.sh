#!/usr/bin/env bash
# Install and enable this package in OpenClaw from the plugin repo root.
# The gateway must still be restarted so /passport registers (host loads plugins at startup).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "==> passport-claw-openclaw-plugin: npm ci"
npm ci
echo "==> npm run build"
npm run build
echo "==> openclaw plugins install -l $ROOT"
openclaw plugins install -l "$ROOT"
echo "==> openclaw plugins enable passport-claw"
openclaw plugins enable passport-claw
echo "==> Done. Restart the OpenClaw gateway (or process running it) so slash commands load."
echo "    Plugin id: passport-claw (from openclaw.plugin.json). Remove later: openclaw plugins uninstall passport-claw"
