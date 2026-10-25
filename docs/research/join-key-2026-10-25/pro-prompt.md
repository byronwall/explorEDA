# Explicit join-key preparation

https://github.com/byronwall/explorEDA

Source commit: `95832bd473884aeae23453af0888b4ca5187820d` (origin/main).
Mode: Design.

## Mission

Design explicit, reusable join-key preparation for explorEDA.
Let analysts reconcile differently encoded identifiers, review changed matches and collisions, and inspect the original records.
Choose the data boundary and a complete staged implementation plan.
Keep strict typed equality as the default for relationships that have no preparation.
This is a new preparation capability, not a robustness audit or a docs-only recipe.
Byron is the demand. Do not require outside users, usability studies, or observed failures.

Act as a data preparation tool designer with experience in relational systems and interactive reconciliation.
Compare strong tools and primary sources. Give candid tradeoffs, rejected options, and uncertainty.
Codex will review the result against current code and own all repository changes.

## Access check

Read the attached complete source packet at the named commit.
Confirm access before researching. If decisive code is absent and inaccessible, stop and name the smallest missing input.
The packet inventory names every path. Files are complete, not selected excerpts.
Old intent demand gates and conservative research decisions do not override DIRECTION.md.

## Reading route

Read at minimum:

1. AGENTS.md, docs/agent-guide.md, docs/research/DIRECTION.md, README.md, CODING_STANDARDS.md, docs/ui-defaults.md.
2. packages/explorEDA/src/types/AnalysisProject.ts, lib/analysis/evaluateProject.ts, lib/analysis/projectFile.ts, and supplied evaluator tests.
3. components/project/relationshipEditing.ts, queryEditing.ts, stepEditing.ts, ProjectSchemaPanel.tsx, QueryRelationshipBuilder.tsx, and supplied tests.
4. lib/dsl/project.ts, lib/project/folder.ts, lib/project/writeFolder.ts, lib/project/analysisText.ts, and supplied text/folder tests.
5. lib/notebook/readNotebook.ts, compileNotebook.ts, writeBack.ts, and supplied tests.
6. lib/valueParsing.ts, lib/categories.ts, lib/calculations/functions/registry.ts, and lib/calculations/engine/Calculator.ts.
7. components/ExplorEdaProject.tsx, lib/analysis/useAnalysisEvaluation.ts, components/project/QueryStageRows.tsx, sourceRowIdentity.ts, and analysisRowKeys.ts.
8. apps/demo/src/docs/pages/project-folders.mdx, notebooks.mdx, and the supplied docs/example registration files.
9. R041 and the prior data-preparation summary. Treat that summary as historical direction, not current scope approval.

Paths after item two are relative to packages/explorEDA/src unless another root is shown.

## Current facts and adjacent proposals

RelationshipDefinition currently has one source field at each endpoint and a declared cardinality.
lookupFrame and expandedFrame index target source rows directly, skip null/undefined/NaN, and preserve scalar types.
Lookup leaves fields unavailable for ambiguous matches; expansion emits each match, optionally retaining unmatched parents.
relationshipSide uses source-field origin or source-qualified IDs; a calculated field has a step origin.
Thus a recipe that calculates a canonical field is not automatically usable as either endpoint of a current relationship.
Check these claims in the packet before choosing a boundary.
Schema preview countMatches is a separate helper. A new preparation contract must govern preview and evaluation together.
Query calculation runs over the current input frame; target relationship fields come from raw source tables.
Specify how preparation reaches both sides without hiding a second execution pipeline.

Open PR523 proposes reusable category mappings. It is unbuilt and must not become a dependency or assumed API.
PR518 proposes wide-to-long preparation; PR525 proposes ordered difference; PR524 proposes parameterized local notebooks.
Those are separate unbuilt proposals. Do not solve this mission by assuming they shipped.
The former broad preparation study favored local complete supplied rows. This mission asks a new explicit key feature question.

## Ranked questions

1. What should the product build, and where should preparation live?
   Compare source-level derived key fields, relationship-local preparation, query-output endpoints, and upstream preparation.
   Research current primary docs for tools such as Tableau Prep, Power Query, OpenRefine, DuckDB, or Polars.
   Choose a bounded design with a useful complete first milestone; do not merely list options.
   Explain reuse across relationships, reverse traversal, raw target evaluation, schema diagrams, and parameterized notebooks.
   Show the smallest public types and ownership changes that solve both endpoint preparation and exact inspection.
2. What matching semantics should users author?
   Compare explicit text trim, case conversion, Unicode normalization, numeric conversion, and manual exceptions.
   Keep leading-zero identifiers distinct unless an author deliberately chooses a numeric convention.
   Define invalid conversion, empty/whitespace strings, null/undefined/NaN/infinity, booleans, signed zero, and dates.
   Separate identifiers from measurements; do not reuse permissive numeric conversion by accident.
   Decide which transformations belong in milestone one and which need later exploration.
   Decide whether composite keys belong in the plan. Use structural components, not ambiguous separator concatenation.
   Preserve component types and specify how a missing component affects a tuple.
   Avoid fuzzy matching, automatic repair, implicit coercion, or a general entity-resolution service.
3. What does the analyst see and do?
   Describe authoring from Schema, previewing old and new matches, reviewing collisions, applying, editing, undoing, saving, and reopening.
   Distinguish a pre-existing duplicate key, a normalization collision, an unmatched key, and one-to-many expansion.
   Show raw and prepared values on both sides with exact original record memberships.
   Specify when a change is blocked, allowed, or requires an explicit cardinality change.
   Avoid blocking legitimate many-to-many work merely because a prepared key is not unique.
   Explain which counts describe input rows, target rows, key values, pairs, and emitted output rows.
4. What happens through the complete analysis lifecycle?
   Cover query steps, multiple views, preview versus applied evaluation, filters before/after matching, worker changes,
   source refresh, reordered rows, failed conversions, source-key identity, selection/trace invalidation, and unavailable sources.
   Cover project JSON, project text, folder files, notebooks, host callbacks, export, and save/reopen.
   Preserve original source rows. A prepared join key must not silently become the source's entity key.
   Keep current strict relationships' memberships unchanged.
   Name exact code seams and bounded validation; no version coexistence framework or generic lineage platform.
5. What fixtures and milestones prove the design?
   Supply small independently enumerated tables with row IDs, raw keys, prepared keys, exact pairs, and output records.
   Include number 7 versus text "7", "007", padding, case variants, nulls, whitespace, deliberate collisions,
   duplicate targets, failed conversion, typed composite collisions, reverse traversal, source reorder, and source refresh.
   Give strict baseline results and each proposed convention's changed memberships and counts.
   Include lookup, expansion, keepUnmatched, and a downstream total that exposes accidental multiplication.
   Provide an independent oracle and a few important tests, not tests that repeat implementation.
   Name real files/modules, docs page, runnable example, tests, acceptance, and main risk for each shippable milestone.
   Docs and runnable examples belong in the same milestone as the feature.
   Include pointer and keyboard acceptance at 1280/783/390px and a measured performance probe before caches or limits.

## Constraints

Keep the existing React and TypeScript library and demo. Use pnpm.
Keep the package storage-neutral and retain original source data and identity.
Use shared parsing and typed-category helpers where their semantics fit; name any different identifier contract explicitly.
Prefer direct control flow, concise variables, few important tests, and a small number of complete milestones.
Do not add backend services, paid services, automatic entity merging, fuzzy matching, or enterprise layers.
Keep controls compact, field names visible, previews bounded and labeled, and keyboard access complete.
No feature implementation, commit, merge, or deployment is requested from Pro.

## Evidence and deliverables

Cite repository paths and symbols for code claims. Cite current primary sources for decisive external claims.
Separate facts, inferences, and proposals. Identify missing evidence and open product decisions.
Return two downloadable Markdown files, optionally in one ZIP:

1. design-report.md: lead with what to build, then answer all ranked questions, fixtures, sources, and open decisions.
2. implementation-plan.md: ordered shippable milestones with files, exact tests, docs, example, acceptance, and main risks.

Include stable JK-01, JK-02, etc. recommendations with Build, Explore, Defer, or Avoid and one-line reasons.
Build means include in the proposed plan; Codex and Byron still review it.
Do not produce hashes, manifests, source archives, or integrity receipts as report content.
If file tools fail, provide full content inline. Link every deliverable in the final message.
End with access status, files read, checks versus proposals, deliverable links, and open questions.
