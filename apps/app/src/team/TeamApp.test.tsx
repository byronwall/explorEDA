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
      if (url === "/api/setup") {
        return json({ needed: false });
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
      vi.fn(async (url: string, init?: RequestInit) =>
        url === "/api/setup"
          ? json({ needed: false })
          : init?.method === "POST"
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

describe("first run and links", () => {
  it("asks for the admin account on a new server", async () => {
    let created = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === "/api/setup" && init?.method === "POST") {
          expect(JSON.parse(String(init.body))).toEqual({
            name: "Ana",
            email: "ana@example.com",
            password: "correct horse",
          });
          created = true;
          return json({ account: { ...ana, admin: true } });
        }
        if (url === "/api/setup") {
          return json({ needed: !created });
        }
        if (url === "/api/session") {
          return created
            ? json({ account: { ...ana, admin: true } })
            : json({ error: "Sign in to continue." }, 401);
        }
        return json([]);
      })
    );
    render(<TeamApp />);
    fireEvent.change(await screen.findByLabelText("Your name"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: "correct horse" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Create admin account" })
    );
    expect(await screen.findByRole("button", { name: "People" })).toBeTruthy();
    expect(screen.getByText(/No projects yet/)).toBeTruthy();
  });

  it("sets a password from a link and signs in", async () => {
    window.history.replaceState(null, "", "/?link=abc");
    let used = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === "/api/password-link?secret=abc") {
          return json({ email: "vic@example.com", name: "Vic" });
        }
        if (url === "/api/password-link") {
          expect(JSON.parse(String(init?.body))).toEqual({
            secret: "abc",
            password: "correct horse",
          });
          used = true;
          return json({ account: { ...ana, name: "Vic", kind: "viewer" } });
        }
        if (url === "/api/session") {
          return used
            ? json({ account: { ...ana, name: "Vic", kind: "viewer" } })
            : json({ error: "Sign in to continue." }, 401);
        }
        return json([]);
      })
    );
    render(<TeamApp />);
    expect(await screen.findByText("vic@example.com")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/^New password/), {
      target: { value: "correct horse" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Set password and sign in" })
    );
    expect(await screen.findByText(/No projects are shared/)).toBeTruthy();
    expect(window.location.search).toBe("");
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
