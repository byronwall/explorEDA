# R077 — Selection identity when source rows are replaced

- ID: R077
- Category: Embedding and package contracts
- Priority: 3
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Refreshing a dataset should not quietly change which record a saved point selection denotes. Plain rows receive positional IDs in `initializeData`, while project sources already derive stable typed keys where entity keys are unique. `projectIdentity.test.tsx` protects selection through source reorder and removal. Duplicate or missing project keys deliberately fall back to positional identity. These are different documented mechanisms; the research concerns their boundary during immutable data replacement, without claiming that all existing selections are unstable.

Compare explicit invalidation of row-specific selections when an unkeyed snapshot changes with an optional stable-key input for plain embedded workspaces. A third practical alternative is to direct hosts needing persistence to the existing project source model. Define identity separately from equal-looking values: two repeated observations can be distinct records. Determine what should happen when a previously unique key becomes duplicated, a selected record disappears, or a relationship expansion changes the output grain while the source key remains unchanged.

Start with a dozen records whose names repeat but keys differ. Save point, table, and workspace selections, then reorder, append, delete, and duplicate keys before replacing the arrays. Inspect saved predicates and source traces against a hand-written identity ledger. Acceptance requires every preserved selection to denote the same logical record, with missing or ambiguous matches explicitly unresolved. Reject an additional identity API if project promotion or clear invalidation handles the useful cases more simply, or if hosts cannot supply trustworthy keys in the target workflow.

The implementation cost would be moderate if a new public prop were justified, because key semantics must reach filters, saved state, and trace references consistently. A documentation and invalidation outcome could be much smaller. This follows current-analysis-trust and the source-binding portion of renderer-independent-replay; it does not reopen delivered project identity work. Confidence is high in the need for a precise contract, while frequency in real host applications remains unmeasured. That uncertainty is exactly what the first fixture and one representative host should resolve.

## References

- `packages/explorEDA/src/providers/lib/dataLayerState.ts` — `initializeData`. Assigns positional \_\_ID values to plain rows.
- `packages/explorEDA/src/components/project/sourceRowIdentity.ts` — `sourceRowIdentities`, `resolveSourceRow`. Uses typed unique entity keys and positional fallbacks for ambiguous or missing keys.
- `packages/explorEDA/src/components/project/analysisRowKeys.ts` — `encodeAnalysisRowKeys`, `decodeAnalysisRowKeys`, `unresolvedAnalysisRowKeys`. Translates saved project row filters into logical keys.
- `packages/explorEDA/src/test/providers/projectIdentity.test.tsx` — `keeps a logical order selection through source reorder and removal`. Already checks unique-key project selection across reorder and removal.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/renderer-independent-replay/intent-brief.md` — related intent; status reconciled against implementation in the brief.

## Research follow-up, October 22, 2026

[Completed synthesis](../../../research/selection-identity-2026-10-22/README.md) retains snapshot-scoped plain selection as a proposed contract.
Use existing project keys conditionally; defer a new key API. Four local probes reproduce mapping, restore, resolver, and output-key boundaries.
No repair is implemented. Browser, host, exports, worker scheduling, and full mutation proofs remain due for any chosen implementation.
Review [SI01–SI08](../../../research/selection-identity-2026-10-22/decisions.md). Continue catalogue discovery with R001, then R051.
