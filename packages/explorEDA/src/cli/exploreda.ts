/* eslint-disable no-console -- a command-line tool prints its results */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, promises as fs, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globalConfigStore } from "../node/globalConfig";
import { nodeProjectFiles } from "../node/projectFiles";
import { startServer } from "../server/server";
import { serverCommand } from "./serverCommand";

declare const __EXPLOREDA_VERSION__: string;

const USAGE = `Usage: exploreda [folder] [options]

Opens a folder as an explorEDA project in your browser. The folder's
exploreda.eda describes its data; each other .eda file is an analysis.

Options:
  --port <n>     first port to try (default 3939; the next free one is used)
  --no-open      print the link instead of opening the browser
  --example [database]
                 copy a sample project to ./exploreda-example and open it;
                 "database" copies one that reads a SQLite file instead
  --hidden       keep a new project's text in .exploreda/ instead of
                 exploreda.eda at the folder's top
  -h, --help     show this help`;

const DEFAULT_PORT = 3939;

interface Options {
  folder: string;
  port: number;
  open: boolean;
  /** The sample project to copy and open, if any. */
  example?: "shop" | "database";
  hidden: boolean;
}

/** Sample projects, by the name `--example` takes, with their folders. */
const EXAMPLES = {
  shop: { from: "shop", to: "exploreda-example" },
  database: { from: "database", to: "exploreda-example-database" },
} as const;

function parseArgs(args: string[]): Options | string {
  const options: Options = {
    folder: ".",
    port: DEFAULT_PORT,
    open: true,
    hidden: false,
  };
  const positional: string[] = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "-h" || arg === "--help") {
      return USAGE;
    }
    if (arg === "--no-open") {
      options.open = false;
    } else if (arg === "--example") {
      const name = args[index + 1];
      if (name && name in EXAMPLES) {
        options.example = name as keyof typeof EXAMPLES;
        index += 1;
      } else {
        options.example = "shop";
      }
    } else if (arg === "--hidden") {
      options.hidden = true;
    } else if (arg === "--port") {
      const port = Number(args[++index]);
      if (!Number.isInteger(port) || port < 0 || port > 65535) {
        return `--port needs a number from 0 to 65535.\n\n${USAGE}`;
      }
      options.port = port;
    } else if (arg.startsWith("-")) {
      return `Unknown option ${arg}.\n\n${USAGE}`;
    } else {
      positional.push(arg);
    }
  }
  if (positional.length > 1) {
    return `Give one folder.\n\n${USAGE}`;
  }
  options.folder = positional[0] ?? ".";
  return options;
}

function openBrowser(url: string) {
  const [command, args] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url.replace(/&/g, "^&")]]
        : ["xdg-open", [url]];
  const child = spawn(command, args, { stdio: "ignore", detached: true });
  child.on("error", () => {
    console.log("Couldn't open a browser; open the link above.");
  });
  child.unref();
}

async function copyFolder(from: string, to: string) {
  await fs.mkdir(to, { recursive: true });
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await copyFolder(source, target);
    } else {
      await fs.copyFile(source, target);
    }
  }
}

async function main(args: string[]) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  if (args[0] === "server") {
    return serverCommand(args.slice(1), {
      appDir: path.resolve(here, "../app"),
      exampleDir: path.resolve(here, "../examples/shop"),
      version: __EXPLOREDA_VERSION__,
    });
  }
  const parsed = parseArgs(args);
  if (typeof parsed === "string") {
    console.log(parsed);
    return parsed === USAGE ? 0 : 64;
  }
  const appDir = path.resolve(here, "../app");
  if (!existsSync(path.join(appDir, "index.html"))) {
    console.error(
      "This copy of exploreda is missing its app files. Reinstall it, or build the package with the app."
    );
    return 70;
  }
  let folder = path.resolve(parsed.folder);
  if (parsed.example) {
    const example = EXAMPLES[parsed.example];
    folder = path.resolve(example.to);
    if (!existsSync(folder)) {
      await copyFolder(path.resolve(here, "../examples", example.from), folder);
      console.log(`Copied the sample project to ${folder}`);
    }
  }
  if (!existsSync(folder) || !statSync(folder).isDirectory()) {
    console.error(`${parsed.folder} isn't a folder.`);
    return 66;
  }
  const token = randomBytes(24).toString("base64url");
  let started: Awaited<ReturnType<typeof startServer>>;
  try {
    started = await startServer({
      files: nodeProjectFiles(folder),
      token,
      version: __EXPLOREDA_VERSION__,
      appDir,
      hidden: parsed.hidden,
      config: globalConfigStore(),
      port: parsed.port,
    });
  } catch (error) {
    console.error(
      (error as NodeJS.ErrnoException).code === "EADDRINUSE"
        ? `Ports ${parsed.port}–${parsed.port + 19} are busy. Pick another with --port.`
        : `Couldn't start the server: ${error instanceof Error ? error.message : String(error)}`
    );
    return 69;
  }
  console.log(`explorEDA ${__EXPLOREDA_VERSION__}
  Project  ${folder}
  Open     ${started.url}

Only this machine can connect. Press Ctrl-C to stop.`);
  if (parsed.open) {
    openBrowser(started.url);
  }
  const stop = () => {
    void started.close().then(() => process.exit(0));
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  return undefined;
}

void main(process.argv.slice(2)).then((code) => {
  if (code !== undefined) {
    process.exitCode = code;
  }
});
