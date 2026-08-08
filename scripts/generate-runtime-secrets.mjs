import { randomBytes } from "node:crypto";

function secret() {
  return randomBytes(48).toString("base64url");
}

process.stdout.write(`RATE_LIMIT_SALT=${secret()}\n`);
process.stdout.write(`ADMIN_SESSION_SECRET=${secret()}\n`);
