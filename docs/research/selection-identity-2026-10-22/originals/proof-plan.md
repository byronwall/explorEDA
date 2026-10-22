# R077 proof plan: selection identity after immutable source replacement

**Repository:** `byronwall/explorEDA`  
**Exact baseline:** `f4cacdde180e16ad814451a8c064e394535565d6`  
**Research date:** 2026-10-22, America/Indianapolis  
**Scope:** one selection-identity mission; research and executable proof proposal only.

## 1. What this report establishes

The frozen experiment asks whether each retained row-specific selection still denotes the same logical record after immutable source replacement. Exact record membership is the primary oracle. Counts and distinctive sums are secondary checks. Equal names, equal display values, current array positions, and equal aggregate totals cannot substitute for identity.

**No product experiment was executed in this research.** The supplied packet is a selected text snapshot, not a runnable checkout. File reading, source authentication, hashing, and report packaging are executed artifact operations. The commands, test code, browser procedures, worker schedule, and predicted outcomes below remain **UNRUN**. Existing repository tests were read, not rerun. Source predictions must not be reported as reproduced defects, author observations, lifecycle results, performance measurements, or host-task evidence.

The independent hand-written oracle was frozen before behavior analysis as `R077-12-v1`. Its exact UTF-8 JSON bytes are reproduced in Appendix A. The SHA-256 is:

```text
297cb1920302814f98509b1ad5738915667b76f2091b04a93485a2040e776b15
```

The frozen core contract is deliberately stronger than a positional save:

- A plain workspace's numeric runtime IDs identify positions within one source snapshot. Replacing that source requires explicit invalidation of retained row-specific intent, including any restore path that would reintroduce old positions.
- The existing project path may retain a record only when its source identity is an unchanged, unique typed key and its output grain still means the same thing.
- Missing, duplicate, deleted, or differently typed identities remain unresolved when intent is retained. Unresolved inclusions must not silently become an absent filter that selects everything.
- A semantic predicate may legitimately acquire new matching records. A record-specific selection may not acquire them merely because their names or values look alike.
- Deliberate, observable reset is a separate acceptable contract choice. It is not a passing result for an oracle that expected preserved intent. Record that disposition explicitly.

These rules support SI01–SI07. SI08 keeps a new plain-key API deferred and rejects a universal identity/versioning/replay platform. Larger implementation remains proposed.

## 2. The frozen 12-record ledger

The source ID is `records`; its declared entity-key field is `key`. `logicalId` is an independent test label used to observe membership. Product identity must not be inferred from that label. The source order below defines baseline physical positions. A physical position is written `S0:records[index]`; `S0` is a test-run snapshot label, not an existing product API or saved property.

| Logical record / initial position | Typed key and repeated name | Cohort / measure |
| --- | --- | --- |
| L01 / 0 | number `101`; Mira | keep / 1 |
| L02 / 1 | string `"101"`; Mira | keep / 2 |
| L03 / 2 | number `202`; Theo | other / 4 |
| L04 / 3 | string `"k4"`; Theo | keep / 8 |
| L05 / 4 | boolean `true`; Sana | other / 16 |
| L06 / 5 | boolean `false`; Sana | keep / 32 |
| L07 / 6 | number `0`; Devon | other / 64 |
| L08 / 7 | string `"0"`; Devon | keep / 128 |
| L09 / 8 | string `"k9"`; Imani | other / 256 |
| L10 / 9 | number `303`; Imani | keep / 512 |
| L11 / 10 | string `"k11"`; Jules | other / 1024 |
| L12 / 11 | number `404`; Jules | keep / 2048 |

Powers of two make the baseline subset sums distinct, but the proof still compares the full logical-ID sets. The typed pairs `101`/`"101"` and `0`/`"0"` are different identities. Repeated names intentionally make name matching an unsafe replacement for identity. No observation is merged because its display values resemble another record.

### Frozen selections and ownership

| Scope | Frozen selection or predicate | Exact initial membership / checksum |
| --- | --- | --- |
| **C:** linked chart selection | `value/__ID`, runtime values `[1,4,9]` | L02, L05, L10 / 530 |
| **T:** Rows-local diagnostic selection | `rowsSettings.filters`, `value/__ID`, `[3,7,9]` | L04, L08, L10 / 648 |
| **W:** ownerless row selection | `workspaceFilters`, `value/__ID`, `[0,9,11]` | L01, L10, L12 / 2561 |
| **P:** ownerless semantic predicate | `cohort == "keep"` | L01, L02, L04, L06, L08, L10, L12 / 2731 |
| Combined Rows CSV | `C ∩ W ∩ P ∩ T` | L10 / 512 |
| Source-reference trace targets | L02 and L10 | Their exact source records, not two positions |

In a real provider fixture, represent P as `{ type: "value", field: "cohort", values: ["keep"] }`. The frozen JSON's `operator: "eq"` is a conceptual predicate description, not the `FilterTypes` shape. A project source step normally qualifies field names; use `records.cohort`, `records.measure`, and `records.logicalId` for that evaluated workspace. The unqualified names in the frozen source ledger remain unchanged. [P2][P5]

The combined set is a **Rows/CSV** oracle, not an assertion that Rows-local settings filter every chart. `updateRowsSettings` updates saved local settings. `RowsView` first takes global filtered IDs, then `DataTable` applies its own Rows filters and search. Workspace counts omit T. Chart live IDs can exclude their own dimension's selection, so they are not automatically the selected set. [P3][P6]

Add an ownership control without changing the frozen selections: disable W while keeping C, T, and P. Global `C ∩ P` must be `{L02,L10}`; Rows additionally applying T must be `{L10}`. With only C active, inspect both the chart's context population and the other views' filtered membership. This distinguishes correct self-exclusion from wrong identity.

The inspected table UI builds predicates from cell values; it does not establish a persistent record-checkbox feature. Seed T's internal-ID filter through typed test settings and label it a diagnostic. For a browser example, demonstrate actual point selection and actual cell predicates. A Mira cell predicate intentionally selects L01 and L02, and includes appended L13. [P7]

## 3. Mutation oracle: preserve, unresolved, physical target, export

Every mutation starts from the original selected baseline unless its description explicitly says to select a new initial fixture. Do not chain mutations and silently change the expected set. Let `C₀`, `T₀`, `W₀`, and `P₀` denote the exact initial sets above. Let `C−` be `{L02,L05}`, `T−` be `{L04,L08}`, and `W−` be `{L01,L12}`. These are explicit shorthands for the frozen sets, not outputs calculated from implementation.

| Mutation | Keyed contract: preserved / unresolved | Predicate and Rows CSV expectation |
| --- | --- | --- |
| **M00:** same objects, no replacement | C₀/T₀/W₀; none unresolved | P₀; CSV `{L10}` |
| **M01:** fresh array and fresh rows, same values/order | C₀/T₀/W₀; none | P₀; CSV `{L10}` |
| **M02:** reverse all records | C₀/T₀/W₀; none | P₀; CSV `{L10}` |
| **M03:** append L13, string key `k13`, name Mira, keep, measure 4096 | C₀/T₀/W₀; L13 joins no old row selection | P₀ plus L13; CSV `{L10}` |
| **M04:** delete selected L10 | C−/T−/W−; L10 unresolved in each owning row filter | P₀ minus L10; CSV empty |
| **M05:** delete unselected L03 | C₀/T₀/W₀; none | P₀; CSV `{L10}` |
| **M06:** change L09's key to number 303 | C−/T−/W−; old unique L10 identity is now ambiguous | P₀; CSV empty |
| **M07:** remove L10's key | C−/T−/W−; L10 unresolved | P₀; CSV empty |
| **M08:** number 303 becomes string `"303"` on L10 | C−/T−/W−; old typed identity unresolved | P₀; CSV empty |
| **M09:** expand each source record to two uniquely keyed child outputs | No old output-row selection preserved; all selected outputs unresolved because grain changed | P matches 14 child outputs listed in Appendix A; combined CSV empty |
| **M10:** clean-key control, assign `stable-L01` … `stable-L12` **before** selecting, then reverse | C₀/T₀/W₀; none | P₀; CSV `{L10}` |
| **M11:** remove cohort from schema and every row | Row identities retained; P explicitly invalid/unresolved | Combined export unavailable until deliberate repair/clear; no match-all substitution |
| **M12:** reverse the same array in place | Unsupported input, no correctness pass | No supported lifecycle expectation |

M11's explicit invalid-state requirement is a proposed contract, not proof that the current UI has such a state. An empty table by itself would not prove that a missing-field predicate was diagnosed. M12 is a documented support boundary, not an implementation failure. [P1][P2]

For a **plain unkeyed** workspace, M01–M11 instead require invalidating row-specific C/T/W intent on replacement. No old numeric ID may be reinterpreted as the new occupant of that index. A host may deliberately restore valid semantic predicates; its reset policy must be stated. Current no-save behavior also resets semantic filters, a broader existing reset that remains a useful control. When a filter is explicitly cleared, more rows can legitimately appear; report that as a reset and do not label those rows preserved selections. [P1]

### Physical references and trace targets

Observe separately: logical record label; current physical index; current runtime `__ID`; evaluation output key; and actual `AnalysisSourceReference` fields `sourceId`, `rowKey`, and optional `entityKey`. There is no existing `snapshotId` field in that reference type. A test-run snapshot marker can prevent accidental comparisons across generations without proposing a saved versioning platform. [P5]

| Mutation or control | Expected current physical target for a preserved source identity | Unresolved / trace rule |
| --- | --- | --- |
| M00/M01/M03 | L02 at 1; L10 at 9 | Logical references resolve; transient UI may deliberately close on M01/M03 replacement. |
| M02 reverse / M10 clean-key reverse | L02 at 10; L10 at 2 | Same source records, different positions; selected C runtime IDs become `[10,7,2]`, T `[8,4,2]`, W `[11,2,0]`. M10 starts from its separately selected clean-key fixture. Transient UI may deliberately close on either replacement. |
| M04 delete L10 | L02 at 1; no L10 position | Retained L10 reference must not become another record. |
| M05 delete L03 | L02 at 1; L10 at 8 | Deleting an unselected earlier row still changes selected physical positions. |
| M06 duplicate L10's key | L02 at 1; L10 still physically at 9 | Physical existence does not make its old unique identity resolvable. L09 at 8 must not be merged with L10. |
| M07/M08 | L02 at 1; L10 physically at 9 | Old typed key is unresolved despite unchanged position and measure. |
| M09 source-to-child grain | Source L02 and L10 still resolve to source positions 1 and 9 | Old output identity must not automatically mean both children. Source-reference resolvability is distinct from keeping an inspection panel open. |

The existing chart trace stores a revision and closes when it becomes stale; the main calculation editor closes when data changes. Preserve those behaviors as positive invalidation controls. A source resolver that can still locate L02 does not imply that an old chart trace should remain open. Inspect query-flow selection, source-reference resolution, chart trace, and calculation inspection independently. [P8][P9]

### Source predictions to challenge, not executed outcomes

For M02, reusing the old plain positional IDs would denote C `{L11,L08,L03}`, T `{L09,L05,L03}`, and W `{L12,L03,L01}`. For M05, it would denote C `{L02,L06,L11}`, T `{L05,L09,L11}`, and W `{L01,L11}`. These are deductions from positions. They do not claim the no-save reset exhibits a fault. The candidate fault needs the retained/supplied save condition that reapplies old IDs after reset. [P1]

The current project adapter maps chart-owned and Rows-owned `value/__ID` filters, but its traversal omits ownerless workspace filters and chart-local population filters. Its unresolved collector has the same limited ownership coverage. Source predicts that a workspace omission can fail even when the existing chart selection control succeeds. Only value filters on `__ID` enter this mapper; range/text/date filters on `__ID` are position predicates, not a promised key-preservation mechanism. Non-ID semantic ranges must remain unchanged. [P4]

### Additional adversarial probes, explicitly added after freezing

- **F01, already in the frozen oracle:** make L09/L10 duplicate number 303, or make L10's key missing, **then select physical L10**, then reverse or prepend. A fallback is a physical occurrence within the old snapshot. Assert no retarget. Check saved-output decoding and direct source-reference resolution separately: after a full reversal, the old fallback output key may disappear and become unresolved, while blindly resolving an old positional source reference can still address the new occupant. A lifecycle guard may prevent that direct call; the complete flow must be observed.
- **F02, supplemental:** begin with duplicate L09/L10, select L10, and swap only those two rows. Position-shaped fallback keys can remain present in the same order while their occupants change. Isolate the selection with P off, so L09's `other` cohort cannot hide a misselection. Expected retained membership is unresolved or explicit reset, never L09. L09's measure 256 and L10's 512 are secondary checks.
- **A01, supplemental:** in a fresh fixture, set L02's unique string key to `tag:row:9` and select it. Its typed row key becomes `records:string:tag:row:9`. Resolve that source reference and assert L02, not the record at position 9. The current resolver tests a `:row:<digits>` suffix before entity-key lookup; this is a narrow parser hypothesis suitable for a bounded test. [P10]
- **A02, supplemental output-key uniqueness:** for expand step `e`, use parent source `records` and child source `children`. Pair A has parent string key `x` and child string key `y:children:string:z`. Pair B has parent string key `x:children:string:y` and child string key `z`. Use a separate join field to establish exactly the intended parent/child match for each pair through one relationship. Raw concatenation predicts the same output key for both: `e:records:string:x:children:string:y:children:string:z`. Assert two distinct output identities and unmerged contributor sets. Do not infer replacement correctness from source-key uniqueness alone. This probe is unexecuted and does not change M09 or authorize a new key platform. [P11]

Reject the hypothesis **“all plain replacements necessarily retarget a selection.”** The no-save path resets. Also reject **“the project adapter already covers every saved filter owner.”** Its source traversal is narrower. The first rejection follows an explicit reset branch; the second follows an explicit ownership omission. Neither is an executed user-task result. [P1][P4]

## 4. Executable local proof proposal

### Checkout and execution gates

Codex must supply a complete local checkout at the exact baseline. The supplied snapshot lacks the complete package graph, lockfile, runtime, and browser fixtures needed to claim repository validation. Do not run installation commands in the extracted packet and call it the repository. Do not update to later `main` and attribute results to this baseline. The intended integration branch is `codex/selection-identity-research-2026-10-22`; branch creation, commits, integration, and the review PR belong to the separate Codex phase.

The existing repository prescribes pnpm and targeted Vitest tests before the full check. The package manager is pinned to pnpm 11.9.0. The run sheet below first verifies owner/ref, runs existing controls, verifies the frozen appendix, and materializes the proposed **test-only** file without overwriting an existing file. It does not contain a product fix. It is **UNRUN** here. [P12]

Set `R077_CHECKOUT` to the complete checkout and `R077_REPORT` to the absolute path of this downloaded report before running. All related commands are together below. The intended failing conformance tests should remain red in the baseline evidence; do not invert them merely to get green output.

```bash
# PROPOSED / UNRUN. Run in a complete local checkout, not the source packet.
set -eu
: "${R077_CHECKOUT:?Set R077_CHECKOUT to the full repository checkout}"
: "${R077_REPORT:?Set R077_REPORT to the absolute downloaded proof-plan.md path}"
export R077_REPORT
cd "$R077_CHECKOUT"
R077_BASELINE=f4cacdde180e16ad814451a8c064e394535565d6
R077_HEAD="$(git rev-parse HEAD)"
test "$R077_HEAD" = "$R077_BASELINE" || {
  printf '%s\n' "STOP: checkout is not the R077 baseline."
  exit 1
}
R077_ORIGIN="$(git remote get-url origin)"
case "$R077_ORIGIN" in
  https://github.com/byronwall/explorEDA|https://github.com/byronwall/explorEDA.git|git@github.com:byronwall/explorEDA.git) ;;
  *) printf '%s\n' "STOP: repository owner/name needs verification."; exit 1 ;;
esac
git status --short
if ! git diff --quiet || ! git diff --cached --quiet; then
  printf '%s\n' "STOP: tracked worktree or index changes prevent baseline attribution."
  exit 1
fi
if test -n "$(git ls-files --others --exclude-standard)"; then
  printf '%s\n' "STOP: review and remove untracked source/test/config files before baseline verification."
  exit 1
fi
test -f pnpm-lock.yaml
test -f pnpm-workspace.yaml
pnpm --version
node --version
pnpm install --frozen-lockfile

# Existing working controls; retain command output and exit status as evidence.
pnpm --filter exploreda exec vitest run \
  src/test/providers/projectIdentity.test.tsx \
  src/test/lib/analysis/sourceRowIdentity.test.ts \
  src/test/providers/dataLayerState.test.ts \
  src/test/providers/DataLayerProvider.test.tsx \
  src/test/lib/analysis/evaluateProject.test.ts

# Extract the exact frozen bytes and proposed test from this report.
# This creates only a new test file; it refuses to replace existing work.
python3 - <<'PY'
import hashlib
import os
from pathlib import Path

report = Path(os.environ['R077_REPORT']).read_text(encoding='utf-8')
oracle = report.split('<!-- R077-ORACLE-BEGIN -->\n```json\n', 1)[1]
oracle = oracle.split('\n```\n<!-- R077-ORACLE-END -->', 1)[0] + '\n'
expected = '297cb1920302814f98509b1ad5738915667b76f2091b04a93485a2040e776b15'
actual = hashlib.sha256(oracle.encode('utf-8')).hexdigest()
if actual != expected:
    raise SystemExit(f'STOP: frozen oracle digest mismatch: {actual}')
code = report.split('<!-- R077-TEST-BEGIN -->\n```ts\n', 1)[1]
code = code.split('\n```\n<!-- R077-TEST-END -->', 1)[0] + '\n'
target = Path('packages/explorEDA/src/test/lib/analysis/selectionIdentity.r077.test.ts')
if target.exists():
    raise SystemExit(f'STOP: existing file requires review: {target}')
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(code, encoding='utf-8')
print(f'[R077] verified frozen oracle {actual}')
print(f'[R077] wrote proposed test-only fixture {target}')
PY

# Contract probe: baseline failures are expected hypotheses, not a fix.
pnpm --filter exploreda exec vitest run \
  src/test/lib/analysis/selectionIdentity.r077.test.ts
pnpm --filter exploreda check-types

# Stop on failure. Record exact assertions before considering any repair.
# After independently reviewed implementation and completed lifecycle proof,
# Codex runs the repository-wide check once in its integration checkout:
# pnpm check
```

The run sheet uses `set -e`: a failing new conformance test stops before the subsequent type check. After retaining that failure evidence, Codex can run the printed type-check command separately to distinguish a runtime assertion from a type/import error. The proposed test is not a substitute for the component/browser stages below. A helper-level reproduction establishes only that helper's behavior.

### Proposed minimal Vitest fixture

Destination, **new/proposed**: `packages/explorEDA/src/test/lib/analysis/selectionIdentity.r077.test.ts`.

Imports and settings shapes are taken from actual baseline exports: `analysisRowKeys`, `sourceRowIdentity`, `DEFAULT_SCATTER_SETTINGS`, and `SavedRowsSettings`. The fixture has no browser dependency beyond the repository's ordinary test environment. It reuses the hand ledger, asserts explicit expected keys/positions, and does not implement a mapper or resolver. Logging identifies the scenario under test. Its workspace/local-scope and suffix assertions are intentionally contract assertions predicted to fail at this baseline; no pass/fail count has been observed. [P4][P5][P10][P13]

<!-- R077-TEST-BEGIN -->
```ts
import { describe, expect, it } from "vitest";
import {
  decodeAnalysisRowKeys,
  encodeAnalysisRowKeys,
  unresolvedAnalysisRowKeys,
} from "@/components/project/analysisRowKeys";
import {
  resolveSourceRow,
  sourceRowIdentities,
} from "@/components/project/sourceRowIdentity";
import { applyFilter } from "@/hooks/applyFilter";
import { initializeData } from "@/providers/lib/dataLayerState";
import { DEFAULT_SCATTER_SETTINGS } from "@/utils/defaultSettings";
import type { AnalysisSourceRow, SourceDefinition } from "@/types/AnalysisProject";
import type { Filter, ValueFilter } from "@/types/FilterTypes";
import type { SavedRowsSettings } from "@/types/SavedDataTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

const rows: AnalysisSourceRow[] = [
  { logicalId: "L01", key: 101, name: "Mira", cohort: "keep", measure: 1 },
  { logicalId: "L02", key: "101", name: "Mira", cohort: "keep", measure: 2 },
  { logicalId: "L03", key: 202, name: "Theo", cohort: "other", measure: 4 },
  { logicalId: "L04", key: "k4", name: "Theo", cohort: "keep", measure: 8 },
  { logicalId: "L05", key: true, name: "Sana", cohort: "other", measure: 16 },
  { logicalId: "L06", key: false, name: "Sana", cohort: "keep", measure: 32 },
  { logicalId: "L07", key: 0, name: "Devon", cohort: "other", measure: 64 },
  { logicalId: "L08", key: "0", name: "Devon", cohort: "keep", measure: 128 },
  { logicalId: "L09", key: "k9", name: "Imani", cohort: "other", measure: 256 },
  { logicalId: "L10", key: 303, name: "Imani", cohort: "keep", measure: 512 },
  { logicalId: "L11", key: "k11", name: "Jules", cohort: "other", measure: 1024 },
  { logicalId: "L12", key: 404, name: "Jules", cohort: "keep", measure: 2048 },
];
const source: SourceDefinition = {
  id: "records", name: "Records", glyph: "R", entityKey: "key", fields: [],
};
const keys = [
  "records:number:101", "records:string:101", "records:number:202",
  "records:string:k4", "records:boolean:true", "records:boolean:false",
  "records:number:0", "records:string:0", "records:string:k9",
  "records:number:303", "records:string:k11", "records:number:404",
];
const keysById = new Map<number, string>(keys.map((key, id) => [id, key]));
const reverseIds = new Map<string, number>(keys.map((key, id) => [key, 11 - id]));
const idFilter = (values: ValueFilter["values"]): ValueFilter => ({
  type: "value", field: "__ID", values,
});
function values(filters: Filter[] | undefined) {
  const filter = filters?.find((item) => item.field === "__ID");
  if (!filter || filter.type !== "value") throw new Error("Missing test filter");
  return filter.values;
}
function settings(): SavedDataStructure {
  const rowsSettings: SavedRowsSettings = {
    columns: ["logicalId", "key", "name", "cohort", "measure"].map((field) => ({
      id: field, field,
    })),
    sortDirection: "asc", globalSearch: "", filters: [idFilter([3, 7, 9])],
  };
  return {
    charts: [{
      ...DEFAULT_SCATTER_SETTINGS, id: "C", title: "C identity probe",
      xField: "measure", yField: "measure", filters: [idFilter([1, 4, 9])],
    }],
    rowsSettings,
    workspaceFilters: [
      idFilter([0, 9, 11]),
      { type: "value", field: "cohort", values: ["keep"] },
    ],
    calculations: [], colorScales: [],
    gridSettings: {
      columnCount: 12, rowHeight: 100, containerPadding: 10,
      showBackgroundMarkers: false,
    },
    metadata: {
      name: "R077", version: 1,
      createdAt: "2026-10-22", modifiedAt: "2026-10-22",
    },
  };
}

describe("R077 frozen controls and proposed contract probes", () => {
  it("keeps typed source keys distinct and matches the hand-written keys", () => {
    console.info("[R077] typed-key baseline control");
    expect(sourceRowIdentities(source, rows).map(({ ref }) => ref.rowKey))
      .toEqual(keys);
    expect(new Set(keys).size).toBe(12);
  });

  it("preserves chart and Rows keys through reverse mapping", () => {
    console.info("[R077] existing chart/Rows mapper positive control");
    const encoded = encodeAnalysisRowKeys(settings(), keysById);
    expect(values(encoded.charts[0]!.filters)).toEqual([
      "records:string:101", "records:boolean:true", "records:number:303",
    ]);
    expect(values(encoded.rowsSettings!.filters)).toEqual([
      "records:string:k4", "records:string:0", "records:number:303",
    ]);
    const decoded = decodeAnalysisRowKeys(encoded, reverseIds);
    expect(values(decoded.charts[0]!.filters)).toEqual([10, 7, 2]);
    expect(values(decoded.rowsSettings!.filters)).toEqual([8, 4, 2]);
  });

  it("requires workspace row-selection mapping parity", () => {
    console.info("[R077] proposed workspace mapping contract; predicted baseline red");
    const encoded = encodeAnalysisRowKeys(settings(), keysById);
    expect(values(encoded.workspaceFilters)).toEqual([
      "records:number:101", "records:number:303", "records:number:404",
    ]);
    expect(values(decodeAnalysisRowKeys(encoded, reverseIds).workspaceFilters))
      .toEqual([11, 2, 0]);
  });

  it("requires parity for legal chart-local row populations", () => {
    console.info("[R077] injected local population; predicted baseline red");
    const input = settings();
    input.charts[0]!.localFilters = [idFilter([0, 9, 11])];
    const encoded = encodeAnalysisRowKeys(input, keysById);
    expect(values(encoded.charts[0]!.localFilters)).toEqual([
      "records:number:101", "records:number:303", "records:number:404",
    ]);
  });

  it("keeps an all-unresolved positive inclusion restrictive", () => {
    console.info("[R077] missing-key inclusion must not become no filter");
    const input = settings();
    input.charts[0]!.filters = [idFilter(["records:number:303"])];
    input.rowsSettings!.filters = [];
    input.workspaceFilters = [];
    const decoded = decodeAnalysisRowKeys(input, new Map<string, number>());
    const filter = decoded.charts[0]!.filters[0]!;
    expect(filter.type).toBe("value");
    expect(unresolvedAnalysisRowKeys(decoded)).toEqual([
      "__unresolved-analysis-row-key__:records:number:303",
    ]);
    expect(initializeData(rows).dataWithIds
      .filter((row) => applyFilter(row.__ID, filter))).toEqual([]);
  });

  it("requires ownerless unresolved intent to be diagnosed", () => {
    console.info("[R077] workspace unresolved diagnostics; predicted baseline red");
    const input = settings();
    input.charts = [];
    input.rowsSettings = undefined;
    input.workspaceFilters = [idFilter(["records:number:303"])];
    const decoded = decodeAnalysisRowKeys(input, new Map<string, number>());
    expect(unresolvedAnalysisRowKeys(decoded)).toContain(
      "__unresolved-analysis-row-key__:records:number:303",
    );
  });

  it("does not alter non-ID predicates during key conversion", () => {
    console.info("[R077] semantic predicate negative control");
    const input = settings();
    input.charts[0]!.filters = [
      { type: "range", field: "measure", min: 1, max: 512 },
    ];
    const encoded = encodeAnalysisRowKeys(input, keysById);
    expect(encoded.charts[0]!.filters).toEqual(input.charts[0]!.filters);
    expect(encoded.workspaceFilters![1]).toEqual(input.workspaceFilters![1]);
  });

  it("does not resolve a unique key after it becomes missing, duplicate, or retyped", () => {
    console.info("[R077] M06/M07/M08 source-reference controls");
    const ref = sourceRowIdentities(source, rows)[9]!.ref;
    const missing = rows.map((row, index) => {
      if (index !== 9) return { ...row };
      const copy = { ...row };
      delete copy.key;
      return copy;
    });
    const duplicate = rows.map((row, index) =>
      index === 8 ? { ...row, key: 303 } : { ...row });
    const retyped = rows.map((row, index) =>
      index === 9 ? { ...row, key: "303" } : { ...row });
    expect(resolveSourceRow(source, missing, ref)).toEqual({ issue: "unresolved" });
    expect(resolveSourceRow(source, duplicate, ref)).toEqual({ issue: "ambiguous" });
    expect(resolveSourceRow(source, retyped, ref)).toEqual({ issue: "unresolved" });
    expect(resolveSourceRow(source, [...rows].reverse(), ref).row?.logicalId)
      .toBe("L10");
  });

  it("does not parse a typed string-key suffix as a physical position", () => {
    console.info("[R077] supplemental A01; predicted baseline red");
    const special = rows.map((row, index) =>
      index === 1 ? { ...row, key: "tag:row:9" } : { ...row });
    const ref = sourceRowIdentities(source, special)[1]!.ref;
    expect(ref.rowKey).toBe("records:string:tag:row:9");
    expect(resolveSourceRow(source, special, ref).row?.logicalId).toBe("L02");
  });
});
```
<!-- R077-TEST-END -->

This file provides minimum mapper/source-reference proof, not the whole experiment. F01/F02 require caller-level snapshot lifecycle tests because an old fallback reference contains no generation. A direct resolver assertion cannot prove that a UI makes that call after its own invalidation. A02 requires an actual two-pair expansion fixture. Those extensions remain part of the plan below.

## 5. Component, worker, inspection, and export stages

### A. Full replacement matrix

Extend the existing `src/test/providers/projectIdentity.test.tsx` and `DataLayerProvider.test.tsx`; keep the successful unique-order reorder/removal test intact. Use a mounted probe under `DataLayerProvider` to capture current runtime rows, settings, global crossfilter IDs, chart live items, and callback history. Do not read a stale state object once and mistake it for a later render. Use `act` and `waitFor` with the repository's configured time limits, not arbitrary sleeps. [P12][P14]

For every M00–M11 mutation, run these host cases independently:

1. Plain workspace without `savedData`, selecting after initial mount.
2. Plain workspace with the **same supplied savedData object** retained across replacement.
3. Plain workspace with a copied/serialized retained snapshot, and a separate same-data echo control.
4. Explicit save/restore after replacement, with old numeric selections and with deliberate host invalidation.
5. Project workspace with settings obtained through `ExplorEdaProject.getSettings()` and restored as project view settings.
6. Project same-data echo, source-array replacement, field metadata replacement, and query-grain change.

Observe source array references and `fieldNames`/`fieldTypes` references explicitly. Otherwise a supposedly unchanged case may accidentally trigger a provider reset. Test source-table arrays and the enclosing `tables` object consistently with the hook dependency boundary. The project owner must not echo settings encoded for one completed evaluation while silently pairing them with another result. [P1][P15]

For each settled case record C/T/W filter payloads, P's predicate, resolved logical IDs, current physical targets, unresolved reasons, chart/table membership, and serialized state. Include raw positional `__ID` range/text filters only as unsupported-for-key-preservation diagnostics; require clear snapshot behavior rather than inventing their stable-key conversion.

### B. Pending worker schedule

Use the existing `AnalysisWorker` interface (`postMessage`, `terminate`, `onmessage`, `onerror`) with a controlled queue; no real timing benchmark is needed. The baseline hook retains the previous same-query result while pending and suppresses stale request IDs. This is a source fact, not proof that every surrounding inspection reference uses the same generation. [P15]

| Controlled step | Required observation |
| --- | --- |
| Finish request A for S0 | Exact S0 selected memberships and trace source records establish the starting state. |
| Send B for reversed S1; hold B | Pending rows, keys, counts, applied bindings, and filters describe one coherent displayed evaluation. Inspect source references while pending; do not pair old result references with incompatible new table occupants. |
| Send C for S2 constructed independently from S0 using one specified mutation, M04 or M07; hold C | Do not derive S2 by mutating reversed S1. New request ID is recorded. Capture host callback/save payloads and any unresolved state before completion. |
| Deliver late B | B must not become the displayed result or selection map. Assert exact current logical labels, not just a pending badge. |
| Deliver C | C's rows, key map, predicates, and unresolved status become coherent together. C/T/W and Rows CSV match the frozen mutation oracle. |
| Change query ID, then deliver old result; test error | Old query results must not reappear. An error/empty result must not silently convert selected inclusions into “all rows.” |
| Unmount | Worker termination and stale-message handling use existing lifecycle expectations; record observations without claiming CPU cancellation or speed. |

Repeat the held request with F02's duplicate-position swap, where ordered fallback keys may look unchanged. Inspect chart trace, source-record drawer/query flow, and a pinned calculation badge separately. If existing invalidation closes a panel, record an explicit reset; do not require invisible UI state to persist merely because a source key is still resolvable.

### C. Exact export and inspection evidence

For the component test, intercept `URL.createObjectURL` to retain the actual `Blob` passed by `DataTableToolbar.handleExport`; trigger the real export button. Read its text and parse CSV with the existing reader or a standards-compliant test reader. In a browser test, use the actual download event. The helper `toTableCsv` alone verifies formatting of given rows, not that the toolbar supplied the right rows. [P6]

- Configure visible columns including the test logical label and measure. Compare the exact exported logical-label set to the oracle and compare ordered rows when a sort is explicitly specified. Verify typed keys in the captured source/settings state; CSV stringification alone cannot distinguish `101` from `"101"`.
- Assert unchanged, reverse, append, selected deletion, unselected deletion, duplicate, missing, retyped-key, and changed-grain exports. The combined settled Rows membership is `{L10}` or the specified empty/unavailable result. Separately assert C/T/W isolated memberships so an empty combined intersection cannot hide two wrong selections.
- Assert the source-predicate-only control: append adds L13 to P and to a Mira name predicate, but not to pre-existing row-specific selections.
- Assert that workspace `saveAnalysisToStructure()` contains **every current provider input row**, including unselected rows, plus current settings. In plain mode these are the supplied raw rows. Inside `ExplorEdaProject`, they are the evaluated query rows passed to the inner workspace; for M09 this control expects all 24 expanded outputs, not every underlying parent/child source table. It must not be compared with a filtered CSV subset as though the two exports share a contract. [P3][P16]
- Keep native project serialization distinct: `stringifyAnalysisProject(file)` accepts an `AnalysisProjectFileInput` containing project, tables, and views, and serializes those provided source tables and views. `selectAnalysisProjectView(file, viewId)` can prune tables by dependencies, retaining the whole included tables. This is a separate whole-project control, not the workspace's Full analysis JSON or selected Rows CSV. [P17]
- Capture `getSettings()` before/after restore and confirm no selected record changes because its key became missing or unresolved. Check an all-unresolved positive inclusion remains restrictive until an intentional clear/reselect. Check partial unresolved sets preserve the surviving records exactly.
- For traces, capture actual `sourceId`, `rowKey`, optional `entityKey`, resolved source row, and contributor set. A current aggregate row has its own identity and may have several source contributors. Do not call every contributor the selected output record.

The runnable example remains proposed: one new `apps/demo/src/docs/live/SelectionIdentityExample.tsx`, imported directly into existing `apps/demo/src/docs/pages/developers.mdx`, with explicit lifecycle assertions added to existing `apps/demo/e2e/pages.e2e.ts`. The normal live-example specification does not itself supply source-replacement/project controls. A new arbitrarily named E2E file is not automatically selected by the existing Playwright projects. The full paired documentation milestone is in `integration-plan.md`. [P18]

Use real interactions at the repository's wide review size and verify the intermediate/narrow explanation or fallback at the other required widths. This does not promise mobile support for the desktop workspace. A static arithmetic panel alone does not satisfy the runnable example or browser gate. [P12][P18]

## 6. Acceptance, rejection, and stop gates

| Gate | Pass condition / stop condition |
| --- | --- |
| **G0 provenance** | Owner, exact ref, complete checkout, and frozen oracle digest verified. Stop if source/runtime differs; record the smallest missing input. |
| **G1 existing controls** | Current unique-key chart reorder/removal, same-data echo behavior, immutable-input boundary, semantic predicates, Rows locality, and trace/editor invalidation remain intact. Stop a repair that regresses them. |
| **G2 identity** | Every preserved selection resolves to the exact original logical record under unchanged trustworthy typed identity and grain; no position/name/equal-value substitution. |
| **G3 scope parity** | Every supported filter owner uses consistent encode/decode/diagnostics and missing-schema treatment, without making Rows-local settings global. Legal injected scopes are labeled separately from actual UI flows. |
| **G4 unresolved** | Deleted, missing, duplicate, changed-type, and changed-grain targets are explicit unresolved/reset outcomes; all-unresolved inclusion never turns into match-all by filter omission. |
| **G5 lifecycle** | Worker pending/late-result schedules, host echoes, inspection targets, and exports refer to the same displayed evaluation or explicitly stop/close. No stale source-reference rebind. |
| **G6 exports** | Captured CSV bytes have the exact intended membership; workspace Full analysis JSON includes all provider input rows (query outputs in project mode), while native project serialization includes the supplied source tables. Counts/sums alone cannot pass. |
| **G7 bounded decision** | A reproduced narrow adapter/resolver failure supports a bounded repair with docs and example. If exact supported controls agree and only explanation is missing, keep behavior and document it. |
| **G8 API rejection** | Reject a new plain-row-key API if explicit invalidation or existing project promotion covers useful cases more simply, or hosts cannot supply trustworthy keys. No demand is inferred from the fixture. |

Codex owns independent verification, reconciliation against the integration branch, any authorized repair, the full `pnpm check`, and the open review PR. This research does not create product changes or claim these gates passed. The smallest presently missing input for product conclusions is a complete baseline checkout with the proposed tests and real lifecycle/export run records. Helper failures alone would justify focused investigation, not a platform rewrite.

## Source references for this proof plan

All links below are exact-baseline source references accessed on 2026-10-22. They establish the code/test seams and source predictions, not executed evidence.

- **P1:** [initializeData, positional runtime IDs](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/lib/dataLayerState.ts#L7-L21); [DataLayerProvider reset](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L682-L749); [prop replacement, restore, echo and callbacks](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1586-L1684).
- **P2:** [FilterTypes](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/FilterTypes.ts#L1-L35); [package immutable-input/save guidance](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/README.md#L73-L105).
- **P3:** [Rows-local settings and save/full-analysis export](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1297-L1355); [RowsView membership](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/RowsView.tsx#L20-L51).
- **P4:** [analysisRowKeys encode/decode/unresolved traversal](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/analysisRowKeys.ts#L4-L63); [chart-local population consumption](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/chartPopulation.ts#L19-L41).
- **P5:** [source definition, source references, output and contributor types](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/AnalysisProject.ts#L13-L19); [AnalysisSourceReference and AnalysisResultRow](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/AnalysisProject.ts#L153-L173).
- **P6:** [CrossfilterWrapper ownership/membership](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/CrossfilterWrapper.ts#L130-L210); [DataTable row filtering](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts#L10-L46); [DataTable passes filteredRows to toolbar](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx#L123-L158); [actual CSV export handler](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx#L35-L58); [toTableCsv](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx#L169-L177).
- **P7:** [cell-value predicates, not record checkboxes](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/DataTable/DataTableContextMenu.tsx#L42-L70).
- **P8:** [ChartTraceScope stale-revision invalidation](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx#L108-L118); [useTraceRevision](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx#L169-L175).
- **P9:** [CalculationEditor closes on data replacement](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/calculations/CalculationEditor.tsx#L63-L88); [badge-local open state and positional value lookup](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/calculations/CalculatedFieldBadge.tsx#L29-L49).
- **P10:** [sourceRowIdentities and resolveSourceRow](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/sourceRowIdentity.ts#L21-L81).
- **P11:** [expand output key construction](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/evaluateProject.ts#L398-L425).
- **P12:** [AGENTS test/docs/example rules](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/AGENTS.md); [agent guide commands and tests](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/agent-guide.md); [pnpm pin/check script](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/package.json#L8-L29).
- **P13:** [SavedRowsSettings](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/SavedDataTypes.ts#L12-L18); [DEFAULT_SCATTER_SETTINGS](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/utils/defaultSettings.ts#L81-L87).
- **P14:** [existing chart selection reorder/removal test](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/providers/projectIdentity.test.tsx#L39-L107); [existing host-echo control](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/providers/DataLayerProvider.test.tsx#L884-L930).
- **P15:** [AnalysisWorker test interface](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts#L23-L27); [worker request/result handling and pending evaluation](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts#L108-L189).
- **P16:** [project passes evaluated result rows into the workspace](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/ExplorEdaProject.tsx#L144-L146).
- **P17:** [selectAnalysisProjectView retains whole dependency-selected tables](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/projectFile.ts#L94-L147); [stringifyAnalysisProject serializes native project tables/views](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/projectFile.ts#L151-L163).
- **P18:** [existing developers documentation](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/developers.mdx); [LiveExampleSpec](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/live/examples.ts#L42-L80); [explicit Playwright project file matching](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/playwright.config.ts#L43-L50); [existing page lifecycle/viewport test destination](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/e2e/pages.e2e.ts#L17-L96).

## Appendix A. Frozen oracle bytes

The following block is the complete original `frozen-oracle.json`, unchanged. Extract the block as UTF-8 with its final newline to reproduce the SHA-256 above. F02/A01/A02 and the ownership instrumentation clarification are outside this frozen block and do not alter it.

<!-- R077-ORACLE-BEGIN -->
```json
{
  "oracle_id": "R077-12-v1",
  "frozen_before_behavior_analysis": true,
  "baseline": "f4cacdde180e16ad814451a8c064e394535565d6",
  "meaning": "Normative hand-written oracle, not observed product behavior. logicalId is test-only provenance. Source id is records; entityKey is key. Row-specific selections preserve a record only with a unique, unchanged typed key in the same source and unchanged output grain. Otherwise retained intent is explicitly unresolved, never rebound by position or equal display values. Plain unkeyed replacement deliberately invalidates row-specific selections and transient references.",
  "ledger": [
    {"logicalId":"L01","key":101,"name":"Mira","cohort":"keep","measure":1},
    {"logicalId":"L02","key":"101","name":"Mira","cohort":"keep","measure":2},
    {"logicalId":"L03","key":202,"name":"Theo","cohort":"other","measure":4},
    {"logicalId":"L04","key":"k4","name":"Theo","cohort":"keep","measure":8},
    {"logicalId":"L05","key":true,"name":"Sana","cohort":"other","measure":16},
    {"logicalId":"L06","key":false,"name":"Sana","cohort":"keep","measure":32},
    {"logicalId":"L07","key":0,"name":"Devon","cohort":"other","measure":64},
    {"logicalId":"L08","key":"0","name":"Devon","cohort":"keep","measure":128},
    {"logicalId":"L09","key":"k9","name":"Imani","cohort":"other","measure":256},
    {"logicalId":"L10","key":303,"name":"Imani","cohort":"keep","measure":512},
    {"logicalId":"L11","key":"k11","name":"Jules","cohort":"other","measure":1024},
    {"logicalId":"L12","key":404,"name":"Jules","cohort":"keep","measure":2048}
  ],
  "selections": {
    "C_chart": ["L02","L05","L10"],
    "T_rowsSettings": ["L04","L08","L10"],
    "W_workspace_rows": ["L01","L10","L12"],
    "P_workspace_predicate": {"field":"cohort","operator":"eq","value":"keep","matches":["L01","L02","L04","L06","L08","L10","L12"]},
    "combined_intersection": ["L10"],
    "trace_targets": ["L02","L10"]
  },
  "mutations": [
    {"id":"M00","operation":"Unchanged object and array references; no source replacement.","preserved":{"C":["L02","L05","L10"],"T":["L04","L08","L10"],"W":["L01","L10","L12"]},"unresolved":[],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":["L10"]},
    {"id":"M01","operation":"Fresh array and fresh row objects; identical order, keys, fields and values.","preserved":{"C":["L02","L05","L10"],"T":["L04","L08","L10"],"W":["L01","L10","L12"]},"unresolved":[],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":["L10"]},
    {"id":"M02","operation":"Reverse all 12 records in a fresh source array.","preserved":{"C":["L02","L05","L10"],"T":["L04","L08","L10"],"W":["L01","L10","L12"]},"unresolved":[],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":["L10"]},
    {"id":"M03","operation":"Append L13: key string k13, name Mira, cohort keep, measure 4096.","preserved":{"C":["L02","L05","L10"],"T":["L04","L08","L10"],"W":["L01","L10","L12"]},"unresolved":[],"P":["L01","L02","L04","L06","L08","L10","L12","L13"],"combined":["L10"]},
    {"id":"M04","operation":"Delete selected L10, leave all other records in baseline order.","preserved":{"C":["L02","L05"],"T":["L04","L08"],"W":["L01","L12"]},"unresolved":["L10"],"P":["L01","L02","L04","L06","L08","L12"],"combined":[]},
    {"id":"M05","operation":"Delete unselected L03, leave all other records in baseline order.","preserved":{"C":["L02","L05","L10"],"T":["L04","L08","L10"],"W":["L01","L10","L12"]},"unresolved":[],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":["L10"]},
    {"id":"M06","operation":"Change only L09.key from string k9 to number 303, duplicating selected L10's key.","preserved":{"C":["L02","L05"],"T":["L04","L08"],"W":["L01","L12"]},"unresolved":["L10"],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":[]},
    {"id":"M07","operation":"Remove only L10.key; do not infer identity from its name or measure.","preserved":{"C":["L02","L05"],"T":["L04","L08"],"W":["L01","L12"]},"unresolved":["L10"],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":[]},
    {"id":"M08","operation":"Change only L10.key from number 303 to string 303.","preserved":{"C":["L02","L05"],"T":["L04","L08"],"W":["L01","L12"]},"unresolved":["L10"],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":[]},
    {"id":"M09","operation":"Change query from one output per record to two child outputs per record. Child keys are string <logicalId>-a and <logicalId>-b, uniquely keyed; preserve source references, do not promote old output-row selection to both children.","preserved":{"C":[],"T":[],"W":[]},"unresolved":["all previously selected output rows; grain changed"],"P_source":["L01","L02","L04","L06","L08","L10","L12"],"P_output":["L01/a","L01/b","L02/a","L02/b","L04/a","L04/b","L06/a","L06/b","L08/a","L08/b","L10/a","L10/b","L12/a","L12/b"],"combined":[],"source_trace_preserved":["L02","L10"]},
    {"id":"M10","operation":"Clean-key positive control: set all keys to unique strings stable-L01 through stable-L12 before selecting, then reverse. This is a separate initial selection, not identity migration.","preserved":{"C":["L02","L05","L10"],"T":["L04","L08","L10"],"W":["L01","L10","L12"]},"unresolved":[],"P":["L01","L02","L04","L06","L08","L10","L12"],"combined":["L10"]},
    {"id":"M11","operation":"Remove cohort from schema and every row; retain key and measure. P becomes invalid; no accidental match-all fallback. Combined export remains unavailable until P is explicitly cleared or repaired.","preserved":{"C":["L02","L05","L10"],"T":["L04","L08","L10"],"W":["L01","L10","L12"]},"unresolved":["P: missing field cohort"],"P":[],"combined":[],"status":"invalid-schema"},
    {"id":"M12","operation":"Mutate the same source array in place by reversing it. Outside supported immutable input; no correctness pass inferred from incidental updates.","preserved":null,"unresolved":null,"status":"unsupported-input"}
  ],
  "fallback_control": "F01: before selecting, make L09 and L10 duplicate number 303, or remove L10.key. Select the physical occurrence L10. Then immutably reverse or prepend a record. Its old position must be invalidated/unresolved, never rebound to the new occupant. It does not acquire a stable identity through position.",
  "predicate_control": "N01: name == Mira is intentionally a value predicate and selects L01 plus L02, then also L13 after M03; it is not a row-identity promise.",
  "plain_contract": "For M01-M11 in plain mode with positional IDs, invalidate all row-specific filters across C/T/W and transient row refs on source replacement; retain semantic predicates only if schema-valid and explicitly restored. M00 preserves. M12 unsupported. Clearing must be observable, and a vacuous row filter must not silently become match-all.",
  "unresolved_policy": "The oracle retains unresolved intent and excludes unresolved targets from selected membership. Partial resolutions remain exact; all-unresolved positive inclusion filters match no rows until deliberate user clear/reselect. An explicit whole-selection reset is an alternative contract, not oracle equivalence, and requires a visible/reportable reset event.",
  "evidence_limit": "Freezing and hash validation are artifact operations, not a product experiment. No pnpm, browser, component lifecycle, worker scheduling, export, or host task result is asserted."
}
```
<!-- R077-ORACLE-END -->
