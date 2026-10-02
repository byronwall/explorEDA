import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";

const routes = [
  { topic: "scatter", title: "Scatter plot", group: "Plots" },
  { topic: "bar", title: "Bar chart", group: "Plots" },
  { topic: "rendering", title: "How rendering works", group: "Shared guide" },
] as const;

type Topic = (typeof routes)[number]["topic"];

const pageClass = "mx-auto w-full max-w-4xl px-4 py-8 sm:px-6";
const cardClass = "rounded-lg border border-border bg-card p-5";
const textClass = "leading-7 text-muted-foreground";

function DocsLink({
  topic,
  children,
}: {
  topic: Topic | "index";
  children: ReactNode;
}) {
  return (
    <Link
      className="text-primary underline underline-offset-4"
      to={topic === "index" ? "?view=docs" : `?view=docs&topic=${topic}`}
    >
      {children}
    </Link>
  );
}

function Header({
  heading,
  children,
}: {
  heading: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 space-y-3">
      <nav aria-label="Documentation" className="flex gap-4 text-sm">
        <Link className="text-primary underline underline-offset-4" to="/">
          Home
        </Link>
        <DocsLink topic="index">Chart guides</DocsLink>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
      {children && <p className={textClass}>{children}</p>}
    </header>
  );
}

function IndexPage() {
  return (
    <main className={pageClass}>
      <Header heading="Chart guides">
        Choose a view for your question, then open its matching workspace
        example.
      </Header>
      <section aria-labelledby="plot-guides" className="space-y-4">
        <h2 id="plot-guides" className="text-xl font-semibold">
          Plots
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {routes
            .filter((route) => route.group === "Plots")
            .map((route) => (
              <article key={route.topic} className={cardClass}>
                <h3 className="text-lg font-medium">
                  <DocsLink topic={route.topic}>{route.title}</DocsLink>
                </h3>
                <p className={`mt-2 ${textClass}`}>
                  {route.topic === "scatter"
                    ? "Compare two fields row by row and brush a range."
                    : "Compare category counts, numeric bins, or a grouped measure."}
                </p>
              </article>
            ))}
        </div>
      </section>
      <section aria-labelledby="shared-guide" className="mt-8 space-y-4">
        <h2 id="shared-guide" className="text-xl font-semibold">
          Shared guide
        </h2>
        <article className={cardClass}>
          <h3 className="text-lg font-medium">
            <DocsLink topic="rendering">How rendering works</DocsLink>
          </h3>
          <p className={`mt-2 ${textClass}`}>
            Follow rows, filters, chart plans, drawing, and saved settings
            through the current app.
          </p>
        </article>
      </section>
    </main>
  );
}

function ExampleImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="my-6 space-y-2">
      <img
        className="w-full rounded-lg border border-border bg-muted"
        src={src}
        alt={alt}
      />
      <figcaption className="text-sm text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

function ScatterPage() {
  return (
    <main className={pageClass}>
      <Header heading="Scatter plot">
        Compare two fields across rows. Use the pattern to spot relationships,
        clusters, and unusual records.
      </Header>
      <ExampleImage
        src="/docs/scatter-trace.jpg"
        alt="Scatter plot of net sales against contribution, with a row table below."
        caption="The trace example plots calculated net sales against contribution for 18 orders."
      />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Fields and computation</h2>
        <p className={textClass}>
          Choose one field for X and one for Y. Each plotted point represents a
          source row with finite positions. In <code>scatter-trace</code>, Gross
          sales = Units × Unit Price; Net sales = Gross sales − Discount;
          Contribution = Net sales − Cost. Net sales is X and Contribution is Y.
        </p>
        <h2 className="text-xl font-semibold">Selection and row scope</h2>
        <p className={textClass}>
          Drag across the plot to brush a rectangular range on both axes. The
          brush filters linked views. Other active filters also limit the
          visible rows. The axes keep their domains from the full source
          population, so the scale can remain stable as rows are filtered.
        </p>
        <p className={textClass}>
          Use the chart trace action or Alt-click a point to inspect that
          point’s source values, calculations, filters, scales, and position.
          This mark trace is implemented for scatter and bar; it is not a shared
          feature of every chart.
        </p>
        <h2 className="text-xl font-semibold">Settings and limits</h2>
        <p className={textClass}>
          Choose X, Y, and optional color fields. Adjust point size and opacity
          to make overlap easier to see. In this numeric-axis example, rows with
          missing or non-finite axis values have no point. Categorical axes can
          include a missing-value category. Canvas draws the points; SVG draws
          axes and the brush. The rectangular brush selects ranges on both axes.
        </p>
      </section>
      <p className="mt-8">
        <Link
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          to="?example=scatter-trace"
        >
          Open the scatter trace example
        </Link>
      </p>
      <p className="mt-6 text-sm">
        <DocsLink topic="rendering">
          Read how rows and chart plans flow through the renderer
        </DocsLink>
      </p>
    </main>
  );
}

function BarPage() {
  return (
    <main className={pageClass}>
      <Header heading="Bar chart">
        Compare categories or group a numeric measure. The selected operation
        determines what each bar means.
      </Header>
      <ExampleImage
        src="/docs/bar-example.jpg"
        alt="The order-book workspace with a histogram of delivery days."
        caption="The order-book example shows delivery-day counts in numeric bins."
      />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Fields and computation</h2>
        <p className={textClass}>
          Choose a field to group. A categorical field counts rows by category.
          A numeric field uses bins by default. A named grouped summary can
          instead count rows or calculate a sum or average for a measure field.
        </p>
        <h2 className="text-xl font-semibold">Selection and row scope</h2>
        <p className={textClass}>
          Category-count bars use rows that remain after other chart filters and
          the current facet. Clicking a category filters linked views. Numeric
          bins use that same live row set; dragging across bins filters to their
          snapped numeric range. The count and bin domains use all source rows,
          which keeps categories and scale positions stable.
        </p>
        <p className={textClass}>
          A named grouped summary calculates from globally filtered rows. It can
          use count, sum, or average. Do not assume its row scope matches
          category counts when chart filters or facets are active.
        </p>
        <h2 className="text-xl font-semibold">Settings and limits</h2>
        <p className={textClass}>
          Set the grouping field, choose category counts or numeric bins, and
          adjust the bin count. For a grouped summary, choose a group field,
          operation, and—when needed—numeric measure. Missing or non-finite
          measurements do not enter numeric bins. Bar mark tracing is available
          for current bar plans; it does not imply that every view exposes mark
          traces.
        </p>
      </section>
      <p className="mt-8">
        <Link
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          to="?example=shop-operations"
        >
          Open the order-book example
        </Link>
      </p>
      <p className="mt-6 text-sm">
        <DocsLink topic="rendering">
          Read how rows and chart plans flow through the renderer
        </DocsLink>
      </p>
    </main>
  );
}

function RenderingPage() {
  const steps = [
    ["Demo host", "Loads CSV rows and the saved workspace settings"],
    ["Data layer", "Keeps source rows, effective fields, and calculations"],
    [
      "Crossfilter",
      "Tracks full, peer-filtered, and globally filtered row sets",
    ],
    [
      "Chart registry",
      "Selects the scatter or bar definition from saved settings",
    ],
    ["Plan and render", "Builds marks and draws Canvas or SVG output"],
    ["Saved settings", "Sends settings changes to the host callback"],
  ];
  return (
    <main className={pageClass}>
      <Header heading="How rendering works">
        Follow one order through the demo, data layer, chart definitions, and
        saved settings.
      </Header>
      <section
        aria-label="Current data and rendering flow"
        className="space-y-2"
      >
        {steps.map(([title, detail], index) => (
          <div key={title}>
            <div className={cardClass}>
              <p className="font-medium text-primary">
                {index + 1} · {title}
              </p>
              <p className={`mt-2 text-sm ${textClass}`}>{detail}</p>
            </div>
            {index < steps.length - 1 && (
              <p
                aria-hidden="true"
                className="py-1 text-center text-muted-foreground"
              >
                ↓
              </p>
            )}
          </div>
        ))}
      </section>
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">A worked order</h2>
        <p className={textClass}>
          In <code>scatter-trace</code>, the raw row T-001 has Units 2, Unit
          Price 40, Discount 5, Cost 45, and Channel Online. The data layer
          applies the saved numeric field settings and formulas: Gross sales = 2
          × 40 = 80; Net sales = 80 − 5 = 75; Contribution = 75 − 45 = 30. These
          effective fields become the scatter point (75, 30).
        </p>
        <h2 className="text-xl font-semibold">
          Row scope and chart definitions
        </h2>
        <p className={textClass}>
          The full scope is every loaded source row. For charts that read
          Crossfilter live rows, the peer-filtered scope applies other chart
          dimensions and leaves out that chart’s own filter. A configured facet
          can narrow those rows. The globally filtered scope applies every
          active chart filter. Bar category counts and bins use peer-filtered
          rows, while named grouped summaries use globally filtered rows.
        </p>
        <p className={textClass}>
          Saved settings carry each chart type. The registry maps{" "}
          <code>scatter</code> to the scatter definition and <code>bar</code> to
          the bar definition. Each definition supplies its settings and
          renderer. The scatter plan maps effective X and Y values into points
          and axis geometry. Canvas draws points; SVG draws axes and the brush.
          The bar plan computes category counts, bins, or grouped values; SVG
          draws its bars and axes.
        </p>
        <h2 className="text-xl font-semibold">Interaction and saved state</h2>
        <p className={textClass}>
          A brush or bar selection updates that chart’s filter. Crossfilter then
          updates linked views using their peer-filtered rows. Scatter and bar
          expose their plans to mark-level trace inspectors; this does not apply
          to every chart type.
        </p>
        <p className={textClass}>
          The package can send changed workspace settings through{" "}
          <code>onStateChange</code>. That saved structure includes chart and
          calculation settings, but not the source rows. The host owns durable
          storage and supplies the rows again when it restores the workspace.
        </p>
        <h2 className="text-xl font-semibold">Try the current paths</h2>
        <ul className="list-inside list-disc space-y-2 text-sm">
          <li>
            <DocsLink topic="scatter">
              Scatter fields, brushing, and trace
            </DocsLink>
          </li>
          <li>
            <DocsLink topic="bar">Bar modes, row scope, and trace</DocsLink>
          </li>
          <li>
            <Link
              className="text-primary underline"
              to="?example=scatter-trace"
            >
              Open the 18-row scatter trace example
            </Link>
          </li>
          <li>
            <Link
              className="text-primary underline"
              to="?example=shop-operations"
            >
              Open the order-book bar example
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

export function ChartDocs() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  if (topic === "scatter") return <ScatterPage />;
  if (topic === "bar") return <BarPage />;
  if (topic === "rendering") return <RenderingPage />;
  return <IndexPage />;
}
