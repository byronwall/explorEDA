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

  it("reports a refused save with its file", async () => {
    const files = memoryProjectFiles({}, { refuse: () => true });
    let last: SaveState | undefined;
    const saver = new FolderSaver(files, (state) => (last = state), 0);
    saver.queue("a.eda", "x\n");
    await saver.flush();
    expect(last).toMatchObject({ status: "failed", path: "a.eda" });
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
