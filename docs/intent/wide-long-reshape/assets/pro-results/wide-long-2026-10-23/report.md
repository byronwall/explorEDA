Build one saved `unpivot` query step that turns explicitly selected, compatible repeated-measurement columns into an inspectable long table. It should preserve raw values, identify every generated row by its immediate input row and selected field, expose exact value origins, and open a fresh query/view when first applied. This gives analysts a reproducible capability inside a project while retaining upstream preparation for more elaborate transformations. The first release must include authoring, preview, edit/remove, provenance, project JSON and text roundtrips, documentation, and a runnable example together.

# Wide-to-long preparation: Design report

**Repository baseline:** `95832bd473884aeae23453af0888b4ca5187820d` (`95832bd4`).  
**Research date:** October 23, 2026.  
**Mode:** Design. All implementation behavior below is proposed unless explicitly labeled **Checked fact**. Repository facts refer to the supplied complete-file packet at this baseline. External claims cite current primary documentation; no repository code or tests were run.

## 1. Decision and scope

### 1.1 Stable recommendations

| ID / classification | Recommendation | Reason |
| --- | --- | --- |
| WL-01 — **Build** | Add a single-input `unpivot` member to `AnalysisStep`. | Saved queries already own row grain, stage inspection, filtering, and evaluation. |
| WL-02 — **Build** | Save ordered selected and kept fields, explicit mappings, output IDs/labels/type, and a missing-value policy. | The same definition must explain both a refresh and a zero-row result. |
| WL-03 — **Build** | Preserve scalars and keep missing pairs by default; expose separate row, missing, and valid-measurement counts. | Reshaping must not silently clean values or alter denominators. |
| WL-04 — **Build** | Require an authored common-measure/unit review; reject declared type and known unit conflicts. | Numeric types alone do not establish that values can share one measurement field. |
| WL-05 — **Build** | Trace the input result cell separately from raw-record memberships and related-record navigation. | Lookup, expansion, and grouping make those three concepts different. |
| WL-06 — **Build** | First application copies the query and opens a fresh view with the current bindings. | A new row grain deserves an explicit workspace boundary, following expansion. |
| WL-07 — **Build** | Ship UI, edit/remove, worker parity, JSON/text restore, docs, and a project example in M1. | An evaluator-only delivery is not a usable saved-analysis feature. |
| WL-08 — **Build** | Bound generated pairs and projected cells before allocation. | A local operation can multiply rows without requiring another execution platform. |
| WL-09 — **Build, M2** | Add explicit refresh repair and an optional “all measurements for these input rows” action. | Both improve repeated use without introducing inferred mappings or changing default selection meaning. |
| WL-10 — **Explore** | Explicit multiple value families aligned by an authored occasion mapping. | Temperature and pressure may need separate value columns at the same occasion. |
| WL-11 — **Explore** | Source-level quantity/unit metadata that propagates through preparation. | It could reduce repeated author declarations; the supplied model does not have it. |
| WL-12 — **Defer** | Name-pattern extraction, wildcard selection, reverse pivot, and automatic new-column inclusion. | They add alignment and refresh semantics beyond the useful first release. |
| WL-13 — **Avoid** | Use a chart-local fold as the primary saved-project reshape. | It would separate displayed rows from query rows, selection keys, and stage inspection. |
| WL-14 — **Avoid** | Coerce mixed values, convert units automatically, infer identity from a displayed ID, or call long rows independent observations. | Each would change analytical meaning without sufficient evidence. |
| WL-15 — **Avoid** | A preparation graph editor, second evaluator, version coexistence layer, distributed execution, or result catalogue. | None is required by this bounded operation or the deployment assumptions. |

### 1.2 Why revisit the earlier boundary

**Checked fact:** `docs/research/data-preparation-boundary-2026-10-16/decisions.md` adopted upstream reshape in **DP-04** and demand-gated a bounded operator in **DP-06**. Its README explicitly calls the earlier proof unimplemented and unrun. `docs/research/DIRECTION.md` now says Byron is the demand and asks for a capability with a staged implementation plan. The current mission therefore supersedes those two gates; it does not require disproving an experiment that never ran.

Preserve the useful boundaries: ordinary prepared source rows remain supported; row grain and denominators remain explicit; ambiguous lookup is different from no match; complete supplied snapshots and the existing refresh model remain the boundary. Keep the exclusions in DP-10. Open plans #507, #514, and #517 are scope constraints supplied by the mission; their contents were not supplied or independently reviewed, and this proposal does not amend them.

### 1.3 The first release in one sentence

From a project query, select repeated fields, review their names/type/unit and the exact row multiplication, then choose **Open long table**; save, reopen, inspect, filter, edit, and remove that operation through the existing project structures.

## 2. Primary-source comparison and placement

The comparison below concerns documented capabilities. Design implications are recommendations for explorEDA, rather than claims that the other products implement explorEDA's identity or provenance model.

| Tool | Verified behavior | Consequence for this design |
| --- | --- | --- |
| **tidyr `pivot_longer`** | Selects columns; names the generated name/value outputs; retains missing values by default. It offers input-row or selected-column ordering, common-type behavior, explicit type assertions/conversions, and duplicate-name handling. Pattern extraction and `.value` support more complex layouts. [E1] | Adopt explicit selection, a documented order, keep-missing behavior, and a distinction between declaring a type and converting values. Leave extraction and multiple value families outside M1. |
| **pandas `melt`** | Separates `id_vars` from `value_vars`; omitted `value_vars` means other columns. Output names are configurable, and the value name cannot collide with an existing label. The index can be discarded or repeated; the documented example groups output by selected column. The API has no missing-drop option. [E2] | Use a similarly small contract, but freeze both lists and define application-level identity independently of displayed identifiers or repeated indexes. Choose row-major order for inspection. |
| **pandas `wide_to_long`** | Uses stub names and suffix matching, requires unique identification by `i`, retains other variables, and creates a value column per stub with an `(i, j)` index. Numeric suffixes can become numbers. [E3] | A relevant alternative for several quantities measured at matching occasions. It brings pattern, alignment, typing, and identifier assumptions that a one-value M1 does not need. |
| **Tableau Prep** | A named Pivot step accepts selected fields, has searchable selection and immediate tabular results, allows renaming, and supports several equally sized pivot groups. Manual selection requires adding new fields explicitly; wildcard mode follows matching schema additions/removals. [E4] | Borrow direct field selection, a visible step, and preview. A full flow graph and wildcard mode are unnecessary. The cited help does not establish a complete null, type, unit, or row-key contract. |
| **Power Query** | Creates Attribute/Value pairs. Its UI distinguishes “Unpivot columns,” “Unpivot other columns,” and “Unpivot only selected columns”; the first two documented flows can include new columns after refresh, while the last limits the operation to the selected set. [E5] The `Table.Unpivot` example omits two null pairs, yielding four output rows from six candidates. [E6] | Make the fixed selected set unmistakable. Choose and document missing-value semantics explicitly instead of copying another product's default. |
| **Vega-Lite / Vega `fold`** | Uses an explicit field list and configurable key/value names, retaining the original fields in generated rows. Its example is row-major. Arrays use a separate flatten transform. [E7] [E8] Vega-Lite view transforms execute in array order. [E9] | A concise declarative operation is sufficient. explorEDA should project only authored kept fields, so original measurements do not remain duplicated in every result row. |

**Additional implementation evidence:** pandas' current `melt` source concatenates selected arrays or uses column-major flattening and returns the constructed result without filtering missing values; it also rejects unavailable requested columns. This is a current-source observation, not a promise about an unpinned release. [E10]

No cited transform documentation establishes automatic semantic compatibility between, for example, kilograms and temperature. Their existence supports reshaping as a capability; it does not justify combining unrelated numeric quantities.

### Where the operation belongs

| Placement | Useful property | Tradeoff and decision |
| --- | --- | --- |
| **Explicit saved query step** | One schema and row grain feed charts, Rows, stage inspection, export, and refresh. | Requires coordinated changes across existing surfaces. **Recommended.** |
| **Visual-only transformation** | Compact for one chart and familiar in declarative visualization. | A separate chart-row population would need additional selection and tracing semantics. **Avoid as the primary feature.** |
| **Upstream preparation** | Mature tools handle complex naming, multiple quantities, and conversions. | explorEDA receives ordinary long rows and cannot reconstruct earlier source cells without supplied lineage. **Preserve as a supported alternative.** |

**Inference:** a saved query step offers the best fit because this repository already represents inspectable intermediate rows and changed-grain operations. That architectural fit, together with the requested capability, outweighs the smaller implementation cost of documentation alone.

## 3. Repository facts that constrain the proposal

Paths in this section are relative to `packages/explorEDA/src/` unless stated otherwise.

| Checked fact | Source and symbols | Design consequence |
| --- | --- | --- |
| There is no reshape step. | `types/AnalysisProject.ts`: `AnalysisStep` contains source, lookup, expand, calculate, filter, aggregate. | Add a union member directly. |
| Prepared long rows already work as a source. | `lib/analysis/sources.ts`: `sourceFromRows`, `addSourceFromRows`, `singleTableProject`. | Preserve that route; do not require use of unpivot. |
| Result rows contain keys, values/data, sourceRows, contributors, and optional measureContributors. References identify rows, not cells. | `types/AnalysisProject.ts`: `AnalysisResultRow`, `AnalysisSourceReference`. | A selected-field edge is necessary for a long-row value trace. |
| Source fields have source/field origins; derived fields have step origins. There is no unit metadata. | `FieldDefinition`, `AnalysisField`. | Generated value metadata must point to the unpivot step and its selected fields; it cannot name one universal source column or verified unit. |
| Expansion creates a new query/view without copying chart settings. | `components/project/stepEditing.ts`: `followRelationship`; `queryEditing.ts`: `copyQuery`. | First unpivot application follows this boundary and carries bindings explicitly. |
| Schema discovery evaluates defined empty source tables. | `stepEditing.ts`: `emptyTables`, `queryFields`. | The schema cannot depend on observing a first value. |
| Source identity is typed-key identity when unique, positional when missing/duplicated. | `evaluateProject.ts`: `sourceReferences`; `sourceRowIdentity.ts`: `sourceRowIdentities`, `resolveSourceRow`; `selectionIdentity.test.ts`. | Long keys inherit that stability limit. |
| Calculations and aggregate measures currently lack declared field types. | `evaluateProject.ts`: `calculateFrame`, `aggregateFrame`. | An explicit output-family declaration must support untyped inputs. |
| Ambiguous lookup has no selected value, but adds candidates to contributors. | `evaluateProject.ts`: `lookupFrame`; `evaluateProject.test.ts`. | Candidates are not supplying cells. |
| Related-record navigation can traverse children two levels deep. | `QueryStageRows.tsx`: `relatedRecords`. | It must remain distinct from exact value origin. |
| Incompatible saved fields cause settings to be retained but withheld from the workspace. | `settingsCompatibility.ts`: `incompatibleSettingsFields`; `ExplorEdaProject.tsx`. | Preserve this recovery policy instead of deleting charts. |
| Workers use the same evaluator and discard stale replies. | `analysisWorkerProtocol.ts`: `handleAnalysisWorkerRequest`; `useAnalysisEvaluation.ts`: `useWorkerEvaluation`. | Extend the current request/result boundary, not execution architecture. |

The source packet supplies all decisive surfaces for this design. It does not include every imported module. In particular, `apps/demo/src/demos/multiSourceShop.ts`, the implementation behind `compileViews`, some host callback consumers, documentation catalogue/live-example internals, and the package's public export barrel were not supplied. They are explicit implementation inspection points, not evidence of existing behavior.

## 4. Exact data contract

### 4.1 Proposed persisted shape

This is an API sketch for Codex to integrate with the existing types; it is not implemented source.

```ts
export interface UnpivotStep {
  id: string;
  kind: "unpivot";
  inputStepId: string;

  // Ordered projection. Empty is valid; these are not uniqueness constraints.
  keep: string[];
  columns: Array<{
    fieldId: string;
    name: string;
    // Optional author-supplied annotation, not inferred from the field name.
    unit?: string;
  }>;

  // IDs persist independently of labels and independently of copied step IDs.
  names: { id: string; label: string };
  values: {
    id: string;
    label: string;
    type: "number" | "string" | "boolean" | "date";
    unit: string | null; // null means unspecified, not dimensionless
  };
  missing: "keep" | "drop";
  compatibility: "author-confirmed";
}
```

The value label names the quantity, such as **Pressure**, and `values.unit` records the declared common unit, such as **kPa**. No dimension ontology, conversion engine, or source-schema retrofit is required. The editor's final review makes that declaration explicit; changing the selected set, value type, or unit invalidates the draft's compatibility confirmation until reviewed again. Programmatic definitions must make the same assertion.

`AnalysisStep` gains `UnpivotStep`; the current `AnalysisProject.version` and project-file version remain `1` under the one-deployed-version assumption. Existing files continue to load. Older binaries are not promised support for this new operation, and no parallel version adapter is introduced.

### 4.2 Selection, projection, naming, and order

- **Selected fields:** at least one, no repeated IDs, all present in the immediate input schema. Selection is explicit, never “all columns except…” at evaluation time.
- **Kept fields:** default in the editor to all currently unselected input fields, then save that ordered list. Reject duplicate kept IDs. The author can remove fields, including every displayed identifier. Kept fields and selected fields must be disjoint.
- **Identifiers:** kept fields repeat unchanged. They do not establish row identity, uniqueness, or grouping. Duplicate patient, part, or order labels remain separate input rows.
- **Output columns:** kept fields in saved order, then `names.id`, then `values.id`. Selected original columns leave the output; unselected fields outside `keep` also leave it.
- **Output IDs:** nonempty, different from one another, and different from every immediate input field ID, including selected fields that disappear. Reject the reserved runtime field `__ID`. Reusing a disappearing ID would hide a change of meaning, so M1 deliberately rejects it.
- **Output labels:** nonempty editable display text. Labels do not drive evaluation. Duplicate display labels can exist, as in current source metadata; show IDs/source context wherever ambiguity matters. A collision in IDs is an error, not a label problem.
- **Name mappings:** nonempty strings, unique across selected fields. Default them from field labels at authoring time; resolve duplicates before Apply. Save them literally. Do not re-derive them from labels during refresh or recompile.
- **Ordering:** input rows retain their incoming order. For each input row, visit `columns` in saved order. Object-property order and source-schema order have no influence after authoring.
- **Mappings remain categorical:** names such as `"01"`, `"Week 2"`, and `"2026-10-01"` remain strings. M1 does not extract numeric/time coordinates from them. A subsequent explicit calculation can create another field.

Output schema uses the kept `AnalysisField` definitions, a string name field, and the persisted value family. Both generated fields use `origin: { stepId }`. Their field details read `step.columns` to list possible input fields; they must never pretend the whole value column comes from one source column.

**Copy rule:** `copyQuery` remaps step IDs and `inputStepId`; it must preserve `names.id` and `values.id` literally. Generating defaults once is fine. Recomputing output IDs from a copied step ID would break later filters, calculations, and saved charts.

### 4.3 Row grain, cardinality, and keys

Let `N` be the immediate input row count and `M` the selected-field count.

- With `missing: "keep"`, output count is exactly **N × M**.
- With `missing: "drop"`, output count is **N × M − D**, where `D` is the number of pairs whose value satisfies `isMissingValue`.
- There is no deduplication, aggregation, cross-record alignment, or synthetic occasion completion.
- A result row means **one immediate input result row × one selected input field**. After grouping, that input row is a group. After expansion, it is an expanded row. Neither is automatically a raw source record.

Use this key rule:

```ts
const key = `${step.id}:${JSON.stringify([inputRow.key, column.fieldId])}`;
```

The JSON pair prevents delimiter collisions, following the existing `expandedFrame` precedent. Exclude output values, labels, mapping strings, column ordinals, and kept business identifiers from the key.

Consequences:

- Reordering selected columns changes display order but preserves each surviving pair key.
- Renaming a label or mapped category preserves pair keys. Category predicates still compare their saved literal values and are not silently rewritten.
- Editing an input value preserves the pair key when the input row identity is unchanged.
- Removing a selected field removes its keys; adding it back restores those keys if step/input identity is unchanged.
- Copying a query gives its unpivot step a fresh ID, so the new query has its own pair keys.
- Unique, unchanged source keys support source reordering. Missing/duplicate-key fallback does not: swapping two positional records can retain a key while changing the record at that position.
- `sourceFromRows` can synthesize a row-number field; apparent uniqueness of such generated numbers does not establish persistent record identity across a new import.

M1 does not invent a record-matching algorithm. Expose current identity diagnostics and document positional selections as snapshot-dependent. The positional-reorder test must demonstrate the limitation rather than assert false stability.

### 4.4 Raw values, missingness, and eligibility

**Checked fact:** `sourceFrame` creates all declared value properties with `data[field.id]`. Thus absent raw properties and explicit `undefined` already have the same scalar value in the evaluated row. A value-origin trace must use own-property presence on the applied raw source snapshot to distinguish them.

Unpivot copies raw scalar values without coercion. Its missing-drop predicate is `isMissingValue` from `lib/valueParsing.ts`; that includes blank/whitespace text. This differs from the current query `is-null` operator, which checks only null/undefined. Preserve that distinction.

| Input state | Stored long value and missing policy | Interpretation / trace |
| --- | --- | --- |
| Raw property absent | `undefined`; kept by default, dropped with `missing=drop` | Trace says **field absent in this source row**. |
| Own property set to `undefined` | `undefined`; same drop behavior | Trace says **present property, undefined value**. |
| `null` | `null`; same drop behavior | Explicit null remains distinguishable from undefined. |
| `""` | Empty string, unchanged; dropped by `missing=drop` | Missing under the shared helper; numeric exclusion says “Missing value.” |
| `"   "` | Exact whitespace string, unchanged; dropped by `missing=drop` | Missing under the shared helper; numeric exclusion says “Blank value.” |
| `0` | Numeric zero, retained in both modes | Valid numeric measurement; never treated as missing. |
| `false` | Boolean false, retained in both modes | Valid in a boolean field; excluded from numeric reduction, never converted to zero. |
| `"2.5"` | String `"2.5"`, retained | Numeric helpers can read it as 2.5; unpivot itself does not convert it. |
| `"bad"` or `"0x10"` | Original string, retained | Invalid numeric measurement under shared parsing; remains inspectable. |
| `NaN`, `Infinity`, `-Infinity` | Original numeric value, retained | Present but not a finite numeric measurement; do not recode as null. |
| `"NaN"` / `"Infinity"` | Original string, retained | Keep the text/numeric distinction even when both are ineligible numerically. |
| Date text | Original text, retained | Date validity/chronology uses `timestampOf`/`parseDateText`, not automatic unpivot parsing. |
| Numeric timestamp in a declared date field | Original number, retained | `timestampOf` supplies date interpretation; it remains a scalar. |

Raw `Date` objects are outside this feature's persisted scalar-table contract. `AnalysisScalar` excludes them; `projectFile.validateAnalysisProjectFile` rejects object-valued table cells even though the codec has a Date branch. `calculateFrame` already converts successful calculated Date results to ISO strings. Do not infer broader Date-input support from the encoder.

A missing cell may use the standard centered `null` table marker. Its value-origin details must still reveal **absent**, **undefined**, **null**, or **blank**, with quoted raw text when relevant. Display normalization must not change stored values.

### 4.5 Types and measurement compatibility

Support number, string, boolean, and date families in M1. They share the same scalar reshaping loop.

1. If every selected known type agrees, default to that type.
2. If known selected types conflict, block Apply and evaluation. A declared number field plus a declared boolean field is a schema conflict.
3. If fields are untyped/unknown, require an explicit value-family choice. The chosen family must agree with any known selected type. This accommodates calculated and aggregate measure fields, whose types are absent at this baseline.
4. A declaration is not a conversion or a guarantee that every cell is valid. Invalid individual cells in a declared number field remain raw rows, counted as invalid measurements in preview.
5. Conversions and unit changes must be separate authored preparation/calculation steps. Unpivot never uses `Number(raw)`, `Date.parse`, truthiness, or name-pattern heuristics.

**Unit policy:** `values.unit: null` explicitly means unspecified. Optional per-column `unit` annotations are author supplied. Known annotations must be identical to one another and to a non-null output unit, after trimming only; `kg`, `g`, and `KG` are different tokens in M1. A known conflict cannot be overridden by `compatibility: "author-confirmed"`. Either fix the selection, prepare compatible values explicitly, or use separate long tables.

Where unit annotations are absent, the UI states that source units are unrecorded and the common unit is the author's declaration. Applying requires reviewing the selected set as one repeated quantity. This prevents a silent combination; it does **not** prove dimensional compatibility. The report's incompatible-unit fixture supplies explicit annotations so rejection is testable. Without them, the system cannot honestly detect temperature versus mass from numeric type alone.

### 4.6 Refresh, renames, and empty data

| Change | Required M1 behavior | Why |
| --- | --- | --- |
| Selected field ID disappears from input schema | Error names the field and step; no partial output. Edit or restore the source. | Skipping it would silently change the measurement population. |
| Kept field ID disappears | Same explicit error. | Identifier/context projection is part of the saved contract. |
| Selected property absent on one row | Emit missing pair, or drop under the saved policy. | Cell absence differs from schema absence. |
| Schema still declares a field but every row lacks its property | Treat as all missing cells; show the count. | Do not infer a schema deletion from data values. |
| New source columns | Ignore until explicitly added to `keep` or `columns`. | Saved output schema and population remain stable. |
| Source display label changes | Show the current field label in selection/trace; retain saved mappings and output labels. | Display labels are not identifiers. |
| Source field ID is renamed | Treat old ID as missing; require explicit rebind. | Similar labels are insufficient identity evidence. |
| Duplicate source labels | Disambiguate with source and ID; require unique mapped names. | Distinct fields must remain distinguishable. |
| Selected known type changes | Error if it conflicts with persisted output family. | Refresh must not silently change the value field's type. |
| Empty immediate input | Zero rows with the complete output schema, even in drop mode. | `queryFields` and empty-view restore require this. |
| Source table unavailable | Surface missing-source/query failure, not a valid empty measurement table. | Missing access is different from zero observations. |

An empty source can feed an ungrouped aggregate that creates one summary row. If that summary is unpivot's input, `N=1`, not zero. Schema discovery must work in both paths without inferring types from those summary values.

## 5. Provenance and selection

### 5.1 Three separate questions

- **What result row is this?** One input result row paired with one selected field.
- **Where did this value come from?** A specific raw source cell, a calculation over cells, an aggregate over immediate input rows, or an unavailable result with a reason.
- **Which original/related records can be explored?** Row memberships and the existing broader related-record navigation.

Unpivot copies the input row's `sourceRows` and `contributors` without manufacturing a new raw source reference. It does not multiply or reinterpret the meaning of either array. A row from an ambiguous lookup can have candidate contributors without a supplying cell. An aggregate can have many raw memberships despite being one immediate input row.

### 5.2 Minimal direct additions

Keep the existing evaluator and stage rows. Add explicit metadata only for edges that cannot be reconstructed from the existing step and same-key pass-through rules:

```ts
interface AnalysisResultReference {
  stepId: string;
  rowKey: string;
}

interface AnalysisInputCellReference extends AnalysisResultReference {
  fieldId: string;
}

type AnalysisRelationshipMatch =
  | { status: "matched"; sourceRow: AnalysisSourceReference }
  | { status: "unmatched" }
  | { status: "unavailable-source"; sourceId: string }
  | { status: "ambiguous"; candidates: AnalysisSourceReference[] };

// Proposed additions to AnalysisResultRow:
// inputRows?: AnalysisResultReference[];        // expand / aggregate
// relationshipMatch?: AnalysisRelationshipMatch; // lookup / expand
// unpivotCell?: AnalysisInputCellReference;     // exact selected input cell
```

The owning stage determines which metadata applies. A later filter, calculation, or lookup must traverse its input stage before interpreting earlier unpivot metadata inherited through object spread. `unpivotCell.stepId` names the immediate input stage, not the unpivot stage itself. Do not parse row-key strings to recover lineage. Resolve introduced relationship fields by enumerating the applied alias and target field definitions; do not split field IDs on dots or choose the first reference with a matching source ID.

Implement a small pure `resolveAnalysisCellOrigin` helper over evaluation stages and the **applied** project/source snapshots. Index rows by stage and key once per evaluation. It resolves evidence; it never reruns formulas, joins, filters, or aggregates.

| Stage / field | Exact tracing rule | What must not be claimed |
| --- | --- | --- |
| Source | Resolve its source reference in the applied table; original field ID plus own-property presence names the raw cell. | An evaluated `undefined` alone does not reveal absence. |
| Filter, or unchanged field on a same-key stage | Follow `inputStepId` and the same result key. | The filter creates no new value supplier. |
| Lookup-projected field | Use that lookup stage's stored selected target reference and the raw target field ID. | Searching `sourceRows` by source ID is insufficient when aliases target the same source. |
| Expanded projected field | Use the selected child reference; for a kept parent field follow the explicit parent input reference. | Parent membership does not mean the parent supplied the child value. |
| Unmatched / ambiguous / unavailable-source related value | Show no supplier and the distinct reason, with candidate records separately where applicable. | A missing source is not evidence of no match; candidate matches did not supply an arbitrary chosen value. |
| Calculated field | Show the saved expression and its parsed field dependencies on the same input result row; recurse into each dependency. | Dependencies are not necessarily a runtime branch-execution trace. Constants are not source cells. |
| Aggregate measure | Show operation, input field, immediate group rows, and evaluated included/excluded candidates from `measureContributors`. | A deduplicated union of raw references is not the numeric calculation. |
| Aggregate group key | Show the group definition and supporting immediate input rows. | There need not be one canonical raw cell for the group's label. |
| Unpivot value | Follow `unpivotCell` to its exact input result cell. | The entire multi-column field origin is not this row's supplier. |
| Unpivot kept field | Follow `unpivotCell.stepId` and `unpivotCell.rowKey`, retaining the requested kept field ID. | The changed long-row key cannot find the parent through a same-key lookup. |
| Unpivot name | Show the authored mapping and selected field ID. | This string came from the definition, not a raw measurement cell. |

`parseExpression(...).dependencies` is already used by `projectFile.ts`, `stepEditing.expressionProblem`, and `settingsCompatibility.ts`; use it for calculation dependencies. If a calculation failed, preserve that diagnostic in the trace.

For aggregation, save immediate group input references when `aggregateFrame` already has `group`; retain the existing numeric contributor details. Add contributor metadata for count measures using their actual current inclusion rules. A fieldless count has row inputs, not fictitious cell inputs. Entity-deduplicated measures must show both original group membership and the evaluated candidate representatives; an unavailable result due to conflicting entity measures remains unavailable, even if some other candidates have valid numbers.

Leave aggregate contributor lists on the aggregate input stage. A long row's value trace follows its selected measure back there; do not copy every unrelated measure's contributor list onto every generated row.

### 5.3 Snapshot consistency across the worker boundary

**Checked fact:** `useAnalysisEvaluation` retains the previous result while a newer request is pending, but currently retains only `appliedBindings` as explicit input context. Resolving old row references against newly supplied tables could show a different source value.

**Proposal:** retain `appliedProject` and `appliedTables` alongside `appliedBindings` in `AnalysisEvaluationState`. Capture the immutable references for the completed direct call or worker request. While pending, the old rows, counts, schema, expressions, source cells, and bindings all use that completed snapshot. On success, switch them together; existing request-ID checks reject obsolete responses. No extra table transport is necessary for these main-thread references.

Pass these applied snapshots to origin/related-record inspection. A draft preview has its own evaluation state and cannot replace the committed view's evidence. Disable actions that would open a new source view from a previous result while refresh is pending; read-only inspection may still describe the labeled previous result. In-place mutation of supplied tables remains unsupported, consistent with the existing immutable-array contract.

### 5.4 Selection behavior

- A chart or row-key selection of **A · Before** selects that pair. **A · After** stays unselected.
- A deliberate predicate such as `person = P1` selects all measurement rows whose kept value matches. That is a field filter with a broader meaning.
- Tracing a long row does not change its filter or select related records automatically.
- The value-origin panel can open a source view filtered to exact supplying source references, grouped by source. For an aggregate, distinguish included inputs from excluded candidates before opening a list.
- A separate row-membership action may open all original records behind the result. Keep the existing **Related records** navigation clearly labeled; it may include additional child records.
- Opening a source view leaves the long view's filters unchanged. M2 may offer an explicit action to select all measurements for the chosen immediate input rows.

Use the existing `__ID`/row-key adapters in `analysisRowKeys.ts` for actual workspace filters. Do not assume `AnalysisView.selectedRowKeys` alone filters charts: the supplied `ExplorEdaProject` does not consume that property as a chart filter. Build source-view row filters through the existing saved-filter structures and `sourceView`; Codex must inspect the referenced filter helpers before writing their exact object shape.

Unresolved saved keys remain unresolved and visible; they must not become “all rows.” Never rebind them by similar business labels. For positional identities, the previously stated refresh limitation remains; the new feature does not promise recovery across arbitrary reorder.

## 6. Authoring, editing, and inspection

### 6.1 Compact author flow

Add **Unpivot columns…** to the current Query panel. A proposed `UnpivotStepEditor.tsx` uses the existing nonmodal panel/popover conventions, shared `FieldPicker`, and `FieldMetadata`.

1. **Choose columns.** Search and select explicit fields. Show type, label, and disambiguating ID/source. Keep a visible ordered mapping list; each row has keyboard/touch Move up and Move down actions. Drag ordering is optional convenience.
2. **Choose kept fields.** A compact Columns picker defaults to current nonselected fields. Mark them as copied to each measurement row. No unique-ID wizard is needed.
3. **Name and review.** Edit name/value labels, mapped categories, value family, common unit or unspecified unit, and keep/drop missing policy. IDs remain stable and available in details. Review compatibility for this selected set; known conflicts block Apply.
4. **Preview.** Evaluate a temporary candidate through the existing evaluator/hook. Show input rows × selected columns, candidate pairs, emitted rows, missing pairs, numeric/date/boolean eligibility as relevant, and the resulting row meaning. Show a bounded table labeled **First 25 of N rows**. Counts describe the complete bounded evaluation, never an unlabeled sample.
5. **Apply.** **Open long table** copies the query, appends unpivot after the copied output, copies parameter bindings, sets a truthful frame label, and opens a fresh view. Start with the normal summary/Rows experience; no chart settings, filters, or inspection selection are copied. Emit one project-plus-view operation.

Preview, cancel, and draft keystrokes create no saved query, chart, view, history checkpoint, or host callback. If the host has no `onOpenView`, disable the action with a precise explanation; do not silently substitute an in-place grain change.

### 6.2 Counts and grain in the existing surfaces

Use `stepTitle`/`stepDetail` for a summary such as **Unpivot 2 columns → Visit, Pressure**. `QueryFlow` currently has no generic add/edit/remove UI in the supplied source, so these controls are new explicit work.

Extend `AnalysisStage` with an optional unpivot summary containing selected-column count, candidate pairs, missing pairs, and dropped-missing pairs. Keep:

- `inputCount = N` immediate input rows.
- `outputCount = N × M − droppedMissingPairs`.
- `excludedCount = droppedMissingPairs`, labeled as omitted measurement pairs, not excluded source records.
- `rowUnit` describing the previous row unit paired with the measurement name.

Update `query.frameLabel` as well: `ProjectScope` reads it rather than inferring row meaning from the stage. Numeric validity counts come from the shared parsers and are separate from exclusions. Counts of source records appear in trace context with their scope named.

### 6.3 Edit and remove

An unpivot stage has **Edit** and **Remove** actions. Editing reuses the draft editor and commits once.

- Label changes and selected-column ordering preserve output IDs and pair keys.
- Changes to mappings, selected/kept lists, or missing policy preview the complete downstream query before acceptance. Show the number/names of affected views when `views` is supplied; otherwise say that other views are not listed.
- Category filters keep their authored values. Changing `Before` to `Baseline` does not silently rewrite saved filter literals; preview and the normal filter scope reveal resulting matches.
- A change of value family, common measurement/unit meaning, or explicit selected-field rebind uses **Open revised long table** in M1. It forks the query and starts a fresh view, avoiding reuse of numeric chart settings under the same output IDs for a different quantity. The system cannot detect a change of semantic meaning from current metadata; require the author to choose this path for such a change. Treat every rebind conservatively as a fork unless a later repair flow explicitly records that it is the same measurement under a new field ID.
- Removal reconnects downstream `inputStepId` references and restores the previous output if unpivot was the leaf. Recompute row meaning and frame label. If later steps require generated fields, block removal and name the first affected step/field.

Validate downstream references explicitly against the resulting stage schemas: calculation dependencies, filter fields, aggregate groups/measures/entity fields, and relationship inputs. `queryFields` alone is insufficient proof: current `filterFrame` does not validate field existence, and empty evaluation cannot exercise per-row calculation failures. Reuse/factor the relevant existing validation rules instead of creating an alternative evaluator.

Preserve saved chart settings and layout when fields become unavailable. The existing compatibility hold and **Start this view's charts over** action provide recovery; never map `reading` to an arbitrary old wide column. Clear the current transient trace focus/removed inspection target. Keep unresolved row filters visible until the author deliberately clears them.

The current callback carries `{ project, view }`, while `views` is a read-only inventory. Do not promise an atomic rewrite of every sibling view. Sibling settings remain intact and are checked when rendered. This design avoids a new multi-view mutation protocol in M1. Family/unit changes take the new-view path because current compatibility checks only inspect missing fields and calculation syntax, not semantic type/grain changes.

### 6.4 Pointer, keyboard, and narrow layouts

- Use compact 32 px controls, 28 px controls inside panels, the shared 100 px setting-label column, semantic border tokens, real tooltips, accessible names, and visible focus rings.
- Tab reaches search, checkboxes, mapping inputs, move actions, missing policy, preview, and Apply. Space toggles a checkbox; Enter activates the focused action. Do not apply while the user is entering a mapping or using an input-method composition.
- Escape closes an inner picker first, then cancels the draft; focus returns to the invoking control. No pointer-only ordering is required.
- Validation is beside the affected field, linked with `aria-describedby`; the error summary links to the first invalid control. Pending and count changes use restrained live status announcements.
- At **1280 px**, the wide Query panel provides useful mappings and preview while preserving workspace context.
- At **783 px**, bounded lists and a compact panel remain usable; only the preview table scrolls horizontally, not the page or actions.
- At **390 px**, use the existing full-sheet narrow behavior, short nonwrapping tabs if needed, and a reachable sticky action area. Field names retain a readable label and an accessible full name.
- Check long labels, duplicate labels, empty results, invalid cells, active filters, error repair, and focus return at every width; inspect both light and dark tokens. Default visual examples to light mode.

The packet has a minor tooltip instruction conflict: UI defaults says pointer-hover opening, while coding standards mentions keyboard-focus opening. Reuse the shared component's actual behavior and retain accessible names; this feature should not establish a new tooltip policy.

### 6.5 Useful errors

| Situation | Proposed message | Action |
| --- | --- | --- |
| Missing selected column | “After (`runs.after`) is no longer in the input to Long readings.” | Edit selected fields or restore the source. |
| Output ID collision | “`reading` already names an input field. Choose another output ID.” | Generate a fresh stable ID; preserve the label. |
| Known type conflict | “Before is a number; Approved is a boolean. Choose fields of one type.” | Change selection or prepare fields explicitly. |
| Known unit conflict | “Temperature uses °C; Mass uses kg. These cannot share this value column.” | Separate quantities or author a conversion where meaningful. |
| Unrecorded units | “Units are not recorded for 2 selected fields. Review the common quantity and unit.” | Explicit author review; no invented validation. |
| Growth limit | “30,000 input rows × 4 columns creates 120,000 candidate pairs; the limit is 100,000.” | Filter earlier or select fewer columns. |
| Downstream dependency | “Remove is blocked: Average readings uses `reading` from this step.” | Edit/remove the dependent step first. |

These messages describe actionable product state. Internal implementation caveats and future scope belong in intent documentation, not explanatory banners in the product.

## 7. Evaluator, validation, persistence, and growth

### 7.1 Evaluation sequence

Add an `unpivot` branch to `evaluateAnalysisQuery` and a small shared definition/schema helper. The helper is a direct addition for this operation, not a second evaluator.

1. Resolve the immediate input frame through the existing dependency/cache traversal.
2. Validate lists, field existence, mappings, IDs, declared types, unit assertions, missing policy, and compatibility declaration before iterating rows.
3. Construct output fields from definitions, even when `N=0`.
4. Reserve candidate-pair and projected-cell budget before allocating long rows.
5. Walk input rows, then selected fields. Read the scalar once; classify using shared parsing helpers; apply the explicit missing policy.
6. Build only kept values plus the two output fields; set `data` to that same values object, following existing frames. Copy row membership arrays and attach the input-cell reference.
7. Emit stage summaries and diagnostics without presenting partial output as success.

Required validation is identical in direct evaluation, worker evaluation, editor preview, JSON restore, and project-text compilation when input schemas are known. Deferred source-schema resolution in project text must still fail precisely at evaluation if a field does not exist.

### 7.2 Bounded growth

Adopt initial product limits of **100,000 candidate pairs** and **2,000,000 projected cells** generated by unpivot operations in one evaluation. Charge a visited unpivot stage once; the existing cache already avoids repeated evaluation of a shared dependency. For each stage, projected cells are candidate pairs × (`keep.length + 2`).

These are proposed starting limits, not measured performance guarantees. They bound this new operation's expansion, not every allocation made by pre-existing source, lookup, expansion, or aggregate stages. Both direct and worker paths use the same constants and failures.

Use division-based preflight checks before multiplication/allocation. The pair budget is conservative when missing values would be dropped: a million mostly missing candidates still requires scanning a million candidates. Show that fact in the error. Preview uses the same bound and complete counts below it; it does not silently truncate evaluation to make an oversized query appear valid.

Codex should calibrate the constants with the actual single-client runtime while implementing M1, without expanding this into a benchmarking platform. Tests must accept the exact boundary and reject one pair/cell beyond it; chained unpivots must respect the cumulative budget.

### 7.3 Concrete repository changes

| Files / symbols | Proposed change | Essential verification |
| --- | --- | --- |
| `types/AnalysisProject.ts` | `UnpivotStep`, union member, stage counters, direct lineage metadata. Keep current project version. | Type checking; fixtures cover every new field. |
| `lib/analysis/evaluateProject.ts` | Add unpivot branch; explicit match/group input edges; numeric/count contributor evidence; grain/count summaries. | Exact values, memberships, keys, exclusions, zero-row schema, validation and limits. |
| Proposed `lib/analysis/unpivot.ts` | Share unpivot definition/schema validation and small helpers across evaluator/persistence. | Same invalid definition rejected through every entry point. |
| Proposed `lib/analysis/cellOrigins.ts` | Resolve applied result-cell references through existing stage outputs. | Source presence, lookup aliases, calculations, expansion, groups, unavailable suppliers. |
| `lib/analysis/useAnalysisEvaluation.ts`, `analysisWorkerProtocol.ts` | Keep applied input snapshots with completed results; serialize direct metadata through the existing worker path. | Direct/worker parity, stale replies, pending snapshot trace, errors. |
| `components/project/stepEditing.ts`, `queryEditing.ts` | Create/fork, replace/remove, downstream checks, titles/details, frame labels, distinct row labels. | No mutation during preview; stable field IDs on copy/edit; removal dependencies. |
| `ProjectQueryPanel.tsx`, `QueryFlow.tsx`, proposed `UnpivotStepEditor.tsx` | Add action/editor, preview, Apply, Edit, Remove, impact display. | Keyboard/pointer, one callback, cancel, host capability, useful errors. |
| `QueryStageRows.tsx`, `ExplorEdaProject.tsx` | Value-origin section, separate memberships/related records, exact source selection, applied snapshot context. | A selected pair stays distinct; broader record navigation cannot masquerade as a value trace. |
| `settingsCompatibility.ts`, `analysisRowKeys.ts`, `sourceRowIdentity.ts` | Reuse compatibility hold, key adapters, and exact resolution; add feature-focused tests/integration where needed. | Missing fields retain settings; unresolved filters never widen; positional limits remain explicit. |
| `lib/analysis/projectFile.ts` | Update both kind allowlists and `fieldsAt`; explicitly branch unpivot before the existing aggregate fallback. | JSON/selected-view roundtrips, field validation, special scalar fidelity. |
| `lib/dsl/project.ts`, `project.test.ts` | `compileStep`, `stepLines`, help/reference checks, canonical text syntax. | Exact project and export/compile/export equality. |
| `lib/project/analysisText.ts` | Preserve generated-field chart bindings, including no-row results, through analysis export/compile. | Inspect `compileViews` integration and add a schema-aware path if required. |
| `lib/analysis/sources.ts` | Preserve ordinary prepared-long input; add a parity fixture, not a new ingestion wrapper. | Same scalar output values via prepared source and unpivot. |
| New repeated-measurement fixture/demo, `examples.ts`, `coverage.ts`, `project-folders.mdx` | Runnable project, explicit feature coverage, user docs in M1. | Demo coverage/text tests and browser checks at all required widths. |

Public type/function exports and host handlers must be inspected in the checkout before implementation. The supplied guide identifies the relevant architecture; their exact unseen interfaces are not asserted here.

### 7.4 Project text

Use the existing nested-declaration, named-step, ordered-child, and key/value grammar. A proposed canonical operation is:

```text
query @long-readings "Long readings" glyph=L frame="record × visit" {
  source runs
  unpivot @long keep=runs.recordId,runs.person names=visit values=reading names-label=Visit values-label=Pressure type=number unit=kPa missing=keep compatibility=author-confirmed {
    column runs.before name=Before unit=kPa
    column runs.after name=After unit=kPa
  }
}
```

This is a query excerpt within a project that declares `runs`. It proposes syntax using constructs already present in `compileStep` and `stepLines`; it is not text accepted by the current baseline.

Rules:

- Require an explicit step ID; keep the existing previous-step default and optional `from=` behavior.
- `keep` is an ordered list. Omission canonically means an empty kept list, **not** all other fields. The UI writes its default selection explicitly.
- Ordered `column` children are the only selected set. Reject duplicates, unknown child keywords, empty names, and unknown options.
- `names`/`values` carry persisted field IDs. Labels and mappings export literally, including Unicode and quoted commas, quotes, spaces, or leading `$`.
- `unit=null` is the unquoted unspecified-unit value; a literal string `"null"` remains a unit token. Inspect the parsed token's `quoted` flag: the existing `single()` helper returns text only and cannot make this distinction alone. Optional child units preserve the difference between absent annotation and declared text. Export type, missing policy, and compatibility explicitly.
- Reuse `text`, `encodeScalar`, list token items, and `block`; never hand-split quoted comma-containing identifiers.
- Keep existing `output=` behavior for a non-last output step. Preserve identical normalized project structures through export → compile → export.

### 7.5 Save/export/compile/restore

Project JSON stores the definition and source tables, not cached long-result arrays or trace trees. Evaluation recreates result rows and edges. Existing special-value encoding must preserve absent properties versus own undefined properties and non-finite numbers in the raw tables.

`selectAnalysisProjectView` already traverses ordinary single-input dependencies; unpivot needs no result catalogue or second source namespace. A selected-view export must retain its unpivot, upstream sources/relationships, parameters, and view state.

Project text owns query operations. Analysis text owns view/chart settings and bindings over those queries. `readAnalysisText` currently hands evaluated row data to `compileViews`; the packet does not prove that this preserves field bindings for an empty result. M1 must inspect that implementation and pass the discovered schema if necessary. Empty-result restore is an acceptance requirement, not a deferred improvement.

Saved row-key filters retain pair keys. Save/restore must not introduce repeated `onStateChange` echoes or mutate field defaults; `ExplorEdaProject` already depends on stable reported settings.

## 8. Exact acceptance fixtures

All expected results below are design acceptance targets derived from the stated contract and inspected baseline parsing/counting rules. They were not produced by running a proposed implementation.

### F1 — Repeated measurements, duplicate displayed identifiers, missing/invalid cells

Source `runs`, entity key `recordId`; declare `recordId` and `person` string, `before` and `after` number. Invalid individual cells are deliberately present in number fields.

```ts
const rows = [
  { recordId: "A", person: "P1", before: 10,    after: 12 },
  { recordId: "B", person: "P1", before: 0,     after: null },
  { recordId: "C", person: "P2",               after: 4 },
  { recordId: "D", person: "P3", before: "",    after: false },
  { recordId: "E", person: "P4", before: "bad", after: "2.5" },
];
```

Step `long`: keep `[runs.recordId, runs.person]`; select `runs.before → Before`, then `runs.after → After`; outputs `visit`/`reading`; value type number; common quantity Pressure, unit kPa; compatible declarations; missing keep.

Output fields, exactly: `[runs.recordId, runs.person, visit, reading]`. Every row repeats its two kept values. The full output order and keys are:

| Input record / mapped visit | Exact long-row key | Raw `reading` |
| --- | --- | --- |
| A / Before | `long:["runs:string:A","runs.before"]` | `10` |
| A / After | `long:["runs:string:A","runs.after"]` | `12` |
| B / Before | `long:["runs:string:B","runs.before"]` | `0` |
| B / After | `long:["runs:string:B","runs.after"]` | `null` |
| C / Before | `long:["runs:string:C","runs.before"]` | `undefined` — raw property absent |
| C / After | `long:["runs:string:C","runs.after"]` | `4` |
| D / Before | `long:["runs:string:D","runs.before"]` | `""` |
| D / After | `long:["runs:string:D","runs.after"]` | `false` |
| E / Before | `long:["runs:string:E","runs.before"]` | `"bad"` |
| E / After | `long:["runs:string:E","runs.after"]` | `"2.5"` |

For each pair, `unpivotCell` points to the input source step, that `runs:string:<recordId>` result key, and the selected qualified field. The raw origin is source `runs`, the same row reference, and original field `before` or `after`. Both membership arrays contain exactly that one raw source reference. Duplicate `person=P1` does not collapse A and B.

Exact totals:

- Input rows **5**; selected columns **2**; candidate/output pairs **10**.
- Shared-helper missing pairs **3**: B/After, C/Before, D/Before.
- Nonmissing invalid numeric pairs **2**: D/After (`false`), E/Before (`"bad"`).
- Finite numeric measurements **5**: 10, 12, 0, 4, and parsed 2.5; sum **28.5**.
- Existing aggregate `count(*)` **10**; existing `count(reading)` **8**, because it excludes only null/undefined and counts blank/false/invalid text.
- `missing=drop` emits **7** rows, in the same relative order; keys of surviving rows are unchanged; numeric sum remains **28.5**; `count(reading)` becomes **7**.
- Existing query `is-null(reading)` selects **2** pairs, while shared-helper missingness finds **3**. Do not silently change the existing filter operator.

Exact filters:

| Operation | Emitted membership | Numeric result |
| --- | --- | --- |
| Before unpivot: `person = P1` | A/Before, A/After, B/Before, B/After — 4 rows | 3 finite values; sum 22 |
| Before unpivot: `before > 0` | A/Before, A/After — 2 rows | Sum 22 |
| After unpivot: `reading > 0` with numeric zero | A/Before, A/After, C/After — 3 rows | Sum 26; raw string `"2.5"` does not pass the current strict-type query comparison |
| After unpivot: `visit = Before` | All five Before pairs | 2 finite values; sum 10 |
| Exact row-key selection A/Before | A/Before only | A/After stays unselected; source-view supplier set is `{runs:A}` |

Prepare a second ordinary long source with the exact same values/field order as the output and compare scalar rows and aggregates. Its source-row keys and provenance are necessarily different: it represents an imported long table, not an inferred original-wide-cell history.

### F2 — Scalar fidelity and date handling

Use independent one-field cases, all with one input row and one selected field. Keep mode emits exactly one pair in every scalar case; drop mode removes only missing values.

- Absent and explicit undefined: same `reading === undefined`, different `hasOwn` source evidence; raw-table JSON roundtrip preserves the distinction.
- Null/empty/whitespace: preserve distinct raw values; drop yields zero; field schema remains present.
- Zero: one valid numeric value, count(field)=1, sum=0.
- False in a declared number field: one row, count(field)=1, zero finite numeric inputs, sum unavailable (`undefined`), numeric exclusion “Boolean values are not numeric.”
- `"2.5"`: one row, unchanged string, numeric sum=2.5.
- `"bad"`, `"0x10"`, numeric NaN/±Infinity, and their text forms: one row each, count(field)=1, zero finite numeric inputs, numeric sum unavailable. Keep non-finite numbers through project-file encoding.
- Boolean-family fields `[true, false]` across two selected columns: two rows with the same boolean values; false is valid and retained. A declared boolean/number mixed selection fails schema validation.
- Date-family fields `"2026-10-01"` and `"2026-10-03"`: two raw date strings, both valid via shared date helpers. Replacing the second with `"2026-02-30"` retains it as invalid date text; it is not dropped as missing and is not rolled into March.
- Numeric timestamps in date-declared fields remain numbers; raw Date-object table cells fail the existing scalar project-file validation.

### F3 — Identity, source reorder, and schema drift

1. Reverse F1's source array with `recordId` still unique. The output order reverses by input record, but every pair key maps to the same record/field/value; A/Before remains A/Before.
2. Change the entity-key declaration to `person`. A and B now have duplicate entity keys and use `runs:row:0` / `runs:row:1`; all ten outputs remain distinct. Swap A and B: `long:["runs:row:0","runs.before"]` now has value 0 instead of 10. This is the explicit positional-stability limit, not a passing persistent-identity claim.
3. Make an entity key null: use positional identity and expose the missing-key diagnostic; never collapse it with another null key.
4. Reverse selected order. F1 values become `[12,10,null,0,4,undefined,false,"","2.5","bad"]`, with exactly the same key/value pairs in a different order.
5. Change input display label Before to Baseline without changing `runs.before`: saved `visit` values stay Before and the schema IDs/keys are unchanged.
6. Remove `runs.after` from the declared schema: error, no partial five-row output. Merely omit its property from one raw row: missing pair, not schema error.
7. Add declared source field `runs.week2`: F1 still emits ten rows and the same four output fields until explicitly edited.
8. Duplicate input labels: valid selection by IDs, but duplicate default name mappings block Apply until distinguished. Duplicate selected IDs, overlapping keep/selected lists, and output ID `runs.before` or `__ID` fail.
9. Empty `runs: []` with definitions retained: zero long rows and `[runs.recordId, runs.person, visit, reading]`, with types string/string/string/number. This must hold through `queryFields`, worker evaluation, text compilation, and view restore.

### F4 — Incompatible measurements

One input row contains `temperature=20` and `mass=70`, both declared number. Select them with annotations `unit="°C"` and `unit="kg"`, output unit `"°C"`. Validation fails before output; an author-confirmed flag cannot override it. The message names both fields and units.

If both annotations are absent, the evaluator cannot discover this semantic mismatch from numeric types. The draft is incomplete until the author reviews the common quantity/unit. The UI must never claim that review verified the units. A valid alternative is one temperature long query and one mass long query, each with its own meaning/unit. Multi-measure alignment is WL-10, not a workaround that pools them into one numeric value.

### F5 — Calculated inputs

Source `sensor`, key `id`, one row `{ id: "S1", before: 10, after: 12 }`. Calculate `adjusted_before = ["sensor.before"] + 1` and `adjusted_after = ["sensor.after"] + 1` in separate existing calculation steps. Unpivot those two outputs as Before/After, explicitly choosing number because current calculated field metadata lacks a type. Declare one adjusted measurement and one common unit.

- Output values **[11, 13]**; count **2**, sum **24**.
- Both raw membership sets contain sensor S1.
- Before's value trace goes to the immediate calculation result cell, expression, and S1.before=10; After's goes to S1.after=12. The constant 1 has no source-row supplier.
- Both long keys use immediate input key `sensor:string:S1` paired with the corresponding calculated field ID.
- The value trace must not use every source field simply because its row is a contributor.

### F6 — Two lookup aliases to the same source

Input `records` row `{ id: "R1", primaryId: "P1", secondaryId: "P2" }`. Related `people` rows `{ id:"P1", reading:20 }`, `{ id:"P2", reading:25 }`. Perform two lookups with aliases `primary` and `secondary`, then select `primary.reading → Primary` and `secondary.reading → Secondary`.

- Values **[20,25]**, count **2**, sum **45**; lookup preserves input key `records:string:R1`.
- Each long row's raw membership set is `{records:R1, people:P1, people:P2}` because that is the input result's membership.
- Primary's exact supplier is people P1.reading; Secondary's is people P2.reading. Their shared source ID is not sufficient to choose a provider.
- Add another people row with id P2 and reading 99. Secondary becomes `undefined`, with an ambiguous-match diagnostic and two positional P2 candidate references. No candidate is marked as supplier. Keep mode still emits two pairs, finite sum **20**; drop mode emits only Primary. The diagnostic remains available.

### F7 — Expansion followed by reshape, then grouped reshape

Use a repeated quantity in units of items:

```ts
const parents = [{ id: "P1", region: "North" }];
const children = [
  { id: "C1", parent: "P1", a: 1, b: 2 },
  { id: "C2", parent: "P1", a: 3, b: 4 },
];
```

Expand parent to child with step `e`, alias `child`. Exact expansion keys:

```text
e:["parents:string:P1","children:string:C1"]
e:["parents:string:P1","children:string:C2"]
```

Unpivot `child.a → Before`, `child.b → After`:

- Output values **[1,2,3,4]**, count **4**, numeric sum **10**.
- Each long row's immediate input is one expanded row, with raw memberships parent P1 plus the particular child.
- Suppliers are C1.a, C1.b, C2.a, C2.b respectively. Selecting C1.a does not select C1.b or C2.a.
- Long keys follow the same JSON-pair rule with the entire expansion key as the first element; nested quoting is handled by JSON serialization.

In a separate query, aggregate the expansion by `parents.region`, step `g`, with `sumA=sum(child.a)` and `sumB=sum(child.b)`. Then unpivot those two measures with explicit number family:

- Group result key **`g:["string:North"]`**; `sumA=4`, `sumB=6`.
- Long values **[4,6]**, count **2**, sum **10**.
- Both long rows have **one grouped immediate input row** and **three raw memberships**: P1, C1, C2.
- sumA trace: immediate expanded rows E1/E2, inputs 1 and 3, both included; source cells C1.a and C2.a.
- sumB trace: immediate expanded rows E1/E2, inputs 2 and 4, both included; source cells C1.b and C2.b.
- A separate `count(*)` measure on this group is **2**, based on immediate expanded rows. Its new contributor trace has row inputs, not an invented single source cell.

Also cover a missing child with `keepUnmatched:true`: an unpivoted child value is undefined with an unmatched reason; kept parent values still trace to the parent. A global aggregate over zero input rows still has its existing one summary row; unpivoting one unavailable sum yields one missing pair under keep and zero under drop.

The supplied shop fixture remains a regression source: `createShopFixture` has O1 amount 30 with I1/I2 revenues 10/20, an expansion/summary chain, ambiguous and missing relationships, and empty totals. Do not change its existing grain/count behavior as a side effect of adding the new trace edges.

### F8 — Persistence, limits, and UI proof

- Exact project JSON and project-text roundtrips preserve ordered lists, mappings, IDs/labels, family/unit declarations, missing policy, and compatibility.
- Copying a query produces fresh step IDs, but retains output field IDs so downstream references still resolve.
- Save a chart filter selecting A/Before, restore, and verify only that pair; absent saved keys remain unresolved.
- Export one selected view and verify only its needed query/source/relationship dependencies, with unpivot retained.
- Empty-result analysis text preserves charts bound to `visit`/`reading`; no “first row” schema inference is allowed.
- Direct and worker outputs match for undefined, false, and non-finite values. An older worker reply cannot replace a newer result; inspection during pending uses the old applied snapshot, then switches atomically.
- Candidate pair budget: 50,000 inputs × 2 columns = **100,000**, allowed if the cell budget fits. 50,001 × 2 = **100,002**, rejected before output allocation. A missing-drop policy does not bypass this bound.
- Cell budget: 100,000 candidates with 18 kept fields creates **2,000,000** projected cells, allowed; 19 kept fields creates **2,100,000**, rejected. Multiple unpivot stages share cumulative budgets.
- Preview/cancel produce zero host mutations. Apply produces one coherent operation. Edit/removal validation protects later steps; incompatible saved settings remain retrievable.
- Browser proof uses real pointer and keyboard input at **1280, 783, 390 px**, including long/duplicate labels, selected ordering, no rows, pending/error states, source tracing, active filters, Escape/focus return, and reachable actions.

## 9. Milestones and deferred alternatives

### M1 — Complete saved single-measure unpivot

Ship WL-01 through WL-08 as one user-visible vertical feature. Internal implementation batches can be ordered as types/schema/evaluation → lineage/snapshots → persistence → editor/inspection → docs/example/proof, but an evaluator alone is not a completed milestone.

- **Files/tests:** the concrete map in §7.3; F1–F8 in focused evaluator, selection identity, worker, project-file, DSL, analysis-text, step-editing, and editor tests. Existing test paths in the packet are authoritative; locate or create missing companion test files in the checkout.
- **Docs:** `apps/demo/src/docs/pages/project-folders.mdx`, new **Unpivot repeated measurements** section and the existing **Query steps** table.
- **Runnable example:** proposed `/examples/repeated-measurements`, backed by a focused new demo project and fixture, with Wide records and Measurements views, row tracing, and saved project text. Register in `apps/demo/src/demos/examples.ts` and `coverage.ts`; add a narrow required feature such as `query:unpivot`.
- **Main risk:** confusing one input result row with one raw record, especially when lookup/expansion/grouping precedes reshape. The exact trace fixtures and snapshot test are release gates.
- **Completion:** restored charts, selections, rows, counts, and evidence agree; all three browser widths pass; a minor changeset accompanies the library feature.

The supplied `apps/demo/src/demos/analyses/shop.ts` is `shopText` for the single-source shop dashboard. The `multi-source-shop` registration imports an unseen `multiSourceShop` module. Use the observed `ExampleData.project/tables/views/queryPresets` shape for the new example without claiming that unseen module was inspected. Keep `shop-operations` as the featured example.

### M2 — Explicit refresh repair and broader selection on request

Deliver WL-09 after M1 is useful on its own. Add a compact review of newly available fields and explicit rebinding for removed fields, plus **All measurements for these input rows** as a deliberate selection action. No automatic additions or pattern guesses.

- **Files:** `UnpivotStepEditor.tsx`, `ProjectQueryPanel.tsx`, `QueryStageRows.tsx`, `stepEditing.ts`, `queryEditing.ts`, `analysisRowKeys.ts`, and the existing repeated-measurement demo/coverage definitions. Add a small `unpivotRefresh.ts` helper only if shared comparison logic warrants it.
- **Tests:** added fields remain inert until accepted; rebind changes only selected declared references, previews affected keys/categories, and uses the M1 fork rule for a new measurement meaning; broad selection chooses all current pairs for exactly the selected immediate input result keys, including grouped inputs, never all rows sharing a duplicated business ID.
- **Docs:** the same page's **Refresh and repair** and **Selecting measurements or input rows** subsections.
- **Runnable example:** an explicit refresh variant of `/examples/repeated-measurements`, with a newly added After 2 column, a renamed source ID, and duplicate business identifiers.
- **Browser proof:** select/repair/cancel/restore with pointer and keyboard at 1280/783/390 px.
- **Main risk:** a convenient repair silently changes the population or expands a selection. Show the new pairs and require an explicit acceptance.

### Alternatives left outside these milestones

**WL-10 Explore:** multiple measurement families could produce `occasion`, `temperature`, and `pressure` from explicit mappings. Before building, decide alignment, per-family types/units, missing combinations, and the identity of an occasion. This is an alternative next design, not an automatic M3.

**WL-11 Explore:** global source quantity/unit metadata could improve compatibility checks, but it affects import, calculation, aggregation, labels, and serialization. Scoped author declarations are sufficient for M1.

**WL-12/15 Defer or Avoid:** no patterns, dynamic wildcard membership, reverse pivot engine, arbitrary nested data, graph editor, service/deployment work, or general result catalogue. Existing prepared-long import stays useful throughout.

## 10. Primary sources

All sources were checked October 23, 2026. Documentation is cited as retrieved; no release-number claim is needed for the design. The tools differ in null behavior and refresh policy, so those choices are explicit explorEDA proposals.

- **E1:** tidyr, [Pivot data from wide to long — `pivot_longer`](https://tidyr.tidyverse.org/reference/pivot_longer.html).
- **E2:** pandas, [`pandas.melt`](https://pandas.pydata.org/docs/reference/api/pandas.melt.html).
- **E3:** pandas, [`pandas.wide_to_long`](https://pandas.pydata.org/docs/reference/api/pandas.wide_to_long.html).
- **E4:** Tableau Prep, [Pivot Your Data](https://help.tableau.com/current/prep/en-us/prep_pivot.htm).
- **E5:** Microsoft Power Query, [Unpivot columns](https://learn.microsoft.com/en-us/power-query/unpivot-column).
- **E6:** Microsoft Power Query M, [`Table.Unpivot`](https://learn.microsoft.com/en-us/powerquery-m/table-unpivot).
- **E7:** Vega-Lite, [Fold](https://vega.github.io/vega-lite/docs/fold.html).
- **E8:** Vega, [Fold Transform](https://vega.github.io/vega/docs/transforms/fold/).
- **E9:** Vega-Lite, [Transformation](https://vega.github.io/vega-lite/docs/transform.html).
- **E10:** pandas maintainers, [`pandas/core/reshape/melt.py`](https://github.com/pandas-dev/pandas/blob/main/pandas/core/reshape/melt.py), current source inspection.

## 11. Access, files read, evidence status, and open questions

### Access status

**Passed before external research.** Both supplied attachments were readable. The complete source packet identifies the requested full baseline and contains 38 complete file blocks. All 38 were read across the source review, including the full large example-registration and coverage files. No repository execution, dependency installation, browser run of the repository, commit, or push was performed. No missing decisive input prevented the design.

### Complete repository files read

- `AGENTS.md`
- `README.md`
- `docs/agent-guide.md`
- `docs/ui-defaults.md`
- `CODING_STANDARDS.md`
- `docs/research/DIRECTION.md`
- `package.json`
- `packages/explorEDA/src/types/AnalysisProject.ts`
- `packages/explorEDA/src/lib/analysis/evaluateProject.ts`
- `packages/explorEDA/src/lib/analysis/sources.ts`
- `packages/explorEDA/src/lib/analysis/projectFile.ts`
- `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts`
- `packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts`
- `packages/explorEDA/src/lib/valueParsing.ts`
- `packages/explorEDA/src/lib/dsl/project.ts`
- `packages/explorEDA/src/lib/dsl/project.test.ts`
- `packages/explorEDA/src/lib/project/analysisText.ts`
- `packages/explorEDA/src/components/project/stepEditing.ts`
- `packages/explorEDA/src/components/project/queryEditing.ts`
- `packages/explorEDA/src/components/project/settingsCompatibility.ts`
- `packages/explorEDA/src/components/project/sourceRowIdentity.ts`
- `packages/explorEDA/src/components/project/analysisRowKeys.ts`
- `packages/explorEDA/src/components/project/ProjectQueryPanel.tsx`
- `packages/explorEDA/src/components/project/QueryFlow.tsx`
- `packages/explorEDA/src/components/project/QueryStageRows.tsx`
- `packages/explorEDA/src/components/ExplorEdaProject.tsx`
- `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`
- `packages/explorEDA/src/test/lib/analysis/selectionIdentity.test.ts`
- `packages/explorEDA/src/components/project/stepEditing.test.ts`
- `packages/explorEDA/src/test/fixtures/shopProject.ts`
- `apps/demo/src/demos/analyses/shop.ts`
- `apps/demo/src/docs/pages/project-folders.mdx`
- `apps/demo/src/demos/examples.ts`
- `apps/demo/src/demos/coverage.ts`
- `docs/intent/research-ideas-100/ideas/R042-wide-long-reshape.md`
- `docs/research/data-preparation-boundary-2026-10-16/README.md`
- `docs/research/data-preparation-boundary-2026-10-16/decisions.md`
- `docs/research/wide-long-2026-10-23/pro-prompt.md`

The separate uploaded mission prompt was also read in full. Repository path/symbol citations above refer to these supplied contents, not to an assumed later `main`.

### Checked facts versus proposals

- **Checked:** the step union and evaluator behavior, source identity limits, scalar parsing/count distinctions, current field-origin limitations, expansion's new-view precedent, empty-table schema discovery, persistence/parser surfaces, worker request handling, existing UI/settings behavior, example/coverage structures, and primary-source comparisons.
- **Inferences:** a saved step best matches this architecture; explicit selection and new-view application reduce ambiguity; scoped lineage additions suffice without a new execution platform.
- **Proposals:** every new type/API, UI label, limit, DSL clause, lineage edge, fixture acceptance result, milestone, and future behavior. No proposed feature or browser check is claimed to have passed.

### Deliverables

- [report.md](report.md) — comparisons, decisions, full contract, repository evidence, and exact fixtures.
- [implementation-plan.md](implementation-plan.md) — short ordered implementation handoff.
- [wide-to-long-design.zip](wide-to-long-design.zip) — both Markdown deliverables only.

### Open questions for implementation, with defaults already chosen

1. **Measured resource ceiling:** start at 100,000 candidate pairs / 2,000,000 projected cells; adjust only with actual runtime evidence before release. This does not block starting M1.
2. **No-row chart compilation:** inspect `compileViews` and the public export/host wiring omitted from the packet. Passing explicit schema through the current path is the required outcome; a second evaluator is not an option.
3. **Copy terminology and unit review wording:** use Unpivot columns / Open long table and author-supplied units as specified; refine wording within existing components without a separate demand or usability gate.
4. **Later scope:** multiple value families and global units remain Explore decisions, not commitments. M1 is complete without either.

[E1]: https://tidyr.tidyverse.org/reference/pivot_longer.html
[E2]: https://pandas.pydata.org/docs/reference/api/pandas.melt.html
[E3]: https://pandas.pydata.org/docs/reference/api/pandas.wide_to_long.html
[E4]: https://help.tableau.com/current/prep/en-us/prep_pivot.htm
[E5]: https://learn.microsoft.com/en-us/power-query/unpivot-column
[E6]: https://learn.microsoft.com/en-us/powerquery-m/table-unpivot
[E7]: https://vega.github.io/vega-lite/docs/fold.html
[E8]: https://vega.github.io/vega/docs/transforms/fold/
[E9]: https://vega.github.io/vega-lite/docs/transform.html
[E10]: https://github.com/pandas-dev/pandas/blob/main/pandas/core/reshape/melt.py
