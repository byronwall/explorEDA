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

  it("keeps the reading column below 960 pixels", () => {
    const { container } = renderAt(720);
    expect(container.querySelector(".eda-notebook-section")).toBeNull();
    expect(container.querySelector("[data-chart-id='delta']")).not.toBeNull();
  });
});
