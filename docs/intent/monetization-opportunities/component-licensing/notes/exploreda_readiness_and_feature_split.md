# explorEDA commercial readiness audit and free/paid feature split

Audit date: 2026-10-10. Repository audited read-only at commit `29b4023` (worktree `claude/monetization-saas-research-9a5bcf`, clean tree). All web sources accessed 2026-10-10. Local file references are relative to the repository root. `pnpm --filter exploreda build` was run once (dist did not exist); `dist/` is git-ignored, so the tree stayed clean. `pnpm check` was not run.

Convention in this file: **[FACT]** = read directly from the repo or a fetched page. **[INFERENCE]** = my judgment from those facts.

## Key question 1: What does explorEDA ship today? (feature inventory and public API)

### Takeaway

explorEDA is a React 18/19 workspace component (`exploreda@0.1.0` on npm, published 2026-09-27) with 20 registered view types, Crossfilter-backed linked filtering, a formula/DSL layer, a multi-table "project" mode with worker execution, host slots (side panels, toolbar slots, read-only), and JSON/text save formats. It is React-only, desktop-only (1024px+), CSR-only in practice, and ships a ~191 KB gzip full bundle plus 34 KB gzip CSS.

### Cited Findings

**Package and entry points**
- Package name `exploreda`, version `0.1.0`, `"private": false`, `publishConfig.access: public`, peer deps `react`/`react-dom` `^18 || ^19`. No `license` field, no `engines`, no `browserslist`, no `sideEffects` field. — [packages/explorEDA/package.json](../../packages/explorEDA/package.json)
- npm registry: `latest = 0.1.0`, modified `2026-09-27T01:55:34Z`; `npm view exploreda license` returns nothing (no license recorded on the registry). — `npm view exploreda version license dist-tags time.modified` run 2026-10-10
- GitHub repo `byronwall/explorEDA` is PUBLIC, `licenseInfo: null`, 0 stars, 0 forks, 6 open issues. — `gh repo view` / `gh issue list` run 2026-10-10
- Exports map: `.` (ExplorEda), `./core` (chart registry), `./charts/*` (16 per-chart entries), `./calculations`, `./analysis`, `./dist/ExplorEda.css`; `bin: exploreda-dsl`. ESM + CJS, types per entry. — [packages/explorEDA/package.json](../../packages/explorEDA/package.json), [packages/explorEDA/entries.json](../../packages/explorEDA/entries.json)
- Build: tsup with `splitting: true`, `treeshake: true`, `external: ["react"]` only (react-dom is not externalized in the lean-bundle check). Declarations written by `scripts/build-types.mjs`. — [packages/explorEDA/tsup.config.ts](../../packages/explorEDA/tsup.config.ts)
- The main entry `ExplorEda.tsx` calls `registerAllCharts()` at module scope and imports `../index.css`, so importing `exploreda` registers all 20 charts as a side effect. — [packages/explorEDA/src/components/ExplorEda.tsx](../../packages/explorEDA/src/components/ExplorEda.tsx) lines 75-76
- Per-chart entries exist for 16 charts: bar, box-plot, calendar, color-legend, data-table, heatmap, ecdf, line, markdown, map, metric-card, parallel-coordinates, pivot-table, row, sankey, scatter, summary-table, three-d-scatter. `composition` and `scatter-matrix` are registered but have **no** `./charts/*` entry. — [entries.json](../../packages/explorEDA/entries.json) vs [registerAllCharts.ts](../../packages/explorEDA/src/charts/registerAllCharts.ts)

**Bundle size (measured from a fresh build, 2026-10-10)**
- `dist/ExplorEda.js` 900,692 B raw / 191,182 B gzip; `dist/ExplorEda.cjs` 946,645 B / 193,789 B gzip; `dist/ExplorEda.css` 222,426 B / 33,685 B gzip; `dist/analysis.js` 19,032 B / 4,252 B gzip; `dist/core.js` 192 B. Total ESM JS (excluding maps and CLI) 2,333,962 B raw / 514,720 B gzip (includes code-split chunks shared across entries, so not additive with the main bundle). CLI `dist/cli/exploreda-dsl.js` 2.14 MB. — build log and `gzip -c | wc -c` on dist
- `verify:lean` (register only the bar chart via `./core` + `./charts/bar`, react external, react-dom bundled): 995,229 B raw / 221,387 B gzip. The feature inventory doc records an earlier value of 742,700 B / 162,129 B gzip. — [packages/explorEDA/scripts/verify-lean-bundle.mjs](../../packages/explorEDA/scripts/verify-lean-bundle.mjs); [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Scope and evidence"
- Dependencies in the runtime graph include 15 Radix packages, 6 TipTap packages, `three`, `crossfilter2`, five d3 modules, `react-grid-layout`, `zustand`, `ohm-js`, `world-atlas`, `next-themes`, `sonner`, `cmdk`, `lucide-react`, `@tailwindcss/postcss`. — [packages/explorEDA/package.json](../../packages/explorEDA/package.json)

**Chart/view types registered (20)**
- `row`, `bar` (histogram, category count, grouped measure, grouped/stacked/100% series), `scatter` (points, bubbles, density bins, hex bins, smoothed density, linear/polynomial/LOESS fits, marginals), `line` (raw or UTC day/week/month/year summaries; line, area, stacked area), `boxplot` (box, violin, observations), `3d-scatter` (WebGL), `pivot`, `data-table`, `summary`, `color-legend`, `markdown` (TipTap), `heatmap`, `calendar` (calendar heatmap), `metric-card`, `map` (point map with bundled World Atlas; region map via GeoJSON join), `sankey`, `parallel-coordinates`, `scatter-matrix`, `ecdf`, `composition` (blank artboard holding chart units, copy-as-PNG). — [registerAllCharts.ts](../../packages/explorEDA/src/charts/registerAllCharts.ts); [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Catalogue at a glance"; [.changeset/](../../.changeset/) (112 pending changeset files describing these features)
- The root README's "Chart types include ..." sentence lists only 12 types. — [README.md](../../README.md) line 29
- The package README does not mention `composition` or `scatter-matrix` (0 matches). — grep on [packages/explorEDA/README.md](../../packages/explorEDA/README.md)

**Linked filtering, data layer, tracing**
- One zustand store and one Crossfilter instance per workspace; every chart adds a dimension. Click a mark to select, click empty plot to clear that chart's filters. — [docs/agent-guide.md](../../docs/agent-guide.md); [AGENTS.md](../../AGENTS.md)
- Row tracing: Alt-click / Alt-Enter on a mark opens a trace with contributors, exclusions, domains; pivot cells and grouped summaries expose exact source IDs. — [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Traceability and reproducibility"
- Field settings: labels, type overrides, null tokens, date presets, units, currency, formats, precision; field inspector preview. Named grouped summaries (`aggregates`). — [packages/explorEDA/README.md](../../packages/explorEDA/README.md) "Saved data shape"

**Calculations and DSL**
- Calculated fields are formula text (`SavedCalculation { resultColumnName, expression }`) parsed by an ohm-js grammar; editor previews drafts; dependency chains inspectable. `./calculations` entry exports `parseExpression` and `ParsedExpression`. — [packages/explorEDA/README.md](../../packages/explorEDA/README.md); [src/lib/calculations/parser/semantics.ts](../../packages/explorEDA/src/lib/calculations/parser/semantics.ts)
- Dashboard text DSL: `compileDocument`, `compileViews`, `exportDocument`, `exportViews`, `formatDslDiagnostics`, `highlightDsl`, `describeDslSource`, `DSL_REFERENCE`; CLI `exploreda-dsl fields|check|reference` with exit codes 0/1/2 and `--json`. — [packages/explorEDA/README.md](../../packages/explorEDA/README.md) "Dashboard text"; [ExplorEda.tsx](../../packages/explorEDA/src/components/ExplorEda.tsx) lines 198-222

**Project mode (multi-source)**
- `exploreda/analysis` (no React): `evaluateAnalysisQuery`, `parseAnalysisProject`, `stringifyAnalysisProject`, `selectAnalysisProjectView`, `createAnalysisWorker`; types for sources, relationships (cardinalities), steps (source, lookup, expand, calculate, filter, group). — [src/analysis.ts](../../packages/explorEDA/src/analysis.ts); [src/types/AnalysisProject.ts](../../packages/explorEDA/src/types/AnalysisProject.ts)
- `ExplorEdaProject` props: `project`, `tables`, `view`, `sidePanels`, `queryPresets`, `onProjectChange`, `onStateChange`, `onOpenView`, `readOnly`, `createWorker`, `toolbarStart`, `toolbarEnd`. Schema and Query panels; worker requires bundler support for `new URL(..., import.meta.url)`. — [src/components/ExplorEdaProject.tsx](../../packages/explorEDA/src/components/ExplorEdaProject.tsx) lines 42-71; [packages/explorEDA/README.md](../../packages/explorEDA/README.md) "Related tables"

**Host integration surface**
- `ExplorEda` props: `data`, `fieldNames`, `savedData`, `onStateChange`, `sidePanels`, `readOnly`, `toolbarStart`, `toolbarEnd`; ref handle `getSettings()`. — [ExplorEda.tsx](../../packages/explorEDA/src/components/ExplorEda.tsx) lines 78-99
- Exported types: `SavedDataStructure`, `SavedAnalysisStructure`, `SavedCalculation`, `SavedRow/Datum/SpecialValue`, `SavedColumnSettings`, `SavedRowsSettings`, `ViewMetadata`, `FieldSettings*`, `AggregateSpec/Result`, `GeometryAsset`, `RegionGeometry`, `WorkspaceTheme(Id)`, `ChartStyleOverrides`, `ExplorEdaSidePanel`, all `Dsl*` types, all `AnalysisProject` types, `ExplorEdaProjectProps/Change`. Exported functions: DSL set above, `parseSavedData`, `parseSavedAnalysis`, `stringifySavedData`, `stringifySavedAnalysis`, `saveToClipboard`, `saveAnalysisToClipboard`, `validateSavedData`, `validateSavedAnalysis(ForData)`, `formatFieldValue`, `getFieldSettingsError`, `getFieldLabel`, `hasFieldDisplayFormat`. — [ExplorEda.tsx](../../packages/explorEDA/src/components/ExplorEda.tsx) lines 162-228
- Chart settings types (`ChartSettings`, `BaseChartSettings`, per-chart settings) and the `ChartRegistry` interface are reachable only through `./core` / `./charts/*`; `ChartType` and per-chart settings are not re-exported from the root entry. — [src/charts/registry.ts](../../packages/explorEDA/src/charts/registry.ts) exports; root entry export list above

**Saved state and export**
- `SavedDataStructure` fields: `charts`, `calculations`, `gridSettings`, `metadata`, `colorScales`, `rowsSettings?`, `fieldSettings?`, `aggregates?`, `geometryAssets?`, `theme?`. `SavedAnalysisStructure` = `{ format: "exploreda-analysis", version: 1, data, settings, specialValues? }`. — [src/types/SavedDataStructure.ts](../../packages/explorEDA/src/types/SavedDataStructure.ts)
- `migrateDataVersion` is a no-op ("Currently we only have version 1, so no migration needed"). — [src/utils/saveDataUtils.ts](../../packages/explorEDA/src/utils/saveDataUtils.ts) line 973-976
- Export paths: settings JSON and full analysis JSON to clipboard; table CSV; summary CSV; dashboard text; composition copy-as-PNG. "Other charts have no image, SVG, PDF, or dashboard export." No server storage, no share URL. — [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Saved state, exports, and host integration"

**Theming, dark mode, browsers, screens**
- Themes: Compact (default), Newsprint, Report; CSS custom properties (`--eda-headline-*`, `--eda-axis-*`, `--eda-heat-*`, `--eda-panel-*`); `[data-eda-theme]` selectors; no bundled fonts. — [packages/explorEDA/README.md](../../packages/explorEDA/README.md) "Themes and styling"
- Dark mode uses a `.dark` ancestor class (`@custom-variant dark (&:is(.dark *))`); no `prefers-color-scheme` handling in package CSS (0 matches). — [src/index.css](../../packages/explorEDA/src/index.css) lines 8, 74
- Styling is Tailwind v4 + shadcn-style tokens (`--background`, `--primary`, `--border`, etc.) compiled into `dist/ExplorEda.css` (222 KB raw). — [src/index.css](../../packages/explorEDA/src/index.css); dist listing
- Browser requirement statement: "DOM, Canvas 2D, `ResizeObserver`, `matchMedia`, `requestAnimationFrame`, and `URL.createObjectURL`"; 3D needs WebGL; copy needs Clipboard API. No browser name/version matrix. Desktop 1024 CSS px or wider; "Narrow and mobile layouts are outside the supported product scope." — [packages/explorEDA/README.md](../../packages/explorEDA/README.md) "Browser requirements"
- SSR/Next.js: zero mentions of SSR, Next.js, or server-side rendering in README, package README, or docs/*.md (one unrelated mention in a transcript analysis). Only 6 `typeof window` guards in src. The package is `"type": "module"` with CJS also emitted. — grep on docs and src

**Accessibility, keyboard, i18n**
- 155 TSX files use `aria-label`; 67 use `role=`. Keyboard shortcuts dialog (`?`) lists `F`, `Shift+F`, `R`, `Esc`, `Tab`, `S`, `D`, `X`, `V`, `C`, `Enter/Space`, `Alt+Enter`, `Cmd/Ctrl+Enter`, markdown shortcuts. — grep; [src/components/KeyboardShortcutsDialog.tsx](../../packages/explorEDA/src/components/KeyboardShortcutsDialog.tsx)
- Self-assessment: "These measures do not make Canvas/WebGL points individually accessible. Brush creation remains pointer-driven. Expanded panels and every settings flow were not audited for complete focus behavior. Chart layout drag/resize does not have a verified equivalent keyboard workflow." "This is a source-based audit ... not a complete browser, visual, accessibility, or performance certification." — [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Accessibility, errors, and supported screens"; "Scope and evidence"
- i18n: no i18n framework; a handful of files call `toLocale*`/`Intl` for number/date formatting; all UI copy is hardcoded English. — grep (10 files matched `Intl.|toLocale`; 0 matched `i18n|useTranslation`)

**Data size and performance**
- "On 2026-09-20, a desktop browser walkthrough covered a 10,000-row sample. This does not establish a general capacity envelope. There was no size sweep, memory profile, frame-rate test, or long-session stability run." "There is no worker-thread calculation service, server aggregation, query pushdown, streaming, progressive result display." — [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Performance and resource use"
- Known trap: a per-row lookup inside a filter function took "34 s for one click at 27,000 rows." — [docs/agent-guide.md](../../docs/agent-guide.md) "Traps"
- Demo ships a 10,000-row Shop Operations fixture as its largest dataset. — [apps/demo/public/datasets/README.md](../../apps/demo/public/datasets/README.md)

**Tests and CI**
- 135 `*.test.ts(x)` files in the package, 12 in the demo. Vitest + Testing Library + jsdom. — `find` count; [docs/agent-guide.md](../../docs/agent-guide.md) "Tests"
- GitHub workflows: `release.yml` (changesets, npm trusted publishing/OIDC, runs `pnpm check` only at publish) and `deploy.yml` (GitHub Pages for the demo, pinned to pnpm 8 / Node 20 while the repo requires pnpm 11.9.0). There is **no** CI workflow that runs tests on pull requests. — [.github/workflows/](../../.github/workflows/); [package.json](../../package.json) `packageManager`
- `pnpm audit --prod` reports moderate advisories in transitive demo deps (vite 6.2.x, react-router 7.3.0), none attributed to the `exploreda` package graph in the first results. — `pnpm audit --prod --json` run 2026-10-10 (demo-only paths shown)

**Demo**
- Live demo at exploreda.dev (GitHub Pages): landing page, curated examples (`/examples/:id`), `/viewer` with localStorage persistence, CSV/JSON upload, saved view tabs, undo/history timeline, Dashboard text panel, chart docs and coverage matrix pages. Seven curated analyses incl. a multi-source shop project. — [README.md](../../README.md); [apps/demo/src/routes.ts](../../apps/demo/src/routes.ts); [apps/demo/src/](../../apps/demo/src/); [apps/demo/PRODUCT.md](../../apps/demo/PRODUCT.md)
- Demo dataset licenses are documented (CC0, CC BY 4.0, generated). — [apps/demo/public/datasets/README.md](../../apps/demo/public/datasets/README.md)

### Inferences

- [INFERENCE] The product surface is unusually broad for a 0.1.0 package (20 views, DSL, project mode, tracing). Breadth is not the gap; packaging, assurance, and documentation of commitments are.
- [INFERENCE] The "tree-shakeable per chart" story is real at the export-map level but weak in practice: the lean check still yields ~221 KB gzip because the workspace shell (Radix, TipTap for markdown, zustand, react-grid-layout, Tailwind CSS) is shared, and `exploreda` root registers everything. A buyer measuring `bundlephobia`-style numbers will see ~190-220 KB gzip JS + 34 KB CSS regardless.
- [INFERENCE] `composition` and `scatter-matrix` lacking `./charts/*` entries means a "register only what you need" consumer cannot get them without the root entry; this reads as an incomplete export map.
- [INFERENCE] The module-scope `registerAllCharts()` and CSS import in the root entry, plus Canvas/WebGL/ResizeObserver reliance, make the component CSR-only in effect. Next.js App Router users would need `"use client"` plus `dynamic(..., { ssr: false })`; nothing documents this.
- [INFERENCE] The saved-data format is version 1 with a no-op migration; a buyer storing `SavedDataStructure` in their database has no stated guarantee that a future release will read it.

### Gaps

- No measured bundle numbers for a consumer bundling with react-dom external (the lean script bundles react-dom); the true incremental cost to a host that already has React is lower than 221 KB gzip but was not measured.
- No Lighthouse/axe run was performed in this audit; accessibility status comes from the repo's self-assessment only.
- I did not open the live demo at exploreda.dev in a browser; features were taken from source and docs.

## Key question 2: Which credibility, legal, and packaging artifacts exist or are missing?

### Takeaway

The repo has no LICENSE at any level, no `license` field in `package.json` or on npm, no SECURITY.md, CONTRIBUTING.md, CLA, code of conduct, PR CI, browser matrix, accessibility statement, support policy, versioning/stability policy, or docs site. It does have a real changelog pipeline (Changesets + release workflow), 112 unreleased changesets, a live demo, and extensive internal docs.

### Cited Findings

- **No LICENSE file** at repo root, in `packages/explorEDA`, or in `apps/demo` (`find -iname "LICENSE*"` returned nothing). `gh repo view` reports `licenseInfo: null`. — repo listing 2026-10-10
- **No `license` field** in `packages/explorEDA/package.json`; `npm view exploreda license` prints nothing. — [packages/explorEDA/package.json](../../packages/explorEDA/package.json)
- **No SECURITY.md, CONTRIBUTING.md, CLA, CODE_OF_CONDUCT.md** anywhere in the tree (`ls SECURITY* CONTRIBUTING* CLA* CODE_OF_CONDUCT*` → no matches). — repo listing
- **Changelog exists**: [packages/explorEDA/CHANGELOG.md](../../packages/explorEDA/CHANGELOG.md) (46 lines, 0.0.2 → 0.1.0). 112 `.changeset/*.md` files are pending, i.e. a large unreleased delta since 0.1.0 (published 2026-09-27). Release process is documented in README "Release". — [.changeset/](../../.changeset/); [README.md](../../README.md)
- **Stability policy**: "During current development, breaking API changes are acceptable. Do not add compatibility layers without a concrete need." — [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Product direction and package boundary". AGENTS.md: "While the version is 0.x, a breaking API change is `minor`." — [AGENTS.md](../../AGENTS.md)
- **Docs site**: none. `docs/` holds Markdown for agents and internal intent/review records (`docs/intent/*`, `docs/reviews/*`, `docs/research/*`, transcripts); the only user-facing docs are the two READMEs and the demo's in-app Chart docs page. — [docs/](../../docs/); [apps/demo/src/ChartDocs.tsx](../../apps/demo/src/ChartDocs.tsx)
- **Public repo contains internal working material**: `AUDIT.md` ("The current release is not safe to extend yet. Several basic checks fail"), `UI_UX_AUDIT.md`, `TODO.md`, `.cursorrules`, `pgm/` product-grid data, `docs/transcripts/`. — [AUDIT.md](../../AUDIT.md) dated 2026-09-14; repo listing
- **Support channel**: none stated (no email, Discord, issue template, or SLA language in READMEs). 6 open GitHub issues. — grep on READMEs; `gh issue list`
- **Security posture**: no telemetry or network calls in the package (`fetch(`/`XMLHttpRequest`/`sendBeacon` → 0 non-test matches); npm trusted publishing with provenance (`NPM_CONFIG_PROVENANCE: true`, OIDC). No SBOM, no audit, no disclosure contact. — grep; [.github/workflows/release.yml](../../.github/workflows/release.yml)
- **Framework coverage**: React only; peer deps React 18/19. — [packages/explorEDA/package.json](../../packages/explorEDA/package.json)
- **TypeScript**: first-party `.d.ts`/`.d.cts` per entry; compiled with TS ~5.4.5. — dist listing; package.json
- **Repo identity mismatch**: root package is named `data-viz` v0.0.1; demo is `demo` v0.0.6; the npm package is `exploreda` 0.1.0. — [package.json](../../package.json); [apps/demo/package.json](../../apps/demo/package.json)

### Inferences

- [INFERENCE] With no license anywhere, the code is all-rights-reserved by default. The public GitHub repo + public npm package therefore give nobody a usage grant, which is both a legal exposure for any current user and the single most common automated "red" in corporate license scanners (see Key question 3).
- [INFERENCE] The 112 pending changesets mean npm `0.1.0` is materially behind the demo and READMEs (which describe maps, sankey, DSL, project mode, themes). A buyer trying the npm package gets a different product than the demo shows.
- [INFERENCE] Publishing `AUDIT.md`/`TODO.md`/transcripts in the public repo undercuts credibility; a prospect's engineer will read "not safe to extend yet" before they read the README.
- [INFERENCE] The absence of PR CI means a buyer cannot see green checks on the repo; combined with 0 stars and a single-maintainer `git shortlog` (753 commits by Byron Wall, the rest by agents/bots), bus-factor is visible.

### Gaps

- I did not search npm for existing name conflicts or trademark issues around "explorEDA".
- I did not verify whether any transitive runtime dependency has a non-permissive license (e.g. via `license-checker`); all listed direct deps are MIT/ISC/BSD to my knowledge but this was not run.

## Key question 3: What do paying companies check before buying a commercial UI component, and what do vendors publish?

### Takeaway

Buyer checklists (vendor-authored and university procurement pages) converge on: license clarity, documented accessibility conformance (WCAG 2.2 AA + VPAT/ACR), a browser support matrix, LTS/backward-compatibility policy, changelog and migration guides, guaranteed support response times, a vulnerability-handling process, TypeScript types, bundle size/tree-shaking, docs with runnable examples, and total cost of ownership. AG Grid, MUI, Handsontable, Highcharts, and Syncfusion each publish most of these as explicit pages.

### Cited Findings

**Buyer-side criteria**
- Sencha's "10 criteria that actually matter" (2026-07-14): component breadth, grid performance, browser compatibility, TypeScript support (first-party types, generics), documentation quality (runnable examples, migration guides), enterprise support ("guaranteed response times, a clear escalation path ... the vendor's process for handling security vulnerabilities"), backward compatibility (changelogs, deprecation windows), bundle size (tree-shaking verified with analysis tools), accessibility ("prefer libraries that publish their conformance documentation", WCAG 2.2), licensing and TCO. — [Sencha](https://www.sencha.com/blog/how-to-evaluate-ui-component-libraries-10-criteria-that-actually-matter/), accessed 2026-10-10
- Handsontable's enterprise checklist (2023-02-01, updated 2025-09-29): reviews/testimonials, "examining product licensing terms" incl. jurisdiction, accessibility and performance benchmarks, vulnerabilities (CVSS), dependency count, training/support, lifetime cost ("enterprise tools are often used for five to ten years"), what happens if the product becomes unavailable, ISO 27034/9001/GDPR, insurance, SLA with "penalties, disputes, and exit strategy", roadmap, code escrow, premium support, white papers, demo apps, documentation. — [Handsontable blog](https://handsontable.com/blog/choosing-the-enterprise-javascript-ui-component-the-checklist), accessed 2026-10-10
- University procurement: Yale tells units to "request a VPAT (Accessibility Conformance Report) from the vendor prior to purchase" (WCAG 2.1 A/AA, dated within 18 months); Stanford expects documentation within 12 months; University of Montana: bids "without a completed VPAT may be disqualified"; Louisiana: without one "procurement should not proceed". — [Yale](https://usability.yale.edu/digital-accessibility/procurement), [Stanford](https://uit.stanford.edu/accessibility/procurement), [U. Montana](https://www.umt.edu/accessibility/electronic-accessibility/guidelines/procurement/default.php), [Louisiana](https://louisiana.edu/accessibility/training-resources/voluntary-product-accessibility-templates-vpats), accessed 2026-10-10 (search summaries; pages not fetched individually)
- Missing license: industry sources say a package with no license gives "no grant to use the code"; companies run license scanners in CI with allowlists that fail the build on unlicensed packages; ~5% of npm packages have no license (PkgPulse estimate, unverified methodology). — [Black Duck](https://www.blackduck.com/blog/node-js-license-security-risks.html), [safeguard.sh](https://safeguard.sh/resources/blog/nodejs-license), [PkgPulse](https://www.pkgpulse.com/guides/license-distribution-npm-ecosystem), accessed 2026-10-10
- Security questionnaires: for enterprise deals "the absence of a SOC 2 report needs an explanation and compensating evidence"; buyers also ask for pen-test summaries, DPA, subprocessor list, cyber-insurance certificate; lighter VSAQ/MVSP self-assessments are "often acceptable for smaller deals". No source addressed npm-library vendors specifically. — [Strike Graph](https://www.strikegraph.com/blog/security-questionnaires), [ComplyDog](https://complydog.com/blog/documents-buyers-request-with-security-questionnaires), accessed 2026-10-10
- A public GovStack component-library evaluation scored candidates on accessibility, license (flagging "a premium version?" as a future-risk concern), bundle size (noting "most modern kits are tree-shakeable" so raw size is a weak signal), and maintenance. — [GovStack wiki](https://govstack-global.atlassian.net/wiki/spaces/DEMO/pages/96043009/Component+Library+Evaluation), accessed 2026-10-10 via search summary; direct fetch returned empty content

**What vendors publish**
- **AG Grid licensing**: Community is MIT; Enterprise "requires a commercial, EULA licence"; Enterprise-only features: Server-Side Row Model, Excel Export, Pivot & Aggregations, Range Selection, Integrated Charts, Master/Detail, Row Grouping, Clipboard, Tool Panels, Context Menu & Sidebars. Enforcement: without a key the grid "will display a watermark and an error message in the console"; 30-day trial; licences "per-developer, per-deployment", perpetual with one year of updates. — [AG Grid licensing](https://www.ag-grid.com/react-data-grid/licensing/), accessed 2026-10-10
- **AG Grid browsers**: Chrome, Firefox, Edge, Safari "Two latest major versions"; iOS Safari and Chrome iOS/Android two latest. — [AG Grid supported browsers](https://www.ag-grid.com/react-data-grid/supported-browsers/), accessed 2026-10-10
- **AG Grid accessibility**: references WCAG 2.0 A/AA/AAA, ADA, Section 508; "amongst the best support for accessibility compared to other grids"; tested with JAWS and VoiceOver; no VPAT/ACR on the page; documents known limitations (SSRM row count, grouped columns). — [AG Grid accessibility](https://www.ag-grid.com/react-data-grid/accessibility/), accessed 2026-10-10
- **AG Grid LTS** (2024-12-19): maintains `v32-lts` and `v10-lts` with "essential bug fixes", "critical security patches", "no new features"; Enterprise customers report via Zendesk; no stated LTS end date. — [AG Grid blog](https://www.ag-grid.com/blog/introducing-long-term-support-for-ag-grid-and-ag-charts/), accessed 2026-10-10
- **Handsontable LTS**: Current 6 months → Active LTS 10 months (critical bug + security fixes) → Maintenance LTS 14 months (security only), ~30 months total; even-numbered majors are LTS; "New features are never backported". — [Handsontable LTS](https://handsontable.com/docs/react-data-grid/long-term-support/), accessed 2026-10-10
- **Handsontable security**: annual independent audits (Seqred 2022; TestArmy 2023, 2024, 2025, 2026-07-09) against OWASP Top 10/ASVS, reports via support; Snyk, Fossa (license compliance), CSP guidance, `security@handsontable.com` disclosure address, Lloyd's of London insurance, Codekeeper code escrow add-on; no bug bounty, no SBOM mentioned. — [Handsontable security](https://handsontable.com/docs/react-data-grid/security/), accessed 2026-10-10
- **MUI X licensing**: open-core; MIT packages `@mui/x-data-grid`, `-date-pickers`, `-charts`, `-tree-view`, `-scheduler`; Pro/Premium are supersets as `-pro`/`-premium` packages; license key "checked without making any network requests"; failure shows watermark + console warning but "end users can still use the component"; seats = concurrent front-end developers; 30-day non-production trial; updates for one year, production use of covered versions forever. — [MUI X licensing](https://mui.com/x/introduction/licensing/), accessed 2026-10-10
- **MUI pricing**: Community free; Pro $299/yr/dev; Premium $599/yr/dev; Enterprise $1,399/yr/dev from 15 seats with "guaranteed response time of 1 business day", CSM, escalation; "Security questionnaires and custom agreements" available for orders ≥ $12,000; up to 7% annual increase at renewal. — [MUI pricing](https://mui.com/pricing/), accessed 2026-10-10
- **MUI browser support**: Edge ≥121, Firefox ≥121, Chrome ≥117, Safari ≥17; Node ≥14 for SSR; "You don't need to provide any JavaScript polyfill". — [MUI supported platforms](https://mui.com/material-ui/getting-started/supported-platforms/), accessed 2026-10-10
- **Highcharts accessibility**: Accessibility module included with every license; targets "the international WCAG 2.2 standard" and Section 508; explicit disclaimer that "the final responsibility for standards compliance of the resulting web content has to be with the user of Highcharts". — [Highcharts compliance](https://www.highcharts.com/docs/accessibility/compliance), accessed 2026-10-10
- **Syncfusion accessibility**: "All Syncfusion components are compliant with Section 508, WCAG, and WAI-ARIA guidelines"; keyboard navigation and high-contrast for all components; per-component tables rate WCAG 2.2 AA, Section 508, keyboard, screen reader, RTL, contrast; testing with axe-core plus manual NVDA/Narrator/VoiceOver; VPAT documents linked (per-platform). WCAG version stated inconsistently (2.1 vs 2.2) across pages. — [Syncfusion accessibility](https://www.syncfusion.com/accessibility), [Syncfusion React docs](https://ej2.syncfusion.com/react/documentation/common/accessibility), accessed 2026-10-10

### Inferences

- [INFERENCE] The items that act as hard gates (procurement can say "no" without a technical review) are: a usable license, an accessibility conformance document for public-sector/regulated buyers, and a security contact/questionnaire answer. The items that act as scoring criteria are docs, demos, browser matrix, LTS, bundle size, SSR, TypeScript.
- [INFERENCE] Every vendor studied publishes its free/paid boundary as a feature list on a licensing page and enforces it with a locally-checked key plus a watermark, not a network call. That is the expected shape for a paid explorEDA tier.
- [INFERENCE] For a client-side library that makes no network calls, SOC 2 is rarely demanded; a short security page (no telemetry, provenance-signed releases, dependency scanning, disclosure email) plus willingness to fill a questionnaire covers most mid-market deals. Enterprise deals may still require a questionnaire; MUI only offers that at ≥ $12k orders.

### Gaps

- I found no developer-forum thread that records a specific rejection of a commercial React component with reasons; only vendor-authored checklists and procurement policy pages. Rank ordering below is therefore my synthesis, not a frequency count from buyer data.
- Highcharts and MUI support SLAs beyond the figures above were not retrieved.
- AG Grid LTS support window length was not published on the page fetched.

## Key question 4: Ranked list of gaps that would block or slow a sale of explorEDA

### Takeaway

Ranked by how often the gap blocks a purchase (hard gates first, then scoring criteria), not by engineering interest. Items 1-4 are blockers for nearly every buyer; 5-9 block regulated or large buyers; 10-16 lose points in technical evaluation.

### Cited Findings

Each row: gap, evidence in repo, what buyers/vendors expect.

1. **No license, anywhere (repo, package.json, npm).** [FACT] No LICENSE file; `licenseInfo: null`; no `license` field; npm shows none. Buyers run license scanners that fail unlicensed packages ([Black Duck](https://www.blackduck.com/blog/node-js-license-security-risks.html)); a company cannot legally use the current package at all. Highest-frequency blocker: it is automated and happens before any human evaluation.
2. **No commercial terms at all (EULA, pricing, seat model, trial, perpetual/update window, enforcement).** [FACT] No pricing, licensing page, or key mechanism exists in the repo. Vendors publish per-developer pricing, trial terms, and perpetual-vs-updates rules ([AG Grid](https://www.ag-grid.com/react-data-grid/licensing/), [MUI](https://mui.com/x/introduction/licensing/)). Without these a procurement team has nothing to approve.
3. **npm 0.1.0 is far behind the demo and README (112 pending changesets).** [FACT] [.changeset/](../../.changeset/); npm modified 2026-09-27. Buyers evaluate by installing; mismatch between demo and installed behaviour reads as abandonment or instability.
4. **No stability or versioning promise; docs say breaking changes are acceptable; saved-data migration is a no-op.** [FACT] [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md); [saveDataUtils.ts](../../packages/explorEDA/src/utils/saveDataUtils.ts) line 973. Buyers check "backward compatibility ... length of deprecation windows" ([Sencha](https://www.sencha.com/blog/how-to-evaluate-ui-component-libraries-10-criteria-that-actually-matter/)); vendors publish LTS ([Handsontable](https://handsontable.com/docs/react-data-grid/long-term-support/), [AG Grid](https://www.ag-grid.com/blog/introducing-long-term-support-for-ag-grid-and-ag-charts/)). A host persisting `SavedDataStructure` in its database needs a format guarantee.
5. **No accessibility statement, VPAT/ACR, or audit; self-assessment names unverified keyboard paths for drag/resize and brush, and Canvas/WebGL marks are not individually accessible.** [FACT] [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md) "Accessibility". Public-sector and university buyers disqualify bids without a VPAT ([U. Montana](https://www.umt.edu/accessibility/electronic-accessibility/guidelines/procurement/default.php)); every studied vendor publishes a conformance page ([Syncfusion](https://www.syncfusion.com/accessibility), [Highcharts](https://www.highcharts.com/docs/accessibility/compliance), [AG Grid](https://www.ag-grid.com/react-data-grid/accessibility/)).
6. **No support channel or SLA, single maintainer, no PR CI, 0 stars.** [FACT] `git shortlog`; [.github/workflows/](../../.github/workflows/); `gh repo view`. Buyers want "guaranteed response times" and a continuity plan ([Handsontable checklist](https://handsontable.com/blog/choosing-the-enterprise-javascript-ui-component-the-checklist)); MUI Enterprise sells "1 business day" response ([MUI pricing](https://mui.com/pricing/)).
7. **No SECURITY.md / disclosure contact / security page.** [FACT] none in tree. Vendors publish audits, scanning, CSP guidance, and a `security@` address ([Handsontable security](https://handsontable.com/docs/react-data-grid/security/)). Positive facts to publish: no network calls, npm provenance via OIDC ([release.yml](../../.github/workflows/release.yml)).
8. **Public repo exposes internal audits and to-dos ("not safe to extend yet").** [FACT] [AUDIT.md](../../AUDIT.md), [UI_UX_AUDIT.md](../../UI_UX_AUDIT.md), [TODO.md](../../TODO.md), `docs/transcripts/`. [INFERENCE] Credibility cost during technical due diligence.
9. **No docs site; user docs are two READMEs plus an in-demo page; root README chart list is stale (12 of 20 types) and package README omits composition/scatter-matrix.** [FACT] [README.md](../../README.md) line 29; grep. Buyers test "find a working example for your most complex use case within a reasonable time" ([Sencha](https://www.sencha.com/blog/how-to-evaluate-ui-component-libraries-10-criteria-that-actually-matter/)). No API reference, no StackBlitz/CodeSandbox starter, no migration guide.
10. **No browser support matrix; desktop-only at 1024px+.** [FACT] [packages/explorEDA/README.md](../../packages/explorEDA/README.md) lists APIs, not browsers/versions. Vendors publish "two latest major versions" or minimum versions ([AG Grid](https://www.ag-grid.com/react-data-grid/supported-browsers/), [MUI](https://mui.com/material-ui/getting-started/supported-platforms/)). Mobile out of scope is acceptable if stated as policy, which it is.
11. **SSR/Next.js compatibility undocumented and likely unsupported without `ssr: false`.** [FACT] 0 doc mentions; module-scope `registerAllCharts()` + CSS import; DOM/Canvas dependence. MUI documents Node ≥14 SSR support ([MUI supported platforms](https://mui.com/material-ui/getting-started/supported-platforms/)). [INFERENCE] Next.js is the default React host in 2026; an unanswered "does it work in Next" question stalls trials.
12. **Bundle size ~191 KB gzip JS + 34 KB gzip CSS; lean registration still ~221 KB gzip (react-dom included); 60+ runtime deps incl. three, TipTap, 15 Radix packages.** [FACT] measured 2026-10-10. Buyers check tree-shaking with bundle analysis ([Sencha](https://www.sencha.com/blog/how-to-evaluate-ui-component-libraries-10-criteria-that-actually-matter/)); Handsontable's checklist scores "Dependencies, where fewer is better". Not a blocker for a workspace-class component, but needs a published number and an explanation.
13. **No published data-size envelope or benchmark.** [FACT] "does not establish a general capacity envelope"; 10k-row walkthrough only. Buyers "test with your real data volumes" ([Sencha](https://www.sencha.com/blog/how-to-evaluate-ui-component-libraries-10-criteria-that-actually-matter/)). [INFERENCE] Analytics buyers routinely ask "how many rows?" in the first call.
14. **Tailwind-compiled CSS (222 KB raw) with global `:root` tokens (`--background`, `--primary`, ...) and a `.dark` class convention.** [FACT] [src/index.css](../../packages/explorEDA/src/index.css). [INFERENCE] Hosts not using shadcn tokens risk token collisions; white-label buyers will ask for scoping/prefixing and a `prefers-color-scheme` option. The `--eda-*` chart variables are a good start.
15. **No i18n/l10n; English-only UI copy; UTC-only calendar summaries.** [FACT] grep; [README.md](../../README.md). Syncfusion advertises RTL and localisation per component. Blocks non-English and some multinational buyers.
16. **React-only.** [FACT] peer deps. Most buyers in this niche are React shops; vendors with Angular/Vue coverage have a wider funnel but this is a strategic choice, not a defect.
17. **Chart export limited (no PNG/SVG/PDF for ordinary charts; composition copy-PNG only).** [FACT] [docs/application-feature-inventory.md](../../docs/application-feature-inventory.md). Common evaluation ask for dashboards.
18. **Repo hygiene**: root package named `data-viz`, demo workflow pinned to pnpm 8 while repo needs pnpm 11.9.0, no `engines`, no `sideEffects` hint, `composition`/`scatter-matrix` missing from `./charts/*`. [FACT] [package.json](../../package.json), [deploy.yml](../../.github/workflows/deploy.yml), [entries.json](../../packages/explorEDA/entries.json).

### Inferences

- [INFERENCE] Items 1-3 can be closed in days (choose licenses, add fields and files, cut a release). Items 4-7 are policy documents plus modest process (PR CI, a `security@` alias, a written support promise). Items 9-13 are documentation and measurement work. Only 5 (accessibility remediation), 11 (SSR), 14-15 (theming scoping, i18n) and 17 are real engineering.
- [INFERENCE] The product's distinctive strengths for a sales pitch are already built: row-level tracing, DSL + CLI (agent-friendly), multi-table project mode with a worker, host slots, read-only mode, and a storage-neutral JSON contract. These should headline the paid tier rather than be hidden in README prose.

### Gaps

- No buyer interviews or forum evidence specific to analytics/EDA components; the frequency ranking is reasoned from procurement gates and vendor practice.
- Bundle impact for a host with React already present was not isolated.

## Key question 5: Proposed free/paid feature split mapped to explorEDA entry points

### Takeaway

Follow the AG Grid/MUI X open-core pattern: a permissively licensed core that is genuinely useful alone (single-table workspace, core charts, linked filtering, saved JSON, themes), and a commercially licensed layer that holds the collaboration/scale/embedding features (project mode, worker, tracing/export/DSL tooling, white-label embedding, advanced analytical charts), enforced with a locally checked key and a watermark. Package the split by entry point so the boundary is visible in `import` statements.

### Cited Findings

Precedents for the boundary and enforcement:
- AG Grid: MIT Community; Enterprise gates server-side row model, Excel export, pivot/aggregation, range selection, integrated charts, master/detail, grouping, clipboard, tool panels, context menu/sidebars; watermark + console error without a key; per-developer perpetual licence with one year of updates. — [AG Grid licensing](https://www.ag-grid.com/react-data-grid/licensing/), accessed 2026-10-10
- MUI X: MIT base packages; `-pro`/`-premium` supersets; key checked locally, watermark on failure, component still works; seats = concurrent front-end developers; $299/$599/$1,399 per dev-year. — [MUI X licensing](https://mui.com/x/introduction/licensing/), [MUI pricing](https://mui.com/pricing/), accessed 2026-10-10
- Highcharts bundles the Accessibility module in every license (accessibility is never a paid gate). — [Highcharts compliance](https://www.highcharts.com/docs/accessibility/compliance), accessed 2026-10-10
- Open-core test: the free tier must solve real problems on its own; buyers flag "the vendor decides what stays free" as a risk. — [OneUptime](https://oneuptime.com/blog/post/2026-03-03-open-source-vs-open-core-whats-the-difference/markdown), [GovStack wiki](https://govstack-global.atlassian.net/wiki/spaces/DEMO/pages/96043009/Component+Library+Evaluation), accessed 2026-10-10

Mapping to explorEDA (entry points and files are [FACT]; tier placement is [INFERENCE]):

| Feature | Where it lives today | Proposed tier | Reasoning |
| --- | --- | --- | --- |
| `ExplorEda` single-table workspace, `data`/`savedData`/`onStateChange`, `getSettings()` | `exploreda` root, `src/components/ExplorEda.tsx` | **Free (MIT)** | The adoption hook; must be fully usable in production or the open-core test fails. |
| Linked filtering (Crossfilter), filter chips, status bar, field list, Rows drawer, summary table | `DataLayerProvider.tsx`, `PlotManager.tsx` | **Free** | Core promise of the product; the README leads with it. |
| Core charts: row, bar/histogram, line, scatter (points), box plot, pivot, data table, summary, metric card, color legend, markdown | `./charts/{row,bar,line,scatter,box-plot,pivot-table,data-table,summary-table,metric-card,color-legend,markdown}` | **Free** | Commodity chart types every competitor gives away; needed to make demos meaningful. |
| Calculated fields with inspection, field settings, grouped summaries (`aggregates`) | `./calculations`, `src/lib/fieldSettings`, `src/lib/aggregates` | **Free** | Differentiator for adoption; also underpins every chart. Gating it would cripple the core. |
| Themes (Compact/Newsprint/Report), `--eda-*` CSS variables, `.dark` | `src/lib/themes`, `src/index.css` | **Free** | Theming is a baseline expectation; vendors never gate it. |
| Saved JSON (`SavedDataStructure`), full analysis bundle, validation, clipboard | `src/utils/saveDataUtils.ts` | **Free** | Data portability must be free, or buyers fear lock-in. |
| Keyboard shortcuts, accessibility work | `KeyboardShortcutsDialog.tsx`, `chartAccessibility.ts` | **Free** | Follow Highcharts: never gate accessibility. |
| Advanced analytical charts: scatter density/hex/LOESS/regression/marginals, scatter-matrix, parallel coordinates, sankey, heatmap, calendar heatmap, ECDF, 3D scatter, maps (point + region/GeoJSON), composition | `./charts/{sankey,parallel-coordinates,heatmap,calendar,ecdf,three-d-scatter,map}`; `ScatterMatrix`, `Composition` (no entry yet); scatter overlays in `ScatterPlot/*` | **Paid (Pro)** | Mirrors MUI X "advanced charts" and AG Grid "integrated charts". Heavy deps (three, d3-geo, world-atlas) also justify a separate package. Keep basic scatter free; gate the overlays and the exotic families. |
| Row tracing (Alt-click trace panel, contributors, exclusions, "Show these rows in the query flow") | `components/charts/trace/*`, `ChartTraceControl.tsx` | **Paid (Pro)** | Audit/compliance-grade explainability is an enterprise value; comparable to AG Grid master/detail and tool panels. Keep a minimal "view chart data" free so the free tier is not crippled. |
| Project mode: `ExplorEdaProject`, Schema and Query panels, relationships, lookups/expands, parameters | `src/components/ExplorEdaProject.tsx`, `src/types/AnalysisProject.ts` | **Paid (Pro)** | Directly analogous to AG Grid's server-side row model and pivot; multi-source analysis is where enterprise data lives. |
| Worker execution (`createAnalysisWorker`, `analysis-worker`) and any future large-data mode | `./analysis`, `src/lib/analysis/analysisWorker.ts` | **Paid (Pro/Premium)** | Scale features are the standard premium lever ("large-dataset canvas rendering" is a MUI Premium item). |
| `exploreda/analysis` pure evaluator (`evaluateAnalysisQuery`, project file codec) | `src/analysis.ts` | **Free core evaluator, paid UI** (or Pro) | Option A: keep the non-React evaluator MIT to encourage scripts/agents, gate the panels. Option B: gate the whole `./analysis` entry. A favours adoption; B is simpler to enforce. |
| Host embedding: `sidePanels`, `toolbarStart/End`, `readOnly` | `ExplorEda.tsx` props, `WorkspaceSidePanel.tsx` | **Paid (Pro)** as "embedding/white-label" | These exist to build a product around the workspace; that is the paying persona. Comparable to AG Grid tool panels/sidebars. `readOnly` viewer embedding also enables a "viewer seat" pricing story. |
| Dashboard text DSL compile/export, `exploreda-dsl` CLI, `compileViews/exportViews` | `src/lib/dsl/*`, `src/cli/exploredaDsl.ts` | **Paid (Pro)** for the CLI and export; **Free** for `compileDocument` read path (optional) | Agent/CI integration is a differentiator teams will pay for; keeping the read path free lets the docs show the DSL. |
| Exports: CSV, PNG (composition), future SVG/PDF/image export | `DataTable`, `Composition` | **CSV free; image/PDF paid** | AG Grid gates Excel export, keeps CSV free; same shape. |
| Undo/history, saved view tabs | demo only (`apps/demo/src/savedViewsHistory.ts`) | **Paid** once moved into the package | Currently host-side; packaging it is a Pro-tier feature ("views and history"). |
| Support, LTS, security questionnaire, VPAT | not present | **Paid (Pro/Enterprise)** | Where the money is for most vendors ([MUI pricing](https://mui.com/pricing/)). |

Suggested packaging [INFERENCE]: `exploreda` (MIT, core + free charts), `exploreda-pro` (commercial superset re-exporting the core plus advanced charts, tracing, project mode, worker, embedding slots, DSL CLI), `exploreda-license` (key check, no network, watermark on failure), matching MUI's superset pattern so upgrade is an import change. Pricing anchor from precedents: $299-$599 per developer-year with perpetual production rights and one year of updates.

### Inferences

- [INFERENCE] The free tier described above still passes the "solves a real problem alone" test: one table, linked charts, calculated fields, saved JSON. That is what the README sells today.
- [INFERENCE] Because the root entry currently registers all 20 charts at import and `composition`/`scatter-matrix` lack entries, a tier split needs the registry to become the enforcement seam: free package registers free definitions; pro package registers the rest and validates the key on `register`.
- [INFERENCE] A non-commercial-only license for the "free" tier (instead of MIT) would fail many corporate allowlists and would not drive adoption; the precedents all use MIT for the core.

### Gaps

- No pricing research for analytics-workspace components specifically (Plotly Dash Enterprise, Observable, Mode embed) was in scope; anchors come from grid/chart vendors.
- Whether buyers would value tracing enough to pay for it is untested; it is placed in Pro by analogy, not by evidence.
