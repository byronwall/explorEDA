# Query demands and responsive database exploration

## Primary mission

Which minimal query and demand contract lets the existing workspace use server data without losing responsive, correct linked filtering?

## Priority questions, in order

1. Separate the user's analysis query from chart demands and workspace/chart filters. Explain the minimum request and result contracts. Decide what belongs on each side. Compare extending the existing AnalysisQuery with a narrower read boundary and a new planner. Show where each wins or fails.
2. Specify enough semantics to keep linked views honest: selected population versus context that excludes a chart's own filter; global versus per-view filters; facets; stable domains and bin edges; raw rows versus aggregates; trace and record drilldown. Trace a bar + scatter + row table example through initial load, a selection, and clearing it.
3. Choose an execution policy among full projected snapshots, server aggregates, and partial caches. Distinguish “all rows for these columns” from “some rows for all columns.” State when cached data can answer a filter exactly, when server work is needed, and how new field demands expand coverage. Include filtering outside the cached subset and removal of a restrictive filter.
4. Address request identity, cancellation, stale-result rejection, snapshot consistency, source changes, data freshness, and bounded cache invalidation. State a small state machine for initial/loading/ready/stale/error behavior. Preserve visible data while work runs only when its scope is clear. Separate true optimistic exact answers from provisional previews.
5. Give a small demand-combining example. Deduplicate compatible requests without building a general optimizer. Include projected columns, aggregation, raw-row limits, stable keys, sorting/pagination, calculations, joins, and unsupported operations. Explain which existing assumptions must change, especially full rows and contributor arrays.
6. Recommend the first falsifiable local proof. Use a deterministic fake for delayed, reordered, failed, and incomplete replies. Add one database-backed fixture later. Define proposed interaction latency, correctness, bytes, and memory measurements; do not invent a universal threshold or implementation success.

## Required decision output

Include concise TypeScript request/result sketches and at least three complete request/response examples: an aggregate view, a row plot, and a full-cache filter followed by a cache miss.
Include a coverage model, a sequence diagram, an execution policy table, and the strongest simpler counterproposal.
List compatibility requirements for the transport and adapter tracks. Keep physical encoding and full adapter implementation out of this report.

https://github.com/byronwall/explorEDA

Research baseline: commit `f01ff0fb1f9e1240020744a18816f2dad68bf488` on `origin/main` at preparation.
Local integration branch: `codex/database-query-research`. Codex owns local integration and PRs.
This assignment is research and artifact production. Do not change repository files or Git state.

## Shared purpose and decision context

Byron wants explorEDA to query real databases while keeping the client highly responsive.
Keep a complete snapshot of the available data when that makes sense.
Server aggregates, complete projected rows, and progressive row/column caches are candidates.
Do not assume the largest imaginable dataset determines the first design. Start with roughly 10,000–100,000 rows and vary row width.
The attached source notes interpret three notebook photos. Their byte estimates and sketches are hypotheses, not accepted requirements.

This is one of three parallel research tracks. The tracks cover query/demand contracts, data transport, and database adapters.
Own your assigned decision. Record requirements you place on the other two tracks in a short interface handoff.
Do not pretend those tracks have already selected a shared design.

## Access preflight and reading route

GO when this exact repository and baseline are accessible, or when the attached source packet provides the required files.
The ZIP is an authorized selected source snapshot, not a runnable checkout. `source-manifest.json` identifies every source file and hash.
It includes local notes and prompts separately from baseline code. Use the included source if repository indexing or access fails.
Record the source actually read. Read the notes and inspect the notebook photos when needed.
NO-GO if both repository and packet lack a material source, the repository identity differs, or the assignment would require production access.
State the smallest missing input. Do not claim a complete repository review from filenames or the README alone.
If some optional evidence is absent, give a qualified recommendation with a concrete proof plan.

Read at minimum:
- `AGENTS.md`, `README.md`, `packages/explorEDA/README.md`, both package manifests, and `docs/agent-guide.md`.
- `packages/explorEDA/src/types/AnalysisProject.ts`, `types/FilterTypes.ts`, and `types/SavedDataStructure.ts`.
- `packages/explorEDA/src/lib/analysis/evaluateProject.ts`, `useAnalysisEvaluation.ts`, and `analysisWorkerProtocol.ts`.
- `packages/explorEDA/src/components/ExplorEdaProject.tsx`, `providers/DataLayerProvider.tsx`, and `hooks/CrossfilterWrapper.ts`.
- `packages/explorEDA/src/lib/valueParsing.ts`, `lib/aggregates.ts`, and `lib/chartPopulation.ts`.
- The supplied scatter/bar planners and analysis/filter tests.
- `docs/performance-checks.md`, `docs/intent/current-analysis-trust/intent-brief.md`, and `docs/intent/renderer-independent-replay/intent-brief.md`.
Paths shortened after the first package path use `packages/explorEDA/src/` as their root. Verify all claims against source.

Observed baseline facts to verify: this is a React/TypeScript library, with a React demo and pnpm 11.
`AnalysisQuery` already models source, lookup, expand, calculate, filter, and aggregate steps.
`AnalysisEvaluation` carries rows, fields, stages, diagnostics, counts, revision, and source contributor references.
The optional analysis worker receives source tables, then evaluates definitions and bindings. The hook drops outdated replies.
The chart workspace uses local row data and Crossfilter. Its per-chart filter scope matters.
These are existing seams, not evidence that a remote server contract already exists.

Real validation commands, if you have a runnable checkout:
`pnpm --filter exploreda exec vitest run src/test/lib/analysis/evaluateProject.test.ts src/test/lib/analysis/useAnalysisEvaluation.test.tsx src/test/lib/analysis/sourceRowIdentity.test.ts src/hooks/CrossfilterWrapper.test.ts`
`pnpm --filter exploreda check-types`
`pnpm check:ui`
`pnpm check` (full check; builds the package, so do not run concurrently with another checkout).
Report any command you did not run. Reading tests does not establish a fresh pass.

## Evidence, scope, and decision rules

Use primary sources for technical research: official documentation, source code, specifications, and original papers.
Browse to verify current platform and library behavior. Cite direct URLs and access dates.
Separate observed repository facts, external facts, inferences, proposals, and measured results.
Each major recommendation must cite relevant paths and symbols, explain costs, name a serious alternative, and identify a falsifiable proof.
Do not invent benchmarks or imply a packet is executable. Mark estimates with assumptions and arithmetic.

Assume one developer, one server, one client, and one deployed version.
Favor direct control flow and a small contract. Keep the existing React project in React/TypeScript.
Do not add enterprise deployment, multi-tenant platforms, arbitrary SQL execution, version coexistence, or speculative compatibility layers.
Client/database result parity is a real requirement to study; a duplicate fallback platform is not automatically justified.
Keep database credentials on the server. Use bounded read-only fixtures for proof proposals.
No production queries, data migrations, dependencies, commits, issues, PRs, deployment, or application implementation in this assignment.
Prototype snippets and fixture designs may appear in the report, clearly labeled as proposals.

GO with a recommendation only if it preserves correct field types, null behavior, row meaning, source identity, and filter scope.
Reject designs that mislabel partial data as complete or exact, hide missing unsupported behavior, or require a new platform before one visible proof.
A valid NO-GO is a useful result: name the blocker, the strongest simpler approach, and what evidence could change the decision.
Stop after a complete bounded recommendation and proof plan. Ask only if an essential product judgment cannot be kept provisional.


## Deliverables and acceptance

Produce a self-contained Markdown report named `database-query-contract-research.md` and a companion `database-query-contract-recommendations.json`.
Put both in a downloadable `database-query-contract-research.zip` when artifact tools exist, and link the standalone files too.
The report must contain: recommendation, repository findings, alternatives, priority-question answers, examples, source evidence, limitations, first proof, and interface handoff.
The JSON must contain a `recommendations` array with stable IDs, proposal, status (`recommend`/`investigate`/`defer`/`reject`), rationale, repository evidence, external sources, confidence, and proof.
Include all important conclusions in Markdown so the report stands alone. Use the JSON as a compact reconciliation aid, not a second report.
Codex will preserve these under `docs/intent/database-query-contract/raw/2026-10-11-pro/`, then write concise intent and initial shaping.
Do not claim to have saved files in that local repository. If you cannot create downloads, return the complete Markdown and valid JSON in your response.

Acceptance requires direct answers to each priority question, evidence for consequential claims, a simpler counterproposal, and a first proof that can reject the design.
Do not imply hypothetical performance is measured or provider parity is proven. Record missing evidence as a limitation.
End with a compact summary: access/baseline, files read, checks run or not run, deliverables, recommendation, unresolved assumptions, and blockers.
