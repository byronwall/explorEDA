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
 *
 * Writes run one at a time, in the order files were queued, so a project
 * file queued before an analysis that reads it is on disk first. A write
 * that fails keeps its text, and the next flush tries it again.
 */
export class FolderSaver {
  private readonly onDisk = new Map<string, string>();
  private readonly pending = new Map<
    string,
    { text: string; timer?: ReturnType<typeof setTimeout> }
  >();
  /** The last write sent to each file that hasn't finished. */
  private readonly inFlight = new Map<string, { id: number; text: string }>();
  private writes = 0;
  private holds = 0;
  /** The reload that holds the saver now, or 0. */
  private held = 0;
  private chain: Promise<void> = Promise.resolve();
  private writing = 0;
  private failure?: { path: string; message: string };

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

  /**
   * Ignores new changes while the folder reloads: the page that made them
   * is about to be replaced by what the folder holds. Returns the reload's
   * token; only that token releases it, so an earlier reload finishing
   * can't release a later one.
   */
  hold() {
    this.held = ++this.holds;
    return this.held;
  }

  release(token: number | undefined) {
    if (token !== undefined && token === this.held) this.held = 0;
  }

  /** True while a reload holds the saver. */
  get isHeld() {
    return this.held !== 0;
  }

  queue(path: string, text: string) {
    if (this.readOnly || this.held) {
      return;
    }
    const waiting = this.pending.get(path);
    if (waiting) {
      clearTimeout(waiting.timer);
      this.pending.delete(path);
    }
    // Text a write under way is about to put there counts as on disk.
    const latest = this.inFlight.has(path)
      ? this.inFlight.get(path)!.text
      : this.onDisk.get(path);
    if (latest === text) {
      this.settle();
      return;
    }
    this.onState({ status: "saving" });
    this.pending.set(path, {
      text,
      timer: setTimeout(() => void this.start([path]), this.delay),
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
    if (this.failure?.path === path) {
      this.failure = undefined;
    }
    this.settle();
  }

  /**
   * Writes every waiting change now, after any write already under way.
   * Rejects when a file couldn't be written; its change stays waiting.
   */
  async flush() {
    this.start([...this.pending.keys()]);
    await this.chain;
    if (this.failure) {
      throw new Error(
        `Couldn't save ${this.failure.path}: ${this.failure.message}`
      );
    }
  }

  /** Adds the waiting changes to these files to the write queue. */
  private start(paths: string[]) {
    for (const path of paths) {
      const waiting = this.pending.get(path);
      if (!waiting) {
        continue;
      }
      clearTimeout(waiting.timer);
      this.pending.delete(path);
      this.writing += 1;
      const id = ++this.writes;
      this.inFlight.set(path, { id, text: waiting.text });
      this.chain = this.chain.then(() => this.write(path, waiting.text, id));
    }
  }

  private async write(path: string, text: string, id: number) {
    const latest = () => this.inFlight.get(path)?.id === id;
    try {
      await this.files.write(path, text);
      this.onDisk.set(path, text);
      if (this.failure?.path === path) {
        this.failure = undefined;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.failure = { path, message };
      // A newer edit to the file replaces this text; otherwise keep it.
      if (!this.pending.has(path) && latest()) {
        this.pending.set(path, { text });
      }
    } finally {
      if (latest()) this.inFlight.delete(path);
      this.writing -= 1;
      this.settle();
    }
  }

  private settle() {
    if (this.failure) {
      this.onState({ status: "failed", ...this.failure });
    } else if (!this.pending.size && !this.writing) {
      this.onState({ status: "saved" });
    }
  }
}
