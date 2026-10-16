---
title: "Landing and docs entry paths"
slug: "landing-docs-entry"
phase: intent
status: current
last_updated: "2026-10-15"
---

# Landing and docs entry paths

## My read

The landing page still sells explorEDA as "explore a CSV, or embed it in React." The product now also runs as a local CLI project, a self-hosted team server with database snapshots, and `.eda.md` notebooks. The [landing and docs review](../../research/landing-docs-2026-10-15/README.md) (PR #430) confirmed this gap. You want the important fixes built now, not a long redesign program.

Linked exploration stays the lead. Analysts who open a file or run `npx exploreda` come first. Databases, notebooks, and the team server become visible early, and each links to a walkthrough that actually works. The landing page and docs home then get a full visual redesign around that content.

## What matters most

- Every claim on the landing page and docs is true. Each promoted path ends in steps someone has actually run.
- `npx exploreda` sits in the hero, because the CLI launch is the near-term goal.
- Databases, notebooks, and the team server are easy to find without competing with the lead.

## The experience you want

A visitor sees linked charts filter each other and reads "explore data," not "a CSV." They can open a file, try an example, or copy `npx exploreda`. Below the demo, short routes cover local projects, database snapshots, notebooks, the team server, and React. Each route says where it runs. On the docs home, "Choose your path" sends them to a page that opens with a short walkthrough ending in a visible result: a project saved and reopened, a snapshot refreshed, a notebook edited and reopened, a team member signed in.

## Boundaries

### Must be true

- The local-folder, database, notebook, and team-server walkthroughs are run step by step on local example data before they merge. A failed step becomes a fix or a copy change.
- The walkthroughs are checked against main. The public site catches up with the next release, and each PR carries its changeset.
- Existing docs URLs, the MDX system, generated reference, the chart chooser, and the order-book example stay.
- Copy keeps the real limits: database data is a saved snapshot with an explicit refresh, notebook selections stay local to each chart, and seed accounts are temporary while project files remain on disk.

### Must be avoided

- Promoting a path whose steps haven't been run.
- Treating "analysis platform" or teams as the lead (option C).

## What seems settled

- Hierarchy B: hero buttons are "Open a file" and "Try an example," plus a copyable `npx exploreda`. The React install moves to a developer section.
- Order: claim fixes first, then copy and routes, then walkthroughs, then one redesign pass covering the landing page and the docs home.
- The redesign is built straight through and reviewed through PR screenshots at three widths. There is no checkpoint to approve a design comp first.
- Out of scope: the file and React walkthroughs, a landing strip of proof screenshots, search-metadata tuning, replacing the order-book example, new demo datasets, a sidebar restructure, and managed hosting, SSO, or new adapters.

## Possibilities, not decisions

- The headline "Explore data with linked charts" comes from the review and is only illustrative.
- A separate runtime-orientation page, or just a section on the docs home.

## Current reality that matters

- npm `exploreda@0.2.0` and the `ghcr.io/byronwall/exploreda` image are published. Main is 116 commits ahead of 0.2.0.
- `docker/demo/compose.yaml` provides a PostgreSQL retail project. Docker is available locally for the team walkthrough.
- The notebook and database intent briefs are stale compared with the current code.

## Next step after confirmation

Shape the work and write a proof-first plan, with one stacked PR per milestone on top of PR #430.
