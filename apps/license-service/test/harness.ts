import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createApp } from "../src/app";
import type { Services } from "../src/licenses";
import { MemoryMailer } from "../src/mailer";
import { FakeProvider } from "../src/payments/fake";
import type { PaymentProvider } from "../src/payments/types";
import { Store } from "../src/store";
import devKeys from "../dev-keys.json";

/**
 * D1's statement API over Node's SQLite, running the real migrations, so
 * store queries are tested against SQLite rather than a hand-written fake.
 */
export function sqliteD1(): D1Database {
  const db = new DatabaseSync(":memory:");
  const dir = path.resolve(__dirname, "../migrations");
  for (const file of ["0001_init.sql"]) {
    db.exec(readFileSync(path.join(dir, file), "utf8"));
  }
  const statement = (sql: string, values: unknown[] = []) => ({
    bind: (...next: unknown[]) => statement(sql, next),
    async first<T>() {
      return (db.prepare(sql).get(...(values as never[])) ?? null) as T | null;
    },
    async all<T>() {
      return {
        results: db.prepare(sql).all(...(values as never[])) as T[],
        success: true,
        meta: {},
      };
    },
    async run() {
      db.prepare(sql).run(...(values as never[]));
      return { success: true, meta: {} };
    },
  });
  return {
    prepare: (sql: string) => statement(sql),
  } as unknown as D1Database;
}

export const FAKE_SECRET = "test-fake-secret";
export const ADMIN_TOKEN = "test-admin-token";

export function testServices(
  overrides: Partial<Services> & { clock?: { now: Date } } = {}
) {
  const clock = overrides.clock ?? { now: new Date("2026-11-01T12:00:00Z") };
  const now = () => clock.now;
  const mailer = new MemoryMailer();
  const services: Services = {
    store: new Store(sqliteD1(), now),
    mailer,
    payments: new FakeProvider(FAKE_SECRET) as PaymentProvider,
    signing: { kid: devKeys.kid, privateKey: devKeys.privateKey },
    now,
    config: {
      publicBaseUrl: "https://license.test",
      siteUrl: "https://site.test",
      notifyEmail: "byron@site.test",
      termsVersion: "1.0",
    },
    ...overrides,
  };
  const app = createApp(() => services, { adminToken: ADMIN_TOKEN });
  return { services, mailer, app, clock };
}

/** The license key in an email's text. */
export function keyIn(text: string): string {
  const match = /EDA1\.[\w-]+\.[\w-]+/.exec(text);
  if (!match) throw new Error(`No key in:\n${text}`);
  return match[0];
}
