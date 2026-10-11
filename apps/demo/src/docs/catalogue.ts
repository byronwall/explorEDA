import {
  BarChart3,
  ScatterChart,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { MDXContent } from "mdx/types";
import barImage from "./assets/bar-example.jpg";
import scatterImage from "./assets/scatter-trace.jpg";
import type { DocsTarget } from "./targets";

export type DocsGroup = "plots" | "guides";

export const GROUP_LABELS: Record<DocsGroup, string> = {
  plots: "Plots",
  guides: "Shared guides",
};

export type DocsExample = {
  /** An id from `demos/examples.ts`. */
  id: string;
  heading: string;
  meta: string;
  label: string;
};

export type DocsPage = {
  topic: string;
  title: string;
  group: DocsGroup;
  icon: LucideIcon;
  /** The page's eyebrow above its title. */
  eyebrow: string;
  /** One sentence under the title. */
  lede: string;
  /** One sentence on the index card. */
  summary: string;
  /** Short labels on the index card. */
  highlights: readonly string[];
  image?: { src: string; alt: string };
  /** The coverage targets this page documents. */
  covers: readonly DocsTarget[];
  /** The chart type the page is about, which each example must show. */
  chartType?: string;
  examples: readonly DocsExample[];
  related: readonly string[];
};

export const catalogue: readonly DocsPage[] = [
  {
    topic: "scatter",
    title: "Scatter plot",
    group: "plots",
    icon: ScatterChart,
    eyebrow: "Chart guide",
    lede: "Compare two fields across rows. Use the pattern to spot relationships, clusters, and unusual records.",
    summary:
      "Compare two fields row by row, brush a range, and trace a point back to its source values.",
    highlights: ["Brushing", "Point trace", "Calculated axes"],
    image: {
      src: scatterImage,
      alt: "Scatter plot of net sales against contribution with a trace panel open.",
    },
    covers: ["chart:scatter", "interaction:brushing"],
    chartType: "scatter",
    examples: [
      {
        id: "scatter-trace",
        heading: "Trace a scatter point",
        meta: "18 orders · 4 views · calculated axes",
        label: "Open the scatter trace example",
      },
    ],
    related: ["bar", "rendering"],
  },
  {
    topic: "bar",
    title: "Bar chart",
    group: "plots",
    icon: BarChart3,
    eyebrow: "Chart guide",
    lede: "Compare categories or group a numeric measure. The selected operation determines what each bar means.",
    summary:
      "Compare category counts, numeric bins, or a grouped measure, and filter by clicking or dragging.",
    highlights: ["Category counts", "Numeric bins", "Grouped summaries"],
    image: {
      src: barImage,
      alt: "Order-book workspace with a delivery-time histogram and a regional bar chart.",
    },
    covers: ["chart:bar", "interaction:cross-filter"],
    chartType: "bar",
    examples: [
      {
        id: "shop-operations",
        heading: "Inside the order book",
        meta: "500 orders · 7 linked views",
        label: "Open the order-book example",
      },
    ],
    related: ["scatter", "rendering"],
  },
  {
    topic: "rendering",
    title: "How rendering works",
    group: "guides",
    icon: Workflow,
    eyebrow: "Shared guide",
    lede: "Follow one order through the host app, data layer, chart definitions, and saved settings.",
    summary:
      "Follow one order from its raw row through calculations, filters, chart plans, drawing, and saved settings.",
    highlights: [],
    covers: [],
    examples: [
      {
        id: "scatter-trace",
        heading: "Trace a scatter point",
        meta: "Follow T-001 in the live workspace",
        label: "Open the scatter trace example",
      },
    ],
    related: ["scatter", "bar"],
  },
];

/** Each page's MDX, loaded when the page opens. */
export const pageModules = import.meta.glob<{ default: MDXContent }>(
  "./pages/*.mdx"
);

export function pageModulePath(topic: string) {
  return `./pages/${topic}.mdx`;
}

export function findPage(topic: string) {
  return catalogue.find((page) => page.topic === topic);
}
