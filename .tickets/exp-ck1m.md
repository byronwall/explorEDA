---
id: exp-ck1m
status: open
deps: []
links: []
created: 2026-09-26T02:40:00Z
type: chore
priority: 2
assignee: Byron Wall
tags: [release, npm]
---

# Publish an exploreda release that matches the documented API

## Outcome and Why

The integration examples on the demo landing page and in the package README work when someone installs `exploreda` from npm. Right now they only work against the repository source.

## Ready Gate

Only the release decision is open. Byron owns publishing.

## Owned Context and Scope

npm's latest release is `exploreda@0.0.6`. It predates `onStateChange`, still requires `savedData`, and declares no React peer range. The current source exports `onStateChange`, makes `savedData` optional, and declares `react` and `react-dom` `^18 || ^19` as peers. The landing examples are in `apps/demo/src/landing/OrdersExplorer.example.tsx` and `OrderBook.example.tsx`.

## Acceptance Checklist

- Publish the next version through the repo's changeset flow (`pnpm release`).
- In a fresh app, `pnpm add exploreda` plus `OrdersExplorer.example.tsx` typechecks and renders.

## Cut Line and Provenance

Found while building the developer adoption page (PR #27). User-facing copy must not mention the gap.
