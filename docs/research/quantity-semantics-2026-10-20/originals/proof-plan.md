# Quantity semantics: proposed proof plan

**Research date:** 2026-10-20. **Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA). **Source commit:** [`9b16d78e3ed0742ed4d5858c1939fec9e758b510`](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510).

**Research access: GO. Feature adoption: NO-GO.** The required scientific examples, formatting/settings contract and calculation contract are accessible. No observed repeated author task has rejected existing controls. The single bounded candidate is a lesson using existing labels, descriptions and explicit calculations, after the existing local selection/export/undo/reopen proof. All implementation remains proposed.

## 1. Evidence and execution boundary

The authorized packet contains 38 text entries: 35 baseline files, two local research additions and one navigation summary marked historical at `3d1ffebb`. The packet is a selected snapshot, not a runnable checkout. All entry byte counts and SHA-256 hashes were verified; connected GitHub resolved the exact baseline and exposed the field-settings file at that ref. This does not establish that every repository file was inspected or that the application ran.

This plan distinguishes five evidence classes:

- **Observed source:** the code and authored examples cited below were read. Test-source assertions are statements about intended coverage, not passed tests.
- **External fact:** scientific conversion rules need primary metrology evidence. Links are supplied alongside the scientific fixture contracts.
- **Independent arithmetic:** 43 exact rational assertions ran using Python's standard-library `fractions.Fraction`; all passed. No repository implementation was imported or evaluated.
- **Proposed policy:** treatment of references, invalid declarations and scientific aggregation is explicit author/reviewer policy for each fixture. No default is adopted for unknown meaning.
- **Unrun application proof:** parsing these exact formulas, UI interaction, rendered formatting, selection, traces, export, undo, restore, documentation gates and repository tests remain unexecuted.

The CSV files underlying Nile, CO₂ and El Niño were not supplied. The fixtures below are synthetic and do not recompute the corpus findings. They provide independent expectations for a future proof; they are not demand evidence.

## 2. Current controls are the comparator

Existing `FieldSettings` already supports `label`, `description`, `format`, `precision`, `unit`, `currency`, `type`, `datePreset` and `nullTokens`. `getFieldLabel` appends unit text; `formatFieldValue` produces display strings; `applyFieldSettings` invokes input conversion for type/null/date settings, not for unit alone. A unit-label edit therefore has no dimensional-conversion branch in the inspected source. This source conclusion still needs an interaction check before reporting application behavior. [S1]

Existing calculations can express explicit numerical transformations. `Calculator.evaluateValue` supports arithmetic, conditional branches, short-circuit logic and division-by-zero rejection. `CalculationManager.traceRow` records the expression, inputs, steps and dependency traces. None of these inspected contracts carries enforced physical units or reference populations. A successful calculation can still answer the wrong scientific question. [S2] [S3]

The existing field inspector has Description and Unit suffix inputs and applies them through `updateFieldSettings`. Its description display is truncated; the shared compact metadata tooltip does not include that description. Use these existing controls in the comparator, while keeping actual readability and interaction unverified. [S18] [S20]

Use these constraints when preparing the comparator:

- Use a **new result field**, preserving source values and stable row IDs. `CalculationManager.setCalculations` already rejects a result name that collides with a source field. [S2]
- Guard missing input explicitly. `if value == null then null else …` preserves valid zero. A truthiness guard can mistakenly discard zero. Null-returning calculated fields become unavailable in `CalculationManager`; successful query calculations can retain null. Assert semantic missingness separately from serialization details. [S2] [S3] [S4]
- Use `100000000` or `10 ^ 8`, not `1e8`: the inspected parser's number grammar contains ordinary decimal literals, with exponentiation as an operator. Dotted or spaced fields need bracketed string references, for example `["r.volume"]`. The formulas below were not parsed by the application. [S5]
- `sum`, `avg`, `min` and `max` in `calculationFunctions` operate within one row. `avg(co2)` does not compute an annual mean across rows. Prepare that reference upstream or use an explicit grouped query before calculating departures. Query aggregates support `count`, `sum` and `average` and record numeric contributors. [S4] [S6]
- Project source `FieldDefinition` has id/name/type. Saved `fieldSettings`, authored corpus sidecars and project declarations are different structures. Do not assume `fields.json` automatically populates runtime fields. [S7] [S8]

### Proposed comparator procedure

1. Give the author the relevant short lesson and one named scientific task. Record the declared quantity, unit representation, reference basis, row grain, intended aggregation and missing-value rule.
2. Show original columns. Apply a label/unit-only edit, then inspect stored numbers. Explain that the operation changes display.
3. Create a new derived field with an explicit formula. Set its label, unit and description, and display source and result side by side.
4. Select equivalent numerical ranges on original and derived values; compare exact IDs and contributors. Rounded labels are not membership evidence.
5. Inspect a positive, zero, valid negative and unavailable result. Trace the formula and supplied reference or duration.
6. Save settings separately from a full analysis; reopen against the appropriate source. `saveAnalysisToStructure` saves provider-input `rawData` plus settings/formulas; restore reapplies field settings and reconstructs calculations. In `ExplorEdaProject`, provider input is evaluated query rows, not necessarily original CSV rows. Check the boundary actually used. [S15] [S17]
7. Export selected records and inspect the actual file. The inspected `DataTable` resolves calculated columns and passes filtered rows to `DataTableToolbar`; `toTableCsv` emits field identifiers and scalar values, with null/undefined as blank, without a field-settings metadata envelope or display-unit formatting. Expect that documented source boundary, then verify the download. [S16]
8. Undo and redo the change. Perform real interaction at 1280, 783 and 390 px; screenshots alone do not establish correctness.

Observe correctness, recoverable errors, manual edits and completion time only when an author actually performs the task. No author outcome or time saving has been measured here. A repeated task that defeats this taught comparator is the prerequisite for considering structured metadata or conversion behavior.

## 3. M0: local trust remains first

**Recommendation relationship:** QS01. **Status:** proposed verification of existing behavior.

The existing trust intent explicitly puts one category selection across bar, card and exported rows before adding undo/restore and another chart family. Use this minimal order fixture first. [S9]

| id | category | amount |
| --- | --- | --- |
| o1 | A | 12 |
| o2 | A | 0 |
| o3 | A | null |
| o4 | B | 7 |

After selecting A:

- Source membership is `{o1,o2,o3}`; numeric contributors are `{o1,o2}`.
- Source-row count is 3; numeric-contributor count is 2; sum is 12; mean is 6.
- The missing amount does not remove o3 from the selected records. Zero contributes.
- A bar, card and exported selection must agree on these distinct membership and numerical expectations.
- Undo, redo and reopen must preserve the chosen interpretation. Stop at the first discrepancy and record a bounded repair rather than expanding the test matrix.

**Proposed destination:** `docs/intent/current-analysis-trust/intent-brief.md`, “Next step after confirmation.” This milestone adds no quantity feature. If it exposes a user-visible repair, name that repair's actual docs section and existing demo example in its own implementation milestone. No defect is established now.

## 4. Independent fixture contracts

Formula literals below use ordinary decimal notation compatible with the inspected grammar. Values are exact unless an approximation is explicitly marked. A future floating-point assertion should use an agreed numerical tolerance, such as `max(1e-12, 1e-12 × |expected|)` in test code, while checking exact membership separately. That tolerance is proposed test policy, not a scientific uncertainty estimate.

### F1 — scale conversion, zero, signed negatives and missingness

**Contract:** signed linear displacement, one measurement per row, common orientation and reference. Millimetres and metres express the same quantity here; the SI prefix fixes the factor of one thousand. Negative displacement is meaningful under this fixture contract. [E1]

| id | displacement_mm | Expected displacement_m |
| --- | --- | --- |
| s1 | 1000 | 1 |
| s2 | 0 | 0 |
| s3 | -500 | -0.5 |
| s4 | null | unavailable |

```text
if displacement_mm == null then null else displacement_mm / 1000
```

- A unit-only change from `mm` to `m` must retain the original numbers. That relabeling is deliberately an incorrect scientific presentation for this fixture, not a reported application bug.
- The explicit formula produces a separate `displacement_m` column. Source numbers remain available.
- The range `0 <= displacement_mm <= 1000` selects `{s1,s2}` and must match `0 <= displacement_m <= 1`. Missing s4 stays outside; zero remains inside.
- Add one invalid text case, `bad`, to an input-conversion preview. Expected treatment is unavailable with a parse-failure reason, not zero. Existing test source covers valid numeric text, a configured null token and failed numeric text, but was not executed. [S1]

### F2 — Celsius absolute values, temperature differences and observed bounds

**Contract:** Celsius temperature readings on the same measurement basis. They are not anomalies. The Celsius–kelvin relation uses an offset; a temperature interval has the same numerical magnitude in kelvins and degrees Celsius. Fahrenheit absolute conversion uses both scale and offset; Fahrenheit differences use the scale alone. The numerical examples below are independent arithmetic from those relations. [E1] [E2]

| id | temperature_c | Expected kelvin; Fahrenheit |
| --- | --- | --- |
| t1 | 20 | 293.15; 68 |
| t2 | 25 | 298.15; 77 |
| t3 | 0 | 273.15; 32 |
| t4 | -10 | 263.15; 14 |
| t5 | null | unavailable; unavailable |

```text
if temperature_c == null then null else temperature_c + 273.15
if temperature_c == null then null else temperature_c * 9 / 5 + 32
```

The difference t2−t1 is 5 °C, equivalently 5 K or 9 °F. Applying an absolute-temperature offset to the difference would incorrectly produce 278.15 K or 41 °F. The correct difference transform is a different explicit formula.

For membership, `20 <= temperature_c <= 25` and `293.15 <= temperature_k <= 298.15` select exactly `{t1,t2}`. The zero and negative Celsius readings are valid temperatures under this contract; a generic “negative is invalid” rule fails.

Use three synthetic monthly readings `[20,22,25] °C` to separate aggregation from unit conversion:

- Unweighted mean: `67/3 °C = 22.333333… °C`; converted mean: `17729/60 K = 295.483333… K` or `72.2 °F`.
- Observed minimum/maximum: 20/25 °C, 293.15/298.15 K, or 68/77 °F.
- Observed range: 5 °C, 5 K, or 9 °F. It is a difference, so no offset applies.
- Sum of individually converted readings: 886.45 K. Applying one offset to their numerical Celsius sum, 67, gives 340.15 K. The discrepancy is an arithmetic counterexample to indiscriminate unit propagation; neither sum is automatically a useful scientific summary.

With the same contributors and normalized weights, an affine transformation commutes with the weighted mean. That algebra does not choose appropriate weights, population or scientific meaning. For extrema, the ordinary positive scale conversions preserve ordering; uncertainty widths and temperature differences need separate handling from absolute interval endpoints.

El Niño's existing sidecar and design already describe unweighted monthly means, observed extrema and a range that is not uncertainty. This proof must retain that distinction; it is not a proposal to repair a proven interval bug. [S10] Primary definitions distinguish confidence intervals and measurement uncertainty from those observed bounds. [E4] [E5]

### F3 — accumulated annual volume versus interval mean rate

**Contract:** synthetic accumulated volume in `10^8 m³`, with a separately declared interval duration in seconds. These durations are supplied fixture facts; do not infer seconds from the word “year.”

| id | volume / interval_s | Expected total m³; interval mean m³/s |
| --- | --- | --- |
| v1 | 315.36 / 31536000 | 31536000000; 1000 |
| v2 | 315.36 / 31622400 | 31536000000; 182500/183 ≈ 997.267759563 |
| v3 | 0 / 86400 | 0; 0 |
| v4 | null / 86400 | unavailable; unavailable |
| v5 | 1 / 0 | 100000000; unavailable, zero duration |
| v6 | 1 / null | 100000000; unavailable, missing duration |

Here `volume` is the numeric value in the stated scaled unit.

```text
if volume == null then null else volume * 100000000

if volume == null || interval_s == null || interval_s <= 0
then null
else volume * 100000000 / interval_s
```

Both v1 and v2 rate results are **interval means**. Neither establishes instantaneous discharge. USGS defines discharge as volume per unit time. Our interval-average conclusion follows from the fixture definition and division, rather than from an observed hydrograph. [E3] A scale conversion to cubic metres preserves a total; dividing by an explicit interval changes the quantity being reported. Duration, accumulation coverage and the physical observation remain author responsibilities.

Retain a separate reason/status for missing or nonpositive duration; a null-return formula alone cannot explain exclusion. Negative duration is invalid under this fixture contract. Negative volume needs a declared gross-volume versus signed-net-flow interpretation; no universal negative-value policy is proposed.

Nile's existing composition already calls its path annual volume and labels “Annual flow at Aswan (10^8 m3).” Its design describes annual volumes at Aswan and limits the historical comparison. This fixture is a teaching/review case, not evidence that the chart computes a wrong quantity. [S11]

### F4 — raw concentration and departures from a supplied reference

**Contract:** concentration expressed as volume fraction in ppmv for this synthetic fixture. The basis is explicitly authored, not guessed from a bare `ppm` suffix. Centers are prepared from available measurements in each full supplied year before later chart filtering.

| id/year | raw_ppmv / supplied_center_ppmv | Expected residual_ppmv |
| --- | --- | --- |
| c1/A | 400 / 402 | -2 |
| c2/A | 402 / 402 | 0 |
| c3/A | 404 / 402 | 2 |
| c4/A | null / 402 | unavailable |
| c5/B | 410 / 412 | -2 |
| c6/B | 414 / 412 | 2 |

```text
if raw_ppmv == null || supplied_center_ppmv == null
then null
else raw_ppmv - supplied_center_ppmv
```

Independent expectations:

- A's available-observation center is `(400+402+404)/3 = 402`; B's is `(410+414)/2 = 412`. Missing c4 supplies no zero measurement.
- c1 and c5 share residual −2 while their raw concentrations are 400 and 410. Matching units and residuals do not establish equal concentration.
- Selecting year A with raw concentration at least 402 yields `{c2,c3}`. Their fixed-reference residuals stay 0 and 2, mean 1.
- Recentring those selected rows would instead use 403 and produce −1,+1, mean 0. That is a different analysis, which must be chosen explicitly.
- Tracing should expose both supplied inputs; the inspected row-step trace uses scalar strings and shows the formula/dependencies, without proving every trace variant carries field display settings. A standalone CSV omits descriptions, so retain the center as an exported column and use meaningful result identifiers or accompanying analysis documentation when the downstream task needs that context. These are proposed author practices, not a claim that metadata export exists. [S16] [S19]

The CO₂ sidecar already names ppmv and the annual available-week reference, and the notebook explains that its zero differs by underlying year. It also warns about partial years, missingness and the limits of centering. The proposed proof examines whether existing controls can carry that explanation through the task. It does not claim the corpus lacks the explanation. [S12]

### F5 — display percentages and pre-scaled percentages

| Source / chosen action | Expected stored number | Expected display magnitude |
| --- | --- | --- |
| 0.5; `format=percent` | 0.5 | 50% |
| 50; `format=number`, `unit=%` | 50 | 50 followed by the unit suffix |
| 50; `format=percent` | 50 | 5000%, an incorrect chosen contract for a 50-percent source |
| New fraction `50 / 100`; `format=percent` | Source 50; derived 0.5 | 50% |

`formatFieldValue` sets `Intl.NumberFormat` percent style; formatting does not redefine the stored fraction. Exact punctuation, grouping and spacing are future application assertions, not results of the arithmetic check. [S1]

This fixture concerns numeric representation and display. Grouped-rate denominators remain owned by the completed rates research and `reusable-analysis-metrics`; a row-level percentage is not a ratio-of-totals definition. Do not repeat that survey here. [S13]

### F6 — declarations that cannot safely be guessed

| Supplied case | Proposed expected decision | Current-controls comparator |
| --- | --- | --- |
| m1: value 1, unit m; m2: value 100, unit cm | Both explicitly normalize to 1 m | Preserve raw unit/value columns; create a separate normalized result. |
| m3: value 1, unit s | No distance conversion | Retain incompatible declaration and reason; do not merely relabel it m. |
| m4: value 1, unit absent | Meaning absent | No conversion claim until source meaning is supplied. |
| m5: value 1, unit explicitly unknown | Meaning unresolved | Retain unknown and provenance; do not default to SI. |
| Field says m; source/row says cm or mass | Conflict unresolved | Stop semantic conversion and ask the author to resolve the declaration. |
| Same suffix ppm, different mass/volume bases | Suffix insufficient | Require the quantity basis and explicit scientific method. |
| Currency label USD changed to EUR | No exchange established | Numeric amount stays unchanged; source rate/date/basis must be explicit for conversion. |

For the known m/cm case only, the existing scalar grammar can express this proposed branch:

```text
if value_unit == "m" then value
else if value_unit == "cm" then value / 100
else null
```

Preserve a separate reason field for rejected/unknown rows. One field-level unit cannot accurately describe mixed per-row numeric representations before normalization. An explicit declaration system could check dimension compatibility after declarations exist; it cannot discover scientific correctness from a label. Unknown, absent and inconsistent declarations remain different author states, even if their proposed calculated result is unavailable in all three cases.

## 5. Propagation rules to review before any feature

QS03 concerns explicit formulas and authored meanings; QS04 and QS05 remain deferred. No automatic propagation is proposed.

- **Addition/subtraction:** declarations must establish compatible quantities and references; subtracting two absolute temperatures produces a difference. Compatible dimension alone does not establish compatible baseline or intended comparison.
- **Multiplication/division:** dimensions may be mechanically composed from declared units, but the operation's scientific meaning and reference remain authored. Volume divided by duration yields an interval mean under the stated contract.
- **Sum:** even unchanged units do not prove additivity. Summing totals requires appropriate nonduplicated grain and coverage. Summing concentrations or absolute temperatures needs a separately justified task.
- **Average:** define contributors and weights. Same unit does not validate equal month/week weighting or a mean of heterogeneous references.
- **Min/max and ranges:** absolute bounds transform as absolute values; widths and differences transform without affine offsets. Observed bounds do not become statistical uncertainty after conversion.
- **Centered values:** retain the reference population and whether it is fixed before filtering. The numeric unit alone does not identify that reference.

These are review constraints, not an adopted semantic type system. A proposed `referenceNote?: string` would be descriptive, unenforced and potentially duplicate `description`. It earns investigation only if a repeated task shows that the existing description route fails and the new field demonstrably helps. No implementation milestone for that property or for a conversion engine is opened by this plan.

## 6. M1: one bounded lesson, then stop

**Recommendation relationship:** QS02, with QS03 guardrails. **Status:** proposed, contingent on M0 and a chosen author task. No application change is included in this research.

Keep the live example focused on source preservation, explicit scale conversion and a declared reference: F1 and F4. F2, F3, F5 and F6 are review fixtures and teaching counterexamples, not permission to build six tools or a notebook. One small comparison is enough to test whether current controls serve the task.

Docs and example belong to the same proposed milestone:

- **Intent:** `docs/intent/scientific-multivariate-analysis/intent-brief.md`, proposed “Quantity meaning” subsection. Record the chosen task, feature NO-GO and reopen gate.
- **Fields docs:** `apps/demo/src/docs/pages/fields.mdx`, proposed “Units, stored values, and scientific reference” section.
- **Calculation docs:** `apps/demo/src/docs/pages/calculated-fields.mdx`, proposed “Explicit scientific transformations” section.
- **Example:** proposed new `apps/demo/src/demos/quantityMeaning.ts`, registered through `apps/demo/src/demos/examples.ts`, `apps/demo/src/demos/coverage.ts` and `apps/demo/src/docs/live/examples.ts`.
- **Existing examples:** link the CO₂ centering notebook, Nile flow-boundary design and El Niño observed-range design. Preserve their already explicit meanings. [S10] [S11] [S12]

These are exact proposed destinations, not existing implementation claims. Registration and docs requirements come from `docs/agent-guide.md` and `AGENTS.md`; the registration files were not executed. [S14]

Reject M1 as unnecessary if the author already succeeds with the current controls and current explanations. Prefer upstream preparation when the reference definition or normalization belongs in a reproducible data preparation step. Escalate to a narrowly defined metadata comparison only if a named repeated task fails the taught current flow. A conversion/checking engine remains NO-GO when quantity meaning is unknown, source values would be silently reinterpreted, incompatible declarations are unexplained, or solving the case requires a broad engine.

## 7. Proposed checks and execution receipt

| Check | Status in this research |
| --- | --- |
| Packet bytes and SHA-256 for 38 entries | Actually checked; all matched. |
| Exact-ref GitHub availability | Actually checked for commit and field-settings file. |
| Source/test-source and example review | Actually performed; source assertions only. |
| Exact rational numeric fixtures | Actually run: 43 assertions passed, 0 failed. |
| Formula parser, calculation manager, query evaluator | Not executed. |
| Vitest, docs gate, typecheck, build, full repository suite | Not executed. |
| Browser interaction at 1280/783/390 px | Not executed. |
| Author comparator, export/undo/reopen, performance | Not executed. |
| Pint/xarray/desktop/visualization systems | Documentation research only; no third-party program executed. |

The following is a **future run sheet for Codex in a real checkout**, not a log of commands run here. Execute only when the later proof/integration task is assigned. The supplied path describes the developer's checkout, not this scratch environment.

```bash
# Proposed later checks in the real checkout; none ran during this research.
cd /Users/byronwall/Projects/explorEDA

# Existing source-contract tests; passing alone does not prove the UI workflow.
pnpm --filter exploreda exec vitest run src/lib/fieldSettings.test.ts src/test/providers/fieldSettingsProvider.test.tsx

# For the proposed lesson/example milestone, if adopted.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Run once before a later review PR when required by that change's scope.
pnpm check

# Separately perform the declared real browser steps at 1280, 783, and 390 px.
# Capture exact selected IDs, contributors, saved settings, and exported records.
# Stop at the first unexplained disagreement; record a bounded finding.
```

### Acceptance and rejection record to collect later

For each attempted case record source rows, declared scientific contract, formula text, expected numeric values, selected IDs, actual results, trace evidence, saved artifact, exported artifact and an outcome. “Unavailable with reason” is a valid expected result where meaning or input is missing. Do not turn a scientific ambiguity into a pass by selecting a convenient default.

A single arithmetic failure rejects the candidate implementation; it does not establish product demand. A repeated author task that still fails after a fair lesson can reject the current-controls alternative. Human review must then choose the interpretation and smallest public surface. Otherwise stop after M1 and keep feature adoption NO-GO.

## Source references

All repository links below are pinned to the declared source commit. Local queue and historical navigation evidence are identified separately in `research-queue.md`.

[S1]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/fieldSettings.ts
[S2]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/CalculationState.ts
[S3]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/engine/Calculator.ts
[S4]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[S5]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/parser/semantics.ts
[S6]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/calculations/functions/registry.ts
[S7]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/AnalysisProject.ts
[S8]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/SavedDataStructure.ts
[S9]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[S10]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/elnino/fields.json
[S11]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/nile/flow-boundary.eda
[S12]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/public/daily-viz/projects/co2/seasonal-centering.eda.md
[S13]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/reusable-analysis-metrics/intent-brief.md
[S14]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md
[S15]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx
[S16]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx
[S17]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/ExplorEdaProject.tsx
[S18]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx
[S19]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/ChartTraceDetails.tsx
[S20]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/FieldMetadata.tsx

- [S1] `FieldSettings`, `getFieldLabel`, `formatFieldValue`, `applyFieldSettings`; supporting test source: `packages/explorEDA/src/lib/fieldSettings.test.ts` and `src/test/providers/fieldSettingsProvider.test.tsx`.
- [S2] `CalculationManager.setCalculations`, `traceRow`, `executeCalculation`; [S3] `Calculator.evaluateValue`.
- [S4] `calculateFrame`, `aggregateFrame`; [S5] `grammarSource`, `parseExpression`; [S6] `numericValue`, `calculationFunctions`.
- [S7] `FieldDefinition`; [S8] `SavedDataStructure` and `SavedAnalysisStructure`.
- [S9] existing trust intent, last-updated field 2026-10-06; [S13] existing rates intent, last-updated field 2026-10-06. These are intent records, not fresh runtime passes.
- [S10] `r` and `annual` field metadata; also read `elnino/observed-range.eda` and `observed-range.design.md` at the same baseline.
- [S11] annual-volume composition; also read `nile/flow-boundary.design.md` at the same baseline.
- [S12] existing centering lesson; also read `co2/fields.json` at the same baseline.
- [S14] exact docs/example registration route and verification commands; `AGENTS.md` pairs docs and demos in user-visible milestones. Current `fields.mdx` and `calculated-fields.mdx` were read before proposing additions.

- [S15] `saveToStructure`, `saveAnalysisToStructure`, `restoreAnalysisFromStructure`; [S17] evaluated-query data passed to `ExplorEda`.
- [S16] `toTableCsv`; supplying call chain read in `components/charts/DataTable/DataTable.tsx`, `resolvedRows` and the toolbar receiving `filteredRows`.
- [S18] `FieldInspector` Description/Unit suffix inputs and Apply action; [S19] `showTraceValue` and `ChartTraceRowSteps`; [S20] shared `FieldMetadata` tooltip content. Selected excerpts of these exact-ref additions were read; no runtime path was exercised.

### External scientific references

All five official sources were opened on 2026-10-20. They establish scientific definitions, not application behavior. Numerical fixture values and counterexamples are independently calculated arithmetic under those definitions.

[E1]: https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-EN.pdf
[E2]: https://www.nist.gov/pml/owm/si-units-temperature
[E3]: https://www.usgs.gov/water-science-school/science/how-streamflow-measured
[E4]: https://www.itl.nist.gov/div898/handbook/prc/section1/prc14.htm
[E5]: https://jcgm.bipm.org/vim/en/2.26.html

- [E1] BIPM, *The International System of Units*, 9th edition, version 4.01, June 2026: section 2.3.1 (kelvin/Celsius relationship and temperature intervals), section 3/Table 7 (decimal prefixes). The edition/version were visible on the retrieved document.
- [E2] NIST, *SI Units – Temperature*, updated 2026-06-17: exact temperature-conversion table and interval relation.
- [E3] USGS, *How Streamflow is Measured*, “The discharge measurement”: discharge definition. No application or corpus result is inferred from that article.
- [E4] NIST/SEMATECH, *What are confidence intervals?*: population-parameter and repeated-sampling interpretation; no page publication date shown.
- [E5] JCGM VIM3 §2.26, *Measurement uncertainty*: definition and notes; informative annotation dated 2013-12-05.
