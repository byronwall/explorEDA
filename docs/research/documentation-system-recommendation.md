# Documentation system recommendation for explorEDA

> **Provenance.** ChatGPT Pro response to [`docs/chatgpt-pro-documentation-system-research-prompt.md`](../chatgpt-pro-documentation-system-research-prompt.md), run October 1–2, 2026. Copied verbatim into the repository on 2026-10-10; citation chips are rendered as inline links.
>
> **Read with the reconciliation.** The report inspected `3cc4117` (Oct 1, 21:04 EDT). The first hand-authored chart guides (`apps/demo/src/ChartDocs.tsx`, commit `24089df`) landed about three hours later, and `main` has moved roughly 300 commits since. The intent docs in [`docs/intent/chart-and-rendering-docs/`](../intent/chart-and-rendering-docs/) record which findings still hold, which changed, and what was adopted. Do not act on this report without them.

**Suggested repository path:** docs/research/documentation-system-recommendation.md
**Research date:** October 1, 2026, America/Indiana/Indianapolis; October 2, 2026 UTC.
**Repository:** byronwall/explorEDA
**Inspected ref:** main, pinned to 3cc4117fc393efc7fede0da298b8229d3fb6c696.
**Scope:** Research and proposed edits only. No repository files, dependencies, Git state, deployment, commits, or pull requests were changed. The report follows the supplied documentation-system research brief.

## 1. Recommendation

**Extend the existing Vite/React demo with build-time MDX, a small documentation shell, and on-demand iframe embeds of existing demo examples.** Keep the demo’s query-based URL model. Do not introduce a documentation framework, standalone chart API, or interactive property playground for the first release.

**Fallback:** a separate static **Astro/Starlight** workspace at `apps/docs`, published under `docs/` in the same Pages artifact. Keep the existing Vite demo at the deployment root and reuse its example URLs. Use Astro’s React integration only for React components that actually need to mount in the documentation document.

**Confidence: moderate; selection provisional pending the bounded proof in section 9.** Repository access supports a repository-specific assessment. However, this research did not execute a dependency installation, build, browser flow, or deployment. The live custom domain could not be inspected through the available web tool. These are validation limits, not evidence that the proposed design fails.

The decisive reason is that the repository already has the expensive part: real React workspaces, fixture loading, saved layouts, reset behavior, example navigation, and a static deployment. `LandingPage`, `examples`, and `LiveOrderBook` provide concrete reuse points. MDX solves repetitive image-heavy prose authoring without replacing that application. Official MDX documentation explicitly supports Vite and React compilation. ([MDX](https://mdxjs.com/packages/rollup/))

The main tradeoff is deliberate: this choice produces static deployable files, but documentation prose still renders through client-side React. It does not provide pre-rendered HTML per article, automatic image resizing, or a ready-made full-text search system. Starlight provides stronger content-site infrastructure, including static pages, image processing, and integrated search. Those advantages become decisive when they replace substantial custom work—not simply because the project has many screenshots. ([vitejs](https://v6.vite.dev/guide/build))

Reject the nearest alternative, Starlight, for the initial proof, because it adds a second application/build configuration and output assembly while the existing demo still owns the interactive experience. Keep it as a genuine fallback: it is not rejected for inability to run React or deploy statically.

## 2. Inspected repository, access, and material findings

### Ref and baseline comparison

The owner and repository were confirmed as `byronwall/explorEDA`. The inspected `main` commit is the merge of PR #96, dated October 2, 2026 at 01:04:59 UTC, which is October 1 at 9:04:59 p.m. EDT. The date is not a future commit in the user’s timezone.

The remote branch `codex/feedback-round-2-tooltip-handoff` exists and points to the prompt’s baseline, `5c92e32a9d7d3e61b7cbf422897cd38555c9a7cd`. The compare result shows `main` three commits ahead, zero behind, with that baseline as the merge base.

The comparison changes UI guidance, chart details, drawers, placement, dialogs, and library CSS. It does not change the manifests, deployment workflow, demo source, or chart-documentation initiative files. Consequently, the hosting assumptions still need correction, while screenshots and interaction instructions must reflect the newer library UI. In particular, expanded charts now have a details view, Rows is a full-height drawer, and workspace settings share a floating panel. ([Comparison](https://github.com/byronwall/explorEDA/compare/5c92e32a9d7d3e61b7cbf422897cd38555c9a7cd...3cc4117fc393efc7fede0da298b8229d3fb6c696), [UI defaults](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/ui-defaults.md))

### Access record

The required repository, pinned ref, rules, READMEs, initiative map and every existing mapped document, comparative research, manifests, deployment workflow, demo sources, rendering/provider sources, inventory sections, tracing status, and the three requested validation files were readable. The mapped `brainstorm.md` is marked not requested and does not exist; it was not treated as missing required work.

Additional reads covered package build/export boundaries, current scatter and bar renderers, categorical settings, and the baseline comparison. The existing JPEG was confirmed at the pinned ref: 135,447 bytes, blob `77a69417ebded6286cdb8fb31ac69552fb8562ce`. Encoded contents were retrievable, but the image was not visually inspected. No claim about its current visual correctness follows from its filename or README alt text.

The live https://exploreda.dev page was inaccessible through the web tool. The connector did not permit the Pages-settings endpoint. An attempted `apps/demo/public/CNAME` read returned not found; this alone does not determine the repository’s external Pages settings. No local project checkout was used.

### Findings that affect the decision

| Observed evidence | Consequence |
| --- | --- |
| Root `package.json` pins pnpm 11.9.0; the demo uses React 19, TypeScript, and Vite 6. ([Root manifest](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/package.json), [demo manifest](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/package.json)) | Keep this stack. Adding MDX does not justify a Vite or React migration. |
| `main.tsx` mounts `LandingPage` in `BrowserRouter`; `LandingPage` uses `?example=` and `?view=coverage`. ([Main entry](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/main.tsx), [LandingPage](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/LandingPage.tsx)) | Add a docs query branch above `LandingPage`; preserve existing URLs. |
| `LandingPage` uses lazy/Suspense for `ExplorEda`, but also imports runtime serialization helpers from the root package. ([LandingPage](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/LandingPage.tsx), [public entry](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/components/ExplorEda.tsx)) | Lazy JSX alone does not prove the package graph is deferred. Separate the documentation branch from eager product imports. |
| `LiveOrderBook` already fetches a fixture, mounts `ExplorEda`, and resets by remounting. ([Source](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/landing/LiveOrderBook.tsx)) | Reuse the pattern, but distinguish embedded workspaces from standalone chart components. |
| Package exports include `ExplorEda`, registry utilities, and chart definitions—not `DataLayerProvider` or `ChartRenderer` as public mounting primitives. ([Manifest](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/package.json), [build entries](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/tsup.config.ts), [ChartRenderer](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/components/charts/ChartRenderer.tsx)) | No supported public `<ScatterPlot data={...}>` API was established. Do not invent one. |
| The full entry calls `registerAllCharts()`; eleven registered types remain present. ([Entry](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/components/ExplorEda.tsx), [registration](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/charts/registerAllCharts.ts)) | Documentation coverage should match the registry. Importing the full workspace does not become lean merely by mentioning selective registration. |
| Deployment uploads only `apps/demo/dist`; Vite’s base is `/`; README advertises exploreda.dev. ([Workflow](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/.github/workflows/deploy.yml), [Vite config](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/vite.config.ts), [README](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/README.md)) | Root/custom-domain configuration is the evidence-backed current build contract. `/explorEDA/` is an alternative deployment target, not the current configured base. |
| Workspace support begins at 1024 CSS pixels; browser APIs include Canvas and WebGL for 3D. ([Package README](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/README.md)) | Prose and figures must adapt to narrow screens; live workspace embeds must not imply mobile chart support. |

Current content is not uniformly current. The feature inventory and September initiative are useful starting points, not an authoritative catalogue of today’s behavior. Current `ScatterPlot` uses `planScatter` and a Canvas drawing effect; current `BarChart` uses `planBarChart`, `barTraceTargets`, and `resolveBarTrace`. Bar planning/tracing therefore must not be described as wholly future work merely because the older scatter-status document calls it the next comparison. Conversely, these two implementations do not establish a universal rendering/provenance contract for every view.

The actual example IDs are `shop-operations`, `palmer-penguins`, `nba-stats`, `categorical-charts`, `box-plot`, `product-activity`, `scatter-trace`, `calculated-orders`, `shop-10000`, and `lorenz-3d`. The planned `line-chart`, `tables`, and `color-legend` IDs are absent. Also, `shopDashboard`’s Sales channels is a row chart; the actual bar example is the `shop-delivery` histogram. `shopDashboard` does not contain the Markdown panel attributed to it in the old plan.

## 3. Shortlist and rejection rationale

Scores are judgments for this task, not measurements. 5 is favorable, 1 unfavorable; higher integration and maintenance scores mean less work. Equal weighting makes the tradeoff visible; a hard failure would override every score.

| Candidate | Static Pages fit | Actual React examples | Image authoring | Integration cost | Maintenance | Total /25 | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Existing Vite + build-time MDX | 5 | 4 | 4 | 5 | 4 | 22 | Preferred, proof required |
| Astro/Starlight + React capability | 5 | 4 | 5 | 3 | 3 | 20 | Viable fallback |
| Existing demo, hand-authored TSX pages | 5 | 4 | 2 | 5 | 3 | 19 | Fair baseline; weaker authoring |
| Docusaurus | 5 | 4 | 4 | 2 | 3 | 18 | Technically viable; unnecessary initial integration |
| Nextra / Next.js static export | 4 | 4 | 4 | 2 | 2 | 16 | Technically viable; least justified stack addition |

**Vite/MDX.** `@mdx-js/rollup` compiles MDX for Vite; React is a supported output. The official integration orders MDX before the React plugin using `enforce: 'pre'` and extends React’s include pattern to MDX. Use trusted repository-authored MDX compiled during build, not runtime evaluation of arbitrary text. An MDX provider is optional: explicit imports or a `components` prop suffice. Keep metadata in a small typed catalogue instead of adding a content database. ([MDX](https://mdxjs.com/packages/rollup/))

Vite imports handle assets and base rewriting, but bare relative image strings inside compiled MDX should not be assumed to become asset imports automatically. Establish an explicit imported-image convention. The TSX-only baseline remains viable and has the lowest dependency increase; it loses because eleven illustrated guides would repeat JSX structure and make routine prose, captions, and screenshot changes unnecessarily code-heavy. ([vitejs](https://v6.vite.dev/guide/assets))

**Astro/Starlight.** Official Starlight documentation supports Markdown/MDX, local images through Astro’s asset processing, and framework components including React. Astro supports static GitHub Pages deployment and `client:only="react"`, which skips server rendering. The fallback combines those capabilities with existing demo iframes; it need not import the browser-only library during static generation. Static search is already integrated through Pagefind. ([Starlight](https://starlight.astro.build/guides/authoring-content/))

**Docusaurus.** Current documentation identifies version 3.10.2 and confirms static HTML output without a runtime server, MDX React components, and local asset imports. A direct workspace needs `BrowserOnly`, with the browser-dependent import inside its callback—not merely a top-level import hidden by conditional JSX. This is a feasible chain, but it introduces another docs application, theme, build pipeline, and style boundary. Its extra capabilities do not resolve a requirement that MDX or the Starlight fallback cannot cover more economically here. ([Docusaurus](https://docusaurus.io/docs/advanced/ssg))

**Nextra.** Do not reject it on the false premise that Next.js always requires a server. Nextra documents `output: 'export'`, static output, and `images.unoptimized: true`; its usual runtime image optimizer is not part of that export. React browser-only content requires a Client Component and dynamic loading with `ssr: false`; `'use client'` alone does not disable prerendering. Its MDX/image support is real, but Next/Nextra conventions and static-export constraints are an unnecessary addition to this Vite repository. ([Nextra](https://nextra.site/docs/guide/static-exports))

None of these tools earns credit for versions, translations, authentication, a CMS, or a general playground. A server-dependent configuration, unsupported internal chart imports, or a design that takes over existing demo URLs is NO-GO, regardless of product choice.

## 4. How actual examples work

### Public API boundary

The supported low-cost path is a real workspace:

```ts
// Illustrative public API shape; rows/settings must come from a real fixture.
import { ExplorEda } from 'exploreda';
import 'exploreda/dist/ExplorEda.css';

<ExplorEda data={rows} savedData={settings} />
```

A saved layout with one chart still mounts the workspace and its providers; it is not a standalone chart component. `ChartRenderer` and chart definitions depend on provider state. Avoid deep imports into package internals, new public providers, or a second data/filter implementation just to make the documentation look lightweight.

| Strategy | Concrete mounting path | Tradeoff and use |
| --- | --- | --- |
| Direct React embed | Client-load `ExplorEda`, load its CSS, fetch/parse the existing CSV, pass its saved dashboard, reset with a new key. | Closest to embedding documentation, but shares global CSS and the document containing overlays. Use only after isolated validation. |
| On-demand iframe | Frame `${siteBase}?example=scatter-trace` or `${siteBase}?example=shop-operations`; existing `LandingPage` loads the library, CSS, fixture, and saved state. | Recommended for full workspaces. Isolates document styles and viewport overlays without copying loaders or inventing an API. |
| Full-demo link | Open the same existing example URL outside the frame. | Always present; best for extended analysis and narrow-screen fallback. It opens the initial fixture, not the user’s current edited state. |

These mounting paths reuse the existing [LandingPage](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/LandingPage.tsx), [LiveOrderBook](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/landing/LiveOrderBook.tsx), and [public workspace entry](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/components/ExplorEda.tsx).

The iframe runs another React instance in another document. This is not a duplicate-React-hooks problem within one tree, but it does incur another application execution and its own state. Cached assets may be reused; memory, bundle transfer, and startup cost were not measured. Mount at most one workspace on demand. Do not promise filter synchronization between separate examples.

For Vite, rendering is already client-side. Put the docs/demo switch above a lazy `LandingPage` so an article does not execute its eager package imports. Keep initial documentation rendering independent of chart code.

For Starlight, prefer the same frame. A direct example would use one complete React wrapper as `<ClientWorkspace client:only="react" />`; that wrapper owns provider, CSS loading, fixture loading, and a deferred `import('exploreda')`. Do not distribute a provider and its consumers across independent islands. `client:visible` alone is not the browser-only boundary because it does not mean “skip server rendering.” Keep the package import out of build-time MDX/configuration modules. ([Astro Docs](https://docs.astro.build/en/reference/directives-reference/))

For Docusaurus, use its documented `BrowserOnly` callback and load the package inside that client-only branch. For Nextra, dynamically import a complete wrapper with `ssr: false` from a Client Component. Both can instead embed the existing demo, avoiding library CSS and fixture duplication in the docs build. ([Docusaurus](https://docusaurus.io/docs/advanced/ssg))

Canvas and WebGL are mounted in the browser, never simulated during static generation. Keep an understandable fallback and full-demo link when an example cannot load. The bounded proof does not certify WebGL merely because its two examples use 2D charts.

## 5. Build, output, URLs, and routers

### Resolve the base-path inconsistency

Use one explicit deployment variable, `siteBase`, normalized to a leading and trailing slash:

| Target | Demo/Vite base | Preferred docs URL | Fallback Starlight base |
| --- | --- | --- | --- |
| Advertised custom domain | `/` | `https://exploreda.dev/?view=docs&topic=scatter` | `/docs/` |
| GitHub project site | `/explorEDA/` | `https://byronwall.github.io/explorEDA/?view=docs&topic=scatter` | `/explorEDA/docs/` |

The first row matches the inspected Vite configuration and README. The second is a supported alternative design, not a claim that this project URL currently serves the same site. Vite’s official Pages guidance makes exactly this root/custom-domain versus repository-subpath distinction. External Pages/DNS settings remain unverified. ([vitejs](https://v6.vite.dev/guide/static-deploy))

Preferred output:

```text
packages/explorEDA source
        |
        v
library dist + CSS
        |
        v
apps/demo: existing app + src/docs/*.mdx + imported figures
        |  Vite build, base = siteBase
        v
apps/demo/dist/
  index.html          <- landing, examples, coverage, docs queries
  assets/             <- JS, CSS, imported/hashed figures
  datasets/           <- existing public fixtures
  landing/order-book-web.jpg
        |
        v
one existing Pages artifact and deployment
```

Suggested source locations: `apps/demo/src/docs/pages/`, `assets/`, `components/`, and `catalogue.ts`. Keep the library build before the demo build, as required by the workspace package import. The existing recursive build may remain; no second output assembly is needed. Preserve the upload path `apps/demo/dist`. ([Root manifest](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/package.json), [deployment workflow](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/.github/workflows/deploy.yml))

The root app alone owns `BrowserRouter`. Docs navigation changes the query at the existing document path; it does not mount a nested `BrowserRouter`. Define `view=docs` as the docs branch, strip conflicting parameters when making links, and treat an unknown topic as an in-app not-found page with a docs-index link. A query-based not-found page does not provide a per-topic HTTP 404.

Use URLs such as `${siteBase}?view=docs&topic=bar#filtering`. A direct request or refresh still asks the static host for the real root `index.html`; no server rewrite is required. After a lazy article loads, explicitly handle its fragment and focus its heading on topic navigation. Preserve browser Back/Forward and existing example/coverage behavior. Do not add clean `/docs/scatter` SPA routes without corresponding HTML files.

Vite’s `base` rewrites imported assets, CSS URLs, and HTML references, not arbitrary runtime fetch strings. Convert known local fixture/image paths in `examples.ts`, `LiveOrderBook`, and landing links through a base-aware helper, for example:

```ts
`${import.meta.env.BASE_URL}${localPath.replace(/^\/+/, '')}`
```

Do not apply that helper to external URLs. Imported documentation images should use Vite’s resolved URL directly. ([vitejs](https://v6.vite.dev/guide/build))

### Fallback assembly

Create `apps/docs` as a separate workspace. Use Starlight’s normal content directory, `src/content/docs/`, and static configuration: `output: 'static'`, `build.format: 'directory'`, and `trailingSlash: 'always'`. Set `site` to the deployment origin and `base` to the table’s docs base. No server adapter is required for this design. ([Astro Docs](https://docs.astro.build/en/guides/deploy/github/))

Build the library and demo; build docs; then create a clean staging directory:

```text
apps/demo/dist/*  -----> _site/*
apps/docs/dist/*  -----> _site/docs/*
                           |
                           +-- docs/scatter/index.html
                           +-- docs/bar/index.html
                           +-- docs/rendering/index.html
                           +-- docs/_astro/ and search assets
                           |
                           v
                    one Pages upload: _site
```

The docs prefix is added physically once. Under a project site, GitHub supplies the outer `/explorEDA/` mount; do not create `_site/explorEDA/`. Check staging for collisions and complete search/assets before upload. Assemble after all builds so a clean build cannot erase copied files.

Starlight owns its physical `/docs/` documents. Navigate between docs and the demo with normal links rather than delegating paths to the demo router. Direct refresh resolves each generated `index.html`. The demo iframe has its own router and React runtime. For fallback example URLs, pass the demo `siteBase` explicitly—Astro’s `BASE_URL` now refers to the docs base.

### Required deployment alignment

Align `.github/workflows/deploy.yml` to Node 24 and pnpm 11.9.0, matching repository guidance and its package-manager pin. The current Node 20/pnpm 8 pair is inconsistent; official pnpm compatibility documentation also excludes Node 20 for pnpm 11. Pin the chosen manager rather than installing latest, use a compatible setup mechanism, and validate the committed lockfile with a frozen install. This is a targeted prerequisite, not a wider CI modernization project. No existing workflow failure is claimed. ([pnpm](https://pnpm.io/installation))

## 6. Image-heavy authoring and documentation features

For the preferred approach, author normal Markdown prose and fenced code in MDX; use small shared components only where needed: `Figure`, `FigurePair`, and `LiveExample`. One typed catalogue supplies topic IDs, navigation labels, associated registry types, and verified example/chart IDs. Validate it in tests rather than maintaining separate navigation and coverage lists.

Keep curated documentation images beside the content, import them explicitly, and store original capture details in a small manifest: source commit, example ID, chart ID, state/reset instructions, viewport, and capture date. Replace an image at its stable source path; Vite updates the built hashed URL. Vite does not automatically resize or compress it. Export appropriately sized PNG/WebP/JPEG beforehand; retain only useful source variants. ([Vite asset documentation](https://v6.vite.dev/guide/assets))

`Figure` should emit a semantic figure, meaningful alt text, a visible caption, intrinsic dimensions, and responsive `max-width: 100%; height: auto`. Keep image enlargement as a normal link initially. Two-up figures stack on narrow screens; avoid unreadably shrinking an entire desktop workspace. Capture cropped details for narrow reading while retaining the full screenshot as a linked original. Do not claim annotations are live chart behavior.

Prefer checked-in SVG/PNG diagrams with a textual explanation. A diagram editor or Mermaid pipeline is optional later; neither belongs in the initial browser bundle just to explain one rendering flow.

Provide a contents index, a simple collapsible navigation region, stable heading anchors, and previous/next links. Reuse the demo’s existing `prism-react-renderer` only if highlighted code earns its cost. The core dependency addition is `@mdx-js/rollup`; add `remark-gfm` for Markdown tables or `rehype-slug` for automatic anchors only when the proof demonstrates a need. Do not silently assume bare MDX supplies those extensions. ([Demo manifest](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/package.json), [MDX documentation](https://mdxjs.com/packages/rollup/))

For twelve initial pages, start without full-text search. A later title/keyword filter can use the catalogue. Do not assume Pagefind can index articles that exist only after query-driven client rendering; choosing pre-rendered, body-text search is a concrete reason to use Starlight rather than build a second indexing system. Starlight supplies Pagefind and optimized local image support. Docusaurus supports imported/Markdown assets but additional image optimization has its own plugin/component choices. Nextra supports image imports and zoom, while static export deliberately disables its runtime image optimization. ([Starlight authoring](https://starlight.astro.build/guides/authoring-content/), [search](https://starlight.astro.build/guides/site-search/), [Docusaurus assets](https://docusaurus.io/docs/markdown-features/assets), [Nextra export](https://nextra.site/docs/guide/static-exports), [Nextra images](https://nextra.site/docs/guide/image))

Two repository-policy details require explicit proposed clarification: `AGENTS.md` says tooltips support hover and focus, while newer `docs/ui-defaults.md` specifies hover-only tooltips; do not silently pick one for new controls. Use visible labels for the proof. Also distinguish curated documentation illustrations from temporary PR-validation screenshots, which the repository directs to `tmp/`.

## 7. Illustrative image-heavy page and real React boundary

The following is illustrative, untested code, not an implementation. The proposed figure components and screenshot assets do not exist yet. Their dimensions must come from actual captures, not from this example. The example ID and the underlying workspace are real.

Proposed `apps/demo/src/docs/pages/scatter.mdx`:

```mdx
import overview from '../assets/scatter-overview.webp';
import selected from '../assets/scatter-selection.webp';
import trace from '../assets/scatter-trace.webp';
import { Figure, FigurePair } from '../components/Figure';
import { LiveExample } from '../components/LiveExample';

# Scatter: compare net sales and contribution

Use this view to inspect the relationship between two numeric fields.
This example uses the existing order fixture and calculated fields.

<Figure src={overview}
  alt="Net sales on the horizontal axis and contribution on the vertical axis."
  caption="Initial scatter-trace workspace after Reset." />

## Select records and inspect linked views

Draw a rectangle, inspect the linked rows, and clear the selection.
Compare that selection with a Channel filter from another view.

<FigurePair>
  <Figure src={selected}
    alt="A rectangular scatter selection with the linked rows visible."
    caption="Capture the actual selection and resulting count in the proof." />
  <Figure src={trace}
    alt="The trace inspector for a selected scatter point."
    caption="Point inspection is separate from filtering." />
</FigurePair>

<LiveExample exampleId="scatter-trace" />

## Rendering and limits

Points use Canvas; the view also renders SVG guides and brush objects.
A row excluded by another chart has no visible point to select here.
Read the shared rendering guide for row populations and trace scope.
```

The page’s field choices come from `scatterTraceDashboard`; its rendering statements are grounded in current `ScatterPlot` and the tracing status, not a hypothetical chart API. Before publication, replace proof-instruction captions with observed user-facing explanations and actual results. ([Dashboard fixtures](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/demos/dashboardSettings.ts), [scatter renderer](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx), [tracing status](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/intent/deterministic-rendering-and-data-traceability/scatter-tracing-status.md))

A proposed React frame launcher makes the browser boundary explicit:

```tsx
// Illustrative only. One instance per page; associated CSS must be provided.
import { useEffect, useId, useRef, useState } from 'react';

type ExampleId = 'scatter-trace' | 'shop-operations';

export function LiveExample({ exampleId }: { exampleId: ExampleId }) {
  const host = useRef<HTMLDivElement>(null);
  const launch = useRef<HTMLButtonElement>(null);
  const afterId = useId();
  const [wideEnough, setWideEnough] = useState(false);
  const [running, setRunning] = useState(false);
  const [revision, setRevision] = useState(0);
  const href = `${import.meta.env.BASE_URL}?${new URLSearchParams({
    example: exampleId,
  })}`;

  useEffect(() => {
    if (!host.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const wide = entry.contentRect.width >= 1024;
      setWideEnough(wide);
      if (!wide) setRunning(false); // Unmount, rather than hide, a workspace.
    });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} className="docs-example-wide">
      <p>
        Interactive workspaces require at least 1024 CSS pixels of width.
        Starting or resetting opens the original example, not edited state.
      </p>
      <a href={href}>Open the full example</a>
      {wideEnough && (
        <button ref={launch} onClick={() => setRunning(true)} disabled={running}>
          Start interactive example
        </button>
      )}
      {wideEnough && running && (
        <>
          <a href={`#${afterId}`}>Skip interactive example</a>
          <button onClick={() => setRevision(n => n + 1)}>Reset example</button>
          <button onClick={() => {
            setRunning(false);
            requestAnimationFrame(() => launch.current?.focus());
          }}>Close example</button>
          <iframe
            key={`${exampleId}:${revision}`}
            src={href}
            aria-label={`Interactive ${exampleId} analysis workspace`}
            loading="lazy"
            className="docs-example-frame"
          />
        </>
      )}
      <p id={afterId} tabIndex={-1}>Continue reading the guide.</p>
    </div>
  );
}
```

For the proof, make the example region span the page below the navigation, with a frame at `width: 100%`, a deliberate height such as 760px, and no width-scaling transform. Measure available container width, not just window width. At a 1280-pixel viewport a permanent sidebar could otherwise leave too little room. At 783 and 390 pixels, retain the figures and link without mounting the workspace.

This launcher does not import `exploreda`. The child document follows the existing `main.tsx` → `LandingPage` → lazy `ExplorEda` path and uses its existing CSS, CSV parsing, and saved settings. The frame’s accessible name uses `aria-label` rather than adding a `title` attribute contrary to the current repository rule; verify actual assistive-technology navigation in the proof. The frame is same-origin isolation, not a security sandbox. A visible link remains available if framing is blocked; an iframe `load` event alone must not be treated as proof that charts rendered.

## 8. Proposed initiative changes, grouped by file

These are proposed edits only. Preserve the initiative’s task-led organization, eleven-view scope, shared guide, desktop chart boundary, and ban on unrelated chart redesign.

### `docs/intent/chart-and-rendering-docs/initiative-map.json`

Update the inspected snapshot/ref to this report’s SHA and link this research result as new decision evidence. Keep the phase at planning until the choice is approved. Replace “hand-authored demo pages/no docs framework” as an unquestioned constraint with “Vite-hosted MDX preferred; Starlight fallback only after proof rejection.” Record the image workflow, public workspace boundary, two deployment bases, proof gate, and unresolved policy/hosting questions. Keep `brainstorm.md` marked not requested rather than manufacturing it. ([Current map](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/intent/chart-and-rendering-docs/initiative-map.json))

### `intent-brief.md`

Retain analysts choosing/operating views and developers embedding the workspace. Add image-heavy authoring, readable narrow-screen prose, actual-example reuse, static deployment, and maintenance acceptance criteria. Explicitly separate “static files” from “pre-rendered article HTML.” Make supported current behavior and planned rendering work distinct editorial categories. Align its initial proof with scatter, bar, and rendering guide, not a looser one-page description. ([Current intent brief](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/intent/chart-and-rendering-docs/intent-brief.md))

### `shape-brief.md`

Keep the existing page sequence: purpose, input fields, example, computation, filtering, settings, limits, shared guidance. Replace JSX-page storage with MDX plus the small component set. Specify on-demand existing-demo frames as the default full-workspace embed and full-demo links as permanent alternatives. Record direct embedding as a separate compatibility probe, not a prerequisite requiring a new API. Add the fallback decision trigger and an explicit allowance for curated documentation images. ([Current shape brief](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/intent/chart-and-rendering-docs/shape-brief.md))

### `implementation-plan.md`

Replace the unconditional `/explorEDA/` assumption with the root/subpath table and base-aware fixture rule. Retain `?view=docs&topic=` for the preferred design. Add deployment-toolchain alignment before the proof; add build/plugin, article-navigation, screenshot, width, and real-browser checks to milestone 1. Do not proceed to all eleven pages until those checks pass. ([Current plan](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/intent/chart-and-rendering-docs/implementation-plan.md))

Correct the example mapping using existing source: `line-chart` → `product-activity`; tables → `shop-operations` or another verified table-containing fixture; Markdown → `scatter-trace` or `calculated-orders`; bar → `shop-operations`, specifically `shop-delivery`. Treat a standalone `color-legend` example as an unresolved catalogue task until an actual saved panel is verified or a small example is deliberately authored. An attached legend does not establish a standalone Color Legend view example. Test both example-ID existence and intended chart-type membership. ([Examples](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/demos/examples.ts), [dashboard fixtures](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/demos/dashboardSettings.ts), [categorical settings](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/demos/categoricalChartSettings.ts))

Replace blanket “bar tracing future” language with a source-reviewed rendering-status matrix. Keep reusable state, planned render marks, implemented trace targets, and unverified behavior separate. The new details/drawer UI must be reflected in capture instructions. Add rollback and preserve existing example/coverage tests. ([UI defaults](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/ui-defaults.md), [bar renderer](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx), [scatter renderer](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx))

### `comparative-research.md` and shared rules

Keep the earlier Nivo/ECharts/dc.js/Vega/Observable comparison as historical interaction/content research. Add a link to this tooling decision rather than recasting those products as a docs-framework shortlist. Propose a narrow `AGENTS.md` clarification about curated illustrations versus temporary evidence and resolve its tooltip-policy contradiction with `docs/ui-defaults.md`; do not quietly change either during implementation. ([AGENTS](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/AGENTS.md), [earlier research](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/docs/intent/chart-and-rendering-docs/comparative-research.md))

## 9. Bounded proof that can reject the choice

Build only three pages: scatter, bar, and the shared rendering guide. Include approximately six useful figures, one two-up comparison, heading links, a small code block, and one on-demand workspace per chart page. No full catalogue rollout, property playground, new package API, or chart redesign.

Use `scatter-trace`/`trace-scatter` for scatter and `shop-operations`/`shop-delivery` for the bar histogram. Explain any navigation needed to reach the bar; do not present a full dashboard as a focused standalone component.

| Check | Passing evidence |
| --- | --- |
| Static build and assets | Build under `/` and `/explorEDA/`; serve the assembled output with an ordinary static server without SPA rewrites. Every JS/CSS/image/CSV request resolves. No runtime backend, image optimizer, or server-only route is needed. |
| Images and editing | Import and replace a screenshot without editing routing code. Captions and alt text remain associated; intrinsic dimensions match files; two-up figures stack; crops remain readable. Deliberately remove an imported file and verify the build fails rather than shipping a broken image. |
| URLs and navigation | Direct-load and refresh all three topics, a heading fragment, existing example URLs, and coverage under both bases. Back/Forward works. Unknown topics have a recovery link. Fallback testing must refresh physical `/docs/scatter/` and `/docs/bar/` pages. |
| Actual scatter behavior | Start the real workspace; draw/clear a brush, inspect linked rows and filter chips, then apply a peer Channel filter. Compute expected row membership from the fixture and saved calculations for the chosen bounds; record those rows/counts. Do not count faint contextual points as globally selected rows. |
| Actual bar behavior | Exercise `shop-delivery`, not Sales channels. Verify the numeric brush’s snapped bin boundaries, linked rows, clear/reset, and a peer filter. Derive expectations from current bin/filter logic and fixture data, not a guessed interval or screenshot alone. |
| Keyboard | Reach nav, headings/links, launch/reset/close, and leave the frame in both directions. Verify focus recovery, Escape through nested dialogs, and numeric filter inputs as an alternative to pointer brushing. Check documented Alt+Enter bar inspection where applicable. Do not claim every Canvas point is keyboard navigable. |
| 1280 px | Provide at least 1024 CSS pixels to the actual example container. Read prose and interact with real charts; open details, Rows, and settings without trapping the article or leaking layout. |
| 783 px and 390 px | Prose, figures, captions, navigation, and code-block scrolling remain usable without page-level horizontal overflow. No workspace is mounted automatically. A full-demo link clearly retains the desktop support requirement. |
| State and failure paths | Reset returns to the fixture; topic changes/close unmount the frame; shrinking below the threshold unmounts it. A failed dataset or blocked frame leaves useful recovery text/link. No unexpected parent-document keyboard effects occur. |

The existing `LandingPage.test.tsx` and `LiveOrderBook.test.tsx` mock `ExplorEda`; extend them for routing, width gating, reset, and failure UI, but do not substitute those tests for the real-browser filter checks. Reuse the registry/ID consistency pattern from `coverage.test.ts`. The current bar source explicitly snaps numeric brushes to bins and distinguishes category keyboard selection from inspection; the proof should preserve those distinctions.

Reject the preferred system if it needs server rewrites, breaks existing URLs, requires unsupported package imports, cannot isolate browser-only code, or cannot retain narrow-screen reading without redesigning charts. Also reject it in favor of Starlight if image authoring requires per-page glue, navigation/search requirements force a custom content framework, or the shell/asset/embedding infrastructure exceeds 20 engineering hours before the three-page proof is reliable. That cap is a proposed scope limit, not a measured delivery estimate.

An iframe-policy restriction alone rejects the default embed strategy, not necessarily the whole system: try the already-supported direct-workspace pattern once, with the same CSS/focus tests. If neither actual-example path works, the interactive hard gate remains unresolved; do not silently downgrade acceptance to screenshots only. Starlight would not automatically cure a package-level embedding defect.

Rollback: remove the docs query branch, navigation entry, MDX plugin, and proof-only modules; preserve existing example URLs and the deployment root. Before public release, no compatibility redirect is needed. After URLs have been published, retain a small query-to-fallback topic mapping using ordinary client navigation while keeping the demo root intact. Move approved prose/images to Starlight; do not keep two independently edited copies. Retain independently justified base-path/toolchain fixes only after their own validation.

## 10. Effort and ongoing cost

Estimates assume one developer familiar with the existing React code, approved prose scope, reusable fixtures, and no product-level bugs uncovered. They are planning judgments—not measured build times or promises.

| Work | Planning range |
| --- | --- |
| Vite/MDX infrastructure and technical proof | 12–20 engineering hours |
| Draft/review three proof pages and capture figures | 6–12 additional hours |
| Starlight infrastructure/proof instead | 16–28 engineering hours, including build assembly and integration |
| Remaining eight view pages | Roughly 2–5 hours each; source review and interaction complexity dominate |

TSX-only pages save compiler setup initially but put recurring prose/figure work into JSX. Vite/MDX adds a compiler dependency and a small shell to maintain, while retaining one app build and existing styling. Starlight adds a second framework configuration and theme boundary but removes much of the custom navigation, static-page, image, and search work. Docusaurus and Nextra also add independent framework upgrade surfaces without a compensating requirement here.

Control drift through one example catalogue, source-linked rendering notes, verified chart memberships, and capture metadata. Reuse live fixtures by URL rather than copying rows/settings into a second application. Keep experimental/future rendering information clearly labelled and outside claims of shipped support. Docs-only changes should follow the repository’s existing release/changeset guidance, not imply a library API release. ([Examples](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/demos/examples.ts), [AGENTS](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/AGENTS.md))

The existing app stops being the simplest choice when pre-rendered/no-JavaScript article reading or body-text search becomes required, when responsive image generation becomes routine enough to warrant an asset pipeline, or when the docs shell consumes repeated maintenance beyond the proposed components/catalogue. Those are specific triggers for Starlight—not a need to wait for an arbitrary page count.

## 11. Acceptance gates and remaining uncertainties

| Hard gate | Preferred design evidence | Fallback evidence | Current status |
| --- | --- | --- | --- |
| One static Pages deployment | Existing Vite output/upload plus build-time MDX. | Static Astro output staged beside demo. | Supported by source/docs; not built here |
| Image-heavy workflow | Imported files, shared figures, offline sizing. | Markdown/MDX images and Astro asset support. | Defined; visual/capture proof pending |
| Actual interactive explorEDA | Existing example URL mounts real `ExplorEda`. | Same demo frame; optional React island. | Existing source path verified; new embed not exercised |
| Browser-only mount boundary | Frame loads browser app only. | Frame, or `client:only` wrapper without eager package import. | Explicit; new integration untested |
| Links, refresh, deployment bases | Root query URLs and base-aware runtime assets. | Physical directory/index pages and separate demo base. | Concrete design; live host settings unverified |
| Solo-developer maintenance | One build; bounded shell compared with TSX baseline. | More integration, less content infrastructure. | Estimated; proof can reject estimates |

The evidence for these gates is the inspected [deployment workflow](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/.github/workflows/deploy.yml), [existing embed](https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696/apps/demo/src/landing/LiveOrderBook.tsx), [MDX integration](https://mdxjs.com/packages/rollup/), [Vite Pages guidance](https://v6.vite.dev/guide/static-deploy), [Astro deployment](https://docs.astro.build/en/guides/deploy/github/), [client directives](https://docs.astro.build/en/reference/directives-reference/), and [output configuration](https://docs.astro.build/en/reference/configuration-reference/).

The smallest remaining evidence is not another framework survey. It is: the three-page output and browser record; a confirmation of actual Pages/custom-domain settings; visually checked screenshots from the pinned/current implementation; and a compatible locked dependency installation. Resolve the tooltip and curated-image policy points before expanding reusable UI. Verify a standalone Color Legend example before declaring eleven-view example coverage complete.

A later 3D page needs its own WebGL/no-WebGL check. This proof intentionally does not establish all-view accessibility, large-data performance, atomic render revision guarantees, or universal trace coverage.

**Checks actually performed:** read-only repository/ref/branch comparison, required-source inspection, package-export/API-boundary inspection, screenshot metadata/encoded retrieval, and official documentation verification.

**Checks not performed:** install, dev server, build, preview, type-check, tests, `check:ui`, `pnpm check`, browser interaction, visual screenshot validation, and deployment. Historical checks described inside repository documents are not checks run for this report.

## Sources and access dates

All sources below were accessed during this research on October 1, 2026 EDT / October 2, 2026 UTC. Repository file links are pinned to the inspected SHA.

Observed statements describe retrieved repository content; documented capability statements refer to official tool documentation; proposed architecture, scores, cost estimates, and acceptance thresholds are inferences/proposals, not test results.

**Repository evidence** (pinned to `3cc4117`; `R` = `https://github.com/byronwall/explorEDA/blob/3cc4117fc393efc7fede0da298b8229d3fb6c696`):
[commit](https://github.com/byronwall/explorEDA/commit/3cc4117fc393efc7fede0da298b8229d3fb6c696),
[baseline branch](https://api.github.com/repos/byronwall/explorEDA/git/ref/heads/codex/feedback-round-2-tooltip-handoff),
[comparison](https://github.com/byronwall/explorEDA/compare/5c92e32a9d7d3e61b7cbf422897cd38555c9a7cd...3cc4117fc393efc7fede0da298b8229d3fb6c696);
`R/apps/demo/src/LandingPage.tsx`, `R/apps/demo/src/demos/examples.ts`, `R/apps/demo/src/landing/LiveOrderBook.tsx`, `R/docs/ui-defaults.md`, `R/docs/intent/chart-and-rendering-docs/initiative-map.json`,
[image metadata](https://api.github.com/repos/byronwall/explorEDA/contents/apps/demo/public/landing),
`R/package.json`, `R/apps/demo/package.json`, `R/apps/demo/src/main.tsx`, `R/packages/explorEDA/src/components/ExplorEda.tsx`, `R/packages/explorEDA/README.md`, `R/packages/explorEDA/src/components/charts/ChartRenderer.tsx`, `R/packages/explorEDA/src/charts/registerAllCharts.ts`, `R/.github/workflows/deploy.yml`, `R/apps/demo/vite.config.ts`, `R/README.md`, `R/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx`, `R/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx`, `R/docs/application-feature-inventory.md`, `R/docs/intent/deterministic-rendering-and-data-traceability/scatter-tracing-status.md`, `R/apps/demo/src/demos/dashboardSettings.ts`, `R/AGENTS.md`, `R/docs/intent/chart-and-rendering-docs/intent-brief.md`, `R/docs/intent/chart-and-rendering-docs/shape-brief.md`, `R/docs/intent/chart-and-rendering-docs/implementation-plan.md`, `R/apps/demo/src/demos/categoricalChartSettings.ts`, `R/docs/intent/chart-and-rendering-docs/comparative-research.md`, `R/apps/demo/src/LandingPage.test.tsx`, `R/apps/demo/src/demos/coverage.test.ts`, `R/apps/demo/src/landing/LiveOrderBook.test.tsx`, `R/packages/explorEDA/package.json`, `R/packages/explorEDA/tsup.config.ts`, `R/packages/explorEDA/src/providers/DataLayerProvider.tsx`, `R/pnpm-workspace.yaml`, `R/packages/explorEDA/src/charts/registry.ts`.

**Official tool evidence:**
[MDX/Vite plugin](https://mdxjs.com/packages/rollup/),
[MDX integration order](https://mdxjs.com/docs/getting-started/),
[Vite 6 assets](https://v6.vite.dev/guide/assets),
[MDX component mapping](https://mdxjs.com/packages/react/),
[Starlight authoring](https://starlight.astro.build/guides/authoring-content/),
[Astro Pages deployment](https://docs.astro.build/en/guides/deploy/github/),
[Starlight search](https://starlight.astro.build/guides/site-search/),
[Astro client directives](https://docs.astro.build/en/reference/directives-reference/),
[React integration](https://docs.astro.build/en/guides/integrations-guide/react/),
[Docusaurus static generation/browser boundary](https://docusaurus.io/docs/advanced/ssg),
[Docusaurus React/MDX](https://docusaurus.io/docs/markdown-features/react),
[Docusaurus assets](https://docusaurus.io/docs/markdown-features/assets),
[Docusaurus deployment](https://docusaurus.io/docs/deployment),
[Nextra static export](https://nextra.site/docs/guide/static-exports),
[Nextra images](https://nextra.site/docs/guide/image),
[Next.js client-only loading](https://nextjs.org/docs/app/guides/lazy-loading),
[Vite 6 Pages deployment](https://v6.vite.dev/guide/static-deploy),
[Vite 6 base rewriting](https://v6.vite.dev/guide/build),
[Astro output/base configuration](https://docs.astro.build/en/reference/configuration-reference/),
[pnpm compatibility](https://pnpm.io/installation),
[GitHub Pages hosting model](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[Starlight framework components](https://starlight.astro.build/components/using-components/).

## Final status

**PROVISIONAL** — chosen system: existing Vite/React demo + build-time MDX, with on-demand existing-demo iframe examples. Fallback: static Astro/Starlight. Inspected commit: `3cc4117fc393efc7fede0da298b8229d3fb6c696`. Checks run: source/ref comparison and official-documentation research only, not project commands or browser tests. Unresolved blockers to adoption: bounded proof, live hosting/base confirmation, dependency/toolchain validation, and visual/policy checks. Delivery: complete report above and a downloadable Markdown file; suggested repository save path only, not written through GitHub.
