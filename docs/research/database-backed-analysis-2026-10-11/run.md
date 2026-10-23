# Database-backed analysis: Pro run record

## Outcome and authorization

Run four Pro research tracks. Preserve source notes and raw reports, then apply Software Design Sleuth through intent and initial shaping.
Open one verified review PR per track. Reconcile shared contracts across the four results.
The user authorized prompt submission, bounded follow-ups, artifact collection, document edits, commits, push, and PR creation.
No application implementation, infrastructure provisioning, merging, or deployment is authorized.

## Repository and source

- Repository: https://github.com/byronwall/explorEDA
- Checkout: `/Users/byronwall/.codex/worktrees/583d/explorEDA`
- Preparation branch: `codex/database-query-research`
- Source commit: `f01ff0fb1f9e1240020744a18816f2dad68bf488` (local `origin/main` at preparation).
- Initial working tree: clean, detached HEAD. Created a branch in the existing checkout.
- Sources: [notebook interpretation](source-notes.md), three original photos and [photo hashes](photo-manifest.json).
- Latest scope: [dedicated customer instances](customer-instance-update.md). This arrived after query research began.
- Source manifests: [base packet](source-manifest.json), [hosting additions](hosting-source-manifest.json).
- Uploaded packet: `tmp/database-research/source-packet.zip`, 2,239,332 bytes, SHA-256 `38ec033efa238c264a0e26f7ca6a943f20e67761d8535a14c3377d680c905c3a`.
- Hosting packet: `tmp/database-research/hosting-source-packet.zip`, 2,250,120 bytes, SHA-256 `8de4a110f081dcb5def2f0107083529e60eb49fd00f03f446c4ff3dde9491d50`.
- Both packets are selected snapshots, not runnable checkouts. They exclude credentials, unrelated files, build output, and dependencies.
- The first packet contains 34 baseline files, source/photo manifests, the photos, notes, and three prompts.
- The hosting packet adds five baseline deployment files, the customer update, its manifest, and the fourth prompt.

## Runs

All timestamps below use America/Indiana/Indianapolis (UTC−04:00).
Submission times are approximate, based on the browser action sequence. Each submitted message and active response was verified.

| Track              | Prompt                                                                        | Conversation                                               | Submitted     | State                    | Follow-ups |
| ------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------- | ------------------------ | ---------- |
| Query demands      | [prompt](../../intent/database-query-contract/raw/2026-10-11-pro/prompt.md)   | https://chatgpt.com/c/6acc5207-c9f8-83ea-9b50-5b5dae43afdf | Oct 11, 23:20 | Collected and reconciled | 0/2        |
| Columnar transport | [prompt](../../intent/columnar-data-transport/raw/2026-10-11-pro/prompt.md)   | https://chatgpt.com/c/6acc5239-824c-83ea-9a03-61e6f84b068c | Oct 11, 23:21 | Collected and reconciled | 0/2        |
| Database adapters  | [prompt](database-adapters/prompt.md)                                         | https://chatgpt.com/c/6acc52ce-2a14-83ea-b9e0-01f54b8c3905 | Oct 11, 23:23 | Collected and reconciled | 0/2        |
| Customer hosting   | [prompt](../../intent/customer-instance-hosting/raw/2026-10-11-pro/prompt.md) | https://chatgpt.com/c/6acc52f9-15b8-83ea-9033-1fb171f62cc2 | Oct 11, 23:25 | Collected and reconciled | 0/2        |

The live selector showed Pro for each run. The first two selectors also showed power 5 of 5.
Each run receives its prompt as a separate Markdown attachment plus the source ZIP.
Hosting uses `hosting-source-packet.zip` and `prompt(3).md`.
ChatGPT renamed repeated uploads: transport uses `source-packet(1).zip` and `prompt(1).md`; adapters use `source-packet(2).zip` and `prompt(2).md`.
Transport and adapters received the customer-instance update in their initial message.
Query research started before that update. Review its result against the new scope. Send one bounded follow-up if the gap matters.
Do not stop a running query response merely to send the update.

## Collection and integration plan

1. Read this record and inspect the recorded conversations. Never resubmit the initial prompts.
2. If a run is still working, keep it and check again after a spaced delay, usually one hour.
3. Collect all report, JSON, and ZIP outputs. Save originals under each track's `raw/2026-10-11-pro/` folder.
4. Inspect ZIP paths before extraction. Verify integrity, hashes, readable reports, and parsed JSON. Record a collection manifest.
5. Compare recommendations against the baseline and current source. Verify decisive provider and format claims using primary documentation.
6. Record adopt/investigate/defer/reject dispositions. Reconcile snapshot identity, coverage, field types, filter scopes, driver/runtime limits, and customer isolation across tracks.
7. Use `/Users/byronwall/.agents/skills/software-design-sleuth-full/` for each initiative. Produce `intent-brief.md`, `initiative-map.json`, and tree-based `shape-brief.md`.
8. Keep initiative lifecycle `planned`. No implementation is requested. Keep uncertain mechanics provisional and first proofs falsifiable.
9. Read the skill's shaping and implementation-success references before shaping. Run its validator for each initiative. Use `update-map.mjs` for lifecycle changes.
10. Use no more than two follow-up submissions per track, only for material gaps or artifact recovery. Save each follow-up prompt.
11. Build four scoped review PRs, one per track. Split preparation commits by path when organizing the branches. Shared notes may live in the first PR; later PRs can stack on it.
12. Use the existing checkout, no new worktrees. Confirm author and committer are Byron Wall <byron@byroni.us> before each commit.
13. Run required repository checks before PR creation. `pnpm check` builds the package; coordinate so it is not concurrent with another checkout.
14. Use `gh` and `--body-file`. Attach every PR to this chat, then verify its body, base/head, files, and open state.
15. Update this record with reports, validation, decisions, and PR links. Disable the heartbeat only after all four are done or user action is required.

No changesets or application screenshots are needed for documentation-only changes. Notebook photos are requested raw material, not UI screenshot evidence.

## Checks and persistence

- All four prompts contain the canonical repository URL, baseline, scope, ranked questions, access fallback, decision gates, and exact outputs.
- Every packet source path exists. ZIP integrity checks pass for both packets.
- The first three packet prompts remain unchanged after submission. The customer update is preserved separately.
- `git diff --check`: passed before checkpoint.
- Application tests: not run during preparation. No application files changed.
- Pro results and Sleuth shaping: complete. Four planned initiatives and 64 recommendation dispositions validated.
- PRs: all four open, verified, and attached. See completion record below.
- Preparation commits: shared sources `8ec797d`; query `8136506`; transport `ad7cba4`; adapters `de7eff2`; hosting `ad98f4b`.
- Hosting visibly confirmed baseline f01ff0f, started provider research, and reported no outputs yet.
- Submission screenshot: `tmp/database-research/hosting-submitted.png` (local evidence, not committed).
- Heartbeat: `collect-database-architecture-research`, PAUSED after completion.
- Schedule verified from the saved automation. Created Oct 11 at 23:26:21 EDT. First hourly check is due about Oct 12 at 00:26 EDT.
- The monitor completed collection and PR work, then stopped.
- Goal: none created. The user requested a monitored workflow, not a goal record.
- Blockers: none.

## Collection checkpoint — October 12, 00:36 EDT

All four Pro responses finished. Downloaded each ZIP and extracted its report and JSON unchanged.
All archives passed path, symlink, and CRC checks. Collection manifests record each original file hash and size.
Some download links first reached a Chrome blocked-by-client page. Returning to the conversation and retrying the file link succeeded. No browser settings changed.
The transport and hosting responses reported Library upload authentication failure. Local ZIP delivery succeeded; no Library write is needed.
Query customer scope is being reconciled without restarting its completed response. No follow-ups used.

## Integration checkpoint — October 12, 00:44 EDT

All four reports and JSON registers were read. All eight standalone companions match the ZIP copies.
The [shared reconciliation](reconciliation.md) selects complete source snapshots into the current tables input as the first shape.
Query customer-instance ownership is explicit; no material gap required a Pro follow-up. All counters remain 0/2.
All four Sleuth validators passed with zero warnings. See [validation](validation.md) for the full-suite failure and focused pass.
The app source is unchanged from the research baseline. No provider, database, or codec proof was executed.

## Completion record — October 12, 2026

The full research and initial shaping workflow is complete. No implementation began.

| Track              | Review PR                                               | Head                                     | Base                                   |
| ------------------ | ------------------------------------------------------- | ---------------------------------------- | -------------------------------------- |
| Query demands      | [#344](https://github.com/byronwall/explorEDA/pull/344) | `codex/database-query-contract-review`   | `main`                                 |
| Columnar transport | [#345](https://github.com/byronwall/explorEDA/pull/345) | `codex/columnar-data-transport-review`   | `codex/database-query-contract-review` |
| Database adapters  | [#346](https://github.com/byronwall/explorEDA/pull/346) | `codex/database-adapters-review`         | `codex/columnar-data-transport-review` |
| Customer hosting   | [#347](https://github.com/byronwall/explorEDA/pull/347) | `codex/customer-instance-hosting-review` | `codex/database-adapters-review`       |

Review in table order. Each PR contains its prompt, unchanged report/JSON/ZIP, collection manifest, intent, map, shape, and recommendation review.
The first PR owns the shared notebook material, reconciliation, and validation. The last PR records this final completion state.
All saved PR bodies, files, bases, heads, and open states were verified with `gh`. All four are attached to this chat.
The current checkout is on `codex/customer-instance-hosting-review`; no new worktree was created.
The preparation branch `codex/database-query-research` remains pushed with the full research checkpoint.

`pnpm check:pr` passed. All four Sleuth validators passed, and all raw hashes and companion comparisons passed.
`pnpm check` had four demo failures; the focused rerun passed all 67 tests. See the exact [validation record](validation.md).
No database, codec, or hosting performance results are claimed. All initiatives remain planned.

The heartbeat was changed to PAUSED after the four PRs were verified. No further automatic checks are scheduled.
No production access, paid provisioning, deployment, or merge occurred. No user action blocks this research deliverable.
