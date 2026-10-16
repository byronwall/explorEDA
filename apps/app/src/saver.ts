import type { ProjectFiles } from "exploreda";

export type SaveState =
  | { status: "saved" }
  | { status: "saving" }
  | { status: "failed"; path: string; message: string };

/**
 * Writes changed files a moment after the last edit. A file whose text
 * matches what is on disk isn't written, so opening a project, or undoing
 * back to the saved state, leaves the folder alone. A read-only saver,
 * for someone who may only view the project, never writes.
 */
export class FolderSaver {
  private readonly onDisk = new Map<string, string>();
  private readonly pending = new Map<
    string,
    { text: string; timer: ReturnType<typeof setTimeout> }
  >();
  private writing = 0;

  constructor(
    private readonly files: ProjectFiles,
    private readonly onState: (state: SaveState) => void,
    private readonly delay = 1000,
    private readonly readOnly = false
  ) {}

  /** Records the text a file already holds. */
  known(path: string, text: string) {
    this.onDisk.set(path, text);
  }

  queue(path: string, text: string) {
    if (this.readOnly) {
      return;
    }
    const waiting = this.pending.get(path);
    if (waiting) {
      clearTimeout(waiting.timer);
      this.pending.delete(path);
    }
    if (this.onDisk.get(path) === text) {
      this.settle();
      return;
    }
    this.onState({ status: "saving" });
    this.pending.set(path, {
      text,
      timer: setTimeout(() => void this.write(path, text), this.delay),
    });
  }

  /** Drops an unsaved change, as when the file changed on disk. */
  cancel(path: string) {
    const waiting = this.pending.get(path);
    if (waiting) {
      clearTimeout(waiting.timer);
      this.pending.delete(path);
    }
    this.onDisk.delete(path);
    this.settle();
  }

  /** Writes every waiting change now. */
  async flush() {
    const waiting = [...this.pending.entries()];
    for (const [path, { timer }] of waiting) {
      clearTimeout(timer);
      this.pending.delete(path);
    }
    await Promise.all(
      waiting.map(([path, { text }]) => this.write(path, text))
    );
  }

  private async write(path: string, text: string) {
    this.pending.delete(path);
    this.writing += 1;
    try {
      await this.files.write(path, text);
      this.onDisk.set(path, text);
      this.writing -= 1;
      this.settle();
    } catch (error) {
      this.writing -= 1;
      this.onState({
        status: "failed",
        path,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private settle() {
    if (!this.pending.size && !this.writing) {
      this.onState({ status: "saved" });
    }
  }
}
