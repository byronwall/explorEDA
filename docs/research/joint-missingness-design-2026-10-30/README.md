# Build exact missingness patterns with kept notebook findings

Build a registered Joint missingness chart with exact pattern frequencies, complete record traces, and semantic selections.
Keep those selections in notebook text. Then add descriptive group comparisons and chosen-input checks.
The [implementation plan](../../intent/missingness-and-expected-records/implementation-plan.md) gives two milestones with docs and runnable examples.
Build is a planning disposition, not implementation approval.

Topic score: **17/20**, Design. [Pro conversation](https://chatgpt.com/c/6ae4ab2c-5840-83ea-a089-c2fc4d70681e),
completed in 51m38s, with no follow-up. Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
The [run record](run.md) records candidate scores, submission, collection, and verification.

## What the design adds

- Equal marginal missing counts can conceal different usable populations. The fixture has 25% versus 75% complete cases.
- Exact pattern unions need whole predicates. Exact x/y OR exact note selects four fixture rows; independent field choices admit nine.
- Effective missingness differs from raw absence and finite-number eligibility. Zero and false remain present under the missing-value reader.
- One explicit population must supply counts, shares, selections, and records. Notebook peers keep their selections local.
- Ordinary notebook writeback excludes filters. Explicit Keep must verify saved meaning through the parent's text echo and folder reopen.

## Local review

The [evidence and all eighteen dispositions](evidence.md) check the plan's decisive claims against current code.
Main was refreshed and remains at the baseline. Existing folder save ordering already covers text persistence.
No replacement writer or dependency on unbuilt keyed-record refresh is needed.

Retain Pro's exact-pattern representation and complete notebook lifecycle.
Defer its separate notebook-section export action and unmeasured hard computation cutoff.
First trace current input/query-output records accurately. A new notebook source-lineage adapter remains an exploration.
Do not equate missing fields with valid zero counts or statistical suitability.

The representation follows [UpSet's matrix and element views](https://vdl.sci.utah.edu/publications/2014_infovis_upset/),
[naniar's missingness combinations](https://naniar.njtierney.com/reference/gg_miss_upset.html), and
[VIM's count/proportion displays](https://statistikat.github.io/VIM/reference/aggr.html).
These primary sources support design choices, not measured superiority of the proposed UI.

## Originals and checks

[All nine original Pro artifacts](../../intent/missingness-and-expected-records/assets/pro-results/joint-missingness-design-2026-10-30/README.md)
are preserved byte for byte: both reports, notebook specification, fixture data, expected results, verifier/log, and SVG/PNG wireframes.
The supplied program remains unexecuted locally. Its 41 checks are Pro-reported.
Local independent fixture arithmetic and existing repository/doc tests are recorded in the evidence and run record.
ZIP and input packet remain ignored under `tmp/`.

No feature was implemented. Proposed browser, persistence, performance, and export acceptance remain future work.
No outside-demand gate blocks M1. Remaining decisions concern measured performance, later export scope, and optional raw/inclusive modes.
