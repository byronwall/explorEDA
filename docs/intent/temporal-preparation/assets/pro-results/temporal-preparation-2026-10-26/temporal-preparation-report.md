# Temporal preparation and calendar meaning

**Decision:** Build explicit temporal preparation into explorEDA using canonical scalar strings plus a small, authoritative field descriptor, while retaining raw source values and separate preparation diagnostics. Ship civil dates, offset-bearing instants, and explicitly declared epoch seconds or milliseconds as one complete UTC-based slice; then add authored IANA source, display, and grouping zones through a private Temporal adapter; then add genuine year-month labels. Keep civil dates independent of time zones, canonicalize instants to exact integral milliseconds, use typed half-open predicates internally, and preserve exact source contributors through linked views, queries, notebooks, save/reopen, and refresh. Do not guess epoch units, use the browser's zone implicitly, turn a month into an event on its first day, or expose per-cell Temporal objects. Byron's stated need is sufficient demand for this work.

**Mission:** Design, not implementation.  
**Source baseline:** `9d64a021e35d312887b1bc848e307f42b6c3091f`, supplied as origin/main on October 26, 2026.  
**Research checked:** October 26, 2026.  
**Companion:** [Implementation plan](implementation-plan.md).

## 1. Access, evidence, and the capability being built

The complete supplied `pro-prompt.md` and complete `source-packet.txt` were read. The packet contains 40 complete files, 12,459 lines, and 458,060 bytes. Its contents were extracted as reference copies for inspection; this was not a checkout of the whole repository. All supplied files, including the full provider, evaluator, notebook writeback implementation, and 1,426-line demo example catalogue, were read. The full inventory appears in section 15.

Three evidence classes are kept separate throughout this report:

- **Observed:** behavior established from the supplied baseline, cited by repository path and symbol.
- **Checked independently:** seven executions of the original parser and separate numerical/time-zone fixture calculations. These establish specific observations and expected values, not application acceptance.
- **Proposed:** new types, controls, semantics, modules, tests, and milestones. None has been implemented in the repository during this mission.

Several imported modules are absent from the packet. Their existence and integration responsibilities are visible, but their internals have not been verified. They do not prevent choosing the temporal model. The implementation worker must inspect those modules before editing; section 15 identifies the bounded set.

### What analysts gain

An analyst can treat a service date such as `2024-02-29` as the same calendar date everywhere, interpret a recorded event as one precise instant despite differing source offsets, or declare that a numeric feed contains Unix seconds. A preview shows exactly which records will become valid, missing, invalid, or ambiguous before the interpretation changes the analysis.

The resulting meaning applies to the whole workspace. A day selected in a Calendar, a week selected in a line chart, a query comparison, and a trace all identify the same source population under the declared rules. Saving a notebook preserves those rules. Refreshing the source reevaluates the same semantic predicate against the new records.

The main fixture makes the benefit concrete: the February 29 bucket contains records A, B, and C in UTC, but A, B, C, and D in Indianapolis. Its sum changes from 60 to 100 because the grouping zone changed. Merely formatting timestamps in Indianapolis changes neither sum. Sections 10–11 specify every relevant record and boundary.

## 2. What the baseline already does

Paths in this section are relative to the repository root. `src/` paths below refer to `packages/explorEDA/src/` unless otherwise stated.

| Observed boundary | Source evidence | Design consequence |
|---|---|---|
| Offset-free date/time text is UTC; `YYYY-MM` becomes the first day of its month. | `lib/valueParsing.ts`: `parseDateText`, `calendarTime`, `timeOfDay`. | Preserve old behavior only in the legacy path. Explicit civil dates and month labels need their own meaning. |
| `timestampOf` accepts finite numeric timestamps, while explicit datetime conversion stringifies input and calls the selected date parser. | `lib/valueParsing.ts`: `timestampOf`; `lib/fieldSettings.ts`: `convertFieldValue`. | Numeric timestamps currently enter different paths with different results. Explicit epoch preparation should unify the intended behavior without changing ordinary numeric fields. |
| There is one coarse datetime type, plus `datePreset` and date/datetime display formats. Formatting is UTC. | `components/SummaryTable/utils/dataTypeDetection.ts`: `DataType`, `detectColumnType`; `lib/fieldSettings.ts`: `FieldSettings`, `formatFieldValue`. | Add semantic metadata beside the existing coarse type; formatting must not determine meaning. |
| Preparation retains raw data separately from prepared rows. Preview counts failures across the input and retains up to eight examples. | `providers/DataLayerProvider.tsx`: initialization and `updateFieldSettings`; `lib/fieldSettings.ts`: `applyFieldSettings`, `buildConversionPreview`. | Extend this existing workflow with explicit status counts, complete failure review, and atomic application. |
| UTC day and period helpers accept different representations. Period grouping uses fixed UTC boundaries. | `lib/dailyRollup.ts`: `utcDay`, `utcPeriod`, `rollupByPeriod`, `rollupByDay`. | Replace new-mode temporal consumption with a shared typed contract; do not independently patch these inconsistencies. |
| Date filters store string minimum/maximum bounds and use inclusive UTC comparison. Date-only maximum expands to the last millisecond of its day. | `types/FilterTypes.ts`: `DateRangeFilter`; `hooks/applyFilter.ts`; `lib/valueParsing.ts`: `dateBound`; `ColumnFilter.tsx`: `updateRange`. | New filters must declare their basis and zone and compile to half-open predicates. Old filters retain their old semantics until migration. |
| Quick ranges are anchored to the full field profile's latest date, not the wall clock. | `lib/datePresets.ts`; `ColumnFilter.tsx`: `presetsFor`. | Keep source-anchored behavior. Save the resolved range; a click does not create a live scheduling subscription. |
| Time-series periods already come from `snapshot.allIds`, and its full-source Y reference is calculated separately. | `LineChart/timeSeriesPlan.ts`: `planTimeSeries`. | The older intent's moving-axis claim is stale. Preserve shipped domain stability; this mission is not an axis repair project. |
| Calendar years use all rows, while values and its current color scale use the applicable filtered population. | `Calendar/calendarPlan.ts`: `planCalendar`. | Preserve existing distinctions. Do not claim that every visual domain is already fixed or redesign color behavior incidentally. |
| Grouped selections reconstruct date ranges, including `end - DAY_MS` in the line planner; marks already retain contributor IDs. | `timeSeriesPlan.ts`: `periodFilter`, `timePointFilters`; `calendarPlan.ts`: selection helpers and day records. | Carry the actual typed interval to selection and trace. Reuse contributors and existing tracing. |
| Saved analyses retain raw rows and settings, and saved row values are primitives. | `types/SavedDataStructure.ts`: `SavedDatum`, `SavedDataStructure`, `SavedAnalysisStructure`; provider `saveAnalysisToStructure`, `saveToStructure`. | Canonical strings plus metadata fit the existing serialization model; runtime temporal objects would spread a new representation across it. |
| Calculated columns bypass `convertFieldValue` in the provider. | `DataLayerProvider.tsx`: `getColumnData`, calculation cache path. | Result preparation must happen when each calculation evaluates, before its dependents consume it. A display-only conversion is insufficient. |
| Source/query frames project raw values. Lookup and expansion have additional raw projection paths. Query comparison is presently primitive/type-based. | `lib/analysis/evaluateProject.ts`: `sourceFrame`, `lookupFrame`, `expandedFrame`, `calculateFrame`, `filterFrame`. | Prepare owned source fields before every entry to query evaluation and make typed comparison explicit. |
| Query fields have a metadata structure, but reader paths flatten evaluation rows into ordinary row data. | `types/AnalysisProject.ts`: `AnalysisField`; `lib/project/analysisText.ts`; `lib/notebook/readNotebook.ts`. | Carry authoritative field meaning alongside those rows. Do not infer it again from date-shaped output strings. |
| Notebook compilation combines definitions across blocks; chart selections are local in the supplied notebook UI. Shared definitions already reach sheets. | `lib/notebook/compileNotebook.ts`; `components/notebook/ExplorEdaNotebook.tsx`; `apps/demo/src/docs/pages/notebooks.mdx`. | Interpretation belongs to the shared field owner. Keep local chart selection behavior and shared definitions. |
| Existing notebook writeback handles chart settings, excludes some transient settings, and does not provide general shared field-definition writeback. | `lib/notebook/writeBack.ts`: `writeBackSettings`; notebook `onTextChange` path. | The first milestone needs explicit, validated shared-definition writeback, not reliance on the current recent-input heuristic. |
| Data-only provider replacement can take a reset path; save echo uses fingerprint equality to avoid rebuilding. | `DataLayerProvider.tsx`: data/saved-data effects, `setData`, `lastStateChange`, fingerprint logic. | Distinguish refresh from explicit source replacement and keep normalization stable through callback echo and restore. |

The current 2,000-period and 30-series limits in `timeSeriesPlan.ts` remain sensible constraints. The existing notice directs the author to **Chart rows in Filters** to reduce the chart's source population. Linked selection must not silently change the domain to evade the limit.

Other shipped surfaces visible in `apps/demo/src/demos/examples.ts` include temporal Composition scales, heatmap month bins, timelines, retention, ordered funnels, sparklines, annotations, and built-in chart counterparts. Their implementations were not supplied. A bounded caller inventory is a required M1 task so none silently treats a new civil date as an instant.

## 3. Model choice and rejected alternatives

### 3.1 Comparison

| Model | Value and cost | Decision |
|---|---|---|
| Canonical strings alone | Easy to serialize and display. A date-looking string still does not say whether it is a civil date, an instant, a month label, or which grouping zone applies. Meaning would continue to be inferred independently in each consumer. | Insufficient by itself. Keep canonical strings as the physical representation. |
| Canonical strings plus minimal semantic metadata | Preserves primitive rows, existing raw/prepared separation, and JSON/text workflows. Consumers gain an authoritative kind and can choose correct comparison/grouping. Requires metadata propagation and validation at a finite set of boundaries. | **Build.** Best fit for the present React/TypeScript architecture. |
| Distinct runtime values in every row, such as `Temporal.PlainDate` and `Temporal.Instant` | Strong local APIs and type separation. Requires changes to row unions, equality, hashing, serialization, filters, formula engine, saved snapshots, callbacks, and host interoperability. Runtime classes still do not remove the need for persisted metadata. | Avoid as the public row representation. Private adapter values are appropriate. |
| One numeric timestamp for everything | Fast comparison, but civil dates and monthly labels acquire invented instants; precision, unit, and source zone become implicit. | Reject. Private epoch-millisecond keys are appropriate only for instants. |
| A general temporal registry or storage engine migration | Could support many calendar systems and transport formats, at the cost of a new platform beyond this analyst workflow. | Defer. No Arrow database, scheduling system, or registry is needed. |

### 3.2 Kinds and release boundary

| Meaning | Canonical public value and interpretation | Delivery |
|---|---|---|
| Civil date | `YYYY-MM-DD`, valid ISO/proleptic Gregorian date. No time, offset, or zone. Ordering uses a private day ordinal. | M1 |
| Instant | UTC `YYYY-MM-DDTHH:mm:ss.sssZ`, exact integral milliseconds. Source offset text or an explicitly declared Unix epoch convention supplies the instant. | M1 |
| Local wall date/time as input | Calendar and clock fields plus an authored source zone and fold policy resolve to an instant. A nonexistent local time is invalid. | M2 input recipe; no separate public wall-time field kind yet |
| Year-month label | `YYYY-MM`, a calendar period label. Ordering uses a private month ordinal. It is not an event on the first day. | M3 |
| Standalone wall date/time without a source zone | Useful for recurring opening hours or schedules, but does not identify a global instant and needs distinct consumers. | Defer; keep as categorical text |
| Elapsed duration | Difference between instants, measured in an explicit duration unit; distinct from a calendar day or month. | Explain the distinction now; defer a new first-class duration type and arithmetic platform |

One field has one declared temporal kind. A column mixing civil dates and instants is not automatically assigned a union type. The author splits the source or selects one interpretation and reviews the incompatible records.

Keep `DataType`'s coarse `datetime` classification for existing dispatch and styling during these milestones. New consumers must check the authoritative `temporal` descriptor first. The coarse type alone is never permission to convert a civil date to midnight UTC. Auto-detection can suggest an interpretation, but a number remains numeric and a new interpretation takes effect only through an explicit commit.

### 3.3 Precision, syntax, and supported range

The initial public value range is years **0001–9999**, in the proleptic Gregorian calendar. Instants must normalize into that UTC range; source timestamp years and civil dates must also be in range. The exact instant limits are -62135596800000 through 253402300799999 milliseconds. Internal period arithmetic may use neighboring years 0000 and 10000, including the exclusive successor `10000-01-01` at 253402300800000 milliseconds. These are private boundaries, not accepted source values or authored filter bounds. A Sunday-start week containing `0001-01-01` starts privately on `0000-12-31`; its selectable range intersects the supported value domain while retaining the actual week identity. Do not change the week rule to avoid the boundary. Separately, named-zone projection of a valid instant outside the supported civil range reports a specific projection diagnostic while retaining that instant; no data clipping or wraparound is allowed.

- **Civil text:** strict ISO date by default. Offer the existing explicit month-first/day-first date presets where their grammar produces a complete date. The selected convention applies to the whole field. Do not infer a convention per record. No silent extraction of a date from a timestamp.
- **Offset text:** accept a documented ISO-style subset: `YYYY-MM-DDTHH:mm[:ss[.fraction]]` followed by `Z` or `±HH:MM`. Require an explicit offset, with independently validated offset hours 00–23 and minutes 00–59. Reject invalid calendar components, clock hour 24, leap-second `:60`, and unrecognized extensions. Do not accept bracketed zone/calendar annotations in the first slice.
- **Precision:** extra fractional digits are accepted only if the value is exactly an integral millisecond. `.123000` is the same as `.123`; `.1234` is invalid. Do not round across a second, day, or period boundary.
- **Epoch:** the author selects seconds or milliseconds since `1970-01-01T00:00:00Z`. Accept finite signed base-10 decimal input, including an optional scientific exponent, under that explicit recipe. Interpret coefficient and exponent exactly before conversion to milliseconds. Reject radix prefixes, separators, booleans, unsafe integer numbers, nonnumeric text, infinity, and nonintegral millisecond results.
- **Number versus string input:** a JavaScript number has already passed through binary floating-point storage. Its shortest decimal representation is the supplied value for preparation; source digits already lost upstream cannot be recovered. Decimal strings retain their authored digits and should be recommended for precision-sensitive import.
- **Missing:** `null`, `undefined`, trimmed blank strings, and configured null tokens are missing before temporal parsing. Nonblank malformed input is invalid. A raw zero in an explicit epoch field is valid; a raw zero in a civil-text field is invalid.

Use a private exact decimal helper for epoch conversion; `BigInt` may be an implementation detail. Define the accepted trimmed decimal grammar as `^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$`, normalize negative zero to zero, and reject an out-of-range magnitude before constructing huge powers of ten. The final instant key is a safe integral number of milliseconds in the supported range. All raw scalar entry points remain exposed through `lib/valueParsing.ts`, following `CODING_STANDARDS.md` and the agent guide. A chart or UI control must not introduce `Date.parse(raw)`, `new Date(rawText)`, or generic `Number(raw)`.

### 3.4 Legacy compatibility is explicit

An existing `datetime` setting without new temporal metadata remains **legacy datetime**. Its offset-free UTC interpretation, month-to-first-day behavior, and existing date-range representation are preserved. Opening a notebook does not silently migrate it. Existing non-temporal fields and ordinary numeric filters are unaffected.

The field editor offers a previewed migration to Civil date or Instant. A migrated field uses the new contract everywhere. Unsupported mixed old/new predicates produce a diagnostic or are explicitly invalidated according to section 8; the consumer must not fall back to legacy parsing of a field that has a new descriptor.

This is a small compatibility branch within one application version, not a general old-version execution layer. Save readers accept old shapes and validate new shapes; exporters must round-trip each mode deliberately.

## 4. Primary research and what to adopt

The following sources were checked directly on October 26, 2026. The design conclusions in the right column are recommendations for explorEDA, not claims that these products implement this proposal.

| Primary source | Relevant documented behavior | Application to explorEDA |
|---|---|---|
| [Temporal: PlainDate](https://tc39.es/proposal-temporal/docs/plaindate.html), [Instant](https://tc39.es/proposal-temporal/docs/instant.html), [time zones](https://tc39.es/proposal-temporal/docs/timezone.html) | Temporal separates a calendar date, an exact point in time, and a date/time interpreted in a zone. An instant does not itself carry a zone. | Adopt these semantic distinctions. Persist a small descriptor and scalar value; a Temporal class need not become the public row type. |
| [Temporal: ZonedDateTime](https://tc39.es/proposal-temporal/docs/zoneddatetime.html) | Wall-time construction supports explicit ambiguity policies. A day's start can be later than midnight, and a repeated start uses its earliest occurrence. | Make source gap/fold policy explicit. Project instants to civil labels for calendar membership; keep boundary description separate from source-record interpretation. |
| [Temporal: Duration](https://tc39.es/proposal-temporal/docs/duration.html) | Duration operations distinguish calendar units and exact units; some conversions need a relative context. | Label elapsed length separately from calendar grain. A local day must not be hard-coded as 24 hours. |
| [Apache Arrow schema](https://github.com/apache/arrow/blob/main/format/Schema.fbs), [columnar format](https://arrow.apache.org/docs/format/Columnar.html) | The schema separates date and timestamp types and explicit timestamp units. A timezone-less timestamp has wall-clock semantics, not an implicit UTC meaning. Physical representation and logical meaning are distinct. | Copy the separation of values, units, and semantic metadata. Do not install Arrow or equate an absent zone with UTC. |
| [DuckDB 2.0 timestamp types](https://duckdb.org/docs/2.0/sql/data_types/timestamp), [timestamp issues](https://duckdb.org/docs/2.0/guides/sql_features/timestamps) | Timestamp variants have explicit precision. Zoned timestamp types represent instants; formatting/binning depend on the configured zone. Date promotion can change a filter's result when that zone changes. Current 2.0 documentation includes nanosecond zoned timestamps. | Save the grouping/filter zone with the operation and use half-open bounds. Do not rely on an ambient session setting or repeat older claims that DuckDB lacks zoned nanosecond timestamps. |
| [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html) | `date`, `timestamp`, and `timestamp with time zone` have different semantics. Zoned input is normalized; the original zone is not retained in the stored instant. Session settings affect interpretation/display. | Keep the source recipe separately from the canonical instant. Avoid copying implicit session-zone behavior. |
| [pandas to_datetime](https://pandas.pydata.org/docs/reference/api/pandas.to_datetime.html), [tz_localize](https://pandas.pydata.org/docs/reference/api/pandas.Series.dt.tz_localize.html) | Numeric conversion exposes unit/origin choices. Localization exposes ambiguous and nonexistent-time policies, with rejection available. | Make epoch units and resolution policies authored settings. Do not adopt order-based fold inference or silently coerce parse failure into ordinary missingness. |
| [Polars time zones](https://docs.pola.rs/user-guide/transformations/time-series/timezones/), [replace_time_zone](https://docs.pola.rs/api/python/stable/reference/series/api/polars.Series.dt.replace_time_zone.html) | Converting a zone and replacing/localizing a zone are different operations; ambiguity and nonexistent-time choices are explicit. | Separate changing how an instant is displayed from changing how raw wall time is interpreted. |
| [Power Query values](https://learn.microsoft.com/en-us/powerquery-m/m-spec-values), [DateTimeZone.FromText](https://learn.microsoft.com/en-us/powerquery-m/datetimezone-fromtext) | Date, datetime, datetimezone, and duration are distinct. Text conversion offers format/culture settings; datetimezone carries an offset, which is not a full IANA rule history. | Offer visible explicit input conventions. Do not conflate a numeric offset with a named zone or inherit the user's locale for interpretation. |
| [Tableau date levels](https://help.tableau.com/current/pro/desktop/en-us/dates_levels.htm) | A date part such as month-of-year differs from a date truncated to a particular month and year. | Make `2024-02` a specific month. A cross-year “February” comparison is a separate, explicit grouping choice. |
| [IANA time-zone database](https://www.iana.org/time-zones) | Time-zone rules change with political decisions and are distributed through software updates. The checked page identifies release 2026e. | Treat rules provenance separately from numerical precision. Persist authored identifiers/policies and be honest about reproduction across rule updates. |

### Dependency decision

**M1 needs no new temporal dependency.** The existing central parser provides a suitable ownership point. Strict civil validation, explicit-offset normalization, exact decimal epoch conversion, integer comparisons, and UTC calendar arithmetic can be implemented behind that facade. This is a bounded extension, not permission for separate chart parsers.

**M2 should use one private, pinned `@js-temporal/polyfill` adapter.** Its value is reliable named-zone construction, calendar arithmetic, and explicit disambiguation APIs. Building a competing zone resolver using ad hoc `Intl` searches would create much more maintenance than the dependency saves.

The [TC39 repository](https://github.com/tc39/proposal-temporal) currently identifies Temporal as Stage 4 and records native implementations in some runtimes. Native support alone is not a sufficient application baseline: the actual Node 24.22.1 environment inspected for this mission has no global `Temporal`. This plan does not raise the project's Node release baseline to obtain it.

The [polyfill repository](https://github.com/js-temporal/temporal-polyfill) documents an imported module rather than a global patch. Its inspected [package manifest](https://github.com/js-temporal/temporal-polyfill/blob/main/package.json) identifies version 0.5.1 and a JSBI runtime dependency. M2 should pin a verified released version in the existing pnpm lockfile, import it through a single adapter, and use the same adapter on client and server. Do not opportunistically switch engines depending on whether `globalThis.Temporal` exists.

Actual costs include additional bundle/download/parse work, transient allocation during zone calculations, an extra maintained dependency, and continued reliance on available time-zone rules. No bundle-size or speed benchmark was run in this Design mission, so no kilobyte or throughput claim is made. Measure the production bundle delta and representative preparation/interaction time when M2 is implemented. Cache prepared keys and period boundaries; do not construct temporal objects for every row on every filter pass. Do not add deferred loading complexity unless measurements justify it.

A polyfill version is **not** a time-zone database version. Pinning the package does not freeze historical or future IANA rules supplied by the runtime. A bundled database or frozen prepared snapshot is a later reproducibility option, not a prerequisite for the first feature.

## 5. Separate the six temporal choices

| Choice | Meaning | Effect of changing it |
|---|---|---|
| Input convention | Civil text, offset text, epoch seconds, epoch milliseconds, or wall text. | Reinterprets raw values and can change valid records and instants. Requires preview and Apply. |
| Source zone | The IANA zone used to resolve offset-free wall text. Explicit `UTC` is a valid choice in M2. | Reinterprets source wall times. It never overrides an offset already present in offset-text mode. |
| Display zone | The zone used to label an instant in tables, tooltips, and eligible axes. Defaults to UTC. | Labels change; values, order, predicates, memberships, aggregate measures, and trace identity do not. |
| Grouping/filter zone | The zone in which an instant belongs to a day, week, month, or year. Explicitly stored with each calendar operation; defaults to UTC. | Calendar boundaries and membership can change. Does not mutate the instant. |
| Calendar and week convention | Initially ISO/proleptic Gregorian, with existing Monday/Sunday week-start choice recorded. | Week start changes weekly membership. No locale-derived calendar or week-start inference. |
| Elapsed duration | Difference between exact instant keys. | Reports actual elapsed milliseconds/hours; it does not redefine the meaning of a calendar period. |

Changing one zone role must never silently change the other two. The author may intentionally choose the same named zone in several controls, but the saved settings remain independent. Civil dates and month labels have no zone controls. Their labels and membership stay the same when another instant field's zone changes.

For a zoned calendar chart, the period label is expressed in its grouping zone. A field display-zone override may affect the individual event values shown in the trace, but it cannot relabel a calendar bucket as a different day. The trace states the bucket's civil bounds and zone, and may show exact UTC interval bounds when they faithfully describe membership. Some historical calendar dates occupy disjoint instant intervals; a single UTC envelope must not be presented as their exact membership.

## 6. Author workflow

### 6.1 Interpretation and preview

Open the existing field details surface through its field/axis action or keyboard equivalent. Add an **Interpretation** section alongside the existing type, format, and null-token controls. In M1 its choices are Civil date, Instant from offset text, Unix seconds, and Unix milliseconds. M2 adds Instant from local date/time with source zone and fold handling. M3 adds Month label.

The UI names the analyst's choice directly. A short example beside Unix seconds and Unix milliseconds prevents the main unit mistake. Source-zone controls appear only for wall text. Display-zone controls appear only for instants. Calendar grouping exposes its own zone near grain and week start.

A draft uses the same preparation engine as committed data, over the complete current source revision. Show total, valid, missing, invalid, and, in M2, ambiguous counts. A bounded table shows raw value, proposed prepared value, status/reason, and a source-record reference. If retaining the current eight-example cap, say “First 8 shown” and provide a route to all matching records. Do not present a sample count as the total failure count.

All source rows remain available for inspection. A failed preparation yields no prepared temporal scalar, but its raw value and status remain visible. The table's ordinary prepared-value view should offer a compact raw-value comparison through field details or trace; it need not duplicate every column permanently.

The primary fixture preview is exact: **10 rows, 7 valid, 2 missing, 1 invalid**. Clicking Missing reviews IDs `[8,9]`; clicking Invalid reviews `[7]`. Neither review silently changes the draft or replaces the active workspace filter. An explicit “Use as filter” action can create the status predicate.

### 6.2 Apply, reset, cancel, and removal

- **Apply** prepares and validates the complete next state, then commits it atomically. It produces one meaningful `onStateChange` and one host history checkpoint. It is disabled only for an invalid recipe or stale/incomplete preview, not merely because some rows fail.
- **Reset draft** restores settings from when the editor opened and recomputes its preview. It does not remove a previously committed interpretation.
- **Cancel/Escape** discards the draft with no callback or history entry and returns focus to the opener. A nested picker consumes Escape first.
- **Remove interpretation** is a separate previewed choice that returns the field to its underlying unprepared behavior. Its affected filters and downstream fields are shown before Apply.
- **Refresh during preview** makes the draft preview stale and recomputes it against the new revision. Apply must never combine old diagnostics with new prepared rows.

Preview also names affected exploratory filters and any authored expressions that would become invalid. Do not add a separate confirmation gate after Apply; the preview is the reviewable result and Apply is the deliberate commit.

### 6.3 Ambiguity and invalid records

Use distinct status reasons such as `invalid-calendar-date`, `offset-required`, `submillisecond-precision`, `epoch-out-of-range`, `nonexistent-local-time`, and `ambiguous-local-time`. “Missing” means genuinely absent under the configured null-token policy. A fold with no selected resolution has status **ambiguous**, not missing. A gap is **invalid** with its specific reason.

For local wall time, default to rejecting ambiguity. Offer **Earlier occurrence** or **Later occurrence** as a field-wide explicit choice; show both candidate UTC instants and offsets for affected records. Do not infer from row order. Do not shift nonexistent source times forward or backward. A source containing both real fold occurrences needs explicit offsets or separately prepared fields to distinguish them; one identical wall string and one field-wide policy cannot recover lost information.

## 7. Filtering, grouping, comparison, and trace

### 7.1 New predicate representation

Use one new discriminated temporal range family. Public author bounds remain natural for the UI; the compiler always produces half-open internal predicates in the appropriate comparison domain. Calendar predicates compare civil-date or month ordinals; exact instant predicates compare epoch milliseconds. The following is a **proposed wire shape**, not an existing type:

```ts
type TemporalRange =
  | { type: "temporal-range"; field: string; basis: "civil-date";
      from?: string; through?: string; calendar: "iso8601" }
  | { type: "temporal-range"; field: string; basis: "calendar-date";
      from?: string; through?: string; zone: string; calendar: "iso8601" }
  | { type: "temporal-range"; field: string; basis: "instant";
      from?: string; before?: string }
  | { type: "temporal-range"; field: string; basis: "year-month";
      from?: string; through?: string; calendar: "iso8601" };

type TemporalStatusFilter = {
  type: "temporal-status";
  field: string;
  status: "valid" | "missing" | "invalid" | "ambiguous";
};
```

`from` is inclusive. `through` is an inclusive calendar label; compilation advances one calendar date or month to obtain the exclusive end. `before` is already exclusive. An omitted side is unbounded within the supported domain. Both omitted bounds mean no range restriction and should normalize away; an explicit reversed interval is invalid. Equality in a calendar editor is From = Through. Exact instant equality uses a typed equality predicate, not a fabricated inclusive upper endpoint.

Examples:

```json
{
  "type": "temporal-range",
  "field": "occurred",
  "basis": "calendar-date",
  "from": "2024-02-29",
  "through": "2024-02-29",
  "zone": "America/Indiana/Indianapolis",
  "calendar": "iso8601"
}
```

This compares each instant's Indianapolis civil-date ordinal against `[2024-02-29,2024-03-01)`. For this particular date, the exactly equivalent UTC interval is `[2024-02-29T05:00:00.000Z,2024-03-01T05:00:00.000Z)`. A civil-date field uses that same day-ordinal comparison without projection or a zone. A calendar-date filter must not universally be reduced to one UTC start/end pair: section 10's St. John's fixture demonstrates a date that has disjoint instant membership. An exact instant editor labels its upper bound **Before**, not Through, and requires offset-bearing input or canonical UTC text.

Missing, invalid, and ambiguous records do not match ordinary temporal comparisons, including not-equal. They match only an explicit status predicate. Implement status predicates from the diagnostic sidecar; testing the prepared scalar for `undefined` cannot distinguish these populations.

### 7.2 Query and formula comparison

For fields with new metadata, compare typed keys, not display text. Instant equality normalizes equivalent offsets. Civil dates compare by day ordinal; month labels compare by month ordinal. Comparing different temporal kinds is a validation error until an explicit conversion establishes the desired meaning. A civil date is not implicitly midnight in the other field's zone.

The same rules apply to query `FilterStep` operators, temporal join keys, grouping keys, sort keys, and typed parameter values. A typed temporal parameter has a canonical value and descriptor; do not validate a civil parameter merely with the old `isDateText`. Generic legacy comparison remains unchanged for fields without new descriptors.

Formula references need access to field metadata at evaluation, including comparison and sort helpers. Plain field aliases retain meaning; arbitrary string expressions do not inherit it just because their result resembles a date. An explicit calculation `outputPreparation` prepares each produced value before dependent calculations or query stages run. Do not infer that a numeric output is an epoch. Existing explicit formula date results may pass through a documented legacy Date-to-ISO adapter; that adapter is not automatic typing of all strings.

No new duration, rolling-window, rank, or ordered-difference language is required. Unsupported arithmetic between temporal kinds should receive an actionable type diagnostic. The worker must inspect the unsupplied calculation evaluator to place normalization and typed comparison at the actual dependency boundary, rather than postprocessing the final visible column.

### 7.3 Calendar periods and chart positions

For civil dates, advance calendar labels and compare day ordinals. For instants, cache each valid instant's projected civil-date key in the operation's declared zone. Derive its day/week/month/year label from that key. Filtering, grouping, mark selection, and contributor inspection use the same projected keys as membership truth. Store calendar `[start, endExclusive)` in the civil-ordinal domain; exact instant filters store epoch-millisecond bounds. Weeks use the authored Monday/Sunday rule. Months and years advance calendar components, not a fixed number of elapsed milliseconds.

An ordinary local day often corresponds to one UTC interval, and the Indianapolis fixtures below do. That is not a universal property of IANA history. A backward transition near midnight can briefly enter the next date and then return to the previous one. Consequently, `[firstValid(date),firstValid(nextDate))` can include instants whose projected date is wrong. Use a single UTC interval only when proven equivalent, or derive exact segments if a feature needs them. M2 can ship correct cached projection predicates without a general interval-segmentation engine.

Calendar boundary resolution differs deliberately from source wall-time preparation:

- A source record naming a nonexistent local time is invalid.
- A calendar day's boundary is the earliest valid instant on that date, or the next valid date if the whole date was skipped.
- Repeated midnight uses the earlier boundary.
- A wholly skipped calendar date has equal start and end and an empty population.

These boundary descriptions are consistent with Temporal's documented start-of-day behavior; a skipped date also naturally matches no projected date keys. Boundaries support layout and explanation but do not replace the membership rule above. Use current `ZonedDateTime.from` and calendar APIs; do not design around obsolete `Temporal.TimeZone.getPossibleInstantsFor` examples. Pass `overflow: "reject"`, enforce the product grammar and millisecond precision first, and compare earlier/later candidates after round-tripping their wall fields to distinguish folds from gaps. Reject an invalid zone identifier as a configuration error before preparing rows. Preserve an accepted authored IANA identifier rather than cosmetically rewriting aliases to identifiers another runtime may not recognize.

Calendar grid geometry uses civil dates, weekdays, and month placement. A 23-hour day still occupies one cell. Calendar-summary axes use civil/period positions; an explicit elapsed-time axis uses actual instant positions. If a renderer uses a period boundary or envelope midpoint as a synthetic coordinate, it must retain the semantic period and never use that coordinate or envelope as the membership predicate. Unequal lengths and any disjoint membership remain meaningful. A layout position is not a source observation and must not become its record identity. Civil/month axes never invent public instants.

The existing all-row time-series domain and all-row Calendar year extent remain stable under ordinary linked filters. Chart-local row definitions still determine the chart population. Axis-limit edits are view bounds, not data filters; adapt their parsing and labels to the field descriptor without giving the deprecated `min`/`max` placeholders new meaning.

### 7.4 Exact contributors and annotations

Every grouped mark carries its semantic period, typed comparison bounds, grouping signature, and exact contributing source references. Calendar bounds refer to the projected civil-date domain; exact instant ranges refer to milliseconds. A selected range recomputes contributors from the same predicate used to render the mark. Preserve split/facet predicates. A row with a valid date but an invalid measure is in the period's record population but may be excluded from that measure's contributing subset; trace must distinguish those two counts. Empty, zero, invalid-measure, and negative-value cases remain distinct as in existing Calendar tests.

Use current click selection, Alt-click/Alt+Enter tracing, and header trace mechanisms. Do not add an Inspect button to every chart. The trace exposes the period label, zone when applicable, inclusive start/exclusive end in its stated domain, record count, measure contributors, raw input, prepared instant/date, and stable source key when available. A calendar trace may add one exact UTC interval or multiple exact segments when those are available; otherwise the civil predicate plus zone and exact records is complete and truthful. Never label a spanning UTC envelope as an exact membership interval.

Plan and trace identities include source revision, field meaning revision, grouping kind/zone/calendar/grain/week start, and split/facet context. Display format and display zone are excluded. Current IDs such as `day:<label>` and `[seriesKey, start]` are not enough by themselves once different zone meanings coexist.

Record annotations retain their existing durable-key approach and reproject into the updated chart. New temporal period annotations retain an explicit period basis and grouping signature. A grouping-zone or grain change that changes that meaning marks the old period anchor unresolved until the author reattaches it; it must not silently move the callout to a different source population. Display edits do not invalidate anchors. Adapt existing annotation resolution and status UI rather than introduce a new annotation system.

## 8. Ownership, propagation, and invalidation

### 8.1 Recipe versus prepared meaning

Keep the recipe that interprets raw input separate from the descriptor that says what a prepared output already means. Proposed type responsibilities:

```ts
type TemporalMeaning =
  | { kind: "civil-date"; calendar: "iso8601" }
  | { kind: "instant"; precision: "millisecond" }
  | { kind: "year-month"; calendar: "iso8601" };

type TemporalPreparation =
  | { version: 1; input: "civil-text"; format: "iso" | "mdy" | "dmy" }
  | { version: 1; input: "offset-text"; format: "iso" }
  | { version: 1; input: "epoch"; unit: "seconds" | "milliseconds" }
  | { version: 1; input: "wall-text"; format: "iso";
      sourceZone: string; fold: "reject" | "earlier" | "later"; gap: "reject" }
  | { version: 1; input: "year-month-text"; format: "iso" };
```

M1 validates only its supported variants, M2 adds wall text and zone settings, and M3 adds year-month. Existing `nullTokens` remains a common input option owned with the recipe; do not introduce a competing temporal null-token list. The exact TypeScript naming is proposed, but ownership is a design requirement.

| Boundary | Owner and data carried | Required behavior |
|---|---|---|
| Standalone raw dataset | `FieldSettings.temporalPreparation`, existing null tokens, separate display settings. | Prepare once from `rawData`; derive canonical meaning and per-record status. |
| Project source | `FieldDefinition.temporalPreparation` plus common input options. | Establish source identity from raw key fields first, then prepare before `sourceFrame`, lookup targets, and expansion targets. |
| Query result | `AnalysisField.temporal` plus a `preparationOwner` reference and status/provenance mapping. | Carry canonical meaning beside primitive rows. Do not apply the original raw recipe to those prepared strings again. |
| Calculated field | `SavedCalculation.outputPreparation` or `CalculateStep.outputPreparation`. | Evaluate expression, prepare its result, then expose it to dependent evaluation. The calculation owns its recipe. |
| Notebook/provider bridge | A `fieldMetadata` map alongside row data and existing coarse `fieldTypes`. | Pass metadata through readers, compiler, and provider. Consumers use canonical values directly. |
| Field editor on an owned output | Owner reference resolves to source definition or calculation definition. | Offer Edit source interpretation or Edit calculation interpretation. Reject a conflicting downstream recipe rather than double-preparing. |
| Aggregation | Group fields retain their descriptor; measure outputs receive appropriate numeric or explicit output metadata. | Do not label a sum/count as temporal simply because its input was temporal. Preserve contributor mappings. |

Private prepared-column storage contains canonical scalar, typed key, status/reason, and source reference. It is not a new public object stored in every `datum`. Build this once per source/recipe revision and reuse it for profiles, filtering, query evaluation, grouping, and traces. Source-level preparation can expose a reusable prepared table to multiple queries without erasing raw data.

### 8.2 Required pipeline

1. Validate the source/field declaration and assign raw source references.
2. Interpret raw values through the central parsing facade; produce canonical scalars, descriptors, typed keys, and diagnostics.
3. Evaluate query stages with those values and metadata. Prepare calculation outputs at each dependency boundary. Lookup/expand must use the same prepared source view.
4. Preserve descriptors and source references in the result frame. Pass them through text/notebook readers, which currently flatten rows.
5. Initialize or update the provider without interpreting canonical values again. Build profiles, filters, charts, and trace populations from the shared contract.
6. Save raw source data where the existing analysis format includes it, and save authored recipes/settings everywhere they belong. Reconstruct derived state on restore.

`lib/valueParsing.ts` remains the public raw-value gate. New pure modules under `lib/temporal/` can implement preparation, comparison, periods, and zones behind it. React components author drafts and dispatch actions; they do not own independent parsing rules. Use narrow store subscriptions and resolve a column getter outside the per-row filter loop, following the current performance guidance.

### 8.3 What changes when Apply succeeds

| Edit | Recompute or invalidate | Preserve |
|---|---|---|
| Input recipe, source zone, fold policy, or null tokens | Prepared column/status; all dependent calculation/query results; profiles; grouping and trace plans. Clear exploratory predicates on the field and transitively dependent outputs. | Unrelated fields, filters, charts, raw rows, and durable source keys. |
| An authored query/DSL predicate becomes incompatible | Keep its text/definition and emit a blocking typed diagnostic for that result. Show the conflict in preview. | Do not silently delete authored analysis logic or reinterpret its date as UTC. |
| Grouping zone, grain, or week start | Rebuild that chart's periods/contributors, clear its old bucket selection, reevaluate period annotations. | Canonical values and unrelated exact-instant workspace predicates. |
| Display format or zone | Label/layout formatting as necessary. | Keys, counts, sort order, domain values, predicate membership, measure values, selection, and trace identity. |
| Same-source refresh | Prepare new revision; reevaluate semantic predicates and calculated/query output; regenerate traces. | Recipes, compatible filters, chart settings, sheet definitions, and durable-key selections. |
| Explicit source replacement | Existing intentional reset/replace behavior, using a distinct action or changed source identity. | Nothing beyond what that explicit import action promises. |

The current provider clears some direct filters during type changes but does not establish this whole contract. In particular, chart-local authored filters and filters on dependent calculations need deliberate treatment. Exploratory selections include the current chart/workspace/Rows paths; authored query and `chart.localFilters` definitions should be retained and validated. Show the exact affected filters in preview so Apply is predictable.

For refresh, add an explicit `refreshData` action. Within a mounted provider, a data-only update with the same source identity should use it. Keep `setData` for intentional new-source import/reset, with an explicit source identity such as proposed `dataKey` where the host needs to distinguish them. A changed array alone is a revision, not evidence that the analyst requested a new workspace. This behavior change belongs in the M1 API documentation and changeset.

The preparation cache key includes source revision, raw scalar type, normalized recipe signature, and semantic implementation version. Period caches additionally include temporal kind, grouping zone, calendar, grain, week start, and known rules-provider context. A display-zone change must not invalidate semantic grouping caches. Do not persist cache entries as authored state.

## 9. Persistence, notebooks, history, and reproduction

### 9.1 JSON and validation

Extend `FieldSettings`, saved calculations, project field definitions, query calculation definitions, temporal filters, and chart grouping settings. Validate every new shape in saved-data and project/DSL validation. Unknown recipe versions, unsupported units, invalid zones, malformed bounds, mismatched kinds, and conflicting owners are errors. Never discard an unrecognized temporal descriptor and proceed with legacy interpretation.

Keep the existing primitive `SavedDatum` representation and raw-row save path. New metadata is additive to the present format where the validator permits; use a small semantic recipe version independent of a speculative major file-format migration. Existing files with no new metadata retain legacy behavior. Serialize normalized defaults consistently so save → restore → save is stable except the existing modification timestamp.

Prepared values/status/caches are derived, not the authority in an ordinary saved workspace. Exporting raw source plus recipe preserves the ability to correct interpretation. If a host exports an already canonical query result, it must also export its canonical descriptor and owner/provenance context; it must not advertise that result as original raw input for the old epoch recipe.

### 9.2 Text and folder projects

`lib/dsl/export.ts` currently relies on recognized setting words and inferred field types. Add explicit temporal keys to both compiler and exporter; do not assume an arbitrary nested object will round-trip. Use one normalized spelling for each setting. The following illustrates the **proposed key vocabulary**, to be integrated into the existing declaration grammar rather than treated as already executable text:

```text
temporal.input=epoch
temporal.unit=seconds
temporal.version=1
display.zone=UTC

temporal.input=wall-text
temporal.format=iso
temporal.sourceZone=America/Indiana/Indianapolis
temporal.fold=reject
temporal.gap=reject

group.zone=America/Indiana/Indianapolis
group.calendar=iso8601
```

Civil and month declarations also encode their kind through the input variant. New typed filters must export their basis, calendar, zone, and inclusive label or exclusive instant semantics. Source field declarations and calculation result declarations must have distinct owners. An output descriptor may be carried in compiled metadata without duplicating an editable source recipe in every chart.

`lib/project/folder.ts` currently propagates snapshot field types in `withSnapshotTypes`; extend that route to recognized canonical metadata without overriding explicit authored source declarations. Preserve the distinction between declared and inferred sources. Both JSON-backed and text-backed folder projects must produce the same prepared result and descriptor. Do not redesign connectors or source transport.

### 9.3 Notebooks and sheets

Thread metadata through `readAnalysisText`, `readNotebookText`, `compileNotebook`, `ExplorEdaNotebook`, and provider initialization. The present `fieldTypes` path is not sufficient and is not passed uniformly into the whole notebook compilation path. A raw recipe must not disappear when evaluation rows are mapped to `row.data`.

Add an explicit shared-definition writeback operation for field and calculation interpretation. It must identify the owning source/calc definition across all blocks, splice the minimal authored text, recompile, and commit only if the normalized definition and output metadata match the requested edit. Preserve unrelated prose, comments, sheet declarations, and chart definitions. If an edit cannot be represented in a supported declaration, report that limitation and keep the prior committed state; do not show an unsaved successful interpretation.

Shared preparation is visible in every sheet referencing that field. Existing chart selections remain local to notebook charts, while authored shared filters retain their existing all-chart role. Test edits from one sheet, switching sheets, reopening the notebook, and export/import. Do not rely on the current two-second recent-input heuristic to recognize a deliberate field Apply; pass an explicit semantic commit event through writeback.

### 9.4 Callbacks and history

Preparation is drafted locally. Build the next complete provider state before publication, then emit one stable saved structure. Existing `holdStateChanges` is useful for callback grouping, but suppressing callbacks does not by itself prevent views from observing a partially rebuilt state; the store transition must be atomic too.

The host may echo the callback as `savedData`. Normalization must make the echoed fingerprint identical and avoid a full restore loop. One Undo returns values, metadata, statuses, filters, and dependent query results to the previous interpretation; one Redo reinstates them. A canceled draft generates neither history nor text writeback. A source refresh should not masquerade as a new authored interpretation in the history log.

### 9.5 Identity and time-zone rules

Use existing durable source keys when they are genuinely unique. In `evaluateProject.ts`, `sourceReferences` already produces key-based references when possible and diagnoses fallback row references. Establish these keys from raw identity before temporal conversion. A, B, and C in the fixture share an instant and remain three records; timestamps are not a deduplication key.

Numerical row IDs are revision-local. After a reorder, a positional selection must be reconciled through an existing durable key or cleared with a visible reason; it cannot keep pointing at the same index and claim to represent the old record. A saved calendar selection is a semantic predicate, so new and repaired matching records correctly join it. Old trace handles are invalid after a source revision.

Record the authored zone identifier, calendar, fold/gap policy, precision, and recipe version. Record the evaluation engine and actual runtime/rules version when available in diagnostic/export context, using **unknown** when unavailable. Do not claim that a browser exposes a reliable IANA version if it does not. Keep non-authored runtime diagnostics out of the stable callback fingerprint.

Reopening raw wall-time data re-evaluates it under the available rules. A rules update may change its resolved instant or a named-zone calendar bucket. Canonical offset/epoch instants remain the same exact values, while their named-zone projection may change. Recompute affected caches and disclose a detected rules-context change; do not promise byte-identical historical reproduction without a frozen rule set or prepared snapshot. That more expensive portability option is **Explore**, not a delivery gate.

## 10. Exact fixture contract

All numerical IDs in these fixtures are scoped to the stated fixture and revision. They are not a proposal to use position as durable record identity. “Expected” below means a required application assertion. Independent calculations checked the instant/epoch/boundary arithmetic; application tests remain to be implemented.

### F1 — civil dates and explicit input conventions

| Row ID | Raw value | Expected strict civil-text result |
|---|---|---|
| 0 | `2024-02-28` | Valid `2024-02-28` |
| 1 | `2024-02-29` | Valid `2024-02-29` |
| 2 | `2024-03-01` | Valid `2024-03-01` |
| 3 | `2025-02-29` | Invalid calendar date |
| 4 | `2024-02` | Invalid: incomplete date / different temporal kind |
| 5 | `2024-02-29T23:30:00Z` | Invalid: no implicit date extraction |
| 6 | whitespace-only text | Missing |
| 7 | `null` | Missing |
| 8 | numeric `0` | Invalid representation |
| 9 | boolean `true` | Invalid representation |

Required counts: valid **3**, missing **2**, invalid **5**. Valid IDs `[0,1,2]`; missing `[6,7]`; invalid `[3,4,5,8,9]`. From `2024-02-29` Through `2024-02-29` compiles to `[2024-02-29,2024-03-01)` and selects `[1]` in every host zone. Equality to February 29 selects `[1]`; less than March 1 selects `[0,1]`. No instant comparison is permitted without an explicit conversion.

Additional exact assertions: `2000-02-29` valid; `1900-02-29` invalid; `0001-01-01` and `9999-12-31` valid; `0000-01-01` and `10000-01-01` invalid source values. Through `9999-12-31` uses a private exclusive successor without rolling over. With an explicit null token `NA`, raw `NA` is missing; without that token it is invalid. `01/02/2025` under MDY becomes `2025-01-02`, while under DMY it becomes `2025-02-01`; ISO mode rejects it.

### F2 — offset equivalence, midnight crossings, and diagnostics

| r1 row ID / event key | Raw timestamp; amount | Canonical result |
|---|---|---|
| 0 / A | `2024-02-29T23:30:00.000Z`; 10 | `2024-02-29T23:30:00.000Z`; 1709249400000 ms |
| 1 / B | `2024-02-29T18:30:00-05:00`; 20 | Same instant as A |
| 2 / C | `2024-03-01T00:30:00+01:00`; 30 | Same instant as A |
| 3 / D | `2024-03-01T00:30:00Z`; 40 | `2024-03-01T00:30:00.000Z`; 1709253000000 ms |
| 4 / E | `2024-03-01T05:00:00Z`; 50 | `2024-03-01T05:00:00.000Z`; 1709269200000 ms |
| 5 / F | `2024-03-04T04:30:00Z`; 60 | `2024-03-04T04:30:00.000Z`; 1709526600000 ms |
| 6 / G | `2024-03-04T05:00:00Z`; 70 | `2024-03-04T05:00:00.000Z`; 1709528400000 ms |
| 7 / H | `bad`; 80 | Invalid |
| 8 / I | whitespace-only text; 90 | Missing |
| 9 / J | `null`; 100 | Missing |

Expected: seven valid records, five distinct instants, two missing records, one invalid record. Equality to `2024-02-29T23:30:00.000Z` selects `[0,1,2]`; sum 60. Exact range `[2024-02-29T23:30:00.000Z,2024-03-01T05:00:00.000Z)` selects `[0,1,2,3]`; sum 100; E at the exclusive end is excluded. Instant not-equal to A selects `[3,4,5,6]`, excluding all failed/missing rows. Sorting retains all three equal-instant records using stable source order as the existing tie convention.

Display D in Indianapolis as February 29, 19:30 with offset `-05:00`, while retaining canonical `2024-03-01T00:30:00.000Z`. This display edit changes no equality/range result and no grouping membership unless the grouping zone is separately changed.

### F3 — exact period membership

All weeks below start Monday. `Indianapolis` means `America/Indiana/Indianapolis`. Sums use F2 amounts; contributors are r1 IDs.

| Bucket | UTC IDs / sum | Indianapolis IDs / sum |
|---|---|---|
| February 29 day | `[0,1,2]` / 60 | `[0,1,2,3]` / 100 |
| March 1 day | `[3,4]` / 90 | `[4]` / 50 |
| March 3 day | `[]` / empty | `[5]` / 60 |
| March 4 day | `[5,6]` / 130 | `[6]` / 70 |
| Week beginning February 26 | `[0,1,2,3,4]` / 150 | `[0,1,2,3,4,5]` / 210 |
| Week beginning March 4 | `[5,6]` / 130 | `[6]` / 70 |
| February month | `[0,1,2]` / 60 | `[0,1,2,3]` / 100 |
| March month | `[3,4,5,6]` / 220 | `[4,5,6]` / 180 |

| Period | Exact half-open UTC bounds | Millisecond bounds / elapsed length |
|---|---|---|
| UTC February 29 | `[2024-02-29T00:00Z,2024-03-01T00:00Z)` | `[1709164800000,1709251200000)`; 24 h |
| Indianapolis February 29 | `[2024-02-29T05:00Z,2024-03-01T05:00Z)` | `[1709182800000,1709269200000)`; 24 h |
| UTC week February 26 | `[2024-02-26T00:00Z,2024-03-04T00:00Z)` | `[1708905600000,1709510400000)`; 168 h |
| Indianapolis week February 26 | `[2024-02-26T05:00Z,2024-03-04T05:00Z)` | `[1708923600000,1709528400000)`; 168 h |
| Indianapolis week March 4 | `[2024-03-04T05:00Z,2024-03-11T04:00Z)` | `[1709528400000,1710129600000)`; 167 h |
| UTC February | `[2024-02-01T00:00Z,2024-03-01T00:00Z)` | `[1706745600000,1709251200000)`; 696 h |
| Indianapolis February | `[2024-02-01T05:00Z,2024-03-01T05:00Z)` | `[1706763600000,1709269200000)`; 696 h |
| UTC March | `[2024-03-01T00:00Z,2024-04-01T00:00Z)` | `[1709251200000,1711929600000)`; 744 h |
| Indianapolis March | `[2024-03-01T05:00Z,2024-04-01T04:00Z)` | `[1709269200000,1711944000000)`; 743 h |

Sunday week beginning March 3 in Indianapolis is `[2024-03-03T05:00Z,2024-03-10T05:00Z)` and selects `[5,6]`, sum 130. That differs from the Monday week beginning February 26, which contains F but not G. The same field can support both charts without changing canonical values.

Every grouped click, keyboard activation, and trace must return these same IDs, including split/facet intersection when present. Add a measure variant where D's amount is invalid: Indianapolis February 29 still has record IDs `[0,1,2,3]`, but sum contributors `[0,1,2]`, sum 60, and one invalid measure. Do not confuse a missing measure with a missing date.

### F4 — explicit epochs and numerical precision

| Input with declared unit | Canonical result | Exact key/status |
|---|---|---|
| `0` seconds or milliseconds | `1970-01-01T00:00:00.000Z` | 0 ms |
| `1709251200` seconds | `2024-03-01T00:00:00.000Z` | 1709251200000 ms |
| The same `1709251200` milliseconds | `1970-01-20T18:47:31.200Z` | 1709251200 ms |
| `1709251200000` milliseconds | `2024-03-01T00:00:00.000Z` | 1709251200000 ms |
| `"1709251200.001"` seconds | `2024-03-01T00:00:00.001Z` | 1709251200001 ms |
| `"-0.001"` seconds or `-1` milliseconds | `1969-12-31T23:59:59.999Z` | -1 ms |
| `"1.234"` seconds | `1970-01-01T00:00:01.234Z` | 1234 ms |
| `"1.2300"` seconds | `1970-01-01T00:00:01.230Z` | 1230 ms |
| `"1e-3"` seconds | `1970-01-01T00:00:00.001Z` | 1 ms |
| `"1.2345"` seconds | No prepared value | Invalid: nonintegral millisecond |
| `"1.5"` milliseconds | No prepared value | Invalid: nonintegral millisecond |
| `"0x10"`, `true`, `NaN`, infinity | No prepared value | Invalid representation/value |

An unprepared numeric `1709251200` remains numeric. An epoch input never acquires a unit from its magnitude. Offset text `2024-02-29T23:59:59.9996Z` is invalid in the new contract rather than rounding into March. `2024-02-29T23:59:59.999000Z` is valid at 1709251199999 ms. `2024-02-29T23:59:60Z` is invalid. A numeric unsafe integer such as `9007199254740992` is invalid before temporal use.

### F5 — daylight-saving source interpretation and exact membership

For local input in `America/New_York`:

| Wall time | Expected candidates | Preparation result |
|---|---|---|
| `2024-03-10T02:30:00` | None | Invalid nonexistent local time under every offered fold policy |
| `2024-03-10T03:30:00` | `2024-03-10T07:30:00.000Z` / 1710055800000 ms | Valid |
| `2024-11-03T01:30:00` | Earlier `2024-11-03T05:30:00.000Z` / 1730611800000 ms; later `2024-11-03T06:30:00.000Z` / 1730615400000 ms | Ambiguous by default; valid only after explicit earlier/later choice |

The corresponding explicit-offset inputs `2024-11-03T01:30:00-04:00` and `2024-11-03T01:30:00-05:00` are distinct valid instants in offset-text mode without source-zone disambiguation.

For grouping in Indianapolis:

| Period | Exact UTC interval | Elapsed duration |
|---|---|---|
| March 10, 2024 | `[2024-03-10T05:00Z,2024-03-11T04:00Z)` | 82,800,000 ms / 23 h |
| November 3, 2024 | `[2024-11-03T04:00Z,2024-11-04T05:00Z)` | 90,000,000 ms / 25 h |
| Week October 28 | `[2024-10-28T04:00Z,2024-11-04T05:00Z)` | 169 h |
| November 2024 | `[2024-11-01T04:00Z,2024-12-01T05:00Z)` | 721 h |

Use this separate ten-row boundary fixture, all offset-text input:

```text
0  2024-03-10T04:59:59.999Z
1  2024-03-10T05:00:00.000Z
2  2024-03-11T03:59:59.999Z
3  2024-03-11T04:00:00.000Z
4  2024-11-03T03:59:59.999Z
5  2024-11-03T05:30:00.000Z
6  2024-11-03T06:30:00.000Z
7  2024-11-04T04:59:59.999Z
8  2024-11-04T05:00:00.000Z
9  2024-11-03T04:00:00.000Z
```

March 10 selects `[1,2]`. November 3 selects `[5,6,7,9]`. Exact November 3 instant range `[05:00Z,06:00Z)` selects `[5]`; `[06:00Z,07:00Z)` selects `[6]`. Both fold occurrences need distinguishable visible and accessible labels.

Additional boundary assertions prevent a midnight-only resolver:

- `Pacific/Apia`, civil date `2011-12-30`: interval `[2011-12-30T10:00:00Z,2011-12-30T10:00:00Z)`, empty. A source wall time on that skipped date is invalid.
- `America/Sao_Paulo`, civil date `2015-10-18`: interval `[2015-10-18T03:00:00Z,2015-10-19T02:00:00Z)`, 23 hours. The day starts at local 01:00, offset `-02:00`; source midnight remains invalid.

**Date reversal near midnight:** for zone `America/St_Johns`, use these separately numbered fixture records:

| Row ID | Exact instant | Projected local date/time |
|---|---|---|
| 70 | `2010-11-07T02:30:00Z` | `2010-11-07T00:00:00-02:30` |
| 71 | `2010-11-07T03:00:00Z` | `2010-11-06T23:30:00-03:30` |
| 72 | `2010-11-07T03:30:00Z` | `2010-11-07T00:00:00-03:30` |

November 7 selects **`[70,72]`**; November 6 selects **`[71]`**. November 7's instant membership is `[2010-11-07T02:30Z,2010-11-07T02:31Z)` union `[2010-11-07T03:30Z,2010-11-08T03:30Z)`. A single interval beginning at the day's first midnight would wrongly include record 71. Assert projected-date equality, day grouping, selected-mark filtering, and trace against these exact sets. The independent zoneinfo oracle checked these mappings; the application must prove the same behavior under its actual runtime rules. The Temporal ZonedDateTime documentation discusses repeated day starts for this zone/date, while the explicit segment calculation here is the independent check.

### F6 — month labels

| Row ID | Raw month; amount | Expected |
|---|---|---|
| 0 | `2024-01`; 10 | Valid month label |
| 1 | `2024-02`; 20 | Valid month label |
| 2 | `2024-02`; 30 | Valid month label |
| 3 | `2024-03`; 40 | Valid month label |
| 4 | `2024-13`; any | Invalid month |
| 5 | `2024`; any | Invalid grain |
| 6 | `null`; any | Missing |

From `2024-02` Through `2024-02` compiles to the month-ordinal interval `[2024-02,2024-03)` and selects `[1,2]`, sum 50. Year 2024 selects `[0,1,2,3]`, sum 100. Month equality and ordering retain the year. A separate extension row 7, `2025-02`, amount 60, is excluded from February 2024 but included in an explicitly authored month-of-year February category, whose IDs become `[1,2,7]`, sum 110.

The descriptive civil extent of `2024-02` is `[2024-02-01,2024-03-01)`. No record appears on February 1 in a daily Calendar. A daily consumer is ineligible unless the author explicitly derives a civil date under a stated rule; that derivation is outside automatic month preparation.

### F7 — refresh, history, and cross-surface round trips

Start with F2 r1 and the Indianapolis February 29 calendar predicate. It selects keys `[A,B,C,D]`, current IDs `[0,1,2,3]`, sum 100. Refresh to r2 in this order:

```text
[D, A, G, H, B, E, C, F, I, J, K]
```

Repair H to `2024-02-29T23:45:00Z`, amount 80. Add K at `2024-03-01T04:00:00Z`, amount 110. The same saved predicate now selects current IDs `[0,1,3,4,6,10]`, keys `[D,A,H,B,C,K]`, sum **290**. New summary: 11 rows, nine valid, two missing, zero invalid. The changed population is correct for a live semantic predicate.

A durable record selection for A remains A and moves from numerical index 0 to 1. An unkeyed positional selection at r1 index 0 must not silently become D. Recompute or invalidate trace handles. A preview begun at r1 must recompute before an r2 Apply.

Required persistence matrix, using the same fixtures:

- Saved JSON: raw strings/epoch numbers unchanged; recipe, temporal meaning, display/group choices, and normalized predicates preserved; restore reproduces the same current-rules values and contributor IDs.
- Project source → query → provider: epoch seconds prepared once; canonical ISO output is not treated as an invalid epoch string downstream.
- Calculation chain: explicitly epoch-prepared calculation output is canonical before its dependent comparison. For input `1709251200` seconds, the calculation outputs `2024-03-01T00:00:00.000Z`; a downstream equality comparison to that instant is `true` and a matching query predicate retains the row.
- Alias/lookup/expand/aggregate: field meaning retained where appropriate; numeric aggregate measures remain numeric; contributor refs remain exact.
- DSL export → compile → export: normalized temporal declaration and filter shapes equal; legacy text remains legacy; unsupported or malformed new keys fail clearly.
- Folder JSON/text paths and notebook Markdown: equivalent descriptors and canonical values. Edit in sheet one, inspect sheet two, save, reopen; both reflect the same committed source interpretation.
- Apply/cancel/history: one Apply callback and one Undo step; Cancel/Reset draft produce no authored commit; host echo does not rebuild; one Undo restores the former recipe, values, statuses, and affected filters.
- Changing display zone only: the same normalized semantic filters, source IDs, trace identity, aggregate values, and numeric domain values before and after.

## 11. What was actually checked

The supplied original `valueParsing.ts` was executed directly under Node 24.22.1 using TypeScript stripping, without changing repository source. Seven assertions passed:

| Original parser operation | Observed result |
|---|---|
| Parse `2024-03-01T00:30:00` | `2024-03-01T00:30:00.000Z` |
| Parse `2024-02` | `2024-02-01T00:00:00.000Z` |
| Parse `2024-02-29T23:59:59.9996Z` | Rounds to `2024-03-01T00:00:00.000Z` |
| `timestampOf(1709251200)` | `1709251200`, treated as milliseconds |
| ISO parse of string `1709251200000` | Not finite / invalid |
| Upper `dateBound("2024-02-29", true)` | `2024-02-29T23:59:59.999Z` |
| Parse `2023-02-29` | Invalid / NaN |

These observations justify explicit new semantics; they are not a request to rewrite every legacy parsing behavior. In particular, the proposed no-rounding precision rule intentionally differs from the observed rounding behavior only for newly prepared fields.

The environment reported Node **24.22.1**, ICU **78.3**, time-zone rules **2026e**, and `typeof globalThis.Temporal === "undefined"`. Separately, the fixture calculations used Python **3.12.14**, exact decimal arithmetic, and operating-system `zoneinfo` rules **2025b**. Equivalent-offset normalization, epoch values, calendar intervals, gap/fold candidates, refresh membership, the Apia/São Paulo boundaries, and the St. John's date reversal were checked independently. These historical fixtures agree with their stated rules; that does not establish that every rule in 2025b and 2026e is identical.

No application build, Vitest suite, browser acceptance flow, package-size benchmark, or Temporal adapter implementation was executed. Application assertions in this report are proposed acceptance criteria. Numerical precision is a design choice about representable values; time-zone database provenance is a separate environmental assumption. Neither one substitutes for the other.

## 12. Build order and release value

The [implementation plan](implementation-plan.md) provides module-by-module tasks, exact assertions, docs/examples, and browser steps. Each milestone is a usable end-to-end release. Its internal tasks can be developed in sequence, but an isolated parser with unmigrated enabled consumers is not the milestone's deliverable.

| Milestone | Usable release | Main risk |
|---|---|---|
| **M1 — Explicit dates and instants in UTC** | Civil dates, offset instants, explicit seconds/milliseconds, full preview/status review, typed comparison/filtering, UTC Calendar/line/trace, calculation/query propagation, JSON/DSL/folder/notebook/sheet persistence, atomic Apply/history, refresh. Docs `/docs/temporal-preparation`; runnable `/examples/temporal-basics`. | A hidden legacy consumer or metadata bridge reinterprets a prepared value. |
| **M2 — Authored zones** | Local wall input with explicit IANA source zone and fold policy; independent display/group zones; correct DST periods; zone-aware filters/traces/presets; complete save/reopen/writeback/refresh. Docs section “Time zones and repeated times”; runnable `/examples/temporal-zones`. | Zone roles are conflated, or calendar stepping uses fixed milliseconds. |
| **M3 — Month labels** | True year-month preparation, ordering/filtering, month/year views and traces, query/calc metadata, persistence and refresh, with daily consumers explicitly ineligible. Docs section “Month labels”; runnable `/examples/temporal-months`. | First-of-month timestamp behavior leaks back into public meaning. |

Every milestone includes keyboard operation and real-browser checks at **1280, 783, and 390 px**. Reuse the existing responsive grid and field-sheet patterns. Keep Apply/Reset/Cancel reachable while examples scroll; bound long zone names and failures; preserve focus and nested Escape behavior. Verify hover-independent accessible names and distinguish the two fold occurrences. At 783 px, preserve the current view-only grid behavior; at 390 px use the existing narrow sheet treatment without viewport overflow. Opening a temporary editor must not rewrite chart placement.

Docs and runnable examples are part of each release, including catalogue/coverage/live-example registration and compiler round-trip tests. The worker should add a package changeset, use targeted tests during development, and run `pnpm check` once for the finished broad change, consistent with the supplied governance. This report does not perform those repository actions.

## 13. Stable recommendation register

IDs are stable references for Codex dispositions and review. **Build** means part of a named milestone; **Explore** is bounded optional investigation; **Defer** is deliberately outside these releases; **Avoid** is an explicit rejected approach.

| ID / disposition | Recommendation | Delivery or reason |
|---|---|---|
| **TP-001 — Build** | Canonical scalar strings plus authoritative minimal temporal metadata and private comparison keys. | M1 foundation throughout the usable slice. |
| **TP-002 — Build** | Civil dates independent of instants/zones; ISO calendar, strict complete dates. | M1. |
| **TP-003 — Build** | Offset instants normalized to exact integral milliseconds, with strict no-rounding precision. | M1. |
| **TP-004 — Build** | Explicit Unix seconds/milliseconds; exact decimal conversion and no unit inference. | M1. |
| **TP-005 — Build** | Whole-source preview, separate statuses, all-failure review, draft reset/cancel, atomic Apply. | M1; ambiguity review added in M2. |
| **TP-006 — Build** | Typed calendar/instant/status predicates and same-kind comparison. | M1; named zones M2; months M3. |
| **TP-007 — Build** | Shared typed period predicates, projected-date membership, stable existing domains, exact contributors and current trace mechanisms. | M1; zone-aware periods M2. |
| **TP-008 — Build** | Single preparation owner; source/query/calculation metadata propagation before dependent evaluation. | M1. |
| **TP-009 — Build** | Validated JSON/text/folder/notebook/sheet round trips and explicit shared-definition writeback. | Every milestone, beginning M1. |
| **TP-010 — Build** | Atomic invalidation, stable callback/history normalization, refresh versus replacement, key-aware selection. | M1 and extended in M2/M3. |
| **TP-011 — Build** | Independent source/display/group zones; gaps reject and folds require a declared policy. | M2. |
| **TP-012 — Build** | One private pinned Temporal polyfill adapter for named-zone work; no new M1 dependency. | M2. |
| **TP-013 — Build** | True year-month labels with month/year consumers and no phantom daily event. | M3. |
| **TP-014 — Build** | Finite consumer inventory, exact fixture tests, docs/live examples, keyboard and three-width acceptance. | Release criterion for each milestone. |
| **TP-015 — Build** | Preserve descriptor-less legacy behavior and offer explicit previewed migration. | M1. |
| **TP-016 — Explore** | Optional export of frozen canonical preparation/provenance for exact cross-rules reproduction. | Only if portability requirements justify it; no registry or bundled tzdb prerequisite. |
| **TP-017 — Explore** | Measure polyfill bundle delta, preparation cost, and interaction cost; optimize based on measurements. | Bounded M2 engineering evidence, not an outside demand study. |
| **TP-018 — Defer** | Standalone unresolved wall-time fields, fiscal/non-ISO calendars, scheduling, first-class duration platform, new rolling/rank/difference estimators. | Separate capabilities with distinct consumers. |
| **TP-019 — Defer** | Microsecond/nanosecond public storage and broad transport compatibility. | Integral ms matches present architecture; precision rejection is explicit. |
| **TP-020 — Avoid** | Epoch guessing, implicit browser zone, per-row format inference, temporal row deduplication, public per-cell Date/Temporal objects, silent gap shifting. | Each hides or changes meaning. |
| **TP-021 — Avoid** | Blocking delivery on unrelated open research PRs, outside demand validation, or a usability-study gate. | Byron's request is the demand; the feature can be built on the stated baseline. |
| **TP-022 — Build** | Truthful engine/rules provenance and separation of checked facts from proposed behavior. | Every milestone, especially M2. |

## 14. Risks, defaults, and remaining questions

### Material risks and mitigation

- **Double preparation or dropped metadata:** the highest application risk. Carry canonical meaning and owner references through every reader/compiler boundary and test an epoch source through query → notebook → provider. One failed bridge can turn valid ISO output back into an invalid epoch input.
- **Partially committed interpretation:** computing rows, clearing filters, and updating metadata in separate observable steps produces mixed states. Build the next revision before a single store commit; callbacks alone are not the transaction boundary.
- **Formula behavior:** the supplied calculation engine internals are missing. Inspect its dependency and comparison execution points. Normalize at each output and retain type context, with targeted dependent-calculation tests. Do not defer this to an unspecified later consumer migration.
- **Status collapse:** both missing and invalid currently can have no prepared scalar. Keep the sidecar authoritative and require exact status-filter membership tests.
- **DST and uncommon midnight transitions:** test gaps, folds, 23/25-hour days, repeated boundaries, midnight gaps, a skipped date, and a date reversal with disjoint membership. Keep source resolution, calendar membership projection, and boundary description separate; one UTC envelope is not universally a calendar predicate.
- **Misleading reproduction promises:** stored zone names and a pinned library do not freeze tzdb. Surface known context changes and label unknown provenance accurately; reserve stronger frozen exports for a later option.
- **Notebook writeback loss:** field interpretation is shared authored state. Validate minimal splices by recompiling before accepting the UI commit, and cover all sheets and host callback echo.
- **Unkeyed refresh:** positional row IDs are not durable. Preserve semantic predicates and real keys; clear unreconcilable positional selection instead of following an index.
- **Consumer breadth:** calendar and line are not the only date consumers. Inventory every central parser/rollup call in the actual checkout, then adapt supported kinds or show explicit ineligibility in the same milestone.

### Defaults decided by this report

No answer from Byron is needed to proceed with UTC defaults, ISO calendar, exact millisecond precision, reject-by-default ambiguity, explicit epoch units, three independent zone roles, separate source refresh, or the three-release order. These are decisions, not research questions left to the worker.

The remaining implementation questions are bounded:

1. Which unsupplied calculation AST/evaluator hooks best preserve field metadata and normalize each dependent output? Inspect and choose the narrowest existing extension point.
2. Which current shared field-details component and project source editor own the new draft controls? Reuse the existing UI pattern; do not invent a parallel editor.
3. Does the current saved-data validator permit the proposed additive fields under its existing envelope, or require an explicit envelope version increment? Preserve old imports either way; do not silently strip meaning.
4. What measured bundle and preparation cost does the pinned M2 adapter add in the real application build? Record it and optimize only a demonstrated problem.
5. Is a frozen prepared export worth a later feature? This is optional and does not block ordinary raw-plus-recipe saves.

## 15. Final access and handoff record

### Files read in full

The following 40 files were read from the supplied packet at the stated baseline:

```text
AGENTS.md
README.md
package.json
CODING_STANDARDS.md
docs/agent-guide.md
docs/ui-defaults.md
docs/research/DIRECTION.md
docs/intent/date-time-handling/intent-brief.md
docs/intent/calendar-period-analysis/intent-brief.md
docs/intent/research-ideas-100/ideas/R032-temporal-meaning-contract.md
packages/explorEDA/src/lib/valueParsing.ts
packages/explorEDA/src/lib/valueParsing.test.ts
packages/explorEDA/src/lib/fieldSettings.ts
packages/explorEDA/src/lib/fieldSettings.test.ts
packages/explorEDA/src/lib/dailyRollup.ts
packages/explorEDA/src/lib/datePresets.ts
packages/explorEDA/src/lib/datePresets.test.ts
packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts
packages/explorEDA/src/providers/DataLayerProvider.tsx
packages/explorEDA/src/test/providers/fieldSettingsProvider.test.tsx
packages/explorEDA/src/types/SavedDataStructure.ts
packages/explorEDA/src/types/FilterTypes.ts
packages/explorEDA/src/hooks/applyFilter.ts
packages/explorEDA/src/components/charts/DataTable/components/ColumnFilter.tsx
packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts
packages/explorEDA/src/components/charts/Calendar/calendarPlan.ts
packages/explorEDA/src/components/charts/Calendar/calendarPlan.test.ts
packages/explorEDA/src/types/AnalysisProject.ts
packages/explorEDA/src/lib/analysis/evaluateProject.ts
packages/explorEDA/src/lib/project/analysisText.ts
packages/explorEDA/src/lib/project/folder.ts
packages/explorEDA/src/lib/dsl/schema.ts
packages/explorEDA/src/lib/dsl/export.ts
packages/explorEDA/src/lib/notebook/readNotebook.ts
packages/explorEDA/src/lib/notebook/compileNotebook.ts
packages/explorEDA/src/lib/notebook/writeBack.ts
packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx
apps/demo/src/docs/pages/calendar.mdx
apps/demo/src/docs/pages/notebooks.mdx
apps/demo/src/demos/examples.ts
```

### Relevant imports not supplied

Inspect these in the implementation checkout before editing: `utils/saveDataUtils.ts`; `types/ChartTypes.ts`; `types/SavedDataTypes.ts`; declared-field-type and field-profile helpers; `providers/lib/dataLayerState.ts`; `carryRowSelections.ts`; `hooks/CrossfilterWrapper.ts`; calculation state/engine and formula AST/dependency code; `lib/dsl/compile.ts`, `settingKeys.ts`, and project grammar; `lib/project/snapshots.ts`; project source editors/folder writeback; annotation resolver/validator/status modules; trace and additional temporal renderers; the field-details UI owner; and demo history/docs catalogue/coverage/live-example modules. Some are named in the agent guide or imported by supplied files; their internals were not read and are not presented as verified.

### Checked versus proposed

- **Checked:** complete packet and prompt; baseline behavior by source/symbol; current official documentation; seven original-parser assertions; independent epoch, offset, membership, DST, refresh, and uncommon-boundary calculations.
- **Proposed:** the complete new model, metadata/API shapes, semantics, UI, persistence changes, three implementation milestones, and their tests/browser acceptance. No repository implementation, commit, push, merge, deployment, or provisioning occurred.
- **Deliverables:** this [temporal preparation report](temporal-preparation-report.md) and the complete [implementation plan](implementation-plan.md); both are also provided in `temporal-preparation-design.zip`.
- **Open questions:** the bounded implementation choices in section 14. None is an external demand or usability gate, and none prevents beginning M1.
