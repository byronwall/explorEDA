# Live findings and explicit evidence scope for explorEDA

**Decision.** Build notebook-owned, named **cohort and finding declarations**, short value references in Markdown, and an evidence inspector that distinguishes **current records** from **saved evidence**. Resolve each live finding from the existing data provider, its declared population, and one explicitly named chart's local selection; preserve local notebook selection defaults. Add deliberate saved-cohort capture for fixed claims, with a separate, undoable restore action. This gives authors reusable numerical statements and readers exact supporting records without executing code in prose or pretending that changing a number rewrites a conclusion. Ship the core through three useful milestones; add opt-in shared selection and exact lasso afterward using the prior Mosaic contract.

Design mission • source commit `7f466fdebcf14c0fd87233aa634c0c74f91b4e93` • research checked for the October 23, 2026 mission.

## Access check and evidence status

**Passed for design.** Both attachments were readable. The scoped packet contains 33 complete text files, including every file in the requested reading route. The packet is authoritative for repository claims in this report. It is not a checkout: it contains no dependencies or data payloads. No application, browser interaction, package tests, benchmark, or earthquake-data calculation was run.

**Checked** means directly supported by supplied source or retrieved primary documentation. **Inference** means a conclusion drawn from those facts. **Proposal** means behavior, syntax, types, or implementation that explorEDA should add. All notebook finding syntax below is proposed; it is not a claim of a released feature.

The packet supplies enough evidence to choose this feature and specify milestone one. Some integration internals, including the general DSL compiler, trace panel implementation, project sample registration, and separate row-identity work, are outside the packet. Attempts to retrieve additional pinned DSL files from GitHub failed. Their absence limits implementation verification, not the decision: the plan isolates notebook declarations before the existing DSL compile, uses source-confirmed interfaces, and names the worker checks needed at those boundaries. No substitute branch or newer GitHub behavior was treated as the baseline.

The prior Mosaic proof's twelve keyed coordinate rows are also absent. Its reported exact-ID/context expectations are retained in the plan, but executing that specific M5 proof requires the original coordinate/key table and boundary policy. This is the smallest missing follow-on input; it does not block the feature decision or M1–M4.

The historical expansion gates in the two intent briefs do not govern this mission. `docs/research/DIRECTION.md` expressly makes Byron the demand and gives feature design priority. The previous Mosaic recommendation remains the selection architecture decision; this report does not repeat its backend survey. [S1, S2]

## 1. What should the author and reader do?

### 1.1 Compare the three serious designs

| Design | Best reason to choose it | Deciding limitation |
| --- | --- | --- |
| Full inline bindings | Lowest effort for the first count: put the calculation where its number appears. | Repeated scope and metric logic become embedded in sentences. |
| Named declarations with short references | One inspectable definition can serve several passages and evidence views. | Requires a small definition editor and a name-resolution contract. |
| References to chart/card results | Direct reuse of a result the author already configured and understands. | A narrative acquires the chart's lifetime, type, scope, and baseline dependencies. |

**A. Full inline binding tokens.** An illustrative alternative is `{{count scope=chart:@regions population=selected}}`.

- **Authoring cost:** excellent for one value, increasingly awkward for several metrics and comparisons.
- **Exact scope:** possible, but every occurrence must carry the same owner, population, and denominator policy.
- **Inspectability:** each occurrence can expose its configuration, but identifying shared meaning takes comparison across tokens.
- **Source edit stability:** replacing a word can also alter analytical logic; renaming a field touches prose throughout the document.
- **Extensibility:** adding contributors, comparison operands, or saved references quickly creates a template language.

Reject full inline calculations as the durable form. Retain the convenient inline placement.

**B. Named finding declarations.** A cohort names an eligible population and selection owner. A finding names a reduction over that cohort or a bounded comparison between reductions. Prose contains only `{{finding:name}}`.

- **Authoring cost:** modest initial overhead; a compact Insert value control generates the definition and reference together.
- **Exact scope:** declared once, with explicit selected/eligible/source distinctions and denominator references.
- **Inspectability:** every reference reaches the same definition, population, method, and rows.
- **Source edit stability:** metric settings live outside sentences; source-span edits can change one declaration while leaving prose intact.
- **Extensibility:** evidence captures and comparisons can refer to definitions without adding arbitrary expressions.

**Choose this design.** It matches the notebook's existing global definition model: `compileNotebook` compiles definitions across all blocks, and sheets divide reading rather than analytical state. [S3, S4]

**C. Chart/card-result references.** An illustrative alternative is `{{chart:score-card.value}}`.

- **Authoring cost:** lowest when a matching card exists; no duplicate measure definition.
- **Exact scope:** strong only if the referenced result publishes its exact semantic result, including denominator and exclusions. Reading a label or displayed number is insufficient.
- **Inspectability:** naturally connects to a chart trace, but must still work while the owning chart is off-sheet.
- **Source edit stability:** a title rename can be harmless; deleting the chart or changing its type can break the passage.
- **Extensibility:** helpful for chart-specific results, but less suitable as the owner of a long-lived claim.

Defer a durable chart-result reference. Explore **Create finding from card** after a shared reduction-input contract exists. That action must explicitly either copy a metric definition or maintain a dependency; it must never imply both. The first release does not scrape cards, mount hidden cards, or promise that a newly copied finding automatically inherits the card's comparison baseline. [S6, S7]

### 1.2 Author workflow

1. Place the cursor in a prose editor and choose **Insert value**.
2. Select an existing finding or create one. Choose **Source rows**, **Workspace rows**, or **Chart selection**; for the latter, select an explicit chart ID and display its title.
3. Name the cohort if needed, then choose Count, Sum, Average, Minimum, or Maximum. Pick the measure with the existing field picker. Start with row grain.
4. Choose Selected or Eligible input. For a share, explicitly choose its denominator. Preview the value with selected, contributing, and excluded counts.
5. Insert the short reference. The editor writes the declaration and token as one source transaction.
6. When making a fixed analytical claim, choose **Save evidence** from its finding or comparison. Write the claim about the named saved cohort and attach its saved-evidence link.

The compact editor uses the project's existing 28 px popover controls, 100 px label column, segmented choices, semantic borders, `FieldMetadata`, and bounded searchable pickers. Its first row holds actions. A preview row shows, for example, **80.00 · 3 contributing / 4 selected**; scope remains visible. Use a nonmodal popover, not a permanent findings sidebar. Valid drafts preview locally; **Insert/Apply** commits one coherent edit and Escape cancels it. This explicit commit is appropriate because inserting a finding can change several distant source spans. [S1]

### 1.3 Reader workflow

A value looks like a number in the sentence, with a restrained dotted underline and a visible section-level **Current selection · Active review records** label. The number is a keyboard-focusable control. Enter, Space, or a click opens a compact summary:

- **Meaning:** Average of score; row grain; same field unit as the source.
- **Scope:** chart `@regions`, fixed active-record restriction, current East selection, any workspace filters.
- **Counts:** 4 selected, 3 contributing, 1 excluded; 10 eligible.
- **Evidence actions:** Contributing records, Excluded records, Selected records, and—where a share needs it—Denominator records.
- **Author controls:** Edit definition and Save evidence when editing is enabled.

An explicit prose link can reach the same evidence:

~~~markdown
[Current records · review count](#finding:selected-count)

[Saved evidence · all active records](#evidence:all-active)
~~~

Recognize only these allowlisted internal targets. They open the notebook's evidence surface. External Markdown links retain their existing protected new-tab behavior. Current `NotebookProse` sets that behavior on every link, so an internal link needs its own rendering path. [S3]

Opening evidence does not filter anything. Pin the opened result revision **and an immutable evidence read view of its raw rows and relevant converted columns**. The inspector never resolves retained runtime IDs through today's provider getters. If exploration changes while it is open, show **Selection changed · Refresh records** within that inspector. A source replacement or calculation/conversion edit likewise cannot substitute new row contents; keep the pinned view until Refresh, or mark an unavailable column explicitly if it was not retained. Keep inline values current. Export, if available in the reused evidence surface, uses the pinned population and explicitly identifies it.

Do not add Inspect buttons to charts or cards. Their existing Alt-click, Alt-Enter, and header trace affordances remain. A prose value is its own control, not a new chart action. Support focus return, sheet navigation, touch, and a single polite announcement after a committed selection rather than an announcement for every value on every pointer movement. [S1, S6]

### 1.4 Complete worked live notebook

The following is a complete **proposed notebook body** for the twelve-row fixture in §2.5. The host supplies the `reviews` query with qualified field keys; the fixture's score field is declared numeric. The chart and field-alias forms follow supplied notebook examples. The new cohort/finding forms and tokens are the design to implement.

The active-record restriction uses the existing chart-local `where.<field>` concept. Its exact boolean-literal spelling below is a **chosen syntax acceptance target**, not a parser behavior verified by this packet. Keep the boolean field qualified rather than coercing it through a categorical alias; M1 must prove it round-trips as boolean true. The implementation tests repeat the same restriction as a provider workspace filter to test that distinct route.

~~~~markdown
**Source context.** Each row is one review in this supplied fixture.
The full source contains {{finding:source-count}} rows.

~~~eda
eda query=reviews
key:cat=reviews.key
group:cat=reviews.group
region:cat=reviews.region
score:num=reviews.score
row @regions region where.reviews.active=true title="Active reviews by region"

cohort @catalog scope=source key=key label="Full source"
cohort @review scope=chart chart=@regions key=key label="Active review records"

finding @source-count cohort=@catalog aggregation=count population=eligible
finding @selected-count cohort=@review aggregation=count population=selected
finding @eligible-count cohort=@review aggregation=count population=eligible
finding @selected-share kind=row-share numerator=@selected-count denominator=@eligible-count digits=0

finding @a-mean cohort=@review aggregation=average field=score population=selected where.group=A digits=2
finding @b-mean cohort=@review aggregation=average field=score population=selected where.group=B digits=2
finding @a-minus-b kind=difference left=@a-mean right=@b-mean digits=2 sign=except-zero
~~~

## Compare the current selection

**Current selection · Active review records.**
{{finding:selected-count}} of {{finding:eligible-count}} eligible records
are selected ({{finding:selected-share}}).

Group A's mean score is {{finding:a-mean}}.
Group B's mean score is {{finding:b-mean}}.
A minus B is {{finding:a-minus-b}} score units.

[Current records · review count](#finding:selected-count)
[Current evidence · A mean](#finding:a-mean)
[Current evidence · B mean](#finding:b-mean)
[Current evidence · comparison](#finding:a-minus-b)

## Reading the comparison

Choose East in the region chart, then clear that selection.
The values describe the selected records; they do not explain why the
groups differ.
~~~~

Without a selection this reads **10 of 10 (100%)**, **30.00**, **38.75**, and **−8.75**. Selecting East reads **4 of 10 (40%)**, **90.00**, **75.00**, and **+15.00**. The source count remains **12**.

There is no fixed “A is lower” assertion in the live comparison. Its signed difference can cross zero without prose generation. A saved version of that claim is described in §3.

### 1.5 When selection must be shared

**One chart → one or many findings:** bind to that chart's local selection. No shared mode is needed. A narrative value is a consumer of the owner's predicate, not another producer of filters. Other charts remain independent.

**Several interactive charts → one common exploration:** opt into a named shared group. This is needed when a histogram and scatter jointly select rows that must drive a table and findings. Declare the member chart IDs and intersection policy; leave every nonmember chart local.

The shared group is membership metadata over existing chart-owned selection state. It does not hold a second copy of filters. Every chart keeps its own owner ID; two charts filtering the same field remain distinct owners. Context may exclude the source chart's own selection; exact table/finding evidence includes all relevant committed predicates. This reuses the supplied Mosaic result. [S2, S7]

Do not make a book, sheet, section, or chart title an implicit shared scope. Do not change `localSelections` to false for the entire notebook merely because one finding is added.

## 2. What is the smallest durable analytical model?

### 2.1 Population and denominator contract

For the named chart cohort, use:

- **D — source rows:** all rows in the notebook's bound query at one data revision.
- **E — eligible rows:** D after workspace filters, the owner's authored `localFilters`, and the cohort's fixed conditions.
- **S — selected rows:** E after the explicitly owned interactive predicate.
- **T — metric inputs:** either E or S, as declared, then the finding's fixed partition filters such as Group A.
- **C — contributors:** the rows in T the reducer includes. Count uses C = T; numeric reductions exclude missing and invalid converted inputs.

A cleared selection means S = E. A committed predicate that matches nothing means S is empty. Do not infer either state from the number of drawn marks. Axis zoom, clipping, top-N display, paging, colors, and chart layout do not define membership. An explicit facet restriction can become a future cohort condition; do not infer one from the visible facet page.

A workspace cohort uses E = D after workspace and cohort conditions, with S = E in the first release. A source cohort uses D after its own fixed conditions and explicitly ignores workspace and interactive filters. Source scope is interaction-independent, not an immutable historical data copy.

| Measure | Explicit denominator or baseline |
| --- | --- |
| Selected row share | Selected count / eligible count of the same cohort and partition. |
| Share of source rows | Selected count / a separately named source count; label it as source rows. |
| Average | Contributing row count, not selected row count. |
| A minus B | Two separately reduced operands, with the same field unit and coherent source/scope revision. |
| Minimum/maximum | No percentage baseline; retain all valid input contributors, identifying extremal inputs in the explanation if useful. |

Count-share operands must be count reductions, row grain, same source, and an actual subset relationship. Reject an invalid ratio; never clamp it to 100%. The first editor offers selected/eligible share. Explicit source share is available through a separate source-count definition. Defer ratio-of-sums, percent change, weighted means, correlation, medians, and general expressions.

### 2.2 Reuse boundaries that matter

**Checked:** `aggregates.ts` exposes count, sum, average, max, and min. `summarizeGroup` returns the numerical value, contributors, exclusions, and entity issues. `MetricCard` already prepares converted inputs, records raw conversion failures, formats fields, and exposes a contributor trace. Reuse these boundaries. [S6]

**Checked:** the card's baseline is not automatically a workspace-eligible denominator. `useGetAllIds(settings)` applies chart-local population restrictions; it does not apply workspace filters. `planMetricCard` compares against that supplied baseline. A finding must specify its denominator rather than inherit the card's comparison line. [S6, S7]

**Critical feature integration:** when `localSelections` is true, `CrossfilterWrapper.updateChartFilters` clears the chart's Crossfilter dimension. `getChartFilteredRowIds` then applies global filtered IDs and the chart population, without explicitly applying this notebook chart's own interactive predicate. Therefore a local finding resolver must apply `getFilterFunction(ownerChart)` over E. Merely copying the MetricCard call will not implement the required local binding. This is a design integration requirement, not a proposed audit of existing charts. [S7]

Use the provider's `getColumnData`, field conversion, and `valueParsing` conventions; do not parse raw cells with `Number` or `Date.parse`. Extract a small pure reduction-input helper from the card if needed. Keep the current card's public behavior unchanged unless that refactor demonstrates parity. Format via the existing field formatter by default; bounded digits/sign options alter presentation only and preserve units. A row share formats a 0–1 ratio as a percentage.

`DailyFinding/evaluateFinding` stays in the demo/corpus. It owns independent filtering, formatting, sentence substitution, broader operations, and throw-on-empty behavior. It does not observe notebook interaction. Shared package semantics should stop at typed reduction inputs, finite-number rules, formatting helpers where compatible, and contributor records—not at the daily sentence evaluator. [S9]

### 2.3 Proposed TypeScript boundaries

These types specify the contract, not a ready-to-merge patch. IDs are mandatory authorable names; labels are separately editable. Field names resolve aliases to canonical source/calculation keys. No new field UUID system is assumed.

~~~ts
type NarrativeId = string;
type RuntimeRowId = number;
type FieldKind = "numeric" | "categorical" | "datetime" | "boolean";

type FieldRef = {
  key: string;
  origin: "source" | "calculated";
  expectedType: FieldKind;
};

// Use the existing Filter union and evaluator. Its field is the
// resolved canonical key; validation retains the matching typed ref.
type TypedFilter = {
  field: FieldRef;
  filter: Filter;
};

type CohortDefinition = {
  id: NarrativeId;
  label?: string;
  source: string; // The notebook's one query/source binding.
  basis:
    | { kind: "source" }
    | { kind: "workspace" }
    | { kind: "chart"; chartId: string };
  where: TypedFilter[];
  keyFields?: FieldRef[]; // Required only for durable evidence capture.
};

type DisplaySpec = {
  digits?: 0 | 1 | 2 | 3 | 4;
  sign?: "auto" | "except-zero";
};

type ReduceFinding = {
  id: NarrativeId;
  label?: string;
  kind: "reduce";
  cohortId: NarrativeId;
  population: "eligible" | "selected";
  grain: "rows";
  where: TypedFilter[];
  metric:
    | { aggregation: "count" }
    | {
        aggregation: "sum" | "average" | "min" | "max";
        field: FieldRef;
      };
  display?: DisplaySpec;
};

type FindingDefinition =
  | ReduceFinding
  | {
      id: NarrativeId;
      label?: string;
      kind: "difference";
      left: NarrativeId;
      right: NarrativeId;
      display?: DisplaySpec;
    }
  | {
      id: NarrativeId;
      label?: string;
      kind: "row-share";
      numerator: NarrativeId;
      denominator: NarrativeId;
      display?: Pick<DisplaySpec, "digits">;
    };

type FindingProblem =
  | "empty-scope"
  | "no-valid-values"
  | "missing-field"
  | "field-type-mismatch"
  | "missing-chart"
  | "missing-cohort"
  | "missing-finding"
  | "duplicate-id"
  | "invalid-definition"
  | "incompatible-operands"
  | "zero-denominator"
  | "nonfinite-result"
  | "source-unavailable";

type FindingValue =
  | { kind: "value"; value: number; text: string }
  | { kind: "unavailable"; reason: FindingProblem; text: string };

type ReductionEvidence = {
  cohortId: NarrativeId;
  eligibleIds: readonly RuntimeRowId[]; // E, before metric partition.
  selectedIds: readonly RuntimeRowId[]; // S, before metric partition.
  inputIds: readonly RuntimeRowId[]; // T, after population + partition.
  contributors: readonly AggregateContributor[]; // Included AND excluded.
};

type FindingResult = {
  findingId: NarrativeId;
  revision: string; // Coherent semantic input revision, not just nonce.
  sourceRevision: string;
  value: FindingValue;
  evidence:
    | { kind: "reduction"; reduction: ReductionEvidence }
    | {
        kind: "comparison";
        operands: readonly [FindingResult, FindingResult];
      };
};

type NotebookFindings = {
  cohorts: CohortDefinition[];
  findings: FindingDefinition[];
  evidence: SavedEvidence[];
};

// Proposed optional addition to SavedDataStructure:
// notebookFindings?: NotebookFindings
~~~

In this bounded version, difference and share operands reference primitive reductions, not arbitrary expressions or other comparisons. A difference requires the same source, cohort, row grain, aggregation, canonical measure field (or two row counts), and effective unit semantics; fixed partition filters may differ. Display precision does not affect compatibility. A source share may reference a separate source cohort, so evidence capture must include both cohorts. Reject unknown references and cycles. This keeps evaluation a small dependency graph rather than a query engine.

Row grain is deliberate. Although `summarizeGroup` supports `entityField`, once-per-entity results introduce representative rows, repeated supporting rows, missing IDs, and conflicting values. Add that authoring option only alongside the separate entity-grain contract. Never quietly count unique entities while labeling the result “rows.” [S6]

### 2.4 Ownership, persistence, and lifecycle

**One authority at each boundary:**

1. The notebook text owns durable declarations and explicitly saved evidence.
2. Compilation produces the optional `SavedDataStructure.notebookFindings` representation.
3. The existing provider owns current chart and workspace filters, converted data, calculations, and field settings.
4. A selector/evaluator derives results from those inputs. A memoized result cache has no independent filter actions.
5. Saved evidence is an intentional historical capture, not the live result cache.

~~~mermaid
flowchart TD
  A["Notebook source"] --> B["Compiled declarations"]
  B --> C["Existing data provider"]
  D["Chart and workspace actions"] --> C
  C --> E["Resolve declared population"]
  E --> F["Reduce and format"]
  F --> G["Inline value"]
  F --> H["Current evidence"]
  F --> I["Explicit evidence capture"]
  I --> A
~~~

`saveToStructure`, restore, validation, field/calculation dependency traversal, and source write-back all need the new registry. Preserve stable save fingerprints so a host echo does not trigger an unnecessary full restore. No migration framework is needed: the property is optional; absent means no findings. Support one new schema and report unsupported evidence formats explicitly. [S5, S8]

**Reference rules:**

- **Names:** narrative IDs are case-sensitive, unique notebook-wide across cohorts/findings/evidence, and match a bounded identifier grammar such as letters followed by letters, digits, underscores, or hyphens. Labels may repeat. Report every duplicate declaration; never use first/last silently.
- **Charts:** use explicit chart IDs, not titles. The insertion editor names an unnamed chart in the same transaction. Current generated IDs depend on block/position and are not an adequate durable authoring reference. [S4]
- **Fields:** label changes are harmless. Actual source-key changes or incompatible types produce an unavailable token until explicitly rebound. Never fuzzy-match a display label or another similarly named field.
- **Graphical rename:** update the declaration and all live references atomically. Saved captures retain their copied definitions. Manual renames can temporarily produce unresolved references.
- **Deletion:** deleting a required chart/cohort/finding breaks only dependent live values. A saved capture can remain inspectable independently of its original chart.
- **Sheets:** evaluation uses provider state, including off-sheet owners. Heading and sheet-ID changes do not alter analytical identity. Resolve “Go to chart” from the current source map; do not persist a heading slug as a dependency.
- **Source replacement:** invalidate results before publishing values from the replacement. Revalidate field types, conversions, calculations, and current supported predicates; then derive fresh results. Any retained predicate is reevaluated, never interpreted as saved row membership. Do not silently rebind a new query by matching its field labels.
- **Invalid editing:** current charts may continue showing their last valid block. A dependent finding must instead say “Unavailable: definition has an error” while that source definition or dependency is invalid/frozen. Do not present a retained number as a current result. [S3, S4]
- **Coherence:** gather both comparison operands from the same provider snapshot. Invalidation includes data, field conversions, calculations, relevant fixed filters, owned selection, and definition changes. Provider `nonce` alone is insufficient because chart changes also refresh `liveItems`. Formatting changes may refresh text without redefining evidence membership. [S8]

The existing writer already omits `select.*` and chart filters from notebook edits. Preserve that behavior. New declaration edits use parsed source spans, recompile, and compare normalized definitions before committing. Reconcile the source transaction with provider state so Insert/Edit/Rename/Rebind does not restore compiled empty selections: editing a finding while East is selected must leave four records selected. Preserve untouched source slices, comments, quote choices, and original newline style in the new writer. Existing line-based helpers normalize joins to LF, so this report does not claim byte-preservation is already universal. [S3, S5]

### 2.5 Exact fixture and expected values

This fixture is synthetic and deliberately small; its arithmetic was checked independently using exact fractions. It is not an observation about the earthquake data.

| Key | Group / region | Score / active |
| --- | --- | --- |
| r01 | A / East | 90 / true |
| r02 | A / West | 10 / true |
| r03 | A / West | 20 / true |
| r04 | A / West | 0 / true |
| r05 | A / West | null / true |
| r06 | B / East | 80 / true |
| r07 | B / East | 70 / true |
| r08 | B / West | 5 / true |
| r09 | B / West | 0 / true |
| r10 | B / East | "bad" / true |
| r11 | A / East | 100 / false |
| r12 | B / West | 100 / false |

D has 12 rows. The active restriction makes E = r01–r10. In the notebook it is chart-local; in the workspace-denominator test the same restriction is a workspace filter and the chart has no fixed restriction.

| Scope | Exact membership and reduction | A versus B |
| --- | --- | --- |
| Cleared selection | S = r01–r10; 10 selected; 8 numeric contributors; sum 275; average 34.375. | A: 4 contributors / 5 inputs, mean 30. B: 4 / 5, mean 38.75. A−B = −8.75. |
| East | S = r01,r06,r07,r10; C = r01,r06,r07; sum 240; average 80; selected/eligible = 4/10 = 40%. | A = 90; B = 75; A−B = +15. |
| West | S = r02,r03,r04,r05,r08,r09; C excludes r05; sum 35; average 7; share 60%. | A = 10; B = 2.5; A−B = +7.5. |
| Score exactly zero | S = C = r04,r09; count 2; sum 0; average 0; share 20%. | A = 0; B = 0; A−B = 0. |
| Invalid-only keys r05,r10 | Count 2; zero numeric contributors; share 20%. | Numeric reductions unavailable: no valid values. |
| Active predicate with no matches | Count 0; share 0/10 = 0%; no contributors. | Numeric reductions unavailable: empty scope. |
| No eligible rows | Count 0; E and S both empty. | Share unavailable: zero denominator. |

For East, the two row-count denominators are deliberately different: **4/10 = 40% eligible**, and **4/12 = 33⅓% source**. In the workspace-filter setup, a MetricCard all-source baseline can be 12 even though workspace eligibility is 10. In the notebook's chart-local setup, that card baseline could instead be 10. Do not conflate the two cases.

Additional expected states:

- A genuine numeric zero renders as zero. Never use a truthiness check for availability.
- Empty sum is unavailable under the existing `reduceNumbers` contract; a nonempty sum of zeros is zero.
- A missing field is a schema/reference error even if the current selection is empty.
- All-invalid input and empty input have different reasons and evidence counts.
- A nonfinite aggregate result is unavailable; never print NaN or Infinity as a finding.
- The count trace includes r10 under East; the numeric trace explains why r10 did not contribute.
- The average denominator is 3 under East, not its 4 selected rows.

## 3. How should fixed claims follow evidence?

### 3.1 Three explicit author intentions

| Passage type | What follows interaction | Reader-visible contract |
| --- | --- | --- |
| Fixed dataset context | Nothing, unless the author deliberately inserts a source-scoped value. | “Source context”; identifies the dataset/query rather than the current selection. |
| Live descriptive values | Declared numerical values and current evidence. | “Current selection · [cohort]”; each value exposes its method and rows. |
| Saved cohort claim | The prose and captured values stay fixed. | “Saved cohort · [label]” plus a saved-evidence link. |

An unbound qualitative sentence is not automatically parsed or monitored. The feature does not verify that an author's interpretation is true, infer causation, or rewrite an adjective. It makes the intended evidence scope explicit and lets the reader examine it.

After clearing the selection in the worked notebook, save the comparison as `all-active`. The author may then write:

~~~markdown
**Saved cohort · All active records.**
In this saved cohort, Group A's mean score was lower than Group B's:
30.00 versus 38.75.

[Saved evidence · all active records](#evidence:all-active)
~~~

Now choose East. The live comparison becomes 90.00 versus 75.00, while this claim remains about the saved all-active population. Its link still opens ten selected rows and the two four-row contributor sets. No automatic rewriting is necessary.

An optional, quiet **Current scope differs** label belongs beside this saved reference when its relevant membership or analytical dependencies differ. Do not show a page-wide stale warning. Chart color, title, layout, sheet navigation, unrelated local selections, and mere rounding changes do not trigger it. Matching means compatible source/metric semantics and exact eligible/selected membership, not identical DOM or identical rounded values.

### 3.2 What is saved

Store a strictly validated `eda-evidence` JSON fence in the same notebook. It is a bounded metadata segment, not an expression language. The editor generates it; the author normally interacts with its name, scope summary, and evidence link.

Capture:

- Evidence ID, label, and capture time.
- Source/query identity plus a durable content revision.
- Explicit typed unique source key fields; captured eligible and selected key sets for every referenced cohort.
- A frozen copy of all relevant cohort and primitive finding definitions, display settings, and comparison operands.
- Relevant workspace filters, a lossless snapshot of the owner's interactive predicate state, authored population restrictions, and effective field/calculation semantics.
- Captured numerical results and every metric input's typed value, raw value where relevant, key, inclusion flag, and exclusion reason.

Do not save runtime numeric `__ID` values as durable keys. Require a unique nonmissing source key or typed tuple; reject duplicates and calculated key fields in the first release. Extract keys from raw source values independently of display/conversion settings. Numeric 1 and string "1" remain different keys; a raw date string remains a string key. Choose one capture-owned key tuple for every cohort and reduction in a saved record; cohort key hints help select it but cannot create mixed key schemas. The initial capture uses exact source revision matching; cross-refresh remapping belongs to the existing identity initiative and is not required to ship live findings.

Capturing an owner requires an adapter that losslessly records every input to its interactive predicate. A bare filter list is insufficient for all existing owners: `DataLayerProvider.clearAllFilters` clears data-table `globalSearch` separately from `filters`. [S8] M3 supports verified row-value and histogram-range adapters first; current inspection remains available for other owner types, but Save/Restore reports an unsupported-owner reason until a complete adapter exists. Do not claim that a semantic-version string captures missing predicate values.

A proposed persistent boundary is:

~~~ts
type KeyAtom =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean };

type RecordKey = readonly KeyAtom[];
type SourceKeyField = FieldRef & { origin: "source" };

// Reuse the saved-value codec for special cells; JSON cannot directly
// retain undefined, NaN, or infinities.
type EvidenceCell =
  | { kind: "value"; value: string | number | boolean | null }
  | { kind: "special"; value: SavedSpecialValue };

type CapturedCohort = {
  definition: CohortDefinition;
  eligibleKeys: RecordKey[];
  selectedKeys: RecordKey[];
};

type CapturedReduction = {
  definition: ReduceFinding;
  value: FindingValue;
  inputs: {
    key: RecordKey;
    input: EvidenceCell;
    rawInput?: EvidenceCell;
    included: boolean;
    exclusionReason?: string;
  }[];
};

type CapturedSemantics = {
  fields: {
    field: FieldRef;
    effectiveType: FieldKind;
    settings: FieldSettings;
  }[];
  calculations: SavedCalculation[]; // Transitive expression dependencies.
  reducerContract: "row-aggregates-v1";
  filterContract: "chart-filters-v1";
};

// Initial discriminant; extend only with a validated, lossless adapter.
type OwnerSelectionSnapshot = {
  kind: "filter-list-v1";
  adapter: "row-values-v1" | "histogram-range-v1";
  filters: TypedFilter[];
};

type SavedEvidence = {
  format: "exploreda-evidence";
  version: 1;
  id: NarrativeId;
  label: string;
  capturedAt: string;
  source: { id: string; revision: string };
  keyFields: SourceKeyField[];
  cohorts: CapturedCohort[];
  semantics: CapturedSemantics;
  scope: {
    // Absent for a source-only capture; [] means an eligible scope
    // explicitly captured an unrestricted workspace.
    workspaceFilters?: TypedFilter[];
    owners: {
      chartId: string;
      chartType: string;
      selection: OwnerSelectionSnapshot;
      population: TypedFilter[];
    }[]; // Empty or one in M3; several after opt-in shared scope.
    analyticalRevision: string;
  };
  reductions: CapturedReduction[];
  comparisons: {
    definition: Exclude<FindingDefinition, ReduceFinding>;
    value: FindingValue;
  }[];
};
~~~

The analytical revision identifies the captured semantic configuration; the source revision identifies the input query data. `FieldSettings`, `SavedCalculation`, and `SavedSpecialValue` reuse the package's existing types. All ordinary numeric key/cell values must be finite. Every `RecordKey` uses the ordered `SavedEvidence.keyFields` tuple. Captured reductions join their cohort through `definition.cohortId`; their included input records derive the contributor keys without another conflicting membership list. A count records an input contribution of 1 per row; numerical reductions record the actual converted input and relevant raw input. M3 permits a closure containing source/workspace baselines and at most one chart owner. The plan requires a complete validator and executable round-trip fixture before the new fence ships.

A content revision may come from a verified local project revision adapter. Otherwise compute a canonical typed-data fingerprint once per source replacement, preserving row order and special-value types. Until available, disable durable Save evidence with a precise reason; live findings and session inspection still work. At Save, capture the displayed result, immutable evidence read view, and dependency snapshot together. Naming the capture later commits that exact revision; refreshing it replaces the whole capture. Never mix an older value with filters read after a delay. The first saved-evidence release does not archive entire input datasets.

### 3.3 Inspecting is different from restoring

**View current records** resolves the current finding and opens its pinned evidence revision.

**View saved evidence** opens the captured values and frozen definitions. When the exact source revision and keys are available, it reads those raw source rows directly, ignoring today's workspace filters, local selections, table search, and chart mounting. Its historical measure columns and contribution explanation use the captured inputs, including calculated values; they never call today's `getColumnData` for an old calculation. Otherwise it displays the historical summary with **Original records unavailable for this source**; it does not substitute newly matched rows. A changed conversion/calculation can leave raw records inspectable while making restoration incompatible.

**Restore saved scope** is a separate action within saved evidence. Its mutation set follows the captured basis: source-only evidence has no filters to restore; workspace evidence restores the workspace filter set; chart evidence restores that set and the named owner's selection. A source denominator adds no extra mutations to a chart-based capture.

1. Verify exact source revision, typed key uniqueness, required owner existence/type, and compatible relevant field/calculation/population semantics.
2. Preview the affected state: the saved workspace filter set and the saved selection of the explicitly named owner.
3. Compute the candidate E and S for every captured cohort without committing; verify that they equal its captured key sets.
4. Apply that filter state as one provider transaction and one undo step. Keep unrelated local chart selections and styling untouched.
5. If source data, authored population, a calculation, or the owner would need changing, leave restore unavailable. Do not rewrite definitions or replace data to make restoration work.

Replaying a predicate on replacement data is a new analysis, not restoration of exact saved evidence. Later identity work may support a separately labeled **Re-evaluate on current data** action that creates a new capture. Do not call it the original saved claim.

### 3.4 Applying this to the earthquake notebook

The supplied `four-questions.eda.md` is valuable because its four sheets mix dataset context, scalar statistics, interpretive headings, and supporting charts. Its text states 7,643 events, 79.3% shallower than 70 km, median depth 13 km, and 19 events at magnitude 7 or higher. Those are authored source statements in the packet; they were not recomputed here. [S10]

A staged adaptation should:

- Keep its catalogue/year description as source context.
- Add a live selected count and mean depth to the existing depth histogram, with an explicit local binding and current-records link.
- Keep a historical statement about the complete 2023 catalogue attached to an explicit saved source/cohort capture when the underlying data and keys are available.
- Leave the median as existing static/corpus-supported content until median semantics are intentionally added; the package reducer currently does not expose median.
- Avoid turning an interpretive heading such as “Four in five start in the crust” into a live claim merely by substituting its percentage. It needs a named saved scope or neutral live wording.
- Keep the existing magnitude-7 table local. Only an explicit shared-group feature should make it follow another chart.

The deterministic review fixture is the first runnable example. Converting the real earthquake notebook is a later integration exercise after workers can load its actual data; it is not a prerequisite or an unverified acceptance result.

## 4. What should be learned from current primary sources?

These are mechanisms checked in official documentation or authors' publications. The choices in the right column are design inferences for explorEDA, not claims made by those tools' authors. Documentation was retrieved during this run; no comparator application was usability-tested.

| Primary source: checked mechanism | Consequence for explorEDA |
| --- | --- |
| **Observable Framework:** top-level variable references establish reactive dependencies and dependency-order execution, independent of prose order. [P1] | Adopt named dependencies and coherent recomputation. Keep React and a bounded finding evaluator; do not import Observable's runtime or expose JavaScript in Markdown. |
| **Quarto:** inline code can refer to precomputed values; its guidance keeps nontrivial work in ordinary cells. OJS has reactive dependency execution, distinct from traditional render-time notebook computation. [P2, P3] | Put analytical definitions outside prose. Make the live/update contract explicit rather than calling every computed publication interactive. |
| **Idyll:** extended Markdown distinguishes reactive variables and derived variables recomputed from dependencies. Its component expressions can execute callbacks. [P4] | Borrow declaration/reference separation and compact controls. Reject arbitrary callbacks, general component markup, and a replacement article framework. |
| **Vega-Lite:** named selection parameters specify projected fields and explicit multiview resolution. Empty selections match all when used as predicates by default; the predicate's empty option changes that. [P5, P6] | Name owners and resolution policies. Distinguish cleared selection from active zero matches. Reuse that design discipline without importing Vega or adding a general Boolean editor. |
| **Olli and Umwelt:** the Olli publication presents keyboard-navigable accessible chart structures; Umwelt's current descriptions support named, typed AND-condition highlights covering matching rows. [P7, P8] | Let readers move from value to scope to exact records by keyboard. Offer a small typed cohort editor, not a generated replacement for authored prose or a new rendering framework. |
| **Trrack:** the current project offers action-based provenance; the authors describe explicit state, bookmarks, annotations, and revisiting states. [P9, P10] | Treat a saved analytical moment as explicit. Separate reading its evidence from restoring state. A full provenance graph and a new history library are unnecessary here. |

The strongest synthesis is that **reactivity, named definitions, and navigable evidence are compatible but distinct mechanisms**. A live dependency graph updates numerical results; an evidence reference establishes what an authored claim is about. Neither mechanism can infer the truth of arbitrary prose.

The previous Mosaic study already supplies the remaining selection principle: preserve source context separately from exact evidence, keep ownership distinct from field identity, and build a small contract over Crossfilter. Its histogram/lasso/table/count proof stays the follow-on acceptance target. Mosaic packages, DuckDB interaction backends, and a new database remain deferred. [S2]

## 5. What should be built first, then next?

The companion [implementation-plan.md](implementation-plan.md) gives worker-ready files, contracts, fixture values, tests, and run commands.

| Milestone | Useful shipped outcome | Main dependency/risk |
| --- | --- | --- |
| M1 — Live findings and current evidence | Hand-authored named counts/means/reductions follow one local chart and show exact rows. | Correct local-owner resolution and one coherent value/evidence result. |
| M2 — Compact authoring and durable edits | Insert, edit, rename, and rebind findings without memorizing syntax; notebook text persists them. | Multi-span edits and reference identity without source churn. |
| M3 — Comparisons and saved claims | Explicit shares/differences, captured evidence, reversal example, separate restore and undo. | Exact keys/source revision and transactional scope restoration. |
| M4 — Opt-in shared groups | Selected charts, tables, and findings participate in one declared intersection. | Avoid a competing store or accidental notebook-wide linkage. |
| M5 — Exact lasso | The prior histogram/lasso/table/count proof uses a real polygon and exact records. | Source-space geometry, boundary rules, and equality across consumers. |

**Core cut line: M3.** This is a substantial notebook feature with live numbers, compact authoring, durable definitions, comparisons, and scoped saved claims. It does not require shared selections, lasso, a report engine, a query language, a new database, or a remote service. M1 is independently useful if scheduling cuts arrive earlier. An optional card shortcut and richer reducers are not prerequisites.

Every visible milestone includes its docs section and a reachable example in that same milestone, plus keyboard checks and widths 1280/783/390 px. Use the current docs page at `/docs/notebooks` for the first fixture; do not invent a CLI sample-registration contract. [S1, S10]

### Recommendation register

| ID and disposition | Recommendation | One-line reason |
| --- | --- | --- |
| LF-01 — **Build** | Named cohorts/findings plus reference-only inline tokens. | Reusable semantics remain outside prose while values read naturally. |
| LF-02 — **Build** | Explicit single-chart local binding as the default. | Adds live narrative without changing notebook selection behavior. |
| LF-03 — **Build** | Source/eligible/selected/input/contributing populations. | Counts, averages, percentages, and evidence need distinguishable populations. |
| LF-04 — **Build** | Shared reduction-input preparation, existing reducers/formatters, finding trace adapter. | Reuses established numerical semantics without hidden cards. |
| LF-05 — **Build** | Definition/result separation and one compiled notebook registry. | Prevents transient exploration from becoming persistent duplicate truth. |
| LF-06 — **Build** | Explicit IDs, typed field refs, diagnostics, transactional source edits. | Bindings must survive layout/title changes and fail honestly on deletion. |
| LF-07 — **Build** | Bounded row shares and differences with named operands. | Covers useful comparisons and makes reversal behavior testable. |
| LF-08 — **Build** | Saved-evidence JSON fences with keys and source revision. | Fixed claims need durable, explicit evidence scope. |
| LF-09 — **Build** | Separate current inspection, saved inspection, and explicit restore. | A reader must know whether an action changes the exploration. |
| LF-10 — **Build** | Opt-in shared groups after the core cut. | Multiple views should coordinate only when the author declares it. |
| LF-11 — **Build** | Exact source-space lasso after shared-group proof. | Fulfills the prior selection direction without treating a rectangle as a lasso. |
| LF-12 — **Explore** | Create finding from card and intentional chart-result aliases. | Useful shortcut once exact scope/format/lifetime semantics can be preserved. |
| LF-13 — **Defer** | Entity grain, extra reducers, percent change, cross-refresh evidence remapping. | They have distinct semantic contracts and parallel work to reuse. |
| LF-14 — **Defer** | Mosaic runtime/adapter, DuckDB, full provenance graph. | The feature fits the existing stack and has no new backend requirement. |
| LF-15 — **Avoid** | Arbitrary templates, generated conclusions, causal assertions from descriptive metrics. | Numerical reactivity cannot validate arbitrary language. |
| LF-16 — **Avoid** | Universal staleness warnings, silent rebinding, persisted runtime row IDs. | Each hides or confuses the actual evidence boundary. |

### Open questions, with defaults that do not block M1

- **Evidence capture size:** store exact keys, reduction inputs, semantic configuration, and summaries without copying the whole dataset. Establish a product cap after measuring representative local sources; show a specific limit when exceeded.
- **Stable row-key integration:** require explicit unique typed keys and exact revision in M3. Adopt the separate identity initiative's verified API if available; do not build a second restoration system.
- **Card shortcut:** default to deferring it. If implemented, make “copy definition” versus “follow card” an explicit author choice.
- **Facet lasso scope:** keep existing global-coordinate meaning for the first exact lasso and label it. Defer facet-local capture until its semantics are explicitly designed.
- **Prior lasso fixture:** obtain the original twelve-row coordinate/key table and boundary policy before M5; do not invent coordinates to match its reported answer.
- **Exported plain Markdown:** default to preserving source references and definitions. A later “freeze as static report” command must name its captured scope; it is not part of this cut.
- **Broader aggregate demand:** use the existing five reducers first. A median or weighted mean needs its own exact contributor and empty-state contract.

## References and closing evidence ledger

### Repository sources

Paths and symbols below refer to the supplied commit. Prefix **pkg/** means `packages/explorEDA/src/`. Source-path citations are evidence from the attached packet, not a claim that a remote checkout was executed.

- **S1 — Governing rules:** `AGENTS.md`; `docs/research/DIRECTION.md`; `docs/agent-guide.md`; `CODING_STANDARDS.md`; `docs/ui-defaults.md`. Docs/example gate, one provider, source-edit/undo guidance, accessibility and width requirements.
- **S2 — Prior direction:** `docs/intent/data-bound-narrative/intent-brief.md`; `docs/intent/precise-composite-selection/intent-brief.md`; `docs/research/mosaic-selections-2026-10-20/README.md`; its `recommendation-review.md`; `docs/intent/research-ideas-100/ideas/R067-single-narrative-binding.md`; `R068-narrative-claim-scope.md`.
- **S3 — Notebook UI:** `pkg/components/notebook/NotebookProse.tsx` (`NotebookProse`, MarkdownIt configuration and `link_open`); `ExplorEdaNotebook.tsx` (`ExplorEdaNotebook`, `useNotebookResult`, `NotebookColumn`, `NotebookSectionsView`, `replaceSegment`); `ExplorEdaNotebook.test.tsx`.
- **S4 — Notebook structure:** `pkg/lib/notebook/parseNotebook.ts` (`parseNotebook`, `NotebookSegment`); `compileNotebook.ts` (`compileNotebook`, `blockProblems`, `compiledLines`); `sheets.ts` (`notebookSheets`, `sheetId`).
- **S5 — Source persistence:** `pkg/lib/notebook/writeBack.ts` (`skippedKey`, `textPart`, `writeBackChart`, `writeBackSettings`, `applyEdits`); `writeBack.test.ts`.
- **S6 — Reductions and traces:** `pkg/components/charts/MetricCard/MetricCard.tsx` (`MetricCard`); `metricCardPlan.ts` (`planMetricCard`, `MetricCardSnapshot`); `metricCardTrace.ts` (`makeMetricCardTraceSource`); `definition.ts` (`MetricCardSettings`, `metricCardDefinition`); `pkg/lib/aggregates.ts` (`AGGREGATIONS`, `summarizeGroup`, `reduceNumbers`, `AggregateContributor`).
- **S7 — Selection:** `pkg/hooks/CrossfilterWrapper.ts` (`updateChartFilters`, `getFilterFunction`, `getChartFilteredRowIds`, `getAllData`); `pkg/components/charts/useGetLiveData.tsx` (`useGetLiveIds`, `useGetAllIds`); `pkg/types/FilterTypes.ts` (`Filter`).
- **S8 — Provider and saved state:** `pkg/providers/DataLayerProvider.tsx` (`createDataLayerStore`, `updateChart`, `setWorkspaceFilter`, `clearAllFilters`, `saveToStructure`, `restoreAnalysisFromStructure`, `assertUnusedCalculation`); `pkg/types/SavedDataStructure.ts` (`SavedDataStructure`); `pkg/utils/saveDataUtils.ts` (`validateSavedData`, `validateSavedAnalysisForData`, saved-value serialization).
- **S9 — Separate daily evaluator:** `apps/demo/src/daily/findings.ts` (`DailyFinding`, `evaluateFinding`, `numeric`, `formatValue`).
- **S10 — Current docs/example:** `apps/demo/src/docs/pages/notebooks.mdx`; `apps/demo/public/daily-viz/projects/earthquakes/four-questions.eda.md`.

These groups enumerate all 33 supplied files read during the review. Imported interfaces outside the packet are integration targets, not separately inspected source.

### Current primary sources

- **P1:** Observable, [Framework: Reactivity](https://observablehq.github.io/framework/reactivity). Current official documentation; previous Observable domain redirects to this location.
- **P2:** Quarto, [Inline Code](https://quarto.org/docs/computations/inline-code.html).
- **P3:** Quarto, [OJS Cells](https://quarto.org/docs/interactive/ojs/ojs-cells.html).
- **P4:** Idyll, [Markup Syntax](https://idyll-lang.org/docs/syntax), especially Variables and Derived Variables.
- **P5:** Vega-Lite, [Selection Parameters](https://vega.github.io/vega-lite/docs/selection.html).
- **P6:** Vega-Lite, [Dynamic Behaviors with Parameters](https://vega.github.io/vega-lite/docs/parameter.html).
- **P7:** Blanco, Zong, Satyanarayan, [Olli: An Extensible Visualization Library for Screen Reader Accessibility](https://vis.csail.mit.edu/pubs/olli/), IEEE VIS Posters, 2022. Used for its stated accessible-structure contribution, not as a current implementation specification.
- **P8:** Umwelt, [Designing Text Descriptions](https://umwelt-data.github.io/umwelt/using/text), current official documentation.
- **P9:** Trrack, [Current official repository](https://github.com/Trrack/trrackjs).
- **P10:** Gadhave, Cutler, Lex, [Introducing Trrack](https://vdl.sci.utah.edu/blog/2020/10/28/trrack/), authors' 2020 introduction with a later v2 note. Used for the explicit-state/bookmark/restoration model.

### Final access status

**Checked:** attachment readability and complete-file inventory; all 33 supplied files; current primary-source mechanisms; independent exact fixture arithmetic; internal consistency of this design and its plan.

**Proposed and unrun:** every new syntax, type, UI, persistence field, resolver, screenshot check, acceptance test, performance property, and milestone. The scoped source is sufficient for the design handoff; a runnable checkout and real project data are required for implementation validation. No repository files were changed, committed, or pushed.

**Deliverables:** [report.md](report.md) and [implementation-plan.md](implementation-plan.md). Remaining product questions are the bounded items listed above; none requires outside demand or a usability study before milestone one starts.

