# Explicit numeric preparation

Build saved numeric input conventions in workspace field settings. Let analysts review every conversion before Apply.
Preserve raw values and reuse the interpretation after refresh and reopen.
Then add percent/accounting input and an ordered project-query preparation step.

This is a proposed feature, not implemented behavior. Build dispositions do not approve release.
Source baseline: `9d64a021e35d312887b1bc848e307f42b6c3091f`, still origin/main on October 26, 2026.
[Research and local review](../../research/numeric-preparation-2026-10-26/README.md).
[Pro conversation](https://chatgpt.com/c/6adf55b2-0884-83e9-947e-c0913a71d939).
Keep React, TypeScript, and pnpm. No dependency on the other open preparation research PRs.

## Shared contract

Add `numericInput?: { preset, mode, accounting }` to `FieldSettings` in `src/lib/fieldSettings.ts`.
All `src/` paths below are under `packages/explorEDA/`.
Require explicit numeric type. Reject recipes on calculated outputs, including through saved JSON and direct API calls.
Absent recipes keep current behavior; do not infer or migrate a recipe.
New Number preparation starts with the visible `dot-plain` choice.
Keep display precision, percent formatting, currency, and units separate from input interpretation.

| Preset      | Decimal | Optional grouping | Stage |
| ----------- | ------- | ----------------- | ----- |
| dot-plain   | dot     | none              | M1    |
| comma-plain | comma   | none              | M1    |
| dot-comma   | dot     | comma, Western    | M1    |
| comma-dot   | comma   | dot, Western      | M1    |
| comma-space | comma   | spaces, Western   | M1    |
| dot-space   | dot     | spaces, Western   | M2    |
| indian-dot  | dot     | comma, Indian     | M2    |

Use one declared convention for the whole field. Grouping is optional, but validate it when present.
Western groups have 1–3 initial digits, then groups of three.
Indian groups have 1–2 initial digits, middle pairs, and a final group of three.
Thus `12,34,567.89` passes only indian-dot; `123,456` fails that preset's grouped branch.
Space grouping permits regular, nonbreaking, or narrow nonbreaking spaces, consistently within each token.
Do not collapse internal whitespace or mix space kinds within one value.
Accept ASCII digits, one adjacent leading sign, optional fractional digits, and an optional signed decimal exponent.
Accept `.5` or `,5` under the matching convention. Reject `1.`, radix prefixes, underscores, units, currency, and trailing text.
Trim outer whitespace. Leading zeros can convert deliberately: `0012` becomes 12 with a review flag.
Automatic inference remains unchanged. A converted measurement does not become a relationship key.

Preserve current missing-token precedence: null/undefined, exact configured token, blank, then conversion.
Strings compare after trim; native values compare through `String(value)`. Tokens remain case-sensitive.
Allow comma-containing tokens as individual items; replace the inspector's comma-splitting editor.
Native finite numbers pass through without percent scaling. Booleans and nonfinite values fail unless a token matched.
Keep valid, missing, and failed outcomes distinct. Failed cells become undefined; retain their raw rows and reasons.

Store Number values. Normalize decimal coefficient/exponent before one Number conversion.
M2 percent text shifts the decimal exponent by −2 first; do not parse then divide.
Reject overflow, nonzero underflow to zero, and text whose exact scaled integer exceeds the safe-integer range.
Also reject fractional text that rounds to an unsafe integer. Native large finite values remain unchanged and flagged.
This is an explicit range policy: textual `1e20` fails even though that Number is representable.
Accept subnormals and ordinary binary approximation. Normalize prepared negative zero to positive zero; preserve raw negative zero.
Flag rounding by exact decimal/binary comparison, not formatted text. Use bounded diagnostic arithmetic, not a new numeric runtime.
Limit normalized coefficients to 20 significant digits; remove leading/trailing zeros before counting.
Limit trimmed nonmissing text to 4096 UTF-16 units after token matching. Bound exponent work before powers or allocation.
These limits are selected input policies. They do not change existing inference or ordinary conversion.

Expose the parser through `src/lib/valueParsing.ts`. Focused `numericInput.ts` and `numericRepresentation.ts` helpers can hold the implementation.
Preview, Apply, restore, trace explanation, and refresh use the same converter through `fieldSettings.ts`.
Charts continue to receive prepared numbers and need no locale parser.

## M1 — Durable workspace preparation

Ship the first five presets with `mode=number` and `accounting=false`.
Include complete review, atomic Apply, retained refresh, JSON/text/folder/notebook persistence, docs, and an example together.

Change `fieldSettings.ts`, `valueParsing.ts`, `providers/DataLayerProvider.tsx`, and `utils/saveDataUtils.ts`.
Include the recipe in conversion triggers and semantic equality. Validate nested shape, members, preset, and target.
Add a replacement/clear operation for inspector drafts; the current field setter shallow-merges updates.
Rebuild runtime rows, profiles, calculations, and caches from raw rows when interpretation changes.
Use `parseExpression(...).dependencies` for the transitive calculation closure; reuse existing dependency helpers where possible.
Clear affected value predicates in chart filters, chart localFilters, Rows filters, and workspace filters.
Clear affected visible facet membership. Preserve unrelated predicates, layout, display settings, and authored bounds.
Retain row membership on same-row Apply. On refresh, clear positional selections unless typed raw correspondence is established.
Current `carryRowSelections` uses JSON content signatures: NaN/null, undefined, and negative zero cannot prove this fixture's identity.
Do not claim this helper supplies stable business identity. Use `rowIdFilters.ts` to cover all four owners.

Extend the existing `components/SummaryTable/components/FieldInspector.tsx` draft flow.
Extract numeric controls and audit components instead of adding another large inspector responsibility.
Show raw value/type, prepared number, outcome/reason, and separate display preview.
Count all workspace input rows, independently of chart/Rows filters. Query input scope remains the evaluated query result.
Show representative reasons and flags beyond the first eight rows, plus an exact paged list for every count.
Use revision plus row position only for temporary audit references; invalidate them on refresh.
Show alternate successful meanings for selected-valid rows without changing their result or rescuing failures.
For example, `1,234` means 1234 under dot-comma and 1.234 under comma-dot.
Audit subset controls affect only the audit. Export the full chosen audit subset with typed raw cells and recipe/revision.
Prepared-data CSV uses runtime values; saved analysis uses raw rows plus settings. Do not export display-rounded values as measurements.

Draft edits emit no saved change. Apply reports failures and affected predicates, then emits one history checkpoint/callback.
Cancel emits none. Reset restores the opening applied settings; removing preparation is a separate reviewed draft edit.
Rerun a draft after raw refresh and disable Apply until its revision matches.
For text-backed hosts, compile the candidate field edit before mutation. Reject an unrepresentable edit without an external callback.
Current notebook rollback runs after `onStateChange`, so it cannot provide this guarantee.
Keep any new field-commit preflight internal and specific to representability; do not add a general transaction/approval framework.

Add flattened Dashboard tokens: `as=num number.preset=dot-comma number.mode=number number.accounting=false`.
Update `lib/dsl/settingKeys.ts`, `compile.ts`, `export.ts`, and `views.ts`; reuse shared field-token serialization.
Assemble the effective recipe before validation. Preserve existing alias-first, native-field-after precedence.
Reject incomplete/unknown settings with located errors. Row failures remain nonfatal conversion outcomes.
`exportViews` currently substitutes the first view's shared definitions and reports omissions.
Block numeric interpretation conflicts, including recipe absence and null-token differences, before shared-text export or Apply.
Do not silently propagate one view's new interpretation to the others.
Propagate numeric export errors from `lib/project/writeFolder.ts::analysisFileText` before writing affected files.
Check every view with its own query data through `analysisText.ts`, including an empty first view.
Do not broaden this task into repairing every existing export omission.

Extend `SavedSpecialValue` and the existing saved-analysis codec with a raw `-0` tag.
Retain existing undefined/NaN/infinity tags. Check actual calculation validation against prepared input before changing its behavior.
Extend `lib/notebook/writeBack.ts` with focused field writeback and integrate `ExplorEdaNotebook.tsx`.
Remove changed keys from all contributing alias/native declarations, write once, and recompile to verify the requested state.
Preserve prose, comments, unrelated tokens, and sheet layout. Refuse edits whose frozen/broken owner cannot safely change.

Add `refreshData` beside reset-oriented `setData`. Replacing data on the same provider retains applied settings.
Explicit import/setData or remount starts a new dataset. New supplied savedData takes precedence; omission is not a reset.
Document this behavior change. Use current raw rows/settings for correspondence, not stale externally supplied settings.
Preserve canonical fingerprint stability so a host echo does not rebuild or revive stale selections.
Retain recipes for temporarily absent exact fields as inactive; no fuzzy labels or fabricated columns.
Pass known field identities through DSL compilation and settings compatibility, including empty query results.
Test absent-field save/reopen/return. If a host cannot represent that binding, reject its write explicitly.

Tests: extend parser/field settings/provider/FieldInspector suites, `dsl/export.test.ts`, `dsl/views.test.ts`,
`notebook/writeBack.test.ts`, and folder read/write tests. Add focused numeric audit/roundtrip suites where needed.
Prove preview/Apply parity, same-type preset change, direct and transitive predicate clearing, one callback,
Cancel/Reset, host echo, undo/redo, raw codec, multi-view conflict, notebook duplicate declarations, and repeated refresh.
Use actual calculation missingness behavior rather than assuming undefined arithmetic propagates automatically.

Docs: add `apps/demo/src/docs/pages/numeric-preparation.mdx`; update fields, load-data, and calculated-fields pages.
Register the page and live example. Add a typed fixture/example in `apps/demo/src/demos/examples.ts` and `coverage.ts`.
CSV alone cannot prove native-number/text distinctions. Include a folder case and a two-sheet notebook.
Use focused Playwright interaction coverage for fill/Escape/refresh; current live-step scripts alone do not cover those actions.
Register the browser project explicitly in `apps/demo/playwright.config.ts` if adding a new test file.
Verify real keyboard/pointer flows at 1280, 783, and 390 px, with late failures and long names.
Prototype audit layout and scheduling. Add chunking or workers only if measurement requires them.
Risk: correct-looking Apply loses meaning at refresh or text writeback. Stop M1 release until lifecycle checks pass.

## M2 — Percent, accounting, and additional grouping

Extend the same registry with dot-space/indian-dot, percent mode, and accounting negatives.
Percent text requires one adjacent terminal ASCII `%`, inside parentheses when accounting is enabled.
`12%` becomes 0.12; `0.12%` becomes 0.0012; bare text `12` fails; native 12 stays 12.
Number mode rejects percent signs. `12 %` fails syntax; `12%%` fails percent syntax.
Accounting permits one outer pair without inner signs/padding: `(1,234.50)` becomes −1234.5.
Disabled accounting rejects parentheses; enabled accounting still rejects `(-12)`, `(12)%`, and nested pairs.
Do not change display format silently. Native 12 can display as 1200%; make that visible during review.

Change the M1 parser, controls, validators, text codec, and tests together. Reuse every persistence and refresh path.
Test exact scaling before rounding: `5e-322%` becomes Number.MIN_VALUE; repeated refresh must never rescale runtime numbers.
Extend the docs page and add a `numeric-preparation-percent` example with native/text rate values together.
Register coverage/live steps and repeat narrow/keyboard/save/reopen acceptance.
Risk: native measurements or prepared values receive percent scaling twice.

## Exact workspace fixture

Use IDs N01–N34. Odd IDs are North; even IDs are South. IDs are assertion labels, not assumed provider identity.
Quoted inputs are text; others are native values. Apply dot-comma, tokens `NA` and `-`, accounting false.
Amount uses number mode in M1. Rate uses percent mode only in M2.
`F` means failed and runtime undefined; `M` means missing and runtime undefined. Retain distinct reasons.

| ID  | Raw Amount → result                             | Raw Rate → result               |
| --- | ----------------------------------------------- | ------------------------------- |
| N01 | 12 → 12                                         | "12%" → 0.12                    |
| N02 | "12" → 12                                       | 0.12 → 0.12                     |
| N03 | "1,234" → 1234                                  | 12 → 12                         |
| N04 | "1.234" → 1.234                                 | "12" → F missing-percent        |
| N05 | "1,234.50" → 1234.5                             | "0.12" → F missing-percent      |
| N06 | "1.234,50" → F invalid-grouping                 | "0.12%" → 0.0012                |
| N07 | "12,34,567.89" → F invalid-grouping             | "1,200%" → 12                   |
| N08 | "1 234,50" → F unsupported-character            | "(12%)" → F accounting-disabled |
| N09 | "1\u00a0234,50" → F unsupported-character       | "NA" → M                        |
| N10 | "1\u202f234,50" → F unsupported-character       | null → M                        |
| N11 | "(1,234.50)" → F accounting-disabled            | "1e-400%" → F underflow-to-zero |
| N12 | "12%" → F unexpected-percent                    | "5e-322%" → Number.MIN_VALUE    |
| N13 | "0012" → 12                                     | "0%" → 0                        |
| N14 | "9007199254740993" → F unsafe-integer           | "-0%" → 0                       |
| N15 | "1e309" → F overflow                            | "12 %" → F invalid-syntax       |
| N16 | "1e-400" → F underflow-to-zero                  | "12%%" → F invalid-percent      |
| N17 | NaN → F non-finite                              | null → M                        |
| N18 | Infinity → F non-finite                         | null → M                        |
| N19 | "NaN" → F non-finite                            | null → M                        |
| N20 | "Infinity" → F non-finite                       | null → M                        |
| N21 | −0 → 0                                          | null → M                        |
| N22 | "-0" → 0                                        | null → M                        |
| N23 | true → F boolean-not-numeric                    | null → M                        |
| N24 | null → M                                        | null → M                        |
| N25 | undefined → M                                   | null → M                        |
| N26 | " " → M blank                                   | null → M                        |
| N27 | "NA" → M null-token                             | null → M                        |
| N28 | "bad" → F invalid-syntax                        | null → M                        |
| N29 | "0.1" → 0.1                                     | null → M                        |
| N30 | ".5" → 0.5                                      | null → M                        |
| N31 | "5e-324" → Number.MIN_VALUE                     | null → M                        |
| N32 | "0.123456789012345678901" → F precision-limit   | null → M                        |
| N33 | 9007199254740992 → unchanged, precision unknown | null → M                        |
| N34 | 1e20 → unchanged, precision unknown             | null → M                        |

All-row counts are Amount 13/4/17 and Rate 8/20/6, in valid/missing/failed order.
North-only counts are 8/2/7 and 4/10/3, but selecting North must leave full audit counts unchanged.
Binary-rounded Amount IDs: N04/N29/N31; Rate: N01/N06/N12. Negative-zero Amount: N21/N22; Rate: N14.
Alternate meanings: Amount N03/N04. Successful raw/prepared changes under Object.is: Amount 10, Rate 6.
Reverse rows and add N35 with both fields `broken`: counts become 13/4/18 and 8/20/7.
Restore original order, change N03 to `2,345.00` and `25%`: values become 2345 and 0.25; original counts return.
Repeat fresh copies twice, save/reopen, then restore original data. No cumulative percent scaling or stale audit IDs.
`double=amountRaw*2` yields N03 2468 initially, then 4690 after the changed data.
Remove Amount entirely, save/reopen while absent, and return it: preserve the inactive exact-name recipe.

Freeze reason precedence: missing/token; native type/nonfinite; length; nonfinite text; accounting; percent;
sign/unsupported characters/exponent/grouping; precision; overflow; underflow; safe-integer checks.
Recognize exponents only after numeric mantissas. Check representation after exact percent scaling.
Additional vectors: `9007199254740993.0` and `9.007199254740993e15` fail unsafe-integer;
`9007199254740991.1` rounds to safe 9007199254740991; `9007199254740991.5` fails unsafe-integer.
`4503599627370496.5` rounds down, while `4503599627370497.5` rounds up to 4503599627370498.
`2.4e-324` underflows; `2.5e-324` becomes Number.MIN_VALUE. Exact `0e99999` remains zero.
`9007199254740993%` becomes 90071992547409.94; `1e309%` fails unsafe-integer after scaling; `1e311%` overflows.
Exactly 4096 zeros pass; 4097 fail length unless an exact null token matched first.
Test mixed/doubled grouping spaces, Unicode digits/minus, inner accounting signs, and comma-containing null tokens.

## M3 — Ordered query measurement preparation

Add `PrepareNumberStep` to `src/types/AnalysisProject.ts`: inputStepId, inputFieldId, new fieldId, label, recipe, and nullTokens.
Change `lib/analysis/evaluateProject.ts`, `lib/dsl/project.ts`, project query editing/stage inspection, and folder serialization.
Reuse the scalar converter. Keep original fields, source rows/keys, row count, and contributor references.
A failed output is undefined with a retained preparation reason. Later stages can explicitly filter or calculate that measurement.
Reject output collisions. Do not mutate source tables, relationships, or entity keys.
Carry row-level conversion evidence through downstream traces instead of reclassifying failed preparation as generic missingness.
Reuse `analysisWorkerProtocol.ts` and `useAnalysisEvaluation.ts`; test synchronous/worker parity and obsolete response rejection.

Fixture: source orders has entityKey id and rows A/0012/1,234.50, B/0013/bad, C/0014/2,000.00, all raw fields text.
Source → prepare orders.amount into amountNum gives [1234.5, undefined, 2000], valid 2/missing 0/failed 1, no rows dropped.
Then amountNum > 1500 retains C; calculating double gives 4000. Prepared sum is 3234.5, filtered sum is 2000.
Retain keys orders:string:A/B/C. B's preparation reason stays invalid-syntax.
A relationship to numeric code 12 still cannot match raw string 0012. The new field is not a relationship endpoint.
Test text/folder/notebook reopen, source byte equality, contributor IDs, pending recipe edits, refresh, and worker results.

Extend numeric-preparation docs with query scope and add a folder-backed `numeric-preparation-query` example.
Register examples, coverage, live steps, and browser acceptance. Risk: confusing derived measurements with raw relationship identity.

## Delivery gates

Each feature milestone includes its docs, runnable example, minor changeset, meaningful tests, and UI screenshots.
Run targeted Vitest suites and library check-types during work. Run demo coverage/dashboardText and docs checks.
Run docs browser acceptance and actual pointer/keyboard checks at the three required widths.
Run `pnpm check` once before the feature PR, after targeted checks pass.
This research PR changes only documentation and requires doc/format/PR checks, not feature acceptance or a package build.

## Preserved Pro result materials

[Original Pro reports and artifacts for #531](assets/pro-results/numeric-preparation-2026-10-26/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
