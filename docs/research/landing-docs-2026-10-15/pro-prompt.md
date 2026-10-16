https://github.com/byronwall/explorEDA

# Mission: landing page and documentation evaluation

Act as a candid product positioning and technical documentation researcher. Evaluate how well explorEDA conveys its current value to prospective users, then propose a focused landing-page and docs strategy grounded in comparable products. This is review and comparative research, not implementation. Codex will collect, verify, reconcile, and open a repository review PR.

## Source and access gates

Baseline: main at ea8b52ff742f11d1fb89457acabbcd27b0bd04e7, captured 2026-10-15. The local review branch is codex/landing-docs-pro-review. Public site: https://exploreda.dev/ ; docs: https://exploreda.dev/docs . Compare deployed content with this source and flag drift. The attached source packet is an authorized selected snapshot, not a runnable checkout. Its manifest lists paths and hashes. Prefer connected GitHub access when available, but the packet is a complete permitted fallback for source review. Newer main must not silently replace the baseline.

GO: verify repository identity, baseline, source availability, and external browsing capability. Use the packet if GitHub indexing fails. Read-only research and complete response fallback are permitted. NO-GO: wrong repository, no adequate source, or no ability to verify comparative claims. Report the smallest unblock action. Partial live-site access can support a qualified source review, but cannot establish live UX. Never invent page observations, executed tests, or competitor features. If a page is inaccessible, record that limit and continue useful supported work. Stop before any mutation, merge, deploy, account signup, or paid service action. Do not stop merely because an intent document is stale: reconcile it against code, tests, and current user docs.

## Decision context and ranked questions

1. LANDING PAGE. How well does the page communicate the most important benefits and entry paths for current users? Byron expects self-hosting, database connections, and notebook support to be visible now. Determine their warranted prominence, not just whether each term appears. Assess category clarity, target audiences, first-screen comprehension, calls to action, proof, examples, differentiation, scan order, and route to first success. Consider browser file explorers, local CLI analysts, self-hosting teams, notebook authors, and React embedders. Compare viable lead messages, including retaining linked exploration as the lead versus leading with broader analysis workflows. Recommend one coherent hierarchy, with tradeoffs, instead of placing every feature in the hero.

2. DOCUMENTATION. How well can each audience learn, complete tasks, look up facts, and understand the system? Evaluate Diataxis (tutorials, how-to guides, reference, explanation) against actual page content and user journeys, not sidebar labels alone. Compare with at least one other useful principle or system, such as progressive disclosure, task-based information architecture, or Docs as Code. Explain what each lens catches or misses. Do not impose four navigation buckets merely for compliance. Find missing first-success tutorials, mixed-purpose pages, weak prerequisites, mode ambiguity, discoverability failures, unsupported promises, and gaps between coverage gates and user success.

3. COMPETITIVE COMPARISON for BOTH landing page and docs. Research 5-7 close or adjacent systems, justify the shortlist, and compare actual pages and journeys. Candidate pool: Metabase, Apache Superset, Lightdash, Evidence, Observable Framework/Notebooks, Perspective, Rill, and similar tools. Choose a useful mix of self-hosted BI, database exploration, narrative notebooks, and embeddable linked views. State where comparisons are weak; do not pretend every system is a direct replacement. Use current official pages and docs, record access dates and exact URLs, and distinguish free/self-hosted, paid/cloud, deprecated, and planned features. For each selected system, inspect BOTH its landing page and relevant docs. Derive transferable patterns and patterns explorEDA should avoid. Avoid popularity rankings or broad unsourced feature matrices.

## Verified local observations to challenge

- The hero says “Explore a CSV with charts that filter each other”, then offers file upload, an order-book example, and pnpm add exploreda. README leads with React embedding.
- Docs catalogue has 47 MDX pages, grouped as Get started, Charts, Tables, Cards and notes, Tasks, Concepts. Start includes project folders, notebooks, team server, database sources, and developers.
- Current user docs describe CLI project folders, self-hosted accounts/author-viewer roles and Compose, database snapshots and refresh, and .eda.md prose with eda blocks and bidirectional chart/text edits.
- Database docs name SQLite, DuckDB, PostgreSQL, MySQL, and SQL Server. Browser-only demo is not a direct database client. Database reads produce snapshots; opening and filtering do not issue live queries. Inspect code before elevating claims.
- Notebook semantics differ from linked dashboards: chart selections are local to a chart by default. Do not claim Jupyter kernels or arbitrary code execution.
- Some intent briefs still say shipped capabilities are future work. Treat them as intent evidence, not current implementation truth. Managed hosting, SSO, and warehouse connectors must not be advertised as shipped without code evidence.
- This is a personal project. Prefer a small, maintainable docs system and concrete improvements over enterprise governance, CMS migration, or a wholesale rewrite.

## Required reading route

Read AGENTS.md, docs/agent-guide.md, CODING_STANDARDS.md, docs/ui-defaults.md, README.md, package.json, packages/explorEDA/README.md, and apps/demo/package.json.
Inspect apps/demo/src/LandingPage.tsx, apps/demo/src/landing/_, apps/demo/src/routes.ts, apps/demo/src/docs/DocsSite.tsx, catalogue.ts, searchIndex.ts, targets.ts, gate.ts, and all docs/pages/_.mdx. Audit every page at least by purpose and content; deeply inspect representative pages from each class and every priority-feature page.
Inspect docs/application-feature-inventory.md, docs/intent/runtime-modes/intent-brief.md, docs/intent/notebook-analysis/intent-brief.md, docs/intent/database-adapters/intent-brief.md. Trace claims to packages/explorEDA/src/cli/serverCommand.ts, src/server/, src/lib/notebook/, src/components/notebook/, apps/app/src/databaseSources.ts, and packages/explorEDA/examples/forecast/ where relevant. Packet includes selected code and tests; request bounded missing context rather than guessing.
Known local commands (only run if a real runnable checkout is available): pnpm --filter demo docs:check; pnpm --filter demo build; pnpm --filter demo docs:verify; pnpm dev:agent; pnpm shot / --name landing; pnpm check. Say which were executed and which are proposed. Do not install or mutate files for this review.

## Evidence and evaluation rules

Separate observed facts, inferences, and proposals. Cite repository paths and symbols, exact live page URLs, and current official competitor or documentation-framework sources. Check consequential claims. A source excerpt is not a browser interaction. Record observed navigation steps and outcome for at least these routes: first file analysis; local CLI project; self-hosted team setup; database connection/read/refresh; notebook creation and edit; React embed. Use live routes when accessible, otherwise label source-derived paths.
Create anchored scorecards (0-5 with definitions and evidence) for landing clarity/feature discoverability/audience routing/proof and docs findability/first success/task guidance/reference/explanation/mode clarity. Apply comparable criteria to competitors; do not invent conversion data. Explain uncertainty. Produce a page inventory mapping each docs topic to primary audience, primary purpose, Diataxis fit, mixed-content problem, and proposed disposition. Distinguish content, navigation, implementation, and product gaps.
Each recommendation needs stable ID, affected user/job, problem, repository and external evidence, smallest useful change, cost, benefit, alternative, confidence, and observable acceptance check. Include what to keep, fix now, explore, defer, and avoid. Every major recommendation must be traceable to evidence. Reject unsupported scope and attractive but costly redesigns.

## Required outputs

Produce downloadable Markdown report `landing-docs-review.md`, `sources.md`, `page-inventory.csv`, and `recommendations.json`. Bundle them as `exploreda-landing-docs-review.zip` with a manifest of names and SHA-256 hashes; also link each standalone file. If file creation is unavailable, return complete contents in the response and explicitly state no files or commits were created.

The report must stand alone and include:

- Executive judgment with strengths, weaknesses, and proposed audience/positioning decision.
- Baseline/access record, feature truth matrix, live-vs-source drift, and method/limits.
- Landing audit and competitor comparison, with 2-3 contrasting content hierarchies and a selected proposal. Include section order, CTA intent, proof assets, and routes to the priority docs; draft only short illustrative labels, not a full marketing rewrite.
- Docs audit against Diataxis and the additional chosen principles; competitor comparisons; page inventory summary; proposed navigation and canonical-page boundaries; at least three concrete before/after page outlines, including database sources, notebooks, and self-hosting.
- Prioritized improvement plan with small milestones. Pair each user-visible feature with its docs page/section and demo example or explicitly state an example gap. Keep research recommendations distinct from approval to implement.
- A proof plan with observable user-task gates, key risks, open decisions, rejected alternatives, and checks actually run versus proposed.

JSON must parse and contain recommendation IDs, priority, classification, audience/job, evidence refs, proposal, cost, confidence, and acceptance checks. Sources must include titles, exact URLs, access dates, supported claims, and source type. CSV must cover all 47 baseline pages or explain a verified different count. No hidden external dependencies in deliverables.

Success requires evidence-backed answers to both main questions and comparative findings for both surfaces, all three priority capabilities accurately represented, a useful whole-docs inventory, a ranked plan proportional to this project, readable artifacts, and explicit limits. Missing decisive evidence or any unanswered priority question must be stated as partial/NO-GO, not papered over with generic advice. Open product choices may remain proposals for review. Codex may submit at most two focused follow-ups for material gaps.

Final response: provide all artifact links, 5-8 key findings, access status/baseline, pages and sources inspected, checks actually run, unverified claims, and unresolved questions. Do not create local Git commits, pushes, or PRs; Codex owns integration.
