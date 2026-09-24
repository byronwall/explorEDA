import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { ChartTraceControl } from "./ChartTraceControl";

it("opens for a selection and clears when the popover closes", async () => {
  const onClear = vi.fn();
  function Harness() {
    const [selected, setSelected] = useState(false);
    return (
      <>
        <button onClick={() => setSelected(true)}>Select</button>
        <ChartTraceControl
          selection={selected ? { id: "point" } : null}
          onClear={onClear}
        >
          <div>Details</div>
        </ChartTraceControl>
      </>
    );
  }
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: "Select" }));
  expect(
    await screen.findByLabelText("Chart trace inspector")
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Trace chart objects" }));
  expect(onClear).toHaveBeenCalledOnce();
});
