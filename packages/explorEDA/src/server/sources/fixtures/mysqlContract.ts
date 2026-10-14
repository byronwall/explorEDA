/** Writes the source contract's tables to a MySQL database. */
import mysql from "mysql2/promise";

export const CONTRACT_MYSQL = `
drop table if exists contract_items, contract_events, contract_many, contract_large, contract_blob;
create table contract_items (
  id integer primary key,
  name text,
  amount decimal(12, 2),
  big bigint,
  active boolean,
  created date,
  seen_at datetime
);
insert into contract_items values
  (1, 'Ada', 12.5, 9007199254740993, true, '2024-01-02', '2024-01-02 03:04:05'),
  (2, 'Zoë', null, 1, false, '2024-02-29', '2024-02-29 23:59:59'),
  (3, '', -0.25, -2, null, null, null),
  (4, null, 1000000, 0, true, '1999-12-31', '1999-12-31 00:00:00');
create table contract_events (kind text, n integer);
insert into contract_events values ('click', 1), ('click', 1), ('view', 2);
create table contract_many (n integer);
insert into contract_many with recursive seq(n) as (select 1 union all select n + 1 from seq where n < 25) select n from seq;
create table contract_large (n integer);
insert into contract_large with recursive seq(n) as (select 1 union all select n + 1 from seq where n < 2500) select n from seq;
create table contract_blob (id integer, data blob);
insert into contract_blob values (1, x'00ff');
`;

/** The test database's address; see docker/test-databases.yaml. */
export const MYSQL_URL = process.env.EXPLOREDA_TEST_MYSQL;

export async function writeContractMysql(url: string) {
  const connection = await mysql.createConnection({
    uri: url,
    multipleStatements: true,
  });
  try {
    await connection.query("set session cte_max_recursion_depth = 5000");
    await connection.query(CONTRACT_MYSQL);
  } finally {
    await connection.end();
  }
}
