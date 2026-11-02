# Notebook definition navigation — Design

https://github.com/byronwall/explorEDA
Baseline: d3920a285f3755a8324998775deb131747e959f5 (origin/main). Mode: Design.

What should we build so a notebook reader can find where a plotted measure or finding comes from, see which outputs depend on a definition, and return to their reading position?

Act as a senior analytical notebook designer and compiler engineer. Compare strong tools and papers, recommend a coherent capability, and give a staged implementation plan. Byron is the demand. Do not require outside demand or conclude with an audit or keep-current-behavior answer.

## Access and reading

Confirm you can read all 26 complete baseline files in source-packet.txt. Use it if connected GitHub cannot access this exact commit. If decisive source is absent, stop and name the smallest missing input. Start with AGENTS.md, README, UI defaults, coding standards, notebook compiler/tests, notebook renderer/tests, DSL parser/compiler, calculation semantics/trace, findings, sheets/writeback, and notebooks docs. All are attached.

## Ranked questions

1. Design navigation from outputs to definitions and from definitions to direct and transitive consumers. Compare inline links, a focused inspector, an outline, and a graph with current primary sources from Observable, JupyterLab, and relevant analytical tools/papers. Pick a clear interaction bundle and explain rejected options.
2. Specify exact compiler metadata and resolution rules. Cover raw fields, aliases, chained calculations, findings in prose, chart fields/local filters, composition, duplicate names, forward references, unused definitions, invalid blocks, and last-valid stand-ins. Distinguish dependencies the current compiler knows from new extraction needed. Avoid an independent parser or general reactive execution engine.
3. Specify source navigation and return across sheets, headings, read-only versus editable notebooks, sections layout, source edits, renamed/deleted definitions, duplicate headings, and controlled sheet hosts. Do not pretend block indices or file line numbers remain stable after edits. Propose the smallest honest identity contract.
4. Give exact acceptance fixtures, expected dependency edges and navigation outcomes, keyboard/focus behavior, and layouts at 1280/783/390px. Include a six-block notebook with two chained calculations, an alias, first-use-before-definition, an unused definition, multiple sheets and invalid/stand-in states. Avoid claims about measurements you did not run.
5. End with shippable milestones. Name source files/modules, necessary tests, the docs page/section and runnable example in each milestone. Separate this navigation capability from live findings research PR507 and existing calculation value tracing. Do not depend on unmerged research plans.

## Evidence and constraints

Cite repository paths/symbols for current behavior and current primary URLs for external claims. Separate facts, inference and proposals. The supplied candidate brief is older framing: do not use its demand-study gate. Current code already shares definitions across blocks and has Defines labels, sheets, source editing, diagnostics and last-valid fallback; verify their precise limits. Retain React/TypeScript and pnpm, current constrained DSL and one local client/server version. Prefer direct modules and few tests that protect real behavior. No implementation, commits, services, hosting, or paid infrastructure.

## Downloads

Attach a Markdown report with the decision first, a milestone implementation plan, and recommendations with stable IDs and Build/Explore/Defer/Avoid plus reasons. Include exact fixture data and expected edges as useful companion files. Provide original mockups/diagrams if they improve the design. Link every result artifact in the final response; an optional ZIP may contain them. Do not generate hash receipts or manifests just for process. Codex will preserve originals, verify decisive claims against current code, integrate and open a PR.

End with access status, files read, checks actually run versus proposed, deliverable links, and open questions.
