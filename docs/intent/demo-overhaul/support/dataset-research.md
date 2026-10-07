> Imported from the Find Sample Datasets chat on 2026-10-06, Indianapolis time.
> This is the original research response converted from rendered HTML to Markdown.
> Its recommendations, evidence limits, and earlier repository baseline remain as reported.
> Read [capture details](README.md#capture-details) before using its claims.

# Four public dataset additions for explorEDA

## 1. Recommendation

**Add nycflights13 first, followed by Beijing Multi-Site Air Quality, a small World Development Indicators panel, and a frozen USGS earthquake catalogue extract.** Together, they add real journeys, repeated measurements, country-year comparisons, and geographic events—not merely another numeric classification dataset.

This report follows the attached research brief and its distinction between current chart capabilities, proposed explicit lookups, and future notebook reporting. All analysis designs below are **proposed**; no analytical findings have been invented.

| Rank | Dataset family | Recommended initial population | Principal contribution | Related-table value | Readiness |
| --- | --- | --- | --- | --- | --- |
| **1** | **nycflights13**, excluding airport metadata from the initial bundle | All flight records for January 2013; retain airline, aircraft, and weather lookups | Genuine departure-to-arrival stages, dense delay relationships, calendar patterns, and missing lookup matches | Excellent: carrier, aircraft, and airport-hour weather enrichment | **Preparation needed** |
| **2** | **Beijing Multi-Site Air Quality** | All 12 stations throughout 2016, prepared at station-day grain | Seasonality, measurement coverage, smoothed density, grouped fits, and multipollutant profiles | Moderate: reference-station daily lookups; original station files are a union, not related dimensions | **Preparation needed** |
| **3** | **World Development Indicators: four indicators plus country metadata** | Country-year population records, 2000–2023, excluding aggregate economies | Bubble comparisons, longitudinal observations, weighted rates, endpoint comparisons, and real region maps | Excellent: country metadata and indicator-specific country-year lookups | **Preparation needed** |
| **4** | **USGS ComCat earthquakes** | A frozen global 2023 extract using `eventtype=earthquake` and `minmagnitude=4.5` | Real point geography, event timing, thresholded distributions, and metadata completeness | Limited initially; event-detail enrichment is a later, carefully bounded extension | **Preparation needed** |

The publishers document public access and reuse terms for these selections. The flight package is published under CC0; Beijing and the four selected World Bank indicators explicitly carry CC BY 4.0 terms; USGS identifies its authored or produced data as U.S. public-domain material. Important qualifications—including the excluded flight airport table—appear below. [CRAN+6](https://cran.r-project.org/package%3Dnycflights13)

**Evidence limitation:** publisher pages, documentation, repository source, selected actual CSV records, and part of the Natural Earth GeoJSON were inspected. Bulk downloads and dynamic API responses could not be retrieved successfully in this environment. Therefore, published counts are identified as such, proposed subsets have not been recounted, and none of these recommendations is presented as a shipping-ready data bundle.

### Repository baseline and implications

The inspected `main` revision is:

`8c35e4db02d9e0efc0842644d4a669e58d10caf8`

It is **the same revision named in the briefing**, so there is no revision delta to explain. Inspection was remote and read-only; no local working-tree cleanliness or runtime validation is claimed.

The catalogue review covered the real-data examples and the chart-specific fixtures. Besides Penguins and Wine, it includes **NBA player-season statistics**, distribution discovery, synthetic shop operations, product activity, calendar and categorical fixtures, point and region maps, regression and density examples, calculated orders, and Lorenz-system data. The selections above deliberately add new analytical populations and provenance problems rather than duplicate those fixtures.

### Chart-feasibility contract used throughout this report

The following constraints govern every proposed analysis.

| Reference | Source-grounded capability and constraint |
| --- | --- |
| **R1 — Scatter** | `ScatterPlot/definition.ts::ScatterPlotSettings` supports points, rectangular density, hexbin, contour, bubble sizing, linear/polynomial/LOESS fits, paired summaries, and marginals. `fitPlan.ts::planScatterFits` fits categorical color groups within facets. Numeric color does not create separate fits. Fits use finite pairs and respond to **other charts’ filters**, not their own brush. |
| **R2 — Density and summaries** | `hexPlan.ts::planHexbins` colors by **row count**, not arbitrary measures, and retains source IDs. `contourPlan.ts::planContours` estimates smoothed density; its levels are not automatically probability-percentile contours. `pairedSummary.ts::pairedStats` computes paired statistics, not a general correlation matrix. `marginalPlan.ts::planMarginals` summarizes plotted pairs using fixed full-source-domain bin edges. |
| **R3 — Time, categories, and flows** | `LineChart/definition.ts::TimeSeriesSettings` supports calendar intervals, aggregation, splitting, and gap/zero handling. `Heatmap/definition.ts::HeatmapSettings` requires categorical row/column fields and a count or measure aggregation. `Sankey/definition.ts::SankeySettings` accepts ordered stage fields and count or nonnegative sum—not averages. Stacked bars and areas should likewise use counts or sums, not stacked averages. |
| **R4 — Maps and distributions** | `Map/definition.ts::MapSettings` distinguishes point and region modes; region mode requires supplied geometry and matching keys and supports count, sum, or average. The registered catalogue also includes ECDFs, box/violin views, observations, and parallel coordinates. Parallel-coordinate lines represent complete rows across their selected axes. Observation overlays can be bounded even when summary statistics use all eligible rows. |
| **R5 — State, notes, and future work** | `SavedDataStructure.ts` stores chart/workspace settings; `SavedAnalysisStructure` can bundle the current single dataset and settings. `Markdown/Markdown.tsx::Markdown` provides editable Tiptap content saved as HTML. These are not executable notebook cells or immutable result snapshots. Explicit lookups and one-base-table-per-view behavior remain provisional in the multi-source shape brief. |

The older analytical coverage document contains material that predates recent scatter work. For regression, hexbin, contours, marginals, and paired summaries, the inspected implementation takes precedence over older “future” descriptions.

**Shared implementation convention.** Prepare one flat base table per family today. Each analysis is a compact workspace configuration that the host can restore independently—not five simultaneous dashboards and not an assumed native notebook-tab feature. Use Alt-click/Alt-Enter tracing where supported. A source-row search is an inspection operation, not a substitute for a linked chart filter. All key construction, lookups, temporal normalization, completeness flags, and derived values specified below are **offline preparation** unless explicitly identified as native chart aggregation.

---

## 2. Dataset 1 — nycflights13: journeys, delays, and enrichment

### Sources, access, and reuse

**Publisher and provenance.** Hadley Wickham’s nycflights13 package curates flight/carrier data from the Bureau of Transportation Statistics, aircraft information from the FAA, and weather from the Iowa Environmental Mesonet. The published package version is **1.0.2**, released April 12, 2021; its flight population covers 2013. The publisher reports **336,776 flight records**. [NYC Flights 2013+2](https://nycflights13.tidyverse.org/)

**Source and download links:** [package page](https://cran.r-project.org/package=nycflights13), [version 1.0.2 source archive](https://cran.r-project.org/src/contrib/nycflights13_1.0.2.tar.gz), and dictionaries for [flights](https://nycflights13.tidyverse.org/reference/flights.html?utm_source=chatgpt.com), [airlines](https://nycflights13.tidyverse.org/reference/airlines.html?utm_source=chatgpt.com), [planes](https://nycflights13.tidyverse.org/reference/planes.html?utm_source=chatgpt.com), and [weather](https://nycflights13.tidyverse.org/reference/weather.html?utm_source=chatgpt.com).

The package archive is not a ready-made CSV bundle: export the four selected tables from **the same pinned package version**. Do not combine version 1.0.2 flights with changing `main` lookup files.

**Reuse decision.** The package is CC0. Nevertheless, its `airports` documentation identifies OpenFlights as the source, and OpenFlights publishes separate database terms. **Exclude `airports` from the first redistributed example** rather than treating the package-level declaration as resolving that upstream question. The five analyses below do not need airport coordinates. Credit the curator and underlying providers even where CC0 does not require attribution. [CRAN+2](https://cran.r-project.org/package%3Dnycflights13)

**Inspection and size.** The complete 16-row `airlines.csv` and the header plus initial aircraft records were inspected directly. The repository lists these files at 386 bytes and approximately 247 KB respectively; `weather.csv` is approximately 2.29 MB, but its contents were not successfully retrieved. The planes documentation displays **3,322 rows**. Full flight/weather counts and the January subset were not independently recounted.    [NYC Flights 2013](https://nycflights13.tidyverse.org/reference/planes.html)

### Schema and preparation

| Table and grain | Actual fields needed | Types, units, and cautions |
| --- | --- | --- |
| `flights`: one recorded flight | `year`, `month`, `day`, `dep_time`, `sched_dep_time`, `arr_time`, `sched_arr_time`, `dep_delay`, `arr_delay`, `carrier`, `flight`, `tailnum`, `origin`, `dest`, `air_time`, `distance`, `hour`, `minute`, `time_hour` | Calendar/time components are numeric; codes are strings. Delays and airborne time are minutes; distance is miles. HHMM fields are local-clock encodings, not elapsed durations. Negative delays mean early. `flight` alone is not a unique key. |
| `airlines`: one carrier | `carrier`, `name` | String lookup key and label. |
| `planes`: one aircraft identifier | `tailnum`, `year`, `type`, `manufacturer`, `model`, `engines`, `seats`, `speed`, `engine` | Manufacture year and numeric counts; `speed` is mph and can be `NA`. Rename the aircraft `year` before enrichment. |
| `weather`: one origin airport-hour | `origin`, `time_hour`, `temp`, `dewp`, `humid`, `wind_dir`, `wind_speed`, `wind_gust`, `precip`, `pressure`, `visib` | Temperature/dew point °F; relative humidity; direction degrees; wind mph; precipitation inches; pressure millibars; visibility miles. |

The field meanings and the `(origin, time_hour)` weather relationship are documented by the package. Actual aircraft sample rows include `NA` values; missing aircraft matches are also a documented property of the data, including fleet-number reporting by AA and MQ. [NYC Flights 2013+3](https://nycflights13.tidyverse.org/reference/flights.html)

**Proposed subset:** retain every record satisfying `year=2013 AND month=1`, including missing actual times and delays. This is a complete month, not a random sample; it preserves every carrier and operating day present in that month. It does **not** support annual-seasonality conclusions. The exact subset count and serialized size remain unknown.

**Offline preparation:**

Create `flight_id` from the pinned package version plus original row position **before** subsetting. Parse `NA` as null, preserve valid zero and negative delays, and preserve identifiers as strings. Retain the original `time_hour` instant for weather matching.

Create `flight_date` from `year/month/day`. For the UTC calendar renderer, encode that **local calendar date label** at midnight UTC; name the field accordingly so nobody mistakes it for the actual departure instant.

Prefix enrichment fields, for example `airline_name`, `plane_year`, `plane_seats`, `plane_manufacturer`, and `wx_visib`. Derive `aircraft_age = 2013 − plane_year`; flag implausible values rather than silently clipping them.

Create departure and arrival bands with identical boundaries:

`01 Early/on time: delay ≤ 0`; `02 >0–15 min`; `03 >15–60 min`; `04 >60 min`; `05 Not recorded`.

These are **analyst-defined bands**, not a claim about an official punctuality standard. A missing departure value is not automatically a cancellation.

### F1. Where in the journey does delay persist or change?

**Question and population.** Introduce the journey: how do departure-delay categories correspond to arrival-delay categories? Base: every January `flights` record, including missing values. The denominator is the complete filtered flight population, not only completed pairs.

**Preparation and views.** Use the offline bands above. Main view: **Sankey**, stages `dep_band → arr_band`, aggregation `count`, flow color by first stage, label order, and enough nodes to retain all five categories without “Other.” Title: **“From departure status to arrival status — January 2013.”** Support it with a percentage-stacked bar of `origin`, split by `arr_band`, using row counts, plus a source table containing IDs and raw delays.

**Interaction and checks.** Click the `>60 min → ≤0 min` link to filter corresponding flights in the bar and table. Trace a record to both raw delays and its band boundaries. Assert that each stage totals the same eligible N and that the percentage bars use each origin’s flight count, including “Not recorded.”

**Interpretation and notebook role.** Hypothesis: some departures lose time that is not recovered, while others improve before arrival. Missing states must remain a separate observation. This is the report’s opening orientation and leads to continuous delay relationships.

**Feature fit:** available with offline band preparation; Sankey and count-based percentage bars are current capabilities under R3.

### F2. How closely do departure and arrival delays move together?

**Question and population.** Examine continuous association rather than categories. Base: January flight records with finite `dep_delay` and `arr_delay`; report that paired N alongside the full eligible flight count and missing-pair exclusions.

**Preparation and views.** No additional aggregation table. Main: **scatter hexbin**, X=`dep_delay`, Y=`arr_delay`, 25 columns, count color, linear axes, facets=`origin`, linear regression, paired summary enabled, and 20-bin marginals. Labels explicitly use minutes. Support: an arrival-delay ECDF grouped by `origin` and a carrier count selector.

**Interaction and checks.** Select a carrier in the supporting chart; the other charts and fitted populations update. Then select a hexagon: linked views narrow to its source rows, but that scatter’s own fit remains based on its other-chart-filtered population. Trace the hexagon and fit; reconcile hex counts and marginal counts with paired N.

**Interpretation and notebook role.** Investigate whether the association differs by origin and whether a long positive tail dominates the picture. A fitted slope describes association, not the causal effect of departure delay. This follows F1 and asks what contextual information could explain differences.

**Feature fit:** available now after standard import preparation; R1–R2. No weighted or measure-summed hexagons are assumed.

### F3. Does scheduled-hour weather help describe departure-delay differences?

**Question and population.** Compare delay with available weather context. Base: January flights; the plotted population requires a unique weather match and finite `wx_visib` and `dep_delay`. Preserve unmatched flights outside the plotted-pair denominator.

**Preparation and views.** Offline lookup on `(origin, time_hour)`, with explicit `weather_match_status`. Main: **point scatter**, X=`wx_visib` in miles, Y=`dep_delay` in minutes, color=`origin`, grouped LOESS with span `0.6`, paired summaries, and 20-bin marginals. Support: weather-match-status counts and a compact source table containing the lookup key and original weather value.

**Interaction and checks.** Filter an origin using a category control; inspect whether the fitted population changes. Trace one plotted flight to its scheduled-hour key. Validate lookup uniqueness, count matched-but-null weather separately from unmatched keys, and verify that enrichment preserves flight N and distance totals.

**Interpretation and notebook role.** Hypothesis: visibility and delay distributions vary together. This is **flight-weighted**, because an airport-hour with many flights appears repeatedly; it is not an equally weighted weather-hour study. Scheduled-hour weather is also not necessarily weather at actual departure. This contextual chapter leads to the calendar view.

**Feature fit:** available with offline enrichment; planned lookups would expose provenance rather than unlock the chart itself.

### F4. Which days account for changes in the month’s delay experience?

**Question and population.** Locate within-month variation without claiming annual seasonality. Base: all January records. Daily flight counts include all records; daily mean departure delay includes only finite `dep_delay`.

**Preparation and views.** Main: **calendar time-series line**, X=`flight_date`, daily interval, aggregation=`average`, measure=`dep_delay`, split=`origin`, straight segments, and missing periods shown as gaps. Title: **“Daily mean recorded departure delay.”** Support: a calendar heatmap counting flights and a summary table showing total records, valid-delay records, and missing-delay records for the active population.

**Interaction and checks.** Select a calendar day to examine its flights in linked views. Trace the line point to contributing flight rows. Recalculate the daily mean from those rows and verify that its denominator is the valid-delay count—not the calendar’s total flight count. Confirm all 31 date labels are interpreted consistently.

**Interpretation and notebook role.** Investigate whether high means reflect broad deterioration or a small extreme tail. The supporting count and source rows distinguish the two. This chapter identifies dates worth examining in the fleet/route context.

**Feature fit:** available with date normalization; native daily count/average under R3. No averaging of precomputed daily averages is used.

### F5. How much of the observed pattern reflects route and aircraft mix?

**Question and population.** Explore operational composition rather than rank aircraft performance. Base: January flight records complete on `distance`, `air_time`, `plane_seats`, and `aircraft_age`; separately display aircraft-lookup coverage.

**Preparation and views.** Main: **parallel coordinates**, axes in that order, each with a labeled linear scale; color=`plane_manufacturer`. Title: **“Route and aircraft profiles — one line per flight.”** Support: an airborne-time ECDF and a count chart of `aircraft_match_status`. Do not sum seats to estimate passengers.

**Interaction and checks.** Brush a distance range, then an aircraft-age range. The linked ECDF should represent the intersection. Trace a line to `tailnum`, `plane_year`, and the original flight fields. Verify the complete-case count, distinguish repeated flights by the same aircraft, and retain unmatched records in coverage accounting.

**Interpretation and notebook role.** Hypothesis: routes, aircraft sizes, and flight durations form recognizable profiles. Any age-related pattern is confounded by route and fleet composition; this is not a safety or reliability assessment. The final analytical chapter explains why earlier comparisons should not become simplistic rankings.

**Feature fit:** available with offline aircraft enrichment; parallel-coordinate complete-case behavior follows R4.

### Related-table plan

| Base → lookup | Keys and expected cardinality | Contributed fields |
| --- | --- | --- |
| `flights → airlines` | String `carrier`; many base rows to zero/one lookup row | `airline_name` |
| `flights → planes` | String `tailnum`; many-to-zero/one | Prefixed manufacture year, manufacturer, model, seats, engines |
| `flights → weather` | Composite string/instant `(origin, time_hour)`; many-to-zero/one | Prefixed weather measurements and source timestamp |

Require uniqueness before flattening. A duplicate lookup key must produce an ambiguity report—not row multiplication or an arbitrary first match. Missing keys retain the flight and null enrichment fields; matched rows with null attributes receive a different status.

The January base count, its unique `flight_id` count, its valid-delay counts, and its sum of finite `distance` must remain unchanged after every lookup. Keep the complete small lookup tables where practical: aircraft or weather rows without January flights are legitimate lookup-only records, not bad data. Documented aircraft mismatches provide real edge cases without altering data. [NYC Flights 2013](https://nycflights13.tidyverse.org/reference/planes.html)

Today, ship validated flattened fields and explicit source/key columns. With planned lookups, an inspector should show `base flight → lookup key → contributing aircraft/weather row`. An aircraft-based fleet inventory or weather-hour analysis would require a **separate future base view**, not automatic propagation from the flight population.

### Notebook outline

**Title:** *Where did January’s flights lose time?*
**Audience:** EDA-library users and operations analysts.
**Main question:** Which observed relationships survive changes in population and context?

Open with the January population, missing-value policy, and historical scope. Follow with a preparation section explaining time encodings, stage bands, and the three lookup relationships.

Order the report **F1 → F2 → F3 → F4 → F5**. Example conditional narrative:

“A wide flow into the longest arrival-delay band would identify a useful subgroup to inspect; it would not establish why those flights were delayed.”

“A weather relationship should be interpreted per flight, with its lookup coverage visible. Repeating the question per airport-hour would change the population.”

Reader checkpoints are a Sankey link, a carrier filter, a weather trace, a calendar day, and a parallel-axis brush. Each chapter should record total flights, its valid analytical denominator, active filters, and lookup coverage. Conclude with supported descriptive patterns, excluded populations, and unanswered explanatory questions. Append the package version, attribution, export rules, key audits, band definitions, and saved-state manifest.

---

## 3. Dataset 2 — Beijing Multi-Site Air Quality: coverage before conclusions

### Sources, access, and reuse

The [UCI dataset page and dictionary](https://archive.ics.uci.edu/dataset/501/beijing+multi+site+air+quality+data) documents **420,768 hourly records**, **12 monitoring sites**, and coverage from **March 1, 2013 through February 28, 2017**. Air measurements originate with the Beijing Municipal Environmental Monitoring Center; meteorological measurements were matched to nearby weather stations. Missing values are `NA`. UCI explicitly licenses the dataset under **CC BY 4.0**. Cite **Chen, S. (2017), DOI 10.24432/C5RK5G**, and identify the derived daily aggregation. [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/501/beijing%2Bmulti%2Bsite%2Bair%2Bquality%2Bdata)

**Download:** [official dataset ZIP](https://archive.ics.uci.edu/static/public/501/beijing+multi+site+air+quality+data.zip). The publisher lists a 7.6 MB core ZIP and a 7.8 MB overall download. Use the full `PRSA2017_Data_20130301-20170228.zip` corpus, not the much smaller similarly listed `data.csv` or `test.csv`. The archive payload was not inspected here.

### Schema and preparation

One source row represents **one station-hour**. The documented fields are:

| Fields | Type/unit |
| --- | --- |
| `No`, `year`, `month`, `day`, `hour` | Integer row/time components |
| `station`, `wd` | Station and wind-direction categories |
| `PM2.5`, `PM10`, `SO2`, `NO2`, `CO`, `O3` | Numeric concentrations, µg/m³ |
| `TEMP`, `DEWP` | °C |
| `PRES` | hPa |
| `RAIN` | mm |
| `WSPM` | m/s |

`No` is not a safe global identifier across station files. The intended source key is `(station, year, month, day, hour)`. These field names and units are publisher-documented rather than verified from downloaded rows in this run. [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/501/beijing%2Bmulti%2Bsite%2Bair%2Bquality%2Bdata)

**Proposed subset and grain:** all stations and all dates in **2016**, prepared as a station-day calendar. Its target is **12 × 366 = 4,392 rows**; this is a constructed analytical grid size, not a recount of the archive. Preserve any day with absent source records as explicitly absent, never as zero pollution.

For each pollutant and selected meteorological variable, derive a daily mean only when **at least 20 of 24 hourly values are valid**. This is a proposed demonstration policy, not a regulatory rule. Retain `*_valid_hours`, `recorded_hours`, and absence flags even when a mean is null.

Use aliases such as `pm25_mean`, `pm10_mean`, `no2_mean`, `o3_mean`, `temp_mean`, and `wspm_mean`. Derive `pm25_coverage_pct = 100 × pm25_valid_hours / 24`, `month_label`, and season labels `DJF/MAM/JJA/SON`. Keep source file names and source-hour identifiers in the preparation provenance.

The inspected documentation does not establish a timezone convention. Use the supplied calendar components as **publisher calendar labels**, not claimed UTC instants. Do not sum `RAIN` into a daily total without separately confirming its interval interpretation.

### B1. Is the measurement coverage adequate for comparison?

**Question and population.** Start with what was measured. Base: the complete 2016 station-day calendar, including days with no valid PM2.5 value. The denominator is 24 expected hourly slots per station-day.

**Preparation and views.** Main: **categorical heatmap**, rows=`station`, columns=`month_label`, aggregation=`average`, measure=`pm25_coverage_pct`, label ordering, all 12 stations and months retained. Title: **“PM2.5 hourly coverage by station and month.”** Support: a calendar of daily coverage for a selected station and a source table containing valid-hour and recorded-hour counts.

**Interaction and checks.** Click one station-month cell; the calendar and table narrow accordingly. Trace a day with low coverage. Reconcile monthly coverage against `sum(valid hours) / (24 × number of calendar days)`. Because every included day has the same 24-slot denominator, the mean daily coverage percentage agrees with that calculation. Distinguish no source records, recorded `NA`, and valid zero.

**Interpretation and notebook role.** Hypothesis: coverage is not uniform across stations or months. Establishing this first prevents later pollution differences from being mistaken for equivalent measurement support.

**Feature fit:** available with offline calendar/completeness preparation; native heatmap average under R3.

### B2. How does the daily pollution profile vary through the year?

**Question and population.** Examine seasonality without discarding the date structure. Base: 2016 station-days; `pm25_mean` is eligible only after the 20-hour rule. Start with the lexicographically first source station, allowing readers to change it.

**Preparation and views.** Main: **daily time-series line**, X=`date_label`, measure=`pm25_mean`, daily aggregation=`average`, gap handling, and straight segments. At a single station there is at most one qualified value per day, so this does not average daily means into larger-period means. Title: **“Daily PM2.5 — qualified station-days in 2016.”** Support: a station count selector and a box plot by `season`, with observations/beeswarm enabled.

**Interaction and checks.** Select a station, then inspect an unusually high daily point. Verify its hourly count and contributing values. The box statistics must use all eligible daily values; displayed observations should be checked against the renderer’s overlay limit. Reconcile eligible days by season with the line population.

**Interpretation and notebook role.** Investigate recurring seasonal differences and short episodes as hypotheses, not established findings. This chapter follows coverage and asks whether different pollutants tell a similar story.

**Feature fit:** available with offline daily preparation; current time-series and distribution views under R3–R4.

### B3. Do particle and gas measurements form distinct joint patterns?

**Question and population.** Examine co-occurrence rather than claim a pollution-source attribution. Base: 2016 station-days with qualified finite `pm25_mean` and `no2_mean`. Each day has equal weight.

**Preparation and views.** Main: **scatter contour**, X=`pm25_mean`, Y=`no2_mean`, linear axes, Scott-bandwidth multiplier `1`, six levels, point overlay enabled, and facets=`season`. Enable paired summaries. Title: **“Daily PM2.5 and NO₂: paired station-day observations.”** Support: a station selector and a PM2.5 histogram with 20 bins.

**Interaction and checks.** Filter to one station and compare the resulting seasonal panels. Trace a contour to its estimation settings and inspect an overlaid point to reach an actual day. Reconcile paired N against both pollutants’ quality flags. Contour intensity is an estimated density, not the sum of pollution concentrations; a contour’s coverage is not automatically a confidence level.

**Interpretation and notebook role.** Hypothesis: the joint distribution changes by season or station. Association alone does not identify shared emissions or causation. This analysis motivates a more focused temperature–ozone comparison.

**Feature fit:** available with offline daily fields; R1–R2. No correlation-matrix heatmap is proposed.

### B4. Does the temperature–ozone relationship change by season?

**Question and population.** Explore nonlinear association and grouping. Base: qualified 2016 station-days with finite `temp_mean` and `o3_mean`, initially at one selected station.

**Preparation and views.** Main: **point scatter**, X=`temp_mean` in °C, Y=`o3_mean` in µg/m³, color=`season`, grouped LOESS span `0.6`, optional overall fit, paired summary, and 20-bin marginals. Support: a season count selector and a `wspm_mean` histogram. Keep all axes linear and show group sample sizes.

**Interaction and checks.** Select a season in the supporting chart; fits should update from that external filter. Trace an extreme observation to its daily coverage fields. Verify the fit population against finite qualified pairs. A group too small or lacking sufficient distinct X values should show the implementation’s unavailable-fit state, not a substituted method.

**Interpretation and notebook role.** Hypothesis: a pooled curve may conceal seasonal differences. Daily averaging also changes the question from an hourly relationship. This chapter demonstrates why grouping matters before the final multivariable comparison.

**Feature fit:** available with offline preparation; grouped LOESS under R1. The implementation’s LOESS is descriptive, not a causal or uncertainty model.

### B5. Are high values part of one pollution profile or several?

**Question and population.** Look beyond a single pollutant. Base: 2016 station-days complete on all six qualified daily concentration fields; explicitly report the complete-case reduction from the full station-day population.

**Preparation and views.** Main: **parallel coordinates**, ordered axes `pm25_mean`, `pm10_mean`, `so2_mean`, `no2_mean`, `co_mean`, `o3_mean`; color=`season`. Each axis has its own labeled linear concentration scale—no unlabeled standardization. Title: **“Six-pollutant daily profiles.”** Support: a PM2.5 ECDF and a source table with the six valid-hour counts.

**Interaction and checks.** Brush the upper portion of the ozone axis, then a particle range. Linked views should show their intersection. Trace a line to its station/date and coverage. Reconcile the number of rendered complete lines, and compare the PM2.5 distribution of this complete-case population with the broader qualified-PM2.5 population in a separately restored configuration.

**Interpretation and notebook role.** Hypothesis: high-ozone days and high-particle days may not share one profile. The report ends by testing whether the selected multivariable population is itself biased by completeness requirements.

**Feature fit:** available with offline daily preparation; R4.

### Multi-source potential

The 12 original station files contain the **same grain and schema** and should be concatenated. Calling them lookup tables would obscure the relationship.

A useful optional lookup is a **reference-station daily table**. Choose the lexicographically first station from the frozen source, derive one row per date with its daily PM2.5 and valid-hour count, and enrich the station-day base on `date_label`. The lookup contributes `reference_pm25_mean` and `reference_valid_hours`; a prepared difference is `pm25_mean − reference_pm25_mean`.

The base remains 4,392 calendar rows. The reference lookup has at most 366 source-derived date rows; an explicitly completed reference calendar can contain 366 rows with null measurements. Date keys must be unique. Distinguish unmatched dates from matched dates whose reference mean failed the coverage rule. Preserve station-day values and counts unchanged.

This is a **derived reference lookup**, not a separately supplied official station dimension. No station coordinates or meteorological-station identifiers were verified, so neither a station map nor an explicit nearest-weather-station lookup belongs in the initial example. Current traces stop at prepared daily rows; navigating from those rows into all contributing hours requires additional provenance support or a separate hourly view.

### Notebook outline

**Title:** *A year of air-quality measurements: coverage, seasonality, and pollutant profiles.*
**Audience:** environmental-data learners and EDA developers.
**Main question:** Which comparisons remain interpretable after accounting for measurement coverage?

Introduce the hourly sources, the constructed station-day population, and the fact that daily means are derived. The preparation chapter defines every mean, the 20-hour threshold, calendar-label handling, and any reference-station provenance.

Use **B1 → B2 → B3 → B4 → B5**. Example passages:

“A low-coverage month should not be interpreted as a low-pollution month. The next figures use only daily means meeting the stated completeness rule.”

“A seasonal difference in the fitted relationship would motivate a closer inspection of individual days; it would not establish a meteorological cause.”

Readers inspect a low-coverage day, change station, compare seasonal density panels, and brush a pollutant profile. Record station-day N and variable-specific valid N at each chapter. Conclude with conditional descriptive comparisons and their coverage sensitivity. Append source attribution, station-file inventory, hourly-key audits, aggregation rules, calendar assumptions, and preparation hashes.

---

## 4. Dataset 3 — World Development Indicators: countries, years, and weighting

### Sources, access, and reuse

Use these four World Bank indicators, each explicitly labeled **CC BY 4.0** on its publisher page:

| Indicator | Source/dictionary | CSV export request | Prepared value field |
| --- | --- | --- | --- |
| `SP.POP.TOTL` | [Population, total](https://data.worldbank.org/indicator/SP.POP.TOTL?utm_source=chatgpt.com) | [CSV](https://api.worldbank.org/v2/en/indicator/SP.POP.TOTL?downloadformat=csv) | `population`: people |
| `NY.GDP.PCAP.PP.KD` | [GDP per capita, PPP](https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.KD?utm_source=chatgpt.com) | [CSV](https://api.worldbank.org/v2/en/indicator/NY.GDP.PCAP.PP.KD?downloadformat=csv) | `gdp_ppp_pc`: constant **2021** international dollars |
| `SP.DYN.LE00.IN` | [Life expectancy at birth](https://data.worldbank.org/indicator/SP.DYN.LE00.IN?utm_source=chatgpt.com) | [CSV](https://api.worldbank.org/v2/en/indicator/SP.DYN.LE00.IN?downloadformat=csv) | `life_expectancy`: years |
| `EG.ELC.ACCS.ZS` | [Access to electricity](https://data.worldbank.org/indicator/EG.ELC.ACCS.ZS?utm_source=chatgpt.com) | [CSV](https://api.worldbank.org/v2/en/indicator/EG.ELC.ACCS.ZS?downloadformat=csv) | `electricity_pct`: percent of population |

The current GDP series is not in constant 2017 international dollars; its verified label is constant **2021** international dollars. Preserve each indicator’s underlying-provider attribution, not only “World Bank.” The Bank’s terms allow redistribution and adaptation, including commercial use, subject to attribution and additional published terms. [World Bank+4](https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.KD)

Additional sources: [country metadata API](https://api.worldbank.org/v2/country?format=json&per_page=1000), [country API dictionary](https://datahelpdesk.worldbank.org/knowledgebase/articles/898590-country-api-queries?utm_source=chatgpt.com), and [indicator metadata dictionary](https://datahelpdesk.worldbank.org/knowledgebase/articles/898599-indicator-api-queries?utm_source=chatgpt.com).

**Inspection status:** indicator labels, licenses, export controls, and publisher API examples were inspected. The country documentation includes an example record with `id`, `iso2Code`, `name`, `region`, `incomeLevel`, `capitalCity`, `longitude`, and `latitude`. That is a **documentation example**, not a retrieved current country table. The selected data exports, exact row counts, and compressed sizes remain unverified. [World Bank Data Help Desk+1](https://datahelpdesk.worldbank.org/knowledgebase/articles/898590-country-api-queries)

### Schema, subset, and preparation

Use each source indicator table at **country-year-indicator grain**, then normalize to named value fields. The CSV route exposes country and indicator identifiers and year columns; the API route offers an alternative long-form extraction. Retain source metadata and the extraction vintage rather than relying on display labels as keys.

Country metadata uses string IDs and nested region/income-level descriptors. The World Bank explicitly notes that its API can return **World Bank codes where ISO codes are unavailable**. Consequently, a three-character code is not proof of an exact ISO match. Current metadata classifications should not be presented as historical classifications for every year. [World Bank Data Help Desk](https://datahelpdesk.worldbank.org/knowledgebase/articles/898590-country-api-queries)

**Proposed base:** all population-indicator country-year records returned for **2000–2023**, including returned null-valued records, after excluding aggregate economies through country metadata. This preserves a clearly declared source population; an absent population record is not silently manufactured. Expect a panel of several thousand rows, but use the actual extraction count—not a hard-coded country count.

Offline, enrich this population base with the other three indicators on `(country_code, year)` and metadata on `country_code`. Preserve separate statuses for no matching record and a matching record with a null value. Do not interpolate.

Derive `log10_gdp_ppp_pc` only for positive GDP values. For paired endpoint analyses, construct one country-level lookup containing `electricity_2000`, `electricity_2023`, `access_gain_pp`, and an endpoint-completeness flag. The flag must also require corresponding base records at both endpoints.

**Geometry extension.** Use [Natural Earth’s 110m country GeoJSON](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson), which is public domain. Actual inspected features contain `WB_A3`; some contain the sentinel `"-99"`. The inspected file blob is `1e6ab74c7042f97013be69ceec798be8e1aff27d`. Create a safe `wb_key`: valid `WB_A3` where available, otherwise a nonmatching feature-specific key based on `NE_ID`. Do not merge all `"-99"` features into one region. [Natural Earth Data](https://www.naturalearthdata.com/about/terms-of-use/)

### W1. How does the income–longevity association differ across regions?

**Question and population.** Compare economies without pretending they represent equally sized populations. Base: 2023 country-year records with positive GDP and population and finite life expectancy. Exclude aggregate economies and expose all further omissions.

**Preparation and views.** Main: **bubble scatter**, X=`log10_gdp_ppp_pc`, Y=`life_expectancy`, size=`population`, color=`region_name`, grouped linear fits, optional overall fit, and paired summaries. Use linear axes on the prepared fields; label X **“log₁₀ GDP per capita, PPP, constant 2021 international $.”** Support: region counts and a source table with the original GDP values.

**Interaction and checks.** Select a region; fits and paired N update. Trace a bubble to its country-year and all three contributing indicator records. Verify one row per country in this preset and reconcile excluded GDP, population, and longevity values.

**Interpretation and notebook role.** Hypothesis: the relationship differs between pooled and regional views. Bubble size does **not** make the regression population-weighted; each country remains one fitted observation. This opening comparison motivates a closer look at another development outcome.

**Feature fit:** available with offline lookups/transformation; R1. No unsupported logarithmic-axis setting is assumed.

### W2. Did the country distribution of electricity access shift between endpoints?

**Question and population.** Compare like with like. Base: the 2000 and 2023 rows for countries with base records and finite electricity access at **both** endpoints. The two curves must contain the same countries.

**Preparation and views.** Use the offline endpoint-completeness flag. Main: **ECDF**, field=`electricity_pct`, group/color=`year_label`, X fixed to 0–100%, cumulative direction `≤`. Title: **“Electricity access in 2000 and 2023 — matched countries.”** Support: region counts and an endpoint table showing both values for each country.

**Interaction and checks.** Select a region; both endpoint curves should retain the same matched-country set. Inspect a country near the lower tail. Assert equal country counts across endpoint groups and verify that duplicate country-year records did not inflate either curve.

**Interpretation and notebook role.** Hypothesis: the distribution shifted, but its extent and shape must be computed. This is an **equally weighted country distribution**, not the distribution of people’s access. The distinction sets up the population-weighted geographic chapter.

**Feature fit:** available with offline endpoint lookup and current ECDFs under R4.

### W3. Do cross-sectional comparisons conceal different historical paths?

**Question and population.** Examine repeated observations without mixing them into a single country-level fit. Base: all available 2000–2023 records for a declared illustrative group: `BRA`, `CHN`, `IND`, `NGA`, `USA`, and `ZAF`. These are examples, not a representative sample.

**Preparation and views.** Main: **small-multiple point scatter**, X=`year`, Y=`life_expectancy`, facet=`country_name`, shared linear Y scale, integer year ticks, no regression and no connecting interpolation. Title: **“Annual life-expectancy observations, 2000–2023.”** Support: a year-coverage table and country selector. Unconnected points deliberately avoid implying values through missing years.

**Interaction and checks.** Select a country and a year range through linked controls; inspect an individual point. Verify uniqueness of `(country_code, year)`, count available years per economy, and keep absent records distinct from returned null values.

**Interpretation and notebook role.** Investigate whether countries with similar endpoint values reached them through different recorded trajectories. Do not attribute changes to particular policies or events without additional evidence. This chapter adds history before comparing the geographic distribution of access.

**Feature fit:** available with the prepared panel; current facets and point scatter under R1.

### W4. Where do low access rates and large affected populations differ?

**Question and population.** Contrast national percentages with population scale. Base: 2023 records with finite `electricity_pct` and valid `population`, excluding aggregate economies. Mapping eligibility is a separate condition and must not silently define the tabular denominator.

**Preparation and views.** Derive `without_electricity_est = population × (1 − electricity_pct/100)`. Main: **region map**, base key=`country_code`, feature key=`wb_key`, measure=`electricity_pct`, aggregation=`average`, fixed 0–100 scale. There is only one base row per mapped country, so the average is that country’s value. Support: a region bar summing `without_electricity_est` and a table of eligible population, estimated people without access, and geometry-match status.

**Interaction and checks.** Select a mapped country and inspect its tabular contribution. Check the two source indicator values and geometry key. Assert percentages are within 0–100 or flag them; verify that unmatched geometry does not remove people from tabular totals.

**Interpretation and notebook role.** A population-weighted combined access rate, when reported, must be `100 × (1 − Σwithout_electricity_est / Σeligible_population)`, not the mean of country percentages. Compute and snapshot that ratio outside the current chart unless supported live composition is separately implemented.

**Feature fit:** available with offline geometry/crosswalk preparation; map and sum views under R3–R4.

### W5. How much improvement was possible from different starting points?

**Question and population.** Compare endpoint change while making ceiling effects explicit. Base: 2023 country rows with the same complete endpoint cohort used in W2. Each economy contributes once.

**Preparation and views.** Derive `access_gain_pp = electricity_2023 − electricity_2000`. Main: **point scatter**, X=`electricity_2000`, Y=`access_gain_pp`, color=`region_name`, linear axes, no fitted causal trend. Title: **“Electricity-access change versus starting level, 2000–2023.”** Support: a box plot of gains by region and an endpoint source table.

**Interaction and checks.** Brush countries starting below a chosen access percentage; linked gain summaries should update. Trace a point to both year-specific records. Check the subtraction and the logical bounds `−baseline ≤ gain ≤ 100 − baseline`. Investigate violations rather than silently clipping values.

**Interpretation and notebook role.** Hypothesis: gains vary by starting point and region. Countries already near 100% have little upward room; a negative association with baseline is not, by itself, evidence about policy effectiveness. This final chapter qualifies the endpoint ECDF and geographic comparison.

**Feature fit:** available with offline endpoint enrichment; future explicit lookups would improve year-to-year provenance.

### Related-table plan

| Table | Key and grain | Relationship to the base |
| --- | --- | --- |
| Population base | `(country_code:string, year:integer)` | One retained source record per country-year |
| GDP, longevity, electricity tables | Same composite key, unique within each indicator | Base-to-zero/one lookup; differing missingness and table sizes are expected |
| Country metadata | `id:string` | Many base years to one metadata row |
| Endpoint lookup | `country_code:string` | Derived one-row-per-country table containing 2000/2023 access and cohort flags |
| Indicator metadata | `indicator_id:string` | Definitions, units, source organizations, and attribution; primarily field provenance |

The base N and population values must not change after enrichment. Compare population totals **within each year** before and after lookups; summing population across all years is not a meaningful single population count.

Reject duplicate indicator keys instead of averaging them. Record lookup-only country-years, country metadata with no base records, and matched-null observations. Keep aggregate-economy exclusions auditable. The endpoint lookup requires pivoting two selected years before enrichment; it is not a many-row join directly into the base.

Today, flatten these sources and retain indicator IDs, source notes, extraction vintage, and match statuses. Planned lookups should reveal field origins and matching evidence. A source-specific population absent from the population base requires a **different future base view**, not an implicit expansion of this one.

### Notebook outline

**Title:** *Development indicators: countries, trajectories, and people.*
**Audience:** data-literacy learners and dashboard developers.
**Main question:** How does the answer change when the unit is a country, a country-year, or a population-weighted total?

The introduction defines the four indicators, historical period, and exclusion of aggregate economies. Preparation explains constant-2021 PPP units, country-key exceptions, the endpoint cohort, and map provenance.

Use **W1 → W2 → W3 → W4 → W5**, restoring separate saved filter states for the 2023 cross-section, endpoint comparison, and full historical panel. Example passages:

“The bubbles communicate population size, but the fitted relationship still gives each country one observation.”

“A country-level distribution and a population-weighted total answer different questions. Neither should be substituted for the other without changing the label.”

Reader checkpoints include a region filter, an endpoint trace, a missing year, and an unmapped economy. Record country N, country-year N, eligible population, and geometry omissions as appropriate. Conclude with descriptive comparisons and weighting sensitivity. Append indicator metadata, attribution, extraction date, endpoint rules, country exclusions, crosswalk audits, and saved states.

---

## 5. Dataset 4 — USGS ComCat: a catalogue is a defined observation population

### Sources, access, and reuse

**Publisher:** U.S. Geological Survey, ANSS Comprehensive Earthquake Catalog.

Sources: [catalogue documentation](https://earthquake.usgs.gov/data/comcat/), [CSV field documentation](https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php?utm_source=chatgpt.com), and [query API documentation](https://earthquake.usgs.gov/fdsnws/event/1/?utm_source=chatgpt.com).

**Proposed CSV request:** [global 2023 earthquake extract, minimum magnitude 4.5](https://earthquake.usgs.gov/fdsnws/event/1/query?format=csv&starttime=2023-01-01&endtime=2024-01-01&minmagnitude=4.5&eventtype=earthquake&orderby=time-asc).

The endpoint’s end time is inclusive. After extraction, enforce the half-open interval `2023-01-01 ≤ time < 2024-01-01`, recording any excluded boundary event. The API documents CSV output, a matching count method, ordering, and a **20,000-event query limit**. If needed, use monthly requests and reconcile boundary duplicates by event ID. [USGS Earthquake Hazards](https://earthquake.usgs.gov/fdsnws/event/1/)

**Reuse:** USGS-authored or produced data are identified as U.S. public-domain material. Credit USGS and preserve catalogue source fields. Do not extend that statement to every third-party image or other copyrighted item on USGS websites; this example needs only tabular catalogue data, not logos or media. [USGS](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits)

**Version and inspection:** freeze the actual returned CSV, request parameters, retrieval timestamp, and checksum. Historical event records can have an `updated` timestamp, so “2023” defines event coverage, not an immutable release. The proposed extract’s records, exact count, and bytes were **not retrieved here**. CSV field documentation and the query contract were inspected.

### Schema and preparation

One row is a catalogue event using the returned preferred information, not a row for every contributing measurement or product. The documented CSV names include:

`time`, `latitude`, `longitude`, `depth`, `mag`, `magType`, `nst`, `gap`, `dmin`, `rms`, `net`, `id`, `updated`, `place`, `type`, `locationSource`, `magSource`, `horizontalError`, `depthError`, `magError`, `magNst`, `status`. Parse by header name, not presumed column position. [USGS Earthquake Hazards](https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php)

Use `id` as the unique key **within the frozen extract**. `time` and `updated` are timestamps; location is in geographic degrees; depth is kilometers; `mag` is a numeric magnitude whose `magType` must be retained. The API explicitly allows negative depth bounds, so do not automatically turn negative depths into missing values. [USGS Earthquake Hazards+1](https://earthquake.usgs.gov/fdsnws/event/1/)

Convert blank numeric fields to null, not zero. Preserve categorical codes and raw values. Derive UTC event date and analyst-defined depth labels: `<0 km`, `0–<70 km`, `70–<300 km`, `≥300 km`, and `Not recorded`.

Some linked detailed field-definition pages redirected to more general format documentation during this inspection. Therefore, the designs below use the ancillary error/measurement fields **only for presence auditing**, not for unverified unit-specific error analysis.

### E1. Where are the events in this selected catalogue?

**Question and population.** Establish the geographic population. Base: all retained 2023 qualifying events; map eligibility additionally requires valid latitude/longitude. Report any nonmappable records separately.

**Preparation and views.** Main: **point map**, latitude=`latitude`, longitude=`longitude`, label=`id`, fixed point radius, color=`depth_band`, equal-earth projection. Title: **“Recorded 2023 earthquakes selected at M4.5+.”** Support: a 20-bin magnitude histogram and source table including `place`, `magType`, depth, and source codes. Do not size bubbles as though magnitude were a population or an energy total.

**Interaction and checks.** Select a point to narrow linked views; inspect its exact coordinates and ID. Validate coordinate ranges and unique IDs, and reconcile mapped N with total N minus coordinate exclusions. Preserve overlapping records rather than deduplicating on location.

**Interpretation and notebook role.** Investigate spatial concentration within this query-defined catalogue. The map lacks exposure and vulnerability information and is not a risk map. It opens the report and leads to the timing of the selected events.

**Feature fit:** available with standard parsing and depth labels; point maps under R4.

### E2. Is the recorded activity evenly distributed through the year?

**Question and population.** Examine event timing without making forecasts. Base: all retained qualifying events with valid timestamps. Daily denominators are event counts within the selected query, not estimates of all seismic activity.

**Preparation and views.** Main: **calendar heatmap**, date=`event_date_utc`, aggregation=`count`. Support: a weekly **stacked-area** time series split by `depth_band`, count aggregation, Monday week start, and a source table for selected dates. Label both as counts of selected catalogue events.

**Interaction and checks.** Select a high-count date to inspect its records and depth composition. Reconcile daily counts with retained N and weekly stacks with the same event population. Once extract completeness is established, a zero day means “no qualifying returned event,” not “no earthquake of any size.”

**Interpretation and notebook role.** Hypothesis: counts are clustered in time rather than uniform. No causal or forecasting claim follows from a calendar pattern alone. This chapter identifies intervals for inspection before examining the magnitude–depth population.

**Feature fit:** available after date preparation; current count-based calendar and stacked time-series behavior under R3.

### E3. How does the selected magnitude–depth distribution vary by magnitude type?

**Question and population.** Inspect a numeric relationship while retaining measurement-method context. Base: events with finite `depth` and `mag`; preserve `magType` and show missing-type records separately.

**Preparation and views.** Main: **scatter hexbin**, X=`depth` in kilometers, Y=`mag`, 25 columns, count color, linear axes, facets=`magType`, no regression by default. Title: **“Magnitude and depth — counts of catalogue events.”** Support: a magnitude-type count selector and a depth ECDF.

**Interaction and checks.** Select a magnitude type with the count selector, then a hexagon. The ECDF should narrow to the selected source rows. Trace the hexagon to IDs; verify its count and the total paired N. Keep negative-depth records explicitly identifiable rather than silently excluding them.

**Interpretation and notebook role.** Hypothesis: the joint distribution changes across magnitude types or depth bands. A pooled visual pattern should not be interpreted as a physical law. This leads to a more controlled distribution comparison.

**Feature fit:** available after import preparation; count-only hexbins and source tracing under R2.

### E4. Do magnitude distributions differ across depth bands within a common magnitude type?

**Question and population.** Reduce one source of mixture. Base: finite-magnitude, finite-depth events within the **most frequent nonmissing `magType` in the frozen extract**, with lexical tie-breaking. Record the chosen type rather than guessing it in advance.

**Preparation and views.** Main: **ECDF**, X=`mag`, group/color=`depth_band`, direction `≤`, identical magnitude axis. Title: **“Magnitude distributions by depth band — one magnitude type.”** Support: group counts and a box/violin view of magnitude by the same bands.

**Interaction and checks.** Select an upper-tail range and inspect the corresponding events. Verify each ECDF denominator from its finite group records and confirm that the query threshold is applied consistently. The complete selected population must remain recoverable by clearing filters.

**Interpretation and notebook role.** Hypothesis: the group distributions differ. All curves are conditional on the minimum-magnitude selection; they cannot describe the omitted lower-magnitude population. This chapter ends the substantive distribution sequence and leads to what metadata accompanied these records.

**Feature fit:** available with an offline, reproducible choice of comparison group; R4.

### E5. How complete is the accompanying measurement metadata?

**Question and population.** Distinguish event availability from metadata availability. Base: every retained event, including records with no ancillary measurement fields populated.

**Preparation and views.** Offline, count finite values among `nst`, `gap`, `dmin`, `rms`, `horizontalError`, `depthError`, `magError`, and `magNst`. Derive `metadata_present_count` from 0–8 and ordered bands `0–2`, `3–5`, `6–8`. A valid numeric zero counts as present. Main: **percentage-stacked bars**, X=`net`, split=`metadata_coverage_band`, aggregation=`count`. Support: network counts and a source table with the eight presence flags.

**Interaction and checks.** Select a low-coverage segment, inspect its raw fields, and verify that nulls—not zero values—caused the omissions. Each network’s stack denominator must equal its event count. Recalculate the score for traced records and ensure all events belong to exactly one band.

**Interpretation and notebook role.** Hypothesis: metadata completeness differs by returned source network. This measures field availability, not catalogue accuracy or earthquake severity. It closes the report by qualifying how far further analyses could go.

**Feature fit:** available with offline presence flags; current count-based percentage bars under R3.

### Multi-source potential

Keep the first version single-table. An optional later table could contain **one selected event-detail record per frozen event ID**, contributing a small set of clearly defined attributes. However, detail products and revisions can be one-to-many. They must first be reduced by an explicit product type, preferred-status rule, and revision policy.

Never attach all products directly to event rows. The event count and counts by day, magnitude type, and source must remain unchanged. Missing detail records remain unmatched; duplicate selected detail IDs are errors. Preserve field origin as event ID, detail URL or product ID, product type, and revision timestamp.

A product-based analysis would have a different base population and belong in a separate future view. This family is useful precisely because it also demonstrates when **not** to introduce multi-source complexity.

### Notebook outline

**Title:** *What a selected earthquake catalogue records—and what it does not.*
**Audience:** geospatial-data learners and EDA developers.
**Main question:** What descriptive conclusions are justified by this frozen, thresholded event population?

Introduce the exact query, event-time window, threshold, preferred-record semantics, and extraction vintage. Preparation covers timestamp parsing, missing values, depth bands, query-count reconciliation, and the metadata-presence score.

Use **E1 → E2 → E3 → E4 → E5**. Example passages:

“These figures describe the events returned by the stated selection. They do not include every earthquake, and the map does not measure consequences for people or buildings.”

“A blank metadata field limits a particular follow-on analysis. It does not establish that the event itself was poorly detected.”

Readers select a point, a date, a hexagon, and a low-metadata segment. Every chapter records query scope, filtered N, field-specific exclusions, and the extraction checksum. Conclude with descriptive patterns and explicit limits—never a prediction. Append the full query, count audit, duplicate/boundary rules, field dictionary, credits, and saved filter states.

---

## 6. Portfolio coverage and notebook-reporting readiness

### Coverage matrix

**Strong** means a central, worthwhile use in the proposed five analyses; **supporting** means a secondary view. It does not mean runtime validation was performed.

| Capability | Flights | Beijing | WDI panel | Earthquakes |
| --- | --- | --- | --- | --- |
| Points, grouped linear fits, paired summaries | Strong | Supporting | Strong | Supporting |
| Grouped LOESS | Strong | Strong | Not needed | Not needed |
| Hexbin/count density | Strong | Available alternate to contours | Not needed | Strong |
| Smoothed density contours | Not necessary | Strong | Not necessary | Not necessary |
| Marginals | Strong | Strong | Optional | Optional |
| Bubble sizing with an interpretable quantity | Not necessary | Not necessary | Strong: population | Deliberately avoided |
| ECDF, box/violin, observations | Strong | Strong | Strong | Strong |
| Calendar and time summaries | Strong: complete month | Strong: full year | Annual point panels | Strong: event year |
| Percentage/stacked bars or areas | Strong | Not forced | Sum bars, not stacked rates | Strong |
| Categorical heatmap | Optional | Strong: coverage | Not forced | Not necessary |
| Parallel coordinates | Strong: flight profiles | Strong: pollutants | Optional | Not necessary |
| Valid ordered Sankey | **Strong: departure → arrival** | Not appropriate | Not appropriate | Not appropriate |
| Point map | Excluded from first scope | Coordinates unverified | Not necessary | **Strong** |
| Region map with real supplied geometry | Not necessary | Not available from inspected schema | **Strong** | Not necessary |
| Explicit lookup teaching value | **Excellent** | Moderate, derived reference | **Excellent** | Limited initial need |
| Notebook narrative with evidence | Journey and enrichment | Measurement and completeness | Units, cohorts, weighting | Query scope and metadata |

Polynomial fits and 3D scatter are intentionally not forced into this portfolio. Their existence does not create a useful analysis question. Likewise, no dataset is made to support a Sankey merely by arranging unrelated categorical fields.

### What current notes and saved workspaces can do

Current notes can hold introductions, definitions, citations, conditional interpretations, and inspection instructions. Saved settings can preserve the associated chart configurations, filters, calculations, and layout; a full analysis bundle can retain the current prepared dataset as well. These are useful building blocks, but they do not automatically bind narrative claims to live values or freeze chart results.

For these examples, the smallest useful notebook additions are:

| Addition | Concrete purpose |
| --- | --- |
| **Ordered report blocks referencing existing chart IDs** | Present each family’s five analyses as a readable sequence without a new chart engine. |
| **A population-and-state manifest per figure** | Record dataset version, preparation version, base grain, date range, filters, valid N, exclusions, aggregation, and lookup provenance. |
| **Explicit live versus saved-result status** | A live chart changes with filters; a saved result retains its state, data fingerprint, displayed values, and capture timestamp. Static narrative must not silently continue describing a changed chart. |
| **Evidence links and provenance expansion** | Connect a displayed result to source rows and, later, contributing lookup records or source hours. |

For now, place the manifest in a note and record results manually only after computation. Label conditional narrative as conditional. A future saved-result block should preserve the values or rendering as well as settings; a configuration alone is not an immutable result.

---

## 7. Candidates considered but not selected

Eight families were considered in total: the four selected above and the four below.

| Candidate | Primary-source evidence | Decision |
| --- | --- | --- |
| **UCI Bike Sharing** | Public hourly/daily rental data with weather and calendar fields; CC BY 4.0. [Source](https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset). [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/275/bike%2Bsharing%2Bdataset) | **Good reserve.** Lower preparation burden, but duplicates transport/weather/calendar territory already covered more richly by flights and Beijing. |
| **UCI Online Retail** | Invoice-item transactions; publisher reports 541,909 instances and a 22.6 MB workbook; CC BY 4.0. [Source](https://archive.ics.uci.edu/dataset/352/online+retail). [UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/352/online%2Bretail) | **Defer.** Too close to existing shop examples. Cancellation and invoice-line semantics deserve careful treatment, and the fields do not supply a complete customer journey for a valid staged funnel. |
| **UCI Concrete Compressive Strength** | Public experimental numeric data with an explicit reuse license. [Source](https://archive.ics.uci.edu/dataset/165/concrete+compressive+strength). [UCI Machine Learning Repository](https://archive.ics.uci.edu/ml/datasets/concrete%2Bcompressive%2Bstrength) | **Defer.** Useful regression data, but adds less beyond Wine/Penguins/NBA than temporal, geographic, and related-table populations. |
| **UK DfT STATS19 road safety** | Official collision, vehicle, and casualty CSVs, documentation, and Open Government Licence availability. [Source](https://www.gov.uk/government/statistical-data-sets/road-safety-open-data?utm_source=chatgpt.com). [GOV.UK](https://www.gov.uk/government/statistical-data-sets/road-safety-open-data) | **Strong later candidate.** Excellent related tables, but multiple populations, coded fields, severity conventions, and revision handling make preparation more demanding than the initial portfolio warrants. |

These are portfolio deferrals, not unsupported claims that the datasets fail access or licensing gates.

---

## 8. Ranked preparation backlog

Effort below is relative implementation effort, not a delivery-time estimate.

| Priority | Work | Effort | Dependencies and acceptance checks |
| --- | --- | --- | --- |
| **1** | **Prepare the pinned January flight example** | Medium | Export four tables from package 1.0.2; create stable IDs; validate lookup keys; retain unmatched records; prove N and distance invariants; exclude airport metadata. Build F1 and F2 first. |
| **2** | **Create a reusable source/preparation manifest and audit format** | Low–medium | Record URLs, licenses, versions, checksums, grain, predicates, null rules, source counts, derived counts, and key audits. All four families depend on this. |
| **3** | **Prepare Beijing’s 2016 station-day table** | Medium | Inspect archive contents; verify station-hour uniqueness; construct the calendar explicitly; implement the 20-hour rule; preserve coverage and source-hour provenance. Build B1 before pollution comparisons. |
| **4** | **Freeze and normalize the four WDI extracts** | Medium | Download all pages/files; identify aggregate economies through metadata; audit country-year uniqueness and nulls; retain attribution; construct endpoint lookups. |
| **5** | **Prepare the WDI geometry asset** | Low–medium | Pin Natural Earth; retain only needed properties; handle `"-99"` and nonmatches; audit duplicate keys and small/unrepresented economies without dropping base rows. |
| **6** | **Freeze the USGS event extract** | Low–medium | Reconcile query counts, date boundaries, and IDs; record revision timestamps; validate core units/types; implement presence—not unverified error-magnitude—analysis. |
| **7** | **Build compact workspace configurations and inspect interactions** | Medium | Check source traces, own-chart versus other-chart fit behavior, subset denominators, labels, empty states, and actual browser performance. Source inspection is not a substitute for this validation. |
| **8** | **Add the minimal notebook result/state layer** | Medium; future feature | Reuse notes and chart IDs; add ordered blocks, manifests, saved-result distinction, and provenance links. Do not wait for a general notebook platform. |
| **9** | **Replace flattened enrichment with explicit lookups when the shape is approved** | Future dependency | Reuse the same keys and invariants. Do not introduce implicit cross-source filtering or mixed-population views. |

Duplicate-key, deliberately unmatched-key, and altered-value test cases may be useful, but keep them in **separately labeled test fixtures**. Do not modify the reference datasets to manufacture those cases.

---

## 9. Final status and unresolved questions

**Repository status.** Inspected `main` at **`8c35e4db02d9e0efc0842644d4a669e58d10caf8`**, matching the briefing. The reading route included the repository guidance, root/library documentation and package manifests, dataset documentation, catalogue and coverage files, dashboard configuration material, chart registration and saved-state types, both multi-source briefs, notes implementation, and the specified scatter implementation paths. Relevant behavior was checked against source; no installation, test run, visual regression, or performance verification was performed.

**Research status.** Four families are recommended, with exactly five proposed analyses each, four connected notebook outlines, and strong population-preserving lookup plans for flights and WDI. Access, schema, and reuse evidence comes from original publishers and authoritative repositories. Sources were consulted on **October 5, 2026, Indianapolis time**, with some services displaying **October 6 UTC**.

**Data actually inspected.** The complete airline-code CSV; initial aircraft CSV records; publisher-rendered flight-package examples and dictionaries; the World Bank’s documented country-response example; and actual Natural Earth GeoJSON features. Beijing and USGS evidence is documentation-level, not an inspected complete extract.

**Outstanding release gates.** Bulk retrieval and exact subset counts; archive checksums and final byte sizes; full key/null audits; Beijing calendar/timezone clarification; WDI crosswalk coverage; refreshed detailed USGS ancillary-field definitions before using those fields quantitatively; and browser interaction/performance checks. The five earthquake designs above do not require interpreting the unconfirmed ancillary error units.

No files were created, code changed, commits pushed, or pull requests opened.

**The best dataset to add first is nycflights13’s January 2013 flight population, with carrier, aircraft, and weather enrichment and without the airport table.** It offers the strongest single progression from a meaningful current chart demonstration—a real departure-to-arrival Sankey—to dense linked exploration, explicit lookup correctness, and a coherent evidence-backed report. Its natural missing matches also teach the future multi-source model without inventing data or changing the base population.
