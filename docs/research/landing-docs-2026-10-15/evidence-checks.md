# Independent evidence checks

Codex checked these items on October 15, 2026. Pro's original files remain unchanged.
The pinned source is `ea8b52ff742f11d1fb89457acabbcd27b0bd04e7`. No application files changed during integration.

## Collected artifacts

The ZIP contains five regular files with safe relative paths. Its CRC check passed before extraction.
All four payload sizes and SHA-256 hashes match Pro's manifest.
The JSON parses; all recommendation evidence IDs resolve. The CSV has 47 unique topics matching the baseline MDX files.
Each CSV source hash matches its local baseline page. The report, source register, inventory, and recommendations were read.

The browser download event timed out for the ZIP. The actual downloaded file existed and passed checks.
Separate report and CSV downloads match the archive. Other companions were recovered from the verified archive.
Older generic filenames in Downloads belong to other work and were excluded.
See [collection-manifest.json](collection-manifest.json) for sizes, hashes, and collection limits.

## Source checks and corrections

| Finding                                            | Direct evidence                                                                                                                  | Decision                                                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| The landing omits named priority workflow routes.  | `apps/demo/src/landing/Hero.tsx`, `SiteNav.tsx`, and `apps/demo/src/LandingPage.tsx`.                                            | Retain the finding; Chrome also confirmed it.                                                         |
| The docs already cover all three features.         | `apps/demo/src/docs/catalogue.ts` and the notebooks, database-sources, and team-server MDX files.                                | Improve emphasis and learning paths; do not call these missing pages.                                 |
| Database reads use snapshots and explicit refresh. | `packages/explorEDA/src/server/sources/refresh.ts`, `read.ts`, and the docs.                                                     | Retain this distinction in proposed copy.                                                             |
| The no-change guarantee is too broad.              | `src/server/sources/drivers/sqlserver.ts`: query description, execution in a transaction, and rollback.                          | Describe the safeguards and read-only credentials. No exploit or security certification is claimed.   |
| Server network wording omits databases.            | `team-server.mdx` limits egress wording to downloads; `refresh.ts` uses database drivers.                                        | Retain a focused wording correction.                                                                  |
| Notebook selections are local.                     | `src/components/notebook/ExplorEdaNotebook.tsx` passes `localSelections`; notebook docs state that scope.                        | Do not generalize linked-dashboard claims to notebooks.                                               |
| Seed data is not all memory-only.                  | `src/cli/serverCommand.ts` uses memory account/secret stores. `src/server/team/seed.ts` copies files under the data folder.      | Correct Pro's broad “accounts/data are disposable” wording. Accounts are transient; files can remain. |
| Team notebook UI exists in source.                 | `apps/app/src/team/TeamApp.tsx` renders `App`; `App.tsx` renders `ProjectWorkspace`; that component lists and renders notebooks. | Reduce the missing-wiring uncertainty. Runtime operation remains untested here.                       |
| The order book is retail data.                     | `apps/demo/src/landing/LiveOrderBook.tsx` and `demos/examples.ts` show orders, channels, and product categories.                 | Reject a financial-domain rationale for replacing it.                                                 |
| Forecast data exists.                              | `packages/explorEDA/examples/forecast/data/ercot-demand.csv`.                                                                    | An acquisition lesson is useful; a new dataset is not required.                                       |
| Intent documents are stale.                        | Notebook/database intent briefs conflict with current parser, drivers, and user docs.                                            | Propose current-status pointers; preserve historical intent.                                          |

Paths beginning with `src/` in this table are under `packages/explorEDA/`.
These checks establish source facts. They do not establish a successful user task.

## Public site checks

Chrome in Byron's signed-in `byroni.us` profile reached [the landing page](https://exploreda.dev/) and [docs home](https://exploreda.dev/docs).
The landing shows the CSV headline, file/sample actions, and React install command.
Its links do not name notebook, database, or team-server documentation.
The footer still describes a React workspace.

The docs home shows 47 guides and the three top starter links: React embedding, workspace tour, and examples.
The sidebar and Get started cards include Notebooks, Team server, and Database sources.
Codex followed those three sidebar links. Each guide loaded its main content.
Database docs describe snapshots and refresh. Notebook docs describe local selections and chart/text edits.
Team docs describe seed accounts and persistent setup.

Pro's inability to fetch these pages was a research-tool limit. It was not evidence of an unavailable site.
Chrome closes the page-access gap. It does not establish the deployed commit or byte equality with the baseline.
The inspected wording matches the relevant baseline claims. Wider drift remains unchecked.

Captures and page observations are under `tmp/landing-docs-pro/` and are not committed.
Baseline screenshots are included in the review PR. They show existing content, not implemented improvements.
No upload, database connection, account setup, notebook edit, or full first-success task was performed through the site.

## Official source checks

The checks below support the retained comparison patterns. Each source was accessed on October 15, 2026.
Pro's [source register](originals/sources.md) records its wider 33-page research set.

| Source checked by Codex                                                                                                                                  | Supported conclusion                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [Metabase landing](https://www.metabase.com/) and [Ask a question](https://www.metabase.com/learn/metabase-basics/getting-started/ask-a-question)        | Distinct user/developer/admin routes; a sample-data lesson ends in saving.                                          |
| [Superset landing](https://superset.apache.org/) and [Quickstart](https://superset.apache.org/user-docs/quickstart/)                                     | Role-based docs routes and an evaluation setup boundary. Quickstart retrieval was intermittent on a second request. |
| [Evidence landing](https://evidence.dev/) and [Self Host](https://docs.evidence.dev/self-host)                                                           | Text-authored analysis is explicit. Hosting docs separate operator duties and Studio features.                      |
| [Observable Framework](https://observablehq.github.io/framework/) and [Getting started](https://observablehq.github.io/framework/getting-started)        | A precise authoring category and create/edit/publish lesson. Its execution model is not explorEDA's notebook model. |
| [Perspective landing](https://perspective-dev.github.io/) and [Data Architecture](https://perspective-dev.github.io/guide/explanation/architecture.html) | Component positioning and explicit client/server choices.                                                           |
| [Rill landing](https://www.rilldata.com/) and [Cloud vs Developer](https://docs.rilldata.com/developers/deploy/cloud-vs-developer)                       | Clear authoring/consumption responsibilities. This does not justify a new explorEDA cloud product.                  |
| [Diátaxis](https://diataxis.fr/)                                                                                                                         | Tutorials, how-to guides, reference, and explanation address distinct needs.                                        |

These are content checks, not competitor product tests. Vendor speed, adoption, security, and entitlement claims remain unverified.
Pro's Evidence introduction/hosting tension is retained as its qualified observation, not a decisive independently resolved finding.

## Validation and limits

- Artifact integrity, JSON/CSV parsing, topic/source-hash matching, and evidence-ID checks: passed.
- `pnpm --filter demo docs:check`: passed, 3 files and 73 tests.
- `pnpm check`: passed (UI checks, builds, type checks, and tests). Library: 1,632 passed / 45 skipped; app: 32 passed; demo: 214 passed.
- New document links, final diff, Git identity, and PR state: checked during final integration.

The initial sandbox check could not reach the package registry. The retry installed locked dependencies with network access.
React `act(...)` warnings appeared in the passing docs checks. No application code changed to address them.
No changeset is needed for research-only changes.
The six end-to-end tasks in the report remain proposed acceptance work for later lesson changes.
No user study, package publication check, container pull, deployment/restore drill, or performance audit was run.

Original artifacts are committed separately with formatting hooks skipped to preserve their verified bytes.
The authored summary files use the normal formatting hook. Structured outputs and hashes were checked before committing originals.
