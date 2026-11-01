# Build exact decimal measures and reconciliation

Add explicit decimal calculations over retained source text, then grouped results and saved notebook findings.
Use a JSON object with `kind: "decimal"`, a canonical integer `coefficient` string, and integer `scale`.
Use BigInt inside a small finite arithmetic module. Keep ordinary measurement calculations on their current path.

This is a reviewed proposal. Build means inclusion in this plan, not permission to ship.
[Original report, detailed plan, fixtures, and contracts](assets/pro-results/decimal-measures-methods-2026-11-01/ASSET_INDEX.md).
[Local evidence](../../research/decimal-measures-methods-2026-11-01/evidence.md).
[Recommendation dispositions](../../research/decimal-measures-methods-2026-11-01/decisions.md).

## Fixed numerical rules

- Opt in through saved calculation metadata `arithmetic: { kind: "decimal", version: 1 }`.
- Accept whole decimal text with optional exponent. Trim ASCII space, tab, CR, and LF at the ends only.
- Preserve original spelling separately. Preserve effective decimal scale; normalize coefficient sign and leading zeros.
- Bound input at 256 characters, exponent magnitude at 128, coefficient at 128 digits, scale at 38, scratch at 256 digits.
- Read raw cells through `valueParsing.ts`, which can delegate to `lib/decimal/`. Validate bounds before expansion or allocation.
- Refuse native Numbers as original decimal input. `exactInteger` explicitly adopts a currently safe integer with limited provenance.
- Preserve literal tokens before `parseFloat`. Compile literal scale/mode arguments as policy metadata, not amount operands.
- Support exact addition, subtraction, multiplication, comparison, sum, min/max, and terminating division.
- `/` refuses repeating quotients. `divide` requires output scale and mode; grouped average also requires them.
- Save half-even, half-away-from-zero, toward-zero, floor, ceiling, or unnecessary explicitly. Round with integer quotient/remainder.
- Display precision never rounds arithmetic. Line rounding and post-total rounding are distinct saved operations.
- Accumulate sums widely. Apply an explicit aggregate output policy before checking the public result limit.
- Numeric equality ignores trailing scale zeros; representation equality and original spelling remain separately inspectable.
- Missing, invalid, empty, conflict, partial, and genuine zero states remain distinct, with member IDs and reasons.
- Keep errors in existing manager/trace diagnostics or a small sidecar. Never infer missing status from an absent value alone.
- Exact predicates use decimals. An approximate chart coordinate cannot decide amount membership.

The [original numerical contract](assets/pro-results/decimal-measures-methods-2026-11-01/originals/report.md) defines grammar and operation details.
Its limits and rounding defaults are chosen product policies, not a financial compliance standard.
The owned arithmetic module is bounded by this operation set. Use a pinned library behind the same public shape if it grows disproportionate.
No decimal dependency is approved by this planning PR.

## M1 — complete standalone line checks

**Outcome:** import retained decimal source values, calculate invoice lines, inspect exact Rows and metric results, save, reopen, and refresh.

1. Add `lib/decimal/{types,parse,arithmetic,format,reduce}.ts` with strict guards and the fixed rules above.
   Extend the separate aliases in ChartTypes, FilterTypes, AnalysisProject, SavedDataStructure, calculations, and Crossfilter.
   Ordinary `finiteNumber` must refuse decimal objects. Add exact keys and bounded profiles; do not route them through Float64 statistics.
2. Add a saved `decimalInputs` reader recipe and `preserveTextFields` option before inference in ordinary delimited readers.
   Preserve Arrow/Parquet unscaled decimal values and declared scale before `typedColumns` converts them to Number.
   Carry a small typed-source descriptor through TableFile, host props, provider raw state, and full-analysis saves.
   Fresh rows replace their origin descriptors on refresh. Quoted JSON strings work; already parsed numeric tokens do not regain source digits.
3. Extend the existing parser, Calculator, CalculationManager, and provider reconstruction paths with exact mode and dependencies.
   `decimalSource(["Price text"])` reads an original source field before converted-column evaluation.
   Validate that intrinsic structurally. Derived fields and arbitrary expressions cannot act as original source access.
   Preserve Boolean guards, short-circuit evaluation, and causal errors. Resolve an evaluated error before treating another operand as missing.
4. Complete DataTable and Rows formatting, exact sorting, search, copy, CSV text, exact bounds, and valid/missing/invalid predicates.
   Use text bounds. Do not derive exact filters from numeric sliders or automatic numeric histograms.
   Reuse resolved calculated rows for CSV. CSV is a values-only export; native saves preserve formulas and meaning.
5. Extend shared row-grain reduction, metric plans, rendering, baselines, deltas, and traces.
   Support exact sum, average, min/max. Disable implicit shares until a quotient policy exists.
   Show valid-contributor subtotals with coverage; a partial exact amount cannot pass whole-population reconciliation.
   Pair row residual filters with counts and offending records. A zero residual sum does not establish line agreement.
6. Validate and round-trip exact values, source declarations, formulas, predicates, and output policies through native JSON and Dashboard text.
   Update parser allowlists, compiler, exporter, shared-view signatures, and all saved calculation projections.
   Reject unsupported or conflicting exports before callbacks or writes. Full-analysis saves keep raw evidence; settings-only saves require it again.
7. Add a separate retained-recipe refresh operation using current provider rebuilding and state holds.
   Preserve layout and valid exact predicates. Recalculate values, errors, profiles, and traces as one revision.
   **Local correction:** clear positional row selections on this decimal refresh. The current JSON-content helper is not a lossless identity proof.
   Keep ordinary reset/import semantics separate. A failed definition edit emits zero callbacks; a committed user edit emits one.

Refuse decimal grouping, once-per entity measures, Pivot, project execution, and notebook authoring/export until their stages support them.
Place checks at current entry points; no generic stage framework. Unsupported chart roles must explain the missing capability.

**Docs:** add `apps/demo/src/docs/pages/exact-decimals.mdx` and catalogue registration.
Update calculated-fields, data-table, metric-card, filters, trace, dashboard-text, export, and developers sections.
**Runnable example:** `decimal-line-reconciliation`, registered with coverage and live steps in the same milestone.
Show line-rounded versus total-rounded tax, source refusal, exact residuals, save/reopen, and refresh.

**Proof:** adapt D-P/I/A/R/D/C/W and row-grain D-G fixtures into repository tests.
Assert `0.1+0.2=0.3`, `1.20*2.0=2.400`, half-even `1.005→1.00`, `2.675→2.68`, both signs, and division rules.
Assert ten tenths preserve `1.0`, wide cancellation succeeds, and post-total quantization precedes public coefficient checks.
Check full source counts, state-filter memberships, exact sort/bounds above safe-integer range, trace values, and all supported saves.
Add explicit error-plus-missing permutations and reversed equal-value row order; the original corpus does not settle these integration cases.
Exercise the full user loop at 1280, 783, and 390 px, including callbacks and typed-source origin replacement.

**Main risk:** a reader or reconstruction silently turns an exact amount into a plausible ordinary number.
Do not call the arithmetic helper alone a completed milestone.

## M2 — grouped projects, entity measures, Pivot, and folders

**Outcome:** reconcile grouped invoices and joined measures, inspect exact contributors, save a portable folder, reopen, and refresh.

- Extend CalculateStep, project field types, typed parameter bindings, exact predicates, stage diagnostics, and reduction policies.
- In `evaluateProject`, read an incoming source projection through its field origin. Do not choose an arbitrary same-source reference after repeated lookups.
- Add decimal semantic keys and exact comparisons. Preserve source memberships and status sidecars through calculate/filter/group stages.
- Keep direct and worker values, bindings, errors, member sets, and revision identical. Rebuild source accessors inside the worker.
- Entity measures require every observed value to be valid and numerically equal. `1.0` and `1.00` agree; `2.00` and `2.01` conflict.
- Choose maximum agreeing scale and lexical-minimum occurrence ID as representative. Retain all occurrences, duplicates, exclusions, and conflicts.
- Conflicts or inconsistent availability make the authoritative measure unavailable. Diagnostic partial sums cannot pass reconciliation.
- Retain primitive typed entity keys. Reject decimal relationship or identity endpoints; measure equality is a separate rule.
- Adapt Pivot's independent reducer, controls, rendering, and saved validation. Recompute totals from original contributors and exact sum/count state.
- Pass source policies into the folder reader before `typedCell`. Save source origin, query rules, predicates, and bindings in project/analysis text.
- Check folder export omissions before writes. Materialized typed-source text must retain its narrow origin descriptor.

**Docs:** exact-decimals grouped/entity section, pivot, project-folders, dashboard-text, trace, and developers worker/source sections.
**Runnable example:** `decimal-invoice-groups`, with joined duplicates, a conflict, exact thresholds, Pivot, and folder reopen/refresh.
**Proof:** D-E001, D-L005 and D-GR cases; direct/worker equality; overlapping entity totals; typed binding and folder round-trips.
Eight source rows have six valid amounts, one missing and one invalid. Their valid subtotal is `28.685`, with incomplete source coverage.
A saved valid-only population can reconcile six active rows while retaining the two excluded source IDs.
Round the grand amount once to `28.68`; summing rounded group subtotals yields `28.69`.
**Main risk:** correct-looking totals over the wrong population or grain.

## M3 — exact notebook findings and saved checks

**Outcome:** retain exact findings, total checks, line checks, rules, and record links through notebook edits, reopening, and refresh.

- Share a resolved-column path across live and rest evaluation, including calculations, raw evidence, field settings, errors, and exact values.
- Carry typed bindings and exact finding policies through compileNotebook, readNotebook, findings, and folder consumers.
- `reconcile(leftFinding,rightFinding)` accepts complete exact additive sums from one evaluation, population, and grain.
  Compare memberships, not counts alone. Output Totals match or Totals differ with exact delta and operand traces.
- `rowPairCheck` compares corresponding existing line amounts. Lines match requires complete valid pairs and zero nonzero residuals.
  Residuals `+0.01` and `-0.01` allow Totals match while requiring Lines differ with both IDs.
- Construct and validate complete candidate notebook text before semantic callbacks. Extend targeted writeback for these definitions.
  Preserve unrelated prose and comments. An unsupported edit leaves text/state unchanged and emits zero callbacks.

**Docs:** notebooks, exact-decimals saved findings, and trace sections.
**Runnable example:** `decimal-ledger-notebook.eda.md`, including line/total rounding, incomplete inputs, filtering, and reopened findings.
**Proof:** calculated/query findings agree at rest/live; membership/revision mismatch refuses comparison; policies survive writeback and reopening.
**Main risk:** live values and saved definitions diverge.

## Explore and cut line

Optional M4 may adapt one bar and scatter projection after M1–M3. Keep exact values and IDs authoritative.
Disable continuous amount brushing until an exact membership design exists. Test neighboring large values with one binary64 coordinate.
Pair this work with exact-decimals/scatter/bar/scales-and-axes docs and `decimal-projection-collisions`.

Measure representative calculation, filter, grouping, worker transfer, trace memory, and bundle costs before optimizing.
Start with existing caches; no general arithmetic backend, identity, migration, transaction, or plugin framework.
Defer allocations, exchange rates, broad locale grammars, rational cells, and transcendental/statistical decimal methods.
The numeric, quantity, output-reuse, and refresh research plans are adjacent proposals, never required dependencies.

Use targeted Vitest tests and `pnpm --filter exploreda check-types` during implementation.
Run `pnpm check` once before each feature PR, add its minor changeset, and verify browser flows at all three widths.
The research PR changes documentation only. None of these feature acceptance gates has passed yet.
