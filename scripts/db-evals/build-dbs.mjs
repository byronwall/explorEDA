// Builds the two databases the database UX eval runs against, into
// tmp/db-evals/dbs/ (or the folder given as the first argument):
//
//   nfl.db         SQLite. The 2023 NFL season from nflverse: plays
//                  (~49,665 x 372), games (285 x 46), players (~24,864 x 39).
//   retail.duckdb  DuckDB. TPC-DS at scale factor 1 with about 1% of each fact
//                  table kept by order or ticket number, whole dimensions, and
//                  inventory cut to every 50th item (188,400 rows, over the
//                  100,000-row read limit on purpose).
//
// Usage: node scripts/db-evals/build-dbs.mjs [out-dir]
// Downloads about 30 MB the first time and caches it in <out-dir>/download/.
// The TPC-DS step generates SF 1 (about 1 GB in memory) and takes a minute.
import { createRequire } from "node:module";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const require = createRequire(
  path.join(root, "packages/explorEDA/package.json")
);
const { DuckDBInstance } = require("@duckdb/node-api");

const out = path.resolve(
  process.argv[2] ?? path.join(root, "tmp/db-evals/dbs")
);
const dl = path.join(out, "download");
mkdirSync(dl, { recursive: true });

const DOWNLOADS = {
  "pbp.csv.gz":
    "https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2023.csv.gz",
  "games.csv":
    "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv",
  "players.csv":
    "https://github.com/nflverse/nflverse-data/releases/download/players/players.csv",
};

for (const [file, url] of Object.entries(DOWNLOADS)) {
  const target = path.join(dl, file);
  if (existsSync(target)) {
    continue;
  }
  console.log(`Downloading ${url}`);
  const reply = await fetch(url);
  if (!reply.ok) {
    throw new Error(`${url} answered ${reply.status}`);
  }
  writeFileSync(target, Buffer.from(await reply.arrayBuffer()));
}

const db = await (await DuckDBInstance.create(":memory:")).connect();
const run = (sql) => db.run(sql);
const counts = async (alias) => {
  const tables = await db.runAndReadAll(
    `select table_name from duckdb_tables() where database_name = '${alias}' order by 1`
  );
  for (const [name] of tables.getRows()) {
    const rows = await db.runAndReadAll(
      `select count(*) from ${alias}.${name}`
    );
    const cols = await db.runAndReadAll(
      `select count(*) from duckdb_columns() where database_name = '${alias}' and table_name = '${name}'`
    );
    console.log(
      `  ${name}: ${rows.getRows()[0][0]} rows x ${cols.getRows()[0][0]} columns`
    );
  }
};

await run("install sqlite; load sqlite; install tpcds; load tpcds;");

const nfl = path.join(out, "nfl.db");
rmSync(nfl, { force: true });
await run(`attach '${nfl}' as nfl (type sqlite)`);
await run(
  `create table nfl.plays as select * from read_csv_auto('${dl}/pbp.csv.gz', sample_size=-1)`
);
await run(
  `create table nfl.games as select * from read_csv_auto('${dl}/games.csv', sample_size=-1) where season = 2023`
);
await run(
  `create table nfl.players as select * from read_csv_auto('${dl}/players.csv', sample_size=-1)`
);
console.log("nfl.db");
await counts("nfl");
await run("detach nfl");

const retail = path.join(out, "retail.duckdb");
rmSync(retail, { force: true });
await run("call dsdgen(sf=1)");
await run(`attach '${retail}' as ds (storage_version 'v1.2.0')`);
const facts = {
  store_sales: "ss_ticket_number % 100 = 0",
  store_returns: "sr_ticket_number % 100 = 0",
  catalog_sales: "cs_order_number % 100 = 0",
  catalog_returns: "cr_order_number % 100 = 0",
  web_sales: "ws_order_number % 100 = 0",
  web_returns: "wr_order_number % 100 = 0",
  inventory: "inv_item_sk % 50 = 0",
};
for (const [table, where] of Object.entries(facts)) {
  await run(
    `create table ds.${table} as select * from memory.main.${table} where ${where}`
  );
}
await run(`create table ds.customer as select * from memory.main.customer where c_customer_sk in (
  select ss_customer_sk from ds.store_sales union select cs_bill_customer_sk from ds.catalog_sales
  union select ws_bill_customer_sk from ds.web_sales union select sr_customer_sk from ds.store_returns)`);
await run(`create table ds.customer_demographics as select * from memory.main.customer_demographics where cd_demo_sk in (
  select c_current_cdemo_sk from ds.customer union select ss_cdemo_sk from ds.store_sales
  union select cs_bill_cdemo_sk from ds.catalog_sales union select ws_bill_cdemo_sk from ds.web_sales)`);
await run(`create table ds.customer_address as select * from memory.main.customer_address where ca_address_sk in (
  select c_current_addr_sk from ds.customer union select ss_addr_sk from ds.store_sales
  union select cs_bill_addr_sk from ds.catalog_sales union select ws_bill_addr_sk from ds.web_sales)`);
const done = new Set([
  ...Object.keys(facts),
  "customer",
  "customer_demographics",
  "customer_address",
]);
const all = await db.runAndReadAll(
  "select table_name from duckdb_tables() where database_name = 'memory'"
);
for (const [name] of all.getRows()) {
  if (!done.has(name)) {
    await run(`create table ds.${name} as select * from memory.main.${name}`);
  }
}
console.log("retail.duckdb");
await counts("ds");
await run("detach ds");
console.log(`Wrote ${nfl} and ${retail}`);
