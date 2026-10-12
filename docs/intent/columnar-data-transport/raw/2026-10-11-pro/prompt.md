# Efficient transport and bounded client snapshots

## Primary mission

Which transport and in-browser data layout best preserves fast exact exploration, including full snapshots, at the lowest total cost?

## Priority questions, in order

1. Compare compressed row JSON, compressed column JSON, Arrow IPC streams/files, Parquet delivery, and a small custom typed-array envelope. Separate an interchange format from HTTP compression and the browser's resident layout. Explain streaming, random column access, startup, dependencies, and implementation cost. Do not pick binary solely from wire size.
2. Work through representative workloads: 10k and 100k rows, narrow numeric scatter coordinates plus color/key, wide mixed records, dictionary-friendly low-cardinality categories, high-cardinality text, nullable fields, and small aggregate outputs. Include a larger sensitivity case without making it the MVP. Show estimated uncompressed sizes with formulas. Propose measured comparisons for encode/decode time, compressed bytes, time to first view, filter latency, peak heap and total copies.
3. Decide when compression and column tricks earn their costs. Study dictionaries, null bitmaps, integer widths, delta/run-length encoding, floating-point precision, UTF-8 strings, dates/timezones, large integers, decimals, and nested/unsupported values. Preserve exact values and null/empty/invalid distinctions. Explain where lossless limits require explicit types or rejection. Treat quantization as opt-in research, not an invisible optimization.
4. Follow bytes all the way from database rows through server encoding, HTTP, decompression, browser decoding, workers, and chart consumers. The current provider and Crossfilter use row objects. Explain rehydration/copy cost, transferable buffers and ownership, and the smallest useful change. Do not describe a columnar wire format as an end-to-end zero-copy system without evidence.
5. Define the minimum envelope metadata for dataset/snapshot identity, schema, row keys/order, coverage, counts, batches, completion, cancellation, truncated/error responses, and cache expansion. Explain why chunks/columns from different snapshots must not be combined. Coordinate with the query track without inventing its final contract.
6. Recommend a benchmark-first adoption rule and a simple fallback design if the more complex format fails to improve end-to-end latency or memory. Distinguish client capacity limits from transfer limits. Propose a practical row/byte/memory policy that still supports full snapshots when reasonable.

## Required decision output

Provide an option comparison, explicit size arithmetic, a payload sketch, a byte/copy flow diagram, and a benchmark fixture matrix.
Give a default candidate, a strongest simpler alternative, and measurable conditions that would reverse your recommendation.
Check current official browser and selected-library support. Link evidence for streaming, compression, and JavaScript integration.
Limit query planning and adapter semantics to the exact interface requirements needed by transport.

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

Produce a self-contained Markdown report named `columnar-data-transport-research.md` and a companion `columnar-data-transport-recommendations.json`.
Put both in a downloadable `columnar-data-transport-research.zip` when artifact tools exist, and link the standalone files too.
The report must contain: recommendation, repository findings, alternatives, priority-question answers, examples, source evidence, limitations, first proof, and interface handoff.
The JSON must contain a `recommendations` array with stable IDs, proposal, status (`recommend`/`investigate`/`defer`/`reject`), rationale, repository evidence, external sources, confidence, and proof.
Include all important conclusions in Markdown so the report stands alone. Use the JSON as a compact reconciliation aid, not a second report.
Codex will preserve these under `docs/intent/columnar-data-transport/raw/2026-10-11-pro/`, then write concise intent and initial shaping.
Do not claim to have saved files in that local repository. If you cannot create downloads, return the complete Markdown and valid JSON in your response.

Acceptance requires direct answers to each priority question, evidence for consequential claims, a simpler counterproposal, and a first proof that can reject the design.
Do not imply hypothetical performance is measured or provider parity is proven. Record missing evidence as a limitation.
End with a compact summary: access/baseline, files read, checks run or not run, deliverables, recommendation, unresolved assumptions, and blockers.
