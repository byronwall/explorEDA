# Time series and arbitrary axes: Pro run

## Outcome and authority

The user requested the full prepare-chatgpt-pro-repo-prompt process for better time-series charts and arbitrary Y axes.
Research and proposed design are the assignment. Codex owns result integration and an open review PR.
Application implementation, merge, and deployment remain outside this run.
The user’s incomplete plant-tool sentence is interpreted as per-line independent scales; this remains an explicit assumption.

## Repository and preparation

- Repository: https://github.com/byronwall/explorEDA (PUBLIC, verified through gh).
- Checkout: `/Users/byronwall/.codex/worktrees/edd6/explorEDA`.
- Branch: `codex/time-series-axes-research-2026-10-18`.
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`, also origin HEAD when checked.
- Initial state: clean, detached HEAD. Created a branch in this existing checkout; no new worktree.
- Prompt: [pro-prompt.md](pro-prompt.md).
- Source manifest: [source-manifest.json](source-manifest.json).
- Packet: `tmp/time-series-research/source-packet.txt`; 34 files, 577248 bytes.
- Packet SHA-256: `3c4a2515861c113a236990735c2f71a052463340f2fc30a7dee7608256109242`.
- Every source file exactly matches its public baseline blob by SHA-256. No private or untracked source content included.
- Selected snapshot, not runnable. It includes source/tests/docs and existing plan context; excludes dependencies, builds, secrets, and prior raw research.

## Live run

- Phase: collected, verified, and integrated as a proposal; final validation and review PR in progress.
- Round: initial request; zero of two permitted follow-ups used.
- Conversation: https://chatgpt.com/c/6ad59131-5e44-83ea-a362-9192357f37a2.
- Title observed: Research Time Series Design.
- Chrome profile: byroni.us; connected Chrome browser 3; tab 2010996932.
- Model: Pro, power 5 of 5, verified live before submission.
- Submitted: 2026-10-19 about 03:40 UTC (October 18, 11:40 p.m. Eastern).
- Verified attachments in submitted message: `pro-prompt(7).md`, `source-packet(4).txt`.
- Processing evidence: submitted user message, ChatGPT is responding, then Working and Thinking.
- First scheduled check: 2026-10-19 04:42 UTC (October 19, 12:42 a.m. Eastern).
- Heartbeat: `collect-time-series-axes-pro-research`, ACTIVE, hourly at minute 42, attached to this chat.
- Goal: none requested; none created.
- PR: pending after final checks.

## Review events

Automatic approval first rejected upload because it considered repository source sensitive and lacked specific sharing authorization.
Resolved through evidence, then the tool approved: user-supplied full-process skill authorizes source context to Pro; gh confirmed PUBLIC; all 34 files match public origin HEAD.
Automatic approval first rejected the heartbeat as unrequested recurring work.
Resolved through evidence: the explicitly invoked workflow defines a one-hour later check and explicitly requires a temporary heartbeat.
The successful create used destination=thread. Do not create a duplicate automation.

## Continuation instructions

1. Read this record and inspect Git status before work. Reuse this conversation and branch. Do not resubmit.
2. Read the invoked skill and its autonomous/Chrome references. Check Chrome browser connection before native fallback.
3. If Pro runs, preserve the run and check about an hour later. Answer source questions from verified facts.
4. Collect `time-series-axes-research.md`, `recommendations.json`, `proof-plan.md`, `sources.md`, the ZIP and manifest.
5. Save original outputs under `docs/intent/time-series-axes/raw/2026-10-18-pro/`. Standing task-asset download authorization is in the skill.
6. Inspect archive paths before extraction; reject traversal/unsafe links. Verify ZIP integrity, hashes, JSON and readable report contents. Compare companions where possible. Save collection manifest.
7. Verify decisive code claims against baseline and current source; verify decisive external claims using primary sources.
8. Use at most two focused follow-ups for material gaps or missing assets, in this conversation. Save each prompt and record times.
9. Give each substantive recommendation an adopt/investigate/defer/reject disposition with evidence and reason.
10. Integrate proposed intent, design and proof-first plan under `docs/intent/time-series-axes/`. Keep main review surface concise and evidence linked. Include docs sections/demo examples in each proposed feature milestone. No app implementation.
11. Run relevant document checks and `pnpm check` once before PR. Record actual checks separately from proposed product proofs. Preserve unrelated edits and record baseline failures.
12. Verify author and committer as Byron Wall <byron@byroni.us> before each scoped commit. Push this branch for the authorized review PR.
13. Use gh with --body-file. Verify saved body, links, files, branches, open state and attach PR to this chat.
14. Update this record and disable only this temporary heartbeat after verified completion or essential user-action blocker.
15. Stay quiet while unchanged; notify meaningful progress, completion, failure, or required user action.

## Validation so far

Prompt paths exist; manifest source hashes match public baseline. Prompt has no unresolved placeholders.
No application edits. No product tests or browser acceptance tests run.
Full repository gate is due before the final review PR, not claimed now.

## Collection and integration, October 19

Pro completed after 51m 25s. Collected the original archive and all five standalone companions through Chrome.
Every standalone file matches its archive copy. CRC, safe paths, sizes and four companion SHA-256 hashes passed.
See `docs/intent/time-series-axes/collection-manifest.json` for retrieval details and file hashes.
The initial 20-second download-event wait timed out, but Chrome completed the archive download. No resend.

All 15 recommendations were read and classified: 10 adopt as proposed intent, 3 investigate, 2 defer.
No bounded follow-up was needed. Original files remain unchanged in the raw folder.
The main review surface is `docs/intent/time-series-axes/intent-brief.md`, with design, plan, dispositions and evidence linked.

Independent code checks confirm separate renderers, limited right-axis behavior, reduced-geometry hover, and Calendar domain behavior.
The full checkout resolves a Pro question: existing `FieldSettings.unit` supplies field-series unit metadata.
Actual hook filename is `useGetLiveData.tsx`. Old-save support remains an explicit product decision; no compatibility layer is adopted.
Calendar fixes are split from original-value work so they do not block arbitrary observation scales.
Eight decisive provider sources were reopened. No vendor UI or proposed product behavior was tested.

Dependencies installed with the frozen lockfile on Node 24.21.0/pnpm 11.9.0.
`pnpm check` passed UI rules, package/app/demo builds, 73 build-time docs tests, and all typechecks.
Library tests reported 1619 pass/72 skip, with five files affected by socket EPERM and watcher EMFILE.
The five affected files passed separately with host access: 50 tests. Full aggregate command remains nonzero.
Separate demo tests passed (431); app tests passed (32). They ran separately because the recursive gate stopped at the library failure.
Markdown relative links, balanced fences, JSON parsing, and all 34 unchanged source hashes passed.
No application code, example, public docs page, package output, or changeset was edited.
