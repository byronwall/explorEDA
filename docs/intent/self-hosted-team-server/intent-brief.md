---
title: "Self-hosted team server with Docker Compose"
slug: "self-hosted-team-server"
phase: intent
status: draft
last_updated: "2026-10-12"
---

# Self-hosted team server with Docker Compose

## My read

A company should be able to run explorEDA for itself, for free, with one Docker Compose file. The target is 1–10 authors and 10–100 viewers inside one company. Authors connect the company's databases, build analyses, and save them on the server. Viewers sign in and read them.

This is the CLI's server and app with more adapters, not a separate backend. It adds **local accounts** (email and password, managed by an admin), author and viewer roles, server-side storage in a volume, and database connections. **Every viewer has an account.** There are no anonymous share links at first. Revenue comes from the managed tier, which reuses this image per tenant and adds SSO and integrations.

## What matters most

- One Compose file brings up a working multi-user app.
- Authors connect databases, and data reaches the browser through the server.
- Analyses and config persist across restarts and upgrades.
- Viewers can read analyses but not change them.

## The experience you appear to want

An IT person runs `docker compose up` with a small config and creates the first admin account. The admin invites authors and viewers. An author adds a PostgreSQL connection, builds an analysis, and a manager signs in to read it. After an upgrade, everything is still there.

## Boundaries

### Must be true

- Database credentials stay on the server.
- All state lives in volumes or a database the operator controls and can back up.
- It runs inside the company network with no call home.

### Must be avoided

- Do not require Kubernetes, external SaaS, or your involvement to operate it.
- Do not design for unlimited scale; the target is about 10 authors and 100 viewers.
- No SSO in this mode's first release.

## What seems settled

- Docker Compose, free, sized for 1–10 authors and 10–100 viewers.
- Same server package as the CLI.
- Local accounts first, and everyone signs in.

## Possibilities, not decisions

- SQLite in a volume, or a PostgreSQL container, for app state.
- Storing analyses in the same project-folder format inside the volume.
- Scheduled refresh of database snapshots.

## Current reality that matters

No server, image, or auth exists. [Database adapters](../database-adapters/intent-brief.md) plans a PostgreSQL snapshot read into the existing `tables` input. The paused [customer-instance hosting](../customer-instance-hosting/intent-brief.md) research covers running one image per customer.

## What still needs your input

- Is access shared through workspace membership, or does every account see every analysis?

## Next step after confirmation

Shape after the CLI's server and format exist.
