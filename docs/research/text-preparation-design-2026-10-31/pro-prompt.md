# Design reusable text preparation

https://github.com/byronwall/explorEDA

Baseline: ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6 (origin/main, October 31, 2026).
Mode: Design. Branch: codex/text-preparation-design-2026-10-31.

## Mission

What should explorEDA build so analysts can clean, extract, and compose text fields,
inspect changed records, and reuse the results in charts, project queries, and notebooks?
Recommend one coherent design and a staged implementation plan.
Byron is the demand. Do not require outside demand, observed failures, or a usability study.
This is feature design. Do not turn it into a registry audit or a recommendation to keep the current surface.

Act as a data-preparation designer with experience in Unicode, expression languages,
Power Query, OpenRefine, SQL, and interactive analytical tools. Explain tradeoffs candidly.

## Access and reading route

Read the attached packet first. It contains complete files from the named baseline.
Confirm access. If decisive source is absent from the packet and repository, stop and name the smallest missing input.
Do not claim access you did not have.

Read at minimum, under packages/explorEDA/src unless another root is shown:

1. AGENTS.md, docs/agent-guide.md, docs/ui-defaults.md, CODING_STANDARDS.md, README.md.
2. lib/calculations/functions/registry.ts, parser/semantics.ts, engine/Calculator.ts, types.ts, CalculationState.ts, recode.ts.
3. components/calculations/CalculationEditor.tsx, CalculationForm.tsx, CalculationPreview.tsx, CalculationTrace.tsx, CategoryMapEditor.tsx.
4. test/lib/calculations/engine/Calculator.test.ts, parser/parser.test.ts, traceRow.test.ts, recode.test.ts.
5. types/AnalysisProject.ts, lib/analysis/evaluateProject.ts, lib/dsl/project.ts, lib/project/analysisText.ts and folder.ts.
6. providers/DataLayerProvider.tsx, utils/saveDataUtils.ts, types/SavedDataStructure.ts, lib/valueParsing.ts.
7. lib/notebook/compileNotebook.ts, apps/demo/src/docs/pages/calculated-fields.mdx,
   apps/demo/src/docs/pages/project-folders.mdx, apps/demo/src/demos/examples.ts.
8. R048 and the existing category-mapping and join-key research summaries in the packet.

## Current facts and boundary

The callable registry has row-wise arithmetic, recode, and UTC date functions.
CalculationForm reads the real registry for function help; FunctionExplorer contains mock data and is not that active surface.
The parser accepts quoted text, quoted field references, nested calls, comparisons, and conditional expressions.
Arithmetic plus uses numericValue, not text concatenation. Do not silently change that operator.
CalculationManager retains per-row errors separately from missing result values and supports dependency traces.
The preview evaluates all loaded rows before chart filters, with five rows per page and an optional failed-row filter.
Project calculate steps call the same Calculator, but have different diagnostics and persistence seams.
Recent shipped work includes explicit category mappings, notebook sheets, folders, and keyed refresh.
Join-key preparation and other preparation proposals in open PRs are not shipped prerequisites.
Verify these facts. Design a first useful release against this baseline.

## Ranked questions

1. What complete first workflow should ship? Compare a formula function family, guided preparation that emits formulas,
   and a project preparation step. Choose a bounded bundle that covers cleaning an imported code,
   extracting a delimited component, and composing an analysis label. Show preview, Apply, grouping,
   exact changed-record review, trace, save, reopen, refresh, and notebook use.
2. Which semantics should it adopt? Compare primary sources for Power Query text functions, OpenRefine GREL,
   DuckDB or PostgreSQL, and Unicode standards. Choose explicit rules for trim and whitespace,
   normalization, case, length and substring units, delimiter occurrence, literal replacement,
   concatenation, missing versus empty text, non-text inputs, and malformed arguments.
   Separate identifier equality from display labels. Explain combining marks, emoji sequences,
   Turkish I, German sharp S, nonbreaking spaces, zero-width characters, and canonically equivalent strings.
   Do not silently stringify numbers, booleans, or dates, or silently fold business categories.
3. What is the smallest coherent API with room for later capabilities? Recommend names, signatures,
   return and error behavior, valid syntax examples, function help, and an explicit regex disposition.
   Compare code points with grapheme clusters and locale-free with locale-specific casing.
   Prefer direct shared implementation over a second expression engine or a generic plugin framework.
4. How should analysts understand and reuse the result? Specify before/after counts and exact record sets,
   unchanged/missing/error outcomes, dependent calculation behavior, collision review where meaningful,
   refresh and reordered inputs, project worker parity, JSON/text/folder persistence, notebook binding,
   and export. Distinguish existing support from required changes. Reuse current save and trace seams.
   Do not make the feature depend on an unbuilt join-key or reusable-output design.
5. What proves each milestone? Provide exact input/output fixtures, including typed and Unicode edge cases,
   chained transformations and project calculations. Name real files, meaningful tests, the docs section,
   and a runnable demo example in each user-visible milestone. State risks and rejected alternatives.

## Evidence and constraints

Cite repository paths and symbols for code claims. Cite current primary sources with URLs for decisive external claims.
Separate facts, inferences, and proposals. State uncertainty. Compare alternatives before choosing.
Do not ask for demand evidence or make upstream preparation the default escape from the mission.
Keep the existing React and TypeScript library and demo. Use pnpm. Assume one local analyst and one current version.
No arbitrary user programs, remote execution, paid service, fuzzy entity merge, or full spreadsheet language.
No compatibility layer or saved-format migration without a concrete requirement. No enterprise transaction framework.
Codex will check the result, change repository files, and open the PR. Do not commit, push, or implement in the repository.
The direction page has an old conflicting archival paragraph. The human requires all original results to be preserved;
do not omit companion files on that basis.

## Deliverables

Put the decision first: what to build and why, in one paragraph.
Attach and link these complete downloadable files in your final reply:

- report.md: answer the five questions, compare options, cite primary sources, and state open questions.
- implementation-plan.md: ordered, independently shippable milestones. Name files, acceptance checks,
  exact expected values, docs sections, runnable examples, and each milestone's main risk.
- recommendations.md: stable IDs with Build, Explore, Defer, or Avoid and a short reason.
- fixtures.json: exact expected values and errors for proposed semantics, with code points made explicit where useful.

Include useful diagrams or code companions only when they clarify the design. Link every supplied result file.
An optional ZIP is convenient. Do not add hash manifests or source receipts just for process.
End with access status, files read, checks performed versus proposals, deliverable links, and open questions.
