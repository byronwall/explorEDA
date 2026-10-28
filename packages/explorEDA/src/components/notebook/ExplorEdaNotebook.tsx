import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Check, CircleAlert, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { DeclaredFieldType } from "@/lib/declaredFieldTypes";
import {
  compileNotebook,
  notebookSheets,
  withoutHeading,
  writeBackSettings,
  type NotebookBlockResult,
  type NotebookCompileResult,
  type NotebookSegment,
  type NotebookSheet,
} from "@/lib/notebook";
import { resolveThemeId } from "@/lib/themes";
import {
  DataLayerProvider,
  useDataLayer,
  type DatumObject,
} from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { restrictToPopulation } from "@/lib/chartPopulation";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { CalculationEditorProvider } from "../calculations/CalculationEditor";
import { GlobalAlertDialog } from "../GlobalAlertDialog";
import { ChartDraftProvider } from "../plot/ChartDraftContext";
import {
  FACET_GAP,
  FACET_MIN_HEIGHT,
  wrapFacetColumns,
} from "../charts/FacetRelated/facetLayout";
import { GridChartPanel } from "../GridChartPanel";
import { Button } from "../ui/button";
import { Toaster } from "../ui/sonner";
import { NotebookProse } from "./NotebookProse";
import { NotebookSourceEditor } from "./NotebookSourceEditor";
import "./notebook.css";

export interface ExplorEdaNotebookProps {
  /** The notebook's text: Markdown with `eda` blocks. */
  text: string;
  /** The rows every block charts, such as a project query's result. */
  data: DatumObject[];
  /** Field types the data's source declares. */
  fieldTypes?: Record<string, DeclaredFieldType>;
  /** The notebook's name when no `dashboard` line gives one. */
  name?: string;
  /** Chart and filter edits, as `ExplorEda` reports them. */
  onStateChange?: (settings: SavedDataStructure) => void;
  /**
   * The notebook's new text after a chart edit made in the app, changed only
   * where the edit says. Without it, chart edits stay on screen and the
   * text never changes.
   */
  onTextChange?: (text: string) => void;
  /**
   * Each block's last text that worked. Pass the same ref when the host
   * remounts the notebook, such as after reloading its file, so a broken
   * block keeps showing its last results.
   */
  lastValid?: MutableRefObject<Record<number, string>>;
  /**
   * `"sections"` sets each `##` section's text beside its charts once the
   * notebook is at least 960 pixels wide, so the headings and findings read
   * down one column. Narrower notebooks, and notebooks that can be edited,
   * keep the single reading column.
   */
  layout?: "column" | "sections";
  /**
   * The sheet to show, by its id, in a notebook with two or more `#`
   * headings. Each heading starts a sheet, read one at a time; the text
   * before the first is the lede above them. Omit it and the notebook keeps
   * its own choice, starting from `defaultSheet` or the first sheet.
   */
  sheet?: string;
  defaultSheet?: string;
  /** Someone chose a sheet, by its id. */
  onSheetChange?: (id: string) => void;
  /**
   * Shows an Explore button on each chart. It reports the chart's id and the
   * notebook's settings as they are now; `exploreChartCopy` turns them into
   * a workspace to open beside the notebook.
   */
  onExploreChart?: (chartId: string, settings: SavedDataStructure) => void;
}

/** The host's Explore action for notebook charts, when it offers one. */
const ExploreChart = createContext<
  ExplorEdaNotebookProps["onExploreChart"] | undefined
>(undefined);

/** Below this width, a sections layout falls back to the reading column. */
const SECTIONS_MIN_WIDTH = 960;
/** The text column of a section, and the gap before its charts. */
const NOTES_WIDTH = 300;
const NOTES_GAP = 40;
/** The reading column's widest charts. */
const COLUMN_MAX_WIDTH = 880;

/** A notebook facet panel's height; the layout's minimum plus some air. */
const FACET_PANEL_HEIGHT = FACET_MIN_HEIGHT + 10;
/** The chart panel's frame, header, and the facet bar above the panels. */
const FACET_CHROME = 100;
/** Past this, a facet pages instead of growing. */
const FACET_MAX_HEIGHT = 1100;

/**
 * How tall a wrap facet draws: one row of panels for each row the facet
 * layout makes at this width, so none page until the cap. Undefined for a
 * chart that is not a wrap facet.
 */
function facetHeight(chart: ChartSettings, width: number, rows: DatumObject[]) {
  const facet = chart.facet;
  if (!facet?.enabled || facet.type !== "wrap" || !facet.rowVariable) return;
  // Aggregate charts facet only as series bars, as the chart panel does.
  if (
    "aggregateId" in chart &&
    chart.aggregateId &&
    !(chart.type === "bar" && chart.seriesField)
  )
    return;
  const panels = Math.min(
    new Set(rows.map((row) => row[facet.rowVariable])).size,
    facet.visibleFacetIds?.length ?? Infinity
  );
  // The chart panel insets its body 12 pixels on each side.
  const columns = wrapFacetColumns(width - 24, facet.columnCount);
  const rowCount = Math.max(1, Math.ceil(panels / columns));
  return Math.max(
    380,
    Math.min(
      FACET_MAX_HEIGHT,
      FACET_CHROME + rowCount * (FACET_PANEL_HEIGHT + FACET_GAP) - FACET_GAP
    )
  );
}

/** How tall each kind of chart draws in the reading column. */
function chartHeight(chart: ChartSettings, width: number, categories?: number) {
  switch (chart.type) {
    case "metric-card":
      return 150;
    // A few bars need a short chart; two dozen need a tall one. A top N
    // draws its N bars and one for the rest, however many categories exist.
    case "row": {
      if (categories === undefined) return 380;
      const bars = chart.topN
        ? Math.min(categories, chart.topN + 1)
        : categories;
      return Math.min(
        640,
        110 + bars * Math.max(chart.minRowHeight, chart.maxRowHeight)
      );
    }
    // A scatter's legends sit above and below its plot, so it grows with
    // the column to keep the plot near 3:2, plus room for a bubble legend.
    case "scatter":
      return (
        Math.round(Math.max(360, Math.min(560, width * 0.62))) +
        (chart.sizeField ? 80 : 0)
      );
    // A heatmap with many rows, such as 24 clock hours or 51 states, needs
    // room for each.
    case "heatmap":
      return categories === undefined
        ? 380
        : Math.max(380, Math.min(1120, 120 + categories * 20));
    // A pivot with one row field takes a row per category, its two header
    // rows, and the total.
    case "pivot":
      return categories === undefined
        ? 420
        : Math.min(420, 140 + (categories + 1) * 28);
    case "data-table":
    case "summary":
      return 420;
    default:
      return 380;
  }
}

/**
 * Compiles the notebook, keeping each block's last text that worked, so a
 * block being edited keeps showing its results until its text works again.
 */
export function useNotebookResult(
  text: string,
  data: DatumObject[],
  name?: string,
  memory?: MutableRefObject<Record<number, string>>
): NotebookCompileResult {
  const ownMemory = useRef<Record<number, string>>({});
  const lastValid = memory ?? ownMemory;
  return useMemo(() => {
    const result = compileNotebook(text, {
      rows: data,
      name,
      lastValid: lastValid.current,
    });
    const next: Record<number, string> = {};
    for (const block of result.blocks) {
      const own = result.notebook.blocks[block.index]!.text;
      const kept = lastValid.current[block.index];
      if (block.status === "ok") {
        next[block.index] = own;
      } else if (kept !== undefined) {
        next[block.index] = kept;
      }
    }
    lastValid.current = next;
    return result;
  }, [text, data, name, lastValid]);
}

/** How long after a key press or pointer press a change counts as an edit. */
const INPUT_WINDOW = 2000;

/** When someone last pressed a key or pointer, typed, or picked a value. */
function useLastInput() {
  const last = useRef(-Infinity);
  useEffect(() => {
    const mark = () => {
      last.current = performance.now();
    };
    const events = ["pointerdown", "keydown", "input", "change"] as const;
    for (const name of events) {
      document.addEventListener(name, mark, true);
    }
    return () => {
      for (const name of events) {
        document.removeEventListener(name, mark, true);
      }
    };
  }, []);
  return last;
}

function useWidth() {
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/**
 * A notebook: prose and the results of its `eda` blocks in one reading
 * column. Every block's definitions apply to the whole notebook, and each
 * chart's clicks and brushes stay with that chart.
 */
export function ExplorEdaNotebook({
  text,
  data,
  fieldTypes,
  name,
  onStateChange,
  onTextChange,
  lastValid,
  layout = "column",
  sheet,
  defaultSheet,
  onSheetChange,
  onExploreChart,
}: ExplorEdaNotebookProps) {
  const ownMemory = useRef<Record<number, string>>({});
  const memory = lastValid ?? ownMemory;
  const result = useNotebookResult(text, data, name, memory);

  // After a splice, the app already shows what the new text says, so the
  // settings stay as they are; restoring them would close open editors.
  const written = useRef<
    { text: string; settings: SavedDataStructure } | undefined
  >(undefined);
  const [revert, setRevert] = useState(0);
  const refusedFor = useRef<string | undefined>(undefined);
  // The settings as the app holds them; an edit is the change from these.
  const applied = useRef<SavedDataStructure | undefined>(undefined);
  const lastInput = useLastInput();
  const savedData = useMemo(() => {
    void revert;
    return written.current?.text === text
      ? written.current.settings
      : structuredClone(result.settings);
  }, [result, text, revert]);

  const handleStateChange = (settings: SavedDataStructure) => {
    onStateChange?.(settings);
    if (!onTextChange) return;
    const previous = applied.current;
    applied.current = settings;
    // Charts also save what they fill in as they draw, such as a series'
    // color. Only a change that follows someone's input is an edit.
    if (!previous || performance.now() - lastInput.current > INPUT_WINDOW) {
      return;
    }
    const { text: next, results } = writeBackSettings(
      text,
      result,
      previous,
      settings,
      // A broken block's stand-in text compiles the same way here.
      { rows: data, name, lastValid: memory.current }
    );
    const refused = results.find((item) => item.kind === "unsupported");
    // A refused edit is undone once, so the charts match the text again.
    // If a control makes it again at once, it stays on screen unsaved.
    if (refused && refusedFor.current !== text) {
      refusedFor.current = text;
      toast.error(refused.reason ?? "That change can't be saved as text.");
      written.current = undefined;
      setRevert((count) => count + 1);
    }
    if (next !== text) {
      written.current = results.every((item) => item.kind !== "rewrite")
        ? { text: next, settings: savedData }
        : undefined;
      onTextChange(next);
    }
  };

  return (
    <DataLayerProvider
      data={data}
      fieldTypes={fieldTypes}
      savedData={savedData}
      onStateChange={handleStateChange}
      onSavedDataApplied={(settings) => {
        applied.current = settings;
        // Charts fill in what they draw once settings arrive; only input
        // that comes after counts as an edit.
        lastInput.current = -Infinity;
      }}
      localSelections
    >
      <CalculationEditorProvider>
        <ChartDraftProvider>
          <ExploreChart.Provider value={onExploreChart}>
            <NotebookColumn
              result={result}
              layout={layout}
              sheet={sheet}
              defaultSheet={defaultSheet}
              onSheetChange={onSheetChange}
              onSegmentChange={
                onTextChange
                  ? (segment, next) =>
                      onTextChange(replaceSegment(text, segment, next))
                  : undefined
              }
            />
          </ExploreChart.Provider>
        </ChartDraftProvider>
      </CalculationEditorProvider>
      <GlobalAlertDialog />
      <Toaster />
    </DataLayerProvider>
  );
}

/** The notebook text with one segment's lines replaced. */
function replaceSegment(
  text: string,
  segment: NotebookSegment,
  next: string
): string {
  const lines = text.split(/\r?\n/);
  // An empty block's text goes on the line after its opening fence.
  const end = Math.max(segment.endLine, segment.startLine - 1);
  return [
    ...lines.slice(0, segment.startLine - 1),
    ...next.split("\n"),
    ...lines.slice(end),
  ].join("\n");
}

/** Words that name a section, without its number, for comparing titles. */
function headingKey(text: string) {
  return text
    .replace(/^#+\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim()
    .toLowerCase();
}

function slug(text: string) {
  return headingKey(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface NotebookSection {
  /** The `##` line that opens it; absent for text before the first one. */
  heading?: string;
  notes: string[];
  blocks: NotebookBlockResult[];
}

/**
 * Groups segments by their `##` headings: each section's text, including
 * a finding written after a chart, and the blocks that chart it.
 */
export function notebookSections(
  segments: readonly NotebookSegment[],
  blocks: readonly NotebookBlockResult[]
): NotebookSection[] {
  const sections: NotebookSection[] = [{ notes: [], blocks: [] }];
  const current = () => sections[sections.length - 1]!;
  for (const segment of segments) {
    if (segment.kind !== "prose") {
      current().blocks.push(blocks[segment.index]!);
      continue;
    }
    let fenced = false;
    let lines: string[] = [];
    const flush = () => {
      const text = lines.join("\n").trim();
      if (text) current().notes.push(text);
      lines = [];
    };
    for (const line of segment.text.split(/\r?\n/)) {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (!fenced && /^##\s/.test(line)) {
        flush();
        sections.push({ heading: line, notes: [], blocks: [] });
      }
      lines.push(line);
    }
    flush();
  }
  return sections.filter(
    (section) => section.notes.length || section.blocks.length
  );
}

function NotebookSectionsView({
  segments,
  blocks,
  width,
}: {
  segments: readonly NotebookSegment[];
  blocks: readonly NotebookBlockResult[];
  width: number;
}) {
  const figureWidth = width - NOTES_WIDTH - NOTES_GAP;
  const charts = useDataLayer((state) => state.charts);
  const sections = notebookSections(segments, blocks);
  // Small multiples need the notebook's width for their columns, so a
  // section that draws them puts its text above them instead of beside.
  const wrapFacets = new Set(
    charts
      .filter((chart) => chart.facet?.enabled && chart.facet.type === "wrap")
      .map((chart) => chart.id)
  );
  const wide = (section: NotebookSection) =>
    section.blocks.some((block) =>
      block.charts.some(({ id }) => wrapFacets.has(id))
    );
  // A block that only defines fields draws nothing, so a section with no
  // other block is text, such as a lede followed by its field list.
  const draws = (section: NotebookSection) =>
    section.blocks.some(
      (block) => block.charts.length || block.diagnostics.length
    );
  // Text-only sections in a row, such as a takeaway and its limits, share it.
  const rows: NotebookSection[][] = [];
  for (const section of sections) {
    const last = rows[rows.length - 1];
    if (
      section.heading &&
      !draws(section) &&
      last?.[0]?.heading &&
      !draws(last[0]) &&
      last.length < 2
    )
      last.push(section);
    else rows.push([section]);
  }
  return rows.map((row, index) => {
    const [section] = row;
    if (row.length > 1 || !draws(section!))
      return (
        <div
          key={index}
          className={
            section!.heading ? "eda-notebook-closing" : "eda-notebook-intro"
          }
        >
          {row.map((item, at) => (
            <div
              key={at}
              id={item.heading ? slug(item.heading) : undefined}
              className="eda-notebook-segment"
            >
              <NotebookProse text={item.notes.join("\n\n")} />
              {item.blocks.map((block) => (
                <NotebookBlockView
                  key={block.index}
                  block={block}
                  width={width}
                  open={false}
                />
              ))}
            </div>
          ))}
        </div>
      );
    if (wide(section!))
      return (
        <section
          key={index}
          id={section!.heading ? slug(section!.heading) : undefined}
          className="eda-notebook-section"
          data-wide=""
        >
          <div className="eda-notebook-notes eda-notebook-segment">
            <NotebookProse text={section!.notes.join("\n\n")} />
          </div>
          <div className="eda-notebook-figures">
            {section!.blocks.map((block) => (
              <NotebookBlockView
                key={block.index}
                block={block}
                width={width}
                open={false}
                heading={section!.heading}
              />
            ))}
          </div>
        </section>
      );
    return (
      <section
        key={index}
        id={section!.heading ? slug(section!.heading) : undefined}
        className="eda-notebook-section"
      >
        <div className="eda-notebook-notes eda-notebook-segment">
          <NotebookProse text={section!.notes.join("\n\n")} />
        </div>
        <div className="eda-notebook-figures">
          {section!.blocks.map((block) => (
            <NotebookBlockView
              key={block.index}
              block={block}
              width={figureWidth}
              open={false}
              heading={section!.heading}
            />
          ))}
        </div>
      </section>
    );
  });
}

/** The sheets of a book, as tabs; arrows, Home, and End move between them. */
function SheetTabs({
  sheets,
  active,
  prefix,
  onSelect,
}: {
  sheets: NotebookSheet[];
  active: NotebookSheet;
  prefix: string;
  onSelect: (sheet: NotebookSheet) => void;
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = sheets.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % sheets.length
        : event.key === "ArrowLeft"
          ? (index + last) % sheets.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    onSelect(sheets[next]!);
    tabs.current[next]?.focus();
  };
  return (
    <div className="eda-notebook-sheets" role="tablist" aria-label="Sheets">
      {sheets.map((sheet, index) => (
        <button
          key={sheet.id}
          ref={(element) => {
            tabs.current[index] = element;
          }}
          type="button"
          role="tab"
          id={`${prefix}-tab-${sheet.id}`}
          aria-selected={sheet === active}
          aria-controls={`${prefix}-sheet-${sheet.id}`}
          tabIndex={sheet === active ? 0 : -1}
          className="eda-notebook-sheet-tab"
          onClick={() => onSelect(sheet)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          <span className="eda-notebook-sheet-index" aria-hidden="true">
            {index + 1}
          </span>
          {sheet.title}
        </button>
      ))}
    </div>
  );
}

/** A sheet's segments as a reader sees them: the heading is its tab. */
function withoutSheetHeading(segments: NotebookSegment[]): NotebookSegment[] {
  const [first, ...rest] = segments;
  if (!first || first.kind !== "prose") return segments;
  const text = withoutHeading(first.text);
  return text.trim() ? [{ ...first, text }, ...rest] : rest;
}

function NotebookColumn({
  result,
  layout,
  sheet,
  defaultSheet,
  onSheetChange,
  onSegmentChange,
}: {
  result: NotebookCompileResult;
  layout: "column" | "sections";
  sheet?: string;
  defaultSheet?: string;
  onSheetChange?: (id: string) => void;
  /** Present when the notebook's text can change. */
  onSegmentChange?: (segment: NotebookSegment, text: string) => void;
}) {
  const { ref, width } = useWidth();
  const prefix = useId();
  const { lede, sheets } = useMemo(
    () => notebookSheets(result.notebook),
    [result.notebook]
  );
  const book = sheets.length > 1;
  const [ownSheet, setOwnSheet] = useState(defaultSheet);
  const wanted = sheet ?? ownSheet;
  const active = sheets.find((item) => item.id === wanted) ?? sheets[0]!;
  const select = (next: NotebookSheet) => {
    if (next === active) return;
    if (sheet === undefined) setOwnSheet(next.id);
    onSheetChange?.(next.id);
  };
  // Prose segments go by their order in the file, which typing in them
  // doesn't change, so an open editor stays open while its neighbors change.
  const keys = useMemo(() => {
    const map = new Map<NotebookSegment, string>();
    let prose = 0;
    for (const segment of [...lede, ...sheets.flatMap((item) => item.segments)])
      map.set(
        segment,
        segment.kind === "prose" ? `prose-${prose++}` : `block-${segment.index}`
      );
    return map;
  }, [lede, sheets]);
  const themeId = resolveThemeId(useDataLayer((state) => state.theme));
  const setDarkMode = useDataLayer((state) => state.setDarkMode);
  const [editing, setEditing] = useState<ReadonlySet<string>>(new Set());
  const toggle = (key: string) =>
    setEditing((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  // Charts color their palettes for the surface they sit on.
  useEffect(() => {
    const update = () =>
      setDarkMode(
        Boolean(ref.current?.closest(".dark")) ||
          document.documentElement.classList.contains("dark")
      );
    update();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [ref, setDarkMode]);

  const sections =
    layout === "sections" && !onSegmentChange && width >= SECTIONS_MIN_WIDTH;
  const shown =
    book && !onSegmentChange
      ? withoutSheetHeading(active.segments)
      : active.segments;
  const render = (segments: NotebookSegment[]) =>
    sections ? (
      <NotebookSectionsView
        segments={segments}
        blocks={result.blocks}
        width={width}
      />
    ) : (
      segments.map((segment) => {
        const key = keys.get(segment) ?? `line-${segment.startLine}`;
        const open = editing.has(key);
        const edit = onSegmentChange && (
          <EditToggle
            open={open}
            kind={segment.kind}
            onToggle={() => toggle(key)}
          />
        );
        const editor = open && onSegmentChange && (
          <NotebookSourceEditor
            value={segment.text}
            language={segment.kind === "prose" ? "markdown" : "eda"}
            label={
              segment.kind === "prose"
                ? "Markdown text"
                : `Block ${segment.index + 1} text`
            }
            onChange={(next) => onSegmentChange(segment, next)}
          />
        );
        return segment.kind === "prose" ? (
          <div
            key={key}
            className="eda-notebook-segment"
            data-open={open || undefined}
          >
            {edit}
            {editor || <NotebookProse text={segment.text} />}
          </div>
        ) : (
          <NotebookBlockView
            key={key}
            block={result.blocks[segment.index]!}
            width={Math.min(width, COLUMN_MAX_WIDTH)}
            edit={edit}
            editor={editor}
            open={open}
          />
        );
      })
    );
  return (
    <div
      className="eda-workspace eda-notebook bg-background text-foreground"
      data-eda-theme={themeId}
      data-sheets={book || undefined}
    >
      <article
        ref={ref}
        className="eda-notebook-column"
        data-layout={
          layout === "sections" && !onSegmentChange ? "sections" : undefined
        }
        data-wide={sections || undefined}
      >
        {book && lede.length > 0 && (
          <div className="eda-notebook-lede">{render(lede)}</div>
        )}
        {book && (
          <SheetTabs
            sheets={sheets}
            active={active}
            prefix={prefix}
            onSelect={select}
          />
        )}
        {book ? (
          <div
            key={active.id}
            role="tabpanel"
            id={`${prefix}-sheet-${active.id}`}
            aria-labelledby={`${prefix}-tab-${active.id}`}
            className="eda-notebook-sheet"
            data-sheet={active.id}
          >
            {render(shown)}
          </div>
        ) : (
          render(shown)
        )}
      </article>
    </div>
  );
}

/** Opens or closes a segment's text, beside it. */
function EditToggle({
  open,
  kind,
  onToggle,
}: {
  open: boolean;
  kind: NotebookSegment["kind"];
  onToggle: () => void;
}) {
  return (
    <div className="eda-notebook-segment-tools">
      <Button
        variant="ghost"
        size="sm"
        aria-pressed={open}
        tooltip={
          open
            ? "Close the text editor; changes are already saved"
            : kind === "prose"
              ? "Edit this text as Markdown"
              : "Edit this block's dashboard text; charts update as you type"
        }
        onClick={onToggle}
      >
        {open ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Pencil className="h-4 w-4" aria-hidden="true" />
        )}
        {open ? "Done" : kind === "prose" ? "Edit text" : "Edit block"}
      </Button>
    </div>
  );
}

function NotebookBlockView({
  block,
  width,
  edit,
  editor,
  open,
  heading,
}: {
  block: NotebookBlockResult;
  width: number;
  edit?: ReactNode;
  editor?: ReactNode;
  open: boolean;
  /** The section's heading; a chart title that repeats it is not shown. */
  heading?: string;
}) {
  const charts = useDataLayer((state) => state.charts);
  const rows = useDataLayer((state) => state.data);
  const saveToStructure = useDataLayer((state) => state.saveToStructure);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const explore = useContext(ExploreChart);
  // Counts the categories a chart draws: a calculated field reads its own
  // column, and a chart's where filter drops rows outside it.
  const distinct = (chart: ChartSettings & { field: string }) => {
    const column = getColumnData(chart.field);
    const ids = restrictToPopulation(
      rows.map((row) => row.__ID),
      { localFilters: chart.localFilters },
      getColumnData
    );
    return new Set(ids.map((id) => column[id])).size;
  };
  const byId = useMemo(
    () => new Map(charts.map((chart) => [chart.id, chart])),
    [charts]
  );
  const problems = block.diagnostics;
  const empty = !block.charts.length;
  if (empty && !problems.length && !open) {
    const names = [...block.aliases, ...block.calculations];
    return names.length || edit ? (
      <div className="eda-notebook-segment">
        {edit}
        <p className="eda-notebook-defines">
          {names.length ? `Defines ${names.join(", ")}` : "Definitions"}
        </p>
      </div>
    ) : null;
  }
  return (
    <section
      className="eda-notebook-block eda-notebook-segment"
      data-block={block.index}
      data-status={block.status}
      data-open={open || undefined}
      aria-label={`Block ${block.index + 1}`}
    >
      {edit}
      {editor}
      {problems.length > 0 && (
        <BlockProblems block={block} problems={problems} />
      )}
      {width > 0 &&
        block.charts.map(({ id }) => {
          const chart = byId.get(id);
          return chart ? (
            <div
              key={id}
              className="eda-notebook-output"
              data-chart-id={id}
              data-title-repeats={
                (heading &&
                  chart.title &&
                  headingKey(chart.title) === headingKey(heading)) ||
                undefined
              }
              tabIndex={-1}
            >
              <GridChartPanel
                settings={chart}
                onExplore={explore && (() => explore(id, saveToStructure()))}
                width={width}
                height={
                  facetHeight(chart, width, rows) ??
                  chartHeight(
                    chart,
                    width,
                    chart.type === "row"
                      ? distinct(chart)
                      : chart.type === "heatmap"
                        ? Math.min(
                            distinct(chart),
                            chart.maxCategories ?? Infinity
                          )
                        : chart.type === "pivot" && chart.rowFields.length === 1
                          ? distinct({ ...chart, field: chart.rowFields[0]! })
                          : undefined
                  )
                }
              />
            </div>
          ) : null;
        })}
    </section>
  );
}

function BlockProblems({
  block,
  problems,
}: {
  block: NotebookBlockResult;
  problems: NotebookBlockResult["diagnostics"];
}) {
  const errors = problems.some((item) => item.severity === "error");
  return (
    <div
      className="eda-notebook-problems"
      data-severity={errors ? "error" : "warning"}
      role={errors ? "alert" : "status"}
    >
      <p className="eda-notebook-problems-head">
        <CircleAlert className="h-4 w-4" aria-hidden="true" />
        {block.status === "frozen"
          ? "This block's text has a problem. The results below are from its last version that worked."
          : errors
            ? "This block's text has a problem."
            : "This block built with a warning."}
      </p>
      <ul>
        {problems.map((item, index) => (
          <li key={index}>
            <span className="eda-notebook-line">Line {item.line}</span>{" "}
            {item.message}
            {item.suggestion && (
              <span className="eda-notebook-fix"> {item.suggestion}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
