/**
 * Public keys that sign explorEDA license keys, by key ID.
 *
 * To rotate, add the new key here and release; keep old keys so existing
 * licenses stay valid. Remove a key only if its private half leaked.
 */
export const LICENSE_PUBLIC_KEYS: Record<string, string> = {
  // Development key. Its private half is in apps/license-service/dev-keys.json
  // and is public, so keys it signs only count on a development host.
  "dev-1": "cWV6BCov2iw60aQzmCMk-5eS3_PCjZ_N1a5Va5vLNOw",
  // Production keys are added by apps/license-service/scripts/keygen.ts.
};

export const DEVELOPMENT_KEY_IDS: readonly string[] = ["dev-1"];
