/**
 * Project files on disk, for the command line and the local server. Reads
 * may name a file outside the folder by absolute path; writes stay inside
 * it, after symbolic links are resolved.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  isAbsolutePath,
  normalizeProjectPath,
  ProjectFileError,
  SKIPPED_FOLDERS,
  type ProjectFiles,
} from "../lib/project/files";

export interface NodeProjectFiles extends ProjectFiles {
  root: string;
  /** The absolute path a project path names, if it stays in the folder. */
  resolve(projectPath: string): string | undefined;
}

export function nodeProjectFiles(folder: string): NodeProjectFiles {
  const root = path.resolve(folder);
  const resolve = (projectPath: string) => {
    if (isAbsolutePath(projectPath)) {
      return undefined;
    }
    const normalized = normalizeProjectPath(projectPath);
    return normalized ? path.join(root, ...normalized.split("/")) : undefined;
  };
  const readable = (projectPath: string) =>
    isAbsolutePath(projectPath)
      ? path.resolve(projectPath)
      : resolve(projectPath);

  /** The absolute path to write, or a refusal when it leaves the folder. */
  const writable = async (projectPath: string) => {
    const target = resolve(projectPath);
    if (target) {
      // A link inside the folder must not lead a write outside it.
      const realRoot = await fs.realpath(root);
      let existing = path.dirname(target);
      while (!(await exists(existing))) {
        existing = path.dirname(existing);
      }
      const realParent = await fs.realpath(existing);
      const relative = path.relative(realRoot, realParent);
      if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
        return target;
      }
    }
    throw new ProjectFileError(
      "refused",
      projectPath,
      `${projectPath} is outside the project folder, so it can't be written.`
    );
  };

  return {
    root,
    resolve,
    async list() {
      const found: string[] = [];
      const walk = async (directory: string, prefix: string) => {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
          if (SKIPPED_FOLDERS.has(entry.name)) {
            continue;
          }
          const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.isDirectory()) {
            await walk(path.join(directory, entry.name), relative);
          } else if (entry.isFile()) {
            found.push(relative);
          }
        }
      };
      await walk(root, "");
      return found.sort();
    },
    async read(projectPath) {
      const target = readable(projectPath);
      if (!target) {
        throw new ProjectFileError(
          "missing",
          projectPath,
          `${projectPath} isn't a file path.`
        );
      }
      try {
        return await fs.readFile(target, "utf8");
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        throw new ProjectFileError(
          code === "ENOENT" ? "missing" : "unreadable",
          projectPath,
          code === "ENOENT"
            ? `${projectPath} doesn't exist.`
            : `${projectPath} can't be read (${code ?? "unknown error"}).`
        );
      }
    },
    async write(projectPath, text) {
      const target = await writable(projectPath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      // Write beside the file, then rename, so a reader never sees half.
      const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(temporary, text, "utf8");
      await fs.rename(temporary, target);
    },
    async remove(projectPath) {
      await fs.rm(await writable(projectPath), { force: true });
    },
  };
}

async function exists(target: string) {
  try {
    await fs.stat(target);
    return true;
  } catch {
    return false;
  }
}
