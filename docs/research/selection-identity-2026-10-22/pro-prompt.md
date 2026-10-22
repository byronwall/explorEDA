# R077: selection identity after source replacement

https://github.com/byronwall/explorEDA

Repository baseline: `f4cacdde180e16ad814451a8c064e394535565d6` (origin/main). Local integration branch: `codex/selection-identity-research-2026-10-22`.
Research only. Act as an embedding API and analytical correctness reviewer.

## Mission and selection

Decide the smallest trustworthy contract for row-specific selections when immutable source arrays change.
Compare explicit invalidation, existing project promotion, optional stable-key input, and keeping current behavior with precise documentation.
R077 is catalogue priority 3 and the highest-ranked unfinished idea. R026/PR465 and R043/PR466 are complete.
R001 and R051 remain next candidates. R077 offers exact record-membership checks and a bounded API decision.
No demand or defect is established. Lack of named demand does not block correctness research.
R008/PR464 and R011/PR461 are completed/overlapping studies. Do not repeat their surveys.
PR462 owns Mosaic integration; avoid that survey. R043 identity partitions are prior evidence, not replacement correctness proof.

## Access preflight

Authenticate repository owner, exact baseline, supplied file inventory, and packet hashes before analysis.
Use the attached selected source snapshot if GitHub indexing cannot expose this commit. It is not a runnable checkout.
The packet identifies historical R043 evidence separately. Do not treat later branch work as this baseline.
GO only with the core provider, project identity, saved-filter types, tests, and full catalogue brief available.
NO-GO if essential source is missing, owner/ref mismatches, or a material choice requires invented facts.
Report the smallest missing input. Do not mutate GitHub, deploy, or create commits.
Return complete artifacts as downloadable files even without a writable checkout.

## Reading route and current observations

Read AGENTS.md, docs/agent-guide.md, README.md, package.json, and packages/explorEDA/README.md.
Then inspect these real paths and their tests:

- `packages/explorEDA/src/providers/lib/dataLayerState.ts`
- `packages/explorEDA/src/providers/DataLayerProvider.tsx`
- `packages/explorEDA/src/components/ExplorEdaProject.tsx`
- `packages/explorEDA/src/components/ExplorEda.tsx`
- `packages/explorEDA/src/components/project/sourceRowIdentity.ts`
- `packages/explorEDA/src/components/project/analysisRowKeys.ts`
- `packages/explorEDA/src/lib/analysis/evaluateProject.ts`
- `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts`
- `packages/explorEDA/src/types/AnalysisProject.ts`
- `packages/explorEDA/src/types/SavedDataStructure.ts`
- `packages/explorEDA/src/types/FilterTypes.ts`
- `packages/explorEDA/src/test/providers/projectIdentity.test.tsx`
- `packages/explorEDA/src/test/providers/DataLayerProvider.test.tsx`
- `packages/explorEDA/src/test/providers/dataLayerState.test.ts`
- `packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts`
- `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`
- `packages/explorEDA/src/test/fixtures/shopProject.ts`
- `packages/explorEDA/src/components/charts/useGetLiveData.tsx`
- `docs/intent/current-analysis-trust/intent-brief.md`
- `docs/intent/renderer-independent-replay/intent-brief.md`
- `docs/intent/research-ideas-100/README.md`
- `docs/intent/research-ideas-100/ideas/R077-selection-identity-when-source-rows-are-replaced.md`

`initializeData` assigns positional \_\_ID values. `DataLayerProvider` resets through setData on changed data/field props,
then restores supplied savedData. Without savedData the reset clears filters. These source facts do not prove a failure.
`ExplorEdaProject` maps evaluation row keys to runtime IDs. Its saved-key adapter traverses chart and rowsSettings filters.
SavedDataStructure also has workspaceFilters: inspect every ownership scope rather than assuming all filters use one traversal.
`sourceRowIdentities` has typed unique keys and positional missing/duplicate fallbacks.
The existing projectIdentity test protects a chart-owned selection through reorder and removal.
Determine where current tests stop; preserve working cases. Read saved state, trace references, worker result application, and query grain.

## Ranked questions

1. For plain and project workspaces, exactly which selections survive replacement and what logical record do they denote?
   Separate point/chart, table/rowsSettings, workspace filters, inspect/trace references, host echo, saved restore and export membership.
   Distinguish no savedData, controlled unchanged savedData, host echo, changed schema, and in-place mutation (outside supported immutable input).
2. What happens when a unique key becomes duplicate/missing, a selected record vanishes, or query expansion changes grain?
   Separate logical source identity, physical occurrence, equal values, and aggregate output identity. Reuse R043 evidence.
   Never merge equal-looking observations. Distinguish explicit unresolved state, silent retarget, and deliberate reset.
3. Which smallest alternative covers useful cases: documentation/current reset, explicit invalidation, existing project keys,
   or optional plain-row key API? Compare correctness, host burden, state/trace consistency, cost, and rejection gates.
   Consider whether a small repair to an existing mapping is sufficient before adding any API.
4. Which bounded proof, lesson, and runnable example would resolve remaining uncertainty? Name current destination files after discovery.
   Larger implementation remains proposed. Do not expand to a universal identity/versioning/replay platform.

## Exact first experiment

Before exploring outcomes, freeze a hand-written 12-record identity ledger and expected preserved/unresolved sets.
Include repeated names with distinct typed keys. Use distinctive measures so wrong selections cannot hide behind equal totals.
Select points, table rows, and workspace predicates. Reorder, append, delete selected/unselected rows, duplicate a unique key,
make a key missing, change its primitive type, and change relationship expansion grain. Include unchanged and clean-key controls.
For each mutation compare exact logical IDs, physical references, predicates, trace targets, and exported rows.
Do not silently redefine the oracle to match implementation. Record a rejected hypothesis and useful negative controls.
If no runtime exists, provide a precise executable local proof proposal and label all source predictions as unexecuted.
Do not claim browser, author, lifecycle, performance, or host task evidence from arithmetic alone.

## Evidence and stop gates

Cite exact paths/symbols for current facts; separate fact, inference, proposal, and unrun checks.
Use current primary sources for external claims that decide recommendations; include URLs, access dates, and applicability limits.
A small comparator set is sufficient (for example keyed selection in established data-table tools); do not survey the market broadly.
Do not infer customer demand from examples. Keep simplification and correctness value separate from adoption claims.
Reject a new identity API if explicit invalidation or existing project promotion covers useful cases more simply,
or hosts cannot supply trustworthy keys. A narrow reproducible fault supports a bounded repair, not a platform rewrite.
Keep current behavior if exact controls agree and the remaining gap is only explanatory. Allow a NO-GO recommendation.

## Deliverables

Produce exactly four substantive Markdown files:

- `decision.md`: recommended contract, strongest alternative, GO/NO-GO, uncertainties, and concise SI01... recommendations.
- `evidence.md`: source audit with exact references, primary comparisons, selection-scope/mutation matrix, facts versus inference.
- `proof-plan.md`: frozen 12-row ledger/oracle, adversarial controls, runnable commands or local proof plan, pass/fail gates and unrun limits.
- `integration-plan.md`: adopt/investigate/defer/reject candidate dispositions, bounded docs/intent/example destinations and review milestones.

Provide all four standalone downloads plus `manifest.json` and `selection-identity-research.zip` containing those same four reports and manifest.
Manifest lists baseline, file names, byte sizes and SHA256 for the reports. Publish ZIP and manifest SHA256 in the final response.
Do not use placeholder links. End with the core decision, evidence limits, recommendation count, and links to every asset.
Local validation uses pnpm; likely checks include projectIdentity.test.tsx, sourceRowIdentity.test.ts and dataLayerState.test.ts.
Codex owns independent verification, integration, full pnpm check and the open review PR. You do not implement product changes.
