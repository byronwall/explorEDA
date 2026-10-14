// @vitest-environment node
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cleanConfig, configDir, globalConfigStore } from "./globalConfig";

describe("global config", () => {
  it("lives in the platform's config folder", () => {
    expect(configDir({ XDG_CONFIG_HOME: "/x" }, "linux")).toBe("/x/exploreda");
    expect(
      configDir({ APPDATA: "C:\\Users\\a\\AppData\\Roaming" }, "win32")
    ).toMatch(/exploreda$/);
  });

  it("keeps only known preferences", async () => {
    expect(cleanConfig({ theme: "neon", token: "x" })).toEqual({
      theme: "system",
    });
    const directory = mkdtempSync(path.join(tmpdir(), "exploreda-config-"));
    const store = globalConfigStore(directory);
    expect(await store.read()).toEqual({ theme: "system" });
    expect(await store.write({ theme: "dark" })).toEqual({ theme: "dark" });
    expect(
      JSON.parse(readFileSync(path.join(directory, "config.json"), "utf8"))
    ).toEqual({
      theme: "dark",
    });
  });
});
