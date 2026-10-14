---
title: "Database sources — implementation plan"
slug: "database-adapters"
phase: plan
status: draft
last_updated: "2026-10-13"
---

# Database sources — implementation plan

## Plan at a glance

The key implementation move is that **a database snapshot is a data file the server writes into the project**. The team server's URL intake already does this. It downloads a file, writes it inside the project, and records `fetchedAt` in `.exploreda/fetched.json`. Database sources work the same way. On Refresh, the server runs a bounded, read-only read through an adapter. It writes a typed snapshot file and its read record under `.exploreda/snapshots/`. The browser's folder loader then reads that file like any other data file.

This reuses a lot of what exists:

- **Cache:** the snapshot file is the cache.
- **Reload:** file watching and the server-sent change events already reload every open page.
- **Roles:** author and viewer roles already separate who can write from who can only read.
- **Evaluation:** the local evaluator through `tables` is unchanged.
- **Credentials:** they never leave the server.

The order puts one new dependency in each milestone:

1. **SQLite in the CLI, end to end.** It needs no container, secret, or new npm package, because `node:sqlite` already backs the team store. This proves the grammar, adapter port, snapshot file, limits, Refresh, and failure handling.
2. **PostgreSQL** adds the first network driver and secrets outside the project, against the same contract suite. This is where the shape's decision rule applies: if the app needs driver-specific branches, fix the port before adding more drivers.
3. **Schema browser.** Authors add table and SQL sources without writing text.
4. **Self-hosted.** Admin-managed connection secrets, Refresh for authors only, and read time for viewers.
5. **MySQL and SQL Server** on the contract suite.
6. **DuckDB**, after a packaging check, plus launch polish.

Each milestone is one stacked PR, with a changeset and its docs section.

## Implementation strategy

- **First proof:** In `npx exploreda`, a project with `connection @app driver=sqlite path=data/app.db` and a table source opens, filters, and inspects. Refresh rewrites the snapshot, and the open page reloads.
- **Primary seam:** a server-only `SourceAdapter` port:
  - `listSchemas`, `listTables`, `describe(source)`;
  - `read(source, limits, signal)`, which returns typed columns or a typed `SourceReadError`.
  - Above the port, one snapshot writer that is the same for every driver.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/server/sources`. A deterministic fake adapter covers app behavior, and SQLite fixture files cover the contract.
- **Local dependencies:**
  - SQLite files and the fake need nothing extra.
  - PostgreSQL, MySQL, and SQL Server tests use disposable containers. A docker compose file sits under `docker/` for local runs, and GitHub Actions service containers run them in CI.
  - No accounts are needed.
- **Live confirmation:** none is required. Warehouses, which do need accounts, are out of scope.
- **Rollout and rollback:**
  - Database `connection` and `source db=` lines are new syntax, so file projects are untouched.
  - Removing the lines or the snapshot folder returns a project to file-only.
  - The team server gets database sources only after its v1 ships.

### Material dependency proof strategy

```text
app behavior + fake adapter (Refresh, failures, limits, read time, reload)
    → shared contract suite: SQLite file, then PostgreSQL/MySQL/SQL Server containers, DuckDB file
    → CLI smoke (cli-smoke.yml) and team-server smoke with a SQLite source
```

The contract suite checks, for every driver:

- values and declared types for text, booleans, integers, decimals, floats, dates, timestamps with and without zones, and nulls;
- keyed and keyless rows;
- a refusal at `limit + 1` before the whole result is buffered;
- a byte cap;
- a timeout;
- rejection of write SQL;
- a bad-credential error that names the setting;
- the connection released after success, failure, and abort.

## Milestone 1: A SQLite table opens in the CLI from a refreshable snapshot

This proves the whole product loop with no new package and no secret. It leaves out the schema browser, network drivers, and the team server.

- **Change — project grammar for connections and database sources** (`lib/dsl/project.ts`)
  - Add `connection @name driver=sqlite path=…`.
  - Add `source @id db=conn table=…` or `sql="…"`, with optional `key=` and `limit=`.
  - The text uses names only. `path=` follows the existing project-relative rules.
  - Verify: round-trip tests beside the existing source-line tests. A diagnostic is raised when a source names an unknown connection.
- **Change — `SourceAdapter` port, fake adapter, and SQLite adapter** (new `src/server/sources/`)
  - SQLite opens the file read-only through `node:sqlite`, loaded lazily the way `sqliteStore.ts` loads it.
  - Rows stream while counting. The default cap is **100,000 rows**, and `limit=` raises it. A row past the cap stops the read with "orders has more than 100,000 rows; add limit= or narrow it with sql=."
  - The byte cap defaults to 100 MB to match the CLI's file limit. `limit=` doesn't change it. This is a provisional default.
  - Each column type is mapped to a `DeclaredFieldType`. A value that isn't supported, or that would lose precision, names its column.
  - Verify: the contract suite against the fake and against SQLite fixtures under `src/server/sources/fixtures`.
- **Change — snapshot writer and read record**
  - The server writes `.exploreda/snapshots/<sourceId>.json`, a typed envelope of fields with declared types plus rows. It writes a temporary file and renames it, as `writeFetched` does.
  - It records `{ readAt, rows, bytes, connection }` in `.exploreda/snapshots.json`.
  - A failed read leaves the previous snapshot in place.
  - It writes `.exploreda/snapshots/.gitignore` so snapshot data isn't committed.
  - Verify: an interrupted write leaves the old file whole.
- **Change — Refresh route on the local server** (`server/handler.ts`)
  - Add `POST /api/sources/<id>/refresh`, behind the existing run token.
  - It resolves the connection and runs the adapter.
  - The existing watch then broadcasts the change, and open pages reload.
  - Verify: `handler.test.ts` covers a refused token, an unknown source, and success.
- **Change — folder loader reads snapshots** (`lib/project/folder.ts`)
  - A `db=` source reads its snapshot envelope and keeps its declared types.
  - With no snapshot yet, the source is marked missing with "Refresh to read it."
  - Verify: `folder.test.ts` with in-memory `ProjectFiles`.
- **Change — read time and Refresh in the app** (`apps/app`)
  - A database source shows "Read 10 minutes ago" and a Refresh button with a tooltip, and refresh errors appear inline.
  - Verify: `pnpm shot` at 1280, 783, and 390 px.
- **Change — docs and example**
  - Add a "Database sources" docs page with a SQLite section, and an example project with a small `.db` file.

### Desired end state

- A SQLite table source opens, filters, and inspects in the CLI, and Refresh updates every open page.
- The limit, type, and missing-snapshot failures are clear, and none of them deletes the last good snapshot.
- The contract suite passes for the fake and SQLite. `pnpm check` passes.

## Milestone 2: PostgreSQL works with its secret outside the project

This adds one network driver and secret resolution. Everything else reuses Milestone 1.

- **Change — secret resolver for the CLI**
  - A connection reads non-secret settings from its line and the secret from the global config (`ConfigStore`) under `connections.<name>`, or from an environment variable named by the error message.
  - The project folder never contains it.
  - Verify: tests for a missing secret, an env var, and global config. A scan of the written project text finds no secret.
- **Change — PostgreSQL adapter** (`pg`, server-only, loaded lazily)
  - Reads run in a `READ ONLY` transaction with `statement_timeout`.
  - A cursor reads in batches so `limit + 1` stops early.
  - Type mapping covers `numeric` and `bigint`: exact when safe, refused otherwise. It also covers `timestamptz` and `date`.
  - The client is released on every path.
  - Verify: the contract suite against a Postgres service container in CI, and through the docker compose file locally.
- **Change — CI and bundle**
  - Add a `database-contract` job to `ci.yml` with a Postgres service.
  - `verify:lean` confirms that component bundles don't pull in `pg`.
- **Decision gate:** if the app needs driver-specific branches in the port, fix the port before Milestone 5.

### Desired end state

- A Postgres table source and a SQL source work in the CLI with the password in global config.
- Write SQL fails, and so does a bad password, with a clear message.
- The same contract suite passes for SQLite and Postgres.

## Milestone 3: Authors add database sources from the app

- **Change — browse routes:** `GET /api/connections/<name>/schemas` and `/tables`, using `listSchemas` and `listTables` from the port.
- **Change — Add data → Database** (`apps/app/src/AddData.tsx`)
  - Pick a connection, a schema, and a table, or write SQL, and then name the source.
  - This writes the `source` line and runs the first Refresh.
  - Adding a connection writes its line and stores its secret in the global config.
  - Use the shared `FieldMetadata` component for column lists.
  - Verify: tests with the fake adapter, and screenshots at three widths.

### Desired end state

- An author goes from an empty project to a charted Postgres table without editing text.

## Milestone 4: Self-hosted authors refresh and viewers see the read time

This starts after self-hosted v1 ships.

- **Change — admin connections** (`server/team`)
  - Admins add connections, and secrets are stored in the server's SQLite store.
  - Project text names connections the same way it does in the CLI.
- **Change — team routes:** browse and Refresh go under `/api/projects/<id>/`. Refresh is allowed for authors only.
- **Change — viewer view:** viewers see the read time and no Refresh button.
- **Verify:** `teamHandler.test.ts` checks role enforcement, and `team-server-smoke.yml` runs with a SQLite source.

### Desired end state

- An admin adds a Postgres connection, an author builds on it, and a viewer explores the snapshot without any database read.

## Milestone 5: MySQL and SQL Server

- **Change — adapters:** `mysql2` and `mssql`, both server-only and lazy.
  - Each runs a read-only session or transaction with a timeout and a cursor or stream.
  - Each maps its types under the same rules.
- **Change — CI:** add MySQL and SQL Server service containers to the contract job.

### Desired end state

- Four drivers pass one contract suite without app changes.

## Milestone 6: DuckDB and launch polish

- **Spike — DuckDB packaging**
  - Decision required: whether `@duckdb/node-api` ships as a regular dependency.
  - Evidence to gather: its install size and platform binaries under `npx exploreda` on Mac, Linux, and Windows (`cli-smoke.yml`).
  - Fallback: make it an optional install, with an error that gives the install command.
- **Change — DuckDB adapter** on the contract suite.
- **Change — docs:** a complete page that covers every driver, secrets per mode, limits, and setting up a read-only database user.

### Desired end state

- All five drivers are documented and pass the contract suite. The CLI smoke test passes on all three operating systems.

## Open decisions and spikes

- **Snapshot file format.** The typed JSON envelope is simple and reuses the JSON reader. If snapshot size or parse time hurts at 100,000 rows, switch to the Arrow reader that already exists. That switch belongs to [columnar-data-transport](../columnar-data-transport/intent-brief.md). Decide by measuring at Milestone 2.
- **DuckDB packaging** (Milestone 6 spike, above).

## Below the cut line

- Warehouses ([warehouse-sources](../warehouse-sources/intent-brief.md)).
- Server-side queries ([database-query-contract](../database-query-contract/intent-brief.md)).
- Scheduled refresh, refresh by viewers, and per-viewer database identity.
- Sampling or partial snapshots, and write-back.
- A visual query builder beyond table pick and SQL.
