# explorEDA map and location research

**Research date:** 2026-10-11. **Status:** GO for the requested research handoff. Product implementation, live-provider acceptance and benchmark results are not claimed or authorized by this package.

This archive answers the five questions in the attached `chatgpt-pro-map-research-prompt.md`. It combines an exact-baseline source audit, a broad official-documentation sweep, a bounded product recommendation and small falsifiable proofs. The initial intent remains authoritative. Every proposed addition remains subject to implementation review.

## Start here

1. Read [report.md](report.md) for the decisions, rationale, examples, tradeoffs and unresolved choices.
2. Review [intent-amendments.md](intent-amendments.md) for the proposed intent changes, under 1,000 words.
3. Use [recommendations.json](recommendations.json) and [proof-plan.md](proof-plan.md) to connect each decision to a user job, current source, cost and acceptance gate.
4. Consult the CSV companions and [sources.md](sources.md) for detailed product/geography evidence. Use [repository-review.md](repository-review.md) and [verification.json](verification.json) to audit current-state claims and actual checks.

The intended later repository archive destination is `docs/intent/map-and-location/resources/pro-map-location-research/`. This handoff does not write there or create a PR.

## Archive manifest

`exploreda-map-location-research.zip` contains these **10 complete files at its root**. The first eight are the requested companions; the last two provide additional verification detail. The archive does not substitute a summary for the detailed files and contains no binary duplicates of the Markdown.

| File | Contents |
| --- | --- |
| [README.md](README.md) | Manifest, reading order, access/ref status, research scope, limitations and actual checks |
| [report.md](report.md) | Standalone answer to all five priority questions, executive recommendations, phased scope and open decisions |
| [capability-matrix.csv](capability-matrix.csv) | 198 records: 11 product entries across 18 comparable capability dimensions |
| [geography-catalog.csv](geography-catalog.csv) | 10 candidate geographies with publisher, terms, keys, vintage, size/resolution evidence, delivery and recommendation |
| [recommendations.json](recommendations.json) | 20 stable MAP IDs with disposition, job, verified repository anchors, evidence, confidence, benefit/cost, simpler option, proofs and dependencies |
| [intent-amendments.md](intent-amendments.md) | Proposed changes separated into durable intent, derived requirements, implementation hypotheses and deferred scope |
| [proof-plan.md](proof-plan.md) | P01–P08, deterministic fixtures, expected results, proposed workloads, provider/export checks and fallback; every gate NOT RUN |
| [sources.md](sources.md) | 123 annotated external primary-source records, plus the repository baseline and supplied intent |
| [repository-review.md](repository-review.md) | Extra: symbol-level audit, complete packet/supplemental file inventory, current tests inspected and precise source risks |
| [verification.json](verification.json) | Extra: machine-readable input integrity, exact-ref comparisons, CSV/JSON/reference checks and companion hashes |

## Access and baseline

The working access path was **the attached selected-source packet, supplemented and verified through read-only exact-ref GitHub retrieval**.

| Item | Result |
| --- | --- |
| Repository | [byronwall/explorEDA](https://github.com/byronwall/explorEDA) |
| Authoritative source baseline | [`12bd64d359f03c54a50b1ff97f20f42284cf4dc6`](https://github.com/byronwall/explorEDA/commit/12bd64d359f03c54a50b1ff97f20f42284cf4dc6) |
| Planning branch | `codex/map-location-intent`, declared in the packet; no matching remote branch returned |
| Packet | 44 declared files plus `SOURCE-MANIFEST.json`; all present, no undeclared extras, CRC clean |
| Tracked packet source | All 39 files match remote Git blob hashes at the exact baseline |
| New initiative files | Five packet-only planning files, not represented as committed baseline source |
| Supplemental source | Seven files fetched and verified at the same baseline |
| Remote main observed | [`396fb9ed3e6ce920635e3487c663373db5df0d2a`](https://github.com/byronwall/explorEDA/commit/396fb9ed3e6ce920635e3487c663373db5df0d2a), five commits ahead, none behind |
| Difference from baseline | Pinned comparison changes four box-plot-related paths: a changeset, demo setting descriptions, `BoxPlot.tsx` and `BoxPlotAxis.test.tsx`; no map implementation changes in that comparison |

Input archive SHA-256: `cc0adaad275efdc1fbbee09a9ace56ebd5bd1261cbc1c0a4472db0802e906b09`. The manifest supplies no original per-file hashes; this research computed and verified its own hashes. Extracted bytes were compared with the attachment and preserved.

### Files inspected

The complete path inventory is in the repository companion. It covers every required reading group:

- `AGENTS.md`, project/agent/UI guidance, root and package manifests, and README.
- The map initiative's intent, original request and baseline references; the handoff prompt and initiative map are included as packet planning evidence.
- The full selected Map chart definition, settings, toolbar, point/region planners and renderers, geometry adapters, data/pan hooks, trace models/bodies, and both test files.
- Geometry assets, chart/saved-data types, serialization validation, `DataLayerProvider.tsx` and DSL setting keys.
- Point/region dashboards, synthetic districts, earthquake and World Bank analysis definitions, and map documentation.
- Adjacent composed-graphics, renderer-replay and network/edge-flow intents.
- Seven supplemental exact-ref files: `aggregates.ts`, `valueParsing.ts`, `categories.ts`, `SavedDataTypes.ts`, `BaseChart.tsx`, `PlotChartPanel.tsx` and `ChartRenderer.tsx`.

## Scope and evidence language

The comparison covers Tableau; Power BI Azure Maps and Shape map as separate entries; Looker Studio/Data Studio; Apache Superset; Metabase; Apache ECharts; Plotly.js; Vega/Vega-Lite; Observable Plot; and kepler.gl. These are **10 families**, not eleven independent products. Their rows cover map types, analytical layers, reference boundaries, context, labels, legends, classification, point sizing, dense data, custom geometry, joins, built-in geography, tooltips, linked interaction, navigation/selection, accessibility, persistence and export.

- **Current source fact:** verified code/document structure at the pinned baseline. A test assertion describes intended coverage, not an executed pass.
- **Documented external fact:** the cited primary source establishes the claim in the stated version or surface.
- **Inference:** a reasoned consequence with assumptions, such as viewport disclosure through tile requests.
- **Proposal:** new behavior or a future proof, not a current product feature or accepted implementation.
- **Unknown/blocked:** evidence did not establish the claim. It is not converted into unsupported certainty or a global failure of the research.

The capability matrix statuses are `documented`, `conditional`, `not-supported-documented` and `unknown`. There are 87, 72, 3 and 36 rows respectively. These counts describe evidence coverage, not a product ranking. Source IDs separated by `; ` resolve in the ledger. CSV `access_date` is retrieval date; release dates, boundary vintages and qualifications remain in descriptive fields and source annotations.

## Checks actually performed

- Validated the input manifest/file set, ZIP CRC and extracted bytes, and recorded per-file SHA-256 hashes.
- Compared all 39 tracked packet files and seven supplemental files with exact-ref GitHub blob hashes; verified the repository, baseline, pinned main and their comparison.
- Inspected every requested source group and the **three point-map / two region-map tests**. Tests were read, not run.
- Completed three complementary research workstreams and reconciled their primary-source claims, current-source gaps and uncertainties.
- Authored and inspected both CSV tables, then independently round-tripped every cell against the source records. Checked row/column counts, quoted fields, UTF-8, CRLF, dates, source references and absence of formula-injection candidates.
- Parsed the JSON, checked required recommendation fields, unique IDs, resolved dependencies with no cycles, existing repository paths and valid primary-source/proof references.
- Checked the intent-amendment word limit, internal companion links/reference definitions, manifest completeness, unchanged packet bytes and exact ZIP root contents. Reopened the output ZIP for CRC and byte-for-byte member comparison.
- Performed a skeptical cross-review of the report/proof/recommendation contracts and corrected symbol and atomicity wording before packaging.

`verification.json` records check results and companion hashes. Its own hash and the enclosing ZIP hash are intentionally not embedded inside it. Validation measures artifact integrity and evidence consistency, not application correctness.

## Material limits

This is not a full checkout. The packet omits the lockfile/workspace setup, imported implementation files, build/test configuration, demo datasets and analysis fact files needed for execution. The map image-export owner, complete facet/axis-wrapper behavior and actual preview caller reachability were not established end to end. Supplemental reads reduce selected uncertainties without making the packet runnable.

**Not run:** dependency installation, `pnpm` tests/typechecks/dev/UI/full checks, browser interaction acceptance, application build, benchmark, geography conversion, live tile/provider check, image-export test or assistive-technology acceptance. The future commands and falsifiable expectations are in the proof plan. No repository changes, commits, pushes, PRs, issues, paid services, new accounts, agreements or credential access occurred.

External sources have specific limits: some Superset controls remain unknown; unversioned Leaflet docs describe an alpha while stable download differs; React Leaflet v5 requires React 19; geography schemas, aliases and browser costs still need pack-specific proofs; and the Mapbox product-terms PDF body was inaccessible. A specific permission claim is stopped where terms are unreadable. No prices or provider entitlement were invented.

The research handoff is complete because all five questions have evidence-backed answers and every required artifact is supplied. The next product decision is whether the bounded proposals and their proof costs are worth accepting.
