# Original Pro results

Conversation: [text preparation Design](https://chatgpt.com/c/6ae6522c-cde4-83e8-a3b7-7efa15b64b0c).
Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`. Submitted October 31, 2026 at about 20:40 UTC.
Pro finished in 17m51s. No follow-up was needed.

All seven original files are preserved without edits, under their ZIP names and relative paths:

| File                                                                   | Purpose                                                        | Bytes |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- | ----- |
| [report.md](originals/report.md)                                       | Design, alternatives, evidence, sources, limitations           | 54654 |
| [implementation-plan.md](originals/implementation-plan.md)             | Original milestone plan and acceptance gates                   | 36771 |
| [recommendations.md](originals/recommendations.md)                     | TP-01 through TP-25                                            | 8914  |
| [fixtures.json](originals/fixtures.json)                               | Function, engine, workflow, refresh, and persistence contracts | 89677 |
| [project-fixture.json](originals/project-fixture.json)                 | Six-record project and text/folder acceptance                  | 33784 |
| [reference-text-functions.mjs](originals/reference-text-functions.mjs) | Proposed semantic reference; inspected, not executed locally   | 7045  |
| [verify-fixtures.mjs](originals/verify-fixtures.mjs)                   | Pro's verifier; inspected, not executed locally                | 9646  |

The ZIP and input source packet stay in ignored `tmp/`. Neither is a result committed here.
Archive paths, unique names, symlinks, CRC, size, and UTF-8 checks passed before extraction.
The archive, extracted files, and committed inventory must have identical bytes.
Supplied code is evidence for review; it has not been installed or run.

Read the [local plan](../../../implementation-plan.md), [local dispositions](../../../../../research/text-preparation-design-2026-10-31/decisions.md),
and [verification record](../../../../../research/text-preparation-design-2026-10-31/evidence.md) for the repository's decision.
The original plan contains proposed paths and commands. The local plan resolves those against the checkout.
