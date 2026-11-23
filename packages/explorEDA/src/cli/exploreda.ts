/* eslint-disable no-console -- a command-line tool prints its results */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, promises as fs, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { globalConfigStore } from "../node/globalConfig";
import { nodeProjectFiles } from "../node/projectFiles";
import { fileSecretStore } from "../node/secrets";
import { startServer } from "../server/server";
import { readCommand, schemaCommand } from "./databaseCommands";
import { EXAMPLES } from "./examples";
import { serverCommand } from "./serverCommand";
import { mcpCommand } from "./mcpRelay";
import {
  parseArgs,
  projectFolderOf,
  USAGE,
  type OpenedProject,
  type Options,
} from "./projectArgs";
import {
  removeServerFile,
  writeServerFile,
  type ServerRecord,
} from "../node/serverFile";

declare const __EXPLOREDA_VERSION__: string;

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
  if (args[0] === "read") {
    return readCommand(args.slice(1));
  }
  if (args[0] === "schema") {
    return schemaCommand(args.slice(1));
  }
  if (args[0] === "server") {
    return serverCommand(args.slice(1), {
      appDir: path.resolve(here, "../app"),
      exampleDir: path.resolve(here, "../examples/shop"),
      version: __EXPLOREDA_VERSION__,
    });
  }
  if (args[0] === "mcp") {
    return mcpCommand(args.slice(1), (options) =>
      openProject(options, here, (line) => console.error(line))
    );
  }
  const parsed = parseArgs(args);
  if (typeof parsed === "string") {
    console.log(parsed);
    return parsed === USAGE ? 0 : 64;
  }
  const opened = await openProject(parsed, here, (line) => console.log(line));
  if (typeof opened === "number") {
    return opened;
  }
  console.log(`
Only this machine can connect. Press Ctrl-C to stop.
Connect an agent: exploreda mcp ${shellPath(agentFolder(opened.folder))}`);
  if (parsed.open) {
    openBrowser(opened.url);
  }
  const stop = () => {
    void opened.stop().then(() => process.exit(0));
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  return undefined;
}

/** The folder as the agent's config should name it: short when it's here. */
function agentFolder(folder: string) {
  const relative = path.relative(process.cwd(), folder);
  return !relative ? "." : relative.startsWith("..") ? folder : relative;
}

/** A path quoted for a shell when it has spaces. */
function shellPath(value: string) {
  return /\s/.test(value) ? JSON.stringify(value) : value;
}

/**
 * Copies the sample if asked, starts the server on the folder, and writes
 * its record. Returns an exit code when it can't.
 */
async function openProject(
  parsed: Options,
  here: string,
  log: (line: string) => void
): Promise<OpenedProject | number> {
  const appDir = path.resolve(here, "../app");
  if (!existsSync(path.join(appDir, "index.html"))) {
    console.error(
      "This copy of exploreda is missing its app files. Reinstall it, or build the package with the app."
    );
    return 70;
  }
  const folder = projectFolderOf(parsed);
  if (parsed.example) {
    const example = EXAMPLES[parsed.example];
    if (existsSync(folder)) {
      log(`Opening the sample project already at ${folder}`);
    } else {
      await copyFolder(path.resolve(here, "../examples", example.from), folder);
      log(`Copied the sample project to ${folder}`);
    }
    // A project skips subfolders that are projects, so the copy stays apart.
    if (
      existsSync(path.resolve("exploreda.eda")) ||
      existsSync(path.resolve(".exploreda"))
    ) {
      log(
        `It is a project of its own: ${path.resolve(".")} doesn't list its files.`
      );
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
      secrets: fileSecretStore(),
      // A path, not a module name, so the bundler leaves it for runtime.
      loadMcp: () =>
        import(pathToFileURL(path.join(here, "exploreda-tools.js")).href),
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
  const record: ServerRecord = {
    url: started.url,
    port: started.port,
    token,
    pid: process.pid,
    version: __EXPLOREDA_VERSION__,
  };
  await writeServerFile(folder, record);
  log(`explorEDA ${__EXPLOREDA_VERSION__}
  Project  ${folder}
  Open     ${started.url}`);
  return {
    ...record,
    folder,
    stop: async () => {
      await removeServerFile(folder);
      await started.close();
    },
  };
}

void main(process.argv.slice(2)).then((code) => {
  if (code !== undefined) {
    process.exitCode = code;
  }
});
