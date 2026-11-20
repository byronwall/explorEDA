import type { ChartConfig } from "exploreda/chart";
import { readTableText } from "exploreda/readers";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { catalogue, GROUP_LABELS, type DocsGroup } from "../catalogue";
import { CodeFrame } from "../components/code";
import { docsPath } from "../paths";
import { configText, useModules } from "./StandaloneCharts";

type Row = Record<string, unknown>;
type Kind = "string" | "number" | "date" | "boolean" | "unknown";
type Field = { name: string; type?: Kind };
type Data = { rows: Row[]; fields: Field[]; label: string; pasted: boolean };

/** The kind of each field in the sample rows, for mapping onto pasted rows. */
const SAMPLE_KINDS: Record<string, Kind> = {
  Region: "string",
  Product: "string",
  User: "string",
  Event: "string",
  Price: "number",
  Rating: "number",
  Units: "number",
  Lat: "number",
  Lon: "number",
  Date: "date",
  End: "date",
};

/** Chart types in the docs' own order and groups. */
const TYPE_GROUPS = (Object.keys(GROUP_LABELS) as DocsGroup[])
  .map((group) => ({
    label: GROUP_LABELS[group],
    pages: catalogue.filter((page) => page.group === group && page.chartType),
  }))
  .filter((group) => group.pages.length > 0);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * A sample config moved onto other rows: each sample field becomes an
 * unused field of the same kind, so a pasted table draws at once.
 */
function adapt(config: ChartConfig, data: Data): ChartConfig {
  const used = new Set<string>();
  const chosen = new Map<string, string>();
  const pick = (name: string) => {
    const known = chosen.get(name);
    if (known) return known;
    const kind = SAMPLE_KINDS[name];
    const field =
      data.fields.find((f) => !used.has(f.name) && f.type === kind) ??
      data.fields.find((f) => !used.has(f.name)) ??
      data.fields.find((f) => f.type === kind) ??
      data.fields[0];
    const value = field?.name ?? name;
    used.add(value);
    chosen.set(name, value);
    return value;
  };
  const walk = (value: unknown): unknown =>
    typeof value === "string" && value in SAMPLE_KINDS
      ? pick(value)
      : Array.isArray(value)
        ? value.map(walk)
        : isRecord(value)
          ? Object.fromEntries(
              Object.entries(value).map(([key, item]) => [key, walk(item)])
            )
          : value;
  const next = walk(config) as Record<string, unknown>;
  if (next.type === "funnel" && typeof next.field === "string") {
    const field = next.field;
    next.steps = [...new Set(data.rows.map((row) => row[field]))].slice(0, 3);
  }
  return next as ChartConfig;
}

/** Rows from pasted CSV, TSV, or a JSON array of objects. */
function readPasted(text: string): Data {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Paste a table first.");
  const firstLine = trimmed.split("\n")[0] ?? "";
  const format = trimmed.startsWith("[")
    ? "json"
    : firstLine.includes("\t")
      ? "tsv"
      : "csv";
  const table = readTableText(trimmed, { format });
  if (!table.rows.length) throw new Error("No rows found under the header.");
  return {
    rows: table.rows as Row[],
    fields: table.fields as Field[],
    label: `Your rows: ${table.rows.length} rows, ${table.fields.length} fields`,
    pasted: true,
  };
}

/** The paste panel, anchored under its button. */
function PasteRows({ onRows }: { onRows: (data: Data) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const root = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    area.current?.focus();
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const submit = () => {
    try {
      onRows(readPasted(text));
      setError(undefined);
      setOpen(false);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
    }
  };

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="builder-button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Paste your rows
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Paste rows"
          className="absolute left-0 top-full z-30 mt-1 w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-border bg-popover p-3 shadow-lg"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              submit();
            }
          }}
        >
          <label htmlFor="builder-paste" className="text-sm font-medium">
            CSV, TSV, or a JSON array of objects
          </label>
          <textarea
            id="builder-paste"
            ref={area}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={Math.min(14, Math.max(6, text.split("\n").length + 1))}
            spellCheck={false}
            placeholder={"Region,Price,Rating\nWest,12,4.1\nEast,9,3.8"}
            className="mt-2 block w-full resize-none rounded-md border border-border bg-background px-2.5 py-2 font-mono text-xs leading-5 outline-none focus-visible:border-docs-accent"
          />
          <p
            className="mt-2 min-h-5 text-sm text-destructive"
            role={error ? "alert" : undefined}
          >
            {error}
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Rows stay in this tab. ⌘ Enter to use them.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="builder-button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="builder-button"
                data-primary=""
                onClick={submit}
              >
                Use these rows
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function reactCode(config: ChartConfig) {
  const body = configText(config).replace(/\n/g, "\n  ");
  return `import { Chart } from "exploreda/chart";
import "exploreda/dist/chart.css";

<Chart
  data={rows}
  config={${body}}
/>`;
}

/**
 * Pick a chart type, change its settings, and copy the code that draws it.
 * The chart and settings are the real `Chart` and `ChartSettings`; the
 * config lives in the URL, so a link reopens the same chart.
 */
export function ChartBuilder() {
  const modules = useModules();
  const [params, setParams] = useSearchParams();
  const [pasted, setPasted] = useState<Data>();

  const sample = useMemo<Data | undefined>(
    () =>
      modules && {
        rows: modules[1].SAMPLE_ROWS as Row[],
        fields: Object.entries(SAMPLE_KINDS).map(([name, type]) => ({
          name,
          type,
        })),
        label: `Sample sales: ${modules[1].SAMPLE_ROWS.length} rows, ${Object.keys(SAMPLE_KINDS).length} fields`,
        pasted: false,
      },
    [modules]
  );
  const data = pasted ?? sample;

  const type = params.get("type") ?? "bar";
  const config = useMemo<ChartConfig | undefined>(() => {
    const text = params.get("config");
    if (text) {
      try {
        return JSON.parse(text) as ChartConfig;
      } catch {
        // A hand-edited link falls back to the type's sample.
      }
    }
    const start = modules?.[1].SAMPLE_CONFIGS[type];
    return start && data ? (data.pasted ? adapt(start, data) : start) : start;
  }, [params, modules, type, data]);

  const show = (next: ChartConfig) =>
    setParams(
      { type: next.type, config: JSON.stringify(next) },
      { replace: true }
    );
  const choose = (nextType: string, rows = data) => {
    const start = modules?.[1].SAMPLE_CONFIGS[nextType];
    if (!start || !rows) return;
    show(rows.pasted ? adapt(start, rows) : start);
  };

  if (!modules || !data || !config) {
    return (
      <p role="status" className="py-10 text-sm text-muted-foreground">
        Loading the builder…
      </p>
    );
  }
  const [{ Chart, ChartSettings }, { chartText }] = modules;
  const text = chartText(config, data.rows as never);

  return (
    <div className="builder pb-10 pt-6" data-docs-builder="">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Chart builder</h1>
        <p className="text-sm text-muted-foreground">
          Pick a chart, change its settings, and copy the code.{" "}
          <Link className="text-docs-accent" to={docsPath("standalone-charts")}>
            How Chart works
          </Link>
        </p>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          Chart
          <select
            className="builder-select"
            value={config.type}
            onChange={(event) => choose(event.target.value)}
          >
            {TYPE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.pages.map((page) => (
                  <option key={page.topic} value={page.chartType}>
                    {page.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <span className="text-sm text-muted-foreground" data-builder-data="">
          {data.label}
        </span>
        <PasteRows
          onRows={(rows) => {
            setPasted(rows);
            choose(config.type, rows);
          }}
        />
        {data.pasted && (
          <button
            type="button"
            className="builder-button"
            onClick={() => {
              setPasted(undefined);
              choose(config.type, sample);
            }}
          >
            Use sample rows
          </button>
        )}
        <button
          type="button"
          className="builder-button"
          onClick={() => choose(config.type)}
        >
          Reset settings
        </button>
      </div>

      <div className="mt-3 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-lg border border-border bg-card p-3">
            <Chart
              data={data.rows as never}
              config={config}
              onConfigChange={show}
              settingsButton={false}
              height={400}
            />
          </div>
          <div
            className="grid items-start gap-4 xl:grid-cols-2"
            data-builder-code=""
          >
            <CodeFrame code={reactCode(config)} language="tsx" label="React" />
            <CodeFrame
              code={text}
              language="dashboard"
              label="Dashboard text"
            />
          </div>
        </div>
        <ChartSettings
          data={data.rows as never}
          config={config}
          onConfigChange={show}
          className="builder-settings rounded-lg border border-border bg-card p-3"
        />
      </div>
    </div>
  );
}
