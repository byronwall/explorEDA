# Seven ways to bring chart configuration closer

These alternatives differ in how the user finds and owns an edit. Each preserves immediate ordinary click-to-filter.

## Option 1 — Open the full editor at the right setting

**Core move:** Keep one settings editor. A chart object opens the exact section or control that owns it. An axis offers field and range settings; a legend offers color settings.

**Makes easier:** Finding an existing control without building many small editors. Complex work keeps its full context and current behavior.

**Main catch:** The panel still takes space and interrupts the view. It reduces searching more than movement. The route needs a visible fallback when the relevant object does not exist yet.

**Best fit:** The smallest useful change, and the permanent fallback for settings with many dependencies.

## Option 2 — Name actions in object menus

**Core move:** Right-click a meaningful object to see a short list of verbs. “Color by…” opens field search directly. Separate chart actions from record actions and export.

**Makes easier:** Discovering relevant operations at the point of attention. Many settings can have local access without permanent controls.

**Main catch:** Hidden menus need visible and keyboard entry points. A menu can take as many clicks as settings. Overlapping marks also make record targeting harder.

**Best fit:** Contextual actions with clear scope. Use menus to choose a task, then use a small editor to complete it.

## Option 3 — Make encodings visible and editable

**Core move:** Show compact role labels such as Color: Region or Size: None. Activate the label to replace the field. Reuse axis and legend titles where they already identify a role.

**Makes easier:** Seeing the chart’s current meaning and changing it in two activations. A missing legend no longer hides the Color route. Keyboard and touch discovery improve.

**Main catch:** Every permanent control spends chart space. Showing every role could create another settings bar. Reveal rules must not make controls available only on hover.

**Best fit:** A small set of settings that analysts repeatedly change. Color alone is the strongest simple comparator.

## Option 4 — Manipulate the chart itself

**Core move:** Let geometry and labels act as controls. Edit a title where it appears. Drag a numeric axis range. Replace a field at its axis label, with an explicit picker as the non-drag route.

**Makes easier:** Changes whose visual meaning is direct and stable. The chart supplies the context and immediate feedback.

**Main catch:** Marks already filter and plots already brush. A gesture that looks natural can silently change meaning or conflict with dragging. New field swaps need rules for limits and annotations.

**Best fit:** Extending proven title and axis behavior. Avoid assigning ordinary mark clicks to configuration.

## Option 5 — Open a compact object toolbar

**Core move:** A deliberate Configure action opens a small toolbar near an object. It shows a few related controls together: point size, opacity, display mode, and fit options, for example.

**Makes easier:** Repeated adjustment across related settings without reopening a menu. The toolbar can show current values and ownership together.

**Main catch:** Entry must not consume a filtering click. A floating toolbar can cover data, lose its target, or become a miniature settings panel. Small screens need another placement.

**Best fit:** A later proof for repeated visual adjustment after field binding works well.

## Option 6 — Search chart commands from the keyboard

**Core move:** Focus a chart and open a command search. Type a task such as “color,” “bins,” or “sort.” The command opens the same focused editor used by pointer controls.

**Makes easier:** Expert access across many settings, without remembering a separate shortcut for each. Search can bridge unfamiliar labels through a small synonym set.

**Main catch:** A command vocabulary and focus model create additional work. Discovery still needs visible controls. Search is excessive when two or three stable actions cover the task.

**Best fit:** A later expert route if real sessions show broad repeated use across many chart controls.

## Option 7 — Enter a temporary configuration mode

**Core move:** Explicitly switch from exploration to editing. Click chart objects to configure them. A clear exit restores filtering. A narrower version arms one action, such as adding a range annotation.

**Makes easier:** Rich object selection without many modifier rules. It can support authoring tasks that need several related edits.

**Main catch:** Mode errors threaten the user’s strongest requirement. The same click filters in one state and edits in another. A persistent mode also makes resuming analysis less direct.

**Best fit:** Possibly one-shot annotation placement. Reject a universal mode as the default exploration model.

## Current lean

Start with Option 3 and compare adding Option 2. Keep existing Option 4 interactions and Option 1 for complex work. Test Alt/Option-click as an accelerator into the same editor, with tracing still reachable. Option 5 may suit later visual tuning. Defer Option 6 and keep Option 7 out of normal exploration.

The [shape](shape-brief.md) defines the first proof. The [research review](references/research-review.md) links the wider catalog and explains which competitor mechanics transfer.
