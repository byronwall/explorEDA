Build quantity-aware calculations as a strict, explicitly selected mode over explorEDA’s existing scalar expression tree: authors declare what stored numbers mean, calculate compatible quantities, create converted result fields, inspect unit conversions and temperature roles in the existing trace, and save those definitions through JSON, Dashboard text, projects, and notebooks. Keep row values and calculation caches scalar. Add a small owned TypeScript unit resolver, distinguish temperature readings from temperature differences, pin each applied calculation’s result contract, and preserve original source fields. Ship linear calculations first, then affine temperatures and aggregate semantics, project queries, and notebook/export integration. Byron’s request is sufficient demand; the October 20 adoption gates do not govern this design.

# Quantity calculations and explicit conversion — design report

**Baseline:** `9d64a021e35d312887b1bc848e307f42b6c3091f`.  
**Research date:** October 27, 2026 (UTC).  
**Companion:** [implementation-plan.md](implementation-plan.md).  
**Status:** Design and implementation proposal. No application code was changed.

## 1. Access, evidence, and the decision

### 1.1 Access confirmed

The attached `source-packet(20261027-013704).txt` contains 48 complete selected files, with matching start/end boundaries and the exact full baseline above. All 48 were read in full across the research team. The packet is a text snapshot, not a runnable checkout. Small additional reads through connected GitHub access, pinned to that same SHA, closed the actual field-editor, folder-loading, notebook-writeback, CSV, and aggregate-consumer boundaries. The complete read inventory is in Appendix A. No decisive source gap remains.

Evidence labels in this report mean:

- **Repository fact:** established by complete source inspection at the baseline, with paths and symbols.
- **External fact:** supported by the linked official documentation or source in Appendix B.
- **Design decision:** the proposed behavior; it is not claimed to exist.
- **Executed arithmetic:** independently checked with Python’s standard-library `fractions.Fraction`, without importing repository or dependency code.
- **Proposed test:** a worker must run this against the implementation. Source reading and independent arithmetic are not application verification.

The current mission and `docs/research/DIRECTION.md` supersede the old quantity study’s adoption conditions. The old report is useful for source preservation and interpretation cautions, not for deciding whether to build. Numeric preparation PR #531 and temporal preparation PR #532 are unbuilt proposals. No milestone depends on either.

### 1.2 Verified current boundaries

| Current source | Consequence for this design |
| --- | --- |
| `lib/fieldSettings.ts:FieldSettings, getFieldLabel, formatFieldValue` | `unit` is arbitrary display text. Labels and formatted values append it; it does not perform physical conversion. Existing `format="percent"` uses a ratio-oriented number formatter. |
| `convertFieldValue, applyFieldSettings` and `lib/valueParsing.ts` | Input parsing/type interpretation already has an explicit path. Physical unit declarations must not silently become another raw-value parser. Preserve `rawData`. |
| `calculations/types.ts:CalculationValue` and `engine/Calculator.ts` | Values are scalar, with a temporary Date allowance. The evaluator has no quantity environment. Add a compiled plan beside the AST, not objects in data rows. |
| `CalculationState.ts:CalculationManager` | Results and errors are keyed by calculation name and numeric `__ID`. Dependency validation, cycle detection, traces, and whole-cache invalidation already exist. |
| `functions/registry.ts` | `sum`/`avg` operate across arguments within one row. They are not record-level reducers. `count` counts supplied arguments, including missing arguments. |
| `analysis/evaluateProject.ts:calculateFrame` | Ordered query calculations instantiate `Calculator` separately. Updating only `CalculationManager` would leave this surface unchecked. |
| `lib/aggregates.ts` and PivotTable’s private `aggregate` | Shared grouped reductions and pivot reductions are separate paths. Both need result-unit rules; pivot variance and standard deviation need units different from a temperature reading. |
| `SavedDataStructure.ts`, `saveDataUtils.ts`, DSL compile/export | Authored calculation options currently have no quantity contract. Nested field metadata needs explicit validators and codecs; adding an object alone would not establish persistence. |
| `notebook/writeBack.ts:writeBackSettings` | Writeback currently walks charts. Field and calculation declaration edits need an additional definition-aware path. |
| `project/folder.ts`, daily `corpus.ts` | The supplied daily `fields.json` files are descriptive evidence, not a runtime quantity registry. |
| `DataTableToolbar.tsx:toTableCsv` | CSV writes native identifiers and scalar magnitudes, not formatted unit text or metadata. |

Package paths in tables are under `packages/explorEDA/src/` unless otherwise stated. Baseline source links are collected in Appendix B.

### 1.3 Product promise

The product can enforce compatible declared dimensions, scale factors, reading/difference roles, supported operator contracts, and conflicts between explicit meaning/reference tags. It cannot determine whether the author measured the right thing, chose an appropriate population, supplied a valid baseline, or selected the right statistic.

Use the status **Units checked**. If meaning tags are absent, add **Meaning not declared** in the trace. Do not say “scientifically valid.”

Keep three actions distinct:

1. **Declare input meaning:** “These existing numbers are centimetres.” The numbers stay unchanged.
2. **Convert to a new field:** “Express these lengths in metres.” The new scalar magnitudes change; the source field remains.
3. **Format values:** choose precision, a label, or percent display. Formatting changes neither stored magnitudes nor the physical declaration.

## 2. Product and engine alternatives

Scores are design judgments, not measurements or user-study results. Each score is 1–5, with 5 favorable. The tuple is **scientific correctness within the supported contract / user clarity / implementation reach / maintenance**; higher reach and maintenance mean easier implementation and less ongoing burden.

| Approach | Scores | Assessment |
| --- | --- | --- |
| Conversion functions plus a manually declared output unit, without AST analysis | **2 / 3 / 5 / 4** | Fast to introduce, but `convert` at the end cannot detect incompatible intermediate addition, mismatched conditional branches, or a false output label. Useful syntax, insufficient engine boundary. |
| Quantity analysis and conversion plans over the current scalar AST | **5 / 4 / 4 / 4** | Recommended. Checks intermediate expressions while preserving chart values, caches, filters, the editor, and the existing dependency model. Requires explicit propagation through both execution surfaces. |
| Quantity-valued expression engine and quantity objects in rows | **5 / 4 / 1 / 2** | Capable, but introduces adapters at crossfilter, chart, serialization, CSV, profile, and public API boundaries. A library still does not choose reference basis or statistical meaning. |

The selected approach is more than an advisory pass: it compiles the numeric conversions that make checked arithmetic correct. It also avoids replacing the expression language with a second language whose precedence, errors, missingness, and functions differ from existing formulas.

### 2.1 Explicit checking mode

- Existing calculations without the new `quantity` member remain **Scalar**, with their existing numeric behavior.
- The generic calculation editor retains Scalar as its starting mode. The new **Calculate quantities** and **Convert to a new field** actions open it in **Quantity** mode. The mode is visible and never changes automatically while editing.
- Quantity mode is strict for supported operations. Static errors block Apply; row-specific missing inputs or division by zero remain row errors, as today.
- A scalar formula consuming declared fields displays **Units not checked**. It does not acquire an inferred physical result merely because its inputs have units.
- Quantity-only functions are rejected in Scalar mode. There is no scalar `qty` implementation that simply returns its first argument.
- There is no third advisory execution mode. Optional scientific annotations can be incomplete, but a successful dimensional check is never quietly downgraded into unchecked arithmetic.

An undeclared numeric field is **unknown**, not dimensionless. It may be tested for missingness or counted without knowing its unit. To consume its magnitude in a checked calculation, declare it or explicitly construct a quantity from that scalar.

## 3. Primary systems and dependency decision

### 3.1 What the systems establish

| System or reference | Supported evidence | Decision for explorEDA |
| --- | --- | --- |
| **BIPM SI Brochure**, 9th edition, version 4.01, updated 2026 [S01] | Celsius readings use a reference offset; Celsius and kelvin intervals have equal size. Different quantity kinds can share dimensions. Percent is a scaled dimensionless representation. | Separate representation, physical role, and author meaning. Do not infer energy, torque, or reference population from dimensions. |
| **NIST SP 811**, Chapter 7 and Appendix B.9 [S02], [S03] | Distinguishes a quantity from its numerical value in a unit; gives reading and interval conversion rules and the percent scale. | Use explicit scale/offset rules and independent conversion fixtures. Keep labels separate from interpretation. |
| **Pint 0.26.2** [S04], [S05] | Python quantity objects distinguish offset temperatures and delta counterparts. Ambiguous offset addition/multiplication are rejected by default; optional relaxed policies exist. BSD 3-clause license. | Adopt the useful role distinction. Do not introduce Python into the browser library, or context-dependent reinterpretation of an offset unit inside a product. |
| **math.js**, official history showing 15.2.0 [S06], [S07], [S08], [S09] | JavaScript units support parsing, conversion, and arithmetic. Its docs warn about affine-temperature arithmetic and parser differences. Custom bundling is supported; generic functions can bring multiple numeric types. Main package license is Apache-2.0. | A credible broad-vocabulary fallback, not the initial dependency. A unit adapter would still need the owned role and meaning rules. Do not import its expression parser. |
| **UCUM 2.2** [S10], [S11] | A machine-interchange syntax with commensurability and special non-ratio units. Curly-brace annotations have no semantic effect. It has its own specification/license terms. | Useful interoperability reference. Do not call the proposed grammar UCUM, or claim annotations validate CO₂ basis or quantity kind. |
| **PTC Mathcad** [S12], [S13] | Separate input and result units and explicit temperature changes are established workflows. Its unit-checking docs explicitly allow energy plus torque because their dimensions match. | Adopt the declare → calculate → inspect result-unit workflow. Surface the limits of checking. |
| **UnitMath**, retrieved manifest 1.1.1 [S14], [S15] | JavaScript, TypeScript declarations, ESM/CommonJS, Apache-2.0, and no runtime dependency field in the inspected manifest. Its grammar permits one slash and ignores parentheses/asterisks. | Reject for this feature: those parsing rules are a poor match for the proposed explicit compound syntax, and reading/difference semantics remain application work. |

These are current retrieved documentation/source observations, not assertions that dependencies were installed or benchmarked. Version numbers describe the examined official pages/manifests; they are not package-manager resolution results.

### 3.2 Choose a bounded owned implementation

The actual runtime is React/TypeScript, pnpm, browser-first, with `ohm-js` already providing the expression parser. The baseline manifests specify package `exploreda@0.2.0`, `ohm-js ^17.1.0`, TypeScript `~5.4.5`, React peer support for 18/19, and `pnpm@11.9.0`; the library exposes ESM/CommonJS entry points including `./calculations` and `./analysis`. These are manifest constraints, not a claim about installed resolutions. Add no numerical dependency initially. Own a small unit definition table, a unit-string parser, dimension arithmetic, and anchored affine conversions.

This choice is justified by the small supported vocabulary and the amount of product-specific policy that remains necessary with every candidate. It is not a claim that implementing a complete units standard is easy. The boundary must remain explicit:

- No user-defined base dimensions or runtime registry plugins.
- No implicit multiplication, arbitrary prefixes, natural-language unit parsing, logarithmic units, automatic exchange rates, or contexts that change the meaning of the same unit string.
- No replacement math expression parser.
- No numeric object allocations per row for quantity storage.
- No claimed bundle-size advantage in kilobytes: production bundle costs were not measured. The initial implementation introduces no new package dependency, but its own code still adds bytes.

If an actual required vocabulary exceeds the bounded table, compare a narrowly imported math.js unit adapter against extending that table. Pin a release, inspect the selected distribution’s notices, measure the real library/demo bundles, and retain explorEDA’s expression and role semantics. That is a future technical choice, not another demand gate for this feature.

## 4. Declarations and runtime types

### 4.1 One shared declaration type, several legitimate owners

Proposed shapes:

```ts
type QuantityRole =
  | "linear"
  | "temperature-reading"
  | "temperature-difference";

type QuantityMeaning = {
  kind?: string;
  reference?: string;
};

type QuantityDeclaration = {
  unit: string;
  role: QuantityRole;
  meaning?: QuantityMeaning;
};

type QuantityCalculation = {
  // Filled with the complete inferred/chosen contract on first Apply
  // for a numeric result; absent for a Boolean or text result.
  result?: QuantityDeclaration;
};

// Presence selects strict quantity checking; absence means legacy Scalar.
type QuantityCalculationMember = {
  quantity?: QuantityCalculation;
};
```

The same `quantity?: QuantityDeclaration` member belongs on a project source `FieldDefinition`, a standalone raw field’s `FieldSettings`, and a numeric `AnalysisParameter` where it is reused as a physical threshold. `CalculationDefinition`, `SavedCalculation`, and `CalculateStep` instead own the calculation contract shown above. A typed query `AggregateMeasure` also saves `quantity?: { result: QuantityDeclaration }`: its result contract is inferred/chosen when authored, then pinned at that reusable output boundary.

Absence means unknown. `{ unit: "1", role: "linear" }` means explicitly dimensionless. The role is required in serialized declarations; the UI supplies a visible default of Linear for non-temperature units. Standalone temperature units require an explicit reading/difference choice.

### 4.2 Meaning is an author assertion

`meaning.kind` and `meaning.reference` are optional, case-sensitive opaque identifiers. They are not a scientific ontology. Trim surrounding whitespace when authoring; otherwise preserve exact text. Descriptions remain explanatory prose.

- A kind can distinguish `energy` from `torque`, or `co2-volume-fraction` from a mass fraction.
- A reference identifies a declared zero, centering baseline, or comparable basis. It should not encode measurement location: two locations’ temperatures can still be subtracted.
- When comparability is required, two explicit unequal kinds or references produce a static error. A missing tag is not a wildcard that proves equivalence; it leaves that aspect unverified and visible in the trace.
- Addition/selection preserve a tag only when their relevant typed operands agree. Ordinary linear/difference subtraction and reading minus reading preserve a common kind but clear the reference because they create a contrast. Multiplication/division/powers generally clear meaning tags, except multiplication/division by an untagged dimensionless coefficient can preserve the measured operand’s tags.
- Reading + difference, difference + reading, and reading − difference retain the reading operand’s kind and reference: translating a reading does not change its coordinate reference. Explicit conflicting difference tags still fail compatibility. Missing difference tags remain unverified in the trace, but do not erase the reading’s known reference. This operation-specific rule takes precedence over the generic propagation rule.
- Reading minus reading produces a difference role. Its new reference is not inferred from the name of the subtracted field. The author may give the result an explicit baseline description/tag.
- A result meaning declaration can fill unspecified result tags; it cannot override a known contradictory inferred tag or make an incompatible operand operation legal. It is displayed as author-declared, distinct from inferred dimensions.

The expression, dependency origins, and aggregate contributor records supply provenance. Do not save a second provenance graph inside each quantity declaration.

### 4.3 Bounded unit vocabulary and grammar

The initial table supports the following atoms; it does not implement unrestricted prefix expansion.

| Family | Recognized atoms and definitions |
| --- | --- |
| Dimensionless | `1`, `%` = 0.01, `ppm` = 0.000001. Fraction basis remains an author meaning tag. |
| Length | `m`, `cm` = 0.01 m, `mm` = 0.001 m, `km` = 1000 m, `hm` = 100 m. |
| Fixed duration | `s`, `ms` = 0.001 s, `min` = 60 s, `h` = 3600 s, `d` = 86400 s. |
| Mass and volume | `kg`, `g` = 0.001 kg, `mg` = 0.000001 kg; `L` = 0.001 m³, `mL` = 0.000001 m³. |
| Additional SI bases and named derived units | `A`, `mol`, `cd`; `N` = kg·m/s², `Pa` = kg/(m·s²), `J` = kg·m²/s², `W` = kg·m²/s³. |
| Temperature | Standalone `K`, `degC`, `degF` require reading/difference role. In linear compounds, `K` is an interval factor; `delta_degC` and `delta_degF` are explicit interval atoms. |
| Currency | Explicit atoms such as `currency:USD` and `currency:EUR` carry separate opaque currency identities. The three-letter suffix is a declared code, not a verified exchange-rate source or a promise of ISO catalogue coverage. |

Use seven integer SI exponents plus a small sparse map for explicit currency-code exponents. A unit’s scale must be finite and positive. Pure linear units have no offset.

The owned unit-string grammar is conventional: atoms, explicit `*`, left-associative `/`, parentheses, and integer powers with `^`. Whitespace is ignored around tokens; it is not implicit multiplication. Canonical serialization preserves the chosen representation using normalized atom codes. Unknown atoms and invalid syntax are errors.

Examples:

- `m/(s*s)` and `m/s^2` are acceleration units.
- `m/s*s` is length, under left association.
- `m s` is rejected; write `m*s`.
- `degC/s` is rejected as ambiguous. Write `delta_degC/s` or `K/s`.
- A million cubic metres can be declared as `hm^3`. Do not reinterpret a prose suffix such as “million m³,” and do not confuse it with `Mm^3`: a prefixed length is raised to the power too. `Mm` is not in the initial table.
- `year` and `month` are rejected as duration atoms. Calendar periods, timestamps, epochs, and date differences belong to the separate temporal design. The existing calendar grouping code can continue grouping dates; this feature does not reinterpret its periods as fixed durations.

The table is new application data defined from elementary unit relationships and the cited measurement references. It is not copied or marketed as a modified UCUM catalogue.

### 4.4 Keep numeric values scalar at every public boundary

Use a compiler result along these lines:

```ts
type CheckedValueType =
  | { kind: "number"; quantity: ResolvedQuantity | "unknown"; nullable: boolean }
  | { kind: "boolean" | "string" | "date"; nullable: boolean }
  | { kind: "null" };

type QuantityPlan = {
  result: CheckedValueType;
  nodes: ReadonlyMap<string, QuantityNodePlan>;
};

type QuantityNodePlan = {
  result: CheckedValueType;
  // Precomputed conversions, operator/function rule, and result projection.
  // This is metadata for the existing AST, not a second expression language.
};
```

`ResolvedQuantity` contains dimensions, scale, role, representation, and meaning coverage. None of those objects becomes a row-cell value. A plan is associated with the existing AST instance. Parser-generated UUIDs may index nodes within that instance, but must not be persisted or used as cross-parse cache identities.

**Choose per-node scalar representations, with conversions planned on edges.** Do not force every temperature reading through kelvin before every operation:

1. A source load yields its ordinary stored/effective magnitude with its declaration supplied by the plan.
2. `100 cm + 2 m` converts the right operand to 200 cm and produces the scalar 300 in the node’s cm representation.
3. A selected root unit of m projects that scalar to 3.
4. Products/divisions combine dimensions and scale factors, then project to a deterministic coherent compound representation. Thus `100 cm / 2 m` returns 0.5, not 50.
5. `convert(qty(1,"m"),"cm")` produces 100 in a node known to be cm. Dividing it by `qty(2,"m")` still produces 0.5.
6. The manager caches the **projected field magnitude**, not a hidden coherent magnitude. A dependent formula reads that number using the saved result descriptor exactly once.

This is ordinary numeric execution with static metadata, not a runtime object-valued engine. Continue using `numericValue`/`finiteNumber` for raw scalar eligibility and the existing non-finite/zero-division error path.

## 5. Exact calculation semantics

### 5.1 Constructors and conversion

The following syntax fits the existing function-call/string grammar in `calculations/parser/semantics.ts`:

```text
qty(100, "cm")
qty(["Unlabelled distance"], "m")
temp(0, "degC")
delta(10, "degC")
convert(["Distance"], "m")
```

- `qty` constructs a linear quantity. `temp` constructs a temperature reading; `delta` constructs a temperature difference.
- Their first argument is a numeric constant expression, or a single undeclared numeric field/scalar calculation result. The runtime still rejects a missing, nonnumeric, or non-finite value. A constructor is an explicit assertion about those magnitudes.
- Already declared quantities, including declared dimensionless fields, cannot be passed through a constructor to relabel them. Use `convert`. Thus `qty(existingLength,"s")` and `temp(temp(0,"degC"),"degC")` fail statically.
- `qty(2 + 3,"m")` is allowed because its argument is a constant scalar expression. `qty(unknownA + unknownB,"m")` is not: declare the fields or explicitly define that scalar result before constructing it.
- Standalone temperature atoms are not accepted by `qty`. The author must choose `temp` or `delta`, including for K.
- Validate the normalized unit, not just its spelling: `qty(1,"K^1")`, `qty(1,"K*1")`, and `qty(1,"K*s/s")` also fail because their dimension is pure temperature. `qty(1,"K/s")` is a valid linear interval-rate quantity. Source declarations likewise cannot label a normalized pure-temperature unit as Linear. `temp` and `delta` require pure-temperature units with their explicit roles; affine reading representations are the supported standalone K/degC/degF units.
- Unit arguments must be string literals at compile time. A per-row unit-code column is not supported in this release.
- `convert` requires compatible dimensions and the same role. It cannot change a reading to a difference, alter a reference tag, convert a date epoch, or exchange currencies.

The expression grammar’s current numeric literals do not include scientific notation. Use decimal literals such as `0.000001` in runnable examples, or data fields for very small values. Do not quietly add unrelated expression grammar features.

### 5.2 Operators and control flow

| Operation | Checked semantics |
| --- | --- |
| Linear `+` / `-` | Require equal dimensions and no explicit kind/reference conflict. Normalize into the left operand’s representation. A dimensionless value does not add to a length. |
| Reading minus reading | Convert the right reading into the left reading’s coordinate, subtract, and produce a temperature difference in the left interval scale. |
| Reading ± difference | Produce a reading in the reading operand’s representation. Difference + reading is also valid; difference − reading is invalid. |
| Reading + reading | Reject. Use `avg` for a mean, or explicitly model a difference. |
| `*` / `/` | Linear quantities and differences combine dimensions and scales. Divide by zero is a row error. Any reading operand is rejected under the chosen product boundary. |
| `^` | A dimensional linear base needs a compile-time constant integer exponent. A dimensionless base can use a dimensionless exponent, provided the result is finite. Dimensional fractional powers and reading powers are outside this release. |
| Unary `+` / `-` | Linear values/differences retain units. Unary plus may preserve a reading; unary minus on a reading is rejected because it negates an arbitrary coordinate origin. A negative reading literal is constructed as `temp(-10,"degC")`. |
| `==`, `!=`, ordering | Comparable numeric quantities are normalized before comparison. Reading/difference mismatch fails. Same-type text/Boolean equality remains available; ordering requires numeric quantities and does not add lexicographic ordering. No epsilon is silently introduced. |
| Null comparison | `x == null` and `x != null` do not consume a physical magnitude and can inspect an unknown-unit field. Missing is not zero. A blocked semantic field is not ordinary missing. |
| `if` / ternary | Condition must be Boolean in checked mode. Both branches are typechecked. The selected branch is converted into one fixed output representation. |
| `&&` / `\|\|` / `!` | Boolean operands only in checked mode. Typecheck both sides; retain runtime short-circuiting. |

Bare numeric literals are dimensionless. Zero is not a polymorphic unit:

```text
["Distance"] + 2                         // invalid for a declared length
["Distance"] + qty(2, "m")              // valid
if flag then qty(1, "m") else null      // nullable length
if flag then qty(1, "m") else 0         // invalid branch types
```

A conditional such as `if flag then qty(100,"cm") else qty(2,"m")` has a fixed cm result: its branches return 100 or 200 cm. It must not return 100 or 2 under one shared descriptor.

After any permitted multiplication/division/power, derive the role from the resulting dimension: pure temperature (temperature exponent one, every other exponent zero) is a **temperature difference**; dimensionless and other compound results are Linear. Such arithmetic never creates a reading. Thus `delta(10,"degC") * 2` is a 20 K difference in the coherent output representation, and `(delta(10,"degC") / qty(2,"s")) * qty(2,"s")` is a 10 K difference, convertible to 10 Δ°C. This rule also closes role gaps after unit cancellation.

### 5.3 Temperature policy and numerical method

For reading conversion, use corresponding anchors:

```text
anchor(degC) = 0
anchor(degF) = 32
anchor(K)    = 273.15

readingToTarget(x) =
  (x - sourceAnchor) * sourceIntervalScale / targetIntervalScale
  + targetAnchor

differenceToTarget(x) =
  x * sourceIntervalScale / targetIntervalScale
```

The interval scales relative to K are 1 for degC/K and 5/9 for degF. Conversion to the same unit and role is an identity operation, including K; do not subtract and add an anchor unnecessarily. Same-unit subtraction uses native magnitudes before any offset operation. This makes a difference of `0.000000000001 °C` from `0 °C` avoid the unnecessary rounding from adding and subtracting 273.15.

This is still JavaScript binary64 arithmetic. Anchors avoid a common loss of precision; they do not make all unit conversions exact. Use ordinary strict floating equality after conversion, reject non-finite intermediates, and test numeric outputs with stated tolerances.

**The reading abstraction is a protective product rule.** Thermodynamic Kelvin temperatures can participate in physical laws and ratios. Rejecting multiplication of all `temperature-reading` values, including K, is not a universal SI law. This release deliberately supports observational readings, differences, and their summaries; thermodynamic equations require a later explicit modeling operation. Converting a reading to K does not silently remove that protection. [S01], [S04]

### 5.4 Percent, dimensionless values, and currency

| Stored value and declaration | Meaning and output |
| --- | --- |
| `0.12` in `1` | A ratio of 0.12; converting to `%` yields the scalar 12. |
| `12` in `%` | The same ratio; converting to `1` yields 0.12. |
| `0.12` in `%` | A ratio of 0.0012. The software must not guess that the author intended 12%. |
| Bare `12` | A dimensionless coefficient of twelve, so multiplying 200 m yields 2400 m. |
| `12 %` | Multiplying 200 m yields 24 m. |
| `currency:USD` versus `currency:EUR` | Different opaque dimensions. Addition and direct conversion fail without an explicit authored exchange factor. |

An explicitly supplied field in `currency:USD/currency:EUR` can participate in ordinary multiplication, because the author supplied the factor. Its date and market basis remain author-owned; this adds no exchange service or automatic rate lookup.

Typed percent formatting first obtains the ratio represented by the magnitude, then applies the percent formatter once. Both `0.12 [1]` and `12 [%]` display 12%. Normal numeric display of a percentage-unit field shows its stored magnitude, such as `12 %`. This fixes neither raw input interpretation nor missing metadata. Legacy untyped `format="percent"` continues its current behavior.

### 5.5 Missing values and supported row functions

Keep current eligibility rules: zero is valid; null, undefined, blank numeric text, and configured null tokens are not measurements. A failed parse and a missing source value remain distinguishable in input/contributor inspection where the current pipeline supplies that distinction.

- `sum`, `avg`, `min`, `max` consume arguments **within one row**. They normalize compatible quantities before reducing. Missing numeric arguments cause the existing row error; these functions do not silently skip arguments.
- `sum` accepts linear quantities and differences, not readings. `avg` accepts readings directly; it is not implemented semantically as a forbidden user-visible sum.
- `min`/`max` accept comparable readings and return a reading. `avg`/`min`/`max` use a fixed common representation, normally the first quantity argument.
- `count` counts arguments, including missing ones, and returns dimensionless count. It does not need the arguments’ units.
- `formatDate` returns text. `extractDateComponent` returns a dimensionless calendar code/index, not a duration. No epoch or calendar-interval inference is introduced.
- A registered function without a quantity signature is rejected in Quantity mode, with its name and the unsupported-contract diagnostic. Scalar mode retains it. The existing registry can be extended at runtime—for example by `regionFunction`—so “every registered function is checked” would be a false claim. Do not add a generalized plugin API to solve this.

Runtime errors remain per row. Static quantity errors invalidate the definition rather than becoming a different error message on every row. Existing lazy guards remain useful:

```text
if ["Elapsed"] == null then null
else if ["Elapsed"] == qty(0, "s") then null
else ["Distance"] / ["Elapsed"]
```

### 5.6 Record aggregation and derived statistics

Keep unit admissibility separate from reducer population. A quantity descriptor must travel with the aggregate result, because an input-field formatter cannot correctly label every statistic.

| Reducer or result | Quantity rule |
| --- | --- |
| Count / count-unique | Dimensionless count, with the existing population/missingness contract. Never inherit °C, USD, or another measure suffix. |
| Sum | Linear quantities/differences preserve their unit. Reading sums are unavailable with an explicit diagnostic, even if there are no current rows. |
| Average, min, max | Preserve the input quantity role and representation; readings are permitted. |
| Pivot median | Preserve role and unit. The midpoint of two readings is a reading. |
| Pivot population standard deviation | Preserve a linear unit; a temperature-reading input produces a temperature difference. |
| Pivot population variance | Square the linear/difference unit; a temperature-reading input produces squared interval units. It is not dimensionless. |
| Pivot mode / single value | Preserve the selected field’s role/unit when there is a result. Existing uniqueness and tie behavior remain. |
| Difference from a metric baseline | Use subtraction rules. A 20 °C headline minus a 15 °C baseline is +5 Δ°C, not a new absolute reading. |

The current pivot variance divides by the number of numeric contributors, so these are **population** variance/standard deviation rules. Do not change the estimator while adding units.

Preserve the three existing count populations:

- Row `count(x,y)` counts arguments, including missing arguments.
- Query `count(field)` excludes nullish field values; query count without a field counts rows.
- Shared chart/group count counts source rows or selected distinct entities under the existing contract.

Record numeric reductions continue skipping ineligible values and exposing contributor exclusions. All-ineligible numeric input is unavailable, not a sum of zero. A valid observed zero remains a contributor. Conflicting values within one selected entity remain unavailable under the current identity rules. Group totals are recomputed from contributors; they are not sums or averages of displayed summaries.

**Required integration reach:** add one shared quantity-rule helper, then supply it to `lib/aggregates.ts`, `evaluateProject.ts:aggregateFrame`, PivotTable’s private reducer, metric-card comparisons, daily/calendar rollups, line summaries, bar/series-bar, heatmap, region map, donut, waterfall, and Composition. Donut and waterfall use a synthetic `"measure"` key; pass its descriptor explicitly rather than looking it up by that synthetic name. Waterfall bridge subtraction must validate the separate input fields’ roles and references.

Composition is another independent implementation: `Composition/resolveUnit.ts` has private aggregate, quartile, and stack reducers; `Composition/calculations.ts:evaluateCalc` evaluates count/sum/average/min/max/first/last/difference/change for text/summary outputs. First/last/quartiles preserve input role; differences use interval semantics; relative/percent change of readings is rejected because it divides by a reading. Preserve valid quartiles even when an optional relative-change color calculation is unavailable. Pass the environment and revision through `useCompositionData.ts`, then use result-aware formatting rather than treating all calculated text as plain numbers. Composition’s `UnitElement` is a layout template, not a measurement unit.

These named aggregate and comparison adapters are the checked surface. Renderer-specific horizon transformations, density equations, stream offsets, and regression equations are not certified by this feature. In particular, `resolveUnit.ts:horizonValues` independently subtracts a baseline and optionally divides by its magnitude: mark this transformation unavailable for declared quantities in the initial scope, with an explicit unsupported diagnostic, while preserving its legacy scalar path. Do not let this known bypass execute and inherit a misleading result unit. Composition’s `CalcResult.kind="signed"` is presentation metadata, not a temperature-difference role.

`isAdditiveAggregation` currently classifies a statistic, not a quantity. A reading sum cannot become legal because the chart wants to stack it, produce an “Other” group, calculate a share, or fill an empty bin with zero. Reject before those numeric operations; never silently substitute average.

Units also cannot select the intended statistic. For trips of 1000 m in 100 s and 9000 m in 300 s:

- The arithmetic mean of row speeds is `(10 + 30) / 2 = 20 m/s`.
- Total distance divided by total duration is `10000 / 400 = 25 m/s`.

Both have correct units. The latter is available through ordered aggregate-then-calculate query steps, without a new generalized measure language. Traces must name the operation, row grain, membership, numeric contributors, and exclusions. The unit checker does not choose the population or weighting.

## 6. User flows and existing UI integration

### 6.1 Distance divided by duration

1. In the existing field inspector, open **Quantity** for Distance. Declare **Linear · m**. Elapsed receives **Linear · s**. Show representative raw/effective values and their interpretation; neither column’s magnitudes change.
2. Choose **Calculate quantities**. The existing calculation editor opens in Quantity mode with the ordinary field insertion and dependency tools.
3. Enter `["Distance"] / ["Elapsed"]`. Preview a row containing 1000 and 200 as **5 m/s**. The result-unit control suggests the inferred coherent compound unit.
4. Apply. Save a numeric result contract in m/s. The new field is a normal scalar column.
5. Choose **Convert to a new field**, select km/h, and create `convert(["Speed"],"km/h")`. Preview **18 km/h**. The original Speed column and its filters remain.
6. Alt-click/Alt-Enter a chart mark, or open the existing calculation trace, to see the two source magnitudes, declarations, division, result projection, and contributor identity.

### 6.2 Compatible values in different scales

Declare A as cm and B as m. In Quantity mode, `A + B` over 100 and 2 previews **300 cm**. The trace shows B converted to 200 cm before addition. Choosing m as the result representation before first Apply yields **3 m**.

The editor shows both the numeric result and its inferred dimension/role. A free-form display suffix cannot make a result compatible.

### 6.3 Incompatible addition

For declared length and duration, `Distance + Elapsed` fails before row execution. Show the operator, the two operand fields, and their units: “Cannot add length in m and duration in s.” Apply is disabled. Existing saved values stay visible as saved values; they are not relabeled as the draft result.

If a field is undeclared, the error is different: “Declare a quantity for Elapsed, or use Scalar mode.” Offer the existing field-inspection route. Do not report a dimensional mismatch when the dimension is unknown.

### 6.4 Readings, differences, and means

The declaration control requires **Temperature reading** or **Temperature difference**:

- `convert(temp(0,"degC"),"degF")` previews **32 °F — reading**.
- `convert(delta(10,"degC"),"degF")` previews **18 Δ°F — difference**.
- `High - Low` between readings produces a difference.
- `High + Low` is rejected; `avg(High,Low)` is a permitted mean reading.
- A metric card averaging readings shows a reading headline; its comparison to another mean shows a difference.

Use Δ in display and the full role name in accessible text. Do not rely on the unit symbol alone to teach this distinction.

### 6.5 Extend existing controls

The actual editor is `components/SummaryTable/components/FieldInspector.tsx`, not `FieldMetadata`. Add a compact Quantity section/tab beside its existing Values/Display/Type/Preview workflow. Reuse draft state, preview, and Apply. `components/schema/SchemaInspector.tsx:ProjectFieldEditor` and `WorkspaceFieldEditor` are additional write paths and must use the same validation/owner rules.

`FieldMetadata` should summarize known unit, role, and owner in the current tooltip/details pattern. Keep the visible row compact. Do not rebuild the editor, create a persistent second inspector, or add chart Inspect buttons.

The calculation form adds a visible Scalar/Quantity choice, result unit, optional meaning/reference, and static diagnostics. Update dirty-state calculation, preview keys, and effect dependencies to include all of those plus the quantity-environment revision. A unit edit elsewhere must not leave a preview certified under an old declaration.

### 6.6 Display settings are not semantic settings

For undeclared fields, existing `FieldSettings.unit` remains an arbitrary suffix. For declared fields, the resolved quantity representation supplies the authoritative unit in labels and values. Preserve any old suffix in saved settings and show it as an original display label in the inspector; do not parse it, delete it, or append it as a conflicting second unit.

Changing label or precision remains a display edit. A typed currency formatter must agree with its declared currency; percent display requires a dimensionless quantity. Changing the physical representation uses the explicit conversion workflow.

The narrow layout follows repository rules: compact 28/32 px controls, reachable actions, bounded popovers/sheets, visible field names/filter scope, no native `title` tooltips, and light/dark semantic tokens. The demo’s sub-960 px grid stays a view-only layout; this feature does not promise full grid editing on a phone.

## 7. Ownership and complete lifecycle

### 7.1 Owners and adapters

| Boundary | Authoritative declaration and required behavior |
| --- | --- |
| Standalone source field | `FieldSettings[field].quantity`. Existing display/type settings remain alongside it, with physical interpretation handled separately from input parsing. |
| Project source field | `SourceDefinition.fields[].quantity` through `FieldDefinition`. Edit in the owning source definition, not a view override. |
| Row calculated field | `CalculationDefinition.quantity.result` and its saved counterpart. No competing `FieldSettings.quantity` for the calculated result. |
| Ordered query calculation | `CalculateStep.quantity.result`. Query evaluation emits its resolved descriptor with the scalar output field. |
| Query aggregate result | Infer from reducer and input descriptor, pin `AggregateMeasure.quantity.result` when the reusable output is authored, and project the numeric result into that representation. Runtime `AnalysisField` carries the resolved descriptor; individual charts do not author duplicates. |
| Numeric reusable parameter | Optional `AnalysisParameter.quantity`. Typed parameters are converted into a compatible filter field’s representation. An unknown-unit parameter cannot silently become a physical threshold in a checked comparison. |
| Chart aggregate/statistic | Runtime result descriptor from the shared quantity rules. Count, variance, and comparison delta must not reuse the measure’s descriptor unchanged. |
| Notebook and sheets | Local declarations live once in the relevant EDA block; inherited project declarations stay in the project/source/query owner. Sheets share one semantic model. |
| Exported standalone analysis snapshot | Materialize resolved declarations for the exported input columns at this boundary, because these may already be project query outputs. This is a new dataset snapshot, not another live owner. |

Pass an optional readonly `fieldQuantities` environment through the public/provider, project, DSL, and notebook adapters. Include runtime ownership and semantic status with the resolved descriptors. Do not persist that runtime map as a second settings source.

This specifically avoids adding nested objects to `ExplorEdaProject`’s existing label/type overlay. Its `reported()` comparison currently strips inherited primitive settings using identity comparisons. A naive nested quantity copy would survive stripping, duplicate declarations, and destabilize host echoes.

### 7.2 Source → query → view

In `sourceFrame`, qualify quantity metadata using the same native field IDs as values. Lookup/expand aliases carry the descriptor and original source-field identity. Alias names and display labels are not new declarations.

`calculateFrame` must call the same quantity compiler/evaluator as row calculations. Compile once per step/environment, outside the row loop. `aggregateFrame` derives output descriptors from input fields and reducer rules, checks a pinned measure contract when present, and projects the result into that contract. A calculation after aggregation therefore sees actual aggregate units; aggregation after calculation sees the computed field’s contract.

Inline numeric filter bounds are expressed in the filtered field’s current numerical representation, just like an axis bound. A numeric parameter with its own declaration is checked and converted. Null predicates remain unit-free for valid fields. Relationships/group keys keep identity semantics: do not add hidden unit conversion to joins or grouping. A user wanting physical equality across representations must derive a common key deliberately.

`AnalysisStage.rowUnit` already describes record grain; it must not be repurposed as a physical unit. Keep grain, quantity, reference, population, and reduction visible as separate facts.

Several current adapters discard evaluation fields and keep only rows: `readAnalysisText`, `readNotebookText`, and the daily dashboard/composition loader. Retain the environment at all three. Compile and export every project view with its own query’s environment; the first view’s rows/metadata are not a safe substitute for other queries that reuse a field ID.

### 7.3 Representation changes, filters, and saved bounds

**Pin the full numeric result contract on first Apply:** unit, role, kind, and reference. An existing calculated field may change its formula while preserving that contract. A same-ID change to the contract is rejected by the mutation API as well as the UI; offer **Create converted field** or a new result name.

Use this unconditional rule rather than trying to discover every possible consumer before permitting a unit change. The application cannot reliably enumerate exported equations or external host consumers. Internally, consumers also include chart/workspace/Rows filters, axes, color thresholds, explicit bins, annotations, facets, saved aggregates, notebook references, and query dependents.

This gives a precise policy:

- **New numerical representation:** create a new field with an explicit conversion. Original filters and bounds remain attached to the original field and retain their original coordinates. No automatic chart retargeting or numeric-bound migration occurs.
- **Formula edit with the same contract:** preserve filters and bounds; recompute values and memberships. A threshold of 10 m/s still means 10 m/s when the speed formula changes.
- **Source interpretation correction:** the source magnitudes remain fixed while the author explicitly corrects their meaning. A source bound of 500 changes from 500 cm to 500 m if that declaration is corrected. Preview this consequence. Dependent bounds retain their pinned result units while dependent numeric values recompute.
- **Display-only edit:** labels/precision/legacy suffixes do not change values, filters, bounds, row membership, or quantity plans.
- **Whole-snapshot restore/undo:** restore the saved definitions, representation contracts, and numeric settings together. This is not an in-place conversion request.

For example, source `distance=1000` declared cm and `elapsed=200` s gives a pinned speed of 0.05 m/s. Correcting distance’s declaration to m gives 5 m/s. A speed filter `>1` m/s changes membership by reevaluation; a source filter `distance>500` keeps its numerical predicate but now represents 500 m. The preview must show both consequences.

There is deliberately no universal “convert this field in place and rewrite every bound” feature. A later implementation could offer a finite, audited migration, but it is not needed for a complete explicit-conversion workflow.

Apply the same new-output-ID rule to a reused query aggregate measure when its result contract changes. An average-temperature field cannot become a count field under the same ID while retaining downstream numeric thresholds. A source correction can change an aggregate’s magnitude while its pinned output representation remains stable: a stored 1000 corrected from cm to m becomes 100000 cm in an aggregate output pinned to cm.

**First typing is an explicit acceptance boundary.** If a source/dependency Apply first makes existing reusable query aggregates quantity-aware, show their inferred result contracts and add `AggregateMeasure.quantity.result` to all affected owners in the same canonical project-definition transaction. Commit declarations and contracts together; reject the Apply if a required owner cannot be updated. Untyped legacy aggregates retain their old path.

External text/JSON with typed reusable output but no required numeric result contract is repairable authoring input, not executable provisional data. Preserve it, show the inferred contract and **Accept result contract**, and block that output/dependents until explicit acceptance writes the owner. The same publication rule applies to a checked numeric calculation with an omitted result contract; its editor may infer a draft preview, but accepted numeric definitions must pin the result. Runtime-only pins and silent normalization during load/save are insufficient because numeric bounds survive reloads.

A chart-local statistic change is an explicit reconfiguration rather than a reusable field conversion. If it changes the output’s numerical representation, dimension, role, or asserted meaning, preview any affected manual output ranges/color thresholds and offer resetting those output settings to Auto in the same Apply, or creating another chart. This applies even when old/new units are dimensionally compatible but use different numerical scales. Do not migrate them by guessed factors; do not reset source-field filters or histogram input bins that still refer to the original source representation.

Multiple fields sharing one positional scale are another concrete boundary. For Composition bands/spans and multi-field waterfall states, require compatible dimensions/roles/tags and the same numerical representation. An axis in m must not draw a raw lower bound of 100 cm as 100 m. The initial repair is an explicit converted field, not hidden plotting conversion. Separate scatter axes can naturally have different units. This bounded geometry check does not add a general chart equation engine.

### 7.4 Atomic edits, invalidation, and errors

An accepted semantic edit should:

1. Resolve the canonical owner and build the candidate declaration/definitions.
2. Recompile all checked definitions and their dependents against that environment.
3. Validate pinned output contracts and show affected source/dependent values and thresholds.
4. Reject a local Apply with static incompatibilities without mutating live state.
5. On success, replace the environment/plans together, clear computed result/error/column caches, refresh derived profiles, and rebuild live predicates against the new scalar getters.
6. Publish one state change through the existing hold/commit boundary.

Start with whole-plan recompilation and whole-calculation cache invalidation. This matches `CalculationManager.setCalculations`’s current deliberate simplicity. Incremental invalidation, vectorized execution, or workers require measured latency before adding machinery.

Do not route quantity edits through `updateFieldSettings`’s current display-only branch. The baseline rebuild branch only recognizes type/date/null-token parsing changes. Also do not reuse its policy of clearing only the directly edited field’s filters: physical declarations have transitive dependents and a different coordinate policy.

Separate **semantic unavailability** from **row missingness**. A syntactically readable external definition can become dimensionally invalid after a source/file refresh. Keep the authoring text and diagnostic repairable, mark the affected field/dependents blocked, and never show cached old values under new labels. An active predicate consuming a blocked field makes the affected view/selection unavailable for every operator—including `neq` and `is-null`—rather than treating the field as null or displaying a factual zero-row result. Unrelated fields/views can continue.

Malformed JSON or invalid declaration structure is rejected with its location, leaving the last accepted snapshot intact. A last-valid notebook formula is only last-valid **text**; it must be rechecked against the current environment before being reused.

### 7.5 JSON and Dashboard text

Update both `toRuntimeCalculations` and `toSavedCalculations` in `DataLayerProvider.tsx`; each currently destructures only the old name/expression pair. Update `validateSavedData`, `isFieldSettings`, and `validateSavedAnalysisForData` to preserve and validate the same declaration/contract shapes. Structural validity and quantity validity are separate checks.

Persist:

- Authored source declarations.
- Formula text and checked result contracts.
- Existing display settings, filters, and layout.

Do not persist:

- AST UUIDs, compiled maps, inferred dimension vectors, intermediate conversions, result caches, or row-local diagnostics.
- Copies of inherited project declarations in ordinary live view settings.

Use optional fields on the existing saved format. An old save with only `unit="m"` remains an unchecked scalar save; no migration parses its suffix. Preserve the existing special-value serialization envelope.

Proposed **new** Dashboard text syntax:

```text
field distance quantityUnit=cm quantityRole=linear
field elapsed quantityUnit=s quantityRole=linear
calc speed check=quantity resultUnit="m/s" resultRole=linear = ["distance"] / ["elapsed"]
calc speed_kmh check=quantity resultUnit="km/h" resultRole=linear = convert(["speed"], "km/h")
```

Optional keys are `quantityKind`/`quantityReference` for source fields and `resultKind`/`resultReference` for calculations. Project child source-field declarations use the same quantity keys. Draft compilation may infer an omitted numeric result; explicit Apply/Accept resolves and pins that contract, and export writes it. A loaded numeric checked definition without it follows the repair boundary above. Checked Boolean/text outputs need no numeric result contract.

These head options require a parser change. Baseline `dsl/parse.ts:parseCalc` accepts only a name before `=` and treats the rest as formula text. Do not append options after the formula and expect them to be metadata. Query `parseStepCalc` already has head-pair tokenization, but `dsl/project.ts:compileStep` currently accepts only `from=` there.

Add a shared codec for nested quantity declarations. `exportParts.fieldLines` currently serializes primitive field settings; letting it stringify a nested object would produce `[object Object]`. Extend `FIELD_SETTING_WORDS` and `CALCULATION_COVERAGE` deliberately.

Project parameter text has another explicit codec: extend `dsl/project.ts:parameterLine` and `compileParameter`, including the latter’s current `pick`/`required` allowed-pair list. A numeric parameter uses the same `quantityUnit`/`quantityRole`/meaning keys, for example `param @speed_limit number quantityUnit="km/h" quantityRole=linear`. Non-numeric parameter types cannot carry physical declarations. Runtime filter checking alone would otherwise lose these declarations during a project/folder round-trip.

Resolve field aliases before building the environment. Two aliases for one native field are not two owners. Preserve unit-string literals and meaning/reference strings when rewriting formula field references.

### 7.6 Notebook and sheet writeback

All EDA blocks compile against one shared definition environment, including definitions that appear later in the document. Sheets affect presentation, not quantity authority.

Extend `writeBackSettings` with definition-aware writeback alongside its existing chart edits:

- Locate the owning local field/calculation declaration.
- Edit its options or formula span without rewriting unrelated prose/comments/blocks.
- Preserve an unambiguous alias spelling; use the native ID when several aliases make a reverse mapping ambiguous.
- Recompile the candidate document with its current inherited environment and compare the intended definition/contract before accepting the write.
- Emit one accepted text/state change. Do not show Apply success while only the in-memory field changed.

Inherited project quantities need an actual owner route. Add an optional owner-open callback/context to `ExplorEdaNotebook`, and a project-definition commit path in `apps/app/src/ProjectWorkspace.tsx` that does not require manufacturing an `AnalysisView`. Without a host editor, show the owning source/query location as readonly and route authors to that source text.

After an inherited edit, evaluate the notebook’s query against the current project and tables and pass **matching rows and quantity environment from the same revision**. The baseline cached `notebook.result.rows` cannot represent a newly edited source interpretation. Do not wait for an own-file-write watcher echo: the node adapter intentionally suppresses it.

### 7.7 Folder load, refresh, undo, and host state echoes

Keep `exploreda.eda` / existing project text as the source-definition owner, local analysis text as its existing owner, and `.eda.md` as notebook text. Extend `folder.ts`, `writeFolder.ts`, `dsl/project.ts`, and `analysisText.ts` at their current declaration/serialization boundaries.

Preserve declared versus inferred source fields. A database refresh or file type inference must not overwrite an explicit quantity declaration, and an unchanged save must not expand all inferred fields into authored metadata.

`node/projectFiles.ts` already owns byte I/O, temporary-file replacement, watching, coalescing, and own-write suppression. It should need no quantity business logic. Add end-to-end fixtures around it; do not build a second watcher or sidecar system.

For external data refresh, preserve the source declaration and recompute derived fields from new magnitudes. For external definition refresh, recompile against the new declaration revision. A malformed/invalid candidate must not produce an old-value/new-unit pairing. A whole authored replacement is interpreted according to its supplied contracts and bounds; the application cannot infer an author’s prior intended units from a freshly loaded file.

Keep callback/save output canonical and stable. `getSavedStateFingerprint` already ignores `modifiedAt`. Exclude transient plan identities, normalize optional empty settings consistently, and test save → restore → save equality. A host echo of the current state should not trigger a rebuild. A real declaration/contract change must invalidate compilation even if raw rows retain the same array identity.

The host owns undo. Use `holdStateChanges` and the existing demo/project checkpoint path so one Apply creates one history action. Undo/redo restores values, contracts, active predicates, and labels together. No new internal undo engine is required.

### 7.8 CSV and complete analysis export

Keep table CSV machine-readable: native field identifiers and resolved scalar magnitudes in each column’s saved representation. A converted field in km/h exports 18, not `"18 km/h"`. The source m/s field can still export 5. Preserve selected rows, sort order, and selected columns according to the existing table export scope.

Make the export UI state that CSV contains values in the saved numerical representations, before display formatting, and does not carry declarations. A ratio stored as `0.12 [1]` may display as `12%` but exports `0.12`; a converted field stored as `12 [%]` exports `12`. Offer the existing complete analysis JSON as the reproducible export. Do not add a new companion-schema format in this release.

A standalone analysis export saves provider-input rows. In a project workspace these are already query-result rows, not the original folder’s raw datasets. Therefore that export must flatten the resolved quantity declarations for those exported **input columns** into its standalone field settings, while keeping local calculated fields as formula definitions. This is necessary to replay the snapshot independently and must not leak back into live project view settings.

CSV reimport alone remains undeclared. Never recover units from headers, suffixes, field names, numeric magnitudes, or a file with the same display name. A complete project remains the existing project/folder representation; a standalone analysis JSON is a snapshot, not a substitute archive of all original sources.

## 8. Scientific examples and the useful boundary

The supplied examples establish different authoring needs:

- **El Niño:** `sst` and `climatology` are readings; `anomaly` and annual `range` are differences. The annual low/high band describes observed extremes, not confidence or uncertainty. A quantity declaration does not change that statistical interpretation.
- **CO₂:** `co2` and `annual_center` are concentrations; `residual` changes the reference to the available-week annual mean while retaining a concentration scale. The mean is supplied, not a fitted trend. Record the fraction basis as meaning; `ppm` alone cannot establish it.
- **Coverage percentages:** `coverage_pct` needs an explicit decision whether stored numbers are percentage numbers or ratios. The name is not evidence of the numerical interpretation.
- **Nile:** the supplied `exploreda.eda` declares `volume` as numeric, but does not declare its physical scale. Do not infer it from the field name. A new synthetic annual-volume example can explicitly declare hm³ and a supplied duration, then calculate m³/s.

For a synthetic interval of 365 fixed days, 31.536 hm³ divided by that duration is exactly 1 m³/s mathematically. This is an interval-average discharge. It does not turn every calendar year into 365 days or make an annual volume a rate.

Declare the real examples’ semantics in their owning EDA/source definitions after the worker verifies the source documentation. Keep the existing descriptive `fields.json` files as evidence; do not silently promote their prose `unit` strings into parsed physical units.

The initial capability deliberately excludes general thermodynamic equations, logarithmic units, arbitrary precision, uncertainty propagation, automatic scientific reference inference, exchange services, and calendar arithmetic. Existing chart fits remain numeric algorithms; this mission does not certify regression-equation dimensional metadata or replace the separate regression design.

## 9. Implementation shape and staging

Add a compact `lib/quantities/` area:

- `types.ts`: shared declarations, resolved types, owner/status types, diagnostics.
- `units.ts`: bounded atom table, grammar, dimension operations, positive scales, anchored conversions.
- `analyze.ts`: existing-AST analysis, function/operator rules, fixed result contracts, per-node conversion plans.
- `aggregate.ts`: admissibility and output types for existing reducers/differences/relative changes.
- `codec.ts`: declaration/contract validation and text-key mapping.

The existing `Calculator` executes those plans. The existing manager stores them beside scalar caches. Do not introduce a parallel editor, generic plugin framework, service, or general-purpose quantity-expression runtime.

The companion plan specifies files, tests, fixture values, docs sections, and browser acceptance for four independently shippable milestones:

| Milestone | Usable outcome and required documentation/example |
| --- | --- |
| **M1 — Linear quantity calculations** | Declare units, calculate rates and compatible sums, handle unknown/dimensionless/percent distinctions, inspect conversions, and round-trip standalone JSON/Dashboard text. Include linear result-descriptor plumbing through existing reducers so counts/variance are not mislabeled. Extend `fields.mdx` and `calculated-fields.mdx` with a runnable distance/rate example. |
| **M2 — Readings, differences, and aggregate outputs** | Add affine readings/differences, conditional role checks, valid means/dispersion, forbidden reading sums/ratios, and correct metric/Composition outputs. Extend field/calculation, metric-card/pivot/Composition documentation with a runnable temperature example. |
| **M3 — Project source/query quantities** | Declare source and parameter quantities, calculate before/after aggregation, preserve aliases/owners, save project/folder definitions, and expose pooled-rate versus mean-rate results. Extend `project-folders.mdx` and Dashboard text documentation with a runnable project example. |
| **M4 — Notebook editing and reproducible handoff** | Save local declarations through notebook blocks, route inherited edits to their owner, refresh matching rows/environment, restore history, and export independent analysis snapshots with declarations. Extend `notebooks.mdx`, export/history guidance, and a runnable measured-quantities notebook. |

Every visible milestone includes real pointer/keyboard acceptance at **1280, 783, and 390 CSS pixels**. At 1280, source values and a calculation/trace can be inspected together. At 783, stacked/reflowed editors keep actions reachable and scope visible. At 390, sheets stay within the viewport, long units/errors wrap, close/Apply remain reachable, and no page-level horizontal overflow is introduced. Existing view-only grid behavior below 960 px remains.

The worker must use the repository’s shared test timeouts, source-driven demo workflow, required changeset, screenshots for visible work, and one `pnpm check` before the review PR. Those are future implementation checks, not performed work in this research run.

## 10. Decisive fixtures and verification status

The implementation plan contains the full fixture matrix. These anchors show the contract that decides the design:

| Case | Expected result or validity |
| --- | --- |
| `100 cm + 2 m` | 300 cm by left representation, or 3 m in the chosen result contract. |
| `1000 m / 200 s` | 5 m/s; explicit converted field 18 km/h. |
| Nested conversion divided by length | `convert(qty(1,"m"),"cm") / qty(2,"m") = 0.5`. |
| Reading and interval conversion | 0 °C → 32 °F; 10 Δ°C → 18 Δ°F. |
| Reading subtraction and addition | 20 °C − 10 °C = 10 Δ°C; reading + reading is invalid. |
| Mixed addition | 10 Δ°C + 68 °F = 86 °F, using the point operand’s representation. |
| Mixed reading average | Average of 0 °C and 212 °F = 50 °C = 122 °F. |
| Unknown versus dimensionless | Unknown numeric + length fails; explicitly dimensionless 3 + literal 2 gives 5. |
| Percent | 0.12 [1] and 12 [%] represent the same ratio; 0.12 [%] represents 0.0012 [1]. |
| Zero and missing | 0 m / 200 s = 0 m/s; missing input is not zero; an evaluated zero denominator errors; a lazy guarded branch can return null. |
| Conditional branches | 100 cm versus 2 m normalizes to one result representation; length versus duration fails even if the bad branch is currently unused. |
| Currency | USD + EUR and direct currency conversion fail; a declared explicit rate is a separate multiplicative input. |
| Pivot on 0 and 10 °C | Mean 5 °C, population stddev 5 Δ°C, variance 25 (Δ°C)²; corresponding Fahrenheit variance is 81 (Δ°F)². |
| Rate population | Mean of row speeds 20 m/s; ratio of total distance to total duration 25 m/s. |
| Dependency declaration correction | 1000 cm / 200 s = 0.05 m/s; corrected source declaration m gives 5 m/s in the same pinned output unit. |
| Same-unit tiny difference | 0.000000000001 °C − 0 °C preserves the small native-coordinate difference without an unnecessary Kelvin round trip. |
| Temperature role after cancellation | `delta(10,"degC") * 2` gives a 20 K difference; dividing a 10 Δ°C difference by 2 s and multiplying by 2 s gives a 10 K difference. Neither result is a reading. |
| Constructor disguise / identity conversion | `qty(1,"K*s/s")` fails after normalization; converting a K reading to the same K reading representation leaves its magnitude unchanged. |

### Performed

- Verified packet baseline and all 48 file boundary pairs; read all scoped files in full.
- Read 39 additional source/document files at the exact baseline to resolve actual ownership and consumer paths.
- Retrieved current primary references and compared runtime, grammar, affine behavior, license observations, and dependency reach.
- Executed **38 independent exact-arithmetic identities** with `fractions.Fraction`, covering scales, reading/difference conversions, percent, ratios, means, population variances, dependency reinterpretation, and fixed-duration volume rates.
- Examined the binary64 cancellation example independently: `(0.000000000001 + 273.15) - 273.15` produces about `1.0231815394945443e-12`, whereas direct same-coordinate subtraction preserves the input magnitude. This motivated the edge-conversion method.
- Checked familiar anchored equality arithmetic for 0 °C/32 °F and 20 °C/68 °F.

### Not performed

No repository tests, application execution, browser acceptance, package installation, candidate-library execution, bundle benchmark, or performance measurement occurred. No repository branch, source, or PR was modified. All implementation test cases and browser expectations remain proposed. Mathematical identities do not prove that current or future explorEDA code produces those values.

## 11. Stable recommendations

| ID / disposition | Recommendation | Reason |
| --- | --- | --- |
| **QC01 — Build** | Strict quantity analysis over the existing scalar AST. | Validates intermediate operations while retaining current execution/data boundaries. |
| **QC02 — Build** | Explicit per-formula checking with legacy Scalar behavior preserved. | Existing unlabeled calculations remain usable without receiving false certification. |
| **QC03 — Build** | Separate quantity declarations from display suffixes and raw parsing. | Prevents a label edit from reinterpreting measurements. |
| **QC04 — Build** | Small owned bounded unit resolver and conventional compound grammar. | Meets the requested workflows without adopting an additional expression/runtime system. |
| **QC05 — Build** | Reading/difference temperatures with anchored edge conversions. | Handles affine arithmetic and avoids unnecessary offset cancellation. |
| **QC06 — Build** | Explicit unknown, dimensionless, unit literals, and percent scales. | Removes the common unknown-equals-unitless and 12-versus-0.12 ambiguities. |
| **QC07 — Build** | Complete operator/function signatures and both-branch validation. | A valid current sample must not hide an invalid unused branch. |
| **QC08 — Build** | Author meaning tags and pinned result contracts. | Catches declared conflicts and keeps reusable output interpretation stable. |
| **QC09 — Build** | Ordinary numeric rows/caches with quantity-aware traces. | Reuses existing charts and exposes the actual conversions. |
| **QC10 — Build** | Reducer result semantics across shared, pivot, metric, and Composition paths. | An input formatter is insufficient for counts, variance, and differences. |
| **QC11 — Build** | New-field conversion and immutable applied reusable output contracts. | Preserves all existing numeric consumers without a universal migration engine. |
| **QC12 — Build** | Atomic dependency edits, preview invalidation, and whole-cache refresh. | Prevents old magnitudes from surviving a declaration change. |
| **QC13 — Build** | Distinct source/flat/query ownership with a readonly inherited environment. | Avoids shadow declarations and unstable host echoes. |
| **QC14 — Build** | One compiler shared by row/query execution and metadata-preserving adapters. | Both actual execution surfaces need the same rules. |
| **QC15 — Build** | Explicit JSON and Dashboard/project text codecs. | Prevents silently dropped options and nested-object stringification. |
| **QC16 — Build** | Definition-aware notebook writeback and inherited-owner navigation. | Makes UI edits durable without copying declarations into each block/sheet. |
| **QC17 — Build** | Synchronized refresh, existing host echo handling, and host-owned undo. | Keeps values, definitions, labels, and active scope coherent. |
| **QC18 — Build** | Scalar CSV plus complete standalone snapshots carrying their input declarations. | Preserves machine-readable data and offers a reproducible handoff. |
| **QC19 — Build** | Documentation and runnable examples in every visible milestone. | The feature ships with a usable workflow and responsive acceptance. |
| **QC20 — Explore** | A narrow math.js unit adapter if required vocabulary outgrows the table. | It is a credible future catalogue source; affine/meaning policy remains owned. |
| **QC21 — Defer** | Thermodynamic equations, logarithmic units, uncertainty, and calendar arithmetic. | They require additional semantic decisions outside the useful bounded feature. |
| **QC22 — Defer** | Incremental invalidation, vectorization, and worker execution. | The current whole-cache model should change only after measured latency. |
| **QC23 — Avoid** | Object-valued chart data, hidden suffix inference, automatic FX/reference inference, broad ontology, and renewed adoption gates. | These add incompatible scope or undermine the explicit design contract. |

## 12. Risks, rejected extensions, and open questions

The main implementation risk is **incomplete propagation**, not multiplication by 100. A typed calculation can be numerically correct while its notebook export, synthetic chart measure, or query-view adapter drops the descriptor. The plan therefore treats serialization and consumer plumbing as feature work in the same milestones.

The main scientific risk is **overclaiming**. Compatible dimensions do not prove compatible meaning or correct aggregation. Optional exact tags catch explicit disagreements; absence stays visible. Averages of rates, uncertain baselines, and raw-versus-centered CO₂ values remain author choices.

The main editing risk is **representation drift**. Pinning reusable result contracts and creating new converted fields avoids broad numeric-state migration. It is a deliberate usability tradeoff: users will sometimes keep both an original and a converted field. The source-interpretation correction path is powerful and must show its effects before Apply.

The main numerical risk is ordinary binary64 rounding/overflow. Anchored native-coordinate operations address the relevant affine trap without adding a numerical platform. Test independent expected values and use explicit tolerances; do not hide errors with a global epsilon.

**No blocking product question remains.** The report chooses the engine boundary, grammar, roles, unknown policy, ownership, edits, serialization, and staging. Codex should verify exact call signatures, rendering wrappers, and the chosen bounded-table constants while implementing. Actual bundle and interaction costs are implementation measurements. A broader unit catalogue, direct thermodynamic quantities, and in-place consumer migration remain optional later choices, not prerequisites to M1.

## Appendix A. Complete read inventory

The mission file `pro-prompt(20261027-013704).md` and attached `source-packet(20261027-013704).txt` were available locally. The inventories below list **87 complete repository files read at the pinned baseline: 48 supplied files and 39 necessary additional files**. They do not claim a complete repository audit.

### A.1 Supplied scoped packet — 48 complete files

```text
AGENTS.md
CODING_STANDARDS.md
README.md
apps/demo/public/daily-viz/projects/co2/fields.json
apps/demo/public/daily-viz/projects/co2/seasonal-centering.eda.md
apps/demo/public/daily-viz/projects/elnino/fields.json
apps/demo/public/daily-viz/projects/elnino/observed-range.eda
apps/demo/public/daily-viz/projects/nile/exploreda.eda
apps/demo/src/docs/pages/calculated-fields.mdx
apps/demo/src/docs/pages/fields.mdx
apps/demo/src/docs/pages/notebooks.mdx
docs/agent-guide.md
docs/intent/research-ideas-100/ideas/R036-quantity-unit-semantics.md
docs/intent/reusable-analysis-metrics/intent-brief.md
docs/intent/scientific-multivariate-analysis/intent-brief.md
docs/research/DIRECTION.md
docs/research/quantity-semantics-2026-10-20/README.md
docs/research/quantity-semantics-2026-10-20/decisions.md
docs/ui-defaults.md
package.json
packages/explorEDA/package.json
packages/explorEDA/src/components/FieldMetadata.tsx
packages/explorEDA/src/components/calculations/CalculationEditor.test.tsx
packages/explorEDA/src/components/calculations/CalculationEditor.tsx
packages/explorEDA/src/components/calculations/CalculationForm.tsx
packages/explorEDA/src/lib/aggregates.ts
packages/explorEDA/src/lib/analysis/evaluateProject.ts
packages/explorEDA/src/lib/calculations/CalculationState.ts
packages/explorEDA/src/lib/calculations/engine/Calculator.ts
packages/explorEDA/src/lib/calculations/functions/registry.ts
packages/explorEDA/src/lib/calculations/parser/semantics.ts
packages/explorEDA/src/lib/calculations/types.ts
packages/explorEDA/src/lib/dsl/compile.ts
packages/explorEDA/src/lib/dsl/export.ts
packages/explorEDA/src/lib/dsl/settingKeys.ts
packages/explorEDA/src/lib/fieldSettings.test.ts
packages/explorEDA/src/lib/fieldSettings.ts
packages/explorEDA/src/lib/notebook/compileNotebook.ts
packages/explorEDA/src/lib/notebook/writeBack.ts
packages/explorEDA/src/lib/valueParsing.ts
packages/explorEDA/src/node/projectFiles.ts
packages/explorEDA/src/providers/DataLayerProvider.tsx
packages/explorEDA/src/test/lib/calculations/engine/Calculator.test.ts
packages/explorEDA/src/test/lib/calculations/traceRow.test.ts
packages/explorEDA/src/test/providers/fieldSettingsProvider.test.tsx
packages/explorEDA/src/types/AnalysisProject.ts
packages/explorEDA/src/types/SavedDataStructure.ts
packages/explorEDA/src/utils/saveDataUtils.ts
```

### A.2 Additional exact-baseline reads — 39 complete files

These reads resolved the actual editor, project/folder/notebook ownership, CSV, aggregate, and Composition boundaries.

```text
apps/app/src/ProjectWorkspace.tsx
apps/demo/dailyCorpus.mjs
apps/demo/src/daily/corpus.ts
apps/demo/src/docs/pages/metric-card.mdx
apps/demo/src/docs/pages/project-folders.mdx
packages/explorEDA/src/components/ExplorEdaProject.tsx
packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx
packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx
packages/explorEDA/src/components/charts/BarChart/barPlan.ts
packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts
packages/explorEDA/src/components/charts/Calendar/calendarPlan.ts
packages/explorEDA/src/components/charts/Composition/calculations.ts
packages/explorEDA/src/components/charts/Composition/compositionTypes.ts
packages/explorEDA/src/components/charts/Composition/partsMarks.ts
packages/explorEDA/src/components/charts/Composition/resolveUnit.ts
packages/explorEDA/src/components/charts/Composition/useCompositionData.ts
packages/explorEDA/src/components/charts/DataTable/DataTable.tsx
packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx
packages/explorEDA/src/components/charts/Donut/donutPlan.ts
packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts
packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts
packages/explorEDA/src/components/charts/Map/regionMapPlan.ts
packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts
packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx
packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts
packages/explorEDA/src/components/charts/Waterfall/waterfallPlan.ts
packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx
packages/explorEDA/src/components/project/ProjectSchemaPanel.tsx
packages/explorEDA/src/components/schema/SchemaDrawer.tsx
packages/explorEDA/src/components/schema/SchemaInspector.tsx
packages/explorEDA/src/components/schema/schemaEditing.ts
packages/explorEDA/src/lib/dailyRollup.ts
packages/explorEDA/src/lib/dsl/parse.ts
packages/explorEDA/src/lib/dsl/project.ts
packages/explorEDA/src/lib/notebook/readNotebook.ts
packages/explorEDA/src/lib/notebook/sheets.ts
packages/explorEDA/src/lib/project/analysisText.ts
packages/explorEDA/src/lib/project/folder.ts
packages/explorEDA/src/lib/project/writeFolder.ts
```

### A.3 Existence verification is not a full read

Additional test paths named in the implementation plan were checked in pinned directory inventories, including notebook, folder, DSL, schema, pivot, metric-card, table, and Composition tests. Their bodies were not all read or executed. The same distinction applies to existing documentation filenames `dashboard-text.mdx`, `pivot.mdx`, `views-and-history.mdx`, and `export.mdx`: their existence was verified, but they are not included in the full-read counts above.

## Appendix B. Sources and baseline links

### B.1 Current primary references

Retrieved October 27, 2026. Version-specific references are identified where available. Moving branches and documentation pages are evidence of the retrieved state, not a dependency lockfile. The interpretation and product policy in this report are design judgments unless explicitly attributed to these sources.

| Reference | Primary source | Use in this design |
| --- | --- | --- |
| S01 | [BIPM — SI Brochure, ninth edition][S01]; [English v4.01, June 2026 PDF](https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-EN.pdf/2d2b50bf-f2b4-9661-f402-5f9d66e4b507?download=true&t=1780410776583&version=7.0) | Reading/interval relation, same-dimension kinds, percent. Relevant printed pages include 129, 136, and 146. |
| S02 | [NIST SP 811 — Chapter 7][S02] | Numerical values, quantities, notation, dimensionless representation. |
| S03 | [NIST SP 811 — Appendix B.9][S03] | Celsius/Fahrenheit reading and interval conversion factors. |
| S04 | [Pint 0.26.2 — Non-multiplicative units][S04] | Offset/delta behavior and explicit policy choices. |
| S05 | [Pint 0.26.2 — Overview][S05] | Python runtime/package context and BSD licensing. |
| S06 | [math.js — Units][S06] | JavaScript unit behavior, grammar, affine cautions. |
| S07 | [math.js — Custom bundling][S07] | Dependency reach and need to measure a real narrow import. |
| S08 | [math.js — History][S08] | Official retrieved release history, including 15.2.0. |
| S09 | [math.js — package manifest][S09]; [license](https://github.com/josdejong/mathjs/blob/develop/LICENSE) | Runtime/export/dependency information and main package license. |
| S10 | [UCUM — The Unified Code for Units of Measure, version 2.2][S10] | Interchange grammar, special units, semantically inert annotations. |
| S11 | [UCUM — License][S11] | Its distinct reuse/distribution terms; no catalogue copied here. |
| S12 | [PTC Mathcad Prime 12 — Unit checking][S12] | Dimension checking and energy/torque limitation. |
| S13 | [PTC Mathcad Prime 12 — Working with temperatures][S13] | Reading and temperature-change workflow. |
| S14 | [UnitMath — Official repository/documentation][S14] | JavaScript API and compound-unit parser tradeoffs. |
| S15 | [UnitMath — package manifest][S15] | Retrieved version 1.1.1, exports, declarations, licensing, dependency observation. |

[S01]: https://www.bipm.org/en/publications/si-brochure
[S02]: https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-7-rules-and-style-conventions-expressing-values
[S03]: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9
[S04]: https://pint.readthedocs.io/en/0.26.2/user/nonmult.html
[S05]: https://pint.readthedocs.io/en/0.26.2/getting/overview.html
[S06]: https://mathjs.org/docs/datatypes/units.html
[S07]: https://mathjs.org/docs/custom_bundling.html
[S08]: https://mathjs.org/history.html
[S09]: https://github.com/josdejong/mathjs/blob/develop/package.json
[S10]: https://ucum.org/ucum
[S11]: https://ucum.org/license
[S12]: https://support.ptc.com/help/mathcad/r12.0/en/PTC_Mathcad_Help/unit_checking.html
[S13]: https://support.ptc.com/help/mathcad/r12.0/en/PTC_Mathcad_Help/example_working_with_temperatures.html
[S14]: https://github.com/ericman314/UnitMath
[S15]: https://github.com/ericman314/UnitMath/blob/master/package.json

### B.2 Repository sources pinned to the baseline

Every repository link below uses `9d64a021e35d312887b1bc848e307f42b6c3091f`; current main is not substituted for the design evidence. Appendix A supplies the remaining exact file paths.

| Boundary | Pinned source |
| --- | --- |
| Mission authority and implementation rules | [Research direction](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/docs/research/DIRECTION.md), [AGENTS](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/AGENTS.md), [agent guide](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/docs/agent-guide.md) |
| Runtime and package constraints | [Root manifest](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/package.json), [library manifest](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/package.json) |
| Field declaration/display boundary | [fieldSettings.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/fieldSettings.ts), [FieldInspector.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx) |
| Scalar execution and caching | [Calculator.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/calculations/engine/Calculator.ts), [CalculationState.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/calculations/CalculationState.ts) |
| Runtime state and save converters | [DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/providers/DataLayerProvider.tsx) |
| Query frame execution | [AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/types/AnalysisProject.ts), [evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/analysis/evaluateProject.ts) |
| Independent reducers | [aggregates.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/aggregates.ts), [pivot calculations](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts), [Composition resolver](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/Composition/resolveUnit.ts) |
| Text codecs and canonical project ownership | [DSL parser](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/dsl/parse.ts), [project codec](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/dsl/project.ts), [analysisText.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/project/analysisText.ts) |
| Notebook persistence and host refresh | [writeBack.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/notebook/writeBack.ts), [ExplorEdaNotebook.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx), [ProjectWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/apps/app/src/ProjectWorkspace.tsx) |
| Folder and scalar CSV export | [folder.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/project/folder.ts), [writeFolder.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/project/writeFolder.ts), [DataTableToolbar.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx) |






