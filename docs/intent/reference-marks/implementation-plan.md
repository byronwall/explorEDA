---
title: "Chart annotations and reference marks — implementation plan"
slug: "reference-marks"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Chart annotations and reference marks — implementation plan

## Plan at a glance

Prove a record callout and fixed target together in an ordinary scatter chart. This tests two different attachment rules immediately. Add the remaining comparison forms, saved highlights, and chart coverage in later slices. A successful first slice is useful, but it does not complete this initiative.

Keep the existing React renderers, state store, saved workspace, and host history. Composition already has annotations, guides, supplied bands, and output. Reuse its useful behavior without making artboard authoring a prerequisite for ordinary charts. The downloaded contract is a design reference; importing its entire document architecture would add unnecessary work.

The main risk is identity. Internal row IDs are assigned from array positions. Persist a source key and field bindings for record attachments. Resolve keys before projecting positions. Missing or duplicate keys must produce a visible repair state. A fixed coordinate must remain a fixed coordinate.

This is a proposed delivery sequence. The current request authorizes source capture and planning, not feature implementation.

## Implementation strategy

**Saved state:** Add the required annotation types to supported chart settings. Keep stable annotation IDs, attachment definitions, geometry, content, and style in saved state. Keep focus, selection, handles, drag previews, and automatic layout results transient. Extend `saveDataUtils.ts` at the actual JSON boundary. Account for `SavedDataTypes.ts`, dashboard-text coverage, and export so no path silently drops annotations.

**Rendering boundary:** Each supported chart supplies its actual scales, field bindings, plot bounds, and eligible rows. Resolve attachments before drawing. `BaseChart.tsx` provides an overlay slot, but `ScatterSvg.tsx` has a separate shell. Reuse small projection and annotation helpers across both. Do not build a registry of third-party chart adapters.

**Editing:** Use `updateChart` and the existing `useChartEdit` transaction boundary. One completed gesture produces one host change; cancel produces none. Provide an annotation list and compact nonmodal controls through `PlotChartPanel.tsx` and `ChartSettingsContent.tsx`. Enter annotation editing explicitly. Preserve existing chart gestures outside that mode.

**Local proof:** Create a small synthetic fixture with a unique `sample_id`, numeric x/y values, a category, dates, and supplied bounds. Include reordered, missing, duplicate-key, filtered, and invalid-bound variants. No database or external service is needed.

The target checkout has a demo server on localhost port 5291. Its process points to this checkout's `apps/demo`. Public local fixtures also exist under `apps/demo/public/datasets`. Do not reset the user's current workspace. Use a separate local test context and the synthetic fixture for implementation checks.

Run targeted tests with `pnpm --filter exploreda exec vitest run <changed-test-files>`, then `pnpm --filter exploreda check-types`. The exact new test filenames belong to implementation. Start a separate local server with `pnpm --filter demo dev --port 5292 --strictPort` if needed. Check that port before starting it.

**Rollback:** New annotations are optional chart content. Removing or hiding them returns the underlying chart. Ship each supported chart path separately. Do not convert saved compositions or add mixed-version fallback code.

## Milestone 1: A note stays attached to the same observation

Add a plain label/callout and fixed numeric target to an ordinary scatter chart.

- Define the small attachment union in a new chart annotation module. Use explicit source key fields for record attachments.
- Resolve keys from source data, then apply visibility and scale projection. Distinguish filtered, missing, ambiguous, incompatible, and offscreen states.
- Add list-based creation, text and offset forms, removal, and repair. Allow label movement without moving its subject.
- Wire scatter rendering and saved settings through the existing store and edit transaction. Save and restore the content in the same slice.
- Test save/reload after row reordering, changed record values, duplicate keys, and deleted records. Test the fixed target under linear and symlog scales.
- In the browser, move and cancel a label, commit and undo an edit, filter and restore its subject, then resize. Verify selection, brushing, and Alt-click tracing still work.

### Desired end state

- A saved callout follows a keyed observation; a fixed target keeps its value.
- Unresolved attachments remain editable without attaching to an unrelated point.
- One completed edit creates one host history step; cancellation creates none.

## Milestone 2: Users can explain values, events, and intervals

Extend the same authoring flow with fixed coordinate and plot-position labels, arrows, horizontal/vertical rules, bands, and two-endpoint ranges or brackets. Add category and date attachments where the chart exposes those scales.

- Integrate both observation and time-series line rendering in `LineChart.tsx` and `TimeSeriesChart.tsx`. Respect left/right y-axis bindings.
- Reuse current numeric scale and field-formatting paths. Store source values, not projected pixels.
- Add endpoint and style controls, duplicate, visibility, and naming. Provide form controls for every drag operation.
- Clip geometry to its intended frame. Keep out-of-view definitions in the list. References do not extend the domain by default.
- Add supplied lower/upper intervals only with named fields and a stated interpretation. Reuse composition band behavior where applicable.
- Check negative and symlog values, date conversion, categorical positions, reversed/missing bounds, and dual-axis field changes.

### Desired end state

- A chart can combine a callout, a target, an event, and a labeled interval.
- Saved values and labels retain the correct units and axis attachment.
- Every form can be edited without dragging.

## Milestone 3: Highlights and derived references retain their meaning

Add coordinate rectangles/ellipses, saved record-set highlights, and a small set of declared calculations.

- Persist record-set membership as keys. A region instead persists its coordinate bounds. Label these as different choices.
- Keep annotation highlights separate from workspace filters. Do not turn selection changes into permanent annotation edits.
- Reuse composition's calculation concepts: population and filter policy are separate. Start with a small existing aggregation set.
- Define the population explicitly in the UI and saved state. Proposed policy: both scopes respect the chart's source and local restrictions. “All eligible rows” ignores interactive workspace filters; “Filtered rows” follows the current selection.
- Distinguish a fixed record from a query such as “largest value among filtered rows.” A query may change subjects by design.
- Verify partial record-set visibility, empty selections, missing keys, and changed query winners. Include duplicate-key failure cases.

### Desired end state

- A saved group cannot silently become whatever falls inside a rectangle.
- A calculated reference explains which rows supplied its value.
- Filtering does not create annotation undo steps.

## Milestone 4: Supported charts and compositions share consistent annotation behavior

Extend ordinary Cartesian chart coverage only where the attachment can be defined and tested. Reconcile equivalent composition behavior within the same work.

- Use existing plans and trace contributors for bars, row charts, and other eligible views. An aggregate glyph needs its group/bin and measure definition; it is not one source record.
- Bind repeated views by semantic facet keys, never panel order.
- Reuse composition's `AnnotationAnchor`, resolver, inspector controls, and calculations where their semantics match. Add only missing attachment kinds.
- Do not copy the current selected-glyph `max/min/first/last/at` model and call it stable record identity.
- Keep artboard positioning in composition. Keep ordinary chart annotations in their chart settings. Share behavior without requiring a new universal document store.
- Verify facet reorder/removal, chart field changes, and restoration of an existing saved composition. State unsupported combinations in the editor's available choices.

### Desired end state

- Annotation meaning and editing behavior match across supported chart families.
- Existing composition notes and guides continue to resolve and save correctly.
- Aggregate, record, and facet identities remain distinct.

## Milestone 5: Annotated graphics remain useful when saved and shared

Complete persistence coverage, output integration, label readability, and keyboard operation across the supported scope.

- Confirm full-analysis save/restore, host state echoes, saved views, and duplication preserve annotation IDs and attachments.
- Update `lib/dsl/settingKeys.ts`, `compile.ts`, and `export.ts` together where annotations are supported. If a form cannot round-trip through dashboard text, report that limit instead of silently discarding it.
- Integrate annotations with the output surface owned by [analysis export](../analysis-export/intent-brief.md). Reuse `compositionOutput.ts` for composition PNG proof. This milestone does not create a separate PDF or slide exporter.
- Include authored annotation geometry and text, but omit editing controls. If ordinary-chart image export is still unavailable, retain an explicit open dependency; do not claim complete sharing support.
- Check labels at plot edges, dense marks, theme changes, and export size. Keep manual offsets; automatic placement remains an evaluation candidate.
- Verify create, select, edit, hide, repair, remove, cancel, undo, and focus return with keyboard and form controls.

### Desired end state

- Saved and copied graphics preserve the user's explanation.
- Output contains no handles or editor overlays.
- Ordinary-chart export dependencies are resolved before this milestone is marked complete.

## Cross-cutting verification

Use a few behavioral tests for attachment resolution, saved-state round trips, and edit transactions. Add focused renderer checks only for a new projection or interaction boundary.

Verify changed flows at 1280, 783, and 390 pixels. At widths without supported chart authoring, verify the supported small-screen response. Do not treat those checks as a promise of full mobile authoring.

Run `pnpm check:ui` for UI changes. Run `pnpm check` once before a PR, following repository rules. Include screenshots for visible changes. This planning update does not run or claim runtime acceptance.

## Open decisions and spikes

1. **Key selection:** Prove a unique single or composite field key without changing internal row IDs. Reject ambiguous keys. Keep fixed-coordinate authoring available as an explicit choice.
2. **Composition reuse:** Test the first callout against composition's current model. Extract helpers only when semantics match; keep small host-specific projection functions otherwise.
3. **Output dependency:** Check the analysis-export initiative at implementation time. Use its real image surface; keep the sharing milestone open if it is absent.

## Below the cut line

- Freehand and images remain evaluation candidates, not prerequisites for the core authoring flow.
- Automatic layout, advanced snapping, presets, and bulk event import need an authoring case before implementation.
- Collaboration, standalone annotation storage, a cross-library adapter framework, and general schema migrations are excluded from this plan.
- Polar, geographic, and 3D projections; cross-chart links; new statistical inference methods; and new document export formats remain later work.
