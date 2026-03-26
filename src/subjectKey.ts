import { generateKeyPairSync } from "node:crypto";
import type { SubjectJwk } from "./issuerClient.js";

/**
 * Generate a new Ed25519 holder key. Send only the public JWK to the issuer;
 * persist the full private JWK locally (demo-grade file store).
 */
export function generateEd25519SubjectKeyPair(): {
  subjectJwkForIssuer: SubjectJwk;
  subjectJwkToStore: Record<string, unknown>;
} {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const pub = publicKey.export({ format: "jwk" }) as { kty: string; crv: string; x: string };
  const subjectJwkForIssuer: SubjectJwk = {
    kty: "OKP",
    crv: "Ed25519",
    x: pub.x,
  };
  const subjectJwkToStore = privateKey.export({ format: "jwk" }) as Record<string, unknown>;
  return { subjectJwkForIssuer, subjectJwkToStore };
}
