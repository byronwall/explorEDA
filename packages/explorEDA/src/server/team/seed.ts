/**
 * Sample accounts and a sample project for trying the team server on one
 * machine. These passwords are public; never seed a server people use.
 */
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import type { AccountStore } from "./accounts";

export const DEV_PASSWORD = "exploreda-dev";

export const DEV_ACCOUNTS = [
  {
    email: "ana@example.com",
    name: "Ana Author",
    kind: "author",
    admin: true,
  },
  { email: "ben@example.com", name: "Ben Author", kind: "author" },
  { email: "vic@example.com", name: "Vic Viewer", kind: "viewer" },
] as const;

export const DEV_PROJECT = { id: "shop", name: "Shop orders" };

async function copyFolder(from: string, to: string) {
  await fs.mkdir(to, { recursive: true });
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await copyFolder(source, target);
    } else {
      await fs.copyFile(source, target);
    }
  }
}

/**
 * Adds the sample accounts as members of the sample project, copying the
 * example folder into `dataDir` when the project has no folder yet.
 */
export async function seedDev(
  store: AccountStore,
  dataDir: string,
  exampleDir: string
) {
  const folder = path.join(dataDir, "projects", DEV_PROJECT.id);
  if (!existsSync(folder)) {
    await copyFolder(exampleDir, folder);
  }
  if (!(await store.project(DEV_PROJECT.id))) {
    await store.createProject(DEV_PROJECT);
  }
  for (const input of DEV_ACCOUNTS) {
    const account =
      (await store.accountByEmail(input.email)) ??
      (await store.createAccount({ ...input, password: DEV_PASSWORD }));
    await store.setMember(DEV_PROJECT.id, {
      accountId: account.id,
      role: account.kind,
    });
  }
}
