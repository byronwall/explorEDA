// Posts a fixture to a local license service running with the fake provider.
//   pnpm replay fixtures/purchase.json [--url http://localhost:8787]
import { readFileSync } from "node:fs";

const [file, ...rest] = process.argv.slice(2);
if (!file) {
  console.log(
    "Usage: pnpm replay <fixture.json> [--url http://localhost:8787]"
  );
  process.exit(1);
}
const urlIndex = rest.indexOf("--url");
const base = urlIndex >= 0 ? rest[urlIndex + 1] : "http://localhost:8787";
const secret = process.env.FAKE_WEBHOOK_SECRET ?? "local-fake-secret";

const response = await fetch(`${base}/webhooks/payments`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-fake-signature": secret },
  body: readFileSync(file, "utf8"),
});
console.log(response.status, await response.text());
process.exit(response.ok ? 0 : 1);
