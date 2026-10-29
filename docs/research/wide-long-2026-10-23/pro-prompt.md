# Wide-to-long preparation for repeated measurements

https://github.com/byronwall/explorEDA

Ref: 95832bd4, refreshed origin/main. Mode: Design.

What should explorEDA build so analysts can turn repeated measurement columns into an inspectable long table inside a saved project?

Act as a data preparation and analytical tool designer who has shipped visual query tools.
Research strong tools, compare designs, and recommend a staged feature with a useful first release.
Byron is the demand. Do not require outside demand, a named failure, or a usability study.
This mission adds a capability. A lesson, audit, or recommendation to keep current behavior does not satisfy it without strong comparative reasons.

## Access check

Read the supplied complete-file source packet at this ref. Confirm access before research.
If decisive source is absent and repository access fails, stop and name the smallest missing input.
Do not infer unseen implementation. Codex will check proposals and make all repository changes.

## Context and reading route

Read AGENTS.md, docs/agent-guide.md, docs/ui-defaults.md, CODING_STANDARDS.md, and docs/research/DIRECTION.md first.
The existing library and demo stay React and TypeScript. Use pnpm.
Assume one developer, one server, one client, and one deployed version.

Read packages/explorEDA/src/types/AnalysisProject.ts and lib/analysis/evaluateProject.ts.
The remaining paths in this paragraph are relative to packages/explorEDA/src/.
Read lib/analysis/{sources,projectFile,useAnalysisEvaluation}.ts, lib/valueParsing.ts,
lib/dsl/project.ts and project.test.ts, and lib/project/analysisText.ts.
Read components/project/{stepEditing,queryEditing,settingsCompatibility,sourceRowIdentity,analysisRowKeys}.ts,
components/project/{ProjectQueryPanel,QueryFlow,QueryStageRows}.tsx, and components/ExplorEdaProject.tsx.
Read test/lib/analysis/{evaluateProject,selectionIdentity}.test.ts and components/project/stepEditing.test.ts.
Read the supplied shop fixture, project example, docs page, example registration, and coverage files.
Read R042 and prior data-preparation-boundary decisions. DIRECTION.md supersedes their named-demand gates.

Current source facts to verify:

- AnalysisStep has source, lookup, expand, calculate, filter, and aggregate, but no reshape step.
- A prepared long table can already enter as ordinary source rows.
- AnalysisResultRow has a row key, values, sourceRows, and contributors. Source references name rows, not cells.
- AnalysisField.origin can name a source field or step. A melted value can originate from several source columns.
- Expanding a relationship changes grain and opens a copied query/view. Follow that precedent where useful.
- Project text compiles and exports query steps. queryFields evaluates empty tables to discover the output schema.
- Duplicate or missing source keys use positional identity. Do not promise stable identity across arbitrary reorder.

Earlier preparation research selected upstream reshape under a demand gate; it did not design this feature.
Revisit that specific boundary with the present mission, while preserving useful existing preparation behavior.
Open plans #507, #514, and #517 cover notebook findings, weighted distributions, and engineering histograms.
Do not expand those plans or add a general result catalogue.

## Ranked questions

1. What should the first feature do? Compare tidyr pivot_longer, pandas melt/wide_to_long, Tableau Prep,
   Power Query unpivot, and a suitable declarative visualization transform using primary sources.
   Contrast one explicit query step, visual-only reshaping, and upstream preparation.
   Recommend a coherent design for saved analytical work, with a complete first milestone.
2. What is the exact data contract? Decide kept identifiers, selected columns, output field IDs and labels,
   explicit column order, name mappings, missing values, row count, row grain, and deterministic keys.
   Distinguish absent properties, null, blank text, zero, false, invalid numeric text, dates, and non-finite values.
   Do not silently turn unrelated units into one measurement. Decide mixed-type behavior and how metadata limitations appear.
   Decide missing selected columns on refresh, added columns, rename, duplicate labels, field collisions, and empty input.
   Keep schema discovery possible without input rows. State refresh stability limits for positional source identity.
3. What does the author see and do? Specify a compact flow from a project query to selecting columns,
   naming the outputs, previewing counts and row grain, applying, and editing/removing the step.
   Decide whether applying opens a new view or changes the current view, and what happens to incompatible chart settings.
   Include pointer and keyboard operation, useful errors, and narrow layouts. Avoid a general preparation graph editor.
4. What exact evidence follows a long row? It represents an input-row/selected-field pair, not a new independent observation.
   Trace the generated value to its source field and source row, including calculated or looked-up input fields.
   Preserve the difference between an input result row and raw source rows after expansion or aggregation.
   Decide how a long-row selection reaches original records and whether other measurements from the same record are selected.
   Do not conflate row contributors with the source cell that supplies the value.
5. Which concrete repository changes support this? Give types/API sketches, evaluator and validation rules,
   worker boundary, stage summaries, inspection, view state, project files, project-text syntax, and export/compile/restore.
   Prefer direct additions to current structures over wrappers, a second evaluator, or version coexistence layers.
   Bound output growth and explain errors without designing a production execution platform.
6. Which fixtures and milestones prove it? Give small labeled rows with repeated measures, duplicate identifiers,
   incompatible measurements, missing values, filters before/after reshape, and source reorder/refresh.
   State exact output values, row keys or key rules, cell origins, memberships, sums/counts, and no-row schema.
   Include one reshape after a lookup/expansion or grouped stage to expose provenance limits.
   Each milestone must name files, important tests, its docs page/section, a runnable example, and the main risk.
   Keep docs and examples in the same milestone as the feature. Include browser checks at 1280, 783, and 390 px.

## Evidence and scope

Cite repository paths and symbols for code claims. Cite current primary sources with URLs for external claims.
Keep facts, inferences, and proposals distinct. Say when evidence is absent or conflicting.
Research externally. Do not run this repository, commit, or push.
No arbitrary nested restructure, general pivot engine, automatic unit conversion, inference from column-name patterns,
distributed execution, paid service, deployment, or broad query-result reuse platform in the initial release.
Treat multi-measure and name-pattern extraction as design alternatives or later stages, not automatic scope.
Do not turn this into a robustness audit of current preparation.

## Deliverables

Attach report.md and implementation-plan.md as downloadable Markdown. An optional ZIP may contain both.
Start with one paragraph: what to build and why. Answer every ranked question.
Give stable recommendation IDs classified Build, Explore, Defer, or Avoid, with a one-line reason.
Keep the plan readable in a few minutes. Put detailed comparisons and exact fixtures in the report.
Do not create source archives, hash manifests, or receipts.
End with access status, files read, checked facts versus proposals, deliverable links, and open questions.
