# First proof — results (2026-10-11)

## 1. How much export noise each fix removes

All 57 demo examples (58 saved views) were measured with `measure-corpus.test.ts.txt`. To rerun it, copy it into `apps/demo/src/`. The raw numbers are in `measure-corpus.json`.

| Step                                                         | Pairs |              Change |
| ------------------------------------------------------------ | ----: | ------------------: |
| Today's export                                               | 7,431 |                   — |
| Fill partial saved objects from type defaults before diffing | 6,728 |               −9.5% |
| Also treat the demo house style as defaults                  | 5,185 |          −30% total |
| … of which `composition.*` paths                             | 3,308 | 64% of what remains |
| Chart blocks repeated verbatim across views                  |   145 |                  2% |

- **Normalization is safe:** after filling partial objects, all 58 of 58 views round-trip exactly.
- **The "default noise" is mostly real data.** The demo builds charts from its own house style in `apps/demo/src/demos/dashboardSettings.ts`: margin 16/24/44/62, 4 y gridlines, y grid on, rows 22/36, 20 bins, and partial `{grid}` axis objects. The library defaults in `utils/defaultSettings.ts` are margin 20, 5 gridlines, and rows 30/50. Export was right to write those values. Removing them means either changing the library defaults or changing the examples.
- **Composition breakdown:** about 850 of the 3,308 pairs (26%) are IDs, kinds, `*ScaleId`, `unitId`, `markId`, `calcId`, and `[]=` markers, all of which the new syntax removes. Another 461 (14%) are text styles equal to the usual value for their role (title 24/700/#1f2328, subtitle 13/400/#5f6368, note 10/400/#5f6368, x=32). Text widths follow the artboard (896, 696, 736).
- **Defining charts once** pays off less than assumed. It's still worth having for views that differ only by overrides.

## 2. Layout matrix coverage

- With even splits and at most 6 cells per line, 48 of 58 views (83%) fit exactly. That passes the ~80% threshold.
- With up to 12 cells per line, 58 of 58 fit, but those lines are unreadable.
- **The misses:** 9 of the 10 are uneven 7/5 splits (box-plot, nba-stats, income-life, two penguins views, scatter-surfaces, and others). The tenth combines 3/4/5/8 widths.
- **The cold agent hit the same wall.** It wrote a 12-cell line to get 8/4, and used `at=` for 7/5.

## 3. Cold-agent authoring

A fresh agent got only `reference-v0.md` and `briefs.md`. It produced 6 drafts in 169 lines (`agent-drafts/`) in about one minute.

| Brief                      | Clean? | Problem                                                                                                            |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| 1 Penguins (3 views)       | yes    | `at=` inside view overrides, assumed rather than documented                                                        |
| 2 Orders → contribution    | **no** | Invented formula functions `clamp`, `coalesce`, and `if()`, because the reference never shows the formula language |
| 3 Jobs composition         | **no** | Placed defined charts with bare top-level `jobs at=…` lines, which the reference doesn't define. Otherwise valid   |
| 4 Forecast-fan composition | yes    | 8/4 written as a 12-cell matrix line. Legend over several marks invented, but natural                              |
| 5 Annotated bubbles        | yes    | `size.max=` guessed; check would validate it                                                                       |
| 6 Shop overview            | yes    | Used `set value=sum(Revenue)` for a row measure, which is the escape hatch working as intended                     |

- 4 of 6 drafts are clean, meeting the threshold of at least 4.
- 0 of about 60 composition lines needed `set`, meeting the under-5% threshold.
- Brace nesting caused no errors.

## Decisions this changes

1. Keep the brace outline and the composition grammar as shaped.
2. Allow an explicit width on a matrix cell (`bill:7 species:5`), with even splits otherwise. This covers 58 of 58 views at readable width, and it's the thing the agent reached for.
3. An override line (`name key=…`, including `at=`) works the same at top level and inside a view. The top level is the default view.
4. The reference must include the formula language. It will be generated from the registry and the formula grammar, not written by hand.
5. Smaller additions: `legend unit { mark "label" … }` covering several marks, list values for `show=`, quoted names in layouts, and `value=AGG` on row and bar charts (lowered to a grouped summary).
6. House style is a product decision (see the plan). Either the library defaults adopt it, or the examples drop it.

## Cold-agent reruns during milestone 5

Each run used a fresh agent with the same six briefs, the generated reference, and the `exploreda-dsl` CLI. The agent wrote a first pass without running anything, then fixed its drafts using `check`. Its drafts are in `agent-drafts-v1/` through `agent-drafts-v3/`, each beside its untouched `.first.eda` copy.

| Run | Reference                                    | First pass clean | Final `check` 0 | Features given up                                                                                 |
| --- | -------------------------------------------- | ---------------: | --------------: | ------------------------------------------------------------------------------------------------- |
| 2   | `reference-v1.txt` (129 lines)               |           1 of 6 |          6 of 6 | 3 (fan bands, weekly stacked area, grouped box plot)                                              |
| 3   | `reference-v2.txt`, plus part-setting checks |           2 of 6 |          6 of 6 | 1 (the "+N jobs" label signs)                                                                     |
| 4   | `reference-v3.txt`, plus value checks        |           3 of 6 |          6 of 6 | 0 (partial only: points at both ends took two marks, and leader notes aim by guessed coordinates) |

**What run 2 exposed, and what changed:**

- `check` accepted invented keys on composition parts. Every part now has a list of allowed and required settings, and anything else is reported at its line.
- Missing required settings gave no line pointer. A part missing one is now left out with a diagnostic that names the setting.
- The reference listed nested settings by name only. It now has `exploreda-dsl reference composition`, nested keys in `reference <type>`, and notes on line time series, box-plot groups, facets, band marks, and nulls in formulas.

**What run 3 exposed, and what changed:**

- A bad value dropped the whole graphic, such as `center=0`, `show=ends`, or `direction=horizontal`. Each setting's value is now checked at its line (numbers, true or false, allowed words). A part the graphic still can't draw is left out on its own, down to a single mark.
- Partial nested records failed silently: a label's `valueSigns`, or a line's `time` with only `time.interval=week`. Both now fill the rest from defaults.
- The reference didn't show allowed values. It now lists them (`show=all|first|last|min|max`), plus diverging value scales, last-by-order measures, legend items, per-instance scales, and how to quote a repeat key.

**What run 4 exposed, and what changed:**

- The reference showed a legend item backwards. It's `item "Label" mark=M`, which caused 10 of brief 4's 17 first-pass problems.
- It didn't say that a rule needs `at=`, how marks are colored (`stroke=`, `fill=`, `colorField=`, `valueField=` with `valueScale=`), or that a unit sets its axis titles with `axisTitles.y=`. The reference now covers all of these.
- A `color=` on a mark now suggests the right settings. It used to suggest `colorField`, which is wrong for a value scale.
- Still open: a note can't aim at one series inside a frame, and `point show=` has no "both ends" value. Both are product features, not text features.
