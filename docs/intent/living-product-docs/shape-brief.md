---
title: "Living product documentation — shape brief"
slug: "living-product-docs"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Living product documentation — what we are adding

**Outcome:** Every chart type, major flow, and major workspace surface has a page with real, working examples. The site will not deploy while any page is missing, broken, or out of step with the code.

**Primary flow:** Reader opens a page → reads when to use it → interacts with a live example (or, on a narrow screen, sees a current screenshot of the same state) → follows links to the shared concepts.

## Feature scope

```text
Living docs (MDX inside the demo app, one Pages deployment)
├── PLANNED ADDITIONS
│   ├── Coverage targets that come from code
│   │   ├── Chart types: every registered type
│   │   ├── Modes and features: required entries in demos/coverage.ts
│   │   └── Flows and surfaces: a short typed list next to coverage.ts
│   │       ├── Flows: import, summary to chart, filter, trace, in-place edit,
│   │       │   calculated fields, Dashboard text, saved views and undo,
│   │       │   projects, export, host embedding
│   │       └── Surfaces: toolbar, field list, chart header, settings popover,
│   │           details dialog, rows drawer, side panels, filter chips
│   ├── MDX pages that declare the targets they cover
│   ├── Live examples
│   │   ├── Public ExplorEda mounted in the page with a fixture and a
│   │   │   focused layout; no saved session read or written
│   │   ├── Mounted on scroll or Start; Reset; full-example link
│   │   ├── Desktop width only; narrower screens get the screenshot below
│   │   └── Optional scripted steps ("brush 2–4, table shows 37 rows")
│   ├── Screenshots, generated, never hand-captured
│   │   ├── Each live example's state, for narrow screens
│   │   └── Multi-step flows and states a live example can't hold
│   ├── Generated reference: settings per type, Dashboard text keys
│   ├── Docs kit: one chart panel or one surface, from library source,
│   │   not published in the package
│   └── Build gate
│       ├── Static (demo build): every target covered, every example id,
│       │   fixture, link, and reference resolves
│       └── Browser (deploy job, before upload): examples mount without
│           errors, scripted steps pass, screenshots capture
└── LATER POSSIBILITIES
    ├── Site search (a Starlight trigger)
    └── Prose claims checked against scripted steps line by line
```

## Behavior

| Situation | Expected result |
| --- | --- |
| A new chart type is registered without a page | Demo build fails and names the type |
| A coverage feature becomes `required` | Build fails until a page lists it |
| An example id or fixture is renamed | Build fails on every page that names it |
| A setting is added to a chart definition | Its reference table updates with no edit |
| A scripted step's expected result no longer holds | Deploy stops before upload; the step and page are named |
| A screenshot's target can't be found | Deploy stops; no stale image ships |
| A reader edits a live example, then opens `/viewer` | Their own saved analysis is unchanged |

## Examples

Illustrative page source; the syntax is not settled:

```mdx
<Covers targets={["chart:bar", "mode:histogram"]} />

<LiveExample fixture="shop-operations" chart={{ type: "bar", x: "Units" }}
  steps={[{ brush: [2, 4], expect: { tableRows: 37 } }]} />

<SettingsReference type="bar" />
```

## Decisions and boundaries

**Appetite:** The full catalogue, built page by page behind the gate. First, the toolchain fix and the port of the three shipped guides. Fill the catalogue only after that format holds.

**Key decision:** Correctness comes from deriving, not reviewing. Lists, references, and images are generated from code or checked against it, so drift fails the build. This replaces the other initiative's capture manifest and its cut of generated tables. With 20 types and growing, hand upkeep is the main source of drift.

**Key decision:** Mount live examples in the page, as the landing page already does, not in an iframe of `/examples/<id>`. That route reopens and overwrites the reader's saved session, shows the whole demo shell, and can't show a focused layout. If library CSS or overlays leak into the article, add an embed mode that skips session restore and save, and frame that instead.

**Key decision:** Keep the research's tooling: MDX through `@mdx-js/rollup`, the docs branch lazy-loaded, one router, and the root base only. Switch to Starlight if images need per-page glue, navigation grows into a custom framework, or search becomes required.

**Boundary:** `/examples/<id>` and `/viewer` keep working. Docs move to `/docs/<topic>` to match the examples, as a clean break: `?view=docs` links stop working, with no redirect. The gate can't be skipped by default. Rollback is a revert. The tooltip conflict between `AGENTS.md` and `ui-defaults.md` is out of scope; docs controls use visible labels.

**First proof:** **Try:** After the toolchain fix, port scatter, bar, and rendering to MDX. Give bar a live example with one scripted step, a generated narrow screenshot, and a generated settings table, with both gate stages wired into deploy. **Observe:** Each of these fails the right stage with a named message: a fake registered type, a renamed example, a broken step, and a deleted image. The pages read the same at 1280, 783, and 390 px. Saved sessions are untouched. **Decide:** Scale to the catalogue if all hold. If in-page mounts leak, use an embed-mode frame. If the gate is flaky in CI, keep the static stage blocking and fix the browser stage before scaling.

**Decided 2026-10-10:** supersede *Chart and rendering documentation*, allow the unpublished docs kit, and run Playwright in the deploy job. See the [implementation plan](implementation-plan.md).
