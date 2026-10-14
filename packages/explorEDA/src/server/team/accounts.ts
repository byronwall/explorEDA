/**
 * Who may use a team server: accounts, their sessions, projects, and
 * project members. A store keeps them; the memory store here serves tests
 * and `--seed-dev`, and the server's data folder keeps a durable one.
 */
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/** An author can create projects and edit them; a viewer only reads. */
export type AccountKind = "author" | "viewer";
export type ProjectRole = "author" | "viewer";

export interface Account {
  id: string;
  email: string;
  name: string;
  kind: AccountKind;
  admin: boolean;
  disabled: boolean;
}

export interface Project {
  /** Also the project's folder name under `projects/`. */
  id: string;
  name: string;
}

export interface Member {
  accountId: string;
  role: ProjectRole;
}

export interface NewAccount {
  email: string;
  name: string;
  kind: AccountKind;
  admin?: boolean;
  password?: string;
}

export interface AccountStore {
  accounts(): Promise<Account[]>;
  account(id: string): Promise<Account | undefined>;
  accountByEmail(email: string): Promise<Account | undefined>;
  createAccount(account: NewAccount): Promise<Account>;
  updateAccount(
    id: string,
    change: Partial<Omit<Account, "id" | "email">>
  ): Promise<Account>;
  /** Replaces the account's password. */
  setPassword(id: string, password: string): Promise<void>;
  /** The account for a correct email and password, if it is enabled. */
  checkPassword(email: string, password: string): Promise<Account | undefined>;

  /** Starts a session and returns its secret, which only the cookie keeps. */
  createSession(accountId: string): Promise<string>;
  sessionAccount(secret: string): Promise<Account | undefined>;
  endSession(secret: string): Promise<void>;
  endSessions(accountId: string): Promise<void>;

  /**
   * Starts a one-time link that sets the account's password, replacing
   * any earlier one, and returns its secret.
   */
  createPasswordLink(accountId: string): Promise<string>;
  /** The account a live link belongs to. */
  passwordLinkAccount(secret: string): Promise<Account | undefined>;
  /** Sets the password and spends the link. */
  usePasswordLink(secret: string, password: string): Promise<Account>;

  projects(): Promise<Project[]>;
  project(id: string): Promise<Project | undefined>;
  createProject(project: Project): Promise<Project>;
  members(projectId: string): Promise<Member[]>;
  setMember(projectId: string, member: Member): Promise<void>;
  removeMember(projectId: string, accountId: string): Promise<void>;
  /** Releases the store's file, when it has one. */
  close?(): void;
}

/** Store errors carry a short code the server turns into a status. */
export class AccountError extends Error {
  constructor(
    readonly code: "exists" | "missing" | "invalid",
    message: string
  ) {
    super(message);
    this.name = "AccountError";
  }
}

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT.keylen,
      { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p },
      (error, key) => (error ? reject(error) : resolve(key))
    );
  });
}

/** A salted scrypt hash in one string: `scrypt$N$r$p$salt$hash`. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return [
    "scrypt",
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, , , , salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }
  const expected = Buffer.from(hash, "base64url");
  const key = await derive(password, Buffer.from(salt, "base64url"));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** The shortest password a team server accepts. */
export const MIN_PASSWORD = 10;

export function checkNewPassword(password: string) {
  if (password.length < MIN_PASSWORD) {
    throw new AccountError(
      "invalid",
      `Use a password of at least ${MIN_PASSWORD} characters.`
    );
  }
}

/** Sessions are stored by hash, so a copied store can't sign anyone in. */
export const sessionKey = (secret: string) =>
  createHash("sha256").update(secret).digest("base64url");

export const newSecret = () => randomBytes(32).toString("base64url");

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const EMAIL = /^[^\s@]+@[^\s@]+$/;

export function checkNewAccount(account: NewAccount) {
  if (!EMAIL.test(normalizeEmail(account.email))) {
    throw new AccountError("invalid", "Enter an email address.");
  }
  if (!account.name.trim()) {
    throw new AccountError("invalid", "Enter a name.");
  }
  if (account.kind !== "author" && account.kind !== "viewer") {
    throw new AccountError("invalid", "An account is an author or a viewer.");
  }
}

/** A project ID that is also a safe folder name. */
export const PROJECT_ID = /^[a-z0-9][a-z0-9-]{0,62}$/;

/** How long a session lasts. */
export const SESSION_DAYS = 30;
/** How long a set-password link works. */
export const LINK_DAYS = 7;

/**
 * Accounts in memory. Everything is lost when the process stops, so this
 * serves tests and `--seed-dev` only.
 */
export function memoryAccountStore(): AccountStore {
  const accounts = new Map<string, Account & { hash?: string }>();
  const sessions = new Map<string, { accountId: string; expires: number }>();
  const links = new Map<string, { accountId: string; expires: number }>();
  const projects = new Map<string, Project>();
  const members = new Map<string, Map<string, ProjectRole>>();
  let nextId = 1;
  const plain = ({ hash: _hash, ...account }: Account & { hash?: string }) =>
    account;
  const find = (id: string) => {
    const account = accounts.get(id);
    if (!account) {
      throw new AccountError("missing", "That account doesn't exist.");
    }
    return account;
  };

  const store: AccountStore = {
    async accounts() {
      return [...accounts.values()].map(plain);
    },
    async account(id) {
      const account = accounts.get(id);
      return account && plain(account);
    },
    async accountByEmail(email) {
      const wanted = normalizeEmail(email);
      const account = [...accounts.values()].find(
        (item) => item.email === wanted
      );
      return account && plain(account);
    },
    async createAccount(input) {
      checkNewAccount(input);
      const email = normalizeEmail(input.email);
      if ([...accounts.values()].some((item) => item.email === email)) {
        throw new AccountError("exists", `${email} already has an account.`);
      }
      if (input.password !== undefined) {
        checkNewPassword(input.password);
      }
      const account = {
        id: String(nextId++),
        email,
        name: input.name.trim(),
        kind: input.kind,
        admin: Boolean(input.admin),
        disabled: false,
        hash:
          input.password === undefined
            ? undefined
            : await hashPassword(input.password),
      };
      accounts.set(account.id, account);
      return plain(account);
    },
    async updateAccount(id, change) {
      const account = find(id);
      Object.assign(account, change);
      return plain(account);
    },
    async setPassword(id, password) {
      checkNewPassword(password);
      find(id).hash = await hashPassword(password);
    },
    async checkPassword(email, password) {
      const wanted = normalizeEmail(email);
      const account = [...accounts.values()].find(
        (item) => item.email === wanted
      );
      if (!account?.hash || account.disabled) {
        return undefined;
      }
      return (await verifyPassword(password, account.hash))
        ? plain(account)
        : undefined;
    },
    async createSession(accountId) {
      const secret = newSecret();
      sessions.set(sessionKey(secret), {
        accountId,
        expires: Date.now() + SESSION_DAYS * 86_400_000,
      });
      return secret;
    },
    async sessionAccount(secret) {
      const key = sessionKey(secret);
      const session = sessions.get(key);
      if (!session || session.expires < Date.now()) {
        sessions.delete(key);
        return undefined;
      }
      const account = accounts.get(session.accountId);
      return account && !account.disabled ? plain(account) : undefined;
    },
    async endSession(secret) {
      sessions.delete(sessionKey(secret));
    },
    async endSessions(accountId) {
      for (const [key, session] of sessions) {
        if (session.accountId === accountId) {
          sessions.delete(key);
        }
      }
    },
    async createPasswordLink(accountId) {
      find(accountId);
      for (const [key, link] of links) {
        if (link.accountId === accountId) {
          links.delete(key);
        }
      }
      const secret = newSecret();
      links.set(sessionKey(secret), {
        accountId,
        expires: Date.now() + LINK_DAYS * 86_400_000,
      });
      return secret;
    },
    async passwordLinkAccount(secret) {
      const link = links.get(sessionKey(secret));
      if (!link || link.expires < Date.now()) {
        return undefined;
      }
      const account = accounts.get(link.accountId);
      return account && !account.disabled ? plain(account) : undefined;
    },
    async usePasswordLink(secret, password) {
      const account = await store.passwordLinkAccount(secret);
      if (!account) {
        throw new AccountError(
          "missing",
          "This link has expired or was already used. Ask an admin for a new one."
        );
      }
      checkNewPassword(password);
      find(account.id).hash = await hashPassword(password);
      links.delete(sessionKey(secret));
      return account;
    },
    async projects() {
      return [...projects.values()];
    },
    async project(id) {
      return projects.get(id);
    },
    async createProject(project) {
      if (!PROJECT_ID.test(project.id)) {
        throw new AccountError(
          "invalid",
          "A project ID uses lowercase letters, digits, and dashes."
        );
      }
      if (projects.has(project.id)) {
        throw new AccountError("exists", `${project.id} already exists.`);
      }
      projects.set(project.id, { ...project });
      members.set(project.id, new Map());
      return { ...project };
    },
    async members(projectId) {
      return [...(members.get(projectId) ?? new Map()).entries()].map(
        ([accountId, role]) => ({ accountId, role })
      );
    },
    async setMember(projectId, member) {
      const list = members.get(projectId);
      if (!list) {
        throw new AccountError("missing", "That project doesn't exist.");
      }
      list.set(member.accountId, member.role);
    },
    async removeMember(projectId, accountId) {
      members.get(projectId)?.delete(accountId);
    },
  };
  return store;
}

/**
 * What an account may do in a project: its member role, capped by its
 * kind, or the admin's own kind for a project it isn't a member of.
 */
export async function projectRole(
  store: AccountStore,
  account: Account,
  projectId: string
): Promise<ProjectRole | undefined> {
  const member = (await store.members(projectId)).find(
    (item) => item.accountId === account.id
  );
  const role = member?.role ?? (account.admin ? account.kind : undefined);
  if (!role) {
    return undefined;
  }
  return account.kind === "viewer" ? "viewer" : role;
}
