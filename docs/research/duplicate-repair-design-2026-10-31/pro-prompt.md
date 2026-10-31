# Design explicit duplicate-key repair

https://github.com/byronwall/explorEDA

Baseline: ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6 (origin/main, October 31, 2026).
Mode: Design. Working branch: codex/duplicate-repair-design-2026-10-31.

## Mission

What should explorEDA build so an analyst can resolve duplicate entity keys,
keep the intended records, and reuse the repaired table in a relationship and notebook?
Recommend a coherent product design and a staged implementation plan.
Byron is the demand. Do not require outside demand or a usability study to recommend building.
This is new feature design, not an audit of existing duplicate diagnostics.

Act as a data-preparation tool designer with experience in relational grain,
record linkage, provenance, and interactive analysis. Be candid about tradeoffs.

## Access check and reading route

Read the attached source packet first. It contains complete files from the baseline.
Confirm access before researching. If decisive source is missing from both packet and repository,
stop and identify the smallest missing input. Do not imply access you did not have.

Read at minimum:

1. AGENTS.md, docs/agent-guide.md, docs/ui-defaults.md, CODING_STANDARDS.md, README.md.
2. packages/explorEDA/src/types/AnalysisProject.ts and lib/analysis/{sources,evaluateProject,projectFile}.ts.
3. components/project/{relationshipEditing,queryEditing}.ts and {ProjectSchemaPanel,ProjectQueryPanel,QueryStageRows}.tsx.
4. test/lib/analysis/{evaluateProject,entityGrain,sourceRowIdentity}.test.ts and test/fixtures/shopProject.ts.
5. lib/dsl/project.ts, lib/project/{analysisText,folder}.ts, components/ExplorEdaProject.tsx.
6. lib/notebook/compileNotebook.ts, apps/demo/src/demos/analyses/shop.ts and src/docs/pages/project-folders.mdx.
7. The R039 brief and entity-grain research summary in the packet.

Paths above are under packages/explorEDA/src unless another root is shown.
The packet also includes worker and folder-save seams. Treat old demand gates in research as superseded.

## Current facts and design boundary

The query union has source, lookup, expand, calculate, filter, and aggregate steps.
Lookup reads the target source's raw table. It does not consume another query's prepared output.
The evaluator reports duplicate entity keys and ambiguous lookups, without choosing the first match.
Source inference can choose another unique field or add a row number. That does not repair business identity.
Relationship editing previews matched, unmatched, ambiguous, and expanded counts.
Entity-aware numeric reduction already rejects conflicting measures. Preserve that distinction.
Verify these facts against the packet. A proposed new preparation step alone cannot repair a raw lookup target.
Recent shipped work includes notebook sheets, folder persistence, keyed selection handling,
entity-aware aggregation, and explicit category mappings. Build on existing seams.
Other open research proposes reusable outputs and join-key preparation; neither is shipped.
Design a first useful release that does not depend on those proposals being implemented first.

## Ranked questions

1. What complete workflow should ship first? Compare explicit exact-record collapse,
   chosen-key grouping with conflict review, deterministic latest/earliest selection,
   composite keys, and changing the declared grain. Choose a strong bounded bundle.
   Distinguish exact repeats, conflicting entities, and legitimate repeated events.
   Show the analyst's path from ambiguous relationship to repaired usable target and notebook.
2. How do strong tools solve this? Use primary sources for Power Query duplicate removal/grouping,
   OpenRefine reconciliation/clustering, SQL DISTINCT/window ordering, and any better comparator.
   Explain ordering guarantees, ties, nulls, equality, and provenance. Cite specific sources.
   Do not copy automatic fuzzy merging into this product without a clear reason.
3. What exact semantics should the product adopt? Define typed and composite keys,
   missing/blank keys, whole-row versus chosen-field equality, field conflicts,
   winner selection and unresolved ties, nonfinite inputs, and refreshed/reordered sources.
   Keep a winning row separate from a synthetic field-by-field coalesced record.
   State which original rows survive, are represented, or are excluded in every output.
   Never use input order as an unannounced recency rule or overwrite the source data.
4. Which minimal data model and execution change makes the repaired target reusable?
   Compare source preparation, query output reuse, and a relationship-local policy.
   Decide where definitions live, how lookups see them, and what stable output identity means.
   Cover JSON/text/folder saving, host callbacks, workers, revision changes, undo,
   notebook compilation and traces. Name concrete files and avoid a second query engine.
5. How should the inspector and preview explain counts and consequences?
   Specify grouped conflict evidence, full-source versus selected scope, apply/cancel,
   downstream affected relationships, changed decisions after refresh, and exact source navigation.
   Include keyboard operation and compact wide/narrow reading. A small annotated diagram helps.
6. What shippable milestones and exact tests prove it? Supply hand-enumerated fixtures
   covering exact repeats, disagreeing values, valid repeated events, typed keys,
   composite-key collisions, null keys, latest ties, refresh reorder/add/change,
   missing dependencies, ambiguous lookups, aggregation, and round-trip persistence.
   Include expected output values, original source occurrence sets, and relationship counts.

## Evidence, scope, and output

Cite repository paths and symbols for current behavior. Cite primary sources with URLs for external claims.
Separate checked facts, inferences, and proposed APIs. Explain uncertainty and rejected alternatives.
Keep the existing React/TypeScript library and demo. Use pnpm and the existing test time limits.
Assume one developer, one deployed version, and local files. No fuzzy matching service,
arbitrary scripts, automatic deletion, remote execution, paid services, or universal ETL platform.
Do not require a robustness audit before designing the new capability.

Attach these downloadable deliverables and link each in the final message:

- A Markdown report with the recommended build decision first, then answers and primary sources.
- A Markdown implementation plan with ordered, independently shippable milestones.
  Each milestone names files/modules, exact acceptance tests, its main risk,
  the docs page/section, and a runnable demo example delivered with the feature.
- Stable recommendation IDs with Build, Explore, Defer, or Avoid and one-line reasons.
- A small JSON fixture set with exact expected values and contributor/exclusion membership.
  Include an optional diagram only when it explains the chosen workflow or data boundary.

One downloadable ZIP is acceptable. Do not spend effort on hash manifests or receipts.
Codex will inspect every supplied artifact, preserve originals as intent assets, check decisive claims,
write the local plan, and open the PR. Do not commit, push, or run repository changes yourself.
End with access status, files read, what you checked versus propose, deliverable links, and open questions.
