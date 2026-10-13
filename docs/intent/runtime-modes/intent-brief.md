---
title: "explorEDA runtime modes"
slug: "runtime-modes"
phase: intent
status: current
last_updated: "2026-10-12"
---

# explorEDA runtime modes

## My read

You want explorEDA to run as a real product in several places, not only as a React component inside someone else's app. The notes name four ways to run it, ordered from least to most administration:

1. **Browser only** at exploreda.dev — the demo, files and CSVs only, no server.
2. **Local CLI** — `npx exploreda` in a folder, a project of readable text files, served locally.
3. **Self-hosted** — free Docker Compose inside a company, with accounts and database connections.
4. **Managed (paid)** — one tenant per Docker or Kubernetes deployment, with SSO and integrations. This comes last.

The embedded React component stays a separate track: the host developer owns storage, users, and data. Modes 2–4 run one new server-backed app (`apps/app`) on one Node server. The modes differ only in their storage, auth, and data-source adapters. The demo stays the browser-only mode, but it reads and writes the same project-folder format as the CLI.

**The CLI is first, and the near-term goal is a public `npx exploreda` launch.** Revenue is expected from the managed tier. Self-hosting is free, and component licensing (`commercial-license`, on unmerged `claude/license-*` branches) is paused.

## What matters most

- A polished, announceable `npx exploreda` that turns any folder into a project.
- One project-folder format shared by the CLI, the demo, and later the server. Sources, joins, and analyses are all dashboard text.
- One server and one app for modes 2–4, with differences only in adapters.
- Low administration at every rung, and nothing that makes the component require a server.

## How the modes line up

| Mode | Runs | Users | Data | Saved work |
| --- | --- | --- | --- | --- |
| Browser | demo, static | none | files | browser, or a picked project folder |
| CLI | `apps/app` + local server | one local user | files; DB next | project folder on disk |
| Self-hosted | same server, Compose | local accounts, author/viewer | files + DB | server volume |
| Managed | same image per tenant | SSO, enterprise | files, DB, integrations | per-tenant store |

## Boundaries

### Must be true

- The component keeps working with host-owned state.
- Analyses keep their meaning between modes when their data is reachable.
- Database credentials live on a server, never in the browser.

### Must be avoided

- Do not fork the app per mode.
- Do not build the managed platform before the CLI and self-hosted modes work.

## What seems settled

- Mode order and the CLI first; public npx launch as the near-term goal.
- The project-folder format is built inside the CLI's first milestone. It builds on the DSL v2 rewrite (#334→#360) after that merges.
- `apps/app` beside the demo; one server package; CLI as a bin in `exploreda`.
- Free self-hosting, paid managed; component licensing paused.
- [customer-instance-hosting](../customer-instance-hosting/intent-brief.md) was a seed for this program. It is paused, and its hosting research merges in when the managed mode is shaped.

## Child initiatives

- [Standalone app](../standalone-app/intent-brief.md) — users, sign-in, settings, projects.
- [Browser-only site](../browser-only-site/intent-brief.md) — the demo as mode 1.
- [Local CLI projects](../local-cli-projects/intent-brief.md) — mode 2, first to build.
- [Self-hosted team server](../self-hosted-team-server/intent-brief.md) — mode 3.

## Current reality that matters

The demo is a Vite app on GitHub Pages that stores work in `localStorage`. There is no CLI, server, or user model. [Database adapters](../database-adapters/intent-brief.md) plans a server read into the existing `tables` input, which fits the shared server.

## Next step after confirmation

The local CLI is [shaped](../local-cli-projects/shape-brief.md), and its first proof passed: sources, joins, and queries are project text. Next is the CLI implementation plan.
