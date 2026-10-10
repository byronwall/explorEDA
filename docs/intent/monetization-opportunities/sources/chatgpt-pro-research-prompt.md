# explorEDA: research 50–100 practical ways to make money

Repository: https://github.com/byronwall/explorEDA

## Primary mission

Find practical paid products that Byron Wall can build around explorEDA. Produce **50–100 distinct opportunities; aim for 75**. Group related opportunities so shared research and integration details appear once. Give every opportunity enough detail to assess its feasibility.

The decision is: **Which narrow customer problems should Byron test first, and what must he build to sell the solution?**

explorEDA is a general-purpose interactive data analysis component. Byron suspects a dedicated product will earn more than selling the component itself. Test that hypothesis. Do not assume that strong visualization technology establishes customer demand.

Investigate Shopify apps, standalone Shopify analysis tools, other platform tools, observability, and DevOps. Search broadly beyond these starting points. Include overlooked, ordinary business problems with reachable buyers and accessible data.

This task combines repository review, current market research, and report production. It does not authorize implementation or Git changes.

## Decision context

Byron is a personal developer. Favor products one developer can build, sell, and support. Assume no existing customers, sales team, distribution advantage, or special data access unless evidence establishes otherwise.

Use these working assumptions, and label them in the report:

- The first product should solve one paid job for one clear customer group.
- A paid pilot within roughly two to eight weeks is preferable to a large platform build.
- Manual imports, paid analysis services, and assisted setup can test demand before automated connectors exist.
- A marketplace app, standalone SaaS, local tool, or productized service can all be valid formats.
- A modest recurring business is a useful outcome. Venture-scale growth is not required.
- The customer buys a better decision or completed task. Visualization is part of the means.

These are comparison assumptions, not facts about Byron's budget or available time. Show when different assumptions would change the ranking.

Act as a skeptical product researcher with experience in SaaS integrations and data analysis. Find strengths, costs, alternatives, and reasons to reject attractive ideas. Do not produce an optimistic list of industries that could use charts.

## Access checks and stopping rules

### GO: start the full research

1. Confirm access to the exact owner and repository above.
2. Inspect current `main`. Record the exact commit and research date.
3. Read the public API, current implementation, representative host, and relevant tests.
4. Confirm that current web research is available for platform, competitor, and pricing claims.
5. State which tools permit source reading, code execution, browsing, and downloadable artifacts.

Codex prepared this prompt from a clean, detached checkout at `b3acd0bbe95702523cf1a1f2a19a436b37d1828d` on October 9, 2026. Its local path was `/Users/byronwall/.codex/worktrees/05b2/explorEDA`. That path is context, not a path you must have.

The remote was `https://github.com/byronwall/explorEDA.git`; its default-branch reference was `origin/main`. Recent commits merged editorial themes, axis overrides, additional chart styling, color updates, and host handoff documentation through PRs #192, #197, and #200–#202.

Treat that commit as the preparation baseline. Prefer newer `main` when available, and state material differences. If only the baseline is accessible, identify it clearly and qualify recency.

### NO-GO: do not claim completed research

- If the repository is unavailable, stop repository-dependent conclusions. Give the exact access blocker and smallest remedy.
- If only documentation is available, label the result a provisional desk study. Do not invent implementation findings.
- If current browsing is unavailable, report that limitation. Do not present remembered prices or platform rules as current facts.
- If core source files are missing, locate their replacements at the selected ref. Stop if the capability cannot be verified.
- If one platform is inaccessible or commercially restricted, hold or reject that family. Continue independent families.
- If execution is unavailable, continue source-based research. Mark runtime and capacity claims untested.
- If artifact creation is unavailable, use the complete response fallback below. Read-only GitHub access does not block research.

Do not ask Byron to choose a vertical before researching. Choosing promising verticals is the purpose of the task.

Stop when the deliverable passes the quality checks below. If tools prevent completion, return completed sections and a precise remaining-work list. Never fill missing research with invented sources or duplicate ideas.

## Repository facts to verify

These facts come from local source and documentation. Recheck them at your inspected commit. They establish possible capabilities, not product demand or production readiness.

| Area | Preparation evidence | Commercial implication to investigate |
| --- | --- | --- |
| Product and framework | `packages/explorEDA/package.json` declares `exploreda`, version `0.1.0`, with React 18/19 peers. The demo uses React, TypeScript, and Vite. | Embed the existing React workspace. Do not propose a framework conversion as a prerequisite. Local version metadata does not establish the latest published version. |
| Basic integration | `ExplorEdaProps` accepts `data`, `savedData`, and `onStateChange`. `ExplorEdaHandle.getSettings()` reads settings. | The host supplies rows and stores settings. Settings callbacks exclude source rows. `savedData` restores state; it is not a controlled value. |
| Host UI | `sidePanels`, `toolbarStart`, `toolbarEnd`, and `readOnly` provide host integration points. | Assess guided workflows, domain actions, view navigation, and customer-specific controls before proposing new extension APIs. |
| Related tables | `ExplorEdaProject`, `AnalysisProject`, and `evaluateAnalysisQuery` support sources, relationships, queries, parameters, and views. | Multiple related tables already have implementation. Do not list all joins or query inspection as missing features. |
| Query semantics | The evaluator supports source, lookup, expand, calculate, filter, and aggregate steps. It records diagnostics and contributors. `entityFieldId` supports entity-aware measures. | Inspect how order, item, customer, event, or account grain affects metrics. This is not evidence of a general SQL engine. |
| Execution | `exploreda/analysis` exposes a React-free evaluator. `createAnalysisWorker` can move project queries into a browser worker. | A worker does not establish remote query execution, incremental streaming, or warehouse-scale analysis. |
| Charts and investigation | `registerAllCharts.ts` registers 19 view types. Linked filtering, field settings, calculations, and source tracing support investigation. | Look for paid tasks where users must explain a metric through its records, not merely read a dashboard. |
| Persistence | The package supports settings, full-analysis bundles, and project files. `SavedViewsWorkspace.tsx` implements demo tabs, local storage, and history. | Distinguish library serialization, reusable demo code, and a hosted product's storage and account responsibilities. |
| Authoring and appearance | The package includes dashboard text compilation, multiple-view text, and Compact, Newsprint, and Report themes. | Assess reusable domain templates and report workflows. Styling does not establish finished image, PDF, or scheduled-report export. |
| Browser constraints | Package documentation requires DOM and Canvas APIs, WebGL for 3D, and desktop widths of at least 1024 CSS pixels. | Check embedded-platform dimensions. Do not assume a narrow mobile app can host the full workspace without work. |
| Performance evidence | `docs/scatter-matrix-performance.md` reports 100,000-row tests with fast matrix previews but roughly 0.7-second release commits. | These are chart-specific historical measurements. They are not a universal capacity or latency guarantee. |

**Documentation warning:** older inventories describe a single-table product and missing features that now have code. `docs/application-feature-inventory.md`, `docs/transcript-gap-analysis.md`, and intent files contain historical statements. Current source, public exports, tests, and observed behavior take precedence. Explain contradictions instead of copying old gap lists.

The preparation scan found no tracked license file and no `license` field in the package manifest. Recheck this before discussing component licensing or redistribution. Do not infer a license from a public repository or package.

## Repository reading route

Read the following files at minimum. Expand the search where a recommendation depends on additional behavior.

### 1. Rules and product boundary

- `AGENTS.md`
- `docs/agent-guide.md`
- `README.md`
- `packages/explorEDA/README.md`
- `package.json`
- `packages/explorEDA/package.json`
- `apps/demo/package.json`

### 2. Actual component and data contracts

- `packages/explorEDA/src/components/ExplorEda.tsx`: public props, host controls, settings access, and exports.
- `packages/explorEDA/src/components/ExplorEdaProject.tsx`: project integration and active query results.
- `packages/explorEDA/src/types/AnalysisProject.ts`: row meaning, identities, relationships, query steps, and parameters.
- `packages/explorEDA/src/analysis.ts`: public non-React analysis entry point.
- `packages/explorEDA/src/lib/analysis/evaluateProject.ts`: query behavior, contributor records, and aggregation rules.
- `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts`: direct and worker execution.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx`: workspace state, fields, and calculations.
- `packages/explorEDA/src/hooks/CrossfilterWrapper.ts`: chart filter scope.
- `packages/explorEDA/src/types/SavedDataStructure.ts` and `packages/explorEDA/src/utils/saveDataUtils.ts`: persistence contracts.
- `packages/explorEDA/src/charts/registerAllCharts.ts`: current chart catalogue.
- `packages/explorEDA/src/lib/dsl/compile.ts` and `packages/explorEDA/src/lib/dsl/export.ts`: template authoring and export.

### 3. Real consumers, examples, and proof

- `apps/demo/src/SavedViewsWorkspace.tsx`
- `apps/demo/src/savedViewsSession.ts`
- `apps/demo/src/savedViewsHistory.ts`
- `apps/demo/src/demos/examples.ts`
- `apps/demo/src/demos/dashboardSettings.ts`
- `apps/demo/src/demos/multiSourceShop.ts`
- `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`
- `packages/explorEDA/src/test/lib/analysis/parameterBindings.test.ts`
- `packages/explorEDA/src/test/providers/projectIdentity.test.tsx`
- `packages/explorEDA/src/components/__tests__/ExplorEda.test.tsx`
- `packages/explorEDA/src/test/utils/saveDataUtils.test.ts`
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.bench.ts`

The shop fixture contains customers, orders, items, products, unmatched keys, and known totals. It can ground commerce ideas. It is synthetic proof data, not a Shopify connector or evidence of merchant demand.

Inspect chart definitions and tests when a candidate needs specific analytical behavior. For example, inspect `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts` before calling regression absent.

### 4. Prior findings and unresolved product scope

- `docs/application-feature-inventory.md`
- `docs/analytical-chart-coverage.md`
- `docs/transcript-gap-analysis.md`
- `docs/scatter-matrix-performance.md`
- `docs/intent/multi-source-analysis/implementation-plan.md`
- `docs/intent/project-task-views/intent-brief.md`
- `docs/intent/advanced-scatter-analysis/implementation-plan.md`
- `docs/intent/analysis-export/intent-brief.md`
- `docs/intent/reusable-analysis-outputs/intent-brief.md`

Treat plans as intent until implementation evidence confirms delivery. Do not spend the whole research budget reviewing unrelated historical files.

### Optional verification commands

Use these commands from a repository root only when execution would resolve a material uncertainty. Use pnpm for package work.

```sh
git rev-parse HEAD
git status --short --branch
pnpm --filter exploreda check-types
pnpm --filter exploreda exec vitest run src/test/lib/analysis/evaluateProject.test.ts src/test/lib/analysis/parameterBindings.test.ts src/test/providers/projectIdentity.test.tsx
pnpm --filter demo dev --port 5291 --strictPort
```

The demo development server reads library source. A library build is unnecessary for that inspection. `pnpm check` is the broad repository check; it builds packages. It is not required merely to write market research. State which commands actually ran and their results.

The README names `https://exploreda.dev` as the live demo. If you inspect it, record the date and route. Do not assume its deployed code matches the inspected commit.

## Priority questions, in order

1. **What recurring, expensive problem has a specific buyer who could pay for a narrow solution?**
2. **Can that buyer provide the required data through a practical, permitted integration?**
3. **Why does interactive investigation improve the customer's decision or action?**
4. **What does explorEDA already supply, and what product must surround it?**
5. **How can Byron reach the first ten prospects and obtain a paid validation signal?**
6. **What price and delivery model could cover acquisition, infrastructure, and support costs?**
7. **Which component changes matter before the first sale, and which can wait?**
8. **Which related opportunities share enough work to form a sensible expansion path?**

Compare vertical products with a small set of component-business alternatives. Examples include paid setup, support, templates, or embedding services. Keep these as controls for Byron's hypothesis, not substitutes for the requested opportunity catalogue.

## Breadth and grouping

Aim for 75 distinct opportunities across roughly 10–15 useful families. Deliver at least 50 and at most 100. Count individual buyer problems, not family headings or feature variations.

Research areas can include:

- Shopify merchant operations and specialized commerce analysis.
- Other commerce platforms, marketplaces, subscriptions, and payment systems.
- Marketing, customer acquisition, and agency reporting.
- Sales operations, customer support, and customer success.
- Observability, cloud costs, incidents, CI/CD, and developer workflows.
- Data operations, quality checks, reconciliation, and migration review.
- Inventory, purchasing, fulfillment, and logistics.
- Field services, small business operations, and property operations.
- Scientific, engineering, laboratory, and manufacturing analysis.
- Public or licensed datasets packaged for specific professional decisions.

Change this grouping when evidence suggests a better structure. Do not force weak candidates into a quota. Ensure meaningful coverage of Shopify and DevOps, plus substantial exploration outside both.

Different platforms alone do not make different ideas. Merge platform variants when the buyer, decision, data model, and paid value remain the same. Split them only when those differences materially change the product or business.

Include opportunities that start with a customer export. Compare their time to value against API-first products. Explain whether manual imports can support repeat sales or only a short pilot.

## Research method and evidence

Establish the component baseline first. Then research candidate families, merge duplicates, and investigate the strongest opportunities more deeply.

Use current primary sources for APIs, authentication, permissions, marketplace requirements, pricing, and platform limits. Prefer official documentation, vendor pricing, app listings, and published terms. Record the research date and API version where relevant.

Use public customer reviews, community discussions, job descriptions, and service offerings to identify pain. These signals support hypotheses; they do not prove willingness to pay. Distinguish buyer complaints from vendor marketing.

For each family, find concrete competitors and the platform's built-in alternative. For each leading idea, explain why a buyer would choose it over those options, a spreadsheet, or doing nothing.

Use three explicit evidence labels:

- **Observed:** supported by a repository citation or current external source.
- **Inferred:** a conclusion drawn from cited observations.
- **Proposed:** a product, price, effort estimate, or experiment that remains untested.

Give exact repository paths and symbols for component claims. Prefer GitHub links pinned to the inspected commit. Never invent line references. A family capability citation can support multiple ideas when each idea references that family entry.

Cite external claims beside the text they support. Include source titles, URLs, and access dates in a source index. Shared family citations can avoid repetition, but each idea must retain a clear evidence trail.

Do not invent market sizes, revenue, customer counts, API fields, approval times, conversion rates, or platform access. Mark unknown facts explicitly. Use prices as testable hypotheses unless a source establishes an observed price.

## Shared family brief

Assign each family an ID, such as `F01`. Write its shared brief once. Include:

1. **Buyers and current workflow:** buyer role, business size, task frequency, current tools, and common failures.
2. **Market evidence:** demand signals, two or more relevant alternatives where available, pricing evidence, and unmet needs.
3. **Data access:** named systems, documented APIs or export paths, required objects, permissions, and access restrictions.
4. **Integration design:** authorization, initial backfill, incremental updates, pagination, limits, history, deletions, and freshness where relevant.
5. **Data model:** tables, entity keys, join relationships, row meaning, and metric definitions shared by the family.
6. **Application foundation:** the minimum common host, persistence, connectors, templates, and workflow controls.
7. **explorEDA fit:** delivered capabilities with source evidence, constraints, reusable demo code, and genuine component gaps.
8. **Sales and economics:** reachable channels, installation or sales friction, likely support burden, and major operating costs.
9. **Shared risks:** the few access, data-quality, commercial, or scale constraints that could invalidate the family.

Show one concise data-flow diagram or numbered flow for each materially different architecture. For example: authorized source → sync or export → modeled rows → explorEDA → customer action.

Specify where processing occurs. Keep credentials and data access in the host's appropriate trust boundary. Do not propose sending an entire event warehouse into a browser.

When applicable, distinguish source retention from query windows, aggregated results from raw events, and sampled results from complete populations. Estimate representative volumes and label those estimates.

State the source of each business metric. Handle currencies, time zones, refunds, partial data, repeated entities, and join cardinality when relevant. Do not hide this work behind “normalize the data.”

Avoid repeating generic SaaS infrastructure for every idea. Include only capabilities the proposed buyer and delivery model need.

## Required brief for every opportunity

Assign stable IDs `O001`, `O002`, and so on. Keep the following headings for every idea. Reference shared family details, then state the idea's specific differences. “Same as above” is insufficient.

### 1. Buyer, problem, and paid outcome

Name the customer and budget owner. Describe the trigger, recurring task, costly failure, and decision the product improves. Give a concrete use example.

Explain the action after analysis. Examples can include correcting a product listing, changing a supplier, investigating an incident, or resolving a mismatch. Choose actions that follow from that specific idea's evidence.

### 2. Data sources

Name required systems and objects or export files. List essential fields, identifiers, date range, and row meaning. Separate required sources from optional enrichment. State who owns the data and how the customer obtains it.

Flag missing or unavailable data that could prevent the promised result. Do not assume an API exposes information merely because the platform displays it.

### 3. Integration

Specify the concrete API, webhook, export, database connection, or file-import route. Name authentication and permissions when verified. Explain initial load, updates, and minimum freshness.

State necessary joins, calculations, and aggregation. Explain data movement between backend, browser, and external services. Identify the cheapest viable pilot route and what changes for a repeatable paid product.

Use the family brief for shared details. Identify additional access, transformation, or operational work unique to this idea.

### 4. Supporting app or site

Describe the minimum screens and customer flow: first visit, data connection, first useful result, investigation, and resulting action. Explain domain templates, metric definitions, guidance, and output needs.

Identify needed host features such as saved investigations, history, scheduled refresh, alerts, report delivery, billing, or account access. Mark optional features separately. Avoid adding team administration or enterprise features without a concrete buyer need.

Explain why someone returns and keeps paying. State when a one-time tool or service fits better than a subscription.

### 5. explorEDA use and required changes

Name the charts, interactions, query features, and source-inspection behavior used in the workflow. Connect each one to the paid task.

Classify implementation work explicitly:

- **Configuration:** existing component features and domain templates.
- **Host:** data connectors, storage, accounts, domain calculations, workflows, and other surrounding application work.
- **Component:** verified missing library behavior or public API changes.
- **Unverified:** capabilities that need a targeted code or runtime check.

Separate blockers for the first paid version from later improvements. “No component changes needed” is valid when evidence supports it. Do not label ordinary host responsibilities as library defects.

### 6. Business model and competitive reason to buy

Propose delivery format, charging unit, and a plausible initial price range. Label pricing hypotheses. Compare relevant existing products and built-in tools using sources.

State the specific advantage and why it matters economically. “Better charts,” “AI insights,” and “all your data in one place” are not sufficient.

### 7. First customers and cheapest test

Identify a realistic route to ten prospects. Do not assume marketplace listing means discovery. Describe a small test using available data, a prototype, or a paid service.

State what evidence would justify further work and what would reject the idea. Propose measurable pass and fail conditions. Do not contact people or publish anything during this task.

### 8. Effort, uncertainty, and verdict

Estimate effort separately for data integration, host application, and component changes. Use ranges and assumptions, not false precision. Estimate time to the first paid pilot and recurring support burden.

List the largest failure risk. Give a confidence level and one verdict: `GO—validate`, `HOLD—resolve dependency`, or `NO-GO`.

Every idea must fully answer the four requested technical questions: sources, integration, supporting app, and component changes. A compact catalogue row alone does not satisfy this requirement.

## Special investigations

### Shopify and adjacent platforms

Compare an embedded Shopify app, standalone Shopify-connected product, and export-based service for the same promising workflow. Research differences in distribution, authorization, billing, installation, and ongoing obligations.

Verify current API access, historical-data limits, protected fields, marketplace review, and permitted business use when relevant. Explain how those conditions change the smallest product.

Check native reporting and established specialized apps before claiming a gap. Identify narrow merchant segments and recurring operational decisions. Do not equate a commerce demo with a competitive Shopify product.

### Observability and DevOps

Distinguish a specialized investigation tool from a full telemetry platform. Compare integrations with existing stores or exports against operating new ingestion and storage.

For each serious candidate, specify data volume, query window, cardinality, required freshness, and drilldown needs. Explain which subset reaches the browser and which analysis stays server-side.

Look for tasks where source tracing, linked filtering, distributions, and reproducible investigations provide value. Penalize ideas that require rebuilding logs, metrics, traces, alerting, and storage before delivering a narrow benefit.

### Other fields

Give equal scrutiny to ordinary operational and professional work. Include technical and scientific opportunities where investigation depth matters. Avoid treating every chart-friendly dataset as a business.

For public-data products, separate data availability from commercial reuse rights, freshness, and buyer demand. For sensitive-data products, identify only concrete access or operating requirements that affect feasibility.

## Ranking and decisions

Create a ranked table covering every opportunity. Use 0–10 scores, where higher always means more attractive. Use these weights:

| Criterion | Weight |
| --- | ---: |
| Pain severity and credible paid value | 25% |
| Practical data access and integration | 20% |
| Ability to reach buyers | 15% |
| Time to paid value for one developer | 15% |
| Advantage from explorEDA's current capabilities | 10% |
| Competitive differentiation | 10% |
| Low ongoing operating and support burden | 5% |

Define scoring anchors before scoring. Keep evidence confidence separate from attractiveness. Unknown access must remain unknown; do not give it an optimistic midpoint. Mark incomplete totals provisional and exclude them from confirmed rankings.

Apply these gates before using the weighted total:

- `GO—validate`: identifiable buyer, plausible paid pain, supported data route, narrow product, reachable prospects, and a falsifiable test.
- `HOLD—resolve dependency`: a material access, demand, calculation, or scale question remains unresolved. Name the specific check.
- `NO-GO`: unavailable essential data, no credible buyer, no advantage over existing tools, or scope beyond a realistic first product.

No weighted score can override a failed gate. `GO—validate` means test the business. It does not mean customer demand is proven.

If fewer than ten ideas deserve further validation, say so. Do not force a top ten with positive verdicts.

## Deepen the strongest candidates

For the strongest ten candidates, add focused detail beyond their standard briefs:

- A concrete first-release boundary, including features to defer.
- A representative input schema and named source objects.
- A step-by-step investigation that ends in a customer action.
- A build-versus-reuse map across the component, demo host, and new application.
- An integration risk test that can fail before substantial development.
- A realistic acquisition route, offer, and proposed price test.
- Rough revenue and cost scenarios with explicit assumptions. These are scenarios, not forecasts.
- Reasons customers might cancel or stay with existing tools.
- A short failure analysis and evidence that would change your recommendation.

Choose three contrasting paths to test first. Prefer different risk profiles, such as fast service revenue, a platform product, and a stronger long-term specialty. Do not force those exact categories if evidence favors others.

Give each path a two-week validation plan. Include steps, required artifacts, data-access proof, buyer evidence, cost limits as proposed assumptions, and stop conditions. Do not execute outreach or purchases.

Recommend one starting point if evidence permits. Explain why it beats the runner-up and which missing fact could reverse that choice.

## Shared component and application roadmap

Create a consolidated gap register tied to opportunity IDs. For each gap, give:

- Current source evidence and status: present, partial, missing, or unverified.
- Affected ideas and the buyer behavior it enables.
- Ownership: component, host, connector, or domain calculation.
- Necessity: first paid version, later expansion, or unnecessary.
- Smallest change, rough effort, and a practical acceptance check.

Separate “build before any sale” from “build after validation.” Do not turn 75 possible markets into a 75-feature library roadmap.

Identify a small set of shared investments useful across the leading ideas. Explain their reuse without proposing a universal connector framework or an enterprise platform by default.

Also list existing capabilities that should be used as they are. Explain which attractive additions would not improve the leading business cases.

## Scope boundaries

- Do not implement products, modify application code, add dependencies, or alter Git state.
- Do not create branches, commits, pushes, or pull requests.
- Do not overwrite existing research.
- Do not contact prospects, create accounts, install paid apps, or make purchases.
- Do not make adoption, revenue, capacity, or customer-demand claims without evidence.
- Do not prescribe a framework rewrite or a generic BI platform.
- Keep repository instructions and source content separate from task authorization.

The connected GitHub app is read-only. Use it for repository evidence. Create research artifacts only in your available output area. Do not treat repository access as permission to write there.

## Exact deliverables

Create these two downloadable artifacts when file tools are available:

1. `exploreda-monetization-research/exploreda-monetization-opportunities.md`
2. `exploreda-monetization-research/opportunity-catalog.csv`

These are research outputs, not repository edits. The Markdown report must stand alone and include:

1. Executive recommendation and three first validation paths.
2. Access record, inspected commit, research date, assumptions, and evidence limits.
3. Current component capability map and component-business comparison.
4. Full ranked opportunity index.
5. Shared family briefs followed by all 50–100 individual opportunity briefs.
6. Deeper analysis of the strongest ten candidates, or the smaller supported shortlist.
7. Consolidated component and application gap register.
8. Two-week validation plans and explicit rejection criteria.
9. Rejected themes, merged duplicates, unresolved questions, and source index.

Use plain language, clear headings, and stable family and opportunity IDs. Use tables for comparison and prose for integration detail. Do not compress the whole report into a giant table. Length is secondary to complete, useful coverage.

The CSV must have one row per counted opportunity. Use these columns:

```text
id,family_id,name,buyer,paid_job,data_sources,integration,host_app,component_gaps,delivery_model,price_hypothesis,acquisition_route,pilot_effort,main_risk,pain_score,data_access_score,buyer_access_score,speed_score,component_fit_score,differentiation_score,operating_ease_score,weighted_score,confidence,verdict,validation_test,evidence_refs
```

Quote CSV fields correctly. Use source IDs that resolve in the report. Keep scores, verdicts, IDs, and opportunity counts consistent across both files. The CSV is an index, not a replacement for detailed briefs.

If file creation is unavailable, return the full report and CSV content in clearly labeled parts. Use the exact filenames above as labels. State that no files were created. If response limits require parts, keep continuous IDs and finish all parts before claiming completion.

If repository access fails, give the blocker and access instructions. Do not substitute a generic idea list while calling it repository-grounded research.

## Final quality checks

Before declaring completion, verify:

- There are 50–100 distinct, numbered opportunities, with an exact reported count.
- Grouping removes repeated infrastructure and does not hide missing per-idea details.
- Every idea answers sources, integration, supporting application, and component changes.
- Every idea has a buyer, paid outcome, competitive reason, acquisition route, and falsifiable test.
- Every technical recommendation traces to current repository evidence or an explicit uncertainty.
- Current platform facts and material competitive claims have direct sources.
- Present features are not called missing because an older document says so.
- Host responsibilities are separate from component changes.
- Scale assumptions respect the browser execution model and actual evidence.
- Unknown or restricted data access changes the verdict and ranking.
- Prices and revenue scenarios are clearly labeled hypotheses or observations.
- The shortlist reflects demand and distribution, not only technical fit.
- The report and CSV agree, and every evidence reference resolves.
- No forbidden mutation or external action occurred.

Reject the result as incomplete if any idea lacks the four requested technical answers. Repair unsupported claims or mark their uncertainty. Do not claim all opportunities are viable merely because the requested count is complete.

End with a short response containing artifact links, the exact idea and family counts, and the three best validation paths. Include access status, inspected ref, checks actually run, and unresolved blockers. Keep the detailed work in the report.
