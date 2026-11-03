# Explicit numeric preparation — worker-ready implementation plan

## Build decision and baseline

Build reversible, explicit numeric preparation in the existing workspace field settings, followed by additional numeric conventions and a bounded project-query preparation step. The first milestone must let an analyst choose an input syntax, inspect every result, apply one durable interpretation, and reuse it on refreshed raw rows. It is a complete feature, not a parser-only or documentation milestone.

Authoritative source: the supplied complete-file packet at `9d64a021e35d312887b1bc848e307f42b6c3091f` (recorded `origin/main`, October 26, 2026). Keep React, TypeScript, and pnpm. This plan proposes repository changes; no application implementation, Vitest suite, browser acceptance, or folder roundtrip was executed during the research mission. Numeric research probes are distinguished in the final evidence section.

The report's stable recommendation IDs apply throughout:

| IDs | Implementation responsibility |
|---|---|
| NP-01, NP-02, NP-03 | Workspace ownership, finite preset grammar, numeric representation |
| NP-04, NP-06 | Complete conversion audit, alternate successful interpretations, atomic Apply and invalidation |
| NP-07, NP-08 | Durable settings/raw values, notebook writeback, retained-settings refresh |
| NP-05 | Percent, accounting, and remaining fixed presets |
| NP-09 | Explicit project `prepare-number` step producing a new measurement |
| NP-10, NP-14 | Bounded responsiveness/layout prototype, docs, runnable examples, discriminating fixtures |
| NP-11, NP-12, NP-13 | Keep arbitrary precision/currency/general grammar and relationship-key work out; reject guessing and consumer-specific parsers |

### Milestone order

| Milestone | Independently shippable result | Main risk |
|---|---|---|
| M1 — Durable workspace preparation | Five explicit presets, complete audit, Apply, JSON/text/notebook persistence, and same-source refresh | A value changes correctly on screen but is lost, double-applied, or interpreted differently after an echo, refresh, or reopen |
| M2 — Percent and accounting inputs | Percent-suffixed text, accounting negatives, dot-space and Indian grouping, with the same audit and persistence | Percent scaling and native-number preservation become confused, especially across repeated refreshes |
| M3 — Project query measurements | An ordered `prepare-number` step creates a numeric measurement before project filters/calculations/aggregates | Accidentally changing source identity, joins, or worker semantics while adding query preparation |

No milestone depends on the unbuilt category-mapping, reshape, ordered-difference, or join-key proposals. Byron's request establishes demand. Prototype only interaction/layout and responsiveness decisions; the grammar, ownership, and numeric policies below are decisions to implement directly.

## 1. Shared implementation contract

### 1.1 Canonical saved recipe

Extend `FieldSettings` in `packages/explorEDA/src/lib/fieldSettings.ts` with an optional `numericInput`. Its three members are required whenever it exists:

```ts
type NumericInput = {
  preset:
    | "dot-plain"
    | "comma-plain"
    | "dot-comma"
    | "comma-dot"
    | "comma-space"
    | "dot-space"
    | "indian-dot";
  mode: "number" | "percent";
  accounting: boolean;
};
```

M1 accepts only its five available presets, `mode: "number"`, and `accounting: false`; unavailable choices fail validation rather than silently defaulting. M2 expands accepted values. Store a canonical object with these keys and a stable serializer. Do not retain hidden locale names or independent decimal/grouping overrides alongside the preset.

Rules:

- `numericInput` requires explicit `type: "numeric"`; it is invalid on categorical/date/boolean or Automatic settings.
- Forbid it on calculated outputs. Their values and type come from the expression. Source-like query result fields can be converted at the workspace boundary, but the recipe does not reach upstream into their query.
- An absent recipe retains baseline behavior. No inferred migration or parser-version compatibility layer is introduced.
- Choosing Number in the new preparation UI creates `dot-plain`, number mode, accounting false. An existing numeric field without a recipe may remain unchanged until the analyst explicitly chooses an input convention.
- Display `format`, `precision`, `unit`, and `currency` remain separate. Changing them cannot alter prepared values.
- Null-token matching retains current behavior: trimmed strings compare exactly and case-sensitively; native values compare through `String(value)`. Thus a configured token `"12"` can deliberately mark native `12` missing. The editor must store token items without splitting on commas, because `"1,234"` can itself be one token.

Extend public exports from the package's existing entry points after inspecting them in the checkout. The attached packet did not include the entry modules; do not invent their exact export locations.

### 1.2 One parser and one diagnostic contract

Keep all raw-row reading behind `src/lib/valueParsing.ts`, as `CODING_STANDARDS.md` requires. Add a small pure helper module such as `src/lib/numericInput.ts`, exposed through `valueParsing.ts`, rather than expanding chart components or the inspector with parsing logic. Separate pure lexical normalization from binary64 conversion and representation auditing. A proposed module split is:

- `numericInput.ts`: preset registry, lexical grammar, normalized decimal coefficient/exponent, reason codes.
- `numericRepresentation.ts`: significant-digit limit, safe-integer policy, single binary64 conversion, rational comparison, zero/subnormal flags.
- `fieldSettings.ts`: missing-token precedence, effective type, row integration, preview/audit aggregation.

Return a discriminated result rather than deriving diagnostics from formatted output:

```ts
type NumericResult =
  | { status: "valid"; value: number; flags: NumericFlag[] }
  | { status: "missing"; value: undefined; reason: MissingReason }
  | { status: "failed"; value: undefined; reason: NumericFailure };
```

Successful flags include `binary-rounded`, `subnormal`, `leading-zeros-removed`, `negative-zero-normalized`, and `native-precision-unknown`. Missing and failed both become `undefined` in runtime rows but remain distinct in audit records. Do not replace failures with zero or remove their raw rows.

Add a canonical per-field semantic fingerprint including explicit type, recipe presence/members, and null-token matching semantics, not just the preset. Include date preset where relevant to the general field conversion path. Combine it with owner/field identity and raw-data epoch for audit caches; display precision is not part of the numeric result cache key. Preview, Apply, restore, DSL compilation, trace explanation, and refresh must call the same conversion kernel. Chart consumers continue reading prepared runtime values; they must not gain preset parameters or a second locale parser.

### 1.3 Exact accepted syntax

All presets accept ungrouped integers and optional exponents. M1 presets are:

| Preset | Decimal mark | Grouping |
|---|---|---|
| `dot-plain` | `.` | None |
| `comma-plain` | `,` | None |
| `dot-comma` | `.` | Commas; Western groups |
| `comma-dot` | `,` | Periods; Western groups |
| `comma-space` | `,` | One consistent permitted space character; Western groups |

M2 adds `dot-space` (dot decimal, space groups) and `indian-dot` (dot decimal, commas with Indian groups).

Lexical contract:

- Trim outer text using ECMAScript `trim`; retain raw text unchanged. A trimmed empty string is missing. After null-token handling, reject trimmed nonmissing text longer than **4,096 UTF-16 code units** with `input-too-long`; do not construct unbounded BigInts or powers from an exponent.
- Digits are ASCII `0–9`. At most one leading ASCII `+` or `-` is allowed, immediately adjacent to the mantissa. Unicode minus, Arabic-Indic/fullwidth digits, trailing signs, and internal sign spacing fail.
- Accept `.5` or `,5` only under the matching decimal convention. Reject a decimal mark with no following fraction digit (`1.` or `1,`). A decimal mark occurs at most once.
- Optional exponent is `[eE][+-]?[0-9]+`, with no separators or spaces. A valid grouped mantissa may precede it.
- Western grouped integers have 1–3 digits in the first group and exactly three in every following group. Grouping is optional, occurs only before the decimal mark, and never becomes punctuation stripping.
- Indian grouping has 1–2 initial digits, zero or more middle groups of two, and a final group of three. `1,234`, `12,345`, `1,23,456`, and `12,34,567` pass; `123,456` fails that grouped branch. Ungrouped integers remain available.
- Space presets accept U+0020, U+00A0, or U+202F, but every separator inside a token must use the same code point. Reject double spaces, mixed space kinds, tabs, and whitespace in the fraction/exponent.
- Currency symbols/codes, units, arbitrary trailing text, apostrophes, underscores, radix prefixes, and unsupported Unicode characters fail. No locale, currency, or unit is inferred from them.
- `0012` becomes measurement `12` with a review flag. Automatic inference remains unchanged, and source/relationship identifiers remain outside this conversion boundary.

Failure ordering is deterministic: intrinsic null/undefined, configured tokens, and trimmed blanks; native type rules; trimmed input-length bound; recognized nonfinite text; accounting/percent structural checks; sign structure, prohibited Unicode/whitespace, exponent structure, and grouping/mantissa grammar; significant-digit limit; overflow; nonzero-to-zero underflow; exact/result unsafe-integer guard. A recognized `NaN`/`Infinity` spelling is `non-finite`, not an ordinary missing value, unless a configured null token explicitly matches first. Repeat that recognition on the body of a valid percent/sign wrapper. Only an exponent following a numeric mantissa gets `invalid-exponent`; `eleven` is `invalid-syntax`.

### 1.4 Numeric representation

The output is a finite JavaScript Number, intentionally using binary64 measurements. After lexical normalization:

1. Canonicalize coefficient and exponent; count at most 20 significant coefficient digits after stripping leading/trailing zeros and adjusting the exponent. Reject a nonzero coefficient exceeding the limit as `precision-limit`.
2. In percent mode, shift the exact decimal exponent by −2 **before** conversion. Never parse then divide a floating result by 100.
3. Convert the normalized decimal once. Reject nonfinite results as `overflow` and nonzero exact decimal inputs producing either zero as `underflow-to-zero`.
4. For text, reject an exact scaled integer outside ±9,007,199,254,740,991, regardless of spelling, and reject a rounded result that is itself an unsafe integer. `1e20` fails this safe-range policy even though that particular Number is representable; do not describe every such rejection as rounding.
5. Compare the exact normalized decimal rational with the binary64 result rational using bounded BigInt arithmetic and bit decomposition. Flag `binary-rounded` only when they differ. Ordinary `0.1` is flagged; a shortest-string equality check is insufficient.
6. Accept nonzero subnormals with a `subnormal` flag. Normalize prepared negative zero to +0 with `negative-zero-normalized`. Raw negative zero remains recoverable through the saved-analysis codec.

Native finite numbers pass through unchanged except prepared −0 normalization. Native unsafe integers get `native-precision-unknown`; their original source precision cannot be reconstructed, but they are not discarded or percent-scaled. Native booleans fail unless a configured null token matched first. Native nonfinite values fail `non-finite`.

This bounded contract avoids overclaiming portable rounding for arbitrary-length decimal strings. See the primary specification's [RoundMVResult](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-roundmvresult), [Number type](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type), and [safe-integer bound](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-number.max_safe_integer). The limit and rejection policy are explorEDA design decisions, not automatic behaviors supplied by Number.

**Bound exponent work concretely.** After syntax and length checks, an all-zero coefficient returns +0 regardless of exponent, with negative-zero normalization as needed. For nonzero text, strip coefficient leading/trailing zeros, enforce its 20-significant-digit cap, and compute the adjusted exponent `e` as a BigInt from the bounded exponent text (including fraction length, removed zeros, and percent −2). Let `k = coefficient.length - 1 + e`. If `k > 308`, report overflow; if `k < -324`, report underflow-to-zero. Otherwise `e` lies in [−343,308], so one short canonical decimal can be converted and exact rational comparison needs at most `10n ** 343n`. Boundary decades still require Number conversion. Do not use the original exponent as an allocation/power bound.

With trailing zeros removed from a nonzero coefficient, exact integrality is `e >= 0`. Compare decimal digit counts and, at 16 digits, lexically against `9007199254740991` before constructing the safe-range result. Also check the rounded Number itself, because a fractional exact input can round to an unsafe integer. These metadata calculations never change the runtime representation from Number.

## 2. M1 — Complete durable workspace preparation

### 2.1 Modules and changes

**Parsing and field integration:** update `src/lib/valueParsing.ts`, `fieldSettings.ts`, their tests, and add the focused helpers above. `applyFieldSettings` and `buildConversionPreview` currently recognize type/date/null-token settings; include `numericInput` in their semantic triggers. Extend `getFieldSettingsError` with object-shape, enum, stage-availability, and explicit-numeric constraints. Keep automatic `isExactNumberText` and `dataTypeDetection.ts` behavior unchanged.

**Provider:** update `src/providers/DataLayerProvider.tsx`. Add the recipe to the semantic-change comparator, factor a reusable raw-to-runtime build path, invalidate calculation/column caches, rebuild runtime profiles, and maintain existing declared-type precedence. `getAggregateResult` already calls `convertFieldValue` to explain source-measure failures; keep it on the shared kernel so traces and runtime agree.

Retain the existing merge-style `updateFieldSettings` API, but add a full replacement/clear operation such as `replaceFieldSettings(field, next: FieldSettings | undefined)` for applying an inspector draft. It must remove absent keys rather than leave a stale nested recipe after Reset/removal. Normalize undefined members consistently before equality/save. Shape validation belongs in `getFieldSettingsError`; target-aware validation belongs in the provider and `validateSavedData`, which can compare field names with `calculations[].resultColumnName`. A calculated output must not acquire an input recipe through a direct API call or saved JSON merely because the UI hides the control.

**Inspector and audit:** update `src/components/SummaryTable/components/FieldInspector.tsx` and its tests; extract `NumericPreparationControls.tsx` and `NumericConversionAudit.tsx` rather than enlarging the existing 612-line component. Add focused audit helpers and tests under `src/lib/`. Preserve existing field labels, metadata, date/boolean controls, and display formatting.

**Persistence:** update `src/types/SavedDataStructure.ts`, `src/utils/saveDataUtils.ts`, `src/lib/dsl/settingKeys.ts`, `compile.ts`, `export.ts`, and `export.test.ts`. Add notebook field writeback and tests in `src/lib/notebook/fieldWriteBack.ts`; integrate it in `writeBack.ts` and `components/notebook/ExplorEdaNotebook.tsx`. Add folder roundtrip tests beside `src/lib/project/analysisText.ts`, `folder.ts`, and `writeFolder.ts`. Inspect the actual multi-view exporter before modifying it; its implementation was not in the packet.

### 2.2 User flow and audit

Use the existing field inspector. Keep controls compact: a Number type choice, an Input convention selector with concrete examples, null-token items, and separate display settings. M1 shows its five conventions. An existing absent recipe is labeled with its current behavior until an explicit choice; selecting a new Number preparation creates strict `dot-plain`.

Draft changes do not mutate provider state. Every draft is evaluated over all raw rows, independent of chart and Rows filters. Header counts are a partition: valid + missing + failed = total. “Converted,” rounding flags, and alternate meanings are overlapping review categories and must not be summed as additional partitions.

Provide a compact audit with raw value, parsed value, display preview, reason/flags, and source-record access. Raw values show quoted text and distinguish spaces; parsed values use enough digits/scientific notation to distinguish a subnormal from zero. Display cells may round according to `precision`, but that cannot conceal the parsed-value column.

The summary sample is deterministic and representative: include at least one example per failure reason, each transformation/rounding flag, alternate successful value, native-number case, and missing reason before filling remaining space. Show the sample limit. Every count opens an exact paged/virtualized row list; no “first eight rows” limit determines truth or hides later failures.

Alternate meanings evaluate other supported presets using the same mode/accounting options. Consider only records valid under the selected recipe; deduplicate alternative scalar values and show presets producing each value. `1,234` can mean 1234 or 1.234. A high success rate is not proof of intended meaning. Never switch presets automatically or parse each record under whichever succeeds.

Use `rawEpoch + rowIndex` as an exact ephemeral reference within the current raw snapshot; show stable `id` values when supplied as ordinary record fields. Do not infer a durable business key from their spelling. Any preview reference becomes stale when raw rows change.

Apply shows the exact failure count and impending filter removals, then commits once. Failures become undefined with retained reasons; they do not block an informed Apply. Cancel discards the draft. Reset restores the settings present when the edit opened. “Remove numeric preparation” explicitly clears the recipe and returns to the documented baseline behavior; it is distinct from Reset and needs its own preview before Apply.

Use the shared nonmodal popover/field panel patterns. Keep actions reachable while the audit scrolls. At 390 px, controls retain compact label/control rows where possible and the audit can scroll horizontally inside the panel. Focus reaches every control and count; Enter activates explicit actions, Escape closes the nested audit before the inspector and discards unapplied edits, and focus returns to the triggering control. Never rely on hover alone or native `title` tooltips.

### 2.3 Atomic Apply and downstream state

Build an interpretation-impact helper, proposed `src/lib/fieldInterpretationImpact.ts`. Use parsed calculation dependencies to find the edited field's transitive calculated outputs. Clear value-dependent predicates on this closure in `chart.filters`, `chart.localFilters`, workspace filters, and Rows filters; preserve unrelated predicates. Clear facet visible IDs whose categories depend on a changed field. Inspect chart-specific saved selections in the checkout and apply the same distinction: selections encoded as old numeric values/bins clear; pure record identity remains meaningful while row correspondence is unchanged.

Preserve chart layout, labels, definitions, display settings, and authored axis bounds. Recompute values, profiles, calculations, aggregate results, marks, sorting, and filter membership. Existing out-of-range indicators explain values outside retained bounds. Do not translate an old bound by guessing how the old and new conventions relate.

Commit recipe, predicate invalidation, runtime rebuild, and caches as one saved-state change. The existing `holdStateChanges` facility can group intermediate sets; the fingerprint subscriber must emit one callback after Apply and zero after Cancel. Restoring an undo snapshot restores its recipe and predicates against the **current raw dataset**, not an obsolete external source version.

Add a narrow, synchronous preflight for text-backed field edits rather than optimistic Apply followed by an externally visible rollback. A proposed internal provider hook is `preflightFieldSettingsCommit(candidate: SavedDataStructure): {ok:true} | {ok:false; message:string}`. A notebook/shared-text host computes its candidate text and compile/representability check before the provider mutates. It may retain the validated text keyed by candidate fingerprint for the ensuing single callback. If preflight fails, there is no store edit, callback, or history entry. This hook validates representability only; it must not write files or become a general approval system. Preserve the actual host's existing transaction facility if one already provides this guarantee.

### 2.4 Saved JSON, text, folder, and notebook

`saveToStructure` already contains field settings. Validate new settings explicitly in `saveDataUtils.isFieldSettings`; malformed objects cannot pass merely because unknown keys were historically tolerated. Add one `'-0'` member to `SavedSpecialValue` and existing stringify/parse/validation allowlists. Detect `Object.is(value, -0)` before ordinary finite serialization. Existing NaN/infinity/undefined tags remain the lossless raw codec. `saveAnalysisToStructure` continues saving original raw rows plus settings.

Define flattened Dashboard tokens, for example `number.preset=dot-comma number.mode=number number.accounting=false`, alongside `as=num`. Parse the entire numeric recipe atomically before assigning field settings; a partially valid recipe cannot silently fall back. Export required members canonically and roundtrip without omissions. An absent recipe produces no `number.*` tokens. Recipe settings are invalid on calculated field definitions.

Preserve actual compiler precedence: aliases are processed first in document order; exact native-field declarations are applied afterward in their own order. `field <alias>` is not the same as `field <native-name>`. Stage recognized numeric keys per native field across that established precedence, then validate the effective recipe once before row conversion. Unknown keys, wrong types, or incomplete recipes are critical configuration errors. Valid recipes with rejected rows produce audit outcomes, not a blocking configuration error. The existing `complete` flag is false for any diagnostic, so callers must distinguish critical configuration errors from permitted row-failure warnings instead of blindly using `!complete` to disable Apply.

Dashboard multi-view definitions may be shared. Before claiming independent per-view interpretations, inspect `exportViews` and its compiler composition. M1 policy is explicit: a single shared field declaration has one interpretation. If views in a combined export have conflicting recipes for the same field and the format cannot represent them faithfully, **reject that combined export with the field/view names**; do not choose one or silently discard another. Separate settings/analysis files remain available. Verify actual values after export/recompile.

Before a combined text export, compare the semantic tuple for every shared field: explicit type, recipe including absence, and null tokens (with current case/whitespace semantics). A recipe in one view and its absence in another is also a conflict. Preflight conflicts at a text-backed host's Apply boundary; refuse or atomically revert the view-local edit with the field/view names rather than silently propagating it to every view. An explicit shared-field Dashboard text edit applies to all views by the existing document semantics.

Folder workspace preparation belongs to analysis/view text; `analysisFileText` and `readAnalysisText` should carry it through existing bridges. **Verified trap:** `writeFolder.ts::analysisFileText` currently destructures only `{text}` from `exportAnalysisText`, discarding `omitted`. Introduce a typed blocking export result and propagate it before any affected write; preserve dirty state and allow separate `.eda` documents or saved JSON. Re-read candidate text with `readAnalysisText` using each view's own query data, since the current exporter begins with the first view's rows. Source CSV/JSON files and project relationship declarations stay untouched. Include a source-byte comparison in the folder fixture.

For notebooks, implement field writeback before promising durable Apply:

1. Extract shared field-token serialization from `export.ts`.
2. Diff canonical prior/next field settings. Locate matching alias declarations by their native field and exact `field <native>` declarations through parsed spans.
3. Remove each changed numeric/type/null-token key from every contributing declaration, then write its desired canonical value once. Prefer the last valid exact-field declaration, then a valid alias owner, otherwise insert a new field declaration in an appropriate valid `eda` block. This prevents an older duplicate override resurfacing after Reset/removal.
4. Preserve expected-type annotations separately from conversion, plus all unrelated tokens, prose, comments, fences, and headings.
5. Recompile candidate text, require requested field settings and unchanged unrelated settings, then commit. If a broken/frozen owning block cannot be edited safely, return an explicit unsupported result and atomically revert the Apply; do not silently leave an unsaved recipe on screen.

All notebook sheets share one provider and definitions. A recipe applied from one sheet updates the others. Extend writeback results to identify fields as well as charts, and test host text echoes so they do not close editors or trigger redundant rebuilds.

### 2.5 Refresh lifecycle

Add `refreshData` alongside existing reset-oriented `setData`. A new `data` array on the same mounted provider is a refresh using current applied settings. An explicit import/`setData` or remount starts a new dataset. Do not guess source identity from filename, schema similarity, or content.

Refresh snapshots applied settings, rebuilds them over new **raw** rows, updates profiles/calculations/diagnostics, and retains interpretation. If new explicit `savedData` accompanies new rows, those supplied settings win. Existing controlled-host echoes are compared canonically and skipped when equal. An absent or newly omitted `savedData` prop is not a reset instruction under this proposed refresh contract; use explicit `setData`/import or a new provider identity to reset. Document and test this behavior change so a host does not accidentally depend on omission clearing applied work.

Use current `store.rawData` as the correspondence basis when retaining current store settings; `savedRowsRef` instead describes rows associated with an externally received settings snapshot. Preserve value/range predicates under an unchanged recipe and recompute membership. Clear positional `__ID` selections if stable remapping cannot be proven. Inspect the unsupplied `carryRowSelections.ts` before relying on it. Project stable source keys are separate and must never fall back to a new record at an old ordinal.

Keep recipes for missing fields as inactive settings with an explicit missing-field diagnostic; never bind them by a similar display label. Update `settingsCompatibility.ts` to recognize settings-only field dependencies. A returning field with the same exact field identity resumes its recipe; Apply cannot target a currently absent field. Schema incompatibility is visible rather than a silent recipe deletion.

Extend `DslCompileOptions` with a bounded known-field/schema context where needed: baseline `compile.ts` builds `sourceSet` only from current row profiles and otherwise rejects an absent `field` declaration. `readAnalysisText` should pass the evaluated query's field identities even when it has zero rows, and notebook/export round trips should carry current saved/declared native field identities. Retain valid numeric recipes for these identities as inactive with a missing-field diagnostic and no fabricated runtime column. For standalone text without external schema, a complete valid numeric `field <native-name>` declaration is itself a retained exact-name binding; it remains inactive and visibly unavailable until that field exists. Newly authored unknown names receive the same explicit unavailable diagnostic, never a success claim or fuzzy binding. Keep shape errors and calculated-field conflicts fatal. If an export cannot preserve an inactive binding, block it instead of dropping settings.

Required sequence: remove amountRaw from every row→refresh→save text/folder/notebook→reopen→restore the same field in new raw rows. The recipe, inactive status, and eventual numeric output must survive. Add an empty-first-query/multiple-view case so first-view row inference cannot erase another view's known fields.

If rows refresh during a draft, invalidate old audit references and recompute the draft over the new epoch. Disable Apply until that evaluation matches the current draft and epoch. Background work may cancel; obsolete responses must never replace newer counts.

### 2.6 M1 tests, docs, example, and release check

Required tests include shared parser vectors in section 5; M1 amount expectations for all 34 rows; all-row audit hidden-failure coverage; same numeric type with changed convention; null-token commas; calculation invalidation; exact predicate clearing; Cancel/Reset; one Apply callback; host echo; undo/redo; raw codec roundtrip; Dashboard tokens; conflicting multi-view export rejection; folder save/reopen; notebook alias/duplicate/no-owner/frozen-owner cases; and repeated data refresh.

Docs: expand `apps/demo/src/docs/pages/fields.mdx` with the explicit preparation workflow and link to a new `numeric-preparation.mdx` page; update `load-data.mdx` with refresh versus new import and raw retention; update `calculated-fields.mdx` with prepared inputs and derived-output limits. Register the new page in the actual docs catalogue/targets.

Runnable example: add `numeric-preparation` to `apps/demo/src/demos/examples.ts`, using the amount fixture, a calculation, summary/Rows views, a chart, and a filter hiding later failures. Register coverage in `apps/demo/src/demos/coverage.ts` and scripted live steps in `apps/demo/src/docs/live/examples.ts`. Include a small folder fixture and a two-sheet notebook accessible from this example. Tests must execute the user flow and reopen the saved result.

Preserve fixture types faithfully: the current docs live-example `data` path is documented as CSV, which cannot establish the required native-number-versus-text distinction by itself. Use the existing typed project `tables` form for the runnable demo or deliberately extend the actual example loader to support a typed/saved-analysis fixture. Inspect the loader before claiming support. Keep NaN/Infinity/undefined/−0 in a TypeScript fixture or supported saved-analysis encoding, not invalid JSON literals. A quoted CSV numeric token is not proof it remains text after import. `LiveStep` lacks fill/Escape/refresh/reload actions; add a focused Playwright flow for those interactions rather than claiming click-only docs scripts verify them.

NP-10 prototype: test the real inspector at 1280, 783, and 390 px with 34 rows and a generated large column. Measure draft scan time, first useful audit rendering, and cancellation. Keep full counts; choose chunked/worker evaluation only if measured blocking requires it. This prototype selects execution scheduling and layout, not grammar or whether to build.

M1 is complete only when an analyst can inspect N28's late failure, Apply, refresh twice, save/reopen, and receive the same result/reason through every supported settings path. Include a minor changeset for the new public feature and refresh behavior. Main risk: an apparently successful Apply that is lost or changes meaning at a lifecycle boundary.

## 3. M2 — Percent, accounting, and additional conventions

Extend the preset registry with `dot-space` and `indian-dot`, permit `mode: "percent"`, and permit `accounting: true`. Reuse every M1 parser, audit, Apply, persistence, and refresh path; do not add a separate percent conversion callback.

Percent text requires exactly one terminal ASCII `%`, directly adjacent to the magnitude/exponent and inside any accounting parentheses. `"12%"` stores 0.12; bare text `"12"` fails `missing-percent`; native 12 remains 12. Number mode rejects `%`. `"12 %"` fails `invalid-syntax`; `"12%%"` fails `invalid-percent`. Permille and fullwidth percent fail. Do not infer a bare-number percent-points mode.

Accounting accepts one outer pair of parentheses with no interior sign or adjacent interior spaces: `"(1,234.50)"` → −1234.5; `"(12%)"` → −0.12 in percent mode. With accounting disabled, any parenthesis produces `accounting-disabled`. With accounting enabled, an inner sign, unmatched/nested/misplaced parentheses, empty contents, or padding immediately inside the pair produces `invalid-syntax`. Thus `"(-12)"`, `"(+12)"`, `"(12)%"`, and `"( 12%)"` fail syntax; `"(12)"` in percent mode reaches `missing-percent`.

Add compact Number/Percent input controls and an Accounting checkbox with clear examples/tooltips. Display percent stays a separate setting. Changing input mode does not silently change display style; the example can deliberately select both. Show native-number cases prominently so `12` displaying as `1,200.00%` is visible before Apply. Percent scale is a property of parsing text, not a repeated transform on runtime values.

Concrete modules: M1 parser/representation/registry, `fieldSettings` validation, inspector controls, DSL enum validation, canonical serialization, and corresponding tests. Add rate-field settings to the fixture and run every M1 persistence path with percent/accounting enabled. Keep exact scalar and reason parity in the notebook writer and raw codec.

Docs: extend `numeric-preparation.mdx` with percent input versus display percent, native numbers, accounting, space code points, and Indian grouping; update fields/load-data cross-links as needed. Runnable example: a `numeric-preparation-percent` variation using the same 34-record table with both amount and rate; register it in examples, coverage, and live steps. Show raw/native `12`, `"12%"`, and `"0.12%"` together, then refresh through R1/R2.

Acceptance: all rate counts/IDs in section 4; parentheses vectors; single-rounding edge `"5e-322%"` → `Number.MIN_VALUE`; prepared negative-zero normalization; no repeated scaling on R2 repeats; export/reopen produces the same numbers/flags. Verify UI at all three widths and keyboard access to mode/accounting controls. Main risk: applying text scaling to native or previously prepared numbers.

## 4. Canonical 34-record fixture and refresh sequence

This is one table with `id`, `region`, `amountRaw`, and `rateRaw`. Odd IDs are North; even IDs South. `id` is stable business identity for assertions, never a row-position key. Quoted entries below are strings; unquoted entries are native JavaScript values. Use actual Unicode code points for escaped spaces in fixture source. Missing and failure results both have runtime value `undefined`, with distinct diagnostics.

M1 applies only amount settings. M2 applies both:

```ts
const fieldSettings = {
  amountRaw: {
    type: "numeric",
    numericInput: { preset: "dot-comma", mode: "number", accounting: false },
    nullTokens: ["NA", "-"],
    format: "number",
    precision: 2,
  },
  rateRaw: {
    type: "numeric",
    numericInput: { preset: "dot-comma", mode: "percent", accounting: false },
    nullTokens: ["NA", "-"],
    format: "percent",
    precision: 2,
  },
};
```

| ID | Raw amount → expected amount | Raw rate → expected rate |
|---|---|---|
| N01 | `12` → 12 | `"12%"` → 0.12; binary-rounded |
| N02 | `"12"` → 12 | `0.12` → 0.12; native unchanged |
| N03 | `"1,234"` → 1234; alternate 1.234 | `12` → 12; native unchanged |
| N04 | `"1.234"` → 1.234; binary-rounded; alternate 1234 | `"12"` → failed: missing-percent |
| N05 | `"1,234.50"` → 1234.5 | `"0.12"` → failed: missing-percent |
| N06 | `"1.234,50"` → failed: invalid-grouping | `"0.12%"` → 0.0012; binary-rounded |
| N07 | `"12,34,567.89"` → failed: invalid-grouping | `"1,200%"` → 12 |
| N08 | `"1 234,50"` → failed: unsupported-character | `"(12%)"` → failed: accounting-disabled |
| N09 | `"1\u00a0234,50"` → failed: unsupported-character | `"NA"` → missing: null-token |
| N10 | `"1\u202f234,50"` → failed: unsupported-character | `null` → missing |
| N11 | `"(1,234.50)"` → failed: accounting-disabled | `"1e-400%"` → failed: underflow-to-zero |
| N12 | `"12%"` → failed: unexpected-percent | `"5e-322%"` → Number.MIN_VALUE; binary-rounded; subnormal |
| N13 | `"0012"` → 12; leading-zeros-removed | `"0%"` → +0 |
| N14 | `"9007199254740993"` → failed: unsafe-integer | `"-0%"` → +0; negative-zero-normalized |
| N15 | `"1e309"` → failed: overflow | `"12 %"` → failed: invalid-syntax |
| N16 | `"1e-400"` → failed: underflow-to-zero | `"12%%"` → failed: invalid-percent |
| N17 | `NaN` → failed: non-finite | `null` → missing |
| N18 | `Infinity` → failed: non-finite | `null` → missing |
| N19 | `"NaN"` → failed: non-finite | `null` → missing |
| N20 | `"Infinity"` → failed: non-finite | `null` → missing |
| N21 | `-0` → +0; negative-zero-normalized | `null` → missing |
| N22 | `"-0"` → +0; negative-zero-normalized | `null` → missing |
| N23 | `true` → failed: boolean-not-numeric | `null` → missing |
| N24 | `null` → missing | `null` → missing |
| N25 | `undefined` → missing | `null` → missing |
| N26 | `" "` → missing: blank | `null` → missing |
| N27 | `"NA"` → missing: null-token | `null` → missing |
| N28 | `"bad"` → failed: invalid-syntax | `null` → missing |
| N29 | `"0.1"` → 0.1; binary-rounded | `null` → missing |
| N30 | `".5"` → 0.5 | `null` → missing |
| N31 | `"5e-324"` → Number.MIN_VALUE; binary-rounded; subnormal | `null` → missing |
| N32 | `"0.123456789012345678901"` → failed: precision-limit | `null` → missing |
| N33 | `9007199254740992` → unchanged; native-precision-unknown | `null` → missing |
| N34 | `1e20` → unchanged; native-precision-unknown | `null` → missing |

Exact partitions:

| Population | Amount valid / missing / failed | Rate valid / missing / failed |
|---|---:|---:|
| All 34 | 13 / 4 / 17 | 8 / 20 / 6 |
| North 17 | 8 / 2 / 7 | 4 / 10 / 3 |
| South 17 | 5 / 2 / 10 | 4 / 10 / 3 |

Preview remains all 34 when chart or Rows filters select North. Amount valid IDs are `N01,N02,N03,N04,N05,N13,N21,N22,N29,N30,N31,N33,N34`; missing IDs are `N24,N25,N26,N27`. Rate valid IDs are `N01,N02,N03,N06,N07,N12,N13,N14`; failed IDs are `N04,N05,N08,N11,N15,N16`.

Binary-rounded amount IDs are `N04,N29,N31`; rate IDs `N01,N06,N12`. Negative-zero-normalized amount IDs are `N21,N22`; rate `N14`. Alternative meanings are amount N03/N04. “Converted” defined as successful scalar changed by `Object.is(raw, prepared)` equals amount 10/rate 6; it is not the same as changed from a prior applied recipe.

Display checks: N01 rate stores 0.12 and displays `12.00%`; N03 stores native 12 and displays `1,200.00%`; N06 stores 0.0012 and displays `0.12%`. Alter display precision without changing any stored result or diagnostic.

Refresh versions:

```ts
const R1 = [
  ...[...R0].reverse(),
  { id: "N35", region: "North", amountRaw: "broken", rateRaw: "broken" },
];
const R2 = R0.map((row) =>
  row.id === "N03"
    ? { ...row, amountRaw: "2,345.00", rateRaw: "25%" }
    : { ...row },
);
```

- R1: amount 13/4/18, rate 8/20/7. N35 fails amount `invalid-syntax` and rate `missing-percent`; original IDs retain their results despite reordering. N16 underflow moves from ordinal 16 to 19 but remains N16.
- R2: counts return to R0, N03 amount=2345 and rate=0.25, both exact; N35 disappears from all audit lists. Settings remain unchanged.
- Repeat fresh copies of R2 twice and save/reopen: N03 rate stays 0.25, never 0.0025; diagnostics stay identical; raw strings and native distinctions survive.
- Undo an interpretation change after R2: recompute the restored recipe over current R2. Do not restore R0 source data unless the user explicitly restores a full analysis containing those rows.

Supported saved-analysis roundtrip must preserve raw N17 NaN, N18 Infinity, N21 −0, N25 undefined, and every source string. Use the existing codec with the new `'-0'` tag, not generic `JSON.stringify` as a lossless-row claim.

## 5. Additional exact parser and interaction checks

### 5.1 Convention matrix

`F` means reject selected syntax. All use number mode/accounting false.

| Input | Required outcomes |
|---|---|
| `1,234` | dot-plain F; comma-plain/comma-dot/comma-space 1.234; dot-comma/indian-dot 1234; dot-space F |
| `1.234` | dot-plain/dot-comma/dot-space/indian-dot 1.234; comma-dot 1234; comma-plain/comma-space F |
| `1,234.50` | dot-comma/indian-dot 1234.5; all others F |
| `1.234,50` | comma-dot 1234.5; all others F |
| `12,34,567.89` | indian-dot 1234567.89; all others F |
| `1 234,50`, NBSP equivalent, narrow-NBSP equivalent | comma-space 1234.5; all others F |
| `1 234.50`, NBSP equivalent, narrow-NBSP equivalent | dot-space 1234.5; all others F |
| `1234`, `0012` | Every preset 1234/12; the latter flags leading-zero removal |

### 5.2 Boundary vectors

| Vector | Exact expected result |
|---|---|
| `"9007199254740991"` | valid 9007199254740991 |
| `"9007199254740992"`, `"9007199254740993.0"`, `"9.007199254740993e15"`, `"1e20"` | failed unsafe-integer |
| `"9007199254740991.5"` | failed unsafe-integer because binary64 result is unsafe integer |
| `"9007199254740991.1"` | valid 9007199254740991; binary-rounded |
| `"4503599627370496.5"` | valid 4503599627370496; binary-rounded, ties-to-even |
| `"4503599627370497.5"` | valid 4503599627370498; binary-rounded, ties-to-even |
| `"1e309"` | failed overflow, before unsafe-range classification |
| `"1e-324"`, `"1e-400"` | failed underflow-to-zero |
| `"5e-324"` | Number.MIN_VALUE; binary-rounded and subnormal |
| `"2.4e-324"` / `"2.5e-324"` | underflow-to-zero / valid Number.MIN_VALUE with binary-rounded and subnormal |
| `"0e-400"` | valid +0; no underflow flag |
| `"0e99999"` / `"-0e99999"` | valid +0 / valid +0 with negative-zero-normalized |
| `"0.12345678901234567890"` | valid 0.12345678901234568; binary-rounded; 19 significant digits after trailing-zero normalization |
| `"0.123456789012345678901"` | failed precision-limit |
| `"0".repeat(4096)` | valid +0; length exactly permitted, no nonzero significant digits |
| `"0".repeat(4097)` | failed input-too-long |
| `"1e" + "9".repeat(4094)` | failed overflow with bounded exponent work |
| `"0e" + "9".repeat(4094)` | valid +0 with bounded exponent work |
| A configured null token of 4097 code units that matches the source | missing: null-token; token precedence intentionally precedes the numeric length bound |
| `"1.0000000000000000000000"` | valid 1; one significant digit after normalization |
| A 21-significant-digit mantissa followed by `e9999` | precision-limit precedes overflow |
| `"1e"`, `"1e+"` | failed invalid-exponent |
| `"1."`, `"+ 1"`, `"1-"`, `"--1"`, `"1_000"`, `"0x10"` | failed invalid-syntax |
| `"١٢"`, `"１２"`, `"−12"` | failed unsupported-character |
| `"$1,234.50"`, `"1234USD"`, `"12kg"` | failed invalid-syntax |
| `"1234 USD"`, `"12 kg"` under dot-comma | failed unsupported-character; internal whitespace is rejected before the remaining mantissa syntax |
| `"1  234,50"`, `"1\t234,50"` under comma-space | failed invalid-grouping/unsupported-character respectively |
| `"1\u00a0234\u202f567,89"` under comma-space | failed invalid-grouping: mixed grouping-space characters |
| `" NA "`, native 12 with token `"12"`, native true with token `"true"` | missing by explicit token; token matching precedes type checks |
| `"na"` with only token `"NA"` | failed invalid-syntax |
| native ±Infinity/NaN, signed Infinity/NaN text | failed non-finite unless an exact configured token matched |
| `"1,234e2"` | dot-comma 123400; comma-dot 123.4 with binary-rounded |
| `"(1,234.50)"`, accounting true | −1234.5 |
| `"(12%)"`, percent/accounting true | −0.12; binary-rounded |
| `"(-12)"`, `"(+12)"`, `"((12))"`, `"(12)%"`, accounting enabled | failed invalid-syntax |
| `"1e309%"` | exact scaling yields 1e307, then failed unsafe-integer; do not report intermediate overflow |
| `"9007199254740993%"` | valid 90071992547409.94; binary-rounded; integer guard is applied after scaling |
| `"1e311%"` / `"1e-322%"` | overflow / underflow-to-zero after exact scaling |
| `"(0)"`, accounting enabled | valid +0; negative-zero-normalized |

Freeze precise reason names in tests before UI copy. Reasons remain machine-stable while display copy can explain them. For ambiguous syntax where more than one rejection rule applies, follow the stated precedence rather than whichever regex happens to run first.

### 5.3 Cross-layer acceptance table

| Check | Acceptance |
|---|---|
| Draft and filters | Editing draft changes no charts, callbacks, saved settings, or filter memberships; preview still scans full raw scope |
| Apply parity | Every preview row's status/value/reason equals committed conversion for that epoch/recipe |
| Derived calculation | `double = amountRaw * 2` yields N03=2468 in R0 and 4690 in R2; failed/missing inputs remain unavailable, with actual engine propagation checked |
| Same-type recipe change | dot-comma→comma-dot changes N03 1234→1.234 even though type stays numeric; all caches update |
| Predicate closure | Direct amount and dependent-double predicates clear in all four owners; independent region predicate remains |
| History | One Apply callback/checkpoint; exact echo no rebuild; Cancel zero; undo/redo restores recipe and invalidated predicates atomically |
| Narrow layout | At 1280/783/390 px no primary action is unreachable; raw/parsed/display distinctions survive; keyboard drilldown and focus return work |
| Notebook | Two sheets share the recipe; duplicate definitions do not resurrect old input settings; source text plus results reopen identically |
| Refresh | R0→R1→R2→R2 copies retains settings, re-evaluates once, clears unprovable positional selections, and drops obsolete diagnostics |
| Exports | Full analysis keeps raw+recipe; prepared row/CSV exports use runtime values where the existing export contract promises them; formats are explicitly labeled |
| Inactive field text | Field disappearance→save/reopen while absent→field return preserves the recipe by exact identity, including an empty first query; no synthetic column is created |

Inspect the actual row/CSV exporters during implementation; their code was not supplied. Do not claim their current semantics from the saved-analysis path. Add only the tests needed to establish the chosen raw-versus-prepared export boundary.

The new audit export must include every selected audit record, not just the visible page, with source revision, field, canonical recipe, row locator, raw type, lossless raw representation, prepared Number or missing value, status/reason, and flags. Reuse the supported special-value encoding or an explicitly typed textual raw cell representation so native NaN/Infinity/undefined/−0 are not collapsed by generic JSON. Provide one all-record export and let the audit's status filter request a clearly labeled subset. This is independent of chart filters. Test the last failed row and Unicode spaces in the exported audit.

## 6. M3 — Explicit project-query preparation

Add a bounded `AnalysisStep` variant in `src/types/AnalysisProject.ts`:

```ts
type PrepareNumberStep = {
  id: string;
  kind: "prepare-number";
  inputStepId: string;
  inputFieldId: string;
  fieldId: string;
  label: string;
  numericInput: NumericInput;
  nullTokens?: string[];
};
```

The step creates a **new** measurement field. Reusing an existing field ID fails collision validation. It retains original input fields, raw source tables, row keys, source references, and contributor identities. Its output field has origin `{stepId}` and numeric type. Its conversion statuses refer to the input row key and new output field. It never becomes a relationship endpoint automatically, and it does not rewrite source keys.

Update `src/lib/analysis/evaluateProject.ts`: validate the input field, invoke the shared converter once per input row, add the output value/diagnostic, retain row count and identity, and expose conversion counts separately from rows excluded by filters. Extend the diagnostic type with a numeric-preparation code and structured reason. Retain each conversion outcome by row key and output field through later stages; aggregate contributor traces must resolve the original preparation reason rather than explaining every failed `undefined` value as generic missing. The query's explicit order decides whether preparation happens before filter, calculate, or aggregate.

Update actual project text compiler/exporter, validators, query editor and stage inspector after locating them from the existing imports. `folder.ts` names `src/lib/dsl/project` and its `compileProjectText` export; inspect that entry and the exporter used by `writeFolder.ts`. Add a `prepare-number` declaration that roundtrips all recipe members and null tokens. The source packet includes their callers, not those implementations; the worker must inspect them before patching. Use the existing query-step declaration conventions for IDs/input/output fields, and the same `number.preset`, `number.mode`, and `number.accounting` option names for this step. Do not invent an independent scalar grammar. Add a compact stage editor using the same controls/audit components and field pickers, with raw input and proposed output visible.

`analysisWorkerProtocol.ts` already sends project definitions and invokes the same evaluator. The new step is serializable within that project object; avoid transferring callbacks or executable grammars. `useAnalysisEvaluation.ts` already discards obsolete responses and keeps the last completed result while pending. Verify these properties with recipe changes and source refresh; the pending UI must identify the shown result as the last completed evaluation rather than the draft recipe.

Exact M3 source is `orders`, with `entityKey:"id"` and declared string fields `id`, `code`, and `amount`. Its three rows are:

```ts
const orders = [
  { id: "A", code: "0012", amount: "1,234.50" },
  { id: "B", code: "0013", amount: "bad" },
  { id: "C", code: "0014", amount: "2,000.00" },
];

const steps = [
  { id: "source", kind: "source", sourceId: "orders" },
  {
    id: "prepared", kind: "prepare-number", inputStepId: "source",
    inputFieldId: "orders.amount", fieldId: "amountNum", label: "Amount",
    numericInput: { preset: "dot-comma", mode: "number", accounting: false },
    nullTokens: ["NA", "-"],
  },
  {
    id: "large", kind: "filter", inputStepId: "prepared",
    fieldId: "amountNum", operator: "gt", value: 1500,
  },
  {
    id: "double", kind: "calculate", inputStepId: "large",
    fieldId: "double", label: "Double", expression: "amountNum * 2",
  },
];
```

Source→prepare-number produces `amountNum=[1234.5,undefined,2000]`, row count 3, valid=2/missing=0/failed=1, and stage excludedCount=0. The prepared rows retain source row keys `orders:string:A`, `orders:string:B`, and `orders:string:C`. The following filter yields only C, excluding A and B; the final calculation yields C=4000. Sum at the prepared stage is 3234.5; sum after filtering is 2000. B's exclusion remains attributable to `invalid-syntax` in the preparation evidence, rather than ordinary source missingness.

Source IDs, code strings, and raw amount strings remain unchanged. In a separate relationship fixture add a `codes` source with numeric `code:12` and a relationship from `orders.code` to `codes.code`. The lookup must still have no match for string `"0012"`; amount preparation does not rewrite this endpoint. Referencing `amountNum` as a relationship endpoint is not enabled by this milestone.

Test main-thread and worker results, diagnostics, contributors, and ordering for equality. Change the recipe while a prior worker request is pending and assert only the latest completion commits. Refresh sources and verify a new evaluation revision. Save/reopen project folder and notebook views using the new query, with unchanged source bytes and identical downstream values.

Add focused suites `src/lib/analysis/numericPreparation.test.ts`, `src/lib/analysis/numericPreparationWorker.test.ts`, and `src/lib/dsl/projectNumericPreparation.test.ts` (proposed new filenames). They cover the A/B/C stage values, reasons, relationship non-effect, field collision, missing input field, synchronous/worker equality, late responses, and text/folder round trips.

Docs: add `apps/demo/src/docs/pages/numeric-preparation.mdx#query-preparation` and cross-link the project's actual query documentation after locating it. Explain workspace output conversion versus upstream query preparation with the A/B/C example. Runnable example: a small folder-backed `numeric-preparation-query` project with the A/B/C fixture, source trace, filter, calculation, aggregate, and a notebook sheet; register it in demo examples/coverage/live steps. Main risk is broadening measurement preparation into implicit source or join-key mutation; reject that boundary expansion.

## 7. Verification run sheet and delivery gates

Use the checkout's pinned tools and shared timeouts. The exact new test filenames below are proposed; existing names come from the supplied packet. Run focused tests during implementation, then the required broad gate once. Do not run package builds concurrently from multiple worktrees.

```bash
# Shared parser and workspace integration, during M1/M2.
pnpm --filter exploreda exec vitest run src/lib/valueParsing.test.ts src/lib/fieldSettings.test.ts src/lib/numericInput.test.ts src/lib/numericRepresentation.test.ts
pnpm --filter exploreda exec vitest run src/test/providers/fieldSettingsProvider.test.tsx src/components/SummaryTable/components/FieldInspector.test.tsx

# Persistence and notebook/project paths; add the named new tests with the feature.
pnpm --filter exploreda exec vitest run src/lib/dsl/export.test.ts src/lib/notebook/fieldWriteBack.test.ts src/lib/project/numericPreparationRoundtrip.test.ts
pnpm --filter exploreda check-types

# M3, when its query capability is implemented.
pnpm --filter exploreda exec vitest run src/lib/analysis/numericPreparation.test.ts src/lib/analysis/numericPreparationWorker.test.ts src/lib/dsl/projectNumericPreparation.test.ts

# Demo registration and Dashboard roundtrip are separate coverage.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Build before demo type/Docs browser validation when public types change.
pnpm --filter exploreda build
pnpm --filter demo build
pnpm --filter demo docs:verify

# Real input and screenshots at the repository's required widths.
pnpm shot /examples/numeric-preparation --name numeric-preparation

# Once per delivery, after targeted acceptance is satisfied.
pnpm check
```

M3 additionally runs focused evaluator/worker/query-text tests using the exact existing suite paths discovered in the checkout. Each feature milestone includes its docs, executable example, relevant tests, changeset, and screenshots in the same change. `AGENTS.md` requires the package changeset and screenshots for visible work; do not substitute a report-only delivery for the feature.

## 8. Evidence, boundaries, and remaining build questions

Checked during research: complete attached baseline files; source paths and symbols described in the report; direct Node v24.22.1 probes of unchanged `parseNumber`/`isExactNumberText`; independently counted fixture partitions; exact rational comparisons confirming decimal/binary differences for selected values. These probes did not implement the proposed parser.

Proposed, not executed: every new parser expectation, provider mutation, lifecycle guarantee, UI interaction, codec extension, folder/notebook roundtrip, refresh behavior, and M3 worker result. The worker must run the acceptance gates before reporting them shipped.

Implementation inspection questions are bounded and do not reopen the selected design: where public exports live; how current chart-specific selections and `carryRowSelections` map identity; how `exportViews` represents shared field definitions; where project DSL/query editing is implemented; and which row exports promise raw versus prepared values. Resolve those in code before patching their paths. Reject a lossy shared-text export, clear unprovable positional selections, and retain current source data whenever evidence does not support a stronger operation.

The report's staged capability is the build decision. No outside-demand gate, arbitrary custom grammar platform, precision-library rewrite, automatic locale detection, or join-key preparation is required to ship it.
