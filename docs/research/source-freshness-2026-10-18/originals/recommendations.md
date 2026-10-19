# Source freshness recommendations

**Baseline:** `0984715cb4c0c85d0d6efa8436ab38368bd20ae1`. **Research date:** 2026-10-19 UTC. These recommendations use the selected packet and current official documentation; they do not assert an executed application result or established customer demand. Repository paths below identify inspected packet evidence.

**Decision:** keep complete independent snapshots as the default. Proceed only with the bounded local falsification and author proof of an existing SQL source described in [proof-plan.md](proof-plan.md). New shared-read or grouped-publication product work is **NO-GO now**. “Adopt” accepts a research boundary or proposed documentation direction; it does not report a shipped change. **Every proof below is proposed and unexecuted.** All amounts in fixture references are integer cents.

## SF-01 — Keep complete independent snapshots as the default

**Disposition: Adopt. Confidence: high for the current boundary; medium for its adequacy to a real author.**

- **Affected task and action:** preserve explicit refresh for ordinary exploration and intentional comparisons of independently captured sources. Make the reconciliation task opt into a stronger requirement only when its needed relationships cannot tolerate differing read states. Complete means every row returned by the authored query, within admitted limits; it does not mean every business record exists upstream.
- **Repository evidence:** `packages/explorEDA/src/server/sources/read.ts:readSnapshot` consumes and converts the cursor before returning; `refresh.ts:refreshSource` deduplicates one source, and `readAndWrite` publishes after that read. `docs/research/data-preparation-boundary-2026-10-16/decisions.md:DP-08` preserves this boundary.
- **External evidence:** [SQLite transaction documentation](https://www.sqlite.org/lang_transaction.html) describes implicit statement transactions; this is a database read boundary, distinct from publication.
- **Cost:** low; preserve existing behavior and explain its scope. **Alternative:** require every related source to join a group, adding configuration and failure coupling to tasks that may not need either.
- **Proof:** accept the default when an author can identify the actual source inputs and complete the task without assuming common database time. Reject an independent-read coherence claim when the mixed-success fixture yields net **10,000**, although coherent S0 and S1 both yield **14,000**. That counterexample alone does not justify a new feature: SF-02 must also fail the author's required task before a group earns investigation.

## SF-02 — Falsify the need for a feature with one existing SQL source

**Disposition: Investigate; GO for the bounded proof. Confidence: high in the proposed arithmetic; medium in author usability.**

- **Affected task and action:** reconcile order gross, refunds, net, and current customer region using the existing `sql=` source. Aggregate returns per order before joining customers and orders. Keep one normal row per order, plus explicitly marked orphan-return diagnostics; include separate order/return counts so diagnostic rows cannot inflate order counts.
- **Repository evidence:** `apps/demo/src/docs/pages/database-sources.mdx:Connections and sources` already permits SQL sources. Its returns query repeats order amount at return grain. `packages/explorEDA/src/server/sources/drivers/sqlite.ts:SqliteSession.read` executes one prepared statement. Prior decision `decisions.md:DP-04` keeps relation composition upstream and identifies the grain risk.
- **External evidence:** [SQLite isolation documentation](https://www.sqlite.org/isolation.html) explains stable read views; this supports the first proof's SQLite scope.
- **Cost:** low to moderate for the disposable fixture, recipe, and author observation; no application implementation. **Alternative:** an upstream prepared extract with explicit grain and producer provenance.
- **Proof:** accept when S1 returns gross **20,000**, refunds **6,000**, net **14,000**, and three orders; the added-return grain case must yield net **13,500** without duplicated gross. Require missing-customer/orphan diagnostics and successful author inspection. Reject this handoff only for recorded task loss, such as needing separate grains that this relation cannot preserve; unfamiliarity alone should first receive the paired guide/example.

## SF-03 — Name read completion, source age, and business cutoff separately

**Disposition: Adopt as documentation direction. Confidence: high.**

- **Affected task and action:** help an analyst decide whether an apparent revenue change reflects transactions, reference-data restatement, or different source reads. Use “read completed” for `readAt`, “last successful snapshot” for the current saved result, and “independent reads” for unrelated scopes. Reserve “data through” for a producer-defined completeness cutoff. Nearby timestamps must not imply coherence.
- **Repository evidence:** `packages/explorEDA/src/server/sources/read.ts:readSnapshot` assigns `readAt` after conversion, before `refresh.ts:writeWhole`. `packages/explorEDA/src/lib/project/snapshots.ts:SnapshotInfo/readAgo` supplies completion time and relative age. `apps/demo/src/docs/pages/database-sources.mdx:Try it with a sample database` and `What a read keeps` are the proposed explanation locations.
- **External evidence:** [Metabase caching documentation](https://www.metabase.com/docs/latest/configuring-metabase/caching) labels query-result cache lifetime separately from underlying data freshness.
- **Cost:** low for a reviewed explanation and worked example; a persistent failure history or new UI is separate work. **Alternative:** display one “updated” timestamp for the project, which would obscure the inputs this task needs.
- **Proof:** accept when an author correctly distinguishes the mixed-read error from S2's valid current-region restatement: total net remains **14,000**, while North becomes **0** and South **14,000**. Reject wording that makes the author infer a database token, event cutoff, or historical-region promise from completion time.

## SF-04 — Make any coherence claim conditional on the actual driver contract

**Disposition: Adopt the evidence gate; investigate changes only after activation. Confidence: high in static findings; deployed settings unknown.**

- **Affected task and action:** prevent the reconciliation recipe or a future group from claiming identical semantics on every engine. Use the five-engine matrix in [freshness-decision.md](freshness-decision.md) to record applicable versions, settings, privileges, and query restrictions before accepting a guarantee.
- **Repository evidence:** `packages/explorEDA/src/server/sources/drivers/postgres.ts:PostgresSession.read` explicitly selects repeatable-read/read-only and rolls back after its cursor. `mysql.ts:MysqlSession.read` requests a consistent snapshot without choosing isolation. `sqlserver.ts:SqlServerSession.read` explicitly begins `READ_COMMITTED`. Read-only access or eventual rollback does not identify a shared snapshot.
- **External evidence:** [MySQL's current-route manual](https://dev.mysql.com/doc/refman/9.7/en/commit.html) requires InnoDB and repeatable read for the modifier. [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html) defines its repeatable-read view. [SQL Server isolation](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17) distinguishes statement snapshots, transaction snapshots, and locking behavior.
- **Cost:** moderate for one activated engine; substantially higher for a universal promise. **Alternative:** document eligible environments or use an upstream author-controlled relation.
- **Proof:** accept only an explicitly eligible configuration. Reject a MySQL group claim when its modifier is ignored, and reject a universal single-query snapshot claim for SQL Server without the required settings/query conditions. Do not provision servers or change operator settings during this research; preserve PostgreSQL's already explicit per-read scope.

## SF-05 — Defer a shared transaction until the author needs separate source grains

**Disposition: Defer; conditional GO for a later implementation proof only. Confidence: medium.**

- **Affected task and action:** activate only when a named author needs separate orders, customers, and returns relations, mixed reads cause material error, and SF-02/upstream preparation loses required work. The smallest candidate would read an explicit member set through one physical connection and eligible transaction, then expose one complete consumer generation.
- **Repository evidence:** `packages/explorEDA/src/server/sources/types.ts:DatabaseSession` exposes `listTables/read/close`; `refresh.ts:readAndWrite` opens a session per source. `postgres.ts:PostgresSession.read` and `mysql.ts:MysqlSession.read` own transaction teardown. `packages/explorEDA/src/lib/project/folder.ts:readProjectFolder` loads snapshots separately. Reusing a connection ID would not supply the missing contract.
- **External evidence:** [PostgreSQL transaction modes](https://www.postgresql.org/docs/current/sql-set-transaction.html) define a transaction scope covering multiple statements; source membership is an application responsibility.
- **Cost:** moderate to high: transaction ownership, cancellation, staged results, and consumers must agree. **Alternative:** retain separate independent snapshots with explicit limitations, or one SQL source.
- **Proof:** reject before implementation if the author completes the task with SF-02. After activation, require the inter-query writer schedule to return entirely S0 or S1 and require failed members to retain the previous visible set. Reject any design that fixes upstream reads but exposes mixed file generations. Different configured connections, databases, or engines receive no automatic shared guarantee.

## SF-06 — Reject staged publication as a database-coherence remedy

**Disposition: Reject for coherence; defer for a named batch-visibility task. Confidence: high.**

- **Affected task and action:** do not sell “published together” as “read from one database moment.” Staging can address a different need: an analyst wants all selected published results to change together or remain unchanged after failure. That need must be stated separately and demonstrated.
- **Repository evidence:** `packages/explorEDA/src/server/sources/refresh.ts:writeWhole` renames one file. `packages/explorEDA/src/lib/project/folder.ts:readProjectFolder` has no member-generation binding. `apps/app/src/App.tsx:refreshSources` refreshes sequentially and reloads a successful prefix. These are distinct read, publication, and consumer boundaries.
- **External evidence:** [Power BI enhanced refresh](https://learn.microsoft.com/en-us/power-bi/connect-data/asynchronous-refresh) distinguishes whole-model and per-command commit modes.
- **Cost:** moderate even without database coordination, because all consumers must bind the selected generation. **Alternative:** retain individual publication, explain partial success, and retry the failed source; use SF-05 only for its stronger activated task.
- **Proof:** stage the mixed-success fixture, publish it as one set, and calculate net **10,000**. That counterexample rejects staging alone as the coherence fix. If a separate visibility task activates, accept only old-or-new membership across explicit reload and watcher reload; sequentially renaming each member or suppressing one client's events is insufficient. A database-correct result set can still fail that consumer check.

## SF-07 — Prove read failure and post-publication failure as separate outcomes

**Disposition: Investigate within the bounded local proof. Confidence: high in ordering; runtime behavior unverified.**

- **Affected task and action:** explain what the analyst is actually viewing after Refresh All fails. Preserve the narrower promise that a failed read before replacement retains the old snapshot. Do not infer unchanged files merely because the overall request rejected.
- **Repository evidence:** `packages/explorEDA/src/server/sources/refresh.ts:readAndWrite` publishes before its awaited `session.close()`; `routes.ts:sourceRoutes` invokes `onRead` and replies afterward. `apps/app/src/App.tsx:refreshSources` stops at the first rejection and reloads completed sources in `finally`; its watcher effect independently reloads detected changes. `refresh.test.ts` contains failed-read retention assertions, inspected but not run.
- **External evidence:** [Power BI's refresh contract](https://learn.microsoft.com/en-us/power-bi/connect-data/asynchronous-refresh) separates processing outcomes; explorEDA's response ordering needs local proof.
- **Cost:** low to moderate for targeted fault scenarios; broader recovery infrastructure is unnecessary. **Alternative:** assume every failure means nothing changed, which the observed ordering cannot justify.
- **Proof:** in the partial-refresh case, accept the recorded new orders/old customers/unattempted returns membership and resulting apparent net **18,000** as the expected mismatch, not as valid reconciliation. Separately inject a read failure, teardown failure, and lost response. Require the report to distinguish retained old data from already published data and unavailable outcome evidence. Reject blanket “failure retained everything” language or claims that watcher/error-message visibility has already passed.

## SF-08 — Keep provenance and selection checks narrow

**Disposition: Adopt the limited evidence record; defer broader identity policy. Confidence: high in metadata gaps; interaction confidence limited.**

- **Affected task and action:** retain fixture state, declared SQL, snapshot bytes, source IDs, and unique order keys with the proof results. This makes a mismatch reviewable without introducing a query-version registry. Check one selected entity across refresh; leave export, undo, reopen, and full selection policy with the queued trust work.
- **Repository evidence:** `packages/explorEDA/src/lib/project/snapshots.ts:SnapshotInfo/SnapshotFile` has completion metadata and format version, but no query fingerprint or preserved result revision. `packages/explorEDA/src/components/project/sourceRowIdentity.ts:sourceRowIdentities/resolveSourceRow` uses entity keys when unique and positional fallback otherwise. `docs/intent/current-analysis-trust/intent-brief.md` owns the wider journey.
- **External evidence:** [PostgreSQL snapshot synchronization](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-SNAPSHOT-SYNCHRONIZATION) explicitly names engine snapshots; existing completion metadata supplies no such identifier.
- **Cost:** low for a proof evidence record and one interaction; high if expanded into historical data retention. **Alternative:** version every query and snapshot before discovering a reproducibility need.
- **Proof:** accept when selected entity O101, represented by source row key `order:O101` in the reconciliation source, remains that entity after insertion/reordering, or becomes visibly unresolved after deletion. Reject silent substitution by row position. Reopening must not be described as reproducing old data unless those exact inputs are retained and used. A discovered selection failure activates the existing queue item rather than expanding this freshness mission.

## SF-09 — Reject platform expansion without new task evidence

**Disposition: Reject for this mission; retain conditional queue entries. Confidence: high.**

- **Affected task and action:** finish the reconciliation decision with one server, one client, one deployed version, and the existing React/TypeScript/pnpm application. Do not turn an invented fixture into demand for cross-engine coordination, CDC, a refresh scheduler, query optimizer, portability layer, or general preparation platform.
- **Repository evidence:** `docs/research/data-preparation-boundary-2026-10-16/decisions.md:DP-09/DP-10` preserves workload gates and rejects platform expansion. `docs/intent/database-query-contract/intent-brief.md:Preparation research follow-up` defers execution placement. The supplied `docs/research/source-freshness-2026-10-18/research-queue.md` separates freshness from identity, workload, author, and warehouse questions.
- **External evidence:** [PostgreSQL snapshot synchronization](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-SNAPSHOT-SYNCHRONIZATION) requires a live export transaction; this capability alone demonstrates no product demand.
- **Cost:** low to maintain activation criteria; high and open-ended to build the rejected platform. **Alternative:** use an upstream producer's prepared data with a declared contract when actual sources cannot share a local scope.
- **Proof:** accept closure when the bounded arithmetic and author checks answer the selected question and the [revised queue](research-queue.md) names any surviving uncertainty. Reject further implementation scope unless it records the author, required grains, failed simpler alternative, material task loss, and one bounded next experiment. No deploy, merge, paid provisioning, live-server test, or repository change is part of these recommendations.
