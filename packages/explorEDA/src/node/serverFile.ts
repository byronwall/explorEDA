/**
 * `.exploreda/server.json`: where the running `exploreda` server listens and
 * its key, so `exploreda mcp` can reach it with one fixed config line. Only
 * the owner can read it, git ignores it, and a clean stop removes it.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { SERVER_FILE } from "../lib/project/files";

export interface ServerRecord {
  url: string;
  port: number;
  token: string;
  pid: number;
  version: string;
}

const fileIn = (root: string) => path.join(root, ...SERVER_FILE.split("/"));

export async function writeServerFile(root: string, record: ServerRecord) {
  const target = fileIn(root);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const ignore = path.join(path.dirname(target), ".gitignore");
  const ignored = await fs.readFile(ignore, "utf8").catch(() => "");
  if (!ignored.split(/\r?\n/).includes("server.json")) {
    await fs.writeFile(
      ignore,
      `${ignored}${ignored && !ignored.endsWith("\n") ? "\n" : ""}server.json\n`
    );
  }
  // Remove first, so an older file's looser mode doesn't carry over.
  await fs.rm(target, { force: true });
  await fs.writeFile(target, `${JSON.stringify(record, null, 2)}\n`, {
    mode: 0o600,
  });
}

/** The record, or undefined when there is none or it can't be read. */
export async function readServerFile(
  root: string
): Promise<ServerRecord | undefined> {
  try {
    return JSON.parse(await fs.readFile(fileIn(root), "utf8"));
  } catch {
    return undefined;
  }
}

/** Removes the record if it is still this process's. */
export async function removeServerFile(root: string, pid = process.pid) {
  if ((await readServerFile(root))?.pid === pid) {
    await fs.rm(fileIn(root), { force: true });
  }
}

/** True while a process with this ID runs. */
export function isRunning(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM: it runs, as another user.
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}
