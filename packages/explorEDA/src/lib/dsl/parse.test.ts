import { describe, expect, it } from "vitest";
import { parseValue } from "./parse";

describe("quoted values", () => {
  it("reads the JSON escapes that export writes", () => {
    expect(parseValue('"first line\\nsecond\\tcol"').items[0]!.text).toBe(
      "first line\nsecond\tcol"
    );
    expect(parseValue('"say \\"hi\\" \\\\ done"').items[0]!.text).toBe(
      'say "hi" \\ done'
    );
    expect(parseValue('"caf\\u00e9"').items[0]!.text).toBe("café");
  });
});
