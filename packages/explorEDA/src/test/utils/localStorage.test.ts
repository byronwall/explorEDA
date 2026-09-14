import { beforeEach, describe, expect, it } from "vitest";
import { loadProjects } from "../../utils/localStorage";

describe("localStorage project loading", () => {
  beforeEach(() => localStorage.clear());

  it("returns no projects when stored JSON is corrupt", () => {
    localStorage.setItem("data-viz-projects", "not-json");
    expect(loadProjects()).toEqual([]);
  });

  it("ignores malformed project entries", () => {
    localStorage.setItem(
      "data-viz-projects",
      JSON.stringify([
        {
          version: 1,
          name: "Valid",
          sourceDataPath: "data.csv",
          views: [],
          isSaved: true,
        },
        null,
        { version: 2 },
      ])
    );

    expect(loadProjects()).toHaveLength(1);
    expect(loadProjects()[0]?.name).toBe("Valid");
  });
});
