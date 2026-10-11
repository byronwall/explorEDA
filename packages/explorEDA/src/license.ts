// The `exploreda/license` entry: set and check a license key without loading
// the workspace, for example in a CI script or before the first render.
export {
  setLicenseKey,
  getLicenseStatus,
  RELEASE_DATE,
} from "@/license/licenseStore";
export {
  checkLicenseKey,
  describePlan,
  readLicensePayload,
} from "@/license/token";
export { LICENSE_PUBLIC_KEYS } from "@/license/publicKeys";
export type {
  LicenseCheckOptions,
  LicensePayload,
  LicensePlan,
  LicenseScope,
  LicenseState,
  LicenseStatus,
} from "@/license/token";
