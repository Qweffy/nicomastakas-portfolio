#!/usr/bin/env bash
# PreToolUse(Edit|Write): hard-deny writes to env/secret files, even if a CLAUDE.md rule is ignored.
# Defense in depth alongside .gitignore + gitleaks/GitHub push protection.
set -euo pipefail

file_path=$(jq -r '.tool_input.file_path // empty')
[ -z "$file_path" ] && exit 0

# Always allow the committed template.
case "$file_path" in
  *.env.example) exit 0 ;;
esac

case "$file_path" in
  *.env | *.env.* | */secrets/* | *.pem | *.key | *.p12 | *.keystore)
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked write to a secret/env file (%s). Put real secrets in .env.local or the Vercel dashboard."}}\n' "$file_path"
    exit 0
    ;;
esac

exit 0
