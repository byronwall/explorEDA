# Design narrow analytical reading

https://github.com/byronwall/explorEDA

Baseline: d3920a285f3755a8324998775deb131747e959f5 (origin/main).
Mode: Design.

What should explorEDA build so someone can read a saved analysis at a narrow width, understand its population and conclusions, and reach the exact supporting records?

Act as a senior analytical application designer who has shipped linked charts and accessible reading experiences. Compare strong alternatives and recommend an ambitious, staged design. Byron, the owner, wants this capability. Do not require outside demand or a usability study before designing it. This is feature design, not an audit of clipping or existing contracts.

## Access check

First confirm access to the named baseline or the attached source packet. The packet contains 28 complete files from that baseline. If decisive source is missing, stop and name the smallest missing input. Distinguish source inspection from rendered or executed checks. Codex will validate the result and make repository changes.

## Reading route

Read AGENTS.md, README.md, CODING_STANDARDS.md, docs/agent-guide.md and docs/ui-defaults.md. Then inspect these packet files at minimum:

- ChartGridLayout.tsx, chartGridPlacement.ts and their tests: current reflow and saved geometry.
- GridChartPanel.tsx and ExplorEda.tsx: actions and embedding boundary.
- components/notebook/ExplorEdaNotebook.tsx, NotebookProse.tsx, NotebookFindings.tsx and notebook.css: sections, sheets, findings and reading order.
- components/charts/ChartTraceControl.tsx and trace/ChartTracePanel.tsx, ChartTraceScope.tsx: exact-record access and scope.
- lib/notebook/findings.ts and types/SavedDataStructure.ts: persisted findings and scope contracts.
- apps/demo/src/docs/live/LiveExample.tsx, NotebookFindingsExample.tsx, docs/pages/notebooks.mdx and demos/examples.ts: docs fallback and realistic examples.
- R063-narrow-analysis-reading.md: an earlier candidate brief, not a demand gate or fixed solution.

Current facts to check: the grid enters a view-only arrangement below 960 container pixels, uses two columns from 640, and otherwise stacks panels. Notebook sections revert to a reading column below 960. Docs LiveExample uses screenshots below its viewport boundary. View-only geometry does not necessarily disable all chart interactions. Do not conflate these three boundaries.

Recent main fixes explain notebook source errors and published finding scope. Open research proposals for live notebook findings, empty-selection recovery, and notebook definition navigation are unbuilt. Your design must ship without them. Narrow reading must not depend on a new graph, recovery engine or automatic narrative generator.

## Ranked questions

1. What reading capability should we build? Compare an improved flowing grid, an explicit ordered analysis reader, and a focused chart plus evidence view. Use named tools, libraries and papers with current primary sources. Recommend a design or clear hybrid with concrete user journeys. Do not settle for keeping current behavior or a docs-only recipe.
2. How should it preserve meaning? Specify ordering, authored chart groups and claim/evidence adjacency; selected, eligible and total populations; local chart filters; sheet changes; empty and invalid findings; source notes; titles; comparison context. Decide which facts are derived and which an author supplies. Never invent prose conclusions from pixels.
3. How does someone reach exact records with touch and keyboard? Design discoverable existing trace-header actions, opening and returning from evidence, focus and scroll restoration, dense tables, overflow and touch targets. Respect the repository rule against Inspect buttons on individual marks. State which filtering actions the reader supports and how scope stays visible after them. Keep authoring desktop-oriented.
4. What changes in components, public props, saved settings and host state are necessary? Compare reusing existing panels with semantic summaries, name a minimal first milestone, and avoid a second chart renderer. Keep saved desktop geometry stable. Give concrete typed contract sketches, failures and migration implications only where needed.
5. What milestone plan proves the feature at 1280, 783 and 390 CSS pixels? Include a six-chart order analysis and a multi-sheet notebook with a claim, source note and exact supporting rows. Provide a small deterministic fixture with exact counts and tasks. Name code, tests, docs section, runnable example and main risk for each independently shippable milestone. Separate black-box acceptance criteria from checks you actually performed.

## Evidence and boundaries

Cite repository paths and symbols for code claims. Cite primary external docs, papers or source with URLs. Label facts, inferences and proposals. Explain uncertainty and rejected alternatives. No full phone authoring interface, cloud service, survey, broad renderer rewrite, or feature implementation. Keep React and TypeScript, pnpm, compact controls, accessible names and semantic UI tokens. One developer maintains this library. Prefer direct modules and existing state over a generic reader framework.

## Deliverables

Attach complete downloadable Markdown files: report.md, implementation-plan.md and recommendations.md. Lead with one paragraph stating what to build. Give stable recommendation IDs with Build, Explore, Defer or Avoid and one-line reasons. The plan must name real files, milestone order, tests with exact expected values, paired docs and runnable examples, and risks. Include readable diagram or screen mockups only where they clarify decisions. Include any fixture or code companions in full. Link every result file in the final answer; one ZIP is optional. Do not create manifests or integrity receipts. End with access status, files read, checks performed versus proposals, download links and open questions.
