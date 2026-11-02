/**
 * Narrow analytical reading — TYPE-ONLY DESIGN SKETCH, not shipped code.
 * Baseline: d3920a285f3755a8324998775deb131747e959f5.
 *
 * These additive types describe proposed seams. There are no reducers,
 * renderers, persistence operations, or feature implementations in this file.
 * Existing React/TypeScript components, provider, filters, and traces remain
 * authoritative. Names are proposals for Codex to reconcile with the checkout.
 */

export type ReaderPresentation = "workspace" | "reader";
export type NotebookPresentation = "notebook" | "reader";

/** Add to ExplorEdaProps; workspace remains the default. */
export type ExplorEdaReadingProps = {
  presentation?: ReaderPresentation;
};

/**
 * Add to ExplorEdaNotebookProps. Omission keeps existing notebook behavior;
 * notebook means the existing notebook presentation.
 * sheet/defaultSheet/onSheetChange retain their current independent contract.
 * In reader presentation, chart selections may call existing onStateChange,
 * but MUST NOT be written into notebook text through onTextChange.
 */
export type ExplorEdaNotebookReadingProps = {
  presentation?: NotebookPresentation;
};

/**
 * Internal panel policy, passed as a value prop through GridChartPanel.
 * Existing readOnly=true takes precedence and maps to locked (inert).
 * workspace + !readOnly -> edit; reader + !readOnly -> read.
 * read permits selection, clear/reset, trace, and record exploration.
 * read forbids layout, title, axis, field, formula, source, and settings edits.
 * Gate event handlers, keyboard shortcuts, context menus, and editable legend
 * actions as well as visible buttons. Do not use readOnly for interactive read.
 */
export type PanelInteractionMode = "edit" | "read" | "locked";

/** Optional property proposed for SavedDataStructure. No saved result values. */
export type SavedReadingExtension = {
  reading?: SavedReadingV1;
};

export type SavedReadingV1 = {
  version: 1;
  groups: SavedReadingGroup[];
};

export type SavedReadingGroup = {
  id: string;
  title?: string;
  chartIds: string[];
};

/**
 * No new prose format: existing Markdown charts can be group members;
 * notebook prose and its finding definitions remain in notebook source.
 * Existing chart settings own title, subtitle, and source note.
 *
 * Proposed import rules:
 * - Absent reading: valid legacy save; no migration write on mount.
 * - Present reading: validate version=1, structural field types, nonempty IDs,
 *   and unique group IDs. Repeated chart references are handled below.
 * - Malformed/unsupported version: reject at the existing parse boundary.
 *   Do not claim invalid optional metadata currently survives validation.
 * - References to deleted charts and duplicate chart references are semantic
 *   resolver diagnostics, not corrupt JSON. First duplicate occurrence wins.
 * - Append every unreferenced live chart in saved y/x/original-index order.
 * - Keep missing referenced-chart positions as unavailable evidence slots.
 * - Never rewrite chart rectangles when resolving groups or resizing.
 *
 * Implementation must add reading to provider init, reset, save and restore;
 * saveToStructure explicitly lists properties and would otherwise drop it.
 * New-field round trips must preserve the saved fingerprint's stable shape.
 * Older packages can discard reading on save; no downgrade guarantee implied.
 */
export type ReaderOrderIssue =
  | { kind: "missing-chart"; groupId: string; chartId: string }
  | { kind: "duplicate-chart"; groupId: string; chartId: string };

/** Runtime result only; not a second persisted analysis model. */
export type ResolvedReaderGroup = {
  id: string;
  title?: string;
  items: Array<
    | { kind: "chart"; chartId: string }
    | { kind: "unavailable-chart"; chartId: string }
  >;
};

/** A missing count is never rendered as zero. Values count source records. */
export type ReaderRecordCount =
  | { state: "known"; value: number }
  | {
      state: "unavailable";
      reason: "scope-not-exposed";
    };

/** Labels and counts come from definitions/provider/plans, never chart pixels. */
export type ReaderChartScope = {
  chartId: string;
  revision: string;
  selectionMode: "linked-workspace" | "local-notebook";
  totalSourceRecords: ReaderRecordCount;
  eligibleRecords: ReaderRecordCount;
  selectedRecords: ReaderRecordCount;
  workspaceFilterLabels: string[];
  otherChartFilterLabels: string[];
  chartPopulationLabels: string[];
  chartSelectionLabels: string[];
};

/**
 * Scope derivation constraint:
 * Linked dashboard E_c = positive liveItems for c (own dimension ignored,
 * other dimensions applied, then c's local population already restricted).
 * S_c = E_c intersect the chart definition's getFilterFunction(c).
 * getChartFilteredRowIds applies ALL filters, including c's own selection;
 * it therefore cannot supply this E_c in a linked dashboard.
 * In a localSelections notebook, eligible excludes other chart selections.
 * A finding without chart reads all source records, then its own filters;
 * it does not inherit workspace filters. Keep this distinction visible.
 */
export type ReaderFindingScope = {
  findingId: string;
  revision: string;
  ownerChartId?: string;
  basis: "all-source" | "chart-eligible" | "chart-selected";
  findingFilterLabels: string[];
  inputRecords: ReaderRecordCount;
  /** Optional: only when the existing plan exposes this meaning. */
  numericContributors?: {
    included: number;
    excluded: number;
  };
};

/**
 * Numeric contributor counts are not universal row-count replacements.
 * MetricCardPlan.rowCount can count entities when entityField is present.
 * Do not relabel entities as source records or count duplicates as omissions.
 * Comparison evidence displays each operand's own scope and records.
 */
export type ReaderUnavailableFinding =
  | "empty"
  | "invalid"
  | "missing"
  | "nonfinite"
  | "outside";

/** Transient reference to an EXISTING trace source; never saved row IDs. */
export type ReaderEvidenceTarget =
  | {
      kind: "chart-object";
      chartId: string;
      owner: string;
      objectKind: string;
      objectId: string;
      revision: string;
    }
  | { kind: "finding"; findingId: string; revision: string };

/** Keep in component refs; never put DOM objects or offsets in savedData. */
export type ReaderReturnPoint = {
  invoker: HTMLElement | null;
  chartId?: string;
  groupId?: string;
  sheetId?: string;
  scrollRoot: Window | HTMLElement;
  scrollTop: number;
  scrollLeft: number;
};

export type ReaderEvidenceCloseReason =
  | "dismissed"
  | "selection-changed"
  | "data-changed"
  | "sheet-changed"
  | "source-unavailable";

/**
 * Optional later host integration; ordinary reading needs no new callback.
 * No raw rows or saved filters here. Existing onStateChange handles analytical
 * selection changes; the host elects whether a reader session is persisted.
 * Focus/scroll/open/close/resize must not call onStateChange by themselves.
 */
export type ReaderNavigationExtension = {
  onReaderNavigate?: (location: {
    groupId?: string;
    chartId?: string;
  }) => void;
};

/**
 * Reuse PlotChartPanel's expanded ? dialog(panel) : panel architecture under
 * one ChartTraceScope. Resolve ReaderEvidenceTarget through that same source.
 * No duplicate chart renderer and no hidden second panel. On revision change,
 * close evidence, announce why, and restore focus to a connected invoker or
 * chart/group/sheet fallback. Restore the actual scroll root before focusing
 * with preventScroll. Existing notebook sheet props govern sheet navigation.
 * On sheet-changed, keep outgoing offsets only for a later revisit; focus the
 * new active tab/heading and never scroll the host back to the old sheet.
 * Host loading/query errors remain host-owned: data=[] means a valid empty
 * supplied source, not an inferred fetch failure.
 */
