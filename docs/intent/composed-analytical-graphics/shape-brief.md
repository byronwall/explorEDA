---
title: "Composed analytical graphics — shape brief"
slug: "composed-analytical-graphics"
phase: shape
status: current
last_updated: "2026-09-29"
---

# Composed analytical graphics — shape brief

## Recommendation

Build a composition editor with a blank artboard, selectable primitives, a template inspector, and separate editing and viewing modes. Its purpose is to create polished graphics for reports and presentations. The editor must prove that users can build the graphic themselves.

Start with text, frames, scales, rectangle and circle mark definitions, and annotation lines. A mark definition draws from a selected data subset and references named scales. The author builds one chart unit, then repeats it using a grouping or comparison rule. Support automatic row, column, and grid arrangements. Let authors position the repeated group and other groups on the artboard.

Use common scales by default wherever possible. Save individual visual overrides separately from the shared template. Resolve the template, subset inputs, and override into each rendered unit. The inspector should explain those inputs and distinguish a template edit from an instance edit.

Use the email-strip structure as the first full proof. Add a small comparison or grid check for the first release.

Then extend the editor through five [reference compositions](reference-study.md): ordered paths, interval bands, paired cohort summaries, normalized stacks, and compound frames. Each stage adds one reusable capability. The [implementation plan](implementation-plan.md) states their order and completion gates.

## Problem and appetite

- **Problem:** The workspace cannot author a polished graphic from primitives, repeated units, and individual refinements.
- **Outcome:** A user starts blank, builds one coherent graphic, refines it, saves it, and prepares it for a report.
- **Appetite:** One complete authoring and output flow, followed by a small layout check. Five further compositions define staged extensions.
- **Below the first proof:** Arbitrary nested repeats, a broad mark catalogue, and automated graphic design.
- **Outside this initiative:** Recurring reports and parameterized dashboards, which belong to a separate project.

Rows are the first proof case. Comparison and facet grids belong to the intended capability. Group placement and individual overrides must be present in the first useful editor.

## Core shape

The artboard contains text elements, chart frames or scale elements, mark definitions, annotation elements, and groups. The exact relationship between frames and scales remains provisional. Scales must have clear owners and references so authors can understand what positions each mark. Repeated charts share data domains by default where possible, mapped into each frame. Individual scale changes are not part of the initial visual override feature.

A chart unit contains elements and their bindings. A repeat rule supplies a subset to each instance and chooses its arrangement. The inspector shows the grouping or comparison rule, source fields, filters, calculations, and scale references. It also identifies the selected instance and its overrides.

Generated glyphs follow their mark definition. Selecting a generated glyph during editing should reveal the governing element and relevant instance. The author should not have to edit thousands of glyphs individually. A manual annotation can be a separate element.

An instance override records a change to a particular repeated unit. As a provisional rule, associate it with the subset identity rather than its current screen position. Reordering should therefore keep the override attached to the same unit. Start with position and visual properties such as color, text style, and mark size. Preserve the template’s data bindings and calculations when applying these overrides.

## Calculations and filters

Create calculations within the authoring flow after the user chooses the relevant subset or aggregation. A calculated annotation references that result and the scale or anchor that places it.

Treat population and filter policy as separate choices. The population can be the current repeated subset or the whole composition. The filter policy can follow active filters or ignore them. These choices let a group average update while a source-wide limit stays fixed. Fixed constants also remain available for thresholds.

The inspector must show the rows and calculation that actually produced the result. It must also explain why an input ignores filters. Changing filters should update applicable marks and values without losing saved placement or instance overrides.

## Editing, viewing, and output

Editing mode selects elements and groups for refinement and movement. Viewing mode provides interactive data inspection or drilldown. Alt-click for full tracing is a candidate shortcut. Provide a visible tracing action and keyboard access; the shortcut cannot be the only path.

Automatic layout places repeated units consistently. Authors can position the group as a whole and nudge individual instances. Manual annotations and text also need placement controls. Support three explicit anchor choices: a data value or mark, a chart frame, and a fixed page position. Data-bound annotations follow their target as it moves. Store an optional visual offset separately from the anchor, so a nudge preserves the data relationship. Frame-bound annotations move with their frame; page-bound annotations retain their page position.

Save the definition, calculations, repeat rules, group placement, and overrides through one composition save path. Render report output from the same resolved composition used for viewing. Provide a Copy to clipboard action that writes a PNG of the finished graphic. Exclude editing controls and selection handles from the output. Clipboard failure should be visible and leave the composition intact. SVG, PDF, and editable PPTX export are deferred.

## Current fit

- **Reuse:** Existing data preparation, filtering, calculation results, facet grouping rules, and trace inspection where their contracts fit.
- **Add:** Blank composition authoring, primitive selection, repeated templates, instance overrides, group placement, mode controls, and output preparation.
- **Repository fit:** Registry, save validation, data providers, facet layout, and trace panels provide the integration seams described in the plan.

The old `data-and-glyphs` reproduction demonstrates the visual pattern. It does not establish that its compiler or authoring interface should be adopted.

## How to make this go better

- **Test authoring from blank.** A hand-written completed specification can prove rendering, but cannot prove the requested user experience.
- **Keep definitions and instances visible.** Show whether an edit affects every repeat or one selected unit. This prevents accidental broad changes.
- **Separate scope from filtering.** Show both choices for calculated annotations to avoid misleading global values.
- **Place groups before expanding precision tools.** Prove whole-group movement and saved nudges with automatic repeat layout.
- **Check output early.** Compare the exported graphic with the viewing surface before investing in further primitives.

## First proof

- **Question:** Can a user author and finish a repeated graphic from blank while keeping its data and exceptions understandable?
- **Proof:** Build an email-style graphic from trusted sample data with about 10,000 rows, 10–15 units, and 1,000–2,000 glyphs.
- **Observe:** Create title and subtitle elements, scales, a chart template, and a repeat rule. Add an ad hoc count, a filter-independent guide, one instance override, and a group placement change. Switch to viewing and inspect a generated mark. Save, reload, and copy the finished PNG to the clipboard. Paste it into a report or slide and inspect the result.
- **Pass / fail:** The author can complete the flow through visible controls. Reload and output preserve the intended composition. Inspection identifies the correct rows, scope, and override. Record redraw and interaction time at the representative size. Include common scales and a data-bound annotation that follows a moving point. Check frame and page anchors in a smaller placement example.
- **Second check:** Arrange a small repeated template as comparison panels or a grid without changing its mark-generation model.
- **Deliberately excludes:** Official email-data parity, every advanced chart, and unrestricted nested layout.

## Rabbit holes and no-gos

- Do not substitute a preset reproduction for the blank-page authoring proof.
- Do not copy the whole definition for every instance to implement overrides.
- Do not let reordering attach a saved nudge to a different data subset.
- Do not infer lineage from pixels or fabricated annotation rows.
- Do not add editable PPTX export or recurring-report parameterization to this scope.

## Plan handoff

Follow the [implementation plan](implementation-plan.md). Finish blank authoring through save, viewing, tracing, and PNG output first. Then add ordered paths, interval bands, paired summaries, normalization, and coordinated frames. Confirm the proposed frame/scale controls in the first proof.

Store reference images and available data in [references](references/README.md). Record source, retrieval date, and data status. Missing source data must not become an unlabeled reconstruction.
