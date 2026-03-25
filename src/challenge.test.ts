import { describe, it, expect } from "vitest";
import { parseChallengeJson } from "./challenge.js";

describe("parseChallengeJson", () => {
  it("parses missing-presentation challenge", () => {
    const j = JSON.stringify({
      type: "https://passport.claw/errors/missing-presentation",
      title: "Need proof",
      status: 401,
      verifier_url: "http://v",
      passport_docs_url: "http://d",
    });
    const c = parseChallengeJson(j);
    expect(c?.verifier_url).toBe("http://v");
  });

  it("returns null for non-challenge", () => {
    expect(parseChallengeJson("{}")).toBeNull();
  });
});
