# Local evidence and corrections

Refreshed origin/main remains `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`. Open PRs through #578 contain no expected-record Design plan. This run preserves the separate joint-missingness proposal in #577.

| Evidence inspected                                                                        | Finding and plan consequence                                                                                                              |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `AnalysisProject.ts`; `evaluateProject.ts::sourceReferences`, `lookupFrame`               | Scalar source identity and unary lookup cannot represent the complete composite-key union. Keep matching identity separate.               |
| `projectFile.ts` closure, validators, field resolution; `dsl/project.ts` reference checks | All assume unary step inputs. Update both branches across validation, execution, export, and text ordering.                               |
| `lib/notebook/readNotebook.ts::namedQuery`, `readNotebookText`                            | `eda query=` already exists. Evaluation is flattened to data and loses role-aware evidence. Reuse binding and extend context.             |
| `lib/project/folder.ts` source read loop                                                  | Failed reads use `[]` plus `missingSources`; pathless sources also use `[]`. Carry availability before absence evaluation.                |
| `lib/project/snapshots.ts::SnapshotInfo`                                                  | No partial/completeness field. Do not promise an existing marker or derive it from notes/limits.                                          |
| `useAnalysisEvaluation.ts`, worker protocol, `components/ExplorEdaProject.tsx`            | Existing worker publishes one completed result and retains previous data while pending. Extend its inputs rather than adding an executor. |
| `components/project/analysisRowKeys.ts`                                                   | Existing row-ID filter encoding supports canonical keys and unresolved focus. Reuse it.                                                   |
| `findings.ts`; `writeBack.ts::writeBackSettings`                                          | Count shares can express key coverage; chart writeback does not insert finding declarations. Add a guarded narrow writer.                 |

All five original files were read or inspected, including JSON structure/cases and the complete verifier source. The ZIP passed unique-path, relative-path, no-symlink, CRC, UTF-8, and exact five-file inventory checks. The verifier was not run. Its reported 15 cases/20 vectors remain Pro-reported.

A locally authored Python calculation read fixture JSON only. It independently checked exact memberships, evidence IDs, invalid occurrences, required/matched/absent counts, and count-policy compliance. **74 assertions passed across 14 non-generated cases.** The generated case, strict codec vectors, browser flows, persistence, and performance were not locally accepted. The independent calculation remains ignored in `tmp/pro-expected-records-2026-10-31/check-fixtures.py`.

Primary sources were opened locally: pandas confirms compound keys, membership indicators, cardinality validation, and null-null matching; Power Query confirms ordered paired columns and type guidance; tidyr confirms explicit expansion and separate handling of introduced versus existing missing values. Our invalid-key policy and grouped denominator are product choices.

The original plan's closing archival instruction conflicts with Byron's explicit preservation requirement. The originals remain unchanged as reference artifacts. Local integration follows Byron's requirement and does not execute the supplied program.
