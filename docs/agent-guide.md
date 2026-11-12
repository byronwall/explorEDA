# Agent guide

A map of the code and the commands that work, for agents changing this repo. Read it before a broad search; most tasks touch a few known files. Rules live in [AGENTS.md](../AGENTS.md) and [UI defaults](ui-defaults.md).

## Where things live

- **Store: rows, charts, filters, save/restore:** `packages/explorEDA/src/providers/DataLayerProvider.tsx` (zustand). `updateChart(id, partial)` is the one write path for chart settings.
- **Host callback:** `onStateChange` in the same file. It fires after every store change that alters `saveToStructure()`, unless an in-place edit holds it (`holdStateChanges`). It is not debounced.
- **Settings types:** `src/types/ChartTypes.ts` (`BaseChartSettings`, `AxisSettings`), `src/types/SavedDataStructure.ts`
- **Defaults:** `src/utils/defaultSettings.ts`. The defaults are deep-frozen: a new chart's axes, margin, facet, layout, and filters are these objects until something copies them, so an in-place edit throws. `DEFAULT_AXIS_SETTINGS` writes `min: 0, max: 100` into every axis. Those keys are a dead placeholder, marked `@deprecated`; axis ranges live in `xAxis.limits` and `yAxis.limits`. Never give `min` or `max` meaning.
- **Saved-data validation:** `src/utils/saveDataUtils.ts` (`isAxis`, `validateSavedData`). A new setting that fails validation makes restores reject the whole save.
- **Chart registry:** `src/charts/registry.ts`, `registerAllCharts.ts`, and one `src/components/charts/<Type>/definition.ts` per type
- **Chart panel: header, title, actions, details dialog, keys:** `src/components/PlotChartPanel.tsx`
- **Grid placement and drag:** `src/components/ChartGridLayout.tsx` (react-grid-layout, `draggableHandle=".drag-handle"`)
- **Settings popover and tabs:** `src/components/ChartSettingsContent.tsx`, `src/components/settings/*Tab.tsx`. Valid edits apply live; Reset restores the values from when the popover opened.
- **Axes:** `components/charts/Axis/axisPlan.ts` plans ticks, labels, and guides. `AxisLayer.tsx` draws them (`PlannedAxes`, `PlannedGrid`). `numericScale.ts` makes linear and symlog scales.
- **SVG chart shell:** `components/charts/BaseChart.tsx`: plot clip, brush, guide tracing, empty-plot clicks. Scatter draws its own `ScatterPlot/ScatterSvg.tsx`.
- **Domains:** Each renderer builds its own scale: `BarChart/barPlan.ts`, `seriesBarPlan.ts`, `ScatterPlot/scatterAxis.ts`, `LineChart/timeSeriesPlan.ts`, `RowChart.tsx`, `BoxPlot.tsx`. Grep `numericScale(` to find them all.
- **Chart annotations (callouts, lines, bands, regions):** `src/lib/annotations/`: saved types, `resolve.ts` (record keys and projection), `validate.ts`. `context.ts` says what a chart offers (dates, records, right axis). A renderer builds an `AnnotationFrame` and passes `annotationSlot(settings, frame)` to `ScatterSvg` or `BaseChart`; `AnnotationLayer.tsx` draws and drags them and reports statuses (`annotationStatus.ts`) back to the Notes tab in `settings/annotations/`. A record callout stores key field values, never a row index; aggregate charts attach callouts by `category`. Facet panels pass `facetKey`, the semantic facet id, for annotations bound to one panel. `scaleFrame` builds a frame from D3 scales. `labelLayout.ts` places rule, band, and callout labels: pass `marks` (points, path data, rects) in the frame so labels keep clear of what the chart draws. A callout with offset 0,0 is placed automatically; any other offset is fixed. A chart whose axis shows one value per group passes `axisValues` so statistic rules read those values; a grid of cells (heatmap, calendar) passes `cell` so a record callout lands on the cell its key names. `chartDrawsAnnotations` lists the charts that draw them; `persistence.test.ts` round-trips every kind through Dashboard text and saved data.
- **Tracing (Alt-click):** `components/charts/trace/` (`ChartTraceScope`, `useTraceSource`)
- **Axis field menu and Command-click inspect:** `components/charts/AxisFieldActions.tsx`. It acts on elements with `data-field`, and on axis bands when the panel passes `axisItems` (range and title actions).
- **Dashboard text (DSL):** `src/lib/dsl/compile.ts` (keys such as `x.min`, `y.scale`), `export.ts` (diffs settings into keys generically), `settingKeys.ts`
- **Demo history and undo:** `apps/demo/src/savedViewsHistory.ts` (`pushCheckpoint`), `SavedViewsWorkspace.tsx` (`capture`). Every `onStateChange` becomes one undo step.
- **How the demo loads the library:** `apps/demo/exploredaSource.ts`. Dev and demo tests use library source; set `EXPLOREDA_DIST=1` for the build.
- **In-place editing:** `components/charts/InPlace/`. `useChartEdit` applies through `updateChart` and holds `onStateChange` until the edit ends: one edit, one undo step, and Escape reports nothing. `useTitleEditing` handles chart titles; `useAxisEditing` handles axis ranges, axis titles, axis drag, and menu items. `InlineTextEditor` and `AxisLimitFields` are the shared inputs, and `axisDrag.ts` holds the pure pan and stretch math.
- **Axis limits:** `components/charts/Axis/axisBounds.ts`: `boundedDomain(auto, axis)` applies `limits` over a renderer's automatic domain; `numericAxes(settings)` says which axes can take limits. Call it wherever a renderer builds a numeric domain, and skip `.nice()` when `hasAxisBounds`. `hiddenByBounds(axis, domain, values, unit)` counts what a bound hides; pass it as `hidden` to `planAxes`, and `PlannedAxes` draws the marker that `useHiddenNotice` opens.
- **Axis bands:** `AxisLayer.tsx` draws an invisible `.eda-axis-edit` group per numeric axis, under the tick labels. It carries `data-axis-edit`, `data-domain`, `data-range`, and `data-scale-type`, which the editors read and invert.
- **Docs site (`/docs/<topic>`):** `apps/demo/src/docs/`. Pages are MDX in `pages/`, listed in `catalogue.ts` with the targets they `covers`. `targets.ts` derives what must be documented (registered chart types, required `coverage.ts` features, flows, surfaces). `live/examples.ts` defines each live example: a focused layout from a demo dashboard. Settings tables come from the unpublished `exploreda/docs-kit` entry (`packages/explorEDA/src/docsKit/`) plus `reference/settingDescriptions.ts`. `gate.ts` fails on any uncovered target, broken link, unknown example, or undescribed setting; `pnpm --filter demo build` runs it first. The build then prerenders each page, and the examples index, to static HTML (`apps/demo/docsPrerender.ts`, `src/docs/prerender.tsx`), so `/docs/<topic>` returns a 200 with the page's text; the app replaces it on boot, so a page must render under `react-dom/static` without touching `window` outside effects. `pnpm --filter demo docs:verify` (Playwright Test, `apps/demo/e2e/`) runs one test per page: the page and each live example render with no console errors, the screenshots that narrow screens show are captured, and nothing overflows at 783 and 390 px. It doesn't click through examples; chart behavior has its own tests. It runs in PR CI and in the Pages deploy before upload.
- **Daily data viz (`/daily`):** pieces, data, and `catalog.json` under `apps/demo/public/daily-viz/`; derivation and static pages in `apps/demo/dailyCorpus.mjs`; pages and the finding calculator in `apps/demo/src/daily/`. Add pieces with `pnpm daily` and the workflow in [Daily data viz](daily-viz.md).
- **Initiatives:** `docs/intent/<slug>/`: `intent-brief.md`, `initiative-map.json`, and when planned, `implementation-plan.md`. Only unbuilt or in-progress work lives there; retired initiatives are recorded in `docs/initiative-history.json`, with shipped behavior in the [feature inventory](application-feature-inventory.md).
- **Work items and feedback:** Product Grid in `pgm/data`, read and written with the `pgm` CLI through `pnpm -s pgm <command> --json 2>/dev/null`. Start with `node list --roots --compact` or `node list --subtree <id> --with-ancestors`. Commit `pgm/data` changes like any other file.

## Commands

### Checks

Run the narrowest check that covers your change. Other sessions share this laptop, so read [Memory](#memory) before running a whole suite.

```bash
pnpm --filter exploreda exec vitest run src/components/charts/BarChart
```

Runs the tests under a path or the files you name. Add `--project unit`, `--project io`, or `--project dom` to run one group; [Tests](#tests) says which group holds a file. For the demo, use `pnpm --filter demo exec vitest run <files>`.

```bash
pnpm --filter exploreda check-types
```

Type-checks the library with `tsgo` in about 5 s. The demo and the app have the same script. The demo reads library types from `packages/explorEDA/dist`, so after you add or change a library type, run `pnpm --filter exploreda build` before `pnpm --filter demo check-types`.

```bash
pnpm lint
```

Runs [oxlint](https://oxc.rs/docs/guide/usage/linter) on the library, demo, and app in under a second. It reports errors only, because the codebase already has thousands of `curly` warnings. The rules are in the root `.oxlintrc.json`: ESLint's and typescript-eslint's recommended sets, react-hooks, and react-refresh. `eslint-disable` comments still apply. `pnpm check` and CI do not run the linter; the pre-commit hook does, on staged files.

```bash
pnpm check
```

Runs `check:ui`, then each package's build, type check, and tests, one package at a time. It takes about 2 minutes and peaks near 2.2 GB. It builds the package, so run it once before a PR, from one worktree at a time.

```bash
pnpm check:pr
```

Fails when a branch changes the `exploreda` package without a changeset, or has a commit with an invalid author. CI runs it and `pnpm check` on every pull request.

A pre-commit hook (`.githooks/pre-commit`, installed by `pnpm install`) formats the staged files with Prettier and fails on oxlint errors in them, so don't run Prettier by hand before committing. A file with unstaged edits as well is only checked; format it and stage it again. Never format a whole folder; it rewrites unrelated files.

### Test time limits

Every runner takes its limits from `packages/test-config` (`@repo/test-config`): Vitest's test and hook timeouts, Testing Library's `findBy*` and `waitFor`, and Playwright's action, `expect`, per-test, and whole-run limits. On CI, Playwright retries a failed page once and reports a pass on retry as flaky. Each CI job and slow step also has `timeout-minutes`, so a hang fails in minutes. When a check is slow on CI, change the shared limit; don't add a timeout to one test or config.

### Memory

Many agent sessions share one 18 GB laptop. Full test runs from several of them once pushed it 12 GB into swap. Keep each check small:

- Run the test files you changed, not the whole suite. A full library run takes about 50 s and peaks near 1.6 GB.
- Vitest runs 2 test files at a time (`testWorkers` in `@repo/test-config`). Don't raise the cap in a config. For one faster run on an idle machine, pass `--maxWorkers=4`.
- `check-types` uses `tsgo` (the Go port of TypeScript, `@typescript/native-preview`) with one checker: about 5 s and 0.9 GB for the library, against 15–30 s for `tsc`. The library build still uses `tsc` 5.4 to emit declarations, because tsgo writes TypeScript 5.7+ types, such as `Float64Array<ArrayBuffer>`, that older package users can't read.
- Run long commands with `run_in_background` and wait for the exit notice.
- Leave no processes behind. Stop `vitest --ui`, Vitest watch mode, and your `pnpm dev:agent` server before the session ends.

### Dev server and screenshots

```bash
pnpm dev:agent
```

Don't start the demo with the browser pane's `preview_start`: it reads the main checkout's launch config and collides with other sessions' servers ("Port 5291 is in use"). Run `pnpm dev:agent` and `navigate` to the URL it prints.

`pnpm dev:agent` starts this checkout's demo server in the background, installs packages first in a fresh worktree, waits until it answers, and prints the URL. Each worktree gets its own port, so parallel sessions don't collide. Run it again to get the URL; `pnpm dev:agent --stop` stops it, and `--stop-all` stops every worktree's server. A server exits by itself after 30 minutes without a request (`EXPLOREDA_DEV_IDLE_MINUTES`, 0 to keep it up), so run the command again after a break instead of reusing an old URL. Stop yours when a session ends: forgotten servers from parallel sessions once ran the machine out of memory. The server log is `tmp/dev-server.log`.

```bash
pnpm shot /examples/shop-operations --name orders --selector '.react-grid-item:has-text("Order value by category")'
```

`pnpm shot` saves 2x screenshots at 1280, 783, and 390 px to `tmp/<name>-<width>.png`. It starts the dev server when needed, clears saved workspaces first, and runs with reduced motion. Add `--click <selector>` steps, such as `--click 'role=button[name="Explore the order book"]'` from `/`. To measure instead of look, add `--eval '<js>'`, which prints a result per width, or `--clipped`, which lists text cut off inside `--selector`. Add `--no-shot` to skip the images. Use these before writing a one-off Playwright script. The header of `scripts/shot.mjs` lists every option.

For the project app (`apps/app`), run `EXPLOREDA_FOLDER=<folder> pnpm --filter app dev` and capture with `node scripts/app-shot.mjs "<printed link>" --name <name> --wait '<selector>'`. An open project keeps a change stream open, so `pnpm shot` would wait forever for network idle; this script waits for an element instead.

```bash
pnpm export-proof
```

`pnpm export-proof` checks chart image export against the screen: it presses Shift+E on a set of demo charts and diffs each download with an element screenshot, saving `tmp/export-proof/<case>-{screen,export,diff}.png`. Add `--only <case>` to run one. Run one engine at a time; `--engine webkit` builds multi-MB images and has used a lot of memory.

### Docs site

```bash
pnpm --filter demo docs:check
```

```bash
pnpm --filter demo build && pnpm --filter demo docs:verify
```

Pass Playwright options after it, such as `-g "/docs/bar$"` for one page. A failure names the page and the example, and leaves a trace under `apps/demo/test-results/`.

### Branches and releases

```bash
pnpm restack 390
```

`pnpm restack <pr|branch>` brings a stack of PRs up to date with `main`. It finds the whole stack from any PR in it, merges `main` into the bottom branch and each branch into the one above in a scratch worktree (`tmp/restack`), and stops at the first conflict with the file list. Resolve there, commit, and run `pnpm restack --continue`. It then type-checks the top of the stack, which catches conflicts git can't see, and pushes as fast-forwards. `--no-push` stops before pushing, `--merge` merges the PRs bottom-up afterwards, and `--abort` drops the scratch worktree. `git rerere` is on in this repo, so check any resolution it fills in.

```bash
pnpm changeset:add minor "What users can now do."
```

### Product Grid

```bash
pnpm -s pgm node list --roots --compact --json 2>/dev/null
```

## Traps

- **Worktrees under `.claude/worktrees/` are git-ignored** through `.git/info/exclude`.
  - Tailwind v4 skips git-ignored files when it detects sources, so `packages/explorEDA/src/index.css` names its folder with `@source "./"`. Without it, the demo dev server drops utilities that only the library uses, such as `grid-cols-3`, and screenshots mislead.
  - The dev server only ever adds Tailwind classes. After changing `@source` or the files Tailwind scans, restart it before you judge the styles.
  - Editor diagnostics there do not resolve the `@/` alias. Trust `check-types`.
- **A worktree can start hours behind `main`, and other sessions merge all day.** Before fixing a reported bug, bring the branch up to date with `main` (the `sync_with_base_branch` tool in the desktop app, otherwise `git fetch && git merge origin/main`), then run `git log origin/main --since=3.days --oneline -- <files>` and `gh pr list --search <file-or-symbol>`. A suggested task may describe a bug that another session already fixed.
- **zsh expands unquoted globs.** Write `grep -rn x src --include='*.tsx'`, quoted, or use `rg`.
- **zsh expands a word that starts with `=`.** `echo ====` fails with `=== not found`; print separators with `echo ---`.
- **macOS has no `timeout`, and a foreground `sleep` is blocked.** `pnpm dev:agent` already waits for the server. To wait on another background command, use `Monitor` or `run_in_background`. Don't watch CI in the foreground either (`gh pr checks --watch`, `gh run watch`, a loop over `gh pr view`); in the desktop app the PR monitor reports CI, and elsewhere run the watch with `run_in_background`. A PreToolUse hook (`scripts/agent-bash-guard.mjs`, wired in `.claude/settings.json`) refuses these in the foreground.
- **After `EnterWorktree`, the worktree check refuses complex commands:** git with `-C`, loops or `&&` chains that contain git, and pnpm or python with a `$VAR` path. Run one plain git command per call, or start the session in its worktree instead.
- **Edit files with the Edit tool, not a python heredoc.** Heredoc patches that assert an old string failed a dozen times in a day when the text had moved; Edit reports the mismatch and keeps the file intact.
- **Skip raw research when searching docs.** `docs/intent/*/raw/` holds large HTML: `rg pattern docs --glob '!**/raw/**'`.
- **A chart title is the grid's drag handle.** A press there starts a react-grid-layout drag, and the grid's placeholder receives the release. `click` and `dblclick` therefore never reach the title. Act on `mousedown` (`event.detail === 2` for a double press, as `useTitleEditing` does) or `mouseup` capture, as Alt-click title tracing does, and stop the press if it must not drag. Mark inputs inside a handle with `data-inplace-editor`, which the grid's `draggableCancel` skips.
- **Chart details is a modal Radix dialog.** A popover portaled to `<body>` loses focus to the dialog's focus trap, so pass `container={panel.closest("[role='dialog']")}` to `PopoverContent`, as the axis range popover does. The details Escape handler (`hasNestedLayer` in `PlotChartPanel.tsx`) yields to layers outside the dialog, to `[data-inplace-editor]`, and to popover content inside it.
- **`onStateChange` is not coalesced** unless something holds it. A settings input that calls `updateChart` on each keystroke records one demo undo step per keystroke. For a continuous edit, wrap it in `useChartEdit` (or `holdStateChanges`) so it is one step.
- **Don't subscribe a per-chart hook to the whole chart list.** `useDataLayer((state) => state.charts)` in a hook that every panel or field row uses re-renders all of them on any chart's edit. Subscribe to one chart or a derived fact, or read the list when an action runs with `useDataLayerSnapshot()`. See [Performance checks](performance-checks.md#patterns-that-keep-edits-cheap).
- **Hosts can echo `onStateChange` back as `savedData`.** `ExplorEdaProject` and the demo's project examples do this on every edit. The provider skips a `savedData` whose fingerprint matches its own state; any other change runs a full restore, which rebuilds every row, profile, and chart. Keep `saveToStructure()` output stable through a save and restore round trip, or each echo becomes a full rebuild. See [Performance checks](performance-checks.md#patterns-that-keep-edits-cheap).
- **Read raw values only through `src/lib/valueParsing.ts`.** `parseNumber`, `finiteNumber`, `parseBoolean`, `parseDateText`, `timestampOf`, and `dateBound` hold every rule for missing values, numbers, booleans, and dates. Do not call `Date.parse`, `new Date(text)`, or `Number(value)` on row data. V8's `Date.parse` reads "Depot 2" as 2001, rolls 2025-02-30 into March, and reads slash dates in local time; `Number` reads "0x1A" as 26.
- **A chart's filter function runs once per row.** Call `fieldGetter` before you return the row test. A lookup inside it is quadratic: 34 s for one click at 27,000 rows.
- **Axis labels and tick labels take the pointer** (`pointerEvents="auto"` with `data-field`), so they sit above anything drawn under them in `PlannedAxes`, such as the axis bands. Map a label back to its band, as `axisEditTarget` in `useAxisEditing.tsx` does.

## Editing a composition quickly

- [Composition mode](composition-mode.md) describes the model, marks, scopes, and limits. Read it before adding a mark or option.
- **Right-click any drawn object** on a composition's artboard for a menu of what it is made of: the mark under the pointer with a one-line summary, each scale it uses, the unit and the repeat, a trace, the workspace filter for that repeat, and removal while editing. Each line opens that part of the editor and scrolls to it, opening the details view when no editor is showing. Shift+F10 or the menu key does the same for the selected element.
- Inspector parts carry stable hooks for scripts: `[data-element-id]` and `[data-element-kind]` on the selected element's properties, `[data-mark-id]` and `[data-mark-type]` on each mark card, and `[data-action]` on each quick-menu item.
- `describeMark` in `markSummary.ts` is the one-line summary under each mark's name; keep it in step when a mark type gains a field that changes what it draws.

## Tests

Vitest with Testing Library. The rules are in [Coding standards](../CODING_STANDARDS.md#tests); this section is the map.

### Where a test runs

`pnpm --filter exploreda test` runs the library's three groups (`packages/explorEDA/vitest.config.ts`) one after another, in about 50 s:

| Group  | Files                                                       | Runs in                                                                                                    | Time                    |
| ------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------- |
| `unit` | `*.test.ts` outside `src/server`, `src/node`, and `src/cli` | Node, on the `threads` pool without isolation: one module graph per worker, shared by its files            | about 4 s for 161 files |
| `io`   | `*.test.ts` in `src/server`, `src/node`, and `src/cli`      | Node, a fresh module graph per file, because these tests share temp folders and mocks                      | about 7 s               |
| `dom`  | every `*.test.tsx`                                          | jsdom on the `vmThreads` pool: a fresh VM context per file, recycled at 256 MB; heavy packages pre-bundled | about 36 s              |

- A test that needs the DOM must be a `.tsx` file, even without JSX.
- A `unit` test shares modules with the other files in its worker. An order-dependent failure shows up with `vitest run --project unit --sequence.shuffle`.
- The demo and app suites run each file in a fresh fork with jsdom (the demo uses `src/test/environment.ts`, which keeps Node's `AbortController`).

### Where the time goes

- Importing dominates. A DOM test that imports `registerAllCharts` spends about 1 s importing, against milliseconds in its tests.
- React waits at least 300 ms before it swaps a Suspense fallback for lazy content. A test that renders many lazy pages one by one pays that wait each time; `DocsSite.test.tsx` loads its pages in batches first.
- Profile a slow test before you change it: `vitest run <file> --pool=forks --poolOptions.forks.singleFork --poolOptions.forks.execArgv=--cpu-prof --poolOptions.forks.execArgv=--cpu-prof-dir=tmp/prof`. Mostly idle time means a timer or a Suspense wait, not work. Hot product code shows by name; fix it there, so users get the speed too.

### Writing one

- Call `registerAllCharts()` in `beforeAll` before rendering charts.
- Stub `ResizeObserver`. For pointer gestures, set `window.PointerEvent = MouseEvent` as `ScatterSvg.test.tsx` does.
- jsdom has no layout: `getBoundingClientRect()` returns zeros, so pass `clientX` and `clientY` values relative to 0.
- jsdom in the VM pool has no User Timing API; `src/test/setup.ts` copies `mark`, `measure`, and `getEntriesByName` from Node.
- Render `PlotChartPanel` inside `DataLayerProvider` with `charts={[...]}` and read settings back through `useDataLayer`. See `components/__tests__/PlotChartPanel.test.tsx`.
- A new demo example in `apps/demo/src/demos/examples.ts` also needs an entry in `coverage.ts` (and, for `chart:row`, the expected list in `coverage.test.ts`). `dashboardText.test.ts` exports and recompiles every example, so invalid settings fail there. Run `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts` right after adding one; targeted library tests don't cover it.

## Browser checks and screenshots

- AGENTS.md requires real input at 1280, 783, and 390 px.
- For PR screenshots, run `pnpm shot` (see [Commands](#commands)). It uses the repo's pinned Playwright, whose Chromium build is already cached; don't install another Playwright in a scratch directory. If the browser is missing, it prints the install command.
- To trigger a composition's trace or right-click menu headlessly, dispatch `click` with `altKey` or a `contextmenu` event at the box of `[data-node="<key>"]`. Playwright's own click aims at the element's center, which an overlapping path can intercept.
- A `ref` from `find` or `read_page` dies when the page re-renders. In `browser_batch`, don't click a second ref after a click that changes the page; call `find` again first.
- The built-in browser pane scales its screenshot frame and can show a frame from before the last action. Read state with `javascript_tool` or `read_page`, not from the image.
- Before reporting that a click was dropped, a render lags, or an interaction is slow, read [Performance checks](performance-checks.md). Confirm with the DOM and measure; don't judge from screenshots. `scripts/perf-clicks.mjs` times real clicks and profiles them.
- The pane's page is larger than its screenshot frame (for example, 1024 CSS px shown as 800). Clicks by `ref` and clicks by screenshot coordinate use different frames, so pick one per page. Check where a click lands with `document.elementFromPoint`.
- A hidden pane throttles timers and animation frames: pages load slowly and `requestAnimationFrame` polling stalls. Bring the pane to the front and poll with `setTimeout`.
- The demo saves workspaces in the origin's `localStorage`, so edits from earlier runs come back. Run `localStorage.clear()` and reload to start an example fresh. Only do this on a local dev origin.
