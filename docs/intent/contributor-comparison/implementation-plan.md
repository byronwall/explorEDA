# Compare values

Build a temporary comparison of two traced values. Pin one metric or bar, inspect another, then compare their exact records.
Show **In scope** and **Used in calculation** separately. Each basis has Shared, Left only, and Right only records.
Keep the displayed values, operations, fields, and captured filter context beside the records.

This plan proposes work. It implements no feature and changes no chart math.
The [research summary](../../research/contributor-comparison-2026-10-24/README.md) records the decisions and source checks.
The [Pro conversation](https://chatgpt.com/c/6adc0748-e1e0-83ea-8ef3-a8fe2b64340c) holds the complete design.
Source baseline: `95832bd4`. Use React, TypeScript, and pnpm.

## M1: compare input rows

Ship one complete flow, including docs and an example.

- Support unfaceted metric-card totals and native categorical bars: count, sum, and average.
- Exclude entity measures, series, stacks, bins, facets, injected aggregates, and other trace kinds.
- Copy the foreground producer plan and its contributor ledger on explicit capture.
- Compare only one workspace and prepared-data generation. Project captures also require the same query-result relation.
- Call the units input rows, or query output rows when the project context establishes that grain.
- Preserve empty and invalid card states. An absent or unplotted bar is not a zero-valued target.

### Flow and surface

Use existing Alt-click, Alt-Enter, and header trace browsing. Keep ordinary chart selection unchanged.
The trace action row offers Pin for comparison. Pin closes the trace and returns focus to its trigger.
Another trace offers Compare with the named pin. A complete pair offers explicit Replace left and Replace right actions.
Unsupported capture leaves the pair intact and gives a short reason.

Use one comparison mode inside the existing nonmodal trace popover.
Its first row holds Compare values, Choose another value, Clear, and Close.
Close, Escape, and outside dismissal retain the pair. Resume is available from other chart trace headers.
Clear releases both captures. Choose another value has no hidden next-click capture mode.

Default to Used in calculation, then the first nonempty exclusive partition; otherwise show Shared.
Keep both bases and all three exact partition counts visible.
One read-only table pages through all members, at most 100 per page.
Search and row-ID lookup cover the complete partition. Search counts do not replace membership counts.
Show runtime ID, chosen fields, and each side's prepared input, inclusion status, and recorded exclusion reason.
Use existing field formatting and `NullValue`. Columns and search affect this surface only.

Opening another trace must close the active comparison host through keyboard and pointer entry.
Keep the pair outside chart-local trace selection. Local dismissal must not clear it.
Track open host identity only; keep each chart's trace-source registry local.
Do not add a permanent sidebar, mark Inspect buttons, chart multiselect, or saved comparison chart.
Header-only resume has limited discovery when traces are closed. A broader launcher remains an Explore item.

### Files and evidence boundary

Package paths below start at `packages/explorEDA/src/`.

| File or module                                                         | Required change                                                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `components/charts/trace/traceTypes.ts`                                | Add optional lazy capture to `TraceSource`, with captured, stale, and unsupported results.                 |
| `components/charts/trace/ChartTraceScope.tsx`                          | Capture the current owner/target only after revision checks. Keep normal trace invalidation.               |
| New `comparisonCapture.ts` and `comparisonSets.ts` in that folder      | Copy producer evidence; form complete scope/included partitions and compatible value differences.          |
| New `TraceComparisonProvider.tsx`                                      | Hold two frozen captures, their validity, and the active host. Use plain React context.                    |
| New `TraceComparisonPanel.tsx`                                         | Show paired descriptions, basis/partition controls, exact table, and navigation.                           |
| `components/charts/ChartTraceControl.tsx`, `trace/ChartTracePanel.tsx` | Add Pin/Compare/Replace/Resume and bounded comparison content.                                             |
| `components/charts/MetricCard/MetricCard.tsx`                          | Capture its existing rendered plan and actual settings.                                                    |
| `components/charts/BarChart/BarChart.tsx`                              | Capture the chosen `SingleBarChart` foreground mark and resolved aggregate spec. Reject injected evidence. |
| `providers/DataLayerProvider.tsx`                                      | Add one internal prepared-data generation and nest the comparison provider.                                |

Keep related types with their owning module until a separate shared file helps.
Reuse the small table presentation from `ChartDataPreview.tsx` if useful. Extraction is optional, not a prerequisite.
Do not reuse that preview's live data query to recover captured membership.

Each capture needs: workspace/generation identity, origin chart ID/type, target, operation/measure, value/state, contributor ledger,
typed grouping, applicable filter context, captured formatting, and semantic settings.
Retain same-generation prepared-row references for additional fields; do not deep-copy every dataset on each chart render.
Store query relation/key mappings only for project evidence. Capture at most two values.

Use the actual aggregate spec, not `BarTrace.aggregation` text or `MetricCardPlan.entityLabel`.
`traceRowIds` includes excluded inputs and lacks several kinds. Keep it as navigation support, not the comparison contract.
Count scope IDs from all ledger entries; count included IDs from `included === true`.
Runtime row IDs must address the same relation, with one ledger entry per input occurrence for M1.

MetricCard uses globally filtered IDs plus local restrictions.
SingleBarChart uses peer/local IDs and passes them explicitly to `getAggregateResult`.
Preserve each producer's population. Capture workspace/peer filters, own-selection treatment, local restrictions, and mark grouping.
Do not substitute the current global Rows membership or current `WorkspaceFilterNote` for captured context.

Show a labeled numeric difference only for two finite available values with matching operation, measure, and unit.
For averages, also show each included-input denominator. Suppress a delta across operations, fields, or units.
Never infer a numeric decomposition from membership counts.
Use recorded exclusion reasons. Outside-scope rows have no reducer exclusion reason for that side.
Show observed context differences; automatic causal attribution and predicate-failure explanation wait.

Start with direct linear set operations and bounded rendering.
Measure a large capture during implementation. Add yielding, cancellation, or progress only if measured blocking requires it.
Never truncate membership. Any later asynchronous replacement must retain the prior pair and recheck validity before commit.

### Lifetime

Frozen evidence preserves the observed discrepancy while filters and chart settings change.
Mark earlier filters or changed semantic settings. Cosmetic edits retain the captured display without a numeric warning.

Add an unsaved `comparisonEpoch` to both initial state paths and the explicit initial-state return type.
Advance it in the state update for `setData`, rebuilt field preparation, and real restore.
Advance it in the first `refreshCalculations` update, with `calculations` and the cleared calculation cache.
The later nonce update is too late for synchronous subscribers.
Calculation add/edit/remove/rerun already use this path.

| Change                                                                                | Required result                                                        |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Linked/workspace filters, local restrictions, operation/measure, aggregate definition | Keep frozen evidence; label the changed context or settings.           |
| Title, precision, layout, theme, axes, panel remount/details                          | Keep captures and captured formatting.                                 |
| New data/order, field type/date/null-token interpretation, calculations, real restore | Clear before old runtime IDs can read new prepared values.             |
| Captured chart deletion or chart-type replacement                                     | Clear the pair and announce why. Unrelated deletion does not clear it. |
| Workspace unmount or Clear                                                            | Release evidence and row references.                                   |
| Matching host saved-data echo skipped by the existing fingerprint check               | Preserve the pair.                                                     |

Check epoch, origin existence/type, and project relation synchronously before capture, resume, column access, and query navigation.
Hide invalid pairs during render; effects may release references afterward.
Capture guards also compare the producer's base nonce/live nonce and current settings/spec with the current store.
This prevents old plans from receiving new context metadata before source registration catches up.
Use `useDataLayerSnapshot()` for action reads. Avoid per-chart subscriptions to the whole chart list.
Do not equate panel unmount with chart deletion.

Project navigation maps exactly the selected basis/partition to current result-row keys.
Require complete mapping; do not silently drop unmapped rows. Empty partitions invoke no callback.
Deduplicate keys and distinguish input-row count from key count.
Close the popover before calling `onOpenQueryFlow`.
A host without project context can show valid local evidence but cannot borrow a query callback.
New result relations clear old project evidence; matching labels do not establish identity.

No capture belongs in saved settings, JSON/text syntax, history, or `onStateChange` payloads.
Inspection actions must produce zero host state-change callbacks.

### Literal fixture and checks

Use these eight rows in native settings. Runtime IDs follow this initial order; `record` is a fixture label only.
Explicitly prepare amount and cost as numeric fields. Leave linked/workspace filters empty at first.

| ID  | record | region | channel | orderId | amount | cost |
| --- | ------ | ------ | ------- | ------- | ------ | ---- |
| 0   | r0     | West   | Web     | O1      | 10     | 2    |
| 1   | r1     | West   | Store   | O1      | 10     | 2    |
| 2   | r2     | West   | Web     | O2      | 20     | 5    |
| 3   | r3     | West   | Web     | O3      | null   | null |
| 4   | r4     | East   | Web     | O4      | 30     | 10   |
| 5   | r5     | East   | Store   | O5      | bad    | null |
| 6   | r6     | East   | Web     | O6      | 0      | 0    |
| 7   | r7     | East   | Web     | null    | 0      | 0    |

Create West sum, West average, and West count cards with a local region=West restriction.
Create a native sum(amount)-by-region bar with a local channel=Web restriction.
Use existing chart default factories. Keep entity fields and facets unset.

| Case                                   | Exact expected result                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| West sum vs West/Web bar               | 40 vs 30. Scope `{0,1,2,3}` vs `{0,2,3}`. Included `{0,1,2}` vs `{0,2}`. Left only `{1}`, delta 10. Scope Shared includes excluded row 3. |
| West/Web vs East/Web                   | Both 30. Included `{0,2}` vs `{4,6,7}` with no overlap. Valid zeros remain included.                                                      |
| West sum vs average                    | Same included `{0,1,2}`; 40 vs `40/3`. Different operations; no combined delta.                                                           |
| West amount vs cost sum                | Same included `{0,1,2}`; 40 vs 9. Different fields; no combined delta.                                                                    |
| All rows                               | Count 8; sum 70; average `70/6`. Numeric included `{0,1,2,4,6,7}`, excluded `{3,5}`.                                                      |
| Invalid/empty/zero                     | Rows `{3,5}`: numeric result unavailable. Nowhere: empty card, count value 0 but text No rows. Rows `{6,7}`: valid sum 0.                 |
| Own West selection plus workspace East | Global membership empty; card empty. Bar peer context still draws East/Web `{4,6,7}`, sum 30. Preserve these different scopes.            |
| Search                                 | Ordinary Rows search r0 does not change evidence. Comparison scope Shared search r3 returns one match; partition count remains 3.         |
| Chart sum→average edit                 | Captured 40 remains; settings-change indication. Replacement updates only that side to `40/3`.                                            |
| New array changes r2 amount to 25      | Old pair clears. New West 45, Web/West 35, all 75, West average 15.                                                                       |
| Calculation edit                       | On `{0,1,2}`, sum(amount*2)=80; edit to *3 clears capture, then gives 120. Same-expression rerun also clears.                             |
| Query keys q0…q7                       | Included Left only navigates `[q1]`; scope Shared `[q0,q2,q3]`. Missing q3 blocks the complete action.                                    |
| Paging                                 | Both ledgers 0…204: pages 1–100, 101–200, 201–205. Lookup/search 204 works from page one.                                                 |

Raw reducer row 5 retains input `bad`; prepared numeric input can carry a conversion failure instead.
Assert the actual producer's raw input and reason, not one shared reason string across these paths.
Zero count bars may remain with empty ledgers. Missing aggregate groups have no drawn target.
Reverse the input array to verify invalidation; old and new integers must not be compared.
For new-array fixture checks, supply complete saved fixture settings. `setData` alone resets charts and aggregates.
Reject stale closures and unsupported kinds without replacing either capture.

Add focused adapter/set checks, one mounted two-chart lifecycle check, and table/query mapping checks.
Use real producer plans and literal expected sets. Include first calculation-state commit and stale-action gaps.
Keep new tests beside trace code. Extend existing MetricCard/bar/trace tests only where necessary.

For browser checks, add `apps/demo/e2e/compare-values.e2e.ts` and an explicit project in `apps/demo/playwright.config.ts`.
The config matches `.e2e.ts` files through named projects; Pro's `.spec.ts` filename alone would not run.
Verify pin/compare/replace/close/resume and exact rows with pointer and keyboard at 1280, 783, and 390 px.
At 390 px, reach both values through header browsing without needing both charts visible.
Bound the popover to the viewport; retain scrolling tabs, reachable actions, nested Escape, and focus return.
Test long labels, nulls, zero, empty/invalid evidence, light/dark themes, details portals, and an off-page record.
Assert unchanged analytical filters, layout, saved structure, and zero callbacks for inspection actions.
Exported charts must omit inspection controls through existing export rules.

### Docs, example, and risk

In the same milestone, add `apps/demo/src/docs/pages/compare-values.mdx` and `/examples/compare-values`.
Update trace, filters, metric-card, and bar docs. Correct bar scope wording only for the actual native aggregate path.
Register the page in `docs/catalogue.ts` and `docs/targets.ts`, and its live steps in `docs/live/examples.ts`.
Add `demos/analyses/compare-values.ts`; register through `demos/examples.ts` and `demos/coverage.ts`.
The first example uses the four fixture charts; variants cover the additional cases above.

Run targeted library tests and types, demo coverage/dashboard-text checks, and `pnpm --filter demo docs:check`.
Build the demo before running the registered browser project and the page's docs verification.
Use `pnpm shot` with verified trace/pin/compare steps for PR evidence at all three widths.
Add a minor changeset and run `pnpm check` once before the feature PR. Stop the local demo server afterward.

**Main risk:** credible-looking evidence from another scope, render, or data generation.
M1 is complete only when the real producer-to-table flow passes, with same-milestone docs and example.

## M2: compare entities and their witnesses

Extend the same card/bar adapters to matching typed entity fields within one relation.
Keep entity membership, representative inputs, all witnesses, missing IDs, and conflicts distinct.
Use existing category-key equality: numeric 1 and string "1" differ.
Add typed roles at `lib/aggregates.ts` construction points if needed; do not parse display reason strings.
Preserve reducer values, order, and conflict policy. Extend capture/sets/panel modules and focused tests.

| Fixture                     | Expected result                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| West once-per-order count   | 3 entities. Representatives `{0,2,3}`, repeated witness `{1}`.                                                                 |
| West once-per-order sum     | 30; included `{0,2}`, repeated `{1}`, invalid `{3}`.                                                                           |
| All once-per-order count    | 6 entities; missing-ID row `{7}` excluded.                                                                                     |
| All once-per-order sum      | 60; included `{0,2,4,6}`, repeated `{1}`, numeric invalid `{3,5}`, missing ID `{7}`.                                           |
| West vs Web/West entity sum | Both 30 from entities O1/O2; scope witness row 1 exists only on the left.                                                      |
| Change r1 amount to 11      | Ordinary West sum 41; entity sum unavailable. O1 conflict witnesses `{0,1}`; O2 evidence remains. Distinct card count stays 3. |

Do not intersect representative row IDs as entity identities or normalize named-count conflict behavior to MetricCard count.
Row/entity pairs may compare scope witnesses but must label different units and suppress cross-unit arithmetic.

Update compare-values, metric-card, and bar docs in the same milestone.
Add an Orders once example variant and live docs steps.
Verify entity-to-witness navigation and conflict evidence at all three widths with pointer and keyboard.
**Main risk:** mistaking order-dependent representatives for entities or changing reducer policy during explanation work.

## M3: compare parts and denominators

Read `BarChart/SeriesBarChart.tsx` and `seriesBarPlan.ts` before extending their capture path.
Add explicit part, denominator, and baseline ledgers in the existing producer boundary where needed.
Extend `barTrace.ts`, capture/sets/panel modules, and existing series tests.
Support declared series/facet contexts only when their real plan exposes the required evidence.
Name the exact facet. Compare matching dependency roles, never a numerator against a denominator.

Use unrestricted count percent bars over the same eight rows:

- Group region, split channel: West/Web part `{0,2,3}` divided by West `{0,1,2,3}` gives 75%.
- Group channel, split region: Web/West part `{0,2,3}` divided by Web `{0,2,3,4,6,7}` gives 50%.
- Parts are identical. Denominator Shared is `{0,2,3}`, Left only `{1}`, Right only `{4,6,7}`.
- The difference is 25 percentage points. Preserve producer rules for invalid/negative/zero denominators and stack geometry.

Add part/denominator sections to compare-values and bar docs in the same milestone.
Add a Same part, different whole example variant and live steps.
Verify both role views and exact records at all three widths with pointer and keyboard.
**Main risk:** numerator-only evidence appears to explain a percentage or stack endpoint completely.

## Deferred scope

Explore a two-slot launcher after the core flow exists.
Defer broader trace adapters, full Rows integration, live pairs, persistence/export/history, deleted-source retention, and cross-refresh/query matching.
Keep saved schemas and filtering behavior unchanged. Do not add another reducer or provenance engine.

## Preserved Pro result materials

[Original Pro reports and artifacts for #519](assets/pro-results/contributor-comparison-2026-10-24/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
