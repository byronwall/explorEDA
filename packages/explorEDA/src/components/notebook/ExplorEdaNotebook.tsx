import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Check, CircleAlert, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { DeclaredFieldType } from "@/lib/declaredFieldTypes";
import {
  compileNotebook,
  writeBackSettings,
  type NotebookBlockResult,
  type NotebookCompileResult,
  type NotebookSegment,
} from "@/lib/notebook";
import { resolveThemeId } from "@/lib/themes";
import {
  DataLayerProvider,
  useDataLayer,
  type DatumObject,
} from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { CalculationEditorProvider } from "../calculations/CalculationEditor";
import { GlobalAlertDialog } from "../GlobalAlertDialog";
import { ChartDraftProvider } from "../plot/ChartDraftContext";
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
}

/** How tall each kind of chart draws in the reading column. */
function chartHeight(chart: ChartSettings) {
  switch (chart.type) {
    case "metric-card":
      return 150;
    case "data-table":
    case "pivot":
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
          <NotebookColumn
            result={result}
            onSegmentChange={
              onTextChange
                ? (segment, next) =>
                    onTextChange(replaceSegment(text, segment, next))
                : undefined
            }
          />
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

function NotebookColumn({
  result,
  onSegmentChange,
}: {
  result: NotebookCompileResult;
  /** Present when the notebook's text can change. */
  onSegmentChange?: (segment: NotebookSegment, text: string) => void;
}) {
  const { ref, width } = useWidth();
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

  // Prose segments go by their order, which typing in them doesn't change.
  let proseCount = 0;
  return (
    <div
      className="eda-workspace eda-notebook bg-background text-foreground"
      data-eda-theme={themeId}
    >
      <article ref={ref} className="eda-notebook-column">
        {result.notebook.segments.map((segment) => {
          const key =
            segment.kind === "prose"
              ? `prose-${proseCount++}`
              : `block-${segment.index}`;
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
              width={width}
              edit={edit}
              editor={editor}
              open={open}
            />
          );
        })}
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
}: {
  block: NotebookBlockResult;
  width: number;
  edit?: ReactNode;
  editor?: ReactNode;
  open: boolean;
}) {
  const charts = useDataLayer((state) => state.charts);
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
              tabIndex={-1}
            >
              <GridChartPanel
                settings={chart}
                width={width}
                height={chartHeight(chart)}
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
