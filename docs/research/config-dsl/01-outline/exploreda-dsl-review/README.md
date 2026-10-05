# explorEDA DSL design review

Read **exploreda-dsl-review.docx** for the formatted review or **REVIEW.md** for the same source text.

## Package contents

- `REVIEW.md` and `exploreda-dsl-review.docx`: three syntax proposals, equivalent examples, comparison, native-settings boundary, complete checker design, and implementation gates.
- `examples/`: complete runnable examples for Outline, Phrase and Slots; source field catalog; detailed raw config; metrics; no-source mode; deliberately invalid input.
- `checker/checker.ts`: dependency-free TypeScript parser, binder and limited semantic checker for the three front ends.
- `checker/cli.mjs` and `checker/checker.test.mjs`: runnable CLI and tests.
- `evidence/`: captured diagnostics, normalized patches, test log, strict type-check log, environment and character counts.

## Scope

This is a design review with a **limited executable prototype**, not a new release of explorEDA. The prototype returns chart patches using canonical native field names. It does not return complete `SavedDataStructure` values, generate color scales, expand native defaults, validate the entire native schema, run formulas, format DSL, or render charts.

Supported prototype kinds: scatter, hist/histogram, bar, row, table and metric. One implicit workspace is supported. The document's multi-workspace, defaults, explicit edits, formula, generic raw-chart import, literal text and lab-adapter features are **proposals**. Not every proposed form is executable by this prototype. Unsupported proposal declarations are reported rather than silently ignored.

A success result explicitly retains `fullNativeSchema: "not-implemented"` and `runtime: "not-run"`. No `pnpm check` or browser verification of native DSL integration was performed. No repository files, commits, branches, PRs or deployments were changed.

## Run sheet

Run from this directory. No npm/pnpm installation is needed for the checker. Node 22.16.0 was used for these captured runs. A local `tsc` is needed only for the last command.

```sh
# Passing tests.
node --experimental-strip-types --test checker/checker.test.mjs

# Check each equivalent dashboard.
for syntax in outline phrase slots; do
  node --experimental-strip-types checker/cli.mjs \
    "examples/dashboard.$syntax.eda" \
    --catalog examples/catalog.json --json
done

# Inspect detailed arrays and explicit raw settings.
node --experimental-strip-types checker/cli.mjs \
  examples/raw-config.outline.eda \
  --catalog examples/catalog.json --json

# This intentionally exits 1 and produces several independent diagnostics.
node --experimental-strip-types checker/cli.mjs \
  examples/invalid.outline.eda \
  --catalog examples/catalog.json --json

# Optional strict type check of the pure source module.
tsc --strict --noEmit --target ES2022 --module ESNext \
  --lib ES2022,DOM checker/checker.ts
```

Exit 0 means the prototype's subset checks succeeded. Exit 1 means source diagnostics contain errors. Exit 2 means an input/tool failure. Omitting `--catalog` allows parsing and mapped names, but existence/type validation is explicitly deferred; exit 0 is not full binding certification.

## API

```ts
import { check, type Catalog } from "./checker/checker.ts";

const catalog: Catalog = {
  data: { fields: { Revenue: "numeric", Margin: "numeric" } },
};
const result = check(
  "eda 1 outline\nscatter x Revenue y Margin\n  id revenue-margin",
  catalog,
);
console.log(result.validation);
console.log(result.diagnostics);
console.log(result.preview.chartPatches);
```

The full production `compile`, `format` and `explain` APIs in the review are a **proposed contract**, not exports of this prototype. Use the `CheckResult` type in `checker.ts` as the actual interface.

## Source provenance

The relevant current repository contracts were re-read at commit `226ffae632239150b54b55e9b346386e5e1e66d4`. The earlier scatter context used `94bfe0b325b9a19100def647e5555766a1f7eb9f`. Pinned source references appear in the review. No package source or font files are bundled here.
