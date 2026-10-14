/** Writes the source contract's tables to a new SQLite file. */
import { loadSqlite } from "../../team/sqliteStore";

export const CONTRACT_SQLITE = `
create table contract_items (
  id integer primary key,
  name text,
  amount numeric,
  big integer,
  active boolean,
  created date,
  seen_at timestamp
);
insert into contract_items values
  (1, 'Ada', 12.5, 9007199254740993, 1, '2024-01-02', '2024-01-02T03:04:05'),
  (2, 'Zoë', null, 1, 0, '2024-02-29', '2024-02-29T23:59:59'),
  (3, '', -0.25, -2, null, null, null),
  (4, null, 1000000, 0, 1, '1999-12-31', '1999-12-31T00:00:00');
create table contract_events (kind text, n integer);
insert into contract_events values ('click', 1), ('click', 1), ('view', 2);
create table contract_many (n integer);
with recursive count(n) as (select 1 union all select n + 1 from count where n < 25)
insert into contract_many select n from count;
create table contract_large (n integer);
with recursive count(n) as (select 1 union all select n + 1 from count where n < 2500)
insert into contract_large select n from count;
create table contract_blob (id integer, data blob);
insert into contract_blob values (1, x'00ff');
`;

export async function writeContractSqlite(file: string) {
  const { DatabaseSync } = await loadSqlite();
  const db = new DatabaseSync(file);
  try {
    db.exec(CONTRACT_SQLITE);
  } finally {
    db.close();
  }
}
