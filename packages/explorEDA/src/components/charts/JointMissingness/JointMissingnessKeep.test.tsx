import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { ExplorEdaNotebook } from "@/components/notebook/ExplorEdaNotebook";

const rows = [
  { x: null, y: null, z: 1 },
  { x: null, y: 2, z: 3 },
  { x: 1, y: 2, z: 3 },
  { x: 1, y: 2, z: 3 },
];

const TEXT = [
  "# Gaps",
  "",
  "```eda",
  "chart joint-missingness @gaps fields[]=x,y,z",
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

/** A host that echoes each text change back, as a real app does. */
function Host({ onText }: { onText: (text: string) => void }) {
  const [text, setText] = useState(TEXT);
  return (
    <ExplorEdaNotebook
      text={text}
      data={rows}
      onTextChange={(next) => {
        onText(next);
        setText(next);
      }}
    />
  );
}

describe("Keep selection", () => {
  it("writes the selection into the text only on Keep", async () => {
    const onText = vi.fn();
    render(<Host onText={onText} />);
    const pattern = await screen.findByRole("button", {
      name: "x + y: 1 rows, 25.0%",
    });
    expect(screen.queryByRole("button", { name: "Keep selection" })).toBeNull();

    fireEvent.click(pattern);
    expect(onText).not.toHaveBeenCalled();
    expect(screen.getByText("Unkept changes")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Keep selection" }));
    expect(onText).toHaveBeenCalledTimes(1);
    const kept = onText.mock.calls[0]![0] as string;
    expect(kept).toContain("patterns.0[]=x,y");
    // After the host echoes the text back, the selection reads as kept.
    expect(screen.queryByText("Unkept changes")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^x: 1 rows/ }));
    expect(screen.getByText("Unkept changes")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset to kept" }));
    expect(screen.queryByText("Unkept changes")).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "x + y: 1 rows, 25.0%" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    expect(onText).toHaveBeenCalledTimes(1);
  });
});
