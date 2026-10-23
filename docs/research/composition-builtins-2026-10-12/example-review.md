# Every composition example: proposed built-in route

The review covers all **29** delivered composition examples at baseline `269485c6`.
The live documentation example named `composition` aliases `message-log`; it is not a thirtieth design.

Only **covid-compare** clearly warrants composition for its complete analytical arrangement.
**covid-tiles, elections, and banana-yields** warrant composition for their authored layout, while simpler analysis belongs in built-ins.
The other **25** should not require composition as their normal long-term authoring route.
That includes deferred specialist modes; it does not mean all 25 work today or deserve immediate implementation.

Four examples have current analytical routes. Fourteen need bounded extensions, often medium effort.
Seven need five distinct mode or family contracts. Existing charts can host several of those modes.

Each example name links to its full source-based review. The originals preserve detailed evidence, uncertainty, and proof conditions.
See [independent checks](source-checks.md) for what Codex verified and [recommendation decisions](recommendation-decisions.md) for scope.

## Already reachable through built-in charts

| Example                                                                       | Current route                                                                                                  | Remaining difference; composition's role                                                                                             |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [income-life](pro/composition-builtins-review.md#income-life)                 | Scatter: GDP per capita / Life expectancy, Population size, Region color, true log X. Add Country-keyed Notes. | Twelve labels can use current callouts. Bulk labels are convenience. Keep composition for exact artboard output.                     |
| [media-deaths](pro/composition-builtins-review.md#media-deaths)               | Bar: Source groups, Sum Count, Cause split, 100%.                                                              | Preserve each source's denominator. Segment labels and the offset Deaths column are optional presentation work.                      |
| [du-bois-income](pro/composition-builtins-review.md#du-bois-income)           | Bar: Class groups, Sum Share, Category split, 100%.                                                            | Horizontal orientation, boundary connectors, and historical styling differ. Trace the 33 share records, not imagined household rows. |
| [unemployment-stream](pro/composition-builtins-review.md#unemployment-stream) | Calendar Line: monthly Sum of Unemployed (thousands), Industry split, stacked area.                            | The complete 14×122 grid preserves values and totals. Exact wiggle, smoothing, and internal labels can remain composition.           |

These four verdicts concern analytical reachability, not identical graphics or image export.
The first implementation milestone must confirm public authoring, source traces, and restoration before changing their primary teaching route.

## Bounded extensions to existing charts

| Example                                                                       | Built-in route and concrete work                                                                                                             | Essential boundary                                                                                                                                   |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [message-log](pro/composition-builtins-review.md#message-log)                 | Heatmap: Correspondent rows, monthly Date bins, count. Separate limits/order; reach all 72 months; add aggregate color bounds and transform. | Date cells select original messages through an interval and correspondent. Totals and Notes projection can follow.                                   |
| [driving-shifts](pro/composition-builtins-review.md#driving-shifts)           | Scatter: Miles/Gas, Connect observations, Order by Year. Add valid runs and source point/segment access.                                     | Raw Line sorts by X and changes the trajectory. Preserve temporal reversals and omitted-row evidence.                                                |
| [tech-sparklines](pro/composition-builtins-review.md#tech-sparklines)         | Grouped raw-date Line, compact Company facets, shared X/free Y, extrema/latest markers, and scoped change summaries.                         | Medium-to-large cumulative work. Daily range exceeds 2,000 periods; weekly/monthly aggregation changes observations. The delivered layout is a grid. |
| [forecast-fan](pro/composition-builtins-review.md#forecast-fan)               | Repair Line's existing Notes intervals: bounds affect domains, invalid rows split runs, traces retain rows and bound fields.                 | Four existing supplied-bound pairs need no new fan grammar. Two separate measure charts avoid an initial facet-scale dependency.                     |
| [time-use](pro/composition-builtins-review.md#time-use)                       | Box Plot already compares Minutes by Year, faceted by Activity. Add connected cohort quartiles and median-change display.                    | Trace each cohort and earlier-median denominator. Missing cohorts and zero baselines cannot produce a false zero change.                             |
| [measles](pro/composition-builtins-review.md#measles)                         | Heatmap: State/Year, average Rate. Reach 51×85, use supplied row order, explicit value scale, and a projected 1963 Notes guide.              | Present null, absent pair, and measured zero differ. The current CSV's “absent” row is physically present.                                           |
| [causes-by-age](pro/composition-builtins-review.md#causes-by-age)             | Line: numeric Age grouping, Cause split, Sum Count, 100% area. Extend preparation and denominator traces.                                    | Age is not a date. Every age needs its own all-cause denominator; define missing numeric positions explicitly.                                       |
| [consumer-confidence](pro/composition-builtins-review.md#consumer-confidence) | Try existing monthly Average Index split by Country. Then add focus facets with shared axes and peer context.                                | Ordinary facets remove peers. A muted peer must trace its own country, not inherit the focused panel's filter.                                       |
| [pew-meaning](pro/composition-builtins-review.md#pew-meaning)                 | Scatter Paired dots: Share/Topic, named Party roles, no jitter, supplied order, connectors, signed differences.                              | Seven pairs contain imported percentages. Missing or duplicate roles need explicit handling; there is no respondent-level denominator.               |
| [middle-class-jobs](pro/composition-builtins-review.md#middle-class-jobs)     | Scatter: Year/Jobs per 1000, connect by Occupation, Group facets, numerical gender color.                                                    | Fixed bounds, diverging colors, and manual facet order already exist. Supplied Group change is not a new filtered sum.                               |
| [tax-slope](pro/composition-builtins-review.md#tax-slope)                     | Connected Scatter: Year/Tax revenue, Country groups, both-end labels and endpoint ticks.                                                     | Preserve all 34 pairs. Calendar Line's 30-series limit is not a solution. Keep supplied Change distinct from rounded-endpoint subtraction.           |
| [population-pyramid](pro/composition-builtins-review.md#population-pyramid)   | Series Bar: horizontal geometry, mirror one Sex, stable Age order, Sum People, symmetric bounds.                                             | Source People stays positive. Reuse chart-local Year filters; missing age/sex buckets remain distinct from zero.                                     |
| [co2-swarm](pro/composition-builtins-review.md#co2-swarm)                     | Current categorical Scatter supports log CO2, Region, population size, income color, and keyed Notes. Add Swarm placement.                   | Displace only the category coordinate. Drawing, hit targets, and labels share one point plan. Report crowding and log-zero exclusions.               |
| [titanic-mosaic](pro/composition-builtins-review.md#titanic-mosaic)           | Add Width = Share of total to 100% series Bar. Use variable category bounds and tick centers.                                                | Width uses class/grand total; height uses fate/class. Both denominators need the same population and exact traces.                                   |

Connections, intervals, and Heatmap are the first proposed additions. Other extensions remain evaluated candidates, with proof and cost recorded.
Simple settings are preferable only when they preserve the full analytical and interaction contract.

## Specialist modes or families

| Example                                                                   | Coherent built-in capability                                                                                    | Decision before implementation                                                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [lincoln-ridgeline](pro/composition-builtins-review.md#lincoln-ridgeline) | Ridgeline within Box Plot/Violin: common sample grid, raw density height, field-unit bandwidth, order, overlap. | A rotated current violin loses common peak heights. Prove narrow/broad distributions and twelve months first.                       |
| [climate-ridgeline](pro/composition-builtins-review.md#climate-ridgeline) | Reuse Ridgeline with 84 ordered years, label cadence, shared scales, and group-anchored Notes.                  | Prove readability and all group identities. Do not substitute a grouped view that merges most years into Other.                     |
| [yield-gap](pro/composition-builtins-review.md#yield-gap)                 | Split numeric histogram on **Yield gap** and Continent; later a one-row-per-cell Unit counts display.           | The integer fixture has a stacked-category alternative. Ship split bins independently; require evidence that individual cells help. |
| [titanic-waffle](pro/composition-builtins-review.md#titanic-waffle)       | Reuse Unit counts for 1,309 passenger cells, grouped by Class and Fate.                                         | Current count/100% Bar answers survival analysis. Defer cells until exact cell trace justifies density and keyboard costs.          |
| [gdp-bump](pro/composition-builtins-review.md#gdp-bump)                   | Ranked Line with eligible competitor population, tie policy, duplicate handling, and comparison traces.         | Defer. A static Rank column does not reproduce re-ranking under filters. This is a derived-data contract.                           |
| [scotus-timeline](pro/composition-builtins-review.md#scotus-timeline)     | Supplied-lane intervals: Start, End, Seat, labels, stable order, explicit saved as-of value.                    | Evaluate a narrow family. Duration bars lose occupancy and gaps. Exclude automatic packing and project scheduling.                  |
| [stocks-horizon](pro/composition-builtins-review.md#stocks-horizon)       | Relative Line first; later signed folded Horizon bands with explicit baseline and band units.                   | Defer Horizon. A filter currently changes the first-live-row baseline; zero-baseline fallback also changes units.                   |

“New family” describes a distinct numerical/display contract. It does not request seven new Add chart entries.
Ridgelines, unit cells, intervals, ranks, and Horizon are the five shared contracts.

## Where composition earns its role

| Example                                                           | Built-in alternative                                                                           | Why the complete design can remain composition                                                                                                      |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [covid-tiles](pro/composition-builtins-review.md#covid-tiles)     | Ordinary Line facets for state histories; compact panels and shared scales improve comparison. | Geographic addresses and holes convey spatial adjacency. Evaluate a shared tile helper only after ordinary compact facets work.                     |
| [elections](pro/composition-builtins-review.md#elections)         | Current 51×11 Heatmap plus explicit fixed signed color bounds.                                 | The geographic strips add spatial arrangement. The same small helper must serve these and Covid tiles before promoting it.                          |
| [banana-yields](pro/composition-builtins-review.md#banana-yields) | Pivot decade means and recomputed overall mean, linked Heatmap, and Line.                      | One aligned country row combines independent trends, overall means, and shared-color decade cells. A universal rich table is disproportionate.      |
| [covid-compare](pro/composition-builtins-review.md#covid-compare) | Focus/benchmark Line plus a linked full-history view is a useful smaller alternative.          | Every state combines its own and national populations, recent main view, and independently scaled historical inset. Keep this advanced composition. |

The first three cases are conditional: ordinary analysis belongs in built-ins, while the complete arrangement can justify composition.
The last case is the clearest boundary. It requires several simultaneous comparisons inside independently scoped frames.

Preserve teaching value separately from workflow necessity. Retain authored examples and output while adding simpler routes.
Do not reproduce erroneous captions, false absence, log-zero clamping, or unstable baseline claims to achieve visual similarity.
