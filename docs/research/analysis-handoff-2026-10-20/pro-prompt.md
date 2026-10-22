# Portable analytical handoffs after existing export paths

https://github.com/byronwall/explorEDA

Source baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510` on main. Codex integration branch: `codex/analysis-handoff-research-2026-10-20`.

## Primary mission

Decide whether explorEDA should improve the handoff of an analytical finding to a recipient. Compare existing exports with a focused guide, one small companion artifact, and deferral. The decision is about portable understanding and reopening. It does not authorize a result-table pipeline or a new reporting platform.

Act as a candid product researcher familiar with exploratory analysis, data exchange and reproducible notebooks. Find the strongest reason to keep the current boundary. Explain when another product is the better destination. No customer demand or verified export defect is supplied.

## Access and source preflight

Read the attached selected-source packet. Authenticate each entry's byte count and SHA-256 against its header. It is a text snapshot, not a runnable checkout. The packet identifies baseline files, local additions and a historical quantity summary. The historical summary's relative links refer to commit350df70b, not the current folder. Use canonical GitHub links to retrieve additional source if needed. Record exact access and coverage limits.

GO for research only if the owner, repository, baseline and required source can be identified. NO-GO if essential source is missing from both the packet and repository. Ask for the smallest missing file; do not guess behavior. Read-only output is expected. Do not claim a checkout, execution, test, browser trial or file creation that did not occur.

## Current evidence and boundaries

- `DataTableToolbar.tsx` exports `filteredData` and configured field identifiers through `toTableCsv`. Nullish values become empty cells; quoting handles commas, quotes and newlines. Trace callers and parsing before claiming a round-trip defect. Search, linked filters and Rows controls have different scopes.
- `SavedAnalysisStructure` contains rows and settings. `saveDataUtils.ts` encodes special numeric values separately. Settings carry formulas, field settings and filters. This is richer than CSV but its recipient must use compatible software.
- `SavedViewsWorkspace.tsx` exports ordinary views through `downloadAnalysis(sourceRows, settings, ...)`. Project views use `selectAnalysisProjectView`, and project export writes source tables, definitions and views. Determine the actual dependency boundary from source. Do not equate a filtered chart with a filtered file.
- Images, settings JSON, full analysis JSON, project JSON and dashboard text already exist. Do not propose rebuilding them. Read `export.mdx`; inspect additional image or DSL source if decisive. A missing packet file is a coverage limit.
- Existing local trust intent requires selection/export/undo/reopen proof. Keep this first. This research cannot establish it.
- Reusable result tables are explicitly unprioritized until an actual repeated downstream task. Distinguish exchanging rows from materializing analytical outputs.
- The completed quantity review notes CSV has values/identifiers while analysis settings carry context. That observation is a boundary, not an accepted defect. Review its attached historical summary.
- PR451/452 cover preparation/freshness. PR455–459 cover missingness, relationships, rates, navigation and units. PR454 owns axes. Do not reopen those surveys or infer approval from open PRs.

## Ranked questions

1. For three synthetic jobs—explain a finding, reopen and inspect it, reuse its rows—what does each current export preserve, omit, or require externally? Map source versus selected rows, table search, formulas, types, labels/descriptions, reference populations, parameters, query dependencies, source identity and freshness. Cite exact paths and symbols. Separate checked facts from hypotheses.
2. Which recipient failure, if any, cannot be addressed by current controls plus one short lesson? Compare no change, lesson/recipe, explicit upstream preparation, one small companion file, and a larger bundle only as a rejected or future alternative. Score comprehension, faithful reopening, author effort and maintenance. Avoid a universal provenance schema.
3. What do established tools teach about this boundary? Use current primary docs for at least four relevant tools or standards. Consider Observable, Jupyter, Tableau/Power BI, Data Package/CSVW, DuckDB or Arrow where useful. Compare their intended recipient and actual contracts; avoid claiming standards compliance or popularity. List retrieval dates and direct URLs. Distinguish computational reproducibility, matching stored results, and explaining a finding.
4. Define a small discriminating proof with expected rows, values and context. Include a linked selection, table-only search, a formula, missing versus empty values, typed identifiers and project dependency export. Specify separate serialization checks, application/browser checks and recipient comprehension. Pro arithmetic is not runtime proof. State what can fail and when to stop.
5. What single recommendation could change product direction? Give a demand gate, alternatives, cost, explicit GO/NO-GO and rejection conditions. A NO-GO is useful. Preserve unresolved recipient, scope, timestamp and source-disclosure choices for Byron.

## Reading route

Start with AGENTS, README, agent-guide and coding standards. Read the two intents and export docs. Then follow DataTableToolbar/getFilteredRows, persistence types/serializers, selectAnalysisProjectView, evaluateAnalysisQuery, SavedViewsWorkspace and history. Use tests as evidence of covered contracts, not proof of an executed flow.

Selected baseline files:

- `AGENTS.md`
- `README.md`
- `package.json`
- `CODING_STANDARDS.md`
- `docs/agent-guide.md`
- `docs/ui-defaults.md`
- `docs/intent/current-analysis-trust/intent-brief.md`
- `docs/intent/reusable-analysis-outputs/intent-brief.md`
- `docs/intent/reusable-analysis-outputs/references/README.md`
- `apps/demo/src/docs/pages/export.mdx`
- `packages/explorEDA/src/types/SavedDataStructure.ts`
- `packages/explorEDA/src/types/AnalysisProject.ts`
- `packages/explorEDA/src/utils/saveDataUtils.ts`
- `packages/explorEDA/src/lib/analysis/projectFile.ts`
- `packages/explorEDA/src/lib/analysis/evaluateProject.ts`
- `packages/explorEDA/src/lib/project/analysisText.ts`
- `packages/explorEDA/src/lib/readers/delimited.ts`
- `packages/explorEDA/src/lib/readers/readTable.ts`
- `packages/explorEDA/src/lib/readers/types.ts`
- `packages/explorEDA/src/lib/valueParsing.ts`
- `packages/explorEDA/src/lib/fieldSettings.ts`
- `packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx`
- `packages/explorEDA/src/components/charts/DataTable/filteredRows.ts`
- `packages/explorEDA/src/components/charts/DataTable/README.md`
- `packages/explorEDA/src/components/RowsView.tsx`
- `packages/explorEDA/src/components/PlotManager.tsx`
- `packages/explorEDA/src/providers/DataLayerProvider.tsx`
- `packages/explorEDA/src/test/utils/saveDataUtils.test.ts`
- `packages/explorEDA/src/test/providers/analysisReliability.test.tsx`
- `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`
- `packages/explorEDA/src/components/charts/DataTable/__tests__/DataTable.test.tsx`
- `apps/demo/src/SavedViewsWorkspace.tsx`
- `apps/demo/src/SavedViewsWorkspace.test.tsx`
- `apps/demo/src/savedViewsHistory.ts`
- `apps/demo/src/savedViewsHistory.test.ts`

Known local commands: `pnpm --filter exploreda exec vitest run src/test/utils/saveDataUtils.test.ts src/test/providers/analysisReliability.test.tsx`; `pnpm --filter demo exec vitest run src/SavedViewsWorkspace.test.tsx src/savedViewsHistory.test.ts`; `pnpm check`; `pnpm check:pr`. Codex owns local execution and integration. Do not invent results.

## Evidence and recommendation rules

Use exact repository paths and symbols. Mark facts, inference and proposals separately. Verify current primary sources for claims that determine the decision. A competitor feature does not prove demand here. For each recommendation, give stable ID AH01 onward, affected job, evidence, alternatives, benefit, cost, confidence, falsifiable proof and disposition suggestion. Preserve zero, missing, empty and invalid distinctions. Do not infer that identifiers or field descriptions are public-safe. Scope is a product choice; avoid inventing access-control infrastructure.

Research only. No repository mutation, implementation, merge, deploy, paid service, secrets or unrelated account access. Existing React/TypeScript and pnpm remain. No worktree, enterprise platform, unit engine, cloud sharing system, compatibility layer or automatic lineage graph. Do not execute source merely to satisfy a count. Keep code proposals bounded and conditional.

## Deliverable contract

Produce four complete UTF-8 Markdown originals: `decision-report.md`, `evidence-and-comparisons.md`, `proof-plan.md`, `research-queue.md`. Deliver each with a direct download link. Also deliver `analysis-handoff-research.zip` containing exactly those four files plus `manifest.json`. Manifest must list each report's bytes and SHA-256. Publish ZIP and manifest hashes in the final message. Archive paths must be simple relative filenames with no symlinks or programs. No Library upload is required for collection.

The decision report must stand alone. Include a decisive recommendation, current contract matrix, ranked findings, stable recommendation IDs, alternatives, unresolved choices and GO/NO-GO rules. Evidence report must distinguish checked source, external facts and inference. Proof plan must include small concrete fixture data and expected results, unrun status, acceptance/rejection checks, and a proposed docs section plus example in the same milestone if warranted. Queue must revise the supplied ranked backlog, retain local trust first, and avoid repeating completed surveys.

Final message: decision, three decisive findings, access and execution limits, count of recommendations, all download links, inventory and hashes. If artifact creation fails, return all four complete documents inline with clear boundaries. Never claim downloads exist without real links. Codex will independently review, collect, verify, integrate and open a scoped review PR. Feature adoption requires a failed named task; synthesis alone is insufficient.
