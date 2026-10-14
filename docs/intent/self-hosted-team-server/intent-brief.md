---
title: "Self-hosted team server with Docker Compose"
slug: "self-hosted-team-server"
phase: shape
status: current
last_updated: "2026-10-13"
---

# Self-hosted team server with Docker Compose

## My read

A company should be able to run explorEDA for itself, for free, with one Docker Compose file. The target is 1–10 authors and 10–100 viewers inside one company. Authors build analyses on the server from CSV and JSON files. Colleagues sign in to explore them.

This is the CLI's server and app with more adapters, not a separate backend. It adds **local accounts** (email and password, managed by an admin), **projects with members**, and storage on one volume. Each project is the same folder of project text, `.eda` analyses, and data files that `npx exploreda` writes. **Every viewer has an account.** There are no anonymous share links at first.

**The first team server is file-only.** Database sources are their own large initiative and are not part of this one. Revenue comes from the managed tier, which reuses this image per tenant and adds SSO and integrations.

## What matters most

- One Compose file brings up a working multi-user app.
- Projects, their members, and their files survive restarts and upgrades.
- Viewers can explore an analysis fully, but nothing they do is saved.
- A server project stays a plain project folder that the CLI can open.

## The experience you appear to want

An IT person runs `docker compose up` and opens the server's address. They create the first account, which becomes the admin. The admin creates author and viewer accounts. An author creates a project, uploads a CSV or gives a URL for the server to download, and builds an analysis. The author adds a manager to the project as a viewer. The manager signs in, filters and drills into the analysis, and closes the tab with nothing changed. After an upgrade, everything is still there.

## Boundaries

### Must be true

- All state lives on one volume the operator controls. A backup is a copy of that volume.
- An upgrade migrates data on start and keeps a dated backup of what it changes. If migration fails, the server does not start.
- It runs inside the company network with no call home.

### Must be avoided

- Do not require Kubernetes, external SaaS, email delivery, or your involvement to operate it.
- Do not design for unlimited scale; the target is about 10 authors and 100 viewers.
- No database sources, SSO, or anonymous links in this release.

## What seems settled

- Docker Compose, free, same server package and app as the CLI.
- A server holds many projects. Each project has members; admins see every project.
- Author or viewer is set per account. Authors create projects and add members.
- Admin is a flag on an account. The first account is the admin and can grant the flag to others.
- When two authors edit one analysis, the last save wins and the other page reloads with a notice.
- Files arrive by upload, or by a URL the server downloads. URLs may point inside the company network. The page shows when a URL was fetched, and authors can refetch it.

## Possibilities, not decisions

- Scheduled refetch of URL sources.
- Downloading a project as a zip to open with `npx exploreda`.

## Current reality that matters

The CLI stack (PRs 369–376, assumed merged) adds a loopback-only file server with a per-run token, a `ProjectFiles` port, and an `apps/app` shell with autosave and reload on outside changes. [Database adapters](../database-adapters/intent-brief.md) remains a separate initiative. The paused [customer-instance hosting](../customer-instance-hosting/intent-brief.md) research covers running one image per customer.

## Next step after confirmation

The [shape brief](shape-brief.md) and [implementation plan](implementation-plan.md) are ready for review.
