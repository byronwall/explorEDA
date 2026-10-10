# Performance checks

How to measure how responsive the workspace feels, and what a claim about it needs. Read this before reporting that an interaction is slow, lags, or drops input. The [agent guide](agent-guide.md#browser-checks-and-screenshots) covers the browser pane itself.

## Before claiming anything

A report that an interaction is slow, lags a step behind, or ignores a click needs evidence from the page, not from screenshots.

- **Confirm with the DOM.** After the action, read the state with `javascript_tool` or `read_page`: the new layer in the list, the changed text, the open dialog. If the DOM shows the change, nothing was dropped. A screenshot can still show the frame before the action.
- **Give the measured number and how you got it.** Name the build (dev or production), the example and its row count, the interaction, and the tool: long tasks, React Profiler, or a Performance panel mark.
- **Say what you didn't measure.** For example, "dev build only" or "production not checked".
- **Run each interaction at least twice.** The first run after a load includes lazy work and cold caches.

## Pick an example that can show the cost

A cost that grows with rows, or that only a host's round trip triggers, hides in small examples.

- **Use the January flights example** (`/examples/january-flights`, 27,004 rows) for filter and restore timing. A per-row cost there is about seven times the message log's.
- **Use a project example** to test what a host sees. Project examples render `ExplorEdaProject`, and the demo stores every `onStateChange` snapshot as the view's settings, which come back as `savedData`. Plain-data examples keep their first settings and never take that path.
- **Click a mark in every chart type in the view**, not one chart. In flights, row, bar, and heatmap clicks cost about 0.7 s while one line-chart point click took 34 s.
- **Time a restore too**: switch to another view and back, or undo, with a filter active. A restore rebuilds every chart's filter, and a prop-driven restore uses a different column getter from a fresh mount.

## Dev numbers are inflated

The demo dev server runs React in StrictMode and development mode. StrictMode renders twice and runs `useMemo` bodies twice, so a plan that costs 15 ms shows up as two 15 ms calls. Expect dev numbers to be roughly double production's.

- Use dev builds to compare before and after on the same machine and example.
- Use a production build for absolute numbers: `pnpm --filter demo build`, then `pnpm --filter demo preview`. It compiles the library from source in production mode. Add `EXPLOREDA_DIST=1` only to time the published package.

## Script a run

`scripts/perf-clicks.mjs` clicks marks with real mouse input in headless Chromium, reports the long tasks after each click, and with `--profile` prints the functions with the most self and total time. It saves each CPU profile under `tmp/perf/`; open one in Chrome DevTools' Performance panel for the full call tree. Install Playwright in your scratch directory first (`npm i playwright`), then:

```bash
PLAYWRIGHT_DIR=<scratch dir> node scripts/perf-clicks.mjs --url http://localhost:5291/examples/january-flights --view "When delays happened" --click '[data-chart-id="flights-days-band"] rect.chart-mark@2' --click '[data-chart-id="flights-daily"] circle.cursor-pointer@10' --click 'view:Delays carry through' --click 'view:When delays happened' --profile
```

- A click is a CSS selector with an optional `@index`, or `view:<tab name>`. Marks carry `rect.chart-mark`, heatmap cells `rect.eda-heat-cell`, and line points `circle.cursor-pointer`, under `[data-chart-id="<chart id>"]`.
- If Playwright's own Chromium is missing, set `CHROME_PATH` to a cached one under `~/Library/Caches/ms-playwright/`.
- Raise `--wait` past the slowest click. A long task that runs past it is cut off, and the next click lands mid-render.
- In the total-time list, read down from the top library frame. `restoreFromStructure` under a filter click, or a field getter under `filterFunction`, names the cause directly.

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

An edit to one chart should re-render that chart only. A filter change should recompute the charts it affects and nothing outside them. Six patterns do this. Each one fails safe and has a guard test. The per-type guards cover every registered chart type, so a new type or setting gets checked without changes to the tests.

| Pattern                                                 | Where                                                                                                                      | If it breaks                                                                                                                      | Guard                                                                                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| A display-only edit keeps every chart's live items      | `DISPLAY_ONLY_KEYS` in `providers/DataLayerProvider.tsx`                                                                   | A key missing from the set only costs a redraw. A key in the set that a filter reads would leave other charts showing stale rows. | `test/providers/displayOnlyKeys.test.ts` checks every chart type's filter and population against every key in the set                              |
| A per-chart hook subscribes to what it reads            | `useChartEdit`, `useCreateCharts`, `useColorScales`, `useFieldFilter`, `useFilteredFieldProfiles`, `useFieldDistributions` | One broad subscription re-renders every chart on any edit                                                                         | `components/__tests__/chartRenderIsolation.test.tsx` draws a panel of every type and fails if editing one chart's text or style re-renders another |
| Grid panels skip renders when their props are unchanged | `components/GridChartPanel.tsx`                                                                                            | A new value prop is compared automatically. A new callback that reads anything but the chart's settings must be stable.           | The isolation test uses the same comparator                                                                                                        |
| Date periods are parsed once per value                  | `utcDay` and `utcPeriod` in `lib/dailyRollup.ts`                                                                           | Results are frozen, so a caller that mutates one throws instead of corrupting the cache. A new argument must join the cache key.  | `lib/dailyRollup.test.ts`                                                                                                                          |
| A host's echo of its own snapshot is not restored       | The `savedData` effect in `DataLayerProvider`                                                                              | Every filter click in a controlled host rebuilds every row, profile, and chart: about 0.5 s in flights                            | `test/providers/DataLayerProvider.test.tsx`, "does not rebuild when a controlled host passes back its own snapshot"                                |
| A filter function looks up its columns once             | Each type's `getFilterFunction`, and the column cache in `restoreAnalysisFromStructure`                                    | A lookup per row is a pass over every row per row: 34 s for one line-chart click at 27,004 rows                                   | `test/providers/filterColumnLookups.test.ts` checks every chart type                                                                               |

### Adding a chart setting

- If it changes only appearance and no chart type's filter or population reads it, add it to `DISPLAY_ONLY_KEYS` and give it a sample in `displayOnlyKeys.test.ts`. The test fails until both are done.
- Otherwise leave it out. Edits to it rebuild live items, which is correct and costs a redraw of every chart.

### Adding a chart type

- Register it in `registerAllCharts`. The per-type guard tests pick it up. If it cannot draw in jsdom, add it to `SKIPPED` in the isolation test with a reason.
- In `getFilterFunction`, call `fieldGetter` before you return the row test, never inside it. The returned function runs once per row for every chart.
- In its hooks, select one chart (`state.charts.find((chart) => chart.id === id)`) or a fact (`state.charts.length > 0`), not `state.charts`. When the list is needed only to act, such as placing a new chart below the others, read it then with `useDataLayerSnapshot()`.
- Selectors must return a value that stays the same object while nothing it depends on changed. A selector that builds a new array or object on every call re-renders on every store change.

## Reference: October 2026

The message-log example (10,376 rows, six charts) in the dev build, sum of long tasks:

| Interaction                          | Before                        | After                                   |
| ------------------------------------ | ----------------------------- | --------------------------------------- |
| Add an element to a composition      | ~165 ms; all charts re-render | ~70 ms; only the composition re-renders |
| Filter click on a row chart          | 121–163 ms                    | 88–117 ms                               |
| Line chart's share of a filter click | 32–62 ms                      | 12–20 ms                                |

## Reference: October 2026, January flights

The January flights example (27,004 rows), "When delays happened" view, dev build, sum of long tasks per click, measured with `scripts/perf-clicks.mjs`:

| Interaction                                  | Before           | After                      |
| -------------------------------------------- | ---------------- | -------------------------- |
| Filter click on the row chart                | 631–729 ms       | 136–349 ms                 |
| Filter click on a heatmap cell               | 645 ms           | 184–225 ms                 |
| Filter click on a line-chart point (one day) | 31,818–34,399 ms | 199–441 ms                 |
| Row-chart click while a day is selected      | 32,983 ms        | 154–349 ms                 |
| Switch views, one way                        | 1,367–1,588 ms   | 1,045–1,280 ms (unchanged) |

Two causes. The demo passes each `onStateChange` snapshot back as `savedData`, and the provider restored it: it rebuilt every row, profile, and chart for a state it already held. Inside that restore, the line chart's filter looked up its column once per row, and the restore's column getter built the whole column on each call. A view switch mounts a new store, whose column getter caches, so it never hit the quadratic path; its cost is drawing the new view's charts.
