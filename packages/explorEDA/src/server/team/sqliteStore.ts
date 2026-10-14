/**
 * The team server's durable account store: one SQLite file in the data
 * folder, through Node's built-in `node:sqlite`. The module loads only when
 * a team server starts, so `npx exploreda` still runs on Node versions
 * without it.
 */
import type { DatabaseSync } from "node:sqlite";
import {
  AccountError,
  checkNewAccount,
  checkNewPassword,
  hashPassword,
  LINK_DAYS,
  newSecret,
  normalizeEmail,
  PROJECT_ID,
  SESSION_DAYS,
  sessionKey,
  verifyPassword,
  type Account,
  type AccountStore,
  type ProjectRole,
} from "./accounts";

/** The schema this code writes. Older files are migrated on open. */
export const SCHEMA_VERSION = 1;

/** One SQL script per schema version, run in order inside a transaction. */
export type Migrations = Record<number, string>;

export const MIGRATIONS: Migrations = {
  1: `
    CREATE TABLE accounts (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('author', 'viewer')),
      admin INTEGER NOT NULL DEFAULT 0,
      disabled INTEGER NOT NULL DEFAULT 0,
      hash TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE sessions (
      key TEXT PRIMARY KEY,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    );
    CREATE TABLE password_links (
      key TEXT PRIMARY KEY,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    );
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE members (
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('author', 'viewer')),
      PRIMARY KEY (project_id, account_id)
    );
  `,
};

interface AccountRow {
  id: number;
  email: string;
  name: string;
  kind: "author" | "viewer";
  admin: number;
  disabled: number;
  hash: string | null;
}

const toAccount = (row: AccountRow): Account => ({
  id: String(row.id),
  email: row.email,
  name: row.name,
  kind: row.kind,
  admin: Boolean(row.admin),
  disabled: Boolean(row.disabled),
});

/** Writes a consistent copy of a store file, even while it's in use. */
export async function copyStore(file: string, target: string) {
  const { DatabaseSync } = await loadSqlite();
  const db = new DatabaseSync(file);
  try {
    db.prepare("VACUUM INTO ?").run(target);
  } finally {
    db.close();
  }
}

/** The schema version a store file holds, without changing it. */
export async function storeVersion(file: string) {
  const { DatabaseSync } = await loadSqlite();
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    return (db.prepare("PRAGMA user_version").get() as { user_version: number })
      .user_version;
  } finally {
    db.close();
  }
}

async function loadSqlite() {
  // Node 22 prints an experimental warning the first time; it isn't ours
  // to act on.
  const emit = process.emitWarning;
  process.emitWarning = ((warning: string | Error, ...rest: unknown[]) => {
    const text = typeof warning === "string" ? warning : warning.message;
    if (!text.includes("SQLite")) {
      (emit as (...args: unknown[]) => void).call(process, warning, ...rest);
    }
  }) as typeof process.emitWarning;
  try {
    return await import("node:sqlite");
  } catch {
    throw new Error(
      `The team server needs Node 22.5 or later; this is Node ${process.versions.node}.`
    );
  } finally {
    process.emitWarning = emit;
  }
}

/** The newest schema a set of migrations reaches. */
export const latestSchema = (migrations: Migrations) =>
  Math.max(0, ...Object.keys(migrations).map(Number));

/**
 * Brings a database up to the newest schema, one migration per version.
 * A failed migration rolls back, leaving the database as it was.
 */
export function migrate(db: DatabaseSync, migrations = MIGRATIONS) {
  const target = latestSchema(migrations);
  const current = (
    db.prepare("PRAGMA user_version").get() as { user_version: number }
  ).user_version;
  if (current > target) {
    throw new Error(
      `The account store was written by a newer explorEDA (schema ${current}); this one reads up to ${target}. Run the newer version.`
    );
  }
  for (let version = current + 1; version <= target; version++) {
    db.exec("BEGIN");
    try {
      db.exec(migrations[version]!);
      db.exec(`PRAGMA user_version = ${version}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

export async function sqliteAccountStore(
  file: string,
  { migrations = MIGRATIONS }: { migrations?: Migrations } = {}
): Promise<AccountStore> {
  const { DatabaseSync } = await loadSqlite();
  const db = new DatabaseSync(file);
  try {
    db.exec("PRAGMA foreign_keys = ON;");
    migrate(db, migrations);
    db.exec("PRAGMA journal_mode = WAL;");
  } catch (error) {
    db.close();
    throw error;
  }

  const one = <T>(sql: string, ...params: Array<string | number | null>) =>
    db.prepare(sql).get(...params) as T | undefined;
  const all = <T>(sql: string, ...params: Array<string | number | null>) =>
    db.prepare(sql).all(...params) as T[];
  const run = (sql: string, ...params: Array<string | number | null>) =>
    db.prepare(sql).run(...params);

  const accountRow = (id: string) =>
    one<AccountRow>("SELECT * FROM accounts WHERE id = ?", Number(id));
  const accountByEmail = (email: string) =>
    one<AccountRow>(
      "SELECT * FROM accounts WHERE email = ?",
      normalizeEmail(email)
    );
  const live = (table: "sessions" | "password_links", secret: string) => {
    const row = one<{ account_id: number; expires: number }>(
      `SELECT account_id, expires FROM ${table} WHERE key = ?`,
      sessionKey(secret)
    );
    if (!row || row.expires < Date.now()) {
      return undefined;
    }
    const account = accountRow(String(row.account_id));
    return account && !account.disabled ? toAccount(account) : undefined;
  };

  const store: AccountStore = {
    async accounts() {
      return all<AccountRow>("SELECT * FROM accounts ORDER BY name").map(
        toAccount
      );
    },
    async account(id) {
      const row = accountRow(id);
      return row && toAccount(row);
    },
    async accountByEmail(email) {
      const row = accountByEmail(email);
      return row && toAccount(row);
    },
    async createAccount(input) {
      checkNewAccount(input);
      if (accountByEmail(input.email)) {
        throw new AccountError(
          "exists",
          `${normalizeEmail(input.email)} already has an account.`
        );
      }
      if (input.password !== undefined) {
        checkNewPassword(input.password);
      }
      const hash =
        input.password === undefined
          ? null
          : await hashPassword(input.password);
      const result = run(
        "INSERT INTO accounts (email, name, kind, admin, hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        normalizeEmail(input.email),
        input.name.trim(),
        input.kind,
        input.admin ? 1 : 0,
        hash,
        Date.now()
      );
      return toAccount(accountRow(String(result.lastInsertRowid))!);
    },
    async updateAccount(id, change) {
      const row = accountRow(id);
      if (!row) {
        throw new AccountError("missing", "That account doesn't exist.");
      }
      const next = { ...toAccount(row), ...change };
      run(
        "UPDATE accounts SET name = ?, kind = ?, admin = ?, disabled = ? WHERE id = ?",
        next.name,
        next.kind,
        next.admin ? 1 : 0,
        next.disabled ? 1 : 0,
        Number(id)
      );
      return toAccount(accountRow(id)!);
    },
    async setPassword(id, password) {
      checkNewPassword(password);
      if (!accountRow(id)) {
        throw new AccountError("missing", "That account doesn't exist.");
      }
      run(
        "UPDATE accounts SET hash = ? WHERE id = ?",
        await hashPassword(password),
        Number(id)
      );
    },
    async checkPassword(email, password) {
      const row = accountByEmail(email);
      if (!row?.hash || row.disabled) {
        return undefined;
      }
      return (await verifyPassword(password, row.hash))
        ? toAccount(row)
        : undefined;
    },
    async createSession(accountId) {
      const secret = newSecret();
      run("DELETE FROM sessions WHERE expires < ?", Date.now());
      run(
        "INSERT INTO sessions (key, account_id, expires) VALUES (?, ?, ?)",
        sessionKey(secret),
        Number(accountId),
        Date.now() + SESSION_DAYS * 86_400_000
      );
      return secret;
    },
    async sessionAccount(secret) {
      return live("sessions", secret);
    },
    async endSession(secret) {
      run("DELETE FROM sessions WHERE key = ?", sessionKey(secret));
    },
    async endSessions(accountId) {
      run("DELETE FROM sessions WHERE account_id = ?", Number(accountId));
    },
    async createPasswordLink(accountId) {
      if (!accountRow(accountId)) {
        throw new AccountError("missing", "That account doesn't exist.");
      }
      const secret = newSecret();
      run("DELETE FROM password_links WHERE account_id = ?", Number(accountId));
      run(
        "INSERT INTO password_links (key, account_id, expires) VALUES (?, ?, ?)",
        sessionKey(secret),
        Number(accountId),
        Date.now() + LINK_DAYS * 86_400_000
      );
      return secret;
    },
    async passwordLinkAccount(secret) {
      return live("password_links", secret);
    },
    async usePasswordLink(secret, password) {
      const account = live("password_links", secret);
      if (!account) {
        throw new AccountError(
          "missing",
          "This link has expired or was already used. Ask an admin for a new one."
        );
      }
      checkNewPassword(password);
      run(
        "UPDATE accounts SET hash = ? WHERE id = ?",
        await hashPassword(password),
        Number(account.id)
      );
      run("DELETE FROM password_links WHERE key = ?", sessionKey(secret));
      return account;
    },
    async projects() {
      return all<{ id: string; name: string }>(
        "SELECT id, name FROM projects ORDER BY name"
      ).map(({ id, name }) => ({ id, name }));
    },
    async project(id) {
      const row = one<{ id: string; name: string }>(
        "SELECT id, name FROM projects WHERE id = ?",
        id
      );
      return row && { id: row.id, name: row.name };
    },
    async createProject(project) {
      if (!PROJECT_ID.test(project.id)) {
        throw new AccountError(
          "invalid",
          "A project ID uses lowercase letters, digits, and dashes."
        );
      }
      if (await store.project(project.id)) {
        throw new AccountError("exists", `${project.id} already exists.`);
      }
      run(
        "INSERT INTO projects (id, name, created_at) VALUES (?, ?, ?)",
        project.id,
        project.name,
        Date.now()
      );
      return { id: project.id, name: project.name };
    },
    async members(projectId) {
      return all<{ account_id: number; role: ProjectRole }>(
        "SELECT account_id, role FROM members WHERE project_id = ?",
        projectId
      ).map((row) => ({ accountId: String(row.account_id), role: row.role }));
    },
    async setMember(projectId, member) {
      if (!(await store.project(projectId))) {
        throw new AccountError("missing", "That project doesn't exist.");
      }
      run(
        "INSERT INTO members (project_id, account_id, role) VALUES (?, ?, ?) ON CONFLICT (project_id, account_id) DO UPDATE SET role = excluded.role",
        projectId,
        Number(member.accountId),
        member.role
      );
    },
    close() {
      db.close();
    },
    async removeMember(projectId, accountId) {
      run(
        "DELETE FROM members WHERE project_id = ? AND account_id = ?",
        projectId,
        Number(accountId)
      );
    },
  };
  return store;
}
