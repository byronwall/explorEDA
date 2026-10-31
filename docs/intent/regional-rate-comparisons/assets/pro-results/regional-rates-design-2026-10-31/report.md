# Build regional rate comparisons with explicit exposure

**Design report · 31 October 2026**  
**Repository baseline:** ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6  
**Evidence:** the supplied complete-file source packet, containing 34 files, plus the primary references linked below.  
**Status:** a proposal for Codex to review and integrate. No repository implementation or browser acceptance test is claimed.

## 1. Decision: build a saved regional comparison

Build **Regional rate comparison** as a saved, bounded **grouped-rate query step**. It should accept either event records plus a separate population/exposure table, or an authoritative table of prepared regional totals. One evaluated result should feed a region map, a ranked comparison with an evidence table, and notebook findings.

The defining capability is the ability to answer all four questions together:

1. Where are there more events?
2. Where are there more events relative to a specified population or exposure?
3. Which original records, exposure observations, and coverage declarations support each answer?
4. Will the same definition retain its meaning when saved, filtered, refreshed, and reopened?

**RR-01 — Build.** Make this a native, reusable analysis. The first release is a complete workflow for **one declared time window, one population definition, and one pinned boundary version**. It supports both input arrangements, displays unavailable comparisons, permits selection of a covered region with zero events, and saves its query, views, and notebook text. It does not depend on the pending quantity or reusable-output proposals.

**RR-02 — Build.** Keep the arithmetic in a small shared computation module, reached through a new AnalysisStep kind. Map settings reference the result and choose its displayed quantity; they do not define a second rate language.

**RR-03 — Build.** Treat the result as **value + status + evidence + scope**. Neither a successful key join nor a finite quotient certifies a comparable population.

This mission supersedes the outside-demand conditions in R016 and the October 19 grouped-rates review. Their useful cautions about grain, contributor identity, and pooling remain relevant. Their recommendation to defer the feature until outside demand is established does not govern this design. The supplied DIRECTION.md explicitly establishes Byron as the demand. [R01], [R02]

### The first end-to-end outcome

An analyst opens a local folder containing events, a regional population table, and polygons. They create “Service requests per 1,000 residents, October 2026,” choose the sources and keys, declare collection coverage, and review alignment. The saved comparison opens with a map and a ranked evidence view. The canonical scope is [2026-10-01T00:00:00Z, 2026-11-01T00:00:00Z), population all-residents, boundary version districts-v1.

The canonical synthetic example is deliberately small:

| Region | Exact inputs | Rate per 1,000 residents |
| --- | --- | --- |
| A | 12 events; 1,200 residents; complete collection | 10 |
| B | 8 events; 200 residents; complete collection | 40 |
| C | 0 events; 400 residents; complete collection | 0 |
| D | 0 observed events; 500 residents; collection unknown | Unavailable |

A leads by count. B leads by rate. C is a valid zero and remains selectable. D remains visible, but its unknown collection prevents a rate. Selecting only “repair” events changes A to 3/1,200 and B to 2/200; the populations remain fixed. The comparison can be reopened from a notebook with those decisions intact.

For A and B together, the pooled rate is **100/7 ≈ 14.285714 per 1,000**, whereas the arithmetic mean of their rates is **25**. M1 exposes the pooled summary; any later mean view must name its different weighting explicitly. The fixtures and independent oracle accompanying this report make those differences executable.

### Delivery boundaries

- **Build now:** descriptive crude population rates and event intensities using an explicit exposure. Count event occurrences or sum validated, prepared nonnegative counts.
- **Build in subsequent stages:** matched multi-period and population-stratum comparisons, explicit repeated-exposure preparation, richer notebook comparisons, and optional declared-model intervals.
- **Explore:** a verified eligible-entity proportion mode and denominator uncertainty supplied by the source.
- **Defer:** age standardization, spatial smoothing, boundary crosswalk computation, and arbitrary model-based measures.
- **Avoid:** interpreting a rate as causal, silently treating incomplete collection as zero, or making this a general GIS or semantic-model platform.

## 2. Compare the viable designs

| Design | What it does well | Decision and reason |
| --- | --- | --- |
| Prepared regional table plus existing Map and a separate note | Small change; specialist preparation can establish geography and exposure upstream. | **Support as an input mode.** It is insufficient as the sole outcome: source provenance stops at prepared rows, dynamic event filtering cannot be reconstructed, and the product does not manage coverage or alignment. |
| Map-specific “divide by” settings | Fast route to a familiar normalization interaction for one table. | **Avoid as the architecture.** The map would own grain, duplicate policy, pooling, filter scope, and evidence; rank views and notebook findings would need competing implementations. |
| Saved grouped-rate step plus geographic views | One narrow computation serves map, rank, table, notebook, and embedded hosts. Both inputs retain their identities. | **Build.** Larger than a ratio field, but bounded by the current query model and directly useful in the first milestone. |
| General reusable metric/semantic layer | Could eventually unify arbitrary formulas, dimensions, units, and consumers. | **Defer.** It adds independent product decisions and creates a prerequisite this mission does not need. |

A prepared table is not a lesser kind of data. It is an appropriate input when its grain and provenance are authoritative. Its trace must honestly stop at the supplied aggregate row unless actual event-level lineage was supplied. A column containing only a precomputed rate is not enough for this capability: import the numerator and denominator as well, or show it as an externally prepared measure without claiming native rate evidence.

### Why the saved step is the smallest useful abstraction

The reusable object needs only two input stages, explicit grouping/alignment fields, numerator semantics, one exposure per group, coverage, units, and a filter policy. It does not need arbitrary expressions over measures, relationships among measures, a global metric catalogue, a SQL engine, or GIS processing.

Existing source, filter, calculate, aggregate, and lookup steps remain ingredients. Their actual execution prevents treating “lookup population, then divide” as a complete substitute:

- **lookupFrame** reads a related **raw source table**, not the output of another independently filtered or aggregated stage.
- Every existing non-source step has one inputStepId; validation and evaluation follow a single upstream chain.
- Lookup can preserve references from the related table, but the accumulated sourceRows/contributors union does not encode numerator versus denominator roles.
- **aggregateFrame** can create prepared totals with provenance. It cannot create the missing exposure/coverage universe, establish population compatibility, or join two independently prepared frames.
- **readNotebookText** currently retains evaluated row data but discards the evaluation object needed for rate evidence. [R07], [R08], [R09]

The extension is therefore a two-input operation in the existing query evaluator, with one shared dependency helper used wherever the query is traversed. It is not an invitation to build a new query platform.

## 3. What the baseline actually contains

The following are **observed source facts** at the supplied commit. Recommendations elsewhere are explicitly proposals.

| Area | Observed code and symbols | Consequence for this design |
| --- | --- | --- |
| Shared reducers | packages/explorEDA/src/lib/aggregates.ts: AGGREGATIONS, reduceNumbers, summarizeGroup, poolAggregateRows support **count, sum, average, max, min**. | Reuse numeric parsing/reduction and contributor concepts. Do not add a two-input rate to the scalar reducer enum. |
| Map choices | Map/definition.ts: MapSettings.aggregation exposes **count, sum, average** only. | Keep that fact separate from the broader shared reducer set. Add a result binding, not an unexplained fourth reducer. |
| Typed region joins | regionMapPlan.ts: regionKey, featureValue, planRegionMap use typed category keys and group multiple features with one key. | Preserve number/string/boolean distinctions and multipart geometry without double counting. |
| Existing region states | planRegionMap distinguishes empty, invalid, and value; zero is a value when the group has valid contributing rows. | “Empty” does not establish complete collection with zero events. Introduce explicit rate availability. |
| Scalar color bounds | planRegionMap derives count, signed-sum, and average envelopes from full-source inputs. | Those proofs do not transfer to ratios with changing denominators. |
| Selection | regionFilters refuses a no-sourceIds region; RegionMap.select opens inspection for it. | Select rate groups independently of event membership. |
| Geography while zooming | RegionMap invokes useZoomDetail before planning; a supplied test checks country-to-state refinement. | Pin a rate analysis to its boundary set/version. Zoom must not change the denominator grain. |
| Map trace | RegionTraceBody shows join, geometry, measure contributors, calculation, and encoding evidence; useMapData reads one provider. | Reuse the trace surface, but supply two source roles through evaluation context. |
| Query model | AnalysisProject.ts has source, lookup, expand, calculate, filter, aggregate steps. evaluateAnalysisQuery is synchronous. | Add a bounded step and both dependency branches; no present two-stage join exists. |
| Source lineage | AnalysisSourceReference carries sourceId, rowKey, optional entityKey. sourceReferences falls back to positional keys when keys are missing or duplicated. | Preserve source-qualified occurrence identity; never promise positional keys survive replacement/reordering. |
| Query reductions | aggregateFrame retains sourceRows, contributors, and numeric measureContributors; count and non-count paths differ. | A rate needs an explicit, consistent evidence record for both count and exposure. |
| Query files and text | projectFile.ts and lib/dsl/project.ts validate/export known step kinds and follow inputStepId. | Extend validation, closure, references, and text for **both** branches, not just the evaluator switch. |
| Notebook findings | findings.ts supports aggregate findings and share/difference comparisons; share requires count findings and row-ID containment. | Existing share is not a separate-population exposure-rate API. |
| Notebook input | readNotebookText chooses a query, evaluates with empty bindings, and maps rows to row.data. | Preserve the full evaluation and explicit bindings/availability in the rate path. |
| Folder availability | readProjectFolder records missingSources while providing empty arrays for missing/unreadable source tables. | Pass availability separately. A missing file must not become evidence of zero events. |
| Settings lifecycle | DataLayerProvider.saveToStructure saves settings, geometry, aggregates, findings; onStateChange uses a saved-state fingerprint and holdStateChanges. | Keep raw source rows and runtime evidence out of settings callbacks. Batch one semantic edit into one history step. |
| Restore validation | saveDataUtils validates chart settings, geometry references, aggregates, findings, and special-value analysis JSON. | Add explicit rate-binding/finding validation and preserve old saves. |
| Notebook writeback | writeBackChart/writeBackSettings splice or rewrite chart declarations, recompile, and compare; transient selections are skipped. | Rate definition edits require query-text writeback, not just chart-token writeback. |

Sources: [R03], [R04], [R05], [R06], [R07], [R08], [R09], [R10], [R11], [R12], [R13], [R14]. These are feature seams, not a general robustness audit. No claim is made about omitted files or current remote main. The source packet is a complete-file **selection**, not a runnable checkout.

## 4. Primary-source comparison: what to adopt

The product comparisons below are based on primary documentation retrieved on 31 October 2026. They establish documented semantics and interaction patterns; no hands-on comparative usability benchmark was run.

| Tool or reference | Verified behavior or principle | Adopt for explorEDA |
| --- | --- | --- |
| **ArcGIS Pro: Calculate Rates** | Takes count and population fields, has an explicit multiplier, and produces a null crude rate for zero population. Crude and smoothing methods are distinct. [S01] | Explicit numerator/exposure roles, unit multiplier, unavailable zero exposure, and a visible raw result. Defer smoothing rather than silently substituting it. |
| **ArcGIS Pro: graduated colors and classification** | Supports field normalization, class ranges, and histogram-based styling. Its classification guidance warns that data-specific natural breaks are unsuitable for comparing differently based maps and that quantiles can distort value similarity. [S02], [S03] | A legible shared legend, inspectable bounds, optional manual shared breaks, and no per-panel reclassification by default. |
| **QGIS: graduated renderer** | Uses a field or expression, supports legend precision and ramps, and exposes editable class breaks through a histogram. [S04] | Focused presentation controls after the rate has been validated. A general GIS expression editor is unnecessary for this task. |
| **GeoDa: rates and linked exploration** | Distinguishes raw and smoothed rate calculations, can save computed rates to a table, and links map selections with other views. Its rate tutorial explains instability from small populations. [S05], [S06] | A saved calculation, linked exact comparison view, and visible exposure beside extreme rates. Keep uncertainty distinct from arithmetic validity. |
| **Tableau: filter order and FIXED calculations** | Ordinary dimension filters can change a numerator while a FIXED denominator remains unchanged; context filters change that behavior. [S07] | Make filter ownership visible and explicit. Do not require users to discover hidden order-of-operations rules. |
| **SEER, CDC, and Census guidance** | These references distinguish rate meanings and specify population, time, geography, vintage, and uncertainty constraints. [S08], [S09], [S10], [S11], [S12], [S13], [S14] | Persist those choices as part of the analysis contract and expose their supporting evidence. |

None of these tools is being recommended as a required service or dependency. The proposed capability remains local and embeddable.

### Map, ranked view, and table each have a job

**RR-04 — Build.** Create the default comparison with a map and a ranked evidence view.

- The map answers spatial questions: neighboring patterns, geographic gaps, and location.
- The ranked view answers numeric questions: largest count, highest rate, closest values, and small regions that occupy little map area.
- The table makes the comparison inspectable: numerator, denominator, multiplier, status, period, population, and evidence links.
- An unavailable region stays in the table and on the geometry, outside the numeric rank. Do not quietly remove it from the comparison.
- Show exact values on selection or focus, not only a colored class. Sort using full numeric precision; equal rates are ties, with stable label ordering for layout.

A map alone is insufficient when counts and rates reverse rank, geometries vary greatly in area, valid values are close, or unavailable regions matter. If the analyst minimizes the companion view, the evidence table remains one header action away. The default is justified by the task, rather than by adding more charts.

### Uncertainty changes the reading, not just the tooltip

A large rate based on little exposure can have weak precision. Source uncertainty and collection gaps are also different problems: an interval under a statistical model cannot repair an unknown denominator or unobserved collection. CDC explicitly distinguishes random variation from systematic bias and cautions against treating overlapping confidence intervals as a significance test. Different data systems use different reliability standards. [S12], [S13]

**RR-05 — Build** visible N, D, coverage, and an “uncertainty not modeled” note in the evidence definition from the first release. Do not attach an unexplained red/yellow/green “reliable” badge.

**RR-06 — Explore**, then stage an optional interval mode only when its assumptions are specified:

- **Poisson count model:** an optional interval for integer event counts over fixed measured exposure. Record the model, level, and interval method. Repeated/correlated events and uncertain exposure can violate its assumptions.
- **Binomial proportion model:** relevant only after eligible-entity/subset semantics are established. It is not the default for arbitrary events per population.
- **Estimated population denominators:** retain supplied uncertainty metadata; do not pretend a count-only interval includes denominator error.
- **Ranks:** descriptive order is not a probability that one underlying rate is greater than another. Do not generate “significant hotspot” language.

For a proposed two-sided 95% exact Poisson interval with zero events and known exposure D, the upper count endpoint is −ln(0.025). The upper rate is therefore scale × −ln(0.025)/D, not zero. This follows by solving the Poisson zero-count probability exp(−μ) = 0.025 using the documented probability model. [S15] It is an analytical test anchor for the later interval milestone, not an interval computed by the current application.

## 5. Full analyst flow

### 5.1 Create the analysis

Use “Regional rate comparison” as an analysis creation action. Keep Map’s ordinary count/sum/average setup available. The creation panel uses compact rows, shared field pickers, and short sections matching docs/ui-defaults.md.

The analyst chooses an input arrangement:

- **Events + exposure.** One event per source row, counted once, plus a separate exposure table. Each input-stage row must refer to exactly one original event occurrence from the declared event source, and no occurrence may appear twice. An expanded duplicate or a collapsed multi-event row violates this mode.
- **Prepared regional totals.** One authoritative nonnegative safe-integer count per region-period-population, with exposure and coverage in that table or in a separate exposure source. Both roles may refer to the same source stage, but the role evidence remains separate.

Choose the numerator label and counting rule, exposure field and unit, multiplier, keys on each input, common population definition, time window, and boundary set/version. The unit preview updates immediately: “requests per 1,000 residents, Oct 2026” or “failures per 10,000 machine-hours.”

Use source metadata when present. If a fact is supplied by the analyst, retain its assertion text and provenance. “Declared by analyst” and “read from source metadata” must not look identical.

### 5.2 Review alignment

Before creating the saved comparison, show a compact readiness table:

- Expected region groups and groups observed on each input.
- Typed key agreement and unmatched key samples.
- Denominator uniqueness and conflicting values.
- Numerator and denominator windows and population descriptions.
- Boundary identifiers and vintages.
- Complete, partial, unknown, or absent collection coverage.
- Loaded versus unavailable sources.
- Geometry groups without a result, and results without geometry.

Selecting an issue shows the actual source candidates. The review says **“Aligned under the declared contract”**, not “proven comparable.” Matching metadata is evidence about compatibility, not proof that either source is correct.

Users can save an analysis with unavailable cells so it can document gaps. Creating it does not require deleting those cells. A structurally invalid definition—missing required field, invalid date order, unknown stage, or cycle—cannot be evaluated and should be corrected before applying the edit.

### 5.3 Compare and inspect

Open a saved layout with:

- A region map with a short quantity selector: Rate, Events, Exposure.
- A ranked comparison with N, D, rate, and status available.
- A persistent scope line naming the time window, population, boundary version, and numerator restriction.
- The existing Rows drawer for exact result rows; the existing trace surface for supporting source records.

A normal click selects a **semantic region group**. Alt-click or Alt-Enter opens its evidence. Empty plot space clears that view’s selection. Keep keyboard navigation and header actions. Do not introduce mark-level “Inspect” buttons or a permanent side panel for temporary inspection. These follow the supplied UI defaults. [R01], [R04]

The trace has three compact sections or tabs:

1. **Calculation:** observed numerator, known numerator if available, denominator, scale, exact equation, output unit, status, and any interval method.
2. **Inputs:** separately navigable event/numerator and exposure records, source names, raw/prepared values, included/excluded status, duplicate candidates, and upstream-stage navigation.
3. **Alignment:** group tuple, time support, population/cohort, boundary and source vintages, coverage proof, availability, and source revisions.

A coverage-backed zero shows an empty numerator contributor list and the actual exposure/coverage records. It must not fabricate an event row.

### 5.4 Change scope knowingly

A numerator subtype control updates its bound filter, reevaluates the query, and keeps the population fixed. A period control offers supported complete windows. A partial date brush on raw events can inspect those events, but cannot quietly redefine a complete-period rate.

Selecting regions changes the comparison group set and a selected-set pooled summary. It does not change any selected region’s own denominator. The scope line makes that distinction visible.

### 5.5 Capture and reopen a notebook

A notebook finding references the query/step and a typed region group or explicitly selected group set. It requests a region rate, numerator, exposure, or **pooled** result. Its rendered value and trace share the evaluator result.

Save the query definition once, view bindings, geometry reference, legend policy, notebook text, and any deliberately saved group selection. A transient chart click remains a view selection under the existing notebook behavior; only an explicit “use this selection in the finding” action creates a persistent semantic binding.

On reopen, source files are resolved, source availability is checked, and the query is reevaluated. A missing events file makes the finding unavailable even if yesterday’s coverage declaration said collection was complete.

## 6. Meaning: three different kinds of ratio

**RR-07 — Build explicit measure kinds.** The first implementation supports crude population rates and event intensities. A future proportion mode needs an additional identity/subset contract.

| Meaning | Valid interpretation | Required condition |
| --- | --- | --- |
| **Proportion** | Fraction of eligible entities with a property or outcome; usually displayed as percent. | Numerator entities are a subset of the same denominator population, with the intended once-per-entity rule. N ≤ D is necessary but does not prove this. |
| **Event intensity** | Events per measured exposure, such as failures per machine-hour or calls per occupied bed-day. | Exposure covers the opportunity/time represented by those events. Repeated events can be legitimate. |
| **Crude population rate** | Events during a named period per reference population, such as requests per 1,000 residents. | The geographic population and period are appropriate for the numerator; the population estimate and reference convention are declared. |

CDC’s frequency-measure definitions distinguish an eligible-person proportion from a person-time rate. SEER’s crude-rate tutorial requires matching geography, population categories, and years. [S08], [S09] Applying that distinction to nonmedical service events is a product design inference, not a claim that the events represent disease risk.

A crude rate is not adjusted for demographic composition. “Crude” means that no standard population or stratified adjustment has been applied. It may support descriptive comparison while differences in composition remain important. Age standardization is a separate later method.

Population is often a **stock** measured or estimated at a reference date; person-hours are an **exposure accumulated over an interval**. Do not silently multiply a population by elapsed days or interpret it as exact person-time.

For a group g:

\[
r_g=s\,\frac{N_g}{D_g},
\qquad s>0,\quad N_g\ge0,\quad D_g>0.
\]

The numerator may be an event count greater than the number of residents. That does not by itself invalidate an event-per-population reading; it invalidates a claim that this is a proportion of residents. Do not cap such rates at 100% or label them as percentages.

## 7. Grain, identity, and alignment

### 7.1 The comparison group

The semantic group is a typed tuple:

~~~text
(region key,
 boundary set and boundary version,
 interval start and exclusive end,
 population/cohort key,
 declared stratum keys)
~~~

The measure definition also names the numerator unit, exposure kind/unit, multiplier, and selected exposure-series vintage. Those are part of the calculation’s compatibility signature. Do not make two conflicting population estimates “unique” merely by silently splitting them into different vintage groups.

M1 has no stratum dimension: its population key names one declared population. The stratum components above are the explicit M2 extension, requiring corresponding mappings on both inputs.

The M1 numerator branch is declared for that one population and boundary version. A source containing several populations or boundary versions must first use an explicit, traceable upstream scope filter. Unexpected incompatible numerator records reaching the declared branch block the affected comparison; they are not silently discarded. Event timestamps are then evaluated against the saved window. The denominator branch can contain multiple supported grains and selects the exact requested grain before checking uniqueness, as specified below.

Use a canonical structured serialization of typed components. The string "1", the number 1, and the boolean true are different keys. Leading zeros in "01" are meaningful. Reject null, missing, objects, and nonfinite numeric region keys. Any key preparation is an explicit upstream step whose original values remain traceable.

A geographic join must use the same declared boundary system and version. Census explicitly warns that a GEOID can remain unchanged after a boundary changes. Population-estimate vintages can also revise earlier values and geographic definitions; Census advises against mixing separate vintage series. [S10], [S11], [S14]

**RR-08 — Build** pinned boundary identity and explicit time/population support. Pan and zoom alter presentation only. Changing from countries to states is a new analysis scope with matching numerator/exposure sources, not automatic map detail.

### 7.2 Time support is not a date label

Persist both the analysis window and the meaning of the denominator’s time metadata:

- Event timestamps are included in a half-open interval **[start, end)**.
- The first release uses explicit ISO boundaries with a saved UTC convention. Local business-day intervals must be prepared or explicitly represented; do not infer a timezone from the browser.
- A measured exposure has an actual coverage interval.
- A reference population may have a reference date and a declared period for which it is used. Its July 1 reference date does not itself have to equal the event interval endpoints.
- An estimate series has a source release/vintage distinct from its geographic boundary version.
- A five-year population characteristic estimate is not automatically the final year’s population. Census gives specific cautions about treating ACS period estimates and comparing overlapping or differently sized periods. [S11]

M1 supports exact declared windows and source-supported reference-population conventions. It does not prorate annual exposure for a date brush. If a shorter event window has no appropriate exposure and coverage support, the rate is unavailable.

### 7.3 Denominator uniqueness

**RR-09 — Build strict uniqueness by full grain.**

For a given compatible group, require one authoritative exposure observation. More than one row is a duplicate-grain condition even when the numeric exposure agrees. Two different exposure values are a conflict.

First select the requested full grain. A source can legitimately contain other periods, populations, and boundary versions: those rows are excluded and traceable, not duplicates of the requested cell. If no exact candidate exists, report the relevant mismatch and show nearby candidates. If one exact row and several unrelated-period rows exist, the exact row remains usable. Do not invalidate a whole multiyear source merely because it contains more than the requested window.

Default handling:

- One positive finite value: valid exposure candidate.
- No row: missing exposure.
- One row with null/missing value: missing exposure value.
- Multiple identical candidates: unavailable duplicate grain, with all candidates visible.
- Multiple conflicting candidates: unavailable conflict, with all candidates visible.
- Equal-valued rows for **different** disjoint regions or exposure intervals: independent observations; do not deduplicate merely because values match.

A later explicit **collapse identical** preparation may accept repeats only after validating agreement on exposure, unit, population, interval, boundary, coverage, and relevant source metadata. It records every backing row, one deterministic arithmetic representative, and the represented membership. It never chooses max, first, last, or average as an implicit conflict resolution.

### 7.4 Repeated exposure on event rows

Suppose three events in A each carry population 100. Their correct per-100 population rate is 3, not 1. Summing the three copied populations would create denominator 300.

Do not guess that a field is repeated exposure. Offer an explicit preparation action:

1. Name the full regional exposure grain.
2. Verify agreement across every candidate row at that grain, before a transient event subtype filter.
3. Materialize one exposure observation with its complete backing lineage.
4. Require independent coverage/domain evidence for regions with no events.

A repeated value on event rows cannot establish the existence of a zero-event region, because no event row carries that region. It also cannot demonstrate collection completeness. M1 accepts a separate authoritative exposure table or prepared regional rows; this extraction is a subsequent feature.

### 7.5 Source identity

Each input occurrence retains its existing sourceId and rowKey, plus the evaluation/source revision. Role evidence identifies whether it supplied an event, a prepared numerator, an exposure observation, or coverage.

If a source has a unique stable entity key, that reference can be resolved after a refresh. If sourceReferences falls back to row position, the reference is valid **within that source revision**. Recompute evidence on refresh and label old record links as stale when they cannot be resolved. Never save provider __ID as a durable cross-source identity. [R07]

Group selection is different: the group tuple can survive changed event membership, including a transition from one event to zero. This bounded stability does not require implementing a universal saved-record-selection proposal first.

## 8. Availability, coverage, and exact contributor sets

### 8.1 Coverage is independent evidence

**RR-10 — Build.** Distinguish the state of the source read from what the source says about collection.

A source may be successfully loaded and empty. That proves only that this supplied table has no event rows. Complete collection requires a source field or a scoped analyst assertion covering the region, interval, population, and admitted event categories.

Use four observation states: **complete, partial, unknown, not collected**. Record the source of the assertion, its scope, optional as-of date, and note. An “all admitted event types” assertion supports later subtype filtering only within that admitted collection definition.

- Complete + loaded + zero eligible event rows + positive exposure can produce **N = 0, rate = 0**.
- Partial or unknown coverage preserves an **observed numerator**, but the full-window numerator and rate are unavailable.
- Not collected is explicit absence of observation, not a measured zero.
- Missing/unreadable source overrides a previously complete declaration.
- The last event timestamp is not a coverage endpoint. A region can have no events long before collection ends.
- Geometry and a population row establish geography/population candidates; neither establishes event collection.

Coverage may initially live on the denominator row or in an independent saved assertion applying to each declared comparison grain. A denominator-field declaration cannot prove coverage when its row is absent; an independent assertion can establish a known N even when D is missing. This is a deliberate two-input boundary, not a claim that population agencies know the analyst’s event collection. The UI labels that field **event collection coverage**, separately from exposure support.

### 8.2 Input policy

| Input condition | Arithmetic outcome | Evidence and user reading |
| --- | --- | --- |
| Finite nonnegative event count; positive finite exposure; complete aligned support | Compute rate. | Both contributors and declarations remain inspectable. |
| Zero events in event mode with complete loaded collection | N = 0; rate = 0. | Empty event contributor list; actual exposure/coverage evidence. |
| Missing prepared numerator | N unavailable; rate unavailable. | An absent aggregate is not an observed zero. Require an explicit prepared 0. |
| Negative numerator | Block that group. | Preserve raw value and reason; do not silently sum only the positive rows. |
| Invalid/nonfinite numerator | Block that group. | A valid subtotal may be shown as observed evidence, clearly not a complete N. |
| Fractional prepared “event count” | Reject under an integer-event-count contract. | A different weighted amount requires a deliberately different measure meaning; do not relabel it as events. |
| Exposure = 0, even with N = 0 | Rate unavailable. | D = 0 remains visible. Neither infinity nor 0/0 becomes a valid number. |
| Negative exposure | Rate unavailable. | Candidate is visible but not an arithmetic contributor. |
| Missing/null exposure or no exposure row | Rate unavailable. | Distinguish missing value from missing group. |
| Invalid/nonfinite exposure | Rate unavailable. | Preserve parsing/conversion failure. |
| Duplicate or conflicting exposure grain | Rate unavailable by default. | Show all candidates, including agreeing duplicates. |
| Misaligned period, population, boundary, or unit | Rate unavailable. | Successful region-key matching does not override the mismatch. |
| Coverage partial/unknown/not collected | Full N and rate unavailable. | Observed N may remain visible; D may still be valid and inspectable. |
| Source unavailable | Rate unavailable. | Loaded-empty and failed-read remain different. |
| Nonfinite final arithmetic | Rate unavailable. | Report overflow/underflow policy explicitly; do not emit JSON Infinity/NaN. |

Use the repository’s valueParsing functions and field preparation conventions, not ad hoc Number(value) or Date.parse. The new rate validator is stricter than the generic aggregate’s policy of excluding some invalid numeric inputs: silently dropping an invalid denominator or prepared count would create a misleading complete result. Reuse reduction **after** eligibility/validity is established. [R01], [R03], [R07]

For M1, prepared event-count totals are finite nonnegative integers within a supported exact range. Measured exposure can be fractional. Large counts exceeding safe integer arithmetic require an explicit unsupported-size diagnostic or a later exact-integer implementation; rounding them into apparent precision is not acceptable.

### 8.3 Output universe and unmatched records

The computation emits the union of valid typed region keys present on either input, within the requested fixed scope. Explicitly requested regions also remain resolvable as unavailable placeholders when their input records are missing.

- Denominator-only group + complete event collection: valid zero **in event mode**.
- Numerator-only group: observed/known numerator with missing exposure, unavailable rate.
- Prepared numerator missing: unavailable, even if an unrelated denominator record says complete.
- Invalid keys and records that cannot be assigned to the declared scope remain in an unmatched-candidate ledger.
- Geometry-only regions draw a named unavailable state and appear in reconciliation. They are not silently admitted to a valid pooled comparison.
- Results without geometry remain in the table. Geometry absence prevents drawing the map, not computing an otherwise valid rate.

Geometry is a consumer of the declared group domain. It is not secretly an exposure source. The pure computation can be used without a map; a map adapter can request placeholders for selected geometry keys without manufacturing N, D, or coverage.

The ledger alone is insufficient for ambiguous numerator membership. An in-window event with a missing/invalid region key can belong to any candidate region: block every potentially affected complete numerator until it is corrected or explicitly excluded under a recorded eligibility rule. An invalid timestamp with a known region blocks that region when membership in the requested window cannot be established. An event conclusively outside the requested window does not contaminate that window merely because its region key is malformed. A valid unmatched key E is different: retain E as its own unavailable group without making attributable A/B events unknown.

### 8.4 Preserve four kinds of membership

The rate result should retain these sets, not one flattened row-ID list:

1. **Numerator candidates:** in-scope input occurrences considered for the group, plus individually identified rejected candidates.
2. **Numerator arithmetic contributors:** the occurrences supplying the count or accepted prepared total after the declared numerator restrictions.
3. **Exposure candidates:** every candidate observation for the full group, including duplicates/conflicts.
4. **Exposure arithmetic contributors:** the single accepted observation, or the explicit preparation representative with its complete represented membership.

Coverage evidence has its own source references or authored assertion. It is not an event and does not inflate the numerator or denominator.

For a group g with valid event contributors C_N(g):

\[
N_g=\sum_{i\in C_N(g)}1.
\]

For prepared counts, substitute the validated count value n_i. In the first prepared-table mode, one row per full grain is required; the “sum” operation is its numeric projection, not permission to combine duplicate regional totals.

For exposure contributors C_D(g), M1 requires exactly one validated observation:

\[
D_g=d_j,\qquad C_D(g)=\{j\}.
\]

Candidate membership is preserved even if arithmetic is unavailable. This is why “show me all rows considered” and “show me the rows used in this number” are separate trace readings.

Apply input filters before computing accepted contributors, but retain their excluded source references through the branch/stage context. An upstream filter is part of the saved input contract; excluded records must be reachable through prior-stage navigation even when they are not materialized in every rate cell.

A subtype-filtered A in the canonical example has numerator contributors a01–a03, exposure contributor dA, and a04–a12 excluded by the subtype restriction. The denominator membership is identical before and after filtering.

## 9. Pooled rate, mean rate, and compatible populations

**RR-11 — Build an explicit pooled operation.** Never aggregate precomputed rates as if they were additive totals.

For a requested set G of compatible, disjoint regions:

\[
R_{\mathrm{pooled}}=s\,\frac{\sum_{g\in G}N_g}{\sum_{g\in G}D_g}.
\]

The arithmetic mean is:

\[
R_{\mathrm{mean}}=\frac{1}{|G|}\sum_{g\in G}r_g.
\]

The pooled result weights regions by exposure. The mean gives each region equal weight. Neither is a universal replacement for the other; the primary summary of combined events and exposure is the pooled rate.

### Exact canonical example

- A: 12/1,200 × 1,000 = 10.
- B: 8/200 × 1,000 = 40.
- A+B pooled: 20/1,400 × 1,000 = **100/7**.
- Mean of A and B: (10+40)/2 = **25**.
- A+B+C pooled: 20/1,800 × 1,000 = **100/9**.
- Mean of A, B, C: (10+40+0)/3 = **50/3**.
- A+B+C+D requested: **unavailable** under the default strict policy, because D lacks complete observation.

A user can explicitly choose A+B+C and obtain its valid pool. The UI must say that is a chosen subset; it must not quietly drop D while labeling the result “all regions.” The visual companion uses this explicitly named subset.

### Exact pooled membership

The pool records, or resolves through its immutable result context:

- requested group keys;
- resolved keys, including unavailable groups;
- accepted keys;
- event contributor union;
- exposure contributor union;
- excluded groups and reasons;
- compatibility signature and source revisions.

M1 uses **all requested groups must be available**. A future valid-subset option must be deliberate and report its omissions. Clearing a selection means the declared comparison domain, not an invented empty set with rate zero. An intentionally empty requested set has no pooled rate.

Require mutually exclusive regional populations at the same window, population definition, boundary system, and exposure unit. A parent region and its child regions overlap; they are not a valid additive pool. Duplicate polygons forming one multipart region are one group, not overlapping exposure observations.

### Facets and time are not automatically additive

- **Event-subtype facets:** each subtype may use the same regional population. Their denominator is repeated for comparison, not duplicated exposure. M1 does not pool such facets. A later combined-subtype action must union eligible events, verify category overlap semantics, and count the population once.
- **Population-stratum facets:** exposure can be added only when the strata are declared disjoint and align with the numerator. “All residents” plus “adults” is an overlapping pool.
- **Measured person-time:** disjoint intervals can be additive when units and collection support agree.
- **Population snapshots:** summing successive monthly stocks is not automatically a combined resident population. An annual-average or population-time construction must be explicit, with interval weights and approximation status.
- **Overlapping rolling windows:** counts/exposure cannot be added without overlap-aware membership. Defer automatic pooling of these windows.

These are computation rules, not merely tooltip caveats.

## 10. Filter and selection contract

**RR-12 — Build explicit input ownership.** A filter is legitimate because of its role and population meaning, not because two tables happen to have a column with the same name.

| Action | Numerator and exposure behavior | Required visible result |
| --- | --- | --- |
| Choose event subtype | Filter event contributors only. Keep the region’s population/exposure fixed. | Label “repair events / all residents”; require subtype coverage within the admitted collection definition. |
| Choose complete supported period | Apply the same interval contract to event and exposure inputs. | Reevaluate coverage and alignment; preserve a common legend when comparison scope includes those periods. |
| Brush a partial date window without matched exposure | Raw-event inspection may narrow. The full-period rate cannot be reinterpreted. | Show unsupported window / unavailable rate, or keep the saved rate scope visibly unchanged. No silent prorating. |
| Select one or more regions | Select semantic groups and resolve both source roles. Per-region N/D stays unchanged. | Pooled summary uses those requested groups; no-event groups remain selectable. |
| Filter a shared population stratum | Allowed only through declared corresponding numerator/exposure mappings. | Revalidate cohort, denominator grain, and coverage; otherwise unavailable. |
| Facet by event subtype | Each panel changes N and reuses the same applicable D. | State fixed exposure; do not sum facet denominators. |
| Facet by population stratum | Use matching stratum-specific N and D. | Reject missing/overlapping denominator strata for a combined pool. |
| Filter an exposure-only field | No automatic event predicate is implied. | Treat as a declared scope/definition edit or result-group restriction, with evidence. |
| Filter/sort result rows by rate or exposure | Change which result groups are displayed/selected, not their arithmetic. | Label the result filter; a selected-set summary names its members. |
| Search the Rows table | Local inspection only. | No effect on rate computation or coverage. |
| Pan, zoom, or change projection | No source filtering or geographic-grain change. | Same rates and denominator scope. |
| An arbitrary raw-row selection | Do not apply global numeric IDs across sources. | Require a declared input-role binding; unsupported selections remain inspection-only. |

### The bounded integration with linked views

The current DataLayerProvider manages one row table and its linked Crossfilter state. It should not be made to infer two-source filter semantics from ordinary chart filters. [R13]

Prepared one-row-per-region totals do not contain event subtype membership. Reject a subtype request for that input mode unless a later declared subtype grain supplies the required numerator totals and exposure policy. Filtering a prepared aggregate row is a result-group filter, not a reconstruction of the underlying events.

M1 projects each rate group into one result row. Map, rank, and table therefore share normal linked **group** filtering. Dedicated comparison controls change the saved/bound numerator input predicate and trigger query reevaluation. Raw event/exposure records are opened through the role-aware trace.

A host that also draws raw-event charts can opt into a typed bridge:

- Event-chart predicate → explicitly registered numerator scope.
- Group selection → group keys plus separately source-qualified numerator/exposure references.
- Unsupported predicate → a visible unsupported-scope diagnostic.

Do not promise automatic crossfiltering between unrelated provider tables. Avoid a global cross-source row-ID namespace or implicit join-based filter propagation.

### Zero-event selection

**RR-13 — Build semantic group selection.** Store the selected ComparisonGroupKey independently of the event contributor set.

Selecting C:

- highlights C on the map and in the ranked/table view;
- produces numerator records [];
- produces exposure records [dC];
- retains complete coverage evidence;
- yields N = 0 and rate = 0;
- survives an event refresh with no C rows.

Selecting D is equally possible, but the selected rate remains unavailable. Selecting a geometry-only region retains an unresolved/unsupported group selection with its reason. A missing input row is not grounds to silently clear the user’s selection.

Existing numeric provider IDs may be used transiently to connect rendered result rows to that group key. They are not saved as source identity.

## 11. Color domains for rates

**RR-14 — Build an explicit reference domain.**

The baseline region map’s count/sum/average envelope is operation-specific. For arbitrary ratios, a falling denominator can increase a rate without any finite global bound. Copying the scalar envelope would be incorrect. [R04]

A useful **limited proof** applies in M1: for a nonnegative event subset and the same positive exposure,

\[
0\le N_{\mathrm{subset}}\le N_{\mathrm{reference}}
\implies
0\le sN_{\mathrm{subset}}/D\le sN_{\mathrm{reference}}/D.
\]

Therefore a fixed reference maximum over all valid, unfiltered groups at the saved scope safely contains numerator-only subtype filters. It does not automatically contain a different population, denominator vintage, period, or refreshed dataset.

### Default presentation

- A sequential ramp begins at zero; invalid/unknown cells use named patterns and status text.
- Capture the upper reference bound over the declared valid comparison cells, using unfiltered event eligibility at the fixed denominator scope.
- Save the reference scope and captured bound with the view. Do not save process-local WeakMap revision numbers as durable dataset fingerprints.
- Apply identical bounds to comparable panels/facets. The selected group set does not rebase the legend.
- On refresh, retain the saved bounds and report over-range values in the legend/trace/table. A deliberate **Rebase reference** action captures new bounds and is one undoable settings change.
- A manually fixed domain remains fixed until edited.
- When all valid reference rates are zero, render a zero-only state/legend; do not invent a meaningful positive upper data value.
- Count, rate, and exposure displays have different units and references. Switching quantity must switch the legend and its label.

An over-range value can use the top fill **with an explicit overflow indicator** and its true number; it must not be silently clipped into apparent equality. If comparison metadata changes, mark the old reference incompatible until it is deliberately replaced.

Continuous color is a reasonable first release. Shared equal-interval or manual breaks can follow. Avoid independently recalculated quantiles or Jenks classes across comparison panels. ArcGIS’s classification documentation gives the relevant comparison cautions. [S03]

A future verified proportion mode can use [0, scale] because its subset semantics provide a real upper bound. That bound does not apply to arbitrary event intensity or crude population rates.

## 12. Saved model, API, and computation seams

The companion **proposed-contract.ts** supplies self-contained proposed types and example definitions. It is a contract for review, not a patch or a claim that those exports exist at the baseline.

### 12.1 Canonical ownership

**RR-15 — Build one definition in the project query.**

~~~typescript
interface GroupedRateStep {
  id: string;
  kind: "grouped-rate";
  numeratorStepId: string;
  denominatorStepId: string;
  specification: GroupedRateSpecification;
}
~~~

The specification contains the rate meaning, scale, exact window, population definition, boundary reference, input mappings, exposure unit, denominator policy, and collection coverage. Prepared inputs may refer to the same predecessor twice; dependency traversal deduplicates execution, not the two evidence roles.

The output uses ordinary scalar columns for the group key, N, D, rate, and readable status. Runtime evidence carries the role-specific original references. Do not serialize all event rows into every chart setting.

A Map binding names queryId + stepId and the displayed quantity. It does not contain another copy of the rate specification. The ranked view and notebook refer to the same result.

Keep the current project file envelope and version for old projects; add an explicit version to the owned rate specification. Older readers that do not understand grouped-rate must reject it clearly. They must not ignore the step and draw a different analysis.

### 12.2 Minimal modules

Prefer a handful of narrowly scoped modules:

| Proposed module | Responsibility | Reuse boundary |
| --- | --- | --- |
| lib/rates/types.ts | Specification, status/evidence, result, scope types. | Reuse AnalysisSourceReference and scalar/project types. |
| lib/rates/evaluateGroupedRate.ts | Validate grain, align inputs, establish coverage-backed N/D, produce groups and role evidence. | Reuse valueParsing, finite reductions, typed-key conventions; retain rate-specific strictness. |
| lib/rates/poolRateGroups.ts | Resolve requested semantic groups and pool disjoint contributors under the strict policy. | Follow the existing poolAggregateRows principle of recomputation from contributions. |
| lib/analysis/stepInputs.ts | Enumerate zero, one, or two input dependencies. | Share across evaluator, validation, closure, DSL, and revision dependency discovery. |
| lib/rates/resultAdapter.ts | Project group rows and resolve row IDs/group keys/evidence. | Thin bridge to current chart/provider/trace machinery. |
| components/charts/Map/rateMapPlan.ts | Bind computed values/statuses to geometry and a declared color reference. | Reuse projection, geometry grouping, path planning, accessibility, pan, and trace surfaces. |

A UI editor and a rate trace component are ordinary feature files, not additional semantic engines. Avoid extracting a broad framework merely because several small helpers share a folder.

### 12.3 Evaluation contract

Keep the existing evaluateAnalysisQuery API compatible. Add optional evaluation context as a fifth argument, leaving its fourth bindings argument intact, or introduce an explicit compatible overload. That context carries source availability and the narrowly supported rate scope.

Inside the evaluator:

1. Resolve both input stages using the shared dependency helper.
2. Check upstream blocking diagnostics before interpreting empty frames.
3. Read prepared field values with existing parsing rules.
4. Validate complete keys, support windows, population/boundary/unit compatibility, and exposure uniqueness.
5. Build the region-group union and explicit requested placeholders.
6. Evaluate numerator occurrence counts or prepared totals.
7. Apply coverage and availability to determine known N and valid D independently.
8. Compute a finite quotient only for available groups.
9. Emit ordinary output rows plus rate evidence and role counts.
10. Include both branches, bindings, availability revisions, coverage/specification, and relevant source metadata in invalidation.

Do not present AnalysisStage.inputCount or the first source’s overall count as a combined count of both sources. Add input-role counts to the rate stage while preserving existing fields for other operations.

### 12.4 Workers and cost

The supplied evaluator is synchronous; worker implementation files are outside the packet. The proposal is to reuse the repository’s actual worker request/cancellation mechanism **after Codex inspects it**, not to claim an existing two-input worker protocol.

The core should remain pure and serializable. A worker request can contain query/specification, both input revisions/frames, explicit availability, and scope. A response carries result revision, scalar group outputs, diagnostics, and evidence references. Stale responses must be rejected when either input or the specification changes.

Expected algorithmic shape is one indexing pass over each input, plus group construction: O(E + D + G), excluding rendering and evidence pagination. This is a design target, not a measured benchmark. Avoid scanning the exposure table for every event, copying whole raw rows into each group, or retransmitting unchanged source arrays on every pointer interaction.

Materialize source references lazily for large trace tables if needed, while retaining exact counts and deterministic membership. Do not sample the rate calculation. The fixture oracle is intentionally small and makes no performance claim.

### 12.5 No dependency on pending proposals

The independent seam is the query step plus result adapter. A later reusable-output system can adopt that result contract. A later quantity system can provide richer unit metadata. Neither is required to ship a valid local comparison now.

## 13. Notebook, text, host callbacks, and refresh

### 13.1 Notebook and query integration

**RR-16 — Build a rate finding that consumes the evaluated result.**

The current share finding checks row-ID containment between count findings. That is appropriate for its existing meaning, but dividing one event finding by an unrelated population finding would bypass exposure grain, coverage, and alignment. [R09]

Add a RateFinding with:

- queryId and grouped-rate stepId;
- requested quantity: rate, numerator, or exposure;
- an explicit group set or an opt-in named chart selection;
- summary semantics: single group or strict pooled disjoint regions;
- formatting digits;
- a reference to the same result/evidence context used by the chart.

A single-group request can use the pooled operation with one member. An arithmetic mean of region rates is a separately named later statistic; it is not an M1 default or an alternate implementation of pool.

The rendered finding must show unavailable status and its reason when the requested quantity cannot be supported. Quantity validity is independent: D’s exposure can still render as 500 while its rate is unavailable. For a requested all-region pool, known exposure can remain inspectable even when unknown collection prevents a complete numerator/rate. Do not label a partial observed numerator “total events” without qualification.

Extend readNotebookText to retain the full AnalysisEvaluation, bindings, diagnostics, and source availability as runtime context while keeping scalar rows for existing notebook compilation. Both resting and interactive finding evaluation call the same rate adapter. Do not create one arithmetic path in findings.ts and another in the map.

The current reader chooses a single query for the notebook. That is enough for M1: the query’s result feeds all rate views. A general multi-query notebook dependency system is outside this proposal.

### 13.2 Text must preserve the same calculation

Project text, project JSON, dashboard settings, and notebook text have different owners:

| Stored object | Canonical contents | Required round trip |
| --- | --- | --- |
| Project query | Both input stages and full grouped-rate specification. | JSON → text → JSON preserves all semantic fields, typed values, and dependencies. |
| Chart settings | Query/step binding, geometry reference, displayed quantity, group selection, presentation/reference scale. | Settings restore keeps the same result binding and color meaning. |
| Notebook | Query choice/bindings, chart declarations, prose, rate findings and explicit saved selection bindings. | UI edit → text writeback → recompile produces the same analysis. |
| Runtime | Loaded tables, availability, evaluator/worker revision, computed evidence. | Recomputed on reopen/refresh; not copied into every saved chart. |

The proposed step’s text form must explicitly name **both** predecessors. It must never infer the exposure input from the previous statement or from a default from= chain.

A readable author form can use bounded child declarations for meaning, window, population, boundary, numerator mapping, exposure mapping, and coverage. The implementation plan requires complete golden parse/export cases derived from the two TypeScript examples. The TypeScript companion is the semantic authority for fields; no new DSL syntax is claimed to run on the baseline.

Requirements for the parser/exporter:

- Distinguish field references from literal metadata; quoted “population.region” as a literal is not automatically a field.
- Retain explicit scale, units, time convention, support-window mapping, reference date, estimate vintage, boundary version, and collection assertion.
- Round-trip numeric 1, string "1", boolean true, null settings where allowed, and escaped labels without collapsing types.
- Reject unknown specification versions and invalid semantic settings with a useful span.
- Validate both referenced predecessors and cycles/closure.
- Keep defaults that change interpretation explicit. Display-only defaults may use existing omission conventions.
- For a scoped view export, retain both branches and their source data/path references.
- A failed edit or failed recompile restores the previous valid definition rather than persisting half an edit.

Use the existing writeBackChart strategy for presentation edits: splice where possible, rewrite the owned declaration when necessary, then recompile and compare. Query/specification edits need their own bounded writeback path. writeBackSettings currently visits chart changes, so it cannot be assumed to persist new query semantics automatically. [R08], [R12]

### 13.3 Embedded host behavior

**RR-17 — Build a coherent lifecycle.**

Keep the existing ExplorEda settings callback contract: onStateChange receives JSON settings, not raw rows. The new project/query definition belongs to the project-owning layer. If the existing project host API has a suitable mutation callback, extend it; if not, add an explicitly named project-definition callback. Inspect its actual source before choosing the final public prop name.

The review packet does not contain the complete project React component/public export surface. It would be misleading to claim that a particular new top-level prop already fits that component. The pure evaluator and result-adapter API are concrete; the public host wrapper is a narrow integration task identified in the implementation plan.

Acceptance behavior:

- Changing only a title, projection, quantity display, or legend setting does not mutate the rate definition.
- Changing numerator meaning, exposure field, population, or time support is a semantic project edit and reevaluates both relevant branches.
- A multi-control edit applies atomically; holdStateChanges or the project owner’s equivalent produces one history checkpoint.
- Escape cancels the draft without a callback for a half-valid analysis.
- Mount, restore, worker completion, or source refresh does not report a user settings edit merely because runtime evidence changed.
- Echoing an unchanged saved value must preserve the provider’s fingerprint behavior and avoid a restore loop.
- The host receives separately typed source references for event and exposure inspection, never a bare numeric ID that could refer to either table.
- The same definitions and result semantics work in a local folder or embedded React host.

A settings-only export cannot reconstruct raw two-source evidence by itself. In that context, either the host supplies the matching project/tables/runtime context or the bound rate view reports that its source context is unavailable. Do not downgrade to arithmetic over cached visible columns.

### 13.4 Refresh and folder reopen

Refresh invalidates a rate when either input changes, when availability changes, or when a semantic specification/binding changes. A denominator-only update must update the map, table, pool, and finding even if the event array is identical.

Use replacement arrays under the current immutable-table revision convention. Source revision strings used for runtime consistency are not automatically durable fingerprints. On reopen, recompute the result from current inputs and retain a human-readable source identity/release alongside any saved reference-domain metadata.

Required reopen sequence:

1. Read project definitions and source declarations.
2. Resolve and load every dependency from both branches.
3. Preserve missing/unreadable status separately from an empty successful read.
4. Validate the rate specification and current field metadata.
5. Evaluate both stages and the grouped rate.
6. Reconcile saved semantic group selections to the current scope.
7. Recompute notebook findings.
8. Apply saved presentation/reference bounds and disclose any changed or over-range result.

A missing selected group remains an unresolved selection with an explanation. Stable-key records are resolved by source-qualified identity; positional records get fresh references under the current source revision. No stale contributor list is presented as current evidence.

## 14. Exact fixtures and what was checked

The user-facing companions include:

- **regional-rate-fixtures.json:** original normalized input rows and authored exact expected results.
- **verify-fixtures.py:** a dependency-free Python Fraction oracle that computes from those inputs and compares values, status, memberships, and pooling.
- **fixture-guide.md:** complete case index, schema, canonical arithmetic, run sheet, and mapping to the proposed TypeScript vocabulary.

This fixture format is deliberately independent of AnalysisProject serialization. It uses denominator where the public proposal uses exposure and compact sourceId/rowId references where the runtime uses sourceId/rowKey. It is a test oracle, not a false claim that the baseline can import the proposed feature.

### Required cases and their exact anchors

| Requirement | Fixture anchor | Expected interpretation |
| --- | --- | --- |
| Count/rate rank reversal | RR-F01 | A count 12 > B 8; B rate 40 > A 10. |
| Prepared totals | RR-F02 | Same regional N/D/rates as the event-source arrangement; provenance stops at actual prepared rows. |
| Repeated denominator | RR-F03/F04 | Reject implicit repeated exposure; explicit extraction counts one exposure observation and preserves all backing members. |
| Conflicting denominator | RR-F05/F35 | No first/max/average choice; rate unavailable. |
| Identical duplicate | RR-F06/F07 | Reject by default; explicit identical-collapse policy is a separately tested later feature. |
| Valid zero events | RR-F08 | Loaded-empty + complete coverage + positive exposure yields 0. |
| Unknown or unavailable collection | RR-F09/F10/F22/F33 | Observed zero does not become known full-window zero; a failed source read blocks. |
| Zero/missing/invalid exposure | RR-F11–F15 | Keep the reason and candidate evidence; never manufacture rate 0. |
| Typed-key collision | RR-F16 | Number 1 and string "1" remain distinct groups and memberships. |
| Filtered numerator, fixed exposure | RR-F17 | A = 5/2, B = 10, C = 0 per 1,000; exposure contributors unchanged. |
| Window boundaries | RR-F18/F19 | Include start, exclude end; mismatch is not repaired by region-key equality. |
| Boundary/population mismatch | RR-F20/F21 | Matching identifiers alone do not make the comparison available. |
| Source-qualified identity | RR-F23 | Equal local row IDs in different sources do not merge evidence. |
| Invalid prepared numerator | RR-F24–F26 | Negative, invalid, and missing totals do not become a valid partial sum. |
| Select zero-event region | RR-F27 | Group selection persists with numerator membership [] and real exposure membership. |
| Denominator source disappears | RR-F28 | Do not reuse a cached healthy denominator. |
| Rate meaning | RR-F29–F31 | Event intensity may exceed one; a proportion needs actual subset semantics. |
| Decimal exposure | RR-F32 | Exact rational oracle; no binary-floating-point expected-value ambiguity. |
| Absent region in repeated exposure | RR-F34 | Extraction cannot invent exposure for a region with no source row. |

Additional edge cases and the final assertion count are recorded in fixture-guide.md. Cases for later extraction/proportion semantics are labeled as later-stage method anchors; passing the oracle does not imply those modes belong in the first public API.

The completed packet contains **46 cases and 2,849 exact scalar, membership, and shape assertions**. RR-F36–F38 cover count integrality and safe-integer limits; RR-F39–F42 cover unknown attribution, valid unmatched groups, invalid timestamps, and unrelated-period exposure candidates; RR-F43–F45 cover empty, repeated, and unresolved pooled selections; RR-F46 proves that a conclusively out-of-window orphan does not invalidate the requested interval.

### Executed versus proposed verification

**Executed for this delivery:**

- The supplied packet was parsed into all 34 complete files, preserving the named baseline.
- All 34 files were read across the source review; decisive model, map, persistence, and provider paths were cross-checked.
- Primary documentation was opened and the decisive passages checked.
- The independent fixture oracle was executed against authored expected values.
- Node 24's TypeScript syntax stripper parsed the contract, and its two exported configurations were evaluated. This checked syntax and example initialization, not TypeScript types or application integration.
- The original SVG design companion was rendered to PNG and visually inspected.
- Artifact consistency and ZIP integrity were checked before delivery.

**Not executed:**

- No repository build, pnpm check, Vitest suite, or browser interaction against explorEDA.
- No repository patch, commit, push, issue, or pull request.
- No performance benchmark or worker experiment.
- No proof that the proposed TypeScript/DSL contracts compile in the full application.

The implementation plan turns those unexecuted integration checks into explicit acceptance work. The packet is sufficient to choose the feature and its architecture; it is not sufficient to claim a running integration.

## 15. Ordered delivery stages

The separate **implementation-plan.md** provides worker tasks, exact source seams, acceptance tests, docs, examples, and risks. The staged product outcomes are:

| Milestone | Shippable outcome | Main risk |
| --- | --- | --- |
| **M1: complete bounded comparison** | One window/population/boundary; prepared or two-input sources; strict grain/coverage; map + ranked/table evidence; zero-event selection; basic rate finding; save/text/reopen/embedded path. | A finite quotient appearing valid after source or scope evidence was lost. |
| **M2: supported scope changes and preparation** | Multiple supported periods, matched population strata, explicit repeated-exposure extraction, deliberate identical-collapse, and scope-aware source controls. | Reusing the wrong exposure or adding the same population twice. |
| **M3: richer notebook comparisons** | Explicit selected-set comparisons, named reference scopes, live findings with reproducible semantics, and comparison summaries that state their member sets. | A chart selection changing a finding’s meaning without a visible binding. |
| **M4: declared uncertainty** | Optional method-specific intervals and precision-aware ranked views, retaining the raw descriptive rate. | Applying an interval model to unsupported event or denominator semantics. |

M1 is a substantial vertical slice. Its internal coding tasks may be separate PRs behind a feature gate, but a bare arithmetic helper or unfinished settings form is not a shippable analyst workflow. Each public feature milestone includes its docs page/section and a runnable example in the same milestone, as AGENTS.md requires. [R01]

No milestone waits on external adoption evidence. Methods verification for M4 is a technical requirement, not a demand gate.

## 16. Recommendation register

Stable IDs identify decisions for Codex review. “Build later” remains a Build disposition with an ordered scope.

| ID | Disposition | Decision and reason |
| --- | --- | --- |
| RR-01 | **Build** | Native saved regional comparison with a complete bounded first workflow. |
| RR-02 | **Build** | Small grouped-rate query primitive; shared evaluator/pooling/result adapter, not map-local division. |
| RR-03 | **Build** | Keep value, status, scope, and role evidence inseparable. |
| RR-04 | **Build** | Paired map and ranked evidence view, with unavailable regions retained. |
| RR-05 | **Build** | Visible N/D/coverage and precision basis from the first release. |
| RR-06 | **Explore** | Declared-model intervals; method validation precedes the M4 feature. |
| RR-07 | **Build** | Separate event-intensity and crude-population semantics; no automatic percent interpretation. |
| RR-08 | **Build** | Explicit population/time support and pinned boundary identity; zoom is presentation. |
| RR-09 | **Build** | One authoritative exposure observation per compatible full grain; strict duplicate/conflict policy. |
| RR-10 | **Build** | Explicit collection coverage and separate source availability; no event-timestamp inference. |
| RR-11 | **Build** | Strict pooled disjoint-region rate from exact contributor sets; never implicit mean of rates. |
| RR-12 | **Build** | Input-owned predicates and explicitly compatible scope changes. |
| RR-13 | **Build** | Semantic group selection independent of event-row membership. |
| RR-14 | **Build** | Shared captured reference color bounds, explicit rebase, and disclosed overflow. |
| RR-15 | **Build** | One project definition; both dependency branches in JSON/text/closure/validation. |
| RR-16 | **Build** | Rate findings read the same evaluated result; quantity-specific availability and evidence. |
| RR-17 | **Build** | Coherent host callbacks, refresh invalidation, and honest folder reopen. |
| RR-18 | **Build later** | Supported multi-period and stratum comparisons after M1’s fixed scope. |
| RR-19 | **Build later** | Explicit repeated-value extraction and identical-collapse with represented lineage. |
| RR-20 | **Explore** | Eligible-entity proportions with a genuine subset/identity contract. |
| RR-21 | **Defer** | Automatic smoothing, age standardization, and boundary crosswalk calculation; each adds independent methods. |
| RR-22 | **Defer** | Universal semantic/quantity/output platform; useful seams remain adoptable later. |
| RR-23 | **Avoid** | Silent zero imputation, exposure duplication, guessed filter propagation, automatic crosswalks, causal labels, or generic reliability thresholds. |

### Rejected shortcuts

- **Average row percentages:** changes the weighting and hides denominators.
- **Sum a looked-up population on event rows:** multiplies the population by event count.
- **Use max population to remove repeats:** hides disagreement and is not a uniqueness proof.
- **Infer collection end from the last event:** confuses absence of events with absence of observation.
- **Choose the first duplicate row:** makes source order determine the answer.
- **Let a successful key join approve comparison:** omits time, population, units, and boundary support.
- **Color every unavailable cell as zero:** turns missing knowledge into an apparent low rate.
- **Let zoom change countries into states:** changes the analytical population without a new rate definition.
- **Reuse ordinary share findings for exposure rates:** applies incompatible source-set semantics.
- **Save a final numeric table and call it reusable evidence:** loses the two-input calculation and refresh behavior.

## 17. Open questions with recommended defaults

These are implementation/product choices with usable defaults, not blockers requiring another research run.

- **How is complete collection asserted?**
  - Default: a coverage field per exposure grain, or a saved scoped assertion with source/provenance.
  - Do not create an ingestion monitor. A host can supply newer availability/coverage metadata.
- **What if source coverage is complete only for some event categories?**
  - Persist the admitted collection definition and validate numerator-only filters against it.
  - Unknown subtype coverage makes that subtype rate unavailable.
- **How much temporal flexibility ships first?**
  - Default: one explicit UTC window, with no implicit prorating.
  - Local calendars and partially overlapping support require an explicit later policy.
- **How are population estimates adopted for a window?**
  - Keep reference date, source release, boundary vintage, and chosen support convention distinct.
  - A declared approximation is visible in the trace; a missing convention is not guessed.
- **What source identity is required?**
  - Encourage stable unique keys. Allow occurrence references scoped to a revision when keys are absent.
  - Do not claim old positional records can be recovered after refresh.
- **Where does the embedded callback live?**
  - Prefer the existing project owner’s definition callback after inspecting the omitted public wrapper.
  - Keep existing settings-only onStateChange intact.
- **How should uncertainty enter later?**
  - Start with an opt-in count/exposure interval under a declared model and exact method tests.
  - Source-provided denominator uncertainty needs a separate propagation decision.
- **Can a geometry revision be substituted automatically?**
  - Default: no. New geometry/vintage requires an explicit compatibility decision and new reference basis.
- **Should a rate-ranked view auto-sort after filtering?**
  - Default: update values and order after a committed scope change, preserving selected group keys and focus.
  - A fixed baseline order can be a saved presentation option for before/after comparison.
- **Can the analyst view known exposure while the rate is unavailable?**
  - Yes. Use quantity-specific validity and clear labels; missing rate does not erase valid source evidence.

## 18. Sources, access, and files read

### Evidence conventions

- **Observed:** implemented behavior read in the supplied files at the exact baseline.
- **External fact:** documented behavior or statistical/geographic guidance from a primary source.
- **Inference:** a consequence drawn from those facts, explicitly identified where material.
- **Proposal:** new behavior, APIs, modules, milestones, fixtures, or visual design.
- **Checked:** executed standalone verification or a source/document inspection, never an unrun application test.

### Repository references

All code links below are pinned to **ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6**. They identify the supplied source; successful public access to every remote link is not claimed.

<a id="r01-rules-and-direction"></a>
**R01 — Working rules and product conventions.** [AGENTS.md](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/AGENTS.md), [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/agent-guide.md), [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/ui-defaults.md), [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/CODING_STANDARDS.md), [docs/research/DIRECTION.md](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/research/DIRECTION.md). Docs/examples belong to each visible milestone; use React/TypeScript/pnpm; the owner is demand.

<a id="r02-earlier-intent"></a>
**R02 — Earlier intent/review.** [R016-regional-rate-denominators.md](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/intent/research-ideas-100/ideas/R016-regional-rate-denominators.md), [reusable-analysis-metrics/intent-brief.md](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/intent/reusable-analysis-metrics/intent-brief.md), [October 19 review](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/research/grouped-rates-2026-10-19/README.md) and [decisions](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/research/grouped-rates-2026-10-19/decisions.md). Historical demand gates are superseded by this mission; arithmetic cautions remain useful.

<a id="r03-aggregates"></a>
**R03 — Shared aggregation.** [packages/explorEDA/src/lib/aggregates.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/aggregates.ts): AGGREGATIONS, reduceNumbers, summarizeGroup, poolAggregateRows.

<a id="r04-map-plan"></a>
**R04 — Map definition and plan.** [Map/definition.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/definition.ts): MapSettings, mapDefinition; [Map/regionMapPlan.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/regionMapPlan.ts): planRegionMap, regionFilters; [Map/RegionMap.tsx](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/RegionMap.tsx): RegionMap, select, useZoomDetail call.

<a id="r05-map-evidence"></a>
**R05 — Map evidence and settings.** [Map/useMapData.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/useMapData.ts): useMapData, traceField; [Map/regionTrace.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/regionTrace.ts): RegionTrace; [Map/RegionTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/RegionTraceBody.tsx): RegionTraceBody; [Map/RegionMapSettings.tsx](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/RegionMapSettings.tsx).

<a id="r06-map-tests"></a>
**R06 — Map tests.** [Map/regionMap.test.tsx](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Map/regionMap.test.tsx): typed joins, duplicate features, scalar domains, empty/invalid states, selection, trace, persistence, and zoom refinement.

<a id="r07-analysis-model"></a>
**R07 — Query model/evaluator.** [types/AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/types/AnalysisProject.ts): AnalysisStep, AnalysisResultRow, AnalysisSourceReference; [lib/analysis/evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/analysis/evaluateProject.ts): sourceReferences, lookupFrame, expandedFrame, aggregateFrame, validateQuery, evaluateAnalysisQuery.

<a id="r08-project-persistence"></a>
**R08 — Project serialization/text.** [lib/analysis/projectFile.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/analysis/projectFile.ts): validateAnalysisProjectFile, selectAnalysisProjectView; [lib/dsl/project.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/dsl/project.ts): stepLines, compileStep, checkReferences.

<a id="r09-notebook"></a>
**R09 — Notebook read/findings.** [lib/notebook/readNotebook.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/readNotebook.ts): readNotebookText; [lib/notebook/findings.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/findings.ts): MetricFinding, ComparisonFinding, comparisonProblem, compareFindings, evaluateNotebookFindings.

<a id="r10-folder"></a>
**R10 — Folder lifecycle.** [lib/project/folder.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/project/folder.ts): readProjectFolder, missingSources; [lib/project/writeFolder.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/project/writeFolder.ts): projectFileText, analysisFileText.

<a id="r11-analysis-tests"></a>
**R11 — Evaluator tests.** [test/lib/analysis/evaluateProject.test.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts): key types, provenance, aggregate/entity conflicts, parameters, revisions, file/text behavior.

<a id="r12-writeback"></a>
**R12 — Notebook writeback.** [lib/notebook/writeBack.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/writeBack.ts): writeBackChart, writeBackSettings, skippedKey, samePart.

<a id="r13-provider"></a>
**R13 — Provider lifecycle.** [providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/providers/DataLayerProvider.tsx): saveToStructure, restoreFromStructure, holdStateChanges, getSavedStateFingerprint, onStateChange.

<a id="r14-saved-validation"></a>
**R14 — Saved settings.** [utils/saveDataUtils.ts](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/utils/saveDataUtils.ts): isChart, isFindingDefinition, validateSavedData, stringifySavedAnalysis/parseSavedAnalysis.

### Primary external references

Each source supports the nearby claim identified in the report. The design recommendations are original proposals, not claims that a source recommends this exact product architecture.

- **S01.** Esri, [Calculate Rates](https://doc.esri.com/en/arcgis-pro/latest/tool-reference/spatial-statistics/calculate-rates.html). Count/population roles, multiplier, zero-exposure null, distinct crude/smoothed methods.
- **S02.** Esri, [Graduated colors](https://pro.arcgis.com/en/pro-app/3.6/help/mapping/layer-properties/graduated-colors.htm). Normalization, legend/classes, and presentation controls.
- **S03.** Esri, [Data classification methods](https://doc.esri.com/en/arcgis-pro/latest/help/mapping/layer-properties/data-classification-methods.html). Comparison limits of natural breaks and quantiles.
- **S04.** QGIS 3.44, [Graduated renderer](https://docs.qgis.org/3.44/en/docs/user_manual/working_with_vector/vector_properties.html#graduated-renderer). Field/expression classification, legend precision, histogram class editing.
- **S05.** Luc Anselin/GeoDa Center, [Maps for Rates or Proportions](https://geodacenter.github.io/workbook/3b_rates/lab3b.html). Raw and smoothed rate modes, saved rate values, small-population instability. An established methods reference, not a newly published page.
- **S06.** GeoDa Center, [Linked map and histogram exploration](https://geodacenter.github.io/workbook/2a_eda/lab2a.html#linking-a-histogram-and-a-map). Linked selection in geographic exploration.
- **S07.** Tableau, [Filters and Level of Detail Expressions](https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_lod_filters.htm). FIXED denominator versus dimension/context filtering.
- **S08.** CDC, [Principles of Epidemiology, Lesson 3 Section 2](https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson3/section2.html). Archived primary definitions of proportions and person-time rates; used for stable terminology.
- **S09.** National Cancer Institute/SEER, [Calculating crude rates](https://seer.cancer.gov/seerstat/tutorials/aarates/step2.html). Matching geographic/population categories and years.
- **S10.** U.S. Census Bureau, [Geographic boundaries, vintages, and frequency of updates](https://www.census.gov/content/dam/Census/library/publications/2020/acs/acs_geography_handbook_2020_ch02.pdf). A GEOID can persist through a boundary change.
- **S11.** U.S. Census Bureau, [Guidelines for ACS and multiyear estimates](https://www.census.gov/help/topics/faq.what-are-some-general-guidelines-for-using-the-acs.html). Period-estimate interpretation and comparability.
- **S12.** CDC, [Confidence intervals](https://www.cdc.gov/united-states-cancer-statistics/technical-notes/confidence-intervals.html), updated June 1, 2026. Random variability, systematic-bias limits, and interval-overlap caution.
- **S13.** CDC/NCHS, [Statistical reliability of estimates](https://www.cdc.gov/nchs/hus/sources-definitions/statistical-reliability.htm), updated September 16, 2026. Reliability criteria differ by data system.
- **S14.** U.S. Census Bureau, [Population and housing unit estimates tables](https://www.census.gov/programs-surveys/popest/data/tables.html) and [guidance on estimates geographies](https://www.census.gov/programs-surveys/popest/guidance-geographies.html). Release vintages, revised time series, and geographic support.
- **S15.** NIST/SEMATECH, [Poisson distribution](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366j.htm). Probability model underlying the original zero-count interval derivation.

### Complete file-reading record

All 34 files from the packet were read. “Read” means full file contents in the supplied packet, not an inference from filenames.

**Rules, scope, and earlier work (11):**

1. AGENTS.md
2. README.md
3. package.json
4. docs/agent-guide.md
5. docs/ui-defaults.md
6. CODING_STANDARDS.md
7. docs/research/DIRECTION.md
8. docs/intent/research-ideas-100/ideas/R016-regional-rate-denominators.md
9. docs/intent/reusable-analysis-metrics/intent-brief.md
10. docs/research/grouped-rates-2026-10-19/README.md
11. docs/research/grouped-rates-2026-10-19/decisions.md

**Map and shared aggregation (9):**

12. packages/explorEDA/src/components/charts/Map/definition.ts
13. packages/explorEDA/src/components/charts/Map/regionMapPlan.ts
14. packages/explorEDA/src/components/charts/Map/regionTrace.ts
15. packages/explorEDA/src/components/charts/Map/RegionTraceBody.tsx
16. packages/explorEDA/src/components/charts/Map/RegionMapSettings.tsx
17. packages/explorEDA/src/components/charts/Map/RegionMap.tsx
18. packages/explorEDA/src/components/charts/Map/useMapData.ts
19. packages/explorEDA/src/components/charts/Map/regionMap.test.tsx
20. packages/explorEDA/src/lib/aggregates.ts

**Analysis, notebook, persistence, and provider (12):**

21. packages/explorEDA/src/types/AnalysisProject.ts
22. packages/explorEDA/src/lib/analysis/evaluateProject.ts
23. packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
24. packages/explorEDA/src/lib/analysis/projectFile.ts
25. packages/explorEDA/src/lib/dsl/project.ts
26. packages/explorEDA/src/lib/notebook/readNotebook.ts
27. packages/explorEDA/src/lib/notebook/findings.ts
28. packages/explorEDA/src/lib/notebook/writeBack.ts
29. packages/explorEDA/src/lib/project/folder.ts
30. packages/explorEDA/src/lib/project/writeFolder.ts
31. packages/explorEDA/src/utils/saveDataUtils.ts
32. packages/explorEDA/src/providers/DataLayerProvider.tsx

**Docs and example (2):**

33. apps/demo/src/docs/pages/map.mdx
34. apps/demo/src/demos/regionMapGeometry.ts

### Access status and artifact links

**Access confirmed:** the complete-file packet at the named baseline contains the decisive source for this Design mission. No missing input blocks the design. The complete checkout, omitted worker/public-wrapper modules, and live application remain implementation-stage verification inputs.

**Checked:** source contents and documented behavior, exact standalone arithmetic/membership fixtures, and the original visual companion. **Proposed:** every repository change, UI interaction, API, text extension, milestone, and integration test.

Original companion links in the downloaded bundle:

- [Implementation plan](implementation-plan.md)
- [Fixture guide](fixture-guide.md)
- [Exact fixtures](regional-rate-fixtures.json)
- [Independent verifier](verify-fixtures.py)
- [Proposed TypeScript contract](proposed-contract.ts)
- [Workbench design, SVG](regional-rates-workbench.svg)
- [Workbench design, PNG](regional-rates-workbench.png)

[R01]: #r01-rules-and-direction
[R02]: #r02-earlier-intent
[R03]: #r03-aggregates
[R04]: #r04-map-plan
[R05]: #r05-map-evidence
[R06]: #r06-map-tests
[R07]: #r07-analysis-model
[R08]: #r08-project-persistence
[R09]: #r09-notebook
[R10]: #r10-folder
[R11]: #r11-analysis-tests
[R12]: #r12-writeback
[R13]: #r13-provider
[R14]: #r14-saved-validation
[S01]: https://doc.esri.com/en/arcgis-pro/latest/tool-reference/spatial-statistics/calculate-rates.html
[S02]: https://pro.arcgis.com/en/pro-app/3.6/help/mapping/layer-properties/graduated-colors.htm
[S03]: https://doc.esri.com/en/arcgis-pro/latest/help/mapping/layer-properties/data-classification-methods.html
[S04]: https://docs.qgis.org/3.44/en/docs/user_manual/working_with_vector/vector_properties.html#graduated-renderer
[S05]: https://geodacenter.github.io/workbook/3b_rates/lab3b.html
[S06]: https://geodacenter.github.io/workbook/2a_eda/lab2a.html#linking-a-histogram-and-a-map
[S07]: https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_lod_filters.htm
[S08]: https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson3/section2.html
[S09]: https://seer.cancer.gov/seerstat/tutorials/aarates/step2.html
[S10]: https://www.census.gov/content/dam/Census/library/publications/2020/acs/acs_geography_handbook_2020_ch02.pdf
[S11]: https://www.census.gov/help/topics/faq.what-are-some-general-guidelines-for-using-the-acs.html
[S12]: https://www.cdc.gov/united-states-cancer-statistics/technical-notes/confidence-intervals.html
[S13]: https://www.cdc.gov/nchs/hus/sources-definitions/statistical-reliability.htm
[S14]: https://www.census.gov/programs-surveys/popest/data/tables.html
[S15]: https://www.itl.nist.gov/div898/handbook/eda/section3/eda366j.htm



