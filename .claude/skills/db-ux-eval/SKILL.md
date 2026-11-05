---
name: db-ux-eval
description: Run explorEDA's database UX/DX eval again. Clean subagents do 8 realistic dashboard and notebook tasks against an NFL SQLite file and a TPC-DS DuckDB warehouse, report friction with a scorecard, and the results are compared with the last eval. Use when Byron asks to rerun the database eval, measure whether database work got better, check a database-UX fix with fresh users, or add a task to the eval.
---

# Database UX/DX eval

This eval measures how far explorEDA is from a first-time user building a chart from database tables with no help. The first run is [docs/research/db-evals-2026-11](../../../docs/research/db-evals-2026-11/README.md). Its `scorecard.json` is the baseline, and its `analysis.md` defines the target experience and the gap. Each new eval answers one question: which numbers moved, and what is the new top problem?

## Rules that keep runs comparable

- Do not change a task's goal, database, or surface between evals. To test something new, add a task with a new id. Then the old ids still compare.
- Each agent gets only its `BRIEF.md`. No source walkthrough, no hints about known problems, and no word about what was fixed since the last eval. A hint makes the run useless as a measure.
- Use the same model as the baseline (Sonnet) and 1 run per task, unless Byron asks for more.
- Run at most 4 agents at a time, and at most 2 browser tasks at a time. Parallel agents share one browser pane. In the first eval, two agents lost their tab to another agent.
- Build from the branch under test. `setup-runs.mjs` builds the package and the project app.

## Steps

1. **Databases.** `node scripts/db-evals/build-dbs.mjs`. It writes `tmp/db-evals/dbs/nfl.db` and `retail.duckdb`, and caches downloads, so a rerun is fast. The data comes from the repo's pinned `@duckdb/node-api`, so keep that version in mind when numbers in a task change.
2. **Folders.** `node scripts/db-evals/setup-runs.mjs <eval-id>`, where the eval id is usually the date. Add `--tasks t1,t5` for a subset, or `--no-build` when the build is already fresh. It prints one prompt line per task, and saves the lines in `prompts.txt`.
3. **Agents.** For each task, start a background `general-purpose` agent with `model: "sonnet"` and the printed prompt line, unchanged. Start the next one when a slot frees.
4. **Check the claims you will repeat.** An agent's report is evidence, not proof. Reproduce each blocker or major problem you plan to name as new: run the command, look at the file, or take the screenshot. `tasks.json` has a `check` query for tasks whose totals are easy to verify against DuckDB.
5. **Collect.** `node scripts/db-evals/collect.mjs <eval-id> --shots --compare docs/research/db-evals-2026-11/scorecard.json`. It writes `scorecard.json`, prints the before-and-after table, and saves screenshots to `tmp/db-evals/<eval-id>/`. Look at every screenshot yourself.
6. **Report.** Make `docs/research/db-evals-<yyyy-mm>/` with `README.md` (the before-and-after table, new and fixed findings, ranked), `scorecard.json`, and `runs/tN/` (each `REPORT.md` and the project files, with scratch paths removed). Use the same headings as the first eval's README.
7. **Work items.** Mark fixed findings in Product Grid (`pnpm -s pgm node resolve <id> --note …`) under the `Database UX eval` root. Add new findings as child nodes there, each with the run that found it and its evidence.
8. **PR.** Docs-only, so no changeset. Load `pr-description`, and attach the screenshots with `--attach`.

## What to measure

The scorecard fields are the trend lines. Report these per eval:

- **Outcome:** how many tasks are done, partial, or blocked.
- **`joins`:** how many join tasks used explorEDA's own joins, rather than SQL. In the baseline it is 0 of 6. This is the main measure of whether explorEDA, not SQL, does the analysis.
- **`browserNeededForCli`:** how many command-line tasks needed a browser click. In the baseline it is 4 of 4.
- **`outsideTools`:** how many agents needed `sqlite3`, `duckdb`, or `jq` to learn the data. In the baseline it is 4 of 8.
- **Severity counts:** blockers and major problems per task. Treat these as rough numbers. Agents differ in how they grade severity.
