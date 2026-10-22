import { expect, it } from "vitest";
import { cellCategory, cellKey, cellText, dayOf } from "./cells";

it("reads a cell's values from a category, quoted where one has a comma", () => {
  expect(cellCategory("Mon,9")).toEqual(["Mon", "9"]);
  expect(cellCategory('"Washington, DC",2020')).toEqual([
    "Washington, DC",
    "2020",
  ]);
  expect(cellText(["Washington, DC", 2020], false)).toBe(
    '"Washington, DC",2020'
  );
});

it("orders a record key by the fields that place a cell", () => {
  const attach = {
    kind: "record" as const,
    keyFields: ["hour", "day"],
    key: [9, "Mon"],
  };
  expect(cellKey(attach, ["day", "hour"])).toEqual(["Mon", 9]);
  expect(cellKey(attach, ["day"])).toBeUndefined();
  expect(cellKey(attach, ["day", "region"])).toBeUndefined();
});

it("names the UTC day of a date as text or as a timestamp", () => {
  expect(dayOf("2016-12-16")).toBe("2016-12-16");
  expect(dayOf(Date.UTC(2016, 11, 16, 15))).toBe("2016-12-16");
  expect(dayOf(String(Date.UTC(2016, 11, 16)))).toBe("2016-12-16");
  expect(dayOf("someday")).toBeUndefined();
  expect(cellText([Date.UTC(2016, 11, 16)], true)).toBe("2016-12-16");
});
