---
title: "Self-hosted team server with Docker Compose — implementation plan"
slug: "self-hosted-team-server"
phase: plan
status: draft
last_updated: "2026-10-13"
---

# Self-hosted team server — implementation plan

## Plan at a glance

The plan builds outward from the CLI server, and Docker comes late. The main risk isn't the container. It's whether the CLI's file routes, folder codec, and `apps/app` hold up once two people with different roles use the same project. That can be proven on a plain Node run with seeded accounts, before any setup screens, uploads, or images exist. Accounts and project screens come next. Then file sources, then the image and Compose file, then upgrades. Each milestone adds one new risk.

The code turned up one gap the shape missed. The Node file adapter hides its own writes from the watcher, so it doesn't echo saves back to the CLI user. On a team server, one author's save goes through that same adapter, and the other author's page would never hear about it. Team mode has to announce each save itself, naming who saved, and skip the connection that made it. This goes into the first milestone because last-save-wins depends on it.

The second pushback is on scope. Team mode is a separate access adapter, chosen by `exploreda server`. The CLI keeps its loopback-only, token-protected path, and the CLI's existing handler tests guard it. Nothing reaches component users: the server stays in the bin build.

Every milestone ships as a stacked PR with a `minor` changeset. Each one leaves `npx exploreda` unchanged and `exploreda server` usable for what that milestone covers.

## Implementation strategy

- **First proof:** two browser windows on a local `exploreda server --data <dir>`, one signed in as an author and one as a viewer. The author's save reaches the viewer's page as "changed by". The viewer's page never tries to save, and the server refuses any write the viewer sends.
- **Primary seams:**
  - an `Access` port in the request handler: local token or team session;
  - an `AccountStore` port for accounts, sessions, projects, and members;
  - one `NodeProjectFiles` per project folder, served under `/api/projects/<id>/`.
- **Fast local loop:**
  - `pnpm --filter exploreda exec vitest run src/server src/node`;
  - `EXPLOREDA_DATA=<dir> pnpm --filter app dev` serves team mode through the existing Vite middleware, with a dev seed of one author and one viewer.
- **Local dependencies:** temp data directories, the in-memory `AccountStore`, the existing `memoryProjectFiles` with refused writes, and a local test HTTP server for URL sources. That test server can stall, return 404, send oversized bodies, and redirect to blocked addresses.
- **Container confirmation:** `docker compose up` locally and in a CI job, built from the packed tarball the CLI smoke already makes.
- **Rollout and rollback:** `exploreda server` is a new subcommand; the CLI path is unchanged. The image is published only after you approve it. Withdraw the feature by not publishing the image.

### Material dependency proof strategy

```text
in-memory AccountStore + memory files (M1)
    → node:sqlite store over a temp file, same store contract suite (M2)
    → URL fetch against a local failing HTTP server (M3)
    → Docker image + Compose, local and CI smoke (M4)
    → fixture volume from the previous version through migration (M5)
```

The real dependencies are SQLite and Docker. SQLite is embedded, so M2 tests it for real. The Compose run confirms packaging; it isn't the place to test behavior.

## Milestone 1: An author and a viewer share one project

This milestone proves the role model and last-save-wins with seeded accounts and a bare sign-in form. It leaves out setup screens, account management, uploads, and Docker.

- **Change — access port in the request handler**
  - `createRequestHandler` takes an `access` option. `localAccess(token)` is today's host and token check, moved as is. `teamAccess(store, publicUrl)` reads a session cookie, checks `Origin` on writes, and returns the user.
  - Project routes move under `/api/projects/<id>/`. A write needs author membership; viewers and non-members get 403. `/api/info` reports the signed-in user and their role.
  - Verify: existing `handler.test.ts` passes untouched under `localAccess`. New tests cover a viewer write (403), a non-member read (403), a cross-site write (403), and a missing cookie (401).
- **Change — accounts port**
  - `AccountStore` holds accounts (email, name, author or viewer, admin flag, scrypt password hash, disabled), sessions, projects, and members. M1 ships only the in-memory store, which `--seed-dev` fills.
  - A store contract suite runs against it, and M2 reuses that suite for the durable store.
- **Change — saves announced to other pages**
  - Each `PUT` or `DELETE` through a project route is sent to the project's other event listeners as `{ paths, by }`. The connection that saved is skipped. Disk watching still reports edits made outside the app.
  - Verify: a handler test with two event streams. The writer's stream gets nothing, and the other stream gets the path and the writer's name.
- **Change — `exploreda server` subcommand**
  - `--data <dir>`, `--port`, `--public-url`, and `--seed-dev`, which seeds an author, a viewer, and one example project. It binds `0.0.0.0` and requires Node 22.5 or later.
- **Change — app in team mode**
  - `main.tsx` uses cookies when there's no token. A 401 shows a minimal sign-in form. `httpProjectFiles` takes the project base path.
  - Viewer mode turns `FolderSaver` into a no-op, hides create and rename, and shows a "Viewing — changes aren't saved" label with a tooltip.
  - The reload notice names who saved: "Ana changed revenue.eda".
  - Verify: `saver.test.ts` covers viewer mode, and an `App` test covers the named notice. In the browser, run the two-window flow at 1280, 783, and 390 px.

### Desired end state

- `exploreda server --data /tmp/team --seed-dev` (accounts in memory, projects on disk) lets an author edit and a viewer explore the same analysis in two windows.
- The viewer's changes stay in the page. The author's saves reach the viewer with a name.
- The CLI's behavior and tests are unchanged.

## Milestone 2: Admins set up accounts and authors set up projects

This milestone adds the durable account store, so a restart keeps accounts.

- **Change — durable store:** `node:sqlite` at `<data>/exploreda.db`, with the schema version in `user_version`. It passes the M1 store contract suite, and a restart test checks that accounts, sessions, and members persist.
- **Spike — `node:sqlite` on the supported Node versions**
  - Decision required: use `node:sqlite` or a JSON-file store behind `AccountStore`.
  - Evidence to gather: whether it loads without a flag on Node 22.5+ and 24, what warnings it prints, and whether writes survive a hard kill.
  - Fallback: a single-writer JSON store with atomic rename. That is enough for about 110 accounts.

- **Change — first-run setup:** with no accounts in the store, every page shows "Create the admin account". The setup route closes once an account exists.
- **Change — account administration:** admins create author or viewer accounts, grant or remove the admin flag, disable accounts, and make a one-time set-password or reset link that expires in 7 days. Disabling an account ends its sessions. The last admin can't be removed.
- **Change — projects:** a project list shows the projects the user belongs to; admins see all of them. Authors create a project, which makes an empty folder under `<data>/projects/<slug>`. A members popover adds an account as author or viewer, but a viewer account can only be a viewer. Removing a member ends their access on the next request.
- **Change — sign-in hardening:** sign-in attempts back off per account and address. Cookies are `HttpOnly` and `SameSite=Lax`, and `Secure` when the public URL uses https. There is a sign-out control.
- **Change — docs:** a "Team server" section covers accounts, roles, and members.
- Verify: store and handler tests for each rule above. Browser checks of setup, account administration, and members at three widths. `pnpm check:ui` passes.

### Desired end state

- Starting from an empty data directory, an admin can set up the server and invite colleagues by link. Authors can create shared projects without seeded data.

## Milestone 3: Authors add files by upload or URL

- **Change — streamed upload:** a route streams the upload into the project's `data/` folder under a configurable limit, 100 MB by default. Ordinary saves keep the CLI's 50 MB body cap.
- **Change — URL sources:** the server fetches http(s) URLs with a time and size cap and follows redirects. It checks each resolved address and refuses link-local, cloud metadata, and loopback addresses; private company ranges are allowed. It writes the file atomically and records the URL, fetch time, size, and ETag in `.exploreda/fetched.json`. A failed refetch keeps the previous copy. Every fetch is logged with the user, URL, outcome, and size.
- **Change — app:** "Add data" offers Upload and From URL. URL files show "fetched 9:05" and a Refetch button. Errors show next to the file.
- Verify: a local HTTP server checks the stall, 404, oversized, and redirect-to-metadata cases. An old copy survives a failed refetch. The folder still opens with `npx exploreda`.

### Desired end state

- An author can build an analysis from an uploaded CSV and from an internal URL, refetch it, and see when it was read.

## Milestone 4: One Compose file runs the server

- **Change — image:** a Dockerfile on Node 24 slim installs the packed `exploreda` tarball and runs `exploreda server --data /data` as a non-root user, with a health check on `/api/health`.
- **Change — Compose and config:** `compose.yaml` has one service and one named volume. It reads `EXPLOREDA_PUBLIC_URL`, `EXPLOREDA_SESSION_SECRET`, and `EXPLOREDA_UPLOAD_LIMIT` from the environment, and a missing secret stops the server with a clear message. A sample Caddy file adds HTTPS.
- **Change — CI smoke:** a `team-server-smoke` job builds the image, runs `compose up`, and creates the admin through the API. It uploads a CSV, restarts the container, and checks that the account, project, and file are still there.
- **Change — docs:** a Self-hosting page next to [project folders](../../../apps/demo/src/docs/pages/project-folders.mdx), with the Compose file, environment variables, proxy, and backup steps.

### Desired end state

- `docker compose up` on a clean machine gives a working team server whose data survives a restart. CI proves it on every server PR.

## Milestone 5: Upgrades keep everything

- **Change — migration on start:** the server compares the data version with its own. Before it changes anything, it copies `exploreda.db` and the files it will change into `<data>/backups/<date>/`. It runs the migrations in a transaction, and if one fails, it stops without touching the data. A newer data version refuses to start.
- **Change — fixture volume:** a test data directory made by the M4 release, with accounts, members, an uploaded file, and a URL source. It must start and work on every later version.
- **Change — docs:** upgrade, backup, and restore steps.
- Verify: migration tests with an injected failure, and the CI smoke run against the fixture volume.

### Desired end state

- Pulling a new image and restarting keeps every account, project, and file. A failed upgrade leaves the volume as it was, with a clear message.

## Open decisions and spikes

- **Image registry and name.** Default: `ghcr.io/byronwall/exploreda`, published by `release.yml` once you approve it. Fallback: users build the image from the documented Dockerfile.
- **`node:sqlite`.** This is the spike in M2; the JSON store is the fallback.

## Below the cut line

- Scheduled URL refetch, and downloading a project as a zip.
- Database sources, which are their own initiative.
- SSO, email invites, share links, and audit logs.
- Importing a CLI project or a Git repository.
- Live co-editing and locks.
- Multi-instance or Kubernetes deployment.
