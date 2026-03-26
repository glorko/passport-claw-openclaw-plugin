import { describe, it, expect } from "vitest";
import { generateEd25519SubjectKeyPair } from "./subjectKey.js";

describe("generateEd25519SubjectKeyPair", () => {
  it("produces public issuer JWK and storable private JWK", () => {
    const { subjectJwkForIssuer, subjectJwkToStore } = generateEd25519SubjectKeyPair();
    expect(subjectJwkForIssuer.kty).toBe("OKP");
    expect(subjectJwkForIssuer.crv).toBe("Ed25519");
    expect(subjectJwkForIssuer.x.length).toBeGreaterThan(10);
    expect(subjectJwkToStore.d).toBeDefined();
    expect(subjectJwkToStore.x).toBe(subjectJwkForIssuer.x);
  });
});
