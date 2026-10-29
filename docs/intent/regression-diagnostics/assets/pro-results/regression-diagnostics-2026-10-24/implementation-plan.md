# Implementation plan: diagnostics from one held fit

**Baseline:** `95832bd473884aeae23453af0888b4ca5187820d` · **Mode:** Design · **Date:** 24 October 2026.

Implement four independently useful releases: **M1 inspect**, **M2 compare**, **M3 diagnose distribution/order/influence**, **M4 save and export**. Keep React, TypeScript, pnpm, the existing estimators, and the existing trace shell. Recommendation IDs are stable and defined in [report.md](report.md). This document specifies work for Codex; none of the feature code, tests, or browser checks below has been executed.

## 1. Startable seams and ownership

Path abbreviations: **SP** = `packages/explorEDA/src/components/charts/ScatterPlot/`; **TR** = `packages/explorEDA/src/components/charts/trace/`; **LIB** = `packages/explorEDA/src/`. Existing integration seams in this table were read at the pinned commit. Files marked **new** are proposed; later docs/test infrastructure paths also follow the inspected agent guide.

| Existing seam | Planned change |
|---|---|
| `SP/ScatterPlot.tsx::ScatterPoints`, `SP/useScatterFits.ts` | Register a narrow, private diagnostics capture capability for each rendered facet. Pass the already available semantic `facetKey`; preserve the current fit cache. |
| `SP/fitPlan.ts::{ScatterFit,groupScatterRows,planScatterFits}` | Reuse exact fit IDs/contributors. Capture eligible/excluded IDs from the same group/facet frame without fitting again. |
| `SP/FitTraceBody.tsx::FitDetails`, `SP/FitLabels.tsx` | Add Diagnostics inside a valid fit trace; retain Alt-Enter and header entry. An unavailable fit exposes its reason. |
| `TR/{traceTypes.ts,ChartTraceScope.tsx}` | Add a separate held-session branch/API, and gather diagnostic fit targets across all registered facet sources. Keep ordinary trace invalidation unchanged. |
| `LIB/components/charts/ChartTraceControl.tsx`, `TR/ChartTracePanel.tsx` | Add diagnostic mode: wider responsive surface, explicit Close, independent held state, and no dismissal when interacting with peer charts. |
| `LIB/components/PlotChartPanel.tsx::ChartTraceInspector` | Pass the active mode and combined close action; provide the enclosing details-dialog container for the popover. |
| `LIB/providers/DataLayerProvider.tsx`, `LIB/lib/valueParsing.ts` | Consume existing global nonce, snapshot reads, field access, `finiteNumber`, and date helpers. No new data/revision service. |

### Small private model

Place the capture/derived-data types in **new `SP/fitDiagnostics.ts`** and the session reducer/hook in **new `SP/useFitDiagnostics.ts`**. This is an implementation sketch, not a public API:

```ts
type FitTarget = Readonly<{
  chartId: string;
  facetKey?: string;
  fitId: string; // Existing fit:overall or fit:group:<category key>.
}>;

type DiagnosticRow = Readonly<{
  sourceId: IdType;
  sourceOrder: number;
  x: number;
  y: number;
  fitted: number | undefined;
  residual: number | undefined;
  unavailableReason?: string;
}>;

type HeldFit = Readonly<{
  target: FitTarget;
  sourceNonce: number;
  model: RegressionFit; // Retained predictor; never reconstructed from text.
  xField: string;
  yField: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string; // Only when declared; do not infer units from names.
  eligibleIds: readonly IdType[];
  fittedIds: readonly IdType[];
  exclusions: readonly {
    sourceId: IdType;
    reason: "invalid-x" | "invalid-y";
  }[];
  rows: readonly DiagnosticRow[];
  scopeDescription: readonly string[];
}>;

type DiagnosticSession = {
  reference: HeldFit;
  status: "current" | "scope-changed" | "source-invalid";
  selectedIds: ReadonlySet<IdType>;
  view: "residual-fitted" | "residual-x"; // Extend in M3.
};
```

The capture capability must synchronously obtain the model, column values, semantic target, eligibility, and nonce from one planning frame. Check that the source still exists and its generation is current before opening. Store copies of numeric diagnostic values and provenance; do not retain a function that later reads current X/Y. Source details may read raw/prepared fields and calculation steps only after verifying the captured nonce. Full raw rows do not need to be copied into every session.

Alongside this sketch, retain a private input descriptor containing method/options, color field and categorical/pooled mode, facet field definitions, and applicable filter descriptors/owners. Compare these structured values; `scopeDescription` is display text and cannot serve as semantic identity.

Open/close/selection/sort/view/comparison drafts stay outside `ChartSettings`, `saveToStructure()`, and `onStateChange`. The panel-owned `ChartTraceScope` hosts this separate state; closing the normal trace must not erase the held session accidentally. Prefer a small optional diagnostics capability on internal `TraceSource` over a general model registry.

### Required transitions

- **Open/switch target:** capture the explicitly chosen valid fit; clear S and comparison results. A group/facet selector uses semantic keys, not the transient source owner or display label.
- **Select/view/sort/own brush/axis presentation:** preserve reference values and F. Diagnostic selection is local; no `updateChart`, `setWorkspaceFilter`, or reuse of `ScatterPoints.selectPoint`.
- **Source update notification:** compare exact eligible/fitted IDs, applicable scope descriptors, and semantic model inputs. Do not use `fitInputKey`’s hash as equality. Use focused subscriptions; do not subscribe every chart hook to the entire charts array.
- **Peer/workspace/local-scope or model change:** retain the held model, mark changed scope, offer Recompute. Changes to excluded rows still count as scope changes.
- **Any global nonce change:** mark source-invalid, clear S, disable source lookup/highlighting, comparison/apply/export. The notice names data **or field configuration** because nonce is broader than raw data.
- **Recompute:** replace all captured values atomically from the current explicitly identified target; clear S/results. A disappeared group/facet stays unavailable. Never substitute another fit or pass `facetIds=[]` to imply the missing facet.
- **Facet paging/unmount:** preserve the held reference. The chooser lists rendered facets on the current page; reach other facets through the existing pager. Recompute/Apply waits for the captured semantic facet to register again. An off-page target is not a removed target, and unregistering its live trace source must not dispose of the held session.
- **Close/chart deletion/type replacement:** dispose of the session and return focus. Undo/restore invalidates through the existing nonce; no persistent selection mapping is promised.

## 2. M1 — complete held residual inspection

**Recommendations:** RD-001–RD-004, RD-015. **User result:** choose a fit, find suspicious residuals, inspect exact source records, and return without changing the analysis.

**Files**

- Add `SP/fitDiagnostics.ts`, `SP/useFitDiagnostics.ts`, and `SP/FitDiagnosticsWorkspace.tsx`.
- Modify the existing seams in section 1, including `SP/FitTraceBody.tsx`, `SP/useScatterFits.ts`, `SP/ScatterPlot.tsx`, `TR/traceTypes.ts`, `TR/ChartTraceScope.tsx`, `TR/ChartTracePanel.tsx`, `ChartTraceControl.tsx`, and `PlotChartPanel.tsx`.
- Add `SP/fitDiagnostics.test.ts`, `SP/useFitDiagnostics.test.tsx`, and `SP/FitDiagnosticsWorkspace.test.tsx`; extend existing `SP/regression.test.ts` and `SP/scatterPlan.test.ts` only where integration coverage is needed.
- Document local diagnostic selection in `docs/ui-defaults.md` and `CODING_STANDARDS.md`, preserving existing dashboard chart-click rules.

**Behavior and acceptance**

- Residual-versus-fitted and residual-versus-X share one held vector, linear diagnostic axes, and a zero line. Changing view cannot refit or select different records.
- Header shows fit/facet/group/fields, fitted n, X-first exclusions, selected count, and current/changed/invalid status. Original-chart visibility is distinct from fit membership.
- Clicking a residual, rectangle selection, or row checkbox changes only S. A coincidence picker lists every record at the hit location. Empty plot space clears S. Table All/Selected is local display state.
- One record row contains source ID, captured X/Y/prediction/residual. Its detail view resolves original fields and calculation steps by ID **without intersecting current chart filters**. Reuse presentation pieces such as `ChartTraceRowSteps`, not the live `findScatterTraceRow` visibility resolver.
- Extend header fit browsing across facets. Keep one active fit at a time; changing target discards previous selection explicitly.
- Pass F01–F06 and F07 raw-value assertions. F01’s positive-residual rectangle selects exactly IDs `[0,4]`; `saveToStructure()` remains identical. F06 must retain IDs invisible under log/bounds, distinguish coincident IDs 2/3, hold six pooled rows after a peer filter, and recompute to the correct four.
- A non-finite prediction/residual remains a row with an unavailable reason. Do not drop it from F; diagnostic aggregate error/scale statistics become unavailable if the complete vector is not finite.
- Source replacement with the same runtime ID list disables old row actions before any new record can be shown. Label-only field updates may also invalidate, intentionally.

**Performance bounds — proposed acceptance budgets, not measurements**

- Compute diagnostics only for the opened fit. Opening reuses its predictor and never reruns `fitRegression`.
- Support up to **50,000 fitted rows** initially. Above that, show the explicit limit and let the analyst narrow source scope; never silently sample the fit or diagnostic table.
- Linear/polynomial evaluation costs O(np), p≤7. Existing direct LOESS at n≤500 costs O(nk) to evaluate all rows; larger fits use their existing O(1)-per-row interpolator. Storage is O(n).
- Draw all supported rows on Canvas; keep the table paged at **100 rows**, with total/selected counts and sorting over the full snapshot. No tens-of-thousands of DOM marks.
- Target opening 10,000 linear/polynomial diagnostics within **150 ms p95** on the project’s recorded browser/hardware; selection feedback within **100 ms p95**. Measure these during implementation. If work must be chunked, keep each chunk under 8 ms and discard results from invalidated sessions.

**Docs and runnable example in this same release**

- Add `/docs/scatter` sections **Diagnose a fit**, **Fitted rows and diagnostic selection**, and **When filters change** in `apps/demo/src/docs/pages/scatter.mdx`.
- Add deterministic fixture data at `apps/demo/public/datasets/regression-diagnostics.csv` and a focused dashboard module **new `apps/demo/src/demos/scatterDiagnostics.ts`**. Use named cases from Appendix A with `case`, `recordKey`, X, Y, group/facet/order fields as needed. `recordKey="F02:0"` is a readable fixture label; runtime IDs remain actual source IDs.
- Register `/examples/scatter-diagnostics` in `apps/demo/src/demos/examples.ts`; default to F02’s five-row curvature case with a linear fit, plus a peer filter and source table. Keep fixture cases isolated by explicit case scope.
- Add `scatter-diagnostics` to `apps/demo/src/docs/live/examples.ts`, focusing its embedded preview to one source chart so header actions are unambiguous. Script entry, exact residual text, selection, and row access; exercise peer changes in the full example.
- Update `apps/demo/src/docs/catalogue.ts` and `apps/demo/src/demos/coverage.ts` as required by the established docs/example gates. Do not add a new registered chart type.

**Browser proof:** at 1280/783/390, complete entry → X switch → exact selection → source row → peer filter → held count → Recompute → Close/focus return. Repeat from chart details and with touch controls. See section 6.

**Main risk:** confusing inspector-local selection with workspace filtering. Ship visible selection scope and the unchanged-reference tests with the first UI.

## 3. M2 — bounded sensitivity on fixed rows

**Recommendations:** RD-005–RD-006; respect RD-011/RD-013. **User result:** judge dependence on nearby settings or a deliberately omitted record.

**Files:** add **`SP/fitSensitivity.ts`** and **`SP/FitSensitivity.tsx`**, with `fitSensitivity.test.ts`; extend `FitDiagnosticsWorkspace.tsx`, `useFitDiagnostics.ts`, and existing `RegressionSettings.tsx` integration for the explicit apply action. Reuse `regression.ts::fitRegression` unchanged.

**Behavior and acceptance**

- Maximum **baseline plus two candidates**. A linear reference or selected-omission candidate consumes one slot. Never rank candidates by R² or automatically replace the baseline.
- Candidate specs use existing ranges: polynomial degree 2–6; LOESS span 0.2–1. Suggest adjacent degrees or span±0.10, clamp/deduplicate at boundaries; degree 2’s lower alternative is linear. A linear baseline initially suggests degree 2.
- Every ordinary candidate trains on the identical ordered F. Display actual LOESS neighbor count; if nearby spans yield identical effective neighborhoods, show their identical result honestly.
- One selected-omission scenario is supported for **linear/polynomial OLS**: train on F−S; retain evaluation rows F and a `usedForTraining` flag. Selection changes mark that scenario dirty; run it again explicitly. Insufficient rank/rows produces unavailable, without additional automatic exclusions.
- Compare one active candidate with the baseline on matched scales. Show per-row `candidatePrediction − baselinePrediction`. Overlay curves only within shared observed X support; default delta summaries use original-F rows in that support and state their count. Outside-support OLS table values are tagged extrapolated. Do not turn a LOESS edge clamp into an extrapolation claim.
- Label training RMS/SSE and original-F evaluation RMS/SSE separately; do not compare quantities with different denominators as one score. F04 must produce training SSE 0, original-F SSE 144, and the exact deltas below.
- LOESS span comparisons keep the same rows and the same direct/interpolated policy. **Do not ship LOESS selected-row omission in M2**: reduced n can cross the 500-row threshold and change both statistical inputs and numerical evaluation. That later capability requires an explicit common-evaluator contract.
- Apply an ordinary candidate only if the current chart fields, partition, scope, generation, and regression method/degree/span still match the held reference. Label the action **Apply to chart — all groups and facets**: `ScatterRegressionSettings` is shared, so every group/facet adopts the setting and refits on its own rows. One `updateChart` must produce that shared change and one undo step while the held single-fit reference remains unchanged until Recompute. Omission scenarios have no Apply/delete action.
- F02 line versus degree 2, F04 omission, and F07/F08 LOESS comparisons are exact numerical acceptance fixtures. Selection and all comparison actions except Apply leave saved state unchanged.

**Performance:** compute at most two candidates on explicit Run; cache by held-session identity plus canonical spec/omission IDs, never recompute on hover. Initial comparison cap **10,000 rows**, stated independently of M1’s inspection cap. OLS is O(np²); LOESS is O(n log n + nk) for direct small groups or approximately O(n log n + 201k + n) for the interpolated branch. Target two-candidate completion within **1 second p95** at the cap and no main-thread task over 100 ms. If the measured task budget fails, move the same bounded calculations to one dedicated worker; no service or replacement solver. A stale job cannot publish into a new session.

**Docs/example:** add **Compare nearby fits** and **Compare without selected records** to `/docs/scatter`; add `/examples/scatter-fit-sensitivity` and live example `scatter-fit-sensitivity` using F02, F04, and F08. Extend the same deterministic fixture/dashboard module and coverage entries. The narrative asks whether structure and predictions change, not which score wins.

**Browser proof:** all three widths must support choosing two alternatives, changing the active candidate, inspecting an excluded row, seeing an extrapolation label, and applying/undoing one non-exclusion candidate.

**Main risk:** mistaking changed training membership/support for a better fit. Explicit row roles, support counts, and separately labeled errors are release requirements.

## 4. M3 — order, distribution, and OLS influence

**Recommendations:** RD-007–RD-008; respect RD-013–RD-014. **User result:** inspect drift/spread/tails and distinguish unusual responses from influential predictor locations.

**Files:** add **`SP/olsDiagnostics.ts`** and `olsDiagnostics.test.ts`; extend `fitDiagnostics.ts`, its tests, `FitDiagnosticsWorkspace.tsx`, and source-row columns. In `SP/regression.ts`, retain the small upper-triangular R from the existing `solveLeastSquares` result for polynomial diagnostic geometry. Keep the existing standardized design, coefficient solution, pivot criterion, and predictor unchanged. Add QR/leverage assertions to `regression.test.ts`.

**Mathematical acceptance**

- For a line, `hᵢ=1/n+(xᵢ−meanX)²/Sxx`. For a polynomial design row a in the existing standardized basis, solve `Rᵀz=a`; then `hᵢ=Σz²`. This costs O(np²), p≤7, without an n×n hat matrix or normal-equation inverse.
- Compute SSE from the same captured residual vector. Define `s²=SSE/(n−p)` only if n>p; residual RMS is `sqrt(SSE/n)` and is a different quantity.
- Internal standardization: `rᵢ=eᵢ/[s sqrt(1−hᵢ)]`. Cook: `Dᵢ=eᵢ² hᵢ/[p s²(1−hᵢ)²]`. Deleted prediction residual: `eᵢ/(1−hᵢ)`, provided deletion preserves rank. Do not label these externally studentized residuals. [Report P3/P5/P8/P9]
- Adopt explicit numerical guards: clamp h to [0,1] only for excursions within `1e−12`; larger excursions are unavailable. For division use `1−h > 1e−12`. If residual RMS ≤ `64 × Number.EPSILON × max(|Y|,|ŷ|)`, or that scale is zero, label normalized statistics **residual scale unresolved**. Keep raw residuals unchanged; this is a numerical guard, not a statistical threshold. Perfect-fit F02 must not amplify QR roundoff into large standardized residuals. Deleted residuals need no positive s when their own denominator is valid.
- F01 verifies all standardized values and Cook distances; F02 verifies polynomial leverage and perfect-fit guards; F04 verifies leverage `87/97`, Cook `261/20`, and deleted residual 12. F05 verifies translation/unit consistency. F10 covers degrees of freedom, rank, and leverage one.
- Cook values are descriptive, with no pass/fail threshold, automatic deletion, p-value, or confidence/prediction interval. Provide a link to the M2 omission scenario to inspect a consequence.
- OLS standardization's equal-variance interpretation assumes an adequate mean model and constant error variance. A raw Q–Q tail pattern may also reflect changing spread; inspect spread and mean structure before interpreting it as an error-distribution feature.
- LOESS does not receive OLS h, standardized residuals, Cook, or n−p variance. Its smoother geometry differs. [Report P11]

**Views and record identity**

- **Order:** choose a numeric/date field parsed with existing helpers, ascending then captured source order. Missing order values stay in the table and count as omitted from this plot. Offer Source order explicitly, labeled “Source order, not time.” Table sorting does not alter it. Use points; no fabricated temporal line through missing/tied values.
- **Q–Q:** raw residuals by default for all methods, optional internally standardized OLS values. Sort the chosen values, then source order for ties. For m defined values use `qᵢ=Φ⁻¹((i−0.5)/m)` and retain the corresponding source ID. Require at least three defined values for the view; name the reason otherwise. Use a quartile reference line with type-7 interpolation: position `(m−1)p`, linearly interpolate adjacent sorted values at p=.25/.75. Omit the line if its slope is zero/unresolved. No confidence band or normality badge. [Report P12–P13]
- Implement one small private inverse-normal routine with documented approximation/attribution and F09 golden values, or reuse a suitable existing numeric helper if present. No statistics package is required. Verify the intended probability range down to `0.5/50000` with absolute quantile error ≤1e−8 against an independent trusted reference during implementation.
- **Spread:** show `abs(e)` in Y units; optional OLS scale-location uses `sqrt(abs(r))` and a dimensionless label. **Influence:** standardized residual versus h, with sortable h/D/deleted-residual columns; individual points retain source IDs.
- Influence always uses internal standardization; entering it sets the displayed scale to standardized and disables the raw-scale choice for that view. Saving that view canonicalizes its scale to standardized. LOESS influence remains unavailable; no silent raw substitute.
- A view with undefined coordinates reports m of n; F remains unchanged. Selecting from Q–Q must open the original record, not its rank number. All-zero residuals remain visible as raw values.

**Performance:** O(n log n) for order/Q–Q, O(np²) for OLS geometry. Cache on held fit and view settings; no all-row refit loop. Keep M1’s 50,000-row display cap, 100-row table pages, and full membership. Measure geometry and sorting before raising caps.

**Docs/example:** add **Read residual patterns**, **Order and distribution**, and **Leverage is not influence** to `/docs/scatter`; register `/examples/scatter-diagnostic-patterns` and its live example using F03, F04, and F09. Include the F04 modest-residual/high-influence lesson, plus LOESS’s unavailable standardized controls with a clear method explanation.

**Browser proof:** at all widths, switch order/Q–Q/influence, select a tied Q–Q point, reach its exact source row, read an unavailable statistic, and retain selection across view switches. The plot scale must not change when only S changes.

**Main risk:** overclaiming statistical meaning or normalizing a nearly zero residual scale. Formula-specific undefined states and golden fixtures are required in this release.

## 5. M4 — saved recipe and reusable static results

**Recommendations:** RD-009–RD-010; retain RD-012. **User result:** reopen the diagnostic setup and carry interpretable values/predictors elsewhere.

**Files:** extend `SP/definition.ts::ScatterPlotSettings`; add `isScatterDiagnosticSettings` in `LIB/utils/saveDataUtils.ts`; add `diagnostics` to `LIB/lib/dsl/settingKeys.ts::CHART_SETTING_KEYS.scatter`. Use existing `compile.ts::applyPath`, `normalize.ts::normalizeChart`, `export.ts::exportParts`, and `paths.ts::{setPath,diffPaths}`; add round-trip tests alongside the current DSL/save tests. Add **`SP/diagnosticExport.ts`** and `diagnosticExport.test.ts`. Extend the diagnostic UI for explicit Save/Export/Copy.

**Recipe**

```ts
type DiagnosticComparisonSpec =
  | { method: "linear" }
  | { method: "polynomial"; degree: 2 | 3 | 4 | 5 | 6 }
  | { method: "loess"; span: number };

interface ScatterDiagnosticSettings {
  view?: "residual-fitted" | "residual-x" | "residual-order"
    | "qq" | "spread" | "influence";
  residualScale?: "raw" | "standardized";
  orderField?: string;
  preferredTarget?: { facetKey?: string; fitId: string };
  comparisons?: DiagnosticComparisonSpec[]; // Maximum two; ordered.
}
```

Leave `diagnostics` absent from defaults. Opening without a recipe uses raw residual-versus-fitted; opening a fit explicitly takes precedence over a saved preferred target. A missing saved target/order field or unsupported standardized view is unavailable, never silently remapped. Save no row IDs, omissions, results, model closures, open state, or captured source generation. A saved recipe means recompute from current data on explicit opening.

Validate enums, nonempty field/target strings, candidate count, integer degrees 2–6, and finite spans 0.2–1. Canonicalize duplicate candidates when saving. Do not rely on the current validator’s tolerance of unknown extra properties. Existing nested object/indexed-array Dashboard text paths suffice; no new declaration or formula language is needed.

**Export/copy contract**

- CSV includes `sourceId`, readable key if supplied, X, observed Y, fitted Y, residual, selection/training role, and computed diagnostic columns with explicit unavailable reasons. Repeat the fields/units, fit/facet identity, method/settings, captured generation, original fitted count, and exported count needed to interpret a detached CSV. Never identify runtime source IDs as durable business keys.
- Snapshot JSON holds the same rows plus structured scope, exclusions, predictor descriptor where available, approximation mode, and export time. Export all F by default; selected-only is explicit. Exports never generate workspace fields/charts. Source-invalid sessions cannot export refreshed records under old results.
- Linear/polynomial Copy predictor emits actual `FitBasis` origin/scale/ascending coefficients, raw field/unit labels and observed range, with shortest round-trip decimal serialization. Evaluate by Horner on `(x−origin)/scale`. Verify copied predictions with F05 and the polynomial transform below. Keep readable rounded equation copying separately named; LOESS offers no equation/predictor-basis copy.
- Save/apply each uses one `updateChart`; transient operations never write saved state. Continuous saved edits must coalesce with `holdStateChanges`/`useChartEdit`. A selected-omission candidate is temporary and cannot be saved as a recipe; the UI states that restriction.

**Acceptance:** validate all supported recipes and reject degree 1/7, span outside .2–1, unknown views and three candidates. Export→compile preserves candidate order, arrays as arrays, field aliases, quoted fit/facet keys, and missing-vs-present recipe semantics. `diagnostics=unset` clears it. Old saves remain absent. Save creates one undo step; undo/restore invalidates an open held reference. Exported IDs/counts/values match F/S exactly and unavailable values are not misleading zeros. Copied F05 predictions meet the stated tolerance.

**Docs/example:** add **Keep diagnostic settings**, **Export diagnostic rows**, and **Copy a predictor** to `/docs/scatter`, updating applicable setting descriptions in the existing docs reference. Add `/examples/scatter-diagnostics-saved` and its live example using F05 and a saved recipe. Prove close/reopen, save/undo/restore, Dashboard text round-trip, and parsed CSV/JSON values together.

**Browser proof:** all widths support Save/Copy/Export and one undo step. Confirm exported content directly; a toast or screenshot alone does not prove it. No mobile horizontal page overflow.

**Main risk:** confusing a recipe with a historical fitted model. State that reopening uses current data and keep generation-bound selections/results out of saves.

## 6. Verification and shipping run sheet

The source checkout’s package manager is pnpm 11.9.0; use the repo’s Node 24/check configuration. Run targeted checks during work and `pnpm check` once for each completed broad milestone before its PR. These are commands for Codex after implementation, not commands run in this design mission.

```bash
# From the pinned checkout/worktree, after the milestone's feature files exist.
pnpm install
pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot/fitDiagnostics.test.ts src/components/charts/ScatterPlot/useFitDiagnostics.test.tsx src/components/charts/ScatterPlot/FitDiagnosticsWorkspace.test.tsx
pnpm --filter exploreda check-types

# Add only the later milestone's relevant tests as it ships.
# M2: fitSensitivity.test.ts; M3: olsDiagnostics.test.ts and regression.test.ts.
# M4: diagnosticExport.test.ts plus the affected existing save/DSL tests.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Start this checkout's source-backed demo; use the printed URL.
pnpm dev:agent

# Exercise the complete flows below with real pointer, keyboard, and touch input.
# Capture the new stable diagnostics selector after opening the header route.
# 'diag-reference' is the proposed chart ID in the new example dashboard.
pnpm shot /examples/scatter-diagnostics --name scatter-diagnostics --click '[data-chart-panel="diag-reference"] button[aria-label="Trace chart objects"]' --click '[data-action="open-fit-diagnostics"]'

# Broad required gate, once per completed milestone; no parallel package builds.
pnpm check
pnpm --filter demo docs:verify -g '/docs/scatter$'

# Each user-visible library feature PR needs its own concise minor changeset.
# Run after its scope is settled; this is not a release or deployment command.
pnpm changeset:add minor "Inspect fitted relationships and their exact source records."
pnpm dev:agent --stop
```

Make the proposed `data-action="open-fit-diagnostics"` available on the valid fit target in the header picker, as well as the action inside its trace, so the run sheet has an unambiguous entry. Put screenshots under `tmp/`; follow `AGENTS.md` for PR attachments. Timeouts come from `@repo/test-config`. Do not build the library merely to see source changes in the demo; the broad check handles the required build.

| Viewport | Required interaction proof |
|---|---|
| **1280×900** | Read plot and record information together; change a peer filter while diagnostics stays open; see held and current scope; recompute; close with focus restored. |
| **783×900** | Plot/Rows tabs remain readable; fit/facet selectors and all primary actions fit; contained scrolling and nested-dialog focus work. |
| **390×844** | Enter through persistent touch-accessible header controls, select exact rows without Alt/hover/drag, reach Close/Recompute/Export, and avoid page-wide overflow. |

At every width also prove: keyboard-only entry; roving diagnostic-point or table navigation with visible focus; Space to toggle a row; keyboard-accessible coincidence list; nested Escape closes the innermost editor before the workspace/details; no background scroll lock for the nonmodal inspector; dialog scroll locking when inside details; long field/group names; nulls; no valid fit; vanished facet; repeated X; active own/peer filters; light/dark border tokens. Mark editor controls `data-export="omit"`. Real input and inspected values establish behavior; screenshots establish layout only.

## Appendix A — exact fixture catalogue

Each fixture is isolated. IDs are zero-based and ordered exactly as listed; no record is deduplicated. Unless stated otherwise all listed rows are eligible and fitted, and selection begins empty. Assertions on IDs, counts, reasons, and view membership are exact. Rational expressions below are exact arithmetic oracles; implementations use binary64.

**Tolerances:** F01–F05 predictions/residuals/SSE absolute `1e−10`; leverage `1e−12`; Cook’s D `1e−10`. F06 small linear values `1e−12`. LOESS values `1e−9`, threshold line `1e−8`; normal quantiles `1e−8`. These are fixture-specific tolerances, not universal accuracy guarantees. Keep raw values separate from formatted text.

### F01 — symmetric noisy line

```text
id       [ 0,  1,  2,  3,  4]
x        [-2, -1,  0,  1,  2]
y        [-2, -2,  1,  2,  6]
yHat     [-3, -1,  1,  3,  5]
e        [ 1, -1,  0, -1,  1]
```

Linear predictor `1+2x`; SSE=4, s²=4/3, R²=10/11. Leverage `[3/5,3/10,1/5,3/10,3/5]`; standardized residuals `[√(15/8),−√(15/14),0,−√(15/14),√(15/8)]`; Cook `[45/32,45/196,0,45/196,45/32]`. A rectangle covering fitted X `[−4,6]` and residual `[0.5,1.5]` selects `[0,4]`; model/F remain identical.

### F02 — missed curvature and nonlinear predictor

```text
id             [ 0,  1,  2,  3,  4]
x              [-2, -1,  0,  1,  2]
y              [ 4,  1,  0,  1,  4]
linearYHat     [ 2,  2,  2,  2,  2]
linearE        [ 2, -1, -2, -1,  2]
quadraticYHat  [ 4,  1,  0,  1,  4]
quadraticE     [ 0,  0,  0,  0,  0]
```

Linear SSE=14; degree-two predictor x² has SSE=0. Quadratic leverage `[31/35,13/35,17/35,13/35,31/35]`; internal standardization/Cook unavailable because residual scale is zero. Deleted residuals are zero where h<1. The fitted-axis baseline plot has one X coordinate; the residual-X view must retain all five distinct X positions.

Polynomial translation check: let `T=2³⁰+x/1024`, `Z=32+1.8y`. The degree-two predictor is `32+1.8[1024(T−2³⁰)]²`; predictions `[39.2,33.8,32,33.8,39.2]`, residuals zero, same leverage. Use the standardized basis and `predict`; tolerate `1e−9` for this polynomial variant.

### F03 — changing spread, duplicate X

```text
id     [ 0, 1, 2, 3, 4,  5, 6,  7]
x      [ 0, 0, 1, 1, 2,  2, 3,  3]
y      [ 1, 3, 3, 7, 5, 11, 7, 15]
yHat   [ 2, 2, 5, 5, 8,  8,11, 11]
e      [-1, 1,-2, 2,-3,  3,-4,  4]
```

Predictor `2+3x`; SSE=60, s²=10, R²=3/5. Leverage is 7/20 for IDs 0,1,6,7 and 3/20 for 2–5. Selecting ID 6 must not select ID 7 simply because their X values match. The absolute-residual view has paired heights 1,2,3,4.

### F04 — influential last record and deliberate omission

```text
id       [0,1,2,3,4]
x        [0,1,2,3,8]
y        [0,1,2,3,20]
yHat     [-204,49,302,555,1820] / 97
e        [204,48,-108,-264,120] / 97
```

Predictor `(-204+253x)/97`; SSE=1440/97, s²=480/97. ID 4 has h=87/97, Cook=261/20, deleted residual=12. ID 3 has the largest absolute raw residual, so residual sorting must not be described as influence ranking.

Omit ID 4 explicitly: training IDs `[0,1,2,3]`; evaluation IDs `[0,1,2,3,4]`; candidate prediction `[0,1,2,3,8]`; candidate residual `[0,0,0,0,12]`; candidate-minus-baseline `[204,48,−108,−264,−1044]/97`. Training SSE=0, original-F SSE=144. Shared observed support is `[0,3]`; ID 4’s candidate prediction is marked extrapolated.

### F05 — translated coordinates and affine response units

From F01 use `T=1073741824+x/1024`, `Z=32+(9/5)y`.

```text
T     [1073741823.998046875,1073741823.9990234375,
       1073741824,1073741824.0009765625,1073741824.001953125]
Z     [28.4,28.4,33.8,35.6,42.8]
ZHat  [26.6,30.2,33.8,37.4,41.0]
eZ    [ 1.8,-1.8, 0.0,-1.8, 1.8]
```

Centered predictor `33.8+3686.4(T−1073741824)`; SSE=12.96, s²=4.32. F, leverage, internally standardized residuals, and Cook values are unchanged from F01. These X offsets are exactly representable. Copying/reconstructing the stable basis passes; ordinary expanded evaluation can give `26.599609375` at the first point and must not be used for diagnostics.

### F06 — membership, groups, facets, and visibility

Tuples are `(id, facet, group, x, y)`:

```text
(0,N,A,-1,-1) (1,N,A,0,1) (2,N,A,1,3) (3,N,A,1,3)
(4,N,A,null,5) (5,N,A,2,null) (6,N,A,null,null)
(7,N,B,0,10) (8,N,B,1,12)
(9,S,A,0,100) (10,S,A,1,102)
(11,N,C,null,1)
```

- **N/A:** E=`[0,1,2,3,4,5,6]`; F=`[0,1,2,3]`; invalid X IDs `[4,6]`, invalid Y `[5]`; counts 7 eligible, 4 fitted, 2 invalid X, 1 invalid Y. Predictor `1+2x`; predictions `[-1,1,3,3]`; residuals all zero.
- **N pooled:** E=`[0,1,2,3,4,5,6,7,8,11]`; F=`[0,1,2,3,7,8]`; invalid X=3, invalid Y=1. Predictor `37/10+(29/10)x`; predictions `[4/5,37/10,33/5,33/5,37/10,33/5]`; residuals `[-9/5,−27/10,−18/5,−18/5,63/10,27/5]`.
- **N/B:** F=`[7,8]`, predictor `10+2x`, residuals `[0,0]`; residual variance undefined because n=p=2. **S/A:** F=`[9,10]`, predictor `100+2x`, residuals `[0,0]`.
- **N/C:** eligible `[11]`, fitted `[]`, invalid X=1, unavailable fit. After a peer `Group=A` filter B/C disappear; a held B target cannot become A automatically.
- Hold N pooled, then peer-filter Group=A: held F remains six; Recompute gives four N/A rows. Own source-chart ID selection `[2]` changes neither fit nor diagnostic membership.
- Log X cannot draw N/A IDs 0/1; bounds `[0.5,1.5]` also hide them. Diagnostics still contains four rows. IDs 2/3 are separate despite coincident coordinates.
- Reorder/replace source rows and increment global nonce: even if IDs/counts match, old row actions are disabled. Removing selected facet N never captures all rows through an empty facet array.

### F07 — LOESS complete line

IDs `0..7`, X=`[0,1,2,3,4,5,6,7]`, Y=`[1,3,5,7,9,11,13,15]`. For spans .5/.75/1, neighbors are 5/6/8; every prediction equals Y, every residual is zero, and all eight IDs remain fitted. `interpolated=false`. LOESS residual RMS=0; OLS standardized/influence quantities remain unavailable by method.

### F08 — LOESS span on identical rows

IDs `0..7`, X=`[0,1,2,3,4,5,6,7]`, Y=`[0,1,4,9,16,25,36,49]`. Both candidates retain all eight training/evaluation IDs. Exact interior probes for IDs `[2,3,4,5]`:

- Span .5, k=5: predictions `[4,9,16,25]+343/599`; residuals all `−343/599`.
- Span .75, k=6: predictions `[4,9,16,25]+30008/22851`; residuals all `−30008/22851`.

These are independent tricube weighted-sum oracles for the stated interior points; endpoint values are not asserted by this fixture. F07 supplies a complete-array LOESS oracle. No external R default is assumed equivalent to this kernel/neighbor policy.

### F09 — stable order and Q–Q identity

Use F01 residuals. Raw Q–Q sorting returns IDs `[1,3,2,0,4]` and values `[-1,−1,0,1,1]`. Midpoint normal quantiles are:

```text
[-1.2815515655446008,-0.5244005127080407,0,
  0.5244005127080407, 1.2815515655446008]
```

The quartile reference line has intercept 0 and slope `1.482602218505602`. Selecting the second sorted point selects source ID 3. Add order values by source ID `[30,10,null,10,20]`: ordered plot IDs `[1,3,4,0]`, coordinates `[10,10,20,30]`, residuals `[−1,−1,1,1]`; ID 2 remains fitted/table-visible but has no order coordinate. Source-order mode restores `[0,1,2,3,4]`.

### F10 — explicit unavailable cases

| Inputs/method | Expected result |
|---|---|
| No valid pairs; or one pair with a linear fit | Existing unavailable fit; no fabricated diagnostic plot. |
| X `[0,1]`, Y `[1,3]`, line | Predictions `[1,3]`, residuals `[0,0]`, h `[1,1]`; residual variance, standardized/Cook/deleted residuals unavailable. |
| X `[0,1,2]`, Y `[5,5,5]`, line | Predictions all 5, residuals 0, R² undefined, h `[5/6,1/3,5/6]`; standardized/Cook unavailable; deleted residuals 0. |
| X `[−1,0,1]`, Y `[1,0,1]`, degree 2 | Exact interpolation; p=n=3, h all 1; no residual degrees of freedom or deletion diagnostics. |
| X `[1,1,1]`, Y `[1,2,3]`, line; or degree 2 with fewer than three distinct X | Existing unavailable rank/distinct-X reason; do not lower degree. |
| Seven valid pairs with LOESS; or eight pairs with only two distinct X | Existing minimum-row/distinct-X reason; no substitute line. |

### F11 — evaluator threshold, not smoothing sensitivity

For n=500 and n=501 independently, generate IDs/X `i=0..n−1`, Y=`1+2i`, span=.75. Full membership is exactly that sequence; predictions equal `1+2i`, residuals zero within `1e−8`. `interpolated` is false at 500 and true at 501, with the existing 201-vertex branch. This is a computational boundary check, not evidence that adding a row has no statistical effect on arbitrary data.

## Appendix B — evidence and handoff

**Access:** all 38 packet files were completely read before research; seven additional trace-shell/DSL integration files were completely read through connected GitHub at the exact commit. The full path inventory and primary bibliography are in [report.md](report.md#access-and-handoff). No necessary design source is missing. The uninspected internals of persistent-row-remapping helpers are deliberately not part of the proposed contract.

**Checked facts:** current fit algorithms/predictors, exact contributor IDs, current trace invalidation, nonce behavior, source-record access seams, and existing serialization mechanics. Exact rational fixture arithmetic and floating-point translation probes were independently checked.

**Proposals:** every new module/setting/view, numerical guard, capacity/latency budget, saved recipe, runnable example, test, and browser criterion above. They have not shipped or been validated in a running feature. Repository edits, commits, pushes, deployment, executable harnesses, and source archives were outside this mission and were not produced.

**Deliverables:** [report.md](report.md) · [implementation-plan.md](implementation-plan.md). The ZIP contains only these two Markdown documents.

**Open questions:** benchmark the explicit row/latency caps on the project’s normal hardware and decide whether a future export consumer needs a declared durable key. LOESS omission/common-evaluator design and generated analytical outputs remain separately scoped follow-ups, not prerequisites for M1–M4.
