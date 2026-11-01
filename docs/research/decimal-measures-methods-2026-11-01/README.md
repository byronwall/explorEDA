# Build exact decimal measures with saved rounding

Add explicit exact-decimal calculations over retained source values, exact Rows and metric results, and saved rounding policies.
Then add grouped projects and notebook reconciliation.
[Implementation plan](../../intent/decimal-measures/implementation-plan.md).
[Original Pro artifacts](../../intent/decimal-measures/assets/pro-results/decimal-measures-methods-2026-11-01/ASSET_INDEX.md).
[Pro conversation](https://chatgpt.com/c/6ae6a646-0d34-83ea-b5eb-cceb8c81fc51).
R037 Methods scored **17/20**. This is a plan for review; no decimal feature ships here.

Use a decimal tag, canonical coefficient string, and scale at JSON/worker boundaries, with BigInt inside arithmetic.
Exact source text differs from a Number's shortest spelling. Business rounding differs from display precision.
Explicit line rounding and post-total rounding can both be correct and give different amounts.
Three `0.05` lines taxed at `0.10` total `0.15` with half-even line tax and `0.17` with total tax.

Complete population evidence matters as much as exact digits.
The eight-row fixture has six valid amounts totaling `28.685`, plus one missing and one invalid amount.
A zero partial difference cannot pass whole-population reconciliation.
Separate Totals match from Lines match: opposite one-cent residuals cancel while both lines remain different.

[Local dispositions](decisions.md) retain three complete build stages and optional selected chart projections.
[Evidence](evidence.md) records current-code checks, primary-source checks, and 573 independent local assertions.
The local check covers 112 numerical cases, nine comparison/key cases, and ledger/population/entity arithmetic.
All 82 error contracts were inspected. Pro's full 215-case verifier result remains attributed; its program was not executed locally.

The local plan clears positional selections on decimal refresh because the current remapper does not prove lossless identity.
It also requires error/missing permutations, sort-tie tests, complete host/folder adapters, and docs plus runnable examples in each milestone.
No unbuilt numeric-preparation or quantity proposal is a prerequisite.

[ECMAScript JSON](https://tc39.es/ecma262/multipage/structured-data.html#sec-serializejsonproperty) supports string coefficients at JSON boundaries.
[General Decimal Arithmetic](https://speleotrove.com/decimal/daops.html#refquant) supports explicit quantization reasoning.
[big.js](https://mikemcl.github.io/big.js/) is a fallback comparison; no dependency is selected.
The chosen limits and half-even policy remain product choices.

No blocking product question remains. UI placement, measured costs, and optional plotting need implementation evidence.
Feature behavior, browser flows, worker/persistence round-trips, and performance remain untested proposals.
