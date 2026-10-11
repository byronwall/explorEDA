# Support and stability

## Getting help

- **Everyone**: open a GitHub issue for bugs and questions. Search first;
  include the package version, browser, and a small reproduction.
- **Commercial licensees**: email support@exploreda.dev with your license ID.
  You'll get a first reply within 2 business days. Enterprise orders can add
  a 1-business-day response.

## Stability

- **Saved layouts.** `SavedDataStructure` and the dashboard text format are
  versioned. A new release reads layouts saved by any earlier 0.x or later
  release; when a format changes, the package migrates old layouts on load.
- **Breaking changes.** While the version is 0.x, a breaking API change
  ships in a minor release and is listed first in the changelog with the
  replacement. Deprecated props keep working for at least one minor release
  and warn in the console.
- **Releases.** Every release is listed in the changelog and on GitHub
  releases. Pin a version if you need to upgrade on your own schedule.
- **Browsers.** Current desktop Chrome, Edge, Firefox, and Safari, at 1024
  CSS pixels wide or more.
- **Frameworks.** React 18 and 19. In Next.js, render explorEDA in a client
  component (`"use client"`), and load it with `next/dynamic` and
  `ssr: false` when the page renders on the server.

## Licensing questions

See https://exploreda.dev/license or email sales@exploreda.dev.
