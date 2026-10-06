import { describe, expect, it } from "vitest";
import { validParameterValues } from "@/components/project/parameterBindings";
import type { AnalysisProject } from "@/types/AnalysisProject";

const project: AnalysisProject = {
  id: "shop",
  version: 1,
  sources: [],
  relationships: [],
  queries: [],
  parameters: [
    { id: "customerId", name: "Customer", type: "string" },
    { id: "dateStart", name: "From date", type: "date" },
    { id: "dateEnd", name: "Through date", type: "date" },
  ],
};

describe("parameter input validation", () => {
  it("does not apply an invalid date range for a selected customer", () => {
    const applied = {
      customerId: "C1",
      dateStart: "2025-01-15",
      dateEnd: "2025-01-31",
    };
    expect(validParameterValues(project, applied)).toBe(true);
    expect(
      validParameterValues(project, {
        ...applied,
        dateStart: "2025-02-01",
      })
    ).toBe(false);
    expect(applied).toEqual({
      customerId: "C1",
      dateStart: "2025-01-15",
      dateEnd: "2025-01-31",
    });
  });
});
