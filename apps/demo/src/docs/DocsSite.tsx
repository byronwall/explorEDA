import { examples } from "@/demos/examples";
import { examplePath } from "@/routes";
import type { MDXContent } from "mdx/types";
import { lazy, Suspense, useState, type ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  catalogue,
  findPage,
  GROUP_LABELS,
  neighbours,
  pageModulePath,
  pageModules,
  type DocsGroup,
  type DocsPage,
} from "./catalogue";
import {
  cardLinkClass,
  inlineLinkClass,
  labelClass,
  PageFooter,
  PageHeader,
  RailCard,
  stretchedLinkClass,
} from "./components/chrome";
import { DocsLink, mdxComponents } from "./components/content";
import { ChartChooser, Hero } from "./components/home";
import { DocsLayout, Rail } from "./components/layout";
import {
  AtAGlance,
  ChartChoiceNote,
  SavedSettings,
} from "./components/template";
import {
  ContentsReader,
  InlineContents,
  OnThisPage,
  type TocEntry,
} from "./components/toc";
import { findLiveExample } from "./live/examples";
import { LiveExample } from "./live/LiveExample";
import {
  chartWordOf,
  dailyPath,
  publishedEntries,
  type DailyEntry,
} from "../daily/corpus";
import { useDailyCatalog } from "../daily/useDailyCatalog";
import { usePageTitle } from "../pageTitle";
import { captureId, docsPath, docsTopic, thumbPath } from "./paths";

const loaded = new Map<string, ComponentType>();

/** The page's MDX as a lazy component, created once per topic. */
function pageContent(topic: string): ComponentType | null {
  const load = pageModules[pageModulePath(topic)];
  if (!load) {
    return null;
  }
  let Content = loaded.get(topic);
  if (!Content) {
    Content = lazy(() =>
      load().then(({ default: Page }: { default: MDXContent }) => ({
        default: () => <Page components={mdxComponents} />,
      }))
    );
    loaded.set(topic, Content);
  }
  return Content;
}

/** Pieces of the daily collection that use this page's chart or format. */
function DailyUses({ page }: { page: DocsPage }) {
  const { data } = useDailyCatalog();
  const matches = (entry: DailyEntry) => {
    if (page.topic === "notebooks") return entry.kind === "notebook";
    if (page.chartType === "composition") return entry.kind === "composition";
    const words = chartWordOf[page.chartType ?? ""] ?? [page.chartType];
    return words.some((word) => entry.charts.includes(word!));
  };
  if (!data || (!page.chartType && page.topic !== "notebooks")) return null;
  const uses = publishedEntries(data.entries).filter(matches);
  if (!uses.length) return null;
  return (
    <div>
      <p className={labelClass}>In the daily collection</p>
      <ul className="mt-3 space-y-2 text-sm">
        {uses.slice(0, 4).map((entry) => (
          <li key={entry.id}>
            <Link
              to={dailyPath(entry)}
              className="text-foreground underline-offset-4 hover:text-site-accent hover:underline"
            >
              {entry.title}
            </Link>
          </li>
        ))}
      </ul>
      {uses.length > 4 && (
        <Link
          to={
            page.chartType
              ? `/daily?chart=${encodeURIComponent(page.chartType)}`
              : "/daily?kind=notebook"
          }
          className="mt-2 inline-block text-sm text-site-accent underline-offset-4 hover:underline"
        >
          All {uses.length}
        </Link>
      )}
    </div>
  );
}

/** The right rail: sections, the page's examples, and related pages. */
function GuideRail({
  page,
  contents,
}: {
  page: DocsPage;
  contents: readonly TocEntry[];
}) {
  return (
    <div className="space-y-8">
      <OnThisPage entries={contents} />
      {page.examples.map((id) => {
        const example = examples.find((item) => item.id === id);
        return example ? (
          <RailCard
            key={id}
            label="Full example"
            heading={example.title}
            meta={`${example.dataset.rows} · ${example.dataset.source} data`}
            to={examplePath(id)}
          />
        ) : null;
      })}
      <DailyUses page={page} />
      {page.related.length > 0 && (
        <div>
          <p className={labelClass}>Related</p>
          <ul className="mt-3 space-y-2 text-sm">
            {page.related.map((topic) => (
              <li key={topic}>
                <DocsLink topic={topic}>
                  {findPage(topic)?.title ?? topic}
                </DocsLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GuidePage({ page }: { page: DocsPage }) {
  const [contents, setContents] = useState<TocEntry[]>([]);
  const Content = pageContent(page.topic);
  const { previous, next } = neighbours(page.topic);

  return (
    <>
      <Rail>
        <GuideRail page={page} contents={contents} />
      </Rail>
      <div className="mx-auto max-w-3xl xl:mx-0">
        <PageHeader trail={[GROUP_LABELS[page.group]]} heading={page.title}>
          {page.lede}
        </PageHeader>
        {page.chartType && <AtAGlance chartType={page.chartType} />}
        {page.chartType && <ChartChoiceNote chartType={page.chartType} />}
        <InlineContents entries={contents} />
        <article
          className="docs-article mt-10 min-w-0"
          data-docs-thumb={page.chartType && page.thumbnail}
          data-docs-thumb-chart={thumbChart(page)}
        >
          {Content && (
            <Suspense
              fallback={
                <p role="status" className="text-sm text-muted-foreground">
                  Loading the guide…
                </p>
              }
            >
              <Content />
              {page.chartType && <SavedSettings chartType={page.chartType} />}
              <ContentsReader onRead={setContents} />
            </Suspense>
          )}
        </article>
        <PageFooter topic={page.topic} previous={previous} next={next} />
      </div>
    </>
  );
}

/**
 * The chart the docs check crops from a page's thumbnail example: the first
 * one of the page's chart type. A notebook example has none, so its whole
 * shot is the thumbnail.
 */
function thumbChart(page: DocsPage) {
  const spec = page.thumbnail ? findLiveExample(page.thumbnail) : undefined;
  if (!page.chartType || !spec || !("savedData" in spec)) {
    return undefined;
  }
  return spec.savedData.charts.find((chart) => chart.type === page.chartType)
    ?.id;
}

/** A page with one of its charts, for the chart and table sections. */
function ShotCard({ page }: { page: DocsPage }) {
  const Icon = page.icon;
  // Thumbnails come from the docs check, so a dev server may not have them.
  const [thumbMissing, setThumbMissing] = useState(false);
  return (
    <article className={`${cardLinkClass} flex flex-col overflow-hidden`}>
      <div className="aspect-[7/5] overflow-hidden border-b border-border bg-card">
        {thumbMissing ? (
          <div className="flex h-full items-center justify-center bg-muted/60">
            <Icon aria-hidden="true" className="size-10 text-docs-accent/30" />
          </div>
        ) : (
          <img
            src={thumbPath(page.topic)}
            alt=""
            loading="lazy"
            onError={() => setThumbMissing(true)}
            className="h-full w-full object-contain"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold">
          <Link className={stretchedLinkClass} to={docsPath(page.topic)}>
            {page.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {page.summary}
        </p>
      </div>
    </article>
  );
}

/** A page as one line of text, for the task and concept sections. */
function LinkCard({ page }: { page: DocsPage }) {
  const Icon = page.icon;
  return (
    <article className={`${cardLinkClass} flex gap-3.5 p-4`}>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-docs-accent/10 text-docs-accent"
      >
        <Icon className="size-[1.125rem]" />
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold">
          <Link className={stretchedLinkClass} to={docsPath(page.topic)}>
            {page.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
          {page.summary}
        </p>
      </div>
    </article>
  );
}

/** Sections whose pages show a screenshot on the index. */
const SHOT_GROUPS: ReadonlySet<DocsGroup> = new Set([
  "plots",
  "tables",
  "supporting",
]);

const GROUP_INTROS: Record<DocsGroup, string> = {
  start:
    "Find your way around, bring in your rows, and embed the workspace in your own app.",
  plots:
    "What each chart computes, which rows it reads, and how a click or drag on it filters the rest.",
  tables: "Read individual rows, cross-tabulate them, or profile every field.",
  supporting:
    "Headline numbers, shared legends, and notes that explain a dashboard.",
  tasks: "Step-by-step guides for the things you do in every analysis.",
  guides:
    "Ideas that apply to every chart: scales, color, facets, and how a row becomes a mark.",
};

function IndexPage() {
  const groups = Object.keys(GROUP_LABELS) as DocsGroup[];
  return (
    <>
      <Hero />
      <ChartChooser />
      {groups.map((group) => {
        const pages = catalogue.filter((page) => page.group === group);
        if (pages.length === 0) {
          return null;
        }
        const withShots = SHOT_GROUPS.has(group);
        return (
          <section
            key={group}
            aria-labelledby={`docs-${group}`}
            className="mt-16"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-3">
              <h2
                id={`docs-${group}`}
                className="text-xl font-semibold tracking-tight"
              >
                {GROUP_LABELS[group]}
              </h2>
              <p className="text-sm text-muted-foreground">
                {GROUP_INTROS[group]}
              </p>
            </div>
            <div
              className={
                withShots
                  ? "mt-5 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3"
                  : "mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3"
              }
            >
              {pages.map((page) =>
                withShots ? (
                  <ShotCard key={page.topic} page={page} />
                ) : (
                  <LinkCard key={page.topic} page={page} />
                )
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}

function MissingPage() {
  return (
    <>
      <PageHeader trail={["Docs"]} heading="That page does not exist">
        <span>
          Pick a page from the list, or go back to the{" "}
          <Link className={inlineLinkClass} to={docsPath()}>
            docs index
          </Link>
          .
        </span>
      </PageHeader>
    </>
  );
}

/** The docs: an index at `/docs` and one page at each `/docs/<topic>`. */
export function DocsSite() {
  const { pathname } = useLocation();
  const topic = docsTopic(pathname);
  const page = topic ? findPage(topic) : undefined;
  usePageTitle(topic === "" ? "Docs" : page?.title);
  const capture = captureId(pathname);
  if (capture) {
    // The docs check screenshots each live example here, without page chrome.
    return (
      <main data-docs-capture={capture} className="w-[1100px] p-4">
        <LiveExample id={capture} capture />
      </main>
    );
  }
  return (
    <DocsLayout withRail={page !== undefined}>
      {!topic ? (
        <IndexPage />
      ) : page ? (
        <GuidePage key={page.topic} page={page} />
      ) : (
        <MissingPage />
      )}
    </DocsLayout>
  );
}
