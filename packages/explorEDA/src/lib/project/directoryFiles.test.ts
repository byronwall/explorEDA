import { describe, expect, it, vi } from "vitest";
import { projectFilesContract } from "@/test/projectFilesContract";
import {
  directoryProjectFiles,
  type DirectoryHandleLike,
  type FileHandleLike,
} from "./directoryFiles";

let clock = 1;

function notFound(name: string) {
  const error = new Error(`${name} not found`);
  error.name = "NotFoundError";
  return error;
}

/** A folder in memory that behaves like a FileSystemDirectoryHandle. */
function fakeDirectory(name = "root"): DirectoryHandleLike & {
  touch(path: string, text: string): void;
} {
  const children = new Map<string, DirectoryHandleLike | FileHandleLike>();
  const directory = {
    kind: "directory" as const,
    name,
    async *entries() {
      for (const entry of children) {
        yield entry;
      }
    },
    async getDirectoryHandle(child: string, options?: { create?: boolean }) {
      const found = children.get(child);
      if (found?.kind === "directory") {
        return found;
      }
      if (found || !options?.create) {
        throw notFound(child);
      }
      const created = fakeDirectory(child);
      children.set(child, created);
      return created;
    },
    async getFileHandle(child: string, options?: { create?: boolean }) {
      const found = children.get(child);
      if (found?.kind === "file") {
        return found;
      }
      if (found || !options?.create) {
        throw notFound(child);
      }
      let text = "";
      let lastModified = clock++;
      const file: FileHandleLike = {
        kind: "file",
        name: child,
        async getFile() {
          return { text: async () => text, lastModified };
        },
        async createWritable() {
          let pending = "";
          return {
            write: async (data: string) => {
              pending += data;
            },
            close: async () => {
              text = pending;
              lastModified = clock++;
            },
          };
        },
      };
      children.set(child, file);
      return file;
    },
    async removeEntry(child: string) {
      if (!children.delete(child)) {
        throw notFound(child);
      }
    },
    touch(path: string, text: string) {
      void (async () => {
        const names = path.split("/");
        let folder: DirectoryHandleLike = directory;
        for (const part of names.slice(0, -1)) {
          folder = await folder.getDirectoryHandle(part, { create: true });
        }
        const handle = await folder.getFileHandle(names.at(-1)!, {
          create: true,
        });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
      })();
    },
  };
  return directory;
}

async function seeded(seed: Record<string, string>) {
  const root = fakeDirectory();
  const files = directoryProjectFiles(root);
  for (const [path, text] of Object.entries(seed)) {
    // Seed through the fake so skipped folders exist too.
    root.touch(path, text);
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
  return files;
}

describe("folder opened in the browser", () => {
  projectFilesContract(seeded);

  it("can't read outside the opened folder", async () => {
    const files = await seeded({});
    await expect(files.read("/etc/hosts")).rejects.toMatchObject({
      code: "missing",
    });
  });

  it("reports files another program changed, but not its own writes", async () => {
    vi.useFakeTimers();
    const root = fakeDirectory();
    root.touch("orders.eda", "row a\n");
    await vi.advanceTimersByTimeAsync(0);
    const files = directoryProjectFiles(root, { pollMs: 100 });
    const seen: string[][] = [];
    const stop = files.watch!((paths) => seen.push(paths));
    await vi.advanceTimersByTimeAsync(10);
    await files.write("mine.eda", "row b\n");
    root.touch("orders.eda", "row c\n");
    await vi.advanceTimersByTimeAsync(150);
    stop();
    vi.useRealTimers();
    expect(seen).toEqual([["orders.eda"]]);
  });
});
