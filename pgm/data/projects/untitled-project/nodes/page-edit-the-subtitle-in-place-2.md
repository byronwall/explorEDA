---
id: page-edit-the-subtitle-in-place-2
label: Edit the subtitle in place
type: page
status: planned
priority: high
parent: page-in-place-chart-editing
metadata:
  purpose: "Small, self-contained task: in-place subtitle editing, the last step before retiring in-place editing."
---
Edit a chart's subtitle where it is drawn, the same way the title edits in place. This is the last item before the in-place editing initiative can retire. The editorial themes (#192–#202) shipped the `subtitle` setting, so nothing blocks it.

## Behavior

- Double-click, Enter, or F2 on the subtitle opens an inline field in its place. Its context menu offers **Edit subtitle** and **Remove subtitle**.
- A chart with no subtitle gets **Add subtitle** in the title's context menu. It opens the same field on the subtitle line.
- The chart updates as the user types. Committing reaches `onStateChange` once, as one undo step. Escape restores the old text.
- A blank commit removes the subtitle (`subtitle: undefined`, as the Labels tab saves it).
- Alt-click and Alt-Enter keep their tracing meaning and never open the editor.

## Where it lives

- Rendered in `components/PlotChartPanel.tsx` as `<p className="eda-panel-subtitle drag-handle">`, only when `settings.subtitle?.trim()` is set. In headline themes it sits in the `subtitle` grid area (`.eda-panel[data-headline="block"]`, `index.css`).
- Add a `useSubtitleEditing` hook beside `components/charts/InPlace/useTitleEditing.tsx`, or generalize that hook to a text key. Reuse `InlineTextEditor` and `useChartEdit` for live updates and one undo step.
- The subtitle is a drag handle, so `dblclick` never arrives. Open on `mousedown` with `event.detail === 2` and stop the press, as the title does. Mark the input `data-inplace-editor` so the grid's `draggableCancel` skips it. See the drag-handle trap in `docs/agent-guide.md`.
- While the title edits, `data-title-editing` hides header children except the heading, subtitle, and status (`index.css`, around line 241). Give the subtitle editor its own marker so an active filter control (`.eda-chart-filter`) and table search stay visible.

## Done when

- Tests next to `titleEditing.test.tsx` cover open (double press, Enter, F2, menu), live update, commit as one `onStateChange`, Escape, blank removal, Add subtitle from the title menu, and Alt-click passing through.
- Browser check with real mouse input in Compact, Newsprint, and Report, in light and dark, at 1280, 783, and 390 px, including chart details. An active filter stays visible while editing.
- `docs/application-feature-inventory.md` ("Settings and field actions") lists the subtitle with the title and axis title. The DSL already round-trips `subtitle`.
- Changeset: `minor`, "Edit a chart's subtitle in place."

