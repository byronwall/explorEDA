import { createContext, useContext, type ReactNode } from "react";
import { useLicenseStatus } from "./licenseStore";
import type { LicenseStatus } from "./token";

const LicenseContext = createContext<LicenseStatus | undefined>(undefined);

/** Checks the workspace's license key and shares the result with its UI. */
export function LicenseProvider({
  licenseKey,
  children,
}: {
  licenseKey?: string;
  children: ReactNode;
}) {
  const status = useLicenseStatus(licenseKey);
  return (
    <LicenseContext.Provider value={status}>{children}</LicenseContext.Provider>
  );
}

/** Undefined while the key is checked. */
export function useWorkspaceLicense(): LicenseStatus | undefined {
  return useContext(LicenseContext);
}
