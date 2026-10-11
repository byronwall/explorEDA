import { describe, expect, it } from "vitest";
import { publicKeyFor, signLicense } from "./sign";
import {
  checkLicenseKey,
  readLicensePayload,
  type LicensePayload,
} from "./token";
import { DEVELOPMENT_KEY_IDS, LICENSE_PUBLIC_KEYS } from "./publicKeys";

// The development key pair. Its private half is public on purpose; keys it
// signs only count on a development host.
const DEV_PRIVATE_KEY = "OQUkqhgAWUY6KYM6jaUiV2yk2SvsO2iARwJN7NiowEo";

const base: LicensePayload = {
  v: 1,
  kid: "dev-1",
  id: "lic_test",
  licensee: "Acme Corp",
  plan: "commercial",
  seats: 5,
  scope: "internal",
  issued: "2026-10-11",
  updatesUntil: "2027-10-11",
};

const options = {
  publicKeys: LICENSE_PUBLIC_KEYS,
  developmentKeyIds: DEVELOPMENT_KEY_IDS,
  developmentHost: true,
  releaseDate: "2026-11-01",
  now: new Date("2026-11-02T12:00:00Z"),
};

describe("license keys", () => {
  it("keeps the development public key in step with its private key", async () => {
    expect(await publicKeyFor(DEV_PRIVATE_KEY)).toBe(
      LICENSE_PUBLIC_KEYS["dev-1"]
    );
  });

  it("reports no key as unlicensed", async () => {
    expect((await checkLicenseKey(undefined, options)).state).toBe(
      "unlicensed"
    );
    expect((await checkLicenseKey("  ", options)).state).toBe("unlicensed");
  });

  it("accepts a signed key and names the licensee", async () => {
    const key = await signLicense(base, DEV_PRIVATE_KEY);
    const status = await checkLicenseKey(key, options);
    expect(status.state).toBe("licensed");
    expect(status.message).toContain("Acme Corp");
    expect(status.message).toContain("5 developers");
    expect(readLicensePayload(key)?.licensee).toBe("Acme Corp");
  });

  it("rejects a key whose payload was edited", async () => {
    const key = await signLicense(base, DEV_PRIVATE_KEY);
    const [prefix, , signature] = key.split(".");
    const forged = await signLicense({ ...base, seats: 500 }, DEV_PRIVATE_KEY);
    const tampered = `${prefix}.${forged.split(".")[1]}.${signature}`;
    expect((await checkLicenseKey(tampered, options)).state).toBe("invalid");
  });

  it("rejects text that is not a key, and unknown signing keys", async () => {
    expect((await checkLicenseKey("hello", options)).state).toBe("invalid");
    const other = await signLicense(
      { ...base, kid: "prod-9" },
      DEV_PRIVATE_KEY
    );
    const status = await checkLicenseKey(other, options);
    expect(status.state).toBe("invalid");
    expect(status.message).toContain("prod-9");
  });

  it("accepts development keys only on a development host", async () => {
    const key = await signLicense(base, DEV_PRIVATE_KEY);
    const status = await checkLicenseKey(key, {
      ...options,
      developmentHost: false,
    });
    expect(status.state).toBe("invalid");
    expect(status.message).toContain("localhost");
  });

  it("keeps versions released during the update period licensed", async () => {
    const key = await signLicense(
      { ...base, updatesUntil: "2026-11-01" },
      DEV_PRIVATE_KEY
    );
    // Long after the update period, the same version stays licensed.
    const later = { ...options, now: new Date("2030-01-01T00:00:00Z") };
    expect((await checkLicenseKey(key, later)).state).toBe("licensed");
    // A version released after the period needs a renewal.
    const newer = { ...later, releaseDate: "2026-11-02" };
    expect((await checkLicenseKey(key, newer)).state).toBe("updates-ended");
  });

  it("ends a trial at the end of its expiry day", async () => {
    const key = await signLicense(
      { ...base, plan: "trial", seats: 0, expires: "2026-11-02" },
      DEV_PRIVATE_KEY
    );
    expect((await checkLicenseKey(key, options)).state).toBe("licensed");
    const after = { ...options, now: new Date("2026-11-03T00:00:01Z") };
    expect((await checkLicenseKey(key, after)).state).toBe("expired");
  });
});
