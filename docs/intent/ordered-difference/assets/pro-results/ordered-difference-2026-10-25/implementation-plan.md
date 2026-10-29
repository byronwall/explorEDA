# Ordered lag and difference preparation — implementation plan

**Build:** a row-preserving `ordered` project step, presented as **Compare observations**, with deterministic predecessor selection, reusable lag/difference fields, and exact comparison inspection.

**Baseline reviewed:** `95832bd473884aeae23453af0888b4ca5187820d`.  
**Date:** October 25, 2026.  
**Owner of implementation:** Codex, after review with Byron.  
**This document:** a complete proposed plan. No repository implementation, merge, deployment, dependency installation, or product browser test was performed during this mission.  
**Design rationale and source comparison:** [design-report.md](design-report.md).

## 1. Delivery order and acceptance contract

Use two independently useful releases.

| Milestone | User outcome | Planning estimate |
| --- | --- | --- |
| **M1 — Reusable ordered preparation** | Author/edit project text or a native API definition; chart, filter, summarize, inspect, save/reopen, and refresh the prepared fields safely. | **9–14 engineering days**, including persistence/schema/identity integration, documentation, and verification. |
| **M2 — Compact visual authoring** | Create/edit the same definition in Query, preview actual pairs, preserve output IDs, and move across one adjacent filter with dependency checks. | **3–5 engineering days**, including docs/example updates and responsive acceptance. |

These are judgment estimates for a developer familiar with the repository, not measured implementation durations. Much of M1 is integration: empty-schema handling, saved selections, worker snapshots, and folder persistence. The predecessor algorithm is a relatively small part.

M1 is a complete text/API workflow. The existing folder application reloads externally edited project text; no browser project-text editor is assumed. M2 is the finished default in-app authoring experience. Do not make a parser-only or evaluator-only release.

### Fixed scope

- Lag and numeric difference; one or more outputs share one predecessor mapping.
- Exact typed partitions; explicit multi-field typed order and direction.
- Positive safe-integer observation offset, default 1.
- Missing measures retain positions; invalid partition/order rows retain output rows but do not enter the sequence.
- Full-order ties make the affected eligible partition unavailable.
- Current row identity/grain and input row order remain unchanged.
- No general window language, ranking, cumulative statistics, imputation, forecasting, calendar buckets, new backend, or client/server fallback.
- Elapsed duration, rate, skip-missing comparisons, and lead are deferred.
- React, TypeScript, pnpm, shared value parsing, and host-owned storage remain the implementation constraints.

### Recommendation trace

| IDs / disposition | Implementation commitment | One-line reason |
| --- | --- | --- |
| OD-01, OD-02 · **Build** | M1 model, validator, typed ordering, evaluator. | Put deterministic preparation in the existing query graph. |
| OD-03, OD-04 · **Build** | M1 tie blocking, retained unsequenced rows, exact issue counts. | Preserve grain without inventing neighbors. |
| OD-05, OD-06 · **Build** | M1 fixed position retention, raw lag, finite numeric subtraction. | Make every result’s meaning consistent and inspectable. |
| OD-07 · **Build** | M1 compact comparison evidence and downstream drill. | Separate value dependencies from current membership. |
| OD-08 · **Build** | M1 filter-position semantics; M2 adjacent-filter movement. | Show when a filter changes predecessor choice. |
| OD-09, OD-10 · **Build** | M1 applied snapshots and guarded exact-selection tokens. | Prevent refresh from relabeling or retargeting records. |
| OD-11 · **Build** | M1 JSON/text/folder/declared-schema round trips. | Reusable fields must survive save and empty data. |
| OD-12 · **Build** | M2 visual add/edit/preview. | Complete local analyst authoring. |
| OD-13 · **Build** | Fixtures, tests, docs, and runnable examples in each milestone. | Ship evidence with the capability. |
| OD-14 · **Explore** | M1 actual evaluator/worker profiling. | Measure before choosing optimization work. |
| OD-15, OD-16 · **Defer** | Duration/rate and alternative neighbor populations. | They need separate time/unit/population semantics. |
| OD-17, OD-18 · **Avoid** | Generic windows, canonical chart-local lag, broad lineage/cache/backend work. | Keep the selected feature bounded. |

## 2. Proposed model and API

### 2.1 Project definition

Add the following conceptual types to `packages/explorEDA/src/types/AnalysisProject.ts`. These are proposed shapes, not an implemented patch.

```typescript
type OrderedReadType = "number" | "date" | "string" | "boolean";

type OrderedClause = {
  fieldId: string;
  type: OrderedReadType;
  direction: "asc" | "desc";
};

type OrderedOutput = {
  id: string;
  label: string;
  operation: "lag" | "difference";
  fieldId: string; // A field in the input frame, never another sibling output.
};

type OrderedStep = {
  id: string;
  kind: "ordered";
  inputStepId: string;
  partitionBy: string[]; // [] means one global partition.
  orderBy: OrderedClause[];
  offset: number;       // Positive safe integer; authoring default is 1.
  outputs: OrderedOutput[];
};
```

Add `OrderedStep` to `AnalysisStep`. Runtime definitions are explicit; JSON does not silently repair missing properties. Project text may omit `offset` and compile it to 1. Empty `partitionBy` is valid.

Output fields:

- Lag: `id = output.id`, `name = output.label`, inherited declared input type, `origin = { stepId }`.
- Difference: the same identity/name/origin pattern, with `type: "number"`.
- Fields exist on empty input and when every output value is unavailable.
- No overwrite of an input field or another output.
- Renaming a label preserves `id`.
- Same-step output references are rejected; an additional step can consume the first step’s outputs.

The public `exploreda/analysis` entry is `src/analysis.ts`, as established by `entries.json`. It already re-exports all `AnalysisProject` types. No new package subpath or entry-map change is needed for these types. Keep new helper functions internal unless a concrete host use requires an explicit export.

Add optional `SourceDefinition.keyOrigin?: "row-position"` as the narrow provenance marker for importer-generated positional keys. `sourceFromRows` sets it only on the branch that actually synthesizes the key. A real source column named `row_number` is not marked merely by its name. Validate/preserve the marker in native JSON and source text as `key-origin=row-position`; it requires a nonempty declared key field.

### 2.2 Evaluation evidence

Extend `AnalysisResultRow` with one bounded comparison map and a small positional-identity flag:

```typescript
type OrderedPairStatus =
  | "paired"
  | "insufficient-history"
  | "missing-partition"
  | "invalid-partition"
  | "missing-order"
  | "invalid-order"
  | "ambiguous-order";

type OrderedRowComparison = {
  inputRowKey: string;
  predecessorRowKey?: string;
  status: OrderedPairStatus;
  issueFieldIds?: string[];
};

// Proposed optional additions to AnalysisResultRow:
type OrderedResultAdditions = {
  orderedComparisons?: Record<string, OrderedRowComparison>;
  identityScope?: "snapshot";
};
```

The comparison map is keyed by ordered step ID. Its definition identifies the input stage. Resolve current and predecessor values from that retained stage in the same completed evaluation; do not copy full rows into every entry.

`identityScope` is omitted when current identity follows the existing semantic/unique-key construction. Source fallback rows and sources explicitly marked with row-position key provenance are snapshot-bound. It marks current identity, not the presence of any positional dependency.

Add optional `orderedStats` to `AnalysisStage`, containing:

- `outsideSequenceRows`, broken down by exclusive primary status.
- `eligibleRows`, `blockedRows`, `ambiguousPartitions`, `tiedGroups`, `tiedRows`.
- `pairedRows`, `insufficientHistoryRows`.
- Per-output counts: lag copies/nonmissing copies/no-copy rows; difference finite/unavailable results.
- Partition summaries sufficient to show known-partition omitted-order rows; unassigned partition rows remain a separate category.

The exact internal collection representation can remain ordinary arrays/maps/records. It must be structured-cloneable and must not include React objects, functions, or references to mutable host state.

The step keeps `inputCount === outputCount`, existing `rowUnit`, and `excludedCount === 0`. Its unsequenced rows are not removed rows.

For a visible high-level warning, add at most one `ordered-data` diagnostic per affected ordered step when partition/order problems or ties occur. In `QueryFlow.DIAGNOSTIC_TEXT`, count these as **steps with unavailable comparisons**, not rows. Stage statistics carry the exact record counts. Ordinary first observations and missing measures are explained in output counts, without emitting one warning object per row.

### 2.3 Applied state and selection guards

Extend `AnalysisEvaluationState` with the completed evaluation’s applied project, immutable tables references, and host-side query-source snapshot scope. Capture them with the request that produced the accepted result, beside `appliedBindings`.

Selection encoding must validate two independent facts:

1. **Key-definition descriptor:** a canonical description of the key recipe, including source IDs/key fields/key origin and the relevant expansion/group step IDs, relationship endpoints, and group field IDs. A source-row recipe passes unchanged through lookup, filter, calculate, and ordered operations. The descriptor changes if a key-producing definition/grain changes.
2. **Source-snapshot scope for positional identity:** a session discriminator plus an epoch for the reachable source arrays and source key definitions. Stable identities omit this scope. A changed reachable source conservatively invalidates positional selections.

`selectionIdentity.ts` owns one host-runtime session discriminator and a `WeakMap` identity for source arrays. Derive query-source scope from reachable source IDs, those array identities, and key definitions/origin, rather than the outer tables wrapper. `singleTableProject` and `useAnalysisEvaluation` call this same helper with the returned tables' source arrays; an independent hook-local epoch would incorrectly invalidate freshly imported selections. Capture the resulting context with each evaluation request and retain it as applied context. A genuine reimport, reopen, or cross-runtime handoff changes arrays/session and deliberately invalidates positional tokens. Ordinary same-runtime conversion needs no new public context parameter.

Encode this metadata around the existing row key in a reserved scalar token, rather than changing `row.key`. A canonical serialized descriptor is sufficient; do not add a persistent identity database or hash the data content. The precise reserved encoding is an implementation detail, but it must be collision-safe, unambiguous, and tested.

Validate both before resolving a token to a current numeric chart ID. Unscoped persisted choices in the guarded ordered workflow become visibly unresolved; do not silently treat a numeric position as proof of identity. Newly saved stable selections round-trip when their descriptor and key still match. Newly saved positional selections remain live only for their original session/source snapshot and become unresolved on fresh reopen.

Apply the same guard to:

- Row-ID filters encoded in chart settings.
- `AnalysisView.inspection.rowKey`, using the inspected stage’s key recipe.
- `selectedRowKeys` wherever a host consumes that optional field; the supplied wrapper does not currently use it as its primary chart-selection channel.
- Exact focused row sets, which already clear when evaluation changes.

Count unresolved choices from decoded/rendered settings, not solely from the original saved settings. Reuse the existing unresolved-marker behavior. While a worker is pending, encode/decode using the **applied** descriptor/scope, never current incoming tables.

## 3. Core semantics Codex should preserve

### Partitions

Use exact stored primitive value and type. `1`, `"1"`, `true`, and `"true"` are distinct; `-0` and 0 are equal. Nonblank string case and whitespace remain significant. Use collision-safe tagged tuples.

Use `isMissingValue` for null/undefined/blank partition cells. Nonfinite numeric partition cells are invalid. Neither missing nor invalid partition cells create a shared unknown-entity group.

### Order

Normalize each declared order field once:

- Number: `finiteNumber`.
- Date: `timestampOf`, with the current default shared parser and milliseconds.
- Boolean: `parseBoolean`.
- String: actual nonmissing strings and deterministic UTF-16 code-unit ordering.

Do not read chart/table sort, displayed type overrides, field formatting, a view’s date preset, source arrival order, or row identity as an order clause. A view using day-first formatting cannot change saved preparation; for example the current default parser interprets `01/02/2026` as January 2.

Every order clause must be valid. Compare lexicographically with each clause’s own direction. Full normalized equality is a tie, including normalization collisions.

### Status precedence and ties

Compute all relevant field-level reasons, then select one primary row status in this priority:

1. Missing partition.
2. Invalid partition.
3. Missing order.
4. Invalid order.
5. Ambiguous order.
6. Insufficient history.
7. Paired.

Rows in the first four categories retain their current output rows but do not enter the sequence. Build known-partition omitted-order summaries before excluding them from the sort.

For eligible rows, any duplicate full tuple blocks the entire eligible partition. Keep exact tied membership separately from all affected rows. No hidden tie break. Other partitions still run.

### Offset and values

For sequence position i and positive safe integer k, use position i-k when it exists. All missing/invalid measures retain positions.

- Lag copies the raw scalar. Copying null/blank/undefined is successful raw-lag semantics with a missing value.
- No predecessor produces undefined.
- Numeric difference requires both operands to pass shared numeric rules, then computes current minus predecessor.
- An invalid operand or nonfinite subtraction result produces undefined.
- A declared date/boolean field is an invalid difference target. A date field stays invalid even if its raw payload is numeric.
- Untyped numeric timestamps cannot be detected automatically. If treated as ordinary numbers, the output has no duration semantics.
- Finite arithmetic is binary64; no decimal/big-integer guarantee, automatic unit conversion, imputation, or rounding.
- Both invalid operand reasons may be shown. Count the unavailable result row once.

### Scope and reuse

A query filter before the ordered step changes its population. A filter afterward preserves chosen predecessor evidence. Workspace selections, chart filters, table search, and display sort only operate on prepared rows.

Prepare rows in the input grain. After expansion, the observations are expanded rows. After aggregation, they are groups. No silent deduplication or automatic “one row per device” conversion.

### Evidence propagation

Keep key/sourceRows/contributors and input row order. Preserve earlier comparison entries by reference through row-preserving operations and expansion. A new ordered step adds its own entry. Aggregation creates a new row and does not union predecessors into membership.

Numeric aggregate drill uses its immediate input stage and existing `measureContributors[].rowKey`, then the member’s ordered evidence. Count/group-only drill may show exact **Group members** using the existing group-key helper. Do not label all group members as included count contributors: count(field), per-entity deduplication, and conflicts have additional existing rules.

## 4. Concrete file and module plan

Unless written in full, paths in this section are relative to `packages/explorEDA/src/`.

### Existing files to update in M1

| File / symbol | Change | Material acceptance |
| --- | --- | --- |
| `types/AnalysisProject.ts` | Add OrderedStep, comparison evidence, identity flag, ordered stage stats, and one step-level diagnostic code. | Type union is exhaustive; runtime metadata is not serialized as source data. |
| `lib/analysis/evaluateProject.ts::evaluateAnalysisQuery` | Dispatch ordered frame, preserve counts/grain, validate before data, compute schema on empty input. | F1, ties, filters, empty frame, and chained operations match exact expectations. |
| `evaluateProject.ts::sourceFrame/sourceReferences/expandedFrame/aggregateFrame` | Set/preserve snapshot identity according to actual key construction; expose unchanged grouping helper for inspection where needed. | A stable row with a positional lookup remains stable; an aggregate with positional members is a semantic group. |
| `lib/analysis/sources.ts::sourceFromRows/singleTableProject` | Mark generated row-position key provenance; pass guarded identity context to the existing selection-conversion call. | Generated unique-looking keys are snapshot-bound; imported current selections remain valid in their live scope. |
| `lib/analysis/projectFile.ts::validateAnalysisProjectFile/fieldsAt` | Update both allowlists and explicit branch; carry enough field metadata for validation; allow empty entityKey, reject unknown nonempty key. | Valid keyed/keyless native files restore; malformed ordered definitions fail even on empty data. |
| `lib/analysis/useAnalysisEvaluation.ts` | Retain applied project/tables/scope with finished result. | Delayed worker result never mixes records/rules from another generation. |
| `lib/analysis/analysisWorkerProtocol.ts` | Use the same evaluator and transport cloneable new result metadata. | Direct/worker results agree, including unavailable reasons and evidence. |
| `components/ExplorEdaProject.tsx` | Separate current editing props from applied inspection props; pass identity context to selection encoding/decoding. | Old completed result is coherent while updating; late results are ignored. |
| `components/project/analysisRowKeys.ts` | Add guarded token encode/decode and unresolved reporting. | Reorder cannot retarget positional selections; stable tokens follow current records. |
| `components/project/QueryStageRows.tsx` | Add Comparison section and exact input-stage role navigation; keep Related records separate. | a2b still reveals a2a after a downstream filter removes a2a. |
| `components/project/ProjectQueryPanel.tsx` | Supply full applied evaluation/context to comparison inspection; route group/member drill correctly. | Final aggregate keys are not blindly used as earlier-stage focus keys. |
| `components/project/QueryFlow.tsx` and `queryEditing.ts::stepTitle/stepDetail` | Ordered rule, row-preserving counts, scoped warnings, and summary. | “8 rows” remains true; tied/unsequenced rows are counted separately. |
| `components/project/stepEditing.ts::queryFields/removeStep` | Recognize ordered generated fields via empty evaluation; validate dependencies. | Removing a needed step is blocked; an empty query still exposes output fields. |
| `lib/dsl/project.ts::stepLines/compileStep/checkReferences` | Compile/export strict ordered block, retain IDs/types/directions/offset/outputs, validate available schema. | Full model roundtrip, including no partition and explicit from. |
| `lib/dsl/project.ts::compileQuery` | A malformed ordered block makes its containing query unavailable rather than silently omitting preparation. | A bad offset cannot turn a prepared query into a seemingly valid source-only result. |
| `lib/dsl/parse.ts` | Only a small duplicate identity-token diagnostic if needed for strict malformed cases. | No new grammar; nested declarations already parse. |
| `lib/project/writeFolder.ts::projectFileText` | Serialize modified implicit queries; omit only unchanged canonical source-only definitions. | Add preparation to initially implicit readings query, save, reopen: it remains present. |
| `lib/project/folder.ts::inferSource/readProjectFolder` | Forward generated-key provenance only when adopting the inferred key; reconstruct an explicitly marked generated field when entirely absent from the raw file; preserve declared field metadata. | Inferred source/path declarations retain their intended form and generated keys cannot claim durable identity. |
| `lib/dsl/compile.ts::DslCompileOptions/compileDocument` | Add optional declared fields/types to known-field and type resolution. | Empty/all-null query fields compile without fake rows. |
| `lib/dsl/export.ts::DslExportOptions/exportParts` | Use declared schema when export validates skeleton/field references. | Empty-result chart export does not discard Change as unknown. |
| `lib/project/analysisText.ts::readAnalysisText/exportAnalysisText` | Pass fields and rows from the same evaluation; preserve same-query view export contract. | .eda view roundtrip works with zero result rows. |
| `lib/notebook/readNotebook.ts::readNotebookText/NotebookReadResult` and `compileNotebook.ts` | Carry and return evaluated schema beside rows through existing compile options, preserving block line offsets and last-valid handling. | .eda.md fields remain known on empty/singleton/all-null results. |
| `lib/notebook/writeBack.ts::partFor/rebuiltPart/writeBackChart` | Forward declared fields/types from notebook compile options into every `exportParts` call. | A chart edited on empty/all-null results writes back, saves, and reopens with the same field references. |
| `components/notebook/ExplorEdaNotebook.tsx::useNotebookResult/handleStateChange` | Forward the same declared schema into `compileNotebook` and `writeBackSettings`, including memo dependencies. Reuse existing `fieldTypes` while retaining all declared IDs, including unknown fields. | The mounted notebook compiles and writes edits with the same evaluated rows/schema; empty outputs do not lose fields between reader and UI. |

`lib/dsl/views.ts` may need a narrow per-view export-options forwarding extension if the existing call site cannot supply the query’s declared schema. Preserve its existing shared-definition restrictions. No general heterogeneous-query export rewrite is part of this plan.

`components/project/sourceRowIdentity.ts` remains the source-record resolver, but callers must resolve against applied tables. Its positional fallback is not a durable-refresh guarantee. A small assertion/guard is appropriate; do not change strict relationship matching.

### Proposed modules

These filenames are additions, not claims that modules already exist.

- **`lib/analysis/orderedDefinition.ts`**
  - Structural/field validation and output schema.
  - A shared problem list for editor/text/JSON, with an assertion adapter for runtime.
- **`lib/analysis/orderedValues.ts`**
  - Tagged partition tuples, order normalization/comparison, and shared output reading.
  - Use only `valueParsing.ts` for raw conversion.
- **`lib/analysis/orderedFrame.ts`**
  - Partition/sort/tie/predecessor pass, output emission, evidence, and counters.
  - One predecessor choice per current row for all outputs.
- **`lib/analysis/orderedInspection.ts`**
  - Resolve a comparison from the same evaluation, explain values/statuses, and retrieve role-specific records.
  - Reuse input stages instead of flattening transitive dependencies.
- **`lib/analysis/selectionIdentity.ts`**
  - Canonical key-definition descriptors and shared host query-source snapshot scope, including the source-array identity ownership rule above.
  - Keep it small; no persistent registry or content hashing.
- **`components/project/OrderedComparisonDetails.tsx`**
  - Current/previous records, rules, results, omitted-order rows, and source tables.

M2 adds **`components/project/OrderedStepEditor.tsx`** and a small **`components/project/orderedStepEditing.ts`** helper for immutable drafts, unique output IDs, and adjacent-filter rewiring. Share existing field pickers, metadata, tooltip, button, and panel conventions.

Prefer focused modules over enlarging `evaluateProject.ts` with another large inline subsystem. Keep scalar Calculator and its function registry unchanged.

### Definition validation checklist

Use one semantic contract at runtime, JSON, text, and editor Apply:

- Step/field/output IDs are nonempty and unique in their required scope.
- Input exists and the graph remains acyclic.
- Partition/order/measure references exist at this input stage.
- No duplicate partition or order fields.
- At least one order field and one output.
- Every order type/direction and output operation is supported.
- Offset is a positive safe integer.
- Outputs do not collide with input or each other.
- Outputs cannot depend on sibling outputs.
- Known date/boolean difference targets are rejected.
- Unknown properties that purport to change ordered semantics, repeated options, extra positional tokens, and unexpected child bodies fail.
- JSON does not coerce strings to configuration numbers.
- Text defaults are deliberate; invalid text does not silently fall back to offset 1.
- Empty rows do not bypass any structural/field validation.

When a project source has undeclared inferred fields before folder loading, check shape immediately and field existence after source inference. Do not reject a legitimate short source declaration merely because its file has not been read yet. Do not run a partial malformed ordered query while waiting for inference.

Generated-position lifecycle rule: keep the importer's existing key choice and values. When adopting an inferred generated key, include its generated field metadata even when the source otherwise declares fields. When an explicit `key-origin=row-position` source is reloaded and its raw file entirely lacks the named generated field, add that field to copied rows as index plus one. If the field is present, preserve supplied values; do not fill missing cells or overwrite data. Without that exact origin marker, a missing arbitrary key remains missing. Native JSON already contains generated values and only needs marker preservation. When inference is called solely for field metadata on a source with an explicit key, keep its existing key origin rather than copying an unused inferred key's marker.

## 5. M1 — Complete text/API preparation, inspection, and persistence

### Useful flow to ship

The analyst opens the bundled readings project, edits the ordered block in `exploreda.eda`, sees the existing folder application reload it, charts Change, traces a2b to a2a, compares the two filter-position queries, saves/reopens, and views the same fields in a notebook.

The native API path constructs the same model and calls the existing evaluator or `ExplorEdaProject`. There is one semantics implementation.

### Internal implementation order

These are work steps inside M1, not separate releases.

1. Freeze fixture F1 and the independently enumerated expected maps.
2. Add model types and validation/schema helper; prove empty-frame field generation.
3. Add normalized ordering and ordered-frame evaluation; retain input row order and current membership.
4. Add bounded comparison inspection, stage summaries, and downstream numeric-measure drill.
5. Add applied snapshot and exact-selection guards.
6. Integrate JSON, strict project text, and implicit-query promotion.
7. Pass declared schema through analysis/notebook compile, export, and chart write-back.
8. Register a runnable standalone project example and docs; complete targeted and browser verification.
9. Measure real evaluation/worker costs, fix concrete bottlenecks if needed, run the repository gate once, and include a minor changeset.

### Runnable example in this milestone

Create proposed `apps/demo/src/demos/orderedReadings.ts`, following the supplied `multiSourceShop.ts` project example pattern. Register **ordered-readings** in the existing `apps/demo/src/demos/examples.ts::examples`, using its project/tables/views support.

Also supply a project folder under proposed `apps/demo/public/examples/ordered-readings/`:

- `exploreda.eda`: source plus base, filter-before, filter-after, and grouped queries.
- `data/readings.json`: exact F1 scalars, preserving null and numeric values.
- `changes.eda`: row table, a change chart, and a grouped summary over the chosen query.
- `changes.eda.md`: a notebook using the same prepared fields, with prose explaining missing measurements and filter position.

Use JSON for the primary fixture so exact raw scalar expectations do not depend on CSV import inference. If a CSV example is added, document and test its actual imported types rather than assuming byte-for-byte scalar parity.

The proposed route is `/examples/ordered-readings`, using existing `routes.ts::examplePath`. The folder itself can be opened by the local app without copying it into a source table catalogue.

### Project-text example

This syntax is proposed and becomes runnable only after M1.

```text
project @ordered_readings

source @readings key=id path=data/readings.json {
  field id string
  field entity string
  field at "Time" date
  field seq "Sequence" number
  field value "Reading" number
}

query @reading-changes "Reading changes" glyph=R frame=readings {
  source readings
  ordered @changes by=readings.entity offset=1 {
    order readings.at type=date direction=asc
    order readings.seq type=number direction=asc
    lag @previous_value readings.value label="Previous reading"
    difference @change readings.value label="Reading change"
  }
}
```

Do not put semicolons between child declarations; the current parser uses line boundaries.

A notebook can use ordinary result aliases without authoring the step inside its blocks:

````markdown
# Change between readings

The comparison uses the previous ordered record within each entity.
Missing readings keep their place.

```eda
eda query=reading-changes
entity:cat=readings.entity
time:date=readings.at
reading:num=readings.value
previous:num=previous_value
delta:num=change
```

```eda
table @comparisons readings.id,readings.entity,readings.at,previous_value,change
line @changes_a x=time y=delta where.entity=A title="Entity A change"
line @changes_b x=time y=delta where.entity=B title="Entity B change"
```
````

The aliases and chart forms follow the existing notebook/dashboard text surface. Validate the exact settings through the compiler during M1. The separate entity-filtered panels avoid joining A to B as one sequence; their filters affect display, not preparation. The table is the primary exact-record example.

### Documentation in the same milestone

- Add `apps/demo/src/docs/pages/ordered-comparisons.mdx`.
  - Text authoring, Within/Order/offset meaning, missing/tie policy, raw lag versus difference, inspection, filter position, and refresh.
  - Show exact F1 and the 4-versus-8 middle-record example.
- Update `project-folders.mdx` with the new query-step block and modified implicit-query save behavior.
- Update `notebooks.mdx` with prepared-field aliases and the boundary between notebook display filters and query filters.
- Register the docs page in `apps/demo/src/docs/catalogue.ts`, linking its `examples` to the standalone project example.
- Update required feature coverage in the docs registry only through the established coverage/gate mechanism after inspecting the current integration checkout.

The existing `docs/live/examples.ts::LiveExampleSpec` accepts a single data path and saved settings, not a project/tables bundle. M1 therefore uses a linked standalone project example and a dedicated project browser test. Do not quietly broaden the inline example runner.

### M1 exit criteria

- F1/F2/F3 and the material edge cases below pass the real evaluator.
- Original row keys, source membership, contribution membership, row unit, and input presentation order remain intact.
- Empty schemas and zero/singleton/all-null notebook views keep generated fields and their declared types.
- Editing and saving a notebook chart with an empty/all-null result preserves its field references on reopen.
- Every unavailable comparison is explained; no hidden tie/order fallback.
- Native/file/folder round trips preserve definitions and recompute values.
- An edited implicit source query survives folder reopen.
- Stable exact selections follow current records; positional or incompatible-definition bookmarks become visibly unresolved.
- Worker-pending inspection uses one applied generation.
- New docs and the standalone example ship with the feature.
- Product checks at 1280/783/390 px pass, and the measured workload has no unexplained severe regression.

**Main M1 risk:** a correct-looking output paired with a wrong predecessor, stale source generation, or retargeted saved row. Treat the combined oracle/inspection/refresh scenario as the key acceptance proof.

## 6. M2 — Compact visual authoring and adjacent-filter movement

### Useful flow to ship

In Query, choose Compare observations, build the same saved definition with field controls, inspect the draft pairs, Apply once, edit an existing step, and move it across a neighboring filter when dependencies permit.

### Controls and state

- **Within:** shared field picker; empty selection visibly means All records.
- **Order / Then by:** one row per field with type and direction; keyboard-accessible add/remove/reorder controls.
- **Observations back:** positive integer input, default 1; invalid draft stays local.
- **Outputs:** input field, Previous value/Difference operation, and label; IDs generated once and retained through label edits.
- **Scope summary:** row grain, partition/order clauses, offset, fixed missing-position rule, and omitted/blocked counts.
- **Preview:** bounded current/predecessor rows and results, visible “first N shown” limit, precise statuses, and access to tied/omitted records.
- **Apply / Cancel:** one committed definition transaction; Escape cancels and returns focus. No mutation of a shared copied-query nested array.
- **Shared query:** identify that changes affect views reading it; existing Copy query supplies the independent route. Do not add a routine permission gate.
- **Edit:** reopen an ordered node with the exact saved clauses and output IDs.
- **Remove:** reuse dependency checks for downstream query fields and affected views.

### Graph movement

Implement only a swap with one adjacent filter on an unambiguous single-consumer chain. If the edge is branched, offer Copy query/edit project text instead of guessing which dependents to rewire.

For `S -> F -> O -> D`, moving O before F produces `S -> O -> F -> D`; update both affected `inputStepId` values, downstream references, and `outputStepId` when necessary. Moving in the reverse direction is symmetric.

Reject a move if the filter reads an ordered output before it is produced. Re-run shared definition/query-field validation on the proposed graph before committing it. Preserve the existing output IDs and field dependencies; array ordering alone is insufficient.

### Files

- New `OrderedStepEditor.tsx` and `orderedStepEditing.ts`.
- `ProjectQueryPanel.tsx`: add/reopen action.
- `QueryFlow.tsx`: edit/move affordances and current/draft status.
- `stepEditing.ts`: shared dependency validation and removal semantics.
- `queryEditing.ts`: preserve immutable copies/labels.
- Existing panel/field-picker components are reused, not replaced.

### Docs and example in the same milestone

Extend `ordered-comparisons.mdx` with the visual author/edit journey and filter movement. Update the same `ordered-readings` example to begin from a source query and guide creation of F1. Retain the prepared text example as a reproducible reference.

Extend the standalone browser scenario to exercise actual controls, Cancel/Apply, label edits, shared-query copying, tie repair, and blocked filter movement at all required widths.

### M2 exit criteria

- Visual creation produces the same explicit model and F1 outputs as project text.
- Editing a label changes only the label; changing an order clause changes intended predecessors and updates exact evidence.
- Escape/Cancel leaves model, values, and undo history unchanged.
- Apply commits one change and persists it.
- Moving the a2a-removal filter changes a2b from 4 to 8 only when the graph population changes.
- A filter `change > 0` cannot be moved before Change exists.
- Focus, accessible names, preview limits, and viewport bounds work at 1280/783/390 px.
- Docs, example, and a minor changeset accompany the shipped controls.

**Main M2 risk:** a preview and Apply evaluate different graph positions, or a visual reorder changes array order without changing the query dependency edges.

## 7. Canonical fixtures and exact assertions

Use constants written from the named sequences below, not snapshots generated by the production ordered evaluator. Independently verify IDs before arithmetic.

### F1 — Two entities, unsorted source, tied timestamp, missing measure

The source key is `id`; partition is `readings.entity`. Order `readings.at` as date ascending, then `readings.seq` as number ascending; offset 1. Outputs are lag `previous_value` and difference `change` over `readings.value`.

```json
[
  {"id":"a3","entity":"A","at":"2026-01-03T00:00:00Z","seq":1,"value":null},
  {"id":"b2","entity":"B","at":"2026-01-02T00:00:00Z","seq":1,"value":15},
  {"id":"a1","entity":"A","at":"2026-01-01T00:00:00Z","seq":1,"value":10},
  {"id":"a2b","entity":"A","at":"2026-01-02T00:00:00Z","seq":2,"value":18},
  {"id":"b1","entity":"B","at":"2026-01-01T00:00:00Z","seq":1,"value":4},
  {"id":"a4","entity":"A","at":"2026-01-04T00:00:00Z","seq":1,"value":25},
  {"id":"a2a","entity":"A","at":"2026-01-02T00:00:00Z","seq":1,"value":14},
  {"id":"b3","entity":"B","at":"2026-01-03T00:00:00Z","seq":1,"value":12}
]
```

Hand-enumerated sequences:

- A: a1, a2a, a2b, a3, a4.
- B: b1, b2, b3.

| Current → predecessor | Lag | Difference / reason |
| --- | --- | --- |
| a1 → none | undefined | undefined; insufficient history |
| a2a → a1 | 10 | 4 |
| a2b → a2a | 14 | 4 |
| a3 → a2b | 18 | undefined; current measure missing |
| a4 → a3 | null | undefined; predecessor measure missing |
| b1 → none | undefined | undefined; insufficient history |
| b2 → b1 | 4 | 11 |
| b3 → b2 | 15 | -3 |

Assert output row presentation order is still **a3, b2, a1, a2b, b1, a4, a2a, b3**.

Assert a2b’s key stays `readings:string:a2b`; its sourceRows and contributors still contain only its current source reference in this source-only fixture. Its comparison evidence points at input a2b and predecessor `readings:string:a2a`.

Counters:

- 8 input/output; excludedCount 0.
- 8 eligible; outside sequence 0; blocked 0.
- 6 paired; 2 insufficient history.
- 6 successful lag copies; 5 nonmissing copies; 2 no-copy rows.
- 4 finite differences; 4 unavailable differences: 2 boundaries, 1 current missing, 1 predecessor missing.
- Sum of finite differences 16; mean of finite differences 4.

### F2 — Tie without and with resolution

Remove the sequence order clause:

- Exact tied records: a2a and a2b.
- Tied tuple: A, January 2.
- 1 tied group; 2 tied records; 1 ambiguous partition.
- 5 eligible A rows blocked; their lag and difference outputs undefined, including a1/a4.
- B remains b1→none, b2→b1/lag4/change11, b3→b2/lag15/change-3.
- 8 input/output; 0 dropped rows; paired 2; insufficient history 1; blocked 5.
- Repeat after input reversal: same status membership.
- Add sequence back: exact F1 recovery.

If an explicit additional field still ties, keep the partition blocked. Do not treat an authored but nonunique tie breaker as sufficient.

### F3 — Removed middle observation and downstream contribution

Use query filter `readings.id != "a2a"`.

| Placement | a2b predecessor / values | Aggregate expectations |
| --- | --- | --- |
| Before ordered | a1; lag 10; change 8 | 7 rows; total change 16; A valid sum 8; B valid sum 8. |
| After ordered | a2a; lag 14; change 4 | 7 rows; total change 12; A valid sum 4; B valid sum 8. |

All other retained per-record outputs remain the F1 values.

After-filter A group assertions:

- Current members: a1, a2b, a3, a4.
- Numeric measure candidate records can show unavailable values, but only a2b is included in sum(change).
- Included value: 4.
- a2a is accessible as the comparison dependency for a2b.
- a2a is not a current group member and must not increase row count.
- Group member count 4; count(change) 1; sum(change) 4 under existing null/finite rules.

Workspace selection, table search, display sorting, and chart filtering must preserve the F1 predecessor map. Their display counts can change; the preparation values do not.

### F4 — Offset and direction

Offset 2:

| Current → predecessor | Lag | Difference |
| --- | --- | --- |
| a1 → none | undefined | undefined |
| a2a → none | undefined | undefined |
| a2b → a1 | 10 | 8 |
| a3 → a2a | 14 | undefined |
| a4 → a2b | 18 | 7 |
| b1 → none | undefined | undefined |
| b2 → none | undefined | undefined |
| b3 → b1 | 4 | 8 |

Expect paired 4, insufficient history 4, finite differences 3, sum 23.

With both order terms descending and offset 1:

- a4 → none.
- a3 → a4; lag 25; difference undefined.
- a2b → a3; lag null; difference undefined.
- a2a → a2b; lag 18; difference -4.
- a1 → a2a; lag 14; difference -4.
- b3 → none.
- b2 → b3; lag 12; difference 3.
- b1 → b2; lag 15; difference -11.

With timestamp ascending and sequence descending, A is a1, a2b, a2a, a3, a4: a2b lag10/change8; a2a lag18/change-4; a3 lag14/change unavailable; a4 lagnull/change unavailable. This tests independent directions rather than one global reversal.

Offset 99 is valid on F1: 8 insufficient-history rows, no removals, all prepared outputs undefined.

### F5 — Partition/order eligibility and typed equality

Add these rows individually and together to F1:

- x1: entity A, at blank, seq1, value99 → retained; missing-order; F1 valid pairs unchanged.
- x2: entity A, at `2026-02-30`, seq1, value99 → retained; invalid-order; F1 valid pairs unchanged.
- x3: entity null, valid date, seq1, value99 → retained; missing-partition; F1 pairs unchanged.

Together: 11 input/output, 8 eligible, 3 outside sequence, 6 pairs, 2 boundaries, 4 finite differences. A’s successful pair inspector reports two omitted-order records; one unassigned missing-partition record is reported separately.

For a row with missing partition plus invalid order, primary status is missing-partition, with both field reasons inspectable. It is counted once.

Typed partition fixture, using numeric time order:

- n1=(entity number1,time1,value5); n2=(number1,time2,value8).
- s1=(entity string"1",time1,value50); s2=(string"1",time2,value60).
- Expected n2→n1/lag5/change3; s2→s1/lag50/change10.
- Add true and "true" pairs analogously: they remain separate.
- Empty partitionBy combines otherwise eligible rows; it must not infer an entity partition. Use unique total order in that variant or expect explicit tie blocking.
- Tuple values containing delimiters must not collide. Include two-field partitions whose naive joined text would be identical.

Order-reading cases:

- Numeric order values 2, "10", 1 sort as 1,2,10.
- String mode accepts "2","10","1" and sorts "1","10","2"; raw numeric cells are invalid in string mode.
- Numeric 1 and text "1" tie under number mode.
- `2026-01-01T00:00:00Z` and `2025-12-31T19:00:00-05:00` tie under date mode.
- Date `01/02/2026` is January 2 under the current shared parser; a view preset change leaves it unchanged.
- true and "TRUE" tie under boolean mode; false sorts before true.
- A missing secondary order value makes that row unsequenced even if its first order value is unique.

### F6 — Measures, overflow, dates, and units

Use separate two/three-row sequences with a known predecessor ID:

- Current "12.5", predecessor10 → lag10, difference2.5.
- Current0, predecessor0 → difference0.
- Current true in an otherwise numeric field → unavailable, boolean-not-numeric; it still occupies its position.
- Blank, "bad", "0x1A", NaN, +Infinity, -Infinity → numeric difference unavailable under shared reasons; raw lag copies the actual predecessor scalar on the following row.
- Current `1e308`, predecessor `-1e308` → difference undefined, arithmetic overflow.
- Current0.3, predecessor0.2 → compare difference with tolerance; do not require exact decimal0.1.
- Both operands invalid → show both operand reasons; unavailable-result count increases once.
- Lag of date and boolean fields is allowed and retains the raw scalar/type.
- Difference on declared date/boolean fields is a malformed definition, including a numeric payload in a declared date field.
- Known unit in one numeric input field is carried by label/meaning; no automatic conversion or mixed-unit validation is claimed.

### F7 — Empty, singleton, grain, and downstream use

- Empty input → 0 output rows; generated previous_value and change fields still declared; no pair entries.
- Singleton a1 → 1 row; undefined outputs; insufficient history1; stable fields/types.
- All values null, order valid → same predecessor IDs as the corresponding non-null sequence; lag copies null; no finite differences.
- Scalar step after F1: `twice_change = ["change"] * 2` is still evaluated row-by-row. Assert finite a2a/a2b values8, b2 value22, b3 value-6. Do not change scalar missing behavior.
- Filter `change > 0` after F1 → a2a,a2b,b2; count3; sum(change)19. Moving it before the producer is invalid.
- An ordered step after an aggregate compares group rows and keeps group identity.
- Expansion after ordered preserves the original comparison inputRowKey while creating the existing parent/child output keys.
- Expansion before ordered requires a full order for the expanded rows; repeated parent time/sequence alone may tie and must not silently collapse children.
- Two ordered steps retain distinct entries keyed by their respective step IDs.

Use a very small parent/child fixture: parent p1(value10,time1), p2(value15,time2); children p1:c1,c2 and p2:c3. Ordering after expansion by time alone blocks the partition; adding child ID explicitly orders c1,c2,c3, with differences0 and5. Ordering before expansion yields p2’s change5 once per expanded p2 row and preserves p1’s boundary evidence on both c1/c2 rows. Do not interpret repeated expanded rows as independent original parents in later per-entity aggregates.

### F8 — Refresh, identity, and worker coherence

**Stable keys:**

- Refresh a2a.value from14 to20 with the same IDs.
- a2a→a1, lag10, change10.
- a2b→a2a, lag20, change-2.
- Other predecessor IDs/values unchanged.
- A selection on a2b remains a2b, with new comparison values.
- Remove a2a from refreshed source → the filter-before expectation.
- Reverse input with unique IDs → same map by ID; returned presentation order follows the new input array.

**Positional current identity:**

- Native/API variant with `entityKey: ""` computes the same semantic map when matched by the fixture’s label field.
- Duplicate declared source keys fall back to positional current keys without entering analytic order.
- A source replacement/reorder makes old positional selected tokens and inspection bookmarks unresolved, even if another row now has the same position.
- A fresh native reopen does the same, even if row contents happen to match.
- A current stable row that looks up a positional related row remains stable; do not mark it snapshot-bound merely from all sourceRows.
- A stable group with positional source members retains semantic group identity under the same key recipe.
- A selected group “A” changes from groupBy entity to groupBy region “A”: identical textual row-key suffix is insufficient; descriptor mismatch must make the old exact token unresolved.
- A legitimate key containing the text `:row:` is still a key. Classification follows key construction, not substring matching.

**Folder-generated positions:** remove `id` from F1, leaving repeated entity/date/sequence values and numeric measures. Current `sourceFromRows` synthesizes a key because no qualifying unique ID-like/string field remains. Assert row-position provenance, snapshot-bound current identity, and the same ordered values after raw reorder when matched by `(entity, at, seq)`. The old exact selection becomes unresolved. Also test a real explicitly declared key named `row_number`, a unique imported string field of that name, and an explicit numeric key when inference runs only for field metadata: these must not acquire generated-position provenance. Finally edit source metadata so the generated key is exported explicitly; reopen the original file without the virtual column and verify the explicitly marked column is reconstructed and selections remain snapshot-bound.

**Delayed worker scenario:**

1. Complete evaluation A from original F1.
2. Submit B with refreshed a2a=20 and/or an edited order.
3. While B is pending, inspect a2b. Display A’s value4, predecessor a2a=14, and A’s rules together.
4. Deliver an obsolete reply; it must not replace the pending/latest state.
5. Deliver B. Values, rules, source records, stats, and scope update atomically; a2b now shows -2 for the measure-refresh variant.
6. Verify token encoding during the pending interval uses A’s applied scope.
7. Replace both the affected array and outer tables object in the host fixture.

### F9 — Persistence and malformed definitions

Round-trip F1 through native JSON and project-text compile/export. Assert exact partitions, every order type/direction, offset, output ID/label, input/output step references, and recalculated values.

Folder cases:

- Initially explicit prepared query.
- Initially implicit source query, append ordered preparation, save, reopen: query is serialized and still prepared.
- Unchanged implicit source-only query remains omitted.
- Empty result and all-null result analysis/notebook preserve known generated fields, type, chart IDs, and field references.
- Edit a notebook chart while its query result is empty, write it back, save/reopen, and recompile with the same declared fields; retain the edit and generated-field references. Repeat the all-null output variant in the same test group.
- Preserve existing source inference choices. Test keyless behavior explicitly through native/API input: the current folder reader fills an omitted key with a natural inferred key or a synthesized row-position key. Test both folder branches, their provenance, and the explicitly saved generated-field reconstruction case; do not assume an omitted folder key stays keyless.
- Source data stays separate; comparison maps/stats/identity flags are not persisted as source rows.

Malformed matrix, checked at appropriate JSON/text/editor/runtime entry points:

- Offset 0, -1, 1.5, NaN, Infinity, unsafe integer, and JSON string"2".
- Empty/missing/nonarray orderBy or outputs.
- Unsupported order type/direction or output operation.
- Duplicate partition/order field, duplicate output ID, input/output collision.
- Missing partition/order/measure field at this stage.
- Same-step sibling output reference.
- Declared date/boolean difference target.
- Unsupported source key-origin value, or row-position origin without a nonempty declared key field.
- Unknown/cyclic input step.
- Unknown/repeated ordered options, extra positional tokens, unexpected nested body, repeated identity token.
- A malformed ordered block must not activate a source-only fallback query.

## 8. Tests, browser acceptance, and performance verification

### Small behavior-focused test set

Use a handful of suites with table-driven variants, not one shallow test for every helper.

1. **New `src/test/lib/analysis/orderedObservations.test.ts`**
   - F1 exact mapping, row identity/count/order, and schema.
   - Tie/no-tie plus invalid/typed/missing cases.
   - Filter position, offset/direction, numeric edges, and downstream propagation.
   - Direct evaluator validation on empty data.
2. **Existing `src/lib/dsl/project.test.ts`**
   - One valid roundtrip group and one malformed-definition matrix.
   - Unknown/repeated options fail; partial ordered query cannot become source-only success.
3. **New `src/lib/project/orderedPreparationRoundTrip.test.ts`**
   - Native JSON + explicit/implicit folder save/reopen.
   - Empty/singleton/all-null analysis and notebook compile/export schema, including chart edit/write-back/save/reopen.
   - Existing source inference retained.
4. **New `src/components/project/orderedEvaluationIntegration.test.tsx`**
   - Delayed-worker applied-snapshot scenario.
   - Stable/snapshot/definition-mismatch exact selections and inspection.
   - Existing source-only count/contributor behavior remains intact.
5. **Existing `src/components/project/stepEditing.test.ts`**
   - Generated schema/removal dependencies in M1.
   - Label-ID stability, copied-query immutability, valid/invalid adjacent-filter swap in M2.
6. **New `apps/demo/e2e/ordered.e2e.ts`**
   - One meaningful end-to-end journey at each of the three widths.
   - Add a matching `ordered` project entry in the existing Playwright config, whose current named projects otherwise match their own test files.

The existing `src/test/lib/analysis/evaluateProject.test.ts` is an adjacent regression suite; run it with the targeted tests. Do not rewrite its strict lookup, aggregate, or scalar semantics.

All timeout settings come from `@repo/test-config`. Do not introduce per-test timeouts or run broad build/test gates repeatedly without a concrete reason.

### Browser acceptance at 1280 / 783 / 390 CSS pixels

M1 starts from the registered prepared example and uses external project-text edits plus reload. M2 repeats the same outcome through the new controls.

1. Open a clean ordered-readings example; verify eight current rows and declared reading grain.
2. Read Query’s rule and select a2b. Verify current value `18`, predecessor a2a with value `14`, sequence `2` versus `1`, change `4`, and role-specific source rows.
3. Trace a matching chart mark with Alt-click and keyboard Alt-Enter. Ordinary click remains selection.
4. Reverse the displayed Rows sort; search for a2b; select an entity on a chart. Its prepared predecessor remains a2a and difference `4`.
5. Open the before/after filter recipes: both show seven current rows, but a2b's difference is `8` versus `4`. The after-filter pair still opens a2a.
6. Remove sequence in text (M1) or editor (M2). A is visibly blocked with exact tied rows; B remains usable. Restore it.
7. Inspect a3 and a4: distinguish missing current versus missing predecessor, while keeping the predecessor IDs.
8. Inspect the after-filter A summary: four group members, one included numeric change, sum `4`, separate dependency a2a.
9. Save/reopen explicit and modified-implicit folder cases; verify fields, values, chart IDs, and supported selections.
10. Refresh stable-key data and keyless/duplicate variants. Stable selection follows a2b; positional selection becomes visibly unresolved. Exercise the pending-worker pair scenario.
11. Open the notebook on normal, empty, and all-null query outputs; no unknown-generated-field error. Edit a chart with empty/all-null results, save/reopen, and verify the edit and field references. Exact pair inspection remains in the companion Query workspace.
12. In M2, test keyboard add/reorder/remove order clauses, invalid draft, Cancel/Escape, one-transaction Apply, label rename, query copy, and blocked movement of `change > 0`.

Width-specific checks:

- **1280:** editor/inspection is compact, data remains visible, long names do not cover actions.
- **783:** respect current view-only chart layout behavior; field/order rows and popovers remain within the viewport; actions remain reachable.
- **390:** use the existing full-sheet/panel behavior; scroll content rather than the page horizontally; preserve names, scope, focus return, and reachable Apply/Cancel. The underlying product does not gain a new mobile editing/layout promise beyond these controls.

Check light mode by default and dark semantic border/focus tokens. Missing cells use the existing `null` presentation. Tooltips use shared components; no native title attributes. Preview limits are visible.

### Performance evidence and the implementation gate

Already executed research probe: Node v24.22.1, Linux x64, three samples after a small warmup, ordinary objects and two already-normalized order terms. It did not run explorEDA.

| Workload | Median prepare / structured clone | Additional retained result / cloned result |
| --- | --- | --- |
| 10k rows, 100 partitions | 3.863 / 36.943 ms | 1.447 / 2.800 MB |
| 100k rows, 100 partitions | 44.912 / 379.467 ms | 14.404 / 30.160 MB |
| 100k rows, one partition | 48.761 / 220.122 ms | 14.401 / 30.162 MB |

These are lean synthetic measurements, not product budgets. Raw parsing, wide copied fields, other stages, rendering, real messaging, and invalid/tie handling were absent. Heap numbers are retained deltas, not peak memory. Clone variability was substantial.

During M1, instrument the real path on the integration machine and record:

- Node/browser/device context; row count, partition distribution, field width, order/output count.
- Normalization, partition/sort, output emission, full evaluation, worker transport, and first exact-inspection latency.
- Retained stages, pending old-source retention, and allocation/heap proxy.
- Balanced groups and one large/skewed group; start with 10k and100k rows.
- One representative wide-row and multi-output case, then expand only if a concrete bottleneck remains.
- Direct and worker outputs must be semantically identical.

The algorithm should remain approximately O(N(P+Q) + Q sum(N_g log N_g) + NM), plus current frame-copy width. One mapping is shared across outputs. No cache/index/row cap is selected in advance. If the real path is slow, identify whether parsing, copying, transport, or rendering dominates before proposing a targeted follow-up.

## 9. Independent oracle and command run sheet

The SQL oracle was actually executed during research using installed Python standard-library SQLite 3.53.1. Its expected maps were enumerated separately from the production proposal. It verifies fully ordered numeric/null arithmetic and before/after filtering; it does not implement shared parsing, tie blocking, identity, persistence, or UI.

The following single run sheet first reproduces that independent proof. The pnpm commands that follow are **for Codex after the corresponding proposed files and feature exist**; they were not executed in this mission. Use the repository’s Node/pnpm requirements. Newly named tests, example route, and Playwright project are proposed additions.

```bash
# Independent arithmetic proof; Python stdlib only, no package installation.
python3 - <<'OD_ORACLE'
"""Independent design arithmetic checks, not explorEDA product tests.

The expected maps below were enumerated from named record sequences first.
SQLite's window operator is an independent implementation of the positive,
fully ordered numeric cases. Parser exclusions and product persistence remain
proposed tests because the ordered project step does not exist.
"""

import math
import sqlite3

ROWS = [
    ("a3", "A", "2026-01-03T00:00:00Z", 1, None),
    ("b2", "B", "2026-01-02T00:00:00Z", 1, 15),
    ("a1", "A", "2026-01-01T00:00:00Z", 1, 10),
    ("a2b", "A", "2026-01-02T00:00:00Z", 2, 18),
    ("b1", "B", "2026-01-01T00:00:00Z", 1, 4),
    ("a4", "A", "2026-01-04T00:00:00Z", 1, 25),
    ("a2a", "A", "2026-01-02T00:00:00Z", 1, 14),
    ("b3", "B", "2026-01-03T00:00:00Z", 1, 12),
]

# Each tuple is (predecessor record ID, raw lag value, numeric difference).
BASE = {
    "a1": (None, None, None),
    "a2a": ("a1", 10, 4),
    "a2b": ("a2a", 14, 4),
    "a3": ("a2b", 18, None),
    "a4": ("a3", None, None),
    "b1": (None, None, None),
    "b2": ("b1", 4, 11),
    "b3": ("b2", 15, -3),
}
OFFSET_2 = {
    "a1": (None, None, None),
    "a2a": (None, None, None),
    "a2b": ("a1", 10, 8),
    "a3": ("a2a", 14, None),
    "a4": ("a2b", 18, 7),
    "b1": (None, None, None),
    "b2": (None, None, None),
    "b3": ("b1", 4, 8),
}
DESC = {
    "a4": (None, None, None),
    "a3": ("a4", 25, None),
    "a2b": ("a3", None, None),
    "a2a": ("a2b", 18, -4),
    "a1": ("a2a", 14, -4),
    "b3": (None, None, None),
    "b2": ("b3", 12, 3),
    "b1": ("b2", 15, -11),
}


def database(rows=ROWS):
    connection = sqlite3.connect(":memory:")
    connection.execute("CREATE TABLE readings(id TEXT, entity TEXT, at TEXT, seq INTEGER, value REAL)")
    connection.executemany("INSERT INTO readings VALUES(?, ?, ?, ?, ?)", rows)
    return connection


def query(connection, *, offset=1, descending=False, before="", after=""):
    # Only constant, author-controlled SQL fragments enter this scratch query.
    direction = "DESC" if descending else "ASC"
    statement = f"""
      WITH prepared AS (
        SELECT id, entity, value,
          lag(id, {offset}) OVER w AS predecessor,
          lag(value, {offset}) OVER w AS previous_value
        FROM readings {before}
        WINDOW w AS (PARTITION BY entity ORDER BY at {direction}, seq {direction})
      )
      SELECT id, predecessor, previous_value, value - previous_value AS difference
      FROM prepared {after}
    """
    return {row[0]: tuple(row[1:]) for row in connection.execute(statement)}


def check(name, actual, expected):
    assert actual == expected, (name, actual, expected)
    print(f"PASS {name}: {len(actual)} named records")


db = database()
check("base", query(db), BASE)
check("offset 2", query(db, offset=2), OFFSET_2)
check("all terms descending", query(db, descending=True), DESC)
before = {key: value for key, value in BASE.items() if key != "a2a"}
before["a2b"] = ("a1", 10, 8)
after = {key: value for key, value in BASE.items() if key != "a2a"}
check("filter before", query(db, before="WHERE id <> 'a2a'"), before)
check("filter after", query(db, after="WHERE id <> 'a2a'"), after)
check("reverse input", query(database(list(reversed(ROWS)))), BASE)
check("empty", query(database([])), {})
check("singleton", query(database([ROWS[2]])), {"a1": (None, None, None)})

ties = list(db.execute("SELECT entity, at, count(*) FROM readings GROUP BY entity, at HAVING count(*) > 1"))
assert ties == [("A", "2026-01-02T00:00:00Z", 2)]
blocked_count = db.execute("SELECT count(*) FROM readings WHERE entity = 'A'").fetchone()[0]
assert blocked_count == 5
print("PASS unresolved-time-only-order: 1 tied group, 1 affected partition, 2 tied records, 5 blocked records")

total_base = sum(value[2] for value in BASE.values() if value[2] is not None)
total_before = sum(value[2] for value in before.values() if value[2] is not None)
total_after = sum(value[2] for value in after.values() if value[2] is not None)
assert (total_base, total_before, total_after) == (16, 16, 12)
assert sum(value[2] for key, value in after.items() if key.startswith("a") and value[2] is not None) == 4
print("PASS sums: base 16, before-filter 16, after-filter 12; after-filter A sum 4")

changed_rows = [row[:-1] + (20,) if row[0] == "a2a" else row for row in ROWS]
changed = dict(BASE)
changed["a2a"] = ("a1", 10, 10)
changed["a2b"] = ("a2a", 20, -2)
check("refresh same IDs changed measure", query(database(changed_rows)), changed)

print(f"Oracle runtime: Python stdlib SQLite {sqlite3.sqlite_version}")
print("NOT RUN: explorEDA evaluator, parser, worker, persistence, browser, or performance tests")
for n, groups in [(10_000, 100), (100_000, 100), (100_000, 1)]:
    n_per_group = n / groups
    comparisons = n * math.log2(n_per_group)
    print(f"Analytic comparison scale only: n={n}, balanced_groups={groups}, n*log2(n/group)={comparisons:,.0f}")
OD_ORACLE

# AFTER M1 implementation: targeted contract and integration checks.
pnpm --filter exploreda exec vitest run \
  src/test/lib/analysis/orderedObservations.test.ts \
  src/test/lib/analysis/evaluateProject.test.ts \
  src/lib/dsl/project.test.ts \
  src/lib/project/orderedPreparationRoundTrip.test.ts \
  src/components/project/orderedEvaluationIntegration.test.tsx \
  src/components/project/stepEditing.test.ts
pnpm --filter exploreda check-types
pnpm check:ui

# Docs registry and built-demo browser checks.
# The proposed ordered Playwright project must be registered first.
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify --project=ordered
pnpm --filter demo docs:verify --project=pages -g '/docs/ordered-comparisons$'

# Interactive review: use the URL printed for this checkout.
# pnpm shot captures 1280, 783, and 390 px by the existing repository convention.
pnpm dev:agent
pnpm shot /examples/ordered-readings --name ordered-readings

# For the folder lifecycle, open the bundled project with the local app in
# another terminal using the repository's documented EXPLOREDA_FOLDER flow.
# Use scripts/app-shot.mjs for that app; its change stream prevents ordinary
# network-idle screenshots from finishing. Do not start another shared server.

# Once the feature is sufficiently verified, one broad repository gate.
# Run from one worktree at a time.
pnpm check

# Each feature PR needs its own appropriate changeset; do not publish here.
pnpm changeset:add minor "Prepare reusable previous-observation values and numeric changes with explicit ordering and exact comparison records."

# Stop this checkout's background demo server when review is done.
pnpm dev:agent --stop
```

The oracle’s actual executed output included passing baseline, offset-two, descending, before/after filter, reverse-input, empty, singleton, tie-membership, sum, and stable-ID refresh checks. It did not execute the proposed TypeScript evaluator. Its ISO timestamp strings all share a format/zone, making lexical SQL order suitable for this fixture; it is not an oracle for explorEDA’s general date parser.

Do not run the pnpm portion against the evidence packet: it is a selected-source research input, not a complete installed checkout. Codex runs those commands after implementing the proposed files in its integration checkout.

## 10. Risks, rejection criteria, and deferred work

### Stop a milestone from shipping if any of these occur

- A source reorder changes the per-record map without changing declared order values or eligibility.
- A remaining tie is silently resolved by input position or row key.
- Missing measures are skipped despite the fixed position-retention contract.
- A downstream view filter changes prepared values.
- SourceRows/contributors gain predecessors and thereby change membership/counts.
- A worker result is explained with another generation’s rules or source records.
- Positional or incompatible-definition bookmarks resolve to another record after refresh/reopen.
- A malformed ordered declaration disappears while its containing query runs as a source-only success.
- An edited implicit query is omitted on save.
- Empty results make valid generated fields disappear from analysis/notebook compile or export.
- Documentation/example artifacts lag behind the milestone they describe.

### Deferred work is explicit

- **Elapsed duration/rate:** no hidden subtraction of dates or guessed seconds. A future complete feature must choose a clock field, unit, sign, zero-interval behavior, and units of the resulting rate; ship its own editor, trace, persistence, docs, and example together.
- **Skip-missing neighbors:** a future operation would need output-specific or explicitly shared eligibility, making predecessor evidence different from this operation. No silent switch.
- **Calendar periods and rolling summaries:** remain separate proposal #521; an observation offset is not a completed period.
- **Lead, ranking, cumulative statistics, forecasts, imputation:** outside this mission.
- **General result catalogue, lineage platform, durable identity service, and backend:** not prerequisites.
- **Caches/indexes/limits:** no decision until real measured cost identifies a specific need.

### Implementation boundaries to preserve

- Strict relationship matching remains unchanged.
- Scalar Calculator and function registry remain row-local.
- Existing aggregate count/finite/per-entity semantics remain unchanged.
- Source inference/storage behavior is preserved except the narrow generated-position provenance needed to protect exact selection.
- The package returns data/settings/evidence; the local application owns files and persistence.
- Do not add backward-version negotiation, mixed execution semantics, or a second interpreter.
- Keep user-facing docs and examples about the feature; internal caveats and outstanding tasks belong in the owning intent.

## 11. Evidence and primary sources for implementation decisions

This plan uses the complete 34-file packet and supplemental pinned source reads described in the design report. The baseline is the supplied commit, not an assumed current default branch.

Key repository references:

- [AnalysisProject model](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts): current step/result/view contracts.
- [evaluateProject](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/evaluateProject.ts): frame semantics, keys, memberships, filter position, aggregation, revisions.
- [valueParsing](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/valueParsing.ts): every raw value conversion in this plan.
- [projectFile](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/projectFile.ts): native validation/encoding.
- [stepEditing](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/stepEditing.ts): empty schema and edit/removal rules.
- [writeFolder](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/writeFolder.ts): implicit query omission and source declaration preservation.
- [readNotebook](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/readNotebook.ts): query-backed notebook boundary.
- [analysisRowKeys](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/analysisRowKeys.ts): current bare-key encoding and unresolved markers.
- [sources](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/sources.ts): inferred and synthesized source keys.
- [Repository rules](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/AGENTS.md), [agent guide](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/agent-guide.md), and [UI defaults](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/ui-defaults.md): commands, changesets, docs/examples, and widths.

Primary external documentation supporting the selected boundary:

- PostgreSQL [window tutorial](https://www.postgresql.org/docs/current/tutorial-window.html) and [lag reference](https://www.postgresql.org/docs/current/functions-window.html): analytic order/population and positional lag.
- [DuckDB windows](https://duckdb.org/docs/2.0/sql/functions/window_functions): null-policy choice and buffered evaluation.
- pandas [grouped shift](https://pandas.pydata.org/docs/reference/api/pandas.api.typing.DataFrameGroupBy.shift.html), [grouped diff](https://pandas.pydata.org/docs/reference/api/pandas.api.typing.DataFrameGroupBy.diff.html), and [groupby](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.groupby.html): observation offsets and explicit sorting requirement.
- Polars [over](https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.over.html), [shift](https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.shift.html), and [diff](https://docs.pola.rs/api/python/stable/reference/expressions/api/polars.Expr.diff.html): ordered preparation and row-position mapping.
- Tableau Prep [multi-row calculation workflow](https://help.tableau.com/current/prep/en-us/prep_multirow_calculations.htm) and [function reference](https://help.tableau.com/current/prep/en-us/prep_function_reference.htm): visual authoring and participating-record preview.

All external documentation was accessed October 25, 2026. The precise tie, eligibility, evidence, selection, and milestone contracts are proposals made here, not claims that those products share the same rules.

## 12. Closing status and handoff

**Access status:** passed. All 34 inventoried packet files are present as complete blocks at the named baseline. Supplemental pinned reads resolved notebook-schema, selection, source-inference, grammar, public-entry, and example-registration questions. No decisive missing input remains.

**Files read:** complete rules/context/intents; AnalysisProject, evaluator, file validation, worker hook/protocol, shared parsing/registry; all supplied project authoring/inspection components; supplied DSL/evaluator/editing tests; folder writer/reader; notebook compiler; project-folder/notebook docs; multi-source demo and Playwright config. Supplemental full files and explicitly targeted compiler/exporter sections are listed in the design report’s source section.

**Checks performed:** independent SQLite predecessor maps and arithmetic; tie membership; source-refresh arithmetic; synthetic Node preparation/clone/retained-memory probe; packet and pinned-source reads; primary-source research; adversarial contract/integration review.

**Checks proposed, not performed:** the actual ordered evaluator and all product unit/integration/browser tests; declared-schema and save/reopen proofs; source-refresh selection and worker coherence tests; real product performance profiling. The proposed feature does not exist in the supplied baseline.

**Deliverables:** [design-report.md](design-report.md), [implementation-plan.md](implementation-plan.md), and the combined `ordered-lag-and-difference-design.zip`. The ZIP contains only the two Markdown deliverables.

**Open questions:** none blocking. Codex should reconcile integration drift, select final compact labels consistent with the chosen semantics, and record actual performance before considering optimization. Elapsed duration/rate remains deferred; no external demand or usability-study gate is required.



