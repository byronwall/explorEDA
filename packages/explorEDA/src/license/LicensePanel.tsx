import { useWorkspaceLicense } from "./LicenseContext";
import { RELEASE_DATE } from "./releaseDate";
import { describePlan } from "./token";

const PRICING_URL = "https://exploreda.dev/pricing";
const LICENSE_URL = "https://exploreda.dev/license";

const HEADINGS = {
  licensed: "Licensed",
  unlicensed: "No license key",
  invalid: "License key not valid",
  expired: "Trial ended",
  "updates-ended": "This version is newer than the license covers",
} as const;

/** The License tab of workspace settings: who holds the license, and how to fix it. */
export function LicensePanel() {
  const status = useWorkspaceLicense();
  if (!status) {
    return <p className="eda-license-panel">Checking the license key…</p>;
  }
  const license = status.license;
  return (
    <div className="eda-license-panel" data-state={status.state}>
      <h3>{HEADINGS[status.state]}</h3>
      {status.state !== "unlicensed" && <p>{status.message}</p>}
      {license && (
        <dl>
          <dt>Licensee</dt>
          <dd>{license.licensee}</dd>
          <dt>Plan</dt>
          <dd>{describePlan(license)}</dd>
          <dt>Updates through</dt>
          <dd>{license.updatesUntil.slice(0, 10)}</dd>
          {license.expires && (
            <>
              <dt>Trial ends</dt>
              <dd>{license.expires.slice(0, 10)}</dd>
            </>
          )}
          <dt>License ID</dt>
          <dd>{license.id}</dd>
        </dl>
      )}
      <dl>
        <dt>This version released</dt>
        <dd>{RELEASE_DATE}</dd>
      </dl>
      {status.state !== "licensed" && (
        <p>
          explorEDA is free for evaluation, non-commercial use, and small teams.
          Commercial use needs a license key, passed as <code>licenseKey</code>{" "}
          or with <code>setLicenseKey()</code> from{" "}
          <code>exploreda/license</code>.
        </p>
      )}
      <p className="eda-license-links">
        <a href={PRICING_URL} target="_blank" rel="noreferrer">
          Pricing
        </a>
        <a href={LICENSE_URL} target="_blank" rel="noreferrer">
          Who needs a license
        </a>
      </p>
    </div>
  );
}
