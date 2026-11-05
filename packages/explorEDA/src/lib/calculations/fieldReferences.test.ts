import { describe, expect, it } from "vitest";
import { resolveFieldReferences } from "./fieldReferences";

const fields = [
  { id: "qb_dropbacks.sack", label: "Sack" },
  { id: "qb_dropbacks.passer_player_name", label: "Passer player name" },
  { id: "games.week", label: "Week" },
  { id: "plays.week", label: "Play week" },
  { id: "Sales", label: "Sales" },
];

describe("resolveFieldReferences", () => {
  it("reads labels and short ids as field ids", () => {
    expect(
      resolveFieldReferences(
        'if ["sack"] == 1 then null else ["Passer player name"]',
        fields
      )
    ).toBe(
      'if ["qb_dropbacks.sack"] == 1 then null else ["qb_dropbacks.passer_player_name"]'
    );
    expect(resolveFieldReferences('["passer_player_name"]', fields)).toBe(
      '["qb_dropbacks.passer_player_name"]'
    );
  });

  it("keeps exact ids and unknown names", () => {
    expect(resolveFieldReferences('["Sales"] + ["Nope"]', fields)).toBe(
      '["Sales"] + ["Nope"]'
    );
  });

  it("prefers a label to a short id and lists candidates when ambiguous", () => {
    expect(resolveFieldReferences('["week"]', fields)).toBe('["games.week"]');
    expect(() =>
      resolveFieldReferences('["week"]', [
        { id: "games.week", label: "games.week" },
        { id: "plays.week", label: "plays.week" },
      ])
    ).toThrow("games.week, plays.week");
  });
});
