# Embeddable EDA and embedded-analytics alternatives (competitive landscape and the "free alternative ceiling")

Access date for all sources: 2026-10-10 unless a source line says otherwise. "Verified" means read directly from the cited page in this session; "aggregator" means a third-party listing (G2, Capterra, toolradar, gittrend, etc.) whose snapshot date is often unclear. Star counts and npm download figures move quickly; treat them as order-of-magnitude.

Scope note: the hypothetical product is a commercial React component giving a host app an interactive EDA workspace (many chart types, crossfilter-style linked filtering across charts, data table, calculations, saved/restorable layouts, multi-source "project" mode with row-level tracing). The questions below are answered against that bar.

## Key Question 1: Which free tools already deliver linked crossfilter-style multi-chart exploration as a drop-in React component, and how polished are they?

### Takeaway
No free tool ships the full bundle (drop-in React component + many chart types + linked cross-chart filtering + data table + calculations + host-restorable state + multi-source row tracing). The closest free pieces are Graphic Walker (polished single-chart Tableau-style builder in React, Apache-2.0, but no cross-chart linking), Perspective (polished grid+charts with expressions and React bindings, Apache-2.0, finance-oriented, workspace linking exists but is thinly documented), and Mosaic/vgplot (true crossfilter over DuckDB, but a grammar for developers, not an end-user UI, and no official React wrapper).

### Cited Findings

**Graphic Walker (Kanaries)**
- Repo shows 3.3k stars, 190 forks, Apache-2.0 license (with a separate LICENSE2 for Kanaries logos). Features: drag-and-drop builder on vega-lite; mark types bar/line/area/scatter and concat views; facets via rows/columns; aggregations sum/mean/count/median/min/max/variance/stdev; filters `oneOf`/`notIn`/`range`/`timeRange`; inline computed fields via `expr`/`bin`/`log`; export via `exportChart`/`exportChartList` and re-import from local file; "Data Explainer"; GeoJSON/TopoJSON; chat interface; light/dark themes; en/zh/ja i18n; client-side computation in web workers by default with an optional server-side `computation` function (gw-dsl-parser translates specs to SQL). React components: `GraphicWalker`, `GraphicRenderer`, `PureRenderer`, `TableWalker` (paginated table, page size 20). Stated positioning: "embeddable, lite plugin rather than a heavy BI platform"; `uiTheme` in beta; `spec` prop is internal, `storeRef` is the recommended control path. Cross-chart linking is not mentioned anywhere on the README — [GitHub Kanaries/graphic-walker](https://github.com/Kanaries/graphic-walker) (verified)
- GitHub issue search for "cross filter linked" in Kanaries/graphic-walker returned 0 results (27 open issues total at access time) — [GitHub issues search](https://github.com/Kanaries/graphic-walker/issues?q=is%3Aissue+cross+filter+linked) (verified)
- Kanaries FAQ performance guidance: client-side mode depends on browser memory; under 10K rows rated excellent; above 1M rows use server-side computation via the `computation` prop — [Kanaries FAQ (zh)](https://docs.kanaries.net/zh/graphic-walker/faq) (search snippet)
- npm weekly downloads for `@kanaries/graphic-walker`: 5,620 (week ending ~2026-10-08) — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@kanaries/graphic-walker) (verified)
- Paid tiers for embedding (see KQ2): Startup $199/mo or $1,900/yr per domain; Enterprise $2,000/mo or $20,000/yr per domain, with self-host and white-label license — [kanaries.net/graphic-walker](https://kanaries.net/graphic-walker) (verified)

**PyGWalker (Kanaries, Python binding of Graphic Walker)**
- 15.8k stars, 865 forks, last push Apr 4, 2026 — [gittrend](https://gittrend.io/repo/Kanaries/pygwalker) (aggregator); 10.5k stars and 612k PyPI downloads as of June 2024 per the authors' paper — [arXiv 2406.11637](https://arxiv.org/html/2406.11637v1)
- Show HN "Turn your Pandas dataframe into a Tableau-style UI for visual analysis" got 712 points / 61 comments on 2023-02-20 (HN item 34869244); follow-ups got 61 and 71 points — [HN Algolia API](https://hn.algolia.com/api/v1/search?query=pygwalker&tags=story) (verified)
- Kanaries funding: no source found in this session (Snyk "Funding: No" refers to repo metadata, not company financing) — [Snyk pygwalker](https://snyk.io/advisor/python/pygwalker)

**Perspective (originally J.P. Morgan -> FINOS -> OpenJS Foundation)**
- GitHub shows 11.3k stars, 1.3k forks, Apache-2.0; repo now lives at `perspective-dev/perspective` and React bindings are `@perspective-dev/react`. Features: Custom Element viewer with drag-and-drop query/layout config; virtual-scrolling editable datagrid; WebGL charting with 15+ chart types; tile-based maps; themes; columnar expression language based on ExprTK; C++ streaming engine compiled to WASM/Python/Rust; reactive joins; Arrow/CSV/JSON streaming; virtual servers for DuckDB, ClickHouse, PostgreSQL, Polars; Jupyter widget via anywidget; OPFS paging in browser. "Used by" section is empty on GitHub — [GitHub perspective](https://github.com/finos/perspective) (verified; redirects to perspective-dev)
- Perspective joined the OpenJS Foundation as an Incubating Project, announced 2025-10-30; the post names J.P. Morgan only as original contributor and no other adopters — [OpenJS blog](https://openjsf.org/blog/perspective-joins-openjs) (verified)
- FINOS launched the Data Analytics Visualization Program in Nov 2018 with J.P. Morgan contributing Perspective — [FINOS press release](https://finos.org/press/finos-announces-launch-of-data-analytics-visualization-program-and-contributions-from-jp-morgan)
- `@finos/perspective-workspace` is described as "A Custom Element for coordinating multiple perspective-viewer instances with docking, tabbing, filtering, and state management capabilities" — [tessl registry listing](https://tessl.io/registry/tessl/npm-finos--perspective-workspace/evals) (aggregator)
- Viewer API supports `viewer.restore(config)` followed by `await viewer.flush()` — [perspective viewer API docs](https://perspective.finos.org/viewer/classes/dist_wasm_perspective-viewer.d.ts.PerspectiveViewerElement.html) (search snippet; perspective.finos.org and docs.perspective-dev.org both failed DNS during fetch attempts this session)
- npm weekly downloads for `@finos/perspective-viewer`: 15,101 — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@finos/perspective-viewer) (verified; note the package may be migrating to the `@perspective-dev` scope, so this likely undercounts)

**Mosaic / vgplot (UW Interactive Data Lab)**
- The crossfilter example links two histograms over 200k flight rows with `vg.Selection.crossfilter()`; the spec can also be written in YAML/JSON — [idl.uw.edu Mosaic crossfilter example](https://idl.uw.edu/mosaic/examples/crossfilter.html)
- vgplot is "a grammar of interactive graphics" whose marks act as Mosaic clients, rendering SVG via Observable Plot; interactive filtering does not work if raw data arrays are passed directly instead of going through the database — [idl.uw.edu vgplot](https://idl.uw.edu/mosaic/vgplot)
- React options are third-party: `@sqlrooms/mosaic` exposes a `VgPlotChart` component and `useMosaic` hook — [npm @sqlrooms/mosaic](https://npmjs.com/package/@sqlrooms/mosaic); Cosmograph's `MosaicVgplotComponent.mount()` attaches vgplot to its crossfilter — [cosmograph docs](https://cosmograph.app/docs-lib/api/interfaces/MosaicVgplotComponent/). No official IDL React wrapper surfaced.
- Observable Framework docs show the same DuckDB-backed `Selection.crossfilter()` pattern linking maps and a histogram — [observablehq.com/framework/lib/mosaic](https://observablehq.com/framework/lib/mosaic)
- npm weekly downloads for `@uwdata/vgplot`: 26,894 — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@uwdata/vgplot) (verified)

**dc.js / crossfilter / react-pivottable (legacy React-adjacent options)**
- dc.js GitHub page says it is seeking new maintainers (issue #1868); Best of JS lists last commit ~2 years old, ~128 contributors — [dc.js GitHub](https://www.Github.com/dc-js/dc.js); [bestofjs](https://bestofjs.org/projects/dcjs) (aggregator)
- Crossfilter is maintained by a community fork under the Crossfilter org; original README claims <30ms interaction on >1M rows — [crossfilter README](https://cdn.jsdelivr.net/gh/square/crossfilter@master/README.md)
- React wrappers `react-dc-js` ("still under heavy development and not yet stable") and `react-dc` ("needs more testing before production use") — [npm react-dc-js](https://npmjs.com/package/react-dc-js); [GitHub react-dc](https://github.com/waldojeffers/react-dc)
- LightTag's write-up on combining dc.js with React: "React feels like a declarative paradigm whereas DC is very much imperative" — [lighttag.io](https://www.lighttag.io/blog/react-dc-js/)
- react-pivottable: only the 2017 launch post surfaced (React port of PivotTable.js using Plotly.js); no 2025/2026 maintenance evidence found — [codeburst intro](https://codeburst.io/introducing-react-pivottable-4bfdd511afed)

**Observable Plot / Framework**
- Observable Plot: ISC license, ~4.6k–5.3k stars depending on tracker snapshot — [ossinsight plot](https://ossinsight.io/analyze/observablehq/plot); [gittrend plot](https://gittrend.io/repo/observablehq/plot) (aggregators)
- Observable Framework: ISC, ~3.5k stars; supports React/TypeScript and polyglot data loaders (Python, R, SQL) — [gittrend framework](https://gittrend.io/repo/observablehq/framework); [r-bloggers overview](https://www.r-bloggers.com/2024/11/big-scale-data-dashboards-with-observable-framework/)

**Evidence.dev, Rill, Datasette, Vizro (not drop-in React components)**
- Evidence: MIT; SQL + Markdown framework producing data apps; docs mention "embedded dashboards" but no React component API surfaced — [dev.co listing](https://dev.co/devops/open-source/evidence); [docs.evidence.dev](https://docs.evidence.dev)
- Rill: Apache-2.0 (v0.88.3 published Jul 23, 2026); README says "Embeddable — Dashboards, APIs, and agent interfaces you can ship in your product" and describes itself as "agent-first" BI on ClickHouse/DuckDB — [pkg.go.dev rill v0.88.3](https://pkg.go.dev/github.com/rilldata/rill@v0.88.3)
- Datasette: "Datasette Apps" (June 2026) are HTML+JS apps running in a constrained iframe inside Datasette, not a component for embedding Datasette in another app — [simonwillison.net Datasette Apps](https://simonwillison.net/2026/jun/18/datasette-apps)
- Vizro (McKinsey): Apache-2.0 Python toolkit on Plotly/Dash/Pydantic; FAQ frames React as an extension path (wrap React components inside Dash), not a React product; aimed at users who "don't know front-end development" — [Vizro FAQ](https://vizro.readthedocs.io/en/stable/pages/explanation/faq/); [GitHub mckinsey/vizro](https://github.com/mckinsey/vizro). Star count not found in trackers.

**Apache Superset embedding**
- ~73k stars, Apache-2.0 — [ossinsight superset](https://ossinsight.io/analyze/apache/superset) (aggregator)
- Embedded SDK embeds dashboards in a sandboxed iframe; requires `EMBEDDED_SUPERSET` feature flag, strong `GUEST_TOKEN_JWT_SECRET`, admin-configured allowed domains, server-minted guest tokens from `/api/v1/security/guest_token/` with `can_grant_guest_token`; row-level security via guest token rules; extra iframe sandbox permissions via `iframeSandboxExtras`. README describes embedding "dashboards" only — [Superset embedded SDK README](https://apache.googlesource.com/superset/+show/HEAD/superset-embedded-sdk/README.md); [superset.apache.org embedding docs](https://superset.apache.org/user-docs/using-superset/embedding) (search snippets; direct docs fetches 404'd)
- Community answer: guest tokens "do not map to your existing tenant FAB roles," so access separation must be enforced in token-minting code — [GitHub discussion #36975](https://github.com/apache/superset/discussions/36975)

**Flourish / Datawrapper (brief, non-embeddable-component comparison)**
- Datawrapper offers a `datawrapper-visualization` web component embed; Reuters publishes an unofficial `DatawrapperChart` React wrapper. Pricing on the blog (free up to 10k views, team €129/mo) is from 2016 and explicitly outdated — [datawrapper web component](https://www.datawrapper.de/blog/web-component-embedding); [Reuters graphics-components](https://cdn.jsdelivr.net/npm/@reuters-graphics/graphics-components@4.7.0/dist/llm-docs/components/DatawrapperChart.md)
- Flourish recommends a script embed with iframe fallback; free plan publishes publicly, paid for private/branded — [Flourish help center](https://helpcenter.flourish.studio/hc/en-us/articles/8761537208463-How-to-embed-Flourish-charts-in-your-CMS)
- Neither tool's docs cover linked/coordinated charts (no sources found).

### Inferences
- Graphic Walker is the most direct free analogue for the "React component" form factor and is polished as a single-view builder, but its architecture is one chart spec at a time (plus a renderer and a paginated table); cross-chart crossfilter, record-level drill-down, and host-level layout restore are absent from its README and from its issue tracker, which suggests users are not even asking Kanaries for them there.
- Perspective is the most capable free engine (expressions, joins, streaming, 15+ charts, grid) and has the workspace concept for coordinating viewers, but its documentation of cross-viewer filtering was not reachable this session; its empty "Used by" and finance-origin positioning suggest it is adopted by engineering teams willing to assemble things, not by product teams wanting a finished exploration UI.
- Mosaic/vgplot is the strongest free implementation of linked crossfilter itself, but it is a visualization grammar plus DuckDB coordinator, not an end-user UI: no field pickers, no chart-type menus, no data table, no save/restore, no React wrapper from the authors. A team adopting it is building a product, not dropping in a component.
- dc.js/crossfilter/react-pivottable are the older generation; maintenance signals (maintainer call, two-year-old commits, "not production ready" React wrappers) make them a weak free ceiling.
- Superset, Metabase, Evidence, Rill, Vizro, Observable Framework, Datasette are applications or site generators, not React components; "embedding" them means iframes or SDKs that bring the whole BI app and its auth model with them.

### Gaps
- Perspective workspace documentation (global filters, master/detail linking, save/restore of workspace layout) could not be fetched: perspective.finos.org, docs.perspective-dev.org, and the GitHub docs path all failed. From prior knowledge (unverified this session) `perspective-workspace` supports a "master" viewer mode whose row selection filters "detail" viewers and `workspace.save()`/`restore()` for layout; confirm before quoting.
- No GitHub star count found for Vizro; no npm download data found for `@perspective-dev/react` (new scope).
- No independent user reviews or complaint threads for Graphic Walker surfaced (search returned unrelated results).
- Rath and Muze: no results on current status; likely dormant but unverified.

## Key Question 2: What do embedded-analytics platforms charge, in what unit, and how do they position against "build it yourself with charts"?

### Takeaway
Paid embedded-analytics platforms cluster at roughly $500–$2,500 per month entry points, priced per internal seat plus end-user counts (Metabase, Cube), per domain (Kanaries), per MAU/synced rows (Luzmo), or by custom scope quote (Embeddable, Dash Enterprise, Explo/Omni). Their positioning against DIY is uniform: building takes months once permissions, drill-downs, exports, multi-tenancy and self-service are included; none positions as a component you own, and several explicitly sell "self-service for end users" as the premium capability.

### Cited Findings

**Metabase (AGPL core; embedding paid)**
- Pricing page: Open Source free/unlimited users; Starter $100/mo ($1,080/yr) with $6/user/mo beyond first 5; Pro $575/mo ($6,210/yr) with $12/user/mo beyond first 10; Enterprise custom starting at $20,000/yr. "Advanced embedding features are available on the Pro and Enterprise plans." Pro includes unlimited embedded charts/dashboards, multi-tenant embedded analytics, whitelabel readiness, row/column permissions, SSO. Usage add-ons: AI service $3.75 per 1M tokens, transforms $0.01/run after 1,000, storage from $2 per 1M rows — [metabase.com/pricing](https://www.metabase.com/pricing) (verified)
- "Both your internal team developing analytics and users of your embeds accessed through your product count as users" — [metabase.com/pricing](https://www.metabase.com/pricing) (verified)
- Embedded analytics SDK for React (`@metabase/embedding-sdk-react`) embeds charts, dashboards, and the query builder; available on Pro and Enterprise — [Metabase embedding overview](https://www.metabase.com/docs/latest/embedding/start)
- npm weekly downloads for `@metabase/embedding-sdk-react`: 58,120 (2026-10-02 to 2026-10-08) — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@metabase/embedding-sdk-react) (verified)
- Older competitor-reported price: Pro $500/mo incl. 10 users + $10/user — [embeddable.com blog on Metabase pricing](https://embeddable.com/blog/metabase-pricing) (competitor; stale). The requested "2024 pricing change" could not be pinned to a dated primary source; the current page shows the $575/$12 structure and Starter now exists at $100/mo with no embedding.
- Metabase ~49k GitHub stars (Aug 2026 snapshot) — [ideaproof](https://ideaproof.io/open-source/project/metabase) (aggregator)
- Complaints: G2 summaries cite slow performance under high query volume and large datasets; community threads report iframe embeds slower than in-app (0.35.2, 2021) and ~30s first load from uncached JS (0.47) — [G2 review](https://www.g2.com/survey_responses/metabase-review-4849393); [discourse: embedded questions slower](https://discourse.metabase.com/t/embeded-questions-considerably-slower-than-before/9984); [discourse: iframe slow](https://discourse.metabase.com/t/metabase-iframe-is-slow-to-load/35469). Competitor blogs (Toucan, Embeddable) call iframes "slow and clunky" and "feel foreign" — [toucantoco](https://www.toucantoco.com/en/blog/metabase-alternatives); [embeddable.com](https://embeddable.com/blog/metabase-alternatives-embedded-analytics) (competitor sources)

**Kanaries / Graphic Walker (paid)**
- Startup: $199/mo or $1,900/yr per domain, 1-domain integration license, 15 Kanaries Pro seats, dev support, 48h response. Enterprise: $2,000/mo or $20,000/yr per domain, self-host license, 50 Pro seats, 24h priority support, additional domains, white-label. Enterprise features listed: ClickHouse/StarRocks/Snowflake pushdown, RBAC, audit logs, lineage, custom connectors. "Trusted by developers and data teams worldwide" and "Featured on Hacker News" but no customer logos — [kanaries.net/graphic-walker](https://kanaries.net/graphic-walker) (verified)

**Plotly Dash / Dash Enterprise**
- Dash repo ~24.2–24.3k stars (June 2026) — [star-history](https://www.star-history.com/plotly/dash); [oosmetrics](https://oosmetrics.com/repo/plotly/dash) (aggregators)
- Dash Enterprise pricing unpublished; G2 says contact vendor — [G2 Dash Enterprise pricing](https://www.g2.com/products/plotly-dash-enterprise/pricing). ITQlick estimates "$5,000 per installation" and implementation $5k–$20k SMB / $100k+ enterprise — [itqlick](https://www.itqlick.com/dash-enterprise/pricing) (aggregator, low confidence). A PeerSpot reviewer at a non-profit cited roughly $100k/yr — [peerspot comparison](https://origin.peerspot.com/products/comparisons/plotly-dash-enterprise_vs_qlik-sense) (single anecdote)

**Cube / Cube Cloud**
- Pricing page: Free $0; Starter $40/developer/mo; Premium $80/developer/mo (adds Explorer seats $40/user/mo and Viewer seats $20/user/mo); Enterprise custom. Embedded dashboards and embedded analytics chat are Premium+ only. Daily request limits: Free 1,000; Starter 10K shared / 50K dedicated; Premium unlimited; hourly fees for dedicated deployment, API instances, Cube Store workers — [cube.dev/pricing](https://cube.dev/pricing) (verified)
- React Embed SDK "currently in public preview" — [docs.cube.dev react-embed-sdk](https://docs.cube.dev/embedding/react-embed-sdk)
- Third-party: Vendr contract data suggests $1,500–$4,000/mo at 100K–1M queries/month — [vendr cube](https://www.vendr.com/marketplace/cube-dev); CostBench claims Cube no longer publishes fixed tiers and cites $1,250/mo Essential, contradicted by the live pricing page above — [costbench](https://www.costbench.com/software/fpa-software/cube/) (conflict; the live page wins)
- Funding: $6.2M seed (Bain Capital Ventures), $15.5M Series A (Decibel, July 2021), $25M round June 2024 (Databricks Ventures per one source); cumulative estimates $40.5M–$46.7M across aggregators — [cube.dev blog seed](https://cube.dev/blog/cube-dev-raises-62m-to-accelerate-cubejs-development); [opensourceforu Series A](https://www.opensourceforu.com/?p=50223); [vcbacked](https://www.vcbacked.co/company/cube-dev); [clay](https://clay.com/dossier/cube-dev-funding) (aggregators disagree)

**Luzmo (formerly Cumul.io)**
- Pricing page: one plan "Embedded Everywhere," from €1,995/mo billed annually, "nothing is reserved for a higher plan"; includes white-label, "self-service for your end users," embedding in app/chat/MCP/agents, AI and APIs. Usage units: 500 AI conversations/mo included; 100M synced "Warp rows"/mo included then €0.25 per million; some contracts scale on MAU (end users, not internal seats) — [luzmo.com/pricing](https://www.luzmo.com/pricing) (verified)
- Aggregators list older tiers: Starter $495/mo and Premium $1,995/mo (PricingSaaS), or Basic $995 / Pro $2,050 / Elite $3,100 (toolradar), Capterra "from $995/mo" — [pricingsaas cumul](https://pricingsaas.com/companies/cumul); [toolradar luzmo](https://toolradar.com/tools/luzmo/pricing); [capterra luzmo](https://www.capterra.com/p/180092/Luzmo/pricing/) (stale/conflicting; live page wins)
- Funding: $15.55M over 4 rounds, latest Series A-II $10.79M Jan 2023 (CB Insights) vs $10.8M total (VCBacked); investors SmartFin, Axeleo, Hi Inov, LRM — [cbinsights cumulio](https://www.cbinsights.com/company/cumulio/financials); [vcbacked luzmo](https://www.vcbacked.co/company/luzmo)

**Embeddable (embeddable.com)**
- Pricing page: three tiers (Startup/Early stage, Scale-up/Mid-market, Enterprise) with no listed prices; "flat monthly subscription" with unlimited usage and every feature, "primarily based on project scope," custom quote. All plans include granular security, developer SDKs, full extensibility, white-label by default — [embeddable.com/pricing](https://embeddable.com/pricing) (verified)
- Competitor claim: prices per employee and requires a sales call — [luzmo.com blog on Embeddable pricing](https://www.luzmo.com/blog/embeddable-pricing) (competitor). Toolradar lists a Lite plan $499/mo with 1,000 dashboard sessions/mo — [toolradar embeddable](https://toolradar.com/tools/embeddable/pricing) (aggregator, unconfirmed)
- Funding: €6M (~$6.28M) seed led by OpenOcean, Dec 2024, with Four Rivers and Techstars — [SiliconANGLE](https://siliconangle.com/2024/12/12/embedded-analytics-startup-embeddable-raises-e6m-seed-funding/)
- HN launch "Embeddable: A developer toolkit for building fast interactive embedded analytics" got 11 points / 1 comment (2024-06-17) — [HN Algolia API](https://hn.algolia.com/api/v1/search?query=%22embedded%20analytics%22&tags=story) (verified)

**Explo (acquired by Omni)**
- Omni acquired Explo on 2025-10-22; Explo operates as a wholly owned subsidiary with a 12-month transition — [Fenwick](https://www.fenwick.com/insights/experience/fenwick-represents-omni-in-acquisition-of-explo). No primary source found for a sunset date; Embeddable's blog claims customers are expected to migrate before sunset — [embeddable.com Explo alternatives](https://embeddable.com/blog/explo-alternatives) (competitor)
- Pre-acquisition pricing: Growth $795/mo, Pro $2,195/mo, priced by number of customer logos — [softwaresuggest explo](https://www.softwaresuggest.com/explo/pricing); [explo blog pricing 101](https://explo.co/blog/embedded-analytics-pricing-101)

**Pricing-unit summary (as found)**
- Per internal seat + per end user: Metabase (embed viewers count as users), Cube (developer/explorer/viewer seats)
- Per domain / per deployment: Kanaries Graphic Walker
- Flat platform fee + usage (rows, AI conversations) or MAU: Luzmo
- Flat subscription scoped by project: Embeddable
- Per customer logo: Explo (historical)
- Per installation / custom: Dash Enterprise
- Reference point for a developer-licensed component: AG Grid Enterprise from $999 per developer, Enterprise Bundle with AG Charts from $1,498 per developer (promo $1,198), perpetual with 1 year updates; Vendr median contract $14,233/yr (45 purchases), SpendHound SMB avg $6,995/yr and enterprise avg $35,040/yr — [ag-grid license pricing](https://ag-grid.com/license-pricing/); [charts.ag-grid.com](https://charts.ag-grid.com/license-pricing); [vendr ag-grid](https://www.vendr.com/marketplace/ag-grid); [spendhound](https://www.spendhound.com/marketplace/ag-grid-pricing)

**Positioning against DIY**
- insightsoftware: a platform "will be faster to buy, deploy, maintain, enhance, and upgrade than building analytics on your own" once beyond standard charts; building means developing each self-service capability one at a time — [insightsoftware](https://www.insightsoftware.com/blog/buy-your-embedded-analytics-and-empower-your-end-users-with-the-right-data/)
- Sigma: typical implementations take weeks while building from scratch takes months — [sigmacomputing](https://www.sigmacomputing.com/blog/embedded-analytics-build-or-buy)
- Reveal/Infragistics: build when you need total control or for small fast projects; buy for fastest time to market — [revealbi whitepaper](https://www.revealbi.io/?p=769)
- Basedash: four integration approaches (iframe, React SDK, API + custom charts, white-label); row-level security, token auth, tenant isolation are the hard parts; "building a complete analytics layer internally can take months once teams account for permissions, drill-downs, exports, refresh logic, and multi-tenant security" — [basedash](https://www.basedash.com/blog/how-to-embed-analytics-in-a-react-app-dashboards-charts-and-ai-queries)
- Sisense: "users and customers now expect intuitive, self-service analytics capabilities embedded within the very tools they use" — [sisense webinar](https://www.sisense.com/webinars/build-or-buy-embedded-analytics/)

### Inferences
- The market norm is a hosted platform with a data-connection and auth layer; price scales with end-user reach (viewers/MAU/logos). A pure client-side React component that works on data the host already has in memory sidesteps the multi-tenant security problem that drives platform pricing and vendor "build vs buy" arguments, which is both a differentiator and a reason platforms would not see it as a competitor.
- The Kanaries per-domain model ($1,900–$20,000/yr) is the closest existing price anchor for "embed a React exploration component," and AG Grid's per-developer perpetual license ($999–$1,498) is the closest anchor for how React component vendors price. A hypothetical product would sit between these.
- Entry prices of $575–$2,000/mo for platforms imply that a buyer with a budget for embedded analytics is accustomed to four-figure monthly spend; a component in the low hundreds per month or low thousands per developer-year is cheap by comparison.
- Explo's absorption into Omni and Embeddable's small seed round suggest the standalone "embedded dashboards" segment is consolidating; vendors are moving toward AI/chat and agents as the headline feature (Luzmo, Cube, Rill, Embeddable all lead with AI now).

### Gaps
- Dash Enterprise list price is not public; the "$5,000 per installation" figure is an aggregator estimate.
- Metabase's exact 2024 pricing-change date and old-vs-new table could not be sourced from a primary dated page; Wayback Machine would be needed.
- Luzmo's React/"Flex SDK" details and whether end users get a full self-service explorer were not on the pricing page.
- Omni/Explo sunset date: no primary source.
- No G2/Capterra review text for Luzmo, Embeddable, Cube, or Explo was read directly; only pricing listings.

## Key Question 3: Is there evidence of demand for an embeddable self-service exploration component?

### Takeaway
Demand signals are real but indirect: PyGWalker's 712-point Show HN, 15.8k stars and 612k+ PyPI downloads show appetite for a Tableau-style drag-and-drop EDA surface; Metabase's React SDK at ~58k weekly npm downloads and Cube shipping a React Embed SDK show host apps want component-level (not iframe) embedding; vendor copy consistently names "self-service" and "drill-down" as what customers ask for. However, no HN/Reddit threads or GitHub issues explicitly asking for "a React component with linked crossfilter exploration" were found, and HN interest in "embedded analytics" products specifically is low (most launches under 15 points).

### Cited Findings
- PyGWalker Show HN: 712 points, 61 comments (2023-02-20) — [HN Algolia](https://hn.algolia.com/api/v1/search?query=pygwalker&tags=story) (verified)
- PyGWalker: 612k PyPI downloads and 10.5k stars by June 2024; 15.8k stars by 2026 — [arXiv](https://arxiv.org/html/2406.11637v1); [gittrend](https://gittrend.io/repo/Kanaries/pygwalker)
- HN "embedded analytics" stories (41 hits): the top is "Show HN: Latitude – Developer-first embedded analytics" at 14 points; "Metabase's New Embedded Analytics SDK for React" got 3 points (2025-02-28); "Embedded Analytics as Code" 4 points (2025-12-19); "Ask HN: How do you choose a solution for embedded analytics?" 2 points / 4 comments (2021); "What are you using for embedded analytics?" 1 point (2025-05) — [HN Algolia](https://hn.algolia.com/api/v1/search?query=%22embedded%20analytics%22&tags=story) (verified)
- `@metabase/embedding-sdk-react` 58,120 weekly downloads vs `@kanaries/graphic-walker` 5,620 and `@finos/perspective-viewer` 15,101 and `@uwdata/vgplot` 26,894 — npm downloads API (verified, week ending ~2026-10-08)
- Cube released a React Embed SDK (public preview) offering "tighter integration with React's component model... more control over styling, theming, and user interactions compared to iframe embedding" — [docs.cube.dev](https://docs.cube.dev/embedding/react-embed-sdk)
- Metabase SDK lets hosts embed "individual components, standalone charts, dashboards, or the query builder itself" — [Metabase embedding docs](https://www.metabase.com/docs/latest/embedding/start)
- Plotly community thread: a developer asked how to integrate plotly.js-crossfilter into a React/Electron app while keeping instant filtering — [community.plotly.com](https://community.plotly.com/t/plotly-js-crossfilter-react/44463)
- OMERO's `parade-crossfilter` prototype built dc.js+crossfilter+React following the LightTag post, an example of a science team hand-rolling linked views in React — [PyPI parade-crossfilter](https://pypi.org/project/parade-crossfilter/)
- Reveal's listed self-service features that customers ask for: "in-context editing, data blending, dashboard linking, calculated fields" — [revealbi blog](https://www.revealbi.io/blog/embedding-self-service-bi-in-react-apps-with-node-js) (vendor)
- Kanaries markets Graphic Walker as "Trusted by developers and data teams worldwide" and sells per-domain embedding licenses, which is itself evidence a vendor found paying demand for an embeddable exploration component — [kanaries.net/graphic-walker](https://kanaries.net/graphic-walker) (verified)

### Inferences
- The strongest demand signal is for the end-user experience (Tableau-style drag-and-drop in your own environment), evidenced by PyGWalker's traction in notebooks, rather than for the React packaging per se. The React packaging demand shows up as adoption of SDKs from platforms (Metabase, Cube) whose iframes developers dislike.
- Low HN enthusiasm for "embedded analytics" launches suggests the buyer is a product/engineering lead with a budget, found through SEO, G2, and vendor comparison content, not through developer virality. Kanaries, Embeddable, Luzmo, and Explo all invest heavily in "X alternatives" and "X pricing" SEO pages, which is consistent with that.
- Absence of GitHub issues asking Graphic Walker for cross-chart linking may mean users treat it as a chart builder and do not expect dashboard-style linking from it, so a product offering linking must educate rather than ride existing demand.

### Gaps
- No Reddit r/reactjs or r/dataengineering threads surfaced in searches (search engine returned vendor pages instead); a direct Reddit search was not run.
- No job posts or agency blog posts about building internal analytics with these tools were found.
- No npm download trend over time (only a one-week point) and no trend for Graphic Walker's paid uptake.
- The Dresner "2025 Embedded BI Market Study" cited by Basedash was not located.

## Key Question 4: Where are the gaps the free tools leave that a paid component could own?

### Takeaway
Free tools leave open: (1) cross-chart crossfilter inside a finished React UI (Graphic Walker lacks it; Mosaic has it without a UI; Perspective has it only via workspace assembly); (2) record-level tracing from a mark back to source rows across multiple sources (no free tool surfaced claims this); (3) host-controlled save/restore of a whole workspace layout as plain state (Graphic Walker exports chart specs; Perspective restores viewer config; neither is a host-owned multi-chart layout object with filters); (4) calculations beyond per-chart computed fields; (5) working on host in-memory data without a server, auth layer, or iframe, which every paid platform requires.

### Cited Findings
- Graphic Walker README: computed fields are inline per-spec (`expr`/`bin`/`log`); state control is via `storeRef` and `exportChart`/`exportChartList`; data table is a paginated `TableWalker`; cross-chart linking not mentioned — [GitHub graphic-walker](https://github.com/Kanaries/graphic-walker) (verified)
- Graphic Walker FAQ: client-side performance depends on browser memory; >1M rows requires server-side computation — [Kanaries FAQ](https://docs.kanaries.net/zh/graphic-walker/faq)
- vgplot: interactive filtering only works when data goes through the DuckDB coordinator, not raw arrays; no official React wrapper — [idl.uw.edu vgplot](https://idl.uw.edu/mosaic/vgplot)
- Perspective: expression language (ExprTK), reactive joins, and virtual servers exist at the engine level; README does not describe save/restore or a workspace feature; "Used by" empty — [GitHub perspective](https://github.com/finos/perspective) (verified)
- Superset embedding is dashboard-only via sandboxed iframe with server-minted guest tokens and feature flags — [Superset embedded SDK README](https://apache.googlesource.com/superset/+show/HEAD/superset-embedded-sdk/README.md)
- Metabase counts every embed viewer as a billable user and gates embedding to Pro ($575/mo+) — [metabase.com/pricing](https://www.metabase.com/pricing) (verified)
- Cube gates embedded dashboards to Premium ($80/dev/mo + $20–$40 per end-user seat) — [cube.dev/pricing](https://cube.dev/pricing) (verified)
- Luzmo charges for synced rows and MAU because data flows through its platform — [luzmo.com/pricing](https://www.luzmo.com/pricing) (verified)
- Basedash: the hard parts of embedding a platform are row-level security, token auth, and tenant isolation — [basedash](https://www.basedash.com/blog/how-to-embed-analytics-in-a-react-app-dashboards-charts-and-ai-queries)
- dc.js (the one free library whose whole purpose is linked crossfilter charts) is seeking maintainers and its React wrappers self-describe as unstable — [dc.js GitHub](https://www.Github.com/dc-js/dc.js); [react-dc-js](https://npmjs.com/package/react-dc-js)

### Inferences
- The defensible niche is "the dc.js experience, finished": linked filtering across many chart types plus a table, with React-native state the host can serialize, on data already in the browser. dc.js proved the interaction model is wanted and then went unmaintained; nothing free replaced it with a React-first, polished product.
- Record-level tracing (mark -> rows -> source file/table across joined sources) is absent from every free tool surveyed and from the platforms' marketing; the platforms do "drill-down" into their own data model, not into host-provided heterogeneous sources. This is the clearest ownable gap, though demand for it is unproven.
- Host-restorable layout state is a natural moat because platforms keep state server-side (dashboards live in Metabase/Superset/Luzmo), and Graphic Walker's export is chart-level rather than workspace-level.
- The "no server, no auth, no iframe" property is the pricing wedge: platforms must charge by viewers because they bear compute and security; a component can price per developer or per app like AG Grid and leave viewers free.
- Risks to the gap: Kanaries could add dashboard linking (they already sell per-domain licenses and have the team); Perspective's workspace already coordinates viewers and is Apache-2.0 with 11k stars; Mosaic's DuckDB-WASM approach beats client-side JS on >1M rows, so a paid component needs a scalability story (web workers, DuckDB-WASM, or server computation hooks) or must position for the <1M-row sweet spot.

### Gaps
- Perspective workspace's actual linking semantics (whether a selection in one viewer filters others without custom code) is unverified this session; this materially affects how big the "linked filtering in React" gap is.
- No source quantifies how many Graphic Walker or Perspective embedders needed cross-chart linking and left; the gap is inferred from feature absence, not from user complaints.
- No evidence found on whether buyers value record-level tracing or multi-source joins; this should be validated with interviews rather than desk research.
