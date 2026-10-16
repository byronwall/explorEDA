# Landing page and docs review

The landing page explains linked file exploration well. It does not show the full product users can use today.
The docs have strong chart reference and explanation. They need clearer starting paths and complete beginner lessons.

This review compares both surfaces with Metabase, Superset, Evidence, Observable Framework, Perspective, and Rill.
The review covers all 47 baseline docs pages. It applies Diátaxis, task-based navigation, progressive disclosure, and Docs as Code.

These are proposed changes for review. This PR changes research documents only.

## Proposed direction

Keep linked exploration as the lead. Broaden “CSV” to “data” and show these paths early:

| User's task                       | Canonical docs               | Existing example                              |
| --------------------------------- | ---------------------------- | --------------------------------------------- |
| Explore a file                    | Load data, Workspace, Export | Shop orders sample / `shop-operations`        |
| Work in a local folder            | Project folders              | CLI shop example                              |
| Read and refresh database data    | Database sources             | CLI database example / Compose retail project |
| Explain an analysis in a notebook | Notebooks                    | Forecast project and its existing CSV         |
| Run explorEDA for a team          | Team server                  | Seed accounts / Compose retail project        |
| Embed a workspace                 | Developers                   | React integration example / `shop-operations` |

Keep file and sample actions prominent. Put the React install command with the developer path.
Add early links for self-hosting, databases, and notebooks. Each link should state where that workflow runs.
Databases provide saved snapshots with explicit refresh. Notebooks use Markdown and `eda` blocks; selections stay local to each chart.

This audience order is a proposal. We have no user study or conversion data to establish it.
The broader “analysis platform” lead remains an alternative if Byron chooses teams as the primary audience.

## Documentation assessment

| Reader need              | Current quality                                                 | Proposed change                                                 |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------- |
| Learn through a tutorial | Useful fragments, few complete first outcomes                   | Guide a reader from known input to a saved and reopened result. |
| Complete a task          | Substantial procedures, with setup and reference mixed together | Put prerequisites and the main steps before specialist options. |
| Look up facts            | Strong generated chart settings and detailed syntax             | Keep the current reference system and canonical pages.          |
| Understand a model       | Strong chart, row, and filter explanations                      | Add a short runtime and data-location guide.                    |

Diátaxis exposes the tutorial gap. It does not make a new four-part sidebar the necessary first change.
Use distinct tutorial, task, reference, and explanation sections with clear links. Split pages when reader needs justify it.
Keep the six existing topic groups initially. Keep generated reference and the chart chooser.

The main page changes are concrete:

- **Database sources:** prerequisites → first SQLite read → refresh checkpoint → connection tasks → driver reference.
- **Notebooks:** complete project acquisition → create/open → edit text and chart → inspect the file change → reopen → syntax.
- **Team server:** evaluation → persistent setup → people and data → operation and recovery.
- **Developers:** mount → edit → save → remount with rows and settings → API reference.

The full report includes current and proposed outlines for these pages.

## What the comparisons teach

| System               | Landing lesson                                            | Docs lesson                                             | Limit                                                                |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| Metabase             | Give analysts, operators, and embedders clear routes.     | A fixed sample lesson ends with a saved result.         | Its commercial scope is much larger.                                 |
| Superset             | Name exploration and separate user/admin/developer paths. | Distinguish evaluation setup from persistent operation. | Inspected instructions include Next-version docs.                    |
| Evidence             | Make text-authored analysis visible.                      | Make edition and hosting boundaries explicit.           | Its own introduction and hosting guide need careful version context. |
| Observable Framework | Use a precise category and direct start.                  | Show create, edit, and publish checkpoints.             | Its JavaScript execution model differs from `eda` notebooks.         |
| Perspective          | Explain the component category and developer routes.      | Explain runtime and data ownership before API detail.   | It is a toolkit, not a team application.                             |
| Rill                 | Distinguish building from consuming analyses.             | Explain local and cloud responsibilities.               | Its cloud path is not explorEDA's product plan.                      |

The reusable pattern is a clear benefit, a suitable task path, a bounded first result, and deeper reference.
The report's scores are editorial judgments about inspected content. They are not product rankings or measured usability results.
See [independent checks](evidence-checks.md) for checked official sources and qualifications.

## Work proposed for later implementation

| Step                     | Work                                                  | Docs and example scope                                                             | Exit evidence                                             |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1. Correct claims        | Fix network/read guarantees and stale status text.    | Team server, Database sources, Filters; seed/database/forecast examples.           | Each claim matches its code and runtime.                  |
| 2. Expose paths          | Add early workflow links and a docs starting panel.   | Docs home and the six canonical paths above; reuse their examples.                 | Readers can find the correct next action.                 |
| 3. Complete lessons      | Add first-success checkpoints to existing pages.      | File, local, database, notebook, team, and React lessons with the listed fixtures. | Each lesson reaches a saved/reopened or refreshed result. |
| 4. Add proof selectively | Capture verified workflows and close small test gaps. | The same pages and fixtures; no separate demo system.                              | Real task records support each promoted claim.            |

Run the six task checks when implementing those lessons. Do not turn them into a prerequisite for preserving this research.
Keep managed hosting, SSO, new warehouse adapters, and arbitrary notebook kernels outside this proposal.

## Review decisions and corrections

All 16 recommendations have a disposition in [reconciliation.md](reconciliation.md).
“Adopt” means retain in the proposed direction. It does not mean the application change is approved or complete.

Two details in Pro's report need correction:

- Seed **accounts and credentials** use memory. Project files are copied to disk and can remain after restart.
- The order book example shows retail orders, channels, and categories. A financial-domain objection does not apply.

The source also shows the shared team app rendering notebooks. Full operation across runtimes still needs execution evidence.
These corrections are recorded separately. The original Pro files remain unchanged.

## Evidence and deliverables

- [Full original report](originals/landing-docs-review.md)
- [All 47 docs pages](originals/page-inventory.csv)
- [Recommendations and evidence catalogue](originals/recommendations.json)
- [Source register](originals/sources.md)
- [Original ZIP](originals/exploreda-landing-docs-review.zip) and [Pro manifest](originals/manifest.json)
- [Collection checks](collection-manifest.json), [independent checks](evidence-checks.md), and [run record](run.md)
- [Submitted prompt](pro-prompt.md) and [Pro conversation](https://chatgpt.com/c/6ad05992-f05c-83ea-9ba1-21bda700c45f)

The baseline is `ea8b52ff742f11d1fb89457acabbcd27b0bd04e7`.
Chrome confirmed the public landing/docs content and the three priority docs routes on October 15, 2026.
No deployed commit identity was established. No new-user study, database connection, or deployment drill was performed.
