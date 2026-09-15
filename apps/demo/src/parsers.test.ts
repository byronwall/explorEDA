import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCsvData } from "./csvParser";
import { parseJsonData } from "./jsonParser";

const readFixture = (name: string) =>
  readFile(resolve(process.cwd(), "public/datasets", name), "utf8");

describe("demo parsers", () => {
  it("rejects CSV rows with parse errors", async () => {
    await expect(parseCsvData('name,score\n"broken,1')).rejects.toThrow();
  });

  it("parses the bundled inspection fixtures", async () => {
    const [penguins, wine, shop] = await Promise.all([
      readFixture("palmer-penguins.csv").then(parseCsvData),
      readFixture("wine-quality-red.csv").then(parseCsvData),
      readFixture("shop-operations.csv").then(parseCsvData),
    ]);
    const firstPenguin = penguins[0]!;
    const firstWine = wine[0]!;
    const firstShop = shop[0]!;

    expect(penguins).toHaveLength(344);
    expect(Object.keys(firstPenguin)).toHaveLength(8);

    expect(wine).toHaveLength(1599);
    expect(Object.keys(firstWine)).toHaveLength(12);
    expect(firstWine["fixed acidity"]).toBe(7.4);

    expect(shop).toHaveLength(500);
    expect(Object.keys(firstShop)).toHaveLength(15);
    expect(
      shop.some((row) => Object.values(row).some((value) => value === null))
    ).toBe(true);
  });

  it("keeps every JSON array item", async () => {
    const file = new File(
      [JSON.stringify({ values: [1, 2, 3, 4] })],
      "data.json",
      { type: "application/json" }
    );

    await expect(parseJsonData(file)).resolves.toEqual([
      {
        "values[0]": 1,
        "values[1]": 2,
        "values[2]": 3,
        "values[3]": 4,
      },
    ]);
  });

  it("rejects scalar JSON roots", async () => {
    const file = new File(["42"], "data.json", { type: "application/json" });
    await expect(parseJsonData(file)).rejects.toThrow("object");
  });
});
