# Quantity-aware calculations: implementation plan

Implement opt-in, strictly checked quantity formulas over the existing scalar expression AST, with explicit source declarations, explicit converted fields, and compiler-planned numeric conversions. Preserve ordinary numeric rows, the existing calculation editor, raw source data, and the distinction between row formulas and ordered project query steps. Ship the complete capability in four usable milestones: linear calculations and persistence; temperature and all aggregate consumers; project/query/folder propagation; then notebook writeback and complete portable export.

## 1. Baseline, authority, and evidence status

The implementation baseline is `9d64a021e35d312887b1bc848e307f42b6c3091f`. The supplied packet contains complete selected files; it is not a runnable checkout. The research read the 48-file packet and expanded decisive missing adapters through exact-commit source access. This plan names existing files verified in that evidence. Proposed modules and tests are explicitly identified as new. All application, browser, and integration checks below are **proposed acceptance tests**, not claims of executed tests. Independent arithmetic checks establish fixture expectations; they do not establish implementation behavior.

Byron's requested capability is the demand. Implement the feature; do not repeat the October 20 adoption/deferral decision. Numeric preparation PR #531 and temporal preparation PR #532 are unbuilt proposals and are not dependencies. Fixed numeric durations belong here; timestamps, epochs, calendar months/years, and temporal interpretation remain outside this feature.

Keep React, TypeScript, and pnpm. Follow `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, and `docs/ui-defaults.md`. The [baseline provider](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/providers/DataLayerProvider.tsx), [calculation manager](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/calculations/CalculationState.ts), and [query evaluator](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/analysis/evaluateProject.ts) establish the current scalar and ownership boundaries.

**Path convention:** unless prefixed with `apps/`, `docs/`, or `packages/`, paths below are relative to `packages/explorEDA/src/`. This keeps the change lists readable without introducing ambiguous module names.

## 2. Implementation contracts

### 2.1 Authored types and ownership

Add the following shared types in new `lib/quantities/types.ts` and export the public declaration type through the package's existing public type exports:

```ts
type QuantityDeclaration = {
  unit: string;
  role: "linear" | "temperature-reading" | "temperature-difference";
  meaning?: {
    kind?: string;
    reference?: string;
  };
};

type QuantityCalculation = {
  result?: QuantityDeclaration;
};
```

Add `quantity?: QuantityDeclaration` to standalone source `FieldSettings` and project source `FieldDefinition`. Add `quantity?: QuantityCalculation` to `CalculationDefinition`, `SavedCalculation`, and `CalculateStep`, and `quantity?: { result: QuantityDeclaration }` to `AggregateMeasure`. An omitted formula member preserves existing scalar execution. Its presence selects strict checking; `{}` permits draft inference or a checked nonnumeric result. On Apply, persist the full resolved quantity contract of every numeric calculated or query-aggregate result. Checked Boolean/text results have no numeric `result` declaration. An aggregate's contract is its output boundary, not a duplicate source declaration.

Use one authored owner per live field:

| Field | Canonical owner |
| --- | --- |
| Standalone raw input | `FieldSettings.quantity` |
| Project source input | `FieldDefinition.quantity` on its defining source |
| Local calculated field | Its calculation definition's `quantity.result` |
| Query calculated field | Its `CalculateStep.quantity.result` |
| Query aggregate result | Pinned output contract on `AggregateMeasure.quantity.result`, validated against the inferred statistic output |
| View of a project/query field | Readonly inherited environment, never a competing physical declaration in view settings |

Resolved dimensions, conversion factors, plans, validity status, and aggregate output descriptors are runtime products. Do not serialize them as another authority. A full standalone snapshot is the explicit exception: it needs resolved declarations describing the exported input columns because the original project is absent.

### 2.2 Scientific and numeric rules

- No declaration means **unknown quantity**, not dimensionless. Explicit unit `1` means dimensionless. `%` has scale `0.01`; `ppm` has scale `0.000001`.
- The legacy `FieldSettings.unit` remains cosmetic text. Neither that suffix, a column name, a number-format choice, nor daily `fields.json` establishes a declaration.
- Checked formulas use ordinary numbers in compiler-known representations. Precompile conversions on AST edges; keep caches and public columns as projected magnitudes in their declared output representation.
- Addition/subtraction/comparison normalize compatible operands. Linear addition normally uses the left operand's representation. Conditional branches join into one fixed representation; the selected branch is converted before returning its scalar.
- Multiplication/division/powers combine dimensions and scales, then choose deterministic canonical compound units. Do not infer energy, torque, or another scientific meaning merely by naming a compound `J` or `N*m`.
- Unit-bearing constructors `qty`, `temp`, and `delta` accept a numeric constant expression or one undeclared numeric source/legacy scalar calculated field. Reject already quantity-bearing operands, including an explicitly dimensionless field. Reject `qty(unknownA + unknownB,"m")`: declare the inputs or first define that scalar result and construct from its single field. The constructor records an explicit author assertion; it is not suffix inference.
- `convert(typedValue, "unit")` changes representation while preserving role. Its target unit is a static string. It cannot establish a missing unit or cross a currency/reference incompatibility.
- Unknown quantity can flow into `== null`, `!= null`, and `count(...)`; reject it when magnitude arithmetic or a checked numeric result needs a declaration. Do not reject every identifier before its use is known.
- Bare numbers are dimensionless, including zero. Null is a permitted missing branch, not zero. Check both conditional branches statically while retaining runtime short-circuit behavior.
- Optional `meaning.kind` and `meaning.reference` are exact opaque author keys. A declared mismatch blocks operations requiring comparability. Absent keys remain explicitly unchecked meaning. A result assertion fills only an unspecified inferred tag; it cannot override a known contradictory tag or bypass incompatible operands. Do not build an ontology or infer a scientific reference from a title.
- Ordinary linear/difference subtraction and reading-minus-reading preserve a common kind but clear the reference because they produce a contrast. The author may then name that derived reference, such as annual centering. As an operation-specific exception, reading + difference, difference + reading, and reading − difference preserve the reading's kind/reference; an explicit conflicting difference tag fails, while absent difference tags remain unverified in coverage without erasing the reading's known reference. Products/powers clear meaning, except that multiplication/division by an untagged dimensionless coefficient preserves the measured operand's meaning. Compare pinned result assertions with the current inference on every dependency edit.
- Preserve existing missing/non-finite/zero-denominator behavior, with quantity errors distinct from missing numeric data. Equality remains ordinary numeric equality after the defined conversion; do not silently introduce approximate equality.

### 2.3 Applied result identity and edit transactions

Freeze an applied calculated field's or query aggregate measure's complete unit/role/kind/reference contract under its existing field identity. Numeric expression/reducer edits are allowed when the contract stays valid. A representation or meaning change creates a new result field/measure ID, including when the application appears to find no consumers. This is simpler and more complete than a partial scan for every filter, axis range, bin edge, color stop, annotation, query, notebook reference, or external host use.

The ordinary conversion action therefore creates a checked field such as `speed_kmh = convert(speed, "km/h")`. Existing filters and bounds remain attached to the original field and its original numbers. There is no general numerical-bound migration in this release.

A chart-local statistic choice is a separate explicit configuration edit, not a reusable field-definition change. If its resolved output changes numerical representation, dimension, role, or asserted meaning, show the affected manual output domains/color thresholds and offer Reset to Auto in that Apply, or create a new chart. Include dimensionally compatible units with different scales. Enumerate the finite existing chart-owned output settings in tests. Preserve source-field filters and bins. This explicit chart-configuration reset does not migrate arbitrary field-bound numbers.

A source declaration correction is explicitly **reinterpretation**: raw and effective source magnitudes remain fixed. Preview their before/after meaning and transitive derived values. Same-source thresholds retain their numeric coordinates under the corrected interpretation; dependent thresholds retain their existing pinned output units. Recompile checked dependents before committing. Static incompatibility rejects a local Apply atomically, leaving the previous accepted state intact.

When an explicit source/dependency Apply first makes an existing reusable query aggregate quantity-aware, preview its inferred output contract and write that measure's `quantity.result` in the same canonical project-definition transaction. Commit every affected contract with the declaration, or reject if an owner cannot be updated. Untyped legacy aggregates stay unchanged. A loaded typed aggregate or numeric checked calculation missing a required result contract remains blocked but repairable through **Accept result contract**. Its draft may show inference; only explicit acceptance publishes numeric values and pins the owner. Do not silently migrate on load/save or rely on a runtime-only contract.

Externally loaded invalid semantics retain authored definitions and diagnostics, but affected values are unavailable. Keep invalid schema/plan status distinct from ordinary missing values. An active predicate consuming an invalid field blocks its affected result for **every** operator, including `neq` and `is-null`; it cannot broaden the population, turn invalid into ordinary null, or present a false zero count. Unrelated fields/views remain usable.

## 3. Milestone 1 — Linear checked row calculations with complete standalone persistence

**User outcome:** declare distance/duration/ratio/currency fields, create and inspect compatible checked calculations, create explicit converted fields, and save/reload them through settings JSON, analysis JSON, and Dashboard text. This milestone starts directly from the baseline. It does not need project queries, future preparation PRs, or notebook definition editing.

**Recommendations:** QC01–QC04, QC06–QC12, QC15, QC19; preserve QC22–QC23 scope limits.

### 3.1 Start here: concrete implementation order

1. Add the shared declaration/runtime types and a small owned unit resolver in new `lib/quantities/{types.ts,units.ts}`. Write the independent unit and declaration fixtures before integrating UI.
2. Add new `lib/quantities/analyze.ts`, which walks the existing AST, resolves quantity types, validates operations/functions, and produces per-node conversion operations plus result metadata. Reuse the current expression parser. Add only unit-string parsing; do not replace Ohm or add implicit `100 cm` expression syntax.
3. Wire the same compiled plan into `Calculator`, `CalculationManager`, batch output, and traces. Add new `lib/quantities/aggregate.ts` for linear statistic output descriptors and thread it through every existing aggregate adapter listed in §4.3 in this same milestone. Then wire provider declaration/definition transactions and previews. A source declaration must not fall through the current display-only `updateFieldSettings` branch.
4. Add new `lib/quantities/codec.ts` and complete JSON/Dashboard import/export before exposing quantity Apply. Check alias resolution and both calculation serialization helpers.
5. Add source/quantity controls to the actual editors, add the runnable example and docs, then verify wide/intermediate/narrow behavior and save/restore.

### 3.2 Finite units and unit-string grammar

Implement explicit atoms `1`, `%`, `ppm`, `m`, `cm`, `mm`, `km`, `hm`, `s`, `ms`, `min`, `h`, `d`, `kg`, `g`, `mg`, `L`, `mL`, `A`, `mol`, `cd`, `N`, `Pa`, `J`, and `W`. Thermal atoms and roles land in milestone 2. Currency atoms are explicit opaque codes, such as `currency:USD` and `currency:EUR`; matching a code does not prove ISO registration, market value, or exchangeability.

Support `*`, `/`, parentheses, and integer powers in unit strings. Require explicit multiplication; no automatic prefixes, word guessing, implicit multiplication, user-defined offset units, or case folding that merges distinct symbols. Canonical output is stable. `d` means a fixed 86,400-second duration; month/year are unsupported. Currency identity remains in the dimension/compatibility key, so USD cannot convert to EUR.

Check dimensions and factors with fixtures such as `100 cm = 1 m`, `1 L = 0.001 m^3`, `1 mL = 0.000001 m^3`, `1 hm^3 = 1000000 m^3`, `1 h = 3600 s`, `1 d = 86400 s`, and `1 N = 1 kg*m/s^2`. Return specific unsupported-unit or incompatible-unit diagnostics, not a fallback scalar result.

### 3.3 Existing runtime modules to change

- `lib/calculations/CalculationState.ts`: extend definitions; compile dependencies in topological order; retain plans and result descriptors; clear all result/error caches on semantic edits. Preserve name/cycle checks and the existing all-cache invalidation policy.
- `lib/calculations/engine/Calculator.ts`: accept an optional checked plan; execute its scalar conversions and operator rules; extend `CalculationStep` with quantity/conversion evidence. The unchecked path remains behaviorally unchanged.
- `lib/calculations/functions/registry.ts`: add signatures for the new functions and checked semantics for existing row functions. Constructor/conversion functions called in scalar mode fail with a mode-specific diagnostic. `sum`/`avg` continue to mean supplied arguments in one row.
- `lib/calculations/types.ts`: keep `CalculationValue` scalar; add only appropriate metadata/context types. Do not add public Quantity objects to `datum`.
- `lib/calculations/parser/semantics.ts`: retain the existing function/string grammar. Add parser tests proving unit strings and bracketed field names are preserved; do not change precedence incidentally.
- `providers/DataLayerProvider.tsx`: extend `toRuntimeCalculations`, `toSavedCalculations`, initialization, restore, `refreshCalculations`, and candidate semantic transactions. Preserve raw data. Build the complete candidate manager/metadata before the accepted store state changes. Use the existing state-change hold so one Apply yields one host history event.
- `lib/fieldSettings.ts`: add/validate quantity declarations separately from cosmetic suffix and input parsing. Use a shared resolved-quantity formatter for declared numeric magnitudes. Prevent percent-format multiplication from being applied a second time to an already-percent stored magnitude.
- `components/FieldMetadata.tsx`: expose quantity role, representation, owner, and validation state in field details; this component is not the only edit destination.
- `components/SummaryTable/components/FieldInspector.tsx` and `components/schema/SchemaInspector.tsx`: add the same source-declaration/impact UI. `WorkspaceFieldEditor` must not commit semantic edits through the existing blur-only cosmetic input route.
- `components/calculations/{CalculationEditor.tsx,CalculationForm.tsx}`: add mode, inferred result, explicit output representation, and diagnostics to the existing draft/preview flow. Include mode, result contract, and source-schema revision in preview keys, dirty-state comparisons, and effect dependencies.

**Linear aggregates ship here:** the same PR must install the minimal resolved-output descriptor adapter across every existing aggregate body and wrapper listed in §4.3, including pivot's private reducer and synthetic `measure` fields. For linear quantities, sum/average/min/max/median/mode/singleValue and standard deviation retain the input representation; count/countUnique use unit `1`; variance uses its squared unit. Existing reducers retain scalar values and contributor populations. Format results from the resolved statistic descriptor. Reject a genuinely unrecognized reducer on declared fields as an unsupported quantity operation instead of silently dropping metadata. Temperature readings are not yet accepted, so affine rules can arrive cleanly in milestone 2 without disabling useful linear summaries.

### 3.4 Standalone serialization and Dashboard text

Change `types/SavedDataStructure.ts`, `utils/saveDataUtils.ts`, and the provider converters. Validate declaration shapes and parse/recompile formulas during analysis validation using the same environment as the app. Keep the existing version-1 envelope and special-value handling; omitted optional properties are legacy. A structurally valid declaration is not evidence that its formula is dimensionally valid.

Change `lib/dsl/{parse.ts,compile.ts,export.ts,settingKeys.ts}`. The exact baseline `parseCalc` accepts a result name before `=` and takes the rest as expression; options before `=` require an intentional parser extension. Do not assume the compiler's generic pair handling already provides that syntax.

New authored syntax is:

```text
field distance quantityUnit="cm" quantityRole="linear"
field elapsed quantityUnit="s" quantityRole="linear"
calc speed check=quantity resultUnit="m/s" resultRole="linear" = distance / elapsed
calc speed_kmh check=quantity resultUnit="km/h" resultRole="linear" = convert(speed, "km/h")
```

Support `quantityKind`, `quantityReference`, `resultKind`, and `resultReference` as flat head keys mapped by the shared codec to nested declarations. Keep every calculation option before the expression `=`. Preserve legacy `calc name = expression`. A checked nonnumeric formula uses `check=quantity` without a result unit/role.

Compile field declarations after alias resolution and before executing calculations. Alias metadata belongs to the resolved native field; string unit/reference literals are not rewritten as field references. Export objects explicitly through the codec, never generic stringification. Update `FIELD_SETTING_WORDS`, `CALCULATION_COVERAGE`, and relevant setting-coverage tests. Pass the same semantics into export's skeleton compilation.

This shared DSL can read/write quantity text inside notebook blocks, but until milestone 4 the notebook UI must keep definition edits readonly or route to an existing owner. Do not accept a notebook quantity edit that chart-only writeback would discard.

### 3.5 Acceptance and targeted tests

Add new tests in `lib/quantities/{units.test.ts,analyze.test.ts,codec.test.ts}` and extend existing `test/lib/calculations/engine/Calculator.test.ts`, `test/lib/calculations/traceRow.test.ts`, `components/calculations/CalculationEditor.test.tsx`, `lib/fieldSettings.test.ts`, and `test/providers/fieldSettingsProvider.test.tsx`. Extend verified existing DSL tests `lib/dsl/{parse.test.ts,compile.test.tsx,export.test.ts,settingKeys.test.ts}`. Use actual repository tests for saved-data validation; add a focused quantity round-trip test beside those utilities if no suitable case exists.

Required fixture groups: F01–F13, F23–F28, F38, A08–A09, A11–A13, L01–L05, and the checked-calculation portion of L20 below. Include linear count and squared-unit variance assertions in every relevant statistic formatter before shipping. In addition, verify legacy saves with `unit: "m"` keep raw number `100`, scalar mode, and the old cosmetic behavior. JSON and Dashboard round-trips must restore raw rows, mode, declaration, pinned result contract, diagnostics, and computed magnitudes without applying a factor twice. Compiled plans and random AST IDs must be absent from saved JSON.

**Docs and example in this milestone:** extend `apps/demo/src/docs/pages/fields.mdx` with “Declare a measured quantity” and “Correct interpretation versus convert”; `calculated-fields.mdx` with “Checked quantities” and “Unknown versus dimensionless”; `dashboard-text.mdx` with declaration/calculation syntax. Add new runnable `apps/demo/src/demos/quantityCalculations.tsx`, registered through `apps/demo/src/demos/examples.ts` and `coverage.ts`, containing distance/time, centimetres plus metres, percent-scale choices, unknown inputs, currency rejection, and an inspectable trace. Register the live documentation example/steps in `apps/demo/src/docs/live/examples.ts` and its coverage in `catalogue.ts`. The existing guide identifies these registration points; follow their actual exported shapes in the worker's checkout.

**Browser acceptance:** at 1280 CSS px, field declaration, formula, preview, and trace are usable without clipped actions; at 783 px, the existing drawer/editor stacks the controls and preview without two competing horizontal page scrolls; at 390 px, unit/role/mode labels wrap, diagnostics remain readable, and Apply/Cancel or the equivalent existing actions remain reachable. Source/calc tables may scroll in their own region. The documented desktop support boundary remains honest; narrow checks ensure the new controls do not break the existing fallback layout, not a claim of full phone chart-authoring support.

**Main risk:** stale previews or a serialization path that loses quantity mode while keeping an attractive unit label. Prove the same accepted definition drives preview, batch values, trace, JSON, and text before shipping.

## 4. Milestone 2 — Affine temperatures and quantity-correct summaries everywhere

**User outcome:** distinguish temperature readings from changes, compare/convert readings, compute ranges and differences, and use correctly typed summaries, comparisons, dispersion statistics, and charts. Extend milestone 1's linear aggregate metadata plumbing with affine admissibility and output roles across every adapter.

**Recommendations:** QC05, QC07, QC09–QC10, QC19; retain QC21's deliberate thermodynamic boundary.

### 4.1 Thermal semantics and stable conversions

Extend `units.ts`, `analyze.ts`, the function signatures, and the existing quantity UI with reading/difference roles. Add `K`, Celsius/Fahrenheit reading representations, and `delta_degC`/`delta_degF` as linear compound factors. Standalone thermal constructors are explicit: `temp(0,"degC")`, `delta(10,"degC")`, and corresponding Kelvin/Fahrenheit variants. Validate normalized dimensions: `qty(1,"K^1")`, `qty(1,"K*1")`, and `qty(1,"K*s/s")` fail just like `qty(1,"K")`. `qty(1,"K/s")` is a permitted interval-rate quantity. Source declarations cannot assign Linear to a normalized pure-temperature unit. `temp` and `delta` require pure-temperature units with their respective roles; affine readings use the supported standalone K/degC/degF representations.

Use corresponding reading anchors `0 °C`, `32 °F`, and `273.15 K`, with `(x - fromAnchor) * scaleRatio + toAnchor`. Differences use the scale only. Conversion to the same unit and role is an identity, including K. When reading units are already the same, subtract native coordinates first; equal offsets cancel without introducing a Kelvin round trip. Retain binary64 finite-result checks and document its limits rather than claiming arbitrary precision.

Implement the operation table in the report exactly. Reading-minus-reading produces a difference in the left reading's interval representation. Reading-plus/minus-difference produces a reading. Difference-plus-reading chooses the point operand's representation. Reading-plus-reading and difference-minus-reading fail. Reject reading multiplication/division/powers, including Kelvin readings, as a stated product boundary rather than a universal claim about thermodynamics.

After permitted multiplication/division/powers, a pure-temperature resulting dimension has temperature-difference role; other compound or dimensionless results are Linear. The operation cannot create a reading. Use coherent K as the computed interval representation unless an explicit result contract projects it elsewhere. Thus `delta(10,"degC") * 2` gives a 20 K difference, and `(delta(10,"degC") / qty(2,"s")) * qty(2,"s")` gives a 10 K difference, convertible to 10 Δ°C.

`avg` of compatible readings is a special valid affine operation; it is not rejected merely because the user-facing `sum` of readings is invalid. `min`/`max` preserve reading semantics. Heterogeneous arguments convert before reduction. Conditional projection and comparisons use the same conversion plans as arithmetic.

### 4.2 Shared aggregate output semantics

Extend `lib/quantities/aggregate.ts`, introduced with the linear adapters in milestone 1, with affine admissibility and output-descriptor rules. Integrate them into `lib/aggregates.ts` without replacing its scalar reducers or contributor accounting. Quantity invalidity is a definition error, not another row excluded for missing numeric input.

- Count/countUnique return dimensionless counts without the measure's suffix.
- Sum of readings is unavailable; sum of compatible linear quantities/differences preserves their quantity representation.
- Average/min/max/median/mode/singleValue preserve compatible input quantity semantics where that statistic exists.
- Standard deviation of readings returns a temperature difference; population variance returns a squared difference unit.
- A metric card's aggregate headline and its subtraction from baseline are separate quantities. A 20 °C headline versus 10 °C baseline has a +10-degree difference, not a 10 °C reading.
- Composition first/last and quartiles preserve input reading semantics; a difference returns an interval. Relative/percent change of temperature readings is unavailable, including change-derived summary colors. A zero baseline remains invalid for ordinary linear percent change.
- Percent/share output is dimensionless and separate from an amount's unit.
- Preserve population, entity-deduplication, exclusion, and pooled-source rules. Units cannot decide whether an average rate or a ratio of totals answers the intended question.

`isAdditiveAggregation` currently classifies statistics only. Keep its purpose clear and require quantity legality before stacking or zero fill. Never let a valid statistic name authorize an invalid reading sum.

### 4.3 Required real adapter coverage

Changing `lib/aggregates.ts` alone is insufficient. Milestone 1 must wire linear quantity environments/result descriptors through these verified existing semantic bodies and their rendering wrappers; milestone 2 must extend and test the same paths for readings, differences, affine variance, and bridge comparisons:

| Existing module | Required integration |
| --- | --- |
| `providers/DataLayerProvider.tsx:getAggregateResult` | Pass input quantity and return aggregate result quantity alongside contributors. |
| `components/charts/PivotTable/utils/calculations.ts` | Its private reducer is independent. Type cells, totals, variance, and standard deviation; preserve population `/N` variance. |
| `components/charts/PivotTable/PivotTable.tsx` | Format cells and labels from result quantity, not source suffix. |
| `components/charts/MetricCard/metricCardPlan.ts` | Separate headline, baseline, delta, and count/share descriptors. |
| `lib/dailyRollup.ts` | Carry measure/output metadata through period/day rollups without changing UTC grouping. |
| `components/charts/Calendar/calendarPlan.ts` | Use rollup output descriptors in labels and traces. |
| `components/charts/LineChart/timeSeriesPlan.ts` | Carry metadata through recursive full-row domain plans; enforce typed stacking/zero-fill legality. |
| `components/charts/Heatmap/heatmapPlan.ts` | Preserve quantity and distinguish semantic invalidity from empty numeric cells. |
| `components/charts/Map/regionMapPlan.ts` | Keep domain calculation, labels, and contributors in the same output representation. |
| `components/charts/Donut/donutPlan.ts` | Synthetic `measure` columns need explicit metadata; amount and share have different descriptors. |
| `components/charts/Waterfall/waterfallPlan.ts` | Validate bridge-state compatibility before subtraction; preserve metadata when reconstructing summary objects. |
| `components/charts/BarChart/barPlan.ts` | Format the aggregate output; preserve source axis units for histogram inputs. |
| `components/charts/BarChart/{SeriesBarChart.tsx,seriesBarPlan.ts}` | Carry result metadata, invalidate relevant memoization, and apply legality before stacking or 100% normalization. |
| `components/charts/Composition/resolveUnit.ts` | Type its independent aggregate, stack sum, quartile summaries, and median relative-change color calculation. Reject reading percent change before computing color domains. Guard `horizonValues` as unsupported/unavailable for declared quantities in this scope; its independent baseline/relative transformation must not bypass quantity rules. Keep its legacy scalar path. |
| `components/charts/Composition/calculations.ts` | Type `evaluateCalc` and `formatCalcValue`, including first/last/difference/change; keep the existing population and ordering rules. |
| `components/charts/Composition/{useCompositionData.ts,partsMarks.ts,compositionTypes.ts}` | Pass readonly quantity environment/revision into composition data and delegated donut/waterfall plans; retain output formatting. Do not overload layout `UnitElement` or `ScaleDomain` as physical quantity metadata. |

Search actual call sites of `summarizeGroup`, `calculateGroupedAggregate`, `reduceNumbers`, and pivot's private reducer in the checkout to complete wrapper plumbing. The source audit identified these bodies; it did not execute every renderer. Do not infer units from synthetic field names like `measure` or from display labels.

Composition's physical-scale consumers also need compatible representations. A band can combine its axis field with lower/upper fields; a span combines start/end fields. Validate all fields sharing a scale for dimensions, role, kind/reference, and numeric representation. Require an explicit converted field in the common representation in this release; never plot raw `100 cm` and `2 m` as `100` and `2` on one metre axis. Preserve separate quantity metadata rather than repurposing Composition's unrelated repeated-layout notion of a “unit.” The named aggregate/comparison adapters are checked; this does not certify every renderer-specific horizon, density, stream-offset, or regression equation. Known unsupported typed relative-result paths show an explicit diagnostic.

### 4.4 Acceptance, docs, and example

Use F14–F28, F35–F37, F39, and A01–A08 plus A10–A12. Extend the new quantity tests, existing `components/charts/PivotTable/__tests__/calculations.test.ts`, `components/charts/MetricCard/MetricCard.test.tsx`, and existing planner/aggregate tests. Verified Composition test paths are `components/charts/Composition/{calculations.test.ts,resolveUnit.test.ts,summaries.test.ts,stacks.test.ts,stackedAreas.test.ts,partsMarks.test.ts,compositionOutput.test.tsx}`. Add targeted adapter tests where no quantity case exists; avoid a new test framework. Compare both number and role/unit, including trace output and unavailable states.

Assert that source readings `0,10 °C` produce average `5 °C`, population variance `25 (delta °C)^2`, and standard deviation `5 delta °C`; their Fahrenheit representation `32,50` produces average `41 °F`, variance `81 (delta °F)^2`, and standard deviation `9 delta °F`. Sum is invalid in both. Verify totals recompute from source rows and do not average displayed group averages.

**Docs/example:** extend `fields.mdx` and `calculated-fields.mdx` with readings versus differences; `pivot.mdx` with statistic result units; `metric-card.mdx` with comparison differences. Add “Composition aggregate text, differences, and change colors” to `calculated-fields.mdx`, distinguishing `CompositionCalculation` from row formulas and explaining unsupported reading-relative-change and typed-horizon states. Extend the quantity demo with temperature sensors and a pivot/metric pair plus Composition output. Include a standalone observed-range variant of the El Niño example using the M1/M2 source-field declarations; it must run without project query codecs. Its project-backed daily version follows in M3. Use `fields.json` only as explanatory evidence, never as an implicitly loaded declaration registry. Register the added runnable documentation steps with the same catalogue/live-example flow as M1.

**Browser acceptance:** at 1280 px, reading and difference labels, aggregate diagnostics, and trace conversion steps are visible together; at 783 px, pivot results and errors remain understandable with contained table scrolling; at 390 px, the user can distinguish a missing value from an invalid sum and can reach the source/conversion action. Test the same view in Celsius and an explicitly converted Fahrenheit field; labels and deltas must remain paired with their actual magnitudes.

**Main risk:** a forgotten aggregate adapter producing a scientifically wrong output role or squared unit. Completion means every typed reduction path either carries a tested output descriptor or remains explicitly unavailable; no silent scalar fallback.

## 5. Milestone 3 — Project/query semantics and folder definition ownership

**User outcome:** declare quantities once on project sources, preserve them through lookup/expansion aliases, perform checked ordered query calculations and aggregates, use typed filters/parameters, and save the right existing folder files.

**Recommendations:** QC08, QC11–QC15, QC17, QC19.

### 5.1 Query types and execution

Extend `types/AnalysisProject.ts` at `FieldDefinition`, `CalculateStep`, runtime `AnalysisField`, diagnostics, and numeric parameter definitions. Add `AnalysisParameter.quantity?: QuantityDeclaration`. A binding supplies a magnitude in that declared parameter unit; filter evaluation converts it into the target field representation after compatibility checks. A physical numeric parameter without a declaration is unknown and cannot filter a declared quantity field merely because both values are numbers. Do not infer a unit from the parameter's name.

Keep the existing inline numeric `FilterStep.value` in the target field's stored coordinates and label those coordinates with that field's representation in the UI. This preserves the explicit source-reinterpretation policy without a new bound owner. Do not add `valueQuantity` in this scope. For an explicitly unit-bearing literal threshold, use a checked Boolean calculate step such as `speed > qty(18, "km/h")`, then filter its Boolean result, or use a declared numeric parameter.

In `lib/analysis/evaluateProject.ts`:

- Propagate source quantity/owner metadata through `sourceFrame`, including an empty source with declared fields.
- Preserve physical origin while applying lookup/expansion aliases; use field IDs, not labels, for environment lookup.
- Compile each `calculateFrame` once against its input frame's field environment, then evaluate rows with that plan. Output scalar values and the pinned result descriptor together.
- Use the shared aggregate admissibility/output inference in `aggregateFrame`, validate its pinned `AggregateMeasure.quantity.result`, and project the reduced magnitude into that output representation. Preserve exact contributor and entity-conflict behavior. A source reinterpretation can change the inferred input unit while the valid pinned aggregate output unit stays fixed.
- Validate the filter field and any typed parameter before rows are tested. Inline numeric literals use field coordinates; declared parameters require compatibility and conversion. Invalid semantics blocks the affected stage and remains distinct from null; `neq` and `is-null` cannot turn a failed calculation into matching rows.
- Include semantic state in evaluation revision through existing query/source/parameter fingerprinting. Avoid a separate global unit cache invalidation service.

Keep `AnalysisStage.rowUnit` as row-grain information. Add physical quantity to field/result metadata, not to that row-grain string. A source-level unit declaration does not license multiplying annual totals by days or averaging rates without an authored analysis choice.

### 5.2 Source, query, and view text owners

Change `lib/dsl/project.ts` at `fieldLine`/`compileSource`, `stepLines`/`compileStep`, and `measureLine` to use the shared quantity codec. Source fields use the same flat `quantityUnit`, `quantityRole`, `quantityKind`, and `quantityReference` keys. Query calculate heads accept `check=quantity` and result keys before `=` along with the existing input-step options. Aggregate measures export their pinned result keys through the same codec. Inferred aggregate metadata is not duplicated as authored view declarations.

Extend `parameterLine` and `compileParameter` in that same file, including `compileParameter`'s current allowed-pair list of `pick`/`required`. Numeric parameters use the source-style quantity keys; for example `param @speed_limit number quantityUnit="km/h" quantityRole=linear`. Reject quantity metadata on nonnumeric parameters. Test runtime bindings and project-text/folder persistence together so the 18 km/h threshold cannot silently become an untyped 18 after a save.

Change `lib/project/analysisText.ts` so `readAnalysisText` retains each evaluation's fields and forwards its environment to view compilation. `exportAnalysisText` must use each view's own query environment rather than only the first view's rows. Two queries can expose the same field ID with different semantics; a shared first-view environment is incorrect.

Change `apps/demo/src/daily/corpus.ts:loadDailyEntry`, which currently derives only `fieldTypes` from query fields, compiles Dashboard/Composition text with rows, and returns no quantity environment. Retain each query's `fieldQuantities`, pass it to compilation, and forward it through the daily rendering host. The project-backed El Niño variant must use this path; retaining only types or rows would discard the new semantics.

Change `components/ExplorEdaProject.tsx` to pass readonly inherited field semantics into the provider. Its current `reported()` strips inherited primitive settings with `!==`; do not feed nested quantity objects through that comparison and accidentally save clones into every view. Prefer a separate inherited environment. A view can change presentation, but its field inspector cannot reinterpret a project field.

Extend `components/schema/{SchemaDrawer.tsx,SchemaInspector.tsx,schemaEditing.ts}`. Canonical project source edits use `ProjectFieldEditor`/`updateSource`; query results route to the defining step editor. Existing local calculation routes remain. Show the owner and an actionable edit route, not duplicate field settings.

### 5.3 Folder loading and writing

Update `lib/project/{folder.ts,writeFolder.ts}` to preserve source declarations through inference/snapshot-type overlays and write them to the existing owning project or analysis `.eda` file. Keep declared versus inferred sources distinct so an unchanged save does not expand inferred schema into authored text.

Use the established precedence of `exploreda.eda`, `.exploreda/project.eda`, local analysis `.eda`, and `.eda.md` files. Do not add a quantity sidecar or promote daily `fields.json` into runtime authority. `node/projectFiles.ts` already supplies temporary-sibling write/rename, own-write suppression, and change coalescing; retain generic byte I/O. Test that behavior through folder round-trips rather than moving unit semantics into the node adapter.

In `apps/app/src/ProjectWorkspace.tsx`, factor the project-definition commit operation from its view-specific wrapper so source/query metadata can be committed without manufacturing an `AnalysisView`. Mark the correct existing owner file dirty. The same operation later supports notebook owner routing in milestone 4.

Until milestone 4 supplies a complete standalone snapshot boundary for inherited fields, do not offer a supposedly self-contained analysis export that silently loses project semantics. Native project/analysis text preserves its references; CSV remains explicitly magnitude-only. Keep unsupported standalone semantic export unavailable with the available native export action.

### 5.4 Acceptance, docs, and example

Use F29–F34 and L06–L10 plus L19–L21. Extend existing query evaluation tests in the checkout and verified `lib/dsl/{project.test.ts,views.test.ts}`, `lib/project/{folder.test.ts,writeFolder.test.ts}`, `node/projectFiles.test.ts`, and `components/schema/__tests__/SchemaDiagram.test.tsx`. Add a new focused `apps/app/src/ProjectWorkspace.quantity.test.tsx` if no host test covers source-owner commits; the baseline has `saver.test.ts` but no `ProjectWorkspace` test file.

Test source→lookup alias→calculate→aggregate→filter and aggregate→calculate pipelines. A parameter declared as `km/h` with value `18` matches the same speed boundary as `5 m/s`; a seconds parameter cannot filter a speed field. Test an empty source, missing source, explicit dimensionless source, unknown source, and repeated alias projections. Save a view and assert it has no copied inherited source declaration.

**Docs/example:** extend `project-folders.mdx` with source quantity ownership, query calculate syntax, typed numeric bounds/parameters, first-typing contract acceptance, and correction versus conversion; extend `dashboard-text.mdx` with source/query examples. Add a runnable folder example under the demo's existing project/example structure using trips, distances, durations, and an alias lookup. Include both average-of-rates `20 m/s` and pooled rate `25 m/s`, with the contributor populations inspectable. Add the project-backed daily observed-range variant through `loadDailyEntry` with declarations in the owning executable EDA definitions.

**Browser acceptance:** at 1280 px, a projected field's owner action opens the canonical source/query inspector and returns to the same view; at 783 px, the query stage and its unit/parameter errors remain readable without a hidden Apply action; at 390 px, ownership text wraps and incompatible filters display unavailable rather than an empty-looking valid result. A source correction must update matching rows and metadata in one visible transaction.

**Main risk:** row-only adapters dropping field semantics or saving duplicate declarations in views. Assert both ownership and values at every project boundary, including per-view export.

## 6. Milestone 4 — Notebook/sheet writeback, refresh, and complete export

**User outcome:** edit quantities in notebooks without losing prose or definitions, share one declaration across sheets, refresh source data/metadata coherently, undo accepted edits, and export a genuinely self-contained analysis with numeric CSV behavior clearly distinguished.

**Recommendations:** QC13–QC19.

### 6.1 Notebook model and definition writeback

Change `lib/notebook/{readNotebook.ts,compileNotebook.ts,writeBack.ts,sheets.ts}` and `components/notebook/ExplorEdaNotebook.tsx`. Carry rows and inherited field environment from the same query evaluation revision. Sheets split rendering, not quantity ownership; all blocks/sheets compile against one model. Definitions continue to apply independent of their block order.

The baseline `writeBackSettings` loops over charts only. Add explicit source-declaration and calculation-definition writeback: locate the owning declaration, edit its head tokens/formula, recompile, and verify the accepted resulting contract before reporting success. Preserve comments, prose, unrelated blocks, and original alias spelling when unambiguous. If multiple aliases name one native field, use the existing native-ID fallback rather than choosing an arbitrary alias. Unit and reference strings never participate in alias rewriting.

For inherited project/source/query quantities, add an optional owner-open action in notebook/field context. The host opens the common canonical inspector. Without a host editor, show readonly origin/source-text location. Inherited quantities must not appear as notebook-local declaration copies.

After an owner edit, re-evaluate the notebook query against the current in-memory project and tables. The baseline host passes cached `notebook.result.rows`; that cannot be paired with new metadata. Do not wait for a file-watch echo, because own-write suppression intentionally removes that echo. Pass current rows and environment together to compiler and provider.

The notebook's last-valid block cache holds text, not a scientifically valid result forever. Recompile fallback text against the current declaration environment. If a formerly valid formula becomes incompatible after an external edit, expose invalid semantics and unavailable output; never reuse its old magnitude under a new generated unit label. The `written.current` fast path must compare accepted definitions as well as charts so it cannot suppress a necessary semantic refresh.

### 6.2 Host state, refresh, and undo

Extend `providers/DataLayerProvider.tsx` and its existing saved-state fingerprint flow to include authored quantities and results while excluding transient plans. Keep immutable data-array refresh and `carryRowSelections` behavior. A matching host state echo performs no redundant restore; one committed declaration/formula transaction produces one callback/history event.

Exercise refresh with new rows and unchanged declarations; changed declarations and unchanged rows; changes to both; and removal/restoration of a declared dependency. Recompile plans and rebuild scalar caches from current source data. A display-only cosmetic edit must not reinterpret numbers, alter filters, or trigger semantic conversions.

Undo restores the complete prior authored state, recomputed values, declaration labels, and predicate interpretation together. The provider has a state-change hold, not a standalone history stack; use the existing host history rather than adding a quantity-specific undo system.

### 6.3 Export boundaries

In `utils/saveDataUtils.ts` and the provider's analysis export path, make standalone full analysis snapshots materialize declarations for exported input fields when those declarations were inherited from a project/query. These are the actual snapshot rows, including query-result magnitudes; do not describe the bundle as an archive of every original project data file. Preserve checked local calculations as definitions over those snapshot inputs. Do not duplicate inherited declarations in ordinary live view settings.

Round-trip the snapshot in a standalone workspace with no project environment and prove matching values, labels, modes, output contracts, and diagnostics. Export metadata in the representation of the exported numbers, not their original source representation. Preserve the existing undefined/NaN/infinity envelope.

Keep `components/charts/DataTable/DataTable.tsx` and `DataTableToolbar.tsx` machine-readable CSV behavior: native field IDs as headers and scalar magnitudes as cells. The resolved table can include computed/converted fields; CSV does not call the pretty quantity formatter or append unit suffixes. Clarify that CSV alone loses declarations and reimports as unknown. Offer complete analysis JSON for metadata-preserving handoff. Do not invent a second compulsory schema sidecar when the full analysis format already supplies it.

State that CSV uses saved numerical representations before display formatting: a stored ratio `0.12 [1]` displayed as `12%` exports `0.12`, whereas its explicitly converted `12 [%]` field exports `12`. Test this distinction directly.

If raw-source export is offered by an existing path, keep its label distinct from resolved table CSV. Validate actual selected rows and columns, not just the CSV serializer. A conversion field may be exported next to its raw source; changing a display suffix must not change exported numeric cells.

### 6.4 Acceptance, docs, and example

Use L11–L18. Extend verified tests `lib/notebook/{compileNotebook.test.ts,writeBack.test.ts,sheets.test.ts}`, `components/notebook/ExplorEdaNotebook.test.tsx`, `components/charts/DataTable/__tests__/DataTable.test.tsx`, folder/provider tests, and the new host quantity test. Preserve no-op text round-trips and existing notebook editing behavior.

**Docs/example:** extend `notebooks.mdx` with definition ownership, cross-sheet declarations, owner editing, and external-invalid behavior; `views-and-history.mdx` with atomic correction/undo; `export.mdx` with raw source, resolved scalar CSV, and complete analysis snapshot distinctions. Add a runnable two-sheet quantity notebook: declaration in the second block, a checked speed formula in the first, temperature reading/difference charts, and a source-owner edit. Include the folder loader path and standalone JSON re-open path in its instructions.

**Browser acceptance:** at 1280 px, a notebook quantity edit changes its one owning definition and both sheets update; at 783 px, editor/preview remains usable through source-owner navigation and undo; at 390 px, saving/errors/export descriptions remain readable and controls reachable. At every width, closing an invalid draft preserves the accepted document; after a valid Apply, visible values and saved text agree before a success state is shown.

**Main risk:** old notebook rows or fallback formula values paired with new metadata, and exports that appear portable but depend on an absent project environment. The acceptance tests must compare complete pairs of values and descriptors.

## 7. Decisive numeric and validity fixtures

These expected values are mathematical fixtures, not observations of implemented software. Test exact integers when the defined operation produces them exactly; use an explicit small absolute/relative tolerance for ordinary binary64 conversion/statistic results. Do not use such tolerance to redefine expression equality. Assert the output unit/role and validity as well as the magnitude.

### 7.1 Linear, unknown, literals, and scale

| ID | Inputs/operation | Expected |
| --- | --- | --- |
| F01 | `qty(100,"cm") + qty(2,"m")` | `300 cm`; explicit conversion gives `3 m`. |
| F02 | `qty(1000,"m") / qty(200,"s")` | `5 m/s`; conversion gives `18 km/h`. |
| F03 | `convert(qty(1,"m"),"cm") / qty(2,"m")` | `0.5` in unit `1`, not `50`. |
| F04 | `qty(100,"cm") ^ 2` | `1 m^2` under canonical compound output. |
| F05 | Length plus duration | Static incompatible-dimension error, no scalar `102` fallback. |
| F06 | Undeclared numeric field used in checked arithmetic | Unknown-quantity error; explicit source declaration resolves it. |
| F07 | Declared unit-`1` coefficient `2` times `3 m` | `6 m`; dimensionless is known and usable. |
| F08 | Bare literal `2 + qty(3,"m")`; `qty(2,"m") + qty(3,"m")` | First invalid; second `5 m`. |
| F09 | Stored `.12`, declared unit `1`, converted to `%` | `12 %`. |
| F10 | Stored `12`, declared `%`, converted to `1` | `.12`; `12 % × 200 m = 24 m`. |
| F11 | Stored `.12`, declared `%`, converted to `1` | `.0012`; the author chose a different interpretation. |
| F12 | `12 % + .03 [unit 1]` | `15 %` with left representation. |
| F13 | `10 currency:USD + 5 currency:USD`; USD plus/converted to EUR | `15 USD`; cross-currency addition/conversion invalid without an authored exchange calculation. |
| F38 | `qty(10,"currency:EUR") * qty(1.2,"currency:USD/currency:EUR")` | `12 currency:USD` using an explicit authored factor; no automatic exchange lookup. |

### 7.2 Temperature and missing/conditional behavior

| ID | Inputs/operation | Expected |
| --- | --- | --- |
| F14 | `convert(temp(0,"degC"),"degF")` | Reading `32 °F`. |
| F15 | `convert(delta(10,"degC"),"degF")` | Difference `18 delta °F`; no `+32`. |
| F16 | `temp(20,"degC") - temp(10,"degC")` | Difference `10 delta °C`. |
| F17 | `temp(20,"degC") + temp(10,"degC")` | Static invalid reading addition. |
| F18 | `delta(10,"degC") + temp(68,"degF")` | Reading `86 °F`. |
| F19 | Reading multiplied by `2`, including a Kelvin reading | Rejected by the stated product policy. |
| F20 | `avg(temp(0,"degC"),temp(212,"degF"))` | Reading `50 °C`, convertible to `122 °F`. |
| F21 | `temp(0.000000000001,"degC") - temp(0,"degC")` | Native-coordinate difference `0.000000000001 delta °C`; no avoidable Kelvin cancellation. |
| F22 | `temp(0,"degC") == temp(32,"degF")`; `20 °C == 68 °F` | `true` for both defined anchored conversions. |
| F23 | Missing numeric input in evaluated addition; numeric zero | Missing/error as existing contract, never substituted zero; zero quantity remains valid. |
| F24 | `distance / duration` with duration `0 s` | Runtime division-by-zero diagnostic; result unavailable. |
| F25 | Guard `duration != qty(0,"s") ? distance / duration : null` | Zero-duration row returns missing without evaluating division. |
| F26 | `true ? qty(1,"m") : qty(1,"s")` | Static error despite unused numeric branch. |
| F27 | `flag ? qty(100,"cm") : qty(2,"m")` | Fixed result representation: `100 cm` or `200 cm`. |
| F28 | Length branch versus bare `0`, versus `null`; `count(missing, length)` | Zero branch incompatible; null branch permitted; count is dimensionless `2`. |
| F35 | `delta(10,"degC") * 2`; `(delta(10,"degC") / qty(2,"s")) * qty(2,"s")` | Temperature differences of `20 K` and `10 K` respectively; convertible to `20/10 Δ°C`, never readings or Linear K. |
| F36 | `qty(1,"K^1")`, `qty(1,"K*1")`, `qty(1,"K*s/s")`; `qty(1,"K/s")` | First three fail normalized pure-temperature constructor validation; last is a valid Linear interval rate. |
| F37 | `convert(temp(0.000000000001,"K"),"K")` | Same scalar magnitude and reading role, with identity conversion rather than subtract/add of 273.15. |
| F39 | Reading `20 °C` with kind/reference tags plus difference `10 Δ°C` with absent tags | Reading `30 °C` retains the reading's tags; trace marks the difference's meaning unverified. An explicit conflicting difference tag makes the operation invalid. |

### 7.3 Project/dependency and summary fixtures

| ID | Inputs/operation | Expected |
| --- | --- | --- |
| F29 | Source `distance=1000 cm`, `duration=200 s`; pinned speed `m/s` | Speed `.05 m/s`; explicitly reinterpreting distance as `m` gives `5 m/s`, raw `1000` unchanged. |
| F30 | Existing speed `5 m/s`; create `speed_kmh=convert(speed,"km/h")` | New field `18 km/h`; old speed and all its filters/bounds unchanged. |
| F31 | `travelled = speed_kmh * duration` using F30 and `200 s` | `1000 m`, proving dependency magnitudes normalized exactly once. |
| F32 | Try changing applied speed output from `m/s` to `km/h` under same identity | Rejected with new-field action; no threshold/bound migration. |
| F33 | Speed filter parameter `18 km/h`; seconds parameter | Equivalent to `5 m/s` boundary; seconds parameter invalid before filtering rows. |
| F34 | Source `1000 cm`; sum output contract pinned to `cm`; source corrected to `m` | Aggregate output changes from `1000 cm` to `100000 cm` under the same valid contract; aggregate thresholds remain in `cm`. |
| A01 | Readings `0,10 °C` | Average `5 °C`, population variance `25 (delta °C)^2`, standard deviation `5 delta °C`, count `2`; sum invalid. |
| A02 | Corresponding readings `32,50 °F` | Average `41 °F`, population variance `81 (delta °F)^2`, standard deviation `9 delta °F`; sum invalid. |
| A03 | Metric average `20 °C`, baseline `10 °C` | Headline reading `20 °C`; comparison difference `+10 delta °C`. |
| A04 | Fahrenheit version of A03 | Headline `68 °F`, baseline `50 °F`, comparison `+18 delta °F`. |
| A05 | Trip A `1000 m / 100 s`; trip B `9000 m / 300 s` | Row rates `10,30 m/s`; arithmetic average `20 m/s`; total-distance/total-time `25 m/s`. |
| A06 | Group A has `0 m`; group B has `10,10,10 m` | Pooled average `7.5 m` from four contributors; not the `5 m` unweighted mean of group averages `0` and `10`. |
| A07 | Inputs `undefined, null, 0 m, 10 m` | Numeric sum `10 m` and average `5 m` from two contributors; zero included, two missing values excluded; shared row count `4`, query field count `2`. |
| A08 | Same-dimension fields with explicitly mismatched kind/reference | Comparability-required operation invalid. Absent tags remain meaning-unchecked, not inferred compatible scientific meaning. |
| A09 | Linear lengths `0,10 m` | Average `5 m`, population variance `25 m^2`, standard deviation `5 m`, count `2` in unit `1`; all format from result descriptors. |
| A10 | Composition ordered readings `10,20 °C` | First/last `10/20 °C`; difference `10 delta °C`; relative change and change-derived color unavailable. |
| A11 | Band lower field `100 cm`, upper field `2 m`, one metre scale | Require explicit converted fields in the same representation; never draw the interval `100..2 m`. |
| A12 | Composition horizon baseline/relative transform with a declared field | Unsupported/unavailable diagnostic in this release; no silent scalar execution. The untyped legacy path stays available. |
| A13 | Composition ordered linear values `10,20 m` | Difference `10 m`; relative change is ratio `1`, displayed as `100%`; amount and ratio have different descriptors. |

## 8. Lifecycle fixtures and release evidence

Use fixtures that exercise real owners and adapters, rather than tests that merely repeat the proposed type definitions.

| ID | Scenario | Required evidence |
| --- | --- | --- |
| L01 | Legacy display-only unit save | No conversion, no retroactive checked mode, raw numbers unchanged. |
| L02 | Settings/analysis JSON round-trip | Same authored declarations/contracts and recomputed scalars; no plans serialized. |
| L03 | Dashboard text round-trip with aliases | Native owner preserved; no `[object Object]`; unit/reference strings unchanged. |
| L04 | Declaration edit while editor draft is open | Preview recompiles against new semantic revision; no stale valid result. |
| L05 | Invalid local source correction | Entire Apply rejected; source/dependent values, filters, and labels remain the accepted state. |
| L06 | Source lookup/expansion alias | Quantity follows field origin, not label; each projection has matching values/descriptor. |
| L07 | Same output field ID in two queries | Each view compiles/exports using its own environment. |
| L08 | Folder no-op save and one source edit | No inferred-schema expansion or new sidecar; only canonical owner file changes. |
| L09 | Invalid external definition with `neq`/`is-null` filter | Affected result unavailable; invalidity cannot broaden rows or masquerade as ordinary missing. |
| L10 | Project source metadata shown in a view | Saving the view creates no duplicate source declaration. |
| L11 | Declaration in block 2, calculation in block 1, two sheets | One shared environment; both sheets correct independent of block order. |
| L12 | Notebook UI definition Apply | Exactly its owning line/tokens updated; prose/comments/unrelated blocks preserved. |
| L13 | Notebook inherited source-owner edit | Canonical project change, immediate matching rows/environment, no notebook-local copy. |
| L14 | External schema change and last-valid block fallback | Text rechecked against current semantics; no old magnitude/new-unit pairing. |
| L15 | Host echo, refresh, and undo | One accepted callback/history step; no redundant restore on matching echo; undo restores complete state. |
| L16 | Standalone snapshot of query output | Reopens without project and reproduces values/units/contracts; exported data described honestly as query-result snapshot. |
| L17 | Resolved table CSV | Native headers; scalar magnitudes before display formatting; no suffixes; ratio `0.12 [1]` exports `0.12` even if shown as `12%`; converted `12 [%]` exports `12`; selected row/column population preserved. |
| L18 | CSV-only reimport versus full analysis reimport | CSV fields unknown until declared; complete analysis retains quantity semantics. |
| L19 | First source typing → aggregate contract acceptance → save/reopen → source correction | Initial source and all newly typed aggregate contracts accepted atomically; reopened aggregate retains its pinned unit and thresholds; source correction changes magnitudes as F34 specifies. |
| L20 | External numeric checked definition or typed query aggregate with omitted result contract | Authored text retained, affected output/dependents blocked, inferred contract offered for explicit acceptance; accepted owner round-trips without hidden load/save migration. |
| L21 | Typed numeric parameter through project text and folder write/read | `18 km/h` remains declared and equivalent to `5 m/s` after reload; codec rejects quantity on nonnumeric parameter types. |

### Worker run sheet

Run these only in a real checkout with the proposed changes. They were not run against the text packet. Select the focused files relevant to the milestone, then run the broad required gate once before its PR. Keep repository-wide checks sequential across worktrees.

```bash
# Use the repository's pinned package manager and supported runtime.
# Read AGENTS.md, docs/agent-guide.md, CODING_STANDARDS.md, and docs/ui-defaults.md first.
pnpm install

# During M1/M2: core semantics, existing calculator behavior, and provider integration.
pnpm --filter exploreda exec vitest run \
  src/lib/quantities/units.test.ts \
  src/lib/quantities/analyze.test.ts \
  src/lib/quantities/codec.test.ts \
  src/test/lib/calculations/engine/Calculator.test.ts \
  src/test/lib/calculations/traceRow.test.ts \
  src/test/providers/fieldSettingsProvider.test.tsx

# Add the milestone's DSL, aggregate, project, notebook, and export tests named above.
# Use the shared @repo/test-config time limits; do not add per-test timeouts.
pnpm --filter exploreda check-types

# A new demo must also pass coverage and Dashboard text round-trip checks.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts

# The demo runs library source; the checkout-specific helper installs/starts it.
pnpm dev:agent

# Browser acceptance: execute the milestone example at 1280, 783, and 390 CSS px.
# Capture screenshots with pnpm shot using the current agent-guide command syntax.
# Use the printed URL; stop this checkout's server after acceptance.
pnpm dev:agent --stop

# Once the milestone is complete, run the repository's full required gate once.
pnpm check

# Each library feature PR needs a user-facing minor changeset while the package is 0.x.
pnpm changeset:add minor "Add checked quantity calculations and explicit unit conversion."

# Review the changeset text for the actual milestone; do not version or publish here.
```

Do not run release publishing, install a server-side units service, or add a generalized quantity plugin system. Measure actual interactive latency or vocabulary pressure before considering incremental plan caches or a larger unit-library dependency. A milestone is complete when its numerical fixtures, ownership round-trips, visible documentation/example, and three-width acceptance pass in the worker's checkout, with executed evidence reported separately from remaining proposed checks.
