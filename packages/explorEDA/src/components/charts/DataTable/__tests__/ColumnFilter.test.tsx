import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ColumnFilter } from "../components/ColumnFilter";

describe("ColumnFilter", () => {
  const mockProps = {
    columnId: "name",
    columnLabel: "Name",
    value: "",
    operator: "contains" as const,
    onChange: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders filter input and operator select", () => {
    render(<ColumnFilter {...mockProps} />);

    expect(screen.getByPlaceholderText("Filter Name...")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onChange when filter value changes", () => {
    render(<ColumnFilter {...mockProps} />);

    const input = screen.getByPlaceholderText("Filter Name...");
    fireEvent.change(input, { target: { value: "John" } });

    expect(mockProps.onChange).toHaveBeenCalledWith("name", "John", "contains");
  });

  it("calls onChange when operator changes", async () => {
    render(<ColumnFilter {...mockProps} />);

    const select = screen.getByRole("combobox");
    fireEvent.click(select);
    fireEvent.click(await screen.findByText("Equals"));

    expect(mockProps.onChange).toHaveBeenCalledWith("name", "", "equals");
  });

  it("calls onClear when clear button is clicked", () => {
    render(<ColumnFilter {...mockProps} />);

    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockProps.onClear).toHaveBeenCalled();
  });

  it("displays current value and operator", () => {
    render(<ColumnFilter {...mockProps} value="John" operator="equals" />);

    const input = screen.getByPlaceholderText("Filter Name...");
    const select = screen.getByRole("combobox");

    expect(input).toHaveValue("John");
    expect(select).toHaveTextContent("Equals");
  });
});
