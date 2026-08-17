#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
snapshot_dir="$project_dir/snapshots/v2-dynamic-mock"

rsync -a --delete "$snapshot_dir/app/" "$project_dir/app/"
cp "$snapshot_dir/db/schema.ts" "$project_dir/db/schema.ts"
cp "$snapshot_dir/package.json" "$snapshot_dir/package-lock.json" "$snapshot_dir/README.md" "$project_dir/"
cp "$snapshot_dir/tests/rendered-html.test.mjs" "$project_dir/tests/rendered-html.test.mjs"
cp "$snapshot_dir/.openai/hosting.json" "$project_dir/.openai/hosting.json"

echo "Knowy v2 restored. Run npm install, then npm test."
