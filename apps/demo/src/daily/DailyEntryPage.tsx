import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import {
  ExplorEda,
  ExplorEdaNotebook,
  type SavedDataStructure,
} from "exploreda";
import { Button } from "@/components/ui/button";
import { SiteNav } from "../landing/SiteNav";
import {
  assetPath,
  dailyPath,
  formatDay,
  kindLabels,
  loadDailyEntry,
  publishedEntries,
  todayKey,
  type DailyEntry,
} from "./corpus";
import { DailyCard } from "./DailyCard";
import { useDailyCatalog } from "./useDailyCatalog";
import { DailyMeta } from "./DailyMeta";
import "./daily.css";

type LoadedEntry = Awaited<ReturnType<typeof loadDailyEntry>>;

/** The workspace's toolbar and status line, around the chart grid. */
const WORKSPACE_CHROME = 174;

/**
 * Heights that fit the saved layout without an inner scroll: the grid's rows
 * on wide screens, and below 960 px the stacked flow, two charts to a row
 * from 640 px and one below.
 */
function workspaceHeights(settings: SavedDataStructure): CSSProperties {
  const { rowHeight, containerPadding } = settings.gridSettings;
  const layouts = settings.charts.map((chart) => chart.layout);
  const rows = Math.max(...layouts.map((item) => item.y + item.h)) + 1;
  const stacked = layouts.reduce((sum, item) => sum + item.h, 0);
  const pairs = layouts.reduce(
    (sum, item, index) =>
      index % 2 ? sum : sum + Math.max(item.h, layouts[index + 1]?.h ?? 0),
    0
  );
  const height = (count: number) =>
    `${count * rowHeight + containerPadding * 2 + WORKSPACE_CHROME}px`;
  return {
    "--daily-wide": height(rows),
    "--daily-two": height(pairs),
    "--daily-one": height(stacked),
  } as CSSProperties;
}

/**
 * Sizes the workspace to its content once charts lay out, so the page
 * scrolls instead of the grid. The estimate above sets the first frame.
 */
function useFittedHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let observer: ResizeObserver | undefined;
    const fit = () => {
      const grid = host.querySelector<HTMLElement>(".react-grid-layout");
      const content = host.firstElementChild;
      if (!grid || !content) return false;
      // The workspace lays out at its natural height: toolbar, grid, and
      // status line. Match it, borders included, so nothing spills over the
      // page below or gives the wrapper a scroll bar.
      const next = Math.ceil(
        content.getBoundingClientRect().height +
          host.offsetHeight -
          host.clientHeight
      );
      setHeight((current) =>
        current && Math.abs(current - next) < 2 ? current : next
      );
      if (!observer) {
        observer = new ResizeObserver(() => fit());
        observer.observe(grid);
        observer.observe(content);
      }
      return true;
    };
    const watcher = new MutationObserver(() => {
      if (fit()) watcher.disconnect();
    });
    if (!fit()) watcher.observe(host, { childList: true, subtree: true });
    return () => {
      watcher.disconnect();
      observer?.disconnect();
    };
  }, []);
  return { ref, height };
}

function Findings({ loaded }: { loaded: LoadedEntry }) {
  return (
    <section aria-labelledby="findings-heading" className="mb-6 max-w-3xl">
      <h2
        id="findings-heading"
        className="text-sm font-semibold text-muted-foreground"
      >
        What the data shows
      </h2>
      <ul className="mt-2 space-y-1.5 text-base leading-relaxed">
        {loaded.findings.map((finding) => (
          <li key={finding.statement} className="flex gap-2">
            <span aria-hidden="true" className="text-site-accent">
              ·
            </span>
            <span>
              {finding.statement}{" "}
              <span className="text-sm tabular-nums text-muted-foreground">
                {finding.rows.length.toLocaleString()} rows
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EntryContent({ entry }: { entry: DailyEntry }) {
  const [loaded, setLoaded] = useState<LoadedEntry | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setLoaded(null);
    loadDailyEntry(entry, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setLoaded(result);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not open this piece."
          );
      });
    return () => controller.abort();
  }, [entry, attempt]);
  if (error)
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" role="alert">
        <p>{error}</p>
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => setAttempt(attempt + 1)}
        >
          Try again
        </Button>
      </div>
    );
  if (!loaded)
    return (
      <p
        className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 text-muted-foreground sm:px-6"
        role="status"
      >
        Loading the analysis and its data…
      </p>
    );
  if (entry.kind === "notebook")
    return <NotebookContent entry={entry} loaded={loaded} />;
  return <WorkspaceContent entry={entry} loaded={loaded} attempt={attempt} />;
}

function NotebookContent({
  entry,
  loaded,
}: {
  entry: DailyEntry;
  loaded: LoadedEntry;
}) {
  {
    return (
      <div className="daily-notebook mx-auto max-w-[1440px] px-4 sm:px-6">
        <ExplorEdaNotebook
          // The page header shows the title; the notebook starts at its lede.
          text={loaded.text.replace(/^# .+\n/, "")}
          data={loaded.rows}
          fieldTypes={loaded.fieldTypes}
          name={entry.title}
        />
      </div>
    );
  }
}

function WorkspaceContent({
  entry,
  loaded,
  attempt,
}: {
  entry: DailyEntry;
  loaded: LoadedEntry;
  attempt: number;
}) {
  const { ref, height } = useFittedHeight();
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Findings loaded={loaded} />
      </div>
      <div className="daily-artboard-scroll mx-auto max-w-[1440px] px-4 sm:px-6">
        <div
          ref={ref}
          className="daily-workspace"
          style={{
            ...workspaceHeights(loaded.settings),
            ...(height && { height }),
          }}
          aria-label={`${kindLabels[entry.kind]} workspace`}
        >
          <ExplorEda
            key={`${entry.id}-${attempt}`}
            data={loaded.rows}
            fieldTypes={loaded.fieldTypes}
            savedData={loaded.settings}
          />
        </div>
      </div>
      <div className="daily-notebook mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <ExplorEdaNotebook
          text={loaded.companion}
          data={loaded.rows}
          name={
            entry.kind === "dashboard" ? "How to explore it" : "Design notes"
          }
        />
      </div>
    </>
  );
}

function DayLink({
  entry,
  direction,
}: {
  entry?: DailyEntry;
  direction: "older" | "newer";
}) {
  const label = direction === "older" ? "Previous day" : "Next day";
  if (!entry)
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground/50">
        {direction === "older" && (
          <ChevronLeft className="size-4" aria-hidden="true" />
        )}
        {label}
        {direction === "newer" && (
          <ChevronRight className="size-4" aria-hidden="true" />
        )}
      </span>
    );
  return (
    <Link
      to={dailyPath(entry)}
      aria-label={`${label}: ${entry.title}`}
      className="inline-flex items-center gap-1 rounded-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {direction === "older" && (
        <ChevronLeft className="size-4" aria-hidden="true" />
      )}
      {label}
      {direction === "newer" && (
        <ChevronRight className="size-4" aria-hidden="true" />
      )}
    </Link>
  );
}

function SeriesNav({ entry, all }: { entry: DailyEntry; all: DailyEntry[] }) {
  if (!entry.series) return null;
  const parts = all
    .filter((item) => item.series?.id === entry.series!.id)
    .sort((a, b) => a.series!.part - b.series!.part);
  return (
    <nav aria-label={entry.series.title} className="mt-4 text-sm">
      <span className="text-muted-foreground">
        Part {entry.series.part} of {parts.length} in{" "}
        <span className="font-medium text-foreground">
          {entry.series.title}
        </span>
        :
      </span>
      <ol className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {parts.map((part) => (
          <li key={part.id}>
            {part.id === entry.id ? (
              <span aria-current="page" className="font-medium">
                {part.series!.part}. {part.title}
              </span>
            ) : (
              <Link
                to={dailyPath(part)}
                className="text-site-accent transition-colors duration-150 hover:text-foreground"
              >
                {part.series!.part}. {part.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function DailyEntryPage() {
  const { slug } = useParams();
  const { data, error } = useDailyCatalog();
  const entry = data?.entries.find((item) => item.slug === slug);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  if (!data)
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SiteNav current="daily" />
        <p className="min-h-[70vh] py-10" role={error ? "alert" : "status"}>
          {error || "Loading the collection…"}
        </p>
      </div>
    );
  if (!entry)
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SiteNav current="daily" />
        <h1 className="mt-10 text-2xl font-semibold">Piece not found</h1>
        <Link className="mt-4 inline-block text-site-accent" to="/daily">
          Browse the archive
        </Link>
      </div>
    );
  const published = publishedEntries(data.entries);
  const index = published.findIndex((item) => item.id === entry.id);
  const newer = index > 0 ? published[index - 1] : undefined;
  const older = index >= 0 ? published[index + 1] : published[0];
  const related = entry.related
    .map((id) => published.find((item) => item.id === id))
    .filter((item): item is DailyEntry => Boolean(item))
    .slice(0, 4);
  const source = data.datasets.find((dataset) => dataset.id === entry.family);
  const tables = data.tables[entry.family] ?? [];
  const scheduled = entry.published > todayKey();

  return (
    <div className="daily-page pb-16">
      <DailyMeta heading={entry.title} description={entry.summary} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SiteNav current="daily" />
        <header className="pb-6 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
            <p className="text-muted-foreground">
              <Link
                to="/daily"
                className="text-site-accent transition-colors duration-150 hover:text-foreground"
              >
                Daily data viz
              </Link>{" "}
              /{" "}
              <time dateTime={entry.published}>
                {formatDay(entry.published, true)}
              </time>
              {scheduled && " · scheduled, not yet listed"}
            </p>
            <nav aria-label="Days" className="flex gap-5">
              <DayLink entry={older} direction="older" />
              <DayLink entry={newer} direction="newer" />
            </nav>
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-brand-navy text-balance sm:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {entry.summary}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {kindLabels[entry.kind]} · {entry.industry} · {entry.analysis} ·{" "}
            <a
              href="#data"
              className="text-site-accent transition-colors duration-150 hover:text-foreground"
            >
              {source?.title ?? entry.family}
            </a>
          </p>
          <SeriesNav entry={entry} all={published} />
        </header>
      </div>
      <main>
        <EntryContent key={entry.id} entry={entry} />
        <footer className="mx-auto mt-12 max-w-6xl space-y-12 px-4 sm:px-6">
          {source && (
            <section
              id="data"
              aria-labelledby="data-heading"
              className="scroll-mt-8 border-t border-border pt-6"
            >
              <h2
                id="data-heading"
                className="text-lg font-semibold text-brand-navy"
              >
                Data
              </h2>
              <div className="mt-3 grid gap-x-10 gap-y-4 text-sm leading-relaxed md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div>
                  <p>
                    <a
                      href={source.url}
                      className="font-medium text-site-accent transition-colors duration-150 hover:text-foreground"
                    >
                      {source.title}
                    </a>
                    <span className="text-muted-foreground">
                      {" "}
                      · {source.publisher}
                    </span>
                  </p>
                  <p className="mt-1 text-muted-foreground">{source.notes}</p>
                  <p className="mt-1 text-muted-foreground">
                    {source.version} ·{" "}
                    <a
                      href={source.license_url}
                      className="text-site-accent transition-colors duration-150 hover:text-foreground"
                    >
                      {source.license}
                    </a>
                  </p>
                </div>
                <ul className="space-y-1">
                  {tables.map((table) => (
                    <li key={table.id}>
                      <a
                        href={assetPath(table.path)}
                        download
                        className="inline-flex items-center gap-1.5 text-site-accent transition-colors duration-150 hover:text-foreground"
                      >
                        <Download className="size-3.5" aria-hidden="true" />
                        {table.path.split("/").pop()}
                      </a>{" "}
                      <span className="tabular-nums text-muted-foreground">
                        {table.rows.toLocaleString()} rows
                      </span>
                    </li>
                  ))}
                  <li>
                    <a
                      href={assetPath(entry.entryPath)}
                      download
                      className="inline-flex items-center gap-1.5 text-site-accent transition-colors duration-150 hover:text-foreground"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      {entry.entry}
                    </a>{" "}
                    <span className="text-muted-foreground">
                      {entry.kind === "notebook" ? "notebook" : "analysis"} text
                    </span>
                  </li>
                </ul>
              </div>
            </section>
          )}
          {related.length > 0 && (
            <section aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className="text-lg font-semibold text-brand-navy"
              >
                More on this data
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => (
                  <DailyCard key={item.id} entry={item} showQuestion={false} />
                ))}
              </div>
            </section>
          )}
          <nav
            aria-label="Days"
            className="flex justify-between gap-6 border-t border-border pt-6 text-sm"
          >
            <DayLink entry={older} direction="older" />
            <DayLink entry={newer} direction="newer" />
          </nav>
        </footer>
      </main>
    </div>
  );
}
