# Reusable text preparation — implementation plan

**Build a small, strict text-function family and a guided editor that emits ordinary calculation formulas, with exact record review and the complete save/reopen/refresh workflow in its first release.** Use the existing Calculator, CalculationManager, project `calculate` step, formula persistence, and notebook integration. Preserve source values and source identities. The first milestone ships `textTrim`, `textPart`, `textReplace`, and `textConcat`; later independent milestones add explicit NFC normalization and case conversion, then code-point length and slicing. No second expression engine, saved preparation recipe, new project-step kind, or unbuilt join-key feature is required.

Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`, October 31, 2026. This is a **proposed implementation and acceptance plan**, not an implementation report. `report.md` gives the design rationale; `fixtures.json` is the normative source of exact values, diagnostics, and record memberships. Recommendation dispositions are in `recommendations.md`.

## 1. Release boundaries and invariants

| Milestone | Independently useful release |
| --- | --- |
| M1 | Clean an imported code, extract a delimited component, compose a label, inspect exact records and collisions, apply, group, trace, save, reopen, refresh, use project calculations and notebooks, and export. |
| M2 | Deliberately normalize canonical Unicode equivalents with NFC, or change case, while reviewing the newly combined output groups. |
| M3 | Measure and slice text by Unicode code points with clear distinction from displayed characters. |

M1 is intentionally a complete workflow. Its internal tasks may be implemented and reviewed in order, but project diagnostics, typing, original-record review, and reopening are release acceptance conditions, not deferred follow-ups.

Keep these invariants through all three milestones:

- Every operation produces a derived field. Original values, row count, source keys, and source references remain intact.
- Functions accept strings and permitted nullish data arguments. Numbers, booleans, dates, objects, arrays, and malformed UTF-16 are never silently converted to text.
- Empty text is a successful value. Missing input, an absent delimited part, and a failed calculation remain distinguishable in the evaluation outcome.
- `+` retains its existing numeric meaning. Category equality and saved keys are not silently normalized or case-folded.
- Review counts and exact record sets use the entire calculation input, not only the visible page. Chart filters do not alter workspace calculation scope; a project step uses its explicitly preceding query frame.
- Save formula definitions, not cached output, review rows, selected comparison fields, or a duplicate guided recipe. Recompute review after reopening or refresh.
- Existing raw source snapshots remain exact. Exported review evidence names its scope and is a snapshot, never a live identity guarantee.

## 2. Baseline seams and ownership

Paths below are relative to `packages/explorEDA/src/` unless a different root is shown. All cited existing files are in the supplied packet. A path labeled **proposed** is a new file suggestion, not an inspected file.

| Seam | Existing evidence and intended change |
| --- | --- |
| Function registration | `lib/calculations/functions/registry.ts`, `CalculationFunction` and `getFunction`, lines 52–58 and 134–149. Add direct text registrations, valid insertion examples, result-kind metadata, and narrowly scoped static control validation. |
| Parsing/evaluation | `lib/calculations/parser/semantics.ts`, grammar lines 5–50; `engine/Calculator.ts`, `validateExpression` lines 25–47 and `evaluateValue` lines 100–194. Keep current syntax, numeric operators, and lazy conditional/boolean evaluation. |
| Stored results/errors | `lib/calculations/CalculationState.ts`, `getErrors`, `traceRow`, `executeCalculation`, lines 107–187. Preserve failure information when later calculations read a dependency. |
| Trace | `Calculator.ts`, `CalculationStep` and `value`, lines 17–22 and 71–97; `CalculationState.ts:115–151`. Reuse expression steps already recorded; expose them in the existing UI. |
| Draft editor | `components/calculations/CalculationEditor.tsx:151–179,210–225`; `CalculationForm.tsx:247–267`. Reuse the draft manager, Apply path, and active registry-driven help. |
| Preview | `CalculationPreview.tsx:37–54,61–78,99–174`. Add outcome-based review and exact records beyond its existing failed-only, five-row page. |
| Typed result columns | `providers/DataLayerProvider.tsx`, `getColumnData`, lines 1221–1246; `lib/analysis/evaluateProject.ts`, `calculateFrame`, lines 440–480. Extend the current recode-specific typing path using shared inferred result kinds. |
| Project execution | `types/AnalysisProject.ts`, `CalculateStep`, `AnalysisResultRow`, and `AnalysisDiagnostic`; `evaluateProject.ts:440–480`. Keep `kind: "calculate"`; add runtime per-field failure evidence and preserve row provenance. |
| Persistence | `types/SavedDataStructure.ts:16–19`; provider conversion helpers at lines 158–174; `utils/saveDataUtils.ts`, `validateSavedData`, lines 960–975. Continue saving result name plus formula string. |
| Project text/folders | `lib/dsl/project.ts`, `stepLines` and `compileStep`; `lib/project/analysisText.ts`, `readAnalysisText`; `lib/project/folder.ts`, `readProjectFolder`. Close the diagnostic/type/identity adapter paths; do not introduce another file format. |
| Notebook | `lib/notebook/compileNotebook.ts`, `compileNotebook`, lines 140–218. Preserve existing block compilation, error ownership, and last-valid-block behavior while testing prepared fields in actual notebook bindings. |

Before editing, inspect current worker and host adapters in the integration checkout. The packet contains their execution seams but does not contain every worker entry, notebook host, exporter, or field-menu component. Locate those with `rg`; do not invent an inspected path. The same applies to exact existing test-file locations outside the four supplied calculation suites.

## 3. M1 — complete clean, extract, compose, and reuse workflow

### User outcome

An analyst opens **Prepare text**, chooses a source and a new result name, previews deliberate operations, reviews exact changed/error records and output collisions, and applies one calculated field. The analyst then groups a chart by that field, follows a record through its calculation, saves and reopens the analysis, refreshes reordered source data, and uses the equivalent formula in a project query and notebook. Original records remain available throughout.

### Task 1: implement four shared functions and their contracts

Add **proposed** `lib/calculations/functions/text.ts` for small pure operations and register them directly in `registry.ts`. Put the strict raw-text reader/validator in existing `lib/valueParsing.ts`, following the repository's raw-value rule; do not reuse its blank-as-missing measurement predicate. Keep operations usable in Node and browser builds without UI imports. Use early returns and one common argument-validation path.

| Signature | M1 behavior |
| --- | --- |
| `textTrim(text)` | Remove only leading/trailing characters from the fixed 25-character ECMAScript whitespace-and-line-terminator set specified in the report/fixtures. Preserve internal whitespace and zero-width formatting characters outside that set. |
| `textPart(text, delimiter, index)` | Exact whole-delimiter match, left-to-right, nonoverlapping split; zero-based nonnegative safe-integer index. Preserve empty components. Return null when the component does not exist. Delimiter must be nonempty text. |
| `textReplace(text, search, replacement)` | Replace every nonoverlapping exact occurrence. Search must be nonempty text; replacement may be empty. Dollar signs and backslashes in replacement are literal data. |
| `textConcat(text1, text2, …)` | At least two operands. Concatenate strict text operands in order; a permitted nullish operand makes the result missing after validation. No implicit separator and no implicit conversion. |

For each text argument, reject unpaired UTF-16 surrogates. Use a small shared surrogate scan when the supported runtime lacks `String.prototype.isWellFormed`; do not silently repair data using replacement characters. For example, the error for a lone surrogate passed to the first argument of `textTrim` is exactly `textTrim argument 1 contains an unpaired UTF-16 surrogate.` with diagnostic code `TEXT_UNICODE` in the proposed diagnostic contract.

Separate evaluation phases:

1. **Definition validation:** verify known function names, argument counts, known fields, and literal control constraints even when no rows exist. Recognize unary `+`/`-` around a number as a signed literal for this limited check. Do not add general constant folding.
2. **Argument expression evaluation:** evaluate arguments eagerly, left-to-right. An evaluation failure stops the call and remains a failure.
3. **Collected-value validation:** validate the evaluated values in argument order, including dynamic delimiter/index/search controls and well-formed text.
4. **Null propagation and operation:** only after validation, propagate permitted nullish data or perform the operation.

Thus a null text input does not excuse an empty delimiter or invalid index. `textConcat(null, 42)` fails its text contract; `textConcat(null, "B")` is missing. An eager argument expression that divides by zero reports that evaluation error rather than disappearing behind a missing operand. Keep `getFunction`'s existing exact arity wording: `Invalid arguments. Use <syntax>`.

### Task 2: preserve dependency failures and result kinds

Change `lib/calculations/types.ts`, `Calculator.ts`, and `CalculationState.ts` together. Add a lightweight runtime field-error lookup to the evaluation context; consult it only when the evaluator actually reads that field reference. Dependency execution may be cached eagerly, but a failed dependency in an unused conditional branch must not fail the result.

Carry an optional successful-missing reason and origin through shared execution: `source-missing` (displayed as Missing input) for nullish operands, and `part-absent` when a requested component does not exist. Keep the primitive result missing/nullish. Propagate a known origin through named dependencies; for several missing operands, retain the first missing operand's reason in argument order after argument validation. Explicit null has a literal origin. Existing functions without such metadata remain simply Missing; do not invent source evidence. The direct-value oracle does not execute this metadata propagation.

Keep the current lazy behavior of ternary expressions, `if/then/else`, `&&`, and `||`. Do not preflight every dependency and reject a row before evaluation. Check error propagation both in normal execution and `traceRow`; both must report the same logical result.

Add **proposed** `lib/calculations/resultKind.ts` for conservative inference shared by the provider and project evaluator. Text functions return string-or-missing; an alias to a text calculation retains that kind; a conditional joining text with null retains string-or-missing. A conditional joining text and number remains mixed/unknown rather than coercing either branch. Reuse declared source field kinds when available. Infer from definitions even for all-missing or empty data, and recompute after expression changes or restore.

Wire this into `DataLayerProvider.tsx` and `evaluateProject.ts`. Numeric-looking outputs such as `"0012"` and `"12"` must remain distinct text categories in profiles, charts, filters, and tables. The current special treatment of `recode()` is evidence for this seam, not a reason to inspect only the outermost function name.

The manager currently collapses successful null to undefined (`CalculationState.ts:177–179`); project calculation values can remain null (`evaluateProject.ts:460–464`). Preserve compatible runtime conventions and compare **logical outcomes** across adapters: present, missing, or error. Do not treat different nullish container representations as a semantic mismatch or rewrite all saved data.

### Task 3: add a guide that emits formulas

Add **proposed** `components/calculations/TextPreparationEditor.tsx` and **proposed** `lib/calculations/textPreparation.ts`. The latter recognizes only supported guided forms and emits valid ordinary expressions. It does not evaluate them. Integrate its entry and draft handoff with `CalculationEditor.tsx` and `CalculationForm.tsx`, following the existing category-map/formula pattern.

Offer **Clean**, **Extract**, and **Compose** starting tasks. Clean exposes edge trimming and explicit literal replacement; Extract exposes whole delimiter and component; Compose orders existing text fields and literal fragments. Source values are never edited in place. Use `JSON.stringify` for both literals and quoted field names. Show the generated formula; **Edit as formula** preserves the draft exactly.

For a friendly ordinal control, label it **Part 1 · index 0** and keep the index visible in formula help. A string without the delimiter has one component at index 0. A trailing delimiter creates a final empty component. These cases must not all look like blank cells.

Guide state and the review comparison field are session-only or derived from a supported formula. On reopen, reconstruct only forms the recognizer understands exactly; arbitrary nested formulas open in the ordinary editor. Re-selecting a comparison field is preferable to persisting a second recipe or guessing the analyst's intent.

Update registry-driven function help with a valid insertion snippet distinct from its display signature. A syntax label may show `…` or an optional argument marker; insertion must never paste that notation into the formula. Include strict input types, missing behavior, index base, literal matching, and one executable example. No separate mock function catalogue.

### Task 4: build exact review and collision evidence

Add **proposed** `lib/calculations/review.ts` as a pure classifier over input rows, evaluated values, errors, and an explicitly selected comparison field. Reuse it for workspace and project review. Return exact row identities/memberships as well as counts; do not reconstruct memberships from aggregated display labels.

Retain untouched original values and property presence separately from effective values supplied after field settings or prior query stages. Resolve original records through current source references; a converted effective number must remain visibly distinct from its original text.

For clean/extract comparison, primary states are Changed, Unchanged, Missing, and Error. Empty output remains valid and is an additional count, not a missing state. For a newly composed label, show Produced, Missing, and Error. Editing an existing formula may separately compare draft and saved outcomes under **Compared with saved formula**. Labels must make the denominator and comparison explicit.

Use the existing `CalculationPreview.tsx` table and paging behavior as the entry point. Add local filters for each outcome and a way to open all exact members, paginated. A five-row page never limits statistics or export. Table cells distinguish `null`, `""`, and error. On demand show escaped values/code points for invisible or visually identical text; preserve the readable version too.

Build collisions in one pass by successful output, retaining distinct exact source strings and their record memberships. Include empty string as a legitimate output; exclude missing and failed outputs. A repeated identical original is not a new collision. A collision means multiple originals share a result, not that their entities are equivalent. Never turn collision review into automatic category-map acceptance. For composed labels, any optional ambiguity review groups typed input tuples rather than inventing a single original value.

Runtime review rows and collision maps are disposable, keyed to the current data and formula revision. Discard obsolete preview results after a draft/data change. Keep local review filters separate from chart/workspace filters. Cancel changes nothing; Apply uses the existing add/update actions and one user-visible undo checkpoint. Use existing state-change hold facilities only where necessary to coalesce a user action, not a new transaction system.

### Task 5: expose the existing expression trace

Extend `CalculationTrace.tsx` to display `CalculationManager.traceRow(...).steps` for the selected record. Map step IDs back to the parsed expression for argument labels. A useful row trace shows original field, each executed function and arguments, its output or error, and the named dependent calculation.

The evaluator already records nested steps; do not add an independent guide evaluator. Trace one selected record on demand. Do not retain every intermediate for every row or eagerly trace the entire preview. For project rows, reconstruct the matching calculation context and run the same Calculator tracing path against one row, preserving its source references and runtime field faults.

Trace must show the same successful-missing reason and origin as batch review. A dependent call must not relabel an inherited `part-absent` result as ordinary missing input.

### Task 6: close project, worker, and notebook reuse

Extend `calculateFrame` in `lib/analysis/evaluateProject.ts` to perform definition validation before row iteration, return inferred field kinds, and retain per-row/per-field faults alongside values. Carry faults with fields through relevant runtime frame adapters so a subsequent calculation cannot turn a failed dependency into a harmless missing value. Keep existing `AnalysisDiagnostic` context: step ID, row key, and field ID. Runtime failure metadata is not part of saved project definitions.

Projects can validate field references from declared input metadata even with no rows. The standalone manager currently discovers fields from row keys; pass available host-declared field names or report unavailable schema/fields and revalidate on data arrival. Never claim complete field validation from an empty array with no schema. Syntax, function names/arity, and literal-control checks still apply.

Preserve `AnalysisResultRow.key`, `sourceRows`, and `contributors`; a calculation does not change grain. A source with a valid string key `r1` in source `records` retains row key `records:string:r1` after every text calculation. Unkeyed positional row IDs remain positional; no stronger refresh guarantee is implied.

Inspect and repair the adapters around `lib/project/analysisText.ts` and `folder.ts`. At baseline, `readAnalysisText` maps evaluation to plain `row.data` before compiling views and does not itself retain all evaluation diagnostics and metadata. Pass prepared field types, record provenance, and row failures through the host path needed for review and notebook use. Do not describe this as already automatic.

Locate actual worker entry points and notebook/query hosts in the checkout. Both foreground and worker execution import the same function registrations/helpers and preserve diagnostics through structured cloning. Test a worker calculation rather than merely asserting that the shared import exists.

Bind a notebook sheet/chart to the prepared project query, show source and prepared fields, and verify that a row diagnostic remains inspectable. Keep notebook definitions and query bindings on their existing serialization paths. Where `compileNotebook` uses last-valid blocks, a malformed draft must remain visibly invalid/frozen rather than masquerading as a freshly evaluated successful result.

### Task 7: save, reopen, refresh, and export

Keep `SavedCalculation` as `{ resultColumnName, expression }`. Use existing workspace JSON, dashboard text, project `calc`, analysis text, notebook, and folder paths. No migration/version bump or compatibility layer is justified by new function names in the current product version.

Round-trip source literals containing quotes, tabs, newlines, backslashes, NBSP, composed/decomposed accents, and emoji. Reload must preserve the formula's logical result and text kind. Literal escapes are representation; the decoded text must remain exact.

On refresh, rebuild calculations and outcome sets from new inputs. Reordering keyed rows preserves keyed membership; adding/changing/removing a source record updates membership by that key. Duplicate/missing source keys remain existing identity diagnostics; do not fall back silently to a misleading stable identity. Workspace display `__ID` can change, so do not persist review selection by it.

Export result values through existing table export and add an exact review export containing source identity, original values, result, outcome, and error. Locate existing exporter code before changing it. A CSV cannot preserve every type/missing distinction alone: provide a typed JSON review option with explicit outcome fields and retain original fields. Export does not write prepared values back to source files.

Preserve own-property undefined, absent properties, non-finite original values, and exact strings through `stringifySavedAnalysis`/`parseSavedAnalysis`, the existing special-value full-analysis serializer. Plain JSON and the raw-data clipboard helper are not equivalent exact-evidence routes.

### M1 acceptance checks

Use the supplied fixture sections directly; do not copy expected arrays from implementation output. Add focused cases to the supplied existing suites:

- `test/lib/calculations/engine/Calculator.test.ts` for literal functions and control flow.
- `test/lib/calculations/parser/parser.test.ts` for valid generated syntax, quoting, nested calls, and static controls.
- `test/lib/calculations/traceRow.test.ts` for dependency failures and executed intermediate trace.
- `test/lib/calculations/recode.test.ts` for preservation of explicit category matching and existing recode behavior.

Add **proposed** `test/lib/calculations/text.test.ts`, `review.test.ts`, and `textPreparation.test.ts` for the pure semantic, membership, and emitter contracts. Extend actual project/host/worker/persistence/notebook suites found by repository search; their omitted paths were not inspected in this source packet.

| Exact case | Required result |
| --- | --- |
| `textTrim("\u00A0 A \u00A0")` | `"A"` |
| `textTrim("\u200BA\u200B")` | Both U+200B characters remain. |
| `textPart("a::b::", "::", 2)` | Empty text `""`. |
| `textPart("a", "::", 1)` | Missing/null; index 0 returns `"a"`. |
| `textReplace("aaaa", "aa", "b")` | `"bb"`; no overlapping match pass. |
| `textReplace("a", "a", "$&")` | Literal `"$&"`. |
| `textConcat("A", " · ", "B")` | `"A · B"`. |
| Missing plus invalid text operand | Error according to exact fixture diagnostic, never silent null/coercion. |
| Empty input with invalid literal control | Definition rejected before executing any row. |
| Failed dependency read | Error; a missing result and failed result remain distinct. |
| Failed dependency in unexecuted branch | Guarded successful branch remains successful. |

The **18-record workflow fixture** is an exact reconciliation gate:

- Clean: **4 changed + 10 unchanged + 2 missing + 2 errors = 18**; 14 successful outputs, including 2 empty strings and 10 distinct successful outputs.
- Extracted part: **10 present + 6 missing + 2 errors = 18**.
- Composed label: **9 produced + 7 missing + 2 errors = 18**; 5 distinct produced labels.
- Assert every record ID in each fixture set, not only these totals. Assert collision members and original input immutability.

Assert `workflow.partMissingReasons` exactly: `source-missing` contains `r08,r09`; `part-absent` contains `r06,r07,r12,r18`. Also run `missingReasonCases` for origin propagation and multiple missing operands. These require integration with the shared evaluator; the direct-value oracle establishes null results without executing product reason propagation.

The **six-record project fixture** yields `A, A, A, B, null, error` and **2 changed + 2 unchanged + 1 missing + 1 error = 6**. Assert source keys and original values survive each calculation. Compare worker/foreground/workspace adapters by logical outcome; account explicitly for the manager's undefined representation of missing.

Run the full user journey at 1280, 783, and 390 px with pointer and keyboard. Check long names, empty/missing/error cells, outcome pagination, exact collision rows, Ctrl/Cmd+Enter Apply, Escape/Cancel, focus return, scroll bounds, and one undo step. Leave active workspace filters in place and prove preparation totals remain based on all loaded rows. Reopen JSON/text/folder saves and refresh a keyed reorder before accepting the release.

### M1 docs, runnable example, and main risk

In the same milestone, update `apps/demo/src/docs/pages/calculated-fields.mdx` with **Prepare text**, **Missing, empty, and failed values**, **Review exact changes**, and **Save and refresh** sections. Update `project-folders.mdx` with text `calc` examples and notebook/query reuse. Register **Imported product codes and analysis labels** in `apps/demo/src/demos/examples.ts`; add its proposed dataset/dashboard/notebook companions and the real coverage/live-example registrations found in the checkout.

The example must reproduce the fixture workflow, including a deliberate typed error and an output collision, rather than merely showing a precomputed clean chart. Docs example steps exercise review, Apply, source/result comparison, and a notebook binding. Add the required minor changeset for the public library feature.

**Main risk:** values seem correct in the editor while project/worker/restore adapters lose text kinds, failure evidence, or source identity. The release gate is lifecycle parity with exact member sets, not just passing pure-function tests.

## 4. M2 — explicit Unicode normalization and casing

### Scope and implementation

Add `textNormalize(text)` for **NFC only**, `textLower(text)`, and `textUpper(text)` to the same helper module and registry. Keep strict nullable/well-formed-text behavior. Case conversion is locale-free default Unicode casing supported by the chosen runtime; it is not case folding and is not a locale-aware identifier policy. Do not add an implicit locale argument or infer locale from the device.

Add explicit guide operations and help. Nothing is selected automatically when opening Clean. Preserve operation order in emitted formulas because normalization and casing can change output lengths and equivalence groups. NFC preserves compatibility distinctions such as fullwidth letters; do not silently substitute NFKC or accent removal.

Use the M1 collision and exact-record review unchanged. Every changed group should expose original code points when requested. Reuse the same result-kind metadata, project execution, trace, persistence, worker, and notebook bindings; no new saved properties.

### Exact checks and acceptance

- NFC maps `"e\u0301"` to `"\u00E9"`; already composed `"\u00E9"` remains unchanged. Their prepared values collide only when normalization is explicitly applied.
- NFC leaves the fullwidth letter `"\uFF21"` fullwidth; no compatibility normalization occurs.
- Default lowercasing `"I"` yields `"i"`; `"\u0130"` yields `"i\u0307"`. These are different outputs and are not silently collapsed.
- Uppercasing `"straße"` yields `"STRASSE"`; lowercasing the latter yields `"strasse"`. Do not promise an inverse.
- Lowercasing `"ΟΣ"` yields `"ος"`, including final sigma. Apply whole-string casing, not a per-code-point map that discards context.
- Missing stays missing, non-text fails, lone surrogates fail. Trace and all adapters match the fixture outcomes.
- Save/reopen a normalization/case chain and refresh a row from composed to decomposed input; recompute exact changed sets against the current original.

Extend **proposed** `text.test.ts`, `review.test.ts`, emitter tests, and the actual integration suites. Run all Unicode fixture cases in supported Node and browser engines. Record engine/Unicode-version differences if observed; current-version support does not require bundling a historical Unicode database. Ship only after supported execution surfaces agree on the promised corpus.

### Docs, example, and risk

Update **Unicode and identifiers** in calculated-fields documentation and add **Canonical spelling and case** to the existing runnable example, showing NFC versus visually similar but distinct strings. Add a project/notebook example that uses the same formulas. Register and script the new live steps in the same milestone; add a minor changeset.

**Main risk:** users mistake normalization or uppercase display text for a safe universal key. Keep original fields and keys unchanged, make operations explicit, and show collisions as review evidence. Defer locale-specific casing, case folding, NFKC/NFKD, transliteration, and fuzzy matching.

## 5. M3 — code-point length and slicing

### Scope and implementation

Add `textLength(text)` and `textSlice(text, start, count?)`. Operate on Unicode scalar values/code points, after the common rejection of unpaired surrogates. `start` and supplied `count` are nonnegative safe integers; no negative indices, truncation, or string-to-number conversion. Omitted count means through the end; a provided null count is invalid. Start beyond the end and count zero produce empty text. Clamp a valid count at the string end without overflowing `start + count`.

Use code-point iteration or an equivalent iterator-based scan; do not use raw UTF-16 `.length`/`.slice` as the character algorithm. Avoid allocating all code points merely to count them, and stop slicing once the needed interval is consumed. No grapheme-segmentation dependency is needed. `textLength` returns numeric-or-missing and must propagate its result kind through aliases/conditionals/restores; `textSlice` remains text-or-missing.

Label help **Code points** rather than “visible characters.” A combining mark, skin-tone modifier, or zero-width joiner can be separated. A glyph-safe display truncation feature would require a different grapheme contract and is outside this API.

### Exact checks and acceptance

| Input/call | Required result |
| --- | --- |
| `textLength("😀")` | `1`, not UTF-16 length `2`. |
| `textLength("e\u0301")` | `2`; NFC `"é"` has length `1`. |
| `textLength("👨‍👩‍👧‍👦")` | `7` code points, although commonly displayed as one family glyph. |
| `textSlice("A😀B", 1, 1)` | `"😀"`, preserving the surrogate pair. |
| `textSlice("e\u0301", 1, 1)` | The combining accent U+0301 alone; no normalization. |
| `textSlice("abc", 3)` | `""`. |
| `textSlice("abc", 1, 0)` | `""`. |
| Negative/fractional/string/null control | Exact fixture error; no clamping or coercion. |

Check maximum safe integer bounds and omitted-versus-explicit-null count. Test functions directly, through parser-generated formulas, through named chains and traces, in project worker execution, and after save/reopen. Verify `textSlice` cannot create an unpaired surrogate from well-formed input, even though it can split a grapheme sequence.

### Docs, example, and risk

Add **Code points and displayed characters** to calculated-fields docs. Extend the runnable example with an exact-length code and emoji/combining-mark demonstration, including the trace and notebook table. The example must visually distinguish grapheme appearance from the documented numerical count. Include coverage/live-example changes and a minor changeset in this milestone.

**Main risk:** technically correct code-point slicing surprises users expecting graphemes. The explicit names/help, Unicode fixture examples, and separate deferral of grapheme-aware presentation slicing address this without making identifier preparation locale-dependent.

## 6. Integration run sheet and completion gates

These commands are a worker run sheet for the integration checkout, not commands executed by this research run. Start from the current checkout's instructions and inspect omitted integration files before edits. Substitute discovered actual test paths where required.

```bash
# Find the real shared execution, worker, notebook, export, and field-menu seams.
rg -n 'evaluateAnalysisQuery|new Calculator|CalculationManager|compileNotebook' packages apps
rg -n 'new Worker|postMessage|expose\(|Comlink|worker' packages apps
rg -n 'declaredColumnTypes|fieldTypes|sourceRows|contributors|calculation-error' packages apps
rg -n 'export.*CSV|export.*Json|download|useCalculationEditor|Map categories' packages apps
rg --files packages apps | rg '(calculation|analysis|project|notebook|worker|export|coverage).*test|live/examples|catalogue'

# Run focused library tests after implementation; new filenames are proposed.
pnpm --filter exploreda exec vitest run src/test/lib/calculations
pnpm --filter exploreda check-types

# Check examples and docs in the same feature milestone.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
pnpm dev:agent
# Use the printed URL for the real pointer/keyboard flow at 1280, 783, and 390 px.
pnpm shot /examples/text-preparation --name text-preparation

# Run the broad gate once, from one worktree, before opening the implementation PR.
pnpm check
pnpm --filter demo docs:verify
pnpm dev:agent --stop
```

Use time limits from `@repo/test-config`; do not add arbitrary per-test timeouts. Avoid concurrent package builds. If demo types need a rebuilt library after public type changes, follow the agent guide's explicit build prerequisite. Preserve user edits and the current React/TypeScript architecture. Codex owns implementation, final reconciliation with newer main, screenshots, changesets, and PR creation.

Do not claim performance measurements from this report. Measure a representative large loaded column during implementation to resolve the concrete risk of scanning or copying strings on every keystroke. Reuse the draft delay, cache by data/formula revision, classify in one pass, and virtualize/paginate rendering as needed. Do not replace complete review counts with a sample to make the UI appear fast.

## 7. Access, checks, deliverables, and open questions

**Access:** the complete scoped source packet provides the named baseline; prior category-mapping and join-key summaries are separate proposal evidence. It is not a runnable checkout. Worker entry points, some host adapters, and exact integration-test/exporter paths require inspection during implementation; this plan makes no claim to have executed them.

**Files read:** the research team covered all 35 baseline files and both separately referenced prior-proposal summaries. For this plan, decisive files are the calculation registry/parser/engine/types/state/recode and their four supplied tests; five calculation UI components; AnalysisProject/evaluateProject; project DSL, analysis text and folders; DataLayerProvider, saved types/validation and value parsing; notebook compiler; both supplied docs pages and the complete example registry; plus working rules, standards, research direction, README, and R048. The report provides the complete source inventory and limitations.

**Checks performed versus proposed:** source inspection and primary-source research are completed. Exact fixture derivation/validation is reported in the report and fixture companion. Product compilation, React/browser journeys, worker parity, package tests, save/reopen, real folder refresh, and performance checks in this plan are proposed acceptance work, not completed product tests.

**Companions:** [report.md](report.md), [recommendations.md](recommendations.md), and [fixtures.json](fixtures.json) form the design contract. Preserve the original deliverables and any supplied verification companion alongside this plan; the integration PR may distill them without discarding the originals.

**Open questions for implementation:** identify the real host/worker adapters and existing exporter extension points; verify the supported runtimes' Unicode conformance on the agreed corpus; choose the smallest existing UI component for paginated exact-row review; measure preview cost on representative data. None changes the function semantics, requires outside demand, or blocks starting M1. Broader regex, locale tailoring, grapheme display utilities, and identifier normalization policies remain deliberate future scope.
