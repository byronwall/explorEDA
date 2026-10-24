# Design: explain why two views report different numbers

https://github.com/byronwall/explorEDA

Source commit: `95832bd473884aeae23453af0888b4ca5187820d` (origin/main).
Mode: Design.

## Mission

What should explorEDA build so an analyst can compare two views' contributing records and explain why their numbers differ?
Design a useful feature and a staged implementation plan. Byron, the owner, wants this capability.
Do not require outside demand, participant studies, or observed failures before designing it.
The decision is the author and inspection workflow, evidence contract, and first shippable feature.
This is feature design, not a robustness audit or a request to keep today's interface.

Act as a visualization tool designer who has shipped linked views and record-level evidence systems.
Compare strong alternatives, recommend one, and explain its limits candidly.

## Access check

First confirm access to the full named commit or all complete file blocks in the attached source packet.
The packet is the authoritative snapshot when GitHub access fails. Its header lists the full inventory.
If a decisive input is absent, stop and name the smallest missing input. Do not claim full access from partial excerpts.

## Reading route

Read at minimum the packet's AGENTS.md, README.md, docs/agent-guide.md, docs/research/DIRECTION.md,
docs/ui-defaults.md, and CODING_STANDARDS.md. Then read:

1. `docs/intent/research-ideas-100/ideas/R056-contributor-set-comparison.md` and the R051 and R043 research summaries.
2. `components/charts/trace/{traceTypes.ts,traceRows.ts,ChartTraceScope.tsx,ChartTracePanel.tsx}` under `packages/explorEDA/src/`.
3. `lib/aggregates.ts`, `lib/chartPopulation.ts`, `hooks/CrossfilterWrapper.ts`, `components/charts/useGetLiveData.tsx`, and `providers/DataLayerProvider.tsx`.
4. MetricCard and BarChart plans, traces, consumers, and representative tests in the packet.
5. `components/ChartDataPreview.tsx`, `components/AnalysisChartContext.tsx`, `components/charts/ChartTraceControl.tsx`, and `types/ChartTypes.ts`.
6. Existing trace, filter, metric-card, and bar docs; the shop analysis example.

All source paths above are relative to `packages/explorEDA/src/` unless stated otherwise.
Current source facts to check: traces register inside one chart panel; the general trace-to-row helper handles only some kinds.
Aggregate contributor arrays contain both included and excluded inputs. Entity reductions mark repeated representatives separately.
Chart peer context, linked membership, local restrictions, numeric eligibility, and table search can describe different sets.
The project context maps runtime IDs to query result keys. A plain workspace has no such context.
These are existing boundaries to design around, not defects to repair here.

## Ranked questions

1. What is the best workflow for comparing two real chart values or marks?
   Compare pinning one trace and selecting another, selecting two charts, and a focused temporary comparison surface.
   Research named tools and primary literature: Tableau Explain Data/View Data, Power BI drillthrough and interactions,
   provenance/why-not explanations, and relevant linked-view systems. Use only the comparators that inform the decision.
   Show entry, choosing the second value, shared/left-only/right-only records, replacement, dismissal, and keyboard use.
   A user must reach exact evidence without changing chart filters by accident.
2. What exactly is comparable? Separate scope members, numerically included rows, repeated entity witnesses,
   distinct entities, and aggregate/query output grain. Define the smallest supported contract for milestone one.
   Decide how count versus sum, averages, different measures, denominators, and unequal grains should read.
   Equal sets can produce different values. A set difference must not be described as a numerical decomposition when it is not.
   Decide whether an explanation gives confirmed reasons or only evidenced differences; avoid invented causal attribution.
3. How should captured evidence behave when filters, calculations, settings, data, or source order change?
   Compare frozen snapshots and live handles. State what survives, what clears, and what the user sees.
   Runtime \_\_ID is not a durable cross-refresh key. Do not solve stable identity as a side effect.
   Resolve chart-local trace ownership versus workspace comparison state with the smallest clear React design.
4. How can this reuse existing plans, reducers, Rows surfaces, and project query navigation?
   Name the exact integration points, supported trace kinds, data shapes, and invalidation inputs.
   Avoid a second aggregation engine, universal provenance platform, or eager materialization for every chart.
   Cover bounded evidence display, large row sets, stale or deleted charts, empty sets, invalid values, and unsupported kinds.
   Explain whether saved schema, JSON/text syntax, export, or history changes are needed in the chosen design.
5. What should workers build first, and what should wait?
   Give independently shippable milestones with exact files/modules, important tests, docs page, runnable example, and main risk.
   Include a small native-data fixture with exact memberships and values: local restriction, invalid measure, duplicate IDs,
   equal totals with different sets, same sets with different reductions, empty result, and a settings/data revision.
   State expected values explicitly. Add browser acceptance at 1280, 783, and 390 pixels, using pointer and keyboard.

## Evidence and scope

Cite repository paths and symbols for code claims. Cite current primary documentation or papers with URLs for external claims.
Distinguish facts, inferences, and proposals. Earlier research used demand gates; DIRECTION.md supersedes those gates.
Keep the useful R051/R043 semantics without inheriting their requirement to wait for participants or named outside demand.

Keep React and TypeScript. Use pnpm. Assume one personal developer, server, client, and deployed version.
Prefer direct control flow and few useful tests. New global frameworks and broad compatibility support are out of scope.
Do not change filtering rules, reducer conflict policy, stable identity, query execution, or chart math to make values agree.
Do not build the feature or modify the repository. Codex will check the plan and do all repository changes.
Respect compact temporary inspection, existing trace gestures, and the one-panel rule in UI defaults.
Do not add mark-level Inspect buttons or a permanent comparison sidebar.

## Deliverables

Attach `report.md` and `implementation-plan.md` as downloads. A ZIP containing both is welcome, but optional.
If attachments are unavailable, provide their full content inline. Do not create receipts, manifests, or hashes.

Start the report with one paragraph naming what to build and why. Answer the ranked questions with sources.
Give stable recommendation IDs and classify each Build, Explore, Defer, or Avoid, with one reason.
The plan must name files, precise behavioral checks, exact fixture values, docs, runnable examples, and risks per milestone.
Each user-visible milestone must include its docs and example in the same milestone.
Make milestone one complete enough to implement directly. Do not substitute a study plan for a feature plan.
End with access status, files read, checks versus proposals, download links, and open questions.
