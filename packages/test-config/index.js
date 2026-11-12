// The time limits every test runner in this repo shares: Vitest in the
// library and the demo, Testing Library's waits, and the Playwright docs
// check. Each limit only has to catch a hang or a real failure, so each sits
// well above how long the work takes on a busy CI runner. Change a limit
// here, never in one config or one test.

const onCI = Boolean(globalThis.process?.env?.CI);

export const testTiming = {
  /** One unit test, before it counts as hung. */
  testMs: 20_000,
  /** One Vitest hook, such as beforeAll. */
  hookMs: 20_000,
  /** How long findBy*, waitFor, and Playwright's expect poll for a result. */
  waitMs: 10_000,
  /** One browser action, such as a click, or one navigation. */
  browserActionMs: 20_000,
  /** One browser test: a docs page with its examples and narrow widths. */
  browserTestMs: 120_000,
  /** The whole Playwright run. */
  browserRunMs: 12 * 60_000,
  /** Browser test retries. A test that passes on retry is reported flaky. */
  browserRetries: onCI ? 1 : 0,
};

/**
 * How many test files Vitest runs at once. Each worker is a Node process
 * with its own jsdom and module graph, at 300 MB to 1 GB each, and Vitest's
 * default of one per core swamped laptops running several agents at once.
 * Pass `--maxWorkers=<n>` on the command line to change it for one run.
 */
export const testWorkers = 2;

/** The Vitest `test` options every package starts from. */
export const vitestDefaults = {
  globals: true,
  testTimeout: testTiming.testMs,
  hookTimeout: testTiming.hookMs,
  pool: "forks",
  maxWorkers: testWorkers,
  minWorkers: 1,
};
