# Pro research run

- Conversation: [Research map capabilities deliverables](https://chatgpt.com/c/6acb148e-0acc-83e9-9891-6c5efcd0da68).
- Submitted: October 11, 2026, about 00:47 EDT (04:47 UTC).
- Model: Pro. The model menu showed `Pro, 5 of 5` before submission.
- Status: research complete; all artifacts collected and reconciled. Implementation remains unstarted.
- Follow-up: checked about 51 minutes after submission. Pro reported all four research tasks complete.
- Local branch: `codex/map-location-intent`.
- Local checkout: `/Users/byronwall/.codex/worktrees/6446/explorEDA`.
- Code baseline: `12bd64d359f03c54a50b1ff97f20f42284cf4dc6`.

## Submitted files

1. `chatgpt-pro-map-research-prompt.md`, from this initiative.
2. `tmp/map-location-handoff/exploreda-map-source.zip`, a selected source packet with 44 files and `SOURCE-MANIFEST.json`.

The ZIP contains 39 files that match the public baseline byte for byte. Five files contain this initiative's initial planning material. It is not a runnable checkout. ZIP SHA-256: `cc0adaad275efdc1fbbee09a9ace56ebd5bd1261cbc1c0a4472db0802e906b09`.

The submitted message asks Pro to execute the attached prompt, use primary sources, evaluate Leaflet and alternatives, and produce all downloadable artifacts. It explicitly excludes repository implementation.

Automatic review first blocked submission because it treated the ZIP as potentially private code. GitHub then confirmed public visibility and the published baseline commit. A content check found no changed source files. Submission succeeded after those checks.

## Collection result

Pro completed its report, comparison tables, recommendations, proposed proofs, source audit, and package validation. Its progress panel reported four of four tasks complete. The final chat response then showed a connection interruption. The finished files were available through ChatGPT's file library.

Downloaded the ZIP and all ten standalone companions on October 11 at 05:42 UTC. Each standalone file matched its ZIP member byte for byte. The ZIP passed CRC validation and contained only the ten expected root files. No output is missing. The [collection manifest](collection-manifest.json) records hashes, sizes, original library names, and the retrieval method.

Retained the ZIP and all originals under [resources/pro-map-location-research](../resources/pro-map-location-research/README.md). ZIP SHA-256: `635eecd640f189a91f0a8e647635a5470b6a0d5d478c3d066c54b62ee731f9f1`.

All substantive results were reviewed. The [reconciliation](research-reconciliation.md) records every recommendation, catalog choices, source findings, and qualifications. The concise intent incorporates the results. The original research remains unchanged. Research completion follows from the completed package and progress record; this does not claim the interrupted final-message transport recovered.

## Validation and review handoff

- Initial and reconciled Sleuth validation passed with zero warnings. The revised intent has 893 whitespace-delimited words, including frontmatter.
- Collection checks passed: ZIP CRC, archive/member hashes, all ten separate downloads, and Pro's nine companion hashes.
- Both CSVs parsed with the expected row counts and valid source references. All 20 recommendation dispositions are present.
- Relative Markdown file links and document formatting passed. Original research formatting and bytes were preserved.
- The original CSVs use CRLF line endings. The staged whitespace check treats CR as a line ending with `git -c core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol diff --cached --check`.
- Source packet comparison passed: 39 exact baseline files, five new planning files, zero mismatches.
- Installed the locked dependencies with pnpm 11.9.0 under Node 24.21.0.
- Targeted map tests passed: two files, five tests. See local `tmp/map-location-handoff/map-tests.log`.
- `pnpm check` passed the UI rule check and library build, then failed at the existing demo documentation gate. Eight assertions reported missing descriptions for `row.aggregateId` and `row.topN`. No application files changed in this branch. The full check did not reach its later type and test stages. See local `tmp/map-location-handoff/pnpm-check.log`.

The screenshot of the submitted run is local evidence at `tmp/map-location-handoff/pro-submitted.jpg`. It is not part of the documentation commit.

Pro's [verification record](../resources/pro-map-location-research/verification.json) covers research-package checks. Its eight proposed proofs were not run. Our five passing baseline tests do not satisfy those future proofs. No browser flow, rendering benchmark, live-provider request, or image-export acceptance is claimed.

The documentation PR is the review boundary. No package changeset or UI screenshot is required because application code and UI are unchanged. After opening and verifying the PR, disable `collect-pro-map-research` and stop for Byron's review. The initiative remains planned after this research goal completes.
