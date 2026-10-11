# Pro research run

- Conversation: [Research map capabilities deliverables](https://chatgpt.com/c/6acb148e-0acc-83e9-9891-6c5efcd0da68).
- Submitted: October 11, 2026, about 00:47 EDT (04:47 UTC).
- Model: Pro. The model menu showed `Pro, 5 of 5` before submission.
- Status: running. The page showed “Reading map research prompt file” after submission.
- First follow-up: about one hour after submission, through the `collect-pro-map-research` heartbeat in the owning Codex chat.
- Local branch: `codex/map-location-intent`.
- Local checkout: `/Users/byronwall/.codex/worktrees/6446/explorEDA`.
- Code baseline: `12bd64d359f03c54a50b1ff97f20f42284cf4dc6`.

## Submitted files

1. `chatgpt-pro-map-research-prompt.md`, from this initiative.
2. `tmp/map-location-handoff/exploreda-map-source.zip`, a selected source packet with 44 files and `SOURCE-MANIFEST.json`.

The ZIP contains 39 files that match the public baseline byte for byte. Five files contain this initiative's initial planning material. It is not a runnable checkout. ZIP SHA-256: `cc0adaad275efdc1fbbee09a9ace56ebd5bd1261cbc1c0a4472db0802e906b09`.

The submitted message asks Pro to execute the attached prompt, use primary sources, evaluate Leaflet and alternatives, and produce all downloadable artifacts. It explicitly excludes repository implementation.

Automatic review first blocked submission because it treated the ZIP as potentially private code. GitHub then confirmed public visibility and the published baseline commit. A content check found no changed source files. Submission succeeded after those checks.

## Collection contract

Download the ZIP and every companion artifact. Preserve original files under `resources/pro-map-location-research/`. Inspect the ZIP manifest before extraction. Record source links, local paths, hashes, and any missing or duplicate artifacts.

Read every substantive result. Compare current-state claims with the baseline and current source. Reconcile each recommendation as adopted intent, an investigation, deferred scope, or a rejected idea. Preserve user intent when research challenges an implementation hypothesis. Keep the human brief concise; store detailed reconciliation beside the references.

Run the Sleuth validator. Run the required repository check before opening a documentation PR. Use `gh`, attach the PR to the owning chat, and stop for review. Do not merge or implement. Disable the heartbeat after the PR is ready. Keep the active goal unfinished until the results are incorporated and the PR is open.

## Checks so far

- Initial Sleuth validation passed with zero warnings.
- Source packet comparison passed: 39 exact baseline files, five new planning files, zero mismatches.
- Installed the locked dependencies with pnpm 11.9.0 under Node 24.21.0.
- Targeted map tests passed: two files, five tests. See local `tmp/map-location-handoff/map-tests.log`.
- `pnpm check` passed the UI rule check and library build, then failed at the existing demo documentation gate. Eight assertions reported missing descriptions for `row.aggregateId` and `row.topN`. No application files changed in this branch. The full check did not reach its later type and test stages. See local `tmp/map-location-handoff/pnpm-check.log`.

The screenshot of the submitted run is local evidence at `tmp/map-location-handoff/pro-submitted.jpg`. It is not part of the documentation commit.
