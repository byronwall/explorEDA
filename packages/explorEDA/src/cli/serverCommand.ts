/* eslint-disable no-console -- a command-line tool prints its results */
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { memoryAccountStore, type AccountStore } from "../server/team/accounts";
import { openDataFolder, STORE_FILE } from "../server/team/dataFolder";
import { sqliteSecretStore } from "../server/team/sqliteStore";
import { memorySecretStore, type SecretStore } from "../node/secrets";
import { DEV_ACCOUNTS, DEV_PASSWORD, seedDev } from "../server/team/seed";
import { createTeamHandler } from "../server/team/teamHandler";
import { startHttpServer } from "../server/server";

export const SERVER_USAGE = `Usage: exploreda server --data <folder> [options]

Runs explorEDA for a team: people sign in, and authors share projects
with viewers. Projects are folders under <folder>/projects.

Options:
  --data <folder>     where projects and accounts are kept (required)
  --port <n>          port to listen on (default 8080)
  --host <address>    address to listen on (default 0.0.0.0)
  --public-url <url>  the address people open, such as https://eda.example.com
  --upload-limit <MB> the largest data file to upload or download (default 100)
  --seed-dev          try it out: sample accounts and a sample project,
                      with accounts kept in memory instead of the data folder
  -h, --help          show this help

Each option can also come from the environment, as in a container:
EXPLOREDA_DATA, EXPLOREDA_PORT, EXPLOREDA_HOST, EXPLOREDA_PUBLIC_URL, and
EXPLOREDA_UPLOAD_LIMIT. Options on the command line win.`;

interface ServerOptions {
  data?: string;
  port: number;
  host: string;
  publicUrl?: string;
  seedDev: boolean;
  uploadLimitMb: number;
}

/** Settings from the environment; an empty value counts as unset. */
function fromEnvironment(env: NodeJS.ProcessEnv) {
  const value = (name: string) => env[name]?.trim() || undefined;
  return [
    ...(value("EXPLOREDA_DATA") ? ["--data", value("EXPLOREDA_DATA")!] : []),
    ...(value("EXPLOREDA_PORT") ? ["--port", value("EXPLOREDA_PORT")!] : []),
    ...(value("EXPLOREDA_HOST") ? ["--host", value("EXPLOREDA_HOST")!] : []),
    ...(value("EXPLOREDA_PUBLIC_URL")
      ? ["--public-url", value("EXPLOREDA_PUBLIC_URL")!]
      : []),
    ...(value("EXPLOREDA_UPLOAD_LIMIT")
      ? ["--upload-limit", value("EXPLOREDA_UPLOAD_LIMIT")!]
      : []),
  ];
}

export function parseServerArgs(
  args: string[],
  env: NodeJS.ProcessEnv = {}
): ServerOptions | string {
  const options: ServerOptions = {
    port: 8080,
    host: "0.0.0.0",
    seedDev: false,
    uploadLimitMb: 100,
  };
  args = [...fromEnvironment(env), ...args];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    const value = () => args[++index];
    if (arg === "-h" || arg === "--help") {
      return SERVER_USAGE;
    } else if (arg === "--data") {
      options.data = value();
    } else if (arg === "--host") {
      options.host = value() ?? "";
    } else if (arg === "--public-url") {
      options.publicUrl = value();
    } else if (arg === "--seed-dev") {
      options.seedDev = true;
    } else if (arg === "--upload-limit") {
      const limit = Number(value());
      if (!Number.isFinite(limit) || limit <= 0) {
        return `--upload-limit needs a size in megabytes.\n\n${SERVER_USAGE}`;
      }
      options.uploadLimitMb = limit;
    } else if (arg === "--port") {
      const port = Number(value());
      if (!Number.isInteger(port) || port < 0 || port > 65535) {
        return `--port needs a number from 0 to 65535.\n\n${SERVER_USAGE}`;
      }
      options.port = port;
    } else {
      return `Unknown option ${arg}.\n\n${SERVER_USAGE}`;
    }
  }
  if (!options.data) {
    return `Give a data folder with --data.\n\n${SERVER_USAGE}`;
  }
  if (options.publicUrl) {
    try {
      const url = new URL(options.publicUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error();
      }
    } catch {
      return `--public-url needs an http or https address.\n\n${SERVER_USAGE}`;
    }
  }
  return options;
}

export async function serverCommand(
  args: string[],
  paths: { appDir: string; exampleDir: string; version: string }
) {
  const parsed = parseServerArgs(args, process.env);
  if (typeof parsed === "string") {
    console.log(parsed);
    return parsed === SERVER_USAGE ? 0 : 64;
  }
  if (!existsSync(path.join(paths.appDir, "index.html"))) {
    console.error(
      "This copy of exploreda is missing its app files. Reinstall it, or build the package with the app."
    );
    return 70;
  }
  const dataDir = path.resolve(parsed.data!);
  await fs.mkdir(path.join(dataDir, "projects"), { recursive: true });
  let store: AccountStore;
  let secrets: SecretStore;
  if (parsed.seedDev) {
    store = memoryAccountStore();
    secrets = memorySecretStore();
    await seedDev(store, dataDir, paths.exampleDir);
  } else {
    try {
      const opened = await openDataFolder(dataDir, { version: paths.version });
      store = opened.store;
      secrets = await sqliteSecretStore(path.join(dataDir, STORE_FILE));
      if (opened.upgrade) {
        const { from, to, backup } = opened.upgrade;
        console.log(
          `Upgraded the account store from schema ${from} to ${to}. The earlier copy is in ${backup}.`
        );
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return 70;
    }
  }
  const handle = createTeamHandler({
    store,
    dataDir,
    version: paths.version,
    appDir: paths.appDir,
    publicUrl: parsed.publicUrl,
    uploadLimit: Math.round(parsed.uploadLimitMb * 1024 * 1024),
    secrets,
  });
  const started = await startHttpServer({
    handle,
    port: parsed.port,
    host: parsed.host,
    tries: 1,
    link: (port) => parsed.publicUrl ?? `http://localhost:${port}/`,
  }).catch((error: NodeJS.ErrnoException) => {
    console.error(
      error.code === "EADDRINUSE"
        ? `Port ${parsed.port} is busy. Pick another with --port.`
        : `Couldn't start the server: ${error.message}`
    );
    return undefined;
  });
  if (!started) {
    return 69;
  }
  console.log(`explorEDA team server ${paths.version}
  Data  ${dataDir}
  Open  ${started.url}`);
  if (!parsed.seedDev && !(await store.accounts()).length) {
    console.log("\nOpen the address above to create the admin account.");
  }
  if (parsed.seedDev) {
    console.log(
      `\nSample accounts, kept in memory, all with password ${DEV_PASSWORD}:`
    );
    for (const account of DEV_ACCOUNTS) {
      console.log(`  ${account.email.padEnd(18)} ${account.kind}`);
    }
  }
  const stop = () => {
    void started.close().then(() => {
      store.close?.();
      process.exit(0);
    });
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  return undefined;
}
