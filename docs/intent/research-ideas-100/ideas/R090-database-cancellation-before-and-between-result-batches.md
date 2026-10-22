# R090 — Database cancellation before and between result batches

- ID: R090
- Category: Local and database workflows
- Priority: 28
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A complete snapshot can take time before the first row is available, especially for an expensive query. The shared database API already accepts an abort signal and a timeout; its contract tests include cancellation, and PostgreSQL has a dedicated slow-query timeout test. Driver implementations nevertheless differ: SQLite uses synchronous statements with pauses between batches, while DuckDB prepares and begins streaming before installing its interruption listener. These are reasons to measure phase-specific behavior, not proof that cancellation universally fails.

Compare a common documented cancellation contract backed by each driver's native timeout with a stronger interruptible execution wrapper for only the driver that demonstrably needs it. A simpler option is truthful phase feedback that distinguishes cancellation requested from work stopped. Separate connection setup, query preparation, first-row delay, and iteration. Avoid adding a SQL parser or changing query semantics to simulate cancellation. The right guarantee must include cleanup and publication rules, not merely an exception with the expected error code.

Run one intentionally slow query per supported driver in disposable local fixtures. Cancel at connection, preparation, first result, and a later batch; repeat with the timeout firing first. Record when the caller settles, whether the server remains responsive, whether sessions close, and whether any partial snapshot becomes visible. Acceptance requires a bounded and honestly reported stop behavior with the previous snapshot preserved. Reject a universal interruption layer if native timeouts plus limited phase feedback satisfy the actual workload, or if the stronger route adds disproportionate process-management cost.

This is a high-confidence follow-up to shipped database-adapters, whose existing contract provides the starting point. The packet contains driver and test source, but database services were not started and conditional integration tests were not run. API impact can remain small if cancellation terminology and error distinctions suffice. The research earns a place because users must be able to recover from an ordinary expensive read, while a solo maintainer needs evidence before accepting worker processes or driver-specific execution infrastructure.

## References

- `packages/explorEDA/src/server/sources/types.ts` — `DatabaseSession`, `ReadCursor`, `ReadLimits`. Defines cancellable reads and session cleanup.
- `packages/explorEDA/src/server/sources/read.ts` — `readSnapshot`. Creates timeout/cancellation signals and checks them around iteration.
- `packages/explorEDA/src/server/sources/drivers/sqlite.ts` — `SqliteSession`, `read`. Runs synchronous SQLite operations and yields between batches.
- `packages/explorEDA/src/server/sources/drivers/duckdb.ts` — `DuckdbSession`, `read`. Prepares and streams results, then installs an interruption listener.
- `packages/explorEDA/src/server/sources/drivers/postgres.test.ts` — `stops a query that runs past its time`. Existing real-driver timeout test, conditional on its database fixture.
- `docs/intent/database-adapters/intent-brief.md` — related intent; status reconciled against implementation in the brief.
