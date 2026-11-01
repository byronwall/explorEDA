# Design empty-selection recovery for explorEDA

https://github.com/byronwall/explorEDA

Baseline: `d3920a285f3755a8324998775deb131747e959f5`. Mode: **Design**.

What should we build so an analyst can recover from an empty result by previewing which restriction to relax, while preserving the rest of the investigation?

Act as a senior linked-view analytics designer with database query explanation experience. Recommend an ambitious but bounded capability with independently shippable milestones. Byron is the demand; do not require outside users, observed failures, or usability studies before proposing a build.

## Access

Read the attached complete-file source packet at the exact baseline. Confirm access before work. If decisive source is absent from both the packet and GitHub, stop and request the smallest missing input. Distinguish current code, inference, and proposed behavior. Older R052 brief's demand gates and keep-current rejection rules are superseded by DIRECTION and this mission. Prior filter-ownership research describes behavior, not a recovery design. Do not repeat its audit or treat unbuilt research as prerequisites.

## Reading route

Read AGENTS.md, README, coding standards and UI defaults first. Then CrossfilterWrapper, applyFilter, chartPopulation, ActiveFilterStatus, WorkspaceFilterEditor, LocalFilterStrip, RowsView, DataTable/filteredRows and definition, DataLayerProvider, FilterTypes and ChartTypes. Read their supplied tests, notebook component/findings, savedViewsHistory, filter and notebook docs. R052 and the earlier filter-ownership summary supply context. All paths are in the source packet.

## Ranked questions

1. Compare the best primary-source approaches to empty-query explanation and relaxation in linked views, BI, databases and interactive visualization. Compare per-restriction removal counts, chronological undo, and bounded multi-restriction alternatives. Choose a model and explain rejected options. The result must add a useful capability rather than only improve wording.
2. Specify exactly which population is being recovered: workspace intersection, self-excluded chart context, chart local population, Rows local filters/search, table searches, and notebook local selections. Define what a removable unit is when one chart owns several predicates, including same-field owners and specification-status selection. Show the UI sequence from empty view to preview, exact returned records, explicit Apply, and return/undo. Never silently clear filters.
3. Design a read-only counterfactual evaluator using current field values and real predicate semantics. Compare a pure evaluator with temporary Crossfilter mutation; address side effects, held edits, stale previews after data/settings changes, typed missing categories, exclusive ranges, date limits, derived fields and empty source data. State costs and when to compute on demand. No exhaustive solver or permanent recomputation by default.
4. Supply manually enumerable fixtures with exact IDs and counts for conflicting categories, date limits, missing values, Rows-only search, local chart restrictions, multiple same-field owners, and joint conflicts where no single removal helps. Distinguish no rows, no plottable values and a chart not set up. Include notebook-local selection and an intentional empty result. Make tests prove user behavior and semantics, not implementation structure.
5. Give the smallest coherent public API and state design, lifecycle through undo/redo, saved JSON, folder and notebook use, and independently shippable milestones. Each milestone names actual files, focused tests, a docs page/section and runnable example, main risk, and a concrete acceptance flow at 1280, 783 and 390px. Mark unsupported surfaces explicitly; do not promise unsupported behavior.

## Constraints and evidence

Keep the existing React/TypeScript library and demo. Use pnpm. One developer, one deployed version. Prefer direct control flow and current data models. Preserve existing linked selection semantics. Do not introduce a generic dependency engine, cloud service, paid infrastructure or compatibility framework. No implementation commits from you. Cite repository paths and symbols for code claims. Use current primary sources with URLs for decisive external claims. Mark uncertainty. Do not make an audit of current correctness the primary deliverable.

## Deliverables

Attach complete downloadable Markdown report, implementation plan and recommendations with stable IDs and Build/Explore/Defer/Avoid dispositions plus reasons. Put the recommended build at the top. Include exact fixture data and expected memberships as a companion when useful. Preserve useful diagrams or mockups as separate downloadable files if created. Link each artifact in the final response; an optional ZIP is welcome. Do not spend effort on hash manifests. Codex will inspect all originals, verify decisive claims and integrate plans. End with access status, files read, checks versus proposals, artifact links and open questions.
