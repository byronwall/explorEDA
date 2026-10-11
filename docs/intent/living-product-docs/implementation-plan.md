---
title: "Living product documentation — implementation plan"
slug: "living-product-docs"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Living product documentation — implementation plan

## Plan at a glance

Start by fixing the deploy toolchain, so every later failure clearly comes from the docs change that caused it. Then port the three shipped guides to MDX at `/docs/<topic>`, behind a static gate that runs inside the demo build. That proves the authoring format and the fail-closed build before any new page exists.

Next, give one page a live example with a scripted step, a generated screenshot, and a generated reference, plus the browser gate in the deploy job. That proves the "always correct" loop end to end. Then prove the docs-only kit for pieces smaller than a workspace on one surface page. Only after those proofs does the catalogue fill out: chart types first, then flows and surfaces.

Material pushback:

- **A temporary allowlist of pending targets.** A gate that demands all 20 types and every flow on day one would block every deploy until the catalogue is finished. A typed list of targets not yet documented lets the build pass in the meantime. A test only lets that list shrink, and when it reaches zero the list is deleted. Gaps still fail the build: any new target that is neither covered nor already pending fails.
- **Steps read from the rendered page, not a separate manifest.** Each live example writes its steps and screenshot ids into DOM data attributes. The browser gate reads them from the built page, so the docs and their checks can't diverge.
- **The docs kit stays out of the published package.** It lives in library source, outside `entries.json`, and the demo imports it through a source alias in both dev and build.

Each milestone leaves the demo, examples, viewer, and published guides working.

## Implementation strategy

- **First proof:** Scatter, bar, and rendering guides served from MDX at `/docs/<topic>`. The demo build fails on a missing page, a bad example id, or a missing image.
- **Primary seam:** `apps/demo/src/docs/` owns pages, components, the catalogue, and the step runner. The library exposes `ExplorEda`, `CHART_SETTING_KEYS`, chart definitions, and the internal docs kit. Docs never reimplement chart behavior.
- **Fast local loop:** `pnpm --filter demo dev` for pages. `pnpm --filter demo exec vitest run src/docs` for the static gate. `pnpm --filter demo build && pnpm --filter demo docs:verify` for the browser gate against `vite preview`.
- **Local dependencies:** Existing CSV fixtures in `public/datasets/`, existing example layouts in `demos/`, and Playwright with Chromium as a demo dev dependency.
- **Live confirmation:** The Pages deploy job runs both gates before `upload-pages-artifact`. After merge, smoke-test `/docs/bar` and one example URL.
- **Rollout and rollback:** Every milestone is a revert. Docs move to `/docs/<topic>` as a clean break; `?view=docs` links are not kept. If the browser gate turns flaky, `DOCS_VERIFY=warn` lets a deploy finish with a warning. That switch exists only for the deploy job, and each use is recorded in the run log.

### Material dependency proof strategy

Playwright in CI is the only new external dependency. It is proved locally against `vite preview` first, then in the deploy job, in one milestone (M3). Headless WebGL for the 3D page gets its own check when that page lands (M5). If it fails, that page's narrow screenshot uses Chromium's software GL flags. The live example still mounts in real browsers.

## Milestone 1: Deploys build on the pinned toolchain

Fixes the toolchain before any build or gate changes, so later failures are attributable.

- **Change: `.github/workflows/deploy.yml`**
  - Use `actions/setup-node` with Node 24 and `pnpm/action-setup@v4`, which reads `packageManager` (pnpm 11.9.0). Install with `--frozen-lockfile`.
  - Run `pnpm --filter demo test` after the build. It exists today, and from now on a demo test failure stops the deploy.
  - Verify: run the same install, build, and test locally on Node 24.

### Desired end state

- The Pages run succeeds on the pinned toolchain. `/`, `/examples/scatter-trace`, and `?view=docs&topic=bar` load on the live domain (the last until M2 replaces it).
- A failing demo test stops the deploy before upload.

## Milestone 2: Shipped guides run on MDX behind the static gate

Ports what exists, so the format is judged against shipped pages. No new pages.

- **Change: MDX build**
  - Add `@mdx-js/rollup` before `@vitejs/plugin-react` in `apps/demo/vite.config.ts`, and include `.mdx` in the React plugin.
  - Move content to `src/docs/pages/{scatter,bar,rendering}.mdx`. Keep the prose, layout, and focus handling from `ChartDocs.tsx`, then delete it.
  - Verify: page source line count compared with the 940-line TSX version.
- **Change: routes**
  - Add `/docs` and `/docs/:topic` in `LandingPage`, lazy-loaded so articles don't pull in the workspace bundle. Today `ChartDocs` is imported eagerly.
  - Remove the `?view=docs` branch with no redirect. An unknown topic shows the index link.
  - Verify: extend `ChartDocs.test.tsx` into `src/docs/routes.test.tsx`. Direct-load and refresh each topic on `vite preview` through `404.html`.
- **Change: catalogue and targets**
  - `src/docs/catalogue.ts` lists topics, groups, and the `covers` targets for each page.
  - `src/docs/targets.ts` builds the target set:
    - Every registered chart type, from the registry, as `coverage.test.ts` does.
    - Every required feature in `coverage.ts`.
    - A typed `FLOWS` and `SURFACES` list.
  - `pendingTargets` is a typed list that may only shrink. A test compares its length with the committed baseline.
- **Change: static gate**
  - `src/docs/gate.test.ts` fails when:
    - A target is neither covered nor pending, or a pending target is now covered.
    - An example id is unknown, or an example doesn't show its page's chart type according to `exampleCoverage`.
    - An internal docs link has no topic.
  - The demo `build` script becomes `vitest run src/docs && vite build`, so the deploy's build step fails on any docs error. A missing imported image or an MDX syntax error already fails `vite build`.
  - Verify: each failure is introduced once by hand, and each fails the build with a message naming the page or target.

### Desired end state

- The three guides read the same at `/docs/scatter`, `/docs/bar`, and `/docs/rendering`. The `?view=docs` route is gone.
- Registering a new chart type without a page fails `pnpm --filter demo build`.
- Adding a page means one MDX file and one catalogue entry.

## Milestone 3: One page is fully live and verified in the deploy

The end-to-end correctness proof on `bar`.

- **Change: `LiveExample`**
  - Lazily mounts the public `ExplorEda` with a fixture and a one-chart `savedData` built from the page's declared chart, as `landing/LiveOrderBook.tsx` already does. It never passes `onStateChange` to storage and never reads saved sessions.
  - Includes Start, Reset (remount), and a link to the full example. It mounts only when its container is at least 1024 px wide. Narrower containers show its generated screenshot.
  - Renders `data-docs-example`, `data-docs-steps`, and `data-docs-shot` attributes.
  - Verify: component tests for width gating, reset, and load failure. A test that `localStorage` is unchanged after edits.
- **Change: steps vocabulary**
  - A small set of steps: `click` a mark by `data-*` key, `brush` a numeric range using the axis band's `data-domain` and `data-range`, `filter` a field, and `expect` a row count or a filter chip.
  - Runs from the browser gate only, never on the page.
  - Verify: bar's histogram brush step, with the expected count taken from the fixture.
- **Change: generated reference**
  - `SettingsReference` lists each key of a chart type with its Dashboard text from `CHART_SETTING_KEYS` and its default from `createDefaultSettings`.
  - `src/docs/settingDescriptions.ts` gives each key a one-line description, typed the same way as `settingKeys.ts`, so a new setting fails compilation until it is described.
  - `DashboardTextReference` renders the text keys.
  - Verify: `pnpm --filter demo check-types` fails when a definition gains an undescribed key.
- **Change: browser gate**
  - `apps/demo/scripts/docs-verify.mjs` (Playwright) serves `dist`, then for every catalogue page:
    - Loads at 1280 px with no console errors, mounts each example, and runs its steps.
    - Captures each declared screenshot from `/docs/_capture/<shotId>`, at fixed viewport and scale, into `dist/docs-shots/`.
    - Checks 783 and 390 px for horizontal overflow.
  - The deploy job installs Chromium and runs it before upload.
  - Locally, `docs:shots` writes to the git-ignored `public/docs-shots/`.
  - Verify: a broken step, a renamed selector, and an uncaptureable shot each stop the deploy job with a message naming the page.

### Desired end state

- `/docs/bar` has a working histogram example, a current screenshot at narrow widths, and reference tables that update without edits.
- Nothing hand-captured ships. A stale claim tied to a step stops the deploy.
- Reader sessions and `/viewer` are untouched by docs use.

## Milestone 4: Pieces smaller than a workspace

Proves the docs kit on one surface page before any flow or surface page depends on it.

- **Change: docs kit**
  - `packages/explorEDA/src/docsKit/` exports `DocsChartPanel` (one `PlotChartPanel` in a `DataLayerProvider`) and `DocsSurface` (the settings popover, field list, or rows drawer around a provided state).
  - Not listed in `entries.json`, so it doesn't ship.
  - The demo aliases `exploreda-docs-kit` to that source in both serve and build. Kit examples use library source for all their imports, so no store is split between the built package and source.
- **Change: settings popover page**
  - `/docs/settings-popover` mounts the real popover beside a live chart, with one step.
- **Spike: single library copy**
  - Decision required: can kit pieces share the registry and store with the page safely, given the built `exploreda` is also loaded?
  - Evidence to gather: a bundle check for duplicate `DataLayerProvider` modules; registry contents seen by the kit; one live edit.
  - Fallback: build docs pages entirely from library source (an `EXPLOREDA_DIST`-style switch for docs routes), or limit surface pages to whole workspaces with focused layouts.
- **Verify:** The library's `check-types` and tests cover the kit. The browser gate runs the popover step.

### Desired end state

- One surface is documented with the real component in focus. The published package API is unchanged.

## Milestone 5: Every chart type is documented

- **Change:** Pages for the remaining 18 types in groups: plots, tables and summaries, then supporting and newer views. Each page has a live example, generated reference, and steps for its main selection. The `boxplot` page covers box, violin, and beeswarm modes; `bar` covers histogram and category modes. Remove each type from `pendingTargets` as its page lands.
- **Change: example gaps:** Where `exampleCoverage` shows a type only as `reviewed` (such as `3d-scatter`) or never in focus (`color-legend`), the docs layout focuses it. If no fixture suits, add the smallest one; never change a chart for docs.
- **Verify:** Both gates pass. The 3D page runs a WebGL check in CI and falls back as described above.

### Desired end state

- No chart type remains pending. A newly registered type cannot deploy without a page.

## Milestone 6: Flows, surfaces, and the developer story; the gate goes strict

- **Change: flows** (import, summary to chart, filter, trace, in-place edit, calculated fields, Dashboard text, saved views and undo, projects, export). Use live examples where one state shows the point. Use generated screenshot sequences, captured by the browser gate, for multi-step flows.
- **Change: surfaces** (toolbar, field list, chart header, details dialog, rows drawer, side panels, filter chips). Use the docs kit where focus helps.
- **Change: developer guide** Covers host embedding, `ExplorEdaProps`, `onStateChange`, saved state, and row scopes, carried over from the old rendering milestone. Prop tables are generated from the exported types, with descriptions typed so missing ones fail compilation, as with settings.
- **Change: strict gate:** Delete `pendingTargets` and its baseline once empty, so any gap fails the build.
- **Verify:** Run `pnpm check`, then both gates. Smoke-test the deployed `/docs` index and three deep links.

### Desired end state

- Every target is documented. The gate has no allowlist. Docs that are wrong or missing cannot deploy.

## Cross-cutting verification

- Real input at 1280, 783, and 390 px for each new page (AGENTS.md), sampled per group once the browser gate covers overflow.
- `pnpm check:ui` for docs components. Use no `title` attributes, and name the iframe or live regions with `aria-label`.

## Open decisions and spikes

1. **Steps vocabulary reach** (M3). Decide whether brush and click steps can drive Canvas marks reliably through axis-band data. Evidence: the bar and scatter brush steps run 20 times in CI without flakes. Fallback: drive filters through numeric filter inputs and keep pointer steps to SVG charts.
2. **Single library copy for the docs kit** (M4, spike above).

## Below the cut line

- Site search, pre-rendered article HTML, and responsive image pipelines. These are the Starlight triggers; revisit only if they become required.
- Line-by-line checks of prose claims against steps.
- `/explorEDA/` subpath hosting; versioned docs.
- Visual-diff approval of screenshots; regenerated images are trusted because their capture steps passed.
- Reconciling the tooltip rule in `AGENTS.md` with `docs/ui-defaults.md`.
