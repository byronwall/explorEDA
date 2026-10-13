/**
 * A project folder the browser opened with the File System Access API
 * (`showDirectoryPicker`, Chromium browsers). The page can read and write
 * only inside that folder, so an absolute path is always missing. Changes
 * made by other programs are found by checking each file's modified time
 * every few seconds.
 */
import {
  isAbsolutePath,
  normalizeProjectPath,
  ProjectFileError,
  SKIPPED_FOLDERS,
  type ProjectFiles,
} from "./files";

/** The parts of the File System Access API this adapter uses. */
export interface DirectoryHandleLike {
  kind: "directory";
  name: string;
  entries(): AsyncIterable<[string, DirectoryHandleLike | FileHandleLike]>;
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<DirectoryHandleLike>;
  getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileHandleLike>;
  removeEntry(name: string): Promise<void>;
}

export interface FileHandleLike {
  kind: "file";
  name: string;
  getFile(): Promise<{ text(): Promise<string>; lastModified: number }>;
  createWritable(): Promise<{
    write(data: string): Promise<void>;
    close(): Promise<void>;
  }>;
}

const isMissing = (error: unknown) =>
  error instanceof Error &&
  (error.name === "NotFoundError" || error.name === "TypeMismatchError");

export function directoryProjectFiles(
  root: DirectoryHandleLike,
  { pollMs = 2000 }: { pollMs?: number } = {}
): ProjectFiles {
  /** Modified times this adapter last saw or wrote, by path. */
  const seen = new Map<string, number>();

  const parts = (path: string, refuse: boolean) => {
    const normalized = isAbsolutePath(path)
      ? undefined
      : normalizeProjectPath(path);
    if (!normalized) {
      throw new ProjectFileError(
        refuse ? "refused" : "missing",
        path,
        refuse
          ? `${path} is outside the project folder, so it can't be written.`
          : `${path} is outside the opened folder, so the browser can't read it.`
      );
    }
    return normalized.split("/");
  };

  const folderOf = async (names: string[], create: boolean) => {
    let folder = root;
    for (const name of names) {
      folder = await folder.getDirectoryHandle(name, { create });
    }
    return folder;
  };

  const fileHandle = async (path: string) => {
    const names = parts(path, false);
    try {
      const folder = await folderOf(names.slice(0, -1), false);
      return await folder.getFileHandle(names.at(-1)!);
    } catch (error) {
      if (isMissing(error)) {
        throw new ProjectFileError("missing", path, `${path} doesn't exist.`);
      }
      throw error;
    }
  };

  const list = async () => {
    const found: Array<{ path: string; handle: FileHandleLike }> = [];
    const walk = async (folder: DirectoryHandleLike, prefix: string) => {
      for await (const [name, handle] of folder.entries()) {
        if (SKIPPED_FOLDERS.has(name)) {
          continue;
        }
        const path = prefix ? `${prefix}/${name}` : name;
        if (handle.kind === "directory") {
          await walk(handle, path);
        } else {
          found.push({ path, handle });
        }
      }
    };
    await walk(root, "");
    return found.sort((a, b) => a.path.localeCompare(b.path));
  };

  return {
    async list() {
      return (await list()).map((item) => item.path);
    },
    async read(path) {
      const file = await (await fileHandle(path)).getFile();
      seen.set(normalizeProjectPath(path)!, file.lastModified);
      return file.text();
    },
    async write(path, text) {
      const names = parts(path, true);
      const folder = await folderOf(names.slice(0, -1), true);
      const handle = await folder.getFileHandle(names.at(-1)!, {
        create: true,
      });
      // The browser writes to a copy and swaps it in on close.
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      seen.set(names.join("/"), (await handle.getFile()).lastModified);
    },
    async remove(path) {
      const names = parts(path, true);
      try {
        const folder = await folderOf(names.slice(0, -1), false);
        await folder.removeEntry(names.at(-1)!);
      } catch (error) {
        if (!isMissing(error)) {
          throw error;
        }
      }
      seen.delete(names.join("/"));
    },
    watch(onChange) {
      let stopped = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const check = async () => {
        const changed: string[] = [];
        const present = new Set<string>();
        for (const { path, handle } of await list()) {
          present.add(path);
          const modified = (await handle.getFile()).lastModified;
          if (seen.has(path) && seen.get(path) !== modified) {
            changed.push(path);
          } else if (!seen.has(path)) {
            changed.push(path);
          }
          seen.set(path, modified);
        }
        for (const path of [...seen.keys()]) {
          if (!present.has(path)) {
            seen.delete(path);
            changed.push(path);
          }
        }
        return changed;
      };
      // The first pass records what is there; later passes report changes.
      const loop = async (first: boolean) => {
        const changed = await check().catch(() => []);
        if (stopped) {
          return;
        }
        if (!first && changed.length) {
          onChange(changed.sort());
        }
        timer = setTimeout(() => void loop(false), pollMs);
      };
      void loop(true);
      return () => {
        stopped = true;
        if (timer) {
          clearTimeout(timer);
        }
      };
    },
  };
}
