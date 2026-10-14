/**
 * The project's files, by path relative to the project folder, with `/`
 * between parts. The server reads them from disk, the demo through the
 * browser's folder access, and tests from memory. An absolute path names a
 * file outside the project, which can be read but never written.
 */
export interface ProjectFiles {
  /** Every file in the folder, skipping `.git` and `node_modules`. */
  list(): Promise<string[]>;
  /** Throws a `ProjectFileError` with code `missing` when there is none. */
  read(path: string): Promise<string>;
  write(path: string, text: string): Promise<void>;
  remove(path: string): Promise<void>;
  /** Calls back with the paths that changed outside this adapter's writes. */
  watch?(onChange: (paths: string[]) => void): () => void;
}

export type ProjectFileErrorCode = "missing" | "refused" | "unreadable";

export class ProjectFileError extends Error {
  constructor(
    readonly code: ProjectFileErrorCode,
    readonly path: string,
    message: string
  ) {
    super(message);
    this.name = "ProjectFileError";
  }
}

/** Folders a project never lists. */
export const SKIPPED_FOLDERS = new Set([".git", "node_modules"]);

/** True for a path that starts at a drive or the file-system root. */
export function isAbsolutePath(path: string) {
  return /^([A-Za-z]:[\\/]|[\\/])/.test(path);
}

/**
 * A project-relative path with `/` separators, or undefined when it leaves
 * the folder, as `../data.csv` does.
 */
export function normalizeProjectPath(path: string): string | undefined {
  const parts: string[] = [];
  for (const part of path.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      if (!parts.length) {
        return undefined;
      }
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.length ? parts.join("/") : undefined;
}

export interface MemoryProjectFiles extends ProjectFiles {
  /** The current files, for checks in tests. */
  snapshot(): Record<string, string>;
  /** Changes a file as another program would, and tells watchers. */
  editOutside(path: string, text: string | undefined): void;
}

/**
 * Files in memory. `refuse` makes chosen writes fail, so a test can check
 * how the app treats a refused save.
 */
export function memoryProjectFiles(
  initial: Record<string, string> = {},
  { refuse }: { refuse?: (path: string) => boolean } = {}
): MemoryProjectFiles {
  const files = new Map(Object.entries(initial));
  const watchers = new Set<(paths: string[]) => void>();
  const writable = (path: string) => {
    const normalized = isAbsolutePath(path)
      ? undefined
      : normalizeProjectPath(path);
    if (!normalized || refuse?.(normalized)) {
      throw new ProjectFileError(
        "refused",
        path,
        `${path} is outside the project folder, so it can't be written.`
      );
    }
    return normalized;
  };
  return {
    async list() {
      return [...files.keys()]
        .filter(
          (path) =>
            !isAbsolutePath(path) &&
            !path.split("/").some((part) => SKIPPED_FOLDERS.has(part))
        )
        .sort();
    },
    async read(path) {
      const key = isAbsolutePath(path)
        ? path
        : (normalizeProjectPath(path) ?? path);
      const text = files.get(key);
      if (text === undefined) {
        throw new ProjectFileError("missing", path, `${path} doesn't exist.`);
      }
      return text;
    },
    async write(path, text) {
      files.set(writable(path), text);
    },
    async remove(path) {
      files.delete(writable(path));
    },
    watch(onChange) {
      watchers.add(onChange);
      return () => watchers.delete(onChange);
    },
    snapshot() {
      return Object.fromEntries(files);
    },
    editOutside(path, text) {
      if (text === undefined) {
        files.delete(path);
      } else {
        files.set(path, text);
      }
      for (const watcher of watchers) {
        watcher([path]);
      }
    },
  };
}
