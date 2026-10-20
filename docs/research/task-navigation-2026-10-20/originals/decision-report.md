# explorEDA: the smallest useful overview-to-detail boundary

Research decision · 2026-10-20 · baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Executive decision

**GO for evidence access. NO-GO for feature adoption now.** Retain saved tabs, duplication, query inputs, tracing, and the current source/stage/query opening controls. Make a short current-controls lesson the first navigation comparison, after the already-prioritized local selection/export/undo/reopen trust proof. The selected source contains mechanisms for a small host example, but no observed repeated task that rejects acceptable existing controls. The navigation intent explicitly leaves population inheritance and destination reuse to human review. [R06], `The intended experience` and `Next step after confirmation`; [R07], `human_questions`; [R09], `Next step after confirmation`.

The only contingent candidate worth taking to proof is **one host-authored action that opens one named saved destination over the same source, with one explicitly mapped string entity value and, only if approved, a pair of canonical date endpoints**. Prefer existing host composition and view/binding types. This is a research candidate, not a GO proposal, selected product policy, new public API, or implementation approval. An end-user connection editor has a separate, unmet authoring-demand gate.

The decisive question is not whether an overview can open a tab. It already can. The question is whether a repeated investigation needs a reliable shortcut to a particular destination population, and whether that shortcut is clearer and cheaper than choosing the destination and editing its inputs. The six dispositions are TN01–TN06 in `recommendations.md`; this report includes their underlying decision, contracts, evidence, and rejection gates without requiring that companion file.

### Mission and boundaries

Compare deferral, current controls with a short lesson, a host-authored binding, and one user-authored saved connection. Establish population meaning before interface shape. Distinguish the React/TypeScript API consumer who owns application state from the workspace user who investigates and edits analyses. Preserve the pnpm monorepo, the existing host's history ownership, and one-source scope. No application implementation, commits, PR, deployment, account storage, routing framework, URL sharing, remote query pushdown, cross-source expansion, or side-by-side comparison is part of this research.

**Evidence labels:** **Fact** means inspected source or official documentation; **Inference** is a reasoned interpretation; **Proposal** is a falsifiable option; **Human choice** remains unresolved. A source assertion is not a runtime observation. Scores below are local judgments, not measured product value or demand.

## 1. Access, identity, and coverage

The repository is [byronwall/explorEDA](https://github.com/byronwall/explorEDA). The exact [baseline commit](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510) was fetched through the connected GitHub reader. It is the merge of PR450, titled “Progressive built-ins 4/4: Heatmap histories, date bins, and fixed color ends”; its returned creation timestamp is `2026-10-19T02:56:32Z`. The review used the supplied pin, without substituting moving-main or indexed source. The prompt's assertion that origin/main was checked on October 20 is supplied context; no new claim about the current main branch is necessary.

| Verification | Actual result |
| --- | --- |
| Source packet | 319,470 bytes; SHA-256 `680bb720fc819cd7133efb0dde5a1dfda31e6f35d366336a0e17592b7d18d420`. |
| Embedded inventory | All 33 entries match their declared byte counts and SHA-256 hashes; each declared-length extraction reaches its end marker. |
| Independent baseline verification | All 30 baseline files were fetched at the exact commit. Git blob IDs computed from the packet bytes match all 30 GitHub-returned blob IDs. No mismatch. |
| Local additions | The last three entries are the task prompt, ranked queue, and prior-research summary. Their packet integrity was checked; they were not attributed to the baseline commit. |
| Attached prompt | 11,209 bytes; SHA-256 `1a7037dd4325be1bbea9bc184231d1e0d27dd12b4b0ee3084d156772883c853d`. It is byte-identical to the local prompt embedded in the packet. |
| Previous queue | Read separately at historical commit `6a449565c9e19ddc78d9bd93c3eb688f271d4f9d`, after resolving the supplied grouped-rates branch. This is historical context, not baseline code. [H4] |

All 33 packet file texts were read across the source reviews. The exact inventory appears in §10. The separately attached prompt and the prior queue were also read. The original checkout `/Users/byronwall/Projects/explorEDA` was not accessed. No branch named `codex/task-navigation-research-2026-10-20` was created; that remains the requested integration target for Codex.

**Limits:** this is a selected snapshot, not a runnable checkout. Imported chart handlers, `FilterTypes`, `ChartTypes`, `DataLayerProvider`, `settingsCompatibility`, `valueParsing`, source identity helpers, and project-file serialization helpers are not fully covered. The included integration test imports a demo fixture outside the packet. These omissions do not prevent a capability comparison or a defer decision. They do prevent claims that arbitrary chart-mark context extraction, every chart-local restriction, or all persistence paths have been proved. For a later mark-driven proposal, request only the chosen mark's selection/trace handler, emitted filter types, identity resolver, and relevant compatibility/serialization excerpts—not a new repository-wide survey.

## 2. What already works in the selected source

### Existing capability inventory

| Capability | Exact evidence | Decision implication |
| --- | --- | --- |
| Saved query identity and context | [R10], `AnalysisView` L136–144: `queryId`, `bindings`, `settings`, `inspection`, `selectedRowKeys`. `AnalysisParameter` L118–125 is typed; `FilterStep` L74–82 accepts `parameterId`. | A second destination-input model is not justified. These types do not declare a saved connection or return edge. |
| Query input editing | [R15], `draft`/`update` L42–50; [R16], binding application L181–192. | Every valid edit emits the entire next binding map immediately. There is no form-level Apply button. Settings and inspection are retained when bindings change. |
| Invalid input explanation | [R14], `bindingProblem` L26–69; [R15] L140–143. | Required values, scalar types, and a paired reversed bound are checked; invalid drafts leave the last valid applied result visible. This does not validate arbitrary context compatibility. |
| Copy query | [R16], `openCopy` L105–113; [R19], `copyQuery` L147–166. | Copies the current view and creates a query with fresh IDs. It is an existing option when independent query editing is needed, not a saved-destination connection. |
| Open intermediate stage | [R16], `openStage` L115–128; [R19], `queryForStage` L121–145. | Opens a query ending at that stage and carries bindings. It does not copy chart settings or restrict the destination to the inspected selection. |
| Open source | [R18] L228–239; [R17], `RelatedRecords` L321–331; [R19], `sourceView` L168–187. | Opens the whole source, even when a nearby related-record table displays only a subset. This action already exists; exact subset inspection is a different job. |
| Trace query flow | [R13], `AnalysisChartContextValue`; [R12], `chartContext` L348–367. | Traced result keys focus Query inspection. This is distinct from linked selection and from opening a saved destination. |
| Host extension boundary | [R12], `ExplorEdaProjectProps` L43–83. | `onOpenView` sends an already prepared view from library to host. `toolbarEnd` accepts host content. Neither proves a generic mark-to-parameter event or connection-authoring API. |
| New view and duplication | [R23], `createView` L597–631, `blankSettings` L168–188. | Duplication preserves the complete saved view; it already provides an explicit way to retain an investigation before changing inputs. New view has deliberate blank-settings behavior and still inherits query/bindings. |
| Open, checkpoint, activate | [R23], `openProjectView` L890–913. | Always adds a uniquely named new tab, checkpoints it, activates, and remounts. Current mechanics do not decide whether future navigation should reuse or instantiate. |
| Saved filters and local restrictions | [R11], `SavedDataStructure` L24–55; [R08], `Boundaries`; [R20], `mapIdFilters`. | Selections and intentional restrictions belong to the saved analysis. Reuse is not permission to clear them. The packet does not establish a generic filter-copy algorithm. |
| Persistence and history | [R23], `capture`, `captureProject`, `projectFile`, `moveHistory`; [R24], `HistoryEntry`, `projectSession`; [R25], `pushCheckpoint`. | Reuse existing ownership. Local history, current active tab, source tables, and exported project state have different contracts. |

### Findings that narrow the tempting shortcut

- **Fact: validation is deliberately narrow.** `bindingProblem` tracks one lower and one upper parameter reference per field, compares like-typed values, and does not inspect literal query restrictions or chart `localFilters`. `AnalysisParameter` has no default-value property. A destination's existing `view.bindings` is saved state, not a schema default. [R14], `bindingProblem`; [R10], `AnalysisParameter`.
- **Fact: omission is not unrestricted detail.** A referenced, undefined parameter produces zero rows and a `missing-parameter` diagnostic in `filterFrame`, even if the input definition is optional. Equality uses strict scalar identity; date ordering in these filters uses compatible string/number comparisons. The proposed fixture therefore uses canonical date-only strings. [R21], `filterFrame` L473–531, `evaluateAnalysisQuery` L755–799.
- **Fact: draft and result can differ.** Invalid drafts are component-local and can disappear when the host remounts. During worker evaluation, the previous successful result and its `appliedBindings` can remain visible for the same query. A shortcut must use the applied context it can substantiate, or refuse while it is unsettled. [R15], `draft`; [R22] L108–189; [R12], `ProjectScope` L438–488.
- **Fact: identities are not interchangeable.** `__ID` is a runtime index. An evaluation key identifies a query result row. `sourceRows` identifies provenance. A business grouping value such as `storeKey` identifies the intended detail entity. Aggregate rows may have many contributors. Missing/duplicate source keys can fall back to positional keys; those cannot support durable navigation identity. [R10], `AnalysisResultRow`; [R12] L144–159; [R21], `sourceReferences` L90–156; [R20], encode/decode functions.
- **Fact: new tabs are not complete isolation.** In project mode, calculations, color scales, field settings, aggregates, and geometry assets propagate between tabs sharing a query ID. Chart-specific filters remain per-tab. Duplicating or opening another view with the same `queryId` also shares its query definition, so editing that query affects its other views. Use the existing **Copy query to a new view** action when independent query editing is intended. [R23], `capture` L768–809, `withSharedSettings`, `createView`, and `captureProject`; [R25], `SHARED_KEYS` L16–22; [R16], `openCopy`; [R19], `copyQuery`/`replaceQuery`.

The customer-instance fixture already supplies a three-input query over orders: customer, lower date, upper date. Its test expects O1 and O2 for C1 in the supplied January range, totaling 50 by inspection. The current shop example has Order book, Sales mix, Calendar, and Contribution and delivery tabs. Neither is evidence that someone repeatedly needs a configured connection. [R26], `createShopFixture`, `customer-instance` L355–387; [R28] L235–262; [R30], `shopText`.

## 3. The task that could justify a connection

**Hypothetical business task:** an analyst repeatedly identifies a store in a period overview, opens a fixed completed-order investigation for that store, checks the rows and a Store-channel chart, and returns to the overview without losing its committed work. The analyst must know whether the detail means the overview period, the destination's saved period, or the exact selected records. This is a proposed task to observe, not a reported user interview.

**Hypothetical engineering task:** an engineer identifies a test run in an overview and opens its steady-phase energy increments within either the selected interval or a saved diagnostic interval. A sensor-local restriction may intentionally differ between overview and destination. This checks that the boundary is about population meaning rather than a retail-specific shortcut.

An explicit connection earns its cost only if repeated real work shows material transcription errors, lost context, or setup effort after a short lesson, while the desired population and destination stay stable enough for a small mapping. Record the actual outcome, frequency, recovery work, and an agreed acceptable effort/error target. Do not retroactively invent a numerical success threshold or treat a synthetic fixture as demand.

### Scored alternatives

Scale: **0 = poor fit, 4 = strong fit**. Higher maintenance scores mean lower proportional cost. These are provisional judgments for the hypothetical repeated task; they are not observations, benchmark results, or a summed product score. Potential clarity for a new feature assumes its contract is proved.

| Task dimension | Defer; keep current controls | Current controls + short lesson |
| --- | --- | --- |
| Population explainability | 2 | 3 |
| Lower repeated input effort | 1 | 2 |
| Proportionate cost for one developer | 4 | 4 |
| Evidence justifies proceeding now | 4 | 4 |

| Task dimension | One host-authored binding | One user-authored saved connection |
| --- | --- | --- |
| Population explainability, if proved | 4 | 3 |
| Lower repeated input effort, if needed | 4 | 4 |
| Proportionate cost for one developer | 2 | 0 |
| Evidence justifies feature adoption now | 0 | 0 |

| Alternative | Who benefits; cost | Evidence that rejects it |
| --- | --- | --- |
| Defer | Both audiences retain the working surface; no new maintenance. Repeated manual work remains. | A named recurring task still fails after an adequate lesson and an agreed acceptable current-control route. |
| Controls + lesson | Workspace users learn duplicate, Query Inputs, trace, source/stage opening, and return by tab. API consumers get a small wiring explanation. Documentation must not promise automatic transfer. | Correctly trained users repeatedly choose the wrong population or face unacceptable transcription, and teaching does not remedy it. |
| Host binding | An API consumer who already knows entity/range values can supply one explicit action. It needs validation, visible population, lifecycle proof, docs, and an example. | The manual flow is acceptable; the host lacks a safe semantic payload; meanings vary per opening; or maintenance exceeds the demonstrated benefit. |
| User saved connection | A workspace author could choose destination/mapping without a developer. It adds authoring, persistence, editing, deletion, compatibility, and explanation work. | Users do not repeatedly author/change connections, or a fixed host example/current inputs meet the task. The later intent alone does not clear this gate. |

**Inference:** the lesson is the cheapest discriminating next experiment. Its value is not that more documentation is automatically beneficial; it makes existing controls a fair comparator before a feature can claim to solve their failures.

## 4. Population contract before navigation

### Four separate objects

1. **Query restrictions** determine the rows reaching a destination query, including fixed literal predicates and parameterized predicates.
2. **Bindings** supply typed scalar values to declared parameter IDs. They do not carry arbitrary filters or record sets.
3. **Saved view filters and chart-local restrictions** further shape linked selection, a particular chart, or Rows. Different scopes can legitimately show different memberships.
4. **Identity/provenance** connects result rows to source records. It is evidence for a mapping, not automatically the mapping itself.

This separation follows the selected types, evaluation, row-key adapter, and saved-analysis intent. It is not a claim that every imported filter implementation was inspected. [R10], `FilterStep`, `AnalysisView`, `AnalysisResultRow`; [R11]; [R20]; [R21]; [R08].

### Destination-only, explicit mapping, and inheritance

For this comparison, every navigation option transfers the selected entity. “Destination-only” means **destination-owned conditions beyond that entity**, not ignoring the selection. Opening an unchanged saved tab is also available, but its existing entity must then be checked manually.

| Mode | Exact meaning | September/store consequence |
| --- | --- | --- |
| D: entity only; destination conditions | Bind store; retain destination's saved date values, fixed restrictions, and saved view restrictions. | May show October or a broader profile. Valid if labelled as such; it does not answer September merely because the overview showed September. |
| M: explicit mapped context | Bind store and explicitly approved date slots; retain every unmapped destination condition. | Can answer completed orders for the store in September, while retaining a Store-only chart restriction. It recomputes the destination; it is not necessarily the clicked rows. |
| H: inherited source filters | Translate specified source conditions into target predicates with defined scope and precedence. | Blind conjunction can intersect September with October, or Web with Store. Replacing target filters instead would erase meaning unless deliberately chosen. No general inheritance policy is supported. |

**Human choice H01:** D, M, or a per-opening question remains open. A compatible inherited subset also remains reviewable outside the first candidate; no inheritance preference is being settled. **Human choice H02:** whether a range transfers, which field/basis it means, and inclusive/exclusive endpoints remains open. M is the preferred *proof option* for clarity when the repeated task requires the same period; it is not a selected product default. Unqualified H is rejected for the first candidate because arbitrary scope translation has no bounded meaning argument.

### Proposed state and precedence table

These are the candidate's explicit guardrails, not claims that navigation validation exists today. “Keep” never means silently clear a conflict. The first proof uses a known one-source destination query; unsupported definitions are refused instead of introducing a general predicate solver.

| State or condition | Proposed precedence/handling | What the user sees |
| --- | --- | --- |
| Source and destination identity | Same declared source and known destination/query; verify fields/types before mutation. | Destination name and row unit; specific refusal if incompatible. |
| Entity value | Exactly one nonmissing typed semantic value. Multiple source rows may support it; distinct entities do not collapse. | Entity value with an unambiguous label; “Select one store/run” for mixed entities. |
| Runtime/result/source row IDs | Never substitute a row index, label, or first contributor for the mapped entity. Duplicate grouping values are normal; duplicate required record identities are not. | Identity problem names the field; no unexpected first-row navigation. |
| Source period/range | Transfer only a declared field, unit/basis, endpoint convention, and complete validated endpoints. | “2025-09-01 ≤ date < 2025-10-01,” or the equivalent clear date wording. |
| Mapped destination binding slots | Approved incoming values replace those same saved slots together after validation. D leaves unmapped date slots intact. | Effective entity/dates and whether the period came from the overview or destination. |
| Unmapped destination bindings | Retain them. A missing required or referenced input is not interpreted as all values. | Specific missing-input explanation; no destination opened with an accidental unrestricted population. |
| Fixed destination query restrictions | Remain conjunctive. A literal October restriction is not the same as an October value in a replaceable date slot. | Retained “Completed only”; contradictory literal dates named before a refused automatic transfer. |
| Destination chart `localFilters` | Retain chart scope. Do not promote a local filter to a whole-query restriction or clear it. | Chart identifies Store-only or sensor-B scope; its total may differ from query rows. |
| Destination linked filters, Rows search/filters, selections | Preserve saved state. Prove identity resolution and meaning under the new bindings; otherwise refuse automatic rebinding and offer the existing manual route. | Retained selections remain visible; unresolved state is not silently discarded. |
| Source linked filters and clicked-chart local restrictions | No implicit copy. Their existence informs the population explanation, not a generic inheritance payload. | Explicit statement of which context was mapped and which destination conditions apply. |
| Invalid drafts, pending work, or stale context | Use a demonstrably applied context, or wait/refuse. The conservative proof refuses while context cannot be tied to the displayed result. | Current applied context remains displayed; no new context label attached to old numbers. |
| Valid but empty population | Distinguish no matching rows from invalid/missing context. Never delete a condition merely to produce rows. | A clear empty population, or a review step if H04 chooses it. An empty sum is not automatically numeric zero. |
| Known contradictory/unsupported transfer | Conservative proof refuses before tab/history mutation. A different empty-result policy requires review. | Reason and retained source/destination; no partially opened or partially rebound tab. |

**Human choice H04:** when saved selections or a known empty intersection should remain, prompt for a deliberate change, or block automatic opening. The conservative refusal option limits the experiment; it does not settle every valid-empty UX.

### Small arithmetic discriminator

The complete 12-row business fixture is in `proof-plan.md`. It has unique order IDs, typed store keys, dates, channel, status, and amount. For string store `"7"`, the source's September/Web mark represents O01, O03, O10, O11: four rows, three numeric contributors, 80 USD. O03 is returned; O10 is missing an amount. The destination fixes `status = completed` and has a Store-only chart.

| Population choice | Query membership and total | Destination Store-only chart |
| --- | --- | --- |
| D; saved October dates | O04, O05; 280 USD | O05; 80 USD |
| M; explicitly mapped September dates | O01, O02, O10, O11; 150 USD | O02; 50 USD |
| Blind conjunction of September and saved October | No rows; no numeric sum | No rows; no numeric sum |
| M plus promoted source Web restriction | O01, O10, O11; 100 USD | No rows; no numeric sum |

These differences are intentional arithmetic, not app observations. Entity recomputation includes completed Store order O02 and removes returned Web order O03. It therefore cannot be described as “the rows behind the clicked mark.” Numeric store `7` is a different population, O07 with 900 USD; the proposed string parameter refuses it rather than coercing it. The engineering comparator similarly distinguishes 18 J in the saved interval from 10 J in the explicitly mapped interval, with a sensor-B chart of 10 J versus 6 J.

## 5. Destination instances, edits, and return

**Human choice H03 remains open:** reuse, new instance, or a small per-opening choice. Easy duplication is already available and was favored in the intent; this does not select a reuse default. [R06]; [R07], `product-feedback-13`; [R23], `createView`.

| Option | Benefit and existing support | Cost / required boundary |
| --- | --- | --- |
| Reuse a detail tab | Avoids accumulation and supports repeated checking. Existing view state can receive bindings through the host. | Must identify the exact target and define preservation of edits/selections. No generic dirty-relative-to-template flag exists. Refuse silent replacement. |
| New instance | Matches `openProjectView`; preserves existing source and destination committed state at opening. | More tabs; copied restrictions may be inappropriate for the new entity. Same-query shared definitions mean incomplete isolation. This is a proof convenience, not a selected default. |
| Duplicate then edit inputs | Available now; explicit user control over retaining a complete analysis. | Manual context transcription and checking. This is the primary current-controls comparator. |
| Ask reuse or copy | Can handle situational intent. | Adds interaction and policy states. Only introduce it if an observed task needs both; do not begin with a routing wizard. |

### Lifecycle and return contract

| Situation | Current fact | Bounded proposal / remaining choice |
| --- | --- | --- |
| Edited destination | Edits are live and checkpointed; browser save status is not a dirty-template comparison. [R23], `capture`, `captureProject`, `saveState` L1069–1076. | Identify a concrete saved reference before comparing divergence. Preserve edits; manual duplicate remains the fallback. No automatic reuse rule is selected. |
| Two overview openings A then B | Current `openProjectView` creates two IDs/tabs/checkpoints. [R23] L890–913. | Test A and B before and after editing A. Reuse needs an explicit replacement decision; fresh instances need clear context labels and checks of shared definitions. |
| Return to overview | `changeActive` changes the active tab and remounts without a checkpoint. [R23] L582–595. | Select the still-open overview tab. A host return affordance may point to it if useful; no generic route stack. If deleted, explain that it is unavailable rather than silently recreating it. |
| Invalid source draft at departure | Draft is local; tab changes remount. [R15] L42–50; [R23], `remount`, rendering L1310–1358. | Promise preservation of committed analysis, not every transient draft. The conservative trial requires resolving the draft before departing; any stronger draft-preservation behavior is separate work. |
| Undo and redo | Checkpoints store tabs/project, not activeTabId. `moveHistory` retains the current tab if present, otherwise chooses the first. [R24], `HistoryEntry`; [R23] L928–959. | Opening or binding change uses existing checkpoint ownership; refusal adds none. Return is not Undo. Verify redo activation separately; do not promise automatic source return or rewrite history. |
| Reload | Local session serialization retains current tabs, active ID, history/path/cursor; data is stored separately. [R23] L527–574; [R24], `readSavedViewsSessionResult`. | Verify committed bindings/settings/keys; do not promise local drafts or an unimplemented navigation-origin pointer. |
| Export and reopen | Full project export carries project, tables, views, activeViewId, without history. `projectSession` starts one checkpoint on import. [R23], `projectFile` L223–236; [R24] L192–237. | Assert effective populations after import; do not expect old undo timeline or return provenance. Selected-row export is a different local trust check. |
| Source refresh/reorder | Evaluation observes new table arrays; checkpoints do not snapshot table rows. [R21], `tableRevision`; [R22]; [R24], `SavedViewsSession`/`HistoryEntry`. | Revalidate field/type/identity and entity existence against current data. Refuse incompatible transfer; do not add source-version coexistence or positional identity. Reopening is a recomputation, not a frozen historical population guarantee. |

**Minimal refusal rule:** if one declared, typed entity and the approved context cannot be transferred to the known destination without guessing scope, coercing identity, discarding saved restrictions, or silently replacing edited state, do not mutate either view and do not add a checkpoint. State the specific reason and retain the manual route. A legitimate empty result alone is not evidence that the mapping is invalid.

## 6. Current primary-source comparisons

The products were selected for different semantics, not popularity. All pages below were accessed on **2026-10-20**. This was documentation research; no competitor application session, interaction, screenshot, or runtime conflict test was performed.

### Tableau: field filters, scalar parameters, and navigation

Filter actions pass selected field values as target-sheet filters; authors can map selected fields and constrain activation to a single selection. Compatible target-field choices follow source datatype. Clearing behavior is configurable. This is not documentation of copying every source worksheet restriction. [T1]

Parameter actions assign a target parameter from a source field, optionally aggregating multiple marks. With no aggregation, different selected values do not run the action. Clearing may retain or reset the value. An entity key therefore should not gain an invented aggregation simply to accept multiple entities. [T2]

Navigation is separately authored through Go to Sheet; controlling views can ignore action filters. The inspected pages do not promise an automatic return stack or restoration of edited state. [T3] Target population still depends on calculation/filter ordering; worksheet context filters have their own scope. [T4] **Inference:** borrow the separation of transfer, computation, and movement; do not borrow an action framework.

### Power BI: declared drillthrough context and explicit return

Destination drillthrough fields determine transferred context; the source visual must contain the relevant field. A Back button is added automatically. The documentation distinguishes drillthrough from hierarchy drill mode and warns about aggregated/mismatched source fields. [P1] A separate page documents transient drillthrough filters based on source page-level filters. It does not fully specify arbitrary conflicts or an inheritance default. [P2]

The destination remains a report page with its own filters/slicers. Official guidance distinguishes monthly transaction detail from a broader entity profile—both legitimate meanings of detail. [P3] **Inference:** a visible return action is useful, but “detail” alone cannot choose September inheritance. The inspected current pages do not verify the `Keep all filters` toggle/default; no remembered behavior is asserted.

### Metabase: explicit destination input mapping

Custom click behavior can pass a clicked-column value or a current dashboard-filter value to a destination filter. Internal destinations open in the same tab/window; external URLs open another. Changing a current-dashboard filter is a separate behavior. The inspected page does not establish multi-mark transfer, automatic return/restoration, or general destination-conflict precedence. [M1]

Destination widget wiring determines which fields/cards respond, and filter scope can be dashboard, header, or card. Required filters need a configured default; incompatible field connections can be removed when the widget type changes. [M2] **Inference:** an explicit mapping can be small, but a saved user-authoring interface adds a separate maintenance surface. Neither source establishes demand for that interface in explorEDA.

### Primary-source register

| ID and official document | Displayed date/version at retrieval |
| --- | --- |
| [T1: Tableau — Filter Actions][T1] | `/current/`; no update date displayed. |
| [T2: Tableau — Parameter Actions][T2] | `/current/`; no update date displayed. |
| [T3: Tableau — Actions and Dashboards][T3] | `/current/`; no update date displayed. |
| [T4: Tableau — Order of Operations][T4] | `/current/`; no update date displayed. |
| [P1: Microsoft — Drillthrough in Power BI reports][P1] | Last updated 2026-03-02. |
| [P2: Microsoft — Types of filters in Power BI reports][P2] | Last updated 2025-11-01. |
| [P3: Microsoft — Use report page drillthrough][P3] | Last updated 2024-12-30. |
| [M1: Metabase — Dashboard interactivity][M1] | `/latest/` page displayed v0.64; no update date. This label is not a claim about an installed product version. |
| [M2: Metabase — Dashboard filters][M2] | Same retrieval label/date limits as M1. |

These official pages support semantic comparisons. They do not prove performance, keyboard behavior, destination overwrite rules, or round-trip persistence for explorEDA.

## 7. One candidate; explicit cut line

**Proposal TN03, conditional on the unmet task gate:** a host that already owns the semantic entity and approved range uses its own toolbar action and opening function to prepare an `AnalysisView` for one known destination. It passes only declared bindings and preserves the destination's full saved state subject to the compatibility/refusal contract. Use short direct checks and one mutation after validation. `onOpenView` is the existing callback direction, not a function the host magically calls on the component. `bindingProblem` is internal source; this packet does not establish that consumers can import it publicly. [R12], `ExplorEdaProjectProps`; [R14].

A host-owned picker is sufficient for testing the contract but might provide no material benefit over Query Inputs. That is a rejection condition, not an excuse to add a generic action API. If the real task requires a chart mark, first demonstrate extraction of exactly one typed entity from that chosen mark's relevant contributors and applied context. Do not read `sourceRows[0]`, use a display label as identity, or imply that `selectedRowKeys` alone contains business parameters.

The initial candidate excludes persisted connection schemas, generic filter translation, automatic row-subset transport, multi-entity parameters, arbitrary ranges, return-stack persistence, template clearing rules, and source-version coexistence. Broader user authoring remains later intent under TN06 and H05. This preserves the aspiration that both users and developers can create connections without treating that aspiration as a requirement to build both now. [R06]; [R07], `feedback-14`.

Any future visible milestone must include proposed `apps/demo/src/docs/pages/task-navigation.mdx` sections **“Choose the detail population”** and **“Return without undoing”**, plus proposed `apps/demo/src/demos/analyses/taskNavigation.ts` using the small business fixture. These are proposed destinations, not inspected existing files. Registration through the existing docs catalogue/live-example mechanism must be checked in the real checkout. [R01], docs/example requirement; [R02], docs-site map. No feature milestone should defer its explanation or example to a later PR.

## 8. GO/NO-GO gates, confidence, and human decisions

| Gate | Status and reason |
| --- | --- |
| Repository identity, exact baseline, mandatory intent/types/inputs/host/open actions accessible | **GO.** All required selected files were inspected; 30 baseline blobs independently match the pin. |
| Exact repeated task rejects acceptable current controls | **NO-GO.** No observed author/user task or fair lesson comparison is supplied. |
| Population meaning selected | **NO-GO.** D versus M versus asking remains H01; range meaning remains H02. Tables make the choices reviewable without selecting them. |
| Invalid, multiple, conflicting, edited-state behavior bounded | **Ready as proposed guardrails; unproved.** The refusal table defines a small candidate, but existing validation does not establish it. H03/H04 remain open. |
| Small falsifiable proof distinguishes alternatives | **GO for proof design.** Two explicit fixtures separate memberships, contributors, and totals. Arithmetic was audited independently; application integration remains unrun. |
| New public API or saved-connection authoring justified | **NO-GO.** Host composition has not been rejected; H05 has no repeated authoring evidence. |

**Confidence:** high in the scoped source facts, packet/commit authentication, and documented competitor semantics; high that the current record does not clear the specified adoption gates; moderate that the lesson is the cheapest useful next step; low in unmeasured user benefit, arbitrary mark extraction, or future lifecycle safety. A defer decision is reversible if the missing task evidence arrives.

| Human choice | Options that remain explicit |
| --- | --- |
| H01 — Destination population | Entity with destination conditions; explicit source context mapping; a compatible inherited subset if later justified; or ask per opening. Implicit, unqualified inheritance is outside the minimal candidate. |
| H02 — Range meaning | No period transfer; named field and canonical interval; another explicitly reviewed basis. Endpoint/type/unit compatibility must be specified. |
| H03 — Instance policy | Reuse a particular tab; new instance; explicit reuse/copy choice. Easy duplication already exists. |
| H04 — Retained selections and conflict presentation | Preserve and explain valid restrictions/empty results; deliberate user change; refuse incompatible automatic rebinding. No silent clearing. |
| H05 — Authoring audience and trigger | A fixed host example first; user-authored saved connection only after an actual task rejects that route. |

No response to these choices is required to integrate this research. They remain proposed for review. A follow-up is warranted only if a required output or material evidence needed for integration is missing, not merely because product preferences remain undecided.

## 9. Checks actually performed and handoff

Performed: full packet extraction/integrity verification; exact-commit GitHub identity and 30-file blob verification; static source/test/intent/queue review; current official documentation research; manual fixture derivation; and a standalone Python arithmetic audit covering 24 populations with 104 passing assertions. The arithmetic script imported no explorEDA code. Empty/all-missing numeric populations were represented as no-contributor sums, not fabricated zeros.

Not performed: Vitest, `pnpm check`, application builds, browser use at 1280/783/390 px, selected-row export, input editing in the actual UI, source refresh, history/reload/export interactions, performance measurement, or observed user/author tasks. The supplied test source was inspected; its names are not treated as proof of behaviors it does not assert. In particular, [R29]'s “bindings” test primarily checks query IDs, tabs, project retention, and baseline order/item totals, not changed parameter transfer.

The package contains four standalone UTF-8 Markdown reports and `manifest.json`; the archive contains exactly those five files. The manifest records report byte counts and SHA-256 hashes; the archive hash is supplied separately in the delivery message. No application source or intent file was changed. Codex still owns independent collection, hash inspection, review, integration, and the review PR.

## 10. Exact file-read inventory

R01–R30 are complete selected files verified against the baseline commit. Line citations in this report refer to those texts. The three local additions and the historical prior queue are separately identified below.

| ID | File read (bytes) |
| --- | --- |
| R01 | [AGENTS.md][R01] (4,033) |
| R02 | [docs/agent-guide.md][R02] (19,779) |
| R03 | [CODING_STANDARDS.md][R03] (2,213) |
| R04 | [README.md][R04] (10,263) |
| R05 | [package.json][R05] (1,258) |
| R06 | [docs/intent/parameterized-task-navigation/intent-brief.md][R06] (2,554) |
| R07 | [docs/intent/parameterized-task-navigation/initiative-map.json][R07] (5,265) |
| R08 | [docs/intent/saved-view-templates/intent-brief.md][R08] (3,082) |
| R09 | [docs/intent/current-analysis-trust/intent-brief.md][R09] (3,006) |
| R10 | [packages/explorEDA/src/types/AnalysisProject.ts][R10] (4,839) |
| R11 | [packages/explorEDA/src/types/SavedDataStructure.ts][R11] (1,926) |
| R12 | [packages/explorEDA/src/components/ExplorEdaProject.tsx][R12] (15,265) |
| R13 | [packages/explorEDA/src/components/AnalysisChartContext.tsx][R13] (1,174) |
| R14 | [packages/explorEDA/src/components/project/parameterBindings.ts][R14] (2,474) |
| R15 | [packages/explorEDA/src/components/project/QueryParameters.tsx][R15] (4,626) |
| R16 | [packages/explorEDA/src/components/project/ProjectQueryPanel.tsx][R16] (9,324) |
| R17 | [packages/explorEDA/src/components/project/QueryStageRows.tsx][R17] (12,400) |
| R18 | [packages/explorEDA/src/components/project/ProjectSchemaPanel.tsx][R18] (24,142) |
| R19 | [packages/explorEDA/src/components/project/queryEditing.ts][R19] (7,070) |
| R20 | [packages/explorEDA/src/components/project/analysisRowKeys.ts][R20] (1,919) |
| R21 | [packages/explorEDA/src/lib/analysis/evaluateProject.ts][R21] (29,524) |
| R22 | [packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts][R22] (5,805) |
| R23 | [apps/demo/src/SavedViewsWorkspace.tsx][R23] (41,082) |
| R24 | [apps/demo/src/savedViewsSession.ts][R24] (6,957) |
| R25 | [apps/demo/src/savedViewsHistory.ts][R25] (34,392) |
| R26 | [packages/explorEDA/src/test/fixtures/shopProject.ts][R26] (14,422) |
| R27 | [packages/explorEDA/src/test/lib/analysis/parameterBindings.test.ts][R27] (1,698) |
| R28 | [packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts][R28] (12,780) |
| R29 | [apps/demo/src/SavedViewsWorkspace.integration.test.tsx][R29] (5,707) |
| R30 | [apps/demo/src/demos/analyses/shop.ts][R30] (7,141) |

### Historical context, read separately from baseline code

- H31: `docs/research/task-navigation-2026-10-20/pro-prompt.md` (11,209 bytes), marked local addition in the packet.
- H32: `docs/research/task-navigation-2026-10-20/research-queue.md` (3,096 bytes), marked local addition in the packet.
- H33: `docs/research/task-navigation-2026-10-20/prior-research-summary.md` (3,047 bytes), marked local addition in the packet.
- H4: [prior grouped-rates queue][H4], fetched at historical commit `6a449565c9e19ddc78d9bd93c3eb688f271d4f9d`. The underlying earlier research reports and their runtime claims were not re-executed.
- Separately attached `pro-prompt(20261020-064811).md`, byte-identical to H31.

[R01]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md
[R02]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md
[R03]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/CODING_STANDARDS.md
[R04]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/README.md
[R05]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/package.json
[R06]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/parameterized-task-navigation/intent-brief.md
[R07]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/parameterized-task-navigation/initiative-map.json
[R08]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/saved-view-templates/intent-brief.md
[R09]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[R10]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/AnalysisProject.ts
[R11]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/SavedDataStructure.ts
[R12]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/ExplorEdaProject.tsx
[R13]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/AnalysisChartContext.tsx
[R14]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/parameterBindings.ts
[R15]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/QueryParameters.tsx
[R16]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx
[R17]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/QueryStageRows.tsx
[R18]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/ProjectSchemaPanel.tsx
[R19]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/queryEditing.ts
[R20]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/analysisRowKeys.ts
[R21]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[R22]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
[R23]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.tsx
[R24]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsSession.ts
[R25]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.ts
[R26]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/fixtures/shopProject.ts
[R27]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/lib/analysis/parameterBindings.test.ts
[R28]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
[R29]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.integration.test.tsx
[R30]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/demos/analyses/shop.ts
[H4]: https://github.com/byronwall/explorEDA/blob/6a449565c9e19ddc78d9bd93c3eb688f271d4f9d/docs/research/grouped-rates-2026-10-19/research-queue.md
[T1]: https://help.tableau.com/current/pro/desktop/en-us/actions_filter.htm
[T2]: https://help.tableau.com/current/pro/desktop/en-us/actions_parameters.htm
[T3]: https://help.tableau.com/current/pro/desktop/en-us/actions_dashboards.htm
[T4]: https://help.tableau.com/current/pro/desktop/en-us/order_of_operations.htm
[P1]: https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough
[P2]: https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-report-filter-types
[P3]: https://learn.microsoft.com/en-us/power-bi/guidance/report-drillthrough
[M1]: https://www.metabase.com/docs/latest/dashboards/interactive
[M2]: https://www.metabase.com/docs/latest/dashboards/filters
