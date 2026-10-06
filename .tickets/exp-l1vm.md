---
id: exp-l1vm
status: in_progress
deps: []
links: []
created: 2026-10-06T02:54:21Z
type: feature
priority: 2
assignee: Codex
tags: [multi-source]
---
# Switch and restore trustworthy order and item views

## Outcome
Configured order/item queries show correct rows and totals through duplicate, switch, preview, restore, undo/redo, and reload.

## Decisions
Keep React and TypeScript. Use the existing worktree, saved tabs, and history. Source rows stay outside checkpoints. Never select an arbitrary lookup match or silently change chart grain. Preserve single-source use.

## Work
- Reconcile PR #148 in this same worktree before application changes.
- Add deterministic shop fixture, project types, indexed local lookup/aggregate evaluator, stable-key bridge, and package project component.
- Bind active and preview views to their query/frame; scope definitions; checkpoint definitions and views atomically.
- Load the project preset and prove host callback/state reload with sources stored once.

## Readiness and ownership
Owner: current Codex execution. Base: a2e67c0 plus planning commit. Synthetic shop fixture only. Package builds before demo/browser checks. Separate core writer owns lib/analysis; host/UI writer owns integration.

## Acceptance
Five order rows total 150; eight item rows total 140 and represent four orders. All view/history operations retain the intended context. Preview changes nothing. A foreign-frame calculation does not propagate.
Run focused semantic tests, pnpm check, and browser checks at 1280, 783, and 390 px. Save screenshots under tmp.

## Provenance
Implementation plan milestone m1. User authorized same-worktree implementation, commits, and PRs with images. No deployment or publishing.


## Notes

**2026-10-06T03:04:18Z**

Execution checkpoint: Owner current Codex session. Base a2e67c0 + planning commit59d8420. Baseline package build and 12 saved-view/history tests pass. Three workers own evaluator, package project UI, and chart identity. Host writer owns demo sessions, history, import/export, and public exports. Current owned diff has atomic project definitions in checkpoints and per-view query bindings. Full switch/restore/reload/browser proof remains. Next: build combined exports and run semantic integration checks.

**2026-10-06T03:26:07Z**

Checkpoint: Core committed408581d. Independent direct run: evaluator5/5 and host/history14/14 pass. Observed fixture totals: orders5/150; items8/140; current-grain item aggregation retains orderO5 with count0/no item revenue. Node24 scale probe: ten10000-row tables,159ms cold,150/133ms warm,10000 output rows and100000 origin links. Serialization36ms; compact configuration2,482,460bytes, portable formatted export5,886,964bytes. Controlled fan-out variant20000 target rows returns20000 rows in33ms; ambiguous lookup10000 conflicts,151ms. Browser proof and full checks remain. Required explicit schema seam added for valid empty parameter results. Next: frozen build and black-box acceptance at three widths.
