# Outline Flat review bundle

Start with `REVIEW.md` or `outline-flat-review.docx`. For direct experimentation, open `playground/index.html` in a normal browser. It embeds the compiled checker and examples; no external script, dependency installation, or server is required by the file. This environment's managed browser blocked direct file navigation, so its interaction checks injected the identical HTML bytes. No native charts are rendered.

## Contents

- `REVIEW.md` and `outline-flat-review.docx`: the revised design and its boundaries.
- `playground/index.html`: a self-contained editable DSL/feedback playground.
- `checker/flat.ts`: the new parser, binding/lowering adapter, explicit edits, diagnostics, and wrapper.
- `checker/outline-v1.ts`: the unchanged earlier subset semantic checker.
- `dist/`: compiled ES modules and TypeScript declarations, included to run without an installation.
- `checker/*.test.mjs`: 100 new tests plus the earlier 52-test regression suite.
- `examples/`: new Flat examples and the v1 comparison/regression fixtures.
- `evidence/`: actual test output, type-check log, checker results, browser checks, and character/line counts.
- `reference/previous-review.md`: supplied earlier review, the pinned source basis.

## Run sheet

Commands run from this extracted folder, not the explorEDA repository. Node 22.16.0 and TypeScript 5.8.3 were used here. The included JavaScript means checking and tests do not require a compiler installation.

```bash
# Check all 152 standalone tests against the included compiled modules.
node --test checker/*.test.mjs

# Check one DSL file against the supplied metadata-only source catalog.
node checker/cli.mjs check examples/quickstart.flat.eda --catalog examples/catalog.json

# Return full agent feedback, including ranges, origins, and stage labels.
node checker/cli.mjs check examples/invalid.flat.eda --catalog examples/catalog.json --json
# The deliberately invalid fixture exits 1; a usage/file error exits 2.

# Wrap whole assignments at 50 characters; stdout only by default.
node checker/cli.mjs format examples/dashboard.flat.eda --width 50
# Add --write only when intentionally replacing the named DSL file.

# Rebuild after editing TypeScript, with a locally available tsc.
tsc checker/flat.ts checker/outline-v1.ts --strict --target ES2022 \
  --module ES2022 --moduleResolution bundler --skipLibCheck \
  --outDir dist --declaration

# Optional local serving when a browser will not open file URLs.
python3 -m http.server 8080 --bind 127.0.0.1
# Visit http://127.0.0.1:8080/playground/ in that browser.
```

`ok: true` means the supported subset passed; it does not mean the output is a validated native saved workspace. No host catalog means deferred field-existence/type checks. The checker consumes trusted host metadata, not raw data rows. Its exact native checks cover a limited subset and do not certify all native scalar, aggregate, filter, or rendering behavior. No repository mutation, branch, commit, pull request, or deployment occurred.

The API has three exported entrypoints: `parse(text)`, `check(text, catalog?)`, and `format(text, width?)`. Format returns text and diagnostics without modifying a file. Source positions are zero-based UTF-16, end-exclusive; the CLI displays one-based positions. No suggested semantic repair is automatically applied.
