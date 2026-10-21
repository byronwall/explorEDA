# Research choices and continuing queue

**Updated:** 2026-10-21, America/Indianapolis.  
**Mission completed:** R008 — Histogram boundaries that match an engineering decision.  
**Source baseline:** `9b16d78e3ed0742ed4d5858c1939fec9e758b510`.  
**Disposition:** Retain current controls; defer authored histogram boundaries. Four recommendations, **EB01–EB04**. No implementation is authorized.

This revises the queue supplied as the packet's local addition at `docs/research/engineering-bins-2026-10-21/research-queue.md` (2,828 bytes; SHA-256 `bdfb4e2b31d96053d7ca8fa7c1d42794bf0a9a2ee87dde78898be82959034267`). It is a new research deliverable; the attached source file was not modified. The previous research-selection scores remain historical judgments, not product demand or approval.

## 1. What this run changes

- **R008 synthesis is complete.** Do not schedule another broad histogram survey. The source, primary comparisons, fixture and reopening conditions are now specified in `decision-report.md`, `evidence-and-comparisons.md` and `proof-plan.md`.
- **Current controls remain the leading route.** For the synthetic inclusive specification task, ECDF/range functions and the exact typed-filter route are source-supported. Upstream categories remain a credible way to represent strict tails and named bands. No supplied named analyst has failed these comparators.
- **A current consistency proof is separate.** Half-open histogram membership and inclusive linked ranges predict an interior-edge disagreement. This is not a runtime defect finding. Begin without local filters or facets, then isolate those intentional scope differences. A confirmed repair would be independent of adding controls.
- **A lesson is conditional.** Existing bar/ECDF pages and live examples are delivered. Update a specific explanation with its runnable example only when a real reader needs it and behavior has been verified.
- **Width/origin and explicit edges remain deferred.** A stable grid needs a source-extension/final-edge contract; irregular bins need explicit height/denominator semantics. Neither provides demand evidence, and neither alone encodes inclusive acceptance at both limits.

**Evidence status:** 34/34 packet entries passed byte-count/SHA-256 checks. The baseline and narrowly needed source were retrieved read-only at pinned refs. Independent fixture arithmetic passed 76 assertions. Application tests, browser checks, state/history/export proofs and named-user comparisons are **UNRUN**. There is no application change, PR, merge or deployment from this research.

## 2. Ranked continuing queue

Original score vectors below are **novelty / product value / evidence gap / Pro fit**, each as supplied in the attached queue. They explain why an investigation was selected. They are not reinterpreted as current feature scores. The updated priority is the order of this table and the gates below it.

| Priority and candidate | Original local score vector | Updated disposition and next action |
| --- | --- | --- |
| **1. Local selection/export/undo/reopen trust** | 3 / 9 / 8 / 3 | **First local proof.** Select one category; reconcile bar, card and exported stable row keys; then undo, redo and reopen. Stop at disagreement. Another survey cannot accept it. |
| **2. R008 — Engineering histogram boundaries** | 8 / 8 / 9 / 9 | **Research complete; controls retained.** After local trust, execute EB02's exact-edge proof. EB03 lesson and EB04 capability comparison are conditional; no new bin control is approved. |
| **3. R018 — Quantile and outlier conventions that agree with the question** | 6 / 7 / 7 / 8 | **Conditional methods candidate.** Identify a concrete decision changed by a convention before more research. Do not promote a convention difference to a user problem by itself. |
| **4. R043 — Reconcile entity-aware aggregation across preparation paths** | 5 / 9 / 8 / 6 | **Local parity proof.** Use preparation PR451 and a declared entity/row grain. Compare actual contributors and totals before another preparation survey. |
| **4. R077 — Selection identity when source rows are replaced** | 5 / 9 / 8 / 4 | **Local identity proof.** Declare durable source keys and one refresh task; distinguish settings reset, restore and replacement. R008's positional `__ID` observation is relevant evidence, not approval of an identity system. |
| **5. R073 — Challenge example conclusions with deliberate counterexamples** | 6 / 8 / 7 / 6 | **One bounded example challenge.** Choose one delivered conclusion and one counterexample. Reuse the existing corpus and computation rather than expanding the gallery. |

The R018/R043/R077/R073 ordering preserves the attached queue's direction without automatically launching those investigations. A newly observed blocked task can change local scheduling; catalogue rank alone cannot.

## 3. R008 handoff by stable recommendation ID

### EB01 — retain current controls and defer authored boundaries

- **Task and evidence:** Inclusive specification review already has source-supported ECDF/range methods; no named failed comparator is supplied.
- **Action:** Keep automatic count bins. For exact limits, test the ECDF selection followed by typed At least/At most bounds in Filters. Avoid promising fixed limits from a histogram-owned range because its effect resnaps to edges.
- **Alternative:** Upstream authored categories for `<L`, `[L,U]`, `>U` and exact tail-row selection. No-work deferral is valid.
- **Benefit/cost:** Avoids an unsupported saved-contract expansion; specialized preparation and discovery cost remain.
- **Confidence/falsification:** High confidence in deferral, unmeasured usability. Reopen only for a named recurring task that fails the existing routes or incurs a burden the owner considers material.

### EB02 — current trust, then the bounded exact-edge proof

- **Task and evidence:** Reconcile a mark's count, its source contributors, its stored predicate and linked records. The 13-row fixture predicts four `[2,4)` contributors but six inclusive `[2,4]` matches; peer B predicts two versus three.
- **Action:** Complete local trust first, then use `proof-plan.md` P1–P4. Record baseline, exact settings, filters and stable `record_key` values. Separate local/facet context from global selected rows.
- **Alternative:** Retain the current behavior if the executed task confirms an understandable, intentional contract. Do not change all numeric filters to exclusive maxima.
- **Benefit/cost:** Resolves present trust without coupling it to a feature; costs a bounded component/provider/browser proof and any independently justified repair.
- **Confidence/falsification:** Source and arithmetic are strong; runtime is unrun. Withdraw an executed-defect hypothesis if the observed path and disclosed contract reconcile the results. Preserve a reproduction if they do not.

### EB03 — conditional focused lesson and paired runnable example

- **Task and evidence:** Teach shape versus supplied limits, inclusive ties, eligible denominators and exact row inspection if an observed reader struggles. Existing docs/examples already cover bar and ECDF basics.
- **Action:** Follow the same-milestone plan in `proof-plan.md`: update bar **Selection and row scope** / **Settings and limits**, ECDF **How it reads** plus proposed **Specification thresholds and exact ties**, and one optional `engineering-thresholds` live example with verified fixture expectations.
- **Alternative:** Make no documentation change if current material is sufficient. Do not add a broad tutorial collection.
- **Benefit/cost:** Potentially removes an error with little product surface; maintaining the example, its counts, docs checks and interaction coverage is still work.
- **Confidence/falsification:** Benefit is unobserved. Reject the milestone if no reader needs it or if the lesson does not fix the observed misunderstanding. Do not use prose to conceal a confirmed consistency problem.

### EB04 — one named-task comparison before a new capability

- **Task and evidence:** A real recurring decision must survive at least two source refreshes and a revisit, using declared units, grain, endpoints, denominator and source keys. API comparisons provide designs, not demand.
- **Action:** Compare the five alternatives against the same output and effort requirement. Require zero membership/denominator errors and either a required output current routes cannot supply or at least one material recurring reconfiguration step removed per refresh within the owner's predeclared time budget.
- **Alternative:** Continue deferral or maintain prepared categories. If regular bands alone justify a capability, evaluate width/origin alone. Explicit edges need a distinct irregular-band requirement.
- **Benefit/cost:** Selects the smallest useful direction; costs owner time and a bounded comparison. No new broad survey or telemetry program.
- **Confidence/falsification:** High confidence in the gate, unknown feature benefit. Reject the extension if existing tools are equally accurate and workable, if numeric boundaries collapse, if tail/density interpretation is unclear, or if selection/restore behavior requires an unbounded editor project.

## 4. Completed research and adjacent ownership remain intact

The following statuses come from the supplied prompt/current queue and historical retention queue. They identify ownership and avoid duplication; this run did not re-audit all those PRs or rerun their checks.

| Existing work | Queue treatment | Reopening condition |
| --- | --- | --- |
| **PR451** preparation and **PR452** freshness | Completed surveys; apply their existing gates, including declared grain and the SQLite preparation route where relevant. | A named task blocked after the existing approach or a local parity/refresh proof. No speculative adapter or shared-transaction project. |
| **PR455–PR460** missingness, relationships, rates, navigation, units and handoff | Completed related surveys; do not create another broad list or infer a missing feature from packet omissions. | New task evidence or a reproducible bounded disagreement. |
| **PR461** retention observation | Completed research. Keep its snapshot/observation and denominator proof gates. | A declared observation-window task that defeats the retained contract. |
| **R011** retention maturity grounded in an observation cutoff | Overlaps completed PR461 work; do not promote it as untouched catalogue novelty. | Use PR461's existing evidence and proof gates first. |
| **PR462** Mosaic | Its existing mission owns Mosaic. | Coordinate with that mission; no duplicate Mosaic research here. |
| **PR454** time-series axes | Its existing mission owns this time-series scope. | Use that intent and a concrete time task; no axis redesign within R008. |
| Named reference populations | Remain low priority and independent of histogram refinements. | A real named-comparison task; Byron's low interest is not a vote on custom bins. |

No named-baseline system, process-control suite, imputation, weighted histogram platform, compatibility framework or general histogram editor is added to this queue.

## 5. Access, stop rules and ownership

**Research access is GO.** The repository, baseline and essential source are identifiable through the authenticated packet plus narrow pinned reads. All current-runtime conclusions remain conditional. If a later decisive dependency is missing from both accessible source and checkout, stop that specific proof and request the exact file or executable fixture; do not assume a missing packet file is missing from the repository.

The next product-facing action is **local validation**, not implementation. Codex owns integration on `codex/engineering-bins-research-2026-10-21`, reconciliation with any newer code, validation and any review PR. This report neither creates that branch nor authorizes a product change. Retain React/TypeScript, pnpm, repository standards and the existing docs/example gate.

Stop conditions are concrete:

1. Stop local trust at disagreement and preserve the state.
2. Stop an endpoint claim if scope, field mode, event targeting or input parsing is not the declared fixture.
3. Stop a feature proposal if no named task defeats the current comparator.
4. Stop a numerical boundary design if values cannot be represented distinctly or closure is ambiguous.
5. Stop a new-control milestone until selection, source replacement, restore, docs and runnable-example scope are reviewable together.

## 6. Source and continuity references

References use canonical pinned URLs for historical material; relative links from those original folders are not reinterpreted as paths beside this report.

- [PR463 — Collect 100 research ideas for explorEDA](https://github.com/byronwall/explorEDA/pull/463). Read-only metadata retrieved 2026-10-21 identifies base `9b16d78e3ed0742ed4d5858c1939fec9e758b510` and head `476a1be3544f93baf7c4732a436163609fbbd02f`; the PR is open and unmerged at retrieval. Its description identifies research candidates, not approved implementations or confirmed defects. Any checks reported in that PR are historical reports, not this run's execution.
- [Ranked catalogue at PR463's pinned head](https://github.com/byronwall/explorEDA/blob/476a1be3544f93baf7c4732a436163609fbbd02f/docs/intent/research-ideas-100/catalogue.md). Only the selected continuity IDs were checked: R008, R018, R043, R077, R073 and R011. Their catalogue priorities are not the local queue order.
- [R008 original candidate](https://github.com/byronwall/explorEDA/blob/476a1be3544f93baf7c4732a436163609fbbd02f/docs/intent/research-ideas-100/ideas/R008-engineering-bin-boundaries.md).
- [Previous retention research queue at its own pinned commit](https://github.com/byronwall/explorEDA/blob/a915f6965055d1b69f9bccfaddf50e4b5986468a/docs/research/retention-observation-2026-10-21/research-queue.md).
- [Current-analysis-trust intent — first local proof](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md).
- [Population-baselines intent — independent distribution refinements](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/population-baselines/intent-brief.md).
- [numericBins / snapRangeToBins](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/bins.ts), [binRows / planBarChart](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barPlan.ts), and [applyFilter](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts).
- [ECDF threshold/range functions](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts), [existing filter fields](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/settings/FiltersSettingsTab.tsx), and [ColumnFilter numeric bounds](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/components/ColumnFilter.tsx).
- [initializeData source IDs](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/lib/dataLayerState.ts), [provider replacement/restore](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx), and [existing docs live examples](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/live/examples.ts).

The attached prompt/queue, rather than unseen historical archives, supply the remaining PR ownership and completion constraints. Unknown task demand remains unknown.
