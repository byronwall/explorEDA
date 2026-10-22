# Histogram boundaries for engineering decisions

https://github.com/byronwall/explorEDA

Source baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510` on main. Codex integration branch: `codex/engineering-bins-research-2026-10-21`.

## Primary mission

Decide whether explorEDA needs authored histogram boundaries for repeated engineering threshold decisions.
Compare current count-based bins, current ECDF/range filters, upstream category preparation, width plus origin, and explicit edges.
Choose the smallest useful direction. Keeping current behavior is a valid outcome.

Act as a candid product and analytical-method researcher. This develops catalogue idea R008 from PR463.
No named analyst demand or verified runtime defect is supplied. Do not turn a plausible engineering task into established demand.
The decision could keep threshold work in existing controls or extend the chart's saved analytical contract.

## Access preflight

Use the attached selected-source packet as an authorized read-only fallback.
Its header identifies baseline, entry paths, byte counts and SHA-256. It is not a runnable checkout.
Two local prompt/queue additions and two historical documents at pinned commits are identified separately.
Historical relative links belong to their original folders; use pinned canonical GitHub URLs.
GO only when repository, baseline and essential source are identifiable. Authenticate packet entry hashes and state limits.
NO-GO if decisive source is absent from both packet and repository. Ask for the smallest missing dependency.
No repository mutation is assigned. If artifact tools fail, return the complete documents inline.

## Current repository evidence

- `numericBins` uses full-source extents, requested count clamped to 2–100, and integer-centered spacing for integer data.
- `BarChartSettingsPanel` exposes a 2–50 bin count control; no width/origin/edge setting exists in `BarChartSettings`.
- `binRows` in `barPlan.ts` constructs half-open membership; the final bin is closed. Full-source values set domains.
- `snapRangeToBins` aligns a brush or existing range with edges. Bin count changes can move saved selection bounds.
- `BarChart` click and brush paths store min/max ranges. `applyFilter` treats both numeric endpoints as inclusive.
  Examine exact-edge consistency across bar count, trace contributors and linked rows. Source reading is not runtime proof.
  Keep any current endpoint repair separate from approving new bin controls.
- ECDF already has at-or-below/at-or-above shares, inclusive range counts, grouped denominators, threshold selection and source tracing.
- `population-baselines` explicitly says distribution refinements do not depend on named reference populations.
  Byron's low interest in named baselines is neither approval nor rejection of custom bins.
- Existing bar/ecdf docs and examples are delivered. Do not propose their initial creation.
- PR463 supplies candidates, not implementation approval. PR462 owns Mosaic; PR454 owns time-series axes.
  PR451/452/455–461 completed related broad surveys. Local trust remains the first local proof.

## Ranked questions

1. Which concrete engineering decision, if any, defeats the existing ECDF, range filters or upstream categorical bands?
   Distinguish specification limits from distribution shape, process control, tolerance intervals and statistical inference.
   Define one repeated task and a rejection comparator. Do not infer demand from a synthetic task.
2. Recover the current bin, selection and contributor contract. Cite exact symbols for automatic extent, integer treatment,
   half-open/final-closed membership, range endpoint inclusion, own/peer/local/facet scope, invalid values, source replacement,
   bin-count edits and restoration. Produce a contract matrix and identify unknowns.
   Separate an existing consistency proof from a proposed capability. Do not call source-predicted behavior an executed defect.
3. Compare five alternatives: no change plus a focused lesson; current filters/ECDF; upstream authored categories;
   width plus origin; explicit edge list. Score decision accuracy, setup effort, repeatability, row inspection and maintenance.
   Resolve underflow/overflow, empty bands, endpoint ties, irregular widths, count versus density, new source extremes,
   units and representable numeric boundaries. Do not automatically ship every alternative.
4. Use at least four current primary sources from products or statistical references.
   Good candidates include Observable Plot/D3, Vega-Lite, NumPy, R and NIST engineering guidance.
   Verify width/origin or explicit-break contracts, endpoint conventions and unequal-bin interpretation.
   Cite direct URLs, retrieval dates and relevant limits. Popularity and competitor parity do not prove product value.
5. Supply the smallest discriminating fixture with exact row IDs, repeated edge values, fractional and integer cases,
   two specification limits, invalid/missing entries and an extreme observation. Independently work expected counts,
   contributors, threshold shares, out-of-range counts and unequal-width heights. Include peer filtering, an own brush,
   changing bin count, and source replacement. Separate arithmetic checks from proposed source/runtime/browser proofs.
6. Recommend one direction with stable IDs EB01 onward. Give benefit, cost, confidence, falsification and GO/NO-GO gates.
   A new control needs a task that current comparators fail and a coherent selection/restore contract.
   If a lesson/example or capability is warranted, pair its exact docs section and runnable example in the same milestone.
   Keep implementation proposed. Avoid a general histogram editor, named baseline system or quality-control platform.

## Reading route

Read rules, README, package manifest, agent guide and coding standards. Then population-baselines and current-analysis-trust.
Read R008 at its supplied historical ref as a candidate. Inspect bins/tests, bar plan/settings/rendering/trace/selection tests,
applyFilter/FilterTypes, live/all-data helpers and provider. Compare ECDF plan/definition/rendering/tests and current docs.
The packet includes actual files along this route. For extra source use canonical pinned GitHub paths.
Known Codex checks: `pnpm --filter exploreda exec vitest run src/components/charts/BarChart/bins.test.ts src/components/charts/BarChart/barPlan.test.ts src/components/charts/Ecdf/ecdfPlan.test.ts`; `pnpm --filter exploreda check-types`; `pnpm check`; `pnpm check:pr`.
Do not invent executed results or assume missing packet dependencies are absent in the repository.

## Evidence and scope

Mark source facts, external facts, inference and proposals separately. Cite paths and symbols for repository claims.
Use current primary sources for decisive external claims. State access gaps and conflicting evidence.
Every substantive recommendation needs task, evidence, alternatives, benefit, maintenance cost, confidence and a falsifiable proof.
Research-package arithmetic cannot establish browser behavior. Unknown demand stays unknown.

Research only. No application changes, repository writes, merge, deployment, paid services or unrelated account access.
Codex owns local integration and review PR. Keep React/TypeScript and pnpm. No worktree or compatibility framework.
No automatic defect labels, imputation, statistical process-control suite, weighted histogram platform or general bin editor.
Do not silently change inclusive range semantics across all charts. Explain that cost if it becomes necessary.

## Deliverable contract

Produce four complete UTF-8 Markdown originals: `decision-report.md`, `evidence-and-comparisons.md`, `proof-plan.md`, `research-queue.md`.
Give a direct download link to each. Also provide `engineering-bins-research.zip` with exactly those four plus `manifest.json`.
Manifest lists each report's byte count and SHA-256. Publish ZIP and manifest SHA-256 in the final message.
Use simple relative filenames, no symlinks or programs. No ChatGPT Library upload is needed.

Decision report: standalone decision, current contract matrix, ranked findings with EB IDs, alternatives, costs, open choices and gates.
Evidence report: source checks, four or more primary comparisons, access limits, explicit facts versus inference.
Proof plan: concrete fixture and independent expected results; separate arithmetic/source/runtime/browser checks;
conditional docs/example scope, acceptance and rejection conditions. Mark all unexecuted checks unrun.
Queue: revise the attached queue with findings; retain local trust first; reference PR463 IDs and completed research.
Avoid another broad list and do not promote completed topics without new task evidence.

Final response: decision, three decisive findings, recommendation count, access/execution limits, all five links, inventory and hashes.
If files cannot be created, supply four complete inline documents. Do not claim nonexistent downloads.
A recommendation does not authorize product implementation. Codex independently reviews, collects, reconciles, validates and opens a review PR.
