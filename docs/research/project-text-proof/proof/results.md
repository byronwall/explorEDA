# Project text — first proof results (2026-10-12)

**Decision: passed. The project folder stores sources, relationships, queries, and parameters as project text.** The JSON fallback is not needed.

## Round trip over every demo project

`exportProjectText` → `compileProjectText` was run over every `AnalysisProject` in the repository: the shop demo, the 11-query shop test fixture, flights, Beijing air, world development, and earthquakes.

- Every project reads back deep-equal, with no diagnostics. Exporting a second time gives the same text, and `formatDsl` leaves it unchanged.
- For the four file-backed analyses, evaluating the query from text gives the same rows as evaluating the original.
- No escape hatch was needed: `set` lines are 0% of query lines (the threshold was under 5%).
- All six step kinds appear in the corpus: source, lookup, expand, calc, filter, and aggregate.

| Project | Text lines | JSON lines |
| --- | --- | --- |
| shop | 52 | 257 |
| shop fixture (11 queries) | 115 | 553 |
| january-flights | 60 | 314 |
| beijing-air | 49 | 229 |
| world-development | 64 | 308 |
| earthquakes-2023 | 29 | 136 |

The exported texts are in this folder (`*.eda`). The tests are `packages/explorEDA/src/lib/dsl/project.test.ts` and `apps/demo/src/demos/analyses/projectText.test.ts`.

## Cold agent draft

An agent given only [the reference](../project-text-reference.md) and a plain-language brief wrote [agent-shop.eda](agent-shop.eda) in one pass.

- It compiled with **no diagnostics**.
- Its three shop queries return the same rows as the hand-built demo project (5, 8, and 2 rows, with a customer and a date range bound).
- Its fourth query, revenue by product, is correct (Mug 45, Notebook 50, Lamp 45).

Points the agent had to guess, to fix in the reference before launch:

- what `on=` does on a lookup;
- what an aggregate's output fields are called;
- that a parameter picked from a source holds the key, not the label;
- whether a parameter belongs to one query (they are project-wide);
- that the date range is inclusive at both ends.

## What the proof showed about the grammar

- Step IDs often differ from their natural default (the fixture's IDs are all custom, and flights' calc IDs are hyphenated field names), so `@id` stays available on every step.
- Every query in the corpus is a straight chain whose output is its last step. `from=` and `output=` exist but never appear in exported text.
- `calc` steps take a head before a spaced ` = `: `calc @id field "Label" = formula`. Dashboard `calc` lines are unchanged.
- Filter comparisons parse however they are spaced (`a>=$b` and `a >= $b`), because `>=` would otherwise read as a `key=value` pair.
