import { coverageFeatures, exampleCoverage } from "@/demos/coverage";
import { examples } from "@/demos/examples";
import type { DocsPage } from "./catalogue";

const MAX = 3;

/**
 * Full examples for a page's right rail. A chart page lists the examples
 * that draw its chart type, most focused first (fewest chart types), so
 * a broad dashboard such as the order book stops leading every page. The
 * page's own picks break ties. With none, the rail shows no example
 * rather than an unrelated one. Other pages keep their own picks.
 */
export function railExamples(
  page: Pick<DocsPage, "chartType" | "examples">
): typeof examples {
  const byId = (id: string) => examples.find((item) => item.id === id);
  if (!page.chartType) {
    return page.examples.flatMap((id) => byId(id) ?? []);
  }
  const feature = coverageFeatures.find(
    (item) => "chartType" in item && item.chartType === page.chartType
  )?.id;
  if (!feature) return [];
  const chartCount = (features: object) =>
    Object.keys(features).filter((id) => id.startsWith("chart:")).length;
  return exampleCoverage
    .filter((entry) => feature in entry.features)
    .flatMap((entry) => {
      const example = byId(entry.exampleId);
      // Unlisted examples include test fixtures, so only a page's own
      // picks may be unlisted.
      return example && (example.listed || page.examples.includes(example.id))
        ? [{ example, focus: chartCount(entry.features) }]
        : [];
    })
    .sort(
      (a, b) =>
        a.focus - b.focus ||
        Number(page.examples.includes(b.example.id)) -
          Number(page.examples.includes(a.example.id))
    )
    .slice(0, MAX)
    .map(({ example }) => example);
}
