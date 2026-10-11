import { getPublicKeyAsync, signAsync } from "@noble/ed25519";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  encodePayload,
  formatLicenseKey,
  signedPart,
  type LicensePayload,
} from "./token";

/**
 * Signs a license key. Used by the license service and scripts only; no
 * package entry exports it, so it never reaches the published bundle.
 */
export async function signLicense(
  payload: LicensePayload,
  privateKey: string
): Promise<string> {
  const encoded = encodePayload(payload);
  const signature = await signAsync(
    signedPart(encoded),
    base64UrlToBytes(privateKey)
  );
  return formatLicenseKey(encoded, signature);
}

/** The public key that matches a base64url private key. */
export async function publicKeyFor(privateKey: string): Promise<string> {
  return bytesToBase64Url(
    await getPublicKeyAsync(base64UrlToBytes(privateKey))
  );
}
