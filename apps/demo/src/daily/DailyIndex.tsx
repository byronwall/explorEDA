import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SiteNav } from "../landing/SiteNav";
import {
  chartWordOf,
  dailyPath,
  formatDay,
  kindLabels,
  publishedEntries,
  type DailyEntry,
  type DailyKind,
} from "./corpus";
import { DailyCard, DailyThumb, highlight } from "./DailyCard";
import { DailyMeta } from "./DailyMeta";
import { useDailyCatalog } from "./useDailyCatalog";

const KINDS: DailyKind[] = ["notebook", "composition", "dashboard"];
const FILTERS = ["q", "kind", "industry", "analysis", "chart"] as const;

const controlClass =
  "h-8 rounded-md border border-input bg-background px-2.5 text-sm transition-colors duration-150 hover:border-site-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function matches(entry: DailyEntry, params: URLSearchParams) {
  const q = params.get("q")?.trim().toLowerCase();
  const chart = params.get("chart");
  const words = chart ? (chartWordOf[chart] ?? [chart]) : [];
  return (
    (!params.get("kind") || entry.kind === params.get("kind")) &&
    (!params.get("industry") || entry.industry === params.get("industry")) &&
    (!params.get("analysis") || entry.analysis === params.get("analysis")) &&
    (!chart ||
      (chart === "composition"
        ? entry.kind === "composition"
        : words.some((word) => entry.charts.includes(word)))) &&
    (!q ||
      [
        entry.title,
        entry.question,
        entry.industry,
        entry.analysis,
        entry.family,
        ...entry.charts,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q))
  );
}

/** Values of one facet with how many pieces each has, most first. */
function facet(entries: DailyEntry[], key: "industry" | "analysis") {
  const counts = new Map<string, number>();
  for (const entry of entries)
    counts.set(entry[key], (counts.get(entry[key]) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function monthOf(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function TodayLead({ entry }: { entry: DailyEntry }) {
  return (
    <article className="group relative grid gap-6 md:grid-cols-2 md:items-center">
      <DailyThumb
        entry={entry}
        className="transition-colors duration-150 group-hover:border-site-accent/60"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-site-accent">
          Today · {formatDay(entry.published)}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-brand-navy text-balance sm:text-3xl">
          <Link
            to={dailyPath(entry)}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-site-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {entry.title}
          </Link>
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {kindLabels[entry.kind]} · {entry.industry} · {entry.analysis}
        </p>
      </div>
    </article>
  );
}

function Series({ entries }: { entries: DailyEntry[] }) {
  const series = new Map<string, DailyEntry[]>();
  for (const entry of entries)
    if (entry.series)
      series.set(entry.series.id, [
        ...(series.get(entry.series.id) ?? []),
        entry,
      ]);
  if (!series.size) return null;
  return (
    <section aria-labelledby="series-heading" className="mt-12">
      <h2 id="series-heading" className="text-lg font-semibold text-brand-navy">
        Deep dives
      </h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {[...series.values()].map((parts) => {
          const ordered = [...parts].sort(
            (a, b) => a.series!.part - b.series!.part
          );
          return (
            <section
              key={ordered[0]!.series!.id}
              aria-label={ordered[0]!.series!.title}
            >
              <h3 className="font-semibold leading-snug">
                {ordered[0]!.series!.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {ordered.length} parts · {formatDay(ordered[0]!.published)} to{" "}
                {formatDay(ordered.at(-1)!.published)}
              </p>
              <ol className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {ordered.map((entry) => (
                  <li key={entry.id} className="group relative min-w-0">
                    <DailyThumb
                      entry={entry}
                      className="transition-colors duration-150 group-hover:border-site-accent/60"
                    />
                    <Link
                      to={dailyPath(entry)}
                      className="mt-1 block text-xs leading-snug text-foreground after:absolute after:inset-0 after:content-[''] group-hover:text-site-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="text-muted-foreground">
                        {entry.series!.part}.{" "}
                      </span>
                      {entry.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default function DailyIndex() {
  const [params, setParams] = useSearchParams();
  const { data, error } = useDailyCatalog();
  const all = useMemo(
    () => (data ? publishedEntries(data.entries) : []),
    [data]
  );
  const entries = all.filter((entry) => matches(entry, params));
  const filtering = FILTERS.some((key) => params.get(key));
  const query = params.get("q") ?? "";
  const set = (key: (typeof FILTERS)[number], value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  const months = new Map<string, DailyEntry[]>();
  for (const entry of entries) {
    const month = monthOf(entry.published);
    months.set(month, [...(months.get(month) ?? []), entry]);
  }
  const families = new Set(all.map((entry) => entry.family)).size;
  const industries = new Set(all.map((entry) => entry.industry)).size;
  const today = all[0];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <DailyMeta
        heading="Daily data viz"
        description="A new notebook, composed graphic, or dashboard every day, over real datasets, with the data and calculations behind it."
      />
      <SiteNav current="daily" />
      <main>
        <header className="max-w-2xl pb-8 pt-10">
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-brand-navy sm:text-5xl">
            Daily data viz
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            One notebook, composed graphic, or dashboard a day over real data.
            Each opens live, with its data and every calculation behind its
            numbers.
          </p>
          {data && (
            <p className="mt-2 text-sm tabular-nums text-muted-foreground">
              {all.length} pieces · {families} datasets · {industries}{" "}
              industries since {formatDay(all.at(-1)!.published, true)}
            </p>
          )}
        </header>
        {!data && (
          <p className="min-h-96 py-10" role={error ? "alert" : "status"}>
            {error || "Loading the collection…"}
          </p>
        )}
        {data && !filtering && today && <TodayLead entry={today} />}
        {data && !filtering && <Series entries={all} />}
        {data && (
          <section aria-labelledby="archive-heading" className="mt-12">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-3">
              <h2
                id="archive-heading"
                className="mr-1 text-lg font-semibold text-brand-navy"
              >
                Archive
              </h2>
              <input
                type="search"
                aria-label="Search the archive"
                placeholder="Search titles, topics, or charts"
                value={query}
                onChange={(event) => set("q", event.target.value)}
                className={`${controlClass} w-full min-w-0 sm:w-56`}
              />
              <div
                role="group"
                aria-label="Format"
                className="flex rounded-md border border-input p-0.5"
              >
                {[
                  ["", "All"] as const,
                  ...KINDS.map(
                    (kind) => [kind, `${kindLabels[kind]}s`] as const
                  ),
                ].map(([value, label]) => {
                  const active = (params.get("kind") ?? "") === value;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set("kind", value)}
                      className={`h-7 rounded px-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <select
                aria-label="Industry"
                value={params.get("industry") ?? ""}
                onChange={(event) => set("industry", event.target.value)}
                className={`${controlClass} w-40`}
              >
                <option value="">Industry</option>
                {facet(all, "industry").map(([value, count]) => (
                  <option key={value} value={value}>
                    {value} ({count})
                  </option>
                ))}
              </select>
              <select
                aria-label="Kind of question"
                value={params.get("analysis") ?? ""}
                onChange={(event) => set("analysis", event.target.value)}
                className={`${controlClass} w-40`}
              >
                <option value="">Question</option>
                {facet(all, "analysis").map(([value, count]) => (
                  <option key={value} value={value}>
                    {value} ({count})
                  </option>
                ))}
              </select>
              <p
                role="status"
                className="ml-auto text-sm tabular-nums text-muted-foreground"
              >
                {filtering
                  ? `${entries.length} of ${all.length}`
                  : `${all.length} pieces`}
                {filtering && (
                  <button
                    type="button"
                    onClick={() => setParams({}, { replace: true })}
                    className="ml-3 text-site-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Clear
                  </button>
                )}
              </p>
            </div>
            {params.get("chart") && (
              <p className="mt-3 text-sm text-muted-foreground">
                Pieces that use the {params.get("chart")} chart.
              </p>
            )}
            {entries.length === 0 && (
              <p className="py-10 text-muted-foreground">
                Nothing matches. Try another word, or clear the filters.
              </p>
            )}
            {[...months].map(([month, items]) => (
              <section key={month} aria-label={month} className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {month} <span className="tabular-nums">· {items.length}</span>
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((entry) => (
                    <DailyCard key={entry.id} entry={entry} query={query} />
                  ))}
                </div>
              </section>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
