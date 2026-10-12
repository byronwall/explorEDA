# Validation record

Validated October 12, 2026 in the existing checkout. Only research and planning files changed.

- Four original ZIPs passed path, symlink, and CRC checks before extraction.
- All eight standalone report/JSON companions exactly match their archive copies.
- All raw hashes match their collection manifests. All JSON files parse.
- All 64 recommendation IDs have one adopt, investigate, defer, or reject disposition.
- Four Sleuth validators passed with zero warnings. All initiatives remain planned.
- Authored files pass `git diff --check`. Raw reports retain original Markdown hard-break whitespace; their hashes take priority.
- Source files under packages, apps, scripts, package.json, and pnpm-lock.yaml match baseline f01ff0f.

## Repository checks

Ran `pnpm check` using Node 24.21.0 and pnpm 11.9.0 after restoring locked dependencies.
The initial sandbox attempt could not reach the registry. The approved network retry ran the suite.

UI rules, all builds, and type checks passed. Library tests passed: 189 files, 1,206 tests.
The demo suite had four failures: three workspace lookups in `src/LandingPage.test.tsx`, and one heading lookup in `src/docs/DocsSite.test.tsx`.
Its total was 183 passed and four failed tests. The full command exited 1.

A focused rerun passed both files and all 67 tests:

```sh
pnpm --filter demo exec vitest run src/LandingPage.test.tsx src/docs/DocsSite.test.tsx --maxWorkers=1 --minWorkers=1
```

An earlier focused invocation set only maxWorkers and stopped before tests due to conflicting pool bounds.
The corrected invocation above completed. No source or test changes were made to get a pass.
The full-suite failure remains recorded; the focused pass does not turn it into a full-suite pass.
Local logs: `tmp/database-research/pnpm-check.log` and `tmp/database-research/demo-targeted.log`.

`pnpm check:pr` passed for the assembled stack. GitHub verification confirmed each PR is open with its expected base, head, and files.

## Evidence limits

Research integrity checks are not runtime proofs. Provider facts were checked against current official documentation.
Each initiative records its decisive code and provider checks in its recommendation review.
No new database endpoint, codec benchmark, hosted instance, production query, deployment, or migration ran.
The proposed proof thresholds and cloud costs remain unmeasured.
