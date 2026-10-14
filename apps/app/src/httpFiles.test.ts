import { afterEach, describe, expect, it, vi } from "vitest";
import { httpProjectFiles, takeToken, teamProjectFiles } from "./httpFiles";

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("httpProjectFiles", () => {
  it("sends the run's key and reads a file", async () => {
    const fetch = vi.fn(async () => new Response("id\n1\n"));
    vi.stubGlobal("fetch", fetch);
    const files = httpProjectFiles("key");
    expect(await files.read("data/a b.csv")).toBe("id\n1\n");
    expect(fetch).toHaveBeenCalledWith("/api/file?path=data%2Fa%20b.csv", {
      headers: { "x-exploreda-token": "key" },
    });
  });

  it("turns a 404 into a missing-file error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ code: "missing", error: "gone" }), {
            status: 404,
          })
      )
    );
    await expect(httpProjectFiles("key").read("x.csv")).rejects.toMatchObject({
      code: "missing",
      path: "x.csv",
      message: "gone",
    });
  });
});

describe("teamProjectFiles", () => {
  it("reads under the project's path and names this page on a save", async () => {
    const fetch = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    const files = teamProjectFiles("shop", "page-1");
    await files.write("a.eda", "eda\n");
    expect(fetch).toHaveBeenCalledWith("/api/projects/shop/file?path=a.eda", {
      method: "PUT",
      body: "eda\n",
      headers: { "x-exploreda-client": "page-1" },
    });
  });

  it("keeps the theme in this browser", async () => {
    const files = teamProjectFiles("shop", "page-1");
    expect(await files.config()).toEqual({ theme: "system" });
    await files.setConfig({ theme: "dark" });
    expect(await files.config()).toEqual({ theme: "dark" });
    localStorage.clear();
  });
});

describe("takeToken", () => {
  it("keeps the link's key for the tab and removes it from the address", () => {
    window.history.replaceState(null, "", "/?token=abc");
    expect(takeToken()).toBe("abc");
    expect(window.location.search).toBe("");
    expect(takeToken()).toBe("abc");
  });
});
