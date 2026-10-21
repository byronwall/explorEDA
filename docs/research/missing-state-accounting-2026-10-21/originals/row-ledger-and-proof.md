# R026 — Row ledger and proof

Research date: 2026-10-21, America/Indianapolis. Repository: [byronwall/explorEDA](https://github.com/byronwall/explorEDA). Source baseline: [`f4cacdde180e16ad814451a8c064e394535565d6`](https://github.com/byronwall/explorEDA/commit/f4cacdde180e16ad814451a8c064e394535565d6). Target review branch named by the request: `codex/missing-state-accounting-research-2026-10-21`; this research did not create or modify that branch.

## 1. Result and evidence boundary

**GO for source-grounded research and a bounded local proof; NO-GO for claiming executed product behavior.** The twelve rows can be accounted for without a universal definition of “valid” or “missing.” Adopt the ledger and scoped documentation as research integration (**MS01**); investigate count/action/display agreement (**MS02**), host-type preview/apply agreement (**MS03**), and absent-property batch/trace agreement (**MS04**); defer a shared private classifier (**MS05**); reject a universal state model (**MS06**). These are Codex review dispositions, not implementation approval. Conversion previews, numeric eligibility, categorical counts, calculated errors, and row filters have different contracts. Several differences are intentional. Three narrower discrepancies merit local reproduction: categorical Missing count versus its selected rows; host-declared type versus token-only preview inference; and absent-property handling in calculation execution versus trace. No application changes were made.

The attached selected packet supplied the named implementation, tests, rules, brief, queue, and pinned PR455 summary. GitHub read access and the exact commit were verified. Narrow supplemental reads at that same commit supplied calculation function/type contracts and the UI/provider call paths needed to avoid guessing. The packet itself is not a runnable checkout.

Evidence classes used throughout:

- **Frozen expectation:** a hypothesis recorded before this fixture was computed or compared with implementation. It may be wrong.
- **Source fact:** an expression, branch, test assertion, or call path read in pinned source.
- **Source prediction:** the result expected if that source executes on this fixture. It is not an observed UI result.
- **Executed arithmetic:** independent set coverage, cardinality, summary arithmetic, and a native-JavaScript serialization demonstration. No repository implementation was imported or executed.
- **Proposed proof:** executable repository test code and browser steps for Codex to run locally. These are not completed tests.

PR455 is reused only for its supplied pinned conclusion: preview validity differs from finite measurement eligibility, previews use all raw rows, profiles use effective filtered values, and failed conversion can become effective missingness. Its broad joint-pattern survey was not repeated. The present ledger concerns individual values, not missing records or missingness mechanisms.

## 2. Frozen predeclaration

The following hypothesis record was written before this subtask read the implementation or computed fixture outputs. Its original SHA256 is `cf1bd0a93e8cf1e91541bfd6b0782ce74cc90547607839f692f28916766211ad`. The original bytes are reproduced in Appendix A so the frozen-record hash is independently checkable; the complete fixture and predeclared partitions are also presented below. Subsequent findings do not rewrite these expectations.

### 2.1 Native fixture

```ts
const rows = [
  { id: 'r01', label: 'absent property', cohort: 'focus' },
  { id: 'r02', label: 'explicit undefined', cohort: 'other', x: undefined },
  { id: 'r03', label: 'null', cohort: 'other', x: null },
  { id: 'r04', label: 'empty string', cohort: 'focus', x: '' },
  { id: 'r05', label: 'whitespace', cohort: 'other', x: '   ' },
  { id: 'r06', label: 'configured token NA', cohort: 'focus', x: 'NA' },
  { id: 'r07', label: 'invalid numeric text', cohort: 'focus', x: 'oops' },
  { id: 'r08', label: 'numeric Infinity', cohort: 'other', x: Infinity },
  { id: 'r09', label: 'zero', cohort: 'focus', x: 0 },
  { id: 'r10', label: 'false', cohort: 'focus', x: false },
  { id: 'r11', label: 'finite numeric text', cohort: 'focus', x: '12.5' },
  { id: 'r12', label: 'invalid ISO date', cohort: 'focus', x: '2025-02-30' },
];
```

Every row exists. `r01` lacks only the property `x`. `r02` owns that property with value `undefined`. These are provenance distinctions; neither means an absent record. The proof adds `__ID` values 0–11 while retaining the human IDs. Original array position, human ID, `__ID`, and preview failure index are kept distinct.

Keep this fixture in native JavaScript/TypeScript. JSON serialization removes `r02.x` and changes `r08.x` from `Infinity` to `null`. That loss was demonstrated separately, not used to generate the analyzed fixture. CSV likewise cannot faithfully represent all of these native property/type distinctions without an explicit encoding.

### 2.2 Expected partitions recorded before comparison

The frozen word “valid” meant target-eligible unless described as passthrough. Discovering another preview meaning is an outcome of the experiment.

| Predeclared scenario | Expected partitions | Expected conservation |
| --- | --- | --- |
| Raw numeric measurement; no conversion | Eligible `{r09,r11}`; missing `{r01,r02,r03,r04,r05}`; excluded `{r06,r07,r08,r10,r12}` | `12 = 2 + 5 + 5` |
| Raw categorical; no conversion | Categories `{r04,r05,r06,r07,r08,r09,r10,r11,r12}`; missing `{r01,r02,r03}` | `12 = 9 + 3` |
| Numeric conversion and token `NA` | Valid `{r09,r11}`; recognized missing `{r01,r02,r03,r04,r05,r06}`; failed `{r07,r08,r10,r12}` | Preview `12 = 2 + 6 + 4`; applied numeric `12 = 2 + 10 + 0` |
| Category/string conversion and token `NA` | Categories `{r07,r08,r09,r10,r11,r12}`; missing `{r01,r02,r03,r04,r05,r06}`; no failures | `12 = 6 + 6 + 0` |
| Strict ISO date conversion and token `NA` | No valid dates; missing `{r01,r02,r03,r04,r05,r06}`; failed `{r07,r08,r09,r10,r11,r12}` | `12 = 0 + 6 + 6` |
| Raw missing-value filter | `{r01,r02,r03,r04,r05}`; category-profile parity was an explicit hypothesis | Five matched rows |
| Identity calculation | Underlying raw scalar distinctions should survive if the engine returns them | Exact error policy unresolved |
| `x + 1` | Finite `r09 → 1`, `r11 → 13.5`; remaining rows missing or error | Exact error partition unresolved |

Additional frozen assumptions: token policy was expected to operate independently of an interpretation override; date zero acceptance under strict ISO conversion was explicitly uncertain; a calculation function could have its own contract and must not be treated as a universal measurement predicate.

The filtered population was fixed as `cohort = 'focus'`: `{r01,r04,r06,r07,r09,r10,r11,r12}`. Its complement is `{r02,r03,r05,r08}`. Expected raw numeric conservation was `8 = 2 + 2 + 4`; expected applied numeric conservation was `8 = 2 + 6 + 0`. Conversion draft totals were expected to remain 12 because they concern all raw rows.

### 2.3 Differences from the frozen expectations

- **Confirmed by source:** raw numeric and categorical partitions; numeric conversion with `NA`; strict ISO date rejection; focus numeric partitions.
- **Disconfirmed:** categorical conversion is not string conversion or blank normalization. It returns `raw` unchanged after nullish/token checks, so `''`, `'   '`, `Infinity`, `0`, and `false` remain their original values. With `NA`, the source predicts **8 valid, 4 missing, 0 failed**, rather than the predeclared 6/6/0. That difference preserves useful category semantics. [FS]
- **Refined:** an untouched conversion preview does not test target eligibility. It predicts **9 valid, 3 missing, 0 failed**, including invalid measurements and blanks. “Valid” there means present passthrough without conversion error. [FS]
- **Disconfirmed as a universal invariant:** category-profile missing and null-filter membership differ. The profile counts nullish values only; the null filter also matches blank/whitespace text. The difference is 3 versus 5 on the same raw population. [ST] [AF] [FLR]
- **Refined:** direct calculation identity rejects numeric `Infinity`; source absence and explicit undefined diverge between batch execution and trace. `x + 1` has ten failures, not ten successful missing results. [CE] [CM] [RF]

## 3. The ledger model

For each record, retain these independent coordinates in the research ledger:

1. **Identity and population:** stable fixture ID, property ownership, full or filtered row membership, and filter owner.
2. **Stage:** raw scalar, conversion draft result plus error, applied effective scalar, calculated result plus error, or display/filter interpretation.
3. **Consumer:** numeric measurement, category frequency, datetime placement, conversion status, calculation status, or predicate membership.
4. **Reason:** raw origin or operation error, independent from the effective scalar now being missing.

These coordinates are a research representation, not a new public type or proposal to persist a state object on every row. A category can be a valid label and an unusable numeric measurement at the same time. `false` can be a valid Boolean result without being a numeric zero. `Infinity` can be preserved as a category while excluded from finite statistics. [VP] [ST] [FS]

### 3.1 Conservation equations

Let `P` be the declared population and `N(P)` its row count. Each equation is stage-specific:

- Numeric profile/distribution: `N(P) = measured(P) + missingMeasurement(P) + excludedMeasurement(P)`.
- Categorical profile/distribution: `N(P) = categoryRows(P) + nullishRows(P)`; `categoryRows` is the sum of all category frequencies, not `uniqueCount`.
- Datetime distribution: `N(P) = placeableDates(P) + nullishRows(P) + unplaceableDates(P)`.
- Conversion preview: `N(P) = validPreview(P) + recognizedMissing(P) + failedConversion(P)`, with failure precedence over missing output.
- Applied numeric values for this fixture: `missingApplied = recognizedMissing + failedConversion`. This is valid because every failure returns `undefined`, recognized missing inputs also do, and absent properties read as `undefined`; it is not a claim that their raw causes are equal.
- Calculated status: `N(P) = successfulPresent(P) + successfulNullish(P) + failedCalculation(P)`. The values map alone does not distinguish the last two; inspect the errors map as well.
- Filter result: `N(P) = matched(P) + notMatched(P)`. A separate count caption can only be a promise about that result if it uses the same predicate, stage, population, and owner.
- Full versus focus: `12 = 8 + 4`. Every full partition decomposes into its focus intersection plus complement.

`uniqueCount`/`distinct` is an independent property. Numeric `calculateValueStatistics` and distribution `countDistinct` add every non-nullish raw scalar, including blank text and excluded values. For the raw numeric probe, distinct is 9 even though finite measurements number 2. Adding unique count to missing or excluded is not a conservation equation. [ST] [FD]

## 4. Source-derived raw-state predictions

### 4.1 Row-level states before settings

The actual mixed fixture auto-infers **categorical**, because the nonmissing values are not all Boolean, numeric, or date text. A numeric raw profile below is an explicit helper/declared-type probe, not a claim that setting `type: 'numeric'` leaves the rows raw. Explicit settings invoke conversion first in the provider. [DT] [FP] [DP]

| Row | Raw numeric eligibility / reason | Raw category and untouched-preview state |
| --- | --- | --- |
| r01 | Missing measurement; absent property reads `undefined`; reason `Missing value` | Nullish missing |
| r02 | Missing measurement; own `undefined`; reason `Missing value` | Nullish missing |
| r03 | Missing measurement; `null`; reason `Missing value` | Nullish missing |
| r04 | Missing measurement; exact empty string; reason `Missing value` | Present empty category; preview valid |
| r05 | Missing measurement; whitespace; reason `Blank value` | Present whitespace category; preview valid |
| r06 | Excluded measurement; `NA` has no meaning without explicit token policy; reason `Not a finite number` | Present category; preview valid |
| r07 | Excluded measurement; `oops`; reason `Not a finite number` | Present category; preview valid |
| r08 | Excluded measurement; numeric `Infinity`; reason `Not a finite number` | Present numeric category; preview valid |
| r09 | Eligible finite measurement `0` | Present category; preview valid |
| r10 | Excluded measurement; reason `Boolean values are not numeric` | Present Boolean category; preview valid |
| r11 | Eligible measurement `12.5` parsed from text | Present text category; preview valid |
| r12 | Excluded measurement; reason `Not a finite number`; also an impossible ISO day | Present text category; preview valid |

Source: `isMissingValue`, `numericExclusionReason`, `finiteNumber`, `detectColumnType`, `calculateValueStatistics`, and `buildConversionPreview`. These source functions have different purposes; `numericExclusionReason` is not itself a comprehensive raw provenance taxonomy. [VP] [DT] [ST] [FS]

Full-population totals:

- Numeric raw helper: measured `{r09,r11}` = 2; missing `{r01,r02,r03,r04,r05}` = 5; excluded `{r06,r07,r08,r10,r12}` = 5; distinct = 9.
- Categorical raw profile: categories `{r04,r05,r06,r07,r08,r09,r10,r11,r12}` = 9; missing `{r01,r02,r03}` = 3; unique categories = 9.
- Untouched preview: valid `{r04,r05,r06,r07,r08,r09,r10,r11,r12}` = 9; missing `{r01,r02,r03}` = 3; failed = 0. Both `settings = {}` and purely formatting settings such as precision avoid conversion.
- Numeric finite statistics over `{0,12.5}`: minimum 0, maximum 12.5, mean 6.25, median 6.25, population standard deviation 6.25; histogram counts sum to 2. The arithmetic was checked independently; these values were not observed from an executed repository function.

### 4.2 Missing-filter membership — MS02

`applyFilter(value, {field:'x', type:'value', values:[null]})` matches `{r01,r02,r03,r04,r05}`. Its nullish-membership branch is supplemented by `isMissingValue`, so blank strings are intentionally included in the predicate. `FieldListRow` connects the Missing action to that exact filter. Therefore the same raw categorical population is source-predicted to show a missing count of **3** while the Missing action selects **5** rows. Under focus, its missing count is **1** (`r01`) while the predicate matches **2** (`r01,r04`). [AF] [FLR] [ST]

This is a concrete count/action discrepancy to reproduce, not evidence that blank categories should be eliminated everywhere. Candidate acceptance criteria are either a matching count and predicate, or an explicit caption that describes the wider null-or-blank selection. Existing public filter semantics must be checked before changing the predicate.

Include a separate blank-only categorical control with two rows, `x: ''` and `x: '   '`. Its categorical `nullCount` is predicted to be 0 while the existing null-or-blank predicate matches both rows. This catches a misleading “0 missing” or hidden count action that a mixed fixture can conceal. It does not justify reclassifying meaningful blank categories globally; record the actual available filter controls before proposing an interaction change. [ST] [AF] [FRR]

## 5. Conversion draft and applied-value predictions

### 5.1 Numeric settings

Use `settings = {type:'numeric', nullTokens:['NA']}`. `convertFieldValue` tests nullish raw input, then compares configured tokens with trimmed string text, then treats blank text as missing for noncategorical types, then attempts finite conversion. Tokens are exact after raw trimming; there is no case-folding rule here. Token declarations come from the analyst, not an inference that every `NA` is absent. [FS]

| Row | Numeric draft with `NA` | Applied value and retained origin |
| --- | --- | --- |
| r01 | Recognized missing | Still lacks `x`; property skipped by `applyFieldSettings`; read value undefined |
| r02 | Recognized missing | Own `x: undefined`; raw explicit undefined remains in raw data |
| r03 | Recognized missing | Own undefined; raw null remains in raw data |
| r04 | Recognized missing | Own undefined; raw empty string remains |
| r05 | Recognized missing | Own undefined; raw whitespace remains |
| r06 | Recognized missing because declared token matches | Own undefined; raw `NA` remains |
| r07 | Failed: `Not a finite number` | Own undefined; raw `oops` and preview failure remain recoverable |
| r08 | Failed: `Not a finite number` | Own undefined; raw numeric Infinity remains recoverable |
| r09 | Valid finite zero | Own `x: 0`; zero is retained |
| r10 | Failed: `Not a finite number` | Own undefined; raw Boolean false remains recoverable |
| r11 | Valid finite number | Own `x: 12.5`; raw text `'12.5'` remains |
| r12 | Failed: `Not a finite number` | Own undefined; raw invalid date text remains |

The full preview is `12 = 2 valid + 6 recognized missing + 4 failed`. The applied numeric profile is `12 = 2 measured + 10 missing + 0 excluded`, with distinct 2. **Do not add preview failures to applied missing:** those four failures are already among the ten effective missing values. Original values are available separately in raw data; the scalar `undefined` does not itself preserve why conversion failed. [FS] [DP]

Without `nullTokens`, numeric draft totals are `2/5/5`. `r06` moves from recognized missing to failed conversion. The applied values and applied numeric profile remain exactly the same, `2/10/0`. This is a negative result for scalar-only diagnostics: two different preparation decisions can have identical effective totals. The reason for `r06` changes a repair decision—declare an intentional token or repair unexpected text—even when the effective dataset does not change. [FS]

### 5.2 Categorical settings and token-only settings

Use `settings = {type:'categorical', nullTokens:['NA']}`. Full partitions are:

- Valid preserved categories: `{r04,r05,r07,r08,r09,r10,r11,r12}` = 8.
- Recognized missing: `{r01,r02,r03,r06}` = 4.
- Failed conversion: none.
- Applied categorical profile: 8 category rows, 4 nullish rows, 8 unique categories. `r04` and `r05` remain distinct categories; `r08` remains numeric Infinity and `r10` remains Boolean false.

With only `{nullTokens:['NA']}` and no host declaration, raw inference is categorical, so the same predictions apply. With only `{type:'categorical'}` and no tokens, the counts remain 9/3/0, though present raw null normalizes to undefined; absence is still skipped. This categorical operation deliberately preserves raw scalar types. [FS] [DT]

The applied categorical null filter matches `{r01,r02,r03,r04,r05,r06}` = 6, while its profile null count is 4. Again, blank text in that filter is broader than categorical nullish counting. [AF] [ST]

### 5.3 Separate strict ISO date scenario

Use `settings = {type:'datetime', datePreset:'iso', nullTokens:['NA']}` on the original raw fixture, not on the numeric-converted rows.

- Recognized missing `{r01,r02,r03,r04,r05,r06}` = 6.
- Failed with `Invalid date`: `{r07,r08,r09,r10,r11,r12}` = 6.
- Valid dates: none.
- Applied values: all twelve read as undefined; `r01` still lacks the property. Applied profile and date distribution both account for twelve missing values and no placeable values.

`r12 = '2025-02-30'` is rejected by calendar validation, rather than rolled into March. Numeric zero also fails this **text conversion**: `convertFieldValue` calls `parseDateText('0','iso')`. This does not contradict `timestampOf(0) === 0`, which treats an existing numeric date value as an epoch timestamp. They are distinct contracts. [FS] [VP]

An explicit raw datetime distribution probe has `{r09}` placeable, `{r01,r02,r03}` nullish, and `{r04,r05,r06,r07,r08,r10,r11,r12}` excluded: `12 = 1 + 3 + 8`. A datetime profile goes through the nonnumeric category-statistics branch, counting nine non-nullish scalar categories rather than nine valid dates. Therefore profile category frequencies and datetime placement exclusions cannot be equated without stating which quantity is intended. This probe is not the natural auto-inferred type of the mixed fixture. [FD] [ST]

### 5.4 Host-declared numeric type versus token-only preview — MS03

A separate source-reachable provider scenario uses the same raw rows and `fieldTypes={{x:'number'}}`, with no explicit field-settings type override. Declared `number` maps to internal `numeric`. The analyst leaves the inspector Type control on Auto and supplies only null token `NA`. [DFT] [FI]

- `getFieldConversionPreview` derives a raw profile without host `fieldTypes`, so it sees categorical inference and predicts **8 valid / 4 missing / 0 failed**.
- `updateFieldSettings` builds its conversion type map with `typeOverrides(..., fieldTypes)`, so applying the same token-only settings uses numeric conversion. The corresponding numeric operation is **2 valid / 6 recognized missing / 4 failed**, and the resulting numeric profile is **2 measured / 10 missing / 0 excluded**.
- Both operations concern the same 12 raw rows; this discrepancy cannot be explained by a changed filter denominator.
- Explicit `settings.type = 'numeric'` causes both routes to use numeric conversion and avoids this mismatch.

The inspector initializes its draft from saved settings, supplies that draft to the preview provider, updates null tokens without automatically setting type, and applies the same draft. This makes the route source-reachable, but no browser execution occurred. It is a stronger bounded consistency candidate than the intentional valid-versus-eligible distinction. A local reproduction must also inspect the displayed Auto/type label before deciding the smallest repair. [DP] [FI]

## 6. Focus population and display reconciliation

Use a chart-owned filter on `cohort = 'focus'`, with at least one chart present, while inspecting field `x`. This avoids conflating the primary proof with zero-chart workspace-filter routing. Keep the cohort filter independent of `x`, because changing `x`'s type, date preset, or tokens clears that field's filters in chart, workspace, and Rows settings. Other-field filters survive. [DP] [FFP]

| Stage or consumer | All 12 rows | Focus 8 rows |
| --- | --- | --- |
| Raw numeric helper/distribution: measured / missing / excluded | `2 / 5 / 5` | `2 / 2 / 4` |
| Raw categorical: category rows / nullish | `9 / 3` | `7 / 1` |
| Numeric + NA draft: valid / missing / failed | `2 / 6 / 4` | Hypothetical subset draft `2 / 3 / 3`; actual provider preview still uses all 12 |
| Applied numeric: measured / missing / excluded | `2 / 10 / 0` | `2 / 6 / 0` |
| Categorical + NA: category rows / nullish | `8 / 4` | `6 / 2` |
| Date + NA draft: valid / missing / failed | `0 / 6 / 6` | Hypothetical subset draft `0 / 3 / 5`; actual provider preview still uses all 12 |
| Applied date: placeable / missing / excluded | `0 / 12 / 0` | `0 / 8 / 0` |

The focus raw numeric partitions are measured `{r09,r11}`, missing `{r01,r04}`, excluded `{r06,r07,r10,r12}`. The focus numeric draft has recognized missing `{r01,r04,r06}` and failures `{r07,r10,r12}`. Applied missing is their union `{r01,r04,r06,r07,r10,r12}`. Focus category+NA missing is `{r01,r06}`; category rows are `{r04,r07,r09,r10,r11,r12}`. Focus date failures are `{r07,r09,r10,r11,r12}`. Every focus total is an intersection with the previously fixed set; no rows were silently removed.

`useFilteredFieldProfiles` uses effective source values and current calculated values, subject to filter ownership. Its `own` and `workspaceField` options can deliberately leave the edited field's own filter out; other filters remain. A profile opened from such a control therefore needs an explicit contextual denominator. Calculation preview describes all loaded rows before chart filters and then paginates five rows at a time; its “Failed rows only” toggle changes the table population, not the dataset. [FFP] [CP]

For numeric distribution population counts, `FieldOverview` combines `missing + excluded` in one Missing display. On the raw numeric probe that is 10 of 12, or 6 of 8 in focus. The decomposition is still 5 missing + 5 excluded, or 2 + 4 in focus. `FieldMetadata` exposes separate labels. An aggregate caption may be useful, but calling all ten rows “missing” without the decomposition obscures different repair choices. The displayed aggregate cannot be compared with a null-only predicate as if it named the same set. These are source-rendering predictions, not screenshot observations. [FO] [FM] [FRR]

## 7. Calculated inputs, results, and error propagation

### 7.1 Source contracts

`Calculator` rejects every evaluated nonfinite numeric intermediate, including an input literal/reference. `numericValue` throws `Missing numeric value` for nullish inputs and exact empty text; whitespace is instead `Invalid numeric value: ...`. Arithmetic accepts finite number text through `finiteNumber`, and rejects Boolean false. `count` counts its supplied arguments, including missing ones, but arguments are evaluated before the function executes. [CE] [RF]

`CalculationManager` keeps result and error maps separately. It stores unsuccessful results and successful nullish results as undefined in the result map. When executing a dependent calculation, it supplies the parent's stored value, not a tagged error object. `traceRow` recursively includes dependency traces, so a parent error may remain available there even if the child result succeeds. The registry contains no `ISNULL` or `COALESCE`; proposed examples must use supported expressions, such as `x == null`, and must handle their actual evaluation behavior. [CM] [RF]

### 7.2 Row-level arithmetic prediction

| Row | Raw `x + 1` batch outcome | After numeric+NA conversion |
| --- | --- | --- |
| r01 | Failure: `Missing numeric value` | Same batch failure; `x` remains absent |
| r02 | Failure: `Missing numeric value` | Same failure |
| r03 | Failure: `Missing numeric value` | Same failure after null becomes undefined |
| r04 | Failure: `Missing numeric value` | Same failure after empty becomes undefined |
| r05 | Failure: `Invalid numeric value: ` followed by three spaces | `Missing numeric value` |
| r06 | Failure: `Invalid numeric value: NA` | `Missing numeric value` |
| r07 | Failure: `Invalid numeric value: oops` | `Missing numeric value` |
| r08 | Failure: `Calculation produced a non-finite number` | `Missing numeric value` |
| r09 | Success `1` | Success `1` |
| r10 | Failure: `Invalid numeric value: false` | `Missing numeric value` |
| r11 | Success `13.5` | Success `13.5` |
| r12 | Failure: `Invalid numeric value: 2025-02-30` | `Missing numeric value` |

For both raw and numeric-applied arithmetic, `12 = 2 successful present + 0 successful missing + 10 failed`. The calculated numeric profile is nevertheless `2 measured + 10 missing + 0 excluded`, because the error map is not a column-profile input. Finite outputs are `{r09,r11}`; failure IDs are `{r01,r02,r03,r04,r05,r06,r07,r08,r10,r12}`. Focus has 2 successes and 6 failures. [CE] [CM] [ST]

### 7.3 Identity, null test, argument count, and chain

| Calculation and input stage | Source-predicted statuses | What changes a decision |
| --- | --- | --- |
| Direct `x`, raw batch | Present `{r04,r05,r06,r07,r09,r10,r11,r12}` = 8; successful missing `{r01,r02,r03}` = 3; failed `{r08}` = 1 | Even identity cannot pass Infinity through the calculator; raw category eligibility does not imply calculation eligibility |
| Direct `x`, numeric-applied batch | Present `{r09,r11}` = 2; missing `{r01,r02,r03,r04,r05,r06,r07,r08,r10,r12}` = 10; failed none | Applied identity cannot distinguish missing input from conversion failure without raw/preview evidence |
| `x == null`, raw batch | True `{r01,r02,r03}`; false `{r04,r05,r06,r07,r09,r10,r11,r12}`; failure `{r08}` | This is a nullish test, not a blank-or-invalid indicator; Infinity fails before equality |
| `x == null`, numeric-applied batch | True for ten effective-missing IDs; false `{r09,r11}`; no failure | It measures effective nullishness after conversion, not original cause |
| `count(x)`, raw batch | Eleven successful values `1`; failure `{r08}` | Missing arguments are counted; this is not a valid-observation count |
| `count(x)`, numeric-applied batch | Twelve successful values `1`; no failure | Argument count can increase while eligible measurements stay at two |
| `copy = x`; then `copy == null`, raw batch | `copy` fails at `{r08}`; child succeeds for all 12, with true `{r01,r02,r03,r08}` and false remaining eight | Error provenance is in the parent's errors/trace; child truth alone cannot distinguish it |
| `copy = x`; then `copy + 1`, raw batch | Same two finite outputs; r08's child error becomes `Missing numeric value` | Child error text is not the original cause |

Calculated profile accounting also needs its own stage. For raw `copy = x`, the value map has four nullish results `{r01,r02,r03,r08}` and eight present category values; its naturally inferred categorical profile is `12 = 8 + 4`, while calculation status was `8 present + 3 successful missing + 1 failure`. A numeric helper view of those same results would have measured `{r09,r11}` = 2, missing `{r01,r02,r03,r04,r05,r08}` = 6, and excluded `{r06,r07,r10,r12}` = 4. For `copyNullish`, the full result profile is Boolean with four true and eight false, no missing results, and no child errors; the parent error at r08 still belongs to the separate dependency evidence. [CM] [ST] [DT]

False is always a present successful Boolean result where produced. It must not be counted as missing through a truthiness test. Zero remains a finite measurement. These examples satisfy the requested propagation through existing functions without proposing new calculation functions. [CE] [CM] [RF]

### 7.4 Absent-property batch/trace discrepancy — MS04

`executeCalculation` inserts every expression dependency into the variable map; for `r01`, that creates key `x` with value undefined. `traceRow` starts from `Object.entries(row)` and adds calculated dependencies only. A missing source property therefore remains absent in trace. Provider `initializeData` only spreads the original row and adds `__ID`; it does not materialize absent fields, so the distinction can reach the manager. [INIT] `Calculator` throws `Undefined variable: x` when that key is absent. [CM] [CE]

Predictions for direct `x`:

- Raw batch, r01: successful missing, no error. Raw trace, r01: `Undefined variable: x`.
- Raw batch and trace, r02: successful missing with no error, because an own undefined property creates a variable-map entry.
- After numeric settings, r01 remains absent because `applyFieldSettings` skips it; this discrepancy can persist. r02 remains own undefined.
- Raw Infinity r08 fails in both routes; this is a separate nonfinite guard, not an absence inconsistency.

The smallest falsification is a `CalculationManager` test comparing `getErrors('copy')` and `traceRow('copy', 0)` on these rows. A browser check should then compare preview row status to its trace. No broader classification is necessary to reproduce the difference.

## 8. Checks actually run

An independent Node v24.19.0 script checked manually recorded source-prediction sets. It imported only `node:assert/strict`, not repository code. Executed results:

```text
rawNumeric       2/5/5   focus 2/2/4
rawCategorical   9/3/0   focus 7/1/0
numericNA        2/6/4   focus 2/3/3
numericNoToken   2/5/5   focus 2/2/4
numericApplied   2/10/0  focus 2/6/0
categoryNA       8/4/0   focus 6/2/0
dateNA           0/6/6   focus 0/3/5
dateApplied      0/12/0  focus 0/8/0
rawIdentity      8/3/1   focus 7/1/0
rawPlusOne       2/0/10  focus 2/0/6
rawCount         11/0/1  focus 8/0/0
```

Every listed three-way partition is disjoint and covers exactly twelve IDs; focus intersections cover exactly eight IDs. The finite summary arithmetic and explicit JSON-loss assertions passed. This proves consistency of the hand-derived ledger, not correctness of the application implementation. The TypeScript/React tests below, full test suite, type checks, browser flow, exported data, undo, and reopen were **not run**.

## 9. Executable local proof proposal — not executed here

The following proposed test file calls actual repository functions. It does not copy their conversion algorithms or modify application behavior. Place it in a verified local checkout as `packages/explorEDA/src/test/providers/missingStateAccounting.research.test.tsx`. The source-characterization tests intentionally assert predicted baseline behavior, including discrepancies. They should be independently reviewed before adoption as regression contracts. After reproducing a discrepancy and choosing a repair, replace the corresponding characterization with the intended parity assertion.

The handcrafted expressions use the pinned `Expression` type and existing `Calculator`/registry through `CalculationManager`; parser syntax is not an extra unverified dependency of this proof. Console output identifies stages and row IDs for debugging.

```tsx
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { applyFilter } from '@/hooks/applyFilter';
import { buildFieldDistribution } from '@/lib/fieldDistribution';
import { buildFieldProfiles, buildValuesProfile } from '@/lib/fieldProfiles';
import {
  applyFieldSettings,
  buildConversionPreview,
  convertFieldValue,
  type FieldSettings,
} from '@/lib/fieldSettings';
import {
  CalculationManager,
  type CalculationDefinition,
} from '@/lib/calculations/CalculationState';
import type { Expression, CalculationValue } from '@/lib/calculations/types';
import {
  DataLayerProvider,
  useDataLayer,
  type DatumObject,
  type HasId,
} from '@/providers/DataLayerProvider';

const makeRows = (): (DatumObject & HasId)[] => [
  { __ID: 0, id: 'r01', cohort: 'focus' },
  { __ID: 1, id: 'r02', cohort: 'other', x: undefined },
  { __ID: 2, id: 'r03', cohort: 'other', x: null },
  { __ID: 3, id: 'r04', cohort: 'focus', x: '' },
  { __ID: 4, id: 'r05', cohort: 'other', x: '   ' },
  { __ID: 5, id: 'r06', cohort: 'focus', x: 'NA' },
  { __ID: 6, id: 'r07', cohort: 'focus', x: 'oops' },
  { __ID: 7, id: 'r08', cohort: 'other', x: Infinity },
  { __ID: 8, id: 'r09', cohort: 'focus', x: 0 },
  { __ID: 9, id: 'r10', cohort: 'focus', x: false },
  { __ID: 10, id: 'r11', cohort: 'focus', x: '12.5' },
  { __ID: 11, id: 'r12', cohort: 'focus', x: '2025-02-30' },
];
const numeric: FieldSettings = { type: 'numeric', nullTokens: ['NA'] };
const categorical: FieldSettings = { type: 'categorical', nullTokens: ['NA'] };
const datetime: FieldSettings = {
  type: 'datetime', datePreset: 'iso', nullTokens: ['NA'],
};
const focus = (rows: ReturnType<typeof makeRows>) =>
  rows.filter(row => applyFilter(row.cohort, { field: 'cohort', type: 'value', values: ['focus'] }));
const ids = (rows: ReturnType<typeof makeRows>) => rows.map(row => row.id);
const column = (rows: ReturnType<typeof makeRows>) =>
  Object.fromEntries(rows.map(row => [row.__ID, row.x]));
const applied = (rows: ReturnType<typeof makeRows>, settings: FieldSettings) =>
  applyFieldSettings(rows, { x: settings }, { x: 'categorical' });
const xProfile = (rows: ReturnType<typeof makeRows>) =>
  buildFieldProfiles(rows).find(profile => profile.name === 'x')!;
const partition = (rows: ReturnType<typeof makeRows>, settings: FieldSettings) => {
  const groups = { valid: [] as string[], missing: [] as string[], failed: [] as string[] };
  for (const row of rows) {
    const result = convertFieldValue(row.x, settings.type ?? 'categorical', settings);
    const key = result.error ? 'failed' : result.value == null ? 'missing' : 'valid';
    groups[key].push(String(row.id));
  }
  console.log('R026 conversion partitions', settings, groups);
  return groups;
};

function reference(name: string): Expression {
  return {
    id: `ref-${name}`, name, expression: name, rawInput: name,
    dependencies: [name], type: 'literal', value: undefined,
  };
}
function literal(value: CalculationValue): Expression {
  return {
    id: `literal-${String(value)}`, name: '', expression: String(value),
    rawInput: String(value), dependencies: [], type: 'literal', value,
  };
}
function binary(operator: string, left: Expression, right: Expression): Expression {
  return {
    id: `binary-${operator}-${left.id}-${right.id}`, name: '', type: 'basic',
    expression: operator, rawInput: `${left.rawInput} ${operator} ${right.rawInput}`,
    dependencies: [...new Set([...left.dependencies, ...right.dependencies])],
    operator, left, right,
  };
}
function call(name: string, args: Expression[]): Expression {
  return {
    id: `call-${name}`, name: '', type: 'function', functionName: name,
    arguments: args, expression: name, rawInput: `${name}(${args.map(arg => arg.rawInput).join(", ")})`,
    dependencies: [...new Set(args.flatMap(arg => arg.dependencies))],
  };
}
const definitions = (): CalculationDefinition[] => [
  { resultColumnName: 'copy', expression: reference('x') },
  { resultColumnName: 'plusOne', expression: binary('+', reference('x'), literal(1)) },
  { resultColumnName: 'nullish', expression: binary('==', reference('x'), literal(null)) },
  { resultColumnName: 'argumentCount', expression: call('count', [reference('x')]) },
  { resultColumnName: 'sumOne', expression: call('sum', [reference('x'), literal(1)]) },
  { resultColumnName: 'copyNullish', expression: binary('==', reference('copy'), literal(null)) },
];

function calculate(rows: ReturnType<typeof makeRows>) {
  const defs = definitions();
  const manager = new CalculationManager(rows, defs);
  const byName = (name: string) => {
    const definition = defs.find(item => item.resultColumnName === name);
    if (!definition) throw new Error(`Unknown proof calculation ${name}`);
    return manager.executeCalculation(definition);
  };
  return { manager, byName };
}

afterEach(cleanup);

describe('R026 source characterizations; review before adopting contracts', () => {
  it('keeps the native fixture and declares raw profile semantics', () => {
    const rows = makeRows();
    expect(Object.hasOwn(rows[0]!, 'x')).toBe(false);
    expect(Object.hasOwn(rows[1]!, 'x')).toBe(true);
    expect(rows[7]!.x).toBe(Infinity);
    expect(xProfile(rows)).toMatchObject({ dataType: 'categorical', nullCount: 3, uniqueCount: 9 });
    const numericRaw = buildValuesProfile('x', rows.map(row => row.x), 'numeric');
    expect(numericRaw).toMatchObject({
      totalCount: 12, nullCount: 5, excludedCount: 5, uniqueCount: 9,
      statistics: { min: 0, max: 12.5, mean: 6.25, median: 6.25, stdDev: 6.25 },
    });
    expect(numericRaw.statistics?.bins?.reduce((sum, count) => sum + count, 0)).toBe(2);
    expect(buildConversionPreview('x', rows, {}, 'categorical')).toMatchObject({
      totalCount: 12, validCount: 9, missingCount: 3, failedCount: 0,
    });
  });

  it('reconciles numeric conversion and retains raw provenance', () => {
    const rows = makeRows();
    expect(partition(rows, numeric)).toEqual({
      valid: ['r09', 'r11'], missing: ['r01', 'r02', 'r03', 'r04', 'r05', 'r06'],
      failed: ['r07', 'r08', 'r10', 'r12'],
    });
    const preview = buildConversionPreview('x', rows, numeric, 'categorical');
    expect(preview).toMatchObject({ totalCount: 12, validCount: 2, missingCount: 6, failedCount: 4 });
    expect(preview.failures.map(item => rows[item.row]!.id)).toEqual(['r07', 'r08', 'r10', 'r12']);
    const next = applied(rows, numeric);
    expect(Object.hasOwn(next[0]!, 'x')).toBe(false);
    expect(Object.hasOwn(next[1]!, 'x')).toBe(true);
    expect(next.filter(row => row.x != null).map(row => [row.id, row.x])).toEqual([
      ['r09', 0], ['r11', 12.5],
    ]);
    expect(xProfile(next)).toMatchObject({ totalCount: 12, nullCount: 10, excludedCount: 0, uniqueCount: 2 });
    expect(rows[5]!.x).toBe('NA');
    expect(rows[7]!.x).toBe(Infinity);
    expect(rows[10]!.x).toBe('12.5');
    const noToken = { type: 'numeric' as const };
    expect(buildConversionPreview('x', rows, noToken, 'categorical')).toMatchObject({
      validCount: 2, missingCount: 5, failedCount: 5,
    });
    expect(applied(rows, noToken)).toEqual(next);
  });

  it('preserves category values and explicitly rejects the predeclared blank-normalization hypothesis', () => {
    const rows = makeRows();
    expect(partition(rows, categorical)).toEqual({
      valid: ['r04', 'r05', 'r07', 'r08', 'r09', 'r10', 'r11', 'r12'],
      missing: ['r01', 'r02', 'r03', 'r06'], failed: [],
    });
    const next = applied(rows, categorical);
    expect(next[3]!.x).toBe('');
    expect(next[4]!.x).toBe('   ');
    expect(next[7]!.x).toBe(Infinity);
    expect(next[9]!.x).toBe(false);
    expect(xProfile(next)).toMatchObject({ dataType: 'categorical', nullCount: 4, uniqueCount: 8 });
  });

  it('keeps date conversion separate from numeric timestamp placement', () => {
    const rows = makeRows();
    expect(partition(rows, datetime)).toEqual({
      valid: [], missing: ['r01', 'r02', 'r03', 'r04', 'r05', 'r06'],
      failed: ['r07', 'r08', 'r09', 'r10', 'r11', 'r12'],
    });
    expect(applied(rows, datetime).every(row => row.x === undefined)).toBe(true);
    expect(buildFieldDistribution(column(rows), 'datetime').all).toMatchObject({
      rows: 12, values: 1, missing: 3, excluded: 8,
    });
  });

  it('characterizes categorical Missing count versus selected membership', () => {
    const rows = makeRows();
    const missingRows = rows.filter(row => applyFilter(row.x, { field: 'x', type: 'value', values: [null] }));
    expect(xProfile(rows).nullCount).toBe(3);
    expect(ids(missingRows)).toEqual(['r01', 'r02', 'r03', 'r04', 'r05']);
    console.log('R026 count/action mismatch', { count: 3, selectedIds: ids(missingRows) });
    // Acceptance after a reviewed repair must reconcile count and predicate/caption.
  });

  it('reconciles all versus focus populations without changing preview scope', () => {
    const rows = makeRows();
    const selected = focus(rows);
    expect(ids(selected)).toEqual(['r01', 'r04', 'r06', 'r07', 'r09', 'r10', 'r11', 'r12']);
    const selectedIds = new Set(selected.map(row => row.__ID));
    const raw = buildFieldDistribution(column(rows), 'numeric', selectedIds);
    expect(raw.all).toMatchObject({ rows: 12, values: 2, missing: 5, excluded: 5 });
    expect(raw.filtered).toMatchObject({ rows: 8, values: 2, missing: 2, excluded: 4 });
    const next = applied(rows, numeric);
    const converted = buildFieldDistribution(column(next), 'numeric', selectedIds);
    expect(converted.filtered).toMatchObject({ rows: 8, values: 2, missing: 6, excluded: 0 });
    expect(buildConversionPreview('x', rows, numeric, 'categorical').totalCount).toBe(12);
    expect(buildValuesProfile('x', focus(next).map(row => row.x), 'numeric')).toMatchObject({
      totalCount: 8, nullCount: 6, excludedCount: 0,
    });
  });

  it('distinguishes calculation status from effective missing result values', () => {
    const rows = makeRows();
    const { manager, byName } = calculate(rows);
    const plus = byName('plusOne');
    expect(plus.get(8)).toBe(1);
    expect(plus.get(10)).toBe(13.5);
    expect([...manager.getErrors('plusOne').keys()]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 9, 11]);
    expect(byName('sumOne')).toEqual(plus);
    expect(manager.getErrors('plusOne').get(7)).toBe('Calculation produced a non-finite number');
    expect(byName('copy').get(7)).toBeUndefined();
    expect(manager.getErrors('copy').size).toBe(1);
    expect(byName('nullish').get(0)).toBe(true);
    expect(byName('nullish').get(3)).toBe(false);
    expect(manager.getErrors('nullish').has(7)).toBe(true);
    const counted = byName('argumentCount');
    expect(counted.get(0)).toBe(1);
    expect(counted.get(9)).toBe(1);
    expect(manager.getErrors('argumentCount').has(7)).toBe(true);
    expect(byName('copyNullish').get(7)).toBe(true);
    expect(manager.getErrors('copyNullish').size).toBe(0);
    expect(manager.traceRow('copyNullish', 7)?.dependencies[0]?.error)
      .toBe('Calculation produced a non-finite number');
    const converted = calculate(applied(rows, numeric));
    expect(converted.manager.getErrors('copy').size).toBe(0);
    expect(converted.byName('argumentCount').size).toBe(12);
    expect([...converted.byName('argumentCount').values()]).toEqual(Array(12).fill(1));
    expect(converted.manager.getErrors('plusOne').get(7)).toBe('Missing numeric value');
  });

  it('characterizes absent versus own undefined in batch and trace', () => {
    const { manager, byName } = calculate(makeRows());
    byName('copy');
    expect(manager.getErrors('copy').has(0)).toBe(false);
    expect(manager.traceRow('copy', 0)?.error).toBe('Undefined variable: x');
    expect(manager.getErrors('copy').has(1)).toBe(false);
    expect(manager.traceRow('copy', 1)?.error).toBeUndefined();
    console.log('R026 batch/trace mismatch', manager.traceRow('copy', 0));
    // After repair, replace the mismatch characterization with status parity.
  });

  it('characterizes a host-declared numeric token-only preview/apply mismatch', async () => {
    let latest!: {
      preview: (settings: FieldSettings) => ReturnType<typeof buildConversionPreview>;
      apply: (settings: FieldSettings) => void;
      data: ReturnType<typeof makeRows>;
      profiles: ReturnType<typeof buildFieldProfiles>;
    };
    function Probe() {
      const getPreview = useDataLayer(state => state.getFieldConversionPreview);
      const update = useDataLayer(state => state.updateFieldSettings);
      const data = useDataLayer(state => state.data);
      const profiles = useDataLayer(state => state.fieldProfiles);
      latest = {
        preview: settings => getPreview('x', settings),
        apply: settings => update('x', settings),
        data, profiles,
      };
      return null;
    }
    render(
      <DataLayerProvider data={makeRows()} charts={[]} fieldTypes={{ x: 'number' }}>
        <Probe />
      </DataLayerProvider>,
    );
    if (!latest) throw new Error('Provider proof did not render');
    const before = latest.preview({ nullTokens: ['NA'] });
    expect(before).toMatchObject({
      effectiveType: 'categorical', totalCount: 12, validCount: 8, missingCount: 4, failedCount: 0,
    });
    await act(async () => latest!.apply({ nullTokens: ['NA'] }));
    expect(latest.profiles.find(profile => profile.name === 'x')).toMatchObject({
      dataType: 'numeric', totalCount: 12, nullCount: 10, excludedCount: 0,
    });
    expect(latest.data.filter(row => row.x != null).map(row => row.id)).toEqual(['r09', 'r11']);
    expect(latest.preview({ type: 'numeric', nullTokens: ['NA'] })).toMatchObject({
      effectiveType: 'numeric', validCount: 2, missingCount: 6, failedCount: 4,
    });
    console.log('R026 token-only preview/apply mismatch', before, latest.profiles);
    // After repair, assert preview effectiveType and failure reasons match apply.
  });
});
```

### 9.1 Local run sheet

This is a proposal for Codex in the user's existing checkout. It was not executed here. Review and save the proposed test source first. The commands do not push, merge, or deploy. A clean pinned worktree can be prepared by Codex according to the repository's working rules; this report does not reset or change an existing checkout.

```bash
# Work in the verified local checkout; preserve unrelated edits.
cd /Users/byronwall/Projects/explorEDA

# Confirm the intended owner, remote, baseline object, and working state.
git remote -v
git status --short
git show --no-patch --format='%H %s' f4cacdde180e16ad814451a8c064e394535565d6
git rev-parse HEAD

# Run the reviewed R026 proof against the recorded source revision.
# If HEAD differs, use a separately prepared pinned worktree or record the diff first.
pnpm --filter exploreda exec vitest run src/test/providers/missingStateAccounting.research.test.tsx

# Run the existing focused contracts read during this research.
pnpm --filter exploreda exec vitest run src/lib/valueParsing.test.ts src/lib/fieldSettings.test.ts src/lib/fieldProfiles.test.ts src/test/providers/fieldSettingsProvider.test.tsx
pnpm --filter exploreda check-types

# For document/example integration, run the corresponding docs checks.
pnpm --filter demo docs:check

# Repository gate: one invocation only, before a scoped review PR.
pnpm check
```

The full gate belongs to local integration, not to this packet-only research session. Respect `@repo/test-config` timeouts; do not add per-test timeouts. If local source differs from the pin, retain the old ledger as a hypothesis and record the changed symbols before updating expected results.

### 9.2 Browser proof and runnable example proposal — MS01–MS04

Pair any accepted user-visible change with its docs page and example in the same milestone:

- Extend `/docs/fields` and existing live example ID `fields` with this native fixture, the independent cohort filter, untouched preview, numeric+NA conversion, and raw recovery. A new focused ID such as `missing-state-accounting` is only a proposal, not an existing registered example.
- Extend `/docs/summary` and example `summary` to state measured/missing/excluded denominators and show why nine raw distinct scalars do not imply nine finite measurements.
- Extend `/docs/calculated-fields` and example `calculations` with direct identity, `x + 1`, an upstream failure, a downstream nullish test, and the batch-versus-trace check. Show errors independently from missing results.

Scripted browser steps should identify exact human IDs, not just counts:

1. Load the native fixture without any field settings or host type declaration; verify r01 lacks x, r02 owns undefined, r08 is Infinity, r09 is zero, and r10 is false in the backing data.
2. Inspect categorical counts and activate Missing. Record caption, selected IDs, owner, and denominator before deciding whether the mismatch is a label or selection-contract issue (**MS02**).
3. In a separate untouched two-row categorical control, use `x: ''` and `x: '   '`. Verify the predicted categorical null count of zero, record whether the count action is shown, and inspect the existing missing-filter controls and their exact selected IDs. The current null-or-blank predicate should match both rows; do not infer the UI is unreachable without observing it (**MS02**). Restore the original twelve-row fixture before continuing.
4. Apply the cohort filter, confirm eight IDs, then open conversion preview and confirm that its denominator remains all twelve raw rows (**MS01**).
5. Compare numeric drafts with and without NA. Confirm that applied values are identical while preview failure reasons differ. Then apply numeric+NA settings, inspect the two finite rows and ten effective missing rows, and recover each failure's raw value. Do not assume the effective missing count preserves the reason by itself (**MS01–MS02**).
6. For the host-declaration witness, remount/reset the original raw fixture with `fieldTypes={{x:'number'}}` and **no explicit saved or draft field-settings type override**. Leave the inspector Type control on Auto, add only `NA` as a null token, and compare preview type/counts with applied type/values. Continuing from step 5's explicit numeric settings would remove the witness; use this separate fresh state (**MS03**).
7. Reload the original **untouched raw** fixture without conversion settings or host declarations. Add `copy = x`, `plusOne = x + 1`, and the dependent nullish expression. Compare r01/r02 preview statuses and traces, r08's Infinity upstream error, and the downstream nullish result. Record whether each preview row status agrees with its trace (**MS04**). A broader redesign of dependency-error propagation remains separate work.
8. In that calculation scenario, separately apply numeric+NA settings and repeat. At r08, `copy = x` should now be successful missing with no copy error, while `plusOne` should report `Missing numeric value`; the raw Infinity cause remains in raw/preview evidence. r01's absent-property batch/trace discrepancy may persist because application skips absent properties (**MS01**, **MS04**).
9. Verify the changed flow with pointer and keyboard at 1280, 783, and 390 px; preserve visible scope and reachable actions. If later integration adds a user-visible change, take repository-standard screenshots.


No actual author comparison, repair-time measurement, browser result, or demand claim is supplied. If existing raw inspection, preview failures, and a short explanation already let an author correctly repair the fixture, retain **MS05** as deferred and reject an additional classification UI. **MS06** rejects a universal state model that forces category and measurement semantics together.

## 10. Access, read paths, remaining gaps, and stop rules

**Access:** exact repository and commit are readable; selected source is available; no runnable or writable project checkout was used. **Read paths:** repository rules, `valueParsing.ts` and tests, `fieldSettings.ts` and tests, `fieldProfiles.ts` and tests, statistics and type detection, `fieldDistribution.ts`, `applyFilter.ts`, `useFilteredFieldProfiles.ts`, provider and its included settings test, `Calculator.ts`, `CalculationState.ts`, `CalculationPreview.tsx`, field rendering/click paths, declared type mapping, calculation registry/types, the three docs pages, the R026 brief, and the pinned PR455 summary. Exact provenance is provided in the companion source report.

**Actually run:** independent arithmetic/set conservation and native serialization-loss assertions; source/identity receipt checks. **Not run:** proposed repository tests, type checker, complete application, React browser flow, full `pnpm check`, save/export/undo/reopen proof, or author comprehension study. No application implementation, public API, Git write, PR, merge, or deployment occurred.

**Remaining gaps:** whether the source-predicted discrepancies reproduce unchanged in the full pinned application; desired count/filter wording versus predicate compatibility; whether a minimal explanation enables the actual repair task; browser reachability and interaction details under real state; and persistence fidelity for native undefined/Infinity across any export format. There is no named demand evidence.

**Stop rules:** stop a local proof if a required pinned dependency is absent, baseline identity differs without an explicit comparison, or fixture transport has silently changed undefined/Infinity. Do not infer missing records, impute values, clean automatically, or diagnose missingness mechanisms. Reject broader classification when a bounded correction and existing diagnostics explain each row and conserve the declared populations.

## Appendix A. Original frozen hypothesis record

The next four-backtick block contains the exact original UTF-8 file, including its final LF. To verify its SHA256, extract only the block body and preserve the final newline. The predeclaration is a hypothesis record; the retained categorical expectation is intentionally contradicted by the later source prediction.

````markdown
# R026 predeclared ledger — frozen before source tracing or fixture computation

Date: 2026-10-21 (America/Indianapolis). This is a hypothesis record, not a claim about executed application behavior. Baseline: `f4cacdde180e16ad814451a8c064e394535565d6`. This record was written after reading the task and repository working rules, but before reading the implementation for this subtask, evaluating this fixture, or comparing source-derived outputs. Do not amend expected partitions after comparison; report discrepancies separately.

## Native JavaScript fixture

```ts
const rows = [
  { id: 'r01', label: 'absent property', cohort: 'focus' },
  { id: 'r02', label: 'explicit undefined', cohort: 'other', x: undefined },
  { id: 'r03', label: 'null', cohort: 'other', x: null },
  { id: 'r04', label: 'empty string', cohort: 'focus', x: '' },
  { id: 'r05', label: 'whitespace', cohort: 'other', x: '   ' },
  { id: 'r06', label: 'configured token NA', cohort: 'focus', x: 'NA' },
  { id: 'r07', label: 'invalid numeric text', cohort: 'focus', x: 'oops' },
  { id: 'r08', label: 'numeric Infinity', cohort: 'other', x: Infinity },
  { id: 'r09', label: 'zero', cohort: 'focus', x: 0 },
  { id: 'r10', label: 'false', cohort: 'focus', x: false },
  { id: 'r11', label: 'finite numeric text', cohort: 'focus', x: '12.5' },
  { id: 'r12', label: 'invalid ISO date', cohort: 'focus', x: '2025-02-30' },
];
```

Keep rows as native objects. Never round-trip this fixture through JSON: explicit undefined properties disappear and Infinity becomes null. Absent property is a property-provenance distinction, not an absent record.

## Provisional expected partitions

These expectations intentionally state the analyst's anticipated meanings. Existing source semantics may legitimately differ. “Valid” below means target-eligible unless explicitly named preview passthrough; discovering that a preview uses another meaning is a result.

- Raw numeric measurement, no conversion: eligible `{r09,r11}`; missing `{r01,r02,r03,r04,r05}`; excluded `{r06,r07,r08,r10,r12}`. Expected conservation: `12 = 2 + 5 + 5`.
- Raw categorical profile, no conversion: categories `{r04,r05,r06,r07,r08,r09,r10,r11,r12}`; missing `{r01,r02,r03}`. Empty and whitespace strings are provisionally preserved as distinct categories. Expected conservation: `12 = 9 + 3`.
- Numeric conversion with explicit null token `NA`: target-valid `{r09,r11}`; recognized missing `{r01,r02,r03,r04,r05,r06}`; failed conversion `{r07,r08,r10,r12}`. Expected preview conservation: `12 = 2 + 6 + 4`. Expected applied numeric profile: `12 = 2 + 10 + 0`, retaining raw reason separately from effective missingness.
- Category/string conversion with explicit null token `NA`: categories `{r07,r08,r09,r10,r11,r12}`; recognized missing `{r01,r02,r03,r04,r05,r06}`; failures none. Expected conservation: `12 = 6 + 6 + 0`. Without explicit conversion, token policy is provisionally expected to apply independently of an interpretation override; this assumption must be checked.
- Separate date conversion, strict ISO mode and token `NA`: target-valid none; recognized missing `{r01,r02,r03,r04,r05,r06}`; failed `{r07,r08,r09,r10,r11,r12}`. Expected conservation: `12 = 0 + 6 + 6`. In particular `2025-02-30` must not silently roll into March. Whether numeric zero is accepted as a timestamp in ISO mode is an explicit uncertainty, not a fact.
- Missing filter on raw numeric values: `{r01,r02,r03,r04,r05}`. Category missing-filter parity with the category profile is a hypothesis to check. Applied numeric missing filter should reach all recognized missing inputs and conversion failures, while raw recovery remains possible.
- Calculation identity should preserve raw value distinctions if the engine returns the underlying scalar; missing arithmetic should not invent a finite measurement. Provisional `x + 1` expectation: finite outputs `r09 -> 1`, `r11 -> 13.5`; all other rows missing or error. The exact error/result rules, including false and Infinity, must be obtained from source. Do not assume all calculation functions share this policy.

## Filtered population

Use `cohort = 'focus'`, independent of x, to retain `{r01,r04,r06,r07,r09,r10,r11,r12}` (8 rows). Other cohort `{r02,r03,r05,r08}` (4 rows).

Provisional focus numeric raw partition: eligible `{r09,r11}`; missing `{r01,r04}`; excluded `{r06,r07,r10,r12}`; `8 = 2 + 2 + 4`. Provisional applied numeric: eligible `{r09,r11}`; missing `{r01,r04,r06,r07,r10,r12}`; `8 = 2 + 6 + 0`. Conversion draft is expected to describe all 12 raw rows even while the profile describes this 8-row effective population; the difference is scope, not lost rows.

## Acceptance and rejection

Every row must have an explainable stage-specific state. A surface must conserve its declared population, not be forced to match another stage or population. Preserve raw values and retain zero and false as distinct inputs. Reject a universal state classification if consumer-specific eligibility and existing diagnostics explain the repair task without new public state. Product tests, browser observation, author comprehension and actual repair performance remain separate gates.
````

## Appendix B. Independent arithmetic verifier and execution receipt

This is the complete script actually executed for the independent arithmetic check. It imports no explorEDA source and implements no converter, profile, filter, or calculation engine. Its row sets are manually supplied source predictions. A pass establishes internal accounting only.

Save the following block body as `check-ledger-arithmetic.mjs` and run `node check-ledger-arithmetic.mjs` to repeat that limited check. Script SHA256: `312aee82b9c82a6793990b280c908c50a496f698d0474b214ee28ea8e889318b`.

```javascript
import assert from 'node:assert/strict';
// Independent set-accounting check, not an implementation of explorEDA.
const U = Array.from({length:12},(_,i)=>`r${String(i+1).padStart(2,'0')}`);
const focus = ['r01','r04','r06','r07','r09','r10','r11','r12'];
const P = {
 rawNumeric: [['r09','r11'],['r01','r02','r03','r04','r05'],['r06','r07','r08','r10','r12']],
 rawCategorical: [['r04','r05','r06','r07','r08','r09','r10','r11','r12'],['r01','r02','r03'],[]],
 numericNA: [['r09','r11'],['r01','r02','r03','r04','r05','r06'],['r07','r08','r10','r12']],
 numericNoToken: [['r09','r11'],['r01','r02','r03','r04','r05'],['r06','r07','r08','r10','r12']],
 numericApplied: [['r09','r11'],['r01','r02','r03','r04','r05','r06','r07','r08','r10','r12'],[]],
 categoryNA: [['r04','r05','r07','r08','r09','r10','r11','r12'],['r01','r02','r03','r06'],[]],
 dateNA: [[],['r01','r02','r03','r04','r05','r06'],['r07','r08','r09','r10','r11','r12']],
 dateApplied: [[],U,[]],
 rawIdentity: [['r04','r05','r06','r07','r09','r10','r11','r12'],['r01','r02','r03'],['r08']],
 rawPlusOne: [['r09','r11'],[],['r01','r02','r03','r04','r05','r06','r07','r08','r10','r12']],
 rawCount: [U.filter(x=>x!=='r08'),[],['r08']],
};
for (const [name,sets] of Object.entries(P)) {
 const flat=sets.flat(); assert.equal(new Set(flat).size,12,name); assert.equal(flat.length,12,name); assert.deepEqual([...flat].sort(),U,name);
 console.log(name, sets.map(x=>x.length).join('/'), 'focus',sets.map(s=>s.filter(x=>focus.includes(x)).length).join('/'));
}
assert.equal(0+12.5,12.5); assert.equal((0+12.5)/2,6.25);
assert.equal(Math.sqrt(((0-6.25)**2+(12.5-6.25)**2)/2),6.25);
const native=[{id:'absent'},{id:'undefined',x:undefined},{id:'Infinity',x:Infinity}];
assert.equal(Object.hasOwn(native[0],'x'),false); assert.equal(Object.hasOwn(native[1],'x'),true);
const lossy=JSON.parse(JSON.stringify(native));
assert.equal(Object.hasOwn(lossy[1],'x'),false); assert.equal(lossy[2].x,null);
console.log('PASS: 11 full-population partitions, focus intersections, finite summary arithmetic and explicit JSON-loss demonstration. No repository code imported or executed.');
```

Exact recorded stdout under Node `v24.19.0`, SHA256 `cd41b30b30561b21f0df60be5f1885ed802cff7cd5381d7f69da3a08594c8ea0` (including the final LF):

```text
rawNumeric 2/5/5 focus 2/2/4
rawCategorical 9/3/0 focus 7/1/0
numericNA 2/6/4 focus 2/3/3
numericNoToken 2/5/5 focus 2/2/4
numericApplied 2/10/0 focus 2/6/0
categoryNA 8/4/0 focus 6/2/0
dateNA 0/6/6 focus 0/3/5
dateApplied 0/12/0 focus 0/8/0
rawIdentity 8/3/1 focus 7/1/0
rawPlusOne 2/0/10 focus 2/0/6
rawCount 11/0/1 focus 8/0/0
PASS: 11 full-population partitions, focus intersections, finite summary arithmetic and explicit JSON-loss demonstration. No repository code imported or executed.
```

## Repository references

All links below pin the source commit, not moving main. Packet line ranges may be found in the companion inventory; line anchors here are repository-file lines.

[VP]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/valueParsing.ts "valueParsing.ts — isMissingValue, numericExclusionReason, finiteNumber, parseDateText, timestampOf"
[FS]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldSettings.ts "fieldSettings.ts — convertFieldValue L106, applyFieldSettings L310, buildConversionPreview L339"
[ST]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts "statisticsCalculator.ts — calculateValueStatistics L71"
[DT]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts "dataTypeDetection.ts — detectColumnType L11"
[FP]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldProfiles.ts "fieldProfiles.ts — buildValuesProfile L35, buildFieldProfiles L57"
[FD]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldDistribution.ts "fieldDistribution.ts — buildFieldDistribution L473"
[AF]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/applyFilter.ts "applyFilter.ts — applyFilter L10"
[FFP]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts "useFilteredFieldProfiles.ts — effective values, ownership, frozen calculated type"
[DP]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx "DataLayerProvider.tsx — updateFieldSettings L770, getFieldConversionPreview L873, raw/effective state"
[DFT]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/declaredFieldTypes.ts "declaredFieldTypes.ts — DECLARED_DATA_TYPES, declaredDataTypes; pinned supplemental read"
[FI]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx "FieldInspector.tsx — draft L99–107, preview L124, Auto L433, null tokens L490, Apply L600; pinned supplemental read"
[FLR]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldList/FieldListRow.tsx "FieldListRow.tsx — onMissingFilter L324"
[FO]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldList/FieldOverview.tsx "FieldOverview.tsx — combines population missing and excluded"
[FM]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldMetadata.tsx "FieldMetadata.tsx — missing/excluded labels"
[FRR]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldList/FieldRowReadings.tsx "FieldRowReadings.tsx — missing count/action"
[CE]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/engine/Calculator.ts "Calculator.ts — value nonfinite guard L75, literal lookup L94, function arguments L103, arithmetic L150"
[CM]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/CalculationState.ts "CalculationState.ts — traceRow L115, executeCalculation L152"
[RF]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/functions/registry.ts "registry.ts — numericValue L5, count L65, getFunction L103; pinned supplemental read"
[CP]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/calculations/CalculationPreview.tsx "CalculationPreview.tsx — all-loaded scope L63, status precedence L126–138"

[INIT]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/lib/dataLayerState.ts "dataLayerState.ts — initializeData L7–11; pinned supplemental read"
