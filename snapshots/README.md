# Knowy snapshots

`v1-hardcoded-demo` preserves the original single-topic Acme MVP from before dynamic retrieval was added.

Restore it from the project root with `./scripts/restore-v1.sh`, then run `npm install` and `npm test`. The snapshot intentionally excludes generated folders, local database files, environment variables, and dependencies.

`v2-dynamic-mock` preserves the four-topic dynamic retrieval version from immediately before the real GitHub connector was added.

Restore it from the project root with `./scripts/restore-v2.sh`, then run `npm install` and `npm test`.
