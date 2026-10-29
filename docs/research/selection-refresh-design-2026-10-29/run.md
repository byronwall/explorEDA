# Selection refresh Design run

## State

- Phase: **prepared; submission blocked on local Chrome access**.
- Mode: Design.
- Mission: keep selected keyed records and current notebook findings through data refresh.
- Repository: https://github.com/byronwall/explorEDA.
- Branch: `codex/selection-refresh-design-2026-10-29`, existing checkout. No worktree.
- Source baseline: `5594c95690859e8ce456aa3228fa9265ba686d12`.
- Prompt: [pro-prompt.md](pro-prompt.md).
- Conversation: none. No message sent; follow-ups 0/1.
- Collector: none. Create and verify an hourly heartbeat only after verified submission.
- Plan destination: `docs/intent/selection-refresh/implementation-plan.md` (pending Pro).
- Summary destination: `docs/research/selection-refresh-design-2026-10-29/README.md` (pending Pro).
- Result assets: `docs/intent/selection-refresh/assets/pro-results/selection-refresh-design-2026-10-29/` (pending Pro).
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

## Blocker and resume

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

## Source packet

Ignored local packet: `tmp/pro-selection-refresh-2026-10-29/source-packet.txt`.
Inventory: `tmp/pro-selection-refresh-2026-10-29/inventory.json`.
It contains 46 complete files, 498,163 bytes, matching the exact baseline.
SHA256: `718cd6bef058a6235d3db2bd16edcb5eaa4a464f60a7e5eea814912e7a057fdb`.
Scoped credential-pattern checks passed. It includes selected repository source, tests, instructions, and docs only.
No credentials, dependencies, archives, build output, or unrelated personal files were selected.
Review and regenerate the packet after any source refresh before uploading.

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
