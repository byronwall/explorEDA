/** The team server's account routes, for the sign-in and project pages. */

export interface TeamAccount {
  id: string;
  email: string;
  name: string;
  kind: "author" | "viewer";
  admin: boolean;
  disabled: boolean;
}

export interface TeamProject {
  id: string;
  name: string;
  role: "author" | "viewer";
}

export class TeamApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "TeamApiError";
  }
}

export async function teamCall<T>(
  url: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers:
      init.body === undefined ? {} : { "content-type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
  };
  if (!response.ok) {
    throw new TeamApiError(
      response.status,
      body.error ?? `${response.status} ${response.statusText}`
    );
  }
  return body as T;
}

/** The signed-in account, or undefined when nobody is signed in. */
export async function currentAccount() {
  try {
    return (await teamCall<{ account: TeamAccount }>("/api/session")).account;
  } catch (error) {
    if (error instanceof TeamApiError && error.status === 401) {
      return undefined;
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  return (
    await teamCall<{ account: TeamAccount }>("/api/session", {
      method: "POST",
      body: { email, password },
    })
  ).account;
}

export async function signOut() {
  await teamCall("/api/session", { method: "DELETE" });
}

export function listProjects() {
  return teamCall<TeamProject[]>("/api/projects");
}

/** True when this page was served by a team server rather than the CLI. */
export async function isTeamServer() {
  try {
    const response = await fetch("/api/health");
    return response.ok;
  } catch {
    return false;
  }
}

export interface Person {
  id: string;
  name: string;
  email: string;
  kind: "author" | "viewer";
}

export interface ProjectMember {
  accountId: string;
  name: string;
  email: string;
  kind: "author" | "viewer";
  disabled: boolean;
  role: "author" | "viewer";
}

/** True when the server has no accounts yet and needs its first admin. */
export async function setupNeeded() {
  return (await teamCall<{ needed: boolean }>("/api/setup")).needed;
}

export async function setUpAdmin(input: {
  name: string;
  email: string;
  password: string;
}) {
  return (
    await teamCall<{ account: TeamAccount }>("/api/setup", {
      method: "POST",
      body: input,
    })
  ).account;
}

/** Who a set-password link is for. */
export function passwordLinkOwner(secret: string) {
  return teamCall<{ email: string; name: string }>(
    `/api/password-link?secret=${encodeURIComponent(secret)}`
  );
}

export async function redeemPasswordLink(secret: string, password: string) {
  return (
    await teamCall<{ account: TeamAccount }>("/api/password-link", {
      method: "POST",
      body: { secret, password },
    })
  ).account;
}

/** The address a set-password link opens. */
export const passwordLinkUrl = (secret: string) =>
  `${window.location.origin}/?link=${encodeURIComponent(secret)}`;

export function listAccounts() {
  return teamCall<TeamAccount[]>("/api/accounts");
}

export function createAccount(input: {
  name: string;
  email: string;
  kind: "author" | "viewer";
  admin: boolean;
}) {
  return teamCall<{ account: TeamAccount; secret: string }>("/api/accounts", {
    method: "POST",
    body: input,
  });
}

export function updateAccount(
  id: string,
  change: Partial<Pick<TeamAccount, "name" | "kind" | "admin" | "disabled">>
) {
  return teamCall<TeamAccount>(`/api/accounts/${id}`, {
    method: "PATCH",
    body: change,
  });
}

export function newPasswordLink(id: string) {
  return teamCall<{ secret: string }>(`/api/accounts/${id}/link`, {
    method: "POST",
  });
}

export function listPeople() {
  return teamCall<Person[]>("/api/people");
}

export function createProject(name: string) {
  return teamCall<TeamProject>("/api/projects", {
    method: "POST",
    body: { name },
  });
}

export function listMembers(project: string) {
  return teamCall<ProjectMember[]>(
    `/api/projects/${encodeURIComponent(project)}/members`
  );
}

export function setMember(
  project: string,
  accountId: string,
  role: "author" | "viewer"
) {
  return teamCall(
    `/api/projects/${encodeURIComponent(project)}/members/${accountId}`,
    { method: "PUT", body: { role } }
  );
}

export function removeMember(project: string, accountId: string) {
  return teamCall(
    `/api/projects/${encodeURIComponent(project)}/members/${accountId}`,
    { method: "DELETE" }
  );
}
