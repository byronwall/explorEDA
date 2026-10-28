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
7. **Schedule it:** `pnpm daily schedule` gives every piece without a `published` date the next free day after the latest one, choosing an order so neighboring days use different datasets, industries, and analyses, and series parts stay in order. A piece is listed from its day on, in the reader's time zone; until then its page works but nothing links to it. To publish a batch at once, schedule it and the days stack up after today.
8. **Picture it:** `pnpm daily thumbs <slug>` captures the top of the piece's lead graphic at 2x as two WebPs for the index: 1,440 px wide for the Today lead and 640 px wide for the cards. Rerun it after changing the first chart. When it prints "cut off on the page", the chart clips that text for readers too; fix the chart, not the picture.
9. **Look at it.** `pnpm daily review <slug>...` screenshots each piece at 1280 px and tiles them into `tmp/daily-review.png`, one image to check a batch. Check the final ones at 1280, 783, and 390 px with `pnpm shot /daily/<slug> --name daily-<slug>`.

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
  "published": "2026-10-17",
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
- `published` is the day the piece appears; `pnpm daily schedule` writes it.
- `series` (optional) is `{ "id", "title", "part" }`; see below.
- A finding has `text` with `{value}`, a Python-style `format` (`.2f`, `,.0f`), and a calculation: `op` is one of `count`, `mean`, `median`, `min`, `max`, `sum`, `quantile` (with `q`), `corr` (with `other`), `share` (percent of rows matching `condition`), `missing_share`, `top_share` (with `k`), `ratio_sums` (with `other`, optional `scale`), or `weighted_mean` (with `weight`); `earliest` and `latest` read a date field and take a date `format` instead: `iso` (1986-04-26), `day` (26 April 1986), or `month` (April 1986), so "the first week above 350 ppm was 26 April 1986" is checked like any number. `where` filters rows first: `[["decade", "eq", "1990s"]]`, with `eq`, `ne`, `lt`, `le`, `gt`, `ge`; ISO dates compare as text, so `["date", "ge", "2021-02-14"]` works. `query` reads another query of the family.

## Writing rules

The [editorial standard](daily-editorial.md) is the bar: a finding-led title, a comparison with its difference stated, an annotated moment, numbers woven into sentences, and no boilerplate. The rules here are the mechanics.

- **The title states the finding or the tension**, in plain words. Vary the form; a collection where every title reads "X is not Y" is monotonous.
- **The question is one a person would ask**, not a description of the chart.
- **Each heading is a claim the chart under it supports.** The paragraph says what to look at.
- **Labels are readable names with units:** `CO₂ (ppm)`, not `Co2 (ppmv)` or `co2`. Don't label key or id fields.
- **Say the source once.** The page prints the dataset's credit, license, tables, and downloads under every piece. Don't repeat them in prose, panel notes, or footnotes beyond one artboard credit line.
- **Findings are computed, not typed from memory.** Copy the sentence `pnpm daily check` reports into the paragraph that needs it; the check matches the sentence anywhere in the prose.
- **Notebooks** have three to six charts. End with `## Takeaway` and `## Limits`. Add a records table only when the argument turns on specific rows, titled for those rows.
- **Compositions** are designed graphics, not a default chart in a frame. Use the mark the question needs; the [composition mode](composition-mode.md) table lists them with reference examples. The design note says what a default chart would show and what this design gives up.
- **Dashboards** link six or so views of one query. The guide lists two or three selections to try and what each should change. Don't spend a panel on instructions.

## Syntax traps

- **Name a field with spaces by quoting the whole reference:** `rate:num="industries.Unemployment rate"`. In `exploreda.eda`, quote the field id: `field "Unemployment rate" number`; the id must match the CSV header.
- **Keys inside a chart's `{ }` block take source fields, not aliases.** `levels=country.region,country.name` on a hierarchy and `facet.rowVariable=prices.Company` on a facet work; the alias names do not.
- **A line with one series per category needs `time.splitField=`** with `time.interval`, `time.aggregation`, and `time.measureField`; `color=` alone joins every row into one zigzag.
- **Facets need `facet.enabled=true facet.type=wrap facet.rowVariable=<field>`.**
- **Calculations have no string concatenation.** Build labels with a ternary chain: `calc label = hour == 5 ? "05:00" : hour == 6 ? "06:00" : …`. Guard blanks with `x == null ? … :`.
- **A numeric field cannot be a category,** so give a calc label to anything you color or group by.
- **Filter a whole notebook in the project**, with a query `filter` step, rather than per chart: `filter @in-2023 years.year = 2023`.
- **Band annotations take a range:** `band x=2007-12-01..2009-06-30 "Recession"`.
- **Histogram bins span all the data**, not the axis limits; raise `bins=` to keep bars narrow inside a clipped axis. ECDF charts ignore `x.min` and `x.max`.
- **Every chart compiles with no warnings.** The corpus test fails on any diagnostic, so a skipped chart or ignored setting never ships silently.

## Composition traps

- **A unit's frame starts after its label column.** With `label width=210`, a unit at `x=32` with `size=900x…` ends at 1142; on a 1010-wide artboard the right side is clipped without an error. Keep `x + label width + frame width` inside the artboard.
- **A repeat draws 24 repeats unless told otherwise.** Set `limit=` when there are more, or the last ones vanish silently.
- **A scale spans the field it names.** A span or band whose end field runs past the start field's extent needs `min=` and `max=` on the scale.
- **Find working syntax in the demo.** Every mark has a reference example (see [composition mode](composition-mode.md#marks)); open it at `/?example=<id>` and use the workspace's dashboard text view (`{ }` in the toolbar) to copy its text.
- **Size the panel to the artboard:** a grid row is 76 px, so `at=0,0,12,<rows>` needs `rows × 76 ≥ height`.

## Series and deep dives

Breadth first: the collection should span many industries, kinds of question, and chart forms. Once a dataset has earned it, a series goes deep: three to six pieces that build on each other, each standing alone. Give each entry `"series": { "id": "flights-january", "title": "A month of New York flights", "part": 1, "label": "The delay tail" }`. The page shows the parts as tabs, named by `label` in two or three words, and the open part is the current page.

A single piece whose question has two or three faces can be one notebook with **sheets** instead of a series: each `#` heading after the lede starts a sheet, shown as a tab. Use sheets when the faces share one query and a reader would switch between them (the whole span, the storm week, the clock); use a series when each part stands alone or needs its own data. A sheet is a short notebook of its own: two to four sections, each a claim with its chart. The Takeaway and Limits go at the end of the last sheet, and every sheet's last section says what that sheet showed. Name sheets in two to four words.
