# R072 — Explain settings in the context where their meaning changes

- ID: R072
- Category: Documentation and examples
- Priority: 80
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The settings reference is generated from saved keys and defaults, and `findDocsErrors` rejects undescribed settings or descriptions for nonexistent keys. `SettingsReference` groups shared settings, supports search, and separates settings described as not read by a chart. These are strong existing safeguards. They cannot by themselves prove that one description is sufficient for every mode or host. For example, chart selections ordinarily affect linked charts, while notebooks intentionally keep selections local. The research question is how to explain such contextual meaning without duplicating an entire reference for each environment.

Compare a small context qualifier beside the existing shared description with mode-specific examples linked from the same setting. Qualifiers can state the operative scope at the point of use; examples show consequences but require a detour. Another alternative is to leave the reference generic and improve the notebook or chart-mode guide where the distinction is introduced. Avoid generating all prose from type definitions: a default value and a union type do not explain an analytical consequence. Preserve the current gate's useful structural checks while investigating semantic coverage separately.

Select six settings whose interpretation depends on context, such as selection filters, local population, histogram versus category use, and a mode-specific color domain. Ask readers to predict one resulting change in both a dashboard and a notebook or alternate chart mode. Acceptance requires correct predictions and a single authoritative explanation for each distinction. Reject a context matrix if most cells repeat the same sentence, or if authors must update multiple prose copies for one behavior. A focused worked example should win when it communicates the difference more reliably.

This is a robustness follow-up to landing-docs-entry and current-analysis-trust, not a claim that the generated reference is absent or broken. The actual misunderstandings and documentation drift remain unverified; the initial output should be a short evidence-backed list of ambiguous cases. API impact is limited to optional documentation metadata if needed, with no runtime setting changes. Confidence is high that structural coverage and semantic comprehension are different concerns. The candidate earns its place because several product modes now reuse the same settings, making a small contextual explanation potentially more valuable than another page of exhaustive keys.

## References

- `apps/demo/src/docs/reference/settingDescriptions.ts` — `COMMON_SETTINGS`, `CHART_SETTINGS`, `describeSetting`. Shared and chart-specific prose descriptions already exist.
- `apps/demo/src/docs/reference/SettingsReference.tsx` — `SettingsReference`, `SHARED_GROUPS`, `NOT_READ`. The generated reference already groups, searches, and distinguishes unread settings.
- `apps/demo/src/docs/gate.ts` — `findDocsErrors`. The docs gate checks coverage and key validity.
- `packages/explorEDA/src/hooks/CrossfilterWrapper.ts` — `localSelections`. Notebook selection scope differs through an explicit mode.
- `docs/intent/landing-docs-entry/intent-brief.md` — related intent; status and overlap are discussed above.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
