import assert from "node:assert/strict";
import test from "node:test";

// Node's built-in type-stripping runner requires the explicit extension.
// @ts-expect-error TypeScript disallows it unless allowImportingTsExtensions is enabled globally.
import { assessTurnstileResponse, TURNSTILE_ACTION } from "./turnstile-core.ts";

const productionOptions = {
  allowedHostnames: new Set(["balixperience.com", "www.balixperience.com"]),
  expectedAction: TURNSTILE_ACTION,
};

test("accepts a successful booking challenge from an approved hostname", () => {
  assert.deepEqual(assessTurnstileResponse({ success: true, hostname: "balixperience.com", action: TURNSTILE_ACTION }, productionOptions), { success: true });
});

test("rejects failed, malformed, wrong-action, and wrong-hostname responses", () => {
  assert.deepEqual(assessTurnstileResponse({ success: false }, productionOptions), { success: false, reason: "rejected" });
  assert.deepEqual(assessTurnstileResponse(null, productionOptions), { success: false, reason: "invalid-response" });
  assert.deepEqual(assessTurnstileResponse({ success: true, hostname: "balixperience.com", action: "other" }, productionOptions), { success: false, reason: "wrong-action" });
  assert.deepEqual(assessTurnstileResponse({ success: true, hostname: "attacker.example", action: TURNSTILE_ACTION }, productionOptions), { success: false, reason: "wrong-hostname" });
});

test("allows Cloudflare test-key responses without production hostname checks", () => {
  assert.deepEqual(assessTurnstileResponse({ success: true, hostname: "localhost", action: "test" }, { allowedHostnames: new Set() }), { success: true });
});
