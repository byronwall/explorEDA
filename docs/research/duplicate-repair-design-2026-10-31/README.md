# Build a reusable repaired entity source

Build explicit exact-record collapse and whole-record conflict selection, then reuse the result in relationships and notebooks.
Keep original occurrences and exclusion reasons accessible. Add ordered selection next and complete composite keys third.

R039 Design scored **17/20**: capability 4, Pro advantage 4, buildability 5, momentum 4.
The [Pro conversation](https://chatgpt.com/c/6ae5fdfa-7aa0-83e9-b5d6-9603c7e92c6b) finished in 27m6s.
No follow-up was needed.

Read the [implementation plan](../../intent/duplicate-key-repair/implementation-plan.md),
[25 local dispositions](decisions.md), [checked evidence](evidence.md), and [original asset index](../../intent/duplicate-key-repair/assets/pro-results/README.md).
Build is a planning decision, not implementation approval.

## Findings that decide the build

A query-only deduplication step cannot repair lookup targets: current source, lookup, and expansion paths read physical tables independently.
Use one resolved-source path and separate logical entity references from original evidence.
Notebook loading currently keeps row values without query provenance; folder saving continues after a failed write.
Both boundaries belong in the first usable release.

The main fixture reduces eight customer occurrences to four entities, representing five originals and excluding three.
The order total is 90. Customer credit over order rows is 80, once per matched customer 70, and full-source credit 120.
These populations must stay different.
DR-F06 retains two valid rows after excluding invalid keys; an invalid-only zero-output case needs a separate fixture.

## Evidence and limits

Current code and [Microsoft's survivor guarantee](https://learn.microsoft.com/en-us/powerquery-m/table-distinct),
[PostgreSQL's tied ordering](https://www.postgresql.org/docs/current/tutorial-window.html), and
[OpenRefine's clustering boundary](https://openrefine.org/docs/technical-reference/clustering-in-depth) support the key decisions.
The local plan defers unrequested backward compatibility and automatic relationship-chain repair.

Nine original artifacts are preserved byte for byte. Safe archive checks pass.
Independent local checks pass 236 assertions across 21 repair variants and seven relationship vectors.
All 16 fixture cases and 25 snapshots were inspected; the supplied verifier was read, not executed.
Pro's verifier and TypeScript checks remain Pro-reported evidence.
Existing evaluator/entity-grain/identity tests and docs checks pass. No production repair, persistence, worker, or UI acceptance is claimed.

Implementation choices remain: exact format discriminator, evidence storage layout, default output name, and legacy technical-field classification UI.
Use complete snapshots initially. Measure storage and grouping cost before considering compaction or automated refresh.
No next topic is selected. See the [run record](run.md) for collection and PR status.

Integrated in open [PR #581](https://github.com/byronwall/explorEDA/pull/581). The temporary collector is deleted.
The six-hour pipeline remains active. Review the first milestone before authorizing implementation.
