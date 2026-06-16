import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "../lib/rateLimit";

// 각 테스트는 고유 키를 사용해 모듈 전역 buckets 맵 오염을 피한다(결정적).

test("allows first `limit` calls, blocks the (limit+1)th", () => {
  const key = "test-block";
  const limit = 3;
  const win = 60_000;

  const r1 = rateLimit(key, limit, win);
  const r2 = rateLimit(key, limit, win);
  const r3 = rateLimit(key, limit, win);
  assert.equal(r1.ok, true);
  assert.equal(r2.ok, true);
  assert.equal(r3.ok, true);

  const r4 = rateLimit(key, limit, win);
  assert.equal(r4.ok, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.retryAfter > 0, `retryAfter should be > 0, got ${r4.retryAfter}`);
});

test("remaining decrements correctly", () => {
  const key = "test-remaining";
  const limit = 5;
  const win = 60_000;

  assert.equal(rateLimit(key, limit, win).remaining, 4);
  assert.equal(rateLimit(key, limit, win).remaining, 3);
  assert.equal(rateLimit(key, limit, win).remaining, 2);
  assert.equal(rateLimit(key, limit, win).remaining, 1);
  assert.equal(rateLimit(key, limit, win).remaining, 0);
});

test("different keys are independent", () => {
  const win = 60_000;
  const limit = 1;

  const a = rateLimit("test-indep-A", limit, win);
  const b = rateLimit("test-indep-B", limit, win);
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);

  // 동일 키 두 번째 호출은 막혀야 한다.
  assert.equal(rateLimit("test-indep-A", limit, win).ok, false);
  // 다른 키는 여전히 영향 없음.
  assert.equal(rateLimit("test-indep-C", limit, win).ok, true);
});

test("bucket resets after the window elapses", async () => {
  const key = "test-reset";
  const limit = 1;
  const win = 20; // 짧은 윈도우로 실제 시간 경과 테스트

  assert.equal(rateLimit(key, limit, win).ok, true);
  assert.equal(rateLimit(key, limit, win).ok, false);

  await new Promise((r) => setTimeout(r, 30)); // 윈도우 경과

  const after = rateLimit(key, limit, win);
  assert.equal(after.ok, true, "bucket should reset after window elapses");
  assert.equal(after.remaining, 0); // limit=1 이므로 reset 후 remaining = limit-1 = 0
});
