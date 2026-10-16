https://github.com/byronwall/explorEDA

# Produce the daily data visualization corpus

## Mission and context

Act as a data journalist, exploratory analyst, and creative visualization author. Produce a substantial, usable publication backlog for explorEDA. Byron wants daily examples that force the tool to do interesting work, show its capabilities, improve visualization craft, and provide useful search content. This is artifact production plus research, not a list of suggested topics. Codex will collect, verify, and integrate your actual data and analysis files into the demo site, then open a review PR. Do not push, open a PR, merge, or deploy.

Target: **40 narrative notebooks, 25 compositions, and 10 dashboards**. These are distinct editorial pieces, not 75 near-identical charts. Required floor: 30 notebooks, 20 compositions, 10 dashboards. Prefer the target, never count an outline as a completed artifact. Provide any incomplete candidates separately. Reusing a rich dataset across genuinely different questions is encouraged. Seek at least 15 dataset families, with at least 8 new to the existing demo. Prefer manageable public snapshots with clear redistribution rights.

Two recurring editorial ideas are hypotheses to evaluate: “50 ways to see the same dataset” and “improve this visualization.” Use a coherent subset of each if useful. Do not force fifty redundant views. For improvement pieces, explain the original problem, each change, what improves, and what information can be lost. Cite reference work; don't copy protected prose, images, or distinctive designs without permission. Use original analytical designs and public-domain or openly licensed reference material where possible.

## Baseline and access gate

Source baseline: commit ea8b52ff742f11d1fb89457acabbcd27b0bd04e7. Codex integration branch: codex/daily-viz-corpus. Current source packet is a selected text snapshot from this exact baseline, not a runnable checkout. It includes real source, syntax tests, docs, representative examples, and a manifest. It excludes dependencies and most dataset rows. You may use connected repository access for additional context. The attached packet is an explicitly permitted fallback if repository access fails.

GO: verify repository owner/name or packet manifest, identify the baseline, read DSL and notebook contracts, and confirm that your tools can research sources, download data, compute findings, and create output files. No writable Git checkout is needed. State whether DSL execution is possible. Separate syntax inspected from syntax actually compiled.

NO-GO: wrong repository, absent syntax context, absent data for a claimed finding, unverifiable redistribution terms for data you intend to bundle, or tools unable to create a complete artifact or response fallback. Stop only the affected candidate when other candidates can proceed. Replace inaccessible or restricted sources. Never substitute invented rows for real data or call synthetic data real. If the full count cannot be reached, deliver complete useful work, exact counts, and a gap ledger; do not claim completion.

## Ranked priorities

1. Produce the actual corpus with portable data snapshots, computed findings, and source provenance. Each notebook needs a question, exploration, comparison, findings, limits, and charts placed in the narrative. Each composition needs a clear analytical message and deliberate visual design. Each dashboard needs linked views that support a concrete investigation.
2. Use the actual supported DSL. Notebooks are `<slug>.eda.md`, with Markdown prose and fenced `eda` blocks. Dashboard and composition analyses are `<slug>.eda`. Data sources and queries belong in `exploreda.eda`. Do not invent chart types, settings, functions, or a JSON notebook format. Use qualified source fields and aliases as demonstrated by the real examples.
3. Make content portable into the demo. Include real local CSV/JSON snapshots and relative project paths. No API keys, runtime fetch dependencies, CORS assumptions, or unavailable absolute paths. Check what the demo already supports and identify the smallest adaptation needed to show notebooks in a public catalogue.
4. Make the topics diverse, useful, and discoverable. Supply specific page titles, descriptions, reader questions, search intent, related content IDs, and original explanatory text. SEO is a discoverability goal, not permission to fabricate search-volume estimates or write filler.
5. Supply an ordered release backlog and honest tool capability gaps. Favor analytical variety and editorial quality over count padding.

## Read this repository route

Read the attached snapshot and, if available, the same files in the repository:
- `AGENTS.md`, `README.md`, `CODING_STANDARDS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`.
- `apps/demo/src/docs/pages/notebooks.mdx`, `project-folders.mdx`, `dashboard-text.mdx`, `composition.mdx`; `docs/composition-mode.md`.
- `packages/explorEDA/examples/forecast/exploreda.eda`, `forecast.eda.md`, and its sample data.
- `packages/explorEDA/src/lib/notebook/{parseNotebook,compileNotebook,readNotebook}.ts` and relevant tests.
- `packages/explorEDA/src/lib/dsl/{project,composition,compile,settingKeys,describe}.ts`, composition tests, and views tests.
- `apps/demo/src/demos/examples.ts`, `coverage.ts`, `dashboardSettings.ts`, `analyses/types.ts`, `analyses/loadAnalysis.ts`, and representative analysis files.
- `apps/demo/public/datasets/README.md` and `docs/research/demo-datasets/{README,dataset-research}.md` for existing material and reserve sources.
- `apps/demo/src/dashboardText.test.ts`, `apps/demo/src/demos/coverage.test.ts`, and `packages/explorEDA/src/cli/exploredaDsl.ts` for validation.

Verified facts: the existing demo is React and TypeScript; preserve that stack. It loads related-table examples using `ExampleAnalysis.project`, `.tableFiles`, and `.text`. It also supports single-file examples and saved chart settings. The library has a notebook reader/compiler/component, but that alone does not establish a public notebook catalogue route. Investigate this distinction. Existing material includes flights, Beijing air, World Bank development, earthquakes, penguins, wine, Titanic, weather, and many compositions. Identify reuse explicitly and avoid presenting existing work as new.

Relevant local checks Codex will run: `pnpm --filter exploreda exec vitest run <files>`, `pnpm --filter exploreda check-types`, `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts`, and `pnpm check` before PR. The DSL CLI checks notebook files and project folders; inspect its source before giving exact invocation commands. Browser checks use 1280, 783, and 390 CSS pixels. Do not claim to run commands unavailable in your environment.

## Editorial and analytical requirements

Prefer open primary sources and fixed, dated snapshots. Include time, geography, science, culture, transport, environment, sport, and everyday-life questions. Use both small approachable data and richer related tables. No personal sensitive records. Synthetic data is acceptable only when clearly labeled and justified; most pieces should use real public data.

For every dataset record source landing URL, direct download URL, publisher, license name and URL, retrieval time, coverage, units, missing-value rules, transformations, source and output row counts, and SHA-256 hashes. Preserve source credit on the eventual page. For sources already bundled here, retain their documented provenance; do not quietly replace historical facts with current data. If redistribution is unclear, replace the source or put the candidate in the blocked ledger; do not bundle it as ready.

Compute rough analysis on the exact supplied snapshot. Every numeric narrative claim must map to a reproducible calculation with its denominator, filter, unit, and rounding. Distinguish observations from causal claims. Include missingness, sampling, aggregation, population, and measurement limits where relevant. No finding based only on a visual guess. Provide runnable preparation and analysis source as reference artifacts; Codex will review programs before execution.

Each notebook should contain about 4–7 meaningful chart steps, short substantive prose, at least two verified findings, and one useful caveat. Variation should serve the question. Each composition should explain its encoding, ordering, baseline, and scale. Supply legible titles, labels, units, and source notes. A dashboard should have about 4–8 complementary views, a clear entry question, and suggested interactions. Mark unsupported ideas as future capability opportunities; never silently use fake syntax.

## Exact output contract

Create a downloadable `exploreda-daily-viz-corpus.zip`, with these contents:

- `README.md`: how to open the corpus, exact delivered counts, data families, status, and limits.
- `report.md`: editorial strategy, current format support, minimal demo integration plan with real file references, capability opportunities, and incomplete work.
- `catalog.json`: one stable ID per piece with kind, title, description, topic, question, dataset IDs, relative entry/project paths, verified findings and evidence paths, capability tags, related IDs, series ID, search intent, proposed slug, readiness, and release order. Count only real files as delivered.
- `datasets.json`: all provenance and license records, preparation paths, row counts, hashes, and units.
- `release-plan.csv`: one row per piece, ordered for roughly daily release with variety; use sequence numbers, not invented publication commitments. Keep the corpus available as a backlog. Do not schedule or publish posts.
- `sources.json`: source IDs, authoritative URLs, retrieval dates, and what each supports.
- `projects/<family>/exploreda.eda`, `data/*.csv` or `.json`, notebook `.eda.md` files, composition and dashboard `.eda` files. Share data within family folders. Every entry must resolve its sources locally in the archive.
- `evidence/`: machine-readable computed findings, field dictionaries, validation results, and analysis/preparation scripts. Data transformations must be reproducible. Include exact commands and dependencies.
- `gaps.json`: affected IDs, reasons, required tool capabilities or missing sources, and explicit unrun checks.
- `manifest.json`: delivered counts by kind, all files, sizes, and SHA-256 hashes (exclude the manifest's own hash if needed).

Also provide standalone download links for README, report, catalog, datasets, and manifest. Link the ZIP and every standalone output in the final response. If artifact creation is unavailable, return complete structured file contents in the response, with explicit paths. State that no files or commits were created in the repository.

## Validation and stop rules

Before declaring success: verify distinct counts; parse JSON and CSV; confirm each catalog path exists; verify source paths and field names; reject duplicate or empty pieces; check numerical claims against computed evidence; inspect license records; ensure archives have safe relative paths. Compile all DSL entries if a runnable checkout exists. Otherwise label every entry as pending local compiler verification, and use source tests to reduce syntax mistakes. Never relabel proposed checks as executed checks.

Work in bounded batches internally and preserve completed artifacts if time runs short. Do not spend the run only on strategy or a catalog. Deliver the actual data and analysis content. Complete the floor before adding optional ideas. If a required gate remains unmet, report partial status and exact gaps. Codex may send at most two focused correction requests, then integrate useful work with clear limits.

Codex owns local application integration and Git. Keep changes simple, reuse the existing reader and catalogue, and avoid CMS infrastructure, automatic publication, library redesign, or framework migration. Your final summary must state access/baseline, files read, exact counts, checks actually run, all download links, assumptions, and blockers.
