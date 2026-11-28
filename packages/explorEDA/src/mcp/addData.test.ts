import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { memoryProjectFiles } from "@/lib/project/files";
import { addData } from "./addData";
import { project, readEda, writeEda } from "./tools";

const CSV = "id,region,revenue\nA,East,3\nB,West,5\n";
let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    const route = req.url ?? "/";
    if (route === "/sales.csv") {
      res.writeHead(200, { "content-type": "text/csv" }).end(CSV);
    } else if (route === "/moved") {
      res.writeHead(302, { location: "/sales.csv" }).end();
    } else if (route === "/loop") {
      res.writeHead(302, { location: "/loop" }).end();
    } else if (route === "/page") {
      res.writeHead(200, { "content-type": "text/html" }).end("<html></html>");
    } else if (route === "/huge") {
      res.writeHead(200, { "content-length": String(200 * 1024 * 1024) });
      res.write("id\n");
    } else if (route === "/slow") {
      setTimeout(() => res.writeHead(200).end(CSV), 2_000);
    } else {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.closeAllConnections();
  server.close();
});

describe("add_data", () => {
  it("suggests relate lines to tables that share a key, until declared", async () => {
    const files = memoryProjectFiles();
    await addData(files, {
      path: "data/runs.csv",
      rows: "run_id,repo\nr1,a\nr2,a\nr3,b\n",
    });
    const jobs = await addData(files, {
      path: "data/jobs.csv",
      rows: "job_id,run_id\nj1,r1\nj2,r1\nj3,r3\n",
    });
    const relate = "relate @jobs-runs jobs.run_id -> runs.run_id";
    expect(jobs.suggestedLinks).toEqual([{ relate, matched: 3, total: 3 }]);
    expect(jobs.howToUse).toContain("relate line");
    expect((await project(files)).suggestedLinks).toEqual(jobs.suggestedLinks);

    const { text, version } = await readEda(files, { path: "exploreda.eda" });
    await writeEda(files, {
      path: "exploreda.eda",
      text: `${text}\n${relate}\n`,
      version,
    });
    const after = await project(files);
    expect(after.suggestedLinks).toBeUndefined();
    expect(after.next).toBeUndefined();
  });

  it("starts an empty folder from rows, ready to chart", async () => {
    const files = memoryProjectFiles();
    const added = await addData(files, { path: "data/sales.csv", rows: CSV });
    expect(added).toMatchObject({
      saved: "data/sales.csv",
      source: "sales",
      projectPath: "exploreda.eda",
      rows: 2,
    });
    expect(added.fields.map((field) => field.name)).toContain("sales.region");
    const analysis = await writeEda(files, {
      path: "sales.eda",
      text: "eda query=sales\nrow sales.region\n",
    });
    expect(analysis).toMatchObject({ complete: true, charts: 1 });
  });

  it("fetches an address through a redirect and records where it came from", async () => {
    const files = memoryProjectFiles();
    await addData(
      files,
      { path: "sales.csv", url: `${base}/moved` },
      { now: new Date("2026-11-22T12:00:00Z") }
    );
    expect(files.snapshot()["exploreda.eda"]).toContain(
      `# sales.csv fetched from ${base}/sales.csv on 2026-11-22\nsource @sales path=sales.csv`
    );
  });

  it("refuses a page, a redirect loop, an oversized file, and a slow one, writing nothing", async () => {
    for (const [route, reason] of [
      ["/page", /web page/],
      ["/loop", /redirects more than/],
      ["/huge", /over the 100 MB limit/],
      ["/slow", /didn't answer within/],
    ] as const) {
      const files = memoryProjectFiles();
      await expect(
        addData(
          files,
          { path: "x.csv", url: `${base}${route}` },
          { timeoutMs: 300 }
        )
      ).rejects.toThrow(reason);
      expect(files.snapshot()).toEqual({});
    }
  });

  it("charts a data file already in the folder, and refuses a bad source ID first", async () => {
    const files = memoryProjectFiles({ "sales.csv": CSV });
    await expect(
      addData(files, { path: "sales.csv", source: "Bad Name!" })
    ).rejects.toThrow(/isn't an ID/);
    expect(Object.keys(files.snapshot())).toEqual(["sales.csv"]);
    const added = await addData(files, { path: "sales.csv" });
    expect(added).toMatchObject({ source: "sales", rows: 2 });
    expect(files.snapshot()["sales.csv"]).toBe(CSV);
    await expect(addData(files, { path: "sales.csv" })).rejects.toThrow(
      /already source sales/
    );
  });
});
