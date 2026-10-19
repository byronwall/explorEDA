# Revised research queue

**Decision date: 2026-10-19 UTC. Baseline: `0984715cb4c0c85d0d6efa8436ab38368bd20ae1`.**

This revises the supplied **new research context** at `docs/research/source-freshness-2026-10-18/research-queue.md`, rather than replacing the baseline preparation review at `docs/research/data-preparation-boundary-2026-10-16/research-queue.md`. Both supplied queues retain the same six candidates. The selected freshness research is now answered; its remaining action is a bounded local and author proof, not another broad research mission. Historical assertions about open PRs or other active work in the supplied context are not independently verified here. [Q1]

Keep independent complete source snapshots as the default. No new refresh feature is approved. First test the existing `sql=` boundary with one order-grain reconciliation source; expand only when a real task rejects that handoff for a material reason. [freshness-decision.md](freshness-decision.md) states the decision; [proof-plan.md](proof-plan.md) supplies exact fixture states and gates. **All experiments below are unexecuted.** The packet is selected source evidence, not a runnable checkout.

## Original ranks and revised next actions

These priorities are local judgments about the next useful evidence, not measured demand or feature scores.

| Original → revised rank | Preserved candidate | Revised disposition |
|---|---|---|
| 1 → 1 | Cross-source freshness | Broad research closed; existing-SQL author proof next |
| 2 → 2 | Selection/export/undo/reopen trust | Local journey awaiting execution |
| 3 → 3 | Selected-row meaning after refresh | Separate policy question; observe first |
| 4 → 4 | Complete-snapshot workload limits | Blocked on a named workload and target |
| 5 → 5 | Proposed 18-row preparation proof | Execute existing proposal; preserve prior review |
| 6 → 6 | Warehouse task blocker | Blocked on provider, task, account, and cost |

## 1. Can existing SQL satisfy the reconciliation task?

**Activation:** A task owner accepts the defined reconciliation question and can use a local SQLite database. Without that owner or setup, promote rank 2 to the next executable activity.

- **Next action:** Follow the linked proof plan: baseline state, atomic business change adding C3/O103/R502, all-success mixed reads, partial Refresh All failure, and reference-only S2. Compare exact membership and measures with one SQL result that aggregates returns before joining at order grain. Then ask the author to create, refresh, and explain it.
- **Success/stop:** Correct values, membership, documented source meaning, and an acceptable author handoff close this item without a feature. Stop feature design if provenance plus existing SQL suffices. Investigate a coherent same-connection scope only if the owner demonstrates why required separate source grains make that solution unsuitable. Grouped publication alone cannot correct incompatible upstream reads.
- **Destination:** This freshness decision and proof record. Keep broader selection policy in rank 3. Any eventual product milestone must pair the database-sources docs section with its runnable example. [Q2]

The reason to test is concrete: current `App.refreshSources` stops on failure and reloads a successful prefix; `readSnapshot` stamps application completion time, not a common database moment. [Q3]

## 2. Does the trust journey preserve membership and measures?

**Activation:** A runnable checkout and browser are available for one agreed small fixture.

- **Next action:** Start with one category selection across a bar, card, and exported records. Record member IDs and valid numeric contributors separately. Only after agreement, add undo/redo, reopening, and a second chart family.
- **Success/stop:** Exact membership and values agree through the journey. Stop at the first reproducible mismatch and record a bounded repair with expected and actual results; avoid expanding the chart matrix before resolving it.
- **Destination:** `docs/intent/current-analysis-trust/`. Its brief already specifies this sequence and warns that historical reports are not a fresh verification pass. [Q4]

This tests existing behavior. It does not duplicate the freshness contract decision or claim that saved analysis text preserves historical data versions.

## 3. What should a selected row mean after refresh?

**Activation:** An author expects selection to survive refresh, or rank 1/2 exposes a concrete identity mismatch.

- **Next action:** Observe a unique-key selection through reorder and insertion, then deletion, duplicate keys, and missing keys. Compare selected IDs before and after; distinguish a removed entity from an ambiguous identity. Record current behavior before proposing a policy.
- **Success/stop:** A selected entity remains the same entity or is explicitly unresolved according to an agreed policy. Stop when the local contract and one counterexample are clear; do not redesign history, annotations, and all selection consumers together.
- **Destination:** A separate refresh-identity question under current-analysis-trust. Rank 1 checks only one identity interaction.

The evidence justifies investigation: `sourceRowIdentities` uses typed unique keys but falls back to row indexes for duplicate/missing keys; `resolveSourceRow` resolves that fallback by index. This does not prove actual saved-selection behavior. [Q5]

## 4. Which complete-snapshot workload misses its target?

**Activation:** Name the dataset, row count, column widths/types, device/browser, and acceptable time/memory targets. A hypothetical size threshold is insufficient.

- **Next action:** Measure database read, transfer, parsing/conversion, folder load, and one interaction separately. Identify the dominant cost before comparing execution placement or transport changes.
- **Success/stop:** If the workload meets its target, retain the complete snapshot. If it misses, reproduce the specific bottleneck and test one proportionate change. Stop general capacity or infrastructure research without that evidence.
- **Destination:** Execution findings belong to `database-query-contract`; transport findings to the separately referenced columnar-transport intent. The latter file is not included here. The included query-contract brief explicitly defers execution changes until a named workload misses its target. [Q6]

## 5. Can an author complete the proposed 18-row preparation proof?

**Activation:** Obtain the prior proof and runnable example in their owning review, plus an author willing to attempt the handoff. Those proof contents were not included in this packet.

- **Next action:** Execute that existing proposal with its guide. Check whether the author obtains and explains its specified results, including grain and missingness. Record an actual export/import dead end only if encountered.
- **Success/stop:** Correct outcomes and an acceptable handoff close the proof. A failure activates only its owning deferred question. Do not reconstruct the prior proof from this queue or repeat preparation/platform comparisons.
- **Destination:** The preparation review associated with PR #451; current PR status is unverified. Its included decisions already call the proof proposed, keep reshaping upstream, and reject a general preparation platform. [Q7]

## 6. Which warehouse prevents an actual task?

**Activation:** A named provider, analyst task, authorized account, and explicit cost decision are all available.

- **Next action:** Collect those constraints and identify the smallest existing-source-contract gap. Only then request the relevant access and evaluate a bounded provider-specific proof.
- **Success/stop:** Either the existing boundary serves the task or one reproducible missing capability is identified. Stop while access, task, or cost remains unspecified. Provision nothing from this queue.
- **Destination:** The warehouse-sources intent referenced by the supplied queues and database-adapters brief; its full text is outside this packet. Adapter availability supplies neither demand nor test access. [Q8]

## Packet evidence anchors

- **[Q1]** Supplied new context: `docs/research/source-freshness-2026-10-18/research-queue.md`, lines 3–14; baseline queue: `docs/research/data-preparation-boundary-2026-10-16/research-queue.md`, lines 3–18.
- **[Q2]** `AGENTS.md`, line 8: docs and example in the same user-visible milestone.
- **[Q3]** `apps/app/src/App.tsx::refreshSources`, lines 422–449; `packages/explorEDA/src/server/sources/read.ts::readSnapshot`, lines 116–154.
- **[Q4]** `docs/intent/current-analysis-trust/intent-brief.md`, lines 21–31, 41–53.
- **[Q5]** `packages/explorEDA/src/components/project/sourceRowIdentity.ts::sourceRowIdentities/resolveSourceRow`, lines 21–69.
- **[Q6]** `docs/intent/database-query-contract/intent-brief.md`, lines 11, 15, 23, 60–62.
- **[Q7]** `docs/research/data-preparation-boundary-2026-10-16/decisions.md`, DP-01/04/06–10, lines 9–18, 22.
- **[Q8]** Both included queues, rank 6; `docs/intent/database-adapters/intent-brief.md`, lines 19, 55–59.
