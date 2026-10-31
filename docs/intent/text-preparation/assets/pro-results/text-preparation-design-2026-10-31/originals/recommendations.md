# Reusable text preparation — recommendations

**Build guided text preparation on the existing saved-formula and Calculator path.** The first release must close the complete clean/extract/compose, exact review, Apply, chart grouping, trace, save/reopen, refresh, project, and notebook workflow. Preserve original records and their identities. Add deliberate Unicode transformations and code-point positioning in subsequent independently useful releases.

Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`. Date: October 31, 2026. These are design dispositions for Codex to review and integrate, not statements of shipped behavior or permission to publish. IDs are stable; retain them when recording local dispositions. The full rationale and citations are in [report.md](report.md); implementation details and acceptance gates are in [implementation-plan.md](implementation-plan.md).

## Build

| Stable ID | Recommendation and reason |
| --- | --- |
| **TP-01** | **Build — M1: guided authoring that emits formulas.** Clean, Extract, and Compose produce the same expression text used by the ordinary calculation editor and project `calc`. One durable definition avoids a second recipe owner. |
| **TP-02** | **Build — M1: four functions.** Add `textTrim`, `textPart`, `textReplace`, and `textConcat` directly to the real registry. They cover imported-code cleaning, delimited extraction, and label composition without arrays or a broad string language. |
| **TP-03** | **Build — M1: strict value and argument contracts.** Preserve nullish missing, valid empty text, wrong-type errors, literal matching, zero-based part positions, and a fixed trim set. Reject malformed UTF-16 and controls without coercion. |
| **TP-04** | **Build — M1: original/effective/output evidence.** Keep original records untouched and show the value actually used after source field settings or earlier query stages. This makes conversion effects inspectable and prevents false claims of recovering lost identifiers. |
| **TP-05** | **Build — M1: shared result-kind inference.** Preserve guaranteed text through direct functions, aliases, text-or-null branches, profiles, filters, normal column construction, restoration, project fields, and notebook adapters. Numeric-looking identifiers must remain text. |
| **TP-06** | **Build — M1: failure-aware dependency reads.** Carry runtime field faults and propagate them only when the expression actually reads the field. An error must not become harmless missing, and an unused failed branch must not poison a successful result. |
| **TP-07** | **Build — M1: common validation before rows.** Validate fields, function names, arity, and literal/signed-literal control constraints even on empty input. Preserve eager function-argument evaluation and existing conditional/boolean short circuit. |
| **TP-08** | **Build — M1: exact outcome review.** Compute full-population counts and memberships; page only the display. Label the comparison and row grain. Distinguish changed/unchanged/missing/error, with empty text as a successful subset. New composition uses Produced rather than an invented before value. |
| **TP-09** | **Build — M1: meaningful collision review.** Group distinct exact inputs by successful output, including unchanged members and empty text. Use structural typed tuples for composition. Treat ordinary duplicates separately and never infer entity equality. |
| **TP-10** | **Build — M1: expose existing execution steps.** Extend the current trace UI using Calculator's recorded steps and source references. Trace one selected row through the actual shared evaluator, including dependency errors and unexecuted-branch distinctions. |
| **TP-11** | **Build — M1: complete persistence and refresh.** Save formula strings and original data through existing JSON/text/folder paths, recompute runtime evidence on reopen, and invalidate revision-local membership after refresh. Add exact typed review export; keep ordinary CSV as a convenience value export. |
| **TP-12** | **Build — M1: project/worker/notebook closure.** Reuse `CalculateStep`, preserve field types and original references through flattened adapters, and test actual foreground/worker parity and refreshed notebook bindings. These are release gates, not later cleanup. |
| **TP-13** | **Build — every milestone: docs, valid function-help examples, runnable examples, and acceptance fixtures.** Extend the active registry-driven help, calculated-fields docs, project-folders docs, and the runnable text-preparation example together. Insert valid expressions rather than signature ellipses. |
| **TP-14** | **Build — M2: explicit NFC and casing.** Add `textNormalize` for NFC only and whole-string `textLower`/`textUpper`. Keep operations deliberate and expose collisions/code points. No ambient locale or identifier-equality promise. |
| **TP-15** | **Build — M3: code-point length and slicing.** Add `textLength` and `textSlice` with zero-based nonnegative safe-integer positions/counts. Name the unit in help, preserve surrogate pairs, and make grapheme-splitting consequences visible. |
| **TP-16** | **Build — implementation measurement.** Measure full-preview and collision-review cost on representative text columns. Reuse debounce/revisions and page rendering; do not substitute samples for exact counts or invent arbitrary caps without measurement. |

## Explore

| Stable ID | Recommendation and reason |
| --- | --- |
| **TP-17** | **Explore: explicit formatting and a separately named missing-skipping label join.** Useful for numeric/date display and optional label components, but each needs a deliberate format/missing policy. Do not hide these behaviors inside the initial strict functions. |
| **TP-18** | **Explore: locale-bearing casing.** A future explicit locale parameter or distinct function can serve language-specific display needs. Turkish I and other tailored mappings make device-locale defaults unsuitable. |
| **TP-19** | **Explore: grapheme-aware display utilities.** User-perceived-character truncation is useful, but needs its own segmentation/runtime contract. It must not silently change the unit of saved analytical formulas. |

## Defer

| Stable ID | Recommendation and reason |
| --- | --- |
| **TP-20** | **Defer: regular-expression functions.** Decide syntax, flags, captures, no-match outcomes, replacement rules, and bounded execution separately. Literal part/replacement functions complete the chosen first workflow. |
| **TP-21** | **Defer: compatibility normalization, transliteration, accent removal, and case folding.** These are distinct operations with broader equivalence effects. NFC and display casing do not authorize them implicitly. |
| **TP-22** | **Defer: source-owned prepared keys, shared recipe registries, and a new project preparation-step type.** They add identity, ownership, and dependency requirements beyond row-wise formulas. The current mission must ship without the unbuilt join-key/reusable-output proposals. |

## Avoid

| Stable ID | Recommendation and reason |
| --- | --- |
| **TP-23** | **Avoid: implicit stringify, numeric-string positional coercion, and text overloading of `+`.** They conceal invalid inputs and alter existing arithmetic/identifier semantics. |
| **TP-24** | **Avoid: overwriting source values, automatic category merging, and treating a display label as an identity key.** Review must preserve original evidence and leave identity policy explicit. |
| **TP-25** | **Avoid: a second expression evaluator, generic plugin framework, unnecessary saved-format migration, or persistent preview/result history.** The current shared execution and save seams suffice for one local analyst and one current version. |

## Acceptance evidence attached to these dispositions

- [fixtures.json](fixtures.json) contains 170 direct-function contracts, 19 engine-integration cases, the 18-record workflow, exact output groups/collisions, and refresh expectations.
- [project-fixture.json](project-fixture.json) contains the complete six-record project contract, original record references, `.eda` text, and empty-input validation cases.
- [reference-text-functions.mjs](reference-text-functions.mjs) and [verify-fixtures.mjs](verify-fixtures.mjs) provide a standalone semantic oracle and verifier. The executed run passed 323 assertions. This does not count as product/parser/worker/browser acceptance.

**Access and checks:** all 35 baseline files and both separate research summaries were read, with current primary-source comparison. **Implementation remains proposed:** Codex must reconcile current main, implement, run product integration checks, and prepare any PR. **Open questions:** locate omitted adapters, verify empty-text categories and supported Unicode runtimes, and measure preview cost. No outside-demand evidence or additional product-design approval is required to start M1.
