// @vitest-environment node
import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXAMPLES } from "./examples";

const examplesDir = path.resolve(__dirname, "../../examples");

describe("exploreda --example", () => {
  it("copies a project folder for every sample name", () => {
    for (const { from } of Object.values(EXAMPLES)) {
      expect(readdirSync(path.join(examplesDir, from))).toContain(
        "exploreda.eda"
      );
    }
  });

  it("has a sample with a notebook", () => {
    expect(
      readdirSync(path.join(examplesDir, EXAMPLES.forecast.from))
    ).toContain("forecast.eda.md");
  });
});
