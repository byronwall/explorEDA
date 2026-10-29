# Data preparation boundary: reproducible proof plan

**Status: proposed, unimplemented, and unrun.** This file specifies a future proof. No fixture program, SQL program, code patch, runnable example, or repository test was created or executed during this research.

**Baseline:** `byronwall/explorEDA`, commit `b07f3cf3483130f6cc3391bba47a87f616c93321`. The attached selected source packet is authoritative. The owner states that Codex rechecked this baseline and its packet hashes on 2026-10-18 with no context changes.

## 1. Decision this proof can reject

Begin with a documentation page and runnable example that demonstrate the existing local query steps. Keep wide-to-long reshaping, aligned period comparison, and a named result needed by a separate query in explicit author SQL or an upstream preparation tool. Add no local operators or database execution infrastructure initially.

The proof must show that a person can author, inspect, and correctly explain the five tasks below using this boundary. Correct evaluator output alone is insufficient. Reject the documentation-only recommendation if the person cannot recover the necessary meaning from the tiny visible stages after following the example, or if the actual SQL handoff is unacceptable for the concrete task. Record the exact failed action before choosing a correction. A failure does not establish demand for a general preparation editor.

These are designed test cases, not evidence of an established user population, recurring demand, a performance limit, or willingness to maintain another system.

## 2. Inspected baseline and limits

The following current capabilities are observed in the packet; the proposed outputs later in this plan are oracles to check in a runnable checkout.

| Inspected evidence | Consequence for this proof |
|---|---|
| `AnalysisProject.ts`: `AnalysisStep`, `SourceStep`, `AggregateMeasure`, `AnalysisView`, `AnalysisResultRow`, `AnalysisMeasureContributor` | Six step kinds already exist: source, lookup, expand, calculate, filter, aggregate. Grouped query output and multiple views of one query exist. There is no query-as-source dependency or reshape step. |
| `evaluateProject.ts`: `sourceReferences`, `lookupFrame`, `expandedFrame`, `aggregateFrame`, `filterFrame`, `evaluateAnalysisQuery` | Check actual grain, typed keys, ambiguity, retained unmatched parents, membership, numeric candidates, explicit query parameters, and output-stage evaluation. |
| `lib/analysis/sources.ts`: `sourceFromRows`, `addSourceFromRows`, `singleTableProject` | Adding supplied rows makes a new source identity; it does not establish a live dependency on a query or preserve its original reference graph. |
| `lib/dsl/project.ts`: `compileStep`, `compileQuery`, `checkReferences`, `stepLines`, `measureLine` | The text authoring route supports existing steps, same-query `from=`, aggregates and `per=`. Give each query an explicit output frame label because the default is the first source. |
| `ProjectQueryPanel`, `QueryFlow`, `QueryStageRows`, `relatedRecords` | Choose a query, switch to Full flow, inspect stages and related records, and open an independent query copy or stage view. The inspected rows panel does not display the numeric contributor object as a dedicated ledger. |
| `server/sources/refresh.ts`: `DRIVERS`, `refreshSource`, `readAndWrite`, `writeWhole`; `server/sources/types.ts`; `server/sources/contract.ts`: `runSourceContract` | Inspect the existing snapshot boundary and planned contract checks. Complete-or-refuse is per source. No mixed-source atomicity follows from one source's snapshot replacement. |
| `DatabaseSourceViews.tsx`; `project-folders.mdx`; `database-sources.mdx` | Use the existing Add database/query and explicit read/refresh author flow. Opening cached data and preparing new SQL are separate actions. |
| `test/lib/analysis/evaluateProject.test.ts` | Existing assertions cover declared-grain totals, ambiguity, duplicate identity, null/unlike keys, grouped output, typed parameters, empty aggregates, cycles, and collisions. Those assertions were read, not run. |

The packet omits `valueParsing.ts`, calculation-parser implementation, query-copy helpers, source-row identity helpers, the evaluator test's imported fixture, and individual adapter/read internals. Exact-ref retrieval did not supply the missing helpers. This fixture therefore uses finite native numbers, null, unique scalar IDs, and ISO date text. Text-to-number grammar, helper-specific exclusion-reason strings, adapter guarantees, and uninspected trace integration are explicit coverage limits. They must be checked in Codex's runnable checkout before claiming the proof passed.

The source model permits local grouped output already. The unprioritized reusable-analysis-output intent must not be read as proof that `AggregateStep` is absent. It concerns additional reuse contracts, not a missing existing aggregate operation.

## 3. Fixture and source contracts

The fixture contains **18 rows across five raw sources**. All ID, period, and segment values below are strings. `amount`, `gross`, `refunds`, and `slot` are native numbers where populated. Dates are ISO date strings. Only R3's amount and W2's refunds are literal null. No source file contains undefined; unmatched local projections produce undefined during evaluation.

### 3.1 Orders: four rows

Grain: one order. Source ID: `orders`. Entity key: `order_id`. Fields: `order_id` string, `day` date, `segment` string, `amount` number. Field labels match their IDs for this proof.

| order_id | day / segment | amount |
|---|---|---:|
| O1 | 2026-09-01 / A | 100 |
| O2 | 2026-09-01 / A | 50 |
| O3 | 2026-10-01 / A | 120 |
| O4 | 2026-10-02 / B | 0 |

### 3.2 Returns: four rows

Grain: one return event. Source ID: `returns`. Entity key: `return_id`. Fields: `return_id` string, `order_id` string, `amount` number. Several events for one order are legitimate. A null amount means an event exists but its amount is unknown.

| return_id | order_id | amount |
|---|---|---:|
| R1 | O1 | 20 |
| R2 | O1 | 10 |
| R3 | O3 | null |
| R4 | O9 | 5 |

R4 deliberately has no matching order. Do not lose it silently when orders drive a result.

### 3.3 Expected orders: four rows

Grain: one expected order. Source ID: `expected`. Entity key and sole field: `order_id`, string.

| order_id |
|---|
| O1 |
| O2 |
| O3 |
| O5 |

### 3.4 Calendar: four rows

Grain: one expected day. Source ID: `calendar`. Entity key: `day`. Fields: `day` date, `period` string, `slot` number. The calendar is explicit fixture data; this plan does not assume an existing date-spine generator.

| day | period | slot |
|---|---|---:|
| 2026-09-01 | prior | 1 |
| 2026-09-02 | prior | 2 |
| 2026-10-01 | current | 1 |
| 2026-10-02 | current | 2 |

### 3.5 Wide measures: two rows

Grain: one period report. Source ID: `wide`. Entity key: `wide_id`. Fields: `wide_id` string, `period` string, `gross` number, `refunds` number. This is supplied report data, not a claim that a local query produced it.

| wide_id / period | gross | refunds |
|---|---:|---:|
| W1 / prior | 150 | 30 |
| W2 / current | 120 | null |

### 3.6 Relationships and policies

| Relationship ID | Endpoints | Declared cardinality |
|---|---|---|
| `order-returns` | `orders.order_id` to `returns.order_id` | one-to-many |
| `expected-order` | `expected.order_id` to `orders.order_id` | one-to-one |
| `day-orders` | `calendar.day` to `orders.day` | one-to-many |

The declarations describe intended shape. The evaluator does not enforce their cardinality. Base-fixture entity keys must be non-null and unique. A duplicate key, unavailable source, or ambiguous lookup blocks reconciliation and any business claim that depends on uniqueness. Do not silently deduplicate or coerce a string key to a numeric key.

Rows are supplied in the displayed order. This makes the first representative used by entity reduction deterministic for the oracle. Production meaning must not depend on choosing the first ambiguous match.

### 3.7 Reference notation

`O1` through `O4` denote references whose `sourceId` is `orders` and whose `rowKey` is `orders:string:O1` through `orders:string:O4`. R1–R4 similarly denote `returns:string:R1` through `returns:string:R4`.

E1, E2, E3, and E5 denote `expected:string:O1`, `expected:string:O2`, `expected:string:O3`, and `expected:string:O5`. C1–C4 denote the four calendar references in displayed order, starting with `calendar:string:2026-09-01`. W1 and W2 denote `wide:string:W1` and `wide:string:W2`. Their `entityKey` is the corresponding source-key value. Braced lists later in this plan are explanatory sets, not array-valued source cells.

For all clean-fixture aggregate rows below, `sourceRows` and `contributors` contain the same reference set. This equality is not universal: ambiguous lookup candidates can occur only in `contributors`. `measureContributors` is a separate per-measure candidate list. Its entries can carry contextual source references as well as the record holding the numeric input.

## 4. Baseline query definitions

These are declarative property and step tables, not executable project text or programs. The implementation milestone must translate them into the existing DSL and validate that translation. Every query uses glyph `P`; its name is its ID. The project ID is `preparation-proof`, version 1.

### 4.1 Query properties

| Query ID | Output step | Explicit frame label |
|---|---|---|
| `order-returns` | `by-order` | one order |
| `orphan-returns` | `orphans` | one orphan return event |
| `missing-expected` | `missing` | one missing expected order |
| `unexpected-orders` | `unexpected` | one unexpected observed order |
| `daily-orders` | `daily` | one expected day |
| `segment-summary` | `segments` | one segment |
| `segment-rollup` | `weighted-average` | one summary across segments |
| `bound-orders` | `segment-filter` | one order in the bound segment |
| `period-comparison` | `period_comparison` | one comparison slot |
| `wide-to-long` | `prepared_long` | one period–metric cell |

The `bound-orders` negative-control query uses project parameter `segment`, type string, required true, with no default. The positive binding is A.

### 4.2 Source, join, filter, and grouping steps

| Query | Ordered steps | Exact settings |
|---|---|---|
| `order-returns` | `orders` source; `j` expand from `orders`; `by-order` aggregate from `j` | Source `orders`; relationship `order-returns`, alias `refund`, input field `orders.order_id`, keep unmatched true; group by `orders.order_id`. |
| `orphan-returns` | `returns` source; `matched-order` lookup from `returns`; `orphans` filter from `matched-order` | Source `returns`; relationship `order-returns`, alias `order`, input field `returns.order_id`; filter `order.order_id` with `is-null`. |
| `missing-expected` | `expected` source; `observed-order` lookup from `expected`; `missing` filter from `observed-order` | Source `expected`; relationship `expected-order`, alias `observed`, input field `expected.order_id`; filter `observed.order_id` with `is-null`. |
| `unexpected-orders` | `orders` source; `expected-order` lookup from `orders`; `unexpected` filter from `expected-order` | Source `orders`; relationship `expected-order`, alias `promise`, input field `orders.order_id`; filter `promise.order_id` with `is-null`. |
| `daily-orders` | `calendar` source; `cexp` expand from `calendar`; `daily` aggregate from `cexp` | Source `calendar`; relationship `day-orders`, alias `order`, input field `calendar.day`, keep unmatched true; group by `calendar.period`, `calendar.slot`, `calendar.day`, in that order. |
| `segment-summary` | `orders` source; `segments` aggregate from `orders` | Source `orders`; group by `orders.segment`. |
| `segment-rollup` | `orders` source; `segments` aggregate from `orders`; `all-groups` aggregate from `segments`; `weighted-average` calculate from `all-groups` | Repeat the segment steps in this query; `all-groups` has no group fields. Calculate field `weighted_mean`, label `weighted_mean`, expression `['total_gross'] / ['total_order_count']`. This is a same-query chain, not a reference to `segment-summary`. |
| `bound-orders` | `orders` source; `segment-filter` filter from `orders` | Source `orders`; field `orders.segment`, operator `eq`, parameter ID `segment`. |
| `period-comparison` | `period_comparison` source | Source `period_comparison`, prepared through the DuckDB handoff in §8; no local transformation. |
| `wide-to-long` | `prepared_long` source | Source `prepared_long`, prepared through the DuckDB handoff in §8; no local transformation. |

The one scalar formula above is the proposed calculation-expression property, not a standalone program. Validate its DSL round trip and calculator behavior before treating the example as runnable.

### 4.3 Aggregate measures

Each measure's label matches its ID. Unspecified entity fields are absent; no automatic distinct-value reduction is permitted.

| Aggregate step | Measure ID and operation | Input field / entity field |
|---|---|---|
| `by-order` | `gross`: sum | `orders.amount` / `orders.order_id` |
| `by-order` | `return_count`: count | `refund.return_id` / none |
| `by-order` | `refund_sum`: sum | `refund.amount` / none |
| `daily` | `order_count`: count | `order.order_id` / none |
| `daily` | `gross`: sum | `order.amount` / none |
| `segments` in both segment queries | `group_gross`: sum | `orders.amount` / none |
| `segments` in both segment queries | `order_count`: count | no field / none |
| `segments` in both segment queries | `group_mean`: average | `orders.amount` / none |
| `all-groups` | `total_gross`: sum | `group_gross` / none |
| `all-groups` | `total_order_count`: sum | `order_count` / none |
| `all-groups` | `mean_of_group_means`: average | `group_mean` / none |

Counts intentionally distinguish counting present child IDs from counting all rows. An unmatched expansion placeholder is a row but is not a child event.

## 5. Task oracles: values and contributors

### T1. Orders and returns without double counting

The raw grain is an order and a return event; the chosen output grain is one order. Orders define the main population. Execute `order-returns`; separately inspect `orphan-returns` so an unmatched return is accounted for.

The source, expansion, and aggregate stage counts must be **4, 5, 4**. Expanded row identifiers are exact:

| Shorthand | Expanded row key | Values and source references |
|---|---|---|
| J11 | `j:orders:string:O1:returns:string:R1` | order amount 100; refund amount 20; {O1, R1} |
| J12 | `j:orders:string:O1:returns:string:R2` | order amount 100; refund amount 10; {O1, R2} |
| J2 | `j:unmatched:orders:string:O2` | order amount 50; projected refund fields undefined; {O2} |
| J3 | `j:orders:string:O3:returns:string:R3` | order amount 120; refund ID R3; refund amount null; {O3, R3} |
| J4 | `j:unmatched:orders:string:O4` | order amount 0; projected refund fields undefined; {O4} |

| Output order | gross / return_count / refund_sum | `sourceRows` and `contributors` |
|---|---|---|
| O1 | 100 / 2 / 30 | {O1, R1, R2} |
| O2 | 50 / 0 / undefined | {O2} |
| O3 | 120 / 1 / undefined | {O3, R3} |
| O4 | 0 / 0 / undefined | {O4} |

The first output key is `by-order:["string:O1"]`; substitute O2–O4 for the remaining rows. The values object contains the group field `orders.order_id` and the three measure fields only.

Full numeric candidate lists, including excluded entries:

| Output and measure | Candidate input / inclusion | Candidate `sourceRows` |
|---|---|---|
| O1 gross | J11: 100, included | {O1, R1} |
| O1 refund_sum | J11: 20, included; J12: 10, included | J11 {O1, R1}; J12 {O1, R2} |
| O2 gross | J2: 50, included | {O2} |
| O2 refund_sum | J2: undefined, excluded | {O2} |
| O3 gross | J3: 120, included | {O3, R3} |
| O3 refund_sum | J3: null, excluded | {O3, R3} |
| O4 gross | J4: 0, included | {O4} |
| O4 refund_sum | J4: undefined, excluded | {O4} |

`return_count` has no `measureContributors` entry in the inspected implementation. Its semantic witnesses are R1 and R2 for O1, none for O2, R3 for O3, and none for O4. Do not fabricate count-contributor metadata.

As an additional declarative count check over all five `j` rows, an ungrouped count with no field and entity field `orders.order_id` must be **4**, using representatives J11, J2, J3, and J4. A plain row count is **5**; a count of `refund.return_id` is **3**. These checks distinguish entities, expansion rows, and present events. None creates a count `measureContributors` entry.

The per-entity gross candidate list keeps J11 as the first representative of O1; J12 is absent from that list, not recorded as an excluded duplicate. R2 remains a group member. The candidate's references include R1 as join context even though its input is the order's amount. The implementation check must compare actual candidate row keys, inputs, inclusion booleans, and references; check missing-value exclusion meaning without inventing the uninspected helper's exact reason string.

The correct gross sum across four orders is **270**. Summing the five expanded amounts without entity reduction gives **370**. Summing distinct numeric amounts is not an acceptable replacement for entity reduction; the equal-valued-order mutation below detects that error.

`orphan-returns` has stage counts **4, 4, 1**. Its sole output keeps key `returns:string:R4`, original return fields R4/O9/5, and undefined `order.*` fields. Its membership and contributors are {R4}. R1, R2, and R3 match before the filter, with respective memberships {R1,O1}, {R2,O1}, and {R3,O3}. Known refund amounts reconcile as **35 = 30 for known orders + 5 orphaned**; R3 remains unknown.

No automatic net total is an oracle here. Under a complete-return-source business rule, zero events may mean zero refund; an existing event with unknown amount may not. O3 must not be silently converted to a zero refund or a complete net figure.

### T2. Expected versus observed records

The two input grains are one expected order and one observed order. Keys must be unique and sources available before interpreting either exception view.

| Query | Stage counts and output | Exact membership |
|---|---|---|
| `missing-expected` | 4, 4, 1; expected O5 with undefined `observed.*` fields; key `expected:string:O5` | {E5} |
| `unexpected-orders` | 4, 4, 1; observed O4 with undefined `promise.order_id`; key `orders:string:O4` | {O4} |

Before the missing-record filter, matched rows have memberships {E1,O1}, {E2,O2}, and {E3,O3}. Before the unexpected-record filter, the analogous memberships are {O1,E1}, {O2,E2}, and {O3,E3}. Source and lookup rows have no numeric `measureContributors` entries.

Two inspectable exception views are an acceptable existing local result. A single normalized exception table with one status field requires an explicitly prepared union upstream; there is no local union step in this baseline.

The no-match test is `is-null`, not equality with null. An ambiguous lookup also projects undefined. Consequently, ambiguity or missing-source diagnostics **block** the label “missing.” They must not be interpreted as another missing business record. The duplicate-O1 mutation deliberately tests this distinction.

### T3. Period comparison with an absent day

The input calendar defines one expected day. `daily-orders` uses retained unmatched expansion and returns one row per expected day. Source, expansion, and aggregate counts are **4, 5, 4**.

| Expected day | order_count / raw gross | `sourceRows` and `contributors` |
|---|---|---|
| 2026-09-01, prior slot 1 | 2 / 150 | {C1, O1, O2} |
| 2026-09-02, prior slot 2 | 0 / undefined | {C2} |
| 2026-10-01, current slot 1 | 1 / 120 | {C3, O3} |
| 2026-10-02, current slot 2 | 1 / 0 | {C4, O4} |

Each values object contains the three group fields plus `order_count` and `gross`. The first output key is `daily:["string:prior","number:1","string:2026-09-01"]`; the remaining keys use their displayed typed period, slot, and date in the same order.

The full `gross` candidate lists are:

| Daily group | Candidate row key and input / inclusion | Candidate references |
|---|---|---|
| Prior slot 1 | `cexp:calendar:string:2026-09-01:orders:string:O1`, 100 included; `cexp:calendar:string:2026-09-01:orders:string:O2`, 50 included | {C1,O1}; {C1,O2} |
| Prior slot 2 | `cexp:unmatched:calendar:string:2026-09-02`, undefined excluded | {C2} |
| Current slot 1 | `cexp:calendar:string:2026-10-01:orders:string:O3`, 120 included | {C3,O3} |
| Current slot 2 | `cexp:calendar:string:2026-10-02:orders:string:O4`, 0 included | {C4,O4} |

Count has no numeric contributor object. Its witnesses are {O1,O2}, none, {O3}, and {O4}. The absent day has no observed-order contributor. The recorded zero is a valid numeric observation.

For the aligned comparison, the proposed SQL/upstream result has grain one slot and key `slot`. It carries `prior_count`, `current_count`, `prior_observed`, `current_observed`, `prior_gross`, `current_gross`, and `delta`.

| Slot | Amounts and delta | Presence and count |
|---|---|---|
| 1 | prior 150; current 120; delta −30 | prior true/count 2; current true/count 1 |
| 2 | prior 0; current 0; delta 0 | prior false/count 0; current true/count 1 |

The domain rule is explicit: after confirming a complete source for the declared day population, zero observed orders means zero sales. A positive order count with no numeric amount remains unknown. Unconditional null replacement is forbidden. Do not infer absent dates from a chart's currently selected subset.

The base-row oracle is slot 1 prior {C1,O1,O2}, current {C3,O3}; slot 2 prior {C2}, current {C4,O4}. The synthetic prior zero has no invented numeric contributor. Both sides' counts/presence stay visible even when the delta is zero.

When read as source `period_comparison`, key field `slot`, the exact local source references are **only** `period_comparison:number:1` and `period_comparison:number:2`, one per SQL result row. A source-only local query has equal `sourceRows` and `contributors` containing that immediate row and has no numeric contributor metadata. The base-row oracle above verifies the recipe; it is not automatic SQL lineage in explorEDA.

### T4. Wide measures to one row per metric

The desired output grain is one period–metric cell, with key `prepared_id`. Preserve null cells. The proposed result source is `prepared_long`, with fields `prepared_id`, `wide_id`, `period`, `metric`, and `value`.

| prepared_id | period / metric | value |
|---|---|---:|
| W1:gross | prior / gross | 150 |
| W1:refunds | prior / refunds | 30 |
| W2:gross | current / gross | 120 |
| W2:refunds | current / refunds | null |

Each output also carries its scalar `wide_id` W1 or W2. A null-preserving upstream recipe can combine two explicitly selected branches, one for each measure, without filtering null values. Validate the chosen dialect and actual recipe in the future example; no SQL program is included in this research artifact.

The base-row contributor oracle is respectively {W1}, {W1}, {W2}, {W2}. Numeric inputs are 150, 30, 120, and null; the last cell is a member but has no valid numeric value. This is an upstream cell-mapping oracle, not the current evaluator's `measureContributors` field.

The exact immediate local references after reading that SQL result are `prepared_long:string:W1:gross`, `prepared_long:string:W1:refunds`, `prepared_long:string:W2:gross`, and `prepared_long:string:W2:refunds`. A source-only query has one such reference in both reference collections for each row and no `measureContributors`. Its stage count is 4. Scalar `wide_id` lets the author inspect the named original report row; it does not create automatic lineage.

The base fixture has no native local unpivot step. Requiring an artificial metric source and conditional joins to emulate row creation is additional author work, not proof that a reshape operation exists. Observe whether the explicit upstream handoff is acceptable before selecting any new local operation.

For either SQL handoff, use scalar source IDs or a separate scalar contributor relation when raw lineage is required. Do not place arrays or nested records in ordinary source cells, and do not imply a companion relation is atomically refreshed with its result. If exact upstream lineage is necessary to the task, verify its population and refresh contract explicitly.

### T5. Reuse grouped results and preserve the denominator

`segment-summary` has counts **4, 2**. Two views in `analysis.eda` use the same query ID and therefore the same declared two-row grain; only their chart settings differ.

| Segment and output key | group_gross / order_count / group_mean | `sourceRows` and `contributors` |
|---|---|---|
| A; `segments:["string:A"]` | 270 / 3 / 90 | {O1,O2,O3} |
| B; `segments:["string:B"]` | 0 / 1 / 0 | {O4} |

For both `group_gross` and `group_mean`, A's complete candidate list is source rows O1 input 100, O2 input 50, O3 input 120, all included, each carrying only its own order reference. B's complete list is O4 input 0, included, carrying {O4}. `order_count` has no numeric contributor object.

`segment-rollup` repeats those steps in its own definition, then aggregates the grouped rows. It demonstrates same-chain aggregation, not named-query dependency. Its counts are **4, 2, 1, 1**. The `all-groups` row key is `all-groups:[]`; calculation preserves that key.

| Rollup field | Exact value | Full input candidate list |
|---|---:|---|
| `total_gross` | 270 | segment A input 270, included, refs {O1,O2,O3}; segment B input 0, included, refs {O4} |
| `total_order_count` | 4 | segment A input 3, included, refs {O1,O2,O3}; segment B input 1, included, refs {O4} |
| `mean_of_group_means` | 45 | segment A input 90, included, refs {O1,O2,O3}; segment B input 0, included, refs {O4} |
| `weighted_mean` after calculation | 67.5 | total_gross divided by total_order_count; no new aggregate candidate list is created for this calculated field |

The rollup and calculated row both have members/contributors {O1,O2,O3,O4}. The calculation retains upstream aggregate metadata but does not invent a separate numeric-contributor object for `weighted_mean`.

**45 averages two segment means. 67.5 averages four orders.** Both are valid answers to different questions. An output chart must not silently reinterpret the grouped rows as four independent source records.

All four order amounts are valid native numbers in this base fixture, so its order count is also its valid-amount count. A general weighted-mean recipe must carry the count of valid numeric inputs, not automatically reuse the count of all records. The O4-null mutation below tests the period policy; it does not certify the unchanged all-record denominator as a valid mean after that mutation.

Opening a stage as a view and copying a query are inspected UI entry points; the UI describes copying as independent. Do not call the copy a live upstream dependency. A separate query that needs a named grouped source must use an explicit prepared source or wait for an actual reuse task to justify a new contract.

## 6. Author flow to observe

1. Open the proposed `preparation-proof` project folder. Author the source, relationship, query, and parameter declarations using existing project text. Use its query picker to select the cases; do not assume a visual editor for every step exists.
2. Set each explicit frame label from the query-properties table. Check the output header, group fields, and row count together. The current first-source default is not sufficient evidence of aggregate output grain.
3. Choose Full query flow. Inspect source, expansion/lookup, and aggregate rows. For T1, identify all five expansion rows, then explain gross 270 rather than 370. Open the O1 result's related records and separate member/context records from the numeric amount field.
4. Inspect O2, O3, and O4. State which has no return event, which has an unknown refund amount, and which has a valid zero order amount. Recover the answer from visible tiny stages; no nonexistent contributor ledger is required for baseline acceptance.
5. Open the two reconciliation queries. Identify O5 and O4. Repeat after the ambiguity mutation and explain why classification is blocked. Do not accept a missing-looking projected cell as sufficient evidence.
6. Open daily rows. Explain why prior slot 2 is absent and current slot 2 is an observed zero. Apply the explicit upstream comparison recipe, retain presence/count fields, add it through the existing database-query source flow, and inspect its two returned rows.
7. Perform the wide-table handoff. Confirm four returned rows, including the null refunds cell. Explain the source ID carried by each returned row and the limit of automatic provenance. Record actual author actions, ambiguity, and maintenance work; do not substitute an estimated productivity score for observation.
8. Open the two views of `segment-summary`, then `segment-rollup`. Explain 45 versus 67.5. Open an intermediate step as another view and distinguish the independent definition from a live query dependency.
9. Apply and clear a linked chart selection. Observe the filtered display separately from query definitions and parameter bindings. It must not silently cause new source SQL, alter the authored aggregate grain, or manufacture an expected-day population from a temporary selection.
10. Exercise explicit parameter binding and refresh checks. Record outputs, diagnostic meanings, and source read times. Save and reopen the example to confirm its declared query/view behavior in the runnable application.

The evaluator does not accept chart settings, and inspected trace focus narrows the displayed output stage. The broader UI integration still needs execution; do not claim that this observation alone proves every selection path.

## 7. Mutations and failure oracles

Apply each mutation independently to a fresh base fixture, with new source arrays or a fresh file read. The evaluator treats table arrays as immutable for revision tracking; in-place array mutation is not a valid refresh test.

| Mutation | Required result | Error this detects |
|---|---|---|
| Change O2 amount from 50 to 100, retaining distinct ID O2 | Correct order gross **320**; naïve expanded gross 420. O1 and O2 both remain contributors. | Distinct numeric values are not distinct entities. A distinct-value sum would wrongly lose one order. |
| Append another observed O1 with amount 999 | Duplicate-key diagnostics; expected O1 lookup ambiguous, projected observed fields undefined. Its `sourceRows` remains {E1}; `contributors` includes E1 and both positional O1 candidates. Missing-record interpretation is blocked. | Lookup ambiguity is not absence. No first-match selection or silent cleanup. |
| In T1, incorrectly give `refund_sum` entity field `orders.order_id` | O1's 20 and 10 conflict: refund_sum unavailable and `conflicting-entity-measure` diagnostic. The preceding expansion still shows both values. | `per=` is specific to a measure's actual entity, not a universal double-counting cure. |
| Keep base R3 null; compare base absent prior day with observed-zero O4 | R3 remains a present event with unknown amount; prior slot 2 has zero events/no numeric input; current slot 2 has one event and included zero. | Null, no observation, and numeric zero must remain distinct. |
| Change O4 amount from 0 to null | Current slot 2 count remains 1, raw gross becomes undefined; proposed comparison current gross/delta remain unknown, not zero. | Zero fill is conditional on zero observations, not missing aggregate values. |
| Leave parameter `segment` unbound | `bound-orders` output zero rows with missing-parameter diagnostic; binding A returns O1,O2,O3. | An unbound parameter must not silently mean all rows. |
| Make the observed orders source unavailable | Missing-source diagnostic blocks expected/observed classification. | An unavailable source must not turn every expectation into a missing business record. |
| Change a relationship key to a unlike scalar type or null | No coerced/null match; missing-key or missing-match diagnostics as applicable; inspect the original record. | Normalization rules must be authored, not guessed. |
| Remove `keep-unmatched` from daily expansion | Prior slot 2 disappears; reject that query as a complete expected-day comparison. | An inner-style expansion cannot establish the absent-date denominator. |

For the duplicate O1 mutation, the original order at index 0 and appended order at index 4 have row keys `orders:row:0` and `orders:row:4`; neither has a unique entity key reference. Current `per=` identity uses those distinct source references, so it does not repair the dirty business key. Do not expect the conflicting-entity guard to substitute for duplicate-key checks.

For the erroneous refund `per=` mutation, O1's conflicting candidates are omitted from that measure's candidate list; full membership still includes O1, R1, R2. The prior expansion is the required evidence for the conflict. Do not require excluded-conflict entries that the current object does not contain.

For any sum or average group containing a conflicting entity, the **whole measure is undefined**, even if other entity candidates are included and numeric. An included candidate does not establish that the published aggregate is valid. Preserve that diagnostic alongside the independently inspectable candidate inputs.

## 8. SQL and refresh proof boundary

Use **DuckDB** for this proof's two SQL handoffs. This fixes a proof environment, not a new product dependency or a cross-dialect promise. The proposed setup contract is:

| Setup item | Exact proposed contract |
|---|---|
| Connection and file | Connection ID `proof_db`, existing driver `duckdb`, project-relative path `data/preparation.duckdb` inside the new `preparation-proof` folder. |
| Resident raw tables | Tables `orders`, `returns`, `expected`, `calendar`, and `wide`, containing exactly the same 18 rows as §3. Use text columns for identifiers, periods, segments, and ISO dates; numeric columns for amounts and slot; preserve the two literal nulls. Do not load additional or generated observations. |
| Reproducible setup artifact | Proposed `packages/explorEDA/src/server/team/fixtures/data-v1/projects/preparation-proof/data/preparation-setup.sql`, with the table definitions and exact fixture inserts. The new `data-preparation.mdx` page will document creating `data/preparation.duckdb` from this file through an upstream DuckDB client, checking the five row counts and values, and then closing that client before explorEDA reads the file. This research supplies the setup contract, not an executable SQL file. |
| Guarded-reader boundary | Build and modify the database outside explorEDA. The existing database-source documentation describes a read-only DuckDB file with external access disabled; the proof must not depend on an adapter query loading the JSON files, attaching another database, or creating tables. Use the documented optional DuckDB driver installation for the runnable environment and record the actual client/driver versions when executing the proof. |
| Source declarations | Declare `proof_db`, database source `period_comparison`, and database source `prepared_long` in the proposed `preparation-proof/exploreda.eda`. Each source's authored SQL implements the exact §5 result contract over the resident raw tables. The five local JSON sources remain the raw local-evaluator cases. |
| Returned scalar types | `period_comparison.slot` must arrive as a native numeric scalar, not numeric-looking text; its two exact references remain `period_comparison:number:1` and `period_comparison:number:2`. Counts, populated measures, and deltas must be native numbers; presence flags must be booleans. `prepared_long.prepared_id`, `wide_id`, `period`, and `metric` must be strings, and `value` a native number or null. Cast SQL outputs where necessary, then verify actual driver-returned values/types before comparing reference keys. |

The implementation must include the setup file and a prepared database generated from it with the runnable folder, so a reader can either open the ready fixture or rebuild it. The database is a second representation of the same five logical raw tables, not extra sample observations. Verify agreement with the JSON fixtures before the base proof, and reset both representations between independent mutations. Never claim they synchronize automatically.

SQL is authored source meaning; local evaluation begins with the returned scalar rows. A source SQL query may already join or aggregate many database records, but the local evaluator cannot infer that database lineage from a returned value. No companion contributor relation is required to make the base proof pass; if one is added to satisfy a concrete audit requirement, its own refresh scope must be explicit.

Planned observable checks:

- Read the complete result once, inspect its source status/read time, then reopen the cached analysis without requesting a database read.
- Change a database value and explicitly refresh that source. Verify replacement only after a successful complete read and verify the local result against the relevant oracle.
- Exceed a configured source limit or induce a read failure. Verify that the previous source snapshot remains, with the failure visible. Do not accept a truncated new population presented as complete.
- Exercise a successful read for one source and failure for another. Record each source's actual read time and status. Do not describe the mixture as one atomic database moment or claim a cross-source transaction.
- Check that credentials remain in the existing server-held path and do not appear in project text, fixture assets, or research output. Reuse the shipped credential flow; introduce no new credential abstraction.
- For any companion contributor relation, verify that its scope corresponds to the prepared result. Per-source complete-or-refuse alone does not guarantee paired refresh.

`refreshSource`/`readAndWrite` and `writeWhole` support the per-source retention/replacement review. `runSourceContract` describes expected driver behavior. Individual adapter and read implementation files are absent from the selected packet, so the proof must inspect and run the relevant implementation before claiming complete validation of database value or transaction behavior. No performance or speed claim follows from this fixture.

## 9. Acceptance, rejection, and decision recording

### Accept the initial boundary only when all gates pass

- **Values:** all five tasks match their exact output tables, stage counts, member sets, and applicable candidate lists. Counts and null semantics are verified, not inferred from a chart's appearance.
- **Meaning:** the author can enumerate the relevant tiny-stage records and correctly answer the double-counting, missing-versus-ambiguous, missing-versus-zero, SQL-row identity, and grouped-denominator questions.
- **Scope:** transient chart filtering remains distinct from explicit query filtering, parameters, source SQL, and source refresh. SQL handoff work is actually performed and acceptable for the concrete task.
- **Reuse:** two views share a query without an invented query dependency. A copied query and a new SQL result source are described accurately.
- **Refresh:** complete-or-refuse and retained-old-snapshot behavior pass for the selected source; mixed source states are represented with their actual scope and read status.
- **Documentation/example:** the page, source definitions, example data, author instructions, and observed checks agree and are available in the same milestone.

### Reject or narrow the recommendation when a gate fails

- If values or identity are wrong, first isolate a correctness defect with this fixture. Do not compensate by documenting an incorrect result.
- If values are correct but the author cannot recover why from visible stages and the example, test the smallest explanation repair in `QueryStageRows`, `QueryFlow`, or `ProjectQueryPanel`. The baseline does not require an invented dedicated ledger; it requires a correct explanation recoverable from existing visible records.
- If the actual SQL handoff is unacceptable for the concrete task, reject documentation-only sufficiency and compare one bounded local operation against maintaining the SQL recipe. Record which action, missing provenance, or maintenance obligation made the handoff fail. This is evidence to reconsider the boundary, not permission for a general editor or engine.
- If named result reuse is repeatedly required beyond shared views and same-chain aggregation, record that concrete task against the existing reusable-output intent. Do not promote it merely because this synthetic fixture can illustrate it.
- If refresh scope cannot be explained accurately, fix that specific trust failure before expanding preparation scope. Do not infer a need for demand-driven execution from an unmeasured fixture.

Record each attempted action, observed result, expected result, discrepancy, and the smallest proposed correction. A statement that an example “felt easy” or a list of desirable features is not a passing proof.

## 10. One bounded proposed milestone

All paths below are **planned changes**, not files created by this research. Begin with docs, fixture/example content, and targeted proof tests. Make no production source change initially.

| Proposed destination | Concrete work | Completion evidence |
|---|---|---|
| New `apps/demo/src/docs/pages/data-preparation.mdx` | Teach the five tasks, explicit row grain, key/ambiguity gates, per-entity reduction, count versus amount, conditional zero policy, SQL result identity, and grouped denominators. Include the DuckDB setup/rebuild and exercised SQL handoff instructions from §8. | Each task is reproducible from the page and links to its runnable example. |
| Existing `apps/demo/src/docs/pages/project-folders.mdx` | Link the proof; explain explicit frame labels, grouped outputs, same-query inputs/shared views, and independent copies. | Examples match `compileProjectText` and actual query-panel actions. |
| Existing `apps/demo/src/docs/pages/database-sources.mdx` | Link the proof; state authored SQL grain, immediate snapshot-row provenance, complete-or-refuse, explicit refresh, and per-source scope. Amend the existing return-grain SQL example to retain required order/return IDs and explain why an order amount repeated across returns is not additive; point to the corrected per-order recipe. | The page makes no implicit raw lineage, additive-grain, or mixed-source atomicity claim. |
| New `packages/explorEDA/src/server/team/fixtures/data-v1/projects/preparation-proof/exploreda.eda` | Encode the source/relationship/query/parameter tables with existing DSL; declare `proof_db`, `period_comparison`, and `prepared_long` exactly as §8 specifies. | Folder validation, returned scalar types, reference keys, and query results match the oracle. |
| New `packages/explorEDA/src/server/team/fixtures/data-v1/projects/preparation-proof/analysis.eda` | Provide readable task views, two views sharing `segment-summary`, and clear frame/measure labels. | Actual query picker, Full flow, stage inspection, and view reuse are exercised. |
| New `packages/explorEDA/src/server/team/fixtures/data-v1/projects/preparation-proof/data/orders.json`, `returns.json`, `expected.json`, `calendar.json`, `wide.json` | Supply exactly the five raw tables and 18 rows above, with native JSON numeric values/null and explicit source types/keys. | Fixture values are independently compared with the oracle; no generated observations or hidden cleaning. |
| New `packages/explorEDA/src/server/team/fixtures/data-v1/projects/preparation-proof/data/preparation-setup.sql` and `data/preparation.duckdb` | Supply the proposed upstream setup artifact and its generated ready-to-read database using §8's table and type contract. | Rebuilding yields the same five tables and 18 rows; both authored SQL sources return §5's values and required native scalar types. |
| New `packages/explorEDA/src/test/fixtures/dataPreparation.ts` | Represent the same fixture and named independent mutations for targeted tests. | Fixture data agrees with the runnable folder; no duplicated unexplained business policy. |
| New `packages/explorEDA/src/test/lib/analysis/dataPreparation.test.ts` | Assert values, candidate/reference sets, counts, parameter behavior, and negative cases. | Targeted tests pass in a runnable checkout and failures identify a semantic mismatch. |

Before editing registration, inspect the current docs catalogue, live-example registry, targets, and example-copy routing. `docs/agent-guide.md` identifies `apps/demo/src/docs/catalogue.ts`, `apps/demo/src/docs/live/examples.ts`, docs targets/gate, and the demo verification workflow, but their contents were not in this packet. Register the page and runnable example in the verified current locations; do not invent an existing example ID, CLI flag, route, or registry shape. Check whether additional fixture-copy registration is necessary.

If the author proof identifies a specific explanation failure, a conditional repair may touch `packages/explorEDA/src/components/project/QueryStageRows.tsx`, `QueryFlow.tsx`, or `ProjectQueryPanel.tsx`. Preserve existing inspectable values and reference distinctions. Pair every user-visible repair with the documentation and runnable example in this same milestone. A contributor explanation must distinguish membership, candidate inclusion, and contextual related rows; it must not relabel every related record as a numeric contributor.

No new local operators, query-dependency infrastructure, result catalogue, generic graph editor, background refresh system, SQL compiler, pushdown planner, or alternative credential system belongs in this milestone.

Follow `AGENTS.md` when this plan is implemented: a PR that publishes the new packaged example under `packages/explorEDA` or changes package UI includes a user-facing changeset. A docs-only or tests-only PR does not need one. Choose the release classification from the actual adopted change; this research neither creates a changeset nor changes package versions.

## 11. Planned validation and actual execution

In Codex's runnable checkout, first inspect the missing numeric/identity/calculation helpers and the selected database adapter/read path. Then run targeted evaluator tests for this fixture plus the relevant existing evaluator and source-contract tests. Validate project-text round trips and the complete example folder. Exercise the actual author flow in the local-folder/server app, including reload, explicit refresh, ambiguity, nulls, and linked selection. Use the repository's documented docs-check, docs build, and docs-verification tasks after adding the page/example; inspect current package scripts before choosing their invocation. Follow the repository's required type and integration gates for any eventual source change.

For the proposed visible example and any explanation repair, exercise the changed flow at **1280, 783, and 390 px** with real pointer and keyboard input, as required by `docs/ui-defaults.md` and the agent guide. Check stage values, diagnostics, and record inspection at each width; capture the required screenshots in the implementation milestone. No browser or viewport checks were executed for this research.

Capture expected-versus-observed outputs, source status/read times, user-visible explanatory failures, and any errors. These checks are proposed by name and purpose, not supplied as an executable run sheet in this research artifact.

**Actual tests run for this research: none.** The selected packet is not a runnable checkout. Only source inspection and hand-derived fixture/oracle reasoning support this plan. File writing or Markdown verification is artifact preparation, not repository test execution.

## 12. Source index

All repository paths in this file are relative to `https://github.com/byronwall/explorEDA` at `b07f3cf3483130f6cc3391bba47a87f616c93321`; inspected contents came from the authoritative packet. No line numbers are invented.

- [Types: AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/types/AnalysisProject.ts).
- [Evaluator: evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/lib/analysis/evaluateProject.ts).
- [Source helpers](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/lib/analysis/sources.ts).
- [Project DSL](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/lib/dsl/project.ts).
- [ProjectQueryPanel](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx), [QueryFlow](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/components/project/QueryFlow.tsx), and [QueryStageRows](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/components/project/QueryStageRows.tsx).
- [Source types](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/server/sources/types.ts), [refresh](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/server/sources/refresh.ts), and [source contract](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/server/sources/contract.ts).
- [DatabaseSourceViews](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/apps/app/src/DatabaseSourceViews.tsx).
- [Project-folder documentation](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/apps/demo/src/docs/pages/project-folders.mdx), [database-source documentation](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/apps/demo/src/docs/pages/database-sources.mdx), [agent guide](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/agent-guide.md), and [UI defaults](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/ui-defaults.md).
- [Existing evaluator tests](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts).
- [Reusable-analysis-output intent](https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/reusable-analysis-outputs/intent-brief.md).

The report's dated primary-source research supports the external tool comparison. This proof file does not assert a specific vendor's unverified SQL syntax, speed, null-default behavior, or lineage guarantee.
