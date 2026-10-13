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
