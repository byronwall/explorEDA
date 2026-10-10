import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  ScatterChart,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";

type Topic = "scatter" | "bar" | "rendering";

const guideHref = (topic: Topic | "index") =>
  topic === "index" ? "?view=docs" : `?view=docs&topic=${topic}`;

const proseClass = "text-base leading-7 text-muted-foreground";
const inlineLinkClass =
  "font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const eyebrowClass =
  "text-xs font-semibold uppercase tracking-wide text-primary";
const labelClass =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const stretchedLinkClass =
  "after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none";
const cardLinkClass =
  "group relative rounded-xl border border-border bg-card transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-accent/40";

function DocsLink({
  topic,
  children,
}: {
  topic: Topic | "index";
  children: ReactNode;
}) {
  return (
    <Link className={inlineLinkClass} to={guideHref(topic)}>
      {children}
    </Link>
  );
}

function DocsBar({ current }: { current?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border pb-4 pt-3">
      <Link
        to="/"
        aria-label="explorEDA home"
        className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src="/brand/icon.svg" alt="" className="size-7" />
        <img src="/brand/wordmark.svg" alt="" className="h-6 w-auto" />
      </Link>
      <nav aria-label="Documentation" className="min-w-0 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <li>
            <Link
              className="rounded-md px-1.5 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              to="/"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            {current ? (
              <Link
                className="rounded-md px-1.5 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                to={guideHref("index")}
              >
                Chart guides
              </Link>
            ) : (
              <span
                aria-current="page"
                className="px-1.5 py-1 font-medium text-foreground"
              >
                Chart guides
              </span>
            )}
          </li>
          {current && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <span
                  aria-current="page"
                  className="px-1.5 py-1 font-medium text-foreground"
                >
                  {current}
                </span>
              </li>
            </>
          )}
        </ol>
      </nav>
    </div>
  );
}

function PageHeader({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children?: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [heading]);

  return (
    <header className="max-w-3xl pt-10 sm:pt-14">
      <p className={eyebrowClass}>{eyebrow}</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-balance outline-none sm:text-5xl"
      >
        {heading}
      </h1>
      {children && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {children}
        </p>
      )}
    </header>
  );
}

function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: ReactNode;
}) {
  return (
    <figure className="mt-10">
      <div className="landing-shot overflow-hidden rounded-xl border border-border bg-muted">
        <img
          className="block aspect-video w-full object-cover object-top"
          src={src}
          alt={alt}
          width={1280}
          height={720}
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

interface GuideSection {
  id: string;
  title: string;
  body: ReactNode;
}

function GuideBody({
  sections,
  aside,
}: {
  sections: GuideSection[];
  aside: ReactNode;
}) {
  return (
    <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
      <div className="min-w-0 max-w-3xl space-y-12">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-8 border-t border-border pt-6"
          >
            <h2
              id={`${section.id}-heading`}
              className="text-xl font-semibold tracking-tight sm:text-2xl"
            >
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">{section.body}</div>
          </section>
        ))}
      </div>
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <nav
          aria-label="On this page"
          className="hidden border-l border-border pl-4 lg:block"
        >
          <p className={labelClass}>On this page</p>
          <ul className="mt-3 space-y-2 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {aside}
      </aside>
    </div>
  );
}

function TryCard({
  heading,
  meta,
  to,
  label,
}: {
  heading: string;
  meta: string;
  to: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className={labelClass}>Try it</p>
      <p className="mt-2 font-semibold">{heading}</p>
      <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
      <Button asChild className="mt-4 w-full">
        <Link to={to}>
          {label}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function RelatedGuides({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <p className={labelClass}>Related</p>
      <ul className="mt-3 space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function CalcChain({
  rows,
}: {
  rows: { name: string; expression: string; value?: string }[];
}) {
  return (
    <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card font-mono text-sm">
      {rows.map((row) => (
        <li
          key={row.name}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 py-2.5"
        >
          <span className="font-semibold text-foreground">{row.name}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            =
          </span>
          <span className="sr-only">equals</span>
          <span className="text-muted-foreground">{row.expression}</span>
          {row.value && (
            <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
              {row.value}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  );
}

const guideCards: {
  topic: Topic;
  title: string;
  body: string;
  icon: LucideIcon;
  image: string;
  alt: string;
  covers: string[];
}[] = [
  {
    topic: "scatter",
    title: "Scatter plot",
    body: "Compare two fields row by row, brush a range, and trace a point back to its source values.",
    icon: ScatterChart,
    image: "/docs/scatter-trace.jpg",
    alt: "Scatter plot of net sales against contribution with a trace panel open.",
    covers: ["Brushing", "Point trace", "Calculated axes"],
  },
  {
    topic: "bar",
    title: "Bar chart",
    body: "Compare category counts, numeric bins, or a grouped measure, and filter by clicking or dragging.",
    icon: BarChart3,
    image: "/docs/bar-example.jpg",
    alt: "Order-book workspace with a delivery-time histogram and a regional bar chart.",
    covers: ["Category counts", "Numeric bins", "Grouped summaries"],
  },
];

const flowSteps = [
  {
    title: "Host app",
    detail: "Loads the rows and the saved workspace settings.",
  },
  {
    title: "Data layer",
    detail: "Keeps source rows, effective fields, and calculations.",
  },
  {
    title: "Crossfilter",
    detail: "Tracks full, peer-filtered, and globally filtered row sets.",
  },
  {
    title: "Chart registry",
    detail: "Selects the scatter or bar definition from saved settings.",
  },
  {
    title: "Plan and render",
    detail: "Builds marks and draws them with Canvas or SVG.",
  },
  {
    title: "Saved settings",
    detail: "Sends settings changes back to the host callback.",
  },
];

function IndexPage() {
  return (
    <>
      <DocsBar />
      <PageHeader eyebrow="Learn" heading="Chart guides">
        Choose a view for your question, learn what it computes and which rows
        it reads, then open its matching workspace example.
      </PageHeader>

      <section aria-labelledby="plot-guides" className="mt-14">
        <h2 id="plot-guides" className={labelClass}>
          Plots
        </h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {guideCards.map((guide) => {
            const Icon = guide.icon;
            return (
              <article
                key={guide.topic}
                className={`${cardLinkClass} flex flex-col overflow-hidden`}
              >
                <div className="aspect-[16/8] overflow-hidden border-b border-border bg-muted">
                  <img
                    src={guide.image}
                    alt={guide.alt}
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-2.5">
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-muted-foreground transition-colors group-hover:text-primary"
                    />
                    <h3 className="text-lg font-semibold">
                      <Link
                        className={stretchedLinkClass}
                        to={guideHref(guide.topic)}
                      >
                        {guide.title}
                      </Link>
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {guide.body}
                  </p>
                  <ul
                    aria-label="Covers"
                    className="mt-4 flex flex-wrap gap-1.5"
                  >
                    {guide.covers.map((item) => (
                      <li
                        key={item}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
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
          })}
        </div>
      </section>

      <section aria-labelledby="shared-guide" className="mt-14">
        <h2 id="shared-guide" className={labelClass}>
          Shared guide
        </h2>
        <article
          className={`${cardLinkClass} mt-4 grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-10`}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <Workflow
                aria-hidden="true"
                className="size-5 text-muted-foreground transition-colors group-hover:text-primary"
              />
              <h3 className="text-lg font-semibold">
                <Link
                  className={stretchedLinkClass}
                  to={guideHref("rendering")}
                >
                  How rendering works
                </Link>
              </h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Follow one order from its raw row through calculations, filters,
              chart plans, drawing, and saved settings.
            </p>
            <p
              aria-hidden="true"
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              Read the guide
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </p>
          </div>
          <ol
            aria-label="Rendering stages"
            className="flex flex-wrap items-center gap-x-1.5 gap-y-2"
          >
            {flowSteps.map((step, index) => (
              <li key={step.title} className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium">
                  <span className="tabular-nums text-primary">{index + 1}</span>
                  {step.title}
                </span>
                {index < flowSteps.length - 1 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 text-muted-foreground"
                  />
                )}
              </li>
            ))}
          </ol>
        </article>
      </section>
    </>
  );
}

function RendererLink() {
  return (
    <li>
      <DocsLink topic="rendering">
        Read how rows and chart plans flow through the renderer
      </DocsLink>
    </li>
  );
}

function ScatterPage() {
  const sections: GuideSection[] = [
    {
      id: "fields",
      title: "Fields and computation",
      body: (
        <>
          <p className={proseClass}>
            Choose one field for X and one for Y. Each plotted point represents
            a source row with finite positions. In the{" "}
            <code>scatter-trace</code> example, both axes are calculated fields:
            Net sales is X and Contribution is Y.
          </p>
          <CalcChain
            rows={[
              { name: "Gross sales", expression: "Units × Unit Price" },
              { name: "Net sales", expression: "Gross sales − Discount" },
              { name: "Contribution", expression: "Net sales − Cost" },
            ]}
          />
        </>
      ),
    },
    {
      id: "selection",
      title: "Selection and row scope",
      body: (
        <>
          <p className={proseClass}>
            Drag across the plot to brush a rectangular range on both axes. The
            brush filters linked views. Other active filters also limit the
            visible rows. The axes keep their domains from the full source
            population, so the scale stays stable as rows are filtered.
          </p>
          <Callout>
            <span className="font-medium text-foreground">Trace a point.</span>{" "}
            Use the chart trace action or Alt-click a point to inspect its
            source values, calculations, filters, scales, and position. Mark
            trace is available for scatter and bar charts.
          </Callout>
        </>
      ),
    },
    {
      id: "settings",
      title: "Settings and limits",
      body: (
        <>
          <p className={proseClass}>
            Choose X, Y, and optional color fields. Adjust point size and
            opacity to make overlap easier to see.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground marker:text-border">
            <li>
              On numeric axes, rows with missing or non-finite values have no
              point. Categorical axes can include a missing-value category.
            </li>
            <li>Canvas draws the points; SVG draws the axes and the brush.</li>
            <li>The rectangular brush selects ranges on both axes.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <>
      <DocsBar current="Scatter plot" />
      <PageHeader eyebrow="Chart guide" heading="Scatter plot">
        Compare two fields across rows. Use the pattern to spot relationships,
        clusters, and unusual records.
      </PageHeader>
      <Figure
        src="/docs/scatter-trace.jpg"
        alt="Scatter plot of net sales against contribution, with a row table below."
        caption="The trace example plots calculated net sales against contribution for 18 orders, with the trace panel open on one point."
      />
      <GuideBody
        sections={sections}
        aside={
          <>
            <TryCard
              heading="Trace a scatter point"
              meta="18 orders · 4 views · calculated axes"
              to="/examples/scatter-trace"
              label="Open the scatter trace example"
            />
            <RelatedGuides>
              <li>
                <DocsLink topic="bar">Bar chart guide</DocsLink>
              </li>
              <RendererLink />
            </RelatedGuides>
          </>
        }
      />
    </>
  );
}

function BarPage() {
  const modes = [
    {
      name: "Category counts",
      body: "A categorical field counts rows in each category. Click a bar to filter.",
    },
    {
      name: "Numeric bins",
      body: "A numeric field is binned by default. Drag across bins to filter a snapped range.",
    },
    {
      name: "Grouped summary",
      body: "Count rows, or sum or average a measure field, for each group.",
    },
  ];

  const sections: GuideSection[] = [
    {
      id: "fields",
      title: "Fields and computation",
      body: (
        <>
          <p className={proseClass}>
            Choose a field to group. The selected operation determines what each
            bar means.
          </p>
          <dl className="grid gap-3 sm:grid-cols-3">
            {modes.map((mode) => (
              <div
                key={mode.name}
                className="rounded-lg border border-border bg-card p-4"
              >
                <dt className="text-sm font-semibold">{mode.name}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {mode.body}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ),
    },
    {
      id: "selection",
      title: "Selection and row scope",
      body: (
        <>
          <p className={proseClass}>
            Category-count bars use rows that remain after other filters
            and the current facet. Clicking a category filters linked views.
            Numeric bins use that same live row set; dragging across bins
            filters to their snapped numeric range. The count and bin domains
            use all source rows, which keeps categories and scale positions
            stable.
          </p>
          <Callout>
            <span className="font-medium text-foreground">
              Grouped summaries read a different scope.
            </span>{" "}
            A named grouped summary calculates from globally filtered rows. When
            chart filters or facets are active, its row scope can differ from
            category counts.
          </Callout>
        </>
      ),
    },
    {
      id: "settings",
      title: "Settings and limits",
      body: (
        <>
          <p className={proseClass}>
            Set the grouping field, choose category counts or numeric bins, and
            adjust the bin count. For a grouped summary, choose a group field,
            an operation, and—when needed—a numeric measure.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground marker:text-border">
            <li>
              Missing or non-finite measurements do not enter numeric bins.
            </li>
            <li>
              Alt-click a bar or use the chart trace action to inspect how it
              was computed.
            </li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <>
      <DocsBar current="Bar chart" />
      <PageHeader eyebrow="Chart guide" heading="Bar chart">
        Compare categories or group a numeric measure. The selected operation
        determines what each bar means.
      </PageHeader>
      <Figure
        src="/docs/bar-example.jpg"
        alt="The order-book workspace filtered to web orders, with a histogram of delivery days and a bar chart of regional order counts."
        caption="The order-book example filtered to web orders: delivery days in numeric bins, and order counts by region."
      />
      <GuideBody
        sections={sections}
        aside={
          <>
            <TryCard
              heading="Inside the order book"
              meta="500 orders · 7 linked views"
              to="/examples/shop-operations"
              label="Open the order-book example"
            />
            <RelatedGuides>
              <li>
                <DocsLink topic="scatter">Scatter plot guide</DocsLink>
              </li>
              <RendererLink />
            </RelatedGuides>
          </>
        }
      />
    </>
  );
}

function WorkedOrder() {
  const raw = [
    ["Units", "2"],
    ["Unit Price", "40"],
    ["Discount", "5"],
    ["Cost", "45"],
    ["Channel", "Online"],
  ];
  return (
    <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)_minmax(0,3fr)]">
      <div className="border-b border-border p-4 md:border-b-0 md:border-r">
        <p className={labelClass}>Raw row T-001</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {raw.map(([name, value]) => (
            <div key={name} className="contents">
              <dt className="text-muted-foreground">{name}</dt>
              <dd className="text-right font-mono tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="border-b border-border p-4 md:border-b-0 md:border-r">
        <p className={labelClass}>Calculations</p>
        <ol className="mt-3 space-y-1.5 font-mono text-sm">
          <li>
            <span className="font-semibold">Gross sales</span>{" "}
            <span className="text-muted-foreground">= 2 × 40 =</span> 80
          </li>
          <li>
            <span className="font-semibold">Net sales</span>{" "}
            <span className="text-muted-foreground">= 80 − 5 =</span> 75
          </li>
          <li>
            <span className="font-semibold">Contribution</span>{" "}
            <span className="text-muted-foreground">= 75 − 45 =</span> 30
          </li>
        </ol>
      </div>
      <div className="flex flex-col justify-center bg-muted/50 p-4">
        <p className={labelClass}>Scatter point</p>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
          (75, 30)
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          X = Net sales, Y = Contribution
        </p>
      </div>
    </div>
  );
}

function RenderingPage() {
  const sections: GuideSection[] = [
    {
      id: "flow",
      title: "From rows to marks",
      body: (
        <ol
          aria-label="Data and rendering flow"
          className="rounded-xl border border-border bg-card p-5 sm:p-6"
        >
          {flowSteps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {index < flowSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-9 h-[calc(100%-2.5rem)] w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary shadow-sm"
              >
                {index + 1}
              </span>
              <div className="pt-1">
                <p className="font-semibold">{step.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: "worked-order",
      title: "A worked order",
      body: (
        <>
          <p className={proseClass}>
            In <code>scatter-trace</code>, the raw row T-001 has Units 2, Unit
            Price 40, Discount 5, Cost 45, and Channel Online. The data layer
            applies the saved numeric field settings and formulas, and the
            resulting effective fields become the scatter point.
          </p>
          <WorkedOrder />
        </>
      ),
    },
    {
      id: "scope",
      title: "Row scope and chart definitions",
      body: (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              ["Full", "Every loaded source row."],
              [
                "Peer-filtered",
                "Every other chart's filter, without the chart's own. A facet can narrow it further.",
              ],
              ["Globally filtered", "Every active chart filter."],
            ].map(([name, body]) => (
              <div
                key={name}
                className="rounded-lg border border-border bg-card p-4"
              >
                <dt className="text-sm font-semibold">{name}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </dd>
              </div>
            ))}
          </dl>
          <p className={proseClass}>
            Bar category counts and bins use peer-filtered rows, so a chart
            never hides its own unselected bars. Named grouped summaries use
            globally filtered rows.
          </p>
          <p className={proseClass}>
            Saved settings carry each chart type. The registry maps{" "}
            <code>scatter</code> to the scatter definition and <code>bar</code>{" "}
            to the bar definition. Each definition supplies its settings and
            renderer. The scatter plan maps effective X and Y values into points
            and axis geometry; Canvas draws the points and SVG draws the axes
            and brush. The bar plan computes category counts, bins, or grouped
            values; SVG draws its bars and axes.
          </p>
        </>
      ),
    },
    {
      id: "saved-state",
      title: "Interaction and saved state",
      body: (
        <>
          <p className={proseClass}>
            A brush or bar selection updates that chart’s filter. Crossfilter
            then updates linked views using their peer-filtered rows. Scatter
            and bar charts expose their plans to mark-level trace inspectors.
          </p>
          <p className={proseClass}>
            The package sends changed workspace settings through{" "}
            <code>onStateChange</code>. That saved structure includes chart and
            calculation settings, but not the source rows. The host owns durable
            storage and supplies the rows again when it restores the workspace.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <DocsBar current="How rendering works" />
      <PageHeader eyebrow="Shared guide" heading="How rendering works">
        Follow one order through the host app, data layer, chart definitions,
        and saved settings.
      </PageHeader>
      <GuideBody
        sections={sections}
        aside={
          <>
            <TryCard
              heading="Trace a scatter point"
              meta="Follow T-001 in the live workspace"
              to="/examples/scatter-trace"
              label="Open the scatter trace example"
            />
            <RelatedGuides>
              <li>
                <DocsLink topic="scatter">
                  Scatter fields, brushing, and trace
                </DocsLink>
              </li>
              <li>
                <DocsLink topic="bar">Bar modes, row scope, and trace</DocsLink>
              </li>
              <li>
                <Link className={inlineLinkClass} to="/examples/shop-operations">
                  Open the order-book bar example
                </Link>
              </li>
            </RelatedGuides>
          </>
        }
      />
    </>
  );
}

export function ChartDocs() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const page =
    topic === "scatter" ? (
      <ScatterPage />
    ) : topic === "bar" ? (
      <BarPage />
    ) : topic === "rendering" ? (
      <RenderingPage />
    ) : (
      <IndexPage />
    );
  return <main className="pb-16">{page}</main>;
}
