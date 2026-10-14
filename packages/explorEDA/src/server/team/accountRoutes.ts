/**
 * Setting up a team server and managing who may use it: the first admin,
 * set-password links, accounts, project creation, and project members.
 */
import { promises as fs } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { readBody, send } from "../http";
import {
  AccountError,
  projectRole,
  type Account,
  type AccountKind,
  type AccountStore,
  type ProjectRole,
} from "./accounts";

export interface AccountRouteContext {
  store: AccountStore;
  dataDir: string;
  /** Signs the account in on this response. */
  startSession(res: ServerResponse, account: Account): Promise<void>;
}

const json = async (req: IncomingMessage) =>
  JSON.parse(await readBody(req, 16_384)) as Record<string, unknown>;

const text = (value: unknown) => (typeof value === "string" ? value : "");

const kindOf = (value: unknown): AccountKind =>
  value === "viewer" ? "viewer" : "author";

const roleOf = (value: unknown): ProjectRole | undefined =>
  value === "author" || value === "viewer" ? value : undefined;

const refuse = (res: ServerResponse, message: string) =>
  send(res, 403, { error: message });

/** A folder-safe project ID from its name, unique among `taken`. */
export function projectId(name: string, taken: Set<string>) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project";
  let id = base;
  for (let suffix = 2; taken.has(id); suffix++) {
    id = `${base}-${suffix}`;
  }
  return id;
}

export function createAccountRoutes(context: AccountRouteContext) {
  const { store, dataDir, startSession } = context;

  const admins = async () =>
    (await store.accounts()).filter((item) => item.admin && !item.disabled);

  /** Routes that work before anyone signs in. */
  async function publicRoutes(
    url: URL,
    req: IncomingMessage,
    res: ServerResponse
  ) {
    if (url.pathname === "/api/setup") {
      const needed = (await store.accounts()).length === 0;
      if (req.method === "GET") {
        send(res, 200, { needed });
        return true;
      }
      if (req.method === "POST") {
        if (!needed) {
          refuse(res, "This server is already set up. Sign in instead.");
          return true;
        }
        const body = await json(req);
        const account = await store.createAccount({
          email: text(body.email),
          name: text(body.name),
          kind: "author",
          admin: true,
          password: text(body.password),
        });
        await startSession(res, account);
        return true;
      }
    }
    if (url.pathname === "/api/password-link") {
      if (req.method === "GET") {
        const account = await store.passwordLinkAccount(
          url.searchParams.get("secret") ?? ""
        );
        if (!account) {
          send(res, 404, {
            error:
              "This link has expired or was already used. Ask an admin for a new one.",
          });
          return true;
        }
        send(res, 200, { email: account.email, name: account.name });
        return true;
      }
      if (req.method === "POST") {
        const body = await json(req);
        const account = await store.usePasswordLink(
          text(body.secret),
          text(body.password)
        );
        await store.endSessions(account.id);
        await startSession(res, account);
        return true;
      }
    }
    return false;
  }

  async function accountRoutes(
    account: Account,
    url: URL,
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const [, , , id, action] = url.pathname.split("/");
    if (!account.admin) {
      refuse(res, "Only an admin can manage accounts.");
      return;
    }
    if (!id && req.method === "GET") {
      send(res, 200, await store.accounts());
      return;
    }
    if (!id && req.method === "POST") {
      const body = await json(req);
      const created = await store.createAccount({
        email: text(body.email),
        name: text(body.name),
        kind: kindOf(body.kind),
        admin: body.admin === true,
      });
      send(res, 200, {
        account: created,
        secret: await store.createPasswordLink(created.id),
      });
      return;
    }
    const target = id ? await store.account(id) : undefined;
    if (!target) {
      throw new AccountError("missing", "That account doesn't exist.");
    }
    if (action === "link" && req.method === "POST") {
      send(res, 200, { secret: await store.createPasswordLink(target.id) });
      return;
    }
    if (!action && req.method === "PATCH") {
      const body = await json(req);
      const change: Partial<Omit<Account, "id" | "email">> = {};
      if (typeof body.name === "string") {
        if (!body.name.trim()) {
          throw new AccountError("invalid", "Enter a name.");
        }
        change.name = body.name.trim();
      }
      if (body.kind !== undefined) {
        change.kind = kindOf(body.kind);
      }
      if (typeof body.admin === "boolean") {
        change.admin = body.admin;
      }
      if (typeof body.disabled === "boolean") {
        change.disabled = body.disabled;
      }
      const losesAdmin =
        target.admin && (change.admin === false || change.disabled === true);
      if (losesAdmin && (await admins()).length <= 1) {
        refuse(res, "The server needs at least one admin.");
        return;
      }
      const updated = await store.updateAccount(target.id, change);
      if (updated.disabled) {
        await store.endSessions(updated.id);
      }
      send(res, 200, updated);
      return;
    }
    send(res, 404, { error: `No ${req.method} ${url.pathname}.` });
  }

  /** Accounts an author can add to a project. */
  async function people(account: Account, res: ServerResponse) {
    if (account.kind !== "author" && !account.admin) {
      refuse(res, "Only authors can add people to projects.");
      return;
    }
    send(
      res,
      200,
      (await store.accounts())
        .filter((item) => !item.disabled)
        .map(({ id, name, email, kind }) => ({ id, name, email, kind }))
    );
  }

  async function createProject(
    account: Account,
    req: IncomingMessage,
    res: ServerResponse
  ) {
    if (account.kind !== "author") {
      refuse(res, "Only authors can create projects.");
      return;
    }
    const name = text((await json(req)).name).trim();
    if (!name) {
      throw new AccountError("invalid", "Enter a project name.");
    }
    const id = projectId(
      name,
      new Set((await store.projects()).map((project) => project.id))
    );
    await fs.mkdir(path.join(dataDir, "projects", id), { recursive: true });
    const project = await store.createProject({ id, name });
    await store.setMember(id, { accountId: account.id, role: "author" });
    send(res, 200, { ...project, role: "author" });
  }

  /** `/api/projects/<id>/members[/<account>]`, for the project's authors. */
  async function memberRoutes(
    account: Account,
    projectIdValue: string,
    memberId: string | undefined,
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const role = await projectRole(store, account, projectIdValue);
    if (req.method === "GET" && !memberId) {
      if (!role) {
        throw new AccountError("missing", "That project doesn't exist.");
      }
      const members = await store.members(projectIdValue);
      const listed = [];
      for (const member of members) {
        const person = await store.account(member.accountId);
        if (person) {
          listed.push({
            accountId: person.id,
            name: person.name,
            email: person.email,
            kind: person.kind,
            disabled: person.disabled,
            role: person.kind === "viewer" ? "viewer" : member.role,
          });
        }
      }
      send(res, 200, listed);
      return;
    }
    if (role !== "author") {
      refuse(res, "Only the project's authors can change who's in it.");
      return;
    }
    const person = memberId ? await store.account(memberId) : undefined;
    if (!person) {
      throw new AccountError("missing", "That account doesn't exist.");
    }
    const authors = async () =>
      (await store.members(projectIdValue)).filter(
        (member) => member.role === "author"
      );
    if (req.method === "PUT") {
      const wanted = roleOf((await json(req)).role);
      if (!wanted) {
        throw new AccountError("invalid", "A member is an author or a viewer.");
      }
      if (wanted === "author" && person.kind === "viewer") {
        throw new AccountError(
          "invalid",
          `${person.name} has a viewer account, so they can only view.`
        );
      }
      const current = (await authors()).map((member) => member.accountId);
      if (
        wanted === "viewer" &&
        current.length === 1 &&
        current[0] === person.id
      ) {
        refuse(res, "A project needs at least one author.");
        return;
      }
      await store.setMember(projectIdValue, {
        accountId: person.id,
        role: wanted,
      });
      send(res, 200, { accountId: person.id, role: wanted });
      return;
    }
    if (req.method === "DELETE") {
      const current = (await authors()).map((member) => member.accountId);
      if (current.length === 1 && current[0] === person.id) {
        refuse(res, "A project needs at least one author.");
        return;
      }
      await store.removeMember(projectIdValue, person.id);
      send(res, 200, { removed: person.id });
      return;
    }
    send(res, 404, { error: `No ${req.method} members route.` });
  }

  return { publicRoutes, accountRoutes, people, createProject, memberRoutes };
}
