import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExplorEda, ExplorEdaNotebook } from "exploreda";
import { Button } from "@/components/ui/button";
import { SiteNav } from "../landing/SiteNav";
import {
  assetPath,
  dailyPath,
  kindLabels,
  loadDailyEntry,
  type DailyEntry,
} from "./corpus";
import { useDailyCatalog } from "./useDailyCatalog";
import { DailyMeta } from "./DailyMeta";
import "./daily.css";

type LoadedEntry = Awaited<ReturnType<typeof loadDailyEntry>>;

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
      <div className="py-10" role="alert">
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
      <p className="min-h-96 py-10 text-muted-foreground" role="status">
        Loading the analysis and its data…
      </p>
    );
  if (entry.kind === "notebook") {
    return (
      <div className="daily-notebook">
        <ExplorEdaNotebook
          text={loaded.text}
          data={loaded.rows}
          fieldTypes={loaded.fieldTypes}
          name={entry.title}
        />
      </div>
    );
  }
  const graphic = loaded.settings.charts.find(
    (chart) => chart.type === "composition"
  );
  const artboard =
    graphic?.type === "composition" ? graphic.composition.artboard : undefined;
  return (
    <>
      {artboard && (
        <p className="mb-3 text-sm text-muted-foreground xl:hidden">
          Scroll sideways in the graphic to read the full-size artboard.
        </p>
      )}
      <div
        className={artboard ? "daily-artboard-scroll" : undefined}
        role={artboard ? "region" : undefined}
        tabIndex={artboard ? 0 : undefined}
        aria-label={artboard ? "Scrollable composition" : undefined}
      >
        <div
          className="daily-workspace"
          style={
            artboard
              ? { minWidth: artboard.width + 64, height: artboard.height + 180 }
              : undefined
          }
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
      <div className="daily-notebook mt-8">
        <ExplorEdaNotebook
          text={loaded.companion}
          data={loaded.rows}
          name="About this view"
        />
      </div>
    </>
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
      <div className="mx-auto max-w-6xl px-4">
        <SiteNav />
        <p className="py-10" role={error ? "alert" : "status"}>
          {error || "Loading the collection…"}
        </p>
      </div>
    );
  if (!entry)
    return (
      <div className="mx-auto max-w-6xl px-4">
        <SiteNav />
        <h1 className="mt-10 text-2xl font-semibold">Piece not found</h1>
        <Link className="mt-4 inline-block underline" to="/daily">
          Browse daily data viz
        </Link>
      </div>
    );
  const related = data.entries.filter((item) =>
    entry.related.includes(item.id)
  );
  const sources = data.datasets.filter(
    (dataset) => dataset.id === entry.family
  );
  const tables = data.tables[entry.family] ?? [];
  return (
    <div className="daily-page pb-12">
      <DailyMeta heading={entry.title} description={entry.summary} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SiteNav />
        <header className="py-6">
          <Link
            to="/daily"
            className="text-sm text-site-accent underline underline-offset-4"
          >
            Daily data viz
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            {kindLabels[entry.kind]} · {entry.industry} · {entry.analysis}
          </p>
          {entry.kind !== "notebook" && (
            <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tight">
              {entry.title}
            </h1>
          )}
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            {entry.question}
          </p>
          <a
            href={assetPath(entry.entryPath)}
            download
            className="mt-3 inline-block text-sm text-site-accent underline underline-offset-4"
          >
            Download {entry.kind === "notebook" ? "notebook" : "analysis"}{" "}
            source
          </a>
        </header>
      </div>
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <EntryContent key={entry.id} entry={entry} />
        <footer className="mx-auto max-w-4xl space-y-6 border-t border-border pt-6 text-sm leading-relaxed">
          <section aria-label="Data and sources">
            <h2 className="text-lg font-semibold">Data and sources</h2>
            {sources.map((source) => (
              <div key={source.id} className="mt-3 space-y-2">
                <p>
                  <a
                    href={source.url}
                    className="text-site-accent underline underline-offset-4"
                  >
                    {source.title}
                  </a>{" "}
                  · {source.publisher}
                </p>
                <p className="text-muted-foreground">{source.notes}</p>
                <a
                  href={source.license_url}
                  className="text-site-accent underline underline-offset-4"
                >
                  {source.license}
                </a>
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {tables.map((table) => (
                    <li key={table.id}>
                      <a
                        href={assetPath(table.path)}
                        download
                        className="text-site-accent underline underline-offset-4"
                      >
                        {table.path.split("/").pop()} ·{" "}
                        {table.rows.toLocaleString()} rows
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
          <section aria-label="Related pieces">
            <h2 className="text-lg font-semibold">
              More questions, shared data
            </h2>
            <ul className="mt-3 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    className="text-site-accent underline underline-offset-4"
                    to={dailyPath(item)}
                  >
                    {item.title}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {kindLabels[item.kind]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </footer>
      </main>
    </div>
  );
}
