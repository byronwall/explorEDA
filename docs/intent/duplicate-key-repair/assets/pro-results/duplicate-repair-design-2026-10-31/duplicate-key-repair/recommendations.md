# Recommendations: explicit duplicate-key repair

**Build the complete exact/manual prepared-source workflow first.** These stable IDs refer to the Design mission at explorEDA baseline `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`. They are proposals for Codex review and integration, not a list of shipped capabilities.

The [report](report.md) contains the reasoning, primary sources, and repository evidence. The [implementation plan](implementation-plan.md) assigns concrete files, tests, docs, and runnable demos. The recommendation IDs should survive editorial changes to titles or implementation module names.

## Build

| ID | Recommendation / release | One-line reason |
| --- | --- | --- |
| DKR-001 | Build the complete relationship → repaired source → notebook workflow in M1. | An analyst needs a usable accepted result after the existing ambiguity diagnostic. |
| DKR-002 | Build explicit exact-record collapse in M1. | One identical data class can represent repeated occurrences while preserving every original. |
| DKR-003 | Build chosen-key conflict groups and guarded whole-record selection in M1. | Conflicting entities need an intentional survivor without synthesizing a record from unrelated fields. |
| DKR-004 | Separate prepared entity identity, record value-class identity, and original occurrence identity in M1. | Stable selection, safe manual choices, and precise historical navigation need different identities. |
| DKR-005 | Archive complete immutable input snapshots and accepted decisions in M1. | Refresh must not erase losing records or cause old occurrence references to open new rows. |
| DKR-006 | Add one source resolver used by source, lookup, expansion, preview, and inspection in M1. | A query-only step cannot change the raw target that existing lookups independently index. |
| DKR-007 | Make unresolved or missing prepared input explicitly unavailable in M1. | An incomplete repair must not masquerade as zero rows, a current historical result, or ordinary unmatched keys. |
| DKR-008 | Use typed scalar keys and canonical tuple identity from M1, with composite authoring in M3. | Coercion and delimiter concatenation can combine different entities. |
| DKR-009 | Default missing/blank/nonfinite keys to review; require explicit exclusion in M1. | Missing identity does not justify one null entity or unrecorded row removal. |
| DKR-010 | Add explicit earliest/latest or highest/lowest selection in M2. | Declared order parsers, direction, exclusions, and tie handling scale review without inventing recency. |
| DKR-011 | Guard manual decisions by complete group multiset and require acceptance of content refresh in M1. | Reorder is harmless to value-class choices; added, changed, or removed candidates can change the decision. |
| DKR-012 | Apply project changes and evidence through one opt-in, acknowledged transaction in M1. | Separate callbacks or a catch-and-continue save queue can publish definitions whose originals were never saved. |
| DKR-013 | Round-trip versioned JSON/text/folder state and complete dependency closure in M1. | Saving only the output rows or direct source references cannot reproduce or explain the repair. |
| DKR-014 | Carry current evaluation, availability, and original evidence into notebook charts and findings in M1. | The baseline notebook path otherwise drops query provenance and can retain folder-loaded data after Apply. |
| DKR-015 | Implement composite grain and both relationship endpoints together in M3. | A composite entity table does not make a join on one component unique. |
| DKR-016 | Offer a grain-preserving alternative using an existing event key or expansion in M1; extend to composites in M3. | Valid repeated events should remain observations rather than become convenient duplicate exclusions. |
| DKR-017 | Repair the full source and show exact count units, impacts, and selected display scope in M1. | Current chart selection and overlapping match counts must not hide which population the saved repair changes. |
| DKR-018 | Extend existing worker/revision handling and validate downstream field origins in M1. | Late results, missing raw ancestors, or a retargeted chained lookup can invalidate an apparently unchanged view. |
| DKR-025 | Mark generated occurrence fields and exclude only positively identified technical metadata in M1. | Synthetic row numbers otherwise prevent exact collapse; guessing by a column name would discard real data. |

## Defer, Avoid, and Explore

| ID | Status and recommendation | One-line reason |
| --- | --- | --- |
| DKR-019 | **Defer** field-by-field coalescing and synthetic entity records. | They need field-level lineage and conflict semantics beyond choosing an original whole record. |
| DKR-020 | **Avoid** implicit first/last input order, raw-table overwrite, and automatic deletion. | They hide an unstable selection rule or destroy the source evidence. |
| DKR-021 | **Avoid** automatic fuzzy merging and missing-key coalescence. | Similar text or absent identity does not establish that observations are the same entity. |
| DKR-022 | **Defer** generic query-output reuse, arbitrary preparation chains, and relationship-local survivor policies as prerequisites. | The named physical-source repair is reusable without a second query engine or conflicting local interpretations. |
| DKR-023 | **Explore** explicit automatic content-refresh acceptance after the guarded workflow ships. | It can reduce repeated review, but must retain changed-winner visibility and complete evidence for every accepted run. |
| DKR-024 | **Explore** explicit reference-aware archive compaction. | Storage can be optimized only after proving that active and historical decisions retain their original records. |

## Non-negotiable acceptance invariants

- All original occurrences are represented, explicitly excluded, or unresolved; no original silently disappears.
- A ready output record equals one original complete data class, apart from explicitly marked technical-field omission.
- Exact twins all belong to the selected class; no physical twin receives invented recency or priority.
- Excluded evidence is not a numeric contributor, and existing entity-measure conflict handling remains intact.
- Missing dependencies and unresolved ties produce unavailable results, not successful empty tables or current notebook zeros.
- Reordered input does not retarget an archived ordinal; changed content cannot activate without the selected refresh contract.
- Save success depends on evidence success; Apply is one project transaction and Cancel produces none.
- Composite relationship matching uses the complete typed tuple on both endpoints.

## Evidence and integration status

The checked source and primary documentation are cited in [report.md](report.md), sections 2–3 and Appendices A–B. Exact design expectations are in [fixtures.json](fixtures.json). The standalone verifier checks their internal consistency; production implementation, browser testing, worker parity, and actual persistence round trips remain Codex's acceptance work. No repository changes were made in this mission.
