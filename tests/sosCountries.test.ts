import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COUNTRIES,
  CONSULAR,
  getCountry,
  hotlinesFor,
  detectCountryCode,
  type HotKind,
} from "../lib/sosCountries";

const VALID_KINDS: HotKind[] = [
  "tourist",
  "police",
  "medical",
  "fire",
  "unified",
  "embassy",
  "consular",
];

test("getCountry('TH') returns Thailand", () => {
  const c = getCountry("TH");
  assert.equal(c.code, "TH");
  assert.equal(c.lang, "th");
});

test("getCountry('ZZ') falls back to the last (global/XX) entry", () => {
  const c = getCountry("ZZ");
  const last = COUNTRIES[COUNTRIES.length - 1];
  assert.equal(c.code, last.code);
  assert.equal(c.code, "XX");
});

test("hotlinesFor('TH') includes Thai numbers AND always appends CONSULAR", () => {
  const lines = hotlinesFor("TH");
  const nums = lines.map((l) => l.num);
  for (const n of ["1155", "191", "1669", "199", "+66819145803"]) {
    assert.ok(nums.includes(n), `expected Thai hotlines to include ${n}`);
  }
  // 영사콜센터는 항상 마지막에 추가.
  const consular = lines.find((l) => l.kind === "consular");
  assert.ok(consular, "consular line must be present");
  assert.equal(consular!.num, "+82233210404");
  assert.equal(consular!.num, CONSULAR.num);
  assert.equal(lines[lines.length - 1].kind, "consular");
});

test("hotlinesFor('MM') contains only police + consular", () => {
  const lines = hotlinesFor("MM");
  assert.equal(lines.length, 2);
  const kinds = lines.map((l) => l.kind).sort();
  assert.deepEqual(kinds, ["consular", "police"]);
  const police = lines.find((l) => l.kind === "police");
  assert.equal(police!.num, "199");
});

test("every country's lines have non-empty num and a valid kind", () => {
  for (const country of COUNTRIES) {
    assert.ok(country.lines.length > 0, `${country.code} has no lines`);
    for (const line of country.lines) {
      assert.equal(typeof line.num, "string");
      assert.ok(line.num.trim().length > 0, `${country.code} has empty num`);
      assert.ok(
        VALID_KINDS.includes(line.kind),
        `${country.code} has invalid kind ${line.kind}`
      );
    }
  }
});

test("CONSULAR itself has a valid kind and non-empty num", () => {
  assert.ok(VALID_KINDS.includes(CONSULAR.kind));
  assert.ok(CONSULAR.num.trim().length > 0);
});

test("detectCountryCode() returns a known country code or 'TH'", () => {
  const code = detectCountryCode();
  assert.equal(typeof code, "string");
  assert.ok(code.length > 0);
  const known = COUNTRIES.map((c) => c.code);
  assert.ok(
    known.includes(code) || code === "TH",
    `detected code ${code} is not a known country code`
  );
});
