/* eslint-disable no-console -- the license status is reported once in the console */
import { useEffect, useState, useSyncExternalStore } from "react";
import { DEVELOPMENT_KEY_IDS, LICENSE_PUBLIC_KEYS } from "./publicKeys";
import { checkLicenseKey, type LicenseStatus } from "./token";

import { RELEASE_DATE } from "./releaseDate";

export { RELEASE_DATE };

let globalKey: string | undefined;
const listeners = new Set<() => void>();
const checks = new Map<string, Promise<LicenseStatus>>();
const reported = new Set<string>();

/**
 * Sets the license key for every explorEDA workspace on the page. Call it
 * once at startup; a `licenseKey` prop on a workspace takes precedence.
 */
export function setLicenseKey(key: string | undefined): void {
  globalKey = key?.trim() || undefined;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isDevelopmentHost(hostname: string | undefined): boolean {
  if (!hostname) return false;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".test")
  );
}

/**
 * Checks a key in this page, offline, once per key. The result is also
 * written to the console once.
 */
export function getLicenseStatus(key?: string): Promise<LicenseStatus> {
  const text = key?.trim() || globalKey || "";
  let check = checks.get(text);
  if (!check) {
    check = checkLicenseKey(text, {
      publicKeys: LICENSE_PUBLIC_KEYS,
      developmentKeyIds: DEVELOPMENT_KEY_IDS,
      developmentHost: isDevelopmentHost(globalThis.location?.hostname),
      releaseDate: RELEASE_DATE,
      now: new Date(),
    }).then((status) => {
      if (!reported.has(text)) {
        reported.add(text);
        if (status.state === "licensed") console.info(status.message);
        else console.warn(status.message);
      }
      return status;
    });
    checks.set(text, check);
  }
  return check;
}

/**
 * The license status for a workspace. Undefined while the check runs, which
 * takes one microtask-scale signature check.
 */
export function useLicenseStatus(key?: string): LicenseStatus | undefined {
  const shared = useSyncExternalStore(
    subscribe,
    () => globalKey,
    () => globalKey
  );
  const effective = key?.trim() || shared || "";
  const [status, setStatus] = useState<{
    key: string;
    status: LicenseStatus;
  }>();
  useEffect(() => {
    let current = true;
    void getLicenseStatus(effective).then((result) => {
      if (current) setStatus({ key: effective, status: result });
    });
    return () => {
      current = false;
    };
  }, [effective]);
  return status?.key === effective ? status.status : undefined;
}
