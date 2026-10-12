import { verifyAsync } from "@noble/ed25519";

/** What a license key grants. Signed by the license service, read offline. */
export interface LicensePayload {
  /** Format version of this payload. */
  v: 1;
  /** Which signing key made the signature; picks the public key to check. */
  kid: string;
  /** License ID, shown on the certificate and in support requests. */
  id: string;
  /** Company or person the license names. */
  licensee: string;
  plan: LicensePlan;
  /** Developer seats bought; 0 for plans without seats. */
  seats: number;
  /** Where the licensee may use the package. */
  scope: LicenseScope;
  /** ISO date the key was issued. */
  issued: string;
  /**
   * ISO date the update period ends. Versions released on or before it stay
   * licensed for good; later versions need a renewal.
   */
  updatesUntil: string;
  /** ISO date a trial stops working. Paid keys leave it out. */
  expires?: string;
}

export type LicensePlan = "commercial" | "oem" | "trial" | "community";

/** `internal` covers internal tools and the licensee's own hosted apps. */
export type LicenseScope = "internal" | "oem";

export type LicenseState =
  | "licensed"
  | "unlicensed"
  | "invalid"
  | "expired"
  | "updates-ended";

export interface LicenseStatus {
  state: LicenseState;
  /** Present when the key parsed and its signature checked out. */
  license?: LicensePayload;
  /** One sentence for the console, the settings panel, and the CLI. */
  message: string;
}

export interface LicenseCheckOptions {
  /** Public keys by `kid`, as base64url Ed25519 keys. */
  publicKeys: Record<string, string>;
  /** Signing key IDs that only count on a local development host. */
  developmentKeyIds?: readonly string[];
  /** Whether this runs on localhost or another development host. */
  developmentHost: boolean;
  /** Release date of the installed package, ISO. */
  releaseDate: string;
  now: Date;
}

const PREFIX = "EDA1";

export function base64UrlToBytes(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** The bytes a signature covers: the prefix and the encoded payload. */
export function signedPart(encodedPayload: string): Uint8Array {
  return new TextEncoder().encode(`${PREFIX}.${encodedPayload}`);
}

export function encodePayload(payload: LicensePayload): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function formatLicenseKey(
  encodedPayload: string,
  signature: Uint8Array
): string {
  return `${PREFIX}.${encodedPayload}.${bytesToBase64Url(signature)}`;
}

/**
 * Reads a key's payload without checking its signature, for display only.
 * Returns undefined for text that is not a license key.
 */
export function readLicensePayload(key: string): LicensePayload | undefined {
  const parts = key.trim().split(".");
  if (parts.length !== 3 || parts[0] !== PREFIX) return undefined;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(parts[1]!))
    ) as unknown;
    return isPayload(payload) ? payload : undefined;
  } catch {
    return undefined;
  }
}

function isPayload(value: unknown): value is LicensePayload {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    item.v === 1 &&
    typeof item.kid === "string" &&
    typeof item.id === "string" &&
    typeof item.licensee === "string" &&
    ["commercial", "oem", "trial", "community"].includes(item.plan as string) &&
    typeof item.seats === "number" &&
    ["internal", "oem"].includes(item.scope as string) &&
    typeof item.issued === "string" &&
    typeof item.updatesUntil === "string" &&
    (item.expires === undefined || typeof item.expires === "string")
  );
}

/** Midnight UTC at the end of an ISO date, so a date covers its whole day. */
function endOfDay(isoDate: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  // A date the service never writes counts as already past.
  if (!match) return 0;
  const [, year, month, day] = match.map(Number);
  return Date.UTC(year!, month! - 1, day!, 23, 59, 59, 999);
}

/**
 * Checks a key against the installed release, offline. Never throws: every
 * problem becomes a status, because a key problem must not break a host app.
 */
export async function checkLicenseKey(
  key: string | undefined,
  options: LicenseCheckOptions
): Promise<LicenseStatus> {
  const text = key?.trim();
  if (!text) {
    return {
      state: "unlicensed",
      message:
        "explorEDA is unlicensed. Commercial use needs a license: https://exploreda.dev/pricing",
    };
  }
  const parts = text.split(".");
  const license = readLicensePayload(text);
  if (!license || parts.length !== 3) {
    return invalid("The license key is not in the expected format.");
  }
  const publicKey = options.publicKeys[license.kid];
  if (!publicKey) {
    return invalid(
      `The license key was signed with an unknown key (${license.kid}). Update explorEDA or ask for a new key.`
    );
  }
  let verified = false;
  try {
    verified = await verifyAsync(
      base64UrlToBytes(parts[2]!),
      signedPart(parts[1]!),
      base64UrlToBytes(publicKey)
    );
  } catch {
    verified = false;
  }
  if (!verified) {
    return invalid("The license key's signature does not match its contents.");
  }
  if (
    options.developmentKeyIds?.includes(license.kid) &&
    !options.developmentHost
  ) {
    return invalid(
      "This is a development license key. It only works on localhost.",
      license
    );
  }
  const now = options.now.getTime();
  if (license.expires && endOfDay(license.expires) < now) {
    return {
      state: "expired",
      license,
      message: `The explorEDA trial for ${license.licensee} ended on ${license.expires.slice(0, 10)}. Buy a license: https://exploreda.dev/pricing`,
    };
  }
  if (endOfDay(license.updatesUntil) < endOfDay(options.releaseDate)) {
    return {
      state: "updates-ended",
      license,
      message: `The explorEDA license for ${license.licensee} covers versions released through ${license.updatesUntil.slice(0, 10)}; this version was released ${options.releaseDate.slice(0, 10)}. Renew, or install an earlier version.`,
    };
  }
  return {
    state: "licensed",
    license,
    message: `explorEDA is licensed to ${license.licensee} (${describePlan(license)}), with updates through ${license.updatesUntil.slice(0, 10)}.`,
  };
}

export function describePlan(license: LicensePayload): string {
  switch (license.plan) {
    case "commercial":
      return `${license.seats} developer${license.seats === 1 ? "" : "s"}${license.scope === "oem" ? ", redistribution" : ""}`;
    case "oem":
      return "redistribution";
    case "trial":
      return "trial";
    case "community":
      return "community";
  }
}

function invalid(message: string, license?: LicensePayload): LicenseStatus {
  return {
    state: "invalid",
    license,
    message: `${message} explorEDA keeps working and shows an unlicensed notice.`,
  };
}
