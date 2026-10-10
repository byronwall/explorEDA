import { describe, expect, it } from "vitest";

import { detectColumnType } from "./dataTypeDetection";

const column = (...values: string[]) => Object.assign({}, values);

describe("detectColumnType dates", () => {
  it.each([
    ["Depot 1", "Depot 2", "Depot 3"],
    ["Route 7", "Route 8"],
    ["Building 12A", "Building 3"],
    ["Market 3", "May Street"],
    ["0x1A", "0x2B"],
    ["2025-02-30", "2025-02-31"],
  ])("keeps labels with numbers categorical: %s", (...values) => {
    expect(detectColumnType(column(...values))).toBe("categorical");
  });

  it.each([
    ["2025-01-10", "2025-02-28"],
    ["2025-01-10T08:00:00Z", "2025-01-10T09:30:00.250+02:00"],
    ["2025-01-10T08:00", "2025-01-10 08:00:00"],
    ["1/15/2025", "12/31/2024"],
    ["2025/01/15"],
    ["Jan 15 2025", "February 3, 2025", "15 Mar 2025"],
  ])("detects real dates: %s", (...values) => {
    expect(detectColumnType(column(...values))).toBe("datetime");
  });

  it("detects true and false in any case as boolean", () => {
    expect(detectColumnType(column("TRUE", "False", "true"))).toBe("boolean");
  });

  it("treats a column with one non-date label as categorical", () => {
    expect(detectColumnType(column("2025-01-10", "Depot 2"))).toBe(
      "categorical"
    );
  });
});
