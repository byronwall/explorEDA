// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseServerArgs } from "./serverCommand";

describe("exploreda server options", () => {
  it("reads the environment, and lets the command line win", () => {
    expect(
      parseServerArgs(["--port", "9000"], {
        EXPLOREDA_DATA: "/data",
        EXPLOREDA_PORT: "8080",
        EXPLOREDA_PUBLIC_URL: "https://eda.example.com",
        EXPLOREDA_UPLOAD_LIMIT: "250",
        EXPLOREDA_HOST: " ",
      })
    ).toEqual({
      data: "/data",
      port: 9000,
      host: "0.0.0.0",
      publicUrl: "https://eda.example.com",
      seedDev: false,
      uploadLimitMb: 250,
    });
  });

  it("explains a bad value", () => {
    expect(parseServerArgs([], {})).toMatch(/Give a data folder/);
    expect(
      parseServerArgs(["--data", "/d"], { EXPLOREDA_PUBLIC_URL: "eda.local" })
    ).toMatch(/--public-url needs an http or https address/);
    expect(parseServerArgs(["--data", "/d", "--upload-limit", "0"])).toMatch(
      /--upload-limit needs a size/
    );
  });

  it("seeds a chosen project with the sample accounts", () => {
    expect(
      parseServerArgs(["--data", "/d", "--seed-dev"], {
        EXPLOREDA_SEED_PROJECT: "/demo/project",
      })
    ).toMatchObject({ seedDev: true, seedProject: "/demo/project" });
    expect(
      parseServerArgs(["--data", "/d", "--seed-project", "/demo/project"])
    ).toMatch(/--seed-project goes with --seed-dev/);
  });
});
