import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { describeChange } from "../App";
import { TeamApp } from "./TeamApp";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const ana = {
  id: "1",
  email: "ana@example.com",
  name: "Ana",
  kind: "author",
  admin: false,
  disabled: false,
};

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("TeamApp", () => {
  it("signs in and lists the projects shared with the account", async () => {
    let signedIn = false;
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/session" && init?.method === "POST") {
        expect(JSON.parse(String(init.body))).toEqual({
          email: "ana@example.com",
          password: "correct horse",
        });
        signedIn = true;
        return json({ account: ana });
      }
      if (url === "/api/session") {
        return signedIn
          ? json({ account: ana })
          : json({ error: "Sign in to continue." }, 401);
      }
      if (url === "/api/projects") {
        return json([
          { id: "shop", name: "Shop orders", role: "author" },
          { id: "ops", name: "Operations", role: "viewer" },
        ]);
      }
      return json({ error: "no" }, 404);
    });
    vi.stubGlobal("fetch", fetch);
    render(<TeamApp />);
    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct horse" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      (await screen.findByRole("button", { name: /Shop orders/ })).textContent
    ).toContain("You can edit");
    expect(
      screen.getByRole("button", { name: /Operations/ }).textContent
    ).toContain("You can view");
    expect(screen.getByText("ana@example.com")).toBeTruthy();
  });

  it("shows the server's reason when a sign-in fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) =>
        init?.method === "POST"
          ? json({ error: "That email and password don't match." }, 401)
          : json({ error: "Sign in to continue." }, 401)
      )
    );
    render(<TeamApp />);
    fireEvent.change(await screen.findByLabelText("Email"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect((await screen.findByRole("alert")).textContent).toBe(
      "That email and password don't match."
    );
  });
});

describe("describeChange", () => {
  it("names the person whose save changed the files", () => {
    expect(describeChange(["revenue.eda"], "Ana")).toBe(
      "Ana changed revenue.eda, so the project reloaded."
    );
    expect(describeChange(["a.eda", "b.eda"])).toBe(
      "a.eda and 1 other file changed on disk, so the project reloaded."
    );
  });
});
