https://github.com/byronwall/explorEDA

# Research the smallest useful overview-to-detail navigation boundary

Act as a product researcher for embedded analytical workspaces. Give a candid decision report. Research only; Codex owns integration and the review PR.

## Mission and baseline

Decide whether explorEDA should keep manual saved-view/query-input workflows, improve documentation/examples, or propose one explicit overview-to-detail connection. Determine the population and context contract before any navigation interface. A recommendation to defer is valid. Do not assume that a feature is wanted because another product offers it.

Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`, origin/main checked on 2026-10-20. Target research branch: `codex/task-navigation-research-2026-10-20`. Checkout: `/Users/byronwall/Projects/explorEDA`. Existing React/TypeScript pnpm monorepo; preserve that stack. One personal developer, no established demand. Prefer short direct control flow and a small public surface.

The attached source packet is an authorized selected text snapshot, not a runnable checkout. It contains path headers, byte lengths and SHA-256 hashes. Some prompt/queue context is local addition. Authenticate the selected baseline from packet metadata. Use the packet if connected GitHub cannot expose the exact source. Do not substitute stale indexed code. State coverage and access limits.

GO only if repository identity, baseline, relevant types, navigation intent, saved-view host, query inputs and existing source/stage open actions are accessible. If material source is missing, report NO-GO with the smallest requested excerpt. Read-only research needs no writable checkout. Do not stop merely because execution or repository mutation is unavailable. Do not invent tests or an observed author task.

## Verified starting evidence to recheck

- `docs/intent/parameterized-task-navigation/intent-brief.md` records overview-to-detail as a later outcome. The September/store example is illustrative. Filter inheritance and reuse versus multiple instances remain unresolved human choices.
- `AnalysisView` already stores queryId, bindings, settings, inspection and selectedRowKeys. `AnalysisParameter` is typed; query filter steps can reference parameterId.
- `QueryParameters` uses local drafts. Valid bindings apply together; invalid drafts retain the last valid displayed result. `bindingProblem` checks required inputs, types and reversed bounds.
- `ProjectQueryPanel` can copy a query or open a stage. `ProjectSchemaPanel` and `QueryStageRows` can open sources. `ExplorEdaProject` exposes onOpenView to its host. Do not propose these as absent.
- `SavedViewsWorkspace.openProjectView` adds a new tab and checkpoint, activates it and remounts. This does not establish a generic authored connection or an inheritance policy.
- `AnalysisChartContext` supports opening query flow for traced rows. Query-flow tracing, selecting linked rows and opening a saved destination are different jobs.
- Existing shop fixture has a customer-instance query with date bounds. The current order-book example has four focused tabs. These are evidence to inspect, not proof of demand for connections.
- Complete analysis saving currently includes selections. `saved-view-templates` warns against treating all filters as temporary. Do not silently clear local restrictions or rewrite history.
- Prior research PRs451/452/455/456/457 are complete. Their queues retain the local selection/export/undo/reopen trust proof first. PR454 owns time-series axes. Avoid reopening those surveys.

## Reading route

Read the packet inventory. Start with AGENTS.md, docs/agent-guide.md, CODING_STANDARDS.md, README.md and package.json. Then read:

1. docs/intent/parameterized-task-navigation/intent-brief.md and initiative-map.json.
2. docs/intent/saved-view-templates/intent-brief.md and docs/intent/current-analysis-trust/intent-brief.md.
3. packages/explorEDA/src/types/AnalysisProject.ts and types/SavedDataStructure.ts.
4. packages/explorEDA/src/components/ExplorEdaProject.tsx, AnalysisChartContext.tsx and project/parameterBindings.ts, QueryParameters.tsx, ProjectQueryPanel.tsx, QueryStageRows.tsx, ProjectSchemaPanel.tsx, queryEditing.ts and analysisRowKeys.ts.
5. packages/explorEDA/src/lib/analysis/evaluateProject.ts and useAnalysisEvaluation.ts.
6. apps/demo/src/SavedViewsWorkspace.tsx, savedViewsSession.ts and savedViewsHistory.ts.
7. packages/explorEDA/src/test/fixtures/shopProject.ts; parameterBindings.test.ts and evaluateProject.test.ts under src/test/lib/analysis; apps/demo/src/SavedViewsWorkspace.integration.test.tsx and demos/analyses/shop.ts.
8. research-queue.md in this packet and the identified prior queue/summary. Historical context is distinct from baseline source.

Commands for an actual checkout: `pnpm --filter exploreda exec vitest run src/test/lib/analysis/parameterBindings.test.ts src/test/lib/analysis/evaluateProject.test.ts`; `pnpm --filter demo exec vitest run src/SavedViewsWorkspace.integration.test.tsx`; `pnpm check`. Do not claim these ran if you only have excerpts. Browser observations need real interaction at1280,783,390px; proposed scenarios are not observations.

## Ranked questions

1. **Boundary decision:** What repeated task would make explicit overview-to-detail connections earn their cost? Compare defer, current controls with a short lesson, host-authored binding and one user-authored saved connection. Which evidence would reject each? Distinguish API consumers from workspace users. Prefer no new API when a direct callback/example solves the task.
2. **Population contract:** Compare destination-only filters, explicit mapped context and inherited source filters. Analyze the September/store case with conflicting destination date conditions, chart localFilters, a selected entity, multiple selections, ranges, missing values and typed keys. A selection may represent many source rows. Query parameters, row identities, chart filters and query restrictions are not interchangeable. Supply an explicit state/precedence table and what the user sees. Propose defaults as options; do not settle Byron's deferred preferences.
3. **Destination and return:** Compare reusing a detail tab, a new instance, easy duplication and user choice. Explain an edited/dirty destination, two source openings, back/return, undo/redo, reload/export and source changes. Keep existing history ownership. No generic routing framework or version coexistence. Make the minimal refusal rule clear when context cannot transfer safely.
4. **Comparator evidence:** Inspect current official documentation for at least three relevant products, for example Tableau filter/parameter actions, Power BI drillthrough and Metabase click behavior. Choose based on semantics, not popularity. Record what each actually transfers, what remains local, how return works and limits. Include dates and direct primary-source links. Do not infer runtime behavior from a marketing page. No need to reproduce competitors or collect screenshots if live access is blocked.
5. **Proof and useful example:** Define one tiny business fixture and one engineering/science comparator. Include explicit rows, keys, intended population, expected result membership and totals, and adversarial cases that distinguish alternatives. Separate manually checked arithmetic from execution. Compare current manual flow first. Specify a docs section and demo example in the same proposed milestone as any feature. Keep large implementation as proposals.

## Evidence and scope

Separate facts, inferences, unresolved human choices and proposals. Cite exact paths and symbols for each current-state claim. Use current primary sources for decisive external claims. Give confidence and evidence gaps. State which tests or interactions you actually ran. Verify existing behavior before declaring a missing capability.

No application implementation, Git commits, paid service, deployment, account storage, permissions framework, general workflow engine, cross-source expansion or side-by-side comparison. The first navigation scope is one source. Multi-table code in the packet is current context, not permission to expand the intended feature. Do not add URL sharing, remote query pushdown or a broad parameter language by default. Do not copy all source filters into a destination without a compatibility and meaning argument. Do not treat the source's row index as a durable entity key.

GO for a proposal only if an exact task rejects acceptable current controls, population meaning is explicit, invalid/multiple/conflicting inputs have bounded behavior, and a small falsifiable proof can discriminate alternatives. NO-GO for feature adoption when those gates lack evidence. You may still return a complete research package with a defer recommendation. Stop expansion after one minimal candidate; list larger ideas in the ranked queue. Never fabricate demand or choose deferred product preferences on Byron's behalf.

## Deliverable contract

Produce four standalone UTF-8 Markdown files and a ZIP `task-navigation-research.zip` containing those exact four files plus `manifest.json`:

- `decision-report.md`: stand-alone mission, access/baseline, executive decision, current capability inventory, alternatives scored on task-specific dimensions, population/precedence and instance/return tables, primary-source comparisons, uncertainties and GO/NO-GO gates. Aim for useful depth, not a giant survey.
- `recommendations.md`: substantive recommendations with stable TN01,TN02,... IDs; affected task, repository/source evidence, adopt/investigate/defer/reject suggestion, benefit/cost, alternatives, confidence, verification, and proposed intent/docs/example destination. Keep under ten distinct recommendations.
- `proof-plan.md`: explicit fixtures and expected memberships/totals, current-controls comparator, failure cases, observed versus unrun checks, smallest proposed milestones with docs section and demo example beside each feature. No full application patch.
- `research-queue.md`: reconcile the supplied ranked queue. Preserve local trust first. Retain only useful distinct questions with rationale, existing evidence and next action. Do not generate another repetitive wishlist.

`manifest.json` must list names, byte counts and SHA-256 for the four Markdown files. Supply the ZIP hash separately. Link every standalone report, manifest and archive in the final answer. Files need only be downloadable from this conversation; do not require ChatGPT Library persistence or upload assets to Library. If file creation fails, return complete contents in the conversation and state the exact limitation.

Final status: GO/NO-GO for evidence access and separately for feature adoption, source commit, actual files read, checks actually run, deliverable links, recommendation count, major decision, missing evidence and open human choices. Codex will independently collect, hash, inspect, review, integrate and open the PR. Do not claim Codex's later work is done. A follow-up is justified only for missing required outputs or evidence that prevents integration; product choices can stay proposed for review.
