# R051 proof plan and moderated study kit

**Date:** October 22, 2026.  
**Repository / baseline:** `byronwall/explorEDA@63dfa75851ef57bb3782e6d7c1ef104784cd4064`.  
**Mode:** bounded research; no application implementation, repository mutation, commit, PR, or participant contact.  
**Current decision:** retain current UI/semantics; review narrow factual documentation corrections; test B against A before considering C.  
**Evidence status:** frozen manual oracle and independent arithmetic check complete; production and browser proof **UNRUN**; real participants **0**.

## 1. What this kit proves, and what it does not

This is a complete, extractable study kit inside one Markdown report. Its five embedded assets contain the immutable twelve-row JSON fixture, cumulative task states, literal hand-enumerated answer key, an independent standard-library checker, and a proposed production Vitest test. The archive intentionally contains no companion files: the extraction run sheet below recovers them from this report and verifies their byte sizes and SHA-256 hashes.

The attached source packet is a selected text snapshot, not a runnable checkout. All 39 payloads passed declared byte/hash checks; the packet itself is 226,162 bytes, SHA-256 `c53c80b2a48187f2ed8f0f566d7ccce3c13176062ed9b14c00bd35ff7a7c83a8`. The attached prompt is 9,134 bytes, SHA-256 `ed05d34009cba1854e209443e6e921266eb68dc42b7c9c2f10747abb8b649b20`, matching the packet's local addition. Repository metadata and the exact commit were verified; 24 additional complete files at that same ref supplied decisive consumers and example registration. The remote wrapper also matched its packet bytes. Catalogue projections and provider/example excerpts were not represented as complete files; historical decisions retain their own refs. [SRC0]

The executed local experiment was a fixed-ledger check: independent hand enumeration produced the answer key; a separate authored Python script evaluated only these twelve rows and compared exact IDs and totals. It passed **121 assertions**. No production evaluator generated either the fixture or expected answers. No downloaded source, application test, pnpm command, browser flow, or human session was executed. The proposed TypeScript proof was source-reviewed but neither run nor typechecked. There is no observed product pass, performance result, task-success rate, or participant preference to report.

The correctness gate and human gate are independent. A source-correct answer can be difficult to explain; an easy explanation can be wrong. Neither an investigator's successful reading nor an assistant-generated persona counts as a participant. Missing named demand does not block this bounded correctness work.

## 2. Frozen configuration and exact set definitions

### Consumer configuration

| Owner / consumer | Fixed configuration |
| --- | --- |
| A, “Web orders by region” | Ordinary category-count bar over `region`; local restriction `channel=Web`; no facet, series, Top N, or named aggregate in the five scored tasks. |
| B, “Orders by category” | Ordinary category-count bar over `category`; no local restriction. |
| M, amount metric | `aggregation=sum`, `measureField=amount`; no own selection, local filter, calculated measure, or `entityField`. |
| T, order table | All seven fixture fields available; ascending `orderId`; no column filters or local population restriction. Text search changes during tasks. |
| Rows | Separate Rows view, with its own text search and `status=Open` predicate during T2–T4. |
| Workspace Region | Separate workspace-owned value predicate on the same field used by A. |

The executable proof uses stable owner IDs `A`, `B`, `card`, `table`, and `rows`. The proposed later docs example may use descriptive IDs `A-region-web`, `B-category`, `M-amount`, and `T-orders`; these are explicit owner aliases, not source-row identities. Preserve the one-to-one owner mapping. No replacement or remapping behavior is tested.

The JSON raw values remain authoritative. `amount` contains finite numbers, null, and the literal string `invalid`; no numeric-string, date, locale, rounding, or entity-identity edge is introduced. A later real-provider example must retain raw null/invalid distinctions and verify its effective numeric conversion. The planner-level proof operates on the raw numeric/null/invalid fixture column; it does not claim to test provider conversion or conversion-reason text. Membership is unaffected by that distinction here because all selected predicates are categorical.

Runtime `__ID` is assigned from zero-based insertion order by `initializeData`, overriding any host `__ID`. Therefore O01 maps to 0, O02 to 1, …, O12 to 11. The fixture never reorders or replaces rows. Assert this mapping before interpreting a trace. Business/source labels O01–O12 are used throughout answer keys. Search scans ordinary nonnull row values, excluding runtime `__ID`; `orderId` remains a regular searchable field. [SRC1] [SRC6]

### Scope equations

Let U contain all twelve source IDs. L_j is chart j's fixed local population; F_j is the set satisfying that chart's linked predicate; W_f is the set satisfying the workspace predicate owned by field f. **An absent predicate means U; an active predicate with no matching rows means ∅.** Never conflate them.

In ordinary linked mode:

```text
G   = U ∩ every active W_f ∩ every active F_j
P_j = U ∩ every active W_f ∩ F_k for every other chart k ≠ j
C_j = P_j ∩ L_j
M_j = G ∩ L_j
Q_f = U ∩ W_g for every other workspace field g ≠ f ∩ every active F_j
```

- G is global selected membership, used by the filter-bar count and as the initial input to Rows.
- P_j is peer context before local restriction; C_j is the foreground count population after that restriction.
- M_j is membership selected within a chart's local population. In linked mode, the fixture's ordinary category bars satisfy `M_j = C_j ∩ F_j`. With no active own predicate, every context row matches, but no active selection footer is implied.
- Q_f is an active workspace field control's self-excluding group. It omits only its own workspace dimension. When the workspace filter is absent, its group key is absent; the oracle encodes that absence as JSON null.
- M's membership is G because the metric has no local restriction. V_M contains its finite numeric contributors. Excluded numeric members stay in G and in metric source trace.
- T's result is its own input membership followed by its search and column filters. Here T has no column filter, so it is `G ∩ search(rush)` when that search is active. A table's column filter can be linked; its text search is not.
- Rows' result is `G ∩ search(red) ∩ status(Open)` during T2–T4. “Displayed rows” throughout this report means the complete filtered result, not only rows currently mounted by a virtualized viewport. [SRC2] [SRC3] [SRC4] [SRC5] [SRC6]

Self-exclusion is by owner dimension, not by a field name. CrossfilterWrapper constructs a distinct dimension per chart and a distinct dimension per workspace field. The chart's local restriction is applied during population retrieval, not automatically added to the ordinary bar's linked predicate. That is why a Web-only chart's Region selection can select Store orders in other views. [SRC2] [SRC3] [SRC4]

The full source U is `{O01,O02,O03,O04,O05,O06,O07,O08,O09,O10,O11,O12}`. A's immutable Web population is L_A = `{O01,O02,O05,O06,O09,O10,O12}`. All other fixture local populations are U. The full-source amount sum is 980 from nine valid contributors; O03/O09 are null and O06 is invalid. O04=0 and O12=−20 remain valid.

### Foreground, selected highlighting, and source reference

Category counts use C_j, and the bar footer already distinguishes the selected subset from that foreground context. Faint references are a third layer. The ordinary non-faceted count consumer obtains `allValues` from the full source column and can show a reference when its count exceeds the foreground count. A's references are **West=6, East=4, South=2**; its unfiltered local foreground is **4,2,1**. B's full-source references are Furniture=6, Tech=6. Do not add references to foreground counts or call the reference population “selected.” [SRC4]

## 3. Immutable twelve-row JSON

Extract this asset as `fixture.json`. Its metadata is not imported as data rows; pass only `fixture.rows` to the real component/provider. Retain row order and the native JSON nulls. No CSV conversion is needed for the proposed focused example.

<!-- r051-asset fixture.json bytes=2469 sha256=6aea7029cc63bc620c8df4f2f786e7357377b730d682157a3c442c1ea36a8867 -->
```json
{
  "fixture_id": "R051-orders-v1",
  "source_order_is_fixed": true,
  "source_identity": "orderId",
  "runtime_id_mapping": "__ID is zero-based row position; assert mapping before any product proof",
  "rows": [
    {
      "orderId": "O01",
      "region": "West",
      "category": "Furniture",
      "channel": "Web",
      "amount": 100,
      "note": "rush red",
      "status": "Open"
    },
    {
      "orderId": "O02",
      "region": "West",
      "category": "Tech",
      "channel": "Web",
      "amount": 200,
      "note": "standard blue",
      "status": "Open"
    },
    {
      "orderId": "O03",
      "region": "West",
      "category": "Furniture",
      "channel": "Store",
      "amount": null,
      "note": "rush blue",
      "status": "Closed"
    },
    {
      "orderId": "O04",
      "region": "West",
      "category": "Tech",
      "channel": "Store",
      "amount": 0,
      "note": "rush red",
      "status": "Open"
    },
    {
      "orderId": "O05",
      "region": "East",
      "category": "Furniture",
      "channel": "Web",
      "amount": 50,
      "note": "standard red",
      "status": "Open"
    },
    {
      "orderId": "O06",
      "region": "East",
      "category": "Tech",
      "channel": "Web",
      "amount": "invalid",
      "note": "rush blue",
      "status": "Closed"
    },
    {
      "orderId": "O07",
      "region": "East",
      "category": "Furniture",
      "channel": "Store",
      "amount": 150,
      "note": "rush red",
      "status": "Open"
    },
    {
      "orderId": "O08",
      "region": "East",
      "category": "Tech",
      "channel": "Store",
      "amount": 300,
      "note": "standard blue",
      "status": "Open"
    },
    {
      "orderId": "O09",
      "region": "West",
      "category": "Tech",
      "channel": "Web",
      "amount": null,
      "note": "rush red",
      "status": "Closed"
    },
    {
      "orderId": "O10",
      "region": "South",
      "category": "Furniture",
      "channel": "Web",
      "amount": 80,
      "note": "rush blue",
      "status": "Open"
    },
    {
      "orderId": "O11",
      "region": "South",
      "category": "Tech",
      "channel": "Store",
      "amount": 120,
      "note": "standard red",
      "status": "Closed"
    },
    {
      "orderId": "O12",
      "region": "West",
      "category": "Furniture",
      "channel": "Web",
      "amount": -20,
      "note": "standard red",
      "status": "Open"
    }
  ]
}
```

## 4. Five sequential prediction tasks

T0 is an unscored orientation snapshot with no active linked selection or search; A's Web restriction is already present. Tasks T1–T5 are cumulative. Do not reorder the semantic sequence: clear-one and clear-all depend on the earlier state. Counterbalance explanations across people instead.

1. **T1:** select West in A.
2. **T2:** keep A West; select Tech in B; set workspace Region=West; enter `rush` in T; set Rows search=`red` and Rows status=Open.
3. **T3:** change only workspace Region from West to East.
4. **T4:** clear only A's chart selection. Keep workspace East, B Tech, both searches, Rows Open, and A's Web restriction.
5. **T5:** invoke the existing global Clear all filters action. The expected post-action state clears workspace/chart selections, both searches and the Rows predicate; it retains A's Web restriction.

The following state asset records resulting settings for deterministic replay. T4/T5 settings do not, by themselves, prove that the actual provider or buttons perform those changes; that separate action gate is specified later.

<!-- r051-asset states.json bytes=1032 sha256=4479db081b4179a2648c9b90f4532ac1ab5d9eca8726b482ee4421a0aa511f63 -->
```json
[
  {
    "id": "T0",
    "A_region": null,
    "B_category": null,
    "W_region": null,
    "table_search": "",
    "rows_search": "",
    "rows_status": null
  },
  {
    "id": "T1",
    "A_region": "West",
    "B_category": null,
    "W_region": null,
    "table_search": "",
    "rows_search": "",
    "rows_status": null
  },
  {
    "id": "T2",
    "A_region": "West",
    "B_category": "Tech",
    "W_region": "West",
    "table_search": "rush",
    "rows_search": "red",
    "rows_status": "Open"
  },
  {
    "id": "T3",
    "A_region": "West",
    "B_category": "Tech",
    "W_region": "East",
    "table_search": "rush",
    "rows_search": "red",
    "rows_status": "Open"
  },
  {
    "id": "T4",
    "A_region": null,
    "B_category": "Tech",
    "W_region": "East",
    "table_search": "rush",
    "rows_search": "red",
    "rows_status": "Open"
  },
  {
    "id": "T5",
    "A_region": null,
    "B_category": null,
    "W_region": null,
    "table_search": "",
    "rows_search": "",
    "rows_status": null
  }
]
```

### T1 answer card — own selection and local drawing population

**Moderator action:** From T0, select Region=West in A. Obtain the prediction before applying/revealing the action.

| Set / result | Exact expected answer |
| --- | --- |
| G / metric membership | `{O01,O02,O03,O04,O09,O12}`; 6 rows. |
| P_A before local restriction | U, all 12 rows. |
| C_A foreground | `{O01,O02,O05,O06,O09,O10,O12}`; 7 rows; West=4, East=2, South=1. |
| M_A selected within A | `{O01,O02,O09,O12}`; 4 rows. |
| P_B = C_B | `{O01,O02,O03,O04,O09,O12}`; 6 rows; Furniture=3, Tech=3. |
| Metric valid / excluded | Valid `{O01,O02,O04,O12}` (4); excluded `{O03,O09}` (2); sum **280**. |
| T / Rows | Both `{O01,O02,O03,O04,O09,O12}`; 6 rows. |
| Workspace-region group | Absent; there is no active workspace Region dimension. |

**Primary scored response:** G, C_A and M_A exact IDs and counts, plus the owner explanation. A keeps its own West alternatives as context; Web still restricts A's drawing. Linked views receive the Region predicate without inheriting Web. O03/O04 are therefore linked members even though A does not draw them. The metric sum and B's grouping are diagnostic corroboration in this task.

**Current-control comparator:** A already has the Only-Web strip, own-selection dimming, and the predicted footer `4 of 7 rows selected: West`. Existing filter docs say the originating bar retains alternatives. Global status counts every linked owner. Candidate C must add causal owner reconciliation, not claim to introduce these counts. [SRC4] [SRC7] [SRC8]

**Failure examples:** returning only the four Web/West orders as G; deleting East/South from C_A; reporting the 12-row faint reference as the 7-row foreground; assuming null O03/O09 are removed from membership.

### T2 answer card — two Region owners, search scopes, contributors

**Moderator action:** Add B Tech and workspace Region=West; set T search `rush`; set Rows search `red` and status Open. Keep A West.

| Set / result | Exact expected answer |
| --- | --- |
| G / metric membership | `{O02,O04,O09}`; 3 rows. |
| P_A | `{O02,O04,O09}`; 3 rows. |
| C_A / M_A | Both `{O02,O09}`; 2 rows; West=2, East=0, South=0. |
| P_B = C_B | `{O01,O02,O03,O04,O09,O12}`; 6 rows; Furniture=3, Tech=3. |
| M_B | `{O02,O04,O09}`; 3 rows. |
| Q_workspace_region | `{O02,O04,O09}`; 3 rows, because A West and B Tech remain when only the workspace owner is omitted. |
| Metric valid / excluded | Valid `{O02,O04}` (2); excluded `{O09}` (1); sum **200**. |
| T searched result | `{O04,O09}`; 2 rows. |
| Rows searched/filtered result | `{O04}`; 1 row. |

**Primary scored response:** G, V_M, T and Rows exact IDs/counts; metric sum 200; the owner explanation. Workspace Region still applies to A when A omits its own Region selection. Searches remain local to their named result. O04's zero contributes; O09's null is retained as membership. C_A, C_B and Q are diagnostic corroboration in this task.

**Current-control comparator:** Workspace and chart chips expose distinct owners; Rows and table-search chips identify local scope; the global tooltip states that locality; A's footer is `2 of 2 rows selected: West`, B's is `3 of 6 rows selected: Tech`. Metric trace separates matching rows from valid/excluded contributors. None is new functionality proposed by this study. [SRC7] [SRC8] [SRC9]

**Failure examples:** claiming six global rows because B omits its own selection in context; reducing G to the table's two or Rows' one result; reporting O09 as a numeric zero; omitting valid zero O04; describing both Region filters as one owner.

### T3 answer card — empty linked intersection and nonempty context

**Moderator action:** Change only workspace Region=West to Region=East. Keep A West, B Tech and all local searches/predicates.

| Set / result | Exact expected answer |
| --- | --- |
| G / metric membership | `∅`; 0 rows. |
| P_A | `{O06,O08}`; 2 rows allowed by workspace East and B Tech. |
| C_A | `{O06}`; 1 Web row; West=0, East=1, South=0. |
| M_A | `∅`; 0. |
| P_B = C_B / M_B | Both `∅`; Furniture=0, Tech=0. |
| Q_workspace_region | `{O02,O04,O09}`; 3 rows, allowed by A West and B Tech when workspace Region is omitted. |
| Metric valid / excluded | Both `∅`; state **empty**, display **No rows**, numeric sum value absent. |
| T / Rows | Both `∅`; 0 rows. |

**Primary scored response:** G, C_A and Q_workspace_region exact IDs/counts; metric empty-state label; the owner explanation. Global membership honors incompatible chart-West and workspace-East predicates. A omits only its own chart-West predicate; the workspace control omits only its own workspace-East predicate. O06 is count context even though its amount is invalid. Other bar categories can remain zero-valued source-domain slots; they are not positive context membership.

**Current-control comparator:** Distinct owner chips, the workspace trace note, A's local strip and the predicted `0 of 1 rows selected: West` footer already expose components of this answer. B's predicted selection footer is `0 of 0 rows selected: Tech`. Source inspection establishes these strings' construction; actual rendering is unrun. [SRC4] [SRC7] [SRC8]

**Failure examples:** returning all Tech rows for A by omitting every Region predicate; assuming a visible East alternative is selected; treating an empty numeric sum as 0; claiming Q must be empty because the global count is empty. Any of these is a prospective interpretation error only if a real participant makes it; none was observed here.

### T4 answer card — clear only the originating chart owner

**Moderator action:** Use A's existing clear-chart action (or remove its sole Region selection). Retain workspace East, B Tech, T rush, Rows red/Open, and A's Web restriction.

| Set / result | Exact expected answer |
| --- | --- |
| G / metric membership | `{O06,O08}`; 2 rows. |
| P_A | `{O06,O08}`; 2 rows. |
| C_A / M_A | Both `{O06}`; 1 row; West=0, East=1, South=0. No active own selection line is implied. |
| P_B = C_B | `{O05,O06,O07,O08}`; 4 rows; Furniture=2, Tech=2. |
| M_B | `{O06,O08}`; 2 rows. |
| Q_workspace_region | `{O02,O04,O06,O08,O09,O11}`; 6 Tech rows. |
| Metric valid / excluded | Valid `{O08}` (1); excluded `{O06}` (1); sum **300**. |
| T searched result | `{O06}`; 1 row. |
| Rows searched/filtered result | `∅`; 0 rows. |

**Primary scored response:** G, V_M, T and Rows exact IDs/counts; sum 300; the owner explanation. Clearing A removes only A's predicate. O06 remains global membership and a trace source row even though it does not contribute a valid amount. Empty Rows here is not empty global membership.

**Current-control comparator:** A's chip disappears; workspace/B/search/Rows chips and the local strip persist. B's predicted footer is `2 of 4 rows selected: Tech`. The metric trace supplies the included/excluded distinction. A's header clear and C shortcut clear chart selections, not its local drawing restriction. [SRC5] [SRC7] [SRC9]

**Failure examples:** clearing workspace East along with A; returning all East rows despite B Tech; returning O08 in T because its amount is valid while ignoring search; dropping O06 from source trace; reporting global emptiness because Rows is empty.

### T5 answer card — clear all active selection/search owners

**Moderator action:** Invoke the existing filter bar's Clear all filters action.

| Set / result | Exact expected answer |
| --- | --- |
| G / metric membership | U; all 12 IDs. |
| P_A / P_B = C_B | U; all 12 IDs. |
| C_A / M_A | L_A = `{O01,O02,O05,O06,O09,O10,O12}`; 7 rows; West=4, East=2, South=1. |
| B foreground counts | Furniture=6, Tech=6; M_B = U. |
| Metric valid / excluded | Valid `{O01,O02,O04,O05,O07,O08,O10,O11,O12}` (9); excluded `{O03,O06,O09}` (3); sum **980**. |
| T / Rows | Both U; all 12 IDs. |
| Workspace-region group | Absent after removal of the workspace dimension. |

**Primary scored response:** G, C_A, T and Rows exact IDs/counts; the owner explanation. Clear-all removes chart selections, workspace predicates, table searches, and Rows searches/predicates. It retains A's `localFilters` through the provider's chart spread. The sum and contributor partition are diagnostic corroboration here.

**Current-control comparator:** Clear-all help lists the active owners cleared; the remaining Only-Web strip identifies the retained population. The current docs' clear-all prose can be clarified to include workspace filters and explicit local-population retention, without changing provider behavior. [SRC5] [SRC7] [SRC8]

**Failure examples:** widening A to all twelve; retaining the table or Rows search; reporting a present-but-empty workspace-region group rather than an absent key; interpreting nine numeric inputs as nine selected records.

## 5. Separate mode and aggregation probes

### Notebook mode: a different instance, not a runtime toggle

Create a fresh instance with `localSelections=true` **before chart registration**, then apply the stored T3 predicates. Do not toggle a boolean on already-filtered dimensions and assume they recompute. This is an unscored transfer probe, not a sixth primary task or another dataset. In notebook mode, all chart dimension predicates are inactive for linked membership; workspace filters remain active. [SRC2] [SRC10]

| Population / value | Exact notebook T3 answer |
| --- | --- |
| G / metric membership | `{O05,O06,O07,O08}`; 4 East rows. |
| P_A = P_B = C_B | Same four East rows. |
| C_A | `{O05,O06}`; 2 Web/East rows. |
| `getChartFilteredRowIds(A)` | `{O05,O06}`; **not** A's empty own-West highlight. |
| A own highlight / B own highlight | `∅` / `{O06,O08}`. |
| Q_workspace_region | U; no linked chart predicate constrains it. |
| Valid / excluded / sum | `{O05,O07,O08}` / `{O06}` / **500**. |
| T / Rows | `{O06,O07}` / `{O05,O07}`. |

The category-bar own highlight is `C_j ∩ F_j` in this mode, but G and the wrapper's chart-filtered IDs no longer incorporate F_j. Do not call every set “selected.” The fixture metric has no own filter, so its notebook truth is unambiguous. A generalized metric scope sentence about “this chart's filters” needs mode-specific review before reuse.

### Category count versus named grouped numeric summary

The five primary tasks keep A/B in count mode. A separate source-correctness probe uses B's T2 context with a named sum aggregate over `amount`, grouped by category. The source path is `ChartRenderer` → registered `BarChart` → `useGetLiveIds` → `getAggregateResult(id, liveIds)`; the explicit IDs are retained by the provider. [SRC4] [SRC5] [SRC11]

| B T2 group | Membership / valid contributors | Count / sum |
| --- | --- | --- |
| Furniture | Members `{O01,O03,O12}`; valid `{O01,O12}` | Count 3; sum 100−20 = **80**. |
| Tech | Members `{O02,O04,O09}`; valid `{O02,O04}` | Count 3; sum 200+0 = **200**. |
| Both contextual groups | 6 members, 4 valid numeric contributors | Count 6; contextual sum **280**. |

The metric is still based on global Tech membership `{O02,O04,O09}`, two valid inputs, sum 200. The existing rendering-doc sentence that named grouped summaries use globally filtered rows is overbroad for this standard bar path. A provider aggregate call omitting explicit IDs instead defaults to G; a custom aggregate-result override is yet another caller-specific path. This source contradiction justifies a bounded documentation correction. No aggregate-bar runtime was executed, and no filtering rewrite is authorized. [SRC5] [SRC8] [SRC11]

### Zero, all-invalid, and empty

Use only the existing fixture rows for these planner probes:

| Membership | Numeric result | Required distinction |
| --- | --- | --- |
| `{O04}` | Valid `{O04}`; sum 0 | State `value`, text `0`; zero is not missing. |
| `{O06}` | Valid `∅`; excluded `{O06}`; no sum value | State `invalid`, text `No valid values`; the member still exists. |
| `∅` | No valid or excluded members; no sum value | State `empty`, text `No rows`. |

Metric trace source-row extraction includes all its contributor entries, including numeric exclusions. It does not prove that every trace source row contributed to the sum. [SRC9]

## 6. Independent literal oracle

The following is the frozen expected-answer asset, authored by hand from the ledger before comparison with the independent arithmetic checker. It has complete IDs for T0–T5 and notebook T3; byte/hash identity is part of the proof contract. B's local population is U, so `P_B` is also `C_B`; linked M_B is G. Null `card_value` denotes absence of a numeric result and must be read alongside `card_state`; null workspace context denotes an absent group key.

<!-- r051-asset oracle.json bytes=9822 sha256=0485e11e73f34a576c14a19c895cf9714ecbc37c8c2e61249ae75b1377f24e79 -->
```json
{
  "method": "Hand enumeration from frozen twelve-row ledger; no production evaluator used to derive any expected IDs or values.",
  "fixture_id": "R051-orders-v1",
  "definitions": {
    "G": "Global all-active-dimension membership",
    "P_A": "Peer context before A local population restriction",
    "P_B": "Peer context before B local population restriction; B has no local restriction",
    "C_A": "P_A intersect Web local population",
    "M_A": "G intersect Web local population; in linked mode also C_A intersect A own predicate",
    "Q_workspace_region": "Workspace region group, omitting only workspace region dimension; null means no active workspace region group key",
    "card_value": "Sum of finite numeric contributors; null for absent numeric value, distinguished by card_state"
  },
  "full": [
    "O01",
    "O02",
    "O03",
    "O04",
    "O05",
    "O06",
    "O07",
    "O08",
    "O09",
    "O10",
    "O11",
    "O12"
  ],
  "A_local_population": [
    "O01",
    "O02",
    "O05",
    "O06",
    "O09",
    "O10",
    "O12"
  ],
  "B_full_source_reference_counts": {
    "Furniture": 6,
    "Tech": 6
  },
  "tasks": [
    {
      "id": "T0",
      "G": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "P_A": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "P_B": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "C_A": [
        "O01",
        "O02",
        "O05",
        "O06",
        "O09",
        "O10",
        "O12"
      ],
      "M_A": [
        "O01",
        "O02",
        "O05",
        "O06",
        "O09",
        "O10",
        "O12"
      ],
      "Q_workspace_region": null,
      "A_counts": {
        "West": 4,
        "East": 2,
        "South": 1
      },
      "B_counts": {
        "Furniture": 6,
        "Tech": 6
      },
      "table_rows": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "rows_rows": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "card_valid": [
        "O01",
        "O02",
        "O04",
        "O05",
        "O07",
        "O08",
        "O10",
        "O11",
        "O12"
      ],
      "card_excluded": [
        "O03",
        "O06",
        "O09"
      ],
      "card_value": 980,
      "card_state": "value"
    },
    {
      "id": "T1",
      "G": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O09",
        "O12"
      ],
      "P_A": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "P_B": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O09",
        "O12"
      ],
      "C_A": [
        "O01",
        "O02",
        "O05",
        "O06",
        "O09",
        "O10",
        "O12"
      ],
      "M_A": [
        "O01",
        "O02",
        "O09",
        "O12"
      ],
      "Q_workspace_region": null,
      "A_counts": {
        "West": 4,
        "East": 2,
        "South": 1
      },
      "B_counts": {
        "Furniture": 3,
        "Tech": 3
      },
      "table_rows": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O09",
        "O12"
      ],
      "rows_rows": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O09",
        "O12"
      ],
      "card_valid": [
        "O01",
        "O02",
        "O04",
        "O12"
      ],
      "card_excluded": [
        "O03",
        "O09"
      ],
      "card_value": 280,
      "card_state": "value"
    },
    {
      "id": "T2",
      "G": [
        "O02",
        "O04",
        "O09"
      ],
      "P_A": [
        "O02",
        "O04",
        "O09"
      ],
      "P_B": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O09",
        "O12"
      ],
      "C_A": [
        "O02",
        "O09"
      ],
      "M_A": [
        "O02",
        "O09"
      ],
      "Q_workspace_region": [
        "O02",
        "O04",
        "O09"
      ],
      "A_counts": {
        "West": 2,
        "East": 0,
        "South": 0
      },
      "B_counts": {
        "Furniture": 3,
        "Tech": 3
      },
      "table_rows": [
        "O04",
        "O09"
      ],
      "rows_rows": [
        "O04"
      ],
      "card_valid": [
        "O02",
        "O04"
      ],
      "card_excluded": [
        "O09"
      ],
      "card_value": 200,
      "card_state": "value"
    },
    {
      "id": "T3",
      "G": [],
      "P_A": [
        "O06",
        "O08"
      ],
      "P_B": [],
      "C_A": [
        "O06"
      ],
      "M_A": [],
      "Q_workspace_region": [
        "O02",
        "O04",
        "O09"
      ],
      "A_counts": {
        "West": 0,
        "East": 1,
        "South": 0
      },
      "B_counts": {
        "Furniture": 0,
        "Tech": 0
      },
      "table_rows": [],
      "rows_rows": [],
      "card_valid": [],
      "card_excluded": [],
      "card_value": null,
      "card_state": "empty"
    },
    {
      "id": "T4",
      "G": [
        "O06",
        "O08"
      ],
      "P_A": [
        "O06",
        "O08"
      ],
      "P_B": [
        "O05",
        "O06",
        "O07",
        "O08"
      ],
      "C_A": [
        "O06"
      ],
      "M_A": [
        "O06"
      ],
      "Q_workspace_region": [
        "O02",
        "O04",
        "O06",
        "O08",
        "O09",
        "O11"
      ],
      "A_counts": {
        "West": 0,
        "East": 1,
        "South": 0
      },
      "B_counts": {
        "Furniture": 2,
        "Tech": 2
      },
      "table_rows": [
        "O06"
      ],
      "rows_rows": [],
      "card_valid": [
        "O08"
      ],
      "card_excluded": [
        "O06"
      ],
      "card_value": 300,
      "card_state": "value"
    },
    {
      "id": "T5",
      "G": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "P_A": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "P_B": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "C_A": [
        "O01",
        "O02",
        "O05",
        "O06",
        "O09",
        "O10",
        "O12"
      ],
      "M_A": [
        "O01",
        "O02",
        "O05",
        "O06",
        "O09",
        "O10",
        "O12"
      ],
      "Q_workspace_region": null,
      "A_counts": {
        "West": 4,
        "East": 2,
        "South": 1
      },
      "B_counts": {
        "Furniture": 6,
        "Tech": 6
      },
      "table_rows": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "rows_rows": [
        "O01",
        "O02",
        "O03",
        "O04",
        "O05",
        "O06",
        "O07",
        "O08",
        "O09",
        "O10",
        "O11",
        "O12"
      ],
      "card_valid": [
        "O01",
        "O02",
        "O04",
        "O05",
        "O07",
        "O08",
        "O10",
        "O11",
        "O12"
      ],
      "card_excluded": [
        "O03",
        "O06",
        "O09"
      ],
      "card_value": 980,
      "card_state": "value"
    }
  ],
  "notebook_T3": {
    "mode": "localSelections=true; stored task T3 predicates retained; new mode initialized before chart registration",
    "G": [
      "O05",
      "O06",
      "O07",
      "O08"
    ],
    "P_A": [
      "O05",
      "O06",
      "O07",
      "O08"
    ],
    "P_B": [
      "O05",
      "O06",
      "O07",
      "O08"
    ],
    "C_A": [
      "O05",
      "O06"
    ],
    "getChartFilteredRowIds_A": [
      "O05",
      "O06"
    ],
    "A_own_highlight": [],
    "B_own_highlight": [
      "O06",
      "O08"
    ],
    "Q_workspace_region": [
      "O01",
      "O02",
      "O03",
      "O04",
      "O05",
      "O06",
      "O07",
      "O08",
      "O09",
      "O10",
      "O11",
      "O12"
    ],
    "A_counts": {
      "West": 0,
      "East": 2,
      "South": 0
    },
    "B_counts": {
      "Furniture": 2,
      "Tech": 2
    },
    "table_rows": [
      "O06",
      "O07"
    ],
    "rows_rows": [
      "O05",
      "O07"
    ],
    "card_valid": [
      "O05",
      "O07",
      "O08"
    ],
    "card_excluded": [
      "O06"
    ],
    "card_value": 500,
    "card_state": "value"
  },
  "A_full_local_population_counts": {
    "West": 4,
    "East": 2,
    "South": 1
  },
  "A_full_source_reference_counts": {
    "West": 6,
    "East": 4,
    "South": 2
  },
  "reference_scope_note": "Ordinary count bar allValues uses full column data, not useGetAllIds(settings); faint reference and domain count all source rows even when foreground local population is Web."
}
```

## 7. Executed bounded check versus proposed product proof

### Executed: independent fixed-ledger arithmetic

The Python checker imports no application code and implements only the literal predicates needed by these tasks. Its expected arrays come from the separate manual oracle. It does not build a reusable filter engine or suggest shipping one. Search terms are deliberately confined to `note`; the checker asserts that they cannot match any other fixture field. This avoids recreating production search behavior as the source of its own expectations.

Observed local result on October 22, 2026:

```text
PASS — 121 assertions
T1 global 6; context A 7; card sum 280; table 6; Rows 6
T2 global 3; context A 2; card sum 200; table 2; Rows 1
T3 global 0; context A 1; card No rows; table 0; Rows 0
T4 global 2; context A 1; card sum 300; table 1; Rows 0
T5 global 12; context A 7; card sum 980; table 12; Rows 12
Notebook T3 sum 500; zero/all-invalid/empty cases distinct
Application code executed: false
Product results: UNRUN
Participants: 0
```

<!-- r051-asset check-oracle.py bytes=6673 sha256=617904a8c20b6cc0026d6fd50ccdd33738e74fdbf7f4919c8f853e7334bddd6f -->
```python
"""Validate only the fixed R051 ledger; no application code is imported."""
from pathlib import Path
import argparse
import hashlib
import json

parser = argparse.ArgumentParser()
parser.add_argument("fixture", type=Path)
parser.add_argument("states", type=Path)
parser.add_argument("oracle", type=Path)
args = parser.parse_args()
fixture = json.loads(args.fixture.read_text(encoding="utf-8"))
states = json.loads(args.states.read_text(encoding="utf-8"))
oracle = json.loads(args.oracle.read_text(encoding="utf-8"))
rows = fixture["rows"]
assert len(rows) == 12
assert [r["orderId"] for r in rows] == [f"O{i:02}" for i in range(1, 13)]
assert len({r["orderId"] for r in rows}) == 12
checks = 0

def verify(label, actual, expected):
    global checks
    assert actual == expected, f"{label}: actual={actual!r}; expected={expected!r}"
    checks += 1

def ids(items):
    return [r["orderId"] for r in items]

def matching(items, field, value):
    if value is None:
        return list(items)
    return [r for r in items if r[field] == value]

def search(items, term):
    if not term:
        return list(items)
    # Every fixture term occurs only in note; other fields cannot match it.
    assert all(not any(term in str(v).lower() for k, v in r.items()
                       if k != "note" and v is not None) for r in rows)
    return [r for r in items if term in r["note"].lower()]

def counts(items, field, categories):
    return {category: sum(r[field] == category for r in items)
            for category in categories}

def metric(items):
    # The fixture deliberately contains numbers, null, and "invalid" only.
    valid = [r for r in items if type(r["amount"]) in (int, float)]
    excluded = [r for r in items if type(r["amount"]) not in (int, float)]
    state = "empty" if not items else "value" if valid else "invalid"
    value = sum(r["amount"] for r in valid) if valid else None
    return ids(valid), ids(excluded), value, state

verify("full IDs", ids(rows), oracle["full"])
local = matching(rows, "channel", "Web")
verify("A fixed local population", ids(local), oracle["A_local_population"])
verify("A full-source count references", counts(rows, "region", ["West", "East", "South"]), oracle["A_full_source_reference_counts"])
verify("B full-source count references", counts(rows, "category", ["Furniture", "Tech"]), oracle["B_full_source_reference_counts"])

for state, expected in zip(states, oracle["tasks"], strict=True):
    key = state["id"]
    verify(f"{key} state identity", key, expected["id"])
    workspace = matching(rows, "region", state["W_region"])
    peer_a = matching(workspace, "category", state["B_category"])
    peer_b = matching(workspace, "region", state["A_region"])
    global_rows = matching(peer_a, "region", state["A_region"])
    context_a = matching(peer_a, "channel", "Web")
    members_a = matching(global_rows, "channel", "Web")
    workspace_context = None
    if state["W_region"] is not None:
        workspace_context = ids(matching(matching(rows, "region", state["A_region"]),
                                         "category", state["B_category"]))
    table = search(global_rows, state["table_search"])
    rows_view = matching(search(global_rows, state["rows_search"]),
                         "status", state["rows_status"])
    actual_sets = {"G": ids(global_rows), "P_A": ids(peer_a), "P_B": ids(peer_b),
                   "C_A": ids(context_a), "M_A": ids(members_a),
                   "Q_workspace_region": workspace_context,
                   "table_rows": ids(table), "rows_rows": ids(rows_view)}
    for name, actual in actual_sets.items():
        verify(f"{key} {name}", actual, expected[name])
    verify(f"{key} A foreground counts", counts(context_a, "region", ["West", "East", "South"]), expected["A_counts"])
    verify(f"{key} B foreground counts", counts(peer_b, "category", ["Furniture", "Tech"]), expected["B_counts"])
    valid, excluded, value, result_state = metric(global_rows)
    for name, actual in {"card_valid": valid, "card_excluded": excluded,
                         "card_value": value, "card_state": result_state}.items():
        verify(f"{key} {name}", actual, expected[name])
    verify(f"{key} membership partition", sorted(valid + excluded), sorted(ids(global_rows)))
    print(f"[ledger] {key}: global={ids(global_rows)}; card={result_state}:{value}; table={ids(table)}; Rows={ids(rows_view)}")

# Separate notebook-mode counterexample, initialized with local selections.
notebook = oracle["notebook_T3"]
east = matching(rows, "region", "East")
east_web = matching(east, "channel", "Web")
for name, actual in {"G": ids(east), "P_A": ids(east), "P_B": ids(east),
                     "C_A": ids(east_web), "getChartFilteredRowIds_A": ids(east_web),
                     "A_own_highlight": [],
                     "B_own_highlight": ids(matching(east, "category", "Tech")),
                     "Q_workspace_region": ids(rows),
                     "table_rows": ids(search(east, "rush")),
                     "rows_rows": ids(matching(search(east, "red"), "status", "Open"))}.items():
    verify(f"notebook {name}", actual, notebook[name])
verify("notebook A counts", counts(east_web, "region", ["West", "East", "South"]), notebook["A_counts"])
verify("notebook B counts", counts(east, "category", ["Furniture", "Tech"]), notebook["B_counts"])
valid, excluded, value, state = metric(east)
for name, actual in {"card_valid": valid, "card_excluded": excluded,
                     "card_value": value, "card_state": state}.items():
    verify(f"notebook {name}", actual, notebook[name])

# Supplemental states on the same ledger, not additional participant tasks.
verify("zero is a valid value", metric([rows[3]]), (["O04"], [], 0, "value"))
verify("invalid member is retained", metric([rows[5]]), ([], ["O06"], None, "invalid"))
verify("empty differs from invalid", metric([]), ([], [], None, "empty"))
west = matching(rows, "region", "West")
verify("grouped context Furniture sum", metric(matching(west, "category", "Furniture"))[2], 80)
verify("grouped context Tech sum", metric(matching(west, "category", "Tech"))[2], 200)

print(json.dumps({"status": "PASS", "assertions": checks,
                  "scope": "Independent fixed-ledger arithmetic and literal-oracle consistency only",
                  "application_code_executed": False,
                  "product_results": "UNRUN", "participants": 0,
                  "inputs": {str(p): {"bytes": len(p.read_bytes()),
                                      "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                             for p in (args.fixture, args.states, args.oracle)}}, indent=2))
```

### Proposed / UNRUN: actual production functions

This draft is intended for a later runnable baseline checkout at the proposed path `packages/explorEDA/src/research/r051/R051Population.test.ts`, with the three adjacent JSON assets. It calls actual registered chart defaults, the real wrapper, bar/metric planners, table filtering, source-ID initialization and trace-row extraction. Expected IDs remain the literal oracle. Its console output prints source labels for diagnosis.

**Status:** authored and source-reviewed only; not executed, typechecked, or claimed to pass. It tests wrapper/planner/table functions, not React hook subscriptions, actual button actions, or browser layout. In particular, replaying T4/T5 post-action settings is not proof of the provider's clear actions. These limits are explicit so a later runner cannot mislabel a partial pass as end-to-end proof.

<!-- r051-asset R051Population.test.ts bytes=11864 sha256=75138df223942a96231959f45797ec138f436f7009db4a547b40b3149ce95932 -->
```typescript
// PROPOSED / UNRUN. Place beside fixture.json, states.json, oracle.json at
// packages/explorEDA/src/research/r051/R051Population.test.ts in a later checkout.
// Tests actual wrapper/planner/table functions, not React hooks or rendered UI.
// T4/T5 apply declared post-action states; real Clear actions need separate proof.
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { CrossfilterWrapper, workspaceLiveKey } from "@/hooks/CrossfilterWrapper";
import type { LiveItem } from "@/hooks/CrossfilterWrapper";
import { barChartDefinition, type BarChartSettings } from "@/components/charts/BarChart/definition";
import { planBarChart } from "@/components/charts/BarChart/barPlan";
import { dataTableDefinition, type DataTableSettings } from "@/components/charts/DataTable/definition";
import { getFilteredRows } from "@/components/charts/DataTable/filteredRows";
import { metricCardDefinition, type MetricCardSettings } from "@/components/charts/MetricCard/definition";
import { planMetricCard } from "@/components/charts/MetricCard/metricCardPlan";
import { makeMetricCardTraceSource } from "@/components/charts/MetricCard/metricCardTrace";
import { traceRowIds } from "@/components/charts/trace/traceRows";
import { initializeData } from "@/providers/lib/dataLayerState";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import fixture from "./fixture.json";
import states from "./states.json";
import oracle from "./oracle.json";

type State = (typeof states)[number];
type Expected = (typeof oracle.tasks)[number];
type Row = Record<string, datum> & { __ID: number; orderId: string };
const layout = { x: 0, y: 0, w: 6, h: 4 };
const rows: Row[] = initializeData(fixture.rows).dataWithIds;
const column = (field: string): Record<number, datum> =>
  Object.fromEntries(rows.map((row) => [row.__ID, row[field]]));
const labels = (ids: readonly number[]) =>
  ids.map((id) => rows[id]!.orderId).sort();
const liveIds = (live: LiveItem | undefined) =>
  (live?.items ?? []).filter((item) => item.value > 0).map((item) => item.key);
const valueFilter = (field: string, value: string | null): Filter[] =>
  value === null ? [] : [{ type: "value", field, values: [value] }];
const highlighted = (plan: ReturnType<typeof planBarChart>) => labels(plan.bars
  .filter((bar) => bar.selected)
  .flatMap((bar) => bar.row.contributors.map((item) => item.sourceId)));

function makeHarness(localSelections = false) {
  const wrapper = new CrossfilterWrapper(rows, (row) => row.__ID);
  wrapper.localSelections = localSelections; // Before registering any chart.
  wrapper.setFieldGetter(column);
  let A: BarChartSettings = {
    ...barChartDefinition.createDefaultSettings(layout, "region"),
    id: "A", field: "region", title: "Web orders by region",
    localFilters: valueFilter("channel", "Web"),
  };
  let B: BarChartSettings = {
    ...barChartDefinition.createDefaultSettings(layout, "category"),
    id: "B", field: "category", title: "Orders by category",
  };
  const card: MetricCardSettings = {
    ...metricCardDefinition.createDefaultSettings(layout),
    id: "card", aggregation: "sum", measureField: "amount",
  };
  let table: DataTableSettings = {
    ...dataTableDefinition.createDefaultSettings(layout),
    id: "table", sortBy: "orderId", sortDirection: "asc",
    columns: Object.keys(fixture.rows[0]!).map((field) => ({ id: field, field })),
  };
  let rowsSettings: DataTableSettings = { ...table, id: "rows" };
  for (const chart of [A, B, card, table]) wrapper.addChart(chart);

  function apply(state: State) {
    A = { ...A, filters: valueFilter("region", state.A_region) };
    B = { ...B, filters: valueFilter("category", state.B_category) };
    table = { ...table, globalSearch: state.table_search };
    rowsSettings = {
      ...rowsSettings, globalSearch: state.rows_search,
      filters: valueFilter("status", state.rows_status),
    };
    for (const chart of [A, B, card, table]) wrapper.updateChart(chart);
    wrapper.setWorkspaceFilters(valueFilter("region", state.W_region));
  }

  function barPlan(settings: BarChartSettings) {
    return planBarChart({
      settings, width: 640, height: 400, getColor: () => "#3479a8",
      getFieldLabel: (field) => field, showTotals: true,
      snapshot: {
        revision: "r051-proof", fieldType: "categorical",
        // Exact ordinary-count consumer contract: full column, not local IDs.
        allValues: Object.values(column(settings.field)),
        liveIds: liveIds(wrapper.getAllData()[settings.id]),
        fieldData: column(settings.field),
      },
    });
  }

  function cardPlan(ids = wrapper.getChartFilteredRowIds(card)) {
    return planMetricCard(card, {
      revision: "r051-proof", liveIds: ids, allIds: rows.map((row) => row.__ID),
      measureData: column("amount"),
    }, (field) => field, (_field, value) => String(value));
  }

  function tableResults() {
    const live = wrapper.getAllData();
    // Mirrors RowsView's selected input rows and DataTable's provided-rows live map.
    const globalIds = new Set(wrapper.getFilteredRowIds());
    const rowsBase = rows.filter((row) => globalIds.has(row.__ID));
    const rowsLive = {
      nonce: 0, items: rowsBase.map((row) => ({ key: row.__ID, value: 1 })),
    };
    return {
      table: labels(getFilteredRows(rows, live.table, table).map((row) => row.__ID)),
      rows: labels(getFilteredRows(rowsBase, rowsLive, rowsSettings).map((row) => row.__ID)),
    };
  }
  return {
    wrapper, apply, barPlan, cardPlan, tableResults,
    charts: () => ({ A, B, card, table }),
  };
}

function checkBar(
  plan: ReturnType<typeof planBarChart>,
  counts: Record<string, number>, reference: Record<string, number>,
  expectedMembers: string[]
) {
  expect(plan.mode).toBe("count");
  expect(Object.fromEntries(plan.bars.map((bar) => [bar.label, bar.value]))).toEqual(counts);
  expect(Object.fromEntries(plan.domain.values.map((item) => [item.label, item.value]))).toEqual(reference);
  expect(labels(plan.bars.flatMap((bar) => bar.row.contributors.map((item) => item.sourceId)))).toEqual(expectedMembers);
  for (const bar of plan.bars) {
    const total = reference[bar.label]!;
    expect(bar.total?.value).toBe(total > counts[bar.label]! ? total : undefined);
  }
}

function checkCard(
  plan: ReturnType<typeof planMetricCard>,
  expected: Pick<Expected, "G" | "card_valid" | "card_excluded" | "card_value" | "card_state">
) {
  expect(plan.rowCount).toBe(expected.G.length);
  expect(plan.state).toBe(expected.card_state);
  expect(plan.value).toBe(expected.card_value === null ? undefined : expected.card_value);
  expect(labels(plan.contributors.map((item) => item.sourceId))).toEqual(expected.G);
  expect(labels(plan.contributors.filter((item) => item.included).map((item) => item.sourceId))).toEqual(expected.card_valid);
  expect(labels(plan.contributors.filter((item) => !item.included).map((item) => item.sourceId))).toEqual(expected.card_excluded);
  expect(plan.includedCount).toBe(expected.card_valid.length);
  expect(plan.excludedCount).toBe(expected.card_excluded.length);
  const trace = makeMetricCardTraceSource(plan).resolve("metric-card", "metric-card:total");
  expect(trace).toBeDefined();
  expect(labels(traceRowIds(trace!) ?? [])).toEqual(expected.G);
}

describe("R051 frozen population contract — proposed product proof", () => {
  beforeAll(() => registerAllCharts());

  it("preserves the frozen source labels and positional runtime mapping", () => {
    expect(rows.map((row) => row.orderId)).toEqual(oracle.full);
    expect(rows.map((row) => row.__ID)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("matches hand-written membership and contributor literals through T0–T5", () => {
    const h = makeHarness();
    for (const state of states) {
      const expected = oracle.tasks.find((task) => task.id === state.id);
      if (!expected) throw new Error(`Missing independent oracle for ${state.id}`);
      h.apply(state);
      const { A, B } = h.charts();
      const live = h.wrapper.getAllData();
      const peer = (id: string) => h.wrapper.charts.get(id)!.group.all()
        .filter((item) => item.value > 0).map((item) => item.key);
      const global = labels(h.wrapper.getFilteredRowIds());
      console.info("[R051 population]", state.id, { global, local: labels(liveIds(live.A)) });
      expect(global).toEqual(expected.G);
      expect(h.wrapper.getFilteredRowCount()).toBe(expected.G.length);
      expect(labels(peer("A"))).toEqual(expected.P_A);
      expect(labels(peer("B"))).toEqual(expected.P_B);
      expect(labels(liveIds(live.A))).toEqual(expected.C_A);
      expect(labels(liveIds(live.B))).toEqual(expected.P_B);
      expect(labels(h.wrapper.getChartFilteredRowIds(A))).toEqual(expected.M_A);
      expect(labels(h.wrapper.getChartFilteredRowIds(B))).toEqual(expected.G);
      const workspace = live[workspaceLiveKey("region")];
      if (expected.Q_workspace_region === null) expect(workspace).toBeUndefined();
      else expect(labels(liveIds(workspace))).toEqual(expected.Q_workspace_region);
      const a = h.barPlan(A);
      const b = h.barPlan(B);
      checkBar(a, expected.A_counts, oracle.A_full_source_reference_counts, expected.C_A);
      checkBar(b, expected.B_counts, oracle.B_full_source_reference_counts, expected.P_B);
      expect(highlighted(a)).toEqual(state.A_region === null ? [] : expected.M_A);
      expect(highlighted(b)).toEqual(state.B_category === null ? [] : expected.G);
      checkCard(h.cardPlan(), expected);
      expect(h.tableResults()).toEqual({ table: expected.table_rows, rows: expected.rows_rows });
      expect(A.localFilters).toEqual([{ type: "value", field: "channel", values: ["Web"] }]);
    }
  });

  it("keeps notebook selections separate while workspace filters remain active", () => {
    const h = makeHarness(true);
    const state = states.find((item) => item.id === "T3");
    if (!state) throw new Error("Missing T3 notebook input");
    h.apply(state);
    const expected = oracle.notebook_T3;
    const { A, B } = h.charts();
    const live = h.wrapper.getAllData();
    const a = h.barPlan(A);
    const b = h.barPlan(B);
    console.info("[R051 notebook]", labels(h.wrapper.getFilteredRowIds()));
    expect(labels(h.wrapper.getFilteredRowIds())).toEqual(expected.G);
    expect(labels(liveIds(live.A))).toEqual(expected.C_A);
    expect(labels(h.wrapper.getChartFilteredRowIds(A))).toEqual(expected.getChartFilteredRowIds_A);
    expect(highlighted(a)).toEqual(expected.A_own_highlight);
    expect(highlighted(b)).toEqual(expected.B_own_highlight);
    expect(labels(liveIds(live[workspaceLiveKey("region")]))).toEqual(expected.Q_workspace_region);
    checkBar(a, expected.A_counts, oracle.A_full_source_reference_counts, expected.C_A);
    checkBar(b, expected.B_counts, oracle.B_full_source_reference_counts, expected.P_B);
    checkCard(h.cardPlan(), expected);
    expect(h.tableResults()).toEqual({ table: expected.table_rows, rows: expected.rows_rows });
  });

  it("distinguishes numeric zero, all-invalid membership, and empty membership", () => {
    const h = makeHarness();
    // Runtime IDs below are frozen literals, not production-derived expectations.
    const zero = h.cardPlan([3]); // O04.
    expect([zero.state, zero.valueText, zero.rowCount, zero.includedCount]).toEqual(["value", "0", 1, 1]);
    const invalid = h.cardPlan([5]); // O06.
    expect([invalid.state, invalid.valueText, invalid.rowCount, invalid.excludedCount]).toEqual(["invalid", "No valid values", 1, 1]);
    const empty = h.cardPlan([]);
    expect([empty.state, empty.valueText, empty.rowCount]).toEqual(["empty", "No rows", 0]);
    expect(invalid.value).toBeUndefined();
    expect(empty.value).toBeUndefined();
  });
});
```

### Remaining required application proof

The small production draft must be supplemented in the actual environment only where it leaves a concrete gap:

1. **Provider/identity/conversion:** mount the frozen raw rows; assert O01→0 through O12→11; verify effective `amount` values, raw null/invalid provenance and the sum/contributor partitions. No replacement/reorder is part of this task.
2. **Real consumers:** assert actual `SingleBarChart` plan inputs, metric plan and table/Rows results rather than only wrapper methods. Count foreground and faint reference populations separately. At T2, inspect B's optional named sum consumer and confirm the 80/200 contextual groups before correcting documentation.
3. **Actual actions:** invoke A's clear action and the provider's Clear all filters path; verify state and rendered memberships at T4/T5. The fixed local restriction must survive. A manual settings replay is insufficient for this action proof.
4. **Trace and controls:** use real trace entry and source-row browsing; check numeric exclusions remain inspectable; confirm existing owner help, bar status and workspace scope notes are available without added controls.
5. **Responsive input:** test pointer and keyboard at 1280, 783 and 390 CSS pixels. Record which surface is live. The existing generic docs LiveExample uses a screenshot fallback on narrow screens; a screenshot is not a passed pointer/keyboard flow. Any proposed direct JSON example needs explicit custom-component coverage. [SRC4] [SRC5] [SRC7] [SRC9] [SRC12]

Stop on a membership discrepancy and classify it: fixture/oracle error, source change, harness limitation, or product behavior. Do not revise expected arrays until an independent ledger review establishes the correct truth. Do not repair filtering to force equal totals.

## 8. Rehydrate and run: one reviewable run sheet

The first block of the run sheet extracts this report's embedded assets into an ordinary scratch directory. It refuses unsafe names and content drift. The Python arithmetic check is self-contained. The pnpm commands are a **later** application proof stage requiring an authorized runnable checkout; they were not run in this research. Place extracted files in the proposed test directory only during that later work.

```bash
# Stage A — alongside the delivered proof-plan.md; no checkout required.
python3 - <<'PY'
from pathlib import Path
import hashlib
import re

report = Path('proof-plan.md').read_text(encoding='utf-8')
out = Path('r051-kit')
out.mkdir(exist_ok=True)
pattern = re.compile(
    r'<!-- r051-asset ([A-Za-z0-9._-]+) bytes=(\d+) sha256=([0-9a-f]{64}) -->\n'
    r'```[^\n]*\n(.*?)```', re.S
)
expected = {'fixture.json', 'states.json', 'oracle.json',
            'check-oracle.py', 'R051Population.test.ts'}
seen = set()
for name, size, digest, body in pattern.findall(report):
    if name not in expected or name in seen:
        raise SystemExit(f'Unexpected or duplicate asset: {name}')
    data = body.encode('utf-8')
    if len(data) != int(size) or hashlib.sha256(data).hexdigest() != digest:
        raise SystemExit(f'Embedded asset hash/size mismatch: {name}')
    target = out / name
    if target.exists() and target.read_bytes() != data:
        raise SystemExit(f'Refusing to replace different existing file: {target}')
    target.write_bytes(data)
    seen.add(name)
    print(f'[extract] {name}: {len(data)} bytes, SHA256 {digest}')
if seen != expected:
    raise SystemExit(f'Missing assets: {expected - seen}')
PY
python3 r051-kit/check-oracle.py \
  r051-kit/fixture.json r051-kit/states.json r051-kit/oracle.json

# Stage B — FUTURE ONLY, in an authorized runnable repository checkout.
# Place the extracted three JSON files and R051Population.test.ts together at:
# packages/explorEDA/src/research/r051/
# Confirm/review source drift before interpreting any result.
git rev-parse HEAD
# Research baseline: 63dfa75851ef57bb3782e6d7c1ef104784cd4064

pnpm --filter exploreda exec vitest run \
  src/hooks/CrossfilterWrapper.test.ts \
  src/components/ActiveFilterStatus.test.tsx \
  src/research/r051/R051Population.test.ts
pnpm --filter exploreda check-types

# Add meaningful provider/action/consumer checks listed above; do not mistake
# the planner proof for those separate checks. Verify the custom docs example.
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify

# Collect real pointer/keyboard proof at 1280, 783 and 390 px before approval.
# After focused work, run each required root/PR gate in the later checkout.
pnpm check
pnpm check:pr
```

## 9. Fair current-controls comparator and explanation scripts

Every arm preserves the same fixture and actual filtering semantics. Do not hide existing status/help, remove bar context, or rewrite selections to make an intervention look better. The selected/current scope counts are already a delivered capability. Source evidence for this comparator is `ActiveFilterStatus`, `LocalFilterStrip`, `BarChart`, trace bodies, and the existing filter/rendering/workspace/notebook/trace documentation. [SRC4] [SRC7] [SRC8] [SRC9] [SRC10]

| Current capability retained in every arm | What it supplies |
| --- | --- |
| Global count tooltip | Count passes every workspace/chart filter; table searches and Rows predicates remain local. |
| Workspace/chart/Rows/search chips | Separate owners, remove actions and navigation/highlighting for chart ownership. Chart owner may require hover/focus rather than appearing in visible predicate text. |
| Local strip | Visible Only + restriction; help explicitly limits that chart and says other charts ignore it. |
| Bar footer and dimming | Selected-in-chart count against current foreground context; own alternatives remain inspectable. |
| Existing trace | Bar scope, workspace restrictions, source records and metric matching/used/excluded accounting. |
| Existing docs | Self-exclusion, searches, full/peer/global terms, clearing, notebook local selections, and trace gestures. |

The current grouped-summary documentation error is a separate source finding. The scored five tasks use category counts, not named summaries. If the factual correction is integrated before a study, give it to all arms, label the common baseline A1, and keep its observations separate from original A0. Do not create an apparent benefit for B/C by giving A an intentionally defective consumer explanation.

### A — existing UI and its existing documentation

**Exposure script:** “Use the current filter bar, chart status, local restriction strip, trace and the linked documentation. They remain available during every prediction. Before the announced change is applied, say which source IDs and requested values will result, and which owner controls that result.”

Provide the same entry-point walkthrough for all arms: where help can be opened, how to inspect a chip owner, where trace is, and how to return. Do not teach the task answers. Actual current help is the control; this script does not replace it with a stripped-down summary.

### B — revised tooltip plus one focused worked example

**Candidate tooltip, ordinary linked mode only:**

> The count uses every workspace filter and linked chart selection. Each category chart ignores only its own selection when showing its context. Chart-local restrictions, table searches, and Rows searches or filters do not change this count.

**Unscored training example:**

> Start with twelve orders. The Region chart has “Only channel = Web,” so its foreground counts describe seven orders. Select South in that chart. O10 is its one selected Web order, while the linked count is two: O10 and Store order O11. Their amounts sum to 200. The category selection sends Region = South to other views; it does not send the chart's Web restriction. A table search for “rush” leaves O10 in that table without changing the linked count. Adding workspace Region = West conflicts with the chart's South selection. Clearing the chart selection leaves the workspace owner in place. Clear all filters removes those selections and searches, while the chart's Web restriction remains.

Reset to T0 after training. Never show T1–T5 answer cards as the worked lesson. The cost of reading this example is part of B's inspection burden; do not remove it from timing.

### C — one contextual sentence in the existing trace

Preserve A; add exactly one state-specific sentence at the existing trace body in the study stimulus. Candidate examples:

**A at T1:**

> This chart shows seven Web orders as context and its West selection matches four of them; across the workspace, that Region = West selection matches six orders, including two Store orders.

**A at T3:**

> Within this chart's Web-only population, workspace Region = East and the Category chart's Tech selection leave one context row; this chart's own Region = West selection matches none, while all linked filters together match zero rows.

These are precise stimulus examples, not an implemented generic generator. Use pre-action state text while the next prediction is being made; reveal the next state's sentence only after the prediction is locked. A later product sentence must use already-established renderer populations and filter settings, not a second evaluator. Do not reuse bar wording for notebook highlights, metrics, field previews or custom aggregate overrides without separate proof.

### D — temporary context-versus-selected comparison

Preserve A; expose a study-only two-column card for the currently inspectable state. At T1 for A:

| Foreground context in this chart | Matching its own West selection within this chart |
| --- | --- |
| O01,O02,O05,O06,O09,O10,O12 — 7 Web orders | O01,O02,O09,O12 — 4 Web/West orders |

Below the card, identify the different global result: “Linked membership also includes Store orders O03 and O04: six West orders in total.” Faint source-reference bars describe all twelve orders separately. The card is literal oracle material for the study, not a saved product control. If this third distinction makes the nominal two-way comparison cumbersome, that is a rejection signal for D rather than permission to omit G or change the data.

As with C, do not reveal the target post-action card before a prospective prediction. Reading an exact answer off the card measures aided interpretation, not membership prediction.

### Provisional expert comparison, not participant results

Scores range from 1 (least favorable) to 5 (most favorable); high burden/effort/maintenance scores mean less cost. They are static design judgments, not observed accuracy, timing, preference or effect size. Do not sum them into an adoption verdict.

| Task-relevant dimension | A / B | C / D |
| --- | --- | --- |
| Membership prediction support | 4 / 5 | 4 / 4 |
| Owner clarity | 4 / 5 | 5 / 3 |
| Terminology burden | 4 / 4 | 3 / 2 |
| Inspection effort | 3 / 3 | 3 / 2 |
| Maintenance cost | 5 / 4 | 3 / 2 |

A has strong existing coverage; B adds a transferable causal example at a modest maintenance cost. C targets one current trace but risks consumer/mode drift. D makes IDs explicit but may mostly duplicate the existing footer and invite a third-set ambiguity. These are hypotheses about the supplied stimuli. B is the preferred experiment, while A remains the product recommendation until observed evidence warrants otherwise.

## 10. Moderation protocol, scoring and counterbalancing

### Recruitment and eligibility

No participants are available in this research session: **recruited 0, completed 0**. No named demand is asserted and no invitations were sent. A future moderator should recruit consenting adults who use tables or dashboards, exclude report authors/oracle reviewers, and record prior explorEDA/Crossfilter/linked-dashboard experience. Do not substitute generated personas or internal source reviews for people.

The smallest falsification pilot is **four adults, two A and two B**, with experience balanced as far as feasible. Its purpose is to expose a reason not to add B, not to estimate a population effect. Expand to eight only if a specific unresolved task error would change the next decision. If wider comparison is needed, a proposed sixteen-person four-arm study gives four first exposures per condition; balance experience within each arm. These are proposed sample sizes, not achieved enrollment or a power calculation. Convenience samples, developer-heavy recruitment and familiarity limit generalization.

### Session sequence

1. Explain consent and recording scope. Provide the same fixture ledger and neutral task overview. Record first-exposure variant, experience stratum, input method, viewport and whether the surface is a verified live product or a clearly labeled paper stimulus.
2. Give a **four-minute orientation** with access to that arm's materials and all common controls. This cap is a proposed protocol parameter, not a measured duration. B's South training is included inside it. A receives real docs/help access, not silence.
3. Reset to T0. Announce each next action exactly as in the five task cards. Allow at most **four minutes per task**. Let the participant choose available help; record inspection effort rather than forcing equal reading behavior.
4. Lock exact IDs, explicitly core scalar values and the owner explanation before applying/revealing the action. Record confidence if desired as self-report, not correctness. Missing responses at the cap are scored incorrect under the predeclared rule.
5. Reveal the resulting state after locking. Record aided interpretation separately. Do not correct or coach until the five prospective tasks finish. If a technical discrepancy occurs, stop scoring and investigate source/oracle/runtime agreement.
6. Conduct ambiguous-word probes after all primary answers. Then show the remaining variants in the assigned exploratory order; do not treat repeat exposure as new independent prediction evidence.

**Opening script:**

> These are twelve orders with fixed source IDs. Some controls select records for linked views; others affect a particular view. Use the interface and documentation available to you. Before each announced change is applied, predict the source IDs and requested values, and explain which control determines them. This is a test of the explanations, not a test of you.

**Neutral follow-up after locking:** “Which control or sentence led to that answer?” Do not prompt “remember self-exclusion” or point out the relevant owner before scoring. If an action is unclear, repeat its verbatim wording rather than supplying its consequence.

### Exact scoring rule

Each task earns one binary primary point only when **all predeclared core ID sets, any explicitly core-requested scalar/count/value, and the owner explanation are correct**. A correct count with incorrect IDs fails. Compare ID sets without regard to order, but reject duplicates offered as extra membership. Arithmetic not designated core is diagnostic only; contributor IDs are core where requested. Never adjust the rubric after seeing answers.

| Task | Core IDs and scalar answers | Required causal explanation |
| --- | --- | --- |
| T1 | G=6 named IDs; C_A=7 named IDs; M_A=4 named IDs. | A omits its own selection for context; Web stays local and does not constrain peers' Region predicate. |
| T2 | G `{O02,O04,O09}`; valid `{O02,O04}`; sum 200; T `{O04,O09}`; Rows `{O04}`; all corresponding counts. | Workspace and chart Region are distinct owners; searches are local; zero contributes and null remains membership. |
| T3 | G `∅`; C_A `{O06}`; Q_region `{O02,O04,O09}`; counts 0/1/3; card label `No rows`. | Only the owning dimension is omitted from each control's context; global West/East conflict remains. |
| T4 | G `{O06,O08}`; valid `{O08}`; sum 300; T `{O06}`; Rows `∅`; corresponding counts. | Clear A preserves other owners; invalid O06 stays in membership. |
| T5 | G=U; C_A=L_A; T=U; Rows=U; counts 12/7/12/12. | Clear-all removes active selection/search owners while retaining A's local population. |

The brief's acceptance threshold is **at least four of five correct tasks per real participant**. Report individual binary vectors and the numerator/denominator achieving that threshold, retaining severe owner/contributor mistakes even in a passing overall vector. Five tasks from one person are not five participants. A study-level preference decision must also compare A fairly; a high B pass rate alone cannot establish incremental value.

### Counterbalance variants without reusing learned answers as evidence

Keep T1→T5 fixed. Assign first variants in balanced blocks; if collecting a four-arm sample, stratify experience and use these Williams orders for the subsequent exploratory explanation review:

| Assignment | Exposure order |
| --- | --- |
| 1 | A → B → D → C |
| 2 | B → C → A → D |
| 3 | C → D → B → A |
| 4 | D → A → C → B |

Only the first variant generates primary five-task scores. Later wording comments, preferences and transfer questions retain their exposure order and are exploratory. Rotating labels or row positions does not erase learning of the rule. For the small A/B pilot, balance initial A/B assignment and optionally show the other variant after scoring; do not pool those repeated answers into the primary comparison.

Equal exposure means the same access opportunity, base documentation, data, task timing and entry-point guidance. It does not mean hiding A's help or forcing every participant to spend identical reading time. Record tooltip/trace/docs opens, time spent, help requests, pointer versus keyboard use and whether materials were discovered. Post-action answer lookup must remain distinct from prospective prediction.

### Ambiguous-word checks after primary scoring

- “What did selected mean in the bar footer, metric and trace?” Separate global membership, selected within chart, and notebook own highlight.
- “When you read this chart's filter, did you include Only Web?” Separate local drawing restrictions from linked predicates.
- “Which Region filter did you mean?” Require an owner: A or workspace.
- “Did all mean all source rows, all Web rows, or all rows currently matching the other owners?” Include faint references explicitly.
- “What did used or excluded mean in the metric?” Require the membership/numeric distinction, including valid zero.
- “What did clear all leave in place?” Ask the participant to locate the retained local strip.
- “Does an empty Rows result prove no selected orders?” Contrast T3 and T4 without changing the scored record.
- “Would a notebook selection have the same linked effect?” Use the fresh-instance unscored side case; never retroactively alter the five-task result.

Preserve verbatim answers before coding them. Add observation codes such as `owner_conflation`, `local_as_linked`, `context_as_selected`, `reference_as_context`, `invalid_as_nonmember`, `zero_as_missing`, `search_as_global`, and `clear_all_as_local_reset`. These are proposed coding categories, not observed failures or a product taxonomy.

### Blank observation record, not synthetic evidence

```json
{
  "study_status": "not_run",
  "participants_recruited": 0,
  "participants_completed": 0,
  "first_exposure_variant": null,
  "baseline_version": null,
  "surface_verified": null,
  "viewport": null,
  "input_method": null,
  "participant_experience": null,
  "task_observations": [],
  "core_pass_vector": null,
  "meets_four_of_five": null,
  "inspection_events": [],
  "verbatim_ambiguity_answers": [],
  "diagnostic_error_codes": [],
  "exploratory_exposure_order": [],
  "interpretation": "No participant evidence exists yet."
}
```

Create one actual record per consenting participant later. Do not populate an example with invented successful scores or quotes. In a paper wording study, disclose that interaction effort and application discoverability were not measured on the product.

## 11. Rejection gates, decisions and failure handling

### Gate A: source and stimulus correctness

Before interpreting a live study, every measured state must match the exact oracle in the actual consumer and action path. Verify IDs, contributor partitions, zero/invalid/empty distinctions, local search scope, clear retention, notebook setup and foreground/reference separation. If a source change or implementation mismatch appears, stop and classify it before testing explanations. The 121 arithmetic assertions are a prior independent check, not a substitute for this runtime gate.

The aggregate-doc contradiction is handled as a factual correction. It is not counted as a participant failure, and it does not authorize changing group membership. A correct context that differs from G is not a wrong result merely because a reader expected equality.

### Gate B: human comprehension

At least four of five core predictions must be correct per person. Actual scores remain unmeasured. The small pilot can reject a burdensome explanation but cannot support a general effect claim. Preserve denominators, first-exposure assignment and task error detail when reporting it.

### Reject the favored B candidate when

- A's participants meet the gate comparably and B adds no task-specific correction. In the initial two-per-arm pilot, a tie offers no evidence that extra explanation is needed; retain A rather than calling the designs equivalent for the population.
- B causes a repeated misinterpretation, such as treating Web as linked, treating all Region predicates as one owner, or excluding O06 from membership.
- Apparent success depends on looking up the already revealed answer rather than predicting a change.
- Extra terminology or inspection time increases without useful correction. Record the tradeoff instead of replacing the requested dimensions with preference alone.
- Results are inconclusive or recruitment is unavailable. Retain current behavior and preserve the kit.

A single serious factual error in B/C/D must be corrected before further study; it cannot be excused by a favorable score. If B has a promising task-specific effect but the sample is small, the next step is another bounded review/prototype decision, not shipping. Consider C only when a specific observed owner-reconciliation difficulty remains and accurate trace input is proven. Keep D study-only unless a separately reviewed mission justifies more; no new persistent comparison control is authorized here.

## 12. Bounded integration and continuation

The seven disposition proposals are: **FO01** adopt the exact proof contract; **FO02** adopt narrow documentation corrections; **FO03** retain existing UI/semantics; **FO04** investigate B versus A; **FO05** defer conditional C; **FO06** defer D to research-only inspection; **FO07** reject architectural/scope expansion. “Adopt” is a research recommendation for later review, not implementation approval.

Any later visible milestone must pair `apps/demo/src/docs/pages/filters.mdx` or `rendering.mdx` with one focused real-component example. Existing wiring was verified: `DocsSite.tsx` passes `mdxComponents`; `components/content.tsx` registers `WorkedOrder` and `LiveExample`; rendering.mdx uses WorkedOrder. A **proposed new** `docs/live/FilterOwnershipExample.tsx` can import the frozen JSON, mount existing ExplorEda and register through that same table, with explicit docs/browser coverage. No new route, CSV conversion, persistent scope control, or alternate evaluator is needed. Existing saved-filter is a Lorenz example; existing workspace/shop-operations uses a different 500-order fixture. Do not claim the proposed twelve-row example already exists. [SRC12]

Keep React/TypeScript and pnpm. Leave Crossfilter replacement, saved filter union expansion, identity/replacement repair, routing and a universal scope platform outside R051. Historical TN decisions at `3d1ffebb2687a5db8bc5723e868ae9f5e43be7eb` preserve query/entity/linked/local distinctions; MS decisions at `6cab0a1bcf80ea0a72d9441b7545db46bc2697ac` preserve membership/contributor accounting; SI decisions at `191dc9343b1c658b082d30138f972949f4c43b06` identify ownership gaps in replacement without establishing merged repairs. The supplied local queue says completed research R026/PR465, R043/PR466, R077/PR484, R001/PR492, with **R086 then R031** next; reuse R008/PR464 and R011/PR461. These are queue/disposition facts, not application merger claims.

**Current outcome:** GO for the completed research kit and bounded correctness/study review. NO-GO now for claiming a usability win or implementing added UI. Product/runtime/browser proof remains unrun, participant evidence remains absent, and the current interface remains the default.

## Source references and receipt boundary

Repository links are pinned to the evaluated baseline; all source access was read-only on October 22, 2026. The full per-file receipt inventory is recorded in evidence.md; this report names the decisive paths and symbols directly for independent interpretation. Existing source tests were read, not run.

[SRC0]: https://github.com/byronwall/explorEDA/commit/63dfa75851ef57bb3782e6d7c1ef104784cd4064 "Exact owner/ref authenticated; packet has separate verified local receipts"
[SRC1]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/lib/dataLayerState.ts "initializeData assigns __ID:index, lines 7–11"
[SRC2]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/hooks/CrossfilterWrapper.ts "chart dimensions 92–104; workspace 130–161; global/local retrieval 170–211; notebook 40–44,79–82"
[SRC3]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/lib/chartPopulation.ts "local population conjunction and restriction"
[SRC4]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx "SingleBarChart peer IDs, full values, explicit aggregate input and selected/context footer; see sibling definition.ts and barPlan.ts"
[SRC5]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/providers/DataLayerProvider.tsx "getAggregateResult 954–959; clearAllFilters 1121–1148"
[SRC6]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts "getFilteredRows; RowsView first supplies global IDs; table definition omits globalSearch from linked predicates"
[SRC7]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/ActiveFilterStatus.tsx "existing owner chips, count/search help and clear controls; sibling LocalFilterStrip provides Only population help"
[SRC8]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/rendering.mdx "existing full/peer/global terms and overbroad grouped-summary sentence; sibling filters.mdx explains own alternatives and searches"
[SRC9]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts "planMetricCard matching/valid/excluded and empty/invalid/value states; MetricCard.tsx supplies getChartFilteredRowIds; traceRows retains contributor IDs"
[SRC10]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/pages/notebooks.mdx "local notebook chart selections, shared workspace filters"
[SRC11]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/packages/explorEDA/src/components/charts/ChartRenderer.tsx "standard registered renderer passes base props, no aggregateResult override"
[SRC12]: https://github.com/byronwall/explorEDA/blob/63dfa75851ef57bb3782e6d7c1ef104784cd4064/apps/demo/src/docs/components/content.tsx "existing custom MDX registration; DocsSite.tsx and live/LiveExample.tsx verified separately"

Primary comparison references, accessed October 22, 2026, are the [Crossfilter2 API](https://github.com/crossfilter/crossfilter/wiki/API-Reference#dimension_group), [Mosaic Selection](https://idl.uw.edu/mosaic/api/core/selection.html), [Observable Plot interactions](https://observablehq.github.io/plot/features/interactions), and [Tableau filter actions](https://help.tableau.com/current/pro/desktop/en-us/actions_filter.htm). They inform owner-specific explanatory hypotheses; they provide no participant results for this product. All exact explorEDA answers in this kit come from its pinned consumers and frozen ledger.
