/** The `exploreda` command's arguments, shared with `exploreda mcp`. */
import path from "node:path";
import type { ServerRecord } from "../node/serverFile";
import { EXAMPLES } from "./examples";

export const USAGE = `Usage: exploreda [folder] [options]
       exploreda read [folder] [source...]
       exploreda schema [folder] [connection] [table...] [--match text]
       exploreda schema <file.db|file.duckdb> [table...] [--match text]
       exploreda server --data <folder> [options]
       exploreda mcp [folder] [--example [name]]

Opens a folder as an explorEDA project in your browser. The folder's
exploreda.eda describes its data; each other .eda file is an analysis.

Commands:
  read      read database sources into snapshots, as Refresh does in the
            app; with no sources named, every database source
  schema    list a connection's tables with row counts, or the columns and
            database types of the tables named
  server    run explorEDA for a team (exploreda server --help)
  mcp       an MCP server for agents, on stdin and stdout: it joins the
            exploreda running on the folder, or starts one
            (exploreda mcp --help)

Check project text with exploreda-dsl project <folder>; print its syntax
with exploreda-dsl reference project.

Options:
  --port <n>     first port to try (default 3939; the next free one is used)
  --no-open      print the link instead of opening the browser
  --example [database|forecast]
                 copy a sample project to ./exploreda-example and open it;
                 "database" copies one that reads a SQLite file, and
                 "forecast" one with a notebook
  --hidden       keep a new project's text in .exploreda/ instead of
                 exploreda.eda at the folder's top
  -h, --help     show this help`;

const DEFAULT_PORT = 3939;

export interface Options {
  folder: string;
  port: number;
  open: boolean;
  /** The sample project to copy and open, if any. */
  example?: keyof typeof EXAMPLES;
  hidden: boolean;
}

export function parseArgs(args: string[]): Options | string {
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

/** A started project server, with its record in `.exploreda/server.json`. */
export interface OpenedProject extends ServerRecord {
  folder: string;
  stop(): Promise<void>;
}

/** The folder `parsed` opens: its own, or the sample's copy. */
export function projectFolderOf(parsed: Pick<Options, "folder" | "example">) {
  return path.resolve(
    parsed.example ? EXAMPLES[parsed.example].to : parsed.folder
  );
}
