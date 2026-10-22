# R078 — Independent workspace ownership for dialogs and exports

- ID: R078
- Category: Embedding and package contracts
- Priority: 11
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A host may place two explorEDA workspaces on one page to compare independent analyses. The provider gives each instance its own data store, but surrounding UI has broader scope: `useAlertStore` is module-global, and `mountedPanel` falls back from a workspace root to all document dialogs. Reusing ordinary chart IDs across the two analyses is natural. The source therefore supports a focused ownership investigation, although no cross-instance export or confirmation failure has been reproduced in this review.

Compare adding a private workspace identity to portals and confirmations with requiring globally unique chart IDs and a single shared confirmation host. Another option is to declare multiple simultaneous workspaces unsupported, if that matches actual embedding needs. Keep the decision specific to ownership, not a general multi-tenant architecture. Ask whether chart IDs identify an object within saved settings or across the entire document, and whether a host should need to understand internal dialog placement to use the imperative export handle safely.

Build a minimal two-workspace consumer with different data but the same chart IDs. Open details in one instance, export from both handles, trigger overlapping confirmations, then unmount the initiating instance. Capture which panel pixels were requested, which state changed, where focus returned, and whether each promise settled exactly once. Accept a scoped design when these invariants hold with unchanged saved IDs. Reject a new scope layer if a small portal marker or an explicit supported-host constraint covers the demonstrated use case at lower maintenance cost.

The likely change surface is small UI plumbing around existing providers, but confirmation lifetime and cleanup need careful thought. No persistence schema change should be necessary. Current-analysis-trust is related through agreement between requested state and observed output, while its existing linked-analysis work does not establish cross-instance isolation. Confidence in the opportunity is high from the mixed source scopes; user demand and actual runtime behavior remain gaps. This earns its place as a compact integration experiment with a clear pass-or-stop result.

## References

- `packages/explorEDA/src/components/ExplorEda.tsx` — `ExplorEda`, `Workspace`. Each workspace mounts a provider and GlobalAlertDialog and exposes a root-based export handle.
- `packages/explorEDA/src/components/charts/export/exportChartPng.ts` — `mountedPanel`, `exportWorkspaceChartPng`. Searches the local root first and then document dialogs by chart ID.
- `packages/explorEDA/src/stores/alertStore.ts` — `useAlertStore`. Stores the active confirmation and resolver in a module-level store.
- `packages/explorEDA/src/components/GlobalAlertDialog.tsx` — `GlobalAlertDialog`. Consumes the shared alert store and uses document-level focus lookup.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
