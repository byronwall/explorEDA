import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "../landing/SiteNav";
import { assetPath, dailyEntries, dailyPath, kindLabels } from "./corpus";
import { DailyMeta } from "./DailyMeta";

export default function DailyIndex() {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const entries = dailyEntries.filter(
    (entry) =>
      (!kind || entry.kind === kind) &&
      `${entry.title} ${entry.topic} ${entry.question} ${entry.capability_tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <DailyMeta
        heading="Daily data viz"
        description="40 notebooks, 25 compositions, and 10 dashboards. Explore real datasets, compare visual choices, and inspect the evidence."
      />
      <SiteNav />
      <main>
        <header className="max-w-3xl pb-8 pt-10">
          <p className="text-sm font-medium text-site-accent">
            Different questions. Shared data.
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
            Daily data viz
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Follow an analysis, inspect a composed graphic, or explore a
            dashboard. This library holds 40 notebooks, 25 compositions, and 10
            dashboards over 17 real dataset families.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            A backlog to explore at your own pace. Each piece includes its data,
            sources, and calculations.
          </p>
          <a
            className="mt-4 inline-block text-sm font-medium text-site-accent underline underline-offset-4"
            href={assetPath("exploreda-daily-viz-corpus.zip")}
            download
          >
            Download the source collection
          </a>
        </header>
        <form
          className="flex flex-wrap items-end gap-3 border-y border-border py-4"
          onSubmit={(event) => event.preventDefault()}
          role="search"
          aria-label="Find a visualization"
        >
          <label className="min-w-0 flex-1 text-sm font-medium">
            Search topics or charts
            <input
              className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try CO2, football, or scatter"
            />
          </label>
          <label className="text-sm font-medium">
            Format
            <select
              className="mt-1 block h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              <option value="">All formats</option>
              <option value="notebook">Notebooks (40)</option>
              <option value="composition">Compositions (25)</option>
              <option value="dashboard">Dashboards (10)</option>
            </select>
          </label>
          <p
            role="status"
            className="pb-2 text-sm tabular-nums text-muted-foreground"
          >
            {entries.length} pieces
          </p>
        </form>
        <ul className="divide-y divide-border">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="grid gap-2 py-5 sm:grid-cols-[110px_1fr] sm:gap-5"
            >
              <p className="text-xs text-muted-foreground sm:pt-1">
                {kindLabels[entry.kind]}
                <span className="mt-1 block">{entry.dataset_ids[0]}</span>
              </p>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold leading-snug">
                  <Link
                    className="text-brand-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    to={dailyPath(entry)}
                  >
                    {entry.title}
                    <ArrowUpRight
                      className="ml-1 inline size-4 text-site-accent"
                      aria-hidden="true"
                    />
                  </Link>
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {entry.question}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {entries.length === 0 && (
          <p className="py-10 text-muted-foreground">
            No pieces match. Try another topic or choose all formats.
          </p>
        )}
      </main>
    </div>
  );
}
