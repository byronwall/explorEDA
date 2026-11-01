# Original Pro result assets

Source: [recorded Pro conversation](https://chatgpt.com/c/6ae6a646-0d34-83ea-b5eb-cceb8c81fc51).
Mode: Methods. Topic: R037, 17/20.
Baseline: `d3920a285f3755a8324998775deb131747e959f5`.
Submitted November 1, 2026 about 02:39 UTC; collected after 03:42 UTC. Pro worked for 24m 6s.

All seven original extracted files are preserved byte for byte, with their original names and relative links.
The ZIP and input packet stay ignored under the checkout's `tmp/pro-decimal-measures-2026-11-01/` folder.
The original report's ZIP link refers to that local container; it is deliberately not committed.
No original source register, image, diagram file, or additional manifest was supplied.
The report contains an embedded Mermaid diagram and its complete files-read inventory.

| Original                                                   |  Bytes | Purpose                                                               |
| ---------------------------------------------------------- | -----: | --------------------------------------------------------------------- |
| [report.md](originals/report.md)                           |  74233 | Numerical design, alternatives, sources, workflow, evidence inventory |
| [implementation-plan.md](originals/implementation-plan.md) |  59472 | Full proposed stages and adapters                                     |
| [recommendations.md](originals/recommendations.md)         |  17734 | ED-01–ED-28 proposals                                                 |
| [decimal-fixtures.json](originals/decimal-fixtures.json)   | 124494 | 215 primitive/aggregate/wire cases and coherent datasets              |
| [fixture-proofs.md](originals/fixture-proofs.md)           |  19016 | Integer/rational derivations                                          |
| [verify-fixtures.py](originals/verify-fixtures.py)         |  23010 | Supplied inspection companion; not executed locally                   |
| [decimal-contract.ts](originals/decimal-contract.ts)       |  23718 | Proposed declarations; not executed or adopted as production code     |

Safe paths, unique entries, no symlinks, archive CRC, file size, UTF-8, and archive/extracted comparisons passed.
The committed inventory must match these same seven files before the PR is complete.
The reports and proofs were fully read. Both code companions were inspected; the fixture data was parsed and reviewed.

[Local implementation plan](../../../implementation-plan.md).
[Short research summary](../../../../../research/decimal-measures-methods-2026-11-01/README.md).
Original proposals are evidence, not instructions that override repository or user rules.
