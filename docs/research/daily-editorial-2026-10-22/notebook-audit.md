# Daily notebook audit, 2026-10-22

Every notebook in the collection, read as a visitor would, against the [editorial standard](../../daily-editorial.md). Each entry says what holds the piece back and what the rewrite should do. The rewrite batches at the end split the work so one session owns a family.

## What the collection does well

The best pieces already read like a data blog: `flights-delay-tail`, `flights-by-hour`, `flights-weather`, `beijing-calendar`, `beijing-pollutants`, `ercot-signed-error`, `titanic-class-and-sex`, `elections-polarization`, `measles-vaccine`, `unemployment-recession`, `penguins-species`, `worldbank-income-groups`, `worldbank-wealth-and-health`, `earthquakes-year-of-quakes`, `bigtech-growth`. They name events (Winter Storm Uri, the December red alert, the Türkiye shock), annotate the moment, and put the number inside the sentence. They are the house style; the rest of the collection should rise to them.

## What holds the rest back

About 38 of the 54 notebooks share one skeleton: a numbered heading, a paragraph of methodological warnings ("Do not treat…", "This is not evidence that…"), a default scatter → box plot → ECDF → histogram sequence, a boilerplate "rows behind the charts" table, and two `**Finding.**` lines dropped between paragraphs. The prose describes what a chart _is_ rather than what it _shows_; the headings repeat the chart titles; the takeaways are generic advice about methods rather than answers about the data. Nothing is annotated. Few pieces compare two populations with the difference stated.

The fix is the same for all of them: find the one thing the data says, lead with it, choose each chart for a claim, annotate the moment, state the comparison as a number, and move every caveat to Limits.

## Piece by piece

### Batch A: physical world

**co2-trend-and-coverage** (Climate, Data quality). Five decades of weekly Mauna Loa CO₂ with the gaps kept. Today: a line, a two-bar coverage count, decade boxes, decade ECDFs, table. Rewrite as "CO₂ rose 90 ppm in 50 years, and you can see every missing week": the line with a `band` over the longest gap and a `callout` on the first week above 350 and 400 ppm (findings: first date ≥ 350, ≥ 400 via `min` of date where co2 ≥ threshold, if the finding ops allow; otherwise the decade means). Replace the coverage bar with a `calendar` or a `heatmap year × month` of measured weeks so the gaps are visible in time. Keep one decade comparison (1960s mean vs 2000s mean as a ratio sentence). Drop the ECDF and the table.

**co2-seasonal-centering** (Climate, Seasonality). Today's charts are a scatter of annual mean vs raw (meaningless), a residual line, month boxes, a month × decade heatmap. Rewrite as "CO₂ breathes: May is 2.8 ppm above its year, September 2.8 below". Lead with the month box plot (residual by month) with `rule y=0`; then the heatmap month × decade to show the amplitude is stable (or growing: compute 1960s vs 2000s May minus September gap as findings); then one zoomed line of two years (`where.year=1990..1991`) to show a single cycle. Cut the scatter and table.

**co2-missing-runs** (Climate, Data quality). Interesting subject, dull treatment. Rewrite as "59 missing weeks, most of them in a few long outages": a `scatter x=year y=length` with `callout pick=max` naming the 18-week run and its dates (finding: max length; date of it as prose), a `hist` of run lengths with a `rule` at the median, and the before/after scatter kept but annotated with the identity line idea in prose (CO₂ after a gap is almost always higher). Findings: share of runs of 1 week, share of missing weeks that belong to runs ≥ 4 weeks (`ratio_sums` or two sums). Drop ECDF and table.

**elnino-season-and-anomaly** (Climate, Seasonality). Good idea, textbook execution. Rewrite as "Niño 1+2 swings 6 °C every year; the anomaly is what's left": raw line with the calendar box plot beside it, then the anomaly line with `rule y=0` and `callout pick=max` on the 1982–83 or 1997–98 peak (finding: max anomaly and its date in prose), then a `heatmap year × month` of anomaly (years as rows, `maxCategories` high) so the big events read as warm rows. Comparison finding: February mean vs September mean (already there) as one sentence with the gap.

**elnino-annual-range** (Climate, Distribution). Rewrite around "the range barely moves even when the mean jumps": line low/mean/high with explicit `y.title`, scatter mean vs range with `regression=linear` and a `callout` on 1983 and 1997, and the months-observed check demoted to Limits (it is almost always 12). Findings: correlation of mean and range, mean range, the widest year. Drop the histogram and table.

**elnino-two-warm-windows** (Climate, Comparison). The comparison is the point; make it visible: a `line x=episode_month y=anomaly color=episode` (needs `time.*`? episode_month is numeric, so `scatter` with `connect` or a line keyed by numeric x; use whatever draws two paths) with `callout pick=max` per episode, a `boxplot` of the two windows, and the raw-Celsius panel kept small. Findings: peak month and value of each window, months above 2 °C in each (share). State which was bigger and which lasted longer in the takeaway.

**sunspots-cycles** (Space science, Trend). Rewrite as "Eleven-year cycles, but no two peaks alike": the line with `callout pick=max` (1957) and a `rule y=median`, then a per-era boxplot where era is a `calc` of half-centuries (already a field), then an `ecdf` with `rule x=` at the median is optional. Findings: max, median, share of years under 20. Add the Maunder Minimum context only if the series starts early enough (check the years). Drop the table.

**sunspots-smoothing-cost** (Space science, Trend). Rewrite as "An eleven-year average flattens peaks by up to 100": the two-series line with explicit `y.title`, the departure line with `rule y=0` and `callout pick=max`/`pick=min`, and a `hist` of departures. Cut the scatter-of-a-value-against-its-own-mean and the table. Findings: largest positive and negative departure (present), mean absolute departure if `mean` of an absolute field exists (else skip).

**nile-tail-sensitivity** (Water, Distribution). Rewrite as "The wettest and driest tenth of years move the Nile average by 4 ×10⁸ m³": a `line` of annual flow with `rule y=mean` and `band` on the two tails? (bands are axis ranges; use `rule y=` at the two tail cutoffs with labels), a `hist` with the same rules, and the boxplot by tail group. Findings: overall mean, trimmed mean (present), difference stated in prose by subtraction only if both are findings. Drop ECDF and table.

**nile-before-and-after** (Water, Comparison). Already close. Make the comparison the lead: line with `rule x=1898 "Aswan Low Dam begins"` (check: the 1898 break is conventionally tied to changed rainfall and the start of Aswan construction; say "the usual break point" if unsure), two-era boxplot, two ECDFs. Findings present; add share of post-1898 years below the pre-1898 median. Drop the row count chart (say the counts in prose) and the table.

**beijing-calendar** (Environment, Seasonality). Already strong. Polish: add `callout` on the December 16–21 red alert in the calendar if callouts attach to dates there; otherwise add a `line` of the citywide daily mean for December with a `band` over the alert. Keep the rest.

**beijing-pollutants** (Environment, Relationship). Strong. Add `regression=linear` to the CO scatter, state both correlations in one comparison sentence, and consider a `heatmap season × pollutant`-style view only if it adds. Keep.

**earthquakes-year-of-quakes** (Geoscience, Geography). Strong. Add a `hist mag` with `rule x=6` beside the ECDF or replace the ECDF with it, and a `callout` on February 6 in the calendar if supported; otherwise a `line` of daily counts with `callout pick=max`. Keep the map as the lead.

**measles-vaccine** (Public health, Trend). Strong but short. Add a `heatmap state × year` (51 rows, 85 columns, `maxCategories`/`maxColumns` raised) with `rule`-like context in prose, because the WSJ grid is the famous view; and a `line` of the median state rate by year with `rule x=1963`. Findings present; add the 1980s mean.

### Batch B: economies and firms

**macro-level-versus-growth** (Economics, Trend). Rewrite as "GDP tripled; the growth rate crossed zero eleven times" (count the negative quarters as a finding: `count` where gdp_growth < 0). Charts: level line with `band`s over NBER recessions you can name confidently (1973–75, 1980, 1981–82, 1990–91, 2001, 2007–09), growth line with `rule y=0` and `callout pick=min` (1958 or 1980 Q2; let the data say), a `hist` of growth with `rule x=0`. Cut the GDP-change vs unemployment scatter (belongs to the quarter dashboard) and the table.

**macro-inflation-unemployment** (Economics, Relationship). The Phillips-curve-by-decade story is good; tell it. Lead with the pooled scatter colored by decade (`regression=linear` per color if supported; else pooled), then `facet.enabled=true facet.rowVariable=decade` small multiples of the same scatter, then the inflation line with `band` over 1973–1982. Findings: pooled correlation, 1970s correlation (present), 1960s correlation. State the sign flip plainly.

**danish-logs-and-indices** (Finance, Trend). Rewrite as "Real money and real income rose together for 13 years, then the quarterly link is faint": indexed lines with explicit `y.title="Index (1974 Q1 = 100)"`, the levels scatter with `regression=linear`, the changes scatter with `regression=linear` and the correlation in the sentence. Cut the histogram and the table. Findings present; add the end-of-sample index values.

**danish-rate-spread** (Finance, Comparison). Rewrite as "Danish bonds paid 2.5 to 10.5 points more than deposits": fix the y titles (express rates as percent: add a `calc` multiplying by 100 and label "%"), the two-line chart, the spread line with `rule y=0` and `callout pick=max` and `pick=min`, and the era boxplot. Cut the bond-vs-spread scatter and the table.

**longley-different-denominators** (Government statistics, Data quality). Hard subject to make vivid. Rewrite as "Unemployment rose 2.6-fold while employment rose a third": one chart with the three count series as indices (1947 = 100) via `calc`s, the raw unemployed line with `callout pick=max` (1958 recession, 1961), the scatter employment vs unemployed colored by era kept. Findings: min and max unemployed (present), employment 1947 and 1962 (min/max of employment). Cut the armed-forces-alone line and the population scatter and the table.

**longley-trending-levels** (Government statistics, Trend). Nearly a duplicate of the above in spirit. Make it about the trap: "Anything that rises correlates with anything else that rises": the indexed lines (fix the y title), the levels scatter with `regression=linear` and r = 0.98 in the sentence, the changes scatter with its r = 0.89, and a sentence on why the second is the honest test. Cut the histogram and table.

**grunfeld-within-firm** (Corporate finance, Relationship). Good title. Charts: levels scatter colored by firm with `regression=linear`, changes scatter with `regression=linear`, then `facet` small multiples of the levels scatter per firm (11 panels) which shows the within-firm slopes. Cut the boxplot, ECDF, and table. Findings present.

**grunfeld-indexing-firms** (Corporate finance, Ranking). Rewrite as "Index each firm to 100 and the smallest firm grew fastest": raw investment as a `line x=year color=firm` (not scatter), indexed `line` with `callout pick=max`, and a `row` of each firm's final index (needs a calc or a `group`; if not possible, a `boxplot` by firm of the index). Cut the scatter of two indices and the table.

**grunfeld-investment-concentration** (Corporate finance, Part-to-whole). Rewrite as "One firm made 41% of the panel's investment; three made 76%": lead with a `row firm` sorted by total investment (or a `hierarchy` treemap of invest_total by firm), then mean value vs mean investment scatter with `callout` on General Motors, then a `bar` of years per firm only if unequal (it is probably 20 each; if so, say it in a sentence and skip the chart). Cut the histogram, ECDF, and table.

**engel-food-and-income** (Household spending, Relationship). Engel's law deserves a confident telling: scatter income vs food spending with `regression=linear` and `callout` on the richest household, scatter income vs share with `regression=linear`, boxplot of share by income quartile with the quartile medians as findings (`median` where band = each). Cut the ECDF and the table.

**engel-weighting** (Household spending, Part-to-whole). Four rows of data cannot carry five charts. Rewrite as one argument with two charts: a `bar income_band` with the two shares as series (mean share vs weighted share; may need `line x=order y=mean_share,weighted_share` if bar can't take two measures) and a `table` of the four rows as the second chart, because here the rows _are_ the argument. Findings present.

**strikes-duration-tail** (Labor, Distribution). Rewrite as "The average strike lasted 43 days; the typical one, 27": a `hist` with `rule x=mean` and `rule x=median` labeled, the ECDF with `rule x=60 "Two months"` and the share past two months as a finding, and a `scatter x=sequence y=duration` kept only if the longest strike has a story (else cut). Cut the log histogram (say it in a sentence) and the table.

**strikes-production-context** (Labor, Relationship). Rewrite as "Strikes ran 13 days longer when production was below trend": scatter iprod vs duration with `regression=linear` and `rule x=0`, boxplot by production band, and the two medians in one sentence. Cut ECDF, row count, and table (counts in prose).

**bigtech-growth** (Finance, Trend). Strong. Add an indexed view (`calc` is per row, so an index needs the project; if the project has no first-price field, skip) or replace the box plot with a `line` of the 2022 drawdown window (`where.date=2021-11-01..2022-12-31`) with `facet`. Keep the rest.

### Batch C: people, places, and games

**fertility-trajectories** (Demography, Trend). Rewrite as "Twelve countries, twelve routes from six children to two": `line x=year y=fertility color=country` (not a scatter), a `heatmap country × decade` of the mean kept, a `callout` on the steepest decade (South Korea or Iran, whichever the data has), and the 1960 vs 2011 means as a comparison sentence. Cut the box plot, the row count, and the table.

**fertility-matched-endpoints** (Demography, Comparison). Rewrite as "The same twelve countries, 1960 against 2011: every one fell, by one to five children": a `row country` of change sorted, a `scatter start vs end` with a `rule`-style identity hint in prose and `callout pick=min` on the largest decline, and the mean change as a finding. Cut the histogram, ECDF, and table.

**fertility-pace-by-decade** (Demography, Trend). Rewrite as "The 1970s were the decade fertility fell fastest": the `heatmap country × decade` of annual change as the lead, a `boxplot annual_change color=decade` with `rule y=0`, and the 1960s vs 2000s pace sentence. Cut the start-vs-change scatter, the years-published check (Limits), and the table.

**fertility-empty-end-years** (Demography, Data quality). Keep the point, lose the lecture: the `line` (not scatter) of twelve countries that stops in 2011, then the coverage `heatmap country × year` without `showValues`, then one `metric`-style or `bar year_label` of published counts for the last five years. Findings present. Cut the row chart and the table.

**worldbank-income-groups** (Global development, Part-to-whole). Strong. Add a `row region` of population to pair with the economy count pivot, so "most people" and "most countries" are both charts. Keep.

**worldbank-wealth-and-health** (Global development, Relationship). Strong. Add `regression=linear` on the scatter, restrict the lead scatter to 2023 (`where.year=2023`) with a second all-years version only if it adds, and a `callout` on the richest and the longest-lived economies. Keep.

**football-group-goals** (Sports, Distribution). Rewrite as "Two in three World Cup group matches were decided by a goal or less": `hist margin` (not total) as the lead with the 68.75% share in the sentence, `hist total_goals` second, a `heatmap goals1 × goals2`-style scoreline grid via `pivot rows=goals1 columns=goals2 count` or `heatmap` with `showValues=true` (the scoreline table is the fun chart), and a `boxplot total by group` kept only if a group stands out (Group G or B). Cut the row chart and the table.

**football-draws-and-points** (Sports, Part-to-whole). Overlaps the above. Make it the points story: "Nine draws cost the group stage nine points": a `heatmap group × result` with values kept, a `bar group_field` stacked by result, and the arithmetic sentence (48 matches × 3 = 144 possible, 135 awarded: compute as findings if the fields allow, else state in prose from the draw count finding). Cut the boxplot, scatter, and table.

**football-points-and-goals** (Sports, Relationship). Rewrite around "Goal difference predicts points almost perfectly, except for the teams that drew": scatter goal_difference vs points with `regression=linear` and `callout` on the outliers (a team with +2 and 4 points, say), scatter goals_for vs goals_against with `callout` on Belgium and on the team that conceded most, and a `row team` of points sorted. Cut the histogram, boxplot, and table.

**titanic-class-and-sex** (History, Comparison). Strong. Add the class-only survival shares as findings (first, second, third) so the deck can say "a third-class woman outlived a first-class man" with numbers, and consider a `heatmap class × sex` of survival share with `showValues=true` in place of the pivot if it reads better. Keep.

**elections-polarization** (Politics, Distribution). Strong. Add a `heatmap state × year` of margin (51 × 11, the elections composition's view) as a third chart, and a `callout` on 2000 Florida or 2016 Michigan in the scatter. Keep.

**unemployment-recession** (Labor, Comparison). Strong. Add a third chart: `bar industry` of the peak rate minus the 2006 rate (needs a calc of two fields the query may not have; if not, a `row industry` of mean rate in 2009 sorted) to rank who was hit hardest. Keep.

**tate-metadata-not-lifespans** (Arts and culture, Data quality). A data-quality curiosity; make it a story about one row: "In the Tate's catalogue, the Alken family lived 138 years": a `scatter birth_year vs date_span` with `callout pick=max` naming the family, a `hist date_span` with `rule x=100`, and a `table` sorted by span descending, because the rows are the point. Cut the birth-year histogram and the death-status row chart (say 31.67% in a sentence).

### Batch D: operations and the lab bench

**flights-delay-tail**, **flights-by-hour**, **flights-weather** (Transportation). Already the house style. Light touches: in `delay-tail`, add `rule x=median` and `rule x=mean` to the histogram so the twelve-minute gap is drawn; in `by-hour`, add a `callout` on the 19:00 cell or a `line` of mean delay by hour with `callout pick=max`; in `weather`, add a `rule x=5 "Five miles"` on the visibility scatter. Keep everything else.

**ercot-signed-error** (Energy, Error and uncertainty). Already strong. Add a `band x=2021-02-14..2021-02-20 "Winter Storm Uri"` to both lines, and drop the table or title it "The storm week, hour by hour" with `where.date=2021-02-14..2021-02-20`.

**ercot-relative-error** (Energy, Error and uncertainty). Rewrite as "Half of ERCOT's hours missed by under 2.3%; the storm week missed by 20%": lead with the `ecdf abs_pct_error` with `rule x=2.26 "Median"` and `rule x=10`, then the scatter forecast vs absolute percent error colored by a `calc` storm-week flag (date range), then the month boxplot. Findings: median (present), 90th percentile (present), storm-week mean percent error (`mean` where date in range). Cut the first scatter and the table.

**ercot-clock-coverage** (Energy, Data quality). Rewrite as "The forecast misses most at 6 and 7 in the morning, UTC": the signed-error heatmap kept (values off), the absolute-error heatmap kept, then a `scatter hours vs abs_error` with `callout` on the 1-hour cells so the coverage point lands. Cut the boxplot and the table. Findings present; add the worst clock hour's mean absolute error.

**wine-cultivar-chemistry** (Food and drink, Comparison). Rewrite as "Flavanoids alone sort three cultivars almost perfectly": scatter flavanoids vs color intensity colored by cultivar (the famous separation), boxplot flavanoids by cultivar with the three means as findings, and a `parallel` of five assays colored by cultivar in place of the second scatter and the ECDF. Cut the table.

**wine-profile-scales** (Food and drink, Comparison). Rewrite as "Proline reads in the thousands and hue under two, so the parallel plot gives each assay its own ruler": lead with `parallel`, then one `summary` to show the scales as numbers, then `boxplot proline color=cultivar` as the one assay that separates cultivar 1. Cut the second boxplot, the scatter, and the table.

**iris-pooled-versus-grouped** (Biology, Relationship). Simpson's paradox in flowers: pooled scatter with `regression=linear`, grouped scatter with `regression=linear` per species, the two correlations in one sentence (pooled −0.12, setosa +0.74, present). Cut the boxplot, ECDF, and table; add a third chart only if it adds (a `facet` by species of the same scatter is the clearest).

**iris-measurement-choice** (Biology, Comparison). Rewrite as "Petal length tells the three irises apart; sepal width cannot": two scatters kept, `boxplot petal_length color=species` kept, `parallel` kept but ordered petals first. Cut the table. Findings present; add overlap in prose (setosa max petal length vs versicolor min).

**stackloss-operating-conditions** (Manufacturing, Relationship). Rewrite as "Airflow explains most of the ammonia lost up the stack": scatter airflow vs loss with `regression=linear` and r in the sentence, scatter water temperature vs loss with `regression=linear` and its r, and a `parallel` of the three settings and the loss colored by air band. Cut the acid scatter (say its r), the boxplot, and the table.

**stackloss-leave-one-out** (Manufacturing, Error and uncertainty). Rewrite as "Drop one day and the airflow slope moves from 0.95 to 1.10": the fit scatter with `callout` on day 21 (the known influential point), the leave-one-out slope scatter with `rule y=` at the full-sample slope and `callout pick=max` and `pick=min`, and the residual vs shift scatter kept. Cut the residual-vs-fitted plot and the table.

**penguins-species** (Ecology, Comparison). Strong. Add `regression=linear` to the flipper scatter and a `callout` on the heaviest bird; otherwise keep.

## Rewrite batches

| Batch | Families                                                               | Notebooks |
| ----- | ---------------------------------------------------------------------- | --------- |
| A     | co2, elnino, sunspots, nile, beijing, earthquakes, measles             | 14        |
| B     | macro, danish, longley, grunfeld, engel, strikes, bigtech              | 14        |
| C     | fertility, worldbank, football, titanic, elections, unemployment, tate | 13        |
| D     | flights, ercot, wine, iris, stackloss, penguins                        | 13        |

Compositions and dashboards are out of scope for this pass. The dashboards' guides and the compositions' design notes already follow a different, shorter form.
