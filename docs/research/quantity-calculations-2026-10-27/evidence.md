# Evidence and limits

Checked October 27, 2026, against refreshed origin/main `9d64a021e35d312887b1bc848e307f42b6c3091f`. Both complete Pro Markdown reports were read. They remain under ignored `tmp/pro-quantity-calculations-2026-10-27/collected/`; the conversation is the durable source record.

## Code claims that decide the plan

| Boundary                      | Local source check and consequence                                                                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display versus interpretation | `lib/fieldSettings.ts` appends unit text. Parsing/conversion is separate. A semantic declaration is new work.                                                                                                    |
| Scalar evaluator/manager      | `calculations/types.ts`, `engine/Calculator.ts`, and `CalculationState.ts` use scalar values, dependencies, numeric row IDs, and whole-cache clearing. Keep them.                                                |
| Independent query execution   | `analysis/evaluateProject.ts:calculateFrame` constructs `Calculator` directly; manager-only changes would miss queries.                                                                                          |
| Provider edits                | `DataLayerProvider.tsx:updateFieldSettings` rebuilds for type/date/null-token changes and clears direct-field filters. Other settings only update metadata. Quantity edits need their own candidate transaction. |
| Calculation serialization     | `toRuntimeCalculations`/`toSavedCalculations` copy name/expression only. They need explicit new fields.                                                                                                          |
| Text parser/export            | `dsl/parse.ts:parseCalc` expects a name before `=`. Query heads differ. `dsl/export.ts:fieldLines` uses known primitive settings; new nested contracts need a codec.                                             |
| Project parameters            | `dsl/project.ts:compileParameter` currently allows `pick`/`required`. A runtime quantity alone would be lost through text export/import.                                                                         |
| Inherited view metadata       | `ExplorEdaProject.tsx:reported` strips inherited primitives by comparison. Nested quantity clones must not become view-local authorities.                                                                        |
| Pivot                         | Its private reducer computes population variance. `aggregationUnits` already separates counts and strips variance units. Add proper squared/interval results without claiming count handling is absent.          |
| Composition                   | `resolveUnit.ts` has independent aggregates and a horizon baseline/relative transform; layout UnitElement is not a physical unit. Explicitly cover or block typed transformations.                               |
| Notebook                      | `writeBackSettings` loops chart edits. `ExplorEdaNotebook.tsx` calls the host callback before text writeback and caches written settings. New definition edits need verified writeback.                          |
| Folder app                    | `ProjectWorkspace.tsx` supplies cached `notebook.result.rows`; an owner edit needs fresh query rows and metadata together. Node own-write suppression rules out waiting for an echo.                             |
| Row-only readers              | `analysisText.ts`, `readNotebook.ts`, and daily `corpus.ts` currently retain rows/types. Physical descriptors need deliberate propagation.                                                                       |
| CSV                           | `DataTableToolbar.tsx:toTableCsv` uses native field names and scalar cells. Preserve that contract.                                                                                                              |

Paths above are under `packages/explorEDA/src/` except the app and demo hosts. These checks confirm integration boundaries; they do not prove a proposed implementation.

## Independent arithmetic

A locally authored Python Fraction script passed 27 exact anchors: cm/metres, rate conversion, nested conversion, squared dimensions, percent scales, explicit FX factors, reading/interval conversion, mixed reading mean, pooled/group summaries, population variance, source reinterpretation, and fixed-duration volume rate. Separate binary64 probes confirm native tiny subtraction, avoidable Kelvin cancellation, and familiar anchored equality.

Examples: `100 cm + 2 m = 3 m`; `5 m/s = 18 km/h`; `0 °C = 32 °F`; `10 Δ°C = 18 Δ°F`; variances `25 Δ°C²` and `81 Δ°F²`; row-rate mean `20 m/s` versus pooled `25 m/s`. This validates expected arithmetic only. It does not exercise the proposed parser, type system, or application.

## Primary-source checks

- [NIST conversion tables](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9): different reading and interval conversion rules; fixed day/hour factors.
- [Pint nonmultiplicative units](https://pint.readthedocs.io/en/0.26.2/user/nonmult.html): offset subtraction and delta quantities. Our all-reading multiplication restriction is a narrower product policy.
- [math.js units](https://mathjs.org/docs/datatypes/units.html): JavaScript unit objects, separate parsers, and affine arithmetic cautions. No candidate library was installed or benchmarked.
- [UnitMath documentation](https://github.com/ericman314/UnitMath): one slash and ignored parentheses differ from the proposed conventional compound grammar.
- [UCUM specification](https://ucum.org/ucum): annotations have no semantic effect. Our author meaning tags are application policy, not UCUM compliance.

The design does not depend on exact library version numbers or unmeasured bundle-size claims. Broader bibliography entries remain attributed to Pro.

## Validation status

Preparation passed calculator/trace/field-settings tests: three files, 41 tests. Collection passed Pivot, Composition calculations, and notebook writeback: three files, 32 tests. Docs passed three files, 73 tests. Existing Pivot duplicate-key and React act warnings remain. Formatting, 14 authored relative links, JSON indexes, whitespace, and PR checks pass.

No feature code changed. Quantity execution, browser acceptance, persistence acceptance, host-refresh behavior, dependency bundle costs, and performance proofs remain proposed. Existing passing tests do not establish those new behaviors.
