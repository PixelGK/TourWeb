import assert from "node:assert/strict";

const baseUrl = new URL(process.env.SMOKE_BASE_URL ?? process.argv[2] ?? "https://balixperience.com");
const expectedCanonicalOrigin = process.env.SMOKE_EXPECTED_CANONICAL_ORIGIN ?? baseUrl.origin;
const publicPages = ["/", "/tours", "/tours/private-car-charter-bali", "/plan"];

async function request(path) {
  const response = await fetch(new URL(path, baseUrl), { redirect: "follow" });
  const body = await response.text();
  return { response, body };
}

for (const path of publicPages) {
  const { response, body } = await request(path);
  assert.equal(response.status, 200, `${path} returned ${response.status}`);
  assert.match(body, /BaliXperience/i, `${path} did not render the BaliXperience shell`);
}

const homepage = await request("/");
const csp = homepage.response.headers.get("content-security-policy") ?? "";
assert.match(csp, /frame-ancestors 'none'/, "CSP does not block framing");
assert.equal(homepage.response.headers.get("x-content-type-options"), "nosniff");
assert.equal(homepage.response.headers.get("x-frame-options"), "DENY");
assert.equal(homepage.response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
assert.ok(homepage.body.includes(`rel="canonical" href="${expectedCanonicalOrigin}`), "Homepage canonical is missing or incorrect");

const robots = await request("/robots.txt");
assert.equal(robots.response.status, 200);
assert.match(robots.body, /Disallow: \/admin\//);
assert.match(robots.body, /Disallow: \/api\//);
assert.match(robots.body, /Disallow: \/checkout\//);

const sitemap = await request("/sitemap.xml");
assert.equal(sitemap.response.status, 200);
assert.match(sitemap.body, /\/tours\/private-car-charter-bali/);

const missing = await request("/this-page-does-not-exist-smoke-test");
assert.equal(missing.response.status, 404);
assert.match(missing.body, /That Bali page is not here\./);

console.log(`Production smoke checks passed for ${baseUrl.origin}`);
