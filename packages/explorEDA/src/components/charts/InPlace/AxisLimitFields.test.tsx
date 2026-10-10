import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AxisLimitFields } from "./AxisLimitFields";

function setup(limits?: { min?: number; max?: number }) {
  const onChange = vi.fn();
  const view = render(
    <AxisLimitFields axisName="X" limits={limits} onChange={onChange} />
  );
  return {
    onChange,
    view,
    min: screen.getByRole("textbox", { name: "X minimum" }),
    max: screen.getByRole("textbox", { name: "X maximum" }),
  };
}

it("applies each valid limit as it is typed", () => {
  const { onChange, min, max } = setup();
  fireEvent.change(min, { target: { value: "2" } });
  expect(onChange).toHaveBeenLastCalledWith({ min: 2 });
  fireEvent.change(max, { target: { value: "8.5" } });
  expect(onChange).toHaveBeenLastCalledWith({ min: 2, max: 8.5 });
  fireEvent.change(min, { target: { value: "" } });
  expect(onChange).toHaveBeenLastCalledWith({ max: 8.5 });
});

it("holds drafts that cannot apply and says why", () => {
  const { onChange, min, max } = setup({ max: 10 });
  fireEvent.change(min, { target: { value: "-" } });
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "The minimum must be a number."
  );
  fireEvent.change(min, { target: { value: "12" } });
  expect(onChange).not.toHaveBeenCalled();
  expect(min).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("alert")).toHaveTextContent(
    "The minimum must be below the maximum."
  );
  // Leaving the field returns it to the range the chart shows.
  fireEvent.blur(min);
  expect(min).toHaveValue("");
  expect(max).toHaveValue("10");
});

it("follows outside changes and resets both limits", () => {
  const { onChange, view, max } = setup({ min: 1, max: 4 });
  view.rerender(
    <AxisLimitFields
      axisName="X"
      limits={{ min: 1, max: 6 }}
      onChange={onChange}
    />
  );
  expect(max).toHaveValue("6");
  fireEvent.click(screen.getByRole("button", { name: "Reset the X range" }));
  expect(onChange).toHaveBeenLastCalledWith(undefined);
});
