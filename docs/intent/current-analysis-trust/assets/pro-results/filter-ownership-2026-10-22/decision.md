# R051 — Filter ownership and self-exclusion: decision

**Research date:** October 22, 2026.  
**Repository:** `byronwall/explorEDA`.  
**Exact baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`.  
**Intended later integration branch:** `codex/filter-ownership-research-2026-10-22`; no branch was created or changed.  
**Status:** completed bounded source research and study kit; application proof and human study **UNRUN**. Actual participants: **0**.

## Decision

**Retain the existing filtering behavior and current interface. Correct the narrow source/documentation mismatch identified below, then test a focused worked example and tooltip against the complete current explanation before adding a trace sentence.** The worked example is the preferred experiment, not a demonstrated usability improvement. Its benefit has not earned implementation cost through participant evidence. A new persistent comparison control is not justified.

Three findings support that position:

1. **The current explanation is substantial.** The interface already has owner-aware chips and tooltips, a local restriction strip, selected/context counts in category-bar footers, workspace information in trace, and metric contributor accounting. The existing documentation explains self-exclusion and the locality of searches. A fair comparator must expose these capabilities. [S3] [S4] [S7] [S10] [S16] [S17] [S18]
2. **A specific compositional question remains worth testing.** A chart omits its own owner's linked predicate when constructing context. It still honors another owner's predicate on the same field. A chart-local drawing restriction is a separate operation and does not automatically become part of the linked category predicate. The frozen tasks below make those distinctions concrete without changing behavior. [S1] [S2] [S4] [S5]
3. **One factual documentation correction is supported independently of usability.** `rendering.mdx` says named grouped summaries use globally filtered rows. The standard registered aggregate-bar path passes peer-context IDs explicitly to `getAggregateResult`; the provider falls back to global IDs only when an explicit population is absent. The broad documentation sentence is therefore inaccurate for that consumer. This is a static source/documentation contradiction, not an observed incorrect rendering. [S4] [S5] [S7] [S11]

No customer demand, runtime defect, participant success, or participant failure has been established. Missing named demand does not prevent correctness research. It does prevent portraying this work as a response to demonstrated customer demand.

## What was verified and what remains unmeasured

The source packet contains 39 entries. Every entry's declared byte count and SHA-256 matched its extracted bytes, including complete files, explicitly marked projections/excerpts, historical supplements, and local additions. The packet is 226,162 bytes with SHA-256 `c53c80b2a48187f2ed8f0f566d7ccce3c13176062ed9b14c00bd35ff7a7c83a8`. The attached prompt is 9,134 bytes with SHA-256 `ed05d34009cba1854e209443e6e921266eb68dc42b7c9c2f10747abb8b649b20`; it exactly matches the packet's local prompt addition.

Repository metadata confirmed owner `byronwall`, public repository `byronwall/explorEDA`, repository ID `933467100`, and the exact requested commit. That commit is the merge of PR491 concerning annotations. Read-only exact-ref retrieval supplied the missing consumers and example wiring. A separately fetched `CrossfilterWrapper.ts` exactly matched the packet's 6,855-byte payload and SHA-256 `444f228baffb694c82f7826da6a2eee88ce0296b47ec5e3f59c36b0d1070b483`. The public web reader's unsuccessful exact-ref requests did not invalidate the successful GitHub connector receipts. Moving `main` was not substituted for the baseline. [S12]

The selected snapshot is **not a runnable checkout**. Downloaded source was read, never executed. No repository files were edited; no dependency installation, application test, browser session, commit, PR, paid service, or outgoing recruitment message was performed. The only executed analytical check was an independently authored standard-library checker over the frozen twelve rows and a separately hand-enumerated literal answer key. It passed **121 assertions**. That verifies arithmetic and oracle consistency, not application behavior.

| Evidence class | Established status |
| --- | --- |
| Source availability and provenance | GO: requested owner/ref identified, packet inventory/hash checks passed, decisive consumers readable. |
| Static population model | Established for the specified ordinary category bars, metric, table, Rows view, workspace dimensions, and notebook-mode counterexample. |
| Frozen manual oracle | Exact IDs and totals established; independent arithmetic check passed. |
| Runtime source correctness | UNRUN: production Vitest and provider/rendering integration checks remain a later gate. |
| Browser interaction/accessibility | UNRUN at 1280, 783, and 390 CSS pixels; no screenshots or input success claimed. |
| Human comprehension | UNMEASURED: zero participants, no task-success rates, no observed inspection times. |
| Customer demand or misunderstanding frequency | UNMEASURED; neither can be inferred from source complexity or another product. |

The full receipt inventory belongs in `evidence.md`; the immutable fixture, literal oracle, executable proof drafts, and moderation materials are embedded in `proof-plan.md`. This decision remains interpretable without those files because its scope, exact task outcomes, and adoption gates are stated below.

## Exact population truth

### The consumers and sets

The controlled fixture uses twelve immutable business/source labels, O01–O12, in fixed order. The provider assigns runtime IDs 0–11; the fixture maps those IDs explicitly and forbids reorder or replacement. A is a category-count bar over `region` with a chart-local `channel = Web` restriction. B is a category-count bar over `category` with no local restriction. M is a sum-of-amount metric with no own filter, local restriction, or entity/deduplication setting. T is an ordinary table with no column filter; Rows is the separate Rows view. Facets, Top N, series, and custom aggregate overrides are absent. [S4] [S5] [S6] [S8] [S19]

The compact ledger is:

| Source ID | Region / category / channel | Amount; note; status |
| --- | --- | --- |
| O01 | West / Furniture / Web | 100; rush red; Open |
| O02 | West / Tech / Web | 200; standard blue; Open |
| O03 | West / Furniture / Store | null; rush blue; Closed |
| O04 | West / Tech / Store | 0; rush red; Open |
| O05 | East / Furniture / Web | 50; standard red; Open |
| O06 | East / Tech / Web | invalid text; rush blue; Closed |
| O07 | East / Furniture / Store | 150; rush red; Open |
| O08 | East / Tech / Store | 300; standard blue; Open |
| O09 | West / Tech / Web | null; rush red; Closed |
| O10 | South / Furniture / Web | 80; rush blue; Open |
| O11 | South / Tech / Store | 120; standard red; Closed |
| O12 | West / Furniture / Web | −20; standard red; Open |

Define the following sets; none is a synonym for all the others:

- **Full source U:** all twelve IDs, independent of selections.
- **Local population L_A:** `{O01,O02,O05,O06,O09,O10,O12}`, the seven Web orders. Other fixture views have local population U.
- **Global selected membership G:** rows passing every workspace dimension and every linked chart-owner dimension in ordinary linked mode. Search text and Rows-only predicates are not dimensions in G.
- **Peer context P_j:** the same linked intersection except that chart j's own dimension is omitted. A second owner's predicate on the same field stays in the intersection.
- **Foreground chart context C_j:** `P_j ∩ L_j`. These are the rows behind the category counts.
- **Selected membership within chart M_j:** `G ∩ L_j`. With ordinary linked category predicates this equals `C_j ∩ F_j`, where F_j is that chart's own selection. If the chart has no active own predicate, treat F_j as U and every context row matches; this is not a claim that the UI displays an active selection line.
- **Valid numeric contributors V_M:** the subset of metric membership with a valid finite amount. Null and invalid text remain members but do not contribute to sum. Zero and −20 are valid values.
- **Displayed rows:** T applies its own search after its input membership; Rows starts at G, then applies its separate search and column predicate. Displayed results can legitimately be smaller than G. Here “displayed rows” means the complete filtered result, not the subset currently mounted in a virtualized viewport. The table's own column filters, if present, are linked; table search is not. [S1] [S2] [S6] [S8] [S9]

A workspace field's control has another context, Q_f: it omits **that workspace field dimension**, while retaining linked chart predicates, even predicates on the same field. No `workspace:region` group key exists when there is no active workspace-region filter. An absent key must not be reported as an empty or full active group. [S1]

### Five sequential tasks and exact outcomes

The baseline has only A's Web local restriction; no active selection or search. Apply each task to the preceding state:

1. **T1:** select West in A.
2. **T2:** keep West in A; select Tech in B; add workspace Region = West; enter `rush` in T; set Rows search to `red` and its status filter to Open.
3. **T3:** change only workspace Region from West to East.
4. **T4:** clear only A's chart selection. Retain workspace East, B Tech, both searches, Rows Open, and A's Web restriction.
5. **T5:** use Clear all filters. A's Web local restriction remains.

| Task | Exact global membership G | Metric valid IDs → sum |
| --- | --- | --- |
| T1 | O01,O02,O03,O04,O09,O12 | O01,O02,O04,O12 → 280; O03/O09 excluded from numeric sum only. |
| T2 | O02,O04,O09 | O02,O04 → 200; O09 excluded from numeric sum only. |
| T3 | ∅ | ∅ → **No rows**, not numeric zero. |
| T4 | O06,O08 | O08 → 300; O06 remains a member with invalid amount. |
| T5 | O01–O12, all twelve fixed IDs | O01,O02,O04,O05,O07,O08,O10,O11,O12 → 980. |

| Task | A context C_A / selected-in-chart M_A | Table result / Rows result |
| --- | --- | --- |
| T1 | `{O01,O02,O05,O06,O09,O10,O12}` / `{O01,O02,O09,O12}` | Both `{O01,O02,O03,O04,O09,O12}`. |
| T2 | `{O02,O09}` / `{O02,O09}` | `{O04,O09}` / `{O04}`. |
| T3 | `{O06}` / `∅` | `∅` / `∅`. |
| T4 | `{O06}` / `{O06}` | `{O06}` / `∅`. |
| T5 | `{O01,O02,O05,O06,O09,O10,O12}` / same seven IDs | Both all twelve IDs. |

B's context contains six West rows at T1 and T2, none at T3, four East rows `{O05,O06,O07,O08}` at T4, and all twelve at T5. Its category foreground counts are respectively Furniture/Tech **3/3, 3/3, 0/0, 2/2, 6/6**. A's West/East/South counts are **4/2/1, 2/0/0, 0/1/0, 0/1/0, 4/2/1**. At T2 and T3, workspace Q_region is `{O02,O04,O09}`; at T4 it is `{O02,O04,O06,O08,O09,O11}`. These are source-derived predictions checked against the ledger, not observed screen results.

The T3 contrast is decisive: global membership is empty because workspace East and A's West predicate conflict, but A still has O06 as context because only A's own predicate is omitted. The workspace-region control still sees the three West/Tech IDs because only its own workspace predicate is omitted. Saying “region filters are ignored” loses the owner and predicts the wrong sets.

At T1, A's selected four Web rows are not the complete linked membership: the category predicate also matches Store orders O03 and O04. At T4, an empty Rows display does not imply an empty global result; it is the effect of Rows-only restrictions. At T5, “clear all” does not erase the chart's saved drawing population. These are suitable explanation questions, not evidence that people answered them incorrectly.

### More than one visual layer

Ordinary non-faceted count bars can also show faint full-source reference totals. A's full-source reference counts are West **6**, East **4**, South **2**; they are not the seven-row Web population. A reference bar is a comparison layer and is not additional current membership. A's existing footer already predicts “4 of 7 rows selected: West” at T1 and “0 of 1 rows selected: West” at T3. A new sentence cannot claim to introduce those counts. [S4]

Grouped aggregation is a different question from category counts. At T2, a standard named sum bar grouped by B's category would receive B's six-row context: Furniture 80 plus Tech 200, total 280. The metric uses the three selected Tech rows, two valid inputs, sum 200. This confirms why the documentation must name the consumer and aggregation. It does not justify forcing the distribution to equal the metric. [S4] [S5] [S6] [S7]

### Notebook selections are separate

Recreate the T3 stored predicates with `localSelections = true` **before chart registration**. Chart selections do not narrow peer/global dimensions; workspace East still does. G is `{O05,O06,O07,O08}`; the metric's valid IDs are `{O05,O07,O08}`, sum **500**. A's context is `{O05,O06}`, while its own West highlight is empty. B's Tech highlight is `{O06,O08}`. T shows `{O06,O07}` and Rows shows `{O05,O07}`. Calling `getChartFilteredRowIds(A)` in this mode returns the two-row local/context population, not A's empty own-highlight set. Do not reuse the linked-mode M_j interpretation as a universal notebook rule. [S1] [S13]

## Alternatives and provisional scoring

Only the five requested dimensions are scored. Scores are **expert judgments about the supplied stimulus and implementation burden**, not measured task success. Scale: 1 = least favorable, 5 = most favorable. For burden, effort, and maintenance, a higher score means less cost. There is no composite score or claimed statistical precision.

- **A — current UI plus existing documentation:** include the existing bar footer, local strip, status tooltip, owner chips, trace, and relevant docs. This is the retained product baseline.
- **B — improved existing tooltip plus one focused worked example:** preserve A and add a concise owner-specific explanation. This is the preferred first experiment.
- **C — one contextual trace sentence:** preserve A and add one sentence to the existing trace for the demonstrated consumer. This is a conditional later candidate.
- **D — temporary context/selected comparison:** a study-only two-column membership card, with global membership identified separately when it differs. No saved control or production evaluator is proposed.

| Dimension | A: current | B: tooltip + example |
| --- | --- | --- |
| Membership prediction support | 4 — relevant facts/counts already exist, but are spread across surfaces. | 5 — a worked causal sequence covers local/global differences and conflicting owners. |
| Owner clarity | 4 — owner is explicit or discoverable; chart-chip visible text can require inspection. | 5 — the lesson names exactly which owner contributes each predicate. |
| Terminology burden | 4 — familiar controls plus technical terms in docs. | 4 — can use ordinary words; a long tooltip would lower this rating. |
| Inspection effort | 3 — several places may need inspection. | 3 — a short lesson costs time but may reduce later assembly; unmeasured. |
| Maintenance cost | 5 — retain delivered behavior. | 4 — version one tooltip and one fixture-backed lesson. |

| Dimension | C: contextual trace sentence | D: temporary comparison |
| --- | --- | --- |
| Membership prediction support | 4 — describes one current state; transfer is unproven. | 4 — exact lists make differences inspectable, but seeing an answer is not prediction. |
| Owner clarity | 5 — if the sentence names local/workspace/chart owners precisely. | 3 — parallel ID lists still need a causal explanation. |
| Terminology burden | 3 — “context,” “selected here,” and global membership can compete. | 2 — three relevant sets may be mistaken for two despite the requested comparison. |
| Inspection effort | 3 — requires discovering/opening trace; existing trace already helps. | 2 — additional list comparison, even if temporary. |
| Maintenance cost | 3 — dynamic wording must match consumer, mode, and overrides. | 2 — mock card is cheap; general production comparison would require more surface/state work. |

The scores motivate experiment ordering, not adoption. B's maximum predicted support is a hypothesis that the four-of-five gate can reject. D adds less than it first appears because A already presents selected/context counts. A may prove sufficient.

### Concrete B stimulus

**Proposed replacement for the existing linked-workspace count tooltip, not delivered wording:**

> The count uses every workspace filter and linked chart selection. Each category chart ignores only its own selection when showing its context. Chart-local restrictions, table searches, and Rows searches or filters do not change this count.

Use this wording only in ordinary linked mode; do not label notebook selections as linked. Keep owner-specific existing chip and local-strip help available.

**Focused training example, using an unscored South case on the same ledger:**

> Start with twelve orders. The Region chart has “Only channel = Web,” so its foreground counts describe seven orders. Select South in that chart. O10 is its one selected Web order, while the linked count is two: O10 and Store order O11. Their amounts sum to 200. The category selection sends Region = South to other views; it does not send the chart's Web restriction. A table search for “rush” leaves O10 in that table without changing the linked count. Adding workspace Region = West conflicts with the chart's South selection. Clearing the chart selection leaves the workspace owner in place. Clear all filters removes those selections and searches, while the chart's Web restriction remains.

Do not use a scored T1–T5 answer card as B's training example. B should teach a rule whose transfer is measured, not supply the target answers.

### Concrete C stimuli

**Proposed one-sentence trace text for A at T3:**

> Within this chart's Web-only population, workspace Region = East and the Category chart's Tech selection leave one context row; this chart's own Region = West selection matches none, while all linked filters together match zero rows.

**The same constrained design at T1:**

> This chart shows seven Web orders as context and its West selection matches four of them; across the workspace, that Region = West selection matches six orders, including two Store orders.

These are candidate state-specific explanations, not universal templates ready to ship. Any later implementation must read the actual renderer/plan population and existing filter settings; recomputing a second generic population evaluator is out of scope. A metric, workspace field preview, notebook, or custom aggregate result needs its own verified consumer mapping rather than reusing this sentence blindly.

## The smallest study that can reject B

The primary outcome is **correct membership and ownership prediction in at least four of five tasks for an individual real participant**. A task passes only when all predeclared core ID sets, any explicitly core-requested scalar/count/value, and the owner explanation are correct. A correct count with the wrong IDs fails. Arithmetic not designated core is diagnostic only; contributor IDs are core where requested. Inspection effort is recorded separately. Source correctness is a prior technical gate and cannot be averaged with human success.

Start with four consenting adults, two assigned A and two B, balanced as far as feasible for experience with linked dashboards. They cannot be report authors or people who have read the answer key. This is a small falsification pilot, not an efficacy estimate. If both A participants pass and B shows no task-specific advantage, or B introduces a repeated owner mistake, retain A and stop adding explanation. A tie supplies no reason to add UI. Expand to eight only if a particular unresolved failure pattern would change the next decision. No participants have been recruited, and no invitations have been sent.

For the full four-variant comparison, use balanced first exposure and Williams orders **ABDC, BCAD, CDBA, DACB** for later exploratory exposure. Prefer sixteen volunteers, four per first variant, with experience balanced within arms. Only each person's **first** five-task sequence counts as primary comprehension evidence. Subsequent exposure after learning the answers is exploratory feedback about wording and inspection, never a second independent success sample. A resource-limited four-person four-arm pilot can expose wording failures but cannot establish comparative benefit.

All arms receive the same twelve-row ledger, base controls, documented access routes, pre-action state, task wording, exposure time, and prediction limit. Pre-register a four-minute orientation and a four-minute cap per task; these are proposed limits, not measured durations. Keep the relevant documentation available. Measure natural tooltip/trace/doc use; do not force B open while leaving A's help undisclosed. C and D can describe the pre-action state, but post-action text and results stay hidden until the participant locks the prediction. Then reveal the result and record aided interpretation separately.

Probe ambiguous words after scoring: What does “all” include? Is “selected” global or selected in this chart? Does “local” mean a chart restriction, table search, or notebook selection? Does “used” mean membership or valid numeric input? Does clearing one owner erase another? Do faint reference bars count current rows? Use the frozen answers to diagnose the question; do not teach during the scored prediction.

The baseline docs' grouped-summary error is a separate correctness issue, outside the five count-bar tasks. If it is corrected before a later study, give the same corrected baseline to every arm, label that baseline A1, and do not pool it silently with A0 results.

Recruitment is currently unavailable. Convenience volunteers, developer-heavy samples, familiarity with the fixture, and small arm sizes limit generalization. Report actual counts and task traces when available, not percentages without denominators or synthetic “participants.” Current result: **n = 0; success, failure, timing, and preference are all unmeasured**.

## Ranked recommendations and disposition proposals

These are bounded recommendations for Codex's later review. They are not implementation approval. Cost bands are planning estimates: XS = hours of focused review, S = roughly one or two focused days excluding recruiting, M = several days plus integration/proof; none is a measured estimate.

| ID / proposed disposition | Recommendation, cost, confidence, and required proof |
| --- | --- |
| **FO01 — Adopt the research proof contract** | Preserve immutable IDs, owner-specific intersections, local/global separation, contributor partitions, foreground/reference distinction, and the notebook side case. Cost S. Confidence high in static truth; runtime unverified. Proof: literal oracle, independent arithmetic, then production tests and browser checks. |
| **FO02 — Adopt narrow documentation correction** | Replace the universal grouped-summary claim with consumer-specific wording; qualify workspace/local scope and clear-all retention. Pair `rendering.mdx` or `filters.mdx` with one focused real-component example. Cost S. Confidence high for the factual mismatch, unknown for comprehension benefit. Proof: exact consumer chain and example assertions; do not change filtering behavior to match the old sentence. |
| **FO03 — Retain current UI and semantics** | Keep existing chips, tooltips, local strip, context, trace, and count footers. Cost XS. Confidence high that these features exist, unmeasured that everyone understands them. Proof for adding anything: evidence that the complete current comparator fails a specific task. |
| **FO04 — Investigate B against A** | Run the bounded prediction study using the South training example and locked target answers. Cost S plus recruitment availability. Confidence moderate in experiment value, low in improvement. Proof: real first-exposure observations, four-of-five per-person gate, task-level errors and inspection cost; stop on comparable A performance. |
| **FO05 — Defer C, conditional investigation** | Consider one trace sentence only for an observed unresolved ownership error after B. Cost M. Confidence moderate that accurate text can be written, unknown that it helps. Proof: source-correct population inputs, no second evaluator, exact context/selected/global distinction, and new participant evidence. |
| **FO06 — Defer D to research-only comparison** | Use a temporary answer/inspection card if needed to diagnose terminology. Do not add a persistent context toggle or saved state. Cost XS for the kit, materially higher for product generalization. Confidence low in incremental value over the current footer. Proof: prospective predictions separated from answer lookup. |
| **FO07 — Reject scope expansion** | No forced total equality, Crossfilter replacement, saved-filter union expansion, identity/replacement repair, routing change, universal scope platform, or additional persistent controls. Cost avoided is unestimated. Confidence high in scope decision. Reopen only through a separate justified initiative, not through explanatory copy. |

For every later visible milestone, the concrete paired destinations are an existing `filters.mdx` or `rendering.mdx` section and **one proposed** focused `FilterOwnershipExample` mounted with the authoritative JSON. Existing MDX registration and real example wiring were inspected. No route or component with that new name is claimed to exist today. The ordinary `saved-filter` example uses Lorenz; the workspace example uses the 500-order shop dataset, neither the frozen twelve-row experiment. [S14] [S20] [S21]

## GO / NO-GO and continuation

- **GO:** complete this source research, preserve the exact manual kit, review the factual docs correction, and conduct a bounded moderated study when real participants and a verified stimulus exist.
- **NO-GO now:** implement or ship additional explanatory UI, claim a usability win, claim successful application execution, or generalize a source audit into customer demand.
- **Later C prototype gate:** exact consumer populations must pass runtime/browser proof and a real task must expose a remaining explanation gap. Even then, the prototype is an experiment; adoption requires observed comprehension evidence. A specific source-backed scenario justifies a study question, not an invented participant failure.
- **Rejection gate:** retain A when it meets the task gate comparably, when B/C add ambiguity, when the benefit is only answer lookup, or when evidence remains inconclusive. Preserve the kit for later use.

The source queue places **R086 next, then R031**. R026/PR465, R043/PR466, R077/PR484, and R001/PR492 are completed research dispositions according to the supplied queue; that is not a claim that their application proposals are merged. Reuse R008/PR464 and R011/PR461 rather than repeating their surveys. TN navigation distinctions, MS membership/contributor accounting, and SI ownership warnings remain constraints. R077 replacement/identity repairs stay outside this mission. The R051 catalogue's older `9b16d78...` reference is its historical brief baseline; this report's evaluated code is the exact `63dfa758...` baseline. [S15]

### Coverage of the ranked questions

All five questions are answered to their evidence limit: exact sets and five-task answers are frozen; current explanations are audited; A–D are compared with B/C candidate copy; a counterbalanced falsification kit is specified; seven bounded dispositions and paired integration destinations are proposed. Runtime confirmation and actual human comprehension are explicitly unmeasured. Nothing in this report substitutes simulated readers for participants.

## Source references

All repository links below are pinned to the evaluated commit unless a historical ref is explicitly stated. Accessed October 22, 2026. The attached packet provides the baseline source and historical decisions; read-only extra files close consumer/wiring gaps.

[S1]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/CrossfilterWrapper.ts "addChart; setWorkspaceFilters; getFilteredRowIds; getChartFilteredRowIds; getAllData; localSelections"
[S2]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/chartPopulation.ts "getPopulationTest; restrictToPopulation"
[S3]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/ActiveFilterStatus.tsx "owner chips; count tooltip; clear-all"
[S4]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx "SingleBarChart; peer live IDs; explicit aggregate input; selection footer; source reference totals"
[S5]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/DataLayerProvider.tsx "getAggregateResult 954–959; clearAllFilters 1121–1148"
[S6]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts "planMetricCard membership, contributors, states"
[S7]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/rendering.mdx "Row scope and chart definitions; grouped-summary claim"
[S8]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts "getFilteredRows; display search and own filters"
[S9]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/RowsView.tsx "Rows global input followed by DataTable restrictions"
[S10]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/filters.mdx "Existing self-exclusion and local/search explanation"
[S11]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/ChartRenderer.tsx "Registered renderer passes base props without aggregate override"
[S12]: https://github.com/byronwall/explorEDA/commit/63dfa75851ef57bb3782e6d7c1ef104784cd4064 "Exact commit receipt verified through GitHub connector"
[S13]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/notebooks.mdx "Notebook selections local; workspace filter shared"
[S14]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/components/content.tsx "mdxComponents registers WorkedOrder and LiveExample; observed integration convention"
[S15]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/ideas/R051-filter-ownership.md "R051 brief; queue/prior statuses also supplied in packet's local research-queue.md and historical decisions"
[S16]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/LocalFilterStrip.tsx "Current local restriction strip and scope help"
[S17]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx "Workspace filter information in current trace"
[S18]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx "Current membership and contributor accounting"
[S19]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/lib/dataLayerState.ts#L7-L11 "initializeData assigns runtime __ID by stable input order"
[S20]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/live/examples.ts#L550-L579 "Existing saved-filter and workspace-filter live-example wiring"
[S21]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/demos/examples.ts#L449-L481 "Shop-operations demo uses a 500-order dataset"

### External comparison boundary

Current primary sources were consulted, with access date October 22, 2026: [Crossfilter2 API, dimension.group](https://github.com/crossfilter/crossfilter/wiki/API-Reference#dimension_group) describes omission of the associated dimension; [Mosaic Selection](https://idl.uw.edu/mosaic/api/core/selection.html) models source/client ownership; [Observable Plot interactions](https://observablehq.github.io/plot/features/interactions) is a distinct plotting/reactivity reference, not proof of native Mosaic ownership; [Tableau filter actions](https://help.tableau.com/current/pro/desktop/en-us/actions_filter.htm) explicitly names source, target, and clearing outcomes. These limited comparisons support naming owners and scopes accurately. They do not demonstrate comprehension, product equivalence, or demand for an explorEDA feature.
