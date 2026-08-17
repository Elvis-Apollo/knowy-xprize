#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
snapshot_dir="$project_dir/snapshots/v1-hardcoded-demo"

rsync -a --delete "$snapshot_dir/app/" "$project_dir/app/"
cp "$snapshot_dir/db/schema.ts" "$project_dir/db/schema.ts"
cp "$snapshot_dir/package.json" "$project_dir/package.json"
cp "$snapshot_dir/.openai/hosting.json" "$project_dir/.openai/hosting.json"

echo "Knowy v1 restored. Run npm install, then npm test."
