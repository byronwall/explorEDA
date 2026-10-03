# Research the documentation system for explorEDA

https://github.com/byronwall/explorEDA

## Mission

Research and recommend the best documentation system for this repository. The docs must build as static files alongside the demo and deploy through GitHub Pages. They will contain many images. They should ideally embed interactive examples of the actual React charts and other components.

Help a solo developer choose between extending the current demo and adding a documentation tool. Recommend one approach, one fallback, and a small proof that can reject the recommendation. Do not implement the system during this research.

Use `main` as the primary ref because it drives the Pages deployment. Record the exact inspected commit. This prompt was grounded in local branch `codex/feedback-round-2-tooltip-handoff`, commit `5c92e32a9d7d3e61b7cbf422897cd38555c9a7cd`. Remote branch availability was not verified. Check differences that affect this decision; do not assume that local context matches current `main`.

## Decision context

Byron builds personal projects. Prefer a small system with little maintenance. There is no requirement for a server, CMS, authentication, multiple documentation versions, translations, or a general property playground.

The related initiative is **Chart and rendering documentation**, at `docs/intent/chart-and-rendering-docs/`. It plans task-led pages for eleven registered views and a shared rendering guide. Its September 23 plan favors hand-authored pages within the existing demo. It excludes a new docs framework from the initial scope. Treat that choice as a prior proposal to test, rather than a binding conclusion. The new research question explicitly reopens the content and tooling choice for image-heavy pages and embedded examples.

The target reader includes analysts choosing and operating views, and developers embedding the workspace. Docs must distinguish shipped behavior from planned rendering work.

## Access gate

GO when the exact repository, `main`, initiative documents, demo source, manifests, and deployment workflow are readable. Confirm the owner and repository. Use official web sources to verify current tool capabilities.

NO-GO for a repository-specific recommendation if the repository or required sources are unavailable. Identify the missing evidence and the smallest way to obtain it. You may return a clearly labeled preliminary comparison, but do not call it a completed recommendation.

The GitHub app is read-only. Reading through it is sufficient for research. A missing writable checkout does not block the report. Never claim to have run a build, tested a browser flow, or saved a file unless the tools did so.

## Read the repository first

Read these files in order, then discover related files as needed:

1. `AGENTS.md`, `README.md`, `packages/explorEDA/README.md`, `docs/ui-defaults.md`.
2. `docs/intent/chart-and-rendering-docs/initiative-map.json`, followed by every existing document it maps. Also read `comparative-research.md` in that folder.
3. `package.json`, `pnpm-workspace.yaml`, `apps/demo/package.json`, `packages/explorEDA/package.json`.
4. `.github/workflows/deploy.yml`, `apps/demo/vite.config.ts`, `apps/demo/src/main.tsx`, `apps/demo/src/LandingPage.tsx`.
5. `apps/demo/src/demos/examples.ts`, `apps/demo/src/demos/dashboardSettings.ts`, `apps/demo/src/landing/LiveOrderBook.tsx`, `apps/demo/public/landing/order-book-web.jpg`.
6. `packages/explorEDA/src/charts/registerAllCharts.ts`, `packages/explorEDA/src/components/charts/ChartRenderer.tsx`, `packages/explorEDA/src/providers/DataLayerProvider.tsx`.
7. Relevant sections of `docs/application-feature-inventory.md`, including traceability and reproducibility.
8. `apps/demo/src/LandingPage.test.tsx`, `apps/demo/src/demos/coverage.test.ts`, and `apps/demo/src/landing/LiveOrderBook.test.tsx` for existing validation patterns.

Verified local facts to recheck at the selected ref:

- This is a pnpm workspace. The library and demo use React and TypeScript. Keep that stack.
- The root manifest specifies pnpm 11.9.0. The demo uses Vite 6 and React 19.
- `main.tsx` mounts `LandingPage` inside `BrowserRouter`. Landing navigation uses `?example=` and `?view=coverage`.
- The landing page loads `ExplorEda` with React `lazy` and `Suspense`.
- The library requires browser APIs, including Canvas. The 3D chart requires WebGL. Any static rendering solution must handle this boundary.
- The package supports desktop workspaces at 1024 CSS pixels or wider. Docs text and images should still work on narrow screens. Do not turn this into a mobile chart redesign.
- The registry contains row, bar, scatter, line, boxplot, 3d-scatter, pivot, data-table, summary, color-legend, and markdown.
- The deploy workflow builds workspace packages and uploads only `apps/demo/dist` to Pages.
- Vite sets `base: "/"`; README links to `https://exploreda.dev`. The initiative instead states `/explorEDA/`. Resolve this inconsistency before proposing URL or asset rules.
- The deploy workflow specifies Node 20 and pnpm 8. This differs from the root pnpm setting and release guidance for Node 24. Identify any required deployment alignment without expanding into an unrelated CI audit.
- The initiative names example IDs such as `line-chart`, `tables`, and `color-legend`. These are absent from the inspected current example list. Treat that table as planning evidence, not a verified catalogue.

Available commands, if a checkout exists:

```sh
pnpm install
pnpm --filter demo dev
pnpm --filter demo build
pnpm --filter demo preview
pnpm --filter demo check-types
pnpm --filter demo test
pnpm check:ui
pnpm check
```

These are existing commands, not a requirement to install or execute the project during research. Record which checks you actually run.

## Priority questions

1. **Which system best fits this repo?** Compare the existing Vite/React app with Markdown or MDX support against a small shortlist of current tools. Consider Docusaurus, Astro/Starlight with React integration, and a React-focused MDX docs option such as Nextra. Verify present capabilities before including them. Reject unsuitable candidates early. Do not reward a tool for features this project does not need.
2. **How will real interactive examples work?** Show how each serious option mounts the existing React package, loads its CSS and fixtures, and handles browser-only Canvas/WebGL code. Compare direct embeds, isolated iframe examples, and links to full demo states. Distinguish a small component example from a full linked workspace. Can a chart run through the public package API today? If not, explain the least costly supported alternative. Do not invent a public standalone chart API.
3. **What is the build and hosting arrangement?** Can docs and demo remain one static deployment? Specify directories, build order, output assembly, URL ownership, direct URL refresh behavior, and asset paths. Evaluate both the current root/custom-domain setup and GitHub project subpaths. Explain any competing routers or separate React runtimes. No server rewrites or hosted backend may be required.
4. **How easy is image-heavy authoring?** Compare Markdown/MDX authoring, image imports, captions, alt text, responsive sizing, diagrams, side-by-side figures, and screenshot replacement. Explain what works at build time versus in the browser. Include navigation, headings, code blocks, and search only where they earn their cost.
5. **What is the ongoing cost?** Assess added dependencies, configuration, framework upgrades, duplicate styles, content reuse, and example drift. Estimate implementation effort with explicit assumptions. Explain when the existing app stops being the simplest approach.
6. **What changes in the initiative?** List precise proposed changes to the map, intent brief, shape brief, and implementation plan. Explain which old constraints to retain or replace. Keep these as proposed edits in the report; do not modify those files.

## Evidence and comparison rules

Use current official documentation, official repositories, and release notes for technical claims. Cite direct URLs and access dates. Distinguish observed repo facts, documented tool capabilities, inferences, and untested hypotheses.

Each recommendation must connect to exact repository paths and relevant symbols. Confirm that static export, MDX components, React support, asset handling, and browser-only examples work together. Generic product claims are insufficient.

Use a compact comparison table. Score only task-specific dimensions: static Pages fit, actual React examples, image authoring, integration cost, and maintenance. Explain the evidence behind scores. A hard failure overrides a favorable total. Do not claim measured bundle size or build time without measurement.

Evaluate the existing demo fairly. Do not require a framework, and do not exclude one solely because the old plan did. State a concrete reason for the chosen approach and for rejecting the nearest alternative.

## Scope and acceptance gates

Research only. Do not change app code, dependencies, Git state, deployment, or initiative artifacts. Do not create commits, pushes, or PRs. Do not build a CMS, generated API pipeline, universal playground, or new chart API.

A recommendation is GO only if evidence supports all of these:

- Static output can coexist with the demo in one GitHub Pages deployment.
- Image-heavy pages have a clear authoring and asset workflow.
- At least one feasible path uses actual interactive explorEDA examples.
- Browser-only code has an explicit mount boundary.
- Direct links, refreshes, and deployment base paths have a concrete solution.
- The maintenance cost fits a solo developer and is compared with the existing app.

Mark a candidate NO-GO if it needs a runtime server, breaks demo URLs, cannot run the React examples, or needs an unjustified rewrite. Missing evidence for a hard gate means provisional status, not acceptance.

Stop when one recommendation and one viable fallback have evidence for all gates. If all candidates fail, report no fit and the smallest requirement or technical boundary that must change. Do not invent certainty to finish.

## Required report

Produce a standalone Markdown report named `docs/research/documentation-system-recommendation.md`. Treat this as the suggested save path for the research result. Return the complete report in your response. If artifact export is available, also provide it as a downloadable Markdown file. Do not assume the GitHub connection can write the path.

Include:

1. Recommendation, confidence, and the main tradeoff.
2. Inspected ref, access limits, and repository findings.
3. Shortlist table with evidence and rejected alternatives.
4. Proposed build/output/URL arrangement, with a small diagram.
5. One illustrative image-heavy chart page with a real React example boundary. Label untested code as illustrative.
6. Proposed changes to the existing initiative, grouped by file.
7. A bounded proof: scatter and bar pages plus a rendering-guide page. Define checks for images, keyboard use, filter behavior, direct URL refresh, and widths of 1280, 783, and 390 pixels. Keep chart support limits clear. Set rejection conditions and a rollback path.
8. Remaining uncertainties and what evidence would resolve them.

Do not declare success until every priority question has an answer and all hard gates have evidence or an explicit unresolved status. End with a short status: GO, provisional, or NO-GO; chosen system; inspected commit; checks actually run; unresolved blockers; artifact delivery method.
