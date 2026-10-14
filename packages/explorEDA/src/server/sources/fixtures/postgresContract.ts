/** Writes the source contract's tables to a PostgreSQL database. */
import pg from "pg";

export const CONTRACT_POSTGRES = `
drop table if exists contract_items, contract_events, contract_many, contract_large, contract_blob;
create table contract_items (
  id integer primary key,
  name text,
  amount numeric(12, 2),
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
create table contract_events (kind text, n integer);
insert into contract_events values ('click', 1), ('click', 1), ('view', 2);
create table contract_many (n integer);
insert into contract_many select generate_series(1, 25);
create table contract_large (n integer);
insert into contract_large select generate_series(1, 2500);
create table contract_blob (id integer, data bytea);
insert into contract_blob values (1, '\\x00ff');
`;

/** The test database's address, from the environment; see docker/test-databases.yaml. */
export const POSTGRES_URL = process.env.EXPLOREDA_TEST_POSTGRES;

export async function writeContractPostgres(url: string) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(CONTRACT_POSTGRES);
  } finally {
    await client.end();
  }
}

/** A connection's settings and secret for a postgres:// address. */
export function postgresSettings(url: string) {
  const parsed = new URL(url);
  return {
    settings: {
      host: parsed.hostname,
      port: parsed.port || "5432",
      database: parsed.pathname.slice(1),
      user: decodeURIComponent(parsed.username),
    },
    secret: decodeURIComponent(parsed.password),
  };
}
