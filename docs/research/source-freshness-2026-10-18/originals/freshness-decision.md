# explorEDA: when related sources need one shared read

Research date: **2026-10-19 UTC**. Decision baseline: **`0984715cb4c0c85d0d6efa8436ab38368bd20ae1`**. Status: **research complete; all proposed database, application, and author checks remain unexecuted**.

Companion documents: [recommendations](recommendations.md), [bounded proof](proof-plan.md), and [revised research queue](research-queue.md).

**Evidence labels:** facts are inspected packet statements and cited official guarantees; inferences are their implications for this task and the scored decision; proposals are the synthetic fixture, unexecuted proofs, and conditional product changes. A proposed acceptance criterion is not an observed result.

## Executive decision

**Keep independently refreshed, complete source snapshots as the default. For a reconciliation whose conclusion depends on related mutable rows agreeing, require an explicitly coherent read of the required data. For the named task below, first try one correctly aggregated SQL source on SQLite using the existing source contract.**

This is **GO for a bounded local falsification and author proof of the existing SQL boundary**, and **NO-GO for a new freshness platform or grouped-refresh feature now**. The fixture exposes a material possible mismatch: a correct net of 14,000 cents becomes either 10,000 or 18,000 cents under two specified mixed-source schedules. It does not establish an actual customer's need for a new feature. No proof has passed.

The smallest useful product work is a documentation correction and a runnable reconciliation example, contingent on the local author proof. Preserve explicit refresh, complete-or-refuse acquisition per source, local evaluation, and existing React/TypeScript and pnpm. A coherent multi-source feature becomes worth an implementation proof only if an actual task needs separate source grains or local relationships that the single SQL source cannot preserve acceptably. [R01, R02, R11, R12]

- **Independent snapshots suffice** for separate analyses, intentional comparisons of different reporting periods, unchanged reference/fact data, or producer-controlled immutable extracts whose exact input versions are known. A recent timestamp alone establishes none of those conditions.
- **One coherent database read is needed** when a task asserts relational coverage, absence, or reconciliation across data that may change together during acquisition. The boundary covers the task's required inputs, not every source in the project.
- **Grouped publication helps** when a user needs the previous published set retained until every replacement is ready, even if the inputs are intentionally independent. It controls what becomes visible; it does not synchronize the source databases.
- **Strongest rejected alternative:** staging independently acquired source reads and publishing them together as a fix for database consistency. It can publish the incorrect 10,000-cent result perfectly atomically.

The decisive unresolved question is whether a real author can complete the task with the SQL source and its declared grain. The first proof must test that handoff as well as numerical correctness. Another broad architecture survey would not answer it.

## Access preflight and evidence status

### Result: GO for this research

The attached prompt was read in full. The packet identifies `https://github.com/byronwall/explorEDA`, the requested baseline, and its kind as a selected source snapshot that is not runnable. Its package manifest independently names the same repository. All **37** file bodies were extracted without changing their contents and checked against their manifest byte counts and SHA-256 values: **37 matched**, comprising **36 baseline files** and **one new research-context file**. This is verified packet integrity and packet-attested baseline identity; it is not independent Git object authentication. [R01]

An attempt to open the exact GitHub tree at `https://github.com/byronwall/explorEDA/tree/0984715cb4c0c85d0d6efa8436ab38368bd20ae1` was unavailable through the browsing service. The supplied fallback packet was therefore used. No `main` files were substituted.

| Required access gate | Evidence read | Result |
| --- | --- | --- |
| Repository and working rules | `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `README.md`, both included `package.json` files | Read; identity and React/TypeScript/pnpm constraints agree. |
| Refresh and conversion | Full `refresh.ts`, `read.ts`, source `routes.ts` | Read; lifecycle and publication inspected. |
| Snapshot representation | Full `lib/project/snapshots.ts` | Read; format/version/metadata inspected. |
| Folder and file reader | Full `folder.ts`, `files.ts`, `directoryFiles.ts` | Read; separate reads and polling inspected. |
| Refresh caller and display | Full `apps/app/src/App.tsx`, `httpFiles.ts`, `DatabaseSourceViews.tsx` | Read, including all effects and reload paths. |
| Filesystem and event path | Full `node/projectFiles.ts`, `server/handler.ts` | Read; watcher activation and per-path events inspected. |
| Driver contracts and implementations | Full `types.ts` and all five SQLite, PostgreSQL, MySQL, SQL Server, and DuckDB drivers | Read; actual statements and transaction ownership inspected. |
| Existing tests and fake | Full `refresh.test.ts`, `fake.ts` | Test source read; tests not run. |
| Example and user documentation | Three database `.eda` files and `database-sources.mdx` | Read; orders/customer lookup and returns SQL verified as authored text. |
| Prior decisions and intents | Three included intent briefs, preparation decisions, both research queues | Read; prior preparation scope preserved. |
| Current decisive primary sources | Official sources for all five engines, listed below | Accessible; main external evidence gate passes. |

Packet file: **243,555 bytes**; SHA-256 **`f527df2b00bdb9da84f2a7e2789fc94188d66e1b0c60bd82ef2dc182c1d29b02`**. The complete manifest path inventory appears at the end of this document.

### Baseline versus supplied research context

The prompt supplies the lineage: baseline on `codex/data-preparation-research-2026-10-16`; preparation branch `codex/source-freshness-research-2026-10-18`; application source matching `origin/main` commit `b07f3cf3483130f6cc3391bba47a87f616c93321`; intervening preparation research associated with PR [#451](https://github.com/byronwall/explorEDA/pull/451). These branch/PR statements are supplied context, not newly verified live GitHub status. Any later authorized PR would need a fresh base check; none was created here.

The packet marks only `docs/research/source-freshness-2026-10-18/research-queue.md` as **new research context**. Its statements about current PRs and prior chat/run searches are not treated as baseline application facts or independently repeated findings. The prior preparation decisions are baseline material: DP-08 retained per-source snapshots without establishing cross-source coherence; DP-04 already identified the repeated-order-value grain trap; DP-09/10 retained infrastructure gates and rejected a preparation platform. That research is not reopened. [R12]

### Coverage limits

- No runnable checkout, lockfile, database binary, sample database generator, installed dependency inventory, or live database/server was supplied or used. Required selected source files were readable; unavailable execution is an acknowledged packet limit, not evidence of failing tests.
- `ProjectWorkspace.tsx`, the complete evaluator, saved-state/history implementations, `lib/project/tables.ts` containing `isDataFile`, and several imported test helpers are absent. Exact browser rendering, persistent error survival, snapshot-path filtering through that omitted predicate, selection restoration, and evaluator output cannot be certified from this packet.
- The three `.eda` example definitions are present; the sample database's actual rows and the prior 18-row proof's original contents are not. The fixture below is newly authored and explicitly synthetic.
- All primary guarantees are conditional on documented engine behavior and eligible queries. Installed versions, MySQL storage engines/isolation, SQL Server database options and hints, SQLite journal mode, and operational privileges remain unverified.
- File hashing and document/archive validation were performed. No application test, browser session, database fixture, benchmark, commit, PR, deployment, or merge was executed. Source examples of tests are evidence about intended checks, not passing runtime results.

If any required packet file had failed its integrity/read gate, or decisive official guarantees for an engine had remained inaccessible, the research would have stopped with the smallest missing input. That did not occur. One optional Tableau multi-connection extract guarantee was not established; it is omitted, and the main decision does not depend on it.

## Named task and exact paper fixture

### Task: reconcile order sales and refunds by current customer region

An analyst wants to answer: **“Does every recorded refund belong to an order in this reconciliation, does every order have a customer, and what are gross sales, refunded value, and net sales by the customer's current region?”** The analysis may represent an older coherent database view, provided it states that boundary honestly; it may not treat incompatible inputs as a current reconciled population.

This is a designed task grounded in the supplied shop example, which separately reads orders and customers, locally looks up customers, and reads returns through a database join to orders. It is not a reported customer incident or validated demand. The packet does not establish that the proposed reconciliation already exists in the app. [R11]

All monetary values below are **integer cents**. `refundCents` is a new fixture field. The supplied sample's `refunded` field has no verified type here, and its Returns metric sums `returns.amount` with the label “Order value”; that value must not be silently reinterpreted as cash refunded. The existing returns SQL is at return grain and repeats an order's amount when an order has multiple returns. [R11, R12]

### Committed state S0

| Customer ID | Name | Current region |
| --- | --- | --- |
| C1 | Ada | North |
| C2 | Bea | South |

| Order ID | Customer ID | Amount, cents |
| --- | --- | --- |
| O101 | C1 | 10,000 |
| O102 | C2 | 6,000 |

| Return ID | Order ID | Refund, cents |
| --- | --- | --- |
| R501 | O101 | 2,000 |

Primary keys are unique, foreign keys are enforced in the fixture's normal states, all money is non-null, and all measures are nonnegative before computing net. Fixed order/return event dates in the proof are business fields, not snapshot identifiers.

### Two distinct database changes

1. **Business transaction B, S0 → S1:** atomically insert customer C3/Cy/North, order O103/C3/4,000 cents, and return R502/O103/4,000 cents. All three become committed together. No orphan exists in either committed database state.
2. **Reference-only transaction D, S1 → S2:** update C1's current region from North to South. No order or return row changes. This intentionally restates current-region attribution; it does not rewrite the time the order or refund happened.

| Coherent state | Exact membership | Measures, cents |
| --- | --- | --- |
| S0 | Customers C1,C2; orders O101,O102; returns R501 | Gross 16,000; refunds 2,000; net 14,000. North net 8,000; South net 6,000. |
| S1 | Customers C1,C2,C3; orders O101,O102,O103; returns R501,R502 | Gross 20,000; refunds 6,000; net 14,000. North net 8,000; South net 6,000. |
| S2 | Same IDs and money as S1; C1 now South | Gross 20,000; refunds 6,000; net 14,000. North net 0; South net 14,000. |

The identical S0/S1 net is deliberate: a plausible total does not prove correct membership. At S1, North includes O101 and O103, with gross 14,000 and refunds 6,000; South contains O102, with gross 6,000 and refunds zero. At S2, North contains O103, with gross/refunds both 4,000 and a genuine zero net; South contains O101/O102, with gross 16,000 and refunds 2,000.

The normal prepared result contains one row per order, after aggregating refunds per order. Its S1 net contributions are O101=8,000, O102=6,000, O103=0. The proof's SQL also retains unmatched orders/customers and orphan refunds as explicit diagnostics, including the zero-orders case; it cannot hide a coverage failure with an inner join.

### Exact failure mechanisms

Notation `orders@S0` means rows read from committed state S0; it is a paper label, not a field supported by today's snapshot format.

| Schedule, all unexecuted | Result derived from the specified inputs | Incorrect conclusion to prevent |
| --- | --- | --- |
| Read orders@S0 completely; commit B; read customers@S1 and returns@S1 completely; all requests succeed | Orders O101,O102; returns R501,R502. R502 has no order in the loaded orders. Raw net = 16,000 − 6,000 = **10,000**. | “The database contains an orphan refund” or “net sales are 100 dollars.” Neither describes S0 or S1. |
| Same inputs, but inner-join returns to the loaded orders before summing | R502 disappears; only R501 contributes. Net becomes **14,000**, while return membership is wrong. | “The books reconcile because the total is 140 dollars.” This passes a total-only check by hiding the new return. |
| Disk holds S0; database already S1; Refresh All reads orders successfully, customers fails before publication, returns is never attempted | orders@S1, customers@S0, returns@S0. Raw net = 20,000 − 2,000 = **18,000**. O103 lacks a loaded customer. North=8,000, South=6,000, missing-customer=4,000. | “Sales increased by 40 dollars” or “customer C3 is absent upstream.” It is a mixed successful prefix, not coherent S1. |
| Same partial failure, but inner-join orders to customers | O103 disappears and the total can again look like **14,000**. | “Nothing changed.” Two known orders conceal the missing new customer's order. |
| Keep unchanged orders@S1 and returns@S1; read customers@S2 | Exact S2 current-region answer: North=0, South=14,000. | A blanket “timestamps differ, so this result is inconsistent” warning would itself be wrong. |

These are relational paper calculations under the definitions above, not observed explorEDA evaluator results. Current code supports the successful-prefix acquisition schedule independently of watcher timing. [R02, R07]

For a separate grain counterexample, **G branches from S1**, adding return R503/O101/500 cents. Correct gross=20,000, refunds=6,500, net=13,500; North=7,500, South=6,000. A return-grain sum of joined order amounts is 24,000 (10,000+4,000+10,000), not order gross. Coherent acquisition cannot repair a wrongly chosen measure grain.

## What the current code actually guarantees

“Complete” means all rows returned by the admitted table/SQL request, with successful conversion within the read limits. SQL may deliberately filter or limit its own result. It does not mean all business events have arrived, and it does not select one universal database isolation level. [R02, R03, R10]

| Layer | Present guarantee from source inspection | Limit that matters to this decision |
| --- | --- | --- |
| Complete source acquisition | `readSnapshot` drains batches, checks limits/cancellation, converts columns, and only then constructs the snapshot. | Completeness and database read consistency are separate. The byte check estimates values; no performance or exact hard-deadline claim was tested. [R03] |
| One query's database view | Determined by each driver's actual statements and engine settings. | SQLite/PG/MySQL/DuckDB/SQL Server cannot be assigned one universal isolation label. See the engine matrix. [R10] |
| Separate queries/sources | Each `refreshSource` opens a source session and later closes it. | Same configured connection ID does not mean shared session, transaction, or view. [R02, R04] |
| Overlap for one source | A module-local map keyed by resolved root and source ID returns the in-flight promise. | No coordination across source IDs. The first caller's options/signal own the operation. One-server scope makes cross-process coordination unnecessary here. [R02] |
| Individual file publication | `writeWhole` writes beside the target and renames the complete file into place. | One-file replacement, with no multi-file transaction, retained history, or explicit crash-durability/fsync protocol. [R02] |
| Failed read retention | A read/conversion failure before publication leaves the previous snapshot file in place. | Not every rejected request means old bytes: `session.close()` is awaited after rename; response delivery also follows publication. These are static outcome boundaries, not observed failures. [R02, R04, R14] |
| Folder reconstruction | `readProjectFolder` loads stored snapshots and builds tables/analyses without querying databases. | It lists and reads files separately; no manifest pins a common published generation. Missing or malformed snapshots produce diagnostics; other snapshot I/O errors may abort folder loading. [R06] |
| Refresh All | `refreshSources` awaits each source in order, stops on the first rejection, and reloads a successful prefix in `finally`. | Success means every requested acquisition succeeded, not one database snapshot. Later sources after a failure are unattempted. [R07] |
| Client state/display | `reload` replaces one assembled folder state and increments the workspace generation. Source items show counts, connection, and relative read age. | A single React state update does not make separately acquired inputs coherent. UI error persistence and rendered row membership were not observed. [R07, R09] |
| Watchers | Local file events are batched, delivered through SSE, and may cause another folder read; browser directory access instead polls. | Event coalescing and initiator suppression are not a group publication fence. Initial-load ordering and event delivery remain unexecuted. [R08] |
| Snapshot provenance | Format/version, source ID, connection, driver, `readAt`, row count, fields, notes, rows. | No stored SQL/definition fingerprint, database token, group membership, publication ID, event watermark, or durable failed-at record. [R05] |
| Saved analysis identity | Analyses are re-read against the newly assembled tables; unique typed entity keys support row references. | Saved configuration does not pin old data here. Duplicate/missing keys fall back to positions. Broader selection/export/undo/reopen behavior is separately queued. [R06, R13] |

### `readAt`: useful provenance with a narrow meaning

`read.ts:readSnapshot` assigns `new Date().toISOString()` after iteration and conversion, before `refresh.ts` writes the file. Therefore:

- It records the application's **read conversion completion time** for this stored result.
- It is neither query start nor publication time. It is not a database snapshot token, transaction identifier, business event timestamp, ingestion watermark, or retained revision identifier.
- Equal values can occur for different reads and prove no coherence. Unequal values can belong to one deliberately held database view, or to unchanged data that is safe to combine.
- Clock skew, clock adjustments, and display rounding are additional reasons not to use timestamp equality as a correctness test. `readAgo` also rounds elapsed time and clamps future values; the UI updates its relative label every 30 seconds. [R03, R05, R09]

For a proof, hash the exact stored bytes and the source/analysis definitions separately. Those hashes identify the inspected artifacts; they still do not prove an upstream shared view. Historical reproduction would require retaining the relevant content, which is not supplied by today's overwrite-in-place snapshot path. [R02, R05, R06]

### Full-file UI and watcher qualification

Both initial loading and watcher registration are independent mount effects in the full `App.tsx`; watching is not deliberately deferred until initial loading finishes. The HTTP adapter creates `EventSource`; the local handler activates `files.watch` when it handles `/api/events`. No subscription acknowledgement, revision fence, or replay token ties these operations together. A watcher reload that completes before the ready state is installed can be discarded by the state guard. These facts establish a missing ordering guarantee, not a witnessed race. [R07, R08]

The initiator's `ownSnapshots` marker suppresses one matching event for less than ten seconds from request start, deleting the marker when consumed. A long read or another event can bypass that convenience. The Node adapter's 120 ms batching and directory adapter's two-second polling likewise do not define a publication transaction. The omitted `isDataFile` implementation prevents independently verifying final snapshot-path qualification in `affectsProject`; the explicit snapshot notice branch is present. [R07, R08]

The deterministic partial-refresh mismatch does not require any of these observer races: successful files are already replaced, and `refreshSources` explicitly reloads them after a later failure. Conversely, do not promise that the Refresh All error remains visible after that reload: `ProjectWorkspace` is remounted, and its error-state owner is outside the packet. [R07, R09]

## Alternatives and decision-specific scoring

The scores are **research judgments, not benchmarks, customer votes, or delivery estimates**. Each criterion scores 0–5, higher being better. The named task is small enough for a complete local snapshot; there is no measured capacity problem.

| Criterion | Weight | What earns a high score |
| --- | --- | --- |
| C: prevents the specified false reconciliation | 4 | Reads the required related data under an eligible coherent boundary. |
| G: preserves separate source grains and local relationships | 2 | Supports the existing independent orders/customer/return analysis shapes. |
| V: prevents an incomplete replacement set being exposed | 1 | Keeps the old required set until the new required set is complete. |
| O: proportionate operating/maintenance cost | 2 | Fits one personal developer and one server/client without ongoing machinery. |
| R: reuses the present contract | 1 | Works through current complete source and SQL seams. |

Weighted score = `4C + 2G + V + 2O + R`, maximum 50. The vector order below is **C/G/V/O/R**. Provenance alone intentionally receives the same correctness score as keep-as-is; clearer explanation cannot change incorrect arithmetic.

| Alternative | Scores and total | Decision for this task |
| --- | --- | --- |
| Keep current behavior and wording unchanged | 0/5/0/5/5 = **25/50** | Keep its architecture, but reject leaving ambiguous “same moment” wording intact. |
| Independent complete snapshots with clear provenance | 0/5/0/5/5 = **25/50** | **Default.** Best for independent/intentional comparisons; must not claim this reconciliation is coherent from Refresh All alone. |
| One coherent scope for required sources on one connection, with a visible set boundary | 5/5/5/2/1 = **40/50** | **Conditional investigation.** Solves read drift and preserves separate grains, but needs lifecycle and publication/reader changes. |
| Stage independent reads, then publish the set together | 0/5/5/2/2 = **21/50** | **Defer as a visibility feature; reject as a database-consistency fix.** Requires real set binding, not sequential renames. |
| One correctly aggregated SQL source; or an upstream extract with an explicit coherent-production contract | 5/2/5/5/5 = **44/50** | **First proof.** One normal order-grain result fits existing publication. Separate return-grain interaction may be lost; author acceptance is unresolved. |

The last row scores the **single-SQL implementation of this fixture** under SQLite's eligible statement semantics. A prepared extract earns that correctness score only if its producer supplies a coherent version/cutoff and performs extraction accordingly; a casually exported collection of files does not. Its operating cost must be rescored if producing it requires new infrastructure. The coherent-scope row scores the complete proposed contract, including visible-set binding; a shared transaction followed by unpinned file-by-file publication would not earn V=5.

Sensitivity is useful: increasing G's weight from 2 to 4 changes the maximum to 60, making the coherent-scope row **50/60** and the SQL row **48/60**. That is exactly the unanswered product question: do separate source grains materially matter to the author? Scores support the bounded comparison; they do not authorize a feature.

### Same connection, different connections, different engines

| Topology | Defensible boundary | Consequence |
| --- | --- | --- |
| Sources name one explorEDA connection | Today they use distinct refresh sessions. A future group must retain one actual session and eligible transaction across all required reads. | Merely batching requests or reusing the connection definition cannot provide coherence. PostgreSQL/MySQL `read` currently own their transaction lifecycle. [R02, R04, R10] |
| Different sessions/connection definitions aimed at the same database | No automatic shared view. Prefer one eligible SQL/read scope if credentials and source definitions permit. | PostgreSQL exported snapshots are an engine-specific possibility with import ordering and exporter-lifetime conditions; absent from this code and excluded from the first proof. [E05, E06] |
| Different databases, replicas, files, or engines | Independent provenance, or an upstream data product with a documented combined cutoff/version. | Grouped publication can align the visible batch, but this research establishes no shared transactional view across these systems. Replica lag and nontransactional/external data require separate producer evidence. |

“One connection” is not a universal federation boundary. A SQL query using remote objects, external files, volatile functions, or engine-specific hints may exceed the documented local transactional scope. Admit only the chosen engine/data/query case; do not infer cross-engine consistency from one SQL string.

### If a coherent-source feature eventually earns a proof

The minimum useful proposed contract would name a fixed set of required sources on one eligible database connection; acquire one shared read scope; read and validate every member; release it without publishing a partial set; and make consumers bind all members to one published generation. Any pre-publication failure keeps the prior visible set. An opaque application generation can identify publication membership, but must never be described as a database snapshot token unless an actual engine token exists. [R02–R08; E01–E14]

This would touch driver transaction ownership, refresh coordination, snapshot metadata, the folder reader, and UI result binding. Reusing an existing session without changing `read` ownership is insufficient. A single manifest switch over immutable staged files is a possible local mechanism; it is not implemented or mandated here. Sequential renames or suppressing a watcher do not satisfy that contract. No scheduler, dependency graph platform, compatibility layer, distributed coordinator, or automatic retry service follows from it.

## Database matrix: current official guarantees versus actual code

All sources below were accessed **2026-10-19 UTC**. The matrix uses ordinary transactional table reads; arbitrary SQL effects, foreign data, and cross-database services are not certified. Client package versions are not server version evidence.

| Engine and actual driver scope | Applicable guarantee today | Settings, privileges, and a future scope |
| --- | --- | --- |
| **SQLite.** `SqliteSession.read` prepares one statement and iterates it in batches; connect uses `DatabaseSync(..., { readOnly: true })`. No explicit BEGIN. | An active statement has an implicit read transaction; its batches are not independent database reads. Ordinary isolated connections protect committed state. No transaction spans source refreshes. [E01, E02; R10] | A shared scope needs an explicit transaction and first actual read on one file/handle. Rollback journaling can delay writer commit; WAL permits the held-reader schedule but can delay checkpoints. Read-only WAL needs suitable sidecars/directory access; its relaxed rules date to SQLite 3.22. Node >=22.16 is checked by this driver; actual SQLite build/journal mode remain unknown. [E02, E03] |
| **PostgreSQL.** `PostgresSession.read` sends `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`, configures local settings, queries type metadata, and streams through `pg-cursor`; generator cleanup rolls back. | For ordinary managed table data, this source cursor already shares a stable transaction view. Its initial metadata SELECT may establish the view before the source SELECT. PostgreSQL's default READ COMMITTED is not the setting this driver requests. [E04, E05; R10] | Current official route displays **18**. A group must move transaction ownership outside individual `read` calls and keep one client/transaction. Appropriate connection/schema/table read permissions are needed, not global configuration. Bound the duration. RR is not full serializable business-process validation; sequences and external objects need separate treatment. [E04–E06] |
| **MySQL.** `MysqlSession.read` configures UTC/optional timeout, sends `START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY`, streams one SELECT, then rolls back. It does not set/check isolation or table engines. | The intended transaction snapshot requires **InnoDB + REPEATABLE READ**. The modifier does not choose isolation and is ignored with a warning at isolation levels other than REPEATABLE READ. Ordinary InnoDB READ COMMITTED SELECT still has a statement view; the missing setting does not imply every source SELECT is internally mixed. [E07–E09; R10] | Official **8.4** and the unversioned route resolving to **9.7** were checked. A group must establish/verify eligibility before reading and share one transaction. Session/next-transaction isolation needs no global administrative change; global defaults require extra privilege. DDL may invalidate reads. MariaDB is mentioned by the driver/docs but was not separately verified; do not inherit this matrix automatically. [E09, E10] |
| **SQL Server / Azure SQL.** `SqlServerSession.read` describes the result through the pool first; then explicitly begins `READ_COMMITTED`, streams a transaction-bound request, and rolls back. Pool size one is per session. | With RCSI off, locking read committed does **not** promise a fixed statement-start snapshot. With RCSI on, eligible statements get a statement view, still not a shared view across source refreshes. Thus a joined SQL query is not a universal remedy under this current driver. [E11; R10] | Reference family **17.x** checked; installed product/options unknown. SQL Server defaults RCSI off, Azure SQL Database on. A future SNAPSHOT scope needs `ALLOW_SNAPSHOT_ISOLATION` on in each accessed database; it establishes a view on data access. Database property changes require ALTER permission; the app should not enable them implicitly. Query hints can change behavior; metadata description requires permission to execute the described SQL. [E11, E12, E18] |
| **DuckDB.** `DuckdbSession.read` accepts SELECT and streams prepared results; no explicit group transaction. Connect creates a file instance with `READ_ONLY` and external access disabled, then closes it per source. | Official **1.5** documentation states transaction snapshot isolation. The embedded read-only file mode excludes concurrent writers while it is open; separately closed/reopened sources can still straddle a writer's change. This is not a simultaneous external-writer scenario. [E13, E14; R10] | File permissions/locking and the actually loaded runtime matter. Development dependency `@duckdb/node-api` is `1.5.6-r.1`, but project-relative dynamic loading makes runtime version unverified. A future scope would retain an appropriate instance/connection. Current docs discuss other remote/lakehouse arrangements; they are outside this driver's boundary. [E13, E14; R01, R10] |

Read-only controls and rollback protect a different property from a shared view. A stable database view also does not establish that an upstream multi-transaction business process is finished or that all late events have arrived. The fixture's B is explicitly one committed transaction so that this distinction is controlled.

## Product vocabulary and three focused comparisons

These products are design evidence, not recommendations to buy services or evidence that explorEDA users demand their features. No paid account or service was used.

| Product/document scope | Primary documented behavior | Lesson and limit for explorEDA |
| --- | --- | --- |
| **Metabase**, latest docs displaying v0.64 | Query-result cache policies decide when saved results expire; ordinary recomputation happens when requested after expiry, with automatic refresh separately described. Some policies/scopes require paid plans. [E15] | Explain the age of the stored query result. A common cache policy for questions is not evidence of one source-database view. Keep automatic scheduling outside this task. |
| **Tableau Cloud/Server**, current freshness-policy documentation | Applicable live workbooks can reuse cached query results under a freshness policy. Workbook-owner configuration is described; Desktop and extract/file-based workbooks are excluded from this policy. [E16] | “Live” and “freshness” need a precise cache explanation. This page does not establish multi-source extract or database consistency. |
| **Power BI**, enhanced semantic-model refresh API | Transactional mode keeps previous model data on processing failure; partialBatch commits separately and can leave empty/partial data. Start/end timestamps describe the refresh operation. The documented feature has Premium/PPU/Embedded and permission prerequisites. [E17] | Explicit old-or-new publication semantics are useful vocabulary. Model publication atomicity and refresh-history times do not establish a common upstream read moment. |

### Proposed analyst-facing terms

| Term | Meaning to communicate | Evidence required before using it |
| --- | --- | --- |
| **Read completed …** | When this source's stored read finished conversion. | Today's `readAt`; show exact time/timezone where precision matters. |
| **Using the last successful snapshot** | The stored complete result currently supplying rows. | Identify the actual stored result; separately report failed/unattempted refresh members. |
| **Read independently** | Related sources can come from different database views. | The present default; no new timestamp heuristic is needed. |
| **Read in one database view** | The named required data was acquired under an enforced engine scope. | Verified eligible engine/query settings and one acquired scope. This is proposed vocabulary, not current UI. |
| **Published together** | All named replacement results became one visible set. | A publication contract and reader binding; no implied database consistency. |
| **Data through …** | An upstream producer guarantees completeness through a defined event/business cutoff. | Producer semantics, including late-arrival rules. A maximum event timestamp alone is insufficient. |

The documentation change belongs in `apps/demo/src/docs/pages/database-sources.mdx`, with a new **“Related sources and read times”** section after **“What a read keeps”**, plus a correction to the broad PostgreSQL/MySQL sentence in the driver section. The existing sample's “update together” wording should explain source refresh and folder reload without suggesting a shared database view. Pair this with the proof's SQLite example and measure-grain explanation in the same future milestone. [R01, R11, R12]

Suggested example copy: **“Each source keeps its latest complete read. Refresh all reads sources in sequence. Related sources can reflect different database states. For this reconciliation, the SQL source reads the related tables in one SQLite query and adds refunds per order before calculating net sales.”** This is proposed copy, not a claim that the example has run.

## Decision gates, uncertainties, and stop conditions

### GO now: bounded proof through the existing source contract

Proceed locally when a disposable SQLite fixture and a runnable exact-baseline checkout are available. First demonstrate the mixed inputs and then evaluate the single SQL source. No database server or paid provisioning is needed. Confirm both exact membership and measures, including diagnostic rows and G's duplicate-return case. Have one author perform the task and explain the read boundary and grain. The full ordered specification is in [proof-plan.md](proof-plan.md).

### Conditional GO: implementation proof of a coherent group

All of the following must be true before implementation is justified:

1. A named author task reproduces a material mismatch or cannot safely use independent snapshots.
2. One joined SQL source or an already available coherent extract fails that task for a recorded reason, such as required separate return-grain inspection, rather than a hypothetical preference for a platform.
3. The required sources fit one eligible engine/connection and a bounded local read duration/resource budget. A read-only app user can use the required settings without hidden server reconfiguration.
4. A one-engine proposal fixes both acquisition and the required visible-set behavior. It covers pre-publication failures and distinguishes a post-publication uncertain response from rollback.
5. The proof can stay inside one server/client, existing React/TypeScript and pnpm, and one explicit source group with paired docs/example. If this cannot be done proportionately, retain the upstream boundary.

### NO-GO / stop

- If the author succeeds with the SQL example and honest provenance, stop freshness feature expansion; ship only separately authorized documentation/example work.
- If sources are intentionally independent or unchanged, do not add a coherence requirement solely because their timestamps differ.
- Reject staged publication as a read-consistency repair if it still publishes the mixed 10,000-cent case.
- Reject a universal isolation setting, automatic cross-engine promise, snapshot timestamp token, distributed coordinator, CDC service, query optimizer, framework migration, or general refresh orchestration platform.
- Do not turn missing runtime evidence into an alleged bug or actual user demand. Observer/error/selection questions remain local checks, and broader selection identity remains its existing queued question.

The unexecuted proof leaves five material uncertainties: real author acceptance of upstream SQL; actual deployed engine settings/versions; whether separate source grains are indispensable; observed failure/error/observer behavior in the runnable app; and acceptable group duration if a group is later required. None warrants provisioning or an unbounded program now.

## Repository evidence register

All paths below refer to the validated packet baseline unless explicitly marked new context. Line numbers are from the exact extracted UTF-8 bodies. They identify source inspected as text, not execution results.

- **R01 — identity and constraints:** `AGENTS.md:3–17` (React/TypeScript, pnpm, docs/example scope); full `docs/agent-guide.md` and `CODING_STANDARDS.md`; `README.md:125–148` (data/configuration boundary and workspace); root `package.json:28` (`pnpm@11.9.0`); `packages/explorEDA/package.json:6–9,150–192` (repository/client dependencies).
- **R02 — refresh:** `packages/explorEDA/src/server/sources/refresh.ts:writeWhole:157–163`, `refreshSource:165–184`, `readAndWrite:187–231`. Per-source deduplication, open/read/publish/close ordering and one-file rename.
- **R03 — conversion and completion time:** `packages/explorEDA/src/server/sources/read.ts:readSnapshot:49–163`, especially `91–116` and `117–154`; `sizeOf:26–38`.
- **R04 — contract/routes:** `packages/explorEDA/src/server/sources/types.ts:ReadRequest:62–69`, `DatabaseSession:86–91`; `routes.ts:sourceRoutes:60–75`. No shared-scope API; response and optional notification follow refresh.
- **R05 — snapshot format:** `packages/explorEDA/src/lib/project/snapshots.ts:SnapshotInfo/SnapshotFile:27–45`, `snapshotPath:48–50`, `parseSnapshot:57–79`, `readAgo:95–112`.
- **R06 — folder/files:** `packages/explorEDA/src/lib/project/folder.ts:readSnapshot:157–185`, `readProjectFolder:217–433`, particularly `220,237,253–255,307–334,386–396`; `files.ts:ProjectFiles:7–16` and `memoryProjectFiles:72–135`.
- **R07 — full UI caller:** `apps/app/src/App.tsx:readAll:103–109`, `reload:155–175`, initial-load and watcher effects `177–237`, `refreshSources:422–449`, workspace generation key `464–491`.
- **R08 — observer implementations:** `apps/app/src/httpFiles.ts:createHttpFiles.watch:154–163`; `packages/explorEDA/src/node/projectFiles.ts:nodeProjectFiles.watch:124–174` and `SETTLE_MS:23–24`; `packages/explorEDA/src/server/handler.ts:createRequestHandler:73–83,131–145`; `packages/explorEDA/src/lib/project/directoryFiles.ts:directoryProjectFiles:46–51,142–183`.
- **R09 — source-age/error UI:** `apps/app/src/DatabaseSourceViews.tsx:useRead:29–53`, `ReadProblem:55–91`, `RefreshAll:157–202`, `useReadAgo:255–266`, `DatabaseSourceItem:268–321`.
- **R10 — complete drivers:** `packages/explorEDA/src/server/sources/drivers/sqlite.ts:SqliteSession.read:75,close:160,connect:171`; `postgres.ts:PostgresSession.read:192,close:293,connect:320`; `mysql.ts:MysqlSession.read:150,close:277,connect:307`; `sqlserver.ts:SqlServerSession.describe:137,read:147,close:261,connect:288`; `duckdb.ts:DuckdbSession.read:136,close:234,connect:243`. These are exact symbol start lines; the complete files were read.
- **R11 — actual example/docs:** `packages/explorEDA/examples/database/exploreda.eda:3–16`; `orders.eda:4–16`; `returns.eda:4–15`; full `apps/demo/src/docs/pages/database-sources.mdx`, especially `9–12,62–69,115–126`.
- **R12 — prior research boundaries:** `docs/research/data-preparation-boundary-2026-10-16/decisions.md:9–22`; its `research-queue.md:3–18`; `docs/intent/database-query-contract/intent-brief.md:11,15–23,31–42,60–62`; `docs/intent/database-adapters/intent-brief.md:11–19,34–59` (status note supersedes older body); `docs/intent/current-analysis-trust/intent-brief.md:13–17,27–47,51–53`. The freshness queue dated 2026-10-18 is **new research context**, full text read.
- **R13 — row identity interaction:** `packages/explorEDA/src/components/project/sourceRowIdentity.ts:sourceRowIdentities:21–52`, `resolveSourceRow:55–69`. Unique typed keys versus positional fallback, without a snapshot revision.
- **R14 — tests and fake, not executed:** `packages/explorEDA/src/server/sources/refresh.test.ts:49–123,147–216`; `fake.ts:FakeDatabase:21–32,fakeDriver:34–111`. Existing assertions cover per-source publication/failure, overlap, limits, timeout, and closure; they do not establish a shared database view or group publication.

## Decisive external source register

**Access date for every entry: 2026-10-19 UTC.** Each entry is a short supporting paraphrase with its applicable version/setting. Current documentation routes are evidence of documentation accessed, not discovery of the user's runtime. No decisive guarantee relies on a secondary source.

- **E01 — SQLite isolation.** [https://www.sqlite.org/isolation.html](https://www.sqlite.org/isolation.html) — Current isolation documentation; ordinary isolated connections and rollback/WAL behavior. WAL permits a reader to retain a view while a separate writer commits; shared-cache/read-uncommitted is a special exception.
- **E02 — SQLite transactions.** [https://www.sqlite.org/lang_transaction.html](https://www.sqlite.org/lang_transaction.html) — Current transaction documentation, page updated 2026-02-18. Implicit transaction/statement lifetime and deferred BEGIN's first-access boundary explain the current iterator and proposed multi-query proof.
- **E03 — SQLite WAL.** [https://www.sqlite.org/wal.html](https://www.sqlite.org/wal.html) — Current WAL documentation, sections 2.2, 5, 6. Reader checkpoint cost and SQLite >=3.22 read-only opening conditions; WAL requires a suitable local filesystem.
- **E04 — PostgreSQL isolation.** [https://www.postgresql.org/docs/current/transaction-iso.html](https://www.postgresql.org/docs/current/transaction-iso.html) — Current route displays PostgreSQL 18, sections 13.2.1–13.2.2. RR retains a first-statement view; RC obtains statement views; snapshot isolation is not full serializability.
- **E05 — PostgreSQL transaction modes.** [https://www.postgresql.org/docs/current/sql-set-transaction.html](https://www.postgresql.org/docs/current/sql-set-transaction.html) — PostgreSQL 18. Transaction-local modes and imported-snapshot ordering/eligibility; read-only has a defined command scope.
- **E06 — PostgreSQL snapshot synchronization.** [https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-SNAPSHOT-SYNCHRONIZATION](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-SNAPSHOT-SYNCHRONIZATION) — PostgreSQL 18, section 9.28.5. Separate sessions can import an exported snapshot while its exporting transaction remains open. This mechanism is not present in explorEDA.
- **E07 — MySQL transaction start, 8.4.** [https://dev.mysql.com/doc/refman/8.4/en/commit.html](https://dev.mysql.com/doc/refman/8.4/en/commit.html) — MySQL 8.4, section 15.3.1. WITH CONSISTENT SNAPSHOT is conditional on InnoDB and RR; it does not select isolation.
- **E08 — MySQL current-route cross-check.** [https://dev.mysql.com/doc/refman/en/commit.html](https://dev.mysql.com/doc/refman/en/commit.html) → [https://dev.mysql.com/doc/refman/9.7/en/commit.html](https://dev.mysql.com/doc/refman/9.7/en/commit.html) — Unversioned route resolved to 9.7 at access; the same conditions and ignored-modifier warning remain documented. This does not assert the latest release or deployed version.
- **E09 — MySQL consistent reads.** [https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html](https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html) — MySQL 8.4/InnoDB. RR and RC differ across successive reads; ordinary RC SELECT retains a statement view. DDL can invalidate ongoing snapshot reads.
- **E10 — MySQL transaction settings.** [https://dev.mysql.com/doc/refman/8.4/en/set-transaction.html](https://dev.mysql.com/doc/refman/8.4/en/set-transaction.html) — MySQL 8.4. Session/next-transaction settings differ from global defaults; only the global change needs the documented administrative privilege.
- **E11 — SQL Server isolation.** [https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17) — SQL Server 17.x reference, updated 2026-09-21; SQL Server/Azure differences. RCSI selects statement versioning; SNAPSHOT requires database eligibility and a transaction; hints can change semantics.
- **E12 — SQL Server database properties.** [https://learn.microsoft.com/en-us/sql/relational-databases/databases/view-or-change-the-properties-of-a-database?view=sql-server-ver17](https://learn.microsoft.com/en-us/sql/relational-databases/databases/view-or-change-the-properties-of-a-database?view=sql-server-ver17) — SQL Server reference, updated 2026-07-21. Changing database properties requires ALTER permission; snapshot-option administration is separate from application read permission.
- **E13 — DuckDB transaction management.** [https://duckdb.org/docs/current/sql/statements/transactions](https://duckdb.org/docs/current/sql/statements/transactions) — Current docs display 1.5. Explicit transaction control and snapshot isolation/repeatable reads are documented.
- **E14 — DuckDB concurrency.** [https://duckdb.org/docs/current/connect/concurrency](https://duckdb.org/docs/current/connect/concurrency) — Current docs display 1.5. Embedded read-only file access excludes writers; other remote/lakehouse modes have separate arrangements and are outside this driver.
- **E15 — Metabase cache policy.** [https://www.metabase.com/docs/latest/configuring-metabase/caching](https://www.metabase.com/docs/latest/configuring-metabase/caching) — Latest route displays v0.64. Cached-query validity and refresh policy concern cached result age; feature availability varies by plan.
- **E16 — Tableau freshness policy.** [https://help.tableau.com/current/online/en-us/data_freshness_policy.htm](https://help.tableau.com/current/online/en-us/data_freshness_policy.htm) — Current Cloud/Server documentation. Applicable live workbook query-cache freshness; not a multi-connection extract-consistency guarantee.
- **E17 — Power BI enhanced refresh.** [https://learn.microsoft.com/en-us/power-bi/connect-data/asynchronous-refresh](https://learn.microsoft.com/en-us/power-bi/connect-data/asynchronous-refresh) — Current documentation, updated 2025-01-07. Commit modes distinguish complete model replacement from partial processing; operation timestamps and service prerequisites are documented.
- **E18 — SQL Server result description.** [https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-describe-first-result-set-transact-sql?view=sql-server-ver17](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-describe-first-result-set-transact-sql?view=sql-server-ver17) — Current 17.x reference. Description requires permission to execute the input SQL and does not promise a frozen schema between description and later execution.

## Exact packet manifest inventory

All entries passed their manifest byte count and SHA-256 check. **B** means baseline; **N** means newly authored research context. The 37 rows below are the exact selected paths, not a claim that the complete repository was available.

| Manifest path | Bytes | Origin |
| --- | ---: | --- |
| `AGENTS.md` | 4,033 | B |
| `docs/agent-guide.md` | 19,779 | B |
| `CODING_STANDARDS.md` | 2,213 | B |
| `README.md` | 10,263 | B |
| `package.json` | 1,258 | B |
| `packages/explorEDA/package.json` | 6,082 | B |
| `packages/explorEDA/src/server/sources/refresh.ts` | 7,695 | B |
| `packages/explorEDA/src/server/sources/read.ts` | 4,891 | B |
| `packages/explorEDA/src/server/sources/types.ts` | 3,502 | B |
| `packages/explorEDA/src/server/sources/routes.ts` | 3,512 | B |
| `packages/explorEDA/src/server/sources/refresh.test.ts` | 6,738 | B |
| `packages/explorEDA/src/server/sources/fake.ts` | 3,568 | B |
| `packages/explorEDA/src/lib/project/snapshots.ts` | 3,572 | B |
| `packages/explorEDA/src/lib/project/folder.ts` | 13,652 | B |
| `packages/explorEDA/src/lib/project/files.ts` | 4,011 | B |
| `apps/app/src/App.tsx` | 15,203 | B |
| `apps/app/src/httpFiles.ts` | 9,908 | B |
| `apps/app/src/DatabaseSourceViews.tsx` | 9,328 | B |
| `packages/explorEDA/src/components/project/sourceRowIdentity.ts` | 2,403 | B |
| `packages/explorEDA/examples/database/exploreda.eda` | 523 | B |
| `packages/explorEDA/examples/database/orders.eda` | 492 | B |
| `packages/explorEDA/examples/database/returns.eda` | 457 | B |
| `apps/demo/src/docs/pages/database-sources.mdx` | 9,658 | B |
| `docs/intent/database-query-contract/intent-brief.md` | 5,105 | B |
| `docs/intent/database-adapters/intent-brief.md` | 4,164 | B |
| `docs/intent/current-analysis-trust/intent-brief.md` | 3,397 | B |
| `docs/research/data-preparation-boundary-2026-10-16/decisions.md` | 4,406 | B |
| `docs/research/data-preparation-boundary-2026-10-16/research-queue.md` | 5,122 | B |
| `packages/explorEDA/src/node/projectFiles.ts` | 5,987 | B |
| `packages/explorEDA/src/server/handler.ts` | 4,993 | B |
| `packages/explorEDA/src/lib/project/directoryFiles.ts` | 5,701 | B |
| `packages/explorEDA/src/server/sources/drivers/mysql.ts` | 11,328 | B |
| `packages/explorEDA/src/server/sources/drivers/duckdb.ts` | 9,419 | B |
| `packages/explorEDA/src/server/sources/drivers/postgres.ts` | 11,159 | B |
| `packages/explorEDA/src/server/sources/drivers/sqlite.ts` | 6,687 | B |
| `packages/explorEDA/src/server/sources/drivers/sqlserver.ts` | 10,919 | B |
| `docs/research/source-freshness-2026-10-18/research-queue.md` | 2,248 | N |

[E01]: https://www.sqlite.org/isolation.html
[E02]: https://www.sqlite.org/lang_transaction.html
[E03]: https://www.sqlite.org/wal.html
[E04]: https://www.postgresql.org/docs/current/transaction-iso.html
[E05]: https://www.postgresql.org/docs/current/sql-set-transaction.html
[E06]: https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-SNAPSHOT-SYNCHRONIZATION
[E07]: https://dev.mysql.com/doc/refman/8.4/en/commit.html
[E08]: https://dev.mysql.com/doc/refman/9.7/en/commit.html
[E09]: https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html
[E10]: https://dev.mysql.com/doc/refman/8.4/en/set-transaction.html
[E11]: https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17
[E12]: https://learn.microsoft.com/en-us/sql/relational-databases/databases/view-or-change-the-properties-of-a-database?view=sql-server-ver17
[E13]: https://duckdb.org/docs/current/sql/statements/transactions
[E14]: https://duckdb.org/docs/current/connect/concurrency
[E15]: https://www.metabase.com/docs/latest/configuring-metabase/caching
[E16]: https://help.tableau.com/current/online/en-us/data_freshness_policy.htm
[E17]: https://learn.microsoft.com/en-us/power-bi/connect-data/asynchronous-refresh
[E18]: https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-describe-first-result-set-transact-sql?view=sql-server-ver17
