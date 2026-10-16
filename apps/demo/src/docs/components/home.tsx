import { EXAMPLES_PATH } from "@/routes";
import { cn } from "@/lib/utils";
import { ArrowRight, House, LayoutGrid, Upload } from "lucide-react";
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router-dom";
import { catalogue, type DocsPage } from "../catalogue";
import { CHART_QUESTIONS } from "../chooser";
import { GLANCES } from "../glance";
import { WORKFLOWS } from "../../landing/workflows";
import { docsPath, liveShotPath } from "../paths";
import { cardLinkClass, stretchedLinkClass } from "./chrome";

const START_LINKS = [
  { to: docsPath("workspace"), label: "Tour the workspace", icon: House },
  { to: EXAMPLES_PATH, label: "Browse the examples", icon: LayoutGrid },
] as const;

/** The index's opening: what the docs hold, search, and where to start. */
export function Hero() {
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      aria-labelledby="docs-hero"
      className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom_right,black,transparent_70%)]"
      />
      <div className="relative grid items-start gap-x-10 gap-y-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h1
            id="docs-hero"
            ref={heading}
            tabIndex={-1}
            className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-balance outline-none sm:text-5xl"
          >
            explorEDA docs
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Charts that filter each other, on your own rows. Learn what each
            view computes and which rows it reads, and try the chart guides live
            as you read.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {START_LINKS.map(({ to, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-docs-accent underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <PathList />
      </div>
    </section>
  );
}

function PickCard({
  page,
  why,
  best,
}: {
  page: DocsPage;
  why: string;
  best: boolean;
}) {
  const [thumbMissing, setThumbMissing] = useState(false);
  const Icon = page.icon;
  const gestures = page.chartType ? GLANCES[page.chartType]?.gestures : [];
  return (
    <article className={cn(cardLinkClass, "flex flex-col overflow-hidden")}>
      {/* Without a live shot (a dev server that hasn't made them), the card
          is text only rather than a grey placeholder. */}
      {page.thumbnail && !thumbMissing && (
        <div className="aspect-[16/9] overflow-hidden border-b border-border bg-muted/60">
          <img
            src={liveShotPath(page.thumbnail)}
            alt=""
            loading="lazy"
            onError={() => setThumbMissing(true)}
            className="h-full w-full object-cover object-left-top transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="flex items-baseline gap-2 font-semibold">
          <Icon
            aria-hidden="true"
            className="size-4 shrink-0 translate-y-0.5 text-docs-accent"
          />
          <Link className={stretchedLinkClass} to={docsPath(page.topic)}>
            {page.title}
          </Link>
          {best && (
            <span className="ml-auto shrink-0 text-xs font-semibold text-docs-accent">
              Best fit
            </span>
          )}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {why}
        </p>
        {gestures && gestures.length > 0 && (
          <ul
            aria-label="Gestures"
            className="mt-auto flex flex-wrap gap-1.5 pt-4"
          >
            {gestures.slice(0, 3).map(([gesture]) => (
              <li
                key={gesture}
                className="rounded border border-b-2 border-border bg-background px-1.5 text-xs font-medium text-foreground"
              >
                {gesture}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

/** Pick a question, see the charts that answer it. */
/** Where to start: a file in this browser, or each other way to run it. */
const PATHS = [
  {
    title: "Open a file",
    where: "This browser",
    to: docsPath("load-data"),
    icon: Upload,
  },
  ...WORKFLOWS,
];

function PathList() {
  return (
    <nav aria-labelledby="docs-paths">
      <h2
        id="docs-paths"
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Choose your path
      </h2>
      <ul className="mt-2 divide-y divide-border border-y border-border">
        {PATHS.map(({ title, where, to, icon: Icon }) => (
          <li key={title} className="group relative">
            <Link
              to={to}
              className="flex items-center gap-3 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon
                aria-hidden="true"
                className="size-4 shrink-0 text-docs-accent"
              />
              <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <span className="font-medium text-foreground transition-colors duration-150 group-hover:text-docs-accent">
                  {title}
                </span>
                <span className="text-xs text-muted-foreground">{where}</span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-docs-accent"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ChartChooser() {
  const [selected, setSelected] = useState(0);
  const baseId = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const question = CHART_QUESTIONS[selected]!;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) {
      return;
    }
    event.preventDefault();
    const next =
      (selected + step + CHART_QUESTIONS.length) % CHART_QUESTIONS.length;
    setSelected(next);
    tabs.current[next]?.focus();
  };

  return (
    <section aria-labelledby={`${baseId}-heading`} className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border pb-3">
        <h2
          id={`${baseId}-heading`}
          className="text-xl font-semibold tracking-tight"
        >
          Which chart answers your question?
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick the question you have. The best fit comes first.
        </p>
      </div>
      <div
        role="tablist"
        aria-label="Questions"
        onKeyDown={onKeyDown}
        // One scrolling row on phones, wrapped rows once there is room.
        className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {CHART_QUESTIONS.map((item, index) => {
          const active = index === selected;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(index)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-docs-accent bg-docs-accent text-docs-accent-foreground"
                  : "border-border bg-card text-foreground hover:border-docs-accent/50"
              )}
            >
              {item.question}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${question.id}`}
        className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        {question.picks.map(([chartType, why], index) => {
          const page = catalogue.find((item) => item.chartType === chartType);
          return page ? (
            <PickCard
              key={`${question.id}-${chartType}`}
              page={page}
              why={why}
              best={index === 0}
            />
          ) : null;
        })}
      </div>
      <p className="mt-4 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
        Not sure yet? Open the field list: each field offers the chart types
        that suit it.
        <Link
          to={docsPath("fields")}
          className="inline-flex items-center gap-0.5 rounded-sm font-medium text-docs-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Fields
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </p>
    </section>
  );
}
