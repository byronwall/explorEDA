# Database eval rerun, 2026-11-05

The same 8 tasks, briefs, databases, and model (Sonnet, 1 run per task) as the [first eval](../README.md), run with the [db-ux-eval skill](../../../../.claude/skills/db-ux-eval/SKILL.md) on the fix stack through layer 11 (`claude/dbfix-related-fields`). Each agent's report and project files are in [runs/](runs/), and the scorecard is in [scorecard.json](scorecard.json).

## Measures

| Measure                                    | Baseline | Rerun  | Target |
| ------------------------------------------ | -------- | ------ | ------ |
| Join tasks done with explorEDA's own joins | 0 of 6   | 6 of 6 | 4 of 6 |
| CLI tasks that needed a browser click      | 4 of 4   | 0 of 4 | 0 of 4 |
| Tasks done (not partial or blocked)        | 5 of 8   | 7 of 8 | 7 of 8 |
| Agents that used tools outside explorEDA   | 4 of 8   | 4 of 8 | 1 of 8 |

Three targets were met. The outside-tool count did not move, but its use changed. In the baseline, agents used `sqlite3`, `duckdb`, or `jq` to learn the schema. In the rerun, three of the four read explorEDA's own snapshot JSON with Python to get numbers for their prose or to check a total. Only one (task 2) used `sqlite3`, to compute a correlation.

| Task                      | Outcome        | Joins               | Browser for CLI |              Major | Minor |
| ------------------------- | -------------- | ------------------- | --------------- | -----------------: | ----: |
| t1 Fourth-down board      | done           | none (single table) | –               |                  1 | 7 → 4 |
| t2 Passing vs winning     | done           | sql → explorEDA     | yes → no        |              0 → 2 | 5 → 2 |
| t3 Five-QB scout          | done           | none (single table) | –               |                  2 | 8 → 5 |
| t4 Monthly store sales    | partial → done | sql → explorEDA     | –               |              2 → 3 | 6 → 5 |
| t5 Return reasons         | done           | sql → explorEDA     | yes → no        |              4 → 1 |     4 |
| t6 Web vs catalog buyers  | partial        | sql → explorEDA     | –               | 1 → 3 (+1 blocker) | 7 → 3 |
| t7 Low stock by week      | partial → done | sql → explorEDA     | yes → no        |              3 → 1 | 5 → 4 |
| t8 Cold start, 3 findings | done           | sql → explorEDA     | yes → no        |              4 → 1 | 5 → 3 |

The agents reported working longer (12 to 30 minutes, against 2 to 8 in the baseline). That is expected: in the baseline most of the work was one SQL query. Severity counts are rough, because agents grade severity differently.

## What changed for users

- **Joins:** six of six join tasks used `relate` and `lookup` from the Query panel, the relationship inspector, or project text. Task 4's total ($52,365,502.91) matched a direct sum, so the lookups did not multiply rows.
- **Wide tables:** both browser agents on `plays` used **Pick columns** with a row filter and read only what they needed. Neither wrote SQL.
- **CLI:** all four command-line agents used `exploreda schema`, `exploreda read`, and `exploreda-dsl reference project|notebook`. None needed a browser click.
- **Rates:** tasks 1, 3, and 5 used **Rate (sum ÷ sum)** and percent formats, not 0/1 averages.

## New findings

Ranked by severity. Each one is a work item in the fix layer that follows this rerun, or is listed as left.

1. **Silent wrong output (t2):** an aggregate that named the previous aggregate's measure as `pg.pe` produced all-null columns, while `check` said ok.
2. **Stacking two channels (t6, blocker):** `append` lines up fields only by identical names, so web rows lost their customer key, and later lookups came up empty. There is no Append control in the UI.
3. **Pivot crash (t4):** a pivot on a field with about 13,000 values crashed the tab.
4. **Related fields missing from filtered pickers (t4):** the Date picker and numeric measure pickers did not offer related tables' fields.
5. **No ranked table (t3, t4):** the pivot forces a column field, and "Other categories" swamps a top-10 row chart.
6. **No "is one of" text filter (t3).**
7. **`check` passes semantically wrong charts (t7, t8):** a row or bar chart over aggregated rows silently counts rows.
8. **Smaller items:** the date default picks an integer key, a saved Top N is ignored on the grid, unnamed picker checkboxes, an undefined `{{finding}}` passes, `if/then` is hard to find, `exploreda schema` needs project text first and has no column filter, the `fields` crash on a large snapshot, `sortBy=` is ignored, unresolved color fields render grey, and field search misses raw column names.

## Not run

- Scope filters, which change what rank and axes use, belong to the stable-scales work and were not part of this stack.
- Three browser agents ran at once for a while, one over the skill's limit of two. Task 4 sent three browser calls to another tester's tab before it noticed. No change resulted.
