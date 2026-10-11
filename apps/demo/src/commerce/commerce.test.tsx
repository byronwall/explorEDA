import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { commercePath } from "./paths";
import { LicenseQuiz } from "./LicenseQuiz";
import { PricingPage } from "./PricingPage";
import { LegalPage } from "./LegalPage";

describe("pricing and license pages", () => {
  it("recognizes its paths, with or without a trailing slash", () => {
    expect(commercePath("/pricing")).toBe("/pricing");
    expect(commercePath("/legal/terms/")).toBe("/legal/terms");
    expect(commercePath("/legal/nothing")).toBeNull();
    expect(commercePath("/")).toBeNull();
  });

  it("asks for a quote instead of checkout when Paddle isn't set up", () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("link", { name: "Request an invoice" })
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Buy now" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "One more developer" }));
    expect(screen.getByText("$998")).toBeTruthy();
  });

  it("routes large orders to a quote", () => {
    render(
      <MemoryRouter>
        <PricingPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText("Number of developers"), {
      target: { value: "12" },
    });
    expect(
      screen.getByRole("link", { name: "Request a quote for 12 developers" })
    ).toBeTruthy();
  });

  it("tells a small team it's free and a larger company it needs a license", () => {
    render(
      <MemoryRouter>
        <LicenseQuiz />
      </MemoryRouter>
    );
    const answer = (index: number, value: "Yes" | "No") =>
      fireEvent.click(screen.getAllByRole("radio", { name: value })[index]!);
    answer(0, "No");
    answer(1, "No");
    answer(2, "Yes");
    expect(screen.getByText("You can use explorEDA free.")).toBeTruthy();
    answer(2, "No");
    expect(screen.getByText("You need a commercial license")).toBeTruthy();
  });

  it("renders legal pages from the repository files, without editor notes", () => {
    const { container } = render(
      <MemoryRouter>
        <LegalPage path="/legal/refunds" />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Refund policy" })).toBeTruthy();
    expect(container.innerHTML).not.toContain("DRAFT");
    expect(container.innerHTML).not.toContain("version:");
  });
});
