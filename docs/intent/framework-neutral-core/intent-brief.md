---
title: "Run explorEDA without React at its core"
slug: "framework-neutral-core"
phase: intent
status: current
last_updated: "2026-11-11"
---

# Run explorEDA without React at its core

## The question

Can explorEDA become a multi-framework library? What does it take to remove React from the core of its internals? Is there a clear path, or is it too large to finish?

This brief is a feasibility read, not a commitment. The numbers come from a scan of `packages/explorEDA/src` on 2026-11-11. They exclude test files.

## Short answer

Half of the work is already done. The other half is a rewrite in all but name.

- About 80k lines are plain TypeScript. Of these, about 74k lines have no React import. This half is the data and analysis engine, the server, the CLI, and the chart "plans" that compute layout.
- About 83k lines are TSX in 280 components. This half is every chart body, every settings panel, the field list, the notebook, and the UI kit. It makes about 800 hook calls and 639 `useDataLayer` selector calls.

A clear path exists to a **React-free core with React as one renderer**. Each stage on that path is useful alone. A **second full UI in another framework** is the part that is very large. Do that part only when a real host needs it, and then one chart family at a time.

## What is already framework-neutral

| Area                                                                 | Size                        | React use                          |
| -------------------------------------------------------------------- | --------------------------- | ---------------------------------- |
| `lib/` (analysis, calculations, DSL, notebook, boundaries)           | 30.4k lines                 | 3 files                            |
| `server/`, `cli/`, `node/`, `types/`, `utils/`                       | 10k lines                   | none, except `ChartTypes.ts` types |
| Chart plans (`*Plan.ts`, such as `barPlan.ts`, `scatterPlan.ts`)     | 30 files, 12.4k lines       | none                               |
| `Composition/`                                                       | 19 `.ts` and 9 `.tsx` files | mostly neutral                     |
| Data layer store (`createDataLayerStore` in `DataLayerProvider.tsx`) | about 1.4k lines            | uses vanilla `zustand/createStore` |

Two facts make the path real:

- The data layer is already a vanilla Zustand store. The React part is a wrapper of about 170 lines (`DataLayerProvider`, `useDataLayer`). Any framework can subscribe to a vanilla store.
- The `analysis` entry is already documented and built as "No React". It runs in workers, scripts, and servers. The chart plan pattern moves chart math out of components. Most new chart work already follows it.

## What ties the library to React

1. **The chart contract.** `ChartDefinition` in `types/ChartTypes.ts` holds `icon`, `component`, and `settingsPanel` as React component types. Each `definition.ts` imports its React component and a `lucide-react` icon. So the `core` entry (`charts/registry.ts`, which also imports `createElement`) and every `charts/*` entry pull in React. Only about 7 call sites read these fields, so the seam is narrow.
2. **The chart bodies.** 165 chart TSX files draw SVG through JSX, with 9 canvas paths. Interaction state (brushes, hover, selection, drag) lives in hooks. A main chart file has 20 to 30 hooks.
3. **The app chrome.** Settings panels, field list, schema view, notebook, project and color-scale editors. These are forms and lists, built on the shadcn UI kit.
4. **React-only dependencies.** 13 Radix packages, `@tiptap/react`, `@dnd-kit`, `react-grid-layout`, `react-resizable`, `cmdk`, `sonner`, `react-colorful`, `next-themes`, `lucide-react`, `react-fast-compare`, and `use-custom-compare`. Each needs a replacement in a second framework.
5. **The public API and the hosts.** The main export is the `<ExplorEda>` React component. `apps/demo` (with MDX docs) and `apps/app` are React. About 109 test files use React Testing Library.

## Possible routes

| Route                    | What a non-React host gets                                                                | Size                                                  | Notes                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| A. Embed wrapper         | A `mount(element, props)` function or a custom element (`<explor-eda>`) with React inside | Days                                                  | Fastest real multi-framework answer. React stays as a bundled detail.                                                                    |
| B. Neutral core package  | A React-free entry for store, definitions, plans, and analysis, with a lint gate          | Weeks                                                 | Split `ChartDefinition` into a data definition and a React view binding. Move the store out of the `.tsx` file.                          |
| C. Neutral chart drawing | Chart bodies as framework-free draw functions (SVG or canvas) that read a plan            | One family at a time; months for all 30-plus families | Shares the goal of [headless chart rendering](../headless-chart-rendering/intent-brief.md). Interaction (brush, hover) is the hard part. |
| D. Second full UI        | Native components in another framework (for example SolidJS) for charts and app chrome    | A rewrite of about 83k lines, plus a UI kit           | Doubles the UI surface to maintain. Not worth it without a committed host.                                                               |

Route A answers "use it from Vue, Svelte, Solid, or plain HTML" for little cost. Routes B and C are the real "remove React from the internals" work, and they also help headless rendering, workers, and tests. Route D is the very large part.

## A staged path

Each stage stands alone. Stop after any stage and keep the value.

1. **Embed wrapper.** Add `mount(element, props)` that returns `update` and `unmount`, and optionally a custom element. Prove it from a plain HTML page and one non-React framework. React still ships in the bundle.
2. **Split the chart contract.** Make `ChartDefinition` hold data only: type, name, defaults, validation, filters, and plan. Register the React `component`, `settingsPanel`, and icon in a separate view registry. Make `core` and `charts/*` import no React. Add a check that fails if a core entry imports React.
3. **Free the store.** Move `createDataLayerStore` and its helpers into a `.ts` module. Keep `DataLayerProvider` and `useDataLayer` as the thin React binding. Write a second binding (for example a Solid `createStore` adapter) as a test of the seam.
4. **Prove one chart family neutral.** Pick the bar chart: it has a large `barPlan.ts` already. Draw it from a framework-free function, with the React chart as a thin host. Compare its pixels with the current chart. This is also the first proof for headless rendering.
5. **Decide on a second UI.** Only with a real host. Start from the embed and replace one surface at a time, charts first and app chrome last.

## Risks

- **Interaction lives in hooks.** Brushing, selection, hover, and drag behave well today because of years of fixes in React effects. A neutral version must reproduce that behavior, not only the static picture.
- **Two renderers drift.** If React and a second framework both draw charts, every chart change costs twice. Stage 4 avoids this by putting drawing in one neutral place.
- **The UI kit is the long tail.** Radix gives accessible menus, dialogs, popovers, selects, and tooltips. A second framework needs equal quality for each. Accessibility regressions are likely.
- **Rich text and layout.** `@tiptap/react` and `react-grid-layout` have no drop-in twin in every framework.
- **Docs and tests are React too.** MDX pages and React Testing Library suites would need neutral or duplicate versions.

## What seems settled

- Keep the existing library and demo in React and TypeScript (project rule). This initiative does not convert them.
- The analysis engine stays framework-free. New chart math goes in plans, not in components.

## Questions for Byron

1. What drives this? A host in another framework, a wish to write new UI in SolidJS, headless rendering, or a cleaner architecture?
2. Is an embed wrapper with React inside good enough for non-React hosts? Or must the shipped bundle have no React at all?
3. If the answer to 2 is "no React", which framework comes first, and is the app chrome in scope or only the charts?

## Next step after confirmation

Do stage 2 (split the chart contract) as the first proof. It is small, it is mechanical, and it makes the "React-free core" claim testable with a lint or build check. If Byron needs non-React hosts now, do stage 1 first.

## Related intent

- [Headless chart rendering](../headless-chart-rendering/intent-brief.md): stage 4 is the same proof.
- [Renderer-independent replay](../renderer-independent-replay/intent-brief.md): reproduces values without the renderer. A neutral core makes this simpler.
