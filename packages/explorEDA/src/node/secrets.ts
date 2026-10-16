/**
 * Database passwords on this machine, kept apart from project folders and
 * from the preferences the app reads. They live in `secrets.json` beside
 * `config.json`, readable only by this user. A secret is filed under the
 * server it unlocks, so two projects that name the same database share it,
 * and two that use one name for different databases don't.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { ConnectionDefinition } from "../lib/dsl/project";
import { configDir } from "./globalConfig";

export interface SecretStore {
  get(connection: ConnectionDefinition): Promise<string | undefined>;
  set(connection: ConnectionDefinition, secret: string): Promise<void>;
  remove(connection: ConnectionDefinition): Promise<void>;
}

/** What a secret unlocks: the driver, user, server, and database. */
export function secretKey(connection: ConnectionDefinition) {
  const {
    host = "localhost",
    port = "",
    database = "",
    user = "",
  } = connection.settings;
  const at = user ? `${user}@` : "";
  return `${connection.driver}://${at}${host}${port ? `:${port}` : ""}/${database}`;
}

/** The environment variable that can hold a connection's secret. */
export function secretVariable(connection: ConnectionDefinition) {
  return `EXPLOREDA_${connection.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_PASSWORD`;
}

/** Secrets in a file only this user can read. */
export function fileSecretStore(directory = configDir()): SecretStore {
  const file = path.join(directory, "secrets.json");
  const read = async (): Promise<Record<string, string>> => {
    try {
      const value = JSON.parse(await fs.readFile(file, "utf8")) as unknown;
      return value && typeof value === "object"
        ? (value as Record<string, string>)
        : {};
    } catch {
      return {};
    }
  };
  const write = async (secrets: Record<string, string>) => {
    await fs.mkdir(directory, { recursive: true });
    const temporary = `${file}.${process.pid}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(secrets, null, 2)}\n`, {
      mode: 0o600,
    });
    await fs.rename(temporary, file);
  };
  return {
    async get(connection) {
      return (await read())[secretKey(connection)];
    },
    async set(connection, secret) {
      await write({ ...(await read()), [secretKey(connection)]: secret });
    },
    async remove(connection) {
      const secrets = await read();
      delete secrets[secretKey(connection)];
      await write(secrets);
    },
  };
}

/** Secrets in memory, for tests and the team server's development mode. */
export function memorySecretStore(): SecretStore {
  const secrets = new Map<string, string>();
  return {
    async get(connection) {
      return secrets.get(secretKey(connection));
    },
    async set(connection, secret) {
      secrets.set(secretKey(connection), secret);
    },
    async remove(connection) {
      secrets.delete(secretKey(connection));
    },
  };
}

/**
 * A connection's secret: from its environment variable when that is set,
 * then from the store.
 */
export function resolveSecret(
  store: SecretStore | undefined,
  env = process.env
) {
  return async (connection: ConnectionDefinition) =>
    env[secretVariable(connection)] ?? (await store?.get(connection));
}
