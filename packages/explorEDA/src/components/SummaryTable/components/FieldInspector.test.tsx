import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { FieldInspector } from "./FieldInspector";

describe("FieldInspector", () => {
  it("previews failed conversions and applies a type override", async () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(
      <DataLayerProvider
        data={[{ revenue: "12.5" }, { revenue: "bad" }]}
        charts={[]}
      >
        <FieldInspector field="revenue" open onOpenChange={vi.fn()} />
      </DataLayerProvider>
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Type override" }));
    fireEvent.click(await screen.findByRole("option", { name: "numeric" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Apply field settings" })
    );

    expect(await screen.findByText(/Effective:/)).toHaveTextContent("numeric");
    expect(screen.getByText(/1 failed/)).toBeInTheDocument();
    expect(
      screen.getByText(/Invalid values become missing/)
    ).toBeInTheDocument();
  });
});
