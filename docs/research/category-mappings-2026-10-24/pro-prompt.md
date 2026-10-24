# Design reversible category mappings for explorEDA

https://github.com/byronwall/explorEDA

Baseline: `95832bd473884aeae23453af0888b4ca5187820d` (origin/main, October 24, 2026).
Mode: **Design**. Scoped research branch: `codex/category-mappings-design-2026-10-24`.

## Mission and decision

What should explorEDA build so an analyst can combine known category aliases into a reusable field, inspect every affected record, and revise the mapping safely?

Design an ambitious but bounded first feature and a staged implementation plan. A user should combine `North`, `north`, and `North ` when intended, preserve the original field, and use the result across linked charts. They should distinguish a deliberate analytical grouping from a source correction. Decide the right home for the recipe and editor, its exact value semantics, and how it survives source refresh and saved project reload.

Act as a senior designer of interactive data preparation and linked analysis tools. Compare strong tools and relevant methods. Give candid tradeoffs, rejected options, uncertainty, and a concrete recommendation.

Byron is the demand. Do not require an outside customer, observed defect, or usability study before designing this capability. R038's old demand and deferral language is superseded by DIRECTION.md. This is feature design, not an audit or a lesson-only assignment.

## Access check

Read the attached source packet before deciding. It contains complete files from the named baseline, separated by path. Confirm access and state which files you read. The attached prompt is the mission. If a decisive implementation file is missing from both the packet and connected GitHub, stop and name the smallest missing input. Do not infer implementations from file names or claim access you lack.

## Current context and reading route

This is an existing React and TypeScript library, demo, and local folder app. Keep React. Use pnpm. Assume one author, one client, and one deployed version. No enterprise platform, backward compatibility machinery, generic transformation language, or paid service is needed.

Read at minimum:

1. AGENTS.md, docs/agent-guide.md, docs/research/DIRECTION.md, docs/ui-defaults.md, CODING_STANDARDS.md, README.md, and package.json.
2. packages/explorEDA/src/lib/categories.ts and categories.test.tsx; lib/fieldSettings.ts and fieldSettings.test.ts; lib/valueParsing.ts. Existing typed category identity is valuable. Field labels and categorical conversion are not alias mappings.
3. types/AnalysisProject.ts; lib/analysis/evaluateProject.ts, projectFile.ts, sources.ts, useAnalysisEvaluation.ts; test/lib/analysis/evaluateProject.test.ts and selectionIdentity.test.ts. Existing steps are source, lookup, expand, calculate, filter, and aggregate. A mapping step is not implemented.
4. components/project/stepEditing.ts, queryEditing.ts, QueryFlow.tsx, QueryStageRows.tsx, ProjectQueryPanel.tsx, and components/ExplorEdaProject.tsx. Inspect actual editing, row identity, provenance, revision, and persistence seams.
5. lib/calculations/functions/registry.ts; lib/notebook/sheets.ts and compileNotebook.ts; types/SavedDataStructure.ts. Scalar functions currently operate within a row. Decide whether a dedicated map is better than extending formulas or a lookup source.
6. apps/demo/src/docs/pages/project-folders.mdx, fields.mdx, calculated-fields.mdx, notebooks.mdx; docs/intent/research-ideas-100/ideas/R038-category-normalization.md.

Other open research PRs already cover wide-to-long preparation (#518), exact contributor comparison (#519), regression diagnostics (#520), and rolling summaries (#521). They are proposals, not baseline features. Do not assume their types or helpers exist. Keep this feature independently buildable. A neighboring proposal may be mentioned as a future integration only.

## Ranked questions

1. **Choose the product and architecture boundary.** Compare an explicit typed mapping step, a formula extension, and a small lookup table. Compare OpenRefine, Power Query, Tableau grouping, and at least one other strong tool through primary sources. Which design best combines understandable authoring, reusable output, exact provenance, and small implementation cost here? Decide project-only versus single-source workspace availability. If staged, explain the user-visible limits and how milestone one remains complete.
2. **Specify the recipe exactly.** Define input field, new output field, typed keys and values, many-to-one entries, unmatched values, missing/blank values, conflicts, and defaults. Distinguish numeric `1`, text `"1"`, boolean `true`, text `"true"`, null, undefined, empty text, whitespace, literal `"(missing)"`, nonfinite values, and negative zero according to existing semantics. Define whether targets are strings or typed scalars. Decide whether rules read original or previously mapped values; cover cycles and chains. Decide when trimming, case folding, Unicode normalization, punctuation removal, or locale enter the process. Preserve raw category identity outside this explicit operation.
3. **Design the complete authoring and inspection flow.** How does the analyst discover mapping, choose source values, name a target, preview row counts, apply, undo, edit, remove, and use the output? Show compact wireframes or concrete UI states in text. Explain scope before and after linked filters, high cardinality search, keyboard and touch access, and 1280/783/390px behavior. Show mapped, unchanged, unmatched, and missing records without adding permanent panels or per-mark Inspect buttons. Explain how revisions affect existing output-field filters, selections, color assignments, saved views, and later query stages. Identify actual host callback and history boundaries rather than assuming undo exists everywhere.
4. **Decide how suggestions earn a place.** Compare manual mapping with exact trim/case proposals and fuzzy clustering. What belongs in the first release, later prototype, or avoidance list? Specify review before any change. Explain legitimate near matches, Unicode lookalikes, codes with leading zeros, and aliases whose equality changes by domain. Do not let a similarity score establish entity identity or silently change join keys. Keep join-key preparation outside the first feature.
5. **Make refresh, persistence, and provenance buildable.** Define new/unseen values, disappeared values, changed source types, and invalid or conflicting recipes. Explain stable row membership and exact source records. Decide whether reusing a mapping across queries needs a shared object now. Name validator, serialization, worker, field dependency, query-removal, notebook/sheet, and folder app changes only where needed. No generic version coexistence, migration framework, external mapping registry, or worker machinery without a concrete need.
6. **Give exact fixtures and milestones.** Supply a small independently checkable fixture with expected original and mapped categories, row IDs, counts, unmatched outcomes, and refresh changes. Include legitimate near matches, typed collisions, missing values, draft conflicts, chains, removal dependencies, and round trips. Prioritize a few tests that protect likely failures. Separate evaluator, mounted UI, browser, persistence, and performance evidence. Name real paths and commands, and flag proposed new files. Each visible feature milestone must include its docs page or section and runnable demo example. Do not postpone documentation or examples to a final cleanup milestone.

## Evidence and constraints

Cite repository paths and symbols for current behavior. Cite current primary sources with direct URLs for decisive external claims. Distinguish facts, inferences, and proposals. Explain missing or conflicting evidence. You may research broadly; do not substitute product marketing for semantics.

Follow the repository's compact controls, field metadata, temporary previews, explicit filter scope, and exact source inspection rules. Do not change the meaning of categoryKey globally. Do not add automatic destructive source edits, general entity resolution, joins, or a generic data-preparation platform. Source tables stay intact. A recipe can be removed or revised; a many-to-one map does not have a unique inverse.

Prefer a direct, small saved shape with one authoritative write path. Build for this personal project. Define worthwhile capability first, then find the simplest architecture that supplies it. Avoid arbitrary capacity thresholds, DTO layers, or an elaborate lifecycle unless current code makes them necessary.

## Deliverables

Attach two complete Markdown files. A ZIP containing both is welcome but optional. No manifests or hashes are needed.

- **report.md**: start with one paragraph stating what to build. Answer the ranked questions, compare options, cite sources, include the exact fixture, and list recommendations with stable CM01-style IDs. Classify each Build, Explore, Defer, or Avoid, with a one-line reason.
- **implementation-plan.md**: a compact plan a worker can start. Give ordered, independently shippable milestones. Each names files/modules, user-visible behavior, acceptance checks with exact expected values, docs and runnable example, dependencies, and main risk. Include a complete first vertical slice, not only a new type or helper.

Codex will read both reports, check decisive claims against current code, make local dispositions, integrate a short summary and plan, and open a review PR. Do not modify the repository, commit, push, merge, or deploy.

End with access status, files read, what you checked versus proposed, download links, and unresolved choices. Use one response; do not stop after an outline or ask permission to begin.
