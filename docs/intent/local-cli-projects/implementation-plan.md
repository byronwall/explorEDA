---
title: "Local CLI projects with npx exploreda — implementation plan"
slug: "local-cli-projects"
phase: plan
status: draft
last_updated: "2026-10-12"
---

# Local CLI projects — implementation plan

## Plan at a glance

Build from the file format outward. The project text proof ([#368](https://github.com/byronwall/explorEDA/pull/368)) settled the hardest grammar question. The next risk is whether a whole folder (project text, analysis files, and data) loads into the existing `ExplorEdaProject` workspace and rebuilds every view. That can be proven with no server and no browser, as a pure folder codec over an in-memory file store, checked by a command. Only then does the server appear: a small, guarded file server, with the codec running in the browser. It opens folders read-only before it writes anything. Writing, watching, and first-run creation come after reading is trusted. The demo's folder access and the launch packaging come last, because they reuse the same codec through a different file store.

The main pushback is on scope. The standalone app (`apps/app`) is a thin shell around `ExplorEdaProject`. It has a file list, tabs for views, and autosave. It is not a port of the demo's saved-session, history, and import machinery. The component already owns the workspace, Schema, and Query panels. The CLI adds a home for them on disk.

The second pushback is on security. A local server that reads and writes files must refuse requests from other websites. Every API call checks a per-run token and the `Host` header, as Jupyter does. This lands with the first server milestone, not at launch.

Every milestone leaves `npx exploreda` usable or absent. Nothing changes for component users, and the demo keeps working without a project folder.

## Implementation strategy

- **First proof:** `exploreda-dsl project <folder>` loads the bundled shop example folder and reports every analysis view built against real data, with no diagnostics.
- **Primary seam:** a `ProjectFiles` port (list, read, write, and watch over relative paths), with three adapters: in-memory for tests, Node `fs` behind the local server, and File System Access in the demo. The folder codec (`readProjectFolder`, `writeAnalysis`, `writeProjectText`) is pure and only sees the port.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/lib/project` for the codec. `pnpm --filter app dev` with `EXPLOREDA_FOLDER=<path>` runs the app against a real folder through a Vite middleware, without building the package.
- **Local dependencies:** the in-memory `ProjectFiles` fake, with injectable failures (missing file, write refused, outside edit), plus temp-directory fixtures for the Node adapter.
- **Live confirmation:** the packed tarball (`pnpm pack`) run as `npx ./exploreda-x.y.z.tgz` in a CI job on macOS, Linux, and Windows.
- **Rollout and rollback:** the server and app ship in the `exploreda` bin build only. Removing the `bin` entry withdraws the feature; the component entries never import them.

### Material dependency proof strategy

The file system is the one difficult dependency, because of watching, Windows paths, and atomic writes.

```text
folder codec + in-memory ProjectFiles (M1)
    → Node fs adapter over temp directories, same contract suite (M2, M3)
    → File System Access adapter, same contract suite in Chromium (M5)
    → packed-tarball smoke on three OSes (M6)
```

## Milestone 1: A project folder loads and every view builds

This proves the format end to end against real data, with no server and no UI. It excludes writing, watching, and the app.

- **Change — analysis text names its query and inputs**
  - Dashboard text gains `eda query=<id>` (the file's default query) and a per-view `query=` override.
  - Parameter values ride on the view line. Proposed syntax, not final: `view "Aster in January" query=customer-instance bind.customerId=C1`.
  - An analysis file may declare its own `source @x path=…` for a single-file project. The project text wins when both name the same source.
  - Round-trip tests over the demo analyses in `apps/demo/src/demos/analyses`.
- **Change — folder codec in `lib/project/`**
  - `readProjectFolder(files)` finds `exploreda.eda` (or `.exploreda/project.eda`) and every other `*.eda`. It compiles the project text, loads data through `path=`, and returns `{ project, tables, analyses, diagnostics }`.
  - CSV and JSON parsing move to a shared, React-free module, so the server, the app, and the demo parse rows the same way.
  - Absolute paths load and are flagged as not portable. A missing file marks its source and leaves the others loaded.
- **Change — `ProjectFiles` port and in-memory fake**, with a contract suite every adapter must pass.
- **Change — `exploreda-dsl project <folder>`** prints the project, each analysis, and each view's chart count and problems, using the existing diagnostic format.
- **Change — the bundled example project:** the shop data plus project text and two analyses, under `packages/explorEDA/examples/shop/`, copied into `dist/` so `--example` can find it.

### Desired end state

- `exploreda-dsl project examples/shop` reports every view as built.
- The codec tests cover missing files, absolute paths, hidden versus visible layout, and the project-versus-analysis source override.
- No UI or server code exists yet.

## Milestone 2: `npx exploreda` opens a folder, read-only

This is the first user-visible slice. It introduces the server and the app shell together, because neither proves anything alone. It excludes all writes.

- **Change — `apps/app`:** a Vite React app that hosts `ExplorEdaProject`. It shows the project's data files and analyses in a side list, one tab per view, and source problems inline. It talks only to an `AppStore` interface whose HTTP adapter calls the server.
- **Change — local server in `src/server/`:** built on `node:http`, with no new runtime dependencies.
  - Binds to `127.0.0.1` on a free port and serves the built app.
  - Exposes the folder as files: `GET /api/files` (the list) and `GET /api/files/<path>` (one file). The browser runs the same folder codec over an HTTP `ProjectFiles` adapter, so the server carries no chart code. (Changed in M1: the codec needs the chart compiler, which loads React.)
  - Every API request needs the run's random token, passed in the opened URL and kept in session storage, and a `Host` of `127.0.0.1` or `localhost`.
- **Change — the `exploreda` bin:** a third tsup entry, Node-only, bundling the server; the built `apps/app` is copied to `dist/app/`. `exploreda [folder]` starts the server and opens the browser; `--port`, `--no-open`, and `--example` are included.
- **Spike — package size and startup** (see Open decisions).

### Desired end state

- `node packages/explorEDA/dist/cli/exploreda.js examples/shop` opens the shop analyses.
- Edits in the app work but are not saved.
- A request without the token, or with a foreign `Host`, gets 403.
- Screenshots at wide, intermediate, and narrow widths.

## Milestone 3: Work saves to files and outside edits reload

This is the write path, introduced once reading is trusted.

- **Change — autosave:** `onStateChange` and `onProjectChange` debounce for about one second. The app sends the view or project, and the server writes text from the export functions. Writes are atomic: a temporary file, then rename.
- **Change — watching:** the server watches the folder with recursive `fs.watch` and pushes changes over server-sent events. It ignores the echo of its own writes by comparing a content hash. The app reloads the changed analysis or project and shows a short notice. Undo history stays in memory.
- **Change — the write guard:** the server refuses any path outside the project folder and the global config, including after symlinks are resolved.
- **Change — Node `fs` adapter:** passes the `ProjectFiles` contract suite over temp directories, including rename-based saves from editors and git.

### Desired end state

- Editing a chart rewrites only that analysis file, and `git diff` shows the one-line change.
- `git checkout` of an older file reloads the open tab within about a second.
- A write outside the folder is refused in a test.

## Milestone 4: Any folder becomes a project

This covers first run and creation, which the earlier milestones did not need.

- **Change — first run:** a folder with no project text opens on its CSV and JSON files. Nothing is written until the first save, which writes `exploreda.eda`, or `.exploreda/project.eda` with `--hidden`, plus the new analysis file.
- **Change — creation:** new analysis, rename, and delete, with names chosen safely for files. Adding a source writes a `source` with a relative `path=`; picking an outside file writes an absolute one, labeled as not portable.
- **Change — global config:** `~/.config/exploreda/config.json` (`%APPDATA%\exploreda` on Windows) holds preferences such as the theme and recent projects. Nothing project-specific goes there.

### Desired end state

- `npx exploreda` in an empty data folder, then one chart, leaves exactly two new files.
- Screenshots of the first-run state at three widths.

## Milestone 5: The demo opens the same project folder

The same codec runs through a third file adapter. This is launch scope because the format is meant to be shared.

- **Change — File System Access adapter** in the demo, behind Open project folder (Chromium only; other browsers keep the current flow and a short explanation). It reads and writes the same files, with the same autosave rules.
- **Change — contract suite in Chromium:** the `ProjectFiles` suite runs against the adapter in a browser test.

### Desired end state

- A folder saved by the CLI opens in the demo and back again without changes.
- Firefox shows the explanation instead of a broken picker.

## Milestone 6: Launch-ready

- **Change — three-OS smoke:** a CI matrix packs the package, runs `npx ./exploreda-*.tgz --example --no-open`, fetches `/api/project` with the token, and checks every view builds.
- **Change — docs:** an exploreda.dev page covering projects, the folder layout, the project text reference (tightened with the guesses from the proof), and `npx exploreda`. Plus a README quickstart.
- **Change — first-run polish:** a terminal banner with the URL and folder, clear errors for a busy port or an unreadable folder, and Ctrl-C shutdown.

### Desired end state

- The smoke run is green on all three operating systems.
- The docs page and the README quickstart are live.
- A changeset is written for the launch.

## Open decisions and spikes

- **App assets in the package (M2 spike).**
  - **Decision:** whether `dist/app/` ships inside `exploreda`.
  - **Evidence:** packed size change, and cold `npx` start time on a clean cache.
  - **Fallback:** if it adds more than about 5 MB or 3 seconds, publish the app as `@exploreda/app` and have the bin install it on first run.
- **View query and inputs syntax (M1).**
  - **Decision:** the exact spelling of `query=` and `bind.` on view lines.
  - **Evidence:** export of every demo analysis, plus a cold-agent draft as in the first proof.
  - **Fallback:** a per-view `inputs { … }` body.

## Below the cut line

- Database sources (database-adapters), the notebook view, and static HTML export.
- Undo surviving a restart.
- Columnar transport or server-side parsing for data larger than about 100 MB.
- Editor completion and LSP for `.eda` files.
- Multi-user anything: accounts, sharing, remote binding.
