---
title: "Database sources"
slug: "database-adapters"
phase: plan
status: draft
last_updated: "2026-10-13"
---

# Database sources

> **Current status (2026-10-15):** SQLite, DuckDB, PostgreSQL, MySQL, and SQL Server sources have shipped for the CLI and the team server. See [Database sources](../../../apps/demo/src/docs/pages/database-sources.mdx) for current behavior. The text below is the original intent; its notes on what exists today are out of date.

## My read

Authors should be able to use their real databases as explorEDA sources, in the same project folders they already use for CSV and JSON. This targets the two server-backed modes together: the `npx exploreda` CLI and the self-hosted Compose server. It ships after self-hosted v1, which stays file-only.

An author names a connection, browses its schemas, and picks a table or view. When that isn't enough, they write a `SELECT`, and it becomes a named source. explorEDA reads a complete snapshot of each source on the server, caches it, and shows when it was read. The existing local evaluator, charts, filters, and inspection then work on it unchanged. Opening an analysis never queries the database. Only authors refresh. Self-hosted viewers see the author's snapshot.

The first release covers PostgreSQL, SQLite and DuckDB files, MySQL, and SQL Server behind one adapter boundary. Warehouses come later because testing them needs accounts.

## What matters most

- Correct field values, types, nulls, and row identity, or a clear failure.
- Project folders stay safe to commit: no secrets in project text.
- The same project text works in the CLI and on the self-hosted server.
- Opening and filtering stay fast because they run on the cached snapshot.

## The experience you appear to want

An author adds a Postgres connection by name, with the password in an env var or global config. They pick `public.orders` and write a short SQL source for `active_customers`, then join the two in explorEDA as they would join files. The analysis opens on the cached data and shows "read 10 minutes ago." They press Refresh after a load job. On the self-hosted server, an admin holds the secret, and a viewer opens the same analysis without touching the database.

## Boundaries

### Must be true

- explorEDA only reads. Reads run in a read-only transaction with a timeout and row and byte caps. Setup recommends a read-only database user.
- A snapshot is complete and correctly typed, or nothing is published and the reason is clear.
- A source over the limit is refused and the author is told how to narrow it. The default limit is 100,000 rows, and authors can raise it per source.
- Credentials stay on the server and outside the project folder.

### Must be avoided

- Writes, DDL, or write-back of any kind.
- Sampling, or partial data presented as complete.
- Per-viewer database identity or row-level security. That belongs to the managed tier.
- A universal SQL compiler or server-side evaluation of explorEDA steps.

## What seems settled

- CLI and self-hosted together, as a follow-on to self-hosted v1.
- Schema browsing with table and view picks, plus optional author SQL. Joins stay in explorEDA.
- PostgreSQL and SQLite establish the adapter boundary first. MySQL, SQL Server, and DuckDB follow on the same contract.
- A cached snapshot with a visible read time, refreshed only by authors.

## Related work

- [Warehouse sources](../warehouse-sources/intent-brief.md): Snowflake, BigQuery, and others, later.
- [Server-side queries](../database-query-contract/intent-brief.md): for data too big to snapshot, later.
- [Columnar transport](../columnar-data-transport/intent-brief.md): when the measured cost of a snapshot calls for it.
- [Customer-instance hosting](../customer-instance-hosting/intent-brief.md): paused under the managed mode.

## Current reality that matters

`ExplorEdaProject` takes source rows through `tables` and evaluates locally. The CLI project text declares file sources as `source @orders path=… key=…`. No server-side database code exists yet.

## Next step after confirmation

Start Milestone 1 of the [implementation plan](implementation-plan.md).

## Related-source freshness research

The 2026-10-19 [freshness review](../../research/source-freshness-2026-10-18/README.md) keeps independent complete snapshots as the default. Refresh All does not establish a shared database view. Read completion time does not identify one.

First test one existing SQLite SQL source at the task's required grain. A future proof pairs the database-sources guide with a runnable reconciliation example. Shared reads remain deferred until a named author needs separate source grains that SQL cannot preserve. Grouped publication alone cannot fix incompatible reads. No new feature is approved.
