# Source material and research originals

This directory accompanies the Mosaic Selections integration study for `byronwall/explorEDA` at `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. It contains research inputs and original analytical notes, not an application implementation. The final report, proof plan and recommendations in the parent directory reconcile the audits and take precedence where an earlier working note has narrower coverage.

## Contents

| Directory | Contents and access |
| --- | --- |
| `user-supplied/` | Original `mosaic-source-packet.zip`, attached `prompt(7).md`, and a convenient copy of the packet manifest. The original archive preserves 528 manifest-listed repository files plus prompt and manifest. No source file inside it was changed. |
| `official-mosaic/` | 50 curated official source/docs/test/package files at commit `9ca1d860e30ed148d0b228b92ebf30f66cb9e2ce`, original `LICENSE`, and provenance. Source manifests report 0.33.0; this is not a verified npm-release statement. |
| `paper/` | Full-paper access, citation, license note and a short excerpt. The complete text/figures were inspected but are not redistributed. |
| `benchmark-access/` | Exact-ref index for 14 inspected benchmark source/result files and a methodology/access note. Their full originals are omitted because redistribution permission was not established. |
| `research-notes/` | Original selection, persistence and upstream audits; independent performance review; per-audit and consolidated coverage; baseline verification; exact-ref supplement index; twelve-row fixture and its standalone arithmetic generator. |

## How to read the evidence

Start with the final report and proof plan. Resolve a bracketed source ID in `../mosaic-selections-sources.json`; each entry gives the immutable version, exact path/symbol/section, supported claims, access limit and collected filename. For packet sources, the registry identifies the corresponding member of the original ZIP. For code outside the packet, `research-notes/repo-supplement-access.json` records the exact-ref URL, original Git blob SHA, byte size and SHA-256.

The consolidated reading inventory distinguishes **full**, **excerpt**, **searched-only**, and **collected-but-not-read**. Full reading of a test is not a passing test. The final source count is 50 logical source records; a source record may group several related files with their own hashes and read statuses.

The original audits were conducted in parallel. These final reconciliations matter:

- The existing MetricCard numerator follows workspace filters, while its full-source/local denominator does not. The proposed workspace finding denominator does include workspace filters. Compare identical numerator scopes, not unlike percentages.
- Existing Clear All clears chart/workspace filters and table/Rows searches, retaining local populations. A separate “clear interactive clauses” proof action preserves workspace restrictions.
- Demo history and logical row-key handling were found in exact-baseline supplemental files. Earlier audit limits about those paths are closed in the final report, not evidence that those features are absent.
- The current upstream Coordinator enables the default 256-MiB query-result cache; it is not a materialized-table memory cap. The report corrects paper figure/section locators and separates query-group timing from UI latency.
- The native baseline lacks the proposed live finding and lasso. Optional acceleration comparisons use the completed exact internal-contract implementation as control with identical consumers.

## Reproduce only the fixture arithmetic

From this extracted directory, run `python3 research-notes/build_fixture.py`. It regenerates the adjacent `proof-fixture.json` and checks the hand-specified main sets and measure totals. It uses no application imports, network, credentials or dependencies. It is tailored to the supplied twelve rows; it is not an implementation of explorEDA parsing or a general polygon library.

The raw fixture deliberately preserves scalar types. The future application harness must record its raw-to-prepared conversion; do not compare a converted field against the raw typed-equality oracle without an explicit projection oracle.

## Rights and exclusions

The user supplied the selected repository packet for this assignment; it is preserved unchanged. Mosaic's curated official files are included with the original BSD 3-Clause and Observable ISC notices. Preserve those notices on further redistribution.

The arXiv non-exclusive distribution license does not establish permission to include the whole paper or figures here. No separate blanket redistribution permission was found for the official benchmark repository or the additional explorEDA files retrieved outside the user's packet. Those originals are omitted; citations, access indexes, short excerpts and original analysis preserve the research trail. Public access alone was not treated as a redistribution grant.

No executables, dependencies, browser sessions, credentials, unrelated files, commits or PRs are included. All application, UI, persistence and benchmark acceptance checks remain proposed and unrun.
