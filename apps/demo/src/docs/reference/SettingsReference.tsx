import { cn } from "@/lib/utils";
import { chartSettingsReference } from "exploreda/docs-kit";
import { ChevronDown, Link2, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { catalogue } from "../catalogue";
import { formatDefault, kindOf } from "./formatDefault";
import { describeSetting } from "./settingDescriptions";

/** Shared settings, by the part of the chart they change. */
const SHARED_GROUPS: readonly { label: string; keys: readonly string[] }[] = [
  {
    label: "Labels",
    keys: ["title", "subtitle", "note", "style", "xAxisLabel", "yAxisLabel"],
  },
  {
    label: "Axes and spacing",
    keys: ["xAxis", "yAxis", "xGridLines", "yGridLines", "margin"],
  },
  { label: "Color", keys: ["colorField", "colorScaleId"] },
  { label: "Filters and facets", keys: ["filters", "localFilters", "facet"] },
  { label: "Placement", keys: ["layout"] },
];

const shared = new Set(SHARED_GROUPS.flatMap((group) => group.keys));

const NOT_READ = /^Not read by/;

type Row = {
  key: string;
  description: string;
  defaultValue: unknown;
};

function matches(row: Row, query: string) {
  const text = `${row.key} ${row.description}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

const KIND_CLASS: Record<ReturnType<typeof kindOf>, string> = {
  number: "text-[var(--eda-dsl-number)]",
  boolean: "text-[var(--eda-dsl-constant)]",
  text: "text-[var(--eda-dsl-string)]",
  list: "text-[var(--eda-dsl-type)]",
  object: "text-[var(--eda-dsl-type)]",
  unset: "text-muted-foreground",
};

function SettingRow({ type, row }: { type: string; row: Row }) {
  const anchor = `setting-${row.key}`;
  const kind = kindOf(row.defaultValue);
  return (
    <div
      id={anchor}
      data-setting={row.key}
      className="group/setting grid scroll-mt-20 gap-x-6 gap-y-1 px-4 py-2.5 target:bg-docs-accent/5 sm:grid-cols-[14rem_minmax(0,1fr)]"
    >
      <dt className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <code className="break-all font-mono text-[0.8125rem] font-semibold text-foreground">
          {row.key}
        </code>
        {kind !== "unset" && (
          <code
            aria-label={`New chart: ${formatDefault(row.defaultValue)}`}
            className={cn(
              "rounded bg-muted px-1.5 font-mono text-[0.75rem] tabular-nums",
              KIND_CLASS[kind]
            )}
          >
            {formatDefault(row.defaultValue)}
          </code>
        )}
        <a
          href={`#${anchor}`}
          aria-label={`Link to the ${row.key} setting of the ${type} chart`}
          className="rounded-sm text-muted-foreground opacity-0 transition-opacity hover:text-docs-accent focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/setting:opacity-100"
        >
          <Link2 aria-hidden="true" className="size-3.5" />
        </a>
      </dt>
      <dd className="min-w-0 text-sm leading-6 text-foreground/80">
        {row.description}
      </dd>
    </div>
  );
}

function Group({
  label,
  type,
  rows,
}: {
  label: string;
  type: string;
  rows: readonly Row[];
}) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <p className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground/70">
        {label}
        <span className="font-normal normal-case tracking-normal text-muted-foreground">
          {rows.length} {rows.length === 1 ? "setting" : "settings"}
        </span>
      </p>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <SettingRow key={row.key} type={type} row={row} />
        ))}
      </dl>
    </section>
  );
}

/**
 * Every saved setting of a chart type and its value in a new chart, grouped
 * by what it changes. The keys and defaults come from the library, so the
 * reference never drifts.
 */
export function SettingsReference({ type }: { type: string }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const all = useMemo(
    () =>
      chartSettingsReference(type).map(({ key, defaultValue }) => ({
        key,
        defaultValue,
        description: describeSetting(type, key) ?? "",
      })),
    [type]
  );
  const unread = all.filter((row) => NOT_READ.test(row.description));
  const shown = all.filter(
    (row) => !NOT_READ.test(row.description) && matches(row, query)
  );
  const own = shown.filter((row) => !shared.has(row.key));
  const sharedBox = useRef<HTMLDetailsElement>(null);
  const { hash } = useLocation();
  // A link to a shared setting opens the box it sits in.
  useEffect(() => {
    const key = /^#setting-(.+)$/.exec(hash)?.[1];
    if (key && shared.has(key) && sharedBox.current) {
      sharedBox.current.open = true;
      document.getElementById(`setting-${key}`)?.scrollIntoView();
    }
  }, [hash]);
  const sharedCount = shown.length - own.length;
  const title =
    catalogue.find((page) => page.chartType === type)?.title ?? type;

  return (
    <div
      role="group"
      aria-label={`Saved settings of a ${type} chart`}
      className="mt-5 space-y-4"
    >
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Filter settings
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Filter ${all.length - unread.length} settings`}
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>
      {shown.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No setting matches “{query}”.
        </p>
      )}
      <Group label={`${title} settings`} type={type} rows={own} />
      {sharedCount > 0 && (
        <details
          ref={sharedBox}
          // Filtering opens it, so a match is never hidden.
          open={query ? true : undefined}
          className="group/shared rounded-lg border border-border bg-card open:bg-transparent open:p-0 [&[open]>summary]:mb-4"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-open/shared:border group-open/shared:border-border group-open/shared:bg-card [&::-webkit-details-marker]:hidden">
            <span>
              Shared settings
              <span className="ml-2 font-normal text-muted-foreground">
                Labels, axes, color, filters, and placement
              </span>
            </span>
            <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
              {sharedCount}
              <ChevronDown
                aria-hidden="true"
                className="size-4 transition-transform group-open/shared:rotate-180 motion-reduce:transition-none"
              />
            </span>
          </summary>
          <div className="space-y-4">
            {SHARED_GROUPS.map((group) => (
              <Group
                key={group.label}
                label={group.label}
                type={type}
                rows={shown.filter((row) => group.keys.includes(row.key))}
              />
            ))}
          </div>
        </details>
      )}
      {unread.length > 0 && !query && (
        <p className="text-xs text-muted-foreground">
          Also saved, but not read by this chart type:{" "}
          {unread.map((row, index) => (
            <span key={row.key}>
              {index > 0 && ", "}
              <code className="font-mono" data-setting={row.key}>
                {row.key}
              </code>
            </span>
          ))}
          .
        </p>
      )}
    </div>
  );
}
