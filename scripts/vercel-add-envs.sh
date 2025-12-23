#!/usr/bin/env bash
# Read .env.local and create vercel CLI env add commands for production.
# Usage: 
# 1) run `npx vercel login` to authenticate
# 2) run `bash scripts/vercel-add-envs.sh` to print commands
# 3) optionally pipe into bash to run (careful with secrets)

set -euo pipefail
ENV_FILE=".env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "No $ENV_FILE found in repo root. Create it first." >&2
  exit 1
fi

echo "# This script will run npx vercel env add for each variable in $ENV_FILE (Production)."
read -p "Proceed and add these env vars to Vercel production? (y/N) " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted by user. You can still print the commands by running: cat $ENV_FILE | grep -v '^#' | sed -E 's/(.*)=.*/npx vercel env add \"\1\" production <<<'\"\2\"'/'""
  exit 0
fi

# Loop through non-empty, non-comment lines
while IFS= read -r line || [ -n "$line" ]; do
  # skip comments and empty
  [[ -z "$line" ]] && continue
  [[ "$line" =~ ^# ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  # Skip if key matches NEXTAUTH_DEBUG (development-only)
  if [[ "$key" == "NEXTAUTH_DEBUG" ]]; then
    echo "Skipping $key (development-only flag)"
    continue
  fi
  # Use heredoc to avoid shell escaping issues
  echo "Adding $key to Vercel (Production)..."
  npx vercel env add "$key" production <<EOF
$value
EOF
  echo "$key added."
done < "$ENV_FILE"

echo "Done. Verify your environment variables in the Vercel Dashboard."
