# Daily data viz

The demo's `/daily` collection holds narrative notebooks, compositions, and dashboards over real datasets. Each piece answers one question with local data and states findings the tests recompute. This page is the workflow for adding pieces. Follow it in order; every step has a command.

## Where things live

- `apps/demo/public/daily-viz/catalog.json`: the only list of pieces. One entry per piece; see [Catalogue entry](#catalogue-entry).
- `apps/demo/public/daily-viz/datasets.json`: one credit and license record per family.
- `apps/demo/public/daily-viz/projects/<family>/`: a project folder the CLI can open. `exploreda.eda` declares sources and queries; the piece files sit beside it. A family can read a demo dataset in place, such as `path=../../../datasets/flights/flights.csv`.
- `apps/demo/dailyCorpus.mjs`: derives everything else from the catalogue and files: paths, chart words, composition marks, related pieces, table sizes, the static article pages, and the sitemap. The dev server serves the result at `/daily-viz/index.json`.
- `apps/demo/src/daily/`: the pages, `findings.ts` (the finding calculator), and `corpus.test.ts`.
- `scripts/daily.mjs` and `scripts/daily-templates/`: the authoring commands below.
- `docs/research/daily-viz-corpus-2026-10-15/`: how the first 75 pieces were made, kept for provenance. Do not copy its Python pipeline; it is replaced by the steps here.

## Workflow

1. **Pick a gap.** Run `pnpm daily coverage`. It counts pieces by format, industry, analysis, family, chart word, and composition mark, and names what has none yet. Go wide before deep: a new industry, a new kind of question, or an unused chart word beats a seventh piece on one dataset. Go deep only as a [series](#series-and-deep-dives).
2. **Get the data.** Prefer a dataset the demo already ships (`apps/demo/public/datasets/README.md` lists sources and licenses). Otherwise prepare a small CSV under `projects/<family>/data/` with a script under `apps/data-samples/prepare/`, and record the source, license, and version. Never invent measurements.
3. **Start the family** if it is new: `pnpm daily family <family> <csv>...` writes `exploreda.eda` with typed fields and a `datasets.json` record to fill in.
4. **Add the piece:** `pnpm daily new <notebook|composition|dashboard> <family>/<slug> --title "…" --question "…" --industry "…" --analysis "…"`. It copies a template and registers the entry with no findings.
5. **Write it.** Follow [Writing rules](#writing-rules). Open `/daily/<family>-<slug>` on `pnpm dev:agent` and read it as a visitor would.
6. **Declare findings** in the catalogue entry and type each computed sentence into the prose. Run `pnpm daily check`. It compiles every piece against its local rows and fails when a sentence in the prose differs from its computed value.
7. **Look at it** at 1280, 783, and 390 px with `pnpm shot /daily/<slug> --name daily-<slug>`.

## Catalogue entry

```json
{
  "id": "nb-flights-delay-tail",
  "slug": "flights-delay-tail",
  "kind": "notebook",
  "title": "Most January flights left on time; the average says otherwise",
  "question": "How late is a typical January departure from New York?",
  "summary": "Two sentences on what the reader learns.",
  "family": "flights",
  "entry": "delay-tail.eda.md",
  "query": "flights",
  "industry": "Transportation",
  "analysis": "Distribution",
  "findings": [
    {
      "text": "The median departure delay was {value} minutes.",
      "format": ".0f",
      "op": "median",
      "field": "dep_delay"
    }
  ]
}
```

- `kind` is `notebook` (`.eda.md`), `composition` (`.eda` plus `companion`, a `.design.md` note), or `dashboard` (`.eda` plus a `.guide.md`).
- `industry` and `analysis` are the browse facets. Reuse a value from `pnpm daily coverage` when one fits; add a new one when it does not.
- `series` (optional) is `{ "id", "title", "part" }`; see below.
- A finding has `text` with `{value}`, a Python-style `format` (`.2f`, `,.0f`), and a calculation: `op` is one of `count`, `mean`, `median`, `min`, `max`, `sum`, `quantile` (with `q`), `corr` (with `other`), `share` (percent of rows matching `condition`), `missing_share`, `top_share` (with `k`), `ratio_sums` (with `other`, optional `scale`), or `weighted_mean` (with `weight`). `where` filters rows first: `[["decade", "eq", "1990s"]]`, with `eq`, `ne`, `lt`, `le`, `gt`, `ge`. `query` reads another query of the family.

## Writing rules

- **The title states the finding or the tension**, in plain words. Vary the form; a collection where every title reads "X is not Y" is monotonous.
- **The question is one a person would ask**, not a description of the chart.
- **Each heading is a claim the chart under it supports.** The paragraph says what to look at.
- **Labels are readable names with units:** `CO₂ (ppm)`, not `Co2 (ppmv)` or `co2`. Don't label key or id fields.
- **Say the source once.** The page prints the dataset's credit, license, tables, and downloads under every piece. Don't repeat them in prose, panel notes, or footnotes beyond one artboard credit line.
- **Findings are computed, not typed from memory.** Copy the sentence `pnpm daily check` reports.
- **Notebooks** have three to six charts. End with `## Takeaway` and `## Limits`. A records table is optional; add one when a reader would want to check rows.
- **Compositions** are designed graphics, not a default chart in a frame. Use the mark the question needs; the [composition mode](composition-mode.md) table lists them with reference examples. The design note says what a default chart would show and what this design gives up.
- **Dashboards** link six or so views of one query. The guide lists two or three selections to try and what each should change. Don't spend a panel on instructions.

## Series and deep dives

Breadth first: the collection should span many industries, kinds of question, and chart forms. Once a dataset has earned it, a series goes deep: three to six pieces that build on each other, each standing alone. Give each entry `"series": { "id": "flights-january", "title": "A month of New York flights", "part": 1 }`. The page links the parts in order.
