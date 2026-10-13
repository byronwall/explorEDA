import { expect, it } from "vitest";
import type { AccountStore } from "@/server/team/accounts";
import { projectRole } from "@/server/team/accounts";

/** What every team account store must do. `create` makes an empty one. */
export function accountStoreContract(create: () => Promise<AccountStore>) {
  it("creates accounts and checks their passwords", async () => {
    const store = await create();
    const ana = await store.createAccount({
      email: " Ana@Example.com ",
      name: "Ana",
      kind: "author",
      password: "correct horse",
    });
    expect(ana).toMatchObject({
      email: "ana@example.com",
      kind: "author",
      admin: false,
      disabled: false,
    });
    expect(ana).not.toHaveProperty("hash");
    expect(
      await store.checkPassword("ANA@example.com", "correct horse")
    ).toEqual(ana);
    expect(await store.checkPassword("ana@example.com", "wrong horse")).toBe(
      undefined
    );
    await expect(
      store.createAccount({
        email: "ana@example.com",
        name: "A",
        kind: "viewer",
      })
    ).rejects.toMatchObject({ code: "exists" });
  });

  it("refuses short passwords and bad addresses", async () => {
    const store = await create();
    await expect(
      store.createAccount({
        email: "short@example.com",
        name: "Short",
        kind: "author",
        password: "tiny",
      })
    ).rejects.toMatchObject({ code: "invalid" });
    await expect(
      store.createAccount({ email: "nobody", name: "N", kind: "author" })
    ).rejects.toMatchObject({ code: "invalid" });
  });

  it("keeps a session until it ends, and not for a disabled account", async () => {
    const store = await create();
    const ana = await store.createAccount({
      email: "ana@example.com",
      name: "Ana",
      kind: "author",
      password: "correct horse",
    });
    const secret = await store.createSession(ana.id);
    expect((await store.sessionAccount(secret))?.id).toBe(ana.id);
    await store.endSession(secret);
    expect(await store.sessionAccount(secret)).toBe(undefined);

    const again = await store.createSession(ana.id);
    await store.updateAccount(ana.id, { disabled: true });
    expect(await store.sessionAccount(again)).toBe(undefined);
    expect(await store.checkPassword("ana@example.com", "correct horse")).toBe(
      undefined
    );
    await store.updateAccount(ana.id, { disabled: false });
    await store.endSessions(ana.id);
    expect(await store.sessionAccount(again)).toBe(undefined);
  });

  it("caps a viewer account at viewer and lets an admin see every project", async () => {
    const store = await create();
    await store.createProject({ id: "shop", name: "Shop" });
    const vic = await store.createAccount({
      email: "vic@example.com",
      name: "Vic",
      kind: "viewer",
    });
    const ana = await store.createAccount({
      email: "ana@example.com",
      name: "Ana",
      kind: "author",
      admin: true,
    });
    const ben = await store.createAccount({
      email: "ben@example.com",
      name: "Ben",
      kind: "author",
    });
    await store.setMember("shop", { accountId: vic.id, role: "author" });
    expect(await projectRole(store, vic, "shop")).toBe("viewer");
    expect(await projectRole(store, ana, "shop")).toBe("author");
    expect(await projectRole(store, ben, "shop")).toBe(undefined);
    await store.setMember("shop", { accountId: ben.id, role: "viewer" });
    expect(await projectRole(store, ben, "shop")).toBe("viewer");
    await store.removeMember("shop", ben.id);
    expect(await projectRole(store, ben, "shop")).toBe(undefined);
  });

  it("refuses a project ID that isn't a safe folder name", async () => {
    const store = await create();
    await expect(
      store.createProject({ id: "../etc", name: "No" })
    ).rejects.toMatchObject({ code: "invalid" });
    await store.createProject({ id: "sales-2026", name: "Sales" });
    await expect(
      store.createProject({ id: "sales-2026", name: "Again" })
    ).rejects.toMatchObject({ code: "exists" });
    expect(await store.projects()).toEqual([
      { id: "sales-2026", name: "Sales" },
    ]);
  });

  it("sets a password once through a link, and only the newest link works", async () => {
    const store = await create();
    const vic = await store.createAccount({
      email: "vic@example.com",
      name: "Vic",
      kind: "viewer",
    });
    expect(
      await store.checkPassword("vic@example.com", "anything at all")
    ).toBe(undefined);
    const first = await store.createPasswordLink(vic.id);
    const second = await store.createPasswordLink(vic.id);
    expect(await store.passwordLinkAccount(first)).toBe(undefined);
    expect((await store.passwordLinkAccount(second))?.email).toBe(
      "vic@example.com"
    );
    await expect(store.usePasswordLink(second, "short")).rejects.toMatchObject({
      code: "invalid",
    });
    expect((await store.usePasswordLink(second, "correct horse")).id).toBe(
      vic.id
    );
    expect(
      (await store.checkPassword("vic@example.com", "correct horse"))?.id
    ).toBe(vic.id);
    await expect(
      store.usePasswordLink(second, "another horse")
    ).rejects.toMatchObject({ code: "missing" });
  });
}
