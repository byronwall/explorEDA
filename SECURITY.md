# Security

## Reporting a vulnerability

Email security@exploreda.dev with steps to reproduce. Please don't open a
public issue. You'll get an acknowledgement within 3 business days and a
plan within 10. Fixes ship as patch releases with a note in the changelog,
and reporters are credited unless they ask not to be.

## What the package does and doesn't do

- **No network requests.** The `exploreda` package sends no telemetry, usage
  data, or license checks. License keys are verified in the browser with an
  embedded public key.
- **No dynamic code.** Calculated-field formulas are parsed by a grammar and
  evaluated by an interpreter; nothing is passed to `eval` or `new Function`.
- **Data stays in the host.** Rows, saved layouts, and settings live in
  memory and in whatever storage the host app chooses. The package writes to
  the clipboard only when a user picks a copy action.
- **Provenance.** Releases are published from GitHub Actions with npm
  trusted publishing and provenance attestations, so `npm audit signatures`
  can verify where each version was built.
- **Dependencies.** Runtime dependencies and their licenses are listed in
  `packages/explorEDA/THIRD_PARTY_NOTICES.md`, which ships in the package.

## Supported versions

The latest minor release gets security fixes. Commercial licensees get fixes
for any version released in the last 12 months on request.

## Security questionnaires

Licensees can send security or vendor questionnaires to
security@exploreda.dev.
