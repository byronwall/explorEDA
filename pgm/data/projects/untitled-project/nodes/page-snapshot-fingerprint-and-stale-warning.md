---
id: page-snapshot-fingerprint-and-stale-warning
label: Snapshot fingerprint and stale warning
type: page
status: needs-review
priority: medium
parent: area-text-and-cli-parity
metadata:
  implementation: "Fixed in https://github.com/byronwall/explorEDA/pull/615 (stack on #609), not merged yet."
  purpose: Snapshots don't record table= or sql= (lib/project/snapshots.ts:28-38). Store a fingerprint; check/project warn when the source text changed. Task 5 kept stale rows after editing SQL.
---
