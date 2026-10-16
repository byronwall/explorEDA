---
title: "Warehouse sources"
slug: "warehouse-sources"
phase: intent
status: draft
last_updated: "2026-10-13"
---

# Warehouse sources

## My read

After [database sources](../database-adapters/intent-brief.md) ship, authors will want the same table and SQL sources from cloud warehouses: Snowflake, BigQuery, Redshift, and Databricks. These are deferred because testing them needs real accounts. They also bring auth that a password connection doesn't cover, such as OAuth, key files, and service accounts, and they cost money per query.

## What matters most

- Reuse the database-sources adapter contract, connection text, snapshot cache, and refresh. Add drivers, not a second system.
- Make query cost visible, and don't re-read without the author asking.

## Boundaries

- Same read-only, complete-or-refuse rules as database sources.
- Do not start until the database-sources adapter contract is proven on at least PostgreSQL and SQLite.

## What seems settled

- Deferred until after database sources, because testing needs accounts.
- Warehouses are added as drivers on the database-sources contract.

## Possibilities, not decisions

- Which warehouse comes first, and how to get a test account or emulator for CI.
- Whether warehouse scale makes [server-side queries](../database-query-contract/intent-brief.md) a prerequisite.

## Next step after confirmation

Revisit after database sources ship. Choose the first warehouse and its test account strategy.
