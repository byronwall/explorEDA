# Time-series axes: proof-first implementation plan

**Status:** proposed and unapproved. **Research baseline:** `byronwall/explorEDA` commit `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. **Intended handoff:** Codex local integration and review PR on `codex/time-series-axes-research-2026-10-18`. This document does not authorize or claim application changes, repository mutation, a commit, a PR, a library replacement or deployment.

The companion `time-series-axes-research.md` explains the recommendation; `recommendations.json` assigns stable IDs TS-01 through TS-15. All implementation checks below are **UNRUN**. Estimates are engineering judgment for one developer familiar with the repository, excluding review latency; they are not measured delivery promises.

## 1. Proof contract

The next useful release should make the existing line chart tell the truth about samples, units, scale ownership and navigation. Keep React, TypeScript and the existing D3 renderer. Make arbitrary scales a small extension of series state, then prove a bounded presentation before adding dense layouts.

The selected design to prove is:

- `yAxis` remains the primary semantic scale. `yScales` stores only additional named groups. `SeriesSettings.scaleId` defaults to the primary group and replaces `useRightAxis` at a single settings boundary.
- A group owns its visible label, display-unit metadata, linear/log/symlog transform and explicit limits. Primary uses existing `yAxisLabel` plus `yAxis`; extra groups use `label` plus their own settings. The unused `AxisSettings.title` is not an additional label owner. A single resolver supplies domains, guides, readouts, clipping counts and annotation mappings. Focusing another group must never copy its settings into `yAxis`.
- Known-compatible series may share a group. Do not infer a unit from a field name. Preserve an existing unknown-unit shared group without inventing a unit label. An explicit **Own scale** action preserves transform and manual limits. Automatic limits resolve against the new group membership under the same source-domain policy, so the range may change; disclose that change. Joining adopts transform/limits, rejects known incompatible units, and requires explicit measurement declarations or a visible unresolved-unit state. A group label does not establish compatibility or convert values.
- The overlay uses one focused planned Y axis when more than two groups exist. Exactly two groups may use a planned left/right pair when measured width permits it. Hover emphasis, explicit scale focus and row selection are separate states; pointer movement never switches the displayed axis.
- Lanes are a later layout of the same groups: one lane per scale group with shared time. Layout changes do not recompute source domains or clear manual limits.
- Observation source domains use the chart-local source population across facets, independently of shared filters, time zoom and series visibility. Calendar X gains the corresponding full-source stability. Calendar Y keeps the meaningful union of full/current aggregate extents, so a filtered sum/average may expand the range. It may not shrink below the full aggregate baseline or silently aggregate incompatible facet buckets together.
- Calendar remains one metric with a shared Y scale. Keep its existing valid-zero, absent-period and invalid-aggregate distinctions. Multi-scale calendar and independent stacked scales are deferred.
- Original sample records drive exact/nearest/stale/absent/duplicate readout states and source traces. Reduced path geometry never becomes the authoritative sample index.
- Brush remains selection by default. An explicit Select/Zoom mode, time-axis panning and Reset view alter view state without changing row filters. Preserve existing Notes, Alt-trace, keyboard access, draft edits, undo, persistence, Dashboard text and export meaning.

**Rejection rule:** a milestone is incomplete if its UI exists but its ownership, original values, docs, demo, save/undo path or narrow-layout behavior is unproven. Screenshots alone cannot satisfy an interaction or provenance gate.

## 2. Why the proof starts here

These are source findings, not runtime failures:

- `LineChart.tsx` dispatches observation lines and calendar summaries to different renderers. Its observation right-axis rail is custom SVG outside `planAxes`; its limits, true-log behavior, formatting and editing differ from the main axis. `timeSeriesPlan.ts` does not use observation `seriesSettings`.
- Observation hover searches reduced points and then exact-X matches per series. Duplicate X values and independent reduction can make an original sample unavailable or ambiguous in the readout.
- `chartUtils.ts` retains start/min/max per bucket but does not guarantee final samples or source IDs; the large all-equal-X branch reduces to one record. Many short gap-separated segments can evade a global output bound.
- Calendar X currently follows live periods. Y combines full/current aggregate values, with recursion based on scope lengths and caps of 2,000 periods and 30 live categories. The full/current behavior must be retained deliberately instead of promising an invariant aggregate range that is mathematically impossible for some filtered data.
- The packet exposes calls to provider updates, `useChartEdit`, saved-data validation, Notes frames and trace registration, but not all implementations that own these contracts. Those missing dependencies are the first local inspection gate.

Evidence: exact baseline files `packages/explorEDA/src/components/charts/LineChart/{LineChart.tsx,TimeSeriesChart.tsx,timeSeriesPlan.ts,definition.ts}`, `packages/explorEDA/src/components/charts/Axis/{axisPlan.ts,axisBounds.ts,AxisLayer.tsx}`, `packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx`, and `packages/explorEDA/src/lib/chartUtils.ts`; detailed anchors are in the research report. The selected packet is the evidence route, not a runnable checkout.

## 3. Milestones and cut line

| Milestone | Intended result | Estimated effort |
| --- | --- | --- |
| M0 | Confirm ownership and settle two bounded prototype questions | 0.5–1.5 developer-days |
| M1 | Trustworthy original-value inspection and calendar stability | 1–3 developer-days |
| M2 | Named scale groups, focused/paired overlay, truthful range editing and navigation | 3–6 developer-days |
| M3, conditional | Shared-time group lanes | 2–4 developer-days |
| M4, conditional | Long-form irregular observation tags and bounded reduction | 3–6 developer-days |

The core M0–M2 range is **4.5–10.5 developer-days**. M3 and M4 add **5–10** only if their gates are worth the added scope. Do not package all fifteen recommendations as one release. M1 can provide useful value while a difficult scale-identity dependency delays M2.

### M0 — Establish the actual state owners and test the risky assumptions

**Recommendations:** TS-01, TS-02, TS-03, TS-11, TS-12 and TS-15. No public feature ships in this stage.

**Local dependency inspection, before new state:** inspect the provider/filter hooks, draft/editor boundary, saved-data validation/defaults, Dashboard text setting registry, Notes resolution/rendering, chart trace scope, export host and docs live-example registration. The packet points to `providers/DataLayerProvider`, `components/charts/useGetLiveData`, `components/charts/BaseChart`, `components/charts/InPlace/useChartEdit`, `utils/saveDataUtils`, `lib/annotations`, `components/charts/annotations/ChartAnnotations`, `components/charts/trace`, `lib/dsl/settingKeys.ts` and `apps/demo/src/docs/live/examples.ts`. Locate their exact full-checkout implementations; these are identified inspection targets, not inspected behavior.

Record an ownership map for:

- Source population, `localFilters`, shared live selection and facet draw population.
- Saved group assignments/limits versus transient focus/cursor and in-progress gestures.
- Draft begin/apply/commit/cancel, one undo entry per committed edit, and restore after cancel.
- Annotation/guide identity, raw-row and calendar-contributor trace targets, save/reload, Dashboard text and actual supported exports.

**Bounded experiment A — Can a focused axis be understood?** Build a disposable presentation prototype from the report's two-, six- and twenty-series synthetic scenarios. Compare the proposed focused overlay with a full-axis rail and with a small lane layout. Use the same values and domains. At 1280, 783 and 390 CSS px, ask a reviewer to identify a series' scale and unit, read a physical value, identify an outlier and explain what a crossover does and does not mean. Record errors and task completion, rather than assigning an unobserved usability score. Cap this at half a day and one revision.

**Accept A:** every group is reachable without hover; focus changes only axis presentation; unit/range ownership remains visible for unfocused series; no task requires guessing a line's axis. A two-axis layout is allowed only if measured labels leave at least 280 CSS px of readable plot width; this threshold is proposed and must be evaluated here. Narrow layout uses the focused presentation. **Reject A:** persistent axis confusion, hover-induced axis changes, collision with Notes/readouts, or a meaningful series becoming unreachable. If the focused overlay fails after the bounded revision, retain shared-scale overlay and advance a small lanes prototype; do not expand to arbitrary peripheral axes.

**Bounded experiment B — Can identity survive one extra scale?** Using the real store/editor boundary, round-trip a two-group fixture through focus change, one range edit, cancel, commit, undo/redo, Notes projection, original-row trace and supported export. Cap at half a day after dependency inspection. **Reject B:** a secondary edit reaches primary `yAxis`, a draft mutates live settings, any guide ID collides, or source identity must be reconstructed from pixels. Resolve the state boundary before M2.

**Old `useRightAxis` decision:** locate actual saved-settings usage and choose one deterministic ingestion policy. If preservation is needed, normalize once to primary plus one shared additional group. Preserve the old right group's actual auto-range behavior and symlog/linear behavior; copying primary hard limits or a primary true-log transform into it would change meaning. If an intentional breaking settings change is acceptable, document it and repair affected examples explicitly. Do not add schema-version coexistence, migration registries or two render-time axis contracts without demonstrated need. A dangling scale ID must produce a validation error or a clearly reported deterministic repair.

**Exit evidence:** ownership map, explicit legacy-setting decision, two prototype verdicts, fixture identities and the measured paired-axis width criterion. If the local baseline or critical state owner cannot be inspected, stop that implementation branch with the smallest missing path/access remedy. Unrelated M1 fixes may proceed only when their own ownership is established.

### M1 — Make the existing plots trustworthy to inspect

**Recommendations:** TS-01, TS-04, TS-07 and foundational TS-11/TS-12. **Dependency:** M0's source/filter/draft ownership inspection; no arbitrary-axis UI is required.

**Code surfaces:** `LineChart.tsx`, `timeSeriesPlan.ts`, `TimeSeriesChart.tsx`, `timeSeriesTrace.ts`, `TimeSeriesTraceBody.tsx`, `valueParsing.ts`/`dailyRollup.ts` only when an identified parsing inconsistency is confirmed, and the two existing LineChart test files. Introduce a small pure original-sample resolver near the chart only if extracting it makes provenance and duplicate policy testable; do not invent a generalized query framework.

**Proofs:**

- Against original records, a cursor value reports original numeric value, unit/display formatting, actual sample time and row ID. At a missing/unaligned timestamp, show the declared exact/nearest/stale/absent state. A nearest value must disclose its sample time and time delta. Duplicate timestamps expose all candidates or an explicit count plus a route to them; no silently authoritative first record.
- Keyboard and pointer reach the same evidence in the header/readout convention. Hover remains transient. Alt-click/Alt+Enter trace and row/bucket selection remain separate actions.
- Calendar full-source X endpoints and week positions remain stable under other-chart filters and own selection. An empty live view retains a meaningful source window and an honest no-data state. A view limit is a view operation, not an aggregation or row-selection change.
- Calendar gaps, invalid buckets, observed zero and eligible count/sum zero-fill remain distinct. Average missingness is never zero-filled. Verify numeric-date field discovery versus actual parser input before promising numeric timestamps work in Calendar.
- Source/current aggregate-domain union remains correct for signed sums and averages. Test content-changing equal-length populations; do not rely only on array length to decide whether baseline aggregation is needed. A capped full plan cannot silently erase the baseline-domain promise.

**Acceptance:** readout/trace expected IDs and values match exact fixture records after filtering and reduction; weekly positions remain stable; keyboard reaches the same states; existing calendar contributors and stacking meaning survive. **Rejection:** a readout is sourced only from retained vertices, absent weeks slide out of the X domain after a linked filter, filtered averages are clipped by an overstated stability rule, or missingness becomes a numerical zero without the chosen policy.

**Docs and demos ship with M1:**

- `apps/demo/src/docs/pages/line.mdx`: sections **Observation lines and Calendar summaries**, **Read original values**, and **Missing calendar periods and stable ranges**.
- `apps/demo/src/demos/examples.ts`: proposed IDs `line-original-values` and `line-calendar-missing-weeks`.
- `apps/demo/src/demos/dashboardSettings.ts`: reproducible observation/linked-filter and weekly-sales dashboards with disclosed synthetic data.
- `apps/demo/src/demos/coverage.ts`: coverage entries for original sample inspection, missing/invalid/zero states, calendar selection and stable X scope.
- `apps/demo/src/docs/live/examples.ts`: register the examples used by those docs after M0 confirms the actual registry shape. The file was identified but not included in the source packet.

### M2 — Add scale groups through the complete existing chart contract

**Recommendations:** TS-02, TS-03, TS-05, TS-06, TS-11 and TS-12. **Dependencies:** M0 identity prototype and M1 original-record inspection.

**Code surfaces:** `LineChart/definition.ts`, `LineSeriesSettings.tsx`, `LineChartSettingsPanel.tsx`, `LineChart.tsx`, the proposed pure scale-group resolver, `Axis/{axisPlan.ts,axisBounds.ts,numericScale.ts,AxisLayer.tsx}`, `InPlace/useAxisEditing.tsx`, and `types/ChartTypes.ts`. Change provider/save/DSL/Notes/export files only where M0 finds the real ownership seam. Calendar's scale schema remains single-metric/shared-Y.

**Required state and identity tests:**

- Primary settings remain in `yAxis`; additional groups exist only in `yScales`. Focus A → B → A changes no settings/domain. An edit to B changes only B. Titles, formatted values, axis-guide IDs, clipping badges and Notes all name B. Never use `focusId` as the identity of a source series.
- Two compatible sensors may share a group; **Own scale** forks only the intended assignment, preserving transform and explicit manual limits. With automatic limits, resolve the new membership against the same source-domain policy and show its changed range before commit; this is not fitting to a visible time window. Source values stay unchanged. Rejoining is explicit. Name changes do not change stable IDs. Removing/re-adding series and deleting an assigned group follow the declared policy.
- Source domains are invariant under shared filters, own row selection, hide/show and time zoom. `localFilters` change the chart's source population deliberately. Facets share the declared source-domain baseline. Manual limits win as view clipping and never remove contributor records.
- Range editing is reversible and group-specific for finite one-sided/two-sided limits. Cover empty/constant groups, all invalid, extreme magnitudes, inverted bounds, true log with zero/negative records, and symlog. Log exclusions and manual clipping are distinct reported states. Original values and IDs remain traceable, even when unpainted.
- Existing Notes reference lines, intervals and row attachments use their owning group; legacy left/right bindings map deterministically. Time-only notes remain independent of Y focus. Calendar bucket Notes retain aggregate semantics. Lanes are not data facets.
- Default brush still selects. Zoom mode only changes the time viewport; X-axis pan and Reset view do not clear filters. **Reset range** clears only the named group/end; **Reset time view** clears X limits; **Reset view** clears X plus all groups used by the active renderer in one explicit action: primary and extras in Observations, only shared primary in Calendar; dormant extras remain unchanged. Every reset preserves assignments, transforms and filters. Prove a one-group reset while a second group retains a manual bound. Escape cancels; one completed drag is one undo entry. A selected row does not become the focused group by accident.

**Presentation gates:** exactly two groups may use paired planned axes only if the measured layout criterion from M0 passes. More than two groups always use one focused planned axis with explicit group/units/range and a reachable series-group list. At 390 CSS px the plot/readout is usable without horizontal page scrolling or clipped controls. Long titles and units must not silently disappear; truncated text has a keyboard-reachable full label. Focus is deliberate and transient; hover only emphasizes.

**Acceptance:** the mixed-unit and same-unit-outlier scenarios pass value, ownership, selection, limits and crossover tasks; semantic settings survive save/reload and supported Dashboard text; no Notes, trace, draft, undo or export regression. Exported overlay includes every visible series' scale ownership/range/transform or refuses an ambiguous snapshot with an actionable alternative. **Rejection:** any unknown unit is inferred from a name, focus mutates `yAxis`, guide IDs collide, filters alter source ranges without the stated aggregate exception, keyboard cannot focus a group, or an exported image implies a single shared magnitude scale.

**Docs and demos ship with M2:**

- `apps/demo/src/docs/pages/line.mdx`: sections **Shared and independent scale groups**, **Focus a scale**, **Ranges, log values and clipping**, **Select versus zoom**, and **Save and share scale meaning**. Explain that a crossover under different scales does not imply equal values.
- `apps/demo/src/demos/examples.ts`: proposed IDs `line-mixed-units-scale-groups` and `line-same-unit-outlier`.
- `apps/demo/src/demos/dashboardSettings.ts`: temperature/pressure/flow, six sensors with one outlier, a linked filtering companion, and Notes/range examples.
- `apps/demo/src/demos/coverage.ts`: group assignment, ownership, transform/limit, focus, row selection versus zoom, keyboard, persistence and export coverage.
- `apps/demo/src/docs/live/examples.ts`: register both examples for the accompanying documentation.

**Mode transition gate:** extra `yScales` and observation `scaleId` assignments remain dormant in Calendar. The proposed primary `yAxis`/`yAxisLabel` are shared: Calendar display changes currently force a linear transform, and metric changes can clear the label. Prove and document Observations → Calendar → Observations with manual bounds, log/symlog, labels, Notes and each series assignment. Do not claim exact restoration of primary settings. Calendar must derive unit meaning from its selected metric, ignoring unrelated observation-unit metadata. Separate primary configurations per mode require a further ownership decision.

### M3 — Add shared-time lanes only after the group model proves useful

**Recommendations:** TS-08 plus TS-11/TS-12. **Dependency:** accepted M2; M4 is not required for a wide-field lanes example.

**Code surfaces:** observation `LineChart.tsx`/its extracted render plan, settings panel, group resolver, axis plan/layer and group-aware Notes/trace projection. Reuse group IDs; do not introduce a lane-scale registry.

**Proofs:** overlay ↔ lanes keeps every domain, manual bound, row ID and time viewport; one lane owns one group; several same-group sensors remain directly comparable within that lane. Cursor time is shared and each readout retains its own actual sample time/status. A filter/selection or Notes action reaches the same source records in either layout. Lanes stay distinct from data facets, with collision-free IDs when both exist.

**Acceptance:** six sensors and the mixed-unit case become easier to identify without losing timing, keyboard reachability or magnitude interpretation; twenty groups remain reachable by vertical navigation and a clear focus/readout list. Scrolling must not trigger chart selection or pan. Export captures the declared complete layout or clearly labels a partial view. **Rejection:** automatic domain changes on layout switching, a single “stack” of independently scaled additive areas, unbounded tiny lane heights, unreachable offscreen content, or silent omission of lanes in output. If M3 fails, keep M2 as the shipped design.

**Docs and demos ship with M3:**

- `apps/demo/src/docs/pages/line.mdx`: **Compare in shared-time lanes**, including group-versus-facet meaning and magnitude/timing tradeoffs.
- `apps/demo/src/demos/examples.ts`: proposed ID `line-shared-time-lanes`.
- `apps/demo/src/demos/dashboardSettings.ts`: the same synthetic wide-field sensor dataset shown in overlay and lanes, with unchanged source domains.
- `apps/demo/src/demos/coverage.ts`: group lanes, shared time, facet interaction, scroll/keyboard and complete export coverage.
- `apps/demo/src/docs/live/examples.ts`: register the lanes example with the docs.

### M4 — Support long-form irregular tags and prove density without losing evidence

**Recommendations:** TS-09 and TS-10 plus TS-04/TS-11/TS-12. **Dependencies:** M1 and M2; add the lanes presentation only after M3 passes. This is observation-mode work, not a calendar-summary workaround.

**Code surfaces:** `LineChart/definition.ts`, observation field/settings panels, the original sample/series plan, `LineChart.tsx`, `chartUtils.ts`, and the existing trace/selection adapter. A proposed `observationSplitField` combines one numeric measure with a tag/category to create raw series with stable identities. Confirm naming against the existing calendar setting so the two renderer contracts stay explicit.

**Proofs:**

- A twenty-tag long table preserves each original `(row ID, tag, timestamp, value)` without pivoting away duplicates. Reordering source rows does not change chosen series identity or duplicate policy.
- Deliberate nulls break paths. Long elapsed gaps break according to a declared cadence/maximum-gap policy; the chart does not invent an outage threshold from visual density. Default lines do not imply interpolation is an observed value. Test linear and step forms only where semantically justified; smooth interpolation remains optional/deferred.
- Rendering reduction retains original first/last and local extrema indices or passes an equivalent defined fidelity contract. Preserve segment boundaries. Test all-equal-X duplicates both below and above the reducer threshold; width changes cannot change which records are traceable.
- Cursor/selection/Notes/trace use originals after reduction. In a downsampled interval, a selected or inspected source record resolves exactly even if it is not a rendered vertex. Display a reduction summary when the geometry is reduced.
- View zoom reveals the needed detail without changing source Y domains; timestamps retain physical spacing. The reduction budget accounts for all short segments and all series, not only points per individual segment. Avoid large spread-argument extrema scans where they can fail on bounded stress fixtures.

**Acceptance:** the twenty-tag irregular scenario meets the original-record and gap contracts plus the performance budget below. The implementation exposes a tested supported envelope and a clear density/cap state outside it. **Rejection:** sample values come from averages without an explicit aggregation, extrema disappear under the claimed guarantee, final/duplicate records become inaccessible, null breaks reconnect, UI locks during hover, or the implementation introduces historian ingestion/live streaming to solve a static-table task.

**Docs and demos ship with M4:**

- `apps/demo/src/docs/pages/line.mdx`: **Raw tags in long-form data**, **Irregular samples, duplicate timestamps and gaps**, and **Dense data and source fidelity**.
- `apps/demo/src/demos/examples.ts`: proposed ID `line-irregular-process-tags` with a disclosed deterministic synthetic dataset.
- `apps/demo/src/demos/dashboardSettings.ts`: twenty irregular tags, a deliberate gap/duplicate trace case, and a dense-view/detail-view lesson.
- `apps/demo/src/demos/coverage.ts`: long-form observation grouping, duplicate/timestamp states, gap policies, reduction fidelity and supported performance envelope.
- `apps/demo/src/docs/live/examples.ts`: register that same example; avoid a docs-only dataset that differs from the tested demo.

## 4. Fixture and result ledger

S1, S2 and S4 use the exact synthetic values and walkthroughs in `time-series-axes-research.md`; S3's canonical generator is specified in full below. Copy these contracts into Codex's local proof fixtures; record the fixture record keys and corresponding provider row IDs, timestamp basis, actual row count and SHA-256 before measuring. All data are synthetic. The generator is fixture preparation, not application implementation or a passed renderer proof.

| Fixture | Must prove |
| --- | --- |
| S1: temperature, pressure and flow | Three distinct units/ranges, explicit group ownership, exact values, non-equivalence of crossovers, focused axis and Notes/range behavior |
| S2: six same-unit sensors, one of them an outlier | Shared-scale magnitude comparison remains available; explicit own-scale action improves detail without hiding that the outlier is larger |
| S3: twenty irregular process tags | Long-form raw identity, unrelated timestamps, missing/stale/duplicate states, elapsed-time gaps, density and keyboard reachability |
| S4: weekly sales calendar summaries | Stable full-source week positions; observed zero versus absent/invalid periods; correct count/sum/average semantics and exact contributors |

### Exact small-fixture values

S1 and S2 both use six one-minute timestamps beginning `2026-01-01T12:00:00Z`. S1 declares °C, bar and L/min for its three fields; all S2 fields declare °C. Array position is the minute index. These are the same values as the report:

```json
{
  "S1": {
    "minute": [
      0,
      1,
      2,
      3,
      4,
      5
    ],
    "Temperature_C": [
      180,
      182,
      189,
      184,
      181,
      180
    ],
    "Pressure_bar": [
      3.0,
      3.05,
      3.4,
      3.2,
      3.05,
      3.0
    ],
    "Flow_L_per_min": [
      900,
      920,
      980,
      870,
      900,
      910
    ]
  },
  "S2": {
    "T1": [
      20.0,
      20.2,
      20.1,
      20.4,
      20.2,
      20.1
    ],
    "T2": [
      20.1,
      20.3,
      20.2,
      20.5,
      20.3,
      20.2
    ],
    "T3": [
      19.9,
      20.1,
      20.0,
      20.3,
      20.1,
      20.0
    ],
    "T4": [
      20.2,
      20.4,
      20.3,
      20.6,
      20.4,
      20.3
    ],
    "T5": [
      20.0,
      20.1,
      20.0,
      20.2,
      20.1,
      20.0
    ],
    "T6": [
      20.1,
      20.2,
      20.1,
      80.0,
      20.2,
      20.1
    ]
  }
}
```

S4 declares USD sales and Monday-start UTC weeks. Use `date` for time and `channel` for Calendar split. The null is a present record with no valid sales measure; it is not an absent row.

```json
[
  {
    "id": "s1",
    "date": "2026-01-05",
    "channel": "Web",
    "sales": 100
  },
  {
    "id": "s2",
    "date": "2026-01-06",
    "channel": "Web",
    "sales": 200
  },
  {
    "id": "s3",
    "date": "2026-01-05",
    "channel": "Store",
    "sales": 50
  },
  {
    "id": "s4",
    "date": "2026-01-19",
    "channel": "Web",
    "sales": 0
  },
  {
    "id": "s5",
    "date": "2026-01-20",
    "channel": "Store",
    "sales": null
  },
  {
    "id": "s6",
    "date": "2026-01-26",
    "channel": "Web",
    "sales": 120
  },
  {
    "id": "s7",
    "date": "2026-01-27",
    "channel": "Store",
    "sales": 80
  }
]
```

S1's 12:02 values are 189 °C, 3.40 bar and 980 L/min; a 950 L/min maximum clips one sample. S2's shared extent is 19.9–80.0 °C, its five-peer extent is 19.9–20.6 °C, and the minute-3 T6–T1 difference is 59.6 °C. S4's first-week Web/Store sums are 300/50, January 12 has no records, January 19 has Web zero and invalid Store sales, and January 26 is 120/80. Web's first-week average is 150 and becomes 200 when filtered to s2. Its X reference spans January 5 through the exclusive February 2 boundary. These expected numbers do not establish a renderer pass.

### Exact S3 generator and expected invariants

Generate tags in index order, then samples in index order. `rowKey` identifies the fixture record; the app's provider row ID remains a separate mapping. The time origin is UTC. There is no random seed because every operation is deterministic. Units below are explicit fixture declarations, not inferred from tag names.

```python
from datetime import datetime, timedelta, timezone

def irregular_tags(sample_count=60):
    assert sample_count >= 60
    origin = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    rows = []
    for j in range(20):
        unit = "°C" if j <= 6 else "bar" if j <= 13 else "L/min"
        for k in range(sample_count):
            if j == 0 and 20 <= k <= 25:
                continue  # Absent observations; do not insert null padding.
            seconds = k * (17 + j) + (7 * k + 3 * j) % 5
            offset = (11 * k + 5 * j) % 9 - 4
            if j <= 6:
                value = (1800 + 20 * j + offset) / 10
            elif j <= 13:
                value = (200 + 10 * (j - 7) + offset) / 100
            else:
                value = 800 + 25 * (j - 14) + 2 * offset
            if j == 3 and k == 40:
                value += 40  # One existing °C sample becomes the spike.
            if j == 1 and k == 30:
                value = None  # Present record, explicitly invalid measure.
            row = {
                "rowKey": f"tag{j:02d}-s{k:03d}",
                "Timestamp": (origin + timedelta(seconds=seconds))
                    .isoformat().replace("+00:00", "Z"),
                "Tag": f"Tag {j:02d}",
                "Value": value,
                "Unit": unit,
            }
            rows.append(row)
            if j == 2 and k == 10:
                rows.append({**row, "rowKey": row["rowKey"] + "-dup",
                             "Value": round(value + 5, 6)})
    return rows
```

Expected with `sample_count=60`: **1,195 records**, **20 tags**, **1 present null**, and exactly one within-tag duplicate timestamp pair. Tag 0 has 54 records; tag 2 has 61; every other tag has 60. `tag02-s010` is **183.9 °C** and its duplicate is **188.9 °C**, both at **12:03:11Z**. `tag03-s040` is the **226.1 °C** spike at **12:13:24Z**. Tag 0's gap from sample 19 at **12:05:26Z** to sample 26 at **12:07:24Z** is **118 seconds**, so its declared 90-second maximum connection gap breaks the line. Tag 1's null at **12:09:03Z** remains an invalid sample with a traceable record.

Use Value as the sole observation measure and Tag as the proposed `observationSplitField`. Explicitly choose **Own scale for each tag** to test twenty groups/lanes; grouping only by unit would produce three groups and would not test that presentation. Inspect Tag 02 at its duplicate time, Tag 03 at the spike, and a shared cursor time that is exact for one tag but asynchronous for others. Show every actual sample time and offset. Set any nearest-sample tolerance explicitly before asserting a nearby/missing result.

The same generator with `sample_count=5000` has **99,995 records** after the six deletions and one duplicate; record that count when using the nominal 100,000-sample stress case. It is a density extension, not additional observed plant data. No renderer or performance result follows from generating these rows.

### Minimal adversarial fixtures

Add only these small adversarial cases when the canonical fixtures do not cover the failure:

- **Duplicate timestamp:** rows `dup-a=(t=0,y=4)` and `dup-b=(t=0,y=9)`, plus one later row. Both IDs remain inspectable. Expand past the reduction threshold with additional same-X rows containing known min/max; width changes must not destroy those extremes or duplicate access.
- **Asynchronous samples:** A at 00:00 and 00:10; B at 00:03 and 00:13. Inspect 00:10. A is exact; B's result must follow the chosen declared nearest/stale/absent rule and report 00:03 or 00:13 explicitly. Do not imply both were measured at 00:10. Set the proof's tolerance explicitly before running it.
- **Log and clipping:** original values `[-2, 0, 1, 10, 100]`; log state reports two nonpositive omissions. Limits `[2,50]` distinguish remaining positive records outside the view. Every record remains available to trace. Symlog permits signed values with disclosed transform.
- **Filtered average:** one bucket with values `[0,100]` has full average 50; selecting only 100 yields 100. The calendar Y union must include 100 while retaining the full baseline. Use two different same-length selected populations to expose length-only invalidation mistakes.
- **Faceted averages:** facet A has `[0,100]`, facet B has `[400,600]`. Reference bucket means are 50 and 500; union those extents without collapsing all four rows into a 275-valued bucket. Apply a linked subset and preserve the facet × split × period aggregate grain.
- **Signed sum:** one bucket with `[-100,101]` has full sum 1; the positive-only filtered subset sums to 101. Keep its aggregate-domain expansion visible and preserve both source contributors in the full-population trace.
- **Weekly missingness:** retain one populated first and last week while another chart filters away their contributing rows. The X window stays at the full-source boundaries. A truly absent interior week and a present invalid-measure week must have different trace explanations.

For each proof record expected IDs/value/domain, actual result, selected renderer/mode, viewport, pointer/keyboard route, relevant settings JSON and status. **UNRUN** means no pass/fail conclusion. A screenshot or old test name is not a substitute for an actual result.

## 5. Cross-cutting acceptance gates

### Numerical and source identity

- For every rendered or inspected series, original row IDs resolve to the same source records before/after group reassignment, focus change, range edit, filtering, layout change, reduction, save/reload and export where export contains data.
- Calendar inspection names the period interval, aggregation, used/total contributors and missingness state. A period midpoint is not presented as a raw acquisition timestamp.
- Value comparisons use the right group's units/transform; chart-spanning guides and Notes carry explicit owning identity. Group and facet keys cannot collide in guide IDs, React keys, trace targets or selection actions.
- No display transformation changes exported raw data, original trace values or source inclusion without an explicit operation. Manual clipping does not become a data filter.

### State ownership, persistence and undo

- Confirm the actual save schema, validator/defaults and Dashboard text registry discovered in M0. Round-trip nonprimary limits/label/unit/type, group assignments, intended saved layout and all existing styles/Notes. Do not add transient cursor/hover state to saved settings.
- Verify new chart, edited chart, draft preview, imported chart, renamed/deleted field and unresolved group reference. A bad reference must not silently borrow an unrelated unit scale.
- A committed range/group/layout action is one sensible undo entry; Escape/cancel restores exact prior state. Focus/hover produces no settings writes or undo churn. Verify interaction against the real store, not only a mocked callback.
- Test actual supported export routes discovered locally, including Copy PNG if present, rather than assuming an SVG screenshot proves export parity. Static output must show all required scale mappings, clipped/log states and layout coverage; raw-data export retains IDs/values where supported.

### Keyboard, pointer and responsive behavior

Run the actual demo with real keyboard and pointer input at **1280, 783 and 390 CSS px**. Record browser, OS, zoom level and any screen-reader pairing. Automated synthetic events can support unit coverage; they do not satisfy this browser gate.

- Reach every group/series control and every inspectable value without hover. Visible focus, accessible names and text identify group, unit, scale type, current limits and duplicate/missing state. Color alone never owns axis attribution.
- Verify Tab, arrows, Home/End where offered, Enter/Space, Escape and Alt+Enter/Alt-click. Preserve page scrolling, text entry and modifier-key behavior. A zoom gesture never becomes row selection because a control loses focus.
- Verify long labels, narrow readout wrapping, axes, clipping badges, Notes and group selectors. No essential value/control is cropped. The viewport must not silently switch a chart's semantic group assignment or domain.
- Run one keyboard/screen-reader pass of scale focus → range edit → cancel → original-value inspection → trace. Report the actual tested pairing; do not claim general WCAG conformance from a component attribute.

### Bounded performance measurements

These are **proposed acceptance budgets**, not observed results or third-party benchmarks. Record the hardware/browser and retain the baseline measurement so a target can be revised transparently if the device is materially constrained.

Use one small baseline (2 × 500 raw samples), one ordinary comparison (6 × 10,000 samples) and the twenty-tag case (20 × 5,000 irregular samples). Include explicit null segments and duplicates. One optional 1,000,000-row stress fixture is permitted only to reproduce reducer/allocation failure risk; it does not become a supported-product promise.

- Measure five fresh constructions and twenty repeated cursor/zoom interactions after one declared warm-up. Report median/p95, long tasks, maximum rendered point count and peak memory when the browser exposes reliable measurement. Do not compare renderer libraries without the same workload and contract.
- Candidate budgets on the declared test laptop for the 100,000-sample target: first usable plot within **2 seconds**, original-value cursor/readout **p95 ≤ 50 ms**, committed zoom/pan response **p95 ≤ 250 ms**, and no interaction-caused main-thread stall over **250 ms**. These budgets may trigger further investigation; they are not an assurance of universal device performance.
- Under reduction, cap points across the whole chart using a documented formula that accounts for width, groups and gap segments. Report what happens when preserving every gap/extremum exceeds that budget; an explicit supported-limit response is preferable to claiming an impossible fidelity/performance guarantee.
- Stop after the bounded matrix passes. Broaden testing only to resolve a concrete failure, such as all-equal-X loss, many-gap point growth, or expensive full/current aggregate planning.

## 6. Unrun command sheet for Codex

Run from the verified full local checkout with the repository's required Node/pnpm environment. The selected packet cannot execute these commands. Extend existing test files for new behavior; the sheet below does not pretend that new tests already exist.

```bash
# Focused existing observation/calendar tests; add meaningful cases in these owners.
pnpm --filter exploreda exec vitest run src/components/charts/LineChart/TimeSeriesChart.test.tsx src/components/charts/LineChart/LineChart.test.tsx src/components/charts/LineChart/areaCharts.test.tsx

# Type gate for the library and changed settings/axis contracts.
pnpm --filter exploreda check-types

# Start the real demo; perform the 1280, 783 and 390 CSS px browser proofs.
# Stop this foreground server with Ctrl+C before continuing in this terminal.
pnpm --filter demo dev

# Run the repository-wide gate once a milestone is otherwise ready for review.
# Keep builds sequential and investigate failures before claiming completion.
pnpm check
```

The focused command includes `areaCharts.test.tsx` because calendar-domain changes can affect additive/shared-scale and missing-stack semantics. Locate the exact test and UI-quality command wiring in the full checkout before adding gates; no unseen test filename or passing command is claimed here.

## 7. Explicitly deferred work and reopening conditions

- **TS-13 — Normalized/indexed overlays:** defer until a concrete comparison task cannot be solved adequately with groups/lanes. A later proof must define the baseline/reference population, handle zero/constant/nonpositive cases, keep original values visible and show how zoom/filtering affects normalization. Do not smuggle min/max normalization into Own scale.
- **TS-14 — Synchronizing separate chart views:** defer until users need coordinated cursors/viewports across independent charts. Prove separate viewport/cursor state, no shared-filter feedback loop, source timestamp alignment and disposal; shared-time lanes are the bounded first route.
- **TS-15 — Renderer replacement:** keep D3. Reopen only for a measured inability to meet the accepted fidelity/performance/accessibility contract at a worthwhile workload. Compare one selected-version library in a bounded spike with all existing trace, Notes, filter, draft, undo, export and licensing constraints. Arbitrary scale primitives alone are insufficient reason.
- **Multi-scale Calendar, multiple calendar measures, independent stacked areas, automatic unit conversion, local-time/subdaily aggregation, smooth interpolation by default, annotation redesign, historian ingestion and live streaming:** out of this implementation sequence. Each needs a new product requirement and proof; none is required to finish the selected core.

## 8. Handoff and truthful completion record

Research actually performed: packet manifest/size/SHA-256 verification by the root workflow; static reading of selected source/docs/tests; current primary-source web research and source-limit review; independent synthetic arithmetic and exact S3 generator checks. The arithmetic verified the stated cursor values, extents, clipping count, duplicate/spike values, 118-second gap, 1,195-row fixture, 99,995-row density extension and weekly sums/averages. These checks executed only fixture preparation and arithmetic, not application code. Source paths and the baseline were established through the attached permitted packet. No application tests, type checks, builds, live browser proofs, export round trips, save/undo experiments or performance measurements ran during research.

Codex should classify every TS recommendation as **adopt, investigate, defer or reject** before local integration, preserving this proposed disposition separately from the eventual decision. Each accepted visible milestone must include its docs section, demo registration, actual proof results and any material limits in the review PR. Do not report a milestone complete while a numerical, ownership or source-trace rejection gate remains open.

No research blocker is implied by an unrun implementation proof. Missing local dependencies, unchosen legacy-settings policy, untested export coverage and unmeasured dense interactions are explicit **implementation entry gates**. Stop expanding scope once the ranked questions and these gates have useful answers.

### Final delivery validation

Completed research-package checks: strict UTF-8 decoding, complete JSON parsing, fifteen unique sequential recommendation IDs with unapproved status and unrun implementation proofs, valid embedded fixture JSON, balanced Markdown fences, companion-link and source-ID consistency, and reconciliation of the 34-path source inventory. External citation links were checked against the primary-source ledger; this does not claim that the unavailable GitHub baseline route became accessible.

The four companion files' byte sizes and SHA-256 hashes match `manifest.json`. The ZIP contains exactly those four files plus the identical standalone manifest; archive CRC checks and the archived payload hashes pass. The manifest excludes its own hash and the enclosing ZIP hash to avoid circular self-hashing. These are packaging checks, not application behavior tests.
