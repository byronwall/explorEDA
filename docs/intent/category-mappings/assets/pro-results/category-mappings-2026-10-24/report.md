Build **Map categories** as an explicit, row-preserving project query step that creates a new categorical field from reviewed, typed category mappings. Keep the recipe inline in the query, preserve the input field and source records, default unmatched values to their existing category, and provide a compact editor with exact before/after records, one Apply action, editing, guarded undo, and dependency-aware removal. Ship the complete manual feature in the React project workspace, demo, and folder app—including JSON and `.eda` persistence, refresh behavior, and notebook consumption—then add reviewed trim/lowercase suggestions. Keep formulas, relationship lookup tables, automatic clustering, join-key preparation, and a shared mapping registry outside this first boundary.

# Reversible category mappings: Design report

**Project:** explorEDA · **Baseline:** `95832bd473884aeae23453af0888b4ca5187820d` · **Research date:** October 24, 2026 · **Mode:** Design.

The accompanying `implementation-plan.md` turns this decision into ordered milestones. Recommendations use stable **CM01–CM20** identifiers. “Reversible” means that the original field remains available and the recipe can be changed or removed; a many-to-one mapping has no unique mathematical inverse.

## 1. Access, evidence, and decision status

**Access GO.** The mission prompt and all **34 complete files** in the supplied packet were read. The packet contains 8,319 lines and declares the requested baseline. Supplemental implementation files were fetched from connected GitHub at that exact commit to resolve the editing, folder persistence, history, color, worker, and notebook seams that the packet references. The full packet inventory appears in Appendix A; supplemental sources appear in Appendix B. No decisive input remains inaccessible.

The attached packet is the authoritative selected snapshot. Its baseline declaration was read; this run did not independently reconstruct the entire repository or compare every packet byte with GitHub. Supplemental reads were pinned to the same commit. Neighboring research PRs #518–#521 were not treated as implemented capabilities.

Evidence labels used throughout:

- **Baseline fact:** directly read source, including a named path and symbol. Tests that were read establish intended assertions, not evidence that those tests passed during this run.
- **Primary-source fact:** official product documentation or language/Unicode specifications, linked directly.
- **Design decision:** the proposed behavior, including deliberate departures from a comparison product.
- **Executed research check:** a standalone JavaScript oracle checked the fixture and recipe semantics. It did not execute explorEDA's evaluator, mounted components, folder saver, or browser flows.

Byron's request supplies demand. `docs/research/DIRECTION.md` supersedes the older demand/deferral language in R038. This report recommends a feature and a shipping sequence; it does not require an external customer or participant study before building it. [R02]

## 2. What already exists, and what the feature adds

### 2.1 Existing capabilities that should remain authoritative

| Baseline capability | Evidence and implication |
| --- | --- |
| Typed category identity | `lib/categories.ts::categoryKey`, `categoryEqual`, and `categoryValue` distinguish scalar types, combine null/undefined, and combine the two signs of zero. Mapping must use this identity locally. [R03] |
| Separate display and conversion | `fieldSettings.ts::getFieldLabel` changes a field's label; categorical `convertFieldValue` retains present scalar values. Neither supplies an alias recipe. Numeric conversion can intentionally turn text into numbers and is a different operation. [R04] |
| Explicit project operations | `AnalysisStep` contains source, lookup, expand, calculate, filter, and aggregate. There is no map step. `calculateFrame` shows the row-preserving pattern the new evaluator should follow. [R05], [R06] |
| Stage and record inspection | `QueryFlow` and `QueryStageRows` expose stages, counts, and source references. The stage table can reveal more rows, but the nested source table stops at 25; its cells also obscure blank and typed-lookalike values. These parts need targeted changes for an exact mapping review. [R08] |
| Two host write paths | `ExplorEdaProject.update` reports query/view edits through `onProjectChange`; chart/filter edits use `onStateChange`. Mapping Apply belongs in the first path. [R09] |
| Project serialization | `projectFile.ts` validates references and encodes undefined/nonfinite source values. `selectAnalysisProjectView` exports the query's dependency closure. Inline map entries fit that closure naturally. [R07] |
| Existing worker execution | The worker receives an entire `AnalysisProject` and invokes the same evaluator. A new map operation needs no new worker request type. [R10] |
| Project-backed notebooks | `readNotebookText` evaluates a project query. `compileNotebook` and `sheets` share one notebook model across blocks/sheets; they do not require another mapping owner. The folder host currently retains notebook rows from folder load, so current-project reevaluation is necessary. [R11], [R14] |

Two important limitations shape the design without expanding it into an audit:

- **Mapping inspection cannot use formatted labels as identity.** `categoryLabel` is useful, but it does not quote every string with trailing whitespace. `QueryStageRows.Cell` uses `isMissingValue` and `String(value)`, which can make `" "` look missing and number `1` look like text `"1"`. The mapping editor needs a small exact-value renderer. [R03], [R08]
- **Saved query removal is stronger than interactive removal today.** `projectFile.ts::fieldsAt` checks field dependencies, whereas `stepEditing.ts::removeStep` relies on evaluating empty tables through `queryFields`. A downstream filter can therefore escape the interactive check. Share the structural field check instead of relying on empty-row evaluation. [R07], [R12]

### 2.2 Product and ownership boundary

The recipe belongs to **one query step**, not a chart, a field label, a workspace calculation, or a global source definition. The resulting field is available to every chart over that query result. Views selecting the same query share the recipe. Copying a query creates an independent recipe; editing one copy must not mutate the other.

The editor's first home is the **existing Query panel**. Add a visible **Map categories** action for the current output's fields and an **Edit mapping** action on a map step. This is local work inside an existing temporary panel; it does not introduce another permanent sidebar. In milestone two, a field action can open the same editor with the field already selected.

**First-release availability:** `ExplorEdaProject`, including projects with only one source, the project demo, and the folder app. A bare `ExplorEda(data, savedData)` workspace does not gain a separate `SavedDataStructure.mappings` store. Hosts that want mapping for one table can use the existing `singleTableProject` conversion and render `ExplorEdaProject`. Its field-reference and row-selection rewriting is already implemented, though that conversion must be exercised in the feature's integration tests. [R13]

This is a complete first release: an analyst can author, apply, use, inspect, revise, save, reopen, and refresh a map in a one-source or multi-source project. The limit is the host/model boundary, not a requirement to find another customer. A universal in-place conversion button for arbitrary standalone hosts is deferred because those hosts own their data and persistence.

**Placement:** new maps append to the query's current output. Existing maps can be edited in place after later operations have been added. To start from an earlier stage without changing existing downstream work, use the existing **Open this step as a view** flow, then append the map. General insertion/reordering of arbitrary query graphs is not required. [R12]

A map after aggregation changes category labels on the aggregate rows; it does not merge those rows or recompute their measures. To combine source categories before a sum or average, place mapping before aggregation. Always retain the current stage's row unit: “28 records” and “7 groups” are different denominators.

## 3. Comparison and architecture choice

### 3.1 Lessons from strong tools

The comparison is based on official documentation, not hands-on testing of the products during this run.

| Tool and verified behavior | What explorEDA should adopt or reject |
| --- | --- |
| **OpenRefine:** cluster edits require approval; clustering is syntactic and does not establish semantic equivalence. Its fingerprint can remove punctuation/diacritics and reorder tokens. [S01], [S02] | Adopt explicit review and visible original values. Do not adopt fingerprint equality as category or entity identity. Keep candidate discovery separate from committed rules. |
| **Power Query:** transformations appear as inspectable Applied Steps. Text Replace Values defaults to replacing occurrences within text; whole-cell matching is an option. [S03], [S04] | Adopt a named transformation with an inspectable intermediate result. Choose whole-value typed equality for maps; substring replacement would make `North` affect `North-East` unexpectedly. |
| **Tableau:** groups create an editable grouped field, support both correction-oriented and analytical grouping, and can optionally place ungrouped members in Other. [S05] | Adopt a reusable field, editable membership, and an explicit fallback choice. Record whether the author means aliases or a deliberate analytical group. |
| **JMP Recode:** new-column output is the default; a formula-column option updates from original data; selections in the recode window identify corresponding table rows. [S06] | Adopt original/new values, counts, record reachability, and recomputation from the recipe. Do not offer in-place source mutation. |

Two programming precedents expose an otherwise hidden default choice: forcats `fct_recode` keeps unmentioned levels, while ordinary dictionary `pandas.Series.map` maps absent keys to missing. explorEDA should choose **Keep category** explicitly, rather than treating “map” as a sufficient specification. [S07], [S08]

Power Query's fuzzy clustering is a useful caution: a threshold of 1 can still ignore casing, word order, or punctuation, and its transformation table can affect text occurrences inside longer strings. That is a different contract from the exact typed mapping proposed here. [S09]

### 3.2 Three implementation alternatives

| Option | Assessment for this repository |
| --- | --- |
| **Dedicated typed map step — choose** | Adds one operation to an existing query model, one pure mapping helper, one editor, and serialization cases. It has an explicit field dependency, stable step identity, exact records, and shared output across charts. The unavoidable work is complete UI/persistence integration, not the evaluator. |
| **Formula extension — reject as the first boundary** | A scalar recode function could compute one row's value, but the current registry accepts row-local scalar functions and has no mapping-literal editor or reviewed rule object. Adding a formula would still require typed rule authoring, counts, missing policy, provenance, and dependencies. A nested conditional is hard to review; a hidden mapping registry referenced by a formula would add a second owner. [R06], [R15] |
| **Small lookup source — defer as a separate workflow** | The baseline lookup supports relationships and typed keys, but it rejects null/NaN join keys, reports ambiguous matches, and adds relationship/source machinery. A map would need extra missing/fallback treatment and an editable source table. That cost buys external table maintenance the initial feature does not need. [R06] |

The strongest reason for a dedicated step is not syntax convenience. It puts **category membership, a reusable field, and the original records in the same inspectable operation**. It also avoids weakening relationships to make them behave like category maps.

### 3.3 Reuse without a shared registry

- All views of a query already reuse its mapped output.
- An independent query copy carries its own entries. Keep edits immutable, and copy the entries array/objects when copying a query. `copyQuery` currently spreads step objects shallowly. [R12]
- Exporting a view's project closure includes the relevant map step automatically once the union and validators recognize it. [R07]
- Whole-query removal needs no map-specific cleanup: removing the owning query removes its inline recipes. Known views/notebooks still need the host's dependency decision; do not silently retarget them. M1 does not add a separate whole-query deletion surface or an orphan-map lifecycle.
- Do not add `mappingId`, a project-wide map collection, a mapping source file, or an external registry now. Those create edit propagation and removal questions without improving the first use case.

## 4. Exact recipe and value contract

### 4.1 Saved shape

The following is a **proposed** addition to `types/AnalysisProject.ts`:

```ts
type CategoryMapTarget = string | number | boolean | null;
// Runtime validation: target numbers must be finite; normalize target -0 to 0.

type CategoryMapEntry = {
  sourceKey: string; // Exactly categoryKey(raw), validated as canonical.
  target: CategoryMapTarget;
};

type CategoryMapStep = {
  id: string;
  kind: "map";
  inputStepId: string;
  inputFieldId: string;
  fieldId: string; // Fresh, unqualified output ID; immutable after creation.
  label: string;
  purpose: "aliases" | "grouping";
  entries: CategoryMapEntry[];
  unmatched:
    | { kind: "keep" }
    | { kind: "value"; value: CategoryMapTarget };
};
```

Use `sourceKey` rather than a second stored copy of the source scalar. It is already the repository's typed category identity and is JSON-safe even for numeric NaN, infinities, or the missing category. It avoids a real host constraint: demo history clones projects with JSON parse/stringify, which would corrupt raw undefined/nonfinite rule values. Finite typed targets are also JSON-safe. No scalar DTO, additional codec, or map-specific revision hash is needed. [R03], [R16]

Example entries:

```json
[
  { "sourceKey": "[\"string\",\"North\"]", "target": "North" },
  { "sourceKey": "[\"string\",\"north\"]", "target": "North" },
  { "sourceKey": "[\"string\",\"North \"]", "target": "North" },
  { "sourceKey": "[\"number\",1]", "target": "Numeric one" }
]
```

Do not save preview counts, selected preview rows, observed-value inventories, draft edits, search terms, computed outputs, timestamps, or a history chain in the recipe. The source table plus query recipe is sufficient to recompute the result.

### 4.2 Identity matrix

These are the existing `categoryKey` identities, unchanged globally. [R03]

| Input | Mapping identity | Derived output under Keep category, absent an entry |
| --- | --- | --- |
| number `1` | `["number",1]` | number `1` |
| text `"1"` | `["string","1"]` | text `"1"` |
| boolean `true` | `["boolean",true]` | boolean `true` |
| text `"true"` | `["string","true"]` | text `"true"` |
| `null` or `undefined` | `["missing"]` | `null` for both |
| empty text `""` | `["string",""]` | empty text |
| one space `" "` | `["string"," "]` | one space |
| literal `"(missing)"` | `["string","(missing)"]` | the literal text |
| numeric `NaN` | `["number","NaN"]` | numeric `NaN` |
| numeric `Infinity` / `-Infinity` | `["number","Infinity"]` / `["number","-Infinity"]` | the respective numeric value |
| text `"NaN"` / `"Infinity"` | string keys with those exact contents | the respective text |
| `-0` or `+0` | `["number",0]` | the input numeric value; both remain one category |
| `"001"` | `["string","001"]` | text `"001"`, never numeric `1` |

**Keep category means `categoryValue(raw)`, which is `raw ?? null`.** Only the new output canonicalizes null/undefined to one null value. The original input field remains null or undefined as supplied. This is deliberate: raw `aggregateFrame` currently groups null and undefined separately, while category charts combine them. A canonical missing value in this explicit new categorical field makes downstream chart and query grouping agree, without changing global aggregation or source semantics. [R03], [R06]

Blank text is a present category here. `valueParsing.ts::isMissingValue` also treats empty/whitespace strings as missing measurements; it must not define mapping-key equality. Show **Missing category** and **Blank text** separately in mapping review, and explain that generic field missing counts may include blanks. [R04]

### 4.3 Target values, defaults, and fallbacks

- **Targets are typed scalars**, not necessarily strings. The target editor starts in Text mode; Number, Boolean, and Missing are explicit choices.
- Text stays exact, including empty text and leading/trailing spaces. Never trim a target automatically. A visible quoted preview makes unusual choices reviewable.
- Number targets must be finite. Undefined, NaN, and infinity targets are invalid; these are matchable input categories but unnecessary authored output targets. Normalize a numeric target `-0` to `0` at commit.
- Missing target means `null`. Literal text `"null"`, `"undefined"`, or `"(missing)"` remains text.
- **Default:** keep unmatched categories. A missing-category input becomes canonical null; all other unmatched input values retain their scalar value.
- **Optional constant fallback:** use the selected typed value for every unmatched category, including missing. Preview explicitly includes missing rows in that count. An explicit missing-category entry takes precedence; a missing→null entry preserves that bucket while other unmatched categories become Other.
- No row is deleted, excluded, or added by a mapping. An output missing value is a category result, not a filtered-out record.

“Unmatched” is relative to the entry list. It does not mean an error or an unknown entity. With Keep category, an unmatched value can legitimately share an output category with an explicit rule's target. For example, `north→North` and an unmatched original `North` both contribute to output North. The target preview must show the entire output membership, not just the rule's matched rows.

### 4.4 Matching, chains, cycles, and conflicts

For each input row, compute `categoryKey(row.values[inputFieldId])` once and perform one map lookup. Use `Map.has`; `get(...) ?? raw` is incorrect because null is a valid target. Entries are simultaneous and order-independent.

- `A→B`, `B→C` maps original `[A,B,C]` to `[B,C,C]`.
- `A→B`, `B→A` swaps `[A,B]` to `[B,A]`; it cannot loop.
- A later map step may explicitly read the preceding step's output. That is ordinary query composition, not recursive application within one map.
- Multiple different source keys may share a target. That is the intended many-to-one operation.
- A source key may appear **once only**, even if duplicate entries name the same target. Reject duplicates rather than choosing first or last.
- Because their identities coincide, null/undefined entries conflict with each other, and -0/+0 entries conflict with each other. Number `1` and text `"1"` do not conflict.
- Editing a source category already assigned to a target offers **Move to this target** and changes that entry. It must not silently append a duplicate.

The editor may temporarily hold an invalid draft, display both conflicting targets, and keep Apply disabled. The committed query remains unchanged. Imported invalid recipes must fail validation; they must never partially apply the entries that happen to validate.

### 4.5 Validation and output field metadata

Validate the whole step before reading rows: required nonempty IDs and label, the purpose enum, the entries array and entry records with required `sourceKey` and `target`, and the unmatched discriminator. Reuse the same finite typed-target validator for entry targets and constant fallback values. Invalid recipes reject even on empty input.

Validate canonical keys by decoding the JSON tuple, checking its exact allowed shape, reconstructing its representative scalar, and requiring `categoryKey(representative) === sourceKey`. This rejects malformed tuples and alternative spellings such as `["number","1"]`, `["missing",null]`, `["number",-0]`, or whitespace-padded key JSON. Do not use string labels as a fallback identity.

Validate `inputFieldId` against the input frame even when it contains zero rows. A missing field must not be treated as a column of undefined values and mapped through the missing entry. Validate the output ID before evaluation: it must be new, unqualified, nonreserved, and distinct from the input and other produced fields. Generate it once from the proposed label with a collision-safe suffix; changing the label does not change the ID.

A new map output has `origin: { stepId }`. Add a small evaluated-field categorical hint, for example `AnalysisField.categorical?: true`, with `type: "unknown"` for its mixed scalar domain. Translate that hint into the existing categorical treatment in `ExplorEdaProject` and stage profiles. Do not call a numeric target a string or let a numeric-looking output be automatically treated as a measurement. This hint is derived from the map step, not separately saved in field settings. [R09]

The hint must affect the initial no-settings path as well as restored field settings: `renderedSettings` is undefined when no settings exist, so updating declared metadata alone is insufficient. Thread categorical treatment through the initial field-types/provider path and stage profiles, preserving typed scalar values. Never inherit the input field's conversion settings. The hint supplies the default; an explicit view conversion remains a separate visible operation. Mapping previews use exact query-stage values before that conversion, and Apply does not silently clear the override. [R04], [R09]

Fresh unqualified field IDs also prevent a map output from impersonating a source relationship endpoint: existing relationship resolution accepts certain matching source-qualified IDs as well as origin metadata. Do not attach source-field origin or silently change relationship keys. [R06], [R12]

### 4.6 What “aliases” and “grouping” mean

`purpose: "aliases"` records the author's assertion that the selected values are alternate labels for the same category. `purpose: "grouping"` records an analytical choice, such as combining East and West into Domestic. The evaluator is identical; the purpose travels with the step and appears in its summary.

Neither setting modifies a source, certifies entity identity, or proves that a source is erroneous. The original field remains available for comparisons. A grouping is reversed by editing/removing its recipe, not by guessing which original category a target came from.

## 5. Complete authoring and inspection flow

### 5.1 Entry, drafting, and application

Authoring requires the host's project-change callback. In a read-only embedding, existing maps and their exact rows remain inspectable, while mutation actions are unavailable; inspection must not create a private unsaved recipe owner.

1. Open **Query → Map categories**. Choose a current output field with the shared `FieldMetadata` treatment. A later field-menu shortcut opens this same editor.
2. Set **Purpose** to Combine aliases or Analytical grouping. Suggest a fresh output name such as `Region grouped`; show the original field alongside it.
3. Search the full input-stage category inventory. Each value shows its scalar type, exact text, full-input row count, and current target if any.
4. Check the intended source categories and enter a typed target. Selecting `North`, `north`, and `North ` can add three entries, including the explicit North identity entry.
5. Preview the proposed result using the same pure helper as evaluation. Show category counts, rule matches, changed categories, unchanged categories, unmatched rows, and missing/blank distinctions. Open the relevant rows inside the editor's **Rows** tab.
6. Apply once. Replace/append the step immutably through the project callback; close the draft and retain the selected map step in Query flow. The output field becomes available to existing chart field pickers. Do not add or rearrange charts automatically.
7. Use the output in a row chart, bar grouping, color field, table, filter, calculation, or later aggregate. Existing chart selection continues to filter linked views.

Cancel or Escape closes the active nested editor before the surrounding panel and emits no project change. Draft edits never call the chart callback. The output field name can be edited later without breaking field references because its ID remains stable.

### 5.2 Concrete UI states

These are design specifications, not screenshots of implemented UI.

| State | Visible content and actions |
| --- | --- |
| **Draft** | Header: **Map categories · Apply · Cancel**. Rows: **Input / Records value**, **Output / Region grouped**, **Purpose / Combine aliases**. Scope: **All 28 input records · before chart filters**. Tabs: **Values · Rows**. Search: **Find source values**. |
| **North selected** | Three checked text values, rendered as `"North"`, `"north"`, `"North "`; each has count 1. Target: **Text / North**. Preview: **North · 3 records · 2 change category**. The trailing-space row shows a visible whitespace cue and exact escaped text. |
| **Full fixture ready** | **28 → 28 records; 26 → 23 categories**. **11 mapped · 9 changed · 19 unchanged · 17 unmatched**. Separate readouts: **2 missing-category inputs; 2 blank-text inputs**. These counts intentionally overlap; they are not four exclusive bins. |
| **Conflict** | Inline error beside the duplicated source: **“north” has two targets: North and Northern. Choose one.** Apply disabled; charts retain the committed recipe. |
| **Applied** | Query step: **Map Region grouped · 28 records**. Detail: **Aliases from Records value · 10 entries · keep other categories**. Actions: **Edit mapping**, **Remove**, and guarded **Undo mapping change** where available. |
| **Source refreshed during edit** | Preserve the draft. Replace stale outcome counts with **Data changed · Refresh preview**. Apply and exact source inspection remain unavailable until preview and input snapshot match. |
| **Dormant entry** | Existing numeric `1→Numeric one` remains listed with **0 current records** after the fixture refresh. It is editable/removable and becomes active again if numeric 1 returns. |

“Unchanged” means **same category**, not necessarily the same JavaScript representation. In particular, an unmatched undefined input becomes null in the new field while remaining in the same missing category. The raw before/after row cells still show that representation change.

### 5.3 Scope before and after linked filtering

The recipe reads **every row at its input stage**, after upstream query filters and parameter bindings, and before downstream chart/workspace filters. It never saves a set of currently visible row positions.

- In the 28-row fixture, an odd-ID linked filter leaves 14 visible records and 2 visible North records. The mapping preview still reports 28 input records and North membership of 3.
- The visible chart and status bar continue to show their actual filtered scope after Apply. Mapping review labels its own full-stage scope explicitly.
- A target row count includes all input records producing that target, including an unchanged/pass-through original value with the same target identity.
- On a map before a later aggregate or expansion, do not infer “visible input rows” by intersecting different kinds of row keys. The first release supplies exact full-stage review. A future projected-view scope needs an exact membership implementation, not a related-record approximation.
- Table search and audit selectors narrow the temporary review table only. They neither change the recipe's scope nor add chart/workspace filters.

### 5.4 Exact records and provenance

The Rows tab provides independent selectors for **All / Mapped / Unmatched**, **All results / Changed / Unchanged**, and **Missing input**. The last selector means null/undefined; blanks remain individually selectable categories. Include original value, derived value, rule/fallback reason, stable result-row key, and access to source records.

The evaluator should spread each existing `AnalysisResultRow`, replace only `values` and `data`, and retain `key`, `sourceRows`, `contributors`, and `measureContributors`. Input/output counts are equal; `excludedCount` is zero; `rowUnit` is inherited. Mapping evidence can be reconstructed from the step, input stage, and output rows—no per-row saved audit ledger is needed. [R06]

For affected rows, show the exact carried `sourceRows`, deduplicated by source and row key only for the distinct-source-record count. An expanded result can contain several input rows that refer to the same source record. Show both counts rather than equating them. For an aggregate input, its original source-reference union remains reachable.

Do **not** present `relatedRecords()` as the exact affected set: it adds relationship children beyond the row's direct references. Keep those under an explicitly broader Related records section if shown. Likewise, ambiguous lookup candidates in `contributors` are not proof that their values supplied the map input. [R08]

Every record must be reachable. Reuse pagination/reveal-more behavior for stage rows and add it to the nested source table; retain a visible “first N of total” count. Exact value cells must support keyboard/touch expansion or copy for long strings, with quoted text, type, whitespace, and code points where needed. A hover tooltip alone is insufficient.

Existing Alt-click/Alt-Enter and chart-header trace routes remain the route from chart marks to rows. No per-mark Inspect buttons, persistent audit pane, or automatic chart creation is needed. [R01], [R08]

### 5.5 High cardinality and responsive access

- Build the category inventory once per input snapshot with a `Map<categoryKey, count>`. Count all rows; paginate the visible list. Search/filter/sort the inventory, not a sample.
- Default sorting can use descending count with canonical-key tie-breaking. Keep checked selections keyed by category identity across search and pages. **Select shown** affects the current visible page only and states its count; unseen search-result pages are not selected. Individual choices persist when paging or changing search.
- Avoid a feature cutoff at an arbitrary distinct-value count. Bound rendered rows, keep totals exact, and measure before introducing more infrastructure.
- All actions have visible text or accessible names. Space toggles a focused checkbox; Tab reaches target fields and Apply; Enter submits a valid target assignment; Escape cancels the innermost draft. Do not make drag-and-drop or modifier-click the only path.

| Width | Layout and acceptance expectation |
| --- | --- |
| **1280 px** | Existing Query panel can widen; the source-value table and compact target controls use its width, while some charts remain visible. Header actions stay fixed while rows scroll. |
| **783 px** | Query panel uses a bounded overlay/sheet; a single-column editor keeps label/control rows compact and puts optional detail in the Rows tab. The chart grid retains its existing responsive behavior. |
| **390 px** | Full-width temporary sheet, one main scroll container, fixed reachable Apply/Cancel, horizontally scrollable tabs and record table only where necessary. Type/source/target/count remain readable; no offscreen primary action. Touch can open exact-value detail and source records without hover or a modifier key. |

Follow the repository's 32/28-pixel control scale, semantic border tokens, shared field metadata, focus return, and nested-dismissal rules. Touch hit areas can extend around compact controls without making a dense row unreadable. The README's broad desktop-support statement does not substitute for the mission's required 1280/783/390 browser checks. [R01]

## 6. Editing, undo, removal, and effects on existing analysis

### 6.1 One authoritative mutation path

Use a small shared mapping edit helper to build a candidate project, validate its field dependencies and recipe, and commit through `ExplorEdaProject.onProjectChange({ project, view })`. The Query editor and later field/schema entry points call the same helper. Keep chart settings in their existing `onStateChange` path. [R09], [R12]

Preserve the current output field ID while changing entries, fallback, purpose, or label. The project query changes, so evaluation and downstream stages recompute. One Apply produces one definition change; typing a target produces none. Do not put an independent mutable copy of the recipe in field settings or notebook text.

### 6.2 Actual undo boundaries

**Demo:** `SavedViewsWorkspace.captureProject` already calls `pushCheckpoint(..., next.project)`. One Apply should therefore be one project history checkpoint. Test it; do not assume the chart-only callback captures a query edit. [R16]

**Folder app:** the inspected `ProjectWorkspace`, `App`, and `FolderSaver` provide state updates and delayed writes, not an implemented generic undo stack. The documentation's session-history sentence is not proof otherwise. [R14]

Provide a bounded **Undo mapping change** action in the mapping controller for the last committed add/edit/remove. Store its previous/expected step and necessary query-edge patch in session memory. Apply the inverse to the **current project**, not an old whole-project snapshot:

- For an edit, restore the prior recipe only if the same step still equals the expected committed step.
- For an addition, removal uses the dependency preflight; it cannot strand a later calculation/filter or a newly created chart.
- For a removal, reinsert only if the recorded query edges and output field remain compatible.
- Preserve unrelated chart/view edits. Consume or invalidate the undo token after use, conflicting edits, external reload, or changed query structure.
- Route the inverse through the same project callback and normal folder save. This is a reversible mapping edit, not persistent historical versioning.

An embedding host remains responsible for broader undo/redo and storage. No durable mapping revision history or collaboration mechanism is introduced.

### 6.3 Filter, selection, color, and view behavior

| Existing state | Behavior after a mapping revision |
| --- | --- |
| **Value filter on the mapped field** | Keep its field ID and typed values. It describes a category predicate, so its record membership recomputes. Renaming target North to Northern leaves an existing North filter with zero matches until edited/cleared; never silently retarget it. |
| **Exact row selection** | Keep the selected logical row keys. A selected R02 remains R02 when its mapped category changes. Decode against the new evaluation; unresolved keys stay unresolved instead of selecting the row now occupying their position. Existing stable-key limits still apply. [R17] |
| **Filter on the original field** | Leave it unchanged. A `records.value="north"` filter still refers to that original value and can distinguish rows inside mapped North. |
| **Chart-local, workspace, and Rows filters** | Preserve all owners independently; review may narrow its own rows without writing any of them. Existing row-key encoding handles each owner. [R17] |
| **Colors** | Preserve saved scales. Baseline categorical color lookup is keyed by `categoryLabel(value)`, not `categoryKey`. Existing target labels retain their assignment; new labels use the scale's existing overflow/ordinal behavior. Do not merge alias colors or arbitrarily choose one source color for a target. [R18] |
| **Saved views of the same query** | They see the new mapping when evaluated. Show the known affected view/notebook names before Apply. Their layouts, filters, labels, and chart settings stay intact. Independent query copies remain independent. |
| **Later query steps** | Reevaluate from the same stable output field ID. A downstream filter can change membership; an aggregate can change groups and contributor sets. The map itself still preserves its input rows. |
| **Transient inspection** | Clear/recompute row focus and count previews when evaluation inputs change. Do not reuse a previous recipe's affected-row list with the next recipe. |

Before Apply, identify known filters using the mapped field and show concrete membership/count effects where the current evaluation supports them. Do not promise that all saved views use the active view's bindings; views with other bindings recompute independently. Unknown embedding-host views cannot be enumerated without being supplied.

### 6.4 Removal and dependencies

For a candidate removal, rewire direct successors to the removed step's input, then run structural field validation for **all affected steps**, independent of row count. Check calculation dependencies through the existing parser; filter input fields; aggregate group, measure, and entity fields; lookup/expand input references; and other map inputs. Block removal with the named dependent step and field until the user edits/removes that dependency. [R07], [R12]

For view consumers, reuse `settingsFieldUsage`: charts and filters, facets, Rows columns/filters, workspace filters, aggregates, and calculation dependencies. Pass all known view descriptors into Query-panel removal, not only into the schema diagram. Include compiled notebook consumers in the folder host; `allViews` currently excludes them. [R14], [R19]

If query stages remain valid but saved views depend on the lost output, show their names and offer Cancel or a clearly named Remove action that leaves those settings retained and visibly unavailable. Never silently erase charts, change their fields, or reset their layouts. A malformed query must be unavailable, not a plausible empty result caused by reading a missing field.

## 7. Refresh, persistence, and implementation seams

### 7.1 Refresh contract

- **Previously unseen category:** apply its explicit rule if one exists; otherwise apply the declared fallback. New `"NORTH"` is not covered by approved `"North"`, `"north"`, and `"North "` entries.
- **New record with a known category:** map it immediately by category key. A new `"North "` record joins North even if the earlier record with that value disappeared.
- **Disappeared category:** retain the entry with zero current rows. Do not automatically prune it or change the target group.
- **Changed scalar type:** use the new typed key. Numeric `1` becoming text `"1"` stops matching the numeric rule. Field names alone cannot establish compatibility.
- **Removed input field:** invalidate the step; do not treat the absent field as missing data.
- **Empty but schema-valid input:** a valid map with zero rows and zero counts remains editable and reusable.
- **New schema column colliding with the output ID:** report the collision. Do not overwrite it or silently rename a stable output ID.

“Unmatched” is always computable from the current recipe. “New since the last refresh” needs a previous inventory. Keep that comparison session-local when the previous completed snapshot exists; after reload show unmatched values without claiming a historical newness baseline. No persisted observed-value ledger is necessary.

### 7.2 Stable membership and its limits

Mapping leaves each input result-row key unchanged. Ordinary unique typed source entity keys can therefore survive reordering, and the fixture deliberately uses independent string IDs. `analysisRowKeys` translates saved positional chart IDs into project row keys; `sourceRowIdentity` resolves source references. [R17]

This does not manufacture cross-refresh identity for keyless records, duplicate keys, or generated row numbers. Positional identity remains scoped to the current source arrangement. Clear transient mapping inspection on refresh and report unresolved/ambiguous references. Do not claim that a category map fixes selection identity or that a removed selected record is replaced by a new record with the same category.

### 7.3 Freshness guard and workers

Reuse the existing evaluator and worker. Extend the evaluation hook's **local state**, if needed, to retain the applied project, tables, query ID, and binding references alongside each completed evaluation. Compare those references with requested inputs before enabling mapping previews or resolving source records. Status alone can be briefly stale on the render before the worker effect starts a new request. [R10]

Capture the matching applied inputs, input step ID, and draft signature with a preview. Apply must recheck them. If they changed, retain the draft and require Refresh preview; do not silently rebase a reviewed count. While pending, the existing workspace may retain its last completed chart result under Updating, but mapping counts and source inspection must not pair those rows with the new recipe/tables.

This needs no new worker protocol, durable revision number, source snapshot database, or background service. Draft evaluation calls the same pure map helper; workers continue receiving the full project and immutable source arrays.

### 7.4 JSON and `.eda` persistence

**Project JSON:** add `map` to the step union, shape checks, and field-validation traversal in `projectFile.ts`. Entries are already JSON-safe. Preserve them through `stringifyAnalysisProject`, `parseAnalysisProject`, `selectAnalysisProjectView`, query copies, and demo checkpoints. Keep project/file version 1 under the stated single-deployed-version assumption; no coexistence/migration machinery is required. [R07], [R16]

**Negative zero qualification:** mapping preserves the original source field at runtime and never edits the source file. Existing project JSON can reload a raw -0 as +0. Those are already one category. This proposal does not claim bit-exact source-number archival or add a generic scalar codec to solve that separate limitation. Null/undefined and nonfinite source values use the existing project codec. [R07]

**Project text:** extend `lib/dsl/project.ts::compileStep`, `stepLines`, and `stepDefaultId`. The existing parser supports nested child declarations, so use a small map grammar rather than a transformation language. [R20]

Proposed text:

```text
query @records "Records" glyph=R {
  source records
  map @map-category category_group "Category group" on=records.value purpose=aliases otherwise=keep {
    entry source="North" target="North"
    entry source="north" target="North"
    entry source="North " target="North"
    entry source=1 target="Numeric one"
    entry source=NaN target="Invalid measurement"
  }
}
```

`from=stepId` on the map header follows the existing nonprevious-input convention. `on=` names the input field; the first positional value names the output field. `purpose` and `otherwise` have explicit defaults (`aliases`, `keep`) and can be omitted on export when defaulted. A typed constant `otherwise="Other"`, `otherwise=null`, `otherwise=false`, or `otherwise=2` selects the constant fallback; literal text `"keep"` is quoted and distinct from the `keep` mode.

Entry source grammar is deliberately mapping-specific:

- Double-quoted JSON string; finite JSON-number literal; `true`; `false`; `NaN`; `Infinity`; `-Infinity`; or `missing` for the null/undefined category.
- `source=missing` compiles to `["missing"]`. `source="missing"` is literal text. Export always writes the canonical missing-category token.
- Target grammar is a quoted JSON string, finite JSON number, boolean, or `null`.
- Export quotes **every string**, including `"001"`, `"true"`, `"NaN"`, empty strings, and strings containing spaces or punctuation. Do not accept bare arbitrary text, radix numbers, or ambiguous leading-zero numeric tokens; ask for quotes.
- Parse quoted raw pair values with `JSON.parse` and require one scalar token. Do not reuse `project.ts::scalar` unchanged: it treats special-number text as strings and accepts numeric spellings inappropriate for exact category entry. Generic `parse.ts` decoding also lacks some JSON control escapes, so using the raw token is necessary. [R20]

Compile literals into canonical source keys. Export keys back through a validated representative scalar solely for readable text; do not persist a redundant `from` value. Duplicate/malformed entries produce a query-level error with the entry's location. The folder read must not execute a partial query after silently skipping an invalid map declaration; block that load/query and retain a previous verified view only when the host actually has one.

### 7.5 Folder app: necessary, concrete changes

Three facts found by reading the pinned implementation must be included in milestone one. [R14], [R21]

1. **Persist edited implicit queries.** `projectFileText` currently filters every ID in `folder.implicitQueries`. Omit only a query that still equals its loaded, unmodified source-only definition. Once a mapping is appended, write that query explicitly.
2. **Establish a project destination.** When `folder.projectPath` is absent, use the existing visible/hidden project-path conventions and create the canonical project text before reporting the map saved. Include source declarations/paths needed by newly explicit queries, even when those sources originated inside analysis files. Project definitions already win source-ID conflicts; no data file must move.
3. **Respect write ordering and status.** The current saver queues files after one second and `flush` uses parallel writes. Do not claim an atomic multi-file transaction. For first project creation, use an awaited prerequisite project write before dependent analysis changes. Ordinary map edits generally change only project text. Report a save failure and retain the unsaved recipe for retry; do not show Saved merely because local state updated.

Use one folder serialization path. The map editor never writes files directly. External file reload invalidates the editor's preview and local undo token, so a stale local recipe cannot overwrite an externally revised step.

### 7.6 Notebooks and sheets

Keep mapping in the project query. A notebook's `eda query=records` consumes `category_group` like another field. No map declaration is added to fenced dashboard text; no registry is introduced in `SavedDataStructure`, `compileNotebook`, or `sheets`.

The folder host must evaluate the selected notebook against its **current** project and tables, rather than `notebook.result.rows` captured on folder load. Reuse `readNotebookText`, retaining the notebook's existing last-valid block text behavior. A mapping edited in a dashboard must be visible when switching to the notebook before reloading the page. [R11], [R14]

All sheets read the same mapped query. Notebook chart selections remain chart-local under the existing notebook contract; this feature does not introduce dashboard-style linked filtering across notebook blocks. Include notebook query/settings dependencies in removal-impact reporting and keep prose/layout untouched.

## 8. Suggestions: useful second milestone, no automatic equality

### 8.1 What ships first

Manual category selection, exact source search, typed targets, counts, and exact records are sufficient to resolve the stated North example. Ship them as the complete first release. Suggestions are a convenience built on the same review surface, not a prerequisite for creating a map.

### 8.2 Deterministic suggestions to build next

Offer explicit candidate modes **Trim edges**, **Ignore letter case**, and **Trim + ignore case**. They compare present string categories only:

```ts
const trimKey = (text: string) => text.trim();
const lowerKey = (text: string) => text.toLowerCase();
const trimLowerKey = (text: string) => text.trim().toLowerCase();
```

These functions generate candidate groups; they do not evaluate the saved map. `trim` uses ECMAScript's defined whitespace/line-terminator set. `toLowerCase` uses locale-insensitive Unicode default lowercasing; call it lowercasing, not full case folding. No locale setting, accent removal, Unicode normalization, punctuation removal, internal-space collapse, or token reordering occurs in these modes. [S10]

Show each candidate's exact members, types, full-input counts, and proposed target. Nothing is preaccepted. The author can select/deselect members, change the target, reject a proposal, and review the same Rows tab. Accepting proposals adds ordinary explicit entries to the draft; Apply remains the single commit.

Do not overwrite an existing approved entry through a proposal. Mark such members as already assigned and require an explicit move. Candidate grouping must include all input-stage values, with full counts; any performance-driven candidate restriction would have to be visible. A future refresh containing a newly spelled alias stays unmatched until that spelling is explicitly approved.

### 8.3 Domain-sensitive cases and later exploration

- `"US"` and `"us"` can be different codes/words; case similarity is a review hint.
- `"001"`, `"1"`, and numeric `1` are separate categories. No suggestion parses codes as numbers.
- `"North-East"` and `"North East"` can be legitimate distinct labels. Trim/lowercase does not combine them.
- Latin `"ACME"` and `"\u0410CME"` with a Cyrillic first letter remain distinct. Offer exact character detail; do not replace lookalikes.
- Composed `"é"` and decomposed `"e\u0301"` remain distinct unless explicitly mapped. Canonical Unicode normalization may be worth a separately named reviewed prototype, but is not hidden inside the first suggestion modes.
- Unicode compatibility normalization can erase meaningful distinctions, and confusable skeletons are unsuitable as identifier normalization. These facts support explicit review, not a new automatic cleanup stage. [S11], [S12]

**Explore** fuzzy candidate ranking only after the manual and deterministic review surfaces work. A prototype can compare edit distance or another named algorithm on the adversarial fixture and a realistic high-cardinality sample. Report missed useful proposals, false candidate pairs, review workload, and latency. It must never save an unreviewed merge or use a score as entity identity. No participant findings are claimed here, and no outside participant is a demand gate.

**Avoid** automatic fuzzy merges, punctuation/diacritic stripping as implicit identity, LLM-generated source corrections, and silent preparation of join keys. Those change the trust boundary beyond category grouping.

## 9. Exact fixtures and acceptance contract

### F01 — Mixed categories, complete manual recipe

Use a source named `records` with entity key `id`. Each record has its independent string ID below and a scalar `value`. The map input is `records.value`; the new field is `category_group`. At the source stage, each result-row key is `records:string:Rxx`. Add a separate odd/even cohort field for the linked-filter exercise; it does not participate in mapping.

The fixture must be authored in TypeScript/JavaScript so that undefined, NaN, infinities, and negative zero exist at runtime. An ordinary CSV or naïvely stringified JSON file cannot represent all those distinctions faithfully. Appendix D provides the complete executable research oracle.

**Ten entries:** North→North, north→North, "North "→North, number 1→"Numeric one", boolean true→"Enabled", empty text→"Empty label", numeric NaN→"Invalid measurement", numeric zero→"Zero", West→West, and W.→West. Their source keys use `categoryKey` exactly. All targets in this fixture are text. Keep category is the fallback.

| Row / original typed value | Derived category | Match outcome |
| --- | --- | --- |
| R01 · text `"North"` | text `"North"` | Mapped, unchanged |
| R02 · text `"north"` | text `"North"` | Mapped, changed |
| R03 · text `"North "` | text `"North"` | Mapped, changed |
| R04 · text `"North-East"` | text `"North-East"` | Unmatched, unchanged |
| R05 · text `"North East"` | text `"North East"` | Unmatched, unchanged |
| R06 · number `1` | text `"Numeric one"` | Mapped, changed |
| R07 · text `"1"` | text `"1"` | Unmatched, unchanged |
| R08 · boolean `true` | text `"Enabled"` | Mapped, changed |
| R09 · text `"true"` | text `"true"` | Unmatched, unchanged |
| R10 · `null` | `null` | Unmatched, same missing category |
| R11 · `undefined` | `null` | Unmatched, same missing category |
| R12 · empty text `""` | text `"Empty label"` | Mapped, changed |
| R13 · one-space text `" "` | text `" "` | Unmatched, unchanged |
| R14 · text `"(missing)"` | text `"(missing)"` | Unmatched, unchanged |
| R15 · numeric `NaN` | text `"Invalid measurement"` | Mapped, changed |
| R16 · text `"NaN"` | text `"NaN"` | Unmatched, unchanged |
| R17 · numeric `Infinity` | numeric `Infinity` | Unmatched, unchanged |
| R18 · numeric `-Infinity` | numeric `-Infinity` | Unmatched, unchanged |
| R19 · numeric `-0` | text `"Zero"` | Mapped, changed |
| R20 · numeric `0` | text `"Zero"` | Mapped, changed |
| R21 · text `"001"` | text `"001"` | Unmatched, unchanged |
| R22 · text `"ACME"`, Latin A | same exact text | Unmatched, unchanged |
| R23 · text `"\u0410CME"`, Cyrillic А | same exact text | Unmatched, unchanged |
| R24 · text `"\u00e9"`, composed é | same exact text | Unmatched, unchanged |
| R25 · text `"e\u0301"`, decomposed é | same exact text | Unmatched, unchanged |
| R26 · text `"West"` | text `"West"` | Mapped, unchanged |
| R27 · text `"W."` | text `"West"` | Mapped, changed |
| R28 · text `"East"` | text `"East"` | Unmatched, unchanged |

**Exact totals and memberships:**

- **28 input rows; 28 output rows; 26 original category keys; 23 output category keys.**
- **11 mapped rows:** R01, R02, R03, R06, R08, R12, R15, R19, R20, R26, R27.
- **9 changed rows:** R02, R03, R06, R08, R12, R15, R19, R20, R27. All nine are explicitly mapped in this fixture.
- **2 mapped but unchanged rows:** R01 and R26. **19 unchanged rows overall:** these two plus the 17 unmatched rows.
- **17 unmatched rows:** R04, R05, R07, R09, R10, R11, R13, R14, R16, R17, R18, R21, R22, R23, R24, R25, R28.
- **2 missing-category inputs:** R10 and R11. **2 blank-text inputs:** R12 and R13, in two different source categories.
- Output North = **R01, R02, R03 (3)**. Output West = **R26, R27 (2)**. Output Zero = **R19, R20 (2)**. Output missing = **R10, R11 (2)**. Every other output category has one row.
- A downstream count aggregate by `category_group` has **23 groups**, counts sum to **28**, and the missing group carries exactly source references `records:string:R10` and `records:string:R11`.
- Original R11 stays undefined; only its derived output is null. Original R19 stays negative zero in memory. No input field, row key, source reference, or source-file byte is rewritten.

The 26→23 category reduction is fully accounted for: the three North spellings become one category (−2), and West/W. become one (−1). Null/undefined and the two signs of zero were already shared categories before the map.

### F02 — Linked scope and exact records

Select the odd-ID cohort in a linked chart. It contains **14 visible rows** and **2 visible North rows**, R01 and R03. Open mapping review: it still has **28 input rows** and all **3 North members**, including currently hidden R02.

Selecting Changed in the review yields exactly the nine IDs above. Selecting Missing input yields R10/R11 even though the original and mapped cells differ in representation. Search for a particular spelling must not change chart filters or committed recipe scope.

Add a separate inspection case with **40 source records**, IDs P01–P40, each category A. Aggregate them into one result row, then map A→Group A. Mapping preview shows **1 input/output group**, and its source inspection exposes **40 exact records**, including P40 through Show more/pagination. Related child records, if present, do not increase that exact-source count. This protects against the current nested table's 25-record cap. The 40-record case is a proposed product test, not an executed mounted test.

### F03 — Refresh without rewriting the recipe

Starting from F01:

1. Remove R03.
2. Change R06 from numeric `1` to text `"1"`, retaining its entity ID.
3. Add R29 with text `"NORTH"` and R30 with text `"North "`.
4. Reverse source order; do not change the ten entries.

Expected results:

| Check | Exact expectation |
| --- | --- |
| Size and categories | **29 rows; 26 original categories; 23 output categories** |
| Match counts | **10 mapped; 8 changed; 2 mapped unchanged; 19 unmatched; 21 unchanged overall** |
| North | R01, R02, R30; count **3** |
| Text "1" | R06 and R07; count **2**; both unmatched |
| New spelling | R29 stays `"NORTH"`; unmatched |
| Dormant rule | Numeric 1→Numeric one remains in the recipe with **0 current records** |
| Row identity | R06 retains `records:string:R06`; R03 is unresolved/absent, never replaced by R30 |
| Missing | R10/R11 remain one output missing category with count **2** |

Stable membership assertions use the independent ID, never source order or category equality. A refresh during a draft invalidates its preview even if the recipe itself did not change.

### F04 — Fallbacks, typed targets, and one-pass rules

| Variant | Exact expectation |
| --- | --- |
| F01 with constant text Other fallback | **17** rows become Other, including R10/R11; all ten explicit entries still win |
| Same plus explicit missing→null entry | **15** Other rows; R10/R11 remain missing; **13** rows match an explicit entry |
| F01 with null fallback | **17** output-missing rows; none are removed |
| Explicit missing→Unspecified with Keep | R10 and R11 both become text Unspecified |
| Four input values `[1,"1",true,"true"]` mapped to `[2,"2",false,"false"]` | **4** different output category keys |
| Chain `A→B, B→C` on `[A,B,C]` | `[B,C,C]`; two matched rows; three retained rows |
| Cycle `A→B, B→A` on `[A,B]` | `[B,A]`; terminates in one pass |
| Empty entries and Keep | Every output is `categoryValue(input)`; original fields unchanged; no excluded rows |
| Unmatched original North plus rule north→North | Both rows are in the North target count; explicit-entry count is only one |

Changed means a category-key change, whether caused by an entry or a constant fallback. Thus **Changed is not a subset of Mapped in every recipe**. The separate audit selectors must support unmatched-and-changed rows.

### F05 — Invalid drafts and structural dependencies

Reject duplicate canonical source keys before any callback, including null versus undefined, −0 versus +0, and repeated entries with identical targets. The UI may offer an explicit Move to target action, but must not silently take the last duplicate.

Reject malformed/noncanonical keys, nonfinite/undefined targets or fallbacks, absent input fields, output-ID collisions, and invalid purpose/fallback discriminants. An empty input table does not excuse an invalid field reference. Show a useful error, retain the draft, and leave the committed result intact.

For dependency removal, construct:

~~~text
source → map category_group → filter category_group equals "North"
~~~

The filter has **3 rows** on F01. Attempting to remove the map must be blocked with the dependent filter named, with **zero project mutations**, both with the 28 rows present and with an empty source table carrying the same schema. Repeat the structural assertion for a calculation referring to `category_group`, an aggregate grouping by it, and a second map that reads it.

For a view-only dependency, removal can be confirmed after naming the affected view; its chart/filter settings remain stored and become visibly unavailable. With a notebook consumer, the same impact preview must name the notebook. Do not silently remove its prose, block, sheet, or chart field selection.

### F06 — Revision, undo, and consumer state

Change the three North targets to Northern without changing the output field ID:

- An existing typed output filter for North has **0** matches. An output filter for Northern has **3**.
- An exact selection of R02 still identifies R02. An original-field filter for `"north"` still identifies R02.
- Undo restores the North category with **3** members through the same callback, without resetting an unrelated chart layout edit.
- Cancel a conflicting draft: **0** project-change callbacks. Apply a valid draft: **1**. Undo the committed change: **1** additional callback.
- Rename only the field label: every field reference and count is unchanged.
- Existing saved color assignments are retained; the test should assert preserved scale data and ordinary handling of a new label, not a handpicked inherited alias color.

A conflicting external step replacement disables the stale undo action and stale draft Apply. Undoing creation must run dependency checks against consumers added since the map was created.

### F07 — Round trips and invalid text

Two levels of round trip must be distinguished:

1. **Executed research check:** JSON stringify/parse of the proposed entry objects retains canonical key strings, typed targets, and special source-key identities; reapplying the restored entries reproduces F01.
2. **Proposed product checks:** `stringifyAnalysisProject → parseAnalysisProject`, view-closure export/import, query copy, demo history, and `exportProjectText → compileProjectText` preserve the recipe and reevaluated output.

Product checks cover quotes, backslashes, commas, equals signs, braces, tabs, newlines, backspace/form-feed/control escapes, empty text, `"001"`, typed booleans/numbers, numeric NaN/infinities as source keys, the canonical `missing` source token, missing targets, and literal `otherwise="keep"`. Numeric -0 input can reload as +0 through existing project JSON without changing category membership; do not assert bit-exact preservation that the baseline codec does not supply.

An invalid `entry` must fail the map/query rather than leave a partial recipe. Duplicate entry source keys, invalid output IDs, and removed input fields must not quietly produce plausible source-only results on folder reload.

### F08 — High-cardinality profiling

A useful deterministic workload is **100,000 rows**, independent string IDs, and **10,000 distinct text categories** `C0000`–`C9999` repeated ten times each. Map the first 100 categories to text `Grouped`.

Expected counts are **100,000 input/output rows**, **1,000 mapped and changed rows**, **99,000 unmatched and unchanged rows**, and **9,901 output categories**. These are profiling data, not a capacity limit or a promised device-independent response time.

Measure inventory build, draft preview, Apply/evaluation, search, DOM row count, and time to reachable exact records on the actual development machine. Report the source size, browser/device, timings, and whether the main thread blocks interaction. Reuse the existing worker and bound rendered rows first; introduce more infrastructure only if measured work requires it. No performance measurement was executed in this Design run.

### F09 — Runnable folder persistence fixture

The folder example should use ordinary file-representable values rather than pretending that CSV carries F01's JavaScript-only scalars. Use five records: F01 `"North"`, F02 `"north"`, F03 `"North "`, F04 `"South"`, and F05 null, each with its own string entity ID. A JSON source is appropriate for that subset.

With the three North entries and Keep, expect **5 rows**, **3 output categories**, **3 North records**, **1 South record**, **1 missing record**, **3 mapped**, **2 changed**, and **2 unmatched**. Start once from an implicit source-only query and once from analysis-local sources with no project text. Save, restart the folder app, and verify the same counts and unchanged original values. Cover both existing visible and hidden project layouts. Add a notebook with two sheets using the same query; editing North→Northern in the dashboard must update both sheets before a page reload.

F09 is a proposed runnable example and persistence test; no folder was edited or opened in a browser during this research.

## 10. Recommendations and dispositions

| ID / disposition | Recommendation | Reason |
| --- | --- | --- |
| **CM01 · Build** | Add one explicit row-preserving `map` query operation. | It gives aliases an inspectable recipe and a reusable field with little evaluator complexity. |
| **CM02 · Build** | Ship in project hosts, including one-source projects, demo, and folder app. | One ownership model supplies a complete first feature without duplicating workspace state. |
| **CM03 · Build** | Save canonical typed source-key strings and finite scalar/null targets inline. | Existing category identity and JSON-safe history stay aligned. |
| **CM04 · Build** | Specify one-pass rules, canonical missing output, exact targets, and explicit fallback. | Hidden coercion and order-dependent replacement would undermine trustworthy grouping. |
| **CM05 · Build** | Put the complete manual editor in Query with Apply, Cancel, edit, and removal. | The operation remains discoverable without another permanent panel. |
| **CM06 · Build** | Provide full-input counts and exact affected records, with all source rows reachable. | Review is meaningful only when every changed or unmatched record can be inspected. |
| **CM07 · Build** | Carry a derived categorical hint into field metadata and profiles. | Typed numeric outputs must remain analytical categories instead of becoming measures accidentally. |
| **CM08 · Build** | Share structural field validation and enumerate known view/notebook consumers. | Removal must be safe even with no rows and must preserve stored user analysis. |
| **CM09 · Build** | Use the project callback, bounded guarded undo, and explicit consumer-state rules. | Revision should preserve selections, filters, colors, layouts, and unrelated edits predictably. |
| **CM10 · Build** | Recompute on refresh with stable row keys and a local freshness guard. | Stale counts or source references must never be presented as the current review. |
| **CM11 · Build** | Complete JSON, query-copy/closure, history, and strict `.eda` round trips in M1. | A mapping is reusable only when its exact semantics survive saving and reopening. |
| **CM12 · Build** | Fix implicit-query persistence, first project destination, and current notebook evaluation. | The inspected folder host otherwise loses or fails to display the first mapping. |
| **CM13 · Build** | Include documentation, a runnable project example, and targeted evidence in every feature milestone. | The feature must be understandable and reviewable when each milestone ships. |
| **CM14 · Build** | Add reviewed trim/lowercase candidate groups in M2. | Deterministic assistance reduces repetitive selection while explicit entries remain authoritative. |
| **CM15 · Explore** | Prototype fuzzy ranking and separately named Unicode-normalization proposals after M2. | Useful candidates are possible, but false associations and review cost need measured evidence. |
| **CM16 · Defer** | Automatic promotion UI for arbitrary standalone workspaces. | Existing one-source project support is sufficient; embedding hosts own conversion and persistence. |
| **CM17 · Defer** | Shared mapping objects and externally maintained lookup maps. | Cross-query propagation and table ownership add lifecycle questions the present demand does not require. |
| **CM18 · Defer** | A formula-based map authoring surface. | It duplicates rule review and ownership before demonstrating a distinct benefit. |
| **CM19 · Avoid** | Automatic source correction, unreviewed fuzzy merging, entity resolution, or silent join-key preparation. | Category resemblance is not permission to rewrite source truth or establish identity. |
| **CM20 · Avoid** | Global category-key changes, arbitrary capacity cutoffs, version coexistence, or a generic preparation platform. | These enlarge risk and maintenance without supplying the bounded feature. |

## 11. Confidence, checks, and unresolved choices

### What was checked in this Design run

- The complete attached prompt and every complete packet file were read, not just the reading-route headings.
- Additional decisive implementation files were fetched and inspected at the pinned commit. The plan's host, serializer, worker, and dependency changes reflect those implementations.
- Current official sources were read for the comparison products and for ECMAScript/Unicode behavior. Direct URLs and the specific claim supported by each appear in Appendix C.
- The independent oracle in Appendix D was executed successfully with Node. It checks F01, F03, fallback variants, typed identity and targets, chains/cycles, linked-scope arithmetic, downstream grouping arithmetic, duplicate/malformed keys, and JSON-safe entries.
- The report and plan underwent separate semantic and primary-source review. This is analytical review, not participant validation.

### What remains proposed

The new step, UI, saved shape, categorical hint, strict mapping text grammar, dependency refactoring, folder fixes, notebook reevaluation, and all product integration tests remain proposed. No explorEDA source was modified; no product test suite, mounted UI test, browser run, folder save/reload, screenshot, or performance benchmark was executed. No repository branch, commit, push, review PR, merge, or deployment was created.

The oracle intentionally models scalar mapping and selected baseline grouping behavior independently. It does not prove actual React callback counts, worker races, parser implementation, source-reference preservation, folder write ordering, or chart selection behavior. Those have concrete acceptance checks in the implementation plan.

### Remaining choices and limits

There is **no unresolved product decision blocking M1**: the host boundary, recipe owner, target types, fallback, missing policy, one-pass semantics, authoring scope, undo owner, persistence form, and first release are all selected.

Worker implementation still needs to confirm the smallest categorical-hint plumbing and local evaluation-state representation against the then-current checkout. Those are implementation choices within the contract, not requests to redesign it. Profile-based tuning, exact responsive spacing, and how many rows are initially rendered are also implementation decisions; totals and record reachability cannot depend on them.

Locale-sensitive matching, NFC/NFKC candidate modes, fuzzy algorithms, a shared map registry, and automatic standalone promotion remain deliberate later choices. Any future change must preserve explicit review, original fields, exact typed keys, and independent query ownership unless Byron chooses a different feature boundary.

The Design is pinned to the supplied baseline. The implementation worker must compare these decisive seams with current code before integrating, especially if other research branches have landed. PRs #518–#521 remain future integration possibilities, not dependencies or evidence of available helpers.



## Appendix A. Complete supplied-file reading inventory

All 34 files below were read in full. Line counts describe the extracted complete file text, excluding packet separators. This is an access/read inventory, not a claim that their tests were executed.

| # | Complete baseline file | Lines |
| --- | --- | --- |
| 01 | [AGENTS.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/AGENTS.md) | 40 |
| 02 | [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/CODING_STANDARDS.md) | 29 |
| 03 | [README.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/README.md) | 223 |
| 04 | [apps/demo/src/docs/pages/calculated-fields.mdx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/pages/calculated-fields.mdx) | 19 |
| 05 | [apps/demo/src/docs/pages/fields.mdx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/pages/fields.mdx) | 23 |
| 06 | [apps/demo/src/docs/pages/notebooks.mdx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/pages/notebooks.mdx) | 104 |
| 07 | [apps/demo/src/docs/pages/project-folders.mdx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/pages/project-folders.mdx) | 127 |
| 08 | [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/agent-guide.md) | 156 |
| 09 | [docs/intent/research-ideas-100/ideas/R038-category-normalization.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/intent/research-ideas-100/ideas/R038-category-normalization.md) | 28 |
| 10 | [docs/research/DIRECTION.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/research/DIRECTION.md) | 66 |
| 11 | [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/ui-defaults.md) | 140 |
| 12 | [package.json](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/package.json) | 34 |
| 13 | [packages/explorEDA/src/components/ExplorEdaProject.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/ExplorEdaProject.tsx) | 490 |
| 14 | [packages/explorEDA/src/components/project/ProjectQueryPanel.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx) | 320 |
| 15 | [packages/explorEDA/src/components/project/QueryFlow.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryFlow.tsx) | 271 |
| 16 | [packages/explorEDA/src/components/project/QueryStageRows.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryStageRows.tsx) | 395 |
| 17 | [packages/explorEDA/src/components/project/queryEditing.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/queryEditing.ts) | 229 |
| 18 | [packages/explorEDA/src/components/project/stepEditing.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/stepEditing.ts) | 417 |
| 19 | [packages/explorEDA/src/lib/analysis/evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/evaluateProject.ts) | 931 |
| 20 | [packages/explorEDA/src/lib/analysis/projectFile.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/projectFile.ts) | 588 |
| 21 | [packages/explorEDA/src/lib/analysis/sources.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/sources.ts) | 262 |
| 22 | [packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts) | 191 |
| 23 | [packages/explorEDA/src/lib/calculations/functions/registry.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/calculations/functions/registry.ts) | 120 |
| 24 | [packages/explorEDA/src/lib/categories.test.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/categories.test.tsx) | 644 |
| 25 | [packages/explorEDA/src/lib/categories.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/categories.ts) | 67 |
| 26 | [packages/explorEDA/src/lib/fieldSettings.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/fieldSettings.test.ts) | 160 |
| 27 | [packages/explorEDA/src/lib/fieldSettings.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/fieldSettings.ts) | 396 |
| 28 | [packages/explorEDA/src/lib/notebook/compileNotebook.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/compileNotebook.ts) | 343 |
| 29 | [packages/explorEDA/src/lib/notebook/sheets.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/sheets.ts) | 127 |
| 30 | [packages/explorEDA/src/lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/valueParsing.ts) | 307 |
| 31 | [packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts) | 434 |
| 32 | [packages/explorEDA/src/test/lib/analysis/selectionIdentity.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/selectionIdentity.test.ts) | 243 |
| 33 | [packages/explorEDA/src/types/AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts) | 225 |
| 34 | [packages/explorEDA/src/types/SavedDataStructure.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/SavedDataStructure.ts) | 64 |

The attached mission `pro-prompt(20261024-192630).md` and the complete `source-packet(20261024-192630).txt` were also read. The packet’s 8,319 lines include file labels/separators. This report does not use the obsolete demand condition in R038 to defer the requested work.


## Appendix B. Repository evidence and supplemental reads

All links below are pinned to `95832bd473884aeae23453af0888b4ca5187820d`. Identifiers R01–R21 identify the relevant symbols and file groups; inline links point to the principal file for that group.

| Evidence | Decisive current behavior and symbols | Files |
| --- | --- | --- |
| **R01** | Working rules, React/pnpm, UI scale, nested dismissal, docs/demo gates and verification commands | [AGENTS.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/AGENTS.md); [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/agent-guide.md); [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/ui-defaults.md); [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/CODING_STANDARDS.md); [README.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/README.md); [package.json](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/package.json) |
| **R02** | Feature design direction supersedes old catalogue demand/deferral language | [docs/research/DIRECTION.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/research/DIRECTION.md); [docs/intent/research-ideas-100/ideas/R038-category-normalization.md](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/intent/research-ideas-100/ideas/R038-category-normalization.md) |
| **R03** | categoryKey, categoryValue, categoryEqual, categoryLabel and typed-category regression assertions | [packages/explorEDA/src/lib/categories.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/categories.ts); [packages/explorEDA/src/lib/categories.test.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/categories.test.tsx) |
| **R04** | getFieldLabel, convertFieldValue, isMissingValue, field settings and existing conversion semantics | [packages/explorEDA/src/lib/fieldSettings.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/fieldSettings.ts); [packages/explorEDA/src/lib/fieldSettings.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/fieldSettings.test.ts); [packages/explorEDA/src/lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/valueParsing.ts) |
| **R05** | AnalysisStep, AnalysisField, AnalysisResultRow, source-reference and stage structures | [packages/explorEDA/src/types/AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts) |
| **R06** | evaluateAnalysisQuery, calculateFrame, filterFrame, aggregateFrame, lookup/expand evaluation and source keys | [packages/explorEDA/src/lib/analysis/evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/evaluateProject.ts); [packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts) |
| **R07** | fieldsAt, parseAnalysisProject, stringifyAnalysisProject, selectAnalysisProjectView and source scalar codec | [packages/explorEDA/src/lib/analysis/projectFile.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/projectFile.ts) |
| **R08** | QueryFlow, QueryStageRows, Cell, relatedRecords, source-table row cap and stage review | [packages/explorEDA/src/components/project/QueryFlow.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryFlow.tsx); [packages/explorEDA/src/components/project/QueryStageRows.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryStageRows.tsx) |
| **R09** | ExplorEdaProject update/callback boundary, declared/rendered settings, Query panel integration | [packages/explorEDA/src/components/ExplorEdaProject.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/ExplorEdaProject.tsx); [packages/explorEDA/src/components/project/ProjectQueryPanel.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx) |
| **R10** | useAnalysisEvaluation, current/applied worker result handling, full-project request protocol | [packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts); [packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts); [packages/explorEDA/src/lib/analysis/analysisWorker.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/analysisWorker.ts); [packages/explorEDA/src/lib/analysis/createAnalysisWorker.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/createAnalysisWorker.ts); [packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx) |
| **R11** | Shared notebook sheets/compilation and readNotebookText project query consumption | [packages/explorEDA/src/lib/notebook/sheets.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/sheets.ts); [packages/explorEDA/src/lib/notebook/compileNotebook.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/compileNotebook.ts); [packages/explorEDA/src/lib/notebook/readNotebook.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/readNotebook.ts) |
| **R12** | appendSteps, replaceStep, removeStep, queryFields, copyQuery, queryForStage, stepTitle/stepDetail and schema editor | [packages/explorEDA/src/components/project/stepEditing.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/stepEditing.ts); [packages/explorEDA/src/components/project/queryEditing.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/queryEditing.ts); [packages/explorEDA/src/components/schema/SchemaStepEditors.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/schema/SchemaStepEditors.tsx) |
| **R13** | singleTableProject and source/query/view normalization | [packages/explorEDA/src/lib/analysis/sources.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/sources.ts) |
| **R14** | ProjectWorkspace project updates, notebook result rows/allViews, App reload and FolderSaver queue/flush | [apps/app/src/ProjectWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/ProjectWorkspace.tsx); [apps/app/src/App.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/App.tsx); [apps/app/src/saver.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/saver.ts); [apps/app/src/projectActions.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/projectActions.ts) |
| **R15** | Row-local calculation registry and scalar function contract | [packages/explorEDA/src/lib/calculations/functions/registry.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/calculations/functions/registry.ts) |
| **R16** | SavedViewsWorkspace.captureProject and savedViewsHistory.pushCheckpoint/JSON clone | [apps/demo/src/SavedViewsWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/SavedViewsWorkspace.tsx); [apps/demo/src/savedViewsHistory.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/savedViewsHistory.ts) |
| **R17** | Logical analysis-row encoding, source-row resolution and stable-selection assertions | [packages/explorEDA/src/components/project/analysisRowKeys.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/analysisRowKeys.ts); [packages/explorEDA/src/components/project/sourceRowIdentity.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/sourceRowIdentity.ts); [packages/explorEDA/src/test/lib/analysis/selectionIdentity.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/selectionIdentity.test.ts); [packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts) |
| **R18** | makeCategoricalColor and saved categorical color mapping type | [packages/explorEDA/src/lib/colorScaleMath.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/colorScaleMath.ts); [packages/explorEDA/src/types/ColorScaleTypes.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/ColorScaleTypes.ts); [packages/explorEDA/src/types/SavedDataTypes.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/SavedDataTypes.ts) |
| **R19** | settingsFieldUsage and unavailable saved settings | [packages/explorEDA/src/components/project/settingsCompatibility.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/settingsCompatibility.ts) |
| **R20** | compileProjectText/compileStep, exportProjectText/stepLines, stepDefaultId, scalar and parse raw tokens | [packages/explorEDA/src/lib/dsl/project.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/project.ts); [packages/explorEDA/src/lib/dsl/parse.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/parse.ts); [packages/explorEDA/src/lib/dsl/paths.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/paths.ts) |
| **R21** | readProjectFolder, implicitQueries/source precedence, projectFileText and folder serialization | [packages/explorEDA/src/lib/project/folder.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/folder.ts); [packages/explorEDA/src/lib/project/writeFolder.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/writeFolder.ts) |

### Complete supplemental-file inventory

These 32 files were fetched from connected GitHub at the same baseline and inspected to resolve decisive integration details. They supplement the 34 packet files; they are not a claim of a full-repository checkout.

| Supplemental file | Reason for inspection |
| --- | --- |
| [apps/app/src/App.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/App.tsx) | External reload boundary |
| [apps/app/src/ProjectWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/ProjectWorkspace.tsx) | Project callback, save destination, notebooks and known views |
| [apps/app/src/httpFiles.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/httpFiles.ts) | Folder file transfer/write surface |
| [apps/app/src/projectActions.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/projectActions.ts) | Canonical project path and creation conventions |
| [apps/app/src/saver.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/saver.ts) | Queued writes, flush and failure boundary |
| [apps/demo/src/SavedViewsWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/SavedViewsWorkspace.tsx) | Demo project commit/history integration |
| [apps/demo/src/demos/examples.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/demos/examples.ts) | Project-capable demo host versus CSV-only documentation live host |
| [apps/demo/src/docs/catalogue.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/catalogue.ts) | Documentation registration |
| [apps/demo/src/docs/live/examples.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/docs/live/examples.ts) | Project-capable demo host versus CSV-only documentation live host |
| [apps/demo/src/savedViewsHistory.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/savedViewsHistory.ts) | JSON cloning and checkpoints |
| [packages/explorEDA/src/components/project/QueryRelationshipBuilder.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryRelationshipBuilder.tsx) | Actual relationship-only authoring surface |
| [packages/explorEDA/src/components/project/analysisRowKeys.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/analysisRowKeys.ts) | Row-key encoding and view selection restoration |
| [packages/explorEDA/src/components/project/settingsCompatibility.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/settingsCompatibility.ts) | Saved settings field usage and compatibility |
| [packages/explorEDA/src/components/project/sourceRowIdentity.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/sourceRowIdentity.ts) | Exact source reference lookup |
| [packages/explorEDA/src/components/schema/SchemaStepEditors.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/schema/SchemaStepEditors.tsx) | Shared add/edit/remove surface |
| [packages/explorEDA/src/components/schema/schemaEditing.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/schema/schemaEditing.ts) | Shared project callback, known-view input, and read-only editing contract |
| [packages/explorEDA/src/lib/analysis/analysisWorker.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/analysisWorker.ts) | Worker evaluator dispatch |
| [packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts) | Request/result shape |
| [packages/explorEDA/src/lib/analysis/createAnalysisWorker.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/createAnalysisWorker.ts) | Existing worker construction |
| [packages/explorEDA/src/lib/colorScaleMath.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/colorScaleMath.ts) | Actual categorical assignment lookup |
| [packages/explorEDA/src/lib/dsl/parse.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/parse.ts) | Raw tokens and quoted-text parsing |
| [packages/explorEDA/src/lib/dsl/paths.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/paths.ts) | Text/project path conventions |
| [packages/explorEDA/src/lib/dsl/project.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/project.ts) | Query text compiler/exporter |
| [packages/explorEDA/src/lib/notebook/index.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/index.ts) | Notebook public entrypoints |
| [packages/explorEDA/src/lib/notebook/readNotebook.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/readNotebook.ts) | Current-project query evaluation |
| [packages/explorEDA/src/lib/project/folder.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/folder.ts) | Folder load, implicit queries and source precedence |
| [packages/explorEDA/src/lib/project/writeFolder.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/writeFolder.ts) | Project text persistence and implicit query omission |
| [packages/explorEDA/src/lib/schema/schemaGraph.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/schema/schemaGraph.ts) | Step-kind and field-lineage handling |
| [packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts) | Source identity edge-case intentions |
| [packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx) | Async evaluation test coverage intentions |
| [packages/explorEDA/src/types/ColorScaleTypes.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/ColorScaleTypes.ts) | Category scale contract |
| [packages/explorEDA/src/types/SavedDataTypes.ts](https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/SavedDataTypes.ts) | Saved scale and field settings representation |

### Repository reference links

[R01]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/AGENTS.md
[R02]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/research/DIRECTION.md
[R03]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/categories.ts
[R04]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/fieldSettings.ts
[R05]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts
[R06]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[R07]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/projectFile.ts
[R08]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryFlow.tsx
[R09]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/ExplorEdaProject.tsx
[R10]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
[R11]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/sheets.ts
[R12]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/stepEditing.ts
[R13]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/sources.ts
[R14]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/ProjectWorkspace.tsx
[R15]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/calculations/functions/registry.ts
[R16]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/SavedViewsWorkspace.tsx
[R17]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/analysisRowKeys.ts
[R18]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/colorScaleMath.ts
[R19]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/settingsCompatibility.ts
[R20]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dsl/project.ts
[R21]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/folder.ts

## Appendix C. Primary sources

All sources below are official documentation or specifications, accessed during this run on October 24, 2026. They support the stated semantics; no comparative product usability test or participant study was performed.

| ID / primary source | Direct URL | Claim supported |
| --- | --- | --- |
| **S01 · OpenRefine — Cell editing** | [Open source](https://openrefine.org/docs/manual/cellediting) | Cluster approval, transformation preview, and cell editing behavior. |
| **S02 · OpenRefine — Clustering in depth** | [Open source](https://openrefine.org/docs/technical-reference/clustering-in-depth) | Syntactic versus semantic similarity; fingerprint operations and their risks. |
| **S03 · Microsoft — Using the Applied Steps list** | [Open source](https://learn.microsoft.com/en-us/power-query/applied-steps) | Inspectable, named transformation steps. |
| **S04 · Microsoft — Replace values** | [Open source](https://learn.microsoft.com/en-us/power-query/replace-values) | Text-occurrence replacement versus whole-cell options. |
| **S05 · Tableau — Group Your Data** | [Open source](https://help.tableau.com/current/pro/desktop/en-us/sortgroup_groups_creating.htm) | Editable group fields, error/analytical uses, and optional Other group. |
| **S06 · JMP 19.2 — Recode Data in a Column** | [Open source](https://www.jmp.com/support/help/en/19.2/jmp/recode-data-in-a-column.shtml) | New-column default, formula column, and corresponding table-row selection. |
| **S07 · forcats — fct_recode** | [Open source](https://forcats.tidyverse.org/reference/fct_recode.html) | Unmentioned factor levels remain unchanged. |
| **S08 · pandas — Series.map** | [Open source](https://pandas.pydata.org/docs/reference/api/pandas.Series.map.html) | Ordinary dictionary mapping sends absent keys to missing values. |
| **S09 · Microsoft — Table.AddFuzzyClusterColumn** | [Open source](https://learn.microsoft.com/en-us/powerquery-m/table-addfuzzyclustercolumn) | Fuzzy threshold and transformation-table semantics differ from exact typed equality. |
| **S10 · ECMAScript — Text Processing** | [Open source](https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.tolowercase) | String.prototype.toLowerCase and trim semantics; trim section is linked separately below. |
| **S11 · Unicode — UAX #15, Unicode Normalization Forms** | [Open source](https://www.unicode.org/reports/tr15/) | Canonical/compatibility distinctions and caution with compatibility normalization. |
| **S12 · Unicode — UTS #39, Unicode Security Mechanisms** | [Open source](https://www.unicode.org/reports/tr39/) | Confusable detection and skeletons are not identifier normalization. |

Additional precise language-specification section: [ECMAScript String.prototype.trim](https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.trim).

[S01]: https://openrefine.org/docs/manual/cellediting
[S02]: https://openrefine.org/docs/technical-reference/clustering-in-depth
[S03]: https://learn.microsoft.com/en-us/power-query/applied-steps
[S04]: https://learn.microsoft.com/en-us/power-query/replace-values
[S05]: https://help.tableau.com/current/pro/desktop/en-us/sortgroup_groups_creating.htm
[S06]: https://www.jmp.com/support/help/en/19.2/jmp/recode-data-in-a-column.shtml
[S07]: https://forcats.tidyverse.org/reference/fct_recode.html
[S08]: https://pandas.pydata.org/docs/reference/api/pandas.Series.map.html
[S09]: https://learn.microsoft.com/en-us/powerquery-m/table-addfuzzyclustercolumn
[S10]: https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.tolowercase
[S11]: https://www.unicode.org/reports/tr15/
[S12]: https://www.unicode.org/reports/tr39/

## Appendix D. Independently executable research oracle

Copy this complete block to `category-mapping-oracle.mjs` and run `node category-mapping-oracle.mjs`. It uses only Node’s built-in assertion module and needs no package installation. This exact research script was executed successfully. It is a design oracle, not the proposed production implementation, product validator, parser test, or browser test.

~~~javascript
// Research-only oracle. This is not application code or a product test.
import assert from 'node:assert/strict';

// Equivalent to the baseline categoryKey identity, without the string cache.
const key = value => value == null
  ? JSON.stringify(['missing'])
  : typeof value === 'number' && !Number.isFinite(value)
    ? JSON.stringify(['number', String(value)])
    : JSON.stringify([typeof value, value]);
const categoryValue = value => value ?? null;

// Persisted keys are precisely the JSON strings produced by categoryKey.
// This decoder exists only in the independent oracle to validate the contract.
function keyValue(sourceKey) {
  if (typeof sourceKey !== 'string') throw new Error('Invalid source key');
  let parts;
  try { parts = JSON.parse(sourceKey); } catch { throw new Error('Invalid source key'); }
  if (!Array.isArray(parts)) throw new Error('Invalid source key');
  let value;
  if (parts.length === 1 && parts[0] === 'missing') value = null;
  else if (parts.length === 2 && parts[0] === 'string' && typeof parts[1] === 'string') value = parts[1];
  else if (parts.length === 2 && parts[0] === 'boolean' && typeof parts[1] === 'boolean') value = parts[1];
  else if (parts.length === 2 && parts[0] === 'number' && typeof parts[1] === 'number' && Number.isFinite(parts[1])) value = parts[1];
  else if (parts.length === 2 && parts[0] === 'number' && ['NaN','Infinity','-Infinity'].includes(parts[1])) value = Number(parts[1]);
  else throw new Error('Invalid source key');
  if (key(value) !== sourceKey) throw new Error('Noncanonical source key');
  return value;
}

const rule = (from, target) => ({sourceKey:key(from), target:Object.is(target,-0) ? 0 : target});
const validTarget = target => target === null || typeof target === 'string' || typeof target === 'boolean' || (typeof target === 'number' && Number.isFinite(target));

const values = [
  'North', 'north', 'North ', 'North-East', 'North East',
  1, '1', true, 'true', null, undefined, '', ' ', '(missing)',
  NaN, 'NaN', Infinity, -Infinity, -0, 0, '001',
  'ACME', '\u0410CME', '\u00e9', 'e\u0301', 'West', 'W.', 'East',
];
const rows = values.map((value, index) => ({
  id: `R${String(index + 1).padStart(2, '0')}`,
  value,
}));
const entries = [
  rule('North', 'North'),
  rule('north', 'North'),
  rule('North ', 'North'),
  rule(1, 'Numeric one'),
  rule(true, 'Enabled'),
  rule('', 'Empty label'),
  rule(NaN, 'Invalid measurement'),
  rule(0, 'Zero'),
  rule('West', 'West'),
  rule('W.', 'West'),
];

function compile(entries) {
  const compiled = new Map();
  for (const entry of entries) {
    const target = entry.target;
    if (!validTarget(target)) {
      throw new Error('Target must be text, a finite number, boolean, or null');
    }
    keyValue(entry.sourceKey);
    const identity = entry.sourceKey;
    if (compiled.has(identity)) throw new Error(`Duplicate source category ${identity}`);
    compiled.set(identity, Object.is(target,-0) ? 0 : target);
  }
  return compiled;
}

function mapRows(input, entries, unmatched = {kind: 'keep'}) {
  const compiled = compile(entries);
  if (!unmatched || !['keep','value'].includes(unmatched.kind)) throw new Error('Invalid unmatched policy');
  if (unmatched.kind === 'value' && !validTarget(unmatched.value)) throw new Error('Fallback must be text, a finite number, boolean, or null');
  const fallback = Object.is(unmatched.value,-0) ? 0 : unmatched.value;
  return input.map(row => {
    const matched = compiled.has(key(row.value));
    const mapped = matched ? compiled.get(key(row.value))
      : unmatched.kind === 'keep' ? categoryValue(row.value) : fallback;
    return {
      ...row,
      mapped,
      matched,
      changed: key(mapped) !== key(row.value),
      sourceMissing: row.value == null,
      key: `records:string:${row.id}`,
    };
  });
}

function stats(result) {
  return {
    rows: result.length,
    originalCategories: new Set(result.map(row => key(row.value))).size,
    outputCategories: new Set(result.map(row => key(row.mapped))).size,
    matched: result.filter(row => row.matched).map(row => row.id),
    mappedChanged: result.filter(row => row.matched && row.changed).map(row => row.id),
    mappedUnchanged: result.filter(row => row.matched && !row.changed).map(row => row.id),
    unmatched: result.filter(row => !row.matched).map(row => row.id),
    sourceMissing: result.filter(row => row.sourceMissing).map(row => row.id),
  };
}

const mapped = mapRows(rows, entries);
assert.equal(mapped.length, 28);
assert.deepEqual(stats(mapped).matched, ['R01','R02','R03','R06','R08','R12','R15','R19','R20','R26','R27']);
assert.deepEqual(stats(mapped).mappedChanged, ['R02','R03','R06','R08','R12','R15','R19','R20','R27']);
assert.deepEqual(stats(mapped).mappedUnchanged, ['R01','R26']);
assert.deepEqual(stats(mapped).sourceMissing, ['R10','R11']);
assert.equal(stats(mapped).originalCategories, 26);
assert.equal(stats(mapped).outputCategories, 23);
assert.deepEqual(mapped.filter(row => row.mapped === 'North').map(row => row.id), ['R01','R02','R03']);
assert.deepEqual(mapped.filter(row => row.mapped === 'West').map(row => row.id), ['R26','R27']);
assert.equal(mapped.find(row => row.id === 'R07').mapped, '1');
assert.equal(mapped.find(row => row.id === 'R09').mapped, 'true');
assert.equal(mapped.find(row => row.id === 'R16').mapped, 'NaN');
assert.equal(mapped.find(row => row.id === 'R10').mapped, null);
assert.equal(mapped.find(row => row.id === 'R11').mapped, null);
assert.equal(mapped.find(row => row.id === 'R11').value, undefined);
assert(Object.is(rows[18].value, -0));
assert(Object.is(mapped[18].value, -0));
assert.deepEqual(mapped.map(row => row.key), rows.map(row => `records:string:${row.id}`));

const refreshRows = rows.filter(row => row.id !== 'R03').map(row => row.id === 'R06' ? {...row, value: '1'} : row).concat([
  {id:'R29', value:'NORTH'}, {id:'R30', value:'North '},
]).reverse();
const refreshed = mapRows(refreshRows, entries);
assert.equal(refreshed.length, 29);
assert.deepEqual(refreshed.filter(row => row.mapped === 'North').map(row => row.id).sort(), ['R01','R02','R30']);
assert.equal(stats(refreshed).matched.length, 10);
assert.equal(stats(refreshed).unmatched.length, 19);
assert.equal(stats(refreshed).mappedChanged.length, 8);
assert.equal(stats(refreshed).mappedUnchanged.length, 2);
assert.equal(stats(refreshed).outputCategories, 23);
assert.deepEqual(refreshed.filter(row => row.mapped === '1').map(row => row.id).sort(), ['R06','R07']);
assert.equal(refreshed.find(row => row.id === 'R29').mapped, 'NORTH');
assert.equal(refreshed.find(row => row.id === 'R06').key, 'records:string:R06');

const fallback = mapRows(rows, entries, {kind:'value', value:null});
assert.equal(fallback.filter(row => row.mapped == null).length, 17);
const otherFallback = mapRows(rows, entries, {kind:'value', value:'Other'});
assert.equal(otherFallback.filter(row => row.mapped === 'Other').length, 17);
assert.deepEqual(otherFallback.filter(row => row.mapped === 'Other').map(row => row.id), stats(mapped).unmatched);
const keepMissingWithOther = mapRows(rows, [...entries, rule(null,null)], {kind:'value',value:'Other'});
assert.equal(keepMissingWithOther.filter(row => row.mapped === 'Other').length, 15);
assert.deepEqual(keepMissingWithOther.filter(row => row.mapped == null).map(row => row.id), ['R10','R11']);
const missingRule = mapRows(rows, [...entries, rule(null, 'Unspecified')]);
assert.deepEqual(missingRule.filter(row => row.mapped === 'Unspecified').map(row => row.id), ['R10','R11']);

assert.throws(() => compile([rule(null, 'A'), rule(undefined, 'B')]), /Duplicate/);
assert.throws(() => compile([rule(-0, 'A'), rule(0, 'A')]), /Duplicate/);
assert.throws(() => compile([rule('North', 'A'), rule('North', 'B')]), /Duplicate/);
assert.doesNotThrow(() => compile([rule(1, 'A'), rule('1', 'B')]));
assert.doesNotThrow(() => compile([rule(NaN, 'A'), rule('NaN', 'B')]));
assert.throws(() => compile([rule('A', undefined)]), /Target/);
assert.throws(() => compile([rule('A', NaN)]), /Target/);
assert.throws(() => compile([rule('A', Infinity)]), /Target/);
for (const value of [undefined,NaN,Infinity,-Infinity,{},[]]) {
  assert.throws(() => mapRows([], entries, {kind:'value',value}), /Fallback/);
}
assert.throws(() => mapRows([], entries, {kind:'value'}), /Fallback/);
assert.throws(() => mapRows([], entries, {kind:'unknown'}), /policy/);
assert(Object.is(mapRows([{id:'minus-zero',value:'unmatched'}], entries, {kind:'value',value:-0})[0].mapped, 0));
assert.throws(() => compile([{sourceKey:'["number","1"]',target:'bad'}]), /source key/);
assert.throws(() => compile([{sourceKey:'["number",-0]',target:'bad'}]), /Noncanonical/);
assert.throws(() => compile([{sourceKey:'[ "missing" ]',target:'bad'}]), /Noncanonical/);
assert.throws(() => compile([{sourceKey:'["missing",null]',target:'bad'}]), /source key/);
assert(Object.is(rule('A', -0).target, 0));
const typedTargets = mapRows([{id:'a',value:1},{id:'b',value:'1'},{id:'c',value:true},{id:'d',value:'true'}], [
  rule(1,2),rule('1','2'),rule(true,false),rule('true','false'),
]);
assert.deepEqual(typedTargets.map(row => row.mapped), [2,'2',false,'false']);
assert.equal(new Set(typedTargets.map(row => key(row.mapped))).size, 4);

const chain = mapRows([{id:'A',value:'A'},{id:'B',value:'B'},{id:'C',value:'C'}], [rule('A','B'),rule('B','C')]);
assert.deepEqual(chain.map(row => row.mapped), ['B','C','C']);
const cycle = mapRows([{id:'A',value:'A'},{id:'B',value:'B'}], [rule('A','B'),rule('B','A')]);
assert.deepEqual(cycle.map(row => row.mapped), ['B','A']);

// Scope accounting: choose odd IDs to model a linked filter; recipe stays full-input.
const visible = mapped.filter(row => Number(row.id.slice(1)) % 2 === 1);
assert.equal(visible.length, 14);
assert.equal(visible.filter(row => row.mapped === 'North').length, 2);
assert.equal(mapped.filter(row => row.mapped === 'North').length, 3);

// Existing query aggregate grouping uses typeof + String. Canonical null
// makes the mapped field's groups agree with categoryKey without changing it.
const queryGroups = new Map();
for (const row of mapped) {
  const groupKey = JSON.stringify([`${typeof row.mapped}:${String(row.mapped)}`]);
  const members = queryGroups.get(groupKey) ?? [];
  members.push(row.key);
  queryGroups.set(groupKey, members);
}
assert.equal(queryGroups.size, 23);
assert.deepEqual(queryGroups.get('["object:null"]'), ['records:string:R10','records:string:R11']);
assert.deepEqual(queryGroups.get('["string:North"]'), ['records:string:R01','records:string:R02','records:string:R03']);
assert.deepEqual(queryGroups.get('["string:Zero"]'), ['records:string:R19','records:string:R20']);
assert.deepEqual(queryGroups.get('["string:West"]'), ['records:string:R26','records:string:R27']);
assert.equal([...queryGroups.values()].flat().length, 28);

// Every recipe byte uses plain JSON; no special-value codec needed for rules.
const restoredEntries = JSON.parse(JSON.stringify(entries));
assert.deepEqual(restoredEntries, entries);
assert.deepEqual(mapRows(rows, restoredEntries), mapped);
const escapedSource = 'line\nquote"\\backslash\ttab\u0001';
const escapedTarget = 'target\n"quote"\\end';
const escaped = [rule(escapedSource, escapedTarget),rule(Infinity, 'Positive infinity'),rule(-Infinity, 'Negative infinity'),rule(undefined,null)];
const escapedRestored = JSON.parse(JSON.stringify(escaped));
assert.deepEqual(escapedRestored, escaped);
assert.equal(mapRows([{id:'escape',value:escapedSource}], escapedRestored)[0].mapped, escapedTarget);
assert.equal(mapRows([{id:'inf',value:Infinity}], escapedRestored)[0].mapped, 'Positive infinity');
assert.equal(mapRows([{id:'neg-inf',value:-Infinity}], escapedRestored)[0].mapped, 'Negative infinity');
assert.equal(mapRows([{id:'missing',value:undefined}], escapedRestored)[0].mapped, null);

// Verify ordinary JSON pitfalls that the chosen JSON-safe recipe avoids.
assert.equal(JSON.stringify(NaN), JSON.stringify(Infinity));
assert.equal(JSON.stringify(NaN), JSON.stringify(null));
assert(!Object.is(JSON.parse(JSON.stringify(-0)), -0));

const display = value => value === undefined ? 'undefined' : Number.isNaN(value) ? 'NaN' : Object.is(value,-0) ? '-0' : typeof value === 'string' ? JSON.stringify(value) : String(value);
console.log('Research oracle passed: one-pass mapping, exact memberships, typed category identity, canonical missing output, 23 downstream groups, refresh, validated fallback, missing overrides, conflicts, chains/cycles, linked scope and JSON-safe rules.');
console.log(JSON.stringify({baseline: stats(mapped), refresh:stats(refreshed), downstreamGroups:queryGroups.size, downstreamMissingRefs:queryGroups.get('["object:null"]'), fallbackOther:17, fallbackOtherWithMissingOverride:15}, null, 2));
console.log(mapped.map(row => `${row.id}\t${display(row.value)}\t${key(row.value)}\t${display(row.mapped)}\t${row.matched ? row.changed ? 'matched-changed' : 'matched-unchanged' : 'unmatched-kept'}`).join('\n'));
~~~
