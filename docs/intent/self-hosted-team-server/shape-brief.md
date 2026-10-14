---
title: "Self-hosted team server with Docker Compose — shape brief"
slug: "self-hosted-team-server"
phase: shape
status: draft
last_updated: "2026-10-13"
---

# Self-hosted team server — what we are adding

**Outcome:** A company runs one Compose service, and its authors build file-based analyses on it that signed-in colleagues can explore.

**Primary flow:** `docker compose up` → create the admin → admin adds accounts → an author creates a project, adds a CSV by upload or URL, and builds an analysis → a viewer signs in and explores it, and nothing is saved.

## Feature scope

```text
Team server
├── PLANNED ADDITIONS
│   ├── Deployment: one image, one service, one /data volume
│   │   ├── `exploreda server --data /data`, from the same bin as the CLI
│   │   ├── settings from env: public URL, session secret, upload limit
│   │   └── plain HTTP behind the operator's proxy; sample HTTPS proxy config
│   ├── Accounts (local, email and password)
│   │   ├── first-run setup creates the admin account
│   │   ├── admin creates author or viewer accounts and grants the admin flag
│   │   ├── one-time set-password and reset links the admin hands over
│   │   └── sign in, sign out, disable an account
│   ├── Projects with members
│   │   ├── authors create projects and add members as author or viewer
│   │   ├── each project is a CLI project folder under /data/projects
│   │   └── admins see and manage every project
│   ├── Data files
│   │   ├── upload into the project's data folder
│   │   └── fetch by URL: any http(s), fetched time shown, Refetch
│   ├── Authoring: the CLI app as it is, with autosave
│   │   └── a save reloads other open pages with "changed by <name>"
│   ├── Viewing: filter, select, drill, and inspect; never saves; "Viewing" label
│   └── Upgrades: migrate on start after a dated backup; backup = copy /data
├── EVALUATE BEFORE COMMITTING
│   ├── Scheduled refetch of URL sources
│   └── Download a project as a zip to open with npx
└── LATER POSSIBILITIES
    ├── Database sources (own initiative)
    ├── SSO, share links, email invites
    └── Import a CLI project or Git repository
```

## Behavior

| Situation | Expected result |
| --- | --- |
| A viewer changes filters or charts | Everything works in the page. Nothing is sent to be saved, and the server refuses a write if one arrives. |
| Two authors save the same analysis | The last save wins. The other author's page reloads with a notice naming who changed it, and undo can step back. |
| A URL fetch fails, times out, or exceeds the limit | The previous copy stays. The page shows the error and the time of the last good fetch. |
| A URL points at a cloud metadata or link-local address | The fetch is refused. Internal company hosts are allowed. |
| A request comes from another website | It is refused. Session cookies are same-site, and the server checks `Origin` against the public URL. |
| A new image starts on old data | It backs up what it will change, migrates, and starts. If migration fails, it stops and leaves the data as it was. |

## Decisions and boundaries

**Appetite:** One file-only team server built on the CLI's server, folder codec, and `apps/app`. No database sources.

**Key decision:** Each server project stays a plain CLI project folder, and the browser stays the folder reader. The server adds only three things around the existing file routes:

- who is asking: a session cookie replaces the per-run token;
- which project: a path prefix;
- whether they may write: author membership.

Accounts, sessions, and members live in one SQLite file on the volume, using Node's built-in `node:sqlite`, with no second container. The CLI's saving and reload code carries over, and any project still opens with `npx exploreda`.

**Pushback:** Invites use set-password links, not email, so the server needs no mail settings and makes no outbound calls of its own. Fetching URLs from inside the company network can reach internal services. You chose to allow it, so the server blocks metadata and link-local addresses, caps size and time, and logs every fetch. The CLI's upload cap is 50 MB, but CLI data targets about 100 MB, so uploads must stream to disk with a configurable limit.

**Boundary:** The CLI keeps its loopback-only, token-protected server unchanged; team mode is a separate auth adapter chosen by the `server` subcommand. No Kubernetes, email, SSO, or database sources.

**First proof:** **Try:** Run `apps/app` against the Node server in team mode locally, with no Docker. Seed two accounts (an author and a viewer) and one project folder. **Observe:** The server refuses the viewer's writes, and the app shows view-only with no failed-save errors. An author's save reaches the viewer's open page as a reload notice naming the author. The folder still opens with `npx exploreda`. **Decide:** If role checks on the unchanged file routes hold, build the accounts UI, Compose, and URL sources on them. If the app needs more than refused writes to act view-only, add a viewer mode to the app shell first.

See the [intent brief](intent-brief.md) and the [runtime modes program](../runtime-modes/intent-brief.md).
