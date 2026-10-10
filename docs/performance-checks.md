# Performance checks

How to measure how responsive the workspace feels, and what a claim about it needs. Read this before reporting that an interaction is slow, lags, or drops input. The [agent guide](agent-guide.md#browser-checks-and-screenshots) covers the browser pane itself.

## Before claiming anything

A report that an interaction is slow, lags a step behind, or ignores a click needs evidence from the page, not from screenshots.

- **Confirm with the DOM.** After the action, read the state with `javascript_tool` or `read_page`: the new layer in the list, the changed text, the open dialog. If the DOM shows the change, nothing was dropped. A screenshot can still show the frame before the action.
- **Give the measured number and how you got it.** Name the build (dev or production), the example and its row count, the interaction, and the tool: long tasks, React Profiler, or a Performance panel mark.
- **Say what you didn't measure.** For example, "dev build only" or "production not checked".
- **Run each interaction at least twice.** The first run after a load includes lazy work and cold caches.

## Dev numbers are inflated

The demo dev server runs React in StrictMode and development mode. StrictMode renders twice and runs `useMemo` bodies twice, so a plan that costs 15 ms shows up as two 15 ms calls. Expect dev numbers to be roughly double production's.

- Use dev builds to compare before and after on the same machine and example.
- Use a production build for absolute numbers: `pnpm --filter demo build`, then `pnpm --filter demo preview`. It compiles the library from source in production mode. Add `EXPLOREDA_DIST=1` only to time the published package.

## Measure in the page

Run these through `javascript_tool` with the browser pane in front. A hidden pane throttles timers and animation frames, so polling stalls and pages load slowly. Poll with `setTimeout`, not `requestAnimationFrame`.

Click helper. Real pointer and mouse events, because some controls act on `pointerdown` or `mousedown`:

```js
window.__click = (el) => {
  const r = el.getBoundingClientRect();
  const o = {
    bubbles: true,
    cancelable: true,
    clientX: r.x + r.width / 2,
    clientY: r.y + r.height / 2,
    pointerId: 1,
    button: 0,
    isPrimary: true,
    pointerType: "mouse",
    view: window,
  };
  for (const [Type, name] of [
    [PointerEvent, "pointerdown"],
    [MouseEvent, "mousedown"],
    [PointerEvent, "pointerup"],
    [MouseEvent, "mouseup"],
    [MouseEvent, "click"],
  ])
    el.dispatchEvent(new Type(name, o));
};
```

Main-thread cost of one interaction. A long task is any task over 50 ms; their sum is the time the page could not respond:

```js
window.__measure = async (act, wait = 900) => {
  const tasks = [];
  const observer = new PerformanceObserver((list) =>
    list.getEntries().forEach((e) => tasks.push(Math.round(e.duration)))
  );
  observer.observe({ type: "longtask" });
  act();
  await new Promise((r) => setTimeout(r, wait));
  observer.disconnect();
  return tasks;
};
```

The sum of long tasks covers React render, layout, and paint. To split it, wrap parts of the tree in a temporary `React.Profiler` that pushes `[id, phase, actualDuration]` to `window`. One around each grid panel and one around the grid show which charts re-render and what each costs. Remove the profilers before committing.

To find what triggered a re-render, temporarily log store selectors whose results change. In `useDataLayer`, keep the last value in a `useRef`, and when it differs, push `selector.toString()` to `window`. A selector that changes on an unrelated edit is the cause.

## Patterns that keep edits cheap

An edit to one chart should re-render that chart only. A filter change should recompute the charts it affects and nothing outside them. Four patterns do this. Each one fails safe, and each has a test that covers every registered chart type, so a new type or setting gets checked without changes to the tests.

| Pattern                                                 | Where                                                                                                                      | If it breaks                                                                                                                      | Guard                                                                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| A display-only edit keeps every chart's live items      | `DISPLAY_ONLY_KEYS` in `providers/DataLayerProvider.tsx`                                                                   | A key missing from the set only costs a redraw. A key in the set that a filter reads would leave other charts showing stale rows. | `test/providers/displayOnlyKeys.test.ts` checks every chart type's filter and population against every key in the set                              |
| A per-chart hook subscribes to what it reads            | `useChartEdit`, `useCreateCharts`, `useColorScales`, `useFieldFilter`, `useFilteredFieldProfiles`, `useFieldDistributions` | One broad subscription re-renders every chart on any edit                                                                         | `components/__tests__/chartRenderIsolation.test.tsx` draws a panel of every type and fails if editing one chart's text or style re-renders another |
| Grid panels skip renders when their props are unchanged | `components/GridChartPanel.tsx`                                                                                            | A new value prop is compared automatically. A new callback that reads anything but the chart's settings must be stable.           | The isolation test uses the same comparator                                                                                                        |
| Date periods are parsed once per value                  | `utcDay` and `utcPeriod` in `lib/dailyRollup.ts`                                                                           | Results are frozen, so a caller that mutates one throws instead of corrupting the cache. A new argument must join the cache key.  | `lib/dailyRollup.test.ts`                                                                                                                          |

### Adding a chart setting

- If it changes only appearance and no chart type's filter or population reads it, add it to `DISPLAY_ONLY_KEYS` and give it a sample in `displayOnlyKeys.test.ts`. The test fails until both are done.
- Otherwise leave it out. Edits to it rebuild live items, which is correct and costs a redraw of every chart.

### Adding a chart type

- Register it in `registerAllCharts`. Both guard tests pick it up. If it cannot draw in jsdom, add it to `SKIPPED` in the isolation test with a reason.
- In its hooks, select one chart (`state.charts.find((chart) => chart.id === id)`) or a fact (`state.charts.length > 0`), not `state.charts`. When the list is needed only to act, such as placing a new chart below the others, read it then with `useDataLayerSnapshot()`.
- Selectors must return a value that stays the same object while nothing it depends on changed. A selector that builds a new array or object on every call re-renders on every store change.

## Reference: October 2026

The message-log example (10,376 rows, six charts) in the dev build, sum of long tasks:

| Interaction                          | Before                        | After                                   |
| ------------------------------------ | ----------------------------- | --------------------------------------- |
| Add an element to a composition      | ~165 ms; all charts re-render | ~70 ms; only the composition re-renders |
| Filter click on a row chart          | 121–163 ms                    | 88–117 ms                               |
| Line chart's share of a filter click | 32–62 ms                      | 12–20 ms                                |
