import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddData, fetchedLabel, uploadPath } from "./AddData";

describe("AddData", () => {
  it("uploads a new file straight away into data/", async () => {
    const onUpload = vi.fn(async () => {});
    render(<AddData existing={[]} onUpload={onUpload} onFetch={vi.fn()} />);
    const file = new File(["id\n1\n"], "Q3 sales.csv", { type: "text/csv" });
    fireEvent.change(
      screen.getByLabelText("Upload a CSV, JSON, or SQLite file"),
      {
        target: { files: [file] },
      }
    );
    expect(onUpload).toHaveBeenCalledWith(file, "data/Q3-sales.csv");
  });

  it("asks before replacing a file of the same name", async () => {
    const onUpload = vi.fn(async () => {});
    render(
      <AddData
        existing={["data/orders.csv"]}
        onUpload={onUpload}
        onFetch={vi.fn()}
      />
    );
    const file = new File(["id\n1\n"], "orders.csv");
    fireEvent.change(
      screen.getByLabelText("Upload a CSV, JSON, or SQLite file"),
      {
        target: { files: [file] },
      }
    );
    expect(onUpload).not.toHaveBeenCalled();
    expect(screen.getByText(/data\/orders.csv is already here/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(onUpload).toHaveBeenCalledWith(file, "data/orders.csv");
  });

  it("asks the server to download an address", async () => {
    const onFetch = vi.fn(async () => {});
    render(<AddData existing={[]} onUpload={vi.fn()} onFetch={onFetch} />);
    fireEvent.change(screen.getByLabelText("Or download from an address"), {
      target: { value: " https://reports.example.com/orders.csv " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(onFetch).toHaveBeenCalledWith(
      "https://reports.example.com/orders.csv"
    );
  });
});

describe("helpers", () => {
  it("names uploads safely and labels fetch times", () => {
    expect(uploadPath("../evil name.csv")).toBe("data/..-evil-name.csv");
    const now = new Date("2026-10-13T15:00:00");
    expect(
      fetchedLabel(
        { url: "x", bytes: 1, fetchedAt: "2026-10-01T09:00:00" },
        now
      )
    ).toMatch(/^fetched Oct 1$/);
  });
});
