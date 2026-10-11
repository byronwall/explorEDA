// Byron's license admin commands. Reads LICENSE_SERVICE_URL and ADMIN_TOKEN.
//   pnpm admin report
//   pnpm admin list
//   pnpm admin failures
//   pnpm admin issue --email you@x.com --licensee "Name" --plan community --until 2099-12-31 [--seats 1] [--no-email]
//   pnpm admin reissue lic_xxx
//   pnpm admin revoke lic_xxx
const base = process.env.LICENSE_SERVICE_URL ?? "http://localhost:8787";
const token = process.env.ADMIN_TOKEN ?? "local-admin-token";
const [command, ...args] = process.argv.slice(2);

function flag(name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

async function call(method: string, path: string, body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    console.error(response.status, text);
    process.exit(1);
  }
  return JSON.parse(text) as unknown;
}

switch (command) {
  case "report":
    console.log(JSON.stringify(await call("GET", "/admin/report"), null, 2));
    break;
  case "list": {
    const licenses = (await call("GET", "/admin/licenses")) as Array<
      Record<string, unknown>
    >;
    console.table(
      licenses.map(
        ({ id, licensee, email, plan, seats, status, updatesUntil }) => ({
          id,
          licensee,
          email,
          plan,
          seats,
          status,
          updatesUntil,
        })
      )
    );
    break;
  }
  case "failures":
    console.table(await call("GET", "/admin/failures"));
    break;
  case "issue":
    console.log(
      JSON.stringify(
        await call("POST", "/admin/licenses", {
          email: flag("email"),
          licensee: flag("licensee"),
          company: flag("licensee"),
          plan: flag("plan") ?? "commercial",
          seats: flag("seats") ? Number(flag("seats")) : undefined,
          updatesUntil: flag("until"),
          expires: flag("expires"),
          sendEmail: !args.includes("--no-email"),
        }),
        null,
        2
      )
    );
    break;
  case "reissue":
  case "revoke":
    console.log(
      JSON.stringify(
        await call("POST", `/admin/licenses/${args[0]}/${command}`),
        null,
        2
      )
    );
    break;
  default:
    console.log(
      "Commands: report, list, failures, issue, reissue <id>, revoke <id>. See the comment at the top of scripts/admin.ts."
    );
}
