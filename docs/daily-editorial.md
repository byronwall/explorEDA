# Daily editorial standard

The daily collection is a data analysis blog, not a tour of chart types. A reader should leave each piece knowing one thing about the world they did not know before, and able to say why the charts convinced them. This page is the bar every notebook is held to. [Daily data viz](daily-viz.md) has the workflow and the syntax; this page has the judgment.

The reader to write for likes the Financial Times data desk, Our World in Data, and The Pudding: curious, numerate, impatient with hedging, and allergic to being told what a chart is instead of what it shows.

## The shape of a piece

1. **Title: the finding.** Say what the data showed, with the number when the number is the point. "Construction's unemployment rate hit 27% in the recession", not "Unemployment by industry". Vary the form across the collection.
2. **Deck (the catalogue `summary`): the answer in two sentences.** It is the first thing under the title and the text on the archive card. Lead with the result, then the twist.
3. **Lede: two to four sentences.** The question in bold, why anyone would ask it, the unit of analysis in plain words ("each row is one hour of the Texas grid"), and where the piece is going. A reader who stops here should know the answer's shape.
4. **Three to six sections.** Each heading is a claim in plain English. Each paragraph says what to look at in the chart under it and gives the number that proves the claim. Each chart is the form that claim needs, and shows something the previous chart could not.
5. **At least one comparison.** Two populations side by side, with their difference stated as a number: before and after, this group against that one, pooled against within, this year against a typical one, the headline figure against the median. The comparison is usually where the piece's point lives.
6. **An annotated moment.** At least one chart carries a `rule`, `band`, `callout`, or `region` that names the thing the paragraph is about: the storm, the threshold, the record, the event.
7. **Takeaway.** The answer in one sentence, then what it changes about how a reader should hear the headline number. Two or three sentences; specific to this data.
8. **Limits.** Two or three sentences naming what this data cannot say: grain, coverage, sample, vintage, a denominator that is missing. Once, here, not scattered through the piece.

## The page it lands on

From 960 px wide, a daily notebook sets each `##` section's text in a 300 px column beside its charts, and that text stays in view while the charts scroll. Write for that column:

- A section's text is its heading, two to four sentences, and the finding inside them: about 40 to 90 words. Longer text scrolls away from its chart.
- Headings are short enough to wrap once at 300 px: eight words or fewer.
- The lede sits before the first heading and spans the page. Takeaway and Limits share one row at the end, so each is two or three sentences.
- A chart titled with the same words as its heading hides that title; giving the title the population and unit instead keeps both useful.
- Below 960 px, and in an editable notebook, the same text reads as one column, so each paragraph must also make sense directly above its chart.

## Prose

- **Observations, not instructions.** Write what the data shows: "December's median is twice October's." Never tell the reader what they must not conclude: "Do not treat the cells as equally supported." A caveat that matters goes in Limits, once.
- **Numbers come from findings, woven into sentences.** Declare each number as a finding in `catalog.json` and write its computed sentence inside the paragraph that needs it. The `**Finding.**` prefix is retired. A piece has four to eight findings; at least one pair makes a comparison (two numbers from two populations, or a ratio).
- **Name things.** The firm, the state, the storm, the red alert, the ruling. Well-known world context is welcome when it is verifiable and short; never invent a fact to make a sentence land.
- **One voice: direct, concrete, confident.** Short sentences. No "it should be noted", no "arguably", no "may potentially". No numbered headings and no "1." prefixes.
- **Headings and chart titles do different jobs.** The heading states what to see ("Newark carried the longest tail"); the chart title says what is drawn, with population and unit ("Departure delay by airport, January 2013"). They are never the same words.
- **No boilerplate sections.** The "rows behind the charts" table is gone unless the argument turns on specific rows, in which case the table is titled for those rows, sorted to show them first, and introduced by a sentence that says which rows to look at.

## Charts

- **No default sequence.** A scatter, a box plot, an ECDF, and a histogram in that order is a template, not an analysis. Choose each form for its claim:

  | The claim is about                | Use                                                                                                               |
  | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
  | When something happened           | `line` with a `band` or `rule` at the event; `calendar` for days                                                  |
  | How two groups differ             | `boxplot color=`, or two `hist`s via `facet`, or an `ecdf color=` when the tails matter                           |
  | How often a threshold is crossed  | `ecdf` with a `rule` at the threshold, and the share as a finding                                                 |
  | A relationship                    | `scatter` with `regression=linear` where a fit is honest, `color=` for the confounder, a `callout` on the outlier |
  | Every X at once                   | `facet.enabled=true facet.type=wrap` small multiples                                                              |
  | Two categoricals                  | `heatmap` (with `showValues=true` only when exact cells matter) or `pivot`                                        |
  | Parts of a whole                  | `hierarchy` treemap, `sankey`, or a stacked `bar seriesField=`                                                    |
  | One number that carries the piece | `metric` beside the chart it summarizes                                                                           |
  | Many measures per record          | `parallel` or `summary`, once                                                                                     |

- **Annotate the point.** Reference lines at zero, at the limit, at the year the rule changed. Bands over the recession, the storm week, the sale. Callouts on the record value (`callout "…" pick=max`) or the named event. An unannotated chart is a chart the paragraph has to explain in words.
- **Cut empty tails on purpose.** When one extreme stretches an axis, set `x.min`/`x.max` or `y.min`/`y.max` and say in the paragraph what sits outside.
- **Axis titles carry units.** Set `y.title=` on every multi-series `line`; the automatic "A / B" title is never acceptable.
- **Color means something.** Use `color=` when the legend answers a question the paragraph asks. A single-series chart has no color field.
- **Legends and value labels earn their space.** `showValues=true` on a heatmap of 0/1 flags is noise; on a 4×3 count grid it is the point.
- **Time series are lines.** A scatter of year against value is a line that lost its order, unless the gaps are the subject.
- **Calculations belong in the project or the notebook, not in the reader's head.** A `calc` for an era, a season, a share, or a label makes a chart group by what the paragraph says.

## Sheets

A notebook with two or more `#` headings after its lede is a book: each heading is a sheet, shown as a tab, read one at a time. Reach for it when a question has two or three faces that each need their own charts and share one query: the whole span, the storm week, the clock hour. Each sheet reads as a short notebook with two to four sections and its own closing claim; Takeaway and Limits sit at the end of the last sheet. Name sheets in two to four words, and order them so the first answers the headline question.

## Before `pnpm daily check`

- The title, deck, and first heading each say something a reader could repeat at dinner.
- Every heading is a claim; every paragraph has a number; every chart differs in form or population from the one before it.
- One comparison, one annotation, no numbered headings, no "**Finding.**" labels, no boilerplate table.
- `summary` and `question` in `catalog.json` are rewritten with the piece; `pnpm daily thumbs <slug>` is rerun when the lead chart changed.
- Read it once at 1280 px and once at 390 px as a stranger would.
