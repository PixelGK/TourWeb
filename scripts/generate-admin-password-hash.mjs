import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const password = process.env.ADMIN_PASSWORD;

if (!password) throw new Error("ADMIN_PASSWORD is required");
if (password.length < 14) throw new Error("Admin password must contain at least 14 characters");

const cost = 16_384;
const blockSize = 8;
const parallelization = 1;
const salt = randomBytes(16);
const derive = promisify(scrypt);
const key = await derive(password, salt, 64, {
  N: cost,
  r: blockSize,
  p: parallelization,
  maxmem: 64 * 1024 * 1024,
});

process.stdout.write(
  `scrypt$${cost}$${blockSize}$${parallelization}$${salt.toString("base64url")}$${Buffer.from(key).toString("base64url")}\n`,
);
