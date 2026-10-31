# Build regional comparisons with explicit exposure

Build a saved grouped-rate query that supplies the map, ranked table, and notebook finding from one evaluated result.
Ship prepared regional totals first, then event records with a separate exposure input and explicit numerator filters.
The [implementation plan](../../intent/regional-rate-comparisons/implementation-plan.md) gives four useful release milestones.

Topic R016 scored **17/20**: capability 5, Pro advantage 4, buildability 4, momentum 4.
The [run record](run.md) compares four candidates and records the submitted baseline and continuation.
This new Design mission supersedes the earlier outside-demand gate for the geographic feature.

The key arithmetic is visible in the synthetic fixture:

| Region | Events                         | Exposure | Rate per 1,000 |
| ------ | ------------------------------ | -------- | -------------- |
| A      | 12                             | 1,200    | 10             |
| B      | 8                              | 200      | 40             |
| C      | 0, complete collection         | 400      | 0              |
| D      | 0 observed, collection unknown | 500      | Unavailable    |

A leads by count; B leads by rate. The A+B pool is **100/7**, while the mean rate is **25**.
Repair-only filtering changes N while D stays fixed. A+B+C then pools to **25/9**.
Including D makes the complete pool unavailable; it must not silently disappear.

Keep typed region keys, observation windows, population identity, geometry version, and exposure uniqueness explicit.
Preserve each input's candidates, contributors, exclusions, and coverage evidence.
Distinguish a loaded-empty source from a missing file. Pin rate geography during zoom.
Use saved reference colors with disclosed overflow and explicit rebase.

The local code review confirms the main seams and resolves Pro's open host/worker questions.
Reuse `ExplorEdaProject.onProjectChange`, its trace context, and the existing request-ID worker coordinator.
Carry full evaluation and source availability through notebook loading and mounting.
See [evidence](evidence.md) and [all 23 local dispositions](decisions.md).

Primary-source checks support explicit rate inputs and filter ownership:
[ArcGIS rate calculation](https://doc.esri.com/en/arcgis-pro/latest/tool-reference/spatial-statistics/calculate-rates.html),
[Tableau filter order](https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_lod_filters.htm), and
[Census estimate vintages](https://www.census.gov/programs-surveys/popest/data/tables.html).
The full report compares ArcGIS, QGIS, GeoDa, and Tableau.

Pro finished in 22m28s in [the recorded conversation](https://chatgpt.com/c/6ae5a920-2a18-83ea-84be-25b88b06d492).
All eight originals are preserved in the [asset index](../../intent/regional-rate-comparisons/assets/pro-results/README.md).
Local checks pass 439 independent fixture anchors across 46 cases, without running supplied code.
Pro's reported 2,849 verifier assertions and contract syntax check remain Pro evidence.

Open implementation choices are the compact setup layout, the exact text grammar, and performance limits for large evidence sets.
Use existing field pickers, temporary trace surfaces, project callbacks, and folder saving.
Explore interval methods and eligible-entity proportions separately. No feature or browser acceptance is claimed by this research PR.
