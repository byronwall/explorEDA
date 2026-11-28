import { memoryProjectFiles } from "exploreda";
import { describe, expect, it, vi } from "vitest";
import { FolderSaver, type SaveState } from "./saver";

describe("FolderSaver", () => {
  it("writes the last change once, after the pause", async () => {
    vi.useFakeTimers();
    const files = memoryProjectFiles({ "a.eda": "one\n" });
    const states: SaveState["status"][] = [];
    const saver = new FolderSaver(files, (state) => states.push(state.status));
    saver.known("a.eda", "one\n");
    saver.queue("a.eda", "two\n");
    saver.queue("a.eda", "three\n");
    await vi.advanceTimersByTimeAsync(1000);
    expect(files.snapshot()["a.eda"]).toBe("three\n");
    expect(states.at(-1)).toBe("saved");
    vi.useRealTimers();
  });

  it("leaves a file alone when its text matches the disk", async () => {
    const write = vi.fn(async () => {});
    const saver = new FolderSaver(
      { ...memoryProjectFiles(), write },
      () => {},
      0
    );
    saver.known("a.eda", "same\n");
    saver.queue("a.eda", "same\n");
    await saver.flush();
    expect(write).not.toHaveBeenCalled();
  });

  it("writes a return to the old text queued while a write is under way", async () => {
    const files = memoryProjectFiles({ "a.eda": "one\n" });
    let release = () => {};
    const write = files.write;
    const saver = new FolderSaver(
      {
        ...files,
        write: async (path, text) => {
          if (text === "two\n") {
            await new Promise<void>((resolve) => (release = resolve));
          }
          await write(path, text);
        },
      },
      () => {},
      0
    );
    saver.known("a.eda", "one\n");
    saver.queue("a.eda", "two\n");
    const first = saver.flush();
    await Promise.resolve();
    // An undo puts the file back while "two" is still being written.
    saver.queue("a.eda", "one\n");
    release();
    await first;
    await saver.flush();
    expect(files.snapshot()["a.eda"]).toBe("one\n");
  });

  it("ends on the last change when writes of the same text overlap", async () => {
    const files = memoryProjectFiles({ "a.eda": "A" });
    const gates: (() => void)[] = [];
    const write = files.write;
    const saver = new FolderSaver(
      {
        ...files,
        write: async (path, text) => {
          if (text === "B") await new Promise<void>((r) => gates.push(r));
          await write(path, text);
        },
      },
      () => {},
      0
    );
    saver.known("a.eda", "A");
    // Undo and Redo back and forth while the first write hangs.
    for (const text of ["B", "A", "B"]) {
      saver.queue("a.eda", text);
      saver.flush();
    }
    while (gates.length < 1) await Promise.resolve();
    gates.shift()!();
    while (gates.length < 1) await new Promise((r) => setTimeout(r, 0));
    saver.queue("a.eda", "A");
    gates.shift()!();
    await saver.flush();
    expect(files.snapshot()["a.eda"]).toBe("A");
  });

  it("ignores changes while held for a reload", async () => {
    const write = vi.fn(async () => {});
    const saver = new FolderSaver(
      { ...memoryProjectFiles(), write },
      () => {},
      0
    );
    const first = saver.hold();
    const second = saver.hold();
    // The first reload's workspace mounts while the second still reads.
    saver.release(first);
    saver.queue("a.eda", "stale\n");
    await saver.flush();
    expect(write).not.toHaveBeenCalled();
    saver.release(second);
    saver.queue("a.eda", "fresh\n");
    await saver.flush();
    expect(write).toHaveBeenCalledOnce();
  });

  it("reports a refused save with its file", async () => {
    const files = memoryProjectFiles({}, { refuse: () => true });
    let last: SaveState | undefined;
    const saver = new FolderSaver(files, (state) => (last = state), 0);
    saver.queue("a.eda", "x\n");
    await saver.flush().catch(() => {});
    expect(last).toMatchObject({ status: "failed", path: "a.eda" });
  });

  it("writes in queue order, one file at a time", async () => {
    const order: string[] = [];
    let open = 0;
    const write = vi.fn(async (path: string) => {
      open += 1;
      expect(open).toBe(1);
      await new Promise((resolve) => setTimeout(resolve, path === "p" ? 5 : 0));
      order.push(path);
      open -= 1;
    });
    const saver = new FolderSaver(
      { ...memoryProjectFiles(), write },
      () => {},
      0
    );
    saver.queue("p", "project\n");
    saver.queue("a.eda", "analysis\n");
    await saver.flush();
    expect(order).toEqual(["p", "a.eda"]);
  });

  it("rejects a flush that couldn't write, and keeps the change to retry", async () => {
    let refuse = true;
    const files = memoryProjectFiles({}, { refuse: () => refuse });
    const saver = new FolderSaver(files, () => {}, 0);
    saver.queue("a.eda", "x\n");
    await expect(saver.flush()).rejects.toThrow("a.eda");
    refuse = false;
    await saver.flush();
    expect(files.snapshot()["a.eda"]).toBe("x\n");
  });

  it("never writes when it is read-only", async () => {
    const write = vi.fn(async () => {});
    const states: SaveState["status"][] = [];
    const saver = new FolderSaver(
      { ...memoryProjectFiles(), write },
      (state) => states.push(state.status),
      0,
      true
    );
    saver.known("a.eda", "one\n");
    saver.queue("a.eda", "two\n");
    await saver.flush();
    expect(write).not.toHaveBeenCalled();
    expect(states).toEqual([]);
  });
});
