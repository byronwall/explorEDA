# R091 — Local database readiness with optional native dependencies

- ID: R091
- Category: Local and database workflows
- Priority: 68
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Local database support is already delivered: SQLite uses Node's built-in database API, and DuckDB loads an optional native package rather than installing it for every user. `loadDuckdb` searches beside explorEDA and then in the project; SQLite checks for statement metadata support. These are sensible lightweight choices, but an analyst opening a project on another machine may encounter a missing package, an unsupported runtime capability, or a native load failure before seeing any rows. The question is how to make that recovery predictable.

Compare a small source-readiness diagnostic with the current approach of reporting prerequisites when a connection opens. A third alternative is a precise installation example plus an actionable error category, without any new command. Distinguish missing dependencies from packages that exist but cannot load, and runtime version from runtime capability. Keep the default installation lean. The research should not propose automatically downloading native libraries, adding every driver to dependencies, or maintaining a general environment-management subsystem merely to improve one local workflow.

In a complete checkout, pack the CLI and try a tiny SQLite and DuckDB project in clean supported Node environments using pnpm. Test the optional package absent, installed in the project, and present but incompatible, then record the error and exact recovery steps. Acceptance means a user can identify the real prerequisite and recover without touching data or installing unused drivers. Reject a new diagnostic command if existing errors and a focused documented example already solve the cases, or if the diagnostic itself duplicates fragile package-resolution logic.

This is a medium-confidence follow-up to database-adapters and the shipped local mode. Source inspection establishes the prerequisite paths; cross-platform packaging and native loading were not exercised. API impact should be limited to diagnostics and documentation, with no change to database semantics. The current source contains installation wording that a future investigation should align with the repository's pnpm convention when proposing commands. The candidate earns its place by reducing first-use friction for real local analysis while preserving the project's low-administration design.

## References

- `packages/explorEDA/src/server/sources/drivers/sqlite.ts` — `SqliteSession`, `sqliteDriver`. Checks for column metadata support and opens files read-only.
- `packages/explorEDA/src/server/sources/drivers/duckdb.ts` — `loadDuckdb`, `duckdbDriver`. Resolves DuckDB beside explorEDA or in the project and gives a missing-package error.
- `packages/explorEDA/src/server/sources/refresh.ts` — `DRIVERS`, `lazyDriver`. Loads non-SQLite driver implementations lazily.
- `packages/explorEDA/tsup.config.ts` — `external`, `target`. Supplemental baseline GitHub build source keeps DuckDB external and defines the CLI build target.
- `docs/intent/database-adapters/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/runtime-modes/intent-brief.md` — related intent; status reconciled against implementation in the brief.
