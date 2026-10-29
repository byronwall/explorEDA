# Design regression diagnostics from the fitted population

https://github.com/byronwall/explorEDA

Source commit: `95832bd473884aeae23453af0888b4ca5187820d`.
Mode: Design.

## Mission

What should explorEDA build so an analyst can diagnose a fitted relationship, inspect suspicious residuals, and judge fit sensitivity?
Design the complete author flow and a staged implementation plan.
Residual inspection must keep the exact fitted population and source records clear.
Use strong statistical tools and primary literature to choose a useful design, beyond a list of possible plots.
Byron is the demand. Do not require outside demand, observed failures, or a usability study before designing the capability.

Act as a scientific visualization designer and applied statistician who has shipped interactive model diagnostics.
Give candid tradeoffs, rejected alternatives, and limits.

## Access check

Read the attached source packet at the named commit before research.
It includes complete files and an inventory. Confirm access to the decisive modules.
If required source is absent from both the packet and connected GitHub, stop and request the smallest missing input.
Do not claim a full review from partial access.

## Current product and reading route

explorEDA is a React and TypeScript library with a demo, linked filters, chart traces, saved dashboards, and notebooks.
Keep that stack. Use pnpm. This is a personal project, with one server, client, and deployed version.
Prefer direct code and a small maintained surface.

Read these packet groups in order:

1. `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `CODING_STANDARDS.md`, `docs/research/DIRECTION.md`.
2. `ScatterPlot/regression.ts`, `fitPlan.ts`, `useScatterFits.ts`, `regression.test.ts`.
3. `scatterPlan.ts`, `useScatterData.ts`, `ScatterPlot.tsx`, `ScatterSvg.tsx`, `definition.ts`.
4. `FitTraceBody.tsx`, `FitLabels.tsx`, `RegressionSettings.tsx`, `ScatterTraceBody.tsx`, `scatterTrace.ts`.
5. Shared trace types, trace scope, data layer, parsing, save validation, and dashboard text compiler/exporter.
6. The scatter docs, demo examples, current scientific intent, and R001/R002/R003 context.

Paths in groups two through four are under `packages/explorEDA/src/components/charts/`.
Use the full inventory for exact paths.

Verified current facts to recheck:

- Linear, polynomial degree 2–6, and LOESS fits already exist. Do not redesign these as missing.
- `ScatterFit` retains exact finite-pair source IDs and exclusion counts by fit and facet.
- Own-chart brushing dims observations without refitting. Other filters can change fitted rows.
- Fits use raw numeric values; axis scales and viewport bounds are separate from the estimator.
- Polynomial fitting uses a standardized basis and Householder QR. Linear prediction now uses a centered basis.
- The trace already shows a centered equation when appropriate. Older R001 research describes defects that current code has repaired.
- LOESS has no global equation. Above 500 rows, its curve interpolates between 201 fitted vertices.
- Existing traces and header controls provide inspection. The product forbids plot-level Inspect buttons.
- Existing notebooks can display externally prepared residuals. They do not establish a native diagnostics workflow.

R001 studied numerical conditioning, not a residual or sensitivity feature design.
R002/R003 include older demand gates. DIRECTION.md supersedes those gates.

## Ranked questions

1. **What should the analyst see and do?** Compare established workflows in JMP, R, statsmodels, and other strong tools.
   Choose the smallest complete diagnostic workspace for this product. Explain what residual-versus-fitted, residual-versus-X,
   ordered residuals, Q–Q, leverage, and influence displays each earn. Select a first milestone; stage the rest.
   Show entry, fit/group/facet choice, suspicious-point selection, source records, closing, and return to the chart.
2. **What population and selection contract makes it trustworthy?** Define fit population, displayed diagnostic population,
   selected records, and peer-filter changes. Decide live versus held fit behavior while inspecting residuals.
   Avoid a residual selection that silently refits its reference model. Define revision invalidation and explicit recomputation.
   Cover invalid pairs, group/pooled fits, facets, own brush, viewport clipping, log axes, duplicate X, empty groups, and data refresh.
3. **How should an analyst assess sensitivity?** Choose a bounded comparison of nearby polynomial degrees, LOESS spans,
   linear reference, or selected-row exclusion. Keep the input rows fixed for comparisons unless the user explicitly changes them.
   Separate modeling sensitivity from numerical approximation. Avoid automatic best-model labels and R² score chasing.
   Decide whether leave-one-out influence belongs in milestone one or later, with justified costs and method limits.
4. **What mathematical contract and exact fixtures prove it?** Define residual sign, units, prediction basis, standardization,
   leverage/influence meaning where included, undefined cases, and LOESS-specific limits.
   Provide small explicit datasets, exact expected predictions/residuals/memberships, and tolerances for approximate quantities.
   Include a symmetric noisy line, misspecified curvature, changing spread, and one influential observation.
   Include at least one translated/unit-converted fixture that keeps diagnostics consistent with the actual predictor.
5. **What should persist, and what should be reusable?** Compare a temporary fit-attached diagnostic with generated fields/table
   or a saved diagnostic chart. Choose a design and explain state ownership, source identity, filter propagation, export,
   undo/restore, and copied equation behavior. Distinguish inspection state from saved analysis settings.
   Do not create a second modeling platform or general formula language to support the first diagnostic.
6. **How do workers build it?** Name real files and proposed modules, data types, performance bounds, tests, docs, and examples.
   Each milestone must ship independently and include its docs page or section and runnable example.
   Include keyboard/touch access and browser proof at 1280, 783, and 390 pixels. State the main risk per milestone.

## Evidence and boundaries

Cite repository paths and symbols for code facts. Cite current primary documentation, papers, or source for decisive external claims.
Separate facts, inferences, and proposals. Explain uncertainty.
This is a new capability design, not a robustness audit or a survey that ends with keeping current tools.
Recommend an ambitious staged result, with simple implementation seams.

Do not replace the regression solver, add a catalogue of estimators, or infer causality.
Do not add hypothesis-test badges, automatic outlier deletion, or automatic model selection.
Keep descriptive diagnostics separate from inferential confidence and prediction intervals.
Do not require a service, paid dependency, or broad public API before the first useful milestone.
Do not change repository files, commit, push, or run deployment. Codex owns all repository changes.

## Deliverables

Attach `report.md` and `implementation-plan.md`, and link both in the final message. A single ZIP is also fine.
If attachments are unavailable, give complete Markdown inline.

- Start the report with one paragraph: what to build and why.
- Answer the ranked questions, compare viable approaches, choose one, and cite primary sources.
- Give stable recommendation IDs with Build, Explore, Defer, or Avoid and a one-line reason.
- Make the implementation plan startable from this checkout. Order shippable milestones with files, acceptance checks,
  exact fixtures, docs section, runnable example, and main risk.
- Keep the result readable in a few minutes. Put detailed arithmetic in a short appendix when needed.
- End with access status, files read, checked facts versus proposals, deliverable links, and open questions.

Do not generate manifests, hash receipts, archives of source files, or an executable test harness.
