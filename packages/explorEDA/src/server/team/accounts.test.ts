// @vitest-environment node
import { describe, expect, it } from "vitest";
import { accountStoreContract } from "@/test/accountStoreContract";
import { hashPassword, memoryAccountStore, verifyPassword } from "./accounts";

describe("memory account store", () => {
  accountStoreContract(async () => memoryAccountStore());
});

describe("password hashes", () => {
  it("verify the password they were made from, and nothing else", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain("correct");
    expect(await verifyPassword("correct horse", hash)).toBe(true);
    expect(await verifyPassword("correct horsf", hash)).toBe(false);
    expect(await verifyPassword("x", "plain")).toBe(false);
  });
});
