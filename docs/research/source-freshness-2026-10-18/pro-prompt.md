https://github.com/byronwall/explorEDA

# Decide when related sources need one shared moment

Act as a product researcher and database systems reviewer. Give a candid, evidence-based decision. This is research, not implementation.

## Mission and source

Choose the smallest useful product boundary for freshness across related source snapshots. Decide when independent complete snapshots suffice, when users need a coherent database read, and when grouped publication helps without promising database consistency. Favor findings that can change product direction. A valid answer can recommend no new feature.

Baseline: `0984715cb4c0c85d0d6efa8436ab38368bd20ae1` on `codex/data-preparation-research-2026-10-16`. Current preparation branch: `codex/source-freshness-research-2026-10-18`. Application source matches origin/main `b07f3cf3483130f6cc3391bba47a87f616c93321`; the intervening commits contain completed preparation research. That prior review is open at https://github.com/byronwall/explorEDA/pull/451. Do not redo it. The new PR will stack on that branch unless the base merges first.

Use the attached selected source snapshot and its manifest if GitHub cannot expose the exact ref. It is not a runnable checkout. Distinguish baseline files from newly authored research context. Do not claim tests ran. If browsing GitHub, do not substitute main silently for this source commit.

## Access gates

GO only after confirming repository identity, baseline, manifest paths, refresh code, snapshot format, folder reader, UI refresh caller, driver contracts, representative drivers, docs, examples, and prior research. State packet coverage limits.

NO-GO if these required inputs cannot be read, the source belongs to another repository, or current primary sources for decisive database guarantees cannot be accessed. State the smallest missing input. If one optional comparison is inaccessible, mark it unverified and continue only if the main decision still has evidence. Never invent runtime results or product demand.

## Observed starting evidence to verify

- `packages/explorEDA/src/server/sources/refresh.ts`: refreshSource deduplicates overlapping reads for one source, opens and closes a session per source, and publishes one snapshot by file rename. Failed reads retain the old snapshot.
- `packages/explorEDA/src/server/sources/read.ts`: readAt is set when read conversion finishes. It is not a database snapshot token or a claim about business event time.
- `packages/explorEDA/src/lib/project/snapshots.ts`: metadata records sourceId, connection, driver, readAt, count, fields, and notes.
- `apps/app/src/App.tsx`: refreshSources loops over sources. Its finally block reloads after successful reads even when a later read fails. Inspect the full file before making claims about UI visibility or watchers.
- `packages/explorEDA/src/server/sources/types.ts`: sessions expose listTables, read, and close. No explicit shared transaction API appears in that interface.
- The SQLite shop example has orders, customers, and a returns SQL query joined to orders. Local query lookups also join related sources.
- Existing intents defer server query placement and column transport until a named workload needs them. Preparation research rejected a general preparation platform and left an author proof proposed.

Read at minimum AGENTS.md, docs/agent-guide.md, CODING_STANDARDS.md, README.md, package.json; the five files above; source routes, folder.ts, files.ts, file-watch code, driver implementations, refresh tests, fake driver, example project, database-sources.mdx; and the included prior research decisions and intent briefs. Inspect real symbols and cite paths. Broader discovery is allowed when needed.

## Ranked questions

1. For one named orders/customers/returns reconciliation task, what exact incorrect conclusion can mixed snapshots create? Define expected rows and measures before and after a database change. Distinguish changed business data, reference-data updates, and a partial refresh failure. A paper fixture is fine; label it unexecuted.
2. Which guarantees are already present? Separate each source's complete read, one query's database view, consistency across separate queries, file publication, folder reload, UI display, and saved analysis identity. Show what readAt does and does not establish. Do not equate successful Refresh All with one database snapshot.
3. Compare four real alternatives: independent snapshots with clear provenance; one coherent read scope for sources on one database connection; staged reads with grouped publication; an upstream prepared extract or one joined SQL query. Include keep-as-is. Score decision-specific dimensions and reject complexity that lacks a user task. Explain same-connection, different-connection, and different-engine cases separately.
4. Check current official guarantees for SQLite, PostgreSQL, MySQL, SQL Server, and DuckDB. Examine the actual driver statements and transaction scope, rather than assuming one universal isolation setting. Identify engine settings, versions, and server privileges that matter. Explain whether each guarantee applies to the current code. No live servers or paid services are available for this mission.
5. What product vocabulary, docs, and example would help an analyst understand source age and coherence? Compare at most three relevant products using primary documentation. Distinguish UI timestamps, query cache age, data event time, and read consistency. Avoid a general competitor inventory.
6. What is the smallest falsifiable local proof? Provide exact fixture states, schedule of writes/reads/failure, expected membership and measures, acceptance/rejection gates, and the docs section plus runnable example that would accompany any eventual feature. Address selection identity only as an interaction; leave its broader policy to the separate queued question.

## Evidence and scope

Use current primary sources for decisive external claims. Give exact URLs, access dates, short supporting paraphrases, and applicable versions/settings. Separate fact, inference, and proposal. Cite repository paths and symbols for current behavior. A source's read completion time does not establish a shared data moment. Atomic publication does not establish coherent upstream reads. Do not label known timestamps as a database snapshot identifier.

The user is a personal developer. Assume one server, one client, one deployed version. Keep the existing React/TypeScript app and pnpm. No framework migration, compatibility layer, general orchestration platform, distributed transaction coordinator, CDC service, query optimizer, paid provisioning, deploy, or merge. Pro must not change the repository. Larger application changes remain proposals. Do not reopen retired or deferred work as established demand.

Recommend GO for an implementation proof only if a concrete task exposes a material mismatch and the proposed contract fixes it at proportionate cost. Recommend NO-GO for new platform work when honest independent snapshots or upstream SQL suffice. Stop expanding after the ranked questions are answered; do not create an unbounded implementation program.

## Exact deliverable contract

Return four complete UTF-8 Markdown files, plus one ZIP containing exactly those files:

1. `freshness-decision.md`: stand-alone decision, access preflight, executive recommendation, task and expected values, current guarantee table, scored alternatives, database matrix, product comparison, decisive source register, uncertainties, and GO/NO-GO criteria.
2. `recommendations.md`: 6–10 substantive recommendations with stable SF-01 IDs. Each gives affected task, repository and external evidence, cost, alternatives, confidence, adopt/investigate/defer/reject suggestion, and proof. Include things to keep and avoid.
3. `proof-plan.md`: bounded offline/local experiment with fixture data, ordered events, exact expected results, failure cases, cheap rejection gates, and docs/example scope. Label all unexecuted checks. Do not provide a large application implementation.
4. `research-queue.md`: revise the attached ranked queue based on new evidence. Keep useful candidates with activation conditions and next actions. Avoid repetitive lists and duplicate missions.

Name the archive `source-freshness-research.zip`. Provide download links for all five assets, byte counts and SHA-256 hashes, exact inventory, and a short response with the chosen boundary, strongest rejected alternative, unresolved uncertainty, and first proof. If file writing fails, return all four complete files inline with explicit boundaries. Do not claim any local repository file, test, commit, PR, or application behavior was verified by execution unless you actually did it.
