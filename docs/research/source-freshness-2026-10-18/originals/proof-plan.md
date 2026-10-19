# Bounded local proof: related-source freshness

Date: **2026-10-19 UTC**. Research baseline: **`0984715cb4c0c85d0d6efa8436ab38368bd20ae1`**. **Every database experiment, application check, author session, command, and example in this plan is proposed and unexecuted.** The supplied source packet is not a runnable checkout.

The [decision](freshness-decision.md) recommends independent complete snapshots by default and one existing SQL source as the first reconciliation proof. The [recommendations](recommendations.md) and [queue](research-queue.md) retain the activation conditions for any later feature. This plan does not implement an application change.

## 1. Question, cost limit, and early exit

**Can an author reconcile all orders and refunds by current customer region through one correctly shaped SQLite SQL source, with exact membership and measures, without a new grouped-refresh feature?**

- Start with one disposable local SQLite file, two handles where a schedule needs a writer, and the existing SQL source boundary. No external server, account, container, paid service, or provisioning is needed.
- Planning allowance: one short local engine session and at most one half-day author/application session. These are proposed effort bounds, not measured performance promises. Stop and report an access/setup obstacle instead of turning it into environment work.
- If the SQL result is correct and the author can complete the task, **reject new group/platform work**. Preserve only separately authorized documentation/example changes.
- Consider a coherent multi-source implementation proof only after an author identifies a necessary separate source-grain interaction that the SQL result cannot preserve, and the recorded mismatch matters to the task. Start with one engine and one explicit member set.
- Do not run this against production data. The script below deliberately creates disposable data and includes an orphan-data diagnostic counterexample.

## 2. Exact fixture and interpretation

### Grain, keys, and measures

- `customers`: one row per unique text `customerId`; required `name` and current `region`.
- `orders`: one row per unique text `orderId`; required customer foreign key; `amountCents` is a non-null nonnegative integer. Fixed `orderedAt` and `channel` are business fields.
- `returns`: one row per unique text `returnId`; required order foreign key; `refundCents` is a non-null nonnegative integer. This is a new synthetic monetary field, not a claim about the bundled sample's `refunded` type.
- **Gross:** sum each order's amount once. **Refunds:** sum each refund record once. **Raw net:** gross minus refunds. A reconciliation is valid only when its required coverage/identity and read boundary are established.
- **Current-region net:** assign each order's net to the region of its currently read customer. Missing customers are preserved and flagged. Orphan refunds are preserved under a missing-order diagnostic group; they do not become silently valid business results.
- A coherent view can still be old. Region-at-order-time and “all events through a cutoff” are different tasks that this fixture does not claim to answer.

| State or change | Exact rows | Correct outcome, cents |
| --- | --- | --- |
| **S0** | Customers `(C1,Ada,North)`, `(C2,Bea,South)`; orders `(O101,C1,10000)`, `(O102,C2,6000)`; return `(R501,O101,2000)` | Orders 2; returns 1; gross 16,000; refunds 2,000; net 14,000; North 8,000; South 6,000. |
| **B: S0 → S1** | One transaction adds `(C3,Cy,North)`, `(O103,C3,4000)`, `(R502,O103,4000)` | Orders 3; returns 2; gross 20,000; refunds 6,000; net 14,000; North 8,000; South 6,000. |
| **D: S1 → S2** | Update only C1.region to South | Same IDs and money as S1; North 0, South 14,000. |
| **G, a separate branch from S1** | Add `(R503,O101,500)`; do not apply D in this branch | Orders 3; returns 3; gross 20,000; refunds 6,500; net 13,500; North 7,500; South 6,000. |

Expected normal SQL membership is `order:O101,order:O102` at S0 and `order:O101,order:O102,order:O103` at S1/S2/G. The prefix is a proposed source row key, not a database snapshot identifier.

| Reconciliation row | S0 `(region, gross, refund, net, returns)` | S1 `(region, gross, refund, net, returns)` |
| --- | --- | --- |
| `order:O101` | North, 10000, 2000, 8000, 1 | North, 10000, 2000, 8000, 1 |
| `order:O102` | South, 6000, 0, 6000, 0 | South, 6000, 0, 6000, 0 |
| `order:O103` | Absent | North, 4000, 4000, 0, 1 |

At S2 only O101's region changes. At G only O101's refund/net/return count becomes `2500/7500/2`. All normal rows have `orderCount=1`, `missingCustomerCount=0`, and `orphanReturnCount=0`.

The author-facing region control must support these exact checks. Clear its selection before checking global membership and diagnostic counters.

| State | North `(gross, refunds, net)`, cents | South `(gross, refunds, net)`, cents |
| --- | --- | --- |
| S0 | 10000, 2000, 8000 | 6000, 0, 6000 |
| S1 | 14000, 6000, 8000 | 6000, 0, 6000 |
| S2 | 4000, 4000, 0 | 16000, 2000, 14000 |
| G | 14000, 6500, 7500 | 6000, 0, 6000 |

## 3. Ordered schedules and exact falsifiers

Reset from the specified seed before each scenario. Use acknowledged read/commit barriers, not sleeps or “roughly simultaneous” calls. Freeze additional writes during deterministic folder reload checks. Source labels such as `orders@S0` are experimental labels recorded by the harness, never inferred from `readAt`.

| Case, unexecuted | Ordered events | Exact expectation and interpretation |
| --- | --- | --- |
| **F0 — baseline** | Seed S0; finish setup; read each source and the joined SQL | Exact S0 memberships and values above; zero diagnostics. Setup failure stops the proof. |
| **F1 — all reads succeed, mixed views** | Finish orders@S0 and release its implicit read; writer commits B; finish customers@S1, then returns@S1 | Raw net **10,000**; orphan return exactly `{R502}` relative to loaded orders. Database has no orphan in either S0 or S1. Same configured connection and successful reads do not prevent it. |
| **F2 — one existing SQL source** | Start the joined SQL on S0 and obtain its first row; commit B from another handle; drain that query; issue a fresh query after completion | First result is exactly S0; fresh result is exactly S1. No hybrid membership or money. Source publication remains one existing snapshot. |
| **F3 — shared engine view, proposed mechanism** | Reader BEGIN; SELECT orders to establish its read view; writer commits B; reader SELECT customers and returns; reader ROLLBACK; new independent read | Held set is exactly S0; next read is S1. This checks SQLite semantics, not an explorEDA group API. Today's interface does not expose this scope. |
| **F4 — stage independently, publish together** | Acquire F1's inputs into staging; expose the entire staged set with one hypothetical generation switch | The set still has raw net **10,000** and `{R502}`. This is a paper falsification: atomic publication cannot change the acquired rows. A pointer simulation cannot certify actual folder publication. |
| **F5 — partial refresh failure** | Disk has S0; database commits B; request IDs `orders,customers,returns`; orders succeeds/publishes; customers throws before publication; returns is not attempted; allow explicit final reload | Loaded inputs are orders@S1/customers@S0/returns@S0. Gross 20,000; refunds 2,000; raw net **18,000**. Missing-customer order exactly `{O103}`; orphan-return set empty. North 8,000; South 6,000; missing-customer 4,000. |
| **F6 — valid reference restatement** | Establish S1; keep those order/return bytes; commit D; refresh customers only | Exact S2 current-region result: North **0**, South **14,000**, total **14,000**. Different acquisition times alone must not invalidate it. |
| **F7 — grain** | Reset to S1; add R503 to make G; read joined result | O101 refund 2,500, net 7,500, returnCount 2; total net **13,500**. Summing order amounts at return grain instead yields **24,000** gross and is rejected. |

F1's loaded-order inner join can hide R502 and return the plausible 14,000 total. F5's inner customer join can hide O103 and also return 14,000. Neither passes: assert the exact IDs, diagnostic sets, order/return counts, and measures independently. These relational calculations are specified oracles; the packet omits the evaluator necessary to claim observed app behavior.

### Journal-mode control

The overlapping-writer F2/F3 schedule uses **WAL on a disposable local file**. The first actual read establishes the deferred transaction's view; `BEGIN` alone is not a timestamp barrier. SQLite's official transaction/isolation documentation supports these conditions. [SQLite transactions](https://www.sqlite.org/lang_transaction.html), [SQLite isolation](https://www.sqlite.org/isolation.html); accessed 2026-10-19 UTC.

If a later task actually uses rollback journaling, perform one separate control: reader BEGIN and SELECT; writer starts B; attempt writer COMMIT with a short controlled busy timeout. Expect commit to wait/fail busy until the reader releases, then explicitly retry/rollback the writer and record its outcome. Do not label inability to force WAL's interleaving in rollback mode as a failed consistency guarantee. Do not use `BEGIN IMMEDIATE` to manufacture a read-only proof, because it changes writer locking. [SQLite WAL](https://www.sqlite.org/wal.html); accessed 2026-10-19 UTC.

## 4. Proposed self-contained local run sheet

**Not executed in this research.** This standard-library Python script creates only a new temporary directory. It exercises SQLite and computes the expected relational oracles; it does not import, run, or validate explorEDA. It also writes a proposed complete example project for the later app check. `.eda` parsing, rendering, file watchers, and source refresh behavior remain unexecuted gates even if this standalone script later passes.

The SQL normally has one row per order. Orphan refunds add explicit diagnostic rows, with `orderCount=0`, so an all-orphan input is not hidden by an order-driven join. `sum(orderCount)` is the order measure; `count(*)` would include diagnostic rows. Refund aggregation happens before joining to orders. Unique enforced keys are prerequisites; duplicate customer keys require a separate rejected-input decision, not a silently multiplying join.

```bash
# Proposed local proof only. Run outside the repository; no packages to install.
# The directory is intentionally retained so its generated example can be inspected.
freshness_proof_dir="$(mktemp -d "${TMPDIR:-/tmp}/exploreda-freshness.XXXXXX")"
export FRESHNESS_PROOF_DIR="$freshness_proof_dir"

python3 - <<'PY'
import json
import os
from pathlib import Path
import sqlite3

root = Path(os.environ['FRESHNESS_PROOF_DIR']).resolve()
print('[environment]', json.dumps({'python_sqlite': sqlite3.sqlite_version,
                                   'directory': str(root)}))

SEED = """
PRAGMA foreign_keys=ON;
BEGIN;
CREATE TABLE customers (
  customerId TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL, region TEXT NOT NULL
);
CREATE TABLE orders (
  orderId TEXT PRIMARY KEY NOT NULL,
  customerId TEXT NOT NULL REFERENCES customers(customerId),
  amountCents INTEGER NOT NULL CHECK(amountCents >= 0),
  channel TEXT NOT NULL, orderedAt TEXT NOT NULL
);
CREATE TABLE returns (
  returnId TEXT PRIMARY KEY NOT NULL,
  orderId TEXT NOT NULL REFERENCES orders(orderId),
  refundCents INTEGER NOT NULL CHECK(refundCents >= 0),
  returnedAt TEXT NOT NULL
);
INSERT INTO customers VALUES ('C1','Ada','North'),('C2','Bea','South');
INSERT INTO orders VALUES
  ('O101','C1',10000,'Web','2026-10-17T09:00:00Z'),
  ('O102','C2',6000,'Store','2026-10-17T10:00:00Z');
INSERT INTO returns VALUES ('R501','O101',2000,'2026-10-18T08:00:00Z');
COMMIT;
"""
B = """
BEGIN;
INSERT INTO customers VALUES ('C3','Cy','North');
INSERT INTO orders VALUES ('O103','C3',4000,'Web','2026-10-18T09:00:00Z');
INSERT INTO returns VALUES ('R502','O103',4000,'2026-10-18T09:05:00Z');
COMMIT;
"""
QUERY = """
WITH refund_totals AS (
  SELECT orderId, count(*) AS returnCount, sum(refundCents) AS refundCents
  FROM returns GROUP BY orderId
), reconciliation AS (
  SELECT 'order:' || o.orderId AS reconciliationId,
         'order' AS rowKind, o.orderId, o.customerId,
         coalesce(c.region, '[missing customer]') AS region,
         1 AS orderCount, coalesce(r.returnCount, 0) AS returnCount,
         o.amountCents AS grossCents,
         coalesce(r.refundCents, 0) AS refundCents,
         o.amountCents - coalesce(r.refundCents, 0) AS netCents,
         CASE WHEN c.customerId IS NULL THEN 1 ELSE 0 END AS missingCustomerCount,
         0 AS orphanReturnCount
  FROM orders o
  LEFT JOIN customers c ON c.customerId = o.customerId
  LEFT JOIN refund_totals r ON r.orderId = o.orderId
  UNION ALL
  SELECT 'orphan-return:' || r.returnId, 'orphan-return', r.orderId, NULL,
         '[missing order]', 0, 1, 0, r.refundCents, -r.refundCents, 0, 1
  FROM returns r LEFT JOIN orders o ON o.orderId = r.orderId
  WHERE o.orderId IS NULL
)
SELECT * FROM reconciliation ORDER BY reconciliationId
"""
SOURCE_SQL = {
    'orders': 'SELECT * FROM orders ORDER BY orderId',
    'customers': 'SELECT * FROM customers ORDER BY customerId',
    'returns': 'SELECT * FROM returns ORDER BY returnId',
}

def create_case(name):
    db = root / name / 'data' / 'shop.db'
    db.parent.mkdir(parents=True, exist_ok=True)
    writer = sqlite3.connect(db, isolation_level=None, timeout=0.1)
    writer.row_factory = sqlite3.Row
    assert writer.execute('PRAGMA journal_mode=WAL').fetchone()[0] == 'wal'
    writer.executescript(SEED)
    return db, writer

def reader(db):
    connection = sqlite3.connect(db.as_uri() + '?mode=ro', uri=True,
                                 isolation_level=None, timeout=0.1)
    connection.row_factory = sqlite3.Row
    return connection

def rows(connection, query):
    return [dict(row) for row in connection.execute(query).fetchall()]

def all_sources(connection):
    return {name: rows(connection, query) for name, query in SOURCE_SQL.items()}

def oracle(sources):
    orders = {row['orderId']: row for row in sources['orders']}
    customers = {row['customerId']: row for row in sources['customers']}
    refunds = {}
    for row in sources['returns']:
        refunds[row['orderId']] = refunds.get(row['orderId'], 0) + row['refundCents']
    gross = sum(row['amountCents'] for row in orders.values())
    refunded = sum(row['refundCents'] for row in sources['returns'])
    return {
        'orderIds': sorted(orders),
        'returnIds': sorted(row['returnId'] for row in sources['returns']),
        'gross': gross, 'refunds': refunded, 'net': gross - refunded,
        'orphanReturns': sorted(row['returnId'] for row in sources['returns']
                                if row['orderId'] not in orders),
        'missingCustomerOrders': sorted(row['orderId'] for row in orders.values()
                                       if row['customerId'] not in customers),
    }

def show(label, value):
    print('[' + label + ']', json.dumps(value, sort_keys=True))

# F0/F1: separate completed SELECTs can straddle an atomic business commit.
db, writer = create_case('independent')
r = reader(db)
before = all_sources(r)
mixed = {'orders': rows(r, SOURCE_SQL['orders'])}
r.close()
writer.executescript(B)
r = reader(db)
mixed.update({name: rows(r, SOURCE_SQL[name]) for name in ('customers','returns')})
assert oracle(before)['net'] == 14000
assert oracle(mixed)['net'] == 10000
assert oracle(mixed)['orphanReturns'] == ['R502']
show('F1 SQLite independent reads', oracle(mixed))
r.close()
writer.close()

# F2: one result is fixed even when its rows are fetched around a later commit.
db, writer = create_case('single-query')
r = reader(db)
expected_s0 = rows(r, QUERY)
cursor = r.execute(QUERY)
first = cursor.fetchone()
assert first is not None
writer.executescript(B)
held_result = [dict(first)] + [dict(row) for row in cursor.fetchall()]
cursor.close()
assert held_result == expected_s0
after = rows(r, QUERY)
assert [row['reconciliationId'] for row in after] == [
    'order:O101', 'order:O102', 'order:O103']
assert sum(row['netCents'] for row in after) == 14000
show('F2 old result', held_result)
show('F2 subsequent result', after)
r.close()
writer.close()

# F3: explicit shared SQLite read scope. This is not an explorEDA API.
db, writer = create_case('shared-engine-view')
r = reader(db)
r.execute('BEGIN')
held = {'orders': rows(r, SOURCE_SQL['orders'])}  # Actual read pins view.
writer.executescript(B)
held.update({name: rows(r, SOURCE_SQL[name]) for name in ('customers','returns')})
assert held == before
r.execute('ROLLBACK')
assert oracle(all_sources(r))['orderIds'] == ['O101','O102','O103']
show('F3 held source set', oracle(held))
r.close()
writer.close()

# F5 arithmetic oracle only: the real app's failed refresh still needs its check.
db, writer = create_case('partial-failure-oracle')
old = all_sources(writer)
writer.executescript(B)
partial = dict(old)
partial['orders'] = rows(writer, SOURCE_SQL['orders'])
assert oracle(partial)['net'] == 18000
assert oracle(partial)['missingCustomerOrders'] == ['O103']
show('F5 INPUT ORACLE, APP NOT RUN', oracle(partial))
writer.close()

# F6 is a valid current-region restatement; facts do not change.
db, writer = create_case('reference-change')
writer.executescript(B)
facts_before = {name: rows(writer, SOURCE_SQL[name]) for name in ('orders','returns')}
writer.execute("UPDATE customers SET region='South' WHERE customerId='C1'")
assert facts_before == {name: rows(writer, SOURCE_SQL[name]) for name in ('orders','returns')}
result = rows(writer, QUERY)
by_region = {region: sum(row['netCents'] for row in result if row['region']==region)
             for region in ('North','South')}
assert by_region == {'North': 0, 'South': 14000}
show('F6 current-region values', by_region)
writer.close()

# F7 branches directly from S1, with no reference change.
db, writer = create_case('grain')
writer.executescript(B)
writer.execute("INSERT INTO returns VALUES ('R503','O101',500,'2026-10-18T11:00:00Z')")
result = rows(writer, QUERY)
assert sum(row['grossCents'] for row in result) == 20000
assert sum(row['refundCents'] for row in result) == 6500
assert sum(row['netCents'] for row in result) == 13500
show('F7 two refunds on one order', result)
writer.close()

# Diagnostic control: break FK integrity only in this disposable error case.
# No orders must not conceal an orphan refund. This is not a normal state.
db, writer = create_case('diagnostic-orphan')
writer.execute('PRAGMA foreign_keys=OFF')
writer.execute('DELETE FROM orders')
result = rows(writer, QUERY)
assert [row['reconciliationId'] for row in result] == ['orphan-return:R501']
assert result[0]['orderCount'] == 0 and result[0]['orphanReturnCount'] == 1
show('zero-orders diagnostic', result)
writer.close()

# Complete proposed example, seeded at S0; .eda/app compatibility still unverified.
db, writer = create_case('example')
writer.close()
example = db.parent.parent
sql_line = ' '.join(QUERY.split())
project = '''project @freshness-proof

connection @shop driver=sqlite path=data/shop.db

source @orders key=orderId db=shop table=orders
source @customers key=customerId db=shop table=customers
source @returns key=returnId db=shop table=returns
'''
project += '\nsource @reconciliation key=reconciliationId db=shop sql="' + sql_line + '"\n'
(example / 'exploreda.eda').write_text(project, encoding='utf-8')
(example / 'reconciliation.eda').write_text('''eda query=reconciliation
dashboard "Order and refund reconciliation"

view Overview {
  metric @orders sum(reconciliation.orderCount) title=Orders
  metric @refundRecords sum(reconciliation.returnCount) title="Refund records"
  metric @gross sum(reconciliation.grossCents) title="Gross cents"
  metric @refunds sum(reconciliation.refundCents) title="Refunded cents"
  metric @net sum(reconciliation.netCents) title="Net cents"
  metric @missing sum(reconciliation.missingCustomerCount) title="Orders missing customers"
  metric @orphan sum(reconciliation.orphanReturnCount) title="Refunds missing orders"
  row reconciliation.region title="Current customer region"
  table @rows reconciliation.reconciliationId,reconciliation.region,reconciliation.grossCents,reconciliation.refundCents,reconciliation.netCents {
    title="Reconciliation rows"
  }
  layout {
    2: orders gross refunds net
    2: refundRecords missing orphan
    4: reconciliation.region
    6: rows
  }
}
''', encoding='utf-8')
(example / 'business-change.sql').write_text(B, encoding='utf-8')
show('example path', str(example))
print('[scope] SQLite/relational observations only; explorEDA and its tests were not run.')
PY

# Later, from a runnable checkout at the explicitly reviewed baseline:
# EXPLOREDA_FOLDER="$FRESHNESS_PROOF_DIR/example" pnpm --filter app dev
# Open the local link printed by the app. Read reconciliation as one source.
# Record Node and its SQLite version there; Python's version is not Node's version.
```

The script's expected values are assertions to run later, not supplied execution logs. Its F5 section constructs the expected input mix; it does not prove actual `refreshSource`/React behavior. F4 deliberately stays a paper argument. A passing standalone script would settle only the listed engine/oracle checks.

## 5. Exact application check on a later runnable checkout

**Unexecuted.** Prerequisites are the full source at the specified baseline (or a separately recorded reviewed revision), its pinned dependencies, and Node meeting the driver requirement. Do not install or run the attached selected packet as if it were a checkout. Follow the repository's existing pnpm setup and test configuration; no framework or build-system change belongs here. [Packet: `AGENTS.md`, `docs/agent-guide.md`, root `package.json`.]

1. **Bind the evidence.** Record Git commit, Node/SQLite versions, journal mode, input source definitions, exact SQL, unique keys, expected fixture branch, and hashes of snapshot/analysis bytes. Record request order, completion, rename, error, and reload observations separately. Do not assign a database token from `readAt`.
2. **Existing SQL path.** Open the generated example, read only `reconciliation`, and compare every result row, diagnostic counter, and measure with S0. Commit B with the fixture writer and refresh `reconciliation`; compare S1. Then use independent fresh fixtures for D and G. For each state, select North and South in turn and compare gross/refunded/net cents with the region table above. Clear regional selection before checking global membership and diagnostic counters. Inspect zeros as real values and the diagnostic control as an invalid reconciliation; filtering away a diagnostic does not validate the whole source.
3. **Author handoff.** Ask the author to identify the source's normal grain, explain why refunds are aggregated first, locate each order's net, explain current-region D, and describe what the read time establishes. Record whether they need individual original return-row inspection or local cross-source relationships that this result omits. A successful total alone does not pass the handoff.
4. **Actual F5 failure.** Use the existing fake-driver seam with deterministic per-request control for `customers`, while retaining the three-source order `orders,customers,returns`. Seed stored S0 snapshots, arrange new S1 rows, allow orders to publish, throw during customers' read, and assert the requested source list stops there. Use a small wrapper/barrier around the fake for that source; do not pretend its in-memory data model implements a database transaction.
5. **Observe the explicit reload.** Freeze additional writes. Confirm persisted orders are new; customers/returns retain their exact prior hashes; assembled table IDs and measures match F5. Record whether the error report identifies the failed source and unattempted remainder, and whether it survives reload/remount. Missing disclosure is an observed UI finding, not an assumed existing capability or a prerequisite for the SQL correctness proof. `ProjectWorkspace` is absent from the packet, so error survival remains unverified.
6. **One identity interaction.** Select stable entity O101, using source row key `order:O101` in the reconciliation source, refresh a reordered but correctly keyed result, and verify the entity is still O101 or is explicitly unavailable. Do not decide duplicate-key, deletion, undo/export/reopen policy here. Record any mismatch under the existing selection question.

Source seams: `refresh.ts:refreshSource/readAndWrite`; `read.ts:readSnapshot`; `fake.ts:fakeDriver`; `refresh.test.ts`; `folder.ts:readProjectFolder`; `App.tsx:refreshSources/reload` and generation key; `sourceRowIdentity.ts:sourceRowIdentities/resolveSourceRow`. Existing test source includes failure-after-batches, stalls, and connection counts; none ran for this research.

## 6. Failure and visibility gates

These are **unexecuted acceptance criteria**, not an instruction to build every test before the first SQL/author result. The first two rows are relevant to current per-source outcome wording. Group-specific rows activate only if a group earns its conditional implementation proof.

| Fault or observation | Expected check | Cheap rejection gate |
| --- | --- | --- |
| Row cap, byte cap, timeout, cancellation, or driver error during acquisition | The requested source publishes no partial converted data; previous snapshot bytes remain; resources close. Test relevant existing seams, including a failure after one batch. | Any partial source treated as complete invalidates the proof. Do not infer all timeout mechanics from a cooperative fake. |
| Close error, dropped HTTP response, or cancellation after conversion/publication begins | Record whether the file changed independently of request status; a post-rename failure may leave new bytes. The current lifecycle publishes before awaited `close`. | Reject “every failed request retained old data.” A later feature needs an outcome contract that does not call already published content rolled back. |
| Coherent new inputs followed by individual file renames | Force a folder read after orders@S1 replacement and before old customer/return files change | It can assemble F5's 18,000-cent mix despite coherent acquisition. A shared transaction alone has not proved visible-set atomicity. |
| Proposed group staging failure | Fail any required member before the generation switch; make one required snapshot initially absent in a separate case | Prior complete generation stays active; if none exists, group is unavailable. Never claim a valid group from successful members plus missing ones. |
| Proposed group reader binding | Interrupt before, during, and after the single publication boundary; reload/reopen; record generation of every required member | Only all-S0 or all-S1 is visible. Several successful renames, an initiating-client marker, or one React state update do not establish this. |
| Long refresh and event ordering | Observe a request longer than the ten-second own-event suppression window; separately overlap initial load with event subscription; test one failing reload | Record actual events and assembled inputs. No fixed flicker count or exact delivery time is assumed; fix only a demonstrated task failure. |
| Equal/different timestamps | Assign equal completion labels to F1 oracle inputs; use different completion labels for F3's shared view | Never infer shared view from equality, and never reject coherent/unchanged data solely from inequality. |
| Source SQL/connection definition changes under the same source ID | Record old snapshot plus new definition before refresh, then perform explicit refresh | Existing metadata lacks a definition fingerprint. Do not claim historical result identity from source ID and time alone. |

The current local watcher uses path events and the full app registers watching during initial load. Neither is a generation fence. `lib/project/tables.ts` and `ProjectWorkspace.tsx` are absent from the packet, so actual filtering/render/error behavior needs the full checkout. The packet's directory adapter is a separate polling path; it should not be substituted for the local server's SSE evidence.

### Eligibility before expanding to another engine

The first proof is SQLite only. A later named task must pass its own engine eligibility gate before claiming a shared view: PostgreSQL's existing per-read RR lifecycle must be moved to a real shared owner; MySQL must verify InnoDB/RR; SQL Server must have suitable snapshot settings and query semantics; DuckDB's embedded read-only mode needs a close/change/reopen writer schedule. No engine server was available in this mission. Reuse the exact primary sources and settings in the [database matrix](freshness-decision.md#database-matrix-current-official-guarantees-versus-actual-code); do not certify other engines with the fake or Python SQLite.

## 7. Documentation and example shipped with any eventual change

**Proposed scope, unexecuted.** The user-facing milestone must include both of these, following `AGENTS.md:8` and the prior preparation decisions:

- **Docs:** update `apps/demo/src/docs/pages/database-sources.mdx` with “Related sources and read times” after “What a read keeps.” Explain independent reads, read-completion age, current-region attribution, and the distinction between a shared database view and publication. Qualify the broad PostgreSQL/MySQL transaction sentence. Explain that a failed read retains old data and Refresh All can refresh only a prefix.
- **Example:** extend `packages/explorEDA/examples/database/` with the small reconciliation source/analysis and a disposable fixture/change script derived from this run sheet. Include explicit `refundCents`, stable keys, aggregation before joining, the diagnostic policy, and exact S0/S1/D/G expected values. These are proposed future repository paths, not files changed in this research.
- **Demonstration:** an author reads S0, applies B with the fixture writer, refreshes the one source, explains the three resulting orders, and repeats the D/G branches. Show diagnostics and exact cent values; do not claim original return-grain inspection if the prepared source does not provide it.
- **If a group is later implemented:** add one example with a declared required source set, prior-set retention on a member failure, and visible group scope. A publication generation is described as an application version; an actual engine snapshot token, if any, keeps its engine meaning. No scheduler UI or automatic cross-engine promise is included.

The generated `.eda` example must parse and its read/refresh flow must be observed at the repository's wide, intermediate, and narrow checks before being presented as shipped. Use required repository gates only after an actual authorized change. None of those gates ran here.

## 8. Final acceptance record and stop rule

The local reviewer should return one compact evidence record with:

- Exact source/application revision and runtime/journal/settings; input definitions and snapshot-byte hashes.
- F0/F1/F2 results; F3 only as engine comparison; F5 actual-app result distinguished from its oracle; D/G membership and measures.
- One author's task outcome, time spent, lost interactions, and explanation of provenance/grain.
- Any specific failed acceptance criterion, with actual versus expected IDs and values.
- Exactly one disposition: **keep independent + SQL/docs example**, **investigate one eligible coherent group after recorded SQL handoff failure**, or **stop because an access/eligibility gate failed**.

If existing SQL succeeds, close the freshness feature question. If it fails only because the author needs a different analysis grain, carry that precise task into one bounded comparison; do not reopen preparation, transport, query placement, warehouses, or general selection policy without their separate activation evidence.
