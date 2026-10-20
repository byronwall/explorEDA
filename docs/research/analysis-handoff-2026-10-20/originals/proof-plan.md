# Proof plan: portable analytical handoffs after existing exports

**Status: proposed and entirely UNRUN.** This document specifies expected results at explorEDA baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510` in `byronwall/explorEDA`. Research date: 2026-10-20. Source inspection and arithmetic informed the expectations; neither is application execution. Codex owns execution, result recording, integration and any subsequent review PR. No repository was changed for this plan.

## 1. Decision this proof must discriminate

Keep **AH01, local trust, first**: establish one uninterrupted task in which selection, values, records, download, undo and reopening agree. A bounded export or restoration failure requires repair of that existing contract. It does not establish demand for AH03, a companion note. Only after this first proof succeeds should AH02, a focused guide, be evaluated with recipients. AH04, explicit upstream preparation or another destination, remains an alternative when the recipient needs a different data contract. AH05 retains the separate demand gate for reusable analytical results.

Three jobs organize the observations:

- **Explain a finding:** a recipient can state what “Group A amount 35” means, which population it refers to, and what remains unknown.
- **Reopen and inspect:** a recipient with compatible explorEDA can recover the seven source rows, Group A selection, formula and local table search, inspect the five selected records, and obtain the same expected values.
- **Reuse rows:** a recipient can import the intended two or five CSV records and understand the format’s type and missing-value boundaries. Exchanging these rows is not materializing a bar, pivot, fitted model or density result.

These are synthetic discriminating tasks, not supplied customer demand. A synthetic recipient exercise can reveal confusing wording; it cannot authorize a product feature by itself. The current-analysis-trust intent expressly prioritizes exact memberships and contributors, followed by export/undo/restore; the reusable-analysis-outputs intent asks for an actual downstream task before expansion. [S1]

| Proof layer | What a pass establishes |
| --- | --- |
| L1 — serialization and calculation contracts | The real serializer/parser/evaluator functions preserve or intentionally transform the specified inputs. |
| L2 — application and browser | Actual controls, downloads, history and fresh reopening connect those contracts correctly. |
| L3 — recipient comprehension | A named recipient can accomplish the named task using the provided artifacts and instructions. |

A pass at one layer never substitutes for another. Keep three separate records, with baseline, environment, inputs, expected/actual values and failure disposition.

## 2. Ordinary-analysis fixture

Use these raw typed objects through the existing data input. This TypeScript is a fixture specification embedded in this document; no fixture program or CSV asset was created or executed. `r1` through `r7` below are proof labels assigned by array position, not added data fields.

```ts
const rows = [
  { id: 1, group: "A", amount: 10, units: 1, raw_measure: 0,
    search_tag: "needle", note: "" },
  { id: "1", group: "A", amount: 0, units: 2, raw_measure: null,
    search_tag: "ordinary", note: "" },
  { id: "001", group: "A", amount: null, units: 3, raw_measure: "",
    search_tag: "ordinary", note: "" },
  { id: "9007199254740993", group: "A", amount: 5, units: 4,
    raw_measure: "bad", search_tag: "needle",
    note: 'alpha, "quoted"\nnext' },
  { id: "A-5", group: "A", amount: 20, units: 5,
    raw_measure: undefined, search_tag: "ordinary", note: "check" },
  { id: "B-6", group: "B", amount: 50, units: 6, raw_measure: 10,
    search_tag: "ordinary", note: "" },
  { id: "B-7", group: "B", amount: 15, units: 7, raw_measure: 20,
    search_tag: "ordinary", note: "" },
];
const calculation = { resultColumnName: "double_units", expression: "units * 2" };
```

### Configuration and controls

- Use linked selection mode, `localSelections=false`. Set no chart `localFilters`, no Rows-local filter and initially empty table/Rows search.
- Provide a categorical group chart, a metric card summing `amount`, a metric card summing `double_units`, and one dashboard data table. The bar/metric planners must use their existing sum operation; do not add a new derived-result engine.
- Configure table columns in this exact order: `id`, `group`, `amount`, `units`, `double_units`, `raw_measure`, `note`. Sort by `units`, ascending. `search_tag` deliberately stays outside the configured columns.
- Use the same source rows for the default Rows view, whose own search starts empty. Give `double_units` a label “Double units” and description “Two times units in each source row”; give `amount` a description “Synthetic amount; no currency implied.” Retain the identifiers unchanged. This tests saved context versus CSV headers without inventing a unit system.
- No numeric override is required for `amount`; retain `raw_measure` as the mixed column supplied. Do not coerce `"bad"` to zero or replace its missing/empty values before testing.

`DataTable` resolves calculated columns before passing filtered rows to its toolbar. `getFilteredRows` searches every non-`__ID` row property, including hidden fields, then applies table filters and sorting. Rows has its own controls on top of linked membership. The actual callers therefore support this hidden-search test; it is not an assumption based only on `toTableCsv`. [S2]

### Exact expected memberships and arithmetic

| State | Expected records and values |
| --- | --- |
| Full source, formula `units * 2` | r1–r7; amount 100 with six valid contributors out of seven; `double_units` sum 56. |
| Linked Group A | r1–r5; amount 35 with four valid contributors out of five; `double_units` sum 30. Zero in r2 contributes; missing amount in r3 does not. |
| Group A plus dashboard-table search `needle` | Table r1/r4; table amount sum 15 and formula sum 10. Linked charts remain Group A amount 35/formula 30; unsearched Rows remains r1–r5. |
| Clear dashboard-table search | Table returns to r1–r5; linked state stays Group A. |
| Edit expression to `units * 3` | Full-source formula sum 84; Group A formula sum 45; searched r1/r4 formula sum 15. Amount totals are unchanged. |
| Undo that formula edit | Expression `units * 2`; full/A/searched formula sums 56/30/10. |
| Redo that formula edit | Expression `units * 3`; full/A/searched formula sums 84/45/15. |
| Explicit final save state | Expression deliberately returned to `units * 2`, Group A selected, dashboard-table search `needle`, Rows search empty. Raw source remains all seven rows. |

The full-source reference for the finding is amount 100, not the searched-table amount 15. If an authored explanation states A is 35% of full-source amount, that is the explicit calculation `35 / 100`; it is not a claim that a new percentage feature exists. Record both contributor counts and membership counts so zero, missing and exclusion are not conflated.

For an independent Rows-scope check, temporarily clear table search and enter `check` in Rows search. Expected Rows is r5 only; dashboard table and charts still represent linked A. Clear Rows search before the final save. Use separate checkpoints so this action does not obscure the formula undo/redo proof.

## 3. L1 — serialization and calculation checks

### L1-A. CSV bytes, configured fields and reimport

Run the real table data path and `toTableCsv`, then the actual reader path `readTableText` → `readDelimited` → `typeTextColumns`. Test both the five linked-A rows with search cleared and the two searched rows. The configured header must omit `search_tag` and use `double_units`, not its display label. A hidden search term may select a row without appearing in the output; that is a scope/context issue to explain, not evidence of a corrupt row export. [S2], [S3]

Expected searched CSV text at the final `units * 2` state:

```csv
id,group,amount,units,double_units,raw_measure,note
1,A,10,1,2,0,
9007199254740993,A,5,4,8,bad,"alpha, ""quoted""
next"
```

The quoted note contains one embedded LF. Compare the exact string separately from the parsed logical record count: the file has two data records even though the quoted cell occupies two physical lines. The serializer joins records with LF and does not append a trailing LF. Verify quoting of the comma, quote and newline; also retain a direct header test using a field identifier containing a comma, without complicating the main fixture.

For the five-row export, assert r1–r5 in units order and `double_units` values `[2,4,6,8,10]`. Assert r2 amount `0` and r3 amount blank. `raw_measure` serializes as `0`, blank, blank, `bad`, blank; the original null/empty/own-undefined distinction is unavailable from those cells. Both numeric `id:1` and string `id:"1"` become the same lexeme `1`.

On reimport, assert the actual reader’s contract rather than generic spreadsheet folklore:

- Leading-zero `"001"` and unsafe-integer `"9007199254740993"` keep their digits and remain text under the inspected reader’s identifier protections.
- The five-row `id` column is text; the original number/string distinction for the two `1` values cannot be reconstructed. Do not call this a surprising defect in a schema-free row exchange.
- `raw_measure` contains `bad`, so it is inferred as text. Its nonblank zero becomes string `"0"`; the three blank values become null. Zero was not serialized as missing.
- `amount`, `units` and `double_units` reimport as numeric columns, with the blank amount as null. The quoted note reimports with the original comma, double quotes and LF.
- Formula values are ordinary CSV cells. No expression, filter, label, description, denominator, original type map or source-as-of time is embedded. A third-party spreadsheet importer needs its own contract; this proof covers the inspected explorEDA reader only.

These expectations follow the reader’s text-first parse and whole-column typing, not an executed CSV round trip. [S3]

### L1-B. Ordinary analysis and settings

Serialize the explicit final state using `stringifySavedAnalysis`, then parse it with `parseSavedAnalysis` and restore through the real provider. Assert all seven raw rows, including hidden `search_tag`; distinct numeric/string IDs; null amount; empty strings; and r5’s own `raw_measure: undefined`. Assert formula expression, chart/workspace selection, dashboard-table search, independent Rows settings, field labels/descriptions, and configured sort/column order.

The expected file contains the original source rows plus settings, not just the selected five or searched two, and not a frozen `double_units` source column. Recompute expected formula values after reopening. Settings-only JSON must contain the expressions/context but no source data; restoring it over different rows is not an equality claim. Independently supplied reader `fieldTypes` are not a named part of `SavedAnalysisStructure`, so test explicit saved field overrides and fresh-recipient interpretation separately. [S4]

### L1-C. Special-value microfixture

Keep this separate from the human-facing seven-row example:

```ts
const specialRows = [
  { key: "absent" },
  { key: "own-undefined", value: undefined },
  { key: "null", value: null },
  { key: "empty", value: "" },
  { key: "invalid-number", value: NaN },
  { key: "positive-infinity", value: Infinity },
  { key: "negative-infinity", value: -Infinity },
  { key: "finite-zero", value: 0 },
];
```

Use valid settings and the real analysis codec. Assert `Object.hasOwn` is false for absent, true for own-undefined; use `Number.isNaN` for NaN and exact equality for infinities, zero, null and empty string. Change the restored NaN to 4, serialize again, and assert 4 survives without stale special-value metadata. Do not rely on ordinary JSON stringify/parse to preserve these cases. A CSV comparison should explicitly record its different contract rather than demand information it does not carry. [S4]

## 4. L1-D — project dependency fixture

Use this complete structural fixture specification for pure serialization/evaluation checks. The same views can receive valid saved chart settings for L2. This code has not been executed.

```ts
import type { AnalysisProjectFile } from "@/lib/analysis/projectFile";
import type { SourceDefinition } from "@/types/AnalysisProject";

const source = (id: string, fields: [string, ...string[]]): SourceDefinition => ({
  id, name: id, glyph: id.slice(0, 1).toUpperCase(),
  entityKey: fields[0],
  fields: fields.map(id => ({ id, name: id, type: "unknown" as const })),
});
const file: AnalysisProjectFile = {
  format: "exploreda-project", version: 1,
  project: {
    id: "handoff-proof", version: 1,
    sources: [
      source("orders", ["orderId", "customerId", "amount"]),
      source("customers", ["customerId", "region"]),
      source("unrelated", ["id", "note"]),
    ],
    relationships: [{
      id: "order-customer", name: "Order customer", cardinality: "many-to-one",
      from: { sourceId: "orders", fieldId: "customerId" },
      to: { sourceId: "customers", fieldId: "customerId" },
    }],
    parameters: [{ id: "region", name: "Region", type: "string" }],
    queries: [{
      id: "q", name: "North orders", glyph: "Q", frameLabel: "Orders",
      outputStepId: "north",
      steps: [
        { id: "orders-source", kind: "source", sourceId: "orders" },
        { id: "customer", kind: "lookup", inputStepId: "orders-source",
          relationshipId: "order-customer", as: "customer" },
        { id: "twice", kind: "calculate", inputStepId: "customer",
          fieldId: "twiceAmount", label: "Twice amount",
          expression: '["orders.amount"] * 2' },
        { id: "north", kind: "filter", inputStepId: "twice",
          fieldId: "customer.region", operator: "eq", parameterId: "region" },
      ],
    }, {
      id: "other", name: "Other rows", glyph: "U", frameLabel: "Other rows",
      outputStepId: "other-source",
      steps: [{ id: "other-source", kind: "source", sourceId: "unrelated" }],
    }],
  },
  tables: {
    orders: [
      { orderId: "O1", customerId: "007", amount: 10 },
      { orderId: "O2", customerId: 7, amount: 20 },
      { orderId: "O3", customerId: "008", amount: 0 },
      { orderId: "O4", customerId: null, amount: null },
    ],
    customers: [
      { customerId: "007", region: "North" },
      { customerId: 7, region: "South" },
      { customerId: "008", region: "North" },
      { customerId: "7", region: "West" },
    ],
    unrelated: [{ id: "U1", note: "outside this query" }],
  },
  views: [
    { id: "v", name: "North", queryId: "q", bindings: { region: "North" },
      selectedRowKeys: ["orders:string:O1"] },
    { id: "other-view", name: "Other", queryId: "other" },
  ],
  activeViewId: "v",
};
```

Expected source-derived results: lookup preserves four orders; numeric 7 joins South, string `"7"` is a distinct unused customer, and null has no match. Output `q` has `O1`/20 and `O3`/0. Inspect O4’s missing-lookup/calculation diagnostics independently; do not silently count its missing amount as zero.

Run `selectAnalysisProjectView(file,"v")`, serialize, parse and evaluate. Expect all four orders and all four customers, one relationship, all four reachable query steps, region parameter, view binding and selected row key. Exclude the unrelated table/query/view. The output has two records and the selection names one; neither crops dependency tables. Whole-project serialization must retain all three tables and both views. Add harmless top-level `history`, `path`, `cursor` test fields and verify the serializer does not include them. Compare values and typed identities after parsing, not the process-local evaluation revision. [S5]

### Required bounded probes before a reopen claim

- **P-OPTIONS:** Use existing `createShopFixture()` and a view on `customer-instance`, bindings `{customerId:"C1", dateStart:"2025-01-01", dateEnd:"2025-02-01"}`. Existing test expectations are O1/O2. The query uses orders only; parameter options reference customers. Source predicts selected-view closure drops customers and subsequent serialization rejects `Parameter customerId has invalid options`. Run this before claiming the closure covers all dependencies. If confirmed, route a bounded repair to AH01; it is not companion demand.
- **P-BINDING:** Add a declared string parameter `unused` and view binding `unused:"x"`, while reachable query filters still use only `region`. Source predicts closure removes the definition but retains the binding, then serialization rejects a missing parameter. Establish whether the named app flow can produce that state before assigning user impact. Resolve intended binding/closure semantics in a scoped repair.
- **P-LOCAL-SPECIAL, optional when project refresh is in the task:** Add explicit own undefined and nonfinite source values. Compare project-file codec round-trip with browser-session refresh. Inspected browser table storage uses plain JSON stringify/parse, unlike the project-file codec. This is a separate source-predicted discrepancy, not an observed refresh bug. Stop and triage if the relevant named task fails.

No note or guide can repair an omitted dependency, failed serializer or changed value. A passed normal fixture does not erase these edge probes. [S5], [S6]

## 5. L2 — real application and browser

Use the authorized local checkout at the declared baseline, or explicitly record any reviewed differences. Do not substitute the hosted latest version. Run at 1280, 783 and 390 CSS pixels as the repository guide requires; record intended narrow-screen behavior and any blocked task, rather than assuming the desktop interaction exists unchanged at every width. Exercise keyboard access and focus, not only pointer clicks. [S7]

1. Load the seven typed rows and baseline settings. Read full-source totals and inspect contributors: 100/6 and 56. Select A from a real group mark; verify the five IDs, amount 35/four numeric contributors, and formula 30 across chart/card/table/Rows.
2. Export the dashboard table with search cleared. Capture the actual downloaded bytes and parse them: five data records, expected header and values. Do not count a clicked anchor as a successful download.
3. Search `needle` in the dashboard table. Check two records, hidden-field matching, unchanged linked cards and five records in Rows. Download and read the two-record CSV. Clear search and verify five. Perform and clear the independent Rows `check` search.
4. Restore table search `needle`. Edit the formula to `units * 3`; inspect searched values 3 and 12 plus A total 45. Undo the formula edit in host history, assert expression and totals; redo, assert them again. Inspect history scope so a keystroke/search event is not mistaken for the intended formula checkpoint.
5. Deliberately restore `units * 2`, retaining A and `needle`. Export the ordinary analysis. Read its real bytes: seven raw rows, saved expression, selection/search and context. Record the compatible application revision used to reopen it.
6. Open that file through the actual import route in a clean local browser context. Confirm A35/formula30, searched r1/r4 values 2/8, Rows five, original raw distinctions, and field context. Clear search and selection separately to recover five and then seven. Check that sender undo history was not promised as part of the file.
7. Repeat project export/import with the project fixture and P-OPTIONS/P-BINDING. Read actual file contents and source tables, then inspect evaluated rows. Confirm selected-view and full-project exports differ as specified.

If the named explanation job uses a PNG, capture one actual chart image in the same flow and inspect its visible value, scope cues and readable data against the screen. Record that observation separately; do not expand it into a universal image-export survey. The source review alone does not establish pixel fidelity.

Stop the sequence at the first wrong membership, numeric contributor, value, download payload or restoration state. Save a minimal expected/actual record and bounded reproduction. Do not continue to recipient testing with inconsistent artifacts. Re-run the failed path and directly affected contracts after repair; do not inflate this into a universal certification matrix.

### Proposed command run sheet — not executed

Use the existing checkout’s package setup. These commands are a handoff to Codex, not a claim that dependencies exist or that tests pass. Add the new assertions to the relevant tests in a separately authorized milestone; running existing files alone does not implement this plan.

```bash
# Existing contract suites; no commands below were run in this research.
pnpm --filter exploreda exec vitest run src/test/utils/saveDataUtils.test.ts src/test/providers/analysisReliability.test.tsx src/test/lib/analysis/evaluateProject.test.ts src/components/charts/DataTable/__tests__/DataTable.test.tsx
pnpm --filter demo exec vitest run src/SavedViewsWorkspace.test.tsx src/savedViewsHistory.test.ts
pnpm --filter exploreda check-types

# Start the repository's existing local browser workflow when prepared.
pnpm dev:agent
# Execute the numbered L2 task at 1280, 783 and 390 px; read downloaded bytes.
# Record keyboard/focus results and stop at the first unexplained mismatch.

# Only if AH02's docs/example milestone is actually implemented:
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify

# Once, at the required integration gate for the actual scoped change:
pnpm check
pnpm check:pr
```

The existing reliability test restores settings over existing data and invokes the CSV helper directly; the workspace test mocks `ExplorEda` and checks an anchor click. These are useful existing contracts, not evidence that L2 has passed. [S8]

## 6. L3 — recipient discrimination and demand gate

After L1/L2 pass, identify an actual author, intended recipient, finding and next action. Keep the normal cover message and current export controls as the baseline; do not create an artificially context-free control to make a companion appear necessary.

First try the existing export plus that normal message. If the recipient succeeds, record **no change**. If a named failure concerns choosing an export, table versus source scope, or opening steps, try the short guide below. Preserve the same underlying finding and factual information. Ask the recipient to complete the task, then explain it in their own words:

- What is the finding and its value? Which records and comparison population support it?
- How do the chart selection, table display and included file contents differ?
- Which calculation, parameter or exclusion matters to the interpretation?
- How would you inspect the finding or reuse its rows, and what software or input is required?
- What do you know about source identity and source time, and what additional data would opening the file reveal?

Keep the answer key out of the interview script. For this synthetic practice fixture, the reviewer-only key is A35, reference100, four valid amount contributors among five selected records, two searched records, seven raw rows in the analysis, `units * 2`, and unknown source-as-of. The native file supports compatible inspection; CSV cannot recover the original native types or missing/empty distinctions. For a real handoff, write a task-specific key before delivery. Require every critical value, scope and disclosure answer to be correct without author rescue; record an incorrect or unknown critical answer as a failure. Do not treat fluent paraphrase as success.

Record answers and task completion, author preparation time, clarification exchanges and any incorrect disclosure assumption. Do not prescribe an invented statistical threshold or claim a small study proves general demand.

The proposed AH03 entry gate is **two comparable real handoffs showing the same essential context failure after the guide**. These prior failures are required before the conditional note comparison; one synthetic exercise or one failed export does not pass the gate. After that gate, compare identical approved facts in an ordinary message and in one separate Markdown note using two distinct, comparable findings. Vary condition order or recipient where practical so memorization does not stand in for understanding. Do not add extra facts only to the note. Record whether keeping context with the file resolves the observed mistake or repeated clarification burden and whether the author can keep it correct within an effort budget agreed beforehand. This is a bounded diagnostic, not a causal or statistically generalizable result, and none of these real observations has been collected.

AH03 remains NO-GO if the guide/message succeeds, the note is unused or misleading, authors must maintain duplicate technical state, or the real need is a missing data dependency, typed interchange, reproducible computation, scheduled refresh or repeated analytical-result reuse. Those needs route to AH01, AH04 or AH05. An inconclusive exercise also means defer. Byron must choose the actual recipient, scope/disclosure policy and timestamp wording before an artifact feature is adopted.

## 7. Same-milestone documentation and example proposal

If AH02 is accepted, add **“Choose an export for your recipient”** to `apps/demo/src/docs/pages/export.mdx` and one proposed example, `apps/demo/src/demos/analysisHandoff.ts`, in the same milestone. The filename is a proposal, not an existing or created repository file. Register the example and live steps in the repository’s existing examples/coverage/docs machinery as required by the agent guide. Keep actual product copy focused on the task, with implementation caveats in the owning intent/research record. [S7]

### Proposed short lesson

> **Choose an export for your recipient**
>
> Start with what the recipient needs to do. Send an image and a short explanation when they need to understand a finding. State the selected population and comparison population beside the number.
>
> Send analysis JSON when they need to reopen the rows, formulas and view in compatible explorEDA. An ordinary analysis includes its source rows and settings. A project view includes the source tables its query depends on; those tables can contain more records than the visible selection. Review that scope before sharing. Use the whole-project export when the recipient needs the other views and sources too.
>
> Send table CSV when they need the records currently matching that table and its configured columns. Linked filters, dashboard-table search and Rows controls have different scopes. Search can match a field that is not among the exported columns. CSV includes calculated values, while formula definitions and field context remain in the analysis settings. Blank CSV cells do not preserve every missing-versus-empty distinction.
>
> Settings JSON and Dashboard text help recreate an arrangement with the appropriate data. They do not replace a source-data handoff. State how to open the file and what the recipient should check. Distinguish when the file was exported from when its source data was observed or refreshed; write “unknown” when the source time is unknown.

### Proposed example narrative

“Select A: the amount is 35 across four numeric contributors among five records. Search `needle` in the dashboard table: two records remain there, while the chart still describes A. Export the table, then clear search to compare five records. Export the analysis and reopen it to recover all seven source rows, the A selection and editable `units * 2` formula. Inspect the zero, missing and empty examples before choosing a file for another person.”

The example’s scripted steps must assert the expected scope and values already listed, including real download/reopen evidence where supported. Any optional companion is in a later conditional milestone; it does not block publishing a useful guide after AH01 passes.

### Conditional sample note — not an adopted schema

The following illustrates AH03 only. `orders-A.analysis.json` is a proposed human-readable handoff filename after deliberately renaming the actual downloaded analysis; the current download name uses the existing `.exploreda.json` convention. No such data file was produced in this research. Fill the actual export time only when that export occurs.

> # Group A finding
>
> **Open:** `orders-A.analysis.json` in the compatible explorEDA version recorded with this handoff. The file contains seven original source rows and saved settings. A is selected: five rows. The dashboard table additionally searches `needle`: two rows. Rows search is empty.
>
> **Finding:** A has amount 35, with four valid numeric contributors among five selected records. The comparison is all seven source rows: amount 100 from six numeric contributors. The searched table’s amount 15 is not that reference population. Amount is synthetic; no currency is implied.
>
> **Calculation:** `double_units = units * 2`. Full-source sum 56; selected-A sum 30; searched-table sum 10. Clear only the table search to inspect all five A records. Clear the linked A selection separately to inspect all seven source records.
>
> **Values:** Zero is valid. Missing amount is not zero. The original analysis retains mixed raw tokens and number/string identifiers; CSV collapses several blank distinctions and cannot retain all original scalar types.
>
> **Time and source:** Source-as-of unknown. Exported at: fill the actual export timestamp and timezone when created. Export time is not source freshness. Synthetic fixture only; do not treat this example’s disclosure as permission to share a real dataset’s hidden rows, names or descriptions.
>
> **Next action:** Reopen, inspect r1/r4 using units 1 and 4, then clear search and confirm A’s five records and amount 35. A repeated need to analyze grouped outputs is a different request and should name its downstream task.

## 8. Acceptance, rejection and handoff record

Acceptance is limited to this named fixture and the declared runtime. It does not close every chart-family, UTC-date, refresh or performance question in the existing trust intent.

**GO for local-trust acceptance** only when L1 and L2 records match the specified memberships, contributors, values, formula/history states and file scope, and every required dependency probe passes. A failed probe receives a bounded repair and rerun; assigning the repair does not count as a pass. Keep the affected reopening claim NO-GO until resolved. **GO for guide adoption** only when, after the relevant local proof passes, the tested copy reduces an observed confusion at acceptable author effort; if ordinary practice achieves the same outcome, retain no change. **NO-GO for companion implementation now:** no actual failed recipient task is supplied. The entry gate remains two comparable real guide-failed handoffs before the same-content message-versus-note diagnostic; a successful manual diagnostic earns only a separate scoped implementation decision. **NO-GO for result reuse expansion now:** no repeated downstream analytical task is supplied.

Record one row per check: check ID, exact baseline/environment, expected, actual, artifact/test evidence, pass/fail/not-run, and disposition. A test that was not run stays not-run. A source-predicted failure remains a hypothesis until exercised; an assertion failure receives a minimal reproduction before a product conclusion. Stop after the discriminating evidence is sufficient, preserving unresolved recipient, source disclosure, scope and time choices for Byron.

## Sources and coverage

Source labels are local to this document; AH01–AH05 are shared recommendation IDs. All repository links below are pinned to the declared baseline. Source was read as an authenticated selected-source packet plus exact-baseline supplemental files. No runtime, browser or recipient observations support this plan yet.

### S1

[Current trust intent](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md), especially “Next step”; [reusable outputs intent](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/reusable-analysis-outputs/intent-brief.md), especially demand/expansion trigger.
### S2

[`DataTable.tsx`, resolved rows/caller](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx#L46-L159); [`getFilteredRows`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts); [`RowsView`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/RowsView.tsx).
### S3

[`DataTableToolbar`, `handleExport`/`toTableCsv`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx); [`readTableText`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/readTable.ts); [`readDelimited`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/delimited.ts); [`typeTextColumns`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/columns.ts); [`detectColumnType`, exact-number/identifier rules](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts).
### S4

[`SavedAnalysisStructure`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/SavedDataStructure.ts); [`saveDataUtils` codecs](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/utils/saveDataUtils.ts#L31-L126); [`DataLayerProvider` save/restore](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1304-L1478); [`SavedViewsWorkspace.exportView`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.tsx#L687-L699).
### S5

[`projectFile`, closure/codec/validation](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/projectFile.ts); [`evaluateAnalysisQuery`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts); [`shopProject`, customer-instance/options](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/fixtures/shopProject.ts#L355-L479).
### S6

[`savedViewsSession`, project-table storage and fresh import](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsSession.ts); [`savedViewsHistory.pushCheckpoint`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.ts#L137-L190).
### S7

[`AGENTS.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md); [`agent-guide`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md); [`export.mdx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/export.mdx).
### S8

[`analysisReliability.test.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/providers/analysisReliability.test.tsx); [`evaluateProject.test.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts); [`SavedViewsWorkspace.test.tsx`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.test.tsx).

[S1]: #s1
[S2]: #s2
[S3]: #s3
[S4]: #s4
[S5]: #s5
[S6]: #s6
[S7]: #s7
[S8]: #s8
