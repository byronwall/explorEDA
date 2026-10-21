# Official Mosaic implementation audit

Status: research-only static inspection. No upstream test suite, explorEDA test suite, benchmark, package install, or application experiment was run. Retrieved on **2026-10-20, America/Indianapolis** (the UTC execution date is 2026-10-21).

## Access, identity, and preserved originals

- The supplied paper's §9 links `https://idl.uw.edu/mosaic/` and the separate `uwdata/mosaic-selection-benchmarks` repository. The official Mosaic documentation identifies `@uwdata/mosaic-core` and `@uwdata/mosaic-sql`; their package manifests identify `https://github.com/uwdata/mosaic.git`.
- The official repository's `main` resolved, through GitHub's public commit API, to **`9ca1d860e30ed148d0b228b92ebf30f66cb9e2ce`**, commit timestamp **2026-10-15T21:06:16Z**. All implementation files below were fetched by this immutable SHA. These are later implementation facts, **not evidence of what shipped with the July 2025 v1 paper**.
- At this revision, both core and SQL package manifests say **0.33.0**. This is the inspected source version; no claim is made about the current npm dist-tag or released package bytes.
- Current source paths are `packages/mosaic/core/` and `packages/mosaic/sql/`; vgplot interactors are under `packages/vgplot/plot/`. Do not reuse older repository path assumptions.
- `research-work/upstream/source/` contains a curated set of official source, tests, API Markdown, and package manifests. `research-work/upstream/LICENSE` contains the repository's BSD 3-Clause license and embedded Observable ISC notice. Preserve both notices when redistributing these excerpts. No dependencies or executables were downloaded.
- Public code download succeeded using the permitted escalated network path. Web retrieval of GitHub/raw URLs returned `DisabledError`; that was a web tool limitation, not missing source access. The files were actually read from downloaded bytes.
- The arXiv HTML identifies its license as **arXiv.org perpetual non-exclusive license**, not a general reuse license. This upstream audit does not authorize redistributing the full paper. Preserve a citation and access note unless a separately applicable permission is established.

## 1. Selection state, source identity, target identity, and clearing

### Observed implementation facts [UP-SEL, UP-CLAUSE, UP-DISPATCH]

`Selection` is a specialized `Param`, with static factories `intersect`, `union`, `single`, and `crossfilter`. `crossfilter` is intersect plus `cross: true`. Options are `cross`, `empty`, and **`include`** (singular), not a JSON selection scope definition. Defaults are `cross: false`, `empty: false`; a no-clause selection selects the full applicable population unless `empty: true` requests none. See `Selection.ts:6–20,31–86,304–309,352–373`.

The current `SelectionClause` contract contains:

- `source`: an object identified by JavaScript object equality, optionally with `reset()`.
- `clients`: optional `Set<MosaicClient>` of clients excluded under crossfilter resolution.
- `fields`: SQL expression nodes, which must be the same node instances referenced inside the predicate.
- `value`: an arbitrary associated value.
- `predicate`: SQL expression node or `null`.
- `meta`: optional type-specific optimization metadata.

See `clause/SelectionClause.ts:16–56`. These objects are not directly a stable serializable provenance model: object references, Sets, class instances, and SQL AST node identity must be rebuilt. An explorEDA saved object needs independent stable source/target/data identity and a durable semantic representation even if Mosaic is used at runtime.

`Selection.update(clause)` replaces an earlier clause from the same source object, records the active clause, relays it to included selections, and dispatches a value update (`Selection.ts:197–204,317–327`). Two different source objects selecting the same field remain distinct; a single source object is a replacement key. This is useful for clear-one-source and provenance, but using a field name as the source ID would lose that distinction.

Clearing one source is represented by `clauseNone(source)` (null predicate, empty fields, null value). `Selection.remove(source)` returns a **clone** with that source removed; it does not mutate the original. `reset(clauses?)` removes all or specified clause objects, calls source reset hooks, and relays resets downstream. `single` resolution resets prior other sources during updates. See `Selection.ts:113–132,214–219,317–327`; `SelectionClause.ts:65–68`; inspected selection tests cover reset, empty predicates, downstream reset, and selective reset. Tests were read, not executed.

### The crucial distinction between semantic resolution and update skipping

`SelectionResolver.skip(client, clause)` checks `cross && clause.clients.has(client)`. Without a client argument, it returns false. Resolution removes *all* client-associated clauses, not only the newest one (`Selection.ts:337–373`).

However, default `selection.predicate(client)` has an additional **incremental-update optimization**: if the client belongs to the active crossfilter clause, it returns `undefined` before forming the remaining predicate. `Coordinator.updateSelection` treats that as “do not update this client,” preserving its current display. It does **not** mean “query every row.” See `Selection.ts:277–280,363–369`; `Coordinator.ts:395–399`.

- `selection.predicate()` with no target client resolves all clauses; this is the relevant direction for shared exact evidence.
- `selection.predicate(client, true)` bypasses the active-client early return, but still removes the client's own clauses. It does **not** mean self-filtering is enabled.
- A custom adapter must not feed an `undefined` predicate into an “all rows” query during an incremental update.
- Self-filter-on needs a different target-resolution policy or a non-cross selection, not just the `noSkip` flag.

This API is designed for a coordinator/client lifecycle. A pure resolver returning an explicit `all`, `none`, `predicate`, or `unavailable` result is a smaller and safer fit for a synchronous Crossfilter-backed evidence contract.

### Activation and asynchronous lifecycle

`activate(clause)` emits a potential future clause and relays the activation; it does not call `update` or change current semantic membership (`Selection.ts:185–189`). The coordinator responds by requesting preaggregation for enabled clients (`Coordinator.ts:340–351`). Interval interactors activate on pointer entry without pressed buttons; their representative extent can be `[0,1]` if no actual value exists.

`AsyncDispatch` queues updates while prior callbacks' returned promises settle; it coalesces queued values. Crossfiltered selection queue filtering keeps updates from other sources while replacing queued updates from the same source. `_resolved` preserves the latest complete clause state across not-yet-emitted events (`Selection.ts:197–203,382–389`; `AsyncDispatch.ts:122–143,185–199`). This lifecycle is valuable in asynchronous database querying. It does not by itself provide persistent undo, data-version checks, or stale-evidence protection.

`include` registers downstream relays; the inspected constructor does not copy already-existing upstream clauses into the new selection (`Selection.ts:97–107`). Do not assume “include” is a snapshot import. A React adapter must explicitly manage initialization, event listener removal, downstream relay lifetime, and stable source object lifetime. The inspected `Selection` class provides no serialize/deserialize API or public downstream unlink operation.

## 2. Predicate meaning and concrete exactness hazards

### Typed values and empty selections [UP-CLAUSE, UP-SQL]

- `clausePoint` uses null-safe `isInDistinct`; `undefined` clears, but `null` is a real selectable value (`PointClause.ts:42–60`).
- `clausePoints(fields, tuples, …)` preserves tuple relationships by OR-ing row-wise conjunctions. For a single field it uses null-safe membership. An empty tuple list becomes the false SQL literal; null/undefined clears. This distinguishes “no active constraint” from an explicitly empty result (`PointClause.ts:75–100`).
- `clauseList` currently treats an empty list as clear; it uses `list_has_any` or `list_has_all`. Therefore emptiness is type-specific; do not normalize every empty array to the same semantics (`ListClause.ts:50–75`).
- `clauseMatch` supports contains/prefix/suffix/regexp and case sensitivity. Empty search text clears; it is not an arbitrary JavaScript predicate (`MatchClause.ts:59–74`).
- `clauseInterval` builds SQL `BETWEEN`, and `clauseIntervals` ANDs such intervals. Both endpoints are inclusive. Exact half-open intervals, time windows, or the repository's terminal-bin convention require explicit translation rather than passing all intervals into this helper unchanged (`IntervalClause.ts:76–95,113–141`; SQL `BetweenOpNode`).

Selection types use SQL column semantics. Numeric-looking strings, nulls, blanks, dates, and NaN must be normalized intentionally to match explorEDA's own parsers and field types. A SQL backend migration cannot assume JavaScript coercion, locale, or null behavior matches existing Crossfilter predicates.

### Pixel quantization does not establish source-row equality [UP-PREAGG, UP-INTERACT]

The vgplot interval inversion helper floors screen coordinates to the configured `pixelSize` grid before inverting. The optimizer separately transforms data through a scale, applies floor/ceil/round, casts bins to int32, and applies an inclusive interval test to the binned values (`interactors/util/invert.js:1–3`; `PreAggregator.ts:266–289,312–332`).

**Source-derived counterexample, not an executed test:** with an identity scale and floor bins of width one, the exact source interval `[10,20]` rejects `20.9`, while `floor(x) BETWEEN 10 AND 20` accepts it. Snapping a pointer to pixel 20 does not make those membership definitions identical. The aggregate can be exact for the **binned** selection while differing from an arbitrary source-space selection. This is the boundary the proposed exact-evidence gate must enforce.

Safe exploratory use requires either a declared snapped-bin semantic contract or exact source-predicate rechecking. A pixel-binned aggregate alone cannot reconstruct exact selected IDs or trace contributors. Preserve raw row queries and independently verify exported IDs against the declared source-space predicate. Do not label only a small floating-point aggregate tolerance as sufficient; membership equality is a separate hard gate.

### Lasso and region selection [UP-INTERACT]

The inspected current interactor API lists rectangular `region` selection and 1D/2D intervals; it does not document a built-in lasso. The actual `Region` class creates a rectangular brush, hit-tests rendered elements, collects selected channel tuples, and publishes `clausePoints` (`Region.js:31–38,51–79,93–99`). It is not an arbitrary polygon predicate and is not evidence of complete source-row coverage for a binned/raster display. Its tuple deduplication uses joined strings at line 70, another reason not to treat rendered-element extraction as a stable exact row-ID protocol.

A custom lasso interactor could publish an SQL predicate or selected ID tuples because the clause model accepts expressions, but this would still require explicit geometry semantics, boundary rules, stable identity, complete source-row evaluation, and persistence. The current `PreAggregator.activeColumns` recognizes only `point` and `interval` metadata. A true polygon predicate is not automatically accelerated by this implementation. The project should retain its lasso proof priority and not silently substitute the upstream rectangular Region interaction.

## 3. Preaggregation: observed current mechanics and limitations

### Eligibility and construction [UP-PREAGG, UP-PRECOL, UP-STATS, UP-LINEAGE]

`PreAggregator.request` requires enabled preaggregation, an active clause, a source, a non-null predicate, recognized metadata, and compatible client query. Missing metadata falls back to normal querying. Active point fields become raw group dimensions. Active interval fields become scale/pixel bins. It caches preaggregate information per client for the active source; changing active source clears local entries (`PreAggregator.ts:163–235,247–299`).

`preaggColumns` checks `client.filterStable`, a structured `SelectQuery`, a single resolvable base table, and supported aggregate expressions. It rejects uninspectable verbatim aggregate expressions, DISTINCT aggregates, and queries without aggregates. It rewrites selected expressions, aggregate ORDER BY/HAVING/QUALIFY, and adds nonselected group dimensions (`preagg-columns.ts:33–115,124–149`). `MosaicClient.filterStable` defaults to true, so a custom client has responsibility to override it when filter changes alter its grouping domain (`MosaicClient.ts:127–134`).

Current source walks CTEs/subqueries/set operations for one common base table, but does not accept arbitrary joins as one eligible base (`lineage.ts:27–64`). A materialized joined table or single database view is conceptually a different input. Detailed subquery pushdown and lineage code were inspected; this does not warrant promising arbitrary custom SQL compatibility.

The created table combines client group dimensions/sufficient measures with active selection dimensions while applying all **nonactive** resolved filters. The active clause is removed before constructing the table; update queries then filter the materialized table by the changing active values. The table name is a hash of the construction SQL (`PreAggregator.ts:216–225,343–387`). This is workload-specific reuse, not a complete cube for every potential Boolean expression.

### Supported aggregates and sufficient statistics

The current function dispatch supports count, sum, average, geometric mean, arg min/max, variance/stddev, covariance/correlation, regression statistics, min/max, bit and/or/xor, bool and/or, and product. Unknown functions return null and fall back. DISTINCT is rejected upstream. Exact median/quantile and distinct count are not automatically accelerated in this inspected code (`sufficient-statistics.ts:16–91`; `preagg-columns.ts:137–144`).

For a simple internal prototype, average should use `sum(valid measure) / count(valid measure)`, never average of group averages. **Current Mosaic's actual implementation** stores group average plus non-null count, then recombines with a weighted average, which is algebraically equivalent but has its own floating-point evaluation order (`sufficient-statistics.ts:175–178`). Count uses coalesce to return zero for no rows; sum does not indiscriminately coalesce blanks to zero. Variance/covariance use mean-centered sufficient statistics to reduce cancellation (`:137–163,246–258,278–324`). Floating-point aggregate differences still need stated tolerances while exact ID sets must match.

The inspected `preaggregator.test.ts` covers count/empty count, aggregate filter clauses, supported measures, rejecting distinct, derived columns, CTEs, positional grouping, and mean-centered statistics. It is useful upstream intent evidence, **not a test result from this session**.

### Paper/current-source incompatibility requiring a gate

The v1 paper §5.1 explicitly limits preaggregation to INTERSECT or LAST resolution; UNION resolution is not compatible. In the complete inspected current `PreAggregator.request`/`activeColumns` and coordinator update path, there is **no explicit union-resolver guard**. Materializing the other clauses and then filtering by the active clause would apply intersection in the general union case.

This is a **static correctness concern and unverified potential upstream defect**, not a claimed reproduced bug. Any later adoption proof must either disable preaggregation for union resolution or add and execute the corresponding parity test before allowing it. Do not state that the current implementation necessarily enforces every precondition in the v1 algorithm.

### Cache invalidation is not automatic data freshness

`PreAggregator.clear()` only clears local entries; changing `enabled` or schema likewise does not drop already-created tables. `dropSchema()` explicitly removes all materialized tables in the dedicated schema and is documented as needed after source data updates (`PreAggregator.ts:82–149`). A creation-query hash alone does not encode the current contents of a base table.

`Coordinator.requestQuery` clears local preaggregate state. `Coordinator.clear({cache:true})` clears the query result cache and client state by default, but it does not call `preaggregator.dropSchema`. `QueryManager` caches by SQL text, uses in-flight deduplication, and has a generation counter to avoid storing stale in-flight responses after clearing (`Coordinator.ts:106–116,247–251`; `QueryManager.ts:99–144,279–299`). Database connector replacement alone simply sets the connector in the inspected manager; data/backend lifecycle must be handled by the embedding application.

The current result LRU defaults to a 256 MiB byte budget (`util/cache.ts:23`); this is a client query-result budget, **not a cap on persistent preaggregate tables**. Do not claim the paper's proposed future materialized-view LRU is supplied merely because a result-cache LRU exists.

For explorEDA, data replacement, edits, calculated-field changes, normalization changes, grouping/scale changes, and source-scope changes require appropriate invalidation keys or complete rebuilds. The smallest local implementation can rebuild instead of introducing incremental view maintenance or a general cache framework.

### Fan-out, transfer, and rendering

The coordinator groups clients by selection and updates clients with `Promise.allSettled`; the manager caps concurrency, coalesces eligible Arrow queries, and caches/deduplicates identical SQL. Consolidation is conservative: WHERE/HAVING/QUALIFY/ORDER BY/distinct conditions prevent structural merging in the inspected `consolidationKey` (`Coordinator.ts:361–400`; `QueryManager.ts:39–81`; `QueryConsolidator.ts:123–175`). Not every chart gets one free shared query. Raw evidence table queries contain no aggregates, so they do not receive this preaggregation fast path. Database time, Arrow transfer/parsing, React updates, and rendering remain different latency components.

## 4. Adoption assessment for explorEDA

### Reuse the model: yes, selectively

The useful model is independent source-owned clauses plus target-specific resolution, separation of semantic values from interaction metadata, and an explicit lifecycle. It helps one selection mean the same thing across histogram, scatterplot, table, metric/finding, trace, and export. It also clarifies that a source context distribution may exclude its own predicate while exact evidence includes it.

This can be expressed with existing React state, existing typed field filters, a small bounded geometry/tuple extension when needed, and Crossfilter predicate evaluation. No SQL AST, Coordinator, DuckDB, or renderer replacement is necessary to gain those semantic benefits.

### Adopt the Selection library alone: technically possible, not currently compelling

The `Selection` constructor depends on its reactive base and SQL helpers, not on a running coordinator; direct use without launching a database is possible. But the inspected package manifest depends on DuckDB-WASM, flechette, and mosaic-sql, exposes root and node-connector exports, and does not advertise a separate selection-only subpath. No bundle measurement was performed, so do not invent a transferred-size cost or assert tree-shaking failure.

A Crossfilter adapter must still provide stable persisted IDs mapped to runtime source/client objects; typed semantic predicates mapped to SQL AST or a second evaluator; clear/undo/restore; explicit target populations; async subscription cleanup; and precise interpretation of the undefined skip sentinel. Persisting raw Mosaic clauses does not solve these requirements. Parsing SQL text back into JavaScript predicates would add disproportionate complexity. Maintaining two independent semantic representations risks drift.

The adapter earns a later experiment only if native Mosaic component interoperability becomes a real workflow or a database backend is independently justified. For the four-consumer proof, no-adoption is an explicit viable result.

### Adopt the optimizer/backend: separate later decision

The optimizer works by analyzing structured SQL and creating/querying database tables. It cannot be attached to arbitrary Crossfilter reducers just by adding scale metadata. A backend adoption needs consumer queries, schema/normalization parity, row IDs, field/data mutation lifecycle, async evidence snapshots, and measured startup/memory/query behavior. The exact-ID gate remains mandatory even when aggregate previews are faster.

The official `docs/web-clients/index.md` contains a React `useEffect`/`makeClient` example with destruction on effect cleanup. This establishes that retaining React is feasible; it does not remove the consumer migration work. Existing renderers can consume query results. Vgplot rendering adoption is not a prerequisite for either the model or the core backend.

### Reject attractive shortcuts

- Do not serialize object-identity Mosaic clauses as the project's durable analysis state.
- Do not treat `predicate(client) === undefined` as all rows.
- Do not equate `noSkip: true` with source-self-filtering on.
- Do not use inclusive `BETWEEN` for every interval without reconciling boundary conventions.
- Do not infer exact source-row membership from pixel bins or rendered marks.
- Do not replace lasso with the rectangular Region component and call the intended proof complete.
- Do not promise median/distinct-count acceleration or arbitrary joins from general SQL expressiveness.
- Do not apply preaggregation to UNION resolution without a separate verified implementation.
- Do not rely on a SQL-string hash for data freshness or confuse query-cache eviction with materialized-table eviction.
- Do not substitute published Mosaic benchmark speedups for measurements in explorEDA.

## 5. Specific unrun upstream proof checks if an adapter is later considered

1. Two stable sources selecting the same field; source replacement and clear-one-source preserve the other clause.
2. No clauses versus explicit false predicate; `clausePoints([])` versus `clauseNone`; null values versus undefined.
3. Context resolver with noSkip and evidence resolver without client; no all-rows flash on active-source skip.
4. Source-self-filtering on/off, including source charts with several mark clients.
5. Float boundary rows just below, on, and above pixel/bin edges; exact source predicate versus optimized path.
6. Tuple union containing off-diagonal values; no conversion to independent field lists.
7. Genuine source-space polygon lasso against raw rows; no reliance on displayed point sample or raster bins.
8. Intersect versus union with two nonempty clauses and preaggregation enabled/disabled; hard equality gate.
9. Data replacement with identical SQL and changed row contents; clear both result and materialized state before accepting evidence.
10. Active-source switching, clear, restore, React mount/unmount, and include construction after upstream clauses exist.

All ten checks are **proposed and unrun**. The research performed source retrieval, static reading, and provenance capture only.
