#!/usr/bin/env bash
# Watch public DNS for trymesh.chat. When it points here, reload Caddy
# with TLS so Let's Encrypt can issue certs.
set -euo pipefail

TARGET_IP="${TARGET_IP:-3.147.110.147}"
CONFIG_TLS="${CONFIG_TLS:-/workspace/Caddyfile}"

echo "[dns-watch] waiting for trymesh.chat A -> ${TARGET_IP}"

while true; do
  resolved="$(getent ahostsv4 trymesh.chat 2>/dev/null | awk '{print $1; exit}' || true)"
  echo "[dns-watch] trymesh.chat -> ${resolved:-none}"
  if [ "${resolved}" = "${TARGET_IP}" ]; then
    echo "[dns-watch] DNS is live. Enabling HTTPS."
    caddy reload --config "${CONFIG_TLS}" --adapter caddyfile
    echo "[dns-watch] reloaded. checking https://trymesh.chat/"
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      if curl -fsS --max-time 10 https://trymesh.chat/ >/dev/null; then
        echo "[dns-watch] https://trymesh.chat is up"
        exit 0
      fi
      sleep 6
    done
    echo "[dns-watch] DNS is correct but HTTPS is not ready yet. Caddy will keep retrying certs."
    exit 0
  fi
  sleep 20
done
