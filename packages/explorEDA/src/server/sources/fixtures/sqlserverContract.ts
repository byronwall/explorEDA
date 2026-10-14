/** Writes the source contract's tables to a SQL Server database. */
import sql from "mssql";

export const CONTRACT_SQLSERVER = `
drop table if exists contract_items, contract_events, contract_many, contract_large, contract_blob, contract_precise;
create table contract_items (
  id int primary key,
  name nvarchar(100),
  amount decimal(12, 2),
  big bigint,
  active bit,
  created date,
  seen_at datetime2(0)
);
insert into contract_items values
  (1, N'Ada', 12.5, 9007199254740993, 1, '2024-01-02', '2024-01-02T03:04:05'),
  (2, N'Zoë', null, 1, 0, '2024-02-29', '2024-02-29T23:59:59'),
  (3, N'', -0.25, -2, null, null, null),
  (4, null, 1000000, 0, 1, '1999-12-31', '1999-12-31T00:00:00');
create table contract_events (kind nvarchar(20), n int);
insert into contract_events values (N'click', 1), (N'click', 1), (N'view', 2);
create table contract_many (n int);
with seq(n) as (select 1 union all select n + 1 from seq where n < 25)
insert into contract_many select n from seq;
create table contract_large (n int);
with seq(n) as (select 1 union all select n + 1 from seq where n < 2500)
insert into contract_large select n from seq option (maxrecursion 3000);
create table contract_blob (id int, data varbinary(10));
insert into contract_blob values (1, 0x00FF);
create table contract_precise (x decimal(19, 2));
insert into contract_precise values (12345678901234567.89), (-0.01);
`;

/** The test server's address; see docker/test-databases.yaml. */
export const SQLSERVER_URL = process.env.EXPLOREDA_TEST_SQLSERVER;

/** Settings for a sqlserver:// address, with the contract database. */
export function sqlServerSettings(url: string) {
  const parsed = new URL(url);
  return {
    settings: {
      host: parsed.hostname,
      port: parsed.port || "1433",
      database: "contract",
      user: decodeURIComponent(parsed.username),
    },
    secret: decodeURIComponent(parsed.password),
  };
}

export async function writeContractSqlServer(url: string) {
  const { settings, secret } = sqlServerSettings(url);
  const config = {
    server: settings.host,
    port: Number(settings.port),
    user: settings.user,
    password: secret,
    options: { encrypt: true, trustServerCertificate: true },
  };
  const master = await new sql.ConnectionPool({
    ...config,
    database: "master",
  }).connect();
  try {
    await master
      .request()
      .query("if db_id('contract') is null create database contract");
  } finally {
    await master.close();
  }
  const pool = await new sql.ConnectionPool({
    ...config,
    database: "contract",
  }).connect();
  try {
    await pool.request().batch(CONTRACT_SQLSERVER);
  } finally {
    await pool.close();
  }
}
