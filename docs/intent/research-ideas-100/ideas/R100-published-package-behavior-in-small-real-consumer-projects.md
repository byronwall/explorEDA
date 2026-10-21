# R100 — Published-package behavior in small real consumer projects

- ID: R100
- Category: Embedding and package contracts
- Priority: 15
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The published package declares ESM and CommonJS entry points, public types, stylesheet access, and React 18/19 peers. Its worker is created through a relative module URL, and the baseline build configuration emits that script alongside the package entries. The existing lean-bundle check answers a useful dependency-size question for a selective consumer. A separate reliability question remains: which installed-package probes establish that the supported consumer routes actually contain and resolve the assets, types, and runtime behavior that source-based tests expect?

Compare one minimal browser application plus a small public-analysis import check with a wider compatibility matrix. Keep source tests as the cheap baseline and add consumers only for distinct packaging risks. Probe declared import and require routes where supported, React peer versions, CSS loading, and worker execution without assuming every module must run in a server renderer. This is about one published version's stated contract. It does not propose version coexistence, a new bundler platform, or testing every conceivable host configuration.

In a complete checkout, use pnpm to build and pack the package, then install that archive into small isolated consumers. Compile a public type example, render one analytical view, evaluate one project with a worker, and verify its result against direct evaluation. Check failures from an intentionally omitted worker asset or export in a future disposable experiment. Acceptance requires a compact reproducible set that detects those release risks with clear diagnosis. Reject a broad matrix if representative consumers cover them, or if most maintenance concerns configurations the package never promises to support.

This high-confidence robustness candidate follows release-gated-checks and runtime-modes while leaving release policy and CI unchanged. Supplemental build sources were read from the same baseline commit, not a newer branch. No package build or consumer execution was possible from the selected packet. The cost should remain a few tiny fixtures and commands, with no product API change. It earns its place because a solo maintainer needs confidence that an analysis works after installation, including assets and types that can be invisible to tests importing source files directly.

## References

- `packages/explorEDA/package.json` — `exports`, `peerDependencies`, `files`. Declares published entry points, packaged files, and supported React peers.
- `packages/explorEDA/tsup.config.ts` — `analysis-worker`, `format`. Supplemental baseline GitHub source builds ESM/CommonJS outputs and a worker script.
- `packages/explorEDA/src/lib/analysis/createAnalysisWorker.ts` — `createAnalysisWorker`. Uses a relative module-worker URL whose resolution depends on the built consumer artifact.
- `packages/explorEDA/scripts/verify-lean-bundle.mjs` — `bundle`, `gzip`. Supplemental baseline GitHub check measures a selective chart consumer and excludes heavy accidental dependencies.
- `docs/intent/release-gated-checks/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/runtime-modes/intent-brief.md` — related intent; status reconciled against implementation in the brief.
