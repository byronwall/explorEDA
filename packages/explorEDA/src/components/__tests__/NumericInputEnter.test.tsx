import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { NumericInputEnter } from "../NumericInputEnter";

it("reflects a settings reset and restores the last valid value on blur", () => {
  const onChange = vi.fn();
  const { rerender } = render(
    <NumericInputEnter value={2} onChange={onChange} min={0} max={10} />
  );
  const input = screen.getByRole("spinbutton");
  fireEvent.change(input, { target: { value: "4" } });
  expect(onChange).toHaveBeenCalledWith(4);
  rerender(
    <NumericInputEnter value={1} onChange={onChange} min={0} max={10} />
  );
  expect(input).toHaveValue(1);
  onChange.mockClear();
  fireEvent.change(input, { target: { value: "99" } });
  fireEvent.blur(input);
  expect(input).toHaveValue(1);
  expect(onChange).not.toHaveBeenCalled();
});
