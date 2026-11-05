---
id: page-snapshot-fingerprint-and-stale-warning
label: Snapshot fingerprint and stale warning
type: page
status: planned
priority: medium
parent: area-text-and-cli-parity
metadata:
  purpose: Snapshots don't record table= or sql= (lib/project/snapshots.ts:28-38). Store a fingerprint; check/project warn when the source text changed. Task 5 kept stale rows after editing SQL.
---
