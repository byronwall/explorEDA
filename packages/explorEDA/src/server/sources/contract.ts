/**
 * The behavior every database driver must share, as one test suite. A
 * driver's test seeds the same tables in its own database, with its own
 * column types, and runs this suite against them:
 *
 * - `contract_items`: id, name, amount, big, active, created, seen_at
 *   holding (1, 'Ada', 12.5, 9007199254740993, true, 2024-01-02,
 *   2024-01-02 03:04:05), (2, 'Zoë', null, 1, false, 2024-02-29,
 *   2024-02-29 23:59:59), (3, '', -0.25, -2, null, null, null), and
 *   (4, null, 1000000, 0, true, 1999-12-31, 1999-12-31 00:00:00)
 * - `contract_events`: kind, n holding ('click', 1) twice and ('view', 2)
 * - `contract_many`: n holding 1 through 25
 * - `contract_large`: n holding 1 through 2,500, more than one batch
 * - `contract_blob`: id, data holding (1, bytes 00 ff)
 */
import { describe, expect, it } from "vitest";
import { readSnapshot } from "./read";
import {
  SourceReadError,
  type DatabaseDriver,
  type ReadLimits,
  type ReadRequest,
  type ResolvedConnection,
} from "./types";

export interface ContractTarget {
  driver: DatabaseDriver;
  connection: ResolvedConnection;
  /** SQL that would change the database, for this dialect. */
  writeSql?: string;
}

const LIMITS: ReadLimits = { rows: 1000, bytes: 10_000_000, timeout: 10_000 };

export function runSourceContract(
  name: string,
  target: () => Promise<ContractTarget>
) {
  describe(`${name} source contract`, () => {
    async function read(
      request: Omit<ReadRequest, "sourceId">,
      limits: Partial<ReadLimits> = {},
      signal?: AbortSignal
    ) {
      const { driver, connection } = await target();
      const session = await driver.connect(connection);
      let closed = false;
      const close = session.close.bind(session);
      session.close = async () => {
        closed = true;
        await close();
      };
      try {
        return await readSnapshot(
          session,
          {
            sourceId: "items",
            connection: connection.id,
            driver: driver.name,
            ...request,
          },
          { ...LIMITS, ...limits },
          signal
        );
      } finally {
        await session.close();
        expect(closed).toBe(true);
      }
    }

    async function failure(promise: Promise<unknown>) {
      const error = await promise.then(
        () => undefined,
        (reason: unknown) => reason
      );
      expect(error).toBeInstanceOf(SourceReadError);
      return error as SourceReadError;
    }

    it("reads a table's values and types", async () => {
      const snapshot = await read({ table: "contract_items" });
      expect(snapshot.rowCount).toBe(4);
      const types = Object.fromEntries(
        snapshot.fields.map((field) => [field.id, field.type])
      );
      expect(types).toEqual({
        id: "number",
        name: "string",
        amount: "number",
        big: "string",
        active: "boolean",
        created: "date",
        seen_at: "date",
      });
      const byId = new Map(
        snapshot.rows.map((row) => [
          row[0],
          Object.fromEntries(
            snapshot.fields.map((field, index) => [field.id, row[index]])
          ),
        ])
      );
      expect(byId.get(1)).toEqual({
        id: 1,
        name: "Ada",
        amount: 12.5,
        big: "9007199254740993",
        active: true,
        created: "2024-01-02",
        seen_at: "2024-01-02T03:04:05",
      });
      expect(byId.get(2)).toMatchObject({
        name: "Zoë",
        amount: null,
        big: "1",
        active: false,
      });
      expect(byId.get(3)).toMatchObject({
        name: "",
        amount: -0.25,
        active: null,
        created: null,
      });
      expect(byId.get(4)).toMatchObject({ name: null, amount: 1000000 });
      expect(snapshot.notes.join(" ")).toMatch(/big keeps its numbers as text/);
    });

    it("reads a query", async () => {
      const snapshot = await read({
        sql: "select id, name from contract_items where id <= 2 order by id",
      });
      expect(snapshot.fields.map((field) => field.id)).toEqual(["id", "name"]);
      expect(snapshot.rows).toEqual([
        [1, "Ada"],
        [2, "Zoë"],
      ]);
    });

    it("keeps repeated rows in a table without a key", async () => {
      const snapshot = await read({ table: "contract_events" });
      expect(snapshot.rowCount).toBe(3);
      expect(
        snapshot.rows.filter((row) => row[0] === "click" && row[1] === 1)
      ).toHaveLength(2);
    });

    it("lists the tables it can read", async () => {
      const { driver, connection } = await target();
      const session = await driver.connect(connection);
      try {
        const names = (await session.listTables()).map((table) => table.name);
        expect(names).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/contract_items$/),
            expect.stringMatching(/contract_many$/),
          ])
        );
      } finally {
        await session.close();
      }
    });

    it("reads a table larger than one batch", async () => {
      const snapshot = await read({ table: "contract_large" }, { rows: 2500 });
      expect(snapshot.rowCount).toBe(2500);
      const values = snapshot.rows
        .map((row) => row[0])
        .sort((a, b) => Number(a) - Number(b));
      expect(values[0]).toBe(1);
      expect(values.at(-1)).toBe(2500);
      const error = await failure(
        read({ table: "contract_large" }, { rows: 2499 })
      );
      expect(error.code).toBe("too-many-rows");
    });

    it("refuses more rows than the limit", async () => {
      expect(
        (await read({ table: "contract_many" }, { rows: 25 })).rowCount
      ).toBe(25);
      const error = await failure(
        read({ table: "contract_many" }, { rows: 20 })
      );
      expect(error.code).toBe("too-many-rows");
      expect(error.message).toBe("items has more than 20 rows.");
      expect(error.suggestion).toMatch(/limit=40/);
    });

    it("refuses more bytes than the limit", async () => {
      const error = await failure(
        read({ table: "contract_items" }, { bytes: 40 })
      );
      expect(error.code).toBe("too-large");
    });

    it("never writes", async () => {
      const { writeSql } = await target();
      const error = await failure(
        read({ sql: writeSql ?? "delete from contract_items" })
      );
      expect(error.code).toBe("write");
      expect((await read({ table: "contract_items" })).rowCount).toBe(4);
    });

    it("names a table that doesn't exist", async () => {
      const error = await failure(read({ table: "contract_missing" }));
      expect(error.code).toBe("query");
    });

    it("refuses binary columns", async () => {
      const error = await failure(read({ table: "contract_blob" }));
      expect(error.code).toBe("unsupported-type");
      expect(error.message).toBe(
        "items.data holds binary data, which explorEDA can't chart."
      );
    });

    it("stops when the read is cancelled", async () => {
      const controller = new AbortController();
      controller.abort();
      const error = await failure(
        read({ table: "contract_many" }, {}, controller.signal)
      );
      expect(error.code).toBe("cancelled");
    });
  });
}
