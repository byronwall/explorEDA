import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Chart, ChartSettings, type ChartConfig } from "./index";
import { SAMPLE_ROWS } from "./samples";

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const BAR: ChartConfig = { type: "bar", field: "Region" };
const colorSwitch = () =>
  screen.getByRole("switch", { name: /use as color field/i });

/** A host that keeps the config in state, as the docs tell it to. */
function Host({ onChange }: { onChange: (config: ChartConfig) => void }) {
  const [config, setConfig] = useState(BAR);
  return (
    <ChartSettings
      data={SAMPLE_ROWS}
      config={config}
      onConfigChange={(next) => {
        onChange(next);
        setConfig(next);
      }}
    />
  );
}

describe("editing a standalone chart", () => {
  it("reports one whole config per edit and keeps it once passed back", async () => {
    const onChange = vi.fn();
    render(<Host onChange={onChange} />);
    expect(colorSwitch()).toHaveAttribute("aria-checked", "false");
    act(() => fireEvent.click(colorSwitch()));
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0]![0] as Record<string, unknown>;
    expect(next).toMatchObject({
      type: "bar",
      field: "Region",
      colorField: "Region",
    });
    expect(next).not.toHaveProperty("filters");
    expect(next).not.toHaveProperty("colorScaleId");
    expect(colorSwitch()).toHaveAttribute("aria-checked", "true");
  });

  it("goes back to config when the host does not pass the edit back", async () => {
    const onChange = vi.fn();
    render(
      <ChartSettings
        data={SAMPLE_ROWS}
        config={BAR}
        onConfigChange={onChange}
      />
    );
    act(() => fireEvent.click(colorSwitch()));
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(colorSwitch()).toHaveAttribute("aria-checked", "false");
  });

  it("offers only the host's fields, plus those the config uses", async () => {
    render(
      <ChartSettings
        data={SAMPLE_ROWS}
        config={BAR}
        onConfigChange={() => {}}
        fields={["Product", "Price"]}
      />
    );
    act(() =>
      fireEvent.click(screen.getByRole("combobox", { name: /chart field/i }))
    );
    const list = await screen.findByRole("listbox");
    const options = within(list)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(options).toEqual(
      expect.arrayContaining(["Product", "Price", "Region"])
    );
    expect(options).not.toContain("Rating");
  });

  it("shows a settings button only when editing is on", () => {
    const { rerender } = render(
      <Chart data={SAMPLE_ROWS} config={BAR} width={300} height={200} />
    );
    expect(screen.queryByRole("button", { name: /configure/i })).toBeNull();
    rerender(
      <Chart
        data={SAMPLE_ROWS}
        config={BAR}
        onConfigChange={() => {}}
        width={300}
        height={200}
      />
    );
    expect(screen.getByRole("button", { name: /configure/i })).toBeTruthy();
  });
});
