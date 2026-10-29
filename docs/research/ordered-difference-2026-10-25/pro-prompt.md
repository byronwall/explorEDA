# Ordered lag and difference preparation

https://github.com/byronwall/explorEDA

Source commit: `95832bd473884aeae23453af0888b4ca5187820d` (origin/main).
Mode: Design.

## Mission

Design reusable ordered lag and difference fields for explorEDA.
Decide how an analyst should compare each observation with its predecessor, then build that workflow in shippable milestones.
Support repeated readings, event sequences, and change analysis across entities.
Byron, the owner, wants the capability. Do not require outside demand or a usability study.
Argue the strongest design with a staged implementation, rather than defaulting to upstream preparation.

Act as a data preparation designer who has shipped analytical query tools.
Compare credible approaches candidly, including their user experience, semantics, costs, and failure cases.
Codex will check your conclusions and own all repository edits.

## Access check

Read the attached complete source packet at the named commit.
Confirm access before researching. If a decisive file is absent and inaccessible from GitHub, stop and name the smallest missing input.
Do not infer unseen code from an old intent document.
The packet is the current implementation; intent briefs are proposals and can contain stale claims.
The old demand gates in R049 and related briefs are superseded by docs/research/DIRECTION.md.

## Reading route

Read the packet inventory, then at minimum:

1. AGENTS.md, docs/agent-guide.md, docs/research/DIRECTION.md, README.md, and CODING_STANDARDS.md.
2. packages/explorEDA/src/types/AnalysisProject.ts and lib/analysis/evaluateProject.ts.
3. lib/analysis/projectFile.ts, lib/dsl/project.ts, and their supplied tests.
4. components/project/stepEditing.ts, ProjectQueryPanel.tsx, QueryFlow.tsx, QueryStageRows.tsx, and ExplorEdaProject.tsx.
5. lib/analysis/useAnalysisEvaluation.ts, lib/valueParsing.ts, and calculation function registry.
6. lib/project/folder.ts, writeFolder.ts, lib/notebook/compileNotebook.ts, and docs pages for project folders and notebooks.
7. R049 and related calendar-period/reusable-output intent briefs.

Paths after item two are relative to packages/explorEDA/src unless they name another root.
All files named in the packet are supplied in full.

## Current facts and adjacent proposals

AnalysisStep currently has source, lookup, expand, calculate, filter, and aggregate operations.
calculateFrame evaluates each expression against one row. Query filters have explicit positions in the step graph.
Results have row keys, sourceRows, contributors, and optional aggregate measureContributors.
Do not assume these existing structures already explain a cross-row derived value.
Entity keys can be absent or duplicated; source references then use positional row keys.
Runtime evaluation, project file validation, project text compile/export, folder save, and notebook schema all matter.
Check those facts against the packet and cite the actual symbols.

Separate open plans already cover rolling calendar summaries (#521), category mappings (#523), wide-to-long preparation (#518),
live findings (#507), and parameterized local investigation notebooks (#524).
They are unbuilt proposals, not prerequisites or available APIs.
This mission concerns neighboring observations, rather than rolling buckets or generalized SQL windows.

## Ranked questions

1. What should the analyst author and inspect?
   Compare an explicit project step, a generalized window expression, a chart-local calculation, and upstream preparation.
   Research current primary documentation for SQL window functions (DuckDB/PostgreSQL), pandas grouped shift/diff, Polars,
   and a strong visual preparation tool such as JMP, Tableau Prep, or Power Query.
   Select the best boundary for explorEDA. Describe the complete author/edit/use/inspect/save/reopen journey.
   The result must be usable by charts, subsequent query steps, and notebook views where current architecture permits.
2. What is the precise ordering contract?
   Define typed partition equality, one or more order fields, ascending/descending behavior, and explicit tie resolution.
   Decide what happens when ties remain, order values are missing/invalid, keys are missing/duplicated, or sources reload in another order.
   Do not silently use arrival order or the displayed table sort.
   Separate observation offset, elapsed time, and calendar periods. Select a useful first scope and justified later additions.
3. What does each result mean?
   Define lag value, numeric difference, missing measures, offset, first observations, overflow, dates, and units.
   Decide whether a missing measure occupies its position or is skipped, and expose that decision clearly.
   Show how filtering before versus after the step changes predecessors.
   Workspace selections and table searches must have a stated relation to prepared fields.
   Decide whether elapsed duration and change rate belong in the first release or a later milestone.
4. How does exact inspection work without confusing identity and contribution?
   Show the current and predecessor records, values, partition/order rules, excluded reasons, and derived result.
   Decide whether row identity stays current-row identity and how predecessor membership is represented.
   Explain downstream filtering, grouping, source inspection, keyless sources, refresh, and saved selections.
   Prefer one bounded extension to the current result model over a new lineage platform.
5. What is the implementation plan and independent oracle?
   Name current files, proposed modules, model/API/text changes, validation, editor controls, worker behavior, and persistence boundaries.
   Supply small fixtures with independently enumerated predecessor IDs and exact outputs.
   Include two entities, unsorted rows, a tie with and without a tie-break field, missing values, and a removed middle observation.
   Add input reorder, display-sort, filter-position, empty/singleton, source-refresh, save/reopen, and malformed-definition cases.
   Each milestone must ship a complete useful flow, with its docs page and runnable example in that same milestone.
   Name tests and commands, expected values, a browser acceptance route at 1280/783/390px, and the main risk.
   Measure likely work and memory costs before proposing caches, indexes, or limits.

## Constraints

Keep this existing React and TypeScript library and demo in React. Use pnpm.
Keep the package storage-neutral; the local application owns storage.
Use shared valueParsing.ts rules for raw numbers, dates, booleans, and missing values.
Preserve a clear current row grain. Do not rewrite strict relationship matching or scalar calculation semantics.
Avoid generic window language, ranking, cumulative statistics, forecasting, automatic imputation, or a new backend.
Do not introduce backward-version coexistence, mixed client/server fallbacks, or enterprise machinery.
Write a small number of tests for material behavior and likely failures.
Use the UI defaults: compact local controls, visible scope, keyboard access, exact records through existing inspection conventions.
No new implementation, merge, deployment, or paid service is requested from you.

## Evidence and deliverables

Cite repository paths and symbols for implementation claims.
Cite current primary sources with direct URLs for decisive external claims.
Separate facts, inferences, and proposals. Identify uncertainty and rejected options.

Return two downloadable Markdown files, optionally together in one ZIP:

1. design-report.md: lead with what to build, then answer all ranked questions, sources, and open decisions.
2. implementation-plan.md: ordered, independently shippable milestones with files, exact test values, docs, runnable example, risks, and acceptance.

Include stable OD-01, OD-02, etc. recommendations with Build, Explore, Defer, or Avoid dispositions and one-line reasons.
Build means include in the proposed plan; Codex and Byron still review it.
Do not produce manifests, hashes, archives of source, or receipts as report content.
If file tools fail, provide all content inline. Link each deliverable in the final message.
End with access status, files read, checks performed versus proposals, deliverable links, and open questions.
