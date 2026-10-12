# Query demands and responsive database exploration for explorEDA

**Track 1 decision research — proposal, not implementation.** Prepared 2026-10-12 UTC for the request dated 2026-10-11 in America/Indianapolis.

**Baseline:** `https://github.com/byronwall/explorEDA`, commit `f01ff0fb1f9e1240020744a18816f2dad68bf488`, described by the packet as `origin/main at preparation`.

**Access decision: GO for bounded research and initial shaping.** The authorized packet contains the required source. Its 34 baseline-file hashes and three photograph hashes all match; all 43 archive entries were inspected according to their role. The external `prompt.md` is byte-identical to `prompts/database-query-contract.md`. This is a selected snapshot, not a runnable checkout or a complete repository review. No repository files or Git state were changed.

## 1. Recommendation and concise intent seed

**Keep `AnalysisQuery` as the user's authored analysis. Add a narrow, typed read boundary over its output relation, and make complete projected snapshots the first execution policy.** Introduce only a small demand collector, explicit population scopes, truthful coverage, and request/snapshot admission. A general query optimizer, arbitrary SQL interface, progressive region cache, and universal SQL translation are unnecessary for the first visible proof. [DQC-001, DQC-003, DQC-011][^R2][^R3][^R5]

The intended outcome is: **an analyst can select a segment, compare linked charts, inspect its records, and clear the selection while values, row meaning, and visible scope stay correct.** With a complete cache of all required fields, those interactions can execute locally without waiting for a database. When coverage is missing, retain only a clearly identified previous result while obtaining a complete answer for the new scope. Responsiveness never licenses a partial result to claim an exhaustive population. [DQC-002, DQC-004, DQC-012][^R6][^R14]

Initial shaping should establish these decisions:

- **One authored relation, several read demands.** Query steps determine row meaning. Chart demands describe rows, group measures, domains, or evidence needed from that relation. Workspace filters, linked selections, and chart-local restrictions remain separate from the authored query.
- **Complete means complete for a stated row region and stated fields.** “Every row for four fields” permits many exact local interactions. “The first 10,000 rows with every field” does not establish whole-population filtering.
- **Use server aggregates selectively.** Specify their contract now, but implement them only after a named workload shows why complete projected rows are inadequate. Aggregate-only results need an explicit consumer path and bounded trace requests; they cannot be disguised as full source rows.
- **Admit whole, compatible results.** A client intent generation, semantic request identity, and actual source snapshot have different jobs. A completed old request is still old. A string called `snapshotId` is insufficient evidence that later reads see the same database contents.
- **Prove the boundary before translating the whole analysis language.** Begin with one fixed, typed, single-source relation and a deterministic fake. Exercise failures as deliberately as successful filtering. Add one immutable, read-only database fixture afterward.

**Strongest simpler counterproposal:** fetch a bounded complete snapshot of the necessary source tables and retain the existing local evaluator, worker, chart planners, stage inspection, and contributor arrays. That is especially attractive if complex analysis-step parity would otherwise dominate the first milestone. Complete projected *output* rows save transfer, but do not by themselves preserve every stage/source inspection feature. Choose between these two small starts using the first proof and measured width/memory, not an assumed largest imaginable dataset. [DQC-003][^R3][^R4][^R10]

**Confidence:** high in the semantic and correctness constraints; medium in the proposed execution default because no target machine, row-width distribution, database/driver, bandwidth, or accepted latency/memory budget has been supplied. No application performance or provider parity was measured.

## 2. Evidence basis and verified repository findings

Evidence labels used throughout:

- **Observed:** read directly in the attached baseline source or supplied notes/photos. Reading a test is not a fresh pass.
- **External fact:** verified in official documentation, specifications, or original papers, with direct URLs and access dates in the references.
- **Inference:** follows from observed code but has not been executed here.
- **Proposal:** a reversible design or proof decision for later implementation.
- **Measured here:** archive integrity, prompt equality, artifact validation, and example arithmetic only. These are not application benchmarks.

| Observed finding | Design consequence and evidence |
| --- | --- |
| React/TypeScript library, React demo, `pnpm@11.9.0`; package peers React/ReactDOM 18 or 19; Crossfilter2 dependency. | Keep the existing framework and tooling. No framework migration or new client platform is justified. Both manifests and READMEs were read. [^R1] |
| `AnalysisQuery` already has source, lookup, expand, calculate, filter, and aggregate steps, with `outputStepId`. `AnalysisView` separately stores query ID, bindings, settings, and inspection. | Reuse this authored definition; avoid storing ephemeral chart demands as query steps. [^R2] |
| `AnalysisEvaluation` contains full output rows, fields, full stage rows, diagnostics, counts, revision, and source/contributor references. | This is a full in-memory evaluation model. A compact aggregate or page is a new result shape, not a partially filled `AnalysisEvaluation`. [^R2][^R3] |
| The worker receives source tables and then definitions/bindings. The hook ignores outdated request IDs, retains the previous successful same-query result and applied bindings while pending, and empties evaluation on failure. | Preserve the applied-scope pairing, but extend identity and failure semantics for remote work. Worker offloading establishes no remote cache or database snapshot contract. [^R4] |
| `revision` includes process-local `WeakMap` revisions for immutable source-array instances. Worker table sending also depends on the outer `tables` object reference. | Neither local revision nor a request counter is a portable database version. Immutable source updates remain a host requirement. [^R3][^R4] |
| `ExplorEdaProject` turns complete result rows into local rows with positional `__ID`, builds key/position maps, and passes complete evaluation data to chart/query inspection. | Stable remote keys need an explicit snapshot-local index map; page offsets cannot become durable identities. Remote evidence must remain available through a deliberate interface. [^R5] |
| Crossfilter uses separate chart and workspace-field dimensions. Chart groups exclude their own linked filter; global selected rows include every linked filter. `localFilters` only restrict their chart. | Preserve owner identity and multiple populations. Filtering every chart with one undifferentiated predicate breaks current interaction semantics. [^R6] |
| The provider profiles local rows, constructs whole columns synchronously, and substitutes an all-undefined column for an unavailable field. | Unloaded remote fields must be availability metadata. Passing them through `emptyColumn` can invent missing values and wrong selections. [^R7][^R8] |
| Bar/scatter planners distinguish all/context/selected inputs, use complete-domain inputs, and retain contributor or point identity. Aggregate category X domains are not uniformly stable today. | Do not infer domain rules from a sample or claim every existing chart uses the same domain policy. Explicit domain inputs are part of the boundary. [^R9][^R11] |
| `poolAggregateRows` reconstructs and re-reduces contributors; entity-aware pooling deduplicates across groups. | Final averages and distinct counts cannot generally be combined to reproduce “Other.” Omitted provenance cannot be represented as an empty contributor array. [^R10] |
| Full project persistence embeds source tables. Saved workspace settings omit raw rows. | Saving a remote handle is not an offline full analysis. Preserve existing settings semantics and make any full-data export request explicit. [^R2][^R13] |

The notebook photos were visually inspected, not just their transcription. Page 1 proposes query-sized aggregate results and notices query latency. Page 2 distinguishes complete rows from subsets and proposes column caching; its byte estimate is unclear. Page 3 proposes chart demands and adapters while warning against letting massive-scale concerns obstruct a useful 10k–100k-row experience. These are hypotheses; they select neither an encoding nor a database. [^N1]

## 3. Priority 1 — separate analysis, demands, and filters

### 3.1 What belongs on each side

Let **U** be the output relation of the existing analysis definition with its bound parameters, at one source snapshot. U may mean one source record, one expanded relationship match, or one aggregate group. Its meaning comes from the analysis; a chart cannot change that meaning accidentally by requesting fewer columns.

| Concern | Owner and minimum responsibility |
| --- | --- |
| Authored analysis | Existing `AnalysisProject` / `AnalysisQuery`, relationships, output step, parameter bindings. Persist the user's source/lookup/expand/calculate/filter/aggregate intent. |
| Workspace interaction | Workspace filters, chart-owned linked predicates, local populations, Rows-local settings, facet configuration. Preserve owner and scope. |
| Chart demand | Required output fields/dependencies; rows versus groups; exact measures; domain/bin inputs; stable ordering; display limit; trace target. No arbitrary SQL or driver handles. |
| Small client coordinator | Resolve effective populations, compute dependency closure, check cache coverage, combine compatible demands, choose the permitted execution mode, and admit replies atomically. |
| Server read boundary | Resolve server-owned sources and the validated analysis, reject unsupported semantics, execute bounded reads, supply actual schema/snapshot/coverage, stable keys, diagnostics, and evidence handles. |
| Adapter/transport | Adapter executes the supported meaning and declares snapshot lifetime. Transport preserves the result and its completion metadata. Those tracks choose implementation and physical encoding. |

**Proposal:** use a reference plus a content identity for the current validated analysis definition. For the first fixture, the server and client know the same fixed project definition; this requires no registration platform. Later editable project definitions can use the existing validated document shape in the same host boundary, with server-owned source IDs resolved separately. Bind values, validate field IDs, and recompute identity server-side. Never interpret a client source ID as a credential, connection string, or arbitrary SQL fragment. One deployed version is assumed; the keys below are content identities, not a version-negotiation framework. [DQC-001][^R2][^R13]

An analysis `FilterStep` changes U and its stage evidence. A workspace filter selects within U. In particular, a workspace condition on an aggregate output must stay above the analysis aggregate unless an equivalence is separately proved. Calculations and expansion are similar reordering barriers. The new collector should not rewrite the authored pipeline. [^R3]

### 3.2 Alternatives

| Option | Where it wins | Where it fails or costs more |
| --- | --- | --- |
| Extend `AnalysisQuery` to include projection, order/page, chart scopes, and remote lifecycle | Reuses step infrastructure; useful if projection/order are genuine user-authored analysis operations with visible stage meaning. | Mixing chart selection, page movement, and cancellation into saved steps confuses relation meaning, history, and stage counts. It still needs coverage and remote lifecycle metadata. |
| **Keep `AnalysisQuery`; add a narrow read boundary and small demand collector** | Reuses logical analysis while keeping transient reads separate. Works with complete rows first and a later aggregate/page branch. | Consumers must stop assuming every answer contains complete rows and contributors. A second general relational optimizer would be needless duplication; explicitly avoid it. |
| Complete source snapshots, then existing local analysis | Smallest semantic change; retains current calculation/lookup/expand/stage inspection. | Transfers source dependencies, retains stage/provenance memory, and may expand beyond the final result's size. Must still be bounded and complete. |
| Adopt a general visual-query coordinator/cube engine | May help later workloads with many repeated aggregate queries. Mosaic demonstrates client demand publication, consolidation, and indexing as an architecture. | No evidence that its extra machinery is needed here. Do not import its optimizer, SQL API, transport, or benchmark results as this project's default. [^W1] |

### 3.3 Semantic compatibility is an admission requirement

The authored evaluator and chart/workspace value preparation are **two observed semantic layers**. Reuse their actual rules where supported; do not silently normalize one into the other. Display labels/aliases never replace canonical field IDs. Admission validates the full supported document, field references, operators and expression dependencies; merely invoking `evaluateAnalysisQuery` does not perform every check supplied by `validateAnalysisProjectFile`. [^R3][^R13]

| Concern | Observed baseline behavior and required treatment |
| --- | --- |
| Analysis equality/null | `filterFrame` uses `left === value && left != null` for eq, but strict `left !== value` for neq. Null and undefined can therefore pass neq against an ordinary value. Preserve this behavior or reject the unsupported case; do not introduce an unannounced SQL-null semantic change. |
| Analysis order/date | Ordered comparisons require both numbers or both strings. Date parameters are validated but remain strings, so date-string order is lexical in this path. Chronological normalization would be a separate semantic change. |
| Workspace/chart filters | Numeric ranges use finite parsed numbers and inclusive bounds; text filters lowercase strings; missing-category selection also matches blank/whitespace text. Date-only upper bounds cover the whole UTC day. These are not identical to analysis FilterStep rules. |
| Numeric eligibility | Numeric text may be eligible; booleans, blank/radix text and nonfinite measurements are excluded. Zero remains valid. No eligible numeric inputs produces undefined for the current sum/average path, not an invented zero. |
| Group and count meaning | Analysis group keys distinguish types, including numeric 1 versus text "1" and null versus undefined. Field-count excludes null/undefined but can count blank/nonnumeric/nonfinite present values. Count rows, valid measurements and distinct entities are separate measures. |
| Lookup and expansion | Lookup keeps one parent and refuses ambiguous target choice; expand deliberately fans out, with `keepUnmatched` optionally retaining a parent with missing child fields. Preserve diagnostics and grain. |
| Entity measures | Deduplication and conflicting-value behavior depend on the existing analysis versus chart aggregate implementation. Equal measures on different entities both count. Check conflict status, missing entity IDs, and source-row identity; a generic DISTINCT expression is insufficient. |
| Calculation/type metadata | A source field's declared type does not itself coerce every raw scalar. The analysis calculate step evaluates one row at a time; parser/function coverage is not fully visible in the packet. Workspace effective field settings and applied calculations follow their own data preparation. Include both definition identities and reject unsupported lowering. |
| Source precision/keys | Stable keys preserve native type identity; never round a large integer key through a JavaScript number. Scalar/date/decimal mappings outside the proved subset need a lossless agreed representation or explicit unsupported result. |

These facts come from the evaluator, provider, parsing/filter helpers and aggregate code; they are not a fresh client/database parity pass. The first remote fixture uses already-typed finite values and a small declared operation subset, then adds the listed edge cases one at a time. [DQC-007][^R3][^R7][^R8][^R10]

### 3.4 Concise logical TypeScript sketch

**Proposal only; not application code, not a selected wire encoding.** `AnalysisScalar` and `Filter` mean the existing baseline types. Numbers here do not authorize lossy coercion of decimals or 64-bit integers. Each adapter must reject unsupported runtime values or agree on a lossless mapping with the transport track.

```ts
type RowKey = string; // Opaque typed identity, never a display label or page offset.
type Predicate =
  | { op: "filter"; filter: Filter } // Existing chart/workspace semantics.
  | { op: "and" | "or"; args: Predicate[] }
  | { op: "keys"; keys: RowKey[] }
  | { op: "interval"; field: string; min: number; max: number;
      minClosed: boolean; maxClosed: boolean };

type Population = "base" | "selected"
  | { contextOf: string }           // Exclude only this linked owner.
  | { workspaceContextOf: string }; // Exclude only this workspace field.
type Scope = {
  population: Population;
  local: Predicate[];              // AND; never broadcast to other views.
  facet?: { field: string; value: AnalysisScalar }[]; // Typed grid tuple; AND.
};
type Sort = {
  field: string; direction: "asc" | "desc";
  nulls: "first" | "last"; comparator: string;
};
type Measure = {
  id: string; op: "count" | "sum" | "average";
  field?: string; entityField?: string;
};
type GroupKey = string | {
  field: string; edges: number[]; lastClosed: boolean;
};
type Shape =
  | { kind: "rows"; columns: string[]; orderBy: Sort[];
      window: { kind: "all"; maxRows: number }
        | { kind: "page"; limit: number; after?: string } }
  | { kind: "aggregate"; groupBy: GroupKey[]; measures: Measure[];
      maxGroups: number }
  | { kind: "domain"; fields: string[]; maxCategories: number }
  | { kind: "trace"; handle: string;
      target: { kind: "group"; key: string } | { kind: "rows"; keys: RowKey[] }
        | { kind: "stage"; stepId: string };
      columns: string[]; limit: number; after?: string };
type Demand = { id: string; scope: Scope; shape: Shape };

type ReadRequest = {
  requestId: string;
  generation: number; // Current desired UI intent; separate from cache identity.
  analysis: {
    projectId: string; queryId: string; definitionKey: string;
    bindings: Record<string, AnalysisScalar>;
    valueRulesKey: string; // Parsing/field settings/applied calculations.
  };
  snapshot: { mode: "new" } | { mode: "reuse"; id: string };
  filters: {
    workspace: Filter[];
    linked: { owner: string; predicate: Predicate }[];
  };
  demands: Demand[];
  maxBytes: number; // A guard, never permission to silently truncate.
};

type Coverage =
  | { kind: "rows"; columns: string[]; allRowsInScope: boolean;
      deliveredRows: number; populationRows: number | null;
      next: string | null }
  | { kind: "aggregate"; allGroups: boolean; deliveredGroups: number;
      populationRows: number | null }
  | { kind: "domain"; completeDomain: boolean }
  | { kind: "trace"; allEvidence: boolean; next: string | null };
type Output = {
  demandId: string; resultKey: string; scope: Scope;
  exact: boolean; coverage: Coverage;
  fields: { id: string; type: string; nullable: boolean }[];
  // A discriminated payload in implementation; expanded below for readability.
  data: unknown;
  evidence: { kind: "inline" } | { kind: "on-demand"; handle: string }
    | { kind: "unsupported"; reason: string };
};
type ReadReply =
  | { status: "ok"; requestId: string; generation: number;
      analysisKey: string; servedBy: "client" | "server";
      snapshot: {
        id: string; sources: Record<string, string | null>; schemaKey: string;
        asOf: string; reuse: "immutable" | "retained" | "batch-only";
      };
      relation: { rowUnit: string; keyStability: "source" | "snapshot" };
      outputs: Output[]; diagnostics: string[] }
  | { status: "error"; requestId: string; generation: number;
      code: "unsupported" | "snapshot-unavailable" | "limit-exceeded"
        | "incomplete" | "source-changed" | "failed";
      message: string; demandId?: string; retryable: boolean };
```

The sketch deliberately names the minimum logical facts without a final public API. In implementation, `Output` must discriminate row, aggregate, domain, and trace payloads rather than leave `data: unknown`. Rows contain `{key, values}` with one value per returned field. Aggregate records contain a stable typed group key, dimensions, measures, and requested eligibility/exclusion counts. Domain data carries category keys/values or numeric extents; resolved bin edges are sent explicitly in `GroupKey`. Trace records carry source keys, raw/effective values as requested, and inclusion/exclusion reasons. This is a small union, not a general renderer schema.

Required contract rules:

- Resolve `base`, `selected`, and owner-context scopes against the **immutable submitted request** and its filter state. Retain that request and the resolved predicate with the committed result/cache certificate. Never reinterpret an old reply against the live desired filters; the echoed scope label alone is insufficient.
- `status: "ok"` is a **terminal, fully delivered batch**. Every requested output must be accounted for. Chunks and progress are staged separately; early headers or end-of-page do not certify full population coverage.
- `exact` describes the requested result shape at the stated snapshot. An exact ordered page can have `allRowsInScope: false`; it is not an exact full scatter/population cache. Approximate results are not enabled by the first proof. A future approximation needs an explicit algorithm and meaning.
- An `all` demand that exceeds its guard returns `limit-exceeded`. A page deliberately requests a bounded shape and returns continuation/coverage. Aggregate group-cap overflow also returns `limit-exceeded` in this sketch. An explicit top-K shape/order/remainder contract is deferred; never silently omit groups.
- `populationRows: null` means the exact count was not requested or supplied. Do not estimate it from a page. Complete all-row delivery can determine its count without a second count query.
- Field absence, source null, source undefined, invalid raw text, nonfinite values, and conversion failure remain distinct where the existing semantics distinguish them. Missing required fields reject admission before any predicate executes.
- `valueRulesKey` resolves the actual applied field settings and calculation definitions, not an unexplained flag. Source/analysis raw values and chart effective values are separate layers. The server validates that it has the same definitions.
- `snapshot.sources` records independently known source versions; `null` means no such version is available, not a generated substitute version. A batch-only adapter can still certify one consistent batch via `snapshot.id`; it cannot claim later reuse or detect every external source change from that ID.
- No snapshot, content key, cursor, or trace handle is stored as though it were a durable source record identity. A retained snapshot can expire; a `batch-only` snapshot cannot support later same-snapshot reads.

## 4. Priority 2 — populations, domains, and honest linked views

### 4.1 Population algebra

Let W be all workspace filters; B_i the linked predicate owned by chart i; L_i the chart's local restrictions; F_i,k the membership predicate of facet k. Empty filter conjunctions are true. A missing or invalid predicate is an error, not an empty conjunction.

```text
Global selected: S = U ∩ W ∩ intersection(all B_i)
Chart selected:  S_i,k = S ∩ L_i ∩ F_i,k
Chart context:  C_i,k = U ∩ W ∩ intersection(B_j for j != i) ∩ L_i ∩ F_i,k
Field context:  C_field = U ∩ intersection(W_g for g != field) ∩ all B_i
```

These are set equations, not a proposed SQL rewrite. U is already the authored output relation. Two charts filtering the same field still have separate owners; context excludes an owner's complete predicate, not every condition mentioning that field. A category/series selection may require OR of exact pairs, not the Cartesian product of independent value lists. [DQC-002][^R6][^W2]

- **Bar:** compute its displayed context measure from C_i,k; represent its own linked selection separately. Otherwise selecting A erases the alternatives the chart currently leaves visible/dimmed.
- **Scatter:** fetch coordinates/color/size and stable keys for its context. Selected membership is a separate fact. If computing it locally, include all fields used by the otherwise-excluded own predicate, or request an exact membership mask/key set separately. Invalid coordinates may remove a point without removing the record from S or Rows.
- **Rows drawer:** begins from S, then applies its independent Rows-local filters/search/sort. Those do not become workspace filters. A data-table *chart* is a distinct chart owner and can have linked behavior. The actual Rows execution and data-table definition are absent, so the exact search/sort implementation needs follow-up source inspection. [^R6][^R7]
- **Facets:** apply panel membership after owner resolution; do not broadcast it to unrelated charts. Resolve shared versus per-facet domains explicitly. Display visibility is separate: no visible facets is not “all rows,” and an empty facet population must not widen a request. The supplied scatter planner treats an empty `facetIds` input differently from the saved `visibleFacetIds: []` contract; preserve that distinction rather than adopting either as a generic wire rule. [^R11]
- **Clear:** clearing a bar/scatter selection removes its linked selection predicates only. The actual `clearFilter` action clears `chart.filters`; it does not also clear a data-table chart's `globalSearch`, which can contribute to that owner's predicate. Recompute the owner predicate after the precise action. The provider's clear-all action also clears chart/global Rows search and workspace/Rows filters, but retains local restrictions and facet visibility. Clearing linked filters therefore need not clear L_i. [^R7]

### 4.2 Domains and bin edges

**Observed:** count categories and histogram inputs use the bar snapshot's `allValues`; scatter domain/size/legend inputs use `allIds`. These are independent of current live/selected inputs. Numeric bins use finite values and explicit half-open interiors with a closed final bin. Aggregate categorical X domains currently use current aggregate rows; aggregate Y domains combine baseline and current values, since removing negative inputs or changing an average can raise a value. Do not claim every aggregate domain is fixed today. [^R9][^R11]

**Proposal:** cache a domain descriptor keyed by analysis, snapshot, effective value rules, chart domain population, scale settings, and bin definition. The initial default is a domain over U restricted by the chart's local population, shared by that chart's facets, independent of linked/workspace filters. Existing snapshot-assembly callers are missing, so that local-population default must be verified against current wiring before being treated as compatibility behavior. No local filters/facets are used in the first baseline example.

- Preserve count-category identity/order and categorical color mapping across selections. Zero-fill absent **count** groups from the authoritative domain; a zero count is different from an unavailable measure. Stable categories for aggregate mode are a proposed follow-up, not an already-delivered guarantee.
- Domain vocabulary/extents alone do not preserve bar Y scales. Request a separate `base` aggregate over the domain population: category counts for count bars, counts using the resolved bin edges for histograms, and identical measure/entity definitions for aggregate bars. Cache these baseline values alongside the descriptor. The example below includes that base demand.
- Resolve numeric extents and explicit bin edges from complete domain data once per domain generation. Reuse those edges on both client and server. D3's numeric threshold count is approximate and can nice the domain; independently rerunning “20 bins” is not an agreement on boundaries. [^W3]
- A bin predicate states lower/upper bounds and inclusion flags. An ordinary inclusive `range`/SQL `BETWEEN` is not automatically equivalent to a half-open interior bin. The packet omits the saved-selection conversion helper, so exact edge selection parity is an explicit first-proof case.
- Domain refresh follows source/query/value-rule/local-population or deliberate bin/scale changes, not each brush. Aggregate Y may grow to include a new current value as the baseline already allows; it should not shrink below the baseline on each selection.
- Axis clipping, pan, and zoom do not change selected membership or counts. A renderer may limit drawing, but an axis viewport is not an implicit database `WHERE` clause. [^R9][^R11][^R15]

### 4.3 Trace and record drilldown

Trace is a demand over the **same result meaning**. A context bar's trace returns context contributors, including rows that its own linked selection excludes. A selected-records action instead requests S. Name the scope when those differ. Source provenance is not necessarily identical to analysis-output rows: an expanded row refers to parent/child records, and an aggregate result can refer to many sources. Ambiguous lookup candidates appear in `contributors` without becoming a chosen source match. [^R3][^R10]

**Proposal:** initial aggregates return small counts/values and an opaque evidence handle bound to analysis, snapshot, scope, grouping/measure definition, and mark key. Alt-click/Alt-Enter can request ordered, bounded records or measure contributors, including exclusions. Source-record lookup and stage inspection use the same identity discipline; stage rows are requested separately. Handle expiration returns `snapshot-unavailable`, with an explicit refresh/retry path. Never substitute current database rows for an older mark's trace while claiming they produced that mark. [DQC-008]

Complete projected rows can retain locally computed contributor arrays where the required inputs exist. They cannot fabricate raw source fields or earlier analysis stages that were never fetched. A trace's first page says how many are shown and whether more exist; `[]` must mean zero actual contributors, not omitted provenance.

## 5. Priority 3 — execution policy and coverage

### 5.1 Coverage model

For a cached row region, record:

```ts
type RowRegion = {
  analysisKey: string; snapshotId: string; schemaKey: string;
  valueRulesKey: string; rowUnit: string;
  predicate: Predicate;            // Actual region, resolved from its scope.
  columns: Set<string>;           // Available for EVERY row in this region.
  completeForPredicate: boolean;
  uniqueKeys: Set<RowKey>;
  residentBytes: number;          // Account for representation, not wire bytes.
};
```

This is a logical model; the first implementation can hold one complete base region plus a small exact-result cache. A page is not a complete region merely because its delivery finished. Column coverage is attached to a row region and snapshot; it is never a single global list of loaded field names.

For requested population Q and all required fields D, exact local execution requires:

1. Matching analysis definition/bindings, source snapshot, schema, row unit, and semantic rules.
2. A proof that Q is contained in a complete cached row region P: **Q implies P**.
3. Every field in D available for every relevant row, or deterministically derivable there from a supported calculation with complete dependencies.
4. Stable key alignment, complete successful delivery, and no evicted rows/columns that invalidate the certificate.
5. An operation the local executor actually supports with the required semantics.

D includes filters, own-selection membership, local restrictions, facet fields, calculations, group/measure/entity fields, sort fields, and keys, not just visible columns. Raw-record/earlier-stage trace may need a separate evidence demand rather than widening every cache.

The semantic-caching literature formalizes a requested region as a cached intersection plus an uncached remainder. Its cited model studies selections over single relations; it does not solve arbitrary analysis-query equivalence. **Proposal:** initially prove only identical populations, a complete base region, and simple validated conjunction/set/range containment. An unknown proof becomes a cache miss. Do not implement a general region-splitting optimizer. [DQC-004][^W4]

| Cache fact | Exact reuse or required miss |
| --- | --- |
| Every U row for `{key, category, x, y}` | Category/x/y filters, supported local grouping, and clearing those filters are exact at that snapshot. A new `region` filter is a field miss. |
| Every `region = West` row, all columns | `West AND category = A` can be exact. `East`, clearing West, or a field-control context that excludes West needs broader data. |
| Every `category = A` row fetched after a bar selection | Scatter context under A can be covered; that bar's own-filter-excluded context is not. Coverage must be checked for each requested population. |
| First N rows, all columns | Exact known records/page, not an exhaustive population. Filtering the page to zero does not prove the full population has zero matches. |
| x complete for West, y complete for East | Cannot claim x/y complete for West ∪ East. Operations needing both fields need aligned coverage on the same rows. |
| Complete category totals | Can reuse the identical aggregate request. Cannot answer an x-range filter, reconstruct raw scatter points, or invent contributor identities. |

**Inference from the actual baseline:** `getColumnData` can return an all-undefined absent column, while `applyFilter` intentionally matches undefined/blank values to a missing-category selection. Thus an unloaded field passed through that path could select rows as “missing.” The missing-field local-population test only covers a numeric range; the missing-category edge was not run. This is a concrete reason to check availability before evaluation. [^R6][^R7][^R8]

### 5.2 Execution policy

| Situation | Policy | Guarantee and cost |
| --- | --- | --- |
| Complete demanded projection fits the chosen workload budget | **First default: all U rows for dependency-closed projected fields.** Use local filtering/planning, optionally off the main thread where existing seams allow. | Instant network-free reuse is possible; local CPU, indexing, row hydration and drawing still need measurement. |
| Only an aggregate is needed and complete rows are demonstrably wasteful or too large | Bounded server aggregate with exact scope and domain/evidence metadata. | Small results can reduce transfer; each uncovered filter may incur server latency. Existing aggregate consumers need adaptation. |
| Raw Rows/trace population exceeds a display need | Ordered page, explicit scope and continuation. | Exact page, incomplete population cache. Do not ask for a global count unless the UI needs it. |
| Complete rows exist; new fields are needed | Fetch missing fields plus keys for the same base region and reusable snapshot; publish column coverage after validation. | Keeps the instant-filter benefit. If the snapshot cannot be reused, refresh the union projection as a new atomic generation. |
| Complete restricted region exists; new request widens/removes its restriction | Request the complete wider region, or an explicitly proved missing part later. | No guessing outside coverage. The first collector should request the wider whole, avoiding sophisticated remainder merges. |
| Partial/sample rows exist | Treat as a bounded preview/page or known records. Request server work for exhaustive results. | Sampling is not enabled as an approximate-analysis feature in the first proof. |
| Unsupported operation or values | Return a structured unsupported result for that demand; keep any prior valid result visibly scoped. | An explicit complete-source local mode is a separate choice, not an automatic duplicate fallback platform. |

First defaults are operational choices, not hard row-count ceilings. The 10,000–100,000-row range comes from the supplied decision context. Width, cardinality, expansion, and contributor retention can dominate row count. [DQC-003, DQC-005][^N1][^R10]

**Illustrative arithmetic, not a format choice or measurement:** assuming two 8-byte numeric values, a 4-byte category code, and an 8-byte key, a projection has `N × (8 + 8 + 4 + 8) = 28N` value bytes: 280,000 at 10k rows, 2,800,000 at 100k. Three one-bit validity maps would add `3N/8` bytes. Twenty further 8-byte fields add 16,000,000 bytes at 100k; 200 bytes of text per row adds another 20,000,000 before offsets. These estimates exclude dictionaries, strings/objects, Crossfilter indexes, decoded buffers, old/new overlap, calculations, and provenance. They neither reproduce the unclear handwritten estimate nor predict compressed transfer or total heap.

### 5.3 Column expansion and eviction

For same-snapshot expansion, request missing fields plus stable output keys over the same complete base region. Validate identical key sets/cardinality and schema, independent of arrival order; reject duplicate, missing, unexpected, or conflicting keys. Stitch by key, never by page order. A row-count match alone cannot prove alignment. If only a subset is intentionally fetched, add coverage for that subset only.

Use a configurable total client budget B that includes resident cache, in-flight staging, and required old/new overlap. Retain one current base generation, at most one replacement being staged, and a bounded small result/trace cache. Evict unreferenced exact results first; evict unused projected columns or complete regions as units, removing their coverage certificates in the same operation. If replacement cannot fit alongside visible data, evict optional caches, use a bounded load with a clear unavailable/loading view, or decline the mode; do not exceed B silently. Arbitrary row eviction is deferred because it complicates completeness immediately. [DQC-004, DQC-006]

## 6. Priority 4 — identity, cancellation, consistency, and visible state

### 6.1 Three identities with different jobs

| Identity | Role |
| --- | --- |
| Client `generation` / `requestId` | Relevance to the latest desired interaction and routing of replies. Increment on meaningful changes. A retry can retain the intent generation but gets a new request ID. |
| Canonical semantic request/result key | Reuse and deduplication. Include analysis definition/bindings/value rules, actual effective population and owner exclusion, shape, required fields/expressions, groups/measures/entity policy, domain/bin specification, sort/cursor, and snapshot. Exclude request ID and purely cosmetic labels. |
| Snapshot/source/schema identity | Which real data state produced the answer, what a row means, and whether later compatible reads are possible. It is independent of how many UI requests have run. |

Canonicalization preserves typed literals, null/undefined distinctions, meaningful step/sort order, and correlated predicates. Sort only sets whose order truly does not matter. Retain the canonical description for equality/admission; a short hash alone is not the correctness proof. Two different owners may currently resolve to the same predicate and share one exact result, but their future subscriptions remain separate. [DQC-006, DQC-009][^R3][^R6]

### 6.2 Snapshot policy

**External facts:** PostgreSQL READ COMMITTED can give successive SELECTs different snapshots; one REPEATABLE READ transaction keeps its SELECTs on the same snapshot. An exported snapshot is importable only while the exporting transaction remains open. These are PostgreSQL facts, not a promise from every adapter. [^W5][^W6]

**Proposal:** keep related outputs in one short read-only consistent batch. For the first fake and later immutable fixture, source contents are fixed, so same-snapshot columns/pages/trace are well-defined. For a mutable source, choose one truthful capability:

- **Immutable:** source version identifies fixed contents that can be read again.
- **Retained:** a bounded server materialization or genuinely retained snapshot supports later reads until expiry. This costs server resources and is not required for the first milestone.
- **Batch-only:** identity certifies one completed batch. A later read cannot claim the same snapshot. On a missing field, request all currently required fields and linked outputs in a new batch, then replace atomically.

For a multi-output response, a client timestamp or common batch ID is not evidence of database consistency if its constituent reads used changing data. If multiple sources cannot be read consistently under the declared source/version vector, reject a demanded coherent result or keep that operation outside the supported remote subset. Do not add distributed snapshot infrastructure for this assignment.

### 6.3 Freshness and invalidation

Completeness and freshness are separate. An old complete snapshot can answer an old-snapshot filter exactly. It is not automatically the latest database state. Record `asOf`, actual source-version evidence, and reuse lifetime; an acquisition timestamp is not proof of a source-wide transactional clock.

Initial freshness policy: explicit refresh, plus a configurable age policy that marks results stale when exceeded. No CDC, background sync service, or polling commitment is assumed. Source/connection binding changes, schema/value-rule changes, query/parameter edits, a source-change response, and explicit refresh retire affected coverage, domains, result caches, page cursors, and trace handles. A cosmetic chart rename does not. Keep invalidation coarse at the single analysis/source generation until real evidence justifies finer dependency tracking.

### 6.4 Small state machine

Track desired scope separately from the committed complete result. The status is a presentation state, not a substitute for coverage.

| State | Visible data and transitions |
| --- | --- |
| `initial` | No request/result yet. An actual request moves to loading. |
| `loading` | No compatible committed answer. Show explicit loading; zero rows is not an inferred count. Complete admitted success → ready; terminal failure → error. |
| `ready` | Complete exact answer for desired shape, scope, and chosen snapshot freshness policy. Exact local coverage permits ready → ready without network. Missing coverage or aged snapshot → stale if previous data is meaningful, otherwise loading. |
| `stale` | Retain the previous complete result with its applied filters, row meaning, snapshot/as-of, and pending desired scope. A pending refresh flag can coexist. Accepted replacement → ready; failure → error with that same prior result. |
| `error` | Show the failed operation and retry path. Retain a prior result only with its actual scope and freshness visible. Never turn an error into an apparently exact empty result. Retry → stale/loading. |

Changing query/source/schema/row grain should normally withhold incompatible prior chart data instead of presenting it beneath new headings. Merely matching `queryId` is insufficient, unlike the current local retention guard. A previous same-relation filter result may remain visible if applied and pending scopes are unmistakable. Trace and further selection operate on the committed snapshot, or wait until replacement; they must not silently combine desired filters with old marks. [DQC-006][^R4][^R5]

**Optimistic exact versus preview:** evaluating the desired filter from certified complete cached inputs is an actual exact answer at that snapshot; it needs no server confirmation. Computing on incomplete rows is a provisional preview. A preview has its own scope/coverage marker and cannot replace the exact count, exhaustive export, or complete trace. The first proof can omit preview rendering entirely while still testing that preview data is never admitted as ready.

### 6.5 Cancellation, staging, and sequence

Abort transport work and propagate cancellation to the adapter when supported, but always validate replies after transport/decoding/worker completion. The Fetch abort algorithm affects the request/response promise and streams; it does not specify cancellation of an application's database job. PostgreSQL's cancellation documentation explicitly says successful dispatch may have no effect. Driver cancellation is therefore an adapter capability to prove. [^W7][^W8]

Keep one currently admissible foreground batch and the newest queued desired state; coalesce superseded brush updates. An obsolete job may still run after cancellation. Separately cap actual submitted jobs and total staging (a small configured cap, such as two jobs in the fake); if old work does not stop, replace only the latest pending intent until a slot is free. A request timeout and adapter read timeout bound occupied slots. This makes reordered replies possible without unbounded submission. Shared work remains alive while any current consumer needs it. Canceling one chart's subscription must not cancel another chart's compatible request. Default admission requires the current generation and expected request meaning, all required outputs, schema/snapshot/keys/coverage, and successful terminal delivery. A late obsolete result is discarded in the first implementation; opportunistic caching of old work is unnecessary.

```mermaid
sequenceDiagram
    participant UI as Workspace
    participant C as Coordinator and cache
    participant R as Read boundary
    participant DB as Database or fake
    UI->>C: Initial demands and scopes
    C->>R: New snapshot and bounded projection
    R->>DB: One consistent read batch
    DB-->>R: Rows and schema
    R-->>C: Completed identity and coverage
    C-->>UI: Commit ready result
    UI->>C: Select category A
    alt All required rows and fields covered
        C->>C: Evaluate selected and context sets
        C-->>UI: Exact answer at committed snapshot
    else Missing field or broader population
        C-->>UI: Previous applied scope and pending scope
        C->>R: Request missing coverage or full refresh
        UI->>C: Newer selection B
        C->>R: Best effort cancel; submit newest demand
        R-->>C: Late reply for A
        C->>C: Reject obsolete generation
        R-->>C: Completed reply for B
        C->>C: Validate and atomically replace
        C-->>UI: Ready B with matching counts and scope
    end
```

## 7. Priority 5 — combine demands without building an optimizer

Consider a count bar by `category`, two scatters `(x,y,color=category)` and `(x,z,color=category)`, and Rows displaying `key,category,x` sorted by x and key. The active workspace filter uses `region`, and an applied row calculation `net = revenue - cost` is needed by a measure. The analysis itself may already perform a lookup or expansion.

1. **Resolve semantic requirements first.** Analysis lookup/join keys and calculations are dependencies of producing U. They need not all cross the network if computed correctly on the server. Local calculation of `net` needs revenue/cost for every relevant cached row. A chart predicate on net cannot be applied before net exists or below an unrelated analysis aggregate.
2. **Full projected mode:** one complete U read can supply `{key,category,x,y,z,region,revenue,cost}` or a verified server-computed net instead of its inputs where no other demand needs them. Derive chart contexts, selected sets, bars, and Rows locally. This combines data coverage even when view scopes differ because the base relation covers them all.
3. **Server mode:** the two scatters may share one raw request only when their resolved population, snapshot, ordering, raw-row window, value rules, and fidelity match. Union compatible columns. Preserve a map from the returned projection to each consumer. If contexts differ after either scatter owns a brush, split their reads.
4. **Aggregate sharing:** two category aggregates with identical population/group/bin/entity/null semantics can union count/sum/average measures into one request. Baseline domains are another shared demand when their domain scope/settings agree. Do not merge selected and context aggregates merely because both group by category.
5. **Rows limits:** a page of 100 rows and an unrestricted scatter are different demands. The table can reuse complete cached rows and apply its own sort/page. A server page cannot satisfy the scatter. Merge same-order prefixes only when the larger explicit limit remains bounded and both consumers accept that exact prefix; distinct cursors stay distinct.

This is dependency collection plus equality/containment checks, not join reordering or cost-based optimization. Mosaic's original paper describes compatible query consolidation; it is evidence that a coordinator seam is useful, not a requirement to implement Mosaic's cube/index system. [DQC-009][^W1]

### 7.1 Ordering, keys, calculations, and unsupported operations

- **Keys:** prefer a genuine unique typed source key. Expanded keys include parent and child identity; grouped keys include analysis step and typed group tuple. If a source lacks a stable key, use a server-issued identity only within one immutable materialization and declare `keyStability: snapshot`. Disable cross-refresh persistent record binding where it cannot be proved. Baseline duplicate/missing-key positional fallbacks do not survive arbitrary reordering. [^R3][^R12]
- **Sorting/pagination:** specify comparator/collation, direction, null placement, and a unique output-key tie-breaker. Opaque cursors bind snapshot, analysis, scope and order; bind projection too unless its independence is deliberately supported. SQL LIMIT without unique ordering does not promise a stable subset. Keyset pages are a later option, not required for full projection ingestion. [^W9]
- **Calculations:** include expression identity, effective field settings, and complete dependency closure. Preserve existing applied versus draft calculation behavior. Initially support only a small proved subset or existing local calculation on complete inputs; an arbitrary expression-to-SQL translator is deferred.
- **Joins:** existing lookup preserves cardinality and rejects ambiguity; expand changes grain explicitly. Generic SQL join fan-out, `LIMIT 1` lookup, cross-source joins, entity-aware measures and unsupported calculations need capability checks. Do not push past a declared unsupported operation by returning plausible partial values.
- **Raw limits:** caps are safeguards on results/transfer, not hidden filters. Loading “first N” source rows and then evaluating an analysis aggregate changes the analysis and is unacceptable as an exact substitute.
- **Unsupported response:** identify demand/step/field and reason. Missing source, unsupported operator/type, ambiguous row identity, unavailable snapshot, and truncation differ from an exact empty population. Broader feature coverage is investigated only after one supported visible task works. [DQC-007, DQC-011, DQC-012]

### 7.2 Aggregate state and contributor assumptions

Ordinary average over disjoint valid groups needs `sum` and `validCount`, not an average of averages; empty/invalid groups still need distinct status. The original Data Cube paper classifies such intermediate-state requirements. Overlapping entities, source duplicates, numeric accumulation order, and explorEDA's conflict rules add obligations beyond that algebra. [^W10]

For example, entity e1 worth 10 appears in A and B, while e2 worth 10 appears in B. Group totals A=10 and B=20 sum to 30, but pooled once-per-entity total is 20. `SUM(DISTINCT value)` would incorrectly return 10. Either re-aggregate the pooled population on the server, retain sufficient entity state under a proven bound, or keep the pooling operation unsupported. The first aggregate branch should request the pooled result explicitly instead of inventing a generic partial-aggregate cache.

Existing assumptions that must change before server aggregates/partial rows are enabled:

- `AnalysisEvaluation`, stage rows, and `DatumObject[]` currently imply complete materialization. Add a separate read-result path; do not weaken these existing guarantees silently.
- Provider field maps/profile inference cannot infer schema or measurement eligibility from a limited page. Authoritative field metadata and per-region availability are required.
- `rawData[sourceId]`, numeric `__ID`, `findBarForRow`, and selected-key conversion depend on complete local indexing. Maintain stable-key mapping across asynchronous delivery.
- Contributor arrays power trace, mark lookup, and pooling. Make evidence availability explicit and route on-demand evidence without substituting empty arrays.
- Imported/saved full analysis is different from remote source bindings plus cache. Settings restoration may reconstruct demands; it cannot restore missing data or expired trace handles from JSON alone. [^R5][^R7][^R10][^R13]

## 8. Complete worked request/response examples

### 8.1 Fixture and initial/select/clear walkthrough

All data, timestamps, counters and identity strings in this section are **synthetic proposal examples**, not executed service replies. `q1`, `rules1` and result keys are readable aliases for canonical content identities, not an invented hash algorithm. Each request supplies its complete desired filter state. Examples A and B show different states of the same fixed fixture; example C is a sequential cache flow.

The registered fixture project has a single `source` step for source `orders`, output step `source-orders`, query ID `orders`, and a unique string entity key `id`. It uses no calculations, local restrictions or facets. Source fields are `id`, `category`, `x`, `y`, `region`; output field IDs have the baseline's `orders.` prefix. Display labels below are shortened for readability. Row r0 has the actual output key `orders:string:r0`, and similarly for r1–r5. `schema1` authoritatively declares these fields even when a projection does not load all their values. `rules1` identifies the existing rules with no overrides. `$key` in Sort is reserved for output identity. The illustrated one-MiB/ten-row guards are tiny-fixture guards, not product thresholds.

| Row | category | x | y | region |
| --- | --- | ---: | ---: | --- |
| r0 | A | 1 | 10 | West |
| r1 | A | 2 | 20 | West |
| r2 | B | 3 | 30 | West |
| r3 | B | 4 | 40 | East |
| r4 | C | 5 | 50 | West |
| r5 | C | 6 | 60 | East |

Bar B counts category; scatter P plots x/y; Rows has no independent filter/search and sorts by stable key. These expected values were checked by independent arithmetic only, not by running the application.

| Interaction | Global selected / Rows | Bar context and scatter context |
| --- | --- | --- |
| Initial | r0,r1,r2,r3,r4,r5 | Bar A=2,B=2,C=2; scatter all six selected. Baseline x=[1,6], y=[10,60]. |
| Bar selects A | r0,r1 | Bar remains 2,2,2 with B/C dimmed; scatter context r0,r1. |
| Add scatter brush 2≤x≤4 and 20≤y≤40 | r1 | Bar context r1,r2,r3 → A=1,B=2,C=0; scatter context r0,r1, with only r1 selected. |
| Clear bar selection, keep brush | r1,r2,r3 | Bar remains 1,2,0; scatter context all six, selected membership r1,r2,r3. |
| Clear scatter brush too | all six | Bar 2,2,2; all six scatter points selected; Rows six again. |

The count bar's category universe/base frequencies and scatter extents stay tied to U at s1 through this sequence. With only a restrictive cache the same clear may miss, as section 8.5 explains. If r4.x becomes null in a separate fixture version, the initial selected/Rows count is still six but only five points plot; record selection and numeric plottability are not interchangeable.

### 8.2 Example A — aggregate view with context and baseline

This is the **candidate server-aggregate branch**, not a requirement to implement it before full rows. Both bar=A and the scatter brush are active. The context count excludes only bar's own selection. A second `base` count demand provides authoritative categories and baseline frequencies needed for stable count scales. The server returns only groups that exist in context; the client zero-fills C from the complete baseline count result.

**Request**

```json
{
  "requestId": "r10",
  "generation": 10,
  "analysis": {
    "projectId": "fixture",
    "queryId": "orders",
    "definitionKey": "q1",
    "bindings": {},
    "valueRulesKey": "rules1"
  },
  "snapshot": {
    "mode": "new"
  },
  "filters": {
    "workspace": [],
    "linked": [
      {
        "owner": "bar",
        "predicate": {
          "op": "filter",
          "filter": {
            "type": "value",
            "field": "orders.category",
            "values": [
              "A"
            ]
          }
        }
      },
      {
        "owner": "scatter",
        "predicate": {
          "op": "and",
          "args": [
            {
              "op": "filter",
              "filter": {
                "type": "range",
                "field": "orders.x",
                "min": 2,
                "max": 4
              }
            },
            {
              "op": "filter",
              "filter": {
                "type": "range",
                "field": "orders.y",
                "min": 20,
                "max": 40
              }
            }
          ]
        }
      }
    ]
  },
  "demands": [
    {
      "id": "bar-context-count",
      "scope": {
        "population": {
          "contextOf": "bar"
        },
        "local": []
      },
      "shape": {
        "kind": "aggregate",
        "groupBy": [
          "orders.category"
        ],
        "measures": [
          {
            "id": "n",
            "op": "count"
          }
        ],
        "maxGroups": 10
      }
    },
    {
      "id": "bar-baseline-count",
      "scope": {
        "population": "base",
        "local": []
      },
      "shape": {
        "kind": "aggregate",
        "groupBy": [
          "orders.category"
        ],
        "measures": [
          {
            "id": "n",
            "op": "count"
          }
        ],
        "maxGroups": 10
      }
    }
  ],
  "maxBytes": 1048576
}
```

**Response**

```json
{
  "status": "ok",
  "requestId": "r10",
  "generation": 10,
  "analysisKey": "fixture:q1:rules1",
  "servedBy": "server",
  "snapshot": {
    "id": "s1",
    "sources": {
      "orders": "fixture-rows-v1"
    },
    "schemaKey": "schema1",
    "asOf": "2026-10-12T03:00:00Z",
    "reuse": "immutable"
  },
  "relation": {
    "rowUnit": "one orders source row",
    "keyStability": "source"
  },
  "outputs": [
    {
      "demandId": "bar-context-count",
      "resultKey": "s1:bar:context:count",
      "scope": {
        "population": {
          "contextOf": "bar"
        },
        "local": []
      },
      "exact": true,
      "coverage": {
        "kind": "aggregate",
        "allGroups": true,
        "deliveredGroups": 2,
        "populationRows": 3
      },
      "fields": [
        {
          "id": "orders.category",
          "type": "string",
          "nullable": false
        },
        {
          "id": "n",
          "type": "number",
          "nullable": false
        }
      ],
      "data": [
        {
          "key": "category:string:A",
          "dimensions": {
            "orders.category": "A"
          },
          "measures": {
            "n": 1
          }
        },
        {
          "key": "category:string:B",
          "dimensions": {
            "orders.category": "B"
          },
          "measures": {
            "n": 2
          }
        }
      ],
      "evidence": {
        "kind": "on-demand",
        "handle": "trace:s1:bar:context:count"
      }
    },
    {
      "demandId": "bar-baseline-count",
      "resultKey": "s1:bar:base:count",
      "scope": {
        "population": "base",
        "local": []
      },
      "exact": true,
      "coverage": {
        "kind": "aggregate",
        "allGroups": true,
        "deliveredGroups": 3,
        "populationRows": 6
      },
      "fields": [
        {
          "id": "orders.category",
          "type": "string",
          "nullable": false
        },
        {
          "id": "n",
          "type": "number",
          "nullable": false
        }
      ],
      "data": [
        {
          "key": "category:string:A",
          "dimensions": {
            "orders.category": "A"
          },
          "measures": {
            "n": 2
          }
        },
        {
          "key": "category:string:B",
          "dimensions": {
            "orders.category": "B"
          },
          "measures": {
            "n": 2
          }
        },
        {
          "key": "category:string:C",
          "dimensions": {
            "orders.category": "C"
          },
          "measures": {
            "n": 2
          }
        }
      ],
      "evidence": {
        "kind": "on-demand",
        "handle": "trace:s1:bar:base:count"
      }
    }
  ],
  "diagnostics": []
}
```

The displayed context counts are A=1, B=2, C=0; global selected membership is only r1. Selecting the context B mark for tracing uses the context handle plus `target: {kind: "group", key: "category:string:B"}` and yields r2/r3. It does not claim those records are globally selected. Count C=0 comes from complete baseline vocabulary plus absence in a complete context grouping, not from a partial missing-group guess. A sum/average result would need its own valid-input/status rules; unavailable is not zero.

### 8.3 Example B — row plot with a limit and complete domain data

Here only bar=A remains active. Scatter's own-filter-excluded context has exactly two rows. It asks for a bounded page of at most three row coordinates/color values; the response certifies all two context rows arrived. Thus the point population is complete for this scope despite a page-shaped request. Numeric extents and the complete typed category domain are separately read from `base`, retaining x=[1,6], y=[10,60], and color/legend categories A/B/C even when only A points remain.

**Request**

```json
{
  "requestId": "r11",
  "generation": 11,
  "analysis": {
    "projectId": "fixture",
    "queryId": "orders",
    "definitionKey": "q1",
    "bindings": {},
    "valueRulesKey": "rules1"
  },
  "snapshot": {
    "mode": "reuse",
    "id": "s1"
  },
  "filters": {
    "workspace": [],
    "linked": [
      {
        "owner": "bar",
        "predicate": {
          "op": "filter",
          "filter": {
            "type": "value",
            "field": "orders.category",
            "values": [
              "A"
            ]
          }
        }
      }
    ]
  },
  "demands": [
    {
      "id": "scatter-context-rows",
      "scope": {
        "population": {
          "contextOf": "scatter"
        },
        "local": []
      },
      "shape": {
        "kind": "rows",
        "columns": [
          "orders.x",
          "orders.y",
          "orders.category"
        ],
        "orderBy": [
          {
            "field": "$key",
            "direction": "asc",
            "nulls": "last",
            "comparator": "opaque-key"
          }
        ],
        "window": {
          "kind": "page",
          "limit": 3
        }
      }
    },
    {
      "id": "scatter-domains",
      "scope": {
        "population": "base",
        "local": []
      },
      "shape": {
        "kind": "domain",
        "fields": [
          "orders.x",
          "orders.y",
          "orders.category"
        ],
        "maxCategories": 10
      }
    }
  ],
  "maxBytes": 1048576
}
```

**Response**

```json
{
  "status": "ok",
  "requestId": "r11",
  "generation": 11,
  "analysisKey": "fixture:q1:rules1",
  "servedBy": "server",
  "snapshot": {
    "id": "s1",
    "sources": {
      "orders": "fixture-rows-v1"
    },
    "schemaKey": "schema1",
    "asOf": "2026-10-12T03:00:00Z",
    "reuse": "immutable"
  },
  "relation": {
    "rowUnit": "one orders source row",
    "keyStability": "source"
  },
  "outputs": [
    {
      "demandId": "scatter-context-rows",
      "resultKey": "s1:scatter:context:A",
      "scope": {
        "population": {
          "contextOf": "scatter"
        },
        "local": []
      },
      "exact": true,
      "coverage": {
        "kind": "rows",
        "columns": [
          "orders.x",
          "orders.y",
          "orders.category"
        ],
        "allRowsInScope": true,
        "deliveredRows": 2,
        "populationRows": 2,
        "next": null
      },
      "fields": [
        {
          "id": "orders.x",
          "type": "number",
          "nullable": false
        },
        {
          "id": "orders.y",
          "type": "number",
          "nullable": false
        },
        {
          "id": "orders.category",
          "type": "string",
          "nullable": false
        }
      ],
      "data": [
        {
          "key": "orders:string:r0",
          "values": [
            1,
            10,
            "A"
          ]
        },
        {
          "key": "orders:string:r1",
          "values": [
            2,
            20,
            "A"
          ]
        }
      ],
      "evidence": {
        "kind": "inline"
      }
    },
    {
      "demandId": "scatter-domains",
      "resultKey": "s1:scatter:base:xy-category-domain",
      "scope": {
        "population": "base",
        "local": []
      },
      "exact": true,
      "coverage": {
        "kind": "domain",
        "completeDomain": true
      },
      "fields": [
        {
          "id": "orders.x",
          "type": "number",
          "nullable": false
        },
        {
          "id": "orders.y",
          "type": "number",
          "nullable": false
        },
        {
          "id": "orders.category",
          "type": "string",
          "nullable": false
        }
      ],
      "data": {
        "orders.x": {
          "min": 1,
          "max": 6
        },
        "orders.y": {
          "min": 10,
          "max": 60
        },
        "orders.category": {
          "values": [
            {
              "key": "category:string:A",
              "value": "A"
            },
            {
              "key": "category:string:B",
              "value": "B"
            },
            {
              "key": "category:string:C",
              "value": "C"
            }
          ]
        }
      },
      "evidence": {
        "kind": "on-demand",
        "handle": "trace:s1:scatter:base:xy-category-domain"
      }
    }
  ],
  "diagnostics": []
}
```

The reply contains individual stable row keys, not aggregate centroids. Because `next` is null and `allRowsInScope` is true, both points are exhaustive for this context. If the scope had six rows and only three were delivered, the corresponding metadata would require `allRowsInScope: false` and continuation; those rows could be shown as a limited view, but could not be used as a full scatter/linked-filter population. `inline` evidence for this simple source-row projection means the returned field values and their row identities are available; other raw columns or earlier-stage evidence still require an explicit demand.

### 8.4 Example C — complete-cache filter, then a field miss

**C0: acquire every U row for only category/x/y.** Keys accompany the projection. Region's schema is known, but region values are unavailable. This initial all-row response is the proposed first execution default.

**Request**

```json
{
  "requestId": "r20",
  "generation": 20,
  "analysis": {
    "projectId": "fixture",
    "queryId": "orders",
    "definitionKey": "q1",
    "bindings": {},
    "valueRulesKey": "rules1"
  },
  "snapshot": {
    "mode": "new"
  },
  "filters": {
    "workspace": [],
    "linked": []
  },
  "demands": [
    {
      "id": "base-projection",
      "scope": {
        "population": "base",
        "local": []
      },
      "shape": {
        "kind": "rows",
        "columns": [
          "orders.category",
          "orders.x",
          "orders.y"
        ],
        "orderBy": [
          {
            "field": "$key",
            "direction": "asc",
            "nulls": "last",
            "comparator": "opaque-key"
          }
        ],
        "window": {
          "kind": "all",
          "maxRows": 10
        }
      }
    }
  ],
  "maxBytes": 1048576
}
```

**Response**

```json
{
  "status": "ok",
  "requestId": "r20",
  "generation": 20,
  "analysisKey": "fixture:q1:rules1",
  "servedBy": "server",
  "snapshot": {
    "id": "s1",
    "sources": {
      "orders": "fixture-rows-v1"
    },
    "schemaKey": "schema1",
    "asOf": "2026-10-12T03:00:00Z",
    "reuse": "immutable"
  },
  "relation": {
    "rowUnit": "one orders source row",
    "keyStability": "source"
  },
  "outputs": [
    {
      "demandId": "base-projection",
      "resultKey": "s1:base:category-x-y",
      "scope": {
        "population": "base",
        "local": []
      },
      "exact": true,
      "coverage": {
        "kind": "rows",
        "columns": [
          "orders.category",
          "orders.x",
          "orders.y"
        ],
        "allRowsInScope": true,
        "deliveredRows": 6,
        "populationRows": 6,
        "next": null
      },
      "fields": [
        {
          "id": "orders.category",
          "type": "string",
          "nullable": false
        },
        {
          "id": "orders.x",
          "type": "number",
          "nullable": false
        },
        {
          "id": "orders.y",
          "type": "number",
          "nullable": false
        }
      ],
      "data": [
        {
          "key": "orders:string:r0",
          "values": [
            "A",
            1,
            10
          ]
        },
        {
          "key": "orders:string:r1",
          "values": [
            "A",
            2,
            20
          ]
        },
        {
          "key": "orders:string:r2",
          "values": [
            "B",
            3,
            30
          ]
        },
        {
          "key": "orders:string:r3",
          "values": [
            "B",
            4,
            40
          ]
        },
        {
          "key": "orders:string:r4",
          "values": [
            "C",
            5,
            50
          ]
        },
        {
          "key": "orders:string:r5",
          "values": [
            "C",
            6,
            60
          ]
        }
      ],
      "evidence": {
        "kind": "inline"
      }
    }
  ],
  "diagnostics": []
}
```

Coverage is `(U at s1, TRUE, {key,category,x,y}, complete)`. It is not “all fields.”

**C1: apply category=A entirely locally.** The following is a logical reader invocation/answer within the coordinator; it makes **no network request**. The complete base certificate still exists after deriving the selected subset. The bar's own context is computed from the retained base, not this selected-row result.

**Request**

```json
{
  "requestId": "r21",
  "generation": 21,
  "analysis": {
    "projectId": "fixture",
    "queryId": "orders",
    "definitionKey": "q1",
    "bindings": {},
    "valueRulesKey": "rules1"
  },
  "snapshot": {
    "mode": "reuse",
    "id": "s1"
  },
  "filters": {
    "workspace": [],
    "linked": [
      {
        "owner": "bar",
        "predicate": {
          "op": "filter",
          "filter": {
            "type": "value",
            "field": "orders.category",
            "values": [
              "A"
            ]
          }
        }
      }
    ]
  },
  "demands": [
    {
      "id": "selected-rows",
      "scope": {
        "population": "selected",
        "local": []
      },
      "shape": {
        "kind": "rows",
        "columns": [
          "orders.category",
          "orders.x",
          "orders.y"
        ],
        "orderBy": [
          {
            "field": "$key",
            "direction": "asc",
            "nulls": "last",
            "comparator": "opaque-key"
          }
        ],
        "window": {
          "kind": "all",
          "maxRows": 10
        }
      }
    }
  ],
  "maxBytes": 1048576
}
```

**Response**

```json
{
  "status": "ok",
  "requestId": "r21",
  "generation": 21,
  "analysisKey": "fixture:q1:rules1",
  "servedBy": "client",
  "snapshot": {
    "id": "s1",
    "sources": {
      "orders": "fixture-rows-v1"
    },
    "schemaKey": "schema1",
    "asOf": "2026-10-12T03:00:00Z",
    "reuse": "immutable"
  },
  "relation": {
    "rowUnit": "one orders source row",
    "keyStability": "source"
  },
  "outputs": [
    {
      "demandId": "selected-rows",
      "resultKey": "s1:selected:A:category-x-y",
      "scope": {
        "population": "selected",
        "local": []
      },
      "exact": true,
      "coverage": {
        "kind": "rows",
        "columns": [
          "orders.category",
          "orders.x",
          "orders.y"
        ],
        "allRowsInScope": true,
        "deliveredRows": 2,
        "populationRows": 2,
        "next": null
      },
      "fields": [
        {
          "id": "orders.category",
          "type": "string",
          "nullable": false
        },
        {
          "id": "orders.x",
          "type": "number",
          "nullable": false
        },
        {
          "id": "orders.y",
          "type": "number",
          "nullable": false
        }
      ],
      "data": [
        {
          "key": "orders:string:r0",
          "values": [
            "A",
            1,
            10
          ]
        },
        {
          "key": "orders:string:r1",
          "values": [
            "A",
            2,
            20
          ]
        }
      ],
      "evidence": {
        "kind": "inline"
      }
    }
  ],
  "diagnostics": []
}
```

Clearing A can immediately recover all six rows from the unchanged base cache. No server confirmation is required to be exact at s1; freshness against a later mutable database remains a separate question.

**C2: clear A and request workspace region=West.** The client cannot evaluate the new predicate because region is not loaded. It keeps the previous complete result with its applied scope while fetching the missing column for **all** U rows. The acquisition demand deliberately uses `base`, so it ignores the desired workspace filter; this retains complete future filtering ability. The requested key order is descending to demonstrate that expansion cannot stitch by the prior array position.

**Request**

```json
{
  "requestId": "r22",
  "generation": 22,
  "analysis": {
    "projectId": "fixture",
    "queryId": "orders",
    "definitionKey": "q1",
    "bindings": {},
    "valueRulesKey": "rules1"
  },
  "snapshot": {
    "mode": "reuse",
    "id": "s1"
  },
  "filters": {
    "workspace": [
      {
        "type": "value",
        "field": "orders.region",
        "values": [
          "West"
        ]
      }
    ],
    "linked": []
  },
  "demands": [
    {
      "id": "missing-region-column",
      "scope": {
        "population": "base",
        "local": []
      },
      "shape": {
        "kind": "rows",
        "columns": [
          "orders.region"
        ],
        "orderBy": [
          {
            "field": "$key",
            "direction": "desc",
            "nulls": "last",
            "comparator": "opaque-key"
          }
        ],
        "window": {
          "kind": "all",
          "maxRows": 10
        }
      }
    }
  ],
  "maxBytes": 1048576
}
```

**Response**

```json
{
  "status": "ok",
  "requestId": "r22",
  "generation": 22,
  "analysisKey": "fixture:q1:rules1",
  "servedBy": "server",
  "snapshot": {
    "id": "s1",
    "sources": {
      "orders": "fixture-rows-v1"
    },
    "schemaKey": "schema1",
    "asOf": "2026-10-12T03:00:00Z",
    "reuse": "immutable"
  },
  "relation": {
    "rowUnit": "one orders source row",
    "keyStability": "source"
  },
  "outputs": [
    {
      "demandId": "missing-region-column",
      "resultKey": "s1:base:region",
      "scope": {
        "population": "base",
        "local": []
      },
      "exact": true,
      "coverage": {
        "kind": "rows",
        "columns": [
          "orders.region"
        ],
        "allRowsInScope": true,
        "deliveredRows": 6,
        "populationRows": 6,
        "next": null
      },
      "fields": [
        {
          "id": "orders.region",
          "type": "string",
          "nullable": false
        }
      ],
      "data": [
        {
          "key": "orders:string:r5",
          "values": [
            "East"
          ]
        },
        {
          "key": "orders:string:r4",
          "values": [
            "West"
          ]
        },
        {
          "key": "orders:string:r3",
          "values": [
            "East"
          ]
        },
        {
          "key": "orders:string:r2",
          "values": [
            "West"
          ]
        },
        {
          "key": "orders:string:r1",
          "values": [
            "West"
          ]
        },
        {
          "key": "orders:string:r0",
          "values": [
            "West"
          ]
        }
      ],
      "evidence": {
        "kind": "inline"
      }
    }
  ],
  "diagnostics": []
}
```

The coordinator verifies the same analysis/schema/s1 and identical six-key set, then joins the region values by key. It now has complete `{key,category,x,y,region}` coverage over U and can commit West selected rows **r0,r1,r2,r4** with matching linked chart outputs. `ok` completes this acquisition demand; it does not itself declare the visible linked cohort ready until those derived outputs are reconciled. Nothing about absent region values was interpreted as null or “no matches.”

The fake's s1 is reusable because it is explicitly immutable. If the source only supports batch identity, the **same C2 request** must instead receive this complete error response:

```json
{
  "status": "error",
  "requestId": "r22",
  "generation": 22,
  "code": "snapshot-unavailable",
  "message": "Snapshot s1 is not available for another read; request a new complete union projection.",
  "demandId": "missing-region-column",
  "retryable": true
}
```

The retry is a new-snapshot request for the complete current union projection and needed linked outputs; it is not an endless retry of the expired s1 token. Publish all-new values together. Never attach s2's region column to s1's coordinates and call the result coherent.

### 8.5 Filtering outside a cached row subset and removing its restriction

This is a **separate starting condition** with no broader C0 cache retained: suppose only all West rows, for all fields, were acquired. The certificate covers r0,r1,r2,r4 under `region=West`.

| Desired operation | Required conclusion |
| --- | --- |
| West AND category=A | Exact local r0,r1 if all needed fields/rules are covered. |
| Replace West with East | Miss; expected source rows are r3,r5. The cached absence of East is not evidence of zero source matches. |
| Clear West | Miss; U includes r3/r5 too. Four cached rows must never be labeled the complete six-row population. |
| Open region's workspace field context | Miss even before clearing, because this context excludes its own West filter and needs all U values. |
| Fetch only first two West rows | Even West AND category=A cannot generally be certified from that page without a coverage proof; lucky fixture membership does not establish a general rule. |

The starter policy asks for the complete wider population. Computing and merging a minimal remainder is deferred. The same principle applies when a chart's context excludes the very selection used to acquire a restricted cache.

## 9. Priority 6 — the first falsifiable proof

### 9.1 Hypothesis and smallest slice

**Hypothesis P1:** a complete projected snapshot plus a small read/demand boundary preserves the existing bar/scatter/Rows population semantics, answers covered-field interactions without network requests, and never admits a stale, mixed-snapshot, unsupported, or incomplete answer as current exact data.

Use a local harness in the real integration checkout later, with a fixed schema and the six-row example in section 8 as independent expected data. Use the existing evaluator, Crossfilter wrapper, and active planners where their actual dependencies are available. Start with a count bar, a raw scatter, and Rows; add one calculated measure as a second small case. Do not start by implementing every chart or adapter. The source packet itself cannot run this harness. [DQC-010][^R12][^R14]

The fake implements the proposed logical reader, with queued promises and a manually advanced clock. It records request meaning, abort attempts, emitted records/bytes, and admission/rejection reasons. Assertions use hand-audited membership/counts as well as comparison to existing code; two paths sharing a bug must not certify each other.

### 9.2 Deterministic adversarial schedule

| Step / fake event | Required result |
| --- | --- |
| Begin r1; deliver schema and only some rows | Loading. No complete base certificate, no fake zero count, and no ready state. |
| Complete r1 | Exactly one committed snapshot. All required fields and unique keys accounted for. |
| Select A using covered fields, then clear | Correct selected/context/Rows sets from section 8; no network read for either interaction. |
| Force a missing-field request r2 for A, then newer r3 for B | Previous complete result retains applied scope; newest desired scope is distinct. Abort r2 if no current consumer needs it. |
| Deliver r3 before r2; deliberately ignore r2's abort | r3 may commit after validation. Late r2 never replaces it or changes counts, domains, or trace scope. |
| Deliver a missing column, duplicate key, dropped final chunk, wrong schema, or incorrect row-set manifest | Each case fails admission. A matching row count alone cannot make it complete. |
| Deliver a same-snapshot expansion labeled s2 when s1 was requested | Reject stitching. An explicit new-snapshot full refresh is required. |
| Make the latest read fail, then retry successfully | Error retains only clearly scoped prior data. Retry replaces it atomically; no error becomes an exact empty result. |
| Keep only complete West rows, then request East or clear West | Cache miss. No false zero or incomplete clear. Bar/field-control contexts are checked independently. |
| Evict a required column/region under a tiny synthetic byte budget | Coverage is removed with the data; the next demand misses. Shared active requests survive one consumer's cancellation. |
| Change analysis definition, source binding, row grain, or value rules; then deliver an old reply | Old data is not relabeled under new semantics. No mismatched snapshot enters any linked output. |
| Request trace from an older committed mark after source refresh/expiry | Resolve the same snapshot or return explicit unavailability; never quietly return newer contributors. |

Additional focused semantic fixtures:

- Null, undefined, blank/whitespace, numeric text, boolean, radix-looking text, nonfinite values, numeric `1` versus text `"1"`, and empty versus all-invalid measures.
- Numeric and date bounds, UTC day-end, an interior histogram edge and final upper edge; membership must equal trace membership for the same scope and mark predicate; a context trace need not equal the global selected set.
- Missing/duplicate stable keys, missing/ambiguous lookup, expansion with and without `keepUnmatched`, distinct entities with equal measures, repeated/conflicting entities across groups.
- One invalid scatter coordinate that remains selected in Rows, Rows-local search/filter, two owners on the same field, chart-local restriction, and empty facet visibility/membership.
- Unsupported formulas/operators/types must return a capability error; never suppress a required filter. Complete projected rows with a new field must remain distinguishable from all-column partial pages.

These are bounded decision tests, not a request for universal chart certification. Missing helper/caller behavior identified in section 11 must be inspected when the real checkout is available.

### 9.3 One database fixture afterward

**Proposal P2:** use one tiny, pre-provisioned immutable PostgreSQL fixture as a concrete candidate, not a selected production adapter. An owner supplies a read-only connection to a dedicated fixture schema containing the same typed rows and stable key, plus a small second table for lookup/expand if that is the next admitted operation. No production access is needed. All actual queries use bounded parameters/results; no DDL, writes, or migrations are required for the proof.

Read required outputs within one read-only consistent transaction, compare keys, types, values, null/exclusion behavior and ordering to the hand-audited fixture, then prove same-snapshot expansion using its immutable fixture version. Mutable-source refresh and expiry can remain fake scenarios initially. Test the chosen driver's actual cancellation behavior separately; libpq documentation does not certify an unspecified TypeScript driver. Do not report general provider parity from one source-only fixture. [^W5][^W8]

### 9.4 Proposed measurements and rejection rules

Use a named device/browser, recorded viewport, production build for absolute timing, foreground tab, fixed fixture seed, and at least two runs as the existing performance guide requires. Compare current complete-local behavior with the proposed complete-projection path under identical charts and interactions. [^R14]

| Dimension | Proposed measurement and falsifiable rule |
| --- | --- |
| Correctness | Exact selected/context key sets, group counts, valid contributors, null/undefined/unavailable states, domain/bin IDs, order/page membership, trace identity. **Any unexplained mismatch rejects the tested capability.** Integers/keys use exact equality; any floating tolerance must be chosen and reported before its case, not used to hide semantic drift. |
| Local interaction latency | Measure event → correct semantic result, event → matching DOM/planner result, and event → next rendered frame proxy separately. **Provisional target:** p95 ≤100 ms for covered-field exact updates on the agreed 10k/100k narrow workload. This is a shaping hypothesis to ratify for a named machine, not a universal threshold or a measured pass. |
| Initial load and cache miss | Report query/queue, transport, decode, hydration/index, planning and render times; first usable correctly scoped result versus fully interactive exact result. Inject 20/200/800 ms fake delays as test inputs. Negotiate real startup/miss targets after measuring the named environment; fast input acknowledgement alone is not exact-data completion. |
| Requests and bytes | Covered-field selection/clear should make zero data requests after full acquisition. Record each request, logical rows/cells, encoded and decoded body bytes, duplicate work and bytes wasted after abort. New-field expansion should transfer missing fields plus keys when same-snapshot reuse is possible. Full refresh is expected when it is not. |
| Memory | Record steady and peak cache/staging, buffers, hydrated rows, Crossfilter indexes, calculations, stage/provenance arrays and old/new overlap. Use a predeclared budget B; any unaccounted/unbounded growth or stale certificate after eviction rejects admission/cache policy. Wire size is not heap size. |
| Policy comparison | Matrix: 10k and 100k rows; narrow numerics, wide mixed/text, high-cardinality strings; cold/warm filter, clear, new field, wider scope, rapid changes, restore, source change. Adopt aggregates/pages only if they materially improve a failing named budget while meeting the same correctness gate. |

**Stopping rule:** if the complete projected path passes the chosen workload policy, defer progressive region caches and optimizer work. If it fails, identify whether transfer, row hydration, indexing, draw cost, analysis expansion, or provenance dominates before selecting a remedy. A server aggregate does not fix an unrelated rendering bottleneck. If the narrow contract cannot preserve scope or required source identity even in the fake, stop and prefer the simpler complete-source snapshot approach until the failing semantic obligation is resolved.

## 10. Interface handoff to the other tracks

These are requirements from track 1, not assumed shared decisions. The other two prompts were read only for coordination.

### Transport track

- Preserve request/demand identity, analysis/value-rule/source/schema/snapshot identity, row unit, actual population scope, stable keys, exactness, row-versus-field coverage, and final completion/error.
- Preserve scalar meaning losslessly for the supported subset. Raw null/undefined/nonfinite/invalid values and unavailable fields must not collapse unintentionally. The baseline has tagged persistence for special raw values, but that does not select a remote encoding. JSON's numeric interoperability limits are one reason to make large-integer/decimal handling explicit. [^R2][^W11]
- Retain stable key alignment across projected columns and chunks. Include enough sequencing/count/integrity information to detect incomplete or duplicate delivery; do not certify a full cache at first batch arrival.
- Preserve domain/category/bin identities and aggregate validity/exclusion metadata. Never send display labels as the only group identity.
- Provide abort propagation and bounded staging/backpressure as supported; final admission must still reject obsolete work. Expose encoded/decoded sizes needed for the proof without treating compressed bytes as total resident memory.
- Carry cursors and trace handles opaquely, with scoped expiry errors. Initial aggregate replies should not require full contributor arrays.

Physical encoding, compression, binary layout, worker buffer strategy, and format benchmarks remain transport-track decisions.

### Adapter track

- Resolve server-owned source bindings and validate existing query/field identities and bound values. Keep credentials server-side. No arbitrary SQL endpoint is requested.
- Declare exact supported operations/value rules, output schema, row grain/key guarantees, snapshot reuse/lifetime, result caps, and driver cancellation behavior. Cap overflow and unsupported behavior must be explicit.
- Preserve authored step order and lookup/expand/aggregate semantics. A duplicate target is not an arbitrary first match; repeated entities are not `SUM(DISTINCT value)`; missing types/null coercions cannot silently change membership.
- Supply complete projected output rows for the first fixture; explain when filters/calculations require hidden source dependencies without always returning all fields.
- Supply truthful exact aggregate eligibility/counts and source/evidence capability if that mode is enabled. Pooled distinct entities or unavailable trace must not be hidden.
- Guarantee a consistent result batch through actual database/snapshot behavior. If later same-snapshot expansion/pages/trace are unavailable, return an explicit error so the client can refresh a whole generation.
- Sorting/pagination requires a unique output order and compatible typed comparison/null placement. Stable entity/source IDs and snapshot-local result IDs have different persistence promises.

Full driver implementations, connection configuration, provider selection, source discovery UI, and universal SQL lowering remain adapter-track work. Track 1 proposes one bounded PostgreSQL fixture only as the later proof target.

### Reconciliation questions for the concise intent/shaping pass

1. Is first success a simple remote source relation in the existing workspace, or must it preserve the current multi-step Query panel/stage drilldown immediately? This can stay provisional: use the simple relation for P1; choose complete source snapshots if full query inspection is essential from the first milestone.
2. Which representative 10k/100k schemas and device define acceptable startup, warm filtering, and memory? Until measured, keep the full-projection default reversible.
3. Does the initial source expose immutable/versioned data, or only batch consistency? Same-snapshot column expansion is conditional on that answer.
4. Which exact scalar/collation/calculation subset can the first adapter prove? Mark remaining operations unsupported; do not broaden the platform to hide missing evidence.

## 11. Limitations, checks, and source inventory

### Access and missing evidence

- The packet supplies every file required by the prompt and matches its manifest. Baseline identity is manifest-grounded; no live repository checkout or Git remote verification was needed or performed. Public GitHub URLs in the references locate baseline source, while the actual code evidence came from the packet.
- Missing imported implementations/callers include `lib/categories.ts`, bar `bins.ts`, `scatterAxis.ts`, `planScatterPoints.ts`, source identity/key helpers, calculator/parser internals, chart filter definitions, chart snapshot assembly, Rows execution, chart context/trace consumers, and test fixtures. Their behavior is not claimed as fully reviewed. These gaps limit complete parity conclusions, not the bounded contract recommendation.
- The provider and planner evidence is static. In particular, the absent-field/missing-category concern and facet/domain caller wiring need runtime/caller verification in the real checkout.
- No database/driver, live source, target bandwidth/device, snapshot retention policy, precision mapping, collation policy, or accepted latency/memory budget was selected by the user. No production access is required.
- Existing performance documentation contains historical observations. None is presented as a new benchmark. Papers and product documentation are used for semantics/architecture, not as performance predictions.

### Actual reads

All 34 manifest-listed baseline files were fully read across the root review and three focused evidence reviews; their findings were reconciled against the required seams. Exact inventory:

```text
AGENTS.md
README.md
package.json
pnpm-workspace.yaml
packages/explorEDA/package.json
packages/explorEDA/README.md
docs/agent-guide.md
docs/ui-defaults.md
docs/performance-checks.md
docs/intent/current-analysis-trust/intent-brief.md
docs/intent/renderer-independent-replay/intent-brief.md
packages/explorEDA/src/analysis.ts
packages/explorEDA/src/types/AnalysisProject.ts
packages/explorEDA/src/types/ChartTypes.ts
packages/explorEDA/src/types/FilterTypes.ts
packages/explorEDA/src/types/SavedDataStructure.ts
packages/explorEDA/src/components/ExplorEdaProject.tsx
packages/explorEDA/src/lib/analysis/evaluateProject.ts
packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts
packages/explorEDA/src/lib/analysis/projectFile.ts
packages/explorEDA/src/lib/analysis/sources.ts
packages/explorEDA/src/providers/DataLayerProvider.tsx
packages/explorEDA/src/hooks/CrossfilterWrapper.ts
packages/explorEDA/src/hooks/applyFilter.ts
packages/explorEDA/src/lib/valueParsing.ts
packages/explorEDA/src/lib/aggregates.ts
packages/explorEDA/src/lib/chartPopulation.ts
packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts
packages/explorEDA/src/components/charts/BarChart/barPlan.ts
packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx
packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts
packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts
```

Local additions inspected: `source-manifest.json`, `photo-manifest.json`, `source-notes.md`, `notebook-1.jpeg`, `notebook-2.jpeg`, `notebook-3.jpeg`, all three files under `prompts/`, and the separately attached `prompt.md`. Only the query-contract prompt was executed as an assignment.

### Commands and validation status

Ran: safe ZIP extraction/listing; SHA-256 and photograph-size verification; prompt byte comparison; direct source reading/search and photo inspection; primary-source browsing; local deliverable/JSON/example/ZIP validation. No dependency installation, application implementation, source modification, Git command, database query, or browser application check ran.

**The following real-checkout validation commands were not run.** Their required imports, workspace support files, and dependencies are absent from this selected packet. This run sheet is supplied for later integration, not evidence of a pass:

```bash
# Later, in the actual runnable integration checkout only.
pnpm --filter exploreda exec vitest run src/test/lib/analysis/evaluateProject.test.ts src/test/lib/analysis/useAnalysisEvaluation.test.tsx src/test/lib/analysis/sourceRowIdentity.test.ts src/hooks/CrossfilterWrapper.test.ts
pnpm --filter exploreda check-types
pnpm check:ui

# Full check builds the package. Run once; do not overlap with another checkout.
pnpm check
```

## 12. Recommendation ledger

The companion JSON uses these stable IDs and contains evidence, alternatives/costs, confidence, and falsifiable proof for each. This Markdown contains every substantive conclusion.

| ID / status | Proposal and decision gate |
| --- | --- |
| DQC-001 — recommend | Reuse authored `AnalysisQuery`; add a narrow read/demand boundary. Prefer source snapshots if preserving all existing stage inspection is the immediate blocker. P1 must show ordinary interactions leave authored query meaning unchanged. |
| DQC-002 — recommend | Name selected/context/global/local/facet populations and owner exclusions. Reject any membership mismatch in the bar/scatter/Rows fixture. |
| DQC-003 — recommend | Start with complete projected rows when bounded. Compare against complete source snapshots; retain the simpler path if it meets the named workload. |
| DQC-004 — recommend | Certify row-region and field coverage independently; miss conservatively. Missing-field, clear-filter, wrong-snapshot and eviction cases must fail closed. |
| DQC-005 — investigate | Add bounded aggregate/page execution only when complete projection fails a measured workload policy or a required access pattern demands it. Exactness and trace must survive. |
| DQC-006 — recommend | Separate request relevance, semantic reuse, actual snapshot and freshness. Atomic acceptance and explicit applied scope must survive reordered, failed, expired and incomplete replies. |
| DQC-007 — recommend | Make value/step/key capability explicit and preserve both analysis and chart semantic layers. Unsupported behavior must be observable before an exact result is admitted. |
| DQC-008 — recommend | Use bounded snapshot-bound evidence requests for aggregates/stages. Never represent omitted contributors as empty; prove mark-to-record identity and pooling. |
| DQC-009 — recommend | Combine exact-compatible demands and projections with direct control flow. Different scope/order/page/bin/entity semantics stay separate. |
| DQC-010 — recommend | Deterministic fake first, then one bounded immutable database fixture. Hand-audited semantics and named measurements can reject the proposal. |
| DQC-011 — defer | General optimizer, arbitrary SQL, universal translation, retained mutable-source snapshots, and progressive region caches. Reopen only for a concrete failed simpler workload. |
| DQC-012 — reject | Silent truncation, unloaded-as-null fields, partial-as-complete caches, misleading exact previews, and arbitrary identity fallback across pages/refresh. Each must fail an explicit adversarial case. |

## 13. Sources

All external sources below were accessed **2026-10-12 UTC**. They are official documentation, specifications, maintainer source discussion, or original papers. Repository references identify the supplied baseline, not a claimed live checkout. Short claims attributed to each external source are intentionally bounded; the proposed contract and examples are original synthesis.

[^R1]: Observed packet: root `package.json` (`packageManager`, scripts), `packages/explorEDA/package.json` (exports, dependencies, peers), both READMEs and `pnpm-workspace.yaml`. [Root manifest](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/package.json); [library manifest](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/package.json).
[^R2]: Observed packet: `packages/explorEDA/src/types/AnalysisProject.ts`, `AnalysisQuery` / `AnalysisView` (29–144), `AnalysisResultRow` / `AnalysisStage` / `AnalysisEvaluation` (153–220); `types/FilterTypes.ts`; `types/SavedDataStructure.ts` (workspace/Rows settings and special values). [Analysis types](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/AnalysisProject.ts); [saved data](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/SavedDataStructure.ts).
[^R3]: Observed packet: `packages/explorEDA/src/lib/analysis/evaluateProject.ts`: `sourceFrame` / `sourceReferences` (44–146), `lookupFrame` (192–314), `expandedFrame` (316–424), `calculateFrame` (426–461), `filterFrame` (463–521), `aggregateFrame` (523–663), canonical/revision helpers (671–710), `evaluateAnalysisQuery` (745–917). [Evaluator](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/evaluateProject.ts).
[^R4]: Observed packet: `useAnalysisEvaluation.ts`, `useWorkerEvaluation` (108–189); `analysisWorkerProtocol.ts`, request/response unions and `handleAnalysisWorkerRequest` (9–56); `useAnalysisEvaluation.test.tsx` (19–36, 69–82). [Hook](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts); [protocol](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts).
[^R5]: Observed packet: `packages/explorEDA/src/components/ExplorEdaProject.tsx`, row/key maps (134–159), settings conversion (200–237), Query/chart context (282–321), workspace and scope rendering (335–438). [Component](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/ExplorEdaProject.tsx).
[^R6]: Observed packet: `hooks/CrossfilterWrapper.ts`, `addChart`, `setWorkspaceFilters`, `getFilteredRowIds`, `getChartFilteredRowIds`, `getAllData` (83–201); `CrossfilterWrapper.test.ts` (52–106, 131–211); `lib/chartPopulation.ts`, `getPopulationTest` / `restrictToPopulation`. [Wrapper](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/hooks/CrossfilterWrapper.ts); [population helper](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/chartPopulation.ts).
[^R7]: Observed packet: `providers/DataLayerProvider.tsx`, store rows/profiles/cache (258–415), creation/reset (483–503, 640–699), aggregate source access (902–963), clear actions (1070–1123), `getColumnData` / `emptyColumn` (1142–1206), Rows settings (1239–1242). [Provider](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/providers/DataLayerProvider.tsx).
[^R8]: Observed packet: `lib/valueParsing.ts`, missing/numeric rules (11–83), strict UTC/date parsing (130–276); `hooks/applyFilter.ts` (10–63), value, inclusive range, lowercase text and date-range behavior. [Parsing](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/valueParsing.ts); [filters](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/hooks/applyFilter.ts).
[^R9]: Observed packet: `components/charts/BarChart/barPlan.ts`, snapshot contract (49–64), categories/numeric mode/bin membership (171–283), domains (325–409, 465–472), marks/highlighting (570–675), `findBarForRow` (720–724). [Bar planner](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/charts/BarChart/barPlan.ts).
[^R10]: Observed packet: `lib/aggregates.ts`, `AggregateResultRow` (35–45), `summarizeGroup` (94–223), `calculateGroupedAggregate` (235–254), `poolAggregateRows` (257–288). [Aggregates](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/aggregates.ts).
[^R11]: Observed packet: `components/charts/ScatterPlot/scatterPlan.ts`, snapshot (114–135), domains/size (291–333), facet/context/selected points and exclusions (382–460), bounds (480–505), legend (619–659); `types/ChartTypes.ts`, facet visibility (33–38), axis limits (64–72), local filters (114–119). [Scatter planner](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts).
[^R12]: Observed packet: `test/lib/analysis/evaluateProject.test.ts` (especially lookup/identity 95–170), `sourceRowIdentity.test.ts` (9–34), `useAnalysisEvaluation.test.tsx`, and `hooks/CrossfilterWrapper.test.ts`. All were read, none run. [Evaluation tests](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts); [identity test](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts).
[^R13]: Observed packet: `lib/analysis/projectFile.ts`, embedded tables and dependency closure (9–16, 94–177); `lib/analysis/sources.ts`, sampled type inference and row-number fallback (14–109), single-table promotion (236–245); `src/analysis.ts` exports. [Project codec](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/projectFile.ts); [sources](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/sources.ts).
[^R14]: Observed packet: `docs/performance-checks.md`, especially measurement conditions and edit patterns; `docs/intent/current-analysis-trust/intent-brief.md`; `docs/intent/renderer-independent-replay/intent-brief.md`. These require named workload evidence and source/contributor meaning without a universal platform. [Performance guide](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/performance-checks.md); [trust intent](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/intent/current-analysis-trust/intent-brief.md); [replay intent](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/intent/renderer-independent-replay/intent-brief.md).
[^R15]: Observed packet: `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`: React/tooling rules, explicit scope, selection/clear/trace gestures, axis versus filtering, visible preview limits, and later validation requirements. [Agent guide](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/agent-guide.md); [UI defaults](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/ui-defaults.md).
[^N1]: Supplied local additions: `source-notes.md`, `photo-manifest.json`, and visually inspected `notebook-1.jpeg`, `notebook-2.jpeg`, `notebook-3.jpeg`. Authored notes dated 2026-10-11. These are interpretation/source hypotheses, not baseline code or measured byte targets. Coordination-only prompts: `prompts/columnar-data-transport.md` and `prompts/database-adapters.md`.
[^W1]: Original paper: *Mosaic: An Architecture for Scalable & Interoperable Data Views*, TVCG 2024, §§3 and 6. [Author-hosted paper](https://idl.cs.washington.edu/files/2024-Mosaic-TVCG.pdf). Client demands/coordinator lifecycle and compatible query consolidation support the architectural comparison; cube indexing and published performance are not adopted.
[^W2]: Crossfilter maintainers, [issue #161: group() on filtered dimension shows all results](https://github.com/square/crossfilter/issues/161), including the own-dimension exclusion documented/discussed there. Root search retrieval and direct issue body were read; some activity content appears only in search retrieval. Local wrapper/tests are the decisive explorEDA evidence.
[^W3]: D3 official documentation, [Binning data](https://d3js.org/d3-array/bin), `bin.domain` / `bin.thresholds` and returned bin bounds. Numeric threshold counts can be approximate; interior upper bounds are exclusive, final upper bound inclusive. This does not prove explorEDA's missing selection-helper behavior.
[^W4]: Dar et al., *Semantic Data Caching and Replacement*, VLDB 1996, §3.1, pp. 330–341. [Original paper](https://www.vldb.org/conf/1996/P330.PDF). Predicate-region coverage and cached/remainder split; the paper explicitly limits its studied query model to selections on single relations.
[^W5]: PostgreSQL official documentation, [Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html), §§13.2.1–13.2.2. Accessed documentation resolved to PostgreSQL 18. Supports statement-versus-transaction snapshot behavior, not cross-request lifetime or engine-independent parity.
[^W6]: PostgreSQL official documentation, [Snapshot Synchronization Functions](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-SNAPSHOT-SYNCHRONIZATION). Export/import requires the exporting transaction to remain open. A retained snapshot is a real resource/lifetime obligation.
[^W7]: WHATWG, [Fetch Standard — abort fetch](https://fetch.spec.whatwg.org/#abort-fetch). The abort algorithm rejects/cancels/errors the relevant promise and streams; it makes no application-database completion guarantee. Also verified React's official [Fetching data with Effects](https://react.dev/reference/react/useEffect#fetching-data-with-effects), whose ignore/cleanup example addresses reordered responses.
[^W8]: PostgreSQL official documentation, [Canceling Queries in Progress](https://www.postgresql.org/docs/current/libpq-cancel.html). Successful cancellation dispatch does not guarantee an effect. Actual eventual TypeScript driver support remains unproved.
[^W9]: PostgreSQL official documentation, [LIMIT and OFFSET](https://www.postgresql.org/docs/current/queries-limit.html). Unique ORDER BY is required for predictable subsets; order alone does not pin source contents.
[^W10]: Gray, Bosworth, Layman and Pirahesh, *Data Cube: A Relational Aggregation Operator Generalizing Group-By, Cross-Tab, and Sub-Totals*, MSR-TR-95-22 (1995), §5. [Microsoft Research original PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-95-22.pdf). Intermediate sum/count state for averages; no implication that overlapping distinct entities or floating-point parity is solved. Also verified PostgreSQL [Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html): count variants and null on empty sum require explicit mapping to explorEDA, whose no-valid-input result is often undefined.
[^W11]: IETF, [RFC 8259 — JSON](https://www.rfc-editor.org/rfc/rfc8259), §6. Numeric syntax excludes nonfinite values; interoperable exact integer range is bounded for common binary64 implementations. This is a compatibility requirement, not a transport-format selection.

## 14. Compact completion summary

- **Access/baseline:** GO from the selected packet for `byronwall/explorEDA` at `f01ff0fb1f9e1240020744a18816f2dad68bf488`; 34 baseline hashes and three photo hashes match. No runnable checkout claimed.
- **Files read:** all 34 baseline files, manifest/notes, all three notebook photos, track 1 prompt; the other two prompts served only as coordination context. Missing imported helpers/callers are listed above.
- **Checks:** archive/hash/prompt and artifact/example validation only. The specified Vitest, typecheck, UI check, full build/test check, application browser checks, database fixture and performance proof were not run.
- **Deliverables:** `database-query-contract-research.md`, `database-query-contract-recommendations.json`, and a ZIP containing both. Intended future repository location remains Codex's `docs/intent/database-query-contract/raw/2026-10-11-pro/`; this report does not claim to have saved anything there.
- **Recommendation:** existing authored analysis plus a narrow demand/read boundary; complete projected snapshots first; conservative coverage and explicit population/snapshot identity; bounded aggregates/evidence only when their need is demonstrated.
- **Unresolved assumptions:** first-milestone stage inspection scope, representative width/device budgets, supported scalar/calculation/collation subset, key availability and snapshot reuse lifetime.
- **Blockers:** none for this bounded recommendation/proof design. Missing runtime checkout/fixtures and the unselected adapter/transport decisions block implementation or parity/performance claims, not delivery of this research.
