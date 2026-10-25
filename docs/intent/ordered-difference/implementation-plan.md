# Compare observations with reusable lag and difference fields

Build an `ordered` query step, shown as **Compare observations**.
It adds previous-value and numeric-change fields while keeping each current row and its identity.
Charts, later query steps, and query-backed notebooks can use those fields.

Status: proposed, not implemented. Source checked: `95832bd473884aeae23453af0888b4ca5187820d`.
The [research review](../../research/ordered-difference-2026-10-25/README.md) records the decision and local dispositions.
The [Pro conversation](https://chatgpt.com/c/6addaf82-cf90-83ea-94fd-87064519928f) contains the complete source reports.
No open research PR is a prerequisite.

## Selected contract

An analyst names partition fields, order fields with types and directions, an observation offset, and one or more outputs.
All outputs share one predecessor mapping. Display sorting never determines that mapping.

```ts
type OrderedStep = {
  id: string;
  kind: "ordered";
  inputStepId: string;
  partitionBy: string[];
  orderBy: {
    fieldId: string;
    type: "number" | "date" | "string" | "boolean";
    direction: "asc" | "desc";
  }[];
  offset: number;
  outputs: {
    id: string;
    label: string;
    operation: "lag" | "difference";
    fieldId: string;
  }[];
};
```

| Rule              | Selected behavior                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Partition         | Exact stored scalar types and values; number `1` differs from text `"1"`. Empty list means all records.                                                                  |
| Missing partition | Null, undefined, or blank partition values stay in the output, outside the sequence. Nonfinite numbers are invalid.                                                      |
| Order             | Lexicographic clauses, each with its own direction. Use `finiteNumber`, `timestampOf`, or `parseBoolean`. String mode accepts strings and compares UTF-16 code units.    |
| Order eligibility | Every clause must be usable. Missing/invalid order rows remain visible, outside the sequence. Count them by known partition.                                             |
| Ties              | Duplicate full normalized tuples block comparisons for the entire eligible partition. Other partitions continue. Never break ties by arrival order or an undeclared key. |
| Offset            | Positive safe integer, default one when authored. Position `i` uses `i-offset`. Larger than the partition is valid.                                                      |
| Missing measure   | Keeps its position. Do not skip it or change predecessors by output.                                                                                                     |
| Lag               | Copy the predecessor's raw scalar and declared type. No predecessor gives undefined; a null predecessor value stays null.                                                |
| Difference        | Current minus predecessor, using finite numeric readings. Invalid operands or overflow give undefined with role-specific reasons. Reject declared date/boolean targets.  |
| Units             | Same measurement field and unit. No unit inference, conversion, duration, or rate semantics.                                                                             |
| Scope             | Query filters before preparation change predecessors. Filters after preparation, chart selections, and table searches do not.                                            |
| Row meaning       | Keep input row count, order, keys, sourceRows, contributors, and row unit. Expanded or grouped inputs retain their actual grain.                                         |

Use tagged partition tuples to avoid delimiter collisions. Number zero and negative zero share a partition.
Do not trim nonblank partition strings or apply locale collation.
Saved date order uses the shared parser, independently of chart date formatting.

Generated fields must exist on empty data. Lag inherits its input type; difference declares number.
Reject missing references, repeated clauses, output collisions, sibling-output references, and invalid configuration before reading rows.
Use one small definition validator across evaluator, JSON, text, and editor boundaries.
When file fields need inference, validate references after loading them.

## Exact evidence and refresh

Add an optional comparison map to `AnalysisResultRow`, keyed by ordered step ID.
Each entry holds the current input row key, optional predecessor input row key, status, and issue field IDs.
Resolve values through that step's retained input stage. Do not copy full predecessor rows into every result.

Statuses distinguish missing/invalid partition, missing/invalid order, ambiguous order, insufficient history, and paired rows.
Use that precedence for exclusive row counts. Preserve all field reasons for inspection.
Stage comparison counts are separate from `excludedCount`, which remains zero.
Report exact tied records separately from all affected rows.
Count an unavailable difference once even when both operands have reasons.

Row-preserving steps and expansion retain earlier comparison entries. A later ordered step adds its own entry.
Aggregation creates new rows. Its numeric `measureContributors` identify member rows in the immediate input stage.
Follow those members to their comparisons. Do not add predecessor records to current group membership.
Count contributors and group members have different existing rules; keep those labels distinct.

Inspection shows the applied rule, current and predecessor values, output, unavailable reasons, and role-specific source records.
After a downstream filter removes a predecessor, the retained input stage must still explain the result.
Use existing row/trace navigation and Alt-click or Alt-Enter. Plain chart clicks remain selection.

Extend `useAnalysisEvaluation` to retain the applied project and source-table references beside the accepted result.
Inspect the same generation while a newer worker request runs. Keep current editing state separate.
Disable edits on an old displayed flow while pending. Keep the existing obsolete-response check.
Hosts must replace changed source arrays and their tables record.

### Local simplification of Pro's selection proposal

Use a conservative guard for queries containing ordered preparation.
Exact row filters and inspection bookmarks belong to one host session and accepted evaluation generation.
Capture one opaque token with each newly accepted evaluation; it stays stable while that result remains displayed.
Encode that scope beside the existing row key. A new evaluation or fresh reopen makes old choices visibly unresolved.
Do not use the content revision alone: a reload can have identical content and different positional identity.
Count unresolved values from the settings actually decoded for display. Offer the existing clear/reselect route.
Encode and decode against the applied evaluation while pending.

This deliberately requires re-selection even for stable keyed rows after a refresh.
Category and range predicates remain ordinary predicates. Prepared definitions and chart layouts still reopen normally.
Do not add source-key provenance, generated-column reconstruction, selective key-recipe descriptors, or a global identity service here.
Selection survival is separate work. The guard also covers synthetic importer keys without classifying them by field name.
Keep existing behavior for queries without ordered steps.

## M1 — Text/API preparation with complete reuse and inspection

Ship a complete flow: edit project text, open readings, chart Change, inspect a pair, compare filter placement, save, and reopen.
The local folder application already reloads external text edits. An API definition uses the same evaluator.

Work in this order inside the milestone:

1. Freeze the fixture and predecessor maps below.
2. Add the model, definition checks, empty schema, and one shared predecessor pass.
3. Add comparison inspection, aggregate-member drill, and applied-generation handling.
4. Add the scoped exact-selection guard.
5. Complete JSON/text/folder round trips and declared-schema forwarding.
6. Ship the docs, runnable project, notebook, browser acceptance, and a minor changeset.

| Files under `packages/explorEDA/src/` unless stated                                 | Change                                                                                                                                             |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types/AnalysisProject.ts`                                                          | Add OrderedStep, compact comparison evidence, stage counts, and a step-level data diagnostic.                                                      |
| `lib/analysis/evaluateProject.ts`                                                   | Add explicit dispatch; preserve row grain/order and earlier evidence. Keep scalar Calculator unchanged.                                            |
| Proposed `lib/analysis/orderedDefinition.ts`, `orderedFrame.ts`                     | Share configuration/schema rules; normalize once, partition, sort, detect ties, and emit outputs. Split further only when size requires it.        |
| Proposed `lib/analysis/orderedInspection.ts`                                        | Resolve current/predecessor roles from one evaluation. Follow numeric aggregate members through existing ledgers.                                  |
| `lib/analysis/projectFile.ts`                                                       | Update both operation allowlists and recursive `fieldsAt`. Add an explicit ordered branch; do not let it fall into aggregate handling.             |
| `lib/analysis/useAnalysisEvaluation.ts`, `components/ExplorEdaProject.tsx`          | Capture applied project/tables with the finished evaluation; pass them to inspection.                                                              |
| `components/project/analysisRowKeys.ts`                                             | Scope exact tokens in ordered queries to session/evaluation generation. Decode mismatches as unresolved.                                           |
| `components/project/QueryStageRows.tsx`, `ProjectQueryPanel.tsx`                    | Add bounded comparison details and exact role navigation. Keep ordinary Related records separate.                                                  |
| `components/project/QueryFlow.tsx`, `queryEditing.ts`, `stepEditing.ts`             | Show rules and separate comparison counts; preserve IDs; handle generated fields and removal dependencies.                                         |
| `lib/dsl/project.ts`                                                                | Compile/export the ordered block. Reject repeated/unknown semantics and malformed child declarations. A bad block must make its query unavailable. |
| `lib/project/writeFolder.ts`                                                        | Omit only unchanged canonical implicit source queries. Save an edited implicit query explicitly.                                                   |
| `lib/dsl/compile.ts`, `export.ts`, optionally `views.ts`                            | Accept declared field IDs/types alongside rows. Use concrete declared types; infer only unspecified types. No fake rows.                           |
| `lib/project/analysisText.ts`, `lib/notebook/readNotebook.ts`, `compileNotebook.ts` | Carry fields and rows from one evaluation into compilation and export. Return schema from the notebook reader.                                     |
| `lib/notebook/writeBack.ts`, `components/notebook/ExplorEdaNotebook.tsx`            | Forward the same schema through compile and every export/write-back path, including memo dependencies.                                             |

Keep project version 1 and the existing public analysis export.
No version negotiation, second interpreter, alternate backend, or generalized result catalogue is needed.
Preserve source inference and strict relationship matching.
The existing JSON rejection of an empty entity key is separate from this feature; keyed fixtures cover native round trips.
The evaluator may still compare keyless API frames within their applied snapshot.

Proposed project text:

```text
ordered @changes by=readings.entity offset=1 {
  order readings.at type=date direction=asc
  order readings.seq type=number direction=asc
  lag @previous_value readings.value label="Previous reading"
  difference @change readings.value label="Reading change"
}
```

Support explicit `from=` and no partition fields. Preserve IDs, labels, direction, read type, and offset exactly.
The current generic parser accepts nested declarations. Add semantics rather than a new grammar.
Malformed preparation must never disappear into a successful source-only query.

Docs and example in M1:

- Add `apps/demo/src/docs/pages/ordered-comparisons.mdx` and its catalogue entry.
- Update `project-folders.mdx` with the text block and edited implicit-query behavior.
- Update `notebooks.mdx` with prepared fields and display-versus-query filter scope.
- Add `apps/demo/src/demos/orderedReadings.ts`, following `multiSourceShop.ts`; register `ordered-readings` in `demos/examples.ts`.
- Add a folder under `apps/demo/public/examples/ordered-readings/`: project text, exact JSON readings, analysis, and `.eda.md` notebook.
- Include base, filter-before, filter-after, and grouped queries. Show separate entity panels to avoid drawing a false sequence across entities.

Use the standalone `/examples/ordered-readings` route.
The current inline docs example runner accepts single-source settings, so link the project example instead of expanding that runner.
Notebook chart reuse is required; comparison inspection remains in the companion Query workspace.

M1 exits when the fixture, empty schemas, save/reopen, refresh guard, and worker snapshot proof pass.
Editing a notebook chart on empty or all-null data must survive write-back and reopen with its fields intact.
Main risk: a plausible number explained by another record or source generation.

## M2 — Compact visual authoring

Add Compare observations in Query and reopen it from its flow node.
Use a local draft with Within, Order/Then by, reading type, direction, Observations back, and named outputs.
Empty Within reads All records. Output label edits keep field IDs.
Preview current/predecessor pairs and exact tied/omitted rows, with a visible limit.
Apply commits one change; Cancel or Escape leaves model and undo history unchanged and returns focus.
Copy query must not share mutable nested order/output arrays.

Add `components/project/OrderedStepEditor.tsx` and a small editing helper if needed.
Reuse field pickers, metadata, buttons, tooltips, and panel sizes.
Use 28px settings controls, 100px labels, accessible names, and bounded scrolling.

Allow a move across one adjacent filter only on an unambiguous single-consumer chain.
Rewire input edges and outputStepId, then validate. Changing array order is insufficient.
Block a move that places `change > 0` before Change exists.
Do not add arbitrary graph dragging.

Update the same docs page and example with creation, edit, preview, filter movement, and cancellation.
Ship a minor changeset with these controls.
Main risk: the draft preview and Apply use different graph populations.

## Exact fixture and expected values

Source key is id. Partition by entity. Order at/date ascending, then seq/number ascending, offset one.
Dates below are UTC midnight in January 2026. Preserve raw JSON scalars.

| Input position | ID  | Entity | Day | Seq | Value |
| -------------- | --- | ------ | --- | --- | ----- |
| 1              | a3  | A      | 3   | 1   | null  |
| 2              | b2  | B      | 2   | 1   | 15    |
| 3              | a1  | A      | 1   | 1   | 10    |
| 4              | a2b | A      | 2   | 2   | 18    |
| 5              | b1  | B      | 1   | 1   | 4     |
| 6              | a4  | A      | 4   | 1   | 25    |
| 7              | a2a | A      | 2   | 1   | 14    |
| 8              | b3  | B      | 3   | 1   | 12    |

| Current | Predecessor | Lag       | Difference                     |
| ------- | ----------- | --------- | ------------------------------ |
| a1      | none        | undefined | undefined                      |
| a2a     | a1          | 10        | 4                              |
| a2b     | a2a         | 14        | 4                              |
| a3      | a2b         | 18        | undefined: current missing     |
| a4      | a3          | null      | undefined: predecessor missing |
| b1      | none        | undefined | undefined                      |
| b2      | b1          | 4         | 11                             |
| b3      | b2          | 15        | -3                             |

Expect eight output rows in input presentation order, six pairs, two boundaries, and four finite differences totaling 16.
There are six raw lag copies, including null; five are nonmissing.
a2b keeps key `readings:string:a2b`. Its ordinary source membership contains only a2b in this source-only case.

Important variants:

- Remove seq from order: two tied records a2a/a2b block all five A rows; B still gives 11 and -3.
- Remove a2a before preparation: a2b uses a1, lag 10, change 8; total change 16.
- Remove a2a afterward: a2b still uses a2a, change 4; total 12. A has four current members and sum 4.
- Offset two: a2b→a1/change 8, a3→a2a/unavailable, a4→a2b/change 7, b3→b1/change 8; total 23.
- Both order terms descending: a2a→a2b/change -4, a1→a2a/change -4, b2→b3/change 3, b1→b2/change -11.
- Reverse input: the same predecessor map by ID; output follows the reversed presentation order.
- Refresh a2a from 14 to 20: a2a change 10; a2b lag 20/change -2. Old exact selections become unresolved.
- Add blank-order A, impossible-date A, and missing-entity records: retain all 11 rows, eight eligible, three outside sequence, same six valid pairs.
- Number `1` and text `"1"` partitions remain separate. Under numeric order, those values tie.
- Equivalent timezone spellings tie under date order. A missing secondary clause makes that row unsequenced.
- Missing measures retain positions. Blank, boolean, radix text, NaN, and infinity fail numeric difference; raw lag preserves them.
- `1e308 - (-1e308)` is unavailable overflow; `0.3 - 0.2` uses tolerance. Zero remains valid.
- Empty, singleton, and all-null inputs keep declared output fields. Offset 99 is valid and produces only boundaries.
- Expansion retains original comparison keys; aggregation reaches member comparisons without counting predecessors as members.

## Verification and commands

Write a few suites with table-driven material cases:

- Proposed `src/test/lib/analysis/orderedObservations.test.ts`: predecessor IDs before arithmetic, ties, types, missing values, filters, grain, and malformed empty definitions.
- Extend `src/lib/dsl/project.test.ts`: exact round trip and malformed blocks which cannot activate partial queries.
- Proposed `src/lib/project/orderedPreparationRoundTrip.test.ts`: native JSON, edited implicit queries, folder save/reopen, empty notebook chart write-back.
- Extend `src/test/lib/analysis/useAnalysisEvaluation.test.tsx` and project integration tests: old applied records/rules while pending, obsolete replies, scope invalidation after refresh/reopen.
- Extend `src/components/project/stepEditing.test.ts`: generated fields/removal; M2 immutable drafts and dependency-checked moves.

Browser test: add `apps/demo/e2e/ordered.e2e.ts` and explicitly register an `ordered` project in `playwright.config.ts`.
At 1280, 783, and 390px, inspect a2b, hide/sort records, compare the two filter recipes, repair ties, save/reopen, and refresh.
Use real pointer and keyboard input, including Alt-Enter and Escape.
Check current 18/previous 14/change 4 together; pending refresh must show that complete old combination until new results arrive.
Check unavailable values, long labels, exact group sum 4, visible preview limits, focus return, and viewport bounds.
M2 adds visual authoring, one Apply, Cancel, label stability, and blocked filter movement.

Run after the feature and named tests exist:

```sh
pnpm --filter exploreda exec vitest run src/test/lib/analysis/orderedObservations.test.ts src/test/lib/analysis/evaluateProject.test.ts src/lib/dsl/project.test.ts src/lib/project/orderedPreparationRoundTrip.test.ts src/test/lib/analysis/useAnalysisEvaluation.test.tsx src/components/project/stepEditing.test.ts
pnpm --filter exploreda check-types
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify --project=ordered
pnpm --filter demo docs:verify --project=pages -g '/docs/ordered-comparisons$'
pnpm shot /examples/ordered-readings --name ordered-readings
pnpm check
```

Use the agent guide's folder-app flow and `scripts/app-shot.mjs` for actual file lifecycle checks.
Use `@repo/test-config` time limits. Run the broad gate once before each feature PR.
Every package change needs its own changeset; every visible change needs attached screenshots.

During M1, measure real direct/worker evaluations at 10k and 100k rows, one and many partitions, and one wider multi-output case.
Measure normalization/sort, copied values, retained stages, transport, and first inspection separately.
One predecessor mapping serves every output. Expected sort work is proportional to the sum of partition sizes times their logarithms.
Pro's synthetic probe is not a product benchmark. Add no cache, index, row cap, or backend from that evidence.

Duration/rate, skip-missing neighbors, lead, calendar comparisons, and broader selection survival remain separate work.
