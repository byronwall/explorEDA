// Makes a production signing key pair.
//   pnpm --filter license-service keygen prod-2026 ~/secure/exploreda-prod-2026.json
//
// Writes the private key to the file you name (keep it out of the repo and
// back it up offline), adds the public key to the package's
// LICENSE_PUBLIC_KEYS, and prints the commands that put the private key in
// the Worker. Run it once per key; rotation adds a new key ID.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getPublicKeyAsync, utils } from "@noble/ed25519";

const [kid, outFile] = process.argv.slice(2);
if (!kid || !outFile || !/^[a-z0-9-]+$/.test(kid)) {
  console.log(
    "Usage: pnpm keygen <key-id such as prod-2026> <private-key-file>"
  );
  process.exit(1);
}
const target = path.resolve(outFile);
const repo = path.resolve(import.meta.dirname, "../../..");
if (target.startsWith(repo + path.sep)) {
  console.error("Write the private key outside the repository.");
  process.exit(1);
}
if (existsSync(target)) {
  console.error(`${target} exists; pick a new file.`);
  process.exit(1);
}

const encode = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const secret = utils.randomSecretKey();
const publicKey = encode(await getPublicKeyAsync(secret));
writeFileSync(
  target,
  JSON.stringify(
    {
      kid,
      privateKey: encode(secret),
      publicKey,
      created: new Date().toISOString(),
    },
    null,
    2
  ) + "\n",
  { mode: 0o600 }
);

const keysFile = path.join(
  repo,
  "packages/explorEDA/src/license/publicKeys.ts"
);
const source = readFileSync(keysFile, "utf8");
const marker =
  "  // Production keys are added by apps/license-service/scripts/keygen.ts.\n";
const anchor = source.includes(marker)
  ? marker
  : "export const LICENSE_PUBLIC_KEYS: Record<string, string> = {\n";
writeFileSync(
  keysFile,
  source.replace(anchor, `${anchor}  "${kid}": "${publicKey}",\n`)
);

console.log(`Private key written to ${target} (mode 600). Back it up offline.`);
console.log(
  `Public key added to packages/explorEDA/src/license/publicKeys.ts as "${kid}".`
);
console.log("\nNext:");
console.log(
  `  node -e 'console.log(require("${target}").privateKey)' | pnpm --filter license-service exec wrangler secret put SIGNING_PRIVATE_KEY --env production`
);
console.log(
  `  Set SIGNING_KEY_ID = "${kid}" under [env.production.vars] in apps/license-service/wrangler.toml.`
);
console.log(
  "  Release the package so it knows the new public key, before selling with it."
);
