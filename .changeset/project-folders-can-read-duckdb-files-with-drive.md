---
"exploreda": minor
---

Project folders can read DuckDB files with `driver=duckdb`. DuckDB's library isn't bundled; the first read says to run `npm install @duckdb/node-api` in the project folder. Fixes a crash in the built `exploreda` command when a database driver loads.
