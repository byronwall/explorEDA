# explorEDA quick audit

Date: 2026-09-13

## Executive summary

The project still has a strong core idea. The chart registry and shared filtering model are useful foundations.

The current release is not safe to extend yet. Several basic checks fail, while both production builds still pass.

Fix correctness and feedback loops before a redesign. Do not start with a large architectural rewrite.

### Highest-priority work

1. Add one root check that runs type checks, tests, and builds.
2. Fix the line-chart render mutation and stale `ExplorEda` input state.
3. Repair table filtering, pagination, export, and resize behavior.
4. Make calculated columns deterministic and clear their caches correctly.
5. Fix keyboard access and the mobile workspace before visual polish.

## Scope and method

This was a quick source and runtime audit. It covered the library, demo, build setup, tests, and main user flows.

The UI review used two isolated assessments:

- `ux_review`: source review and desktop/mobile browser inspection.
- `ui_detector`: the Impeccable detector and a separate browser inspection.

Srcly also scanned the repository. Its default ranking favored old Markdown plans, so it did not drive the findings.

## Verification baseline

| Check | Result |
| --- | --- |
| Library production build | Passes |
| Demo production build | Passes; output is 1.99 MB JavaScript, 580 KB gzip |
| Library TypeScript check | Fails with 125 errors |
| Demo TypeScript check | Fails with 11 errors |
| Library tests | 5 files failed, 4 passed; 15 tests failed, 83 passed, 22 are TODO |
| Demo tests | No test files |
| Library lint | 251 warnings; returns success |
| Demo lint | 7 warnings; returns success |
| Mechanical UI detector | One likely false positive on the loading spinner |

The build is transpile-only. It does not prove that the repository is type-correct or tested.

## 1. Build, release, and package problems

### P0 — Release checks can publish broken code

The root `release` script runs only `turbo build` and `changeset publish`.

`tsup` and Vite both emit working bundles despite 136 combined TypeScript errors. Tests do not run during release.

Add a single root `check` script. Make release depend on it. Keep the check to types, tests, and builds.

Evidence: `package.json`, `turbo.json`, and both package files.

### P0 — Tests are already red and partially stale

The library suite has 15 failing tests. Two suites fail before tests can run.

- `DataLayerProvider.test.tsx` imports three deleted chart factory files.
- `ColumnFilter.test.tsx` uses `jest.fn()` in Vitest.
- Data-table fixtures pass `filters: {}` although production expects an array.
- Twenty-two tests are marked TODO.

Delete obsolete tests. Repair only tests that protect current behavior.

### P1 — The demo does not type-check

Seven demo files import `@/types/SavedDataTypes`, which does not exist.

The Lorenz fixture also stores plain objects where the public type requires `THREE.Vector3` instances.

Use the exported library type everywhere. Change persisted vectors to plain data shapes.

Evidence: `apps/demo/src/demos/examples.ts:2` and `apps/demo/src/demos/lorenz.ts:50`.

### P1 — A published export points to an omitted source file

`./types/SavedDataStructure` points to `./src/types/SavedDataStructure.ts`.

The package publishes only `dist/**` and `README.md`. It does not publish `src/**`.

Remove this subpath or emit the type into `dist` and export that file.

Evidence: `packages/explorEDA/package.json`.

### P1 — The package requests a README that does not exist

The package `files` list includes `README.md`. That file exists only at the repository root.

Move or copy concise package documentation into the package before the next release.

### P2 — Lint warnings cannot fail a check

Every project rule is configured as a warning. Both lint commands return success with clear defects.

Promote unused variables and React hook dependency rules to errors. Keep style-only rules as warnings.

## 2. Correctness and state-flow bugs

### P0 — Line charts mutate saved settings during render

`LineChart` assigns `const margin = settings.margin`, then adds legend space directly to that object.

Each render increases a saved margin again. Chart space can shrink until dimensions become invalid.

Copy the margin before adjustment. Never mutate chart settings during render.

Evidence: `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx:83`.

### P0 — `ExplorEda` ignores changed input props

`DataLayerProvider` creates its store once in a ref. Later `data` or `savedData` props do not update it.

Changing examples through browser history can show stale data. The same bug affects any library host.

Either remount by dataset identity or call `setData` when the input changes. Pick one contract and document it.

Evidence: `packages/explorEDA/src/providers/DataLayerProvider.tsx:758`.

### P0 — Calculated-column dependencies depend on render order

The dependency graph maps a calculated column to its inputs. `getPreceedingCalculations` traverses the opposite direction.

A dependent calculation first logs errors. It succeeds later only if another component computed its input first.

The current test passes after repeated renders while the console reports undefined variables.

Traverse the current calculation's dependencies before evaluation. Add one direct manager test for `B = A + 1`.

Evidence: `packages/explorEDA/src/lib/calculations/CalculationState.ts:86`.

### P0 — Loading saved calculations can silently produce an empty state

`loadView` and `restoreFromStructure` use `forEach(async ...)`. They set `calculations` before callbacks resume.

Use a normal synchronous loop. `CalculationManager.addCalculation` is synchronous.

Evidence: `packages/explorEDA/src/providers/DataLayerProvider.tsx:545` and `:684`.

### P1 — Removing a calculation clears the wrong cache

Calculated values live in `calcColumnCache`. `removeCalculation` deletes from `columnCache` instead.

Reusing a result name can return stale values.

Delete the result from `calcColumnCache`. Also invalidate dependent calculated columns.

Evidence: `packages/explorEDA/src/providers/DataLayerProvider.tsx:613`.

### P1 — `setData` leaves stale empty-column data

The data helper creates `emptyColumn` from raw rows before IDs exist. It writes every value under `undefined`.

`setData` then ignores that result and keeps the old empty-column map.

Build the map from `dataWithIds`. Replace it whenever data changes.

Evidence: `packages/explorEDA/src/providers/DataLayerProvider.tsx:105` and `:268`.

### P1 — Internal row IDs leak into field selectors and summaries

`getColumnNames()` reads keys from rows after `__ID` was added.

Users can select or summarize an internal implementation field.

Filter `__ID` in the shared function.

Evidence: `packages/explorEDA/src/providers/DataLayerProvider.tsx:426`.

### P1 — Data-table column resize cannot work

Mouse handlers close over `resizingColumn` before React applies the state update. The captured value stays `null`.

Moves do nothing. Mouse-up also returns before removing window listeners.

Store the active column and width in the handler closure or refs. Always remove listeners.

Evidence: `packages/explorEDA/src/components/charts/DataTable/DataTableHeader.tsx:82`.

### P1 — Table rows, pagination, and export use different filters

The body applies global search and text filters. Pagination applies neither. Export applies only global search.

Counts and pages can disagree with visible rows. Export can include rows hidden by column filters.

Create one filtered-row selector and reuse it in all three components.

Evidence: `DataTableBody.tsx:79`, `DataTablePagination.tsx:30`, and `DataTableToolbar.tsx:24`.

### P1 — Column identity has two conflicting meanings

Headers and filters use `column.field`. Cells, sorting, and export read `row[column.id]`.

The UI fails when a stable column ID differs from a source field name.

Use `field` for row lookup and `id` only for React identity. Otherwise remove one property.

Evidence: `packages/explorEDA/src/components/charts/DataTable/DataTableBody.tsx:151`.

### P1 — Selecting an example can fetch it more than once

The click handler changes the URL and fetches data. The URL effect then calls the same handler again.

React Strict Mode adds another development effect call. Concurrent responses can overwrite newer selections.

Make the URL effect the only fetch owner. Abort the previous request when the example changes.

Evidence: `apps/demo/src/LandingPage.tsx:54` and `:80`.

### P1 — JSON import silently deletes array data

The flattener keeps only the first three array entries. The UI does not disclose this loss.

It also accepts scalar JSON values and converts some of them to empty rows.

Reject unsupported shapes. Do not truncate accepted data.

Evidence: `apps/demo/src/jsonParser.ts:3`.

### P1 — CSV parse errors are ignored

Papa Parse returns row errors through `results.errors`. The parser resolves data without checking them.

Malformed input can appear successful and produce misleading charts.

Reject files with parse errors and show the first useful error.

Evidence: `apps/demo/src/csvParser.ts:7`.

### P1 — New 3D charts start with a degenerate camera

The default camera position and target are both `(0, 0, 0)`.

Use the existing nonzero camera default already defined in `defaultSettings.ts`.

Evidence: `packages/explorEDA/src/components/charts/ThreeDScatter/definition.ts:36`.

### P2 — The 3D chart rebuilds its WebGL scene after camera updates

Camera objects are effect dependencies. The debounced store update creates new values and restarts the scene effect.

The timeout is not cleared during cleanup. It can update a deleted chart later.

Keep scene creation separate from camera synchronization. Clear the timeout during cleanup.

Evidence: `packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterChart.tsx:35`.

## 3. Data and statistical correctness

### P1 — Pivot grouping keys can collide

Rows use values joined with `:` as a composite key. Different value tuples can create the same string.

Numbers and strings can also collapse into one group.

Use nested maps or a lossless tuple encoding.

Evidence: `packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts:154`.

### P1 — Pivot options exist but do nothing

`showTotals`, `formula`, and `dateBinning` are modeled. The calculation path does not implement them.

The cell click promises details but shows only a toast.

Delete these options until implemented. Do not advertise them through settings or saved data.

### P1 — Pivot validation accepts an unusable default

The default contains one value field with an empty field name. Validation accepts any nonempty value-field array.

The chart then aggregates `undefined` values as zero.

Require every selected field to exist.

Evidence: `packages/explorEDA/src/components/charts/PivotTable/definition.ts:52`.

### P1 — Invalid numeric values become real zeros

Pivot aggregation uses `Number(value) || 0`. Line charts also convert missing values to zero.

Missing and invalid data therefore changes averages, ranges, and chart shapes.

Filter invalid values or preserve gaps. Report how many values were excluded.

Evidence: `PivotTable/utils/calculations.ts:7` and `LineChart/LineChart.tsx:107`.

### P1 — Line-chart filters never affect other charts

The line definition always returns a filter function that accepts every row.

The chart settings include filters, but the crossfilter layer ignores them.

Implement the same range-filter contract as scatter charts or remove filtering from line settings.

Evidence: `packages/explorEDA/src/components/charts/LineChart/definition.ts:98`.

### P2 — Sampling is nondeterministic and its seed is ignored

`SamplingOptions` exposes `seed`, but random sampling always uses `Math.random()`.

Summary output can change across renders. The same problem affects box-plot bee-swarm sampling.

Use systematic sampling first. Delete the seed option unless reproducible sampling is required.

### P2 — Saved-data validation is too shallow

Validation checks top-level arrays and metadata only. It does not validate chart types or nested settings.

Malformed clipboard data can reach chart lookup and rendering code.

Validate the fields that the renderer trusts. Avoid a large schema until the public format stabilizes.

Evidence: `packages/explorEDA/src/utils/saveDataUtils.ts:27`.

### P2 — Local project data can crash on one bad storage value

`loadProjects` parses browser storage without a guard or validation.

One corrupt value can break project management during render.

Catch parse failures and return an empty list with one visible warning.

Evidence: `packages/explorEDA/src/utils/localStorage.ts:9`.

## 4. UX and accessibility

### UI health score

Method: dual-agent (`ux_review` and `ui_detector`).

| # | Nielsen heuristic | Score | Main issue |
| --- | --- | --- | --- |
| 1 | System status | 2/4 | Loading has no text or announced status |
| 2 | Real-world match | 2/4 | CSV copy conflicts with JSON support |
| 3 | User control | 3/4 | Return and confirmation exist, but undo does not |
| 4 | Consistency | 3/4 | Clickable cards are not real controls |
| 5 | Error prevention | 2/4 | File guidance and validation are weak |
| 6 | Recognition | 2/4 | Examples lack previews; controls rely on icons |
| 7 | Efficiency | n/a | Not central to this showcase review |
| 8 | Minimal design | 3/4 | Empty state is clean; workspace is dense |
| 9 | Error recovery | 1/4 | Errors give no cause or next step |
| 10 | Help | n/a | Not central to this showcase review |
| **Total** |  | **18/32** | **Significant work remains** |

The cognitive-load review failed 6 of 8 checks. The initial choice and loaded workspace both show too many equal actions.

### P1 — Example cards exclude keyboard users

Nine cards are clickable `div` elements. They have no role, tab stop, or keyboard activation.

Render each example as a link or button. Add a visible focus state.

Evidence: `apps/demo/src/ExampleSelector.tsx:20`.

### P1 — The loaded workspace is not responsive

At a 390px viewport, the document width is 772px. Toolbar actions sit outside the viewport.

Chart panels shrink into narrow columns rather than forming a useful mobile layout.

Stack the toolbar. Put secondary actions in one menu. Use one chart column on narrow screens.

Evidence: `packages/explorEDA/src/components/PlotManager.tsx:161`.

### P1 — Important icon buttons have no accessible name

Duplicate, clear filter, settings, delete, and overflow buttons lack consistent labels or tooltips.

Add `aria-label` values. Keep visible text for global actions where space permits.

Evidence: `packages/explorEDA/src/components/PlotChartPanel.tsx:58`.

### P1 — Charts have no useful nonvisual representation

Canvas and SVG charts do not expose a chart title, summary, or data-table alternative.

Add an accessible name and short summary. Reuse the data table as the detailed fallback.

### P1 — Clicking the table filter control also sorts the column

The filter button sits inside a parent with a sort click handler. The button does not stop propagation.

Separate the sort button from the filter button.

Evidence: `packages/explorEDA/src/components/charts/DataTable/DataTableHeader.tsx:143`.

### P2 — The showcase does not explain why the library matters

The page title is “Data Visualization Examples.” Most cards repeat their title as the description.

Seven cards use the same chart icon. No preview or recommended starting point exists.

Lead with the cross-chart filtering benefit. Feature one strong example. Give each card a specific outcome.

### P2 — Upload copy and behavior disagree

The heading and dropzone say CSV. The file picker also accepts JSON.

Use “CSV or JSON” in every state. Show basic shape requirements near the dropzone.

### P2 — Loading and errors give weak recovery help

Loading is a large spinner without text, role, or progress context.

Errors only say parsing or loading failed. They do not explain a cause or next action.

Use an announced status message. Keep errors near the failed action and include a retry.

### P2 — Dark mode is advertised but incomplete

The README claims dark and light themes. The demo has no theme control.

Several tables use fixed `bg-white`, yellow, and gray text classes.

Either finish dark mode or remove the claim for now.

### P3 — Mechanical detector result is a false positive

The detector flagged `border-b-2` on the rounded loading spinner.

That border creates the spinner shape. No change is needed.

## 5. Architecture and maintainability

### P1 — One provider owns too many unrelated systems

`DataLayerProvider.tsx` is 800 lines. It owns data IDs, filters, charts, calculations, caches, projects, views, and persistence.

It also passes a store callback back into the crossfilter wrapper after construction.

Do not rewrite it at once. First extract pure data initialization and calculation-cache logic with direct tests.

### P1 — Public saved data leaks runtime class instances

The saved chart type requires `THREE.Vector3`. JSON persistence returns plain `{x, y, z}` objects.

The demo's type errors are the direct result.

Keep serialized types plain. Create Three.js vectors only inside the chart runtime.

### P1 — The calculation engine contains speculative dead code

`Calculator.ts` is 772 lines. It includes many private methods that only throw “not implemented.”

Examples include PCA, UMAP, t-SNE, regression, ANOVA, normalization, and string operations.

Delete uncalled methods. Add each function only when the parser and UI expose it.

### P2 — The UI library dump is larger than the used UI

The library contains 46 UI primitive files. At least 20 have no references from library source.

Unused files include calendars, carousels, drawers, navigation menus, OTP input, and the 733-line sidebar.

Delete unused primitives and their dependencies.

### P2 — Several features are dead or disconnected

Project managers, saved-view controls, clipboard restore, a second resize handle, and `useWhatChanged` are not in the app flow.

Delete them unless the next milestone needs them. Git history can recover them.

### P2 — CSS tokens are duplicated across the demo and library

Both packages define near-identical global theme tokens. The demo imports both style sheets.

Keep component styles in the library. Let the demo define only its page shell overrides.

### P2 — The chart registry discards useful type safety

The registry stores every definition through `unknown as ChartDefinition<ChartSettings>`.

This hides invalid settings and contributes to runtime-only failures.

Keep the registry simple, but validate chart type and settings at its boundary.

### P2 — Settings mix implemented and aspirational fields

Several saved types include options that are not used. This makes fixtures large and migrations harder.

Remove inactive fields before declaring the first stable format.

## 6. Dependency and performance problems

### P1 — The package has 94 runtime dependencies and no peers

React and React DOM belong in peer dependencies for a React library.

Five `@types/*` packages are also listed as runtime dependencies. Many dependencies support unused UI primitives.

Move React to peers. Move type packages to development. Delete dependencies with their unused components.

### P1 — Every consumer receives every chart system

The only entry imports and registers all charts. It pulls in Three.js, Tiptap, D3, grid layout, and every active UI system.

The demo emits 1.99 MB of minified JavaScript. The library entry is about 389 KB before gzip.

First delete unused code. Add per-chart entries only if bundle analysis still shows a real need.

### P2 — Three.js runs a permanent animation loop

Each 3D chart renders every frame, even when the camera and data are idle.

Render on control changes, resize, and data changes. Keep a loop only while damping is active.

### P2 — Layout changes update the store once per chart

Each grid callback loops over every chart and calls `updateChart` separately.

This recomputes crossfilter data and store state many times during drag operations.

Add one small batch layout update after correctness work is complete.

## 7. Documentation and product truth

### P1 — The README overstates current behavior

It claims responsive layouts, dark mode, synchronized features, export support, and several pivot options.

Some claims are incomplete or broken in the current UI.

Mark experimental features clearly. Keep the main README aligned with verified behavior.

### P2 — Old plans obscure current status

The repository has many large PRD and plan files. Several describe unfinished work as if it were current direction.

Create one short status file. Mark old plans as archived rather than maintaining parallel roadmaps.

### P2 — The public API is nearly undocumented

The package exports one component and one saved-data type. Prop behavior and update rules are not explained.

Document data shape, saved-state shape, CSS import, browser requirements, and prop-change behavior.

## Recommended restart sequence

### Phase 1: restore trust

- Add the root `check` command.
- Fix stale imports and remove obsolete tests.
- Make TypeScript and tests pass before release.
- Fix line-margin mutation, prop updates, calculation order, and saved calculation restore.

### Phase 2: repair the core analysis loop

- Fix import validation and data-loss behavior.
- Fix table resize and shared filtered-row derivation.
- Fix pivot grouping and invalid numeric handling.
- Remove inactive settings and speculative calculator methods.

### Phase 3: make the showcase convincing

- Make example cards semantic and specific.
- Add a narrow-screen workspace layout.
- Label chart actions and charts.
- Feature the cross-filtering workflow with one guided example.

### Phase 4: prepare a new release

- Repair package exports and package documentation.
- Reduce runtime dependencies and move React to peers.
- Update README claims from verified behavior.
- Pack and test the package in one tiny consumer app.

## What not to do yet

- Do not replace Zustand, Crossfilter, D3, or the chart registry without measured evidence.
- Do not build migrations for unreleased saved formats.
- Do not add a large schema or state abstraction before the current boundaries work.
- Do not redesign every chart before the main import-to-insight flow is reliable.
