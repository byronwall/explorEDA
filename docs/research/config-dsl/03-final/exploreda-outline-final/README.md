# explorEDA Outline — final review bundle

Start with `outline-final-review.docx` or `REVIEW.md`. The recommendation adds row-wise calculations and chart-owned filters without introducing indentation or a query tail. `playground/index.html` is self-contained and uses only the included fixture metadata; it does not load source rows or call a native chart runtime.

## Run sheet

Prebuilt JavaScript is included. Checking and running the tests require Node, not an installation step. The development build was verified with Node 22.16.0 and TypeScript 5.8.3. The optional document/browser tools use Python packages supplied by the execution environment, not runtime dependencies of the checker.

```sh
# From the extracted exploreda-outline-final directory.
CLI=checker/cli.mjs

# Inspect the supported language surface.
node "$CLI" schema

# Check the complete example and receive an agent-readable result.
node "$CLI" check examples/order-book.final.eda \
  --catalog examples/final-catalog.json --json

# Strict mode also blocks noninformational warnings.
node "$CLI" check examples/order-book.final.eda \
  --catalog examples/final-catalog.json --strict

# Inspect the settings, filter owners, and calculations for a specific chart.
node "$CLI" explain examples/order-book.final.eda \
  --chart profit --catalog examples/final-catalog.json

# Format to stdout. Add --write only to replace the source file explicitly.
node "$CLI" format examples/order-book.final.eda --width 50

# Demonstrate one guarded typo repair; this does not fix unrelated errors.
node "$CLI" apply examples/invalid.final.eda examples/repair.patch.json

# Run all standalone unit and regression tests against included dist files.
node --test checker/*.test.mjs

# Optional CLI workflow checks and evidence refresh (Python standard library).
python tools/cli_check.py

# Optional: install the pinned TypeScript development dependency and rebuild.
pnpm install
pnpm run build
pnpm run check:types
pnpm run test
```

Exit codes: `0` means the supported checker gate passed; `1` means errors; `2` means a CLI/input failure or a strict-mode warning block. Even a zero exit code is not native runtime certification. `ok` and `productionReady` have different meanings.

## Files

`checker/flat.ts` extends the previous Flat front end. `expressions.ts` contains a native-aligned expression parser and emitter; `calculations.ts` resolves dependencies and result metadata; `filters.ts` lowers and validates predicates. `edits.ts` applies guarded source edits. `outline-v1.ts` and the previous tests remain the inherited semantic-checker foundation. The tests in this bundle contain 152 inherited cases and 123 new cases.

`examples/*.final.eda` are the seven new fixtures. `final-catalog.json` contains fixture types, not data values. Older examples are retained for regression comparison. `evidence/` contains actual outcomes, including intentionally invalid examples. The production grammar boundary and observed pinned-renderer limits are documented in the review, not hidden behind permissive parsing.

`AGENT.md` is the generation/repair guide. `SOURCES.md` records repository and oracle provenance. `reference/native-calculation.ohm` is the grammar excerpt extracted from the previously supplied baseline deployment artifact. Its optional oracle script needs that deployment's Ohm module (not redistributed here), or a compatible installed Ohm ESM entry:

```sh
# Paths are explicit inputs; this script never downloads dependencies.
node tools/native-grammar-check.mjs /path/to/ohm-esm-entry.js

# Rebuild the self-contained playground from current dist and example files.
python tools/build_playground.py

# Optional browser verification requires Playwright plus Chromium.
# This recorded environment blocks file://; identical HTML bytes use set_content.
python tools/browser_check.py
```

## Limits

The checker does not evaluate real data, perform source joins, expand native defaults, generate native color scales/layouts, implement full native workspace/root or generic-chart compilation, validate every native chart setting, or render explorEDA charts. JSON escape hatches remain checked within the supported subset, not a bypass. No repository branch, worktree, commit, push, PR, deployment, or package release is part of this bundle.
