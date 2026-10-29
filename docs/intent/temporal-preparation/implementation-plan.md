# Prepare dates, instants, and month labels

Build explicit temporal interpretation that survives linked analysis, queries, notebooks, and refresh.
Keep raw values. Store canonical strings and carry their meaning beside them.
Ship UTC preparation first, authored zones second, and month labels third.

This is a proposal, not implemented behavior. Byron is the demand.
No open research PR is a prerequisite.
See the [review and dispositions](../../research/temporal-preparation-2026-10-26/README.md).

## Contract

| Meaning         | Canonical value                | Input                                              | Delivery |
| --------------- | ------------------------------ | -------------------------------------------------- | -------- |
| Civil date      | `YYYY-MM-DD`                   | Complete ISO date or explicit MDY/DMY              | M1       |
| Instant         | UTC `YYYY-MM-DDTHH:mm:ss.sssZ` | Offset text or declared epoch seconds/milliseconds | M1       |
| Local wall time | Resolves to an instant         | Clock text, source zone, explicit ambiguity policy | M2       |
| Month label     | `YYYY-MM`                      | Strict year-month text                             | M3       |

Keep `datum` and saved rows primitive. Keep coarse `datetime` dispatch where useful.
Add authoritative temporal meaning to field metadata; formatting must never determine meaning.
Separate the raw-input recipe from the descriptor of an already prepared output.
Use existing `AnalysisField.origin` and calculation names to locate the editing owner.
Add only the reference information missing at a real reader boundary; no owner registry.

Existing fields retain their current behavior until the author applies an explicit interpretation.
This preserves current fields in one deployed version. Do not add parallel version engines or fallback parsing.
Use the current saved envelope and validate the new union variants explicitly.
Do not add a separate recipe-version scheme without a concrete incompatible change.

Use ISO/Gregorian years 0001–9999 and exact integral milliseconds.
Instant limits are `-62135596800000` through `253402300799999` ms.
Private calendar arithmetic may use years 0000/10000 for edge-period boundaries.
Those boundaries are not accepted row values or authored bounds.

Accept strict offset text with an explicit `Z` or `±HH:MM` suffix.
Validate calendar components, clock 00–23 hours, and offset components independently.
Reject leap seconds, impossible dates, and nonzero submillisecond precision.
Extra zero fraction digits are valid. Offset-free text requires M2's authored source zone.
Civil input rejects timestamps, month-only text, numbers, and booleans.

Epoch input accepts finite numbers or signed decimal text, including scientific exponents.
Use exact coefficient/exponent arithmetic before multiplying by the declared unit.
Numeric inputs mean their shortest decimal spelling; lost upstream digits cannot be recovered.
Reject unsafe integer numbers, radix text, nonintegral milliseconds, and values outside the supported range.
Reject excessive magnitude before constructing large powers of ten.

Keep missing, invalid, and ambiguous statuses separate beside prepared columns.
Use existing null tokens. Failed values retain raw records and diagnostic reasons.
Do not serialize derived keys, caches, or status arrays as authored settings.

## M1 — Explicit preparation and complete UTC analysis

**Outcome:** prepare a civil date, offset instant, or epoch field; review failures; Apply once.
Use the result in Calendar, Line, Rows, queries, calculations, and traces.
Save/reopen it through JSON, dashboard/project text, folders, notebooks, and sheets.
Refresh the same source without losing the authored interpretation.

**Work, in order:**

1. Extend `lib/fieldSettings.ts`, `types/AnalysisProject.ts`, and saved calculation declarations.
   Add a small temporal union and private preparation/comparison helpers under `lib/temporal/`.
   Expose raw interpretation through `lib/valueParsing.ts`; no chart parses raw text independently.
2. Prepare project sources before `sourceFrame`, `lookupFrame`, and `expandedFrame` in `lib/analysis/evaluateProject.ts`.
   Establish source keys from raw identity fields first. Carry temporal descriptors through group keys and aliases.
   Prepare declared calculation outputs before dependents consume them.
   In `lib/calculations/CalculationState.ts`, normalize before the result cache and match `traceRow` to that result.
   Add descriptor-aware comparisons to `engine/Calculator.ts` and query `filterFrame`.
   Preserve numeric measure outputs as numeric; arbitrary date-shaped strings do not inherit temporal meaning.
3. Thread descriptors and statuses through `lib/project/analysisText.ts`, `lib/notebook/readNotebook.ts`,
   `compileNotebook.ts`, `ExplorEdaNotebook.tsx`, and `DataLayerProvider.tsx`.
   Query readers currently flatten `row.data`; a downstream provider must not apply an epoch recipe to canonical ISO output.
4. Extend `types/FilterTypes.ts`, `hooks/applyFilter.ts`, `ColumnFilter.tsx`, `dailyRollup.ts`,
   `datePresets.ts`, and Calendar/Line planners with one typed predicate contract.
   Civil ranges use inclusive From/Through labels compiled to half-open day ordinals.
   Instant ranges use inclusive From and exclusive Before in milliseconds.
   UTC calendar ranges project instants to day keys. Missing/invalid values match only explicit status predicates.
   Same-kind comparisons use typed keys; mixed temporal kinds require an explicit conversion.
5. Reuse `components/SummaryTable/components/FieldInspector.tsx` for drafts, full-source preview, and failure review.
   Show total/status counts, bounded raw/prepared examples, all failures, and affected criteria.
   Draft reset and Escape commit nothing. Build the complete next state before one store publication and callback.
   Clear affected exploratory field/dependent filters. Retain incompatible authored query/local filters with blocking diagnostics.
6. Extend `utils/saveDataUtils.ts`, `lib/dsl/settingKeys.ts`, compiler/exporter/project grammar,
   `lib/project/folder.ts`, and notebook shared-definition writeback.
   Validate typed predicates and recipes; export no omissions for supported constructs.
   Recompile a minimal shared-definition text edit before committing it. Preserve prose and other sheets.
   Use an explicit Apply event; the notebook's recent-input heuristic is not a semantic commit signal.
7. Add one explicit same-source refresh action to the provider and route temporal refresh through it.
   Preserve existing data-prop reset semantics and explicit new-source import behavior.
   Reuse the host's known source association; do not infer source identity from a new array or add a general `dataKey` scheme.
   Refresh rebuilds prepared values/statuses and reevaluates semantic predicates.
   Clear exact row selections when their current records cannot be proved, including host-echo and reopen paths.
   Project raw entity keys are available; generic workspace selections currently use content-based positional remapping.
   Do not promise generic durable-key behavior. JSON content equality collapses some special raw values.
8. Inventory all temporal consumers before exposing Apply: central parser callers, filters, date axes,
   Composition, heatmap, timeline, retention, funnel, sparklines, annotations, and export.
   Each gets tested support or an explicit kind restriction in this release.
   Preserve all-row axis extents, chart-local population definitions, series limits, and current trace gestures.
   Record annotations retain their current identity mechanism. Period annotations must not silently retarget a changed meaning.

Paths above are under `packages/explorEDA/src/` unless stated otherwise.
`ProjectSchemaPanel.tsx` and `ProjectQueryPanel.tsx` expose existing project edit callbacks.
Use those callbacks and the current folder write path for source/calculation owner edits.
Do not create a second source editor.

**Exact fixtures and checks:**

Civil input in order: `2024-02-28`, `2024-02-29`, `2024-03-01`, `2025-02-29`, `2024-02`,
`2024-02-29T23:30:00Z`, blank, null, numeric zero, true.
Valid IDs `[0,1,2]`; missing `[6,7]`; invalid `[3,4,5,8,9]`.
February 29 selects `[1]` in every host zone. MDY `01/02/2025` is January 2; DMY is February 1.
Check 2000/1900 leap rules and supported-range edge periods.

Use source `events`, raw entity key `eventId`, and these rows for all later milestones:

| ID/key | Raw timestamp               | Amount |
| ------ | --------------------------- | -----: |
| 0/A    | `2024-02-29T23:30:00Z`      |     10 |
| 1/B    | `2024-02-29T18:30:00-05:00` |     20 |
| 2/C    | `2024-03-01T00:30:00+01:00` |     30 |
| 3/D    | `2024-03-01T00:30:00Z`      |     40 |
| 4/E    | `2024-03-01T05:00:00Z`      |     50 |
| 5/F    | `2024-03-04T04:30:00Z`      |     60 |
| 6/G    | `2024-03-04T05:00:00Z`      |     70 |
| 7/H    | `bad`                       |     80 |
| 8/I    | blank                       |     90 |
| 9/J    | null                        |    100 |

Seven valid, two missing, one invalid. A/B/C share instant `1709249400000` ms and remain three records.
Equality selects `[0,1,2]`, sum 60. UTC February 29 selects the same set.
UTC March 1 selects `[3,4]`, sum 90; Monday week February 26 selects `[0,1,2,3,4]`, sum 150.
UTC March selects `[3,4,5,6]`, sum 220.
Exact range ending Before `2024-03-01T00:30:00Z` excludes D at that boundary.
Calendar click, manual filter, query, and trace must return identical IDs, not only identical totals.

Epoch `1709251200` seconds becomes `2024-03-01T00:00:00.000Z`.
The same milliseconds become `1970-01-20T18:47:31.200Z`.
`1.2300` seconds becomes 1230 ms; `1e-3` seconds becomes 1 ms; `-0.001` seconds becomes -1 ms.
Reject `1.2345` seconds and `1.5` milliseconds. Accept `.123000` timestamp fractions; reject `.1234`.
Prove an epoch source and prepared calculation reach dependent comparisons without double conversion.

Add focused pure engine and pipeline/provider tests; extend current parser, field inspector, query,
DSL, folder, notebook writeback, saved selection, and planner suites where behavior changes.
Assert one Apply/Undo/Redo, no draft callback, stable host echo, raw-value retention, and exact round trips.
Unkeyed changed/duplicate/special-value records must not silently retain positional selections.

**Docs/example:** add `/docs/temporal-preparation`; update Calendar, notebook, dashboard-text, and project-folder sections.
Add runnable `temporal-basics` plus a raw CSV/project/notebook folder example.
Register examples, coverage, docs catalogue, and live steps in the same milestone.

**Risk:** a consumer drops meaning or interprets prepared output again.
Do not expose Apply until the complete pipeline and supported consumer set pass.

## M2 — Authored zones and exact calendar membership

**Outcome:** resolve local clock text in an authored source zone; display and group it independently.
Use a private pinned `@js-temporal/polyfill` adapter under `lib/temporal/zones.ts`.
Check the current released API and package cost during implementation; M1 needs no new dependency.
Use one adapter consistently. Do not branch between native and polyfill engines.

Source zone changes interpretation; display zone changes labels; grouping/filter zone changes calendar membership.
Defaults are UTC. Civil dates have no zone. Reject invalid configuration before reading records.
Gaps are invalid. Folds are ambiguous by default, with explicit field-wide Earlier/Later policies.
Use rejected overflow and round-trip wall fields to distinguish gaps from folds.
Do not shift gaps, infer abbreviations, or inherit the browser zone.

Extend the M1 parser, owner definitions, editor, filters, period planners, trace, persistence, and writeback together.
Cache each instant's projected civil key. Grouping and filtering compare those keys.
Never assume a calendar date is one continuous UTC interval.
Show a civil predicate, zone, and exact records; show UTC segments only when verified.
Keep calendar layout coordinates separate from source observations and membership.
Clear an old chart bucket selection after grouping changes. Leave independent exact-instant filters intact.
Make incompatible period annotations unresolved. Display edits preserve all memberships and trace identities.

**Exact checks:** Indianapolis February 29 selects `[0,1,2,3]`, sum 100; March selects `[4,5,6]`, sum 180.
Monday week February 26 selects `[0,1,2,3,4,5]`, sum 210.
Changing display zone alone changes none of these results.
If D has an invalid amount, February 29 still has four records but three sum contributors, total 60.

New York wall `2024-03-10T02:30` has no candidate.
Wall `2024-11-03T01:30` has candidates `05:30Z` and `06:30Z`, one hour apart.
Indianapolis March 10 lasts 23 hours; November 3 lasts 25 hours.
Its March 4 week lasts 167 hours; October 28 week lasts 169 hours.
March and November last 743 and 721 hours.
Apia `2011-12-30` has no projected records; São Paulo `2015-10-18` starts after midnight.

Required reversal fixture, zone `America/St_Johns`:
IDs 70/71/72 at `2010-11-07T02:30Z`, `03:00Z`, `03:30Z` project to November 7/6/7.
November 7 selects `[70,72]`; November 6 selects `[71]`.
The first November 7 segment ends at `02:31Z`; a single midnight-to-midnight envelope is incorrect.
Test projection against the selected runtime rules. Record only observable rules provenance; unknown remains unknown.
Package pinning does not freeze the host's time-zone database.

Refresh the events source in order `D,A,G,H,B,E,C,F,I,J,K`.
Repair H to `2024-02-29T23:45Z`, amount 80; add K at `2024-03-01T04:00Z`, amount 110.
The saved Indianapolis February 29 predicate selects `[0,1,3,4,6,10]`, sum 290.
UTC February 29 selects `[1,3,4,6]`, sum 140.
Project keyed A remains A; unsupported workspace positional selection becomes unresolved, never D at old position zero.
Repeat save/reopen, callbacks, shared-sheet edits, and refresh checks with all three zones.

**Docs/example:** add source/display/grouping, repeated-time, and reproduction sections to temporal docs.
Update Calendar/notebook sections. Add registered `temporal-zones` and wall-time folder/notebook examples.
**Risk:** conflated zones or false interval membership. Require the reversal fixture and exact IDs before release.
Measure dependency bundle/preparation/interaction cost; add workers only for a measured bottleneck.

## M3 — Actual month labels

**Outcome:** prepare `YYYY-MM`, compare/filter/sort it, and analyze it at month/year grain.
Extend the same engine, owner metadata, UI, validation, query, persistence, and notebook paths.
Use month ordinals. A daily consumer must report incompatible grain, never invent February 1 observations.
Support quarter only where an existing consumer offers it; no new period algebra.

Rows: January/10, February/20, February/30, March/40, invalid `2024-13`, invalid `2024`, null.
Four valid, two invalid, one missing. February selects `[1,2]`, sum 50.
January Through February selects `[0,1,2]`, sum 60; first quarter sums 100.
Appending a February row amount 5 changes its live predicate sum to 55.
Full-date text remains invalid under the saved month recipe after refresh.
Save/reopen retains the original `YYYY-MM` text and its grain. No zone control applies.

**Docs/example:** add month-label and compatible-view sections; update Calendar's grain guidance.
Add registered `temporal-months`, its live steps, and monthly CSV/notebook example.
**Risk:** timestamp geometry leaks into public meaning. Test the absence of phantom daily marks.

## Verification and release

Each milestone includes keyboard authoring, Apply/cancel/failure review, mark selection, and Alt-Enter trace.
Check 1280/783/390px with real input, bounded panels, long names, nulls, empty results, and both themes.
Preserve focus return, visible filters, layout, and reachable primary actions.
Use current FieldInspector/Rows/trace patterns; no per-chart Inspect buttons or second permanent inspector.

During implementation, run targeted changed suites and library types.
Run demo example coverage/export-recompile and docs checks with each example change.
Add a named Playwright project for new browser suites: current config has explicit project matchers.
Run `pnpm check` once for the finished code change; add the package minor changeset.
Use `pnpm shot` for implementation PR evidence. No feature/browser acceptance is claimed by this plan.

## Preserved Pro result materials

[Original Pro reports and artifacts for #532](assets/pro-results/temporal-preparation-2026-10-26/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
