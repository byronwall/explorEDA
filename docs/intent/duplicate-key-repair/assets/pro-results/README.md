# Original duplicate-key repair results

[Pro conversation](https://chatgpt.com/c/6ae5fdfa-7aa0-83e9-b5d6-9603c7e92c6b), October 31, 2026.
Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.

All nine original ZIP entries are preserved with their original bytes, names, and relative paths.
The ZIP and uploaded input packet remain ignored under `tmp/pro-duplicate-repair-2026-10-31/`.
Safe relative paths, unique entries, no symlinks, CRC, size, and UTF-8 checks pass.
The supplied README's conflicting archival advice does not override the direct preservation instruction.

| Original                                                                                                 | Contents                                              |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [report.md](duplicate-repair-design-2026-10-31/duplicate-key-repair/report.md)                           | Complete Design report and primary sources            |
| [implementation-plan.md](duplicate-repair-design-2026-10-31/duplicate-key-repair/implementation-plan.md) | Pro's proposed milestones and acceptance requirements |
| [recommendations.md](duplicate-repair-design-2026-10-31/duplicate-key-repair/recommendations.md)         | DKR-001–DKR-025                                       |
| [fixtures.json](duplicate-repair-design-2026-10-31/duplicate-key-repair/fixtures.json)                   | Sixteen cases and 25 preserved snapshots              |
| [verify_fixtures.py](duplicate-repair-design-2026-10-31/duplicate-key-repair/verify_fixtures.py)         | Original verifier, inspected but not executed locally |
| [proposed-contracts.ts](duplicate-repair-design-2026-10-31/duplicate-key-repair/proposed-contracts.ts)   | Proposed contracts; not package implementation        |
| [workflow.svg](duplicate-repair-design-2026-10-31/duplicate-key-repair/workflow.svg)                     | Original architecture diagram                         |
| [workflow.mmd](duplicate-repair-design-2026-10-31/duplicate-key-repair/workflow.mmd)                     | Editable diagram source                               |
| [README.md](duplicate-repair-design-2026-10-31/duplicate-key-repair/README.md)                           | Original handoff guide                                |

Use the [local plan](../../implementation-plan.md) and [dispositions](../../../../research/duplicate-repair-design-2026-10-31/decisions.md)
for adopted scope and corrections. Original reports remain proposals and evidence, not controlling instructions.
