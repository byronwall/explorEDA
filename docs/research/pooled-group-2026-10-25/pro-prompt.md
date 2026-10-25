# Pooled, within-group, and between-group relationships

https://github.com/byronwall/explorEDA

Source commit: `95832bd473884aeae23453af0888b4ca5187820d` (origin/main).
Mode: Methods.

## Mission

Design an exact, descriptive comparison of pooled and grouped numeric relationships for explorEDA.
Let an analyst choose X, Y, and one grouping field, explain opposing directions, and inspect the records.
Decide the mathematical contract and a complete implementation plan, including a within/between decomposition when useful.
This is a new analytical capability, not an audit of existing fits or a request for a lesson alone.
Byron is the demand. Do not require outside demand, usability studies, or observed failures.

Act as an applied statistician who designs interactive analysis tools.
Compare methods candidly. Distinguish descriptive identities, assumptions, uncertainty, and causal questions.
Codex will check the result and own all repository changes.

## Access check

Read the attached complete source packet at the named commit before researching.
Confirm access. If decisive source is absent and inaccessible, stop and name the smallest missing input.
Intent briefs contain proposals and stale demand gates. DIRECTION.md supersedes those gates.

## Reading route

Read the inventory, then at minimum:

1. AGENTS.md, docs/agent-guide.md, docs/research/DIRECTION.md, README.md, CODING_STANDARDS.md, and docs/ui-defaults.md.
2. packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts, fitPlan.ts, regression.ts, and their supplied tests.
3. ScatterPlot/scatterPlan.ts, scatterTrace.ts, PairedSummaryBody.tsx, definition.ts, ScatterPlotSettingsPanel.tsx, and ScatterPlot.tsx.
4. ScatterMatrix/matrixPlan.ts, definition.ts, matrixTrace.ts, and matrixPlan.test.ts.
5. lib/valueParsing.ts, lib/categories.ts, types/SavedDataStructure.ts, and the supplied trace components.
6. apps/demo/src/docs/pages/scatter.mdx, scatter-matrix.mdx, and supplied demo registration files.
7. R010, R005, the scientific analysis brief, and the relationship-discovery summary.

Paths after item two are relative to packages/explorEDA/src/components/charts unless another root is given.
The inventory names all paths precisely. All packet files are complete.

## Current facts and adjacent work

planPairedSummary already computes pooled and categorical-color-group paired statistics, including Pearson r and sample covariance.
planScatterFits already fits groups and optionally all rows. groupScatterRows uses the facet's rows after other chart filters.
The chart's own brush does not refit or change paired summaries. Check these facts in the supplied code.
Matrix correlation cells already expose pooled and group Pearson values. Do not propose another correlation matrix.
Raw numeric parsing and typed category equality have shared helpers.

Earlier relationship-discovery research kept the existing matrix and deferred broader ranking.
This mission adds an authored grouping comparison and exact mathematical explanation, not a broad discovery ranking.
Open PR520 proposes held-fit diagnostics; PR519 proposes contributor comparison; PR524 proposes reusable local notebooks.
Those are unbuilt proposals and must not become prerequisites or assumed APIs.
No open research PR covers this within/between methods question.

## Ranked questions

1. What should the mathematical contract be?
   Derive total, within-group, and between-group centered cross-products and variances for one disjoint grouping.
   Show which identities hold exactly and which correlation or slope summaries require different denominators.
   Compare pooled slope/r, each group's slope/r, a common within-group slope, and regression on group means.
   Decide whether and how the last two belong in the product. Do not average group correlations as a pooled coefficient.
   Research primary papers and authoritative method documentation for Simpson reversals, covariance decomposition,
   group-centered regression, and ecological inference. Cite direct sources for decisive claims.
2. What should the analyst see and do?
   Compare a compact scatter comparison, a dedicated analysis view, and an extension to the paired summary trace.
   Choose a strong bounded design that adds a visible capability beyond overlaid fits.
   Show authoring, comparing, selecting a group, inspecting contributions, changing scope, saving, and reopening.
   Decide how chosen grouping relates to color and facets. Keep a grouping choice explicit and understandable.
   Explain signs, magnitude, group sizes, X-range overlap, and unequal composition without diagnosing confounding or causation.
3. How are populations and edge cases defined?
   Use one common pair-valid population for comparable pooled/group/decomposition quantities.
   Specify missing X/Y/group values, overlapping reasons, typed groups, empty/singleton groups, constants, tiny variances,
   unbalanced groups, many categories, nonnumeric axes, nonlinear fits, transformations, units, and extreme finite inputs.
   Explain external filters versus the chart's own selection and facets.
   Separate a reversal among all estimable groups from mixed signs, undefined groups, and nearly zero values.
   Avoid arbitrary significance thresholds, automatic group searches, causal labels, and p-values by default.
4. What exact records explain each number?
   Specify memberships for pooled, within-group, and between-group terms without presenting group means as original observations.
   Explain contributor inspection, exclusions, selected groups, keyless data, refresh, save/reopen, and query-derived sources.
   Reuse current trace and row inspection conventions. Do not create a generic lineage platform.
5. What numerical tests and implementation milestones prove it?
   Provide small independently enumerated fixtures with exact sums, cross-products, coefficients, counts, and record memberships.
   Include a pooled reversal with unequal group sizes, consistent-direction control, mixed group signs, a singleton,
   missing values, constants, unit changes, source reorder, filter change, and large offsets.
   Give rational expected values where possible and explicit tolerances for floating-point results.
   Compare against a credible independent method, not only the implementation under test.
   Name real files, settings/API/text changes, persistence, docs page, runnable example, tests, and the main risk per milestone.
   Each milestone must ship a useful complete flow, with its docs and example in that same milestone.
   Include pointer and keyboard acceptance at 1280/783/390px and a measured performance probe before caches or limits.

## Constraints

Keep the existing React and TypeScript library and demo in React. Use pnpm.
Keep the package storage-neutral and use shared parsing and category helpers.
Prefer direct control flow and a small number of important tests.
Do not add a generic statistics framework, implicit key coercion, model selection, inference engine, or backend service.
Do not add backward-version coexistence, enterprise layers, or new paid services.
Plain chart clicks select; Alt-click or Alt-Enter traces. No mark-level Inspect buttons.
Keep controls compact, scope visible, and keyboard access complete.
No implementation, commit, merge, or deployment is requested from Pro.

## Evidence and deliverables

Cite repository paths and symbols for code claims and current primary sources for external claims.
Separate facts, inferences, and proposals. Identify uncertainty and rejected choices.
Return two downloadable Markdown files, optionally in one ZIP:

1. methods-report.md: lead with what to build, then answer all questions, derivations, fixtures, sources, and open decisions.
2. implementation-plan.md: ordered shippable milestones with files, exact tests, docs, example, acceptance, and main risks.

Include stable PG-01, PG-02, etc. recommendations with Build, Explore, Defer, or Avoid dispositions and one-line reasons.
Build means include in the proposed plan; Codex and Byron still review it.
Do not produce manifests, hashes, source archives, or integrity receipts as report content.
If file tools fail, provide full content inline. Link each file in the final message.
End with access status, files read, checks performed versus proposals, deliverable links, and open questions.
