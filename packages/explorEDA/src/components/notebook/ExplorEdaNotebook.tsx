import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { CircleAlert } from "lucide-react";
import type { DeclaredFieldType } from "@/lib/declaredFieldTypes";
import {
  compileNotebook,
  type NotebookBlockResult,
  type NotebookCompileResult,
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
import { Toaster } from "../ui/sonner";
import { NotebookProse } from "./NotebookProse";
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
  /** Chart and filter edits, as `ExplorEdaNotebook` reports them. */
  onStateChange?: (settings: SavedDataStructure) => void;
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
  lastValid,
}: ExplorEdaNotebookProps) {
  const result = useNotebookResult(text, data, name, lastValid);
  return (
    <DataLayerProvider
      data={data}
      fieldTypes={fieldTypes}
      savedData={result.settings}
      onStateChange={onStateChange}
      localSelections
    >
      <CalculationEditorProvider>
        <ChartDraftProvider>
          <NotebookColumn result={result} />
        </ChartDraftProvider>
      </CalculationEditorProvider>
      <GlobalAlertDialog />
      <Toaster />
    </DataLayerProvider>
  );
}

function NotebookColumn({ result }: { result: NotebookCompileResult }) {
  const { ref, width } = useWidth();
  const themeId = resolveThemeId(useDataLayer((state) => state.theme));
  const setDarkMode = useDataLayer((state) => state.setDarkMode);
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

  return (
    <div
      className="eda-workspace eda-notebook bg-background text-foreground"
      data-eda-theme={themeId}
    >
      <article ref={ref} className="eda-notebook-column">
        {result.notebook.segments.map((segment) =>
          segment.kind === "prose" ? (
            <NotebookProse
              key={`prose-${segment.startLine}`}
              text={segment.text}
            />
          ) : (
            <NotebookBlockView
              key={`block-${segment.index}`}
              block={result.blocks[segment.index]!}
              width={width}
            />
          )
        )}
      </article>
    </div>
  );
}

function NotebookBlockView({
  block,
  width,
}: {
  block: NotebookBlockResult;
  width: number;
}) {
  const charts = useDataLayer((state) => state.charts);
  const byId = useMemo(
    () => new Map(charts.map((chart) => [chart.id, chart])),
    [charts]
  );
  const problems = block.diagnostics;
  const empty = !block.charts.length;
  if (empty && !problems.length) {
    return block.calculations.length ? (
      <p className="eda-notebook-defines">
        Defines {block.calculations.join(", ")}
      </p>
    ) : null;
  }
  return (
    <section
      className="eda-notebook-block"
      data-block={block.index}
      data-status={block.status}
      aria-label={`Block ${block.index + 1}`}
    >
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
