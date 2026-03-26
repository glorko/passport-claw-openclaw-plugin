import { describe, it, expect } from "vitest";
import { buildPassportAsciiCard } from "./passportAsciiCard.js";

describe("buildPassportAsciiCard", () => {
  it("every line is 44 chars (passport width)", () => {
    const art = buildPassportAsciiCard({
      holderName: "DemoClaw",
      passportId: "caafef38-b462-4fcc-b10f-bb904742eb40",
      issuerUrl: "http://127.0.0.1:19081",
      tailTag: "42eb40",
    });
    const lines = art.split("\n");
    for (const line of lines) {
      expect(line.length).toBe(44);
    }
  });

  it("includes holder and tail in MRZ", () => {
    const art = buildPassportAsciiCard({
      holderName: "X",
      passportId: "p1",
      issuerUrl: "http://h/",
      tailTag: "abc123",
    });
    expect(art).toMatch(/OPENCLAW/);
    expect(art).toMatch(/abc123/);
  });
});
