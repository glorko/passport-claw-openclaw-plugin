/** Deterministic cute "pet" label from passport UUID (no PII beyond the id you already store). */

const NAMES = [
  "Pinchy",
  "Noodle",
  "Spark",
  "Whiskers",
  "Pixel",
  "Scholar",
  "Bloop",
  "Zephyr",
  "Mochi",
  "Tofu",
  "Crusty",
  "Shelly",
] as const;

/** FNV-1a-ish mix → index into NAMES. */
export function petNameFromPassportId(passportId: string): string {
  let h = 2166136261;
  for (let i = 0; i < passportId.length; i++) {
    h ^= passportId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h | 0) % NAMES.length;
  return NAMES[idx]!;
}

/** Short tail for display (last segment of UUID, no dashes). */
export function shortPassportTail(passportId: string): string {
  const s = passportId.replace(/-/g, "");
  return s.slice(-6).toLowerCase();
}
