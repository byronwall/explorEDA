# R076 — Canonical settings across host echo and restore

- ID: R076
- Category: Embedding and package contracts
- Priority: 17
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A React host can persist a workspace snapshot, deserialize it, and hand it back after an unrelated render. `DataLayerProvider` already recognizes its own settings and avoids rebuilding the data store; its regression test explicitly covers a controlled host echo. The remaining question is whether this guarantee survives realistic persistence transformations. `getSavedStateFingerprint` uses JSON serialization with special-value handling and removes `modifiedAt`, making representation differences a concrete investigation surface rather than evidence of a confirmed feedback-loop defect.

Compare three boundaries: keep the existing fingerprint and document the accepted shape; normalize only default-equivalent settings before fingerprinting; or compare a small stable semantic representation produced by the save codec. Include object-key order, omitted versus explicit optional fields, categorical mapping order, and host-added metadata. Preserve every distinction that changes filters, chart order, or interpretation. The research should identify which differences are genuinely equivalent before proposing a generalized deep-equality helper or introducing another serialization format.

The first proposed experiment uses a project consumer with calculations, a theme, geometry references, and active filters. Capture a meaningful edit, return several equivalent encodings, then return an actual changed filter and an older delayed snapshot. Record callback counts, store identity, restored row membership, and time in restore. Accept a design only if equivalent inputs remain cheap while deliberate replacements apply once and stale host intent remains distinguishable. Reject extra normalization if the documented host contract already resolves every representative case or if normalization hides a meaningful change.

This is a bounded robustness follow-up to current-analysis-trust, not a request to make `savedData` controlled. The public props can remain unchanged; most cost lies in defining equivalence and maintaining a compact fixture suite. Confidence in the opportunity is high because the source and performance guide identify this exact boundary, but no new runtime failure has been reproduced. It earns an early slot because repeated restore work can affect every embedded analytical task while a small experiment can rule the concern out.

## References

- `packages/explorEDA/src/providers/DataLayerProvider.tsx` — `getSavedStateFingerprint`, `saveToStructure`, `restoreFromStructure`. The fingerprint suppresses modifiedAt and distinguishes special values; replacement settings can trigger restoration.
- `packages/explorEDA/src/test/providers/DataLayerProvider.test.tsx` — `does not rebuild when a controlled host passes back its own snapshot`. Existing regression coverage protects a direct controlled-host echo.
- `docs/performance-checks.md` — `Patterns that keep edits cheap`. Documents the existing echo fix and its measured historical motivation.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
