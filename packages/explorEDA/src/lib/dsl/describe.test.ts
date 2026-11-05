import { describe, expect, it } from "vitest";
import { describeDslSource } from "./describe";

describe("describeDslSource", () => {
  it("lists a number field's range over a snapshot-sized table", () => {
    const rows = Array.from({ length: 200_000 }, (_, i) => ({ qty: i }));
    expect(describeDslSource(rows)[0]).toMatchObject({
      name: "qty",
      type: "num",
      sample: "0 to 199999",
    });
  });
});
