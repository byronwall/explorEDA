---
title: "Database sources — shape brief"
slug: "database-adapters"
phase: shape
status: draft
last_updated: "2026-10-13"
---

# Database sources — what we are adding

**Outcome:** In the CLI and the self-hosted server, authors use PostgreSQL, SQLite, DuckDB, MySQL, and SQL Server tables or queries as sources, and explore them like files.

**Primary flow:** Name a connection → pick a table or write SQL → the server reads a complete snapshot and caches it → the analysis runs locally on `tables` → the author refreshes when needed.

## Feature scope

```text
Database sources
├── PLANNED ADDITIONS
│   ├── Connections in project text
│   │   ├── Named connection with driver and non-secret settings
│   │   └── Secret resolved outside the project
│   │       ├── CLI: env var or global config
│   │       └── Self-hosted: admin-managed server settings
│   ├── Sources from a connection
│   │   ├── Schema browser: pick a table or view
│   │   └── SQL source: a SELECT becomes a named source
│   ├── Snapshot read
│   │   ├── Read-only transaction, timeout, row and byte caps
│   │   ├── Declared types; lossy or unsupported values fail clearly
│   │   ├── Complete or nothing; an over-limit source is refused with a fix hint
│   │   └── Stable key when declared; snapshot-only row identity otherwise
│   ├── Snapshot cache and refresh
│   │   ├── Opening an analysis uses the cache, never the database
│   │   ├── "Read at" time shown on the source
│   │   └── Refresh: authors only
│   └── Drivers behind one adapter contract
│       ├── PostgreSQL and SQLite first (they shape the boundary)
│       └── Then MySQL, SQL Server, and DuckDB on the same contract suite
└── LATER POSSIBILITIES (own initiatives)
    ├── Warehouse sources
    ├── Server-side queries for data too big to snapshot
    ├── Columnar transport, when snapshot cost is measured
    └── Scheduled refresh; per-viewer database identity (managed tier)
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Source exceeds the limit (100,000 rows by default; `limit=` raises it) | Refused; says the size and suggests `limit=`, a SQL filter, or fewer columns. Nothing is published. |
| Column type isn't supported, or would lose precision | Source fails and names the column and type. |
| SQL source tries to write | Rejected by the read-only transaction; the error is shown. |
| Secret missing in this mode | Source marked unavailable and names the env var or setting it needs. Other sources still load. |
| Viewer opens an analysis | Sees the cached snapshot and its read time. No Refresh button. |
| Refresh fails partway | The previous snapshot stays, and the failure is shown. |

## Examples

The syntax M1 shipped. It extends the CLI's file `source` line:

```text
connection @warehouse driver=postgres host=db.internal database=sales
connection @local     driver=sqlite   path=data/app.db
source @orders  db=warehouse   table=public.orders key=order_id limit=250000
source @active  db=warehouse   sql="select id, region from customers where active"
source @events  db=local       table=events
```

## Decisions and boundaries

**Appetite:** One adapter contract and five drivers. Connection text and secret resolution for two modes. Schema browsing, table and SQL sources, and a cached snapshot with author refresh. No server-side evaluation, warehouses, sampling, or write-back.

**Key decision:** Evaluation stays local. Snapshots feed the existing `ExplorEdaProject.tables`, so charts, filters, and inspection don't change, and this initiative doesn't need to prove SQL parity. The snapshot is a typed data file the server writes into the project's ignored `.exploreda/snapshots/`. That is how the team server already stores fetched URLs, so the cache, change reload, and viewer access all come from what exists. Data too big to snapshot is refused. It is not sampled.

**Boundary:** Ships after self-hosted v1, which stays file-only. Project membership is the access control for viewers. The slug stays `database-adapters` so existing links keep working.

**First proof:** **Try:** Run one adapter contract suite against disposable PostgreSQL and a SQLite fixture with nulls, text, booleans, numbers, dates, and keyed and keyless rows. Then open a CLI project with table and SQL sources, filter, inspect, and refresh. Inject over-limit, unsupported-type, bad-credential, timeout, and write SQL cases. **Observe:** Both drivers pass the same contract. Failures publish nothing. No secret appears in the project folder. Reopening reads from the cache. **Decide:** If one interface serves both drivers, add MySQL, SQL Server, and DuckDB against the suite. If the app needs driver-specific branches, redesign the boundary first.

See the [intent brief](intent-brief.md) and the [implementation plan](implementation-plan.md).
