https://github.com/byronwall/explorEDA

# Research mission: exceptional time series and arbitrary Y axes

Act as a candid expert in industrial trend analysis, interactive chart design, and React/TypeScript visualization libraries. Decide which time-series capabilities explorEDA should build next, with arbitrary per-series Y scales as the primary question. Produce research and a proposed design, not application changes.

Baseline: commit 9b16d78e3ed0742ed4d5858c1939fec9e758b510. Codex integration branch: codex/time-series-axes-research-2026-10-18. Repository: byronwall/explorEDA. Live product: https://exploreda.dev. Read the attached selected-source packet if repository indexing cannot expose this exact baseline. It is not a runnable checkout. Its manifest gives paths and SHA-256 hashes. Codex owns local integration and the review PR.

## User outcome and uncertainty

Byron wants the time series charts to be amazing and the app to be better. He is interested in arbitrary Y axes. He recalls an Internet Explorer tool from a chemical plant; his sentence ends at “the ability to plot every line on its”. Treat “its own scale/axis” as a working interpretation, not a confirmed quote. Do not claim to identify that tool. Research industrial trend tools to recover useful interaction patterns. Evaluate independent scales seriously while explaining their risks. This is a personal developer project, so favor small changes with strong analytical value.

## Access gate

GO only after verifying the repository identity, baseline, source coverage, and required code/docs through GitHub or the attached packet. State which route you used. Confirm web research tools can reach current primary sources. Read-only output is allowed and expected. If writing downloadable files is unavailable, provide all complete artifact contents in the response.

NO-GO for a wrong repository, missing critical source in both access routes, no research capability, or an essential product choice you cannot leave explicit. State the smallest remedy. Partial access may support a clearly limited report, never a claimed complete review. Do not guess unsupported implementation facts. Stop expanding scope once the ranked questions and acceptance gates have useful answers.

## Verified starting facts; confirm against source

This existing app uses React and TypeScript, pnpm 11.9.0, D3 scales/shapes, and linked filtering. Keep its framework. LineChart dispatches observation lines and Calendar summaries to different renderers. SeriesSettings currently has useRightAxis: boolean; this is not arbitrary axes. Calendar settings specify one measure plus an optional split field. Current rules preserve full-source axis domains across linked filters, allow explicit view ranges without filtering rows, keep hover readouts in the header, and use Alt-click for source traces. Do not assume UI settings work identically in both renderers. The line docs say each series can use the right axis; verify renderer behavior rather than trusting that sentence.

## Reading route (at minimum)

1. AGENTS.md, docs/agent-guide.md, docs/ui-defaults.md, CODING_STANDARDS.md, README.md, package.json, packages/explorEDA/package.json.
2. packages/explorEDA/src/components/charts/LineChart/definition.ts, LineChart.tsx, TimeSeriesChart.tsx, timeSeriesPlan.ts, timeSeriesTrace.ts, LineChartSettingsPanel.tsx, TimeSeriesSettingsPanel.tsx, LineSeriesSettings.tsx and their tests in that directory.
3. packages/explorEDA/src/components/charts/Axis/{axisPlan.ts,axisBounds.ts,numericScale.ts,AxisLayer.tsx}; packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx; packages/explorEDA/src/types/ChartTypes.ts; packages/explorEDA/src/lib/{chartUtils.ts,dailyRollup.ts,valueParsing.ts}.
4. apps/demo/src/docs/pages/line.mdx, apps/demo/src/demos/{examples.ts,coverage.ts,dashboardSettings.ts}; docs/intent/progressive-built-in-charts/{shape-brief.md,implementation-plan.md}.

Discover dependencies as needed through GitHub; state packet limits. Do not report tests as run unless you actually ran them. Available local commands for Codex later: pnpm --filter exploreda exec vitest run src/components/charts/LineChart/TimeSeriesChart.test.tsx src/components/charts/LineChart/LineChart.test.tsx; pnpm --filter exploreda check-types; pnpm --filter demo dev; pnpm check. Browser proof uses 1280, 783, 390 CSS px and real keyboard/pointer input.

## Ranked questions

1. What should arbitrary Y axes mean here? Compare one scale per line, named shared scale groups (often by unit), multiple visible left/right axes, a focused axis for the selected series, normalized/indexed overlays, and vertically stacked trend lanes with shared time. Compare 2, 6, and 20 series, mixed units, very different ranges, and one same-unit outlier. Distinguish magnitude comparison from shape/timing comparison. Pick a preferred design or a small hybrid with explicit mode transitions, defaults, and deferred parts. Do not reduce the answer to a generic warning against dual axes.
2. Compare current industrial trend systems and mainstream visualization providers using current official docs, demos, or vendor manuals. Include at least two industrial systems (investigate AVEVA PI ProcessBook/PI Vision, Aspen Process Explorer/Process Data, Seeq; verify names/status), Grafana, and at least three suitable libraries among Highcharts Stock, Plotly, Apache ECharts, SciChart, uPlot, and Vega-Lite. Explain what to borrow, adapt, or avoid for this app. Mark documented versus observed versus inferred behavior. No guessed product identification or unsupported feature checkmarks. Separate a product UX comparison from a library replacement decision; replacement is not the default.
3. What makes the whole line/time-series experience excellent? Rank navigation, shared crosshair and precise values, per-series identification, unit/scale visibility, range edits/reset, brushing versus zoom, synchronized views, missing/irregular samples, duplicates, interpolation, downsampling without losing extrema or traceability, annotations, accessibility, responsive layout, and performance. Separate essential improvements from attractive scope expansion. Explain whether each belongs to observation lines, calendar summaries, or both.
4. Ground the proposed data model and UX in this repository. Propose the smallest coherent scale/series state shape with examples, ownership, persistence, annotations, export, trace, facets, undo and unit formatting behavior. Name exact modules that would change. Avoid enterprise frameworks and compatibility/version coexistence without a concrete need. Discuss existing useRightAxis saved settings as a product/API decision, not a reason to invent a migration system.
5. Define a proof-first phased implementation plan. Each user-visible milestone must include its docs section and demo example in that milestone. Include acceptance and rejection gates, likely failure points, bounded prototype experiments, effort, dependencies, and explicit deferred items. Do not start implementation.

## Evidence and comparison method

Browse current primary sources and cite direct URLs near claims, with access dates and version limits. Use exact repository paths and symbols for current behavior. Separate verified fact, inference, and proposal. If a live product cannot be operated, say so; docs do not prove interaction quality. Score competing designs 0–10 on task-specific dimensions such as scale attribution, physical-value reading, timing comparison, 20-series density, filter stability, accessibility, and implementation cost. Define scores and justify them; do not use an unexplained total. Include both advantages and failure cases. Verify the sources that decide the recommendation. Give stable recommendation IDs TS-01 onward, affected files, value, cost, alternatives, confidence, and a falsifiable proof method. Proposals remain unapproved.

Required concrete scenarios: temperature/pressure/flow with different units and ranges; six same-unit sensors with an outlier; twenty irregular process tags; weekly sales calendar summaries with missing periods. Use synthetic data only, clearly labeled. Include a textual interaction walkthrough and a state example for the preferred option. Evaluate misleading crossovers and apparent correlations, hidden or ambiguous axis ownership, log/nonpositive values, manual clipping, stable filtered domains, and narrow layouts.

## Scope and non-goals

Research, comparison, proposed intent/design and implementation planning only. Do not mutate the repository, commit, push, open a PR, replace the rendering library, deploy, or add industrial historian ingestion/live streaming. Codex integrates the findings later. No unrelated UI redesign. Keep source tracing, row selection, stable scales, and existing annotations visible as constraints. No promises that an unbuilt design passes tests.

## Deliverables

Create these standalone UTF-8 files, suitable for preservation under docs/intent/time-series-axes/raw/2026-10-18-pro/:
- time-series-axes-research.md: concise decision summary, current-state audit, sourced provider comparison, scored alternatives, preferred UX/data model, four scenario walkthroughs, risks, unanswered questions.
- recommendations.json: array of stable IDs with problem, proposal, evidence (repo and external), priority, confidence, cost, affected paths, alternatives, proof, and proposed disposition.
- proof-plan.md: phased proof-first plan, milestone docs/demo scope, rejection/acceptance gates, measurements, and unrun checks.
- sources.md: direct primary-source links, what each supports, access dates and evidence limits.
- time-series-axes-research.zip: all four files plus manifest.json with sizes and SHA-256 hashes. Also link the four standalone companions and manifest.

If file tools fail, return complete content for every file in the response and explicitly state no files were created. Final summary: access route/baseline, files read, actual checks run, recommendation count, selected design and rejected alternatives, deliverable links, remaining blockers. Codex will inspect, verify decisive claims, classify every recommendation adopt/investigate/defer/reject, and integrate a review PR. Material gaps can receive at most two bounded follow-ups in this same conversation.

Success requires an evidence-backed answer to each priority question, at least two industrial and four mainstream provider comparisons, a concrete arbitrary-scale proposal with truthful tradeoffs, repo-specific impact, complete outputs, and explicit unrun proofs. Reject a generic feature wishlist, superficial aesthetic advice, unsupported product claims, or a recommendation that ignores the separate calendar renderer. Stop with clear limits when a gate fails; do not pretend completion.
