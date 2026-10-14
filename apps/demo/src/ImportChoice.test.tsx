import { fireEvent, render, screen } from "@testing-library/react";
import type { TableFile } from "exploreda/readers";
import { describe, expect, it, vi } from "vitest";
import { LARGE_TABLE_ROWS, useImportChoice } from "./ImportChoice";

const table = (rows: number): TableFile => ({
  name: "trips",
  format: "parquet",
  rows: Array.from({ length: rows }, () => ({})),
  fields: [],
  fieldTypes: {},
  notes: [],
});

function Harness({
  rows,
  onOpen,
}: {
  rows: number;
  onOpen: (table: TableFile) => void;
}) {
  const choice = useImportChoice(onOpen, () => {});
  return (
    <>
      <button
        onClick={() =>
          choice.offer(new File([""], "trips.parquet"), table(rows))
        }
      >
        Offer
      </button>
      {choice.prompt}
    </>
  );
}

describe("useImportChoice", () => {
  it("opens an ordinary table right away", () => {
    const onOpen = vi.fn();
    render(<Harness rows={10} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Offer" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("asks before opening a very large table", () => {
    const onOpen = vi.fn();
    render(<Harness rows={LARGE_TABLE_ROWS + 1} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Offer" }));
    expect(onOpen).not.toHaveBeenCalled();
    const notice = screen.getByRole("group", { name: "Open trips.parquet?" });
    expect(notice).toHaveTextContent("500,001 rows");
    expect(screen.getByRole("button", { name: "Open all rows" })).toHaveFocus();
    fireEvent.keyDown(notice, { key: "Escape" });
    expect(screen.queryByRole("group")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Offer" }));
    fireEvent.click(screen.getByRole("button", { name: "Open all rows" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
