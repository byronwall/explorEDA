# Design reusable grouped results

https://github.com/byronwall/explorEDA

Source ref: `5594c95690859e8ce456aa3228fa9265ba686d12` on `main`.
Mode: **Design**.

## Mission

How should explorEDA let an analyst define one grouped result, analyze its rows in several views and notebook sheets, and reach its original observations?

Choose a useful capability and give a buildable milestone plan. Start with experiment measurements becoming one row per experiment. A plot of experiment means answers a different question from a plot of measurements. Extend to a second concrete workflow only when it tests an important design choice. Byron supplies demand. Do not require outside demand, an observed export/import habit, or a participant study before designing this feature.

Act as a data-tool designer who has shipped interactive relational analysis. Compare strong alternatives candidly. Prefer a clear, ambitious direction with independent milestones. Avoid a universal analytics engine or graph editor.

## Access check

First confirm access to this exact ref or the attached complete-file source packet. The packet identifies the baseline and every selected path. If decisive source is absent from both, stop and name the smallest missing input. Do not claim a complete source review from partial access. The packet is source context, not a result artifact.

## Read first

Read at minimum these paths and their selected tests in the packet:

1. `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `CODING_STANDARDS.md`, `README.md`.
2. `docs/intent/reusable-analysis-outputs/intent-brief.md`, `docs/intent/reusable-analysis-metrics/intent-brief.md`, `docs/research/data-preparation-boundary-2026-10-16/README.md`.
3. `packages/explorEDA/src/types/AnalysisProject.ts`, `lib/analysis/evaluateProject.ts`, `lib/analysis/useAnalysisEvaluation.ts`, `lib/analysis/analysisWorkerProtocol.ts`, relative to `packages/explorEDA/src/`.
4. `packages/explorEDA/src/components/ExplorEdaProject.tsx`, `components/project/ProjectQueryPanel.tsx`, `components/project/queryEditing.ts`.
5. `packages/explorEDA/src/lib/dsl/project.ts`, `lib/project/folder.ts`, `lib/project/writeFolder.ts`, `lib/notebook/compileNotebook.ts`, `lib/notebook/sheets.ts`, `components/notebook/ExplorEdaNotebook.tsx`.
6. `packages/explorEDA/src/lib/aggregates.ts`, `lib/valueParsing.ts`, `test/fixtures/shopProject.ts`, `test/lib/analysis/evaluateProject.test.ts`, `test/lib/analysis/entityGrain.test.ts`.
7. `apps/demo/src/docs/pages/project-folders.mdx`, `apps/demo/src/docs/pages/notebooks.mdx`, `apps/demo/src/demos/examples.ts` and the focused project example paths in the packet.

Historical intent docs defer this topic behind outside-demand gates. Those gates do not govern this mission. Preserve their useful grain and provenance concerns. The older preparation study asked where preparation belongs; this run asks how a reusable grouped-result feature should work.

## Current evidence and adjacent work

These are preliminary source observations; check them:

- `AnalysisQuery` owns steps and one output step. Source steps refer to physical source IDs. Aggregate steps already feed further steps in the same query.
- `queryForStage` makes a separate query with copied needed steps. `copyQuery` creates an independent copy. Neither implies a live cross-query result reference.
- `AnalysisResultRow` retains source references and some measure contributors. A second aggregation needs to distinguish group contributors from original measurement contributors.
- Several project views can use one query. A notebook compiles blocks together; its sheets divide reading, not its data model.
- Worker evaluation keeps a prior result while pending. Result definitions, parameter bindings, and source changes must have explicit refresh semantics.

Open research PRs already cover wide-to-long (#518), parameterized notebooks (#524), contributor comparison (#519), and keyed refresh (#571). They are proposals, not baseline behavior. Grouped-rate history is in the metrics intent. Category mappings (#523) are under active implementation (#566–572). Do not depend on any unmerged design. Do not repeat those missions. The central question is shared grouped results and downstream grain.

## Ranked questions

1. **What should we build?** Compare named reusable query outputs, an author-facing grouped-table definition, chart-output promotion, and a smaller shared-stage design. Research primary documentation or papers for Observable, Vega/Vega-Lite, DuckDB relations/views, and at least one interactive tool such as Tableau, Perspective, or Mosaic. Explain which ideas transfer and which do not. Choose a coherent design that adds a noticeable capability beyond existing same-query grouping and multiple views.
2. **What does the analyst do?** Specify an end-to-end experiment workflow: define one result, inspect its row grain, plot its means, share it with another view or sheet, edit the shared definition, filter, inspect contributors, save, reopen, and refresh. Explain how users distinguish shared references from independent copies. Show concise text/API examples plus a compact UI sketch if useful. Keep settings dense and the analysis visible.
3. **What is the exact analytical contract?** Distinguish source occurrences, result rows, measure-specific numeric contributors, and downstream group membership. Decide selection direction across grains, filter scope, parameter binding ownership, empty groups, missing inputs, and equal-weight versus measurement-weight aggregation. Use unequal group sizes with exact expected results. A downstream selection must not silently become an upstream input and create feedback. State whether initial live filtering is supported, captured explicitly, or outside the first milestone, and why.
4. **What changes in code and saved data?** Recommend the smallest clear model and evaluation changes. Decide reference identity, bindings, dependency order, changed/removed upstream definitions, cycles, revisions, pending/error states, and persisted definitions versus transient results. Reuse existing evaluator, DSL, folders, notebook paths, and traces. Identify where current contributor records are sufficient and where they lose necessary intermediate meaning. Do not add a cache platform or duplicate computation engine.
5. **How do we ship it?** Give ordered milestones, each independently useful. Name real modules, exact acceptance cases, docs page or section, runnable example, and the main risk for each. Include visual and keyboard acceptance at 1280, 783, and 390 pixels. Decide when notebook reuse follows project reuse, or argue for another sequence. Cover React embedding and local folders without making every host ship at once.

## Evidence and boundaries

Cite repository paths and symbols for code claims. Cite current primary sources with direct URLs for decisive external claims. Keep facts, inferences, and proposals distinct. Flag missing evidence. Compare meaningful alternatives; do not answer with a robustness audit or merely keep current behavior.

Keep the existing React and TypeScript library and demo. Use pnpm. Assume one local analyst, one server, one client, and one deployed version. No collaboration service, paid provisioning, server database platform, generic materialized-view system, or model/density result catalogue. Mention later extensions briefly only when they change the initial boundary. Generated curve points are not independent observations.

## Deliverables

Attach two complete Markdown files and link each in the final answer:

- `reusable-outputs-design.md`: decision first, ranked answers, product comparison, analytical contract, evidence, rejected options, open questions.
- `implementation-plan.md`: ordered milestones with modules, exact proof fixtures, docs and runnable examples in the same milestone, risks, and stable recommendation IDs classified Build, Explore, Defer, or Avoid.

Add diagrams, mockups, data, or code companions only when useful. Link every supplied artifact. A ZIP is optional. Do not spend time on manifests or hash receipts. If file creation is unavailable, give the full reports inline.

Codex will read all artifacts, verify decisive claims, make local dispositions, and commit the original result files as intent assets. Codex owns repository edits. Do not commit, push, deploy, or implement the feature.

End with access status, files read, checks versus proposals, deliverable links, and unresolved questions.
