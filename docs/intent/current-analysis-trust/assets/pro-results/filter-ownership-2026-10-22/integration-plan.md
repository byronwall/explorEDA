# R051 integration plan: explain filter ownership without changing membership

**Date:** October 22, 2026.  
**Repository:** `byronwall/explorEDA`.  
**Exact source baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`.  
**Integration branch named by the brief:** `codex/filter-ownership-research-2026-10-22`. This report did not create, check out, or modify that branch.  
**Status:** research handoff and proposed disposition; no implementation approval.  
**Human evidence:** zero participants recruited, zero sessions conducted, and no measured comprehension benefit.  
**Product execution:** unrun. The selected source packet and additional exact-ref source reads do not constitute a runnable checkout.

## 1. Recommended integration decision

Retain the existing filtering behavior and current interface. Adopt the exact membership proof contract for subsequent review, and propose narrow documentation corrections where the audited wording overgeneralizes the source. Investigate a focused tooltip/worked-example candidate against the complete current controls only after source correctness can be exercised. Defer a contextual trace sentence until a specific observed task difficulty remains; keep the temporary context/selected comparison inside research.

This is a **GO for bounded correctness review and a prepared explanation study**, a **conditional GO for a later explanation prototype**, and a **NO-GO for shipping added UI on the present evidence**. A source audit establishes plausible explanation gaps; it does not establish that current users fail or that new wording helps them. The production default remains unchanged if the comparison is inconclusive.

The important source distinctions are already concrete:

- A chart's context group omits its own chart dimension. Another owner's filter on the same field still applies. A workspace field has a separate dimension. [S1]
- A chart-local restriction limits that chart's population without automatically restricting the linked predicate sent to peers. The ordinary bar definition applies its selected field predicate; retrieval separately applies the local restriction. [S1] [S2] [S3]
- A metric's matching membership, its finite numeric contributors, a category chart's context, the table's searched rows, and the Rows view's searched/filtered rows can differ correctly. [S4] [S5] [S6]
- Existing chips, tooltips, local strips, trace notes and the bar's selected/context count already explain parts of these distinctions. They belong in comparator A. [S7] [S8] [S9]
- The standard named aggregate bar explicitly receives peer/local IDs. A universal statement that all named grouped summaries use globally filtered rows overstates that consumer path. Correct the documentation after the relevant consumer assertion is proven; do not change behavior to make that statement true. [S3] [S10]

## 2. Evidence boundary and preflight

The repository owner and exact commit were verified through the GitHub connector. The attachment identifies the same repository and baseline. All **39 packet payloads** matched their declared byte sizes and SHA-256 digests. The attachment is 226,162 bytes with SHA-256:

```text
c53c80b2a48187f2ed8f0f566d7ccce3c13176062ed9b14c00bd35ff7a7c83a8
```

The standalone prompt is 9,134 bytes with SHA-256:

```text
ed05d34009cba1854e209443e6e921266eb68dc42b7c9c2f10747abb8b649b20
```

The packet contains complete files, explicitly identified provider/example excerpts, R051 catalogue projections, three historical decision files at their own refs, and local prompt/queue additions. The projections are not the complete catalogue. Additional exact-baseline reads closed the decisive consumer and example-registration gaps; their content was checked against returned Git blob hashes. Moving `main` pages were not substituted for baseline behavior.

Completed bounded experiment: an independently authored standard-library verifier passed 121 assertions against the hand-enumerated literal oracle, covering baseline memberships, T1–T5, the notebook side case, zero/invalid/empty distinctions, and grouped-context sums. This verifies arithmetic and set consistency on the frozen ledger; it does not run application code.

What remains unmeasured is material: no application tests, browser interactions, screenshots, runtime integration, participant sessions or deployment occurred for this report. The exact IDs below are the frozen source-derived manual oracle, not observed screen output. Table/Rows arrays mean the complete filtered result, not every row mounted in a virtualized viewport.

Before a later implementation review, recheck the target commit and record any source drift. If a new target changes a consumer or filter owner, stop and update the bounded oracle consciously. Do not silently keep an old explanatory sentence while validating against a different baseline. A missing decisive consumer or an unverified custom example is a correctness blocker; the smallest action is to supply or inspect that exact source, then run the focused check. Lack of named customer demand does not block correctness research.

## 3. Immutable membership contract

### Fixture and owners

Use the twelve-row `R051-orders-v1` fixture from the study kit, with stable source labels `O01` through `O12`. Preserve JSON values: O03 and O09 have null amounts, O06 has the string `invalid`, O04 has numeric zero, and O12 has numeric −20. Runtime `__ID` is the zero-based position in this fixed source order; verify the mapping before inspecting traced row IDs. Source labels are not a proposal to repair identity or replacement behavior.

The intended example has exactly these consumers:

| Consumer | Configuration and owner |
| --- | --- |
| `A-region-web` | Region category-count bar; local restriction `channel=Web`; own selection is a Region predicate. |
| `B-category` | Category count bar; no local restriction; own selection is a Category predicate. |
| `M-amount` | Sum of `amount`; no own filters, no local restriction and no entity aggregation. |
| `T-orders` | Data table; no column filters in this fixture; its text search is local to the table. |
| Rows view | Starts with global linked membership, then applies its own search and Status filter. |
| Workspace Region | A separately owned workspace filter on the same field used by A. |

Let **U** be `{O01,O02,O03,O04,O05,O06,O07,O08,O09,O10,O11,O12}`. Let **L** be A's fixed Web population `{O01,O02,O05,O06,O09,O10,O12}`. Let **G** be the intersection of all active linked chart and workspace predicates. A's foreground context is its peer context intersected with L. M uses G because M has no local restriction. [S1] [S2] [S3] [S4] [S5] [S6]

A's ordinary faint full-source reference has Region counts West=6, East=4, South=2. Its unfiltered Web foreground has West=4, East=2, South=1. The source reference and foreground are separate layers; do not sum them or rename both “selected.” [S3]

### Sequential state changes

1. **T1:** select A Region=West.
2. **T2:** keep A West; select B Category=Tech; set workspace Region=West; table search `rush`; Rows search `red`; Rows Status=Open.
3. **T3:** change only workspace Region to East. A West and B Tech remain.
4. **T4:** clear only A's Region selection. Other owners remain.
5. **T5:** invoke the existing global `Clear all filters` action. Local population L remains.

T0, with no active selections or searches, is orientation. It has the same resulting memberships as T5, but T5 is the proposed clearing-action check; that application action remains unrun.

### Exact integration acceptance examples

Every identifier is a source label. `∅` means an empty set; `U` and `L` are fully defined above.

| State | Global / metric membership G | A foreground context / selected within A |
| --- | --- | --- |
| T1 | `{O01,O02,O03,O04,O09,O12}` — 6 | L — 7 / `{O01,O02,O09,O12}` — 4 |
| T2 | `{O02,O04,O09}` — 3 | `{O02,O09}` — 2 / `{O02,O09}` — 2 |
| T3 | `∅` — 0 | `{O06}` — 1 / `∅` — 0 |
| T4 | `{O06,O08}` — 2 | `{O06}` — 1 / `{O06}` — 1 |
| T5 | U — 12 | L — 7 / L — 7 |

| State | B foreground context | Metric finite contributors and sum |
| --- | --- | --- |
| T1 | `{O01,O02,O03,O04,O09,O12}` — 6; Furniture=3, Tech=3 | `{O01,O02,O04,O12}` — 4; sum=280 |
| T2 | `{O01,O02,O03,O04,O09,O12}` — 6; Furniture=3, Tech=3 | `{O02,O04}` — 2; sum=200 |
| T3 | `∅` — 0; Furniture=0, Tech=0 | `∅` — 0; display `No rows`, not numeric zero |
| T4 | `{O05,O06,O07,O08}` — 4; Furniture=2, Tech=2 | `{O08}` — 1; sum=300 |
| T5 | U — 12; Furniture=6, Tech=6 | `{O01,O02,O04,O05,O07,O08,O10,O11,O12}` — 9; sum=980 |

| State | Table filtered result | Rows filtered result |
| --- | --- | --- |
| T1 | `{O01,O02,O03,O04,O09,O12}` — 6 | `{O01,O02,O03,O04,O09,O12}` — 6 |
| T2 | `{O04,O09}` — 2 | `{O04}` — 1 |
| T3 | `∅` — 0 | `∅` — 0 |
| T4 | `{O06}` — 1 | `∅` — 0 |
| T5 | U — 12 | U — 12 |

The T3 mismatch is intentional: global membership is empty while A can show O06 as peer context because A omits only its own West predicate. Workspace East remains. In T4, O06 belongs to M even though its amount is invalid; only O08 contributes to the sum. A metric trace must still expose both membership rows. In T5, the global action clears chart/workspace predicates and table/Rows searches and filters while leaving the Web restriction. [S1] [S4] [S5] [S6] [S7] [S8]

Keep notebook behavior separate. Initialize a new notebook-mode instance with `localSelections=true` before chart registration, retaining T3's stored predicates for the side case. G becomes `{O05,O06,O07,O08}`, M's finite contributors become `{O05,O07,O08}`, and sum=500. A's context is `{O05,O06}` but its stored West highlight selects none; B highlights `{O06,O08}`. The table result is `{O06,O07}` and Rows result `{O05,O07}`. Toggling a wrapper flag after filtered dimensions have already been installed is not the defined proof setup. Do not merge this case into linked-mode scoring. [S1] [S6] [S11]

## 4. Proposed dispositions and cost bounds

These seven FO items are recommendations for Codex's later review. “Adopt” means accept the bounded requirement or correction as the proposed disposition; it does not report a code change or authorize implementation. Costs are relative engineering estimates, not measured effort or a delivery schedule.

| Recommendation | Proposed disposition and estimated cost | Confidence and required proof |
| --- | --- | --- |
| **FO01 — exact proof contract** | Adopt the frozen source-ID, owner, numeric-contributor and displayed-row contract. Small research/test integration effort. | High source confidence; exact runtime comparison still unrun. Assert IDs, not only counts, with independent expected literals. |
| **FO02 — narrow documentation corrections** | Adopt a consumer-specific rendering clarification and a clear-all/local-population clarification. Small documentation effort, with focused example and regression proof included. | High confidence in identified source/wording mismatch; no comprehension improvement claimed. Confirm standard aggregate-bar inputs and clear action before publishing. |
| **FO03 — existing interface and semantics** | Retain current behavior, controls and explanations. No added product surface. | High confidence that these capabilities already exist. Keep them available in every comparator; do not force totals to agree. |
| **FO04 — B versus A** | Investigate one owner-specific tooltip plus a focused worked example against complete current UI/docs. Small prototype and moderated-study effort; recruitment is separate. | Provisional hypothesis only. Require correct source behavior and observed first-exposure predictions. |
| **FO05 — contextual trace sentence** | Defer C until a documented task gap survives A/B or trace inspection is where confusion occurs. Small-to-moderate conditional effort because wording must stay truthful across consumers/modes. | Unmeasured. Require a specific owner-related failure and accurate context generation using existing results. |
| **FO06 — temporary comparison** | Defer D to a study-only aid if it can diagnose an unresolved difference. No persistent comparison control. | Low confidence in added value; existing bars already show selected/context counts. Measure whether it adds useful owner information. |
| **FO07 — scope expansion** | Reject filter union expansion, a second population evaluator, Crossfilter replacement, identity repairs, new routing or a universal scope platform within R051. | High scope confidence. None is required to answer the five tasks. Reopen only under a separately reviewed mission. |

## 5. Intent, documentation and example destinations

### Existing intent and source locations

The selected brief is `docs/intent/research-ideas-100/ideas/R051-filter-ownership.md`. The existing trust intent is `docs/intent/current-analysis-trust/intent-brief.md`. A later accepted implementation plan should preserve their distinction between exact agreement and human understanding, and record FO dispositions without marking deferred work complete. Do not change the catalogue or intent files during this research handoff. [S12]

Use the existing documentation pages:

- `apps/demo/src/docs/pages/filters.mdx`: retain its current explanation of unselected bars, owner clearing, local searches, workspace filters and chart-local restrictions; add only the bounded clarification/lesson that the accepted milestone warrants.
- `apps/demo/src/docs/pages/rendering.mdx`: qualify population terms by consumer and acknowledge workspace/local restrictions; fix the overbroad grouped-summary sentence with the verified standard bar path.
- `workspace.mdx`, `notebooks.mdx` and `trace.mdx`: consistency checks for changed wording, not an invitation to rewrite navigation or a general scope taxonomy. A visible milestone must still name `filters.mdx` or `rendering.mdx` and its example explicitly. [S10] [S11] [S12]

### Verified wiring, including the custom-component boundary

The example path is grounded in current source rather than a guessed new route:

| Existing source | Verified role |
| --- | --- |
| `apps/demo/src/docs/DocsSite.tsx` | Imports `mdxComponents` from `./components/content` and renders each page with `components={mdxComponents}`. [S13] |
| `apps/demo/src/docs/components/content.tsx` | Imports and registers `WorkedOrder`; also registers `LiveExample`. This is the existing MDX component table. [S13] |
| `apps/demo/src/docs/pages/rendering.mdx` | Already uses `WorkedOrder`, demonstrating a dedicated worked component in a documentation page. [S10] [S13] |
| `apps/demo/src/docs/live/examples.ts` | Existing `saved-filter` uses Lorenz data/settings and links to `lorenz-3d`; existing `workspace` uses the shop configuration linked to `shop-operations`. These are not the proposed twelve-row example. [S14] |
| `apps/demo/src/demos/examples.ts` | Registers `shop-operations` over its existing 500-order CSV; preserve its identity and content. [S14] |
| `apps/demo/src/docs/live/LiveExample.tsx` | Fetches table text through `readTableText` before mounting real `ExplorEda`; on narrow screens the generic docs component uses a screenshot fallback. It does not prove that a JSON-null fixture will survive a CSV conversion unchanged. [S15] |
| `apps/demo/src/docs/gate.ts` | Recognizes generic `<LiveExample id="…">` and checks registered targets/examples. This alone does not prove a newly registered custom component renders or obeys the oracle. [S16] |

**Proposed new files, not existing or implemented:** `apps/demo/src/docs/live/FilterOwnershipExample.tsx` and a colocated `filterOwnershipFixture.json`. The component would mount the existing real `ExplorEda` with the frozen JSON rows and bounded saved settings. Import/register it in the existing `components/content.tsx` table and embed `<FilterOwnershipExample />` in the selected `filters.mdx` or `rendering.mdx` section. Reuse that one focused example for later milestones.

This route preserves the JSON types, avoids a new full-demo route, and avoids constructing a second rendering or population engine. The example must use the existing React/TypeScript stack and pnpm. Do not rename `saved-filter`, `workspace`, `lorenz-3d` or `shop-operations`, or claim a new example ID is already registered. [S13] [S14] [S15] [S16] [S17]

The custom component needs explicit docs/build/browser coverage because it does not automatically inherit all generic `LiveExample` checks. Verify that the imported component resolves in MDX, mounts actual charts, exposes each step, and preserves the frozen values. If a narrow fallback is added, exercise and identify it separately. If a later reviewer instead elects a full registered demo, the existing guide requires its coverage entry and export/recompile tests; that broader route is not the proposed R051 default. [S16] [S17]

## 6. Conditional milestones with docs/example pairing

### M0 — freeze the proof boundary; no visible product change

**FO01 and FO03.** In a later runnable exact-baseline checkout, establish the source-ID mapping and compare the wrapper, standard bar consumer, metric, table and Rows results with the literal oracle. Include clear-one, clear-all and the separate notebook instance. Record the output and any mismatch. Do not proceed to an explanation intervention while exact membership is unresolved.

This milestone is internal verification; it has no visible feature and no new UI. Its review output must state whether each later visible milestone remains eligible.

### M1 — correct narrow documentation and expose one runnable example

**FO02, conditional on M0 source agreement.** Pair `apps/demo/src/docs/pages/rendering.mdx` with the proposed `FilterOwnershipExample` to qualify the standard grouped-summary consumer, and pair the clear-all/local-population clarification in `filters.mdx` with the same example's T4/T5 steps. Correct the factual statement without adding a general lesson or claiming a usability win.

Acceptance includes exact T1–T5 IDs, retained null/invalid/zero distinctions, truthful full-source reference bars, and explicit custom-component docs/browser checks. The visible milestone is incomplete if only prose changes or only the example is delivered. The example should expose existing controls and bounded instructions; it should not add persistent ownership controls to the product.

### M2 — optional B versus A teaching comparison

**FO04, research candidate.** Pair an owner-specific tooltip proposal in `ActiveFilterStatus.tsx` only where its scope is accurate with a focused worked section in `filters.mdx` and the same proposed runnable example. Show complete current controls/docs in A. B adds the proposed tooltip/teaching exposure; it does not change chart predicates, global counts or clearing.

Before implementation, create reviewable candidate copy and the unchanged answer keys. Then run the first-exposure study described below when real participants are available. A source audit alone cannot promote this milestone into a product release. If A already supports the tasks comparably, or B adds burden without a useful correction, retain A.

### M3 — optional C at the existing trace location

**FO05, conditional on a specific observed gap.** Pair one contextual trace sentence in the appropriate existing trace body with `rendering.mdx` and the same example at the task that exposed the difficulty. A count-bar sentence must not be reused universally for metrics, grouped summaries, field profiles or notebook selections. Name the omitted owner and retained restrictions using already available consumer/state information; do not re-evaluate populations to generate prose. [S3] [S4] [S5] [S9]

Acceptance requires no source-ID drift, no generic claim that every filter on the same field is ignored, and a new observed comparison against the complete current explanation. Roll back or decline the sentence if it is redundant, inaccurate across modes, or introduces ambiguity. The milestone remains deferred on present evidence.

**D stays research-only.** Its context/selected view can be a temporary oracle card in a moderated session. It is not a milestone to add a persistent product control, and existing bar status must not be removed to make it appear novel.

## 7. Proof order and future command run sheet

Run the following stages in order when an authorized runnable checkout is available. All commands in the run sheet are **future instructions, not checks performed during this research**. The pinned baseline's package scripts and agent guide substantiate the commands. [S17] [S18]

1. **Source:** verify owner, commit, relevant file receipts and consumer paths. Reconcile the grouped-summary documentation against the actual explicit-ID call. Confirm existing MDX registration and custom component coverage.
2. **Oracle:** preserve the immutable twelve-row JSON and independently enumerated exact IDs. Use production code only for actual results; never derive both expectations and actuals from the same evaluator. Keep every finite-contributor sum separate from membership.
3. **Focused runnable proof:** run baseline wrapper/status tests; add only meaningful fixture checks for consumer membership, search locality, clear behavior and the proposed real example. Assert the standard aggregate-bar path independently of the provider's fallback. Test the custom MDX component explicitly rather than assuming generic example registration covers it.
4. **Browser proof:** exercise the real flow at **1280, 783 and 390 CSS pixels**, using pointer and keyboard. Verify focusable owner help, trace entry, exact row inspection, search, clear-one and clear-all. At 390px, distinguish a docs screenshot fallback from an interactive instance; a screenshot cannot prove keyboard or pointer filtering. If the product's supported desktop layout limits a narrow task, record that limit and the fallback behavior precisely rather than reporting a completed interaction.
5. **Human comparison:** only after the correctness surface is usable, run first-exposure predictions with real participants. Keep comprehension outcomes separate from source/test outcomes.

```bash
# FUTURE RUN SHEET — use an authorized runnable checkout, not the selected packet.
# Confirm the source baseline before interpreting any result.
git rev-parse HEAD
# Expected research baseline: 63dfa75851ef57bb3782e6d7c1ef104784cd4064
# If the target differs, review and record the drift before proceeding.

# Baseline ownership/status tests requested by the R051 brief.
pnpm --filter exploreda exec vitest run \
  src/hooks/CrossfilterWrapper.test.ts \
  src/components/ActiveFilterStatus.test.tsx
pnpm --filter exploreda check-types

# Existing documentation gates; add explicit coverage for the proposed custom
# FilterOwnershipExample because generic LiveExample checks are insufficient.
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify

# Development host for later pointer/keyboard proof at 1280, 783 and 390 CSS px.
# Run this in the appropriate development session when collecting browser proof.
pnpm --filter demo dev

# After focused proof and the browser review, run the root gate once.
# The dev server above remains interactive; run these in the review session.
pnpm check
pnpm check:pr
```

If a future package UI change is accepted, apply the repository's existing changeset policy; a docs/demo-only change has a different requirement. Do not publish, merge or open a PR as part of the present task. The brief explicitly bounds this work to research and assigns later integration/review to Codex; ordinary repository implementation workflow does not override that bound. [S17] [S18]

## 8. Smallest explanation experiment and stop conditions

The favored hypothesis is B, a focused teaching intervention. It is favored for bounded scope and testability, not because people have demonstrated a benefit. C is a fallback explanation location; D is a diagnostic aid.

Start with four adults who use or build analytical dashboards, assigning two to A and two to B for first exposure. Expand to eight only to investigate a concrete ambiguity. Record prior explorEDA/Crossfilter familiarity and recruitment source; report authors and oracle reviewers are not independent participants. Convenience recruitment and this sample size cannot establish broad effectiveness. No one has been recruited for this report.

Use the five tasks above with identical fixture, control availability, orientation opportunity and moderator script. Keep current chips, tooltips, local strip, bar status, full docs and trace available in both arms. Lock each next-state prediction before revealing the result. Do not place the T1–T5 answer keys in B's participant-facing example; an unscored South-only training state can teach the distinction using the same twelve rows.

For a four-variant exploratory comparison, balance the first condition and then use Williams exposure orders **ABDC, BCAD, CDBA, DACB**. Only the first condition contributes primary five-task scores. Repeated identical answers after another explanation are exploratory, not fresh comprehension. Equal access opportunity must not erase natural effort: record time, tooltip/trace/doc openings and help requests. Inspecting an already revealed target state is aided interpretation and must not be pooled with prospective prediction.

A participant meets the brief's acceptance gate only with **at least four correct predictions out of five**. A task passes only when all predeclared core ID sets, any explicitly core-requested scalar/count/value, and the owner explanation are correct; a right count with wrong members fails. Arithmetic not designated core is diagnostic only; contributor IDs are core where requested. Log contributor errors separately for diagnosis without exempting them from a core failure. Pre-register a four-minute orientation and four-minute cap per task; these are proposed limits, not measured durations. Preserve severe mistakes even if the aggregate threshold is met: collapsing chart/workspace owners, removing invalid measures from membership, treating zero as missing, or assuming clear-all erases local populations.

Reject or stop B when current A already explains the tasks comparably and B adds no task correction, when extra terminology creates scope errors, or when inspection effort increases without useful benefit. If results are mixed, record **inconclusive** and retain the current interface. A small favorable result can justify another bounded prototype review; it is not a rollout approval or population-level usability claim. If source truth fails, stop the human comparison and fix or explain the correctness discrepancy first.

## 9. Catalogue continuation and historical constraints

The local research queue marks R051 as the highest unfinished selected research item. After recording its bounded disposition, continue with **R086**, then **R031**:

- **R086:** probe mixed save outcomes before proposing coordinated saves.
- **R031:** compare existing date previews against ambiguity.

Preserve the queue's stated completed research: R026/PR465, R043/PR466, R077/PR484 and R001/PR492. Preserve R008/PR464's completed edge work and R011's reuse of PR461. These are queue/research dispositions; they do not establish that application implementations from those reviews are merged. Do not repeat their surveys or reopen their scope through R051. The local queue also assigns Mosaic integration to PR462; the external semantics comparison does not authorize repeating that integration survey. [S19]

Retain three historical constraints:

- TN decisions at `3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb` separate query/entity/linked/local scope and require fair current-controls comparison and docs/example proof.
- MS decisions at `6cab0a1bcf80ea0a72d9441b7545db46bc2697ac` separate membership from numeric contribution and avoid declaring a lesson valuable without evidence.
- SI decisions at `191dc9343b1c658b082d30138f972949f4c43b06` preserve exact membership and identify proposed workspace/local ownership repairs during replacement. Those identity/replacement repairs remain outside this mission and must not be treated as delivered. [S20]

## 10. Exact source references

Unless a historical ref is explicitly named, each link below is pinned to `63dfa75851ef57bb3782e6d7c1ef104784cd4064`. Access/inspection date: October 22, 2026. These references support source statements, not runtime or participant outcomes.

### Source S1

[CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/CrossfilterWrapper.ts), `updateChartFilters`, `addChart`, `setWorkspaceFilters`, `getFilteredRowIds`, `getChartFilteredRowIds`, `getAllData`, lines 68–211; [chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/chartPopulation.ts), lines 14–41.
### Source S2

[BarChart/definition.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/definition.ts), `getFilterFunction`, lines 50–92; [useGetLiveData.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/useGetLiveData.tsx), `useGetLiveIds`, lines 43–58.
### Source S3

[BarChart.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx), live/all-values and aggregate inputs, lines 123–151; snapshot/reference setup, lines 193–218; status, lines 383–421; [barPlan.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/barPlan.ts), `countRows`, reference bars and scope note; [useGetColumnData.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/useGetColumnData.tsx), full-column behavior when IDs are omitted; [ChartRenderer.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/ChartRenderer.tsx), standard renderer path.
### Source S4

[MetricCard.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx), lines 33–75; [metricCardPlan.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts), matching rows, numeric state and trace, lines 54–97 and 146–167; [aggregates.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/aggregates.ts), numeric reduction and contributor construction; [valueParsing.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/valueParsing.ts), finite numeric parsing.
### Source S5

[MetricCardTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx), matching/used/excluded rows, lines 9–58; [traceRows.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/traceRows.ts), all contributor IDs, lines 7–10.
### Source S6

[DataTable.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx), display inputs, lines 123–140; [filteredRows.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts), search/filter application, lines 10–47; [RowsView.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/RowsView.tsx), linked membership inputs, lines 30–48.
### Source S7

[ActiveFilterStatus.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/ActiveFilterStatus.tsx), owner chips/removal, lines 309–386; membership tooltip, lines 423–441; clear-all wording, lines 543–555; [LocalFilterStrip.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/LocalFilterStrip.tsx), lines 12–34.
### Source S8

[DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/DataLayerProvider.tsx), `getAggregateResult`, lines 954–959, and `clearAllFilters`, lines 1121–1148.
### Source S9

[ChartTracePanel.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx), workspace filter note and trace controls; [BarTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx), scope note, lines 166–168.
### Source S10

[filters.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/filters.mdx), current filter/search/local explanations; [rendering.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/rendering.mdx), populations and named-summary wording, lines 39–52.
### Source S11

[notebooks.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/notebooks.mdx), local selections and notebook filters; [workspace.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/workspace.mdx), owners and clearing; [trace.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/trace.mdx), trace access and supported surfaces.
### Source S12

[R051 catalogue brief](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/ideas/R051-filter-ownership.md); [current-analysis-trust intent](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/current-analysis-trust/intent-brief.md).
### Source S13

[DocsSite.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/DocsSite.tsx), registry import line 25 and MDX page components lines 56–57; [components/content.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/components/content.tsx), `WorkedOrder` import line 15 and component registrations lines 344–349.
### Source S14

[docs/live/examples.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/live/examples.ts), `saved-filter` and `workspace`, lines 550–579; [demos/examples.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/demos/examples.ts), `shop-operations`, lines 449–481.
### Source S15

[LiveExample.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/live/LiveExample.tsx), table loader and narrow fallback, lines 84–130 and 178–230.
### Source S16

[docs/gate.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/gate.ts), registered example checks, lines 117–148; [docs/catalogue.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/catalogue.ts), existing filters/rendering topics.
### Source S17

[AGENTS.md](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/AGENTS.md); [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/agent-guide.md), documentation wiring/checks, commands and new-demo coverage rules.
### Source S18

[package.json](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/package.json), pnpm version, `check` and `check:pr` scripts.
### Source S19

Local addition `docs/research/filter-ownership-2026-10-22/research-queue.md` in the supplied packet, SHA-256 `ae68c6b7e0345e4246e986678f2a446932434f176c9e044525b5839a0799ea37`; local prompt SHA-256 given in §2. These additions have no asserted Git commit URL.
### Source S20

[TN decisions at 3d1ffebb…](https://github.com/byronwall/explorEDA/blob/3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb/docs/research/task-navigation-2026-10-20/decisions.md); [MS decisions at 6cab0a1b…](https://github.com/byronwall/explorEDA/blob/6cab0a1bcf80ea0a72d9441b7545db46bc2697ac/docs/research/missing-state-accounting-2026-10-21/decisions.md); [SI decisions at 191dc934…](https://github.com/byronwall/explorEDA/blob/191dc9343b1c658b082d30138f972949f4c43b06/docs/research/selection-identity-2026-10-22/decisions.md).

[S1]: #source-s1
[S2]: #source-s2
[S3]: #source-s3
[S4]: #source-s4
[S5]: #source-s5
[S6]: #source-s6
[S7]: #source-s7
[S8]: #source-s8
[S9]: #source-s9
[S10]: #source-s10
[S11]: #source-s11
[S12]: #source-s12
[S13]: #source-s13
[S14]: #source-s14
[S15]: #source-s15
[S16]: #source-s16
[S17]: #source-s17
[S18]: #source-s18
[S19]: #source-s19
[S20]: #source-s20
