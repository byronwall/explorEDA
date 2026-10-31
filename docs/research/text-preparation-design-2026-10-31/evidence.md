# Checked evidence and limits

Baseline and refreshed current main: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
The scoped branch began from main. Submission and collection reuse the same recorded conversation.

## Code claims that decide the plan

Paths are under `packages/explorEDA/src/`, except where shown.

| Checked code                                                                 | Finding and plan consequence                                                                                                                                                                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/calculations/functions/registry.ts`, `getFunction`                      | Real callable registry; case-insensitive name and arity checks. Add four functions here.                                                                                                                                    |
| `parser/semantics.ts`, `Calculator.ts`                                       | Strings/nested calls/quoted fields already parse. Plus remains numeric; arguments are eager; boolean and conditional branches are lazy. No new grammar or evaluator.                                                        |
| `CalculationState.ts`, `executeCalculation`, `traceRow`                      | Failed results become undefined in value maps. Errors are separate. Children receive values without faults; attach failure evidence at reads.                                                                               |
| `Calculator.ts::validateExpression`                                          | Checks fields, calls, arity, and branches, but not literal control contracts. Add narrow static checks, not general folding.                                                                                                |
| `CalculationForm.tsx`, `CalculationEditor.tsx`, `CalculationPreview.tsx`     | Registry-driven help, delayed draft manager, all-loaded-row preview, five-row pages. Dirty draft flag is not changed-record membership.                                                                                     |
| `CalculationTrace.tsx` and `Calculator.ts::value`                            | Engine records executed steps; current UI shows named dependency values. Expose existing trace data.                                                                                                                        |
| `DataLayerProvider.tsx::getColumnData` and `buildRestoredColumn`             | Normal columns declare top-level recode categorical. Restored calculated columns lack that declaration. Result-kind closure must include restore.                                                                           |
| `lib/analysis/evaluateProject.ts::calculateFrame`                            | Shared Calculator; per-row error diagnostics; preserved row spread; recode-only output typing. No pre-row function validation.                                                                                              |
| `sourceReferences`, `aggregateFrame`                                         | Typed unique source keys; positional fallback for missing/duplicate keys. Group output retains refs and counts; count measures use empty measure-contributor maps.                                                          |
| `components/ExplorEdaProject.tsx`                                            | Holds evaluation, maps row keys, supplies field types and result-row trace context. Extend this route rather than inventing another host API.                                                                               |
| `analysisWorker.ts`, `analysisWorkerProtocol.ts`, `useAnalysisEvaluation.ts` | Shared evaluator, source-array upload, request IDs, and stale-response checks exist. Actual transport acceptance remains required.                                                                                          |
| `lib/project/analysisText.ts`, `lib/notebook/readNotebook.ts`                | Both flatten query results to row data, dropping evaluation context. Prepared types/faults/refs need explicit host support.                                                                                                 |
| `lib/project/folder.ts`, `apps/app/src/ProjectWorkspace.tsx`                 | Folder reader loads notebook query rows. Workspace passes `notebook.result.rows`, saves notebook text separately, and edits project/view via current callbacks. Pro's generic notebook promise needs this concrete closure. |
| `utils/saveDataUtils.ts`, provider `saveRawData`                             | Full-analysis codec preserves own undefined, absence, null, nonfinite values, and exact strings. Raw clipboard JSON does not. Use explicit typed review export. No universal numeric bit-preservation claim is made.        |
| `DataTable/DataTableToolbar.tsx`                                             | CSV export already reads displayed table values. Keep it and add exact typed review export where needed.                                                                                                                    |
| `lib/valueParsing.ts::isMissingValue`                                        | Blank strings are missing measurements. Text input needs a distinct strict reader that preserves empty text.                                                                                                                |

Original guidance to run the supplied programs is not adopted. Human authorization permits downloads and inspection, not program execution.
Original plan commands and proposed filenames remain original evidence; local paths and gates are in the distilled plan.

## Independent fixture checks

Locally authored checks read the two JSON artifacts and use native operations; they import no supplied or repository program.
They passed **479 assertions** on Node v22.21.1, Unicode 16.0:

- 130 successful direct contracts, using native trim, split, callback replacement, NFC, whole-string casing, and code-point operations.
- 155 input/output code-point annotations and the 25-element trim profile.
- All 18 workflow row outcomes, exact review memberships, empty outputs, collisions, chart subset, reorder, and refresh arithmetic.
- Six-record project grouping and source references before and after reorder/refresh; step references and original record equality.

The 40 direct error cases, 19 engine contracts, three reason cases, persistence contract, and five empty-input cases were inspected.
The local checks do not execute new argument validation, parser/Calculator integration, dependency/reason propagation,
the actual project evaluator against new functions, workers, chart typing, save/reopen, notebooks, browser flows, or performance.
Pro's supplied verifier reports 323 assertions on Node 24/Unicode 17; that remains Pro-reported.
Runtime agreement on the tested corpus is narrower than agreement on all Unicode 18 characters.

## Primary-source spot checks

- [Power Query Text.Combine](https://learn.microsoft.com/en-us/powerquery-m/text-combine) ignores null elements.
- [OpenRefine normalize](https://openrefine.org/docs/manual/grelfunctions) removes diacritics and maps extended western text toward ASCII.
- [ECMAScript whitespace](https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#sec-white-space) distinguishes its whitespace set from Unicode White_Space.
- [Unicode UAX #15](https://www.unicode.org/reports/tr15/) separates canonical and compatibility normalization and explains concatenation boundaries.

These support strict missing propagation, a fixed trim set, and explicit NFC. The full original report keeps its other sources.

## Validation and artifact preservation

Existing calculation engine/parser/trace/recode and project evaluator tests passed: **5 files, 76 tests**.
Docs route/search/gate tests passed: **3 files, 74 tests**, with existing React act warnings.
Installed dependencies ran with `verify-deps-before-run=false`; no dependency or lockfile edit.
This docs-only PR needs no full `pnpm check`, changeset, or UI screenshot.

The existing ZIP was downloaded under direct human standing approval, with its conversation URL presented before download.
The header click had no immediate file; a bounded 15-second download-event recovery timed out.
The actual Downloads ZIP then appeared and was verified before extraction. No regeneration or Library upload was needed.
No tool approval rejection occurred. Archive checks passed: unique safe paths, no symlinks, CRC, bounded size, UTF-8.
All seven files were read or inspected and copied unchanged. The scoped format ignore preserves their original bytes.
The [asset index](../../intent/text-preparation/assets/pro-results/text-preparation-design-2026-10-31/index.md) links every file.
ZIP, input packet, local check program, and transient inventories remain ignored.
