# R051 — Evidence for filter ownership and self-exclusion

**Research date:** October 22, 2026. **Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA). **Frozen baseline:** `63dfa75851ef57bb3782e6d7c1ef104784cd4064`. **Mode:** research and bounded evaluation; no implementation approval.

## 1. What the evidence establishes

**Preserve the existing filtering behavior and retain the current interface while testing explanations.** Source inspection supports exact, different populations for a chart's context, its selected subset, a headline metric, numeric contributors, and searched tables. It does not support forcing those totals to agree. Existing chips, tooltips, bar status text, local-restriction strips, trace, and documentation already explain much of this model. A focused worked example is a plausible study candidate; a comprehension improvement has not been observed. Sources: [CF], [POP], [STATUS], [BAR], [CARD], [FILTERS], [RENDER].

Two findings require particular care:

- **A chart-local restriction limits its drawing population, while a category selection from that chart can select matching rows outside that population in other views.** The frozen task intentionally exposes this distinction. Sources: [CF], `getAllData`, lines 195–204; [BARDEF], `getFilterFunction`, lines 50–92.
- **The statement that named grouped summaries always use globally filtered rows is too broad for the standard aggregate-bar consumer.** The bar explicitly supplies its peer-context IDs to the aggregate provider. This is a source/documentation contradiction, not an observed incorrect rendered result. Sources: [RENDER], line 52; [BAR], lines 123, 138–151; [PROVIDER], lines 954–959; [RENDERER], lines 57–67.

| Evidence class | Established here | Not established here |
| --- | --- | --- |
| Provenance | Repository owner, exact commit, packet integrity, additional exact-ref source receipts | That the selected packet is a runnable checkout or represents later changes |
| Source behavior | Owner-specific dimensions and the actual consumer chains for ordinary category bars, metric card, table, and Rows | An application/browser pass, timing, accessibility pass, or execution of proposed code |
| Frozen oracle | Hand-enumerated exact IDs and numeric expectations for five scored tasks, warm-up, and notebook side case | That production execution already matches every expected value |
| Human comprehension | A source-visible owner-reconciliation problem can be posed with exact answers | Participant evidence, a measured usability win, prevalence of confusion, or named customer demand |

**Participants: 0. Observed prediction scores: none.** Source reviewers and arithmetic checks are not participants. Proposed research is not delivered behavior. Current UI remains the default if the eventual comparison is inconclusive.

## 2. Access and evidence preflight

### Verified owner and baseline

The GitHub connector returned repository ID `933467100`, owner `byronwall`, full name `byronwall/explorEDA`, public visibility, and default branch `main`. A direct commit read returned exactly [63dfa75851ef57bb3782e6d7c1ef104784cd4064](https://github.com/byronwall/explorEDA/commit/63dfa75851ef57bb3782e6d7c1ef104784cd4064), with the merge message for PR #491 concerning annotation coverage. The audit uses that pinned commit; moving `main` is not a substitute.

The complete remote `packages/explorEDA/src/hooks/CrossfilterWrapper.ts` at the pinned ref was independently compared with its packet payload: **6,855 bytes**, SHA256 **`444f228baffb694c82f7826da6a2eee88ce0296b47ec5e3f59c36b0d1070b483`**, identical bytes. Its returned Git blob SHA-1 was `8560522bd2712fcd371f5472322fc27df3d100e3`.

### Attachment receipts

| Attachment | UTF-8 bytes | SHA256 |
| --- | ---: | --- |
| `pro-prompt(20261022-193246).md` | 9134 | `ed05d34009cba1854e209443e6e921266eb68dc42b7c9c2f10747abb8b649b20` |
| `source-packet(20261022-193246).txt` | 226162 | `c53c80b2a48187f2ed8f0f566d7ccce3c13176062ed9b14c00bd35ff7a7c83a8` |

All **39 packet payloads** matched their declared byte sizes and SHA256 digests. The parser used each header's byte length and checked the intervening separators; it did not normalize whitespace before hashing. Inventory composition is 29 complete baseline files, two R051-only JSON projections, three baseline line excerpts, three historical complete files, and two local additions. A projection's digest authenticates that projection, not an unseen full catalogue file. A line-excerpt digest authenticates its supplied lines, not the complete provider or registry file. The complete provider and example registry were subsequently retrieved at the exact baseline.

**Preflight outcome: GO for bounded source research and the frozen study kit.** Required source, selected catalogue R051, local review, prior dispositions, and decisive consumers are readable. The snapshot is not runnable; product results are explicitly unrun. The integration branch named in the prompt, `codex/filter-ownership-research-2026-10-22`, is context, not a branch created or modified by this research.

Initial public web-reader requests for several pinned GitHub URLs returned `DisabledError`; a direct local network probe was blocked. The purpose-built GitHub connector subsequently succeeded. Those route failures do not imply the commit or files were unavailable. Two guessed paths returned 404: `components/charts/useGetLiveData.ts` and `components/charts/RowChart.tsx`; the actual `.tsx` live-data hook was retrieved, and both frozen category charts use the verified ordinary bar implementation. No behavior claim relies on a failed path.

## 3. Exact population model from actual consumers

The terms below are research notation. They do not propose exposing all of these terms in the UI. The fixture uses two ordinary, non-faceted category-count **bar charts**, no series split, no aggregate override, no entity aggregation, and no calculated fields. More complex chart families require their own consumer proof.

| Set | Definition in ordinary linked mode | Source basis |
| --- | --- | --- |
| Full source `F` | Every loaded source row in the frozen order | [CF], constructor; [COL], lines 16–30 |
| Local population `L_A` | Source rows matching A's chart-local restriction, `channel=Web` | [POP], lines 19–41 |
| Global membership `G` | Every active workspace predicate AND every chart-owned linked predicate | [CF], lines 170–175 |
| Peer context `P_A` | Every workspace predicate AND every other chart owner's linked predicate; omit A's dimension | [CF], lines 92–104, 195–204; external Crossfilter API below |
| A foreground context `C_A` | `P_A ∩ L_A` | [CF], lines 195–204; [LIVE], `useGetLiveIds`, lines 43–58; [BAR], lines 123, 193–200 |
| A selected membership `M_A` | `G ∩ L_A`; in this linked category fixture, also A's own selected subset within `C_A` | [CF], lines 178–185; [BARPLAN], lines 670–708 |
| B context `P_B=C_B` | Omit B's chart dimension; B has no local restriction | [CF], lines 92–104, 195–204 |
| Workspace region context `Q_region` | Omit only the workspace region dimension; retain A's region predicate and B's category predicate | [CF], lines 134–161, 206–209; [PROFILES], lines 88–117 |
| Numeric contributors `V` | Valid finite amount values among card membership `G`; no entity aggregation | [AGG], lines 126–171, 216–217, 248–272; [VALUE], lines 87–103 |
| Table result | Table peer/local membership, table search, and its own column filters; in this fixture the table has no linked or local filter, so `G ∩ search(rush)` | [TABLE], lines 123–140; [TABLEROWS], lines 10–47; [TABLEDEF], lines 55–83 |
| Rows result | Global `G`, then Rows search and Rows-local predicate | [ROWS], lines 30–48; [TABLE], lines 123–140; [TABLEROWS], lines 19–37 |

### Owner identity is the exclusion boundary

`addChart` creates one ID dimension per chart owner. `setWorkspaceFilters` maintains separate dimensions with at most one workspace filter per field. The same field name does not merge chart and workspace owners. Therefore a region chart may omit its own West selection while continuing to obey a workspace East restriction. The workspace region control omits its own East restriction while continuing to obey the chart's West selection. Sources: [CF], lines 32–44, 92–104, 130–161, 195–211.

Chart grouping omits that chart's entire dimension, rather than every predicate mentioning the same field. Conversely, field-distribution controls have additional logic: `useFilteredFieldProfiles` starts from the owner/context group and reapplies the owner's other-field filters. Avoid a universal claim that every control ignores every filter from its owner. Source: [PROFILES], lines 88–117.

### Local drawing population is not automatically a linked predicate

The chart-local filter belongs to the drawing consumer. The normal category-bar filter function uses the selected value predicate on its chart field and does not add `localFilters`. Selecting West in a Web-only region chart can therefore select West/Store rows in the global metric and table. This is why task T1 has six global rows, seven A context rows, and four selected rows inside A. These are different correct membership questions. Sources: [POP]; [CF], `getAllData`; [BARDEF], lines 77–92.

### Search and displayed membership

`getFilteredRows` first selects positive live-item IDs. It lowercases the query and tests a substring against every nonnull row value except `__ID`, then ANDs the table's filters. Search is not limited to displayed columns. The frozen search tokens occur only in `note`, making the answer unambiguous. A table chart's column predicates can link through its definition, while its `globalSearch` is absent from that linked filter function. Rows receives global IDs before the same display-layer search/filter. Sources: [TABLEROWS], lines 15–37; [TABLEDEF], lines 55–83; [ROWS], lines 35–48.

The result arrays in this report mean **complete filtered table membership**, not the subset of rows physically mounted by a virtualized viewport. A browser proof must collect complete IDs through an appropriate test seam or deterministic traversal rather than equating visible DOM rows with the result set.

### Clear-one and clear-all

A chip's remove action removes that one chart-filter entry, that workspace-field filter, or that local search/Rows predicate. `clearAllFilters` replaces chart `filters` with empty lists, clears data-table searches, clears workspace filters, and clears Rows filters/search. It spreads the rest of each chart, preserving `localFilters`. Thus T5 returns global membership to all twelve rows while A still draws its seven Web rows. Sources: [STATUS], lines 330–345, 357–386; [PROVIDER], lines 1121–1148.

An absent workspace group after clear-all is not an empty group and is not an already materialized all-source context. In the oracle, `Q_region=null` means that no active workspace-region group key exists.

## 4. Frozen twelve-row evidence and five sequential tasks

Fixture identifier: **`R051-orders-v1`**. Source identity is the explicit `orderId`. Order is fixed. The actual initialization helper assigns `__ID` from the zero-based array index ([INIT], lines 7–11). For a later provider proof, assert `O01→0` through `O12→11` before comparing IDs. This is an identity contract for this snapshot, not a claim of stable runtime IDs across replacements. The complete immutable JSON and executable proof plan are embedded in the companion proof report; the data and decisive memberships are reproduced here so this report stands alone.

Frozen fixture bytes: **2,469**, SHA256 `6aea7029cc63bc620c8df4f2f786e7357377b730d682157a3c442c1ea36a8867`. Task-state bytes: **1,032**, SHA256 `4479db081b4179a2648c9b90f4532ac1ab5d9eca8726b482ee4421a0aa511f63`. Independently hand-written oracle bytes: **9,822**, SHA256 `0485e11e73f34a576c14a19c895cf9714ecbc37c8c2e61249ae75b1377f24e79`.

| Source ID | Region / category / channel | Amount; note; status |
| --- | --- | --- |
| O01 | West / Furniture / Web | `100`; rush red; Open |
| O02 | West / Tech / Web | `200`; standard blue; Open |
| O03 | West / Furniture / Store | `null`; rush blue; Closed |
| O04 | West / Tech / Store | `0`; rush red; Open |
| O05 | East / Furniture / Web | `50`; standard red; Open |
| O06 | East / Tech / Web | `"invalid"`; rush blue; Closed |
| O07 | East / Furniture / Store | `150`; rush red; Open |
| O08 | East / Tech / Store | `300`; standard blue; Open |
| O09 | West / Tech / Web | `null`; rush red; Closed |
| O10 | South / Furniture / Web | `80`; rush blue; Open |
| O11 | South / Tech / Store | `120`; standard red; Closed |
| O12 | West / Furniture / Web | `-20`; standard red; Open |

**Setup:** A is “Region — Web orders”, a region category-count bar with chart-local `channel=Web`. B is “Category — all channels”, a category-count bar without a local restriction. The card sums `amount` over global membership, without own/local predicates or `entityField`. A data table is titled “Order table”; it has no linked column filter in this workload. Rows has its own search and `status` filter. Field values retain the shown JSON number/null/string distinctions. The warm-up T0 has no active selections/searches. T1–T5 are the five scored tasks; each task starts from the previous task's final state.

| Task | Action and retained state | What must be predicted before revealing the outcome |
| --- | --- | --- |
| T1 | Select A `region=West` | Global membership versus A's Web-only context and selected subset; card contributors |
| T2 | Keep A West; select B `category=Tech`; add workspace `region=West`; search Order table for `rush`; search Rows for `red` and filter Rows to `status=Open` | Same-field owners, B self-exclusion, distinct table and Rows results, and zero/null numeric handling |
| T3 | Change only workspace region to `East`; retain A West, B Tech, and both searches/Rows filter | Empty global intersection versus nonempty A context, and the workspace control's own excluded dimension |
| T4 | Remove only A's West selection | Workspace East and B Tech survive; A's Web restriction and both local searches remain |
| T5 | Use Clear all filters | Chart/workspace selections and table/Rows searches clear; A's local Web population remains |

The following are **manual source-derived predictions; product execution UNRUN**. All IDs refer to `orderId`, never to a count alone.

#### T1 exact membership key

- Global/card membership `G`: **6** — {O01, O02, O03, O04, O09, O12}.
- A peer context before local restriction `P_A`: **12** — {O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12}.
- A foreground context `C_A`: **7** — {O01, O02, O05, O06, O09, O10, O12}; A selected membership `M_A`: **4** — {O01, O02, O09, O12}.
- B foreground/peer context `P_B`: **6** — {O01, O02, O03, O04, O09, O12}.
- A main-bar counts: West 4, East 2, South 1. B main-bar counts: Furniture 3, Tech 3.
- Order-table result: **6** — {O01, O02, O03, O04, O09, O12}. Rows result: **6** — {O01, O02, O03, O04, O09, O12}.
- Workspace region context `Q_region`: absent group key.

#### T2 exact membership key

- Global/card membership `G`: **3** — {O02, O04, O09}.
- A peer context before local restriction `P_A`: **3** — {O02, O04, O09}.
- A foreground context `C_A`: **2** — {O02, O09}; A selected membership `M_A`: **2** — {O02, O09}.
- B foreground/peer context `P_B`: **6** — {O01, O02, O03, O04, O09, O12}.
- A main-bar counts: West 2, East 0, South 0. B main-bar counts: Furniture 3, Tech 3.
- Order-table result: **2** — {O04, O09}. Rows result: **1** — {O04}.
- Workspace region context `Q_region`: {O02, O04, O09}.

#### T3 exact membership key

- Global/card membership `G`: **0** — ∅.
- A peer context before local restriction `P_A`: **2** — {O06, O08}.
- A foreground context `C_A`: **1** — {O06}; A selected membership `M_A`: **0** — ∅.
- B foreground/peer context `P_B`: **0** — ∅.
- A main-bar counts: West 0, East 1, South 0. B main-bar counts: Furniture 0, Tech 0.
- Order-table result: **0** — ∅. Rows result: **0** — ∅.
- Workspace region context `Q_region`: {O02, O04, O09}.

#### T4 exact membership key

- Global/card membership `G`: **2** — {O06, O08}.
- A peer context before local restriction `P_A`: **2** — {O06, O08}.
- A foreground context `C_A`: **1** — {O06}; A selected membership `M_A`: **1** — {O06}.
- B foreground/peer context `P_B`: **4** — {O05, O06, O07, O08}.
- A main-bar counts: West 0, East 1, South 0. B main-bar counts: Furniture 2, Tech 2.
- Order-table result: **1** — {O06}. Rows result: **0** — ∅.
- Workspace region context `Q_region`: {O02, O04, O06, O08, O09, O11}.

#### T5 exact membership key

- Global/card membership `G`: **12** — {O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12}.
- A peer context before local restriction `P_A`: **12** — {O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12}.
- A foreground context `C_A`: **7** — {O01, O02, O05, O06, O09, O10, O12}; A selected membership `M_A`: **7** — {O01, O02, O05, O06, O09, O10, O12}.
- B foreground/peer context `P_B`: **12** — {O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12}.
- A main-bar counts: West 4, East 2, South 1. B main-bar counts: Furniture 6, Tech 6.
- Order-table result: **12** — {O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12}. Rows result: **12** — {O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12}.
- Workspace region context `Q_region`: absent group key.


Additional exact reconciliation:

- `L_A = {O01,O02,O05,O06,O09,O10,O12}` throughout all five tasks. It contains seven rows, including a null and invalid amount; those values do not remove category-count membership.
- T1 `M_A = {O01,O02,O09,O12}` while `G = {O01,O02,O03,O04,O09,O12}`. O03 and O04 are Store orders admitted to global membership by A's region predicate.
- T2 A's context and selected subset are `{O02,O09}`; B's context is `{O01,O02,O03,O04,O09,O12}`. B counts Furniture 3 and Tech 3, while global membership is only its selected Tech subset `{O02,O04,O09}`.
- T3 `P_A={O06,O08}` and `C_A={O06}` even though `G=∅`. `Q_region={O02,O04,O09}` because the workspace control omits workspace East but retains chart A West and chart B Tech. This is the most direct same-field ownership task.
- T4 `Q_region={O02,O04,O06,O08,O09,O11}` after A's predicate is removed. A's context is still only `{O06}`; B's context is `{O05,O06,O07,O08}`.
- T5 removes the active workspace group key. A's main-bar region counts remain West 4 / East 2 / South 1; B returns to Furniture 6 / Tech 6.

### Numeric contributors remain separate from membership

| State | Valid contributor IDs; excluded numeric IDs | Sum or card state |
| --- | --- | --- |
| T0 | Valid {O01, O02, O04, O05, O07, O08, O10, O11, O12}; excluded {O03, O06, O09} | 980 |
| T1 | Valid {O01, O02, O04, O12}; excluded {O03, O09} | 280 |
| T2 | Valid {O02, O04}; excluded {O09} | 200 |
| T3 | Valid ∅; excluded ∅ | `No rows` (empty membership; no numeric value) |
| T4 | Valid {O08}; excluded {O06} | 300 |
| T5 | Valid {O01, O02, O04, O05, O07, O08, O10, O11, O12}; excluded {O03, O06, O09} | 980 |

O04's numeric zero is a valid contributor. O12's negative amount is also valid. O03/O09 nulls and O06's invalid text remain members when filters admit them, while they do not contribute to a numeric sum. T3's card state is **empty**, so the expected UI text is `No rows`; it is not a numeric zero. A nonempty membership set containing only invalid measures would instead yield `No valid values`. The latter is a defined failure-example distinction, not an additional executed task. Sources: [VALUE], lines 87–103; [AGG], lines 38–52, 126–171; [CARDPLAN], lines 80–97.

The metric trace's contributor list and trace-row extraction include excluded numeric rows as well as included contributors. In T2 it can account for all three membership IDs even though only O02 and O04 are numeric contributors. Sources: [CARDTRACE], lines 18–20; [TRACEROWS], lines 9–10; [CARDTRACEBODY], lines 27–58.

### Notebook mode is a separate case

Initialize `localSelections=true` before registering charts, with the stored T3 selections retained. Chart dimensions then do not narrow other charts; workspace East still applies. The manual prediction is:

- Global/card membership `{O05,O06,O07,O08}`; valid numeric contributors `{O05,O07,O08}`; excluded numeric input `{O06}`; sum **500**.
- A foreground context `{O05,O06}`; no row in it matches A's own West highlight. `getChartFilteredRowIds(A)` is `{O05,O06}`, not the empty highlighted subset.
- B foreground context is all four East rows; its own Tech highlight covers `{O06,O08}`.
- Order-table search result `{O06,O07}`; Rows search/filter result `{O05,O07}`.
- The workspace region group omits its sole active dimension and has all twelve source IDs.

This is a separately labeled mode control, not a sixth scored linked-mode task or proof that toggling a live wrapper boolean recomputes existing dimensions. Sources: [CF], lines 40–44, 68–84, 143–150; [NOTEBOOKS], lines 43, 85; [BARPLAN], selected/opacity logic; [CARD], lines 35–38.

## 5. Current wording and controls mapped to the tasks

The proposed comparison names four research conditions: **A**, current UI plus existing documentation; **B**, improved tooltip plus one focused worked example; **C**, one contextual sentence in the existing trace; **D**, a temporary context-versus-selected comparison. B, C, and D are candidate explanations, not shipped changes. The provisional preference is to test B against A before adding UI.

Variant A must include existing documentation, explanatory tooltips, ordinary bar status, trace access, and source-row inspection. Withholding these from A would manufacture an advantage for a new explanation. Wording below is source-attested; visibility, discoverability, and comprehension have not been measured.

| Current surface | Existing message or behavior | Tasks and remaining question |
| --- | --- | --- |
| Global count | `Showing N of M rows`; tooltip names every workspace/chart filter and says table searches/Rows filters apply only to their own table | T1–T5: identifies `G`; does the reader connect it to each chart's context? [STATUS], 423–441 |
| Workspace chip | Visible `Workspace ·` owner; help explains that no chart owns it and every chart is narrowed | T2–T4: distinguishes workspace region from A's region selection. [STATUS], 309–333 |
| Chart chip | Visible predicate; chart owner in show/remove accessible labels and tooltip; focus/hover highlights owner, click locates it | T1–T4: owner can be discovered, but same-field chips may require inspection. [STATUS], 367–386 |
| Local chart strip | Visible `Only` and formatted filter; help explains that other charts ignore these drawing restrictions | T1, T4, T5: A remains Web-only, including after clear-all. The actual panel attaches the strip. [LOCAL], 12–34; [PANEL], 622–625, 1036 |
| Table search chip | Table title, search label, and query; navigation locates the owning table | T2–T4: search ownership is explicit, and global-count help supplies its locality. [STATUS], 247–264, 347–364 |
| Rows predicate/search chips | `Rows ·` owner and help explaining that these restrictions apply only there | T2–T4: Rows can be empty while global membership and the other table are nonempty. [STATUS], 335–345, 357–364 |
| Bar selected/context status | Displays selected main-bar rows, all main-bar context rows, and selected labels | T1–T4: the numeric context/selected comparison already exists. New copy must add an owner explanation, not claim the counts are absent. [BAR], 383–421 |
| Category-bar scope note | Explains other-filter context and selection by color | T1–T4: explains retained alternatives. [BARPLAN], 746–751; [BARTRACEBODY], 166–168 |
| Workspace trace note | Names active workspace predicates and explicitly includes the traced chart in their scope | T2–T4: existing contextual ownership evidence. [TRACEPANEL], 125–143, 194 |
| Metric trace | Separate matching, used, and excluded counts, plus contributor inspection | T1, T2, T4: numeric contribution is not selection membership. [CARDTRACEBODY], 9–58 |
| Clear-one/clear-all | Remove actions target named owners; clear-all help lists workspace/chart filters, table searches, and Rows filters | T4–T5: local population survival still needs the strip/docs to complete the explanation. [STATUS], 330–386, 543–555; [PROVIDER], 1121–1148 |
| Chip overflow | One-line strip with a popover listing remaining filters/searches | All tasks at narrow widths: potential inspection cost, not a measured failure. [STATUS], 390–416, 490–540 |

### Existing documentation is not absent

- **Filters** already says an originating bar keeps its unselected alternatives, table search/Rows filters are local, chart-local filters restrict drawing, and workspace filters affect every chart. It also documents clear-one and clear-all and includes a saved-filter example. Source: [FILTERS], lines 3–19.
- **Rendering** already introduces full, peer-filtered, and globally filtered populations. Its brief definitions omit workspace/local qualifications, and its grouped-summary sentence is overbroad for standard aggregate bars. Source: [RENDER], lines 39–58.
- **Workspace** already documents chip navigation, owner removal, and workspace filtering. Its clear-all prose omits workspace filters even though the tooltip and implementation include them. Source: [WORKSPACE], lines 30–32; [STATUS], 543–555.
- **Notebooks** already distinguishes local chart selections from linked dashboards and says a notebook filter line still narrows all charts. Source: [NOTEBOOKS], lines 43, 85.
- **Trace** documents trace entry, computed inputs, filters, and source rows. It excludes data-table/pivot/summary-table/notes mark traces; do not promise those trace surfaces in the study. Source: [TRACEDOC], lines 3, 9–28.

An inferred explanation gap is therefore **assembly across existing surfaces**: a reader must reconcile owner, consumer, local population, numeric validity, and clear semantics. No participant has yet been observed failing that assembly.

## 6. Contradictions and tempting false conclusions

### C01 — Named grouped summaries and the actual aggregate-bar consumer

The documentation says named grouped summaries use globally filtered rows ([RENDER], line 52). The verified standard display chain is:

1. `PlotChartPanel` mounts `ChartRenderer` ([PANEL], near 1085).
2. `ChartRenderer` takes the registered component and passes the base chart props; it does not supply `aggregateResult` ([RENDERER], lines 26–29, 57–67).
3. The bar definition registers `BarChart` ([BARDEF], lines 26–33).
4. `BarChart` obtains `liveIds` from `useGetLiveIds(settings, facetIds)` and passes them explicitly to `getAggregateResult` ([BAR], lines 123, 138–151).
5. The hook reads positive chart live items, already restricted to the chart's local population by the wrapper ([LIVE], lines 43–58; [CF], 195–204).
6. The provider uses explicit `sourceIds`; only an omitted argument falls back to global IDs ([PROVIDER], lines 954–959).

**Finding:** the ordinary registered aggregate-bar path uses peer/local context. A provider call without source IDs uses global membership. An explicit aggregate-result override is a separate path whose population must be checked at that caller. The count-versus-summary distinction remains essential because counts use all admitted rows while numeric summaries use valid contributors; it is not a license to assert different filter populations universally. In a proposed T2 B aggregate-bar control using the same peer context, Furniture sums to **80** (O01=100 and O12=−20; O03 excluded) and Tech sums to **200** (O02=200 and O04=0; O09 excluded), totaling **280** across contextual groups. The card sums only globally selected Tech to **200**. These are manually derived/source-predicted values, not executed aggregate-bar results. The recommended correction is narrowly consumer-specific documentation, with a later runnable check. No behavior rewrite is justified by this mismatch.

### C02 — Foreground context versus full-source reference bars

Ordinary category counts use peer/local `liveIds`. Their `allValues` are obtained with no ID argument; that hook returns the full field column. Non-faceted bars enable reference totals. These totals are a separate comparison layer, present when the reference is larger than the foreground. Sources: [BAR], lines 123–125, 193–218; [COL], lines 16–30; [BARPLAN], lines 235–275, 658–666.

For A, unfiltered local foreground counts are **West 4 / East 2 / South 1**, whereas full-source reference counts are **West 6 / East 4 / South 2**. Do not label the latter as A's local baseline or sum them into the foreground. The faint reference may appear behind zero foreground counts, and category slots can remain at zero. Consequently, “every visible label/rectangle represents a selected row” is false. T3 legitimately has A foreground `{O06}` while global membership is empty; reference marks do not change either set.

### C03 — Empty global membership does not force empty originating context

T3 deliberately combines chart A West with workspace East. A's own dimension is omitted from its context, so it can show O06 while the global intersection is empty. Changing filters to force the two totals equal would change the semantics being researched. Sources: [CF]; [BAR]; the frozen manual IDs above.

### C04 — Matching rows, numeric contributors, and traces are different evidence

T2's global set has three IDs, numeric sum has two valid inputs, and the trace can list all three members. Excluding O09 from arithmetic does not remove it from `G`. A different headline and distribution total is not itself a wrong result. Prove an error by the exact consumer contract and IDs, not by equality of unrelated counts. Sources: [CARDPLAN], [AGG], [TRACEROWS].

### C05 — Clear all and notebook mode do not erase every distinction

Clear-all leaves `localFilters`; notebook mode disables linked chart dimensions while retaining workspace predicates. A global set, own highlight, and chart-local population may therefore differ after these operations. Current simple wording must not be promoted into an equation for every mode. Sources: [PROVIDER], 1121–1148; [CF], 40–44, 79–82; [NOTEBOOKS], 85.

## 7. Narrow external primary-source ledger

All pages below were accessed **2026-10-22**. They are semantic or explanatory precedents, not evidence of explorEDA customer demand or participant comprehension. No vendor program was executed. Each entry distinguishes documented fact from inference.

| Primary source and precise section | Verified claim | Relevance and limit |
| --- | --- | --- |
| [Crossfilter2 API Reference](https://github.com/crossfilter/crossfilter/wiki/API-Reference#dimension_group), `dimension.group`, `crossfilter.groupAll`, `dimension.top` | A dimension grouping omits its associated dimension's filter; global grouping and dimension top observe all applicable active filters. | Supports dimension-specific explanation. explorEDA's owner-to-dimension mapping still comes from its own source. No universal rendered-chart contract or usability result follows. |
| [Mosaic Selection](https://idl.uw.edu/mosaic/api/core/selection.html), resolution, `Selection.crossfilter`, `update`, `predicate(client)` | Selection clauses have source/client ownership. Cross-filtered resolution skips a clause for its associated clients. | Supports naming owner and consuming view. Mosaic's configurable resolution/empty-state behavior is not imported into explorEDA and supplies no demand evidence. |
| [Observable Plot Interactions](https://observablehq.github.io/plot/features/interactions), Pointer, Selecting, Custom reactivity | The reviewed page documents pointer filtering and external reactive inputs; its Selecting section describes direct-manipulation point selection as under development. | Plot and Mosaic are distinct projects. Do not attribute Mosaic's client-exclusion model to Plot or treat the documentation as an exhaustive execution test. |
| [Tableau Filter Actions](https://help.tableau.com/current/pro/desktop/en-us/actions_filter.htm), action source/target and clearing selection | Filter actions name sources and targets; clearing can retain a filter, show all values, or exclude all values. | Supports explicit owner and clear-action language. These options do not justify adding configurable clearing modes to explorEDA. |
| [Tableau Highlight Actions](https://help.tableau.com/current/pro/desktop/en-us/actions_highlight.htm), opening explanation and highlighter | Highlighting emphasizes marks while retaining dimmed context. | A useful precedent for distinguishing context from selected membership, without proving that a new comparison control improves comprehension. |

Only one established BI product, Tableau, was compared. The report does not repeat the separate Mosaic-integration survey or infer market demand from these patterns.

## 8. Prior dispositions and catalogue limits

The selected R051 catalogue brief and JSON projection identify priority 5, candidate status, and the acceptance condition of at least four correct predictions in five tasks without additional persistent controls. The local review disposition is `investigate`, with rejection when existing explanations suffice or new wording confuses readers. The brief retains an older catalogue baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`; this report's executed source reads are pinned to `63dfa75851ef57bb3782e6d7c1ef104784cd4064`. Sources: [R051], [IDEAS], [REVIEW].

| Historical supplemental ref | What is adopted as a research constraint | What is not assumed |
| --- | --- | --- |
| TN decisions at `3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb` | Fair current-controls comparator; separate entity/query/linked/local scope; pair visible proof with docs/example | Navigation feature approval or settled population/lifecycle choices. [TN] |
| MS decisions at `6cab0a1bcf80ea0a72d9441b7545db46bc2697ac` | Distinguish stage-specific membership and valid numeric contributors; keep exact ledger; defer a lesson without demonstrated reader need | A universal missing-state taxonomy, new provenance platform, or execution of historical repairs in this session. [MS] |
| SI decisions at `191dc9343b1c658b082d30138f972949f4c43b06` | Require exact membership and retain workspace/local ownership awareness | Implementation of proposed mapping/replacement/identity repairs; R051 does not undertake them. [SI] |

The attached **local-addition** queue says R026/PR465, R043/PR466, R077/PR484, and R001/PR492 are completed research in open review; it places **R086 next, then R031**, reuses R011/PR461, and marks R008/PR464 complete. Those are queue-provided dispositions, not an independently refreshed claim that every PR merged or its application work shipped. The three supplied historical decision files constrain this study; their exact refs are not mistaken for baseline source. No customer demand or participant success is established by that queue.

Current-analysis-trust calls for exact membership and numeric-contributor checks and says historical browser evidence is not a fresh pass. Its broader export/history/restore workload remains outside this bounded five-task R051 study. Source: [TRUST].

## 9. Verified docs and example integration points

These reads justify destinations for a later bounded proposal. Nothing in this section describes implemented work.

- The existing full example `shop-operations` is registered in [EXAMPLES], lines 449–481, with its 500-row data source. It is not the proposed twelve-row fixture.
- Existing docs live examples include `saved-filter` using Lorenz data and `workspace` using two shop category charts. Their declarations include backing data, saved layout, a registered full-example ID, narrow screenshot description, and scripted steps. Sources: [LIVEEXAMPLES], lines 60–76, 550–579.
- The generic live-example loader fetches text and parses it with `readTableText`, then mounts the actual `ExplorEda` component. Native JSON null/number/text fidelity is not established merely by naming a CSV. Source: [LIVEEXAMPLE], lines 111–130, 208–213.
- A direct custom-component convention already exists: `DocsSite.tsx` renders MDX with `mdxComponents`; `components/content.tsx` imports and registers `WorkedOrder`, and rendering.mdx uses it. Sources: [DOCSSITE], lines 25, 47–57; [MDXCONTENT], lines 15, 287, 337–349; [RENDER], line 37.
- Therefore one **proposed** `apps/demo/src/docs/live/FilterOwnershipExample.tsx` can mount existing `ExplorEda` with the imported frozen JSON and be registered in the existing MDX component table. Embed it in `apps/demo/src/docs/pages/filters.mdx` and/or `rendering.mdx` in the same visible milestone. This avoids inventing a route or silently converting nulls to another missing-value representation. Exact integration still requires local implementation review and proof.
- The existing docs gate validates registered examples/live IDs and related data/targets; it does not automatically establish the membership truth of new prose or a custom component's assertions. The later browser proof must explicitly cover the proposed component. Sources: [DOCSGATE], lines 76–84, 117–148, 166–179; [GUIDE], Tests section.
- Generic docs live examples use a screenshot fallback at narrow widths. A 390px screenshot check is not evidence of interactive pointer/keyboard performance at that width. Later proof should distinguish the docs fallback from the actual full or custom workspace. Source: [LIVEEXAMPLE], lines 84–88, 178–230.

The smallest justified documentation correction is to scope the grouped-summary claim to its consumer and accurately qualify workspace/local/clear semantics. Adopting a worked example or trace sentence as a comprehension improvement still needs the prescribed comprehension comparison. No persistent controls, saved filter union expansion, new population evaluator, Crossfilter replacement, identity repair, routing platform, or public API is approved.

## 10. Executed evidence versus unrun checks

Existing test **source** corroborates the contracts without providing a fresh pass: `CrossfilterWrapper.test.ts` covers all-linked membership, local selections, local population isolation, missing local fields, workspace self-exclusion, replacement/removal of workspace predicates, and more than 32 dimensions ([CFTEST], test declarations at lines 24, 52, 77, 122, 158, 191, 200, 212, 229). `ActiveFilterStatus.test.tsx` covers owner labels, removing one entry without clearing siblings, chart navigation versus removal, overflow, and clearing workspace predicates ([STATUSTEST], lines 38, 74, 194, 221, 391). These were read; their test runners were not executed.

| Check | Status | What a later pass must prove |
| --- | --- | --- |
| Attachment and packet integrity | Executed: 39/39 payload hashes and sizes match | Preserve byte-identical inputs when repeating the analysis |
| Repository owner / commit / remote wrapper comparison | Executed read-only; exact commit and wrapper verified | Recheck the target commit before later integration if the baseline changes |
| Additional source receipts | Executed read-only; complete exact-ref files and blob checks listed below | Never substitute current-main source silently |
| Manual fixture/oracle | Executed local stdlib-only checker: **121 assertions passed**, covering T0–T5, notebook mode, zero/all-invalid/empty distinctions, and grouped sums against independently hand-written expected literals | Keep expected IDs independent of production evaluators; this arithmetic/set verification is not a product test |
| Product wrapper/component tests | **UNRUN** | Actual global, peer/local, workspace-control, numeric-contributor, table/Rows, clear, and notebook IDs match the frozen answers |
| Browser pointer and keyboard tasks at 1280, 783, and 390px | **UNRUN** | Displayed wording, accessible owner names, trace availability, focus, clear actions, and full result membership agree; document fallback versus interactive surfaces |
| `pnpm check` and `pnpm check:pr` | **UNRUN** | Later repository gates after a separately authorized change |
| Moderated five-task A/B/C/D comparison | **UNRUN; n=0** | At least four of five exact source-ID/scope predictions per participant, with fair exposure, counterbalancing, and separate terminology/effort recording |

No downloaded program, application bundle, or production evaluator was executed. No repository mutation, commit, PR, paid service, implementation, or participant recruitment was performed. The finite hand ledger can establish expected correctness; only observed participants can establish human comprehension benefit. Retain the current interface when the latter evidence is inconclusive.

## Appendix A — Complete packet inventory

Every row below was verified against its declared payload size and SHA256. **B** is the exact baseline `63dfa75851ef57bb3782e6d7c1ef104784cd4064`; **TN**, **MS**, and **SI** are the historical refs given below their group headings; **Local** means attached local addition, not committed baseline source. Byte hashes for projections/excerpts apply to those supplied payloads only.

### B — baseline: `63dfa75851ef57bb3782e6d7c1ef104784cd4064`

| Source path | Kind; bytes | SHA256 |
| --- | --- | --- |
| [packages/explorEDA/src/components/charts/BarChart/barPlan.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/barPlan.ts) | complete; 24602 | `a449547474e1c305aa31c68e6255e0ba1ff17f7897533b03cd0ad77eff7118dd` |
| [packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx) | complete; 7258 | `f229d8e75ae2c5f3604e7df9fbc28c25a6d5fafd31dec3eda0ffbbbb5bd89813` |
| [packages/explorEDA/src/components/charts/RowChart/definition.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/RowChart/definition.ts) | complete; 1500 | `e4fc072a508902d353e265bbdce076faaa1de81985aa49ef970e10db729fa98f` |
| [packages/explorEDA/src/types/ChartTypes.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/types/ChartTypes.ts) | complete; 7239 | `af8e1bfd423816317b3e37965f8231c722ece77f397bfb54598ee5499ac5e61e` |
| [packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts) | complete; 6357 | `cd8a3a8f2fe0e9b958027a58348934b11b5ce1196f66b4800d10d1cbaba7447e` |
| [AGENTS.md](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/AGENTS.md) | complete; 4033 | `802990c1bacd76b4b867239da78fd011fb32653f891d4a88560e9ee629979a33` |
| [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/agent-guide.md) | complete; 19985 | `0f7eb4898ca494692c5157b5164d368e4591dc1838513e8ec111a4ae03d7d83f` |
| [README.md](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/README.md) | complete; 10263 | `1f05b6c4992b07d1fc2b38d7bf9273db9e4a3a0d94513b7265e13b81cd7c5e28` |
| [package.json](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/package.json) | complete; 1258 | `f9b14daf225872f605d9435ddfb46fdede88b203c87a0e8507fe20743536f6e3` |
| [docs/intent/research-ideas-100/ideas/R051-filter-ownership.md](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/ideas/R051-filter-ownership.md) | complete; 3365 | `dc280f8285a1e4faa2b41ea917d968ec537b32f141a965d90f51e1e2ab4ed56b` |
| [docs/intent/current-analysis-trust/intent-brief.md](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/current-analysis-trust/intent-brief.md) | complete; 3006 | `d6b2d620753c1ea532fffcb1cb43cc42711e03daa898e989a7f283f475186bd7` |
| [packages/explorEDA/src/hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/CrossfilterWrapper.ts) | complete; 6855 | `444f228baffb694c82f7826da6a2eee88ce0296b47ec5e3f59c36b0d1070b483` |
| [packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts) | complete; 8386 | `a193e9ec416216098d5406a024f4799733ed106867ee57a311a4a57afd49b109` |
| [packages/explorEDA/src/hooks/applyFilter.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/applyFilter.ts) | complete; 1974 | `d8f0610999aa93372bbbb29d9811d9106b71e1c40675b5bc3f3714ea5bbc3953` |
| [packages/explorEDA/src/lib/chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/chartPopulation.ts) | complete; 1425 | `3108817ced390197b9b90708d5ee76386c992470716d9326adbc12ce1d0bab86` |
| [packages/explorEDA/src/components/ActiveFilterStatus.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/ActiveFilterStatus.tsx) | complete; 19764 | `fdf70a73786eb604f0192a0cfe6dda5724188be82a4394f5c3b2bef361dc197f` |
| [packages/explorEDA/src/components/ActiveFilterStatus.test.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/ActiveFilterStatus.test.tsx) | complete; 12539 | `f73a7467d4241a6e363a764f1cefbabd33a415cbee3427bfce6c52ab4aa7c0d1` |
| [packages/explorEDA/src/components/LocalFilterStrip.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/LocalFilterStrip.tsx) | complete; 1271 | `f2851abd2c6929fe11d180a181b7997bfedf33884fdd9304c7f692bbe75ed2a0` |
| [packages/explorEDA/src/components/RowsView.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/RowsView.tsx) | complete; 1758 | `34c1d5c2df55089d49c3711c6b65548f8652ad1f4285e5111ef37569c52024c0` |
| [packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts) | complete; 5528 | `ff7f9323677a238e54c53c16d4e143254ace23471a20d9f83d0ff3c962d8298c` |
| [packages/explorEDA/src/components/charts/MetricCard/metricCardTrace.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/metricCardTrace.ts) | complete; 935 | `81949272b9e6551b279f11fda60f13789b00a37e78f45a2ecf5bd56682956bda` |
| [packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx) | complete; 9190 | `8296f16ebb4f6ad3734f24463f0f8172369c6de0f43db234e07b6bdd71f0be9b` |
| [packages/explorEDA/src/components/charts/trace/TraceBodies.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/TraceBodies.tsx) | complete; 8365 | `4eac440729653164bd28716dd25fa504fe4ec4b760b2becce7062ab9a4812327` |
| [packages/explorEDA/src/components/charts/trace/traceRows.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/traceRows.ts) | complete; 1201 | `39968b571109484599663a0249b87632a33aeb6d12df541b14040f7cb8c24a9f` |
| [apps/demo/src/docs/pages/filters.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/filters.mdx) | complete; 1298 | `2900d282a67aac459cef111e19e227f55df5fd0cd2cff40721ee9d3059e9cc70` |
| [apps/demo/src/docs/pages/rendering.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/rendering.mdx) | complete; 2425 | `010775f270efc8dce0e9d250212cdee816a90b49b162ac9918d6101844c7b950` |
| [apps/demo/src/docs/pages/workspace.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/workspace.mdx) | complete; 5103 | `cc3af0ccf8c55addcbc16b519f637c689ecdd960b173cb50c6283ab9daa50ece` |
| [apps/demo/src/docs/pages/notebooks.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/notebooks.mdx) | complete; 6593 | `fc4068bc423b0346dc9a59946131cabd8e3b2e8c87fb54bed9c7a1ffa260086a` |
| [apps/demo/src/docs/pages/trace.mdx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/trace.mdx) | complete; 1259 | `0506cf10ef5e2b8bb64de9956e2f478c7a3a24526da6123f6f416d00f8f57922` |
| [docs/intent/research-ideas-100/ideas.json](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/ideas.json) | R051 JSON projection; 1997 | `f07f29f8d833e6d1ed5ccd3c274762fb0bac431bd205d9a52270f141bd4f7b22` |
| [docs/intent/research-ideas-100/review.json](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/review.json) | R051 JSON projection; 329 | `2a326e1aab82b58a66543e5c75f029c177048801192b797ef4fc645f71f02628` |
| [packages/explorEDA/src/providers/DataLayerProvider.tsx:660-750](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/DataLayerProvider.tsx#L660-L750) | line excerpt; 2926 | `b8dfc810dbf4686df14cda76e094f5155791c1de1629142738522400e1c64fe3` |
| [packages/explorEDA/src/providers/DataLayerProvider.tsx:1110-1155](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1110-L1155) | line excerpt; 1518 | `8b9dba06c8f292f802c66b48f67f2a66d10a61bfe5c3b44ccc6abd7eada9d5fe` |
| [apps/demo/src/demos/examples.ts:1-130](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/demos/examples.ts#L1-L130) | line excerpt; 2823 | `1070dbc74f96298916d225000d48ecd2d148b82bd64af1942ba48f889655b0db` |

### TN — historical complete: `3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb`

| Source path | Kind; bytes | SHA256 |
| --- | --- | --- |
| [docs/research/task-navigation-2026-10-20/decisions.md](https://github.com/byronwall/explorEDA/blob/3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb/docs/research/task-navigation-2026-10-20/decisions.md) | historical complete; 3432 | `02a8c2d33ead9428dc750a0a63a8ec0ac1d2c030b11058624e61b3f01d2ea6fb` |

### MS — historical complete: `6cab0a1bcf80ea0a72d9441b7545db46bc2697ac`

| Source path | Kind; bytes | SHA256 |
| --- | --- | --- |
| [docs/research/missing-state-accounting-2026-10-21/decisions.md](https://github.com/byronwall/explorEDA/blob/6cab0a1bcf80ea0a72d9441b7545db46bc2697ac/docs/research/missing-state-accounting-2026-10-21/decisions.md) | historical complete; 3247 | `eb2a3e73b4d40741d944595151fd1051c84ac2086a90cfa73b7911dfbf045f47` |

### SI — historical complete: `191dc9343b1c658b082d30138f972949f4c43b06`

| Source path | Kind; bytes | SHA256 |
| --- | --- | --- |
| [docs/research/selection-identity-2026-10-22/decisions.md](https://github.com/byronwall/explorEDA/blob/191dc9343b1c658b082d30138f972949f4c43b06/docs/research/selection-identity-2026-10-22/decisions.md) | historical complete; 5124 | `813da88534074087dca4a7c8645fddfd06e3f276ab60f30255cea98f75eecdaf` |

### Local — attached additions: `local addition`

| Source path | Kind; bytes | SHA256 |
| --- | --- | --- |
| `docs/research/filter-ownership-2026-10-22/pro-prompt.md` | complete; 9134 | `ed05d34009cba1854e209443e6e921266eb68dc42b7c9c2f10747abb8b649b20` |
| `docs/research/filter-ownership-2026-10-22/research-queue.md` | complete; 1388 | `ae68c6b7e0345e4246e986678f2a446932434f176c9e044525b5839a0799ea37` |


## Appendix B — Additional exact-baseline source receipts

All entries below were fetched on **2026-10-22** from `byronwall/explorEDA@63dfa75851ef57bb3782e6d7c1ef104784cd4064` through the GitHub connector. Each is complete UTF-8 content. The local bytes were verified against the returned Git blob SHA-1, then independently SHA256-hashed. These are read receipts, not program-execution receipts. The remote CrossfilterWrapper re-read is listed separately in the preflight because it duplicates a packet file.

**24 complete additional files.**

| Complete source path | Bytes | SHA256 |
| --- | ---: | --- |
| [apps/demo/src/demos/coverage.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/demos/coverage.ts) | 52454 | `3f3eeeda86aecf8cdbaf3cdcc59dadc622767e41b68c1a5a508c0c14e01da6c0` |
| [apps/demo/src/demos/examples.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/demos/examples.ts) | 56494 | `b67518e290d939f719babdb5dc2723649701f8b60e4601f9a1d041b2aa8dfb93` |
| [apps/demo/src/docs/DocsSite.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/DocsSite.tsx) | 11424 | `3f036e062b6df5649a9fd622c3c5f45c99ec01135990d7bb26279ff878acec73` |
| [apps/demo/src/docs/catalogue.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/catalogue.ts) | 25836 | `3ed239741cb5e71f45d8378146612ff8f9cce300a62cb54a7095addbdb8f3fbf` |
| [apps/demo/src/docs/components/content.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/components/content.tsx) | 9813 | `ba56c7714fb2e94b977e15a0dc9968009645e2fdb245bc32ed40c2123313dd5d` |
| [apps/demo/src/docs/gate.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/gate.ts) | 7433 | `681a9a53d90a5d048e05b7285c7178662f3b7ebc352f393f08a81c70df8b7de5` |
| [apps/demo/src/docs/live/LiveExample.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/live/LiveExample.tsx) | 8389 | `e7b3690eaff936811e9348eb98b0322859b8385223b5bf7113b725a4e91689bc` |
| [apps/demo/src/docs/live/examples.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/live/examples.ts) | 22298 | `206e73137d436350ef5edbee610139a209f21f5786b1b7e5313a676becb5ee3f` |
| [packages/explorEDA/src/components/PlotChartPanel.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/PlotChartPanel.tsx) | 42150 | `0491886b1d275957947eab1ba38edf9cdedf5c44b599d6d99306d5833a937f3e` |
| [packages/explorEDA/src/components/charts/BarChart/BarChart.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx) | 20313 | `0146daa2e5468c42efc210c2131d109e710db9047c53c08dea5159baa45a2ad7` |
| [packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx) | 6483 | `9d1cc8551e95778315eb99202216f532e78a6bb78741c729b4a619ba1a4c3ad8` |
| [packages/explorEDA/src/components/charts/BarChart/definition.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/definition.ts) | 2816 | `e9f158c5bc5345c923e81884b44df66d55fb8c4d8130bb557d69b57ce92249be` |
| [packages/explorEDA/src/components/charts/ChartRenderer.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/ChartRenderer.tsx) | 1941 | `1a4955f172d078e340f737122846af5bdc4590a3e9cda43946ac4f91e1583f77` |
| [packages/explorEDA/src/components/charts/DataTable/DataTable.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx) | 8968 | `0039f22156ef1dd3f0cd6ef58e73115a7f3b5ae12eaf8c4e04e2677295bc74c1` |
| [packages/explorEDA/src/components/charts/DataTable/definition.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/definition.ts) | 2249 | `d40fd095ef8e2244b9d178b172ef4e132f2265e0c3588eec6e62c183eece853c` |
| [packages/explorEDA/src/components/charts/DataTable/filteredRows.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts) | 2197 | `0723f9d5341214b0522d6c8231a0ee9ec32dd816b6e0a6067c9d49bedb5c147b` |
| [packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx) | 2436 | `d275f2331cda4ba1c0e028e4d8c0885a840f7ce6ffa59ea500da9ba772fa0bba` |
| [packages/explorEDA/src/components/charts/MetricCard/definition.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/definition.ts) | 1520 | `199024f211d1037d2936e164f018a5d310e5db2e5e8bf76280649e19ea524ff6` |
| [packages/explorEDA/src/components/charts/useGetColumnData.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/useGetColumnData.tsx) | 1765 | `03ad6ffe51073a3db4a95786f597c8b1833257c64d6fdbbc0b8d07a496f60f01` |
| [packages/explorEDA/src/components/charts/useGetLiveData.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/useGetLiveData.tsx) | 2222 | `6222156b36ba1d8accc05fd01888543a5bd4dc07b0673db01f74e27570a04478` |
| [packages/explorEDA/src/lib/aggregates.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/aggregates.ts) | 10497 | `1a220deaa087ad131529b90ce5f8c44b9282065f2d4d0269166cfa55c29c2743` |
| [packages/explorEDA/src/lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/valueParsing.ts) | 10226 | `18793ed3c9f09e3ac6c184fd658ad68b88f564c5c2d800bac7108188afd845d6` |
| [packages/explorEDA/src/providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/DataLayerProvider.tsx) | 55683 | `4790076bc523dceacb4a3be2d5e91905f35d5db5d3f31216ad91a13961c99800` |
| [packages/explorEDA/src/providers/lib/dataLayerState.ts](https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/lib/dataLayerState.ts) | 804 | `2469556f6e39537ff394ff4b242cd0da5aee866907568f0f2685e87525ec1569` |

Two directory metadata reads discovered the existing docs component registration paths, at the same pinned ref: [docs directory](https://api.github.com/repos/byronwall/explorEDA/contents/apps/demo/src/docs?ref=63dfa75851ef57bb3782e6d7c1ef104784cd4064) and [docs components directory](https://api.github.com/repos/byronwall/explorEDA/contents/apps/demo/src/docs/components?ref=63dfa75851ef57bb3782e6d7c1ef104784cd4064). They were navigation receipts, not additional source files or alternate refs.

## Source-link index

All baseline source links below resolve to the pinned commit; historical links resolve to their own exact refs. Line numbers in the report refer to those files. Attached local queue/pro-prompt additions are identified by their packet hashes rather than represented as committed GitHub files.

| Reference | Exact source path |
| --- | --- |
| [AGG] | `packages/explorEDA/src/lib/aggregates.ts` |
| [BAR] | `packages/explorEDA/src/components/charts/BarChart/BarChart.tsx` |
| [BARDEF] | `packages/explorEDA/src/components/charts/BarChart/definition.ts` |
| [BARPLAN] | `packages/explorEDA/src/components/charts/BarChart/barPlan.ts` |
| [BARTRACEBODY] | `packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx` |
| [CARD] | `packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx` |
| [CARDPLAN] | `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts` |
| [CARDTRACE] | `packages/explorEDA/src/components/charts/MetricCard/metricCardTrace.ts` |
| [CARDTRACEBODY] | `packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx` |
| [CF] | `packages/explorEDA/src/hooks/CrossfilterWrapper.ts` |
| [CFTEST] | `packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts` |
| [COL] | `packages/explorEDA/src/components/charts/useGetColumnData.tsx` |
| [DOCSGATE] | `apps/demo/src/docs/gate.ts` |
| [DOCSSITE] | `apps/demo/src/docs/DocsSite.tsx` |
| [EXAMPLES] | `apps/demo/src/demos/examples.ts` |
| [FILTERS] | `apps/demo/src/docs/pages/filters.mdx` |
| [GUIDE] | `docs/agent-guide.md` |
| [IDEAS] | `docs/intent/research-ideas-100/ideas.json` |
| [INIT] | `packages/explorEDA/src/providers/lib/dataLayerState.ts` |
| [LIVE] | `packages/explorEDA/src/components/charts/useGetLiveData.tsx` |
| [LIVEEXAMPLE] | `apps/demo/src/docs/live/LiveExample.tsx` |
| [LIVEEXAMPLES] | `apps/demo/src/docs/live/examples.ts` |
| [LOCAL] | `packages/explorEDA/src/components/LocalFilterStrip.tsx` |
| [MDXCONTENT] | `apps/demo/src/docs/components/content.tsx` |
| [NOTEBOOKS] | `apps/demo/src/docs/pages/notebooks.mdx` |
| [PANEL] | `packages/explorEDA/src/components/PlotChartPanel.tsx` |
| [POP] | `packages/explorEDA/src/lib/chartPopulation.ts` |
| [PROFILES] | `packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts` |
| [PROVIDER] | `packages/explorEDA/src/providers/DataLayerProvider.tsx` |
| [R051] | `docs/intent/research-ideas-100/ideas/R051-filter-ownership.md` |
| [RENDER] | `apps/demo/src/docs/pages/rendering.mdx` |
| [RENDERER] | `packages/explorEDA/src/components/charts/ChartRenderer.tsx` |
| [REVIEW] | `docs/intent/research-ideas-100/review.json` |
| [ROWS] | `packages/explorEDA/src/components/RowsView.tsx` |
| [STATUS] | `packages/explorEDA/src/components/ActiveFilterStatus.tsx` |
| [STATUSTEST] | `packages/explorEDA/src/components/ActiveFilterStatus.test.tsx` |
| [TABLE] | `packages/explorEDA/src/components/charts/DataTable/DataTable.tsx` |
| [TABLEDEF] | `packages/explorEDA/src/components/charts/DataTable/definition.ts` |
| [TABLEROWS] | `packages/explorEDA/src/components/charts/DataTable/filteredRows.ts` |
| [TRACEDOC] | `apps/demo/src/docs/pages/trace.mdx` |
| [TRACEPANEL] | `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx` |
| [TRACEROWS] | `packages/explorEDA/src/components/charts/trace/traceRows.ts` |
| [TRUST] | `docs/intent/current-analysis-trust/intent-brief.md` |
| [VALUE] | `packages/explorEDA/src/lib/valueParsing.ts` |
| [WORKSPACE] | `apps/demo/src/docs/pages/workspace.mdx` |
| [TN] | `docs/research/task-navigation-2026-10-20/decisions.md` at `3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb` |
| [MS] | `docs/research/missing-state-accounting-2026-10-21/decisions.md` at `6cab0a1bcf80ea0a72d9441b7545db46bc2697ac` |
| [SI] | `docs/research/selection-identity-2026-10-22/decisions.md` at `191dc9343b1c658b082d30138f972949f4c43b06` |

[AGG]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/aggregates.ts
[BAR]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx
[BARDEF]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/definition.ts
[BARPLAN]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/barPlan.ts
[BARTRACEBODY]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx
[CARD]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/MetricCard.tsx
[CARDPLAN]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts
[CARDTRACE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/metricCardTrace.ts
[CARDTRACEBODY]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx
[CF]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[CFTEST]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts
[COL]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/useGetColumnData.tsx
[DOCSGATE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/gate.ts
[DOCSSITE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/DocsSite.tsx
[EXAMPLES]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/demos/examples.ts
[FILTERS]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/filters.mdx
[GUIDE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/agent-guide.md
[IDEAS]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/ideas.json
[INIT]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/lib/dataLayerState.ts
[LIVE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/useGetLiveData.tsx
[LIVEEXAMPLE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/live/LiveExample.tsx
[LIVEEXAMPLES]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/live/examples.ts
[LOCAL]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/LocalFilterStrip.tsx
[MDXCONTENT]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/components/content.tsx
[NOTEBOOKS]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/notebooks.mdx
[PANEL]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/PlotChartPanel.tsx
[POP]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/chartPopulation.ts
[PROFILES]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts
[PROVIDER]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/DataLayerProvider.tsx
[R051]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/ideas/R051-filter-ownership.md
[RENDER]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/rendering.mdx
[RENDERER]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/ChartRenderer.tsx
[REVIEW]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/research-ideas-100/review.json
[ROWS]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/RowsView.tsx
[STATUS]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/ActiveFilterStatus.tsx
[STATUSTEST]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/ActiveFilterStatus.test.tsx
[TABLE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx
[TABLEDEF]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/definition.ts
[TABLEROWS]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts
[TRACEDOC]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/trace.mdx
[TRACEPANEL]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx
[TRACEROWS]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/trace/traceRows.ts
[TRUST]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/docs/intent/current-analysis-trust/intent-brief.md
[VALUE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/valueParsing.ts
[WORKSPACE]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/workspace.mdx
[TN]: https://github.com/byronwall/explorEDA/blob/3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb/docs/research/task-navigation-2026-10-20/decisions.md
[MS]: https://github.com/byronwall/explorEDA/blob/6cab0a1bcf80ea0a72d9441b7545db46bc2697ac/docs/research/missing-state-accounting-2026-10-21/decisions.md
[SI]: https://github.com/byronwall/explorEDA/blob/191dc9343b1c658b082d30138f972949f4c43b06/docs/research/selection-identity-2026-10-22/decisions.md
