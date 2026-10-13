import { afterEach, describe, expect, it, vi } from "vitest";
import { httpProjectFiles, takeToken } from "./httpFiles";

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

describe("takeToken", () => {
  it("keeps the link's key for the tab and removes it from the address", () => {
    window.history.replaceState(null, "", "/?token=abc");
    expect(takeToken()).toBe("abc");
    expect(window.location.search).toBe("");
    expect(takeToken()).toBe("abc");
  });
});
