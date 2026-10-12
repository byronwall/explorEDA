/* eslint-disable no-console -- a command-line tool prints its results */
import { readFileSync } from "node:fs";
import { RELEASE_DATE } from "@/license/releaseDate";
import { DEVELOPMENT_KEY_IDS, LICENSE_PUBLIC_KEYS } from "@/license/publicKeys";
import { checkLicenseKey, describePlan } from "@/license/token";

const USAGE = `Usage:
  exploreda license check [--key <key> | --key-file <path>] [--json] [--allow-dev]

Checks a license key against this installed version, offline. Without
--key or --key-file it reads EXPLOREDA_LICENSE_KEY.

Exits 0 when licensed, 2 when unlicensed, expired, or this version is newer
than the license's update period, and 3 when the key is not valid.`;

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main(args: string[]): Promise<number> {
  if (args[0] !== "license" || args[1] !== "check") {
    console.log(USAGE);
    return args.length === 0 || args.includes("--help") ? 0 : 1;
  }
  const keyFile = option(args, "--key-file");
  const key =
    option(args, "--key") ??
    (keyFile ? readFileSync(keyFile, "utf8") : undefined) ??
    process.env.EXPLOREDA_LICENSE_KEY;
  const status = await checkLicenseKey(key, {
    publicKeys: LICENSE_PUBLIC_KEYS,
    developmentKeyIds: DEVELOPMENT_KEY_IDS,
    // Development keys only count on a development host; a CI check is not one.
    developmentHost: args.includes("--allow-dev"),
    releaseDate: RELEASE_DATE,
    now: new Date(),
  });
  if (args.includes("--json")) {
    console.log(
      JSON.stringify({ ...status, releaseDate: RELEASE_DATE }, null, 2)
    );
  } else {
    console.log(status.message);
    if (status.license) {
      const license = status.license;
      console.log(`  Licensee:        ${license.licensee}`);
      console.log(`  Plan:            ${describePlan(license)}`);
      console.log(`  Updates through: ${license.updatesUntil.slice(0, 10)}`);
      if (license.expires) {
        console.log(`  Trial ends:      ${license.expires.slice(0, 10)}`);
      }
      console.log(`  License ID:      ${license.id}`);
    }
    console.log(`  This version:    released ${RELEASE_DATE}`);
  }
  if (status.state === "licensed") return 0;
  return status.state === "invalid" ? 3 : 2;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error);
    process.exit(1);
  }
);
