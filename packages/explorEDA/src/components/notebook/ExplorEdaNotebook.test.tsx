import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { ExplorEdaNotebook } from "./ExplorEdaNotebook";

const rows = [
  { time: "2021-02-07T00:00:00Z", actual: 50, forecast: 45 },
  { time: "2021-02-08T00:00:00Z", actual: 40, forecast: 48 },
  { time: "2021-02-09T00:00:00Z", actual: 60, forecast: 52 },
];

const TEXT = [
  "# Forecast misses",
  "",
  "Prose with <b>raw html</b> and a [link](https://example.com).",
  "",
  "```eda",
  "calc delta = actual - forecast",
  "```",
  "",
  "```eda",
  'line @delta x=time y=delta title="Actual minus forecast"',
  'table @rows time,delta title="Rows"',
  "```",
].join("\n");

const width = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "clientWidth"
);

beforeAll(() => {
  registerAllCharts();
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  // jsdom has no layout; give the reading column a width.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return 720;
    },
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
  if (width) {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", width);
  }
});

describe("ExplorEdaNotebook", () => {
  it("reads prose and each block's charts in order, in one column", () => {
    const { container } = render(<ExplorEdaNotebook text={TEXT} data={rows} />);
    expect(
      screen.getByRole("heading", { name: "Forecast misses" })
    ).toBeInTheDocument();
    // Raw HTML shows as text, so a notebook can't put markup in the page.
    expect(container.querySelector(".eda-notebook-prose b")).toBeNull();
    expect(container).toHaveTextContent("<b>raw html</b>");
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute(
      "target",
      "_blank"
    );
    expect(container).toHaveTextContent("Defines delta");
    const outputs = [
      ...container.querySelectorAll<HTMLElement>("[data-chart-id]"),
    ].map((item) => item.dataset.chartId);
    expect(outputs).toEqual(["delta", "rows"]);
    // A chart from text can't be deleted or duplicated from its panel.
    expect(
      screen.queryByRole("button", { name: /Delete Actual minus forecast/ })
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: /Duplicate Actual minus forecast/ })
    ).toBeNull();
  });

  it("draws a wrap facet tall enough for every panel, up to a cap", () => {
    const groups = (count: number) =>
      Array.from({ length: count * 2 }, (_, index) => ({
        group: `G${index % count}`,
        x: index,
        y: index * 2,
      }));
    const facet = (count: number) => {
      const { container, unmount } = render(
        <ExplorEdaNotebook
          text={[
            "```eda",
            "line @facet x=x y=y facet.enabled=true facet.type=wrap facet.rowVariable=group facet.columnCount=4",
            "```",
          ].join("\n")}
          data={groups(count)}
        />
      );
      const panel = container.querySelector<HTMLElement>(
        '[data-chart-id="facet"] [role="region"]'
      );
      const height = parseFloat(panel!.style.height);
      unmount();
      return height;
    };
    // 720 pixels fit two 260-pixel columns: six groups make three rows.
    expect(facet(6)).toBe(100 + 3 * 248 - 8 - 12);
    // A facet that fits one row keeps the usual chart height.
    expect(facet(2)).toBe(380 - 12);
    // Past the cap the facet pages instead of growing.
    expect(facet(20)).toBe(1100 - 12);
  });

  it("names a broken block's problem at its file line", () => {
    const broken = TEXT.replace('title="Rows"', 'title="Rows');
    const { container } = render(
      <ExplorEdaNotebook text={broken} data={rows} />
    );
    const block = container.querySelector<HTMLElement>('[data-block="1"]')!;
    expect(block.dataset.status).toBe("invalid");
    expect(within(block).getByRole("alert")).toHaveTextContent(
      "Line 11 This quoted value has no closing quote."
    );
  });

  it("keeps a broken block's last results, frozen, when the host remembers them", () => {
    const memory = { current: {} as Record<number, string> };
    const { container, rerender } = render(
      <ExplorEdaNotebook text={TEXT} data={rows} lastValid={memory} />
    );
    rerender(
      <ExplorEdaNotebook
        text={TEXT.replace('title="Rows"', 'title="Rows')}
        data={rows}
        lastValid={memory}
      />
    );
    const block = container.querySelector<HTMLElement>('[data-block="1"]')!;
    expect(block.dataset.status).toBe("frozen");
    expect(within(block).getByRole("alert")).toHaveTextContent(
      "The results below are from its last version that worked."
    );
    expect(block.querySelectorAll("[data-chart-id]")).toHaveLength(2);
  });

  it("edits a block's text in place and hands on the new notebook text", () => {
    vi.useFakeTimers();
    try {
      const onTextChange = vi.fn();
      render(
        <ExplorEdaNotebook
          text={TEXT}
          data={rows}
          onTextChange={onTextChange}
        />
      );
      const block = screen.getByRole("region", { name: "Block 2" });
      fireEvent.click(
        within(block).getByRole("button", { name: /Edit block/ })
      );
      const editor = screen.getByRole("textbox", { name: "Block 2 text" });
      fireEvent.change(editor, {
        target: {
          value: (editor as HTMLTextAreaElement).value.replace(
            "Actual minus forecast",
            "Signed miss"
          ),
        },
      });
      expect(onTextChange).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(onTextChange).toHaveBeenCalledWith(
        TEXT.replace("Actual minus forecast", "Signed miss")
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows no edit controls without onTextChange", () => {
    render(<ExplorEdaNotebook text={TEXT} data={rows} />);
    expect(screen.queryByRole("button", { name: /Edit/ })).toBeNull();
  });
});

describe("ExplorEdaNotebook sections layout", () => {
  const SECTIONS = [
    "Lede before any section.",
    "",
    "## 1. Actual minus forecast",
    "",
    "Why the gap matters.",
    "",
    "```eda",
    "calc delta = actual - forecast",
    'line @delta x=time y=delta title="Actual minus forecast"',
    "```",
    "",
    "**Finding.** The gap closes.",
    "",
    "## Takeaway",
    "",
    "Short.",
    "",
    "## Limits",
    "",
    "Three rows.",
  ].join("\n");

  function renderAt(px: number) {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return px;
      },
    });
    return render(
      <ExplorEdaNotebook text={SECTIONS} data={rows} layout="sections" />
    );
  }

  it("sets each section's text, finding included, beside its charts", () => {
    const { container } = renderAt(1200);
    const section = container.querySelector<HTMLElement>(
      "#actual-minus-forecast"
    )!;
    expect(section).toHaveClass("eda-notebook-section");
    const notes = section.querySelector(".eda-notebook-notes")!;
    expect(notes).toHaveTextContent("Why the gap matters.");
    expect(notes).toHaveTextContent("Finding. The gap closes.");
    const output = section.querySelector<HTMLElement>(
      ".eda-notebook-figures [data-chart-id='delta']"
    )!;
    // The chart repeats the heading, so its title is not shown twice.
    expect(output.dataset.titleRepeats).toBe("true");
    // Text-only sections in a row share one.
    const closing = container.querySelector(".eda-notebook-closing")!;
    expect(closing).toHaveTextContent("Takeaway");
    expect(closing).toHaveTextContent("Limits");
    expect(container.querySelector(".eda-notebook-intro")).toHaveTextContent(
      "Lede before any section."
    );
  });

  it("gives small multiples the full width, with the section's text above", () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return 1200;
      },
    });
    const text = [
      "## Each month on its own",
      "",
      "One panel per value.",
      "",
      "```eda",
      "line @months x=time y=actual facet.enabled=true facet.type=wrap facet.rowVariable=time facet.columnCount=4",
      "```",
    ].join("\n");
    const { container } = render(
      <ExplorEdaNotebook text={text} data={rows} layout="sections" />
    );
    const section = container.querySelector<HTMLElement>(
      "#each-month-on-its-own"
    )!;
    expect(section).toHaveAttribute("data-wide");
    const panel = section.querySelector<HTMLElement>(
      "[data-chart-id='months'] [role='region']"
    )!;
    // The panel spans the notebook, not the column beside the text.
    expect(parseFloat(panel.style.width)).toBeGreaterThan(1200 - 300 - 40);
  });

  it("keeps the reading column below 960 pixels", () => {
    const { container } = renderAt(720);
    expect(container.querySelector(".eda-notebook-section")).toBeNull();
    expect(container.querySelector("[data-chart-id='delta']")).not.toBeNull();
  });
});

describe("ExplorEdaNotebook sheets", () => {
  const BOOK = [
    "The lede before the sheets.",
    "",
    "```eda",
    "calc delta = actual - forecast",
    "```",
    "",
    "# Two months",
    "",
    "Everything.",
    "",
    "```eda",
    'line @all x=time y=delta title="All"',
    "```",
    "",
    "# The storm",
    "",
    "Just the storm.",
    "",
    "```eda",
    'table @storm time,delta title="Storm rows"',
    "```",
  ].join("\n");

  const chartIds = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLElement>("[data-chart-id]")].map(
      (item) => item.dataset.chartId
    );

  it("reads one sheet at a time, with the lede above the tabs", () => {
    const { container } = render(<ExplorEdaNotebook text={BOOK} data={rows} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      "1Two months",
      "2The storm",
    ]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(chartIds(container)).toEqual(["all"]);
    // The heading is the tab, not a heading repeated in the sheet.
    expect(container.querySelector(".eda-notebook-sheet h1")).toBeNull();
    expect(container.querySelector(".eda-notebook-lede")).toHaveTextContent(
      "The lede before the sheets."
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Everything.");
    fireEvent.click(tabs[1]!);
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(chartIds(container)).toEqual(["storm"]);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Just the storm.");
  });

  it("moves between sheets with the arrow keys", () => {
    render(<ExplorEdaNotebook text={BOOK} data={rows} />);
    const [first, second] = screen.getAllByRole("tab");
    fireEvent.keyDown(first!, { key: "ArrowRight" });
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(second!, { key: "ArrowRight" });
    expect(first).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(first!, { key: "End" });
    expect(second).toHaveAttribute("aria-selected", "true");
  });

  it("follows the sheet prop and reports a choice to the host", () => {
    const onSheetChange = vi.fn();
    const { container } = render(
      <ExplorEdaNotebook
        text={BOOK}
        data={rows}
        sheet="the-storm"
        onSheetChange={onSheetChange}
      />
    );
    expect(screen.getByRole("tab", { name: /The storm/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    fireEvent.click(screen.getByRole("tab", { name: /Two months/ }));
    expect(onSheetChange).toHaveBeenCalledWith("two-months");
    // Controlled: the sheet changes when the host changes the prop.
    expect(chartIds(container)).toEqual(["storm"]);
  });

  it("shows no tabs for a notebook with one title", () => {
    render(<ExplorEdaNotebook text={TEXT} data={rows} />);
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();
  });

  it("keeps a sheet's heading in its editable text, so editing it renames the sheet", () => {
    vi.useFakeTimers();
    try {
      const onTextChange = vi.fn();
      render(
        <ExplorEdaNotebook
          text={BOOK}
          data={rows}
          onTextChange={onTextChange}
        />
      );
      expect(
        screen.getByRole("heading", { level: 1, name: "Two months" })
      ).toBeInTheDocument();
      // The lede's text has the first toggle; the sheet's opening text the next.
      fireEvent.click(screen.getAllByRole("button", { name: /Edit text/ })[1]!);
      const editor = screen.getByRole("textbox", { name: "Markdown text" });
      expect((editor as HTMLTextAreaElement).value).toBe(
        "# Two months\n\nEverything.\n"
      );
      fireEvent.change(editor, {
        target: { value: "# First two months\n\nEverything.\n" },
      });
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(onTextChange).toHaveBeenCalledWith(
        BOOK.replace("# Two months", "# First two months")
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("sets each sheet's sections beside their charts in the sections layout", () => {
    const wide = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "clientWidth"
    );
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return 1200;
      },
    });
    try {
      const text = BOOK.replace("Everything.", "## All hours\n\nEverything.");
      const { container } = render(
        <ExplorEdaNotebook text={text} data={rows} layout="sections" />
      );
      const section = container.querySelector("#all-hours")!;
      expect(section).toHaveClass("eda-notebook-section");
      expect(section.querySelector("[data-chart-id='all']")).not.toBeNull();
      expect(container.querySelector(".eda-notebook-lede")).toHaveTextContent(
        "The lede before the sheets."
      );
    } finally {
      if (wide)
        Object.defineProperty(HTMLElement.prototype, "clientWidth", wide);
    }
  });
});

describe("live findings", () => {
  const fixture = [
    ["r01", "A", "East", 90, true],
    ["r02", "A", "West", 10, true],
    ["r03", "A", "West", 20, true],
    ["r04", "A", "West", 0, true],
    ["r05", "A", "West", null, true],
    ["r06", "B", "East", 80, true],
    ["r07", "B", "East", 70, true],
    ["r08", "B", "West", 5, true],
    ["r09", "B", "West", 0, true],
    ["r10", "B", "East", "bad", true],
    ["r11", "A", "East", 100, false],
    ["r12", "B", "West", 100, false],
  ].map(([key, group, region, score, active]) => ({
    key,
    group,
    region,
    score,
    active,
  }));
  // Findings come before the charts they follow, in an earlier block.
  const notebook = (select = "") =>
    [
      "Selected {{n}} rows; the average is {{mean}}. [Show records](#finding:mean).",
      "",
      "Literal: `{{n}}`, \\{{n}}, [a link](https://example.com/?q={{n}}). Broken: {{broken}} and {{nothing}}.",
      "",
      "```eda",
      "finding @n count chart=@regions",
      "finding @mean average score chart=@regions digits=2",
      "finding @broken count chart=@nope",
      "```",
      "",
      "```eda",
      "field score as=numeric",
      `row region @regions where.active=true ${select}`,
      "row group @groups select.group=A",
      "```",
    ].join("\n");
  const value = (container: HTMLElement, name: string) =>
    container.querySelector(`[data-finding="${name}"]`);

  it("shows each value from its chart's selection, and keeps literal text literal", () => {
    const { container } = render(
      <ExplorEdaNotebook text={notebook()} data={fixture} />
    );
    // The groups chart selects A, but n follows only @regions.
    expect(value(container, "n")).toHaveTextContent(/^10$/);
    expect(value(container, "mean")).toHaveTextContent(/^34\.38$/);
    expect(value(container, "broken")).toHaveAttribute(
      "data-unavailable",
      "missing"
    );
    expect(value(container, "nothing")).toHaveTextContent("unknown finding");
    expect(container).toHaveTextContent("nope is not a chart");
    expect(container.querySelector("code")).toHaveTextContent("{{n}}");
    expect(container).toHaveTextContent("Literal: {{n}}, {{n}}");
    expect(container.querySelectorAll("[data-finding]")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "a link" })).toHaveAttribute(
      "href",
      "https://example.com/?q=%7B%7Bn%7D%7D"
    );
  });

  it("updates values in place and opens the exact records", () => {
    const { container, rerender } = render(
      <ExplorEdaNotebook text={notebook()} data={fixture} />
    );
    const link = screen.getByRole("link", { name: "Show records" });
    link.focus();
    rerender(
      <ExplorEdaNotebook text={notebook("select.region=East")} data={fixture} />
    );
    // The paragraph is the same element, so focus stays on its link.
    expect(screen.getByRole("link", { name: "Show records" })).toBe(link);
    expect(document.activeElement).toBe(link);
    expect(value(container, "n")).toHaveTextContent(/^4$/);
    expect(value(container, "mean")).toHaveTextContent(/^80\.00$/);

    fireEvent.click(link);
    const records = screen.getByRole("dialog", { name: "Records for mean" });
    const rows = within(records).getAllByRole("row").slice(1);
    // East's four rows, by source row ID; r10 is read but not used.
    expect(rows.map((row) => row.cells[0]!.textContent)).toEqual([
      "0",
      "5",
      "6",
      "9",
    ]);
    expect(
      rows.at(-1)!.cells.item(rows.at(-1)!.cells.length - 1)
    ).not.toHaveTextContent("Yes");
  });
});
