/**
 * Silly passport-shaped ASCII art for /passport status (monospace-friendly).
 * Each body line is 44 chars total (matches top/bottom borders).
 */

function clamp(s: string, max: number): string {
  const t = s.replace(/\r?\n/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function issuerShort(issuer: string): string {
  try {
    const u = new URL(issuer);
    return u.host || issuer;
  } catch {
    return clamp(issuer, 28);
  }
}

const PHOTO_W = 14;
const RIGHT_W = 23;

function padPhoto(s: string): string {
  const t = s.length > PHOTO_W ? s.slice(0, PHOTO_W) : s;
  return t.padEnd(PHOTO_W);
}

function row(photoCol: string, rightCol: string): string {
  const p = padPhoto(photoCol);
  const r = rightCol.length > RIGHT_W ? rightCol.slice(0, RIGHT_W - 1) + "…" : rightCol;
  return `| ${p} | ${r.padEnd(RIGHT_W)} |`;
}

/** Single full-width inner line: `| ` + 40 chars + ` |` = 44 total. */
function barLine(inner: string): string {
  const c = clamp(inner, 40);
  return `| ${c.padEnd(40)} |`;
}

/** Tiny deterministic "stamp" pick from passport id (same id → same doodle). */
function pickDoodle(passportId: string): string[] {
  let h = 0;
  for (let i = 0; i < passportId.length; i++) {
    h = (h * 31 + passportId.charCodeAt(i)) | 0;
  }
  const n = Math.abs(h) % 3;
  if (n === 0) {
    return ["   \\___/   ", "   (o o)   ", "   ( > )   ", "    U U    ", "  ~lobster~"];
  }
  if (n === 1) {
    return ["    .--.    ", "   /    \\   ", "  | ^  ^ |  ", "   \\____/   ", "  claw-mail  "];
  }
  return ["    *  *    ", "   *    *   ", "  *pinch!*  ", "   *    *   ", "  certified  "];
}

export type PassportAsciiOptions = {
  holderName: string;
  passportId: string;
  issuerUrl: string;
  tailTag: string;
};

/**
 * Returns plain text (no markdown). Caller may wrap in a fenced code block.
 */
export function buildPassportAsciiCard(opts: PassportAsciiOptions): string {
  const holder = clamp(opts.holderName, 18);
  const host = issuerShort(opts.issuerUrl);
  const idLine = clamp(opts.passportId, 36);
  const mrz = `OC<<${opts.tailTag}<<OPENCLAW<<NOTREAL<<`;
  const doodle = pickDoodle(opts.passportId);

  const lines = [
    "+------------------------------------------+",
    barLine("  OPENCLAW  PASSPORT  (totally official)"),
    "+------------------------+-----------------+",
    row("  [ PHOTO ]  ", "HOLDER"),
    row(doodle[0], holder),
    row(doodle[1], "TYPE"),
    row(doodle[2], "OpenClaw Agent"),
    row(doodle[3], "CLASS"),
    row(doodle[4], "Pinch-Grade I"),
    "+------------------------+-----------------+",
    barLine("PASSPORT NO. (long one - sorry)"),
    barLine(`NO. ${idLine}`),
    "+------------------------------------------+",
    barLine("ISSUER / HOME PORT"),
    barLine(host),
    barLine("STATUS: VALID until the next npm i"),
    "+------------------------------------------+",
    barLine("STAMPS: [OK] [CUTE] [NOT A LEGAL ID]"),
    "+------------------------------------------+",
    barLine("MACHINE-READABLE ZONE (pretend)"),
    barLine(`MRZ ${mrz}`),
    "+------------------------------------------+",
    barLine("not a travel document - demo credential"),
    "+------------------------------------------+",
  ];
  return lines.join("\n");
}
