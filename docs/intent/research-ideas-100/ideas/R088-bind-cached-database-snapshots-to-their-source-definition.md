# R088 — Bind cached database snapshots to their source definition

- ID: R088
- Category: Local and database workflows
- Priority: 13
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Database sources are already implemented for five drivers, with explicit refresh and cached complete snapshots. `SnapshotInfo` records a source ID, connection, driver, read time, schema, and row count. `refreshSource` also shares overlapping reads using the resolved project root and source ID. A source can retain its ID while its SQL or connection changes. The research question is whether the resulting snapshot remains unambiguously tied to the definition that produced it, particularly during an in-flight edit or failed refresh.

Compare storing a compact normalized definition fingerprint with checking the current definition when a completed read is published. A simpler alternative is to invalidate the cached binding whenever the owning declaration changes and require an explicit refresh. Preserve the useful ability to inspect the last successful snapshot after a transient database failure. Separate an old snapshot of the same query from a snapshot of a different query; age alone cannot express that difference. No global version service or multiple runtime schema versions are needed.

Start with one table source and one SQL source. Begin a refresh, change the SQL predicate or connection declaration, and complete the original read afterward. Repeat with a failed new read and a project reopen. Inspect stored metadata, loaded rows, visible source description, and whether overlapping callers receive a result for the definition they requested. Accept a design when each dataset has a clear producing definition and incompatible results cannot masquerade as current. Reject extra metadata if existing reload behavior already guarantees that property across the supported sequences.

This is a high-confidence robustness follow-up to the delivered database-adapters initiative. The older database-query-contract brief was reframed toward oversized sources; this candidate addresses current complete snapshots and does not restart remote query infrastructure. Cost should be a small metadata and publication decision, but migration of existing snapshot files would need deliberate handling if pursued. No ambiguous result has been reproduced in this review. The opportunity earns priority because source identity underpins charts, traces, and any later reproducibility claim.

## References

- `packages/explorEDA/src/lib/project/snapshots.ts` — `SnapshotInfo`, `SnapshotFile`, `parseSnapshot`. Stores source ID, connection, driver, read time, fields, counts, and rows.
- `packages/explorEDA/src/server/sources/refresh.ts` — `refreshSource`, `readAndWrite`. Deduplicates concurrent reads by resolved root and source ID and preserves the previous file on failure.
- `packages/explorEDA/src/server/sources/refresh.test.ts` — `shares one read between refreshes that overlap`, `keeps the last snapshot when a read fails`. Already checks shared reads and failure preservation.
- `packages/explorEDA/src/lib/project/folder.ts` — `readProjectFolder`. Loads project definitions and saved source snapshots.
- `docs/intent/database-adapters/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/database-query-contract/intent-brief.md` — related intent; status reconciled against implementation in the brief.
