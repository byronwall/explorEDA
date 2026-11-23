/**
 * `exploreda mcp [folder]`: an MCP server on stdin and stdout that relays
 * each message to the running server's `/mcp`, so an agent's config is one
 * fixed line. It finds the server in `.exploreda/server.json`, and starts
 * one in this process when none runs.
 */
import { createInterface } from "node:readline";
import {
  isRunning,
  readServerFile,
  type ServerRecord,
} from "../node/serverFile";
import {
  parseArgs,
  projectFolderOf,
  type OpenedProject,
  type Options,
} from "./projectArgs";

export const MCP_USAGE = `Usage: exploreda mcp [folder] [--example [name]] [--hidden] [--port <n>]

An MCP server for agents, on stdin and stdout. It joins the exploreda
already running on the folder, or starts one and prints its link here.
Add it to an agent once, for example:

  claude mcp add exploreda -- npx exploreda mcp /path/to/folder`;

type Open = (options: Options) => Promise<OpenedProject | number>;

/**
 * Sends one JSON-RPC message to the folder's server and returns its reply
 * text, or undefined for a notification. A refused connection or a stale
 * key rereads the record once; with no server running, `start` opens one.
 */
export function createRelay(
  folder: string,
  start: () => Promise<ServerRecord | undefined>
) {
  let record: ServerRecord | undefined;
  const find = async () => {
    const saved = await readServerFile(folder);
    if (saved && isRunning(saved.pid)) {
      return saved;
    }
    return start();
  };
  const post = (target: ServerRecord, body: string) =>
    fetch(`http://127.0.0.1:${target.port}/mcp`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${target.token}`,
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body,
    });
  return async (body: string): Promise<string | undefined> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      record ??= await find();
      if (!record) {
        throw new Error(`No exploreda server runs on ${folder}.`);
      }
      let response: Response;
      try {
        response = await post(record, body);
      } catch {
        record = undefined;
        continue;
      }
      if (response.status === 401 || response.status === 403) {
        record = undefined;
        continue;
      }
      const text = await response.text();
      return response.status === 202 || !text ? undefined : text;
    }
    throw new Error(
      `Couldn't reach the exploreda server on ${folder}. Stop it and run exploreda mcp again.`
    );
  };
}

export async function mcpCommand(args: string[], open: Open) {
  if (args.includes("-h") || args.includes("--help")) {
    console.error(MCP_USAGE);
    return 0;
  }
  const parsed = parseArgs([...args, "--no-open"]);
  if (typeof parsed === "string") {
    console.error(parsed.replace(/Usage:[\s\S]*/, MCP_USAGE));
    return 64;
  }
  const folder = projectFolderOf(parsed);
  let opened: OpenedProject | undefined;
  const relay = createRelay(folder, async () => {
    if (opened) {
      return opened;
    }
    const result = await open(parsed);
    if (typeof result === "number") {
      return undefined;
    }
    opened = result;
    console.error("Started for this agent; it stops when the agent does.");
    return opened;
  });

  // One message per line, answered in order.
  let queue = Promise.resolve();
  const lines = createInterface({ input: process.stdin });
  lines.on("line", (line) => {
    if (!line.trim()) return;
    queue = queue.then(async () => {
      try {
        const reply = await relay(line);
        if (reply) process.stdout.write(`${reply.trim()}\n`);
      } catch (error) {
        let id: unknown = null;
        try {
          id = JSON.parse(line).id ?? null;
        } catch {
          // The id can't be read from a line that isn't JSON.
        }
        process.stdout.write(
          `${JSON.stringify({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32603,
              message: error instanceof Error ? error.message : String(error),
            },
          })}\n`
        );
      }
    });
  });
  await new Promise((resolve) => lines.once("close", resolve));
  await queue;
  await opened?.stop();
  return 0;
}
