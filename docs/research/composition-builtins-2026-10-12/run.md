# Composition examples and built-in charts: Pro run

## Outcome and scope

Review all composition examples. Decide which justify composition and which should have a built-in path.
For near-supported cases, name the exact settings and behavior needed. Shape progressive access to advanced chart controls.

The user invoked the full Pro process and Software Design Sleuth. This authorizes submission, source upload, bounded follow-ups, collection, document integration, commits, push, and a review PR.
No application implementation, example deletion, merge, release, or deployment is authorized.

Completion requires readable Pro outputs, checked findings, integrated Sleuth artifacts, recorded validation, and an open verified PR attached to this chat.

## Repository

- URL: https://github.com/byronwall/explorEDA
- Checkout: `/Users/byronwall/.codex-workspaces/worktrees/ios-dc29de2d-6dda-4cd4-8c87-cd40549d2337/explorEDA`
- Branch: `codex/composition-builtins-review`
- Baseline: `269485c6c94b411e27f440ea495ef225110c9a84`
- Initial state: clean, detached HEAD. Created a branch in the existing checkout. No new worktree.
- Chat: `01a130e4-8d66-7313-b055-40be55c07278`, Review Composition Examples.

## Current state

- Phase: prepared; awaiting access to the correct signed-in browser profile.
- Pro round: initial submission pending. Follow-ups used: 0 of 2.
- Pro conversation URL: none. Nothing submitted.
- Model or mode: not yet selected or verified.
- Submission and next check: none.
- Heartbeat: none. An access action is required before submission.
- Goal: none. The user requested a process, not a goal record.
- PR: none. Research has not run.

The task's Codex in-app browser opened ChatGPT signed out. Its profile identity was not verified.
Byron says ChatGPT should already be signed in and asked whether the correct profile was used.
The renewed browser inventory exposes only the in-app browser and empty MCP Apps. No named Chrome or Edge profile is available through that inventory.
The in-app browser exposes visibility and viewport controls, with no profile switch.
Native surface discovery still reports that the Mac is locked. Inspect the existing signed-in profile when native access is available.
The earlier request to sign in again was premature; the observed logout applies only to the task's in-app browser session.
This is an access blocker, not an approval-review rejection. Branch creation passed approval review after the sandbox blocked its shared Git metadata write.

## Prepared artifacts

- [Complete Pro prompt](prompt.md).
- [Inventory](inventory.json): 29 examples, plus the live docs alias for `message-log`.
- [Source manifest](source-manifest.json): baseline files and local additions with hashes.
- [Packet metadata](packet.json): ZIP path, size, hash, and upload status.
- ZIP: `tmp/composition-review/source-packet.zip`. Selected snapshot; not a runnable checkout.
- [Sleuth intent](../../intent/progressive-built-in-charts/intent-brief.md) and [initiative map](../../intent/progressive-built-in-charts/initiative-map.json).

The packet contains composition definitions, source datasets, built-in chart code, shared settings and data logic, tests, docs, and relevant intent.
It excludes credentials, unrelated private files, dependencies, build output, and raw prior research.
Upload the prompt separately as well as the ZIP. Verify both attachments before sending.

## Grounding and checks

The inventory evaluates `dashboardSettings.ts` after stripping TypeScript types, with its local geometry import.
It matches top-level `examples.ts` records whose saved charts include `type: composition`.
All 29 are unlisted examples, matching the `exampleIndex.ts` composition group. Coverage has 29 composition example entries.
The live docs `composition` example focuses `messageDashboard`; it is an alias, not a thirtieth design.
The source was inspected for additional composition definitions in the demo. No other delivered composition was found.

Built-in definitions confirm comparison surfaces in scatter, line, heatmap, and shared annotations/facets.
Types do not prove behavior. The Pro prompt requires planner, renderer, and interaction evidence for final verdicts.
The composed-graphics intent brief contains stale delivery claims for examples present in the baseline. Do not copy those claims as fact.

Preparation checks:

- Unique example IDs: 29 of 29.
- Every dataset and source-packet path exists.
- ZIP integrity and safe entry paths: passed.
- Sleuth validator: passed, zero warnings.
- Application tests: unrun. This fresh checkout has no installed dependencies.
- Product/browser checks: unrun. No application behavior changed.
- Full `pnpm check`: deferred until before the review PR, as required by repository rules.

## Resume and complete

1. Read this record and inspect Git status. Preserve unrelated edits and this existing branch.
2. Locate the user's existing signed-in browser profile before requesting another login. Verify ChatGPT access and inspect the live model selector. Select Pro; do not substitute an API or cloud Codex task.
3. Before sending, verify no conversation was recorded or submitted in a later checkpoint. Never duplicate an uncertain send.
4. Upload the prompt and ZIP. Verify both, send a short instruction to execute the prompt, then verify processing started.
5. Record conversation URL, observed mode, time, and round. Keep the browser tab for the later turn.
6. Inspect existing automations. Create or reuse a heartbeat on this chat for a first check about one hour later.
7. The heartbeat must continue collection, reconciliation, validation, and PR work. Record its ID and verify the saved schedule.
8. If Pro runs, retain the same conversation and check later. If it needs facts, answer from source. Preserve slow runs.
9. Collect the ZIP and all five companion files. Inspect archive entries before extraction, verify integrity, hashes, JSON, counts, and readable reports.
10. Preserve originals under `docs/intent/progressive-built-in-charts/raw/2026-10-12-pro/`. Record links, retrieval time, paths, hashes, and missing files.
11. Compare the verdict IDs with the inventory. Verify consequential claims against both baseline and current source.
12. Send at most two focused follow-ups for material gaps or artifact recovery, in the same conversation. Save each prompt.
13. Give every substantive recommendation an adopt, investigate, defer, or reject disposition, with reasons and destination.
14. Use `/Users/byronwall/.agents/skills/software-design-sleuth-full/`. Update intent and map, write a concise tree-based shape, and a proof-first plan only when the shape is sufficiently grounded.
15. Keep initiative lifecycle `planned`. Recommendations are proposals, not implemented or user-approved features. Use `update-map.mjs` for lifecycle changes.
16. Keep detailed per-example verdicts and code checks in linked evidence documents. The shape remains the main review surface.
17. Run Sleuth validation and relevant document checks. Install with pnpm if needed. Run `pnpm check` once before the PR; avoid concurrent package builds from other checkouts.
18. Verify Git author and committer as `Byron Wall <byron@byroni.us>` before every scoped commit. Do not stage `tmp/`.
19. Push the branch and create the review PR with `gh` and `--body-file`. No changeset or UI screenshot is needed for documentation-only work.
20. Attach the PR to this chat. Read its saved body, file list, base/head, and open state. Verify links.
21. Update this record and disable the heartbeat after completion, or when user action is required. Notify only on meaningful change.

For the full process, follow the invoked handoff skill and its `references/autonomous-workflow.md`.
Do not report completion merely because the prompt is prepared or submitted.
