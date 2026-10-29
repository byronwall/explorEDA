# Live notebook findings

Build named findings whose values follow one chart's local selection.
Keep calculations outside sentences. Let readers open the exact records behind each value.
Add compact authoring and explicit comparisons next. Preserve static prose and local chart selection defaults.

This is a reviewed design plan, not a shipped feature or an implementation request.
See the [research decision](../../research/live-findings-2026-10-22/README.md) and [Pro conversation](https://chatgpt.com/c/6adab40e-b670-83e9-af00-6619fa79e438).
The checked implementation base is `16b88f8a` on October 22, 2026.

## Contract and proposed syntax

Notebook text owns definitions. Compilation produces one optional findings registry in saved settings.
The existing provider owns filters, field settings, and calculations. Finding results remain derived.
Use existing `Filter` values and canonical field names. Validate references without a second field-reference model.

Proposed declarations inside an `eda` block:

```text
cohort @review scope=chart chart=@regions label="Active reviews"
finding @selected-count cohort=@review aggregation=count population=selected
finding @mean-score cohort=@review aggregation=average field=score population=selected digits=2
```

Prose uses `{{finding:mean-score}}` and `[Current records](#finding:mean-score)`.
These forms are new syntax. They do not compile today.
Explicit chart IDs identify owners; titles and sheet positions do not.
A finding can follow an off-sheet chart without mounting a hidden card.

Resolve populations in this order:

1. Source rows: the notebook query's current rows.
2. Eligible rows: workspace restrictions, the named chart's `localFilters`, then any fixed cohort conditions.
3. Selected rows: eligible rows passing that chart's own interactive predicate.
4. Metric inputs: the selected or eligible population, then the finding's fixed partition.
5. Contributors: inputs accepted by the existing reducer.

A cleared predicate selects all eligible rows. An active predicate with no matches selects none.
Source-scoped findings ignore interactive and workspace filters. Label their scope explicitly.
Zoom, sorting, paging, and unrelated local chart selections do not change membership.

Return each value and its contributor records from the same input state.
Use existing field conversion, `summarizeGroup`, and field formatting.
Count-zero is valid. Empty numeric input, invalid input, missing references, and nonfinite results need distinct unavailable reasons.
Do not use the demo's independent `DailyFinding` evaluator in the library.

## Acceptance fixture

Each source key names one row. Declare `score` numeric. Restrict the owner to boolean `active=true`.
Use source fields directly in pure tests; the notebook example can use qualified query fields and aliases.

| Key | Group | Region | Score | Active |
| --- | ----- | ------ | ----- | ------ |
| r01 | A     | East   | 90    | true   |
| r02 | A     | West   | 10    | true   |
| r03 | A     | West   | 20    | true   |
| r04 | A     | West   | 0     | true   |
| r05 | A     | West   | null  | true   |
| r06 | B     | East   | 80    | true   |
| r07 | B     | East   | 70    | true   |
| r08 | B     | West   | 5     | true   |
| r09 | B     | West   | 0     | true   |
| r10 | B     | East   | "bad" | true   |
| r11 | A     | East   | 100   | false  |
| r12 | B     | West   | 100   | false  |

| Selection  | Selected | Contributors | Sum | Average | A mean | B mean | A minus B |
| ---------- | -------- | ------------ | --- | ------- | ------ | ------ | --------- |
| Cleared    | 10       | 8            | 275 | 34.375  | 30     | 38.75  | -8.75     |
| East       | 4        | 3            | 240 | 80      | 90     | 75     | 15        |
| West       | 6        | 5            | 35  | 7       | 10     | 2.5    | 7.5       |
| Score zero | 2        | 2            | 0   | 0       | 0      | 0      | 0         |

East selected keys are r01,r06,r07,r10. Its numeric contributors exclude r10.
Selecting r05,r10 gives count 2 and no valid numeric value.
Selecting a nonexistent region gives count 0 and an empty numeric result.
East is 40% of ten eligible rows, or one third of twelve source rows.
An empty numerator over ten is 0%; an empty denominator is unavailable.
Keep row count, valid numeric count, and distinct entity count separate.

## M1 — Live values and current records

**Build.** An author writes a count or average, selects East, and reads its exact inputs.
This is a useful first release. It needs no capture, shared-selection group, or lasso.

- Add `lib/notebook/findings.ts` for definition types, resolution, and evaluation. Split it only as responsibilities grow.
- Extend `lib/notebook/compileNotebook.ts` and `parseNotebook.ts` for declarations, source spans, and line diagnostics.
  Extract declarations consistently before both per-block checks and the combined chart compile.
- Extend `types/SavedDataStructure.ts`, `utils/saveDataUtils.ts`, and provider save/restore for the compiled registry.
  Keep notebook text authoritative; do not serialize cached results or transient inspector state.
- Add value/link rendering through MarkdownIt's token stream in `components/notebook/NotebookProse.tsx`.
  Keep raw HTML disabled. Tokens in code, escaped text, or link destinations stay literal.
  Update live values without replacing the focused prose subtree.
- Connect results in `ExplorEdaNotebook.tsx`; use provider definitions even when an owner is off-sheet.
  Extract MetricCard input preparation only if it prevents actual duplicate conversion logic.
- Reuse contributor presentation from chart traces. Close current evidence when its input revision changes.
  The existing `ChartTraceScope` follows this rule; it does not provide Pro's proposed pinned historical view.

Use a focused resolver/evaluator suite for the fixture and owner independence.
Use a compiler/render test for forward references, unavailable dependencies, literal code, and evidence membership.
Retain existing MetricCard behavior if its input preparation changes.
Do not add a separate test for every internal helper.

**Docs/example:** add “Live findings” to `apps/demo/src/docs/pages/notebooks.mdx`.
Add `NotebookFindingsExample.tsx` under `apps/demo/src/docs/live/`, reachable on `/docs/notebooks`.
Register scripted example steps through `live/examples.ts` and the docs test path.
Show cleared → East → excluded r10 → unrelated chart selection → clear.

**Risk:** the chart context helper omits its local predicate in notebook mode.
Apply `CrossfilterWrapper.getFilterFunction(owner)` over eligible IDs explicitly. Keep `localSelections` enabled.

## M2 — Insert and edit values

**Build after M1.** Add a compact Insert value editor with reducer, field, cohort, population, format, and preview.
Use existing field pickers and nonmodal popovers. Give each value keyboard access to its scope and records.

Add `NotebookFindingEditor.tsx` and a focused `lib/notebook/writeBackFindings.ts` writer.
Use parsed spans for insert, rename, and rebind. Recompile before one `onTextChange` transaction.
Preserve surrounding comments and prose. Generate an explicit owner ID when needed.
Extend the notebook's source-echo handling so a finding edit preserves the reader's transient selection.
A brush still writes no `select.*` tokens. Cancel creates no edit or undo step.

One integration test must select East, change precision, rename the finding, and retain four selected rows.
Include broken/deleted references and an off-sheet owner in that flow.

**Docs/example:** add “Insert and edit a finding” to the notebook page and extend the same live example.
Script insert → rename → change precision → cancel → reopen source.
**Risk:** a source edit can reset provider state or write stale offsets.
Keep the transaction explicit; do not persist filters merely to preserve them during editing.

## M3 — Shares and comparisons

**Build after M2.** Add named row-share and difference declarations over primitive findings.
A difference requires compatible source, cohort, reducer, measure, and unit; partitions may differ.
A share requires two row counts from the same source and numerator membership within its denominator.
Use unrounded operands from one input state. Show both operands' records separately.

Extend the same finding evaluator, compiler, editor, and validator. Avoid a general expression engine.
The fixture must change A minus B from -8.75 to +15 after East selection.
Test 4/10 versus 4/12, zero denominator, and one unavailable operand.

**Docs/example:** add “Comparisons and denominators” to the notebook page and the same runnable example.
Show neutral live wording, two group averages, and their signed difference.
**Risk:** a changed number can contradict fixed prose.
Label fixed dataset context explicitly; do not rewrite an authored conclusion or infer causality.

**Initial release cut: M3.** This delivers live findings, usable authoring, exact current evidence, and comparisons.
Pro also included saved evidence in its core cut. Local review separates that larger persistence boundary below.

## M4 — Saved evidence and fixed claims

**Explore, then plan the implementation from the proof.** Capture the all-active comparison, select East, and inspect the original evidence.
Keep saved values, definitions, inputs, exclusions, typed source keys, and source revision together.
Saved inspection changes no filters. Restore is a separate action, available only for a compatible source and owner.

Prototype `captureEvidence` and its validated notebook segment before adding a general registry or many adapters.
Reuse `components/project/analysisRowKeys.ts` and `sourceRowIdentity.ts` where their contracts fit.
Those helpers now exist; their positional fallback is unsuitable as portable historical identity.
Require explicit unique source keys for captures. Do not build a second refresh-identity system.
Proposed `eda-evidence` syntax needs explicit handling in parsing, sheets, rendering, and write-back.

Prove source/calculation replacement cannot substitute new inputs for captured ones.
If Restore ships, precompute the full candidate membership, apply one state change, and test one-step Undo.
Holding host callbacks alone does not make several provider writes atomic.
Use the smallest supported owner set. Do not introduce version coexistence or a provenance framework.

**Docs/example:** add “Current records and saved evidence” to the notebook page.
Extend the example: capture ten → select East four → inspect both → restore → undo.
**Risk:** payload size and incomplete owner predicates. DataTable search is separate from its filter list.
Choose a concrete payload limit from the prototype; unsupported owners must not silently lose predicate state.

## M5 — Explicit shared selection and exact lasso

**Build as a separate selection milestone.** Follow the [Mosaic study](../../research/mosaic-selections-2026-10-20/README.md)
and [precise-selection intent](../precise-composite-selection/intent-brief.md).
A named member group references existing chart owners and an explicit intersection policy.
It stores no duplicate predicates. Nonmembers retain local selection behavior.

Extend Crossfilter owner resolution and exact consumers first, then add source-space polygon membership.
Use the scatter renderer, selection types, saved validation, and field-dependency traversal.
Inspect those files before selecting a new geometry module. A rectangle does not satisfy lasso acceptance.
Provide equivalent keyboard polygon entry, clear, and inspect actions.

For the review fixture, East intersected with score [75,95] yields r01,r06, count 2, average 85.
For the earlier lasso proof, retrieve its original keyed coordinates before asserting its four expected IDs.
Do not fabricate coordinates from the reported answer. Add boundary and overlap cases.

**Docs/example:** add “Shared selection” and “Exact lasso findings” to notebook and Scatter docs.
Add a second live example with histogram, scatter, table, and finding.
**Risk:** source context excludes its own owner while exact evidence includes all declared owners.
Prove both context and exact row sets. Treat this as feature work, separate from merged boundary repairs.

## Common delivery checks

Each visible milestone includes its named docs section and reachable example in the same PR.
Use real keyboard and pointer input at 1280, 783, and 390 pixels.
Check focus return, long names, zero/empty states, wrapping, and reachable popover actions.
Keep tests focused on membership, source edits, evidence, and likely failure points.

Run targeted notebook, Crossfilter, and affected reducer tests with pnpm, plus library types.
Run the notebook docs example through the existing docs verification command.
Before each implementation PR, run `pnpm check` once, add the required changeset, and attach screenshots with gh.
Keep React and TypeScript. Do not add a new backend, generated prose, extra reducers, or entity grain in this plan.

## Preserved Pro result materials

[Original Pro reports and artifacts for #507](assets/pro-results/live-findings-2026-10-22/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
