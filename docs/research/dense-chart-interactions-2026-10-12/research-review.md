# Research review and integration

Reviewed October 12–13, 2026. The [shape](https://github.com/byronwall/explorEDA/blob/34c957c4/docs/intent/dense-chart-interactions/shape-brief.md) is the main review surface. This file holds supporting detail.

## What the research supports

Use visible encoding controls for repeated changes. Add shallow object menus where they improve locality or discovery. Open the same focused editor from each entry. Keep immediate click-to-filter and existing direct title/axis editing.

This is an inference from documented mechanics and repository constraints. Neither Pro nor Codex performed hands-on competitor testing. No study establishes which product is “best,” or how often explorEDA users change each setting.

The full research contains [165 settings rows](pro/settings-inventory.csv), [43 patterns](pro/interaction-catalog.md), and [44 gesture entries](pro/gesture-map.csv). The inventory includes settings, actions, and state families; it is not 165 independent UI controls. It covers 23 registered chart families with explicit gaps. Read [Pro’s report](pro/report.md) for the full comparison and worked Color case.

## Verified competitor mechanics

Codex reopened these primary sources on October 13, 2026. The table separates documented behavior from our proposed transfer. Vendor pages establish mechanics, not measured usability. Older or rolling documentation does not certify a tested application binary.

| Tool and context | Documented mechanic | Proposed transfer and limit |
| --- | --- | --- |
| [Power BI Desktop, on-object preview](https://learn.microsoft.com/en-us/power-bi/create-reports/power-bi-on-object-interaction) | Double-click or right-click Format enters formatting mode. Subselection opens object controls; overlapping targets can be corrected. | Borrow explicit target scope. Do not copy the mode into normal exploration. The page lists small-multiple, mobile, and accessibility limits. |
| [Tableau Desktop and web authoring](https://help.tableau.com/current/pro/desktop/en-us/viewparts_marks_markproperties_color.htm) | Assign fields through Marks Color. The legend’s upper-right action opens color editing, with Desktop/web differences. | Use encoding labels as edit targets. Distinguish field assignment from palette editing. This is authoring, not linked viewer filtering. |
| [Qlik Sense May 2026](https://help.qlik.com/en-US/sense/May2026/Subsystems/Hub/Content/Sense_Hub/UserInterface/visual-exploration-menu.htm) | Header access or right-click opens an Exploration menu for data, sort, colors, and labels without making selections. Changes are session-local unless eligible users apply them. | Strong precedent for configuration during analysis. Do not import another temporary persistence model. Alternative dimensions must already be supplied. |
| [JMP 19 Graph Builder](https://www.jmp.com/support/help/en/19.0/jmp/move-or-remove-variables-in-zones.shtml) | Drag variables between visible zones. A variable’s context menu can swap or remove it. | Treat field roles as visible objects. Defer generic swapping until limits and annotations have a defined policy. Documentation published July 2025. |
| [Origin mini toolbars](https://docs.originlab.com/origin-help/mini-toolbar/) | Compact plot controls expose appearance, fits, and other actions. Group and Single tabs distinguish affected plots. | Consider a deliberate toolbar for repeated tuning. Preserve visible scope. Ordinary mark selection cannot become toolbar entry in explorEDA. |
| [Excel chart formatting](https://support.microsoft.com/en-au/office/format-elements-of-a-chart) | Right-click an element and choose Format. The pane shows relevant options and follows a newly selected element. | A focused full editor is a useful minimal alternative. It reduces searching, but still occupies panel space. |
| [Grafana legend configuration, latest page](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/configure-legend/) | Clicking a color bar opens a picker. Clicking a series label isolates it. Saved dashboard changes persist for viewers. | The legend is useful control space. Keep explorEDA category chips filtering; give palette editing a separate route. Series isolation differs from row filtering. |
| [Datawrapper scatter Annotate](https://www.datawrapper.de/academy/customizing-your-scatter-plot-annotate) | Select labels from a dropdown or chart. Add range highlight explicitly, then drag its extent. | Borrow one-shot annotation intent. Do not take over ordinary point clicks or brushing. This is authoring documentation last updated May 2021. |

The transfer pattern is object → named operation → scoped editor. Permanent controls show current meaning; menus expose secondary operations. A mode or modifier can shorten an expert route, but it also changes what a click means.

## Which settings deserve shorter routes

All rankings below are **frequency hypotheses**, conditional on the stated task. Confidence is low until actual sessions test them. “High” means likely repeated changes within that task, not a large share of all application sessions.

| Setting family | Hypothesized change frequency | Best local candidate | Scope or constraint |
| --- | --- | --- | --- |
| X/Y, category, or measure field | High while comparing variables | Editable axis/role label; Change field menu | This chart; decide retained limits and notes |
| Color field | High while separating groups | Color label, legend-title action, point/plot menu | All marks and facets in this chart |
| Size field | Medium; high in multivariable comparison | Size label or bubble legend action | Encoding and truthful area scale |
| Aggregation and measure operation | High while changing the analytical question | Measure label → compact expression choices | Changes computation, not just appearance |
| Bins and time grain | Medium; high during distribution/time analysis | Axis or distribution menu → direct value control | Changes grouping and may affect selection meaning |
| Sort, direction, Top N | High while comparing categories | Category label/menu; table header where supported | Name omitted values and sort basis |
| Split, stack, normalize | Medium while comparing composition | One compact grouped choice | Show how totals and comparisons change |
| Facet fields and order | Medium while comparing groups | Facet header or chart role control | Chart-wide template; all panels |
| Point size and opacity | Medium; high when resolving dense clouds | Deliberate compact toolbar | Appearance; preserve encoding and filtering |
| Points/density/surface display, fit options | Medium in specialized analysis | Plot menu → focused existing controls | Some choices change analytical meaning |
| Axis bounds and transforms | Medium; high during scale investigation | Keep range editing and ruler drag; scale menu later | Visible hidden-row/log remedies |
| Shared palette, domain, category colors | Low in exploration; higher in presentation work | Separate legend title/swatch context action | Shared scale; disclose other consumers |
| Titles, labels, annotations | Low in exploration; higher while explaining results | Existing inline title edit; explicit note action | Record, chart, or one-panel scope must be clear |
| Typography, margins, layout, detailed specialty options | Low in ordinary exploration | Focus the full settings editor | Avoid filling every context menu |

Filter actions are frequent, but are not configuration shortcuts. Keep them primary. Trace frequency is unknown; the user permits changing its entry. Do not treat export or inspection usage as proof of chart-setting demand.

## Candidate interaction vocabulary

The catalog retains breadth beyond the first proof:

- **Marks and plot:** Color by, Size by, display mode, opacity, fit, and explicit record trace. Resolve record ambiguity only when identity matters.
- **Axis and value labels:** Change field, aggregation, bounds, transform, bins, time grain, sort, and Top N.
- **Legend:** Change encoding from the title; edit a shared palette through a separate action. Keep category-chip clicks filtering.
- **Facets:** Change the chart-wide facet template or order. Keep one-panel annotations distinct from independent facet encodings.
- **Notes:** Add record note, reference line, or one-shot range highlight. Preserve plain brush drag.
- **Specialties:** Keep table header/cell actions, map navigation, and Composition hierarchy. Investigate pivot headers, calendar navigation, profile axes, and matrix rules separately.
- **Alternative entries:** Visible role controls, object menus, focused settings, compact toolbars, keyboard command search, and optional Alt configuration.

## Color proof and gesture decisions

Use the same state change through each candidate entry. With the Data tab already active, settings → Color selector → field takes three activations. Right-click → Color by → field also takes three. A visible Color control → field takes two. Alt-click → field takes two plus a modifier. These are structural counts, not measured completion times; search and closing costs vary.

The first shape proposed comparing existing settings, visible Color alone, visible Color plus menu, and an Alt variant. Byron’s [product answers](./product-answers-2026-10-12.md) replace that comparison with one design adjusted through use: visible role labels plus a context menu, instant apply, and one-step undo. Trace is rare and moves to the header and a record action, so Alt no longer protects a frequent workflow. Do not require a six-person study or a five-of-six success threshold to start a personal-project proof. Pro’s [larger study and test run sheet](pro/proof-plan.md) remains available when useful.

Keep ordinary click and drag immediate. Do not configure selectable marks on double-click. A dismissal press must not pass through as a filter action. Search, pointer hover, and keyboard highlighting must not commit values. Escape closes the inner editor, then returns focus.

For the Alt experiment, provide trace through a separate This record action and the header target browser. Cancel Alt-drag rather than creating an accidental edit; ordinary drag keeps brushing. Verify this deliberate loss of any previous Alt-brush behavior. An eventual release must reconcile Alt/Alt-Enter across supported targets and help. The experiment is not permission to ship mixed undocumented meanings.

Keep keyboard menu entry distinct from pointer Shift-right-click. The current browser-menu bypass must run before object delegation. [MDN documents Firefox’s Shift-right-click exception](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event); it does not establish identical browser behavior everywhere. [macOS Control-click is intercepted for context menus](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/ctrlKey). Test supported platforms instead of assuming Ctrl means the same as Command.

Use standard [menu-button keyboard behavior](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and a [combobox with explicit acceptance and cancellation](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). These patterns guide implementation; they do not prove accessibility. Verify the actual popup, focus return, nested dialog, and assistive-technology behavior when implementation starts.

## Independent repository checks

Baseline: `c534378c052c9fbb2cb076d1df0d21eb0fa0965e`. Current application code matches that baseline. Exact source hashes and supplemental Git blob IDs are checked in [evidence-checks.json](evidence-checks.json). These are static observations, separate from the repository test suite.

| Finding | Verified source | Consequence |
| --- | --- | --- |
| Color field selection can reuse or create a scale. | `hooks/useColorScales.ts`, `getOrCreateScaleForField` | Hold notifications before scale creation and binding. Exclude shared palette preview from the first proof. |
| The existing color control already discloses shared use. | `components/colorScales/ColorScaleControl.tsx` | Reuse this ownership model; do not claim the disclosure is missing. |
| Chart edit cancellation restores owned chart keys, not the whole workspace or shared scale state. | `charts/InPlace/useChartEdit.ts` | Do not claim it supplies a generic shared-state transaction or rollback. |
| FieldSelector supplies field metadata; ComboBox owns its open state and portal placement. | `components/FieldSelector.tsx`, `components/ComboBox.tsx` | Add the smallest presentation seam for directly opened search and dialog placement. Verify duplicate display labels through stable field IDs. |
| The panel calls axis context handling before its Shift check. | `components/PlotChartPanel.tsx`, `onPanelContextMenu` | Include early native-menu bypass in future event proof. Preserve existing specialized handlers. |
| Unsized scatter can bypass ordinary point selection. | `charts/ScatterPlot/ScatterSvg.tsx`, `onPlotClick` and click handler; `ScatterPlot.tsx`, `onSelectPoint`; `hooks/useBrush.tsx` | Treat this as a static concern. Reproduce with real input before adopting new gestures. This research does not fix or certify it. |
| `updateChart` remains the chart write path; notification holds are counters with an explicit release. | `providers/DataLayerProvider.tsx`, `updateChart`, `holdStateChanges` | Reuse the write path and release the hold reliably. A single host checkpoint is a proof target, not a claim of built-in global undo. |

Paths in the table are relative to `packages/explorEDA/src/`. The [source manifest](pro/source-manifest.json) and [source records](pro/sources.json) contain exact baseline links.

## Recommendation dispositions

“Adopt” means include in the proposed design. It does not mean implemented or approved. [Reconciliation JSON](reconciliation.json) maps all 18 recommendations, all 43 patterns, and every inventory/gesture row to the integrated direction.

| Recommendation | Disposition | Integration |
| --- | --- | --- |
| DCI-01: filtering contract | Adopt | Intent and first-proof gate; investigate the static scatter concern. |
| DCI-02: event and menu ownership | Adopt | Shape requirement; no “fix now” code work in this run. |
| DCI-03: Color controls and menu | Adopt | First proof, with a visible-only comparator. |
| DCI-04: Alt configuration | Investigate | Conditional experiment; trace must remain findable. |
| DCI-05: accepted change boundary | Adopt | Reuse notification hold and explicit acceptance; avoid a general transaction framework. |
| DCI-06: title/axis local editing | Adopt | Preserve existing routes; investigate field replacement policy later. |
| DCI-07: shared colors | Investigate | Reuse existing disclosure; defer shared palette mutation beyond Color binding. |
| DCI-08: analytical controls | Adopt | Candidate queue; sequence by observed task frequency, not raw High labels. |
| DCI-09: facets | Adopt | Explicit all-panels ownership; later local entry. |
| DCI-10: keyboard field search | Adopt | First-proof requirement, with stable field identity. |
| DCI-11: placement and focus | Adopt | First-proof requirement; narrow robustness without a mobile-authoring promise. |
| DCI-12: table/pivot actions | Adopt | Keep existing table routes; defer new pivot shortcuts. |
| DCI-13: annotation actions | Investigate | Later explicit task; no ordinary brush takeover. |
| DCI-14: specialty controls | Defer | Keep current routes; validate each specialty before new access. |
| DCI-15: harmful broad patterns | Adopt | Reject universal default edit mode, giant settings menus, arbitrary point paint, and filter delays. |
| DCI-16: simplest comparator | Adopt | Visible Color alone can win. No assumed menu advantage. |
| DCI-17: swap/conversion | Defer | Resolve limits, filters, annotations, and defaults before adding commands. |
| DCI-18: appearance/display/fits | Investigate | Later task-specific compact controls. |

## Corrections and limits retained

The report and inventory use different frequency labels for some size, bin, time, split, and facet settings. The table above resolves this as task dependence. None becomes measured demand. Broad trace applicability in inventory row S148 does not establish complete trace support across every family. Row S149 is not a universal high-frequency configuration claim.

Calendar year is classified Keep in S082 and Explore in pattern P37. Treat new calendar access as deferred until its existing UI is verified. Similar specialty claims remain candidates, not promises. No material gap prevents the requested shaping, so no Pro follow-up was needed.

The raw proposed briefs remain unchanged for provenance. The integrated documents reduce study requirements, keep Alt conditional, and separate current source facts from desired behavior. The source packet is selected evidence, not a runnable source archive. External research has no hands-on timing, accessibility, or usability proof.

The [collection manifest](pro/collection-manifest.json) records retrieval, sizes, hashes, and matching companion downloads. The archive is safe and complete. Repository checks are recorded in [run.md](https://github.com/byronwall/explorEDA/blob/34c957c4/docs/intent/dense-chart-interactions/run.md); they do not validate the proposed interactions, which are not implemented.
