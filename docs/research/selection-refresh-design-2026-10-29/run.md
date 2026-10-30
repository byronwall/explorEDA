# Selection refresh Design run

## State

- Phase: **collected and integrated; review PR pending**.
- Mode: Design.
- Mission: keep selected keyed records and current notebook findings through data refresh.
- Repository: https://github.com/byronwall/explorEDA.
- Branch: `codex/selection-refresh-design-2026-10-29`, existing checkout. No worktree.
- Source baseline: `5594c95690859e8ce456aa3228fa9265ba686d12`.
- Prompt: [pro-prompt.md](pro-prompt.md).
- Conversation: https://chatgpt.com/c/6ae3f166-ff88-83ea-b255-40afef7942a8. Submitted October 30 about 01:22 UTC; follow-ups 0/1. Never resubmit.
- Collector: `collect-exploreda-selection-refresh-design`, ACTIVE hourly at minute 24. First eligible check: October 30 02:24 UTC.
- Plan: [implementation-plan.md](../../intent/selection-refresh/implementation-plan.md).
- Summary: [README.md](README.md).
- Result assets: [original report and plan index](../../intent/selection-refresh/assets/pro-results/selection-refresh-design-2026-10-29/index.md).
- PR: pending collection and integration. No preparation-only PR.

## Topic choice

Read current checkout DIRECTION first, then refreshed origin/main and read its direction again.
The explicit user instruction to preserve original Pro assets overrides main's older prohibition.
The applicable skill also requires original result preservation.

Scores follow DIRECTION: Capability gained / Pro advantage / Buildable result / Momentum, each 1–5.

| Candidate                                              | Mode   | Capability | Pro | Buildable | Momentum | Total  |
| ------------------------------------------------------ | ------ | ---------- | --- | --------- | -------- | ------ |
| Keyed selections and live findings through refresh     | Design | 5          | 5   | 4         | 5        | **19** |
| Reusable grouped result tables for downstream views    | Design | 4          | 5   | 4         | 4        | 17     |
| Joint missingness patterns with exact affected records | Design | 4          | 4   | 4         | 3        | 15     |

Selected the first. It connects recently merged live findings and comparisons to a new same-record refresh workflow.
Main now includes #559 live-finding comparisons, #563 spec limits, and #556 rank pairs.
The last completed cycle was Methods; Design fits the recent mix.
Byron supplies demand. Old outside-demand and participant gates in historical intent docs do not control this selection.

Checked all open PRs through GitHub CLI before selection.
R077's prior study audited replacement and bounded repairs; current main includes repairs and tests.
This new question designs identity across edited measures, repeated refresh, plain inputs, project views, and live findings.
It does not repeat the historical audit. Preserve current passing behavior as evidence.
Reusable outputs and missingness were previously surveyed with conservative gates; neither has a matching open Design PR.
Frozen evidence and exact shared/lasso selection were screened out because #507 already plans them.
No next topic is assigned.

## Preparation findings

Read the full handoff skill, autonomous workflow, blueprint, Chrome workflow, repository guide, and coding/UI rules.
Main is the source baseline for the new scoped branch. The starting checkout was clean.
The first sandbox fetch failed DNS; the approved network retry succeeded.

Current `carryRowSelections` matches row content when the same saved settings meet new rows.
Current project adapters use typed query row keys; `mapRowIdFilters` already covers every filter owner.
Existing tests cover reordered rows, content clones, removed/twin rows, explicit new saves, and typed project keys.
Notebook findings are current derived values. The notebook receives query rows without the project view adapter.
The prompt asks Pro to inspect that boundary rather than assume project identity reaches notebook findings.

## Historical preparation blocker

At 2026-10-29 07:22 UTC, `cua.getState()` showed only in-app and MCP Apps browsers.
Chrome was absent. Native app inventory reported: “The Mac is locked and automatic unlock could not unlock it.”
The signed-out in-app browser is not the intended Chrome profile. No substitute model or browser was used.

Required action: unlock the Mac and open Google Chrome with Byron's `byroni.us` profile.
On resume, inspect available browsers once, verify profile and ChatGPT account, and verify live Pro mode.
Refresh main and check open PRs again before submission; update the packet if decisive source changed.
Submit this prepared mission, rather than selecting another topic. No conversation is recorded yet.

Standing human upload and download approvals apply. No upload, download, or Pro submission happened this run.
After submission, record actual attachment names, conversation URL, time, effort, and visible processing state.
Schedule collection about one hour later and verify the collector ID. Never resubmit a recorded conversation.
After collection, read all reports, check decisive claims, write dispositions and the plan/summary, preserve originals,
verify the committed asset inventory, and open the small review PR. Delete the collector after the PR is open.
Keep the six-hour pipeline active indefinitely. Do not merge, deploy, or provision services.

## Submission checkpoint — October 30

Chrome browser access returned in the `byroni.us` profile while native access still reported a locked Mac.
Verified Byron Wall Pro account and the live Pro selector at 5/5 effort.
Refreshed origin/main, unchanged at the recorded baseline. Checked open PRs through #565; no duplicate Design cycle.
Rebuilt the source packet: all 46 files still match the exact baseline; scoped credential-pattern checks pass.

Uploaded `pro-prompt(20261030-011412).md` and `source-packet(20261030-011412).txt` under standing human upload approval.
Verified both completed attachments, the sent user message, durable conversation URL, Thinking text, and Stop control.
Chrome tab `2011000455` is marked for handoff. No download or follow-up occurred.

Created and verified collector `collect-exploreda-selection-refresh-design` through the supported scheduler and saved configuration.
It targets this chat, `01a18a5d-ad1c-7462-8c38-5a143115e792`, hourly at minute 24.
Do not inspect or collect before October 30 02:22 UTC; first eligible check is 02:24 UTC.
The collector owns collection, original assets, claim checks, dispositions, plan, summary, and verified review PR.
Delete it after opening the PR. The six-hour pipeline remains ACTIVE on GPT-6.1 Sol, Medium.
Plan, summary, result assets, and PR remain pending. No worktree, merge, deployment, or paid service.

## Source packet inventory

Ignored local packet: `tmp/pro-selection-refresh-2026-10-29/source-packet.txt`.
Inventory: `tmp/pro-selection-refresh-2026-10-29/inventory.json`.
It contains 46 complete files, 498,163 bytes, matching the exact baseline.
SHA256: `718cd6bef058a6235d3db2bd16edcb5eaa4a464f60a7e5eea814912e7a057fdb`.
Scoped credential-pattern checks passed. It includes selected repository source, tests, instructions, and docs only.
No credentials, dependencies, archives, build output, or unrelated personal files were selected.
Review and regenerate the packet after any source refresh before uploading.

## Collection and integration — October 30

Resumed the recorded conversation in Chrome `byroni.us`. Pro finished after 36 minutes 46 seconds.
The conversation also contains a human “You going?” message; this automation sent no follow-up or resubmission.
Follow-ups remain 0/1 for this automation.

Collected `selection-refresh-design.zip` through its existing preview under standing human download approval.
The initial download had no immediate file; a later bounded download event wait timed out.
Both actual ZIP and separate Markdown download then appeared in Downloads. No regeneration was needed.
Do not treat the earlier event timeout as a missing asset; the local files were checked before any further retry.

ZIP paths, duplicate entries, symlinks, CRC, exact two-file inventory, and UTF-8 checks passed.
The separate `selection-refresh-design.md` download matches its ZIP member byte for byte.
Read both complete reports. Preserved the two originals under the linked asset index, including hashes and sizes.
The ZIP, packet, and working copies stay ignored under `tmp/pro-selection-refresh-2026-10-29/`.
No Library upload, downloaded-code execution, extra companion, or missing result artifact.

Refreshed main, unchanged at `5594c95690859e8ce456aa3228fa9265ba686d12`. Checked open PRs through #568.
Checked provider restoration, four-owner traversal, project typed keys/fallbacks, saved types, typed text boundaries,
notebook identity loss/local scope, finding revisions, app remounts, saver ordering, and failed query behavior.
AG Grid and TanStack primary-source spot checks support the boundary. Perspective guide unavailable; not decisive.

Read open PR #566's body, file list, and fetched saver implementation at `1bb9d56033981afa916af15ef67a2ca8561efa77`.
The local plan reuses that pending global save queue where sufficient; it does not demand another per-path queue.
Wrote the local four-milestone plan, summary, evidence, SR01–SR16 dispositions, original asset index, and R077/catalogue links.
Build is a planning disposition, not implementation approval. No feature was built.

Locally authored reference probe: 21 contract/arithmetic assertions pass, covering A/C, duplicate review, save/reopen,
empty versus unavailable, typed tuples, ledger totals, and current-East totals. It imports no downloaded or repository program.
This checks proposed policy arithmetic, not implemented feature acceptance.
Existing selection/findings tests pass: three files, 29 tests. Docs tests pass: three files, 73 tests, with existing React `act` warnings.
Verified 119 relative links and staged original hashes/inventory. The directory contains exactly two originals and the authored index.
The hook formats authored files and excludes only the two original reports.
Original reports retain their supplied trailing blank lines; whitespace checks exclude those immutable artifacts.
Authored whitespace, formatting, PR author/changeset checks, and final committed inventory are checked before reporting.
Full `pnpm check` and changeset are not required for this docs-only PR.

## Validation

The saved-selection, identity, and live-finding tests pass: three files, 29 tests.
Command: `pnpm --config.verify-deps-before-run=false --filter exploreda exec vitest run src/test/providers/savedSelectionRestore.test.tsx src/test/lib/analysis/selectionIdentity.test.ts src/lib/notebook/findings.test.ts`.
The dependency flag uses installed dependencies without an automatic reinstall.
Docs checks pass: three files, 73 tests, with existing React `act` warnings.
Command: `pnpm --config.verify-deps-before-run=false --filter demo docs:check`.
The pipeline tool view and saved configuration confirm the six-hour task remains ACTIVE on GPT-6.1 Sol, Medium.
Only authored preparation docs are committed. The packet, inventory, and builder remain ignored under `tmp/`.
No package/demo code changes, changeset, or full `pnpm check` are needed for this checkpoint.
No feature implementation, browser acceptance, persistence proof, or proposed refresh acceptance is claimed.

Preparation checkpoint time: 2026-10-29 07:26 UTC. Resume this cycle before selecting another topic.
