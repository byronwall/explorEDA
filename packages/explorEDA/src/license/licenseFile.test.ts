import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

it("ships the same LICENSE as the repository root", () => {
  const packageDir = path.resolve(__dirname, "../..");
  expect(readFileSync(path.join(packageDir, "LICENSE"), "utf8")).toBe(
    readFileSync(path.join(packageDir, "../../LICENSE"), "utf8")
  );
});
