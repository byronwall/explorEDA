https://github.com/byronwall/explorEDA

# R043: entity grain across existing preparation and chart paths

Research mode. One primary mission: decide which entity-aware aggregate results must agree, and which must differ because their grains differ.
Repository baseline: `f4cacdde180e16ad814451a8c064e394535565d6` (origin/main refreshed October 21, 2026).
Local research branch: `codex/entity-grain-research-2026-10-21`.
Catalogue: merged PR463, `docs/intent/research-ideas-100/`.
Selected stable ID R043, priority 2. R026 priority 1 is complete in PR465; do not repeat it.
R043 ranks ahead of R077, R001, R051 by catalogue order and its bounded evidence gap.
The attached queue records comparison scores. They express judgment, not customer demand.

Act as a critical analytical data-model and React/TypeScript library reviewer.
Favor a result that changes a concrete product decision. Keep current behavior when it earns its cost.
This is a personal project. Use the smallest solution. No compatibility platform, semantic layer, new query engine, or general graph editor.

## Access preflight

Confirm the owner, repository, baseline, source availability, and ability to read the packet.
Use GitHub access at the exact baseline if available. Otherwise use the attached selected text snapshot.
The packet contains exact baseline files, local prompt/queue, parsed catalogue projections, and pinned historical PR451 research.
It is not a runnable checkout. Do not claim tests ran unless you actually ran them in a complete checkout.
Record inspected files and access limits. Local additions are distinguished in its inventory.
The canonical URL above is the authoritative repository identity.

GO only when the two reducers, their types, representative tests, and fixture are readable.
NO-GO if source is wrong, missing, or too incomplete to support the contract decision.
State the smallest missing input. Do not fabricate results or inspect unrelated private context.
A missing customer does not block a bounded correctness study. It limits product value claims and implementation scope.
You need no write access. Produce complete downloadable artifacts; Codex owns local integration and review PR work.
If file creation fails, provide every artifact's full content in the response.

## Ranked reading route

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, root and library README/package files.
2. Full `docs/intent/research-ideas-100/ideas/R043-entity-grain-parity.md`, selected catalogue JSON and local review.
3. `packages/explorEDA/src/lib/aggregates.ts` (`summarizeGroup`, `calculateGroupedAggregate`, `poolAggregateRows`) and `aggregates.test.ts`.
4. `packages/explorEDA/src/lib/analysis/evaluateProject.ts` (`sourceReferences`, `lookupFrame`, `aggregateFrame`, `evaluateAnalysisQuery`).
5. `packages/explorEDA/src/types/AnalysisProject.ts`, `src/test/lib/analysis/evaluateProject.test.ts`, and `src/test/fixtures/shopProject.ts`.
6. Metric-card plan/trace and grouped aggregate inspector, project stage records/trace, source identity helpers, category and value parsing helpers.
7. Current-analysis-trust and reusable-analysis-metrics intents. Demo shop analysis and metric-card/project-folders docs.
8. Pinned PR451 summary, decisions, and proof plan in the packet. Reuse its preparation boundary and contributor limits.

Paths in item 6 relative to `packages/explorEDA/` are explicit in the packet inventory.
Read all relevant excerpts. Follow imports when GitHub access permits, and flag omitted dependencies.
Check prompt observations against source. Source-predicted behavior is not runtime proof.

## Current observations to challenge

Shared `summarizeGroup` groups typed entity values, excludes nullish IDs, checks raw measure agreement, and retains per-row reasons.
Project `aggregateFrame` can use a field's source origin and source references for identity.
Source missing/duplicate keys receive positional fallback identity and diagnostics.
Project aggregation and shared summaries both count/sum/average, but count with a measure can have different populations.
Existing shop tests establish 150 source order total versus 140 represented order total after item lookup.
These are starting observations. Do not assume they prove defects or equivalent populations.
PR451 retained complete local rows and upstream SQL for separate prepared relations.
Its author proof and exact contributor inspection proof remain proposed. Do not count them as passed.
R026 separately studied missing/invalid value accounting; reuse those distinctions without reopening the survey.
R077 handles selection identity after source replacement. Do not expand this mission into replacement persistence.

## Priority questions

1. Define the equivalence contract first. When does a source-row identity mean the same entity as a user-selected field value?
   Compare three choices: keep separate documented contracts; align only shared semantics; force one reducer.
   Which decision best protects real analytical meaning without expanding the API?
2. Build a tiny repeated-entity fixture with expected values AND exact membership before calculating current outputs.
   Include expansion copies, independently observed events sharing a label, missing keys, duplicate source keys,
   typed `1` versus `'1'`, identical repeated values, conflicting values, null/invalid amounts, and observed zero.
   Compare count with no measure, count with a measure, sum, and average.
   Separate equivalent populations from intentionally different grains. Include source-origin fields and derived/copied entity fields.
3. For every unavailable result, can an author discover the responsible entity and rows through current evidence?
   Separate group source membership, selected entity representatives, valid numeric contributors, duplicates, conflicts, and excluded rows.
   Examine actual trace consumers before claiming data exists but is hidden, or an explanation is missing.
4. Is the smallest next step a contract table, a lesson/example, targeted tests, a bounded repair, or helper extraction?
   Explain any source-predicted fault, its smallest reproduction, affected boundary, and why it is not just a grain difference.
   Do not recommend extraction solely because code is duplicated.
5. Does upstream SQL or a pre-aggregated source preserve this intention more simply?
   Compare a keyed pre-aggregate/lookup recipe with direct entity aggregation, including provenance limits.
   Use current primary sources only for decisive external claims. Avoid another broad preparation survey.

## Proof and evidence rules

Freeze normative fixture expectations before examining computed results. Include that frozen table in proof-plan.md.
If the intended contract is unresolved, show alternatives and mark the choice proposed.
Report facts, inferences, hypotheses, and recommendations separately.
Cite exact repository paths and symbols for every consequential claim.
For externally decisive claims, cite current official documentation, access date, and the supported statement.
Do not substitute search snippets or vendor marketing for evidence.
Give each recommendation stable EG01, EG02, ... IDs, disposition proposal, confidence, evidence, cost, alternatives, and rejection gate.
Check numeric totals and exact entity/source sets independently. Arithmetic alone is not an executed product test.
Preserve whole-result unavailable versus entity-only exclusion as an explicit decision.
Do not silently deduplicate valid independent events, merge typed keys, convert missing to zero, or select the first conflicting value.
Keep existing ordinary cases, filtering scope, and source provenance intact.

## Scope and gates

Read-only research. Do not modify application files, install dependencies, provision services, merge, or deploy.
Small pseudocode/proposed fixtures are allowed. No downloaded executable is required.
Do not implement once-per-entity aggregation again. It already exists.
Do not claim named user demand from synthetic examples.

GO for a bounded repair only after equivalent contracts/populations produce a demonstrated disagreement,
or a concrete trace gap prevents explaining a known result. Show the smallest failing case and negative control.
GO for a shared helper only after proving it preserves source identity and value grouping where each is intended.
NO-GO for forced unification that merges independent events or destroys contributor reasons.
NO-GO for a large abstraction without a demonstrated benefit. Keeping distinct contracts is a successful outcome.
Stop research after answering the ranked questions and delivering a bounded decision. Leave larger implementation proposed.
Each proposed visible milestone must name its docs page/section and runnable example together.

Codex can run `pnpm --filter exploreda exec vitest run src/lib/aggregates.test.ts src/test/lib/analysis/evaluateProject.test.ts`.
Use `pnpm --filter exploreda check-types` for bounded code and `pnpm check` once before a review PR.
Browser proofs for changed flows use 1280, 783, and 390 px. No browser proof is claimed for this research packet.

## Deliverable contract

Return four standalone UTF-8 Markdown files, plus one ZIP with exactly these four files and manifest.json:

- report.md: self-contained decision, access/baseline, actual files read, contract comparison, source findings, fixture results,
  external evidence, uncertainty, prioritized recommendation, and strongest counterargument.
- recommendations.md: all substantive EG recommendations, evidence, disposition proposal, costs, alternatives,
  exact destinations, bounded milestones, docs/examples pairs, and GO/NO-GO conditions.
- proof-plan.md: frozen expected fixture and memberships; separate normative/proposed expectations from current outputs;
  executed checks versus source predictions; minimal positive/negative controls and browser/author follow-up gates.
- research-queue.md: concise existing IDs only. R043 result/next action, R077, R001, R051 next,
  R026 complete PR465, R008 complete PR464, R011 reuses PR461. Do not generate another idea catalogue.

Name ZIP `exploreda-R043-entity-grain-research.zip`.
manifest.json lists each Markdown member, byte count, SHA256, and baseline.
Also provide manifest.json separately. Link all six downloads in the final response.
List ZIP and manifest hashes in that response. Do not include programs, unrelated files, or hidden archive entries.
Final compact status: GO/NO-GO, access and source limits, checks actually run, artifact inventory,
main decision, unanswered questions, and whether a targeted follow-up is necessary.
Do not declare success with missing required evidence. Codex will independently review and integrate results into an open review PR.
