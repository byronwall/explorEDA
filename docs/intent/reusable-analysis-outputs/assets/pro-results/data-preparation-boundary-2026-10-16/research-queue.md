# Next research questions

**Research date:** 2026-10-18  
**Repository:** `byronwall/explorEDA` — <https://github.com/byronwall/explorEDA>  
**Authoritative baseline:** `b07f3cf3483130f6cc3391bba47a87f616c93321` on `main`, supplied in `source-packet(2).txt` and rechecked by Codex on 2026-10-18 according to the user.

This is a ranked, conditional research queue, not an implementation roadmap. The companion [report](report.md) chooses the preparation boundary; [proof plan](proof-plan.md) specifies its falsifiable example. These questions seek evidence those deliverables do not establish. Existing initiatives retain ownership. No source changes, issues, runtime results, or new commitments are claimed.

“Current” in an intent's front matter does not override its substantive deferred status. In particular, missingness and reusable outputs remain future seeds. The [comparison collection][comparison] also preserves its selected priorities; this queue does not reorder them.

## Q1 — Does a complete selection and restore journey preserve the analysis?

- **Question:** Do chart selection, exported rows, undo/redo, and reopening preserve the same population, numeric exclusions, and values?
- **Prior intent/status:** [Current analysis trust][trust] is a current verification candidate, not a fresh runtime pass. Its first proposed journey compares a bar, card, and exported records.
- **Novelty:** The preparation proof checks authored queries and source meaning. This question checks their consumers and saved-state lifecycle together.
- **Product value:** Finds concrete disagreements in an existing workflow without adding preparation scope.
- **Uncertainty:** Provider, export, history, and restore behavior was not executed in this review. Historical browser waivers are not failures or passes at this baseline.
- **Dependency:** Establish the companion proof's expected population and measure definitions first.
- **Activation condition:** The bounded preparation proof is ready and existing-analysis trust verification is selected.
- **Next action:** Trace one category selection through a bar, card, records export, undo/redo, and reopening. Record exact membership and values. Extend to another chart family only if the first journey passes or exposes a specific repair.
- **Destination:** `docs/intent/current-analysis-trust/`.

## Q2 — What survives when selected records meet refreshed source data?

- **Question:** What does a saved selected row mean after an explicit refresh reorders or deletes rows, or encounters missing or repeated keys?
- **Prior intent/status:** [Current analysis trust][trust] owns restore correctness; [database adapters][adapters] owns shipped source behavior. This is maintenance research, not a new identity platform.
- **Evidence:** `ProjectQueryPanel` reports unresolved selected keys and retains chart selection until cleared. `refreshSource` replaces one source snapshot; neither establishes the full saved-selection lifecycle. [Query panel][panel]; [refresh implementation][refresh].
- **Novelty:** Tests identity across refresh and reopening, beyond correctness of one fixed preparation result.
- **Product value:** Prevents a previously selected record silently referring to another observation.
- **Uncertainty/dependency:** Inspect the missing identity helper, snapshot loading, and restore consumers before judging current behavior.
- **Activation condition:** A real task needs selection persistence across refresh, or a current check shows selection drift.
- **Next action:** Observe one keyed source through reorder, deletion, and duplicate-key refresh cases, then reopen. Compare intended identities with displayed records. Choose a policy only after the observed behavior and task requirement differ.
- **Destination:** `docs/intent/current-analysis-trust/`, with source-contract findings in `docs/intent/database-adapters/`.

## Q3 — Does actual data justify joint missingness or expected-record diagnostics?

- **Question:** Does a real source reveal a recurring joint-missingness pattern, or supply an authoritative sampling plan/key catalogue that defines absent observations?
- **Prior intent/status:** [Missingness and expected records][missingness] is explicitly an uncommitted future seed despite `status: current`.
- **Novelty:** The companion proof supplies a synthetic expected set. This question establishes a real denominator, domain rules, and diagnostic need.
- **Product value:** Separates missing fields from absent records when that distinction changes an analyst's conclusion.
- **Uncertainty:** No real sampling plan, recurring pattern, tolerance, cancellation rule, or exception policy is established.
- **Dependency:** A named source and an owner-provided definition of what should exist.
- **Activation condition:** Field summaries repeatedly hide a relevant pattern, or an actual expected set becomes available.
- **Next action:** Enumerate the smallest real case with exact IDs and separate null, invalid, zero, and absent outcomes. Test joint missingness and expected-record reconciliation separately. Keep the seed deferred if the evidence is absent.
- **Destination:** `docs/intent/missingness-and-expected-records/`.

## Q4 — Which actual downstream result remains impossible to reuse?

- **Question:** Which repeatedly exported analytical result cannot feed its next view through current grouped queries and views?
- **Prior intent/status:** [Reusable analysis outputs][reuse] is explicitly unprioritized: Byron has not identified a task. Its older description must not erase current aggregate query outputs documented in [project folders][folders].
- **Novelty:** Seeks residual demand beyond the grouped-result case already resolved in this mission, potentially involving a modeled or other derived result.
- **Product value:** Could remove a demonstrated export/import cycle while preserving grain and contributor meaning.
- **Uncertainty:** No such repeated task is established; hypothetical model or density examples do not supply demand.
- **Dependency:** One real exported result, its downstream question, and its expected refresh/filter behavior.
- **Activation condition:** The author identifies a repeated cycle that existing query/view reuse cannot express.
- **Next action:** Reproduce that one workflow using existing facilities first. Record the exact remaining boundary before considering any named-result facility. Do not begin a catalogue or dependency graph from this queue.
- **Destination:** `docs/intent/reusable-analysis-outputs/`.

## Q5 — Where does an actual complete-snapshot workload exceed its target?

- **Question:** Does one named workload miss an agreed response or memory target, and which part of its complete path causes the miss?
- **Prior intent/status:** [Columnar transport][transport] remains shape/draft. [Database query contract][query-contract] is stale and reframed to later server execution for sources too large to snapshot. Their illustrative row ranges are not measured capacity limits.
- **Novelty:** Supplies empirical bottleneck evidence; it does not repeat this mission's comparison of preparation architectures.
- **Product value:** Directs effort toward a measured constraint and can reject unnecessary transport or execution infrastructure.
- **Uncertainty/dependency:** No workload, device, row width, budget, or performance result is established. Obtain these before selecting a mechanism.
- **Activation condition:** A named author task exceeds its agreed limit on the existing complete-snapshot path.
- **Next action:** Measure encoding, transfer, decoding, row construction, provider setup, filtering, inspection, and replacement using the same data. Attribute the bottleneck before comparing alternatives. Keep encoding selection separate from execution semantics.
- **Destination:** `docs/intent/columnar-data-transport/`; execution-specific evidence stays in `docs/intent/database-query-contract/`.

## Q6 — Which warehouse access gap blocks a real author task?

- **Question:** Which unsupported warehouse is needed for a specific task, with an available test account and explicit authentication and query-cost decisions?
- **Prior intent/status:** [Warehouse sources][warehouses] remains draft/deferred. Database-source shipment removes a sequencing prerequisite; it does not provide demand or account access.
- **Novelty:** Investigates one provider-specific access and verification problem, not another preparation platform.
- **Product value:** Could connect otherwise inaccessible data through the existing source boundary.
- **Uncertainty/dependency:** No warehouse, account, credential lifecycle, or acceptable query cost is selected.
- **Activation condition:** An actual blocked task and suitable test access are both supplied.
- **Next action:** Select exactly one provider and assess its existing-contract fit: complete-or-refuse reads, values/types, explicit refresh, and secret handling. Use `runSourceContract` as inspected test-definition evidence, not an executed pass. [Source contract][contract].
- **Destination:** `docs/intent/warehouse-sources/`.

## Coverage limits and stop rule

The packet omits these imported helpers: `packages/explorEDA/src/components/project/QueryRelationshipBuilder.tsx`, `queryEditing.ts`, `parameterBindings.ts`, and `sourceRowIdentity.ts` in that same directory. Their absence limits claims about detailed visual authoring, copy/stage helpers, binding discovery, and refreshed identity. It does not establish that a capability is absent everywhere. `ProjectQueryPanel` and `QueryStageRows.relatedRecords` provide the inspected call sites. [Query panel][panel]; [stage inspection][stage].

No broadening to progressive chart work, monetization, a new daily dataset corpus, universal preparation, or an optimizer follows from this queue. Advance one activated question under its existing owner; otherwise preserve deferral.

[comparison]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/comparison-opportunities/intent-brief.md
[trust]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/current-analysis-trust/intent-brief.md
[adapters]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/database-adapters/intent-brief.md
[missingness]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/missingness-and-expected-records/intent-brief.md
[reuse]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/reusable-analysis-outputs/intent-brief.md
[transport]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/columnar-data-transport/intent-brief.md
[query-contract]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/database-query-contract/intent-brief.md
[warehouses]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/docs/intent/warehouse-sources/intent-brief.md
[panel]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx
[refresh]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/server/sources/refresh.ts
[folders]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/apps/demo/src/docs/pages/project-folders.mdx
[contract]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/server/sources/contract.ts
[stage]: https://github.com/byronwall/explorEDA/blob/b07f3cf3483130f6cc3391bba47a87f616c93321/packages/explorEDA/src/components/project/QueryStageRows.tsx
