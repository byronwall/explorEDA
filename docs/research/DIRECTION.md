# Pro research direction

This page steers the scheduled ChatGPT Pro research pipeline and any other Pro handoff for explorEDA. Read it before choosing a topic. It takes precedence over catalogue rank, earlier run queues, and "next topic" notes left by previous runs.

## What Pro is for here

Pro is the strongest research and design model available, and its messages are scarce (about 50 a week across all of Byron's projects). Use it where deep research changes what gets built:

- **Feature design.** How the best tools, libraries, and papers solve a capability, and the design and milestone plan explorEDA should adopt.
- **Statistical and algorithmic methods.** The correct method, its edge cases, exact test values, and a plan to implement it.
- **Product strategy.** Who explorEDA serves best, how it compares with named alternatives, and which capability bets matter most.

Byron is the demand. A topic does not need a named outside user, an observed failure, or a usability study to qualify. Pro should argue the merits and design ambitiously, with a staged plan.

## What not to send to Pro

- **Robustness audits** of existing behavior: contract mismatches, count reconciliation, wording fixes. A Claude or Codex worker with a checkout finds and fixes these faster. If a topic is mainly this, open an issue or a fix task instead of a Pro run.
- **Docs-only or lesson-only work.**
- **Topics whose likely answer is "keep what we have."** If the honest best outcome is no change, pick a different topic.

## How to choose a topic

Build a short list of three to five candidates from these sources, then score each on the questions below and pick the best one. Record the scores and the pick in the run record.

**Sources:**

1. The candidate directions below.
2. `docs/intent/research-ideas-100/catalogue.md`, mainly the `new-direction` ideas and the `follow-up` ideas that add a capability. Catalogue rank is a weak tiebreaker, not the order of work.
3. Open intents under `docs/intent/` that describe a capability not yet built.
4. A new topic the pipeline proposes itself, when it beats everything listed. Explain why.

**Score each candidate (1–5):**

- **Capability gained:** after it's built, what can a user do that they can't do now? Higher for things analysts notice.
- **Pro advantage:** does a good answer need deep literature, cross-product comparison, or careful math? Low if a worker could answer it by reading the code.
- **Buildable result:** will the answer end in a milestone plan workers can start right away?
- **Momentum:** does it build on what shipped recently (check `git log origin/main`)? Recent focus: notebooks and sheets, the daily viz collection, annotations, built-in chart counterparts.

Skip topics already covered by a merged or open research PR unless the new question is a Design or Methods question the earlier run didn't ask.

**Mix over time:** most runs should be Design. About one run in four should be Methods. About one in eight should be Strategy. Look at the last several run records to keep the balance.

## Candidate directions

These came out of reviewing the October 2026 research PRs. They are starting points, not a fixed order.

- **Findings bound to a live selection.** One selection drives several charts, an exact lasso, and notebook text whose numbers update with it. Builds on the notebook work and on `docs/intent/data-bound-narrative/` and `docs/intent/precise-composite-selection/`. The Mosaic study (`docs/research/mosaic-selections-2026-10-20/`) has a staged plan to start from. Catalogue R067, R068, R054.
- **Selections and findings that survive a data refresh.** Stable row keys so saved selections, filters, and findings follow the same records after reload. See `docs/research/selection-identity-2026-10-22/`. Catalogue R077 follow-up, R086.
- **"Why do these numbers differ?"** Pick two views or cards and see which rows each counted, which they share, and why they differ. Catalogue R056; see `docs/research/filter-ownership-2026-10-22/` and `docs/research/entity-grain-2026-10-21/`.
- **Engineering and spec-limit histograms.** Authored bin edges, width, and origin; lower and upper spec limits; in-spec and out-of-spec counts by group; the exact out-of-spec records. Catalogue R008 follow-up; see `docs/research/engineering-bins-2026-10-21/`.
- **Regression and model diagnostics.** Residual diagnostics on the fitted population, fit sensitivity, an equation you can copy that holds after a unit change. Catalogue R002, R003; see `docs/research/regression-conditioning-2026-10-22/`.
- **Methods topics:** weighted distributions (R009), pooled-versus-group reversals (R010), rolling windows from exact contributors (R035), rank correlation for pair discovery (R005), covariance ellipses (R004).
- **Data preparation as a feature:** wide-to-long reshaping (R042), lag and difference (R049), reversible category mappings (R038), join-key preparation (R041).

## What a run hands back

Use the Design, Methods, or Strategy mode of the global `prepare-chatgpt-pro-repo-prompt` skill. A Design or Methods run ends with:

- `docs/intent/<feature>/implementation-plan.md`: milestones in order, each shippable alone, naming files, tests (with exact expected values where they apply), the docs page and runnable example, and the main risk. AGENTS.md requires docs and examples in the same milestone as the feature.
- A short summary in `docs/research/<topic>-<date>/README.md`: the decision, key findings, sources, open questions, and the Pro conversation link.
- A small PR that leads with what to build.

Don't commit Pro originals, ZIPs, hash manifests, or source receipts. The conversation link is the record of the source.

Don't end a run by naming the next topic. The next run chooses for itself from this page.
