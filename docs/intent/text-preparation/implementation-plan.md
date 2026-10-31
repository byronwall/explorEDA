# Build reusable text preparation

Build **Prepare text** on the current formula and Calculator paths. Let analysts clean a code, extract a component,
compose a label, inspect exact records, and reuse the result after save, reopen, and refresh.
Preserve source values and identity. Save one formula definition per result field.

This plan follows [R048 Design research](../../research/text-preparation-design-2026-10-31/README.md), scored 18/20.
Baseline and checked current main: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
Read the [seven original results](assets/pro-results/text-preparation-design-2026-10-31/index.md),
[local dispositions](../../research/text-preparation-design-2026-10-31/decisions.md), and
[checked evidence](../../research/text-preparation-design-2026-10-31/evidence.md).
Build means planned; no feature implementation or publication is approved by this research PR.

## Contracts

| Release | Functions                                 | Contract                                                                                        |
| ------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| M1      | `textTrim(text)`                          | Fixed 25-code-point ECMAScript trim profile; preserve interior text and U+200B.                 |
| M1      | `textPart(text, delimiter, index)`        | Nonempty whole delimiter; zero-based part; preserve empty parts; absent part is missing.        |
| M1      | `textReplace(text, search, replacement)`  | Nonempty literal search; all nonoverlapping matches; replacement stays literal, including `$&`. |
| M1      | `textConcat(text1, text2, …)`             | At least two strict text operands; missing propagates after argument validation.                |
| M2      | `textNormalize`, `textLower`, `textUpper` | Explicit NFC only; whole-string default casing without ambient locale.                          |
| M3      | `textLength`, `textSlice`                 | Unicode code points; zero-based start and optional count; preserve surrogate pairs.             |

Accept nullish data as successful missing. Keep empty text successful. Reject non-text values and lone UTF-16 surrogates.
Do not reuse the measurement-oriented blank-as-missing predicate for text.
Controls require present values and nonnegative safe-integer numbers where specified. Never coerce numeric strings.
Keep numeric `+` and exact category equality. No automatic normalization, case folding, or source rewrite.

Validate definitions before rows: fields, calls, arity, and literal controls, including signed numeric literals.
Do not add general constant folding. Preserve eager left-to-right function arguments and lazy boolean/conditional branches.
For example, `textConcat(17, 1 / 0)` reaches division failure before helper type validation.
Carry dependency failures when a referenced field is read. An unused failed branch must not poison a valid result.

Use small runtime error and missing-reason metadata beside existing values. Preserve existing readable errors.
Distinguish missing input from absent part. Propagate known origin through dependencies; do not invent absent evidence.
Keep the manager's undefined and project's null storage conventions. Compare logical outcomes across adapters.

## M1 — complete clean, extract, compose, and reuse workflow

**Outcome:** create prepared fields, review the full input, apply once, group and trace, then save, reopen, and refresh.
Project calculations and notebook use are part of this release.

Implementation order, with paths under `packages/explorEDA/src/` unless stated otherwise:

1. Add a strict text reader in `lib/valueParsing.ts` and pure operations in proposed `lib/calculations/functions/text.ts`.
   Register the four functions in `functions/registry.ts`. Give help valid insertion examples separate from display signatures.
2. Extend `lib/calculations/types.ts`, `engine/Calculator.ts`, and `CalculationState.ts` for failures at field reads.
   Keep normal and selected-row trace outcomes equal. Validate literal controls before empty row iteration.
3. Add conservative shared result-kind inference in proposed `lib/calculations/resultKind.ts`.
   Cover direct calls, aliases, text-or-null conditionals, and mixed branches. Wire provider normal and restored columns,
   project fields, and host adapters. Text such as `"0012"` must remain categorical after reopening and restored filters.
4. Add proposed `TextPreparationEditor.tsx` and a small formula emitter/recognizer.
   Integrate `CalculationEditor.tsx` and `CalculationForm.tsx`. Parse emitted formula text; never save a mismatched AST.
   Clean, Extract, and Compose create derived fields. Reopen only recognized forms; keep arbitrary formulas in the ordinary editor.
5. Extend `CalculationPreview.tsx` and add a pure review classifier.
   Show original, effective input, and output. Changed/Unchanged/Missing/Error partition a chosen comparison's input.
   Composition shows Produced/Missing/Error. Empty output remains present. Page rendering, never the counts or record sets.
   Keep review filters separate from chart filters. Show escaped text/code points on request.
6. Group collisions by present output and distinct immediate inputs. Include unchanged members and empty text.
   Compare composition tuples structurally. Repeated equal inputs alone are duplicates, not new collisions.
   Extend `CalculationTrace.tsx` with existing executed AST steps; trace one selected row on demand.
7. Extend `lib/analysis/evaluateProject.ts::calculateFrame` with definition validation, field types, and runtime field faults.
   Reuse `CalculateStep`; preserve row key, source references, contributors, and input grain.
   Use `analysisWorkerProtocol.ts`, `analysisWorker.ts`, and `useAnalysisEvaluation.ts` for shared worker execution and stale-result guards.
8. Retain evaluation context through `components/ExplorEdaProject.tsx`, `lib/project/analysisText.ts`, and `lib/notebook/readNotebook.ts`.
   Both text readers currently flatten results. Close `lib/project/folder.ts` and `apps/app/src/ProjectWorkspace.tsx` too.
   The folder notebook receives loaded result rows; prove edits and refreshed source arrays recompute them.
   Preserve field types, failures, source references, and the current evaluation together.
9. Save formula text through existing workspace JSON, dashboard text, project `calc`, notebook, and folder paths.
   Keep runtime counts, memberships, comparison choice, and guide state out of saved settings.
   Reuse `utils/saveDataUtils.ts` for full analysis JSON. Add a typed review snapshot beside ordinary table CSV export
   in `components/charts/DataTable/DataTableToolbar.tsx` or the review's own export action.
   The snapshot records scope, property presence, types, originals, effective inputs, output, errors, and source references.

Apply through existing calculation actions and host history. Verify one undo step and no change on Cancel.
Refresh discards stale preview results and revision-local memberships. Stable keys use existing identity handling.
Do not invent stable identity for missing or duplicate keys. Do not make this release depend on prepared relationship keys.
Reuse current folder save and callback paths; make only the writes needed to persist the edited definition.

**Acceptance:** use the original fixtures as proposed contracts; product integration must prove them.

| Fixture               | Exact gate                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| 18 records, trim      | 4 changed, 10 unchanged, 2 missing, 2 errors; 14 present, including 2 empty.                     |
| Exact changed records | `r01,r03,r05,r07`. Errors: `r10,r11`.                                                            |
| Collision `AB-001`    | `r01,r02,r03,r17`, including the unchanged spelling. Empty collision: `r06,r07`.                 |
| Extracted component   | 10 present, 6 missing, 2 errors. Absent part: `r06,r07,r12,r18`. Missing input: `r08,r09`.       |
| Composed label        | 9 produced, 7 missing, 2 errors; 5 distinct labels.                                              |
| Specified refresh     | 4 changed, 12 unchanged, 1 missing, 1 error; extraction 12/5/1; labels 11/6/1.                   |
| Six-record project    | `A,A,A,B,missing,error`; groups `A=3,B=1`; preserve all original source keys.                    |
| Dependency read       | Failed field fails a consuming expression; unused conditional/boolean branch remains successful. |
| Literal controls      | Empty delimiter and negative/fractional index reject even with zero input rows.                  |
| Literal replacement   | `textReplace("a", "a", "$&")` returns `$&`; `textReplace("aaaa", "aa", "b")` returns `bb`.       |

Extend existing engine/parser/trace/recode tests and add focused text, emitter, and review tests.
Use `test/lib/analysis/evaluateProject.test.ts`, current worker hook/protocol tests, saved-data/provider tests,
`lib/notebook/sheets.test.ts`, `lib/project/folder.test.ts`, and actual host tests for lifecycle checks.
Test the real worker transport, not only its pure handler. Reopen restored filters on numeric-looking text.
Use full-analysis serialization for own undefined, absence, null, nonfinite originals, and malformed original strings.
Plain CSV and raw clipboard JSON do not prove exact evidence preservation.

**Docs and runnable example:** update `apps/demo/src/docs/pages/calculated-fields.mdx` with Prepare text,
outcomes, exact records, save, and refresh. Update `project-folders.mdx` and `notebooks.mdx` for query reuse.
Register `text-preparation` in `apps/demo/src/demos/examples.ts` and `coverage.ts` with the 18-record workflow,
project/notebook use, deliberate type errors, and collisions. Add the live example in the same milestone.
Exercise keyboard and pointer at 1280, 783, and 390 px. Verify focus, paging, cancel, Apply, trace, and no overflow.

**Main risk:** a correct editor value loses text type, failure, or original-record context downstream.
Measure 10,000 and 100,000-row preview and collision cost before adding caches or thresholds.
Use the existing draft delay and evaluation guards. Never substitute sampled counts for full review.

## M2 — explicit NFC and whole-string casing

Add three functions to the same helper/registry and guide. Reuse M1 outcomes, collisions, persistence, worker, and notebook paths.
Normalization is NFC only. Whole-string casing preserves contextual rules; no device locale applies.
Review original spellings and code points when outputs combine. These are display transformations, not identity rules.

Exact checks: decomposed `e\u0301` becomes `é`; fullwidth `Ａ`, ligature `ﬁ`, and NBSP retain compatibility distinctions.
Lowercase `I` gives `i`; `İ` gives `i\u0307`. Uppercase `straße` gives `STRASSE`.
Lowercase `ΟΣ` gives final sigma `ος`. Casing is not reversible.
Run the agreed corpus in supported Node and browsers. Record observed runtime Unicode differences.
No historical Unicode database or compatibility layer is needed for one current product version.

Update calculated-fields **Unicode and identifiers** and extend the same runnable example with explicit NFC/casing steps.
Add a project/notebook chain, save/reopen, and refresh checks in the same milestone.
**Main risk:** users mistake spelling changes for safe business-key equality.

## M3 — code-point length and slicing

Add `textLength(text)` and `textSlice(text,start,count?)` to the same paths.
Infer numeric kind for length and text kind for slice, including aliases, conditionals, restore, and project adapters.
Use code-point iteration. Avoid unnecessary arrays and overflow when clipping a large count.
Omitted count means the remainder; explicit null is invalid. Start past the end or count zero yields empty text.

Exact checks: `A😀B` has length 3; slice `(1,1)` yields `😀`.
Decomposed `e\u0301` has length 2; slicing `(1,1)` yields the combining accent.
`👩‍💻` has 3 code points; the family sequence in the fixture has 7.
Reject negative, fractional, string, and unsafe integer controls. Preserve paired surrogates.

Update calculated-fields **Code points and displayed characters** and the same runnable example's Unicode section.
Include an exact-code-length chart and notebook table with a selected-row trace.
**Main risk:** users expect grapheme units. Label code points explicitly and defer separate grapheme display utilities.

## Verification and release

Use pnpm and the current React/TypeScript structure. Use `@repo/test-config` time limits.
Each implementation milestone needs its own minor changeset, docs, runnable example, and browser evidence.
Run focused calculation and integration tests, library types, example coverage/dashboard text, and docs checks during work.
Run `pnpm check` once before each implementation PR. Use `pnpm shot` per the agent guide for UI evidence.

This research PR contains documents and preserved originals only. Its local semantic checks do not accept the unbuilt feature.
See [evidence.md](../../research/text-preparation-design-2026-10-31/evidence.md) for what ran and what remains untested.
