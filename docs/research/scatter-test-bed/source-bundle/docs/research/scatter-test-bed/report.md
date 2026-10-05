# Scientific scatter test bed — implementation and validation report

**Status: implemented source; validation incomplete.** The numerical core and focused browser component checks passed. This submission is **not** certified as a passing repository build, live Vite route, or release. Use `validation.json` for machine-readable status and the companion result files for raw errors and timings.

## 1. Access, reproducible baseline and permissions

The inspected repository is [byronwall/explorEDA](https://github.com/byronwall/explorEDA). Review baseline: `94bfe0b325b9a19100def647e5555766a1f7eb9f`, merge of PR #109, “adoption-page-tickets.” Its UTC commit date is October 3, 2026, consistent with an October 2 local preparation date. The later inspected `main` was `226ffae632239150b54b55e9b346386e5e1e66d4`: 19 commits ahead, none behind. The comparison did not show changes under `packages/explorEDA/src/components/charts/ScatterPlot/`. Newer LandingPage work makes feature coverage development-only and adds integration-guide navigation; this submission uses small context patches rather than replacing that file.

The supplied Mac checkout `/Users/byronwall/.codex/worktrees/fd0d/explorEDA` is not mounted. Repository access is read-only through the GitHub connector. There is **no local repository checkout** here: checkout branch/detached state, local HEAD and `git status --short` are unavailable, not inferred from the prompt. No existing checkout was switched or modified.

Files were written to a separate source-bundle staging directory, `/mnt/data/scatter-source`, with the requested relative paths. No branch, worktree, commit, push, pull request, deployment, publication, package version, changelog or changeset was created. Package source and public saved-workspace settings are unchanged. The small changes to existing files are supplied in `integration.patch`; the downloadable full patch also includes every new source/report file.

`AGENTS.md` and the allowed scope were reviewed. The implementation uses React/TypeScript, local state, pure calculation functions, the existing public `ExplorEda` entry point and no statistical dependency, server, authentication, remote storage, GPU renderer or production Python runtime.

### Environment and the important fallback distinction

This environment can read connector source, write staging files, execute Node/Python and run Chromium. It cannot install the requested workspace: Node is **22.16.0**, not the required 24; pnpm is absent; external dependency downloads fail. Available TypeScript is **5.8.3**, not the repository's 5.4.5. NumPy 2.3.5 and SciPy 1.17.0 were available as independent numerical oracles.

Chromium 144.0.7559.96 rejects URL navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, including the local test URL. Consequently, no claim is made that Vite development routing, a fresh production bundle, or `/?view=scatter-lab` navigation passed here.

A useful narrower browser test was possible. GitHub Actions workflow run **37090860210**, associated with the exact baseline commit, supplied artifact **11262293455** (`github-pages`, ZIP SHA-256 `71c1ad594c2b405dc107568b1d730a8b32c943e9e1dd816c08bdc693ad124977`). Its built demo assets were loaded into an in-memory, network-free browser harness. For this test harness only, the final app mount was removed and the bundled public ExplorEda and Radix tooltip primitives were exposed as module exports. The application source itself contains only public imports and no alias rewrite or deep package import. These are **real baseline-artifact components, not stand-in charts or mocked tooltips**.

The artifact's React runtime reports **19.3.0**, while the inspected baseline lockfile resolves React **19.0.0**. That discrepancy is retained as a reproducibility limitation. A workflow-associated artifact is not a substitute for rebuilding this patch from the specified lockfile and toolchain. No artifact vendor assets or font files are distributed in this source bundle.

## 2. Current implementation inventory

The following are source observations, not claims that the original product meets new performance targets. Paths abbreviated `ScatterPlot/` are relative to `packages/explorEDA/src/components/charts/`.

| Observed capability | Inspected source/symbol | Consequence for this implementation |
|---|---|---|
| Canvas point drawing with SVG axes and input | `ScatterPlot/ScatterPlot.tsx`, `ScatterSvg.tsx` | Keep the same basic approach in the experimental renderer; preserve the actual existing chart separately. |
| Pure render planning | `ScatterPlot/scatterPlan.ts`: `planScatter`, `ScatterSnapshot`, `ScatterPlan` | Statistical calculations remain outside React and outside pointer handlers. |
| X/Y, color, fixed point size, opacity | `ScatterPlot/definition.ts`, `ScatterPlotSettingsPanel.tsx` | No claim that field-driven size is currently supported. |
| Numeric linear/symlog; categorical bands and stable jitter | `ScatterPlot/scatterAxis.ts`: `planScatterAxis`, `scatterAxisKind`, `scatterPosition` | Numeric statistics never consume category indices or jitter. The broader `AxisSettings` union is not evidence of scatter log/time support. |
| Full-source, padded domains | `scatterAxis.ts`: `paddedDomain`; `scatterPlan.ts`: `domainInputs` | Both lab panels use all-source domains independent of filters/facets. |
| Numeric/category brushes | `scatterPlan.ts`: `brushFilters`; `scatterAxis.ts`: `spanFilter` | Keep native brushing untouched; implement explicit numeric ranges in the lab. |
| Own-filter failures remain dimmed | `planScatterPoints.ts`; `src/test/charts/scatterPlan.test.ts` | Visible context, selected rows and fitted rows are different sets. |
| All/chart/filtered/facet populations | `scatterPlan.ts`: `rowSets`, `populations`; `hooks/CrossfilterWrapper.ts` | Explicit analysis, reference and scoring populations replace any opacity-based inference. |
| Row provenance, calculated-field and exclusion inspection | `scatterTrace.ts`, `ScatterTraceBody.tsx`, `ScatterPlot.tsx` | Exact source IDs retained in points, bins and score tables; actual native trace remains available. |
| Header readout, Alt-click and accessible object inspection | `ScatterPlot.tsx`, `ScatterSvg.test.tsx` | Experiment overlays do not intercept the native brush or cover its header. |
| Linear nearest-point hover scan | `ScatterPlot.tsx`: `pointAt` | Performance is measured, not assumed; lab point rendering has an explicit deterministic cap. |
| No required advanced statistical layers in the inspected scatter | Scatter source/settings above | Implement locally in the lab, without changing normal chart settings. |

`planScatterOverlay` plans brush and hover graphics, not statistical overlays. The archived `packages/explorEDA/docs/archive/prd/chart_features/scatter_chart.md` is historical intent: regression, variable symbols, dual Y axes and the million-point target are not working-feature or capacity evidence. `docs/intent/composed-analytical-graphics/shape-brief.md` was read for adjacent scope; its editor was not implemented.

The reading route also covered root/package/demo READMEs and package manifests, `docs/ui-defaults.md`, `numeric.ts`, `ChartTypes.ts`, `SavedDataStructure.ts`, `FacetContainer.tsx`, `numericScale.ts`, demo `main.tsx`, `LandingPage.tsx`, `examples.ts`, `dashboardSettings.ts`, `ChartDocs.tsx`, Vite configuration, dataset attribution, and the listed local/global scatter tests. The review was targeted rather than a line-by-line audit of unrelated provider/documentation code: DataLayerProvider's initialization/public contracts and first 660 lines, the ChartDocs scaffold, and relevant dashboard definitions were inspected. Additional relevant files were `applyFilter.ts`, `FilterTypes.ts`, `SavedDataTypes.ts`, `categories.ts`, RowChart's definition, shared tooltip/button components, the lockfile and `scripts/check-ui.mjs`.

## 3. Small implementation boundary

All lab code and focused tests are in `apps/demo/src/scatter-lab/`. `types.ts` defines lab-only settings; `fixtures.ts` generates data; `statistics.ts`, `geometry.ts`, `related.ts` and `plan.ts` compute deterministic results. `Controls.tsx`, `ScatterCanvas.tsx`, `Readouts.tsx`, `MethodHelp.tsx` and `ScatterLab.tsx` render them. `ExistingScatter.tsx` is the public integration adapter.

The LandingPage patch adds a lazy `/?view=scatter-lab` branch and a discoverable link beside existing learning/examples navigation. The former LandingPage body becomes `LandingContent`, preserving its hooks and behavior; existing examples/docs are not replaced. No Vite configuration or package-scatter change is necessary. Styling stays in the new lab directory.

The actual comparison passes all original fixture rows and lab field/filter choices to `ExplorEda`. A scatter chart carries its own numeric ranges, and two native row charts carry group and cohort filters. This respects `RowChart/definition.ts`, which uses the value filter for its own field. Full-source rows remain available for domains. Active facets use the existing public wrap-facet settings.

Native `onStateChange` is captured, **not** immediately echoed back into `savedData`: the public integration is a restore contract, not controlled state. An explicit “Use native selection in lab” button transfers supported numeric ranges and one selected group/cohort. Unsupported categorical brush transfers, extra charts, calculations and Rows filters produce an explanation instead of an approximate selection. Native categorical interaction itself remains available. Arbitrary workspace edits, changed facet definitions or changed field conversions are not a supported round-trip editor contract; restore the lab configuration before comparing such changes.

Limited duplication is intentional: finite-number rules, scale/domain behavior, numeric filter semantics and facet-key formatting are small lab-local counterparts of inspected source contracts. They avoid undocumented imports. The adapter/unit tests and real native comparison provide checks, but a later internal reuse seam should replace duplication before product integration.

### Dependency decision

No D3 hexbin/contour package or large statistics package was added. Two-dimensional covariance and its required F quantile admit small, independently checked routines; density is a documented gridded approximation rather than an opaque dependency claim.

One direct demo dependency is justified: `@radix-ui/react-tooltip` at the already-locked `^1.1.8` version. The same package already occurs in the explorEDA importer. The patch adds the matching demo importer entry and reuses existing resolution/snapshot entries. Provider, Root, Trigger, Portal and Content were verified through official documentation and exercised from the actual built artifact. The upstream project is MIT-licensed and TypeScript-based. The repository already depends on its maintenance ecosystem; this is not an independent maintenance audit or a claim that 1.1.8 is the newest release. Incremental production bytes and frozen-lockfile resolution remain **unverified**, because a fresh build/install could not run.

The lab's ActionTooltip reuses the existing shared composition locally. The older shared trigger prevents focus help, conflicting with `AGENTS.md`. The local trigger opens keyboard help after focus-induced scrolling settles, retains hover help, and closes on blur/Escape. No native `title` attribute or SVG `<title>` is introduced. Semantic border/input/status tokens pass the scoped source check. See [Radix Tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip) and its [license](https://github.com/radix-ui/primitives/blob/main/LICENSE).

## 4. Rows, units and coordinates

Three independent controls are kept separate. **Analysis** defaults to eligible pairs passing the lab's numeric brush and external group/cohort filters inside the active facet; “full active facet” explicitly ignores those filters. **Reference** is analysis, full source, or the fixed training cohort. Full/training references deliberately ignore current filters and facet. **Scoring** is analysis, full active facet, or held-out rows within the facet. Pooled or one-category-group covariance models can be selected; absent group models never borrow another group's covariance.

Bins, density, paired marginals and analysis summaries use analysis rows. Ellipses, principal axes and distance models use reference rows. Scores apply only to the declared scoring population. The UI shows counts/exclusions and separate analysis/reference tables when they differ. Gray context can remain visible without entering a fit. Both lab panels share domains, geometry and color scales.

Eligibility follows `lib/numeric.ts`: finite numbers and finite nonblank numeric strings are measurements; blank text, booleans, null/undefined, NaN and infinities are not. X/Y pairing happens before means, covariance, scores or marginals. IDs survive all computations. Categorical or absent fields disable numerical layers with a data reason, while the actual package comparison preserves categorical axes.

Default covariance/distance coordinates are prepared data units. Optional analysis symlog is `sign(v) * log(1 + |v / one field unit|)` independently on each axis; statistics are recomputed and those coordinates are dimensionless. Display symlog is independent of this model choice. Data/mean ellipse boundaries and principal-axis lines are sampled in analysis coordinates and transformed vertex by vertex, not drawn as an untransformed SVG ellipse on nonlinear axes. Domain padding is 10% in display coordinates using finite values from all source rows independently by axis.

## 5. Method definitions and numerical gates

### Exact hexagonal counts

Pointy-top axial grid center `(q,k)` is `(sqrt(3) r(q+k/2), 1.5 r k)`, with origin at the plot's top-left and radius in CSS plot pixels. The nearest center receives each point; exact floating-point ties prefer smaller q, then k. All eligible IDs are retained, and counts equal inspected contributors. Bins are **inspection-only**: no bounding-box substitute for hex membership. Resize recomputes both panels on the same new pixel geometry. The legend is rows/bin, with a full-source maximum that does not inflate filtered groups. Reference geometry: [D3 hexbin](https://github.com/d3/d3-hexbin); this code uses a local nearest-center implementation, not D3 calls.

### Gaussian kernel count intensity

Each analysis point deposits unit mass bilinearly onto a 4-CSS-pixel grid. Separable Gaussian convolution uses bandwidth as its standard deviation in plot pixels, truncates at ±4 bandwidths per axis and discretely normalizes the kernel. A padded grid retains tails; clipping to the viewport does not renormalize visible mass. Contours use piecewise-linear marching triangles with a fixed diagonal and evenly spaced intensity thresholds. Fill and thresholds share the full-source maximum, even when filtering.

Units are **rows/px²**, and the padded discrete integral is the analysis count, not one. There is no probability-density mode and no probability-mass contour claim. The “integrates to one” gate is inapplicable; count conservation and a continuous Gaussian peak reference are tested instead. The 4-pixel discretization is most approximate at the minimum 4-pixel bandwidth; the 20-pixel default is the independently tested peak case. This is explicitly an approximate KDE, with no claim of exact bandwidth invariance under resize. [D3 density documentation](https://d3js.org/d3-contour/density) supplies the comparison count-intensity interpretation, not the implementation.

### Sample covariance, Pearson and Mahalanobis diagnostics

Means and covariance use compensated sums with an origin shift and centered second pass; covariance divides by `n−1`. Diagonal units are X²/Y², cross units X·Y, and Pearson r is dimensionless. [NumPy covariance](https://numpy.org/doc/stable/reference/generated/numpy.cov.html) with `ddof=1` supplies independent expected results.

`D²=(z−mean)' S⁻¹(z−mean)` is evaluated through a standardized two-dimensional Cholesky calculation; `D=sqrt(D²)`. Point inspection and the top-20 table name both. Distance coloring saturates at D²=16 and nested contours are D=1,2,3. These are diagnostics, never automatic error classifications. Matrix inversion is unavailable for insufficient pairs, zero variance, overflow or standardized eigenvalue ratio `(1−|r|)/(1+|r|) ≤ 1e−10`. No ridge/pseudoinverse is hidden behind ordinary coverage labels.

### Data ellipse versus confidence region for the mean

For a **data ellipse**, nominal fitted Gaussian coverage a gives `q=−2 ln(1−a)` and semiaxes `sqrt(q λ)`. At .95, q=5.99146454710798 and radius=2.447746830680816. This is fitted Gaussian coverage, not exact finite-sample outlier significance or future-observation prediction coverage.

For the **mean region**, n>2 and independent bivariate normal observations give `n(mean−mu)' S⁻¹(mean−mu) ≤ [2(n−1)/(n−2)] F(2,n−2;a)`. Divide that threshold by n for geometry. [NIST Hotelling T²](https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc543.htm) supplies finite-sample scaling. The local analytic quantile uses `F(2,ν;a)=ν/2 * expm1(−2 log1p(−a)/ν)`, independently checked against [SciPy F](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.f.html). Prediction and tolerance regions are explicitly deferred. A sample of 1.96 standard deviations is not substituted for bivariate coverage.

### Principal axes and paired marginals

Principal axes are covariance eigenvectors, with endpoints one square-root eigenvalue on each side of the center. Eigenvalues and variance shares are shown. This is **not standardized-correlation PCA**; unequal units change orientation and explained-variance shares. Marginals count the same paired X/Y observations, in user-selected equal-width analysis-coordinate bins with fixed all-source domains. Intervals are half-open except the included final maximum.

### Actual numerical evidence

All **30** executed high-value checks passed, including exact hex partitions at three radii, analytic centers/boundary assignment, row reversal, finite/nonnegative/smoothing density, normalization, finite-pair covariance, affine-unit and X/Y-swap invariance, both ellipse equations, singular guards, fixed-reference/facet/filter counts, marginal counts, PCA eigenvalues, symlog mapping and strict settings restore.

| Check | Actual maximum error | Acceptance tolerance |
|---|---:|---:|
| Five-pair covariance versus independent rounded matrix | 1.78e−15 absolute | 1e−12 |
| F quantiles: 7 sample sizes × 4 levels versus SciPy | 1.10e−15 relative | 1e−10 used for reference acceptance |
| Positive affine distance invariance | 3.08e−12 absolute D² | 1e−9 |
| X/Y-swap distance invariance | 3.55e−15 absolute D² | 1e−10 |
| Data ellipse boundary equation | 8.89e−15 absolute | 1e−10 |
| Mean-region boundary equation | 1.95e−16 absolute | 1e−10 |
| Count-intensity padded-grid integral, n=1,000 | 1.82e−12 rows | 1e−8 |
| Single-point peak versus `1/(2πh²)`, h=20 px | 8.03e−5 relative | 2e−4 |

The hand-sized five-pair fixture has mean `[4.4,4.2]`, covariance `[[9.3,7.9],[7.9,9.7]]`, and three explicitly excluded rows. The separate direct NumPy comparison in `reference.json` agrees to the stored precision. Full values, versions and tolerances are in `reference.json` and `numerical-results.json`; displayed bounds above are rounded upward.

No numerical acceptance check needed two failed repairs. One manually transcribed F-reference constant was corrected against SciPy before the final source tests were delivered; the quantile algorithm did not change. A source-level TypeScript strict/noUncheckedIndexedAccess/noUnused check passed for the nine pure calculation/fixture modules using TS 5.8.3. This is not a full React/project typecheck.

### Secondary seeded coverage experiment

Each row below uses 3,000 independent Gaussian samples and 100 held-out observations per sample, with the shipped numerical routines. Mean-region Monte Carlo standard error under .95 is about .00398. “Known Gaussian” uses the true mean/covariance; “fitted held-out” uses each sample's estimates. No sample was unavailable.

| n | Seed | Mean-region coverage | Known-Gaussian data coverage | Fitted held-out coverage | Fitted in-sample fraction |
|---:|---:|---:|---:|---:|---:|
| 5 | 2601008 | 0.9537 | 0.9501 | 0.7073 | 1.0000 |
| 30 | 2601033 | 0.9487 | 0.9502 | 0.9214 | 0.9607 |
| 200 | 2601203 | 0.9513 | 0.9503 | 0.9470 | 0.9518 |

The small-sample fitted data contour's poor held-out coverage is not concealed. It demonstrates precisely why the data ellipse cannot be sold as an exact prediction region or outlier test. Mean-region coverage, which concerns a different target, remains near .95 in these simulations. Mixtures, rings and contamination are model-mismatch fixtures, not Gaussian coverage certifications.

## 6. Fixture guide and reproducibility

Default synthetic seed is **20261003**. The generator uses deterministic Mulberry32 and Box–Muller draws, with all parameters exported. Ordinary Gaussian truth is mean (10,20), SD (2,6), correlation .85 unless changed. Source IDs include the seed and zero-based row index. The first 70% are training rows; the remainder are held out. Large datasets are generated, not committed.

| Preset family | Scientific question / proof |
|---|---|
| Positive, negative, independent Gaussian | Known mean/covariance, unequal variance, correlation sign and principal directions. |
| Overlapping groups and multimodal mixture | Compare density structure with the misleading single pooled ellipse. |
| Ring | Strong nonlinear structure can coexist with weak Pearson correlation. |
| Unequal group sizes / pooled reversal | Compare pooled and within-group models without per-group density normalization. |
| Contamination and held-out | Score against an unchanged clean training reference; show ordinary covariance's sensitivity. |
| Tiny, duplicate, identical, zero-variance, collinear, near-collinear | Explicit unavailable inverse/ellipse results; paired count and zero-variance behavior. |
| Missing/nonfinite | Numeric strings included; booleans, missing values, NaN and infinities excluded; 310 valid pairs at the 1,000-row preset. |
| Large offsets / unequal units | Numerical scale/translation stress, with offsets 1e12 and −1e9. |
| Negative values / symlog | Independent display and analysis transforms, including sampled curve transformation. |
| 1,000 / 10,000 / 100,000 rows | Fixed-seed performance measurements and explicit rendering stride. |
| Palmer Penguins | Existing real dataset; 344 source rows and 342 valid flipper-length/body-mass pairs. |

Palmer Penguins loads the existing `/datasets/palmer-penguins.csv`; its attribution is retained from `apps/demo/public/datasets/README.md`: [palmerpenguins](https://allisonhorst.github.io/palmerpenguins/) and [CC0](https://allisonhorst.github.io/palmerpenguins/LICENSE.html). Synthetic truth is not attributed to the real dataset. JSON contains fixture ID, seed, size/correlation/contamination, fields, scopes, filters, display/analysis transforms, grouping and method parameters. Restore validates version, finite bounds and computational limits; absent fields get an explicit guard rather than a crash.

## 7. Interactive and visual evidence

All **nine** focused browser scenario groups passed in the offline harness with **zero JavaScript page errors**: all 18 presets; required layer/parameter controls; external filters/facets/grouped/fixed-reference semantics; pointer brushing and keyboard range/clear controls; keyboard source/bin inspection; actual Blob export and exact JSON restore plus invalid input guards; keyboard tooltip/focus/Escape; real native scatter comparison; and six width/theme combinations.

The native comparison selected 500 group-A rows and transferred them correctly. Its numeric brush produced **881** selected pairs, matching the lab after explicit transfer. Alt+Enter on native “Horizontal tick 10” opened the real **Scatter trace inspector**, whose source-domain explanation reported 1,000 all-source values and 10% padding. Native categorical X produced A/B ticks, while the lab disabled numerical statistics. The full existing scatter Vitest suite did not run; package source was not edited.

Screenshots cover **1280, 783 and 390 CSS pixels**, light/dark themes, plus all layers, native numeric/categorical scatter and the trace inspector. The responsive lab has a baseline/experiment switch at narrow widths; the unchanged native desktop workspace scrolls horizontally. No page-wide horizontal overflow was observed, and tooltip bounds were checked at all six width/theme combinations. This does not imply mobile support for the complete workspace.

Initial checks exposed two issues: a test invoked programmatic focus while still in mouse modality, and real narrow-screen focus scrolling could close a Radix tooltip immediately. The test was changed to keyboard modality; the local tooltip now waits 160 ms after focus before opening. Both were rerun successfully. An edge tick label was also clipped at 390 pixels; endpoint anchoring was corrected and screenshots rechecked. `browser-first-run.json` preserves the initial failures; `browser-results.json` records the final pass. The scoped implementation of the repository's exact title/border rules passes with no failures (`scoped-ui-check.json`). The root `pnpm check:ui` did not run.

## 8. Performance: measured, not product promises

Browser: **Chromium 144.0.7559.96**, Linux x86-64 on an **AMD EPYC 9V74 80-Core Processor** host; the browser reports **5 hardware threads**, DPR 1, no CPU throttle. Viewport 1280×1100; both lab plot areas 519×320. The positive fixture, seed 20261003, linear display, pooled analysis/reference and all layers are fixed. The native workspace is closed for these timings.

Computation has 20 measured runs after three warmups. Filter updates alternate A/all with 20 measured runs after two warmups. Hover has 30 trials. Fresh-tree first render has 10 trials with modules/assets already loaded, including fixture generation and mounting; it is **not cold route/network load time**. Filter/hover timing is taken inside the browser from event dispatch through two animation-frame callbacks, not across Python-driver round trips. These include frame scheduling and are conservative feedback measurements rather than isolated handler CPU time. Raw samples and full settings are retained in `performance.json`.

**Milliseconds: median / p95.**

| Rows | Pure computation | First render, warm modules | Filter update | Hover feedback |
|---:|---:|---:|---:|---:|
| 1,000 | 9.8 / 13.9 | 89.8 / 102.9 | 47.5 / 51.2 | 33.2 / 33.9 |
| 10,000 | 28.1 / 49.3 | 196.4 / 232.3 | 84.5 / 116.6 | 33.3 / 33.4 |
| 100,000 | 185.2 / 299.3 | 631.3 / 824.3 | 348.4 / 552.0 | 33.3 / 33.5 |

The final 10,000-row p95 filter and hover results pass the proposed **<200 ms** and **<50 ms** targets in this harness. Those targets were not adjusted. The 100,000-row case is a stress observation, not a pass against a new hidden target: filter updates visibly slow, while controls return and hover remains responsive after settlement. Shared-host/GC variability is expected; do not treat one browser environment as a product capacity certification.

At more than 10,000 drawable points, the renderer explicitly shows every `ceil(drawableCount/10000)`th point in stable source-derived order and labels both counts. At 100,000 rows this is every tenth point. **Every eligible row remains in covariance, distances, bins, density and marginals.** Pointer hover addresses drawn points; keyboard/source-index and top-distance inspection address all source rows. The most useful performance refinement is to cache unchanged full-source geometry/reference preparation and replace full sorting for the top-20 table with a bounded selection, before adding workers or a renderer migration. The archived million-point target was not tested.

## 9. Decisions and ranked next experiments

These are engineering judgments from this lab, not implemented product changes. “Promote” means a candidate for a separate reviewed integration **after** the remaining workspace gates pass.

| Completed experiment | Decision | Reason / next integration condition |
|---|---|---|
| Sample covariance, Pearson and paired counts | Promote conditionally | Small pure computation, independently checked; preserve row scope and units in the product UI. |
| Exact-ID hexagonal count bins | Promote conditionally | Useful overplotting reduction with auditable contributors; reuse native scales/trace and validate resize/selection in the real build. |
| Paired marginals | Promote conditionally | Clear comparison with exact counts; retain explicit bin/domain policy. |
| KDE fill/contours | Refine | Useful for mixtures/rings; pixel bandwidth and resize dependence need product-level communication and bandwidth/grid sensitivity review. |
| Data ellipse | Refine | Correct contour geometry, but small-n predictive misunderstanding is substantial; retain explicit fitted-Gaussian label. |
| Mean confidence region | Refine; lab-only for now | Numerically validated under IID normal assumptions; do not make it a generic default ellipse. |
| Mahalanobis diagnostics | Refine | Fixed-reference scoring is useful; make model sensitivity/reference selection unavoidable before product promotion. |
| Covariance principal axes | Refine | Correct and cheap, but unequal physical units can dominate; consider a separately named correlation-PCA comparison. |

The following candidate costs are prospective engineering estimates, not benchmarks. No extra method below was added merely to expand feature count.

| Rank / candidate | User task | Assumptions / definition | Cost and repository fit | Proof fixture | Classification |
|---|---|---|---|---|---|
| 1. Rectangular 2D histogram | Judge hex-grid artifacts and alignment | Same eligible rows, shared pixel/data-space grid, exact counts/IDs | Low; O(n) assignment, reuse lab count legend/inspection | Overlap plus points on rectangular/hex boundaries | Next experiment |
| 2. Spearman correlation | Detect monotone nonlinear association | Average ranks for ties; Pearson on paired ranks; no inference without a specified procedure | Low–moderate; O(n log n), pure summary helper | Proposed monotone cubic fixture with duplicated ranks; ring is a counterexample, not a success fixture | Next experiment |
| 3. Brushed-versus-reference cohort comparison; compact scatter matrix | Compare a selected cohort to fixed context across fields | Explicit cohort/reference, paired eligibility for every field pair; matrix domains stay shared | Moderate for cohorts; larger UI/O(d²n) cost for matrix; rowSets are a good later seam | Held-out contamination; penguins measurements | Next experiment for cohorts; defer matrix |
| 4. Identity / engineering tolerance lines | Compare instruments or pass/fail limits | Same measurand and compatible units; externally supplied limits, not fitted Gaussian cutoffs | Low; existing SVG guides/trace are a natural fit | Proposed two-instrument dataset with supplied tolerances | Next experiment |
| 5. Linear regression, residuals, separate confidence/prediction bands | Calibrate a response and inspect residual structure | Conditional Y-on-X model; uncertainty bands require their own normal/independence/variance assumptions; X measurement error is not ignored without a caveat | Moderate; pure O(n) fit, residual view and distinct band labels; no existing regression claimed | Positive/negative Gaussian plus a proposed heteroskedastic fixture | Next experiment |
| 6. Robust covariance / robust distances | Assess contamination sensitivity | Name a robust estimator and its correction/calibration; never attach ordinary coverage labels automatically | Higher numerical/reference burden; do not import a large package just for this | Contamination with fixed clean training/held-out truth, checked against trusted MCD results | Next experiment after core gates |
| 7. LOESS / justified nonlinear smoother | Describe nonlinear trend without forcing a line | Define span, polynomial degree, local weights and behavior at edges/gaps; not a causal model | Moderate–high, potentially expensive neighborhoods; requires a residual/help UI | Proposed smooth nonlinear relationship with sparse ends; ring shows non-function structure | Defer |
| 8. Measurement error bars / observation uncertainty ellipses | Show known measurement uncertainty | Supplied per-observation SD/covariance, units and dependence; not population covariance | Moderate rendering, high metadata/provenance requirement | Proposed repeated instrument measurements with known error covariance | Defer until uncertainty metadata exists |
| 9. Connected trajectories | Inspect ordered evolution | Explicit meaningful order/time within trajectory; tie/gap rules, no connections between independent rows | Moderate; adjacent line-chart patterns exist, not a scatter default | Existing Lorenz example with explicit time/run ordering | Defer |

The robust comparison motivation is supported by [scikit-learn's covariance/Mahalanobis example](https://scikit-learn.org/stable/auto_examples/covariance/plot_mahalanobis_distances.html). It is a future proof oracle, not a shipped robust implementation here.

### Proposed small later integration path

First extract paired-row statistical helpers beside `ScatterPlot/scatterPlan.ts`, reusing `lib/numeric.ts` and the actual `ScatterSnapshot.rowSets` semantics. Compute summaries/reference models in pure planning, not React hover. Add only accepted optional drawing and trace descriptors to the existing canvas/SVG path; route bin inspection through `scatterTrace.ts`/`ScatterTraceBody.tsx` with exact IDs. Keep normal defaults unchanged, validate both facets and category-disabled behavior with the existing scatter tests, then separately design/version any public settings additions. Do not introduce a general layer registry or composed-graphics editor. No part of this later product work is included in the patch.

## 10. Failed/incomplete gates and exact next actions

| Gate | Current status / evidence | Smallest action to finish |
|---|---|---|
| Writable checkout / full patch application | Unverified; connector-only source access; patch syntax parses | In the correct existing checkout, preserve branch/user edits and run `git apply --check` before applying. |
| Required Node 24 / pnpm 11.9.0 | Unavailable here | Use the specified toolchain without editing package versions. |
| Install, package build, demo Vitest, complete TSX typing | Unverified; dependency downloads unavailable | Run the repository commands below; repair any genuine build/type/test failures before claiming completion. |
| Full UI and root checks | Unverified; only the new-source equivalent UI rules passed | Run `pnpm check:ui` and `pnpm check` in the full workspace. |
| Live route / development and production bundling | Unverified; Chromium navigation blocked here | Open the actual Vite URL, run the live browser script, and inspect a fresh production build. |
| Cold route first render / production incremental bytes | Unverified; measured fresh trees have warm modules | Measure from the fresh Vite/production build on the stated target machine. |
| Full native edited-workspace round-trip | Deliberately outside supported transfer contract | Keep comparison charts/settings intact; broader editing requires a separately specified adapter. |

Commands from the repository root, after reviewing/applying the full patch:

```sh
git status --short
git rev-parse HEAD
git branch --show-current
git apply --check /path/to/scatter-test-bed.patch
git apply /path/to/scatter-test-bed.patch
pnpm install
pnpm --filter exploreda build
pnpm --filter demo test
pnpm check:ui
pnpm check
pnpm --filter demo dev
```

Open the actual Vite port printed by the command; the documented default is `http://localhost:5173/?view=scatter-lab`. Existing comparison routes remain `/?example=scatter-trace` and `/?example=palmer-penguins`.

Focused new tests are `statistics.test.ts`, `ScatterLab.test.tsx` and `nativeAdapter.test.ts`. The numerical runner can also be invoked with `node docs/research/scatter-test-bed/validate-numerics.mjs` after dependencies are installed. `oracle.py` provides an independent NumPy/SciPy reference outside the application. The delivered live-browser rerun form requires external Python Playwright and can be run with `python docs/research/scatter-test-bed/browser-checks.py --url http://localhost:5173/?view=scatter-lab --chromium /path/to/chromium`; that live-URL form was not executable here. Neither Python script is needed by the shipped lab.

When shared source is changed in a later integration, run the existing focused tests as well:

```sh
pnpm --filter exploreda exec vitest run src/test/charts/scatterPlan.test.ts src/test/charts/scatterTrace.test.ts src/test/charts/planScatterPoints.test.ts src/components/charts/ScatterPlot/scatterPlan.test.ts src/components/charts/ScatterPlot/ScatterSvg.test.tsx
```

Do not run release/changeset-version/publish commands. Demo-only work needs no changeset. Preserve Node's AbortController/AbortSignal in demo tests; the new component tests only stub ResizeObserver and canvas drawing for jsdom and do not replace those APIs.

## Delivery index

`validation.json` is the status entry point. `reference.json`, `numerical-results.json`, `browser-results.json`, `browser-first-run.json`, `performance.json` and `scoped-ui-check.json` hold actual evidence. `integration.patch` contains only the three existing-file edits. The source bundle provides exact new relative paths; the full downloadable patch combines those files with the existing-file edits. Screenshots and exported-settings evidence are under `tmp/scatter-test-bed/` and should not be committed. The broad-check gaps above remain open; the full test bed is **not claimed complete**.
