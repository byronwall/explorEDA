# Duplicate-key repair design handoff

**Recommendation:** build a named repaired source with explicit exact-record collapse and guarded whole-record conflict selection. Preserve every original occurrence, reuse the accepted result in existing relationships and notebooks, then add ordered selection and composite keys in independently useful releases.

Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6` of `byronwall/explorEDA`. Research date: October 31, 2026. This is a design handoff; no repository changes, commits, pushes, or PRs were made.

## Read in this order

| File | Contents |
| --- | --- |
| [report.md](report.md) | Build decision, complete workflow, primary-source comparison, exact semantics, original-record preservation, architecture, UI, access inventory, and open questions. |
| [implementation-plan.md](implementation-plan.md) | Three ordered releases with concrete files, exact acceptance cases, risks, documentation sections, runnable examples, and a verification run sheet. |
| [recommendations.md](recommendations.md) | Stable DKR-001–DKR-025 Build / Explore / Defer / Avoid decisions. |
| [fixtures.json](fixtures.json) | Sixteen hand-enumerated cases, complete original snapshots, exact values, contributor/exclusion membership, relationships, aggregation, refresh, and persistence contracts. |
| [verify_fixtures.py](verify_fixtures.py) | Standalone standard-library verifier of fixture consistency and arithmetic; does not execute a proposed production repair implementation. |
| [proposed-contracts.ts](proposed-contracts.ts) | Self-contained TypeScript sketches of source, identity, evidence, availability, and host transaction boundaries. |
| [workflow.svg](workflow.svg) | Original annotated diagram of execution and evidence boundaries. |
| [workflow.mmd](workflow.mmd) | Editable Mermaid companion showing the same architectural relationship. |

## Verify the handoff

Run from this extracted folder. Python's standard library is sufficient:

```bash
# Validate hand-entered membership, values, counts, arithmetic, and evidence rules.
python3 verify_fixtures.py fixtures.json
```

The verifier passed for all 16 cases. It distinguishes acceptance-only dependency/UI vectors from exercised invariant checks. It does not test explorEDA's future evaluator, worker, UI, notebook wiring, or actual JSON/text/folder round trips. Those production tests are specified in the implementation plan.

## The integrated population check

Eight raw customer occurrences produce four repaired entities. Five original occurrences are represented and three are explicitly excluded; every original remains in the accepted evidence archive. Six orders remain six orders. Their amount total is 90. Customer credit over those order rows is 80, once per matched repaired customer is 70, and over the full repaired customer source is 120. These are different intended populations.

## Integration ownership and preservation

Codex should review the checked claims, adapt the proposed APIs, author the repository plan, implement, and run its normal acceptance checks. Preserve the original handoff as intent evidence in the workflow the mission specifies. The repository's research direction says not to commit Pro originals or the ZIP itself; integrate the decisions and locally reviewed plan rather than copying this bundle wholesale into source control.

Original uploaded mission/source packets were read without modification. Fixture originals are retained in full, including excluded and previous-refresh records. The evidence design preserves typed loaded records and original source files; it does not claim to reconstruct file bytes that a parser never retained.
