# Which composition examples should become built-in charts?

https://github.com/byronwall/explorEDA

## Mission and decision

Review every composition example in explorEDA. Decide where composition is justified and where built-in charts should meet the need.
The source baseline is commit `269485c6c94b411e27f440ea495ef225110c9a84`.
Codex is preparing this review on branch `codex/composition-builtins-review`.
Use the baseline source, including the attached selected source snapshot, rather than assuming the review branch is available remotely.

Byron's direction:

> I want to investigate the various composition examples. It seems several of those could be done as “proper” built in charts with a couple new settings or tweaks.
>
> Do an exhaustive review of every composition example and determine which ones are “justified”. For ones that are close to supported describe the changes or tweaks needed to have them be “built in”. My general view is that composition is advanced and users should only be required to do it if a chart is truly complicated in a way that goes beyond built in charts. We should be able to make built in charts more advanced progressively for users that can handle it.

The intended outcome is progressive access to chart capabilities. Do not assume that each composition deserves a new chart type.
Do not assume that the current absence of a setting justifies requiring composition.
Challenge the hypothesis where the implementation cost or interaction model supports a different conclusion.

This is a product and source review. Produce research and recommendations for Codex to reconcile through Software Design Sleuth.
Do not implement features, modify the repository, create issues, commit, push, or open a PR. Codex owns integration and the review PR.

## Access preflight and stopping rules

GO when you can identify the repository, baseline, inventory, example definitions, and relevant built-in implementations.
The attached `source-packet.zip` is an authorized alternative to connected GitHub access.
Its `source-manifest.json` lists source paths, hashes, baseline, and separately identified local additions.
It is a selected source snapshot, not a runnable checkout. It excludes dependencies and build output.
Inspect its contents before reporting an access failure. A local path in this prompt is not a remote link.

Report whether you used connected GitHub, the packet, or both. Identify any differing source revisions.
Use the packet baseline for findings. Separate later changes if live repository content differs.

NO-GO for a complete verdict if the inventory, an example definition, or a material comparison source is unavailable.
List the exact missing paths and the smallest source request that would unblock the review.
Preserve useful partial analysis, but do not claim exhaustive coverage from screenshots, names, or documentation alone.
Lack of browser rendering or an installable checkout does not block a source review. Mark product tests as unrun.
Stop before any action outside research and downloadable artifact creation.

## Reading route

1. `AGENTS.md`, `README.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, and both root and library `package.json` files.
2. `docs/research/composition-builtins-2026-10-12/inventory.json`, `apps/demo/src/demos/exampleIndex.ts`, `examples.ts`, `dashboardSettings.ts`, and `coverage.ts`.
3. `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/docs/pages/composition.mdx`, and `docs/composition-mode.md`.
4. `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts`, `resolveComposition.ts`, `resolveUnit.ts`, mark resolvers, editor controls, trace code, and tests.
5. Every relevant built-in chart's `definition.ts`, settings panel, planner, renderer, and tests under `packages/explorEDA/src/components/charts/`.
6. Under `packages/explorEDA/src/`: `types/ChartTypes.ts`, `types/SavedDataStructure.ts`, `charts/registry.ts`, `charts/registerAllCharts.ts`, `components/ChartSettingsContent.tsx`, settings tabs, facet logic, `lib/annotations/`, `lib/dsl/`, and `utils/saveDataUtils.ts`.
7. `docs/intent/progressive-built-in-charts/intent-brief.md` and the existing `docs/intent/composed-analytical-graphics/` and `docs/intent/reference-marks/` briefs and plans.

Follow imports to actual behavior. A type field or documentation claim does not prove a rendered feature works.
Some existing intent text is stale. For example, the composed-graphics brief calls banana and yield-gap references unbuilt, but both have dashboard definitions.
Treat intent as context; verify delivery claims against source.

The demo's `/examples/<id>` routes and legacy `?example=<id>` links can help inspect a running app.
Use the examples at the selected baseline if a local environment is available. State when live `https://exploreda.dev` cannot be tied to that revision.

Relevant commands, when a runnable checkout and dependencies exist:

```sh
pnpm dev:agent
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter exploreda exec vitest run src/components/charts/Composition
pnpm --filter exploreda check-types
pnpm --filter demo docs:check
pnpm check:ui
```

Do not run installation or pretend these commands ran in a selected source packet.

## Exhaustive scope

The baseline inventory contains 29 examples. Review each separately:

`message-log`, `driving-shifts`, `tech-sparklines`, `forecast-fan`, `time-use`,
`media-deaths`, `measles`, `causes-by-age`, `consumer-confidence`, `pew-meaning`,
`income-life`, `covid-tiles`, `covid-compare`, `elections`, `lincoln-ridgeline`,
`climate-ridgeline`, `banana-yields`, `yield-gap`, `middle-class-jobs`,
`du-bois-income`, `tax-slope`, `titanic-waffle`, `unemployment-stream`,
`population-pyramid`, `gdp-bump`, `scotus-timeline`, `stocks-horizon`,
`co2-swarm`, and `titanic-mosaic`.

Reconcile that list against the source registry and coverage entries. Inspect additional saved tabs and documentation examples.
The live docs example named `composition` focuses the `message-log` dashboard; list aliases without counting them as distinct designs.
If you find another composition, add it with evidence and explain the count difference.
Keep raw research references distinct from delivered examples; they are not automatically additional required examples.

## Priority questions

### 1. Which examples justify requiring composition?

For every example, separate its analytical task from its authored presentation.
Compare the closest existing chart or combination of built-in views.
Distinguish analytical equivalence from preserving the exact single-graphic presentation.
Losing essential comparisons, linked selection, source tracing, or output context is not equivalence.
Custom typography, titles, notes, legends, or ordinary callouts alone do not establish analytical complexity.

Choose a primary category:

- `already-built-in`: reachable through current public settings and normal data preparation.
- `small-extension`: a bounded addition to an existing chart completes the useful behavior.
- `new-built-in-family`: a coherent reusable chart needs its own mode or family, beyond a small tweak.
- `composition-justified`: essential arrangement or semantics exceeds a sensible built-in contract.
- `mixed`: the core should be built in, while this authored treatment still earns composition.

Also give separate yes/no/conditional answers for whether composition is required today, should remain required, and is useful as an advanced teaching example.
This prevents “keep the example” from being confused with “require this workflow for users.”

Include a concise verdict, exact source paths and symbols, nearest built-in, existing supported pieces, missing pieces, and confidence.
Do not hide a new transformation, renderer, or selection model behind the phrase “just one setting.”

### 2. What exact changes would close each gap?

For near-supported examples, describe the smallest complete change across settings, preparation, drawing, and interaction.
Name affected types, settings panels, planners, serializers, validators, and source-trace behavior.
Separate an existing but undiscoverable setting from new logic, visual polish, and a new chart family.
State the resulting author flow and a short proposed settings example where it helps. Label proposed API syntax explicitly.

Check these likely comparison areas without treating them as predetermined recommendations:

- Scatter already has size/color fields, numeric axes, annotations, facets, density views, and fits. Inspect log behavior and record-label support.
- Line has numeric/raw series and calendar summaries, area modes, styling, annotations, and facets. Verify ordering and grouping rather than assuming they match composition paths.
- Bar has grouped, stacked, and percent series. Compare normalization, category order, labels, horizontal layouts, and trace denominators.
- Heatmap and calendar overlap with repeated strips. Verify date bins, category limits, order, missing rows versus missing values, and color scales.
- Box/violin and ECDF overlap with distribution displays. Distinguish paired summaries, ridgelines, jitter, and beeswarms.
- Tables and facets may cover sparkline or repeated-chart needs, but confirm whether embedded charts, focus series, inset frames, or tile placement exist.
- Annotations already support several marks. Do not propose a duplicate notes system or claim every renderer has equal annotation support.

For each gap bundle, list all examples it helps, boundaries, relative effort with reasons, maintenance cost, and a proof that can reject it.
Separate reusable numerical or layout helpers from a proposal to compile all built-ins into composition.

### 3. How should users gain advanced controls progressively?

Describe a concrete path from adding a built-in chart, to common settings, to advanced options, to composition when needed.
Specify which controls belong together and what should stay hidden until relevant.
Use existing settings conventions, live editing, facets, tooltip rules, and saved state.
Explain how a user learns why a requested design exceeds the built-in chart.
Compare at least: targeted settings, named display modes or presets, a new chart family, and a wrapper around composition.
Include the strongest smaller alternative. Reject a general framework unless multiple examples require it and its costs are justified.
Do not require free-form code, raw composition JSON, or manual mark construction for ordinary chart operations.

### 4. What should change in the example collection and next work?

Recommend for each example: keep as advanced composition, add a built-in counterpart, move its primary teaching path, or retire a redundant demonstration.
These are proposals, not permission to delete examples.
Prioritize a small set of reusable additions by user benefit and breadth, with explicit dependencies and cut lines.
Give a first proof with a Try → Observe → Decide rule. Preserve useful intermediate behavior after each proposed step.

## Evidence and invariants

Label observed source facts, inferences, and proposals. Cite repository paths plus symbols or baseline line ranges for every verdict.
Disclose uncertainty instead of filling gaps with conventional chart-library behavior.
Verify external facts through primary sources only when they materially affect a recommendation. A generic visualization survey is outside scope.

Check preservation of: linked filters; exact source rows and aggregation denominators; stable scales and colors under filtering;
local view limits versus filters; nulls versus absent rows; saving/restoring; Dashboard text round trips; facets;
keyboard access; trace access; and ordinary undo semantics.
Record composition export fidelity separately from dashboard rendering. Do not silently weaken one to claim parity.
Do not infer complexity merely from JSON size or count a cosmetic difference as a new chart family.

This is a personal React/TypeScript project using pnpm. Prefer direct, modest extensions.
Avoid migrations, version coexistence, speculative compatibility layers, universal grammars, and unrelated architecture work.
Use few meaningful tests. Do not propose tests that merely mirror internal structure.

## Deliverables

Produce these downloadable files at the artifact root, plus `composition-builtins-review.zip` containing the same files:

1. `composition-builtins-review.md`: standalone report with a short recommendation, complete 29-row verdict table, detailed per-example reviews, grouped changes, progressive settings proposal, rejected alternatives, and proof sequence.
2. `composition-verdicts.json`: one object per example. Fields: `id`, `category`, `required_today`, `should_remain_required`, `teaching_value`, `nearest_builtin`, `supported`, `gaps`, `change_ids`, `analytical_parity`, `presentation_parity`, `catalog_action`, `evidence`, `confidence`, `open_questions`.
3. `composition-recommendations.json`: stable IDs such as `REC-01`; title, proposal, affected examples, specific code seams, benefit, cost, alternatives, dependencies, proof, and uncertainty. Include deferred and rejected proposals explicitly.
4. `sources.json`: accessed repository files and external URLs, baseline, access limits, checks actually run, checks not run, and inventory reconciliation.
5. `manifest.json`: output file names, sizes, hashes when available, example count, verdict counts, recommendation count, and any missing deliverable.

Do not put the ZIP's hash inside itself. Link the ZIP and all five companions in the final response.
If downloadable file creation is unavailable, return complete Markdown and JSON contents in the response for Codex to save.
State clearly that no repository file, commit, push, or PR was created.
Codex will preserve originals under `docs/intent/progressive-built-in-charts/raw/2026-10-12-pro/` and integrate the findings separately.

Before declaring success, confirm:

- Every baseline ID appears exactly once in the verdict JSON and detailed review.
- Aliases and extra discoveries are accounted for; category counts match the inventory.
- Every “small extension” names its missing behavior, actual code seams, interaction costs, and a falsifiable proof.
- The report distinguishes useful teaching examples from required authoring workflows.
- The progressive settings proposal preserves a simple initial chart and an honest boundary to composition.
- Every priority question is answered with evidence, or explicitly marked unresolved.
- Each JSON file parses and each linked artifact is readable.
- Actual source review, artifact checks, executed tests, and proposed proofs are reported separately.

Final summary: access and baseline; reviewed example count; category counts; highest-value additions; cases that still justify composition; checks; artifact links; blockers.
