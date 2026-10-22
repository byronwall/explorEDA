# R099 — Checkpoint representation for fast and recoverable browser history

- ID: R099
- Category: Import, export, and persistence
- Priority: 41
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Browser sessions already provide history, skip unchanged checkpoints, cap the history at fifty entries, and separate source rows from frequent session writes. Tests protect branch remapping and the joint capture of query bindings and definitions. The remaining question concerns growing analytical definitions rather than repeatedly storing raw data. Many views, compositions, or project query definitions can make each complete checkpoint substantial. The historical matrix performance note also identifies demo history serialization among release costs, but its timing is not a current measurement for every session.

Compare the existing complete snapshots with deduplicated immutable definitions referenced by checkpoints. Another viable alternative is to retain the simple representation and change when or where persistence happens, only if measured synchronous work causes delay. Patch histories may be compact but require more recovery logic and should not be presumed better. Keep undo branches, deliberate action labels, shared definitions, and current bindings together. Evaluate storage refusal and interrupted persistence alongside speed; a faster history that cannot clearly restore the last saved analytical state would be a poor trade.

Build sessions with increasing view, composition, and project-definition complexity up to the existing fifty-checkpoint bound, then measure serialization, storage writes, and complete filter/edit latency. Reload after normal writes and injected refusal, and verify current state, undo, and an abandoned branch against the original snapshots. Accept a change only if it reduces material task delay while retaining exact recovery and explicit save-failure reporting. Reject a compact representation when snapshot costs are already small, when deduplication obscures ownership, or when recovery needs substantially more code than the benefit justifies.

This high-confidence follow-up concerns the shipped browser workflow, with links to browser-only-site and current-analysis-trust. It is separate from local-folder autosave and does not request history as a new feature. The scale of the opportunity remains unmeasured in this packet. Public saved settings should stay unchanged unless the experiment proves an internal representation insufficient. A solo maintainer benefits from a decisive keep-or-change study here because history lies on common interactions and recovery matters as much as an attractive serialization benchmark.

## References

- `docs/scatter-matrix-performance.md` — `Releasing a brush`. Historical profile identifies demo history serialization among large selection-release costs; not a fresh measurement.

- `apps/demo/src/savedViewsSession.ts` — `HISTORY_LIMIT`, `writeSourceAnalysis`, `readSavedViewsSessionResult`. Caps and validates sessions and stores source rows separately.
- `apps/demo/src/savedViewsHistory.ts` — `pushCheckpoint`, `classifyChange`. Clones complete checkpoints, skips unchanged state, and remaps retained history branches.
- `apps/demo/src/SavedViewsWorkspace.tsx` — `sessionWithoutRows`, `encoded`, `setSaveError`. Serializes session state separately from source rows and reports write failures.
- `apps/demo/src/savedViewsHistory.test.ts` — `remaps parents when the oldest checkpoint drops`, `checkpoints query bindings and definitions together`. Already protects bounded history structure and coupled project state.
- `docs/intent/browser-only-site/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
