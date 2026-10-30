<!--
PROPOSED CAPABILITY: implementation acceptance notebook, not runnable at baseline
ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6.
Supply timeline-concurrency-fixture.json rows[].data as the notebook's input rows.
concurrency.*, interval-contributors, the explicit filters JSON-array export form,
and `finding ... timeline ...` require the implementation described in the plan.
This file was authored and checked as a proposal; the repository compiler and
notebook UI were not executed. Do not treat the expected values as an app test.
-->

# Lane A booking occupancy

**Status: proposed notebook syntax for the implementation acceptance case.**

This analysis measures lane A during **2026-01-15, 09:00–09:12 UTC**. Each source
row counts independently, including identical duplicate rows. An interval occupies
time from its start up to, but excluding, its end. The open hold ends at the saved
analytical horizon for this calculation.

The source-population condition is `included = true`. Status labels do not change
membership implicitly. Lane A is an explicit analytical scope. Other source lanes
remain available to the Timeline and to record inspection.

```eda
dashboard "Timeline concurrency - Lane A"

chart timeline @bookings field=lane startField=start endField=end {
  title="Lane A occupancy"
  note="2026-01-15 09:00 to 09:12 UTC; half-open occupancy; threshold 1"
  where.included=true
  concurrency.version=1
  concurrency.enabled=true
  concurrency.window.startMs=1768467600000
  concurrency.window.endMs=1768468320000
  concurrency.threshold=1
  concurrency.measure=rows
  concurrency.scope.kind=lane
  concurrency.scope.value="A"
  filters=[{"type":"interval-contributors","version":1,"field":"lane","startField":"start","endField":"end","window":{"startMs":1768467600000,"endMs":1768468320000},"relation":"active-at","atMs":1768467840000,"laneValue":"A","facets":[]}]
}

finding @conflict_ms timeline chart=@bookings metric=duration-above-threshold target=analysis
finding @interval_ms timeline chart=@bookings metric=total-interval-duration target=analysis
finding @peak_rows timeline chart=@bookings metric=peak target=analysis
```

Lane A has more than one simultaneously active row for **{{conflict_ms}} ms**.
[Review the conflict duration and its exact interval contributors](#finding:conflict_ms).

The sum of the clipped source interval durations is **{{interval_ms}} ms**.
[Review the interval-duration calculation](#finding:interval_ms).

The maximum number of simultaneously active source rows is **{{peak_rows}}**.
[Review the peak segments and their contributors](#finding:peak_rows).

## Exact expected values

- `conflict_ms = 240000`: 4 minutes with lane-A row concurrency greater than 1.
- `interval_ms = 960000`: 16 row-minutes after clipping to the 12-minute window.
- `peak_rows = 3`: three source intervals are active together from 09:03 to 09:05 UTC.
- At the authored selection instant, 09:04 UTC, the exact lane-A contributors are
  fixture rows `A2`, `A3`, and `A4` (current source IDs `1`, `2`, and `3`).
- Across all conflict periods, the involved interval set is `A2`, `A3`, `A4`,
  `A5`, `A6`. That five-row set is a union over time, not five simultaneous rows.

Fixture labels belong to the JSON test envelope. They are not source-data fields
or a new persistent row-identity API. `A3` and `A4` hold identical data and count
as two source rows. The zero-duration event `Z1` contributes no occupancy.

## Finding and selection scope

`target=analysis` reads the Timeline's complete fixed-window analysis of lane A.
It uses the notebook's workspace filters, the owner's `where.` population, and
any explicit facet restrictions. It ignores the owner's interactive selection.
It also preserves notebook local-selection behavior: other charts' clicks do
not change these findings. The authored 09:04 selection therefore highlights
three rows without changing any of the three analytical findings above.

These new findings have an interval-specific result and records explanation.
They are not ordinary row counts or sums of a synthetic source field. Their
values and records must come from the same planner revision. The `share` row-count
comparison is not a supported duration-ratio operation.

## Save, refresh, and reopen expectations

- Accepted horizon, threshold, and analytical scope edits write back to notebook
  source through the existing chart-settings writeback route.
- Interactive clicks and brushes remain transient in a notebook. An authored
  `filters` predicate, as above, restores from source; a later click does not
  automatically rewrite that predicate in the notebook file.
- Changing the analytical window, field mapping, or scope clears an incompatible
  contributor selection. When that predicate was authored in notebook text, the
  same structural edit must remove it from the source as well; otherwise the
  saved predicate would refer to the old contract. This narrow writeback rule
  does not make ordinary selection gestures persistent.
- Reloading uses the same finite UTC horizon and recomputes from current source
  rows. No cached result values or contributor arrays are persisted here.
- A changed source can split the previously selected atomic segment. The saved
  `active-at` predicate still asks which valid lane-A intervals are active at
  09:04 UTC. An already open trace closes when its revision becomes stale.
- Source field names in this fixture are `lane`, `start`, and `end`. Static and
  mounted evaluation must agree for this raw-source case. Calculated fields or
  field-conversion settings require their separately specified evaluator support.

For folder acceptance, retain this `.eda.md` source, flush pending saves, close
the workspace, reopen it through the project folder reader, and recompute the
findings. These are required implementation checks, not checks executed for this
research deliverable.
