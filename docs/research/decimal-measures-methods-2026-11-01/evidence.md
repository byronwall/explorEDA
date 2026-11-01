# Evidence and review limits

Baseline and refreshed main: `d3920a285f3755a8324998775deb131747e959f5`.
No source files changed during integration.
[Original asset index](../../intent/decimal-measures/assets/pro-results/decimal-measures-methods-2026-11-01/ASSET_INDEX.md).

## Code claims checked locally

Paths below are relative to `packages/explorEDA/src/`.

| Owner                                                                                                    | Checked fact                                                                                                                        | Plan consequence                                                                           |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `lib/valueParsing.ts`, `lib/fieldSettings.ts`                                                            | Number parsing/conversion and presentation are separate.                                                                            | Preserve source lexemes and arithmetic policy separately.                                  |
| `lib/readers/columns.ts`, `delimited.ts`, `typedColumns.ts`                                              | Delimited cells start as text; inference converts numbers. Native decimal columns with at most 15 significant digits become Number. | The preservation option must run before those branches; retain native origin metadata.     |
| `lib/project/tables.ts`, `folder.ts`                                                                     | The folder CSV route calls `Number(text)` before query evaluation.                                                                  | Thread source declarations into the actual folder read.                                    |
| `lib/calculations/parser/semantics.ts`                                                                   | Numeric literals call `parseFloat`; ordinary grammar does not accept all proposed exponent spellings.                               | Preserve exact-mode tokens and add mode-specific grammar acceptance tests.                 |
| `CalculationState.ts`, `engine/Calculator.ts`, `functions/registry.ts`                                   | Numeric operators, cached calculated columns, and separate row errors already exist.                                                | Extend the existing manager and narrow evaluator; preserve causal status.                  |
| `providers/DataLayerProvider.tsx`                                                                        | Runtime/saved calculation projections keep name and expression only. `setData` resets analysis.                                     | Carry arithmetic metadata through construction, restore, and a separate refresh operation. |
| `types/ChartTypes.ts`, `types/AnalysisProject.ts`, `types/FilterTypes.ts`, `hooks/CrossfilterWrapper.ts` | Separate scalar aliases lack typed decimals. Row-ID dimensions delegate predicates.                                                 | Add one decimal-capable contract and exact predicates without replacing Crossfilter.       |
| `lib/aggregates.ts`                                                                                      | Shared five-operation union; direct numeric sum; `Object.is` entity agreement; contributor records.                                 | Exact dispatch and numeric equality must include min/max and completeness evidence.        |
| MetricCard plan/inputs                                                                                   | Baseline delta/share use numeric operators. Calculated fields omit raw inputs.                                                      | Adapt plan and renderer; attach source traces and disable implicit exact shares.           |
| Pivot `utils/calculations.ts`                                                                            | Own reducer, with source-row totals.                                                                                                | Adapt separately and retain total recomputation.                                           |
| `lib/analysis/evaluateProject.ts`                                                                        | Separate calculate/filter/group paths, primitive keys/equality, source references, and numeric reducers.                            | Exact query execution and projected field origin require explicit adapters.                |
| `analysisWorkerProtocol.ts`, `useAnalysisEvaluation.ts`                                                  | Workers receive tables plus project/bindings; request IDs guard applied results.                                                    | Transfer plain atoms and keep values/bindings/memberships on one revision.                 |
| DataTable component/helpers                                                                              | Calculated runtime columns feed rows; sort parses numbers; search/copy/CSV stringify values.                                        | Reuse resolved rows and add exact format/compare/export.                                   |
| `utils/saveDataUtils.ts`, `lib/analysis/projectFile.ts`                                                  | Saved-row guards admit primitive values; special-value encoding does not authorize decimal objects.                                 | Validate tags and policies before restore; never pass raw BigInt to JSON.                  |
| `lib/dsl/views.ts`, `lib/project/writeFolder.ts`                                                         | Shared-view export can use first-view definitions and report omissions; folder writer reads only returned text.                     | Exact conflicts/omissions must stop export before writes.                                  |
| `lib/notebook/findings.ts`, `readNotebook.ts`                                                            | Rest findings read source columns; calculated workspace columns are not evaluated there.                                            | Share resolved columns for live/rest findings.                                             |
| Notebook component, `writeBack.ts`                                                                       | Host state callback precedes targeted writeback/refusal; definitions need ownership.                                                | Preflight complete semantic edits before callbacks.                                        |
| `lib/project/folder.ts`, `apps/app/src/ProjectWorkspace.tsx`                                             | Folder notebooks receive loaded result rows and have text-save callbacks.                                                           | Carry metadata through reader, host, save, and reopen, not only compiler types.            |
| `providers/lib/carryRowSelections.ts`                                                                    | Row signatures use JSON; unchanged positions can return early.                                                                      | Do not claim general lossless identity. Clear positional selections on decimal refresh.    |

## Independent numerical review

A locally authored Python check read supplied JSON as data and used Decimal precision 1024.
It imported neither repository programs nor supplied programs. The check remains ignored under `tmp/`.
Result: **573 assertions passed**, including **112 numerical cases** and **nine comparison/key cases**.
The numerical count includes three successful wire values; it covers the 109 arithmetic outputs Pro cross-checked separately.
It checked coefficient values, scales, exact text, rounding flags, aggregate states/counts/memberships, ledgers, and projection collisions.
It also checked five selected populations, typed entity partitions/representatives, pooled means, and source-loss examples.

Anchors include `1.005→1.00`, `2.675→2.68`, both signs, `1/8=0.125`, one million tenths as `100000.0`, and wide cancellation.
The ledger check confirms `28.685`, grand rounding `28.68`, rounded subgroup sum `28.69`, and selected IDs L01/L02/L05/L08.
The entity case has 12 occurrences, eight keyed entities, four eligible entities, and diagnostic sum `6.00`.
Opposite residuals preserve zero total delta and two different lines.

All **82 error contracts** were inspected, including grammar, Number refusal, missing policy, bounds, division, mixed operands, and 22 malformed wire values.
Error cases were not independently executed as a full new validator. Pro's full 215-case verifier pass remains Pro-reported.
The supplied 440-line Python verifier and 699-line TypeScript contract were fully inspected, never executed.
No full TypeScript check of the proposed declaration companion is claimed.

Local additions to future acceptance: error-plus-missing operand orders, and reversed equal-value sort ties.
The supplied sort example does not distinguish lexical-ID ties from stable source-order ties. Use current source order in Rows.
Clear positional selections on refresh rather than extending identity machinery.

## Primary-source spot checks

- [ECMAScript Number](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type) defines binary64 values.
- [ECMAScript JSON](https://tc39.es/ecma262/multipage/structured-data.html#sec-serializejsonproperty) throws for BigInt left after normal replacer/toJSON processing.
- [General Decimal Arithmetic quantize](https://speleotrove.com/decimal/daops.html#refquant) distinguishes explicit output exponent and rounding.
- [big.js API](https://mikemcl.github.io/big.js/) documents strict input and constructing from a Number's string value; that cannot recover source digits.
- [PostgreSQL numeric](https://www.postgresql.org/docs/current/datatype-numeric.html) rounds numeric ties away from zero; it is not a half-even oracle.
- [DuckDB 2.0 numeric functions](https://duckdb.org/docs/2.0/sql/functions/numeric#decimal_divisionx-y) documents separate decimal division with half-even and optional scale, introduced in 2.0.

These checks support the design comparison. The 128/38 limits, source policies, and stage boundaries are local product choices.
No dependency installation, competitor runtime benchmark, accounting compliance check, or performance proof occurred.

## Validation boundary

Existing baseline tests passed: aggregate/value parser/field settings/calculator, 4 files and 91 tests.
Docs checks passed: 3 files and 74 tests, with existing React act warnings.
Authored formatting, whitespace, links, PR author checks, and original inventory are checked before opening the PR.
No package/demo code changes, changeset, screenshot acceptance, or full `pnpm check` is required for this docs-only change.
All proposed feature, browser, worker, host callback, persistence, notebook, and performance acceptance remains unrun.
