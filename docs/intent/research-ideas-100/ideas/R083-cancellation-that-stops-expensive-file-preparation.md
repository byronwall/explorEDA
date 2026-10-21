# R083 — Cancellation that stops expensive file preparation

- ID: R083
- Category: Measured performance
- Priority: 47
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A user who drops an unexpectedly large workbook should be able to stop preparation without losing the analysis already open. `ReadTableOptions` already accepts an `AbortSignal`, and `readTableFile` checks it before and after whole-file reads and binary decoder calls. The existing test covers an aborted request. The unresolved issue is how much expensive work continues after cancellation during a decoder phase, and whether that work blocks interaction. Source checks alone do not establish a responsiveness defect.

Compare retaining phase-boundary cancellation with running the expensive decoder in a worker that can be terminated. For delimited text, chunked parsing may be a smaller third route. Measure formats independently; a single universal streaming abstraction could cost more than it saves. Distinguish cancelling file I/O, stopping decoding, abandoning type inference, and refusing to publish a stale result. The interface should make a concrete promise about these phases without pretending that an abort signal can interrupt arbitrary synchronous library code.

Use a narrow CSV, a wide CSV, and a workbook whose decoder dominates preparation. Cancel before reading, after bytes arrive, during decoding, and just before the host receives the result. Record input latency, time until work stops, retained allocations, and whether the existing workspace remains unchanged. Acceptance requires prompt visible cancellation and no publication of an abandoned result, with an explicit bound on any unavoidable cleanup. Reject a worker or streaming redesign if representative costly phases already stay below the chosen responsiveness threshold or if transfer copies erase the benefit.

This is a robustness study related to browser-only-site and the measurement discipline of columnar-data-transport, not their full implementation scope. A worker adds packaging and error-propagation obligations; chunking adds partial-parser state. Confidence is high in the need to measure the current boundary, while expected file sizes and actual delays remain unknown. A useful outcome could simply be better phase feedback and a documented capacity limit. The candidate earns its place because it addresses recoverability during ordinary local data preparation.

## References

- `packages/explorEDA/src/lib/readers/readTable.ts` — `readTableFile`, `throwIfAborted`, `blobBytes`, `blobText`. Checks cancellation before and after file/decoder phases.
- `packages/explorEDA/src/lib/readers/types.ts` — `ReadTableOptions`, `TableReadError`. Defines the existing signal and failure contract.
- `packages/explorEDA/src/lib/readers/readers.test.ts` — `stops when the signal is aborted`. Already covers an aborted reader request.
- `docs/intent/browser-only-site/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/columnar-data-transport/intent-brief.md` — related intent; status reconciled against implementation in the brief.
