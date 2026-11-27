import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExplorEdaProject } from "@/components/ExplorEdaProject";
import { QuerySummary } from "@/components/QuerySummary";
import {
  memoryProjectFiles,
  readAnalysisText,
  readProjectFolder,
} from "@/lib/project";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              target,
              contentRect: { width: 1200 } as DOMRectReadOnly,
            } as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.unstubAllGlobals());

// Codes look like numbers but are declared text, as a run ID is.
const PROJECT = `project @shop

source @items key=code path=data/items.csv {
  field code "Item code" string
  field qty "Quantity" number
  field sold "Sold on" date
}
`;
const ITEMS =
  "code,qty,sold\n101,2,2025-01-03\n102,3,2025-01-04\n103,,2025-01-09\n";

/**
 * Each field's summary line: its name, type, range, and missing count. A
 * workspace also names the source a field comes from; the card names it once.
 */
const fieldLines = (container: HTMLElement) =>
  [...container.querySelectorAll(".eda-summary-table [aria-label]")]
    .map((element) => element.getAttribute("aria-label")!.split("; from ")[0]!)
    .filter((label) => /: (Text|Number|Date)/.test(label))
    .sort();

it("describes a query's fields as a view of that query does", async () => {
  const folder = await readProjectFolder(
    memoryProjectFiles({ "exploreda.eda": PROJECT, "data/items.csv": ITEMS })
  );
  const { project, tables } = folder;

  const card = render(
    <QuerySummary
      project={project}
      tables={tables}
      queryId="items"
      height={400}
    />
  );
  const summary = fieldLines(card.container);
  expect(summary).toHaveLength(3);
  expect(summary.find((line) => line.startsWith("Item code"))).toMatch(
    /^Item code: Text/
  );
  card.unmount();

  const settings = readAnalysisText("summary @fields title=Fields\n", {
    project,
    tables,
    defaultQueryId: "items",
  }).views[0]!.settings;
  const view = render(
    <ExplorEdaProject
      project={project}
      tables={tables}
      view={{ id: "items", name: "Items", queryId: "items", settings }}
      onProjectChange={vi.fn()}
    />
  );
  await waitFor(() => expect(fieldLines(view.container)).toHaveLength(3));
  expect(fieldLines(view.container)).toEqual(summary);
});
