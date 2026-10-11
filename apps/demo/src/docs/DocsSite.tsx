import { examples } from "@/demos/examples";
import { examplePath } from "@/routes";
import { ArrowRight } from "lucide-react";
import type { MDXContent } from "mdx/types";
import {
  lazy,
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  catalogue,
  findPage,
  GROUP_LABELS,
  pageModulePath,
  pageModules,
  type DocsGroup,
  type DocsPage,
} from "./catalogue";
import {
  cardLinkClass,
  DocsBar,
  labelClass,
  PageHeader,
  stretchedLinkClass,
  TryCard,
} from "./components/chrome";
import { DocsLink, mdxComponents } from "./components/content";
import { LiveExample } from "./live/LiveExample";
import { captureId, docsPath, docsTopic, liveShotPath } from "./paths";

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

type TocEntry = { id: string; title: string };

/** Reads the page's section headings once its content is on screen. */
function ContentsReader({ onRead }: { onRead: (entries: TocEntry[]) => void }) {
  const { hash } = useLocation();
  const marker = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const article = marker.current?.closest("article");
    const headings = article?.querySelectorAll("h2[id]") ?? [];
    onRead(
      [...headings].map((heading) => ({
        id: heading.id,
        title: heading.textContent ?? "",
      }))
    );
    if (hash) {
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView();
    }
  }, [hash, onRead]);
  return <span ref={marker} hidden />;
}

function GuidePage({ page }: { page: DocsPage }) {
  const [contents, setContents] = useState<TocEntry[]>([]);
  const Content = pageContent(page.topic);

  return (
    <>
      <DocsBar current={page.title} />
      <PageHeader eyebrow={page.eyebrow} heading={page.title}>
        {page.lede}
      </PageHeader>
      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
        <article className="min-w-0 max-w-3xl">
          {Content && (
            <Suspense
              fallback={
                <p role="status" className="text-sm text-muted-foreground">
                  Loading the guide…
                </p>
              }
            >
              <Content />
              <ContentsReader onRead={setContents} />
            </Suspense>
          )}
        </article>
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {contents.length > 0 && (
            <nav
              aria-label="On this page"
              className="hidden border-l border-border pl-4 lg:block"
            >
              <p className={labelClass}>On this page</p>
              <ul className="mt-3 space-y-2 text-sm">
                {contents.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {entry.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {page.examples.map((id) => {
            const example = examples.find((item) => item.id === id);
            return example ? (
              <TryCard
                key={id}
                heading={example.title}
                meta={`${example.dataset.rows} · ${example.dataset.source} data`}
                to={examplePath(id)}
                label="Open the example"
              />
            ) : null;
          })}
          {page.related.length > 0 && (
            <div className="rounded-xl border border-border p-5">
              <p className={labelClass}>Related</p>
              <ul className="mt-3 space-y-2.5 text-sm">
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
        </aside>
      </div>
    </>
  );
}

function PageCard({ page }: { page: DocsPage }) {
  const Icon = page.icon;
  // Screenshots come from the docs check, so a dev server may not have them.
  const [thumbMissing, setThumbMissing] = useState(false);
  return (
    <article className={`${cardLinkClass} flex flex-col overflow-hidden`}>
      {page.thumbnail && !thumbMissing && (
        <div className="aspect-[16/8] overflow-hidden border-b border-border bg-muted">
          <img
            src={liveShotPath(page.thumbnail)}
            alt=""
            onError={() => setThumbMissing(true)}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Icon
            aria-hidden="true"
            className="size-5 text-muted-foreground transition-colors group-hover:text-primary"
          />
          <h3 className="text-lg font-semibold">
            <Link className={stretchedLinkClass} to={docsPath(page.topic)}>
              {page.title}
            </Link>
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {page.summary}
        </p>
        {page.highlights.length > 0 && (
          <ul aria-label="Covers" className="mt-4 flex flex-wrap gap-1.5">
            {page.highlights.map((item) => (
              <li
                key={item}
                className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
        <p
          aria-hidden="true"
          className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium text-primary"
        >
          Read the guide
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </p>
      </div>
    </article>
  );
}

function IndexPage() {
  const groups = Object.keys(GROUP_LABELS) as DocsGroup[];
  return (
    <>
      <DocsBar />
      <PageHeader eyebrow="Learn" heading="Docs">
        Choose a view for your question, learn what it computes and which rows
        it reads, then open its matching workspace example.
      </PageHeader>
      {groups.map((group) => {
        const pages = catalogue.filter((page) => page.group === group);
        if (pages.length === 0) {
          return null;
        }
        return (
          <section
            key={group}
            aria-labelledby={`docs-${group}`}
            className="mt-14"
          >
            <h2 id={`docs-${group}`} className={labelClass}>
              {GROUP_LABELS[group]}
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {pages.map((page) => (
                <PageCard key={page.topic} page={page} />
              ))}
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
      <DocsBar current="Not found" />
      <PageHeader eyebrow="Docs" heading="That page does not exist">
        <span>
          Go back to the{" "}
          <Link
            className="font-medium text-primary hover:underline"
            to={docsPath()}
          >
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
  const capture = captureId(pathname);
  if (capture) {
    // The docs check screenshots each live example here, without page chrome.
    return (
      <main data-docs-capture={capture} className="w-[1100px] p-4">
        <LiveExample id={capture} capture />
      </main>
    );
  }
  const topic = docsTopic(pathname);
  const page = topic ? findPage(topic) : undefined;
  return (
    <main className="pb-16">
      {!topic ? (
        <IndexPage />
      ) : page ? (
        <GuidePage key={page.topic} page={page} />
      ) : (
        <MissingPage />
      )}
    </main>
  );
}
