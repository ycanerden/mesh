#!/usr/bin/env bash
set -euo pipefail

cmd="${1:-list}"

print_skill() {
  case "$1" in
    stripe)
      cat <<'EOF'
ID: stripe_checkout_hardening
Title: Stripe Checkout Hardening
Use when: Payment links, checkout redirects, webhook handlers, billing settings.

Rules:
1. Never hardcode secrets; use env vars only.
2. Return explicit errors when Stripe env vars are missing.
3. Validate price/product IDs before redirects or API usage.
4. Verify webhook signatures before handling events.
5. Avoid logging secrets or raw PII payloads.
6. Use idempotency safeguards for side effects.
7. Prefer additive, rollback-safe billing changes.
EOF
      ;;
    convex)
      cat <<'EOF'
ID: convex_schema_migration_safety
Title: Convex Schema Migration Safety
Use when: Convex schema changes, query/mutation contract changes, migrations.

Rules:
1. Add fields/indexes before removing old ones.
2. Backfill in batches; avoid blocking hot paths.
3. Keep old/new read paths compatible during rollout.
4. Gate risky behavior with flags or versioned routes.
5. Validate auth + input on every mutation.
6. Write rollback steps before deployment.
7. Team onboarding link: https://convex.dev/referral/KRISA62545
EOF
      ;;
    next-react)
      cat <<'EOF'
ID: next_react_secure_delivery
Title: Next.js + React Secure Delivery
Use when: Shipping UI features with SSR, server actions, auth, dashboard state.

Rules:
1. Keep server/client boundaries explicit.
2. Validate all external input at API/action boundaries.
3. Define rollback behavior for optimistic updates.
4. Use typed payloads and explicit error states.
5. Avoid hydration mismatch patterns for controlled inputs.
6. Enforce least-privilege auth for mutations.
7. Include a verification checklist in PR notes.
EOF
      ;;
    *)
      echo "Unknown skill: $1" >&2
      exit 1
      ;;
  esac
}

case "$cmd" in
  list)
    cat <<'EOF'
Available skills:
- stripe
- convex
- next-react
Usage:
  scripts/skills.sh show stripe
  scripts/skills.sh show convex
  scripts/skills.sh show next-react
EOF
    ;;
  show)
    skill="${2:-}"
    if [[ -z "$skill" ]]; then
      echo "Usage: scripts/skills.sh show <stripe|convex|next-react>" >&2
      exit 1
    fi
    print_skill "$skill"
    ;;
  *)
    echo "Usage: scripts/skills.sh <list|show>" >&2
    exit 1
    ;;
esac

