---
title: "Standalone explorEDA app"
slug: "standalone-app"
phase: intent
status: draft
last_updated: "2026-10-12"
---

# Standalone explorEDA app

## My read

The demo has grown into the place people use explorEDA, but it is a showcase around the React component. You want a proper application, with users, sign-in, settings, projects, and saved work that lives somewhere durable. The notes say storing user data makes it a multi-user system.

The app is a **new `apps/app` beside the demo**. The demo keeps the landing page, docs, examples, and browser-only use. The new app is server-backed and runs in the CLI, self-hosted, and managed modes. It hosts the component through its public API. It adds the application layer the component leaves to the host: identity and roles, app and user settings, projects, data-source definitions, and saved analyses. Each part sits behind an adapter that a mode supplies.

The adapters arrive in mode order. The CLI needs a **single local user** and **project-folder storage**. Self-hosted needs **local accounts** (email and password, managed by an admin) and server storage. Every self-hosted viewer has an account with a viewer role. SSO waits for the managed tier.

## What matters most

- One app for modes 2–4, with mode differences in adapters only.
- Settings with clear precedence: global, then project, then analysis.
- Projects that hold sources and analyses and reopen intact.
- Authors build and change analyses; viewers only read them.

## The experience you appear to want

In the CLI, the app opens straight onto the folder's project with no sign-in. On a team server, an author signs in, opens a workspace, connects a source, and builds analyses that colleagues sign in to view. A settings page holds personal preferences and, for admins, the app's configuration.

## Boundaries

### Must be true

- The app uses only the component's public API.
- No sign-in in browser-only or CLI mode.
- A viewer cannot change an analysis.

### Must be avoided

- Do not put users, sign-in, or server needs into the component.
- Do not build SSO, audit, or fine-grained permissions before the managed tier.

## What seems settled

- New `apps/app`; the demo stays the browser-only and docs site.
- Single local user first; local accounts for self-hosted; all viewers have accounts.

## Possibilities, not decisions

- Workspaces as the unit of sharing, or one shared space per server.
- An admin role, or the first account acting as admin.

## Current reality that matters

`apps/demo` stores saved views, history, and tables in `localStorage` (`savedViewsSession.ts`). The component exposes `onStateChange` and save and restore structures that any host can persist. No user, auth, settings, or server code exists.

## What still needs your input

- Is admin a separate role, or is the first account the admin?

## Next step after confirmation

Shape the storage and auth adapters with the CLI as the first consumer.
