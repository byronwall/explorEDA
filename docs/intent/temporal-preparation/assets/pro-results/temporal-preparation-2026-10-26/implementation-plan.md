# Temporal preparation and calendar meaning: implementation plan

**Decision.** Ship three complete slices: first explicit civil dates, offset-bearing instants, and declared epoch seconds/milliseconds with UTC analysis; then independently authored source, display, and grouping zones with strict daylight-saving-time handling; then true year-month labels. Keep rows as canonical primitive strings with authoritative field metadata, preserve raw inputs, and share one preparation/comparison/period contract across queries, calculations, charts, filters, inspection, text, notebooks, save/reopen, and refresh. Do not ship a parser alone. Byron is the demand; no outside-demand gate or unbuilt research PR is a prerequisite.

**Baseline:** `9d64a021e35d312887b1bc848e307f42b6c3091f`, supplied as 40 complete files. **Mode:** Design; this document proposes implementation and acceptance tests. No repository changes or application tests were executed. The companion [temporal-preparation-report.md](temporal-preparation-report.md) contains the design argument, alternatives, primary sources, complete fixture discussion, and stable recommendation dispositions.

## 1. Delivery contract and recommendation map

| Milestone | Usable result and recommendations |
|---|---|
| M1 — Explicit temporal preparation in UTC | Authors prepare civil dates, exact instants, and numeric epochs; inspect failures; filter and group them consistently; save, reopen, edit notebook text, and refresh without losing meaning. TP-001–TP-010, TP-014, TP-015, TP-022. |
| M2 — Explicit zones and daylight-saving transitions | Authors interpret wall-time text in a named zone, display instants in another zone, and group by a chosen calendar zone without confusing these operations. TP-011, TP-012; extends TP-005–TP-010, TP-014, TP-022. |
| M3 — Actual month labels | Authors analyze `YYYY-MM` observations at monthly grain without fabricating an observation on the first day. TP-013; extends TP-002, TP-006–TP-010, TP-014, TP-022. |

M1 is deliberately broad enough to be useful on its own. M2 is the point at which a private, pinned Temporal polyfill adapter becomes justified; M1 adds no time library. M3 adds one precise grain rather than a general period algebra. TP-016 and TP-017 remain exploration work, not shipping gates: a portable prepared snapshot and measured performance refinements. TP-018 and TP-019 defer standalone wall-time values, duration fields, fiscal/custom calendars, and sub-millisecond storage. TP-020 and TP-021 reject guessing, browser-zone inference, temporal objects in public rows, row deduplication, and unrelated prerequisite work.

Keep React, TypeScript, pnpm, and the existing client/server/version model. Use the existing store, field editor, Rows surface, trace controls, source references, and notebook mechanisms. Introduce no scheduling service, remote timezone service, framework change, general metadata registry, or new selection platform.

## 2. Existing architecture that constrains implementation

These are observations from the supplied source, not proposed capabilities:

- `lib/valueParsing.ts` is the mandated raw-value parsing boundary. `parseDateText`, `timestampOf`, and `dateBound` currently implement the date interpretation contract. `CODING_STANDARDS.md` forbids independent `Date.parse`, `new Date(text)`, or `Number(value)` on raw row data.
- `lib/fieldSettings.ts` defines `FieldSettings`, `convertFieldValue`, `applyFieldSettings`, `buildConversionPreview`, and formatting. Datetime conversion currently stringifies raw values and produces an ISO timestamp. Preview distinguishes conversion failures from missing values, but prepared rows contain primitive values rather than status objects.
- `providers/DataLayerProvider.tsx` retains `rawData`, prepares `data`, and saves raw rows in `saveAnalysisToStructure`. Its `updateFieldSettings` rebuilds prepared rows and calculations on type/date-preset/null-token changes. It clears direct-field exploratory chart, workspace, and Rows filters, but not chart `localFilters` or filters on transitive calculated outputs.
- Provider calculation results returned by `getColumnData` bypass source-field preparation. `SavedCalculation` contains only name and expression. Project `calculateFrame` turns a returned `Date` into ISO text but attaches no temporal result metadata.
- `lib/analysis/evaluateProject.ts` projects raw source values in `sourceFrame`, `lookupFrame`, and `expandedFrame`. Its `filterFrame` performs primitive comparisons. `AnalysisField` preserves origin; source references and aggregate contributors already exist.
- `lib/project/analysisText.ts` and `lib/notebook/readNotebook.ts` extract only `evaluation.rows.map(row => row.data)`. They currently drop evaluation field metadata before compilation.
- `lib/dsl/export.ts` infers date kinds from rows, uses a field-setting vocabulary, and handles date filters, axis bounds, and annotations from that inference. Adding a nested setting does not automatically provide a faithful text representation.
- `lib/notebook/compileNotebook.ts` compiles definitions from the whole file. `ExplorEdaNotebook.tsx` uses one provider across sheets and keeps chart clicks/brushes local. `writeBackSettings` writes chart edits only; it does not persist shared field interpretation changes.
- A changed `data` prop without `savedData` currently invokes `setData` and resets the workspace. With saved data, the provider restores settings and calls imported `carryRowSelections`. That helper's implementation was not supplied. A same-source refresh needs an explicit preserve-state route.

The worker should inspect imported validation, parser, identity, trace, source-editor, and history modules before modifying their seams. Their names in the supplied code are evidence of integration points, not proof of their unprovided behavior. Section 11 lists these access limits.

## 3. Shared contract established in M1

### 3.1 Values, metadata, and preparation ownership

Retain the coarse `DataType` value `datetime` for existing field-picker compatibility, but make the new descriptor authoritative. An explicit field has exactly one temporal kind. Keep `datum` and saved row unions primitive. A civil date is canonical `YYYY-MM-DD`; an instant is canonical UTC `YYYY-MM-DDTHH:mm:ss.SSSZ`. M3 adds canonical `YYYY-MM`. Internal branded date ordinals, epoch-millisecond numbers, and month ordinals may be used as comparison keys; they never change the public raw-data contract.

The following names are proposed interfaces, to be reconciled with the owning modules during implementation:

```ts
type TemporalMeaning =
  | { kind: "civil-date"; calendar: "iso8601" }
  | { kind: "instant"; precision: "millisecond" }
  | { kind: "year-month"; calendar: "iso8601" }; // M3

type PreparationOwner =
  | { kind: "source"; sourceId?: string; fieldId: string }
  | { kind: "calculation"; calculationId: string };

type PreparedTemporalField = {
  temporal: TemporalMeaning;
  preparationOwner: PreparationOwner;
};

type TemporalStatus = "valid" | "missing" | "invalid" | "ambiguous";
```

Store input recipes separately from output meaning. A raw-input recipe declares kind, accepted input form, date order when applicable, and epoch unit when applicable. Keep `nullTokens` as the common field-preparation option alongside the recipe; do not add a second nested missing-token list. M2 adds source zone and fold policy. Metadata describing canonical query output must not accidentally carry a raw recipe downstream for a second conversion. An instant descriptor has no calendar; calendar belongs to civil projection and grouping.

Apply these ownership rules:

1. Raw standalone host columns use proposed `FieldSettings.temporalPreparation`.
2. Project raw source columns use proposed `FieldDefinition.temporalPreparation`, before query predicates or grouping run.
3. Standalone and project calculated outputs use proposed `SavedCalculation.outputPreparation` and `CalculateStep.outputPreparation`, immediately after expression evaluation and before dependent calculations or query stages.
4. Query output carries proposed `AnalysisField.temporal` and its preparation owner. Thread this metadata beside scalar rows through compilation, export, runtime providers, and notebook read/write APIs.
5. A prepared query output is already canonical. Its downstream field settings may change label, format, and display zone, but may not secretly replace the source's raw interpretation. Reject conflicting downstream recipes and route editing to the source/calculation owner.
6. Plain field aliases preserve the descriptor. Arbitrary calculated strings acquire no temporal meaning merely because they resemble dates. Numeric aggregate outputs do not inherit temporal meaning. Group-by fields retain it.

Prepare each field exactly once per owning stage. Source identity uses raw entity keys before preparation. A source's input unit cannot rename its records. For missing or duplicate entity keys, the existing position fallback remains revision-local.

### 3.2 Numeric and calendar limits

Adopt proleptic ISO/Gregorian years `0001`–`9999`, including source timestamp years and canonical UTC output bounds, and integer millisecond precision. Accepted instant epoch milliseconds are exactly `-62135596800000` through `253402300799999`. Internal exclusive-end sentinels may reach year `10000` (`253402300800000` for UTC) so the last supported day/month can have a correct half-open bound; that sentinel is not an accepted row value. Reject impossible dates, leap-second `:60`, non-finite numbers, booleans, and values outside the supported range. Do not round nonzero sub-millisecond precision silently. Offset text may include more than three fractional digits only when the extra digits are zero. Civil dates reject timestamps, bare year-months, and numeric epochs; selecting an instant interpretation is a separate choice.

An epoch recipe explicitly chooses seconds or milliseconds and accepts either a finite numeric value or signed base-10 decimal text, with an optional decimal point and scientific exponent. Parse coefficient and exponent exactly; private `BigInt` arithmetic is appropriate. Numeric inputs use JavaScript's shortest `String(number)` spelling through the same decimal conversion, and unsafe JavaScript integer inputs are rejected. The result must be an exact safe integer millisecond within the supported date range. A JavaScript numeric input represents the number actually supplied; digits already lost by its producer cannot be recovered. Trailing decimal zeroes do not make a value invalid. Reject hexadecimal, underscores, empty text, booleans, NaN, and infinity. No magnitude-based unit guessing, unit inference from a field name, permissive coercion, or browser-zone fallback.

Private period arithmetic also permits a boundary in year `0000`: civil `0001-01-01` belongs to a Sunday-start week beginning `0000-12-31`. A selected edge period intersects its predicate with the supported public value domain while retaining its actual week identity. Do not change week start or require the author to enter year `0000`. Private arithmetic may similarly extend into year `10000`; accepted rows and authored bounds remain `0001`–`9999`.

Offset-bearing text uses strict `YYYY-MM-DDTHH:mm[:ss[.fraction]]Z` or the same local timestamp followed by `±HH:MM`, and determines an instant from its explicit offset. Validate numeric offset hours 00–23 and minutes 00–59 independently; the clock hour remains 00–23. Offset-free timestamps are not accepted by the new M1 instant recipe. Civil input selects ISO, month-day-year, or day-month-year explicitly using the supported existing presets; do not select a format separately for each row. Legacy descriptor-free fields retain current behavior until an author explicitly migrates them. M2 supplies an explicit wall-time-to-instant recipe rather than changing M1's meaning.

### 3.3 Status sidecars and raw inspection

Retain canonical primitive values and build a preparation result/status sidecar keyed by field and current row identity. Missing and invalid values may both produce unavailable scalar output, but their status, raw value, reason, and owner remain distinct. A fold rejected by policy is `ambiguous`, not an ordinary invalid date. A nonexistent wall time is `invalid` with a gap-specific reason.

Rows, preview, and trace show raw input, prepared result, kind, input recipe, status, and the precise source reference. Preview counts cover all source rows before linked filtering; a bounded example list explicitly says how many rows it shows. Failed and ambiguous records remain reachable. Preserve ordinary record counts; equivalent instants are not duplicate records.

### 3.4 Filter semantics

Introduce a discriminated `temporal-range` filter. Author-facing calendar ranges use inclusive labels; exact-instant ranges use an exclusive end. All executable predicates compile to half-open `[start, endExclusive)` intervals in their own comparison domain.

| Authored basis | Saved intent and compiled behavior |
|---|---|
| `civil-date` | `from` and inclusive `through` civil labels, calendar `iso8601`; compile ordinal bounds through the next civil date. No zone. |
| `calendar-date` | `from` and inclusive `through` civil labels, explicit zone and calendar; project each instant to its civil-date ordinal in that zone and compare against half-open civil ordinal bounds. M1 supports UTC; M2 supports named zones. |
| `instant` | Canonical UTC `from` and exclusive `before`; compare integer milliseconds. Never infer end-of-day. |
| `year-month` | `from` and inclusive `through` month labels; compile month ordinals through the following month. M3 only. |

Optional endpoints remain open. Equality uses same-kind comparison keys. Comparing a civil date with an instant is a configuration error requiring an explicit conversion, not midnight coercion. Filters carry sufficient meaning to validate against the current descriptor. `temporal-status` separately selects missing, invalid, or ambiguous records; the existing generic missing matcher must not erase this distinction for explicitly prepared fields.

Calendar-date membership truth is the cached projected civil key, not a presumed single UTC interval between the first valid instants of adjacent dates. Some named zones have moved backward across midnight after a date began, temporarily returning to the preceding date. Grouping, manual filtering, click selection, and trace use the same projected key. A UTC interval may be displayed as an exact equivalent only when that equivalence is established for the period, or the trace may show exact disjoint segments. Otherwise show the civil period, zone, and exact contributor IDs without claiming a single UTC envelope is exact. This does not require a general segmentation engine.

Keep authored query predicates and chart `localFilters` as analysis definitions. Revalidate them after interpretation changes; run compatible predicates and block incompatible ones with diagnostics. Exploratory `chart.filters`, workspace filters, and Rows filters on the affected field and transitive calculated outputs are cleared by explicit interpretation Apply, with the impact shown in preview. Unrelated filters remain.

### 3.5 Periods, selection, annotations, and refresh

One period planner returns a label, semantic identity, inclusive civil-ordinal start/exclusive civil-ordinal end, exact contributor identities, and trace context. Day, week, month, and year grouping of civil dates uses civil calendar arithmetic. Instant grouping projects each instant to its civil date in an explicit zone, UTC in M1, then assigns that key to the period. Cache projections by prepared column revision, zone, and engine semantics. Calendar-boundary resolution remains useful for layout and truthful descriptive metadata, but is not the general instant-membership predicate. Week start is explicit and saved; fixtures below use Monday.

Bucket identity includes the field, kind, calendar, grouping zone where applicable, interval, week start, and period label. A selected bucket is a semantic predicate whose contributors can change on refresh. Do not persist runtime `__ID` arrays as durable record identity. Retain exact explicit record selections only through the existing supported stable-key mechanisms; clear unresolved positional selections when they cannot be reconciled safely.

Record annotations retain their raw record key and reproject after interpretation or grouping. Period annotations retain their original basis/zone signature. If the grouping meaning changes, they become unresolved until explicitly reattached; the same printed date must not silently retarget a different period. Display-only changes do not change trace or annotation identity.

Add proposed `refreshData` for a new array representing the same source: keep recipes, charts, authored criteria, layout, and supported keys; reprepare values and reevaluate membership. Keep `setData`/a changed explicit `dataKey` as the new-source reset path. Refresh and interpretation are separate events. A refresh never guesses a new input kind from newly arrived values.

## 4. M1 — Civil dates, exact instants, and explicit epochs in UTC

### 4.1 Author-visible outcome

An author opens a field's existing details/editor surface, chooses **Interpretation**, and selects **Civil date** or **Instant**. Instant input choices are offset timestamp, epoch seconds, and epoch milliseconds. Date-order choices remain explicit for accepted civil text. The preview shows valid/missing/invalid counts, exact raw/prepared pairs, and dependent filters affected by Apply. Apply changes every consumer together; Reset restores the committed recipe; Escape abandons the draft. Formatting remains a separate choice.

After Apply, a civil birthday stays February 29 regardless of viewer environment. Three offset spellings of one instant compare equally but remain three records. Epoch seconds do not masquerade as milliseconds. Calendar cells and time-series marks lead to the same source IDs as Rows filters. A saved notebook or folder project reopens with the same meaning, and refreshing its source does not erase preparation.

### 4.2 Files and concrete changes

All paths below are relative to `packages/explorEDA/src` unless another prefix is shown. **Current** identifies a supplied file; **inspect** identifies an imported/referenced seam whose body was not supplied; **new** is a proposal.

- **New `types/TemporalTypes.ts`:** discriminated recipes, canonical descriptors, status reasons, typed ranges, preparation owner, and contract version. Keep public row values primitive and avoid several competing date type unions.
- **Current `lib/valueParsing.ts`:** expose the authoritative raw temporal preparation entry point. Delegate implementation to private helpers; retain the legacy helpers for descriptor-free fields. No consumer parses raw temporal strings independently.
- **New `lib/temporal/prepare.ts`, `compare.ts`, `periods.ts`:** strict UTC preparation, same-kind comparison keys, and shared civil/UTC period boundaries. `prepare.ts` must not become a second public route that bypasses missing-value policy. Private arithmetic from parsed components may use `Date` safely; never pass raw text to it.
- **Current `lib/fieldSettings.ts`:** add recipe validation, normalization, preview/status counts, canonical output formatting, and field-owner resolution. Include temporal input fields in the interpretation-change signature. Store only authored settings, not caches or preview rows.
- **Current `providers/DataLayerProvider.tsx`:** add field metadata and status accessors, atomic preparation Apply, transitive invalidation, prepared calculation output handling, same-source `refreshData`, and explicit source replacement. Build a complete next crossfilter/calculation state before committing. Retain the callback fingerprint/echo optimization and raw-data saving.
- **Inspect `lib/calculations/CalculationState.ts`, the calculator/parser, and dependency APIs:** normalize explicitly declared results before dependents execute. Preserve temporal metadata for references. Do not merely format a calculated column after its dependents have already consumed a raw result.
- **Current `types/AnalysisProject.ts` and `types/SavedDataStructure.ts`:** add source and calculation recipes, output descriptor/owner, typed parameter contracts, and explicit raw/prepared input metadata at boundaries. Preserve raw scalar source references.
- **New `lib/temporal/sourcePreparation.ts`; current `lib/analysis/evaluateProject.ts`:** centralize source field projection for `sourceFrame`, `lookupFrame`, and `expandedFrame`. Prepare before query comparisons. `filterFrame` uses descriptor-aware comparison, `calculateFrame` applies declared output preparation, and aggregates preserve only meaningful metadata. Include semantic engine version/recipe changes in evaluation invalidation.
- **Current `types/FilterTypes.ts`, `hooks/applyFilter.ts`, and `components/charts/DataTable/components/ColumnFilter.tsx`:** support typed temporal ranges/status filters, clear endpoint labels, exact instant input, and date distributions. Compile predicates once per filter; resolve field columns before per-row loops.
- **Current `lib/dailyRollup.ts`, `lib/datePresets.ts`, `components/charts/Calendar/calendarPlan.ts`, and `components/charts/LineChart/timeSeriesPlan.ts`:** route explicitly prepared fields through the same period/comparison contract. Preserve existing reducers, bounds, count semantics, missing-period policy, and source tracing. Presets anchor to the latest valid source value in the declared basis, never the wall clock. Do not change the separate rolling-window mission.
- **Current `components/SummaryTable/utils/dataTypeDetection.ts`:** retain broad detection for legacy fields, but let explicit descriptors govern semantics. Do not infer epoch units or auto-upgrade a legacy date-looking field into a civil date.
- **Current `lib/project/analysisText.ts`, `lib/project/folder.ts`, `lib/notebook/readNotebook.ts`, `lib/notebook/compileNotebook.ts`, and `components/notebook/ExplorEdaNotebook.tsx`:** carry query field metadata alongside rows through compiler and renderer. Preserve authored versus inferred source definitions. One notebook's sheets use the same preparation owners.
- **Current `lib/dsl/schema.ts`, `lib/dsl/export.ts`; inspect `lib/dsl/compile.ts`, `settingKeys.ts`, and `project.ts`:** add one canonical text spelling for each recipe and filter basis, typed query parameters, and metadata-aware export. Reject ambiguous/unsupported settings rather than omit them while claiming a complete export. Export must use authoritative descriptors rather than re-detecting date kind from scalar strings.
- **Current `lib/notebook/writeBack.ts`:** add explicit shared-definition writeback for field/calculation interpretation, with recompile-and-compare validation like chart writeback. Keep unrelated comments, prose, spacing, aliases, and other sheets. Dispatch from an explicit Apply commit, not the recent-input heuristic.
- **Inspect validation, trace, axis, annotation, history, and field-editor modules:** thread descriptors where their current consumers need them. A date bound's meaning must survive axis/annotation text export. Record/period anchors follow section 3.5. The shared `FieldMetadata` component shows the temporal kind and interpretation origin.
- **New proposed UI component `components/fields/TemporalPreparationEditor.tsx`:** integrate it into the actual existing field-editor entry point found by source inspection. Do not create a second persistent inspector or a separate application workflow.

### 4.3 Implementation order inside the slice

Implement the shared types and strict engine together with a provider integration test; do not release that internal step. Next wire source/query/calculation output ownership and typed comparisons, then every filter/planner consumer. Complete text/notebook/save/refresh routes before exposing Apply. Finish the existing-field-editor UI, trace/status review, docs, and examples. The shipping criterion is the complete loop, including failure cases, not whether the helper has unit coverage.

Before enabling a new descriptor, complete a finite consumer inventory in the actual checkout. Search `timestampOf`, `parseDateText`, `dateBound`, `utcDay`, `utcPeriod`, date-scale declarations, and date-bound exports. The supplied `examples.ts` proves temporal surfaces beyond Calendar/Line: `message-log-heatmap` month bins, `room-bookings` intervals, `product-retention` weeks, `product-funnel` ordering, `consumer-confidence` Composition scales, and `tech-sparklines` first/last behavior. Inspect their owning implementations; do not assert undocumented internals. Each caller must use the shared typed keys and metadata for supported kinds or explicitly reject an unsupported kind before evaluation. It may not silently pass a civil date to legacy instant parsing. Record this finite disposition table in the implementation PR; it is part of M1, not an open-ended follow-up migration.

Calendar, Line, Rows, typed query/filter, and trace support both M1 kinds end to end. Other existing consumers keep their legacy behavior and receive either tested new-kind support or a clear capability guard in that same release. Re-run existing `calendar-series`, `area-charts`, `shop-operations`, and the examples named above to catch changes to descriptor-free behavior. Preserve the line planner's existing 2,000-period and 30-series limits, source-based axis extents, and chart-local population controls.

For legacy saves, absent metadata means legacy semantics. Opening an old notebook must not reclassify date-only strings or numeric fields. Choosing an explicit interpretation produces a migration preview comparing old and proposed values, period membership, and affected criteria. Apply writes the new descriptor; Cancel leaves the old save byte-equivalent apart from normal unrelated metadata handling. No broad historical-save rewrite is necessary.

### 4.4 Exact M1 fixtures and acceptance

#### A. Civil preparation

Use these row IDs in this order. They are current fixture positions, not durable saved identities.

| ID | Raw value | Expected result/status |
|---|---|---|
| 0 | `2024-02-28` | `2024-02-28`, valid |
| 1 | `2024-02-29` | `2024-02-29`, valid |
| 2 | `2024-03-01` | `2024-03-01`, valid |
| 3 | `2025-02-29` | Invalid calendar date |
| 4 | `2024-02` | Invalid: wrong grain |
| 5 | `2024-02-29T23:30:00Z` | Invalid for civil-date input |
| 6 | `" "` | Missing |
| 7 | `null` | Missing |
| 8 | numeric `0` | Invalid for civil-date input |
| 9 | boolean `true` | Invalid for civil-date input |

Expected totals: valid `3`, invalid `5`, missing `2`, ambiguous `0`. Civil range February 28 **through** February 29 selects `[0,1]`; its exclusive end is March 1. February month grouping selects `[0,1]`; March selects `[2]`. Repeat with different process/browser zones and require identical results. A `year-month` interpretation is unavailable until M3; M1 must never rescue row 4 as February 1.

#### B. Equivalent instants, period membership, and source records

Use source `events`, entity key `eventId`, with amount and timestamp columns:

| ID / key | Raw instant | Amount |
|---|---|---:|
| 0 / A | `2024-02-29T23:30:00.000Z` | 10 |
| 1 / B | `2024-02-29T18:30:00-05:00` | 20 |
| 2 / C | `2024-03-01T00:30:00+01:00` | 30 |
| 3 / D | `2024-03-01T00:30:00Z` | 40 |
| 4 / E | `2024-03-01T05:00:00Z` | 50 |
| 5 / F | `2024-03-04T04:30:00Z` | 60 |
| 6 / G | `2024-03-04T05:00:00Z` | 70 |
| 7 / H | `bad` | 80 |
| 8 / I | `" "` | 90 |
| 9 / J | `null` | 100 |

A, B, and C canonicalize to `2024-02-29T23:30:00.000Z`, epoch milliseconds `1709249400000`. They remain three records. Exact equality selects `[0,1,2]`, sum `60`, with keys `events:string:A`, `events:string:B`, and `events:string:C`. Valid count is `7`, invalid `1`, missing `2`.

Required UTC memberships:

| Period | Contributor IDs; count; sum |
|---|---|
| Day February 29 | `[0,1,2]`; `3`; `60` |
| Day March 1 | `[3,4]`; `2`; `90` |
| Day March 4 | `[5,6]`; `2`; `130` |
| Monday week February 26–March 4 exclusive | `[0,1,2,3,4]`; `5`; `150` |
| Monday week March 4–March 11 exclusive | `[5,6]`; `2`; `130` |
| February | `[0,1,2]`; `3`; `60` |
| March | `[3,4,5,6]`; `4`; `220` |

UTC February 29 is `[2024-02-29T00:00:00.000Z, 2024-03-01T00:00:00.000Z)`, milliseconds `[1709164800000,1709251200000)`. Instant range `from=2024-02-29T23:30:00.000Z` and `before=2024-03-01T00:30:00.000Z` selects `[0,1,2]`; D is exactly excluded. Calendar-date UTC range February 29 **through** March 1 selects `[0,1,2,3,4]`, sum `150`. Invalid status selects `[7]`; missing status selects `[8,9]`.

Calendar cell selection, time-series period selection, manual typed range, query predicate, and trace inspection must agree on these records. Compare identity sets and measure inputs, not only sums: wrong membership can coincidentally produce the same total.

#### C. Explicit epochs and precision

| Input and declared unit | Expected canonical result |
|---|---|
| `1709251200`, seconds | `2024-03-01T00:00:00.000Z` |
| `1709251200`, milliseconds | `1970-01-20T18:47:31.200Z` |
| `1709251200000`, milliseconds | `2024-03-01T00:00:00.000Z` |
| `"1709251200.001"`, seconds | `2024-03-01T00:00:00.001Z` |
| `"-0.001"`, seconds | `1969-12-31T23:59:59.999Z` |
| `"1.2300"`, seconds | `1970-01-01T00:00:01.230Z` |
| `"1.7092512e9"`, seconds | `2024-03-01T00:00:00.000Z` |
| `"1.2345"`, seconds | Invalid: nonzero sub-millisecond precision |
| `"1.5"`, milliseconds | Invalid: non-integer millisecond |
| `0`, either unit | `1970-01-01T00:00:00.000Z` |

Test finite numeric counterparts as well as strings; reject infinities, NaN, booleans, and out-of-range results. The two different readings of `1709251200` must appear in the preview before a unit change is applied. Neither result is an automatic guess.

#### D. Pipeline, persistence, and refresh

Add focused new integration tests, proposed as `lib/temporal/temporalPipeline.test.ts` and `test/providers/temporalPreparationProvider.test.tsx`, plus the supplied helper/provider tests:

- A project source epoch-seconds field normalizes before `filterFrame`; source, lookup, and expansion paths give the same canonical meaning. Its output is not converted again by the provider.
- A declared calculation output of epoch seconds becomes a prepared instant before a dependent calculation reads it. An undeclared string calculation remains untyped. A plain reference/alias preserves the descriptor.
- Save analysis contains the exact raw spellings in fixture B. JSON reopen reproduces canonical values, status categories, recipes, and memberships.
- Dashboard export/compile and notebook export/writeback preserve recipes and filter basis. `omitted` is empty for supported temporal constructs. Compiler and renderer receive the same metadata.
- One Apply produces one `onStateChange` and one history step. Draft typing, Reset, and Escape produce none. A matching host echo causes no full reprepare.
- Reinterpretation clears exploratory filters on the field and dependent calculated outputs; unrelated filters survive. Authored incompatible query/local predicates are diagnosed and blocked rather than silently removed.
- A same-source refresh preserves settings in controlled and uncontrolled hosts. Repair H to `2024-02-29T23:45:00Z` and reorder rows as section 5.4 describes: UTC February 29 becomes IDs `[1,3,4,6]`, sum `140`. Old source keys remain stable despite changed positions.
- Duplicate/missing entity-key fixtures retain diagnostics; positional selections are cleared if reconciliation is unavailable. Never assert a guarantee based solely on the name `carryRowSelections`.

### 4.5 Documentation, runnable examples, and browser acceptance

Update or create these documentation surfaces in the same change:

- **New** `apps/demo/src/docs/pages/temporal-preparation.mdx`: “Interpretation and preview”, “Civil dates and exact instants”, “Explicit epoch units”, “Missing and invalid records”, and “Save and refresh”.
- **Current** `apps/demo/src/docs/pages/calendar.mdx`: explicit UTC/calendar membership, contributor inspection, inclusive calendar range labels, and exclusive instant bounds.
- **Current** `apps/demo/src/docs/pages/notebooks.mdx`: shared temporal definitions, source/calculation ownership, explicit Apply writeback, and sheet-wide meaning.
- Inspect/update the existing dashboard-text and project-folder documentation pages and their catalogue/coverage declarations. State proposed syntax as new syntax until the compiler supports it.

Add proposed example `temporal-basics` to current `apps/demo/src/demos/examples.ts`, with rows from fixtures A–C and linked Calendar, Line, and Rows views. Register its coverage and docs live steps. Add a proposed folder example `apps/demo/public/examples/temporal-preparation/` containing `exploreda.eda`, raw `events.csv`, and `temporal.eda.md`; wire the actual CLI example registry after inspecting it. Do not claim the existing CLI already recognizes a new name. After implementation, both `/examples/temporal-basics` and the documented folder-opening command must run.

At **1280 px**, keep the chart visible beside the compact nonmodal field editor; show comparison preview and reachable Apply/Reset. At **783 px**, preserve active filter state and ensure the popover stays inside the viewport without covering the edited field name. At **390 px**, use the existing narrow sheet/panel behavior, bounded internal scrolling, and reachable primary actions; do not force a wide raw/prepared table across the page. Long raw strings may scroll within their cell/detail surface.

Keyboard acceptance: open the field editor, select kind/input unit, reach failure rows, Apply, reopen, Reset, and Escape without pointer input; return focus to the trigger. Mark Enter selects and Alt-Enter traces. The manual filter control creates the same predicate as a mark. Active filters remain visible. No new native `title` tooltips or chart-level Inspect buttons. Check light/dark border tokens and a long field name, empty results, null values, and a filtered preview. Screenshot evidence belongs to the later implementation PR, not this research delivery.

Follow the supplied UI defaults: 32 px general controls and 28 px panel controls, the 100 px setting-label column, single-row scrollable tabs, bounded nonmodal local editors, accessible action names, and existing focus/border tokens. At 783 px, retain the saved layout's view-only flow; at 390 px retain its single-column behavior. Temporary interpretation UI must not rewrite chart placement.

**Main risk:** a consumer or persistence adapter continues inferring semantics from primitive strings. Mitigation is one metadata-aware preparation accessor and integration assertions across queries, charts, filters, text, and notebooks before exposing the feature. The M1 completion gate is that entire path.

## 5. M2 — Independent source, display, and grouping zones

### 5.1 Author-visible outcome and dependency boundary

Add a wall-time-to-instant input recipe with an explicit IANA zone. Keep the output kind `instant`; do not add a standalone wall-time runtime field. Add an independent field display zone and an independent chart/filter grouping zone. Defaults for existing/new instant analyses remain explicit UTC. Selecting a display zone changes labels only. Selecting a grouping zone changes calendar membership. Selecting a source zone changes how offset-free raw clock text becomes an instant and therefore requires interpretation preview/Apply.

Use a pinned `@js-temporal/polyfill` behind new private `lib/temporal/zones.ts`. Pin the implementation in the package lock and isolate construction/disambiguation calls; no Temporal instances enter public rows or JSON. The [Temporal ambiguity documentation](https://tc39.es/proposal-temporal/docs/timezone.html) distinguishes nonexistent/repeated wall times, and the [polyfill repository](https://github.com/js-temporal/temporal-polyfill) documents its implementation. Follow the explicit policy below instead of accepting a library's default disambiguation.

Gap policy is **reject**. Fold policy defaults to **reject** and may be explicitly **earlier** or **later**. Preview both candidate instants for a rejected fold, and record the chosen policy when applied. Validate the selected zone as configuration before reading rows: an invalid IANA zone blocks Apply and does not mark every record invalid. Gate the accepted input grammar before passing parsed components to Temporal, and explicitly use overflow rejection rather than a library's constraining defaults. Do not offer a hidden automatic gap shift. Numeric offsets are accepted by the existing offset-text recipe; a named zone is a separate input contract. Avoid abbreviation inference such as `EST` and avoid browser/system default zones.

### 5.2 Files and integration changes

- **New** `lib/temporal/zones.ts`: explicit zone validation, wall-time candidate resolution, cached instant-to-civil projection, and private descriptive calendar-boundary resolution. Call it through the shared temporal engine. Projected keys drive membership; boundary instants do not replace that predicate.
- **Inspect** `packages/explorEDA/package.json` and the root lockfile, neither supplied as library dependency evidence: add and pin the polyfill. M1 must continue operating through the same public adapter interfaces.
- **Current** `lib/valueParsing.ts` and new `prepare.ts`: accept the new explicit wall-time recipe, preserve raw input and fold/gap status, and maintain millisecond precision.
- **Current** `lib/fieldSettings.ts` and proposed editor: independently expose Source zone, Display zone, and fold choice only where meaningful. Civil dates have no display/grouping zone control.
- **New** `periods.ts` plus current `dailyRollup.ts`, `datePresets.ts`, Calendar/Line planners and column filters: project instants to civil-date ordinals in the selected grouping zone, cache those keys, and use the same keys for grouping, filters, selected marks, and contributor traces. Advance calendar labels rather than adding `86_400_000` milliseconds. Compile calendar-date endpoints to civil ordinal bounds, not a presumed single UTC interval. Keep exact-instant filters in epoch milliseconds.
- Extend chart settings and validation at the inspected owning types/validators. A grouping zone is semantic settings, never a display-only key. Keep the same source-record tracing path.
- Extend source definitions, formula output declarations, query metadata, JSON/text grammar, folder snapshot metadata handling, notebook shared writeback, and all sheet consumers. One saved source-zone policy must govern the owning field everywhere.
- Extend trace and annotation contexts with explicit grouping basis/zone. Keep record anchors stable; make period anchors unresolved when their stored signature no longer matches.

### 5.3 Exact zone and daylight-saving fixtures

Add focused proposed `lib/temporal/zones.test.ts` and `lib/temporal/periods.test.ts` suites, extend the M1 pipeline/provider integration tests, and update the owning Calendar/Line/filter/trace and notebook-writeback suites. These test locations are new proposals where marked; inspect existing owners rather than invent current test files. The pure suites prove candidate/projection arithmetic, while integration tests prove the exact selected IDs, persistence, and one-commit behavior below.

Use `America/Indiana/Indianapolis` throughout. Source offset timestamps from fixture B already specify their instants and are **not** reinterpreted by this zone. They are only grouped/displayed in it.

| Indianapolis period | Expected contributor IDs; count; sum |
|---|---|
| Day February 29 | `[0,1,2,3]`; `4`; `100` |
| Day March 1 | `[4]`; `1`; `50` |
| Day March 3 | `[5]`; `1`; `60` |
| Day March 4 | `[6]`; `1`; `70` |
| Monday week February 26–March 4 exclusive | `[0,1,2,3,4,5]`; `6`; `210` |
| Monday week March 4–March 11 exclusive | `[6]`; `1`; `70` |
| February | `[0,1,2,3]`; `4`; `100` |
| March | `[4,5,6]`; `3`; `180` |

Indianapolis February 29 projects exactly to the single UTC interval `[2024-02-29T05:00:00.000Z,2024-03-01T05:00:00.000Z)` under the checked rules for this fixture. D is included; E is exactly the excluded upper boundary. The implemented calendar-date predicate still compares projected civil keys. Selecting February 29 **through** February 29 yields the same `[0,1,2,3]`. Changing only Display zone to UTC leaves that membership and sum unchanged.

Wall-time preparation fixtures:

| Raw local timestamp and policy | Exact expected outcome |
|---|---|
| `2024-03-10T02:30:00`, reject | `invalid`, gap; no instant exists. |
| `2024-03-10T03:30:00`, reject | `2024-03-10T07:30:00.000Z`; `1710055800000`. |
| `2024-11-03T01:30:00`, reject | `ambiguous`; candidates `2024-11-03T05:30:00.000Z` and `2024-11-03T06:30:00.000Z`. |
| Same fold, earlier | `2024-11-03T05:30:00.000Z`; `1730611800000`. |
| Same fold, later | `2024-11-03T06:30:00.000Z`; `1730615400000`. |

The two fold candidates differ by exactly `3_600_000` milliseconds. An offset-bearing `2024-11-03T01:30:00-04:00` or `-05:00` is unambiguous under the offset recipe. Keep both records if the dataset includes both; do not coalesce equal printed clock labels.

Calendar boundary fixtures with verified single-interval equivalence under the checked Indianapolis rules:

| Period | Exact UTC interval; elapsed duration |
|---|---|
| March 10 day | `[2024-03-10T05:00Z,2024-03-11T04:00Z)`; `23` hours |
| November 3 day | `[2024-11-03T04:00Z,2024-11-04T05:00Z)`; `25` hours |
| March 4 Monday week | `[2024-03-04T05:00Z,2024-03-11T04:00Z)`; `167` hours |
| October 28 Monday week | `[2024-10-28T04:00Z,2024-11-04T05:00Z)`; `169` hours |
| March month | `[2024-03-01T05:00Z,2024-04-01T04:00Z)`; `743` hours |
| November month | `[2024-11-01T04:00Z,2024-12-01T05:00Z)`; `721` hours |

Assert both descriptive boundaries and projected-key record membership. A “day” is a calendar label with calendar membership; where its instant membership is one interval, elapsed duration is the exact boundary difference. The feature does not imply a new reusable duration-field system or assume that every date in every zone is one instant interval.

Add two non-US boundary cases so the implementation does not equate “start of day” with an always-valid midnight. Under the checked timezone rules, no instant projects to `Pacific/Apia` civil date `2011-12-30`: the whole date was skipped. A descriptive empty boundary pair is `[2011-12-30T10:00Z,2011-12-30T10:00Z)`, but absence of projected keys is the membership truth. `America/Sao_Paulo` day `2015-10-18` has verified instant membership `[2015-10-18T03:00Z,2015-10-19T02:00Z)`, lasting `23` hours, because its first valid wall time is after midnight. Calendar-boundary resolution may find that first valid instant for layout/description; a source row claiming a nonexistent midnight still receives an invalid-gap diagnostic. Check these cases against the implementation's actual timezone data and record that provenance.

#### Required midnight-reversal counterexample — report fixture F5

Use `America/St_Johns` with the following independent row IDs:

| ID | Exact instant | Expected local value and civil membership |
|---|---|---|
| 70 | `2010-11-07T02:30:00.000Z` | `2010-11-07T00:00:00-02:30`; November 7 |
| 71 | `2010-11-07T03:00:00.000Z` | `2010-11-06T23:30:00-03:30`; November 6 |
| 72 | `2010-11-07T03:30:00.000Z` | `2010-11-07T00:00:00-03:30`; November 7 |

November 7 grouping, calendar-date filtering, selected-mark filtering, and trace must return exactly `[70,72]`; November 6 must return `[71]`. November 7's instant set is the disjoint union `[2010-11-07T02:30Z,2010-11-07T02:31Z)` and `[2010-11-07T03:30Z,2010-11-08T03:30Z)`. The single envelope from the first November 7 midnight to the next day's start would incorrectly include row 71. The ordinary Indianapolis fixtures do not expose this defect, so this counterexample is a required M2 acceptance test.

The research independently checked this fixture with Python `zoneinfo` and timezone data `2025b`; no application implementation was tested. The [Temporal ZonedDateTime documentation](https://tc39.es/proposal-temporal/docs/zoneddatetime.html), including its `startOfDay` discussion, documents repeated starts in this zone/date. A trace can show the verified two segments or simply the civil period, zone, and exact contributors; it must not label the encompassing UTC range as exact membership. There is no requirement to build a general interval-segmentation engine.

A valid instant near the supported year boundary can project outside civil years `0001`–`9999` in a named zone. Preserve the instant and its record. Return an explicit `calendar-projection-out-of-range` diagnostic for the affected grouping/display operation, disable that projection, and keep the record available through raw/UTC inspection. Never clamp it into a different day or silently omit it as if its source timestamp were invalid.

### 5.4 Refresh, selection, and provenance tests

Create revision r2 in this exact order: `D,A,G,H,B,E,C,F,I,J,K`. Repair H to `2024-02-29T23:45:00Z`, amount `80`. Add K at `2024-03-01T04:00:00Z`, amount `110`. Other values remain as in r1.

The retained Indianapolis February 29 predicate now selects positions `[0,1,3,4,6,10]`, event keys `[D,A,H,B,C,K]` in current row order, count `6`, sum `290`. Its stable contributor key set is exactly `events:string:A/B/C/D/H/K`. An explicit keyed selection of A remains only A, now position `1`; it must not become D at old position `0`. A cached old source-ID list is incorrect.

Further acceptance:

- Changing Source zone on a wall-time field prepares new instants and invalidates dependent exploratory predicates as M1 specifies.
- Changing Grouping zone clears the chart's old bucket selection and reprojects record annotations. A period annotation retaining the old zone signature becomes unresolved until reattached.
- An independent exact-instant workspace filter retains its canonical interval through display/grouping edits.
- Changing Display zone preserves prepared scalar values, source IDs, memberships, filter predicates, trace identity, and history semantics other than the single display edit.
- Invalid zone configuration blocks Apply before mutation. A newly refreshed gap/fold record updates status counts without changing the recipe or silently selecting a policy.
- Save/reopen preserves all three zones separately and the explicit fold policy. Notebook shared-definition writeback updates all sheets consistently.

Record the tested engine/package, runtime/ICU information where actually available, and timezone-data provenance. A package version is not a timezone-database version. Host `Intl` data can differ across environments; never claim a pinned polyfill alone freezes tzdb. Test with known historical fixtures, compare supported runtimes, and clearly document any runtime-dependent future/historical rule differences. TP-016's portable prepared snapshot remains optional exploration rather than an invented reproducibility guarantee. The [IANA timezone theory document](https://data.iana.org/time-zones/tzdb/theory.html) explains why timezone rules and historical coverage are distinct from numerical precision.

### 5.5 Docs, examples, browser acceptance, and risk

Extend `temporal-preparation.mdx` with “Source, display, and grouping zones”, “Repeated and missing clock times”, and “What save/reopen reproduces”. Update Calendar and notebook docs with explicit zone labels, daylight-saving boundaries, and period annotation behavior. Add proposed demo `/examples/temporal-zones`, reuse fixture B, and include UTC/Indianapolis grouped views plus an explicit wall-time review table. Add `zones.eda.md` and `wall-times.csv` to the proposed folder example. Register docs live steps and coverage.

At **1280 px**, show the source-zone/fold preview beside the relevant records and distinguish the three controls by meaning. At **783 px**, keep zone search/results bounded and avoid dropdowns leaving the viewport. At **390 px**, fold candidates stack legibly with full offsets/UTC instants and both primary actions reachable. Keyboard users can search a zone, choose a fold policy, review candidates, Apply, and reopen; focus returns correctly. A screen-reader status announcement reports changed ambiguity counts without reading the entire table. Local clock labels at a fold must visibly distinguish offsets when both are shown.

**Main risk:** treating zone configuration as formatting, assuming fixed elapsed days, or replacing projected civil membership with a single UTC envelope. Mitigation is independent settings/invalidations, cached projected keys shared by every consumer, the required St. John's reversal fixture, exact contributor comparison, and a private adapter that makes source-row disambiguation explicit. Dependency performance and bundle cost should be measured on the actual package before polishing; no fabricated size benchmark is a gate.

## 6. M3 — Year-month labels with actual monthly grain

### 6.1 Author-visible outcome

Add **Month label** with strict `YYYY-MM` input and canonical `year-month` meaning. An author can filter, compare, sort, group, trace, calculate explicit month outputs, save, and refresh monthly observations. The field does not mean an event at its first midnight. Its stored value remains `2024-02`, not `2024-02-01` or an instant.

Use integer month ordinals internally. Inclusive month ranges compile to the following month exclusively. A month label can group to month, quarter, and year under the ISO calendar where the existing consumer supports those choices. It cannot group to day/week or populate a day-cell Calendar as an event. Offer a monthly time-series or suitable categorical view. A chart may position a monthly mark using an internal coordinate, but its metadata/trace must retain month grain and its visual extent must not imply a first-day measurement.

Civil-date extraction from a month label requires an explicit later operation and is deferred unless independently designed. A monthly value is not automatically broadcast over all its days. There is no default conversion between a month label and an instant; a source/display/grouping zone has no meaning for the label itself.

### 6.2 Files, calculations, and persistence

- Extend proposed `types/TemporalTypes.ts`, `prepare.ts`, `compare.ts`, and `periods.ts` with strict month validation, ordinal comparison, and month/quarter/year calendar boundaries.
- Extend current `fieldSettings.ts`, field editor, type metadata rendering, `FilterTypes.ts`, `applyFilter.ts`, and `ColumnFilter.tsx` with month-grain controls and `year-month` ranges.
- Extend source/calculation owner declarations and metadata propagation. Explicit month-producing calculations normalize before dependents. Aliases and group-by fields preserve grain.
- Extend Calendar and Line planning with capability checks: a day-only consumer must report incompatible grain and offer an appropriate chart, not invent a first day. Keep date-axis limits typed and exportable.
- Extend validation, dashboard/project text grammar, export, folder source declarations, notebook shared writeback, status review, refresh, and annotations in the same release. No month-only UI that disappears on reopen.
- Retain the legacy descriptor-free `YYYY-MM` behavior until explicit migration. The migration preview must show the difference between the old first-day interpretation and the new month label.

### 6.3 Exact fixtures

Extend proposed `lib/temporal/prepare.test.ts`, `compare.test.ts`, and `periods.test.ts` with month-grain assertions, plus `temporalPipeline.test.ts` and `temporalPreparationProvider.test.tsx` for source/calculation ownership and save/refresh. Add an owning chart capability test proving a month field cannot emit daily Calendar marks. Reuse the fixture across the DSL/notebook round-trip and demo coverage tests.

| ID | Raw month; amount | Result |
|---|---|---|
| 0 | `2024-01`; 10 | Valid January label |
| 1 | `2024-02`; 20 | Valid February label |
| 2 | `2024-02`; 30 | Valid February label |
| 3 | `2024-03`; 40 | Valid March label |
| 4 | `2024-13`; 50 | Invalid month |
| 5 | `2024`; 60 | Invalid grain |
| 6 | `null`; 70 | Missing |

Expected totals are valid `4`, invalid `2`, missing `1`, ambiguous `0`. February equality/grouping selects `[1,2]`, count `2`, sum `50`. January **through** February selects `[0,1,2]`, sum `60`, exclusive end month `2024-03`. First quarter selects `[0,1,2,3]`, sum `100`, with month boundaries `[2024-01,2024-04)`. Sorting is January, February, February, March; equal month labels do not merge source records.

Verify February 2024 is a month covering 29 civil dates if its calendar extent is inspected, but has no observed event date and no timezone-specific instant extent. A day filter on this field is incompatible. The daily Calendar must not show `[1,2]` on February 1. A monthly trace shows the original strings and contributor IDs. A display-zone edit is unavailable/no-op for this kind and must not change its metadata.

Refresh by appending another February row amount `5`: February's semantic predicate includes the new source key and sums `55`. An explicit keyed selection of the original first February row remains that record. A schema refresh that supplies full dates into this month field reports invalid inputs rather than expanding the accepted grammar silently. Save/JSON/text/folder/notebook/sheets roundtrips retain `YYYY-MM` exactly.

### 6.4 Documentation, example, browser acceptance, and risk

Add “Month labels versus event dates” and “Compatible grouping and filters” to temporal preparation docs. Update Calendar documentation to explain the grain check and the monthly chart route. Add proposed `/examples/temporal-months`, using the exact fixture above, a monthly line/bar summary, Rows inspection, and an intentionally incompatible day-view configuration that surfaces a useful configuration message. Add `months.eda.md` and `monthly.csv` to the folder example. Update the live docs steps and text-export coverage.

At **1280 px**, the monthly trace shows the label and its contributors without a midnight timestamp. At **783 px**, keep filter endpoints side by side where possible and maintain visible grain labels. At **390 px**, month controls and invalid-record lists fit within the existing panel, with no horizontal page overflow. Keyboard users can enter January through February, select a February mark, Alt-Enter its trace, change sheets, and restore the notebook. Test the rejected day-view configuration and the explicit legacy migration flow at all three widths.

**Main risk:** consumers continue using timestamp-shaped geometry or generic date controls and imply a first-day observation. Mitigation is authoritative grain metadata, explicit consumer capability checks, and tests asserting the absence of phantom daily marks as well as correct monthly sums.

## 7. Cross-cutting integration gates

Each milestone includes the same end-to-end responsibilities for its newly supported semantics:

- **Preparation parity:** preview, Apply, query source projection, and formula output preparation use one implementation and agree on valid/missing/invalid/ambiguous statuses.
- **Consumer parity:** Rows, Calendar, Line, manual filters, authored query predicates, grouped-mark selection, and trace agree on exact records. Typed comparisons do not fall back to lexical offset-string comparison.
- **Persistence parity:** JSON settings/raw analysis, dashboard text, project text, folder load/reload, notebook shared-definition writeback, and all sheets retain the same owner and meaning. Supported export reports no omissions.
- **Interaction parity:** mouse selection and manual keyboard filter authoring create the same predicate. Alt-click/Alt-Enter inspects without selecting. Primary actions remain reachable at 1280/783/390 px.
- **Refresh parity:** recipes persist, new rows re-evaluate, exact contributor sets update, and durable keys remain records rather than positions. Source replacement is a separate action.
- **History parity:** interpretation Apply commits once; display/grouping edits commit once each; draft/cancel emits nothing. Undo/redo restores recipes and predicates atomically. A matching host echo avoids a rebuild.
- **Annotation parity:** record anchors reproject; incompatible period anchors become unresolved. No printed date silently binds to a different zone's interval.
- **Legacy parity:** descriptor-free fields retain their previous meaning. Existing numeric/date presets and chart settings are not blanket-rewritten.

The date-axis work already present in the supplied time-series planner should be preserved. Validate typed limits against the temporal descriptor and keep view limits separate from filters: changing a visible range does not remove source records. Shared metadata must also reach annotation export so a numeric display coordinate is not mistaken for an epoch input recipe.

## 8. Suggested implementation verification run sheet

These are commands for the future worker after implementation. They were not run during this Design mission. Proposed new test filenames/routes must exist before invoking them. Follow the repository's shared timeouts and run the broad check once, without parallel builds from competing worktrees.

```bash
# Focused parsing, preparation, provider, and planner checks.
pnpm --filter exploreda exec vitest run \
  src/lib/valueParsing.test.ts \
  src/lib/fieldSettings.test.ts \
  src/lib/datePresets.test.ts \
  src/test/providers/fieldSettingsProvider.test.tsx \
  src/components/charts/Calendar/calendarPlan.test.ts \
  src/lib/temporal/temporalPipeline.test.ts \
  src/test/providers/temporalPreparationProvider.test.tsx

# Add the owning query, DSL, notebook-writeback, refresh, and annotation tests
# found in the checkout; run the changed suites, not invented existing names.
pnpm --filter exploreda check-types

# New examples must pass coverage and export/recompile together.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts \
  src/dashboardText.test.ts
pnpm --filter demo docs:check

# The dev server consumes library source; use the printed worktree URL.
pnpm dev:agent
pnpm shot /examples/temporal-basics --name temporal-basics
# M2 and M3, once their example routes are registered:
pnpm shot /examples/temporal-zones --name temporal-zones
pnpm shot /examples/temporal-months --name temporal-months

# Folder and notebook check after the package has been built by the broad gate.
# Open the proposed example using the actual CLI registration or its folder path.
pnpm check
node packages/explorEDA/dist/cli/exploreda.js \
  apps/demo/public/examples/temporal-preparation

# The broad check already builds the demo; verify its scripted docs steps.
pnpm --filter demo docs:verify

# Before a feature PR, create the required user-facing minor changeset.
pnpm changeset:add minor "Prepare dates and instants with explicit temporal meaning."
```

Use targeted fixtures to resolve actual semantic risks; do not add tests that merely mirror object plumbing. The screenshot helper produces 1280/783/390 px images, but screenshots alone do not prove keyboard behavior or membership. Exercise those flows with actual input and inspect the displayed record IDs. Do not claim tests ran based on this run sheet.

## 9. Dependency and precision decisions the worker should preserve

M1 needs strict civil arithmetic and offset/epoch conversion, already compatible with the existing scalar data model. A new library does not remove the obligation to define interpretation, statuses, comparison basis, and persistence. M2's value is more concrete: named-zone projection and strict gap/fold handling. Keep that dependency private so a future native Temporal implementation can replace it without changing saved files or public datum types.

Numerical precision and timezone rules are separate:

- Integer milliseconds are a chosen product/storage policy and are tested exactly.
- Civil calendar validity is a chosen ISO/Gregorian rule and is independent of viewer zone.
- Named-zone offset transitions depend on the engine's timezone data; preserve truthful provenance and do not invent an available tzdb version.
- Original raw strings, numeric values, recipe, and output owner survive save/reopen. That enables transparent reinterpretation when rules change, but does not by itself freeze every historical/future zone result.
- A portable frozen prepared dataset is TP-016 exploration. Do not make it a prerequisite for basic preparation, and do not present it as implemented.

No milestone requires PRs proposing numeric preparation, ordered differences, rolling windows, or rank discovery. Share a future preparation infrastructure only when it is actually present and compatible; do not block the feature or duplicate those missions.

## 10. Completion criteria and open implementation questions

M1 is complete when an author can prepare each first-slice kind from raw data, inspect every failure class, use it through query/formula/chart/filter/trace paths, change interpretation explicitly, save and reopen both JSON and authored text/notebooks, and refresh the same source with correct contributors. M2 and M3 repeat that complete loop for their added semantics. A partial parser, a chart-only timezone option, or text export that loses meaning is unfinished work.

The following questions remain for source inspection, not for a demand study or permission gate:

- Which existing calculation dependency API should supply transitive invalidation? If it lacks output metadata, add the smallest descriptor flow at the calculation boundary.
- What guarantees does `carryRowSelections` actually provide? Reuse verified stable-key behavior and explicitly clear unsupported positional references; do not assume key inference from date values.
- Where does the current project UI commit source definitions and folder edits? Route preparation-owner edits through that path with normal conflict handling.
- Which current DSL productions best carry the new recipe and typed ranges? Choose one canonical spelling, compile/export it losslessly, and use that spelling in examples and notebook writeback.
- Which host/runtime zone provenance is available from the selected polyfill/Intl environment? Record only observable information and document the remaining reproducibility boundary.
- What is the measured cost of preparing and regrouping the repository's representative data sizes? Cache by source revision and normalized recipe after correctness is established; do not guess benchmark numbers.

None changes the selected capability or staged order. They determine local implementation details and test placement.

## 11. Access, files read, checks, and proposed work

**Access status:** the supplied packet contains 40 complete files at the stated baseline. The design is based on that packet, not a claim of a complete checkout. Governance, intent, central parsing/preparation, provider, consumers, query/persistence, notebook, docs, and examples were read. Imported modules listed below were not supplied and need worker inspection before editing.

**Complete supplied file inventory:**

- `AGENTS.md`; `README.md`; `package.json`; `CODING_STANDARDS.md`.
- `docs/agent-guide.md`; `docs/ui-defaults.md`; `docs/research/DIRECTION.md`.
- `docs/intent/date-time-handling/intent-brief.md`; `docs/intent/calendar-period-analysis/intent-brief.md`; `docs/intent/research-ideas-100/ideas/R032-temporal-meaning-contract.md`.
- `packages/explorEDA/src/lib/valueParsing.ts`; `valueParsing.test.ts`; `fieldSettings.ts`; `fieldSettings.test.ts`; `dailyRollup.ts`; `datePresets.ts`; `datePresets.test.ts`.
- `packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts`; `providers/DataLayerProvider.tsx`; `test/providers/fieldSettingsProvider.test.tsx`.
- `packages/explorEDA/src/types/SavedDataStructure.ts`; `types/FilterTypes.ts`; `hooks/applyFilter.ts`; `components/charts/DataTable/components/ColumnFilter.tsx`.
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts`; `components/charts/Calendar/calendarPlan.ts`; `calendarPlan.test.ts`.
- `packages/explorEDA/src/types/AnalysisProject.ts`; `lib/analysis/evaluateProject.ts`; `lib/project/analysisText.ts`; `lib/project/folder.ts`; `lib/dsl/schema.ts`; `lib/dsl/export.ts`.
- `packages/explorEDA/src/lib/notebook/readNotebook.ts`; `compileNotebook.ts`; `writeBack.ts`; `components/notebook/ExplorEdaNotebook.tsx`.
- `apps/demo/src/docs/pages/calendar.mdx`; `apps/demo/src/docs/pages/notebooks.mdx`; `apps/demo/src/demos/examples.ts`.

**Unsupplied integration bodies:** `utils/saveDataUtils.ts`, `types/ChartTypes.ts`, `types/SavedDataTypes.ts`, `lib/declaredFieldTypes.ts`, `lib/fieldProfiles.ts`, `providers/lib/dataLayerState.ts`, `providers/lib/carryRowSelections.ts`, `hooks/CrossfilterWrapper.ts`, calculation manager/parser/engine/dependency implementations, DSL compile/setting-key/project implementations, source editor and folder writeback, snapshot metadata, trace and annotation implementations, field settings UI, demo history, docs catalogue/coverage, and the library package manifest/lockfile. Their integration roles are supported by supplied imports or the agent guide; their exact behavior was not assumed.

**Checked:** supplied source structure and current call paths; exact fixture values and intervals recorded in the research calculation output; primary documentation supporting zone and dependency semantics. **Proposed, not executed:** every application change, test named above, browser acceptance step, performance measurement, new example route, save/reopen run, and dependency adoption. No commit, push, merge, deployment, provisioning, or application modification was performed.

**Deliverables:** this complete plan and the companion [temporal-preparation-report.md](temporal-preparation-report.md). The remaining questions are the concrete integration checks in section 10; no further product-demand input is required to begin M1.
