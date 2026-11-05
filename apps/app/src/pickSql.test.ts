import { describe, expect, it } from "vitest";
import { pickSql } from "./pickSql";

describe("pickSql", () => {
  it("quotes only the names that need it, the way each database does", () => {
    const columns = ["play_id", "desc", 'a"b'];
    expect(pickSql("sqlite", "plays", columns, "down = 4")).toBe(
      'select play_id, "desc", "a""b" from plays where down = 4'
    );
    expect(pickSql("mysql", "plays", ["desc", "a`b"])).toBe(
      "select `desc`, `a``b` from plays"
    );
    expect(pickSql("sqlserver", "dbo.Plays", ["desc", "a]b"])).toBe(
      "select [desc], [a]]b] from dbo.[Plays]"
    );
    expect(pickSql("postgres", "public.Plays", ["Play Type", "epa"])).toBe(
      'select "Play Type", epa from public."Plays"'
    );
  });

  it("takes a filter with or without its where", () => {
    expect(pickSql("duckdb", "t", ["a"], "  WHERE a > 1 ")).toBe(
      "select a from t where a > 1"
    );
    expect(pickSql("duckdb", "t", ["a"], "  ")).toBe("select a from t");
  });
});
