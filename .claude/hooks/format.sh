#!/usr/bin/env bash
# PostToolUse(Edit|Write): format the written file with Prettier so diffs stay clean.
set -euo pipefail

file_path=$(jq -r '.tool_input.file_path // empty')
[ -z "$file_path" ] && exit 0

case "$file_path" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.css | *.md | *.mdx)
    pnpm exec prettier --write "$file_path" >/dev/null 2>&1 || true
    ;;
esac

echo '{"suppressOutput":true}'
