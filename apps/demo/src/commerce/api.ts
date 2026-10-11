import { LICENSE_SERVICE_URL } from "./config";

/** Posts a form to the license service and returns its error text, if any. */
export async function postToLicenseService(
  path: "/api/trial" | "/api/community" | "/api/quote" | "/api/portal-link",
  body: Record<string, unknown>
): Promise<string | null> {
  if (!LICENSE_SERVICE_URL) {
    return "Requests open soon. Write to sales@exploreda.dev in the meantime.";
  }
  try {
    const response = await fetch(`${LICENSE_SERVICE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) return null;
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    return result.error ?? "Something went wrong. Try again.";
  } catch {
    return "Couldn't reach the license service. Check your connection and try again.";
  }
}
