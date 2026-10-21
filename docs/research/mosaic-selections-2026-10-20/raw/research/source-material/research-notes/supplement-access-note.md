# Exact-baseline repository supplements

Following the selected packet's semantic imports required eleven additional files. All were retrieved read-only at `9b16d78e3ed0742ed4d5858c1939fec9e758b510`, kept separate from the packet, and matched to their original Git blob SHA. `repo-supplement-access.json` gives exact paths/URLs, sizes, SHA-256 and read status.

They close these semantic gaps: aggregate/entity reduction; UTC rollups; workspace Rows; project result/row-key adaptation; field compatibility; saved-view history/session/duplication; and daily corpus test structure. Ten were fully read; `savedViewsHistory.ts` was read in relevant excerpts with its test file read fully. Unrelated corpus data and peripheral UI shells remain outside the audit.

No separate blanket redistribution grant was established for these files outside the user-provided packet. Their full source is omitted from the deliverable. The primary citations and hashes remain available for Codex to retrieve from the exact checkout. Short identifiers/excerpts identify the seams without reproducing entire implementations:

- `analysisRowKeys.ts`: `mapIdFilters`
- `aggregates.ts`: `summarizeGroup` and `poolAggregateRows`
- `dailyRollup.ts`: `utcDay` and `utcPeriod`
- `RowsView.tsx`: `RowsView`

These names support navigation; the original research notes and report explain the observed behavior. Existing tests were read as specifications and were not run. The missing-source gate is closed for the required semantic paths; the snapshot still is not a complete runnable repository.
