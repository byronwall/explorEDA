# explorEDA: landing-page and documentation review

**Research date:** 2026-10-15  
**Repository:** https://github.com/byronwall/explorEDA  
**Pinned baseline:** `ea8b52ff742f11d1fb89457acabbcd27b0bd04e7`; source capture supplied as 2026-10-15  
**Decision status:** **QUALIFIED GO** for source-grounded positioning/docs research and current official comparisons. **PARTIAL** for deployed UX, deployment drift and executable first-success verification.  
**Ownership:** Research recommendations only. Codex owns reconciliation, implementation decisions and the review PR. No source changes, installs, commits, pushes, deployments, account registrations or PRs were performed.

## Executive judgment

**The product is broader than its front door, while its chart documentation is stronger than its onboarding.** The baseline is not merely a browser CSV viewer or a React chart package: user docs and selected implementation substantiate local project folders, an account-based self-hosted server, five database adapters producing explicit-refresh snapshots, and `.eda.md` notebooks with supported chart/text round trips. These capabilities deserve visible entry routes now—not a future-work badge inherited from stale intent. They do not justify positioning explorEDA as a managed enterprise BI platform, a live-query dashboard service, or a Jupyter-style execution environment. [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [R28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/cli/serverCommand.ts#L1-L233) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498)

**Recommended positioning decision:** retain linked exploration as the memorable lead, broaden the subject from CSV to data, and make local analysis the primary journey. Present database snapshots and notebook authoring as early workflow extensions; make self-hosted team operation clearly discoverable; preserve React embedding as a distinct developer path. This is a proposal based on the current evidence, not a measured audience or conversion result. The alternative—leading with a broad analysis platform—would explain more capabilities but weaken the immediate demonstration and invite unsupported expectations.

The strongest assets to keep are the linked-view specimen, inspectable mark/row behavior, reusable examples, generated chart prerequisites/settings and detailed filtering/rendering explanations. The highest-value fixes are accurate mode/claim boundaries, a task-first landing/docs entry, and six short routes that end in observable success. A new CMS, forced Diátaxis navigation, broad enterprise governance and a wholesale rewrite would address the wrong problem. [R13](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146) [R16](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74) [P37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/trace.mdx#L1-L35) [P47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) [DX-1](https://diataxis.fr/) [DX-4](https://www.writethedocs.org/guide/docs-as-code/)

### Ranked decisions

| Decision | Recommendation and rationale |
|---|---|
| What leads? | Linked exploration, not an undifferentiated capability list. Use a broader data noun and immediately demonstrate a selection changing the intended linked views. |
| Who enters first? | Browser file explorers and local CLI analysts. Their proof requires no organizational deployment. This is a proposed default, not established audience analytics. |
| Where do the three priority capabilities belong? | Database snapshots and notebooks in the first workflow section; self-hosted teams in that section and a clear navigation/start route. None needs to become a third equal hero CTA. |
| What does the docs system need? | Better prerequisites, mode orientation and bounded first-success lessons, while keeping the generated reference and topical catalogue. |
| What must precede stronger promotion? | Correct absolute claims; verify package/container acquisition and six disposable-fixture task gates. |

## 1. Baseline, access and method

### 1.1 What was established

Connected GitHub access confirmed `byronwall/explorEDA`, its public repository identity and the exact pinned commit. The commit metadata records 2026-10-14T16:17:08Z. The supplied claim that this was the captured main baseline was retained; newer main was not substituted or used to reconcile source behavior. The review branch name was taken from the prompt and never checked out or modified. [B01](https://api.github.com/repos/byronwall/explorEDA/commits/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7)

The authorized packet contains 185 manifest-listed source files plus its manifest and prompt. All 185 SHA-256 values were recomputed and matched. There are exactly **47 MDX pages**, matching the catalogue, including **26 chart-typed pages** that receive generated template material. The packet is explicitly a selected snapshot, not a runnable checkout. A separate Git blob calculation for local `Hero.tsx` matched the pinned GitHub response. This independently cross-checks that file; it does not claim an independent remote byte comparison for all 185 files. [B04](https://github.com/byronwall/explorEDA/tree/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7) [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74)

Two bounded source supplements resolved real context gaps without changing the baseline: the package manifest confirms source-level CLI bins and React peer versions, and a GitHub directory listing confirms the forecast CSV exists at the pin. Package publication and forecast numerical outputs remain unverified. The CSV omission from the selected packet is **not** a product example gap. [B02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/package.json) [B03](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7)

### 1.2 Evidence vocabulary

- **Observed source:** text, symbols, test assertions, routes or metadata directly inspected at the pin. A test assertion is evidence of intended coverage, not a test result.
- **Observed official web content:** fetched page text and linked navigation, accessed 2026-10-15. Product interfaces, installers, signups, tabs and sample analyses were not executed.
- **Inference:** a judgment about comprehension, friction, credibility or likely maintenance cost. No conversion, performance or user-success rate is invented.
- **Proposal:** an unapproved change and its acceptance check. A proposed gate is not a claim that the baseline passes it.

All 47 MDX bodies were audited for purpose and content. Priority pages were traced into server/database/notebook source and selected tests. Representative chart, table, supporting-card, task and concept pages were inspected deeply with `GuidePage`, `AtAGlance`, `SavedSettings`, search and gate construction. The required repository guidance and package manifests were read. This is not a claim that every line of every one of the 185 files received a full implementation review. [R01](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/AGENTS.md#L1-L39) [R02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/agent-guide.md#L1-L149) [R03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/CODING_STANDARDS.md#L1-L28) [R04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/ui-defaults.md#L1-L139) [R05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/README.md#L1-L218) [R06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/package.json#L1-L32) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [R08](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/package.json#L1-L77) [R16](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314) [R19](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/searchIndex.ts#L1-L115) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216)

### 1.3 Live versus source: drift is unknown, not absent

| Surface | Source baseline and live-access result |
|---|---|
| `https://exploreda.dev/` | Source has the CSV/linked-chart hero and file/sample/package CTAs. The web tool returned an internal fetch error. No current rendered hero, fold, menu interaction or deployed build identity was established. |
| `https://exploreda.dev/docs` | Source has a 47-page catalogue and React/tour/examples starter links. The same tool-access limitation prevented live navigation, search and rendering checks. |
| Priority docs routes | Expected source routes are `/docs/project-folders`, `/docs/database-sources`, `/docs/notebooks`, `/docs/team-server`, `/docs/developers`. Their deployed content was not verified. |
| Source-internal drift | Database/notebook intent current-state claims lag implementation; current docs also contain narrower claim-accuracy problems described below. This is verified internal inconsistency, not proof of live deployment drift. |

A browser-tool fetch failure is not an HTTP 404 observation or proof that the site is down. **Smallest unblock:** provide an accessible deployed build identity plus rendered landing/docs captures, and run the six tasks in a prepared baseline environment. No repository mutation or new product capability is needed merely to close this evidence gap.

### 1.4 Comparison scope

Six systems were chosen for useful adjacency, not as direct substitutes: Metabase and Apache Superset for self-hosted BI/database entry; Evidence and Observable Framework for text-authored analytical narratives; Perspective for embeddable coordinated views; Rill for local authoring versus team consumption. Lightdash was not added because this mix already covers the requested dimensions without expanding into another database-modeling workflow. Its exclusion is a scope choice, not a negative judgment.

The research inspected **33 distinct accessible official content URLs**: 27 pages across the six selected systems, one additional Observable brand-boundary page and five documentation-principle pages. Seven failed/redirected request URLs are recorded separately. Competitor scores cover only the inspected content paths, not whole products or independently tested interfaces. Current official documentation is the comparison baseline; edition and lifecycle caveats are explicit in section 5.

## 2. Feature truth, warranted prominence and claim discipline

The following separates implementation-backed capabilities from documentation-only or unresolved claims. “Source-backed” does not mean a clean installation was executed.

| User-visible capability | Baseline truth, boundary and landing prominence | Canonical docs and existing proof/example |
|---|---|---|
| Browser file exploration | Source-backed file intake and linked workspace. CSV is not the only documented format: TSV, JSON/JSONL, Excel, Parquet and Arrow are also documented. Lead with this low-friction entry, without a universal performance guarantee. [P02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) [R14](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/PageFileDrop.tsx#L1-L158) | [/docs/load-data](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) → [/docs/workspace](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/workspace.mdx#L1-L64) → [/docs/export](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21); `shop-operations` and current sample controls. Missing: a single first-save/reopen lesson. |
| Linked filtering and mark tracing | Core differentiating demonstration, but not unique across the category. Preserve exact scope and supported trace cases. [R13](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146) [P36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/filters.mdx#L1-L23) [P37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/trace.mdx#L1-L35) [P47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) | Filters/Trace/Rendering; embedded order book and `scatter-trace`. Execution/capture not verified here. |
| Local CLI project folders | Current user docs describe opening a folder, schema/analysis files, saving and outside edits. A first-class entry is warranted. CLI package installation remains untested. [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [B02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/package.json) | [/docs/project-folders](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117); documented `--example shop`. No catalogue example ID, but a real documented CLI example exists. |
| Browser folder access | Documented separately from the local server and subject to browser file-system support. Do not imply it can directly use server database drivers. Secondary route, not another top-level product. [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [R15](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/routes.ts#L1-L14) | Project folders; `/folder` source route. Missing: observed supported-browser permission/save/reopen proof. |
| Self-hosted accounts and roles | `serverCommand` separates a disposable memory seed from persistent data; team handlers enforce roles. Promote “self-hosted team server,” not a hosted-service or production-certification claim. [R28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/cli/serverCommand.ts#L1-L233) [R29](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.ts#L1-L552) [R30](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.test.ts#L1-L411) [R31](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/dataFolder.ts#L1-L123) | [/docs/team-server](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138); seed plus Compose/retail example. Missing: verified distribution, persistent restart/restore and author/viewer task record. |
| Database connections | SQLite, DuckDB, PostgreSQL, MySQL and SQL Server have driver source. Driver support belongs early in a workflow section, with the explicit server/runtime condition. [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlite.ts#L1-L214) [R38](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/duckdb.ts#L1-L289) [R39](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/postgres.ts#L1-L359) [R40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/mysql.ts#L1-L351) [R41](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlserver.ts#L1-L328) | [/docs/database-sources](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123); documented `--example database` and team Compose database sample. No new adapter is needed for the proposed copy. |
| Snapshot read and refresh | Reads publish a bounded snapshot; project open/filter use saved rows; explicit refresh reads again. Error/limit paths retain the previous successful snapshot. This is not live SQL on every selection. [R33](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/routes.ts#L1-L121) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R35](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/read.ts#L1-L164) [R36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.test.ts#L1-L216) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) | Database sources: first Read/Read all, read timestamp, Refresh and failure sections. Missing: a guided source-change/no-refresh/refresh proof. |
| Credentials and team database roles | Server-side credentials, author refresh and administrator secret management are supported by selected source. Browser-only demo is not the database client. No complete security audit was performed. [R29](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.ts#L1-L552) [R33](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/routes.ts#L1-L121) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) | Database sources: server credentials, read-only user and team differences; same disposable database fixture. |
| Notebook prose and chart/text edits | `.eda.md` parsing, `eda` blocks, compilation, rendering and supported write-back exist. Promote a notebook-authoring workflow, particularly the documented local-project route. [R43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127) [R44](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/compileNotebook.ts#L1-L342) [R45](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.ts#L1-L698) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) [R47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.test.ts#L1-L196) | [/docs/notebooks](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54); forecast project/notebook and baseline CSV. Missing: acquisition/create/edit/reopen lesson and verified mode-by-mode app wiring. |
| Notebook selection semantics | Chart selections are local by default; explicit global filter declarations differ. Do not say all notebook charts filter one another or promise arbitrary kernels. [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [R44](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/compileNotebook.ts#L1-L342) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) | Notebooks plus Filters cross-link; forecast fixture and a proposed two-chart scope check. |
| React embedding and persistence | Package docs describe React integration, CSS, `data`, `savedData`, edit-only callbacks and host-owned persistence. Keep a developer route; do not confuse install with local CLI use. [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) [B02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/package.json) | [/docs/developers](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47); existing integration snippet and `shop-operations`. Missing: one complete save/remount/restore example. |
| Chart variety, tables, notes, DSL, export | Broad source docs and reusable examples already exist. Keep as supporting depth rather than all hero content. Notes cards are not notebooks; whole-dashboard text has replacement semantics. [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [P35](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/markdown.mdx#L1-L7) [P40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/dashboard-text.mdx#L1-L21) [P42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21) | Every chart/task is mapped to its current example in `page-inventory.csv`; representative examples include `room-bookings`, `budget-bridge`, `message-log` and `categorical-charts`. |
| Managed hosting, built-in SSO, more warehouse adapters, arbitrary notebook code | Not established as shipped by the reviewed implementation. Roadmap/intent or competitor capability is not implementation evidence. Defer and label planned only where explicitly proposed. [R25](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/runtime-modes/intent-brief.md#L1-L74) [R26](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/notebook-analysis/intent-brief.md#L1-L74) [R27](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/database-adapters/intent-brief.md#L1-L66) | No current-feature tutorial/example should imply these exist. This is an evidence boundary, not a commitment to build them. |

### 2.1 Consequential wording corrections

**Database guarantee.** The Database sources page states that no read can change the database and later repeats an absolute never-writes claim. Inspected drivers differ: SQLite/DuckDB use read-only controls, PostgreSQL/MySQL have read-only transaction paths, while SQL Server describes queries and rolls back transactions. Those safeguards do not, by themselves, establish an unrestricted no-side-effects guarantee for all accepted queries and configurations. Replace the absolute promise with the actual safeguards, least-privileged credentials and driver-specific limits. This review neither demonstrated an exploit nor certified security. [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [R37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlite.ts#L1-L214) [R38](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/duckdb.ts#L1-L289) [R39](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/postgres.ts#L1-L359) [R40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/mysql.ts#L1-L351) [R41](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlserver.ts#L1-L328)

**Network boundary.** Team server says its network use is only downloading author-supplied addresses, but database connections are implemented. Correct server egress scope, distinguish browser-side optional map/network behavior, and keep local-browser file privacy separate from team uploads or a host application's behavior. “No calls home” also deserves an explicit scope rather than becoming an unreviewed telemetry/security promise for the entire dependency graph. [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/map.mdx#L1-L34) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271)

**Universal live-docs promise.** Docs home promises a live try on every page. Four priority pages have no catalogue example IDs or embedded live-example blocks, though they do contain useful CLI/seed/forecast instructions. Narrow the home wording rather than inventing browser-only demonstrations of server workflows. The flaw is the promise and completion path, not the mere absence of an inline chart. [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123)

**Intent staleness.** The database brief says no server database code exists, and the notebook brief says `.eda.md` is ignored. Current drivers, parser, component and public package docs contradict those observations. Add a dated current-status pointer and preserve the original intent as historical context. Do not stop the review or hide implemented features because a planning document is stale. [R26](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/notebook-analysis/intent-brief.md#L1-L74) [R27](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/database-adapters/intent-brief.md#L1-L66) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605)

### 2.2 Claims intentionally not elevated

No deployed build identity, live mobile/desktop UX, npm package install, container pull, operational security, production durability, performance threshold, numerical forecast result or complete notebook support in every app runtime was verified. The source package's version is not a published-release claim. The docs' stated Node requirements should be surfaced in future lessons: SQLite reads need Node 22.16+, while Team server documents Node 22.5+ for its own baseline setup; the stronger requirement applies when that setup reads SQLite. [B02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/package.json) [B03](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123)

## 3. Landing audit and selected content hierarchy

### 3.1 What the current source communicates

The hero makes one unusually concrete promise: a CSV can be explored through charts that filter each other. Its instruction to select a mark or brush a scatter is better proof language than a generic analytics slogan. A file action, an order-book action and `pnpm add exploreda` sit together; the latter changes the audience from analyst to React developer without explaining the separate local CLI entry. The root README likewise leads with React, although it already mentions the CLI—so “CLI absent from README” would be an inaccurate diagnosis. [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/README.md#L1-L218)

The source sequence then spends substantial space on workspace benefits, chart variety, examples, report graphics and embedding before the lower file controls and browser-folder link. A user can jump directly to file input or drop a file through the page-wide handler, so the upload is not literally blocked behind all that content. The problem is emphasis and audience comprehension, not an invented click failure. The source contains no direct landing routes naming databases, notebooks or team self-hosting. [R10](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/LandingPage.tsx#L550-L720) [R11](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/SiteNav.tsx#L1-L44) [R14](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/PageFileDrop.tsx#L1-L158)

| Audit dimension | Source-grounded judgment |
|---|---|
| Category clarity | Strong for “try linked charts on a file”; incomplete for the current product. “CSV” under-represents supported formats and project workflows. |
| Audience routing | Browser and React paths are explicit; local CLI, operator, database and notebook jobs require prior knowledge or a detour through docs. |
| First-screen comprehension | Text order and component hierarchy are inspectable. Actual fold, wrapping, responsiveness and attention were not observed live. |
| Calls to action | File/sample intents are coherent. A package-install command beside them risks conflating embedding with the separate local CLI command. |
| Proof | The linked specimen and example catalogue are substantial assets. No live interaction, benchmark, adoption metric or deployment proof was established here. |
| Differentiation | The combination of linked inspection, file/project workflows and text-backed analysis is a useful proposed story. Cross-filtering alone is not exclusive to explorEDA. [SU-L](https://superset.apache.org/) [PS-E](https://perspective-dev.github.io/guide/use_cases/embedded_analytics.html) |
| Scan order | Source devotes earlier depth to chart/embedding material than to priority workflows. Reordering can help without redesigning the visual system. |
| First success | File interaction is reachable; completing and preserving an analysis is not expressed as one learning route. Setup-based workflows are even less visible. |

### 3.2 Three contrasting hierarchies

| Option | Lead, sequence and tradeoff |
|---|---|
| A — Keep the narrow file lead | Current CSV/linked-chart hero → demo → files → charts/examples → a later “Also available” list for projects, notebooks and teams. Lowest change cost and excellent focus for files, but leaves source-backed priority capabilities looking incidental. Not selected. |
| **B — Linked exploration with early workflow routes** | Broader data/linked-chart hero → immediate specimen → compact workflow chooser → a small amount of workflow proof → selected examples/chart depth → developer integration → repeated start routes. Preserves the demonstrated benefit while exposing the actual product. **Selected.** |
| C — Broader analysis workspace | Lead with files, database snapshots, prose notebooks and shared teams → audience chooser → workflow demonstrations → linked-chart detail. Gives the broadest category story, but raises cognitive load and expectations before there is comparable proof for every workflow. Keep as an experiment, not the default. |

These are content hierarchies, not three full marketing rewrites. The selected option does not require a new brand, layout system or product bundle. Metabase and Superset show useful explicit entry choices; Framework and Perspective show the value of a clear category with a direct technical path. Their commercial breadth or execution models should not be copied. [MB-L](https://www.metabase.com/) [SU-L](https://superset.apache.org/) [OB-L](https://observablehq.github.io/framework/) [PS-L](https://perspective-dev.github.io/)

### 3.3 Selected proposal: section order, labels and CTA intent

1. **Header and hero.** Keep Docs, Examples and GitHub; make self-hosting a clear navigation or immediately adjacent start route. Illustrative lead: “Explore data with linked charts.” Supporting text should scope linked workspaces and point to trying a file or local project, not claim that every notebook chart is linked. Primary action: “Open a file.” Secondary action: “Try an example.” Preserve resume when applicable. Move the React installation command out of the analyst CTA cluster.
2. **Immediate working specimen.** Keep the current linked example near the lead. State the analytical question and the expected selection effect in plain language. Do not replace it with unverified customer logos or performance claims.
3. **First workflow section.** Illustrative labels: “Work in a local project,” “Read database snapshots,” “Write a notebook,” “Run a team server,” “Embed in React.” Each names its runtime or prerequisite in a short line. This is where all three priority capabilities become unmistakable without occupying every hero action.
4. **Small proof strip.** Reuse the database example's unread/read/refresh states; show a verified notebook text/chart round trip; link a verified author/viewer setup task. Until runtime evidence is collected, link instructions rather than manufacturing screenshots or pretending the browser demo connects to databases.
5. **Selected analytical examples, then chart depth.** Keep the gallery, but prioritize a few questions over an undifferentiated inventory. Do not build new examples before testing existing shop/operations and order-book comprehension.
6. **Developer integration.** Keep a short React example, CSS/runtime prerequisites and the canonical Developers link. Present host-owned data/save responsibility; leave the complete API to docs.
7. **Closing routes.** Repeat file/local start actions and clear team/notebook/database documentation links, rather than closing exclusively on adding a React package.

### 3.4 Exact destination contract

| Landing intent | Destination and promised outcome |
|---|---|
| Open a file / Try an example | Existing file intake/sample path; beginner documentation at [/docs/load-data](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74). Outcome: one chart and a verified selection, then save/reopen guidance. |
| Work in a local project | [/docs/project-folders](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117). Outcome: open a sample folder and preserve an analysis. |
| Read database snapshots | [/docs/database-sources](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123). Outcome: one supported read plus deliberate refresh, with runtime prerequisites before commands. |
| Write a notebook | [/docs/notebooks](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54). Outcome: obtain the complete example, edit prose/chart text, round-trip a supported GUI edit and reopen. |
| Run a team server | [/docs/team-server](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138). Outcome: distinguish disposable evaluation from persistent setup, then verify roles. |
| Embed in React | [/docs/developers](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) at its Quick start section. Outcome: mount, edit, save and restore without a controlled-state feedback loop. |

The URLs above are the baseline's intended routes, not live availability claims. Proposed new subheadings/anchors require normal link verification after integration. No unavailable hosted-service signup is implied.

## 4. Documentation audit: actual purposes, not sidebar labels

### 4.1 Whole-docs inventory

The baseline has **47 pages**: Get started 9, Charts 20, Tables 3, Cards and notes 3, Tasks 7 and Concepts 5. The 26 chart-typed entries span Charts, Tables and Cards and notes; all receive the generated glance/reference treatment. The complete CSV covers every page with title, audience, primary purpose, Diátaxis fit, mixed-content issue, disposition, gap class, recommendation IDs, examples, coverage targets, source URL and SHA-256. There is no verified count discrepancy or omitted page. [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74)

| Page class | Content judgment and treatment |
|---|---|
| Get started: 9 | Several useful how-to/reference pages share the “start” label, but the home does not select the user's runtime/job. Deep changes are concentrated on Project folders, Notebooks, Team server, Database sources and Developers; Load data needs a complete first-analysis path. |
| Charts: 20 | Generally useful combinations of explanation, task instructions and generated reference. Funnel versus Sankey input models, retention maturity, interval overlap and waterfall modes deserve their current explanatory detail. Do not rewrite all chart pages for taxonomy compliance. |
| Tables: 3 | Strong task/reference material on rows, pivot aggregation and field summaries. Local table behavior should remain distinct from shared filters. |
| Cards and notes: 3 | Keep metric and legend interpretation. Add a Notes-versus-Notebooks decision link, not a merged page. |
| Tasks: 7 | Good focused operations such as trace and editing; persistence, global/local filtering and host ownership need tighter cross-mode connections. |
| Concepts: 5 | Useful mental models for axes, colors, facets, empty states and row populations. They do not substitute for a runtime/data-location explanation. |

**Representative deep reads** included Scatter, Line, Waterfall, Timeline, Map and Composition; Data table, Pivot and Summary; Notes and Metric card; Filters, Trace, Dashboard text, Views and history and Export; and Scales/axes, Empty/invalid states and Rendering. All priority-feature pages received deeper implementation tracing. Other pages received whole-body purpose/content review, not just heading classification. See the per-page inventory for each specific judgment.

### 4.2 Three lenses and their limits

| Lens | What it catches here; what it misses |
|---|---|
| **Diátaxis** | Separates learning a bounded experience from performing a real task, looking up an exact fact and understanding a model. It reveals tutorial fragments buried in operator/driver reference and the absence of complete first-success experiences across modes. It does not require four navigation buckets or prohibit a predictable chart page from combining brief guidance with generated reference. [DX-1](https://diataxis.fr/) [DX-2](https://diataxis.fr/tutorials/) [DX-3](https://diataxis.fr/how-to-guides/) |
| **Progressive disclosure and task-based IA** | Makes runtime choice, prerequisites and primary steps visible before specialized options. It catches the late Node requirement, seed/production mixture, developer-heavy docs entry and wrong-mode search results. It must not hide safety, data movement or persistence constraints as “advanced.” It cannot prove technical correctness. [DX-5](https://www.nngroup.com/articles/progressive-disclosure/) |
| **Docs as Code** | The existing MDX/catalogue/generated-reference approach supports versioning, review and structural validation. The gate checks real consistency requirements. The lens does not prove pedagogy, account setup, distribution availability or successful refresh. Keep the architecture and add task evidence. [DX-4](https://www.writethedocs.org/guide/docs-as-code/) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74) |

This review classifies the *primary reader need*, not the filename. A reference-heavy page called “Get started” is not automatically a tutorial. Conversely, a 20-line MDX chart body is not automatically thin: the page template supplies prerequisites, gestures and saved-settings reference. Mixed content is only a problem when a reader cannot tell which material is necessary for the current job. [R16](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74)

### 4.3 Coverage gates: real strengths and the missing contract

`findDocsErrors` checks catalogue/source correspondence, target coverage, related/internal links, declared examples, chart/example feature alignment, assets, live-example references, generated settings descriptions and chart glance entries. `targets.ts` already includes the four priority workflows among its 15 flow targets. It would be wrong to recommend merely adding their names to the gate. [R20](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/targets.ts#L1-L63) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216)

The missing contract is **completion**: no required assertion in that structural function establishes that a novice can obtain a notebook's data, see a successful database timestamp, preserve an account across restart, or restore an embedded workspace. Existing tests may cover pieces; this packet and review do not establish a comprehensive executed browser/setup suite. Add a small task-evidence layer rather than replacing the gate or forcing fake live examples onto server pages.

### 4.4 Proposed navigation and canonical boundaries

Keep the six topical groups and all 47 current URLs initially. Change the docs home from React/tour/examples-first to **Choose your path**, followed by the existing chart chooser and catalogue. Prefer a compact orientation section to another documentation subsystem.

| Canonical location | Owns this information; link elsewhere instead of duplicating it |
|---|---|
| Docs home / optional single runtime orientation page | Deployment mode, data location, persistence owner, prerequisites and the next task. Not driver syntax or notebook grammar. |
| Load data | Browser file formats, import diagnostics and the first browser analysis; links to server database sources. |
| Project folders | CLI folder acquisition, files, save/reload and links to project syntax. Browser folder access is a clearly labelled alternative. |
| Database sources | Read/refresh lifecycle, driver-specific connection/credential/precision/limit reference and team differences. Other pages link here. |
| Notebooks | Complete first notebook, local selection model, supported write-back and notebook-format rules. Notes cards stay on their own page. |
| Team server | Evaluation, persistent deployment, initial account, roles and operational runbook. Link to the canonical database credential/read sections. |
| Developers | React lifecycle lesson and generated public API; package README provides the package entry without duplicating every web-doc section. |
| Dashboard text and generated chart settings | Canonical DSL and saved-schema material, not recopied into every starter. |
| Filters / Rendering / Export | Canonical workspace selection model, row populations and payload/persistence distinctions, with explicit mode caveats. |

### 4.5 Runtime orientation: the content that should precede commands

| Runtime / dimension | What can be said from this baseline |
|---|---|
| Browser-only demo | Reads supported local files into the browser workspace. It is not a direct database client. Browser-save/demo-host behavior is not automatically a promise about every embedded app. [P02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) [P41](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/views-and-history.mdx#L1-L15) [P42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21) |
| Browser folder route | Uses supported browser file-system access, with its own permission/support limits. Do not conflate it with the CLI server or its drivers. [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) |
| Local CLI project | Local server/project files and explicit snapshot reads; documented notebook route. Database and notebook capabilities are orthogonal to the underlying project. [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) |
| Self-hosted team server | Server-owned persistent accounts/projects, roles, uploads and server-side database credentials. Seed memory mode is not persistent deployment. Notebook app wiring in this mode is not established by the selected evidence and needs a task check before a blanket claim. [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [R28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/cli/serverCommand.ts#L1-L233) [R29](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.ts#L1-L552) |
| React library host | Host supplies rows/project context and owns persistence/integration. A public notebook component is documented, but its existence does not prove every app runtime exposes the same workflow. [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) |
| Authoring and source choices | A notebook is an authoring format; a database snapshot is a data-source workflow. Neither should be presented as a mutually exclusive sixth runtime. |

### 4.6 Concrete before/after outlines

#### Database sources — preserve the reference, lead with one successful read

**Current outline:** read overview and sample command → Add database UI → connection/source DSL table → three server-driver settings and credentials → absolute safety statement → DuckDB → read-only-user SQL → team differences → fields/keys → limits/snapshots → SQLite Node requirement at the end. This has useful substance but makes the beginner assemble prerequisites and outcome checks. [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123)

**Proposed outline:**
1. **Where this works and what it does:** CLI/team server; snapshot, not live query; Node 22.16+ for SQLite; optional DuckDB dependency; permission/credential prerequisite.
2. **First database analysis:** obtain the existing SQLite example → see unread state → Read all → verify row count/read time → open analysis. Name the expected states without publishing unexecuted numerical results.
3. **Refresh deliberately:** change a disposable source fixture → reopen/filter without a read → verify snapshot stays unchanged → Refresh → verify new snapshot. Include failure/limit recovery and last-good retention.
4. **Connect your database:** choose connection/table/query/name; separate table and SQL-query precision differences.
5. **Reference:** connection/source syntax; drivers/TLS; secret storage; read-only roles; row/estimated-byte/time limits; unsupported binary data.
6. **On a team server:** author/viewer/admin boundaries, confined local database paths, shared refresh visibility; link to Team server setup.

This remains one canonical page initially. Split only if the first lesson and reference are still difficult to navigate after headings/anchors, not merely to produce four Diátaxis categories. [MB-D](https://www.metabase.com/docs/latest/databases/connecting) [DX-2](https://diataxis.fr/tutorials/) [DX-3](https://diataxis.fr/how-to-guides/)

#### Notebooks — make the example obtainable and the semantics visible

**Current outline:** `.eda.md` description → a snippet using assumed query/fields → project-opening instruction and forecast source path → global definitions/query defaults → local chart selection → editing/error behavior → DSL check/format commands. The missing link is a complete acquisition-to-reopen experience, not absence of notebook implementation or a dataset. [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [B03](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7)

**Proposed outline:**
1. **What a notebook is:** prose plus `eda` declarations; not arbitrary executable kernels; chart selections are local by default.
2. **Prerequisites and complete example:** supported local project runtime, exact source/package route, forecast project files and its existing CSV; show the expected folder contents.
3. **Create/open:** make or copy a `.eda.md` file, choose its query, render the first chart and identify the data source.
4. **Edit in both directions:** change prose/one declaration, then change a supported chart setting in the UI; inspect the resulting text difference and reopen.
5. **Understand scope and errors:** demonstrate one local brush, then an explicit shared filter; invalid/frozen blocks and unsupported write-back recovery.
6. **Format/reference:** block order, defaults, permitted declarations, check/format commands; links to project and chart/DSL reference.

Observable Framework is a useful model for a bounded code-and-result lesson and explicit data-loading timing, but its reactive JavaScript/loaders must not be implied for explorEDA. [OB-T](https://observablehq.github.io/framework/getting-started) [OB-A](https://observablehq.github.io/framework/data-loaders) [R43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127) [R44](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/compileNotebook.ts#L1-L342) [R45](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.ts#L1-L698)

#### Team server — separate evaluation, persistent setup and operations

**Current outline:** seed demo → real server → option table/Node prerequisite → seeded Compose database demo → production Compose/proxy example → network claim → backup/restore → accounts/roles → file intake → simultaneous-editor behavior. Production responsibilities are present, but the reader switches tasks repeatedly. [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138)

**Proposed outline:**
1. **Choose a path:** disposable evaluation or persistent team setup; state operator responsibility and known scope before commands.
2. **Evaluate with seed:** sample accounts, in-memory data and expected author/viewer behavior; explicit disposal/no-production warning.
3. **Persistent setup prerequisites:** verified package/image, Node/runtime as applicable, persistent volume, bind address/public URL, restricted initial-admin bootstrap and HTTPS/reverse-proxy assumptions.
4. **Create and verify:** create first administrator → author/viewer accounts → open a project → test permissions → restart and verify persistence.
5. **Connect data:** files versus database snapshots; link to canonical driver/credentials guidance rather than repeat it.
6. **Operate:** backup and disposable restore drill, account/reset procedures, limits, credential ownership, network egress and last-save-wins collaboration caveat.
7. **Troubleshoot and boundaries:** startup/distribution failure, access/credentials, persistence and restore; explicitly unverified or unsupported capabilities.

Superset's evaluation warning and Evidence's self-host responsibility distinctions are useful patterns. Their infrastructure stacks, cloud features or production claims are not a template for a personal project's scope. [SU-Q](https://superset.apache.org/user-docs/quickstart/) [SU-I](https://superset.apache.org/admin-docs/installation/installation-methods/) [EV-S](https://docs.evidence.dev/self-host)

#### Developers — a fourth, smaller boundary repair

**Current:** quick start, persistence fragments, props reference and a full package README import. **Proposed:** prerequisites/CSS/container → mount a fixed sample → make an edit → save settings → remount with original rows plus settings → explain `savedData`/callback ownership → generated props and targeted advanced links. Avoid maintaining three independently evolving full embedding tutorials across landing, README and docs. [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [PS-R](https://perspective-dev.github.io/guide/how_to/javascript/react.html) [PS-E](https://perspective-dev.github.io/guide/use_cases/embedded_analytics.html)

## 5. Current official comparisons: both landing and documentation

**Access date for every page below: 2026-10-15.** “Route inspected” means the navigation labels/links and destination content were fetched. It does not mean buttons were exercised in the product, accounts created or tutorials completed. Exact URLs and supported-claim scopes are in each linked evidence item and in the source register.

### 5.1 Metabase — useful separation of analyst, operator and embedder

**Why selected / weakness of comparison.** A close comparison for database analysis and self-hosted team evaluation, but a much broader BI/commercial offering than explorEDA. It is not evidence that explorEDA needs a comparable administration surface.

**Landing.** The current headline emphasizes AI and verification, while Cloud trial and open-source deployment remain explicit entry choices. Docs navigation distinguishes querying/dashboard users, embedding developers and administrators. The transferable pattern is separate jobs with intelligible next actions—not the AI positioning, customer-logo estate or commercial packaging. [MB-L](https://www.metabase.com/)

**Docs and route inspected.** Landing Docs → Installing Metabase and Adding a database; Learn → Getting started → Ask a question. Installation separates Cloud from self-hosted Docker/JAR. Database connection instructions belong to administrators. The sampled learner lesson uses a known Sample Database and moves through selecting, previewing, filtering, summarizing, visualizing, sorting and saving. These are better-scoped reader experiences than one page trying to teach data analysis and deployment at once. [MB-I](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase) [MB-D](https://www.metabase.com/docs/latest/databases/connecting) [MB-G](https://www.metabase.com/learn/metabase-basics/getting-started) [MB-T](https://www.metabase.com/learn/metabase-basics/getting-started/ask-a-question)

**Edition boundary.** An open-source self-hosted path and a commercial Cloud path are presented. Do not infer that all authentication, embedding or AI features are free or equivalent across editions; no entitlement audit was performed.

**Transfer / avoid.** Transfer named audience routes and one fixed-data learning outcome. Avoid duplicating Metabase's whole navigation or adopting AI claims without matching implementation. For explorEDA, this supports REC-02, REC-04, REC-06 and REC-12.

### 5.2 Apache Superset — clear audiences, explicit evaluation warning

**Why selected / weakness of comparison.** Useful for self-hosted database exploration and author/operator separation. Its deployment complexity and semantic/BI scope are not a proportional target for a personal project.

**Landing.** The official page identifies an open-source exploration/visualization category and offers clear user, administrator and developer documentation paths. Its SQL/visual-exploration breadth shows why linked filtering alone is not an exclusive claim. Transfer the role routing; avoid turning explorEDA's hero into a catalogue of BI capabilities. [SU-L](https://superset.apache.org/)

**Docs and route inspected.** Landing documentation routes → User Quickstart / Admin Installation Methods → Creating Your First Dashboard. The quickstart names Docker, Compose and Git and explicitly limits the Compose setup to evaluation rather than production. The dashboard lesson exposes database/dataset prerequisites, but includes conceptual detours before the central chart/dashboard task. It is a useful, imperfect model: borrow the setup warning, not the whole lesson structure. [SU-Q](https://superset.apache.org/user-docs/quickstart/) [SU-I](https://superset.apache.org/admin-docs/installation/installation-methods/) [SU-T](https://superset.apache.org/user-docs/using-superset/creating-your-first-dashboard/)

**Edition/lifecycle boundary.** Apache's open-source self-hosted project is the compared system; no vendor-managed offering is attributed to Apache. Inspected docs are labelled **Next**, so their version-specific instructions are not proof of a current stable release or tested production recipe.

**Transfer / avoid.** Transfer a conspicuous evaluation-versus-persistent-setup boundary and separate operator entry. Avoid defaulting to enterprise infrastructure or assuming “first dashboard” in a title means the content is a pure tutorial. Supports REC-02 and REC-08.

### 5.3 Evidence — text-authored BI, with a current-version warning

**Why selected / weakness of comparison.** Useful for explaining prose-plus-data authoring and distinguishing self-hosted core from hosted collaboration. It is not a direct model for explorEDA's in-browser chart editing or notebook selection semantics.

**Landing.** The current site positions around teams and agents, SQL/Markdown authoring and Studio-led entry. Current research matters: using only the older Evidence static-site description would miss the changed product surface. [EV-L](https://evidence.dev/) [EV-M](https://docs.evidence.dev/migration-guide)

**Docs and route inspected.** Landing docs link redirects from `docs.evidence.studio` to `docs.evidence.dev`. The introduction distinguishes Core from Studio and badges hosted-only material. The rendered Quickstart defaults to Studio account/edit/publish; a Core tab is visible, but its contents were not interactively inspected. CLI guidance follows a repository/Studio-oriented path. [EV-I](https://docs.evidence.dev/) [EV-Q](https://docs.evidence.dev/quickstart) [EV-C](https://docs.evidence.dev/cli)

**Edition/lifecycle boundary and unresolved tension.** The introduction calls Core MIT-licensed, locally usable without an account and statically hostable. Detailed Self Host instead describes Docker running `evidence serve`, direct connectors, environment secrets and Basic Auth, with additional capabilities reserved for Studio. These imply materially different deployment expectations; this review records the tension rather than deciding which wording is stale. The migration guide explicitly distinguishes legacy architecture from the current workflow. It does not make all Evidence deprecated. [EV-I](https://docs.evidence.dev/) [EV-S](https://docs.evidence.dev/self-host) [EV-M](https://docs.evidence.dev/migration-guide)

**Transfer / avoid.** Transfer explicit edition badges, operator responsibilities and secret configuration before deployment. Avoid inconsistent runtime summaries and letting a hosted signup path masquerade as a no-account local tutorial. Supports REC-01 and REC-08; the inconsistency is also a caution for explorEDA's own stale intent/current-doc boundaries.

### 5.4 Observable Framework — bounded code-to-result learning

**Why selected / weakness of comparison.** Useful adjacent evidence for text-authored analytical narratives, local authoring and data-loading explanations. Framework's JavaScript/loaders are not explorEDA's `eda` DSL, and Framework is not treated as the same product as current Observable Notebooks.

**Landing.** The Framework URL redirected to its official GitHub-hosted documentation surface. It has a narrow code-authored-dashboard category and a direct CLI entry rather than requiring a broad product explanation first. The site describes Framework as free and open source. The redirect alone establishes neither deprecation nor an unavailable project. [OB-L](https://observablehq.github.io/framework/)

**Docs and route inspected.** Framework introduction → Getting started → Data loaders / Deploying. The starter names Node prerequisites, scaffold/dev-server steps and an editable weather result. Data-loading documentation explains build/preview/cache behavior; deployment describes static output hosting. The lesson is stronger because the learner can compare code and result, although external weather/network assumptions are a poor default for a deterministic explorEDA starter. [OB-T](https://observablehq.github.io/framework/getting-started) [OB-A](https://observablehq.github.io/framework/data-loaders) [OB-D](https://observablehq.github.io/framework/deploying)

**Edition/lifecycle boundary.** Current main Observable branding was separately inspected, but its Notebooks docs endpoint was inaccessible. No claim is made about current managed Framework hosting, Notebooks entitlements or a shared execution model. [OB-B](https://observablehq.com/)

**Transfer / avoid.** Transfer an obtainable example, explicit runtime, visible checkpoints and data-timing explanations. Avoid implying arbitrary code execution, reactive kernels or Framework-like loaders in explorEDA notebooks. Supports REC-05 and REC-07.

### 5.5 Perspective — the strongest component/runtime boundary comparison

**Why selected / weakness of comparison.** Close for embedded analytical views and data-grid/chart coordination. It is a component/toolkit comparison, not a substitute for a self-hosted account-based application.

**Landing.** The current official surface identifies a real-time analytical grid/pivot/chart component and offers language/framework entry points. Old `perspective.finos.org` requests failed in this tool; the current `perspective-dev.github.io` pages were accessible. Transfer a precise component category and explicit developer route, not an expanded list of every possible runtime. [PS-L](https://perspective-dev.github.io/)

**Docs and route inspected.** Current landing → Data Architecture; React how-to; Embedded Analytics use case. Architecture separates client-only, client/server and replicated configurations. The React page gives integration context, while the use-case page explains save/restore ownership and the distinction between a component and a platform. This is a particularly useful model for explaining explorEDA's host-owned persistence separately from its CLI/team applications. [PS-A](https://perspective-dev.github.io/guide/explanation/architecture.html) [PS-R](https://perspective-dev.github.io/guide/how_to/javascript/react.html) [PS-E](https://perspective-dev.github.io/guide/use_cases/embedded_analytics.html)

**Edition boundary.** The inspected project/use-case material describes an open-source Apache-2.0 component rather than tiered hosted BI. That is source-reported context, not a legal-license opinion or evidence that all surrounding infrastructure is free.

**Transfer / avoid.** Transfer runtime/data-boundary explanation before advanced API details. Avoid extrapolating real-time/server/Jupyter capabilities to explorEDA's snapshot and notebook model. Supports KEEP-01, REC-03 and REC-09.

### 5.6 Rill — local authoring versus cloud consumption

**Why selected / weakness of comparison.** Useful for a clear local-author versus team-consumer distinction and database-oriented exploration. Its cloud-centered lifecycle is not proof that explorEDA should create managed hosting.

**Landing.** Current positioning emphasizes fast BI and a trial/demo funnel, with SQL/YAML authoring and embedding paths. Those are vendor-presented claims; no speed ranking or performance conclusion is drawn. Transfer the intelligible jobs, not superlatives or a paid-cloud funnel that explorEDA cannot fulfill. [RI-L](https://www.rilldata.com/)

**Docs and route inspected.** Docs home → developer Quickstart → Cloud versus Developer, with a separate user-guide route for existing dashboard consumers. The starter uses local sample-data preparation and AI-generated exploration. The runtime explanation makes local building and Cloud sharing/consumption complementary rather than presenting them as identical installations. [RI-I](https://docs.rilldata.com/) [RI-T](https://docs.rilldata.com/developers/get-started/quickstart) [RI-M](https://docs.rilldata.com/developers/deploy/cloud-vs-developer)

**Edition boundary.** Local Developer and commercial Cloud/trial routes are distinct. No specific license entitlement, self-hosted Cloud equivalent or commercial feature parity was independently verified. The local starter's external data/AI dependencies were not executed.

**Transfer / avoid.** Transfer author/operator/consumer orientation and explicit mode responsibility. Avoid using a cloud signup as the default answer to a user asking to self-host. Supports REC-03 and REC-12.

### 5.7 Cross-system conclusions

The useful pattern is not “copy the most popular BI website.” It is **clear category → task/edition choice → bounded first outcome → deeper reference**. The comparisons also supply cautions: AI-led copy without implementation, enterprise navigation copied into a small project, a quickstart that detours into unrelated concepts, a no-account claim that routes through hosted onboarding, or an introduction that disagrees with detailed deployment docs. These are editorial transfer judgments from the specific pages above, not measured competitor success rates.

## 6. Anchored scorecards

### 6.1 Rubric and uncertainty

These are **ordinal editorial assessments of inspected content**, not conversion metrics, product rankings or executed usability scores. No averages are calculated. explorEDA is evaluated from pinned source; competitors from fetched official landing/docs text. Visual quality, keyboard behavior, actual task completion and release availability remain outside these scores. For a changed published page or unseen runtime, the correct result is “unverified,” not zero.

| Score | Common anchor applied to every criterion |
|---|---|
| 0 | The needed information/action is demonstrably absent from the inspected scope. |
| 1 | A fragment or implied capability exists, but a target reader has no dependable route or usable explanation. |
| 2 | Partially usable; important prerequisites, scope, completion steps or navigation are missing or conflicting. |
| 3 | A usable documented path with identifiable friction or qualification. |
| 4 | Coherent, explicit and well-supported within the inspected path, with meaningful prerequisites/boundaries/proof. |
| 5 | Exceptionally complete within scope: multiple appropriate entries, clear successful outcome and recovery, with no material content gap found. It still would not mean independent live-performance certification. |

**Landing criteria:** clarity = category/benefit comprehension; discoverability = finding the source-backed priority capabilities appropriate to that system; routing = distinguishing audiences/actions; proof = specific inspectable examples or demonstrations rather than unsupported claims. At 3 a reader can recognize and start one path; at 5 relevant paths, boundaries and outcome proof are exceptionally coherent.

**Docs criteria:** findability = locating the right page/job; first success = a constrained learning outcome; task guidance = procedures and conditions for real work; reference = exact facts/options/contracts; explanation = a usable mental model; mode clarity = runtime/edition/data/persistence boundaries. At 3 a competent reader can follow the inspected content with some gaps; at 5 a new reader has clear prerequisites, completion/recovery and deeper links without contradictory scope.

### 6.2 explorEDA, criterion by criterion

| Criterion / score | Evidence and rationale |
|---|---|
| Landing clarity **3/5** | Concrete linked-chart file benefit; current product is broader than the CSV/React lead. [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) |
| Landing feature discoverability **1/5** | Three priority workflows are in docs/implementation but lack direct named landing routes in the inspected source. [R10](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/LandingPage.tsx#L550-L720) [R11](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/SiteNav.tsx#L1-L44) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) |
| Landing audience routing **2/5** | File, sample and embed are visible; package-install intent is mixed with analyst entry and CLI/team/notebook routes are indirect. [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R12](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/IntegrationGuide.tsx#L1-L191) [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) |
| Landing proof **3/5** | Substantial implemented specimen/examples, but priority workflow proof and live execution remain unverified. [R13](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146) [R23](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/live/examples.ts#L1-L648) [B03](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7) |
| Docs findability **3/5** | Catalogue, related links and search indexing exist; home/start emphasis does not match all jobs. [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R19](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/searchIndex.ts#L1-L115) |
| Docs first success **2/5** | Useful sample commands/snippets, but no coherent complete set of beginner outcomes for the six required journeys. [P02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) |
| Docs task guidance **3/5** | Substantial conditional procedures; setup, operations and reference sometimes interrupt each other. [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/trace.mdx#L1-L35) [P42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21) |
| Docs reference **4/5** | Generated chart settings and detailed DSL/driver facts are a clear strength; whole API/deployment execution was not validated. [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/dashboard-text.mdx#L1-L21) |
| Docs explanation **4/5** | Strong row-population, filtering and chart-semantic material; runtime orientation is a different missing layer. [P36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/filters.mdx#L1-L23) [P43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/scales-and-axes.mdx#L1-L33) [P47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) |
| Docs mode clarity **2/5** | Individual pages explain important distinctions, but home routing, scope promises and stale intent create material ambiguity. [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) [R25](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/runtime-modes/intent-brief.md#L1-L74) [R26](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/notebook-analysis/intent-brief.md#L1-L74) [R27](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/database-adapters/intent-brief.md#L1-L66) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) |

Confidence is high in the source observations, medium in scores as judgments, and low/unavailable for live UX. A stronger audience-routing result after integration must be demonstrated by task observation rather than assumed from a rearranged page.

### 6.3 Comparable landing scorecards

Vector order: **clarity / discoverability / routing / proof**. Criteria are applied to each product's actual category and inspected capabilities, not to whether it implements explorEDA's feature list.

| System | Scores | Evidence-specific rationale |
|---|---|---|
| explorEDA | **3 / 1 / 2 / 3** | Clear narrow benefit, missing priority-workflow routes, mixed file/install intents, real source specimen without executed proof. [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R10](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/LandingPage.tsx#L550-L720) [R13](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146) |
| Metabase | **4 / 4 / 4 / 4** | Category/verification story and explicit deployment choices; audience routes; specific product/embedding demonstrations, treated as vendor proof. [MB-L](https://www.metabase.com/) |
| Apache Superset | **4 / 4 / 4 / 3** | Clear exploration category and role routes; broad feature visibility; landing proof is less task-specific than the docs lesson. [SU-L](https://superset.apache.org/) [SU-T](https://superset.apache.org/user-docs/using-superset/creating-your-first-dashboard/) |
| Evidence | **3 / 3 / 3 / 3** | Current BI/authoring story is identifiable, but Studio/Core boundaries require docs and version context to interpret fully. [EV-L](https://evidence.dev/) [EV-I](https://docs.evidence.dev/) [EV-M](https://docs.evidence.dev/migration-guide) |
| Observable Framework | **4 / 4 / 3 / 4** | Narrow code-dashboard category and direct create path; mainly one developer audience rather than broad operator routing; concrete code/result material. [OB-L](https://observablehq.github.io/framework/) [OB-T](https://observablehq.github.io/framework/getting-started) |
| Perspective | **4 / 4 / 4 / 4** | Specific component category with language/framework routes and concrete embedding examples; not scored as a team-hosting platform. [PS-L](https://perspective-dev.github.io/) [PS-R](https://perspective-dev.github.io/guide/how_to/javascript/react.html) [PS-E](https://perspective-dev.github.io/guide/use_cases/embedded_analytics.html) |
| Rill | **3 / 4 / 3 / 3** | Clear BI family and authoring routes, but superlatives/cloud funnel require docs to resolve local versus hosted expectations. [RI-L](https://www.rilldata.com/) [RI-M](https://docs.rilldata.com/developers/deploy/cloud-vs-developer) |

### 6.4 Comparable documentation scorecards

Vector order: **findability / first success / task guidance / reference / explanation / mode clarity**.

| System | Scores | Evidence-specific rationale |
|---|---|---|
| explorEDA | **3 / 2 / 3 / 4 / 4 / 2** | Good catalogue/reference/model; weaker first-success routing and cross-mode consistency. [R16](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) |
| Metabase | **4 / 4 / 4 / 3 / 3 / 4** | Learn/manual split and sample-to-save lesson; clear installation/admin path. Reference/model scores are bounded by the selected pages, not the whole manual. [MB-I](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase) [MB-D](https://www.metabase.com/docs/latest/databases/connecting) [MB-G](https://www.metabase.com/learn/metabase-basics/getting-started) [MB-T](https://www.metabase.com/learn/metabase-basics/getting-started/ask-a-question) |
| Apache Superset | **4 / 3 / 3 / 3 / 3 / 4** | Role-based locations and evaluation warning; first-dashboard route includes prerequisites and conceptual detours. Next-version qualification is explicit. [SU-Q](https://superset.apache.org/user-docs/quickstart/) [SU-I](https://superset.apache.org/admin-docs/installation/installation-methods/) [SU-T](https://superset.apache.org/user-docs/using-superset/creating-your-first-dashboard/) |
| Evidence | **3 / 3 / 3 / 3 / 3 / 2** | Useful edition badges and setup reference, but default Studio path and introductory-versus-detailed deployment tension weaken mode clarity. Core tab outcome unverified. [EV-I](https://docs.evidence.dev/) [EV-Q](https://docs.evidence.dev/quickstart) [EV-S](https://docs.evidence.dev/self-host) [EV-C](https://docs.evidence.dev/cli) [EV-M](https://docs.evidence.dev/migration-guide) |
| Observable Framework | **4 / 4 / 4 / 4 / 4 / 4** | Bounded starter with data-timing/cache/deploy explanations. External starter data is a qualification; broad Notebooks UX is not included. [OB-T](https://observablehq.github.io/framework/getting-started) [OB-A](https://observablehq.github.io/framework/data-loaders) [OB-D](https://observablehq.github.io/framework/deploying) |
| Perspective | **4 / 3 / 4 / 3 / 4 / 4** | Clear architecture and embedding responsibility; React how-to is developer-oriented rather than a complete novice end-to-end lesson. Full API reference not exhaustively audited. [PS-A](https://perspective-dev.github.io/guide/explanation/architecture.html) [PS-R](https://perspective-dev.github.io/guide/how_to/javascript/react.html) [PS-E](https://perspective-dev.github.io/guide/use_cases/embedded_analytics.html) |
| Rill | **4 / 3 / 4 / 3 / 4 / 4** | Author/user routes and local/Cloud mental model; sample/AI dependencies qualify first success; full reference not exhaustively audited. [RI-I](https://docs.rilldata.com/) [RI-T](https://docs.rilldata.com/developers/get-started/quickstart) [RI-M](https://docs.rilldata.com/developers/deploy/cloud-vs-developer) |

A one-point difference is not evidence of superiority or likely conversion lift. The actionable result is the specific transferable pattern or friction in section 5, not the numeric ordering.

## 7. Required explorEDA journeys: source-derived navigation log

**All six routes below are source-derived.** The public landing/docs could not be fetched, so there were no successful live navigation steps to report. “Outcome established” identifies exactly what source reading supports. The proposed success criteria are separated from that observation.

### J1 — First file analysis

**Observed source path:** Hero file link → `#your-data` (or page-wide file drop) → file intake/viewer path → workspace Fields/Rows/chart controls. Documentation path: Docs → Load data → Workspace/Fields → Filters/Export. [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R10](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/LandingPage.tsx#L550-L720) [R14](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/PageFileDrop.tsx#L1-L158) [R15](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/routes.ts#L1-L14) [P01](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/workspace.mdx#L1-L64) [P02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) [P07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/fields.mdx#L1-L22) [P36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/filters.mdx#L1-L23) [P42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21)

**Outcome established:** input routes and documentation exist; supported formats and save payload distinctions are documented. No file was loaded and no chart was clicked. **Friction inferred:** the reader must combine several pages to define a successful analysis and preserve it. **Proposed completion:** use a fixed sample, create/inspect a chart, change and clear a filter, save a full analysis, reopen and verify state. REC-04.

### J2 — Local CLI project

**Observed source path:** Docs → Get started → Project folders → documented `npx exploreda` / shop example → project schema/analysis files → save/reload guidance. The landing's later browser-folder entry is not a substitute for explaining this CLI route. [R10](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/LandingPage.tsx#L550-L720) [R15](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/routes.ts#L1-L14) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605)

**Outcome established:** the local project workflow is documented and a package CLI bin exists at the pin. Package installation/startup was not performed. **Friction inferred:** prerequisites, first success and advanced project DSL are not cleanly separated. **Proposed completion:** obtain the existing example, open a project, save one analysis, restart and verify one supported outside edit reload. REC-05.

### J3 — Self-hosted team setup

**Observed source path:** Docs → Get started → Team server → seed evaluation or persistent data-folder/Compose setup → first administrator → author/viewer guidance → backup/restore sections. `serverCommand` and team handlers support the memory/persistent and permission distinctions. [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [R28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/cli/serverCommand.ts#L1-L233) [R29](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.ts#L1-L552) [R30](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.test.ts#L1-L411) [R31](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/dataFolder.ts#L1-L123) [R32](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/seed.ts#L1-L63)

**Outcome established:** implemented server paths and role-enforcement test assertions exist. No container was pulled, account created, service exposed or restart performed. **Friction inferred:** evaluation, deployment and operations compete on one path. **Proposed completion:** separately validate disposable seed and persistent instance; prove author/viewer differences and restart/restore on disposable data. REC-08.

### J4 — Database connection, read and refresh

**Observed source path:** Docs → Database sources → existing SQLite sample / Add database instructions → connection/table-or-query/source name → Read or Read all → read time/count → Refresh. Routes and `readSnapshot`/refresh/driver source substantiate server-side snapshots and permission controls. [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [R33](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/routes.ts#L1-L121) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R35](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/read.ts#L1-L164) [R36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.test.ts#L1-L216) [R37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlite.ts#L1-L214) [R38](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/duckdb.ts#L1-L289) [R39](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/postgres.ts#L1-L359) [R40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/mysql.ts#L1-L351) [R41](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlserver.ts#L1-L328) [R42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/app/src/databaseSources.ts#L1-L70)

**Outcome established:** the lifecycle is supported by selected source, and Add database is described in current docs; the complete UI interaction was not executed or exhaustively traced through all app wiring. **Friction inferred:** runtime/prerequisites and the fact that filtering does not re-query need earlier emphasis. **Proposed completion:** observe unread/read states, source mutation without refresh, deliberate refresh and last-good retention after failure. REC-06.

### J5 — Notebook creation and editing

**Observed source path:** Docs → Notebooks → Project folders prerequisite → `.eda.md`/`eda` example and forecast source location → prose/chart editing → DSL validation/formatting instructions. Parser/compiler/component/write-back tests support the central mechanism; pinned metadata confirms the example CSV exists. [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [R43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127) [R44](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/compileNotebook.ts#L1-L342) [R45](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.ts#L1-L698) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) [R47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.test.ts#L1-L196) [R48](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/forecast.test.ts#L1-L215) [B03](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7)

**Outcome established:** notebook semantics and supported round-trip implementation are source-backed. No notebook was rendered, edited or numerically reproduced. **Friction inferred:** the first snippet assumes data/query context and does not provide a complete acquisition path. **Proposed completion:** obtain all files, create/open the notebook, make one supported chart edit, inspect the source difference, reopen, and prove local versus explicit shared selection. REC-07.

### J6 — React embed

**Observed source path:** Hero installation command / landing integration section → Docs home “Embed it in React” → Developers Quick start → props/reference and package README → `data`, `savedData`, `onStateChange` and imperative settings retrieval. [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R12](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/IntegrationGuide.tsx#L1-L191) [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [B02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/package.json)

**Outcome established:** integration APIs and persistence semantics are documented at the pin. No build, mount or callback was executed. **Friction inferred:** the route strongly serves developers but lacks one complete persistence lesson and duplicates substantial package material. **Proposed completion:** compile a minimal host, mount a fixed sample, edit, save and remount with original rows plus settings; do not feed every callback snapshot back as controlled state. REC-09.

## 8. Proportional improvement plan

### 8.1 Small milestones and dependency order

| Milestone | Bounded scope and exit condition |
|---|---|
| **M0 — Truth and decision** | REC-01 plus confirmation of the selected audience hierarchy. Correct absolute/mode/live-example claims and stale intent status. Exit: a reviewer can trace each promoted capability to current docs and code without a roadmap contradiction. |
| **M1 — Routes before redesign** | REC-02 and REC-03; small metadata links from REC-12. Reorder/relabel landing and docs entry while keeping existing components and URLs. Exit: each audience finds a correct runtime/task destination without product explanation. |
| **M2 — Complete first-success paths** | REC-04 through REC-08, then the smaller developer lifecycle repair REC-09. Reuse shop/database/forecast/seed examples. Exit: six prepared-environment task records distinguish pass, fail and unverified. |
| **M3 — Proof and regression guardrails** | REC-10, selective REC-11 and remaining REC-12. Keep structural checks; automate only deterministic missing task assertions. Exit: proof assets and checks are reproducible and name their runtime/fixture. |
| **Later decision, not committed scope** | REC-13 comprehension comparison; REC-14 deferred capabilities; REC-15 avoid list. Exit: an evidence-backed reason exists before adding new examples, infrastructure or product surface. |

Costs in the recommendation register are relative edit scopes, not staffing budgets or promised delivery times. M2 can be reviewed in small slices; do not hold straightforward accuracy/navigation fixes hostage to a large redesign or a new hosted demo. Publishing stronger operational claims still requires their relevant proof gates.

### 8.2 Classification discipline

**Content gaps** are missing prerequisites, completion checkpoints, accurate scope or clear explanations. **Navigation gaps** are existing answers not reachable under the user's vocabulary/job. **Implementation gaps** are only confirmed when a prepared task fails despite accurate instructions; a source omission or inaccessible site alone is not a product defect. **Product gaps** are actual unimplemented capabilities, not an invitation to add every competitor feature. The CSV and JSON distinguish these categories. In particular, absent catalogue IDs on server/notebook pages are not proof that no examples exist.

### 8.3 Recommendation register

Every item below has a stable ID mirrored in `recommendations.json`. “Fix now” is prioritization for review, not approval to mutate the repository. The standalone JSON includes the complete evidence catalogue, so its references do not require a hidden tool transcript.

#### KEEP-01 — P1 / keep

**Audience/job:** analysts, React embedders — See and understand linked exploration without a sales call.  
**Classification:** content, navigation.  
**Problem:** A broad repositioning could discard demonstrable linked-view behavior and strong generated chart documentation.

**Smallest useful change:** Retain the embedded linked-view specimen, trace explanation, chart chooser, generated glance/settings and examples. Improve routing around them rather than rewriting chart documentation.

**Cost / benefit:** XS; Preservation constraints plus targeted link/label changes. Protects the clearest experiential proof and limits maintenance cost.  
**Alternative:** Replace the specimen with a broad capability montage; rejected because it substitutes promises for observable behavior.  
**Confidence:** high — Source structure and content directly support preservation; actual live usability is unmeasured.  
**Evidence:** [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R13](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146) [R16](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74) [R23](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/live/examples.ts#L1-L648) [P10](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/scatter.mdx#L1-L99) [P37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/trace.mdx#L1-L35) [P47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) [PS-L](https://perspective-dev.github.io/) [PS-A](https://perspective-dev.github.io/guide/explanation/architecture.html) [DX-1](https://diataxis.fr/)

**Observable acceptance checks:**
- The approved design still includes an immediately reachable linked-view specimen.
- Every existing chart-typed page still receives generated glance/settings and keeps its valid example references.
- No marketing statement implies that notebook selections cross-filter every chart.

#### REC-01 — P0 / fix now

**Audience/job:** all prospective users, database analysts, team operators, notebook authors — Choose a supported mode without unsafe or inflated expectations.  
**Classification:** content.  
**Problem:** Current docs contain an overbroad database no-change guarantee, a team-server network statement that omits databases, and notebook/global-filter scope that is easy to overgeneralize; intent briefs contradict shipped source. The docs-home promise of a live try on every page also exceeds the four priority pages' actual example wiring.

**Smallest useful change:** Correct the two absolute claims; say database reads use driver-specific safeguards and require least-privileged credentials. Name database egress alongside author-requested downloads. Scope local-browser privacy and notebook chart selections. Add current-status pointers to stale intent briefs without erasing their history.

**Cost / benefit:** S; Focused edits to priority docs and three intent status notes; no security redesign. Removes misleading expectations before increasing feature prominence.  
**Alternative:** Hide database/self-hosting capabilities until a full security audit; disproportionate, but retain uncertainty and require operational proof before stronger guarantees.  
**Confidence:** high — Text/code contradictions are direct observations; safeguard adequacy is not certified.  
**Evidence:** [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/filters.mdx#L1-L23) [P28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/map.mdx#L1-L34) [R25](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/runtime-modes/intent-brief.md#L1-L74) [R26](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/notebook-analysis/intent-brief.md#L1-L74) [R27](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/database-adapters/intent-brief.md#L1-L66) [R33](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/routes.ts#L1-L121) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R35](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/read.ts#L1-L164) [R37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlite.ts#L1-L214) [R38](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/duckdb.ts#L1-L289) [R39](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/postgres.ts#L1-L359) [R40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/mysql.ts#L1-L351) [R41](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlserver.ts#L1-L328) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [PS-A](https://perspective-dev.github.io/guide/explanation/architecture.html) [RI-M](https://docs.rilldata.com/developers/deploy/cloud-vs-developer) [EV-I](https://docs.evidence.dev/) [EV-S](https://docs.evidence.dev/self-host)

**Observable acceptance checks:**
- No universal no-write/no-network/no-upload claim remains without an explicit runtime/component scope.
- Database reference names five drivers, snapshots, explicit refresh, least-privileged access and SQL Server-specific caveats.
- Notebook entry states that chart selections are local by default and distinguishes explicit global filter declarations.
- Intent briefs link to current user docs and identify superseded current-state claims.
- Managed hosting, built-in SSO, warehouse connectors and arbitrary notebook kernels are not advertised as shipped.
- Docs-home copy does not promise an embedded live example on every page when priority workflows use CLI/seed/forecast examples instead.

#### REC-02 — P1 / fix now

**Audience/job:** browser file explorers, local CLI analysts, team operators, notebook authors, React embedders — Recognize the product and choose the next action from the landing page.  
**Classification:** content, navigation.  
**Problem:** The CSV/React framing and current section order obscure source-backed database, notebook and team workflows.

**Smallest useful change:** Keep linked exploration as the lead while broadening the noun from CSV to data. Keep file/sample actions primary; add an early compact workflow section with local-project, database-snapshot, notebook and self-hosted-team routes, plus a distinct embed route. Move the package install command into the developer path.

**Cost / benefit:** S; Reorder/relabel existing landing sections; one compact route component; reuse current proof. Improves warranted feature discovery without a five-button hero or a generic BI-platform claim.  
**Alternative:** Lead with all analysis workflows or with team BI; broader coverage but weaker immediate proof and stronger unsupported expectations.  
**Confidence:** medium-high — Source mismatch is clear; audience priority and conversion effects require user-task observation.  
**Evidence:** [R09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56) [R10](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/LandingPage.tsx#L550-L720) [R11](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/SiteNav.tsx#L1-L44) [R12](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/IntegrationGuide.tsx#L1-L191) [R14](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/PageFileDrop.tsx#L1-L158) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [MB-L](https://www.metabase.com/) [SU-L](https://superset.apache.org/) [OB-L](https://observablehq.github.io/framework/) [PS-L](https://perspective-dev.github.io/)

**Observable acceptance checks:**
- From the landing page, each priority capability has a descriptive visible link to its canonical docs page within the first capability section.
- Hero contains one primary file action and one secondary sample action, not five equal audience actions.
- In a small moderated task check, each represented audience identifies its mode and correct next link without explaining the product first.
- Source and rendered checks confirm file dropping still works and the sample remains reachable.

**Dependencies:** REC-01.

#### REC-03 — P1 / fix now

**Audience/job:** all new users — Pick a runtime and understand where data, credentials and saved work live.  
**Classification:** content, navigation.  
**Problem:** The docs home favors embedding and chart browsing; deployment-mode prerequisites are distributed across separate pages.

**Smallest useful change:** Replace the docs-home starter emphasis with a task-based choose-your-path panel and a compact mode table. Keep the existing six topical groups. Treat notebooks as an authoring format and databases as a source capability, not as mutually exclusive deployment modes. Use an existing home section first; add at most one orientation page only if necessary.

**Cost / benefit:** S; Docs home and shared prerequisite callout; no new navigation framework. Prevents browser/database, local/team and library/host confusion before installation.  
**Alternative:** Rebuild the sidebar into four Diataxis buckets; rejected because content purpose and navigation purpose are not the same.  
**Confidence:** high — Home metadata and priority-page prerequisites directly show the routing gap.  
**Evidence:** [R16](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314) [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [P02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) [P47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) [RI-M](https://docs.rilldata.com/developers/deploy/cloud-vs-developer) [PS-A](https://perspective-dev.github.io/guide/explanation/architecture.html) [DX-5](https://www.nngroup.com/articles/progressive-disclosure/)

**Observable acceptance checks:**
- Home exposes file, local-project, self-hosted team, notebook and React jobs, with database sources reachable from relevant modes.
- Every priority page states prerequisites, runtime, data location and persistence owner before its first command.
- Unknown notebook availability in browser-folder/team UI is labelled unverified until runtime evidence resolves it.
- Existing canonical docs URLs continue to resolve; no duplicated driver or DSL references.

**Dependencies:** REC-01.

#### REC-04 — P1 / fix now

**Audience/job:** browser file explorers — Complete one analysis and reopen it.  
**Classification:** content.  
**Problem:** Import, field/chart controls, filtering and export are documented separately but do not form one constrained first-success lesson.

**Smallest useful change:** Add a short first-analysis section using an existing small sample: load, choose a field/chart, filter, inspect rows, clear, save a full analysis and reopen it. Link each deeper operation rather than copying reference content.

**Cost / benefit:** S; One bounded lesson in existing docs plus links to load-data/workspace/export. Turns a working demo into a reproducible learning outcome.  
**Alternative:** Add a full onboarding wizard; defer until text-and-example gates demonstrate a product interaction problem.  
**Confidence:** medium-high — The content chain exists; actual completion failures need user testing.  
**Evidence:** [P01](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/workspace.mdx#L1-L64) [P02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) [P07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/fields.mdx#L1-L22) [P30](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/data-table.mdx#L1-L22) [P42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21) [R14](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/PageFileDrop.tsx#L1-L158) [R15](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/routes.ts#L1-L14) [MB-T](https://www.metabase.com/learn/metabase-basics/getting-started/ask-a-question) [DX-2](https://diataxis.fr/tutorials/)

**Observable acceptance checks:**
- A new user with no account reaches a chart, changes and clears a filter, and verifies the row scope.
- The lesson names the difference between settings-only JSON and a full analysis with rows.
- Reopening the saved full analysis restores the expected chart/filter state in a prepared browser test.
- No measured loading-time or row-limit performance guarantee is introduced.

**Dependencies:** REC-03.

#### REC-05 — P1 / fix now

**Audience/job:** local CLI analysts — Open a local project, save an analysis and see an external edit reload.  
**Classification:** content.  
**Problem:** Project-folders mixes a useful starter with advanced project/query DSL before a complete persistence checkpoint.

**Smallest useful change:** Reorder Project folders around the existing shop example or a supplied CSV folder. State runtime prerequisites, name the created files, show save/reopen and one external-edit checkpoint, then move schema/link/query reference below the lesson.

**Cost / benefit:** S; Restructure one page; reuse shipped example and canonical DSL reference. Makes the CLI a credible first-class entry without rebuilding project documentation.  
**Alternative:** Create a separate long local-analysis course; unnecessary before one complete lesson is validated.  
**Confidence:** medium-high — Source docs already describe the mechanics; package execution was not verified.  
**Evidence:** [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/dashboard-text.mdx#L1-L21) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [R15](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/routes.ts#L1-L14) [OB-T](https://observablehq.github.io/framework/getting-started) [DX-2](https://diataxis.fr/tutorials/) [DX-5](https://www.nngroup.com/articles/progressive-disclosure/)

**Observable acceptance checks:**
- Using the documented distribution in a prepared checkout/environment, the starter opens the expected loopback project.
- The learner can name which file holds schema and which holds analysis state.
- A saved analysis survives restart and a supported external edit updates the view.
- Browser-folder restrictions are not presented as CLI/database capabilities.

**Dependencies:** REC-03.

#### REC-06 — P1 / fix now

**Audience/job:** database analysts, team authors, team viewers — Connect once, read a snapshot and deliberately refresh it.  
**Classification:** content, navigation.  
**Problem:** The Database sources page has substantial reference but late prerequisites, weak first-read checkpoints and too much security/reference material in the beginner path.

**Smallest useful change:** Put mode/Node/driver prerequisites first. Build one deterministic local SQLite first-read/refresh lesson using the existing database example. Separate connection/read/refresh tasks from credential, TLS, driver precision, limits and team-role reference. State that opening and filtering use the last snapshot.

**Cost / benefit:** M; Reorder one priority page and verify existing fixture-driven steps; no new adapter. Explains the actual snapshot contract and shortens the path to database value.  
**Alternative:** Publish five separate driver tutorials immediately; avoid duplicating the common lifecycle before one canonical path works.  
**Confidence:** high for contract; medium for lesson execution — Drivers, handlers and tests support the contract; no database was connected here.  
**Evidence:** [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [R33](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/routes.ts#L1-L121) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R35](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/read.ts#L1-L164) [R36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.test.ts#L1-L216) [R37](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlite.ts#L1-L214) [R38](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/duckdb.ts#L1-L289) [R39](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/postgres.ts#L1-L359) [R40](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/mysql.ts#L1-L351) [R41](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlserver.ts#L1-L328) [R42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/app/src/databaseSources.ts#L1-L70) [MB-D](https://www.metabase.com/docs/latest/databases/connecting) [DX-2](https://diataxis.fr/tutorials/) [DX-3](https://diataxis.fr/how-to-guides/)

**Observable acceptance checks:**
- A clean documented setup reaches an unread source, reads it, and displays row count/read timestamp.
- Changing the source fixture does not change charts on reopen/filter; explicit refresh changes the snapshot.
- A failed/capped refresh retains the previous successful snapshot and explains the failure.
- Viewer refresh is rejected and author refresh succeeds in prepared role tests.
- Node 22.16+ SQLite requirement and optional DuckDB dependency are visible before related commands.

**Dependencies:** REC-01, REC-03.

#### REC-07 — P1 / fix now

**Audience/job:** notebook authors — Create a data-backed notebook and round-trip a supported edit.  
**Classification:** content, navigation.  
**Problem:** The notebook snippet assumes a project and query, while the existing forecast example is referenced as a source path rather than a complete acquisition-and-learning route.

**Smallest useful change:** Provide explicit acquisition of the complete baseline forecast project, including its existing CSV, then create/open .eda.md, edit prose and an eda chart, inspect the text diff, reload, and demonstrate local selection versus an explicit global filter. Keep syntax/reference lower on the page.

**Cost / benefit:** S–M; One lesson, a reliable existing-example link and bounded notebook proof; no new kernel or dataset. Makes the bidirectional notebook capability concrete while preventing Jupyter-style expectations.  
**Alternative:** Build a hosted notebook gallery first; defer until the local creation/edit lesson is reproducible.  
**Confidence:** high for semantics; medium for packaging — Notebook implementation is direct evidence; example data existence is verified, distribution acquisition is not.  
**Evidence:** [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [R43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127) [R44](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/compileNotebook.ts#L1-L342) [R45](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.ts#L1-L698) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) [R47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.test.ts#L1-L196) [R48](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/forecast.test.ts#L1-L215) [B03](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7) [OB-T](https://observablehq.github.io/framework/getting-started) [OB-A](https://observablehq.github.io/framework/data-loaders) [DX-2](https://diataxis.fr/tutorials/)

**Observable acceptance checks:**
- A reader starting without repository knowledge obtains every file needed by the example.
- A notebook renders from .eda.md and a supported chart edit changes the expected declaration while preserving surrounding prose/comments.
- The result persists after reopening; invalid source keeps the documented last-valid/frozen behavior.
- Brushing one chart leaves other notebook charts unchanged unless the documented shared filter is explicitly used.
- No claim of arbitrary JavaScript/Python execution or Jupyter kernels appears.

**Dependencies:** REC-01, REC-03.

#### REC-08 — P1 / fix now

**Audience/job:** self-hosting team operators, authors, viewers — Evaluate safely, then run a persistent team instance.  
**Classification:** content, navigation.  
**Problem:** Team server combines memory-only seed, real setup, Docker/Compose, backup/restore and account administration without a strong evaluation-to-operations boundary.

**Smallest useful change:** Divide the page into Evaluate, Persistent setup and Operate. Put seed disposal, initial-administrator access control, network binding, HTTPS/proxy and persistent volume requirements before deployment commands. Keep roles, backups and credential operations in explicit runbook sections.

**Cost / benefit:** M; Reorganize one page and validate two small setup paths; no enterprise operations program. Raises confidence in self-hosting without implying production certification or managed support.  
**Alternative:** Write Kubernetes/SSO/HA guides now; rejected as unsupported and disproportionate.  
**Confidence:** high for source distinctions; medium for deployment — Code separates memory/persistent storage; images and deployment were not exercised.  
**Evidence:** [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [R28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/cli/serverCommand.ts#L1-L233) [R29](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.ts#L1-L552) [R30](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.test.ts#L1-L411) [R31](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/dataFolder.ts#L1-L123) [R32](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/seed.ts#L1-L63) [SU-Q](https://superset.apache.org/user-docs/quickstart/) [SU-I](https://superset.apache.org/admin-docs/installation/installation-methods/) [EV-S](https://docs.evidence.dev/self-host)

**Observable acceptance checks:**
- Seed instructions clearly state that accounts/data are disposable and cannot be reused as production setup.
- A documented persistent instance allows first admin creation, author access and viewer access with expected restrictions.
- Restart preserves accounts/projects; a disposable backup/restore drill restores the expected content.
- Public exposure is not recommended before bootstrap and HTTPS/access controls are addressed.
- The published container/package reference is verified or explicitly marked unavailable before a copy-paste deployment promise.

**Dependencies:** REC-01, REC-03.

#### REC-09 — P2 / fix now

**Audience/job:** React embedders — Mount, edit, persist and restore the workspace without a controlled-state loop.  
**Classification:** content, navigation.  
**Problem:** Developers docs and the full package README overlap; introductory persistence examples do not constitute one complete lifecycle lesson.

**Smallest useful change:** Make Developers the canonical web entry with a short mount/edit/save/remount lesson, React/CSS/container prerequisites and storage ownership. Keep generated props; avoid duplicating the entire README where a precise excerpt or link suffices. Add concise current audience routes to the root README.

**Cost / benefit:** S; One page, a small example refinement and README routing edits. Preserves the library audience without letting it dominate every product entry.  
**Alternative:** Maintain independent tutorials in README, landing and docs; rejected because divergence is likely.  
**Confidence:** high — savedData and callback semantics are explicit in the package README.  
**Evidence:** [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) [P38](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/in-place-editing.mdx#L1-L28) [P41](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/views-and-history.mdx#L1-L15) [P42](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21) [R05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/README.md#L1-L218) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605) [R12](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/IntegrationGuide.tsx#L1-L191) [B02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/package.json) [PS-R](https://perspective-dev.github.io/guide/how_to/javascript/react.html) [PS-E](https://perspective-dev.github.io/guide/use_cases/embedded_analytics.html) [DX-3](https://diataxis.fr/how-to-guides/)

**Observable acceptance checks:**
- The example compiles against the verified package/source version and includes CSS.
- A user edit causes the documented callback and a remount restores saved settings with the original rows supplied separately.
- The example never echoes every callback snapshot into savedData as a controlled value.
- Data rows, history, views and storage responsibilities are attributed to the correct host.

**Dependencies:** REC-03.

#### REC-10 — P2 / fix now

**Audience/job:** maintainer, all first-time users — Detect broken first-success paths, not only missing documentation entries.  
**Classification:** implementation, content.  
**Problem:** The structural docs gate covers all four priority flows but cannot establish that a user can finish setup or preserve work.

**Smallest useful change:** Keep existing structural checks and add a compact six-journey evidence checklist. Reuse current tests and prepared browser tooling; automate only the smallest deterministic gaps after documenting manual outcomes. Record fixture, runtime, expected state and failure recovery.

**Cost / benefit:** M, staged; Six small task gates; no dashboard, new CMS, analytics stack or broad test rewrite. Prevents coverage checkmarks from standing in for user success.  
**Alternative:** Expand covers targets or require dummy live browser examples on server pages; rejected because presence still would not establish completion.  
**Confidence:** high — findDocsErrors directly shows what structural validation does and does not assert.  
**Evidence:** [R02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/agent-guide.md#L1-L149) [R08](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/package.json#L1-L77) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R20](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/targets.ts#L1-L63) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216) [R23](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/live/examples.ts#L1-L648) [R30](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.test.ts#L1-L411) [R36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.test.ts#L1-L216) [R47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.test.ts#L1-L196) [DX-4](https://www.writethedocs.org/guide/docs-as-code/) [DX-2](https://diataxis.fr/tutorials/)

**Observable acceptance checks:**
- All six report task gates have recorded outcomes, runtime/version and evidence artifact links in the integration review.
- Existing docs:check/build/docs:verify outputs are captured from a real prepared checkout, not this packet.
- Server/database failures are tested against disposable fixtures, not production data.
- Source-only outcomes remain labelled unexecuted until actual proof is attached.

**Dependencies:** REC-04, REC-05, REC-06, REC-07, REC-08, REC-09.

#### REC-11 — P2 / explore

**Audience/job:** prospective analysts, notebook authors, team operators — See proof appropriate to each advertised workflow.  
**Classification:** content, implementation.  
**Problem:** The landing proves linked charts well, while priority workflows lack equally accessible proof even though seed/CLI/forecast examples exist.

**Smallest useful change:** Reuse existing fixtures to add a small proof strip: snapshot read/refresh state, notebook text/chart round trip and author/viewer persistence. Prefer reproducible task links and one approved capture per mode; keep server actions out of the public browser demo.

**Cost / benefit:** S–M, only after task gates; Capture/reuse existing examples; new static assets only after runtime verification. Supports broader positioning without manufacturing social proof or a fake live database demo.  
**Alternative:** Create videos and a new interactive demo for every feature; defer maintenance-heavy media.  
**Confidence:** medium — Existing fixtures are available, but the best proof format depends on actual task results.  
**Evidence:** [R13](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R23](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/live/examples.ts#L1-L648) [R32](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/seed.ts#L1-L63) [R48](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/forecast.test.ts#L1-L215) [B03](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [OB-L](https://observablehq.github.io/framework/) [PS-L](https://perspective-dev.github.io/) [DX-5](https://www.nngroup.com/articles/progressive-disclosure/)

**Observable acceptance checks:**
- Each priority landing claim links to an existing example or a clearly labelled reproducible task.
- Captures name the runtime and distinguish fixture data from a live database connection.
- No screenshot, row count, benchmark or deployment result is fabricated.
- Asset maintenance is limited to a small named set with an update trigger.

**Dependencies:** REC-10.

#### REC-12 — P2 / fix now

**Audience/job:** users searching for a task or mode — Find database, notebook, hosting and persistence help using ordinary task terms.  
**Classification:** navigation, content.  
**Problem:** Search indexes broad reference material, while similar terms such as Notes/notebooks and rendering/runtime modes need deliberate routing.

**Smallest useful change:** Add concise task aliases in catalogue summaries/highlights and reciprocal links at mode boundaries. Test a small query set before changing the search algorithm or duplicating reference prose.

**Cost / benefit:** XS–S; Metadata and cross-links; a few search assertions if supported by existing tests. Improves discoverability cheaply and exposes wrong-mode results.  
**Alternative:** Install hosted search or rebuild ranking before measuring current queries; rejected.  
**Confidence:** medium — Index construction is inspected; current rendered ranking and user vocabulary were not tested.  
**Evidence:** [R17](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R19](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/searchIndex.ts#L1-L115) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P35](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/markdown.mdx#L1-L7) [P36](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/filters.mdx#L1-L23) [P46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/empty-and-invalid.mdx#L1-L10) [P47](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) [MB-G](https://www.metabase.com/learn/metabase-basics/getting-started) [RI-I](https://docs.rilldata.com/) [DX-5](https://www.nngroup.com/articles/progressive-disclosure/)

**Observable acceptance checks:**
- Queries including self host, Docker, database, refresh, notebook, Markdown and save/reopen return the relevant canonical page near the top in the prepared search test.
- Notes and Notebooks link to one another with a one-sentence distinction.
- Load data offers a server/database route rather than export-only advice for database users.
- Shared settings remain discoverable without unnecessary duplicated prose.

**Dependencies:** REC-03.

#### REC-13 — P3 / explore

**Audience/job:** non-financial analysts, notebook authors — Recognize an approachable analytical question in the proof example.  
**Classification:** content.  
**Problem:** The order-book demonstration is distinctive but specialized; the forecast notebook assumes domain context.

**Smallest useful change:** After fixing routes, compare comprehension of the existing order-book proof with an existing shop/operations example. Change the default only if task observation shows a meaningful benefit; retain specialized examples in the gallery.

**Cost / benefit:** S research; implementation deferred; One small comparative comprehension exercise using existing assets. Tests a positioning uncertainty without building a new demo estate.  
**Alternative:** Replace all examples with generic sales dashboards immediately; rejected because that could remove useful differentiation.  
**Confidence:** medium-low — Domain friction is an inference, not an observed user failure.  
**Evidence:** [R13](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146) [R23](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/live/examples.ts#L1-L648) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P29](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/composition.mdx#L1-L25) [R48](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/forecast.test.ts#L1-L215) [MB-T](https://www.metabase.com/learn/metabase-basics/getting-started/ask-a-question) [OB-T](https://observablehq.github.io/framework/getting-started)

**Observable acceptance checks:**
- Participants can state the analytical question and describe what changed after a selection.
- Decision records include observed confusion and task outcomes, not invented conversion percentages.
- No new dataset or example system is commissioned without a demonstrated gap.

**Dependencies:** REC-02, REC-10.

#### REC-14 — P3 / defer

**Audience/job:** future team buyers, advanced notebook users — Understand boundaries without mistaking a roadmap for a current capability.  
**Classification:** product, content.  
**Problem:** Adjacent products can encourage unsupported managed-hosting, SSO, warehouse, arbitrary-kernel or live-query promises.

**Smallest useful change:** Keep managed hosting, built-in SSO, additional warehouse connectors and arbitrary notebook execution out of shipped-feature copy. Treat any proposal for them as a separate product decision with code, documentation and operational proof requirements.

**Cost / benefit:** XS now; future product cost unestimated; Boundary labels only; no feature implementation in this plan. Protects accuracy and personal-project scope.  
**Alternative:** Use competitor-style enterprise language as aspirational marketing; rejected.  
**Confidence:** high — The selected baseline does not establish these capabilities.  
**Evidence:** [R25](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/runtime-modes/intent-brief.md#L1-L74) [R26](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/notebook-analysis/intent-brief.md#L1-L74) [R27](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/database-adapters/intent-brief.md#L1-L66) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R43](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127) [R44](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/compileNotebook.ts#L1-L342) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [EV-S](https://docs.evidence.dev/self-host) [OB-A](https://observablehq.github.io/framework/data-loaders) [RI-M](https://docs.rilldata.com/developers/deploy/cloud-vs-developer)

**Observable acceptance checks:**
- Current-feature copy contains no unsupported promise.
- Any future promotion of a deferred capability cites an implementation, a user page and a runnable proof task.
- Roadmap material is labelled planned and does not appear in current setup steps.

#### REC-15 — P3 / avoid

**Audience/job:** maintainer, all docs readers — Improve routing without replacing a functioning docs system.  
**Classification:** navigation, implementation.  
**Problem:** A full CMS, forced four-bucket taxonomy, crowded hero or governance program would add work without addressing the observed priority gaps.

**Smallest useful change:** Retain MDX, catalogue metadata, generated reference, six topical groups and existing tooling. Apply purpose-aware page sections and a task-first home before considering infrastructure replacement.

**Cost / benefit:** XS; Explicit scope guardrails in the review decision. Preserves maintainability and focuses work on demonstrable user outcomes.  
**Alternative:** Wholesale navigation/CMS migration; reconsider only with evidence of a limitation that small content changes cannot solve.  
**Confidence:** high — Current source already provides a capable, integrated docs system.  
**Evidence:** [R01](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/AGENTS.md#L1-L39) [R03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/CODING_STANDARDS.md#L1-L28) [R16](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314) [R18](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216) [R22](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74) [DX-1](https://diataxis.fr/) [DX-4](https://www.writethedocs.org/guide/docs-as-code/) [DX-5](https://www.nngroup.com/articles/progressive-disclosure/)

**Observable acceptance checks:**
- The first milestones require no new CMS, hosted search, enterprise ownership matrix or migration of all 47 URLs.
- A proposed new top-level bucket/page has a distinct user job and a canonical content owner.
- Each implemented change traces to a ranked finding and acceptance check.

## 9. Proof plan, actual checks and unresolved decisions

### 9.1 Six observable user-task gates — proposed, not executed

Use disposable fixtures and a prepared environment with recorded baseline/build identity. A check passes only when the expected state is observed; “page exists” is not a pass. Record the runtime, package/image/source version, browser where relevant, fixture identity, result, failure and evidence capture. Do not expose a public server or use production credentials/data for the research check.

| Gate | Required observable result and failure boundary |
|---|---|
| **G1 — Browser file analysis** | From landing, load an existing small sample without an account; identify a chart and row count; apply/clear a selection; save a full analysis and reopen with matching expected state. Check settings-only versus data-included export. Record import or rendering failures separately. |
| **G2 — Local project** | Acquire the documented example through the proposed distribution path; open it; create/save an analysis; restart; verify file persistence and one supported outside edit. Record Node, package and browser-folder differences, not just a screenshot of a server banner. |
| **G3 — Team setup** | Clearly separate memory seed from persistent setup. Create initial admin under controlled access, then author/viewer accounts; prove the role boundary; restart and restore a disposable backup. Verify image/package availability before promoting copy-paste setup. |
| **G4 — Database read/refresh** | Start unread; read a deterministic fixture; observe count/time; change upstream fixture; reopen/filter without changing the snapshot; explicitly refresh; observe new snapshot. Trigger one safe failure/cap and retain last-good rows. Verify viewer refresh rejection and author refresh. |
| **G5 — Notebook round trip** | Obtain all project/example files; create/open `.eda.md`; edit prose and a supported chart setting; inspect the text diff; reopen. Show local chart selection versus explicit global filtering; verify invalid/frozen and unsupported-edit behavior. Check availability separately in each advertised app runtime. |
| **G6 — React lifecycle** | Compile a minimal example with the verified React/package/CSS prerequisites; mount known rows; make an edit; record the callback; persist; remount with rows/settings. Confirm no callback-echo controlled-state loop and distinguish host-owned history/storage. |

These gates follow the documented baseline contracts and selected implementation, not independent external assumptions. [P02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) [P03](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) [P04](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) [P05](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) [P06](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) [P09](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) [R28](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/cli/serverCommand.ts#L1-L233) [R33](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/routes.ts#L1-L121) [R34](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271) [R45](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.ts#L1-L698) [R46](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498) [R07](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605)

### 9.2 Checks actually run

The following were completed for this research/artifact task:

- Source packet inventory and 185 manifest SHA-256 comparisons; all matched.
- Catalogue/MDX reconciliation: 47 unique pages, with a complete purpose/content inventory; 26 chart-typed entries accounted for.
- Required guidance/package reading and targeted landing/docs/server/database/notebook source and test-assertion review.
- Connected read-only GitHub identity/pinned-commit verification and bounded source/metadata supplements; local Hero Git blob cross-check.
- Current official web page retrieval and documented access/redirect limits; six comparison systems across both surfaces.
- Deliverable JSON parsing, CSV round-trip/count/uniqueness, recommendation/evidence-reference checks, Markdown structural checks, and SHA-256/ZIP integrity validation during final packaging.

**None of these is a product execution, browser interaction, deployment, performance test, security audit or successful database connection.** Test assertions and historical test counts encountered in the repository are not reported as tests run by this review.

### 9.3 Commands proposed for Codex in a real prepared checkout

All commands below are **NOT RUN in this research**. The packet lacks a runnable checkout, dependencies and built app. Some commands create build/capture output or start services; they belong to a separately authorized verification workflow, not this read-only source review. Do not automatically install dependencies or infer permission to expose a server.

```bash
# Proposed verification run sheet. Nothing in this block was executed here.
# Preconditions: complete checkout pinned to ea8b52ff742f11d1fb89457acabbcd27b0bd04e7,
# prepared dependencies, disposable fixtures, and authorization for local build/test output.

# Structural documentation and build checks.
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify

# Local visual review only in a prepared and authorized environment.
pnpm dev:agent
# Once the separately managed local session is available:
pnpm shot / --name landing

# Repository-wide checks; preserve actual output and exit status.
pnpm check
```

Also perform G1–G6 and record their real outcomes; the command names alone do not guarantee that all six journeys are covered. Existing browser-check instructions were read, but the complete runnable verification environment and all end-to-end wiring were not present in this selected snapshot. [R02](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/agent-guide.md#L1-L149) [R08](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/package.json#L1-L77) [R21](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216)

### 9.4 Key risks and rejected shortcuts

| Risk / shortcut | Decision |
|---|---|
| Promoting “database support” as live SQL | Say snapshots and explicit refresh; prove the source-change/no-refresh contrast. |
| Broad privacy or read-safety promises | Scope by runtime/component and actual safeguards; least-privileged access remains required. No security certification is implied. |
| Notebook equals Jupyter / all linked charts | Describe `.eda.md` plus supported `eda` chart editing; local chart selections by default; arbitrary kernels unproven. |
| Seed demo mistaken for durable hosting | Separate evaluation from persistent setup and verify restart/restore before stronger claims. |
| Packet missing a file mistaken for product omission | Forecast CSV exists at the pin; improve acquisition, do not invent a new dataset requirement. |
| Coverage numbers mistaken for learning outcomes | Keep structural checks and add task evidence rather than more checkboxes. |
| Newer main or vendor legacy pages silently used | Pin repository claims; record current comparison URLs and migration/Next/redirect caveats. |
| Copying competitor cloud/enterprise breadth | Defer managed hosting/SSO/warehouses/kernels until a distinct approved product decision and code/docs proof. |
| Replacing the docs stack or all 47 pages | Reject CMS migration, forced four-bucket navigation, hosted search and a wholesale rewrite absent a demonstrated tooling limit. |
| Invented proof | No fabricated clicks, screenshots, benchmark numbers, user quotes, conversion uplift or executed test claims. |

### 9.5 Open decisions and at most two focused follow-ups

**Q1 — Audience/positioning decision.** Confirm the proposed near-term priority: browser/local analysts first; database snapshots, notebooks and self-hosted teams immediately discoverable; React embedding distinct. The default recommendation is selected hierarchy B. A different audience priority is possible, but should change the first-success investment, not merely add more hero nouns.

**Q2 — Runtime and deployment evidence.** Provide a prepared pinned-checkout/deployed-build record for G1–G6, including package/container availability, source-versus-deployed content, and notebook UI availability by runtime. Smallest useful evidence: build identity, actual check outputs, a few rendered captures and task outcomes on disposable fixtures. This closes the principal partial/NO-GO-for-live-signoff boundary without commissioning new features.

Remaining unverified facts are attached to Q2 rather than expanded into repeated research questions: published distribution versions, image availability, live search ranking, mobile/keyboard behavior, actual performance, production hardening and numerical example outputs. Any observed runtime failure should be classified separately from a documentation failure before Codex proposes implementation.

## 10. Evidence register and deliverable contract

`page-inventory.csv` contains all 47 baseline pages and their page-specific dispositions/examples. `recommendations.json` contains 16 stable recommendations (one keep item plus REC-01–REC-15), their priority/classification/job/problem/evidence/proposal/cost/benefit/alternative/confidence/checks and a complete source catalogue. `sources.md` records exact URLs, titles, access dates, supported claims, source types, inspection limits and access failures. The ZIP includes these four standalone companions and a SHA-256 manifest; no external image, script, font or service is needed to read the deliverables.

All factual references in this report link directly to exact pinned source locations or official pages. The compact register below identifies the evidence behind those links; full claim scopes and hashes are in the source companion and JSON. External links are citations, not hidden rendering dependencies.

### 10.1 Current official content sources

- **MB-L** — [Metabase — landing page](https://www.metabase.com/). official product landing; accessed 2026-10-15.

- **MB-I** — [Installing Metabase](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase). official product documentation; accessed 2026-10-15.

- **MB-D** — [Connecting to a database](https://www.metabase.com/docs/latest/databases/connecting). official product documentation; accessed 2026-10-15.

- **MB-G** — [Metabase Learn — Getting started](https://www.metabase.com/learn/metabase-basics/getting-started). official learning documentation; accessed 2026-10-15.

- **MB-T** — [Ask a question](https://www.metabase.com/learn/metabase-basics/getting-started/ask-a-question). official tutorial; accessed 2026-10-15.

- **SU-L** — [Apache Superset — landing page](https://superset.apache.org/). official project landing; accessed 2026-10-15.

- **SU-Q** — [Superset Quickstart](https://superset.apache.org/user-docs/quickstart/). official product documentation; accessed 2026-10-15.

- **SU-I** — [Superset Installation Methods](https://superset.apache.org/admin-docs/installation/installation-methods/). official product documentation; accessed 2026-10-15.

- **SU-T** — [Creating Your First Dashboard](https://superset.apache.org/user-docs/using-superset/creating-your-first-dashboard/). official tutorial; accessed 2026-10-15.

- **EV-L** — [Evidence — landing page](https://evidence.dev/). official product landing; accessed 2026-10-15.

- **EV-I** — [What is Evidence?](https://docs.evidence.dev/). official product documentation; accessed 2026-10-15.

- **EV-Q** — [Evidence Quickstart](https://docs.evidence.dev/quickstart). official tutorial; accessed 2026-10-15.

- **EV-S** — [Evidence Self Host](https://docs.evidence.dev/self-host). official product documentation; accessed 2026-10-15.

- **EV-M** — [Evidence Migration Guide](https://docs.evidence.dev/migration-guide). official migration documentation; accessed 2026-10-15.

- **EV-C** — [Evidence CLI](https://docs.evidence.dev/cli). official product documentation; accessed 2026-10-15.

- **OB-L** — [Observable Framework — landing and introduction](https://observablehq.github.io/framework/). official project landing/documentation; accessed 2026-10-15.

- **OB-T** — [Observable Framework — Getting started](https://observablehq.github.io/framework/getting-started). official tutorial; accessed 2026-10-15.

- **OB-D** — [Observable Framework — Deploying](https://observablehq.github.io/framework/deploying). official product documentation; accessed 2026-10-15.

- **OB-A** — [Observable Framework — Data loaders](https://observablehq.github.io/framework/data-loaders). official product explanation/reference; accessed 2026-10-15.

- **OB-B** — [Observable — current main product landing](https://observablehq.com/). official product landing; accessed 2026-10-15.

- **PS-L** — [Perspective — data grid, pivot table and charts](https://perspective-dev.github.io/). official project landing; accessed 2026-10-15.

- **PS-A** — [Perspective — Data Architecture](https://perspective-dev.github.io/guide/explanation/architecture.html). official architecture explanation; accessed 2026-10-15.

- **PS-R** — [Perspective — React](https://perspective-dev.github.io/guide/how_to/javascript/react.html). official how-to documentation; accessed 2026-10-15.

- **PS-E** — [Perspective — Embedded Analytics](https://perspective-dev.github.io/guide/use_cases/embedded_analytics.html). official use-case documentation; accessed 2026-10-15.

- **RI-L** — [Rill — landing page](https://www.rilldata.com/). official product landing; accessed 2026-10-15.

- **RI-I** — [Rill Docs](https://docs.rilldata.com/). official documentation home; accessed 2026-10-15.

- **RI-T** — [Rill — Quickstart](https://docs.rilldata.com/developers/get-started/quickstart). official tutorial; accessed 2026-10-15.

- **RI-M** — [Rill Cloud vs Rill Developer](https://docs.rilldata.com/developers/deploy/cloud-vs-developer). official product explanation; accessed 2026-10-15.

- **DX-1** — [Diátaxis](https://diataxis.fr/). primary documentation-framework source; accessed 2026-10-15.

- **DX-2** — [Diátaxis — Tutorials](https://diataxis.fr/tutorials/). primary documentation-framework source; accessed 2026-10-15.

- **DX-3** — [Diátaxis — How-to guides](https://diataxis.fr/how-to-guides/). primary documentation-framework source; accessed 2026-10-15.

- **DX-4** — [Write the Docs — Docs as Code](https://www.writethedocs.org/guide/docs-as-code/). primary practitioner documentation; accessed 2026-10-15.

- **DX-5** — [Nielsen Norman Group — Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/). primary usability-principle article; accessed 2026-10-15.

### 10.2 Pinned implementation and governance sources

- **R01** — [AGENTS.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/AGENTS.md#L1-L39). Symbols/sections: Repository agent rules.

- **R02** — [docs/agent-guide.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/agent-guide.md#L1-L149). Symbols/sections: Docs / browser verification guidance.

- **R03** — [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/CODING_STANDARDS.md#L1-L28). Symbols/sections: Development and documentation conventions.

- **R04** — [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/ui-defaults.md#L1-L139). Symbols/sections: Scope and layout; chart interactions.

- **R05** — [README.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/README.md#L1-L218). Symbols/sections: Introduction; CLI and embedding entries.

- **R06** — [package.json](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/package.json#L1-L32). Symbols/sections: scripts.

- **R07** — [packages/explorEDA/README.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/README.md#L1-L605). Symbols/sections: ExplorEda; savedData; onStateChange; ExplorEdaNotebook; ExplorEdaProject.

- **R08** — [apps/demo/package.json](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/package.json#L1-L77). Symbols/sections: docs:check; docs:verify; build.

- **R09** — [apps/demo/src/landing/Hero.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/Hero.tsx#L18-L56). Symbols/sections: Hero.

- **R10** — [apps/demo/src/LandingPage.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/LandingPage.tsx#L550-L720). Symbols/sections: LandingPage render sequence.

- **R11** — [apps/demo/src/landing/SiteNav.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/SiteNav.tsx#L1-L44). Symbols/sections: SiteNav.

- **R12** — [apps/demo/src/landing/IntegrationGuide.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/IntegrationGuide.tsx#L1-L191). Symbols/sections: IntegrationGuide.

- **R13** — [apps/demo/src/landing/LiveOrderBook.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/LiveOrderBook.tsx#L1-L146). Symbols/sections: LiveOrderBook.

- **R14** — [apps/demo/src/landing/PageFileDrop.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/landing/PageFileDrop.tsx#L1-L158). Symbols/sections: PageFileDrop.

- **R15** — [apps/demo/src/routes.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/routes.ts#L1-L14). Symbols/sections: Route constants.

- **R16** — [apps/demo/src/docs/DocsSite.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/DocsSite.tsx#L1-L314). Symbols/sections: GuidePage; docs-home composition.

- **R17** — [apps/demo/src/docs/components/home.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/home.tsx#L1-L296). Symbols/sections: START_LINKS; Hero; ChartChooser.

- **R18** — [apps/demo/src/docs/catalogue.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/catalogue.ts#L1-L803). Symbols/sections: catalogue and group metadata.

- **R19** — [apps/demo/src/docs/searchIndex.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/searchIndex.ts#L1-L115). Symbols/sections: Search index construction.

- **R20** — [apps/demo/src/docs/targets.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/targets.ts#L1-L63). Symbols/sections: FLOWS; SURFACES.

- **R21** — [apps/demo/src/docs/gate.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/gate.ts#L1-L216). Symbols/sections: findDocsErrors.

- **R22** — [apps/demo/src/docs/components/template.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/components/template.tsx#L1-L74). Symbols/sections: AtAGlance; SavedSettings.

- **R23** — [apps/demo/src/docs/live/examples.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/live/examples.ts#L1-L648). Symbols/sections: Live-example declarations.

- **R24** — [docs/application-feature-inventory.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/application-feature-inventory.md#L1-L783). Symbols/sections: Coverage promises; current-state and historical records.

- **R25** — [docs/intent/runtime-modes/intent-brief.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/runtime-modes/intent-brief.md#L1-L74). Symbols/sections: Mode table and planned work.

- **R26** — [docs/intent/notebook-analysis/intent-brief.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/notebook-analysis/intent-brief.md#L1-L74). Symbols/sections: Current-state notes and phases.

- **R27** — [docs/intent/database-adapters/intent-brief.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/docs/intent/database-adapters/intent-brief.md#L1-L66). Symbols/sections: Existing-code statement and adapter plan.

- **R28** — [packages/explorEDA/src/cli/serverCommand.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/cli/serverCommand.ts#L1-L233). Symbols/sections: SERVER_USAGE; parseServerArgs; serverCommand.

- **R29** — [packages/explorEDA/src/server/team/teamHandler.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.ts#L1-L552). Symbols/sections: teamHandler; sourceRoutes options.

- **R30** — [packages/explorEDA/src/server/team/teamHandler.test.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/teamHandler.test.ts#L1-L411). Symbols/sections: Role and database-route tests.

- **R31** — [packages/explorEDA/src/server/team/dataFolder.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/dataFolder.ts#L1-L123). Symbols/sections: openDataFolder.

- **R32** — [packages/explorEDA/src/server/team/seed.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/team/seed.ts#L1-L63). Symbols/sections: Seed fixtures.

- **R33** — [packages/explorEDA/src/server/sources/routes.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/routes.ts#L1-L121). Symbols/sections: sourceRoutes.

- **R34** — [packages/explorEDA/src/server/sources/refresh.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.ts#L1-L271). Symbols/sections: DRIVERS; refreshSource; writeWhole.

- **R35** — [packages/explorEDA/src/server/sources/read.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/read.ts#L1-L164). Symbols/sections: readSnapshot; sizeOf.

- **R36** — [packages/explorEDA/src/server/sources/refresh.test.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/refresh.test.ts#L1-L216). Symbols/sections: Snapshot/read failure and limit tests.

- **R37** — [packages/explorEDA/src/server/sources/drivers/sqlite.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlite.ts#L1-L214). Symbols/sections: sqlite driver.

- **R38** — [packages/explorEDA/src/server/sources/drivers/duckdb.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/duckdb.ts#L1-L289). Symbols/sections: duckdb driver.

- **R39** — [packages/explorEDA/src/server/sources/drivers/postgres.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/postgres.ts#L1-L359). Symbols/sections: postgres driver.

- **R40** — [packages/explorEDA/src/server/sources/drivers/mysql.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/mysql.ts#L1-L351). Symbols/sections: mysql driver.

- **R41** — [packages/explorEDA/src/server/sources/drivers/sqlserver.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/server/sources/drivers/sqlserver.ts#L1-L328). Symbols/sections: sqlserver driver.

- **R42** — [apps/app/src/databaseSources.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/app/src/databaseSources.ts#L1-L70). Symbols/sections: querySources; waitingFor.

- **R43** — [packages/explorEDA/src/lib/notebook/parseNotebook.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/parseNotebook.ts#L1-L127). Symbols/sections: NOTEBOOK_EXTENSION; parseNotebook.

- **R44** — [packages/explorEDA/src/lib/notebook/compileNotebook.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/compileNotebook.ts#L1-L342). Symbols/sections: compileNotebook.

- **R45** — [packages/explorEDA/src/lib/notebook/writeBack.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.ts#L1-L698). Symbols/sections: writeBackChart; writeBackSettings.

- **R46** — [packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx#L1-L498). Symbols/sections: ExplorEdaNotebook; localSelections.

- **R47** — [packages/explorEDA/src/lib/notebook/writeBack.test.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/writeBack.test.ts#L1-L196). Symbols/sections: Write-back tests.

- **R48** — [packages/explorEDA/src/lib/notebook/forecast.test.ts](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/src/lib/notebook/forecast.test.ts#L1-L215). Symbols/sections: Forecast fixture tests.

- **R49a** — [packages/explorEDA/examples/forecast/exploreda.eda](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/examples/forecast/exploreda.eda#L1-L7). Symbols/sections: exploreda.

- **R49b** — [packages/explorEDA/examples/forecast/forecast.eda.md](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/examples/forecast/forecast.eda.md#L1-L73). Symbols/sections: forecast.eda.

- **B01** — [Pinned commit metadata](https://api.github.com/repos/byronwall/explorEDA/commits/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7).

- **B02** — [Package manifest at baseline](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/packages/explorEDA/package.json).

- **B03** — [Forecast data directory at baseline](https://api.github.com/repos/byronwall/explorEDA/contents/packages/explorEDA/examples/forecast/data?ref=ea8b52ff742f11d1fb89457acabbcd27b0bd04e7).

- **B04** — [Source packet manifest](https://github.com/byronwall/explorEDA/tree/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7).

### 10.3 Complete baseline page keys

All page URLs below are pinned source citations; the matching intended live route is `/docs/<topic>`.

- **P01** — [The workspace](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/workspace.mdx#L1-L64) (`workspace`); purpose: Orient to toolbar, panels, rows and chart actions.

- **P02** — [Load data](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/load-data.mdx#L1-L74) (`load-data`); purpose: Import supported files and interpret reader results.

- **P03** — [Project folders](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/project-folders.mdx#L1-L117) (`project-folders`); purpose: Open, save and edit a file-backed analysis project.

- **P04** — [Notebooks](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/notebooks.mdx#L1-L54) (`notebooks`); purpose: Create prose with eda blocks and edit charts/text.

- **P05** — [Team server](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/team-server.mdx#L1-L138) (`team-server`); purpose: Evaluate, run and operate an account-based team server.

- **P06** — [Database sources](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/database-sources.mdx#L1-L123) (`database-sources`); purpose: Connect, read snapshots and refresh source data.

- **P07** — [Fields](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/fields.mdx#L1-L22) (`fields`); purpose: Inspect field types, distributions and add charts.

- **P08** — [Chart settings](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/chart-settings.mdx#L1-L29) (`chart-settings`); purpose: Find and change chart settings and annotations.

- **P09** — [Developers](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/developers.mdx#L1-L47) (`developers`); purpose: Mount an analytical workspace and own its persistence.

- **P10** — [Scatter plot](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/scatter.mdx#L1-L99) (`scatter`); purpose: Choose scatter/density/regression encodings and select points.

- **P11** — [Bar chart](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/bar.mdx#L1-L67) (`bar`); purpose: Compare numeric bins and grouped category measures.

- **P12** — [Row chart](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/row.mdx#L1-L20) (`row`); purpose: Rank categories, handle signed measures and Other categories.

- **P13** — [Line chart](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/line.mdx#L1-L31) (`line`); purpose: Plot raw or calendar-aggregated time series.

- **P14** — [Box plot](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/boxplot.mdx#L1-L18) (`boxplot`); purpose: Compare distributions with box, violin and observation overlays.

- **P15** — [ECDF](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/ecdf.mdx#L1-L13) (`ecdf`); purpose: Read cumulative distributions and choose percentile thresholds.

- **P16** — [Heatmap](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/heatmap.mdx#L1-L13) (`heatmap`); purpose: Compare category intersections and filter cells.

- **P17** — [Calendar heatmap](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/calendar.mdx#L1-L12) (`calendar`); purpose: Inspect values by day on a calendar.

- **P18** — [Hierarchy](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/hierarchy.mdx#L1-L14) (`hierarchy`); purpose: Explore categorical levels as nested parts.

- **P19** — [Donut](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/donut.mdx#L1-L28) (`donut`); purpose: Show nonnegative part-to-whole measures.

- **P20** — [Funnel](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/funnel.mdx#L1-L30) (`funnel`); purpose: Measure ordered event progression for entities.

- **P21** — [Retention](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/retention.mdx#L1-L31) (`retention`); purpose: Interpret cohort retention and maturity.

- **P22** — [Timeline](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/timeline.mdx#L1-L30) (`timeline`); purpose: Display start/end intervals and filter overlap windows.

- **P23** — [Waterfall](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/waterfall.mdx#L1-L48) (`waterfall`); purpose: Explain a bridge between states or a running total.

- **P24** — [Sankey chart](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/sankey.mdx#L1-L14) (`sankey`); purpose: Explore pre-existing paths and flows.

- **P25** — [Parallel coordinates](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/parallel-coordinates.mdx#L1-L12) (`parallel-coordinates`); purpose: Compare numeric dimensions with independent axis brushes.

- **P26** — [Scatter matrix](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/scatter-matrix.mdx#L1-L13) (`scatter-matrix`); purpose: Compare pairs of variables across a matrix.

- **P27** — [3D scatter plot](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/3d-scatter.mdx#L1-L12) (`3d-scatter`); purpose: Inspect XYZ points with orbit and selection.

- **P28** — [Map](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/map.mdx#L1-L34) (`map`); purpose: Plot points or regions with optional host map setup.

- **P29** — [Composition](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/composition.mdx#L1-L25) (`composition`); purpose: Build a custom report graphic from compositional parts.

- **P30** — [Data table](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/data-table.mdx#L1-L22) (`data-table`); purpose: Inspect, sort and search rows with table-specific scope.

- **P31** — [Pivot table](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/pivot.mdx#L1-L14) (`pivot`); purpose: Group measures into a pivot with recomputed totals.

- **P32** — [Summary table](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/summary.mdx#L1-L11) (`summary`); purpose: Profile fields and start an analysis from summaries.

- **P33** — [Metric card](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/metric-card.mdx#L1-L11) (`metric-card`); purpose: Display a scoped count or aggregate metric.

- **P34** — [Color legend](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/color-legend.mdx#L1-L11) (`color-legend`); purpose: Read shared categorical or numeric color scales.

- **P35** — [Notes](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/markdown.mdx#L1-L7) (`markdown`); purpose: Add a prose Notes card to a dashboard.

- **P36** — [Filters](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/filters.mdx#L1-L23) (`filters`); purpose: Combine, inspect and clear workspace filters.

- **P37** — [Trace a mark](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/trace.mdx#L1-L35) (`trace`); purpose: Explain a mark through source rows and calculations.

- **P38** — [Edit in place](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/in-place-editing.mdx#L1-L28) (`in-place-editing`); purpose: Edit chart text and axes directly with undo semantics.

- **P39** — [Calculated fields](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/calculated-fields.mdx#L1-L17) (`calculated-fields`); purpose: Preview, apply and inspect calculated fields.

- **P40** — [Dashboard text](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/dashboard-text.mdx#L1-L21) (`dashboard-text`); purpose: Declare and apply a dashboard as text.

- **P41** — [Views and history](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/views-and-history.mdx#L1-L15) (`views-and-history`); purpose: Manage saved views and preview or restore changes.

- **P42** — [Export](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/export.mdx#L1-L21) (`export`); purpose: Export images, settings or an analysis including rows.

- **P43** — [Scales and axes](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/scales-and-axes.mdx#L1-L33) (`scales-and-axes`); purpose: Set numeric domains, transforms and visible ranges.

- **P44** — [Color](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/color.mdx#L1-L18) (`color`); purpose: Configure palettes, categorical maps and shared scales.

- **P45** — [Facets](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/facets.mdx#L1-L20) (`facets`); purpose: Repeat a chart over groups with comparable domains.

- **P46** — [Empty and invalid states](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/empty-and-invalid.mdx#L1-L10) (`empty-and-invalid`); purpose: Diagnose empty selections and invalid numeric states.

- **P47** — [How rendering works](https://github.com/byronwall/explorEDA/blob/ea8b52ff742f11d1fb89457acabbcd27b0bd04e7/apps/demo/src/docs/pages/rendering.mdx#L1-L60) (`rendering`); purpose: Understand full, peer-filtered and globally filtered row populations.

---

**Final status:** The landing and documentation strategy questions are answered with source-backed recommendations and current official comparisons. The complete baseline docs inventory and machine-readable plan are delivered. **Live UX, deployment drift and executed first-success claims remain explicitly partial and are not signed off.** No repository integration was performed.
