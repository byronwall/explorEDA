# Design temporal preparation and calendar meaning

https://github.com/byronwall/explorEDA

Ref: `9d64a021e35d312887b1bc848e307f42b6c3091f` (origin/main, October 26, 2026).
Mode: Design. The attached source packet contains complete files at this ref.

## Mission

What should explorEDA build so analysts can prepare civil dates, exact instants,
and explicit numeric epochs, then use them consistently in linked analysis?
Recommend a coherent temporal design and shippable milestones, from preparation
through filtering, calendar grouping, inspection, saved notebooks, and refresh.
Byron is the demand. Argue the capability's merits; do not require outside demand
or a usability study. This is feature design, not a parser robustness audit.

Act as a data-tool designer with experience in temporal types and analytical systems.
Give candid tradeoffs, alternatives, rejected options, and uncertainty.

## Access check and reading route

First confirm access to the supplied source packet or the repository at this ref.
If decisive source is missing from both, stop and name the smallest missing input.
Do not claim full access from partial excerpts.

Read at minimum:

1. `AGENTS.md`, `docs/agent-guide.md`, `docs/research/DIRECTION.md`, `docs/ui-defaults.md`.
2. `docs/intent/date-time-handling/intent-brief.md`,
   `docs/intent/calendar-period-analysis/intent-brief.md`, and the R032 brief.
3. `packages/explorEDA/src/lib/valueParsing.ts`, `fieldSettings.ts`, `dailyRollup.ts`,
   `datePresets.ts`, and their supplied tests.
4. The supplied field settings provider, data-type detection, column filter,
   calendar/time-series planners, and filters/types.
5. The supplied saved-analysis types, provider, project evaluator/text/folder,
   notebook reader/compiler/writeback, demo docs and examples.

## Current boundaries to verify

`parseDateText` reads offset-free text as UTC and year-month as its first day.
`timestampOf` accepts finite numeric timestamps. Explicit datetime conversion
instead stringifies raw values and calls `parseDateText`, producing ISO text.
`FieldSettings` has `datePreset`, datetime type, and date/datetime display formats.
`utcDay` accepts strings or numbers, while `utcPeriod` starts from nonblank strings.
The existing type system has one datetime kind. Treat these as reading leads,
not instructions to patch each boundary independently.

Recent work shipped notebooks, sheets, annotations, built-in chart counterparts,
and time-series axis controls. Older intent claims can be stale: trust source.
Open PRs propose numeric preparation (#531), rank discovery (#530), ordered
differences (#525), rolling windows (#521), and other preparation capabilities.
Those plans are unbuilt and are not prerequisites. Do not redesign their missions.

## Ranked questions

1. What temporal model should we build? Compare explicit preparation to canonical
   strings, minimal semantic metadata, and distinct runtime temporal values.
   Decide civil date versus instant, local wall time, year-month/period labels,
   and explicit epoch seconds/milliseconds. Show what analysts gain. Decide
   which kinds belong in the first milestone and which should wait.
2. How do strong tools and standards solve this? Compare primary documentation
   from Temporal, Arrow, DuckDB/PostgreSQL, pandas/Polars, and Power Query/Tableau
   where relevant. Separate display zone, source zone, grouping zone, calendar,
   instant, and elapsed duration. Choose a practical first boundary. Do not
   assume a new dependency is necessary; compare its actual value and cost.
3. What does the author see and do? Design explicit interpretation, preview,
   ambiguous/invalid record review, Apply/reset, raw versus prepared values,
   calendar and instant filters, grouped marks and their exact source records.
   Decide how authoring a zone changes day membership, including DST gaps and
   repeated times. No automatic epoch-unit guessing or browser-zone inference.
4. How does the meaning survive the whole application? Specify field metadata,
   formula/query outputs, validation, JSON and text, folder projects, notebooks,
   sheets, callbacks, save/reopen, source refresh, history, and selection identity.
   Decide what invalidates and when a new interpretation takes effect. Follow
   the existing React/TypeScript architecture and central raw-value parsing rule.
5. What exact fixtures prove the design? Include civil dates, equivalent offsets,
   midnight crossings, explicit epochs, leap days, year-month labels, DST gaps
   and folds, missing/invalid inputs, period membership, comparisons, and refresh.
   Give exact expected values and contributor row IDs. Distinguish numerical
   precision policy from time-zone database/version assumptions.
6. What is the build order? Each milestone must deliver a usable end-to-end slice,
   naming current files/modules, tests, docs page/section, runnable demo example,
   and its main risk. Include keyboard and 1280/783/390px browser acceptance.
   Avoid one parser milestone followed by an indefinite consumer migration.

## Evidence and constraints

Cite repository paths and symbols for current behavior. Cite current primary
sources with URLs for decisive external claims. Distinguish facts, inferences,
and proposals. State missing or conflicting evidence.

Keep React and TypeScript, pnpm, one client/server/version. No general scheduling
system, fiscal-calendar platform, broad compatibility layer, paid service,
framework migration, or execution of repository changes. Currency, physical
units, rolling-window estimators, and regression are separate missions.
Keep the plan ambitious but direct. Do not impose an enterprise metadata registry.
Use exact records and current trace/selection mechanisms where possible.

## Deliverables

Attach two complete Markdown files, with download links in the final message:

1. `temporal-preparation-report.md`: lead with the decision in one paragraph;
   answer every ranked question, alternatives, sources, exact fixtures, risks,
   and stable recommendation IDs classified Build/Explore/Defer/Avoid.
2. `implementation-plan.md`: ordered, independently shippable milestones with
   files, tests and exact expected values, docs, runnable examples, and risks.

One ZIP containing both is welcome but optional. Do not make hashes, receipts,
or Library uploads a condition of delivery. If attachments fail, provide full
content inline. Codex will read everything, check decisive claims against current
code, give local dispositions, and write the repository plan and review PR.

End with access status, files read, what you checked versus proposed, deliverable
links, and open questions. Do not commit, push, merge, deploy, or provision anything.
