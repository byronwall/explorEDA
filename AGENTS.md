# explorEDA working rules

- Start with the [agent guide](docs/agent-guide.md): where code lives, the commands that work, and known traps.
- Keep this existing React library and demo in React and TypeScript.
- Use pnpm. Run `pnpm check` after a broad change; see [Verifying changes](#verifying-changes).
- Read [UI defaults](docs/ui-defaults.md) before changing controls, tables, overlays, or field details.
- Follow [Coding standards](CODING_STANDARDS.md) for UI, copy, and data rules, and check your diff against it before opening a PR. `pnpm check:ui` enforces the mechanical ones.
- When shaping or planning an initiative under `docs/intent/`, treat docs and demo examples as part of each user-visible feature's scope. List the docs page or section and the example in the same milestone as the feature. The docs gate (`apps/demo/src/docs/gate.ts`) requires a page only for registered chart types; nothing enforces examples, Composition marks, or other features.
- Verify changed flows in the browser at wide, intermediate, and narrow widths.
- Keep existing user edits. Do not commit on `main` without an explicit request.
- For any ChatGPT Pro research run, read [Pro research direction](docs/research/DIRECTION.md) first. It decides topic choice and what a run hands back, ahead of catalogue rank and earlier run queues.

## Verifying changes

- The demo dev server and demo tests run the library from source. Do not build the library to see a change; `pnpm --filter demo dev` picks it up. Set `EXPLOREDA_DIST=1` only to try the built package.
- While working, run targeted tests (`pnpm --filter exploreda exec vitest run <files>`) and `pnpm --filter exploreda check-types`.
- Take test time limits from `@repo/test-config`. Don't set a timeout in one test or one config; see [Test time limits](docs/agent-guide.md#test-time-limits).
- Run `pnpm check` once, before opening a PR. It builds the package, so never run it from several worktrees at the same time.

## Pull requests

- When carrying out an implementation plan, stack one PR per milestone. Open the first PR as soon as it builds, and keep going through every milestone without stopping to ask.
- Take screenshots with `pnpm shot`; see the [agent guide](docs/agent-guide.md#commands).
- Include screenshots in the PR description for every visible fix or UI change.
- Upload them with `gh pr create --attach` or `gh pr edit --attach`. Repeat the flag for each image and add alt text after `#`, as in `--attach 'tmp/shot.png#Rows drawer at 390px'`.
- To place an image beside the change it shows, reference the local file in the body, such as `![alt](./shot.png)`, and attach the same path. `gh` rewrites the reference to the uploaded URL.
- Keep screenshots under `tmp/`. Do not commit them, and do not push them to a separate assets branch.

## Changesets

- Every PR that changes what `exploreda` users get (anything under `packages/explorEDA` except tests, or its build output) includes a changeset. Write it yourself; nobody adds them later.
- Run `pnpm changeset:add <patch|minor|major> "summary"`. It writes `.changeset/<slug>.md` without prompts. Do not run the interactive `pnpm changeset`.
- Pick `patch` for fixes and polish, `minor` for new features or options, and `major` only when Byron asks for a breaking release. While the version is 0.x, a breaking API change is `minor`.
- Write the summary for package users: what they can now do or what now behaves differently, in one or two plain sentences. It goes straight into the changelog.
- One changeset per PR is usual. Edit it when the PR's scope changes instead of adding another.
- Skip it for demo-only, docs-only, test-only, or tooling-only PRs.
- Never run `changeset version` or `changeset publish`, and never edit versions or `CHANGELOG.md` by hand. The Release workflow does that through the "Version Packages" PR.
- Follow [the release steps](README.md#release). Use `release.yml` on `main` with npm trusted publishing. Do not add `NPM_TOKEN`.
- Run release checks on Node 24. Preserve Node's `AbortController` and `AbortSignal` in the demo test environment.
- Confirm the npm version, `latest` tag, provenance, and GitHub release after publishing. Check npm before retrying a partial failure.
