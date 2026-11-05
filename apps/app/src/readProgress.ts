/**
 * The database reads this page started and hasn't heard back from, with
 * the rows the server has read so far. While any read runs, it asks the
 * server every half second. The page keeps the watch, so a source still
 * shows its read after the workspace redraws, as it does when a project
 * file changes mid-read.
 */
import { createContext, useContext, useSyncExternalStore } from "react";

export interface RunningRead {
  sourceId: string;
  rows: number;
}

export interface ReadWatch {
  /** Watches a read until `read` settles; returns `read`. */
  track<T>(sourceId: string, read: Promise<T>): Promise<T>;
  /** Each running read by source ID, with its rows so far. */
  reads(): ReadonlyMap<string, number>;
  subscribe(listener: () => void): () => void;
  /** Asks the server to stop a read; the read then fails as stopped. */
  cancel(sourceId: string): Promise<void>;
}

const POLL_MS = 500;

export function readWatch(server: {
  reading(): Promise<RunningRead[]>;
  cancel(sourceId: string): Promise<void>;
}): ReadWatch {
  // A read can run twice at once, as when two buttons ask for one source.
  const pending = new Map<string, number>();
  let reads: ReadonlyMap<string, number> = new Map();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: Map<string, number>) => {
    reads = next;
    listeners.forEach((listener) => listener());
  };
  const poll = async () => {
    timer = undefined;
    if (!pending.size) {
      return;
    }
    const running = await server.reading().catch(() => []);
    const next = new Map<string, number>();
    for (const sourceId of pending.keys()) {
      next.set(
        sourceId,
        running.find((read) => read.sourceId === sourceId)?.rows ??
          reads.get(sourceId) ??
          0
      );
    }
    publish(next);
    if (pending.size) {
      timer = setTimeout(() => void poll(), POLL_MS);
    }
  };
  return {
    track(sourceId, read) {
      pending.set(sourceId, (pending.get(sourceId) ?? 0) + 1);
      publish(new Map(reads).set(sourceId, reads.get(sourceId) ?? 0));
      if (!timer) {
        timer = setTimeout(() => void poll(), POLL_MS);
      }
      const done = () => {
        const left = (pending.get(sourceId) ?? 1) - 1;
        if (left) {
          pending.set(sourceId, left);
          return;
        }
        pending.delete(sourceId);
        const next = new Map(reads);
        next.delete(sourceId);
        publish(next);
      };
      read.then(done, done);
      return read;
    },
    reads: () => reads,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    cancel: (sourceId) => server.cancel(sourceId),
  };
}

export const ReadWatchContext = createContext<ReadWatch | undefined>(undefined);

const none: ReadonlyMap<string, number> = new Map();
const noSubscribe = () => () => {};

/** Every read this page has running, by source ID, with its rows so far. */
export function useRunningReads() {
  const watch = useContext(ReadWatchContext);
  return useSyncExternalStore(
    watch?.subscribe ?? noSubscribe,
    watch?.reads ?? (() => none)
  );
}
