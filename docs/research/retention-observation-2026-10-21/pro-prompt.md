# Retention observation windows after the existing chart

https://github.com/byronwall/explorEDA

Source baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510` on main. Codex integration branch: `codex/retention-observation-research-2026-10-21`.

## Primary mission

Decide whether explorEDA should change how its existing Retention chart explains observation completeness. Compare retaining its current contract, a focused lesson, upstream preparation, and one small explicit observation boundary. Investigate the distinction between no recorded activity, an unfinished period, an unobserved period, and a known interruption in observation. Do not turn ordinary retention into survival analysis or propose a new chart family.

Act as a candid product and analytical-method researcher. Find the strongest case for deferral. No observed customer demand, telemetry outage or verified runtime defect is supplied. The decision could change whether event analytics stays a simple snapshot chart or accepts authored observation metadata. That boundary needs evidence before implementation.

## Access preflight

Use the attached selected-source packet as an authorized read-only fallback. Authenticate entry byte counts and SHA-256. It is not a runnable checkout. Baseline files must identify the exact repository and commit. Local prompt/queue additions and a historical handoff summary at ae2716a2 are identified separately. The historical summary's relative links belong to its original folder; use canonical pinned GitHub links.

GO only if owner, repository, baseline and essential source are identifiable. NO-GO if a decisive dependency is missing from both packet and repository. Ask for the smallest missing file. Use canonical GitHub paths for extra source. State coverage limits and distinguish reading from execution. No repository mutation is assigned. If artifact tools fail, complete inline fallback is allowed.

## Current source evidence

- Funnel, Retention and Timeline already exist and register in `packages/explorEDA/src/charts/registerAllCharts.ts`. Domain intent and the previous queue contain stale future-tense claims. Treat current source as authoritative for delivered behavior; do not imply a new implementation is approved.
- `planRetention` uses `ids` for entry cohorts/activity and `allIds` for the maximum readable timestamp. `useGetAllIds` restricts rows with chart-local filters. `useGetLiveIds` obtains peer-filtered items and facet IDs. Trace the provider before claiming exact own/peer filter behavior.
- Calendar day/week/month periods are UTC; weeks start Monday. Cohort size is the denominator. Each entity counts once per elapsed calendar period. Existing behavior is period-specific activity, not necessarily consecutive or on-or-after retention.
- Future cells are blank. Partial cells are hatched and explained in `RetentionTraceBody`. Inspect the exact partial calculation, including its day rounding. Do not recommend adding warnings or hatching as if absent.
- The All row pools cohorts that reached each elapsed period. Inspect whether partial cells enter that pool and how the renderer explains it. A source-predicted concern is not an executed bug.
- Cell selection stores entity values and linked views show their events. Keep source events, active entities, entry rows and denominator membership distinct.
- A synthetic product event log and product-retention example exist. They do not prove demand or production completeness. An event maximum cannot by itself prove continuous collection; evaluate the consequence without inventing an outage.
- Local trust remains first local proof. PR454 owns time-series axes. PR451/452 cover preparation/freshness; PR455–460 cover other completed surveys. Avoid reopening those missions or adding a general watermark platform.

## Ranked questions

1. What exactly does current Retention promise about entry, activity, observation end, partial/future/zero cells and the All row? Produce a contract matrix citing real symbols. Examine filtered entry-event removal, chart-local population, peer event filters, facets, sparse tails, unrelated late events and day/week/month boundaries. Separate coherent chosen semantics from defects and unverified hypotheses.
2. Which decisions are impossible from event rows alone? Compare four alternatives: no change with explicit contract, current controls plus one lesson, upstream authored cohort/observation table, one small explicit observation-end input. Consider partial-period exclusion from summaries only as a separately justified alternative. Score interpretation, author effort, contributor inspection and maintenance. Reject automatic completeness inference. Do not silently select global versus per-cohort/per-entity coverage.
3. Compare at least four current primary sources from relevant products or analytical references, such as Amplitude, Mixpanel, PostHog, GA4/BigQuery or established survival-analysis documentation. Verify exact period, incomplete-bin and retention-mode contracts. Explain differences; do not copy every competitor option or infer popularity/demand. Give direct URLs and retrieval dates. Keep event retention, censoring and survival estimands distinct.
4. Define the smallest discriminating proof. Supply a tiny concrete event log and independently worked expected cohorts, numerators, denominators, observed/partial flags and summary values. Include quiet complete tail versus missing collection with identical recorded events; an unrelated late event; a peer filter removing entry rows; chart-local versus facet scope; and a UTC boundary. Identify which outputs require human-authored coverage facts. Mark proposed runtime/browser checks unrun. Arithmetic and source checks cannot accept product behavior.
5. Recommend one direction, with stable recommendation IDs RO01 onward. Give explicit GO/NO-GO, falsification, cost, unresolved product choices, and the smallest evidence needed before implementing. If warranted, pair a proposed docs section and runnable example in the same milestone. Keep broad event ingestion, per-entity coverage engines and statistical platform work proposed or rejected.

## Reading route

Read instructions, README, agent guide and coding standards. Then domain/calendar/date/current-trust intents; retention and funnel docs; plan, tests, definition, renderer, trace and settings; live/all ID helpers, chartPopulation, provider, parsing and calendar utilities. Finish with generator and examples. Domain plans are historical intent, not proof of current delivery. The historical handoff summary supplies queue and export boundaries only.

Selected baseline files:

- `AGENTS.md`
- `README.md`
- `package.json`
- `CODING_STANDARDS.md`
- `docs/agent-guide.md`
- `docs/ui-defaults.md`
- `docs/intent/current-analysis-trust/intent-brief.md`
- `docs/intent/domain-analysis-views/intent-brief.md`
- `docs/intent/domain-analysis-views/implementation-plan.md`
- `docs/intent/domain-analysis-views/initiative-map.json`
- `docs/intent/calendar-period-analysis/intent-brief.md`
- `docs/intent/date-time-handling/intent-brief.md`
- `apps/demo/src/docs/pages/retention.mdx`
- `apps/demo/src/docs/pages/funnel.mdx`
- `apps/data-samples/product_events.ts`
- `packages/explorEDA/src/components/charts/Retention/retentionPlan.ts`
- `packages/explorEDA/src/components/charts/Retention/retentionPlan.test.ts`
- `packages/explorEDA/src/components/charts/Retention/definition.ts`
- `packages/explorEDA/src/components/charts/Retention/Retention.tsx`
- `packages/explorEDA/src/components/charts/Retention/Retention.test.tsx`
- `packages/explorEDA/src/components/charts/Retention/RetentionTraceBody.tsx`
- `packages/explorEDA/src/components/charts/Retention/RetentionSettingsPanel.tsx`
- `packages/explorEDA/src/components/charts/useGetLiveData.tsx`
- `packages/explorEDA/src/lib/chartPopulation.ts`
- `packages/explorEDA/src/lib/valueParsing.ts`
- `packages/explorEDA/src/lib/dailyRollup.ts`
- `packages/explorEDA/src/providers/DataLayerProvider.tsx`
- `packages/explorEDA/src/charts/registerAllCharts.ts`
- `apps/demo/src/demos/examples.ts`

Known commands for Codex: `pnpm --filter exploreda exec vitest run src/components/charts/Retention/retentionPlan.test.ts src/components/charts/Retention/Retention.test.tsx`; `pnpm --filter exploreda check-types`; `pnpm check`; `pnpm check:pr`. Pro must not invent executed results.

## Evidence and scope

Mark observed source facts, external facts, inference and proposals separately. Cite exact paths/symbols and current primary sources for decisive claims. Each recommendation needs affected task, evidence, alternatives, benefit, maintenance cost, confidence and a falsifiable proof. No popularity claims without evidence. No source or browser execution claims from arithmetic. Unknown observation coverage must remain unknown; it is not automatically zero or an application defect.

Research only. No code mutation, merge, deployment, paid service or unrelated account access. Existing React/TypeScript and pnpm remain. No worktree, general ingestion system, scheduler, compatibility layer, universal coverage schema or new chart family. Do not change initial-entry versus filtered-entry semantics without naming that product choice. Retain current trace and selections. No automatic imputation, retention-mode catalogue or survival model.

## Deliverable contract

Produce four complete UTF-8 Markdown originals: `decision-report.md`, `evidence-and-comparisons.md`, `proof-plan.md`, `research-queue.md`. Provide direct download links to each. Also provide `retention-observation-research.zip` with exactly those four plus `manifest.json`. Manifest lists each report's byte count and SHA-256. Publish ZIP and manifest SHA-256 in the final message. Use simple relative filenames, no symlinks or programs. No ChatGPT Library upload is needed.

Decision report: standalone recommendation, current contract matrix, ranked findings, stable recommendation IDs, alternatives, unresolved choices and GO/NO-GO. Evidence report: checked repository facts, external comparisons, coverage limits and inferences. Proof plan: tiny event fixture, expected calculations, counterexamples, separate arithmetic/source/runtime/browser checks and conditional docs/example scope. Queue: revise the attached queue, retain local trust first, correct delivered-domain status, avoid repeating completed surveys.

Final response: decision, three decisive findings, recommendation count, access/execution limits, all five direct links, inventory and hashes. If artifact creation fails, return all four complete documents inline. Do not claim nonexistent downloads. Codex owns independent review, collection, integrity checks, reconciliation, validation and open review PR. A research recommendation does not itself authorize product implementation.
