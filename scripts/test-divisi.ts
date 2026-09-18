import assert from "node:assert";
import { normalizePhone } from "../src/lib/phone";
import { divisionSchema } from "../src/lib/validation";

// normalizePhone — kalau ini salah, peserta sah akan ditolak "nomor tidak cocok"
assert.strictEqual(normalizePhone("08123456789"), "08123456789");
assert.strictEqual(normalizePhone("+628123456789"), "08123456789");
assert.strictEqual(normalizePhone("628123456789"), "08123456789");
assert.strictEqual(normalizePhone("0812-3456-789"), "08123456789");
assert.strictEqual(normalizePhone("+62 812 3456 789"), "08123456789");
assert.strictEqual(normalizePhone("(0812) 3456789"), "08123456789");
assert.notStrictEqual(normalizePhone("08123456789"), normalizePhone("08123456780"));

// divisionSchema — gerbang minimal 1 divisi & tolak nilai ngawur
assert.strictEqual(divisionSchema.safeParse({ divisions: [] }).success, false);
assert.strictEqual(divisionSchema.safeParse({ divisions: ["PROGRAMMING"] }).success, true);
assert.strictEqual(
  divisionSchema.safeParse({ divisions: ["PROGRAMMING", "UI_UX"] }).success,
  true
);
assert.strictEqual(divisionSchema.safeParse({ divisions: ["HACKING"] }).success, false);
assert.strictEqual(divisionSchema.safeParse({ divisions: "PROGRAMMING" }).success, false);

console.log("OK — normalizePhone & divisionSchema");
