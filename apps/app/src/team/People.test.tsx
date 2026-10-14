import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { People } from "./People";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const ana = {
  id: "1",
  email: "ana@example.com",
  name: "Ana",
  kind: "author" as const,
  admin: true,
  disabled: false,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("People", () => {
  it("adds a person and shows the link to send them", async () => {
    const accounts = [ana];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === "/api/accounts" && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          expect(body).toEqual({
            name: "Vic",
            email: "vic@example.com",
            kind: "viewer",
            admin: false,
          });
          const account = { ...ana, id: "2", ...body };
          accounts.push(account);
          return json({ account, secret: "s3cret" });
        }
        return json(accounts);
      })
    );
    render(<People self={ana} />);
    expect(await screen.findByText("Ana")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Vic" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "vic@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add person" }));
    const link = (await screen.findByLabelText(
      "Password link for Vic"
    )) as HTMLInputElement;
    expect(link.value).toBe(`${window.location.origin}/?link=s3cret`);
    expect(await screen.findByText("vic@example.com")).toBeTruthy();
    // You can't turn off your own account.
    const own = screen.getAllByRole("button", { name: "Disable" })[0]!;
    expect((own as HTMLButtonElement).disabled).toBe(true);
  });
});
