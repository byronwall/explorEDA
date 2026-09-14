import { describe, expect, it } from "vitest";
import { parseCsvData } from "./csvParser";
import { parseJsonData } from "./jsonParser";

describe("demo parsers", () => {
  it("rejects CSV rows with parse errors", async () => {
    await expect(parseCsvData("name,score\n\"broken,1")).rejects.toThrow();
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
