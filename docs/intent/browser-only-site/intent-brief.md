---
title: "Browser-only explorEDA at exploreda.dev"
slug: "browser-only-site"
phase: intent
status: draft
last_updated: "2026-10-12"
---

# Browser-only explorEDA at exploreda.dev

## My read

exploreda.dev is the zero-setup way to use explorEDA. Someone can try the product or do a quick ad hoc analysis with nothing to install, no account, and no server. The stated goal is minimal administration, for the visitor and for you as operator.

**This mode stays the demo.** It is not a static build of the new server-backed app. Data comes from files only, with no database sources and no public storage service. Saved work lives in the browser. In Chromium browsers the demo can also **open a CLI project folder** through the File System Access API. It then reads and writes the same analysis files that `npx exploreda` uses, so a project moves between the two without conversion.

## What matters most

- Open, load a file, and explore, with no account or setup.
- Nothing to administer: static hosting only.
- Work survives a reload in the same browser.
- The same project-folder format as the CLI, where the browser allows it.

## The experience you appear to want

A visitor opens exploreda.dev, drops a CSV, and gets the summary and rows. They build a few charts, close the tab, and find them there later. A CLI user opens their project folder in the demo instead and edits the same analysis files they commit to git.

## Boundaries

### Must be true

- Data stays in the browser or the picked folder unless the user explicitly shares it.
- File-only sources; database options are explained as needing another mode.
- Browsers without folder access still work with browser storage.

### Must be avoided

- No server, accounts, or hosted storage in this mode.
- Do not silently put large or private data into a shareable URL.

## Possibilities, not decisions

- A URL-encoded playground for small data.
- A magic-link store, which would need a small service.

## Current reality that matters

The demo deploys to GitHub Pages and loads CSV and JSON (`CsvUpload.tsx`, `readDataFile.ts`). It keeps tables and saved views in `localStorage`, which limits stored data to a few megabytes. It has no folder access or URL sharing.

## What still needs your input

- Is a shareable link in scope, and is a small storage service acceptable for it?

## Next step after confirmation

Shape folder access after the CLI's project format is defined.
