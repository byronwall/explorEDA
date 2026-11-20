# Standalone charts example

A separate Vite + React app that installs `exploreda` the way a package user
does, from a packed tarball, and draws charts with `Chart` from
`exploreda/chart`. Its own global styles are loud on purpose: the page proves
that `exploreda/dist/chart.css` leaves them alone.

It is not part of the pnpm workspace. It has its own `pnpm-workspace.yaml`
and lockfile-free install.

```bash
pnpm --filter exploreda build
cd examples/standalone-charts
pnpm run install-lib
pnpm dev
```

`install-lib` packs the built library into `vendor/exploreda.tgz` and installs
it. Run it again after each library build. `pnpm build` type-checks the app
against the package's published types and builds it.
