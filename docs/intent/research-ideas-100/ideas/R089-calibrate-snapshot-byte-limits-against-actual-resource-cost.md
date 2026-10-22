# R089 — Calibrate snapshot byte limits against actual resource cost

- ID: R089
- Category: Local and database workflows
- Priority: 36
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The database reader already refuses results that exceed row, byte, or time limits and publishes a snapshot only after a complete successful read. `sizeOf` supplies a rough per-value byte estimate, while normalized typed columns and the final JSON snapshot are created afterward. Default limits therefore express an operational approximation, not a measured browser-memory ceiling. The useful research question is how that approximation behaves for realistic wide rows, multibyte text, and values whose serialized representation grows during conversion.

Compare a conservative revised estimate with exact encoded-byte accounting at a defined boundary. A third option is to keep the existing estimate but rename and document its meaning while separately measuring peak resident memory. Do not collapse wire bytes, JSON characters, decoder allocations, and provider memory into one supposedly exact number. Determine which resource actually causes unacceptable behavior in the local or team workflow. A limit should help an analyst choose a narrower complete source, not encourage silent truncation or arbitrary partial results.

Use equal row counts with short ASCII strings, long Unicode strings, wide schemas, precise decimal values, and nested JSON text. Record estimated bytes, serialized UTF-8 bytes, peak memory during conversion, and time to refusal or completion. Test just below and above the chosen boundary and confirm that a failed read leaves the previous snapshot unchanged. Acceptance requires a documented resource meaning and bounded estimation error for representative workloads. Reject exact accounting if a cheap conservative estimate already protects the relevant capacity with much less complexity or duplicated serialization.

This is a focused robustness follow-up to database-adapters and a prerequisite measurement for any serious columnar-data-transport comparison. It does not question the already delivered complete-or-refuse policy. Confidence is high that the estimator deserves calibration, but the magnitude and direction of practical error remain unmeasured. The likely maintenance cost is small if the result is an explicit budget contract and a few fixtures. It earns its place because capacity claims affect whether users trust a loaded source to be both complete and usable.

## References

- `packages/explorEDA/src/server/sources/read.ts` — `readSnapshot`, `sizeOf`. Enforces all-or-nothing limits using an approximate per-value byte estimate before typed conversion.
- `packages/explorEDA/src/lib/project/snapshots.ts` — `DEFAULT_ROW_LIMIT`, `DEFAULT_BYTE_LIMIT`, `SnapshotFile`. Defines default row and byte budgets and the row-array snapshot representation.
- `packages/explorEDA/src/server/sources/contract.ts` — `runSourceContract`, `refuses more bytes than the limit`. Already checks byte-limit refusal and complete table reads.
- `packages/explorEDA/src/server/sources/refresh.ts` — `readAndWrite`. Serializes the completed normalized snapshot before atomic publication.
- `docs/intent/database-adapters/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/columnar-data-transport/intent-brief.md` — related intent; status reconciled against implementation in the brief.
