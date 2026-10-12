# Small database adapters with consistent analysis semantics for explorEDA

**Track 3 research and recommendation — 2026-10-12 UTC / 2026-10-11 Indianapolis assignment.**

**Baseline:** `byronwall/explorEDA`, commit `f01ff0fb1f9e1240020744a18816f2dad68bf488`, as declared by the supplied source manifest. This report concerns the selected source snapshot, not a fresh checkout of `main`.

**Scope:** research, proposed interfaces, illustrative SQL, and a falsifiable proof plan. No application changes, dependency installation, production access, Git changes, commits, PRs, migrations, or deployment were performed. The latest user instruction adds a fourth, hosting track: each paying customer should have a dedicated instance with little maintenance and highly automated setup and operation. “One server” therefore means **one application instance per customer**, not one shared server for all customers. Hosting platform selection belongs to that fourth track.

## 1. Recommendation and decision boundary

**Start with a host-owned endpoint that reads a bounded, complete set of registered database sources and supplies fresh immutable source arrays to the existing `ExplorEdaProject.tables` interface. Prove PostgreSQL first and embedded SQLite second. Keep the existing analysis evaluator and chart filtering responsible for analysis meaning in this first integration.**

This is the smallest useful database adapter: authenticate a read, resolve server-owned source definitions, obtain a consistent snapshot, bind values, decode supported scalar types without silent loss, enforce limits, and return an explicitly complete result. It does not need to translate every `AnalysisQuery` step to SQL. The current project component already consumes source tables, evaluates locally or in its optional worker, and exposes stages and source records to inspection. A final-row-only server response cannot replace that object faithfully. [R03] [R06] [R07] [R08]

The first public integration can be an ordinary host data loader; there is no existing `executeQuery` prop to reuse. A small server-only reader can initially live in the host integration example. Extract a reusable optional adapter module only after two real drivers validate the same behavioral boundary. Keep database dependencies out of browser entry points. This recommendation concerns ownership and runtime separation, not a decision to create a package or change an export now. [R02] [R06]

### Decision register

| Decision | Position and reason |
| --- | --- |
| First boundary | **Recommend** a host-owned complete-source reader and existing local analysis. It reaches a visible real-database proof without replacing project inspection or chart semantics. |
| First database | **Recommend provisionally** PostgreSQL with the JavaScript `pg` driver in a compatible server runtime. It exercises remote connections, TLS, server permissions, parameter binding, transactions, and driver type conversion. |
| Second proof | **Recommend provisionally** embedded SQLite, using a pinned `node:sqlite` runtime in a disposable process for the bounded proof. It challenges dynamic typing, file ownership, synchronous execution, and cancellation assumptions. |
| SQL pushdown | **Investigate after the snapshot proof.** Permit only a validated logical subset; return an explicit unsupported result for everything else. The SQL examples below are candidates for that later proof. |
| Analysis semantics | **Recommend** distinguishing analysis-query semantics from workspace/chart-demand semantics. They differ today; one generic `count`, `equals`, or “once per” interpretation would be wrong. |
| Broader engines and federation | **Defer** DuckDB as a default, arbitrary formula translation, cross-database joins, generic HTTP database compatibility, and a separate query service. Add one only when a concrete demand falsifies the simpler boundary. |
| Hosting | **Handoff constraints**, with no platform winner: driver support, private network reachability, transaction affinity, bounded execution, per-instance connection budgets, secrets, and any file/process requirements. |

**GO:** a bounded local proof of this first boundary using registered, supported source types and honest coverage. **NO-GO:** claiming arbitrary database or SQL/JavaScript parity, complete remote project inspection from aggregate rows alone, or an exact result from an incomplete snapshot.

The cost is explicit: the first integration still transfers the approved source rows and retains the current row-object, evaluator-stage, worker-copy, and Crossfilter costs. It will not solve an oversized or very wide source merely by introducing a database. The expansion trigger is a measured failure on a named 10,000–100,000-row workload, or a source that cannot be transferred in full within the agreed budgets. [R07] [R08] [R09] [R16]

**Serious alternative:** introduce a narrow server row/aggregate read executor immediately and adapt chart consumers to remote results. That can reduce data transfer and database work for visible demands, but it also requires coverage, filter-scope, lineage, and inspection changes that the current component does not already provide. Prefer it if the complete-source proof fails its capacity or first-view target. A separate service adds another deployable and credential/network boundary per customer; it earns that cost only if the host cannot run the necessary driver or a customer-network connector becomes an actual product requirement. [R03] [R06] [R09] [R13]

**Falsifier:** the same complete fixture must render equivalent rows, types, diagnostics, contributors, bar/scatter selections, and restore behavior through fake, PostgreSQL, and SQLite readers. If the second adapter needs a different client result shape, blocks unrelated work, loses values, or cannot uphold the advertised completion/cleanup contract, the boundary or selected driver must change before abstraction is extracted.

## 2. Access, source evidence, and notebook interpretation

### 2.1 Access result

- The authorized attached ZIP supplied all material files required for this track's bounded recommendation. No repository checkout or production credentials were needed.
- All **34 baseline source-file SHA-256 hashes** matched `source-manifest.json`.
- All **three notebook-photo hashes and byte lengths** matched `photo-manifest.json`; all three images were visually inspected.
- `prompt(2).md` was byte-identical to `prompts/database-adapters.md` in the ZIP.
- `source-notes.md` and both other research prompts were read. The other prompts are coordination context, not additional assignments.
- The manifest identifies a **selected source snapshot, not a runnable checkout**. Hash verification proves consistency with that supplied manifest, not an independent Git-object attestation or the current state of `origin/main`.

The report's repository statements come from the attached code and tests. The code links in the evidence appendix identify the declared baseline and relevant symbols. External technical claims use primary documentation retrieved on **2026-10-12 UTC**. Proposed behavior, inferred risks, source observations, and actual validation are distinguished throughout.

### 2.2 What the photos establish

| Source | Observation and consequence |
| --- | --- |
| Notebook 1 | Contrasts today's client-held data with server queries and small aggregate results. It recognizes query latency as a new user-experience cost. This supports investigating server reductions without requiring them in the first adapter. |
| Notebook 2 | Shows a scatter plot with roughly 10,000 points, full-result versus subset loading, and a growing row/column cache. It explicitly distinguishes exact filtering with all needed rows from incomplete coverage. The handwritten byte estimate is unclear and is not used as a measurement or target. |
| Notebook 3 | Links schema, charts, and filters to demands and adapters; mentions efficient column packing, row/transfer limits, and client memory. It cautions against letting massive-scale problems block a good 10,000–100,000-row experience. |
| Source notes | Confirm responsiveness and real database access as the durable goals. Binary formats, a universal SQL compiler, and progressive caches remain hypotheses. |

The new per-customer hosting instruction changes the operational reading, not the semantic requirement: repeatable provisioning should produce the same small adapter behavior for each customer, while connection details, policy, and network routes remain specific to that instance.

### 2.3 Consequential repository findings

| Observed source | Implication for adapters |
| --- | --- |
| Root manifest specifies `pnpm@11.9.0`; the package is `exploreda`, a React/TypeScript library with React 18/19 peers. The supplied READMEs and agent guide describe the React demo. | Keep React/TypeScript. No framework migration is implicated. The demo's source and manifest were not supplied, so its current runtime was not independently exercised. [R01] [R02] |
| `AnalysisQuery` has source, lookup, expand, calculate, filter, and aggregate steps. `SourceDefinition.entityKey` is one field. | These are existing logical semantics, not a SQL AST or composite-key database catalog. [R03] |
| `AnalysisEvaluation` includes fields, all evaluated stages and their rows, source/contributor references, diagnostics, counts, and revision. | A rows-and-schema database result is not a complete `AnalysisEvaluation`. Empty placeholder stages or contributor arrays would remove observable meaning. [R03] [R07] |
| `ExplorEdaProject` takes `tables`, invokes `useAnalysisEvaluation`, uses tables in schema/query panels, and provides evaluation rows to chart traces. | A complete source loader is an existing integration seam. A remote-evaluation callback and remote inspection are new work. [R06] |
| The optional worker receives `sources` and then `evaluate` messages. The hook rejects outdated reply IDs and preserves the last same-query result while pending. | Reuse the local worker for the first proof. HTTP cancellation and database stopping require a separate request lifecycle; stale-reply rejection is not cancellation. [R08] |
| The provider constructs row objects and Crossfilter and applies field settings to runtime data; project results receive local numeric `__ID` values. | A columnar wire format does not remove current resident copies. Database keys and the local `__ID` index must remain distinct. [R06] [R09] |
| `CrossfilterWrapper` distinguishes fully filtered rows, each chart's context, local chart population, and a workspace field's own-filter exclusion. | A server must not collapse every demand into one global `WHERE` clause. Complete source snapshots preserve these distinctions locally. [R10] [R11] |
| The two aggregation implementations differ in counting, missing entities, conflict handling, and contributor records. | SQL acceptance must identify which semantic consumer is being served; the differences below are material, not cosmetic. [R07] [R13] |
| Scatter and bar planners consume local IDs, selected/context membership, numeric eligibility, and trace data. Bars can pool groups by re-reducing contributor rows. | Returning only bars or averages is insufficient for all existing interactions, “Other” totals, or drilldown. [R13] [R14] [R15] |
| Local `counts.available` is assigned `output.rows.length`; revisions include process-local immutable-array identities. | Neither field establishes remote completeness, database freshness, or reusable snapshot identity. Add distinct metadata at the read boundary. [R07] |

Missing optional evidence matters. The packet does not include the calculation parser/engine, `categories.ts`, all field-normalization helpers, worker bootstrap, complete chart registry, or the rest of the application/test environment. The supplied call sites establish the identified seams, but they do not justify arbitrary formula translation, complete category normalization parity, or a fresh runtime pass. [R07] [R09] [R12] [R13]

## 3. Ownership and the smallest useful adapter

### 3.1 Ownership allocation

| Owner | Responsibility |
| --- | --- |
| Host application | Authenticate users; own each customer's instance configuration, source registry, secrets, database permissions, endpoint routing, refresh policy, and connection/process lifecycle. Select the reader and pass completed source arrays to explorEDA. |
| explorEDA client | Own editable analysis definitions, bindings, saved settings, local calculations, chart population and linked selections, row-key-to-`__ID` mapping, and visible pending/error state. In the first cut, evaluate the complete approved snapshot locally. |
| Server endpoint | Validate a small request; resolve the authenticated instance's registered source set; enforce authorization and budgets; coordinate one read snapshot; map errors; publish a complete result or an error. It must not accept credentials, arbitrary hostnames, SQL, or relation names from the browser. |
| Query compiler/evaluator | Initially the existing JavaScript evaluator owns all six analysis steps. Later, a server compiler may accept an explicitly supported logical subset after scope/type/identity validation. SQL construction belongs here, not in HTTP serialization. |
| Database reader/driver | Bind parameters, acquire a connection or file handle, execute within bounds, expose raw type metadata, normalize through the registered schema, stop/discard canceled work, and clean up. SQL dialect details stay server-side. |
| Transport encoder/decoder | Serialize typed cells, identity, coverage, counts, and completion/error metadata. Preserve distinctions chosen by the semantic contract. Compression and binary format selection belong to the transport track. |

The host can call a reader from any suitable server framework. The client sees domain identifiers and rows, not a connection pool, SQL text, cursor object, or engine error. A private-network agent, if later selected by hosting, would implement this same bounded read behavior inside the reachable network; it is not required by the initial library architecture.

### 3.2 Alternatives and maintenance cost

| Alternative | Tradeoff for one maintainer and dedicated customer instances |
| --- | --- |
| Host-provided snapshot execution — **first recommendation** | Smallest client integration and preserves current analysis/inspection. Costs include host setup code, full source transfer, and local memory. Reject if the named bounded workload cannot meet agreed budgets. |
| Library-owned optional server adapters | Centralizes fixes and parity tests across hosts. Adds packaging, driver/runtime version support, and security-sensitive code. Extract after PostgreSQL and SQLite identify real shared behavior, not a generic base class in advance. |
| Immediate host-provided logical row/aggregate execution | Reduces transfer for specific demands. Requires a new client result-consumption path, semantic validation, complete scope/coverage identity, and a plan for inspection. Promote when it solves a measured limitation of snapshots. |
| Separate service | Can isolate a driver/runtime or run near a private database. Adds a deployable, health checks, secrets, network hops, and an upgrade lifecycle per customer. Defer unless reachability or isolation requires it. |

The strongest simpler counterproposal to a universal adapter framework is **one fixed host endpoint with hand-written parameterized source queries**, no shared adapter package at all. That is a good implementation of the first proof. The shared reader interface earns its existence only when changing the engine leaves the endpoint's authorization, result validation, and client behavior intact.

### 3.3 Cut line for the first version

- **Available:** registered source sets from one database/connection domain; declared supported scalar fields; full authorized rows for every advertised field; deterministic identity/order; one bounded read transaction; endpoint cancellation handling; completion, type, and limit errors.
- **Available locally after the read:** the existing source/lookup/expand/calculate/filter/aggregate evaluator, chart/workspace filters, trace records, and the existing local imported/demo mode. These retain their current behavior; this report does not assert that every existing edge case is correct.
- **Unavailable on the server initially:** arbitrary analysis AST execution, arbitrary calculated formulas, chart reductions, cross-database federation, remote trace pagination, sampling, incremental change capture, and general user-selected sorting/keyset sessions.
- **Possible next slice:** one typed row demand or one grouped measure that beats the snapshot baseline and passes the same semantic contract. A rejected server plan remains rejected; it is not silently split between a partial database result and local evaluation.

The existing local mode and a database snapshot mode can use the same deployed client version and evaluator. This is ordinary data-source choice, not version coexistence or a duplicate fallback query platform.

## 4. Database and driver order

### 4.1 PostgreSQL, SQLite, and DuckDB

| Candidate | Why it changes the boundary |
| --- | --- |
| **PostgreSQL first** — remote relational server | The `pg` JavaScript driver supports bound values, connection pools, per-query type parsing, and cursors. An explicit transaction must use one checked-out client. This proves the important real-customer path: a database with its own permissions and network location. The cost is connection setup/pooling, TLS and routing, and normalization of driver outputs. [E01] [E02] [E04] [E05] [E06] |
| **SQLite second** — embedded file database | SQLite's value storage classes and column affinity differ from PostgreSQL's schema typing. The Node 24 documentation retrieved here identifies `node:sqlite` as a release candidate and its database APIs as synchronous. Read-only opening and BigInt reads are available; its timeout concerns lock waiting, and no `interrupt` method is documented in this API. Use a disposable process for the proof if bounded interruption is required; do not promise that `AbortSignal` stops a synchronous query. [E15] [E20] |
| **DuckDB later**, or a replacement second proof if analytical file access is the actual product need | DuckDB Node Neo is a native Node client with typed values and asynchronous APIs. Its documented surface and embedded concurrency assumptions differ from a remote PostgreSQL server. It is attractive for analytical scans/files, but it would also invite data movement, extensions, and a second query engine. Its Node API should not be assumed to provide an Arrow transport contract merely because DuckDB can work with Arrow elsewhere. [E21] [E22] |

These choices are provisional source-reader proofs, not commitments to operate a PostgreSQL database alongside every customer instance. The first database can be a customer's existing remote PostgreSQL server; the proof uses a disposable local fixture. A customer SQLite file must actually be accessible to the selected runtime. A PostgreSQL connection string cannot open SQLite, and a file path on the customer laptop is not accessible to a hosted server.

An HTTP-hosted database based on SQLite, a PostgreSQL-compatible HTTP endpoint, and DuckDB-Wasm are distinct driver/runtime integrations. Similar SQL syntax does not prove transaction, cancellation, type, or connection behavior. Do not count one as validation of another. This is an architectural inference, not a claim that those services are unusable.

### 4.2 Why SQLite is a useful falsifier

The same reader result must survive these differences without growing a forest of client flags:

1. A logical Boolean stored as SQLite integer `0`/`1` must be decoded using source metadata; integer `2` must fail that field contract.
2. A permissive column containing `7`, `"7"`, and `"bad"` must retain its actual values or fail a declared homogeneous type. Driver coercion must not manufacture PostgreSQL-like consistency.
3. A 64-bit ID must not become an imprecise JavaScript number.
4. Multiple source reads must share one file/read transaction, and locks or process death must not yield a successful partial bundle.
5. A synchronous database call must not block the HTTP server's cancellation and unrelated requests.
6. A source without stable keys must follow the same snapshot-only identity restriction as PostgreSQL.

If supporting SQLite requires application-specific result shapes, unconditional use of files/processes in the generic interface, or weakened cancellation/completeness promises, reject the abstraction as written. Keep the logical result and move execution isolation into the host, choose another SQLite driver after evidence, or reconsider DuckDB as the second proof. A callback that always resolves after an uncancelable blocking operation does not pass just because its TypeScript return type is a Promise.

### 4.3 Version and verification policy

The packet has no selected database driver dependency. The proof must record the exact resolved `pg`, `pg-cursor` if used, Node, SQLite, PostgreSQL, and any DuckDB package/engine versions. Node 24 is a reasonable local proof candidate because the repository's release guidance names it; this does not establish a host runtime requirement or a selected hosting platform. Current documentation was reviewed, not installed binaries. Recheck version-specific behavior when pinning the proof environment. [R01] [E20] [E21]

## 5. Semantic differences and safe SQL admission

### 5.1 There are two existing semantic contexts

**Analysis-query context** is `evaluateAnalysisQuery` and its step functions. **Workspace-demand context** is the current chart/provider path, including `applyFilter`, `summarizeGroup`, and population logic. Their shared operation names do not imply shared definitions. Carry the consumer context in a future logical intent, or use separate request variants that make it unambiguous. This is not a version negotiation mechanism. [R07] [R10] [R12] [R13]

The safe source-snapshot boundary avoids translating these differences. A future server compiler must validate them before executing a plan, including fields, source roles, input cardinality, missing-value representation, and what diagnostics the requested result promises.

### 5.2 Semantic difference table

| Baseline meaning | SQL/driver difference and admission rule |
| --- | --- |
| **Source fields:** source rows are projected to `${sourceId}.${fieldId}`; declared field metadata is retained. Raw scalar values are not universally cast by `sourceFrame`. | Use a server-owned field map and explicit decoding. SQL aliases are generated from that map. Do not infer an engine's logical type from its first row or silently coerce a mixed column. [R03] [R07] [E02] [E15] |
| **Null versus undefined:** both are allowed analysis scalars and both satisfy `is-null`, but they remain distinct values in other operations. | SQL has one NULL marker. Source SQL NULL decodes to `null`; missing lookup/calculation output may require a separate availability/presence marker to reconstruct `undefined`. The first raw-source response need not invent undefined cells. [R03] [R07] |
| **Analysis `eq`:** `left === value && left != null`; even `eq null` and `eq undefined` match nothing. | Do not translate `eq null` into `IS NULL`. For a validated, homogeneous nonnull parameter, ordinary equality is a candidate. Mixed types, NaN, or special collations need rejection or a proven typed comparison. [R07] [E07] |
| **Analysis `neq`:** `left !== value`; a null row survives inequality against a nonnull value. `neq null` differs from `neq undefined`. | `<>` alone is wrong. PostgreSQL `IS DISTINCT FROM $1` is a candidate only when SQL NULL represents the sole missing state at that point and types agree. A presence marker is necessary after steps that can create undefined. The driver converts bound undefined and null to the same SQL NULL, so reject or explicitly lower undefined before binding. [R07] [E01] [E07] |
| **Analysis ordered filters:** compare number-to-number or string-to-string only. | SQLite affinity can coerce operands, and database ordering may compare values the evaluator rejects. Admit finite homogeneous numeric fields; do not rely on an implicit cast for mixed operands. [R07] [E15] |
| **String ordering:** JavaScript string `<` follows UTF-16 code units. | A database's locale collation, byte order, and Unicode code-point order need not match. Even a bytewise/C collation is not a blanket solution for supplementary characters. First pushdown should restrict ordered text to a proven domain such as ASCII identifiers, or leave it local. [R07] [E12] [E29] |
| **Analysis date parameters:** validation accepts recognized date text, but ordered filtering still compares the strings. | Translating a date-typed parameter into a SQL timestamp comparison can change meaning. Admit only canonical fixed-width representations whose ordering is proven, or preserve local evaluation. [R07] [R12] |
| **Workspace ranges:** parse eligible numeric strings and exclude blanks, booleans, and nonfinite values. | An AnalysisQuery numeric predicate is not equivalent. A native finite-number field is a narrow safe candidate; numeric-text conversion requires the exact parser policy, not database CAST behavior. [R12] [R13] [E15] [E19] |
| **Numeric text:** `parseNumber` accepts decimal/exponent forms through `Number`, rejects blank and radix-prefixed text; `numericExclusionReason` distinguishes missing, blank, Boolean, and nonfinite values. | PostgreSQL casts can error and SQLite numeric aggregates can interpret invalid text differently. Excluding invalid values is not equivalent to casting them to zero or turning all exclusions into NULL without reasons. Leave heterogeneous numeric-text reductions local initially. [R12] [E15] [E19] |
| **Workspace missing-category selection:** selecting a nullish category also matches blank/whitespace strings. | `IS NULL` misses those strings. The imported category implementation is absent, so full category pushdown is not evidenced. [R10] [R12] [R13] |
| **Workspace text filters:** JavaScript lowercasing plus contains/equals/prefix/suffix over strings. | SQL LIKE/ILIKE has wildcard, escape, collation, and case-mapping rules. Bind values and escape pattern metacharacters if a later translation is admitted; do not assume equivalence for Unicode. Keep this unsupported initially. [R10] [E12] |
| **Workspace dates:** offset-less recognized text is read as UTC; date-only upper bounds cover through `23:59:59.999Z`; fractional seconds are rounded to milliseconds. | Driver-local timezone parsing, SQL session timezone, and microsecond precision can change membership. A half-open next-day bound is equivalent only under a declared millisecond-aligned input domain. Do not apply it blindly to arbitrary microsecond timestamps. [R12] [E02] |
| **Lookup:** exactly one match adds fields; zero or multiple matches produce undefined fields while retaining one row per input. | A normal LEFT JOIN duplicates ambiguous inputs. Use match-count/uniqueness validation and an explicit presence marker; never select an arbitrary first match. [R07] |
| **Lookup keys:** null, undefined, and NaN keys never match; number `7` and string `"7"` remain different. | Do not use null-safe equality for relationship joins or cast keys together. A validated same-type nonnull join key is the initial candidate. [R07] [E07] [E15] |
| **Lookup contributors:** ambiguity records all matching target references as contributors but no selected target in `sourceRows`. | Scalar projections or a match count alone cannot reproduce full lineage. Return bounded lineage in a later supported result, or declare that remote evaluation/inspection unavailable. [R07] |
| **Expand:** emits every match; `keepUnmatched` retains one row with undefined related fields and a distinct unmatched row key. | INNER/LEFT JOIN is structurally suitable after typed join validation. Preserve multiplicity and composite occurrence identity. Expansion limits apply to output rows, not just source-table counts. [R07] |
| **Relationship cardinality:** the definition labels cardinality, but the evaluator does not enforce it before lookup/expand. | A declared many-to-one relationship is not proof of uniqueness. Verify schema constraints and actual accessible data; server validation may reject a violated promise rather than silently change grain. [R03] [R07] |
| **Calculate:** the parser and Calculator evaluate each row; successful Date results become ISO strings; failed evaluations produce undefined and diagnostics. | The full parser/function semantics are missing. Arbitrary formula strings must not become SQL, JavaScript on the server, or unreviewed database functions. Keep calculation local; later admit individual typed operations only after proof. [R07] |
| **Analysis grouping:** typed string tokens separate null, undefined, string `"7"`, number `7`, and Boolean true; positive/negative zero share a token. Groups appear in first-encounter order. | A plain GROUP BY loses missing-state/type distinctions in permissive data and does not promise this output order. Use a proven homogeneous subset or tagged group keys. Explicitly preserve row ordering where it is observable. [R07] [E15] |
| **Analysis count:** `count` with no field counts candidate rows; with a field it excludes only null/undefined, including blank/invalid/nonfinite values as present. | COUNT(*) and COUNT(field) are candidates for a typed SQL-null-only frame. Do not reuse the numeric valid-contributor count as count(field). [R07] [E08] |
| **Analysis sum/average:** eligible finite values are reduced; no eligible values yields undefined, not zero. | SQL SUM/AVG commonly yield NULL with no inputs. Decode using valid-count/status metadata. Do not COALESCE an unavailable measure to zero. [R07] [R12] [E08] |
| **Numeric reduction order:** JavaScript reduces in array order using Number arithmetic. | SQL may aggregate in a different order or use a wider/exact numeric type. Floating sums can differ; a generic tolerance would redefine an unapproved contract. First scalar-reduction proof uses bounded safe integers with an absolute-sum bound within the safe range. General floating reductions remain an investigation. [R07] [R13] [E08] [E19] |
| **Analysis entity deduplication:** when the entity field has source origin, deduplication uses the first corresponding physical `sourceRows` reference, not simply the field's value. | GROUP BY an arbitrary `entityFieldId` can collapse different source rows. Restrict initial support to one unambiguously tracked physical source key/role. Repeated/self-source roles and derived entity fields need additional proof. [R07] |
| **Analysis entity conflicts:** raw typed values are compared before numeric conversion. Conflicted entities are removed; sum/average become unavailable, while count returns remaining candidates. | `SUM(DISTINCT amount)` is wrong: equal amounts on different entities still count twice. Numeric conversion before conflict detection is also wrong for `7` versus `"7"`. Do not replace the observed count behavior with a different rule unnoticed. [R07] |
| **Workspace once-per:** deduplicates entity values, excludes null/undefined IDs, compares raw values with `Object.is`, and makes the entire measure unavailable on conflict, including count. | This differs from analysis entities. A valid identity unit counts even if its measure value is null; workspace count does not apply numeric eligibility and differs from analysis count(field). `Object.is` also distinguishes positive/negative zero. SQL admission must use workspace-specific validity and conflict rules or reject the demand. [R13] |
| **Workspace count and pooled groups:** count includes valid units even when their measure value is null; pooling re-reduces contributors so averages weight inputs and shared entity IDs are not double-counted. | Do not apply numeric eligibility to count, sum group counts blindly under once-per semantics, or average group averages. Totals, “Other,” and drilldown require original units or a proven sufficient representation. [R13] [R15] |
| **Diagnostics/stages/counts:** excluded counts are stage-specific; aggregate exclusions can count measure-contributor events, not unique removed rows. | Do not derive a universal “excluded = source − output” value, especially after expand or multiple measures. Driver/protocol errors and analysis diagnostics are separate. [R03] [R07] |

Some observed edge behavior may deserve later product clarification—for example analysis conflict counts or first-source-reference selection in repeated joins. The adapter must document and reject an unsupported case rather than silently “fix” the evaluator as part of database integration. Invalid plans should be rejected by validation; accidental undefined values from an unknown field are not a requirement to support malformed queries. [R07] [R17]

### 5.3 Type fidelity at the source boundary

Use a registered **logical source schema** and retain the database type as metadata. The existing runtime's cell model is `string | number | boolean | null | undefined`; it has no exact-decimal, BigInt, binary, array, or struct cell type. Correctness requires an explicit admission rule rather than a catch-all `String(value)` or `Number(value)`. [R03] [R04] [E02] [E20] [E21]

- Admit text, Boolean, nullable supported scalars, safe integer numbers, and finite native floating-point numbers after validation. Initial arithmetic proofs should use safe integers; transferring a finite float does not by itself prove order-independent aggregate parity.
- A 64-bit integer can remain an internal BigInt/string until checked. Convert to Number only inside the exact safe-integer range. For a registered ID outside that range, a separate synthetic key may use an explicitly tagged nonnumeric token such as `i64:9007199254740993`; retain the original key type in source metadata. Plain decimal text plus a string type hint does not prevent accidental numeric interpretation. Do not silently change an existing numeric field's type.
- Exact decimals need either a richer agreed scalar representation or an explicitly defined source projection, such as integer minor units with a checked range. Do not claim a decimal-to-Number conversion is lossless. Preserving decimal text can preserve transport bytes, but current local aggregate parsers still read numeric text as Number. **Reject or explicitly exclude unsupported exact-decimal analytical fields from the first snapshots** unless their registered safe projection has been validated. Rejecting only server pushdown would leave the same precision loss on the client.
- SQL DATE is a calendar date; expose a fixed `YYYY-MM-DD` string with a date field declaration. A timestamp without timezone needs an explicit source timezone interpretation. The first instant profile is canonical UTC with millisecond-aligned precision and validated range; do not let driver process timezone choose the result. Textual transport alone does not protect submillisecond temporal membership because the local date parser rounds fractions. Reject or exclude that unsupported temporal field until an agreed lossless interpretation is implemented and proven.
- Distinguish database NULL, empty string, whitespace, invalid numeric text, and later unavailable calculation results. JSON serialization must not erase a required undefined marker or turn NaN/Infinity into an apparently valid null. The first raw database snapshot can restrict itself to finite values and SQL nulls; existing local special-value handling remains local. [R04]
- Binary/nested values, unrecognized driver objects, nonfinite measurements, and text outside a declared size bound fail with a field-specific type/limit error unless a server-owned source definition explicitly excludes or transforms that field. Do not stringify nested records into a field that is still advertised as numeric or structural data.

Field declarations are **hints, not operation enforcement**. `ExplorEdaProject` supplies declared type defaults through `renderedSettings` only when settings/presets exist (`if (!settings) return undefined`); saved field overrides then win. Analysis numeric reductions parse values without consulting those type hints. Therefore parity tests must compare the same registered schema **and** the same field settings, not raw database rows on one side and coerced chart columns on the other. No existing field-operation gate is established by this packet. [R06] [R07] [R09] [R12]

### 5.4 Stable identity and row meaning

| Identity situation | Required policy |
| --- | --- |
| Unique nonnull single key | Normalize with its declared type and namespace by source. Keep it stable across sort/filter changes; reject collisions after decoding. Match the current evaluator's keys where possible. |
| Composite key | Preserve each typed component in an unambiguous tuple encoding, including length/type or structured escaping. For the first local integration, a server-owned synthetic scalar field can carry that opaque tuple and become `entityKey`. Preserve the original components and distinguish the synthetic key from a customer business field. Simple delimiter concatenation is insufficient. |
| No primary key, or duplicated/missing entity keys | Materialize one complete bounded snapshot, assign occurrence IDs once, and advertise **snapshot-only identity**. Duplicate equal rows remain distinct occurrences. A refresh creates a new identity domain, so prior row selections cannot silently rebind. |
| Expanded rows | Include the input occurrence and related occurrence/role in identity, including an unmatched marker. One parent's key cannot identify several expanded rows. |
| Aggregate rows | Key by step/semantic context and a typed group tuple; constituent source references remain separate from the group identity. |

The current positional fallback is useful within one immutable array but is not evidence for stable server pagination. Never use fresh unordered `row_number()`, page-local array indices, a content hash that collapses identical duplicate rows, PostgreSQL `ctid`, or an unaliased SQLite `rowid` as a durable cross-refresh identity. PostgreSQL documents `ctid` as a physical row-version location; SQLite documents unaliased rowid changes under VACUUM. [R07] [R18] [E11] [E17]

Without a key, return the bounded snapshot atomically or materialize it under a bounded server snapshot ID before paging. If neither is affordable, return `UNSUPPORTED` for stable pagination. No data migration or new customer primary key is required by this research recommendation.

## 6. A small capability, result, and error contract

### 6.1 Separate three boundaries

1. **Logical intent:** a registered source snapshot initially; later a named analysis/workspace demand with fields, filters, grain, and scope.
2. **Execution:** host authorization plus source registry, validated plan, SQL dialect, connection/driver, and normalization.
3. **Wire encoding:** typed rows/columns and completion metadata chosen with the transport track.

A client must never submit the internal authorized plan or SQL. A capability response is advisory; the endpoint validates every request again against its current authenticated registry. There is one deployed contract, not a version-coexistence framework.

### 6.2 Minimal TypeScript sketches — proposals, not current exports

These sketches intentionally describe the first complete-snapshot reader. SQL pushdown is not made available merely by adding a Boolean flag.

```ts
type SourceId = string;
type LogicalScalar = string | number | boolean | null;
type SourceRows = ReadonlyArray<Readonly<Record<string, LogicalScalar>>>;

// Browser -> host. IDs select server-owned configuration, never SQL names.
type SnapshotIntent = {
  requestId: string;
  sourceSetId: string;
  expectedSchemaRevision: string;
};

type ReadLimits = {
  maxRowsPerSource: number;
  maxTotalRows: number;
  maxCellBytes: number;
  maxDecodedBytes: number; // Logical payload accounting, not actual JS heap.
  maxEncodedBytes: number; // Encoder response budget before publication.
  deadlineAt: number; // Server monotonic-clock deadline in its own process.
};

type ReadContext = {
  signal: AbortSignal;
  limits: ReadLimits;
};

type PublicSource = {
  sourceId: SourceId;
  fields: ReadonlyArray<{
    id: string;
    logicalType: "string" | "number" | "boolean" | "date";
    databaseType: string;
    nullable: boolean;
  }>;
  entityKey: string;
  identity: "stable-key" | "snapshot-only";
};

type RegisteredSource = PublicSource & {
  relationKey: string; // Server-only allowlist key; never returned to the client.
};

// Constructed only after endpoint authorization; scoped to one database.
type AuthorizedSnapshot = {
  sourceSetId: string;
  schemaRevision: string;
  policyRevision: string;
  sources: readonly RegisteredSource[];
};

type CompleteSnapshot = {
  requestId: string;
  sourceSetId: string;
  schemaRevision: string;
  policyRevision: string;
  snapshotId: string; // Opaque result identity, not a resumable DB transaction.
  consistency: "single-read-snapshot";
  coverage: {
    kind: "complete";
    fields: Readonly<Record<SourceId, readonly string[]>>;
  };
  sources: readonly PublicSource[];
  tables: Readonly<Record<SourceId, SourceRows>>;
  counts: Readonly<Record<SourceId, { returned: number; total: number }>>;
};

type ReadErrorCode =
  | "INVALID_REQUEST" | "FORBIDDEN" | "SOURCE_UNAVAILABLE"
  | "SCHEMA_CHANGED" | "UNSUPPORTED" | "TYPE_MISMATCH"
  | "LIMIT_EXCEEDED" | "TIMEOUT" | "CANCELLED"
  | "SNAPSHOT_EXPIRED" | "INTERNAL";

type ReadError = {
  code: ReadErrorCode;
  message: string; // Safe action-oriented explanation; no credentials/SQL.
  requestId: string;
  retryable: boolean;
  sourceId?: string;
  fieldId?: string;
  stepId?: string;
  limit?: "rows" | "bytes" | "cell" | "time";
  diagnosticId: string;
};

type ReadReply =
  | { ok: true; value: CompleteSnapshot }
  | { ok: false; error: ReadError };

type ReadCapability = {
  intents: readonly ["source-snapshot"];
  consistency: "single-read-snapshot";
  cancellation: "discard-and-bound-execution";
};

interface SnapshotReader {
  readonly capability: ReadCapability;
  // No HTTP, SQL text, secrets, or native driver objects in the result.
  read(plan: AuthorizedSnapshot, context: ReadContext): Promise<
    Omit<CompleteSnapshot, "requestId">
  >;
}

// Host integration, not an explorEDA API that exists today.
type ExecuteSnapshot = (
  intent: SnapshotIntent,
  signal: AbortSignal,
) => Promise<ReadReply>;
```

For a future logical row/aggregate request, use plan validation rather than dozens of engine flags:

```ts
type SemanticContext = "analysis-query" | "workspace-demand";
type PlanSupport =
  | { supported: true }
  | {
      supported: false;
      code: "UNSUPPORTED";
      feature: string; // e.g. "workspace-once-per-conflict".
      stepId?: string;
      fieldId?: string;
      reason: string;
    };

// The query track owns the detailed LogicalRead type.
// Validate semantic context, source/field resolution, scope, types,
// identity, cardinality, budgets, and requested evidence as one plan.
// compile(validatedPlan) produces dialect-private { text, values, decode }.
// encode(decodedResult) is a different layer.
```

This leaves “unsupported for this precise plan” expressible without claiming that an engine either supports or lacks all aggregation. A capability set expands only after a second adapter or a concrete consumer requires the addition.

### 6.3 Required behavior by result feature

| Feature | First behavior; requirement before expansion |
| --- | --- |
| Projection | Read every field advertised by the registered project source set, including keys and all local analysis/filter/calculation dependencies. If the host wants a narrower source, publish that narrower source definition. Never return omitted fields as null/undefined under an unchanged full schema. |
| Aggregates | Local initially. A later aggregate can be exact over its entire declared input population even though it does not contain raw rows. Group-result completeness and input coverage are separate facts. |
| Sorting | Stable source order uses a registered unique key or one materialized snapshot order. Later user sort must include direction, null placement, collation/comparator, and an identity tie-breaker. SQL's default order is not a contract. |
| Keyset pagination | Not a first browser API. A later cursor binds source/query/policy/schema/snapshot identity, ordered values and tie-breaker, expiry, and scope. Nullable ordering requires explicit branches; tuple `>` alone is unsafe with NULLs. |
| Raw-row limits | A complete read fetches at most the cap plus one sentinel row; overflow fails the whole source set. No successful first-snapshot response is truncated. A later page reports page coverage and continuation explicitly. |
| Totals | On a complete read, total equals the validated returned count. Later distinguish returned rows, matched rows before pagination, group count, source-input count, and valid measure contributors. Unknown totals stay unknown; they are not inferred from page length or planner estimates. |
| Sample/partial | First endpoint returns neither as success. A future envelope must distinguish a prefix/page from a statistical sample and describe its scope/method. No client exact filtering over an unproven population. |
| Explain/diagnostics | Return safe logical summary, accepted/rejected feature, source/field/step ID, timing/row/byte counters, and a server diagnostic ID. Keep credentials, SQL parameters, detailed plans, and database messages server-side unless separately authorized. Never treat EXPLAIN estimates as exact counts. |
| Cancellation | Reject obsolete work for publication; bound database execution independently; close/discard resources. Abort is not proof that the server stopped. Do not reuse an uncertain connection. |
| Consistency | Read related source tables in one bounded database read snapshot; publish only after all reads, normalization, and bounds succeed. A new refresh gets a new snapshot ID and new immutable arrays. |

For a future paged/aggregate result, the minimum additional coverage fields are: **input population/scope identity; fields covered; complete/page/sample kind; output grain; whether all groups are present; result completion; exact/unknown total; snapshot identity.** These are requirements to the query and transport tracks, not a claim that those tracks have agreed to specific property names.

### 6.4 Error handling and freshness

- Validation, authorization, schema drift, unsupported behavior, and precision/type loss are distinct outcomes. They must not masquerade as an empty dataset.
- A driver connection failure may be retryable; invalid fields and unsupported formulas are not. Do not automatically replay a long snapshot on every transient error. A bounded retry restarts the whole read under a new snapshot, never resumes an unverified partial result.
- Initial failure shows a load error without mounting an empty analysis as if it were a legitimate zero-row result. Refresh failure may preserve the previous completed snapshot only while clearly retaining its prior scope and freshness.
- A schema/policy revision change invalidates results and cursors. A request ID prevents stale publication, while a snapshot ID prevents mixing different data reads. Neither replaces the other.
- Raw source counts and schema availability can disclose restricted data, so they must be computed within the same authorized source definition and policy as the returned rows.

### 6.5 Snapshot lifetime and database stopping

For PostgreSQL, use one checked-out client for `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY`, source reads, and completion. Read Committed can expose different data to successive statements; Repeatable Read provides one read view for the transaction. Keep the transaction short: once a bounded result is materialized, end the transaction and let the browser use its own immutable snapshot. Do not leave a database transaction open while a user explores. [E05] [E09]

For SQLite, use one database handle and one read transaction, with normal isolation settings. File-backed reads must respect the selected journaling/locking mode; copying only an active database file is not a justified snapshot strategy. An actual SQLite backup or coordinated immutable export is a different host operation and is not performed here. [E18] [E31]

PostgreSQL stopping proposal: bound connection/setup time, set server-side statement/lock/idle-transaction limits, and before each read set statement timeout to the smaller of the configured statement cap and remaining request duration. Discard the checked-out client on abort with the driver's documented destroy-release path. Observe and handle the pending query's rejection. Treat connection teardown as best effort and statement timeout as the server work bound; neither is described as immediate acknowledged cancellation. The normal path returns the client only after successful commit/rollback and listener cleanup. [E03] [E04] [E10]

The documented `pg` query configuration does not establish a `signal` option, so an example must not invent `client.query({ signal })`. A stronger CancelRequest wrapper would need a pinned-driver/proxy smoke test and lifecycle control. `pg_cancel_backend` adds a control connection and finish/cancel races; it is unnecessary for the first snapshot proof. [E03] [E13]

For synchronous SQLite proof, a parent process enforces the deadline, terminates the disposable child with a bounded grace and hard-stop fallback, and waits for confirmed exit before calling cleanup complete. Sending a termination signal alone is not confirmed stopping. Pass a remaining duration to the child and establish its own monotonic deadline; do not transfer a process-local clock origin. Do not promise that posting a worker message interrupts native synchronous execution. This execution strategy is a host/runtime requirement and a possible reason to reject that driver on a candidate platform. It does not become a process API in the logical client contract. [E20]

## 7. Safe reads, joins, and per-customer hosting constraints

### 7.1 Safe read boundary

**Bind values; resolve identifiers and relationships from an authenticated server registry.** Parameters cannot stand for SQL identifiers. A source ID is a lookup key into approved configuration, not a table name interpolated into SQL. Quote the identifiers supplied by that registry using the chosen dialect, and never accept arbitrary SQL fragments, formula strings, DSNs, file paths, or database destinations from this client endpoint. This also keeps network destinations out of attacker-controlled query input. [E01]

The host source definition owns relation/schema names, approved columns and joins, required row restrictions, semantic types, identity policy, allowed operations, and limits. Saved project/query definitions may reference logical IDs; they must not carry credentials or be trusted to grant access. Apply authorization to source records, aggregates, counts, explanations, and contributor/drilldown reads consistently.

Use a database role limited to the approved reads and a read-only transaction as an additional bound. Do not describe read-only SQL as a sandbox for arbitrary functions or extensions. First registered PostgreSQL sources should be ordinary local tables or reviewed views over those tables, with no volatile/external side effects or foreign-table snapshot assumptions. Keep extension loading and arbitrary file access outside the SQLite/DuckDB reader's admitted operations. [E14] [E35]

Execution and result bounds are independent:

- A small `LIMIT` does not cap scans, joins, sorting, aggregates, or diagnostic work. Enforce statement/request time and concurrency limits.
- Row count does not bound row width. Use declared maximum cell sizes and bounded cursor/batch reads, or a server-side oversize guard that fails rather than publishes truncated cell values. A post-`pg.query` byte check occurs after that fully buffered result has already allocated memory. [E06]
- Bound logical decoded bytes and actual encoded response bytes separately. Neither is a precise JavaScript heap measurement; measure resident copies in the workload proof.
- Bound expanded output, provenance, and diagnostic volume independently of source row count. Eight source rows can create many matches; three aggregate groups can contain thousands of contributors.
- An oversized complete-source request fails atomically. Do not hide fields, cut strings, discard extra groups, or publish a successful prefix under the original schema and coverage.

For the proposed local fixture, choose deliberately small controls, for example **100,000 rows per source, 200,000 total source rows, 64 KiB per cell, 64 MiB of logical payload, 32 MiB encoded response, and a five-second read deadline**. These are reversible proof settings, not measured customer limits or a claimed safe browser heap size. Configure smaller limits for failure tests; agree on production budgets only after measuring row width, heap/copies, database work, and user response time. For editable local queries, expansion/cardinality and formula workload limits remain a separate client proof risk; the current worker does not establish a per-query cancellation budget. [R08] [R16]

Use useful safe error messages such as “Source orders exceeds the configured complete-snapshot row limit” or “amount requires an unsupported exact-decimal interpretation,” with stable codes and field/source IDs. Server logs can retain a diagnostic ID, stage, engine code, durations, and counts without routine logging of customer values, parameters, SQL text, or connection strings.

### 7.2 Joins and the first federation cut

| Source relationship | First decision |
| --- | --- |
| Two approved tables/views on one PostgreSQL database connection | Allowed as source reads in one snapshot; later SQL joins can be admitted with typed keys, observed cardinality, identity, and diagnostic parity. Different schemas do not create a federation requirement. |
| Different PostgreSQL databases, even on one cluster | **Defer federation.** A normal connection accesses one database; extensions/foreign data access or separate connections are a new execution and consistency boundary. [E33] |
| SQLite tables in one approved file/read handle | Allowed for the second snapshot proof. `ATTACH` across files is not automatically part of the contract just because the engine offers it. |
| PostgreSQL plus SQLite/DuckDB, or two independently remote databases | **Unsupported for a new coordinated source set.** No browser-side fetch-and-join, SQL forwarding service, or hidden movement into DuckDB. |
| Existing local imported arrays | Preserve the existing local mode and its current evaluator. That capability does not establish atomic freshness or access policy across new live database sources. |

A host-owned immutable export could later become a new explicit local source with its own provenance and refresh boundary. That is a serious simpler option when one customer needs a cross-database report; it is not real-time federation. The first reader rejects a registered source set that requires a global snapshot across independent databases.

### 7.3 Requirements for the fourth hosting track

The adapter track does **not** choose serverless, Cloudflare, VPS, or another platform. It gives hosting a testable execution profile for one customer instance. A dedicated application instance does not imply a dedicated upstream database, a static egress address, or access to the customer's private network.

| Constraint | What hosting must establish |
| --- | --- |
| Driver runtime | The chosen driver actually runs with the platform's supported modules and build/CPU architecture. PostgreSQL's pure-JavaScript driver need not imply libpq/native addons; the embedded SQLite and DuckDB examples impose different runtime requirements. [E20] [E21] [E34] |
| Private customer database | Approved route and private DNS resolution, database endpoint/port, TLS trust and hostname verification, authentication, and customer firewall policy. Possible mechanisms include a customer-network instance, private attachment/peering/VPN, managed tunnel, or customer-side connector. Hosting chooses and supports the mechanism. |
| Egress policy | If customers allowlist source addresses, demonstrate stable/approved egress or a supported private route. Per-customer deployment identity alone is insufficient. |
| Connection and transaction affinity | Keep one origin session for the bounded multi-statement read. Verify any proxy/HTTP gateway's transaction and cancellation behavior. Budget origin connections across every active process/replica/proxy for that customer database. |
| Process lifetime | A request must either finish, return a clear failure, or be discarded under a verified timeout/cleanup contract. Serverless suspension or termination must not leave claimed success, unbounded work, or reusable uncertain sessions. |
| Embedded files/processes | If selected, provide local file access, appropriate persistence or immutable export semantics, scratch space, native runtime support, and an execution-isolation strategy. A SQLite child belongs to the same operational customer instance; it need not be a separately hosted service. |
| Data freshness | Test intermediary result caches. A new local snapshot ID cannot make an old cached response a fresh database read. Source policy must state whether data freshness is current-read or explicitly cached. |
| Automated operation | Provision and rotate secrets; validate route/TLS/read permissions/schema/key policy; configure bounded pools and resources; expose readiness and classified failures; clean up connections/processes; perform repeatable upgrades and rollbacks of the one deployed version. |

**Concrete Cloudflare constraints, without a platform recommendation:** current Workers documentation lists `node:sqlite`, `node:child_process`, and `node:worker_threads` as nonfunctional stubs. Direct Workers TCP disallows private addresses and request-global socket reuse. Those facts rule out treating the specific embedded Node proof as automatically portable under `nodejs_compat`. They do not establish that Cloudflare cannot access private databases: Hyperdrive documents Tunnel and Workers VPC paths; Tunnel requires `cloudflared` in the reachable private network. [E24] [E25] [E26] [E27]

Hyperdrive documents transaction pooling and query caching. Test the chosen path's session behavior and use an explicitly cache-disabled path for the initial freshness/parity proof. A tunnel/connector adds installation, updates, credentials, health monitoring, and outage ownership in the customer network; highly automated onboarding must include those obligations if hosting selects that path. [E28] [E32]

**Operational falsifier:** if serving a supported customer repeatedly needs manual tunnels, driver patching, per-instance SQL special cases, or unbounded origin connections, the hosting/adapter combination has not met the minimal-maintenance goal. Retain a clear “unsupported customer connectivity profile” outcome until a repeatable path exists. This is a readiness criterion, not permission to connect to any customer system in this assignment.


## 8. Two illustrative SQL translations with bound parameters

**Both examples are proposals for the next SQL parity proof, not implemented compiler output, executed SQL, or a claim that server pushdown is already available.** They answer which operations can be translated within explicit constraints. The first operational milestone remains complete source reads; before advertising any database-side analysis operation, compare at least one of these translations against the existing local oracle and then the second adapter's corresponding admitted behavior.

The examples use the **analysis-query** context. Registered `reporting.orders`, `reporting.customers`, and `reporting.items` are on one PostgreSQL database, have unique nonnull integer physical `id` keys, and use homogeneous nullable text/integer fields. Source arrays are ordered by physical ID in the local reference. Relation names, field names, CTEs, collations, and semantic constants are server-owned; request values and result limits are bound. The C collation is used for exact equality of this text domain, not as a claim of general JavaScript string-order parity. [R07] [E01] [E12]

Amounts are integer cents bounded by absolute value 1,000,000; no more than 100,000 contributing order entities are admitted. The bound on the sum of absolute values is `100,000 × 1,000,000 = 100,000,000,000`, below `2^53 − 1`. Every intermediate integer addition is therefore exact under the proposed domain, including cancellation between positive/negative amounts. These are fixture/admission assumptions, not measured performance or general decimal guarantees. Decode integer sums/counts with range checks and compute average with the same final JavaScript division as the reference.

### 8.1 Shared deterministic fixture

The following values fully define the small fixture. SQL NULL becomes JavaScript `null` in source arrays. The fixture loader is future proof setup; no database was created here.

| Order ID | Status / customer lookup key | Region / amount cents |
| --- | --- | --- |
| 1 | paid / A | North / 1000 |
| 2 | NULL / B | North / 1000 |
| 3 | paid / C | North / NULL |
| 4 | cancelled / A | South / 2500 |
| 5 | paid / NULL | South / NULL |
| 6 | paid / D | South / 3000 |
| 7 | cancelled / A | East / NULL |
| 8 | paid / Z | West / 4000 |

| Customer ID | Lookup key | Name |
| --- | --- | --- |
| 10 | A | Ada |
| 11 | B | Ben |
| 12 | C | Cat 1 |
| 13 | C | Cat 2 |
| 14 | D | NULL |
| 15 | NULL | Ignored |

| Item IDs | `order_id` |
| --- | --- |
| 11, 12 | 1 |
| 21 | 2 |
| 31, 32, 33 | 3 |
| 41 | 4 |
| 51, 52 | 5 |
| 71 | 7 |
| 91 | 999, an orphan key |
| 92 | NULL |

This is 8 orders, 6 customers, and 12 items. The customer relationship key deliberately violates a declared many-to-one relationship while physical customer identity remains unique. That is valid failure evidence: a project declaration is not a database uniqueness constraint.

### 8.2 Translation A: source → `neq` filter → guarded lookup

Intent: source `orders`; filter `orders.status neq $excludedStatus`; lookup `orders.customer_key → customers.lookup_key` as `customer`. The bound parameter must be a defined nonnull string. Send this statement separately with the binding array **`["cancelled", 100]`**: `$1` is excluded status and `$2` is the server-clamped maximum output rows.

```sql
WITH
orders_source AS MATERIALIZED (
  SELECT o.id AS order_id,
         o.status,
         o.customer_key,
         o.region,
         o.amount_cents,
         row_number() OVER (ORDER BY o.id) - 1 AS order_ordinal
  FROM reporting.orders AS o
),
orders_filtered AS MATERIALIZED (
  SELECT *
  FROM orders_source
  WHERE status IS NULL
     OR (status COLLATE "C") <> ($1::text COLLATE "C")
),
customers_source AS MATERIALIZED (
  SELECT c.id AS customer_id,
         c.lookup_key,
         c.name,
         row_number() OVER (ORDER BY c.id) - 1 AS customer_ordinal
  FROM reporting.customers AS c
),
customer_matches AS MATERIALIZED (
  SELECT lookup_key COLLATE "C" AS lookup_key,
         count(*) AS match_count,
         array_agg(customer_id ORDER BY customer_id) AS match_ids
  FROM customers_source
  WHERE lookup_key IS NOT NULL
  GROUP BY lookup_key COLLATE "C"
),
looked_up AS MATERIALIZED (
  SELECT o.*,
         coalesce(m.match_count, 0::bigint) AS match_count,
         coalesce(m.match_ids, ARRAY[]::integer[]) AS contributor_customer_ids,
         chosen.customer_id AS projected_customer_id,
         chosen.lookup_key AS projected_customer_lookup_key,
         chosen.name AS projected_customer_name
  FROM orders_filtered AS o
  LEFT JOIN customer_matches AS m
    ON (m.lookup_key COLLATE "C") = (o.customer_key COLLATE "C")
  LEFT JOIN customers_source AS chosen
    ON m.match_count = 1
   AND chosen.customer_id = m.match_ids[1]
),
metadata AS (
  SELECT (SELECT count(*) FROM orders_source) AS source_count,
         count(*) AS filtered_count,
         count(*) FILTER (WHERE match_count = 0) AS missing_lookup_count,
         count(*) FILTER (WHERE match_count > 1) AS ambiguous_lookup_count,
         ARRAY(
           SELECT c.customer_ordinal
           FROM customers_source AS c
           WHERE c.lookup_key IS NULL
           ORDER BY c.customer_ordinal
         ) AS missing_customer_key_ordinals
  FROM looked_up
),
output_rows AS (
  SELECT *
  FROM looked_up
  ORDER BY order_ordinal
  LIMIT ($2::integer + 1)
)
SELECT m.*, r.*
FROM metadata AS m
LEFT JOIN output_rows AS r ON true
ORDER BY r.order_ordinal;
```

The pre-grouped target index preserves one row per filtered order. Projection activates only after `match_count = 1`, so selecting `match_ids[1]` never chooses among ambiguous matches. SQL NULL join keys do not match. Missing target relationship keys are recorded over the whole authorized target source, as the local index build does. Filter placement is deliberate: this query filters before lookup, preserving which steps can emit diagnostics. Moving a predicate across lookup/expand merely to reduce work can change diagnostics or grain. [R07]

| Check | Expected result from the fixture, derived from source semantics |
| --- | --- |
| Stage counts | Source 8 → filter 6 → lookup 6; filter excludes 2. |
| Ordinary matches | Order 1 → customer 10; order 2 → customer 11. Order 2 survives despite its NULL status. |
| Ambiguity | Order 3 has two matches; all `customer.*` fields become undefined; customers 12 and 13 remain contributors, with neither selected into `sourceRows`. |
| Missing lookup | Orders 5 and 8 have no match and undefined projected fields. |
| Genuine matched NULL | Order 6 selects customer 14; its name stays null, not undefined. |
| Target key diagnostic | Customer 15 is ordinal 5 and produces one `missing-key`; missing lookups = 2 and ambiguous lookups = 1. |

The decoder must check counts/IDs, rebuild fields and source references, and use the match count to distinguish matched source NULL from unavailable projection. The metadata-only empty result row is not a source row. If `filtered_count` exceeds the cap, reject exact hydration; the sentinel prefix is not a complete dataset. Bound contributor arrays and diagnostics as well as rows.

`MATERIALIZED` constrains folding, but it does not by itself force every unused row or diagnostic CTE to execute. Here full-count/diagnostic consumers make the required populations explicit. None of this returns the rejected source rows required for a complete source-stage `rows` array. Obtain full stage/source materialization under the same snapshot when the legacy evaluation is required, or keep this result in a new narrower contract with honest inspection availability. Never cast the final result directly to `AnalysisEvaluation`. [R03] [E36]

### 8.3 Translation B: source → expansion → per-order regional measures

Intent: source `orders`; expand `orders.id → items.order_id` as `item`, with `keepUnmatched=false`; group by `orders.region`. Request expanded-row count, physical-order count, nonnull amount-entity count, per-order amount sum, and per-order average. Use `entityFieldId="orders.id"` for the once-per-order measures. Send this statement separately with **`[100]`**: `$1` is the server-clamped maximum group count.

```sql
WITH
orders_source AS MATERIALIZED (
  SELECT o.id AS order_id,
         o.region COLLATE "C" AS region,
         o.amount_cents,
         row_number() OVER (ORDER BY o.id) - 1 AS order_ordinal
  FROM reporting.orders AS o
),
items_source AS MATERIALIZED (
  SELECT i.id AS item_id,
         i.order_id AS item_order_id,
         row_number() OVER (ORDER BY i.id) - 1 AS item_ordinal
  FROM reporting.items AS i
),
expanded AS MATERIALIZED (
  SELECT o.*, i.item_id
  FROM orders_source AS o
  JOIN items_source AS i ON i.item_order_id = o.order_id
),
per_order AS MATERIALIZED (
  SELECT region, order_id, amount_cents, order_ordinal,
         count(*) AS expanded_rows_for_order,
         min(item_id) AS first_item_id
  FROM expanded
  GROUP BY region, order_id, amount_cents, order_ordinal
),
region_groups AS MATERIALIZED (
  SELECT region,
         sum(expanded_rows_for_order)::bigint AS expanded_rows,
         count(*) AS order_entities,
         count(amount_cents) AS amount_entities,
         sum(amount_cents) AS amount_sum_cents,
         min(order_ordinal) AS first_order_ordinal,
         array_agg(order_id ORDER BY order_ordinal) AS representative_order_ids,
         array_agg(first_item_id ORDER BY order_ordinal) AS representative_item_ids,
         array_agg(amount_cents ORDER BY order_ordinal) AS representative_inputs,
         array_agg(amount_cents IS NOT NULL ORDER BY order_ordinal)
           AS representative_included
  FROM per_order
  GROUP BY region
),
lineage AS MATERIALIZED (
  SELECT region,
         array_agg(order_id ORDER BY order_ordinal, item_id) AS lineage_order_ids,
         array_agg(item_id ORDER BY order_ordinal, item_id) AS lineage_item_ids
  FROM expanded
  GROUP BY region
),
metadata AS (
  SELECT (SELECT count(*) FROM orders_source) AS source_count,
         (SELECT count(*) FROM expanded) AS expanded_count,
         (SELECT count(*) FROM region_groups) AS group_count,
         ARRAY(
           SELECT o.order_id
           FROM orders_source AS o
           WHERE NOT EXISTS (
             SELECT 1 FROM items_source AS i
             WHERE i.item_order_id = o.order_id
           )
           ORDER BY o.order_ordinal
         ) AS unmatched_order_ids,
         ARRAY(
           SELECT i.item_ordinal
           FROM items_source AS i
           WHERE i.item_order_id IS NULL
           ORDER BY i.item_ordinal
         ) AS missing_item_key_ordinals
),
output_groups AS (
  SELECT true AS group_present, g.*
  FROM region_groups AS g
  ORDER BY first_order_ordinal
  LIMIT ($1::integer + 1)
)
SELECT m.*, g.*,
       l.lineage_order_ids, l.lineage_item_ids
FROM metadata AS m
LEFT JOIN output_groups AS g ON true
LEFT JOIN lineage AS l
  ON g.group_present
 AND l.region IS NOT DISTINCT FROM g.region
ORDER BY g.first_order_ordinal;
```

The `per_order` relation forms one candidate for each physical order after expansion. Region/amount are invariant for that key in this restricted plan. It therefore avoids both repeated-parent sums and the erroneous `SUM(DISTINCT amount_cents)`, which would collapse two different orders with equal amounts. The representative item is the first under the declared source order; all actual item references are retained separately for lineage. [R07]

| Region | Expanded rows / order entities / eligible amounts | Sum / average cents |
| --- | --- | --- |
| North | 6 / 3 / 2 | 2000 / 1000 |
| South | 3 / 2 / 1 | 2500 / 2500 |
| East | 1 / 1 / 0 | undefined / undefined |

West has no group because its only order has no items. Overall, there are 10 expanded rows, 6 represented orders, 3 eligible amount entities, and 4500 eligible cents. A raw expanded SUM gives the wrong 5500; North's SUM(DISTINCT amount) gives the wrong 1000. These are hand-derived fixture expectations, not measured database results.

Decoder rules:

- PostgreSQL integer SUM/COUNT may arrive through exact driver representations rather than Number. Check and normalize them. SQL AVG(integer) has a different result type; this example deliberately finalizes `sum / eligibleCount` in JavaScript. [E08]
- If eligible count is zero, require SQL sum NULL and emit undefined for sum and average. With positive eligible count, absent sum is a type/protocol failure. Do not turn an empty measure into zero.
- Reconstruct each numeric measure's representative contributor, raw input, and missing-value reason. Reconstruct all `sourceRows`/contributors from paired lineage arrays, not only representative item IDs. Count measures do not acquire invented numeric contributor entries.
- A valid NULL group is distinct from the metadata-only empty sentinel; `group_present` supplies that distinction. Group keys still use the typed logical representation. The original relationship join remains ordinary equality, not null-safe matching.
- Source/expanded/group counts are 8/10/3. Unmatched input order IDs are `[6, 8]`; missing item-key ordinal is `[11]`. The orphan item with present key 999 does not by itself emit a missing-key diagnostic.
- The current aggregate stage excluded count is **6**: three missing representative amounts appear in each of two numeric contributor lists. Expansion's excluded count remains **0**, despite its two unmatched-input diagnostics. Those are observed baseline meanings, not proposed replacements. [R07]

Reject reuse of this translation after a step that can make a measure differ within an order, under ambiguous repeated/self-source lineage, mixed or nonfinite measures, invalid identities, or workspace once-per semantics. The general raw-value conflict rule has not been replaced with `MIN`, `MAX`, or silent coercion. Reject if any source, output, contributor, time, or byte budget fails.

This SQL shape is deliberately conservative and evidence-rich, not an optimized production query. A later demand can fetch detail separately only with exact scope/snapshot identity and honest availability. SQLite's corresponding proof need not copy PostgreSQL arrays or syntax: it can return normalized scalar rows and run a small shared finalizer. If matching the admitted logical result forces PostgreSQL result types into the client or materially different semantics, the second adapter falsifies the abstraction.

An empty-input variant is mandatory: when expansion is empty, this **grouped** analysis has zero groups, so a metadata-only SQL row is not an analysis row. A separate **ungrouped** analysis aggregate over empty input produces one summary with count `0` and sum/average `undefined`. The East group above tests a different case: a present group with no eligible numeric values. [R07]

## 9. One complete integration example

**Proposed worked integration, not implemented application code or a runnable example in the packet.** This section specifies the whole path from a browser request through an authorized database read to the existing component. Framework-specific authentication, reader implementation, and bounded wire validation are explicit host ports. They are not alleged explorEDA exports. The protocol uses JSON for this small scalar fixture so its meaning is reviewable; the transport track still owns a production encoding choice.

### 9.1 Source registration and server execution

Use a clean five-row fixture for this visible example, distinct from the adversarial 26-row fixture in section 8. The authenticated proof viewer can read the server's `sales-proof` source set. Server configuration maps it to `reporting.orders` and `reporting.customers`, a fixed field list, unique integer IDs, nullable text fields, and safe integer cents. Source text is bounded to 32 UTF-8 bytes in this fixture. The host owns the connection configuration and read-only fixture role.

The browser sends only:

```json
{
  "requestId": "proof-read-1",
  "sourceSetId": "sales-proof",
  "expectedSchemaRevision": "sales-v1"
}
```

The endpoint authenticates and authorizes `sales-proof`, rejects unknown properties/IDs and an unexpected schema revision, allocates a request deadline, and calls `SnapshotReader.read` with its internal registered sources. For this fixture the clamped per-source cap is 100. PostgreSQL execution uses one leased client and the transaction/timeout/cleanup rules in section 6.5. These source statements each receive **`[101]`** as their binding array:

```sql
SELECT id, status, customer_key, region, amount_cents
FROM reporting.orders
ORDER BY id
LIMIT $1::integer;
```

```sql
SELECT id, lookup_key, name
FROM reporting.customers
ORDER BY id
LIMIT $1::integer;
```

These are fixed registered SQL statements, not SQL supplied by the browser. The reader uses explicit raw driver parsing plus schema-aware normalization, rejects the 101st row, checks cells/bytes and unique keys, and finishes the read transaction. Only a fully validated bundle is encoded and published. The production proof must implement bounded batches/oversize guards; these five known rows do not demonstrate that resource mechanism.

### 9.2 Complete successful response

The following is the entire logical response for the example. All advertised fields and rows are present. There is no connection string, SQL, native driver value, or server relation key in it.

```json
{
  "ok": true,
  "value": {
    "requestId": "proof-read-1",
    "sourceSetId": "sales-proof",
    "schemaRevision": "sales-v1",
    "policyRevision": "proof-policy-v1",
    "snapshotId": "sales-proof:snapshot-1",
    "consistency": "single-read-snapshot",
    "coverage": {
      "kind": "complete",
      "fields": {
        "orders": ["id", "status", "customer_key", "region", "amount_cents"],
        "customers": ["id", "lookup_key", "name"]
      }
    },
    "sources": [
      {
        "sourceId": "orders",
        "entityKey": "id",
        "identity": "stable-key",
        "fields": [
          {"id": "id", "logicalType": "number", "databaseType": "integer", "nullable": false},
          {"id": "status", "logicalType": "string", "databaseType": "text", "nullable": true},
          {"id": "customer_key", "logicalType": "string", "databaseType": "text", "nullable": true},
          {"id": "region", "logicalType": "string", "databaseType": "text", "nullable": false},
          {"id": "amount_cents", "logicalType": "number", "databaseType": "integer", "nullable": true}
        ]
      },
      {
        "sourceId": "customers",
        "entityKey": "id",
        "identity": "stable-key",
        "fields": [
          {"id": "id", "logicalType": "number", "databaseType": "integer", "nullable": false},
          {"id": "lookup_key", "logicalType": "string", "databaseType": "text", "nullable": true},
          {"id": "name", "logicalType": "string", "databaseType": "text", "nullable": true}
        ]
      }
    ],
    "tables": {
      "orders": [
        {"id": 1, "status": "paid", "customer_key": "A", "region": "North", "amount_cents": 1000},
        {"id": 2, "status": null, "customer_key": "B", "region": "South", "amount_cents": 2000},
        {"id": 3, "status": "cancelled", "customer_key": "A", "region": "North", "amount_cents": 500}
      ],
      "customers": [
        {"id": 10, "lookup_key": "A", "name": "Ada"},
        {"id": 11, "lookup_key": "B", "name": "Ben"}
      ]
    },
    "counts": {
      "orders": {"returned": 3, "total": 3},
      "customers": {"returned": 2, "total": 2}
    }
  }
}
```

The host decoder validates this as unknown input before exposing `ReadReply`: request/source/schema identity; the exact allowed source and field sets; every required cell's presence and logical type; nullability; finite/range/precision policy; unique normalized entity keys; returned/total equality; a complete-coverage declaration; and both response and decoded-size budgets. Missing `customers`, an omitted field, inconsistent counts, or a partial-coverage declaration is a protocol failure for this endpoint. A TypeScript assertion alone is not validation. The example's ID is illustrative; live requests need distinct IDs.

**Completeness is also a trusted-reader guarantee, not something the browser can prove from a flag.** A buggy reader could send two of three orders, set both counts to two, and falsely declare completeness; that internally consistent prefix can pass client shape checks. The reader must establish exhaustion of its authorized source query within the same snapshot, and the fixture/oracle tests must catch false claims against known data. Client validation detects malformed or inconsistent envelopes; it cannot independently count unseen database rows.

### 9.3 Host loader and the existing React seam

The host's `ExecuteSnapshot` implementation POSTs the intent to its own endpoint, attaches the `AbortSignal` to `fetch`, and returns the decoder's validated `ReadReply`. It treats HTTP errors, interrupted bodies, wrong content, and oversized bodies as failures. The stable loader function is supplied to this proposed React integration:

```tsx
import { useEffect, useState } from "react";
import { ExplorEdaProject } from "exploreda";
import "exploreda/dist/ExplorEda.css";
import {
  createAnalysisWorker,
  type AnalysisProject,
  type AnalysisView,
} from "exploreda/analysis";

// CompleteSnapshot and ExecuteSnapshot are the proposed host types in §6.
// The host provides a stable `read` function with real runtime validation.
function projectFor(snapshot: CompleteSnapshot): AnalysisProject {
  return {
    id: "sales-proof-project",
    version: 1,
    sources: snapshot.sources.map((source) => ({
      id: source.sourceId,
      name: source.sourceId,
      glyph: "table",
      entityKey: source.entityKey,
      fields: source.fields.map((field) => ({
        id: field.id,
        name: field.id,
        type: field.logicalType,
      })),
    })),
    relationships: [{
      id: "orders-customer",
      name: "Customer",
      from: { sourceId: "orders", fieldId: "customer_key" },
      to: { sourceId: "customers", fieldId: "lookup_key" },
      cardinality: "many-to-one",
    }],
    parameters: [{
      id: "excludedStatus", name: "Exclude status", type: "string", required: true,
    }],
    queries: [{
      id: "orders-with-customer", name: "Eligible orders", glyph: "table",
      frameLabel: "one order",
      steps: [
        { id: "orders-source", kind: "source", sourceId: "orders" },
        {
          id: "eligible", kind: "filter", inputStepId: "orders-source",
          fieldId: "orders.status", operator: "neq", parameterId: "excludedStatus",
        },
        {
          id: "customer", kind: "lookup", inputStepId: "eligible",
          relationshipId: "orders-customer", as: "customer",
        },
      ],
      outputStepId: "customer",
    }],
  };
}

type Session = {
  snapshot: CompleteSnapshot;
  project: AnalysisProject;
  view: AnalysisView;
};

export function DatabaseProof({ read }: { read: ExecuteSnapshot }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setSession(null);
    setError(null);
    const intent = {
      requestId: crypto.randomUUID(),
      sourceSetId: "sales-proof",
      expectedSchemaRevision: "sales-v1",
    };
    void read(intent, controller.signal).then((reply) => {
      if (!current || controller.signal.aborted) return;
      if (!reply.ok) {
        setError(reply.error.message);
        return;
      }
      setSession({
        snapshot: reply.value,
        project: projectFor(reply.value),
        view: {
          id: "orders-view", name: "Eligible orders",
          queryId: "orders-with-customer",
          bindings: { excludedStatus: "cancelled" },
        },
      });
    }).catch(() => {
      if (current && !controller.signal.aborted) setError("Snapshot read failed.");
    });
    return () => {
      current = false;
      controller.abort();
    };
  }, [read]);

  if (error) return <p role="alert">{error}</p>;
  if (!session) return <p role="status">Loading source data…</p>;
  return (
    <ExplorEdaProject
      project={session.project}
      tables={session.snapshot.tables}
      view={session.view}
      createWorker={createAnalysisWorker}
      onProjectChange={(change) => setSession((previous) =>
        previous ? { ...previous, ...change } : previous)}
      onStateChange={(settings) => setSession((previous) => previous ? {
        ...previous, view: { ...previous.view, settings },
      } : previous)}
      onOpenView={(view, _name, project) => setSession((previous) => previous ? {
        ...previous, project: project ?? previous.project, view,
      } : previous)}
    />
  );
}
```

`PublicSource` is deliberately mapped into the existing `SourceDefinition` shape: `sourceId → id`, display names/glyphs, and `logicalType → type`. It cannot simply be assigned to `project.sources`. The actual `tables`, view/change callbacks, and optional `createWorker` seam are evidenced by the component and package documentation; the analysis entry point exports the types and worker factory. Worker bundling still requires a real checkout/runtime proof. [R02] [R03] [R06] [R22]

### 9.4 Expected visible behavior and failure behavior

| Event | Hand-derived expectation |
| --- | --- |
| First completed read | Mount one project with 3 orders and 2 customers. Local stages have 3 → 2 → 2 rows. `neq "cancelled"` retains the null status. |
| Query output | Keys `orders:number:1` and `orders:number:2`; customer names Ada and Ben; source references include each order and its uniquely matched customer. Source/output/available counts are 3/2/2; the lookup's final excluded count is 0. |
| Chart interaction or changed query binding | Uses the same complete local snapshot and current workspace scope logic. No database query is required for each brush/filter. Build the bar/scatter views through existing controls or verified saved settings in the runnable proof. |
| Source/step inspection | All approved source rows and evaluator stages remain available; a final-row-only substitute would fail this requirement. |
| HTTP abort or obsolete completion | The host suppresses publication; server cleanup follows the driver contract. The existing worker's own stale-reply logic is a separate layer. |
| Any source/type/limit failure | Show a load error; do not mount a fabricated empty dataset or accept one table from a failed bundle. |
| Later refresh | Produce fresh immutable arrays and a new snapshot ID atomically. Reconcile schema/settings and saved selections before publication; clear selections for changed snapshot-only identity. The minimal example above demonstrates initial load, not a completed refresh implementation. |

This integration preserves the existing local imported/demo path as a second host data choice using the same component and evaluator. It adds no generic remote evaluator, runtime database fallback, or second deployed version.

## 10. First proof, failure injection, and rejection criteria

### 10.1 Four bounded proof stages

**All stages below are proposed work for the later runnable integration checkout. None was executed in this research assignment.** The source packet permits source review, not a package build or a database-driver pass. The original branch and destination belong to Codex's integration work; no branch or repository state was changed here.

| Stage | Small artifact and gate |
| --- | --- |
| **P1 — deterministic protocol and client proof** | A fake `ExecuteSnapshot` returns the complete five-row example, then the 26-row adversarial source fixture. Route decoded arrays into the actual component/evaluator and inspect one bar, one scatter, source/step detail, linked filters, and saved settings. Inject incomplete/wrong/stale envelopes. Pass only if invalid data never mounts as an exact result and local behavior matches direct arrays. |
| **P2 — PostgreSQL driver proof** | A disposable loopback container, fixture setup owner, restricted read role, and a pinned `pg`/Node environment. Implement fixed source reads first; run parameter/type/timeout/abort/snapshot probes. The same logical bundle and visible proof must pass. Container provisioning proves neither production credentials nor a private customer route. |
| **P3 — SQLite adversarial adapter proof** | The same supported logical fixture in a disposable local file, plus separate dynamic-typing/large-ID/lock/CPU cases. Decode through the same source contract; contain synchronous work outside the request process. Pass only if the HTTP host remains responsive, stop/cleanup completes within the proposed bound, and invalid data fails explicitly. Only then decide whether shared adapter extraction reduces code. |
| **P4 — one admitted SQL operation** | Execute a narrow plan such as section 8A or 8B against the local JavaScript oracle, then the second engine's corresponding implementation. Compare normalized semantic outputs, not SQL syntax or native driver arrays. Do not advertise a compiler feature before its own parity gate passes. Full remote `AnalysisEvaluation` remains unavailable unless stages and inspection are actually supplied. |

P1–P3 are the first visible database integration. P4 tests the claim that the next server reduction can preserve meaning; it is not required to pretend that P1–P3 already performed SQL analysis. Avoid expanding the plan to every engine, a generic service, or production onboarding before these bounded results exist.

### 10.2 Shared behavioral contract and intentional failures

The oracle is the **specific baseline evaluator/workspace behavior**, with declared fixture source ordering and identical field settings. Compare fields/types, row grain/keys, raw and displayed values, source references, numeric contributors, diagnostics, stage counts, and filter populations. Exclude only explicitly engine-specific metadata, such as native database type labels and timing, from logical equality. Snapshot IDs and process-local evaluation revisions are checked for freshness behavior, not hard-coded equality across processes. [R03] [R06] [R07] [R08] [R13]

| Test family | Required assertion or injected failure |
| --- | --- |
| Complete/partial protocol | Remove a source/field, make counts inconsistent, interrupt the body, or exceed an agreed cap: detectable envelope failures must prevent client publication. Separately make a reader return a self-consistent prefix with falsely reduced totals; the reader/oracle contract test must fail against known fixture data and query-exhaustion rules. The browser cannot discover unseen rows from a complete flag. Test a legitimate zero-row source separately. |
| Request ordering and scope | Slow read A, finish read B, then finish A. Only B may publish. Repeat under a different source set/schema/policy; old data never receives new labels or parameters. |
| Scalar fidelity | NULL/empty/whitespace, strings `"7"` and `"bad"`, integer 7, booleans, invalid Boolean 2, large int64, high-precision decimal, nonfinite values, Unicode, canonical dates, and submillisecond timestamps. Preserve admitted types; reject unsupported precision/type cases with field-specific errors. SQLite mixed affinity is an explicit rejection case under a homogeneous schema, not coerced evidence of cross-engine parity. |
| Keys and multiplicity | Single and composite keys, delimiter-bearing components, duplicate/missing keys, duplicate identical rows without keys, and changed source order. Preserve occurrences; a new keyless snapshot must not silently retarget selections. |
| Lookup/expand | Zero/one/multiple targets, null/unlike-type keys, unmatched retained/dropped, and violated declared cardinality. Use section 8's exact grain, output values, lineage and missing/ambiguous diagnostics. |
| Filters and dates | Analysis `eq null`, `neq null`, `neq undefined`, numeric versus text operands, lexical date comparison; workspace missing-category, numeric-string, text, UTC date-bound and own-filter-exclusion behavior. Unsupported SQL plans return `UNSUPPORTED`; local snapshot analysis retains its oracle behavior. |
| Aggregate semantics | Two entities with the same amount; repeated entity rows; raw conflicts such as 7/`"7"`; null measures and entity IDs; all-invalid groups; grouped and ungrouped empty input; shared entities across pooled groups; positive/negative zero where relevant. Prove analysis and workspace contexts separately. |
| Calculations | In a runnable checkout, use current calculation tests through the local evaluator. Reject any attempted server formula feature until its parser/type/failure behavior is independently admitted. No claim is made from the missing parser implementation. |
| Authorization/schema | Unknown source/field, forbidden principal, schema revision change, inaccessible relation, and unsupported required column type. Return safe distinct failures; source counts and diagnostic detail must not bypass the same authorization. |
| Driver lifecycle | Abort during pool acquisition, query, decoding, and just after completion; connection loss; SQLite lock contention and child death. Observe rejection and cleanup, avoid resource reuse after uncertain stop, and prove a fresh read works. |
| Snapshot consistency | Use a separate fixture writer to commit between two source reads. One bundle sees a consistent before/after world; a new read sees the commit. On SQLite choose a journaling mode that permits the intended reader/writer experiment. A writer blocked by a read transaction is a lock test, not evidence of a successful interleaved commit. |
| Limits and work amplification | One oversized cell, many columns, expansion explosion, numerous contributors, and a slow aggregate despite a tiny output. Enforce independently configured source/output/cell/byte/time/diagnostic bounds; row limits alone do not pass. |
| Usable existing mode | Load existing local data, apply linked and local filters, inspect contributors, save/restore settings, then load a completed database snapshot through the same component. No version coexistence or partial-result fallback engine is introduced. |

A protocol fake cannot prove driver binding, pool cleanup, server stopping, native type behavior, private routing, or proxy freshness. Conversely, a successful `SELECT 1` cannot prove field meanings, linked-filter scope, contributors, or honest coverage.

### 10.3 Measurement and decision gate

Measure **10,000 and 100,000 source rows at multiple widths**, keeping the analytical workload and schema recorded. Suggested reproducible widths are 8 and 40 scalar fields, with a separately specified text-length distribution; a row count without width is not a workload. Include one deliberately oversized-cell case and one expansion-heavy case. Use a named machine/browser/build, database and driver versions, cold/warm connection/cache state, chosen worker mode, and repeated runs with count/median/tail observations. These are proposed experiments, not benchmarks already obtained. Follow the repository performance guidance when a full checkout is available. [R16]

Record connection acquisition, database read, normalization, encoding, transfer, decode/materialization, evaluator, first chart, filter interaction, and peak client/server memory as distinct stages. Track bytes on the wire separately from decoded cells, row-object copies, worker copies, stages, and provenance. Aggregate output can be tiny while input work or lineage is large.

Provisional local proof targets can be **under five seconds to the first usable bounded view and under 100 ms for warm local filter feedback**, on a recorded reference machine. A **two-second stop/cleanup observation bound** is a separate lifecycle target for short fault probes. These are explicitly unmeasured decision settings, not product SLAs, promises, or accepted requirements. Replace them with agreed targets if the integration owner has better context. The five-second read deadline in section 7 is an independent safety limit; satisfying it does not imply meeting a five-second end-to-end first-view target.

**Reject or narrow the design if** any semantic/coverage invariant fails, resource cleanup cannot be bounded, the second driver leaks its runtime shape into the client, or the named supported workload exceeds the agreed budget. If only full transfer/memory fails, test one narrow projected-row/aggregate demand against the same workload. If even a hand-written fixed endpoint is sufficient, keep it rather than manufacturing an adapter framework. Do not keep broadening optional tests after the claimed boundary and concrete remaining risks have been resolved.

### 10.4 Small real-driver smoke run sheet — proposed, not run

Run later in an isolated fixture checkout with a reviewed frozen dependency lock. Pin exact Node, `pg`, transitive `pg-types`, PostgreSQL image digest, and SQLite engine version. If cursors are used, pin that package too. The read-only fixture role and source registry must already exist. Timing values below are test settings. Setup writes are confined to disposable fixture construction, not the reader or a customer database.

The future smoke harness owns its checked-out clients, cleanup, independent backend observer, child process and assertions. The following probes are **not an executable harness or an adapter implementation**. Returning raw PostgreSQL text is a probe strategy; normal application decoding still needs the explicit schema/type checks above. [E01] [E02] [E03] [E04] [E10] [E20]

```ts
const rawPgTypes = { getTypeParser: () => (value: string) => value };
const payload = "O'Reilly; DROP TABLE fixture; -- 雪🦆 %_";
const i64 = "9223372036854775807";
const day = "2024-02-29";
const instant = "2024-03-10T07:30:00.123456Z";

// A. Fixed PostgreSQL query; all test input is bound.
await pgClient.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
await pgClient.query("SET LOCAL DateStyle TO 'ISO, YMD'");
const pgValues = await pgClient.query({
  text: `SELECT $1::text AS payload, $2::bigint AS i64,
    $3::text AS absent, $4::boolean AS flag, $5::date::text AS day,
    to_char($6::timestamptz AT TIME ZONE 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS instant`,
  values: [payload, i64, null, true, day, instant],
  types: rawPgTypes,
});
// Assert exact payload/i64/day/instant strings, null, and raw flag === "t".
// Repeat false -> "f"; normalize only those native Boolean values to true/false.
// Inspect native int8/bool field metadata; these are not SQL-cast text columns.
// BigInt(i64) is exact. Numeric Number coercion is rejected.
// Submillisecond text survives this driver probe but is rejected for the
// first date-analysis snapshot unless the source explicitly transforms it.
await pgClient.query("COMMIT");

// B. Server timeout; the harness catches the expected query rejection.
await pgClient.query("BEGIN READ ONLY");
await pgClient.query("SELECT set_config('statement_timeout', $1, true)", ["150ms"]);
await pgClient.query("SELECT pg_sleep(2)");
// EXPECT SQLSTATE 57014, then ROLLBACK and SELECT 1 in the error cleanup path.
// Release clean only after both succeed; destroy the lease if cleanup fails.

// C. Abort: a separate lease has a 500ms server statement timeout.
await abortLease.query("SELECT pg_backend_pid()::text AS pid");
const running = abortLease.query("SELECT pg_sleep(2)");
// Observe rejection immediately. At 25ms trigger the host AbortController;
// its stop path calls abortLease.release(true) exactly once.
// Assert no publication, no reuse, and a successful fresh client with new PID.
// An independent fixture observer checks old-PID disappearance within 2s:
// SELECT pid, state FROM pg_stat_activity WHERE pid = $1;
// Race completion/abort/next read; remove listeners/timers in every outcome.

// D. SQLite; DatabaseSync is imported from node:sqlite in the future harness.
const sqlite = new DatabaseSync(fixturePath, {
  readOnly: true, readBigInts: true, timeout: 75, allowExtension: false,
});
const sqliteValues = sqlite.prepare(`SELECT ? AS payload, ? AS i64,
  ? AS absent, ? AS flag, ? AS day, ? AS instant`)
  .get(payload, BigInt(i64), null, 1, day, instant);
// Assert exact strings, i64 bigint, null, flag === 1n.
// Boolean decoder accepts only 0n/1n; repeat 2n and expect TYPE_MISMATCH.
// Separate mixed(fixture_id INTEGER PRIMARY KEY, v) fixture has no v affinity:
sqlite.prepare("SELECT typeof(v) AS storage, v FROM mixed ORDER BY fixture_id").all();
// Inputs 7, '7', 'bad' remain integer/7n, text/'7', text/'bad'.
// A homogeneous declared source must reject the mismatch, not coerce it.
sqlite.close();

// E. Run ONLY in the disposable SQLite child after an IPC-ready handshake.
const cpuSql = `WITH RECURSIVE n(x) AS (VALUES(0)
  UNION ALL SELECT x + 1 FROM n WHERE x < 1000000000)
  SELECT sum(x) FROM n`;
// Parent stays responsive; request stop at 50ms, escalate after bounded grace,
// await confirmed exit within the 2s watchdog, discard all partial output,
// then prove a fresh read-only child can SELECT successfully.
// Separate lock probe: fixture writer holds BEGIN EXCLUSIVE in DELETE mode;
// child SELECT with timeout=75 fails, then succeeds after writer cleanup.

// F. Identity setup mutations are disposable-fixture-only work.
// INTEGER PRIMARY KEY identity remains keyed across VACUUM/re-read.
// Unkeyed rows stay labeled snapshot-only, regardless of whether their rowid
// happens to move in a particular delete/VACUUM experiment.
// Test collision-free composite tuples and reject duplicate/null key claims.
```

Also abort during acquisition and decoding, interrupt the network, exhaust a small pool without deadlocking the observer, and perform the two-reader/writer snapshot experiment. Log fixture/version identifiers, types, counters, and pass/fail; the hostile payload and diagnostic probes need no customer values. Prove the actual cleanup mechanism, not just the expected error code.

### 10.5 Validation commands and actual execution status

The assignment's genuine repository commands are retained verbatim for the later runnable checkout:

```bash
pnpm --filter exploreda exec vitest run src/test/lib/analysis/evaluateProject.test.ts src/test/lib/analysis/useAnalysisEvaluation.test.tsx src/test/lib/analysis/sourceRowIdentity.test.ts src/hooks/CrossfilterWrapper.test.ts
pnpm --filter exploreda check-types
pnpm check:ui
pnpm check
```

**All four commands: NOT RUN.** The packet lacks a runnable checkout and dependencies. `pnpm check` builds the package and must not run concurrently with another checkout's build/check. Reading existing tests is evidence of intended/covered cases, not a fresh pass. No SQL, database container, driver smoke probe, React runtime, browser flow, package install, or performance benchmark was executed. Actual validation in this assignment is source/photo integrity checking, source/document review, and structural validation/packaging of the research deliverables.

## 11. Interface handoff and recommendation reconciliation

### 11.1 Requirements to the other tracks

| Track | Required agreement and owned choices |
| --- | --- |
| **Query/demand contract** | Own detailed logical intents. Distinguish analysis-query from workspace-demand meaning; specify source role/grain, dependency projection, filter context, ordered comparison/null rules, entity conflicts, stable identity, diagnostics/contributors, and coverage. The initial intent can simply select a complete registered source set. A later compiler validates the whole requested plan and explicitly rejects unsupported cases. Do not assume a remote callback or final-row `AnalysisEvaluation` seam already exists. |
| **Transport** | Own production wire layout, compression, streaming, and client materialization. Preserve schema/type identity, null versus unavailable values when required, safe numeric/temporal meaning, keys, source roles, coverage, exact/unknown counts, snapshot/request identity, and atomic completion/error semantics. A page, sample, complete aggregate, and complete raw source need distinct descriptions. Never send native driver objects or treat binary/columnar transport as proof that current row-object/worker/Crossfilter costs disappear. |
| **Hosting — fourth track** | Own platform selection and deployment/operation automation for one dedicated instance per paying customer. Validate the selected driver's runtime, transaction and timeout behavior, customer network/DNS/TLS/egress route, pooling across replicas/proxies, cache freshness, process/file requirements where applicable, secret lifecycle and operational cleanup. No platform choice is made here. |

The adapter track owns source registration/authorization boundaries, driver/type normalization, transaction/snapshot behavior, SQL admission evidence, bounded resources, and the shared reader proof. Property names in this report are proposals awaiting reconciliation, not agreements attributed to the other tracks.

### 11.2 Stable decision IDs

The companion JSON uses these IDs. Each row states the cost, serious alternative, and result that can change the decision; the detailed evidence and proof are in the cited report sections.

| ID / position | Cost, alternative, and falsifier |
| --- | --- |
| **DBA-001 — recommend host-owned complete snapshots** | Pays full approved-source transfer and local memory; alternative is one narrow remote row/aggregate demand. Reject on the named workload's semantic or capacity failure. §§1–3, 9–10. |
| **DBA-002 — recommend PostgreSQL first** | Adds network/pool/TLS and raw-type handling; alternative is a file-first SQLite integration if customer need supports it. Reject if the real-driver proof or intended runtime/network path cannot pass. §§4, 7, 10. |
| **DBA-003 — recommend SQLite as second falsifying proof** | Adds file and synchronous-execution containment; alternative is another evidenced SQLite driver or DuckDB when analytical files dominate. Reject if the result shape, cleanup guarantee, or host responsiveness cannot remain consistent. §§4, 6, 10. |
| **DBA-004 — recommend semantic context and explicit admission** | Costs validation and an explicit unsupported outcome; alternative is a product-approved semantic simplification. Reject the proposed subset when the dual-context oracle finds a mismatch; do not silently redefine results. §§5–6, 8, 10. |
| **DBA-005 — recommend narrow type fidelity rules** | Initially excludes exact-decimal/submillisecond/complex fields from an editable snapshot unless safely transformed; alternative is a new exact-type/operation contract owned with query/transport. Reject current decoding on any loss of value or changed field meaning. §§5.3, 9–10. |
| **DBA-006 — recommend explicit identity policy** | Requires keys or bounded occurrence materialization and selection invalidation; alternative is snapshot-only nonpaged exploration. Reject on key collisions, unstable page identity, or silently rebound selections. §§5.4, 6, 10. |
| **DBA-007 — recommend atomic coverage and snapshot metadata** | Requires one coherent bounded read and completed materialization; alternative is an explicitly paged/partial contract with matching consumers. Reject on mixed snapshots, stale-cache freshness claims, or false completeness. §§6–7, 9–10. |
| **DBA-008 — recommend a small reader/capability/error boundary** | A deliberately narrow source-set API cannot serve every demand; alternative is a detailed universal engine matrix. Expand only for a concrete consumer and second-adapter evidence; reject client leakage of SQL/driver objects. §§3, 6. |
| **DBA-009 — recommend registered safe reads and independent bounds** | Requires host configuration, restricted permissions and row/cell/byte/time checks; alternative is fixed hand-written endpoint SQL with the same obligations. Reject if hostile input alters query structure or bounds only trigger after uncontrolled buffering. §§7, 10. |
| **DBA-010 — recommend stale suppression plus bounded stopping** | Costs connection discard or process containment; alternative is a proven pinned-driver cancel protocol. Reject on leaks, reused uncertain sessions, blocked host work, or a false claim that browser abort stopped the engine. §§6.5, 10. |
| **DBA-011 — investigate narrow SQL pushdown** | Requires typed equality/grain/lineage-aware lowering and proof; alternative is complete snapshots plus local evaluation. Promote one operation only when parity holds and measured work/transfer improves. §§5, 8, 10. |
| **DBA-012 — defer federation and arbitrary server formulas** | Leaves some customer demands unsupported; alternatives are explicit immutable exports or individually admitted typed formulas. Revisit only for a named demand with policy, consistency, type and lineage proof. §§3, 5, 7. |
| **DBA-013 — defer DuckDB as default and a separate query service** | Delays file-analytics/runtime-isolation features; alternatives become appropriate when a real input or private-network need requires them. Revisit if the fixed host endpoint cannot meet a concrete runtime/workload need. §§3–4, 7. |
| **DBA-014 — reject partial-as-exact and fabricated remote evaluations** | Prevents a superficially quick aggregate-only integration; alternative is a new honest remote consumer contract. Change only after input/output coverage and all requested inspection evidence are actually available. §§1, 5–6, 8. |
| **DBA-015 — recommend fixture-first proof and existing local mode** | Adds a small oracle/lifecycle fixture and measurement work; alternative is immediate broad implementation, which lacks rejection evidence. Stop or narrow on any concrete invariant failure; preserve one client version and evaluator. §§9–10. |
| **DBA-016 — recommend a constraints-only hosting handoff** | Some customer connectivity profiles may remain unsupported; alternative is a customer-side connector or different hosting/runtime selected by track 4. Reject combinations requiring recurring manual setup or unbounded origin resources. §7.3. |

## 12. Limitations, assumptions, and open decisions

- **Evidence limit:** selected baseline files and primary documentation, not a complete repository, runnable package, installed driver, deployed endpoint, or measured browser/database system. Missing calculation/category/normalization/bootstrap call paths prevent broader parity claims.
- **Provisional product choices:** initial supported source types, exact-value treatment, approved fields/row restrictions, query grain, refresh expectations, stable-key availability, and acceptable response/memory limits need confirmation through the bounded proof or actual customer requirements. They do not block this research recommendation.
- **Version limit:** exact runtime/driver/package/image pins remain unselected. The report records documentation access dates and distinguishes raw driver primitives from normalized source semantics. Recheck the pins; “PostgreSQL-compatible,” “Node-compatible,” or “SQLite-based” is not a substitute for the smoke tests.
- **Performance limit:** no measured latency, throughput, memory, cancellation timing, or capacity. Proposed arithmetic and test settings are labeled. The notebook's unclear byte estimate and existing historical repository measurements were not promoted to new results.
- **Scope limit:** new sources are confined to one registered database/read-snapshot domain. No arbitrary SQL, new server formula engine, federation platform, persistent remote cursor service, customer database migration, or application implementation is proposed as necessary for the first proof.
- **Hosting limit:** per-customer instance is the operational unit; exact serverless/Cloudflare/VPS/platform choice belongs to track 4. Private reachability, authentication, static egress needs, file persistence, cancellation, connection budgeting, and automation remain deployment-profile gates.
- **Consistency limit:** source reads presume ordinary supported local tables/reviewed views on one origin snapshot. Foreign tables, volatile/external functions, proxy caches, independent databases, and long-lived browser sessions need separate evidence; an opaque result ID does not create transactional guarantees.
- **Current semantic surprises:** analysis versus workspace count/conflict behavior and repeated-source entity identity may warrant a later deliberate product change. This research neither fixes them nor claims they are interchangeable. Any change must be explicit in the query contract and existing local behavior.

**No essential input blocks completion of this research.** A runnable checkout with its dependencies is the smallest missing input for application-level validation; a disposable local database/file plus pinned driver versions is the next input for the proposed driver proof. Customer credentials and hosting access are unnecessary until an independently authorized deployment/connectivity proof.


## 13. Evidence appendix

### 13.1 Repository reading inventory

The team read **32 of the 34 manifest-listed baseline files in full**. `projectFile.ts` was consulted only for selected validation behavior; `docs/ui-defaults.md` was verified for integrity but not read. All required minimum-reading files were covered. This is a selected-snapshot review, not a complete repository or runtime review. The following URLs identify the manifest-declared commit; the attached files were the actual source read, and an independent Git-object attestation was not performed.

All repository material was reviewed for this assignment on **2026-10-12 UTC**. References R01–R22 group related evidence; each exact path is linked below. The four test files were read as evidence and were not executed.

| Ref | Baseline path and relevant evidence | Reading status |
| --- | --- | --- |
| R01 | [package.json](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/package.json) — packageManager pnpm@11.9.0; workspace scripts | Full |
| R01 | [AGENTS.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/AGENTS.md) — research/working constraints and repository route | Full |
| R01 | [README.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/README.md) — library/demo architecture and local workflow | Full |
| R01 | [pnpm-workspace.yaml](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/pnpm-workspace.yaml) — workspace package configuration | Full |
| R01 | [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/agent-guide.md) — Node/release guidance; checks and workflow | Full |
| R02 | [packages/explorEDA/README.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/README.md) — project integration, stylesheet, worker and host ownership | Full |
| R02 | [packages/explorEDA/package.json](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/package.json) — package name, exports, React peer versions | Full |
| R03 | [packages/explorEDA/src/types/AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/AnalysisProject.ts) — SourceDefinition; six step types; AnalysisEvaluation and contributor types | Full |
| R04 | [packages/explorEDA/src/types/SavedDataStructure.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/SavedDataStructure.ts) — saved values, field settings, filters and special-value representation | Full |
| R04 | [packages/explorEDA/src/types/ChartTypes.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/ChartTypes.ts) — datum; axis/local-filter/chart types | Full |
| R05 | [packages/explorEDA/src/types/FilterTypes.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/FilterTypes.ts) — value, numeric range, text and date-range filter shapes | Full |
| R06 | [packages/explorEDA/src/components/ExplorEdaProject.tsx](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/ExplorEdaProject.tsx) — props; evaluator call; key/ID mapping; renderedSettings; tables/panels; chart context | Full |
| R07 | [packages/explorEDA/src/lib/analysis/evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/evaluateProject.ts) — sourceReferences/sourceFrame; lookupFrame; expandedFrame; calculateFrame; filterFrame; aggregateFrame; evaluateAnalysisQuery | Full |
| R08 | [packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts) — immutable source transfer, worker/direct paths, latest-request and pending-result behavior | Full |
| R08 | [packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts) — sources/evaluate/result/error messages and request IDs | Full |
| R09 | [packages/explorEDA/src/providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/providers/DataLayerProvider.tsx) — local rows/Crossfilter; field conversion; grouped aggregates; caches; settings restore | Full |
| R10 | [packages/explorEDA/src/hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/hooks/CrossfilterWrapper.ts) — selected/context membership; chart own-filter and field-control exclusions | Full |
| R10 | [packages/explorEDA/src/hooks/applyFilter.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/hooks/applyFilter.ts) — value/range/text/date predicates | Full |
| R11 | [packages/explorEDA/src/lib/chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/chartPopulation.ts) — local/facet population and filter application | Full |
| R12 | [packages/explorEDA/src/lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/valueParsing.ts) — parseNumber; missing/numeric exclusion reasons; UTC dates, fractional rounding and bounds | Full |
| R13 | [packages/explorEDA/src/lib/aggregates.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/aggregates.ts) — summarizeGroup; calculateGroupedAggregate; poolAggregateRows; entity conflicts/contributors | Full |
| R14 | [packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts) — full/context/selected IDs; domains, facets, legends and points | Full |
| R15 | [packages/explorEDA/src/components/charts/BarChart/barPlan.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/charts/BarChart/barPlan.ts) — full/domain/current groups; empty categories, bins, own selections and contributors | Full |
| R16 | [docs/performance-checks.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/performance-checks.md) — measurement context; cold/warm/production comparisons and historical performance caveats | Full |
| R17 | [packages/explorEDA/src/lib/analysis/projectFile.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/projectFile.ts) — selected validateAnalysisProjectFile schema/reference/step validation excerpts only | Targeted validation excerpts |
| R18 | [packages/explorEDA/src/lib/analysis/sources.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/sources.ts) — sourceFromRows; addSourceFromRows; singleTableProject and source identity | Full |
| R18 | [packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/test/lib/analysis/sourceRowIdentity.test.ts) — duplicate occurrences, row identity and project promotion cases | Full |
| R19 | [packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts) — lookup/expand/filter/aggregate/parameter/invalid-plan expectations; read, not run | Full |
| R20 | [packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx) — worker reply ordering and pending/error cases; read, not run | Full |
| R20 | [packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts) — workspace/linked/chart/field-control scope cases; read, not run | Full |
| R21 | [docs/intent/current-analysis-trust/intent-brief.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/intent/current-analysis-trust/intent-brief.md) — source membership versus numerical contributors; explicit missing/invalid meanings | Full |
| R21 | [docs/intent/renderer-independent-replay/intent-brief.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/intent/renderer-independent-replay/intent-brief.md) — semantic replay, record identity and bounded architecture | Full |
| R22 | [packages/explorEDA/src/analysis.ts](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/analysis.ts) — exported AnalysisProject types and createAnalysisWorker factory; bootstrap implementation absent | Full |
| — | [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/ui-defaults.md) | Integrity/hash only; not read |

Additional authorized packet evidence: `source-manifest.json`, `photo-manifest.json`, `source-notes.md`, `prompts/database-adapters.md`, the other two coordination prompts, the separately attached byte-identical prompt, and the three visually inspected `notebook-*.jpeg` photos. The manifest records the baseline; notes and photographs are local additions, not baseline code. No credentials, customer data, build output, installed dependencies, or live browser appshot were supplied.

Key source anchors for review: source identity in `sourceReferences`; guarded lookup and expansion in `lookupFrame`/`expandedFrame`; strict filters and entity-aware reductions in `filterFrame`/`aggregateFrame`; workspace measure behavior in `summarizeGroup`/`poolAggregateRows`; chart population in `CrossfilterWrapper`; and the integration seam in `ExplorEdaProject` and `useAnalysisEvaluation`. The preservation of contributors and honest result meaning also follows the two supplied intent briefs. [R07] [R08] [R10] [R13] [R19] [R20] [R21]

### 13.2 External primary-source ledger

**Every source below was accessed on 2026-10-12 UTC.** These are primary documentation/specification pages, not measured tests of an installed package. Versioned PostgreSQL 18 and Node 24 documentation informs the proposed local proof; exact binary/package/image pins remain a later proof input. “Current” URLs are intentionally recorded as retrieved and should be rechecked against those pins. Short descriptions state the limited fact researched, while design choices and tests remain this report's proposals.

| Ref / primary source | Evidence used or qualification |
| --- | --- |
| [E01: node-postgres: queries](https://node-postgres.com/features/queries) | Value binding, nonparameterizable identifiers, null/undefined parameters. Accessed 2026-10-12. |
| [E02: node-postgres: data types](https://node-postgres.com/features/types) | Raw/custom type parsing and documented date/time conversion caveats; exact package pins still required. Accessed 2026-10-12. |
| [E03: node-postgres: Client API](https://node-postgres.com/apis/client) | Documented query/client options and timeout distinction; no assumed query AbortSignal option. Accessed 2026-10-12. |
| [E04: node-postgres: Pool API](https://node-postgres.com/apis/pool) | Client leasing and documented destroy-release behavior. Accessed 2026-10-12. |
| [E05: node-postgres: transactions](https://node-postgres.com/features/transactions) | All transaction statements use one checked-out client. Accessed 2026-10-12. |
| [E06: node-postgres: Cursor API](https://node-postgres.com/apis/cursor) | Bounded batches and cursor lifecycle; rows alone do not bound cell bytes. Accessed 2026-10-12. |
| [E07: PostgreSQL: comparison functions](https://www.postgresql.org/docs/current/functions-comparison.html) | NULL comparison and distinctness semantics. Accessed 2026-10-12. |
| [E08: PostgreSQL 18: aggregates](https://www.postgresql.org/docs/18/functions-aggregate.html) | Count/sum/average return types, empty inputs and ordering qualifications. Accessed 2026-10-12. |
| [E09: PostgreSQL 18: transaction isolation](https://www.postgresql.org/docs/18/transaction-iso.html) | Read Committed versus Repeatable Read snapshot behavior. Accessed 2026-10-12. |
| [E10: PostgreSQL 18: client connection defaults](https://www.postgresql.org/docs/18/runtime-config-client.html) | Server-side statement, lock and transaction timeout controls. Accessed 2026-10-12. |
| [E11: PostgreSQL 18: system columns](https://www.postgresql.org/docs/18/ddl-system-columns.html) | ctid is a physical row-version location, not durable application identity. Accessed 2026-10-12. |
| [E12: PostgreSQL 18: collation](https://www.postgresql.org/docs/18/collation.html) | Collation-dependent text comparison; proof domains must be explicit. Accessed 2026-10-12. |
| [E13: PostgreSQL 18: protocol cancellation](https://www.postgresql.org/docs/18/protocol-flow.html#PROTOCOL-FLOW-CANCELING-REQUESTS) | Separate CancelRequest connection and cancellation race/acknowledgement limitations. Accessed 2026-10-12. |
| [E14: PostgreSQL 18: SET TRANSACTION](https://www.postgresql.org/docs/18/sql-set-transaction.html) | Read-only/isolation semantics; transaction mode is not an arbitrary-function sandbox. Accessed 2026-10-12. |
| [E15: SQLite: datatypes](https://www.sqlite.org/datatype3.html) | Storage classes, affinity, comparison conversions, and Boolean/date representation. Accessed 2026-10-12. |
| [E16: SQLite: STRICT tables](https://www.sqlite.org/stricttables.html) | Optional strict typing; existing permissive files cannot be assumed strict. Accessed 2026-10-12. |
| [E17: SQLite: rowid tables](https://www.sqlite.org/rowidtable.html) | INTEGER PRIMARY KEY alias versus unstable unaliased rowid under VACUUM. Accessed 2026-10-12. |
| [E18: SQLite: isolation](https://www.sqlite.org/isolation.html) | Read transactions, journal-mode-dependent writer behavior and snapshot isolation. Accessed 2026-10-12. |
| [E19: SQLite: aggregate functions](https://www.sqlite.org/lang_aggfunc.html) | Numeric conversion, empty sums and count/average behavior. Accessed 2026-10-12. |
| [E20: Node 24.x: node:sqlite](https://nodejs.org/docs/latest-v24.x/api/sqlite.html) | Synchronous API, release-candidate status, read-only/BigInt options, lock timeout; no documented interrupt API. Accessed 2026-10-12. |
| [E21: DuckDB: Node Neo client](https://duckdb.org/docs/current/clients/node_neo/overview) | Native client/runtime types, asynchronous APIs and documented API coverage. Accessed 2026-10-12. |
| [E22: DuckDB: concurrency](https://duckdb.org/docs/current/connect/concurrency) | Embedded file/process concurrency rules; remote modes are separate integrations. Accessed 2026-10-12. |
| [E23: DuckDB: comparisons](https://duckdb.org/docs/current/sql/expressions/comparison_operators) | Combination casting warns against assuming cross-engine scalar equality. Accessed 2026-10-12. |
| [E24: Cloudflare Workers: Node compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) | Documented nonfunctional SQLite/child-process/worker-thread module stubs. Accessed 2026-10-12. |
| [E25: Cloudflare Workers: TCP sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/) | Direct TCP private-address and socket-lifetime restrictions. Accessed 2026-10-12. |
| [E26: Cloudflare Hyperdrive: private database via Tunnel](https://developers.cloudflare.com/hyperdrive/configuration/connect-to-private-database/) | Customer-network cloudflared route and private-database setup. Accessed 2026-10-12. |
| [E27: Cloudflare: Hyperdrive with Workers VPC](https://developers.cloudflare.com/changelog/post/2026-04-29-hyperdrive-vpc-private-databases/) | Additional supported private-database connectivity path; not a platform endorsement. Accessed 2026-10-12. |
| [E28: Cloudflare Hyperdrive: connection pooling](https://developers.cloudflare.com/hyperdrive/concepts/connection-pooling/) | Transaction pooling and connection/session implications. Accessed 2026-10-12. |
| [E29: ECMAScript: IsLessThan](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-islessthan) | String ordering by UTF-16 code units. Accessed 2026-10-12. |
| [E30: node-postgres: SSL](https://node-postgres.com/features/ssl) | TLS configuration and connection-string/configuration interaction. Accessed 2026-10-12. |
| [E31: SQLite: write-ahead logging](https://www.sqlite.org/wal.html) | WAL files/locking and same-host file-access constraints. Accessed 2026-10-12. |
| [E32: Cloudflare Hyperdrive: query caching](https://developers.cloudflare.com/hyperdrive/concepts/query-caching/) | Default query-cache behavior and controls; freshness needs an explicit path. Accessed 2026-10-12. |
| [E33: PostgreSQL 18: schemas](https://www.postgresql.org/docs/18/ddl-schemas.html) | Schemas within a connected database versus access across databases. Accessed 2026-10-12. |
| [E34: node-postgres: native bindings](https://node-postgres.com/features/native) | Optional native/libpq driver differs from the pure-JavaScript proof choice. Accessed 2026-10-12. |
| [E35: DuckDB: securing DuckDB](https://duckdb.org/docs/current/operations_manual/securing_duckdb/overview) | SQL/file/network/extension execution privileges and scope controls. Accessed 2026-10-12. |
| [E36: PostgreSQL 18: WITH queries](https://www.postgresql.org/docs/18/queries-with.html#QUERIES-WITH-CTE-MATERIALIZATION) | CTE materialization syntax and behavior used in the illustrative SQL. Accessed 2026-10-12. |

[R01]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/package.json
[R02]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/README.md
[R03]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/AnalysisProject.ts
[R04]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/SavedDataStructure.ts
[R05]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/types/FilterTypes.ts
[R06]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/ExplorEdaProject.tsx
[R07]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[R08]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
[R09]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/providers/DataLayerProvider.tsx
[R10]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[R11]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/chartPopulation.ts
[R12]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/valueParsing.ts
[R13]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/aggregates.ts
[R14]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts
[R15]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/components/charts/BarChart/barPlan.ts
[R16]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/performance-checks.md
[R17]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/projectFile.ts
[R18]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/lib/analysis/sources.ts
[R19]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
[R20]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/test/lib/analysis/useAnalysisEvaluation.test.tsx
[R21]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/docs/intent/current-analysis-trust/intent-brief.md
[R22]: https://github.com/byronwall/explorEDA/blob/f01ff0fb1f9e1240020744a18816f2dad68bf488/packages/explorEDA/src/analysis.ts

[E01]: https://node-postgres.com/features/queries
[E02]: https://node-postgres.com/features/types
[E03]: https://node-postgres.com/apis/client
[E04]: https://node-postgres.com/apis/pool
[E05]: https://node-postgres.com/features/transactions
[E06]: https://node-postgres.com/apis/cursor
[E07]: https://www.postgresql.org/docs/current/functions-comparison.html
[E08]: https://www.postgresql.org/docs/18/functions-aggregate.html
[E09]: https://www.postgresql.org/docs/18/transaction-iso.html
[E10]: https://www.postgresql.org/docs/18/runtime-config-client.html
[E11]: https://www.postgresql.org/docs/18/ddl-system-columns.html
[E12]: https://www.postgresql.org/docs/18/collation.html
[E13]: https://www.postgresql.org/docs/18/protocol-flow.html#PROTOCOL-FLOW-CANCELING-REQUESTS
[E14]: https://www.postgresql.org/docs/18/sql-set-transaction.html
[E15]: https://www.sqlite.org/datatype3.html
[E16]: https://www.sqlite.org/stricttables.html
[E17]: https://www.sqlite.org/rowidtable.html
[E18]: https://www.sqlite.org/isolation.html
[E19]: https://www.sqlite.org/lang_aggfunc.html
[E20]: https://nodejs.org/docs/latest-v24.x/api/sqlite.html
[E21]: https://duckdb.org/docs/current/clients/node_neo/overview
[E22]: https://duckdb.org/docs/current/connect/concurrency
[E23]: https://duckdb.org/docs/current/sql/expressions/comparison_operators
[E24]: https://developers.cloudflare.com/workers/runtime-apis/nodejs/
[E25]: https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/
[E26]: https://developers.cloudflare.com/hyperdrive/configuration/connect-to-private-database/
[E27]: https://developers.cloudflare.com/changelog/post/2026-04-29-hyperdrive-vpc-private-databases/
[E28]: https://developers.cloudflare.com/hyperdrive/concepts/connection-pooling/
[E29]: https://tc39.es/ecma262/multipage/abstract-operations.html#sec-islessthan
[E30]: https://node-postgres.com/features/ssl
[E31]: https://www.sqlite.org/wal.html
[E32]: https://developers.cloudflare.com/hyperdrive/concepts/query-caching/
[E33]: https://www.postgresql.org/docs/18/ddl-schemas.html
[E34]: https://node-postgres.com/features/native
[E35]: https://duckdb.org/docs/current/operations_manual/securing_duckdb/overview
[E36]: https://www.postgresql.org/docs/18/queries-with.html#QUERIES-WITH-CTE-MATERIALIZATION


## 14. Compact acceptance summary

| Item | Result |
| --- | --- |
| Access / baseline | **GO for bounded research.** Authorized selected snapshot of `byronwall/explorEDA` at `f01ff0fb1f9e1240020744a18816f2dad68bf488`; 34 source hashes and 3 photo hashes/byte counts verified. No runnable checkout or independent current-main claim. |
| Files read | 32 baseline files read in full, `projectFile.ts` targeted, `docs/ui-defaults.md` integrity-only; notes/manifests/three prompts and all three photos examined. Assigned track only; hosting context incorporated as constraints. |
| Checks run | Source/photo/duplicate-prompt integrity, source/primary-document review, report/JSON reference and structure checks, and ZIP content checks. These validate research artifacts, not application or driver correctness. |
| Checks not run | All four supplied pnpm validation commands; application/worker/browser execution; dependency installs; SQL/container/embedded fixtures; driver binding/cancellation/type probes; performance benchmarks and private connectivity/deployment checks. |
| Deliverables | `database-adapters-research.md`; compact stable-ID `database-adapters-recommendations.json`; `database-adapters-research.zip` containing both. No repository save or PR is claimed. |
| Recommendation | Host-owned complete registered-source read into existing `tables`; PostgreSQL first, SQLite second; preserve current local evaluator/inspection/filter scope; admit narrow SQL only after explicit parity proof. |
| Unresolved assumptions | Runtime/driver pins, actual customer connectivity, source schema/key/precision policy, workable width/memory/latency budgets, refresh needs, and future remote consumer/transport decisions remain provisional. |
| Blockers | None for this research. Runnable checkout/dependencies and disposable pinned fixtures are needed for the next proof. Production credentials and platform selection are not prerequisites to this recommendation. |
