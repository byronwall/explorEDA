# Relationship-discovery recommendations

Research date: 2026-10-19. Repository: `https://github.com/byronwall/explorEDA`. Declared baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. Intended later integration branch: `codex/relationship-discovery-research-2026-10-19`.

## Decision and evidence status

**Keep the delivered mixed-type Scatter Matrix. Use a short docs/example proof before adding UI. Investigate pair-to-existing-Scatter navigation only after a real author task reveals repeated continuation friction. Defer a separate coefficient view and same-method ranking; reject a universal mixed-type score.**

This is research direction, not implementation approval. All 25 requested repository excerpts and both local research additions were fully read. GitHub did not expose the exact tree/raw source; the authorized packet is the source basis. Owner/baseline labels match, but no upstream per-file SHA-256 manifest was included despite the prompt's statement. Computed receipt hashes do not independently authenticate the baseline. Missing integration sources and absent runtime evidence block implementation claims, not this explicitly authorized source-based comparison.

**Completed evidence:** source inspection, current primary-source retrieval/version checks, and independent synthetic arithmetic. **Proposed only:** author tasks, application fixture execution, browser/keyboard checks, package tests, performance measurement, selection/export/undo/reopen, and all product changes. No repository, branch, PR, merge, or deployment was changed.

Seven recommendations follow. Costs are relative scope/maintenance judgments, not measured effort or delivery estimates. Confidence concerns the stated direction; none implies demonstrated demand. Exact repository paths below refer to the supplied snapshot.

## RD-01 — Preserve delivered strengths and reconcile the historical premise

- **Disposition:** Adopt as research direction; later source-truth documentation edits are for Codex review.
- **Problem:** Historical relationship-discovery language can steer work toward a matrix that already exists. The initiative map mixes a stale negative capability statement with newer matrix acknowledgements.
- **Evidence:** `packages/explorEDA/src/components/charts/ScatterMatrix/definition.ts` declares numeric/date, mixed, and categorical cell choices; `matrixPlan.ts` supplies planning/group correlations; `matrixTrace.ts` and `MatrixTraceBody.tsx` supply row/cell explanations. `docs/intent/relationship-discovery/initiative-map.json` line 229 says there is no relationship matrix, while line 11 and later history recognize current correlation cells. The brief itself partly reflects the delivered matrix.
- **Recommended action:** describe the current matrix and its available controls accurately. Preserve historical evidence as historical, and replace the unqualified absent-matrix premise in the active decision. State that finding a pair, interpreting its population, inspecting its shape, and opening detail are separate possible residual tasks.
- **Cost:** Low documentation/reconciliation cost. No rendering, statistical, or runtime work is required to record the source finding. Review active statements rather than rewriting history wholesale.
- **API impact:** None. Keep React/TypeScript, current chart identity, and existing saved settings.
- **Confidence:** High that a matrix rebuild duplicates source-supported capability; no confidence claim about actual user satisfaction follows.
- **Disproof / rejection gate:** reopen the source conclusion if Codex's exact baseline differs or the author identifies a task the current controls cannot support. The absence of a type literally named `relationship-matrix` is not evidence that pairwise matrix exploration is absent.
- **Destination:** `docs/intent/relationship-discovery/intent-brief.md` and `initiative-map.json`, with this research under `docs/research/relationship-discovery-2026-10-19/`. No edits to those repository files were made here.

Current strengths to retain include points and summaries in opposite triangles, field distributions, mixed-type boxes/tiles/shares, categorical coloring, source-wide visual references, and source tracing. The UI supports two through ten fields; the supplied validator does not independently enforce the upper limit. The twelve-category-band assertion includes `Other`; its imported band algorithm is absent. Those qualifications belong in engineering evidence, not a claim that the delivered controls are broken.

## RD-02 — Give current controls one fair teaching example

- **Disposition:** Adopt the proposed proof; implementation of the docs/example remains for local integration.
- **Problem:** The supplied matrix docs page explains cell forms and Color in 13 lines but does not teach choosing a pair, tracing its population, comparing groups, or continuing in Scatter. Missing instruction can be mistaken for missing capability.
- **Evidence:** `apps/demo/src/docs/pages/scatter-matrix.mdx`; `ScatterMatrixSettingsPanel.tsx` triangle/diagonal controls; `ScatterMatrix.tsx` trace/selection handling; `apps/demo/src/docs/pages/scatter.mdx` existing detailed-analysis controls. The independent 12-row fixture gives an exact line, zero-coefficient U shape, grouped sign reversal, sparse pairs, and degeneracy cases. Fixture values establish arithmetic only.
- **Recommended action:** add one short workflow to the existing page and one focused live example. Start with six fields and retain the point triangle while explaining shape. For a separate coefficient-readability task, try upper numeric **Corr**, lower numeric **Blank**, and continuous diagonal **Name**. Continue by manually setting X/Y in an existing Scatter before deciding a new view is needed.
- **Cost:** Low-to-moderate demo/docs work: one fixture/example, short page sections, registry/coverage entries, and the existing docs checks. Do not create a new chart type or a general testing framework.
- **API impact:** None expected. Reuse existing chart settings and the live-example system. The exact example registry is not supplied and must be inspected locally before writing.
- **Confidence:** High that the documentation omits these task steps; moderate that teaching may resolve friction; unconfirmed author value.
- **Disproof / rejection gate:** if the author cannot name a real task, keep the seed dormant. If one lesson lets the author complete the task comfortably, stop UI expansion. If difficulty remains, record whether it is pair choice, population, shape, or opening; do not assume ranking is the remedy.
- **Destination:** primarily `apps/demo/src/docs/pages/scatter-matrix.mdx`; a continuation link/necessary clarification in `scatter.mdx`; `trace.mdx` only where a matrix-specific clarification is needed. Proposed live example ID `relationship-shapes`, registered through the actual demo/`apps/demo/src/docs/live/examples.ts` workflow after local inspection. Docs and the example belong in the same milestone.

The author comparator and exact expected record sets are fully specified in `proof-plan.md`. No author has completed that comparator in this research.

## RD-03 — Resolve population and availability semantics before promising continuity

- **Disposition:** Investigate as a prerequisite to any handoff; no automatic numerical changes.
- **Problem:** A coefficient is attached to a pair and its contributors, not merely to two field names. A visually similar destination can legitimately describe different rows or use a different availability convention.
- **Evidence:** `ScatterMatrix/matrixPlan.ts` separates `allIds`, `liveIds`, and own selection; `withSelectedBars` updates overlays without recomputing total r/n. `matrixTrace.ts:resolveMatrixTrace` reports independently missing fields. `ScatterPlot/pairedSummary.ts:pairedStats` uses exclusive X-first/Y-second exclusion buckets and accepts two nonconstant pairs; matrix `pearson` requires three. Matrix date values use `timestampOf`; paired statistics call `finiteNumber`.
- **Recommended action:** write and test a narrow population contract only if a handoff task is demonstrated. Name source rows, rows after other filters/facets, selected rows, pair contributors, group membership, exclusions, and viewing bounds. Treat the n=2 difference as a deliberate availability decision to resolve, not a bug presumed by this research. Do not require equal displays until parsing and exact row sets agree.
- **Cost:** Moderate, uncertainty-driven audit and focused verification. Provider, live-data hooks, Scatter plan/fit/axis preprocessing, shared validation, and generic trace-to-Rows integration are absent. Costs become larger if solving the author task requires new filter or navigation infrastructure; that is a stop gate.
- **API impact:** None approved. Prefer clarified existing semantics. Do not add a general population object or metrics API before proving the task.
- **Confidence:** High in the source-level convention differences. Moderate in the handoff population risk, which remains an integration inference. No runtime defect is claimed.
- **Disproof / rejection gate:** if local existing integration already preserves the intended population and the author understands the current labels, retain it. If a restricted prototype cannot represent the author's intended scope without hidden changes, reject it instead of loosening the contract.
- **Destination:** first record the result in the relationship intent/proof record. Inspect `packages/explorEDA/src/components/charts/useGetLiveData.ts`, `packages/explorEDA/src/providers/DataLayerProvider.tsx`, and the actual Scatter plan/fit/axis and trace integration. Any approved local repair belongs at the narrow source of disagreement, with its own source/runtime evidence.

The sparse fixture has 12 eligible rows, eight finite X values, six finite Y values, and four exact paired contributors. Matrix field exclusions are `[4,6]`; Scatter priority exclusions are `[4,4]`. This example makes the distinction testable without defining a new statistics framework. Group-specific valid-pair counts and contributor ID sets are proof requirements; the supplied matrix group trace does not expose those counts or an explicit pair-ID list.

## RD-04 — Investigate an explicit pair-to-Scatter action only for demonstrated opening friction

- **Disposition:** Investigate conditionally; no UI implementation selected.
- **Problem:** Once the right pair is found, repeatedly reconstructing axes in detailed Scatter might cost effort or introduce wrong-field/context errors. Neither recurrence nor disruptive effort has been observed here.
- **Evidence:** `ScatterMatrix.tsx:startDrag` treats a correlation primary press as empty space; Alt-primary traces it. `setFilters` delegates to `matrixPlan.ts:replaceSelection`, clearing displayed-field and `__ID` filters while preserving others. The renderer contains no pair-opening callback. `ScatterPlot/definition.ts` already has the X/Y settings needed for detail. Orange's official documented pair/data transfer is a useful source-only interaction exemplar; it is not demand evidence. [P1]
- **Recommended action:** after RD-02, investigate one explicitly named navigation action only if repeated author transitions show a pair already identified but disruptive detail setup. Begin with true numeric/numeric pairs, no source-owned filters/facet scope, and no preexisting target filters. X comes from the cell column; Y from its row. Preserve the matrix and current trace/selection gestures. Let the real task determine whether creating or reusing an existing destination is needed; do not design a general routing API now.
- **Cost:** Moderate/uncertain despite a small visible action. Creation/layout, target reuse, color, filters, parent event propagation, history, persistence, accessibility, and return behavior need local inspection. A broad new framework is outside this recommendation.
- **API impact:** Aim to reuse existing chart creation and settings without public API additions. This is an objective, not a verified implementation plan. No new persisted setting or callback contract is specified.
- **Confidence:** High that the supplied renderer lacks the action; low that adding it has incremental value; moderate feasibility until missing integrations are read.
- **Disproof / rejection gate:** stop if current manual setup is acceptable, no detailed continuation is needed, or the author remains blocked at pair choice instead. For a later reviewable prototype, require zero field/population/color errors and at least two fewer median opening actions across three matched transitions, plus the author's intention to use it on a named task. These are proposed decision gates, not test results. Unsupported selected/faceted contexts must not be silently cleared to make the prototype pass.
- **Destination:** relationship-discovery intent and the smallest existing matrix/navigation integration point that Codex verifies locally. Include matrix docs and the same worked example if an action is implemented. The target local research branch is for Codex's integration/review PR, not an implementation authorization from this report.

Ordinary coefficient presses, Alt-click, Alt+Enter, Escape, and any new keyboard invocation must all be checked. The supplied pointer branches do not stop propagation, so the apparent smallness of a callback is not sufficient integration evidence.

## RD-05 — Defer a separate compact numeric coefficient view

- **Disposition:** Defer.
- **Problem:** Exact coefficient/count scanning could become awkward in small cells, but that residual has not been demonstrated. A second grid can duplicate an existing coefficient-focused configuration while losing point shape.
- **Evidence:** current triangle and diagonal settings already support a numeric coefficient-focused matrix. `pairedSummary.ts` offers detailed pair statistics; `ScatterMatrix.tsx` and `MatrixTraceBody.tsx` already render/read numeric summaries. Current source has no evidence of an author failing this workflow.
- **Recommended action:** do not register another chart now. Reopen only if a repeated real task fails the current numeric configuration and a compact alternative materially improves readability or pair selection. Bound any later proof to an explicit author-chosen numeric shortlist, one stated method, n/eligibility labels, and direct point inspection. Require separate evidence before increasing the current field scope.
- **Cost:** Medium-to-high relative to docs or a handoff: another surface, unavailable states, interaction, grouping/populations, registry/settings validation, persistence, docs, example, and long-term maintenance. Existing statistical helpers do not remove those obligations.
- **API impact:** A registered view would add a chart/settings/persistence contract; an internal view still has product and validation costs. Neither is designed or approved here.
- **Confidence:** Moderate-to-high that deferral is appropriate without demand. Low confidence in any predicted usability gain or workload capacity.
- **Disproof / rejection gate:** adopt no new view if the existing configuration plus trace solves the real task. Reopen only with a recorded scanning failure and a compact alternative that wins a matched task without hiding weak/nonlinear or differently populated pairs.
- **Destination:** deferred seed in `docs/intent/relationship-discovery/initiative-map.json` and `research-queue.md`. Do not create a chart registration, implementation milestone, or new docs target in this research.

## RD-06 — Reject a universal mixed-score ranking; keep bounded methods conditional

- **Disposition:** Reject universal mixed-type ranking. Same-method bounded numeric ranking and an optional Spearman method remain deferred alternatives, not approved work.
- **Problem:** A single ordered list can imply comparable usefulness across linear correlation, rank correlation, categorical association, and category/numeric variation. Comparable numerical ranges do not establish that meaning. Scanning many pairs also invites confusing a selected descriptive extreme with confirmation.
- **Evidence:** independently computed fixture: U-shaped `x × curve` has both Pearson and Spearman zero; pooled/group reversal changes sign; one high-leverage record raises Pearson to about 0.939; unique-ID categories can give raw eta squared or Cramér's V equal to one. Primary method definitions distinguish these quantities. [P2–P5] The existing mixed cells already show shape, boxes, counts, and shares without pretending they are one scale.
- **Recommended action:** keep descriptive visual exploration first. If a future real task justifies a numeric ranking, specify its purpose, chosen field set, one method, row scope, tie/undefined handling, counts, and direct shape inspection. Consider Spearman only for a demonstrated monotonic nonlinear task; it does not solve a U-shaped case. Reject an automatic significance score, causal ranking, AI discovery agent, or combined unlabeled relationship strength. Do not demand a complete method catalogue.
- **Cost:** High for honest mixed discovery: type-specific semantics, cardinality effects, population policies, repeated-comparison interpretation, performance, and a wider saved/API contract. This cost has no demonstrated local return.
- **API impact:** None now. No association framework, background rank service, public score API, significance toggle, or broad method grammar.
- **Confidence:** High against an unqualified cross-method ranking; moderate for deferring a bounded same-method list; no demand or benchmark claim.
- **Disproof / rejection gate:** a named objective and repeated author scanning failure could reopen a specific homogeneous ranking. They cannot make arbitrary cross-method scores comparable. Any proposed common ordering would need an explicit common target/utility and separate validation, outside this mission; no such evidence exists here.
- **Destination:** explicit rejected expansion in the relationship decision/intent; optional bounded ranking and Spearman stay dormant in the queue until their separate evidence triggers occur.

Cramér's V could describe a nominal/nominal table, and eta squared could describe a declared category/numeric comparison. Evaluating their limitations here does not propose implementing them. No inference, imputation, warehouse adapter, statistical notebook, or time-series-axes project is added.

## RD-07 — Preserve local trust proof and convert the queue from surveys to evidence

- **Disposition:** Adopt the queue ordering and evidence gates.
- **Problem:** More external synthesis can repeatedly postpone the local tasks that determine whether current behavior is trustworthy and useful.
- **Evidence:** `docs/intent/current-analysis-trust/intent-brief.md` and the supplied `docs/research/relationship-discovery-2026-10-19/research-queue.md` put category selection across bar/card/export first, followed by undo/redo/reopen. The prompt/queue says preparation PR451, freshness PR452, and missingness PR455 completed research cycles; PR454 owns time-series axes. These are supplied status facts, not fresh GitHub PR observations.
- **Recommended action:** leave the local trust journey first and stop at its first disagreement. Then run the docs/current-controls relationship comparator if an author task exists. Keep missingness, preparation, freshness/identity, reusable rates, and parameterized detail as narrowly named proof seeds. Do not repeat their broad surveys or treat a fixture as demand.
- **Cost:** Low queue maintenance; local author/browser effort remains unperformed and unestimated. Any discovered repair gets its own bounded evidence and scope.
- **API impact:** None from this research. Reusable rates still require one measure needed in two consumers; parameterized overview/detail still needs filter and target-reuse choices before an API.
- **Confidence:** High in preserving the supplied ownership/priority constraints. Outcome confidence for the unrun proofs remains unknown.
- **Disproof / rejection gate:** only new explicit priority or concrete local evidence should change ordering. A browser/performance block should be recorded with the smallest unblock, not converted into a fresh feature survey. Relationship navigation must not become a workaround for a broken underlying trust journey.
- **Destination:** the standalone `research-queue.md` for Codex's later integration, retaining the existing owning intents and completed-research statuses. No local proof was performed by this research.

## Compact primary-source references

All accessed **2026-10-19**; all source-only. These links support the limited method/interaction claims above. No comparator version or UI is treated as tested.

- **P1:** Orange, [Correlations](https://orangedatamining.com/widget-catalog/unsupervised/correlations/), current unversioned official catalogue. Explicit data plus selected-pair transfer to Scatter is documented.
- **P2:** SciPy v1.18.0 manual, [pearsonr](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html).
- **P3:** SciPy v1.18.0 manual, [spearmanr](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html).
- **P4:** SciPy v1.18.0 manual, [contingency.association](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.contingency.association.html).
- **P5:** JMP 19.2, [Effect Tests](https://www.jmp.com/support/help/en/19.2/jmp/effect-tests.shtml), published 2026-01-13.

`relationship-discovery-decision.md` contains the complete source inventory, four-plus-route scoring, comparator version checks, statistical reasoning, and research GO/implementation NO-GO distinctions. `proof-plan.md` contains all synthetic values and proposed success/stop gates. These recommendations remain independently readable without treating either companion file as proof that product work ran.
