# Local evidence and dispositions

Reviewed October 30, 2026 against `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
Refreshed origin/main remains at that commit. Checked open PRs through #577; no concurrency implementation or research overlap appeared.
Read both complete Pro reports and all six companions. Preserved all eight original artifacts in the [asset index](../../intent/timeline-concurrency/assets/pro-results/timeline-concurrency-methods-2026-10-30/README.md).

## Decisive repository claims

| Evidence                                                                              | Finding and local consequence                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Timeline/timelinePlan.ts`, `timelinePlan.test.ts`                                    | Open ends draw to the all-data domain; brush overlap includes touching endpoints. Add a finite analytical window and half-open occupancy without rewriting the brush.                                                                                             |
| `Timeline.tsx`, `definition.ts`, `Timeline.test.tsx`                                  | Row click and interval trace exist; brush rounds to hours. Use exact controls for minute/ms analysis; a new aggregate needs its own trace.                                                                                                                        |
| `valueParsing.ts`, `categories.ts`                                                    | Central parsing supplies missing/date rules and typed category keys. Numeric timestamps are finite numbers today; the proposed exact-ms restriction is feature-specific. Nonfinite numeric categories have explicit keys; never serialize a selected one to null. |
| `useGetLiveData.tsx`, `CrossfilterWrapper.ts`, `chartPopulation.ts`                   | The owner group omits its own dimension; local population is applied separately. Empty facet IDs currently behave as unrestricted. Correct this in the new analytical path and verify any shared-hook change across callers.                                      |
| `FilterTypes.ts`, `applyFilter.ts`, Timeline filter definition                        | Existing generic predicates read one field at a time. New contributor predicates need mapped columns and captured facets, compiled outside the row loop. Include owner population in emitted linked selection.                                                    |
| `saveDataUtils.ts`, DSL `settingKeys.ts`, `compile.ts`, `export.ts`                   | No installed concurrency contract. `filterPairs` handles known scalar kinds only. An unknown kind could disappear if added without an export branch. Validate new placement/settings and roundtrip the complete filter array once.                                |
| `chartAccessibility.ts`, `FiltersSettingsTab.tsx`, `project/settingsCompatibility.ts` | Field collection and editing assume existing filter shapes. Include start, end, lane, and captured facet dependencies; provide a meaningful editor and clear action.                                                                                              |
| `DataLayerProvider.tsx`                                                               | `updateChart` updates filters; settings writes feed callbacks and host fingerprints. Commit accepted edits atomically and test echo stability. Do not mark semantic settings display-only.                                                                        |
| `carryRowSelections.ts`                                                               | Current row-position carry uses JSON row-content matching and can drop changed/ambiguous rows. It is not a business-key API. A saved active-at query expresses another deliberate contract.                                                                       |
| `traceTypes.ts`, `ChartTracePanel.tsx`, `traceRows.ts`                                | Existing Timeline trace routes one interval. Add aggregate dispatch and IDs explicitly. These are current output records; query navigation performs deeper lineage mapping.                                                                                       |
| Notebook `findings.ts`, `NotebookFindings.tsx`                                        | Truthy-kind comparison dispatch and metric-plan records need explicit interval cases. Static evaluation reads raw rows; require initial/mounted parity or unsupported status for the new kind.                                                                    |
| Notebook `writeBack.ts`                                                               | `textPart` removes filters and layout; `skippedKey` excludes `select.` tokens. A full `filters`-array export needs an explicit transient-interaction rule. Structural cleanup must inspect authored source even after transient selection replacement.            |
| `project/analysisText.ts`, `writeFolder.ts`, `folder.ts`, app `saver.ts`              | Actual text routes exist; `analysisFileText` discards the omitted list. Prove supported omission-free export and reopen. Reuse the ordered saver and `flush`; no second queue.                                                                                    |
| `journeyDashboards.ts`, `timeline.mdx`, booking CSV                                   | The current example has 673 rows: 624 Confirmed, 46 Cancelled, 3 Hold. Status is color, not a population policy. Author the example horizon and any status filter explicitly.                                                                                     |

The plan names actual local paths and proposed additions separately.
The retired `domain-analysis-views` intent is not a prerequisite.
Pending preparation and selection-refresh proposals are not assumed installed APIs.

## Independent checks and limits

The archive has eight unique safe relative file paths, no symlinks, valid CRCs, and 272002 uncompressed bytes.
All files decode as UTF-8. Extracted bytes match the archive. ZIP and input packets remain ignored in `tmp/`.
One header download click initially produced no local file. A bounded recovery wait timed out; the actual ZIP then appeared.
Checked the local file before any further attempt. No regeneration, follow-up, Library upload, or downloaded-program execution occurred.

A locally authored direct-cell checker parsed the fixture and expected JSON without importing supplied or repository programs.
It checked all cells, current IDs, lane memberships, invalid/outside populations, summaries, means, conflict witnesses, selection probes, refresh, and the subwindow.
All 971 assertions passed. Explicit-offset DST probes each give 3600000 elapsed ms.
The JSON settings, Dashboard text, and notebook companions are proposed syntax, not baseline runtime acceptance.
Pro's separate 500 randomized checks remain Pro-reported. Preserve its verifier without executing it.

The local checker remains in ignored `tmp/pro-timeline-concurrency-2026-10-30/check-fixtures.py`.
It checks these finite fixture values; it does not establish full parser compatibility, production complexity, or performance.
Future implementation still needs real validators, rendering, callbacks, exports, and folder reopen tests.

Collection checks passed: `CrossfilterWrapper`, notebook findings, and notebook writeback, 3 files and 32 tests.
Docs checks passed, 3 files and 74 tests, with existing React act warnings.
Submission checks passed both Timeline files, 10 tests. No package/demo code changed; no full build or changeset applies.

## Primary-source spot checks

- [PostgreSQL Range Types](https://www.postgresql.org/docs/current/rangetypes.html) explicitly distinguishes inclusive and exclusive bounds. Its default constructor uses `[)`.
- [Perfetto interval overlap counters](https://perfetto.dev/docs/analysis/stdlib-docs#intervals-overlap) expose counts over time, including grouped counters. This supports the representation, not our contributor-storage implementation.
- [Splunk concurrency](https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/10.6/search-commands/concurrency) measures at each event start and documents count clamping. It does not establish the complete exact duration partition required here.

These checks support the chosen method. No external product was installed or benchmarked locally.

## Local recommendation dispositions

Build means inclusion in the plan, not approval to ship.

| Pro IDs   | Local disposition | Reason or correction                                                                                                                               |
| --------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC01–TC03 | Build             | Half-open occupancy, fixed finite horizon, and separate population/window/viewport make duration well-defined.                                     |
| TC04–TC05 | Build             | Preserve baseline invalid/missing/typed/multiplicity rules; add explicit feature-specific exactness and overflow statuses.                         |
| TC06–TC07 | Build             | Ship row measures first; expose occupied lanes and any-lane conflicts in milestone 2 with distinct units.                                          |
| TC08–TC09 | Build             | Group endpoints, integrate touched lanes lazily, retain membership boundaries, and query records on demand. Keep initial modules small.            |
| TC10–TC11 | Build             | Persist semantic point/range intent and compute owner-excluded evidence with population/facet restrictions.                                        |
| TC12–TC14 | Build             | Use Timeline, temporary summaries, and explicit aggregate trace/record routing; label output records accurately.                                   |
| TC15      | Build             | Validate JSON/text/callback/folder behavior as part of each increment; add explicit filter-array notebook writeback rules.                         |
| TC16–TC17 | Build             | Add typed interval findings with eligible scope and raw-source initial/mounted parity; preserve authored text semantics.                           |
| TC18      | Build             | Use exact supplied fixtures after independent arithmetic checks. Do not require executing the supplied verifier.                                   |
| TC19      | Explore           | Measure first. The proposed 50/100 ms triggers are hypotheses; no benchmark established them as product limits.                                    |
| TC20      | Explore           | Segment snapshots can help after their new grain and provenance boundary are specified.                                                            |
| TC21–TC23 | Defer             | Live derived datasets, scheduling/capacity, advanced findings/comparisons, and implicit scope capture are separate work.                           |
| TC24–TC26 | Avoid             | Pair/bin approximations, quadratic contributor storage, clamping, implicit status/deduplication, and moving horizons change or obscure the answer. |

All TC01–TC26 recommendations have a disposition. No Pro follow-up was needed.
