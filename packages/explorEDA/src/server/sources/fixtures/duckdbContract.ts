/** Writes the source contract's tables to a new DuckDB file. */
import { DuckDBInstance } from "@duckdb/node-api";

export const CONTRACT_DUCKDB = `
create table contract_items (
  id integer primary key,
  name varchar,
  amount decimal(12, 2),
  big bigint,
  active boolean,
  created date,
  seen_at timestamp
);
insert into contract_items values
  (1, 'Ada', 12.5, 9007199254740993, true, '2024-01-02', '2024-01-02 03:04:05'),
  (2, 'Zoë', null, 1, false, '2024-02-29', '2024-02-29 23:59:59'),
  (3, '', -0.25, -2, null, null, null),
  (4, null, 1000000, 0, true, '1999-12-31', '1999-12-31 00:00:00');
create table contract_events (kind varchar, n integer);
insert into contract_events values ('click', 1), ('click', 1), ('view', 2);
create table contract_many as select range::integer + 1 as n from range(25);
create table contract_large as select range::integer + 1 as n from range(2500);
create table contract_blob (id integer, data blob);
insert into contract_blob values (1, '\\x00\\xFF'::blob);
`;

export async function writeContractDuckdb(file: string) {
  const instance = await DuckDBInstance.create(file);
  const connection = await instance.connect();
  try {
    await connection.run(CONTRACT_DUCKDB);
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}
