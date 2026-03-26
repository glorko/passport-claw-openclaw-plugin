import { describe, it, expect } from "vitest";
import { petNameFromPassportId, shortPassportTail } from "./petName.js";

describe("petNameFromPassportId", () => {
  it("is stable for a given passport id", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(petNameFromPassportId(id)).toBe(petNameFromPassportId(id));
  });

  it("shortPassportTail returns 6 hex chars", () => {
    expect(shortPassportTail("550e8400-e29b-41d4-a716-446655440000")).toMatch(/^[0-9a-f]{6}$/);
  });
});
