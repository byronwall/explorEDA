# Exact empty-selection recovery fixture guide

Baseline: `d3920a285f3755a8324998775deb131747e959f5`.

## Recommended use

Use `empty-selection-fixtures.json` as the expected-record contract. Run the companion to inspect exact outcomes before translating them into focused repository tests. The expectations were authored separately from the evaluator; the runner checks their membership arrays and counts.

```bash
# From the extracted deliverables directory; no install is needed.
node verify-empty-selection-fixtures.mjs --output empty-selection-verification.json

# In the repository environment, the same standalone check can be invoked through pnpm.
pnpm exec node verify-empty-selection-fixtures.mjs --output empty-selection-verification.json
```

Executed result: **29 scenarios, 72 preview alternatives, 422 assertions passed.**

## What was executed, and what remains proposed

- The verifier embeds the exact baseline pure helper bodies from `valueParsing.ts`, `categories.ts`, `specification.ts`, `applyFilter.ts`, `chartPopulation.ts`, and `DataTable/filteredRows.ts`, with TypeScript annotations and module wrappers removed.
- The DataTable and BarChart `getFilterFunction` bodies are also embedded from the exact baseline. This includes simple/series/aggregate bar dispatch and last-range fallback.
- The surrounding population/candidate evaluator is a small test oracle. It does not instantiate Crossfilter, React, the provider, or history.
- Notebook count/average reduction and setup/plottability classification are explicit independent oracles. They assert the proposed scope contract; they do not execute the live findings component or chart renderers.
- All source snapshots are deeply frozen during evaluation; comparisons confirm that the companion leaves them unchanged. These are immutability checks on this companion. They do not simulate a Cancel button, dialog dismissal, or a real preview session. Real Preview/Cancel/Apply/Undo, held edits, stale tokens, callback count, notebook writeback and narrow-width browser checks remain implementation acceptance tests.

## Data and operation contract

- Each row has a human-readable `recordId`; internal `__ID` equals its zero-based source-array index, matching `initializeData`. The printed exact IDs below are `recordId` values, always in source order.
- `derivedColumns` supplies already-evaluated current values by source index. It deliberately does not introduce another formula interpreter. In real runtime code, use `getColumnData`.
- `{$fixtureValue: "undefined"}`, `"NaN"`, `"Infinity"`, `"-Infinity"`, or `"-0"` encode otherwise non-JSON JavaScript values. These tags are fixture transport only, not a proposed application save format.
- `workspace` is the linked intersection. `context:<chart>` omits that chart selection, retains every relevant other linked owner, and applies its chart-local population. `selected:<chart>` further applies the owning selection. In notebook local-selection mode, other chart selections do not enter either expression.
- `rows` adds Rows filters/search to the workspace intersection. `table:<chart>` starts from that table context and adds its own filters and text search. Searches read all resolved fields except `__ID`, including hidden and calculated fields.
- One stored Filter occurrence is the default removable unit. A whole interval, whole value OR-set, and one specification region each remain one unit. A chart selection clear is explicitly a group containing all that owner’s stored restrictions.
- Array indexes in operations are positions in the original captured snapshot. Multiple removals are applied together against those original positions; no sequential index shifting.
- `expectedMonotone` tests containment of full owner-predicate masks over all source rows and all affected population masks. It is not inferred from an empty target.
- `expectedNoOp` means that the chosen target’s record membership does not change. It does not claim that stored settings or other owner populations are unchanged. This distinction matters in F25.

## Exact expected record results

### ESR-F01 — Conflicting same-field owners preserve ownership

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "A",
    "region": "West",
    "channel": "Web"
  },
  {
    "recordId": "B",
    "region": "West",
    "channel": "Store"
  },
  {
    "recordId": "C",
    "region": "East",
    "channel": "Web"
  },
  {
    "recordId": "D",
    "region": "East",
    "channel": "Store"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove workspace Region West | `C`, `D` | 2 |
| Remove chart East selection | `A`, `B` | 2 |

Other scope checks:

- `context:east`: `A`, `B` (2).
- `selected:east`: ∅ (0).

- Preview and Cancel change no state. Apply removes only the chosen owner.
- The chart context already has A,B; selected rows are empty.

### ESR-F02 — One chart owns two coupled brush clauses

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "B0",
    "x": 1,
    "y": 1,
    "group": "a"
  },
  {
    "recordId": "B1",
    "x": 1,
    "y": 2,
    "group": "b"
  },
  {
    "recordId": "B2",
    "x": 2,
    "y": 1,
    "group": "b"
  },
  {
    "recordId": "B3",
    "x": 2,
    "y": 2,
    "group": "a"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove entire brush selection | `B1`, `B2` | 2 |
| Remove workspace group | `B0` | 1 |
| Remove X restriction only | `B2` | 1 |
| Remove Y restriction only | `B1` | 1 |

### ESR-F03 — Inclusive UTC date-only limits and offset crossing

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "D0",
    "day": "2025-12-31T23:59:59.999Z"
  },
  {
    "recordId": "D1",
    "day": "2026-01-01T00:00:00Z"
  },
  {
    "recordId": "D2",
    "day": "2026-01-01T23:59:59.999Z"
  },
  {
    "recordId": "D3",
    "day": "2026-01-02T00:00:00Z"
  },
  {
    "recordId": "D4",
    "day": "2026-01-02T00:30:00+02:00"
  },
  {
    "recordId": "D5",
    "day": "2026-02-30"
  },
  {
    "recordId": "D6",
    "day": null
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove date filter | `D0`, `D3` | 2 |
| Remove outside-day selection | `D1`, `D2`, `D4` | 3 |

Exact predicate checks are listed in the JSON, including separately asserted IDs and counts.

### ESR-F04 — Missing bucket, typed categories, and nonfinite values

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "M0",
    "value": null
  },
  {
    "recordId": "M1",
    "value": {
      "$fixtureValue": "undefined"
    }
  },
  {
    "recordId": "M2",
    "value": ""
  },
  {
    "recordId": "M3",
    "value": "  "
  },
  {
    "recordId": "M4",
    "value": 0
  },
  {
    "recordId": "M5",
    "value": "0"
  },
  {
    "recordId": "M6",
    "value": false
  },
  {
    "recordId": "M7",
    "value": "false"
  },
  {
    "recordId": "M8",
    "value": "(missing)"
  },
  {
    "recordId": "M9",
    "value": {
      "$fixtureValue": "NaN"
    }
  },
  {
    "recordId": "M10",
    "value": {
      "$fixtureValue": "Infinity"
    }
  },
  {
    "recordId": "M11",
    "value": {
      "$fixtureValue": "-Infinity"
    }
  },
  {
    "recordId": "M12",
    "value": {
      "$fixtureValue": "-0"
    }
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove numeric restriction | `M0`, `M1`, `M2`, `M3` | 4 |
| Remove missing restriction | `M4`, `M5`, `M12` | 3 |

Exact predicate checks are listed in the JSON, including separately asserted IDs and counts.

### ESR-F05 — Exclusive numeric edges retain exact interval semantics

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "E0",
    "value": 9
  },
  {
    "recordId": "E1",
    "value": 10
  },
  {
    "recordId": "E2",
    "value": "10"
  },
  {
    "recordId": "E3",
    "value": 15
  },
  {
    "recordId": "E4",
    "value": 20
  },
  {
    "recordId": "E5",
    "value": "0x1A"
  },
  {
    "recordId": "E6",
    "value": true
  },
  {
    "recordId": "E7",
    "value": null
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove half-open range | `E4` | 1 |
| Remove exact twenty | `E1`, `E2`, `E3` | 3 |

Exact predicate checks are listed in the JSON, including separately asserted IDs and counts.

### ESR-F06 — Rows-only text search does not empty the workspace

Target: `rows`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "R1",
    "region": "West",
    "note": "alpha"
  },
  {
    "recordId": "R2",
    "region": "West",
    "note": "beta"
  },
  {
    "recordId": "R3",
    "region": "East",
    "note": "alpha"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove Rows search | `R1`, `R2` | 2 |
| Remove workspace filter but keep Rows search | ∅ | 0 |

Other scope checks:

- `workspace`: `R1`, `R2` (2).

- Applying the Rows search removal must leave global IDs unchanged.

### ESR-F07 — Hidden raw and derived columns participate in table search

Target: `table:table`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "R1",
    "region": "West",
    "note": "alpha"
  },
  {
    "recordId": "R2",
    "region": "West",
    "note": "beta"
  },
  {
    "recordId": "R3",
    "region": "East",
    "note": "alpha"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove only table search | `R1`, `R2` | 2 |

Other scope checks:

- `workspace`: `R1`, `R2` (2).
- `context:table`: `R1`, `R2` (2).

Revision or semantic variants:

- Search hidden source column case-insensitively: `R1` (1).
- Search hidden derived column: `R1` (1).
- Whitespace search is literal, not empty: ∅ (0).

### ESR-F08 — Rows field restriction is local and distinct from search

Target: `rows`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "R1",
    "region": "West",
    "note": "alpha"
  },
  {
    "recordId": "R2",
    "region": "West",
    "note": "beta"
  },
  {
    "recordId": "R3",
    "region": "East",
    "note": "alpha"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove Rows Region East | `R1` | 1 |
| Remove Rows search | ∅ | 0 |
| Remove workspace Region West | `R3` | 1 |

Other scope checks:

- `workspace`: `R1`, `R2` (2).

### ESR-F09 — Chart-local population restriction has no global effect

Target: `context:web`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "L1",
    "region": "West",
    "channel": "Web"
  },
  {
    "recordId": "L2",
    "region": "West",
    "channel": "Store"
  },
  {
    "recordId": "L3",
    "region": "East",
    "channel": "Store"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove local Web restriction | `L3` | 1 |
| Remove workspace East restriction | `L1` | 1 |
| Unrelated local restriction removal has no effect | ∅ | 0 |

Other scope checks:

- `workspace`: `L3` (1).

### ESR-F10 — Two independent conflicts require a pair; every single fails

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "A",
    "region": "West",
    "channel": "Web"
  },
  {
    "recordId": "B",
    "region": "West",
    "channel": "Store"
  },
  {
    "recordId": "C",
    "region": "East",
    "channel": "Web"
  },
  {
    "recordId": "D",
    "region": "East",
    "channel": "Store"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Single: West | ∅ | 0 |
| Single: East | ∅ | 0 |
| Single: Web | ∅ | 0 |
| Single: Store | ∅ | 0 |
| Pair: West and Web | `D` | 1 |
| Pair: West and Store | `C` | 1 |
| Pair: East and Web | `B` | 1 |
| Pair: East and Store | `A` | 1 |
| Pair: both Region restrictions | ∅ | 0 |
| Pair: both Channel restrictions | ∅ | 0 |

- A bounded pair search must return exact memberships and say which candidate set it searched.
- Do not infer no recovery exists from zero single-removal gains.

### ESR-F11 — Specification selection reads owner limits; limits survive removal

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "S0",
    "value": 9
  },
  {
    "recordId": "S1",
    "value": 10
  },
  {
    "recordId": "S2",
    "value": 20
  },
  {
    "recordId": "S3",
    "value": 21
  },
  {
    "recordId": "S4",
    "value": null
  },
  {
    "recordId": "S5",
    "value": "bad"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove spec selection only | `S1`, `S2` | 2 |
| Remove workspace range | `S0`, `S3` | 2 |

Revision or semantic variants:

- After upper spec changes to21, old preview is stale: `S0` (1).

Exact predicate checks are listed in the JSON, including separately asserted IDs and counts.

- Spec limits, binning and chart layout survive Apply and Undo.
- A spec-limit change invalidates every earlier preview using the owner.

### ESR-F12 — Current derived values, not raw rows, determine recovery

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "K1",
    "units": 2
  },
  {
    "recordId": "K2",
    "units": 3
  },
  {
    "recordId": "K3",
    "units": 4
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove adjusted restriction | `K1`, `K2` | 2 |
| Remove units restriction | `K3` | 1 |

Revision or semantic variants:

- Derived formula/settings revision changes values: `K1`, `K2` (2).

- A derived-value revision invalidates the empty diagnosis and all earlier previews.
- No second formula engine may reinterpret the values.

### ESR-F13 — Notebook chart selections remain local

Target: `selected:east`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "N1",
    "region": "West",
    "channel": "Web"
  },
  {
    "recordId": "N2",
    "region": "West",
    "channel": "Store"
  },
  {
    "recordId": "N3",
    "region": "East",
    "channel": "Web"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove East chart local selection | `N1`, `N2` | 2 |
| Remove workspace West | `N3` | 1 |
| Removing another chart selection cannot recover East | ∅ | 0 |

Other scope checks:

- `workspace`: `N1`, `N2` (2).
- `context:east`: `N1`, `N2` (2).
- `context:web`: `N1`, `N2` (2).
- `selected:web`: `N1` (1).

### ESR-F14 — Empty source is not a filter conflict

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Removing a filter cannot invent source rows | ∅ | 0 |

Expected classification: **empty-source**.

### ESR-F15 — Rows exist but no finite coordinate pairs are plottable

Target: `workspace`. Current exact IDs: `P1`, `P2`; count **2**.

Source rows:

```json
[
  {
    "recordId": "P1",
    "x": null,
    "y": 1
  },
  {
    "recordId": "P2",
    "x": "bad",
    "y": 2
  }
]
```

Expected classification: **no-plottable-values**.

- No selection-removal action should be offered as a cure for invalid X values.
- Eligibility probe is a proposed classification contract, not a tested chart renderer.

### ESR-F16 — Chart missing required field is a setup state

Target: `workspace`. Current exact IDs: `P1`, `P2`; count **2**.

Source rows:

```json
[
  {
    "recordId": "P1",
    "x": null,
    "y": 1
  },
  {
    "recordId": "P2",
    "x": "bad",
    "y": 2
  }
]
```

Expected classification: **setup-required**.

### ESR-F17 — Intentional empty selection remains untouched until Apply

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "I1",
    "value": 1
  },
  {
    "recordId": "I2",
    "value": 2
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Explicitly remove intentional empty selection | `I1`, `I2` | 2 |

- Dismissal leaves the empty array and exact empty membership intact.
- No automatic widening, no repeated modal prompt, no coercing values:[] to no filter.

### ESR-F18 — Aggregate last-range fallback can make removal non-monotonic

Target: `workspace`. Current exact IDs: `G1`; count **1**.

Source rows:

```json
[
  {
    "recordId": "G0",
    "group": "A",
    "amount": 5
  },
  {
    "recordId": "G1",
    "group": "A",
    "amount": 15
  },
  {
    "recordId": "G2",
    "group": "A",
    "amount": 25
  },
  {
    "recordId": "G3",
    "group": "B",
    "amount": 15
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove last range exposes older disjoint range | `G0` | 1 |
| Remove older masked range | `G1` | 1 |
| Remove entire chart selection | `G0`, `G1`, `G2`, `G3` | 4 |

- **Remove last range exposes older disjoint range:** full-owner/surface monotonicity = `false`; added `G0`; removed `G1`.
- **Remove older masked range:** full-owner/surface monotonicity = `true`; added ∅; removed ∅.
- **Remove entire chart selection:** full-owner/surface monotonicity = `true`; added `G0`, `G2`, `G3`; removed ∅.

- Recompile the exact owner settings for every clause candidate.
- A failure mask for raw filter clauses is unsound here.
- Subset containment must hold before calling a change a relaxation.

### ESR-F19 — Simple bar ignores off-field selection clauses

Target: `workspace`. Current exact IDs: `O1`; count **1**.

Source rows:

```json
[
  {
    "recordId": "O1",
    "region": "West",
    "channel": "Web"
  },
  {
    "recordId": "O2",
    "region": "East",
    "channel": "Store"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove masked off-field clause | `O1` | 1 |
| Remove effective Region clause | `O1`, `O2` | 2 |

- Do not display ignored stored clauses as effective restrictions.
- The effective owner predicate is authoritative.

### ESR-F20 — Invalid date bound fails rather than becoming unbounded

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "D0",
    "day": "2025-12-31T23:59:59.999Z"
  },
  {
    "recordId": "D1",
    "day": "2026-01-01T00:00:00Z"
  },
  {
    "recordId": "D2",
    "day": "2026-01-01T23:59:59.999Z"
  },
  {
    "recordId": "D3",
    "day": "2026-01-02T00:00:00Z"
  },
  {
    "recordId": "D4",
    "day": "2026-01-02T00:30:00+02:00"
  },
  {
    "recordId": "D5",
    "day": "2026-02-30"
  },
  {
    "recordId": "D6",
    "day": null
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Explicit removal recovers all source rows, including invalid/missing dates | `D0`, `D1`, `D2`, `D3`, `D4`, `D5`, `D6` | 7 |

- Offer a field-control edit for the invalid bound; never silently replace it.

### ESR-F21 — Three conflicts exceed the bounded-pair search

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "H1",
    "a": 1,
    "b": 1,
    "c": 1
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Single a | ∅ | 0 |
| Single b | ∅ | 0 |
| Single c | ∅ | 0 |
| Pair a,b | ∅ | 0 |
| Pair a,c | ∅ | 0 |
| Pair b,c | ∅ | 0 |
| User-chosen triple, outside automatic pair search | `H1` | 1 |

- After bounded search show no restoring single or pair found, not no recovery exists.

### ESR-F22 — Missing referenced field uses actual undefined-value semantics

Target: `context:missing`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "U1",
    "present": 1
  },
  {
    "recordId": "U2",
    "present": 2
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove absent-field numeric local restriction | `U1`, `U2` | 2 |

Revision or semantic variants:

- Absent-field missing bucket matches undefined in current source: `U1`, `U2` (2).

- Do not infer every absent-field predicate is false.
- A product-level unavailable-field block is a distinct capability decision, not existing predicate semantics.

### ESR-F23 — Finite numeric timestamps and zone-less date-times are UTC

Target: `workspace`. Current exact IDs: `T0`, `T1`; count **2**.

Source rows:

```json
[
  {
    "recordId": "T0",
    "day": 1767225600000
  },
  {
    "recordId": "T1",
    "day": "2026-01-01T23:30:00"
  },
  {
    "recordId": "T2",
    "day": "Depot 2"
  },
  {
    "recordId": "T3",
    "day": "01/02/2026"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove day restriction | `T0`, `T1`, `T2`, `T3` | 4 |

### ESR-F24 — Table filters are linked but table search is local

Target: `table:west`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "A",
    "region": "West",
    "channel": "Web"
  },
  {
    "recordId": "B",
    "region": "West",
    "channel": "Store"
  },
  {
    "recordId": "C",
    "region": "East",
    "channel": "Web"
  },
  {
    "recordId": "D",
    "region": "East",
    "channel": "Store"
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove local table search | `A` | 1 |
| Remove other chart Web selection | `B` | 1 |
| Remove table Region selection but retain search | ∅ | 0 |

Other scope checks:

- `workspace`: `A` (1).
- `context:west`: `A`, `C` (2).
- `selected:west`: `A` (1).
- `context:web`: `A`, `B` (2).

### ESR-F25 — Empty target containment is vacuous: check the full owner predicate

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "G0",
    "group": "A",
    "amount": 5
  },
  {
    "recordId": "G1",
    "group": "A",
    "amount": 15
  },
  {
    "recordId": "G2",
    "group": "A",
    "amount": 25
  },
  {
    "recordId": "G3",
    "group": "B",
    "amount": 15
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Last-range removal leaves target empty but shrinks owner elsewhere | ∅ | 0 |
| Explicitly clear all 3 chart restrictions | `G3` | 1 |

- **Last-range removal leaves target empty but shrinks owner elsewhere:** full-owner/surface monotonicity = `false`; added ∅; removed ∅.

### ESR-F26 — Notebook selected, eligible, unbound findings and numeric empty states

Target: `selected:A`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  {
    "recordId": "n1",
    "region": "West",
    "channel": "Web",
    "score": 10
  },
  {
    "recordId": "n2",
    "region": "West",
    "channel": "Store",
    "score": 20
  },
  {
    "recordId": "n3",
    "region": "East",
    "channel": "Web",
    "score": 30
  },
  {
    "recordId": "n4",
    "region": "East",
    "channel": "Store",
    "score": 40
  },
  {
    "recordId": "n5",
    "region": "West",
    "channel": "Web",
    "score": null
  },
  {
    "recordId": "n6",
    "region": "East",
    "channel": "Web",
    "score": 50
  }
]
```

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove A selection | `n1`, `n5` | 2 |
| Remove workspace Region | `n3`, `n6` | 2 |
| Remove A local Channel only | ∅ | 0 |

Other scope checks:

- `workspace`: `n1`, `n2`, `n5` (3).
- `context:A`: `n1`, `n5` (2).
- `selected:B`: `n2` (1).

| Finding check | Exact input IDs | Value / unavailable |
| --- | --- | --- |
| Selected count is valid zero | ∅ | 0 |
| Selected average has no rows | ∅ | unavailable: empty |
| Eligible ignores local selection | `n1`, `n5` | 2 |
| Unbound count ignores workspace | `n1`, `n2`, `n3`, `n4`, `n5`, `n6` | 6 |
| After A selection removal: count2 | `n1`, `n5` | 2 |
| After A selection removal: mean10 with null excluded | `n1`, `n5` | 10 |
| After workspace removal: mean40 | `n3`, `n6` | 40 |
| After A clear: finding-only score >=40 still empty | ∅ | 0 |
| Eligible finding with missing-score condition has rows but no numeric values | `n5` | unavailable: invalid |

- Finding reductions here are a small independent oracle for count/average scope and exclusions, not a complete findings runtime.
- Intentional zero is valid; dismissing recovery never changes notebook text or state.

### ESR-F27 — One histogram owns a bin range and specification status on the same field

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  { "recordId": "S0", "value": 9 },
  { "recordId": "S1", "value": 10 },
  { "recordId": "S2", "value": 20 },
  { "recordId": "S3", "value": 21 },
  { "recordId": "S4", "value": null },
  { "recordId": "S5", "value": "bad" }
]
```

The histogram owns `range(value,10,20)` and `spec-status(value,outside)` as two filter occurrences. Its inclusive specification limits are lower10 and upper20.

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove only bin range; keep outside-spec selection | `S0`, `S3` | 2 |
| Remove only outside-spec selection; keep bin range | `S1`, `S2` | 2 |
| Explicit group: clear 2 histogram restrictions | `S0`, `S1`, `S2`, `S3`, `S4`, `S5` | 6 |

Other scope checks:

- `context:histogram`: `S0`, `S1`, `S2`, `S3`, `S4`, `S5` (6).
- `selected:histogram`: ∅ (0).
- The two same-field occurrences are distinct units; each removal preserves its sibling.
- All actions preserve `histogram.spec` and binning.
- The chart can retain context rows while its selected set is empty.

### ESR-F28 — Stored boundless and empty-string restrictions remain effective

Target: `workspace`. Current exact IDs: ∅; count **0**.

Source rows:

```json
[
  { "recordId": "Q0", "value": 0 },
  { "recordId": "Q1", "value": "0" },
  { "recordId": "Q2", "value": "2026-01-01" },
  { "recordId": "Q3", "value": null },
  { "recordId": "Q4", "value": true },
  { "recordId": "Q5", "value": "" },
  { "recordId": "Q6", "value": "bad" },
  { "recordId": "Q7", "value": 1 }
]
```

One table owns three occurrences on `value`: a numeric range with neither bound, a date range with neither bound, and text `contains ""`. Their conjunction is empty, although a display heuristic might call each one inactive.

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove boundless numeric range; retain valid-date and string conditions | `Q2` | 1 |
| Remove boundless date range; retain finite-numeric and string conditions | `Q1` | 1 |
| Remove empty text condition; retain finite-numeric and valid-date conditions | `Q0`, `Q7` | 2 |

The separately asserted predicate memberships are:

- Boundless numeric range: `Q0`, `Q1`, `Q7` (3).
- Boundless date range: `Q0`, `Q2`, `Q7` (3). Numeric zero and one are valid millisecond timestamps; string `"0"` is not a date in the baseline parser.
- Text `contains ""`: `Q1`, `Q2`, `Q5`, `Q6` (4). Empty search text still tests the datum's string type.
- Recovery must inventory stored restrictions with their effective semantics. The status bar's display-only active-filter heuristic cannot decide that these restrictions do not exist.

### ESR-F29 — A valid range pair must survive an individually non-monotone removal

Target: `workspace`. Current exact IDs: `G1`; count **1**.

Source rows:

```json
[
  { "recordId": "G0", "group": "A", "amount": 5 },
  { "recordId": "G1", "group": "A", "amount": 15 },
  { "recordId": "G2", "group": "A", "amount": 25 },
  { "recordId": "G3", "group": "B", "amount": 15 }
]
```

An aggregate bar owns category `group = A`, an older `amount` range `[0,10]`, and a later `amount` range `[10,20]`. Its definition uses the last range.

| Removal / candidate | Exact returned IDs | Count |
| --- | --- | ---: |
| Remove older range alone | `G1` | 1 |
| Remove latest range alone, exposing the older range | `G0` | 1 |
| Remove both ranges together, preserving category A | `G0`, `G1`, `G2` | 3 |

- The latest-range single removal is **non-monotone**: it loses `G1` and gains `G0`.
- The pair is **monotone**: it retains `G1`, adds `G0` and `G2`, and keeps `G3` excluded by the category restriction.
- Evaluate both original-index removals together on one clone. Sequential index shifting is incorrect.
- A pair search must not discard a restriction merely because its single-removal transition is non-monotone. The joint candidate needs its own exact compilation and containment check.
- This fixture intentionally starts from a nonempty population so containment is non-vacuous and the preserved/added records are directly visible.

## Repository tests to derive from these fixtures

- Assert the exact row membership seen by the user before Preview, during detached Preview, after Apply, after Undo, and after Redo. Keep data scope and visual eligibility as separate assertions.
- Assert Preview/Back/Cancel never emits a settings callback, adds a chart, changes local/global counts, appends history, or rewrites notebook text.
- Assert Apply checks the captured revision again and refuses a stale result before mutation. Change data, a derived field, specification limits, filter occurrence order, notebook source, held edit state, or restored history while a preview is open.
- Assert one accepted multi-unit action yields one settings/history transaction and only removes reviewed units; same-field siblings and owners survive.
- Assert the recovery surface remains legible and Apply remains functional at 1280, 783, and 390px when the host permits edits. Explicit readOnly must prevent mutation at every width; this does not expand every existing chart’s mobile-support contract.
- Assert typed restrictions survive the proposed in-memory history and inverse exactly. Separately check supported JSON canonicalization by returned IDs, and visible rejection of nonfinite filter settings in durable settings/history persistence. Raw-row special-value encoding is not filter-settings encoding.
- Assert folder exporter omissions or compiled retention mismatches prevent file queue/write while preserving the accepted runtime state and last good disk file. Distinguish that post-commit save guard from notebook authored preflight, which must reject before changing either runtime state or text.
