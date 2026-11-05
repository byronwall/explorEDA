---
id: page-test-the-duckdb-install-path-from-a-clean-npx-install
label: Test the DuckDB install path from a clean npx install
type: page
status: implemented
parent: area-eval-process
metadata:
  implementation: "Tested 2026-11-05 from a packed tarball in a clean folder: the first DuckDB read fails with 'Run npm install @duckdb/node-api in the project folder', and after installing it the read works (store, 12 rows)."
  purpose: The eval ran the CLI from inside the repo, where @duckdb/node-api resolves as a dev dependency, so the 'npm install @duckdb/node-api' step was never seen.
---
