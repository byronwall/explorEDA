# Design covariance regions for linked scatter analysis

https://github.com/byronwall/explorEDA

Source baseline: `9d64a021` on origin/main, October 25, 2026.
Mode: **Design**. Research branch: `codex/covariance-regions-design-2026-10-25`.

## Mission

What should explorEDA build so an analyst can compare the center, direction, and spread of two measurement clouds,
inspect the records inside or outside a declared covariance region, and retain its meaning through linked filtering and saves?

Recommend the feature design and a staged implementation plan.
This is a new analytical capability, not an audit of existing covariance calculations.
Byron, the repository owner, is the demand. Do not require outside demand or a usability study before designing it.
Favor a useful complete journey over an isolated drawing primitive.

Act as a scientific visualization designer and applied statistician who has shipped linked analytical tools.
Give candid tradeoffs, alternatives, rejected options, numerical limits, and open decisions.

## Access check

Read the attached source packet first. It contains complete files at the baseline, with paths and boundaries.
Confirm access briefly. If decisive source is unavailable both there and through GitHub, stop and name the smallest missing input.
Do not claim to have read a repository ref you cannot access.
The short commit above is descriptive; the packet header records the full commit.

## Product and current behavior

explorEDA is a React and TypeScript library, demo, and local data-folder application.
It has linked charts, record tracing, calculated fields, saved dashboards, and notebooks.
Keep React and pnpm. Assume one developer and one current application version.
Do not add framework migrations, a statistical platform, compatibility layers, or paid services.

Current source facts to verify:

- Scatter already has points, rectangular density, hexagons, smoothed density contours, regression, paired summaries, marginals, and ordered connections.
- `pairedStats` uses finite X/Y pairs, sample covariance with n−1, and pooled/group summaries.
- `groupScatterRows` uses the chart's facet population and categorical color groups. Numeric color does not establish groups.
- `useScatterFits` caches on eligible inputs. Its own brush does not refit; peer filters can change the analysis population.
- `scatterPlan` has separate all, chart, filtered, and facet row sets. Visible marks and finite pairs need not be identical.
- A categorical axis, log/symlog transform, invalid bubble size, facet, or hidden axis bound raises a distinct geometry or population question.
- Current field filters cannot directly express an arbitrary quadratic region. Inspect the available `__ID` value-filter and selection restore mechanisms before proposing a new selection system.
- No native ellipse or covariance region setting appears in `ScatterPlotSettings`.

Older R004 and scientific intent notes contain outside-demand gates. `docs/research/DIRECTION.md` supersedes those gates.
Existing density contours are a different capability; do not rename or rebuild them.
Open research PR #526 proposes pooled/within/between comparison; #520 proposes held-fit residual diagnostics.
They are unbuilt proposals, not dependencies. This mission owns covariance-region design, not their implementations.
The October 25 Strategy PR #524 proposes parameterized notebooks. Do not require it for this feature.

## Reading route

At minimum, read these supplied areas:

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, `docs/research/DIRECTION.md`.
2. `docs/intent/research-ideas-100/ideas/R004-covariance-ellipse.md` and `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
3. Scatter `definition.ts`, `pairedSummary.ts`, `fitPlan.ts`, `scatterPlan.ts`, `useScatterData.ts`, `useScatterFits.ts`.
4. Scatter `ScatterPlot.tsx`, `ScatterSvg.tsx`, `ScatterPlotSettingsPanel.tsx`, `PairedSummaryBody.tsx`, `FitTraceBody.tsx`.
5. `hooks/CrossfilterWrapper.ts`, `types/FilterTypes.ts`, `providers/lib/carryRowSelections.ts`, `components/project/sourceRowIdentity.ts`.
6. `components/charts/trace/ChartTraceScope.tsx`, `traceTypes.ts`, `types/SavedDataStructure.ts`, `utils/saveDataUtils.ts`, `lib/dsl/settingKeys.ts`.
7. Scatter `summaryMarginals.test.ts`, `scatterPlan.test.ts`, `ScatterSvg.test.tsx`, and `test/providers/savedSelectionRestore.test.tsx`.
8. `apps/demo/src/docs/pages/scatter.mdx`, `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/dashboardSettings.ts`, `apps/demo/src/demos/coverage.ts`, and `apps/demo/playwright.config.ts`.

Scatter paths above start at `packages/explorEDA/src/components/charts/ScatterPlot/`.
Other library paths start at `packages/explorEDA/src/`.

## Ranked questions

1. **Meaning and design choice.** Compare strong primary references and products: descriptive data ellipses, confidence regions for a mean,
   prediction/tolerance regions, covariance-scaled distances, and robust regions. Which belongs in this product first, and why?
   Compare live group regions, a declared reference population, and principal spread axes.
   Choose defaults, labels, controls, and a precise boundary parameter. Avoid unexplained percentages or automatic error labels.
   Explain what the region permits the analyst to conclude. Do not make a methods catalogue the initial feature.
2. **Complete interaction.** Show the analyst's steps from two fields to region comparison, traced estimation rows,
   exact inside/outside records, linked selection, and a saved/reopened chart.
   Decide whether and when a reference stays fixed as selections change. Define own versus peer filters, local chart restrictions,
   groups, facets, legends, missing pairs, hidden points, and source refresh.
   Prevent an inside/outside selection from silently changing the boundary that defined it.
   Separate estimation rows, tested rows, membership rows, and drawn geometry when they differ.
   Recommend the smallest sound lifecycle; a frozen reference should earn its added state.
3. **Numerical and geometric contract.** Define center, covariance denominator, decomposition, radius, boundary inclusion, and membership.
   Handle singular/collinear clouds, a constant coordinate, fewer than two pairs, near singularity, high offsets, unequal scales,
   rotated clouds, outliers, repeated points, and nonfinite input.
   State behavior under unit conversion, reflection, axis swapping, log and symlog scales, clipping, and zoom.
   Decide whether the calculation lives in raw or transformed units and how that choice is visible.
   Supply independently reproducible fixtures with exact centers, covariance matrices, geometry, and member record IDs.
   Mark tolerances that need a local prototype. Do not silently invent statistical guarantees.
4. **Repository contract.** Recommend types, planner/rendering seams, trace targets, exact selection representation, validation,
   Dashboard text export, save/restore, host echo, history, source replacement, and notebook/folder behavior.
   Distinguish settings from derived geometry and cached populations.
   Reuse the current renderer and inspection conventions. Avoid per-row persistent metadata when a smaller ownership rule works.
   Identify concrete files, small new modules, and dependencies. State what a numeric color field means for grouping.
5. **Milestones and proof.** Give a worker-ready first milestone that delivers a complete useful region journey,
   followed by only earned extensions. Each milestone names files, focused tests, exact values where applicable,
   `/docs/scatter` sections, one runnable example, browser checks at 1280/783/390 px, and its main risk.
   Include export, undo, reload, source reorder/replacement, and keyboard trace/selection acceptance.
   Browser tests must use `.e2e.ts` and an explicit project entry when the current config requires one.
   Make tests protect analytical meaning, not internal structure. Measure before adding capacity infrastructure.

## Evidence and boundaries

Cite repository paths and symbols for source claims. Cite current primary documents, papers, or source for decisive external claims.
Keep facts, inferences, and proposals clear. Say when evidence is missing or conflicting.
Compare at least three credible approaches before choosing one; explain why the alternatives lose for this product.
Do not infer confidence coverage from observed enclosed counts or a generic ellipse label.
Do not implement, commit, push, merge, provision services, or audit unrelated robustness issues.
Codex owns local verification and repository integration after your response.

## Deliverables

Return two downloadable Markdown files, with a decision paragraph at the top:

1. `report.md`: answers to the ranked questions, primary references, fixtures, alternatives, and stable recommendation IDs.
   Classify each recommendation as **Build**, **Explore**, **Defer**, or **Avoid**, with one sentence of reasoning.
2. `implementation-plan.md`: ordered, independently shippable milestones with files, behavior, tests, docs, runnable example, risks, and unresolved decisions.

One ZIP containing both files is welcome but optional. Do not generate manifests, hashes, or receipts.
If files cannot be attached, include the full content inline.
End with access status, files read, what was checked versus proposed, download links, and open questions.
