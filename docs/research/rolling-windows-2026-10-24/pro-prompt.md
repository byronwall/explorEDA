# Methods for rolling windows with exact contributors

https://github.com/byronwall/explorEDA

Source commit: `95832bd473884aeae23453af0888b4ca5187820d`.
Mode: Methods.

## Mission

What rolling-window methods should explorEDA build for trustworthy moving summaries over time?
Choose a mathematical contract, an analyst workflow, and a staged implementation plan.
The user must understand each value's window, weighting, denominator, and exact source records.
Byron is the demand. Do not require outside demand or usability studies before designing this capability.

Act as an applied statistician and analytical-tool designer experienced with irregular time series.
Compare viable approaches and give candid tradeoffs, rejected options, and uncertainty.

## Access and reading route

Read the complete attached source packet at the named commit before research.
Confirm access to the decisive modules. If both the packet and connected GitHub lack required source, stop.
Name the smallest missing input. Do not claim a full review from partial access.

Read at minimum:

1. `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `CODING_STANDARDS.md`, and `docs/research/DIRECTION.md`.
2. `packages/explorEDA/src/lib/dailyRollup.ts`, its tests, `aggregates.ts`, and `valueParsing.ts`.
3. The packet's LineChart definition, calendar planner, trace, settings, rendering, and tests.
4. Shared trace types and scope, `AnalysisProject.ts`, project evaluation, and scalar calculation registry.
5. The line and calculated-field docs, demo example registry, and R035/R049 briefs.

Current facts to recheck:

- Calendar summaries use UTC day, week, month, and year boundaries. Weeks have an explicit start.
- Shared reducers support count, sum, average, min, and max, with included and excluded contributors.
- Calendar points retain exact raw source IDs. Missing periods and invalid values are distinct.
- The chart can fill absent additive periods with zero. This display policy is not a rolling-method contract.
- Own-chart selection dims the surrounding series. Other filters affect the values.
- Scalar calculations operate within one row. They do not provide ordered window functions.
- Project queries provide preparation stages. A chart-local method need not become a generic query language.
- Existing time-series-axis research concerns axes and original observations, not this method design.
- R035 and R049 contain old demand gates. DIRECTION.md supersedes those gates.

## Ranked questions

1. **Choose the estimand and window contract.** Compare pooled raw-observation summaries with equal-weight period summaries.
   Compare fixed calendar periods, elapsed-time duration, and a fixed number of observed buckets or rows.
   Decide the first supported operations, anchor, open/closed endpoints, minimum support, and edge behavior.
   Explain count, sum, and mean semantics separately. State where a mean of means is valid and where it is misleading.
   Compare primary documentation or papers from Observable Plot, pandas, SQL window engines, and other strong tools.
2. **Define gaps and partial support.** Distinguish no observations, invalid measures, observed zero, and unknown observation coverage.
   Distinguish a complete calendar span from evidence of complete data collection.
   Cover leap days, unequal month lengths, week starts, duplicates, irregular timestamps, interleaved groups, and unsorted input.
   Choose UTC versus local/calendar duration behavior. Do not silently use a month as thirty days.
   Decide when gap-to-zero is legitimate and how it interacts with denominators.
3. **Define the population and evidence contract.** Decide whether filters run before or after window evaluation.
   Separate chart scope, peer filters, own selection, facet partition, window membership, and included numeric contributors.
   A selected output point may depend on rows outside its displayed period. Show how the analyst discovers and selects those records.
   Prevent selection feedback from silently changing the meaning of its own reference value.
   Define revision and data-refresh behavior. Distinguish display bounds from analysis bounds.
4. **Specify algorithms and exact fixtures.** Give direct formulas, complexity, numerical stability limits, and contributor lookup costs.
   Compare a simple per-window reducer with sliding sums or prefix methods; choose a practical implementation.
   Include exact datasets and expected windows, IDs, numerator, denominator, and values.
   Include unequal bucket sizes, an absent period, an all-invalid period, real zero, partial edges, and two groups.
   Include endpoint ties, leap day or month transitions, peer filtering, own selection, and unit/offset transformations.
   Distinguish exact rational expectations from approximate tolerances. Do not require an executable harness.
5. **Choose the product seam.** Compare a calendar-chart rolling overlay, reusable derived table, and preparation step.
   Pick an independently useful first milestone. Explain authoring, labels, raw-versus-rolling comparison, trace entry, and closing.
   Define saved settings, undo/restore, dashboard-text representation, and export meaning.
   Show keyboard and touch access at 1280, 783, and 390 pixels. Avoid plot-level Inspect buttons.
6. **Make it startable.** Give ordered, independently shippable milestones with real files or proposed modules, types, tests,
   docs sections, runnable examples, and the main risk. Keep docs and examples in each visible milestone.
   State a bounded first release and specific later extensions. Base performance budgets on stated workloads, not invented guarantees.

## Evidence and boundaries

Cite repository paths and symbols for code facts. Cite current primary sources with URLs for decisive external claims.
Separate facts, inferences, and proposals. This is a capability Methods mission, not a robustness audit.
The product is an existing React and TypeScript library and demo. Keep that stack and use pnpm.
Prefer direct code for one server, client, and deployed version.
Do not add streaming services, paid dependencies, forecasting, confidence bands, automatic model selection, or causal claims.
Keep lag/difference preparation distinct from rolling summaries unless a shared primitive clearly earns its cost.
Do not create a generic expression platform or execution engine for the first useful window.
Codex owns repository changes. Do not commit, push, deploy, or modify the repository.

## Deliverables

Attach `report.md` and `implementation-plan.md`, and link both in the final message. One ZIP is fine.
If attachments are unavailable, provide complete Markdown inline.

- Start with one paragraph stating what to build and why.
- Answer the ranked questions, compare options, choose methods, and cite primary sources.
- Give stable recommendation IDs with Build, Explore, Defer, or Avoid and one-line reasons.
- End with a startable milestone plan, exact fixtures, docs and examples, and risks.
- Keep the result readable in a few minutes. Put detailed arithmetic in an appendix.
- End with access status, files read, checked facts versus proposals, deliverable links, and open questions.

Do not generate manifests, hash receipts, source archives, or executable programs.
