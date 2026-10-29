# Data preparation after database sources: the product boundary

**Decision date:** 2026-10-18. **Repository:** https://github.com/byronwall/explorEDA. **Baseline:** `b07f3cf3483130f6cc3391bba47a87f616c93321` on `main`, as identified by the authoritative selected packet. **Status:** research; every implementation and acceptance check below is proposed.

## Decision

**Keep explorEDA responsible for understandable local queries over complete supplied rows. Prove that boundary with documentation and one runnable example before adding preparation features.** Use existing lookup, expansion, calculation, filtering, aggregation, and shared query views. Keep general reshaping, domain construction, dirty-key reconciliation, and composition between separately prepared relations in author SQL or an upstream tool.

The smallest winning bundle is one preparation guide, corrections to the existing folder/database examples, and the 18-row proof specified in [proof-plan.md](proof-plan.md). It adds no evaluator step, query dependency system, SQL compiler, or execution mode. If the proof reveals that visible values plus the guide cannot explain a result, consider one focused inspection repair using existing evaluation data. Such a repair must ship with its documentation and runnable example. This is a product judgment, not established user demand.

## Access decision: GO, with bounded coverage

The supplied packet is readable, identifies the requested owner and exact baseline, and contains all 30 required reading-route files among 31 sections. The rules, types, evaluator, DSL, three query components, database boundary, app refresh controls, two shop definitions, two documentation pages, evaluator test definitions, and eight intents were inspected.[^R1][^R2][^R3][^R4][^R5][^R6][^R7][^R8][^R9][^R10] The user's 2026-10-18 baseline/hash recheck is accepted as provenance; it is not represented as an independently executed Git checkout verification.

Exact-ref public GitHub/raw-file retrieval did not provide additional source. Missing coverage includes `valueParsing.ts`, `QueryRelationshipBuilder.tsx`, `queryEditing.ts`, `sourceRowIdentity.ts`, `server/sources/read.ts`, driver internals, refresh orchestration, and the shop CSV/test-fixture helper. The finite-number/null proof avoids an assertion about uninspected numeric-text parsing. Detailed visual authoring and end-to-end behavior remain unverified. Essential decision semantics are available, so these limits do not trigger NO-GO.

## Current capability map

| Boundary | Source-observed capability | Consequence |
| --- | --- | --- |
| Query model | `AnalysisStep` has source, lookup, expand, calculate, filter, aggregate. Steps refer to other steps in the same query; views identify a query. | Grouped outputs already exist. A query result is not a named source for another query.[^R2][^R3] |
| Relationship operations | `lookupFrame` keeps each input row, refuses to pick among multiple matches, and projects unavailable values on no/ambiguous matches. `expandedFrame` emits matching pairs, optionally retaining an unmatched parent. | Lookup and expansion have different grains. Cardinality declarations do not themselves enforce uniqueness.[^R3] |
| Aggregation | `aggregateFrame` supports count/sum/average, grouping, and `entityFieldId` (`per=`). Sum/average with no valid candidates are unavailable. | Keep counts beside measures. Per-entity reduction handles expansion repetition, not dirty duplicate business IDs.[^R3][^R5] |
| Inspection | Stages retain values and row counts. Result `sourceRows`, `contributors`, and numeric `measureContributors` are distinct. `relatedRecords` may add child context. | Related records are not an exact numeric-contributor ledger. Count measures have no such ledger entry.[^R3][^R6] |
| Authoring | Project text expresses every supported step. The panel selects queries, binds parameters, shows flow, and delegates relationship authoring. Copy/open-stage actions append queries through uninspected helpers. | Do not invent general visual step controls or claim all visual authoring is absent.[^R5][^R6][^R8] |
| Database sources | `DRIVERS` registers all five named databases. `readAndWrite` awaits `readSnapshot` before `writeWhole`; the shared contract specifies complete-or-refuse reads. Secrets enter through server options. | SQL defines imported row meaning. Explicit refresh remains the boundary; one file replacement does not establish multi-source atomicity.[^R7] |

**Scope distinctions matter.** `evaluateAnalysisQuery` takes project, tables, query ID, and bindings; transient chart selections are not query steps. Trace focus narrows only output-stage display in `ProjectQueryPanel`. `QueryStageRows` still profiles all stage rows. Its related-record section can show contextual children, and source previews disclose a first-25 limit. A SQL aggregate's imported row is a source row locally; the evaluator cannot reconstruct base-table contributors that SQL removed.[^R2][^R3][^R6][^R7]

Local filters also are not a universal SQL semantic layer: equality is type-strict; `is-null` accepts null/undefined; local `neq` can retain a missing left value. Invalid/unbound parameters produce diagnostics and empty filtered frames. Downstream count zero must not erase that failure state. Aggregate exclusion counts count rejected measure candidates across measures, not necessarily distinct source rows. Per-entity conflicts remove those entities from the candidate list and make the numeric result unavailable; other candidates marked included do not make that result valid. Inspect the diagnostic and preceding values together.[^R3]

### Stale text versus implementation

- `database-adapters` explicitly marks its old body stale and records shipment on 2026-10-15. The old claim that server database code does not exist conflicts with `DRIVERS` and `refreshSource`.[^R7][^R10]
- `database-query-contract` is stale and reframed to later execution for sources too large to snapshot. Its old snapshot-integration proposal is not a current gap.[^R10]
- `reusable-analysis-outputs` remains unprioritized because Byron has named no task. Its older single-array discussion cannot negate current aggregate query outputs and query-addressed views.[^R2][^R3][^R10]
- Current presentation differences are narrower: `QueryStageRows.Cell` renders missing values as a dash despite the UI-defaults rule for `null`; the panel displays authored `frameLabel`, whose DSL default can retain the first source's name after grouping. These are inspection risks, not evidence for new operators.[^R1][^R5][^R6]

## Five analyst tasks that test the boundary

These are deliberately invented test cases, not validated demand. The complete inputs and contributor oracles are in [proof-plan.md](proof-plan.md). Keys are typed, non-null strings unless a negative case says otherwise; row order is not a result contract.

### 1. Orders and returns without double counting

- **Grain and keys:** orders have `order_id`; returns have `return_id` and an order foreign key. Output is one order. Multiple returns are legitimate; duplicate source identities require diagnosis.
- **Steps and policy:** start from orders, expand returns with unmatched orders retained, then group by order. Sum order amount once per order; count non-null return IDs; sum valid refund values. No return and a return with unknown refund must remain distinct.
- **Expected:** O1: gross 100, two returns, refunds 30; O2: 50, zero, unavailable; O3: 120, one, unavailable; O4: 0, zero, unavailable. Raw expanded gross is 370; correct order gross is 270. Orphan return R4 must remain reachable in a separate exception query.
- **Inspection and boundary:** inspect the five expanded rows and four grouped rows. O1 membership includes both returns while its gross measure uses one repeated order value. This works locally today. The awkwardness is expressing and explaining `per=`. SQL can instead preaggregate returns before joining orders; SQL must preserve the intended keys. Equal-valued orders must both count.[^R3][^R5][^R6]

### 2. Reconcile expected and observed records

- **Grain and keys:** one expected order key versus one observed order. Expected set: O1, O2, O3, O5; observed set: O1, O2, O3, O4.
- **Steps and policy:** expected-to-observed lookup then `is-null` produces missing O5; reverse lookup produces unexpected O4. First reject missing/duplicate-key and ambiguity diagnostics relevant to the match. Null means no match only after that gate.
- **Expected and inspection:** three matched keys, one missing expectation, one unexpected observation. O5 has an expectation record and no fabricated order; O4 has an observed record and no fabricated expectation.
- **Boundary:** two exception views work today. Combining both into one classified full-outer result is awkward and has no direct local union/full-outer step. Lookup ambiguity also projects unavailable fields, so blindly filtering those fields would incorrectly call a duplicate match missing. Dirty-key cleanup or a unified reconciliation relation belongs upstream for now.[^R2][^R3][^R6]

### 3. Compare periods containing absent dates

- **Grain and keys:** an explicit four-day calendar has unique `day`, `period`, and comparison `slot`; orders match by day. The author declares these dates the complete expected domain for this exercise.
- **Steps and policy:** start from the calendar, expand orders retaining unmatched days, group by calendar day/period/slot, count order IDs, and sum amounts. No automatic expected-domain inference or blanket zero fill.
- **Expected:** prior slot 1: count 2, sum 150; prior slot 2: count 0, unavailable; current slot 1: count 1, sum 120; current slot 2: count 1, sum 0. A proposed SQL comparison sets the absent prior day to zero only under the stated complete-coverage policy, giving deltas −30 and 0 while retaining presence counts.
- **Inspection and boundary:** an absent day has calendar membership but no order contributor; the observed zero has O4. Long-form daily output works locally. Generating calendars and joining separately grouped periods into a paired table have no direct operators; author-supplied domains and SQL keep that scope explicit. Chart calendar presentation does not establish an expected-record relation.[^R2][^R3][^R10]

### 4. Reshape a wide measure table

- **Grain and keys:** wide rows W1/prior `(gross=150, refunds=30)` and W2/current `(gross=120, refunds=null)` become one row per `(wide_id, measure)`. Duplicate input IDs are invalid for that intended key.
- **Steps and policy:** retain identity/period, turn the two named measure columns into measure/value rows, and explicitly preserve the null cell. Use deliberate result keys; do not collapse records sharing equal values.
- **Expected and inspection:** four rows, including W2/refunds/null; three valid numeric contributions. Each row identifies its wide source record and measure column.
- **Boundary:** the current step union has no direct unpivot. Author SQL or upstream preparation expresses it naturally. Hand-building a measure domain and conditional expansion is a possible contrivance, not a reusable unpivot operator or a reason to claim impossibility in all host code. Locally, an imported SQL row traces to that snapshot row; base-wide lineage needs a supplied `wide_id` relationship or companion source.[^R2][^R3][^E3]

### 5. Reuse a grouped result

- **Grain and keys:** group orders by segment: A represents O1/O2/O3; B represents O4. Output keys are typed segment groups, not individual order IDs.
- **Steps and policy:** one aggregate query supplies two views; set its frame label to segments. For a downstream computation, append another step in the same query. Preserve sums and valid counts when computing an order-weighted mean.
- **Expected:** A has total 270, count 3, mean 90; B has 0, 1, 0. The unweighted mean of segment means is 45; the order mean is 67.5. Both are valid answers to different questions.
- **Inspection and boundary:** inspect both grouped rows and their order memberships. Same-query view reuse and further same-query processing work now. Independently copying a query is not a shared downstream dependency. Named cross-query results, pivot/model outputs, and a result catalogue remain deferred without a real blocked task.[^R2][^R3][^R6][^R10]

## Four directions, scored for this decision

Scores are judgment, not measurements: **1 least favorable, 5 most favorable**. Higher maintenance/proof scores mean lower cost. All six criteria are equally weighted because no user population, time budget, or workload supplies defensible weights. Task coverage scores how directly the direction's core workflow completes these cases: a necessary upstream handoff lowers the score even when the overall bundle completes the task. A and B retain such handoffs; C puts all five relational tasks directly in SQL. D alone adds execution placement, not new transformations.

| Criterion | A: existing workflow + guide/proof | B: local unpivot + append |
| --- | --- | --- |
| Task coverage | 4 | 4 |
| Semantic clarity | 4 | 3 |
| Author effort | 3 | 4 |
| Local/SQL consistency | 4 | 3 |
| Maintenance cost | 5 | 2 |
| Proof cost | 5 | 2 |
| **Total / 30** | **25** | **18** |

| Criterion | C: SQL-first preparation + recipes | D: server execution/pushdown |
| --- | --- | --- |
| Task coverage | 5 | 4 |
| Semantic clarity | 3 | 2 |
| Author effort | 3 | 2 |
| Local/SQL consistency | 2 | 1 |
| Maintenance cost | 4 | 1 |
| Proof cost | 3 | 1 |
| **Total / 30** | **20** | **11** |

**Why A wins:** tasks 1, 2, 3's long form, and 5 already have useful local expressions; task 4 has a clear upstream escape. A makes the boundary testable without a second engine. Its consistency score means explicit limits and fixture parity, not identical null/coercion semantics. B improves reshape/exception combination but creates serialization, contributor, identity, and authoring obligations. C covers relational tasks well but places SQL dialect and lost-lineage work on the author. D does not itself add missing semantics and requires result scope, cancellation, identity, and inspection contracts without a demonstrated capacity need.

If author effort becomes decisive for a recurring file-only reshape task, the ranking may change. These invented cases alone do not justify that change. No direction receives a speed claim.

## What current primary documentation contributes

All external pages were retrieved on **2026-10-18**. The lessons below are inferences from documented behavior; no competitor was executed.

| Tool | Documented preparation, grain, and refresh boundary | Feedback/provenance lesson for explorEDA |
| --- | --- | --- |
| DuckDB | SQL joins and grouping determine output grain; anti joins return the unmatched subset of left rows without multiplying them. Empty sums remain null. `UNPIVOT` supports an explicit null-preserving form. These SQL pages do not supply an application refresh policy.[^E1][^E2][^E3] | Query results and `EXPLAIN` support inspection of values and plans. A physical plan is not a per-result contributor set. Keep SQL recipes and explicit result keys; do not promise inferred base lineage.[^E4] |
| Observable Framework | Loaders generate snapshot files; client DuckDB SQL is a separate layer. Preview changes can rerun loaders, but builds reuse cached loader output unless the cache is controlled. A successful empty output differs from a failed loader.[^E5][^E6] | Loaders and named files make preparation inspectable; SQL blocks expose result tables. Borrow explicit execution boundaries and failure feedback. The reviewed pages do not establish exact aggregate lineage.[^E5][^E6] |
| Evidence | Current docs describe reusable SQL models, deliberate drilldown granularity, and manual/scheduled model refresh. The warehouse page distinguishes managed extraction from direct warehouse queries on viewer requests.[^E7][^E8] | Studio offers completion, validation, and updating previews. Named SQL definitions give preparation provenance, not the required numeric-contributor contract. Borrow grain guidance; managed refresh and viewer-driven execution are separate product commitments.[^E9] |
| OpenRefine | Stored transformations are one-time operations; changing an input does not automatically recalculate earlier results. A logical record can span rows under its first-column convention.[^E10][^E11] | Expression previews and error policies expose consequences. Persistent history and extractable operations support reproducibility, with exceptions such as individual cell edits. Borrow before/after feedback; keep explorEDA's own identity rules.[^E11][^E12] |

Evidence's present docs must not be described solely using its legacy build-time architecture. Likewise, an Observable rebuild is not proof that every source was freshly read. None of these documentation comparisons establishes explorEDA demand or a reason to copy a platform.

## Two bounded alternatives

1. **Local unpivot plus append.** Consider only after a recurring file-only task fails the SQL/upstream handoff. Bound unpivot to named scalar columns and an explicit null policy; append requires compatible fields and collision-safe identities. Exclude pivot, windows, fuzzy matching, calendar generation, and cross-query dependencies. Each operator needs source membership, serialization, docs, and one runnable example. No adoption now.
2. **SQL-first preparation with reusable recipes.** Prefer this if an actual author already prepares all relevant data in one database and accepts snapshot-row inspection or supplies base-record relations. Start with one DuckDB-backed example; other dialects remain unproved. Do not turn recipes into a portability compiler or claim the current guarded DuckDB adapter can read arbitrary external files.

Server execution is scored and deferred, not a third implementation alternative. Its activation belongs to the existing reframed query-contract intent after a named workload demonstrates an unmet requirement.

## Proof, non-goals, and unresolved choices

The proposed proof compares unchanged local semantics with explicitly prepared results on the same fixture. Reject the documentation-only recommendation if an author cannot explain grain, missing versus ambiguous matches, candidate exclusions, or SQL lineage from the guide and visible records; if a needed result cannot be produced without undisclosed preprocessing; or if a real handoff is unacceptable. Record which bounded alternative or inspection repair that evidence earns. A passing fixture proves this workflow only, not general demand or scalability.

**Non-goals:** implementation in this research; a generic preparation canvas; query-result DAGs; automatic expected sets, deduplication, or null-to-zero conversion; a SQL compiler; automatic/scheduled reads; warehouse expansion; transport changes; sampling presented as complete; writes or client-held database credentials. PRs #447–450, #364, #220 and new daily-viz dataset generation remain outside the supplied mission; their current live status was not researched.

**Unresolved product choices:** whether the SQL handoff fits an actual task; whether documentation can make current inspection sufficient; whether independently refreshed sources need an explicit shared-as-of requirement; and whether any real downstream result still lacks a usable view. Until those are observed, preserve existing deferred intents. No population, measured limit, latency claim, or universal local/SQL parity is established.

**Actual tests run:** no repository, database, browser, typecheck, or application tests. Test source was read. Artifact packaging/integrity checks are separate and reported at delivery.

## Sources and inspected evidence

Repository evidence below means the attached selected text at the stated baseline, not a runnable checkout or independently retrieved Git tree. Symbols are cited without invented line numbers. Repository paths are exact; the baseline can be used when opening them in the owner's checkout.

[^R1]: Working rules: `AGENTS.md`; `README.md`; `package.json` (`scripts`, `packageManager`); `docs/agent-guide.md` (commands, docs registration, test routes); `CODING_STANDARDS.md`; `docs/ui-defaults.md` (missing cells, scope, previews, required viewport checks). All six inspected.

[^R2]: `packages/explorEDA/src/types/AnalysisProject.ts`: `AnalysisStep`, `SourceStep`, `AggregateStep`, `AggregateMeasure`, `AnalysisQuery`, `AnalysisView`, `AnalysisResultRow`, `AnalysisMeasureContributor`, `AnalysisStage`.

[^R3]: `packages/explorEDA/src/lib/analysis/evaluateProject.ts`: `sourceReferences`, `relationshipSide`, `lookupFrame`, `expandedFrame`, `calculateFrame`, `filterFrame`, `aggregateFrame`, `uniqueRefs`, `validateQuery`, `tableRevision`, `evaluateAnalysisQuery`.

[^R4]: `packages/explorEDA/src/lib/analysis/sources.ts`: `sourceFromRows`, `isUnique`, `addSourceFromRows`, `singleTableProject`. Inferred keys/added row numbers do not establish durable identity after arbitrary refresh.

[^R5]: `packages/explorEDA/src/lib/dsl/project.ts`: `compileProjectText`, `compileStep`, `compileQuery`, `checkReferences`, `stepLines`, `exportProjectText`, `DatabaseSource`, `ConnectionDefinition`; supported step forms, `per=` handling, source declarations, and frame/output defaults.

[^R6]: `packages/explorEDA/src/components/project/ProjectQueryPanel.tsx`: `ProjectQueryPanel`, `QueryPicker`, `openCopy`, `openStage`; `packages/explorEDA/src/components/project/QueryFlow.tsx`: `QueryFlow`, `FlowStep`, `Diagnostics`; `packages/explorEDA/src/components/project/QueryStageRows.tsx`: `QueryStageRows`, `Cell`, `relatedRecords`, `RelatedRecords`, `SourceTable`. Imported helpers outside these three files were not supplied.

[^R7]: `packages/explorEDA/src/server/sources/types.ts`: `DatabaseDriver`, `DatabaseSession`, `ReadCursor`, `SourceReadError`; `packages/explorEDA/src/server/sources/refresh.ts`: `DRIVERS`, `SourceOptions`, `openConnection`, `readAndWrite`, `writeWhole`, `refreshSource`; `packages/explorEDA/src/server/sources/contract.ts`: `runSourceContract`; `apps/app/src/DatabaseSourceViews.tsx`: `WaitingForData`, `DatabaseSourceItem`, `RefreshAll`, `ReadProblem`, `SecretForm`. Contract assertions were inspected, not executed; read/driver and multi-source callback internals are missing.

[^R8]: `apps/demo/src/docs/pages/project-folders.mdx`: Query steps and Analysis files; `apps/demo/src/docs/pages/database-sources.mdx`: Connections and sources, What a read keeps; `packages/explorEDA/src/server/team/fixtures/data-v1/projects/shop/exploreda.eda`; `packages/explorEDA/src/server/team/fixtures/data-v1/projects/shop/orders.eda`. The two supplied shop definitions use customers/orders/items/products; they are not the SQLite orders/customers/returns example described by the database guide. Raw shop rows were not included.

[^R9]: `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`: assertions for lookup and expanded totals, entity reduction, ambiguity, duplicate and null/typed keys, calculations/filters/aggregates/parameters, empty aggregates, cycles, revisions, and project/view round trips. Imported `packages/explorEDA/src/test/fixtures/shopProject.ts` is absent. This is the only evaluator test-file section in the packet.

[^R10]: Prior intents inspected in full: `docs/intent/database-adapters/intent-brief.md`; `docs/intent/database-query-contract/intent-brief.md`; `docs/intent/warehouse-sources/intent-brief.md`; `docs/intent/reusable-analysis-outputs/intent-brief.md`; `docs/intent/columnar-data-transport/intent-brief.md`; `docs/intent/current-analysis-trust/intent-brief.md`; `docs/intent/missingness-and-expected-records/intent-brief.md`; `docs/intent/comparison-opportunities/intent-brief.md`. Status banners and substantive deferrals take precedence over stale descriptive bodies; current implementation claims were checked against source.

### Current external primary documentation

Every page below was retrieved on **2026-10-18**. Claims were paraphrased; no external runtime comparison was conducted.

[^E1]: DuckDB, [FROM and JOIN Clauses](https://duckdb.org/docs/current/sql/query_syntax/from), especially semi/anti joins.
[^E2]: DuckDB, [Aggregate Functions](https://duckdb.org/docs/current/sql/functions/aggregates), grouping, counts, and null/empty inputs.
[^E3]: DuckDB, [UNPIVOT Statement](https://duckdb.org/docs/current/sql/statements/unpivot), SQL-standard `INCLUDE NULLS` and output shape.
[^E4]: DuckDB, [EXPLAIN: Inspect Query Plans](https://duckdb.org/docs/current/guides/meta/explain), physical plans; plain EXPLAIN does not execute the query.
[^E5]: Observable, [Framework data loaders](https://observablehq.github.io/framework/data-loaders), snapshot output, build/preview caching, and failures.
[^E6]: Observable, [Framework SQL](https://observablehq.github.io/framework/sql), client DuckDB versus remote loader queries and displayed/named results.
[^E7]: Evidence, [Models](https://docs.evidence.dev/core-concepts/models), reusable SQL, drilldown grain, and model refresh. This is the current model documentation, not a claim about explorEDA features.
[^E8]: Evidence, [Evidence Warehouse](https://docs.evidence.dev/evidence-warehouse), managed extraction and direct connector execution contracts.
[^E9]: Evidence, [Editing](https://docs.evidence.dev/editing), Studio completion, validation, and previews.
[^E10]: OpenRefine, [Exploring data](https://openrefine.org/docs/manual/exploring), rows and records.
[^E11]: OpenRefine, [Expressions](https://openrefine.org/docs/manual/expressions), one-time transforms, previews, and error policies.
[^E12]: OpenRefine, [Running OpenRefine](https://openrefine.org/docs/manual/running), History (Undo/Redo) and Reusing operations.

### Input byte identity

These are SHA-256 values of the actual attached bytes, calculated in this research session. They do not assert a per-file comparison with GitHub.

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-prompt(5).md` | 8273 | `86f70e84394615956dd6637c81de555eccedc3cafd5faf57a5cac6ceaf06df3c` |
| `source-packet(2).txt` | 285265 | `8600b15832886513d908fd65bca6744f1a373d1cbedab80ee32433737c4bd4fb` |
