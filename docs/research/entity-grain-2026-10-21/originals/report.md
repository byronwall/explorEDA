# R043 — Entity grain across existing preparation and chart paths

**Decision date:** October 21, 2026 (America/Indianapolis).  
**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA).  
**Pinned baseline:** `f4cacdde180e16ad814451a8c064e394535565d6`.  
**Mode:** read-only research; application integration and review belong to Codex.

## Decision and status

**GO for this bounded contract study and a targeted verification follow-up. Retain distinct identity contracts; align only semantics that mean the same thing. NO-GO for forced reducer unification or a new identity/metric platform.** The supplied reducers, types, tests, fixture, and actual trace consumers are readable. The required evidence is sufficient for a source-grounded decision, but it is not a product execution proof.

The highest-value next action is a contract table and a small fixture in the two existing test suites, followed by one narrowly gated conflict-count repair if the source prediction reproduces. A separate small explanation repair is justified for entity-count trace wording. A project evidence repair should first try the existing diagnostic message plus navigation to the prior stage; build out per-measure witness records only if that does not let an author identify the responsible entity and rows. These are proposals EG01–EG04, not changes made by this research.

Three findings drive the decision:

- **Intentional differences:** source records and selected typed field values can define different entities. Project aggregation also retains a nullish derived ID using the current result-row key; shared aggregation excludes that ID. These branches must be named explicitly, not treated as unconditional parity.
- **A clean disagreement worth reproducing:** for equivalent entities `x:{10,20}`, `y:{5}`, with no missing or invalid amounts, source inspection predicts shared measured count unavailable and project measured count `1`. Both numeric sums/averages are unavailable. This isolates failure policy, not grain or null eligibility.
- **A concrete explanation gap:** project group provenance survives, but its numeric per-measure records omit conflicting entities and repeated copies; count has no per-measure records. The current query diagnostic UI renders counts by code and does not show the conflict identity embedded in the message. Shared summaries retain every row's reasons, but the contributor table omits the entity key. [S1–S4, S8–S12]

**No Vitest, type check, build, SQL execution, browser proof, or author proof ran.** Source predictions below must not be relabeled as observed product results. The executed work was input/source integrity verification, source/consumer inspection, independent arithmetic and exact-set checks, and deliverable validation.

## 1. Access, authority, and limits

The canonical URL in the task establishes owner `byronwall` and repository `explorEDA`. GitHub repository metadata confirmed that identity, and exact-ref file access succeeded. The commit endpoint identifies the pinned commit as the PR463 merge. The research branch `codex/entity-grain-research-2026-10-21` is supplied context; no local checkout of that branch was opened or created.

The packet has 35 sections: 28 baseline files, two parsed catalogue projections, three historical PR451 files, and two local additions. All 35 extracted sections matched their declared SHA-256 values. All 28 baseline packet files were then fetched from GitHub at the exact commit and matched byte for byte. Eighteen additional exact-baseline files were retrieved to follow relevant types, calculation references, conversion adapters, and actual trace consumers. The inventory below identifies the read scope. No unrelated private context was inspected.

| Input | Executed integrity result |
| --- | --- |
| Source packet, 340,222 bytes | SHA-256 `4c13e167ffed2a36c0cdd34b55986e445a9617a111a4b7bf35d64f897b42d6a4`; 35/35 section hashes match |
| Attached prompt and packet-local prompt | Byte-identical; SHA-256 `ab4cfab9df409b54b046c660803d82902845aca974fee5f4cea411b0e8c2d182` |
| Baseline packet files versus GitHub | 28/28 exact byte matches at `f4cacdde180e16ad814451a8c064e394535565d6` |
| Independent frozen oracle | Written before its author inspected either reducer or current outputs; unchanged hashes rechecked after prediction |

Public-web attempts to open the GitHub tree/raw file returned `DisabledError`; the purpose-built GitHub reader worked. This is not a repository access failure. The packet and fetched files remain selected source, **not a complete runnable checkout**. Dependencies were not installed. No application files, services, branches, pull requests, or deployments were changed.

Keep these provenance distinctions:

- The full R043 idea retains catalogue-era baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`; this task uses the newer explicitly pinned commit.
- `catalogue-selected/ideas.json` and `catalogue-selected/review.json` are packet projections, not original repository paths.
- PR451 files are pinned at `0984715cb4c0c85d0d6efa8436ab38368bd20ae1` and discuss historical reviewed source `b07f3cf3483130f6cc3391bba47a87f616c93321`.
- Local queue completion statements for R026/PR465 and R008/PR464 are supplied research context, not fresh PR status checks.
- PR451's 18-row author and exact-contributor proofs remain proposed, unimplemented, and unrun. Adopting its preparation boundary did not pass those proofs. [S13–S15]

Omitted or only partially inspected dependencies include the complete store/filter pipeline, calculation function registry and external parser runtime, field-profile rendering internals, all other chart reducers, project file/worker serialization, docs registration/gate contents, and most component/import tests. Relevant adapters were followed far enough to qualify the direct comparisons; no end-to-end conversion or filtering proof is asserted. R026's distinctions are reused without another missing-value survey. R077's source-replacement persistence is out of scope.

## 2. The equivalence contract comes first

An entity-aware aggregate consists of more than an operation name:

1. The same scoped input rows, after the same filtering and group boundary.
2. The same partition of those rows into entities.
3. The same measure values presented to the reducer.
4. The same eligibility rule for count or numeric contribution.
5. The same repeated-value agreement and failure policy.
6. A trace that preserves group membership separately from selected representatives and numeric contributors.

For source identity to mean the same entity as a selected field value, there must be a **bijection between source-occurrence classes and nonnull typed-value classes within the compared scope**. Copies of one source must have the same selected value; two independent source records must not share that selected value. Each compared row must resolve the intended source reference. Missing values, repeated business labels, changed field origin, unmatched lookups, or different group/filter scope can break equivalence; the actual scoped identity partition is decisive. Equality of totals, counts, or display labels does not prove equivalence.

### Current identity contracts

| Path | Identity and missing-ID rule | Meaning and parity boundary |
| --- | --- | --- |
| Shared `summarizeGroup` | Typed `categoryKey(entity)`; null/undefined selected IDs excluded with per-row reason | One selected field value per group; no original-source identity available |
| Project, selected field with source origin and a matching reference | Uses source ID plus source row key; selected field value is not the identity token | One represented original source occurrence, even if the chosen label repeats or is null |
| Project, no matching source reference | Nonnull value uses `stable(entity)`; null/undefined uses `row:${row.key}` | Typed-value grouping plus an explicit per-result-row fallback; not shared null exclusion |

The source-origin branch applies to **any field from that source**, not only its declared key. `calculateFrame` assigns a copied field step origin, so copying a field can select a different branch without changing its displayed values. The parser and calculator's field-reference path preserve the finite/string/null fixture values; that observation is source inspection, not calculator execution. [S2–S4, S17]

A source with a missing or duplicate declared key receives a distinct positional reference for **each** affected record and diagnostics; a keyless source intentionally uses positions without per-row missing-key diagnostics in `sourceReferences`. A successful lookup may join on a different, unique relationship key. Missing/duplicate primary identity therefore does not necessarily mean an ambiguous lookup. Conversely, ambiguous lookup values are not filled from the first match: candidate references are retained in `contributors`, while `sourceRows` gains the target only for a unique selected match. [S2: sourceReferences, lookupFrame; S5]

### Measure contracts

| Aspect | Shared summary | Project aggregate |
| --- | --- | --- |
| Count without a measure | Counts selected row/entity units | Counts selected row/entity candidates |
| Count with a measure | Counts every nonconflicting selected unit, including null/invalid input; raw-input conflict can invalidate the whole result | Counts nonnull representative inputs, including invalid text; conflicting entities are dropped, but count remains available |
| Sum/average | Finite numeric inputs using existing parsing helpers | Same finite numeric helpers, after nonnull candidate selection |
| Repeated measure agreement | `Object.is` on values supplied to the reducer | `stable(value)` string tokens |
| Numeric conflict scope | Whole result unavailable | Whole result unavailable |
| No eligible numeric inputs | Unavailable, not an observed zero | Unavailable, not an observed zero |

“Raw agreement” means **the reducer's input value before its own numeric parsing**. It does not mean original file bytes or the shared `rawInputs` evidence sidecar. Chart/store adapters can already have applied field conversion. The direct `10` versus `'10'` case must therefore be tested separately from its UI reachability. `planMetricCard` clears its measure for count, so the measured-count discrepancy is a shared API/project aggregate comparison, not a demonstrated metric-card count fault. [S1, S2, S7, S18]

The frozen oracle considered three measured-count intentions: all entities (E), finite numeric entities (V), and present raw scalars (P). **Do not add V as a new feature.** The current paths select different populations; preserve those ordinary contracts and document them. In particular, project `count(item.itemId)` must keep an unmatched parent's item count at zero. Replacing it with shared “count every unit” would break the existing shop expectation. [S5–S6]

The `+0/-0` edge remains an explicit agreement-policy decision: shared `Object.is` distinguishes their signs, while project tokens collapse both to `number:0`. Both represent observed numeric zero; neither is missing. Do not silently change one contract as a side effect of helper extraction.

### Three choices compared

| Choice | Benefit and cost | Disposition proposal |
| --- | --- | --- |
| Keep separate documented contracts only | Lowest implementation cost; preserves distinct grains, but leaves the clean conflict-count difference and explanation gaps unresolved | Necessary foundation, insufficient as the complete outcome |
| Align only genuinely shared meaning | Preserve source identity, value grouping, missing fallback, count eligibility, and provenance; verify/fix the bounded failure-policy boundary | **Recommended: EG01–EG04** |
| Force one reducer | Would need an identity adapter, eligibility policy, agreement policy, and evidence translation; naïve sharing loses events or reasons | **NO-GO: EG06** |

Existing code duplication alone does not justify extraction. Both numeric paths already use the common value parser. A helper is worthwhile only after a smaller change has a demonstrated benefit and passes the preservation gates.

## 3. Frozen fixture and source-predicted results

An independent reviewer froze the normative memberships and alternatives before reading either implementation. Freeze time was October 21, 2026, 19:08:07 UTC (15:08:07 Indianapolis). The frozen Markdown SHA-256 is `2c02dc6c3b50253605ea86bea79c9e452c05797ab1398f64b9fd00c216e0ef15`; JSON SHA-256 is `d285f45c2486cdd56cc6c1a458b7b78216f4741a0e6b2cf131f3eb4d5c25b80d`. The complete normative tables and construction mapping are reproduced in **proof-plan.md**. The following tables are explicitly **source predictions**, independently checked for arithmetic and exact membership, not evaluator output.

### Main nine-row fixture

Rows r1/r2 are copies of event A, amount 10. Event B/r3 is independently observed, also amount 10 and label “shared.” r4 is entity number 1/amount 2; r5 is string1/amount 3; r6 is Z/zero; r7 is N/null; r8 is I/“bad”; r9 has a missing selected entity and amount 7. The source event IDs remain unique. Parts p1…p9 generate the expansion. The first eight rows define F1-E; adding r9 defines F1-A.

For F1-E, the exact entity classes are `{r1,r2}|{r3}|{r4}|{r5}|{r6}|{r7}|{r8}`. Representatives are `{r1,r3,r4,r5,r6,r7,r8}`; numeric representatives are `{r1,r3,r4,r5,r6}`. Null/invalid numeric exclusions are `{r7,r8}`; r2 is a repeat. The full project source membership has seven event references plus eight part references, **15 references**, not five numeric entities.

Each tuple below is **(count without measure, count with amount, sum, average)**. U means unavailable.

| Scope / identity | Shared prediction | Project prediction |
| --- | --- | --- |
| F1-E, source-key-equivalent entity, r1–r8 | (7, 7, 25, 5) | Source-origin or copied nonnull entity: (7, 6, 25, 5) |
| F1-L, repeated label, r1–r8 | (6, 6, 15, 3.75) | Source-origin label: (7, 6, 25, 5); copied label: (6, 5, 15, 3.75) |
| F1-M, r9 only, missing selected entity | (0, 0, U, U) | Source-origin and copied-null fallback: (1, 1, 7, 7) |
| F1-A, all nine, entity field | (7, 7, 25, 5) | Source-origin or copied entity: (8, 7, 32, 16/3) |
| F1-A, all nine, label field | (6, 6, 15, 3.75) | Source-origin: (8, 7, 32, 16/3); copied: (7, 6, 22, 4.4) |
| Observed zero r6 | (1, 1, 0, 0) | (1, 1, 0, 0) |
| Null amount r7 | (1, 1, U, U) | (1, 0, U, U) |
| Invalid amount r8 | (1, 1, U, U) | (1, 1, U, U) |
| Typed keys r4/r5 | (2, 2, 5, 2.5) | (2, 2, 5, 2.5) |
| Filtered r3/r6 | (2, 2, 10, 5) | (2, 2, 10, 5) |

F1-E's count difference is precisely r7/null; r8/invalid text counts in both measured counts. Numeric results agree. F1-L deliberately merges B into the same label value as A only in the value-grain question. Forcing its source-grain sum 25 to 15 would discard a legitimate event. F1-M exposes the separate project missing-value fallback; preserving it is a proposed current-contract decision, not proof that the frozen value-exclusion alternative was implemented. [S1–S4]

### Missing/duplicate source keys: F4

Targets T1…T4 have `(pk,joinKey,amount)` = `(null,j1,5)`, `(dup,j2,8)`, `(dup,j3,8)`, `(safe,j4,9)`. Left rows L1…L6 join respectively to j1,j1,j2,j2,j3,j4. The lookup is unambiguous because it uses `joinKey`, not broken `pk`. All six left references and all four targets remain in full group membership G.

| Contract | Exact representative rows | Predicted count / sum / average |
| --- | --- | --- |
| Project source-origin target field | k1, k3, k5, k6; T1/T2/T3/T4 remain four entities | 4 / 30 / 7.5 |
| Shared selected pk | k3, k6; k1/k2 missing-ID excluded; k4/k5 repeat “dup” | 2 / 17 / 8.5 |
| Project copied pk | k1, k2, k3, k6; each missing copy gets its own result-row identity | 4 / 27 / 6.75 |
| Negative control: all four pk values valid and unique | k1, k3, k5, k6 in every path | 4 / 30 / 7.5 |

Source-origin and copied project counts both equal 4 while their memberships and sums differ. This is the most compact demonstration that a total-count parity check is inadequate. The original frozen value contract expects missing-value exclusion; the project copy branch instead retains two missing-value rows. That alternative is surfaced explicitly rather than retroactively rewriting the oracle. [S2: sourceReferences, lookupFrame, aggregateFrame]

### Minimal failure-policy candidate: F2-min

Use two parent entities x,y and three expansion witnesses x1=10,x2=20,y1=5. Select the source-origin parent ID as entity and the witness amount as measure; the shared inputs use the same x/x/y values. No calculator, missing key, invalid amount, or ambiguous relationship is required.

| Operation | Shared prediction | Project prediction |
| --- | --- | --- |
| Count without measure | 2 | 2 |
| Count with amount | U | 1, retaining y only |
| Sum / average | U / U | U / U |
| Control: change only x2 from 20 to 10 | count 2; measured count 2; sum 15; average 7.5 | Same |

Both paths have the same partition `x:{x1,x2}; y:{y1}`, the same input group, and exclusively finite nonnull measures. The measured-count difference cannot be explained by the ordinary count-population distinction. The project type comment says conflicting values are unavailable without a count exception; its implementation uses whole-result invalidation only for sum/average. The recommended policy is whole-result unavailable for a measured scalar conflict, keeping count-without-measure available. Entity-only exclusion remains the explicit alternative to reject or adopt before repair; it must never look like a complete count. [S1: summarizeGroup; S2: aggregateFrame L609–659; S3: AggregateMeasure]

This is a **high-confidence source-predicted fault candidate, not an executed failure**. EG02 is conditional on reproducing it through the public evaluator/shared API in a complete checkout and confirming the policy. The scalar 10 versus text 10 case similarly predicts conflict in both paths, while signed zero isolates a separate unresolved equality policy. Neither warrants a general abstraction.

### Existing shop control: 150 versus 140 is correct

The supplied tests assert source order total 150 and represented order total 140. Independently checking the fixture gives:

- Source orders: `{O1,O2,O3,O4,O5}`, amounts 30,20,50,40,10 →150.
- Orders represented in items: `{O1,O2,O3,O4}` →140.
- Item rows: `{I1,…,I8}`, parent order amounts repeated 2,1,3,2 times →310.
- Item revenues sum 140; this equality with represented order amounts follows this fixture, not a universal identity.
- Once-per-order numeric representatives after lookup are I1,I3,I4,I7. Group provenance also retains the other item rows.
- O5 has no items. In `orders-and-items`, keep-unmatched retains O5, item count is 0, and item revenue remains unavailable.

These are read test expectations plus executed independent arithmetic/membership checks; the tests themselves were not run. Preserve all of these ordinary cases. [S5–S6]

`poolAggregateRows` deserves preservation too: it reconstructs input rows and re-runs `summarizeGroup`, so pooling groups is not summing per-group counts or averaging their means. An ID represented in two groups is one entity in the pooled population. The targeted follow-up must check exact pooled membership and filter scope, not replace this with scalar pooling. [S1: poolAggregateRows]

## 4. Can the author explain an unavailable result?

**Some evidence is available directly; universal discoverability is not established.** Distinguish an absent numeric result from lost source records.

| Evidence category | Shared path | Project path |
| --- | --- | --- |
| Full group source membership | Every input row has a contributor record | Unique unions of group sourceRows and contributors retained separately |
| Representatives | First-row representatives internally; successful included/repeat flags and row IDs identify contributions. Invalid units need entity grouping and input order | First row of each nonconflicting unit; numeric ledger contains only these representatives |
| Numeric eligibility | Input/raw evidence and reasons per row | Sum/average representative inputs and numeric reasons; not consumed by inspected query UI |
| Repeated copies | Retained with repeat reason when the representative contributes | Absent from per-measure ledger; remain in group/prior-stage data |
| Conflicts | Every witness retained with conflict reason and typed entityKey | Diagnostic names internal identity in message; conflict rows skipped before ledger creation |
| Counts | Per-row evidence retained | Neither count branch populates measureContributors |
| Responsible entity in visible trace | Contributor table omits entityKey; source row IDs/reasons remain | Generic diagnostic counts hide the identity message; prior-stage comparison remains possible |

The actual trace route was followed at the pinned commit, beyond the packet's adapters: `MetricCard` registers its trace, `ChartTraceScope` resolves it, and `ChartTracePanel` selects `MetricCardTraceBody`, which uses `AggregateContributorTable`. For sum/average in the full table, it displays source ID, input/raw/type and reason, with pagination. Count suppresses input columns; compact tables may omit raw/type columns. It does not display the selected entity value. Thus the shared missing entity column is retained evidence not rendered, rather than absent evidence. [S7–S10]

For project navigation, `traceRowIds` includes all contributor IDs, not included-only inputs; `QueryRowsLink` maps them through `AnalysisChartContext.resultRows` to output row keys. `ExplorEdaProject` supplies the evaluation, and `ProjectQueryPanel` permits prior-stage inspection. `QueryStageRows.relatedRecords` starts from group contributors and may expand child relationships two levels. That surface is contextual provenance, not an exact numeric ledger. Its related-source table shows the first 25 records; stage rows have their own “more” control. A tiny case can be manually reconstructed; larger-case author sufficiency was not tested. [S10–S12]

In F2-min, shared sum/average evidence is exactly x1=false/conflict, x2=false/conflict, y1=true/input5, with the whole scalar unavailable. Project's numeric ledger contains only y1. G still contains both parents and all three witnesses, and the pre-aggregate stage retains their values. The project diagnostic has stepId/fieldId and identity in its message, but no structured witness rowKey list; `QueryFlow.Diagnostics` displays counts by code only. Merely rendering the existing ledger cannot recover the omitted conflict and repeat records. [S2, S11–S12]

The aggregate stage’s `excludedCount`, computed by `evaluateAnalysisQuery`, counts false-included entries across measure arrays, not unique source rows. It source-predicts 0 for the F2-min conflict because the witnesses were omitted; F1-E with both sum and average counts the same two invalid representatives twice. **No visible “0 excluded” bug is claimed:** the inspected flow displays input/output counts, not that field. Any later ledger repair must define duplicate/conflict/numeric exclusion accounting deliberately. [S2: evaluateAnalysisQuery L852–865; S11]

There is also a smaller, direct wording mismatch: `MetricCardTraceBody` says each matching row adds 1 and labels `plan.rowCount` as Matching rows. In entity mode that number is nonconflicting entity units, not the input-row count; a conflict can reduce it further. Show input rows from contributor length and separately name used values/entities. Do not simply rename rowCount to all entities. The positive control is r1/r2 sharing one ID; the negative control is ordinary independent rows. [S1, S7, S9]

For all-invalid amounts, there may be no numeric entity to blame: the explanation must name null/invalid rows. For all-missing selected IDs, shared evidence names excluded rows without inventing an entity. For an empty group, there are no witness rows. These cases must remain distinct from an observed zero and from a conflict. The proof plan covers each; no browser/author pass is inferred.

## 5. Upstream preparation: simpler when the intended relation already exists

PR451's retained boundary is sufficient: use complete local rows for local preparation, and author SQL or files upstream for separately prepared/reused relations. Do not add a query engine or make arbitrary query outputs joinable to solve R043. A prepared source provides immediate prepared-row provenance; it does not automatically restore database-input witnesses. [S14–S15]

A keyed preaggregate plus lookup can be simpler when the author already owns the relation. Direct entity aggregation is smaller when complete local detail and expansion witnesses are the point of the analysis.

| Direct local entity aggregation | Keyed preaggregate followed by lookup |
| --- | --- |
| Uses existing rows and source references; can inspect pre-aggregate witnesses | Authors grain once upstream; one validated row per parent prevents lookup fan-out |
| Requires explicit identity and scalar agreement after expansion | Requires validated nonnull unique keys, agreed typing, scope, and upstream error policy |
| Full group references survive locally | Immediate prepared-row identity survives; underlying event membership needs an authored audit relation if required |
| Filtering can change represented entity populations | Upstream selection must match that population; an all-parent source is not a represented-parent source |
| Existing numeric parser governs reducer inputs | Numeric-or-null input normalization and finite-value checks must be authored before comparison |

The following is a **proposed, unexecuted SQL recipe** for clean finite numeric-or-null amounts and unique nonnull parent keys. It counts independent events even when their amounts are identical. Both SELECTs are alternatives to review, not a program run in this research.

```sql
-- Preconditions: parents.parent_key is unique and nonnull.
-- selected_events retains each independently observed event once.
-- Keys use the same authored type; amount is finite numeric or NULL.

-- All-parent relation: keep the amount, count, and absence evidence separate.
WITH child_totals AS (
  SELECT
    parent_key,
    COUNT(*) AS event_count,
    COUNT(amount) AS amount_count,
    SUM(amount) AS amount_sum
  FROM selected_events
  GROUP BY parent_key
)
SELECT
  p.parent_key,
  p.parent_amount,
  c.event_count,
  c.amount_count,
  c.amount_sum
FROM parents AS p
LEFT JOIN child_totals AS c USING (parent_key);

-- Represented-parent relation: only parents with selected events.
-- Use this population when comparing to entity aggregation on event rows.
SELECT p.parent_key, p.parent_amount
FROM parents AS p
SEMI JOIN selected_events AS e USING (parent_key);
```

Parent-amount parity compares `p.parent_amount` once per selected parent. `c.amount_sum` instead sums independent child events and is a separately authored metric. Preaggregation must not turn an unresolved scalar-per-entity conflict such as x:{10,20} into 30, or select 10, and claim to preserve the same intention.

A missing joined group stays missing in this recipe. A present all-null group has positive event_count, zero amount_count, and unavailable amount_sum. An observed-zero group has a valid amount count and sum 0. No blanket coalescing of sums is allowed. A later event-level average must use total amount_sum divided by total amount_count, not an unweighted average of parent averages. If the desired question is average **parent** amount, its denominator is instead the selected parent set.

Do not use `SUM(DISTINCT amount)` as once-per-entity: two valid independent events with amount 10 would become one value. Do not repair missing/duplicate business keys with an arbitrary first amount. Mixed typed keys require an explicit type-preserving scalar identity or validated normalization before lookup; SQL's typed column is not automatically the JavaScript scalar contract.

Only two current official pages are decisive, accessed October 21, 2026:

- [DuckDB aggregate functions](https://duckdb.org/docs/2.0/sql/functions/aggregates), sections “DISTINCT Clause,” “Handling NULL Values,” and count/avg/sum: count counts rows; count(argument) counts nonnull arguments; general numeric aggregates omit nulls; non-count aggregates return null on empty groups; DISTINCT acts on input values.
- [DuckDB FROM/JOIN](https://duckdb.org/docs/2.0/sql/query_syntax/from), “Outer Joins” and “Semi and Anti Joins”: left joins retain unmatched left rows with null right fields; semi joins retain represented left rows without multiplying them.

The stable documentation redirected to 2.0. The baseline package lists `@duckdb/node-api` `1.5.6-r.1` as a development dependency; this is not proof of the installed runtime. The recipe still needs execution against its intended engine and driver types. The claims about this particular recipe's cardinality are reasoning under its key assumptions, not vendor promises or measured productivity/performance.

## 6. Prioritized proposals, uncertainty, and strongest counterargument

All substantive recommendations have stable IDs and complete cost/alternative/gate records in recommendations.md. Their dispositions are proposals.

| Recommendation | Proposed disposition | First concrete gate |
| --- | --- | --- |
| EG01 — contract table and exact fixture tests | Adopt bounded documentation/verification | Record source/value/fallback policies and run the same scopes with exact sets |
| EG02 — measured-count conflict consistency | Conditional bounded repair | Reproduce F2-min and accept whole-result unavailability; preserve unmatched-item count 0 |
| EG03 — responsible-entity evidence | Conditional smallest explanation repair | Show conflict message/prior stage; escalate only if author cannot name exact witnesses |
| EG04 — shared/card trace grain wording and entity value | Bounded explanation repair after local reproduction | Repeated-ID positive control and ordinary row-count/zero controls |
| EG05 — upstream keyed recipe | Optional lesson, retain PR451 boundary | Demonstrate same selected population and disclose prepared-row provenance |
| EG06 — helper extraction / forced unification | Defer helper; reject forced unification | No extraction without preservation of identity, eligibility, reasons, and source sets |

Every proposed visible milestone pairs an exact docs section with the same new, proposed runnable project folder `docs/research/entity-grain-2026-10-21/examples/entity-grain/`. It is not present or executed in this deliverable. Existing `metric-card` LiveExample and the ordinary shop cards remain controls. No new API or named customer demand is inferred.

**Strongest counterargument:** these similar controls should have one predictable meaning. Depending on invisible field origin is difficult to teach, and the copied-null fallback can reintroduce expansion multiplicity. Documentation alone might leave an author unable to choose the intended entity or explain a result. That argues for a compact author proof and a specific failing-boundary repair. It does not justify discarding independent events, changing existing counts, or replacing per-row reasons with a common scalar reducer.

Open questions are deliberately bounded:

- Will the complete checkout reproduce F2-min's measured-count split through the supported APIs?
- Does the author prefer whole-result unavailability for measured count, or explicitly labeled entity-only exclusion? The former is recommended.
- Can existing diagnostic details plus prior-stage navigation explain x and both x witnesses without a new ledger UI?
- Is project derived-null row fallback acceptable once clearly documented? Preserve it initially; change only with an explicit contract decision and regression controls.
- Which signed-zero agreement policy should shared and project measured scalars promise?
- Can the chosen SQL runtime return the proposed keyed relation and types, if that optional lesson is implemented?

Multiple references to the same source through different aliases, aggregate-of-aggregate identity, source replacement, and extreme numeric accumulation are not proved here. They are not silently covered by the bijection assumption or the helper-extraction gate. Do not expand this study into R077 or a new catalogue.

## 7. Executed checks versus follow-up

**Executed:** packet extraction/hash checks; prompt equality; exact-ref GitHub reads and baseline byte comparisons; actual consumer inspection; frozen-oracle integrity; independent arithmetic and exact partition/source-set derivations, including shop150/140/310 and F4 memberships; final UTF-8, manifest, ZIP member/hash/CRC checks.

**Not executed:** product reducer calls, Vitest, component tests, `pnpm --filter exploreda check-types`, `pnpm check`, SQL, parser/calculator evaluation, browser layouts, screenshots, author workflow, performance measurements, implementation or review PR.

The archive and standalone reports are research artifacts. The proof plan contains runnable follow-up commands and explicit positive/negative controls, all marked proposed. Research stops at this bounded decision; a targeted follow-up is necessary, a broader preparation survey is not.

## Evidence references

All S references below identify exact repository paths and symbols at the pinned baseline, except S14–S15's explicitly historical ref. Line numbers refer to the fetched source files, not packet line numbers.

- **S1:** [packages/explorEDA/src/lib/aggregates.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/aggregates.ts), AggregateSpec L7–15; aggregateValues L94–120; summarizeGroup L134–223; calculateGroupedAggregate L225–255; poolAggregateRows L262–288.
- **S2:** [packages/explorEDA/src/lib/analysis/evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/evaluateProject.ts), stable/rowKey L44–46; sourceFrame/sourceReferences L48–156; lookupFrame L202–324; expandedFrame L326–434; calculateFrame L436–471; filterFrame L473–531; aggregateFrame L533–672; uniqueRefs L674–678; evaluateAnalysisQuery L755–927.
- **S3:** [packages/explorEDA/src/types/AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/AnalysisProject.ts), AggregateMeasure L84–91; AnalysisField/AnalysisSourceReference/AnalysisMeasureContributor/AnalysisResultRow/AnalysisDiagnostic L146–193.
- **S4:** [packages/explorEDA/src/lib/categories.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/categories.ts), categoryValue/categoryKey/categoryEqual; [packages/explorEDA/src/lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/valueParsing.ts), parseNumber L32–37 and numericExclusionReason L87–98.
- **S5:** [packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts), “keeps lookup row counts and totals at their declared grain,” duplicate identity, keyless source, unlike keys, empty total tests. Tests read, not executed.
- **S6:** [packages/explorEDA/src/test/fixtures/shopProject.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/fixtures/shopProject.ts), createShopFixture, orders/items, order-amount-on-items and orders-and-items queries; [packages/explorEDA/src/lib/aggregates.test.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/aggregates.test.ts), “entity-scoped aggregates.” Tests read, not executed.
- **S7:** [packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts), planMetricCard L46–167; [metricCardTrace.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/metricCardTrace.ts), makeMetricCardTraceSource.
- **S8:** [packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx), AggregateContributorTable L44–130.
- **S9:** [packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx), MetricCardTraceBody L5–59; [MetricCard.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx), snapshot construction and trace registration.
- **S10:** [packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx), TraceBody and QueryRowsLink L146–170; [traceRows.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/traceRows.ts), traceRowIds; [ChartTraceScope.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx), revision-safe trace routing.
- **S11:** [packages/explorEDA/src/components/project/QueryFlow.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryFlow.tsx), Diagnostics L255–269, FlowStep; [ProjectQueryPanel.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx), output focus L95–102; [ProjectQueryPanel.test.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/ProjectQueryPanel.test.tsx), read-only coverage evidence.
- **S12:** [packages/explorEDA/src/components/project/QueryStageRows.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryStageRows.tsx), QueryStageRows, relatedRecords L210–263, SourceTable L342–389; [sourceRowIdentity.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/sourceRowIdentity.ts), sourceRowIdentities/resolveSourceRow; [ExplorEdaProject.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/ExplorEdaProject.tsx), runtime row IDs L144–146 and analysis context L353–363.
- **S13:** [docs/intent/research-ideas-100/ideas/R043-entity-grain-parity.md](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/research-ideas-100/ideas/R043-entity-grain-parity.md), full brief; catalogue README and selected packet projections; local research queue.
- **S14:** Historical [docs/research/data-preparation-boundary-2026-10-16/README.md](https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/README.md) and [decisions.md](https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/decisions.md), retained preparation boundary and DP-05 limits.
- **S15:** Historical [docs/research/data-preparation-boundary-2026-10-16/originals/proof-plan.md](https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/originals/proof-plan.md), proposed status, membership distinctions, author/contributor gates.
- **S16:** [docs/intent/current-analysis-trust/intent-brief.md](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/current-analysis-trust/intent-brief.md) and [docs/intent/reusable-analysis-metrics/intent-brief.md](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/reusable-analysis-metrics/intent-brief.md), source membership, numeric contributors, bounded proof and demand limits.
- **S17:** [packages/explorEDA/src/lib/calculations/engine/Calculator.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/engine/Calculator.ts), evaluateValue L93–102; [parser/semantics.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/parser/semantics.ts), fieldReference L252–257 and identifier conversion L370–379.
- **S18:** [packages/explorEDA/src/providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx), getAggregateResult L953–1014 and getColumnData L1193–1258; [packages/explorEDA/src/lib/fieldSettings.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldSettings.ts), convertFieldValue L106–144 and applyFieldSettings L310–337.

## Appendix — actual source-read inventory

Read scope is stated honestly: fetching/verifying a whole file is not the same as reading all of its unrelated contents. Packet sections marked historical/projection/local retain those origins. The 18 supplemental files were fetched at the exact current baseline. The inventory follows below.

| Source path | Provenance | Actual read scope |
| --- | --- | --- |
| `AGENTS.md` | baseline | Full file: verification, changesets, research and UI expectations |
| `docs/agent-guide.md` | baseline | Full file: workflow and docs/example verification |
| `CODING_STANDARDS.md` | baseline | Full file: React/TypeScript and inspection UI rules |
| `README.md` | baseline | Full file: project identity and entry points |
| `package.json` | baseline | Full file: workspace commands and package metadata |
| `packages/explorEDA/README.md` | baseline | Full file: library purpose and usage |
| `packages/explorEDA/package.json` | baseline | Full file: scripts, dependencies, package metadata |
| `docs/intent/research-ideas-100/README.md` | baseline | Full file: catalogue context and research conventions |
| `docs/intent/research-ideas-100/catalogue.md` | baseline | Requested seven IDs, priorities, and ordering; full bytes integrity-checked |
| `docs/intent/research-ideas-100/ideas/R043-entity-grain-parity.md` | baseline | Full file: ranked mission, boundaries, gates |
| `packages/explorEDA/src/lib/aggregates.ts` | baseline | Full file: shared contracts, reasons, grouped reduction, pooling |
| `packages/explorEDA/src/lib/aggregates.test.ts` | baseline | Full file: 259 lines; ordinary and entity-scoped expectations |
| `packages/explorEDA/src/lib/analysis/evaluateProject.ts` | baseline | Full file: 927 lines; source/lookup/expand/calc/filter/aggregate and stage evidence |
| `packages/explorEDA/src/types/AnalysisProject.ts` | baseline | Full file: steps, origins, references, result rows and diagnostics |
| `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` | baseline | Full file: 394 lines; grain, identity, lookup, empty cases |
| `packages/explorEDA/src/test/fixtures/shopProject.ts` | baseline | Full file: source rows, relationships and queries |
| `packages/explorEDA/src/lib/categories.ts` | baseline | Full file: typed category identity and normalization |
| `packages/explorEDA/src/lib/valueParsing.ts` | baseline | Missing/numeric helpers and relevant parsing declarations; date internals not needed |
| `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts` | baseline | Full file: count setup, entity plan, exclusions and labels |
| `packages/explorEDA/src/components/charts/MetricCard/metricCardTrace.ts` | baseline | Full file: trace source adapter |
| `packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx` | baseline | Full file: contributor table and group inspector |
| `packages/explorEDA/src/components/project/QueryStageRows.tsx` | baseline | Full file: current/prior rows, relatedRecords and source tables |
| `packages/explorEDA/src/components/project/sourceRowIdentity.ts` | baseline | Full file: source-row key helpers |
| `docs/intent/current-analysis-trust/intent-brief.md` | baseline | Full file: trustworthy results and inspection intent |
| `docs/intent/reusable-analysis-metrics/intent-brief.md` | baseline | Full file: metric intent and scope |
| `apps/demo/src/demos/analyses/shop.ts` | baseline | Full file: ordinary shop demo configuration |
| `apps/demo/src/docs/pages/metric-card.mdx` | baseline | Full file: current explanation and LiveExample |
| `apps/demo/src/docs/pages/project-folders.mdx` | baseline | Full file: folder format, launch route and Query steps |
| `catalogue-selected/ideas.json` | parsed projection | Full selected projection: requested candidate IDs and metadata |
| `catalogue-selected/review.json` | parsed projection | Full selected projection: review judgments and statuses |
| `docs/research/data-preparation-boundary-2026-10-16/README.md` | historical PR451 | Full historical file: retained preparation boundary |
| `docs/research/data-preparation-boundary-2026-10-16/decisions.md` | historical PR451 | Full historical file: decisions including DP-04/DP-05 |
| `docs/research/data-preparation-boundary-2026-10-16/originals/proof-plan.md` | historical PR451 | Full historical file: 457 lines; proposed author/contributor proofs |
| `docs/research/entity-grain-2026-10-21/pro-prompt.md` | local addition | Full local instruction file |
| `docs/research/entity-grain-2026-10-21/research-queue.md` | local addition | Full local queue: ordering, comparison scores, completion/reuse claims |
| `packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/project/queryEditing.ts` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/project/ProjectQueryPanel.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/project/QueryFlow.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/ExplorEdaProject.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/charts/trace/traceRows.ts` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/AnalysisChartContext.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/components/project/ProjectQueryPanel.test.tsx` | Exact-baseline GitHub supplement | full |
| `packages/explorEDA/src/types/ChartTypes.ts` | Exact-baseline GitHub supplement | datum declaration and relevant imports |
| `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` | Exact-baseline GitHub supplement | Full file |
| `packages/explorEDA/src/lib/calculations/parser/semantics.ts` | Exact-baseline GitHub supplement | field-reference grammar, identifier conversion, related parsing context |
| `packages/explorEDA/src/lib/fieldSettings.ts` | Exact-baseline GitHub supplement | convertFieldValue, applyFieldSettings, buildConversionPreview context |
| `packages/explorEDA/src/providers/DataLayerProvider.tsx` | Exact-baseline GitHub supplement | getAggregateResult, getColumnData, applyFieldSettings call sites, related imports |
| `packages/explorEDA/src/components/charts/MetricCard/definition.ts` | Exact-baseline GitHub supplement | Full file |
