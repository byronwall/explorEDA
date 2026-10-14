/**
 * Slows password guessing: after a few wrong passwords for one email from
 * one address, that pair waits before it may try again. A right password
 * clears its count.
 */
export const MAX_FAILURES = 5;
export const LOCK_MS = 15 * 60_000;

export function signInLimiter(now: () => number = Date.now) {
  const failures = new Map<string, number[]>();
  const recent = (key: string) =>
    (failures.get(key) ?? []).filter((time) => now() - time < LOCK_MS);
  return {
    /** Milliseconds to wait before this pair may try, or 0. */
    wait(key: string) {
      const times = recent(key);
      if (times.length < MAX_FAILURES) {
        return 0;
      }
      return Math.max(0, times[times.length - MAX_FAILURES]! + LOCK_MS - now());
    },
    failed(key: string) {
      failures.set(key, [...recent(key), now()]);
      // Keep the map from growing without bound under a flood of guesses.
      if (failures.size > 10_000) {
        for (const [entry, times] of failures) {
          if (!times.some((time) => now() - time < LOCK_MS)) {
            failures.delete(entry);
          }
        }
      }
    },
    succeeded(key: string) {
      failures.delete(key);
    },
  };
}
