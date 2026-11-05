---
origin: repo-reading-brief
source_editions: [2026-10-24]
topic_id: exploreda-vmc-diagnostic-compatibility
artifact_type: assistant-generated-research
activity_ranking: excluded
status: proposed-investigation
reviewed_at: 2026-10-24
repository_baseline: 95832bd473884aeae23453af0888b4ca5187820d
---

# VMC evidence and diagnostic compatibility for held-fit comparisons

Use VMC as a source-grounded review lens for [PR #520](https://github.com/byronwall/explorEDA/pull/520), not a replacement plan. The contribution here is a specification table and unsupported-composition matrix for a future implementing agent. No application behavior, model registry, R integration or Bayesian machinery is proposed for adoption. Assistant-generated research documents and PR activity are excluded from future activity ranking; independent later implementation/evaluation is a separate signal.

## Source synthesis and limits

Origin: [Repo Reading Brief, October 24, 2026](https://chatgpt.com/space/page_07e288cdd0fc8191abed3e556b747d4a). Primary source: Guo, Kale, Kay and Hullman, [VMC: A Grammar for Visualizing Statistical Model Checks](https://arxiv.org/abs/2408.16702), preprint submitted 2024-08-29; [author-hosted paper](https://mucollective.northwestern.edu/files/2024-VMC.pdf). Both were accessed 2026-10-24. Sections 4–5 separate model-generated quantities, observed-data transformations, visual representations and comparative layout. Section 7 reports 27 reproduced examples and an average 30% fewer lines of code than ggplot2 in the authors' API comparison; the study includes three expert modelers. These support expressiveness and authoring observations, not improved decision quality or efficacy in explorEDA. VMC's conditional line/ribbon examples require a conditioning variable; aggregation changes what observations a mark represents. We use those distinctions as review criteria, not as a requirement to implement the grammar.

The remaining tables and probes are repository-specific analysis and proposals. No VMC package, comparative UI, diagnostic session or predictive-validation experiment was run. The brief is secondary evidence; the paper's examples do not prove this product's correctness, demand or performance.

## What already exists in the proposal

Reviewed #520's complete diff at head `addcab67f97452eb948f9de15180c4c65254443b`, base `95832bd473884aeae23453af0888b4ca5187820d`, on 2026-10-24. Its [implementation plan at that head](https://github.com/byronwall/explorEDA/blob/addcab67f97452eb948f9de15180c4c65254443b/docs/intent/regression-diagnostics/implementation-plan.md) is the owning contract. It is proposed, not shipped. Recheck its status before acting.

| Concern       | Existing #520 coverage                                                                  | Added review question here                                                                    |
| ------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Held identity | Ordered F, local S, copied results, model/options, semantic target and source nonce     | Does every displayed diagnostic specify which captured quantity and population it represents? |
| Lifecycle     | Redraw preserves F; Recompute captures anew; nonce change disables source actions       | Is the same lifecycle visible and testable after a representation change?                     |
| Alternatives  | Same-F alternatives; explicit F−S OLS training evaluated on original F; no winners      | Do comparative marks retain common units, scales and evaluation rows?                         |
| Views         | Residual-versus-X/fitted, Q–Q, spread and influence; exact records and numerical guards | Which quantity/transform/mark combinations are unsupported or lose record-level support?      |

Do not refile these existing requirements as newly discovered gaps. Main already exposes ordered `ScatterFit.sourceIds` in `packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts` and uses `outcome.predict(x)` for drawing. The main source does not implement the proposed diagnostic session. Reuse the [agent guide](../../agent-guide.md), [research direction](../DIRECTION.md) and existing [regression-conditioning review](../regression-conditioning-2026-10-22/summary.md). This note adds no second implementation plan or catalogue ranking.

## Map VMC's four parts to the owning contract

| VMC part                      | Mapping to #520                                                                                          | Compatibility assertion proposed for review                                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model quantities              | Captured predictor and observed-minus-predicted residuals on F; explicit alternative method/training set | Name raw residual, standardized residual, prediction or uncertainty distribution precisely. A point predictor is not a predictive distribution; an OLS influence formula does not become valid for LOESS. |
| Observed-data transformations | Raw X/Y; sorting residuals for Q–Q; optional standardization/spread transformations                      | Preserve units, finite-value exclusions, ties and contributor IDs. A transform may reduce drawable m without shrinking F.                                                                                 |
| Representation                | Initial point views; Q–Q points and reference line; later bounded comparisons                            | Check required coordinates and support. A conditional line/ribbon needs a named ordered conditioning variable and a defined interval meaning; no uncertainty ribbon may be invented from point residuals. |
| Comparative layout            | One active alternative beside the baseline; overlays on shared observed X support                        | Match quantity, units, scales and evaluation population. Keep training membership distinct from evaluation membership. A layout must not imply predictive validation or a best model.                     |

These are local assertions derived from the paper's decomposition and #520's invariants. They are not claims that VMC guarantees valid compositions automatically.

## Minimal model-check specification table

Fill one row per supported view before building it. The columns below are an investigation worksheet, not a generic runtime schema. F, S and lifecycle semantics remain defined only by #520. Start with two views.

| Item                     | Residual versus X                                                                                         | Normal Q–Q of raw residuals                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Question                 | Does error vary with the captured predictor X?                                                            | How does the defined residual distribution depart from a normal reference?                      |
| Fit/model identity       | Held target, method/options, fields/units, partition and capture identity                                 | Exactly the same capture                                                                        |
| Training IDs             | Ordered F for baseline; separately named F−S only in omission scenario                                    | Same training declaration; switching view never refits                                          |
| Evaluation IDs           | Original F, with explicit reasons for undrawable coordinates                                              | Original F; sort defined residuals only and report m of n                                       |
| Quantity/units           | X in X units; e = Y − prediction in Y units                                                               | Theoretical normal quantile dimensionless; ordered e in Y units                                 |
| Transform                | No aggregation; raw linear diagnostic axes                                                                | #520's midpoint probabilities and type-7 quartile reference line; source-order tie handling     |
| Rendering requirements   | Zero reference, exact row selection including coincident points; label scope                              | Named reference/distribution, units, m/n, ties/IDs and no normality verdict badge               |
| Unsupported combinations | Unnamed conditioning variable; standardized label on raw e; implied uncertainty ribbon                    | Arbitrary X on theoretical axis; incompatible standardization; rank loss/undefined scale hidden |
| Lifecycle events         | Selection/view switch redraw; peer change holds; nonce invalidates actions; explicit Recompute recaptures | Identical event contract; preserve S by ID, not by sorted position                              |
| Proof fixture            | #520 curvature fixture plus duplicate-X and influence cases                                               | Same capture, tied residuals and missing-coordinate case; inspect exact contributors            |

For future alternatives, append model identity and separate training/evaluation IDs per candidate. A comparison cell must say whether errors refer to training F−S or evaluation F. No new persistence or cache architecture follows from this table.

## Unsupported-composition review matrix

| Proposed composition                                                                            | Disposition and proof obligation                                                                                                                                            |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw residuals and standardized residuals on one unlabeled scale                                 | Unsupported: units differ. Use explicitly named views/scales and preserve #520's numerical unavailability reasons.                                                          |
| Conditional line/ribbon without X/order or interval definition                                  | Unsupported: neither conditioning nor uncertainty semantics is specified. Keep the initial point view.                                                                      |
| Aggregated residual bins/density used as if each mark were one record                           | Unsupported as record-level selection. Aggregation loses per-record support unless exact contributor sets and selection meaning are defined. Defer from the two-view probe. |
| Baseline and alternative shown on independent auto-scaled axes as a direct magnitude comparison | Unsupported without an explicit scale distinction; prefer common scale domains/units over the same evaluation F. Show support and extrapolation separately.                 |
| OLS standardized/influence quantities applied to LOESS                                          | Unsupported; follow #520's method-specific definitions and guards.                                                                                                          |
| Q–Q/reference line presented as predictive validation or a model winner                         | Unsupported interpretation. These are descriptive model checks; predictive assessment needs a separate data-splitting and estimand design.                                  |
| F−S training compared with baseline-F training error as “improvement”                           | Unsupported performance claim. Evaluate both on original F, label training counts/errors separately, and call it sensitivity.                                               |
| Selected residuals ranked or redrawn from newly filtered rows while displaying the old fit      | Unsupported identity mix. Redraw from captured results; use #520's Recompute boundary.                                                                                      |

## Two proposed research probes

**Probe 1: same-capture view compatibility.** Begin with #520's five-row curvature fixture, retaining its exact expected predictor/residual values rather than inventing a competing oracle. Open residual-versus-X and Q–Q from the same captured F. Add tied residual and duplicate-coordinate variants. Select an influential row, switch views, change a peer filter, change the source nonce, then explicitly Recompute. Use the owning plan's Session changes and M1/M3 fixture invariants as the expected results: selection/view changes preserve fit/results; peer changes hold the reference; nonce change clears S and blocks source actions; Recompute creates one fresh capture. Record capture identity, ordered training/evaluation IDs, quantity/units, plotted m, selected contributor IDs and disabled actions at each step. Compare exact IDs before/after Q–Q sorting. Test any unsupported cell by a visible unavailable explanation or prevented composition, not a silent fallback.

**Probe 2: omission training and original-F evaluation.** Reuse #520's influence fixture and OLS omission oracle. Train the alternative on F−S, retain original F for evaluation and explicitly label counts, original/omitted training membership, residual definition and scale domains. Compare baseline/alternative residuals with the same Y units and display scales; mark outside-training-support predictions as extrapolated per #520. Assert that omitted rows remain evaluation records and that changing S makes the comparison pending until explicit Run. This is a sensitivity comparison on reused data, not held-out predictive validation. Do not infer a winner from lower training or evaluation error on F.

The later agent should return the completed specification rows, compatibility decisions, exact event/ID assertions, a small set of counterexample screenshots and unresolved numerical/rendering limits. Implementing sessions and UI remains #520's work, requiring its own tests, docs and runnable examples; this PR authorizes no application change.

## Investigation questions and limitations

Can every mark name its quantity, units, training rows and evaluation rows? Can selection survive Q–Q sorting and ties without remapping to a different record? Does a view switch retain the captured model when live filters change? Can different coordinate availability be explained without changing F? Are common scales actually common after a unit or model change? Where would aggregation require contributor semantics the initial views avoid?

This review establishes useful questions and unsupported combinations, not evidence that the proposed UI passes them. The paper's R/Bayesian demonstrations do not transfer automatically to frequentist point-fit diagnostics. Neither the literature nor this source review establishes predictive validity, user decision quality, acceptable performance budgets or local product demand. Documentation checks and CI status belong in the PR; all experiment outcomes above remain proposed.
