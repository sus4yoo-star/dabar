import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emergencyHeader,
  helpCallLine,
  COMMON_SITU,
} from "../lib/sosPhrases";

test("emergencyHeader returns the right language", () => {
  // 영어/태국어/한국어는 직접 검수된 문구라 안정적으로 비교 가능.
  assert.equal(
    emergencyHeader("en"),
    "🆘 Emergency! Please help — I urgently need help."
  );
  const th = emergencyHeader("th");
  assert.ok(th.includes("ฉุกเฉิน"), "Thai header should contain ฉุกเฉิน");
  const ko = emergencyHeader("ko");
  assert.ok(ko.includes("긴급"), "Korean header should contain 긴급");
});

test("emergencyHeader falls back to English for unknown lang", () => {
  assert.equal(
    emergencyHeader("zz"),
    emergencyHeader("en")
  );
});

test("helpCallLine('th', ['191','1669']) contains both numbers joined by ' / '", () => {
  const line = helpCallLine("th", ["191", "1669"]);
  assert.ok(line.includes("191 / 1669"), `expected '191 / 1669' in: ${line}`);
});

test("helpCallLine filters out falsy entries before joining", () => {
  const line = helpCallLine("en", ["191", "", "1669"]);
  assert.ok(line.includes("191 / 1669"), `empty entry should be dropped: ${line}`);
});

test("helpCallLine falls back to the English template for unknown lang", () => {
  const calls = ["191", "1669"];
  assert.equal(helpCallLine("zz", calls), helpCallLine("en", calls));
});

test("every COMMON_SITU entry has non-empty ko, en, tr.th and tr.lo", () => {
  assert.ok(COMMON_SITU.length > 0, "COMMON_SITU should not be empty");
  for (const [i, situ] of COMMON_SITU.entries()) {
    assert.equal(typeof situ.ko, "string");
    assert.ok(situ.ko.trim().length > 0, `entry ${i} ko empty`);
    assert.equal(typeof situ.en, "string");
    assert.ok(situ.en.trim().length > 0, `entry ${i} en empty`);
    assert.ok(situ.tr, `entry ${i} missing tr`);
    assert.equal(typeof situ.tr.th, "string", `entry ${i} tr.th missing`);
    assert.ok(situ.tr.th.trim().length > 0, `entry ${i} tr.th empty`);
    assert.equal(typeof situ.tr.lo, "string", `entry ${i} tr.lo missing`);
    assert.ok(situ.tr.lo.trim().length > 0, `entry ${i} tr.lo empty`);
  }
});
