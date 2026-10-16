# Daily data viz corpus

The demo now has 40 narrative notebooks, 25 compositions, and 10 dashboards over 17 dataset families. Open `/daily` to search the collection and select a format. Each piece has local data, source credit, license links, and calculations. The existing examples index links to the collection.

The collection is a backlog. No publication dates, scheduler, merge, or deployment are part of this change. The release order remains in [release-plan.csv](handoff/release-plan.csv).

The integration first published a corrected copy of the archive beside the pieces. The workflow in [docs/daily-viz.md](../../daily-viz.md) replaced it: the catalogue is authored directly, findings are recomputed in TypeScript by `corpus.test.ts`, and the Python pipeline, raw snapshots, specifications, and reports moved to [handoff/](handoff/).

## Sources and files

Pro authored the [original archive](pro/exploreda-daily-viz-corpus.zip) in [the recorded conversation](https://chatgpt.com/c/6ad19075-7438-83ea-9b8e-dc2facfa706d). Its SHA-256 is `352b714d33ba8afa8bc8ca6ebbdaa77f8f28c53bed337ff8cbb6c5d16a0f5a17`. The companion checksum agrees. The archive has 318 safe members. All original manifest hashes and sizes match. The archive preserves originals; the public directory contains the integration copy.

The [catalogue](../../../apps/demo/public/daily-viz/catalog.json) gives each piece a stable ID, question, format, paths, evidence, and related pieces. Data files and project contracts live under `apps/demo/public/daily-viz/projects/<family>`. Notebook files use `.eda.md`; compositions and dashboards use `.eda`. An `exploreda.eda` file declares the local sources and queries in each family.

The original [report](handoff/report.md), [datasets](handoff/datasets.json), and [gaps](handoff/gaps.json) describe Pro's output before local validation. Their pending status is historical. The integration catalogue records native compilation and distinguishes the three browser-reviewed entries from the rest. Use this document and local validation evidence for integration status. The original manifest fingerprints the delivered archive, not later local fixes.

## Decisions

| Pro proposal                                              | Disposition      | Result                                                                                                       |
| --------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Portable source snapshots and family project folders      | Adopt            | All 17 families and 32 prepared tables are local assets.                                                     |
| Narrative notebook support                                | Adopt            | Reuse `readNotebookText` and `ExplorEdaNotebook`; preserve chart-local selections.                           |
| Dashboard and composition integration                     | Adopt            | Reuse `compileViews` and `ExplorEda`; preserve linked selection within each query result.                    |
| Discovery metadata and related pieces                     | Adopt            | Search, format selection, stable URLs, title/description metadata, related links, and build-time HTML pages. |
| Fixed-snapshot evidence                                   | Adopt            | Render interpretation and limits; retain data, field dictionaries, source code, and contributing IDs.        |
| A daily release sequence                                  | Adopt as backlog | Retain the CSV sequence without scheduling publication.                                                      |
| Fifty views of one dataset                                | Defer            | Prefer distinct questions across 17 families. There is no count-padding series.                              |
| Original visualization improvements                       | Adopt            | Keep the design companions and notebook comparison steps. Do not copy external protected designs.            |
| More transport data                                       | Defer            | Bike-sharing acquisition failed. The current corpus meets all requested counts.                              |
| Automatic prose updates from chart filters                | Defer            | Written findings describe the full frozen snapshot.                                                          |
| Treat benchmark samples as current or representative data | Reject           | Preserve historical dates, sample descriptions, and limits.                                                  |
| New composition primitives and recursive trace support    | Investigate      | Keep as capability ideas; no library API changes in this PR.                                                 |

## Local changes to the corpus

All project query declarations needed `glyph=◆`. Without it, the native project compiler rejected them. The integration copy supplies the glyph; the archive stays unchanged.

The Python audit compared float results with exact equality. On this machine, 19 repeated correlation results differ by at most `6.661338147750939e-16`. The integration audit uses `math.isclose` with `1e-12` relative and absolute limits for computed values only. Counts, filters, contributing IDs, statements, hashes, and all other fields still use exact comparisons. All 150 findings match at that tolerance. No written numerical finding changed.

The integration also shortens dashboard guidance to fit narrow panels and lets daily-page category legends wrap. The preparation and authoring scripts retain these fixes.

The host resolves Markdown links from their project file path. This keeps notebook and design-note evidence links valid at `/daily/<slug>`.

The demo build writes static HTML for all 75 article routes and the collection index. It includes article text, canonical URLs, metadata, and ordinary links before JavaScript runs. The existing React app then opens interactive charts. `daily-sitemap.xml` lists the routes. This improves crawl access; no search ranking or traffic gain is claimed.

## Independent source checks

All 17 direct source URLs were fetched. Fifteen raw snapshots match upstream bytes exactly. All four captured Tate fields match the first 60 upstream artist records. All 48 captured football records match their upstream group, date, team names, and final goals. Both captured sources also match Pro’s recorded Git blob IDs. See [upstream checks](validation/upstream.json). This does not make the Tate prefix representative.

The source metadata retains units, dates, preparation steps, missingness, and credits. Publisher checks confirmed the recorded terms for [Danish data](https://www.statsmodels.org/stable/datasets/generated/danish_data.html#copyright), [Grunfeld](https://www.statsmodels.org/stable/datasets/generated/grunfeld.html#copyright), [Iris](https://archive.ics.uci.edu/dataset/53/iris), [Wine](https://archive.ics.uci.edu/dataset/109/wine), [Tate](https://github.com/tategallery/collection), and [OpenFootball](https://github.com/openfootball/worldcup). Dataset-specific notices for the other families remain in the collection. No third-party images are bundled.

## Validation

- Original archive: safe paths, no symlinks or duplicate members, CRC, manifest size/hash, and checksum checks pass.
- All 75 entries compile against every local query row, with no diagnostics or skipped charts. Each notebook has five charts, each composition one artboard, and each dashboard eight panels.
- All 150 finding calculations, prepared-table hashes, field contracts, missingness, keys, and lookup populations pass the reviewed offline audit. [Results](validation/evidence-audit.json).
- Targeted corpus, coverage, and existing dashboard round-trip checks pass. Static-page and Markdown-link checks pass.
- `pnpm check` passed UI rules, all three builds, and all three type checks. Its library test step passed 241 files and hit sandbox socket/file-watch errors in five files. Those five files passed with approved access: 50 tests. The full command was not a single green run; its initial failures and the focused recovery remain recorded.
- The complete demo suite passes: 18 files, 293 tests. The final daily tests pass: 3 files, 79 tests. Type checking passes after the final metadata change.
- All 75 build-time article pages, the collection index, canonical URLs, and 78 sitemap entries pass output checks.
- Browser verification: catalogue search, format counts, notebook, composition, dashboard, related links, EDA and CSV downloads, and a dashboard selection were checked. The selection reduced 1,417 rows to 704. Tested widths: 1280, 783, and 390. The dashboard guidance clipping was fixed. The final legend recheck passes: all labels and counts remain visible, and selecting Below forecast gives 704 rows. Fresh navigations report no console errors or warnings. Mobile artboards retain their size within a bounded scroll region. Keyboard focus, ArrowRight, and zoom pass at 390 and 783; desktop fits at 1280. Fresh route checks have no console errors or warnings. Not all 75 routes have individual browser review.

## Limits

This is a historical analysis collection, not current reporting. Some topics use small teaching datasets. Tate covers an alphabetic prefix. Football covers the 2018 group stage only. Raw snapshots, derived tables, and repeated grains are not independent populations and must not be added together.

Browser checks can establish only the tested routes and interactions. A passing compiler does not prove that every graphic reads well at every width. Keep that distinction in the final verification record.
