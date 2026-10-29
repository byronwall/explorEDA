# Saved wide-to-long preparation

Build an `unpivot` query step for repeated measurements stored in separate columns.
An analyst selects the columns, names the resulting measurement and value fields, previews the rows, and opens a long view.
Each generated value retains its immediate input cell and its original records.
This plan proposes work; no feature has shipped.

Read the [research summary](../../research/wide-long-2026-10-23/README.md) and [Pro report](https://chatgpt.com/c/6adbb78d-732c-83e9-baaa-d809400e2381).
Code review used `95832bd473884aeae23453af0888b4ca5187820d`, still current origin/main on October 23.
The repository's research direction supersedes the earlier preparation study's demand gate.
Byron has requested the capability.

## Contract

Extend `AnalysisStep` directly. Keep the existing evaluator and project version.
The proposed saved definition contains:

- `id`, `kind: "unpivot"`, and `inputStepId`.
- Ordered `keep` field IDs and ordered `columns: { fieldId, name, unit? }[]`.
- Independent `names: { id, label }` and `values: { id, label, type, unit? }` outputs.
- `missing: "keep" | "drop"`, defaulting to keep in the editor.

Use one declared value family: number, string, boolean, or date.
Known input types must agree. Unknown calculated or aggregate fields need an explicit family.
A type declaration does not convert raw values or certify their validity.
The value label identifies the common quantity. Units are optional authored text, with no automatic conversion.
Reject conflicting supplied unit annotations. Without annotations, numeric types cannot prove compatible quantities.
Do not add Pro's persisted `compatibility: "author-confirmed"` flag or a separate attestation checkbox.
The selected fields, quantity label, type, and optional unit already express the author's definition.

Save exact field membership and mapped names. Added source columns stay outside both saved lists.
Missing selected or kept fields cause an error; absent properties in individual rows follow the missing policy.
Require distinct selected IDs, unique nonempty mappings, and disjoint selected/kept lists.
Generate output IDs once. Reject duplicate IDs, `__ID`, and collisions with any immediate input field.
Copies preserve output IDs while giving query steps new IDs.

Output fields are kept fields, then the name and value fields. Schema must exist with no input rows.
Visit input rows in order, then selected fields in saved order.
A long row means one immediate input result row paired with one selected field.
Its key is `step.id + ":" + JSON.stringify([inputRow.key, selectedFieldId])`.
Labels, mapping names, values, and selected-column positions do not enter this key.
Unique source keys survive reorder. Positional keys retain their current snapshot limits.

Copy raw scalars, including false, zero, blanks, numeric text, and non-finite numbers.
Drop only pairs for which `isMissingValue` returns true, when explicitly requested.
Keep existing query comparisons, null filters, and aggregate counting rules.
Report candidate pairs, emitted pairs, missing pairs, and valid measurements separately.

## M1 — Author, save, and inspect one long table

Ship the complete feature in this milestone. The batches below give implementation order, not separate releases.

### Evaluate and describe the output

Change these files under `packages/explorEDA/src/`:

- `types/AnalysisProject.ts`: step definition, union member, pair counters, and immediate input-cell references.
- `lib/analysis/evaluateProject.ts`: schema, validation, row generation, stage meaning, and counts.
- Proposed `lib/analysis/unpivot.ts`: small shared definition/schema rules used by evaluation and restore.
- `lib/analysis/analysisWorkerProtocol.ts`: carry the same serializable result metadata through the existing worker path.

Construct schema before processing rows. Use shared parsing helpers for eligibility, without rewriting stored values.
Keep `sourceRows` and `contributors` unchanged from each immediate input row.
Generated field metadata points to the unpivot step; it must not name one source column for the whole value field.

Preflight growth before allocation. Start with Pro's proposed cumulative limits of 100,000 candidate pairs and 2,000,000 projected cells.
Charge each evaluated unpivot stage once. Projected cells are candidate pairs multiplied by `keep.length + 2`.
Drop mode does not bypass the candidate budget. Refuse oversized evaluation instead of returning partial success.
These numbers are provisional. Measure representative inputs during implementation and adjust the constants before release.
Do not build a new execution or resource-management service.

### Trace the selected cell and its records

Change `evaluateProject.ts`, `types/AnalysisProject.ts`, and proposed `lib/analysis/cellOrigins.ts`.
Add only evidence edges that existing stage rows cannot recover:

- Unpivot: immediate input step, row key, and selected field ID.
- Expansion: immediate parent input and selected child match.
- Lookup: the selected target match, or distinct unmatched, ambiguous, and unavailable-source outcomes.
- Aggregation: immediate group input rows, alongside existing numeric contributor evidence.

Resolve evidence from applied definitions and stage rows. Do not recompute formulas or parse row keys for lineage.
Calculation traces show the expression and declared dependencies, rather than claiming executed branch history.
Two aliases into the same source must identify different supplying cells correctly.
Aggregate traces distinguish group membership, included measurements, exclusions, and unavailable results.
Add count evidence only where needed to explain a selected count measure; preserve its existing semantics.
Do not copy every aggregate measure's evidence into every generated long row.

Update `useAnalysisEvaluation.ts`, `ExplorEdaProject.tsx`, and `QueryStageRows.tsx` together.
Retain the completed result's project, table, and binding references while a worker request is pending.
Use those same references for source-cell inspection. Existing stale-request rejection remains in force.
The snapshot references belong in evaluation state, not saved project JSON.

In the row inspector, show **Value origin** separately from original and related records.
A source cell includes its raw field ID and own-property presence, distinguishing absent from explicit undefined.
A generated name comes from the saved mapping, not a raw source cell.
An aggregate result can have one immediate input row and several original records.

Selecting A/Before selects that pair. It does not select A/After.
Use `analysisRowKeys.ts` and saved row filters for workspace membership; `selectedRowKeys` alone does not filter charts.
Keep source exploration explicit. If an action says it opens supplying records, apply those exact source filters.
The existing **Open source as a view** action opens the source, not an exact contributor subset.
Disable cross-view actions against an old pending result; read-only inspection can retain its stated previous snapshot.

### Save and restore

Update `lib/analysis/projectFile.ts`, both kind allowlists, and its `fieldsAt` schema walk.
Replace the implicit aggregate fallback with explicit aggregate/unpivot branches.
Reuse the unpivot definition rules for JSON, text, and evaluator entry points.
Keep existing special scalar encoding, selected-view dependency export, and project version 1.
Do not save cached long rows or introduce migration coexistence.

Extend `lib/dsl/project.ts` at `compileStep` and `stepLines`:

```text
unpivot @long keep=runs.recordId,runs.person names=visit values=reading names-label=Visit values-label=Pressure type=number unit=kPa missing=keep {
  column runs.before name=Before unit=kPa
  column runs.after name=After unit=kPa
}
```

This is proposed syntax, not accepted current text.
Reuse existing ordered child declarations and quoted list tokens. Preserve `from=` and `output=`.
Omitted `keep` means an empty saved projection, never dynamic selection of other fields.
Omitted unit means unspecified; a quoted `"null"` remains literal text. No special null-unit token is needed.

Update `lib/project/analysisText.ts`, `lib/dsl/compile.ts`, and `lib/dsl/views.ts` for empty results.
Current `compileDocument` infers fields from row profiles; `DslCompileOptions` has no explicit schema input.
Pass known evaluation field IDs/types through a small explicit schema option for project views.
Do not insert a fake row to make chart references compile.
`ExplorEdaProject` already passes `fieldNames` and `fieldTypes` to the workspace; preserve that path.
`packages/explorEDA/src/analysis.ts` already exports all analysis types; check its public entry before adding exports.

### Author and revise

Update `components/project/stepEditing.ts`, `queryEditing.ts`, `ProjectQueryPanel.tsx`, and `QueryFlow.tsx`.
Add a focused `UnpivotStepEditor.tsx` using existing field controls and panel conventions.
Offer ordered measurement mappings, kept fields, output names/type/unit, missing policy, and a bounded preview.
Preview uses the same evaluator and complete counts, labeled **First 25 of N rows**.

**Open long table** copies the query, appends the step, carries parameter bindings, and opens a fresh view.
Set the frame label to describe the new grain. Copy no charts, filters, or inspection selection.
Use one host operation. Preview and cancel create no saved state or host callbacks.
Disable the action when the host cannot open a view.

Edit and Remove must validate downstream fields, calculations, filters, groups, measures, and relationship inputs.
Empty-table evaluation alone cannot prove those references remain valid.
Reuse `projectFile.ts` validation rules and `settingsCompatibility.ts`; do not add a second evaluator.
Block removal that breaks downstream query steps. Keep unavailable chart settings for existing recovery controls.
Label/order edits preserve pair identity. New type, unit meaning, or field rebind opens a revised query/view in M1.
Mapping changes keep literal category filters unchanged; show their resulting matches in preview.
Do not promise atomic rewrites of sibling views through the current single-view callback.

### Proof, docs, and example

Use a five-row fixture with selected Before/After values:

| Record | Person | Before       | After      |
| ------ | ------ | ------------ | ---------- |
| A      | P1     | 10           | 12         |
| B      | P1     | 0            | null       |
| C      | P2     | absent       | 4          |
| D      | P3     | empty string | false      |
| E      | P4     | bad          | string 2.5 |

Keep mode gives 10 pairs, 3 shared-helper missing pairs, 5 finite measurements, and sum 28.5.
Current `count(reading)` is 8; current query `is-null` selects 2. Drop mode gives 7 pairs and the same numeric sum.
Filtering person P1 before unpivot gives four pairs and numeric sum 22.
Filtering numeric `reading > 0` afterward gives A/Before, A/After, C/After, summing to 26.
The raw string 2.5 does not pass that existing strict query comparison.
The first key is `long:["runs:string:A","runs.before"]`.

Extend `test/lib/analysis/evaluateProject.test.ts`, `selectionIdentity.test.ts`, `useAnalysisEvaluation.test.tsx`,
`components/project/stepEditing.test.ts`, `lib/dsl/project.test.ts`, and the relevant project-file/text tests.
Add a focused cell-origin/editor test only for behavior those tests cannot cover.
Important acceptance cases:

- Empty schema, missing declared fields, inert added fields, duplicate business labels, unit/type conflicts, and raw scalar fidelity.
- Unique-key reorder and selected-column reorder preserve key/value membership; duplicate source keys retain documented positional limits.
- Calculated values 11/13, lookup aliases 20/25, expanded values 1/2/3/4, and grouped sums 4/6 identify exact inputs.
- Ambiguous lookup candidates have no supplier. Absent and own-undefined cells remain distinguishable through raw-table restore.
- Direct/worker parity, pending snapshot consistency, and stale replies preserve the correct evidence.
- JSON and text roundtrips, selected-view export, zero-row chart bindings, and exact pair-filter restore.
- Proposed budget boundaries accept 100,000 pairs/2,000,000 cells and reject the next excess, including chained steps.
- Preview/cancel emit no mutation; Apply emits one operation; dependency checks and settings recovery work.

Update `apps/demo/src/docs/pages/project-folders.mdx`: Query steps and **Unpivot repeated measurements**.
Explain grain, counts, missing values, units, fixed selection, tracing, and refresh identity limits.
Add `/examples/repeated-measurements`, with Wide records and Measurements project views.
Follow `apps/demo/src/demos/multiSourceShop.ts`; register in `examples.ts` and `coverage.ts`.
Wire the docs example through the existing catalogue/live-example system. Add targeted coverage for the new query step.
Keep docs and the runnable example in this feature delivery.

Verify real pointer and keyboard flows at 1280, 783, and 390 px.
Cover mapping order, errors, empty results, exact selection, inspection, edit/remove, restore, and focus return.
Use current UI defaults for controls, tooltips, viewport bounds, and tokens.
Take PR screenshots with `pnpm shot`; add a minor changeset for the eventual library feature.
Run targeted checks while working, then one `pnpm check` before that implementation PR.

Main risk: treating copied or grouped measurements as independent records, or showing cells from a newer source snapshot.
Exact evidence fixtures and empty-result restore are release requirements.

## M2 — Explicit refresh repair and broader selection

Add a compact review for newly available columns and an explicit rebind for removed columns.
Show changed pairs before acceptance. New columns remain unselected until accepted.
Add **All measurements for these input rows** as a separate action using immediate input result keys.
It must not widen to records sharing the same displayed business identifier.

Change the editor, query panel, stage rows, step editing, and row-key helpers as needed.
Test repair/cancel, changed keys, new-view rules, grouped inputs, and selection save/restore.
Extend the same docs page with **Refresh and repair** and **Selecting measurements or input rows**.
Extend the runnable example with new-column, renamed-field, and duplicate-label refresh variants.
Verify both actions at all three widths with pointer and keyboard.
Main risk: silently expanding the population or a saved selection.

## Deferred scope

Explore explicit multiple value families and global quantity/unit metadata separately.
Defer patterns, wildcard membership, reverse pivot, and automatic schema inclusion.
Avoid chart-only reshaping as this feature's saved representation, implicit coercion, automatic unit conversion,
identity inferred from display labels, a general graph editor, and a separate execution platform.
Ordinary prepared long sources remain useful throughout.

## Preserved Pro result materials

[Original Pro reports and artifacts for #518](assets/pro-results/wide-long-2026-10-23/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
