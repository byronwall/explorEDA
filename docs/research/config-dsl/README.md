# Config DSL research

Research from [Build Scatter Plot Test Bed](https://chatgpt.com/c/6ac08186-7fb0-83ea-864e-34a7564edb4c), retrieved October 3, 2026.

Start with [the intent brief](../../intent/config-authoring-dsl/intent-brief.md), then [the final review](03-final/exploreda-outline-final/REVIEW.md).

| Pass | Purpose | Files |
| --- | --- | --- |
| [01 Outline](01-outline/exploreda-dsl-review/REVIEW.md) | Three dialects: Outline, Phrase, Slots. | Review DOCX, examples, checker, tests, results. |
| [02 Flat](02-flat/exploreda-outline-flat/REVIEW.md) | Flat pairs, inline types, optional `+` wrapping. | Review DOCX, playground, checker, tests, results. |
| [03 Final](03-final/exploreda-outline-final/REVIEW.md) | Calculations, chart-owned filters, guarded repairs. | Review DOCX, playground, agent guide, CLI, checker, tests, results. |

Each ZIP is preserved unchanged beside its extracted pass. `download-manifest.json` records checksums.
[The session transcript](session-transcript.txt) retains visible prompts and replies, including the later calculation/filter request.
The [agent guide](03-final/exploreda-outline-final/AGENT.md) is reference material for future integration.
Its instructions do not authorize changes to this repository.

The latest user direction replaces mandatory indentation with compact pairs. It adds calculations and filters.
The final checker emits partial chart settings. It does not compile a complete native workspace or evaluate source rows.
Its `ok` result must not be used as a native runtime acceptance gate.

From `03-final/exploreda-outline-final/`:

```sh
pnpm test
node checker/cli.mjs check examples/order-book.final.eda --catalog examples/final-catalog.json --json
node checker/cli.mjs explain examples/order-book.final.eda --chart profit --catalog examples/final-catalog.json
```

The 275 final checker tests pass locally on Node 24.21.0. Prebuilt checker files need no installation.
Open [the final playground](03-final/exploreda-outline-final/playground/index.html) to explore its static examples.

The [scatter folder](../scatter-test-bed/README.md) contains the experiment source and statistical evidence.
