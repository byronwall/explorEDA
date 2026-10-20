# Recommendations: the smallest useful overview-to-detail boundary

Research date: **2026-10-20**. Repository: **byronwall/explorEDA**. Source commit: [`9b16d78e3ed0742ed4d5858c1939fec9e758b510`](https://github.com/byronwall/explorEDA/commit/9b16d78e3ed0742ed4d5858c1939fec9e758b510).

## Decision and evidence status

**GO for evidence access; NO-GO for feature adoption now.** The research can be integrated for review. It does not authorize a navigation implementation. Keep current saved views, duplication, query inputs, and source/stage openings as the immediate workflow. Improve the explanation, run the local trust proof, and observe a repeated task before adopting a connection. Preserve one contingent candidate: a host-authored action mapping explicit context into one existing saved destination over one source.

The supplied packet contains 33 entries. All declared byte lengths and SHA-256 hashes matched extracted bytes. The exact GitHub commit was accessible; all 30 baseline files were fetched at that ref and their Git blob hashes matched the packet bytes. The final three entries—research prompt, queue, and prior summary—are local context additions, not authenticated baseline source. No explorEDA tests, application browser interactions, performance measurements, observed author task, commits, or PR work were completed. Standalone fixture arithmetic is not application execution.

The navigation [intent brief, “The intended experience” and “Boundaries”][intent] makes September/store illustrative, keeps filter inheritance and instance reuse unresolved, and leaves history with its existing owner. The [initiative map][map] still has no shape or implementation plan. Suggestions marked **adopt** concern research priority, existing controls, or documentation; suggestions marked **investigate** are contingent proposals.

Six stable recommendations follow. Proposed destinations named below are **new proposed files**, not claims that those files already exist:

- `apps/demo/src/docs/pages/task-navigation.mdx`
- `apps/demo/src/demos/analyses/taskNavigation.ts`
- `apps/demo/src/docs/pages/analysis-trust.mdx`
- `apps/demo/src/demos/analyses/analysisTrust.ts`

Existing documentation registration paths mentioned by the [agent guide][guide] are integration guidance. Their contents were not supplied or independently reviewed.

## TN01 — Adopt current controls and a short lesson before a connection

**Suggestion: adopt the comparator; defer connection adoption.**

**Affected task and users.** A workspace user notices an entity or period in an overview, opens a detail analysis, changes its inputs, checks the resulting records, and returns. An API consumer may already provide those inputs and a destination in host code. Users may need discoverable controls; developers may need only a composition example.

**Repository evidence.** [`ProjectQueryPanel.openCopy`, `openStage`, and its `QueryParameters` integration][panel] already support copied queries, intermediate-stage views, and typed query inputs. [`queryEditing.sourceView`][editing] creates a source-only query/view; [`ProjectSchemaPanel`][schema] and [`QueryStageRows.RelatedRecords`][rows] expose source opening. Source opening reads the whole source; it does not preserve the nearby related-record subset. [`SavedViewsWorkspace.changeActive` and `createView(true)`][workspace] provide tab switching and complete-view duplication. The four views in [`shopText`][shop] are useful existing evidence, not evidence that a navigation feature is demanded.

**Benefit and cost.** A short lesson can make an existing workflow usable without another saved object, API, or authoring surface. It also creates a fair baseline for judging transcription errors and repeated effort. Its cost is documentation and an honest task observation; manual entry may still be tedious. No timing advantage was measured.

**Alternatives and rejection conditions.** Deferral alone is acceptable when the task is rare. Current controls plus explanation should remain the preferred comparator unless a real, repeated investigation still produces material context mistakes or unacceptable effort. Reject a new connection if the user can complete and explain the population comfortably after the lesson. If the task merely asks for a mark’s contributors, use tracing; if it needs an intermediate query population, evaluate stage opening before inventing saved-destination navigation.

**Verification.** Observe the exact task first with existing controls. Record the intended entity, period, retained destination restrictions, final record IDs, errors, recovery, and return behavior. Do not manufacture an “observed” task from the fixture. [`QueryParameters.update`][query-inputs] applies every valid edit; invalid drafts retain the last valid display without becoming committed state.

**Confidence and gaps.** High confidence in available controls; low confidence in task frequency and their practical adequacy. No user observation rejects them yet.

**Proposed destination.** Add “Open detail with existing controls” to the proposed task-navigation page and a manual two-view lesson in the proposed `taskNavigation.ts` example. Keep the decision in the existing navigation intent. This documentation/example milestone requires no connection feature.

## TN02 — Investigate the population contract before interface design

**Suggestion: investigate explicit precedence; reject implicit inheritance.**

**Affected task and users.** Both the workspace user interpreting totals and the host developer passing context need to know which rows detail represents. “Open Store 7” is incomplete unless the date population, destination restrictions, and selected entity’s type are known.

**Repository evidence.** [`AnalysisParameter`, `FilterStep`, and `AnalysisView`][types] separate typed scalar bindings from query restrictions and saved settings. [`evaluateAnalysisQuery` and `filterFrame`][evaluate] evaluate query filters before charts receive result rows. Equality is type-sensitive; a referenced undefined parameter produces no rows and a diagnostic. [`bindingProblem`][bindings] validates types, required inputs, and paired parameter bounds; it does not resolve literal destination-date conflicts or chart-local restrictions. [`analysisRowKeys`][keys] translates runtime `__ID` filters into result keys, not business entity values. The [saved-analysis intent][saved-intent] protects selections and intentional `localFilters`.

**Proposed contract options.** Compare three meanings explicitly:

- **Destination population:** map the entity only; retain destination date bindings, literal query restrictions, and saved local restrictions.
- **Explicit mapped context:** additionally replace only named destination parameters, such as approved date endpoints. Preserve unmapped restrictions; show them beside the mapped inputs.
- **Inherited source filters:** require evidence that each transferred condition has the same field meaning, type, grain, and scope. This remains outside the minimal candidate because generic compatibility is unproved.

An aggregated selection may represent many rows with one entity, or several entities. Count distinct typed entity values across the relevant contributors. Never select the first row, coerce labels into keys, silently aggregate keys, or convert disjoint periods into one enclosing range. Missing values and multiple distinct entities are bounded refusals for the scalar candidate. A known empty intersection must remain distinguishable from an invalid transfer.

**Benefit and cost.** This prevents plausible but incorrect totals and preserves deliberately saved restrictions. It adds mapping validation and explanation; automatic inheritance would require much broader compatibility machinery. A proposal to preserve destination restrictions is a conservative test option, not settlement of Byron’s inheritance preference.

**Alternatives and rejection conditions.** Retain manual inputs when meaning cannot be stated in a short population sentence. Reject a mapping if it needs unapproved filter clearing, unknown key conversion, or unsupported multi-value semantics. Reject an “all source filters” policy if identical entity/period values still yield unexplained membership differences.

**Verification.** Compare exact memberships and numeric contributors for destination-only, mapped dates, conflicting literal dates, source Web versus destination Store restrictions, typed `7`/`"7"`, zero, missing measure, missing entity, multiple entities, and reversed/disjoint ranges. The supplied validator tests are seeds, not coverage of these navigation cases.

**Confidence and gaps.** High confidence in the distinction among query, selection, and saved state. Exact arbitrary chart-filter execution and semantic extraction were outside the packet. H01, H02, and H04 remain human choices.

**Proposed destination.** Record options and refusal rules in the existing intent and its initiative map. Add “Which rows will detail contain?” to the proposed task-navigation page; use the same proposed example to display contrasting populations before any navigation control is adopted.

## TN03 — Investigate one host-authored binding example only if needed

**Suggestion: investigate conditionally; no new public API proposed.**

**Affected task and users.** A developer embedding explorEDA already knows the selected business entity and needs one repeated transition to a named saved analysis. This is narrower than enabling arbitrary workspace users to author links.

**Repository evidence.** [`ExplorEdaProjectProps`][component] includes `toolbarEnd`, `onProjectChange`, and `onOpenView`. The last is a library-to-host callback containing an already prepared `AnalysisView`; it is not a connection editor or generic mark-selection event. [`AnalysisChartContextValue.onOpenQueryFlow`][context] opens traced rows in Query, not a destination. [`SavedViewsWorkspace.openProjectView`][workspace] already owns adding and activating a view with a checkpoint. The [customer-instance fixture][fixture] demonstrates entity plus date bindings over its orders source.

**Minimal candidate.** One host-owned action targets one named existing saved destination over one source. It supplies one string entity parameter and, only if approved, canonical date endpoints to declared date parameters. The host uses its own opening function and existing view types. No saved link schema, generic route, URL sharing, cross-source mapping, or general parameter language is included.

The host may obtain semantic values from its own explicit picker or application state. That is not proof it can derive them from arbitrary chart marks. If a repeated task specifically demands mark extraction, stop at the exact missing event/identity boundary and inspect that handler; do not introduce a new API preemptively. Internal `bindingProblem` is evidence for validation behavior; the selected packet does not establish it as a public export.

**Benefit and cost.** A host example can remove repeated transcription while keeping the public surface unchanged. The host must still validate complete inputs, preserve retained destination restrictions, label the resulting context, and honor the selected instance policy. This is real product work even if no exported API changes.

**Alternatives and rejection conditions.** Manual duplication and query inputs remain valid. Reject the candidate if those are adequate, if context requires ambiguous chart inference, or if the task actually needs end-user authoring. The latter would be separate evidence for TN06, not permission to grow this candidate during the same milestone.

**Verification.** Before changing state, resolve destination/query/parameter IDs, types, entity cardinality, permitted endpoints, retained restrictions, and current applied source context. Refuse atomically on unsafe transfer: keep both views unchanged and add no checkpoint. Compare the successful result with the manual path using identical inputs; do not claim speed gains without observation.

**Confidence and gaps.** High confidence that host composition is available; medium confidence that a specific host can use it without more source excerpts; no established demand. H01–H04 must be reviewed before implementation.

**Proposed destination.** If the gates pass, propose one bounded implementation milestone in the navigation intent, with “Host-authored detail opening” in the proposed docs page and the corresponding action in the same proposed demo example. Neither milestone nor implementation is approved by this research.

## TN04 — Investigate instance and return behavior within existing history

**Suggestion: investigate; preserve the current host owner.**

**Affected task and users.** A user opens detail for A, edits it, then opens B and returns to the overview. The policy must explain whether A remains available, what happens to edits and selections, and what Undo means.

**Repository evidence.** [`SavedViewsWorkspace.openProjectView`, `changeActive`, `createView`, and `moveHistory`][workspace] already add tabs, switch without a checkpoint, duplicate, and restore history. Opening always creates a new tab today; that does not settle the future policy. [`savedViewsHistory.pushCheckpoint` and `SHARED_KEYS`][history] plus [`SavedViewsSession` and `HistoryEntry`][session] establish bounded host history. Checkpoints contain tabs/project, not source-table snapshots or active-tab provenance. Calculations, color scales, field settings, aggregates, and geometry assets can propagate across tabs using the same query; separate tabs are not fully isolated copies. A duplicated tab also retains `queryId`, so query-definition edits affect other views of that query. Existing `ProjectQueryPanel.openCopy` and `queryEditing.copyQuery` provide the alternative when independent query editing is intended.

**Options and tradeoffs.** Reuse minimizes tab growth but requires a precise target and a rule for edited context. A new instance protects the existing detail tab but retains saved restrictions and may accumulate tabs. Existing duplication is already an explicit way to retain an analysis. Asking on each opening adds a decision; it should be introduced only when one default cannot serve the observed task. No option is selected here.

An edited destination cannot be detected by reusing the browser persistence “saved” indicator: that describes storage synchronization, not divergence from a saved destination definition. Never silently overwrite edits. A retained selection incompatible with new bindings needs H04’s deliberate policy, not automatic clearing.

**Return and persistence.** Return can activate the preserved overview tab; it is not Undo. Undo continues to restore the existing checkpoint model and may keep another surviving tab active. Local reload restores committed session state. Project export includes views, project, and tables, but not the checkpoint timeline or a navigation-return stack; reopening starts a new history. A source refresh can change results because history is not a versioned table store. Invalid QueryParameters drafts are component-local and can be lost on remount; promise preservation only for captured state unless that boundary is separately changed.

**Benefit, cost, alternatives, and rejection.** Reusing existing ownership avoids a competing history system. Lifecycle clarification still costs tests and product decisions. Prefer manual duplicate/open controls if safe automatic reuse needs pervasive dirty-state tracking or source-version coexistence.

**Verification and confidence.** Test A→edit→B, two openings without edits, return after source tab deletion, undo/redo, reload, export/reopen, and compatible/incompatible source replacement. High confidence in inspected lifecycle facts; no fresh runtime proof. H03 and H04 remain open.

**Proposed destination.** Put instance decisions in the existing intent; add “Return, edits, and saved state” to the proposed task-navigation docs. Include both source openings and an edited destination in the same proposed demo milestone as any adopted action.

## TN05 — Adopt an ordered proof with documentation and examples beside it

**Suggestion: adopt the verification order; keep feature work conditional.**

**Affected task and users.** Anyone trusting an overview/detail relationship first needs the present analysis to agree across selected records, metrics, exports, and restored state.

**Repository evidence.** The [current-analysis-trust intent][trust] prioritizes category selection across bar, card, and exported rows, followed by undo/restore and another chart family. [`evaluateProject.test.ts`][evaluation-tests] separates grains, invalid values, identity, parameter results, and empty aggregates. [`SavedViewsWorkspace.integration.test.tsx`][workspace-tests] provides duplication/undo/reload seeds, but its “bindings” test primarily checks query IDs and totals, not navigation parameter payloads. [AGENTS.md][agents] requires docs and a demo example in every proposed user-visible milestone.

**Ordered work.** First run the local selection/export/undo/reopen proof over one tiny source. Stop at the first disagreement and propose a bounded repair. Next compare manual flows using the business and engineering/science fixtures in the proof plan, with explicit IDs, population definitions, contributors, and totals. The engineering comparator tests the same scope distinction; it does not authorize a second feature or a general units/range framework. Only after a repeated task rejects current controls should TN03’s one host candidate be tested against the identical manual result.

**Benefit and cost.** Membership assertions distinguish alternatives that can accidentally produce equal totals. Missing measures, genuine zero, and empty populations test different states. A small fixture is cheap enough to inspect; exhaustive certification or broad performance work would dilute the decision.

**Alternatives and rejection conditions.** Static arithmetic can validate the fixture oracle but cannot validate chart interaction, serialization, focus, or remount behavior. Reject feature progress if current trust fails, if the candidate disagrees with manual inputs, or if no material repeated task exists. Passing synthetic cases alone does not establish adoption value.

**Verification.** Distinguish manually checked arithmetic, the executed standalone arithmetic assertions, source test inspection, and unrun application checks. In a real checkout, run the named targeted Vitest suites and `pnpm check`; interact at 1280, 783, and 390 px. Record keyboard behavior, displayed applied context, membership, valid numeric contributors, and restoration. Do not label proposed scenarios observations.

**Confidence and gaps.** High confidence in the proof’s ability to distinguish population options; application and demand evidence remain missing.

**Proposed destination.** The first proof milestone pairs the proposed `analysis-trust.mdx` section “One selection through export and reopen” with the proposed `analysisTrust.ts` tiny same-source example. The manual navigation milestone pairs the proposed task-navigation page and example. Any later host-action milestone updates those same docs/example together; none postpones explanation until after a feature ships.

## TN06 — Defer saved connection authoring and broader machinery

**Suggestion: defer; retain later user/developer authoring intent.**

**Affected task and users.** End-user authoring matters when a workspace user must choose and save different source-to-destination mappings without developer intervention. That task is distinct from a developer configuring one known transition.

**Repository evidence.** The [navigation intent][intent] and [initiative map’s `feedback-14` claim][map] preserve a later route for both users and developers to create views/connections. They also defer inheritance and reuse decisions. [`AnalysisView`][types] currently stores view state without an authored connection declaration in the inspected type. Existing host callbacks, query inputs, and duplication provide alternatives; the packet contains no observed authoring task that rejects them.

**Benefit and cost.** Deferral protects one developer’s maintenance budget and avoids encoding unresolved population policy in saved files. Its cost is that nondevelopers cannot yet define a general saved link through the inspected interfaces. This leaves later authoring intent intact.

**Alternatives and rejection conditions.** Keep manual saved views and the conditional host example. Reconsider authoring only when a named user repeatedly needs to choose a destination/mapping, developer configuration is demonstrably inadequate, and the population/instance contract is agreed. Reject immediate expansion to a routing framework, permissions system, workflow engine, cross-source navigation, source-version coexistence, URL sharing, remote pushdown, or side-by-side comparison. None is necessary to test one source and destination.

**Verification.** Collect one actual authoring task, including who chooses the destination, which fields vary, how mistakes are corrected, and why the host example cannot serve it. Prove one saved mapping’s meaning and round trip before proposing an editor. Existing comparisons establish semantic options, not demand.

**Confidence and gaps.** High confidence that intent remains later and unresolved; low confidence about eventual authoring frequency. H05 is explicitly open.

**Proposed destination.** Preserve the existing intent and map’s later authoring claim. Keep this as a conditional item in the reconciled research queue. If a later authoring milestone earns adoption, its proposed task-navigation docs section “Author one connection” and one example must be scoped together. No new schema or editor is proposed now.

## Human choices and handoff

| Open choice | Decision still required |
| --- | --- |
| **H01 — Population mode** | Entity plus destination population, explicit mapped context, or a justified inherited subset; whether asking per opening is worth its cost. |
| **H02 — Range mapping** | Which named endpoints may transfer, date/time meaning, inclusivity, and treatment of absent or disjoint ranges. |
| **H03 — Instance policy** | Reuse, new instance, or bounded user choice; when existing duplication is sufficient. |
| **H04 — Saved restrictions and conflicts** | Treatment of selections, edited destinations, and known empty intersections. No silent filter clearing or overwrite follows from this report. |
| **H05 — Authoring need** | When an actual end-user task justifies saved connection authoring beyond a host example. |

These choices can remain proposals during review. Feature adoption needs evidence that current controls fail an acceptable repeated task, an agreed population contract, bounded refusal and lifecycle behavior, and a falsifiable proof. Codex remains responsible for independent collection, review, integration, and the review PR. This report does not claim that later work is complete.

[intent]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/parameterized-task-navigation/intent-brief.md
[map]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/parameterized-task-navigation/initiative-map.json
[saved-intent]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/saved-view-templates/intent-brief.md
[trust]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[types]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/AnalysisProject.ts
[component]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/ExplorEdaProject.tsx
[context]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/AnalysisChartContext.tsx
[panel]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx
[bindings]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/parameterBindings.ts
[keys]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/analysisRowKeys.ts
[editing]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/queryEditing.ts
[schema]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/ProjectSchemaPanel.tsx
[rows]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/QueryStageRows.tsx
[evaluate]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[fixture]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/fixtures/shopProject.ts
[evaluation-tests]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
[workspace]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.tsx
[session]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsSession.ts
[history]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.ts
[workspace-tests]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.integration.test.tsx
[shop]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/demos/analyses/shop.ts
[agents]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md
[guide]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md
[query-inputs]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/project/QueryParameters.tsx
