import { describe, expect, it } from "vitest";
import {
  bindingProblem,
  queryParameters,
} from "@/components/project/parameterBindings";
import { createShopFixture } from "@/test/fixtures/shopProject";

const { project } = createShopFixture();
const query = project.queries.find((item) => item.id === "customer-instance")!;
const parameters = queryParameters(project.parameters, query);

describe("parameter inputs", () => {
  it("lists only the parameters a query reads", () => {
    expect(parameters.map((item) => item.id)).toEqual([
      "customerId",
      "dateStart",
      "dateEnd",
    ]);
    const other = project.queries.find((item) => item.id === "order-totals");
    expect(queryParameters(project.parameters, other)).toEqual([]);
  });

  it("rejects a lower bound after the upper bound on the same field", () => {
    const valid = {
      customerId: "C1",
      dateStart: "2025-01-15",
      dateEnd: "2025-01-31",
    };
    expect(bindingProblem(parameters, query, valid)).toBeUndefined();
    expect(
      bindingProblem(parameters, query, { ...valid, dateStart: "2025-02-01" })
    ).toBe("From date is after To date.");
  });

  it("asks for required inputs and checks their types", () => {
    expect(bindingProblem(parameters, query, {})).toBe("Choose Customer.");
    expect(
      bindingProblem(parameters, query, {
        customerId: "C1",
        dateStart: "soon",
        dateEnd: "2025-01-31",
      })
    ).toBe("From date is not a valid date.");
    expect(
      bindingProblem(parameters, query, {
        customerId: "C1",
        dateStart: "Depot 2",
        dateEnd: "2025-01-31",
      })
    ).toBe("From date is not a valid date.");
  });
});
