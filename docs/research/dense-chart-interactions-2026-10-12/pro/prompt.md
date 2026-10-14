# Dense chart interactions: comparative research and product shaping

https://github.com/byronwall/explorEDA

## Mission and decision

Research how leading analytical visualization tools make frequent chart configuration fast, local, and discoverable. Recommend a broad set of interaction approaches for explorEDA. Help Byron decide which settings deserve strong in-place controls, which belong in context menus, and which can stay in the full settings editor.

This is research and shaping, not application implementation. Codex will collect your work, check its evidence, and integrate new intent and shaping documents in a review PR.

Repository baseline: `c534378c052c9fbb2cb076d1df0d21eb0fa0965e` (short `c534378c`). Codex integration branch: `codex/dense-chart-interactions`. The branch may not yet be pushed. Inspect the immutable baseline or the attached selected source packet. Do not substitute current main without recording the difference.

Act as an expert in analytical desktop and web interaction design. Be candid about strengths, costs, hidden state, discoverability, accidental edits, gesture conflicts, and weak evidence. Do not assume a context menu solves every problem.

## User direction, including the latest correction

Byron wants dense, "just in place" configuration. Example: right-click a scatter point, choose "Color by…", then pick a field without opening the full chart settings editor. This is an example, not a fixed design.

He wants a wide variety of approaches grounded in how other applications actually work. Inventory the various settings and estimate which analysts will change often during exploration. Design excellent mechanics for those frequent tasks. Density means useful actions near their objects, with more room for the data. It does not mean making every control tiny or every action hidden.

LATEST USER CORRECTION: "Pro can also propose new interactions for existing stuff, espeically ALT + Click. The tracing stuff is not super precious. The 'click to filter' stuff is more critical."

Therefore, Alt-click and the present tracing access paths are explicitly open to redesign. Do not treat existing repository rules about Alt-click as an immutable constraint for this proposal. Rank ordinary mark click-to-filter and linked selection much higher. Preserve that core flow in the recommended shape. Offer useful alternatives for reaching traces; do not preserve an awkward gesture merely because code uses it today. Show the concrete benefit, conflicts, and replacement path for any changed gesture. The task changes proposed design docs only; current code and UI rules are observations, not proof that every existing interaction is sacred.

## Access preflight

GO only when the repository identity and baseline match, and the required source and documents can be read. Prefer connected GitHub access when it exposes the exact baseline. The attached `source-packet.md` is an authorized fallback. It is a selected source snapshot, not a runnable checkout. Its manifest records exact paths and SHA-256 hashes. The packet's prompt is a local addition; source sections come from the baseline.

Record source access, baseline, coverage gaps, browser/research tools, and artifact creation capability. Read-only access is sufficient. You do not need a writable repository.

NO-GO if both repository access and the packet are unavailable, the source is for the wrong project, or a missing source prevents answering a priority question. Stop and report the smallest missing input. Do not invent current controls or make a generic report look repository-grounded. If live external research is unavailable, return a partial result with that explicit limitation; a current competitive comparison cannot pass without verifiable sources.

If file creation is unavailable, give complete file contents in your response. State that no repository files, commits, pushes, or PRs were created. Do not stop just because you cannot mutate Git.

## Reading route and verified starting facts

Paths are relative to the repository root. Verify facts against the baseline. The packet supplies the main reading route and supporting files.

1. `AGENTS.md`, `README.md`, `package.json`, `packages/explorEDA/package.json`, `docs/agent-guide.md`, `docs/ui-defaults.md`.
2. `packages/explorEDA/src/types/ChartTypes.ts`, `src/charts/registry.ts`, `src/charts/registerAllCharts.ts`, and each `components/charts/*/definition.ts`. Paths after the package root refer to that package. Use the manifest to resolve exact paths.
3. `packages/explorEDA/src/components/ChartSettingsContent.tsx`, `settings/MainSettingsTab.tsx`, all other settings tabs, and each chart's `*SettingsPanel.tsx`. Read the scatter subeditors for size, density, surfaces, and regression.
4. `packages/explorEDA/src/components/PlotChartPanel.tsx`, `charts/AxisFieldActions.tsx`, `charts/InPlace/useTitleEditing.tsx`, `useAxisEditing.tsx`, `useChartEdit.ts`, and `charts/export/ChartImageMenu.tsx`.
5. `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx`, `charts/BaseChart.tsx`, `charts/ColorLegend/ChartColorLegend.tsx`, `charts/ColorLegend/ColorScale.tsx`, `charts/DataTable/DataTableContextMenu.tsx`, and `charts/Composition/CompositionQuickMenu.tsx`.
6. `packages/explorEDA/src/components/FieldSelector.tsx`, `FieldList/FieldPicker.tsx`, `FieldMetadata.tsx`, `colorScales/ColorScaleControl.tsx`, `hooks/useColorScales.ts`, `providers/DataLayerProvider.tsx`, and `components/ChartGridLayout.tsx`.
7. `apps/demo/src/docs/pages/in-place-editing.mdx`, `chart-settings.mdx`, `scatter.mdx`, `color.mdx`, `filters.mdx`, `trace.mdx`, `scales-and-axes.mdx`, `composition.mdx`, `apps/demo/src/docs/reference/settingDescriptions.ts`, and `apps/demo/src/demos/examples.ts`.
8. `docs/intent/axis-domain-controls/{intent-brief,shape-brief}.md` and the prior chart interaction review under `docs/intent/comparison-opportunities/resources/pro-chart-review/exploreda-chart-interaction-review/`. Prior research is background, not current competitor evidence.
9. Relevant tests in `components/charts/InPlace/`, `ScatterPlot/ScatterSvg.test.tsx`, and `DataTable/__tests__/DataTableContextMenu.test.tsx`.

Verified starting observations:

- This is an existing React and TypeScript library and demo. Keep React; do not propose a framework conversion.
- `updateChart(id, partial)` is the shared chart-settings write path. `useChartEdit` groups a continuous edit into one host state notification and supports cancel.
- Chart settings apply valid edits live and have a session Reset. Tabs include Data/Compose, Fit, Facets, Axes, Filters, Labels, Notes, and Spacing where relevant.
- Titles already support inline editing. Numeric axes already support a local range editor and dragging to pan/stretch. Check exact event handling rather than assuming `dblclick` works on a grid drag handle.
- Axis labels offer field inspection and a context menu. Table headers and cells have menus. Composition objects have a quick menu that opens the matching editor section.
- The chart panel provides an image-export menu when a more specific menu does not handle right-click. Existing chart menus include image export commands. Review how proposed menus coexist with this behavior.
- Scatter exposes X/Y, color, size, opacity, display modes, regression, and other controls. Choosing a color field can create or reuse a shared color scale; a local-looking palette edit may affect other charts. Treat scope explicitly.
- Category legend clicks filter. Alt-click/Alt-Enter commonly reach traces. Plain empty-plot clicks clear that chart's filters. These are current observations; the latest user correction allows tracing gestures to change.
- Current source has practical seams for field metadata, searchable field selection, nonmodal popovers, in-place transactions, and trace targets. Do not invent a general command framework before proving one useful path.
- There is no supplied usage telemetry. Frequency rankings must be hypotheses, not measured facts.

Useful commands in a runnable checkout: `pnpm --filter demo dev`, `pnpm check:ui`, `pnpm --filter exploreda check-types`, `pnpm --filter exploreda exec vitest run src/components/charts/InPlace/titleEditing.test.tsx src/components/charts/InPlace/axisEditing.test.tsx`, `pnpm --filter demo docs:check`, `pnpm check`, and `pnpm shot`. Do not claim any were executed from the selected snapshot. Codex owns later local checks.

## Ranked research questions

### 1. Which changes deserve the shortest route?

Inventory every existing user-facing chart setting and relevant local action. Use the settings definitions, panels, and generated reference descriptions. Cover all registered chart families, including uncommon ones. Group equivalent settings, but show chart applicability and exact source symbols/keys. Distinguish chart, facet, mark, series, selected rows, shared scale, and workspace scope.

For each setting family, record current route, expected frequency during exploratory work, evidence class, confidence, cost of the current route, likely benefit from local access, best target surface, proposed route, risks, and disposition. Use high/medium/low frequency hypotheses with scenarios. Separate frequency of changing a field from frequency of changing a cosmetic property. Do not equate authoring frequency, reading frequency, and repeated analysis frequency. Include settings that should remain in full settings.

Explicitly cover field bindings, X/Y swap, color/size, palette and category colors, axes and scale type/range, sort/top N, count/sum/average and measures, grouping/binning/time grain, split/stack/normalize, facets, mark opacity/size, regression, labels/format/title/note, reference marks, chart type, table/pivot controls, map controls, and specialty charts when present. Clearly separate currently supported properties from new concepts.

### 2. What do other tools demonstrably get right?

Study an evidence-based set of leading or instructive tools. Aim for 8–12 products across at least four families. Candidates include Tableau Desktop/web authoring, Power BI on-object interaction, JMP, Spotfire, Origin/OriginPro, Excel, Qlik Sense, and a modern browser-first tool such as Datawrapper, RAWGraphs, Observable, or Flourish. Select based on relevant documented mechanics, not brand prestige. You may replace weak candidates and explain why.

Use current primary sources: vendor documentation, official demos/videos, and first-party release notes. Seek specific gestures and menus, not marketing claims. Record product/version/platform/date/access date where available. For each transferable pattern identify the object hit, click/right-click/double-click/drag/modifier/keyboard behavior, resulting control, scope, persistence, and undo. Distinguish authoring from viewer interaction. Separate observed browser behavior from documented behavior and inference. A video must have a useful timestamp. Do not claim hands-on testing you did not do.

Compare how tools handle selection versus editing, nested targets, overlapping/dense marks, many fields, menu search, editable legends/axes, object toolbars, field shelves, small multiples, and settings panels. Include evidence against attractive ideas. Describe why a mechanism transfers, or fails to transfer, to explorEDA's linked-filtering workspace.

### 3. What broad interaction space should we consider?

Offer seven genuinely contrasting approaches before selecting a combination. Examples to examine, not mandatory solutions: semantic object menus; direct manipulation; editable labels and encoding chips; an object toolbar; keyboard-first commands; an explicit temporary edit mode; intent-aware compact editors. Include a strong minimal approach that reuses current controls. At least four approaches must differ in their governing interaction model.

Then provide a larger concrete pattern catalog (at least 25 useful patterns if evidence and source coverage support them). Patterns may combine approaches. Cover marks, empty plot, axes/ticks/titles, legends/swatch/title, series, facets/headers, annotations, table headers/cells, and chart header. Include single/double click, right-click, Alt-click, dragging, keyboard, touch/long press, and a discoverable fallback. Do not force every gesture onto every target.

Investigate the exact scatter flow: right-click point → Color by… → field picker → chart and legend update. Contrast it with at least three strong alternatives, including a redesigned Alt-click route. State whether a point targets one record, all points, one series, or the chart's color encoding. Show the menu wording that prevents a scope mistake. Cover no current legend, no color field, numeric vs categorical fields, computed fields, nulls, long names, and hundreds of fields.

### 4. What coherent gesture and editor model should explorEDA adopt?

Propose a target × gesture map, conflict resolution, event precedence, and hit-target rules. Preserve immediate ordinary click-to-filter; do not delay it to wait for double-click detection. Consider selection/filter side effects before and after context-menu opening, dragged gestures, overlapping points, touch scrolling, OS/browser modifiers, Shift+right-click browser-menu access, keyboard context-menu keys, and focus return.

Treat Alt-click tracing as redesignable. Compare keeping it, replacing it with configuration, and placing trace in another reachable surface. Name any user-facing convention that would change. Preserve access to needed inspection without letting it dominate the design.

Specify live preview, commit, Escape, undo grouping, reopen state, field compatibility, invalid values, chart-local versus shared changes, and how compact editors stay near the data at 1280, 783, and 390 px. Distinguish pointer shortcuts from the visible and keyboard/touch paths required to discover and complete the same action. Explain how this avoids a huge nested menu or duplicate settings implementation.

### 5. What should the first proof and later shape be?

Recommend a bounded first slice and a broader route after proof. Keep proposals separate from accepted user decisions. Compare the strongest materially simpler alternative. Suggest tasks that can reject the design based on discoverability, success rate, input count, wrong-scope edits, accidental filters, keyboard completion, and loss of context. Do not invent measured times or thresholds; label proposed acceptance gates.

Name existing code seams and likely collision points. Keep one settings write path and the current saved-data model unless evidence demands more. Include docs pages/sections and a demo example in the same proposed slice as each user-visible addition. Keep implementation outside this run. No enterprise abstractions, broad renderer rewrite, or new dependency without a clear payoff.

## Evidence and recommendation rules

- Cite exact repository paths and symbols for every substantive recommendation. Cite external primary URLs for competitor claims.
- Separate facts, inferences, proposals, and untested frequency estimates. Provide confidence and missing evidence.
- Each recommendation needs an ID, problem, affected settings/targets, proposed route, repository anchors, external evidence or a clear original-design label, benefit, costs, alternatives, scope/API impact, and falsifiable proof.
- Classify recommendations as Keep, Fix now, Explore, Avoid, or Defer. Codex will record a separate integration disposition.
- Do not call any product objectively "best" without criteria. Do not use feature counts as evidence of usability.
- Preserve click-to-filter. Treat the supplied gesture hierarchy as more current than conflicting repository prose.
- Stop expanding research when priority questions and evidence coverage are met. Do not pad the catalog with cosmetic variants.
- Do not modify the application, run remote writes, create accounts, purchase access, send messages, or create Git commits/PRs. Read-only product research and downloadable output creation are in scope.

## Output contract

Return a ZIP named `dense-chart-interactions-research.zip` plus standalone files below. Link every file in the final response. Use ordinary Markdown links in artifacts; avoid chat-only citation tokens. Include a manifest with SHA-256 hashes when tools permit.

1. `report.md`: standalone synthesis, comparison evidence, seven contrasting approaches, recommended combination, rejected ideas, gesture redesign including Alt-click, and unresolved questions. Put detailed tables in companion files.
2. `settings-inventory.csv`: all setting families with keys/paths, chart applicability, scope, current route, frequency hypothesis, confidence/evidence, proposed surface, route, benefit, and disposition. Mark coverage gaps.
3. `interaction-catalog.md`: at least 25 distinct, concrete patterns when supported, with worked sequences and source links. Include the scatter Color by case and alternatives.
4. `gesture-map.csv`: target, gesture, existing behavior, proposed behavior, priority/conflict rule, scope, keyboard/touch alternative, and change rationale.
5. `recommendations.json`: stable IDs, the required fields above, source IDs, exact repo anchors, and proof for each substantive recommendation.
6. `sources.json`: stable IDs, URLs, product/version/platform, dates, supported claims, evidence type, and limits. Include accessed and unavailable sources distinctly.
7. `proof-plan.md`: smallest local proof, proposed rejection gates, representative tasks, conflicts, responsive/keyboard checks, documentation and demo scope, and a clear cut line.
8. `proposed-intent-brief.md`: 650–950 words maximum target, never over 1,500. Lead with outcome and user priorities. Treat the scatter example as illustrative. Do not expose research bookkeeping in the prose.
9. `proposed-shape-brief.md`: about 400–800 words, hard maximum 1,000. Use Outcome and Primary flow, a nested tree of capabilities (planned/evaluate/later), optional behavior examples, and Decisions and boundaries. End with Try → Observe → Decide for the first proof. Include at most two unresolved product judgments.
10. `manifest.json`: artifact filenames, byte sizes, hashes, baseline, access limits, and checks actually performed.

Codex will preserve originals under `docs/intent/dense-chart-interactions/raw/2026-10-12-pro/` and reconcile into `intent-brief.md`, `brainstorm.md`, `shape-brief.md`, and `initiative-map.json` under `docs/intent/dense-chart-interactions/`. Those final files are Codex's responsibility, not a claim that you wrote them in Git.

## Final quality gate

Declare COMPLETE only when source identity is verified; all ranked questions have useful answers; frequency is honestly labeled; competitor mechanics have primary evidence; breadth includes real alternatives; the gesture proposal protects click-to-filter while reconsidering Alt-click; the output artifacts exist or the complete response fallback is supplied; and scope/validation claims are accurate.

Declare PARTIAL or NO-GO for missing required evidence or artifacts. Explain the exact gap and smallest next step. Final response: access/baseline, concise recommendation, artifact links, actual checks, assumptions, and unresolved limits. Do not claim product tests or implementation work from research alone.
