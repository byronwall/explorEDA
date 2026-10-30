# Timeline concurrency and exact interval contributors

https://github.com/byronwall/explorEDA

Ref: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6` on `main`.
Mode: Methods, with enough product design to ship the method.

## Mission

What should explorEDA build so an analyst can measure simultaneous occupancy,
find double bookings, and inspect the exact intervals behind each duration?
Define the mathematical contract and a staged implementation plan.
Byron wants this capability. Do not require outside demand or a usability study.
This is new analytical work, not a robustness audit of the existing Timeline.

Act as an applied algorithms specialist who has built interactive temporal analysis tools.
Compare credible methods and products. Make a clear recommendation, with tradeoffs and rejected alternatives.
Codex will check your proposals against the code and make all repository changes.
Do not commit, push, merge, deploy, or provision services.

## Access check

First confirm access to the named commit or the attached complete-file source packet.
The packet is authoritative for this baseline. It includes instructions, implementation, tests, docs, and a runnable example's source.
If a decisive input is missing from both, stop and name the smallest missing input.
Do not claim source access or tests you did not run.
The retired domain-analysis intent paths cited by R013 no longer exist at this ref.
Do not treat those stale references as missing prerequisites.

## Read first

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, and `docs/research/DIRECTION.md`.
2. `packages/explorEDA/src/components/charts/Timeline/`: planner, definition, rendering, settings, traces, and both test files.
3. `packages/explorEDA/src/components/charts/useGetLiveData.tsx`, `packages/explorEDA/src/providers/DataLayerProvider.tsx`, and `packages/explorEDA/src/hooks/applyFilter.ts`.
4. Saved settings and filter types, `utils/saveDataUtils.ts`, and DSL compile/export/setting keys.
5. Trace types and notebook finding evaluation. Identify whether a new aggregate needs explicit integration.
6. `apps/demo/src/docs/pages/timeline.mdx`, `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/journeyDashboards.ts`, and `apps/demo/public/datasets/room-bookings.csv`.
7. `docs/intent/research-ideas-100/ideas/R013-timeline-concurrency.md`.

## Current facts to check

- Timeline shows one source row per bar, grouped by lane.
- `planTimeline` derives stable lanes and time bounds from all source IDs; visible intervals use live IDs.
- A missing end is open. Rendering clips it to the full-data domain's end, rather than a saved analytical horizon.
- `overlapsWindow` includes touching endpoints. The saved brush uses paired date-range filters.
- A bar click selects its source ID; Alt-click traces that interval. Dark overlapping bars do not quantify occupancy.
- Current docs show room bookings, including cancellations and open holds. Status is just a color field.
- The package and demo use React and TypeScript. Keep them in React.

## Ranked questions

### 1. Define the quantities and the population

Specify half-open or closed occupancy, adjacent endpoints, equal timestamps,
zero-length events, duplicate rows, missing starts or lanes, invalid/reversed ends,
and finite horizons for open intervals. Keep current inclusive brush selection unless you justify a separate change.
Distinguish row concurrency, occupied-lane count, union busy duration, total interval duration,
duration above a threshold, and excess occupancy. Do not call row concurrency utilization without a denominator.
Define per-lane and all-lane measures. State exactly which is worth shipping first.
Separate a finite analytical window from viewport clipping and from a source-population filter.
Explain which controls are saved and what happens after reload or data refresh.
Do not silently drop cancellations or count only certain status labels.

### 2. Choose an algorithm and exact contributor representation

Compare a sweep over grouped endpoints, overlap-pair enumeration, and a prepared summary table.
Recommend a method for counts, durations, peak concurrency, and exact contributing source IDs.
Define simultaneous endpoint updates, segment identity, coalescing rules, and query-time membership.
Adjacent segments with equal counts can have different contributors; address that explicitly.
Show complexity for sorting, computing summaries, retaining contributors, and inspecting a segment.
Avoid quadratic contributor storage where it is not needed. Give measurable thresholds rather than invented hard limits.
Explain numeric precision, timestamp units, zero denominators, DST, and duration versus calendar time.
Treat the current timestamp parser as baseline; unbuilt temporal-preparation research is not a dependency.

### 3. Design the analytical workflow

Compare a Timeline concurrency strip, lane conflict highlighting, and existing charts over prepared segment rows.
Choose a coherent first surface and a path to summaries and notebook use.
Show the exact user actions to find a conflict, measure its duration, inspect its contributors,
and continue through linked charts or a notebook. Distinguish all intervals involved over a selected window
from the subset simultaneously active on a chosen segment.
Explain ownership of the Timeline's own filters, filters from other charts, and facet constraints.
Avoid self-filter feedback that erases the evidence being measured.
Respect mark-click filtering, Alt-click/Alt-Enter tracing, empty-space clear, compact controls,
and existing saved-layout behavior. Include wide, intermediate, and narrow reading behavior.

### 4. Compare primary methods and strong tools

Use current primary sources for interval algebra, sweep-line methods, database range/temporal operations,
and analytical tools with interval overlap or occupancy summaries.
Compare three useful approaches or products, not a catalogue of names.
Explain what explorEDA should adopt and what would add unnecessary scope.
Recurring schedules, booking edits, capacity optimization, paid services, and a general scheduling engine are out of scope.
An explicit constant threshold is analytical context; do not require a capacity platform.

### 5. Provide proof cases and complete milestones

Provide a small fixture with adjacent intervals, a three-way overlap, contributor changes at equal count,
zero-duration events, duplicates, multiple lanes, open ends, clipping, and excluded rows.
Use explicit UTC instants and exact integer millisecond expectations.
List every atomic segment's count and contributors, union busy duration, duration above threshold,
total interval duration, excess occupancy, and peaks for the selected measures.
Include linked-filter and facet cases, restored settings, and a changed source.
State invariants an independent implementation can check.
Each milestone must ship alone, naming actual files or proposed new modules, important tests,
its docs page or section, runnable example, and main risk.
Include saved JSON and Dashboard text, validation, host callbacks, trace records, notebook limits,
and folder reopen where relevant. Do not claim generic exports already preserve a new semantic type.

## Evidence and constraints

Cite repository paths and symbols for facts. Cite primary sources with URLs for decisive external claims.
Separate facts, inferences, proposals, and executed checks. State uncertainty.
Existing research plans are proposals, not installed APIs or implementation dependencies.
Prefer a small pure computational core and direct integration into current surfaces.
Use pnpm and the repository's shared test limits. No worktrees, enterprise architecture, or speculative compatibility layers.
The current mission and explicit artifact contract take precedence over older research demand gates
and DIRECTION's older prohibition on preserving original results.

## Deliverables

Lead with one paragraph saying what to build and why.
Attach these Markdown files and link them in your final answer:

1. `timeline-concurrency-report.md`: answers, alternatives, formulas, sources, and stable recommendation IDs.
2. `timeline-concurrency-implementation-plan.md`: independently shippable milestones with files, proof cases, docs, examples, and risks.

Classify every recommendation as Build, Explore, Defer, or Avoid, with one sentence explaining why.
Build means a planning disposition, not approval to implement.
Attach useful fixture data and exact expected results as JSON if you create them.
Include every image, diagram, code companion, or other file you use in the result.
Do not request Library upload as a collection prerequisite. Do not create source receipts or hash manifests.
An optional ZIP is fine; link each artifact as well.
If file creation fails, give the full content inline.
End with access status, files read, executed checks versus proposals, deliverable links, and open questions.
